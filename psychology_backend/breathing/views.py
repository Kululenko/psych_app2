from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import BreathingTechnique, BreathingSession, RecommendedTechnique
from .serializers import (
    BreathingTechniqueSerializer, BreathingTechniqueDetailSerializer,
    BreathingSessionSerializer, BreathingSessionCreateSerializer,
    RecommendedTechniqueSerializer
)
from .filters import BreathingTechniqueFilter, BreathingSessionFilter


class BreathingTechniqueViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet für Atemtechniken."""
    
    queryset = BreathingTechnique.objects.filter(is_active=True)
    serializer_class = BreathingTechniqueSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BreathingTechniqueFilter
    
    def get_serializer_class(self):
        """Gibt den entsprechenden Serializer basierend auf der Anfrage zurück."""
        if self.action == 'retrieve':
            return BreathingTechniqueDetailSerializer
        return self.serializer_class
    
    @action(detail=False)
    def recommended(self, request):
        """Gibt empfohlene Atemtechniken für einen bestimmten Zustand zurück."""
        condition = request.query_params.get('condition', None)
        
        if not condition:
            return Response(
                {"detail": "Parameter 'condition' ist erforderlich."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Empfehlungen nach Priorität abrufen
        recommendations = RecommendedTechnique.objects.filter(
            condition__iexact=condition,
            technique__is_active=True
        ).order_by('priority')
        
        if not recommendations.exists():
            # Wenn keine spezifischen Empfehlungen existieren, gib Anfänger-Techniken zurück
            beginner_techniques = BreathingTechnique.objects.filter(
                difficulty_level='beginner',
                is_active=True
            )
            serializer = BreathingTechniqueSerializer(beginner_techniques, many=True)
            return Response(serializer.data)
        
        # Serialisiere die empfohlenen Techniken
        serializer = RecommendedTechniqueSerializer(recommendations, many=True)
        return Response(serializer.data)


class BreathingSessionViewSet(viewsets.ModelViewSet):
    """ViewSet für Atemsitzungen."""
    
    serializer_class = BreathingSessionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BreathingSessionFilter
    
    def get_queryset(self):
        """Gibt die Atemsitzungen des aktuellen Benutzers zurück."""
        return BreathingSession.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        """Gibt den entsprechenden Serializer basierend auf der Anfrage zurück."""
        if self.action == 'create':
            return BreathingSessionCreateSerializer
        return self.serializer_class
    
    def perform_create(self, serializer):
        """Erstellt eine neue Atemsitzung für den aktuellen Benutzer."""
        # Sitzung speichern
        session = serializer.save(user=self.request.user)
        
        # Punkte für den Benutzer basierend auf der Dauer und den Zyklen vergeben
        points = session.duration_seconds // 60 * 5  # 5 Punkte pro Minute
        self.request.user.add_points(points)


class UserBreathingHistoryView(generics.ListAPIView):
    """View für die Atemsitzungen-Historie des Benutzers."""
    
    serializer_class = BreathingSessionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BreathingSessionFilter
    
    def get_queryset(self):
        """Gibt die Atemsitzungen des aktuellen Benutzers zurück."""
        return BreathingSession.objects.filter(user=self.request.user)