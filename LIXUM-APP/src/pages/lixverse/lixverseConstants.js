const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const HEADERS = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };
const POST_HEADERS = { ...HEADERS, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

const ALL_CHARACTERS = [
  { id: 'emerald_owl', name: 'EMERALD OWL', tier: 'standard', color: '#00D984', emoji: '🦉', image: require('../../assets/emerald_owl.webp'), desc: '3 recettes perso gratuites', uses: 3, unlock_hours: 0 },
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
