// LIXUM - Register Page (Multi-Phase Wizard) v1.0
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, react-native-reanimated,
//              @expo/vector-icons, react-native-svg,
//              react-native-safe-area-context
// Memes dependances que WelcomePage-test.js

import React, { useState, useMemo, useRef } from 'react';
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
import Svg, { Line, Circle, Rect } from 'react-native-svg';

var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;

// ============================================================
// COULEURS
// ============================================================

var C = {
  bgDeep: '#0D1117',
  bgPrimary: '#1A2030',
  bgCard: '#151B23',
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
    progressLabels: ['Identit\u00e9', 'Morphologie', 'Objectif', 'D\u00e9couverte'],
    // Phase 1
    p1Title: 'Cr\u00e9er votre compte',
    p1Subtitle: 'Vos informations personnelles',
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
    weight: 'Poids (kg)',
    height: 'Taille (cm)',
    age: '\u00c2ge',
    gender: 'Sexe',
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
      { key: 'maintain', label: 'Maintien en forme', icon: 'swap-horizontal-outline', color: '#00D984' },
      { key: 'gain', label: 'Prise de masse', icon: 'trending-up-outline', color: '#D4AF37' },
    ],
    howManyKg: function (goal) { return 'Combien de kg \u00e0 ' + (goal === 'lose' ? 'perdre' : 'gagner') + ' ?'; },
    yourPace: 'Votre rythme',
    paceLabels: ['Ambitieux', 'Raisonnable', 'R\u00e9aliste'],
    yourPlan: 'VOTRE PLAN',
    dailyGoal: function (cal) { return 'Objectif calorique quotidien : ' + cal + ' kcal'; },
    bmrTdee: function (bmr, tdee) { return 'BMR : ' + bmr + ' kcal \u00B7 TDEE : ' + tdee + ' kcal'; },
    protein: 'Prot\u00e9ines',
    carbs: 'Glucides',
    fat: 'Lipides',
    // Phase 4
    p4Title: 'Saviez-vous que ?',
    p4Subtitle: 'Comprendre votre tableau de bord',
    slides: function (calc) {
      return [
        {
          icon: 'flame-outline', color: '#D4AF37',
          title: 'BMR', subtitle: 'M\u00e9tabolisme de Base',
          value: calc.bmr + ' kcal',
          explanation: 'C\'est l\'\u00e9nergie minimale que votre corps br\u00fble au repos pour maintenir ses fonctions vitales : respiration, circulation sanguine, r\u00e9gulation de la temp\u00e9rature.\n\nM\u00eame allong\u00e9 toute la journ\u00e9e, votre corps consomme cette \u00e9nergie.',
          funFact: 'Votre cerveau seul consomme environ 20% de votre BMR.',
        },
        {
          icon: 'flash-outline', color: '#00D984',
          title: 'TDEE', subtitle: 'D\u00e9pense \u00c9nerg\u00e9tique Totale',
          value: calc.tdee + ' kcal',
          explanation: 'C\'est votre BMR + les calories br\u00fbl\u00e9es par votre activit\u00e9 physique quotidienne.\n\nC\'est LE chiffre cl\u00e9 : si vous mangez moins \u2192 vous perdez du poids. Si vous mangez plus \u2192 vous en gagnez.',
          funFact: 'Une heure de marche rapide br\u00fble environ 300 kcal.',
        },
        {
          icon: 'fish-outline', color: '#00BFA6',
          title: 'Prot\u00e9ines', subtitle: 'Les b\u00e2tisseurs du corps',
          value: calc.macros.protein + 'g / jour',
          explanation: 'Les prot\u00e9ines r\u00e9parent vos muscles, renforcent votre syst\u00e8me immunitaire et vous gardent rassasi\u00e9 plus longtemps.\n\n1g de prot\u00e9ine = 4 kcal.',
          funFact: 'Vos cheveux, ongles et peau sont principalement faits de prot\u00e9ines.',
        },
        {
          icon: 'leaf-outline', color: '#00D984',
          title: 'Glucides', subtitle: 'Le carburant de l\'\u00e9nergie',
          value: calc.macros.carbs + 'g / jour',
          explanation: 'Les glucides sont la source d\'\u00e9nergie pr\u00e9f\u00e9r\u00e9e de votre cerveau et de vos muscles.\n\nIls ne sont pas l\'ennemi \u2014 c\'est l\'exc\u00e8s qui l\'est.\n\n1g de glucide = 4 kcal.',
          funFact: 'Votre cerveau consomme environ 120g de glucides par jour.',
        },
        {
          icon: 'water-outline', color: '#D4AF37',
          title: 'Lipides', subtitle: 'Les r\u00e9serves essentielles',
          value: calc.macros.fat + 'g / jour',
          explanation: 'Les lipides prot\u00e8gent vos organes, transportent les vitamines et produisent vos hormones.\n\nIls sont essentiels mais tr\u00e8s denses en \u00e9nergie.\n\n1g de lipide = 9 kcal.',
          funFact: '60% de votre cerveau est compos\u00e9 de graisses.',
        },
      ];
    },
    // Navigation
    next: 'Suivant',
    createAccount: 'Cr\u00e9er mon compte',
    back: 'Retour',
    semaines: 'semaines',
  },
  en: {
    progressLabels: ['Identity', 'Body', 'Goal', 'Discover'],
    p1Title: 'Create your account',
    p1Subtitle: 'Your personal information',
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
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    age: 'Age',
    gender: 'Gender',
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
    howManyKg: function (goal) { return 'How many kg to ' + (goal === 'lose' ? 'lose' : 'gain') + '?'; },
    yourPace: 'Your pace',
    paceLabels: ['Ambitious', 'Reasonable', 'Realistic'],
    yourPlan: 'YOUR PLAN',
    dailyGoal: function (cal) { return 'Daily calorie goal: ' + cal + ' kcal'; },
    bmrTdee: function (bmr, tdee) { return 'BMR: ' + bmr + ' kcal \u00B7 TDEE: ' + tdee + ' kcal'; },
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    p4Title: 'Did you know?',
    p4Subtitle: 'Understanding your dashboard',
    slides: function (calc) {
      return [
        {
          icon: 'flame-outline', color: '#D4AF37',
          title: 'BMR', subtitle: 'Basal Metabolic Rate',
          value: calc.bmr + ' kcal',
          explanation: 'This is the minimum energy your body burns at rest to maintain vital functions: breathing, blood circulation, temperature regulation.\n\nEven lying down all day, your body uses this energy.',
          funFact: 'Your brain alone uses about 20% of your BMR.',
        },
        {
          icon: 'flash-outline', color: '#00D984',
          title: 'TDEE', subtitle: 'Total Daily Energy Expenditure',
          value: calc.tdee + ' kcal',
          explanation: 'This is your BMR + calories burned through daily physical activity.\n\nThis is THE key number: eat less \u2192 lose weight. Eat more \u2192 gain weight.',
          funFact: 'One hour of brisk walking burns about 300 kcal.',
        },
        {
          icon: 'fish-outline', color: '#00BFA6',
          title: 'Protein', subtitle: 'The body builders',
          value: calc.macros.protein + 'g / day',
          explanation: 'Proteins repair muscles, strengthen your immune system, and keep you full longer.\n\n1g of protein = 4 kcal.',
          funFact: 'Your hair, nails and skin are mainly made of proteins.',
        },
        {
          icon: 'leaf-outline', color: '#00D984',
          title: 'Carbs', subtitle: 'The energy fuel',
          value: calc.macros.carbs + 'g / day',
          explanation: 'Carbs are the preferred energy source for your brain and muscles.\n\nThey are not the enemy \u2014 excess is.\n\n1g of carb = 4 kcal.',
          funFact: 'Your brain uses about 120g of carbs per day.',
        },
        {
          icon: 'water-outline', color: '#D4AF37',
          title: 'Fats', subtitle: 'The essential reserves',
          value: calc.macros.fat + 'g / day',
          explanation: 'Fats protect your organs, transport vitamins, and produce hormones.\n\nThey are essential but very energy-dense.\n\n1g of fat = 9 kcal.',
          funFact: '60% of your brain is made of fat.',
        },
      ];
    },
    next: 'Next',
    createAccount: 'Create my account',
    back: 'Back',
    semaines: 'weeks',
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
  var gender = data.gender;
  var actMult = ACTIVITY_MULTIPLIERS[data.activityLevel];

  var bmr = gender === 'male'
    ? Math.round(10 * w + 6.25 * h - 5 * a + 5)
    : Math.round(10 * w + 6.25 * h - 5 * a - 161);

  var tdee = Math.round(bmr * actMult);

  var targetKg = data.targetKg || 5;
  var totalKcalNeeded = targetKg * 7700;

  var modes = {
    ambitious: {
      dailyDelta: Math.min(1000, Math.round(totalKcalNeeded / (data.timelineDays || 90))),
      days: Math.max(Math.ceil(totalKcalNeeded / 1000), 14),
    },
    reasonable: {
      dailyDelta: 500,
      days: Math.ceil(totalKcalNeeded / 500),
    },
    realistic: {
      dailyDelta: 300,
      days: Math.ceil(totalKcalNeeded / 300),
    },
  };
  modes.ambitious.weeksLabel = Math.ceil(modes.ambitious.days / 7);
  modes.reasonable.weeksLabel = Math.ceil(modes.reasonable.days / 7);
  modes.realistic.weeksLabel = Math.ceil(modes.realistic.days / 7);

  var selectedModeKey = ['ambitious', 'reasonable', 'realistic'][data.paceMode];
  var delta = modes[selectedModeKey].dailyDelta;

  var dailyTarget;
  if (data.goal === 'lose') {
    dailyTarget = tdee - delta;
  } else if (data.goal === 'gain') {
    dailyTarget = tdee + delta;
  } else {
    dailyTarget = tdee;
  }

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

  return { bmr: bmr, tdee: tdee, dailyTarget: dailyTarget, modes: modes, macros: macros, selectedMode: modes[selectedModeKey] };
}

