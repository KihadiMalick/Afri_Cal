// LIXUM - Welcome Onboarding (Tinder-Style) v8.0
// Dependances: expo-linear-gradient, react-native-gesture-handler,
//              react-native-reanimated, @expo/vector-icons, react-native-svg,
//              @react-native-async-storage/async-storage
// Logo: mettre logo-lx.png dans le dossier assets du Snack
//
// v8.1 — Labels traduits, ADN recadré, langue persistée via AsyncStorage
//         La langue choisie ici s'applique à TOUTES les pages suivantes.
//         Chaque page lit : AsyncStorage.getItem('lixum_lang')

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated as RNAnimated,
  Easing,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing as REasing,
  FadeInDown,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Rect, Ellipse, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { wp, fp, SCREEN } from '../constants/layout';
import { COLORS, GRADIENTS } from '../constants/colors';

var CARD_W = SCREEN.width - 56;
var CARD_H = SCREEN.height * 0.48;
var SWIPE_THRESHOLD = SCREEN.width * 0.25;

var logoImage = require('../../assets/logo-lx.png');

// ============================================================
// TRADUCTIONS
// ============================================================

var texts = {
  fr: {
    welcome: 'La science au service',
    welcomeLine2: 'de votre sant\u00e9',
    brandName: 'LIXUM',
    tagline: 'CR\u00c9\u00c9 EN AFRIQUE \u00B7 POUR LE MONDE',

    slide1Title: 'SCAN X',
    slide1Subtitle: 'Scannez, on calcule tout',
    slide1Lines: [
      { icon: 'aperture-outline', text: 'Pas un gadget \u2014 un vrai moteur de calcul' },
      { icon: 'cube-outline', text: 'Calories, prot\u00e9ines, glucides, lipides' },
      { icon: 'earth-outline', text: 'Thi\u00e9boudienne, ndol\u00e9, couscous... 524 plats africains' },
    ],

    slide2Title: 'PROCESSUS RIGOUREUX',
    slide2Subtitle: 'Des donn\u00e9es que vous pouvez v\u00e9rifier',
    slide2Lines: [
      { icon: 'shield-checkmark-outline', text: 'Sources certifi\u00e9es USDA \u00B7 FAO \u00B7 ANSES' },
      { icon: 'color-palette-outline', text: 'Recettes adapt\u00e9es \u00e0 votre humeur et m\u00e9t\u00e9o' },
      { icon: 'git-network-outline', text: 'Formule Mifflin-St Jeor valid\u00e9e scientifiquement' },
    ],

    slide3Title: 'VOTRE CORPS, QUANTIFI\u00c9',
    slide3Subtitle: 'Votre hygi\u00e8ne de vie en chiffres',
    slide3Lines: [
      { icon: 'radio-outline', text: 'Score Vitalit\u00e9 en temps r\u00e9el sur 100' },
      { icon: 'water-outline', text: 'Hydratation intelligente avec BHI scientifique' },
      { icon: 'people-outline', text: 'Bin\u00f4me sant\u00e9 — progressez \u00e0 deux' },
    ],

    hasAccount: 'D\u00e9j\u00e0 un compte ?',
    signIn: 'Se connecter',
    readyTitle: 'Votre Dashboard vous attend',
    readySubtitle: 'R\u00e9acteurs \u00e9nerg\u00e9tiques \u00B7 ADN Vitalit\u00e9 \u00B7 Coach IA',
    joinBtn: 'Rejoindre LIXUM',
    swipeHint: 'Glissez',
    madeIn: 'Con\u00e7u au Burundi',
  },
  en: {
    welcome: 'Science meets',
    welcomeLine2: 'your health',
    brandName: 'LIXUM',
    tagline: 'MADE IN AFRICA \u00B7 FOR THE WORLD',

    slide1Title: 'SCAN X',
    slide1Subtitle: 'Scan it, we calculate everything',
    slide1Lines: [
      { icon: 'aperture-outline', text: 'Not a gimmick \u2014 a real calculation engine' },
      { icon: 'cube-outline', text: 'Calories, proteins, carbs, fats' },
      { icon: 'earth-outline', text: 'Thi\u00e9boudienne, ndol\u00e9, couscous... 524 African dishes' },
    ],

    slide2Title: 'RIGOROUS PROCESS',
    slide2Subtitle: 'Data you can actually verify',
    slide2Lines: [
      { icon: 'shield-checkmark-outline', text: 'Certified sources: USDA \u00B7 FAO \u00B7 ANSES' },
      { icon: 'color-palette-outline', text: 'Recipes adapted to your mood & weather' },
      { icon: 'git-network-outline', text: 'Mifflin-St Jeor formula, scientifically validated' },
    ],

    slide3Title: 'YOUR BODY, QUANTIFIED',
    slide3Subtitle: 'Your lifestyle in numbers',
    slide3Lines: [
      { icon: 'radio-outline', text: 'Real-time Vitality Score out of 100' },
      { icon: 'water-outline', text: 'Smart hydration with scientific BHI' },
      { icon: 'people-outline', text: 'Health partner — progress together' },
    ],

    hasAccount: 'Already have an account?',
    signIn: 'Sign in',
    readyTitle: 'Your Dashboard awaits',
    readySubtitle: 'Energy reactors \u00B7 Vitality DNA \u00B7 AI Coach',
    joinBtn: 'Join LIXUM',
    swipeHint: 'Swipe',
    madeIn: 'Built in Burundi',
  },
};

