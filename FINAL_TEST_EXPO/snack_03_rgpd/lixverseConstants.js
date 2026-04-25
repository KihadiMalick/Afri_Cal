// === SUPABASE CONFIG ===
var SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';

var HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: 'Bearer ' + SUPABASE_ANON_KEY
};

var POST_HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
};

// === STORAGE HELPER ===
function getCharacterImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.indexOf('http') === 0) return imageUrl;
  return SUPABASE_URL + '/storage/v1/object/public/' + imageUrl;
}

// === CHARACTER EMOJIS FALLBACK (16 slugs) ===
var CHARACTER_EMOJIS = {
  emerald_owl: '🦉',
  hawk_eye: '🦅',
  ruby_tiger: '🐯',
  amber_fox: '🦋',
  gipsy: '🕷️',
  jade_phoenix: '🔥',
  silver_wolf: '🐿️',
  boukki: '🦴',
  iron_rhino: '🦏',
  coral_dolphin: '🐬',
  licornium: '🦄',
  jaane_snake: '🐍',
  mosquito: '🦟',
  diamond_simba: '🦁',
  alburax: '🐴',
  tardigrum: '🧬'
};

// === TIER CONFIG (couleurs signatures Premium LIXUM) ===
var TIER_CONFIG = {
  standard: {
    primary: '#C0C0C0',
    secondary: '#808080',
    label: 'STANDARD',
    gradient: ['#3A3F46', '#252A30'],
    glow: 'rgba(192,192,192,0.25)'
  },
  rare: {
    primary: '#4DA6FF',
    secondary: '#1E5A9E',
    label: 'RARE',
    gradient: ['#1E3A5F', '#0F1F38'],
    glow: 'rgba(77,166,255,0.3)'
  },
  elite: {
    primary: '#9B59B6',
    secondary: '#6B3D84',
    label: 'ÉLITE',
    gradient: ['#3D1F4F', '#2A1438'],
    glow: 'rgba(155,89,182,0.35)'
  },
  mythique: {
    primary: '#FF6B35',
    secondary: '#B8441F',
    label: 'MYTHIQUE',
    gradient: ['#4F2818', '#2F1810'],
    glow: 'rgba(255,107,53,0.4)'
  },
  ultimate: {
    primary: '#FFD700',
    secondary: '#B8860B',
    label: 'ULTIMATE',
    gradient: ['#3F2E0A', '#251A05'],
    glow: 'rgba(255,215,0,0.5)'
  }
};

var TIER_ORDER = ['standard', 'rare', 'elite', 'mythique', 'ultimate'];

// === MetalCard design system ===
var METAL_GRADIENT = ['#3A3F46', '#252A30', '#333A42', '#1A1D22'];
var METAL_BORDER_INFO = '#4A4F55';
var METAL_BORDER_INTERACTIVE = '#3A3F46';
var EMERALD_PRIMARY = '#00D984';

export {
  SUPABASE_URL, SUPABASE_ANON_KEY, HEADERS, POST_HEADERS,
  getCharacterImageUrl,
  CHARACTER_EMOJIS, TIER_CONFIG, TIER_ORDER,
  METAL_GRADIENT, METAL_BORDER_INFO, METAL_BORDER_INTERACTIVE, EMERALD_PRIMARY
};
