from django.apps import AppConfig


class MoodsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'moods'
    
    def ready(self):
        """
        Initialisiert Signal-Handler beim Start der App.
        """
        import moods.signals