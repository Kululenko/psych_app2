from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, CustomTokenObtainPairView, UserProfileView,
    UserUpdateView, ChangePasswordView, LogoutView, ForgotPasswordView,
    ResetPasswordView, CheckAuthStatusView
)

urlpatterns = [
    # Authentifizierung
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify/', CheckAuthStatusView.as_view(), name='verify'),
    
    # Passwort-Management
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Benutzerprofil
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('update/', UserUpdateView.as_view(), name='update_profile'),
]