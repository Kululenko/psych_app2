// src/screens/main/progress-components.tsx
import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ProgressStats } from '../../types/therapy.types';

const { width } = Dimensions.get('window');

// Tab-Navigation-Komponente
export const TabNavigation = memo(({ 
  activeTab, 
  onTabChange, 
  theme 
}: { 
  activeTab: 'overview' | 'achievements' | 'history', 
  onTabChange: (tab: 'overview' | 'achievements' | 'history') => void,
  theme: any
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'overview' && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary.main,
          },
        ]}
        onPress={() => onTabChange('overview')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'overview' }}
      >
        <Text
          style={[
            styles.tabText,
            {
              fontFamily: theme.typography.subtitle2.fontFamily,
              fontWeight: theme.typography.subtitle2.fontWeight,
              color: activeTab === 'overview'
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
            },
          ]}
        >
          Übersicht
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'achievements' && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary.main,
          },
        ]}
        onPress={() => onTabChange('achievements')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'achievements' }}
      >
        <Text
          style={[
            styles.tabText,
            {
              fontFamily: theme.typography.subtitle2.fontFamily,
              fontWeight: theme.typography.subtitle2.fontWeight,
              color: activeTab === 'achievements'
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
            },
          ]}
        >
          Erfolge
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'history' && {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary.main,
          },
        ]}
        onPress={() => onTabChange('history')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'history' }}
      >
        <Text
          style={[
            styles.tabText,
            {
              fontFamily: theme.typography.subtitle2.fontFamily,
              fontWeight: theme.typography.subtitle2.fontWeight,
              color: activeTab === 'history'
                ? theme.colors.primary.main
                : theme.colors.text.secondary,
            },
          ]}
        >
          Verlauf
        </Text>
      </TouchableOpacity>
    </View>
  );
});

// Fehleranzeige
export const ErrorMessage = memo(({ 
  error, 
  theme 
}: { 
  error: string, 
  theme: any 
}) => {
  return (
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
  );
});

// Level und Punkte Karte
const LevelCard = memo(({ 
  progressStats, 
  theme 
}: { 
  progressStats: ProgressStats | null, 
  theme: any 
}) => {
  const level = progressStats?.level || 1;
  const totalPoints = progressStats?.totalPoints || 0;
  const nextLevelPoints = progressStats?.nextLevelPoints || 100;
  
  // Berechne Fortschrittsbalken-Prozentsatz
  const progressPercentage = useMemo(() => {
    if (!progressStats) return 0;
    const currentLevelPoints = totalPoints % 100; // Annahme: 100 Punkte pro Level
    return (currentLevelPoints / nextLevelPoints) * 100;
  }, [progressStats, totalPoints, nextLevelPoints]);

  return (
    <>
      <View
        style={[
          styles.levelCard,
          {
            backgroundColor: theme.colors.primary.light + '20', // 20% Opacity
            borderColor: theme.colors.primary.light,
            ...theme.shadows.sm,
          },
        ]}
      >
        <View style={styles.levelInfo}>
          <Text
            style={[
              styles.levelLabel,
              {
                fontFamily: theme.typography.subtitle2.fontFamily,
                fontSize: theme.typography.subtitle2.fontSize,
                color: theme.colors.primary.dark,
              },
            ]}
          >
            Dein Level
          </Text>
          <Text
            style={[
              styles.levelValue,
              {
                fontFamily: theme.typography.h1.fontFamily,
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.h1.fontWeight,
                color: theme.colors.primary.main,
              },
            ]}
          >
            {level}
          </Text>
        </View>
        
        <View style={styles.pointsInfo}>
          <Text
            style={[
              styles.pointsLabel,
              {
                fontFamily: theme.typography.subtitle2.fontFamily,
                fontSize: theme.typography.subtitle2.fontSize,
                color: theme.colors.primary.dark,
              },
            ]}
          >
            Gesammelte Punkte
          </Text>
          <Text
            style={[
              styles.pointsValue,
              {
                fontFamily: theme.typography.h2.fontFamily,
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.primary.main,
              },
            ]}
          >
            {totalPoints}
          </Text>
          <Text
            style={[
              styles.nextLevelText,
              {
                fontFamily: theme.typography.body2.fontFamily,
                fontSize: theme.typography.body2.fontSize,
                color: theme.colors.text.secondary,
              },
            ]}
          >
            Noch {nextLevelPoints} Punkte bis Level {level + 1}
          </Text>
        </View>
      </View>

      {/* Fortschrittsbalken zum nächsten Level */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarBackground,
            {
              backgroundColor: theme.colors.neutral.light,
              borderRadius: theme.borderRadius.round,
            },
          ]}
        >
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: theme.colors.primary.main,
                borderRadius: theme.borderRadius.round,
              },
            ]}
          />
        </View>
      </View>
    </>
  );
});

