// src/types/breathing.types.ts
export type BreathingPattern = {
    name: string;
    description: string;
    inhaleTime: number; // in Sekunden
    holdInTime: number; // in Sekunden, 0 wenn kein Halten
    exhaleTime: number; // in Sekunden
    holdOutTime: number; // in Sekunden, 0 wenn kein Halten
    cycles: number; // Anzahl der Wiederholungen
  };
  
  export type BreathingTechnique = {
    id: number;
    name: string;
    description: string;
    benefits: string[];
    pattern: BreathingPattern;
    recommendedFor: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // Geschätzte Dauer in Minuten
    videoUrl?: string;
  };
  
  // src/screens/main/BreathingExerciseScreen.tsx
  import React, { useState, useEffect, useRef } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Animated,
    Easing,
    BackHandler,
    Alert,
    Platform,
  } from 'react-native';
  import { useFocusEffect } from '@react-navigation/native';
  import { useTheme } from '../../context/ThemeContext';
  import { MainScreenProps } from '../../types/navigation.types';
  import { Button } from '../../components/common/Button';
  import { BreathingTechnique } from '../../types/breathing.types';
  
  export const BreathingExerciseScreen: React.FC<MainScreenProps<'BreathingExercise'>> = ({
    navigation,
    route,
  }) => {
    const { theme } = useTheme();
    const { exerciseId = 1, duration = 3, technique = '4-7-8' } = route.params || {};
  
    // Status-States
    const [isExerciseActive, setIsExerciseActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale');
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [currentCycle, setCurrentCycle] = useState(1);
    
    // Animation-Refs
    const breathAnimation = useRef(new Animated.Value(0.3)).current;
    const phaseTextOpacity = useRef(new Animated.Value(1)).current;
    
    // Timer-Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const exerciseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
    // Breathing Technique (würde in einer realen App von einer API oder aus einem Redux-Store geladen)
    const breathingTechnique: BreathingTechnique = {
      id: exerciseId,
      name: technique,
      description: 'Diese Atemtechnik hilft, dich zu beruhigen und zu fokussieren.',
      benefits: [
        'Reduziert Stress und Angst',
        'Verbessert den Fokus',
        'Fördert einen ruhigen Schlaf'
      ],
      pattern: {
        name: technique,
        description: 'Einatmen, halten, ausatmen, halten',
        inhaleTime: technique === '4-7-8' ? 4 : 4,
        holdInTime: technique === '4-7-8' ? 7 : 0,
        exhaleTime: technique === '4-7-8' ? 8 : 6,
        holdOutTime: technique === '4-7-8' ? 0 : 2,
        cycles: Math.ceil((duration * 60) / (
          (technique === '4-7-8' ? 4 + 7 + 8 : 4 + 6 + 2)
        )),
      },
      recommendedFor: ['Stress', 'Schlafprobleme', 'Angst'],
      difficultyLevel: 'beginner',
      duration: duration,
    };
  
    // Übung starten
    const startExercise = () => {
      setIsExerciseActive(true);
      setCurrentCycle(1);
      setCurrentPhase('inhale');
      setSecondsLeft(breathingTechnique.pattern.inhaleTime);
      startTimer();
  
      // Gesamte Übungsdauer setzen (in einer realen App würden wir den Timer für jede Phase individuell berechnen)
      const totalTime = breathingTechnique.pattern.cycles * (
        breathingTechnique.pattern.inhaleTime +
        breathingTechnique.pattern.holdInTime +
        breathingTechnique.pattern.exhaleTime +
        breathingTechnique.pattern.holdOutTime
      );
  
      // Timer für das Ende der Übung
      exerciseTimeoutRef.current = setTimeout(() => {
        completeExercise();
      }, totalTime * 1000);
    };
  
    // Timer-Logik
    const startTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
  
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            moveToNextPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };
  
    // Zur nächsten Atemphase wechseln
    const moveToNextPhase = () => {
      // Text-Animation
      Animated.sequence([
        Animated.timing(phaseTextOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(phaseTextOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]).start();
  
      // Wechsel zum nächsten Schritt
      if (currentPhase === 'inhale') {
        if (breathingTechnique.pattern.holdInTime > 0) {
          setCurrentPhase('holdIn');
          setSecondsLeft(breathingTechnique.pattern.holdInTime);
        } else {
          setCurrentPhase('exhale');
          setSecondsLeft(breathingTechnique.pattern.exhaleTime);
        }
      } else if (currentPhase === 'holdIn') {
        setCurrentPhase('exhale');
        setSecondsLeft(breathingTechnique.pattern.exhaleTime);
      } else if (currentPhase === 'exhale') {
        if (breathingTechnique.pattern.holdOutTime > 0) {
          setCurrentPhase('holdOut');
          setSecondsLeft(breathingTechnique.pattern.holdOutTime);
        } else {
          // Nächster Zyklus beginnt
          if (currentCycle < breathingTechnique.pattern.cycles) {
            setCurrentCycle((prev) => prev + 1);
            setCurrentPhase('inhale');
            setSecondsLeft(breathingTechnique.pattern.inhaleTime);
          } else {
            completeExercise();
          }
        }
      } else if (currentPhase === 'holdOut') {
        // Nächster Zyklus beginnt
        if (currentCycle < breathingTechnique.pattern.cycles) {
          setCurrentCycle((prev) => prev + 1);
          setCurrentPhase('inhale');
          setSecondsLeft(breathingTechnique.pattern.inhaleTime);
        } else {
          completeExercise();
        }
      }
    };
  
    // Übung abschließen
    const completeExercise = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
  
      if (exerciseTimeoutRef.current) {
        clearTimeout(exerciseTimeoutRef.current);
        exerciseTimeoutRef.current = null;
      }
  
      setIsExerciseActive(false);
      setIsCompleted(true);
  
      // In einer realen App würden wir hier den Übungsabschluss an den Server senden
      // und Punkte/Erfolge freischalten
    };
  
    // Übung abbrechen
    const cancelExercise = () => {
      Alert.alert(
        'Übung beenden?',
        'Möchtest du die Atemübung wirklich beenden?',
        [
          {
            text: 'Abbrechen',
            style: 'cancel',
          },
          {
            text: 'Beenden',
            onPress: () => {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              if (exerciseTimeoutRef.current) {
                clearTimeout(exerciseTimeoutRef.current);
                exerciseTimeoutRef.current = null;
              }
              navigation.goBack();
            },
          },
        ],
        { cancelable: true }
      );
    };
  
    // Navigation zurück verhindern, wenn Übung aktiv
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          if (isExerciseActive) {
            cancelExercise();
            return true;
          }
          return false;
        };
  
        // Android Back-Button-Handler
        BackHandler.addEventListener('hardwareBackPress', onBackPress);
  
        return () => {
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
          // Cleanup Timer bei unmount
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (exerciseTimeoutRef.current) {
            clearTimeout(exerciseTimeoutRef.current);
          }
        };
      }, [isExerciseActive])
    );
  
    // Atmen-Animation basierend auf der aktuellen Phase
    useEffect(() => {
      let toValue = 0.3; // Default/Start-Größe (collapsed)
      let duration = 1000; // Default-Dauer
  
      if (isExerciseActive) {
        if (currentPhase === 'inhale') {
          toValue = 1; // Vollständig expandiert
          duration = breathingTechnique.pattern.inhaleTime * 1000;
        } else if (currentPhase === 'exhale') {
          toValue = 0.3; // Zurück zur Start-Größe
          duration = breathingTechnique.pattern.exhaleTime * 1000;
        }
  
        Animated.timing(breathAnimation, {
          toValue,
          duration,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }).start();
      }
    }, [currentPhase, isExerciseActive]);
  
    // Text für die aktuelle Phase
    const getPhaseText = () => {
      switch (currentPhase) {
        case 'inhale':
          return 'Einatmen';
        case 'holdIn':
          return 'Halten';
        case 'exhale':
          return 'Ausatmen';
        case 'holdOut':
          return 'Pause';
        default:
          return '';
      }
    };
  
    // Animation Scale-Werte berechnen
    const scale = breathAnimation.interpolate({
      inputRange: [0.3, 1],
      outputRange: [0.3, 1],
    });
  
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <View style={styles.container}>
          {!isExerciseActive && !isCompleted && (
            <View style={styles.infoContainer}>
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
                {breathingTechnique.name} Atemtechnik
              </Text>
  
              <Text
                style={[
                  styles.description,
                  {
                    fontFamily: theme.typography.body1.fontFamily,
                    fontSize: theme.typography.body1.fontSize,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.lg,
                    textAlign: 'center',
                  },
                ]}
              >
                {breathingTechnique.description}
              </Text>
  
              <View
                style={[
                  styles.patternCard,
                  {
                    backgroundColor: theme.colors.calming.lightest,
                    borderColor: theme.colors.calming.light,
                    borderWidth: 1,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.lg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.patternTitle,
                    {
                      fontFamily: theme.typography.subtitle1.fontFamily,
                      fontSize: theme.typography.subtitle1.fontSize,
                      fontWeight: theme.typography.subtitle1.fontWeight,
                      color: theme.colors.calming.dark,
                      marginBottom: theme.spacing.md,
                    },
                  ]}
                >
                  So funktioniert's:
                </Text>
  
                <Text
                  style={[
                    styles.patternStep,
                    {
                      fontFamily: theme.typography.body2.fontFamily,
                      fontSize: theme.typography.body2.fontSize,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.sm,
                    },
                  ]}
                >
                  • Einatmen: {breathingTechnique.pattern.inhaleTime} Sekunden
                </Text>
                
                {breathingTechnique.pattern.holdInTime > 0 && (
                  <Text
                    style={[
                      styles.patternStep,
                      {
                        fontFamily: theme.typography.body2.fontFamily,
                        fontSize: theme.typography.body2.fontSize,
                        color: theme.colors.text.primary,
                        marginBottom: theme.spacing.sm,
                      },
                    ]}
                  >
                    • Luft anhalten: {breathingTechnique.pattern.holdInTime} Sekunden
                  </Text>
                )}
                
                <Text
                  style={[
                    styles.patternStep,
                    {
                      fontFamily: theme.typography.body2.fontFamily,
                      fontSize: theme.typography.body2.fontSize,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.sm,
                    },
                  ]}
                >
                  • Ausatmen: {breathingTechnique.pattern.exhaleTime} Sekunden
                </Text>
                
                {breathingTechnique.pattern.holdOutTime > 0 && (
                  <Text
                    style={[
                      styles.patternStep,
                      {
                        fontFamily: theme.typography.body2.fontFamily,
                        fontSize: theme.typography.body2.fontSize,
                        color: theme.colors.text.primary,
                        marginBottom: theme.spacing.sm,
                      },
                    ]}
                  >
                    • Pause: {breathingTechnique.pattern.holdOutTime} Sekunden
                  </Text>
                )}
                
                <Text
                  style={[
                    styles.patternStep,
                    {
                      fontFamily: theme.typography.body2.fontFamily,
                      fontSize: theme.typography.body2.fontSize,
                      color: theme.colors.text.primary,
                    },
                  ]}
                >
                  • Wiederhole: {breathingTechnique.pattern.cycles} mal
                </Text>
              </View>
  
              <Text
                style={[
                  styles.benefitsTitle,
                  {
                    fontFamily: theme.typography.subtitle1.fontFamily,
                    fontSize: theme.typography.subtitle1.fontSize,
                    fontWeight: theme.typography.subtitle1.fontWeight,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.sm,
                  },
                ]}
              >
                Vorteile:
              </Text>
  
              {breathingTechnique.benefits.map((benefit, index) => (
                <Text
                  key={index}
                  style={[
                    styles.benefitText,
                    {
                      fontFamily: theme.typography.body2.fontFamily,
                      fontSize: theme.typography.body2.fontSize,
                      color: theme.colors.text.secondary,
                      marginBottom: index === breathingTechnique.benefits.length - 1 ? theme.spacing.xl : theme.spacing.xs,
                    },
                  ]}
                >
                  • {benefit}
                </Text>
              ))}
  
              <Button
                title="Übung starten"
                onPress={startExercise}
                fullWidth
              />
              
              <Button
                title="Zurück"
                variant="outlined"
                onPress={() => navigation.goBack()}
                style={{ marginTop: theme.spacing.md }}
                fullWidth
              />
            </View>
          )}
  
          {isExerciseActive && (
            <View style={styles.exerciseActiveContainer}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    position: 'absolute',
                    top: Platform.OS === 'ios' ? 10 : 20,
                    right: 20,
                    zIndex: 10,
                  },
                ]}
                onPress={cancelExercise}
              >
                <Text style={{ fontSize: 24, color: theme.colors.text.secondary }}>✕</Text>
              </TouchableOpacity>
  
              <View style={styles.cycleInfo}>
                <Text
                  style={[
                    styles.cycleText,
                    {
                      fontFamily: theme.typography.subtitle2.fontFamily,
                      fontSize: theme.typography.subtitle2.fontSize,
                      color: theme.colors.text.secondary,
                    },
                  ]}
                >
                  Zyklus {currentCycle} von {breathingTechnique.pattern.cycles}
                </Text>
              </View>
  
              <View style={styles.breathCircleContainer}>
                <Animated.View
                  style={[
                    styles.breathCircle,
                    {
                      backgroundColor: 
                        currentPhase === 'inhale' || currentPhase === 'holdIn'
                          ? theme.colors.primary.light
                          : theme.colors.calming.main,
                      transform: [{ scale }],
                    },
                  ]}
                />
              </View>
  
              <Animated.View
                style={[
                  styles.phaseContainer,
                  {
                    opacity: phaseTextOpacity,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.phaseText,
                    {
                      fontFamily: theme.typography.h3.fontFamily,
                      fontSize: theme.typography.h3.fontSize,
                      fontWeight: theme.typography.h3.fontWeight,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.sm,
                    },
                  ]}
                >
                  {getPhaseText()}
                </Text>
                <Text
                  style={[
                    styles.secondsText,
                    {
                      fontFamily: theme.typography.h4.fontFamily,
                      fontSize: theme.typography.h4.fontSize,
                      color: theme.colors.primary.main,
                    },
                  ]}
                >
                  {secondsLeft} Sekunden
                </Text>
              </Animated.View>
            </View>
          )}
  
          {isCompleted && (
            <View style={styles.completedContainer}>
              <Text
                style={[
                  styles.completedTitle,
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
                Übung abgeschlossen!
              </Text>
  
              <View
                style={[
                  styles.completedCircle,
                  {
                    backgroundColor: theme.colors.calming.lightest,
                    borderColor: theme.colors.calming.main,
                    borderWidth: 3,
                  },
                ]}
              >
                <Text style={{ fontSize: 64 }}>🎉</Text>
              </View>
  
              <Text
                style={[
                  styles.completedMessage,
                  {
                    fontFamily: theme.typography.body1.fontFamily,
                    fontSize: theme.typography.body1.fontSize,
                    color: theme.colors.text.primary,
                    marginTop: theme.spacing.xl,
                    marginBottom: theme.spacing.lg,
                    textAlign: 'center',
                  },
                ]}
              >
                Toll gemacht! Du hast {breathingTechnique.pattern.cycles} Zyklen der {breathingTechnique.name} Atemtechnik abgeschlossen.
              </Text>
  
              <View
                style={[
                  styles.rewardCard,
                  {
                    backgroundColor: theme.colors.primary.light + '20', // 20% Opacity
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.lg,
                    marginBottom: theme.spacing.xl,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rewardTitle,
                    {
                      fontFamily: theme.typography.subtitle1.fontFamily,
                      fontSize: theme.typography.subtitle1.fontSize,
                      fontWeight: theme.typography.subtitle1.fontWeight,
                      color: theme.colors.primary.main,
                      marginBottom: theme.spacing.sm,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Belohnung erhalten:
                </Text>
                <Text
                  style={[
                    styles.rewardPoints,
                    {
                      fontFamily: theme.typography.h2.fontFamily,
                      fontSize: theme.typography.h2.fontSize,
                      fontWeight: theme.typography.h2.fontWeight,
                      color: theme.colors.primary.main,
                      textAlign: 'center',
                    },
                  ]}
                >
                  +{breathingTechnique.duration * 5} Punkte
                </Text>
              </View>
  
              <Button
                title="Zurück zum Home-Bildschirm"
                onPress={() => navigation.navigate('Home')}
                fullWidth
              />
              
              <Button
                title="Übung wiederholen"
                variant="outlined"
                onPress={() => {
                  setIsCompleted(false);
                  setIsExerciseActive(false);
                }}
                style={{ marginTop: theme.spacing.md }}
                fullWidth
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    infoContainer: {
      padding: 20,
    },
    title: {},
    description: {},
    patternCard: {},
    patternTitle: {},
    patternStep: {},
    benefitsTitle: {},
    benefitText: {},
    exerciseActiveContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {},
    cycleInfo: {
      position: 'absolute',
      top: 50,
      alignSelf: 'center',
    },
    cycleText: {},
    breathCircleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    breathCircle: {
      width: 150,
      height: 150,
      borderRadius: 75,
    },
    phaseContainer: {
      alignItems: 'center',
      marginBottom: 50,
    },
    phaseText: {},
    secondsText: {},
    completedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    completedTitle: {},
    completedCircle: {
      width: 150,
      height: 150,
      borderRadius: 75,
      justifyContent: 'center',
      alignItems: 'center',
    },
    completedMessage: {},
    rewardCard: {},
    rewardTitle: {},
    rewardPoints: {},
  });