from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator


class UserManager(BaseUserManager):
    """Benutzerdefinierter Manager für das User-Modell."""
    
    def create_user(self, email, username, password=None, **extra_fields):
        """Normalen Benutzer erstellen."""
        if not email:
            raise ValueError(_('E-Mail-Adresse muss angegeben werden'))
        if not username:
            raise ValueError(_('Benutzername muss angegeben werden'))
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        """Superuser (Admin) erstellen."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser muss is_staff=True haben'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser muss is_superuser=True haben'))
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Benutzerdefiniertes Benutzermodell für die Psychologie-App."""
    
    email = models.EmailField(_('E-Mail-Adresse'), unique=True)
    username = models.CharField(_('Benutzername'), max_length=30, unique=True)
    first_name = models.CharField(_('Vorname'), max_length=30, blank=True)
    last_name = models.CharField(_('Nachname'), max_length=30, blank=True)
    profile_image = models.ImageField(_('Profilbild'), upload_to='profile_images/', blank=True, null=True)
    
    # Therapie-spezifische Felder
    therapy_progress = models.IntegerField(
        _('Therapiefortschritt'),
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    streak_days = models.IntegerField(_('Serie (Tage)'), default=0)
    points = models.IntegerField(_('Punkte'), default=0)
    level = models.IntegerField(_('Level'), default=1)
    
    # Admin-Felder
    is_active = models.BooleanField(_('Aktiv'), default=True)
    is_staff = models.BooleanField(_('Mitarbeiter-Status'), default=False)
    date_joined = models.DateTimeField(_('Beitrittsdatum'), default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('Benutzer')
        verbose_name_plural = _('Benutzer')
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    def get_full_name(self):
        """Vollständigen Namen des Benutzers zurückgeben."""
        full_name = f"{self.first_name} {self.last_name}".strip()
        return full_name if full_name else self.username
    
    def get_short_name(self):
        """Kurznamen des Benutzers zurückgeben."""
        return self.first_name if self.first_name else self.username
    
    @property
    def next_level_points(self):
        """Berechnet die Punkte, die für das nächste Level benötigt werden."""
        # Einfaches Beispiel: 100 Punkte pro Level
        return 100
    
    def add_points(self, points):
        """Punkte zum Benutzerkonto hinzufügen und Level bei Bedarf erhöhen."""
        self.points += points
        
        # Level basierend auf Punkten berechnen (vereinfacht)
        new_level = (self.points // 100) + 1
        if new_level > self.level:
            self.level = new_level
        
        self.save()
        return self.level
    
    def update_streak(self, completed_today=True):
        """Serie des Benutzers aktualisieren."""
        if completed_today:
            self.streak_days += 1
        else:
            self.streak_days = 0
        self.save()
        return self.streak_days


class ResetPasswordToken(models.Model):
    """Modell für Passwort-Reset-Tokens."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"Token für {self.user.email}"
    
    @property
    def is_valid(self):
        """Überprüft, ob das Token noch gültig ist."""
        return timezone.now() < self.expires_at