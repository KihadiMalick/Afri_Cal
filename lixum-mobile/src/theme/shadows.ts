/**
 * LIXUM Design System — Shadows (Afro-Futuristic)
 */

import { Platform } from 'react-native';

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.42,
      shadowRadius: 14,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),

  vitalityCard: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 24,
    },
    android: {
      elevation: 10,
    },
    default: {},
  }),

  button: Platform.select({
    ios: {
      shadowColor: '#00ff9d',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),

  subtle: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),

  glow: {
    neon: Platform.select({
      ios: {
        shadowColor: '#00ff9d',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
} as const;
