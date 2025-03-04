from rest_framework import serializers
from .models import ChatSession, ChatMessage, AIAssistantPrompt


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer für Chat-Nachrichten."""
    
    class Meta:
        model = ChatMessage
        fields = ('id', 'content', 'sender', 'timestamp', 'is_read', 'metadata')
        read_only_fields = ('timestamp', 'is_read')


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer für Chat-Sitzungen mit der letzten Nachricht."""
    
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = ('id', 'title', 'created_at', 'updated_at', 'last_message', 'unread_count')
        read_only_fields = ('created_at', 'updated_at')
    
    def get_last_message(self, obj):
        """Gibt die letzte Nachricht der Sitzung zurück."""
        last_message = obj.get_last_message()
        if last_message:
            return ChatMessageSerializer(last_message).data
        return None
    
    def get_unread_count(self, obj):
        """Gibt die Anzahl der ungelesenen Nachrichten zurück."""
        return obj.messages.filter(is_read=False, sender='assistant').count()


class ChatSessionDetailSerializer(serializers.ModelSerializer):
    """Serializer für Chat-Sitzungen mit allen Nachrichten."""
    
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatSession
        fields = ('id', 'title', 'created_at', 'updated_at', 'messages')
        read_only_fields = ('created_at', 'updated_at', 'messages')


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer zum Erstellen von Chat-Nachrichten."""
    
    class Meta:
        model = ChatMessage
        fields = ('content',)


class AIAssistantPromptSerializer(serializers.ModelSerializer):
    """Serializer für KI-Assistent-Prompts."""
    
    class Meta:
        model = AIAssistantPrompt
        fields = ('id', 'title', 'prompt', 'category')