from django.contrib import admin
from .models import (
    Exercise, CompletedExercise, DailyPrompt, Achievement,
    UserAchievement, ProgressStats, WeeklyActivity
)


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das Exercise-Modell."""
    
    list_display = ('title', 'type', 'duration_minutes', 'points', 'created_at')
    list_filter = ('type', 'duration_minutes', 'created_at')
    search_fields = ('title', 'description', 'content')
    ordering = ('-created_at',)


@admin.register(CompletedExercise)
class CompletedExerciseAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das CompletedExercise-Modell."""
    
    list_display = ('user', 'exercise', 'completed_at')
    list_filter = ('user', 'exercise', 'completed_at')
    search_fields = ('user__username', 'exercise__title', 'notes')
    ordering = ('-completed_at',)
    date_hierarchy = 'completed_at'


@admin.register(DailyPrompt)
class DailyPromptAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das DailyPrompt-Modell."""
    
    list_display = ('type', 'date', 'content')
    list_filter = ('type', 'date')
    search_fields = ('content',)
    ordering = ('-date',)
    date_hierarchy = 'date'


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das Achievement-Modell."""
    
    list_display = ('title', 'category', 'required_value', 'points')
    list_filter = ('category', 'points')
    search_fields = ('title', 'description')
    ordering = ('category', 'required_value')


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das UserAchievement-Modell."""
    
    list_display = ('user', 'achievement', 'current_value', 'unlocked_at')
    list_filter = ('achievement__category', 'unlocked_at')
    search_fields = ('user__username', 'achievement__title')
    ordering = ('-unlocked_at',)
    date_hierarchy = 'unlocked_at'


@admin.register(ProgressStats)
class ProgressStatsAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das ProgressStats-Modell."""
    
    list_display = ('user', 'total_exercises_completed', 'current_streak', 'longest_streak', 'last_activity_date')
    list_filter = ('current_streak', 'longest_streak', 'last_activity_date')
    search_fields = ('user__username',)
    ordering = ('-last_activity_date',)


@admin.register(WeeklyActivity)
class WeeklyActivityAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das WeeklyActivity-Modell."""
    
    list_display = ('user', 'date', 'count')
    list_filter = ('date',)
    search_fields = ('user__username',)
    ordering = ('-date',)
    date_hierarchy = 'date'