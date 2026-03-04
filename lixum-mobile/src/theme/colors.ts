/**
 * LIXUM Design System — Color Tokens
 * Dark metallic industrial design
 */
export { DARK } from './tokens';
export type { LixumTokens } from './tokens';

export const colors = {
  lixum: {
    bg: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceLight: '#252525',
    border: '#3A3A3A',
    borderLight: '#2A2A2A',
    neon: '#00C896',
    neonDim: 'rgba(0,200,150,0.12)',
    neonSubtle: 'rgba(0,200,150,0.06)',
    cyan: '#00e5ff',
    cyanDim: 'rgba(0,229,255,0.12)',
    text: '#E8E8E8',
    textMuted: '#888888',
  },
  semantic: {
    success: '#00C896',
    error: '#FF4444',
    warning: '#FF8C00',
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
