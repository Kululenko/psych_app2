import { TextStyle } from 'react-native';

type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

interface TypographyStyle {
  fontFamily: string;
  fontWeight: FontWeight;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export const typography: Record<string, TypographyStyle> = {
  h1: {
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h3: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 28,
  },
  h4: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle1: {
    fontFamily: 'System',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
  subtitle2: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
  },
  body1: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    fontFamily: 'System',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  caption: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
  },
};