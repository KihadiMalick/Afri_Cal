/**
 * LIXUM Design System - Color Tokens
 * Adapted from Tailwind config (Africount organic African aesthetic)
 */

export const colors = {
  // Brand Core
  brand: {
    cream: '#F7F4E8',
    creamDark: '#EDE8D0',
    creamDeep: '#D8D0B0',
  },

  // Brown (Wood / Text)
  brown: {
    dark: '#4A342E',
    medium: '#6B4C3B',
    wood: '#7C5842',
    light: '#A67860',
    pale: '#C9A882',
  },

  // Terracotta (Primary)
  terracotta: {
    main: '#D98E4F',
    dark: '#B8723A',
    light: '#E8AB72',
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#D98E4F',
    600: '#B8723A',
    700: '#9A5B2A',
    800: '#7C451A',
    900: '#5E2F0A',
    950: '#431A00',
  },

  // Indigo (Accents)
  indigo: {
    main: '#303F9F',
    light: '#5C6BC0',
    dark: '#1A237E',
    50: '#E8EAF6',
    100: '#C5CAE9',
    200: '#9FA8DA',
    300: '#7986CB',
    400: '#5C6BC0',
    500: '#3F51B5',
    600: '#3949AB',
    700: '#303F9F',
    800: '#283593',
    900: '#1A237E',
  },

  // Gold (Decorative)
  gold: {
    main: '#E4C06E',
    dark: '#C9A040',
    light: '#F0D48A',
    accent: '#D4AF37',
  },

  // LIXUM Dark Theme (Auth / Shell)
  lixum: {
    bg: '#0a0a0a',
    surface: '#111111',
    surfaceLight: '#1a1a1a',
    border: '#222222',
    borderLight: '#333333',
    neon: '#00ff9d',
    neonDim: 'rgba(0, 255, 157, 0.15)',
    cyan: '#00e5ff',
    text: '#e0e0e0',
    textMuted: '#888888',
  },

  // Semantic
  semantic: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  // Neutral
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
} as const;

export type ColorTheme = typeof colors;
