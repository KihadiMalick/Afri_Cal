/**
 * LIXUM Design System — Typography
 * Primary: Poppins (Google Font) — friendly, premium, readable
 */

export const FONTS = {
  display:    'Poppins_900Black',
  heading:    'Poppins_700Bold',
  subheading: 'Poppins_600SemiBold',
  body:       'Poppins_400Regular',
  medium:     'Poppins_500Medium',
  light:      'Poppins_300Light',
  mono:       'Courier New',
} as const;

export const FONT_SIZES = {
  tag:    6,
  badge:  7,
  tiny:   9,
  micro:  10,
  xxs:    11,
  xs:     12,
  sm:     14,
  base:   16,
  md:     18,
  lg:     20,
  xl:     24,
  '2xl':  30,
  '3xl':  36,
  '4xl':  36,
  '5xl':  48,
  '6xl':  60,
  '7xl':  72,
} as const;

export const LETTER_SPACING = {
  normal:  0,
  wide:    1,
  wider:   2,
  widest:  3,
  logoSub: 4.5,
  mono:    3.5,
} as const;

export const typography = {
  FONTS,
  FONT_SIZES,
  LETTER_SPACING,
} as const;
