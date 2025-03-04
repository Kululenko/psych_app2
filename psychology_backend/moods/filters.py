import django_filters
from .models import MoodEntry


class MoodEntryFilter(django_filters.FilterSet):
    """Filter für Stimmungseinträge."""
    
    mood = django_filters.CharFilter()
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')
    factor = django_filters.CharFilter(field_name='factors__name', lookup_expr='icontains')
    
    class Meta:
        model = MoodEntry
        fields = ['mood', 'date_from', 'date_to', 'factor']