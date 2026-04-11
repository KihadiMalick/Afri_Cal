// LIXUM — Repas Page Constants
// Données partagées entre les sous-composants de RepasPage

const MOCK_FREQUENT = [
  { name: 'Riz + Haricots', cal: 285 },
  { name: 'Ugali', cal: 310 },
  { name: 'Pain beurré', cal: 320 },
  { name: 'Banane plantain', cal: 230 },
  { name: 'Fumbwa', cal: 195 },
  { name: 'Sambaza frit', cal: 280 },
];

const MOCK_RECIPES = [
  {
    name: 'Thieboudienne',
    origin: '🇸🇳 Sénégal',
    cal: 520,
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=200&fit=crop',
  },
  {
    name: 'Pizza Margherita',
    origin: '🇮🇹 Italie',
    cal: 680,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=300&h=200&fit=crop',
  },
  {
    name: 'Couscous Royal',
    origin: '🇲🇦 Maroc',
    cal: 450,
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=300&h=200&fit=crop',
  },
  {
    name: 'Brochettes Viande',
    origin: '🇧🇮 Burundi',
    cal: 380,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop',
  },
  {
    name: 'Poulet Yassa',
    origin: '🇸🇳 Sénégal',
    cal: 320,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop',
  },
  {
    name: 'Salade Mixte',
    origin: '🌍 Mondial',
    cal: 180,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
  },
];

const MEAL_SLOTS = [
  { key: 'breakfast', icon: '☀️', label_fr: 'Petit-déj', label_en: 'Breakfast' },
  { key: 'lunch', icon: '🌤️', label_fr: 'Déjeuner', label_en: 'Lunch' },
  { key: 'dinner', icon: '🌙', label_fr: 'Dîner', label_en: 'Dinner' },
  { key: 'snack', icon: '🍿', label_fr: 'Snack', label_en: 'Snack' },
];

