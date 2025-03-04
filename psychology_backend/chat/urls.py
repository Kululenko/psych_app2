from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatSessionViewSet, ChatMessageListView, AIAssistantPromptListView

# Router für ViewSets
router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet, basename='chat-session')

urlpatterns = [
    # Einbinden der ViewSet-URLs
    path('', include(router.urls)),
    
    # Weitere API-Endpunkte
    path('sessions/<int:session_id>/messages/', ChatMessageListView.as_view(), name='chat-messages'),
    path('ai-prompts/', AIAssistantPromptListView.as_view(), name='ai-prompts'),
]