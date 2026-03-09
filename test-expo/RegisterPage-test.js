// LIXUM - Register Page (Multi-Phase Wizard) v3.0 — Premium 7 Phases
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que WelcomePage-test.js

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle as SvgCircle, Line, Rect } from 'react-native-svg';

var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;

// ============================================================
// COULEURS
// ============================================================

var C = {
  bgDeep: '#0D1117',
  bgPrimary: '#1A2030',
  bgCard: '#151B23',
  bgInput: '#0A0E14',
  metalBorder: '#3E4855',
  metalShine: '#6B7B8D',
  emerald: '#00D984',
  emeraldDark: '#00A866',
  turquoise: '#00BFA6',
  gold: '#D4AF37',
  textPrimary: '#EAEEF3',
  textSecondary: '#8892A0',
  textMuted: '#555E6C',
  error: '#FF4D4D',
};

// ============================================================
// TRADUCTIONS — 7 PHASES
// ============================================================

var texts = {
  fr: {
    stepNames: ['Identit\u00e9', 'Corps', 'Activit\u00e9', 'R\u00e9gime', 'Objectif', 'Macros', 'Bonus'],
    stepDescs: ['Vos informations', 'Votre corps', 'Votre niveau', 'Alimentation', 'Votre parcours', 'Vos macros', 'Gamification'],
    // Phase 1
    p1Title: 'Cr\u00e9er votre compte',
    p1Subtitle: 'Vos informations personnelles',
    identityLabel: 'IDENTIT\u00c9',
    emailLabel: 'EMAIL',
    securityLabel: 'S\u00c9CURIT\u00c9',
    fullName: 'Nom complet',
    fullNamePlaceholder: 'Pr\u00e9nom et Nom',
    email: 'Email',
    emailConfirm: 'Confirmer l\'email',
    password: 'Mot de passe',
    passwordConfirm: 'Confirmer le mot de passe',
    emailMatch: 'Les emails correspondent \u2713',
    emailNoMatch: 'Les emails ne correspondent pas',
    passRules: 'Minimum 8 caract\u00e8res',
    // Phase 2
    p2Title: 'Votre corps',
    p2Subtitle: 'Scrollez pour s\u00e9lectionner',
    weightLabel: 'POIDS',
    heightLabel: 'TAILLE',
    ageLabel: '\u00c2GE',
    genderLabel: 'SEXE',
    male: 'Homme',
    female: 'Femme',
    metric: 'M\u00e9trique',
    imperial: 'Imp\u00e9rial',
    kg: 'kg',
    lb: 'lb',
    cm: 'cm',
    inUnit: 'in',
    years: 'ans',
    // Phase 3
    p3Title: 'Votre activit\u00e9',
    p3Subtitle: 'S\u00e9lectionnez votre niveau habituel',
    activityLevels: [
      { label: 'S\u00e9dentaire', desc: 'Peu ou pas d\'exercice', icon: 'bed-outline', emoji: '\uD83D\uDECB\uFE0F' },
      { label: 'L\u00e9g\u00e8rement actif', desc: '1-2 fois/semaine', icon: 'walk-outline', emoji: '\uD83D\uDEB6' },
      { label: 'Mod\u00e9r\u00e9ment actif', desc: '3-5 fois/semaine', icon: 'bicycle-outline', emoji: '\uD83D\uDEB4' },
      { label: 'Tr\u00e8s actif', desc: '6-7 fois/semaine', icon: 'barbell-outline', emoji: '\uD83D\uDCAA' },
      { label: 'Extr\u00eamement actif', desc: 'Athl\u00e8te / travail physique', icon: 'flame-outline', emoji: '\uD83D\uDD25' },
    ],
    // Phase 4
    p4Title: 'Votre r\u00e9gime',
    p4Subtitle: 'Pour des recommandations cibl\u00e9es',
    diets: [
      { key: 'classic', label: 'Classique', desc: 'Aucune restriction alimentaire', icon: '\uD83C\uDF57', detail: 'Tous les groupes alimentaires' },
      { key: 'pescatarian', label: 'Pescatarien', desc: 'Poisson mais pas de viande', icon: '\uD83D\uDC1F', detail: 'Riche en om\u00e9ga-3 et prot\u00e9ines marines' },
      { key: 'vegetarian', label: 'V\u00e9g\u00e9tarien', desc: 'Pas de viande ni poisson', icon: '\uD83E\uDD6C', detail: 'Produits laitiers et \u0153ufs autoris\u00e9s' },
      { key: 'vegan', label: 'V\u00e9gan', desc: 'Aucun produit animal', icon: '\uD83C\uDF31', detail: 'Prot\u00e9ines v\u00e9g\u00e9tales uniquement' },
      { key: 'keto', label: 'C\u00e9tog\u00e8ne', desc: 'Faible en glucides, riche en graisses', icon: '\uD83E\uDD51', detail: 'Force le corps \u00e0 br\u00fbler les graisses' },
    ],
    // Phase 5
    p5Title: 'Votre objectif',
    p5Subtitle: 'Personnalisez votre parcours',
    goals: [
      { key: 'lose', label: 'Perte de poids', icon: 'trending-down-outline', color: '#00BFA6' },
      { key: 'maintain', label: 'Maintien', icon: 'swap-horizontal-outline', color: '#00D984' },
      { key: 'gain', label: 'Prise de masse', icon: 'trending-up-outline', color: '#D4AF37' },
    ],
    kgLabel: function (goal) { return 'KG \u00c0 ' + (goal === 'lose' ? 'PERDRE' : 'GAGNER'); },
    yourPace: 'Votre rythme',
    paceLabels: ['Ambitieux', 'Raisonnable', 'R\u00e9aliste'],
    yourPlan: 'VOTRE PLAN',
    dailyGoal: function (cal) { return 'Objectif : ' + cal + ' kcal / jour'; },
    bmrTdee: function (bmr, tdee) { return 'BMR : ' + bmr + ' \u00B7 TDEE : ' + tdee; },
    protein: 'Prot\u00e9ines',
    carbs: 'Glucides',
    fat: 'Lipides',
    gUnit: 'g',
    weeks: 'semaines',
    // Phase 6
    p6Title: 'Saviez-vous que ?',
    p6Subtitle: 'Comprendre votre tableau de bord',
    slides: function (calc) {
      return [
        { icon: 'flame-outline', color: '#D4AF37', title: 'BMR', subtitle: 'M\u00e9tabolisme de Base', value: calc.bmr + ' kcal', type: 'bmr', explanation: 'C\'est l\'\u00e9nergie minimale que votre corps br\u00fble au repos pour maintenir ses fonctions vitales : respiration, circulation sanguine, r\u00e9gulation de la temp\u00e9rature.', funFact: 'Votre cerveau seul consomme environ 20% de votre BMR.' },
        { icon: 'flash-outline', color: '#00D984', title: 'TDEE', subtitle: 'D\u00e9pense \u00c9nerg\u00e9tique Totale', value: calc.tdee + ' kcal', type: 'tdee', explanation: 'C\'est votre BMR + les calories br\u00fbl\u00e9es par votre activit\u00e9 physique quotidienne. C\'est LE chiffre cl\u00e9 : mangez moins \u2192 perte. Mangez plus \u2192 prise.', funFact: 'Une heure de marche rapide br\u00fble environ 300 kcal.' },
        { icon: 'fish-outline', color: '#00BFA6', title: 'Prot\u00e9ines', subtitle: 'Les b\u00e2tisseurs du corps', value: calc.macros.protein + 'g / jour', type: 'protein', explanation: 'Les prot\u00e9ines r\u00e9parent vos muscles, renforcent votre syst\u00e8me immunitaire et vous gardent rassasi\u00e9 plus longtemps. 1g = 4 kcal.', funFact: 'Vos cheveux, ongles et peau sont principalement faits de prot\u00e9ines.' },
        { icon: 'leaf-outline', color: '#00D984', title: 'Glucides', subtitle: 'Le carburant de l\'\u00e9nergie', value: calc.macros.carbs + 'g / jour', type: 'carbs', explanation: 'Les glucides sont la source d\'\u00e9nergie pr\u00e9f\u00e9r\u00e9e de votre cerveau et de vos muscles. Ils ne sont pas l\'ennemi \u2014 c\'est l\'exc\u00e8s qui l\'est. 1g = 4 kcal.', funFact: 'Votre cerveau consomme environ 120g de glucides par jour.' },
        { icon: 'water-outline', color: '#D4AF37', title: 'Lipides', subtitle: 'Les r\u00e9serves essentielles', value: calc.macros.fat + 'g / jour', type: 'fat', explanation: 'Les lipides prot\u00e8gent vos organes, transportent les vitamines et produisent vos hormones. Tr\u00e8s denses en \u00e9nergie : 1g = 9 kcal.', funFact: '60% de votre cerveau est compos\u00e9 de graisses.' },
      ];
    },
    // Phase 7
    p7Title: 'Caract\u00e8res LIXUM',
    p7Subtitle: 'Collectez des cartes, d\u00e9bloquez des pouvoirs',
    howItWorks: 'COMMENT \u00c7A MARCHE',
    howItWorksText: '\uD83C\uDFA1 Tournez la roue chaque jour\n\uD83D\uDC8E Gagnez des LX Gems et des cartes\n\uD83C\uDCCF Chaque carte d\u00e9bloque un pouvoir unique\n\uD83D\uDD04 Transf\u00e9rez vos cartes \u00e0 d\'autres membres',
    charactersFooter: '12 caract\u00e8res \u00e0 d\u00e9couvrir \u00B7 3 niveaux de raret\u00e9',
    firstSpin: '\uD83C\uDFA1 Votre premi\u00e8re roue vous attend !',
    teaserCards: [
      { name: 'GOLD CHICKEN', animal: '\uD83D\uDC14', level: 'STANDARD', power: 'Recettes personnalis\u00e9es', duration: '7j' },
      { name: 'RUBY TIGER', animal: '\uD83D\uDC2F', level: 'RARE', power: 'Recettes + Sport combin\u00e9s', duration: '14j' },
      { name: 'LICORNUM', animal: '\uD83E\uDD84', level: '\u00c9LITE', power: 'TOUT Premium', duration: '30j' },
    ],
    // Nav
    next: 'Suivant',
    createAccount: 'Cr\u00e9er mon compte',
  },
  en: {
    stepNames: ['Identity', 'Body', 'Activity', 'Diet', 'Goal', 'Macros', 'Bonus'],
    stepDescs: ['Your info', 'Your body', 'Your level', 'Nutrition', 'Your journey', 'Your macros', 'Gamification'],
    p1Title: 'Create your account',
    p1Subtitle: 'Your personal information',
    identityLabel: 'IDENTITY',
    emailLabel: 'EMAIL',
    securityLabel: 'SECURITY',
    fullName: 'Full name',
    fullNamePlaceholder: 'First and Last name',
    email: 'Email',
    emailConfirm: 'Confirm email',
    password: 'Password',
    passwordConfirm: 'Confirm password',
    emailMatch: 'Emails match \u2713',
    emailNoMatch: 'Emails do not match',
    passRules: 'Minimum 8 characters',
    p2Title: 'Your body',
    p2Subtitle: 'Scroll to select',
    weightLabel: 'WEIGHT',
    heightLabel: 'HEIGHT',
    ageLabel: 'AGE',
    genderLabel: 'GENDER',
    male: 'Male',
    female: 'Female',
    metric: 'Metric',
    imperial: 'Imperial',
    kg: 'kg',
    lb: 'lb',
    cm: 'cm',
    inUnit: 'in',
    years: 'y',
    p3Title: 'Your activity',
    p3Subtitle: 'Select your usual level',
    activityLevels: [
      { label: 'Sedentary', desc: 'Little or no exercise', icon: 'bed-outline', emoji: '\uD83D\uDECB\uFE0F' },
      { label: 'Lightly active', desc: '1-2 times/week', icon: 'walk-outline', emoji: '\uD83D\uDEB6' },
      { label: 'Moderately active', desc: '3-5 times/week', icon: 'bicycle-outline', emoji: '\uD83D\uDEB4' },
      { label: 'Very active', desc: '6-7 times/week', icon: 'barbell-outline', emoji: '\uD83D\uDCAA' },
      { label: 'Extremely active', desc: 'Athlete / physical job', icon: 'flame-outline', emoji: '\uD83D\uDD25' },
    ],
    p4Title: 'Your diet',
    p4Subtitle: 'For targeted recommendations',
    diets: [
      { key: 'classic', label: 'Classic', desc: 'No dietary restrictions', icon: '\uD83C\uDF57', detail: 'All food groups' },
      { key: 'pescatarian', label: 'Pescatarian', desc: 'Fish but no meat', icon: '\uD83D\uDC1F', detail: 'Rich in omega-3' },
      { key: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish', icon: '\uD83E\uDD6C', detail: 'Dairy and eggs allowed' },
      { key: 'vegan', label: 'Vegan', desc: 'No animal products', icon: '\uD83C\uDF31', detail: 'Plant-based proteins only' },
      { key: 'keto', label: 'Ketogenic', desc: 'Low carb, high fat', icon: '\uD83E\uDD51', detail: 'Forces body to burn fat' },
    ],
    p5Title: 'Your goal',
    p5Subtitle: 'Customize your journey',
    goals: [
      { key: 'lose', label: 'Weight loss', icon: 'trending-down-outline', color: '#00BFA6' },
      { key: 'maintain', label: 'Stay fit', icon: 'swap-horizontal-outline', color: '#00D984' },
      { key: 'gain', label: 'Weight gain', icon: 'trending-up-outline', color: '#D4AF37' },
    ],
    kgLabel: function (goal) { return 'KG TO ' + (goal === 'lose' ? 'LOSE' : 'GAIN'); },
    yourPace: 'Your pace',
    paceLabels: ['Ambitious', 'Reasonable', 'Realistic'],
    yourPlan: 'YOUR PLAN',
    dailyGoal: function (cal) { return 'Goal: ' + cal + ' kcal / day'; },
    bmrTdee: function (bmr, tdee) { return 'BMR: ' + bmr + ' \u00B7 TDEE: ' + tdee; },
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    gUnit: 'g',
    weeks: 'weeks',
    p6Title: 'Did you know?',
    p6Subtitle: 'Understanding your dashboard',
    slides: function (calc) {
      return [
        { icon: 'flame-outline', color: '#D4AF37', title: 'BMR', subtitle: 'Basal Metabolic Rate', value: calc.bmr + ' kcal', type: 'bmr', explanation: 'The minimum energy your body burns at rest to maintain vital functions: breathing, blood flow, temperature regulation.', funFact: 'Your brain alone uses about 20% of your BMR.' },
        { icon: 'flash-outline', color: '#00D984', title: 'TDEE', subtitle: 'Total Daily Energy Expenditure', value: calc.tdee + ' kcal', type: 'tdee', explanation: 'Your BMR + calories burned through daily physical activity. THE key number: eat less \u2192 lose. Eat more \u2192 gain.', funFact: 'One hour of brisk walking burns about 300 kcal.' },
        { icon: 'fish-outline', color: '#00BFA6', title: 'Protein', subtitle: 'The body builders', value: calc.macros.protein + 'g / day', type: 'protein', explanation: 'Proteins repair muscles, strengthen your immune system, and keep you full longer. 1g = 4 kcal.', funFact: 'Your hair, nails and skin are mainly made of proteins.' },
        { icon: 'leaf-outline', color: '#00D984', title: 'Carbs', subtitle: 'The energy fuel', value: calc.macros.carbs + 'g / day', type: 'carbs', explanation: 'Carbs are the preferred energy source for your brain and muscles. They\'re not the enemy \u2014 excess is. 1g = 4 kcal.', funFact: 'Your brain uses about 120g of carbs per day.' },
        { icon: 'water-outline', color: '#D4AF37', title: 'Fats', subtitle: 'Essential reserves', value: calc.macros.fat + 'g / day', type: 'fat', explanation: 'Fats protect organs, transport vitamins, and produce hormones. Very energy-dense: 1g = 9 kcal.', funFact: '60% of your brain is made of fat.' },
      ];
    },
    p7Title: 'LIXUM Characters',
    p7Subtitle: 'Collect cards, unlock powers',
    howItWorks: 'HOW IT WORKS',
    howItWorksText: '\uD83C\uDFA1 Spin the wheel daily\n\uD83D\uDC8E Earn LX Gems and cards\n\uD83C\uDCCF Each card unlocks a unique power\n\uD83D\uDD04 Transfer cards to other members',
    charactersFooter: '12 characters to discover \u00B7 3 rarity levels',
    firstSpin: '\uD83C\uDFA1 Your first spin awaits!',
    teaserCards: [
      { name: 'GOLD CHICKEN', animal: '\uD83D\uDC14', level: 'STANDARD', power: 'Custom recipes', duration: '7d' },
      { name: 'RUBY TIGER', animal: '\uD83D\uDC2F', level: 'RARE', power: 'Recipes + Sport combined', duration: '14d' },
      { name: 'LICORNUM', animal: '\uD83E\uDD84', level: 'ELITE', power: 'ALL Premium', duration: '30d' },
    ],
    next: 'Next',
    createAccount: 'Create my account',
  },
};

// ============================================================
// LOGIQUE DE CALCUL — Mifflin-St Jeor + TDEE
// ============================================================

var ACTIVITY_MULTIPLIERS = [1.2, 1.375, 1.55, 1.725, 1.9];

function calculateGoals(data) {
  var w = parseFloat(data.weight) || 70;
  var h = parseFloat(data.height) || 175;
  var a = parseFloat(data.age) || 25;
  var actMult = ACTIVITY_MULTIPLIERS[data.activityLevel];

  var bmr = data.gender === 'male'
    ? Math.round(10 * w + 6.25 * h - 5 * a + 5)
    : Math.round(10 * w + 6.25 * h - 5 * a - 161);

  var tdee = Math.round(bmr * actMult);
  var targetKg = data.targetKg || 5;
  var totalKcalNeeded = targetKg * 7700;

  var modes = {
    ambitious: { dailyDelta: Math.min(1000, Math.round(totalKcalNeeded / (data.timelineDays || 90))), days: Math.max(Math.ceil(totalKcalNeeded / 1000), 14) },
    reasonable: { dailyDelta: 500, days: Math.ceil(totalKcalNeeded / 500) },
    realistic: { dailyDelta: 300, days: Math.ceil(totalKcalNeeded / 300) },
  };
  modes.ambitious.weeksLabel = Math.ceil(modes.ambitious.days / 7);
  modes.reasonable.weeksLabel = Math.ceil(modes.reasonable.days / 7);
  modes.realistic.weeksLabel = Math.ceil(modes.realistic.days / 7);

  var selectedModeKey = ['ambitious', 'reasonable', 'realistic'][data.paceMode];
  var delta = modes[selectedModeKey].dailyDelta;

  var dailyTarget = data.goal === 'lose' ? tdee - delta : data.goal === 'gain' ? tdee + delta : tdee;

  var macroRatios = data.goal === 'lose'
    ? { protein: 0.40, carbs: 0.30, fat: 0.30 }
    : data.goal === 'gain'
      ? { protein: 0.30, carbs: 0.50, fat: 0.20 }
      : { protein: 0.30, carbs: 0.45, fat: 0.25 };

  var macros = {
    protein: Math.round((dailyTarget * macroRatios.protein) / 4),
    carbs: Math.round((dailyTarget * macroRatios.carbs) / 4),
    fat: Math.round((dailyTarget * macroRatios.fat) / 9),
  };

  return { bmr: bmr, tdee: tdee, dailyTarget: dailyTarget, modes: modes, macros: macros };
}

// ============================================================
// CIRCUIT PATTERN
// ============================================================

function CircuitPattern(props) {
  var w = props.width; var h = props.height;
  var color = props.color || 'rgba(0, 217, 132, 0.06)';
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Line x1="20" y1={h * 0.15} x2={w * 0.35} y2={h * 0.15} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w * 0.35} cy={h * 0.15} r="2" fill={color} />
      <Line x1={w * 0.65} y1={h * 0.12} x2={w - 20} y2={h * 0.12} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w * 0.65} cy={h * 0.12} r="2" fill={color} />
      <Line x1="15" y1={h * 0.50} x2={w * 0.20} y2={h * 0.60} stroke={color} strokeWidth="0.8" />
      <Rect x={w * 0.20 - 3} y={h * 0.60 - 3} width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.8" />
      <Line x1={w * 0.70} y1={h * 0.75} x2={w - 15} y2={h * 0.75} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w * 0.50} cy={h * 0.30} r="1" fill={color} />
      <SvgCircle cx={w * 0.85} cy={h * 0.45} r="1" fill={color} />
    </Svg>
  );
}

