// LIXUM - Register Page v6.0 — 6 Phases Premium
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context,
//              react-native-reanimated, react-native-gesture-handler,
//              @react-native-async-storage/async-storage
//
// IMAGES REQUISES dans /assets :
//   emerald_owl.webp, mosquito.webp, diamond_simba.webp
//
// v6.0 — 6 phases (1-5 données + 6 caractères swipe Tinder)
//         Phases éducation/sources/privacy/referral déplacées post-inscription

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, Image, StyleSheet, Dimensions,
  TouchableOpacity, ScrollView, Platform, StatusBar,
  KeyboardAvoidingView, Modal, ActivityIndicator,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle as SvgCircle, Line, Rect, Path } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, runOnJS, interpolate, Extrapolation,
  Easing as REasing, FadeInDown,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

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

var SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';

// ============================================================
// TRADUCTIONS — 6 phases
// ============================================================
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
    goals: [
      { key: 'lose', label: 'Perte de poids', icon: 'trending-down-outline', color: '#00BFA6' },
      { key: 'maintain', label: 'Maintien', icon: 'swap-horizontal-outline', color: '#00D984' },
      { key: 'gain', label: 'Prise de masse', icon: 'trending-up-outline', color: '#D4AF37' },
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
    goals: [
      { key: 'lose', label: 'Weight loss', icon: 'trending-down-outline', color: '#00BFA6' },
      { key: 'maintain', label: 'Stay fit', icon: 'swap-horizontal-outline', color: '#00D984' },
      { key: 'gain', label: 'Weight gain', icon: 'trending-up-outline', color: '#D4AF37' },
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

// ============================================================
// CALCUL — Mifflin-St Jeor + TDEE
// ============================================================
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

// ============================================================
// TECHBACKGROUND — grille + points verts + tirets HUD
// ============================================================
function TechBackground() {
  var gridSpacing = 50; var lines = []; var dots = [];
  for (var y = 0; y < H; y += gridSpacing)
    lines.push(<Line key={'h'+y} x1="0" y1={y} x2={W} y2={y} stroke="rgba(62,72,85,0.25)" strokeWidth="0.5" />);
  for (var x = 0; x < W; x += gridSpacing)
    lines.push(<Line key={'v'+x} x1={x} y1="0" x2={x} y2={H} stroke="rgba(62,72,85,0.25)" strokeWidth="0.5" />);
  for (var x2 = 0; x2 < W; x2 += gridSpacing*2)
    for (var y2 = 0; y2 < H; y2 += gridSpacing*2)
      dots.push(<SvgCircle key={'d'+x2+'-'+y2} cx={x2} cy={y2} r="1.5" fill="rgba(0,217,132,0.14)" />);
  return (
    <Svg width={W} height={H} style={{ position:'absolute', top:0, left:0 }} pointerEvents="none">
      {lines}{dots}
      <Line x1="60" y1={H*0.35} x2="90" y2={H*0.35} stroke="rgba(0,217,132,0.15)" strokeWidth="1" strokeDasharray="4 3" />
      <Line x1={W-90} y1={H*0.35} x2={W-60} y2={H*0.35} stroke="rgba(0,217,132,0.15)" strokeWidth="1" strokeDasharray="4 3" />
    </Svg>
  );
}

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================
function CircuitPattern(props) {
  var w = props.width, h = props.height, color = props.color || 'rgba(0,217,132,0.06)';
  return (
    <Svg width={w} height={h} style={{ position:'absolute', top:0, left:0 }} pointerEvents="none">
      <Line x1="20" y1={h*0.15} x2={w*0.35} y2={h*0.15} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w*0.35} cy={h*0.15} r="2" fill={color} />
      <Line x1={w*0.65} y1={h*0.12} x2={w-20} y2={h*0.12} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w*0.65} cy={h*0.12} r="2" fill={color} />
      <Line x1="15" y1={h*0.50} x2={w*0.20} y2={h*0.60} stroke={color} strokeWidth="0.8" />
      <SvgCircle cx={w*0.50} cy={h*0.30} r="1" fill={color} />
      <SvgCircle cx={w*0.85} cy={h*0.45} r="1" fill={color} />
    </Svg>
  );
}

function CircularProgress(props) {
  var step = props.step, total = props.total, size = 44, sw = 3;
  var r = (size-sw)/2, circ = 2*Math.PI*r, prog = (step/total)*circ;
  return (
    <View style={{ width:size, height:size, alignItems:'center', justifyContent:'center' }}>
      <Svg width={size} height={size} style={{ transform:[{rotate:'-90deg'}] }}>
        <SvgCircle cx={size/2} cy={size/2} r={r} stroke="rgba(62,72,85,0.3)" strokeWidth={sw} fill="none" />
        <SvgCircle cx={size/2} cy={size/2} r={r} stroke={C.emerald} strokeWidth={sw} fill="none"
          strokeDasharray={circ} strokeDashoffset={circ-prog} strokeLinecap="round" />
      </Svg>
      <Text style={{ position:'absolute', color:C.emerald, fontSize:13, fontWeight:'800' }}>{step}/{total}</Text>
    </View>
  );
}

function GlassCard(props) {
  return (
    <View style={[{ borderRadius:16, marginBottom:14, borderWidth:1.2, borderTopColor:'rgba(138,146,160,0.2)',
      borderBottomColor:'rgba(26,31,38,0.4)', borderLeftColor:'rgba(107,123,141,0.12)',
      borderRightColor:'rgba(42,48,59,0.25)', backgroundColor:C.bgCard, padding:16 }, props.style]}>
      <View style={{ position:'absolute', top:0, left:14, right:14, height:1, backgroundColor:'rgba(255,255,255,0.05)' }} />
      {props.sectionIcon ? (
        <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 }}>
          <Ionicons name={props.sectionIcon} size={14} color={C.emerald} />
          <Text style={{ color:C.emerald, fontSize:10, fontWeight:'700', letterSpacing:1.5 }}>{props.sectionLabel}</Text>
        </View>
      ) : null}
      {props.children}
    </View>
  );
}

function PremiumInput(props) {
  var borderRef = useRef(null);
  return (
    <View style={{ marginBottom: props.noMargin ? 0 : 12 }}>
      {props.label ? <Text style={s.inputLabel}>{props.label}</Text> : null}
      <View ref={borderRef} style={[s.inputPremium, props.valid && s.inputValid]}>
        <TextInput value={props.value} onChangeText={props.onChangeText} style={s.inputText}
          placeholder={props.placeholder} placeholderTextColor={C.metalBorder}
          keyboardType={props.keyboardType} autoCapitalize={props.autoCapitalize}
          secureTextEntry={props.secureTextEntry}
          onFocus={function(){ if(borderRef.current) borderRef.current.setNativeProps({ style:{ borderColor:C.emerald, borderWidth:1.5 } }); }}
          onBlur={function(){ if(borderRef.current) borderRef.current.setNativeProps({ style:{ borderColor:C.metalBorder, borderWidth:1 } }); }}
        />
      </View>
    </View>
  );
}

// ============================================================
// SCROLL PICKER
// ============================================================
var ScrollPicker = function(pp) {
  var values=pp.values, selectedValue=pp.selectedValue, onSelect=pp.onSelect, unit=pp.unit;
  var color=pp.color||'#00D984', pickerH=pp.height||260, ITEM_H=50;
  var scrollRef = useRef(null);
  var padTop = pickerH/2-ITEM_H/2, padBot = pickerH/2-ITEM_H/2;
  var initialIdx = Math.max(0, values.indexOf(selectedValue));

  useEffect(function(){ var t=setTimeout(function(){
    if(scrollRef.current) scrollRef.current.scrollTo({ y:initialIdx*ITEM_H, animated:false });
  },100); return function(){clearTimeout(t)}; },[initialIdx]);

  var snap = useCallback(function(e){
    var y=e.nativeEvent.contentOffset.y, idx=Math.round(y/ITEM_H);
    var cl=Math.max(0,Math.min(idx,values.length-1));
    if(values[cl]!==selectedValue) onSelect(values[cl]);
  },[values,selectedValue,onSelect]);

  return (
    <View style={{ height:pickerH, overflow:'hidden', borderRadius:14, borderWidth:1, borderColor:color+'18', backgroundColor:'#0A0E14' }}>
      <View style={{ position:'absolute', top:pickerH/2-ITEM_H/2, left:6, right:6, height:ITEM_H, borderRadius:10, backgroundColor:color+'0D' }}>
        <View style={{ position:'absolute', left:0, top:8, bottom:8, width:3, borderRadius:2, backgroundColor:color }} />
      </View>
      <LinearGradient colors={['#0A0E14','rgba(10,14,20,0.7)','rgba(10,14,20,0)']}
        style={{ position:'absolute', top:0, left:0, right:0, height:pickerH*0.35, zIndex:3, borderTopLeftRadius:14, borderTopRightRadius:14 }} pointerEvents="none" />
      <LinearGradient colors={['rgba(10,14,20,0)','rgba(10,14,20,0.7)','#0A0E14']}
        style={{ position:'absolute', bottom:0, left:0, right:0, height:pickerH*0.35, zIndex:3, borderBottomLeftRadius:14, borderBottomRightRadius:14 }} pointerEvents="none" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} snapToInterval={ITEM_H}
        decelerationRate={0.92} bounces={false} overScrollMode="never"
        onMomentumScrollEnd={snap} onScrollEndDrag={function(e){ if(!e.nativeEvent.velocity||Math.abs(e.nativeEvent.velocity.y)<0.1) snap(e); }}
        contentContainerStyle={{ paddingTop:padTop, paddingBottom:padBot }}>
        {values.map(function(val,i){
          var isSel = val===selectedValue;
          return <View key={val+'-'+i} style={{ height:ITEM_H, alignItems:'center', justifyContent:'center' }}>
            {isSel ? (
              <View style={{ alignItems:'center' }}>
                <Text style={{ color:color, fontSize:22, fontWeight:'800', textAlign:'center' }}>{val}</Text>
                <Text style={{ color:color, fontSize:9, fontWeight:'600', opacity:0.7, letterSpacing:1, marginTop:-2 }}>{unit}</Text>
              </View>
            ) : (
              <Text style={{ color:'#555E6C', fontSize:15, fontWeight:'400', opacity:0.3, textAlign:'center' }}>{val}</Text>
            )}
          </View>;
        })}
      </ScrollView>
    </View>
  );
};

