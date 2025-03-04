from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class MoodEntry(models.Model):
    """Modell für Stimmungseinträge."""
    
    MOOD_CHOICES = (
        ('verygood', _('Sehr gut')),
        ('good', _('Gut')),
        ('neutral', _('Neutral')),
        ('bad', _('Schlecht')),
        ('verybad', _('Sehr schlecht')),
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mood_entries')
    mood = models.CharField(_('Stimmung'), max_length=10, choices=MOOD_CHOICES)
    notes = models.TextField(_('Notizen'), blank=True)
    date = models.DateField(_('Datum'), default=timezone.now)
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Stimmungseintrag')
        verbose_name_plural = _('Stimmungseinträge')
        ordering = ['-date', '-created_at']
        # Ein Benutzer kann nur einen Stimmungseintrag pro Tag haben
        unique_together = [['user', 'date']]
    
    def __str__(self):
        return f"{self.user.username} - {self.get_mood_display()} - {self.date}"
    
    @property
    def mood_numeric(self):
        """Gibt einen numerischen Wert für die Stimmung zurück (1-5)."""
        mood_values = {
            'verybad': 1,
            'bad': 2,
            'neutral': 3,
            'good': 4,
            'verygood': 5
        }
        return mood_values.get(self.mood, 3)


class MoodFactor(models.Model):
    """Modell für Faktoren, die die Stimmung beeinflussen."""
    
    entry = models.ForeignKey(MoodEntry, on_delete=models.CASCADE, related_name='factors')
    name = models.CharField(_('Name'), max_length=100)
    
    class Meta:
        verbose_name = _('Stimmungsfaktor')
        verbose_name_plural = _('Stimmungsfaktoren')
        unique_together = [['entry', 'name']]
    
    def __str__(self):
        return f"{self.entry} - {self.name}"


class MoodStats(models.Model):
    """Modell für aggregierte Stimmungsstatistiken eines Benutzers."""
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mood_stats')
    average_mood = models.FloatField(_('Durchschnittliche Stimmung'), default=3.0)
    streak_days = models.PositiveIntegerField(_('Tage in Folge mit Tracking'), default=0)
    last_entry_date = models.DateField(_('Datum des letzten Eintrags'), null=True, blank=True)
    updated_at = models.DateTimeField(_('Aktualisiert am'), auto_now=True)
    
    class Meta:
        verbose_name = _('Stimmungsstatistik')
        verbose_name_plural = _('Stimmungsstatistiken')
    
    def __str__(self):
        return f"Stimmungsstatistik für {self.user.username}"
    
    def update_stats(self):
        """Aktualisiert die Stimmungsstatistiken basierend auf den Einträgen des Benutzers."""
        # Durchschnittliche Stimmung berechnen
        entries = MoodEntry.objects.filter(user=self.user)
        if entries.exists():
            mood_values = [entry.mood_numeric for entry in entries]
            self.average_mood = sum(mood_values) / len(mood_values)
        
        # Streak berechnen
        if self.last_entry_date:
            today = timezone.now().date()
            yesterday = today - timezone.timedelta(days=1)
            
            if self.last_entry_date >= yesterday:
                # Überprüfen, ob es einen Eintrag für heute gibt
                today_entry = MoodEntry.objects.filter(user=self.user, date=today).exists()
                if today_entry:
                    self.streak_days += 1
                    self.last_entry_date = today
            else:
                # Streak zurücksetzen, wenn kein Eintrag für gestern existiert
                self.streak_days = 1
                self.last_entry_date = today
        else:
            # Erster Eintrag
            self.streak_days = 1
            self.last_entry_date = timezone.now().date()
        
        self.save()