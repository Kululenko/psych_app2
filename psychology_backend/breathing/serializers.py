from rest_framework import serializers
from .models import BreathingTechnique, BreathingSession, RecommendedTechnique


class BreathingTechniqueSerializer(serializers.ModelSerializer):
    """Serializer für Atemtechniken."""
    
    benefits_list = serializers.SerializerMethodField()
    recommended_for = serializers.SerializerMethodField()
    pattern = serializers.SerializerMethodField()
    
    class Meta:
        model = BreathingTechnique
        fields = ('id', 'name', 'description', 'pattern', 'benefits_list',
                  'recommended_for', 'difficulty_level', 'duration')
    
    def get_benefits_list(self, obj):
        """Gibt die Vorteile als Liste zurück."""
        return [benefit.strip() for benefit in obj.benefits.split('\n') if benefit.strip()]
    
    def get_recommended_for(self, obj):
        """Gibt die empfohlenen Zustände zurück."""
        recommendations = obj.recommendations.all()
        return [rec.condition for rec in recommendations]
    
    def get_pattern(self, obj):
        """Gibt das Atemmuster zurück."""
        return {
            'name': obj.name,
            'description': f"Einatmen, {'halten, ' if obj.hold_in_time > 0 else ''}ausatmen{', halten' if obj.hold_out_time > 0 else ''}",
            'inhaleTime': obj.inhale_time,
            'holdInTime': obj.hold_in_time,
            'exhaleTime': obj.exhale_time,
            'holdOutTime': obj.hold_out_time,
            'cycles': obj.cycles
        }


class BreathingTechniqueDetailSerializer(BreathingTechniqueSerializer):
    """Erweiterter Serializer für Atemtechniken mit zusätzlichen Details."""
    
    class Meta(BreathingTechniqueSerializer.Meta):
        fields = BreathingTechniqueSerializer.Meta.fields + (
            'inhale_time', 'hold_in_time', 'exhale_time', 'hold_out_time',
            'cycles', 'difficulty_level', 'created_at', 'updated_at'
        )


class BreathingSessionSerializer(serializers.ModelSerializer):
    """Serializer für Atemsitzungen."""
    
    technique_name = serializers.ReadOnlyField(source='technique.name')
    
    class Meta:
        model = BreathingSession
        fields = ('id', 'technique', 'technique_name', 'completed_cycles',
                  'duration_seconds', 'completed_at')
        read_only_fields = ('completed_at',)


class BreathingSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer zum Erstellen von Atemsitzungen."""
    
    class Meta:
        model = BreathingSession
        fields = ('technique', 'completed_cycles', 'duration_seconds')
    
    def validate(self, attrs):
        """Validiert die Eingabedaten."""
        # Grundlegende Validierungen
        if attrs['completed_cycles'] <= 0:
            raise serializers.ValidationError({"completed_cycles": "Die Anzahl der abgeschlossenen Zyklen muss größer als 0 sein."})
        
        if attrs['duration_seconds'] <= 0:
            raise serializers.ValidationError({"duration_seconds": "Die Dauer muss größer als 0 sein."})
        
        # Überprüfen, ob die Dauer realistisch ist
        technique = attrs['technique']
        min_duration = technique.cycle_duration * attrs['completed_cycles'] * 0.5  # Mindestens 50% der erwarteten Dauer
        
        if attrs['duration_seconds'] < min_duration:
            raise serializers.ValidationError({
                "duration_seconds": f"Die angegebene Dauer ist zu kurz für {attrs['completed_cycles']} Zyklen dieser Technik."
            })
        
        return attrs


class RecommendedTechniqueSerializer(serializers.ModelSerializer):
    """Serializer für empfohlene Atemtechniken."""
    
    technique = BreathingTechniqueSerializer()
    
    class Meta:
        model = RecommendedTechnique
        fields = ('id', 'technique', 'condition', 'priority')