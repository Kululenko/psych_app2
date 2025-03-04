from rest_framework import viewsets, status, permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import ChatSession, ChatMessage, AIAssistantPrompt
from .serializers import (
    ChatSessionSerializer, ChatSessionDetailSerializer,
    ChatMessageSerializer, ChatMessageCreateSerializer,
    AIAssistantPromptSerializer
)
from .tasks import generate_ai_response


class ChatSessionViewSet(viewsets.ModelViewSet):
    """ViewSet für Chat-Sitzungen."""
    
    serializer_class = ChatSessionSerializer
    
    def get_queryset(self):
        """Gibt die Chat-Sitzungen des aktuellen Benutzers zurück."""
        return ChatSession.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Erstellt eine neue Chat-Sitzung für den aktuellen Benutzer."""
        serializer.save(user=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Gibt eine Chat-Sitzung mit allen Nachrichten zurück."""
        instance = self.get_object()
        serializer = ChatSessionDetailSerializer(instance)
        
        # Markiere alle ungelesenen Nachrichten als gelesen
        unread_messages = instance.messages.filter(is_read=False)
        unread_messages.update(is_read=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        """Sendet eine Nachricht in einer Chat-Sitzung."""
        session = self.get_object()
        serializer = ChatMessageCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Nachricht des Benutzers speichern
            message = ChatMessage.objects.create(
                session=session,
                content=serializer.validated_data['content'],
                sender='user'
            )
            
            # Chat-Sitzung aktualisieren
            session.save()  # updated_at aktualisieren
            
            # Titelaktualisierung, falls es sich um eine neue Sitzung handelt
            if session.title == "Neue Unterhaltung":
                session.update_title_from_content()
            
            # KI-Antwort generieren (Hintergrundaufgabe)
            generate_ai_response.delay(session.id, message.id)
            
            return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChatMessageListView(generics.ListAPIView):
    """View für die Anzeige von Chat-Nachrichten einer Sitzung."""
    
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        """Gibt die Nachrichten einer bestimmten Chat-Sitzung zurück."""
        session_id = self.kwargs['session_id']
        session = get_object_or_404(ChatSession, id=session_id, user=self.request.user)
        return ChatMessage.objects.filter(session=session)


class AIAssistantPromptListView(generics.ListAPIView):
    """View für die Anzeige von KI-Assistent-Prompts."""
    
    serializer_class = AIAssistantPromptSerializer
    
    def get_queryset(self):
        """Gibt die aktiven KI-Assistent-Prompts zurück."""
        category = self.request.query_params.get('category', None)
        queryset = AIAssistantPrompt.objects.filter(is_active=True)
        
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset
