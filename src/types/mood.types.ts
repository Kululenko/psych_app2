// src/types/mood.types.ts
export type MoodType = 'verygood' | 'good' | 'neutral' | 'bad' | 'verybad';

export interface MoodEntry {
  id: number;
  date: string;
  mood: MoodType;
  notes?: string;
  factors?: Array<string>; // Faktoren, die zur Stimmung beigetragen haben
}

export interface MoodStats {
  averageMood: number; // 1-5 (1 = verybad, 5 = verygood)
  moodCounts: Record<MoodType, number>;
  mostCommonMood: MoodType;
  topFactors: Array<{factor: string, count: number}>;
  streakDays: number; // Tage in Folge mit Mood-Tracking
}

// src/components/mood/MoodSelector.tsx
import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MoodType } from '../../types/mood.types';
import { Theme } from '../../theme/theme'; // Importiere den Theme-Typ

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelect: (mood: MoodType) => void;
  theme: Theme; // Verwenden des korrekten Typs für theme
}

export const MoodSelector = memo(({ selectedMood, onSelect, theme }: MoodSelectorProps) => {
  // Mood-Optionen mit Emoji und Beschreibung
  const moodOptions: Array<{ type: MoodType; emoji: string; label: string }> = [
    { type: 'verygood', emoji: '😊', label: 'Sehr gut' },
    { type: 'good', emoji: '🙂', label: 'Gut' },
    { type: 'neutral', emoji: '😐', label: 'Neutral' },
    { type: 'bad', emoji: '😕', label: 'Schlecht' },
    { type: 'verybad', emoji: '😢', label: 'Sehr schlecht' },
  ];

  // Farbe basierend auf Stimmung
  const getMoodColor = (mood: MoodType): string => {
    switch (mood) {
      case 'verygood':
        return theme.colors.status.success;
      case 'good':
        return theme.colors.calming.main;
      case 'neutral':
        return theme.colors.primary.light;
      case 'bad':
        return theme.colors.status.warning;
      case 'verybad':
        return theme.colors.status.error;
      default:
        return theme.colors.neutral.medium;
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            fontFamily: theme.typography.subtitle1.fontFamily,
            fontSize: theme.typography.subtitle1.fontSize,
            fontWeight: theme.typography.subtitle1.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        Wie fühlst du dich heute?
      </Text>
      
      <View style={styles.moodContainer}>
        {moodOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.moodOption,
              {
                backgroundColor: selectedMood === option.type
                  ? getMoodColor(option.type) + '30' // 30% Opacity
                  : theme.colors.background.primary,
                borderColor: selectedMood === option.type
                  ? getMoodColor(option.type)
                  : theme.colors.neutral.light,
                borderWidth: 2,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.sm,
                margin: theme.spacing.xs,
              },
            ]}
            onPress={() => onSelect(option.type)}
            accessibilityLabel={`Stimmung: ${option.label}`}
            accessibilityState={{ selected: selectedMood === option.type }}
          >
            <Text style={{ fontSize: 32, textAlign: 'center' }}>{option.emoji}</Text>
            <Text
              style={[
                styles.moodLabel,
                {
                  fontFamily: theme.typography.body2.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                  color: selectedMood === option.type
                    ? getMoodColor(option.type)
                    : theme.colors.text.secondary,
                  marginTop: theme.spacing.xs,
                  textAlign: 'center',
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

// src/components/mood/MoodFactors.tsx
import React, { memo } from 'react';
import {
  View,
  ScrollView,
} from 'react-native';
import { Theme } from '../../theme/theme'; // Importiere den Theme-Typ

interface MoodFactorsProps {
  selectedFactors: string[];
  onToggleFactor: (factor: string) => void;
  theme: Theme; // Verwenden des korrekten Typs für theme
}

export const MoodFactors = memo(({ selectedFactors, onToggleFactor, theme }: MoodFactorsProps) => {
  // Vordefinierte Faktoren, die zur Stimmung beitragen können
  const factorOptions = [
    // Positive Faktoren
    'Schlaf', 'Ernährung', 'Sport', 'Sozialkontakte', 'Erfolg', 'Freizeit', 'Natur',
    'Meditation', 'Familie', 'Freunde', 'Therapie-Übungen',
    // Negative Faktoren
    'Stress', 'Arbeit', 'Konflikte', 'Gesundheit', 'Finanzen', 'Einsamkeit'
  ];

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          {
            fontFamily: theme.typography.subtitle1.fontFamily,
            fontSize: theme.typography.subtitle1.fontSize,
            fontWeight: theme.typography.subtitle1.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        Was hat deine Stimmung beeinflusst?
      </Text>
      
      <ScrollView 
        horizontal={false} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.factorsContainer}
      >
        <View style={styles.factorsGrid}>
          {factorOptions.map((factor) => (
            <TouchableOpacity
              key={factor}
              style={[
                styles.factorChip,
                {
                  backgroundColor: selectedFactors.includes(factor)
                    ? theme.colors.primary.main
                    : theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.round,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  margin: theme.spacing.xs,
                },
              ]}
              onPress={() => onToggleFactor(factor)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selectedFactors.includes(factor) }}
            >
              <Text
                style={{
                  fontFamily: theme.typography.body2.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                  color: selectedFactors.includes(factor)
                    ? theme.colors.text.inverse
                    : theme.colors.text.primary,
                }}
              >
                {factor}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

// src/screens/main/MoodTrackingScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MainScreenProps } from '../../types/navigation.types';
import { MoodSelector } from '../../components/mood/MoodSelector';
import { MoodFactors } from '../../components/mood/MoodFactors';
import { MoodType, MoodEntry } from '../../types/mood.types';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { Button } from '../../components/common/Button';

// Achte darauf, dass ENDPOINTS.MOOD existiert und die entsprechenden Pfade definiert sind
// Beispielweise solltest du etwas wie folgendes in deiner endpoints.ts haben:
// export const ENDPOINTS = {
//   MOOD: {
//     GET_TODAY: '/mood/today',
//     SAVE: '/mood',
//     HISTORY: '/mood/history',
//     STATS: '/mood/stats'
//   },
//   // ... andere Endpoints
// };

export const MoodTrackingScreen: React.FC<MainScreenProps<'MoodTracking'>> = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todaysMood, setTodaysMood] = useState<MoodEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Überprüfen, ob heute bereits eine Stimmung erfasst wurde
  useEffect(() => {
    const checkTodaysMood = async () => {
      try {
        setLoading(true);
        // In einer realen Implementierung würde hier ein API-Aufruf stehen
        // Beispiel:
        // const response = await apiClient.get<MoodEntry | null>(ENDPOINTS.MOOD.GET_TODAY);
        // setTodaysMood(response.data);
        
        // Simulieren wir einen erfolgreichen API-Call
        setTimeout(() => {
          // Für Demo-Zwecke nehmen wir an, dass keine Stimmung für heute existiert
          setTodaysMood(null);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Fehler beim Abrufen der heutigen Stimmung:', err);
        setError('Daten konnten nicht geladen werden.');
        setLoading(false);
      }
    };

    checkTodaysMood();
  }, []);

  // Handler für das Umschalten von Faktoren
  const handleToggleFactor = useCallback((factor: string) => {
    setSelectedFactors((prev) => {
      if (prev.includes(factor)) {
        return prev.filter((f) => f !== factor);
      } else {
        return [...prev, factor];
      }
    });
  }, []);

  // Speichern der Stimmung
  const handleSaveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Hinweis', 'Bitte wähle deine aktuelle Stimmung aus.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // In einer realen Implementierung würde hier ein API-Aufruf stehen
      // Beispiel:
      // await apiClient.post(ENDPOINTS.MOOD.SAVE, {
      //   mood: selectedMood,
      //   notes,
      //   factors: selectedFactors
      // });
      
      // Simulieren wir einen erfolgreichen API-Call
      setTimeout(() => {
        // Erfolgreiche Speicherung simulieren
        Alert.alert(
          'Erfolg',
          'Deine Stimmung wurde erfolgreich gespeichert.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setSaving(false);
      }, 1000);
    } catch (err) {
      console.error('Fehler beim Speichern der Stimmung:', err);
      setError('Stimmung konnte nicht gespeichert werden. Bitte versuche es später erneut.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  // Wenn bereits eine Stimmung für heute erfasst wurde
  if (todaysMood) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: theme.typography.h2.fontFamily,
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.lg,
                textAlign: 'center',
              },
            ]}
          >
            Deine Stimmung heute
          </Text>
          
          <View
            style={[
              styles.moodCard,
              {
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                ...theme.shadows.md,
              },
            ]}
          >
            {/* Hier würden die Details der heutigen Stimmung angezeigt */}
            <Text
              style={{
                fontFamily: theme.typography.h1.fontFamily,
                fontSize: 48,
                textAlign: 'center',
                marginBottom: theme.spacing.md,
              }}
            >
              {/* Emoji basierend auf der gespeicherten Stimmung */}
              {todaysMood.mood === 'verygood' && '😊'}
              {todaysMood.mood === 'good' && '🙂'}
              {todaysMood.mood === 'neutral' && '😐'}
              {todaysMood.mood === 'bad' && '😕'}
              {todaysMood.mood === 'verybad' && '😢'}
            </Text>
            
            <Text
              style={[
                styles.moodLabel,
                {
                  fontFamily: theme.typography.subtitle1.fontFamily,
                  fontSize: theme.typography.subtitle1.fontSize,
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                  marginBottom: theme.spacing.lg,
                },
              ]}
            >
              {/* Text basierend auf der gespeicherten Stimmung */}
              {todaysMood.mood === 'verygood' && 'Sehr gut'}
              {todaysMood.mood === 'good' && 'Gut'}
              {todaysMood.mood === 'neutral' && 'Neutral'}
              {todaysMood.mood === 'bad' && 'Schlecht'}
              {todaysMood.mood === 'verybad' && 'Sehr schlecht'}
            </Text>
            
            {todaysMood.factors && todaysMood.factors.length > 0 && (
              <View style={styles.factorsContainer}>
                <Text
                  style={[
                    styles.factorsTitle,
                    {
                      fontFamily: theme.typography.subtitle2.fontFamily,
                      fontSize: theme.typography.subtitle2.fontSize,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.sm,
                    },
                  ]}
                >
                  Einflussfaktoren:
                </Text>
                <View style={styles.factorsList}>
                  {todaysMood.factors.map((factor, index) => (
                    <View
                      key={index}
                      style={[
                        styles.factorChip,
                        {
                          backgroundColor: theme.colors.primary.light + '30',
                          borderRadius: theme.borderRadius.round,
                          paddingHorizontal: theme.spacing.md,
                          paddingVertical: theme.spacing.sm,
                          margin: theme.spacing.xs,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: theme.typography.body2.fontFamily,
                          fontSize: theme.typography.body2.fontSize,
                          color: theme.colors.text.primary,
                        }}
                      >
                        {factor}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            {todaysMood.notes && (
              <View style={styles.notesContainer}>
                <Text
                  style={[
                    styles.notesTitle,
                    {
                      fontFamily: theme.typography.subtitle2.fontFamily,
                      fontSize: theme.typography.subtitle2.fontSize,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.sm,
                    },
                  ]}
                >
                  Notizen:
                </Text>
                <Text
                  style={[
                    styles.notesText,
                    {
                      fontFamily: theme.typography.body1.fontFamily,
                      fontSize: theme.typography.body1.fontSize,
                      color: theme.colors.text.primary,
                    },
                  ]}
                >
                  {todaysMood.notes}
                </Text>
              </View>
            )}
          </View>
          
          <Button
            title="Zurück"
            onPress={() => navigation.goBack()}
            style={{ marginTop: theme.spacing.xl }}
            fullWidth
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Erfassungsansicht, wenn noch keine Stimmung für heute erfasst wurde
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: theme.typography.h2.fontFamily,
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.lg,
                textAlign: 'center',
              },
            ]}
          >
            Stimmungstracking
          </Text>
          
          {error && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: theme.colors.status.error + '20', // 20% Opacity
                  borderColor: theme.colors.status.error,
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
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
          
          <View
            style={[
              styles.moodCard,
              {
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
                marginBottom: theme.spacing.lg,
                ...theme.shadows.md,
              },
            ]}
          >
            <MoodSelector
              selectedMood={selectedMood}
              onSelect={setSelectedMood}
              theme={theme}
            />
            
            <View style={{ height: theme.spacing.lg }} /> {/* Abstand */}
            
            <MoodFactors
              selectedFactors={selectedFactors}
              onToggleFactor={handleToggleFactor}
              theme={theme}
            />
            
            <View style={{ height: theme.spacing.lg }} /> {/* Abstand */}
            
            <Text
              style={[
                styles.notesLabel,
                {
                  fontFamily: theme.typography.subtitle1.fontFamily,
                  fontSize: theme.typography.subtitle1.fontSize,
                  fontWeight: theme.typography.subtitle1.fontWeight,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              Persönliche Notizen (optional)
            </Text>
            <TextInput
              style={[
                styles.notesInput,
                {
                  fontFamily: theme.typography.body1.fontFamily,
                  fontSize: theme.typography.body1.fontSize,
                  color: theme.colors.text.primary,
                  backgroundColor: theme.colors.background.primary,
                  borderColor: theme.colors.neutral.light,
                  borderWidth: 1,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  textAlignVertical: 'top',
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Wie hast du dich heute gefühlt? Was ist passiert?"
              placeholderTextColor={theme.colors.text.hint}
              multiline
              numberOfLines={4}
            />
          </View>
          
          <Button
            title="Stimmung speichern"
            onPress={handleSaveMood}
            loading={saving}
            style={{ marginBottom: theme.spacing.md }}
            fullWidth
          />
          
          <Button
            title="Abbrechen"
            variant="outlined"
            onPress={() => navigation.goBack()}
            disabled={saving}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// src/screens/main/MoodHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MainScreenProps } from '../../types/navigation.types';
import { MoodEntry, MoodStats, MoodType } from '../../types/mood.types';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

export const MoodHistoryScreen: React.FC<MainScreenProps<'MoodHistory'>> = ({ navigation }) => {
  const { theme } = useTheme();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [moodStats, setMoodStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lade Stimmungsdaten und Statistiken
  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        setLoading(true);
        // In einer realen Implementierung würden hier API-Aufrufe stehen
        // Beispiel:
        // const entriesResponse = await apiClient.get<MoodEntry[]>(ENDPOINTS.MOOD.HISTORY);
        // const statsResponse = await apiClient.get<MoodStats>(ENDPOINTS.MOOD.STATS);
        // setMoodEntries(entriesResponse.data);
        // setMoodStats(statsResponse.data);
        
        // Simulieren wir erfolgreiche API-Calls
        
        // Dummy-Daten für Mood-Einträge
        const dummyEntries: MoodEntry[] = [
          {
            id: 1,
            date: '2023-05-25T08:30:00Z',
            mood: 'good',
            notes: 'Ein produktiver Tag mit viel Energie',
            factors: ['Sport', 'Ernährung', 'Erfolg']
          },
          {
            id: 2,
            date: '2023-05-24T09:15:00Z',
            mood: 'neutral',
            factors: ['Arbeit', 'Stress']
          },
          {
            id: 3,
            date: '2023-05-23T07:45:00Z',
            mood: 'verygood',
            notes: 'Toller Tag mit Freunden verbracht',
            factors: ['Freunde', 'Freizeit', 'Natur']
          },
          {
            id: 4,
            date: '2023-05-22T10:00:00Z',
            mood: 'bad',
            notes: 'Schlecht geschlafen und den ganzen Tag müde',
            factors: ['Schlaf', 'Stress']
          },
          {
            id: 5,
            date: '2023-05-21T08:00:00Z',
            mood: 'good',
            factors: ['Meditation', 'Therapie-Übungen']
          }
        ];
        
        // Dummy-Daten für Mood-Statistiken
        const dummyStats: MoodStats = {
          averageMood: 3.6, // Skala von 1-5
          moodCounts: {
            verygood: 1,
            good: 2,
            neutral: 1,
            bad: 1,
            verybad: 0
          },
          mostCommonMood: 'good',
          topFactors: [
            { factor: 'Stress', count: 2 },
            { factor: 'Sport', count: 1 },
            { factor: 'Freunde', count: 1 }
          ],
          streakDays: 5
        };
        
        setTimeout(() => {
          setMoodEntries(dummyEntries);
          setMoodStats(dummyStats);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Fehler beim Laden der Stimmungsdaten:', err);
        setError('Daten konnten nicht geladen werden.');
        setLoading(false);
      }
    };

    fetchMoodData();
  }, []);

  // Hilfsfunktion zur Formatierung des Datums
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Emoji basierend auf Stimmungstyp
  const getMoodEmoji = (mood: MoodType): string => {
    switch (mood) {
      case 'verygood': return '😊';
      case 'good': return '🙂';
      case 'neutral': return '😐';
      case 'bad': return '😕';
      case 'verybad': return '😢';
    }
  };

  // Farbe basierend auf Stimmungstyp
  const getMoodColor = (mood: MoodType): string => {
    switch (mood) {
      case 'verygood': return theme.colors.status.success;
      case 'good': return theme.colors.calming.main;
      case 'neutral': return theme.colors.primary.light;
      case 'bad': return theme.colors.status.warning;
      case 'verybad': return theme.colors.status.error;
    }
  };

  // Text basierend auf Stimmungstyp
  const getMoodText = (mood: MoodType): string => {
    switch (mood) {
      case 'verygood': return 'Sehr gut';
      case 'good': return 'Gut';
      case 'neutral': return 'Neutral';
      case 'bad': return 'Schlecht';
      case 'verybad': return 'Sehr schlecht';
    }
  };

  // Render eines Stimmungseintrags
  const renderMoodEntry = ({ item }: { item: MoodEntry }) => {
    return (
      <TouchableOpacity
        style={[
          styles.moodEntryCard,
          {
            backgroundColor: theme.colors.background.primary,
            borderLeftColor: getMoodColor(item.mood),
            borderLeftWidth: 4,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.md,
            padding: theme.spacing.md,
            ...theme.shadows.sm,
          },
        ]}
        onPress={() => {
          // In einer realen App würde hier eine Detailansicht geöffnet
          Alert.alert('Details', `Stimmung: ${getMoodText(item.mood)}\n${item.notes || 'Keine Notizen'}`);
        }}
      >
        <View style={styles.moodEntryHeader}>
          <Text
            style={[
              styles.moodEntryDate,
              {
                fontFamily: theme.typography.subtitle2.fontFamily,
                fontSize: theme.typography.subtitle2.fontSize,
                color: theme.colors.text.secondary,
              },
            ]}
          >
            {formatDate(item.date)}
          </Text>
          <Text style={{ fontSize: 24 }}>{getMoodEmoji(item.mood)}</Text>
        </View>
        
        {item.notes && (
          <Text
            style={[
              styles.moodEntryNotes,
              {
                fontFamily: theme.typography.body2.fontFamily,
                fontSize: theme.typography.body2.fontSize,
                color: theme.colors.text.primary,
                marginTop: theme.spacing.sm,
                marginBottom: item.factors && item.factors.length > 0 ? theme.spacing.sm : 0,
              },
            ]}
            numberOfLines={2}
          >
            {item.notes}
          </Text>
        )}
        
        {item.factors && item.factors.length > 0 && (
          <View style={styles.moodEntryFactors}>
            {item.factors.map((factor, index) => (
              <View
                key={index}
                style={[
                  styles.factorChip,
                  {
                    backgroundColor: theme.colors.primary.light + '20', // 20% Opacity
                    borderRadius: theme.borderRadius.round,
                    paddingHorizontal: theme.spacing.sm,
                    paddingVertical: 2,
                    marginRight: theme.spacing.xs,
                    marginTop: theme.spacing.xs,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: theme.typography.caption.fontFamily,
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.primary.main,
                  }}
                >
                  {factor}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: theme.typography.h2.fontFamily,
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.md,
              },
            ]}
          >
            Dein Stimmungsverlauf
          </Text>
          
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                backgroundColor: theme.colors.primary.main,
                borderRadius: theme.borderRadius.round,
                padding: theme.spacing.sm,
                ...theme.shadows.sm,
              },
            ]}
            onPress={() => navigation.navigate('MoodTracking')}
          >
            <Text style={{ color: theme.colors.text.inverse, fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
        
        {error ? (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: theme.colors.status.error + '20', // 20% Opacity
                borderColor: theme.colors.status.error,
                borderRadius: theme.borderRadius.md,
                borderWidth: 1,
                padding: theme.spacing.md,
                margin: theme.spacing.md,
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
        ) : (
          <>
            {/* Statistik-Bereich */}
            {moodStats && (
              <View
                style={[
                  styles.statsCard,
                  {
                    backgroundColor: theme.colors.primary.light + '15', // 15% Opacity
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    marginHorizontal: theme.spacing.md,
                    marginBottom: theme.spacing.lg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statsTitle,
                    {
                      fontFamily: theme.typography.subtitle1.fontFamily,
                      fontSize: theme.typography.subtitle1.fontSize,
                      fontWeight: theme.typography.subtitle1.fontWeight,
                      color: theme.colors.primary.dark,
                      marginBottom: theme.spacing.md,
                    },
                  ]}
                >
                  Deine Statistiken
                </Text>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text
                      style={{
                        fontFamily: theme.typography.h3.fontFamily,
                        fontSize: theme.typography.h3.fontSize,
                        fontWeight: theme.typography.h3.fontWeight,
                        color: theme.colors.primary.main,
                      }}
                    >
                      {moodStats.averageMood.toFixed(1)}
                    </Text>
                    <Text
                      style={{
                        fontFamily: theme.typography.body2.fontFamily,
                        fontSize: theme.typography.body2.fontSize,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      Durchschnitt
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text
                      style={{
                        fontFamily: theme.typography.h3.fontFamily,
                        fontSize: theme.typography.h3.fontSize,
                        fontWeight: theme.typography.h3.fontWeight,
                        color: theme.colors.primary.main,
                      }}
                    >
                      {getMoodEmoji(moodStats.mostCommonMood)}
                    </Text>
                    <Text
                      style={{
                        fontFamily: theme.typography.body2.fontFamily,
                        fontSize: theme.typography.body2.fontSize,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      Häufigste
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text
                      style={{
                        fontFamily: theme.typography.h3.fontFamily,
                        fontSize: theme.typography.h3.fontSize,
                        fontWeight: theme.typography.h3.fontWeight,
                        color: theme.colors.primary.main,
                      }}
                    >
                      {moodStats.streakDays}
                    </Text>
                    <Text
                      style={{
                        fontFamily: theme.typography.body2.fontFamily,
                        fontSize: theme.typography.body2.fontSize,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      Tage Serie
                    </Text>
                  </View>
                </View>
                
                {moodStats.topFactors.length > 0 && (
                  <View style={styles.topFactorsContainer}>
                    <Text
                      style={{
                        fontFamily: theme.typography.body2.fontFamily,
                        fontSize: theme.typography.body2.fontSize,
                        color: theme.colors.text.secondary,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Top Einflussfaktoren:
                    </Text>
                    <View style={styles.topFactorsList}>
                      {moodStats.topFactors.map((factor, index) => (
                        <Text
                          key={index}
                          style={{
                            fontFamily: theme.typography.body2.fontFamily,
                            fontSize: theme.typography.body2.fontSize,
                            color: theme.colors.primary.dark,
                            marginRight: theme.spacing.md,
                          }}
                        >
                          {factor.factor} ({factor.count}×)
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {/* Liste der Stimmungseinträge */}
            <FlatList
              data={moodEntries}
              renderItem={renderMoodEntry}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: theme.spacing.md }}
              ListEmptyComponent={
                <Text
                  style={{
                    fontFamily: theme.typography.body1.fontFamily,
                    fontSize: theme.typography.body1.fontSize,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                    marginTop: theme.spacing.xl,
                  }}
                >
                  Keine Stimmungseinträge gefunden.
                </Text>
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

// Vollständiges StyleSheet mit allen erforderlichen Stilen
const styles = StyleSheet.create({
  // Allgemeine Stile
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 12,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  
  // MoodSelector Stile
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: '18%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodLabel: {
    textAlign: 'center',
  },
  
  // MoodFactors Stile
  factorsContainer: {
    paddingVertical: 8,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  factorChip: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  
  // MoodTrackingScreen Stile
  moodCard: {
    padding: 16,
    marginBottom: 16,
  },
  notesLabel: {
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 100,
    padding: 8,
  },
  factorsTitle: {
    marginBottom: 8,
  },
  factorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  notesContainer: {
    marginTop: 16,
  },
  notesTitle: {
    marginBottom: 8,
  },
  notesText: {
    lineHeight: 20,
  },
  
  // MoodHistoryScreen Stile
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEntryCard: {
    marginBottom: 12,
    padding: 12,
  },
  moodEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodEntryDate: {
    flex: 1,
  },
  moodEntryNotes: {
    marginVertical: 8,
  },
  moodEntryFactors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  statsCard: {
    padding: 16,
    marginBottom: 16,
  },
  statsTitle: {
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  topFactorsContainer: {
    marginTop: 12,
  },
  topFactorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  }
});