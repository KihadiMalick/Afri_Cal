import { Dimensions, PixelRatio } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';

var SCREEN_WIDTH = Dimensions.get('window').width;
var W = SCREEN_WIDTH;
var BASE_WIDTH = 320;
var wp = function(size) { return (W / BASE_WIDTH) * size; };
var fp = function(size) { return Math.round(PixelRatio.roundToNearestPixel((W / BASE_WIDTH) * size)); };

var CONNECTORS = [
  { id: 'apple_health', name: 'Apple Health', emoji: '\uD83C\uDF4E', color: '#FF3B30',
    dataFr: 'Pas \u00b7 Cardio \u00b7 Sommeil \u00b7 Activit\u00e9s', dataEn: 'Steps \u00b7 Heart rate \u00b7 Sleep \u00b7 Activities' },
  { id: 'samsung_health', name: 'Samsung Health', emoji: '\uD83D\uDC99', color: '#1428A0',
    dataFr: 'Pas \u00b7 Cardio \u00b7 Sommeil \u00b7 Activit\u00e9s', dataEn: 'Steps \u00b7 Heart rate \u00b7 Sleep \u00b7 Activities' },
  { id: 'fitbit', name: 'Fitbit', emoji: '\u231A', color: '#00B0B9',
    dataFr: 'Pas \u00b7 Sommeil \u00b7 Cardio', dataEn: 'Steps \u00b7 Sleep \u00b7 Heart rate' },
  { id: 'strava', name: 'Strava', emoji: '\uD83C\uDFC3', color: '#FC4C02',
    dataFr: 'Course \u00b7 V\u00e9lo \u00b7 Distance \u00b7 GPS', dataEn: 'Running \u00b7 Cycling \u00b7 Distance \u00b7 GPS' },
];

var ACTIVITY_MULTIPLIERS_MAP = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extreme: 1.9,
};

var ACTIVITY_LEVEL_KEYS = ['sedentary', 'light', 'moderate', 'active', 'extreme'];

function activityLevelToIndex(level) {
  var idx = ACTIVITY_LEVEL_KEYS.indexOf(level);
  return idx >= 0 ? idx : 2;
}

function activityIndexToKey(index) {
  return ACTIVITY_LEVEL_KEYS[index] || 'moderate';
}

function calculateBMR(weight, height, age, gender) {
  if (!weight || !height || !age) return 0;
  var w = parseFloat(weight) || 70;
  var h = parseFloat(height) || 175;
  var a = parseInt(age) || 25;
  if (gender === 'female') {
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }
  return Math.round(10 * w + 6.25 * h - 5 * a + 5);
}

function calculateTDEE(bmr, activityLevel) {
  var mult = ACTIVITY_MULTIPLIERS_MAP[activityLevel] || 1.55;
  return Math.round(bmr * mult);
}

function calculateDailyTarget(tdee, goal, targetWeightLoss, targetMonths) {
  if (goal === 'maintain' || !goal) return tdee;
  var totalKcal = (targetWeightLoss || 5) * 7700;
  var days = Math.max(30, (targetMonths || 3) * 30);
  var dailyDelta = Math.min(1000, Math.round(totalKcal / days));
  if (goal === 'lose') return tdee - dailyDelta;
  if (goal === 'gain') return tdee + dailyDelta;
  return tdee;
}

var XP_MILESTONES = [
  { level: 10,  lix: 500,    energy: 20,  reward: '1 Carte Rare',          rewardEn: '1 Rare Card',          emoji: '\uD83E\uDD48', color: '#A0A8B8' },
  { level: 25,  lix: 1500,   energy: 50,  reward: '1 Carte Elite',         rewardEn: '1 Elite Card',         emoji: '\uD83E\uDD47', color: '#F2C94C' },
  { level: 50,  lix: 5000,   energy: 100, reward: '1 Carte Mythique',      rewardEn: '1 Mythic Card',        emoji: '\uD83D\uDC8E', color: '#00D984' },
  { level: 75,  lix: 10000,  energy: 200, reward: '5 Fragments Mythique',  rewardEn: '5 Mythic Fragments',   emoji: '\u2728',       color: '#B080FF' },
  { level: 100, lix: 25000,  energy: 500, reward: 'Badge L\u00e9gendaire', rewardEn: 'Legendary Badge',      emoji: '\uD83D\uDC51', color: '#FF8C42' },
];