// ============================================================
// CIRCULAR PROGRESS
// ============================================================

function CircularProgress(props) {
  var step = props.step; var total = props.total;
  var size = 44; var strokeWidth = 3;
  var radius = (size - strokeWidth) / 2;
  var circumference = 2 * Math.PI * radius;
  var progress = (step / total) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <SvgCircle cx={size / 2} cy={size / 2} r={radius}
          stroke="rgba(62,72,85,0.3)" strokeWidth={strokeWidth} fill="none" />
        <SvgCircle cx={size / 2} cy={size / 2} r={radius}
          stroke={C.emerald} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round" />
      </Svg>
      <Text style={{ position: 'absolute', color: C.emerald, fontSize: 13, fontWeight: '800' }}>
        {step}/{total}
      </Text>
    </View>
  );
}

// ============================================================
// GLASS CARD
// ============================================================

function GlassCard(props) {
  return (
    <View style={[{
      borderRadius: 16, marginBottom: 14,
      borderWidth: 1.2,
      borderTopColor: 'rgba(138,146,160,0.2)',
      borderBottomColor: 'rgba(26,31,38,0.4)',
      borderLeftColor: 'rgba(107,123,141,0.12)',
      borderRightColor: 'rgba(42,48,59,0.25)',
      backgroundColor: C.bgCard,
      padding: 16,
    }, props.style]}>
      <View style={{
        position: 'absolute', top: 0, left: 14, right: 14,
        height: 1, backgroundColor: 'rgba(255,255,255,0.05)',
      }} />
      {props.sectionIcon ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Ionicons name={props.sectionIcon} size={14} color={C.emerald} />
          <Text style={{ color: C.emerald, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>
            {props.sectionLabel}
          </Text>
        </View>
      ) : null}
      {props.children}
    </View>
  );
}

// ============================================================
// PREMIUM INPUT — avec focus glow via useRef (no re-render)
// ============================================================

function PremiumInput(props) {
  var borderRef = useRef(null);

  var handleFocus = useCallback(function () {
    if (borderRef.current) {
      borderRef.current.setNativeProps({
        style: { borderColor: C.emerald, borderWidth: 1.5 },
      });
    }
  }, []);

  var handleBlur = useCallback(function () {
    if (borderRef.current) {
      borderRef.current.setNativeProps({
        style: { borderColor: C.metalBorder, borderWidth: 1 },
      });
    }
  }, []);

  return (
    <View style={{ marginBottom: props.noMargin ? 0 : 12 }}>
      {props.label ? <Text style={s.inputLabel}>{props.label}</Text> : null}
      <View ref={borderRef} style={[s.inputPremium, props.valid && s.inputValid]}>
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          style={s.inputText}
          placeholder={props.placeholder}
          placeholderTextColor={C.metalBorder}
          keyboardType={props.keyboardType}
          autoCapitalize={props.autoCapitalize}
          secureTextEntry={props.secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
    </View>
  );
}

// ============================================================
// SCROLL PICKER — vertical scroll avec effet de grossissement
// ============================================================

var ITEM_HEIGHT = 45;

function ScrollPicker(props) {
  var values = props.values;
  var selectedValue = props.selectedValue;
  var onSelect = props.onSelect;
  var unit = props.unit;
  var color = props.color || C.emerald;
  var height = props.height || 180;

  var flatListRef = useRef(null);
  var visibleItems = Math.floor(height / ITEM_HEIGHT);
  var paddingItems = Math.floor(visibleItems / 2);

  var paddedValues = [];
  var i;
  for (i = 0; i < paddingItems; i++) { paddedValues.push(null); }
  for (i = 0; i < values.length; i++) { paddedValues.push(values[i]); }
  for (i = 0; i < paddingItems; i++) { paddedValues.push(null); }

  var initialIndex = values.indexOf(selectedValue);
  if (initialIndex < 0) initialIndex = 0;
  initialIndex = initialIndex + paddingItems;

  var onMomentumScrollEnd = useCallback(function (event) {
    var idx = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (idx >= 0 && idx < values.length) {
      onSelect(values[idx]);
    }
  }, [values, onSelect]);

  var getItemLayout = useCallback(function (data, index) {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index: index };
  }, []);

  var renderItem = useCallback(function (info) {
    var item = info.item;
    if (item === null) return <View style={{ height: ITEM_HEIGHT }} />;
    var isSelected = item === selectedValue;
    return (
      <View style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{
          color: isSelected ? color : C.textMuted,
          fontSize: isSelected ? 28 : 18,
          fontWeight: isSelected ? '800' : '400',
          opacity: isSelected ? 1 : 0.5,
        }}>
          {item}{isSelected ? ' ' + unit : ''}
        </Text>
      </View>
    );
  }, [selectedValue, color, unit]);

  var keyExtractor = useCallback(function (item, idx) {
    return (item === null ? 'pad' : String(item)) + '-' + idx;
  }, []);

  return (
    <View style={{ height: height, overflow: 'hidden', position: 'relative' }}>
      {/* Ligne de selection au centre */}
      <View style={{
        position: 'absolute',
        top: height / 2 - ITEM_HEIGHT / 2,
        left: 0, right: 0,
        height: ITEM_HEIGHT,
        borderTopWidth: 1, borderBottomWidth: 1,
        borderColor: color + '30',
        backgroundColor: color + '08',
        borderRadius: 8,
        zIndex: 0,
      }} />

      {/* Degrade fondu en haut */}
      <LinearGradient
        colors={['#1A2232', 'rgba(26,34,50,0)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, zIndex: 2 }}
        pointerEvents="none"
      />

      {/* Degrade fondu en bas */}
      <LinearGradient
        colors={['rgba(26,34,50,0)', '#1A2232']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, zIndex: 2 }}
        pointerEvents="none"
      />

      <FlatList
        ref={flatListRef}
        data={paddedValues}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={initialIndex}
        getItemLayout={getItemLayout}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={renderItem}
      />
    </View>
  );
}

// ============================================================
// PHASE 1 — IDENTITE (Nom complet + Email + Securite)
// ============================================================

function Phase1Identity(props) {
  var formData = props.formData; var setFormData = props.setFormData; var t = props.t;
  var emailsMatch = formData.email && formData.email === formData.emailConfirm;
  var passwordsMatch = formData.password && formData.password === formData.passwordConfirm;

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      {/* Carte Identite */}
      <GlassCard sectionIcon="person-outline" sectionLabel={t.identityLabel}>
        <PremiumInput label={t.fullName} value={formData.fullName}
          onChangeText={function (v) { update('fullName', v); }}
          placeholder={t.fullNamePlaceholder} />
      </GlassCard>

      {/* Carte Email */}
      <GlassCard sectionIcon="mail-outline" sectionLabel={t.emailLabel}>
        <PremiumInput label={t.email} value={formData.email}
          onChangeText={function (v) { update('email', v); }}
          keyboardType="email-address" autoCapitalize="none" placeholder="email@example.com" />
        <PremiumInput label={t.emailConfirm} value={formData.emailConfirm}
          onChangeText={function (v) { update('emailConfirm', v); }}
          keyboardType="email-address" autoCapitalize="none"
          valid={emailsMatch} />
        {formData.emailConfirm !== '' ? (
          <Text style={{ color: emailsMatch ? C.emerald : C.error, fontSize: 11, marginTop: -6 }}>
            {emailsMatch ? t.emailMatch : t.emailNoMatch}
          </Text>
        ) : null}
      </GlassCard>

      {/* Carte Securite */}
      <GlassCard sectionIcon="lock-closed-outline" sectionLabel={t.securityLabel}>
        <PremiumInput label={t.password} value={formData.password}
          onChangeText={function (v) { update('password', v); }} secureTextEntry />
        <Text style={{ color: C.textMuted, fontSize: 10, marginTop: -6, marginBottom: 10 }}>{t.passRules}</Text>
        <PremiumInput label={t.passwordConfirm} value={formData.passwordConfirm}
          onChangeText={function (v) { update('passwordConfirm', v); }}
          secureTextEntry valid={passwordsMatch && formData.passwordConfirm !== ''} />
        {passwordsMatch && formData.passwordConfirm !== '' ? (
          <Text style={{ color: C.emerald, fontSize: 11, marginTop: -6 }}>{'\u2713'}</Text>
        ) : null}
      </GlassCard>
    </ScrollView>
  );
}