// ============================================================
// CIRCUIT PATTERN — motifs circuit dans les cartes Phase 4
// ============================================================

function CircuitPattern(props) {
  var width = props.width;
  var height = props.height;
  var color = props.color || 'rgba(0, 217, 132, 0.06)';
  return (
    <Svg width={width} height={height}
      style={{ position: 'absolute', top: 0, left: 0 }}
      pointerEvents="none">
      <Line x1="20" y1={height * 0.15} x2={width * 0.35} y2={height * 0.15} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.35} cy={height * 0.15} r="2" fill={color} />
      <Line x1={width * 0.35} y1={height * 0.15} x2={width * 0.35} y2={height * 0.25} stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.65} y1={height * 0.12} x2={width - 20} y2={height * 0.12} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.65} cy={height * 0.12} r="2" fill={color} />
      <Line x1="15" y1={height * 0.50} x2="15" y2={height * 0.60} stroke={color} strokeWidth="0.8" />
      <Line x1="15" y1={height * 0.60} x2={width * 0.20} y2={height * 0.60} stroke={color} strokeWidth="0.8" />
      <Rect x={width * 0.20 - 3} y={height * 0.60 - 3} width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.70} y1={height * 0.75} x2={width - 15} y2={height * 0.75} stroke={color} strokeWidth="0.8" />
      <Circle cx={width - 15} cy={height * 0.85} r="2" fill={color} />
      <Circle cx={width * 0.50} cy={height * 0.30} r="1" fill={color} />
      <Circle cx={width * 0.85} cy={height * 0.45} r="1" fill={color} />
    </Svg>
  );
}