// Statistik-Grid
const StatsGrid = memo(({ 
  progressStats, 
  theme 
}: { 
  progressStats: ProgressStats | null, 
  theme: any 
}) => {
  return (
    <View style={styles.statsGrid}>
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.neutral.light,
            ...theme.shadows.sm,
          },
        ]}
      >
        <Text
          style={[
            styles.statValue,
            {
              fontFamily: theme.typography.h2.fontFamily,
              fontSize: theme.typography.h2.fontSize,
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.primary.main,
            },
          ]}
        >
          {progressStats?.totalExercisesCompleted || 0}
        </Text>
        <Text
          style={[
            styles.statLabel,
            {
              fontFamily: theme.typography.body2.fontFamily,
              fontSize: theme.typography.body2.fontSize,
              color: theme.colors.text.secondary,
            },
          ]}
        >
          Abgeschlossene Übungen
        </Text>
      </View>
      
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.neutral.light,
            ...theme.shadows.sm,
          },
        ]}
      >
        <Text
          style={[
            styles.statValue,
            {
              fontFamily: theme.typography.h2.fontFamily,
              fontSize: theme.typography.h2.fontSize,
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.calming.dark,
            },
          ]}
        >
          {progressStats?.currentStreak || 0}
        </Text>
        <Text
          style={[
            styles.statLabel,
            {
              fontFamily: theme.typography.body2.fontFamily,
              fontSize: theme.typography.body2.fontSize,
              color: theme.colors.text.secondary,
            },
          ]}
        >
          Aktuelle Serie
        </Text>
      </View>
      
      <View
        style={[
          styles.statCard,
          {
            backgroundColor: theme.colors.background.primary,
            borderColor: theme.colors.neutral.light,
            ...theme.shadows.sm,
          },
        ]}
      >
        <Text
          style={[
            styles.statValue,
            {
              fontFamily: theme.typography.h2.fontFamily,
              fontSize: theme.typography.h2.fontSize,
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.accent.dark,
            },
          ]}
        >
          {progressStats?.longestStreak || 0}
        </Text>
        <Text
          style={[
            styles.statLabel,
            {
              fontFamily: theme.typography.body2.fontFamily,
              fontSize: theme.typography.body2.fontSize,
              color: theme.colors.text.secondary,
            },
          ]}
        >
          Längste Serie
        </Text>
      </View>
    </View>
  );
});

