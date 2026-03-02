/**
 * LIXUM Design System - Color Tokens
 * Dark-first design with neon green accent
 */

export const colors = {
  // LIXUM Core
  lixum: {
    bg: '#0a0a0a',
    surface: '#111111',
    surfaceLight: '#1a1a1a',
    border: '#222222',
    borderLight: '#333333',
    neon: '#00ff9d',
    neonDim: 'rgba(0, 255, 157, 0.15)',
    neonSubtle: 'rgba(0, 255, 157, 0.08)',
    cyan: '#00e5ff',
    cyanDim: 'rgba(0, 229, 255, 0.15)',
    text: '#e0e0e0',
    textMuted: '#888888',
  },

  // LIXUM Light Mode
  light: {
    bg: '#f5f5f5',
    surface: '#ffffff',
    surfaceSecondary: '#eeeeee',
    border: '#d4d4d4',
    borderLight: '#e0e0e0',
    text: '#1a1a1a',
    textSecondary: '#555555',
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
