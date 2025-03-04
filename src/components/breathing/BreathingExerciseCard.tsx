// src/components/breathing/BreathingExerciseCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BreathingTechnique } from '../../types/breathing.types';

interface BreathingExerciseCardProps {
  technique: BreathingTechnique;
  onPress: () => void;
}

export const BreathingExerciseCard: React.FC<BreathingExerciseCardProps> = ({
  technique,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.calming.lightest,
          borderColor: theme.colors.calming.light,
          borderWidth: 1,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          ...theme.shadows.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.calming.main,
              borderRadius: theme.borderRadius.round,
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: theme.spacing.md,
            },
          ]}
        >
          <Text style={{ fontSize: 18 }}>💨</Text>
        </View>
        
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: theme.typography.subtitle1.fontFamily,
                fontSize: theme.typography.subtitle1.fontSize,
                fontWeight: theme.typography.subtitle1.fontWeight,
                color: theme.colors.text.primary,
              },
            ]}
          >
            {technique.name} Atemtechnik
          </Text>
          
          <Text
            style={[
              styles.duration,
              {
                fontFamily: theme.typography.caption.fontFamily,
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.text.secondary,
              },
            ]}
          >
            {technique.duration} Minuten
          </Text>
        </View>
      </View>
      
      <Text
        style={[
          styles.description,
          {
            fontFamily: theme.typography.body2.fontFamily,
            fontSize: theme.typography.body2.fontSize,
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.md,
          },
        ]}
        numberOfLines={2}
      >
        {technique.description}
      </Text>
      
      <View style={styles.tagsContainer}>
        {technique.recommendedFor.slice(0, 3).map((tag, index) => (
          <View
            key={index}
            style={[
              styles.tag,
              {
                backgroundColor: theme.colors.calming.main + '30', // 30% Opacity
                borderRadius: theme.borderRadius.round,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                marginRight: theme.spacing.xs,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: theme.typography.caption.fontFamily,
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.calming.dark,
              }}
            >
              {tag}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {},
  titleContainer: {
    flex: 1,
  },
  title: {},
  duration: {},
  description: {},
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {},
});

// src/components/breathing/BreathingExercisesList.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../types/navigation.types';
import { BreathingTechnique } from '../../types/breathing.types';
import { BreathingExerciseCard } from './BreathingExerciseCard';

// Dummy-Daten für Atemübungen
const breathingTechniques: BreathingTechnique[] = [
  {
    id: 1,
    name: '4-7-8',
    description: 'Eine beruhigende Atemtechnik, die hilft, Stress abzubauen und Schlaf zu fördern.',
    benefits: [
      'Reduziert Stress und Angst',
      'Fördert besseren Schlaf',
      'Hilft bei Entspannung',
    ],
    pattern: {
      name: '4-7-8',
      description: 'Einatmen, halten, ausatmen',
      inhaleTime: 4,
      holdInTime: 7,
      exhaleTime: 8,
      holdOutTime: 0,
      cycles: 4,
    },
    recommendedFor: ['Stress', 'Schlaflosigkeit', 'Angst'],
    difficultyLevel: 'beginner',
    duration: 3,
  },
  {
    id: 2,
    name: 'Box Breathing',
    description: 'Eine ausgleichende Technik, die von Spezialeinheiten und Athleten genutzt wird, um Ruhe und Fokus zu fördern.',
    benefits: [
      'Verbessert Konzentration',
      'Reduziert Stress',
      'Steigert die Leistungsfähigkeit',
    ],
    pattern: {
      name: 'Box Breathing',
      description: 'Quadratisches Atmen: Einatmen, halten, ausatmen, halten',
      inhaleTime: 4,
      holdInTime: 4,
      exhaleTime: 4,
      holdOutTime: 4,
      cycles: 5,
    },
    recommendedFor: ['Konzentration', 'Leistung', 'Stress'],
    difficultyLevel: 'intermediate',
    duration: 4,
  },
  {
    id: 3,
    name: 'Tiefe Bauchatmung',
    description: 'Eine einfache, entspannende Atemtechnik, die Stress reduziert und den Parasympathikus aktiviert.',
    benefits: [
      'Aktiviert Entspannungsreaktion',
      'Senkt Blutdruck und Herzfrequenz',
      'Reduziert Stresshormone',
    ],
    pattern: {
      name: 'Tiefe Bauchatmung',
      description: 'Langsames, tiefes Ein- und Ausatmen',
      inhaleTime: 4,
      holdInTime: 0,
      exhaleTime: 6,
      holdOutTime: 2,
      cycles: 10,
    },
    recommendedFor: ['Entspannung', 'Anfänger', 'Stress'],
    difficultyLevel: 'beginner',
    duration: 5,
  },
];

interface BreathingExercisesListProps {
  showTitle?: boolean;
  limit?: number;
  style?: object;
}

export const BreathingExercisesList: React.FC<BreathingExercisesListProps> = ({
  showTitle = true,
  limit,
  style,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
  
  const displayedTechniques = limit ? breathingTechniques.slice(0, limit) : breathingTechniques;
  
  const handleExercisePress = (technique: BreathingTechnique) => {
    navigation.navigate('BreathingExercise', {
      exerciseId: technique.id,
      duration: technique.duration,
      technique: technique.name,
    });
  };

  return (
    <View style={[styles.container, style]}>
      {showTitle && (
        <View style={styles.headerContainer}>
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
            Atemübungen
          </Text>
          
          {limit && (
            <TouchableOpacity
              onPress={() => {
                // In einer realen App würden wir zu einer eigenen BreathingExercises-Übersichtsseite navigieren
                console.log('Mehr Atemübungen anzeigen');
              }}
            >
              <Text
                style={{
                  fontFamily: theme.typography.button.fontFamily,
                  fontSize: theme.typography.button.fontSize,
                  color: theme.colors.primary.main,
                }}
              >
                Alle anzeigen
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {displayedTechniques.map((technique) => (
        <BreathingExerciseCard
          key={technique.id}
          technique={technique}
          onPress={() => handleExercisePress(technique)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {},
});

// Update des HomeScreen zur Integration der Atemübungen
// Füge diesen Import zum HomeScreen hinzu:
// import { BreathingExercisesList } from '../../components/breathing/BreathingExercisesList';

/*
Dann füge diesen Code nach dem "Empfohlene Übungen" Abschnitt in der return-Anweisung des HomeScreen ein:

{/* Atemübungen-Abschnitt *//*}
<View style={styles.sectionContainer}>
  <BreathingExercisesList 
    limit={2} 
    style={{ marginTop: theme.spacing.lg }}
  />
</View>
*/