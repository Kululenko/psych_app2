import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TextInput } from '../../components/common/TextInput';
import { Button } from '../../components/common/button';
import { AuthScreenProps } from '../../types/navigation.types';

export const LoginScreen: React.FC<AuthScreenProps<'Login'>> = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Validieren der Email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? '' : 'Bitte gib eine gültige E-Mail-Adresse ein.');
    return isValid;
  };

  // Validieren des Passworts
  const validatePassword = (password: string): boolean => {
    const isValid = password.length >= 6;
    setPasswordError(isValid ? '' : 'Das Passwort muss mindestens 6 Zeichen lang sein.');
    return isValid;
  };

  // Formularvalidierung
  const validateForm = (): boolean => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    setTouched({
      email: true,
      password: true,
    });

    return isEmailValid && isPasswordValid;
  };

  // Login-Handler
  const handleLogin = async () => {
    clearError();
    
    if (validateForm()) {
      try {
        await login({ email, password });
        // Nach erfolgreichem Login wird automatisch zur Hauptapp navigiert
      } catch (error) {
        // Fehlerbehandlung erfolgt bereits im AuthContext
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <Text
              style={[
                styles.title,
                {
                  fontFamily: theme.typography.h1.fontFamily,
                  fontSize: theme.typography.h1.fontSize,
                  fontWeight: theme.typography.h1.fontWeight,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.xl,
                },
              ]}
            >
              Willkommen zurück
            </Text>

            <TextInput
              label="E-Mail"
              placeholder="E-Mail-Adresse eingeben"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (touched.email) validateEmail(text);
              }}
              onBlur={() => {
                setTouched({ ...touched, email: true });
                validateEmail(email);
              }}
              error={emailError}
              touched={touched.email}
              containerStyle={{ marginBottom: theme.spacing.md }}
            />

            <TextInput
              label="Passwort"
              placeholder="Passwort eingeben"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (touched.password) validatePassword(text);
              }}
              onBlur={() => {
                setTouched({ ...touched, password: true });
                validatePassword(password);
              }}
              error={passwordError}
              touched={touched.password}
              containerStyle={{ marginBottom: theme.spacing.lg }}
            />

            {error && (
              <Text
                style={{
                  color: theme.colors.status.error,
                  marginBottom: theme.spacing.md,
                  textAlign: 'center',
                  fontFamily: theme.typography.body2.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                }}
              >
                {error}
              </Text>
            )}

            <Button
              title="Anmelden"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={{ marginBottom: theme.spacing.lg }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={{ marginBottom: theme.spacing.xl }}
            >
              <Text
                style={{
                  color: theme.colors.primary.main,
                  textAlign: 'center',
                  fontFamily: theme.typography.body2.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                }}
              >
                Passwort vergessen?
              </Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text
                style={{
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.body2.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                }}
              >
                Noch kein Konto?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text
                  style={{
                    color: theme.colors.primary.main,
                    marginLeft: theme.spacing.xs,
                    fontFamily: theme.typography.body2.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: '500',
                  }}
                >
                  Registrieren
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});