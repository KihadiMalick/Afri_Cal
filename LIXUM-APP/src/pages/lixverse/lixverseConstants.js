import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';
const HEADERS = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };
const POST_HEADERS = { ...HEADERS, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

const ALL_CHARACTERS = [
  { id: 'emerald_owl', name: 'EMERALD OWL', tier: 'standard', color: '#00D984', emoji: '🦉', image: null, desc: '3 recettes perso gratuites', uses: 3, unlock_hours: 0 },
  { id: 'hawk_eye', name: 'HAWK EYE', tier: 'standard', color: '#4DA6FF', emoji: '🦅', desc: '2 Xscans gratuits', uses: 2, unlock_hours: 0 },
  { id: 'ruby_tiger', name: 'RUBY TIGER', tier: 'standard', color: '#FF4757', emoji: '🐯', desc: '1 programme sport gratuit', uses: 1, unlock_hours: 0 },
  { id: 'amber_fox', name: 'AMBER FOX', tier: 'standard', color: '#FF8C42', emoji: '🦊', desc: '2 substitutions ingrédients', uses: 2, unlock_hours: 0 },
  { id: 'gipsy', name: 'GIPSY', tier: 'standard', color: '#9B6DFF', emoji: '🕷️', desc: 'Corrélations santé', uses: 2, unlock_hours: 0 },
  { id: 'jade_phoenix', name: 'JADE PHOENIX', tier: 'rare', color: '#2ED573', emoji: '🔥', desc: '5 messages ALIXEN gratuits', uses: 5, unlock_hours: 0 },
  { id: 'silver_wolf', name: 'SILVER WOLF', tier: 'rare', color: '#A4B0BE', emoji: '🐺', desc: 'MediBook 48h consultation', uses: 0, unlock_hours: 48 },
  { id: 'boukki', name: 'BOUKKI', tier: 'rare', color: '#CD7F32', emoji: '🦴', desc: '3 indices de défi gratuits', uses: 3, unlock_hours: 0 },
  { id: 'iron_rhino', name: 'IRON RHINO', tier: 'rare', color: '#747D8C', emoji: '🦏', desc: 'Secret Pocket 48h lecture', uses: 0, unlock_hours: 48 },
  { id: 'coral_dolphin', name: 'CORAL DOLPHIN', tier: 'rare', color: '#FF6B81', emoji: '🐬', desc: '1 profil enfant 48h', uses: 1, unlock_hours: 48 },
  { id: 'licornium', name: 'LICORNIUM', tier: 'elite', color: '#B388FF', emoji: '🦄', desc: 'Spécialiste Repas complet', uses: 2, unlock_hours: 0 },
  { id: 'jaane_snake', name: 'JAANE SNAKE', tier: 'elite', color: '#FF6348', emoji: '🐍', desc: 'Spécialiste Activité complet', uses: 3, unlock_hours: 0 },
  { id: 'mosquito', name: 'MOSQUITO', tier: 'elite', color: '#7BED9F', emoji: '🦟', desc: 'Joker toutes pages (Essaim)', uses: 2, unlock_hours: 0 },
  { id: 'diamond_simba', name: 'DIAMOND SIMBA', tier: 'mythique', color: '#00CEC9', emoji: '🦁', desc: 'XP +50% + rapport PDF 7j', uses: 0, unlock_hours: 168 },
  { id: 'alburax', name: 'ALBURAX', tier: 'mythique', color: '#D4AF37', emoji: '🐴', desc: 'Double Lix + streak shield 7j', uses: 0, unlock_hours: 168 },
  { id: 'tardigrum', name: 'TARDIGRUM', tier: 'ultimate', color: '#DFE6E9', emoji: '🧬', desc: 'TOUT 365 jours — Le Graal', uses: 0, unlock_hours: 8760 },
];

const LIXSIGNS = {
  sport: {
    label: 'Sport & Effort',
    color: '#FF8C42',
    signs: [
      { id: 'sport_moved', text: "J'ai bougé", svgPath: 'M13 4a2 2 0 110 4 2 2 0 010-4zm-1 8l-4 4 1.4 1.4L12 14.8V22h2v-7.2l2.6 2.6L18 16l-4-4h-2z', viewBox: '0 0 24 24' },
      { id: 'sport_hard', text: "C'était dur", svgPath: 'M7 2v11h3v9l7-12h-4l3-8H7z', viewBox: '0 0 24 24' },
      { id: 'sport_record', text: "Record battu !", svgPath: 'M12 2l2.4 7.4h7.6l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7L2 9.4h7.6z', viewBox: '0 0 24 24' },
      { id: 'sport_rest', text: "Repos mérité", svgPath: 'M12 3a9 9 0 109 9c0-5-4-9-9-9zm0 16a7 7 0 110-14 7 7 0 010 14zm1-10h-2v3H8v2h3v3h2v-3h3v-2h-3V9z', viewBox: '0 0 24 24' },
      { id: 'sport_again', text: "On y retourne", svgPath: 'M17.65 6.35A7.96 7.96 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z', viewBox: '0 0 24 24' },
    ],
  },
  nutrition: {
    label: 'Nutrition',
    color: '#00D984',
    signs: [
      { id: 'nutri_good', text: "Bien mangé", svgPath: 'M8.1 13.34l2.83-2.83L3.91 3.5a4 4 0 000 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L4 19.75 5.41 21.17 12 14.58l6.59 6.59L20 19.75l-5.12-5.12z', viewBox: '0 0 24 24' },
      { id: 'nutri_scanned', text: "Repas scanné", svgPath: 'M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13z', viewBox: '0 0 24 24' },
      { id: 'nutri_cheat', text: "J'ai craqué", svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31A7.902 7.902 0 0112 20zm6.31-3.1L7.1 5.69A7.902 7.902 0 0112 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z', viewBox: '0 0 24 24' },
      { id: 'nutri_water', text: "Hydraté !", svgPath: 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z', viewBox: '0 0 24 24' },
      { id: 'nutri_homemade', text: "Cuisine maison", svgPath: 'M8.1 13.34l2.83-2.83-7.02-7.01a4 4 0 000 5.66l4.19 4.18zm14.28-4.03c-1.91-1.91-4.65-2.28-6.12-.81l-1.38 1.38c-1.59 1.59-2.09 3.74-1.38 5.27L4 24.75 5.41 26.17 21 10.58z', viewBox: '0 0 24 24' },
    ],
  },
  encouragement: {
    label: 'Encouragement',
    color: '#D4AF37',
    signs: [
      { id: 'enc_bravo', text: "Bravo !", svgPath: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', viewBox: '0 0 24 24' },
      { id: 'enc_continue', text: "Continue !", svgPath: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z', viewBox: '0 0 24 24' },
      { id: 'enc_proud', text: "Fier de toi", svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', viewBox: '0 0 24 24' },
      { id: 'enc_inspire', text: "Tu m'inspires", svgPath: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z', viewBox: '0 0 24 24' },
      { id: 'enc_noquit', text: "On lâche rien", svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', viewBox: '0 0 24 24' },
    ],
  },
  mood: {
    label: 'Humeur & État',
    color: '#9B6DFF',
    signs: [
      { id: 'mood_great', text: "En forme !", svgPath: 'M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z', viewBox: '0 0 24 24' },
      { id: 'mood_tired', text: "Fatigué", svgPath: 'M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v9.33C7 15.4 7.6 16 8.33 16h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 12.5h-2v-2h2v2zM13 9h-2V5.5h2V9zM10 17l2 3 2-3h-4z', viewBox: '0 0 24 24' },
      { id: 'mood_motivated', text: "Motivé !", svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', viewBox: '0 0 24 24' },
      { id: 'mood_stressed', text: "Stressé", svgPath: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z', viewBox: '0 0 24 24' },
      { id: 'mood_zen', text: "Zen", svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', viewBox: '0 0 24 24' },
    ],
  },
  social: {
    label: 'Social',
    color: '#4DA6FF',
    signs: [
      { id: 'soc_hello', text: "Coucou !", svgPath: 'M7 24h2v-2H7v2zm4 0h2v-2h-2v2zm4 0h2v-2h-2v2zM16 .01L8 0C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2c0-1.1-.9-1.99-2-1.99z', viewBox: '0 0 24 24' },
      { id: 'soc_thanks', text: "Merci !", svgPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', viewBox: '0 0 24 24' },
      { id: 'soc_challenge', text: "Défi accepté !", svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', viewBox: '0 0 24 24' },
      { id: 'soc_miss', text: "Tu me manques", svgPath: 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z', viewBox: '0 0 24 24' },
      { id: 'soc_check', text: "Check !", svgPath: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', viewBox: '0 0 24 24' },
    ],
  },
  celebration: {
    label: 'Célébration',
    color: '#FF6B81',
    signs: [
      { id: 'cel_goal', text: "Objectif atteint !", svgPath: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z', viewBox: '0 0 24 24' },
      { id: 'cel_streak', text: "Streak !", svgPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', viewBox: '0 0 24 24' },
      { id: 'cel_bonus', text: "Bonus Lix !", svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.94s4.18 1.36 4.18 3.87c0 1.87-1.38 2.84-3.12 3.17z', viewBox: '0 0 24 24' },
      { id: 'cel_duo_record', text: "Record duo !", svgPath: 'M12 7.13l.97 2.29.47 1.11 1.2.1 2.47.21-1.88 1.63-.91.79.27 1.18.56 2.41-2.12-1.28-1.03-.64-1.03.62-2.12 1.28.56-2.41.27-1.18-.91-.79-1.88-1.63 2.47-.21 1.2-.1.47-1.11z', viewBox: '0 0 24 24' },
    ],
  },
};

const WORLD_DOTS = [
  { x: 130, y: 120, size: 'large' },
  { x: 175, y: 140, size: 'medium' },
  { x: 200, y: 100, size: 'small' },
  { x: 220, y: 260, size: 'medium' },
  { x: 240, y: 290, size: 'small' },
  { x: 230, y: 320, size: 'small' },
  { x: 380, y: 80, size: 'medium' },
  { x: 400, y: 95, size: 'small' },
  { x: 370, y: 100, size: 'small' },
  { x: 390, y: 150, size: 'large' },
  { x: 410, y: 180, size: 'large' },
  { x: 420, y: 210, size: 'medium' },
  { x: 400, y: 240, size: 'medium' },
  { x: 380, y: 190, size: 'small' },
  { x: 430, y: 195, size: 'small' },
  { x: 370, y: 220, size: 'small' },
  { x: 415, y: 260, size: 'small' },
  { x: 440, y: 170, size: 'small' },
  { x: 460, y: 130, size: 'medium' },
  { x: 475, y: 145, size: 'small' },
  { x: 520, y: 90, size: 'medium' },
  { x: 570, y: 100, size: 'large' },
  { x: 600, y: 120, size: 'medium' },
  { x: 550, y: 140, size: 'small' },
  { x: 630, y: 135, size: 'small' },
  { x: 620, y: 180, size: 'medium' },
  { x: 640, y: 200, size: 'small' },
  { x: 660, y: 290, size: 'medium' },
  { x: 680, y: 310, size: 'small' },
];

const BINOME_LEADERBOARD = [
  { rank: 1, names: 'LXM-8F2K9B & LXM-2K7F4A', flags: '🇸🇳🇧🇮', flames: 42, pts: 520 },
  { rank: 2, names: 'LXM-3G5H7J & LXM-9R4T2M', flags: '🇬🇭🇲🇱', flames: 38, pts: 480 },
  { rank: 3, names: 'LXM-6N8P1Q & LXM-4D7F3S', flags: '🇰🇪🇰🇪', flames: 35, pts: 440 },
  { rank: 4, names: 'LXM-2W5X8Y & LXM-7B3C6E', flags: '🇲🇱🇧🇫', flames: 28, pts: 360 },
  { rank: 5, names: 'LXM-5K9L2N & LXM-1H4J7M', flags: '🇨🇲🇨🇩', flames: 22, pts: 280 },
];

const TIER_CONFIG = {
  standard: { label: 'Standard', color: '#00D984', bg: 'rgba(0,217,132,0.1)', border: 'rgba(0,217,132,0.3)' },
  rare: { label: 'Rare', color: '#4DA6FF', bg: 'rgba(77,166,255,0.1)', border: 'rgba(77,166,255,0.3)' },
  elite: { label: 'Elite', color: '#B388FF', bg: 'rgba(179,136,255,0.1)', border: 'rgba(179,136,255,0.3)' },
  mythique: { label: 'Mythique', color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.3)' },
  ultimate: { label: 'Ultime', color: '#DFE6E9', bg: 'rgba(223,230,233,0.08)', border: 'rgba(223,230,233,0.25)' },
};

const NORMAL_SEGMENTS = [
  { label: '3', icon: '⚡', chance: 27, color: '#2A4A3A', reward: { type: 'energy', amount: 3 } },
  { label: '30', icon: '💰', chance: 20, color: '#3A4A2A', reward: { type: 'lix', amount: 30 } },
  { label: '1', icon: '🧩', chance: 15, color: '#3A2A4A', subLabel: 'Frag Std', reward: { type: 'fragment', tier: 'standard', amount: 1 } },
  { label: '1', icon: '📸', chance: 15, color: '#4A3A2A', subLabel: 'scan', reward: { type: 'scan', amount: 1 } },
  { label: '1', icon: '🎁', chance: 10, color: '#4A2A2A', subLabel: 'spin', reward: { type: 'free_spin', amount: 1 } },
  { label: '1', icon: '🧩', chance: 8, color: '#2A3A4A', subLabel: 'Frag Rare', reward: { type: 'fragment', tier: 'rare', amount: 1 } },
  { label: '10', icon: '⚡⚡', chance: 5, color: '#4A4A2A', subLabel: 'énergie', reward: { type: 'energy', amount: 10 } },
];

const SUPER_SEGMENTS = [
  { label: '5', icon: '⚡', chance: 30, color: '#2A4A3A', reward: { type: 'energy', amount: 5 } },
  { label: '50', icon: '💰', chance: 20, color: '#3A4A2A', reward: { type: 'lix', amount: 50 } },
  { label: '1', icon: '🃏', chance: 7, color: '#3A2A4A', subLabel: 'carte Std', reward: { type: 'card', tier: 'standard', amount: 1 } },
  { label: '2', icon: '📸', chance: 18, color: '#4A3A2A', subLabel: 'scans', reward: { type: 'scan', amount: 2 } },
  { label: '1', icon: '🎁', chance: 10, color: '#4A2A2A', subLabel: 'super', reward: { type: 'free_spin', amount: 1 } },
  { label: '1', icon: '🧩', chance: 8, color: '#2A3A4A', subLabel: 'Frag Elite', reward: { type: 'fragment', tier: 'elite', amount: 1 } },
  { label: '25', icon: '⚡⚡', chance: 7, color: '#4A4A2A', subLabel: 'énergie', reward: { type: 'energy', amount: 25 } },
];

const MEGA_SEGMENTS = [
  { label: '10', icon: '⚡', chance: 30, color: '#2A4A3A', reward: { type: 'energy', amount: 10 } },
  { label: '100', icon: '💰', chance: 20, color: '#3A4A2A', reward: { type: 'lix', amount: 100 } },
  { label: '2', icon: '🧩', chance: 15, color: '#3A2A4A', subLabel: 'Frag Rare', reward: { type: 'fragment', tier: 'rare', amount: 2 } },
  { label: '1', icon: '🧩', chance: 13, color: '#4A3A2A', subLabel: 'Frag Elite', reward: { type: 'fragment', tier: 'elite', amount: 1 } },
  { label: '1', icon: '🃏', chance: 5, color: '#4A2A2A', subLabel: 'carte Rare', reward: { type: 'card', tier: 'rare', amount: 1 } },
  { label: '1', icon: '🧩', chance: 7, color: '#2A3A4A', subLabel: 'Frag Myth', reward: { type: 'fragment', tier: 'mythique', amount: 1 } },
  { label: '50', icon: '⚡⚡', chance: 10, color: '#4A4A2A', subLabel: 'énergie', reward: { type: 'energy', amount: 50 } },
];

const SLUGS_BY_TIER = {
  standard: ['emerald_owl', 'hawk_eye', 'ruby_tiger', 'amber_fox', 'gipsy'],
  rare: ['jade_phoenix', 'silver_wolf', 'boukki', 'iron_rhino', 'coral_dolphin'],
  elite: ['licornium', 'jaane_snake', 'mosquito'],
  mythique: ['diamond_simba', 'alburax'],
  ultimate: ['tardigrum'],
};

const CHAR_EMOJIS = {
  'emerald_owl': '🦉', 'hawk_eye': '🦅', 'ruby_tiger': '🐯',
  'amber_fox': '🦊', 'gipsy': '🕷️',
  'jade_phoenix': '🔥', 'silver_wolf': '🐺', 'boukki': '🦴',
  'iron_rhino': '🦏', 'coral_dolphin': '🐬',
  'licornium': '🦄', 'jaane_snake': '🐍', 'mosquito': '🦟',
  'diamond_simba': '🦁', 'alburax': '🐴',
  'tardigrum': '🧬',
};

const CHAR_NAMES = {
  'emerald_owl': 'Emerald Owl', 'hawk_eye': 'Hawk Eye', 'ruby_tiger': 'Ruby Tiger',
  'amber_fox': 'Amber Fox', 'gipsy': 'Gipsy',
  'jade_phoenix': 'Jade Phoenix', 'silver_wolf': 'Silver Wolf', 'boukki': 'Boukki',
  'iron_rhino': 'Iron Rhino', 'coral_dolphin': 'Coral Dolphin',
  'licornium': 'LICORNIUM', 'jaane_snake': 'Jaane Snake', 'mosquito': 'MOSQUITO',
  'diamond_simba': 'Diamond Simba', 'alburax': 'Alburax',
  'tardigrum': 'TARDIGRUM',
};

const FRAGS_NIV1 = { standard: 3, rare: 4, elite: 5, mythique: 8, ultimate: 15 };

const TIER_COLORS = {
  standard: '#00D984', rare: '#4DA6FF', elite: '#B388FF',
  mythique: '#D4AF37', ultimate: '#FF6B8A',
};

const CHARACTER_IMAGES = {
  'emerald_owl': { img: null, emoji: '🦉' },
  'hawk_eye': { img: null, emoji: '🦅' },
  'ruby_tiger': { img: null, emoji: '🐯' },
  'amber_fox': { img: null, emoji: '🦊' },
  'gipsy': { img: null, emoji: '🕷️' },
  'jade_phoenix': { img: null, emoji: '🔥' },
  'silver_wolf': { img: null, emoji: '🐺' },
  'boukki': { img: null, emoji: '🦴' },
  'iron_rhino': { img: null, emoji: '🦏' },
  'coral_dolphin': { img: null, emoji: '🐬' },
  'licornium': { img: null, emoji: '🦄' },
  'jaane_snake': { img: null, emoji: '🐍' },
  'mosquito': { img: null, emoji: '🦟' },
  'diamond_simba': { img: null, emoji: '🦁' },
  'alburax': { img: null, emoji: '🐴' },
  'tardigrum': { img: null, emoji: '🧬' },
};

const SEGMENT_GRADIENTS = {
  '#2A4A3A': { inner: '#3A5A4A', outer: '#1A3A2A' },
  '#3A4A2A': { inner: '#4A5A3A', outer: '#2A3A1A' },
  '#3A2A4A': { inner: '#4A3A5A', outer: '#2A1A3A' },
  '#4A3A2A': { inner: '#5A4A3A', outer: '#3A2A1A' },
  '#4A2A2A': { inner: '#5A3A3A', outer: '#3A1A1A' },
  '#2A3A4A': { inner: '#3A4A5A', outer: '#1A2A3A' },
  '#4A4A2A': { inner: '#5A5A3A', outer: '#3A3A1A' },
};

const NAV_TABS = [
  { key: 'home', label: 'Accueil', iconDefault: 'home-outline', iconActive: 'home' },
  { key: 'meals', label: 'Repas', iconDefault: 'restaurant-outline', iconActive: 'restaurant' },
  { key: 'medicai', label: 'MedicAi', isMedicAi: true },
  { key: 'activity', label: 'Activité', iconDefault: 'fitness-outline', iconActive: 'fitness' },
  { key: 'lixverse', label: 'LixVerse', isSpecial: true, isLixVerse: true },
];

const getCharImage = (slug) => CHARACTER_IMAGES[slug] || { img: null, emoji: '🃏' };

const randomSlugFromTier = (tier) => {
  const slugs = SLUGS_BY_TIER[tier];
  if (!slugs || slugs.length === 0) return null;
  return slugs[Math.floor(Math.random() * slugs.length)];
};

const getSegmentAngles = (segments) => {
  const total = segments.reduce((sum, s) => sum + s.chance, 0);
  let currentAngle = 0;
  return segments.map(seg => {
    const sweepAngle = (seg.chance / total) * 360;
    const startAngle = currentAngle;
    currentAngle += sweepAngle;
    return { ...seg, startAngle, sweepAngle };
  });
};

const describeArc = (cx, cy, radius, startAngle, endAngle) => {
  const startRad = (startAngle - 90) * Math.PI / 180;
  const endRad = (endAngle - 90) * Math.PI / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;
  return 'M ' + cx + ' ' + cy + ' L ' + x1 + ' ' + y1 + ' A ' + radius + ' ' + radius + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2 + ' Z';
};

const getSegmentRewardType = (seg) => seg.reward.type || 'energy';

const getSegmentTypeLabel = (seg) => {
  if (seg.subLabel) return seg.subLabel;
  if (seg.reward.type === 'energy') return 'énergie';
  if (seg.reward.type === 'lix') return 'Lix';
  if (seg.reward.type === 'card') return 'Carte';
  if (seg.reward.type === 'scan') return 'scan';
  if (seg.reward.type === 'free_spin') return 'spin';
  if (seg.reward.type === 'fragment') {
    if (seg.reward.tier === 'mythique') return 'Frag Myth';
    if (seg.reward.tier === 'elite') return 'Frag Elite';
    if (seg.reward.tier === 'standard') return 'Frag Std';
    return 'Frag Rare';
  }
  return '';
};

export {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  HEADERS,
  POST_HEADERS,
  ALL_CHARACTERS,
  LIXSIGNS,
  WORLD_DOTS,
  BINOME_LEADERBOARD,
  TIER_CONFIG,
  NORMAL_SEGMENTS,
  SUPER_SEGMENTS,
  MEGA_SEGMENTS,
  SLUGS_BY_TIER,
  CHAR_EMOJIS,
  CHAR_NAMES,
  FRAGS_NIV1,
  TIER_COLORS,
  CHARACTER_IMAGES,
  SEGMENT_GRADIENTS,
  NAV_TABS,
  getCharImage,
  randomSlugFromTier,
  getSegmentAngles,
  describeArc,
  getSegmentRewardType,
  getSegmentTypeLabel,
};
