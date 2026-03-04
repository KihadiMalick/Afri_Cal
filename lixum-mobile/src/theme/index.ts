export { colors, DARK } from './colors';
export type { LixumTokens } from './tokens';
export { FONTS, FONT_SIZES, LETTER_SPACING, typography } from './typography';
export { spacing, borderRadius, layout } from './spacing';
export { shadows } from './shadows';

/**
 * Dark-only theme object for backward compat with existing screens
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

export type Theme = typeof darkTheme;
