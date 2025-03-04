import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput as RNTextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MainScreenProps } from '../../types/navigation.types';
import { ChatMessage, ChatSession } from '../../types/chat.types';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

export const ChatScreen: React.FC<MainScreenProps<'Chat'>> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { sessionId } = route.params || {};
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<RNTextInput>(null);

  // Chat-Daten beim ersten Laden abrufen
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setError(null);
        setLoading(true);
        
        if (sessionId) {
          // Bestehende Chat-Session laden
          const response = await apiClient.get<ChatSession>(
            ENDPOINTS.CHAT.SESSION_DETAIL(sessionId)
          );
          setSession(response.data);
          setMessages(response.data.messages);
        } else {
          // Neue Chat-Session erstellen
          const response = await apiClient.post<ChatSession>(ENDPOINTS.CHAT.SESSIONS, {
            title: 'Neue Unterhaltung',
          });
          setSession(response.data);
          
          // Willkommensnachricht hinzufügen
          const welcomeMessage: ChatMessage = {
            id: 'welcome',
            content: 'Hallo! Ich bin dein therapeutischer Assistent. Wie kann ich dir heute helfen?',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Chat-Daten:', err);
        setError('Chat-Daten konnten nicht geladen werden. Bitte versuche es später erneut.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChatData();
  }, [sessionId]);

  // Nachricht senden
  const handleSendMessage = async () => {
    if (!inputText.trim() || !session) return;
    
    // Tastatur ausblenden
    Keyboard.dismiss();
    
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    // Lokale Nachrichten-UI aktualisieren
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    
    // Nachricht an Backend senden und auf Antwort warten
    try {
      setSending(true);
      
      // Platzhalter für die Antwort des LLM (wird zunächst als "wird verarbeitet" angezeigt)
      const tempBotMessage: ChatMessage = {
        id: `temp-bot-${Date.now()}`,
        content: '',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isProcessing: true,
      };
      
      setMessages((prev) => [...prev, tempBotMessage]);
      
      // Nachricht an Backend senden
      const response = await apiClient.post<ChatMessage>(
        ENDPOINTS.CHAT.MESSAGES(session.id),
        { content: userMessage.content }
      );
      
      // Nachrichten mit der tatsächlichen Antwort aktualisieren
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotMessage.id ? response.data : msg
        )
      );
    } catch (err) {
      console.error('Fehler beim Senden der Nachricht:', err);
      
      // Fehlermeldung anzeigen
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isProcessing
            ? {
                ...msg,
                content: 'Entschuldigung, es gab ein Problem beim Verarbeiten deiner Nachricht. Bitte versuche es erneut.',
                isProcessing: false,
              }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  };

  // Zum Ende der Liste scrollen, wenn neue Nachrichten hinzugefügt werden
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Chat-Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.background.primary,
              borderBottomColor: theme.colors.neutral.light,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ fontSize: 20, color: theme.colors.primary.main }}>
              ←
            </Text>
          </TouchableOpacity>
          
          <Text
            style={[
              styles.headerTitle,
              {
                fontFamily: theme.typography.h3.fontFamily,
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              },
            ]}
          >
            {session?.title || 'Unterhaltung'}
          </Text>
        </View>

        {/* Fehlermeldung */}
        {error && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: theme.colors.status.error + '20', // 20% Opacity
                borderColor: theme.colors.status.error,
              },
            ]}
          >
            <Text
              style={{
                color: theme.colors.status.error,
                fontFamily: theme.typography.body2.fontFamily,
                fontSize: theme.typography.body2.fontSize,
              }}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Nachrichtenliste */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ChatBubble message={item} theme={theme} />
          )}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Eingabebereich */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.background.primary,
              borderTopColor: theme.colors.neutral.light,
            },
          ]}
        >
          <RNTextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                fontFamily: theme.typography.body1.fontFamily,
                fontSize: theme.typography.body1.fontSize,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.neutral.light,
              },
            ]}
            placeholder="Schreibe eine Nachricht..."
            placeholderTextColor={theme.colors.text.hint}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000} // Vernünftiges Limit für Nachrichtenlänge
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: theme.colors.primary.main,
                opacity: !inputText.trim() || sending ? 0.5 : 1,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            <Text style={{ color: theme.colors.text.inverse, fontSize: 16 }}>
              {sending ? '...' : '→'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Chat-Bubble-Komponente für einzelne Nachrichten
interface ChatBubbleProps {
  message: ChatMessage;
  theme: any;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, theme }) => {
  const isUser = message.sender === 'user';
  
  return (
    <View
      style={[
        styles.bubbleContainer,
        {
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isUser 
              ? theme.colors.primary.main 
              : theme.colors.background.secondary,
            borderBottomLeftRadius: isUser ? theme.borderRadius.md : 0,
            borderBottomRightRadius: !isUser ? theme.borderRadius.md : 0,
          },
        ]}
      >
        {/* Processing-Indikator für Assistenten-Nachrichten */}
        {message.isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary.main} />
            <Text
              style={{
                fontFamily: theme.typography.body2.fontFamily,
                fontSize: theme.typography.body2.fontSize,
                color: theme.colors.text.secondary,
                marginLeft: 8,
              }}
            >
              Nachricht wird verarbeitet...
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontFamily: theme.typography.body1.fontFamily,
              fontSize: theme.typography.body1.fontSize,
              color: isUser 
                ? theme.colors.text.inverse 
                : theme.colors.text.primary,
            }}
          >
            {message.content}
          </Text>
        )}
      </View>
      
      {/* Zeitstempel */}
      <Text
        style={[
          styles.timestamp,
          {
            alignSelf: isUser ? 'flex-end' : 'flex-start',
            fontFamily: theme.typography.caption.fontFamily,
            fontSize: theme.typography.caption.fontSize,
            color: theme.colors.text.secondary,
          },
        ]}
      >
        {formatTimestamp(message.timestamp)}
      </Text>
    </View>
  );
};

// Hilfsfunktion zum Formatieren des Zeitstempels
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Heute
  if (date.toDateString() === now.toDateString()) {
    return `Heute, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Gestern
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Gestern, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // Andere Tage
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    marginLeft: 8,
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bubbleContainer: {
    marginVertical: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120, // Begrenzung der maximalen Höhe für Multiline
  },
  sendButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});