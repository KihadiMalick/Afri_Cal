// LIXUM — Activity Page Constants

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

var ACTIVITY_DATA = {
  marche: { met: 3.5, icon: '🚶', label: 'Marche', labelEN: 'Walking', color: '#00D984', km_per_hour: 5, water_per_hour_ml: 400, compendium: '17170' },
  course: { met: 8.3, icon: '🏃', label: 'Course', labelEN: 'Running', color: '#00D984', km_per_hour: 8, water_per_hour_ml: 900, compendium: '12050' },
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
  football: { met: 7.0, icon: '⚽', label: 'Football', labelEN: 'Football', color: '#66BB6A', water_per_hour_ml: 700, compendium: '15610' },
  basketball: { met: 6.5, icon: '🏀', label: 'Basketball', labelEN: 'Basketball', color: '#FF7043', water_per_hour_ml: 750, compendium: '15055' },
  volleyball: { met: 4.0, icon: '🏐', label: 'Volleyball', labelEN: 'Volleyball', color: '#FFB300', water_per_hour_ml: 450, compendium: '15710' },
  handball: { met: 8.0, icon: '🤾', label: 'Handball', labelEN: 'Handball', color: '#5C6BC0', water_per_hour_ml: 750, compendium: '15350' },
  rugby: { met: 8.3, icon: '🏉', label: 'Rugby', labelEN: 'Rugby', color: '#43A047', water_per_hour_ml: 800, compendium: '15580' },
  cricket: { met: 4.8, icon: '🏏', label: 'Cricket', labelEN: 'Cricket', color: '#A1887F', water_per_hour_ml: 450, compendium: '15230' },
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
  menage: { met: 3.3, icon: '🧹', label: 'Ménage', labelEN: 'Housework', color: '#90A4AE', water_per_hour_ml: 300, compendium: '05020' },
  jardinage: { met: 4.0, icon: '🌱', label: 'Jardinage', labelEN: 'Gardening', color: '#66BB6A', water_per_hour_ml: 400, compendium: '08245' },
  escalier: { met: 8.8, icon: '🪜', label: 'Monter les escaliers', labelEN: 'Stair Climbing', color: '#8D6E63', water_per_hour_ml: 650, compendium: '17133' },
  lutte_africaine: { met: 7.8, icon: '🤼', label: 'Lutte africaine', labelEN: 'African Wrestling', color: '#D4AF37', water_per_hour_ml: 800, compendium: '15072' },
  danse_africaine: { met: 6.5, icon: '🥁', label: 'Danse africaine', labelEN: 'African Dance', color: '#FF8F00', water_per_hour_ml: 600, compendium: '03017' },
};

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

var getLang = function(lang) {
  if (!lang) return T.FR;
  return T[lang.toUpperCase()] || T.FR;
};

var calcCalories = function(met, weightKg, durationMin, intensity) {
  var intensityMult = intensity === 'leger' ? 0.75 : intensity === 'intense' ? 1.25 : 1.0;
  return Math.round(met * intensityMult * weightKg * (durationMin / 60));
};

var calcWater = function(waterPerHourMl, durationMin, intensity) {
  var intensityMult = intensity === 'leger' ? 0.8 : intensity === 'intense' ? 1.3 : 1.0;
  return Math.round((durationMin / 60) * waterPerHourMl * intensityMult);
};

var SPEED_ZONES = [
  { minSpeed: 0,    maxSpeed: 1,    met: 1.0,  label: 'Immobile',       labelEN: 'Idle',           zone: 'pause',    color: '#555E6C' },
  { minSpeed: 1,    maxSpeed: 4,    met: 2.5,  label: 'Marche lente',   labelEN: 'Slow walk',      zone: 'recovery', color: '#00D984' },
  { minSpeed: 4,    maxSpeed: 5.5,  met: 3.5,  label: 'Marche normale', labelEN: 'Normal walk',    zone: 'easy',     color: '#00D984' },
  { minSpeed: 5.5,  maxSpeed: 7,    met: 4.3,  label: 'Marche rapide',  labelEN: 'Brisk walk',     zone: 'moderate', color: '#FFB800' },
  { minSpeed: 7,    maxSpeed: 9,    met: 7.0,  label: 'Jogging',        labelEN: 'Jogging',        zone: 'tempo',    color: '#FF8C42' },
  { minSpeed: 9,    maxSpeed: 12,   met: 9.0,  label: 'Course modérée', labelEN: 'Moderate run',   zone: 'intense',  color: '#FF6B6B' },
  { minSpeed: 12,   maxSpeed: 15,   met: 11.5, label: 'Course rapide',  labelEN: 'Fast run',       zone: 'sprint',   color: '#FF1744' },
  { minSpeed: 15,   maxSpeed: 999,  met: 11.5, label: 'Sprint',         labelEN: 'Sprint',         zone: 'sprint',   color: '#FF1744' },
];

function getSpeedZone(speedKmh) {
  for (var i = SPEED_ZONES.length - 1; i >= 0; i--) {
    if (speedKmh >= SPEED_ZONES[i].minSpeed) return SPEED_ZONES[i];
  }
  return SPEED_ZONES[0];
}

// === PHASE 2 : FOOD_ITEMS → exports ===
