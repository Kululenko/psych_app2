from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MoodEntryViewSet, TodayMoodView, MoodHistoryView, MoodStatsView

# Router für ViewSets
router = DefaultRouter()
router.register(r'entries', MoodEntryViewSet, basename='mood-entry')

urlpatterns = [
    # Einbinden der ViewSet-URLs
    path('', include(router.urls)),
    
    # Weitere API-Endpunkte
    path('today/', TodayMoodView.as_view(), name='mood-today'),
    path('history/', MoodHistoryView.as_view(), name='mood-history'),
    path('stats/', MoodStatsView.as_view(), name='mood-stats'),
]