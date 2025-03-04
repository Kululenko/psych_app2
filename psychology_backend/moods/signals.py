from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import MoodEntry, MoodStats


@receiver(post_save, sender=MoodEntry)
def update_mood_stats_on_entry_creation(sender, instance, created, **kwargs):
    """
    Aktualisiert die Stimmungsstatistiken, wenn ein neuer Stimmungseintrag erstellt wird.
    """
    # Statistiken abrufen oder erstellen
    stats, _ = MoodStats.objects.get_or_create(user=instance.user)
    
    # Statistiken aktualisieren
    stats.update_stats()


@receiver(post_delete, sender=MoodEntry)
def update_mood_stats_on_entry_deletion(sender, instance, **kwargs):
    """
    Aktualisiert die Stimmungsstatistiken, wenn ein Stimmungseintrag gelöscht wird.
    """
    try:
        # Statistiken abrufen
        stats = MoodStats.objects.get(user=instance.user)
        
        # Statistiken aktualisieren
        stats.update_stats()
    except MoodStats.DoesNotExist:
        pass