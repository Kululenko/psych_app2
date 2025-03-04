from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, ResetPasswordToken


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin-Konfiguration für das benutzerdefinierte User-Modell."""
    
    list_display = ('username', 'email', 'first_name', 'last_name', 'level', 'points', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('is_active', 'is_staff', 'level')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Persönliche Informationen'), {'fields': ('first_name', 'last_name', 'profile_image')}),
        (_('Therapie-Fortschritt'), {'fields': ('therapy_progress', 'streak_days', 'points', 'level')}),
        (_('Berechtigungen'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Wichtige Daten'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )


@admin.register(ResetPasswordToken)
class ResetPasswordTokenAdmin(admin.ModelAdmin):
    """Admin-Konfiguration für das ResetPasswordToken-Modell."""
    
    list_display = ('user', 'created_at', 'expires_at', 'is_valid')
    search_fields = ('user__username', 'user__email')
    list_filter = ('created_at', 'expires_at')
    readonly_fields = ('token', 'created_at', 'expires_at')