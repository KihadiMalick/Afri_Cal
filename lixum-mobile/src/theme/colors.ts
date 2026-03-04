/**
 * LIXUM Design System — Color Tokens
 * Dark metallic industrial design
 */
export { DARK } from './tokens';
export type { LixumTokens } from './tokens';

export const colors = {
  lixum: {
    bg: '#0D1117',
    surface: '#1B1F26',
    surfaceLight: '#252B35',
    border: '#3E4855',
    borderLight: '#2A303B',
    neon: '#00D984',
    neonDim: 'rgba(0,217,132,0.12)',
    neonSubtle: 'rgba(0,217,132,0.06)',
    cyan: '#00BFA6',
    cyanDim: 'rgba(0,191,166,0.12)',
    text: '#EAEEF3',
    textMuted: '#8892A0',
  },
  semantic: {
    success: '#00D984',
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
