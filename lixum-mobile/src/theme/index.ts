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
  background: '#0A0C0F',
  surface: 'rgba(18,22,28,0.80)',
  surfaceSecondary: 'rgba(255,255,255,0.04)',
  border: 'rgba(120,130,150,0.10)',
  text: 'rgba(255,255,255,0.94)',
  textSecondary: 'rgba(200,210,225,0.68)',
  accent: '#00E5A0',
  accentDim: 'rgba(0,229,160,0.12)',
  tabBar: 'rgba(10,12,15,0.95)',
  card: 'rgba(18,22,28,0.80)',
};

export type Theme = typeof darkTheme;