function getNextMilestone(currentLevel) {
  for (var i = 0; i < XP_MILESTONES.length; i++) {
    if (XP_MILESTONES[i].level > currentLevel) return XP_MILESTONES[i];
  }
  return null;
}

function getXPForLevel(level) {
  var total = 0;
  for (var n = 1; n < level; n++) {
    total += Math.round(30 + n * 50);
  }
  return total;
}

var XP_SOURCES = [
  { label: 'Scanner un repas',       labelEn: 'Scan a meal',              value: '+10 XP' },
  { label: 'Activit\u00e9 physique', labelEn: 'Physical activity',        value: '+kcal XP' },
  { label: 'Enregistrer ton mood',   labelEn: 'Log your mood',            value: '+5 XP' },
  { label: 'Hydratation atteinte',   labelEn: 'Hydration goal reached',   value: '+3 XP' },
  { label: '\u00c9change avec ALIXEN', labelEn: 'Chat with ALIXEN',       value: '+5 XP' },
  { label: 'Connexion quotidienne',  labelEn: 'Daily login',              value: '+10 XP' },
  { label: 'Streak 7 jours',         labelEn: '7-day streak',             value: '+50 XP' },
];

var ACTIVITY_LEVELS = [
  { label: 'S\u00e9dentaire', desc: 'Peu ou pas d\'exercice', emoji: '\uD83D\uDECB\uFE0F' },
  { label: 'L\u00e9g\u00e8rement actif', desc: '1-2 fois/semaine', emoji: '\uD83D\uDEB6\u200D\u2642\uFE0F' },
  { label: 'Mod\u00e9r\u00e9ment actif', desc: '3-5 fois/semaine', emoji: '\uD83D\uDEB4\u200D\u2642\uFE0F' },
  { label: 'Tr\u00e8s actif', desc: '6-7 fois/semaine', emoji: '\uD83C\uDFCB\uFE0F\u200D\u2642\uFE0F' },
  { label: 'Extr\u00eamement actif', desc: 'Athl\u00e8te / travail physique', emoji: '\uD83D\uDD25' },
];

var DIETS = [
  { key: 'classic', label: 'Classique', emoji: '\uD83C\uDF57', color: '#00D984' },
  { key: 'vegetarian', label: 'V\u00e9g\u00e9tarien', emoji: '\uD83E\uDD6C', color: '#00BFA6' },
  { key: 'vegan', label: 'V\u00e9gan', emoji: '\uD83C\uDF31', color: '#00D984' },
  { key: 'keto', label: 'K\u00e9to', emoji: '\uD83E\uDD51', color: '#D4AF37' },
  { key: 'halal', label: 'Halal', emoji: '\uD83C\uDF19', color: '#00BFA6' },
];

// GOALS centralise dans src/constants/GOALS.js (Ionicons + labels FR/EN).
// Re-export pour preserver les imports existants (ex: ProfilePage l.14).
import GOALS from '../../constants/GOALS';

