from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API-Dokumentation mit Swagger/OpenAPI
schema_view = get_schema_view(
    openapi.Info(
        title="Psychologie-App API",
        default_version='v1',
        description="API für eine therapeutische Psychologie-App",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API-Dokumentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API-Endpunkte für verschiedene Apps
    path('api/auth/', include('users.urls')),
    path('api/therapy/', include('therapy.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/mood/', include('moods.urls')),
    path('api/breathing/', include('breathing.urls')),
]

# Statische und Medien-Dateien in der Entwicklung
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)