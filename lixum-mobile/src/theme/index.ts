export { colors, DARK } from './colors';
export type { LixumTokens } from './tokens';
export { FONTS, FONT_SIZES, LETTER_SPACING, typography } from './typography';
export { spacing, borderRadius, layout } from './spacing';
export { shadows } from './shadows';

/**
 * Dark metallic theme — backward compat
 */
export const darkTheme = {
  mode: 'dark' as const,
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceSecondary: '#252525',
  border: '#3A3A3A',
  text: '#E8E8E8',
  textSecondary: '#888888',
  accent: '#00C896',
  accentDim: 'rgba(0,200,150,0.12)',
  tabBar: 'rgba(13,13,13,0.95)',
  card: '#1A1A1A',
};

export type Theme = typeof darkTheme;
