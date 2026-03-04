/**
 * LIXUM Design Tokens — Premium Metallic v2
 * Gradient backgrounds + emerald accent (#00D984)
 * Poppins typography
 */

export const DARK = {
  // Backgrounds — gradient-based, NOT flat black
  mainBg:        '#0D1117',
  sidebarBg1:    '#0D1117',
  sidebarBg2:    '#151B23',
  sidebarBg3:    '#0D1117',
  inputBg:       'rgba(21,27,35,0.75)',
  rowBg:         'rgba(255,255,255,0.02)',

  // Cards — metallic gradient panels
  cardBg:        '#1B1F26',
  cardBorder:    '#3E4855',
  vCardBg1:      '#2E3440',
  vCardBg2:      '#1B1F26',
  vCardBorder:   '#3E4855',

  // Text hierarchy
  t1:            '#EAEEF3',
  t2:            '#B0B8C4',
  t3:            '#8892A0',
  t4:            '#555E6C',

  // Accent (Emerald)
  accent:        '#00D984',
  accentSub:     'rgba(0,217,132,0.50)',
  accentGlow:    'rgba(0,217,132,0.35)',
  accentLight:   '#00FFB2',
  accentDark:    '#00A866',

  // Turquoise (progress bar)
  turquoise:     '#00BFA6',
  turquoiseDark: '#00897B',

  // Sidebar
  sidebarBorder:    '#1C2330',
  logoBoxBg:        'rgba(0,217,132,0.12)',
  logoBoxBorder:    'rgba(0,217,132,0.25)',
  logoLetter:       '#9CA3AF',
  navActiveBg:      'rgba(0,217,132,0.08)',
  navHoverBg:       'rgba(255,255,255,0.03)',
  iconActive:       '#00D984',
  iconInactive:     '#555E6C',
  labelActive:      'rgba(0,217,132,0.90)',
  labelInactive:    '#555E6C',
  lixumSubColor:    '#555E6C',
  logoutColor:      '#555E6C',
  indicatorColor:   '#00D984',

  // Semantic
  amber:         '#f59e0b',
  amberLight:    '#eab308',
  amberDark:     '#ea580c',
  blue:          '#60a5fa',
  purple:        '#a78bfa',
  green:         '#34d399',
  red:           '#FF4444',
  redBg:         'rgba(255,68,68,0.06)',
  redBorder:     'rgba(255,68,68,0.20)',

  // Metallic
  metalLight:    '#6B7B8D',
  metalMid:      '#3A4250',
  metalDark:     '#2A303B',
  metalBorder:   '#3E4855',
  metalShine:    '#6B7B8D',
  metalOrange:   '#D4915C',

  // Surface gradient stops
  metalGrad1:    '#2E3440',
  metalGrad2:    '#1B1F26',
  metalGrad3:    '#252B35',

  // Emerald glow
  emeraldGlow:   'rgba(0,217,132,0.08)',
  emeraldMuted:  'rgba(0,217,132,0.15)',

  // Pulse
  pulseCenter:   'rgba(0,217,132,0.10)',
  pulseEdge:     'rgba(0,217,132,0.03)',
  ringBorder:    'rgba(0,217,132,0.10)',

  // ECG overlay
  ecgOverlay:    'rgba(13,17,23,0.94)',

  // Tab bar
  tabBarBg:      'rgba(13,17,23,0.95)',
  tabBarBorder:  '#1C2330',
} as const;

export type LixumTokens = {
  [K in keyof typeof DARK]: string;
};
