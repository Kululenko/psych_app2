import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { TextInput } from '../../components/common/TextInput';
import { Button } from '../../components/common/button';
import { authService } from '../../api/authService';
import { AuthScreenProps } from '../../types/navigation.types';

export const ForgotPasswordScreen: React.FC<AuthScreenProps<'ForgotPassword'>> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // E-Mail-Validierung
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setEmailError(isValid ? '' : 'Bitte gib eine gültige E-Mail-Adresse ein.');
    return isValid;
  };

  // Passwort-Reset anfordern
  const handleResetPassword = async () => {
    setTouched(true);
    
    if (validateEmail(email)) {
      setIsLoading(true);
      
      try {
        await authService.requestPasswordReset(email);
        setIsSuccess(true);
      } catch (error: any) {
        Alert.alert(
          'Fehler',
          error.response?.data?.detail || 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
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
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              Passwort zurücksetzen
            </Text>

            {isSuccess ? (
              <>
                <Text
                  style={[
                    styles.successText,
                    {
                      fontFamily: theme.typography.body1.fontFamily,
                      fontSize: theme.typography.body1.fontSize,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.xl,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Wir haben dir eine E-Mail mit Anweisungen zum Zurücksetzen deines Passworts gesendet.
                </Text>

                <Button
                  title="Zurück zum Login"
                  onPress={() => navigation.navigate('Login')}
                  fullWidth
                />
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      fontFamily: theme.typography.body1.fontFamily,
                      fontSize: theme.typography.body1.fontSize,
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.xl,
                      textAlign: 'center',
                    },
                  ]}
                >
                  Gib deine E-Mail-Adresse ein, und wir senden dir einen Link zum Zurücksetzen deines Passworts.
                </Text>

                <TextInput
                  label="E-Mail"
                  placeholder="E-Mail-Adresse eingeben"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (touched) validateEmail(text);
                  }}
                  onBlur={() => {
                    setTouched(true);
                    validateEmail(email);
                  }}
                  error={emailError}
                  touched={touched}
                  containerStyle={{ marginBottom: theme.spacing.xl }}
                />

                <Button
                  title="Passwort zurücksetzen"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  fullWidth
                  style={{ marginBottom: theme.spacing.lg }}
                />

                <Button
                  title="Zurück zum Login"
                  variant="text"
                  onPress={() => navigation.navigate('Login')}
                  fullWidth
                />
              </>
            )}
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
  subtitle: {
    textAlign: 'center',
  },
  successText: {
    textAlign: 'center',
  },
});