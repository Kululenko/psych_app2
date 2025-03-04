// src/screens/main/SettingsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { MainScreenProps } from '../../types/navigation.types';

export const SettingsScreen: React.FC<MainScreenProps<'Settings'>> = ({ navigation }) => {
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [dataUsageEnabled, setDataUsageEnabled] = useState(true);

  // Logout-Funktion
  const handleLogout = async () => {
    Alert.alert(
      'Abmelden',
      'Bist du sicher, dass du dich abmelden möchtest?',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              console.error('Fehler beim Abmelden:', error);
              Alert.alert('Fehler', 'Es gab ein Problem beim Abmelden. Bitte versuche es erneut.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  // Zum Profil navigieren
  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  // Einzelner Einstellungspunkt
  interface SettingItemProps {
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    showDivider?: boolean;
  }

  const SettingItem: React.FC<SettingItemProps> = ({
    title,
    subtitle,
    rightElement,
    onPress,
    showDivider = true,
  }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        showDivider && {
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.neutral.light,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingTextContainer}>
        <Text
          style={[
            styles.settingTitle,
            {
              fontFamily: theme.typography.subtitle1.fontFamily,
              fontSize: theme.typography.subtitle1.fontSize,
              fontWeight: theme.typography.subtitle1.fontWeight,
              color: theme.colors.text.primary,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.settingSubtitle,
              {
                fontFamily: theme.typography.body2.fontFamily,
                fontSize: theme.typography.body2.fontSize,
                color: theme.colors.text.secondary,
              },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  // Abschnittskopf
  interface SectionHeaderProps {
    title: string;
  }

  const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text
        style={[
          styles.sectionTitle,
          {
            fontFamily: theme.typography.subtitle2.fontFamily,
            fontSize: theme.typography.subtitle2.fontSize,
            fontWeight: theme.typography.subtitle2.fontWeight,
            color: theme.colors.primary.main,
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Nutzerbereich */}
        <View
          style={[
            styles.userSection,
            {
              backgroundColor: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.lg,
              ...theme.shadows.sm,
            },
          ]}
        >
          <View style={styles.userInfo}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.primary.light,
                },
              ]}
            >
              <Text style={{ color: theme.colors.text.inverse, fontSize: 18, fontWeight: 'bold' }}>
                {(user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text
                style={[
                  styles.userName,
                  {
                    fontFamily: theme.typography.h3.fontFamily,
                    fontSize: theme.typography.h3.fontSize,
                    fontWeight: theme.typography.h3.fontWeight,
                    color: theme.colors.text.primary,
                  },
                ]}
              >
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || 'Nutzername'}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  {
                    fontFamily: theme.typography.body2.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    color: theme.colors.text.secondary,
                  },
                ]}
              >
                {user?.email || 'email@example.com'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.editProfileButton,
              {
                backgroundColor: theme.colors.primary.main,
                borderRadius: theme.borderRadius.md,
              },
            ]}
            onPress={navigateToProfile}
          >
            <Text
              style={[
                styles.editProfileText,
                {
                  fontFamily: theme.typography.button.fontFamily,
                  fontSize: theme.typography.button.fontSize,
                  fontWeight: theme.typography.button.fontWeight,
                  color: theme.colors.text.inverse,
                },
              ]}
            >
              Profil bearbeiten
            </Text>
          </TouchableOpacity>
        </View>

        {/* Benachrichtigungseinstellungen */}
        <View
          style={[
            styles.settingsSection,
            {
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.colors.neutral.light,
              ...theme.shadows.sm,
            },
          ]}
        >
          <SectionHeader title="Benachrichtigungen" />
          
          <SettingItem
            title="Benachrichtigungen"
            subtitle="Erhalte Erinnerungen für Übungen und Updates"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: theme.colors.neutral.light,
                  true: theme.colors.primary.light,
                }}
                thumbColor={
                  notificationsEnabled
                    ? theme.colors.primary.main
                    : theme.colors.neutral.medium
                }
              />
            }
          />
          
          <SettingItem
            title="Tägliche Erinnerung"
            subtitle={`Erhalte tägliche Erinnerungen um ${reminderTime} Uhr`}
            rightElement={
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  {
                    borderWidth: 1,
                    borderColor: theme.colors.neutral.light,
                    borderRadius: theme.borderRadius.sm,
                  },
                ]}
                onPress={() => {
                  // Hier würde ein Time Picker geöffnet werden
                  Alert.alert('Zeit ändern', 'Hier würde ein Time Picker erscheinen.');
                }}
              >
                <Text
                  style={{
                    fontFamily: theme.typography.body2.fontFamily,
                    fontSize: theme.typography.body2.fontSize,
                    color: theme.colors.text.primary,
                  }}
                >
                  {reminderTime}
                </Text>
              </TouchableOpacity>
            }
            showDivider={false}
          />
        </View>

        {/* Erscheinungsbild */}
        <View
          style={[
            styles.settingsSection,
            {
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.colors.neutral.light,
              ...theme.shadows.sm,
            },
          ]}
        >
          <SectionHeader title="Erscheinungsbild" />
          
          <SettingItem
            title="Dunkelmodus"
            subtitle="Dunkles Farbschema für die App"
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{
                  false: theme.colors.neutral.light,
                  true: theme.colors.primary.light,
                }}
                thumbColor={
                  isDarkMode ? theme.colors.primary.main : theme.colors.neutral.medium
                }
              />
            }
            showDivider={false}
          />
        </View>

        {/* Datenschutz */}
        <View
          style={[
            styles.settingsSection,
            {
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.colors.neutral.light,
              ...theme.shadows.sm,
            },
          ]}
        >
          <SectionHeader title="Datenschutz und Sicherheit" />
          
          <SettingItem
            title="Datennutzung"
            subtitle="Anonyme Nutzungsdaten zur Verbesserung der App teilen"
            rightElement={
              <Switch
                value={dataUsageEnabled}
                onValueChange={setDataUsageEnabled}
                trackColor={{
                  false: theme.colors.neutral.light,
                  true: theme.colors.primary.light,
                }}
                thumbColor={
                  dataUsageEnabled
                    ? theme.colors.primary.main
                    : theme.colors.neutral.medium
                }
              />
            }
          />
          
          <SettingItem
            title="Passwort ändern"
            subtitle="Aktualisiere dein Passwort"
            onPress={() => {
              // Passwort ändern
              Alert.alert('Passwort ändern', 'Hier würde ein Passwort-Änderungsdialog erscheinen.');
            }}
          />
          
          <SettingItem
            title="Datenschutzerklärung"
            onPress={() => {
              // Datenschutzerklärung öffnen
              Alert.alert('Datenschutzerklärung', 'Hier würde die Datenschutzerklärung angezeigt werden.');
            }}
            showDivider={false}
          />
        </View>

        {/* Über die App */}
        <View
          style={[
            styles.settingsSection,
            {
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              borderWidth: 1,
              borderColor: theme.colors.neutral.light,
              ...theme.shadows.sm,
            },
          ]}
        >
          <SectionHeader title="Über die App" />
          
          <SettingItem
            title="App-Version"
            subtitle="1.0.0"
            showDivider={true}
          />
          
          <SettingItem
            title="Nutzungsbedingungen"
            onPress={() => {
              // Nutzungsbedingungen öffnen
              Alert.alert('Nutzungsbedingungen', 'Hier würden die Nutzungsbedingungen angezeigt werden.');
            }}
          />
          
          <SettingItem
            title="Hilfe und Support"
            onPress={() => {
              // Support-Optionen öffnen
              Alert.alert('Hilfe und Support', 'Hier würden Support-Optionen angezeigt werden.');
            }}
            showDivider={false}
          />
        </View>

        {/* Logout-Button */}
        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: theme.colors.status.error + '10', // 10% Opacity
              borderWidth: 1,
              borderColor: theme.colors.status.error,
              borderRadius: theme.borderRadius.md,
            },
          ]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator size="small" color={theme.colors.status.error} />
          ) : (
            <Text
              style={[
                styles.logoutText,
                {
                  fontFamily: theme.typography.button.fontFamily,
                  fontSize: theme.typography.button.fontSize,
                  fontWeight: theme.typography.button.fontWeight,
                  color: theme.colors.status.error,
                },
              ]}
            >
              Abmelden
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  userSection: {
    padding: 16,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {},
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  editProfileText: {},
  settingsSection: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {},
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    marginBottom: 4,
  },
  settingSubtitle: {},
  timeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logoutButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {},
});