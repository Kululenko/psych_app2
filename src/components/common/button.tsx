import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}) => {
  const { theme } = useTheme();
  
  // Styles basierend auf Variante, Größe und Status
  const getContainerStyle = (): ViewStyle => {
    let baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    };

    // Fullwidth
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Größen
    switch (size) {
      case 'small':
        baseStyle.height = 36;
        baseStyle.paddingHorizontal = theme.spacing.sm;
        break;
      case 'medium':
        baseStyle.height = 44;
        break;
      case 'large':
        baseStyle.height = 52;
        baseStyle.paddingHorizontal = theme.spacing.lg;
        break;
    }

    // Varianten
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = disabled 
          ? theme.colors.neutral.light 
          : theme.colors.primary.main;
        break;
      case 'secondary':
        baseStyle.backgroundColor = disabled 
          ? theme.colors.neutral.light 
          : theme.colors.accent.main;
        break;
      case 'outlined':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = disabled 
          ? theme.colors.neutral.light 
          : theme.colors.primary.main;
        break;
      case 'text':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    return baseStyle;
  };

  // Textstyle basierend auf Variante und Status
  const getTextStyle = (): TextStyle => {
    let baseStyle: TextStyle = {
      fontFamily: theme.typography.button.fontFamily,
      fontWeight: theme.typography.button.fontWeight,
      fontSize: theme.typography.button.fontSize,
      letterSpacing: theme.typography.button.letterSpacing,
    };

    // Textfarbe basierend auf Variante
    switch (variant) {
      case 'primary':
      case 'secondary':
        baseStyle.color = disabled 
          ? theme.colors.text.disabled 
          : theme.colors.text.inverse;
        break;
      case 'outlined':
      case 'text':
        baseStyle.color = disabled 
          ? theme.colors.text.disabled 
          : theme.colors.primary.main;
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' || variant === 'secondary' 
            ? theme.colors.text.inverse 
            : theme.colors.primary.main} 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};