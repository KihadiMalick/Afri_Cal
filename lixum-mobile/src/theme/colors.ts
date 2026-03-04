/**
 * LIXUM Design System — Color Tokens
 * Dark metallic industrial design
 */
export { DARK } from './tokens';
export type { LixumTokens } from './tokens';

export const colors = {
  lixum: {
    bg: '#0A0C0F',
    surface: 'rgba(18,22,28,0.80)',
    surfaceLight: 'rgba(255,255,255,0.04)',
    border: 'rgba(120,130,150,0.10)',
    borderLight: 'rgba(120,130,150,0.06)',
    neon: '#00E5A0',
    neonDim: 'rgba(0,229,160,0.12)',
    neonSubtle: 'rgba(0,229,160,0.06)',
    cyan: '#00e5ff',
    cyanDim: 'rgba(0,229,255,0.12)',
    text: 'rgba(255,255,255,0.94)',
    textMuted: 'rgba(200,210,225,0.68)',
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
