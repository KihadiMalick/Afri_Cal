/**
 * LIXUM Design Tokens — Metallic Brushed Industrial
 * Dark metallic grays + emerald accent (#00C896 / #00E5A0)
 */

export const DARK = {
  // Backgrounds — metallic dark gradients
  mainBg:        '#0A0C0F',
  sidebarBg1:    '#08090C',
  sidebarBg2:    '#0A0B0E',
  sidebarBg3:    '#08090C',
  inputBg:       'rgba(12,14,18,0.75)',
  rowBg:         'rgba(255,255,255,0.03)',

  // Cards — brushed metal panels
  cardBg:        'rgba(18,22,28,0.65)',
  cardBorder:    'rgba(120,130,150,0.12)',
  vCardBg1:      'rgba(0,201,150,0.06)',
  vCardBg2:      'rgba(12,16,22,0.80)',
  vCardBorder:   'rgba(0,201,150,0.18)',

  // Text hierarchy — high contrast on dark metal
  t1:            'rgba(255,255,255,0.95)',
  t2:            'rgba(200,210,225,0.78)',
  t3:            'rgba(160,170,185,0.60)',
  t4:            'rgba(120,130,150,0.45)',

  // Accent (Emerald)
  accent:        '#00E5A0',
  accentSub:     'rgba(0,200,150,0.50)',
  accentGlow:    'rgba(0,229,160,0.35)',

  // Sidebar — brushed steel
  sidebarBorder:    'rgba(120,130,150,0.08)',
  logoBoxBg:        'rgba(0,229,160,0.04)',
  logoBoxBorder:    'rgba(0,229,160,0.22)',
  logoLetter:       '#9CA3AF',
  navActiveBg:      'rgba(0,201,150,0.08)',
  navHoverBg:       'rgba(255,255,255,0.03)',
  iconActive:       '#00E5A0',
  iconInactive:     'rgba(160,170,185,0.40)',
  labelActive:      'rgba(0,229,160,0.90)',
  labelInactive:    'rgba(160,170,185,0.40)',
  lixumSubColor:    'rgba(0,229,160,0.40)',
  logoutColor:      'rgba(160,170,185,0.45)',
  indicatorColor:   '#00E5A0',

  // Semantic
  amber:         '#f59e0b',
  amberLight:    '#eab308',
  amberDark:     '#ea580c',
  blue:          '#60a5fa',
  purple:        '#a78bfa',
  green:         '#34d399',
  red:           '#f87171',
  redBg:         'rgba(239,68,68,0.06)',
  redBorder:     'rgba(239,68,68,0.20)',

  // Metallic orange accent (for objectives/consumption labels)
  metalOrange:   '#D4915C',

  // Pulse — subtle emerald
  pulseCenter:   'rgba(0,229,160,0.12)',
  pulseEdge:     'rgba(0,229,160,0.04)',
  ringBorder:    'rgba(0,229,160,0.08)',

  // ECG overlay
  ecgOverlay:    'rgba(4,5,8,0.94)',

  // Tab bar — dark steel
  tabBarBg:      'rgba(10,12,15,0.95)',
  tabBarBorder:  'rgba(120,130,150,0.08)',
} as const;

export type LixumTokens = {
  [K in keyof typeof DARK]: string;
};
