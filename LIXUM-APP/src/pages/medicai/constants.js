import { Dimensions, PixelRatio } from 'react-native';
export { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';

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
// SYSTÈME ÉNERGIE LIXUM
// ============================================
export var ENERGY_CONFIG = {
  TOKEN_DIVISOR: 120,
  COSTS: {
    chat: 6,
    xscan: 12,
    gallery: 12,
    recipe: 8,
    medic: 30,
    cartscan: 1,
    manual_entry: 3
  },
  ONBOARDING_FREE: {
    chat: 4,
    xscan: 1,
    gallery: 2,
    recipe: 1,
    medic: 1,
    cartscan: 5
  },
  SUBSCRIPTION_DAILY_ENERGY: {
    free: 0,
    silver: 60,
    gold: 150,
    platinum: 300
  },
  SUBSCRIPTION_PRICES: {
    silver: 3.99,
    gold: 9.99,
    platinum: 14.99
  }
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
