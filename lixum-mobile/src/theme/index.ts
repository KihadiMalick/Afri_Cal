export { colors, DARK, LIGHT } from './colors';
export type { LixumTokens } from './tokens';
export { FONTS, FONT_SIZES, LETTER_SPACING, typography } from './typography';
export { spacing, borderRadius, layout } from './spacing';
export { shadows } from './shadows';

/**
 * Legacy theme objects for backward compat with existing screens
 */
export const darkTheme = {
  mode: 'dark' as const,
  background: '#020c07',
  surface: 'rgba(2,12,7,0.80)',
  surfaceSecondary: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.11)',
  text: 'rgba(255,255,255,0.94)',
  textSecondary: 'rgba(255,255,255,0.68)',
  accent: '#00ff9d',
  accentDim: 'rgba(0,255,157,0.15)',
  tabBar: 'rgba(2,12,7,0.95)',
  card: 'rgba(2,12,7,0.80)',
};

export const lightTheme = {
  mode: 'light' as const,
  background: '#eaf7f0',
  surface: 'rgba(255,255,255,0.92)',
  surfaceSecondary: 'rgba(0,200,100,0.06)',
  border: 'rgba(0,140,70,0.22)',
  text: 'rgba(5,30,18,0.94)',
  textSecondary: 'rgba(5,30,18,0.68)',
  accent: '#059669',
  accentDim: 'rgba(5,150,100,0.15)',
  tabBar: 'rgba(255,255,255,0.95)',
  card: 'rgba(255,255,255,0.92)',
};

export type ThemeMode = 'dark' | 'light';
export type Theme = typeof darkTheme;
