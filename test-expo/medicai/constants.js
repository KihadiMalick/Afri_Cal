import { Dimensions, PixelRatio } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Responsive system ────────────────────────────────────────────────────────
export const W = SCREEN_WIDTH;
export const BASE_WIDTH = 320;
export const wp = (size) => (W / BASE_WIDTH) * size;
export const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ============================================
// CONFIG SUPABASE (même que les autres pages)
// ============================================
export const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';

// User test (même UUID que partout)
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ============================================
// SYSTÈME ÉNERGIE LIXUM
// ============================================
export const ENERGY_CONFIG = {
  TOKEN_DIVISOR: 120,
  FREE_DAILY_ENERGY: 100,
  ONBOARDING_DAILY_ENERGY: 50,
  ONBOARDING_DAYS: 7,
  SILVER_DAILY_ENERGY: 60,
  GOLD_DAILY_ENERGY: 150,
  PLATINUM_DAILY_ENERGY: 300,
  SESSION_DURATION_MS: 24 * 60 * 60 * 1000,
};

// ============================================
// TABS CONFIG
// ============================================
export const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'medicai', label: 'MedicAi', iconActive: 'medkit', iconInactive: 'medkit-outline', isMedicAi: true },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'lixverse', label: 'LixVerse', iconActive: 'planet', iconInactive: 'planet-outline', isLixVerse: true },
];

// ============================================
// BUBBLE COLORS — Bicolore cerveau ALIXEN (Rouge IA / Bleu User)
// ============================================
export const BUBBLE_COLOR_AI = '#E74C3C';    // Rouge - reponses ALIXEN
export const BUBBLE_COLOR_USER = '#3498DB';  // Bleu - messages utilisateur
