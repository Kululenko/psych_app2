import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';
import { borderRadius } from './borderRadius';

export const theme = {
  colors,
  spacing,
  typography,
  shadows,
  borderRadius,
};

export type Theme = typeof theme;