// ============================================================
// BACKGROUND TECH — grille + points + crochets HUD
// ============================================================

function TechBackground() {
  var W = SCREEN.width;
  var H = SCREEN.height;
  var gridSpacing = 50;
  var lines = [];
  var dots = [];

  for (var y = 0; y < H; y += gridSpacing) {
    lines.push(
      <Line key={'h-' + y} x1="0" y1={y} x2={W} y2={y}
        stroke="rgba(62, 72, 85, 0.25)" strokeWidth="0.5" />
    );
  }
  for (var x = 0; x < W; x += gridSpacing) {
    lines.push(
      <Line key={'v-' + x} x1={x} y1="0" x2={x} y2={H}
        stroke="rgba(62, 72, 85, 0.25)" strokeWidth="0.5" />
    );
  }
  for (var x2 = 0; x2 < W; x2 += gridSpacing * 2) {
    for (var y2 = 0; y2 < H; y2 += gridSpacing * 2) {
      dots.push(
        <Circle key={'d-' + x2 + '-' + y2} cx={x2} cy={y2} r="1.5"
          fill="rgba(0, 217, 132, 0.14)" />
      );
    }
  }

  return (
    <Svg width={W} height={H}
      style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      {lines}
      {dots}
      <Line x1="60" y1={H * 0.35} x2="90" y2={H * 0.35}
        stroke="rgba(0,217,132,0.15)" strokeWidth="1" strokeDasharray="4 3" />
      <Line x1={W - 90} y1={H * 0.35} x2={W - 60} y2={H * 0.35}
        stroke="rgba(0,217,132,0.15)" strokeWidth="1" strokeDasharray="4 3" />
      <Line x1="60" y1={H * 0.42} x2="80" y2={H * 0.42}
        stroke="rgba(62,72,85,0.2)" strokeWidth="0.5" />
      <Line x1={W - 80} y1={H * 0.42} x2={W - 60} y2={H * 0.42}
        stroke="rgba(62,72,85,0.2)" strokeWidth="0.5" />
    </Svg>
  );
}

// ============================================================
// CIRCUIT PATTERN
// ============================================================

