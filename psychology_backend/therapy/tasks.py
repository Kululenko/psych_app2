from psychology_project.celery import app
from django.utils import timezone
from django.db.models import Count
from django.contrib.auth import get_user_model
from .models import (
    Achievement, UserAchievement, CompletedExercise,
    DailyPrompt, ProgressStats
)
from users.tasks import send_streak_reminder_email, send_level_up_notification

User = get_user_model()


@app.task
def check_achievements(user_id):
    """
    Überprüft, ob der Benutzer neue Achievements freigeschaltet hat.
    """
    user = User.objects.get(id=user_id)
    
    # Meditation-Achievements überprüfen
    meditation_count = CompletedExercise.objects.filter(
        user=user, 
        exercise__type='meditation'
    ).count()
    
    check_category_achievements(user, 'meditation', meditation_count)
    
    # Journaling-Achievements überprüfen
    journaling_count = CompletedExercise.objects.filter(
        user=user, 
        exercise__type='journaling'
    ).count()
    
    check_category_achievements(user, 'journaling', journaling_count)
    
    # Streak-Achievements überprüfen
    try:
        progress_stats = ProgressStats.objects.get(user=user)
        streak_days = progress_stats.current_streak
        check_category_achievements(user, 'streak', streak_days)
    except ProgressStats.DoesNotExist:
        pass
    
    # Milestone-Achievements überprüfen
    total_exercises = CompletedExercise.objects.filter(user=user).count()
    check_category_achievements(user, 'milestones', total_exercises)
    
    # Level-Achievements überprüfen (falls vorhanden)
    check_category_achievements(user, 'level', user.level)


def check_category_achievements(user, category, current_value):
    """
    Überprüft Achievements einer bestimmten Kategorie.
    """
    achievements = Achievement.objects.filter(category=category)
    
    for achievement in achievements:
        # UserAchievement erstellen oder aktualisieren
        user_achievement, created = UserAchievement.objects.get_or_create(
            user=user,
            achievement=achievement,
            defaults={'current_value': current_value}
        )
        
        if not created:
            user_achievement.current_value = current_value
            user_achievement.save()
        
        # Überprüfen, ob das Achievement freigeschaltet wurde
        if (current_value >= achievement.required_value and 
                user_achievement.current_value >= achievement.required_value):
            # Punkte vergeben, falls das Achievement gerade freigeschaltet wurde
            if not hasattr(user_achievement, 'unlocked_at') or user_achievement.unlocked_at is None:
                user_achievement.unlocked_at = timezone.now()
                user_achievement.save()
                
                # Punkte vergeben
                new_level = user.add_points(achievement.points)
                
                # Bei Levelaufstieg eine Benachrichtigung senden
                if new_level > user.level - 1:
                    send_level_up_notification.delay(
                        user.email, 
                        user.get_short_name(), 
                        new_level
                    )


@app.task
def generate_daily_prompts():
    """
    Generiert neue tägliche Prompts, falls für heute noch keiner existiert.
    """
    today = timezone.now().date()
    
    # Überprüfen, ob für heute bereits ein Prompt existiert
    if DailyPrompt.objects.filter(date=today).exists():
        return
    
    # Liste von möglichen Prompts nach Typ
    prompts = {
        'reflection': [
            "Welche Situation hat dich heute emotional am stärksten bewegt? Warum?",
            "Was hast du heute gelernt, das dir in Zukunft helfen könnte?",
            "Welche Gedanken haben dich heute am meisten beschäftigt?",
            "Wie hast du heute auf Stress reagiert? Was könntest du anders machen?",
            "Welche Entscheidung hast du heute getroffen, die du überdenken solltest?",
        ],
        'gratitude': [
            "Nenne drei Dinge, für die du heute dankbar bist und warum.",
            "Welcher Mensch hat dein Leben positiv beeinflusst? Wofür bist du ihm dankbar?",
            "Welche kleine Freude hast du heute erlebt, die du normalerweise übersiehst?",
            "Wofür bist du dir selbst dankbar? Welche deiner Eigenschaften schätzt du?",
            "Welche Herausforderung hat dich dankbar gemacht für das, was du hast?",
        ],
        'challenge': [
            "Versuche heute, eine neue Entspannungstechnik auszuprobieren.",
            "Sprich heute jemanden an, mit dem du normalerweise nicht sprichst.",
            "Nimm dir heute 10 Minuten Zeit für eine Achtsamkeitsübung.",
            "Schreibe einen Brief an dein zukünftiges Ich. Was würdest du dir raten?",
            "Verzichte heute auf soziale Medien. Wie fühlst du dich dabei?",
        ],
        'mindfulness': [
            "Achte heute bewusst auf deinen Atem. Wie verändert er sich im Laufe des Tages?",
            "Nimm dir beim Essen Zeit, jeden Bissen bewusst zu schmecken und zu genießen.",
            "Wähle einen alltäglichen Gegenstand und betrachte ihn mit allen Sinnen.",
            "Beobachte deine Gedanken wie Wolken am Himmel, ohne sie zu bewerten.",
            "Nimm dir einen Moment Zeit, um deine aktuelle Körperhaltung wahrzunehmen.",
        ],
    }
    
    # Einfache Rotation durch die Prompt-Typen (echte Anwendung würde hier komplexer sein)
    last_prompt = DailyPrompt.objects.order_by('-date').first()
    
    if last_prompt:
        # Nächsten Typ wählen (rotierend)
        types = list(prompts.keys())
        current_index = types.index(last_prompt.type)
        next_index = (current_index + 1) % len(types)
        prompt_type = types[next_index]
    else:
        # Falls noch kein Prompt existiert, mit Reflexion beginnen
        prompt_type = 'reflection'
    
    # Anzahl der bereits verwendeten Prompts dieses Typs zählen
    used_count = DailyPrompt.objects.filter(type=prompt_type).count()
    prompt_index = used_count % len(prompts[prompt_type])
    
    # Neuen Prompt erstellen
    DailyPrompt.objects.create(
        content=prompts[prompt_type][prompt_index],
        type=prompt_type,
        date=today
    )


@app.task
def send_streak_reminders():
    """
    Sendet Erinnerungen an Benutzer mit aktiven Serien, die heute noch keine Übung abgeschlossen haben.
    """
    today = timezone.now().date()
    
    # Benutzer mit aktiven Serien finden
    users_with_streaks = ProgressStats.objects.filter(current_streak__gt=1).select_related('user')
    
    for stats in users_with_streaks:
        # Überprüfen, ob der Benutzer heute bereits eine Übung abgeschlossen hat
        has_completed_today = CompletedExercise.objects.filter(
            user=stats.user,
            completed_at__date=today
        ).exists()
        
        # Wenn nicht, eine Erinnerung senden
        if not has_completed_today:
            send_streak_reminder_email.delay(
                stats.user.email,
                stats.user.get_short_name(),
                stats.current_streak
            )


@app.task
def update_streaks():
    """
    Aktualisiert die Serien aller Benutzer (täglich auszuführen).
    """
    yesterday = timezone.now().date() - timezone.timedelta(days=1)
    
    # Alle Benutzer mit aktiven Serien abrufen
    stats_list = ProgressStats.objects.filter(current_streak__gt=0)
    
    for stats in stats_list:
        # Überprüfen, ob der Benutzer gestern eine Übung abgeschlossen hat
        completed_yesterday = CompletedExercise.objects.filter(
            user=stats.user,
            completed_at__date=yesterday
        ).exists()
        
        # Wenn nicht, die Serie zurücksetzen
        if not completed_yesterday and stats.last_activity_date != yesterday:
            stats.current_streak = 0
            stats.save()