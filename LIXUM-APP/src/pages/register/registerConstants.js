import { Dimensions } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;
var SWIPE_THRESHOLD = W * 0.25;

var C = {
  bgDeep: '#1E2530', bgCard: '#151B23', bgInput: '#0A0E14',
  metalBorder: '#3E4855', emerald: '#00D984', emeraldDark: '#00A866',
  turquoise: '#00BFA6', gold: '#D4AF37',
  textPrimary: '#EAEEF3', textSecondary: '#8892A0', textMuted: '#555E6C',
  error: '#FF4D4D',
};

var texts = {
  fr: {
    p1Title: 'Cr\u00e9er votre compte', p1Subtitle: 'Vos informations personnelles',
    identityLabel: 'IDENTIT\u00c9', emailLabel: 'EMAIL', securityLabel: 'S\u00c9CURIT\u00c9',
    fullName: 'Nom complet', email: 'Email', emailConfirm: 'Confirmer l\'email',
    password: 'Mot de passe', passwordConfirm: 'Confirmer le mot de passe',
    emailMatch: 'Les emails correspondent \u2713', emailNoMatch: 'Les emails ne correspondent pas',
    passRules: 'Minimum 8 caract\u00e8res',
    weightLabel: 'POIDS', heightLabel: 'TAILLE', ageLabel: '\u00c2GE',
    male: 'Homme', female: 'Femme',
    activityLabel: 'Niveau d\'activit\u00e9',
    activityLevels: [
      { label: 'S\u00e9dentaire', desc: 'Peu ou pas d\'exercice', emoji: '\uD83D\uDECB\uFE0F' },
      { label: 'L\u00e9g\u00e8rement actif', desc: '1-2 fois/semaine', emoji: '\uD83D\uDEB6\u200D\u2642\uFE0F' },
      { label: 'Mod\u00e9r\u00e9ment actif', desc: '3-5 fois/semaine', emoji: '\uD83D\uDEB4\u200D\u2642\uFE0F' },
      { label: 'Tr\u00e8s actif', desc: '6-7 fois/semaine', emoji: '\uD83C\uDFCB\uFE0F\u200D\u2642\uFE0F' },
      { label: 'Extr\u00eamement actif', desc: 'Athl\u00e8te / travail physique', emoji: '\uD83D\uDD25' },
    ],
    dietLabel: 'R\u00e9gime alimentaire',
    diets: [
      { key: 'classic', label: 'Classique', desc: 'Aucune restriction', emoji: '\uD83C\uDF57', color: '#00D984' },
      { key: 'vegetarian', label: 'V\u00e9g\u00e9tarien', desc: 'Sans viande ni poisson', emoji: '\uD83E\uDD6C', color: '#00BFA6' },
      { key: 'vegan', label: 'V\u00e9gan', desc: 'Aucun produit animal', emoji: '\uD83C\uDF31', color: '#00D984' },
      { key: 'keto', label: 'K\u00e9to', desc: 'Faible en glucides, riche en lipides', emoji: '\uD83E\uDD51', color: '#D4AF37' },
      { key: 'halal', label: 'Halal', desc: 'Conforme aux pr\u00e9ceptes islamiques', emoji: '\uD83C\uDF19', color: '#00BFA6' },
    ],
    kgLabel: function (g) { return 'KG \u00c0 ' + (g === 'lose' ? 'PERDRE' : 'GAGNER'); },
    yourPace: 'Votre rythme',
    paceLabels: ['Ambitieux', 'Raisonnable', 'R\u00e9aliste'],
    yourPlan: 'VOTRE PLAN',
    dailyGoal: function (c) { return 'Objectif : ' + c + ' kcal / jour'; },
    bmrTdee: function (b, t) { return 'BMR : ' + b + ' \u00B7 TDEE : ' + t; },
    protein: 'Prot\u00e9ines', carbs: 'Glucides', fat: 'Lipides',
    gUnit: 'g', weeks: 'semaines',
    next: 'Suivant', createAccount: 'Cr\u00e9er mon compte',
  },
  en: {
    p1Title: 'Create your account', p1Subtitle: 'Your personal information',
    identityLabel: 'IDENTITY', emailLabel: 'EMAIL', securityLabel: 'SECURITY',
    fullName: 'Full name', email: 'Email', emailConfirm: 'Confirm email',
    password: 'Password', passwordConfirm: 'Confirm password',
    emailMatch: 'Emails match \u2713', emailNoMatch: 'Emails do not match',
    passRules: 'Minimum 8 characters',
    weightLabel: 'WEIGHT', heightLabel: 'HEIGHT', ageLabel: 'AGE',
    male: 'Male', female: 'Female',
    activityLabel: 'Activity level',
    activityLevels: [
      { label: 'Sedentary', desc: 'Little or no exercise', emoji: '\uD83D\uDECB\uFE0F' },
      { label: 'Lightly active', desc: '1-2 times/week', emoji: '\uD83D\uDEB6\u200D\u2642\uFE0F' },
      { label: 'Moderately active', desc: '3-5 times/week', emoji: '\uD83D\uDEB4\u200D\u2642\uFE0F' },
      { label: 'Very active', desc: '6-7 times/week', emoji: '\uD83C\uDFCB\uFE0F\u200D\u2642\uFE0F' },
      { label: 'Extremely active', desc: 'Athlete / physical job', emoji: '\uD83D\uDD25' },
    ],
    dietLabel: 'Diet type',
    diets: [
      { key: 'classic', label: 'Classic', desc: 'No restrictions', emoji: '\uD83C\uDF57', color: '#00D984' },
      { key: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish', emoji: '\uD83E\uDD6C', color: '#00BFA6' },
      { key: 'vegan', label: 'Vegan', desc: 'No animal products', emoji: '\uD83C\uDF31', color: '#00D984' },
      { key: 'keto', label: 'Keto', desc: 'Low carb, high fat', emoji: '\uD83E\uDD51', color: '#D4AF37' },
      { key: 'halal', label: 'Halal', desc: 'Islamic dietary laws', emoji: '\uD83C\uDF19', color: '#00BFA6' },
    ],
    kgLabel: function (g) { return 'KG TO ' + (g === 'lose' ? 'LOSE' : 'GAIN'); },
    yourPace: 'Your pace',
    paceLabels: ['Ambitious', 'Reasonable', 'Realistic'],
    yourPlan: 'YOUR PLAN',
    dailyGoal: function (c) { return 'Goal: ' + c + ' kcal / day'; },
    bmrTdee: function (b, t) { return 'BMR: ' + b + ' \u00B7 TDEE: ' + t; },
    protein: 'Protein', carbs: 'Carbs', fat: 'Fat',
    gUnit: 'g', weeks: 'weeks',
    next: 'Next', createAccount: 'Create my account',
  },
};

var ACTIVITY_MULTIPLIERS = [1.2, 1.375, 1.55, 1.725, 1.9];

function calculateGoals(data) {
  var w = parseFloat(data.weight) || 70, h = parseFloat(data.height) || 175;
  var a = parseFloat(data.age) || 25, actMult = ACTIVITY_MULTIPLIERS[data.activityLevel];
  var bmr = data.gender === 'male'
    ? Math.round(10 * w + 6.25 * h - 5 * a + 5)
    : Math.round(10 * w + 6.25 * h - 5 * a - 161);
  var tdee = Math.round(bmr * actMult);
  var targetKg = data.targetKg || 5, totalKcal = targetKg * 7700;
  var modes = {
    ambitious: { dailyDelta: Math.min(1000, Math.round(totalKcal / (data.timelineDays || 90))), days: Math.max(Math.ceil(totalKcal / 1000), 14) },
    reasonable: { dailyDelta: 500, days: Math.ceil(totalKcal / 500) },
    realistic: { dailyDelta: 300, days: Math.ceil(totalKcal / 300) },
  };
  modes.ambitious.weeksLabel = Math.ceil(modes.ambitious.days / 7);
  modes.reasonable.weeksLabel = Math.ceil(modes.reasonable.days / 7);
  modes.realistic.weeksLabel = Math.ceil(modes.realistic.days / 7);
  var selectedKey = ['ambitious', 'reasonable', 'realistic'][data.paceMode];
  var delta = modes[selectedKey].dailyDelta;
  var dailyTarget = data.goal === 'lose' ? tdee - delta : data.goal === 'gain' ? tdee + delta : tdee;
  var ratios = data.goal === 'lose' ? { protein: 0.40, carbs: 0.30, fat: 0.30 }
    : data.goal === 'gain' ? { protein: 0.30, carbs: 0.50, fat: 0.20 }
    : { protein: 0.30, carbs: 0.45, fat: 0.25 };
  var macros = {
    protein: Math.round((dailyTarget * ratios.protein) / 4),
    carbs: Math.round((dailyTarget * ratios.carbs) / 4),
    fat: Math.round((dailyTarget * ratios.fat) / 9),
  };
  return { bmr: bmr, tdee: tdee, dailyTarget: dailyTarget, modes: modes, macros: macros };
}

var ACTIVITY_LABELS_DB = ['sedentary', 'light', 'moderate', 'active', 'extreme'];

function generateLixTag() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var tag = 'LXM-';
  for (var i = 0; i < 6; i++) tag += chars.charAt(Math.floor(Math.random() * chars.length));
  return tag;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidFullName(name) {
  var parts = name.trim().split(/\s+/);
  return parts.length >= 2 && parts.every(function(p) { return p.length >= 2; });
}

function getPasswordStrength(pass) {
  if (!pass || pass.length === 0) return { level: 0, label: '', color: 'transparent', width: 0 };
  var score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 8) score++;
  if (pass.length >= 10) score++;
  if (pass.length >= 12) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 2) return { level: 1, label: 'Tr\u00e8s faible', labelEn: 'Very weak', color: '#FF4D4D', width: 20 };
  if (score <= 3) return { level: 2, label: 'Faible', labelEn: 'Weak', color: '#FF8C42', width: 40 };
  if (score <= 4) return { level: 3, label: 'Moyen', labelEn: 'Medium', color: '#FFD93D', width: 60 };
  if (score <= 6) return { level: 4, label: 'Fort', labelEn: 'Strong', color: '#00BFA6', width: 80 };
  return { level: 5, label: 'Tr\u00e8s fort', labelEn: 'Very strong', color: '#00D984', width: 100 };
}

export {
  W, H, SWIPE_THRESHOLD,
  C,
  SUPABASE_URL, SUPABASE_ANON_KEY,
  texts,
  ACTIVITY_MULTIPLIERS, calculateGoals,
  ACTIVITY_LABELS_DB,
  generateLixTag, isValidEmail, isValidFullName, getPasswordStrength,
};
