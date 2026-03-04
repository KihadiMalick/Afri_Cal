/**
 * LIXUM Design Tokens — Premium Glassmorphism
 * Dark-only theme with emerald accent (#00C896 / #00E5A0)
 */

export const DARK = {
  // Backgrounds
  mainBg:        '#080F0D',
  sidebarBg1:    '#060D0A',
  sidebarBg2:    '#070E0B',
  sidebarBg3:    '#060D0A',
  inputBg:       'rgba(0,8,4,0.58)',
  rowBg:         'rgba(255,255,255,0.04)',

  // Cards (premium glass — circuit lines show through)
  cardBg:        'rgba(255,255,255,0.04)',
  cardBorder:    'rgba(0,201,150,0.15)',
  vCardBg1:      'rgba(0,201,150,0.08)',
  vCardBg2:      'rgba(0,201,150,0.03)',
  vCardBorder:   'rgba(0,201,150,0.22)',

  // Text hierarchy
  t1:            'rgba(255,255,255,0.96)',
  t2:            'rgba(255,255,255,0.75)',
  t3:            'rgba(255,255,255,0.55)',
  t4:            'rgba(255,255,255,0.38)',

  // Accent (Emerald)
  accent:        '#00E5A0',
  accentSub:     'rgba(0,200,150,0.55)',
  accentGlow:    'rgba(0,229,160,0.40)',

  // Sidebar
  sidebarBorder:    'rgba(0,201,150,0.08)',
  logoBoxBg:        'rgba(0,201,150,0.06)',
  logoBoxBorder:    'rgba(0,201,150,0.20)',
  logoLetter:       '#7d8590',
  navActiveBg:      'rgba(0,201,150,0.07)',
  navHoverBg:       'rgba(255,255,255,0.03)',
  iconActive:       '#00E5A0',
  iconInactive:     'rgba(255,255,255,0.40)',
  labelActive:      'rgba(0,229,160,0.92)',
  labelInactive:    'rgba(255,255,255,0.40)',
  lixumSubColor:    'rgba(0,229,160,0.42)',
  logoutColor:      'rgba(255,255,255,0.45)',
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

  // Pulse
  pulseCenter:   'rgba(0,229,160,0.18)',
  pulseEdge:     'rgba(0,229,160,0.06)',
  ringBorder:    'rgba(0,229,160,0.10)',

  // ECG overlay
  ecgOverlay:    'rgba(0,6,3,0.94)',

  // Tab bar
  tabBarBg:      'rgba(8,15,13,0.95)',
  tabBarBorder:  'rgba(0,201,150,0.08)',
} as const;

export type LixumTokens = {
  [K in keyof typeof DARK]: string;
};
