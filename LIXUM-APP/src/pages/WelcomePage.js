// LIXUM - Welcome Onboarding (Tinder-Style) v8.0
// Dependances: expo-linear-gradient, react-native-gesture-handler,
//              react-native-reanimated, @expo/vector-icons, react-native-svg,
//              @react-native-async-storage/async-storage
// Logo: mettre logo-lx.png dans le dossier assets du Snack
//
// v8.1 — Labels traduits, ADN recadré, langue persistée via AsyncStorage
//         La langue choisie ici s'applique à TOUTES les pages suivantes.
//         Chaque page lit : AsyncStorage.getItem('lixum_lang')

import React, { useState, useCallback, useEffect, useRef } from 'react';
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

// ============================================================
// CARTE POKEMON PREMIUM
// ============================================================

function PokemonCard(props) {
  var slide = props.slide;
  var index = props.index;
  var isTopCard = props.isTopCard;
  var currentIndex = props.currentIndex;
  var onSwipe = props.onSwipe;
  var lang = props.lang;

  var translateX = useSharedValue(0);
  var translateY = useSharedValue(0);
  var rotateZ = useSharedValue(0);

  var gesture = Gesture.Pan()
    .enabled(isTopCard)
    .onUpdate(function (event) {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
      rotateZ.value = interpolate(
        event.translationX, [-SCREEN.width, 0, SCREEN.width], [-12, 0, 12],
        Extrapolation.CLAMP
      );
    })
    .onEnd(function (event) {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        var dir = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(dir * SCREEN.width * 1.5, { duration: 300 });
        rotateZ.value = withTiming(dir * 20, { duration: 300 });
        runOnJS(onSwipe)(dir);
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  var animStyle = useAnimatedStyle(function () {
    if (!isTopCard) return {};
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: rotateZ.value + 'deg' },
      ],
    };
  });

  var behindStyle = !isTopCard ? {
    transform: [{ scale: 0.95 }, { translateY: 10 }],
    opacity: 0.5,
  } : {};

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[
        { position: 'absolute', alignSelf: 'center', zIndex: isTopCard ? 10 : 5 },
        isTopCard ? animStyle : behindStyle,
      ]}>
        <View style={{
          width: CARD_W + 8, height: CARD_H + 8, borderRadius: 24, padding: 4,
          borderWidth: 2, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D',
          borderRightColor: '#3E4855', borderBottomColor: '#2A303B',
          backgroundColor: '#2A303B',
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.6, shadowRadius: 16, elevation: 14,
        }}>
          <View style={{
            flex: 1, borderRadius: 20, borderWidth: 1.5,
            borderColor: 'rgba(0,217,132,0.35)', overflow: 'hidden',
            shadowColor: COLORS.emerald, shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1, shadowRadius: 8,
          }}>
            <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 18 }}>
              <CircuitPattern width={CARD_W} height={CARD_H} color="rgba(0, 217, 132, 0.05)" />
              <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 110,
                borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={['#1E2530', '#1A2028', COLORS.surface]}
                  start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                  style={{ flex: 1 }}
                />
              </View>
              <View style={{
                position: 'absolute', top: 0, left: 16, right: 16,
                height: 1, backgroundColor: 'rgba(136,146,160,0.25)',
              }} />

              <View style={{
                flex: 1, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 14,
                justifyContent: 'space-between',
              }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ marginBottom: 10 }}>
                    <SlideIcon type={slide.key} color={slide.color} />
                  </View>
                  <Text style={{
                    color: '#EAEEF3', fontSize: 20, fontWeight: '800',
                    letterSpacing: 3, textAlign: 'center', marginBottom: 3,
                  }}>{slide.title}</Text>
                  <Text style={{
                    color: '#8892A0', fontSize: 11, fontWeight: '500',
                    letterSpacing: 1, textAlign: 'center',
                  }}>{slide.subtitle}</Text>
                </View>

                <View style={{ gap: 14 }}>
                  {slide.lines.map(function (line, i) {
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{
                          width: 36, height: 36, borderRadius: 10,
                          backgroundColor: 'rgba(0,217,132,0.08)',
                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Ionicons name={line.icon} size={17} color={COLORS.emerald} />
                        </View>
                        <Text style={{
                          color: '#EAEEF3', fontSize: 12.5, fontWeight: '500',
                          flex: 1, lineHeight: 17,
                        }}>{line.text}</Text>
                      </View>
                    );
                  })}
                </View>

                <View>
                  {isTopCard && currentIndex === 0 ? (
                    <View style={{ alignItems: 'center', marginBottom: 14 }}>
                      <SwipeHint lang={lang} />
                    </View>
                  ) : null}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                    {slide.badges.map(function (badge, i) {
                      return (
                        <View key={i} style={{
                          paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5,
                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.22)',
                          backgroundColor: 'rgba(0,217,132,0.05)',
                        }}>
                          <Text style={{ color: COLORS.emerald, fontSize: 8, fontWeight: '700', letterSpacing: 0.8 }}>{badge}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// ============================================================
// SHIMMER BUTTON
// ============================================================

function ShimmerButton(props) {
  var onPress = props.onPress;
  var text = props.text;
  var shimmerX = useRef(new RNAnimated.Value(-200)).current;

  useEffect(function () {
    var loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(2000),
        RNAnimated.timing(shimmerX, {
          toValue: 400, duration: 1200,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        RNAnimated.timing(shimmerX, { toValue: -200, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return function () { loop.stop(); };
  }, []);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ width: '100%', borderRadius: 14 }}>
      <View style={{
        borderRadius: 14, overflow: 'hidden',
        shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
      }}>
        <LinearGradient
          colors={[COLORS.gold, '#C5A028', '#A68B1B', '#8B7516']}
          locations={[0, 0.3, 0.7, 1]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingVertical: 16, alignItems: 'center', position: 'relative' }}
        >
          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderTopLeftRadius: 14, borderTopRightRadius: 14,
          }} />
          <View style={{
            position: 'absolute', top: 0, left: 20, right: 20,
            height: 1, backgroundColor: 'rgba(255, 223, 100, 0.5)',
          }} />
          <RNAnimated.View style={{
            position: 'absolute', top: 0, bottom: 0, width: 60,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: [{ translateX: shimmerX }, { skewX: '-20deg' }],
          }} />
          <Text style={{ color: COLORS.background, fontSize: 16, fontWeight: '800', letterSpacing: 1.5 }}>{text}</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================
// PAGE WELCOME
// ============================================================

export default function App() {
  var _lang = useState('fr');
  var lang = _lang[0]; var setLang = _lang[1];

  // === PERSISTANCE LANGUE ===
  // Charger la langue sauvegardée au démarrage
  useEffect(function () {
    AsyncStorage.getItem('lixum_lang').then(function (saved) {
      if (saved === 'en' || saved === 'fr') setLang(saved);
    }).catch(function () {});
  }, []);

  // Changer + sauvegarder la langue (utilisé par les boutons EN/FR)
  var changeLang = function (newLang) {
    setLang(newLang);
    AsyncStorage.setItem('lixum_lang', newLang).catch(function () {});
  };
  var _currentIndex = useState(0);
  var currentIndex = _currentIndex[0]; var setCurrentIndex = _currentIndex[1];
  var t = texts[lang];

  var slides = [
    {
      key: 'scan', title: t.slide1Title, subtitle: t.slide1Subtitle,
      lines: t.slide1Lines, badges: ['AI-POWERED', 'REAL-TIME', '524 PLATS'], color: COLORS.emerald,
    },
    {
      key: 'nutrition', title: t.slide2Title, subtitle: t.slide2Subtitle,
      lines: t.slide2Lines, badges: ['USDA', 'FAO', 'ANSES'], color: COLORS.emerald,
    },
    {
      key: 'dashboard', title: t.slide3Title, subtitle: t.slide3Subtitle,
      lines: t.slide3Lines, badges: ['SCORE 0-100', 'BHI', 'AI COACH'], color: COLORS.emerald,
    },
  ];

  var handleSwipe = useCallback(function (direction) {
    setTimeout(function () {
      setCurrentIndex(function (prev) { return Math.min(prev + 1, slides.length); });
    }, 200);
  }, [slides.length]);

  var handleJoin = function () {
    // TODO: navigation.navigate('Register')
    console.log('Navigate to Register');
  };

  var handleSignIn = function () {
    // TODO: navigation.navigate('Login')
    console.log('Navigate to Login');
  };

  var allSwiped = currentIndex >= slides.length;

  return (
    <SafeAreaProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#1E2530' }} edges={['top', 'bottom', 'left', 'right']}>
        <LinearGradient
          colors={GRADIENTS.background}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={{ flex: 1 }}
        >
          <TechBackground />

          <View style={{
            flex: 1, paddingHorizontal: 24,
            paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
            paddingBottom: 8,
          }}>

            {/* HEADER : Logo + Drapeaux */}
            <View style={{
              width: '100%', flexDirection: 'row', alignItems: 'center',
              justifyContent: 'center', position: 'relative',
            }}>
              <TouchableOpacity onPress={function () { changeLang('en'); }} activeOpacity={0.7}
                style={{ position: 'absolute', left: 0 }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, borderWidth: 1, gap: 3,
                  borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.5)',
                  backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'rgba(27,31,38,0.6)',
                }}>
                  <Text style={{ fontSize: 11 }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text>
                  <Text style={{ color: lang === 'en' ? COLORS.emerald : '#555E6C', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 }}>EN</Text>
                </View>
              </TouchableOpacity>

              <View style={{ width: 130, height: 130, borderRadius: 28, overflow: 'hidden' }}>
                <Image source={logoImage}
                  style={{ width: 130, height: 130, borderRadius: 28 }} resizeMode="cover" />
              </View>

              <TouchableOpacity onPress={function () { changeLang('fr'); }} activeOpacity={0.7}
                style={{ position: 'absolute', right: 0 }}>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6, borderWidth: 1, gap: 3,
                  borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.5)',
                  backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'rgba(27,31,38,0.6)',
                }}>
                  <Text style={{ fontSize: 11 }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text>
                  <Text style={{ color: lang === 'fr' ? COLORS.emerald : '#555E6C', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 }}>FR</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Tagline émotionnel */}
            <Text style={{
              color: '#8892A0', fontSize: 16, fontWeight: '500',
              letterSpacing: 0.5, textAlign: 'center', marginTop: 2,
            }}>
              {t.welcome}
            </Text>
            <Text style={{
              color: '#EAEEF3', fontSize: 17, fontWeight: '700',
              letterSpacing: 0.5, textAlign: 'center', marginBottom: 2,
            }}>
              {t.welcomeLine2}
            </Text>

            {/* === BANDEAU IDENTITÉ AFRICAINE === */}
            <View style={{
              alignItems: 'center', marginTop: 4, marginBottom: 6,
              position: 'relative', height: 30, justifyContent: 'center',
            }}>
              <LinearGradient
                colors={[
                  'rgba(0, 217, 132, 0)',
                  'rgba(0, 217, 132, 0.06)',
                  'rgba(0, 217, 132, 0.10)',
                  'rgba(0, 217, 132, 0.06)',
                  'rgba(0, 217, 132, 0)',
                ]}
                start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 4 }}
              />
              <View style={{
                position: 'absolute', top: 0, left: '15%', right: '15%',
                height: 0.5, backgroundColor: 'rgba(0, 217, 132, 0.15)',
              }} />
              <View style={{
                position: 'absolute', bottom: 0, left: '15%', right: '15%',
                height: 0.5, backgroundColor: 'rgba(0, 217, 132, 0.15)',
              }} />
              <Text style={{
                color: '#6B7B8D', fontSize: 9, fontWeight: '600',
                letterSpacing: 4, textAlign: 'center',
              }}>
                {t.tagline}
              </Text>
            </View>

            {/* ZONE CARTES */}
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              {!allSwiped ? (
                <View style={{ width: CARD_W + 8, height: CARD_H + 8 }}>
                  {slides.map(function (slide, index) {
                    if (index < currentIndex) return null;
                    if (index > currentIndex + 1) return null;
                    return (
                      <PokemonCard
                        key={slide.key}
                        slide={slide}
                        index={index}
                        isTopCard={index === currentIndex}
                        currentIndex={currentIndex}
                        onSwipe={handleSwipe}
                        lang={lang}
                      />
                    );
                  })}
                </View>
              ) : (
                <Animated.View entering={FadeInDown.duration(600).springify()}>
                  {/* CARTE FINALE — Cadre doré + Dashboard Preview */}
                  <View style={{
                    width: CARD_W + 8, height: CARD_H + 8, borderRadius: 24, padding: 4,
                    borderWidth: 2, borderTopColor: COLORS.gold, borderLeftColor: '#C5A028',
                    borderRightColor: '#8B7516', borderBottomColor: '#6B5A10',
                    backgroundColor: '#5A4C12',
                    shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2, shadowRadius: 16, elevation: 14, alignSelf: 'center',
                  }}>
                    <View style={{
                      flex: 1, borderRadius: 20, borderWidth: 1.5,
                      borderColor: 'rgba(212, 175, 55, 0.4)', overflow: 'hidden',
                    }}>
                      <View style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: 18 }}>
                        <CircuitPattern width={CARD_W} height={CARD_H} color="rgba(212, 175, 55, 0.05)" />
                        <View style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 120,
                          borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden',
                        }}>
                          <LinearGradient
                            colors={['rgba(212, 175, 55, 0.08)', 'rgba(212, 175, 55, 0.03)', 'rgba(212, 175, 55, 0)']}
                            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                            style={{ flex: 1 }}
                          />
                        </View>
                        <View style={{
                          position: 'absolute', top: 0, left: 16, right: 16,
                          height: 1, backgroundColor: COLORS.gold, opacity: 0.25,
                        }} />

                        {/* Points dorés aux coins */}
                        <View style={{ position: 'absolute', top: 8, left: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(212,175,55,0.4)' }} />
                        <View style={{ position: 'absolute', top: 8, right: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(212,175,55,0.4)' }} />
                        <View style={{ position: 'absolute', bottom: 8, left: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(212,175,55,0.3)' }} />
                        <View style={{ position: 'absolute', bottom: 8, right: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(212,175,55,0.3)' }} />

                        <View style={{
                          flex: 1, paddingVertical: 16, paddingHorizontal: 24,
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          {/* Titre */}
                          <Text style={{
                            color: '#EAEEF3', fontSize: 18, fontWeight: '700',
                            textAlign: 'center', marginBottom: 4,
                          }}>{t.readyTitle}</Text>

                          <Text style={{
                            color: '#8892A0', fontSize: 10, fontWeight: '500',
                            textAlign: 'center', letterSpacing: 1, marginBottom: 14,
                          }}>{t.readySubtitle}</Text>

                          {/* === MINI DASHBOARD PREVIEW === */}
                          <MiniDashboardPreview lang={lang} />

                          {/* Badge Conçu avec amour */}
                          <View style={{
                            flexDirection: 'row', alignItems: 'center', gap: 5,
                            backgroundColor: 'rgba(0,217,132,0.06)',
                            borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
                            borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)',
                            marginBottom: 14,
                          }}>
                            <Text style={{
                              color: '#8892A0', fontSize: 9, fontWeight: '600', letterSpacing: 1.5,
                            }}>{lang === 'fr' ? 'Con\u00e7u avec' : 'Made with'}</Text>
                            <Text style={{ fontSize: 11 }}>{'\u2764\uFE0F'}</Text>
                          </View>

                          {/* Bouton doré shimmer */}
                          <ShimmerButton onPress={handleJoin} text={t.joinBtn} />
                        </View>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* ZONE BASSE */}
            <View style={{ paddingTop: 6, paddingBottom: Platform.OS === 'android' ? 12 : 0 }}>
              {/* Dots */}
              <View style={{
                flexDirection: 'row', justifyContent: 'center',
                alignItems: 'center', gap: 8, marginBottom: 8,
              }}>
                {slides.map(function (_, i) {
                  return (
                    <View key={i} style={{
                      height: 8, borderRadius: 4,
                      backgroundColor: i === currentIndex ? COLORS.emerald : i < currentIndex ? '#00A866' : '#3E4855',
                      width: i === currentIndex ? 24 : 8,
                    }} />
                  );
                })}
              </View>

              {/* Se connecter — visible après swipes */}
              {allSwiped ? (
                <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}>
                  <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                      paddingVertical: 10, paddingHorizontal: 20,
                      borderRadius: 10, borderWidth: 1,
                      borderColor: 'rgba(62,72,85,0.4)',
                      backgroundColor: 'rgba(27,31,38,0.4)', gap: 6,
                    }}>
                    <Text style={{ color: '#8892A0', fontSize: 13, fontWeight: '500' }}>{t.hasAccount}</Text>
                    <Text style={{ color: COLORS.emerald, fontSize: 13, fontWeight: '700' }}>{t.signIn}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : null}
            </View>

          </View>
        </LinearGradient>
      </SafeAreaView>
    </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
