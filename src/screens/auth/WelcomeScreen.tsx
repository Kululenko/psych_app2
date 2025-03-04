import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/button';
import { AuthScreenProps } from '../../types/navigation.types';

export const WelcomeScreen: React.FC<AuthScreenProps<'Welcome'>> = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          {/* Platzhalter für App-Logo */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: theme.colors.primary.light,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: theme.colors.text.inverse,
              }}
            >
              Logo
            </Text>
          </View>
          
          <Text
            style={[
              styles.appName,
              {
                fontFamily: theme.typography.h1.fontFamily,
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.h1.fontWeight,
                color: theme.colors.primary.main,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            MindfulMe
          </Text>
          
          <Text
            style={[
              styles.tagline,
              {
                fontFamily: theme.typography.subtitle1.fontFamily,
                fontSize: theme.typography.subtitle1.fontSize,
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.sm,
                marginBottom: theme.spacing.xl,
              },
            ]}
          >
            Dein Begleiter für mentales Wohlbefinden
          </Text>
        </View>

        <View style={styles.featureContainer}>
          <FeatureItem 
            title="Persönliche Übungen" 
            description="Täglich angepasste Übungen für deine mentale Gesundheit"
            theme={theme}
          />
          
          <FeatureItem 
            title="KI-Unterstützung" 
            description="Intelligente Begleitung auf deiner therapeutischen Reise"
            theme={theme}
          />
          
          <FeatureItem 
            title="Fortschrittsverfolgung" 
            description="Visualisiere deinen Weg zu mehr Wohlbefinden"
            theme={theme}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Anmelden"
            onPress={() => navigation.navigate('Login')}
            fullWidth
            style={{ marginBottom: theme.spacing.md }}
          />
          
          <Button
            title="Registrieren"
            variant="outlined"
            onPress={() => navigation.navigate('Register')}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

interface FeatureItemProps {
  title: string;
  description: string;
  theme: any;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description, theme }) => {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: theme.colors.calming.light,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <Text style={{ color: theme.colors.calming.dark }}>✓</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: theme.typography.subtitle1.fontFamily,
            fontSize: theme.typography.subtitle1.fontSize,
            fontWeight: theme.typography.subtitle1.fontWeight,
            color: theme.colors.text.primary,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: theme.typography.body2.fontFamily,
            fontSize: theme.typography.body2.fontSize,
            color: theme.colors.text.secondary,
          }}
        >
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  appName: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featureContainer: {
    marginVertical: 40,
  },
  buttonContainer: {
    marginBottom: 20,
  },
});