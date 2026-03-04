/**
 * LIXUM Design Tokens — Afro-Futuristic Bio-Digital
 * Dark-only theme with neon green accent (#00ff9d)
 */

export const DARK = {
  // Backgrounds
  mainBg:        '#020c07',
  sidebarBg1:    '#010d06',
  sidebarBg2:    '#020f08',
  sidebarBg3:    '#011009',
  inputBg:       'rgba(0,8,4,0.58)',
  rowBg:         'rgba(255,255,255,0.055)',

  // Cards (glass-transparent — circuit lines show through)
  cardBg:        'rgba(255,255,255,0.04)',
  cardBorder:    'rgba(255,255,255,0.10)',
  vCardBg1:      'rgba(0,255,157,0.06)',
  vCardBg2:      'rgba(0,255,157,0.02)',
  vCardBorder:   'rgba(0,255,157,0.18)',

  // Text hierarchy (bright for readability on glass)
  t1:            'rgba(255,255,255,0.96)',
  t2:            'rgba(255,255,255,0.75)',
  t3:            'rgba(255,255,255,0.55)',
  t4:            'rgba(255,255,255,0.38)',

  // Accent
  accent:        '#00ff9d',
  accentSub:     'rgba(0,255,157,0.55)',
  accentGlow:    'rgba(0,255,157,0.40)',

  // Sidebar
  sidebarBorder:    'rgba(0,255,157,0.07)',
  logoBoxBg:        'rgba(0,255,157,0.06)',
  logoBoxBorder:    'rgba(0,255,157,0.20)',
  logoLetter:       '#7d8590',
  navActiveBg:      'rgba(0,255,157,0.07)',
  navHoverBg:       'rgba(255,255,255,0.03)',
  iconActive:       '#00ff9d',
  iconInactive:     'rgba(255,255,255,0.55)',
  labelActive:      'rgba(0,255,157,0.92)',
  labelInactive:    'rgba(255,255,255,0.52)',
  lixumSubColor:    'rgba(0,255,157,0.42)',
  logoutColor:      'rgba(255,255,255,0.45)',
  indicatorColor:   '#00ff9d',

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
  pulseCenter:   'rgba(0,255,157,0.18)',
  pulseEdge:     'rgba(0,255,157,0.06)',
  ringBorder:    'rgba(0,255,157,0.10)',

  // ECG overlay
  ecgOverlay:    'rgba(0,6,3,0.94)',

  // Tab bar
  tabBarBg:      'rgba(2,12,7,0.95)',
  tabBarBorder:  'rgba(0,255,157,0.08)',
} as const;

export type LixumTokens = {
  [K in keyof typeof DARK]: string;
};