// ============================================================
// HELPERS VALIDATION + LIXTAG
// ============================================================
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
  return parts.length >= 2 && parts.every(function(p){ return p.length >= 2; });
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

// ============================================================
// PHASE 1 — IDENTITÉ (avec check email temps réel)
// ============================================================
function Phase1Identity(props) {
  var fd=props.formData, sf=props.setFormData, t=props.t, lang=props.lang;
  var validEmail = fd.email ? isValidEmail(fd.email) : false;
  var emailsMatch = validEmail && fd.email === fd.emailConfirm;
  var validName = isValidFullName(fd.fullName);
  var nameStarted = fd.fullName.trim().length > 0;
  var passStrength = getPasswordStrength(fd.password);
  var passMatch = fd.password && fd.password === fd.passwordConfirm;

  // État local pour le check email
  var _emailStatus = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken'
  var emailStatus = _emailStatus[0], setEmailStatus = _emailStatus[1];
  var debounceRef = useRef(null);

  function u(k,v){ sf(function(prev){ var n=Object.assign({},prev); n[k]=v; return n; }); }

  // Check email disponibilité avec debounce 800ms
  var checkEmailAvailable = useCallback(function(email){
    if(debounceRef.current) clearTimeout(debounceRef.current);
    if(!email || !isValidEmail(email)){
      setEmailStatus('idle');
      u('emailAvailable', null);
      return;
    }
    setEmailStatus('checking');
    debounceRef.current = setTimeout(function(){
      fetch(SUPABASE_URL+'/rest/v1/rpc/check_email_available',{
        method:'POST',
        headers:{'apikey':SUPABASE_ANON_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({p_email:email.trim().toLowerCase()}),
      }).then(function(r){return r.json()}).then(function(result){
        if(result && result.available === true){
          setEmailStatus('available');
          u('emailAvailable', true);
        } else if(result && result.available === false){
          setEmailStatus('taken');
          u('emailAvailable', false);
        } else {
          setEmailStatus('idle');
          u('emailAvailable', null);
        }
      }).catch(function(){
        setEmailStatus('idle');
        u('emailAvailable', null);
      });
    }, 800);
  },[]);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal:20, paddingBottom:20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

      {/* Nom complet */}
      <GlassCard sectionIcon="person-outline" sectionLabel={t.identityLabel}>
        <PremiumInput label={t.fullName} value={fd.fullName} onChangeText={function(v){u('fullName',v)}}
          placeholder={lang==='fr' ? 'Pr\u00e9nom Nom' : 'First Last'} valid={validName} />
        {nameStarted && !validName ? (
          <Text style={{ color:'#FF8C42', fontSize:10, marginTop:-6 }}>
            {lang==='fr' ? 'Veuillez entrer votre pr\u00e9nom et nom (ex: Jean Dupont)' : 'Please enter first and last name (e.g. John Doe)'}
          </Text>
        ) : null}
        {validName ? (
          <Text style={{ color:C.emerald, fontSize:10, marginTop:-6 }}>{'\u2713'}</Text>
        ) : null}
      </GlassCard>

      {/* Email — avec vérification temps réel */}
      <GlassCard sectionIcon="mail-outline" sectionLabel={t.emailLabel}>
        <PremiumInput label={t.email} value={fd.email}
          onChangeText={function(v){ u('email',v); checkEmailAvailable(v); }}
          keyboardType="email-address" autoCapitalize="none" placeholder="email@example.com"
          valid={validEmail && emailStatus==='available'} />

        {/* Feedback email */}
        {fd.email && !validEmail ? (
          <Text style={{ color:C.error, fontSize:10, marginTop:-6 }}>
            {lang==='fr' ? 'Adresse email invalide' : 'Invalid email address'}
          </Text>
        ) : emailStatus==='checking' ? (
          <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginTop:-6 }}>
            <ActivityIndicator size={10} color={C.textMuted} />
            <Text style={{ color:C.textMuted, fontSize:10 }}>
              {lang==='fr'?'V\u00e9rification...':'Checking...'}
            </Text>
          </View>
        ) : emailStatus==='taken' ? (
          <View style={{ marginTop:-6 }}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
              <Ionicons name="alert-circle" size={12} color={C.error} />
              <Text style={{ color:C.error, fontSize:10, fontWeight:'600' }}>
                {lang==='fr'?'Cette adresse est d\u00e9j\u00e0 utilis\u00e9e':'This email is already taken'}
              </Text>
            </View>
            <TouchableOpacity onPress={function(){ console.log('Navigate to Login'); }} style={{ marginTop:4 }}>
              <Text style={{ color:C.emerald, fontSize:10, fontWeight:'700' }}>
                {lang==='fr'?'D\u00e9j\u00e0 un compte ? Se connecter \u2192':'Already have an account? Sign in \u2192'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : emailStatus==='available' && validEmail ? (
          <View style={{ flexDirection:'row', alignItems:'center', gap:4, marginTop:-6 }}>
            <Ionicons name="checkmark-circle" size={12} color={C.emerald} />
            <Text style={{ color:C.emerald, fontSize:10, fontWeight:'600' }}>
              {lang==='fr'?'Email disponible':'Email available'}
            </Text>
          </View>
        ) : null}

        <PremiumInput label={t.emailConfirm} value={fd.emailConfirm} onChangeText={function(v){u('emailConfirm',v)}}
          keyboardType="email-address" autoCapitalize="none" valid={emailsMatch} />
        {fd.emailConfirm !== '' ? (
          <Text style={{ color: emailsMatch ? C.emerald : C.error, fontSize:11, marginTop:-6 }}>
            {emailsMatch ? t.emailMatch : (validEmail ? t.emailNoMatch : (lang==='fr' ? 'Corrigez d\'abord l\'email ci-dessus' : 'Fix the email above first'))}
          </Text>
        ) : null}
      </GlassCard>

      {/* Sécurité + Force du mot de passe */}
      <GlassCard sectionIcon="lock-closed-outline" sectionLabel={t.securityLabel}>
        <PremiumInput label={t.password} value={fd.password} onChangeText={function(v){u('password',v)}} secureTextEntry />

        {/* Barre de force du mot de passe */}
        {fd.password.length > 0 ? (
          <View style={{ marginTop:-4, marginBottom:10 }}>
            <View style={{ height:4, borderRadius:2, backgroundColor:'rgba(62,72,85,0.3)', overflow:'hidden' }}>
              <View style={{ width:passStrength.width+'%', height:'100%', borderRadius:2, backgroundColor:passStrength.color }} />
            </View>
            <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop:4 }}>
              <Text style={{ color:passStrength.color, fontSize:10, fontWeight:'600' }}>
                {lang==='fr' ? passStrength.label : passStrength.labelEn}
              </Text>
              {fd.password.length < 8 ? (
                <Text style={{ color:'#FF8C42', fontSize:9 }}>
                  {lang==='fr' ? 'Encore '+(8-fd.password.length)+' caract\u00e8res' : (8-fd.password.length)+' more chars'}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={{ color:C.textMuted, fontSize:10, marginTop:-6, marginBottom:10 }}>{t.passRules}</Text>
        )}

        <PremiumInput label={t.passwordConfirm} value={fd.passwordConfirm}
          onChangeText={function(v){u('passwordConfirm',v)}}
          secureTextEntry valid={passMatch && fd.passwordConfirm!==''} />
        {fd.passwordConfirm !== '' ? (
          <Text style={{ color: passMatch ? C.emerald : C.error, fontSize:11, marginTop:-6 }}>
            {passMatch ? '\u2713' : (lang==='fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match')}
          </Text>
        ) : null}
      </GlassCard>
    </ScrollView>
  );
}

