import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { MainScreenProps } from '../../types/navigation.types';
import { TherapyExercise, DailyPrompt } from '../../types/therapy.types';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

export const HomeScreen: React.FC<MainScreenProps<'Home'>> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exercises, setExercises] = useState<TherapyExercise[]>([]);
  const [dailyPrompt, setDailyPrompt] = useState<DailyPrompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Daten beim ersten Laden und beim Pull-to-Refresh abrufen
  const fetchData = async () => {
    try {
      setError(null);
      
      // Übungen abrufen
      const exercisesResponse = await apiClient.get<TherapyExercise[]>(ENDPOINTS.THERAPY.EXERCISES);
      setExercises(exercisesResponse.data);
      
      // Täglichen Prompt abrufen
      const promptResponse = await apiClient.get<DailyPrompt[]>(ENDPOINTS.THERAPY.DAILY_PROMPTS);
      if (promptResponse.data.length > 0) {
        setDailyPrompt(promptResponse.data[0]); // Den neuesten Prompt nehmen
      }
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err);
      setError('Daten konnten nicht geladen werden. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Übung als abgeschlossen markieren
  const handleCompleteExercise = async (exerciseId: number) => {
    try {
      await apiClient.post(ENDPOINTS.THERAPY.EXERCISE_COMPLETE(exerciseId));
      
      // Übung in der Liste als abgeschlossen markieren
      setExercises(prevExercises =>
        prevExercises.map(ex =>
          ex.id === exerciseId
            ? { ...ex, completedAt: new Date().toISOString() }
            : ex
        )
      );
    } catch (err) {
      console.error('Fehler beim Markieren der Übung als abgeschlossen:', err);
    }
  };

  // Übungsdetails anzeigen
  const handleExercisePress = (exerciseId: number) => {
    navigation.navigate('ExerciseDetail', { exerciseId });
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.greeting,
                {
                  fontFamily: theme.typography.h2.fontFamily,
                  fontSize: theme.typography.h2.fontSize,
                  fontWeight: theme.typography.h2.fontWeight,
                  color: theme.colors.text.primary,
                },
              ]}
            >
              Hallo, {user?.firstName || user?.username || 'Nutzer'}!
            </Text>
            <Text
              style={[
                styles.subGreeting,
                {
                  fontFamily: theme.typography.body1.fontFamily,
                  fontSize: theme.typography.body1.fontSize,
                  color: theme.colors.text.secondary,
                },
              ]}
            >
              Wie geht es dir heute?
            </Text>
          </View>
          
          {/* Profilbild (Platzhalter) */}
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.colors.primary.light,
                borderColor: theme.colors.background.primary,
              },
            ]}
          >
            <Text style={{ color: theme.colors.text.inverse }}>
              {(user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Fehleranzeige */}
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

        {/* Täglicher Prompt */}
        {dailyPrompt && (
          <View
            style={[
              styles.promptContainer,
              {
                backgroundColor: theme.colors.calming.lightest,
                borderColor: theme.colors.calming.light,
              },
            ]}
          >
            <Text
              style={[
                styles.promptTitle,
                {
                  fontFamily: theme.typography.subtitle1.fontFamily,
                  fontSize: theme.typography.subtitle1.fontSize,
                  fontWeight: theme.typography.subtitle1.fontWeight,
                  color: theme.colors.calming.dark,
                },
              ]}
            >
              Tägliche Reflexion
            </Text>
            <Text
              style={[
                styles.promptContent,
                {
                  fontFamily: theme.typography.body1.fontFamily,
                  fontSize: theme.typography.body1.fontSize,
                  color: theme.colors.text.primary,
                },
              ]}
            >
              {dailyPrompt.content}
            </Text>
            
            <View style={styles.promptTypeContainer}>
              <Text
                style={[
                  styles.promptType,
                  {
                    fontFamily: theme.typography.caption.fontFamily,
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.calming.dark,
                    backgroundColor: theme.colors.calming.main + '30', // 30% Opacity
                  },
                ]}
              >
                {dailyPrompt.type === 'reflection'
                  ? 'Selbstreflexion'
                  : dailyPrompt.type === 'gratitude'
                  ? 'Dankbarkeit'
                  : dailyPrompt.type === 'challenge'
                  ? 'Herausforderung'
                  : 'Achtsamkeit'}
              </Text>
            </View>
          </View>
        )}

        {/* Übungsabschnitt */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              {
                fontFamily: theme.typography.h3.fontFamily,
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              },
            ]}
          >
            Empfohlene Übungen
          </Text>
          
          {/* Liste der Übungen */}
          {exercises.length === 0 ? (
            <Text
              style={{
                fontFamily: theme.typography.body2.fontFamily,
                fontSize: theme.typography.body2.fontSize,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                marginTop: theme.spacing.lg,
              }}
            >
              Keine Übungen verfügbar. Ziehe nach unten, um zu aktualisieren.
            </Text>
          ) : (
            exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onPress={() => handleExercisePress(exercise.id)}
                onComplete={() => handleCompleteExercise(exercise.id)}
                theme={theme}
              />
            ))
          )}
        </View>

        {/* Gamification-Abschnitt */}
        <View
          style={[
            styles.streakContainer,
            {
              backgroundColor: theme.colors.primary.light + '20', // 20% Opacity
              borderColor: theme.colors.primary.light,
            },
          ]}
        >
          <View style={styles.streakInfo}>
            <Text
              style={[
                styles.streakTitle,
                {
                  fontFamily: theme.typography.subtitle1.fontFamily,
                  fontSize: theme.typography.subtitle1.fontSize,
                  fontWeight: theme.typography.subtitle1.fontWeight,
                  color: theme.colors.primary.dark,
                },
              ]}
            >
              Aktuelle Serie
            </Text>
            <Text
              style={[
                styles.streakValue,
                {
                  fontFamily: theme.typography.h2.fontFamily,
                  fontSize: theme.typography.h2.fontSize,
                  fontWeight: theme.typography.h2.fontWeight,
                  color: theme.colors.primary.main,
                },
              ]}
            >
              {user?.streakDays || 0} Tage
            </Text>
            <Text
              style={[
                styles.streakSubtext,
                {
                  fontFamily: theme.typography.body2.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                  color: theme.colors.text.secondary,
                },
              ]}
            >
              Mach weiter so! Regelmäßige Übungen helfen dir am meisten.
            </Text>
          </View>
          
          {/* Feuersymbol als Platzhalter für ein Icon */}
          <View
            style={[
              styles.streakIcon,
              {
                backgroundColor: theme.colors.primary.main,
              },
            ]}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>🔥</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Übungskarten-Komponente