const COUNTRY_FLAGS = {
  // ── Afrique de l'Ouest ──
  'Sénégal': '🇸🇳', 'Nigeria': '🇳🇬', 'Ghana': '🇬🇭', 'Mali': '🇲🇱',
  'Côte d\'Ivoire': '🇨🇮', "Côte d'Ivoire": '🇨🇮', 'Burkina Faso': '🇧🇫',
  'Guinée': '🇬🇳', 'Bénin': '🇧🇯', 'Togo': '🇹🇬', 'Niger': '🇳🇪',
  'Sierra Leone': '🇸🇱', 'Liberia': '🇱🇷', 'Gambie': '🇬🇲',
  'Guinée-Bissau': '🇬🇼', 'Cap-Vert': '🇨🇻', 'Mauritanie': '🇲🇷',

  // ── Afrique de l'Est ──
  'Éthiopie': '🇪🇹', 'Kenya': '🇰🇪', 'Tanzanie': '🇹🇿', 'Ouganda': '🇺🇬',
  'Rwanda': '🇷🇼', 'Burundi': '🇧🇮', 'Somalie': '🇸🇴', 'Érythrée': '🇪🇷',
  'Djibouti': '🇩🇯', 'Soudan': '🇸🇩', 'Soudan du Sud': '🇸🇸',
  'Madagascar': '🇲🇬', 'Comores': '🇰🇲', 'Maurice': '🇲🇺',
  'Seychelles': '🇸🇨', 'Malawi': '🇲🇼', 'Mozambique': '🇲🇿',

  // ── Afrique Centrale ──
  'Cameroun': '🇨🇲', 'RDC': '🇨🇩', 'Congo': '🇨🇬', 'Gabon': '🇬🇦',
  'Centrafrique': '🇨🇫', 'Tchad': '🇹🇩', 'Guinée équatoriale': '🇬🇶',
  'São Tomé-et-Príncipe': '🇸🇹',

  // ── Afrique Australe ──
  'Afrique du Sud': '🇿🇦', 'Zimbabwe': '🇿🇼', 'Zambie': '🇿🇲',
  'Botswana': '🇧🇼', 'Namibie': '🇳🇦', 'Angola': '🇦🇴',
  'Eswatini': '🇸🇿', 'Lesotho': '🇱🇸',

  // ── Afrique du Nord ──
  'Maroc': '🇲🇦', 'Algérie': '🇩🇿', 'Tunisie': '🇹🇳', 'Égypte': '🇪🇬',
  'Libye': '🇱🇾',

  // ── Europe ──
  'France': '🇫🇷', 'Italie': '🇮🇹', 'Espagne': '🇪🇸', 'Portugal': '🇵🇹',
  'Royaume-Uni': '🇬🇧', 'Allemagne': '🇩🇪', 'Belgique': '🇧🇪',
  'Grèce': '🇬🇷', 'Pays-Bas': '🇳🇱', 'Suisse': '🇨🇭',

  // ── Amérique ──
  'États-Unis': '🇺🇸', 'Brésil': '🇧🇷', 'Mexique': '🇲🇽',
  'Colombie': '🇨🇴', 'Argentine': '🇦🇷', 'Pérou': '🇵🇪',
  'Jamaïque': '🇯🇲', 'Haïti': '🇭🇹', 'Cuba': '🇨🇺',
  'Canada': '🇨🇦', 'Trinité-et-Tobago': '🇹🇹',

  // ── Moyen-Orient ──
  'Liban': '🇱🇧', 'Turquie': '🇹🇷', 'Irak': '🇮🇶', 'Iran': '🇮🇷',
  'Arabie saoudite': '🇸🇦', 'Yémen': '🇾🇪', 'Palestine': '🇵🇸',
  'Syrie': '🇸🇾', 'Jordanie': '🇯🇴', 'Émirats arabes unis': '🇦🇪',

  // ── Asie ──
  'Inde': '🇮🇳', 'Chine': '🇨🇳', 'Japon': '🇯🇵', 'Corée du Sud': '🇰🇷',
  'Thaïlande': '🇹🇭', 'Vietnam': '🇻🇳', 'Indonésie': '🇮🇩',
  'Philippines': '🇵🇭', 'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩',
  'Sri Lanka': '🇱🇰', 'Malaisie': '🇲🇾',

  // ── Fallback régions ──
  'Panafricain': '🌍', 'Afrique de l\'Ouest': '🌍', "Afrique de l'Ouest": '🌍',
  'Afrique de l\'Est': '🌍', "Afrique de l'Est": '🌍',
  'Afrique Centrale': '🌍', 'Afrique Australe': '🌍',
  'Afrique du Nord': '🌍', 'International': '🌐',
};

const getFlag = (country) => COUNTRY_FLAGS[country] || '🌍';

const RECIPE_REGIONS = [
  { key: 'all', label: '🌍 Tout', labelEn: '🌍 All' },
  { key: 'Afrique de l\'Ouest', label: '🇸🇳 Afrique Ouest', labelEn: '🇸🇳 West Africa' },
  { key: 'Afrique de l\'Est', label: '🇰🇪 Afrique Est', labelEn: '🇰🇪 East Africa' },
  { key: 'Afrique Centrale', label: '🇨🇩 Afrique Centrale', labelEn: '🇨🇩 Central Africa' },
  { key: 'Afrique du Nord', label: '🇲🇦 Afrique Nord', labelEn: '🇲🇦 North Africa' },
  { key: 'Afrique Australe', label: '🇿🇦 Afrique Australe', labelEn: '🇿🇦 Southern Africa' },
  { key: 'Europe', label: '🇫🇷 Europe', labelEn: '🇫🇷 Europe' },
  { key: 'Asie', label: '🇯🇵 Asie', labelEn: '🇯🇵 Asia' },
  { key: 'Amérique', label: '🇺🇸 Amérique', labelEn: '🇺🇸 Americas' },
  { key: 'Moyen-Orient', label: '🇱🇧 Moyen-Orient', labelEn: '🇱🇧 Middle East' },
];