function CircuitPattern(props) {
  var width = props.width;
  var height = props.height;
  var color = props.color || 'rgba(0, 217, 132, 0.06)';
  return (
    <Svg width={width} height={height}
      style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Line x1="20" y1={height * 0.15} x2={width * 0.35} y2={height * 0.15} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.35} cy={height * 0.15} r="2" fill={color} />
      <Line x1={width * 0.35} y1={height * 0.15} x2={width * 0.35} y2={height * 0.25} stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.65} y1={height * 0.12} x2={width - 20} y2={height * 0.12} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.65} cy={height * 0.12} r="2" fill={color} />
      <Line x1={width * 0.65} y1={height * 0.12} x2={width * 0.65} y2={height * 0.20} stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.65} y1={height * 0.20} x2={width * 0.75} y2={height * 0.20} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.75} cy={height * 0.20} r="1.5" fill={color} />
      <Line x1="15" y1={height * 0.50} x2="15" y2={height * 0.60} stroke={color} strokeWidth="0.8" />
      <Line x1="15" y1={height * 0.60} x2={width * 0.20} y2={height * 0.60} stroke={color} strokeWidth="0.8" />
      <Rect x={width * 0.20 - 3} y={height * 0.60 - 3} width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.70} y1={height * 0.75} x2={width - 15} y2={height * 0.75} stroke={color} strokeWidth="0.8" />
      <Line x1={width - 15} y1={height * 0.75} x2={width - 15} y2={height * 0.85} stroke={color} strokeWidth="0.8" />
      <Circle cx={width - 15} cy={height * 0.85} r="2" fill={color} />
      <Line x1={width * 0.15} y1={height * 0.82} x2={width * 0.30} y2={height * 0.82} stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.30} y1={height * 0.82} x2={width * 0.30} y2={height * 0.90} stroke={color} strokeWidth="0.8" />
      <Rect x={width * 0.30 - 3} y={height * 0.90 - 3} width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.30 + 3} y1={height * 0.90} x2={width * 0.45} y2={height * 0.90} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.45} cy={height * 0.90} r="1.5" fill={color} />
      <Circle cx={width * 0.50} cy={height * 0.30} r="1" fill={color} />
      <Circle cx={width * 0.85} cy={height * 0.45} r="1" fill={color} />
      <Circle cx={width * 0.25} cy={height * 0.70} r="1" fill={color} />
    </Svg>
  );
}

// ============================================================
// ICONE SVG — SCAN X
// ============================================================

function ScanXIcon(props) {
  var size = props.size || 56;
  var color = props.color || COLORS.emerald;
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="26" fill="rgba(0,0,0,0.3)" stroke={color + '50'} strokeWidth="1.5" />
      <Line x1="14" y1="14" x2="42" y2="42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="42" y1="14" x2="14" y2="42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 10 18 L 10 10 L 18 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M 38 10 L 46 10 L 46 18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M 10 38 L 10 46 L 18 46" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M 38 46 L 46 46 L 46 38" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="28" cy="28" r="3" fill={color} opacity="0.6" />
    </Svg>
  );
}

// ============================================================
// ICONE ANIMEE
// ============================================================

