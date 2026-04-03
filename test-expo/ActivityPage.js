// ──────────────────────────────────────────────────────────────────────────────
// ActivityPage.js — LIXUM Activity Page with Animated Walk/Run Sliders
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, Dimensions, ScrollView, Pressable, Platform,
  Animated, PixelRatio, TextInput, Alert, TouchableOpacity,
  Modal, StyleSheet, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  G, Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';

// ── Supabase ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ── Responsive system ────────────────────────────────────────────────────────
const { width: W } = Dimensions.get('window');
const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ── Format helpers ───────────────────────────────────────────────────────────
const formatDuration = (minutes) => {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.round((rounded / 60) * 10) / 10;
  return `${hours} h`;
};

const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${Math.round(meters / 100) / 10} km`;
};

// ── Activity data ────────────────────────────────────────────────────────────
var ACTIVITY_DATA = {
  // ── Marche & Course ──
  marche: { met: 3.5, icon: '🚶', label: 'Marche', labelEN: 'Walking', color: '#00D984', km_per_hour: 5, water_per_hour_ml: 400, compendium: '17170' },
  course: { met: 8.3, icon: '🏃', label: 'Course', labelEN: 'Running', color: '#00D984', km_per_hour: 8, water_per_hour_ml: 900, compendium: '12050' },
  // ── Sports individuels ──
  velo: { met: 7.5, icon: '🚴', label: 'Vélo', labelEN: 'Cycling', color: '#4DA6FF', water_per_hour_ml: 600, compendium: '01015' },
  natation: { met: 7.0, icon: '🏊', label: 'Natation', labelEN: 'Swimming', color: '#00BCD4', water_per_hour_ml: 700, compendium: '18250' },
  tennis: { met: 7.3, icon: '🎾', label: 'Tennis', labelEN: 'Tennis', color: '#CDDC39', water_per_hour_ml: 650, compendium: '15675' },
  boxe: { met: 7.8, icon: '🥊', label: 'Boxe', labelEN: 'Boxing', color: '#E53935', water_per_hour_ml: 800, compendium: '15072' },
  badminton: { met: 5.5, icon: '🏸', label: 'Badminton', labelEN: 'Badminton', color: '#26C6DA', water_per_hour_ml: 550, compendium: '15030' },
  escalade: { met: 8.0, icon: '🧗', label: 'Escalade', labelEN: 'Climbing', color: '#78909C', water_per_hour_ml: 600, compendium: '17012' },
  randonnee: { met: 5.3, icon: '🥾', label: 'Randonnée', labelEN: 'Hiking', color: '#8D6E63', water_per_hour_ml: 550, compendium: '17080' },
  golf: { met: 4.8, icon: '⛳', label: 'Golf', labelEN: 'Golf', color: '#4CAF50', water_per_hour_ml: 400, compendium: '15255' },
  ski: { met: 7.0, icon: '⛷️', label: 'Ski', labelEN: 'Skiing', color: '#B3E5FC', water_per_hour_ml: 600, compendium: '19050' },
  surf: { met: 3.0, icon: '🏄', label: 'Surf', labelEN: 'Surfing', color: '#0097A7', water_per_hour_ml: 500, compendium: '18350' },
  kayak: { met: 5.0, icon: '🛶', label: 'Kayak', labelEN: 'Kayaking', color: '#00838F', water_per_hour_ml: 550, compendium: '18090' },
  equitation: { met: 5.5, icon: '🐎', label: 'Équitation', labelEN: 'Horse Riding', color: '#795548', water_per_hour_ml: 450, compendium: '15380' },
  patinage: { met: 7.0, icon: '⛸️', label: 'Patinage', labelEN: 'Skating', color: '#80DEEA', water_per_hour_ml: 550, compendium: '19110' },
  ping_pong: { met: 4.0, icon: '🏓', label: 'Ping-pong', labelEN: 'Table Tennis', color: '#FF7043', water_per_hour_ml: 350, compendium: '15652' },
  squash: { met: 7.3, icon: '🎾', label: 'Squash', labelEN: 'Squash', color: '#FDD835', water_per_hour_ml: 700, compendium: '15650' },
  // ── Sports collectifs ──
  football: { met: 7.0, icon: '⚽', label: 'Football', labelEN: 'Football', color: '#66BB6A', water_per_hour_ml: 700, compendium: '15610' },
  basketball: { met: 6.5, icon: '🏀', label: 'Basketball', labelEN: 'Basketball', color: '#FF7043', water_per_hour_ml: 750, compendium: '15055' },
  volleyball: { met: 4.0, icon: '🏐', label: 'Volleyball', labelEN: 'Volleyball', color: '#FFB300', water_per_hour_ml: 450, compendium: '15710' },
  handball: { met: 8.0, icon: '🤾', label: 'Handball', labelEN: 'Handball', color: '#5C6BC0', water_per_hour_ml: 750, compendium: '15350' },
  rugby: { met: 8.3, icon: '🏉', label: 'Rugby', labelEN: 'Rugby', color: '#43A047', water_per_hour_ml: 800, compendium: '15580' },
  cricket: { met: 4.8, icon: '🏏', label: 'Cricket', labelEN: 'Cricket', color: '#A1887F', water_per_hour_ml: 450, compendium: '15230' },
  // ── Fitness & bien-être ──
  musculation: { met: 5.0, icon: '🏋️', label: 'Musculation', labelEN: 'Weight Training', color: '#FF6B6B', water_per_hour_ml: 500, compendium: '02054' },
  yoga: { met: 3.0, icon: '🧘', label: 'Yoga', labelEN: 'Yoga', color: '#B39DDB', water_per_hour_ml: 300, compendium: '02150' },
  corde: { met: 11.8, icon: '⏭', label: 'Corde à sauter', labelEN: 'Jump Rope', color: '#FFD93D', water_per_hour_ml: 800, compendium: '15540' },
  danse: { met: 5.5, icon: '💃', label: 'Danse', labelEN: 'Dance', color: '#EC407A', water_per_hour_ml: 500, compendium: '03015' },
  spinning: { met: 8.5, icon: '🚲', label: 'Spinning', labelEN: 'Spinning', color: '#FF5722', water_per_hour_ml: 750, compendium: '01040' },
  hiit: { met: 9.0, icon: '🔥', label: 'HIIT', labelEN: 'HIIT', color: '#FF1744', water_per_hour_ml: 850, compendium: '02072' },
  pilates: { met: 3.0, icon: '🤸', label: 'Pilates', labelEN: 'Pilates', color: '#CE93D8', water_per_hour_ml: 350, compendium: '02048' },
  crossfit: { met: 9.5, icon: '💪', label: 'CrossFit', labelEN: 'CrossFit', color: '#D32F2F', water_per_hour_ml: 900, compendium: '02072' },
  zumba: { met: 6.5, icon: '💃', label: 'Zumba', labelEN: 'Zumba', color: '#F06292', water_per_hour_ml: 600, compendium: '03031' },
  aquagym: { met: 5.3, icon: '🏊', label: 'Aquagym', labelEN: 'Aqua Aerobics', color: '#4DD0E1', water_per_hour_ml: 500, compendium: '18355' },
  stretching: { met: 2.3, icon: '🤸', label: 'Étirements', labelEN: 'Stretching', color: '#AED581', water_per_hour_ml: 200, compendium: '02101' },
  tai_chi: { met: 3.0, icon: '🧘', label: 'Tai Chi', labelEN: 'Tai Chi', color: '#9FA8DA', water_per_hour_ml: 250, compendium: '02135' },
  // ── Activités quotidiennes & africaines ──
  menage: { met: 3.3, icon: '🧹', label: 'Ménage', labelEN: 'Housework', color: '#90A4AE', water_per_hour_ml: 300, compendium: '05020' },
  jardinage: { met: 4.0, icon: '🌱', label: 'Jardinage', labelEN: 'Gardening', color: '#66BB6A', water_per_hour_ml: 400, compendium: '08245' },
  escalier: { met: 8.8, icon: '🪜', label: 'Monter les escaliers', labelEN: 'Stair Climbing', color: '#8D6E63', water_per_hour_ml: 650, compendium: '17133' },
  lutte_africaine: { met: 7.8, icon: '🤼', label: 'Lutte africaine', labelEN: 'African Wrestling', color: '#D4AF37', water_per_hour_ml: 800, compendium: '15072' },
  danse_africaine: { met: 6.5, icon: '🥁', label: 'Danse africaine', labelEN: 'African Dance', color: '#FF8F00', water_per_hour_ml: 600, compendium: '03017' },
};

// ── Translations FR/EN ──────────────────────────────────────────────────────
var T = {
  FR: {
    activity: 'ACTIVITÉ',
    today: "Aujourd'hui",
    burned: 'BRÛLÉ',
    toBurn: 'À BRÛLER',
    time: 'TEMPS',
    waterLost: 'EAU PERDUE',
    weeklyObj: 'Objectif activité hebdomadaire · Recommandation OMS',
    walk: 'Marche',
    run: 'Course',
    roundTrip: 'Aller/Retour',
    roundTripX2: 'Aller/Retour ×2',
    normalSpeed: 'vitesse norm.',
    normalPace: 'allure norm.',
    validate: 'Valider',
    added: 'AJOUTÉ ! +5 Lix',
    live: 'LIVE',
    otherActivities: 'Autres activités',
    seeMore: 'Voir plus d\'activités',
    more: 'de plus',
    reduce: 'Réduire',
    todayHistory: "Aujourd'hui",
    noActivity: 'Aucune activité aujourd\'hui — commencez par une marche !',
    recommendation: 'RECOMMANDATION',
    inObjective: 'Vous êtes dans votre objectif',
    walkKeeps: 'Une petite marche de 15 min maintient votre métabolisme actif',
    toCompensate: 'kcal à compenser',
    bravo: 'Bravo !',
    niceWalk: 'Belle marche terminée',
    niceRun: 'Belle course terminée',
    sessionOf: 'Session de',
    finished: 'terminée',
    distance: 'Distance',
    duration: 'Durée',
    calories: 'Calories',
    waterLostLabel: 'Eau perdue',
    avgSpeed: 'Vitesse moy.',
    equivalent: 'Équivalent de',
    burned2: 'brûlé',
    weekOms: 'Objectif OMS cette semaine',
    still: 'encore',
    continueBtn: 'Continuer',
    bonusObtained: 'Bonus Lix du jour obtenu !',
    bonusFirst: '+5 Lix pour votre première activité du jour',
    delete: 'Supprimer',
    deleteConfirm: 'Voulez-vous supprimer cette activité ?',
    cancel: 'Annuler',
    intensity: 'INTENSITÉ',
    light: 'Léger',
    moderate: 'Modéré',
    intense: 'Intense',
    estimate: 'Estimation',
    add: 'Ajouter',
    scienceNote: 'Estimation basée sur les valeurs MET du Compendium of Physical Activities (Ainsworth et al., 2011) et les recommandations OMS.',
    liveTitle: 'Mode Live GPS',
    liveDesc: 'Suivez votre parcours en temps réel avec le GPS de votre téléphone.',
    liveAvailable: 'DISPONIBLE EN VERSION BUILD :',
    liveUnderstood: 'Compris, j\'ai hâte !',
    myProfile: 'Mon Profil',
    energy: 'énergie',
    uses: 'uses',
    perActivity: 'XP par activité enregistrée',
    hold: 'MAINTENIR',
    startNow: 'Faire cette activité maintenant',
    durationLabel: 'DURÉE',
    activityLabel: 'Activité',
    durationSmall: 'Durée',
    distanceSmall: 'Distance',
  },
  EN: {
    activity: 'ACTIVITY',
    today: 'Today',
    burned: 'BURNED',
    toBurn: 'TO BURN',
    time: 'TIME',
    waterLost: 'WATER LOST',
    weeklyObj: 'Weekly activity goal · WHO Recommendation',
    walk: 'Walk',
    run: 'Run',
    roundTrip: 'Round trip',
    roundTripX2: 'Round trip ×2',
    normalSpeed: 'normal speed',
    normalPace: 'normal pace',
    validate: 'Confirm',
    added: 'ADDED! +5 Lix',
    live: 'LIVE',
    otherActivities: 'Other activities',
    seeMore: 'See more activities',
    more: 'more',
    reduce: 'Collapse',
    todayHistory: 'Today',
    noActivity: 'No activity today — start with a walk!',
    recommendation: 'RECOMMENDATION',
    inObjective: 'You\'re on track',
    walkKeeps: 'A 15 min walk keeps your metabolism active',
    toCompensate: 'kcal to burn',
    bravo: 'Well done!',
    niceWalk: 'Great walk completed',
    niceRun: 'Great run completed',
    sessionOf: 'Session of',
    finished: 'completed',
    distance: 'Distance',
    duration: 'Duration',
    calories: 'Calories',
    waterLostLabel: 'Water lost',
    avgSpeed: 'Avg speed',
    equivalent: 'Equivalent of',
    burned2: 'burned',
    weekOms: 'WHO weekly goal',
    still: 'still',
    continueBtn: 'Continue',
    bonusObtained: 'Daily Lix bonus earned!',
    bonusFirst: '+5 Lix for your first activity today',
    delete: 'Delete',
    deleteConfirm: 'Delete this activity?',
    cancel: 'Cancel',
    intensity: 'INTENSITY',
    light: 'Light',
    moderate: 'Moderate',
    intense: 'Intense',
    estimate: 'Estimate',
    add: 'Add',
    scienceNote: 'Estimate based on MET values from the Compendium of Physical Activities (Ainsworth et al., 2011) and WHO recommendations.',
    liveTitle: 'Live GPS Mode',
    liveDesc: 'Track your route in real-time using your phone\'s GPS.',
    liveAvailable: 'AVAILABLE IN BUILD VERSION:',
    liveUnderstood: 'Got it, can\'t wait!',
    myProfile: 'My Profile',
    energy: 'energy',
    uses: 'uses',
    perActivity: 'XP per logged activity',
    hold: 'HOLD',
    startNow: 'Start this activity now',
    durationLabel: 'DURATION',
    activityLabel: 'Activity',
    durationSmall: 'Duration',
    distanceSmall: 'Distance',
  }
};

// Calcul calories basé sur MET × poids × durée
// Source : Compendium of Physical Activities (Ainsworth et al., 2011)
var calcCalories = function(met, weightKg, durationMin, intensity) {
  var intensityMult = intensity === 'leger' ? 0.75 : intensity === 'intense' ? 1.25 : 1.0;
  return Math.round(met * intensityMult * weightKg * (durationMin / 60));
};

// Calcul eau perdue basé sur durée et intensité
var calcWater = function(waterPerHourMl, durationMin, intensity) {
  var intensityMult = intensity === 'leger' ? 0.8 : intensity === 'intense' ? 1.3 : 1.0;
  return Math.round((durationMin / 60) * waterPerHourMl * intensityMult);
};

const RUN_FLAGS = [
  { distance: 400, label: '400m' },
  { distance: 1000, label: '1 km' },
  { distance: 2000, label: '2 km' },
  { distance: 5000, label: '5 km' },
  { distance: 10000, label: '10 km' },
  { distance: 21000, label: '21 km' },
];

const TIME_STEPS = [5, 10, 15, 20, 30, 45, 60];

var OTHER_SPORTS = [
  'velo', 'natation', 'musculation', 'yoga', 'corde', 'football',
  'basketball', 'danse', 'tennis', 'boxe', 'randonnee', 'escalade',
  'spinning', 'hiit', 'pilates', 'badminton',
  'volleyball', 'handball', 'rugby', 'cricket',
  'golf', 'ski', 'surf', 'kayak', 'equitation', 'patinage', 'ping_pong', 'squash',
  'crossfit', 'zumba', 'aquagym', 'stretching', 'tai_chi',
  'menage', 'jardinage', 'escalier', 'lutte_africaine', 'danse_africaine',
];

// ── Walk Immersive Trail ─────────────────────────────────────────────────────
const WALK_DISTANCE_MAP = [
  { pos: 0, meters: 0 },
  { pos: 0.02, meters: 0 },
  { pos: 0.22, meters: 500 },
  { pos: 0.42, meters: 2000 },
  { pos: 0.65, meters: 5000 },
  { pos: 0.98, meters: 10000 },
  { pos: 1.0, meters: 10000 },
];

const WALK_LANDMARKS = [
  { type: 'house', position: 0.02, label: 'Départ' },
  { type: 'tree', position: 0.22, label: '500m' },
  { type: 'bench', position: 0.42, label: '2 km' },
  { type: 'birds', position: 0.65, label: '5 km' },
  { type: 'pond', position: 0.98, label: '10 km' },
];

const walkSliderToDistance = (value) => {
  for (let i = 1; i < WALK_DISTANCE_MAP.length; i++) {
    if (value <= WALK_DISTANCE_MAP[i].pos) {
      const prev = WALK_DISTANCE_MAP[i - 1];
      const curr = WALK_DISTANCE_MAP[i];
      const t = (value - prev.pos) / (curr.pos - prev.pos);
      return prev.meters + (curr.meters - prev.meters) * t;
    }
  }
  return 10000;
};

// ── SVG Decor Components ─────────────────────────────────────────────────────

const TreeIcon = ({ x, y, passed }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Rect x={-1.5} y={0} width={3} height={8} fill="#8B6914" opacity={0.6} />
    <Circle cx={0} cy={-4} r={7} fill="#00D984" opacity={passed ? 0.4 : 0.25} />
    <Circle cx={-4} cy={-2} r={5} fill="#00D984" opacity={passed ? 0.35 : 0.2} />
    <Circle cx={4} cy={-2} r={5} fill="#00D984" opacity={passed ? 0.35 : 0.2} />
    {passed && (
      <Ellipse cx={6} cy={4} rx={2} ry={1} fill="#00D984" opacity={0.3}
        transform="rotate(45, 6, 4)" />
    )}
  </G>
);

const BenchIcon = ({ x, y }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Rect x={-8} y={-1} width={16} height={2} rx={1} fill="#8892A0" opacity={0.5} />
    <Rect x={-7} y={-5} width={14} height={2} rx={1} fill="#8892A0" opacity={0.4} />
    <Line x1={-6} y1={1} x2={-6} y2={5} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={6} y1={1} x2={6} y2={5} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={-6} y1={-5} x2={-6} y2={-1} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={6} y1={-5} x2={6} y2={-1} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
  </G>
);

const BirdsIcon = ({ x, y, passed }) => (
  <G transform={`translate(${x}, ${y - (passed ? 5 : 0)})`}>
    <Path d={`M${-4} ${0} Q${-2} ${-3} ${0} ${0}`} fill="none" stroke="#8892A0" strokeWidth={1.2} opacity={passed ? 0.3 : 0.5} />
    <Path d={`M${3} ${-4} Q${5} ${-7} ${7} ${-4}`} fill="none" stroke="#8892A0" strokeWidth={1.2} opacity={passed ? 0.25 : 0.45} />
    <Path d={`M${-7} ${-3} Q${-5} ${-6} ${-3} ${-3}`} fill="none" stroke="#8892A0" strokeWidth={1} opacity={passed ? 0.2 : 0.4} />
  </G>
);

const PondIcon = ({ x, y }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Ellipse cx={0} cy={4} rx={14} ry={8} fill="#4DA6FF" opacity={0.15} />
    <Ellipse cx={0} cy={4} rx={12} ry={6} fill="#4DA6FF" opacity={0.1} />
    <Path d="M-8 3 Q-4 1 0 3 Q4 5 8 3" fill="none" stroke="#4DA6FF" strokeWidth={0.8} opacity={0.3} />
    <Path d="M-6 6 Q-2 4 2 6 Q6 8 10 6" fill="none" stroke="#4DA6FF" strokeWidth={0.6} opacity={0.2} />
    <Ellipse cx={0} cy={1} rx={4} ry={2.5} fill="#FFB800" opacity={0.6} />
    <Circle cx={-3} cy={-1} r={2.5} fill="#FFB800" opacity={0.6} />
    <Path d="M-5.5 -1 L-7 -0.5 L-5.5 0" fill="#FF8C42" opacity={0.7} />
    <Circle cx={-3.5} cy={-1.5} r={0.6} fill="#0D1117" />
  </G>
);

// ── LockIcon ─────────────────────────────────────────────────────────────────
const LockIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill="#8892A0" opacity={0.6} />
    <Path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill="#EAEEF3" />
  </Svg>
);

// ── Bottom Tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'medicai', label: 'MedicAi', iconActive: 'medkit', iconInactive: 'medkit-outline', isMedicAi: true },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'lixverse', label: 'LixVerse', iconActive: 'planet', iconInactive: 'planet-outline', isLixVerse: true },
];

const AvatarButton = ({ activeChar, userName, onPress, size = 30 }) => {
  const charEmojis = { 'emerald_owl': '🦉', 'hawk_eye': '🦅', 'ruby_tiger': '🐯', 'amber_fox': '🦊', 'gipsy': '🕷️', 'jade_phoenix': '🔥', 'silver_wolf': '🐺', 'boukki': '🦴', 'iron_rhino': '🦏', 'coral_dolphin': '🐬' };
  const emoji = activeChar?.slug ? charEmojis[activeChar.slug] : null;
  const initial = (userName || 'U').charAt(0).toUpperCase();
  const borderColor = emoji ? '#00D984' : '#4DA6FF';
  return (
    <Pressable onPress={onPress} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: borderColor + '15', borderWidth: 1.5, borderColor: borderColor + '50', justifyContent: 'center', alignItems: 'center' }}>
      {emoji ? <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text> : <Text style={{ fontSize: size * 0.45, fontWeight: '800', color: borderColor }}>{initial}</Text>}
    </Pressable>
  );
};

const BottomTabs = ({ activeTab, onTabPress }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#141A22',
      borderTopWidth: 1,
      borderTopColor: 'rgba(74,79,85,0.5)',
      paddingTop: wp(10),
      paddingBottom: Platform.OS === 'android' ? 50 : 34,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 20,
    }}
  >
    {TABS.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: wp(4) }}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <View style={{ position: 'relative' }}>
            {tab.isMedicAi ? (
              <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24">
                <Defs>
                  <SvgLinearGradient id="medicGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#FF6B8A" />
                    <Stop offset="100%" stopColor="#FF3B5C" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="8" y="2" width="8" height="20" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Rect x="2" y="8" width="20" height="8" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Path d="M12 11.5c.5-.8 1.5-1 2-.5s.5 1.5 0 2.5l-2 2-2-2c-.5-1-.5-2 0-2.5s1.5-.3 2 .5z"
                  fill="white" opacity={0.7} />
              </Svg>
            ) : tab.isLixVerse ? (
              <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24">
                <Circle cx="12" cy="12" r="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={1.2} opacity={active ? 0.9 : 0.5} />
                <Ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.8} opacity={active ? 0.6 : 0.3} />
                <Ellipse cx="12" cy="12" rx="7.5" ry="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.6} opacity={active ? 0.4 : 0.2} />
                <Ellipse cx="12" cy="8" rx="9" ry="2.5" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.7} opacity={active ? 0.5 : 0.25} />
                <Line x1="2" y1="12" x2="22" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.8} opacity={active ? 0.5 : 0.3} />
                <Ellipse cx="12" cy="16" rx="9" ry="2.5" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.7} opacity={active ? 0.5 : 0.25} />
                <Circle cx="12" cy="2.5" r={1.3} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                <Circle cx="5" cy="5.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="19" cy="5.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="3" cy="12" r={1.2} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                <Circle cx="21" cy="12" r={1.2} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                <Circle cx="8" cy="8" r={1} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.8 : 0.3} />
                <Circle cx="16" cy="8" r={1} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.8 : 0.3} />
                <Circle cx="12" cy="12" r={1.3} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="7" cy="15.5" r={1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.8 : 0.35} />
                <Circle cx="17" cy="15.5" r={1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.8 : 0.35} />
                <Circle cx="5.5" cy="18.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="18.5" cy="18.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="12" cy="21.5" r={1.3} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                <Line x1="12" y1="2.5" x2="8" y2="8" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.5 : 0.2} />
                <Line x1="12" y1="2.5" x2="16" y2="8" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.5 : 0.2} />
                <Line x1="8" y1="8" x2="12" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="16" y1="8" x2="12" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="12" y1="12" x2="7" y2="15.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="12" y1="12" x2="17" y2="15.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="7" y1="15.5" x2="12" y2="21.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="17" y1="15.5" x2="12" y2="21.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
              </Svg>
            ) : (
              <Ionicons
                name={active ? tab.iconActive : tab.iconInactive}
                size={wp(22)}
                color={active ? '#00D984' : '#6B7B8D'}
              />
            )}
            {tab.locked && (
              <View style={{
                position: 'absolute', top: -3, right: -6,
                backgroundColor: 'rgba(21,27,35,0.9)', borderRadius: 6,
                width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
              }}>
                <LockIcon size={10} />
              </View>
            )}
          </View>
          <Text style={[
            { color: '#6B7B8D', fontSize: fp(9), fontWeight: '600', letterSpacing: wp(0.3), marginTop: -2 },
            active && (tab.isMedicAi ? { color: '#FF3B5C' } : { color: '#00D984' }),
            tab.isMedicAi && !active && { color: '#8892A0' },
            tab.isLixVerse && !active && { color: '#6B7B8D' },
          ]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ── MetalCard ────────────────────────────────────────────────────────────────
const MetalCard = ({ children, style, onPress, noPadding = false }) => {
  if (!onPress) {
    return (
      <View style={[metalStyles.outerBorder, style]}>
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={metalStyles.innerGradient}
        >
          <View style={[metalStyles.cardContent, noPadding && { padding: 0 }]}>
            <View style={{
              position: 'absolute', top: 0, left: 25, right: 25,
              height: 1, backgroundColor: 'rgba(0, 217, 132, 0.10)', borderRadius: 0.5,
            }} />
            {children}
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      delayPressIn={120}
      unstable_pressDelay={120}
      style={({ pressed }) => [
        metalStyles.outerBorder,
        style,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: pressed ? 2 : 8 },
          shadowOpacity: pressed ? 0.6 : 0.5,
          shadowRadius: pressed ? 4 : 16,
          elevation: pressed ? 4 : 12,
          transform: [{ scale: pressed ? 0.975 : 1 }],
          backgroundColor: pressed ? '#3E434A' : '#4A4F55',
        },
      ]}
    >
      <LinearGradient
        colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={metalStyles.innerGradient}
      >
        <View style={[metalStyles.cardContent, noPadding && { padding: 0 }]}>
          <View style={{
            position: 'absolute', top: 0, left: 25, right: 25,
            height: 1, backgroundColor: 'rgba(0, 217, 132, 0.10)', borderRadius: 0.5,
          }} />
          {children}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const metalStyles = StyleSheet.create({
  outerBorder: {
    borderRadius: wp(14),
    padding: wp(0.5),
    backgroundColor: 'rgba(74,79,85,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    marginHorizontal: wp(14),
    marginBottom: wp(8),
  },
  innerGradient: {
    borderRadius: wp(17),
    overflow: 'hidden',
  },
  cardContent: {
    padding: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: wp(17),
  },
});

// ── SectionTitle ─────────────────────────────────────────────────────────────
const SectionTitle = ({ title, rightAction, rightLabel, style }) => (
  <View style={[{
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: wp(16), marginBottom: wp(4), marginTop: wp(6),
  }, style]}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 3, height: wp(16), borderRadius: 1.5,
        backgroundColor: '#00D984', marginRight: wp(6),
      }} />
      <Text style={{
        color: '#FFFFFF', fontSize: fp(16), fontWeight: '900',
        letterSpacing: 1, textTransform: 'uppercase',
      }}>
        {title}
      </Text>
    </View>
    {rightLabel && (
      <Pressable onPressIn={rightAction}>
        <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>
          {rightLabel}
        </Text>
      </Pressable>
    )}
  </View>
);

// ── MetallicBackground ───────────────────────────────────────────────────────
const MetallicBackground = () => (
  <LinearGradient
    colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
    locations={[0, 0.25, 0.5, 0.75, 1]}
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
  />
);

// ── FIX 2: SVG Sneaker Icons ─────────────────────────────────────────────────
const WalkShoeIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M8 28 L8 20 Q8 16 12 15 L22 13 Q26 12 28 14 L32 16 Q36 18 36 22 L36 26 Q36 30 32 30 L12 30 Q8 30 8 28Z"
      fill="none" stroke="#00D984" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 15 L14 10 Q14 8 16 8 L20 8 Q22 8 22 10 L22 13"
      fill="none" stroke="#00D984" strokeWidth={2} strokeLinecap="round" />
    <Line x1="16" y1="18" x2="16" y2="14" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Line x1="20" y1="17" x2="20" y2="13" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Path d="M10 28 L34 28" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    <Line x1="2" y1="22" x2="6" y2="22" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
    <Line x1="1" y1="25" x2="5" y2="25" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
    <Line x1="3" y1="19" x2="6" y2="19" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
  </Svg>
);

const RunShoeIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M6 26 L10 17 Q12 13 16 12 L24 10 Q28 9 30 12 L34 16 Q38 19 36 23 L34 27 Q32 30 28 30 L10 30 Q6 30 6 26Z"
      fill="none" stroke="#00D984" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 12 L18 6 Q19 4 21 5 L24 7 Q25 8 24 10"
      fill="none" stroke="#00D984" strokeWidth={2} strokeLinecap="round" />
    <Line x1="18" y1="15" x2="17" y2="11" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Line x1="22" y1="14" x2="21" y2="10" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Path d="M8 28 L30 28" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    <Line x1="0" y1="20" x2="5" y2="20" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
    <Line x1="-1" y1="23" x2="4" y2="23" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
    <Line x1="1" y1="17" x2="5" y2="17" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
    <Line x1="-2" y1="26" x2="3" y2="26" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
  </Svg>
);

const WalkShoeAnimated = ({ shoeAnim }) => {
  const bounce = shoeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  return (
    <Animated.View style={{ transform: [{ translateY: bounce }] }}>
      <WalkShoeIcon size={wp(28)} />
    </Animated.View>
  );
};

const RunShoeAnimated = ({ shoeAnim }) => {
  const bounce = shoeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  return (
    <Animated.View style={{ transform: [{ translateY: bounce }] }}>
      <RunShoeIcon size={wp(28)} />
    </Animated.View>
  );
};

// ── FIX 3: Non-linear slider distance interpolation ─────────────────────────
const sliderToDistance = (sliderValue, flags) => {
  const maxIdx = flags.length - 1;
  const pos = sliderValue * maxIdx;
  const segmentIndex = Math.min(Math.floor(pos), maxIdx - 1);
  const segmentProgress = pos - segmentIndex;
  const fromFlag = flags[Math.min(segmentIndex, maxIdx)];
  const toFlag = flags[Math.min(segmentIndex + 1, maxIdx)];
  return fromFlag.distance + (toFlag.distance - fromFlag.distance) * segmentProgress;
};

// ── Custom Slider (Walk / Run) ───────────────────────────────────────────────
const ActivitySlider = ({
  type,
  mode,
  value,
  onChange,
  shoeAnim,
  flags,
  maxDistance,
  maxTime,
  accentColor,
}) => {
  const barRef = useRef(null);
  const [barWidth, setBarWidth] = useState(0);
  const [barX, setBarX] = useState(0);

  const isWalk = type === 'marche';
  const trackBg = isWalk ? 'rgba(0,217,132,0.08)' : 'rgba(255,140,66,0.08)';
  const trackLineColor = isWalk ? 'rgba(0,217,132,0.15)' : 'rgba(255,255,255,0.12)';

  const handleTouch = (evt) => {
    const touchX = evt.nativeEvent.pageX - barX;
    const clamped = Math.max(0, Math.min(1, touchX / barWidth));
    onChange(clamped);
  };

  const flagList = mode === 'distance' ? flags : TIME_STEPS;

  return (
    <View style={{ marginTop: wp(12) }}>
      {/* Slider track */}
      <View
        ref={barRef}
        onLayout={(e) => {
          setBarWidth(e.nativeEvent.layout.width);
          barRef.current?.measureInWindow?.((x) => setBarX(x));
          if (e.nativeEvent.layout.x !== undefined) {
            barRef.current?.measure?.((fx, fy, fw, fh, px) => {
              if (px !== undefined) setBarX(px);
            });
          }
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderMove={handleTouch}
        onResponderRelease={handleTouch}
        onResponderStart={handleTouch}
        style={{
          height: wp(50),
          backgroundColor: trackBg,
          borderRadius: wp(12),
          overflow: 'hidden',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isWalk ? 'rgba(0,217,132,0.12)' : 'rgba(255,140,66,0.12)',
        }}
      >
        {/* Track ruler lines */}
        {isWalk ? (
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row' }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <View key={i} style={{
                width: 1, height: '100%',
                backgroundColor: trackLineColor,
                marginLeft: i === 0 ? 0 : (barWidth || 200) / 30,
              }} />
            ))}
          </View>
        ) : (
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
            {[0.25, 0.5, 0.75].map((pos, i) => (
              <View key={i} style={{
                position: 'absolute', left: 0, right: 0,
                top: `${pos * 100}%`,
                height: 1,
                backgroundColor: trackLineColor,
              }} />
            ))}
          </View>
        )}

        {/* FIX 3: Flag markers — equally spaced */}
        {flagList.map((flag, idx) => {
          const equalPos = flagList.length > 1 ? idx / (flagList.length - 1) : 0;

          // Find nearest flag to current slider value
          const isNearest = (() => {
            let minDist = Infinity;
            let nearestIdx = 0;
            flagList.forEach((_, fi) => {
              const fPos = flagList.length > 1 ? fi / (flagList.length - 1) : 0;
              const d = Math.abs(value - fPos);
              if (d < minDist) { minDist = d; nearestIdx = fi; }
            });
            return nearestIdx === idx;
          })();

          return (
            <View key={idx} style={{
              position: 'absolute',
              left: `${equalPos * 100}%`,
              top: wp(2),
              alignItems: 'center',
              transform: [{ translateX: -wp(10) }],
            }}>
              <Text style={{
                fontSize: fp(7),
                color: isNearest ? accentColor : '#555E6C',
                fontWeight: isNearest ? '700' : '500',
              }}>
                {String.fromCodePoint(0x1F3C1)}
              </Text>
              <Text style={{
                fontSize: fp(7),
                color: isNearest ? accentColor : '#555E6C',
                fontWeight: isNearest ? '700' : '500',
                marginTop: wp(1),
              }}>
                {mode === 'distance' ? flag.label : `${flag}m`}
              </Text>
            </View>
          );
        })}

        {/* Filled track */}
        <View style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${value * 100}%`,
          backgroundColor: isWalk ? 'rgba(0,217,132,0.12)' : 'rgba(255,140,66,0.12)',
          borderTopLeftRadius: wp(12),
          borderBottomLeftRadius: wp(12),
        }} />

        {/* Moving indicator — FIX 2: sneaker icons */}
        <Animated.View style={{
          position: 'absolute',
          left: barWidth > 0 ? value * (barWidth - wp(28)) : 0,
          top: wp(14),
          width: wp(28),
          height: wp(28),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {isWalk
            ? <WalkShoeAnimated shoeAnim={shoeAnim} />
            : <RunShoeAnimated shoeAnim={shoeAnim} />
          }
        </Animated.View>
      </View>
    </View>
  );
};

