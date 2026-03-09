// LIXUM - Register Page (Multi-Phase Wizard) v2.0 — Premium
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
    stepNames: ['Identit\u00e9', 'Morphologie', 'Objectif', 'D\u00e9couverte'],
    stepDescs: ['Vos informations', 'Votre corps', 'Votre parcours', 'Vos macros'],
    // Phase 1
    p1Title: 'Cr\u00e9er votre compte',
    p1Subtitle: 'Vos informations personnelles',
    identityLabel: 'IDENTIT\u00c9',
    emailLabel: 'EMAIL',
    securityLabel: 'S\u00c9CURIT\u00c9',
    firstName: 'Pr\u00e9nom',
    lastName: 'Nom',
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
    activityLabel: 'Niveau d\'activit\u00e9',
    activityLevels: [
      { label: 'S\u00e9dentaire', desc: 'Peu ou pas d\'exercice', icon: 'bed-outline' },
      { label: 'L\u00e9g\u00e8rement actif', desc: '1-2 fois/semaine', icon: 'walk-outline' },
      { label: 'Mod\u00e9r\u00e9ment actif', desc: '3-5 fois/semaine', icon: 'bicycle-outline' },
      { label: 'Tr\u00e8s actif', desc: '6-7 fois/semaine', icon: 'barbell-outline' },
      { label: 'Extr\u00eamement actif', desc: 'Athl\u00e8te / travail physique', icon: 'flame-outline' },
    ],
    // Phase 3
    p3Title: 'Votre objectif',
    p3Subtitle: 'Personnalisez votre parcours',
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
    // Phase 4
    p4Title: 'Saviez-vous que ?',
    p4Subtitle: 'Comprendre votre tableau de bord',
    slides: function (calc) {
      return [
        { icon: 'flame-outline', color: '#D4AF37', title: 'BMR', subtitle: 'M\u00e9tabolisme de Base', value: calc.bmr + ' kcal', explanation: 'C\'est l\'\u00e9nergie minimale que votre corps br\u00fble au repos pour maintenir ses fonctions vitales : respiration, circulation sanguine, r\u00e9gulation de la temp\u00e9rature.', funFact: 'Votre cerveau seul consomme environ 20% de votre BMR.' },
        { icon: 'flash-outline', color: '#00D984', title: 'TDEE', subtitle: 'D\u00e9pense \u00c9nerg\u00e9tique Totale', value: calc.tdee + ' kcal', explanation: 'C\'est votre BMR + les calories br\u00fbl\u00e9es par votre activit\u00e9 physique quotidienne. C\'est LE chiffre cl\u00e9 : mangez moins \u2192 perte. Mangez plus \u2192 prise.', funFact: 'Une heure de marche rapide br\u00fble environ 300 kcal.' },
        { icon: 'fish-outline', color: '#00BFA6', title: 'Prot\u00e9ines', subtitle: 'Les b\u00e2tisseurs du corps', value: calc.macros.protein + 'g / jour', explanation: 'Les prot\u00e9ines r\u00e9parent vos muscles, renforcent votre syst\u00e8me immunitaire et vous gardent rassasi\u00e9 plus longtemps. 1g = 4 kcal.', funFact: 'Vos cheveux, ongles et peau sont principalement faits de prot\u00e9ines.' },
        { icon: 'leaf-outline', color: '#00D984', title: 'Glucides', subtitle: 'Le carburant de l\'\u00e9nergie', value: calc.macros.carbs + 'g / jour', explanation: 'Les glucides sont la source d\'\u00e9nergie pr\u00e9f\u00e9r\u00e9e de votre cerveau et de vos muscles. Ils ne sont pas l\'ennemi \u2014 c\'est l\'exc\u00e8s qui l\'est. 1g = 4 kcal.', funFact: 'Votre cerveau consomme environ 120g de glucides par jour.' },
        { icon: 'water-outline', color: '#D4AF37', title: 'Lipides', subtitle: 'Les r\u00e9serves essentielles', value: calc.macros.fat + 'g / jour', explanation: 'Les lipides prot\u00e8gent vos organes, transportent les vitamines et produisent vos hormones. Tr\u00e8s denses en \u00e9nergie : 1g = 9 kcal.', funFact: '60% de votre cerveau est compos\u00e9 de graisses.' },
      ];
    },
    next: 'Suivant',
    createAccount: 'Cr\u00e9er mon compte',
  },
  en: {
    stepNames: ['Identity', 'Body', 'Goal', 'Discover'],
    stepDescs: ['Your info', 'Your body', 'Your journey', 'Your macros'],
    p1Title: 'Create your account',
    p1Subtitle: 'Your personal information',
    identityLabel: 'IDENTITY',
    emailLabel: 'EMAIL',
    securityLabel: 'SECURITY',
    firstName: 'First name',
    lastName: 'Last name',
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
      { label: 'Sedentary', desc: 'Little or no exercise', icon: 'bed-outline' },
      { label: 'Lightly active', desc: '1-2 times/week', icon: 'walk-outline' },
      { label: 'Moderately active', desc: '3-5 times/week', icon: 'bicycle-outline' },
      { label: 'Very active', desc: '6-7 times/week', icon: 'barbell-outline' },
      { label: 'Extremely active', desc: 'Athlete / physical job', icon: 'flame-outline' },
    ],
    p3Title: 'Your goal',
    p3Subtitle: 'Customize your journey',
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
    p4Title: 'Did you know?',
    p4Subtitle: 'Understanding your dashboard',
    slides: function (calc) {
      return [
        { icon: 'flame-outline', color: '#D4AF37', title: 'BMR', subtitle: 'Basal Metabolic Rate', value: calc.bmr + ' kcal', explanation: 'The minimum energy your body burns at rest to maintain vital functions: breathing, blood flow, temperature regulation.', funFact: 'Your brain alone uses about 20% of your BMR.' },
        { icon: 'flash-outline', color: '#00D984', title: 'TDEE', subtitle: 'Total Daily Energy Expenditure', value: calc.tdee + ' kcal', explanation: 'Your BMR + calories burned through daily physical activity. THE key number: eat less \u2192 lose. Eat more \u2192 gain.', funFact: 'One hour of brisk walking burns about 300 kcal.' },
        { icon: 'fish-outline', color: '#00BFA6', title: 'Protein', subtitle: 'The body builders', value: calc.macros.protein + 'g / day', explanation: 'Proteins repair muscles, strengthen your immune system, and keep you full longer. 1g = 4 kcal.', funFact: 'Your hair, nails and skin are mainly made of proteins.' },
        { icon: 'leaf-outline', color: '#00D984', title: 'Carbs', subtitle: 'The energy fuel', value: calc.macros.carbs + 'g / day', explanation: 'Carbs are the preferred energy source for your brain and muscles. They\'re not the enemy \u2014 excess is. 1g = 4 kcal.', funFact: 'Your brain uses about 120g of carbs per day.' },
        { icon: 'water-outline', color: '#D4AF37', title: 'Fats', subtitle: 'Essential reserves', value: calc.macros.fat + 'g / day', explanation: 'Fats protect organs, transport vitamins, and produce hormones. Very energy-dense: 1g = 9 kcal.', funFact: '60% of your brain is made of fat.' },
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
// PHASE 1 — IDENTITE (cartes glass)
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
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <PremiumInput label={t.firstName} value={formData.firstName}
              onChangeText={function (v) { update('firstName', v); }} />
          </View>
          <View style={{ flex: 1 }}>
            <PremiumInput label={t.lastName} value={formData.lastName}
              onChangeText={function (v) { update('lastName', v); }} />
          </View>
        </View>
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
// PHASE 2 — MORPHOLOGIE (jauges circulaires)
// ============================================================

function Phase2Morphology(props) {
  var formData = props.formData; var setFormData = props.setFormData; var t = props.t;

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  function updateNum(key, delta, min, max) {
    var cur = parseInt(formData[key]) || (key === 'weight' ? 70 : key === 'height' ? 175 : 25);
    update(key, String(Math.max(min, Math.min(max, cur + delta))));
  }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      {/* Poids + Taille cote a cote */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
        <GaugeCircle
          label={t.weightLabel} value={formData.weight} unit={t.kg} color={C.emerald}
          onMinus={function () { updateNum('weight', -1, 30, 200); }}
          onPlus={function () { updateNum('weight', 1, 30, 200); }}
        />
        <GaugeCircle
          label={t.heightLabel} value={formData.height} unit={t.cm} color={C.turquoise}
          onMinus={function () { updateNum('height', -1, 100, 230); }}
          onPlus={function () { updateNum('height', 1, 100, 230); }}
        />
      </View>

      {/* Age + Sexe cote a cote */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, alignItems: 'flex-start' }}>
        <GaugeCircle
          label={t.ageLabel} value={formData.age} unit={t.years} color={C.gold}
          size={80} fontSize={24} unitSize={9} btnSize={30} btnIconSize={14} btnGap={16}
          onMinus={function () { updateNum('age', -1, 10, 99); }}
          onPlus={function () { updateNum('age', 1, 10, 99); }}
        />

        {/* Sexe — deux cercles avec texte explicite */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: C.textSecondary, fontSize: 10, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 }}>
            {t.genderLabel}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={function () { update('gender', 'male'); }}>
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                borderWidth: 1.5,
                borderColor: formData.gender === 'male' ? C.emerald : 'rgba(62,72,85,0.3)',
                backgroundColor: formData.gender === 'male' ? 'rgba(0,217,132,0.10)' : C.bgInput,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="male" size={20}
                  color={formData.gender === 'male' ? C.emerald : C.textMuted} />
                <Text style={{
                  color: formData.gender === 'male' ? C.emerald : C.textMuted,
                  fontSize: 8, fontWeight: '700', marginTop: 2, letterSpacing: 0.5,
                }}>
                  {t.male}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={function () { update('gender', 'female'); }}>
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                borderWidth: 1.5,
                borderColor: formData.gender === 'female' ? C.turquoise : 'rgba(62,72,85,0.3)',
                backgroundColor: formData.gender === 'female' ? 'rgba(0,191,166,0.10)' : C.bgInput,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="female" size={20}
                  color={formData.gender === 'female' ? C.turquoise : C.textMuted} />
                <Text style={{
                  color: formData.gender === 'female' ? C.turquoise : C.textMuted,
                  fontSize: 8, fontWeight: '700', marginTop: 2, letterSpacing: 0.5,
                }}>
                  {t.female}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Niveau d'activite avec barre verticale */}
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
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: isSelected ? 'rgba(0,217,132,0.12)' : 'rgba(62,72,85,0.2)',
                    borderWidth: 1, borderColor: isSelected ? 'rgba(0,217,132,0.25)' : 'rgba(62,72,85,0.3)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name={level.icon} size={18} color={isSelected ? C.emerald : C.textMuted} />
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
// PHASE 3 — OBJECTIF
// ============================================================

function Phase3Goals(props) {
  var formData = props.formData; var setFormData = props.setFormData;
  var calculations = props.calculations; var t = props.t;

  var paceIcons = ['rocket-outline', 'speedometer-outline', 'leaf-outline'];
  var paceColors = ['#D4AF37', '#00D984', '#00BFA6'];

  function update(key, val) { var n = Object.assign({}, formData); n[key] = val; setFormData(n); }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
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
    </ScrollView>
  );
}

// ============================================================
// PHASE 4 — EDUCATION (cards compactes)
// ============================================================

function Phase4Education(props) {
  var calculations = props.calculations; var t = props.t;
  var slides = t.slides(calculations);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', marginBottom: 12, paddingHorizontal: 24 }}>
        <View style={[s.phaseIcon, { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: 'rgba(212,175,55,0.2)' }]}>
          <Ionicons name="bulb-outline" size={24} color={C.gold} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{t.p4Title}</Text>
        <Text style={s.phaseSubtitle}>{t.p4Subtitle}</Text>
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

              <Text style={{ color: C.textPrimary, fontSize: 11, lineHeight: 17, marginBottom: 10 }}>
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
// BOUTONS NAVIGATION PREMIUM
// ============================================================

function NavigationButtons(props) {
  var step = props.step; var setStep = props.setStep;
  var totalSteps = props.totalSteps; var formData = props.formData;
  var onComplete = props.onComplete; var t = props.t;

  var canNext = function () {
    if (step === 1) {
      return formData.firstName && formData.lastName &&
        formData.email && formData.email === formData.emailConfirm &&
        formData.password && formData.password.length >= 8 &&
        formData.password === formData.passwordConfirm;
    }
    if (step === 2) return formData.weight && formData.height && formData.age;
    if (step === 3) return formData.goal !== '';
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
// APP PRINCIPALE
// ============================================================

export default function App() {
  var _lang = useState('fr');
  var lang = _lang[0]; var setLang = _lang[1];

  var _step = useState(1);
  var step = _step[0]; var setStep = _step[1];

  var totalSteps = 4;
  var t = texts[lang];

  var _formData = useState({
    firstName: '', lastName: '',
    email: '', emailConfirm: '',
    password: '', passwordConfirm: '',
    weight: '', height: '', age: '',
    gender: 'male', activityLevel: 2,
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
      'BMR: ' + calculations.bmr + ' kcal\nTDEE: ' + calculations.tdee + ' kcal\nObjectif: ' + calculations.dailyTarget + ' kcal/jour'
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
                <CircularProgress step={step} total={4} />
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
                  style={{ height: '100%', width: (step / 4 * 100) + '%', borderRadius: 1 }} />
              </View>

              {/* Contenu de la phase */}
              <View style={{ flex: 1 }}>
                {step === 1 ? <Phase1Identity formData={formData} setFormData={setFormData} t={t} /> : null}
                {step === 2 ? <Phase2Morphology formData={formData} setFormData={setFormData} t={t} /> : null}
                {step === 3 ? <Phase3Goals formData={formData} setFormData={setFormData} calculations={calculations} t={t} /> : null}
                {step === 4 ? <Phase4Education calculations={calculations} t={t} /> : null}
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
