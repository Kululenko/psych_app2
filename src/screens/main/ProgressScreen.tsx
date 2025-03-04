// src/screens/main/ProgressScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MainScreenProps } from '../../types/navigation.types';
import { ProgressStats } from '../../types/therapy.types';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';

// Import von Sub-Komponenten (werden unten definiert)
import { 
  TabNavigation, 
  OverviewTab, 
  AchievementsTab, 
  HistoryTab,
  ErrorMessage
} from './progress-components';

const { width } = Dimensions.get('window');

export const ProgressScreen: React.FC<MainScreenProps<'Progress'>> = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history'>('overview');

  // Fortschrittsdaten abrufen - mit useCallback für Optimierung
  const fetchProgressData = useCallback(async () => {
    try {
      setError(null);
      
      const response = await apiClient.get<ProgressStats>(ENDPOINTS.THERAPY.PROGRESS);
      setProgressStats(response.data);
    } catch (err: any) {
      console.error('Fehler beim Laden der Fortschrittsdaten:', err);
      setError(
        err.response?.data?.message || 
        'Fortschrittsdaten konnten nicht geladen werden. Bitte versuche es später erneut.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProgressData();
  }, [fetchProgressData]);

  // Wochenaktivitätsdaten bereitstellen
  const weeklyActivityData = useMemo(() => {
    return progressStats?.weeklyActivity || [];
  }, [progressStats]);

  // Tab-Wechsel-Handler
  const handleTabChange = useCallback((tab: 'overview' | 'achievements' | 'history') => {
    setActiveTab(tab);
  }, []);

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
          <Text
            style={[
              styles.title,
              {
                fontFamily: theme.typography.h1.fontFamily,
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.h1.fontWeight,
                color: theme.colors.text.primary,
              },
            ]}
          >
            Dein Fortschritt
          </Text>
        </View>

        {/* Tab Navigation als eigene Komponente */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          theme={theme} 
        />

        {/* Fehleranzeige als eigene Komponente */}
        {error && <ErrorMessage error={error} theme={theme} />}

        {/* Inhalt basierend auf aktivem Tab */}
        {activeTab === 'overview' && (
          <OverviewTab 
            progressStats={progressStats} 
            weeklyActivityData={weeklyActivityData} 
            theme={theme} 
          />
        )}

        {/* Erfolge Tab */}
        {activeTab === 'achievements' && (
          <AchievementsTab theme={theme} />
        )}

        {/* Verlauf Tab */}
        {activeTab === 'history' && (
          <HistoryTab theme={theme} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
});