// ── Toggle Pill (Distance | Temps) ───────────────────────────────────────────
const ModePill = ({ mode, onToggle, accentColor }) => (
  <View style={{
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: wp(10),
    padding: wp(2),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  }}>
    {['distance', 'temps'].map((m) => (
      <Pressable
        key={m}
        onPress={() => onToggle(m)}
        style={{
          paddingHorizontal: wp(10),
          paddingVertical: wp(4),
          borderRadius: wp(8),
          backgroundColor: mode === m ? accentColor : 'transparent',
        }}
      >
        <Text style={{
          fontSize: fp(9),
          fontWeight: '700',
          color: mode === m ? '#000' : '#8892A0',
          textTransform: 'capitalize',
        }}>
          {m}
        </Text>
      </Pressable>
    ))}
  </View>
);

// ── SportIcon — Premium SVG line icons ──────────────────────────────────────
var SportIcon = function(props) {
  var type = props.type;
  var size = props.size || wp(24);
  var color = props.color || '#00D984';

  switch(type) {
    case 'marche':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M10 9h4l1 4-2 2v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M14 13l2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M10 9l-1.5 7-2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'course':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="14" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M8 11l3-2 3 1 2-3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M11 10l-2 5-3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M14 12l1 4 3 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'velo':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="6" cy="16" r="3.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Circle cx="18" cy="16" r="3.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M6 16l4-8h4l2 4h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M14 8l4 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Circle cx="14" cy="6" r="1.2" stroke={color} strokeWidth={1.4} fill="none" />
        </Svg>
      );
    case 'natation':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="8" cy="8" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M6 14l2-3 4-1 4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M2 21c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.5} />
        </Svg>
      );
    case 'musculation':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 7v10M18 7v10" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M3 9v6M21 9v6" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'yoga':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 7v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M8 10l4 2 4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M7 19l5-7 5 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'corde':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="6" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 8v4M10 12l-2 4M14 12l2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M5 4c0 8 3 14 7 16 4-2 7-8 7-16" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'football':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 3l2.5 5.5H21M12 3L9.5 8.5H3M12 21l2.5-5.5H21M12 21L9.5 15.5H3" stroke={color} strokeWidth={1} fill="none" opacity={0.5} />
          <Path d="M8.5 8.5l3.5 1 3.5-1M8.5 15.5l3.5-1 3.5 1M8.5 8.5v7M15.5 8.5v7" stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
        </Svg>
      );
    case 'basketball':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M3 12h18" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M12 3v18" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M5.5 5.5c3 2.5 3 8.5 0 13" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M18.5 5.5c-3 2.5-3 8.5 0 13" stroke={color} strokeWidth={1.2} fill="none" />
        </Svg>
      );
    case 'danse':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="14" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M14 6l-2 4-4-1" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10v4l3 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 14l-3 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M16 7l2-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'tennis':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="10" cy="10" r="7" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M4.5 6c3 2 6 6 2 12" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M15.5 4c-2 3-6 6-12 2" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M15 15l5 5" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'boxe':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 12c0-3 2-6 5-7h4c3 1 5 4 5 7v3c0 2-2 4-4 4H9c-2 0-4-2-4-4v-3z" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M9 8v3M12 8v3M15 8v3" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <Path d="M7 17l-2 3M17 17l2 3" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'randonnee':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v6l-3 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 12l3 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M17 3v18" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M17 3l-3 3" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <Path d="M17 7l-2 2" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'escalade':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v4l4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10l-3 4 1 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10l2 6 3-1" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Rect x="2" y="2" width="3" height="20" rx="1" stroke={color} strokeWidth={1.2} fill="none" opacity={0.3} />
        </Svg>
      );
    case 'spinning':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="6" cy="17" r="3.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Circle cx="18" cy="17" r="3.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M6 17l5-9h3l4 9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M10 8l-1-3h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'hiit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'pilates':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="16" cy="6" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M4 16h4l4-5 4 1" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M16 8l-4 3v4l-4 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Line x1="2" y1="20" x2="22" y2="20" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.3} />
        </Svg>
      );
    case 'badminton':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2c-2 3-2 6 0 8s2 5 0 8" stroke={color} strokeWidth={1.4} fill="none" />
          <Ellipse cx="12" cy="6" rx="3.5" ry="5" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 11l-1 9" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Line x1="9" y1="4" x2="15" y2="4" stroke={color} strokeWidth={1} opacity={0.4} />
          <Line x1="9" y1="6" x2="15" y2="6" stroke={color} strokeWidth={1} opacity={0.4} />
          <Line x1="9" y1="8" x2="15" y2="8" stroke={color} strokeWidth={1} opacity={0.4} />
        </Svg>
      );
    case 'volleyball':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 3c0 6-4 9-9 9" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M21 12c-6 0-9 4-9 9" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M7 4c2 4 8 6 14 2" stroke={color} strokeWidth={1.2} fill="none" />
        </Svg>
      );
    case 'handball':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="10" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M10 6l2 4 4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10l-2 5-3 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10l2 5 3 1" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Circle cx="18" cy="5" r="1.8" stroke={color} strokeWidth={1.4} fill="none" />
        </Svg>
      );
    case 'rugby':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(-30 12 12)" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M6 6l12 12" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M8 12l4-4M12 16l4-4" stroke={color} strokeWidth={1} fill="none" opacity={0.5} />
        </Svg>
      );
    case 'cricket':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 19L15 5" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Rect x="13" y="2" width="4" height="6" rx="1" stroke={color} strokeWidth={1.4} fill="none" transform="rotate(20 15 5)" />
          <Circle cx="18" cy="17" r="3" stroke={color} strokeWidth={1.6} fill="none" />
          <Line x1="16" y1="15" x2="20" y2="19" stroke={color} strokeWidth={1} opacity={0.4} />
        </Svg>
      );
    case 'golf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3v15" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M12 3l6 4-6 3z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill={color} opacity={0.2} />
          <Path d="M12 3l6 4-6 3z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
          <Ellipse cx="12" cy="20" rx="5" ry="1.5" stroke={color} strokeWidth={1.2} fill="none" opacity={0.4} />
        </Svg>
      );
    case 'ski':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6l-3 5 1 5-3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 6l3 5-1 5 3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M2 20l20-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'surf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 7v4l-4 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 11l3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M3 17c3-3 6-3 9 0s6 3 9 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M6 20c3-2 6-2 9 0" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.4} />
        </Svg>
      );
    case 'kayak':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Ellipse cx="12" cy="16" rx="9" ry="2.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Circle cx="12" cy="8" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 10v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M6 6l6 8 6-8" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'equitation':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 14c2-4 5-6 8-6s4 2 5 4l3-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M4 14l1 6M12 12l1 8M17 12l1 8" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Circle cx="19" cy="8" r="1.5" stroke={color} strokeWidth={1.4} fill="none" />
          <Path d="M20 7l2-2" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'patinage':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 12l3-6h6l3 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M6 12v4c0 1 1 2 2 2h8c1 0 2-1 2-2v-4" stroke={color} strokeWidth={1.6} fill="none" />
          <Line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M8 20v-2M16 20v-2" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'ping_pong':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="10" cy="10" r="6" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M14 14l5 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Circle cx="18" cy="6" r="1.5" stroke={color} strokeWidth={1.4} fill={color} opacity={0.3} />
        </Svg>
      );
    case 'squash':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="18" height="18" rx="1" stroke={color} strokeWidth={1.4} fill="none" opacity={0.3} />
          <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth={1} opacity={0.3} />
          <Ellipse cx="12" cy="10" rx="3" ry="4" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 14l-1 7" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Circle cx="16" cy="7" r="1.2" stroke={color} strokeWidth={1.4} fill={color} opacity={0.3} />
        </Svg>
      );
    case 'crossfit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 8v8M20 8v8" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M7 6v12M17 6v12" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M10 3l2 2 2-2" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'zumba':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M8 8l4 3 4-3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M9 11l-2 5 2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M15 11l2 5-2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx="5" cy="6" r="0.8" fill={color} opacity={0.4} />
          <Circle cx="19" cy="8" r="0.8" fill={color} opacity={0.4} />
        </Svg>
      );
    case 'aquagym':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M8 10l4 2 4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 7v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.4} />
        </Svg>
      );
    case 'stretching':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M6 8l6 4 6-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 12l-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M12 12l6 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'tai_chi':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.4} fill="none" />
          <Path d="M12 3c0 9-5 9-5 9s5 0 5 9" stroke={color} strokeWidth={1.4} fill="none" />
          <Circle cx="9.5" cy="8" r="1.5" fill={color} opacity={0.3} />
          <Circle cx="14.5" cy="16" r="1.5" stroke={color} strokeWidth={1.2} fill="none" />
        </Svg>
      );
    case 'menage':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2v14" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M8 16l4 1 4-1" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M7 17l-1 5h12l-1-5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M9 6l6 2" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.5} />
        </Svg>
      );
    case 'jardinage':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22v-8" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7z" stroke={color} strokeWidth={1.6} fill={color} opacity={0.1} />
          <Path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7z" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 10c3-1 6-4 6-7-4 0-7 3-6 7z" stroke={color} strokeWidth={1.6} fill="none" />
          <Line x1="10" y1="22" x2="14" y2="22" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.4} />
        </Svg>
      );
    case 'escalier':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 20h4v-4h4v-4h4v-4h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx="14" cy="5" r="1.5" stroke={color} strokeWidth={1.4} fill="none" />
          <Path d="M14 6.5l-1 3 1 2" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'lutte_africaine':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="8" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Circle cx="16" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M8 6l2 4 2-1 2 1 2-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M10 10l-3 5-2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M14 10l3 5 2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M10 10v4l-2 3" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <Path d="M14 10v4l2 3" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'danse_africaine':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M7 8l5 2 5-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M9 10l-3 5 1 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M15 10l3 5-1 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx="4" cy="7" r="1" fill={color} opacity={0.3} />
          <Circle cx="20" cy="7" r="1" fill={color} opacity={0.3} />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M8 12h8M12 8v8" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );
  }
};

