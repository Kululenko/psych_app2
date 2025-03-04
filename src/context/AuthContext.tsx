import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../api/authService';
import { AuthState, User, LoginCredentials, RegisterCredentials } from '../types/auth.types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
  clearError: () => void;
}

// Standardwerte für AuthState
const initialState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  token: null,
  user: null,
  error: null,
};

// Context erstellen
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider-Komponente
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Authentifizierungsstatus beim App-Start überprüfen
  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
    };

    initAuth();
  }, []);

  // Authentifizierungsstatus prüfen
  const checkAuthStatus = async (): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const tokens = await authService.getTokens();
        const user = await authService.getCurrentUser();

        setState({
          isLoading: false,
          isAuthenticated: true,
          token: tokens.accessToken,
          user,
          error: null,
        });

        return true;
      } else {
        setState({
          isLoading: false,
          isAuthenticated: false,
          token: null,
          user: null,
          error: null,
        });

        return false;
      }
    } catch (error) {
      setState({
        isLoading: false,
        isAuthenticated: false,
        token: null,
        user: null,
        error: 'Authentifizierungsstatus konnte nicht überprüft werden.',
      });

      return false;
    }
  };

  // Login-Funktion
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.login(credentials);

      setState({
        isLoading: false,
        isAuthenticated: true,
        token: response.access,
        user: response.user,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.detail || 'Login fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.',
      }));

      throw error;
    }
  };

  // Register-Funktion
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.register(credentials);

      setState({
        isLoading: false,
        isAuthenticated: true,
        token: response.access,
        user: response.user,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.detail || 'Registrierung fehlgeschlagen. Bitte versuche es erneut.',
      }));

      throw error;
    }
  };

  // Logout-Funktion
  const logout = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authService.logout();

      setState({
        isLoading: false,
        isAuthenticated: false,
        token: null,
        user: null,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Logout fehlgeschlagen.',
      }));

      throw error;
    }
  };

  // Fehler zurücksetzen
  const clearError = (): void => {
    setState((prev) => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        checkAuthStatus,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook für einfachen Zugriff auf den AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};