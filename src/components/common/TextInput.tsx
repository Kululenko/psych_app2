import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  onRightIconPress?: () => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  touched,
  leftIcon,
  rightIcon,
  containerStyle,
  onRightIconPress,
  secureTextEntry,
  ...rest
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const getBorderColor = () => {
    if (error && touched) return theme.colors.status.error;
    if (isFocused) return theme.colors.primary.main;
    return theme.colors.neutral.light;
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? theme.colors.primary.main : theme.colors.text.secondary,
              fontFamily: theme.typography.subtitle2.fontFamily,
              fontWeight: theme.typography.subtitle2.fontWeight,
              fontSize: theme.typography.subtitle2.fontSize,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.background.primary,
            height: 48,
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <RNTextInput
          style={[
            styles.input,
            {
              fontFamily: theme.typography.body1.fontFamily,
              fontSize: theme.typography.body1.fontSize,
              color: theme.colors.text.primary,
            },
          ]}
          placeholderTextColor={theme.colors.text.hint}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={{ color: theme.colors.primary.main }}>
              {isPasswordVisible ? 'Verbergen' : 'Anzeigen'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && touched && (
        <Text
          style={[
            styles.errorText,
            {
              color: theme.colors.status.error,
              fontFamily: theme.typography.caption.fontFamily,
              fontSize: theme.typography.caption.fontSize,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  errorText: {
    marginTop: 4,
  },
});