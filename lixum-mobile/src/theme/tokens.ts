/**
 * LIXUM Design Tokens — Afro-Futuristic Bio-Digital
 * Dark-first with neon green accent (#00ff9d)
 */

export const DARK = {
  // Backgrounds
  mainBg:        '#020c07',
  sidebarBg1:    '#010d06',
  sidebarBg2:    '#020f08',
  sidebarBg3:    '#011009',
  inputBg:       'rgba(0,8,4,0.58)',
  rowBg:         'rgba(255,255,255,0.055)',

  // Cards
  cardBg:        'rgba(2,12,7,0.80)',
  cardBorder:    'rgba(255,255,255,0.11)',
  vCardBg1:      'rgba(255,255,255,0.07)',
  vCardBg2:      'rgba(0,255,157,0.04)',
  vCardBorder:   'rgba(255,255,255,0.10)',

  // Text hierarchy
  t1:            'rgba(255,255,255,0.94)',
  t2:            'rgba(255,255,255,0.68)',
  t3:            'rgba(255,255,255,0.48)',
  t4:            'rgba(255,255,255,0.32)',

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

export const LIGHT = {
  // Backgrounds
  mainBg:        '#eaf7f0',
  sidebarBg1:    '#ecfdf5',
  sidebarBg2:    '#e8fdf2',
  sidebarBg3:    '#dcfce7',
  inputBg:       'rgba(255,255,255,0.85)',
  rowBg:         'rgba(0,120,60,0.07)',

  // Cards
  cardBg:        'rgba(255,255,255,0.92)',
  cardBorder:    'rgba(0,140,70,0.22)',
  vCardBg1:      'rgba(255,255,255,0.92)',
  vCardBg2:      'rgba(0,200,100,0.06)',
  vCardBorder:   'rgba(0,150,70,0.22)',

  // Text hierarchy
  t1:            'rgba(5,30,18,0.94)',
  t2:            'rgba(5,30,18,0.68)',
  t3:            'rgba(5,30,18,0.48)',
  t4:            'rgba(5,30,18,0.32)',

  // Accent
  accent:        '#059669',
  accentSub:     'rgba(5,150,100,0.68)',
  accentGlow:    'rgba(5,150,80,0.30)',

  // Sidebar
  sidebarBorder:    'rgba(0,150,70,0.14)',
  logoBoxBg:        'rgba(0,150,70,0.08)',
  logoBoxBorder:    'rgba(0,150,70,0.28)',
  logoLetter:       '#6b7280',
  navActiveBg:      'rgba(0,150,70,0.08)',
  navHoverBg:       'rgba(0,140,70,0.05)',
  iconActive:       '#059669',
  iconInactive:     'rgba(5,30,18,0.52)',
  labelActive:      '#047857',
  labelInactive:    'rgba(5,30,18,0.52)',
  lixumSubColor:    'rgba(5,150,80,0.50)',
  logoutColor:      'rgba(5,30,18,0.45)',
  indicatorColor:   '#059669',

  // Semantic
  amber:         '#b45309',
  amberLight:    '#d97706',
  amberDark:     '#ea580c',
  blue:          '#2563eb',
  purple:        '#a78bfa',
  green:         '#047857',
  red:           '#dc2626',
  redBg:         'rgba(239,68,68,0.06)',
  redBorder:     'rgba(239,68,68,0.20)',

  // Pulse
  pulseCenter:   'rgba(0,200,100,0.12)',
  pulseEdge:     'rgba(0,200,100,0.04)',
  ringBorder:    'rgba(0,180,90,0.08)',

  // ECG overlay (always dark)
  ecgOverlay:    'rgba(0,6,3,0.94)',

  // Tab bar
  tabBarBg:      'rgba(255,255,255,0.95)',
  tabBarBorder:  'rgba(0,150,70,0.14)',
} as const;

// Use a shape type so both DARK and LIGHT are assignable
export type LixumTokens = {
  [K in keyof typeof DARK]: string;
};
