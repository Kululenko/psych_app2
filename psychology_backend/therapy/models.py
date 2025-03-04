from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator


class Exercise(models.Model):
    """Modell für Therapieübungen."""
    
    TYPE_CHOICES = (
        ('meditation', _('Meditation')),
        ('journaling', _('Journaling')),
        ('breathwork', _('Atemübung')),
        ('cognitive', _('Kognitive Übung')),
        ('behavioral', _('Verhaltensübung')),
    )
    
    title = models.CharField(_('Titel'), max_length=100)
    description = models.TextField(_('Beschreibung'))
    type = models.CharField(_('Typ'), max_length=20, choices=TYPE_CHOICES)
    duration_minutes = models.PositiveIntegerField(_('Dauer (Minuten)'), default=10)
    points = models.PositiveIntegerField(_('Punkte'), default=10)
    content = models.TextField(_('Inhalt'), help_text=_('Detaillierter Inhalt oder Anleitung der Übung'))
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Aktualisiert am'), auto_now=True)
    
    class Meta:
        verbose_name = _('Übung')
        verbose_name_plural = _('Übungen')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class CompletedExercise(models.Model):
    """Modell für abgeschlossene Übungen eines Benutzers."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='completed_exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='completions')
    completed_at = models.DateTimeField(_('Abgeschlossen am'), auto_now_add=True)
    notes = models.TextField(_('Notizen'), blank=True)
    
    class Meta:
        verbose_name = _('Abgeschlossene Übung')
        verbose_name_plural = _('Abgeschlossene Übungen')
        ordering = ['-completed_at']
        # Ein Benutzer kann eine Übung mehrmals abschließen, aber nicht mehrmals am selben Tag
        unique_together = [['user', 'exercise', 'completed_at']]
    
    def __str__(self):
        return f"{self.user.username} - {self.exercise.title} - {self.completed_at.strftime('%Y-%m-%d')}"


class DailyPrompt(models.Model):
    """Modell für tägliche Prompts."""
    
    TYPE_CHOICES = (
        ('reflection', _('Reflexion')),
        ('gratitude', _('Dankbarkeit')),
        ('challenge', _('Herausforderung')),
        ('mindfulness', _('Achtsamkeit')),
    )
    
    content = models.TextField(_('Inhalt'))
    type = models.CharField(_('Typ'), max_length=20, choices=TYPE_CHOICES)
    date = models.DateField(_('Datum'), unique=True)
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Täglicher Prompt')
        verbose_name_plural = _('Tägliche Prompts')
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.type} - {self.date.strftime('%Y-%m-%d')}"


class Achievement(models.Model):
    """Modell für Achievements (Erfolge)."""
    
    CATEGORY_CHOICES = (
        ('meditation', _('Meditation')),
        ('journaling', _('Journaling')),
        ('streak', _('Serie')),
        ('milestones', _('Meilensteine')),
        ('social', _('Sozial')),
    )
    
    title = models.CharField(_('Titel'), max_length=100)
    description = models.TextField(_('Beschreibung'))
    icon = models.CharField(_('Icon'), max_length=50, help_text=_('Emoji oder Icon-Name'))
    category = models.CharField(_('Kategorie'), max_length=20, choices=CATEGORY_CHOICES)
    required_value = models.PositiveIntegerField(_('Benötigter Wert'), help_text=_('Z.B. Anzahl der Übungen oder Tage'))
    points = models.PositiveIntegerField(_('Belohnungspunkte'), default=50)
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Achievement')
        verbose_name_plural = _('Achievements')
        ordering = ['category', 'required_value']
    
    def __str__(self):
        return self.title


class UserAchievement(models.Model):
    """Modell für die Achievements, die ein Benutzer freigeschaltet hat."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='users')
    unlocked_at = models.DateTimeField(_('Freigeschaltet am'), auto_now_add=True)
    current_value = models.PositiveIntegerField(_('Aktueller Wert'), default=0)
    
    class Meta:
        verbose_name = _('Benutzer-Achievement')
        verbose_name_plural = _('Benutzer-Achievements')
        ordering = ['-unlocked_at']
        unique_together = [['user', 'achievement']]
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.title}"


class ProgressStats(models.Model):
    """Modell für Fortschrittsstatistiken eines Benutzers."""
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress_stats')
    total_exercises_completed = models.PositiveIntegerField(_('Insgesamt abgeschlossene Übungen'), default=0)
    current_streak = models.PositiveIntegerField(_('Aktuelle Serie'), default=0)
    longest_streak = models.PositiveIntegerField(_('Längste Serie'), default=0)
    last_activity_date = models.DateField(_('Letztes Aktivitätsdatum'), null=True, blank=True)
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Aktualisiert am'), auto_now=True)
    
    class Meta:
        verbose_name = _('Fortschrittsstatistik')
        verbose_name_plural = _('Fortschrittsstatistiken')
    
    def __str__(self):
        return f"Stats für {self.user.username}"


class WeeklyActivity(models.Model):
    """Modell für die wöchentliche Aktivität eines Benutzers."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='weekly_activities')
    date = models.DateField(_('Datum'))
    count = models.PositiveIntegerField(_('Anzahl der Aktivitäten'), default=0)
    
    class Meta:
        verbose_name = _('Wöchentliche Aktivität')
        verbose_name_plural = _('Wöchentliche Aktivitäten')
        ordering = ['-date']
        unique_together = [['user', 'date']]
    
    def __str__(self):
        return f"{self.user.username} - {self.date.strftime('%Y-%m-%d')} - {self.count} Aktivitäten"