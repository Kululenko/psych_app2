from django.utils import timezone
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Exercise, CompletedExercise, DailyPrompt, Achievement,
    UserAchievement, ProgressStats, WeeklyActivity
)
from .serializers import (
    ExerciseSerializer, CompletedExerciseSerializer, DailyPromptSerializer,
    AchievementSerializer, ProgressStatsSerializer
)
from .filters import ExerciseFilter, AchievementFilter
from .tasks import check_achievements


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Therapieübungen."""
    
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ExerciseFilter
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Markiert eine Übung als abgeschlossen.
        """
        exercise = self.get_object()
        user = request.user
        today = timezone.now().date()
        
        # Überprüfen, ob die Übung heute bereits abgeschlossen wurde
        if CompletedExercise.objects.filter(user=user, exercise=exercise, completed_at__date=today).exists():
            return Response(
                {"detail": "Du hast diese Übung heute bereits abgeschlossen"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Übung als abgeschlossen markieren
        completed_exercise = CompletedExercise.objects.create(
            user=user,
            exercise=exercise,
            notes=request.data.get('notes', '')
        )
        
        # Punkte zum Benutzerkonto hinzufügen
        new_level = user.add_points(exercise.points)
        
        # Fortschrittsstatistiken aktualisieren
        progress_stats, created = ProgressStats.objects.get_or_create(user=user)
        progress_stats.total_exercises_completed += 1
        
        # Serie aktualisieren
        if progress_stats.last_activity_date:
            yesterday = today - timezone.timedelta(days=1)
            if progress_stats.last_activity_date >= yesterday:
                progress_stats.current_streak += 1
            else:
                progress_stats.current_streak = 1
        else:
            progress_stats.current_streak = 1
        
        # Längste Serie aktualisieren
        if progress_stats.current_streak > progress_stats.longest_streak:
            progress_stats.longest_streak = progress_stats.current_streak
        
        progress_stats.last_activity_date = today
        progress_stats.save()
        
        # Wöchentliche Aktivität aktualisieren
        weekly_activity, created = WeeklyActivity.objects.get_or_create(
            user=user,
            date=today,
            defaults={'count': 1}
        )
        if not created:
            weekly_activity.count += 1
            weekly_activity.save()
        
        # Achievements überprüfen (als Hintergrundaufgabe)
        check_achievements.delay(user.id)
        
        # Erfolgreiche Antwort senden
        return Response({
            "detail": "Übung erfolgreich abgeschlossen",
            "points_earned": exercise.points,
            "new_level": new_level if new_level > user.level - 1 else None,
            "completion": CompletedExerciseSerializer(completed_exercise).data
        })


class DailyPromptListView(generics.ListAPIView):
    """View für die Anzeige täglicher Prompts."""
    
    serializer_class = DailyPromptSerializer
    
    def get_queryset(self):
        """
        Gibt den neuesten täglichen Prompt zurück.
        """
        today = timezone.now().date()
        return DailyPrompt.objects.filter(date__lte=today).order_by('-date')[:1]


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Achievements."""
    
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = AchievementFilter


class ProgressStatsView(generics.RetrieveAPIView):
    """View für Fortschrittsstatistiken."""
    
    serializer_class = ProgressStatsSerializer
    
    def get_object(self):
        """
        Gibt die Fortschrittsstatistiken des aktuellen Benutzers zurück.
        """
        user = self.request.user
        progress_stats, created = ProgressStats.objects.get_or_create(user=user)
        return progress_stats


class CompletedExerciseListView(generics.ListAPIView):
    """View für die Anzeige abgeschlossener Übungen."""
    
    serializer_class = CompletedExerciseSerializer
    
    def get_queryset(self):
        """
        Gibt die abgeschlossenen Übungen des aktuellen Benutzers zurück.
        """
        user = self.request.user
        return CompletedExercise.objects.filter(user=user).order_by('-completed_at')