// ============================================================
// PHASE 2 — MORPHOLOGIE (Scroll Pickers + Metric/Imperial + Sexe)
// ============================================================

function Phase2Body(props) {
  var formData = props.formData; var setFormData = props.setFormData; var t = props.t;
  var unitSystem = props.unitSystem; var setUnitSystem = props.setUnitSystem;

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  // Generer les valeurs selon le systeme
  var weightValues = [];
  var heightValues = [];
  var ageValues = [];
  var wi, hi, ai;

  if (unitSystem === 'metric') {
    for (wi = 30; wi <= 200; wi++) { weightValues.push(wi); }
    for (hi = 120; hi <= 220; hi++) { heightValues.push(hi); }
  } else {
    for (wi = 66; wi <= 436; wi++) { weightValues.push(wi); }
    for (hi = 48; hi <= 96; hi++) { heightValues.push(hi); }
  }
  for (ai = 12; ai <= 94; ai++) { ageValues.push(ai); }

  var weightUnit = unitSystem === 'metric' ? t.kg : t.lb;
  var heightUnit = unitSystem === 'metric' ? t.cm : t.inUnit;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      {/* Icone phase */}
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <View style={s.phaseIcon}>
          <Ionicons name="body-outline" size={24} color={C.emerald} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{t.p2Title}</Text>
        <Text style={s.phaseSubtitle}>{t.p2Subtitle}</Text>
      </View>

      {/* Switch Metric/Imperial */}
      <View style={{
        flexDirection: 'row', alignSelf: 'center',
        borderRadius: 12, overflow: 'hidden',
        borderWidth: 1.2, borderColor: C.metalBorder,
        marginBottom: 20,
      }}>
        <TouchableOpacity onPress={function () { setUnitSystem('metric'); }}>
          {unitSystem === 'metric' ? (
            <LinearGradient colors={[C.emerald, C.emeraldDark]}
              style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ color: C.bgDeep, fontSize: 12, fontWeight: '800' }}>{t.metric}</Text>
            </LinearGradient>
          ) : (
            <View style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.bgInput }}>
              <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '600' }}>{t.metric}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={{ width: 1, backgroundColor: C.metalBorder }} />
        <TouchableOpacity onPress={function () { setUnitSystem('imperial'); }}>
          {unitSystem === 'imperial' ? (
            <LinearGradient colors={[C.emerald, C.emeraldDark]}
              style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
              <Text style={{ color: C.bgDeep, fontSize: 12, fontWeight: '800' }}>{t.imperial}</Text>
            </LinearGradient>
          ) : (
            <View style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.bgInput }}>
              <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '600' }}>{t.imperial}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 3 SCROLL PICKERS en ligne */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: 24, gap: 8,
      }}>
        {/* Poids */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.scrollPickerLabel}>{t.weightLabel}</Text>
          <View style={[s.scrollPickerContainer, { borderColor: 'rgba(0,217,132,0.15)' }]}>
            <ScrollPicker
              values={weightValues}
              selectedValue={parseInt(formData.weight) || 70}
              onSelect={function (v) { update('weight', String(v)); }}
              unit={weightUnit}
              color={C.emerald}
              height={170}
            />
          </View>
        </View>

        {/* Taille */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.scrollPickerLabel}>{t.heightLabel}</Text>
          <View style={[s.scrollPickerContainer, { borderColor: 'rgba(0,191,166,0.15)' }]}>
            <ScrollPicker
              values={heightValues}
              selectedValue={parseInt(formData.height) || 175}
              onSelect={function (v) { update('height', String(v)); }}
              unit={heightUnit}
              color={C.turquoise}
              height={170}
            />
          </View>
        </View>

        {/* Age */}
        <View style={{ flex: 0.7, alignItems: 'center' }}>
          <Text style={s.scrollPickerLabel}>{t.ageLabel}</Text>
          <View style={[s.scrollPickerContainer, { borderColor: 'rgba(212,175,55,0.15)' }]}>
            <ScrollPicker
              values={ageValues}
              selectedValue={parseInt(formData.age) || 25}
              onSelect={function (v) { update('age', String(v)); }}
              unit={t.years}
              color={C.gold}
              height={170}
            />
          </View>
        </View>
      </View>

      {/* SEXE — deux cercles avec texte explicite */}
      <Text style={[s.scrollPickerLabel, { textAlign: 'center', marginBottom: 10 }]}>
        {t.genderLabel}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
        <TouchableOpacity onPress={function () { update('gender', 'male'); }}>
          <View style={{
            width: 70, height: 70, borderRadius: 35,
            borderWidth: 1.5,
            borderColor: formData.gender === 'male' ? C.emerald : 'rgba(62,72,85,0.3)',
            backgroundColor: formData.gender === 'male' ? 'rgba(0,217,132,0.10)' : C.bgInput,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="male" size={24} color={formData.gender === 'male' ? C.emerald : C.textMuted} />
          </View>
          <Text style={{
            color: formData.gender === 'male' ? C.emerald : C.textMuted,
            fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 6,
          }}>{t.male}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={function () { update('gender', 'female'); }}>
          <View style={{
            width: 70, height: 70, borderRadius: 35,
            borderWidth: 1.5,
            borderColor: formData.gender === 'female' ? C.turquoise : 'rgba(62,72,85,0.3)',
            backgroundColor: formData.gender === 'female' ? 'rgba(0,191,166,0.10)' : C.bgInput,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="female" size={24} color={formData.gender === 'female' ? C.turquoise : C.textMuted} />
          </View>
          <Text style={{
            color: formData.gender === 'female' ? C.turquoise : C.textMuted,
            fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 6,
          }}>{t.female}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================================
// PHASE 3 — NIVEAU D'ACTIVITE (page dediee)
// ============================================================

function Phase3Activity(props) {
  var formData = props.formData; var setFormData = props.setFormData; var t = props.t;

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={s.phaseIcon}>
          <Ionicons name="fitness-outline" size={24} color={C.emerald} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{t.p3Title}</Text>
        <Text style={s.phaseSubtitle}>{t.p3Subtitle}</Text>
      </View>

      {t.activityLevels.map(function (level, i) {
        var sel = formData.activityLevel === i;
        return (
          <TouchableOpacity key={i} onPress={function () { update('activityLevel', i); }}
            activeOpacity={0.7} style={{ marginBottom: 10 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingVertical: 14, paddingHorizontal: 16,
              borderRadius: 14, borderWidth: 1.2,
              borderColor: sel ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.3)',
              backgroundColor: sel ? 'rgba(0,217,132,0.06)' : C.bgInput,
              gap: 14,
            }}>
              <View style={{
                width: 46, height: 46, borderRadius: 12,
                backgroundColor: sel ? 'rgba(0,217,132,0.12)' : 'rgba(62,72,85,0.15)',
                borderWidth: 1, borderColor: sel ? 'rgba(0,217,132,0.25)' : 'rgba(62,72,85,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 22 }}>{level.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: sel ? C.emerald : C.textPrimary,
                  fontSize: 14, fontWeight: '700',
                }}>{level.label}</Text>
                <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>{level.desc}</Text>
              </View>
              {sel ? <Ionicons name="checkmark-circle" size={22} color={C.emerald} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ============================================================
// PHASE 4 — REGIME ALIMENTAIRE (5 options)
// ============================================================

function Phase4Diet(props) {
  var formData = props.formData; var setFormData = props.setFormData; var t = props.t;

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={[s.phaseIcon, { backgroundColor: 'rgba(0,191,166,0.08)', borderColor: 'rgba(0,191,166,0.2)' }]}>
          <Ionicons name="restaurant-outline" size={24} color={C.turquoise} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{t.p4Title}</Text>
        <Text style={s.phaseSubtitle}>{t.p4Subtitle}</Text>
      </View>

      {t.diets.map(function (diet) {
        var sel = formData.diet === diet.key;
        return (
          <TouchableOpacity key={diet.key}
            onPress={function () { update('diet', diet.key); }}
            activeOpacity={0.7} style={{ marginBottom: 10 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingVertical: 16, paddingHorizontal: 16,
              borderRadius: 14, borderWidth: 1.2,
              borderColor: sel ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.3)',
              backgroundColor: sel ? 'rgba(0,217,132,0.06)' : C.bgInput,
              gap: 14, overflow: 'hidden',
            }}>
              {sel ? (
                <LinearGradient
                  colors={['rgba(0,217,132,0.08)', 'rgba(0,217,132,0.02)', 'transparent']}
                  style={StyleSheet.absoluteFill} />
              ) : null}

              <View style={{
                width: 50, height: 50, borderRadius: 14,
                backgroundColor: sel ? 'rgba(0,217,132,0.10)' : 'rgba(62,72,85,0.12)',
                borderWidth: 1,
                borderColor: sel ? 'rgba(0,217,132,0.2)' : 'rgba(62,72,85,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 24 }}>{diet.icon}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  color: sel ? C.emerald : C.textPrimary,
                  fontSize: 15, fontWeight: '700',
                }}>{diet.label}</Text>
                <Text style={{ color: C.textSecondary, fontSize: 11, marginTop: 2 }}>{diet.desc}</Text>
                <Text style={{ color: C.textMuted, fontSize: 9, marginTop: 3, fontStyle: 'italic' }}>{diet.detail}</Text>
              </View>

              {sel ? <Ionicons name="checkmark-circle" size={22} color={C.emerald} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ============================================================
// PHASE 5 — OBJECTIF (Perte/Maintien/Prise + kg + rythme)
// ============================================================

function Phase5Goals(props) {
  var formData = props.formData; var setFormData = props.setFormData;
  var calculations = props.calculations; var t = props.t;

  var paceIcons = ['rocket-outline', 'speedometer-outline', 'leaf-outline'];
  var paceColors = [C.gold, C.emerald, C.turquoise];

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      {/* Icone phase */}
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <View style={[s.phaseIcon, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.2)' }]}>
          <Ionicons name="flag-outline" size={24} color={C.gold} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{t.p5Title}</Text>
        <Text style={s.phaseSubtitle}>{t.p5Subtitle}</Text>
      </View>

      {/* 3 cartes objectif */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {t.goals.map(function (g) {
          var selected = formData.goal === g.key;
          return (
            <TouchableOpacity key={g.key} onPress={function () { update('goal', g.key); }}
              style={{ flex: 1 }} activeOpacity={0.7}>
              <View style={{
                paddingVertical: 20, paddingHorizontal: 8,
                borderRadius: 14, alignItems: 'center',
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected ? g.color + '60' : C.metalBorder,
                backgroundColor: C.bgInput, overflow: 'hidden',
              }}>
                {selected ? (
                  <LinearGradient
                    colors={[g.color + '15', g.color + '05', 'transparent']}
                    style={StyleSheet.absoluteFill} />
                ) : null}
                <View style={{
                  width: 46, height: 46, borderRadius: 23,
                  backgroundColor: selected ? g.color + '15' : 'rgba(62,72,85,0.15)',
                  borderWidth: 1, borderColor: selected ? g.color + '30' : 'rgba(62,72,85,0.2)',
                  alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}>
                  <Ionicons name={g.icon} size={22} color={selected ? g.color : C.textMuted} />
                </View>
                <Text style={{ color: selected ? g.color : C.textSecondary, fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                  {g.label}
                </Text>
                {selected ? (
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: g.color, marginTop: 6 }} />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Si perte ou prise */}
      {formData.goal && formData.goal !== 'maintain' ? (
        <View>
          {/* Compteur kg premium */}
          <View style={{
            alignItems: 'center', marginVertical: 16, paddingVertical: 20,
            borderRadius: 16, backgroundColor: C.bgInput,
            borderWidth: 1, borderColor: 'rgba(62,72,85,0.2)',
          }}>
            <Text style={{ color: C.textSecondary, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginBottom: 14 }}>
              {t.kgLabel(formData.goal)}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              <TouchableOpacity onPress={function () { update('targetKg', Math.max(1, formData.targetKg - 1)); }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: 'rgba(0,217,132,0.06)', borderWidth: 1.2, borderColor: 'rgba(0,217,132,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name="chevron-down" size={20} color={C.emerald} />
                </View>
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  color: C.emerald, fontSize: 48, fontWeight: '900',
                  textShadowColor: 'rgba(0,217,132,0.3)',
                  textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
                }}>
                  {formData.targetKg}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 12, letterSpacing: 2 }}>KG</Text>
              </View>
              <TouchableOpacity onPress={function () { update('targetKg', Math.min(30, formData.targetKg + 1)); }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: 'rgba(0,217,132,0.06)', borderWidth: 1.2, borderColor: 'rgba(0,217,132,0.2)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name="chevron-up" size={20} color={C.emerald} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3 modes */}
          <Text style={[s.inputLabel, { marginBottom: 10 }]}>{t.yourPace}</Text>
          {t.paceLabels.map(function (label, i) {
            var selected = formData.paceMode === i;
            var modeKey = ['ambitious', 'reasonable', 'realistic'][i];
            var modeData = calculations.modes[modeKey];
            return (
              <TouchableOpacity key={i} onPress={function () { update('paceMode', i); }}
                activeOpacity={0.7} style={{ marginBottom: 8 }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 14, paddingHorizontal: 14,
                  borderRadius: 12, borderWidth: 1.2,
                  borderColor: selected ? paceColors[i] + '50' : C.metalBorder,
                  backgroundColor: selected ? paceColors[i] + '08' : C.bgDeep,
                  gap: 12,
                }}>
                  <View style={{
                    width: 38, height: 38, borderRadius: 10,
                    backgroundColor: selected ? paceColors[i] + '15' : 'rgba(62,72,85,0.2)',
                    borderWidth: 1, borderColor: selected ? paceColors[i] + '30' : 'rgba(62,72,85,0.3)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name={paceIcons[i]} size={18} color={selected ? paceColors[i] : C.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: selected ? paceColors[i] : C.textPrimary, fontSize: 14, fontWeight: '700' }}>
                      {label}
                    </Text>
                    <Text style={{ color: C.textSecondary, fontSize: 10, marginTop: 2 }}>
                      {modeData.dailyDelta} kcal/jour {'\u00B7'} {modeData.weeksLabel} {t.weeks}
                    </Text>
                  </View>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color={paceColors[i]} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Resume VOTRE PLAN */}
          <View style={{
            marginTop: 16, borderRadius: 14, overflow: 'hidden',
            borderWidth: 1.5,
            borderTopColor: 'rgba(212,175,55,0.3)',
            borderBottomColor: 'rgba(212,175,55,0.1)',
            borderLeftColor: 'rgba(212,175,55,0.15)',
            borderRightColor: 'rgba(212,175,55,0.15)',
            backgroundColor: C.bgInput,
          }}>
            <LinearGradient
              colors={['rgba(212,175,55,0.08)', 'rgba(212,175,55,0.02)', 'transparent']}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60 }} />
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Ionicons name="trophy-outline" size={14} color={C.gold} />
                <Text style={{ color: C.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>{t.yourPlan}</Text>
              </View>
              <Text style={{ color: C.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
                {t.dailyGoal(calculations.dailyTarget)}
              </Text>
              <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 14 }}>
                {t.bmrTdee(calculations.bmr, calculations.tdee)}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[
                  { label: t.protein, value: calculations.macros.protein, color: C.turquoise },
                  { label: t.carbs, value: calculations.macros.carbs, color: C.emerald },
                  { label: t.fat, value: calculations.macros.fat, color: C.gold },
                ].map(function (macro, i) {
                  return (
                    <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ color: macro.color, fontSize: 22, fontWeight: '800' }}>{macro.value}</Text>
                      <Text style={{ color: C.textMuted, fontSize: 9, marginTop: 1 }}>{t.gUnit} {macro.label}</Text>
                      <View style={{ width: '60%', height: 3, borderRadius: 1.5, marginTop: 6, backgroundColor: 'rgba(62,72,85,0.2)' }}>
                        <View style={{
                          width: Math.min(100, (macro.value / 300) * 100) + '%',
                          height: '100%', borderRadius: 1.5, backgroundColor: macro.color,
                        }} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

// ============================================================
// FOOD ICONS BACKGROUND — emojis aliments disperses
// ============================================================

var FOOD_MAP = {
  bmr: ['\uD83E\uDEC0', '\uD83E\uDDE0', '\uD83D\uDCA4', '\uD83E\uDEC1', '\uD83D\uDD0B'],
  tdee: ['\uD83C\uDFC3', '\uD83D\uDEB4', '\uD83C\uDFCB\uFE0F', '\uD83E\uDDD8', '\u26A1'],
  protein: ['\uD83E\uDD69', '\uD83C\uDF57', '\uD83E\uDD5A', '\uD83D\uDC1F', '\uD83E\uDDC0'],
  carbs: ['\uD83C\uDF5A', '\uD83C\uDF5E', '\uD83C\uDF4C', '\uD83E\uDD54', '\uD83C\uDF5D'],
  fat: ['\uD83E\uDD51', '\uD83E\uDED2', '\uD83E\uDD5C', '\uD83E\uDDC8', '\uD83D\uDC1F'],
};

var FOOD_POSITIONS = [
  { top: '55%', left: '8%', size: 36, opacity: 0.08, rotate: '-15deg' },
  { top: '62%', right: '12%', size: 30, opacity: 0.06, rotate: '10deg' },
  { top: '72%', left: '25%', size: 40, opacity: 0.07, rotate: '-5deg' },
  { top: '78%', right: '30%', size: 28, opacity: 0.05, rotate: '20deg' },
  { top: '85%', left: '50%', size: 34, opacity: 0.06, rotate: '-10deg' },
];

function FoodIconsBackground(props) {
  var foods = FOOD_MAP[props.type] || [];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {foods.map(function (emoji, i) {
        var pos = FOOD_POSITIONS[i];
        return (
          <Text key={i} style={{
            position: 'absolute',
            top: pos.top, left: pos.left, right: pos.right,
            fontSize: pos.size,
            opacity: pos.opacity,
            transform: [{ rotate: pos.rotate }],
          }}>
            {emoji}
          </Text>
        );
      })}
    </View>
  );
}

// ============================================================
// PHASE 6 — EDUCATION (cards compactes + food emojis)
// ============================================================

function Phase6Education(props) {
  var calculations = props.calculations; var t = props.t;
  var slides = t.slides(calculations);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', marginBottom: 12, paddingHorizontal: 24 }}>
        <View style={[s.phaseIcon, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.2)' }]}>
          <Ionicons name="bulb-outline" size={24} color={C.gold} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{t.p6Title}</Text>
        <Text style={s.phaseSubtitle}>{t.p6Subtitle}</Text>
      </View>

      <FlatList
        data={slides} horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH - 48} decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 24 }}
        ItemSeparatorComponent={function () { return <View style={{ width: 12 }} />; }}
        renderItem={function (info) {
          var item = info.item;
          return (
            <View style={{
              width: SCREEN_WIDTH - 60, borderRadius: 16,
              backgroundColor: C.bgCard, borderWidth: 1.2,
              borderColor: item.color + '20',
              paddingVertical: 16, paddingHorizontal: 18, overflow: 'hidden',
            }}>
              <CircuitPattern width={SCREEN_WIDTH - 60} height={350} color={item.color + '06'} />

              {/* Food emojis en fond */}
              <FoodIconsBackground type={item.type} />

              {/* Header compact */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 10,
                  backgroundColor: item.color + '10', borderWidth: 1, borderColor: item.color + '20',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={item.icon} size={18} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.textPrimary, fontSize: 16, fontWeight: '800' }}>{item.title}</Text>
                  <Text style={{ color: C.textSecondary, fontSize: 9 }}>{item.subtitle}</Text>
                </View>
                <View style={{
                  backgroundColor: item.color + '08', borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 5,
                  borderWidth: 1, borderColor: item.color + '15',
                }}>
                  <Text style={{ color: item.color, fontSize: 13, fontWeight: '800' }}>{item.value}</Text>
                </View>
              </View>

              <Text style={{ color: C.textPrimary, fontSize: 12.5, lineHeight: 19, marginBottom: 10 }}>
                {item.explanation}
              </Text>

              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 8,
              }}>
                <Ionicons name="sparkles" size={12} color={item.color} />
                <Text style={{ color: C.textSecondary, fontSize: 10, flex: 1, fontStyle: 'italic' }}>
                  {item.funFact}
                </Text>
              </View>
            </View>
          );
        }}
        keyExtractor={function (item) { return item.title; }}
      />
    </View>
  );
}

// ============================================================
// PHASE 7 — CARACTERES LIXUM (Teaser Gamification)
// ============================================================

var TEASER_LEVEL_COLORS = {
  STANDARD: C.textSecondary,
  RARE: C.emerald,
  '\u00c9LITE': C.gold,
  ELITE: C.gold,
};

var TEASER_BORDER_COLORS = {
  STANDARD: C.metalShine,
  RARE: C.emerald,
  '\u00c9LITE': C.gold,
  ELITE: C.gold,
};

function Phase7Characters(props) {
  var t = props.t;
  var cards = t.teaserCards;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{
          width: 50, height: 50, borderRadius: 12,
          backgroundColor: 'rgba(212,175,55,0.08)',
          borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="diamond-outline" size={24} color={C.gold} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{t.p7Title}</Text>
        <Text style={s.phaseSubtitle}>{t.p7Subtitle}</Text>
      </View>

      {/* Explication rapide */}
      <View style={{
        backgroundColor: 'rgba(212,175,55,0.04)',
        borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)',
        marginBottom: 20,
      }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <Ionicons name="sparkles" size={16} color={C.gold} />
          <Text style={{ color: C.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
            {t.howItWorks}
          </Text>
        </View>
        <Text style={{ color: C.textSecondary, fontSize: 11, lineHeight: 17 }}>
          {t.howItWorksText}
        </Text>
      </View>

      {/* 3 CARTES TEASER */}
      {cards.map(function (card, i) {
        var levelColor = TEASER_LEVEL_COLORS[card.level] || C.textSecondary;
        var borderColor = TEASER_BORDER_COLORS[card.level] || C.metalShine;
        return (
          <View key={i} style={{ marginBottom: 12 }}>
            <View style={{
              borderRadius: 16, padding: 3,
              borderWidth: 1.5,
              borderTopColor: borderColor + '80',
              borderLeftColor: borderColor + '50',
              borderRightColor: borderColor + '30',
              borderBottomColor: borderColor + '20',
              backgroundColor: borderColor + '10',
            }}>
              <View style={{
                borderRadius: 13, borderWidth: 1,
                borderColor: borderColor + '25',
                backgroundColor: '#0F1318',
                overflow: 'hidden',
              }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  padding: 14, gap: 14,
                }}>
                  {/* Animal emoji */}
                  <View style={{
                    width: 56, height: 56, borderRadius: 14,
                    backgroundColor: borderColor + '10',
                    borderWidth: 1, borderColor: borderColor + '20',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 28 }}>{card.animal}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    {/* Badge niveau */}
                    <View style={{
                      alignSelf: 'flex-start',
                      paddingHorizontal: 8, paddingVertical: 2,
                      borderRadius: 4, marginBottom: 4,
                      backgroundColor: levelColor + '15',
                      borderWidth: 1, borderColor: levelColor + '30',
                    }}>
                      <Text style={{
                        color: levelColor, fontSize: 8,
                        fontWeight: '800', letterSpacing: 1.5,
                      }}>{card.level}</Text>
                    </View>

                    <Text style={{
                      color: C.textPrimary, fontSize: 14, fontWeight: '800',
                      letterSpacing: 1,
                    }}>{card.name}</Text>

                    <Text style={{ color: C.textSecondary, fontSize: 10, marginTop: 3 }}>
                      {card.power} {'\u00B7'} {card.duration}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                </View>
              </View>
            </View>
          </View>
        );
      })}

      {/* Texte d'accroche */}
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Text style={{
          color: C.textMuted, fontSize: 11, textAlign: 'center', fontStyle: 'italic',
        }}>
          {t.charactersFooter}
        </Text>
        <Text style={{
          color: C.gold, fontSize: 12, fontWeight: '700',
          marginTop: 6, letterSpacing: 1,
        }}>
          {t.firstSpin}
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================
// BOUTONS NAVIGATION PREMIUM
// ============================================================

function NavigationButtons(props) {
  var step = props.step; var setStep = props.setStep;
  var totalSteps = props.totalSteps; var formData = props.formData;
  var onComplete = props.onComplete; var t = props.t;

  var canNext = function () {
    if (step === 1) {
      return formData.fullName && formData.fullName.trim().length >= 3 &&
        formData.email && formData.email === formData.emailConfirm &&
        formData.password && formData.password.length >= 8 &&
        formData.password === formData.passwordConfirm;
    }
    if (step === 2) return formData.weight && formData.height && formData.age;
    if (step === 3) return true;
    if (step === 4) return formData.diet !== '';
    if (step === 5) return formData.goal !== '';
    if (step === 6) return true;
    if (step === 7) return true;
    return true;
  };
  var enabled = canNext();

  return (
    <View style={{
      flexDirection: 'row', paddingHorizontal: 20, paddingTop: 8,
      paddingBottom: Platform.OS === 'android' ? 12 : 8, gap: 10,
    }}>
      {step > 1 ? (
        <TouchableOpacity onPress={function () { setStep(step - 1); }}
          style={{
            flex: 0.4, paddingVertical: 15, borderRadius: 12,
            borderWidth: 1.2, borderColor: C.metalBorder,
            backgroundColor: C.bgDeep, alignItems: 'center',
          }}>
          <Ionicons name="arrow-back" size={18} color={C.textSecondary} />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        onPress={function () { step < totalSteps ? setStep(step + 1) : onComplete(); }}
        disabled={!enabled} activeOpacity={0.7}
        style={{ flex: 1, borderRadius: 12, overflow: 'hidden', opacity: enabled ? 1 : 0.4 }}>
        {step === totalSteps ? (
          <LinearGradient colors={['#D4AF37', '#C5A028', '#A68B1B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 8, paddingVertical: 15, borderRadius: 12,
            }}>
            <Text style={{ color: C.bgDeep, fontSize: 15, fontWeight: '800', letterSpacing: 1 }}>
              {t.createAccount}
            </Text>
            <Ionicons name="checkmark-done" size={18} color={C.bgDeep} />
          </LinearGradient>
        ) : (
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: 8, paddingVertical: 15, borderRadius: 12,
            backgroundColor: 'rgba(0,217,132,0.08)',
            borderWidth: 1.2, borderColor: 'rgba(0,217,132,0.3)',
          }}>
            <Text style={{ color: C.emerald, fontSize: 15, fontWeight: '700' }}>{t.next}</Text>
            <Ionicons name="arrow-forward" size={16} color={C.emerald} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// APP PRINCIPALE — 7 PHASES
// ============================================================

export default function App() {
  var _lang = useState('fr');
  var lang = _lang[0]; var setLang = _lang[1];

  var _step = useState(1);
  var step = _step[0]; var setStep = _step[1];

  var _unitSystem = useState('metric');
  var unitSystem = _unitSystem[0]; var setUnitSystem = _unitSystem[1];

  var totalSteps = 7;
  var t = texts[lang];

  var _formData = useState({
    // Phase 1
    fullName: '',
    email: '', emailConfirm: '',
    password: '', passwordConfirm: '',
    // Phase 2
    weight: '70', height: '175', age: '25',
    gender: 'male',
    // Phase 3
    activityLevel: 2,
    // Phase 4
    diet: 'classic',
    // Phase 5
    goal: '', targetKg: 5, timelineDays: 90, paceMode: 1,
  });
  var formData = _formData[0]; var setFormData = _formData[1];

  var calculations = useMemo(function () {
    return calculateGoals(formData);
  }, [formData.weight, formData.height, formData.age, formData.gender,
      formData.activityLevel, formData.goal, formData.targetKg,
      formData.paceMode, formData.timelineDays]);

  var handleRegister = function () {
    Alert.alert(
      lang === 'fr' ? 'Inscription simul\u00e9e' : 'Registration simulated',
      'BMR: ' + calculations.bmr + ' kcal\nTDEE: ' + calculations.tdee + ' kcal\nObjectif: ' + calculations.dailyTarget + ' kcal/jour\nR\u00e9gime: ' + formData.diet + '\nNom: ' + formData.fullName
    );
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#1E2A3A' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1E2A3A" />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
          <LinearGradient
            colors={['#1E2A3A', '#1C2535', '#1A2232', '#1C2535', '#1E2A3A']}
            locations={[0, 0.25, 0.5, 0.75, 1]}
            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            style={{ flex: 1 }}>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}>

              {/* Header : cercle progress + nom etape + drapeaux */}
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 14,
              }}>
                <CircularProgress step={step} total={totalSteps} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.textPrimary, fontSize: 15, fontWeight: '700' }}>
                    {t.stepNames[step - 1]}
                  </Text>
                  <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                    {t.stepDescs[step - 1]}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity onPress={function () { setLang('en'); }}>
                    <View style={{
                      paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5,
                      borderWidth: 1,
                      borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.4)',
                      backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'transparent',
                    }}>
                      <Text style={{ fontSize: 12 }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={function () { setLang('fr'); }}>
                    <View style={{
                      paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5,
                      borderWidth: 1,
                      borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.4)',
                      backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'transparent',
                    }}>
                      <Text style={{ fontSize: 12 }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mini barre fine */}
              <View style={{ height: 2, backgroundColor: 'rgba(62,72,85,0.2)', marginHorizontal: 20, marginBottom: 8 }}>
                <LinearGradient
                  colors={['#00A866', '#00D984']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: (step / totalSteps * 100) + '%', borderRadius: 1 }} />
              </View>

              {/* Contenu de la phase */}
              <View style={{ flex: 1 }}>
                {step === 1 ? <Phase1Identity formData={formData} setFormData={setFormData} t={t} /> : null}
                {step === 2 ? <Phase2Body formData={formData} setFormData={setFormData} t={t} unitSystem={unitSystem} setUnitSystem={setUnitSystem} /> : null}
                {step === 3 ? <Phase3Activity formData={formData} setFormData={setFormData} t={t} /> : null}
                {step === 4 ? <Phase4Diet formData={formData} setFormData={setFormData} t={t} /> : null}
                {step === 5 ? <Phase5Goals formData={formData} setFormData={setFormData} calculations={calculations} t={t} /> : null}
                {step === 6 ? <Phase6Education calculations={calculations} t={t} /> : null}
                {step === 7 ? <Phase7Characters t={t} /> : null}
              </View>

              {/* Boutons navigation */}
              <NavigationButtons
                step={step} setStep={setStep} totalSteps={totalSteps}
                formData={formData} onComplete={handleRegister} t={t} />

            </KeyboardAvoidingView>
          </LinearGradient>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================

var s = StyleSheet.create({
  phaseIcon: {
    width: 50, height: 50, borderRadius: 12,
    backgroundColor: 'rgba(0,217,132,0.08)',
    borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  phaseTitle: {
    color: '#EAEEF3', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 4,
  },
  phaseSubtitle: {
    color: '#8892A0', fontSize: 13, textAlign: 'center', marginBottom: 20,
  },
  inputLabel: {
    color: '#8892A0', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5,
  },
  inputPremium: {
    borderRadius: 10,
    backgroundColor: '#0A0E14',
    borderWidth: 1,
    borderColor: 'rgba(62,72,85,0.3)',
  },
  inputValid: {
    borderColor: 'rgba(0, 217, 132, 0.3)',
  },
  inputText: {
    color: '#EAEEF3', fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  scrollPickerLabel: {
    color: '#8892A0', fontSize: 9, fontWeight: '700',
    letterSpacing: 2, marginBottom: 8,
  },
  scrollPickerContainer: {
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#0A0E14',
    width: '100%',
  },
});
