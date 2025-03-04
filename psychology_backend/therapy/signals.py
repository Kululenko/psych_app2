from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import CompletedExercise, WeeklyActivity, UserAchievement
from .tasks import check_achievements


@receiver(post_save, sender=CompletedExercise)
def update_weekly_activity(sender, instance, created, **kwargs):
    """
    Aktualisiert die wöchentliche Aktivität, wenn eine Übung abgeschlossen wurde.
    """
    if created:
        date = instance.completed_at.date()
        user = instance.user
        
        # Wöchentliche Aktivität aktualisieren oder erstellen
        activity, created = WeeklyActivity.objects.get_or_create(
            user=user,
            date=date,
            defaults={'count': 1}
        )
        
        if not created:
            activity.count += 1
            activity.save()


@receiver(post_save, sender=UserAchievement)
def send_achievement_notification(sender, instance, created, **kwargs):
    """
    Sendet eine Benachrichtigung, wenn ein Achievement freigeschaltet wurde.
    """
    # Übermittlung einer Benachrichtigung könnte hier an einen Echtzeit-Dienst erfolgen
    # z.B. über WebSockets oder Push-Benachrichtigungen
    
    # Hier würde die Implementierung für Benachrichtigungen sein
    pass


@receiver(post_save, sender=CompletedExercise)
def trigger_achievement_check(sender, instance, created, **kwargs):
    """
    Löst die Überprüfung von Achievements aus, wenn eine Übung abgeschlossen wurde.
    """
    if created:
        # Achievement-Überprüfung als Hintergrundaufgabe starten
        check_achievements.delay(instance.user.id)