// ============================================================
// PHASE 2 — MORPHOLOGIE
// ============================================================
function Phase2Morphology(props) {
  var fd=props.formData, sf=props.setFormData, t=props.t, lang=props.lang;
  var _uw=useState('kg'), uw=_uw[0], suw=_uw[1];
  var _uh=useState('cm'), uh=_uh[0], suh=_uh[1];
  function u(k,v){ sf(function(prev){ var n=Object.assign({},prev); n[k]=v; return n; }); }

  function unitSwitch(l,r,val,onChange){
    return <View style={{ flexDirection:'row', alignSelf:'center', borderRadius:6, overflow:'hidden', borderWidth:1, borderColor:'rgba(62,72,85,0.3)', marginBottom:8 }}>
      <TouchableOpacity onPress={function(){onChange(l.key)}}><View style={{ paddingHorizontal:12, paddingVertical:4, backgroundColor:val===l.key?'rgba(0,217,132,0.15)':'transparent' }}>
        <Text style={{ color:val===l.key?'#00D984':'#555E6C', fontSize:9, fontWeight:'700', letterSpacing:1 }}>{l.label}</Text></View></TouchableOpacity>
      <View style={{ width:1, backgroundColor:'rgba(62,72,85,0.3)' }} />
      <TouchableOpacity onPress={function(){onChange(r.key)}}><View style={{ paddingHorizontal:12, paddingVertical:4, backgroundColor:val===r.key?'rgba(0,217,132,0.15)':'transparent' }}>
        <Text style={{ color:val===r.key?'#00D984':'#555E6C', fontSize:9, fontWeight:'700', letterSpacing:1 }}>{r.label}</Text></View></TouchableOpacity>
    </View>;
  }

  var wVals = uw==='kg' ? Array.from({length:171},function(_,i){return 30+i}) : Array.from({length:371},function(_,i){return 66+i});
  var hVals = uh==='cm' ? Array.from({length:101},function(_,i){return 120+i}) : Array.from({length:49},function(_,i){return 48+i});
  var aVals = Array.from({length:83},function(_,i){return 12+i});

  return (
    <View style={{ flex:1, paddingHorizontal:20 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:2, paddingLeft:30, paddingRight:4 }}>
        <View style={{flex:1,alignItems:'center'}}><Text style={{color:'#EAEEF3',fontSize:12,fontWeight:'800',letterSpacing:3}}>{t.weightLabel}</Text></View>
        <View style={{flex:1,alignItems:'center'}}><Text style={{color:'#EAEEF3',fontSize:12,fontWeight:'800',letterSpacing:3}}>{t.heightLabel}</Text></View>
        <View style={{flex:0.8,alignItems:'center'}}><Text style={{color:'#EAEEF3',fontSize:12,fontWeight:'800',letterSpacing:3}}>{t.ageLabel}</Text></View>
      </View>
      <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:6, paddingLeft:30, paddingRight:4 }}>
        <View style={{flex:1,alignItems:'center'}}>{unitSwitch({key:'kg',label:'KG'},{key:'lb',label:'LB'},uw,function(nu){ if(nu!==uw){ var cv=parseFloat(fd.weight)||70; u('weight',String(nu==='lb'?Math.round(cv*2.205):Math.round(cv/2.205))); suw(nu); } })}</View>
        <View style={{flex:1,alignItems:'center'}}>{unitSwitch({key:'cm',label:'CM'},{key:'in',label:'IN'},uh,function(nu){ if(nu!==uh){ var cv=parseFloat(fd.height)||175; u('height',String(nu==='in'?Math.round(cv/2.54):Math.round(cv*2.54))); suh(nu); } })}</View>
        <View style={{flex:0.8,alignItems:'center'}}><View style={{height:26}} /></View>
      </View>
      <View style={{ flexDirection:'row', flex:1, maxHeight:300 }}>
        <View style={{ width:22, justifyContent:'center', alignItems:'center', marginRight:6 }}>
          <Ionicons name="chevron-up" size={16} color="#8892A0" style={{marginBottom:8}} />
          <View style={{ width:2, height:40, borderRadius:1, backgroundColor:'rgba(136,146,160,0.25)' }} />
          <Ionicons name="chevron-down" size={16} color="#8892A0" style={{marginTop:8}} />
        </View>
        <View style={{flex:1}}><ScrollPicker values={wVals} selectedValue={parseInt(fd.weight)||(uw==='kg'?70:154)} onSelect={function(v){u('weight',String(v))}} unit={uw} color="#00D984" height={280} /></View>
        <View style={{width:8}} />
        <View style={{flex:1}}><ScrollPicker values={hVals} selectedValue={parseInt(fd.height)||(uh==='cm'?175:69)} onSelect={function(v){u('height',String(v))}} unit={uh} color="#00BFA6" height={280} /></View>
        <View style={{width:8}} />
        <View style={{flex:0.8}}><ScrollPicker values={aVals} selectedValue={parseInt(fd.age)||25} onSelect={function(v){u('age',String(v))}} unit={lang==='fr'?'ans':'y'} color="#D4AF37" height={280} /></View>
      </View>
      <Text style={{ color:'#EAEEF3', fontSize:12, fontWeight:'800', letterSpacing:3, textAlign:'center', marginTop:16, marginBottom:12 }}>SEXE</Text>
      <View style={{ flexDirection:'row', justifyContent:'center', gap:24, marginBottom:10 }}>
        {[{key:'male',icon:'male',label:lang==='fr'?'Homme':'Male',color:'#4A90D9',bg:['#4A90D9','#2E6BB5']},
          {key:'female',icon:'female',label:lang==='fr'?'Femme':'Female',color:'#E875A0',bg:['#E875A0','#C95A82']}
        ].map(function(g){ var sel=fd.gender===g.key; return (
          <TouchableOpacity key={g.key} onPress={function(){u('gender',g.key)}} activeOpacity={0.7}>
            <View style={{alignItems:'center'}}>
              {sel?<View style={{ position:'absolute', top:-3, left:-3, right:-3, bottom:-22, borderRadius:43, borderWidth:1.5, borderColor:g.color+'35' }} />:null}
              <View style={{ width:76, height:76, borderRadius:38, overflow:'hidden', borderWidth:sel?0:1.5, borderColor:'rgba(62,72,85,0.3)' }}>
                {sel?<LinearGradient colors={g.bg} start={{x:0,y:0}} end={{x:1,y:1}} style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                  <Ionicons name={g.icon} size={30} color="#FFFFFF" /></LinearGradient>
                :<View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#0A0E14'}}>
                  <Ionicons name={g.icon} size={26} color="#555E6C" /></View>}
              </View>
              <Text style={{ color:sel?g.color:'#555E6C', fontSize:11, fontWeight:'700', textAlign:'center', marginTop:6 }}>{g.label}</Text>
            </View>
          </TouchableOpacity>
        );})}
      </View>
    </View>
  );
}

// ============================================================
// PHASE 3 — ACTIVITÉ
// ============================================================
function Phase3Activity(props) {
  var fd=props.formData, sf=props.setFormData, t=props.t, lang=props.lang;
  function u(k,v){ sf(function(prev){ var n=Object.assign({},prev); n[k]=v; return n; }); }
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal:20, paddingBottom:20 }} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems:'center', marginBottom:16 }}>
        <View style={[s.phaseIcon,{backgroundColor:'rgba(0,217,132,0.08)',borderColor:'rgba(0,217,132,0.2)'}]}><Ionicons name="fitness-outline" size={24} color={C.emerald} /></View>
        <Text style={[s.phaseTitle,{marginTop:8}]}>{lang==='fr'?'Votre activit\u00e9':'Your activity'}</Text>
        <Text style={s.phaseSubtitle}>{lang==='fr'?'Quel est votre rythme ?':'What is your rhythm?'}</Text>
      </View>
      <Text style={[s.inputLabel,{marginBottom:12}]}>{t.activityLabel}</Text>
      <View style={{ flexDirection:'row', gap:10 }}>
        <View style={{ width:4, borderRadius:2, backgroundColor:'rgba(62,72,85,0.2)', overflow:'hidden' }}>
          <LinearGradient colors={['#00A866','#00D984','#00FFB2']} start={{x:0,y:1}} end={{x:0,y:0}}
            style={{ width:'100%', height:((fd.activityLevel+1)/5*100)+'%', position:'absolute', bottom:0, borderRadius:2 }} />
        </View>
        <View style={{flex:1}}>
          {t.activityLevels.map(function(level,i){ var sel=fd.activityLevel===i; return (
            <TouchableOpacity key={i} onPress={function(){u('activityLevel',i)}} activeOpacity={0.7} style={{marginBottom:8}}>
              <View style={{ flexDirection:'row', alignItems:'center', paddingVertical:12, paddingHorizontal:14,
                borderRadius:10, borderWidth:1.2, borderColor:sel?'rgba(0,217,132,0.4)':C.metalBorder,
                backgroundColor:sel?'rgba(0,217,132,0.06)':C.bgDeep, gap:12 }}>
                <View style={{ width:46, height:46, borderRadius:12, backgroundColor:sel?'rgba(0,217,132,0.12)':'rgba(62,72,85,0.15)',
                  borderWidth:1, borderColor:sel?'rgba(0,217,132,0.25)':'rgba(62,72,85,0.2)', alignItems:'center', justifyContent:'center' }}>
                  <Text style={{fontSize:24}}>{level.emoji}</Text></View>
                <View style={{flex:1}}>
                  <Text style={{ color:sel?C.emerald:C.textPrimary, fontSize:13, fontWeight:'600' }}>{level.label}</Text>
                  <Text style={{ color:C.textMuted, fontSize:10, marginTop:1 }}>{level.desc}</Text></View>
                {sel?<Ionicons name="checkmark-circle" size={20} color={C.emerald} />:null}
              </View>
            </TouchableOpacity>
          );})}
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================
// PHASE 4 — RÉGIME
// ============================================================
function Phase4Diet(props) {
  var fd=props.formData, sf=props.setFormData, t=props.t, lang=props.lang;
  function u(k,v){ sf(function(prev){ var n=Object.assign({},prev); n[k]=v; return n; }); }
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal:20, paddingBottom:20 }} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems:'center', marginBottom:16 }}>
        <View style={[s.phaseIcon,{backgroundColor:'rgba(0,191,166,0.08)',borderColor:'rgba(0,191,166,0.2)'}]}><Ionicons name="nutrition-outline" size={24} color={C.turquoise} /></View>
        <Text style={[s.phaseTitle,{marginTop:8}]}>{lang==='fr'?'Votre alimentation':'Your diet'}</Text>
        <Text style={s.phaseSubtitle}>{lang==='fr'?'Quel r\u00e9gime suivez-vous ?':'What diet do you follow?'}</Text>
      </View>
      {t.diets.map(function(diet){ var sel=fd.diet===diet.key; return (
        <TouchableOpacity key={diet.key} onPress={function(){u('diet',diet.key)}} activeOpacity={0.7} style={{marginBottom:10}}>
          <View style={{ flexDirection:'row', alignItems:'center', paddingVertical:14, paddingHorizontal:14,
            borderRadius:12, borderWidth:1.2, borderColor:sel?diet.color+'50':C.metalBorder,
            backgroundColor:sel?diet.color+'08':C.bgDeep, gap:12 }}>
            <View style={{ width:50, height:50, borderRadius:14, backgroundColor:sel?diet.color+'10':'rgba(62,72,85,0.12)',
              borderWidth:1, borderColor:sel?diet.color+'20':'rgba(62,72,85,0.2)', alignItems:'center', justifyContent:'center' }}>
              <Text style={{fontSize:26}}>{diet.emoji}</Text></View>
            <View style={{flex:1}}>
              <Text style={{ color:sel?diet.color:C.textPrimary, fontSize:14, fontWeight:'700' }}>{diet.label}</Text>
              <Text style={{ color:C.textMuted, fontSize:10, marginTop:2 }}>{diet.desc}</Text></View>
            {sel?<Ionicons name="checkmark-circle" size={20} color={diet.color} />:null}
          </View>
        </TouchableOpacity>
      );})}
    </ScrollView>
  );
}

