export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius, layout } from './spacing';
export { shadows } from './shadows';

/**
 * Theme configuration for dark and light LIXUM modes
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
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceSecondary: '#eeeeee',
  border: '#d4d4d4',
  text: '#1a1a1a',
  textSecondary: '#555555',
  accent: '#00cc7d',
  accentDim: 'rgba(0, 204, 125, 0.15)',
  tabBar: '#ffffff',
  card: '#ffffff',
};

export type ThemeMode = 'dark' | 'light';
export type Theme = typeof darkTheme;
