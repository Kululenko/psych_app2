from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer für grundlegende Benutzerinformationen."""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'profile_image', 'therapy_progress', 'streak_days', 
                  'points', 'level', 'date_joined', 'next_level_points')
        read_only_fields = ('id', 'date_joined', 'next_level_points')


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer für die Benutzerregistrierung."""
    
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'first_name', 'last_name')
    
    def validate(self, attrs):
        """
        Überprüft, ob die Passwörter übereinstimmen.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Die Passwörter stimmen nicht überein"})
        return attrs
    
    def create(self, validated_data):
        """
        Erstellt einen neuen Benutzer mit verschlüsseltem Passwort.
        """
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer für die Aktualisierung von Benutzerdaten."""
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'profile_image')
    
    def validate_email(self, value):
        """
        Überprüft, ob die E-Mail-Adresse bereits vergeben ist.
        """
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("Diese E-Mail-Adresse wird bereits verwendet")
        return value
    
    def validate_username(self, value):
        """
        Überprüft, ob der Benutzername bereits vergeben ist.
        """
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("Dieser Benutzername wird bereits verwendet")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer für die Passwortänderung."""
    
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """
        Überprüft, ob das aktuelle Passwort korrekt ist und die neuen Passwörter übereinstimmen.
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Die neuen Passwörter stimmen nicht überein"})
        return attrs
    
    def validate_current_password(self, value):
        """
        Überprüft, ob das aktuelle Passwort korrekt ist.
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Das aktuelle Passwort ist falsch")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Angepasster TokenObtainPairSerializer, der zusätzliche Benutzerinformationen zurückgibt."""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Füge Benutzerinformationen zum Token hinzu
        serializer = UserSerializer(self.user)
        data['user'] = serializer.data
        
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer für die Anforderung eines Passwort-Reset-Links."""
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """
        Überprüft, ob ein Benutzer mit dieser E-Mail-Adresse existiert.
        """
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Es existiert kein Benutzer mit dieser E-Mail-Adresse")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer für das Zurücksetzen des Passworts."""
    
    token = serializers.CharField()
    password = serializers.CharField(validators=[validate_password])
    password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        """
        Überprüft, ob die neuen Passwörter übereinstimmen.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Die Passwörter stimmen nicht überein"})
        return attrs