// ============================================================
// PHASE 5 — OBJECTIF
// ============================================================
function Phase5Goals(props) {
  var fd=props.formData, sf=props.setFormData, calc=props.calculations, t=props.t, lang=props.lang;
  var paceIcons=['rocket-outline','speedometer-outline','leaf-outline'];
  var paceColors=['#D4AF37','#00D984','#00BFA6'];
  function u(k,v){ sf(function(prev){ var n=Object.assign({},prev); n[k]=v; return n; }); }
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal:20, paddingBottom:20 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection:'row', gap:8, marginBottom:20 }}>
        {t.goals.map(function(g){ var sel=fd.goal===g.key; return (
          <TouchableOpacity key={g.key} onPress={function(){u('goal',g.key)}} style={{flex:1}} activeOpacity={0.7}>
            <View style={{ paddingVertical:20, paddingHorizontal:8, borderRadius:14, alignItems:'center',
              borderWidth:sel?1.5:1, borderColor:sel?g.color+'60':C.metalBorder, backgroundColor:C.bgInput, overflow:'hidden' }}>
              {sel?<LinearGradient colors={[g.color+'15',g.color+'05','transparent']} style={StyleSheet.absoluteFill} />:null}
              <View style={{ width:46, height:46, borderRadius:23, backgroundColor:sel?g.color+'15':'rgba(62,72,85,0.15)',
                borderWidth:1, borderColor:sel?g.color+'30':'rgba(62,72,85,0.2)', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
                <Ionicons name={g.icon} size={22} color={sel?g.color:C.textMuted} /></View>
              <Text style={{ color:sel?g.color:C.textSecondary, fontSize:10, fontWeight:'700', textAlign:'center' }}>{g.label}</Text>
              {sel?<View style={{ width:8, height:8, borderRadius:4, backgroundColor:g.color, marginTop:6 }} />:null}
            </View>
          </TouchableOpacity>
        );})}
      </View>
      {fd.goal&&fd.goal!=='maintain'?<View>
        <View style={{ alignItems:'center', marginVertical:16, paddingVertical:20, borderRadius:16,
          backgroundColor:C.bgInput, borderWidth:1, borderColor:'rgba(62,72,85,0.2)' }}>
          <Text style={{color:C.textSecondary,fontSize:10,fontWeight:'600',letterSpacing:1.5,marginBottom:14}}>{t.kgLabel(fd.goal)}</Text>
          <View style={{ flexDirection:'row', alignItems:'center', gap:24 }}>
            <TouchableOpacity onPress={function(){u('targetKg',Math.max(1,fd.targetKg-1))}}><View style={{ width:44, height:44, borderRadius:22,
              backgroundColor:'rgba(0,217,132,0.06)', borderWidth:1.2, borderColor:'rgba(0,217,132,0.2)', alignItems:'center', justifyContent:'center' }}>
              <Ionicons name="chevron-down" size={20} color={C.emerald} /></View></TouchableOpacity>
            <View style={{alignItems:'center'}}>
              <Text style={{ color:C.emerald, fontSize:48, fontWeight:'900', textShadowColor:'rgba(0,217,132,0.3)', textShadowRadius:10 }}>{fd.targetKg}</Text>
              <Text style={{ color:C.textMuted, fontSize:12, letterSpacing:2 }}>KG</Text></View>
            <TouchableOpacity onPress={function(){u('targetKg',Math.min(30,fd.targetKg+1))}}><View style={{ width:44, height:44, borderRadius:22,
              backgroundColor:'rgba(0,217,132,0.06)', borderWidth:1.2, borderColor:'rgba(0,217,132,0.2)', alignItems:'center', justifyContent:'center' }}>
              <Ionicons name="chevron-up" size={20} color={C.emerald} /></View></TouchableOpacity>
          </View>
        </View>
        <Text style={[s.inputLabel,{marginBottom:10}]}>{t.yourPace}</Text>
        {t.paceLabels.map(function(label,i){ var sel=fd.paceMode===i; var mk=['ambitious','reasonable','realistic'][i]; var md=calc.modes[mk]; return (
          <TouchableOpacity key={i} onPress={function(){u('paceMode',i)}} activeOpacity={0.7} style={{marginBottom:8}}>
            <View style={{ flexDirection:'row', alignItems:'center', paddingVertical:14, paddingHorizontal:14,
              borderRadius:12, borderWidth:1.2, borderColor:sel?paceColors[i]+'50':C.metalBorder,
              backgroundColor:sel?paceColors[i]+'08':C.bgDeep, gap:12 }}>
              <View style={{ width:38, height:38, borderRadius:10, backgroundColor:sel?paceColors[i]+'15':'rgba(62,72,85,0.2)',
                borderWidth:1, borderColor:sel?paceColors[i]+'30':'rgba(62,72,85,0.3)', alignItems:'center', justifyContent:'center' }}>
                <Ionicons name={paceIcons[i]} size={18} color={sel?paceColors[i]:C.textMuted} /></View>
              <View style={{flex:1}}>
                <Text style={{ color:sel?paceColors[i]:C.textPrimary, fontSize:14, fontWeight:'700' }}>{label}</Text>
                <Text style={{ color:C.textSecondary, fontSize:10, marginTop:2 }}>{md.dailyDelta} kcal/jour {'\u00B7'} {md.weeksLabel} {t.weeks}</Text></View>
              {sel?<Ionicons name="checkmark-circle" size={20} color={paceColors[i]} />:null}
            </View>
          </TouchableOpacity>
        );})}
        <View style={{ marginTop:16, borderRadius:14, overflow:'hidden', borderWidth:1.5,
          borderTopColor:'rgba(212,175,55,0.3)', borderBottomColor:'rgba(212,175,55,0.1)',
          borderLeftColor:'rgba(212,175,55,0.15)', borderRightColor:'rgba(212,175,55,0.15)',
          backgroundColor:C.bgInput }}>
          <LinearGradient colors={['rgba(212,175,55,0.08)','rgba(212,175,55,0.02)','transparent']}
            style={{ position:'absolute', top:0, left:0, right:0, height:60 }} />
          <View style={{padding:16}}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 }}>
              <Ionicons name="trophy-outline" size={14} color={C.gold} />
              <Text style={{ color:C.gold, fontSize:10, fontWeight:'700', letterSpacing:1.5 }}>{t.yourPlan}</Text></View>
            <Text style={{ color:C.textPrimary, fontSize:14, fontWeight:'600', marginBottom:4 }}>{t.dailyGoal(calc.dailyTarget)}</Text>
            <Text style={{ color:C.textMuted, fontSize:11, marginBottom:14 }}>{t.bmrTdee(calc.bmr,calc.tdee)}</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              {[{label:t.protein,value:calc.macros.protein,color:C.turquoise},
                {label:t.carbs,value:calc.macros.carbs,color:C.emerald},
                {label:t.fat,value:calc.macros.fat,color:C.gold}].map(function(m,i){ return (
                <View key={i} style={{ alignItems:'center', flex:1 }}>
                  <Text style={{ color:m.color, fontSize:22, fontWeight:'800' }}>{m.value}</Text>
                  <Text style={{ color:C.textMuted, fontSize:9, marginTop:1 }}>{t.gUnit} {m.label}</Text>
                  <View style={{ width:'60%', height:3, borderRadius:1.5, marginTop:6, backgroundColor:'rgba(62,72,85,0.2)' }}>
                    <View style={{ width:Math.min(100,(m.value/300)*100)+'%', height:'100%', borderRadius:1.5, backgroundColor:m.color }} /></View>
                </View>
              );})}
            </View>
          </View>
        </View>
      </View>:fd.goal==='maintain'?(<>
        <View style={{ marginTop:16, borderRadius:14, overflow:'hidden', borderWidth:1.5,
          borderTopColor:'rgba(0,217,132,0.3)', borderBottomColor:'rgba(0,217,132,0.1)',
          borderLeftColor:'rgba(0,217,132,0.15)', borderRightColor:'rgba(0,217,132,0.15)',
          backgroundColor:C.bgInput }}>
          <LinearGradient colors={['rgba(0,217,132,0.08)','rgba(0,217,132,0.02)','transparent']}
            style={{ position:'absolute', top:0, left:0, right:0, height:60 }} />
          <View style={{padding:16}}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 }}>
              <Ionicons name="shield-checkmark-outline" size={14} color={C.emerald} />
              <Text style={{ color:C.emerald, fontSize:10, fontWeight:'700', letterSpacing:1.5 }}>
                {lang==='fr'?'MAINTIEN \u00c9QUILIBR\u00c9':'BALANCED MAINTENANCE'}
              </Text>
            </View>
            <Text style={{ color:C.textPrimary, fontSize:14, fontWeight:'600', marginBottom:4 }}>{t.dailyGoal(calc.dailyTarget)}</Text>
            <Text style={{ color:C.textMuted, fontSize:11, marginBottom:14 }}>{t.bmrTdee(calc.bmr,calc.tdee)}</Text>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              {[{label:t.protein,value:calc.macros.protein,color:C.turquoise},
                {label:t.carbs,value:calc.macros.carbs,color:C.emerald},
                {label:t.fat,value:calc.macros.fat,color:C.gold}].map(function(m,i){ return (
                <View key={i} style={{ alignItems:'center', flex:1 }}>
                  <Text style={{ color:m.color, fontSize:22, fontWeight:'800' }}>{m.value}</Text>
                  <Text style={{ color:C.textMuted, fontSize:9, marginTop:1 }}>{t.gUnit} {m.label}</Text>
                  <View style={{ width:'60%', height:3, borderRadius:1.5, marginTop:6, backgroundColor:'rgba(62,72,85,0.2)' }}>
                    <View style={{ width:Math.min(100,(m.value/300)*100)+'%', height:'100%', borderRadius:1.5, backgroundColor:m.color }} /></View>
                </View>
              );})}
            </View>
            <Text style={{ color:C.textMuted, fontSize:10, textAlign:'center', marginTop:12, fontStyle:'italic' }}>
              {lang==='fr'?'Mangez selon votre TDEE pour maintenir votre poids actuel':'Eat according to your TDEE to maintain your current weight'}
            </Text>
          </View>
        </View>

        {/* Carte Repas & Activités — recommandations hebdo */}
        <View style={{ marginTop:14, borderRadius:14, overflow:'hidden', borderWidth:1,
          borderColor:'rgba(77,166,255,0.15)', backgroundColor:C.bgInput }}>
          <View style={{padding:16}}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:14 }}>
              <Ionicons name="calendar-outline" size={14} color="#4DA6FF" />
              <Text style={{ color:'#4DA6FF', fontSize:10, fontWeight:'700', letterSpacing:1.5 }}>
                {lang==='fr'?'VOTRE SEMAINE TYPE':'YOUR TYPICAL WEEK'}
              </Text>
            </View>

            {/* Ligne Repas */}
            <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12,
              backgroundColor:'rgba(255,140,66,0.04)', borderRadius:10, padding:10,
              borderWidth:1, borderColor:'rgba(255,140,66,0.1)' }}>
              <View style={{ width:36, height:36, borderRadius:10, backgroundColor:'rgba(255,140,66,0.1)',
                alignItems:'center', justifyContent:'center' }}>
                <Ionicons name="restaurant-outline" size={16} color="#FF8C42" />
              </View>
              <View style={{flex:1}}>
                <Text style={{ color:C.textPrimary, fontSize:12, fontWeight:'600' }}>
                  {lang==='fr'?'Consommation':'Intake'}</Text>
                <Text style={{ color:C.textMuted, fontSize:10, marginTop:2 }}>
                  {lang==='fr'
                    ?'~'+Math.round(calc.dailyTarget/3)+' kcal par repas \u00d7 3/jour'
                    :'~'+Math.round(calc.dailyTarget/3)+' kcal per meal \u00d7 3/day'}
                </Text>
              </View>
              <Text style={{ color:'#FF8C42', fontSize:14, fontWeight:'800' }}>{(calc.dailyTarget*7).toLocaleString()}</Text>
              <Text style={{ color:C.textMuted, fontSize:8 }}>{'kcal\n/sem'}</Text>
            </View>

            {/* Ligne Activité */}
            <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12,
              backgroundColor:'rgba(0,217,132,0.04)', borderRadius:10, padding:10,
              borderWidth:1, borderColor:'rgba(0,217,132,0.1)' }}>
              <View style={{ width:36, height:36, borderRadius:10, backgroundColor:'rgba(0,217,132,0.1)',
                alignItems:'center', justifyContent:'center' }}>
                <Ionicons name="fitness-outline" size={16} color="#00D984" />
              </View>
              <View style={{flex:1}}>
                <Text style={{ color:C.textPrimary, fontSize:12, fontWeight:'600' }}>
                  {lang==='fr'?'Activit\u00e9 recommand\u00e9e':'Recommended activity'}</Text>
                <Text style={{ color:C.textMuted, fontSize:10, marginTop:2 }}>
                  {lang==='fr'?'150 min/semaine (OMS) \u2248 30 min \u00d7 5j':'150 min/week (WHO) \u2248 30 min \u00d7 5d'}
                </Text>
              </View>
              <Text style={{ color:'#00D984', fontSize:14, fontWeight:'800' }}>~1500</Text>
              <Text style={{ color:C.textMuted, fontSize:8 }}>{'kcal\n/sem'}</Text>
            </View>

            {/* Ligne Hydratation */}
            <View style={{ flexDirection:'row', alignItems:'center', gap:10,
              backgroundColor:'rgba(77,166,255,0.04)', borderRadius:10, padding:10,
              borderWidth:1, borderColor:'rgba(77,166,255,0.1)' }}>
              <View style={{ width:36, height:36, borderRadius:10, backgroundColor:'rgba(77,166,255,0.1)',
                alignItems:'center', justifyContent:'center' }}>
                <Ionicons name="water-outline" size={16} color="#4DA6FF" />
              </View>
              <View style={{flex:1}}>
                <Text style={{ color:C.textPrimary, fontSize:12, fontWeight:'600' }}>
                  {lang==='fr'?'Hydratation':'Hydration'}</Text>
                <Text style={{ color:C.textMuted, fontSize:10, marginTop:2 }}>
                  {fd.gender==='male'
                    ?(lang==='fr'?'Objectif : 2.5L / jour (homme)':'Goal: 2.5L / day (male)')
                    :(lang==='fr'?'Objectif : 2.0L / jour (femme)':'Goal: 2.0L / day (female)')}
                </Text>
              </View>
              <Text style={{ color:'#4DA6FF', fontSize:14, fontWeight:'800' }}>{fd.gender==='male'?'2.5':'2.0'}</Text>
              <Text style={{ color:C.textMuted, fontSize:8 }}>{'L\n/jour'}</Text>
            </View>
          </View>
        </View>
      </>):null}
    </ScrollView>
  );
}

