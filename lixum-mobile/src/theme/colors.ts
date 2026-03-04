/**
 * LIXUM Design System — Color Tokens
 * Dark-only Afro-Futuristic design
 */
export { DARK } from './tokens';
export type { LixumTokens } from './tokens';

export const colors = {
  lixum: {
    bg: '#020c07',
    surface: 'rgba(2,12,7,0.80)',
    surfaceLight: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.11)',
    borderLight: 'rgba(255,255,255,0.10)',
    neon: '#00ff9d',
    neonDim: 'rgba(0,255,157,0.15)',
    neonSubtle: 'rgba(0,255,157,0.08)',
    cyan: '#00e5ff',
    cyanDim: 'rgba(0,229,255,0.15)',
    text: 'rgba(255,255,255,0.94)',
    textMuted: 'rgba(255,255,255,0.68)',
  },
  semantic: {
    success: '#34d399',
    error: '#f87171',
    warning: '#f59e0b',
    info: '#60a5fa',
  },
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
