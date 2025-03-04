import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import ChatSession, ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket-Konsument für die Chat-Funktionalität."""
    
    async def connect(self):
        """
        Wird aufgerufen, wenn ein Client eine WebSocket-Verbindung herstellt.
        """
        self.user = self.scope["user"]
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f"chat_{self.session_id}"
        
        # Überprüfen, ob der Benutzer Zugriff auf diese Chat-Sitzung hat
        if not await self.user_has_access():
            await self.close()
            return
        
        # Der Gruppe beitreten
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        """
        Wird aufgerufen, wenn ein Client die Verbindung trennt.
        """
        # Die Gruppe verlassen
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """
        Wird aufgerufen, wenn ein Client eine Nachricht sendet.
        """
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'message')
            
            if message_type == 'message':
                content = text_data_json['message']
                
                # Nachricht in der Datenbank speichern
                chat_message = await self.save_message(content)
                
                # Nachricht an die Gruppe senden
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': chat_message['id'],
                            'content': chat_message['content'],
                            'sender': chat_message['sender'],
                            'timestamp': chat_message['timestamp'],
                            'is_read': chat_message['is_read']
                        }
                    }
                )
            
            elif message_type == 'typing':
                # Schreibindikator an die Gruppe senden
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_indicator',
                        'user_id': self.user.id,
                        'is_typing': text_data_json.get('is_typing', False)
                    }
                )
            
            elif message_type == 'read':
                # Nachricht als gelesen markieren
                message_id = text_data_json.get('message_id')
                if message_id:
                    await self.mark_message_as_read(message_id)
        
        except Exception as e:
            print(f"Fehler beim Empfangen einer Nachricht: {str(e)}")
    
    async def chat_message(self, event):
        """
        Sendet eine Chat-Nachricht an den Client.
        """
        message = event['message']
        
        # Nachricht an den WebSocket senden
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': message
        }))
    
    async def typing_indicator(self, event):
        """
        Sendet einen Schreibindikator an den Client.
        """
        # Schreibindikator an den WebSocket senden
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'is_typing': event['is_typing']
        }))
    
    @database_sync_to_async
    def user_has_access(self):
        """
        Überprüft, ob der Benutzer Zugriff auf diese Chat-Sitzung hat.
        """
        try:
            session = ChatSession.objects.get(id=self.session_id)
            return session.user == self.user
        except ChatSession.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, content):
        """
        Speichert eine Nachricht in der Datenbank.
        """
        session = ChatSession.objects.get(id=self.session_id)
        message = ChatMessage.objects.create(
            session=session,
            content=content,
            sender='user'
        )
        
        # Chat-Sitzung aktualisieren
        session.save()  # updated_at aktualisieren
        
        return {
            'id': message.id,
            'content': message.content,
            'sender': message.sender,
            'timestamp': message.timestamp.isoformat(),
            'is_read': message.is_read
        }
    
    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        """
        Markiert eine Nachricht als gelesen.
        """
        try:
            message = ChatMessage.objects.get(id=message_id, session_id=self.session_id)
            message.is_read = True
            message.save(update_fields=['is_read'])
            return True
        except ChatMessage.DoesNotExist:
            return False