// ============================================================
// PHASE 6 — CARACTÈRES LIXUM — Swipe Tinder (3 cartes)
// ============================================================
var CHAR_CARD_W = W - 60;
var CHAR_CARD_H = 420;

function CharacterCard(props) {
  var char = props.character, isTop = props.isTop, onSwipe = props.onSwipe;
  var translateX = useSharedValue(0), translateY = useSharedValue(0), rotateZ = useSharedValue(0);

  var gesture = Gesture.Pan().enabled(isTop)
    .onUpdate(function(e){
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
      rotateZ.value = interpolate(e.translationX, [-W,0,W], [-12,0,12], Extrapolation.CLAMP);
    })
    .onEnd(function(e){
      if(Math.abs(e.translationX)>SWIPE_THRESHOLD){
        var dir = e.translationX>0?1:-1;
        translateX.value = withTiming(dir*W*1.5, {duration:300});
        rotateZ.value = withTiming(dir*20, {duration:300});
        runOnJS(onSwipe)();
      } else {
        translateX.value = withSpring(0, {damping:15, stiffness:150});
        translateY.value = withSpring(0, {damping:15, stiffness:150});
        rotateZ.value = withSpring(0, {damping:15, stiffness:150});
      }
    });

  var animStyle = useAnimatedStyle(function(){
    if(!isTop) return {};
    return { transform:[{translateX:translateX.value},{translateY:translateY.value},{rotateZ:rotateZ.value+'deg'}] };
  });
  var behindStyle = !isTop ? { transform:[{scale:0.95},{translateY:10}], opacity:0.5 } : {};

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ position:'absolute', alignSelf:'center', zIndex:isTop?10:5 }, isTop?animStyle:behindStyle]}>
        {/* Carte — ombre noire diffuse, pas de cadre métallique */}
        <View style={{
          width:CHAR_CARD_W, borderRadius:16, overflow:'hidden',
          shadowColor:'#000', shadowOffset:{width:0,height:8}, shadowOpacity:0.6, shadowRadius:24, elevation:16,
        }}>
          {/* Image personnage — plein cadre */}
          {char.image ? (
            <Image source={char.image} style={{ width:'100%', height:CHAR_CARD_H }} resizeMode="cover" />
          ) : (
            <View style={{ height:CHAR_CARD_H, alignItems:'center', justifyContent:'center', backgroundColor:'#0A0E14',
              borderRadius:16, borderWidth:1.5, borderColor:char.borderColors[0]+'30' }}>
              <CircuitPattern width={CHAR_CARD_W} height={CHAR_CARD_H} color={char.borderColors[0]+'08'} />
              <Text style={{fontSize:80, position:'absolute'}}>{char.fallbackEmoji}</Text>
              <Text style={{ position:'absolute', bottom:50, color:'#EAEEF3', fontSize:18, fontWeight:'800', letterSpacing:2 }}>{char.name}</Text>
              <Text style={{ position:'absolute', bottom:32, color:char.levelColor, fontSize:11, fontWeight:'600' }}>{char.power}</Text>
              <View style={{ position:'absolute', top:10, left:10, paddingHorizontal:10, paddingVertical:4,
                borderRadius:6, backgroundColor:'rgba(0,0,0,0.6)', borderWidth:1, borderColor:char.levelColor+'40' }}>
                <Text style={{ color:char.levelColor, fontSize:9, fontWeight:'800', letterSpacing:2 }}>{char.level}</Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function Phase6Characters(props) {
  var lang = props.lang;
  var _ci = useState(0), ci = _ci[0], setCi = _ci[1];

  var characters = [
    {
      name: 'EMERALD OWL', level: 'STANDARD', levelColor: '#00D984',
      borderColors: ['#00D984','#00A866','#006B40'],
      power: lang==='fr' ? 'R\u00e9sum\u00e9 nutritionnel quotidien' : 'Daily nutrition summary',
      image: require('./emerald_owl.webp'),
      fallbackEmoji: '\uD83E\uDD89',
    },
    {
      name: 'MOSQUITO', level: lang==='fr' ? '\u00c9LITE' : 'ELITE', levelColor: '#B388FF',
      borderColors: ['#B388FF','#8F6DCC','#6B5299'],
      power: lang==='fr' ? 'L\'Essaim \u2014 acc\u00e8s Niv1 toute carte' : 'The Swarm \u2014 Lv1 access all cards',
      image: null, // require('./assets/mosquito.webp')
      fallbackEmoji: '\uD83E\uDD9F',
    },
    {
      name: 'DIAMOND SIMBA', level: lang==='fr' ? 'MYTHIQUE' : 'MYTHIC', levelColor: '#D4AF37',
      borderColors: ['#D4AF37','#C5A028','#8B7516'],
      power: lang==='fr' ? 'XP +50% + Rapport PDF mensuel' : 'XP +50% + Monthly PDF report',
      image: null, // require('./assets/diamond_simba.webp')
      fallbackEmoji: '\uD83E\uDD81',
    },
  ];

  var allSwiped = ci >= characters.length;
  var handleSwipe = function(){ setCi(function(p){ return Math.min(p+1, characters.length) }) };

  return (
    <View style={{ flex:1, paddingHorizontal:20 }}>
      {/* Header */}
      <View style={{ alignItems:'center', marginBottom:14 }}>
        <View style={{ width:50, height:50, borderRadius:12, backgroundColor:'rgba(212,175,55,0.08)',
          borderWidth:1, borderColor:'rgba(212,175,55,0.2)', alignItems:'center', justifyContent:'center' }}>
          <Ionicons name="diamond-outline" size={24} color="#D4AF37" /></View>
        <Text style={{ color:'#EAEEF3', fontSize:20, fontWeight:'700', textAlign:'center', marginTop:8 }}>
          {lang==='fr' ? 'Vos Compagnons' : 'Your Companions'}</Text>
        <Text style={{ color:'#D4AF37', fontSize:12, fontWeight:'600', textAlign:'center', marginTop:4 }}>
          {lang==='fr' ? 'Collectionnez et d\u00e9bloquez des pouvoirs' : 'Collect and unlock powers'}</Text>
      </View>

      {/* Zone swipe */}
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        {!allSwiped ? (
          <View style={{ width:CHAR_CARD_W, height:CHAR_CARD_H }}>
            {characters.slice(0).reverse().map(function(char, ri){
              var ai = characters.length-1-ri;
              if(ai<ci||ai>ci+1) return null;
              return <CharacterCard key={char.name} character={char} isTop={ai===ci} onSwipe={handleSwipe} />;
            })}
          </View>
        ) : (
          <Animated.View entering={FadeInDown.duration(600).springify()} style={{ alignItems:'center', padding:24 }}>
            <Ionicons name="sparkles" size={36} color="#D4AF37" />
            <Text style={{ color:'#EAEEF3', fontSize:18, fontWeight:'700', textAlign:'center', marginTop:12 }}>
              {lang==='fr' ? 'Et bien d\'autres \u00e0 d\u00e9couvrir...' : 'And many more to discover...'}</Text>
            <Text style={{ color:'#8892A0', fontSize:12, textAlign:'center', marginTop:6 }}>
              {lang==='fr' ? '16 caract\u00e8res \u00b7 5 niveaux de raret\u00e9' : '16 characters \u00b7 5 rarity levels'}</Text>
          </Animated.View>
        )}

        {/* Swipe hint */}
        {ci===0&&!allSwiped ? (
          <View pointerEvents="none" style={{ position:'absolute', bottom:10, zIndex:20, backgroundColor:'rgba(0,0,0,0.5)',
            paddingHorizontal:12, paddingVertical:6, borderRadius:16, borderWidth:1, borderColor:'rgba(212,175,55,0.2)',
            flexDirection:'row', alignItems:'center', gap:4 }}>
            <Ionicons name="chevron-back" size={12} color="#D4AF37" />
            <Text style={{ color:'#D4AF37', fontSize:10, fontWeight:'600' }}>{lang==='fr'?'Glissez':'Swipe'}</Text>
            <Ionicons name="chevron-forward" size={12} color="#D4AF37" />
          </View>
        ) : null}
      </View>

      {/* Dots */}
      <View style={{ flexDirection:'row', justifyContent:'center', gap:6, marginBottom:8 }}>
        {characters.map(function(_,i){ return (
          <View key={i} style={{ width:i===ci?20:6, height:6, borderRadius:3,
            backgroundColor:i===ci?'#D4AF37':i<ci?'#8B7516':'rgba(62,72,85,0.3)' }} />
        );})}
      </View>

      {/* Accroche */}
      <View style={{ backgroundColor:'rgba(0,217,132,0.04)', borderRadius:10, padding:12, marginBottom:8,
        borderWidth:1, borderColor:'rgba(0,217,132,0.12)', alignItems:'center' }}>
        <Text style={{ color:'#00D984', fontSize:11, fontWeight:'700', letterSpacing:1, textAlign:'center' }}>
          {lang==='fr' ? '\uD83C\uDFA1 Votre premier tour de roue gratuit vous attend !' : '\uD83C\uDFA1 Your first free spin awaits!'}</Text>
      </View>
    </View>
  );
}

// ============================================================
// NAVIGATION BUTTONS
// ============================================================
function NavigationButtons(props) {
  var step=props.step, setStep=props.setStep, totalSteps=props.totalSteps;
  var fd=props.formData, onComplete=props.onComplete, t=props.t, loading=props.loading;
  var canNext = function(){
    switch(step){
      case 1: return isValidFullName(fd.fullName)&&isValidEmail(fd.email)&&fd.emailAvailable!==false&&fd.email===fd.emailConfirm&&fd.password&&fd.password.length>=8&&fd.password===fd.passwordConfirm;
      case 2: return fd.weight&&fd.height&&fd.age;
      case 3: return true;
      case 4: return fd.diet!=='';
      case 5: return fd.goal!=='';
      case 6: return true;
      default: return true;
    }
  };
  var enabled = canNext();
  return (
    <View style={{ flexDirection:'row', paddingHorizontal:20, paddingTop:8, paddingBottom:Platform.OS==='android'?12:8, gap:10 }}>
      {step>1?<TouchableOpacity onPress={function(){setStep(step-1)}} style={{ flex:0.4, paddingVertical:15, borderRadius:12,
        borderWidth:1.2, borderColor:C.metalBorder, backgroundColor:C.bgDeep, alignItems:'center' }}>
        <Ionicons name="arrow-back" size={18} color={C.textSecondary} /></TouchableOpacity>:null}
      <TouchableOpacity onPress={function(){step<totalSteps?setStep(step+1):onComplete()}}
        disabled={!enabled||loading} activeOpacity={0.7}
        style={{ flex:1, borderRadius:12, overflow:'hidden', opacity:(enabled&&!loading)?1:0.4 }}>
        {step===totalSteps?(
          <LinearGradient colors={['#D4AF37','#C5A028','#A68B1B']} start={{x:0,y:0}} end={{x:1,y:1}}
            style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:15, borderRadius:12 }}>
            {loading?<ActivityIndicator size="small" color={C.bgDeep} />:
            <><Text style={{ color:C.bgDeep, fontSize:15, fontWeight:'800', letterSpacing:1 }}>{t.createAccount}</Text>
            <Ionicons name="checkmark-done" size={18} color={C.bgDeep} /></>}
          </LinearGradient>
        ):(
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:15, borderRadius:12,
            backgroundColor:'rgba(0,217,132,0.08)', borderWidth:1.2, borderColor:'rgba(0,217,132,0.3)' }}>
            <Text style={{ color:C.emerald, fontSize:15, fontWeight:'700' }}>{t.next}</Text>
            <Ionicons name="arrow-forward" size={16} color={C.emerald} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ============================================================
// APP — 6 PHASES
// ============================================================
export default function App() {
  var _lang=useState('fr'), lang=_lang[0], setLang=_lang[1];
  var _step=useState(1), step=_step[0], setStep=_step[1];
  var totalSteps = 6;
  var t = texts[lang];

  // Persistance langue
  useEffect(function(){ AsyncStorage.getItem('lixum_lang').then(function(s){ if(s==='en'||s==='fr') setLang(s); }).catch(function(){}); },[]);
  var changeLang = function(nl){ setLang(nl); AsyncStorage.setItem('lixum_lang',nl).catch(function(){}); };

  var stepInfo = lang==='fr'
    ? [{title:'Identit\u00e9',sub:'Vos informations'},{title:'Corps',sub:'Votre morphologie'},{title:'Activit\u00e9',sub:'Votre rythme'},
       {title:'R\u00e9gime',sub:'Votre alimentation'},{title:'Objectif',sub:'Votre parcours'},{title:'Compagnons',sub:'Gamification'}]
    : [{title:'Identity',sub:'Your info'},{title:'Body',sub:'Your metrics'},{title:'Activity',sub:'Your rhythm'},
       {title:'Diet',sub:'Your food'},{title:'Goal',sub:'Your journey'},{title:'Companions',sub:'Gamification'}];

  var _fd=useState({
    fullName:'', email:'', emailConfirm:'', password:'', passwordConfirm:'', emailAvailable:null,
    weight:'70', height:'175', age:'25', gender:'male', activityLevel:2,
    diet:'classic', goal:'maintain', targetKg:5, timelineDays:90, paceMode:1,
  });
  var fd=_fd[0], sf=_fd[1];
  var _loading=useState(false), loading=_loading[0], setLoading=_loading[1];
  var _lixAlert=useState({visible:false,title:'',message:'',emoji:'',buttons:[],lixTag:''});
  var lixAlert=_lixAlert[0], setLixAlert=_lixAlert[1];
  var showAlert=function(ti,msg,btns,em,tag){ setLixAlert({visible:true,title:ti,message:msg,emoji:em||'',buttons:btns||[],lixTag:tag||''}); };
  var hideAlert=function(){ setLixAlert(function(p){ return Object.assign({},p,{visible:false}); }); };

  // ═══ TRANSITION ANIMÉE vers le Dashboard ═══
  var _showTransition=useState(false), showTransition=_showTransition[0], setShowTransition=_showTransition[1];
  var _transStep=useState(0), transStep=_transStep[0], setTransStep=_transStep[1];
  var _transName=useState(''), transName=_transName[0], setTransName=_transName[1];
  var transOpacity=useRef(new RNAnimated.Value(0)).current;
  var transPulse=useRef(new RNAnimated.Value(1)).current;
  var transProgress=useRef(new RNAnimated.Value(0)).current;
  var transTextOp=useRef(new RNAnimated.Value(0)).current;

  var startTransition=function(name){
    setTransName(name||'');
    setTransStep(0);
    setShowTransition(true);
    transOpacity.setValue(0);
    transPulse.setValue(1);
    transProgress.setValue(0);
    transTextOp.setValue(0);

    RNAnimated.timing(transOpacity,{toValue:1,duration:400,useNativeDriver:true}).start();

    RNAnimated.loop(RNAnimated.sequence([
      RNAnimated.timing(transPulse,{toValue:1.15,duration:800,useNativeDriver:true}),
      RNAnimated.timing(transPulse,{toValue:1,duration:800,useNativeDriver:true}),
    ])).start();

    RNAnimated.timing(transProgress,{toValue:100,duration:3200,useNativeDriver:false}).start();

    RNAnimated.timing(transTextOp,{toValue:1,duration:600,delay:300,useNativeDriver:true}).start();

    setTimeout(function(){setTransStep(1)},1000);
    setTimeout(function(){setTransStep(2)},2200);
    setTimeout(function(){
      setTransStep(3);
      transPulse.stopAnimation();
      setTimeout(function(){
        RNAnimated.timing(transOpacity,{toValue:0,duration:500,useNativeDriver:true}).start(function(){
          setShowTransition(false);
          console.log('Navigate to Dashboard');
        });
      },800);
    },3200);
  };

  var calc = useMemo(function(){return calculateGoals(fd)},
    [fd.weight,fd.height,fd.age,fd.gender,fd.activityLevel,fd.goal,fd.targetKg,fd.paceMode,fd.timelineDays]);

  // Mapping activity level int → text pour Supabase
  var ACTIVITY_LABELS_DB = ['sedentary','light','moderate','active','extreme'];

  var handleRegister = function(){
    setLoading(true);
    var clientLixTag = generateLixTag();

    // ÉTAPE 1 — Auth signup
    fetch(SUPABASE_URL+'/auth/v1/signup',{
      method:'POST', headers:{'apikey':SUPABASE_ANON_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({ email:fd.email.trim().toLowerCase(), password:fd.password,
        data:{ full_name:fd.fullName.trim() },
      }),
    }).then(function(r){return r.json()}).then(function(authData){
      // Détection erreur — Supabase utilise error OU error_code+msg
      if(authData.error || authData.error_code || (authData.code && authData.code >= 400)){
        setLoading(false);
        var msg = authData.error_description || authData.msg || authData.error || 'Erreur inconnue';
        var isAlreadyRegistered = (msg+'').includes('already') || (authData.error_code||'').includes('already');

        if(isAlreadyRegistered){
          showAlert(
            lang==='fr'?'Adresse d\u00e9j\u00e0 utilis\u00e9e':'Email already taken',
            lang==='fr'?'Un compte existe d\u00e9j\u00e0 avec l\'adresse '+fd.email+'. Connectez-vous ou modifiez votre email.'
              :'An account already exists with '+fd.email+'. Sign in or change your email.',
            [
              {text:lang==='fr'?'Se connecter':'Sign in', color:'#00D984', onPress:function(){
                // TODO: navigation.navigate('Login')
                console.log('Navigate to Login');
              }},
              {text:lang==='fr'?'Modifier l\'email':'Change email', style:'cancel', onPress:function(){
                setStep(1); // retour Phase 1 pour changer l'email
              }},
            ],'error');
        } else {
          if(lang==='fr'){ if(msg.includes('valid email')) msg='Adresse email invalide.';
            else if(msg.includes('password')) msg='Mot de passe trop faible.'; }
          showAlert(lang==='fr'?'Erreur':'Error',msg,[{text:'OK',style:'cancel'}],'error');
        }
        return;
      }

      var userId = (authData.user && authData.user.id) || authData.id;
      var accessToken = authData.access_token || (authData.session && authData.session.access_token);
      if(!userId){
        setLoading(false);
        showAlert(lang==='fr'?'Erreur':'Error',
          lang==='fr'?'Impossible de cr\u00e9er le compte. R\u00e9essaie.':'Unable to create account. Try again.',
          [{text:'OK',style:'cancel'}],'error');
        return;
      }

      // ÉTAPE 2 — Créer le profil via RPC
      fetch(SUPABASE_URL+'/rest/v1/rpc/create_user_profile',{
        method:'POST',
        headers:{
          'apikey':SUPABASE_ANON_KEY,
          'Content-Type':'application/json',
          'Authorization':'Bearer '+(accessToken||SUPABASE_ANON_KEY),
        },
        body:JSON.stringify({
          p_user_id: userId,
          p_full_name: fd.fullName.trim(),
          p_lixtag: clientLixTag,
          p_age: parseInt(fd.age)||25,
          p_weight: parseFloat(fd.weight)||70,
          p_height: parseFloat(fd.height)||175,
          p_gender: fd.gender,
          p_activity_level: ACTIVITY_LABELS_DB[fd.activityLevel]||'moderately_active',
          p_dietary_regime: fd.diet,
          p_goal: fd.goal,
          p_target_weight_loss: fd.goal==='maintain'?0:fd.targetKg,
          p_target_months: Math.max(3, fd.goal==='maintain'?3:Math.ceil(calc.modes[['ambitious','reasonable','realistic'][fd.paceMode]].days/30)),
          p_daily_calorie_target: calc.dailyTarget,
          p_bmr: calc.bmr,
          p_tdee: calc.tdee,
          p_pace_mode: fd.paceMode,
        }),
      }).then(function(r){return r.json()}).then(function(profileResult){
        setLoading(false);
        var finalTag = (profileResult&&profileResult.lixtag)||clientLixTag;

        if(profileResult&&profileResult.success===false){
          showAlert(lang==='fr'?'Erreur':'Error',profileResult.error||'Erreur profil',
            [{text:'OK',style:'cancel'}],'error');
          return;
        }

        showAlert(lang==='fr'?'Bienvenue sur LIXUM !':'Welcome to LIXUM!',
          (lang==='fr'?'Ton compte est cr\u00e9\u00e9 !\n\nObjectif : '+calc.dailyTarget+' kcal/jour\n+50 LX Gems de bienvenue'
          :'Account created!\n\nGoal: '+calc.dailyTarget+' kcal/day\n+50 LX Gems welcome bonus'),
          [{text:lang==='fr'?'Commencer':'Get started',color:'#00D984',onPress:function(){
            hideAlert();
            startTransition(fd.fullName.split(' ')[0]);
            // TODO: AsyncStorage.setItem('lixum_user_id', userId)
            // TODO: navigation.navigate('Dashboard')
          }}],'success',finalTag);

      }).catch(function(err){
        setLoading(false);
        // Auth réussie mais profil échoué — on montre quand même le succès avec le tag client
        showAlert(lang==='fr'?'Bienvenue sur LIXUM !':'Welcome to LIXUM!',
          (lang==='fr'?'Compte cr\u00e9\u00e9 ! Profil sera sync\u00e9 au prochain lancement.'
          :'Account created! Profile will sync on next launch.'),
          [{text:lang==='fr'?'Commencer':'Get started',color:'#00D984',onPress:function(){
            hideAlert();
            startTransition(fd.fullName.split(' ')[0]);
          }}],'success',clientLixTag);
      });

    }).catch(function(){
      setLoading(false);
      showAlert(lang==='fr'?'Erreur':'Error',lang==='fr'?'Probl\u00e8me de connexion.':'Connection problem.',
        [{text:'OK',style:'cancel'}],'error');
    });
  };

  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={{flex:1}}>
      <View style={{ flex:1, backgroundColor:'#1E2530' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1E2530" />
        <SafeAreaView style={{flex:1}} edges={['top','bottom','left','right']}>
          <LinearGradient colors={['#1E2530','#222A35','#1A2029','#222A35','#1E2530']}
            locations={[0,0.25,0.5,0.75,1]} style={{flex:1}}>
            <TechBackground />
            <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>

              {/* Header */}
              <View style={{ flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingTop:8, paddingBottom:6, gap:14 }}>
                <CircularProgress step={step} total={totalSteps} />
                <View style={{flex:1}}>
                  <Text style={{ color:C.textPrimary, fontSize:15, fontWeight:'700' }}>{stepInfo[step-1].title}</Text>
                  <Text style={{ color:C.textMuted, fontSize:10, marginTop:2 }}>{stepInfo[step-1].sub}</Text>
                </View>
                <View style={{ flexDirection:'row', gap:6 }}>
                  {[{k:'en',f:'\uD83C\uDDEC\uD83C\uDDE7'},{k:'fr',f:'\uD83C\uDDEB\uD83C\uDDF7'}].map(function(l){return(
                    <TouchableOpacity key={l.k} onPress={function(){changeLang(l.k)}}>
                      <View style={{ paddingHorizontal:6, paddingVertical:3, borderRadius:5, borderWidth:1,
                        borderColor:lang===l.k?'rgba(0,217,132,0.4)':'rgba(62,72,85,0.4)',
                        backgroundColor:lang===l.k?'rgba(0,217,132,0.08)':'transparent' }}>
                        <Text style={{fontSize:12}}>{l.f}</Text></View>
                    </TouchableOpacity>
                  );})}
                </View>
              </View>

              {/* Dots */}
              <View style={{ flexDirection:'row', justifyContent:'center', gap:4, marginTop:6, marginBottom:2 }}>
                {Array.from({length:totalSteps}).map(function(_,i){return(
                  <View key={i} style={{ width:i+1===step?16:6, height:6, borderRadius:3,
                    backgroundColor:i+1<=step?'#00D984':'rgba(62,72,85,0.3)' }} />
                );})}
              </View>

              {/* Mini barre */}
              <View style={{ height:2, backgroundColor:'rgba(62,72,85,0.2)', marginHorizontal:20, marginBottom:8, marginTop:6 }}>
                <LinearGradient colors={['#00A866','#00D984']} start={{x:0,y:0}} end={{x:1,y:0}}
                  style={{ height:'100%', width:(step/totalSteps*100)+'%', borderRadius:1 }} />
              </View>

              {/* Contenu */}
              <View style={{flex:1}}>
                {step===1?<Phase1Identity formData={fd} setFormData={sf} t={t} lang={lang} />:null}
                {step===2?<Phase2Morphology formData={fd} setFormData={sf} t={t} lang={lang} />:null}
                {step===3?<Phase3Activity formData={fd} setFormData={sf} t={t} lang={lang} />:null}
                {step===4?<Phase4Diet formData={fd} setFormData={sf} t={t} lang={lang} />:null}
                {step===5?<Phase5Goals formData={fd} setFormData={sf} calculations={calc} t={t} lang={lang} />:null}
                {step===6?<Phase6Characters lang={lang} />:null}
              </View>

              <NavigationButtons step={step} setStep={setStep} totalSteps={totalSteps}
                formData={fd} onComplete={handleRegister} t={t} loading={loading} />

            </KeyboardAvoidingView>

            {/* Modal LIXUM — Premium */}
            <Modal visible={lixAlert.visible} transparent animationType="fade" onRequestClose={hideAlert}>
              <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.75)', justifyContent:'center', alignItems:'center', paddingHorizontal:24 }}>
                <LinearGradient colors={['#1E2530','#161C26','#121820']}
                  style={{ borderRadius:20, paddingHorizontal:24, paddingVertical:28, width:'100%', alignItems:'center',
                    borderWidth:1, borderColor: lixAlert.emoji==='success' ? 'rgba(0,217,132,0.2)' : 'rgba(255,77,77,0.2)' }}>

                  {/* Icône SVG premium */}
                  <View style={{ width:64, height:64, borderRadius:32, marginBottom:16,
                    backgroundColor: lixAlert.emoji==='success' ? 'rgba(0,217,132,0.08)' : 'rgba(255,77,77,0.08)',
                    borderWidth:1.5, borderColor: lixAlert.emoji==='success' ? 'rgba(0,217,132,0.3)' : 'rgba(255,77,77,0.3)',
                    alignItems:'center', justifyContent:'center',
                    shadowColor: lixAlert.emoji==='success' ? '#00D984' : '#FF4D4D',
                    shadowOffset:{width:0,height:0}, shadowOpacity:0.2, shadowRadius:12 }}>
                    <Ionicons name={lixAlert.emoji==='success' ? 'checkmark-done-outline' : 'alert-circle-outline'}
                      size={30} color={lixAlert.emoji==='success' ? '#00D984' : '#FF4D4D'} />
                  </View>

                  <Text style={{ fontSize:18, fontWeight:'700', color:'#EAEEF3', textAlign:'center', marginBottom:8 }}>{lixAlert.title}</Text>

                  {/* Badge LixTag copiable */}
                  {lixAlert.lixTag ? (
                    <View style={{ alignItems:'center', marginBottom:12 }}>
                      <TouchableOpacity activeOpacity={0.7} onPress={function(){
                        Clipboard.setStringAsync(lixAlert.lixTag);
                      }} style={{
                        flexDirection:'row', alignItems:'center', gap:8,
                        backgroundColor:'rgba(0,217,132,0.06)', borderRadius:10,
                        paddingHorizontal:14, paddingVertical:8,
                        borderWidth:1, borderColor:'rgba(0,217,132,0.2)',
                      }}>
                        <Ionicons name="finger-print" size={14} color="#00D984" />
                        <Text style={{ color:'#00D984', fontSize:14, fontWeight:'800', letterSpacing:2, fontFamily:Platform.OS==='android'?'monospace':'Menlo' }}>{lixAlert.lixTag}</Text>
                        <Ionicons name="copy-outline" size={14} color="#8892A0" />
                      </TouchableOpacity>
                      <Text style={{ color:'#555E6C', fontSize:9, textAlign:'center', marginTop:6, lineHeight:13, paddingHorizontal:10 }}>
                        {lang==='fr'?'Votre LixTag est votre identifiant anonyme.\nIl prot\u00e8ge votre confidentialit\u00e9 dans l\u2019app.'
                        :'Your LixTag is your anonymous identifier.\nIt protects your privacy in the app.'}
                      </Text>
                    </View>
                  ) : null}

                  <Text style={{ fontSize:13, color:'rgba(255,255,255,0.5)', textAlign:'center', lineHeight:20, marginBottom:20 }}>{lixAlert.message}</Text>
                  {lixAlert.buttons.map(function(btn,i){ var ic=btn.style==='cancel'; var bc=btn.color||(ic?'rgba(255,255,255,0.4)':'#00D984'); return(
                    <TouchableOpacity key={i} onPress={function(){hideAlert();if(btn.onPress)btn.onPress()}} activeOpacity={0.7}
                      style={{ width:'100%', paddingVertical:14, borderRadius:14, alignItems:'center', marginBottom:6,
                        backgroundColor:ic?'transparent':bc+'20', borderWidth:ic?1:0, borderColor:ic?'rgba(255,255,255,0.1)':'transparent' }}>
                      <Text style={{ fontSize:15, fontWeight:ic?'500':'700', color:bc }}>{btn.text}</Text>
                    </TouchableOpacity>
                  );})}
                  {lixAlert.buttons.length===0?<TouchableOpacity onPress={hideAlert}
                    style={{ paddingVertical:14, width:'100%', alignItems:'center', borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.1)' }}>
                    <Text style={{ fontSize:15, fontWeight:'500', color:'rgba(255,255,255,0.4)' }}>OK</Text>
                  </TouchableOpacity>:null}
                </LinearGradient>
              </View>
            </Modal>

            {/* ═══ TRANSITION ANIMÉE vers Dashboard ═══ */}
            {showTransition ? (
              <RNAnimated.View style={{
                position:'absolute', top:0, left:0, right:0, bottom:0, zIndex:9999,
                opacity:transOpacity,
              }}>
                <LinearGradient colors={['#0D1117','#141A22','#0D1117']}
                  style={{ flex:1, justifyContent:'center', alignItems:'center' }}>

                  {/* Logo LIXUM pulsant */}
                  <RNAnimated.View style={{ transform:[{scale:transPulse}], marginBottom:30 }}>
                    <Image source={require('./lixum-logo.webp')}
                      style={{ width:160, height:160 }} resizeMode="contain" />
                  </RNAnimated.View>

                  {/* Tagline */}
                  <RNAnimated.View style={{ opacity:transTextOp, alignItems:'center' }}>
                    <Text style={{ fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:3, marginBottom:30 }}>
                      {lang==='fr'?'VOTRE SANT\u00c9, QUANTIFI\u00c9E':'YOUR HEALTH, QUANTIFIED'}
                    </Text>
                  </RNAnimated.View>

                  {/* Barre de progression */}
                  <View style={{ width:200, height:3, borderRadius:1.5, backgroundColor:'rgba(255,255,255,0.06)', marginBottom:16, overflow:'hidden' }}>
                    <RNAnimated.View style={{
                      height:'100%', borderRadius:1.5, backgroundColor:'#00D984',
                      width:transProgress.interpolate({inputRange:[0,100],outputRange:['0%','100%']}),
                    }} />
                  </View>

                  {/* Étapes de chargement */}
                  <RNAnimated.View style={{ opacity:transTextOp, alignItems:'center', height:40 }}>
                    {transStep < 3 ? (
                      <Text style={{ fontSize:12, color:'rgba(255,255,255,0.35)', fontStyle:'italic' }}>
                        {[
                          lang==='fr'?'Synchronisation du profil...':'Syncing your profile...',
                          lang==='fr'?'Chargement du Dashboard...':'Loading Dashboard...',
                          lang==='fr'?'Pr\u00e9paration de votre espace...':'Preparing your space...',
                        ][transStep]}
                      </Text>
                    ) : (
                      <Text style={{ fontSize:16, fontWeight:'700', color:'#00D984' }}>
                        {lang==='fr'?'Bienvenue, '+transName+' !':'Welcome, '+transName+' !'}
                      </Text>
                    )}
                  </RNAnimated.View>

                </LinearGradient>
              </RNAnimated.View>
            ) : null}

          </LinearGradient>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================
var s = StyleSheet.create({
  phaseIcon: { width:50, height:50, borderRadius:12, backgroundColor:'rgba(0,217,132,0.08)',
    borderWidth:1, borderColor:'rgba(0,217,132,0.2)', alignItems:'center', justifyContent:'center' },
  phaseTitle: { color:'#EAEEF3', fontSize:22, fontWeight:'700', textAlign:'center', marginBottom:4 },
  phaseSubtitle: { color:'#8892A0', fontSize:13, textAlign:'center', marginBottom:20 },
  inputLabel: { color:'#8892A0', fontSize:12, fontWeight:'600', marginBottom:6, letterSpacing:0.5 },
  inputPremium: { borderRadius:10, backgroundColor:'#0A0E14', borderWidth:1, borderColor:'rgba(62,72,85,0.3)' },
  inputValid: { borderColor:'rgba(0,217,132,0.3)' },
  inputText: { color:'#EAEEF3', fontSize:14, paddingHorizontal:14, paddingVertical:12 },
});
