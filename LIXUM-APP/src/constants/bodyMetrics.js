// bodyMetrics.js — fonction partagee calculateBodyMetrics pour RegisterPage
// et EditProfilePage. Extraction de registerConstants.js l.89-119 pour
// reutilisation cross-modules. Accepte activityLevel en string OU index int.

// Map string -> multiplier (utilisation prod EditProfilePage)
export var ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extreme: 1.9
};

// Array index 0..4 (utilisation Register legacy)
export var ACTIVITY_MULTIPLIERS_ARRAY = [1.2, 1.375, 1.55, 1.725, 1.9];

// Resolve activityLevel en multiplier numerique (supporte string ou int)
function resolveActivityMult(activityLevel) {
  if (typeof activityLevel === 'number') {
    var idx = Math.max(0, Math.min(4, activityLevel));
    return ACTIVITY_MULTIPLIERS_ARRAY[idx];
  }
  if (typeof activityLevel === 'string' && ACTIVITY_MULTIPLIERS[activityLevel]) {
    return ACTIVITY_MULTIPLIERS[activityLevel];
  }
  // Fallback "moderate" (valeur medium)
  return 1.55;
}

export function calculateBodyMetrics(data) {
  var w = parseFloat(data.weight) || 70;
  var h = parseFloat(data.height) || 175;
  var a = parseFloat(data.age) || 25;
  var actMult = resolveActivityMult(data.activityLevel);
  var bmr = data.gender === 'male'
    ? Math.round(10 * w + 6.25 * h - 5 * a + 5)
    : Math.round(10 * w + 6.25 * h - 5 * a - 161);
  var tdee = Math.round(bmr * actMult);
  var targetKg = data.targetKg || 5;
  var totalKcal = targetKg * 7700;
  var modes = {
    ambitious: {
      dailyDelta: Math.min(1000, Math.round(totalKcal / (data.timelineDays || 90))),
      days: Math.max(Math.ceil(totalKcal / 1000), 14)
    },
    reasonable: {
      dailyDelta: 500,
      days: Math.ceil(totalKcal / 500)
    },
    realistic: {
      dailyDelta: 300,
      days: Math.ceil(totalKcal / 300)
    }
  };
  modes.ambitious.weeksLabel = Math.ceil(modes.ambitious.days / 7);
  modes.reasonable.weeksLabel = Math.ceil(modes.reasonable.days / 7);
  modes.realistic.weeksLabel = Math.ceil(modes.realistic.days / 7);
  var paceIdx = typeof data.paceMode === 'number' ? data.paceMode : 1;
  var selectedKey = ['ambitious', 'reasonable', 'realistic'][paceIdx] || 'reasonable';
  var delta = modes[selectedKey].dailyDelta;
  var dailyTarget = data.goal === 'lose' ? tdee - delta : data.goal === 'gain' ? tdee + delta : tdee;
  var ratios = data.goal === 'lose'
    ? { protein: 0.40, carbs: 0.30, fat: 0.30 }
    : data.goal === 'gain'
      ? { protein: 0.30, carbs: 0.50, fat: 0.20 }
      : { protein: 0.30, carbs: 0.45, fat: 0.25 };
  var macros = {
    protein: Math.round((dailyTarget * ratios.protein) / 4),
    carbs: Math.round((dailyTarget * ratios.carbs) / 4),
    fat: Math.round((dailyTarget * ratios.fat) / 9)
  };
  return { bmr: bmr, tdee: tdee, dailyTarget: dailyTarget, modes: modes, macros: macros };
}

export default calculateBodyMetrics;
