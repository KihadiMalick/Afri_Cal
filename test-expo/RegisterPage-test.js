// LIXUM - Register Page (Multi-Phase Wizard) v5.0 — Premium 10 Phases
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que WelcomePage-test.js

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  Easing,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle as SvgCircle, Line, Rect } from 'react-native-svg';

var SCREEN_WIDTH = Dimensions.get('window').width;

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
// TRADUCTIONS
// ============================================================

var texts = {
  fr: {
    // Phase 1
    p1Title: 'Cr\u00e9er votre compte',
    p1Subtitle: 'Vos informations personnelles',
    identityLabel: 'IDENTIT\u00c9',
    emailLabel: 'EMAIL',
    securityLabel: 'S\u00c9CURIT\u00c9',
    fullName: 'Nom complet',
    email: 'Email',
    emailConfirm: 'Confirmer l\'email',
    password: 'Mot de passe',
    passwordConfirm: 'Confirmer le mot de passe',
    emailMatch: 'Les emails correspondent \u2713',
    emailNoMatch: 'Les emails ne correspondent pas',
    passRules: 'Minimum 8 caract\u00e8res',
    // Phase 2
    p2Title: 'Votre morphologie',
    p2Subtitle: 'Pour calculer votre m\u00e9tabolisme de base',
    weightLabel: 'POIDS',
    heightLabel: 'TAILLE',
    ageLabel: '\u00c2GE',
    genderLabel: 'SEXE',
    male: 'Homme',
    female: 'Femme',
    kg: 'kg',
    cm: 'cm',
    years: 'ans',
    // Phase 3
    activityLabel: 'Niveau d\'activit\u00e9',
    activityLevels: [
      { label: 'S\u00e9dentaire', desc: 'Peu ou pas d\'exercice', icon: 'bed-outline', emoji: '\uD83D\uDECB\uFE0F' },
      { label: 'L\u00e9g\u00e8rement actif', desc: '1-2 fois/semaine', icon: 'walk-outline', emoji: '\uD83D\uDEB6\u200D\u2642\uFE0F' },
      { label: 'Mod\u00e9r\u00e9ment actif', desc: '3-5 fois/semaine', icon: 'bicycle-outline', emoji: '\uD83D\uDEB4\u200D\u2642\uFE0F' },
      { label: 'Tr\u00e8s actif', desc: '6-7 fois/semaine', icon: 'barbell-outline', emoji: '\uD83C\uDFCB\uFE0F\u200D\u2642\uFE0F' },
      { label: 'Extr\u00eamement actif', desc: 'Athl\u00e8te / travail physique', icon: 'flame-outline', emoji: '\uD83D\uDD25' },
    ],
    // Phase 4
    dietLabel: 'R\u00e9gime alimentaire',
    diets: [
      { key: 'classic', label: 'Classique', desc: 'Aucune restriction', icon: 'restaurant-outline', emoji: '\uD83C\uDF57', color: '#00D984' },
      { key: 'vegetarian', label: 'V\u00e9g\u00e9tarien', desc: 'Sans viande ni poisson', icon: 'leaf-outline', emoji: '\uD83E\uDD6C', color: '#00BFA6' },
      { key: 'vegan', label: 'V\u00e9gan', desc: 'Aucun produit animal', icon: 'flower-outline', emoji: '\uD83C\uDF31', color: '#00D984' },
      { key: 'keto', label: 'K\u00e9to', desc: 'Faible en glucides, riche en lipides', icon: 'flame-outline', emoji: '\uD83E\uDD51', color: '#D4AF37' },
      { key: 'halal', label: 'Halal', desc: 'Conforme aux pr\u00e9ceptes islamiques', icon: 'moon-outline', emoji: '\uD83C\uDF19', color: '#00BFA6' },
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
        { icon: 'flame-outline', color: '#D4AF37', type: 'bmr', title: 'BMR', subtitle: 'M\u00e9tabolisme de Base', value: calc.bmr + ' kcal', explanation: 'C\'est l\'\u00e9nergie minimale que votre corps br\u00fble au repos pour maintenir ses fonctions vitales : respiration, circulation sanguine, r\u00e9gulation de la temp\u00e9rature.\n\nM\u00eame allong\u00e9 toute la journ\u00e9e, votre corps consomme cette \u00e9nergie. Le BMR repr\u00e9sente environ 60 \u00e0 75% de votre d\u00e9pense calorique totale.\n\nIl est influenc\u00e9 par votre \u00e2ge, votre poids, votre taille et votre sexe.', funFact: 'Votre cerveau seul consomme environ 20% de votre BMR.' },
        { icon: 'flash-outline', color: '#00D984', type: 'tdee', title: 'TDEE', subtitle: 'D\u00e9pense \u00c9nerg\u00e9tique Totale', value: calc.tdee + ' kcal', explanation: 'C\'est votre BMR + les calories br\u00fbl\u00e9es par votre activit\u00e9 physique quotidienne.\n\nC\'est LE chiffre cl\u00e9 : si vous mangez moins que votre TDEE, vous perdez du poids. Si vous mangez plus, vous en gagnez.\n\nVotre TDEE change selon votre niveau d\'activit\u00e9 et votre composition corporelle.', funFact: 'Une heure de marche rapide br\u00fble environ 300 kcal.' },
        { icon: 'fish-outline', color: '#00BFA6', type: 'protein', title: 'Prot\u00e9ines', subtitle: 'Les b\u00e2tisseurs du corps', value: calc.macros.protein + 'g / jour', explanation: 'Les prot\u00e9ines r\u00e9parent vos muscles, renforcent votre syst\u00e8me immunitaire et vous gardent rassasi\u00e9 plus longtemps.\n\n1g de prot\u00e9ine = 4 kcal.\n\nSources principales : viande, poisson, \u0153ufs, l\u00e9gumineuses. Visez entre 1.6g et 2.2g par kg de poids corporel si vous \u00eates actif.', funFact: 'Vos cheveux, ongles et peau sont principalement faits de prot\u00e9ines.' },
        { icon: 'leaf-outline', color: '#00D984', type: 'carbs', title: 'Glucides', subtitle: 'Le carburant de l\'\u00e9nergie', value: calc.macros.carbs + 'g / jour', explanation: 'Les glucides sont la source d\'\u00e9nergie pr\u00e9f\u00e9r\u00e9e de votre cerveau et de vos muscles pendant l\'effort.\n\n1g de glucide = 4 kcal.\n\nIls ne sont pas l\'ennemi \u2014 c\'est l\'exc\u00e8s qui l\'est. Privil\u00e9giez les glucides complexes : riz complet, patates douces, avoine.', funFact: 'Votre cerveau consomme environ 120g de glucides par jour.' },
        { icon: 'water-outline', color: '#D4AF37', type: 'fat', title: 'Lipides', subtitle: 'Les r\u00e9serves essentielles', value: calc.macros.fat + 'g / jour', explanation: 'Les lipides prot\u00e8gent vos organes, transportent les vitamines A, D, E, K et produisent vos hormones.\n\n1g de lipide = 9 kcal \u2014 tr\u00e8s denses en \u00e9nergie.\n\nLes bonnes graisses (om\u00e9ga-3, huile d\'olive, avocat) sont essentielles au fonctionnement de votre cerveau.', funFact: '60% de votre cerveau est compos\u00e9 de graisses.' },
      ];
    },
    next: 'Suivant',
    createAccount: 'Cr\u00e9er mon compte',
  },
  en: {
    p1Title: 'Create your account',
    p1Subtitle: 'Your personal information',
    identityLabel: 'IDENTITY',
    emailLabel: 'EMAIL',
    securityLabel: 'SECURITY',
    fullName: 'Full name',
    email: 'Email',
    emailConfirm: 'Confirm email',
    password: 'Password',
    passwordConfirm: 'Confirm password',
    emailMatch: 'Emails match \u2713',
    emailNoMatch: 'Emails do not match',
    passRules: 'Minimum 8 characters',
    p2Title: 'Your body metrics',
    p2Subtitle: 'To calculate your basal metabolism',
    weightLabel: 'WEIGHT',
    heightLabel: 'HEIGHT',
    ageLabel: 'AGE',
    genderLabel: 'GENDER',
    male: 'Male',
    female: 'Female',
    kg: 'kg',
    cm: 'cm',
    years: 'yrs',
    activityLabel: 'Activity level',
    activityLevels: [
      { label: 'Sedentary', desc: 'Little or no exercise', icon: 'bed-outline', emoji: '\uD83D\uDECB\uFE0F' },
      { label: 'Lightly active', desc: '1-2 times/week', icon: 'walk-outline', emoji: '\uD83D\uDEB6\u200D\u2642\uFE0F' },
      { label: 'Moderately active', desc: '3-5 times/week', icon: 'bicycle-outline', emoji: '\uD83D\uDEB4\u200D\u2642\uFE0F' },
      { label: 'Very active', desc: '6-7 times/week', icon: 'barbell-outline', emoji: '\uD83C\uDFCB\uFE0F\u200D\u2642\uFE0F' },
      { label: 'Extremely active', desc: 'Athlete / physical job', icon: 'flame-outline', emoji: '\uD83D\uDD25' },
    ],
    dietLabel: 'Diet type',
    diets: [
      { key: 'classic', label: 'Classic', desc: 'No restrictions', icon: 'restaurant-outline', emoji: '\uD83C\uDF57', color: '#00D984' },
      { key: 'vegetarian', label: 'Vegetarian', desc: 'No meat or fish', icon: 'leaf-outline', emoji: '\uD83E\uDD6C', color: '#00BFA6' },
      { key: 'vegan', label: 'Vegan', desc: 'No animal products', icon: 'flower-outline', emoji: '\uD83C\uDF31', color: '#00D984' },
      { key: 'keto', label: 'Keto', desc: 'Low carb, high fat', icon: 'flame-outline', emoji: '\uD83E\uDD51', color: '#D4AF37' },
      { key: 'halal', label: 'Halal', desc: 'Islamic dietary laws', icon: 'moon-outline', emoji: '\uD83C\uDF19', color: '#00BFA6' },
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
        { icon: 'flame-outline', color: '#D4AF37', type: 'bmr', title: 'BMR', subtitle: 'Basal Metabolic Rate', value: calc.bmr + ' kcal', explanation: 'This is the minimum energy your body burns at rest to maintain vital functions: breathing, blood circulation, temperature regulation.\n\nEven lying down all day, your body consumes this energy. BMR represents about 60-75% of your total caloric expenditure.\n\nIt\'s influenced by your age, weight, height and gender.', funFact: 'Your brain alone consumes about 20% of your BMR.' },
        { icon: 'flash-outline', color: '#00D984', type: 'tdee', title: 'TDEE', subtitle: 'Total Daily Energy Expenditure', value: calc.tdee + ' kcal', explanation: 'This is your BMR + calories burned by your daily physical activity.\n\nThis is THE key number: eat less than your TDEE and you lose weight. Eat more and you gain.\n\nYour TDEE changes based on your activity level and body composition.', funFact: 'One hour of brisk walking burns about 300 kcal.' },
        { icon: 'fish-outline', color: '#00BFA6', type: 'protein', title: 'Proteins', subtitle: 'The body builders', value: calc.macros.protein + 'g / day', explanation: 'Proteins repair your muscles, strengthen your immune system and keep you full longer.\n\n1g of protein = 4 kcal.\n\nMain sources: meat, fish, eggs, legumes. Aim for 1.6-2.2g per kg of body weight if active.', funFact: 'Your hair, nails and skin are mainly made of proteins.' },
        { icon: 'leaf-outline', color: '#00D984', type: 'carbs', title: 'Carbs', subtitle: 'The energy fuel', value: calc.macros.carbs + 'g / day', explanation: 'Carbohydrates are the preferred energy source for your brain and muscles during exercise.\n\n1g of carb = 4 kcal.\n\nThey\'re not the enemy \u2014 excess is. Choose complex carbs: brown rice, sweet potatoes, oats.', funFact: 'Your brain consumes about 120g of carbs per day.' },
        { icon: 'water-outline', color: '#D4AF37', type: 'fat', title: 'Fats', subtitle: 'The essential reserves', value: calc.macros.fat + 'g / day', explanation: 'Fats protect your organs, transport vitamins A, D, E, K and produce your hormones.\n\n1g of fat = 9 kcal \u2014 very energy dense.\n\nGood fats (omega-3, olive oil, avocado) are essential for brain function.', funFact: '60% of your brain is made of fat.' },
      ];
    },
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
// GLASS CARD — carte flottante metallique
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
// PREMIUM INPUT — avec focus glow
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
// GAUGE CIRCLE — jauge circulaire +/-
// ============================================================

