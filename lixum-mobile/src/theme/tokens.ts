/**
 * LIXUM Design Tokens — Premium Metallic Brushed Industrial
 * Dark metallic grays + emerald accent (#00C896 / #00E5A0)
 * Poppins typography — friendly, premium, readable
 */

export const DARK = {
  // Backgrounds — deep noir metallic
  mainBg:        '#0D0D0D',
  sidebarBg1:    '#0A0A0A',
  sidebarBg2:    '#0D0D0D',
  sidebarBg3:    '#0A0A0A',
  inputBg:       'rgba(26,26,26,0.75)',
  rowBg:         'rgba(255,255,255,0.02)',

  // Cards — brushed metal panels
  cardBg:        '#1A1A1A',
  cardBorder:    '#3A3A3A',
  vCardBg1:      'rgba(0,200,150,0.07)',
  vCardBg2:      'rgba(30,30,30,0.90)',
  vCardBorder:   'rgba(0,200,150,0.20)',

  // Text hierarchy
  t1:            '#E8E8E8',
  t2:            '#B0B0B0',
  t3:            '#888888',
  t4:            '#666666',

  // Accent (Emerald)
  accent:        '#00C896',
  accentSub:     'rgba(0,200,150,0.50)',
  accentGlow:    'rgba(0,200,150,0.35)',
  accentLight:   '#00E6A8',
  accentDark:    '#009B74',

  // Sidebar — dark steel
  sidebarBorder:    '#1A1A1A',
  logoBoxBg:        'rgba(0,200,150,0.05)',
  logoBoxBorder:    'rgba(0,200,150,0.25)',
  logoLetter:       '#9CA3AF',
  navActiveBg:      'rgba(0,200,150,0.08)',
  navHoverBg:       'rgba(255,255,255,0.03)',
  iconActive:       '#00C896',
  iconInactive:     'rgba(136,136,136,0.50)',
  labelActive:      'rgba(0,200,150,0.90)',
  labelInactive:    'rgba(136,136,136,0.50)',
  lixumSubColor:    'rgba(0,200,150,0.45)',
  logoutColor:      '#666666',
  indicatorColor:   '#00C896',

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

  // Metallic orange accent (objective/consumption labels)
  metalOrange:   '#D4915C',

  // Surface metallic gradient stops
  metalGrad1:    '#2A2A2A',
  metalGrad2:    '#1E1E1E',
  metalGrad3:    '#232323',

  // Emerald glow
  emeraldGlow:   'rgba(0, 200, 150, 0.15)',

  // Pulse
  pulseCenter:   'rgba(0,200,150,0.10)',
  pulseEdge:     'rgba(0,200,150,0.03)',
  ringBorder:    'rgba(0,200,150,0.10)',

  // ECG overlay
  ecgOverlay:    'rgba(13,13,13,0.94)',

  // Tab bar
  tabBarBg:      'rgba(13,13,13,0.95)',
  tabBarBorder:  '#1A1A1A',
} as const;

export type LixumTokens = {
  [K in keyof typeof DARK]: string;
};
