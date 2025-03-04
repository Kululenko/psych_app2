// src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MainStackParamList } from '../types/navigation.types';
import { useTheme } from '../context/ThemeContext';

// Screens
import { HomeScreen } from '../screens/main/HomeScreen';
import { ExerciseDetailScreen } from '../screens/main/ExerciseDetailScreen';
import { ChatScreen } from '../screens/main/ChatScreen';
import { ProgressScreen } from '../screens/main/ProgressScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { MoodTrackingScreen } from '../screens/main/MoodTrackingScreen';
import { MoodHistoryScreen } from '../screens/main/MoodHistoryScreen';

// Icons - Platzhalter, in realer Implementierung z.B. durch React Native Vector Icons ersetzen
const HomeIcon = () => <Text>🏠</Text>;
const ChatIcon = () => <Text>💬</Text>;
const ProgressIcon = () => <Text>📊</Text>;
const SettingsIcon = () => <Text>⚙️</Text>;
const MoodIcon = () => <Text>😊</Text>;

import { Text, Platform, View } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<MainStackParamList>();

// Home Stack Navigator (enthält HomeScreen und zugehörige Detail-Screens)
const HomeStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
          elevation: 0, // Für Android
          shadowOpacity: 0, // Für iOS
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral.lighter,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.h3.fontFamily,
          fontWeight: theme.typography.h3.fontWeight,
          fontSize: theme.typography.h3.fontSize,
        },
        cardStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: 'Übungsdetails' }}
      />
    </Stack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral.lighter,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.h3.fontFamily,
          fontWeight: theme.typography.h3.fontWeight,
          fontSize: theme.typography.h3.fontSize,
        },
        cardStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: 'Therapie-Chat' }}
      />
    </Stack.Navigator>
  );
};

// Progress Stack Navigator
const ProgressStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral.lighter,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.h3.fontFamily,
          fontWeight: theme.typography.h3.fontWeight,
          fontSize: theme.typography.h3.fontSize,
        },
        cardStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Fortschritt' }}
      />
    </Stack.Navigator>
  );
};

// Mood Stack Navigator (NEU)
const MoodStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral.lighter,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.h3.fontFamily,
          fontWeight: theme.typography.h3.fontWeight,
          fontSize: theme.typography.h3.fontSize,
        },
        cardStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="MoodHistory"
        component={MoodHistoryScreen}
        options={{ title: 'Stimmungsverlauf' }}
      />
      <Stack.Screen
        name="MoodTracking"
        component={MoodTrackingScreen}
        options={{ title: 'Stimmung erfassen' }}
      />
    </Stack.Navigator>
  );
};

// Settings Stack Navigator
const SettingsStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral.lighter,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          fontFamily: theme.typography.h3.fontFamily,
          fontWeight: theme.typography.h3.fontWeight,
          fontSize: theme.typography.h3.fontSize,
        },
        cardStyle: {
          backgroundColor: theme.colors.background.primary,
        },
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Einstellungen' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil', headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Hauptnavigation - Tab Navigator
export const MainNavigator = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopColor: theme.colors.neutral.lighter,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.caption.fontFamily,
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 0 : 5,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <View style={{ marginBottom: -5 }}>
              <HomeIcon />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => (
            <View style={{ marginBottom: -5 }}>
              <ChatIcon />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MoodTab"
        component={MoodStack}
        options={{
          tabBarLabel: 'Stimmung',
          tabBarIcon: ({ color }) => (
            <View style={{ marginBottom: -5 }}>
              <MoodIcon />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressStack}
        options={{
          tabBarLabel: 'Fortschritt',
          tabBarIcon: ({ color }) => (
            <View style={{ marginBottom: -5 }}>
              <ProgressIcon />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Mehr',
          tabBarIcon: ({ color }) => (
            <View style={{ marginBottom: -5 }}>
              <SettingsIcon />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};