// ============================================================
// BARRE DE PROGRESSION PREMIUM
// ============================================================

function ProgressBar(props) {
  var step = props.step;
  var total = props.total;
  var labels = props.labels;
  var progress = step / total;

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {labels.map(function (label, i) {
          return (
            <Text key={i} style={{
              color: i + 1 <= step ? C.emerald : C.textMuted,
              fontSize: 9,
              fontWeight: i + 1 === step ? '700' : '500',
              letterSpacing: 0.5,
            }}>
              {label}
            </Text>
          );
        })}
      </View>
      <View style={{
        height: 4, borderRadius: 2,
        backgroundColor: 'rgba(62, 72, 85, 0.4)',
        overflow: 'hidden',
      }}>
        <LinearGradient
          colors={['#00A866', '#00D984', '#00FFB2']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{
            height: '100%',
            width: (progress * 100) + '%',
            borderRadius: 2,
          }}
        />
      </View>
      <Text style={{
        color: C.textMuted, fontSize: 11, textAlign: 'right', marginTop: 4,
      }}>
        {step}/{total}
      </Text>
    </View>
  );
}

// ============================================================
// PHASE 1 — IDENTITE
// ============================================================

function Phase1Identity(props) {
  var formData = props.formData;
  var setFormData = props.setFormData;
  var t = props.t;

  var emailsMatch = formData.email && formData.email === formData.emailConfirm;
  var passwordsMatch = formData.password && formData.password === formData.passwordConfirm;

  function update(key, val) {
    var next = Object.assign({}, formData);
    next[key] = val;
    setFormData(next);
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Icone phase */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={s.phaseIcon}>
          <Ionicons name="person-outline" size={24} color={C.emerald} />
        </View>
      </View>

      <Text style={s.phaseTitle}>{t.p1Title}</Text>
      <Text style={s.phaseSubtitle}>{t.p1Subtitle}</Text>

      {/* Prenom + Nom */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 0 }}>
        <View style={{ flex: 1 }}>
          <Text style={s.inputLabel}>{t.firstName}</Text>
          <View style={s.inputContainer}>
            <TextInput value={formData.firstName} onChangeText={function (v) { update('firstName', v); }}
              style={s.inputText} placeholderTextColor={C.metalBorder} />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.inputLabel}>{t.lastName}</Text>
          <View style={s.inputContainer}>
            <TextInput value={formData.lastName} onChangeText={function (v) { update('lastName', v); }}
              style={s.inputText} placeholderTextColor={C.metalBorder} />
          </View>
        </View>
      </View>

      {/* Email */}
      <Text style={s.inputLabel}>{t.email}</Text>
      <View style={s.inputContainer}>
        <TextInput value={formData.email} onChangeText={function (v) { update('email', v); }}
          keyboardType="email-address" autoCapitalize="none"
          style={s.inputText} placeholder="email@example.com" placeholderTextColor={C.metalBorder} />
      </View>

      {/* Confirmer Email */}
      <Text style={s.inputLabel}>{t.emailConfirm}</Text>
      <View style={[s.inputContainer, emailsMatch && s.inputValid]}>
        <TextInput value={formData.emailConfirm} onChangeText={function (v) { update('emailConfirm', v); }}
          keyboardType="email-address" autoCapitalize="none"
          style={s.inputText} placeholderTextColor={C.metalBorder} />
      </View>
      {formData.emailConfirm !== '' ? (
        <Text style={{ color: emailsMatch ? C.emerald : C.error, fontSize: 11, marginTop: -8, marginBottom: 8 }}>
          {emailsMatch ? t.emailMatch : t.emailNoMatch}
        </Text>
      ) : null}

      {/* Mot de passe */}
      <Text style={s.inputLabel}>{t.password}</Text>
      <View style={s.inputContainer}>
        <TextInput value={formData.password} onChangeText={function (v) { update('password', v); }}
          secureTextEntry style={s.inputText} placeholderTextColor={C.metalBorder} />
      </View>
      <Text style={{ color: C.textMuted, fontSize: 10, marginTop: -8, marginBottom: 8 }}>{t.passRules}</Text>

      {/* Confirmer mot de passe */}
      <Text style={s.inputLabel}>{t.passwordConfirm}</Text>
      <View style={[s.inputContainer, passwordsMatch && formData.passwordConfirm !== '' && s.inputValid]}>
        <TextInput value={formData.passwordConfirm} onChangeText={function (v) { update('passwordConfirm', v); }}
          secureTextEntry style={s.inputText} placeholderTextColor={C.metalBorder} />
      </View>
      {passwordsMatch && formData.passwordConfirm !== '' ? (
        <Text style={{ color: C.emerald, fontSize: 11, marginTop: -8 }}>{'\u2713'}</Text>
      ) : null}
    </ScrollView>
  );
}

