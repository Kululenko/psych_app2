import uuid
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserUpdateSerializer,
    ChangePasswordSerializer, CustomTokenObtainPairSerializer,
    ForgotPasswordSerializer, ResetPasswordSerializer
)
from .models import ResetPasswordToken
from .tasks import send_password_reset_email

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """View zur Registrierung neuer Benutzer."""
    
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # JWT-Token erstellen
        refresh = RefreshToken.for_user(user)
        
        # Benutzer und Token zurückgeben
        user_data = UserSerializer(user).data
        
        return Response({
            'user': user_data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Angepasste TokenObtainPairView, die zusätzliche Benutzerinformationen zurückgibt."""
    
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View zum Abrufen und Aktualisieren des Benutzerprofils."""
    
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    """View zum Aktualisieren der Benutzerdaten."""
    
    serializer_class = UserUpdateSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Aktualisierte Benutzerdaten zurückgeben
        return Response(UserSerializer(instance).data)


class ChangePasswordView(generics.UpdateAPIView):
    """View zum Ändern des Passworts."""
    
    serializer_class = ChangePasswordSerializer
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Passwort ändern
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({"detail": "Passwort erfolgreich geändert"}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """View zum Abmelden des Benutzers."""
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Erfolgreich abgemeldet"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(generics.GenericAPIView):
    """View zum Anfordern eines Passwort-Reset-Links."""
    
    permission_classes = [permissions.AllowAny]
    serializer_class = ForgotPasswordSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Bestehende Token entfernen
        ResetPasswordToken.objects.filter(user=user).delete()
        
        # Neues Token erstellen
        token = str(uuid.uuid4())
        expires_at = timezone.now() + timedelta(hours=24)
        reset_token = ResetPasswordToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        
        # E-Mail mit Reset-Link als Hintergrundaufgabe senden
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        send_password_reset_email.delay(user.email, reset_link)
        
        return Response({"detail": "Passwort-Reset-Link wurde per E-Mail gesendet"}, status=status.HTTP_200_OK)


class ResetPasswordView(generics.GenericAPIView):
    """View zum Zurücksetzen des Passworts mit einem Token."""
    
    permission_classes = [permissions.AllowAny]
    serializer_class = ResetPasswordSerializer
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        
        try:
            reset_token = ResetPasswordToken.objects.get(token=token)
            
            # Überprüfen, ob das Token noch gültig ist
            if not reset_token.is_valid:
                return Response({"detail": "Das Token ist abgelaufen"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Passwort zurücksetzen
            user = reset_token.user
            user.set_password(serializer.validated_data['password'])
            user.save()
            
            # Token löschen
            reset_token.delete()
            
            return Response({"detail": "Passwort wurde erfolgreich zurückgesetzt"}, status=status.HTTP_200_OK)
        
        except ResetPasswordToken.DoesNotExist:
            return Response({"detail": "Ungültiges Token"}, status=status.HTTP_400_BAD_REQUEST)


class CheckAuthStatusView(APIView):
    """View zum Überprüfen des Authentifizierungsstatus."""
    
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "isAuthenticated": True,
                "user": UserSerializer(request.user).data
            })
        else:
            return Response({
                "isAuthenticated": False,
                "user": None
            })