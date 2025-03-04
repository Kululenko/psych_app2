// src/types/achievements.types.ts
export interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: string; // Emoji oder Icon-Name
    category: 'meditation' | 'journaling' | 'streak' | 'milestones' | 'social';
    progress: number; // 0-100 in Prozent
    unlockedAt?: string; // ISO Datum-String, wenn Achievement freigeschaltet ist
    requiredValue: number; // Benötigter Wert zum Freischalten
    currentValue: number; // Aktueller Fortschritt
    points: number; // Belohnungspunkte
  }
  
  // src/components/achievements/AchievementsList.tsx
  import React, { memo, useState, useEffect } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
  } from 'react-native';
  import { Achievement } from '../../types/achievements.types';
  import apiClient from '../../api/apiClient';
  import { ENDPOINTS } from '../../api/endpoints';
  
  interface AchievementsListProps {
    theme: any;
    filter?: string;
  }
  
  export const AchievementsList = memo(({ theme, filter }: AchievementsListProps) => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
    // Mock-Daten für Achievements laden
    // In der realen Implementierung würde dies von der API kommen
    useEffect(() => {
      const loadAchievements = async () => {
        setLoading(true);
        try {
          // Für Demo-Zwecke simulieren wir API-Antwort mit Timeout
          setTimeout(() => {
            const mockAchievements: Achievement[] = [
              {
                id: 1,
                title: 'Erste Schritte',
                description: 'Schließe deine erste Übung ab',
                icon: '🏆',
                category: 'milestones',
                progress: 100,
                unlockedAt: '2023-05-01T10:20:00Z',
                requiredValue: 1,
                currentValue: 1,
                points: 10
              },
              {
                id: 2,
                title: 'Meditation-Anfänger',
                description: 'Führe 5 Meditationsübungen durch',
                icon: '🧘',
                category: 'meditation',
                progress: 60,
                requiredValue: 5,
                currentValue: 3,
                points: 25
              },
              {
                id: 3,
                title: 'Journaling-Profi',
                description: 'Führe 10 Journaling-Übungen durch',
                icon: '📝',
                category: 'journaling',
                progress: 30,
                requiredValue: 10,
                currentValue: 3,
                points: 30
              },
              {
                id: 4,
                title: 'Durchhalter',
                description: 'Erreiche eine Serie von 7 Tagen',
                icon: '🔥',
                category: 'streak',
                progress: 70,
                requiredValue: 7,
                currentValue: 5,
                points: 50
              },
              {
                id: 5,
                title: 'Superstar',
                description: 'Erreiche Level 5',
                icon: '⭐',
                category: 'milestones',
                progress: 40,
                requiredValue: 5,
                currentValue: 2,
                points: 100
              },
              {
                id: 6,
                title: '30-Tage-Herausforderung',
                description: 'Führe 30 Tage lang Übungen durch',
                icon: '📅',
                category: 'streak',
                progress: 20,
                requiredValue: 30,
                currentValue: 6,
                points: 200
              }
            ];
  
            // Filtern, wenn ein Filter gesetzt ist
            const filteredAchievements = filter 
              ? mockAchievements.filter(a => a.category === filter)
              : mockAchievements;
  
            setAchievements(filteredAchievements);
            setLoading(false);
          }, 500);
        } catch (err: any) {
          console.error('Fehler beim Laden der Erfolge:', err);
          setError('Erfolge konnten nicht geladen werden');
          setLoading(false);
        }
      };
  
      loadAchievements();
    }, [filter]);
  
    // Achievement-Detail-Modal
    const AchievementDetailModal = () => {
      if (!selectedAchievement) return null;
  
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedAchievement}
          onRequestClose={() => setSelectedAchievement(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.colors.background.primary,
                  borderRadius: theme.borderRadius.lg,
                  ...theme.shadows.lg,
                },
              ]}
            >
              <View
                style={[
                  styles.achievementIconLarge,
                  {
                    backgroundColor: 
                      selectedAchievement.progress === 100
                        ? theme.colors.primary.main
                        : theme.colors.neutral.light,
                  },
                ]}
              >
                <Text style={{ fontSize: 32 }}>{selectedAchievement.icon}</Text>
              </View>
              
              <Text
                style={[
                  styles.achievementTitleLarge,
                  {
                    fontFamily: theme.typography.h2.fontFamily,
                    fontSize: theme.typography.h2.fontSize,
                    fontWeight: theme.typography.h2.fontWeight,
                    color: theme.colors.text.primary,
                    marginTop: theme.spacing.md,
                    textAlign: 'center',
                  },
                ]}
              >
                {selectedAchievement.title}
              </Text>
              
              <Text
                style={[
                  styles.achievementDescription,
                  {
                    fontFamily: theme.typography.body1.fontFamily,
                    fontSize: theme.typography.body1.fontSize,
                    color: theme.colors.text.secondary,
                    marginTop: theme.spacing.sm,
                    marginBottom: theme.spacing.lg,
                    textAlign: 'center',
                  },
                ]}
              >
                {selectedAchievement.description}
              </Text>
              
              <View
                style={[
                  styles.achievementProgressContainer,
                  {
                    marginBottom: theme.spacing.lg,
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressText,
                    {
                      fontFamily: theme.typography.body2.fontFamily,
                      fontSize: theme.typography.body2.fontSize,
                      color: theme.colors.text.primary,
                      marginBottom: theme.spacing.sm,
                    },
                  ]}
                >
                  Fortschritt: {selectedAchievement.currentValue} / {selectedAchievement.requiredValue}
                </Text>
                
                <View
                  style={[
                    styles.progressBarBackground,
                    {
                      backgroundColor: theme.colors.neutral.light,
                      borderRadius: theme.borderRadius.round,
                      height: 8,
                      width: '100%',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${selectedAchievement.progress}%`,
                        backgroundColor: 
                          selectedAchievement.progress === 100
                            ? theme.colors.status.success
                            : theme.colors.primary.main,
                        borderRadius: theme.borderRadius.round,
                        height: '100%',
                      },
                    ]}
                  />
                </View>
              </View>
              
              <View
                style={[
                  styles.rewardContainer,
                  {
                    backgroundColor: 
                      selectedAchievement.progress === 100
                        ? theme.colors.calming.lightest
                        : theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rewardText,
                    {
                      fontFamily: theme.typography.subtitle2.fontFamily,
                      fontSize: theme.typography.subtitle2.fontSize,
                      color: 
                        selectedAchievement.progress === 100
                          ? theme.colors.calming.dark
                          : theme.colors.text.secondary,
                    },
                  ]}
                >
                  Belohnung: 
                </Text>
                <Text
                  style={[
                    styles.rewardPoints,
                    {
                      fontFamily: theme.typography.subtitle1.fontFamily,
                      fontSize: theme.typography.subtitle1.fontSize,
                      fontWeight: 'bold',
                      color: 
                        selectedAchievement.progress === 100
                          ? theme.colors.primary.main
                          : theme.colors.text.secondary,
                      marginLeft: 4,
                    },
                  ]}
                >
                  {selectedAchievement.points} Punkte
                </Text>
              </View>
              
              {selectedAchievement.unlockedAt && (
                <Text
                  style={[
                    styles.unlockedInfo,
                    {
                      fontFamily: theme.typography.caption.fontFamily,
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.primary.dark,
                      marginTop: theme.spacing.md,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Freigeschaltet am {new Date(selectedAchievement.unlockedAt).toLocaleDateString('de-DE')}
                </Text>
              )}
              
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: theme.colors.neutral.light,
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    marginTop: theme.spacing.lg,
                    alignItems: 'center',
                  },
                ]}
                onPress={() => setSelectedAchievement(null)}
              >
                <Text
                  style={{
                    fontFamily: theme.typography.button.fontFamily,
                    color: theme.colors.text.primary,
                  }}
                >
                  Schließen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    };
  
    const renderAchievementItem = ({ item }: { item: Achievement }) => {
      return (
        <TouchableOpacity
          style={[
            styles.achievementItem,
            {
              backgroundColor: 
                item.progress === 100
                  ? theme.colors.calming.lightest
                  : theme.colors.background.primary,
              borderColor: 
                item.progress === 100
                  ? theme.colors.calming.light
                  : theme.colors.neutral.light,
              borderRadius: theme.borderRadius.md,
              borderWidth: 1,
              marginBottom: theme.spacing.md,
              padding: theme.spacing.md,
              ...theme.shadows.sm,
            },
          ]}
          onPress={() => setSelectedAchievement(item)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={[
                styles.achievementIcon,
                {
                  backgroundColor: 
                    item.progress === 100
                      ? theme.colors.primary.main
                      : theme.colors.neutral.light,
                  borderRadius: theme.borderRadius.round,
                  width: 48,
                  height: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: theme.spacing.md,
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.achievementTitle,
                  {
                    fontFamily: theme.typography.subtitle1.fontFamily,
                    fontSize: theme.typography.subtitle1.fontSize,
                    fontWeight: theme.typography.subtitle1.fontWeight,
                    color: theme.colors.text.primary,
                  },
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.achievementDescription,
                  {
                    fontFamily: theme.typography.body2.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    color: theme.colors.text.secondary,
                    marginBottom: 8,
                  },
                ]}
                numberOfLines={1}
              >
                {item.description}
              </Text>
              
              <View
                style={[
                  styles.progressBarBackground,
                  {
                    backgroundColor: theme.colors.neutral.light,
                    borderRadius: theme.borderRadius.round,
                    height: 4,
                    width: '100%',
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.progress}%`,
                      backgroundColor: 
                        item.progress === 100
                          ? theme.colors.status.success
                          : theme.colors.primary.main,
                      borderRadius: theme.borderRadius.round,
                      height: '100%',
                    },
                  ]}
                />
              </View>
              
              <View style={[styles.achievementMeta, { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }]}>
                <Text
                  style={[
                    styles.progressText,
                    {
                      fontFamily: theme.typography.caption.fontFamily,
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.text.secondary,
                    },
                  ]}
                >
                  {item.currentValue}/{item.requiredValue}
                </Text>
                <Text
                  style={[
                    styles.pointsText,
                    {
                      fontFamily: theme.typography.caption.fontFamily,
                      fontSize: theme.typography.caption.fontSize,
                      color: theme.colors.primary.main,
                    },
                  ]}
                >
                  {item.points} Punkte
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    };
  
    if (loading) {
      return (
        <View style={[styles.loadingContainer, { padding: theme.spacing.xl }]}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
        </View>
      );
    }
  
    if (error) {
      return (
        <View
          style={[
            styles.errorContainer,
            {
              backgroundColor: theme.colors.status.error + '20', // 20% Opacity
              borderColor: theme.colors.status.error,
              margin: theme.spacing.md,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={{
              color: theme.colors.status.error,
              fontFamily: theme.typography.body2.fontFamily,
              fontSize: theme.typography.body2.fontSize,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <FlatList
          data={achievements}
          renderItem={renderAchievementItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: theme.spacing.md }}
          showsVerticalScrollIndicator={false}
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
              Keine Erfolge in dieser Kategorie
            </Text>
          }
        />
        <AchievementDetailModal />
      </View>
    );
  });
  
  // src/screens/main/full-achievement-tab.tsx
  import React, { useState } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
  } from 'react-native';
  import { AchievementsList } from '../../components/achievements/AchievementsList';
  
  interface AchievementsTabProps {
    theme: any;
  }
  
  export const FullAchievementsTab: React.FC<AchievementsTabProps> = ({ theme }) => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    
    const categories = [
      { key: null, label: 'Alle' },
      { key: 'meditation', label: 'Meditation' },
      { key: 'journaling', label: 'Journaling' },
      { key: 'streak', label: 'Serien' },
      { key: 'milestones', label: 'Meilensteine' },
    ];
  
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.categoryScrollContainer,
            { paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }
          ]}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.key || 'all'}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: 
                    activeCategory === category.key
                      ? theme.colors.primary.main
                      : theme.colors.neutral.light,
                  borderRadius: theme.borderRadius.round,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  marginRight: theme.spacing.sm,
                },
              ]}
              onPress={() => setActiveCategory(category.key)}
            >
              <Text
                style={{
                  color: 
                    activeCategory === category.key
                      ? theme.colors.text.inverse
                      : theme.colors.text.primary,
                  fontFamily: theme.typography.button.fontFamily,
                  fontSize: theme.typography.button.fontSize,
                }}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <AchievementsList theme={theme} filter={activeCategory || undefined} />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {},
    categoryScrollContainer: {
      flexDirection: 'row',
      paddingVertical: 16,
    },
    categoryButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    achievementItem: {
      flexDirection: 'row',
    },
    achievementIcon: {},
    achievementTitle: {},
    achievementDescription: {},
    achievementMeta: {},
    progressBarBackground: {
      overflow: 'hidden',
    },
    progressBarFill: {},
    progressText: {},
    pointsText: {},
    // Modal Styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
    },
    modalContent: {
      width: '90%',
      padding: 20,
      alignItems: 'center',
    },
    achievementIconLarge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    achievementTitleLarge: {},
    achievementProgressContainer: {},
    rewardContainer: {},
    rewardText: {},
    rewardPoints: {},
    unlockedInfo: {},
    closeButton: {},
  });