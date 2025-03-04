import django_filters
from .models import BreathingTechnique, BreathingSession


class BreathingTechniqueFilter(django_filters.FilterSet):
    """Filter für Atemtechniken."""
    
    name = django_filters.CharFilter(lookup_expr='icontains')
    difficulty_level = django_filters.CharFilter()
    duration_min = django_filters.NumberFilter(field_name='duration', lookup_expr='gte')
    duration_max = django_filters.NumberFilter(field_name='duration', lookup_expr='lte')
    
    class Meta:
        model = BreathingTechnique
        fields = ['name', 'difficulty_level', 'duration_min', 'duration_max']


class BreathingSessionFilter(django_filters.FilterSet):
    """Filter für Atemsitzungen."""
    
    technique = django_filters.NumberFilter()
    completed_from = django_filters.DateTimeFilter(field_name='completed_at', lookup_expr='gte')
    completed_to = django_filters.DateTimeFilter(field_name='completed_at', lookup_expr='lte')
    
    class Meta:
        model = BreathingSession
        fields = ['technique', 'completed_from', 'completed_to']