function GaugeCircle(props) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color: C.textSecondary, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 }}>
        {props.label}
      </Text>
      <View style={{
        width: props.size || 110, height: props.size || 110, borderRadius: (props.size || 110) / 2,
        borderWidth: 2, borderColor: (props.color || C.emerald) + '33',
        backgroundColor: C.bgInput, alignItems: 'center', justifyContent: 'center',
        shadowColor: props.color || C.emerald, shadowOpacity: 0.08, shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
      }}>
        <Text style={{ color: props.color || C.emerald, fontSize: props.fontSize || 30, fontWeight: '800' }}>
          {props.value || '\u2014'}
        </Text>
        <Text style={{ color: C.textMuted, fontSize: props.unitSize || 10 }}>{props.unit}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: props.btnGap || 20, marginTop: 8 }}>
        <TouchableOpacity onPress={props.onMinus}>
          <View style={{
            width: props.btnSize || 34, height: props.btnSize || 34, borderRadius: (props.btnSize || 34) / 2,
            backgroundColor: (props.color || C.emerald) + '0F',
            borderWidth: 1, borderColor: (props.color || C.emerald) + '33',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="remove" size={props.btnIconSize || 16} color={props.color || C.emerald} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={props.onPlus}>
          <View style={{
            width: props.btnSize || 34, height: props.btnSize || 34, borderRadius: (props.btnSize || 34) / 2,
            backgroundColor: (props.color || C.emerald) + '0F',
            borderWidth: 1, borderColor: (props.color || C.emerald) + '33',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="add" size={props.btnIconSize || 16} color={props.color || C.emerald} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================
// SCROLL PICKER — roue verticale avec fondu
// ============================================================

var ScrollPicker = function (pickerProps) {
  var values = pickerProps.values;
  var selectedValue = pickerProps.selectedValue;
  var onSelect = pickerProps.onSelect;
  var unit = pickerProps.unit;
  var color = pickerProps.color || '#00D984';
  var pickerHeight = pickerProps.height || 260;
  var ITEM_H = 50;
  var scrollRef = useRef(null);
  var paddingTop = pickerHeight / 2 - ITEM_H / 2;
  var paddingBottom = pickerHeight / 2 - ITEM_H / 2;

  var initialIdx = Math.max(0, values.indexOf(selectedValue));

  useEffect(function () {
    var timer = setTimeout(function () {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          y: initialIdx * ITEM_H,
          animated: false,
        });
      }
    }, 100);
    return function () { clearTimeout(timer); };
  }, [initialIdx, ITEM_H]);

  var handleScrollEnd = useCallback(function (event) {
    var y = event.nativeEvent.contentOffset.y;
    var idx = Math.round(y / ITEM_H);
    var clamped = Math.max(0, Math.min(idx, values.length - 1));

    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: clamped * ITEM_H,
        animated: true,
      });
    }

    if (values[clamped] !== selectedValue) {
      onSelect(values[clamped]);
    }
  }, [values, selectedValue, onSelect, ITEM_H]);

  var items = [];
  for (var i = 0; i < values.length; i++) {
    var val = values[i];
    var isSelected = val === selectedValue;
    items.push(
      <View key={val + '-' + i} style={{
        height: ITEM_H,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{
          color: isSelected ? color : '#555E6C',
          fontSize: isSelected ? 26 : 15,
          fontWeight: isSelected ? '800' : '400',
          opacity: isSelected ? 1 : 0.3,
          textAlign: 'center',
        }}>
          {isSelected ? val + ' ' + unit : '' + val}
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      height: pickerHeight, overflow: 'hidden', position: 'relative',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: color + '18',
      backgroundColor: '#0A0E14',
    }}>
      {/* Bande de selection au centre */}
      <View style={{
        position: 'absolute',
        top: pickerHeight / 2 - ITEM_H / 2,
        left: 6, right: 6,
        height: ITEM_H,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: color + '30',
        backgroundColor: color + '06',
        zIndex: 0,
      }} />

      {/* Fondu haut */}
      <LinearGradient
        colors={['#0A0E14', 'rgba(10,14,20,0.7)', 'rgba(10,14,20,0)']}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: pickerHeight * 0.35, zIndex: 3,
          borderTopLeftRadius: 14, borderTopRightRadius: 14,
        }}
        pointerEvents="none"
      />

      {/* Fondu bas */}
      <LinearGradient
        colors={['rgba(10,14,20,0)', 'rgba(10,14,20,0.7)', '#0A0E14']}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: pickerHeight * 0.35, zIndex: 3,
          borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
        }}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{
          paddingTop: paddingTop,
          paddingBottom: paddingBottom,
        }}
      >
        {items}
      </ScrollView>
    </View>
  );
};

// ============================================================
// FOOD ICONS BACKGROUND — emojis transparents en fond de carte
// ============================================================

