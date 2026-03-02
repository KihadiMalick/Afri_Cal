/**
 * LIXUM Design System - Typography
 * Display: Poppins | Body: Nunito
 *
 * Note: Load fonts via expo-font in App.tsx before rendering
 * For now, use system fonts with fallback
 */

import { Platform } from 'react-native';

const fontFamily = {
  display: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
};

export const typography = {
  fontFamily,

  // Heading sizes
  h1: {
    fontFamily: fontFamily.display,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
  },
  h2: {
    fontFamily: fontFamily.display,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
  },
  h3: {
    fontFamily: fontFamily.display,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h4: {
    fontFamily: fontFamily.display,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },

  // Body sizes
  bodyLg: {
    fontFamily: fontFamily.body,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400' as const,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodyXs: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },

  // Labels
  label: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  labelSm: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
  },

  // Special
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400' as const,
  },
  overline: {
    fontFamily: fontFamily.display,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;
