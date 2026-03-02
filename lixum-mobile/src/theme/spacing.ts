/**
 * LIXUM Design System - Spacing & Layout
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 20,    // 1.25rem
  cardSm: 14,  // 0.875rem
  full: 9999,
} as const;

export const layout = {
  screenPaddingH: 16,
  screenPaddingV: 16,
  cardPadding: 16,
  cardPaddingSm: 12,
  cardPaddingLg: 20,
  tabBarHeight: 64,
  headerHeight: 56,
  sidebarWidth: 56,
  sidebarWidthExpanded: 72,
} as const;
