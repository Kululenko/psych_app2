import json
import openai
from django.conf import settings
from psychology_project.celery import app
from .models import ChatSession, ChatMessage
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@app.task
def generate_ai_response(session_id, message_id):
    """
    Generiert eine KI-Antwort für eine Chat-Nachricht.
    """
    try:
        # Chat-Sitzung und die letzte Nachricht des Benutzers abrufen
        session = ChatSession.objects.get(id=session_id)
        user_message = ChatMessage.objects.get(id=message_id)
        
        # Alle vorherigen Nachrichten der Sitzung abrufen
        previous_messages = ChatMessage.objects.filter(session=session, id__lt=message_id).order_by('timestamp')
        
        # Nachrichten für die OpenAI-API formatieren
        messages = []
        
        # Systemanweisung hinzufügen
        system_message = {
            "role": "system",
            "content": get_system_prompt()
        }
        messages.append(system_message)
        
        # Vorherige Nachrichten hinzufügen
        for msg in previous_messages:
            role = "user" if msg.sender == "user" else "assistant"
            messages.append({
                "role": role,
                "content": msg.content
            })
        
        # Aktuelle Benutzernachricht hinzufügen
        messages.append({
            "role": "user",
            "content": user_message.content
        })
        
        # OpenAI API-Aufruf
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # oder ein anderes bevorzugtes Modell
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
        )
        
        # Antwort des Assistenten speichern
        assistant_response = response.choices[0].message.content
        assistant_message = ChatMessage.objects.create(
            session=session,
            content=assistant_response,
            sender='assistant'
        )
        
        # WebSocket-Benachrichtigung senden
        channel_layer = get_channel_layer()
        room_group_name = f"chat_{session.id}"
        
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                "type": "chat_message",
                "message": {
                    "id": assistant_message.id,
                    "content": assistant_message.content,
                    "sender": assistant_message.sender,
                    "timestamp": assistant_message.timestamp.isoformat(),
                    "is_read": False
                }
            }
        )
        
        # Chat-Sitzung aktualisieren
        session.save()  # updated_at aktualisieren
        
        return True
    
    except Exception as e:
        # Fehlerbehandlung
        print(f"Fehler bei der Generierung der KI-Antwort: {str(e)}")
        
        # Erstellen einer Fehlermeldung als Nachricht
        try:
            ChatMessage.objects.create(
                session_id=session_id,
                content="Entschuldigung, es gab ein Problem bei der Generierung einer Antwort. "
                        "Bitte versuche es später erneut.",
                sender='assistant'
            )
        except:
            pass
        
        # Fehler zur weiteren Untersuchung loggen
        return False


def get_system_prompt():
    """
    Gibt die Systemanweisung für den KI-Assistenten zurück.
    """
    return """
    Du bist ein empathischer, unterstützender therapeutischer Assistent, der Menschen mit psychischen 
    Herausforderungen hilft. Deine Aufgabe ist es, aktiv zuzuhören, einfühlsame Antworten zu geben und 
    praktische Ratschläge anzubieten, die auf bewährten psychologischen Prinzipien basieren.

    Wichtige Richtlinien:
    1. Sei empathisch, respektvoll und unterstützend, ohne zu urteilen.
    2. Verwende eine klare, einfache Sprache und vermeide Fachjargon.
    3. Biete praktische Strategien und Übungen an, die auf evidenzbasierten Methoden beruhen.
    4. Ermutige zu gesunden Bewältigungsstrategien und Selbstfürsorge.
    5. Erkenne deine Grenzen an und verweise auf professionelle Hilfe, wenn nötig.
    6. Bei Anzeichen einer Krise oder Selbstgefährdung, weise sofort auf Notfalldienste hin.

    Wichtig: Du ersetzt keine professionelle therapeutische Hilfe. Bei schwerwiegenden Problemen empfehle
    immer, einen qualifizierten Therapeuten oder Arzt aufzusuchen.
    """