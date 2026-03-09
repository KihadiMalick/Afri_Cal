/**
 * LIXUM Design System — Consolidated Theme for Test Preview
 * All tokens, colors, typography, spacing in one file.
 */

export const DARK = {
  mainBg:        '#0D1117',
  sidebarBg1:    '#0D1117',
  sidebarBg2:    '#151B23',
  inputBg:       'rgba(21,27,35,0.75)',
  rowBg:         'rgba(255,255,255,0.02)',
  cardBg:        '#1B1F26',
  cardBorder:    '#3E4855',
  vCardBg1:      '#2E3440',
  vCardBg2:      '#1B1F26',
  vCardBorder:   '#3E4855',
  t1:            '#EAEEF3',
  t2:            '#B0B8C4',
  t3:            '#8892A0',
  t4:            '#555E6C',
  accent:        '#00D984',
  accentSub:     'rgba(0,217,132,0.50)',
  accentGlow:    'rgba(0,217,132,0.35)',
  accentLight:   '#00FFB2',
  accentDark:    '#00A866',
  turquoise:     '#00BFA6',
  turquoiseDark: '#00897B',
  logoBoxBg:     'rgba(0,217,132,0.12)',
  logoBoxBorder: 'rgba(0,217,132,0.25)',
  logoLetter:    '#9CA3AF',
  amber:         '#f59e0b',
  amberLight:    '#eab308',
  blue:          '#60a5fa',
  purple:        '#a78bfa',
  green:         '#34d399',
  red:           '#FF4444',
  redBg:         'rgba(255,68,68,0.06)',
  redBorder:     'rgba(255,68,68,0.20)',
  metalLight:    '#6B7B8D',
  metalMid:      '#3A4250',
  metalDark:     '#2A303B',
  metalBorder:   '#3E4855',
  metalShine:    '#6B7B8D',
  metalGrad1:    '#2E3440',
  metalGrad2:    '#1B1F26',
  metalGrad3:    '#252B35',
  emeraldGlow:   'rgba(0,217,132,0.08)',
  ecgOverlay:    'rgba(13,17,23,0.94)',
  tabBarBg:      'rgba(13,17,23,0.95)',
  tabBarBorder:  '#1C2330',
} as const;

export const theme = {
  background: '#0D1117',
  surface: '#1B1F26',
  surfaceSecondary: '#252B35',
  border: '#3E4855',
  text: '#EAEEF3',
  textSecondary: '#8892A0',
  accent: '#00D984',
  accentDim: 'rgba(0,217,132,0.12)',
  tabBar: 'rgba(13,17,23,0.95)',
  card: '#1B1F26',
};

export const spacing = {
  xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  '2xl': 24, '3xl': 32, '4xl': 40, '5xl': 48, '6xl': 64,
} as const;

export const borderRadius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20,
  '2xl': 24, card: 28, cardLg: 32, full: 9999,
} as const;

export const layout = {
  screenPaddingH: 16,
  screenPaddingV: 16,
  cardPadding: 20,
  tabBarHeight: 70,
  headerHeight: 56,
} as const;

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
  xs: 12, sm: 14, base: 16, md: 18, lg: 20, xl: 24, '2xl': 30,
} as const;
