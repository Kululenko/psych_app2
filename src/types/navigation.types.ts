// src/types/navigation.types.ts
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  ExerciseDetail: { exerciseId: number };
  Chat: { sessionId?: number };
  Progress: undefined;
  Settings: undefined;
  Profile: undefined;
  MoodHistory: undefined;
  MoodTracking: undefined;
  BreathingExercise: { exerciseId?: number; duration?: number; technique?: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined; // Für einen möglichen Onboarding-Flow
};

export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: StackNavigationProp<AuthStackParamList, T>;
  route: RouteProp<AuthStackParamList, T>;
};

export type MainScreenProps<T extends keyof MainStackParamList> = {
  navigation: StackNavigationProp<MainStackParamList, T>;
  route: RouteProp<MainStackParamList, T>;
};