const RECIPE_CATEGORIES = [
  { key: 'all', label: '🍽️ Tout', labelEn: '🍽️ All' },
  { key: 'Plat', label: '🍲 Consistant', labelEn: '🍲 Main' },
  { key: 'Soupe', label: '🥣 Soupe', labelEn: '🥣 Soup' },
  { key: 'Salade', label: '🥗 Salade', labelEn: '🥗 Salad' },
  { key: 'Petit-déjeuner', label: '🌅 Petit-déj', labelEn: '🌅 Breakfast' },
  { key: 'Snack', label: '🍿 Snack', labelEn: '🍿 Snack' },
  { key: 'Dessert', label: '🍰 Dessert', labelEn: '🍰 Dessert' },
  { key: 'Accompagnement', label: '🥘 Accomp.', labelEn: '🥘 Side' },
  { key: 'Boisson', label: '🥤 Boisson', labelEn: '🥤 Drink' },
];

var ALIXEN_HEALTH_FILTERS = [
  { key: 'sans_sucre', label: 'Sans sucre' },
  { key: 'sans_huile', label: 'Sans huile' },
  { key: 'sans_sel', label: 'Sans sel' },
  { key: 'sans_gluten', label: 'Sans gluten' },
  { key: 'sans_lactose', label: 'Sans lactose' },
  { key: 'faible_cholesterol', label: 'Faible cholest.' },
  { key: 'riche_fibres', label: 'Riche fibres' },
  { key: 'riche_fer', label: 'Riche fer' },
  { key: 'riche_proteines', label: 'Riche protéines' },
  { key: 'anti_inflammatoire', label: 'Anti-inflam.' },
];

var ALIXEN_REGIONS = [
  { key: 'west_africa', label: 'Afr. Ouest', emoji: '🇨🇮' },
  { key: 'east_africa', label: 'Afr. Est', emoji: '🇰🇪' },
  { key: 'central_africa', label: 'Afr. Centrale', emoji: '🇨🇲' },
  { key: 'north_africa', label: 'Maghreb', emoji: '🇲🇦' },
  { key: 'south_africa', label: 'Afr. Sud', emoji: '🇿🇦' },
  { key: 'european', label: 'Européen', emoji: '🇫🇷' },
  { key: 'asian', label: 'Asiatique', emoji: '🇯🇵' },
  { key: 'indian', label: 'Indien', emoji: '🇮🇳' },
  { key: 'middle_east', label: 'Moyen-Orient', emoji: '🇪🇬' },
  { key: 'mediterranean', label: 'Méditerranéen', emoji: '🇬🇷' },
  { key: 'latin_america', label: 'Am. Latine', emoji: '🇲🇽' },
  { key: 'caribbean', label: 'Caraïbes', emoji: '🇬🇾' },
  { key: 'american', label: 'Américain', emoji: '🇺🇸' },
  { key: 'oceania', label: 'Océanie', emoji: '🇦🇺' },
];

var ALIXEN_DISH_TYPES = [
  { key: 'soup', label: 'Soupe', emoji: '🍲' },
  { key: 'salad', label: 'Salade', emoji: '🥗' },
  { key: 'hearty', label: 'Consistant', emoji: '🍖' },
  { key: 'light', label: 'Léger', emoji: '🥒' },
  { key: 'rice', label: 'À base de riz', emoji: '🍚' },
  { key: 'pasta', label: 'Pâtes', emoji: '🍝' },
  { key: 'grill', label: 'Grillades', emoji: '🥩' },
  { key: 'stew', label: 'Ragoût', emoji: '🫕' },
  { key: 'street_food', label: 'Street food', emoji: '🌮' },
  { key: 'wrap', label: 'Wrap', emoji: '🥙' },
  { key: 'bowl', label: 'Bowl', emoji: '🥣' },
  { key: 'smoothie', label: 'Smoothie', emoji: '🥤' },
];

var ALIXEN_PRACTICAL_FILTERS = [
  { key: 'under_15min', label: '-15 min' },
  { key: 'under_30min', label: '-30 min' },
  { key: 'no_cooking', label: 'Zéro cuisson' },
  { key: 'budget', label: 'Petit budget' },
  { key: 'meal_prep', label: 'Meal prep' },
  { key: 'healthy_dessert', label: 'Pâtisserie saine' },
];

