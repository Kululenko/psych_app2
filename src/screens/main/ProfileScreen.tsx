// src/screens/main/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { MainScreenProps } from '../../types/navigation.types';
import { TextInput } from '../../components/common/TextInput';
import { Button } from '../../components/common/button';
import apiClient from '../../api/apiClient';
import { ENDPOINTS } from '../../api/endpoints';
import { User } from '../../types/auth.types';

export const ProfileScreen: React.FC<MainScreenProps<'Profile'>> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, checkAuthStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Formularfelder
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Formularfehler
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Touched-Status für Felder
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    firstName: false,
    lastName: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  
  // Passwort-Änderungsmodus
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Formular mit Benutzerdaten füllen
  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  // Input-Handler
  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Validierung, wenn das Feld bereits berührt wurde
    if (touched[field as keyof typeof touched]) {
      validateField(field, value);
    }
  };

  // Blur-Handler
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field as keyof typeof formData]);
  };

  // Validierung eines einzelnen Feldes
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
        
      case 'currentPassword':
        if (isChangingPassword && !value) {
          newErrors.currentPassword = 'Aktuelles Passwort ist erforderlich';
        } else {
          newErrors.currentPassword = '';
        }
        break;
        
      case 'newPassword':
        if (isChangingPassword) {
          if (!value) {
            newErrors.newPassword = 'Neues Passwort ist erforderlich';
          } else if (value.length < 6) {
            newErrors.newPassword = 'Passwort muss mindestens 6 Zeichen lang sein';
          } else {
            newErrors.newPassword = '';
          }
          
          // Auch confirmPassword validieren, falls es bereits eingegeben wurde
          if (touched.confirmPassword && formData.confirmPassword) {
            if (formData.confirmPassword !== value) {
              newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
            } else {
              newErrors.confirmPassword = '';
            }
          }
        }
        break;
        
      case 'confirmPassword':
        if (isChangingPassword) {
          if (!value) {
            newErrors.confirmPassword = 'Passwort-Bestätigung ist erforderlich';
          } else if (value !== formData.newPassword) {
            newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
          } else {
            newErrors.confirmPassword = '';
          }
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // Gesamtes Formular validieren
  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    const fieldsToValidate = ['username', 'email'];
    
    if (isChangingPassword) {
      fieldsToValidate.push('currentPassword', 'newPassword', 'confirmPassword');
    }
    
    // Alle relevanten Felder validieren
    fieldsToValidate.forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
      if (newErrors[field as keyof typeof errors]) {
        isValid = false;
      }
    });
    
    // Alle relevanten Felder als berührt markieren
    const newTouched = { ...touched };
    fieldsToValidate.forEach(field => {
      newTouched[field as keyof typeof touched] = true;
    });
    setTouched(newTouched);
    
    return isValid;
  };

  // Profil aktualisieren
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Profilupdates vorbereiten
      const profileData: Partial<User> = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      };
      
      // Wenn Passwort geändert werden soll, zusätzliche Daten hinzufügen
      if (isChangingPassword) {
        Object.assign(profileData, {
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        });
      }
      
      // Profil aktualisieren
      await apiClient.patch(`${ENDPOINTS.USER.PROFILE}`, profileData);
      
      // Auth-Status aktualisieren
      await checkAuthStatus();
      
      // Erfolg anzeigen
      Alert.alert(
        'Erfolg',
        'Dein Profil wurde erfolgreich aktualisiert.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      console.error('Fehler beim Aktualisieren des Profils:', err);
      
      // Fehlermeldung anzeigen
      setError(
        err.response?.data?.detail ||
        'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ fontSize: 20, color: theme.colors.primary.main }}>
                ←
              </Text>
            </TouchableOpacity>
            
            <Text
              style={[
                styles.title,
                {
                  fontFamily: theme.typography.h2.fontFamily,
                  fontSize: theme.typography.h2.fontSize,
                  fontWeight: theme.typography.h2.fontWeight,
                  color: theme.colors.text.primary,
                },
              ]}
            >
              Profil bearbeiten
            </Text>
            
            <View style={styles.spacer} />
          </View>

          {/* Profilbild / Avatar */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.primary.light,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.colors.text.inverse,
                  fontSize: 32,
                  fontWeight: 'bold',
                }}
              >
                {(formData.firstName?.charAt(0) ||
                  formData.username?.charAt(0) ||
                  'U'
                ).toUpperCase()}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.changeAvatarButton,
                {
                  backgroundColor: theme.colors.primary.main,
                  borderRadius: theme.borderRadius.round,
                },
              ]}
              onPress={() => {
                Alert.alert(
                  'Profilbild ändern',
                  'Hier würde ein Bild-Upload-Dialog erscheinen.'
                );
              }}
            >
              <Text style={{ color: theme.colors.text.inverse, fontSize: 20 }}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Fehleranzeige */}
          {error && (
            <View
              style={[
                styles.errorContainer,
                {
                  backgroundColor: theme.colors.status.error + '20', // 20% Opacity
                  borderColor: theme.colors.status.error,
                  borderRadius: theme.borderRadius.md,
                },
              ]}
            >
              <Text
                style={{
                  color: theme.colors.status.error,
                  fontFamily: theme.typography.body2.fontFamily,
                  fontSize: theme.typography.body2.fontSize,
                }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Formular */}
          <View style={styles.formContainer}>
            <TextInput
              label="Benutzername"
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text)}
              onBlur={() => handleBlur('username')}
              error={errors.username}
              touched={touched.username}
              containerStyle={{ marginBottom: 16 }}
            />
            
            <TextInput
              label="E-Mail"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              onBlur={() => handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              containerStyle={{ marginBottom: 16 }}
            />
            
            <View style={styles.nameRow}>
              <View style={[styles.halfInput, { marginRight: 8 }]}>
                <TextInput
                  label="Vorname (optional)"
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                  containerStyle={{ marginBottom: 16 }}
                />
              </View>
              <View style={styles.halfInput}>
                <TextInput
                  label="Nachname (optional)"
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                  containerStyle={{ marginBottom: 16 }}
                />
              </View>
            </View>

            {/* Passwort-Änderungsbereich */}
            <TouchableOpacity
              style={[
                styles.passwordToggle,
                {
                  backgroundColor: isChangingPassword
                    ? theme.colors.primary.light + '20' // 20% Opacity
                    : 'transparent',
                  borderRadius: theme.borderRadius.md,
                  borderWidth: 1,
                  borderColor: isChangingPassword
                    ? theme.colors.primary.light
                    : theme.colors.neutral.light,
                },
              ]}
              onPress={() => setIsChangingPassword(!isChangingPassword)}
            >
              <Text
                style={[
                  styles.passwordToggleText,
                  {
                    fontFamily: theme.typography.subtitle1.fontFamily,
                    fontWeight: theme.typography.subtitle1.fontWeight,
                    color: isChangingPassword
                      ? theme.colors.primary.main
                      : theme.colors.text.primary,
                  },
                ]}
              >
                {isChangingPassword ? 'Passwort-Änderung abbrechen' : 'Passwort ändern'}
              </Text>
            </TouchableOpacity>

            {isChangingPassword && (
              <View style={styles.passwordSection}>
                <TextInput
                  label="Aktuelles Passwort"
                  secureTextEntry
                  value={formData.currentPassword}
                  onChangeText={(text) => handleInputChange('currentPassword', text)}
                  onBlur={() => handleBlur('currentPassword')}
                  error={errors.currentPassword}
                  touched={touched.currentPassword}
                  containerStyle={{ marginBottom: 16 }}
                />
                
                <TextInput
                  label="Neues Passwort"
                  secureTextEntry
                  value={formData.newPassword}
                  onChangeText={(text) => handleInputChange('newPassword', text)}
                  onBlur={() => handleBlur('newPassword')}
                  error={errors.newPassword}
                  touched={touched.newPassword}
                  containerStyle={{ marginBottom: 16 }}
                />
                
                <TextInput
                  label="Neues Passwort bestätigen"
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(text) => handleInputChange('confirmPassword', text)}
                  onBlur={() => handleBlur('confirmPassword')}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  containerStyle={{ marginBottom: 16 }}
                />
              </View>
            )}

            {/* Speichern und Abbrechen */}
            <View style={styles.buttonsContainer}>
              <Button
                title="Speichern"
                onPress={handleUpdateProfile}
                loading={saving}
                style={{ marginBottom: 16 }}
                fullWidth
              />
              
              <Button
                title="Abbrechen"
                variant="outlined"
                onPress={() => navigation.goBack()}
                disabled={saving}
                fullWidth
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    textAlign: 'center',
  },
  spacer: {
    width: 40, // Gleiche Breite wie der Zurück-Button für ein gleichmäßiges Layout
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 12,
    marginBottom: 16,
  },
  formContainer: {},
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
  },
  passwordToggle: {
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  passwordToggleText: {},
  passwordSection: {
    marginBottom: 16,
  },
  buttonsContainer: {
    marginTop: 8,
  },
});