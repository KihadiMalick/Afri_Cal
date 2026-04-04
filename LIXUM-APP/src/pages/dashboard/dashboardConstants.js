import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const BASE_WIDTH = 320;

const wp = (size) => (W / BASE_WIDTH) * size;

const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

const hp = (size) => (H / 700) * size;

const seededRandom = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

var JOURS_COURTS = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];

function pad2(n) { return n < 10 ? '0' + n : '' + n; }

function formatTimeFR(dateObj) {
  var d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}

function formatNumberFR(n) {
  var s = Math.round(n).toString();
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

const getEffectiveML = (volumeML, coeff) => Math.round(volumeML * coeff);

const getCoeffColor = (coeff) => {
  if (coeff >= 0.90) return '#00D984';
  if (coeff >= 0.70) return '#4DA6FF';
  if (coeff >= 0.50) return '#FFD93D';
  return '#FF6B6B';
};

const SUGAR_CUBE_G = 4;
const sugarCubesToGrams = (cubes) => cubes * SUGAR_CUBE_G;
const sugarGramsToKcal = (grams) => Math.round(grams * 4);

const DAILY_OBJECTIVE = 2330;

const ACTIVITIES_KCAL_PER_HOUR = {
  'marche_rapide': 420,
  'course': 860,
  'velo': 640,
  'natation': 770,
  'musculation': 450,
  'yoga': 250,
  'corde_a_sauter': 900,
  'football': 680,
  'basketball': 720,
  'danse': 500,
};

const WATER_LOSS_PER_HOUR_ML = 700;

function calculateWaterLoss(durationMin, intensity) {
  const hours = durationMin / 60;
  const mult = { leger: 0.6, modere: 1.0, intense: 1.4 };
  return Math.round(hours * WATER_LOSS_PER_HOUR_ML * (mult[intensity] || 1.0));
}

function suggestActivities(surplusKcal) {
  return Object.entries(ACTIVITIES_KCAL_PER_HOUR)
    .map(([activity, kcalPerHour]) => ({
      activity,
      minutesNeeded: Math.ceil((surplusKcal / kcalPerHour) * 60),
      kcalBurned: surplusKcal,
    }))
    .filter(a => a.minutesNeeded <= 120)
    .sort((a, b) => a.minutesNeeded - b.minutesNeeded)
    .slice(0, 4);
}

const ACTIVITY_ICONS = {
  marche_rapide: '🚶', course: '🏃', velo: '🚴', natation: '🏊',
  musculation: '🏋️', yoga: '🧘', corde_a_sauter: '⏭', football: '⚽',
  basketball: '🏀', danse: '💃',
};
const ACTIVITY_LABELS = {
  marche_rapide: 'Marche rapide', course: 'Course', velo: 'Vélo', natation: 'Natation',
  musculation: 'Musculation', yoga: 'Yoga', corde_a_sauter: 'Corde à sauter',
  football: 'Football', basketball: 'Basketball', danse: 'Danse',
};

const MALE_PATH = 'M50,8 C50,8 42,8 42,16 C42,24 50,24 50,24 C50,24 58,24 58,16 C58,8 50,8 50,8 Z M50,26 L38,32 L32,60 L38,62 L42,42 L46,80 L42,120 L46,122 L50,90 L54,122 L58,120 L54,80 L58,42 L62,62 L68,60 L62,32 Z';
const FEMALE_PATH = 'M50,8 C50,8 42,8 42,16 C42,24 50,26 50,26 C50,26 58,24 58,16 C58,8 50,8 50,8 Z M50,28 L40,34 L34,55 L40,58 L38,42 L44,70 L38,75 L42,78 L46,80 L42,120 L46,122 L50,90 L54,122 L58,120 L54,80 L58,78 L62,75 L56,70 L62,42 L60,58 L66,55 L60,34 Z';

const BUBBLE_CONFIG = [
  { cx: 35, size: 3, duration: 2000, delay: 0 },
  { cx: 50, size: 2, duration: 2500, delay: 800 },
  { cx: 42, size: 4, duration: 3000, delay: 400 },
  { cx: 55, size: 2.5, duration: 2200, delay: 1200 },
  { cx: 38, size: 1.5, duration: 1800, delay: 600 },
  { cx: 58, size: 2, duration: 2600, delay: 1000 },
  { cx: 46, size: 3.5, duration: 2800, delay: 200 },
];

const CARD_MARGIN = wp(14);
const CARD_PAD = wp(16);
const DNA_WIDTH = wp(60);
const GAP = wp(4);
const TOTAL_SIDES = (CARD_MARGIN + CARD_PAD + wp(1.2)) * 2;
const REACTOR_SIZE = Math.min(
  Math.floor((W - TOTAL_SIDES - DNA_WIDTH - GAP * 2) / 2),
  wp(95)
);

const BEVERAGE_CATS = [
  { id: 'all', label: 'Tout', icon: '🔍' },
  { id: 'african_juice', label: 'Jus Afrique', icon: '🌍' },
  { id: 'african_hot', label: 'Infusions', icon: '☕' },
  { id: 'hot', label: 'Chaud', icon: '🍵' },
  { id: 'cold', label: 'Froid', icon: '🧊' },
  { id: 'fruit', label: 'Fruits', icon: '🍊' },
  { id: 'milk', label: 'Lait', icon: '🥛' },
];

const QUICK_VOLUMES = [100, 150, 200, 250, 330, 500];

export {
  W, H, BASE_WIDTH, wp, fp, hp,
  seededRandom,
  JOURS_COURTS, pad2, formatTimeFR, formatNumberFR,
  getEffectiveML, getCoeffColor,
  SUGAR_CUBE_G, sugarCubesToGrams, sugarGramsToKcal,
  DAILY_OBJECTIVE, ACTIVITIES_KCAL_PER_HOUR, WATER_LOSS_PER_HOUR_ML,
  calculateWaterLoss, suggestActivities,
  ACTIVITY_ICONS, ACTIVITY_LABELS,
  MALE_PATH, FEMALE_PATH, BUBBLE_CONFIG,
  CARD_MARGIN, CARD_PAD, DNA_WIDTH, GAP, TOTAL_SIDES, REACTOR_SIZE,
  BEVERAGE_CATS, QUICK_VOLUMES,
};