const MOOD_MATRIX = {
  'happy_sunny': { cats: ['Salade', 'Snack', 'Boisson'], msg_fr: 'Belle journée, beau mood ! Des plats frais et colorés pour vous ☀️', msg_en: 'Great day, great mood! Fresh and colorful dishes for you ☀️' },
  'happy_cloudy': { cats: ['Plat', 'Salade'], msg_fr: 'Bonne humeur même sous les nuages ! Un plat savoureux ? ⛅', msg_en: 'Good mood even under clouds! A tasty dish? ⛅' },
  'happy_rainy': { cats: ['Plat', 'Soupe'], msg_fr: 'Joyeux malgré la pluie ! Un bon plat chaud pour célébrer 🌧️', msg_en: 'Happy despite the rain! A warm dish to celebrate 🌧️' },
  'neutral_sunny': { cats: ['Salade', 'Plat', 'Snack'], msg_fr: 'Journée tranquille, plats équilibrés et agréables 🌤️', msg_en: 'Chill day, balanced and pleasant dishes 🌤️' },
  'neutral_cloudy': { cats: ['Plat', 'Accompagnement'], msg_fr: 'Un classique pour une journée classique ⛅', msg_en: 'A classic for a classic day ⛅' },
  'neutral_rainy': { cats: ['Soupe', 'Plat'], msg_fr: 'Temps de pluie, temps de soupe ! 🌧️', msg_en: 'Rainy day, soup day! 🌧️' },
  'sad_sunny': { cats: ['Snack', 'Salade', 'Dessert'], msg_fr: 'Le soleil est là pour vous ! Des plats légers pour remonter le moral 🌞', msg_en: 'The sun is here for you! Light dishes to lift your spirits 🌞' },
  'sad_cloudy': { cats: ['Soupe', 'Plat'], msg_fr: 'Un peu gris ? Du réconfort dans l\'assiette 🍲', msg_en: 'Feeling gray? Comfort on the plate 🍲' },
  'sad_rainy': { cats: ['Soupe', 'Plat', 'Dessert'], msg_fr: 'Un peu gris dehors et dedans ? Du réconfort chaud pour vous ❤️', msg_en: 'Gray outside and inside? Warm comfort for you ❤️' },
  'stressed_sunny': { cats: ['Salade', 'Boisson'], msg_fr: 'On respire... Des plats légers pour apaiser le corps 🧘', msg_en: 'Let\'s breathe... Light dishes to soothe 🧘' },
  'stressed_cloudy': { cats: ['Soupe', 'Salade'], msg_fr: 'Déstressez avec un plat simple et apaisant 🍃', msg_en: 'De-stress with a simple soothing dish 🍃' },
  'stressed_rainy': { cats: ['Soupe', 'Boisson'], msg_fr: 'Pluie et stress ? Une soupe chaude, rien de mieux 🫖', msg_en: 'Rain and stress? A warm soup, nothing better 🫖' },
  'tired_sunny': { cats: ['Plat', 'Snack', 'Petit-déjeuner'], msg_fr: 'Besoin d\'un boost ? Protéines et énergie au menu ! ⚡', msg_en: 'Need a boost? Protein and energy on the menu! ⚡' },
  'tired_cloudy': { cats: ['Plat', 'Petit-déjeuner'], msg_fr: 'Rechargez les batteries avec un plat costaud 🔋', msg_en: 'Recharge with a hearty dish 🔋' },
  'tired_rainy': { cats: ['Soupe', 'Plat'], msg_fr: 'Fatigue + pluie = soupe chaude et protéines 💪', msg_en: 'Tired + rain = warm soup and protein 💪' },
};

export {
  MOCK_FREQUENT,
  MOCK_RECIPES,
  MEAL_SLOTS,
  COUNTRY_FLAGS,
  getFlag,
  RECIPE_REGIONS,
  RECIPE_CATEGORIES,
  ALIXEN_HEALTH_FILTERS,
  ALIXEN_REGIONS,
  ALIXEN_DISH_TYPES,
  ALIXEN_PRACTICAL_FILTERS,
  MOOD_MATRIX,
};
