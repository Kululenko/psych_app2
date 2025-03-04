from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class BreathingTechnique(models.Model):
    """Modell für Atemtechniken."""
    
    DIFFICULTY_CHOICES = (
        ('beginner', _('Anfänger')),
        ('intermediate', _('Fortgeschritten')),
        ('advanced', _('Profi')),
    )
    
    name = models.CharField(_('Name'), max_length=100)
    description = models.TextField(_('Beschreibung'))
    inhale_time = models.PositiveSmallIntegerField(_('Einatmen (Sekunden)'))
    hold_in_time = models.PositiveSmallIntegerField(_('Halten (Sekunden)'), default=0)
    exhale_time = models.PositiveSmallIntegerField(_('Ausatmen (Sekunden)'))
    hold_out_time = models.PositiveSmallIntegerField(_('Pause (Sekunden)'), default=0)
    cycles = models.PositiveSmallIntegerField(_('Vorgeschlagene Zyklen'), default=5)
    duration = models.PositiveSmallIntegerField(_('Geschätzte Dauer (Minuten)'))
    difficulty_level = models.CharField(_('Schwierigkeitsgrad'), max_length=20, choices=DIFFICULTY_CHOICES)
    benefits = models.TextField(_('Vorteile'))
    is_active = models.BooleanField(_('Aktiv'), default=True)
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Aktualisiert am'), auto_now=True)
    
    class Meta:
        verbose_name = _('Atemtechnik')
        verbose_name_plural = _('Atemtechniken')
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def cycle_duration(self):
        """Gibt die Dauer eines Zyklus in Sekunden zurück."""
        return self.inhale_time + self.hold_in_time + self.exhale_time + self.hold_out_time
    
    @property
    def total_duration(self):
        """Gibt die Gesamtdauer in Sekunden zurück."""
        return self.cycle_duration * self.cycles


class BreathingSession(models.Model):
    """Modell für Atemsitzungen."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='breathing_sessions')
    technique = models.ForeignKey(BreathingTechnique, on_delete=models.CASCADE, related_name='sessions')
    completed_cycles = models.PositiveSmallIntegerField(_('Abgeschlossene Zyklen'))
    duration_seconds = models.PositiveIntegerField(_('Dauer (Sekunden)'))
    completed_at = models.DateTimeField(_('Abgeschlossen am'), default=timezone.now)
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Atemsitzung')
        verbose_name_plural = _('Atemsitzungen')
        ordering = ['-completed_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.technique.name} - {self.completed_at.strftime('%Y-%m-%d %H:%M')}"


class RecommendedTechnique(models.Model):
    """Modell für empfohlene Atemtechniken für bestimmte Zustände."""
    
    technique = models.ForeignKey(BreathingTechnique, on_delete=models.CASCADE, related_name='recommendations')
    condition = models.CharField(_('Zustand'), max_length=100)
    priority = models.PositiveSmallIntegerField(_('Priorität'), default=1)
    
    class Meta:
        verbose_name = _('Empfohlene Technik')
        verbose_name_plural = _('Empfohlene Techniken')
        ordering = ['condition', 'priority']
        unique_together = [['technique', 'condition']]
    
    def __str__(self):
        return f"{self.condition} - {self.technique.name} (Priorität: {self.priority})"