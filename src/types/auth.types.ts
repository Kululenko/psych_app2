// src/types/auth.types.ts
export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
    // Therapie-spezifische Felder
    therapyProgress?: number;
    streakDays?: number;
    points?: number;
    level?: number;
    joinedAt: string;
  }
  
  export interface AuthState {
    isLoading: boolean;
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    error: string | null;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials extends LoginCredentials {
    username: string;
    firstName?: string;
    lastName?: string;
  }
  
  export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
  }