var T = {
  fr: {
    personalData: 'DONN\u00c9ES PERSONNELLES', age: '\u00c2ge', weight: 'Poids', height: 'Taille', bmi: 'IMC',
    years: 'ans', kg: 'kg', cm: 'cm', editProfile: 'Modifier mon profil',
    settings: 'PARAM\u00c8TRES', connectors: 'CONNECTEURS',
    location: 'Ma localisation', locationSub: 'Pour les recommandations ALIXEN',
    subscription: 'Mon abonnement', subscriptionSub: 'G\u00e9rer, changer ou r\u00e9silier',
    notifications: 'Notifications', notifSub: 'Rappels m\u00e9dicaments, analyses',
    learn: 'APPRENDRE', glossary: 'Comprendre les termes', glossarySub: 'BMR, TDEE, Macros, IMC...',
    guide: 'Guide LIXUM', guideSub: 'Toutes les fonctionnalit\u00e9s',
    legal: 'L\u00c9GAL & SUPPORT', privacy: 'Politique de confidentialit\u00e9', terms: 'Termes et conditions',
    contact: 'Nous contacter', rate: '\u00c9valuer LIXUM', logout: 'Se d\u00e9connecter',
    deleteAccount: 'Supprimer mon compte', logoutConfirm: 'Es-tu s\u00fbr ?',
    deleteConfirm: 'Action irr\u00e9versible.', cancel: 'Annuler', notDefined: 'Non d\u00e9finie',
    free: 'Gratuit', objective: 'Objectif', madeWith: 'Fait avec \u2764\uFE0F au Burundi',
    connected: 'Connect\u00e9', connect: 'Connecter', disconnect: 'D\u00e9connecter',
    comingSoon: 'Bient\u00f4t', lastSync: 'Derni\u00e8re sync',
    connectorsDesc: 'Synchronisez vos montres et apps de santé',
    deleteAccountTitle: 'Supprimer mon compte',
    deleteAccountWarning: '⚠ Cette action est irréversible. Toutes vos données (Nutrition, Activité, Santé, Social) seront définitivement supprimées après 30 jours. Vous pouvez changer d\'avis en vous reconnectant dans ce délai.',
    deleteReasonSectionTitle: 'Pourquoi partez-vous ? (optionnel)',
    deleteReasonNoLongerUse: 'Je n\'utilise plus l\'app',
    deleteReasonTooExpensive: 'Abonnement trop cher',
    deleteReasonTooComplex: 'App trop compliquée',
    deleteReasonBugs: 'Bugs / Problèmes techniques',
    deleteReasonPrivacy: 'Protection de ma vie privée',
    deleteReasonOther: 'Autre',
    deleteReasonOtherPlaceholder: 'Précisez votre raison...',
    deleteConfirmSectionTitle: 'Confirmation finale',
    deleteConfirmLabel: 'Tapez SUPPRIMER pour activer le bouton',
    deleteConfirmPlaceholder: 'SUPPRIMER',
    deleteConfirmButton: 'Supprimer définitivement',
    deleteConfirmCountdown: 'Appuyez dans {s}s...',
    deleteCancelButton: 'Annuler',
    deleteAdminBlocked: 'Les comptes administrateur ne peuvent pas être supprimés.',
    deleteGenericError: 'Erreur lors de la demande de suppression.',
    deleteSuccessScreenTitle: 'Compte programmé pour suppression',
    deleteSuccessScreenBody: 'Votre compte sera définitivement supprimé le {date}.\nVous pouvez changer d\'avis en vous reconnectant avant cette date.',
    deleteSuccessScreenHint: 'Un email de confirmation vous sera envoyé.',
    deleteSuccessScreenButton: 'J\'ai compris',
    restoreModalTitle: 'Votre compte est programmé pour suppression',
    restoreModalBody: 'Suppression prévue le {date}. Voulez-vous restaurer votre compte LIXUM ?',
    restoreDaysLeft: '{n} jours restants',
    restoreDayLeftSingular: '{n} jour restant',
    restoreConfirmButton: 'Restaurer mon compte',
    restoreRejectButton: 'Confirmer la suppression',
    restoreRejectDoubleConfirmTitle: 'Êtes-vous absolument certain ?',
    restoreRejectDoubleConfirmBody: 'Cette fois c\'est définitif. Votre compte sera supprimé le {date}. Vous ne pourrez plus le restaurer.',
    restoreRejectDoubleConfirmButton: 'Oui, supprimer définitivement',
    restoreRejectCancel: 'Non, je réfléchis',
    restoreSuccessTitle: 'Bienvenue à nouveau !',
    restoreSuccessBody: 'Votre compte a été restauré avec succès.',
    restoreGenericError: 'Erreur lors de la restauration. Réessayez.',
    restoreDaysLeftWarning: '{n} jours restants',
    restoreDaysLeftCritical: '{n} jours restants — urgent !',
    restoreCheckingAccount: 'Vérification du compte...',
    restoreInProgress: 'Restauration en cours...',
    restoreAlmostReady: 'Presque prêt...',
    bannerDeletionPending: '⏱ Compte programmé pour suppression dans {days} jours',
    bannerDeletionPendingUrgent: '⚠ Compte sera supprimé dans {days} jour(s) — Restaurer maintenant',
    bannerRestoreLink: 'Restaurer',
    editProfileTitle: 'Modifier mon profil',
    editProfileSubtitle: 'Vos donnees sont privees et chiffrees',
    editProfileSectionIdentity: 'IDENTITE',
    editProfileSectionBody: 'CORPS',
    editProfileSectionLocation: 'LOCALISATION',
    editProfileLabelName: 'Comment vous appeler',
    editProfileCaptionName: 'Visible uniquement par vous',
    editProfileLabelAge: 'Age',
    editProfileLabelWeight: 'Poids',
    editProfileLabelHeight: 'Taille',
    editProfileLabelCity: 'Ville',
    editProfilePlaceholderName: 'Votre prenom',
    editProfilePlaceholderCity: 'Votre ville',
    editProfileImcLabel: 'IMC',
    editProfileImcUnderweight: 'Maigreur',
    editProfileImcNormal: 'Normal',
    editProfileImcOverweight: 'Surpoids',
    editProfileImcObese: 'Obesite',
    editProfileCancelButton: 'Annuler',
    editProfileSaveButton: 'Enregistrer',
    editProfileSaveSuccess: 'Profil mis a jour',
    editProfileSaveError: 'Erreur de sauvegarde',
    editProfileNameEmpty: 'Le prenom est requis',
    editProfileTabPersonal: 'Infos perso',
    editProfileTabGoals: 'Objectifs',
    editProfileSectionGoal: 'OBJECTIF',
    editProfileGoalCaption: 'Votre objectif principal determine vos recommandations',
  },
  en: {
    personalData: 'PERSONAL DATA', age: 'Age', weight: 'Weight', height: 'Height', bmi: 'BMI',
    years: 'yrs', kg: 'kg', cm: 'cm', editProfile: 'Edit my profile',
    settings: 'SETTINGS', connectors: 'CONNECTORS',
    location: 'My location', locationSub: 'For ALIXEN recommendations',
    subscription: 'My subscription', subscriptionSub: 'Manage, change or cancel',
    notifications: 'Notifications', notifSub: 'Medication, test reminders',
    learn: 'LEARN', glossary: 'Understand the terms', glossarySub: 'BMR, TDEE, Macros, BMI...',
    guide: 'LIXUM Guide', guideSub: 'All features',
    legal: 'LEGAL & SUPPORT', privacy: 'Privacy policy', terms: 'Terms and conditions',
    contact: 'Contact us', rate: 'Rate LIXUM', logout: 'Log out',
    deleteAccount: 'Delete my account', logoutConfirm: 'Are you sure?',
    deleteConfirm: 'This action is irreversible.', cancel: 'Cancel', notDefined: 'Not set',
    free: 'Free', objective: 'Goal', madeWith: 'Made with \u2764\uFE0F in Burundi',
    connected: 'Connected', connect: 'Connect', disconnect: 'Disconnect',
    comingSoon: 'Soon', lastSync: 'Last sync', syncNow: 'Sync',
    connectorsDesc: 'Sync your watches and health apps',
    deleteAccountTitle: 'Delete my account',
    deleteAccountWarning: '⚠ This action is irreversible. All your data (Nutrition, Activity, Health, Social) will be permanently deleted after 30 days. You can change your mind by logging back in before then.',
    deleteReasonSectionTitle: 'Why are you leaving? (optional)',
    deleteReasonNoLongerUse: 'I no longer use the app',
    deleteReasonTooExpensive: 'Subscription too expensive',
    deleteReasonTooComplex: 'App too complicated',
    deleteReasonBugs: 'Bugs / Technical issues',
    deleteReasonPrivacy: 'Privacy protection',
    deleteReasonOther: 'Other',
    deleteReasonOtherPlaceholder: 'Please specify...',
    deleteConfirmSectionTitle: 'Final confirmation',
    deleteConfirmLabel: 'Type DELETE to enable the button',
    deleteConfirmPlaceholder: 'DELETE',
    deleteConfirmButton: 'Delete permanently',
    deleteConfirmCountdown: 'Press in {s}s...',
    deleteCancelButton: 'Cancel',
    deleteAdminBlocked: 'Administrator accounts cannot be deleted.',
    deleteGenericError: 'Error requesting deletion.',
    deleteSuccessScreenTitle: 'Account scheduled for deletion',
    deleteSuccessScreenBody: 'Your account will be permanently deleted on {date}.\nYou can change your mind by logging back in before then.',
    deleteSuccessScreenHint: 'A confirmation email will be sent to you.',
    deleteSuccessScreenButton: 'I understand',
    restoreModalTitle: 'Your account is scheduled for deletion',
    restoreModalBody: 'Deletion scheduled for {date}. Would you like to restore your LIXUM account?',
    restoreDaysLeft: '{n} days left',
    restoreDayLeftSingular: '{n} day left',
    restoreConfirmButton: 'Restore my account',
    restoreRejectButton: 'Confirm deletion',
    restoreRejectDoubleConfirmTitle: 'Are you absolutely sure?',
    restoreRejectDoubleConfirmBody: 'This time it\'s final. Your account will be deleted on {date}. You won\'t be able to restore it.',
    restoreRejectDoubleConfirmButton: 'Yes, delete permanently',
    restoreRejectCancel: 'No, let me think',
    restoreSuccessTitle: 'Welcome back!',
    restoreSuccessBody: 'Your account has been successfully restored.',
    restoreGenericError: 'Error restoring account. Try again.',
    restoreDaysLeftWarning: '{n} days left',
    restoreDaysLeftCritical: '{n} days left — urgent!',
    restoreCheckingAccount: 'Checking account...',
    restoreInProgress: 'Restoring your account...',
    restoreAlmostReady: 'Almost ready...',
    bannerDeletionPending: '⏱ Account scheduled for deletion in {days} days',
    bannerDeletionPendingUrgent: '⚠ Account will be deleted in {days} day(s) — Restore now',
    bannerRestoreLink: 'Restore',
    editProfileTitle: 'Edit my profile',
    editProfileSubtitle: 'Your data is private and encrypted',
    editProfileSectionIdentity: 'IDENTITY',
    editProfileSectionBody: 'BODY',
    editProfileSectionLocation: 'LOCATION',
    editProfileLabelName: 'How should we call you',
    editProfileCaptionName: 'Visible only by you',
    editProfileLabelAge: 'Age',
    editProfileLabelWeight: 'Weight',
    editProfileLabelHeight: 'Height',
    editProfileLabelCity: 'City',
    editProfilePlaceholderName: 'Your first name',
    editProfilePlaceholderCity: 'Your city',
    editProfileImcLabel: 'BMI',
    editProfileImcUnderweight: 'Underweight',
    editProfileImcNormal: 'Normal',
    editProfileImcOverweight: 'Overweight',
    editProfileImcObese: 'Obesity',
    editProfileCancelButton: 'Cancel',
    editProfileSaveButton: 'Save',
    editProfileSaveSuccess: 'Profile updated',
    editProfileSaveError: 'Save error',
    editProfileNameEmpty: 'First name is required',
    editProfileTabPersonal: 'Personal info',
    editProfileTabGoals: 'Goals',
    editProfileSectionGoal: 'GOAL',
    editProfileGoalCaption: 'Your main goal determines your recommendations',
  },
};

function getCharEmoji(slug) {
  var map = { 'emerald_owl': '\uD83E\uDD89', 'hawk_eye': '\uD83E\uDD85', 'ruby_tiger': '\uD83D\uDC2F', 'amber_fox': '\uD83E\uDD8A', 'gipsy': '\uD83D\uDD77\uFE0F' };
  return map[slug] || null;
}

export {
  W, wp, fp,
  SUPABASE_URL, SUPABASE_ANON_KEY,
  CONNECTORS,
  ACTIVITY_MULTIPLIERS_MAP, ACTIVITY_LEVEL_KEYS,
  activityLevelToIndex, activityIndexToKey,
  calculateBMR, calculateTDEE, calculateDailyTarget,
  XP_MILESTONES, XP_SOURCES, getNextMilestone, getXPForLevel,
  ACTIVITY_LEVELS, DIETS, GOALS,
  T,
  getCharEmoji,
};