// Aktivitätsdiagramm-Komponente
const ActivityChart = memo(({ 
  weeklyActivityData, 
  theme 
}: { 
  weeklyActivityData: { date: string; count: number }[], 
  theme: any 
}) => {
  // Maximalwert für die Wochenaktivität (für die Skalierung)
  const maxActivityCount = useMemo(() => {
    return Math.max(...weeklyActivityData.map((day) => day.count), 1);
  }, [weeklyActivityData]);

  // Formatierte Tage für die Anzeige
  const formattedDays = useMemo(() => {
    return weeklyActivityData.map((day) => {
      const date = new Date(day.date);
      const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      return weekdays[date.getDay()];
    });
  }, [weeklyActivityData]);

  return (
    <View style={styles.weeklyActivitySection}>
      <Text
        style={[
          styles.sectionTitle,
          {
            fontFamily: theme.typography.h3.fontFamily,
            fontSize: theme.typography.h3.fontSize,
            fontWeight: theme.typography.h3.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        Wochenaktivität
      </Text>
      
      <View style={styles.chartContainer}>
        {weeklyActivityData.map((day, index) => (
          <View 
            key={index} 
            style={styles.chartColumn}
            accessibilityLabel={`${formattedDays[index]}: ${day.count} Aktivitäten`}
          >
            <View
              style={[
                styles.chartBar,
                {
                  height: `${(day.count / maxActivityCount) * 100}%`,
                  backgroundColor:
                    day.count > 0
                      ? theme.colors.primary.main
                      : theme.colors.neutral.light,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            />
            <Text
              style={[
                styles.chartLabel,
                {
                  fontFamily: theme.typography.caption.fontFamily,
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                  marginTop: theme.spacing.xs,
                },
              ]}
            >
              {formattedDays[index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

// Übersicht-Tab
export const OverviewTab = memo(({ 
  progressStats, 
  weeklyActivityData, 
  theme 
}: { 
  progressStats: ProgressStats | null, 
  weeklyActivityData: { date: string; count: number }[], 
  theme: any 
}) => {
  return (
    <View style={styles.overviewContainer}>
      <LevelCard progressStats={progressStats} theme={theme} />
      <StatsGrid progressStats={progressStats} theme={theme} />
      <ActivityChart weeklyActivityData={weeklyActivityData} theme={theme} />
    </View>
  );
});

// Erfolge-Tab
export const AchievementsTab = memo(({ theme }: { theme: any }) => {
  return (
    <View style={styles.achievementsContainer}>
      <Text
        style={[
          styles.comingSoon,
          {
            fontFamily: theme.typography.body1.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginTop: theme.spacing.xl,
          },
        ]}
      >
        Erfolge werden in Kürze verfügbar sein!
      </Text>
      
      {/* Platzhalter für Erfolge */}
      <View
        style={[
          styles.placeholderAchievement,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.neutral.light,
            marginTop: theme.spacing.xl,
            ...theme.shadows.sm,
          },
        ]}
      >
        <View
          style={[
            styles.achievementIcon,
            {
              backgroundColor: theme.colors.neutral.medium + '40', // 40% Opacity
            },
          ]}
        />
        <View style={styles.achievementContent}>
          <View
            style={[
              styles.achievementTitlePlaceholder,
              {
                backgroundColor: theme.colors.neutral.medium + '40', // 40% Opacity
              },
            ]}
          />
          <View
            style={[
              styles.achievementDescPlaceholder,
              {
                backgroundColor: theme.colors.neutral.medium + '20', // 20% Opacity
              },
            ]}
          />
        </View>
      </View>
      
      <View
        style={[
          styles.placeholderAchievement,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.neutral.light,
            marginTop: theme.spacing.lg,
            ...theme.shadows.sm,
          },
        ]}
      >
        <View
          style={[
            styles.achievementIcon,
            {
              backgroundColor: theme.colors.neutral.medium + '40', // 40% Opacity
            },
          ]}
        />
        <View style={styles.achievementContent}>
          <View
            style={[
              styles.achievementTitlePlaceholder,
              {
                backgroundColor: theme.colors.neutral.medium + '40', // 40% Opacity
              },
            ]}
          />
          <View
            style={[
              styles.achievementDescPlaceholder,
              {
                backgroundColor: theme.colors.neutral.medium + '20', // 20% Opacity
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
});

// Verlauf-Tab
export const HistoryTab = memo(({ theme }: { theme: any }) => {
  return (
    <View style={styles.historyContainer}>
      <Text
        style={[
          styles.comingSoon,
          {
            fontFamily: theme.typography.body1.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginTop: theme.spacing.xl,
          },
        ]}
      >
        Verlauf wird in Kürze verfügbar sein!
      </Text>
      
      {/* Platzhalter für Verlaufseinträge */}
      <View
        style={[
          styles.placeholderHistory,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.neutral.light,
            marginTop: theme.spacing.xl,
            ...theme.shadows.sm,
          },
        ]}
      >
        <View
          style={[
            styles.historyDatePlaceholder,
            {
              backgroundColor: theme.colors.neutral.medium + '40', // 40% Opacity
            },
          ]}
        />
        <View style={styles.historyContent}>
          <View
            style={[
              styles.historyTitlePlaceholder,
              {
                backgroundColor: theme.colors.neutral.medium + '40', // 40% Opacity
              },
            ]}
          />
          <View
            style={[
              styles.historyDescPlaceholder,
              {
                backgroundColor: theme.colors.neutral.medium + '20', // 20% Opacity
              },
            ]}
          />
        </View>
      </View>
      
      <View
        style={[
          styles.placeholderHistory,
          {
            backgroundColor: theme.colors.background.secondary,
            borderColor: theme.colors.neutral.light,
            marginTop: theme.spacing.md,
            ...theme.shadows.sm,
          },
        ]}
      >
        <View
          style={[
            styles.historyDatePlaceholder,
            {
              backgroundColor: theme.colors.neutral.medium + '40', // 40% Opacity
            },
          ]}
        />
        <View style={styles.historyContent}>
          <View
            style={[
              styles.historyTitlePlaceholder,
              {
                backgroundColor: theme.colors.neutral.medium + '40', // 40% Opacity
              },
            ]}
          />
          <View
            style={[
              styles.historyDescPlaceholder,
              {
                backgroundColor: theme.colors.neutral.medium + '20', // 20% Opacity
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    textAlign: 'center',
  },
  errorContainer: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  overviewContainer: {
    paddingHorizontal: 16,
  },
  levelCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  levelInfo: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingRight: 16,
  },
  levelLabel: {
    marginBottom: 8,
  },
  levelValue: {
    textAlign: 'center',
  },
  pointsInfo: {
    flex: 2,
    paddingLeft: 16,
  },
  pointsLabel: {
    marginBottom: 8,
  },
  pointsValue: {
    marginBottom: 4,
  },
  nextLevelText: {},
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarBackground: {
    height: 12,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
  },
  weeklyActivitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    justifyContent: 'space-between',
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
  },
  chartBar: {
    width: '60%',
    minHeight: 4,
  },
  chartLabel: {
    textAlign: 'center',
  },
  achievementsContainer: {
    paddingHorizontal: 16,
  },
  historyContainer: {
    paddingHorizontal: 16,
  },
  comingSoon: {
    marginVertical: 40,
  },
  placeholderAchievement: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitlePlaceholder: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  achievementDescPlaceholder: {
    height: 16,
    borderRadius: 4,
    width: '100%',
  },
  placeholderHistory: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  historyDatePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  historyContent: {
    flex: 1,
  },
  historyTitlePlaceholder: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
    width: '50%',
  },
  historyDescPlaceholder: {
    height: 16,
    borderRadius: 4,
    width: '80%',
  },
});