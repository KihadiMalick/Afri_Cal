export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, layout } from './spacing';
export { shadows } from './shadows';

/**
 * Theme configuration for dark (LIXUM) and light (Africount) modes
 */
export const darkTheme = {
  mode: 'dark' as const,
  background: '#0a0a0a',
  surface: '#111111',
  surfaceSecondary: '#1a1a1a',
  border: '#222222',
  text: '#e0e0e0',
  textSecondary: '#888888',
  accent: '#00ff9d',
  accentDim: 'rgba(0, 255, 157, 0.15)',
  tabBar: '#0d0d0d',
  card: '#111111',
};

export const lightTheme = {
  mode: 'light' as const,
  background: '#F7F4E8',
  surface: '#FFFFFF',
  surfaceSecondary: '#EDE8D0',
  border: '#D8D0B0',
  text: '#4A342E',
  textSecondary: '#6B4C3B',
  accent: '#D98E4F',
  accentDim: 'rgba(217, 142, 79, 0.15)',
  tabBar: '#FFFFFF',
  card: '#FFFFFF',
};

export type ThemeMode = 'dark' | 'light';
export type Theme = typeof darkTheme;