function SlideIcon(props) {
  var type = props.type;
  var color = props.color;
  var pulse = useSharedValue(1);
  var glow = useSharedValue(0.2);

  useEffect(function () {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing: REasing.inOut(REasing.ease) }),
        withTiming(1, { duration: 1500, easing: REasing.inOut(REasing.ease) })
      ), -1, true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: REasing.inOut(REasing.ease) }),
        withTiming(0.2, { duration: 2000, easing: REasing.inOut(REasing.ease) })
      ), -1, true
    );
  }, []);

  var pulseStyle = useAnimatedStyle(function () {
    return { transform: [{ scale: pulse.value }] };
  });
  var glowStyle = useAnimatedStyle(function () {
    return { opacity: glow.value };
  });

  return (
    <View style={{ alignItems: 'center', marginBottom: 10 }}>
      <Animated.View style={[{
        position: 'absolute', width: 80, height: 80, borderRadius: 40,
        backgroundColor: color, top: -12,
      }, glowStyle]} />
      <Animated.View style={[{ width: 52, height: 52 }, pulseStyle]}>
        {type === 'scan' && <ScanXIcon size={52} color={color} />}
        {type === 'nutrition' && (
          <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={52} height={52} viewBox="0 0 56 56">
              <Circle cx="28" cy="28" r="26" fill="rgba(0,0,0,0.3)" stroke={color + '50'} strokeWidth="1.5" />
            </Svg>
            <Ionicons name="shield-checkmark-outline" size={28} color={color} style={{ position: 'absolute' }} />
          </View>
        )}
        {type === 'dashboard' && (
          <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={52} height={52} viewBox="0 0 56 56">
              <Circle cx="28" cy="28" r="26" fill="rgba(0,0,0,0.3)" stroke={color + '50'} strokeWidth="1.5" />
            </Svg>
            <Ionicons name="pulse-outline" size={28} color={color} style={{ position: 'absolute' }} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ============================================================
// SWIPE HINT
// ============================================================

function SwipeHint(props) {
  var lang = props.lang;
  var translateX = useRef(new RNAnimated.Value(0)).current;

  useEffect(function () {
    var loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(500),
        RNAnimated.timing(translateX, { toValue: -40, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.timing(translateX, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.delay(1000),
      ])
    );
    loop.start();
    return function () { loop.stop(); };
  }, []);

  return (
    <RNAnimated.View style={{ transform: [{ translateX: translateX }] }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)', gap: 6,
      }}>
        <Text style={{ color: COLORS.emerald, fontSize: 10, fontWeight: '600' }}>
          {lang === 'fr' ? 'Glissez' : 'Swipe'}
        </Text>
        <Ionicons name="chevron-back-outline" size={12} color={COLORS.emerald} />
        <Ionicons name="chevron-back-outline" size={12} color={COLORS.emerald} style={{ marginLeft: -6, opacity: 0.5 }} />
      </View>
    </RNAnimated.View>
  );
}

// ============================================================
// MINI DASHBOARD PREVIEW — SVG animé (2 réacteurs + ADN)
// ============================================================

function MiniDashboardPreview(props) {
  var lang = props.lang || 'fr';
  var w = CARD_W - 48;
  var h = 118;
  var cx = w / 2;

  // Positions des 3 éléments
  var leftX = w * 0.22;
  var rightX = w * 0.78;
  var centerX = cx;
  var centerY = 46;
  var reactorR = 26;
  var labelY = centerY + reactorR + 16;

  // Labels traduits
  var labelLeft = lang === 'fr' ? 'CONSOMMÉ' : 'CONSUMED';
  var labelCenter = lang === 'fr' ? 'VITALITÉ' : 'VITALITY';
  var labelRight = lang === 'fr' ? 'RESTE' : 'REMAINING';

  return (
    <View style={{ alignItems: 'center', marginBottom: 10 }}>
      <Svg width={w} height={h} viewBox={'0 0 ' + w + ' ' + h}>
        <Defs>
          <SvgLinearGradient id="orangeG" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#FFB87A" />
            <Stop offset="100%" stopColor={COLORS.orange} />
          </SvgLinearGradient>
          <SvgLinearGradient id="blueG" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#8DCAFF" />
            <Stop offset="100%" stopColor={COLORS.blue} />
          </SvgLinearGradient>
          <SvgLinearGradient id="greenG" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#5DFFB4" />
            <Stop offset="100%" stopColor={COLORS.emerald} />
          </SvgLinearGradient>
        </Defs>

        {/* Réacteur gauche — Consommé (orange) */}
        <Circle cx={leftX} cy={centerY} r={reactorR} fill="none" stroke="url(#orangeG)" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.6} />
        <Circle cx={leftX} cy={centerY} r={reactorR - 7} fill="none" stroke={COLORS.orange} strokeWidth={0.8} strokeDasharray="4 2" opacity={0.3} />
        <Circle cx={leftX} cy={centerY} r={11} fill="rgba(255,140,66,0.08)" />
        <Svg>
          <Path d={'M' + (leftX - 1) + ' ' + (centerY - 7) + 'L' + (leftX - 4) + ' ' + centerY + 'L' + (leftX + 3) + ' ' + centerY + 'L' + (leftX - 1) + ' ' + (centerY + 7) + 'Z'} fill={COLORS.orange} opacity={0.7} />
        </Svg>
        {/* Satellite vert sur orbite gauche */}
        <Circle cx={leftX} cy={centerY - reactorR - 3} r={2.5} fill={COLORS.emerald} />
        <Circle cx={leftX} cy={centerY - reactorR - 3} r={4} fill={COLORS.emerald} opacity={0.2} />

        {/* ADN central — hauteur réduite pour ne pas toucher les labels */}
        {Array.from({ length: 18 }, function(_, i) {
          var t = i / 17;
          var y = 12 + t * 62;
          var angle = t * Math.PI * 3;
          var x1 = centerX + Math.sin(angle) * 11;
          var x2 = centerX + Math.sin(angle + Math.PI) * 11;
          var depth = Math.cos(angle);
          return (
            <G key={'dna' + i}>
              {Math.abs(depth) > 0.3 && i % 3 === 0 && (
                <Line x1={x1} y1={y} x2={x2} y2={y} stroke="#5DFFB4" strokeWidth={1} opacity={0.25 + Math.abs(depth) * 0.2} />
              )}
              <Circle cx={x1} cy={y} r={depth > 0 ? 2 : 1} fill={COLORS.emerald} opacity={depth > 0 ? 0.7 : 0.2} />
              <Circle cx={x2} cy={y} r={depth < 0 ? 2 : 1} fill="#00BFA6" opacity={depth < 0 ? 0.7 : 0.2} />
            </G>
          );
        })}

        {/* Réacteur droit — Reste (bleu) */}
        <Circle cx={rightX} cy={centerY} r={reactorR} fill="none" stroke="url(#blueG)" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.6} />
        <Circle cx={rightX} cy={centerY} r={reactorR - 7} fill="none" stroke={COLORS.blue} strokeWidth={0.8} strokeDasharray="4 2" opacity={0.3} />
        <Circle cx={rightX} cy={centerY} r={11} fill="rgba(77,166,255,0.08)" />
        <Svg>
          <Path d={'M' + (rightX - 1) + ' ' + (centerY - 7) + 'L' + (rightX - 4) + ' ' + centerY + 'L' + (rightX + 3) + ' ' + centerY + 'L' + (rightX - 1) + ' ' + (centerY + 7) + 'Z'} fill={COLORS.blue} opacity={0.7} />
        </Svg>
        {/* Satellite sur orbite droite */}
        <Circle cx={rightX} cy={centerY - reactorR - 3} r={2} fill="#8DCAFF" opacity={0.6} />

        {/* Labels pill backgrounds — centrés sous chaque figure */}
        <Rect x={leftX - 30} y={labelY - 7} width={60} height={14} rx={4} fill="rgba(255,140,66,0.08)" />
        <Rect x={centerX - 24} y={labelY - 7} width={48} height={14} rx={4} fill="rgba(0,217,132,0.08)" />
        <Rect x={rightX - 30} y={labelY - 7} width={60} height={14} rx={4} fill="rgba(77,166,255,0.08)" />
      </Svg>

      {/* Labels texte — positionnés absolument sous chaque figure */}
      <View style={{ position: 'absolute', top: labelY - 5, left: 0, width: w, height: 14 }}>
        <Text style={{ position: 'absolute', left: leftX - 30, width: 60, textAlign: 'center', color: COLORS.orange, fontSize: 7, fontWeight: '700', letterSpacing: 0.6 }}>{labelLeft}</Text>
        <Text style={{ position: 'absolute', left: centerX - 24, width: 48, textAlign: 'center', color: COLORS.emerald, fontSize: 7, fontWeight: '800', letterSpacing: 0.6 }}>{labelCenter}</Text>
        <Text style={{ position: 'absolute', left: rightX - 30, width: 60, textAlign: 'center', color: COLORS.blue, fontSize: 7, fontWeight: '700', letterSpacing: 0.6 }}>{labelRight}</Text>
      </View>
    </View>
  );
}
