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

// === CHARACTER LORE V5 — 16 descriptions narratives "Wow" ===
// Format : tagline mystérieuse + pouvoir ancestral + indice localisation pour LIX-QUEST
// Pour LICORNIUM et MOSQUITO : créneau temporel obligatoire (gameplay GPS futur)
var CHARACTER_LORE = {
  emerald_owl: {
    tagline: 'Né des bibliothèques oubliées du temps, l\'Hibou Émeraude lit les secrets nutritionnels gravés dans chaque aliment.',
    power: 'Son regard perçant transforme chaque repas en révélation, chaque bouchée en sagesse millénaire.',
    location: 'Bibliothèques · librairies · universités',
    time_window: null
  },
  hawk_eye: {
    tagline: 'Roi incontesté des cieux nutritionnels, l\'Aigle Doré repère ce que l\'œil humain ne voit pas.',
    power: 'Sous sa garde, aucun micronutriment ne s\'échappe — il chasse la moindre carence avec une précision mortelle.',
    location: 'Sommets · belvédères · gratte-ciels',
    time_window: null
  },
  ruby_tiger: {
    tagline: 'Forgé dans le feu intérieur des grands fauves, le Tigre Rubis incarne la puissance brute et la maîtrise du souffle.',
    power: 'Quiconque le possède sent monter en lui une endurance que les autres ne soupçonnent même pas.',
    location: 'Salles de sport · stades · clubs de combat',
    time_window: null
  },
  amber_fox: {
    tagline: 'Symbole de métamorphose absolue, Mariposa danse entre les mondes — celui d\'avant, celui d\'après.',
    power: 'Elle offre à son détenteur le don rare de transformer chaque habitude alimentaire en pas vers une meilleure version de soi.',
    location: 'Parcs fleuris · jardins botaniques · serres',
    time_window: null
  },
  gipsy: {
    tagline: 'Tisseuse cosmique des liens invisibles, Gipsy révèle la trame cachée qui relie ton corps à tes choix.',
    power: 'Ce que les autres appellent hasard, elle le voit comme un fil tendu — et te donne le pouvoir de le tirer.',
    location: 'Vieux quartiers · ruelles anciennes · marchés couverts',
    time_window: null
  },
  jade_phoenix: {
    tagline: 'Renaissant des cendres de chaque effort, le Phénix de Jade incarne la résilience absolue du corps qui se reconstruit.',
    power: 'Son détenteur ne craint plus la fatigue — chaque chute devient l\'étincelle d\'une remontée plus haute encore.',
    location: 'Espaces bien-être · spas',
    time_window: null
  },
  silver_wolf: {
    tagline: 'Gardien silencieux des réserves vitales, Momo accumule pour l\'hiver ce que les autres dilapident à la légère.',
    power: 'Là où d\'autres s\'épuisent, son protégé tient bon — son énergie est une montagne secrète.',
    location: 'Forêts · parcs urbains · sentiers',
    time_window: null
  },
  boukki: {
    tagline: 'Stratège de la meute, Boukki sait que la vraie force naît du collectif — et qu\'aucun défi n\'est insurmontable à plusieurs.',
    power: 'Détenir cette carte, c\'est ne plus jamais marcher seul vers ses objectifs.',
    location: 'Marchés · restaurants · cantines',
    time_window: null
  },
  iron_rhino: {
    tagline: 'Bouclier indomptable des grandes ambitions, le Rhino de Fer charge tête baissée vers ce qui paraît impossible.',
    power: 'Sous sa protection, aucune limite n\'est définitive — elles ne sont que des murs à fracasser.',
    location: 'Salles de musculation · clubs de force · gymnases',
    time_window: null
  },
  coral_dolphin: {
    tagline: 'Danseur des grands courants océaniques, le Dauphin Corail navigue avec grâce entre fluidité et puissance.',
    power: 'Son protégé apprend l\'art rare de l\'effort sans douleur — l\'eau le porte là où d\'autres se noient.',
    location: 'Plages · piscines · bords de mer',
    time_window: null
  },
  licornium: {
    tagline: 'Manifestation rare de la vitalité absolue, LICORNIUM incarne ce qui ne se voit qu\'une fois dans une vie.',
    power: 'Son détenteur entre dans un cercle restreint : celui des élus qui transcendent leurs propres limites.',
    location: 'Apparition aléatoire sur la map',
    time_window: '5h – 8h heure locale'
  },
  jaane_snake: {
    tagline: 'Veilleur silencieux des transitions invisibles, Jaane Snake voit les deux faces de chaque choix.',
    power: 'Son protégé maîtrise l\'art ancestral du discernement — savoir quand bouger, savoir quand attendre.',
    location: 'Forêts · jardins',
    time_window: null
  },
  mosquito: {
    tagline: 'Essaim invisible aux millions de battements d\'ailes, MOSQUITO multiplie chaque action par mille.',
    power: 'Quiconque le possède devient redoutable par accumulation — une goutte par jour devient océan en un mois.',
    location: 'Jardins publics · zoos · espaces végétaux',
    time_window: '18h – 20h heure locale'
  },
  diamond_simba: {
    tagline: 'Roi-Lion de diamant, souverain incontesté de la savane santé. Son rugissement réveille la force endormie en chacun.',
    power: 'Détenir cette carte, c\'est porter en soi l\'autorité naturelle qui inspire les autres et soumet la fatigue.',
    location: 'Zoos · safaris · réserves naturelles',
    time_window: null
  },
  alburax: {
    tagline: 'Pégase ailé venu d\'au-delà des nuages, Alburax est la monture céleste des records personnels.',
    power: 'Son cavalier découvre que les limites du corps n\'étaient qu\'illusion — son endurance devient légende vivante.',
    location: 'Hippodromes · plaines · grands espaces ouverts',
    time_window: null
  },
  tardigrum: {
    tagline: 'Ourson d\'eau immortel, TARDIGRUM résiste à ce qui anéantit toute autre forme de vie. Le froid, le feu, le vide cosmique — rien ne l\'éteint.',
    power: 'Détenir cette carte est l\'accomplissement ultime : aucun obstacle de santé, aucun découragement ne peut atteindre son porteur.',
    location: 'Laboratoires · musées scientifiques · centres de recherche',
    time_window: null
  }
};

export {
  SUPABASE_URL, SUPABASE_ANON_KEY, HEADERS, POST_HEADERS,
  getCharacterImageUrl,
  CHARACTER_EMOJIS, TIER_CONFIG, TIER_ORDER,
  METAL_GRADIENT, METAL_BORDER_INFO, METAL_BORDER_INTERACTIVE, EMERALD_PRIMARY,
  CHARACTER_LORE
};
