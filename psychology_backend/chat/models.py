from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class ChatSession(models.Model):
    """Modell für Chat-Sitzungen."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(_('Titel'), max_length=100)
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Aktualisiert am'), auto_now=True)
    is_active = models.BooleanField(_('Aktiv'), default=True)
    
    class Meta:
        verbose_name = _('Chat-Sitzung')
        verbose_name_plural = _('Chat-Sitzungen')
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def get_last_message(self):
        """Gibt die letzte Nachricht dieser Sitzung zurück."""
        return self.messages.order_by('-timestamp').first()
    
    def update_title_from_content(self):
        """Aktualisiert den Titel basierend auf dem Inhalt der ersten Nachricht."""
        first_message = self.messages.order_by('timestamp').first()
        if first_message and self.title == "Neue Unterhaltung":
            # Titel aus dem Inhalt der ersten Nachricht extrahieren
            content = first_message.content
            # Titel auf die ersten 50 Zeichen begrenzen
            new_title = content[:50] + ('...' if len(content) > 50 else '')
            self.title = new_title
            self.save(update_fields=['title'])


class ChatMessage(models.Model):
    """Modell für Chat-Nachrichten."""
    
    SENDER_CHOICES = (
        ('user', _('Benutzer')),
        ('assistant', _('Assistent')),
    )
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField(_('Inhalt'))
    sender = models.CharField(_('Absender'), max_length=10, choices=SENDER_CHOICES)
    timestamp = models.DateTimeField(_('Zeitstempel'), default=timezone.now)
    is_read = models.BooleanField(_('Gelesen'), default=False)
    metadata = models.JSONField(_('Metadaten'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Chat-Nachricht')
        verbose_name_plural = _('Chat-Nachrichten')
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class AIAssistantPrompt(models.Model):
    """Modell für vordefinierte Prompts für den KI-Assistenten."""
    
    CATEGORY_CHOICES = (
        ('general', _('Allgemein')),
        ('therapy', _('Therapie')),
        ('mental_health', _('Psychische Gesundheit')),
        ('motivation', _('Motivation')),
        ('meditation', _('Meditation')),
    )
    
    title = models.CharField(_('Titel'), max_length=100)
    prompt = models.TextField(_('Prompt'))
    category = models.CharField(_('Kategorie'), max_length=20, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(_('Aktiv'), default=True)
    created_at = models.DateTimeField(_('Erstellt am'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Aktualisiert am'), auto_now=True)
    
    class Meta:
        verbose_name = _('KI-Assistent-Prompt')
        verbose_name_plural = _('KI-Assistent-Prompts')
        ordering = ['category', 'title']
    
    def __str__(self):
        return f"{self.title} ({self.category})"
