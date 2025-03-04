from rest_framework import serializers
from django.db import transaction
from .models import MoodEntry, MoodFactor, MoodStats


class MoodFactorSerializer(serializers.ModelSerializer):
    """Serializer für Stimmungsfaktoren."""
    
    class Meta:
        model = MoodFactor
        fields = ('name',)


class MoodEntrySerializer(serializers.ModelSerializer):
    """Serializer für Stimmungseinträge."""
    
    factors = MoodFactorSerializer(many=True, required=False)
    
    class Meta:
        model = MoodEntry
        fields = ('id', 'mood', 'notes', 'date', 'created_at', 'factors')
        read_only_fields = ('created_at',)
    
    def create(self, validated_data):
        """
        Erstellt einen Stimmungseintrag mit den zugehörigen Faktoren.
        """
        factors_data = validated_data.pop('factors', [])
        
        with transaction.atomic():
            # Stimmungseintrag erstellen
            mood_entry = MoodEntry.objects.create(**validated_data)
            
            # Faktoren erstellen
            for factor_data in factors_data:
                MoodFactor.objects.create(entry=mood_entry, **factor_data)
            
            # Statistiken aktualisieren
            stats, _ = MoodStats.objects.get_or_create(user=validated_data['user'])
            stats.update_stats()
        
        return mood_entry
    
    def update(self, instance, validated_data):
        """
        Aktualisiert einen Stimmungseintrag mit den zugehörigen Faktoren.
        """
        factors_data = validated_data.pop('factors', None)
        
        with transaction.atomic():
            # Stimmungseintrag aktualisieren
            for key, value in validated_data.items():
                setattr(instance, key, value)
            instance.save()
            
            # Faktoren aktualisieren, falls angegeben
            if factors_data is not None:
                # Bestehende Faktoren entfernen
                instance.factors.all().delete()
                
                # Neue Faktoren erstellen
                for factor_data in factors_data:
                    MoodFactor.objects.create(entry=instance, **factor_data)
            
            # Statistiken aktualisieren
            stats, _ = MoodStats.objects.get_or_create(user=instance.user)
            stats.update_stats()
        
        return instance


class MoodEntryWithFactorsSerializer(serializers.ModelSerializer):
    """Serializer für Stimmungseinträge mit den zugehörigen Faktoren."""
    
    factors = serializers.SerializerMethodField()
    
    class Meta:
        model = MoodEntry
        fields = ('id', 'mood', 'notes', 'date', 'created_at', 'factors')
    
    def get_factors(self, obj):
        """Gibt die Namen der Faktoren zurück."""
        return [factor.name for factor in obj.factors.all()]


class MoodStatsSerializer(serializers.ModelSerializer):
    """Serializer für Stimmungsstatistiken."""
    
    mood_counts = serializers.SerializerMethodField()
    most_common_mood = serializers.SerializerMethodField()
    top_factors = serializers.SerializerMethodField()
    
    class Meta:
        model = MoodStats
        fields = ('average_mood', 'streak_days', 'mood_counts', 'most_common_mood', 'top_factors')
    
    def get_mood_counts(self, obj):
        """Gibt die Anzahl der Einträge pro Stimmung zurück."""
        counts = {mood: 0 for mood, _ in MoodEntry.MOOD_CHOICES}
        
        for entry in MoodEntry.objects.filter(user=obj.user):
            counts[entry.mood] += 1
        
        return counts
    
    def get_most_common_mood(self, obj):
        """Gibt die am häufigsten vorkommende Stimmung zurück."""
        counts = self.get_mood_counts(obj)
        return max(counts.items(), key=lambda x: x[1])[0] if counts else None
    
    def get_top_factors(self, obj):
        """Gibt die häufigsten Faktoren zurück."""
        # Zähle die Häufigkeit jedes Faktors
        factor_counts = {}
        entries = MoodEntry.objects.filter(user=obj.user)
        
        for entry in entries:
            for factor in entry.factors.all():
                name = factor.name
                factor_counts[name] = factor_counts.get(name, 0) + 1
        
        # Sortiere nach Häufigkeit und gib die Top-5 zurück
        sorted_factors = sorted(factor_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        return [{'factor': factor, 'count': count} for factor, count in sorted_factors]