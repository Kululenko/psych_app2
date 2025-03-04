from django.contrib import admin
from .models import BreathingTechnique, BreathingSession, RecommendedTechnique


class RecommendedTechniqueInline(admin.TabularInline):
    """Inline für empfohlene Atemtechniken."""
    
    model = RecommendedTechnique
    extra = 1


@admin.register(BreathingTechnique)
class BreathingTechniqueAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das BreathingTechnique-Modell."""
    
    list_display = ('name', 'pattern_display', 'duration', 'difficulty_level', 'is_active')
    list_filter = ('difficulty_level', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'benefits')
    ordering = ('name',)
    inlines = [RecommendedTechniqueInline]
    
    def pattern_display(self, obj):
        """Gibt das Atemmuster als formatierte Zeichenfolge zurück."""
        pattern = f"{obj.inhale_time}s einatmen"
        if obj.hold_in_time > 0:
            pattern += f" - {obj.hold_in_time}s halten"
        pattern += f" - {obj.exhale_time}s ausatmen"
        if obj.hold_out_time > 0:
            pattern += f" - {obj.hold_out_time}s Pause"
        return pattern
    pattern_display.short_description = 'Atemmuster'


@admin.register(BreathingSession)
class BreathingSessionAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das BreathingSession-Modell."""
    
    list_display = ('user', 'technique', 'completed_cycles', 'duration_seconds', 'completed_at')
    list_filter = ('technique', 'completed_at')
    search_fields = ('user__username', 'user__email')
    ordering = ('-completed_at',)
    date_hierarchy = 'completed_at'


@admin.register(RecommendedTechnique)
class RecommendedTechniqueAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das RecommendedTechnique-Modell."""
    
    list_display = ('condition', 'technique', 'priority')
    list_filter = ('condition', 'priority')
    search_fields = ('condition', 'technique__name')
    ordering = ('condition', 'priority')