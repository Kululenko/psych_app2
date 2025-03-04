from rest_framework import serializers
from django.utils import timezone
from .models import (
    Exercise, CompletedExercise, DailyPrompt, Achievement,
    UserAchievement, ProgressStats, WeeklyActivity
)


class ExerciseSerializer(serializers.ModelSerializer):
    """Serializer für Therapieübungen."""
    
    completedAt = serializers.SerializerMethodField()
    
    class Meta:
        model = Exercise
        fields = ('id', 'title', 'description', 'type', 'duration_minutes', 'points', 'content', 'completedAt')
    
    def get_completedAt(self, obj):
        """
        Überprüft, ob der aktuelle Benutzer die Übung heute abgeschlossen hat.
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            today = timezone.now().date()
            completion = CompletedExercise.objects.filter(
                user=request.user,
                exercise=obj,
                completed_at__date=today
            ).first()
            if completion:
                return completion.completed_at.isoformat()
        return None


class CompletedExerciseSerializer(serializers.ModelSerializer):
    """Serializer für abgeschlossene Übungen."""
    
    exercise_title = serializers.ReadOnlyField(source='exercise.title')
    exercise_type = serializers.ReadOnlyField(source='exercise.type')
    
    class Meta:
        model = CompletedExercise
        fields = ('id', 'exercise', 'exercise_title', 'exercise_type', 'completed_at', 'notes')
        read_only_fields = ('completed_at',)


class DailyPromptSerializer(serializers.ModelSerializer):
    """Serializer für tägliche Prompts."""
    
    class Meta:
        model = DailyPrompt
        fields = ('id', 'content', 'type', 'date')


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer für Achievements."""
    
    progress = serializers.SerializerMethodField()
    unlocked_at = serializers.SerializerMethodField()
    current_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = ('id', 'title', 'description', 'icon', 'category', 'required_value', 
                  'points', 'progress', 'unlocked_at', 'current_value')
    
    def get_progress(self, obj):
        """
        Berechnet den Fortschritt des Benutzers für dieses Achievement.
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            try:
                user_achievement = UserAchievement.objects.get(user=request.user, achievement=obj)
                return min(100, int((user_achievement.current_value / obj.required_value) * 100))
            except UserAchievement.DoesNotExist:
                return 0
        return 0
    
    def get_unlocked_at(self, obj):
        """
        Gibt das Datum zurück, an dem der Benutzer das Achievement freigeschaltet hat.
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            try:
                user_achievement = UserAchievement.objects.get(user=request.user, achievement=obj)
                if user_achievement.current_value >= obj.required_value:
                    return user_achievement.unlocked_at.isoformat()
            except UserAchievement.DoesNotExist:
                pass
        return None
    
    def get_current_value(self, obj):
        """
        Gibt den aktuellen Wert des Benutzers für dieses Achievement zurück.
        """
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            try:
                user_achievement = UserAchievement.objects.get(user=request.user, achievement=obj)
                return user_achievement.current_value
            except UserAchievement.DoesNotExist:
                return 0
        return 0


class WeeklyActivitySerializer(serializers.ModelSerializer):
    """Serializer für die wöchentliche Aktivität."""
    
    class Meta:
        model = WeeklyActivity
        fields = ('date', 'count')


class ProgressStatsSerializer(serializers.ModelSerializer):
    """Serializer für Fortschrittsstatistiken."""
    
    weekly_activity = serializers.SerializerMethodField()
    next_level_points = serializers.SerializerMethodField()
    
    class Meta:
        model = ProgressStats
        fields = ('total_exercises_completed', 'current_streak', 'longest_streak', 
                  'weekly_activity', 'next_level_points')
    
    def get_weekly_activity(self, obj):
        """
        Gibt die wöchentliche Aktivität des Benutzers zurück.
        """
        # Letzte 7 Tage abrufen
        end_date = timezone.now().date()
        start_date = end_date - timezone.timedelta(days=6)
        
        activities = WeeklyActivity.objects.filter(
            user=obj.user, 
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')
        
        return WeeklyActivitySerializer(activities, many=True).data
    
    def get_next_level_points(self, obj):
        """
        Gibt die Punkte zurück, die für das nächste Level benötigt werden.
        """
        return obj.user.next_level_points