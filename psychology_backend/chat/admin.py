from django.contrib import admin
from .models import ChatSession, ChatMessage, AIAssistantPrompt


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das ChatSession-Modell."""
    
    list_display = ('title', 'user', 'created_at', 'updated_at', 'is_active')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('title', 'user__username', 'user__email')
    ordering = ('-updated_at',)
    date_hierarchy = 'created_at'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das ChatMessage-Modell."""
    
    list_display = ('session', 'sender', 'short_content', 'timestamp', 'is_read')
    list_filter = ('sender', 'is_read', 'timestamp')
    search_fields = ('content', 'session__title', 'session__user__username')
    ordering = ('-timestamp',)
    date_hierarchy = 'timestamp'
    
    def short_content(self, obj):
        """Gibt einen gekürzten Inhalt der Nachricht zurück."""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Inhalt'


@admin.register(AIAssistantPrompt)
class AIAssistantPromptAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das AIAssistantPrompt-Modell."""
    
    list_display = ('title', 'category', 'is_active', 'created_at', 'updated_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('title', 'prompt')
    ordering = ('category', 'title')