var FoodIconsBackground = function (foodProps) {
  var type = foodProps.type;
  var foodMap = {
    bmr: ['\uD83E\uDEC0', '\uD83E\uDDE0', '\uD83D\uDCA4', '\uD83E\uDEC1', '\uD83D\uDD0B'],
    tdee: ['\uD83C\uDFC3', '\uD83D\uDEB4', '\uD83C\uDFCB\uFE0F', '\uD83E\uDDD8', '\u26A1'],
    protein: ['\uD83E\uDD69', '\uD83C\uDF57', '\uD83E\uDD5A', '\uD83D\uDC1F', '\uD83E\uDDC0'],
    carbs: ['\uD83C\uDF5A', '\uD83C\uDF5E', '\uD83C\uDF4C', '\uD83E\uDD54', '\uD83C\uDF5D'],
    fat: ['\uD83E\uDD51', '\uD83E\uDED2', '\uD83E\uDD5C', '\uD83E\uDDC8', '\uD83D\uDC1F'],
  };
  var foods = foodMap[type] || [];
  var positions = [
    { top: '58%', left: '5%', size: 38, opacity: 0.09, rotate: '-15deg' },
    { top: '65%', right: '8%', size: 32, opacity: 0.07, rotate: '10deg' },
    { top: '74%', left: '22%', size: 42, opacity: 0.08, rotate: '-5deg' },
    { top: '80%', right: '25%', size: 30, opacity: 0.06, rotate: '20deg' },
    { top: '88%', left: '45%', size: 36, opacity: 0.07, rotate: '-10deg' },
  ];

  var elements = [];
  for (var i = 0; i < foods.length; i++) {
    var pos = positions[i];
    elements.push(
      <Text key={i} style={{
        position: 'absolute',
        top: pos.top, left: pos.left, right: pos.right,
        fontSize: pos.size,
        opacity: pos.opacity,
        transform: [{ rotate: pos.rotate }],
      }}>
        {foods[i]}
      </Text>
    );
  }
  return <>{elements}</>;
};

// ============================================================
// CHARACTER IMAGES
// ============================================================

// IMAGES — chemin depuis la racine Snack Expo (App.js -> ./assets/)
var ChickenImg = null;
var TigerImg = null;
var LicornumImg = null;
try { ChickenImg = require('./assets/ChickenCharacter.png'); } catch (e) { ChickenImg = null; }
try { TigerImg = require('./assets/TigerCharacter.png'); } catch (e) { TigerImg = null; }
try { LicornumImg = require('./assets/LicornumCharacter.png'); } catch (e) { LicornumImg = null; }

var characterImages = {
  'GOLD CHICKEN': ChickenImg,
  'RUBY TIGER': TigerImg,
  'LICORNUM': LicornumImg,
};

// ============================================================
// PHASE 1 — IDENTITE (nom complet + email + password)
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
          onChangeText={function (v) { update('fullName', v); }} />
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
// GOAL ICONS BACKGROUND — emojis fitness en fond Phase 5
// ============================================================

function GoalIconsBackground() {
  var icons = ['\uD83C\uDFAF', '\uD83C\uDFC6', '\uD83D\uDCCA', '\uD83D\uDC8E', '\u26A1', '\uD83D\uDD25'];
  var positions = [
    { bottom: '5%', left: '8%', size: 36, opacity: 0.06, rotate: '-12deg' },
    { bottom: '15%', right: '10%', size: 30, opacity: 0.05, rotate: '8deg' },
    { bottom: '8%', left: '40%', size: 28, opacity: 0.04, rotate: '-5deg' },
    { bottom: '22%', right: '35%', size: 32, opacity: 0.05, rotate: '15deg' },
    { bottom: '18%', left: '20%', size: 26, opacity: 0.04, rotate: '-8deg' },
    { bottom: '3%', right: '15%', size: 34, opacity: 0.03, rotate: '10deg' },
  ];
  var elements = [];
  for (var i = 0; i < icons.length; i++) {
    var pos = positions[i];
    elements.push(
      <Text key={'goal' + i} style={{
        position: 'absolute', bottom: pos.bottom, left: pos.left, right: pos.right,
        fontSize: pos.size, opacity: pos.opacity,
        transform: [{ rotate: pos.rotate }],
      }}>{icons[i]}</Text>
    );
  }
  return <>{elements}</>;
}

// ============================================================
// PHASE 2 — CORPS / MORPHOLOGIE — ScrollPickers + Doigt anime
// ============================================================

