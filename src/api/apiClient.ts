export const API_BASE_URL = 'https://api.deineapp.de/api/v1';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    REFRESH_TOKEN: '/auth/token/refresh/',
    VERIFY_TOKEN: '/auth/token/verify/',
    FORGOT_PASSWORD: '/auth/password/reset/',
    RESET_PASSWORD: '/auth/password/reset/confirm/',
    LOGOUT: '/auth/logout/',
    ME: '/auth/me/',
  },
  THERAPY: {
    EXERCISES: '/therapy/exercises/',
    EXERCISE_DETAIL: (id: number) => `/therapy/exercises/${id}/`,
    EXERCISE_COMPLETE: (id: number) => `/therapy/exercises/${id}/complete/`,
    DAILY_PROMPTS: '/therapy/daily-prompts/',
    PROGRESS: '/therapy/progress/',
  },
  CHAT: {
    SESSIONS: '/chat/sessions/',
    SESSION_DETAIL: (id: number) => `/chat/sessions/${id}/`,
    MESSAGES: (sessionId: number) => `/chat/sessions/${sessionId}/messages/`,
  },
  USER: {
    PROFILE: '/users/profile/',
    SETTINGS: '/users/settings/',
  },
};

// src/api/apiClient.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, ENDPOINTS } from './endpoints';
import jwt_decode from 'jwt-decode';

// Erstellen einer Axios-Instanz mit Basis-URL
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface für den dekodierten JWT Token
interface DecodedToken {
  exp: number;
  user_id: number;
}

// Prüfen, ob ein Token abgelaufen ist
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt_decode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Interceptor für Request-Handling
apiClient.interceptors.request.use(
  async (config) => {
    // Abrufen des Tokens aus dem AsyncStorage
    const accessToken = await AsyncStorage.getItem('access_token');
    const refreshToken = await AsyncStorage.getItem('refresh_token');

    // Wenn kein Token vorhanden ist, Request ohne Token senden
    if (!accessToken) {
      return config;
    }

    // Prüfen, ob Access Token abgelaufen ist
    if (accessToken && isTokenExpired(accessToken) && refreshToken && !isTokenExpired(refreshToken)) {
      try {
        // Refresh Token verwenden, um neuen Access Token zu erhalten
        const response = await axios.post(
          `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          { refresh: refreshToken }
        );

        // Neuen Access Token speichern
        const newAccessToken = response.data.access;
        await AsyncStorage.setItem('access_token', newAccessToken);

        // Config mit neuem Token aktualisieren
        config.headers.Authorization = `Bearer ${newAccessToken}`;
      } catch (error) {
        // Bei Fehler: Token löschen und zum Login weiterleiten
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // Hier würden wir einen Event emittieren, um zum Login zu navigieren
        // Implementierung folgt später im AuthContext
      }
    } else if (accessToken) {
      // Gültigen Token zum Request hinzufügen
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor für Response-Handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Wenn es ein 401-Fehler ist und wir den Request nicht schon einmal wiederholt haben
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Refresh Token aus AsyncStorage holen
      const refreshToken = await AsyncStorage.getItem('refresh_token');

      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          // Neuen Access Token anfordern
          const response = await axios.post(
            `${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            { refresh: refreshToken }
          );

          const newAccessToken = response.data.access;
          
          // Neuen Token speichern
          await AsyncStorage.setItem('access_token', newAccessToken);
          
          // Ursprünglichen Request mit neuem Token wiederholen
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Bei Fehler: Token löschen und zum Login weiterleiten
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
          // Event emittieren für Navigation zum Login (später im AuthContext)
        }
      } else {
        // Wenn kein Refresh Token vorhanden oder abgelaufen ist
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // Event emittieren für Navigation zum Login (später im AuthContext)
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;