/**
 * LIXUM Design System - Shadows
 * Adapted from Tailwind box-shadow config
 */

import { Platform } from 'react-native';

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#4A342E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.11,
      shadowRadius: 16,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),

  cardHover: Platform.select({
    ios: {
      shadowColor: '#4A342E',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 24,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),

  button: Platform.select({
    ios: {
      shadowColor: '#B8723A',
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
    terracotta: Platform.select({
      ios: {
        shadowColor: '#D98E4F',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
    gold: Platform.select({
      ios: {
        shadowColor: '#E4C06E',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
    neon: Platform.select({
      ios: {
        shadowColor: '#00ff9d',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {},
    }),
  },
} as const;