// ============================================================
// PHASE 2 — MORPHOLOGIE
// ============================================================

function Phase2Morphology(props) {
  var formData = props.formData;
  var setFormData = props.setFormData;
  var t = props.t;

  function update(key, val) {
    var next = Object.assign({}, formData);
    next[key] = val;
    setFormData(next);
  }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={s.phaseIcon}>
          <Ionicons name="body-outline" size={24} color={C.emerald} />
        </View>
      </View>

      <Text style={s.phaseTitle}>{t.p2Title}</Text>
      <Text style={s.phaseSubtitle}>{t.p2Subtitle}</Text>

      {/* Poids + Taille */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={s.inputLabel}>{t.weight}</Text>
          <View style={s.inputContainer}>
            <TextInput value={formData.weight} onChangeText={function (v) { update('weight', v); }}
              keyboardType="numeric" style={s.inputText} placeholder="70" placeholderTextColor={C.metalBorder} />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.inputLabel}>{t.height}</Text>
          <View style={s.inputContainer}>
            <TextInput value={formData.height} onChangeText={function (v) { update('height', v); }}
              keyboardType="numeric" style={s.inputText} placeholder="175" placeholderTextColor={C.metalBorder} />
          </View>
        </View>
      </View>

      {/* Age + Sexe */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <View style={{ flex: 1 }}>
          <Text style={s.inputLabel}>{t.age}</Text>
          <View style={s.inputContainer}>
            <TextInput value={formData.age} onChangeText={function (v) { update('age', v); }}
              keyboardType="numeric" style={s.inputText} placeholder="25" placeholderTextColor={C.metalBorder} />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.inputLabel}>{t.gender}</Text>
          <View style={{
            flexDirection: 'row', borderRadius: 10, overflow: 'hidden',
            borderWidth: 1.2, borderColor: C.metalBorder,
          }}>
            <TouchableOpacity onPress={function () { update('gender', 'male'); }} style={{ flex: 1 }}>
              {formData.gender === 'male' ? (
                <LinearGradient colors={[C.emerald, C.emeraldDark]}
                  style={{ paddingVertical: 12, alignItems: 'center' }}>
                  <Ionicons name="male" size={18} color={C.bgDeep} />
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 12, alignItems: 'center', backgroundColor: C.bgDeep }}>
                  <Ionicons name="male" size={18} color={C.textMuted} />
                </View>
              )}
            </TouchableOpacity>
            <View style={{ width: 1, backgroundColor: C.metalBorder }} />
            <TouchableOpacity onPress={function () { update('gender', 'female'); }} style={{ flex: 1 }}>
              {formData.gender === 'female' ? (
                <LinearGradient colors={[C.emerald, C.emeraldDark]}
                  style={{ paddingVertical: 12, alignItems: 'center' }}>
                  <Ionicons name="female" size={18} color={C.bgDeep} />
                </LinearGradient>
              ) : (
                <View style={{ paddingVertical: 12, alignItems: 'center', backgroundColor: C.bgDeep }}>
                  <Ionicons name="female" size={18} color={C.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Niveau d'activite */}
      <Text style={[s.inputLabel, { marginBottom: 12 }]}>{t.activityLabel}</Text>

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
                borderWidth: 1,
                borderColor: isSelected ? 'rgba(0,217,132,0.25)' : 'rgba(62,72,85,0.3)',
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
    </ScrollView>
  );
}

// ============================================================
// PHASE 3 — OBJECTIF
// ============================================================

function Phase3Goals(props) {
  var formData = props.formData;
  var setFormData = props.setFormData;
  var calculations = props.calculations;
  var t = props.t;

  var paceIcons = ['rocket-outline', 'speedometer-outline', 'leaf-outline'];
  var paceColors = ['#D4AF37', '#00D984', '#00BFA6'];

  function update(key, val) {
    var next = Object.assign({}, formData);
    next[key] = val;
    setFormData(next);
  }

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={s.phaseIcon}>
          <Ionicons name="flag-outline" size={24} color={C.emerald} />
        </View>
      </View>

      <Text style={s.phaseTitle}>{t.p3Title}</Text>
      <Text style={s.phaseSubtitle}>{t.p3Subtitle}</Text>

      {/* 3 cartes objectif */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {t.goals.map(function (g) {
          var selected = formData.goal === g.key;
          return (
            <TouchableOpacity key={g.key} onPress={function () { update('goal', g.key); }}
              style={{ flex: 1 }} activeOpacity={0.7}>
              <View style={{
                paddingVertical: 16, paddingHorizontal: 8,
                borderRadius: 12, borderWidth: 1.2, alignItems: 'center',
                borderColor: selected ? g.color + '60' : C.metalBorder,
                backgroundColor: selected ? g.color + '10' : C.bgDeep,
              }}>
                <Ionicons name={g.icon} size={22} color={selected ? g.color : C.textMuted} />
                <Text style={{
                  color: selected ? g.color : C.textSecondary,
                  fontSize: 10, fontWeight: '600', marginTop: 6, textAlign: 'center',
                }}>
                  {g.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Si perte ou prise : kg + timeline */}
      {formData.goal && formData.goal !== 'maintain' ? (
        <View>
          <Text style={s.inputLabel}>{t.howManyKg(formData.goal)}</Text>

          {/* Jauge kg */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }}>
            <TouchableOpacity onPress={function () { update('targetKg', Math.max(1, formData.targetKg - 1)); }}>
              <Ionicons name="remove-circle-outline" size={28} color={C.emerald} />
            </TouchableOpacity>
            <View style={{
              flex: 1, height: 50, borderRadius: 12,
              backgroundColor: C.bgDeep, borderWidth: 1.2, borderColor: C.metalBorder,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: C.emerald, fontSize: 28, fontWeight: '800' }}>{formData.targetKg}</Text>
              <Text style={{ color: C.textMuted, fontSize: 9 }}>kg</Text>
            </View>
            <TouchableOpacity onPress={function () { update('targetKg', Math.min(30, formData.targetKg + 1)); }}>
              <Ionicons name="add-circle-outline" size={28} color={C.emerald} />
            </TouchableOpacity>
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
                    borderWidth: 1,
                    borderColor: selected ? paceColors[i] + '30' : 'rgba(62,72,85,0.3)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ionicons name={paceIcons[i]} size={18} color={selected ? paceColors[i] : C.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: selected ? paceColors[i] : C.textPrimary, fontSize: 14, fontWeight: '700' }}>
                      {label}
                    </Text>
                    <Text style={{ color: C.textSecondary, fontSize: 10, marginTop: 2 }}>
                      {modeData.dailyDelta} kcal/jour {'\u00B7'} {modeData.weeksLabel} {t.semaines}
                    </Text>
                  </View>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color={paceColors[i]} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Resume calcule */}
          <View style={{
            marginTop: 16, padding: 16, borderRadius: 12,
            backgroundColor: 'rgba(0,217,132,0.04)',
            borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
          }}>
            <Text style={{ color: C.emerald, fontSize: 12, fontWeight: '700', marginBottom: 8, letterSpacing: 1 }}>
              {t.yourPlan}
            </Text>
            <Text style={{ color: C.textPrimary, fontSize: 13, lineHeight: 20 }}>
              {t.dailyGoal(calculations.dailyTarget)}
            </Text>
            <Text style={{ color: C.textSecondary, fontSize: 11, marginTop: 2 }}>
              {t.bmrTdee(calculations.bmr, calculations.tdee)}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 20 }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.turquoise, fontSize: 16, fontWeight: '800' }}>{calculations.macros.protein}g</Text>
                <Text style={{ color: C.textMuted, fontSize: 9 }}>{t.protein}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.emerald, fontSize: 16, fontWeight: '800' }}>{calculations.macros.carbs}g</Text>
                <Text style={{ color: C.textMuted, fontSize: 9 }}>{t.carbs}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: C.gold, fontSize: 16, fontWeight: '800' }}>{calculations.macros.fat}g</Text>
                <Text style={{ color: C.textMuted, fontSize: 9 }}>{t.fat}</Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

