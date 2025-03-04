from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BreathingTechniqueViewSet, BreathingSessionViewSet, UserBreathingHistoryView

# Router für ViewSets
router = DefaultRouter()
router.register(r'techniques', BreathingTechniqueViewSet)
router.register(r'sessions', BreathingSessionViewSet, basename='breathing-session')

urlpatterns = [
    # Einbinden der ViewSet-URLs
    path('', include(router.urls)),
    
    # Weitere API-Endpunkte
    path('history/', UserBreathingHistoryView.as_view(), name='breathing-history'),
]