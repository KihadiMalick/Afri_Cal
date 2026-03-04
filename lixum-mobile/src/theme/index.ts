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
  background: '#0D1117',
  surface: '#1B1F26',
  surfaceSecondary: '#252B35',
  border: '#3E4855',
  text: '#EAEEF3',
  textSecondary: '#8892A0',
  accent: '#00D984',
  accentDim: 'rgba(0,217,132,0.12)',
  tabBar: 'rgba(13,17,23,0.95)',
  card: '#1B1F26',
};

export type Theme = typeof darkTheme;
