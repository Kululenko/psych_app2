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
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TextInput } from '../../components/common/TextInput';
import { Button } from '../../components/common/button';
import { AuthScreenProps } from '../../types/navigation.types';

export const RegisterScreen: React.FC<AuthScreenProps<'Register'>> = ({ navigation }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    firstName: false,
    lastName: false,
    password: false,
    confirmPassword: false,
  });

  // Formular-Validierung
  const validateForm = () => {
    const newErrors = { ...errors };
    let isValid = true;

    // Username-Validierung
    if (!formData.username.trim()) {
      newErrors.username = 'Benutzername ist erforderlich';
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Benutzername muss mindestens 3 Zeichen lang sein';
      isValid = false;
    } else {
      newErrors.username = '';
    }

    // Email-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Bitte gib eine gültige E-Mail-Adresse ein';
      isValid = false;
    } else {
      newErrors.email = '';
    }

    // Passwort-Validierung
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
      isValid = false;
    } else {
      newErrors.password = '';
    }

    // Passwort-Bestätigung
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwort-Bestätigung ist erforderlich';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
      isValid = false;
    } else {
      newErrors.confirmPassword = '';
    }

    setErrors(newErrors);
    setTouched({
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      password: true,
      confirmPassword: true,
    });

    return isValid;
  };

  // Input-Handler
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Validierung bei Änderung, wenn bereits berührt
    if (touched[field as keyof typeof touched]) {
      validateField(field, value);
    }
  };

  // Einzel-Feld-Validierung
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Benutzername ist erforderlich';
        } else if (value.length < 3) {
          newErrors.username = 'Benutzername muss mindestens 3 Zeichen lang sein';
        } else {
          newErrors.username = '';
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'E-Mail ist erforderlich';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Bitte gib eine gültige E-Mail-Adresse ein';
        } else {
          newErrors.email = '';
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Passwort ist erforderlich';
        } else if (value.length < 6) {
          newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
        } else {
          newErrors.password = '';
        }
        
        // Update confirm password validation if it was already touched
        if (touched.confirmPassword) {
          if (formData.confirmPassword !== value) {
            newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
          } else {
            newErrors.confirmPassword = '';
          }
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Passwort-Bestätigung ist erforderlich';
        } else if (formData.password !== value) {
          newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
        } else {
          newErrors.confirmPassword = '';
        }
        break;
    }

    setErrors(newErrors);
  };

  // Blur-Handler für Felder
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field as keyof typeof formData]);
  };

  // Registrierungs-Handler
  const handleRegister = async () => {
    clearError();
    
    if (validateForm()) {
      try {
        await register({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        });
        // Nach erfolgreicher Registrierung wird automatisch zur Hauptapp navigiert
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
              Konto erstellen
            </Text>

            <TextInput
              label="Benutzername"
              placeholder="Benutzername eingeben"
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text)}
              onBlur={() => handleBlur('username')}
              error={errors.username}
              touched={touched.username}
              containerStyle={{ marginBottom: theme.spacing.md }}
            />

            <TextInput
              label="E-Mail"
              placeholder="E-Mail-Adresse eingeben"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              containerStyle={{ marginBottom: theme.spacing.md }}
            />

            <View style={styles.nameContainer}>
              <View style={styles.nameField}>
                <TextInput
                  label="Vorname (optional)"
                  placeholder="Vorname"
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                  containerStyle={{ marginBottom: theme.spacing.md }}
                />
              </View>
              <View style={styles.nameField}>
                <TextInput
                  label="Nachname (optional)"
                  placeholder="Nachname"
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                  containerStyle={{ marginBottom: theme.spacing.md }}
                />
              </View>
            </View>

            <TextInput
              label="Passwort"
              placeholder="Passwort eingeben"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              onBlur={() => handleBlur('password')}
              error={errors.password}
              touched={touched.password}
              containerStyle={{ marginBottom: theme.spacing.md }}
            />

            <TextInput
              label="Passwort wiederholen"
              placeholder="Passwort bestätigen"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              onBlur={() => handleBlur('confirmPassword')}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
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
              title="Registrieren"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={{ marginBottom: theme.spacing.xl }}
            />

            <View style={styles.loginContainer}>
              <Text
                style={{
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.body2.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                }}
              >
                Bereits ein Konto?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text
                  style={{
                    color: theme.colors.primary.main,
                    marginLeft: theme.spacing.xs,
                    fontFamily: theme.typography.body2.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    fontWeight: '500',
                  }}
                >
                  Anmelden
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
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameField: {
    flex: 1,
    marginRight: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});