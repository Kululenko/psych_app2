from django.utils import timezone
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import MoodEntry, MoodStats
from .serializers import MoodEntrySerializer, MoodEntryWithFactorsSerializer, MoodStatsSerializer
from .filters import MoodEntryFilter


class MoodEntryViewSet(viewsets.ModelViewSet):
    """ViewSet für Stimmungseinträge."""
    
    serializer_class = MoodEntrySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = MoodEntryFilter
    
    def get_queryset(self):
        """Gibt die Stimmungseinträge des aktuellen Benutzers zurück."""
        return MoodEntry.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Gibt den entsprechenden Serializer basierend auf der Anfrage zurück."""
        if self.action == 'list' or self.action == 'retrieve':
            return MoodEntryWithFactorsSerializer
        return MoodEntrySerializer
    
    def perform_create(self, serializer):
        """Erstellt einen neuen Stimmungseintrag für den aktuellen Benutzer."""
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Überschreibt die Create-Methode um Konflikte bei Einträgen am selben Tag zu behandeln."""
        today = timezone.now().date()
        existing_entry = MoodEntry.objects.filter(user=request.user, date=today).first()
        
        if existing_entry:
            # Wenn bereits ein Eintrag für heute existiert, aktualisiere ihn
            serializer = self.get_serializer(existing_entry, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        
        # Sonst erstelle einen neuen Eintrag
        return super().create(request, *args, **kwargs)


class TodayMoodView(generics.RetrieveAPIView):
    """View zum Abrufen des heutigen Stimmungseintrags."""
    
    serializer_class = MoodEntryWithFactorsSerializer
    
    def get_object(self):
        """Gibt den Stimmungseintrag des aktuellen Benutzers für heute zurück."""
        today = timezone.now().date()
        return MoodEntry.objects.filter(user=self.request.user, date=today).first()
    
    def retrieve(self, request, *args, **kwargs):
        """Überschreibt die Retrieve-Methode um einen leeren Eintrag zurückzugeben, wenn keiner existiert."""
        instance = self.get_object()
        if not instance:
            return Response(None, status=status.HTTP_204_NO_CONTENT)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class MoodHistoryView(generics.ListAPIView):
    """View zum Abrufen des Stimmungsverlaufs."""
    
    serializer_class = MoodEntryWithFactorsSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = MoodEntryFilter
    
    def get_queryset(self):
        """Gibt die Stimmungseinträge des aktuellen Benutzers zurück."""
        return MoodEntry.objects.filter(user=self.request.user)


class MoodStatsView(generics.RetrieveAPIView):
    """View zum Abrufen von Stimmungsstatistiken."""
    
    serializer_class = MoodStatsSerializer
    
    def get_object(self):
        """Gibt die Stimmungsstatistiken des aktuellen Benutzers zurück."""
        stats, created = MoodStats.objects.get_or_create(user=self.request.user)
        
        # Statistiken aktualisieren, falls sie neu erstellt wurden
        if created:
            stats.update_stats()
        
        return stats