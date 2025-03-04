import django_filters
from .models import Exercise, Achievement


class ExerciseFilter(django_filters.FilterSet):
    """Filter für Therapieübungen."""
    
    title = django_filters.CharFilter(lookup_expr='icontains')
    type = django_filters.CharFilter()
    duration_minutes_min = django_filters.NumberFilter(field_name='duration_minutes', lookup_expr='gte')
    duration_minutes_max = django_filters.NumberFilter(field_name='duration_minutes', lookup_expr='lte')
    
    class Meta:
        model = Exercise
        fields = ['title', 'type', 'duration_minutes_min', 'duration_minutes_max']


class AchievementFilter(django_filters.FilterSet):
    """Filter für Achievements."""
    
    title = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.CharFilter()
    
    class Meta:
        model = Achievement
        fields = ['title', 'category']