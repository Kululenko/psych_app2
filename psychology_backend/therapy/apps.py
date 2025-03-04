from django.apps import AppConfig


class TherapyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'therapy'
    
    def ready(self):
        """
        Initialisiert Signal-Handler beim Start der App.
        """
        import therapy.signals
