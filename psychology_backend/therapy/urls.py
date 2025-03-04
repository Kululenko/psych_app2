from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExerciseViewSet, DailyPromptListView, AchievementViewSet,
    ProgressStatsView, CompletedExerciseListView
)

# Router für ViewSets
router = DefaultRouter()
router.register(r'exercises', ExerciseViewSet)
router.register(r'achievements', AchievementViewSet)

urlpatterns = [
    # Einbinden der ViewSet-URLs
    path('', include(router.urls)),
    
    # Weitere API-Endpunkte
    path('daily-prompts/', DailyPromptListView.as_view(), name='daily-prompts'),
    path('progress/', ProgressStatsView.as_view(), name='progress-stats'),
    path('completed-exercises/', CompletedExerciseListView.as_view(), name='completed-exercises'),
]