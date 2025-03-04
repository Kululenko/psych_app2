import os
from celery import Celery

# DJANGO_SETTINGS_MODULE-Umgebungsvariable setzen
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'psychology_project.settings')

# Celery-App erstellen
app = Celery('psychology_project')

# Konfigurationen aus den Django-Einstellungen laden
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automatisch Tasks aus allen registrierten Django-Apps laden
app.autodiscover_tasks()