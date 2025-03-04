from django.core.mail import send_mail
from django.conf import settings
from psychology_project.celery import app


@app.task
def send_password_reset_email(email, reset_link):
    """
    Sendet eine E-Mail mit einem Link zum Zurücksetzen des Passworts.
    """
    subject = 'Passwort zurücksetzen'
    message = f"""
    Hallo,
    
    du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Bitte klicke auf den folgenden Link, 
    um dein Passwort zurückzusetzen:
    
    {reset_link}
    
    Dieser Link ist 24 Stunden gültig. Wenn du keine Passwortänderung angefordert hast, ignoriere diese E-Mail.
    
    Mit freundlichen Grüßen,
    Dein Psychologie-App-Team
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(subject, message, from_email, recipient_list)


@app.task
def send_welcome_email(email, username):
    """
    Sendet eine Willkommens-E-Mail an neue Benutzer.
    """
    subject = 'Willkommen bei der Psychologie-App!'
    message = f"""
    Hallo {username},
    
    herzlich willkommen bei unserer Psychologie-App! Wir freuen uns, dass du dich für unsere 
    Plattform entschieden hast.
    
    Mit unserer App kannst du:
    - Therapieübungen durchführen
    - Mit einem Therapeuten chatten
    - Deine Stimmung verfolgen
    - Deinen Fortschritt überwachen
    - Atemübungen zur Entspannung machen
    
    Wenn du Fragen hast, antworte einfach auf diese E-Mail.
    
    Mit freundlichen Grüßen,
    Dein Psychologie-App-Team
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(subject, message, from_email, recipient_list)


@app.task
def send_streak_reminder_email(email, username, streak_days):
    """
    Sendet eine Erinnerungs-E-Mail an Benutzer, die ihre Serie fortsetzen sollten.
    """
    subject = f'Vergiss nicht, deine {streak_days}-Tage-Serie fortzusetzen!'
    message = f"""
    Hallo {username},
    
    nur eine kurze Erinnerung: Du hast eine Serie von {streak_days} Tagen! 
    Mach heute eine Übung, um deine Serie fortzusetzen.
    
    Mit freundlichen Grüßen,
    Dein Psychologie-App-Team
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(subject, message, from_email, recipient_list)


@app.task
def send_level_up_notification(email, username, new_level):
    """
    Sendet eine Benachrichtigung, wenn ein Benutzer ein neues Level erreicht hat.
    """
    subject = f'Glückwunsch! Du hast Level {new_level} erreicht!'
    message = f"""
    Hallo {username},
    
    herzlichen Glückwunsch! Du hast Level {new_level} in der Psychologie-App erreicht.
    
    Weiter so mit der guten Arbeit!
    
    Mit freundlichen Grüßen,
    Dein Psychologie-App-Team
    """
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    
    send_mail(subject, message, from_email, recipient_list)