// ── Sport Card (for grid) ────────────────────────────────────────────────────
const SportCard = ({ sportKey, onPress, userLang, userWeight }) => {
  const sport = ACTIVITY_DATA[sportKey];
  var weightKg = userWeight || 70;
  var kcalPerHour = Math.round(sport.met * weightKg);
  var sportLabel = userLang === 'EN' ? (sport.labelEN || sport.label) : sport.label;
  return (
    <MetalCard
      onPress={onPress}
      style={{
        marginHorizontal: 0,
        marginBottom: wp(8),
        flex: 1,
      }}
    >
      <View style={{ alignItems: 'center', paddingVertical: wp(4) }}>
        <SportIcon type={sportKey} size={wp(24)} color={sport.color} />
        <Text style={{
          color: '#EAEEF3', fontSize: fp(10), fontWeight: '700',
          marginTop: wp(4), textAlign: 'center',
        }}>
          {sportLabel}
        </Text>
        <Text style={{
          color: sport.color, fontSize: fp(8), fontWeight: '600',
          marginTop: wp(2),
        }}>
          {kcalPerHour} kcal/h
        </Text>
      </View>
    </MetalCard>
  );
};

// ── Sport Modal ──────────────────────────────────────────────────────────────
const SportModal = ({ visible, sportKey, onClose, onSave, userLang, userWeight }) => {
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('modere');

  if (!sportKey) return null;
  const sport = ACTIVITY_DATA[sportKey];
  var weightKg = userWeight || 70;
  var calories = calcCalories(sport.met, weightKg, duration, intensity);
  var waterLost = calcWater(sport.water_per_hour_ml, duration, intensity);

  var lang = userLang || 'FR';
  const intensities = [
    { key: 'leger', label: T[lang].light, mult: 0.7 },
    { key: 'modere', label: T[lang].moderate, mult: 1.0 },
    { key: 'intense', label: T[lang].intense, mult: 1.3 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center', alignItems: 'center',
        }}
      >
        <Pressable onPress={() => {}} style={{ width: W - wp(40) }}>
          <MetalCard style={{ marginHorizontal: 0, marginBottom: 0 }}>
            <View>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(12) }}>
                <View style={{ marginRight: wp(8) }}>
                  <SportIcon type={sportKey} size={wp(24)} color={sport.color} />
                </View>
                <Text style={{
                  color: '#EAEEF3', fontSize: fp(16), fontWeight: '800',
                  letterSpacing: 1, textTransform: 'uppercase',
                }}>
                  {lang === 'EN' ? sport.labelEN : sport.label}
                </Text>
                <Pressable onPress={onClose} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close-circle" size={wp(22)} color="#555E6C" />
                </Pressable>
              </View>

              {/* Duration slider */}
              <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600', marginBottom: wp(6) }}>
                {T[lang].durationLabel} : {duration} min
              </Text>
              <View style={{
                flexDirection: 'row', flexWrap: 'wrap', gap: wp(4), marginBottom: wp(12),
              }}>
                {[5, 10, 15, 20, 30, 45, 60, 90, 120].map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDuration(d)}
                    style={{
                      paddingHorizontal: wp(8), paddingVertical: wp(5),
                      borderRadius: wp(8),
                      backgroundColor: duration === d ? sport.color : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: duration === d ? sport.color : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Text style={{
                      fontSize: fp(9), fontWeight: '700',
                      color: duration === d ? '#000' : '#8892A0',
                    }}>
                      {d}m
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Intensity */}
              <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600', marginBottom: wp(6) }}>
                {T[lang].intensity}
              </Text>
              <View style={{ flexDirection: 'row', gap: wp(6), marginBottom: wp(14) }}>
                {intensities.map((int) => (
                  <Pressable
                    key={int.key}
                    onPress={() => setIntensity(int.key)}
                    style={{
                      flex: 1, paddingVertical: wp(8), borderRadius: wp(8),
                      backgroundColor: intensity === int.key ? sport.color : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: intensity === int.key ? sport.color : 'rgba(255,255,255,0.08)',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: fp(9), fontWeight: '700',
                      color: intensity === int.key ? '#000' : '#8892A0',
                    }}>
                      {int.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Calories estimate */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: wp(14),
                paddingHorizontal: wp(8), paddingVertical: wp(8),
                backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(10),
              }}>
                <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600' }}>
                  {T[lang].estimate}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ color: '#FF8C42', fontSize: fp(20), fontWeight: '900' }}>
                    {calories}
                  </Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(10), marginLeft: wp(3) }}>
                    kcal
                  </Text>
                </View>
              </View>

              {/* Sources scientifiques */}
              <View style={{
                marginTop: wp(10),
                paddingTop: wp(8),
                borderTopWidth: 1,
                borderTopColor: 'rgba(74,79,85,0.3)',
              }}>
                <Text style={{
                  fontSize: fp(8),
                  color: '#6B7280',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  lineHeight: fp(12),
                }}>
                  {lang === 'EN'
                    ? 'Estimate: MET ' + sport.met + ' \u00D7 ' + weightKg + 'kg \u00D7 duration. Source: Compendium of Physical Activities (Ainsworth et al., 2011).'
                    : 'Calcul : MET ' + sport.met + ' \u00D7 ' + weightKg + 'kg \u00D7 dur\u00E9e. Source : Compendium of Physical Activities (Ainsworth et al., 2011).'}
                </Text>
              </View>

              {/* Save button */}
              <TouchableOpacity
                onPress={() => onSave(sportKey, duration, calories, intensity, waterLost)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: sport.color, borderRadius: wp(12),
                  paddingVertical: wp(12), alignItems: 'center', marginTop: wp(10),
                }}
              >
                <Text style={{ color: '#000', fontSize: fp(12), fontWeight: '800' }}>
                  {String.fromCodePoint(0x2713)} {T[lang].add} — {calories} kcal
                </Text>
              </TouchableOpacity>
            </View>
          </MetalCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const ActivityPage = ({ onNavigate }) => {
  // ── State ────────────────────────────────────────────────────────────────
  const [todayActivities, setTodayActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('activity');

  // Save feedback
  const [runSaved, setRunSaved] = useState(false);

  // Walk side-scroll
  const [walkScrollOffset, setWalkScrollOffset] = useState(0);
  const [walkCanvasW, setWalkCanvasW] = useState(280);
  const [walkRoundTrip, setWalkRoundTrip] = useState(false);
  const [walkSaved, setWalkSaved] = useState(false);

  // Walk controls
  const walkIntervalRef = useRef(null);
  const walkSpeedRef = useRef(2);
  const walkHoldStartRef = useRef(0);

  // Run side-scroll (same system as walk)
  const [runScrollOffset, setRunScrollOffset] = useState(0);
  const [runCanvasW, setRunCanvasW] = useState(280);
  const [runRoundTrip, setRunRoundTrip] = useState(false);
  const runIntervalRef = useRef(null);
  const runSpeedRef = useRef(2);
  const runHoldStartRef = useRef(0);
  const isRunMovingRef = useRef(false);
  const [runMilestone, setRunMilestone] = useState(null);
  const runMilestoneTimerRef = useRef(null);
  const runMilestoneHitRef = useRef({});

  const [isRunning, setIsRunning] = useState(false);

  // Sport modal
  const [modalSport, setModalSport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Live GPS placeholder
  const [showLivePlaceholder, setShowLivePlaceholder] = useState(false);

  // Anti-triche: +5 Lix une seule fois par jour
  const [lixRewardedToday, setLixRewardedToday] = useState(false);

  // Smart recommendations
  const [caloriesToBurn, setCaloriesToBurn] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(2000);
  const [totalEaten, setTotalEaten] = useState(0);
  const [totalBurnedActivities, setTotalBurnedActivities] = useState(0);
  const [userMood, setUserMood] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [showPostReport, setShowPostReport] = useState(false);
  const [lastActivity, setLastActivity] = useState(null);
  const [walkGlow, setWalkGlow] = useState(false);
  const [runGlow, setRunGlow] = useState(false);

  // === SYSTÈME POUVOIRS CARACTÈRES ===
  const [activeChar, setActiveChar] = useState(null);
  const [pagePowers, setPagePowers] = useState([]);
  const [hookResults, setHookResults] = useState({});
  const [userNameAvatar, setUserNameAvatar] = useState('');
  const [lixBalance, setLixBalance] = useState(0);
  const [userEnergy, setUserEnergy] = useState(20);
  var _weight = useState(70); var userWeight = _weight[0]; var setUserWeight = _weight[1];
  var _lang = useState('FR'); var userLang = _lang[0]; var setUserLang = _lang[1];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  var toggleDropdown = function() {
    var toValue = dropdownOpen ? 0 : 1;
    Animated.spring(dropdownAnim, {
      toValue: toValue,
      tension: 80,
      friction: 10,
      useNativeDriver: false,
    }).start();
    setDropdownOpen(!dropdownOpen);
  };

  // Shoe animation
  const shoeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shoeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(shoeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Smart recommendation generator ────────────────────────────────────
  const generateRecommendation = (toBurn, mood, weight) => {
    if (toBurn <= 0) {
      setRecommendation({
        type: 'maintain',
        emoji: '✅',
        title: 'Vous êtes dans votre objectif',
        subtitle: 'Une petite marche de 15 min maintient votre métabolisme actif',
        activity: 'Marche',
        duration: '15 min',
        distance: '1 km',
        color: '#00D984',
      });
      return;
    }

    const walkHours = toBurn / (ACTIVITY_DATA.marche.met * weight);
    const walkMin = Math.ceil(walkHours * 60);
    const walkKm = (walkMin * 5 / 60).toFixed(1);

    const runHours = toBurn / (ACTIVITY_DATA.course.met * weight);
    const runMin = Math.ceil(runHours * 60);
    const runKm = (runMin * 8 / 60).toFixed(1);

    let preferActivity = 'both';
    if (mood) {
      // Valeurs exactes sauvegardées par le Mood Modal
      if (mood === 'sad' || mood === 'chill') {
        preferActivity = 'walk'; // Fatigué ou tranquille → marche douce
      }
      if (mood === 'happy' || mood === 'excited') {
        preferActivity = 'run'; // Énergique → course
      }
    }

    if (preferActivity === 'walk' || (preferActivity === 'both' && toBurn < 150)) {
      setRecommendation({
        type: 'burn',
        emoji: '🚶',
        title: `${toBurn} kcal à compenser`,
        subtitle: `Une marche de ${walkMin} min (≈${walkKm} km) suffirait pour revenir à votre objectif`,
        activity: 'Marche',
        duration: `${walkMin} min`,
        distance: `${walkKm} km`,
        color: '#FF8C42',
        moodNote: mood === 'sad' ? 'La marche est idéale quand on a besoin de décompresser' : mood ? 'Une marche tranquille, parfait pour votre humeur chill' : null,
      });
    } else if (preferActivity === 'run') {
      setRecommendation({
        type: 'burn',
        emoji: '🏃',
        title: `${toBurn} kcal à compenser`,
        subtitle: `Une course de ${runMin} min (≈${runKm} km) vous remettrait dans votre objectif`,
        activity: 'Course',
        duration: `${runMin} min`,
        distance: `${runKm} km`,
        color: '#FF8C42',
        moodNote: mood === 'excited' ? 'Vous débordez d\'énergie, profitez-en !' : mood ? 'Bonne humeur = bon moment pour courir' : null,
      });
    } else {
      setRecommendation({
        type: 'burn',
        emoji: '🔥',
        title: `${toBurn} kcal à compenser`,
        subtitle: `Marche ${walkMin} min (${walkKm} km) ou Course ${runMin} min (${runKm} km)`,
        activity: 'Les deux',
        duration: `${walkMin} min ou ${runMin} min`,
        distance: `${walkKm} km ou ${runKm} km`,
        color: '#FF8C42',
        moodNote: null,
      });
    }
  };

  // ── Fetch smart data (profile + daily summary) ──────────────────────
  const fetchSmartData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: profile } = await supabase
        .from('users_profile')
        .select('daily_calorie_target, current_mood, weight')
        .eq('user_id', TEST_USER_ID)
        .maybeSingle();

      const target = profile?.daily_calorie_target || 2000;
      const mood = profile?.current_mood || null;
      const weight = profile?.weight || 70;
      setUserWeight(weight);
      setDailyTarget(target);
      setUserMood(mood);

      const { data: summary } = await supabase
        .from('daily_summary')
        .select('total_calories, total_calories_burned')
        .eq('user_id', TEST_USER_ID)
        .eq('date', today)
        .maybeSingle();

      const eaten = summary?.total_calories || 0;
      const burned = summary?.total_calories_burned || 0;
      setTotalEaten(eaten);
      setTotalBurnedActivities(burned);

      const balance = eaten - burned - target;
      const toBurn = balance > 0 ? balance : 0;
      setCaloriesToBurn(toBurn);

      generateRecommendation(toBurn, mood, weight);
    } catch (e) {
      console.warn('Smart data fetch error:', e);
    }
  };

  // Load today's activities + check Lix reward + fetch smart data
  useEffect(() => {
    loadTodayActivities();
    const checkLixReward = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('user_activities')
          .select('id')
          .eq('user_id', TEST_USER_ID)
          .gte('created_at', today + 'T00:00:00')
          .limit(1);
        if (data && data.length > 0) {
          setLixRewardedToday(true);
        }
      } catch (e) {
        console.warn('Lix reward check failed:', e);
      }
    };
    checkLixReward();
    fetchSmartData();
    fetchWeeklyMinutes();
    loadPagePowers();
    // Avatar profil + Lix balance
    (async () => {
      try {
        const { data: profile } = await supabase.from('users_profile').select('full_name, lix_balance, language, weight').eq('user_id', TEST_USER_ID).maybeSingle();
        if (profile) {
          setUserNameAvatar(profile.full_name || '');
          setLixBalance(profile.lix_balance || 0);
          if (profile.language) setUserLang(profile.language);
          if (profile.weight) setUserWeight(profile.weight);
        }
      } catch (e) {}
    })();
  }, []);

  const fetchWeeklyMinutes = async () => {
    try {
      const userId = '00000000-0000-0000-0000-000000000001';
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      const mondayISO = monday.toISOString();

      const { data } = await supabase
        .from('user_activities')
        .select('duration_min')
        .eq('user_id', userId)
        .gte('performed_at', mondayISO);

      const total = (data || []).reduce((sum, a) => sum + (a.duration_min || 0), 0);
      setWeeklyMinutes(total);
    } catch (e) {
      console.warn('Weekly minutes error:', e);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // SYSTÈME GÉNÉRIQUE DE POUVOIRS — PAGE ACTIVITÉ
  // ══════════════════════════════════════════════════════════════
  const ACTIVITY_PAGE = 'activite';

  const loadPagePowers = async () => {
    try {
      const { data: collection } = await supabase
        .rpc('get_user_collection', { p_user_id: TEST_USER_ID });
      const active = (collection || []).find(c => c.is_active);
      if (!active) { setActiveChar(null); setPagePowers([]); return; }
      setActiveChar(active);

      const { data: powers } = await supabase
        .rpc('get_character_powers', {
          p_user_id: TEST_USER_ID,
          p_slug: active.slug,
        });
      const filtered = (powers || []).filter(p =>
        p.redirect_page === ACTIVITY_PAGE && p.unlocked
      );
      setPagePowers(filtered);
    } catch (e) {
      console.warn('Page powers load error:', e);
    }
  };

  const consumePower = async (powerKey) => {
    try {
      const { data } = await supabase.rpc('use_character_power', {
        p_user_id: TEST_USER_ID,
        p_power_key: powerKey,
      });
      if (data?.success) {
        setActiveChar(prev => prev ? { ...prev, uses_remaining: data.uses_remaining } : null);
        return { success: true, uses_remaining: data.uses_remaining };
      }
      if (data?.error === 'No uses remaining') {
        Alert.alert('⚡ Utilisations épuisées',
          'Recharge ton ' + (activeChar?.name || 'personnage') + ' dans l\'onglet Caractères.');
      }
      return { success: false, error: data?.error };
    } catch (e) {
      console.error('Consume power error:', e);
      return { success: false, error: 'network' };
    }
  };

  // ── Helpers par action_type ──────────────────────────────────

  const getPowerByType = (actionType) => {
    return pagePowers
      .filter(p => p.action_type === actionType)
      .sort((a, b) => (b.level_required || 0) - (a.level_required || 0))[0] || null;
  };

  const extractMultiplier = (power) => {
    if (!power?.redirect_filter) return 1.0;
    if (power.redirect_filter.includes('30')) return 1.30;
    if (power.redirect_filter.includes('20')) return 1.20;
    if (power.redirect_filter.includes('10')) return 1.10;
    return 1.0;
  };

  // ══════════════════════════════════════════════════════════════
  // POST-SAVE HOOKS — exécutés après chaque activité sauvegardée
  // Pour ajouter un nouveau hook : ajouter 1 case, c'est tout.
  // ══════════════════════════════════════════════════════════════
  const runPostSaveHooks = async (activityType, caloriesBurned, durationMin) => {
    const results = {};

    for (const power of pagePowers) {
      switch (power.action_type) {

        // ── BOOST XP (Ruby Tiger) ──────────────────────────────
        case 'redirect_with_boost': {
          if (activeChar?.uses_remaining > 0) {
            const consumed = await consumePower(power.power_key);
            if (consumed.success) {
              const multiplier = extractMultiplier(power);
              const baseXP = Math.round(caloriesBurned);
              const bonusXP = Math.round(baseXP * (multiplier - 1));
              results.xp_boost = {
                type: 'xp_boost',
                icon: power.icon || '🐯',
                char_name: activeChar?.name,
                multiplier,
                percentage: Math.round((multiplier - 1) * 100),
                base_xp: baseXP,
                bonus_xp: bonusXP,
                total_xp: baseXP + bonusXP,
                uses_remaining: consumed.uses_remaining,
              };
            }
          }
          break;
        }

        // ── STREAK TRACKER (Silver Wolf — futur) ───────────────
        // case 'streak_tracker': {
        //   const streakResult = await supabase.rpc('update_activity_streak', {
        //     p_user_id: TEST_USER_ID,
        //     p_activity_type: activityType,
        //   });
        //   results.streak = {
        //     type: 'streak',
        //     icon: power.icon,
        //     char_name: activeChar?.name,
        //     current_streak: streakResult.data?.streak || 0,
        //     is_new_record: streakResult.data?.is_record || false,
        //   };
        //   break;
        // }

        // ── RECOVERY DETECT (Jade Phoenix — futur) ─────────────
        // case 'recovery_detect': {
        //   results.recovery = {
        //     type: 'recovery',
        //     icon: power.icon,
        //     suggestion: caloriesBurned > 500
        //       ? 'Activité intense — pensez à une journée repos demain'
        //       : null,
        //   };
        //   break;
        // }

        default:
          break;
      }
    }

    setHookResults(results);
    loadPagePowers();
    return results;
  };

  // ── Tab handler ─────────────────────────────────────────────────────────
  const handleTabPress = (key) => {
    if (key === 'activity') return;
    if (onNavigate) onNavigate(key);
    setActiveTab(key);
  };

  // ── Supabase functions ─────────────────────────────────────────────────
  const loadTodayActivities = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('date', today)
      .order('created_at', { ascending: false });
    if (data) setTodayActivities(data);
  };

  // FIX 6: Save via RPC (SECURITY DEFINER)
  const saveActivity = async (activityType, durationMin, caloriesBurned, intensity, waterLost) => {
    const actData = ACTIVITY_DATA[activityType];
    if (!actData) return false;

    try {
      const { data, error } = await supabase.rpc('add_user_activity', {
        p_user_id: TEST_USER_ID,
        p_name: actData.label,
        p_type: activityType,
        p_duration_minutes: Math.round(durationMin),
        p_calories_burned: Math.round(caloriesBurned),
        p_intensity: intensity || 'modere',
        p_water_lost_ml: Math.round(waterLost),
      });

      if (error) {
        console.error('Save activity error:', error);
        alert('Erreur : ' + error.message);
        return false;
      }

      // === HOOKS POST-SAVE — exécute tous les pouvoirs actifs ===
      if (pagePowers.length > 0) {
        await runPostSaveHooks(activityType, caloriesBurned, durationMin);
      } else {
        setHookResults({});
      }

      await loadTodayActivities();
      fetchSmartData();
      if (!lixRewardedToday) {
        setLixRewardedToday(true);
        // TODO: Appel API pour créditer +5 Lix au compte utilisateur
      }
      return true;
    } catch (e) {
      console.error('Save error:', e);
      alert('Erreur réseau.');
      return false;
    }
  };

  // FIX 5: Delete via RPC (SECURITY DEFINER)
  const deleteActivity = async (activityId) => {
    try {
      const { error } = await supabase.rpc('delete_user_activity', {
        p_activity_id: activityId,
        p_user_id: TEST_USER_ID,
      });
      if (error) {
        console.error('Delete error:', error);
        alert('Erreur suppression : ' + error.message);
        return;
      }
      await loadTodayActivities();
    } catch (e) {
      console.error('Delete activity error:', e);
    }
  };

  // ── Run constants & calculations ──────────────────────────────────────
  const RUN_SCENE_W = 8400;       // 42km marathon canvas
  const RUN_MAX_DIST = 42000;     // 42 km in metres
  const RUN_CANVAS_H = 85;        // compact canvas height

  // Jaguar animation frame

  const runMaxS = RUN_SCENE_W - runCanvasW;
  const runProg = runMaxS > 0 ? runScrollOffset / runMaxS : 0;
  const RUN_METERS_PER_PIXEL = RUN_MAX_DIST / RUN_SCENE_W;
  const RUN_PIXELS_PER_METER = RUN_SCENE_W / RUN_MAX_DIST;
  const runDistM = runScrollOffset * RUN_METERS_PER_PIXEL;
  const runMul = runRoundTrip ? 2 : 1;
  const runDistKm = (runDistM * runMul) / 1000;
  var runCalories = calcCalories(ACTIVITY_DATA.course.met, userWeight, runDuration, 'modere');
  var runWater = calcWater(ACTIVITY_DATA.course.water_per_hour_ml, runDuration, 'modere');
  const runDuration = Math.round((runDistKm / 8) * 60);
  const runDistFinal = runDistM * runMul;
  const runDistStr = runDistFinal < 1000 ? `${Math.round(runDistFinal)} m` : `${Math.round(runDistFinal / 100) / 10} km`;
  const runDurStr = (() => { const m = Math.round(runDuration); return m < 60 ? `${m} min` : `${Math.round(m / 6) / 10} h`; })();

  // Day totals
  const totalCalories = todayActivities.reduce((s, a) => s + (a.calories_burned || 0), 0);
  const totalDuration = todayActivities.reduce((s, a) => s + (a.duration_minutes || 0), 0);
  const totalWater = todayActivities.reduce((s, a) => s + (a.water_lost_ml || 0), 0);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAddRun = async () => {
    if (runCalories === 0) return;
    const ok = await saveActivity('course', runDuration, runCalories, 'modere', runWater);
    if (ok) {
      setRunSaved(true);
      setLastActivity({
        type: 'run',
        name: T[userLang].run,
        distance: runDistStr,
        duration: runDuration,
        kcal: runCalories,
        water: runWater,
        speed: null,
      });
      setShowPostReport(true);
      fetchWeeklyMinutes();
      setTimeout(() => {
        setRunSaved(false);
        setRunScrollOffset(0);
        runMilestoneHitRef.current = {};
      }, 1500);
    }
  };

  const handleSportSave = async (sportKey, duration, calories, intensity, waterLost) => {
    const ok = await saveActivity(sportKey, duration, calories, intensity, waterLost);
    if (ok) {
      setModalVisible(false);
      setLastActivity({
        type: 'other',
        name: ACTIVITY_DATA[sportKey].label,
        distance: null,
        duration: duration,
        kcal: calories,
        water: null,
        speed: null,
      });
      setShowPostReport(true);
      fetchWeeklyMinutes();
    }
  };

  const handleDeleteActivity = (activity) => {
    Alert.alert(
      T[userLang].delete,
      T[userLang].deleteConfirm,
      [
        { text: T[userLang].cancel, style: 'cancel' },
        { text: T[userLang].delete, style: 'destructive', onPress: () => deleteActivity(activity.id) },
      ]
    );
  };

  const todayDateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  // ── Walk constants ─────────────────────────────────────────────────────
  const WALK_SCENE_W = 2000;
  const WALK_MAX_DIST = 10000;
  const WALK_CANVAS_H = 85;   // compact canvas height

  // ── Walk computed values ──────────────────────────────────────────────
  const walkMaxS = WALK_SCENE_W - walkCanvasW;
  const walkProg = walkMaxS > 0 ? walkScrollOffset / walkMaxS : 0;
  const walkDistM = walkProg * WALK_MAX_DIST;
  const walkMul = walkRoundTrip ? 2 : 1;
  const walkDurMin = (walkDistM / 5000) * 60;
  var walkCal = calcCalories(ACTIVITY_DATA.marche.met, userWeight, walkDurMin * walkMul, 'modere');
  var walkWater = calcWater(ACTIVITY_DATA.marche.water_per_hour_ml, walkDurMin * walkMul, 'modere');
  const walkDistFinal = walkDistM * walkMul;
  const walkDistStr = walkDistFinal < 1000 ? `${Math.round(walkDistFinal)} m` : `${Math.round(walkDistFinal / 100) / 10} km`;
  const walkDurStr = (() => { const m = Math.round(walkDurMin * walkMul); return m < 60 ? `${m} min` : `${Math.round(m / 6) / 10} h`; })();

  // ── Walk knob interaction ─────────────────────────────────────────────
  const startWalkMoving = (direction) => {
    setWalkGlow(true);
    walkHoldStartRef.current = Date.now();
    walkSpeedRef.current = 2;
    walkIntervalRef.current = setInterval(() => {
      const holdDuration = Date.now() - walkHoldStartRef.current;
      if (holdDuration > 3000) walkSpeedRef.current = 16;
      else if (holdDuration > 2000) walkSpeedRef.current = 10;
      else if (holdDuration > 1000) walkSpeedRef.current = 6;
      else if (holdDuration > 500) walkSpeedRef.current = 4;
      else walkSpeedRef.current = 2;
      setWalkScrollOffset(prev => {
        const maxS = WALK_SCENE_W - walkCanvasW;
        return Math.max(0, Math.min(prev + direction * walkSpeedRef.current, maxS));
      });
    }, 50);
  };
  const stopWalkMoving = () => {
    setWalkGlow(false);
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current);
      walkIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => { if (walkIntervalRef.current) clearInterval(walkIntervalRef.current); };
  }, []);

  // ── Run knob interaction ──────────────────────────────────────────────
  const startRunMoving = (direction) => {
    setRunGlow(true);
    runHoldStartRef.current = Date.now();
    runSpeedRef.current = 2;
    isRunMovingRef.current = true;
    setIsRunning(true);
    runIntervalRef.current = setInterval(() => {
      const holdDuration = Date.now() - runHoldStartRef.current;
      if (holdDuration > 3000) runSpeedRef.current = 16;
      else if (holdDuration > 2000) runSpeedRef.current = 10;
      else if (holdDuration > 1000) runSpeedRef.current = 6;
      else if (holdDuration > 500) runSpeedRef.current = 4;
      else runSpeedRef.current = 2;
      setRunScrollOffset(prev => {
        const maxS = RUN_SCENE_W - runCanvasW;
        return Math.max(0, Math.min(prev + direction * runSpeedRef.current, maxS));
      });
    }, 50);
  };
  const stopRunMoving = () => {
    setRunGlow(false);
    isRunMovingRef.current = false;
    setIsRunning(false);
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => { if (runIntervalRef.current) clearInterval(runIntervalRef.current); };
  }, []);

  // Run milestone detection
  useEffect(() => {
    const distanceM = runDistM;
    const milestones = [500, 1000, 2000, 5000, 10000, 21000];
    milestones.forEach(m => {
      if (distanceM >= m && distanceM < m + 50 && !runMilestoneHitRef.current[m]) {
        runMilestoneHitRef.current[m] = true;
        setRunMilestone(m);
        if (runMilestoneTimerRef.current) clearTimeout(runMilestoneTimerRef.current);
        runMilestoneTimerRef.current = setTimeout(() => setRunMilestone(null), 3000);
      }
    });
  }, [runScrollOffset]);


  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <MetallicBackground />
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 55 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: wp(120) }}
        >
          {/* HEADER */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: wp(12), paddingBottom: wp(8),
          }}>
            <Text style={{
              color: '#EAEEF3', fontSize: fp(18), fontWeight: '800', letterSpacing: 1.5,
            }}>
              {T[userLang].activity}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(0,217,132,0.08)',
                paddingHorizontal: wp(8), paddingVertical: wp(4),
                borderRadius: wp(10), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
              }}>
                <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>
                  {T[userLang].today}
                </Text>
                <Text style={{ color: '#8892A0', fontSize: fp(9), marginLeft: wp(4) }}>
                  {todayDateStr}
                </Text>
              </View>
              {/* Badge compact Lix + dropdown */}
              <TouchableOpacity onPress={toggleDropdown} style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
                borderWidth: 1, borderColor: '#4A4F55',
                borderRadius: wp(20), paddingHorizontal: wp(10), paddingVertical: wp(6),
                maxWidth: wp(110),
              }}>
                <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24">
                  <Path d="M12 2L2 9l10 13L22 9z" fill="#00D984" />
                  <Path d="M12 2L2 9h20z" fill="#33E8A0" opacity={0.6} />
                </Svg>
                <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: fp(12), marginLeft: wp(4) }} numberOfLines={1}>{lixBalance}</Text>
                <Text style={{ color: '#888', fontSize: fp(10), marginLeft: wp(4) }}>▾</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dropdown Lix/Énergie/Profil — Premium */}
          {dropdownOpen && (
            <TouchableOpacity activeOpacity={1} onPress={toggleDropdown} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}>
              <Animated.View style={{
                position: 'absolute', top: Platform.OS === 'android' ? 100 : 110, right: wp(16),
                backgroundColor: 'rgba(26, 29, 34, 0.97)',
                borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
                borderRadius: wp(16), padding: wp(14), zIndex: 999,
                opacity: dropdownAnim,
                transform: [{
                  scale: dropdownAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  })
                }],
                shadowColor: '#00D984',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 20,
              }}>
                <View style={{
                  position: 'absolute', top: 0, left: wp(20), right: wp(20),
                  height: 1.5, backgroundColor: 'rgba(0,217,132,0.25)', borderRadius: 1,
                }} />
                <TouchableOpacity onPress={function() { toggleDropdown(); if (onNavigate) onNavigate('lixverse'); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(8) }}>
                  <View style={{
                    width: wp(32), height: wp(32), borderRadius: wp(16),
                    backgroundColor: 'rgba(0,217,132,0.08)',
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: wp(10), borderWidth: 0.5,
                    borderColor: 'rgba(0,217,132,0.15)',
                  }}>
                    <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24">
                      <Path d="M12 2L2 9l10 13L22 9z" fill="#00D984" />
                      <Path d="M12 2L2 9h20z" fill="#33E8A0" opacity={0.6} />
                    </Svg>
                  </View>
                  <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: fp(16), marginRight: wp(4) }}>{lixBalance}</Text>
                  <Text style={{ color: '#888', fontSize: fp(12) }}>Lix</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={function() { toggleDropdown(); if (onNavigate) onNavigate('lixverse'); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(8) }}>
                  <View style={{
                    width: wp(32), height: wp(32), borderRadius: wp(16),
                    backgroundColor: userEnergy <= 5 ? 'rgba(255,107,107,0.08)' : 'rgba(255,184,0,0.08)',
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: wp(10), borderWidth: 0.5,
                    borderColor: userEnergy <= 5 ? 'rgba(255,107,107,0.15)' : 'rgba(255,184,0,0.15)',
                  }}>
                    <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24">
                      <Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill={userEnergy <= 5 ? '#FF6B6B' : '#FFB800'} />
                    </Svg>
                  </View>
                  <Text style={{ color: userEnergy <= 5 ? '#FF6B6B' : '#FFF', fontWeight: 'bold', fontSize: fp(16), marginRight: wp(4) }}>{userEnergy}</Text>
                  <Text style={{ color: '#888', fontSize: fp(12) }}>{T[userLang].energy}</Text>
                </TouchableOpacity>
                <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(74,79,85,0.4)', marginVertical: wp(4) }} />
                <TouchableOpacity onPress={function() { toggleDropdown(); if (onNavigate) onNavigate('profile'); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(8) }}>
                  <View style={{
                    width: wp(32), height: wp(32), borderRadius: wp(16),
                    backgroundColor: 'rgba(0,217,132,0.08)',
                    justifyContent: 'center', alignItems: 'center',
                    marginRight: wp(10), borderWidth: 0.5,
                    borderColor: 'rgba(0,217,132,0.15)',
                  }}>
                    <Text style={{ fontSize: fp(14) }}>{activeChar?.slug ? ({ emerald_owl: '🦉', hawk_eye: '🦅', ruby_tiger: '🐯', amber_fox: '🦊', gipsy: '🕷️', jade_phoenix: '🔥', silver_wolf: '🐺', boukki: '🦴', iron_rhino: '🦏', coral_dolphin: '🐬' })[activeChar.slug] || '👤' : '👤'}</Text>
                  </View>
                  <Text style={{ color: '#FFF', fontSize: fp(12), flex: 1 }}>{T[userLang].myProfile}</Text>
                  <Text style={{ color: '#555E6C', fontSize: fp(12) }}>{String.fromCodePoint(0x2192)}</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          )}

          {/* ══════ BANNIÈRES POUVOIRS ACTIFS ══════ */}
          {pagePowers.length > 0 && activeChar && (
            <View style={{ marginHorizontal: wp(16), marginBottom: wp(4), gap: wp(4) }}>
              {pagePowers.map(power => {
                switch (power.action_type) {

                  // ── BOOST XP BANNER ──
                  case 'redirect_with_boost': {
                    const multiplier = extractMultiplier(power);
                    const pct = Math.round((multiplier - 1) * 100);
                    return (
                      <View key={power.power_key} style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: 'rgba(212,175,55,0.06)',
                        borderRadius: wp(12), borderWidth: 1,
                        borderColor: 'rgba(212,175,55,0.15)',
                        padding: wp(8),
                      }}>
                        <View style={{
                          width: wp(32), height: wp(32), borderRadius: wp(16),
                          backgroundColor: 'rgba(212,175,55,0.1)',
                          justifyContent: 'center', alignItems: 'center',
                          marginRight: wp(8), borderWidth: 1,
                          borderColor: 'rgba(212,175,55,0.2)',
                        }}>
                          <Text style={{ fontSize: fp(16) }}>{power.icon || '🐯'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>
                              {activeChar.name}
                            </Text>
                            {power.is_superpower && (
                              <View style={{
                                marginLeft: wp(6), backgroundColor: 'rgba(212,175,55,0.1)',
                                paddingHorizontal: wp(4), paddingVertical: wp(1), borderRadius: wp(4),
                              }}>
                                <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '800' }}>
                                  SUPERPOWER
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ color: '#8892A0', fontSize: fp(8), marginTop: wp(1) }}>
                            +{pct}% {T[userLang].perActivity}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ color: '#D4AF37', fontSize: fp(12), fontWeight: '800' }}>
                            {activeChar.uses_remaining}/{activeChar.max_uses_per_cycle || 10}
                          </Text>
                          <Text style={{ color: '#5A6070', fontSize: fp(7) }}>{T[userLang].uses}</Text>
                        </View>
                      </View>
                    );
                  }

                  // ── REALTIME OVERLAY BANNER (Iron Rhino — futur) ──
                  // case 'realtime_overlay':
                  //   return (
                  //     <View key={power.power_key} style={{...}}>
                  //       <Text>🦏 Calories en temps réel actif</Text>
                  //     </View>
                  //   );

                  // ── STREAK BANNER (Silver Wolf — futur) ──
                  // case 'streak_tracker':
                  //   return (
                  //     <View key={power.power_key} style={{...}}>
                  //       <Text>🐺 Streak : 5 jours consécutifs</Text>
                  //     </View>
                  //   );

                  default:
                    return null;
                }
              })}
            </View>
          )}

          {/* DAY SUMMARY — Premium 2-line layout */}
          <View style={{
            marginHorizontal: wp(16),
            marginTop: wp(8),
            marginBottom: wp(4),
            borderRadius: wp(16),
            borderWidth: 1,
            borderColor: '#4A4F55',
            backgroundColor: '#252A30',
            padding: wp(10),
          }}>
            {/* Ligne principale : Brûlé + À brûler */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(8) }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(4) }}>
                  <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2C12 2 4 12 4 16C4 20.4183 7.58172 24 12 24C16.4183 24 20 20.4183 20 16C20 12 12 2 12 2Z" fill="#FF8C42" />
                    <Path d="M12 18C10.3431 18 9 16.6569 9 15C9 13 12 9 12 9C12 9 15 13 15 15C15 16.6569 13.6569 18 12 18Z" fill="#FFD93D" />
                  </Svg>
                  <Text style={{ fontSize: fp(9), color: '#9CA3AF', marginLeft: wp(4), fontWeight: '600' }}>{T[userLang].burned}</Text>
                </View>
                <Text style={{ fontSize: fp(22), fontWeight: '900', color: '#FF8C42' }}>
                  {totalCalories}
                </Text>
                <Text style={{ fontSize: fp(8), color: '#6B7280' }}>kcal</Text>
              </View>

              <View style={{ width: 1, backgroundColor: 'rgba(74,79,85,0.4)', marginHorizontal: wp(4) }} />

              <View style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(4) }}>
                  <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke={caloriesToBurn > 0 ? '#FF6B6B' : '#00D984'} strokeWidth="2" fill="none" />
                    <Path d="M12 6V12L16 14" stroke={caloriesToBurn > 0 ? '#FF6B6B' : '#00D984'} strokeWidth="2" strokeLinecap="round" />
                  </Svg>
                  <Text style={{ fontSize: fp(9), color: '#9CA3AF', marginLeft: wp(4), fontWeight: '600' }}>{T[userLang].toBurn}</Text>
                </View>
                <Text style={{
                  fontSize: fp(22), fontWeight: '900',
                  color: caloriesToBurn > 0 ? '#FF6B6B' : '#00D984',
                }}>
                  {caloriesToBurn}
                </Text>
                <Text style={{ fontSize: fp(8), color: '#6B7280' }}>kcal</Text>
              </View>
            </View>

            {/* Séparateur horizontal */}
            <View style={{ height: 1, backgroundColor: 'rgba(74,79,85,0.3)', marginBottom: wp(6) }} />

            {/* Ligne secondaire : Temps + Eau perdue */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
                  <Path d="M12 6V12H16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                </Svg>
                <View style={{ marginLeft: wp(6) }}>
                  <Text style={{ fontSize: fp(7), color: '#6B7280' }}>{T[userLang].time}</Text>
                  <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFFFFF' }}>
                    {formatDuration(totalDuration)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L6 12C6 16.4183 8.68629 20 12 20C15.3137 20 18 16.4183 18 12L12 2Z" fill="#4DA6FF" opacity="0.8" />
                </Svg>
                <View style={{ marginLeft: wp(6) }}>
                  <Text style={{ fontSize: fp(7), color: '#6B7280' }}>{T[userLang].waterLost}</Text>
                  <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#4DA6FF' }}>
                    {totalWater} ml
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ══════ OBJECTIF OMS HEBDOMADAIRE ══════ */}
          <View style={{
            marginHorizontal: wp(16),
            marginTop: wp(2),
            marginBottom: wp(4),
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#252A30',
            borderRadius: wp(12),
            borderWidth: 0.5,
            borderColor: 'rgba(74,79,85,0.4)',
            padding: wp(10),
          }}>
            {/* Mini anneau de progression */}
            <View style={{ width: wp(44), height: wp(44), marginRight: wp(10) }}>
              <Svg width={wp(44)} height={wp(44)} viewBox="0 0 44 44">
                <Circle
                  cx="22" cy="22" r="18"
                  stroke="rgba(74,79,85,0.3)"
                  strokeWidth="4"
                  fill="none"
                />
                <Circle
                  cx="22" cy="22" r="18"
                  stroke={weeklyMinutes >= 150 ? '#00D984' : '#FF8C42'}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - Math.min(weeklyMinutes / 150, 1))}`}
                  transform="rotate(-90 22 22)"
                />
              </Svg>
              <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{
                  fontSize: fp(10), fontWeight: '800',
                  color: weeklyMinutes >= 150 ? '#00D984' : '#FFFFFF',
                }}>
                  {Math.min(Math.round((weeklyMinutes / 150) * 100), 100)}%
                </Text>
              </View>
            </View>

            {/* Texte */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: fp(16), fontWeight: '800', color: weeklyMinutes >= 150 ? '#00D984' : '#FFFFFF' }}>
                  {weeklyMinutes}
                </Text>
                <Text style={{ fontSize: fp(10), color: '#6B7280', marginLeft: wp(3) }}>
                  / 150 min
                </Text>
              </View>
              <Text style={{ fontSize: fp(8), color: '#6B7280', marginTop: wp(2) }}>
                {T[userLang].weeklyObj}
              </Text>
            </View>

            {weeklyMinutes >= 150 && (
              <Text style={{ fontSize: fp(18) }}>🏅</Text>
            )}
          </View>

          {/* MARCHE — SIDE-SCROLL TAPIS ROULANT */}
          <SectionTitle title={T[userLang].walk} style={{ marginTop: wp(4) }} />
          <MetalCard style={{
            marginBottom: wp(2),
            borderRadius: wp(14),
            borderWidth: 0.5,
            borderColor: walkGlow ? 'rgba(0,217,132,0.5)' : 'rgba(74,79,85,0.3)',
            backgroundColor: 'rgba(37,42,48,0.7)',
            shadowColor: walkGlow ? '#00D984' : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: walkGlow ? 0.3 : 0,
            shadowRadius: walkGlow ? 12 : 0,
            elevation: walkGlow ? 8 : 0,
          }}>
            {/* Stats compact — aligned right */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              paddingHorizontal: wp(10),
              paddingVertical: wp(6),
              gap: wp(10),
            }}>
              <Text style={{ fontSize: fp(10), color: '#FF6B6B', fontWeight: '600' }}>📍{walkDistStr}</Text>
              <Text style={{ fontSize: fp(10), color: '#FF8C42', fontWeight: '600' }}>🔥{walkCal}kcal</Text>
              <Text style={{ fontSize: fp(10), color: '#4DA6FF', fontWeight: '600' }}>💧{walkWater}ml</Text>
            </View>

            {/* Canvas SVG side-scroll */}
            <View
              style={{ position: 'relative', height: WALK_CANVAS_H, borderRadius: wp(10), overflow: 'hidden', backgroundColor: 'rgba(0,217,132,0.03)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.08)' }}
              onLayout={(e) => setWalkCanvasW(e.nativeEvent.layout.width)}
            >
              <Svg width={walkCanvasW} height={WALK_CANVAS_H} viewBox={`${walkScrollOffset} 0 ${walkCanvasW} ${WALK_CANVAS_H}`}>
                <Defs>
                  <SvgLinearGradient id="wSkyGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#87CEEB" stopOpacity={0.9} />
                    <Stop offset="40%" stopColor="#B0E0FF" stopOpacity={0.7} />
                    <Stop offset="100%" stopColor="#E8F5E9" stopOpacity={0.3} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="wGrassGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#4CAF50" stopOpacity={0.4} />
                    <Stop offset="100%" stopColor="#2E7D32" stopOpacity={0.6} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="wPathGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#D7CCC8" stopOpacity={0.3} />
                    <Stop offset="100%" stopColor="#A1887F" stopOpacity={0.2} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="wSunGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#FFF9C4" />
                    <Stop offset="100%" stopColor="#FFD54F" />
                  </SvgLinearGradient>
                </Defs>

                {(() => {
                  const scW = WALK_SCENE_W;
                  const scH = WALK_CANVAS_H;
                  const groundY = scH * 0.60;
                  const pathY = scH * 0.58;
                  const centerX = walkScrollOffset + walkCanvasW / 2;
                  const passed = (px) => centerX > px;

                  return (
                    <>
                      {/* CIEL */}
                      <Rect x={0} y={0} width={scW} height={groundY} fill="url(#wSkyGrad)" />

                      {/* SOLEIL */}
                      <G transform="translate(1400, 20)">
                        {Array.from({ length: 12 }, (_, i) => {
                          const angle = (i / 12) * Math.PI * 2;
                          return <Line key={`sr-${i}`} x1={Math.cos(angle) * 14} y1={Math.sin(angle) * 14} x2={Math.cos(angle) * 22} y2={Math.sin(angle) * 22}
                            stroke="#FFD54F" strokeWidth={1.5} opacity={0.5} strokeLinecap="round" />;
                        })}
                        <Circle cx={0} cy={0} r={12} fill="url(#wSunGrad)" opacity={0.9} />
                        <Circle cx={-3} cy={-3} r={4} fill="#FFFFFF" opacity={0.3} />
                        {walkProg > 0.65 && (
                          <>
                            <Circle cx={0} cy={0} r={22} fill="#FFD54F" opacity={0.15} />
                            <Circle cx={0} cy={0} r={30} fill="#FFD54F" opacity={0.07} />
                            {Array.from({ length: 8 }, (_, i) => {
                              const a = (i / 8) * Math.PI * 2 + 0.2;
                              return <Line key={`xr-${i}`} x1={Math.cos(a) * 18} y1={Math.sin(a) * 18}
                                x2={Math.cos(a) * 28} y2={Math.sin(a) * 28}
                                stroke="#FFF9C4" strokeWidth={2} opacity={0.3} strokeLinecap="round" />;
                            })}
                          </>
                        )}
                      </G>

                      {/* NUAGES */}
                      <G transform="translate(200, 12)" opacity={0.6}>
                        <Ellipse cx={0} cy={0} rx={18} ry={8} fill="white" />
                        <Ellipse cx={-12} cy={2} rx={12} ry={7} fill="white" />
                        <Ellipse cx={12} cy={2} rx={14} ry={7} fill="white" />
                      </G>
                      <G transform="translate(700, 8)" opacity={0.4}>
                        <Ellipse cx={0} cy={0} rx={12} ry={5} fill="white" />
                        <Ellipse cx={-8} cy={1} rx={8} ry={5} fill="white" />
                        <Ellipse cx={8} cy={1} rx={10} ry={5} fill="white" />
                      </G>
                      <G transform="translate(1100, 18)" opacity={0.35}>
                        <Ellipse cx={0} cy={0} rx={14} ry={6} fill="white" />
                        <Ellipse cx={10} cy={1} rx={10} ry={5} fill="white" />
                      </G>
                      <G transform="translate(1600, 10)" opacity={0.5}>
                        <Ellipse cx={0} cy={0} rx={16} ry={7} fill="white" />
                        <Ellipse cx={-10} cy={2} rx={11} ry={6} fill="white" />
                        <Ellipse cx={10} cy={1} rx={12} ry={6} fill="white" />
                      </G>
                      <G transform="translate(1900, 22)" opacity={0.3}>
                        <Ellipse cx={0} cy={0} rx={10} ry={4} fill="white" />
                        <Ellipse cx={7} cy={1} rx={8} ry={4} fill="white" />
                      </G>

                      {/* COLLINES LOINTAINES */}
                      <Path d={`M0 ${groundY} Q300 ${groundY - 25} 600 ${groundY - 10} Q1000 ${groundY - 30} 1400 ${groundY - 8} Q1700 ${groundY - 20} ${scW} ${groundY} Z`}
                        fill="#81C784" opacity={0.25} />

                      {/* SOL / HERBE */}
                      <Rect x={0} y={groundY} width={scW} height={scH - groundY} fill="url(#wGrassGrad)" />

                      {/* Touffes d'herbe */}
                      {Array.from({ length: 120 }, (_, i) => {
                        const x = (i / 120) * scW + (Math.sin(i * 7) * 3);
                        return (
                          <G key={`wt-${i}`}>
                            <Line x1={x} y1={groundY} x2={x - 1.5} y2={groundY - 4 - (i % 3) * 2}
                              stroke="#66BB6A" strokeWidth={1.2} opacity={0.3} strokeLinecap="round" />
                            <Line x1={x + 2} y1={groundY} x2={x + 1} y2={groundY - 3 - (i % 4) * 1.5}
                              stroke="#4CAF50" strokeWidth={1} opacity={0.25} strokeLinecap="round" />
                          </G>
                        );
                      })}

                      {/* Fleurs */}
                      {[80, 250, 500, 750, 1000, 1250, 1500, 1750, 1950].map((fx, i) => {
                        const y = groundY + 8 + (i % 3) * 5;
                        const colors = ['#FF6B8A', '#FFD93D', '#E1BEE7', '#FF8A65', '#81D4FA', '#F48FB1', '#FFCC80', '#CE93D8', '#A5D6A7'];
                        return (
                          <G key={`wf-${i}`}>
                            <Line x1={fx} y1={y} x2={fx} y2={y - 5} stroke="#66BB6A" strokeWidth={0.8} opacity={0.4} />
                            <Circle cx={fx} cy={y - 6} r={2} fill={colors[i]} opacity={0.5} />
                            <Circle cx={fx} cy={y - 6} r={0.8} fill="#FFD54F" opacity={0.6} />
                          </G>
                        );
                      })}

                      {/* CHEMIN DE TERRE */}
                      <Path d={`M0 ${pathY + 5} Q500 ${pathY - 2} 1000 ${pathY + 3} Q1500 ${pathY - 1} ${scW} ${pathY + 5}`}
                        fill="none" stroke="url(#wPathGrad)" strokeWidth={18} strokeLinecap="round" />
                      <Path d={`M0 ${pathY + 12} Q500 ${pathY + 5} 1000 ${pathY + 10} Q1500 ${pathY + 6} ${scW} ${pathY + 12}`}
                        fill="none" stroke="#A5D6A7" strokeWidth={1} opacity={0.3} />

                      {/* NID DE POUSSIN (remplace la maison) */}
                      {(() => {
                        const nestX = walkCanvasW * 0.4 - 20;
                        const nestBaseY = pathY + 5;
                        return (
                          <G>
                            {/* Nid — base (demi-ellipse brune) */}
                            <Ellipse cx={nestX} cy={nestBaseY} rx={18} ry={10} fill="#6B4226" />
                            {/* Brindilles gauche */}
                            <Line x1={nestX - 16} y1={nestBaseY - 2} x2={nestX - 21} y2={nestBaseY - 7} stroke="#8B5A2B" strokeWidth={1.5} />
                            <Line x1={nestX - 13} y1={nestBaseY - 3} x2={nestX - 19} y2={nestBaseY - 9} stroke="#8B5A2B" strokeWidth={1.5} />
                            {/* Brindilles droite */}
                            <Line x1={nestX + 16} y1={nestBaseY - 2} x2={nestX + 21} y2={nestBaseY - 7} stroke="#8B5A2B" strokeWidth={1.5} />
                            <Line x1={nestX + 13} y1={nestBaseY - 3} x2={nestX + 19} y2={nestBaseY - 9} stroke="#8B5A2B" strokeWidth={1.5} />
                            {/* Intérieur du nid */}
                            <Ellipse cx={nestX} cy={nestBaseY - 2} rx={13} ry={6} fill="#8B6914" />
                            {/* 3 oeufs */}
                            <Ellipse cx={nestX - 5} cy={nestBaseY - 5} rx={3.5} ry={4.5} fill="#FFF8E7" />
                            <Ellipse cx={nestX + 4} cy={nestBaseY - 5} rx={3.5} ry={4.5} fill="#FFF8E7" />
                            <Ellipse cx={nestX} cy={nestBaseY - 6} rx={3} ry={4} fill="#FFF8E7" />
                            {/* Taches sur les oeufs */}
                            <Circle cx={nestX - 5} cy={nestBaseY - 6} r={1} fill="#D4C4A0" />
                            <Circle cx={nestX + 3} cy={nestBaseY - 4} r={0.8} fill="#D4C4A0" />
                          </G>
                        );
                      })()}

                      {/* ARBRE — x=440 */}
                      <G transform={`translate(440, ${pathY - 20}) scale(2)`}>
                        <Rect x={-2.5} y={8} width={5} height={16} fill="#795548" opacity={0.8} />
                        <Line x1={-1.5} y1={10} x2={-1.5} y2={22} stroke="#5D4037" strokeWidth={0.5} opacity={0.4} />
                        <Line x1={1.5} y1={9} x2={1.5} y2={23} stroke="#8D6E63" strokeWidth={0.5} opacity={0.3} />
                        <Circle cx={0} cy={0} r={12} fill="#43A047" opacity={0.85} />
                        <Circle cx={-7} cy={4} r={8} fill="#388E3C" opacity={0.75} />
                        <Circle cx={7} cy={4} r={8} fill="#388E3C" opacity={0.75} />
                        <Circle cx={0} cy={-5} r={7} fill="#66BB6A" opacity={0.5} />
                        <Circle cx={-4} cy={-2} r={3} fill="#81C784" opacity={0.3} />
                        {passed(440) && (
                          <G>
                            <Circle cx={8} cy={22} r={3.5} fill="#F44336" opacity={0.85} />
                            <Ellipse cx={9.5} cy={21} rx={1} ry={0.5} fill="white" opacity={0.3} />
                            <Line x1={8} y1={18.5} x2={8.5} y2={17} stroke="#795548" strokeWidth={1} />
                            <Ellipse cx={10} cy={16.5} rx={2.5} ry={1.2} fill="#66BB6A" opacity={0.6} transform="rotate(-30, 10, 16.5)" />
                          </G>
                        )}
                      </G>

                      {/* BANC — x=840 */}
                      <G transform={`translate(840, ${pathY - 4}) scale(1.8)`}>
                        <Rect x={-12} y={-2} width={24} height={3} rx={1.5} fill="#D7CCC8" opacity={0.9} />
                        <Rect x={-12} y={1.5} width={24} height={3} rx={1.5} fill="#BCAAA4" opacity={0.8} />
                        <Rect x={-11} y={-9} width={22} height={2.5} rx={1} fill="#D7CCC8" opacity={0.8} />
                        <Rect x={-11} y={-6} width={22} height={2.5} rx={1} fill="#BCAAA4" opacity={0.7} />
                        <Path d="M-9 4.5 L-10.5 12 L-8 12 L-6.5 4.5" fill="#616161" opacity={0.8} />
                        <Path d="M9 4.5 L7.5 12 L10 12 L11.5 4.5" fill="#616161" opacity={0.8} />
                        <Rect x={-10} y={-9} width={2.5} height={13} rx={0.5} fill="#616161" opacity={0.7} />
                        <Rect x={9.5} y={-9} width={2.5} height={13} rx={0.5} fill="#616161" opacity={0.7} />
                        <Rect x={-14} y={-4} width={5} height={2.5} rx={1} fill="#616161" opacity={0.6} />
                        <Rect x={11} y={-4} width={5} height={2.5} rx={1} fill="#616161" opacity={0.6} />
                      </G>

                      {/* COLOMBES BLANCHES — s'envolent vers le soleil quand passé */}
                      <G transform={`translate(1300, ${pathY - (walkProg > 0.65 ? 45 : 5)})`}>
                        {/* Colombe 1 — grande */}
                        <G transform={`translate(0, ${walkProg > 0.65 ? -10 : 0}) scale(1.8)`}>
                          <Ellipse cx={0} cy={0} rx={5} ry={2.5} fill="white" opacity={0.9} />
                          <Circle cx={-4} cy={-1} r={2.5} fill="white" opacity={0.9} />
                          <Path d="M-6.5 -1 L-8 0 L-6.5 0.5" fill="#FFB300" opacity={0.8} />
                          <Circle cx={-5.5} cy={-1.5} r={0.5} fill="#333" />
                          <Path d="M-1 -2 Q0 -9 8 -5 Q4 -1 0 0" fill="white" opacity={0.7} />
                          <Path d="M-1 2 Q0 8 7 5 Q3 2 0 1" fill="white" opacity={0.5} />
                        </G>
                        {/* Colombe 2 — moyenne */}
                        <G transform={`translate(18, ${walkProg > 0.65 ? -20 : -5}) scale(1.2)`}>
                          <Ellipse cx={0} cy={0} rx={5} ry={2.5} fill="white" opacity={0.8} />
                          <Circle cx={-4} cy={-1} r={2.5} fill="white" opacity={0.8} />
                          <Path d="M-6.5 -1 L-8 0 L-6.5 0.5" fill="#FFB300" opacity={0.7} />
                          <Circle cx={-5.5} cy={-1.5} r={0.4} fill="#333" />
                          <Path d="M-1 -2 Q0 -8 7 -4 Q3 -1 0 0" fill="white" opacity={0.6} />
                        </G>
                        {/* Colombe 3 — petite, plus haute */}
                        <G transform={`translate(-12, ${walkProg > 0.65 ? -30 : -8}) scale(0.9)`}>
                          <Ellipse cx={0} cy={0} rx={5} ry={2.5} fill="white" opacity={0.7} />
                          <Circle cx={-4} cy={-1} r={2.5} fill="white" opacity={0.7} />
                          <Path d="M-1 -2 Q0 -7 6 -3 Q3 -1 0 0" fill="white" opacity={0.5} />
                        </G>
                      </G>

                      {/* ÉTANG + CANARD — x=1850 */}
                      <G transform={`translate(1850, ${pathY - 5}) scale(1.8)`}>
                        <Ellipse cx={0} cy={6} rx={22} ry={14} fill="#4FC3F7" opacity={0.2} />
                        <Ellipse cx={0} cy={6} rx={18} ry={10} fill="#29B6F6" opacity={0.15} />
                        <Path d="M-14 5 Q-7 2 0 5 Q7 8 14 5" fill="none" stroke="#4FC3F7" strokeWidth={1} opacity={0.3} />
                        {walkProg > 0.88 && (
                          <>
                            <Circle cx={-3} cy={-6} r={1.5} fill="#4FC3F7" opacity={0.6} />
                            <Circle cx={4} cy={-8} r={1} fill="#4FC3F7" opacity={0.5} />
                            <Circle cx={-6} cy={-4} r={1} fill="#4FC3F7" opacity={0.4} />
                            <Circle cx={7} cy={-5} r={0.8} fill="#4FC3F7" opacity={0.4} />
                            <Path d="M-15 6 Q-8 3 0 6 Q8 9 15 6" fill="none" stroke="#4FC3F7" strokeWidth={1} opacity={0.4} />
                            <Ellipse cx={0} cy={5} rx={20} ry={12} fill="#4FC3F7" opacity={0.08} />
                          </>
                        )}
                        <Ellipse cx={-12} cy={9} rx={4} ry={2} fill="#66BB6A" opacity={0.5} />
                        <Circle cx={-12} cy={8} r={1.5} fill="#F48FB1" opacity={0.5} />
                        <Ellipse cx={10} cy={12} rx={3} ry={1.5} fill="#66BB6A" opacity={0.4} />
                        <Circle cx={10} cy={11} r={1} fill="#CE93D8" opacity={0.4} />
                        <Ellipse cx={0} cy={1} rx={7} ry={4} fill="#FFB300" opacity={0.9} />
                        <Circle cx={-6} cy={-3} r={4} fill="#2E7D32" opacity={0.9} />
                        <Circle cx={-7.5} cy={-3.5} r={1.3} fill="white" />
                        <Circle cx={-7.8} cy={-3.5} r={0.6} fill="#0D1117" />
                        <Path d="M-10 -3 L-13 -2 L-10 -1" fill="#FF6F00" opacity={0.95} />
                        <Path d="M7 -1 L10 -5 L8 1" fill="#FFB300" opacity={0.8} />
                        <Line x1={16} y1={-8} x2={16} y2={8} stroke="#8D6E63" strokeWidth={1.2} opacity={0.4} />
                        <Ellipse cx={16} cy={-9} rx={2} ry={3} fill="#8D6E63" opacity={0.3} />
                        <Line x1={18} y1={-5} x2={18} y2={8} stroke="#8D6E63" strokeWidth={1} opacity={0.3} />
                        <Ellipse cx={18} cy={-6} rx={1.5} ry={2.5} fill="#8D6E63" opacity={0.25} />
                      </G>


                    </>
                  );
                })()}
              </Svg>

              {/* Poussin qui marche (GIF tourne en permanence) */}
              <Image
                source={require('./assets/walk-creature.gif')}
                style={{
                  position: 'absolute',
                  width: 45,
                  height: 45,
                  left: '40%',
                  bottom: 5,
                }}
                resizeMode="contain"
              />

              {/* Brouillard gauche */}
              <LinearGradient
                colors={['#252A30', 'rgba(37,42,48,0)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30 }}
              />
              {/* Brouillard droite */}
              <LinearGradient
                colors={['rgba(37,42,48,0)', '#252A30']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30 }}
              />
            </View>

            {/* Compact single-line controls */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: wp(6),
              paddingVertical: wp(4),
              marginTop: wp(4),
            }}>
              <TouchableOpacity
                onPress={() => setWalkRoundTrip(!walkRoundTrip)}
                style={{
                  backgroundColor: walkRoundTrip ? 'rgba(0,217,132,0.1)' : 'transparent',
                  borderRadius: wp(6),
                  borderWidth: 0.5,
                  borderColor: walkRoundTrip ? 'rgba(0,217,132,0.3)' : 'rgba(74,79,85,0.4)',
                  paddingHorizontal: wp(6),
                  paddingVertical: wp(3),
                }}
              >
                <Text style={{ fontSize: fp(7), color: walkRoundTrip ? '#00D984' : '#6B7280' }}>
                  {walkRoundTrip ? '↔ ' + T[userLang].roundTripX2 : '↔ ' + T[userLang].roundTrip}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(8) }}>
                <Pressable
                  onPressIn={function() { startWalkMoving(-1); }}
                  onPressOut={stopWalkMoving}
                  style={function(state) {
                    return {
                      width: wp(44), height: wp(44), borderRadius: wp(22),
                      backgroundColor: state.pressed ? '#2A303B' : '#1A1D22',
                      borderWidth: 1.5,
                      borderColor: state.pressed ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.12)',
                      alignItems: 'center', justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
                    };
                  }}
                >
                  <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24">
                    <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: fp(7), color: '#555E6C', fontWeight: '600' }}>
                    {T[userLang].hold}
                  </Text>
                </View>
                <Pressable
                  onPressIn={function() { startWalkMoving(1); }}
                  onPressOut={stopWalkMoving}
                  style={function(state) {
                    return {
                      width: wp(44), height: wp(44), borderRadius: wp(22),
                      backgroundColor: state.pressed ? '#2A303B' : '#1A1D22',
                      borderWidth: 1.5,
                      borderColor: state.pressed ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.12)',
                      alignItems: 'center', justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
                    };
                  }}
                >
                  <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24">
                    <Path d="M9 5l7 7-7 7" stroke="#00D984" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
              </View>

              <View style={{ alignItems: 'flex-end', minWidth: wp(50), maxWidth: wp(60) }}>
                <Text style={{ fontSize: fp(14), fontWeight: '800', color: '#00D984' }} numberOfLines={1}>
                  {walkDurStr}
                </Text>
                <Text style={{ fontSize: fp(7), color: '#6B7280' }}>{T[userLang].normalSpeed}</Text>
              </View>
            </View>

            {/* Boutons CONFIRMER + LIVE */}
            <View style={{ flexDirection: 'row', gap: wp(8), marginTop: wp(6) }}>
              {walkScrollOffset > 0 && (
                <Pressable
                  onPress={async () => {
                    if (walkCal === 0) return;
                    const success = await saveActivity('marche',
                      Math.round(walkDurMin * walkMul),
                      walkCal,
                      'modere',
                      walkWater
                    );
                    if (success) {
                      setWalkSaved(true);
                      setLastActivity({
                        type: 'walk',
                        name: T[userLang].walk,
                        distance: walkDistStr,
                        duration: Math.round(walkDurMin * walkMul),
                        kcal: walkCal,
                        water: walkWater,
                        speed: null,
                      });
                      setShowPostReport(true);
                      fetchWeeklyMinutes();
                      setTimeout(() => {
                        setWalkSaved(false);
                        setWalkScrollOffset(0);
                      }, 1500);
                    }
                  }}
                  disabled={walkSaved}
                  style={({ pressed }) => ({
                    flex: 2,
                    paddingVertical: wp(9),
                    borderRadius: wp(10),
                    backgroundColor: walkSaved ? '#00D984' : pressed ? '#00B572' : '#00D984',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <Text style={{ color: '#1A1D22', fontSize: fp(11), fontWeight: '700' }}>
                    {walkSaved ? String.fromCodePoint(0x2713) + ' ' + T[userLang].added : String.fromCodePoint(0x2713) + ' ' + T[userLang].validate + ' — ' + walkCal + ' kcal'}
                  </Text>
                </Pressable>
              )}

              <TouchableOpacity
                onPress={() => setShowLivePlaceholder(true)}
                style={{
                  flex: walkScrollOffset > 0 ? 1 : 1,
                  backgroundColor: 'rgba(255,107,107,0.12)',
                  borderRadius: wp(10),
                  borderWidth: 1.5,
                  borderColor: 'rgba(255,107,107,0.4)',
                  paddingVertical: wp(9),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: wp(4),
                }}
              >
                <View style={{
                  width: wp(7), height: wp(7), borderRadius: wp(4),
                  backgroundColor: '#FF6B6B',
                }} />
                <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FF6B6B' }}>
                  {T[userLang].live}
                </Text>
              </TouchableOpacity>
            </View>
          </MetalCard>

          {/* COURSE — SAVANE AFRICAINE + JAGUAR */}
          <SectionTitle title={T[userLang].run} style={{ marginTop: wp(12) }} />
          <MetalCard style={{
            marginBottom: wp(2),
            borderRadius: wp(14),
            borderWidth: 0.5,
            borderColor: runGlow ? 'rgba(255,140,66,0.5)' : 'rgba(74,79,85,0.3)',
            backgroundColor: 'rgba(37,42,48,0.7)',
            shadowColor: runGlow ? '#FF8C42' : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: runGlow ? 0.3 : 0,
            shadowRadius: runGlow ? 12 : 0,
            elevation: runGlow ? 8 : 0,
          }}>
            {/* Stats compact — aligned right */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              paddingHorizontal: wp(10),
              paddingVertical: wp(6),
              gap: wp(10),
            }}>
              <Text style={{ fontSize: fp(10), color: '#FF6B6B', fontWeight: '600' }}>📍{runDistStr}</Text>
              <Text style={{ fontSize: fp(10), color: '#FF8C42', fontWeight: '600' }}>🔥{runCalories}kcal</Text>
              <Text style={{ fontSize: fp(10), color: '#4DA6FF', fontWeight: '600' }}>💧{runWater}ml</Text>
            </View>

            {/* Canvas SVG — Savane Africaine + Lottie Jaguar overlay */}
            <View
              style={{ position: 'relative', height: RUN_CANVAS_H, borderRadius: wp(10), overflow: 'hidden', backgroundColor: '#D4632A', borderWidth: 1, borderColor: 'rgba(232,148,74,0.3)' }}
              onLayout={(e) => setRunCanvasW(e.nativeEvent.layout.width)}
            >
              {/* SVG Savanna background (decor only — no jaguar) */}
              <Svg width={runCanvasW} height={RUN_CANVAS_H} viewBox={`0 0 ${runCanvasW} ${RUN_CANVAS_H}`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                {(() => {
                  const cW = runCanvasW;
                  const cH = RUN_CANVAS_H;
                  const groundY = cH * 0.45;
                  const FOOTPRINT_START_X = cW * 0.4;
                  const sOff = runScrollOffset;
                  const trailY = groundY + cH * 0.15;
                  const trailH = cH * 0.2;

                  // Savanna trees (scroll with parallax 0.3x)
                  const trees = [
                    { x: 100, type: 'acacia' }, { x: 400, type: 'baobab' },
                    { x: 750, type: 'acacia' }, { x: 1100, type: 'baobab' },
                    { x: 1500, type: 'acacia' }, { x: 2000, type: 'baobab' },
                    { x: 2600, type: 'acacia' }, { x: 3200, type: 'baobab' },
                    { x: 3800, type: 'acacia' }, { x: 4500, type: 'baobab' },
                    { x: 5200, type: 'acacia' }, { x: 6000, type: 'baobab' },
                    { x: 6800, type: 'acacia' }, { x: 7500, type: 'baobab' },
                    { x: 8200, type: 'acacia' },
                  ];

                  // Grass tufts
                  const grassTufts = Array.from({ length: 60 }, (_, i) => ({
                    x: i * 140 + (Math.sin(i * 7) * 30),
                    height: 3 + (i % 4) * 2,
                  }));

                  // Distance markers
                  const markers = [
                    { distance: 0, label: 'DÉPART' },
                    { distance: 1000, label: '1 km' },
                    { distance: 2000, label: '2 km' },
                    { distance: 5000, label: '5 km' },
                    { distance: 10000, label: '10 km' },
                    { distance: 21000, label: '21 km' },
                    { distance: 42000, label: '42 km' },
                  ];

                  // Birds (quasi-fixed)
                  const birds = [
                    { x: cW * 0.55, y: 12 }, { x: cW * 0.65, y: 18 },
                    { x: cW * 0.45, y: 22 }, { x: cW * 0.75, y: 8 },
                  ];

                  // Sun position (parallax 0.05x)
                  const sunX = cW * 0.8 - sOff * 0.05;
                  const sunY = cH * 0.38;

                  return (
                    <>
                      {/* CIEL COUCHER DE SOLEIL */}
                      <Rect x={0} y={0} width={cW} height={groundY} fill="#D4632A" />
                      <Rect x={0} y={cH * 0.3} width={cW} height={cH * 0.15} fill="#E8944A" opacity={0.7} />

                      {/* SOLEIL */}
                      <Circle cx={sunX} cy={sunY} r={35} fill="#FADE6A" opacity={0.15} />
                      <Circle cx={sunX} cy={sunY} r={22} fill="#F5C040" opacity={0.9} />
                      <Circle cx={sunX} cy={sunY} r={14} fill="#FADE6A" opacity={0.6} />

                      {/* OISEAUX */}
                      {birds.map((bird, i) => {
                        const bx = bird.x - sOff * 0.1;
                        return (
                          <Path key={`bird-${i}`}
                            d={`M${bx - 5} ${bird.y + 2} Q${bx - 2} ${bird.y - 2} ${bx} ${bird.y} Q${bx + 2} ${bird.y - 2} ${bx + 5} ${bird.y + 2}`}
                            fill="none" stroke="#1A0F05" strokeWidth={1} opacity={0.6} />
                        );
                      })}

                      {/* SILHOUETTES D'ARBRES (parallaxe 0.3x) */}
                      {trees.map((tree, i) => {
                        const tx = tree.x - sOff * 0.3;
                        if (tx < -40 || tx > cW + 40) return null;
                        const baseY = groundY;
                        if (tree.type === 'acacia') {
                          return (
                            <G key={`tree-${i}`}>
                              <Rect x={tx - 1} y={baseY - 30} width={3} height={30} fill="#1A0F05" opacity={0.8} />
                              <Ellipse cx={tx} cy={baseY - 32} rx={22} ry={8} fill="#1A0F05" opacity={0.8} />
                            </G>
                          );
                        } else {
                          return (
                            <G key={`tree-${i}`}>
                              <Path d={`M${tx - 5} ${baseY} L${tx - 3} ${baseY - 25} L${tx + 3} ${baseY - 25} L${tx + 5} ${baseY} Z`} fill="#1A0F05" opacity={0.8} />
                              <Ellipse cx={tx} cy={baseY - 28} rx={15} ry={10} fill="#1A0F05" opacity={0.8} />
                            </G>
                          );
                        }
                      })}

                      {/* SOL DE SAVANE */}
                      <Rect x={0} y={groundY} width={cW} height={cH * 0.55} fill="#5A3E1B" />

                      {/* Herbes sèches */}
                      {grassTufts.map((g, i) => {
                        const gx = g.x - sOff;
                        if (gx < -10 || gx > cW + 10) return null;
                        return (
                          <Path key={`grass-${i}`}
                            d={`M${gx - 3} ${groundY} L${gx} ${groundY - 8 - g.height} L${gx + 3} ${groundY} Z`}
                            fill="#7A6030" opacity={0.4 + (i % 3) * 0.1} />
                        );
                      })}

                      {/* Piste de terre battue */}
                      <Rect x={0} y={trailY} width={cW} height={trailH} fill="#4A3418" />

                      {/* MARQUEURS — poteaux en bois */}
                      {markers.map((marker, i) => {
                        const mx = FOOTPRINT_START_X + (marker.distance * RUN_PIXELS_PER_METER) - sOff;
                        if (mx < -20 || mx > cW + 20) return null;
                        return (
                          <G key={`mk-${i}`}>
                            <Rect x={mx - 1} y={groundY} width={3} height={cH * 0.25} fill="#3A2510" />
                            <Rect x={mx - 14} y={groundY + 2} width={28} height={12} fill="#5A3E1B" stroke="#3A2510" strokeWidth={0.5} />
                            <SvgText x={mx} y={groundY + 11} fill="#E8944A" fontSize={8} fontWeight="bold" textAnchor="middle">
                              {marker.label}
                            </SvgText>
                          </G>
                        );
                      })}

                      {/* MILESTONE EFFECTS */}
                      {runMilestone === 500 && (
                        <Rect x={0} y={0} width={cW} height={cH} fill="white" opacity={0.15} />
                      )}
                      {runMilestone === 2000 && (
                        <SvgText x={cW / 2} y={cH / 2} fill="#F5C040" opacity={0.9} fontSize={16} fontWeight="bold" textAnchor="middle">
                          2 KM
                        </SvgText>
                      )}
                      {runMilestone === 21000 && (
                        <>
                          <Rect x={0} y={0} width={cW} height={cH} fill="#FFD700" opacity={0.06} />
                          <SvgText x={cW / 2} y={cH / 2} fill="#FFD700" opacity={0.9} fontSize={14} fontWeight="bold" textAnchor="middle">
                            SEMI-MARATHON
                          </SvgText>
                        </>
                      )}
                    </>
                  );
                })()}
              </Svg>

              {/* Cheval GIF — toujours visible */}
              <Image
                source={require('./assets/horse-run.gif')}
                style={{
                  position: 'absolute',
                  width: 70,
                  height: 45,
                  left: '30%',
                  bottom: 8,
                  transform: [{ scaleX: -1 }],
                }}
                resizeMode="contain"
              />

              {/* Poussière — visible seulement pendant la course */}
              {isRunning && (
                <View style={{
                  position: 'absolute',
                  left: '18%',
                  bottom: 10,
                  flexDirection: 'row',
                }}>
                  {[0.35, 0.25, 0.15, 0.08].map((op, i) => (
                    <View key={i} style={{
                      width: 4 + i * 3,
                      height: 4 + i * 3,
                      borderRadius: 10,
                      backgroundColor: `rgba(140, 110, 60, ${op})`,
                      marginRight: 2,
                    }} />
                  ))}
                </View>
              )}

              {/* Brouillard gauche */}
              <LinearGradient
                colors={['#5A3E1B', 'rgba(90,62,27,0)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30 }}
              />
              {/* Brouillard droite */}
              <LinearGradient
                colors={['rgba(90,62,27,0)', '#5A3E1B']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30 }}
              />
            </View>

            {/* Compact single-line controls */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: wp(6),
              paddingVertical: wp(4),
              marginTop: wp(4),
            }}>
              <TouchableOpacity
                onPress={() => setRunRoundTrip(!runRoundTrip)}
                style={{
                  backgroundColor: runRoundTrip ? 'rgba(0,217,132,0.1)' : 'transparent',
                  borderRadius: wp(6),
                  borderWidth: 0.5,
                  borderColor: runRoundTrip ? 'rgba(0,217,132,0.3)' : 'rgba(74,79,85,0.4)',
                  paddingHorizontal: wp(6),
                  paddingVertical: wp(3),
                }}
              >
                <Text style={{ fontSize: fp(7), color: runRoundTrip ? '#00D984' : '#6B7280' }}>
                  {runRoundTrip ? '↔ ' + T[userLang].roundTripX2 : '↔ ' + T[userLang].roundTrip}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(8) }}>
                <Pressable
                  onPressIn={function() { startRunMoving(-1); }}
                  onPressOut={stopRunMoving}
                  style={function(state) {
                    return {
                      width: wp(44), height: wp(44), borderRadius: wp(22),
                      backgroundColor: state.pressed ? '#2A303B' : '#1A1D22',
                      borderWidth: 1.5,
                      borderColor: state.pressed ? 'rgba(255,140,66,0.4)' : 'rgba(255,255,255,0.12)',
                      alignItems: 'center', justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
                    };
                  }}
                >
                  <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24">
                    <Path d="M15 19l-7-7 7-7" stroke="#FF8C42" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: fp(7), color: '#555E6C', fontWeight: '600' }}>
                    {T[userLang].hold}
                  </Text>
                </View>
                <Pressable
                  onPressIn={function() { startRunMoving(1); }}
                  onPressOut={stopRunMoving}
                  style={function(state) {
                    return {
                      width: wp(44), height: wp(44), borderRadius: wp(22),
                      backgroundColor: state.pressed ? '#2A303B' : '#1A1D22',
                      borderWidth: 1.5,
                      borderColor: state.pressed ? 'rgba(255,140,66,0.4)' : 'rgba(255,255,255,0.12)',
                      alignItems: 'center', justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5, shadowRadius: 4, elevation: 5,
                    };
                  }}
                >
                  <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24">
                    <Path d="M9 5l7 7-7 7" stroke="#FF8C42" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
              </View>

              <View style={{ alignItems: 'flex-end', minWidth: wp(50), maxWidth: wp(60) }}>
                <Text style={{ fontSize: fp(14), fontWeight: '800', color: '#00D984' }} numberOfLines={1}>
                  {runDurStr}
                </Text>
                <Text style={{ fontSize: fp(7), color: '#6B7280' }}>{T[userLang].normalPace}</Text>
              </View>
            </View>

            {/* Boutons CONFIRMER + LIVE */}
            <View style={{ flexDirection: 'row', gap: wp(8), marginTop: wp(6) }}>
              {runScrollOffset > 0 && (
                <Pressable
                  onPress={handleAddRun}
                  disabled={runSaved}
                  style={({ pressed }) => ({
                    flex: 2,
                    paddingVertical: wp(9),
                    borderRadius: wp(10),
                    backgroundColor: runSaved ? '#00D984' : pressed ? '#00B572' : '#00D984',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <Text style={{ color: '#1A1D22', fontSize: fp(11), fontWeight: '700' }}>
                    {runSaved ? String.fromCodePoint(0x2713) + ' ' + T[userLang].added : String.fromCodePoint(0x2713) + ' ' + T[userLang].validate + ' — ' + runCalories + ' kcal'}
                  </Text>
                </Pressable>
              )}

              <TouchableOpacity
                onPress={() => setShowLivePlaceholder(true)}
                style={{
                  flex: runScrollOffset > 0 ? 1 : 1,
                  backgroundColor: 'rgba(255,107,107,0.12)',
                  borderRadius: wp(10),
                  borderWidth: 1.5,
                  borderColor: 'rgba(255,107,107,0.4)',
                  paddingVertical: wp(9),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: wp(4),
                }}
              >
                <View style={{
                  width: wp(7), height: wp(7), borderRadius: wp(4),
                  backgroundColor: '#FF6B6B',
                }} />
                <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FF6B6B' }}>
                  {T[userLang].live}
                </Text>
              </TouchableOpacity>
            </View>
          </MetalCard>

          {/* OTHER SPORTS — Horizontal scroll */}
          <SectionTitle title={T[userLang].otherActivities} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: wp(14), gap: wp(8) }}>
            {OTHER_SPORTS.map(function(key) {
              return (
                <View key={key} style={{ width: wp(100) }}>
                  <SportCard
                    sportKey={key}
                    onPress={function() { setModalSport(key); setModalVisible(true); }}
                    userLang={userLang}
                    userWeight={userWeight}
                  />
                </View>
              );
            })}
          </ScrollView>

          {/* TODAY'S HISTORY */}
          <View style={{ marginTop: wp(12) }}>
            <SectionTitle title={T[userLang].todayHistory} />
          </View>

          {todayActivities.length === 0 ? (
            <MetalCard>
              <View style={{ alignItems: 'center', paddingVertical: wp(10) }}>
                <Text style={{ color: '#555E6C', fontSize: fp(11), fontWeight: '600', textAlign: 'center' }}>
                  {T[userLang].noActivity}
                </Text>
              </View>
            </MetalCard>
          ) : (
            todayActivities.map((act) => {
              const sportData = ACTIVITY_DATA[act.type] || {};
              const iconText = sportData.icon || String.fromCodePoint(0x1F3C5);
              const sportColor = sportData.color || '#00D984';
              const createdTime = act.created_at
                ? new Date(act.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <MetalCard key={act.id} style={{ borderLeftWidth: wp(3), borderLeftColor: '#00D984' }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: fp(18), marginRight: wp(8) }}>{iconText}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>
                          {act.name}
                        </Text>
                        <View style={{ flexDirection: 'row', marginTop: wp(2), gap: wp(8) }}>
                          <Text style={{ color: '#8892A0', fontSize: fp(9) }}>
                            {formatDuration(act.duration_minutes)}
                          </Text>
                          <Text style={{ color: '#FF8C42', fontSize: fp(9), fontWeight: '700' }}>
                            {act.calories_burned} kcal
                          </Text>
                          {act.water_lost_ml > 0 && (
                            <Text style={{ color: '#4DA6FF', fontSize: fp(9) }}>
                              {String.fromCodePoint(0x1F4A7)} {act.water_lost_ml} ml
                            </Text>
                          )}
                          <Text style={{ color: '#555E6C', fontSize: fp(9) }}>
                            {createdTime}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleDeleteActivity(act)}
                      style={{
                        width: wp(24), height: wp(24), borderRadius: wp(12),
                        backgroundColor: 'rgba(255,107,107,0.1)',
                        justifyContent: 'center', alignItems: 'center',
                        marginLeft: wp(8),
                      }}
                    >
                      <Ionicons name="close" size={wp(14)} color="#FF6B6B" />
                    </Pressable>
                  </View>
                </MetalCard>
              );
            })
          )}

          {/* ══════ RECOMMANDATION DU JOUR ══════ */}
          {recommendation && (
            <View style={{ paddingHorizontal: wp(16), marginTop: wp(12) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                <View style={{
                  width: wp(3), height: wp(16),
                  backgroundColor: recommendation.color,
                  borderRadius: wp(2),
                  marginRight: wp(8),
                }} />
                <Text style={{
                  fontSize: fp(16), fontWeight: '900', color: '#FFFFFF', letterSpacing: 1,
                }}>
                  {T[userLang].recommendation}
                </Text>
              </View>

              <View style={{
                borderRadius: wp(14),
                borderWidth: 1,
                borderColor: recommendation.type === 'maintain'
                  ? 'rgba(0,217,132,0.2)'
                  : 'rgba(255,140,66,0.2)',
                backgroundColor: recommendation.type === 'maintain'
                  ? 'rgba(0,217,132,0.06)'
                  : 'rgba(255,140,66,0.06)',
                padding: wp(14),
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                  <Text style={{ fontSize: fp(22), marginRight: wp(8) }}>{recommendation.emoji}</Text>
                  <Text style={{
                    fontSize: fp(14), fontWeight: '700',
                    color: recommendation.color, flex: 1,
                  }}>
                    {recommendation.title}
                  </Text>
                </View>

                <Text style={{
                  fontSize: fp(11), color: '#D1D5DB', lineHeight: fp(16),
                  marginBottom: wp(8),
                }}>
                  {recommendation.subtitle}
                </Text>

                {recommendation.type === 'burn' && (
                  <View style={{
                    flexDirection: 'row', justifyContent: 'space-around',
                    backgroundColor: '#252A30', borderRadius: wp(10),
                    padding: wp(10),
                  }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{T[userLang].activityLabel}</Text>
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFFFFF' }}>
                        {recommendation.activity}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{T[userLang].durationSmall}</Text>
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FF8C42' }}>
                        {recommendation.duration}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{T[userLang].distanceSmall}</Text>
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#4DA6FF' }}>
                        {recommendation.distance}
                      </Text>
                    </View>
                  </View>
                )}

                {recommendation.moodNote && (
                  <Text style={{
                    fontSize: fp(9), color: '#D4AF37', fontStyle: 'italic',
                    marginTop: wp(8), textAlign: 'center',
                  }}>
                    🧠 {recommendation.moodNote}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={function() {
                    if (recommendation.activity === T[userLang].walk || recommendation.activity === 'Les deux' || recommendation.activity === 'Marche') {
                      var targetDist = parseFloat(recommendation.distance) * 1000;
                      var targetOffset = (targetDist / WALK_MAX_DIST) * (WALK_SCENE_W - walkCanvasW);
                      setWalkScrollOffset(Math.min(targetOffset, WALK_SCENE_W - walkCanvasW));
                    }
                  }}
                  style={{
                    marginTop: wp(10), paddingVertical: wp(10),
                    borderRadius: wp(10), backgroundColor: recommendation.color,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#000', fontSize: fp(11), fontWeight: '700' }}>
                    {T[userLang].startNow}
                  </Text>
                </TouchableOpacity>

                <Text style={{
                  fontSize: fp(7), color: '#4A4F55', textAlign: 'center',
                  marginTop: wp(8),
                }}>
                  Calcul basé sur les valeurs MET (Ainsworth et al., 2011)
                </Text>
              </View>
            </View>
          )}

          {/* REWARD BADGE */}
          {lixRewardedToday ? (
            <View style={{
              alignSelf: 'center',
              backgroundColor: 'rgba(0,217,132,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(0,217,132,0.2)',
              borderRadius: wp(10),
              paddingVertical: wp(8),
              paddingHorizontal: wp(16),
              marginVertical: wp(12),
              flexDirection: 'row',
              alignItems: 'center',
              gap: wp(6),
            }}>
              <Text style={{ fontSize: fp(11), color: '#00D984', fontWeight: '600' }}>
                {String.fromCodePoint(0x2705)} {T[userLang].bonusObtained}
              </Text>
            </View>
          ) : (
            <View style={{
              alignSelf: 'center',
              backgroundColor: 'rgba(212,175,55,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(212,175,55,0.2)',
              borderRadius: wp(10),
              paddingVertical: wp(8),
              paddingHorizontal: wp(16),
              marginVertical: wp(12),
              flexDirection: 'row',
              alignItems: 'center',
              gap: wp(6),
            }}>
              <Text style={{ fontSize: fp(14) }}>{String.fromCodePoint(0x1F3C6)}</Text>
              <Text style={{ fontSize: fp(11), fontWeight: '600', color: '#D4AF37' }}>
                {T[userLang].bonusFirst}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Tab Bar — FIX 1 */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <BottomTabs activeTab={activeTab} onTabPress={handleTabPress} />
      </View>


      {/* Sport Modal */}
      <SportModal
        visible={modalVisible}
        sportKey={modalSport}
        onClose={function() { setModalVisible(false); }}
        onSave={handleSportSave}
        userLang={userLang}
        userWeight={userWeight}
      />

      {/* Live GPS Placeholder Modal */}
      <Modal
        visible={showLivePlaceholder}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLivePlaceholder(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'center', paddingHorizontal: wp(20),
        }}>
          <View style={{
            backgroundColor: '#1A1D22', borderRadius: wp(18),
            borderWidth: 1, borderColor: '#4A4F55', padding: wp(24),
            alignItems: 'center',
          }}>
            {/* Icône GPS */}
            <View style={{
              width: wp(70), height: wp(70), borderRadius: wp(35),
              backgroundColor: 'rgba(255,107,107,0.1)',
              borderWidth: 2, borderColor: 'rgba(255,107,107,0.3)',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: wp(16),
            }}>
              <Text style={{ fontSize: fp(30) }}>📍</Text>
            </View>

            <Text style={{
              fontSize: fp(18), fontWeight: '800', color: '#FFFFFF',
              textAlign: 'center', marginBottom: wp(6),
            }}>
              {T[userLang].liveTitle}
            </Text>

            <Text style={{
              fontSize: fp(11), color: '#9CA3AF', textAlign: 'center',
              lineHeight: fp(16), marginBottom: wp(16),
            }}>
              {T[userLang].liveDesc}
            </Text>

            {/* Ce qui sera disponible */}
            <View style={{
              backgroundColor: '#252A30', borderRadius: wp(12),
              padding: wp(14), width: '100%', marginBottom: wp(16),
            }}>
              <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#D4AF37', marginBottom: wp(8) }}>
                {T[userLang].liveAvailable}
              </Text>
              <Text style={{ fontSize: fp(10), color: '#D1D5DB', lineHeight: fp(16) }}>
                • Suivi GPS en temps réel du parcours{'\n'}
                • Calcul de distance par géolocalisation{'\n'}
                • Tracé du chemin sur carte{'\n'}
                • Détection automatique de l'intensité par la vitesse :{'\n'}
                {'    '}Marche lente {'<'} 4 km/h → MET 2.5{'\n'}
                {'    '}Marche normale 4-5.5 km/h → MET 3.5{'\n'}
                {'    '}Marche rapide 5.5-7 km/h → MET 4.3{'\n'}
                {'    '}Course lente 7-9 km/h → MET 7.0{'\n'}
                {'    '}Course modérée 9-12 km/h → MET 9.0{'\n'}
                {'    '}Course rapide {'>'} 12 km/h → MET 11.5{'\n'}
                • Calories = MET × poids × durée (pas de capteur nécessaire){'\n'}
                • Rapport post-activité avec vitesse moyenne et intensité{'\n'}
                • Historique des parcours
              </Text>
            </View>

            {/* Note technique */}
            <View style={{
              backgroundColor: 'rgba(77,166,255,0.06)', borderRadius: wp(10),
              padding: wp(10), width: '100%', marginBottom: wp(16),
              borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)',
            }}>
              <Text style={{ fontSize: fp(8), color: '#4DA6FF', lineHeight: fp(12) }}>
                🔧 BUILD EAS : expo-location watchPositionAsync() · Vitesse = distance / temps · L'intensité est déduite automatiquement de la vitesse, zéro capteur cardiaque nécessaire · Eau perdue = durée × 10ml (climat tempéré) ou × 15ml (climat chaud) · Source : Compendium of Physical Activities (Ainsworth 2011)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowLivePlaceholder(false)}
              style={{
                paddingVertical: wp(12), paddingHorizontal: wp(30),
                borderRadius: wp(12), backgroundColor: '#00D984',
              }}
            >
              <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#1A1D22' }}>
                {T[userLang].liveUnderstood}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════ RAPPORT POST-ACTIVITÉ ══════ */}
      <Modal
        visible={showPostReport}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPostReport(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'center', paddingHorizontal: wp(20),
        }}>
          {lastActivity && (
            <View style={{
              backgroundColor: '#1A1D22', borderRadius: wp(18),
              borderWidth: 1, borderColor: '#4A4F55', padding: wp(20),
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: fp(40), marginBottom: wp(8) }}>🎉</Text>

              <Text style={{
                fontSize: fp(18), fontWeight: '800', color: '#00D984',
                marginBottom: wp(4),
              }}>
                {T[userLang].bravo}
              </Text>

              <Text style={{
                fontSize: fp(11), color: '#9CA3AF', textAlign: 'center',
                marginBottom: wp(16),
              }}>
                {lastActivity.type === 'walk' ? T[userLang].niceWalk :
                 lastActivity.type === 'run' ? T[userLang].niceRun :
                 T[userLang].sessionOf + ' ' + lastActivity.name + ' ' + T[userLang].finished}
              </Text>

              {/* ══════ RÉSULTATS HOOKS POUVOIRS ══════ */}
              {Object.keys(hookResults).length > 0 && (
                <View style={{ width: '100%', marginBottom: wp(8), gap: wp(6) }}>
                  {Object.values(hookResults).map((result, idx) => {
                    switch (result.type) {

                      // ── XP BOOST RESULT ──
                      case 'xp_boost':
                        return (
                          <View key={idx} style={{
                            flexDirection: 'row', alignItems: 'center',
                            backgroundColor: 'rgba(212,175,55,0.08)',
                            borderRadius: wp(10), borderWidth: 1,
                            borderColor: 'rgba(212,175,55,0.2)',
                            paddingHorizontal: wp(12), paddingVertical: wp(8),
                          }}>
                            <Text style={{ fontSize: fp(18), marginRight: wp(8) }}>
                              {result.icon}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text style={{
                                color: '#D4AF37', fontSize: fp(10), fontWeight: '700',
                              }}>
                                {result.char_name} • +{result.percentage}% XP
                              </Text>
                              <Text style={{
                                color: '#8892A0', fontSize: fp(9), marginTop: wp(2),
                              }}>
                                {result.base_xp} XP + {result.bonus_xp} bonus = {result.total_xp} XP
                              </Text>
                            </View>
                            <Text style={{
                              color: '#D4AF37', fontSize: fp(14), fontWeight: '900',
                            }}>
                              +{result.bonus_xp}
                            </Text>
                          </View>
                        );

                      // ── STREAK RESULT (futur) ──
                      // case 'streak':
                      //   return (
                      //     <View key={idx} style={{...}}>
                      //       <Text>🐺 Streak : {result.current_streak} jours</Text>
                      //       {result.is_new_record && <Text>🏆 Nouveau record !</Text>}
                      //     </View>
                      //   );

                      // ── RECOVERY RESULT (futur) ──
                      // case 'recovery':
                      //   if (!result.suggestion) return null;
                      //   return (
                      //     <View key={idx} style={{...}}>
                      //       <Text>🔥 {result.suggestion}</Text>
                      //     </View>
                      //   );

                      default:
                        return null;
                    }
                  })}
                </View>
              )}

              {/* Résumé en grille */}
              <View style={{
                flexDirection: 'row', flexWrap: 'wrap',
                justifyContent: 'space-around', width: '100%',
                backgroundColor: '#252A30', borderRadius: wp(12),
                padding: wp(14), marginBottom: wp(14),
              }}>
                {lastActivity.distance ? (
                  <View style={{ alignItems: 'center', minWidth: '30%', marginBottom: wp(8) }}>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{T[userLang].distance}</Text>
                    <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFFFFF' }}>
                      {lastActivity.distance}
                    </Text>
                  </View>
                ) : null}

                <View style={{ alignItems: 'center', minWidth: '30%', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{T[userLang].duration}</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFFFFF' }}>
                    {lastActivity.duration} min
                  </Text>
                </View>

                <View style={{ alignItems: 'center', minWidth: '30%', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{T[userLang].calories}</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FF8C42' }}>
                    {lastActivity.kcal} kcal
                  </Text>
                </View>

                {lastActivity.water ? (
                  <View style={{ alignItems: 'center', minWidth: '30%' }}>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{T[userLang].waterLostLabel}</Text>
                    <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#4DA6FF' }}>
                      {lastActivity.water} ml
                    </Text>
                  </View>
                ) : null}

                {lastActivity.speed ? (
                  <View style={{ alignItems: 'center', minWidth: '30%' }}>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{T[userLang].avgSpeed}</Text>
                    <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#D4AF37' }}>
                      {lastActivity.speed} km/h
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Équivalent alimentaire fun */}
              <View style={{
                backgroundColor: 'rgba(255,140,66,0.08)',
                borderRadius: wp(10),
                borderWidth: 1,
                borderColor: 'rgba(255,140,66,0.15)',
                padding: wp(10),
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: wp(14),
              }}>
                <Text style={{ fontSize: fp(22), marginRight: wp(8) }}>
                  {lastActivity.kcal < 50 ? '🍎' :
                   lastActivity.kcal < 100 ? '🍌' :
                   lastActivity.kcal < 200 ? '🥐' :
                   lastActivity.kcal < 350 ? '🍔' :
                   lastActivity.kcal < 500 ? '🍕' : '🎂'}
                </Text>
                <Text style={{ fontSize: fp(10), color: '#D1D5DB', flex: 1 }}>
                  {T[userLang].equivalent} {
                    lastActivity.kcal < 50 ? `${(lastActivity.kcal / 52).toFixed(1)} pomme` :
                    lastActivity.kcal < 100 ? `${(lastActivity.kcal / 89).toFixed(1)} banane` :
                    lastActivity.kcal < 200 ? `${(lastActivity.kcal / 120).toFixed(1)} croissant` :
                    lastActivity.kcal < 350 ? `${(lastActivity.kcal / 295).toFixed(1)} burger` :
                    lastActivity.kcal < 500 ? `${(lastActivity.kcal / 266).toFixed(1)} part de pizza` :
                    `${(lastActivity.kcal / 350).toFixed(1)} part de gâteau`
                  } {T[userLang].burned2}
                </Text>
              </View>

              {/* Objectif OMS mis à jour */}
              <Text style={{
                fontSize: fp(9), color: '#6B7280', textAlign: 'center',
                marginBottom: wp(14),
              }}>
                {T[userLang].weekOms} : {weeklyMinutes} / 150 min
                {weeklyMinutes >= 150 ? ' ' + String.fromCodePoint(0x2705) : ' · ' + T[userLang].still + ' ' + (150 - weeklyMinutes) + ' min'}
              </Text>

              {/* Bouton fermer */}
              <TouchableOpacity
                onPress={() => {
                  setShowPostReport(false);
                  setHookResults({});
                }}
                style={{
                  paddingVertical: wp(12), paddingHorizontal: wp(40),
                  borderRadius: wp(12), backgroundColor: '#00D984',
                }}
              >
                <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#1A1D22' }}>
                  {T[userLang].continueBtn} {String.fromCodePoint(0x1F4AA)}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default ActivityPage;