// ============================================================
// PHASE 4 — EDUCATION (Saviez-vous ?)
// ============================================================

function Phase4Education(props) {
  var calculations = props.calculations;
  var t = props.t;
  var slides = t.slides(calculations);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', marginBottom: 12, paddingHorizontal: 24 }}>
        <View style={[s.phaseIcon, {
          backgroundColor: 'rgba(212,175,55,0.08)',
          borderColor: 'rgba(212,175,55,0.2)',
        }]}>
          <Ionicons name="bulb-outline" size={24} color={C.gold} />
        </View>
        <Text style={[s.phaseTitle, { marginTop: 8 }]}>{t.p4Title}</Text>
        <Text style={s.phaseSubtitle}>{t.p4Subtitle}</Text>
      </View>

      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH - 48}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 24 }}
        ItemSeparatorComponent={function () { return <View style={{ width: 12 }} />; }}
        renderItem={function (info) {
          var item = info.item;
          return (
            <View style={{
              width: SCREEN_WIDTH - 60,
              borderRadius: 16,
              backgroundColor: C.bgCard,
              borderWidth: 1.2,
              borderColor: item.color + '25',
              padding: 20,
              overflow: 'hidden',
            }}>
              <CircuitPattern width={SCREEN_WIDTH - 60} height={380} color={item.color + '06'} />

              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 10,
                  backgroundColor: item.color + '12',
                  borderWidth: 1, borderColor: item.color + '25',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View>
                  <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '800' }}>{item.title}</Text>
                  <Text style={{ color: C.textSecondary, fontSize: 10 }}>{item.subtitle}</Text>
                </View>
              </View>

              {/* Valeur */}
              <View style={{
                backgroundColor: item.color + '08', borderRadius: 10,
                paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14,
                borderWidth: 1, borderColor: item.color + '15',
              }}>
                <Text style={{ color: item.color, fontSize: 20, fontWeight: '800', textAlign: 'center' }}>
                  {item.value}
                </Text>
              </View>

              {/* Explication */}
              <Text style={{ color: C.textPrimary, fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                {item.explanation}
              </Text>

              {/* Fun fact */}
              <View style={{
                flexDirection: 'row', alignItems: 'flex-start', gap: 8,
                backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 10,
              }}>
                <Ionicons name="sparkles" size={14} color={item.color} style={{ marginTop: 2 }} />
                <Text style={{ color: C.textSecondary, fontSize: 11, flex: 1, lineHeight: 16, fontStyle: 'italic' }}>
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
// BOUTONS DE NAVIGATION
// ============================================================

function NavigationButtons(props) {
  var step = props.step;
  var setStep = props.setStep;
  var totalSteps = props.totalSteps;
  var formData = props.formData;
  var onComplete = props.onComplete;
  var t = props.t;

  var canNext = function () {
    if (step === 1) {
      return formData.firstName && formData.lastName &&
        formData.email && formData.email === formData.emailConfirm &&
        formData.password && formData.password.length >= 8 &&
        formData.password === formData.passwordConfirm;
    }
    if (step === 2) {
      return formData.weight && formData.height && formData.age;
    }
    if (step === 3) {
      return formData.goal !== '';
    }
    return true;
  };

  var enabled = canNext();

  return (
    <View style={{
      flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 12, gap: 12,
      paddingBottom: Platform.OS === 'android' ? 16 : 12,
    }}>
      {step > 1 ? (
        <TouchableOpacity onPress={function () { setStep(step - 1); }}
          style={{
            flex: 0.4, paddingVertical: 14, borderRadius: 12,
            borderWidth: 1.2, borderColor: C.metalBorder,
            backgroundColor: C.bgDeep, alignItems: 'center',
          }}>
          <Ionicons name="arrow-back" size={18} color={C.textSecondary} />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        onPress={function () { step < totalSteps ? setStep(step + 1) : onComplete(); }}
        disabled={!enabled}
        activeOpacity={0.7}
        style={{ flex: 1, borderRadius: 12, overflow: 'hidden', opacity: enabled ? 1 : 0.4 }}>
        {step === totalSteps ? (
          <LinearGradient colors={['#D4AF37', '#C5A028', '#A68B1B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: C.bgDeep, fontSize: 15, fontWeight: '800', letterSpacing: 1 }}>
              {t.createAccount}
            </Text>
          </LinearGradient>
        ) : (
          <View style={{
            paddingVertical: 14, alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.08)',
            borderWidth: 1.2, borderColor: 'rgba(0,217,132,0.3)',
            borderRadius: 12,
          }}>
            <Text style={{ color: C.emerald, fontSize: 15, fontWeight: '700' }}>
              {t.next}
            </Text>
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
  var lang = _lang[0];
  var setLang = _lang[1];

  var _step = useState(1);
  var step = _step[0];
  var setStep = _step[1];

  var totalSteps = 4;
  var t = texts[lang];

  var _formData = useState({
    firstName: '',
    lastName: '',
    email: '',
    emailConfirm: '',
    password: '',
    passwordConfirm: '',
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 2,
    goal: '',
    targetKg: 5,
    timelineDays: 90,
    paceMode: 1,
  });
  var formData = _formData[0];
  var setFormData = _formData[1];

  var calculations = useMemo(function () {
    return calculateGoals(formData);
  }, [formData.weight, formData.height, formData.age, formData.gender,
      formData.activityLevel, formData.goal, formData.targetKg,
      formData.paceMode, formData.timelineDays]);

  var handleRegister = function () {
    Alert.alert(
      lang === 'fr' ? 'Inscription simul\u00e9e' : 'Registration simulated',
      lang === 'fr'
        ? 'Compte cr\u00e9\u00e9 !\n\nBMR: ' + calculations.bmr + ' kcal\nTDEE: ' + calculations.tdee + ' kcal\nObjectif: ' + calculations.dailyTarget + ' kcal/jour'
        : 'Account created!\n\nBMR: ' + calculations.bmr + ' kcal\nTDEE: ' + calculations.tdee + ' kcal\nGoal: ' + calculations.dailyTarget + ' kcal/day'
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
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ flex: 1 }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              {/* Header : drapeaux langue */}
              <View style={{
                flexDirection: 'row', justifyContent: 'flex-end',
                paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 4 : 0,
                gap: 8,
              }}>
                <TouchableOpacity onPress={function () { setLang('en'); }} activeOpacity={0.7}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 7, paddingVertical: 4,
                    borderRadius: 6, borderWidth: 1, gap: 3,
                    borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.5)',
                    backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'rgba(27,31,38,0.6)',
                  }}>
                    <Text style={{ fontSize: 11 }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text>
                    <Text style={{ color: lang === 'en' ? C.emerald : C.textMuted, fontSize: 8, fontWeight: '700' }}>EN</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={function () { setLang('fr'); }} activeOpacity={0.7}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 7, paddingVertical: 4,
                    borderRadius: 6, borderWidth: 1, gap: 3,
                    borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.5)',
                    backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'rgba(27,31,38,0.6)',
                  }}>
                    <Text style={{ fontSize: 11 }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text>
                    <Text style={{ color: lang === 'fr' ? C.emerald : C.textMuted, fontSize: 8, fontWeight: '700' }}>FR</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Barre de progression */}
              <ProgressBar step={step} total={totalSteps} labels={t.progressLabels} />

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
                formData={formData} onComplete={handleRegister} t={t}
              />
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
    color: '#EAEEF3', fontSize: 22, fontWeight: '700',
    textAlign: 'center', marginBottom: 4,
  },
  phaseSubtitle: {
    color: '#8892A0', fontSize: 13, textAlign: 'center', marginBottom: 24,
  },
  inputLabel: {
    color: '#8892A0', fontSize: 12, fontWeight: '600',
    marginBottom: 6, letterSpacing: 0.5,
  },
  inputContainer: {
    borderRadius: 10, marginBottom: 14,
    backgroundColor: '#0D1117',
    borderWidth: 1.2,
    borderTopColor: '#0A0D12',
    borderLeftColor: '#0D1015',
    borderRightColor: '#2A303B',
    borderBottomColor: '#3E4855',
  },
  inputValid: {
    borderColor: 'rgba(0, 217, 132, 0.3)',
    borderTopColor: 'rgba(0, 217, 132, 0.2)',
    borderBottomColor: 'rgba(0, 217, 132, 0.3)',
  },
  inputText: {
    color: '#EAEEF3', fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
  },
});