function Phase2Morphology(props) {
  var formData = props.formData; var setFormData = props.setFormData; var t = props.t;
  var lang = props.lang;

  var unitWeightState = useState('kg');
  var unitWeight = unitWeightState[0]; var setUnitWeight = unitWeightState[1];
  var unitHeightState = useState('cm');
  var unitHeight = unitHeightState[0]; var setUnitHeight = unitHeightState[1];

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  // Animation du doigt
  var fingerY = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    var loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fingerY, {
          toValue: 20, duration: 600,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(fingerY, {
          toValue: 0, duration: 600,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        Animated.delay(1500),
      ])
    );
    loop.start();
    return function () { loop.stop(); };
  }, [fingerY]);

  // Mini switch inline
  function renderUnitSwitch(left, right, value, onChange) {
    return (
      <View style={{
        flexDirection: 'row', alignSelf: 'center',
        borderRadius: 6, overflow: 'hidden',
        borderWidth: 1, borderColor: 'rgba(62,72,85,0.3)',
        marginBottom: 8,
      }}>
        <TouchableOpacity onPress={function () { onChange(left.key); }}>
          <View style={{
            paddingHorizontal: 12, paddingVertical: 4,
            backgroundColor: value === left.key ? 'rgba(0,217,132,0.15)' : 'transparent',
          }}>
            <Text style={{
              color: value === left.key ? '#00D984' : '#555E6C',
              fontSize: 9, fontWeight: '700', letterSpacing: 1,
            }}>{left.label}</Text>
          </View>
        </TouchableOpacity>
        <View style={{ width: 1, backgroundColor: 'rgba(62,72,85,0.3)' }} />
        <TouchableOpacity onPress={function () { onChange(right.key); }}>
          <View style={{
            paddingHorizontal: 12, paddingVertical: 4,
            backgroundColor: value === right.key ? 'rgba(0,217,132,0.15)' : 'transparent',
          }}>
            <Text style={{
              color: value === right.key ? '#00D984' : '#555E6C',
              fontSize: 9, fontWeight: '700', letterSpacing: 1,
            }}>{right.label}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Valeurs selon unite
  var weightVals = unitWeight === 'kg'
    ? Array.from({ length: 171 }, function (_, i) { return 30 + i; })
    : Array.from({ length: 371 }, function (_, i) { return 66 + i; });
  var heightVals = unitHeight === 'cm'
    ? Array.from({ length: 101 }, function (_, i) { return 120 + i; })
    : Array.from({ length: 49 }, function (_, i) { return 48 + i; });
  var ageVals = Array.from({ length: 83 }, function (_, i) { return 12 + i; });

  // Body icons background inline
  var bodyIcons = ['\u2696\uFE0F', '\uD83D\uDCCF', '\uD83C\uDF82', '\uD83D\uDCAA', '\uD83D\uDCD0', '\uD83E\uDE7A'];
  var bodyPositions = [
    { bottom: '4%', left: '5%', size: 32, opacity: 0.05, rotate: '-10deg' },
    { bottom: '10%', right: '8%', size: 26, opacity: 0.04, rotate: '12deg' },
    { bottom: '2%', left: '40%', size: 30, opacity: 0.04, rotate: '-5deg' },
    { bottom: '16%', right: '25%', size: 24, opacity: 0.03, rotate: '18deg' },
    { bottom: '7%', left: '65%', size: 28, opacity: 0.04, rotate: '-12deg' },
    { bottom: '14%', left: '15%', size: 22, opacity: 0.03, rotate: '8deg' },
  ];

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, position: 'relative' }}>

      {/* Icones transparentes background */}
      {bodyIcons.map(function (emoji, i) {
        var pos = bodyPositions[i];
        return (
          <Text key={'bi' + i} style={{
            position: 'absolute', bottom: pos.bottom, left: pos.left, right: pos.right,
            fontSize: pos.size, opacity: pos.opacity,
            transform: [{ rotate: pos.rotate }],
            zIndex: 0,
          }}>{emoji}</Text>
        );
      })}

      {/* HEADER — Instruction avec doigt anime */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14, gap: 8,
      }}>
        <Animated.View style={{ transform: [{ translateY: fingerY }] }}>
          <Ionicons name="finger-print" size={18} color="#00D984" />
        </Animated.View>
        <Text style={{
          color: '#8892A0', fontSize: 12, fontWeight: '500',
          fontStyle: 'italic',
        }}>
          {lang === 'fr' ? 'Scrollez pour modifier' : 'Scroll to adjust'}
        </Text>
      </View>

      {/* TITRES en ligne */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: 2, paddingHorizontal: 4,
      }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>
            {t.weightLabel}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>
            {t.heightLabel}
          </Text>
        </View>
        <View style={{ flex: 0.8, alignItems: 'center' }}>
          <Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '800', letterSpacing: 3 }}>
            {t.ageLabel}
          </Text>
        </View>
      </View>

      {/* SWITCHES en ligne */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        marginBottom: 6, paddingHorizontal: 4,
      }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {renderUnitSwitch({ key: 'kg', label: 'KG' }, { key: 'lb', label: 'LB' }, unitWeight, setUnitWeight)}
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {renderUnitSwitch({ key: 'cm', label: 'CM' }, { key: 'in', label: 'IN' }, unitHeight, setUnitHeight)}
        </View>
        <View style={{ flex: 0.8, alignItems: 'center' }}>
          <View style={{ height: 26 }} />
        </View>
      </View>

      {/* 3 SCROLL PICKERS */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        gap: 8, flex: 1, maxHeight: 300,
      }}>
        <View style={{ flex: 1 }}>
          <ScrollPicker
            values={weightVals}
            selectedValue={parseInt(formData.weight) || (unitWeight === 'kg' ? 70 : 154)}
            onSelect={function (v) { update('weight', String(v)); }}
            unit={unitWeight}
            color="#00D984"
            height={280}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ScrollPicker
            values={heightVals}
            selectedValue={parseInt(formData.height) || (unitHeight === 'cm' ? 175 : 69)}
            onSelect={function (v) { update('height', String(v)); }}
            unit={unitHeight}
            color="#00BFA6"
            height={280}
          />
        </View>
        <View style={{ flex: 0.8 }}>
          <ScrollPicker
            values={ageVals}
            selectedValue={parseInt(formData.age) || 25}
            onSelect={function (v) { update('age', String(v)); }}
            unit={lang === 'fr' ? 'ans' : 'y'}
            color="#D4AF37"
            height={280}
          />
        </View>
      </View>

      {/* SEXE */}
      <Text style={{
        color: '#EAEEF3', fontSize: 12, fontWeight: '800',
        letterSpacing: 3, textAlign: 'center',
        marginTop: 16, marginBottom: 12,
      }}>SEXE</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 10 }}>
        {[
          { key: 'male', icon: 'male', label: lang === 'fr' ? 'Homme' : 'Male',
            color: '#4A90D9', bgGrad: ['#4A90D9', '#2E6BB5'] },
          { key: 'female', icon: 'female', label: lang === 'fr' ? 'Femme' : 'Female',
            color: '#E875A0', bgGrad: ['#E875A0', '#C95A82'] },
        ].map(function (g) {
          var sel = formData.gender === g.key;
          return (
            <TouchableOpacity key={g.key} onPress={function () { update('gender', g.key); }} activeOpacity={0.7}>
              <View style={{ alignItems: 'center' }}>
                {sel ? (
                  <View style={{
                    position: 'absolute', top: -3, left: -3, right: -3, bottom: -22,
                    borderRadius: 43, borderWidth: 1.5, borderColor: g.color + '35',
                    shadowColor: g.color, shadowOpacity: 0.2, shadowRadius: 10,
                  }} />
                ) : null}
                <View style={{
                  width: 76, height: 76, borderRadius: 38, overflow: 'hidden',
                  borderWidth: sel ? 0 : 1.5, borderColor: 'rgba(62,72,85,0.3)',
                }}>
                  {sel ? (
                    <LinearGradient colors={g.bgGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={g.icon} size={30} color="#FFFFFF" />
                    </LinearGradient>
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E14' }}>
                      <Ionicons name={g.icon} size={26} color="#555E6C" />
                    </View>
                  )}
                </View>
                <Text style={{
                  color: sel ? g.color : '#555E6C',
                  fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 6,
                }}>{g.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ============================================================
// PHASE 3 — NIVEAU D'ACTIVITE
// ============================================================

function Phase3Activity(props) {
  var formData = props.formData; var setFormData = props.setFormData; var t = props.t;

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={[s.phaseIcon, { backgroundColor: 'rgba(0,217,132,0.08)', borderColor: 'rgba(0,217,132,0.2)' }]}>
          <Ionicons name="fitness-outline" size={24} color={C.emerald} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>
          {props.lang === 'fr' ? 'Votre activit\u00e9' : 'Your activity'}
        </Text>
        <Text style={s.phaseSubtitle}>
          {props.lang === 'fr' ? 'Quel est votre rythme ?' : 'What is your rhythm?'}
        </Text>
      </View>

      <Text style={[s.inputLabel, { marginBottom: 12 }]}>{t.activityLabel}</Text>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Barre verticale */}
        <View style={{ width: 4, borderRadius: 2, backgroundColor: 'rgba(62,72,85,0.2)', overflow: 'hidden' }}>
          <LinearGradient
            colors={['#00A866', '#00D984', '#00FFB2']}
            start={{ x: 0, y: 1 }} end={{ x: 0, y: 0 }}
            style={{
              width: '100%',
              height: ((formData.activityLevel + 1) / 5 * 100) + '%',
              position: 'absolute', bottom: 0, borderRadius: 2,
            }}
          />
        </View>

        {/* Les 5 niveaux */}
        <View style={{ flex: 1 }}>
          {t.activityLevels.map(function (level, i) {
            var isSelected = formData.activityLevel === i;
            return (
              <TouchableOpacity key={i} onPress={function () { update('activityLevel', i); }}
                activeOpacity={0.7} style={{ marginBottom: 8 }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 12, paddingHorizontal: 14,
                  borderRadius: 10, borderWidth: 1.2,
                  borderColor: isSelected ? 'rgba(0,217,132,0.4)' : C.metalBorder,
                  backgroundColor: isSelected ? 'rgba(0,217,132,0.06)' : C.bgDeep,
                  gap: 12,
                }}>
                  <View style={{
                    width: 46, height: 46, borderRadius: 12,
                    backgroundColor: isSelected ? 'rgba(0,217,132,0.12)' : 'rgba(62,72,85,0.15)',
                    borderWidth: 1, borderColor: isSelected ? 'rgba(0,217,132,0.25)' : 'rgba(62,72,85,0.2)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 24 }}>{level.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isSelected ? C.emerald : C.textPrimary, fontSize: 13, fontWeight: '600' }}>
                      {level.label}
                    </Text>
                    <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 1 }}>{level.desc}</Text>
                  </View>
                  {isSelected ? <Ionicons name="checkmark-circle" size={20} color={C.emerald} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================
// PHASE 4 — REGIME ALIMENTAIRE
// ============================================================

function Phase4Diet(props) {
  var formData = props.formData; var setFormData = props.setFormData; var t = props.t;

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={[s.phaseIcon, { backgroundColor: 'rgba(0,191,166,0.08)', borderColor: 'rgba(0,191,166,0.2)' }]}>
          <Ionicons name="nutrition-outline" size={24} color={C.turquoise} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>
          {props.lang === 'fr' ? 'Votre alimentation' : 'Your diet'}
        </Text>
        <Text style={s.phaseSubtitle}>
          {props.lang === 'fr' ? 'Quel r\u00e9gime suivez-vous ?' : 'What diet do you follow?'}
        </Text>
      </View>

      {t.diets.map(function (diet) {
        var selected = formData.diet === diet.key;
        return (
          <TouchableOpacity key={diet.key} onPress={function () { update('diet', diet.key); }}
            activeOpacity={0.7} style={{ marginBottom: 10 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              paddingVertical: 14, paddingHorizontal: 14,
              borderRadius: 12, borderWidth: 1.2,
              borderColor: selected ? diet.color + '50' : C.metalBorder,
              backgroundColor: selected ? diet.color + '08' : C.bgDeep,
              gap: 12,
            }}>
              <View style={{
                width: 50, height: 50, borderRadius: 14,
                backgroundColor: selected ? diet.color + '10' : 'rgba(62,72,85,0.12)',
                borderWidth: 1, borderColor: selected ? diet.color + '20' : 'rgba(62,72,85,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 26 }}>{diet.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: selected ? diet.color : C.textPrimary, fontSize: 14, fontWeight: '700' }}>
                  {diet.label}
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>{diet.desc}</Text>
              </View>
              {selected ? <Ionicons name="checkmark-circle" size={20} color={diet.color} /> : null}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ============================================================
// PHASE 5 — OBJECTIF
// ============================================================

function Phase5Goals(props) {
  var formData = props.formData; var setFormData = props.setFormData;
  var calculations = props.calculations; var t = props.t;

  var paceIcons = ['rocket-outline', 'speedometer-outline', 'leaf-outline'];
  var paceColors = ['#D4AF37', '#00D984', '#00BFA6'];

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, position: 'relative', minHeight: '100%' }}
      showsVerticalScrollIndicator={false}>

      {/* 3 cartes objectif avec gradient */}
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

          {/* Resume VOTRE PLAN — carte doree */}
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

      <GoalIconsBackground />
    </ScrollView>
  );
}

// ============================================================
// PHASE 6 — EDUCATION (cards enrichies + fun fact en bas)
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
              minHeight: 350, position: 'relative',
            }}>
              <CircuitPattern width={SCREEN_WIDTH - 60} height={350} color={item.color + '06'} />
              <FoodIconsBackground type={item.type} />

              {/* Header compact — valeur a droite */}
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

              <Text style={{ color: C.textPrimary, fontSize: 13.5, lineHeight: 21, marginBottom: 10 }}>
                {item.explanation}
              </Text>

              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 8,
                marginTop: 'auto', marginBottom: 50,
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
// PHASE 7 — SOURCES & DONNEES
// ============================================================

function Phase7Sources(props) {
  var lang = props.lang;
  var sources = [
    {
      name: 'USDA',
      fullName: lang === 'fr' ? 'D\u00e9partement de l\'Agriculture des \u00c9tats-Unis' : 'United States Dept. of Agriculture',
      desc: lang === 'fr' ? 'Base FoodData Central \u2014 Plus de 300 000 aliments r\u00e9f\u00e9renc\u00e9s' : 'FoodData Central \u2014 Over 300,000 referenced foods',
      icon: 'shield-checkmark-outline',
      color: '#00D984',
      flag: '\uD83C\uDDFA\uD83C\uDDF8',
    },
    {
      name: 'FAO / OMS',
      fullName: lang === 'fr' ? 'Organisation des Nations Unies pour l\'Alimentation' : 'United Nations Food & Agriculture Org.',
      desc: lang === 'fr' ? 'Standards internationaux sur les besoins nutritionnels' : 'International standards for nutritional needs',
      icon: 'globe-outline',
      color: '#00BFA6',
      flag: '\uD83C\uDDFA\uD83C\uDDF3',
    },
    {
      name: 'ANSES',
      fullName: lang === 'fr' ? 'Agence Nationale de S\u00e9curit\u00e9 Sanitaire (France)' : 'French National Safety Agency',
      desc: lang === 'fr' ? 'Table de composition CIQUAL \u2014 R\u00e9f\u00e9rence europ\u00e9enne' : 'CIQUAL composition table \u2014 European reference',
      icon: 'medical-outline',
      color: '#00D984',
      flag: '\uD83C\uDDEB\uD83C\uDDF7',
    },
    {
      name: lang === 'fr' ? 'Donn\u00e9es locales' : 'Local data',
      fullName: lang === 'fr' ? 'Institutions alimentaires r\u00e9gionales' : 'Regional food institutions',
      desc: lang === 'fr' ? 'Aliments traditionnels africains, asiatiques et sud-am\u00e9ricains int\u00e9gr\u00e9s' : 'Traditional African, Asian and South American foods integrated',
      icon: 'earth-outline',
      color: '#D4AF37',
      flag: '\uD83C\uDF0D',
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{
          width: 50, height: 50, borderRadius: 12,
          backgroundColor: 'rgba(0,217,132,0.08)',
          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="server-outline" size={24} color="#00D984" />
        </View>
        <Text style={{ color: '#EAEEF3', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 8, marginBottom: 4 }}>
          {lang === 'fr' ? 'Nos sources' : 'Our sources'}
        </Text>
        <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center' }}>
          {lang === 'fr' ? 'Des donn\u00e9es v\u00e9rifiables et certifi\u00e9es' : 'Verifiable and certified data'}
        </Text>
      </View>

      {/* Bandeau "Base de donnees LIXUM" */}
      <View style={{
        backgroundColor: 'rgba(0,217,132,0.04)',
        borderRadius: 12, padding: 14, marginBottom: 16,
        borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Ionicons name="cube-outline" size={16} color="#00D984" />
          <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
            {lang === 'fr' ? 'BASE DE DONN\u00c9ES LIXUM' : 'LIXUM DATABASE'}
          </Text>
        </View>
        <Text style={{ color: '#8892A0', fontSize: 12, lineHeight: 18 }}>
          {lang === 'fr'
            ? 'Notre base nutritionnelle combine les donn\u00e9es des institutions ci-dessous, v\u00e9rifi\u00e9es et mises \u00e0 jour r\u00e9guli\u00e8rement. Chaque aliment est contr\u00f4l\u00e9 par notre algorithme de coh\u00e9rence.'
            : 'Our nutritional database combines data from the institutions below, verified and regularly updated. Each food is checked by our consistency algorithm.'}
        </Text>
      </View>

      {/* Les 4 sources */}
      {sources.map(function (src, i) {
        return (
          <View key={i} style={{
            flexDirection: 'row', alignItems: 'center',
            padding: 14, borderRadius: 14,
            backgroundColor: '#0A0E14',
            borderWidth: 1, borderColor: src.color + '15',
            marginBottom: 10, gap: 12,
          }}>
            <View style={{
              width: 46, height: 46, borderRadius: 12,
              backgroundColor: src.color + '10',
              borderWidth: 1, borderColor: src.color + '20',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 22 }}>{src.flag}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#EAEEF3', fontSize: 14, fontWeight: '700' }}>{src.name}</Text>
              <Text style={{ color: '#8892A0', fontSize: 10, marginTop: 1 }}>{src.fullName}</Text>
              <Text style={{ color: '#555E6C', fontSize: 9, marginTop: 3, fontStyle: 'italic' }}>{src.desc}</Text>
            </View>
            <Ionicons name={src.icon} size={18} color={src.color} />
          </View>
        );
      })}

      {/* Formules utilisees */}
      <View style={{
        marginTop: 8, padding: 14, borderRadius: 12,
        backgroundColor: 'rgba(212,175,55,0.04)',
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Ionicons name="calculator-outline" size={14} color="#D4AF37" />
          <Text style={{ color: '#D4AF37', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>
            {lang === 'fr' ? 'FORMULES SCIENTIFIQUES' : 'SCIENTIFIC FORMULAS'}
          </Text>
        </View>
        <Text style={{ color: '#8892A0', fontSize: 11, lineHeight: 17 }}>
          {lang === 'fr'
            ? '\u2022 BMR : Mifflin-St Jeor (la plus pr\u00e9cise selon les \u00e9tudes)\n\u2022 TDEE : BMR \u00d7 coefficient d\'activit\u00e9 valid\u00e9\n\u2022 Macros : ratios adapt\u00e9s selon l\'objectif (WHO/OMS)\n\u2022 1 kg graisse \u2248 7 700 kcal (consensus scientifique)'
            : '\u2022 BMR: Mifflin-St Jeor (most accurate per studies)\n\u2022 TDEE: BMR \u00d7 validated activity coefficient\n\u2022 Macros: ratios adapted per goal (WHO)\n\u2022 1 kg fat \u2248 7,700 kcal (scientific consensus)'}
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================
// PHASE 8 — NOTIFICATIONS & CONFIDENTIALITE
// ============================================================

function Phase8Privacy(props) {
  var formData = props.formData; var setFormData = props.setFormData; var lang = props.lang;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{
          width: 50, height: 50, borderRadius: 12,
          backgroundColor: 'rgba(0,191,166,0.08)',
          borderWidth: 1, borderColor: 'rgba(0,191,166,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#00BFA6" />
        </View>
        <Text style={{ color: '#EAEEF3', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 8, marginBottom: 4 }}>
          {lang === 'fr' ? 'S\u00e9curit\u00e9 & Notifications' : 'Security & Notifications'}
        </Text>
        <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center' }}>
          {lang === 'fr' ? 'Vos donn\u00e9es, notre priorit\u00e9' : 'Your data, our priority'}
        </Text>
      </View>

      {/* === SECTION NOTIFICATIONS === */}
      <View style={{
        borderRadius: 14, padding: 16, marginBottom: 14,
        backgroundColor: '#0A0E14',
        borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Ionicons name="notifications-outline" size={18} color="#00D984" />
          <Text style={{ color: '#00D984', fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
            NOTIFICATIONS
          </Text>
        </View>

        <Text style={{ color: '#8892A0', fontSize: 12, lineHeight: 18, marginBottom: 14 }}>
          {lang === 'fr'
            ? 'Recevez des rappels personnalis\u00e9s pour vos repas, vos objectifs et vos r\u00e9compenses quotidiennes.'
            : 'Get personalized reminders for meals, goals, and daily rewards.'}
        </Text>

        {/* Toggle notifications */}
        {[
          {
            key: 'notifMeals',
            label: lang === 'fr' ? 'Rappels de repas' : 'Meal reminders',
            desc: lang === 'fr' ? 'Petit-d\u00e9jeuner, d\u00e9jeuner, d\u00eener' : 'Breakfast, lunch, dinner',
            icon: 'restaurant-outline',
          },
          {
            key: 'notifGoals',
            label: lang === 'fr' ? 'Suivi d\'objectifs' : 'Goal tracking',
            desc: lang === 'fr' ? 'Alertes quand vous approchez votre quota' : 'Alerts when approaching your quota',
            icon: 'flag-outline',
          },
          {
            key: 'notifRewards',
            label: lang === 'fr' ? 'R\u00e9compenses & Roue' : 'Rewards & Spin',
            desc: lang === 'fr' ? 'N\'oubliez pas votre tour gratuit' : 'Don\'t forget your free spin',
            icon: 'gift-outline',
          },
        ].map(function (notif) {
          var enabled = formData[notif.key] !== false;
          return (
            <TouchableOpacity
              key={notif.key}
              onPress={function () { var n = Object.assign({}, formData); n[notif.key] = !enabled; setFormData(n); }}
              activeOpacity={0.7}
              style={{ marginBottom: 10 }}
            >
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingVertical: 10, paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: enabled ? 'rgba(0,217,132,0.04)' : 'transparent',
                borderWidth: 1,
                borderColor: enabled ? 'rgba(0,217,132,0.2)' : 'rgba(62,72,85,0.2)',
              }}>
                <Ionicons name={notif.icon} size={18} color={enabled ? '#00D984' : '#555E6C'} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: enabled ? '#EAEEF3' : '#8892A0', fontSize: 13, fontWeight: '600' }}>
                    {notif.label}
                  </Text>
                  <Text style={{ color: '#555E6C', fontSize: 9, marginTop: 1 }}>{notif.desc}</Text>
                </View>
                {/* Toggle visuel */}
                <View style={{
                  width: 42, height: 24, borderRadius: 12,
                  backgroundColor: enabled ? '#00D984' : 'rgba(62,72,85,0.3)',
                  padding: 2, justifyContent: 'center',
                }}>
                  <View style={{
                    width: 20, height: 20, borderRadius: 10,
                    backgroundColor: '#EAEEF3',
                    alignSelf: enabled ? 'flex-end' : 'flex-start',
                    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
                  }} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* === SECTION CONFIDENTIALITE === */}
      <View style={{
        borderRadius: 14, padding: 16,
        backgroundColor: '#0A0E14',
        borderWidth: 1, borderColor: 'rgba(0,191,166,0.15)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Ionicons name="lock-closed-outline" size={18} color="#00BFA6" />
          <Text style={{ color: '#00BFA6', fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>
            {lang === 'fr' ? 'VOS DONN\u00c9ES' : 'YOUR DATA'}
          </Text>
        </View>

        {[
          {
            icon: 'cloud-done-outline',
            title: lang === 'fr' ? 'Stockage s\u00e9curis\u00e9' : 'Secure storage',
            desc: lang === 'fr' ? 'Vos donn\u00e9es sont chiffr\u00e9es et h\u00e9berg\u00e9es sur des serveurs conformes RGPD.' : 'Your data is encrypted and hosted on GDPR-compliant servers.',
          },
          {
            icon: 'eye-off-outline',
            title: lang === 'fr' ? 'Jamais vendues' : 'Never sold',
            desc: lang === 'fr' ? 'Vos informations personnelles ne sont jamais partag\u00e9es ni vendues \u00e0 des tiers.' : 'Your personal information is never shared or sold to third parties.',
          },
          {
            icon: 'trash-outline',
            title: lang === 'fr' ? 'Droit \u00e0 l\'oubli' : 'Right to be forgotten',
            desc: lang === 'fr' ? 'Vous pouvez supprimer votre compte et toutes vos donn\u00e9es \u00e0 tout moment.' : 'You can delete your account and all data at any time.',
          },
          {
            icon: 'finger-print',
            title: lang === 'fr' ? 'Authentification s\u00e9curis\u00e9e' : 'Secure authentication',
            desc: lang === 'fr' ? 'Connexion prot\u00e9g\u00e9e avec chiffrement de bout en bout.' : 'Protected login with end-to-end encryption.',
          },
        ].map(function (item, i) {
          return (
            <View key={i} style={{
              flexDirection: 'row', gap: 10, marginBottom: i < 3 ? 12 : 0,
              alignItems: 'flex-start',
            }}>
              <View style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: 'rgba(0,191,166,0.08)',
                borderWidth: 1, borderColor: 'rgba(0,191,166,0.15)',
                alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
              }}>
                <Ionicons name={item.icon} size={15} color="#00BFA6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '600' }}>{item.title}</Text>
                <Text style={{ color: '#555E6C', fontSize: 10, marginTop: 2, lineHeight: 15 }}>{item.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ============================================================
// PHASE 9 — PARRAINAGE / CODE PROMO
// ============================================================

function Phase9Referral(props) {
  var formData = props.formData; var setFormData = props.setFormData; var lang = props.lang;

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{
          width: 50, height: 50, borderRadius: 12,
          backgroundColor: 'rgba(212,175,55,0.08)',
          borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="people-outline" size={24} color="#D4AF37" />
        </View>
        <Text style={{ color: '#EAEEF3', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 8, marginBottom: 4 }}>
          {lang === 'fr' ? 'Parrainage' : 'Referral'}
        </Text>
        <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center' }}>
          {lang === 'fr' ? 'Vous avez un code promo ?' : 'Do you have a promo code?'}
        </Text>
      </View>

      {/* Illustration / accroche */}
      <View style={{
        backgroundColor: 'rgba(212,175,55,0.04)',
        borderRadius: 14, padding: 16, marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 40, marginBottom: 10 }}>{'\uD83C\uDF81'}</Text>
        <Text style={{ color: '#EAEEF3', fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 6 }}>
          {lang === 'fr' ? 'Bonus de bienvenue' : 'Welcome bonus'}
        </Text>
        <Text style={{ color: '#8892A0', fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          {lang === 'fr'
            ? 'Si un influenceur ou un ami vous a recommand\u00e9 LIXUM, entrez son code pour recevoir des LX Gems bonus.'
            : 'If an influencer or friend recommended LIXUM, enter their code to receive bonus LX Gems.'}
        </Text>
      </View>

      {/* Champ code promo */}
      <Text style={{
        color: '#8892A0', fontSize: 12, fontWeight: '600',
        marginBottom: 8, letterSpacing: 0.5,
      }}>
        {lang === 'fr' ? 'Code promo / parrainage' : 'Promo / referral code'}
      </Text>

      <View style={{
        borderRadius: 12, backgroundColor: '#0A0E14',
        borderWidth: 1.2,
        borderColor: formData.referralCode ? 'rgba(212,175,55,0.3)' : 'rgba(62,72,85,0.3)',
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14,
        marginBottom: 12,
      }}>
        <Ionicons name="ticket-outline" size={18}
          color={formData.referralCode ? '#D4AF37' : '#555E6C'} style={{ marginRight: 10 }} />
        <TextInput
          value={formData.referralCode}
          onChangeText={function (v) { update('referralCode', v.toUpperCase()); }}
          placeholder={lang === 'fr' ? 'Ex: LIXUM-INFLUENCEUR' : 'Ex: LIXUM-INFLUENCER'}
          placeholderTextColor="#3E4855"
          autoCapitalize="characters"
          style={{
            flex: 1, color: '#EAEEF3', fontSize: 15,
            fontWeight: '700', letterSpacing: 1,
            paddingVertical: 14,
          }}
        />
      </View>

      {/* Message optionnel */}
      <Text style={{
        color: '#555E6C', fontSize: 10, textAlign: 'center',
        fontStyle: 'italic', marginBottom: 20,
      }}>
        {lang === 'fr'
          ? 'Ce champ est optionnel. Vous pouvez passer cette \u00e9tape.'
          : 'This field is optional. You can skip this step.'}
      </Text>

      {/* Avantages du parrainage */}
      <View style={{
        borderRadius: 12, padding: 14,
        backgroundColor: '#0A0E14',
        borderWidth: 1, borderColor: 'rgba(62,72,85,0.2)',
      }}>
        <Text style={{ color: '#8892A0', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 }}>
          {lang === 'fr' ? 'AVANTAGES PARRAINAGE' : 'REFERRAL BENEFITS'}
        </Text>
        {[
          {
            icon: 'diamond',
            color: '#00D984',
            text: lang === 'fr' ? '+100 LX Gems de bienvenue' : '+100 LX Gems welcome bonus',
          },
          {
            icon: 'star-outline',
            color: '#D4AF37',
            text: lang === 'fr' ? 'Acc\u00e8s \u00e0 un tour de roue bonus' : 'Access to a bonus spin',
          },
          {
            icon: 'heart-outline',
            color: '#00BFA6',
            text: lang === 'fr' ? 'Votre parrain re\u00e7oit aussi des Gems' : 'Your referrer also receives Gems',
          },
        ].map(function (item, i) {
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <Ionicons name={item.icon} size={16} color={item.color} />
              <Text style={{ color: '#EAEEF3', fontSize: 12, flex: 1 }}>{item.text}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ============================================================
// SHIMMER TEXT — texte avec bande de lumiere animee
// ============================================================

function ShimmerText(shimmerProps) {
  var shimmerX = useRef(new Animated.Value(-100)).current;

  useEffect(function () {
    var loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2500),
        Animated.timing(shimmerX, {
          toValue: 350,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerX, {
          toValue: -100,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return function () { loop.stop(); };
  }, [shimmerX]);

  var shimmerOffset = Animated.add(shimmerX, 12);

  return (
    <View style={{ overflow: 'hidden', position: 'relative' }}>
      <Text style={shimmerProps.style}>{shimmerProps.text}</Text>
      {/* Bande large et douce */}
      <Animated.View style={{
        position: 'absolute',
        top: -5, bottom: -5,
        width: 25,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 10,
        transform: [
          { translateX: shimmerX },
          { skewX: '-25deg' },
        ],
      }} />
      {/* Bande fine et brillante */}
      <Animated.View style={{
        position: 'absolute',
        top: -5, bottom: -5,
        width: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 4,
        transform: [
          { translateX: shimmerOffset },
          { skewX: '-25deg' },
        ],
      }} />
    </View>
  );
}

// ============================================================
// CHARACTER SWIPE CARD — carte swipeable style Tinder
// ============================================================

function CharacterSwipeCard(props) {
  var character = props.character;
  var isTop = props.isTop;
  var onSwipe = props.onSwipe;
  var CARD_W = SCREEN_WIDTH - 80;

  var pan = useRef(new Animated.ValueXY()).current;

  var panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: function () { return isTop; },
      onMoveShouldSetPanResponder: function (_, g) { return isTop && Math.abs(g.dx) > 5; },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: function (_, gesture) {
        if (Math.abs(gesture.dx) > SCREEN_WIDTH * 0.25) {
          var dir = gesture.dx > 0 ? 1 : -1;
          Animated.timing(pan, {
            toValue: { x: dir * SCREEN_WIDTH * 1.5, y: gesture.dy },
            duration: 300,
            useNativeDriver: false,
          }).start(function () {
            onSwipe();
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  var rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  var cardStyle = isTop
    ? { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate: rotate }] }
    : { transform: [{ scale: 0.95 }, { translateY: 8 }], opacity: 0.5 };

  return (
    <Animated.View
      {...(isTop ? panResponder.panHandlers : {})}
      style={[{ position: 'absolute', zIndex: isTop ? 10 : 5 }, cardStyle]}
    >
      {/* CADRE METALLIQUE selon le niveau */}
      <View style={{
        width: CARD_W,
        borderRadius: 20,
        padding: 4,
        borderWidth: 2.5,
        borderTopColor: character.borderColors[0] + 'CC',
        borderLeftColor: character.borderColors[1] + '99',
        borderRightColor: character.borderColors[2] + '99',
        borderBottomColor: character.borderColors[2] + '66',
        backgroundColor: character.borderColors[2] + '30',
        shadowColor: character.borderColors[0],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
      }}>
        {/* Lisere interieur */}
        <View style={{
          borderRadius: 16,
          borderWidth: 1,
          borderColor: character.borderColors[0] + '30',
          overflow: 'hidden',
          backgroundColor: '#0F1318',
        }}>
          {/* IMAGE DU CARACTERE — prend tout l'espace */}
          <View style={{ height: 240, backgroundColor: '#0A0E14' }}>
            {character.image ? (
              <Image
                source={character.image}
                style={{
                  width: '100%',
                  height: '100%',
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 15,
                }}
                resizeMode="cover"
              />
            ) : (
              <View style={{
                flex: 1, alignItems: 'center', justifyContent: 'center',
                backgroundColor: character.borderColors[2] + '15',
              }}>
                <Text style={{ fontSize: 80 }}>{character.fallbackEmoji}</Text>
              </View>
            )}

            {/* Badge niveau en haut a gauche PAR-DESSUS l'image */}
            <View style={{
              position: 'absolute', top: 10, left: 10,
              paddingHorizontal: 10, paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderWidth: 1, borderColor: character.levelColor + '40',
            }}>
              <Text style={{
                color: character.levelColor,
                fontSize: 9, fontWeight: '800', letterSpacing: 2,
              }}>
                {character.level}
              </Text>
            </View>
          </View>

          {/* ZONE INFOS en bas */}
          <View style={{
            padding: 14,
            backgroundColor: '#0F1318',
            borderTopWidth: 1,
            borderTopColor: character.borderColors[0] + '15',
          }}>
            <Text style={{
              color: '#EAEEF3', fontSize: 18, fontWeight: '800',
              letterSpacing: 2, marginBottom: 4,
            }}>
              {character.name}
            </Text>
            <Text style={{
              color: character.levelColor, fontSize: 11, fontWeight: '600',
            }}>
              {character.power}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================================
// PHASE 10 — CARACTERES LIXUM — Swipe Tinder
// ============================================================

function Phase10Characters(props) {
  var lang = props.lang;
  var charIndexState = useState(0);
  var charIndex = charIndexState[0];
  var setCharIndex = charIndexState[1];

  var characters = [
    {
      name: 'GOLD CHICKEN',
      level: lang === 'fr' ? '\u00c9LITE' : 'ELITE',
      levelColor: '#D4AF37',
      borderColors: ['#D4AF37', '#C5A028', '#8B7516'],
      power: lang === 'fr' ? 'Recettes personnalis\u00e9es \u00b7 1 mois' : 'Custom recipes \u00b7 1 month',
      image: ChickenImg,
      fallbackEmoji: '\uD83D\uDC14',
    },
    {
      name: 'RUBY TIGER',
      level: 'RARE',
      levelColor: '#00D984',
      borderColors: ['#00D984', '#00A866', '#006B40'],
      power: lang === 'fr' ? 'D\u00e9bloque LIXUM SCAN \u00b7 14j' : 'Unlocks LIXUM SCAN \u00b7 14d',
      image: TigerImg,
      fallbackEmoji: '\uD83D\uDC2F',
    },
    {
      name: 'LICORNUM',
      level: lang === 'fr' ? 'MYTHIQUE' : 'MYTHIC',
      levelColor: '#00BFA6',
      borderColors: ['#00BFA6', '#00897B', '#005F56'],
      power: lang === 'fr' ? 'TOUT Premium \u00b7 30j' : 'ALL Premium \u00b7 30d',
      image: LicornumImg,
      fallbackEmoji: '\uD83E\uDD84',
    },
  ];

  var allSwiped = charIndex >= characters.length;

  var handleCharSwipe = function () {
    setCharIndex(function (prev) { return Math.min(prev + 1, characters.length); });
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <View style={{
          width: 50, height: 50, borderRadius: 12,
          backgroundColor: 'rgba(212,175,55,0.08)',
          borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Ionicons name="diamond-outline" size={24} color="#D4AF37" />
        </View>
        <Text style={{ color: '#EAEEF3', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 8 }}>
          {lang === 'fr' ? 'Caract\u00e8res LIXUM' : 'LIXUM Characters'}
        </Text>
        <ShimmerText
          text={lang === 'fr'
            ? 'Collectionnez des cartes\net d\u00e9bloquez des Pouvoirs'
            : 'Collect cards\nand unlock Powers'}
          style={{
            color: '#D4AF37',
            fontSize: 14,
            fontWeight: '700',
            textAlign: 'center',
            lineHeight: 20,
            letterSpacing: 0.5,
          }}
        />
      </View>

      {/* ZONE SWIPE — cartes empilees */}
      <View style={{
        height: 370,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
      }}>
        {!allSwiped ? (
          characters.slice(0).reverse().map(function (char, reverseIdx) {
            var actualIdx = characters.length - 1 - reverseIdx;
            if (actualIdx < charIndex) return null;
            if (actualIdx > charIndex + 1) return null;

            var isTop = actualIdx === charIndex;

            return (
              <CharacterSwipeCard
                key={char.name + '-' + charIndex}
                character={char}
                isTop={isTop}
                onSwipe={handleCharSwipe}
              />
            );
          })
        ) : (
          <View style={{
            alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}>
            <Ionicons name="sparkles" size={36} color="#D4AF37" />
            <Text style={{
              color: '#EAEEF3', fontSize: 18, fontWeight: '700',
              textAlign: 'center', marginTop: 12,
            }}>
              {lang === 'fr' ? 'Et bien d\'autres \u00e0 d\u00e9couvrir...' : 'And many more to discover...'}
            </Text>
            <Text style={{
              color: '#8892A0', fontSize: 12, textAlign: 'center', marginTop: 6,
            }}>
              {lang === 'fr' ? '12 caract\u00e8res \u00b7 3 niveaux de raret\u00e9' : '12 characters \u00b7 3 rarity levels'}
            </Text>
          </View>
        )}

        {/* Swipe hint sur la premiere carte */}
        {charIndex === 0 && !allSwiped ? (
          <View style={{
            position: 'absolute', bottom: 10, zIndex: 20,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingHorizontal: 12, paddingVertical: 6,
            borderRadius: 16, borderWidth: 1,
            borderColor: 'rgba(212,175,55,0.2)',
            flexDirection: 'row', alignItems: 'center', gap: 4,
          }}>
            <Ionicons name="chevron-back" size={12} color="#D4AF37" />
            <Text style={{ color: '#D4AF37', fontSize: 10, fontWeight: '600' }}>
              {lang === 'fr' ? 'Swipez' : 'Swipe'}
            </Text>
            <Ionicons name="chevron-forward" size={12} color="#D4AF37" />
          </View>
        ) : null}
      </View>

      {/* Dots indicateurs */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
        {characters.map(function (_, i) {
          return (
            <View key={i} style={{
              width: i === charIndex ? 20 : 6, height: 6, borderRadius: 3,
              backgroundColor: i === charIndex ? '#D4AF37' : i < charIndex ? '#8B7516' : 'rgba(62,72,85,0.3)',
            }} />
          );
        })}
      </View>

      {/* Comment ca marche */}
      <View style={{
        backgroundColor: 'rgba(212,175,55,0.04)',
        borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Ionicons name="sparkles" size={14} color="#D4AF37" />
          <Text style={{ color: '#D4AF37', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>
            {lang === 'fr' ? 'COMMENT \u00c7A MARCHE' : 'HOW IT WORKS'}
          </Text>
        </View>
        <View style={{ gap: 5 }}>
          {[
            { emoji: '\uD83C\uDFA1', text: lang === 'fr' ? 'Tournez la roue chaque jour' : 'Spin the wheel daily' },
            { emoji: '\uD83C\uDFAF', text: lang === 'fr' ? 'Accomplissez des missions' : 'Complete missions' },
            { icon: 'diamond', color: '#00D984', text: lang === 'fr' ? 'Gagnez des LX Gems et des cartes' : 'Earn LX Gems and cards' },
            { emoji: '\uD83C\uDCCF', text: lang === 'fr' ? 'Chaque carte d\u00e9bloque un pouvoir' : 'Each card unlocks a power' },
            { emoji: '\uD83D\uDD04', text: lang === 'fr' ? 'Transf\u00e9rez vos cartes entre membres' : 'Transfer cards between members' },
          ].map(function (line, i) {
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {line.emoji ? (
                  <Text style={{ fontSize: 12 }}>{line.emoji}</Text>
                ) : (
                  <Ionicons name={line.icon} size={12} color={line.color} />
                )}
                <Text style={{ color: '#8892A0', fontSize: 10, flex: 1 }}>{line.text}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Accroche finale */}
      <View style={{
        alignItems: 'center', marginTop: 12,
        backgroundColor: 'rgba(0,217,132,0.04)',
        borderRadius: 10, padding: 12,
        borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)',
      }}>
        <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '700', letterSpacing: 1, textAlign: 'center' }}>
          {lang === 'fr'
            ? '\uD83C\uDFA1 Votre premier tour de roue gratuit vous attend !'
            : '\uD83C\uDFA1 Your first free spin awaits!'}
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
    switch (step) {
      case 1:
        return formData.fullName.trim().length >= 3 &&
          formData.email && formData.email === formData.emailConfirm &&
          formData.password && formData.password.length >= 8 &&
          formData.password === formData.passwordConfirm;
      case 2:
        return formData.weight && formData.height && formData.age;
      case 3: return true;  // activite a valeur par defaut
      case 4: return formData.diet !== '';
      case 5: return formData.goal !== '';
      case 6: return true;  // education
      case 7: return true;  // sources (lecture)
      case 8: return true;  // notifications (optionnel)
      case 9: return true;  // parrainage (optionnel)
      case 10: return true; // teaser
      default: return true;
    }
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
// APP PRINCIPALE — 10 PHASES
// ============================================================

export default function App() {
  var _lang = useState('fr');
  var lang = _lang[0]; var setLang = _lang[1];

  var _step = useState(1);
  var step = _step[0]; var setStep = _step[1];

  var totalSteps = 10;
  var t = texts[lang];

  var stepInfo = lang === 'fr' ? [
    { title: 'Identit\u00e9', subtitle: 'Vos informations' },
    { title: 'Corps', subtitle: 'Votre morphologie' },
    { title: 'Activit\u00e9', subtitle: 'Votre rythme' },
    { title: 'R\u00e9gime', subtitle: 'Votre alimentation' },
    { title: 'Objectif', subtitle: 'Votre parcours' },
    { title: 'Macros', subtitle: 'Vos nutriments' },
    { title: 'Sources', subtitle: 'Nos donn\u00e9es' },
    { title: 'S\u00e9curit\u00e9', subtitle: 'Vos donn\u00e9es' },
    { title: 'Parrainage', subtitle: 'Code promo' },
    { title: 'Bonus', subtitle: 'Gamification' },
  ] : [
    { title: 'Identity', subtitle: 'Your info' },
    { title: 'Body', subtitle: 'Your metrics' },
    { title: 'Activity', subtitle: 'Your rhythm' },
    { title: 'Diet', subtitle: 'Your food' },
    { title: 'Goal', subtitle: 'Your journey' },
    { title: 'Macros', subtitle: 'Your nutrients' },
    { title: 'Sources', subtitle: 'Our data' },
    { title: 'Security', subtitle: 'Your data' },
    { title: 'Referral', subtitle: 'Promo code' },
    { title: 'Bonus', subtitle: 'Gamification' },
  ];

  var _formData = useState({
    fullName: '',
    email: '', emailConfirm: '',
    password: '', passwordConfirm: '',
    weight: '70', height: '175', age: '25',
    gender: 'male', activityLevel: 2,
    diet: 'classic',
    goal: '', targetKg: 5, timelineDays: 90, paceMode: 1,
    notifMeals: true, notifGoals: true, notifRewards: true,
    referralCode: '',
  });
  var formData = _formData[0]; var setFormData = _formData[1];

  var calculations = useMemo(function () {
    return calculateGoals(formData);
  }, [formData.weight, formData.height, formData.age, formData.gender,
      formData.activityLevel, formData.goal, formData.targetKg,
      formData.paceMode, formData.timelineDays]);

  var handleRegister = function () {
    var bonusGems = formData.referralCode ? 150 : 50;
    Alert.alert(
      lang === 'fr' ? 'Inscription simul\u00e9e' : 'Registration simulated',
      'BMR: ' + calculations.bmr + ' kcal\nTDEE: ' + calculations.tdee + ' kcal\nObjectif: ' + calculations.dailyTarget + ' kcal/jour\nLX Gems: ' + bonusGems
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
                paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6, gap: 14,
              }}>
                <CircularProgress step={step} total={totalSteps} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.textPrimary, fontSize: 15, fontWeight: '700' }}>
                    {stepInfo[step - 1].title}
                  </Text>
                  <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                    {stepInfo[step - 1].subtitle}
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

              {/* Dots indicateurs au lieu de labels */}
              <View style={{
                flexDirection: 'row', justifyContent: 'center',
                gap: 4, marginTop: 6, marginBottom: 2,
              }}>
                {Array.from({ length: 10 }).map(function (_, i) {
                  return (
                    <View key={i} style={{
                      width: i + 1 === step ? 16 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: i + 1 <= step ? '#00D984' : 'rgba(62,72,85,0.3)',
                    }} />
                  );
                })}
              </View>

              {/* Mini barre fine */}
              <View style={{ height: 2, backgroundColor: 'rgba(62,72,85,0.2)', marginHorizontal: 20, marginBottom: 8, marginTop: 6 }}>
                <LinearGradient
                  colors={['#00A866', '#00D984']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: (step / totalSteps * 100) + '%', borderRadius: 1 }} />
              </View>

              {/* Contenu de la phase */}
              <View style={{ flex: 1 }}>
                {step === 1 ? <Phase1Identity formData={formData} setFormData={setFormData} t={t} lang={lang} /> : null}
                {step === 2 ? <Phase2Morphology formData={formData} setFormData={setFormData} t={t} lang={lang} /> : null}
                {step === 3 ? <Phase3Activity formData={formData} setFormData={setFormData} t={t} lang={lang} /> : null}
                {step === 4 ? <Phase4Diet formData={formData} setFormData={setFormData} t={t} lang={lang} /> : null}
                {step === 5 ? <Phase5Goals formData={formData} setFormData={setFormData} calculations={calculations} t={t} lang={lang} /> : null}
                {step === 6 ? <Phase6Education calculations={calculations} t={t} lang={lang} /> : null}
                {step === 7 ? <Phase7Sources lang={lang} /> : null}
                {step === 8 ? <Phase8Privacy formData={formData} setFormData={setFormData} lang={lang} /> : null}
                {step === 9 ? <Phase9Referral formData={formData} setFormData={setFormData} lang={lang} /> : null}
                {step === 10 ? <Phase10Characters lang={lang} /> : null}
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
  inputPremiumFocused: {
    borderColor: 'rgba(0,217,132,0.4)',
    backgroundColor: '#0D1218',
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputValid: {
    borderColor: 'rgba(0, 217, 132, 0.3)',
  },
  inputText: {
    color: '#EAEEF3', fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
});