interface ExerciseCardProps {
  exercise: TherapyExercise;
  onPress: () => void;
  onComplete: () => void;
  theme: any;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onPress,
  onComplete,
  theme,
}) => {
  const isCompleted = !!exercise.completedAt;
  
  // Icon-Platzhalter basierend auf dem Übungstyp
  const getExerciseIcon = () => {
    switch (exercise.type) {
      case 'meditation':
        return '🧘‍♀️';
      case 'journaling':
        return '📝';
      case 'breathwork':
        return '💨';
      case 'cognitive':
        return '🧠';
      case 'behavioral':
        return '🏃‍♂️';
      default:
        return '📋';
    }
  };

  // Typ auf Deutsch
  const getExerciseTypeText = () => {
    switch (exercise.type) {
      case 'meditation':
        return 'Meditation';
      case 'journaling':
        return 'Journaling';
      case 'breathwork':
        return 'Atemübung';
      case 'cognitive':
        return 'Kognitive Übung';
      case 'behavioral':
        return 'Verhaltensübung';
      default:
        return exercise.type;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.exerciseCard,
        {
          backgroundColor: isCompleted
            ? theme.colors.calming.lightest
            : theme.colors.background.primary,
          borderColor: isCompleted
            ? theme.colors.calming.light
            : theme.colors.neutral.light,
          ...theme.shadows.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.exerciseIcon,
          {
            backgroundColor: isCompleted
              ? theme.colors.calming.main
              : theme.colors.primary.light,
          },
        ]}
      >
        <Text style={{ fontSize: 16 }}>{getExerciseIcon()}</Text>
      </View>
      
      <View style={styles.exerciseContent}>
        <Text
          style={[
            styles.exerciseTitle,
            {
              fontFamily: theme.typography.subtitle1.fontFamily,
              fontSize: theme.typography.subtitle1.fontSize,
              fontWeight: theme.typography.subtitle1.fontWeight,
              color: theme.colors.text.primary,
            },
          ]}
        >
          {exercise.title}
        </Text>
        
        <View style={styles.exerciseMetaContainer}>
          <Text
            style={[
              styles.exerciseType,
              {
                fontFamily: theme.typography.caption.fontFamily,
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              },
            ]}
          >
            {getExerciseTypeText()}
          </Text>
          
          <Text
            style={[
              styles.exerciseDuration,
              {
                fontFamily: theme.typography.caption.fontFamily,
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              },
            ]}
          >
            {exercise.durationMinutes} Min
          </Text>
          
          <Text
            style={[
              styles.exercisePoints,
              {
                fontFamily: theme.typography.caption.fontFamily,
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.primary.main,
              },
            ]}
          >
            {exercise.points} Punkte
          </Text>
        </View>
      </View>
      
      {isCompleted ? (
        <View
          style={[
            styles.completedBadge,
            {
              backgroundColor: theme.colors.calming.main,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.text.inverse,
              fontFamily: theme.typography.caption.fontFamily,
              fontSize: theme.typography.caption.fontSize,
              fontWeight: '500',
            }}
          >
            ✓
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.completeButton,
            {
              backgroundColor: theme.colors.primary.main,
            },
          ]}
          onPress={(e) => {
            e.stopPropagation(); // Verhindern, dass onPress des Parent ausgelöst wird
            onComplete();
          }}
        >
          <Text
            style={{
              color: theme.colors.text.inverse,
              fontFamily: theme.typography.button.fontFamily,
              fontSize: 12,
              fontWeight: '500',
            }}
          >
            Fertig
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    marginBottom: 4,
  },
  subGreeting: {},
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  errorContainer: {
    margin: 24,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  promptContainer: {
    margin: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  promptTitle: {
    marginBottom: 8,
  },
  promptContent: {
    marginBottom: 16,
  },
  promptTypeContainer: {
    alignSelf: 'flex-start',
  },
  promptType: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionContainer: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseTitle: {
    marginBottom: 4,
  },
  exerciseMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  exerciseType: {
    marginRight: 12,
  },
  exerciseDuration: {
    marginRight: 12,
  },
  exercisePoints: {},
  completeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakContainer: {
    margin: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    marginBottom: 4,
  },
  streakValue: {
    marginBottom: 8,
  },
  streakSubtext: {},
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
});