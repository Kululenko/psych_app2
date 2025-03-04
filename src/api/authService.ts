import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  User 
} from '../types/auth.types';

export const authService = {
  // Login-Funktion
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Token speichern
    await AsyncStorage.setItem('access_token', response.data.access);
    await AsyncStorage.setItem('refresh_token', response.data.refresh);
    
    return response.data;
  },

  // Registrierungs-Funktion
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, credentials);
    
    // Token speichern
    await AsyncStorage.setItem('access_token', response.data.access);
    await AsyncStorage.setItem('refresh_token', response.data.refresh);
    
    return response.data;
  },

  // Logout-Funktion
  logout: async (): Promise<void> => {
    try {
      // Optional: Logout-Request an Backend senden
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Fehler beim Logout ignorieren
    } finally {
      // Token aus AsyncStorage entfernen
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    }
  },

  // Benutzerdaten abrufen
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  // Passwort-Reset anfordern
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Passwort zurücksetzen
  resetPassword: async (uid: string, token: string, newPassword: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
      uid,
      token,
      new_password: newPassword,
    });
  },

  // Token aus AsyncStorage abrufen
  getTokens: async (): Promise<{ accessToken: string | null; refreshToken: string | null }> => {
    const accessToken = await AsyncStorage.getItem('access_token');
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    return { accessToken, refreshToken };
  },

  // Prüfen, ob Benutzer authentifiziert ist
  isAuthenticated: async (): Promise<boolean> => {
    const { accessToken, refreshToken } = await authService.getTokens();
    return !!accessToken && !!refreshToken;
  },
};