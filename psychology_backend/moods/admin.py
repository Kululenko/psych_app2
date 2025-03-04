from django.contrib import admin
from .models import MoodEntry, MoodFactor, MoodStats


class MoodFactorInline(admin.TabularInline):
    """Inline für Stimmungsfaktoren."""
    
    model = MoodFactor
    extra = 1


@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das MoodEntry-Modell."""
    
    list_display = ('user', 'mood', 'date', 'created_at', 'get_factors')
    list_filter = ('mood', 'date', 'created_at')
    search_fields = ('notes', 'user__username', 'factors__name')
    ordering = ('-date', '-created_at')
    date_hierarchy = 'date'
    inlines = [MoodFactorInline]
    
    def get_factors(self, obj):
        """Gibt die Faktoren des Stimmungseintrags zurück."""
        return ", ".join([factor.name for factor in obj.factors.all()])
    get_factors.short_description = 'Faktoren'


@admin.register(MoodStats)
class MoodStatsAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das MoodStats-Modell."""
    
    list_display = ('user', 'average_mood', 'streak_days', 'last_entry_date', 'updated_at')
    list_filter = ('streak_days', 'last_entry_date', 'updated_at')
    search_fields = ('user__username',)
    ordering = ('-updated_at',)
    
    def has_add_permission(self, request):
        """Statistiken werden automatisch erstellt und sollten nicht manuell hinzugefügt werden."""
        return False