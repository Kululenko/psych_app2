// src/api/endpoints.ts

export const ENDPOINTS = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    USER: {
      PROFILE: '/user/profile',
      UPDATE: '/user/update',
      CHANGE_PASSWORD: '/user/change-password',
    },
    THERAPY: {
      EXERCISES: '/therapy/exercises',
      EXERCISE_DETAIL: (id: number) => `/therapy/exercises/${id}`,
      EXERCISE_COMPLETE: (id: number) => `/therapy/exercises/${id}/complete`,
      DAILY_PROMPTS: '/therapy/daily-prompts',
      PROGRESS: '/therapy/progress',
    },
    CHAT: {
      SESSIONS: '/chat/sessions',
      SESSION_DETAIL: (id: number) => `/chat/sessions/${id}`,
      MESSAGES: (sessionId: number) => `/chat/sessions/${sessionId}/messages`,
      SEND_MESSAGE: (sessionId: number) => `/chat/sessions/${sessionId}/messages`,
    },
    // Neue MOOD-Endpoints für die Stimmungstracking-Funktionalität
    MOOD: {
      GET_TODAY: '/mood/today',
      SAVE: '/mood',
      HISTORY: '/mood/history',
      STATS: '/mood/stats',
      DELETE: (id: number) => `/mood/${id}`,
      UPDATE: (id: number) => `/mood/${id}`,
    },
    // Endpunkte für Atemübungen
    BREATHING: {
      TECHNIQUES: '/breathing/techniques',
      TECHNIQUE_DETAIL: (id: number) => `/breathing/techniques/${id}`,
      SAVE_SESSION: '/breathing/sessions',
      HISTORY: '/breathing/sessions',
    },
  };