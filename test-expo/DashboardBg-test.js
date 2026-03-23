// LIXUM - Dashboard Background Test — Nebula Grid Premium
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que les autres fichiers test

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  View, Dimensions, Text, StyleSheet, StatusBar, Alert, Pressable, Image, TextInput,
  Animated as RNAnimated, ScrollView, TouchableOpacity, Platform, Modal, Easing,
  PixelRatio,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Rect, Path, G, Defs, Defs as SvgDefs, LinearGradient as SvgLinearGradient, Stop, Polygon, ClipPath, Ellipse, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import RepasPage from './RepasPage';
import ActivityPage from './ActivityPage';
import NeumorphPage from './NeumorphPage';
import { createClient } from '@supabase/supabase-js';

// Supabase client (même que RepasPage)
const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// TODO PRODUCTION: Remplacer par l'ID du user authentifié
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
// Note: expo-screen-capture doit être installé dans le projet
// npx expo install expo-screen-capture
// Dans Snack Expo, cet import peut ne pas fonctionner — laisser en commentaire si besoin
// import * as ScreenCapture from 'expo-screen-capture';

const { width: W, height: H } = Dimensions.get('window');

// ============================================
// SYSTÈME RESPONSIVE — Base design : 320dp (Z Fold 5 plié)
// ============================================
const BASE_WIDTH = 320;

// Fonction de scaling proportionnel
const wp = (size) => (W / BASE_WIDTH) * size;

// Fonction de scaling pour les fonts (avec limite PixelRatio)
const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// Fonction de scaling vertical (pour les heights)
const hp = (size) => (H / 700) * size;

// ============================================
// UTILITAIRE — pseudo-random deterministe
// ============================================
const seededRandom = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
// === HELPERS HYDRATATION ===
const getEffectiveML = (volumeML, coeff) => Math.round(volumeML * coeff);

const getCoeffColor = (coeff) => {
  if (coeff >= 0.90) return '#00D984';
  if (coeff >= 0.70) return '#4DA6FF';
  if (coeff >= 0.50) return '#FFD93D';
  return '#FF6B6B';
};

// Cubes de sucre → grammes ajoutés (1 cube standard = 4g)
const SUGAR_CUBE_G = 4;
const sugarCubesToGrams = (cubes) => cubes * SUGAR_CUBE_G;
const sugarGramsToKcal = (grams) => Math.round(grams * 4);

// ============================================
// COMPOSANT — Background métallique propre
// ============================================
const MetallicBackground = () => (
  <LinearGradient
    colors={[
      '#1E2530',
      '#222A35',
      '#1A2029',
      '#222A35',
      '#1E2530',
    ]}
    locations={[0, 0.25, 0.5, 0.75, 1]}
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
  />
);

// ============================================================
// COMPOSANT — LixGemIcon (émeraude taillée — viewBox 0 0 20 24)
// ============================================================
let _gemIdx = 0;
const LixGemIcon = ({ width = 20, height = 22 }) => {
  const id = useMemo(() => `gem${_gemIdx++}`, []);
  return (
    <Svg width={width} height={height} viewBox="0 0 20 24">
      <Defs>
        <SvgLinearGradient id={`${id}B`} x1="0" y1="0" x2="0.2" y2="1">
          <Stop offset="0%" stopColor="#5DFFB4" />
          <Stop offset="30%" stopColor="#00D984" />
          <Stop offset="65%" stopColor="#00A866" />
          <Stop offset="100%" stopColor="#005C38" />
        </SvgLinearGradient>
        <SvgLinearGradient id={`${id}C`} x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#8AFFDA" />
          <Stop offset="100%" stopColor="#00D984" />
        </SvgLinearGradient>
      </Defs>
      <Polygon points="10,1 2,8 5.5,22 14.5,22 18,8" fill={`url(#${id}B)`} />
      <Polygon points="10,1 2,8 18,8" fill={`url(#${id}C)`} />
      <Polygon points="6.5,8 13.5,8 12,5 8,5" fill="#5DFFB4" opacity={0.35} />
      <Polygon points="2,8 5.5,22 10,8" fill="#00BF78" opacity={0.25} />
      <Polygon points="18,8 14.5,22 10,8" fill="#007A4A" opacity={0.35} />
      <Line x1="2" y1="8" x2="18" y2="8" stroke="#8AFFDA" strokeWidth={0.5} opacity={0.5} />
      <Polygon points="8.5,3.5 10,1.5 11.5,3.5 10,5.5" fill="white" opacity={0.5} />
      <Circle cx="5.5" cy="6.5" r={0.6} fill="white" opacity={0.35} />
    </Svg>
  );
};

// ============================================================
// COMPOSANT — LixCoinIcon (jeton hexagonal émeraude — L gravé)
// ============================================================
let _coinIdx = 0;
const LixCoinIcon = ({ size = 18 }) => {
  const id = useMemo(() => `lxc${_coinIdx++}`, []);
  const s = size;
  const hs = s / 2;
  const hex = [
    `${hs},${0}`,
    `${s},${s * 0.25}`,
    `${s},${s * 0.75}`,
    `${hs},${s}`,
    `${0},${s * 0.75}`,
    `${0},${s * 0.25}`,
  ].join(' ');

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <SvgLinearGradient id={`${id}F`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#2A3A30" />
          <Stop offset="30%" stopColor="#1A2A22" />
          <Stop offset="70%" stopColor="#1E3028" />
          <Stop offset="100%" stopColor="#142018" />
        </SvgLinearGradient>
        <SvgLinearGradient id={`${id}E`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#5DFFB4" />
          <Stop offset="50%" stopColor="#00D984" />
          <Stop offset="100%" stopColor="#00854F" />
        </SvgLinearGradient>
        <SvgLinearGradient id={`${id}L`} x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#5DFFB4" />
          <Stop offset="100%" stopColor="#00D984" />
        </SvgLinearGradient>
      </Defs>
      <Polygon points={hex} fill="#00D984" opacity={0.1} transform="translate(0.5, 0.5)" />
      <Polygon points={hex} fill={`url(#${id}F)`} />
      <Polygon points={hex} fill="none" stroke={`url(#${id}E)`} strokeWidth={1.2} />
      <Path d={`M ${hs},0 L ${s},${s * 0.25} L ${hs},${s * 0.35} L 0,${s * 0.25} Z`} fill="#5DFFB4" opacity={0.08} />
      <Path
        d={`M ${s * 0.35},${s * 0.28} L ${s * 0.35},${s * 0.68} L ${s * 0.65},${s * 0.68}`}
        fill="none"
        stroke={`url(#${id}L)`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={s * 0.3} cy={s * 0.3} r={1} fill="white" opacity={0.35} />
    </Svg>
  );
};

// ============================================================
// ICÔNES SVG CUSTOM — remplacent les emojis
// ============================================================
const HeartIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="heartGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FF6B8A" />
        <Stop offset="100%" stopColor="#FF3B5C" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#heartGrad)" />
    <Ellipse cx="8" cy="7.5" rx="2.5" ry="1.8" fill="white" opacity={0.25} />
  </Svg>
);

const FlameIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="flameGrad" x1="0.5" y1="1" x2="0.5" y2="0">
        <Stop offset="0%" stopColor="#FF4500" />
        <Stop offset="50%" stopColor="#FF8C42" />
        <Stop offset="100%" stopColor="#FFD700" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M12 2C8.5 7 4 9.5 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2-1-3.5-2-5-.5 1.5-1.5 2.5-3 3-1-4-3-6.5-3-10z" fill="url(#flameGrad)" />
    <Path d="M12 22c-2.21 0-4-1.79-4-4 0-2 2-3.5 3-5.5.5 1 1.5 1.5 2.5 2 .5-1.5 1-3 .5-4.5 1 1.5 2 3.5 2 5.5 0 1.5-.5 2.5-1.5 3.5-.5.5-1.5 1-2.5 1z" fill="#FFD700" opacity={0.5} />
  </Svg>
);

const BoltIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="boltGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FFE066" />
        <Stop offset="100%" stopColor="#FFB800" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="url(#boltGrad)" />
    <Path d="M11 5l-4 7h3.5l-.5 4 4.5-6H11l.5-5z" fill="white" opacity={0.15} />
  </Svg>
);

const DropletIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="dropGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#7DD3FC" />
        <Stop offset="100%" stopColor="#0EA5E9" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M12 2C12 2 5 11 5 16c0 3.87 3.13 7 7 7s7-3.13 7-7c0-5-7-14-7-14z" fill="url(#dropGrad)" />
    <Ellipse cx="9.5" cy="15" rx="2" ry="2.5" fill="white" opacity={0.2} />
  </Svg>
);

const PlateIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="none" stroke="#00D984" strokeWidth={1.5} />
    <Circle cx="12" cy="12" r="6" fill="none" stroke="#00D984" strokeWidth={1} opacity={0.5} />
    <Line x1="2" y1="12" x2="5" y2="12" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" />
    <Line x1="19" y1="12" x2="22" y2="12" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const ForkKnifeIcon = () => (
  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24">
    {/* Petit bol fumant — icône titre Dernier Repas */}
    <Path d="M4 16h16c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4z" fill="#8892A0" opacity={0.6} />
    <Path d="M2 14h20v2H2z" fill="#8892A0" opacity={0.4} />
    <Path d="M9 8c0-1 .5-3 3-3s3 2 3 3" fill="none" stroke="#8892A0" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
  </Svg>
);

const LightbulbIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="bulbGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FFE066" />
        <Stop offset="100%" stopColor="#FFB800" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" fill="url(#bulbGrad)" />
    <Rect x="9" y="19" width="6" height="1.5" rx="0.75" fill="#FFB800" opacity={0.7} />
    <Rect x="9.5" y="21" width="5" height="1.5" rx="0.75" fill="#FFB800" opacity={0.5} />
    <Path d="M10 12.5C10 11 11 10 12 10s2 1 2 2.5" fill="none" stroke="white" strokeWidth={0.8} opacity={0.4} />
  </Svg>
);

const StatsIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="statsGrad" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0%" stopColor="#00A866" />
        <Stop offset="100%" stopColor="#00D984" />
      </SvgLinearGradient>
    </Defs>
    <Rect x="3" y="14" width="4" height="8" rx="1" fill="url(#statsGrad)" opacity={0.6} />
    <Rect x="10" y="8" width="4" height="14" rx="1" fill="url(#statsGrad)" opacity={0.8} />
    <Rect x="17" y="4" width="4" height="18" rx="1" fill="url(#statsGrad)" />
  </Svg>
);

const LockIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill="#8892A0" opacity={0.6} />
    <Path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill="#EAEEF3" />
  </Svg>
);

const StarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#D4AF37" />
  </Svg>
);

const GoalFlag = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="flagGold" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFE066" />
        <Stop offset="100%" stopColor="#D4AF37" />
      </SvgLinearGradient>
    </Defs>
    <Line x1="5" y1="2" x2="5" y2="22" stroke="#D4AF37" strokeWidth={2} strokeLinecap="round" />
    <Path d="M5 3C5 3 8 1.5 11 4C14 6.5 17 5 19 3V13C17 15 14 16 11 13.5C8 11 5 12.5 5 12.5V3Z" fill="url(#flagGold)" />
    <Circle cx="5" cy="22" r="1.2" fill="#D4AF37" />
  </Svg>
);

// ============================================================
// COMPOSANT — FloatingHeart (cœur qui suit une courbe de Bézier vers le tube)
// ============================================================
const FloatingHeart = ({ heart, tubeCenter }) => {
  const anim = useRef(new RNAnimated.Value(0)).current;
  const heartSize = 18 + Math.random() * 8;

  // Point de départ : position du doigt
  const startX = heart.x;
  const startY = heart.y;

  // Point d'arrivée : centre du tube
  const endX = tubeCenter?.x || W / 2;
  const endY = tubeCenter?.y || H * 0.45;

  // Point de contrôle pour la courbe de Bézier
  const controlX = startX + (endX - startX) * 0.5 + (Math.random() - 0.5) * 100;
  const controlY = Math.min(startY, endY) - 50 - Math.random() * 60;

  useEffect(() => {
    RNAnimated.timing(anim, {
      toValue: 1,
      duration: 700 + Math.random() * 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  // Interpolation quadratique de Bézier approchée
  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      startX,
      startX + (controlX - startX) * 0.44,
      controlX * 0.5 + (startX + endX) * 0.25,
      endX + (controlX - endX) * 0.19,
      endX,
    ],
  });

  const translateY = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      startY,
      startY + (controlY - startY) * 0.44,
      controlY * 0.5 + (startY + endY) * 0.25,
      endY + (controlY - endY) * 0.19,
      endY,
    ],
  });

  // Rétrécit en approchant du tube
  const scale = anim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [1.2, 1, 0.5, 0],
  });

  // Opacité : visible puis disparaît à l'impact
  const opacity = anim.interpolate({
    inputRange: [0, 0.2, 0.85, 1],
    outputRange: [0.9, 1, 0.8, 0],
  });

  return (
    <RNAnimated.Text style={{
      position: 'absolute',
      left: 0,
      top: 0,
      fontSize: heartSize,
      zIndex: 100,
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity,
    }}>
      {heart.emoji}
    </RNAnimated.Text>
  );
};

// ============================================================
// COMPOSANT — MoodIcon (icône SVG premium par tier)
// ============================================================
const MoodIcon = ({ tier, size = 42, active = false }) => {
  const configs = {
    0: { // Triste
      bgColors: ['#2A2E35', '#1E2228'],
      borderColor: '#8892A0',
      glowColor: 'rgba(136,146,160,0.3)',
      face: (s) => (
        <>
          <Path d={`M${s*0.32} ${s*0.42} Q${s*0.37} ${s*0.47} ${s*0.42} ${s*0.42}`}
                stroke="#8892A0" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
          <Path d={`M${s*0.58} ${s*0.42} Q${s*0.63} ${s*0.47} ${s*0.68} ${s*0.42}`}
                stroke="#8892A0" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
          <Path d={`M${s*0.35} ${s*0.65} Q${s*0.5} ${s*0.58} ${s*0.65} ${s*0.65}`}
                stroke="#8892A0" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
        </>
      ),
    },
    1: { // Chill
      bgColors: ['#1A2E25', '#152820'],
      borderColor: '#00D984',
      glowColor: 'rgba(0,217,132,0.25)',
      face: (s) => (
        <>
          <Path d={`M${s*0.30} ${s*0.42} L${s*0.42} ${s*0.42}`}
                stroke="#00D984" strokeWidth={2} strokeLinecap="round"/>
          <Path d={`M${s*0.58} ${s*0.42} L${s*0.70} ${s*0.42}`}
                stroke="#00D984" strokeWidth={2} strokeLinecap="round"/>
          <Path d={`M${s*0.35} ${s*0.62} Q${s*0.5} ${s*0.68} ${s*0.65} ${s*0.62}`}
                stroke="#00D984" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
        </>
      ),
    },
    2: { // Heureux
      bgColors: ['#1A2535', '#152030'],
      borderColor: '#4DA6FF',
      glowColor: 'rgba(77,166,255,0.25)',
      face: (s) => (
        <>
          <Circle cx={s*0.37} cy={s*0.40} r={s*0.045} fill="#4DA6FF"/>
          <Circle cx={s*0.63} cy={s*0.40} r={s*0.045} fill="#4DA6FF"/>
          <Path d={`M${s*0.30} ${s*0.58} Q${s*0.5} ${s*0.75} ${s*0.70} ${s*0.58}`}
                stroke="#4DA6FF" strokeWidth={2} fill="none" strokeLinecap="round"/>
        </>
      ),
    },
    3: { // Excité
      bgColors: ['#2E2818', '#282215'],
      borderColor: '#D4AF37',
      glowColor: 'rgba(212,175,55,0.35)',
      face: (s) => (
        <>
          {/* Yeux arcs joyeux fermés */}
          <Path d={`M${s*0.28} ${s*0.40} Q${s*0.36} ${s*0.32} ${s*0.44} ${s*0.40}`}
                stroke="#D4AF37" strokeWidth={2.2} fill="none" strokeLinecap="round"/>
          <Path d={`M${s*0.56} ${s*0.40} Q${s*0.64} ${s*0.32} ${s*0.72} ${s*0.40}`}
                stroke="#D4AF37" strokeWidth={2.2} fill="none" strokeLinecap="round"/>
          {/* Points lumineux au-dessus des yeux */}
          <Circle cx={s*0.36} cy={s*0.33} r={s*0.025} fill="#FFE066"/>
          <Circle cx={s*0.64} cy={s*0.33} r={s*0.025} fill="#FFE066"/>
          {/* Grand sourire ouvert */}
          <Path d={`M${s*0.28} ${s*0.56} Q${s*0.50} ${s*0.78} ${s*0.72} ${s*0.56}`}
                stroke="#D4AF37" strokeWidth={2.2} fill="none" strokeLinecap="round"/>
          {/* Remplissage sourire subtil */}
          <Path d={`M${s*0.32} ${s*0.58} Q${s*0.50} ${s*0.74} ${s*0.68} ${s*0.58}`}
                fill="#D4AF37" opacity={0.2}/>
          {/* Rayons d'énergie autour */}
          <Line x1={s*0.50} y1={s*0.02} x2={s*0.50} y2={s*0.10}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.45} strokeLinecap="round"/>
          <Line x1={s*0.82} y1={s*0.12} x2={s*0.76} y2={s*0.18}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.35} strokeLinecap="round"/>
          <Line x1={s*0.18} y1={s*0.12} x2={s*0.24} y2={s*0.18}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.35} strokeLinecap="round"/>
          <Line x1={s*0.92} y1={s*0.38} x2={s*0.85} y2={s*0.40}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.3} strokeLinecap="round"/>
          <Line x1={s*0.08} y1={s*0.38} x2={s*0.15} y2={s*0.40}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.3} strokeLinecap="round"/>
        </>
      ),
    },
  };

  const config = configs[tier];
  const s = size;

  return (
    <View style={{
      width: s, height: s,
      borderRadius: s / 2,
      shadowColor: config.borderColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: active ? 0.9 : 0.3,
      shadowRadius: active ? 14 : 6,
      elevation: active ? 10 : 4,
      transform: [{ scale: active ? 1.15 : 1 }],
    }}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <SvgDefs>
          <SvgLinearGradient id={`moodBg${tier}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={config.bgColors[0]} />
            <Stop offset="1" stopColor={config.bgColors[1]} />
          </SvgLinearGradient>
        </SvgDefs>
        <Circle cx={s/2} cy={s/2} r={s/2 - 1} fill="none"
                stroke={config.glowColor} strokeWidth={3}/>
        <Circle cx={s/2} cy={s/2} r={s/2 - 3} fill={`url(#moodBg${tier})`}/>
        <Circle cx={s/2} cy={s/2} r={s/2 - 3} fill="none"
                stroke={config.borderColor} strokeWidth={1.5} opacity={active ? 1 : 0.8}/>
        {config.face(s)}
      </Svg>
    </View>
  );
};

// ============================================================
// COMPOSANT — Header Global (Mood + LIXUM + Lix)
// ============================================================
const Header = ({ moodFilled, currentMood, lixCount, notifCount = 0, onMoodPress, onLixPress, highlightMood }) => {
  // Animation shake pour le mood non rempli
  const shakeAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (moodFilled) return;
    const shake = () => {
      RNAnimated.sequence([
        RNAnimated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    };
    shake();
    const interval = setInterval(shake, 3000);
    return () => clearInterval(interval);
  }, [moodFilled]);

  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  // Animation pulse pour le mood highlight (tooltip étape 1)
  const moodPulse = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (highlightMood) {
      const pulse = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(moodPulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          RNAnimated.timing(moodPulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [highlightMood]);

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 10,
      overflow: 'visible',
    }}>

      {/* GAUCHE — Logo PNG */}
      <View style={{ flex: 0 }}>
        <Image
          source={require('./assets/lixum-logo.png')}
          style={{
            width: 220,
            height: 68,
            resizeMode: 'contain',
            marginLeft: -45,
            marginTop: -10,
            marginBottom: -10,
          }}
        />
      </View>

      {/* DROITE — Mood + Lix Coin */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 0, flexShrink: 0 }}>

        {/* Mood emoji avec ring */}
        <TouchableOpacity onPress={onMoodPress} activeOpacity={0.7} style={{ position: 'relative', marginRight: 8 }}>
          <RNAnimated.View style={{
            transform: [
              { rotate: highlightMood ? '0deg' : rotate },
              { scale: highlightMood
                ? moodPulse.interpolate({ inputRange: [0, 1], outputRange: [1.3, 1.5] })
                : 1
              },
            ],
            opacity: highlightMood
              ? moodPulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] })
              : 1,
          }}>
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              borderWidth: highlightMood ? 3 : 2,
              borderColor: highlightMood ? '#FF8C42' : moodFilled ? '#00D984' : '#FF8C42',
              backgroundColor: highlightMood ? 'rgba(255,140,66,0.25)' : 'rgba(21,27,35,0.7)',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: highlightMood ? '#FF8C42' : moodFilled ? '#00D984' : '#FF8C42',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: highlightMood ? 1 : 0.3,
              shadowRadius: highlightMood ? 20 : 6,
              elevation: highlightMood ? 15 : 4,
            }}>
              <MoodIcon tier={currentMood === 'excited' ? 3 : currentMood === 'happy' ? 2 : currentMood === 'chill' ? 1 : 0} size={24} active={true} />
            </View>
          </RNAnimated.View>
          {!moodFilled && (
            <View style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: '#FF8C42',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#1E2530',
            }}>
              <Text style={{ color: 'white', fontSize: 8, fontWeight: '800' }}>!</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Lix Coin + compteur */}
        <TouchableOpacity onPress={onLixPress} activeOpacity={0.7} style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(21, 27, 35, 0.8)',
          borderWidth: 1,
          borderColor: 'rgba(62, 72, 85, 0.5)',
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 6,
        }}>
          <View style={{ position: 'relative', marginRight: 5 }}>
            <LixCoinIcon size={16} />
            {notifCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -4,
                right: -6,
                backgroundColor: '#FF3B30',
                borderRadius: 6,
                width: 13,
                height: 13,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: '#1E2530',
              }}>
                <Text style={{ color: 'white', fontSize: 7, fontWeight: '800' }}>{notifCount}</Text>
              </View>
            )}
          </View>
          <Text style={{ color: '#EAEEF3', fontSize: 15, fontWeight: '700' }}>{lixCount.toLocaleString('fr-FR')}</Text>
          <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '500', marginLeft: 3 }}>Lix</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================
// COMPOSANT — Barre de progression
// ============================================================
const ProgressBar = ({ percent, color = '#00D984' }) => (
  <View style={s.progressBg}>
    <LinearGradient
      colors={[color, color + 'AA']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={[s.progressFill, { width: Math.min(percent, 100) + '%' }]}
    />
    <Text style={s.progressText}>{percent}%</Text>
  </View>
);

// ============================================================
// COMPOSANT — Carte Glassmorphism réutilisable
// ============================================================
const GlassCard = ({ children, style }) => (
  <View style={[s.glassCard, style]}>
    <View style={s.cardShine} />
    {children}
  </View>
);

// ============================================
// COMPOSANT METALCARD — Plaque métal brossé
// ============================================
const MetalCard = ({ children, style, onPress, noPadding = false }) => {

  if (!onPress) {
    // Pas cliquable — rendu simple sans Pressable
    return (
      <View style={[metalStyles.outerBorder, style]}>
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={metalStyles.innerGradient}
        >
          <View style={[metalStyles.cardContent, noPadding && { padding: 0 }]}>
            <View style={{
              position: 'absolute', top: 0, left: 25, right: 25,
              height: 1, backgroundColor: 'rgba(0, 217, 132, 0.10)', borderRadius: 0.5,
            }} />
            {children}
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Cliquable — effet bouton enfoncé
  return (
    <Pressable
      onPress={onPress}
      delayPressIn={120}
      unstable_pressDelay={120}
      style={({ pressed }) => [
        metalStyles.outerBorder,
        style,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: pressed ? 2 : 8 },
          shadowOpacity: pressed ? 0.6 : 0.5,
          shadowRadius: pressed ? 4 : 16,
          elevation: pressed ? 4 : 12,
          transform: [{ scale: pressed ? 0.975 : 1 }],
          backgroundColor: pressed ? '#3E434A' : '#4A4F55',
        },
      ]}
    >
      <LinearGradient
        colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={metalStyles.innerGradient}
      >
        <View style={[metalStyles.cardContent, noPadding && { padding: 0 }]}>
          <View style={{
            position: 'absolute', top: 0, left: 25, right: 25,
            height: 1, backgroundColor: 'rgba(0, 217, 132, 0.10)', borderRadius: 0.5,
          }} />
          {/* Indicateur cliquable › */}
          <View style={{
            position: 'absolute',
            top: wp(10), right: wp(10),
            width: wp(18), height: wp(18),
            borderRadius: wp(9),
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600', marginTop: -1 }}>›</Text>
          </View>
          {children}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const metalStyles = StyleSheet.create({
  outerBorder: {
    borderRadius: wp(18),
    padding: wp(1.2),
    backgroundColor: '#4A4F55',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    marginHorizontal: wp(14),
    marginBottom: wp(10),
  },
  innerGradient: {
    borderRadius: wp(17),
    overflow: 'hidden',
  },
  cardContent: {
    padding: wp(16),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: wp(17),
  },
});

// MiniMetalCard supprimé — plus utilisé

// ============================================================
// UTILITAIRE — Bézier smooth path
// ============================================================
function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpy1 = prev.y;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
    const cpy2 = curr.y;
    d += ` C ${cpx1.toFixed(1)},${cpy1.toFixed(1)} ${cpx2.toFixed(1)},${cpy2.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
  }
  return d;
}

// ============================================================
// DONNÉES — Mock calories/activités
// ============================================================
const DAILY_OBJECTIVE = 2330;

const ACTIVITIES_KCAL_PER_HOUR = {
  'marche_rapide': 420,
  'course': 860,
  'velo': 640,
  'natation': 770,
  'musculation': 450,
  'yoga': 250,
  'corde_a_sauter': 900,
  'football': 680,
  'basketball': 720,
  'danse': 500,
};

const WATER_LOSS_PER_HOUR_ML = 700;

function calculateWaterLoss(durationMin, intensity) {
  const hours = durationMin / 60;
  const mult = { leger: 0.6, modere: 1.0, intense: 1.4 };
  return Math.round(hours * WATER_LOSS_PER_HOUR_ML * (mult[intensity] || 1.0));
}

function suggestActivities(surplusKcal) {
  return Object.entries(ACTIVITIES_KCAL_PER_HOUR)
    .map(([activity, kcalPerHour]) => ({
      activity,
      minutesNeeded: Math.ceil((surplusKcal / kcalPerHour) * 60),
      kcalBurned: surplusKcal,
    }))
    .filter(a => a.minutesNeeded <= 120)
    .sort((a, b) => a.minutesNeeded - b.minutesNeeded)
    .slice(0, 4);
}

const ACTIVITY_ICONS = {
  marche_rapide: '🚶', course: '🏃', velo: '🚴', natation: '🏊',
  musculation: '🏋️', yoga: '🧘', corde_a_sauter: '⏭', football: '⚽',
  basketball: '🏀', danse: '💃',
};
const ACTIVITY_LABELS = {
  marche_rapide: 'Marche rapide', course: 'Course', velo: 'Vélo', natation: 'Natation',
  musculation: 'Musculation', yoga: 'Yoga', corde_a_sauter: 'Corde à sauter',
  football: 'Football', basketball: 'Basketball', danse: 'Danse',
};

const MOCK_DAILY_DATA = {
  consumed: [
    0, 0, 80, 150, 320, 480, 650, 820, 980, 1100,
    1200, 1300, 1380, 1440, 1500, 1540, 1560, 1575, 1580, 1585
  ],
  burned: [
    0, 0, 0, 0, 50, 120, 200, 350, 500, 580,
    650, 700, 750, 790, 820, 840, 855, 862, 868, 870
  ],
};

const MOCK_GENERAL_DATA = [
  { week: 1, avgConsumed: 2100, avgBurned: 350 },
  { week: 2, avgConsumed: 2250, avgBurned: 420 },
  { week: 3, avgConsumed: 2180, avgBurned: 380 },
  { week: 4, avgConsumed: 2300, avgBurned: 450 },
  { week: 5, avgConsumed: 2150, avgBurned: 500 },
  { week: 6, avgConsumed: 2280, avgBurned: 480 },
  { week: 7, avgConsumed: 2200, avgBurned: 520 },
  { week: 8, avgConsumed: 2350, avgBurned: 550 },
  { week: 9, avgConsumed: 2280, avgBurned: 500 },
  { week: 10, avgConsumed: 2310, avgBurned: 480 },
  { week: 11, avgConsumed: 2330, avgBurned: 520 },
  { week: 12, avgConsumed: 2320, avgBurned: 550 },
];

// ============================================================
// HOOKS — Animations pour Reactor Cores
// ============================================================
const useRotation = (duration, reverse = false) => {
  const rotation = useRef(new RNAnimated.Value(0)).current;
  useEffect(() => {
    const anim = RNAnimated.loop(
      RNAnimated.timing(rotation, {
        toValue: 1, duration, easing: Easing.linear, useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return rotation.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
  });
};


// ============================================================
// COMPOSANT — ReactorCore (réacteur circulaire animé)
// ============================================================
const ReactorCore = ({ size, value, percentage, label, color, colorLight, colorDark, clockwise = true }) => {
  const outerRotation = useRotation(10000, !clockwise);
  const innerRotation = useRotation(7000, clockwise);

  const coreSize = size * 0.50;
  const innerRingSize = size * 0.72;
  const displayValue = Math.round(value).toString();

  const svgPad = 8;
  const outerSvgSize = size + svgPad * 2;
  const svgPadInner = 6;
  const innerSvgSize = innerRingSize + svgPadInner * 2;

  // Glow expansif — rayon proportionnel au percentage
  const coreRadius = coreSize / 2;
  const maxGlowRadius = size / 2 - 2;
  const cappedPercentage = Math.min(percentage, 140);
  const glowRadius = coreRadius + (maxGlowRadius - coreRadius) * (cappedPercentage / 100);

  return (
    <View style={{
      width: size + 20,
      height: size + 20,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    }}>
      {/* Zone du réacteur — carrée, centrée */}
      <View style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        {/* Glow expansif — cercle lumineux proportionnel au % */}
        <View style={{
          position: 'absolute',
          width: glowRadius * 2,
          height: glowRadius * 2,
          borderRadius: glowRadius,
          backgroundColor: color,
          opacity: 0.10 + (percentage / 100) * 0.10,
        }} />
        {/* Inner glow — plus lumineux au centre */}
        <View style={{
          position: 'absolute',
          width: glowRadius * 0.8,
          height: glowRadius * 0.8,
          borderRadius: glowRadius * 0.4,
          backgroundColor: color,
          opacity: 0.08 + (percentage / 100) * 0.08,
        }} />

        {/* Anneau extérieur — rotation lente */}
        <RNAnimated.View style={{
          position: 'absolute',
          width: size + 20,
          height: size + 20,
          left: -10,
          top: -10,
          transform: [{ rotate: outerRotation }],
        }}>
          <Svg width={size + 20} height={size + 20} viewBox={`0 0 ${size + 20} ${size + 20}`}>
            <Circle cx={(size + 20) / 2} cy={(size + 20) / 2} r={size / 2 - 2}
              fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.2}
              strokeDasharray={`${size * 0.1} ${size * 0.05}`}
            />
            {/* Satellite objectif — VERT, réduit */}
            <Circle cx={(size + 20) / 2} cy={10} r={3} fill="#00D984" />
            <Circle cx={(size + 20) / 2} cy={10} r={5} fill="#00D984" opacity={0.2} />
            {/* Satellite secondaire — couleur du réacteur, petit et discret */}
            <Circle cx={(size + 20) / 2} cy={size + 10} r={1.5} fill={color} opacity={0.3} />
          </Svg>
        </RNAnimated.View>

        {/* Anneau intérieur — rotation inverse */}
        <RNAnimated.View style={{
          position: 'absolute',
          width: innerRingSize + 12,
          height: innerRingSize + 12,
          left: (size - innerRingSize - 12) / 2,
          top: (size - innerRingSize - 12) / 2,
          transform: [{ rotate: innerRotation }],
        }}>
          <Svg width={innerRingSize + 12} height={innerRingSize + 12} viewBox={`0 0 ${innerRingSize + 12} ${innerRingSize + 12}`}>
            <Circle cx={(innerRingSize + 12) / 2} cy={(innerRingSize + 12) / 2} r={innerRingSize / 2 - 2}
              fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.15}
              strokeDasharray={`${innerRingSize * 0.08} ${innerRingSize * 0.04}`}
            />
            <Circle cx={(innerRingSize + 12) / 2} cy={6} r={2.5} fill={colorLight} opacity={0.7} />
          </Svg>
        </RNAnimated.View>

        {/* Core central — stable, semi-transparent */}
        <View style={{
          width: coreSize, height: coreSize, borderRadius: coreSize / 2,
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'transparent',
          borderWidth: 0,
          shadowColor: color, shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
        }}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.6}
            style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: coreSize * 0.30, fontWeight: '900', color: '#EAEEF3',
              textAlign: 'center',
              textShadowColor: color, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6,
            }}
          >
            {displayValue}
          </Text>
        </View>

      </View>

    </View>
  );
};

// ============================================
// COMPOSANT — DNA HELIX (ADN central — Score Vitalité)
// ============================================
const DnaHelix = ({ height = 68, width = 60 }) => {
  const svgH = height;
  const svgW = width;
  const cx = svgW / 2;
  const amp = svgW * 0.32;
  const segments = 40;
  const bridgeCount = 7;

  // Générer les points des 2 brins
  const strand1Points = [];
  const strand2Points = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * svgH;
    const angle = t * Math.PI * 4;
    const x1 = cx + Math.sin(angle) * amp;
    const x2 = cx + Math.sin(angle + Math.PI) * amp;
    strand1Points.push({ x: x1, y });
    strand2Points.push({ x: x2, y });
  }

  // Ponts (barreaux) — espacés régulièrement
  const bridges = [];
  for (let i = 1; i <= bridgeCount; i++) {
    const idx = Math.floor((i / (bridgeCount + 1)) * segments);
    bridges.push({
      x1: strand1Points[idx].x,
      y1: strand1Points[idx].y,
      x2: strand2Points[idx].x,
      y2: strand2Points[idx].y,
      depth: Math.cos((idx / segments) * Math.PI * 4),
    });
  }

  return (
    <View style={{ alignItems: 'center', width: svgW }}>
      {/* SVG ADN avec badge Score Vitalité au centre */}
      <View style={{ width: svgW, height: svgH }}>
        <Svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          <Defs>
            <SvgLinearGradient id="dnaGlow" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0%" stopColor="#00D984" stopOpacity={0.06} />
              <Stop offset="50%" stopColor="#00D984" stopOpacity={0.03} />
              <Stop offset="100%" stopColor="#00D984" stopOpacity={0.06} />
            </SvgLinearGradient>
            <SvgLinearGradient id="strand1Grad" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0%" stopColor="#5DFFB4" stopOpacity={0.95} />
              <Stop offset="25%" stopColor="#00D984" stopOpacity={0.8} />
              <Stop offset="50%" stopColor="#00BFA6" stopOpacity={0.7} />
              <Stop offset="75%" stopColor="#00D984" stopOpacity={0.8} />
              <Stop offset="100%" stopColor="#5DFFB4" stopOpacity={0.95} />
            </SvgLinearGradient>
            <SvgLinearGradient id="strand2Grad" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0%" stopColor="#00E5A0" stopOpacity={0.8} />
              <Stop offset="25%" stopColor="#00BFA6" stopOpacity={0.6} />
              <Stop offset="50%" stopColor="#00D984" stopOpacity={0.5} />
              <Stop offset="75%" stopColor="#00BFA6" stopOpacity={0.6} />
              <Stop offset="100%" stopColor="#00E5A0" stopOpacity={0.8} />
            </SvgLinearGradient>
            <SvgLinearGradient id="bridgeGrad" x1="0" y1="0.5" x2="1" y2="0.5">
              <Stop offset="0%" stopColor="#00D984" stopOpacity={0.5} />
              <Stop offset="50%" stopColor="#5DFFB4" stopOpacity={0.7} />
              <Stop offset="100%" stopColor="#00D984" stopOpacity={0.5} />
            </SvgLinearGradient>
            <SvgLinearGradient id="bridgeGradGold" x1="0" y1="0.5" x2="1" y2="0.5">
              <Stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
              <Stop offset="50%" stopColor="#E8D48B" stopOpacity={0.5} />
              <Stop offset="100%" stopColor="#7DD3FC" stopOpacity={0.4} />
            </SvgLinearGradient>
          </Defs>

          {/* Glow vertical central */}
          <Rect x={cx - 6} y={5} width={12} height={svgH - 10} rx={6}
            fill="url(#dnaGlow)" />

          {/* Brins avec profondeur — segments individuels */}
          {Array.from({ length: segments - 1 }, (_, i) => {
            const t = i / segments;
            const angle = t * Math.PI * 4;
            const depth = Math.cos(angle);
            const isFront = depth >= 0;
            const p1 = strand1Points[i];
            const p2 = strand1Points[i + 1];
            return (
              <Line key={`s1-${i}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="url(#strand1Grad)"
                strokeWidth={isFront ? 2.5 : 1.5}
                strokeOpacity={isFront ? 0.9 : 0.25}
                strokeLinecap="round"
              />
            );
          })}
          {Array.from({ length: segments - 1 }, (_, i) => {
            const t = i / segments;
            const angle = t * Math.PI * 4;
            const depth = Math.cos(angle);
            const isFront = depth < 0;
            const p1 = strand2Points[i];
            const p2 = strand2Points[i + 1];
            return (
              <Line key={`s2-${i}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="url(#strand2Grad)"
                strokeWidth={isFront ? 2.5 : 1.5}
                strokeOpacity={isFront ? 0.9 : 0.25}
                strokeLinecap="round"
              />
            );
          })}

          {/* Ponts (barreaux) avec dots colorés réalistes */}
          {bridges.map((b, i) => {
            const isAT = i % 2 === 0;
            const leftColor = isAT ? '#00D984' : '#D4AF37';
            const rightColor = isAT ? '#00BFA6' : '#7DD3FC';
            const leftOpacity = isAT ? 0.9 : 0.55;
            const rightOpacity = isAT ? 0.9 : 0.55;
            return (
              <React.Fragment key={`br-${i}`}>
                <Line x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
                  stroke={isAT ? 'url(#bridgeGrad)' : 'url(#bridgeGradGold)'}
                  strokeWidth={Math.abs(b.depth) > 0.3 ? 2.5 : 1.5}
                  strokeLinecap="round"
                  opacity={0.5 + Math.abs(b.depth) * 0.3}
                />
                {/* Node central */}
                <Circle cx={(b.x1 + b.x2) / 2} cy={b.y1} r={1.5}
                  fill={isAT ? '#5DFFB4' : '#E8D48B'} opacity={0.5} />
                {/* Nodes extrémités — colorés selon la paire */}
                <Circle cx={b.x1} cy={b.y1} r={2.5} fill={leftColor} opacity={leftOpacity} />
                <Circle cx={b.x1} cy={b.y1} r={5} fill={leftColor} opacity={0.12} />
                <Circle cx={b.x2} cy={b.y2} r={2.5} fill={rightColor} opacity={rightOpacity} />
                <Circle cx={b.x2} cy={b.y2} r={5} fill={rightColor} opacity={0.12} />
              </React.Fragment>
            );
          })}

          {/* Particules colorées le long des brins */}
          {[0.15, 0.35, 0.55, 0.75, 0.92].map((t, i) => {
            const idx = Math.floor(t * segments);
            const p = strand1Points[idx];
            const pColor = i % 2 === 0 ? '#5DFFB4' : '#E8D48B';
            return <Circle key={`p1-${i}`} cx={p.x} cy={p.y} r={1.2} fill={pColor} opacity={0.45} />;
          })}
          {[0.1, 0.3, 0.5, 0.7, 0.88].map((t, i) => {
            const idx = Math.floor(t * segments);
            const p = strand2Points[idx];
            const pColor = i % 2 === 0 ? '#00BFA6' : '#7DD3FC';
            return <Circle key={`p2-${i}`} cx={p.x} cy={p.y} r={1.2} fill={pColor} opacity={0.45} />;
          })}
        </Svg>

      </View>

    </View>
  );
};

// ============================================================
// SIZING — 2 Réacteurs + ADN central
// ============================================================
const CARD_MARGIN = wp(14);
const CARD_PAD = wp(16);
const DNA_WIDTH = wp(60);
const GAP = wp(4);
const TOTAL_SIDES = (CARD_MARGIN + CARD_PAD + wp(1.2)) * 2;
const REACTOR_SIZE = Math.min(
  Math.floor((W - TOTAL_SIDES - DNA_WIDTH - GAP * 2) / 2),
  wp(95)
);

// ============================================================
// COMPOSANT — Alerte Dépassement d'objectif
// ============================================================
const SurplusAlertModal = ({ visible, onClose, surplus, onAddActivity }) => {
  const suggestions = useMemo(() => suggestActivities(surplus), [surplus]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: '#151B23', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,107,74,0.3)' }}>
          <Text style={{ color: '#FF6B4A', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 16 }}>
            ⚠️ DÉPASSEMENT D'OBJECTIF
          </Text>

          <View style={{ backgroundColor: 'rgba(255,107,74,0.08)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <Text style={{ color: '#C0C8D4', fontSize: 13 }}>Bilan net du jour : <Text style={{ color: '#FF6B4A', fontWeight: '700' }}>{(DAILY_OBJECTIVE + surplus).toLocaleString('fr-FR')} kcal</Text></Text>
            <Text style={{ color: '#C0C8D4', fontSize: 13, marginTop: 4 }}>Objectif : <Text style={{ fontWeight: '700' }}>{DAILY_OBJECTIVE.toLocaleString('fr-FR')} kcal</Text></Text>
            <Text style={{ color: '#FF6B4A', fontSize: 15, fontWeight: '800', marginTop: 6 }}>Surplus : +{surplus} kcal</Text>
          </View>

          <Text style={{ color: '#8892A0', fontSize: 12, fontWeight: '600', marginBottom: 10 }}>
            💡 Pour compenser, essayez :
          </Text>

          {suggestions.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < suggestions.length - 1 ? 1 : 0, borderBottomColor: 'rgba(80,95,115,0.1)' }}>
              <Text style={{ fontSize: 16, width: 28 }}>{ACTIVITY_ICONS[s.activity] || '🏃'}</Text>
              <Text style={{ flex: 1, color: '#C0C8D4', fontSize: 13 }}>{ACTIVITY_LABELS[s.activity]}</Text>
              <Text style={{ color: '#8892A0', fontSize: 12 }}>{s.minutesNeeded} min</Text>
              <Text style={{ color: '#00D984', fontSize: 12, fontWeight: '700', width: 60, textAlign: 'right' }}>-{s.kcalBurned}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={{ backgroundColor: '#00D984', borderRadius: 12, paddingVertical: 14, marginTop: 18, alignItems: 'center' }}
            activeOpacity={0.7}
            onPress={() => { onAddActivity && onAddActivity(); onClose(); }}
          >
            <Text style={{ color: '#0C1219', fontSize: 14, fontWeight: '800', letterSpacing: 1 }}>AJOUTER UNE ACTIVITÉ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(80,95,115,0.3)', paddingVertical: 12, marginTop: 10, alignItems: 'center' }}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={{ color: '#8892A0', fontSize: 13, fontWeight: '600' }}>OK, J'AI COMPRIS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// COMPOSANT — Silhouette SVG avec remplissage eau
// ============================================================
const MALE_PATH = 'M50,8 C50,8 42,8 42,16 C42,24 50,24 50,24 C50,24 58,24 58,16 C58,8 50,8 50,8 Z M50,26 L38,32 L32,60 L38,62 L42,42 L46,80 L42,120 L46,122 L50,90 L54,122 L58,120 L54,80 L58,42 L62,62 L68,60 L62,32 Z';
const FEMALE_PATH = 'M50,8 C50,8 42,8 42,16 C42,24 50,26 50,26 C50,26 58,24 58,16 C58,8 50,8 50,8 Z M50,28 L40,34 L34,55 L40,58 L38,42 L44,70 L38,75 L42,78 L46,80 L42,120 L46,122 L50,90 L54,122 L58,120 L54,80 L58,78 L62,75 L56,70 L62,42 L60,58 L66,55 L60,34 Z';

const BUBBLE_CONFIG = [
  { cx: 35, size: 3, duration: 2000, delay: 0 },
  { cx: 50, size: 2, duration: 2500, delay: 800 },
  { cx: 42, size: 4, duration: 3000, delay: 400 },
  { cx: 55, size: 2.5, duration: 2200, delay: 1200 },
  { cx: 38, size: 1.5, duration: 1800, delay: 600 },
  { cx: 58, size: 2, duration: 2600, delay: 1000 },
  { cx: 46, size: 3.5, duration: 2800, delay: 200 },
];

const SilhouetteFill = ({ fillPercent, height = 60, gender = 'homme', showBubbles = false }) => {
  const fillAnim = useRef(new RNAnimated.Value(fillPercent)).current;
  const svgPath = gender === 'femme' ? FEMALE_PATH : MALE_PATH;
  const vbH = 130;
  const ratio = height / vbH;
  const svgW = Math.round(100 * ratio);
  const clipId = `silClip_${height}_${gender}`;
  const gradId = `waterGrad_${height}_${gender}`;

  // Bubble animations
  const bubbleAnims = useRef(BUBBLE_CONFIG.map(() => new RNAnimated.Value(0))).current;
  const [bubblePositions, setBubblePositions] = useState(BUBBLE_CONFIG.map(() => 0));

  useEffect(() => {
    RNAnimated.timing(fillAnim, {
      toValue: fillPercent, duration: 400, useNativeDriver: false,
    }).start();
  }, [fillPercent]);

  useEffect(() => {
    if (!showBubbles || fillPercent < 10) return;
    const timers = [];
    bubbleAnims.forEach((anim, i) => {
      const cfg = BUBBLE_CONFIG[i];
      const startTimer = setTimeout(() => {
        const loop = () => {
          anim.setValue(0);
          RNAnimated.timing(anim, {
            toValue: 1, duration: cfg.duration, useNativeDriver: false,
          }).start(() => loop());
        };
        loop();
        // Track position for rendering
        anim.addListener(({ value }) => {
          setBubblePositions(prev => {
            const next = [...prev];
            next[i] = value;
            return next;
          });
        });
      }, cfg.delay);
      timers.push(startTimer);
    });
    return () => { timers.forEach(t => clearTimeout(t)); bubbleAnims.forEach(a => a.removeAllListeners()); };
  }, [showBubbles, fillPercent > 10]);

  const waterTop = vbH * (1 - fillPercent / 100);
  const waterHeight = vbH * (fillPercent / 100);

  return (
    <View style={{ width: svgW, height }}>
      {/* Static empty silhouette */}
      <Svg width={svgW} height={height} viewBox="0 0 100 130" style={{ position: 'absolute' }}>
        <Path d={svgPath} fill="#2A3040" opacity={0.5} />
      </Svg>
      {/* Filled silhouette with clipPath + bubbles */}
      <Svg width={svgW} height={height} viewBox="0 0 100 130" style={{ position: 'absolute' }}>
        <Defs>
          <ClipPath id={clipId}>
            <Path d={svgPath} />
          </ClipPath>
          <SvgLinearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#006994" stopOpacity="0.9" />
            <Stop offset="0.5" stopColor="#00BCD4" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#4DA6FF" stopOpacity="0.7" />
          </SvgLinearGradient>
        </Defs>
        <G clipPath={`url(#${clipId})`}>
          <Rect x="0" y={waterTop} width="100" height={waterHeight} fill={`url(#${gradId})`} />
          {/* Animated bubbles inside water */}
          {showBubbles && fillPercent >= 10 && BUBBLE_CONFIG.map((cfg, i) => {
            const progress = bubblePositions[i] || 0;
            const bubbleY = waterTop + waterHeight - (progress * waterHeight);
            const oscillation = Math.sin(progress * Math.PI * 4) * 3;
            const opacity = progress < 0.8 ? 0.3 : 0.3 * (1 - (progress - 0.8) / 0.2);
            return (
              <Circle
                key={`bubble-${i}`}
                cx={cfg.cx + oscillation}
                cy={bubbleY}
                r={cfg.size}
                fill="#FFFFFF"
                opacity={Math.max(0, opacity)}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

// ============================================================
// COMPOSANT — Carte Hydratation compacte (dashboard)
// ============================================================
const HydrationCardCompact = ({ currentMl, goalMl, gender, onPress, sportAlert, tooltipStep }) => {
  const percent = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  const glasses = Math.round(currentMl / 250);
  const totalGlasses = Math.round(goalMl / 250);
  const liters = (currentMl / 1000).toFixed(1);
  const goalL = (goalMl / 1000).toFixed(1);

  return (
      <MetalCard style={{
        marginHorizontal: 0,
        marginBottom: wp(12),
        ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }),
      }} onPress={onPress}>

        {/* ========== LIGNE 1 : Titre à gauche — Données à droite ========== */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
          marginRight: 25,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>💧</Text>
            <Text style={{
              color: '#EAEEF3',
              fontSize: 14,
              fontWeight: '700',
              letterSpacing: 1,
            }}>HYDRATATION</Text>
          </View>

          <Text style={{
            color: '#00BFA6',
            fontSize: 14,
            fontWeight: '700',
          }}>{liters} / {goalL}L</Text>
        </View>

        {/* ========== LIGNE 2 : Silhouette + Barre + Infos ========== */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>

          {/* Silhouette à gauche */}
          <View style={{ width: 45, alignItems: 'center', marginRight: 12 }}>
            <SilhouetteFill fillPercent={percent} height={wp(56)} gender={gender} />
          </View>

          {/* Colonne droite : barre + verres + sport */}
          <View style={{ flex: 1 }}>

            {/* Barre de progression */}
            <View style={{
              height: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 8,
            }}>
              <LinearGradient
                colors={['#4DA6FF', '#00BCD4']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  width: percent + '%',
                  height: '100%',
                  borderRadius: 4,
                }}
              />
            </View>

            {/* Verres + pourcentage */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#8892A0', fontSize: 12 }}>{glasses}/{totalGlasses} verres 🥛</Text>
              <Text style={{ color: '#FF8C42', fontSize: 12, fontWeight: '700' }}>{percent}%</Text>
            </View>

            {/* Sport water loss / hint */}
            {sportAlert ? (
              <Text style={{ color: '#FF8C42', fontSize: 11 }}>{sportAlert}</Text>
            ) : (
              <Text style={{ color: '#555E6C', fontSize: 11 }}>Tap pour ajouter →</Text>
            )}

            {/* Low hydration warning */}
            {percent < 30 && percent > 0 && (
              <Text style={{ color: '#FF3B30', fontSize: 10, fontWeight: '700', marginTop: 2 }}>
                ⚠️ Pensez à vous réhydrater ! 💧
              </Text>
            )}
          </View>
        </View>
      </MetalCard>
  );
};

// ============================================================
// COMPOSANT — Page Hydratation Fullscreen (Modal)
// ============================================================
const HydrationClock = ({ logs, totalMl, goalMl }) => {
  const [selectedArc, setSelectedArc] = useState(null);
  const clockSize = W - 80;
  const center = clockSize / 2;
  const outerR = center - 10;
  const innerR = outerR - 30;
  const hoursRange = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const totalHours = hoursRange.length;

  const hourToAngle = (h, m = 0) => {
    const idx = h - 6 + m / 60;
    return (idx / totalHours) * 360 - 90;
  };

  const polarToXY = (angleDeg, radius) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  const describeArc = (startAngle, endAngle, r1, r2) => {
    const s1 = polarToXY(startAngle, r1);
    const e1 = polarToXY(endAngle, r1);
    const s2 = polarToXY(endAngle, r2);
    const e2 = polarToXY(startAngle, r2);
    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${r1} ${r1} 0 ${largeArc} 1 ${e1.x} ${e1.y}`,
      `L ${s2.x} ${s2.y}`,
      `A ${r2} ${r2} 0 ${largeArc} 0 ${e2.x} ${e2.y}`,
      'Z',
    ].join(' ');
  };

  const groupedByHour = {};
  logs.forEach((log) => {
    const parts = log.time.split(':');
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1] || 0);
    const key = h;
    if (!groupedByHour[key]) groupedByHour[key] = [];
    groupedByHour[key].push({ ...log, hour: h, minute: m });
  });

  const arcs = [];
  Object.entries(groupedByHour).forEach(([hourStr, entries]) => {
    const h = parseInt(hourStr);
    if (h < 6 || h > 23) return;
    const totalAmount = entries.reduce((s, e) => s + (e.amount || 0), 0);
    const startAngle = hourToAngle(h, 0) + 1;
    const endAngle = hourToAngle(h, 55) - 1;
    const maxBarR = outerR;
    const minBarR = innerR + 4;
    const ratio = Math.min(totalAmount / 500, 1);
    const barR = minBarR + (maxBarR - minBarR) * ratio;
    const isWater = entries.every((e) => !e.type || e.type === 'eau');
    arcs.push({
      key: h,
      path: describeArc(startAngle, endAngle, barR, minBarR),
      color: isWater ? '#4DA6FF' : '#00D984',
      opacity: 0.7 + ratio * 0.3,
      totalAmount,
      entries,
      midAngle: (startAngle + endAngle) / 2,
      midR: (barR + minBarR) / 2,
    });
  });

  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <Pressable onPress={() => setSelectedArc(null)}>
        <Svg width={clockSize} height={clockSize} viewBox={`0 0 ${clockSize} ${clockSize}`}>
          <Circle cx={center} cy={center} r={outerR} fill="none" stroke="rgba(74,79,85,0.2)" strokeWidth={1} />
          <Circle cx={center} cy={center} r={innerR} fill="none" stroke="rgba(74,79,85,0.12)" strokeWidth={0.5} />
          <Circle cx={center} cy={center} r={innerR - 2} fill="rgba(13,17,23,0.3)" />

          {hoursRange.map((h) => {
            const angle = hourToAngle(h, 30);
            const tickStart = polarToXY(angle, outerR - 2);
            const tickEnd = polarToXY(angle, outerR - 8);
            const labelPos = polarToXY(angle, outerR + 14);
            const isMajor = h % 3 === 0;
            return (
              <G key={h}>
                <Line
                  x1={tickStart.x} y1={tickStart.y}
                  x2={tickEnd.x} y2={tickEnd.y}
                  stroke={isMajor ? '#8892A0' : 'rgba(74,79,85,0.4)'}
                  strokeWidth={isMajor ? 1.5 : 0.8}
                />
                {isMajor && (
                  <SvgText
                    x={labelPos.x} y={labelPos.y}
                    fill="#8892A0"
                    fontSize={10}
                    fontWeight="700"
                    textAnchor="middle"
                    alignmentBaseline="central"
                  >{h}h</SvgText>
                )}
              </G>
            );
          })}

          {arcs.map((arc) => (
            <Path
              key={arc.key}
              d={arc.path}
              fill={selectedArc === arc.key ? arc.color : arc.color + 'AA'}
              opacity={arc.opacity}
              onPress={() => setSelectedArc(selectedArc === arc.key ? null : arc.key)}
            />
          ))}

          <SvgText
            x={center} y={center - 10}
            fill="#EAEEF3"
            fontSize={22}
            fontWeight="900"
            textAnchor="middle"
          >{totalMl.toLocaleString('fr-FR')}</SvgText>
          <SvgText
            x={center} y={center + 10}
            fill="#555E6C"
            fontSize={11}
            fontWeight="600"
            textAnchor="middle"
          >/ {goalMl.toLocaleString('fr-FR')} ml</SvgText>
        </Svg>
      </Pressable>

      {selectedArc !== null && groupedByHour[selectedArc] && (
        <View style={{
          marginTop: -10,
          backgroundColor: 'rgba(30,37,48,0.95)',
          borderRadius: 14, padding: 12,
          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
          width: W - 80,
        }}>
          <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 }}>
            {selectedArc}h00
          </Text>
          {groupedByHour[selectedArc].map((entry, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 16, width: 24 }}>{entry.icon || '💧'}</Text>
              <Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '600', flex: 1 }}>
                {entry.type || 'eau'}
              </Text>
              <Text style={{ color: '#4DA6FF', fontSize: 13, fontWeight: '800' }}>
                +{entry.amount} ml
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const HydrationModal = ({ visible, onClose, currentMl, setCurrentMl, goalMl, gender, hydroLogs, setHydroLogs, onAddBeverage, showResetConfirm, setShowResetConfirm }) => {
  const percent = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  const glasses = Math.round(currentMl / 250);
  const totalGlasses = Math.round(goalMl / 250);

  const getTimeStr = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const addWater = (ml) => {
    setCurrentMl(prev => prev + ml);
    setHydroLogs(prev => [...prev, { time: getTimeStr(), amount: ml, type: 'eau', icon: '💧' }]);
  };

  const removeWater = (ml) => {
    setCurrentMl(prev => Math.max(0, prev - ml));
    setHydroLogs(prev => {
      const idx = [...prev].reverse().findIndex(l => l.amount === ml && l.type === 'eau');
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return [...prev.slice(0, realIdx), ...prev.slice(realIdx + 1)];
    });
  };

  const palierLabels = gender === 'homme'
    ? ['0.6L', '1.25L', '1.9L', '2.5L']
    : ['0.5L', '1L', '1.5L', '2L'];

  const quantities = [
    { ml: 50, icon: '🥛', label: '50ml' },
    { ml: 250, icon: '🥤', label: '250ml' },
    { ml: 1000, icon: '🫗', label: '1L' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Header */}
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="#EAEEF3" />
            </TouchableOpacity>
            <Text style={s.modalTitle}>HYDRATATION</Text>
            <Text style={{ fontSize: 20 }}>💧</Text>
          </View>

          <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* ═══ GRANDE SILHOUETTE — STAR DE LA PAGE ═══ */}
            <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SilhouetteFill fillPercent={percent} height={180} gender={gender} showBubbles />
                <View style={{ marginLeft: 16, height: 180, justifyContent: 'space-between', paddingVertical: 8 }}>
                  {palierLabels.slice().reverse().map((label, i) => {
                    const palierPct = (4 - i) * 25;
                    const reached = percent >= palierPct;
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 12, height: 1, backgroundColor: reached ? '#4DA6FF' : '#2A3040' }} />
                        <Text style={{ color: reached ? '#4DA6FF' : '#555E6C', fontSize: 11, marginLeft: 6, fontWeight: reached ? '700' : '400' }}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ═══ COMPTEUR + BARRE ═══ */}
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 26, fontWeight: '800' }}>
                <Text style={{ color: '#4DA6FF' }}>{currentMl.toLocaleString('fr-FR')}</Text>
                <Text style={{ color: '#555E6C' }}> / {goalMl.toLocaleString('fr-FR')} ml</Text>
              </Text>
              <View style={{ width: W - 64, height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
                <LinearGradient
                  colors={['#4DA6FF', '#00BCD4']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ width: percent + '%', height: '100%', borderRadius: 4 }}
                />
              </View>
              <Text style={{ color: '#4DA6FF', fontSize: 13, fontWeight: '700', marginTop: 6 }}>{percent}% • {glasses}/{totalGlasses} verres</Text>
            </View>

            {/* ═══ SECTION EAU ═══ */}
            <View style={{
              marginHorizontal: 20, marginTop: 4,
              backgroundColor: 'rgba(30,37,48,0.4)',
              borderRadius: 16, padding: 14,
              borderWidth: 1, borderColor: 'rgba(77,166,255,0.08)',
            }}>
              <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 10 }}>EAU 💧</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {quantities.map((item) => (
                  <View key={item.ml} style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                      style={{
                        width: 60, height: 60, borderRadius: 14,
                        backgroundColor: 'rgba(21,27,35,0.8)',
                        borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)',
                        justifyContent: 'center', alignItems: 'center',
                      }}
                      activeOpacity={0.7}
                      onPress={() => addWater(item.ml)}
                    >
                      <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                      <Text style={{ color: '#C0C8D4', fontSize: 10, fontWeight: '600', marginTop: 2 }}>{item.label}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        marginTop: 4, width: 24, height: 24, borderRadius: 12,
                        backgroundColor: 'rgba(30,35,45,0.8)',
                        borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)',
                        justifyContent: 'center', alignItems: 'center',
                      }}
                      activeOpacity={0.7}
                      onPress={() => removeWater(item.ml)}
                    >
                      <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '700', lineHeight: 16 }}>−</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* ═══ BOUTON AJOUTER BOISSONS ═══ */}
            <TouchableOpacity
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                marginHorizontal: 20, marginTop: 10,
                backgroundColor: 'rgba(0, 217, 132, 0.08)', borderRadius: 14,
                borderWidth: 1, borderColor: 'rgba(0, 217, 132, 0.25)',
                paddingVertical: 12,
              }}
              activeOpacity={0.7}
              onPress={onAddBeverage}
            >
              <Text style={{ color: '#00D984', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                AJOUTER BOISSONS 🥤
              </Text>
            </TouchableOpacity>

            {/* ═══ CADRAN MONTRE HYDRATATION ═══ */}
            <View style={{ marginHorizontal: 20, marginTop: 12 }}>
              <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 4, textAlign: 'center' }}>AUJOURD'HUI</Text>
            </View>
            <HydrationClock logs={hydroLogs} totalMl={currentMl} goalMl={goalMl} />

            {/* ═══ DÉBLOQUER HISTORIQUE — lien vers MES STATS ═══ */}
            <TouchableOpacity
              onPress={() => Alert.alert(
                'Historique Complet',
                'Accédez à votre historique sur 7 jours pour 100 Lix.',
                [
                  { text: 'Plus tard', style: 'cancel' },
                  { text: 'Débloquer 100 Lix', onPress: () => console.log('unlock history') },
                ]
              )}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 14, paddingVertical: 12,
                marginTop: 12, marginHorizontal: 20,
              }}
            >
              <Text style={{ fontSize: 14, marginRight: 8 }}>🔒</Text>
              <Text style={{ color: '#8892A0', fontSize: 12, fontWeight: '600' }}>Voir 7 jours et +</Text>
              <View style={{
                flexDirection: 'row', alignItems: 'center', marginLeft: 10,
                backgroundColor: 'rgba(0, 217, 132, 0.08)',
                borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
              }}>
                <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '700' }}>100 Lix</Text>
              </View>
            </TouchableOpacity>

            {/* ═══ RÉINITIALISER ═══ */}
            <TouchableOpacity
              onPress={() => setShowResetConfirm(true)}
              style={{ alignSelf: 'center', marginTop: 20, marginBottom: 30 }}
            >
              <Text style={{ color: '#8892A0', fontSize: 11, opacity: 0.5 }}>Réinitialiser les données du jour</Text>
            </TouchableOpacity>

            {/* Modal confirmation reset */}
            <Modal visible={showResetConfirm} animationType="fade" transparent>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                <View style={{
                  backgroundColor: '#1E2530', borderRadius: 20, padding: 24, width: '100%',
                  borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)',
                }}>
                  <Text style={{ color: '#EAEEF3', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 12 }}>
                    Réinitialiser ?
                  </Text>
                  <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
                    Votre hydratation du jour sera remise à zéro. Cette action est irréversible.
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setShowResetConfirm(false)}
                      style={{
                        flex: 1, paddingVertical: 12, borderRadius: 12,
                        borderWidth: 1, borderColor: 'rgba(136,146,160,0.2)', alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#8892A0', fontSize: 14, fontWeight: '600' }}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { setCurrentMl(0); setHydroLogs([]); setShowResetConfirm(false); }}
                      style={{
                        flex: 1, paddingVertical: 12, borderRadius: 12,
                        backgroundColor: 'rgba(255,59,48,0.12)',
                        borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '800' }}>Réinitialiser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

// SectionDivider supprimé — espacement uniforme 12px entre cartes

// ScrollableMetricCards supprimé — mini-cartes retirées pour épuration

// ============================================================
// COMPOSANT — Dashboard Content (page Accueil)
// ============================================================
const DashboardContent = ({ onHydrationPress, hydrationMl, hydrationGoal, gender, burnedExtra, sportAlert, consumedTotal, burnedTotal, scrollRef, dailyTarget, lastMeal, tooltipStep, vitalityScore }) => {
  const OBJECTIVE = dailyTarget || DAILY_OBJECTIVE;
  const streakDays = 12;
  const streakColor = streakDays >= 14 ? '#D4AF37'
    : streakDays >= 7 ? '#00D984'
    : streakDays >= 3 ? '#00BFA6' : '#8892A0';

  // Reste = Objectif - (Consommé - Brûlé total) → 2330 - (1585 - 870) = 1615
  const remaining = Math.max(0, OBJECTIVE - (consumedTotal - burnedTotal));

  // ===== PULSE ANIMATION pour le tooltip =====
  const tooltipPulse = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (tooltipStep > 0) {
      const pulse = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(tooltipPulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
          RNAnimated.timing(tooltipPulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      tooltipPulse.setValue(0);
    }
  }, [tooltipStep]);

  const pulseOpacity = tooltipPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  const pulseScale = tooltipPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(15), paddingTop: wp(8) }}
      showsVerticalScrollIndicator={false}
    >
      {/* ====== SALUT PERSONNALISÉ ====== */}
      <View style={{ marginBottom: wp(6), opacity: tooltipStep > 0 ? 0.05 : 1 }}>
        <Text style={{
          fontSize: fp(14),
          fontWeight: '600',
          color: '#EAEEF3',
        }}>
          {new Date().getHours() < 12 ? 'Bonjour' :
           new Date().getHours() < 18 ? 'Bon après-midi' :
           'Bonsoir'} 👋
        </Text>
        <Text style={{
          fontSize: fp(10),
          color: '#6B7280',
          marginTop: wp(2),
        }}>
          {consumedTotal === 0
            ? 'Commencez par scanner votre premier repas'
            : `${consumedTotal} kcal consommées aujourd'hui`
          }
        </Text>
      </View>

      {/* ====== CARTE PRINCIPALE — Bilan Énergétique Area Fill ====== */}
      <MetalCard style={{
        marginHorizontal: 0,
        marginBottom: wp(12),
        ...([2, 3, 4].includes(tooltipStep) && {
          borderColor: tooltipStep === 2 ? '#FF8C42' : tooltipStep === 3 ? '#00D984' : '#4DA6FF',
          borderWidth: 2,
          zIndex: 10001,
        }),
      }}>
        {/* HEADER — une seule ligne, tout aligné */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: wp(10),
        }}>
          <Text style={{
            fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
            fontSize: fp(9),
            fontWeight: '800',
            letterSpacing: wp(2),
            color: '#8892A0',
          }}>BILAN ÉNERGÉTIQUE</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: fp(13),
              fontWeight: '800',
              color: '#00D984',
              textShadowColor: 'rgba(0, 217, 132, 0.3)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
            }}>{OBJECTIVE.toLocaleString('fr-FR')} kcal</Text>
            <View style={{
              width: wp(5), height: wp(5), borderRadius: wp(2.5),
              backgroundColor: '#00D984', marginLeft: wp(4),
            }} />
          </View>
        </View>

        {/* ===== LES 2 RÉACTEURS + ADN ===== */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'visible',
          paddingVertical: 4,
        }}>
          {/* RÉACTEUR GAUCHE — Consommé (sens horaire) */}
          <RNAnimated.View style={{
            opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 2
              ? (tooltipStep === 2 ? pulseOpacity : 1)
              : 0.05,
            transform: tooltipStep === 2 ? [{ scale: pulseScale }] : [],
          }}>
            <ReactorCore
              size={REACTOR_SIZE}
              value={consumedTotal}
              percentage={Math.round((consumedTotal / OBJECTIVE) * 100)}
              label="Consommé"
              color="#FF8C42"
              colorLight="#FFB87A"
              colorDark="#CC6020"
              clockwise={true}
            />
          </RNAnimated.View>

          {/* ADN CENTRAL — Score Vitalité (125% de REACTOR_SIZE) */}
          <RNAnimated.View style={{
            opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 3
              ? (tooltipStep === 3 ? pulseOpacity : 1)
              : 0.05,
            transform: tooltipStep === 3 ? [{ scale: pulseScale }] : [],
          }}>
            <DnaHelix height={REACTOR_SIZE * 1.25} width={DNA_WIDTH} />
          </RNAnimated.View>

          {/* RÉACTEUR DROIT — Reste (sens antihoraire) */}
          <RNAnimated.View style={{
            opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 4
              ? (tooltipStep === 4 ? pulseOpacity : 1)
              : 0.05,
            transform: tooltipStep === 4 ? [{ scale: pulseScale }] : [],
          }}>
            <ReactorCore
              size={REACTOR_SIZE}
              value={remaining}
              percentage={Math.round((remaining / OBJECTIVE) * 100)}
              label="Reste"
              color="#4DA6FF"
              colorLight="#8DCAFF"
              colorDark="#2B7ACC"
              clockwise={false}
            />
          </RNAnimated.View>
        </View>

        {/* ===== LABELS — version épurée ===== */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingHorizontal: wp(4),
          marginTop: wp(10),
        }}>
          {/* Consommé */}
          <RNAnimated.View style={{
            alignItems: 'center', flex: 1,
            opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 2
              ? (tooltipStep === 2 ? pulseOpacity : 1)
              : 0.05,
          }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: fp(15),
              fontWeight: '800',
              color: '#FF8C42',
              textShadowColor: 'rgba(255, 140, 66, 0.2)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
            }}>{Math.round((consumedTotal / OBJECTIVE) * 100)}%</Text>
            <Text style={{
              fontSize: fp(9), fontWeight: '600', color: '#8892A0', marginTop: 2,
            }}>Consommé</Text>
            <Text style={{
              fontSize: fp(8),
              fontWeight: '700',
              color: '#FF3B30',
              marginTop: 3,
            }}>
              {burnedExtra > 0 ? `- ${burnedExtra} Kcal/Sport` : ''}
            </Text>
          </RNAnimated.View>

          {/* Vitalité */}
          <RNAnimated.View style={{
            alignItems: 'center', flex: 1,
            opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 3
              ? (tooltipStep === 3 ? pulseOpacity : 1)
              : 0.05,
          }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: fp(15),
              fontWeight: '900',
              color: vitalityScore >= 70 ? '#00D984' : vitalityScore >= 40 ? '#FFD93D' : '#FF6B6B',
              textShadowColor: vitalityScore >= 70 ? 'rgba(0, 217, 132, 0.4)' : vitalityScore >= 40 ? 'rgba(255, 217, 61, 0.4)' : 'rgba(255, 107, 107, 0.4)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 6,
            }}>{vitalityScore}</Text>
            <Text style={{
              fontSize: fp(8), fontWeight: '700', color: '#D4AF37', marginTop: 2,
              letterSpacing: 1.5,
            }}>VITALITÉ</Text>
          </RNAnimated.View>

          {/* Reste */}
          <RNAnimated.View style={{
            alignItems: 'center', flex: 1,
            opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 4
              ? (tooltipStep === 4 ? pulseOpacity : 1)
              : 0.05,
          }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: fp(15),
              fontWeight: '800',
              color: '#4DA6FF',
              textShadowColor: 'rgba(77, 166, 255, 0.2)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
            }}>{Math.min(Math.round((remaining / OBJECTIVE) * 100), 100)}%</Text>
            <Text style={{
              fontSize: fp(9), fontWeight: '600', color: '#8892A0', marginTop: 2,
            }}>Reste</Text>
            {remaining > OBJECTIVE && (
              <Text style={{
                fontSize: fp(8),
                fontWeight: '700',
                color: '#00D984',
                marginTop: 3,
              }}>
                + {remaining - OBJECTIVE} bonus sport
              </Text>
            )}
          </RNAnimated.View>
        </View>
      </MetalCard>

      {/* ====== CARTE HYDRATATION COMPACTE ====== */}
      <HydrationCardCompact
        currentMl={hydrationMl}
        goalMl={hydrationGoal}
        gender={gender}
        onPress={onHydrationPress}
        sportAlert={sportAlert}
        tooltipStep={tooltipStep}
      />

      {/* ======================================================= */}
      {/* BELOW THE FOLD — Zone scrollable                        */}
      {/* ======================================================= */}

      {/* DERNIER REPAS */}
      <MetalCard style={{
        marginHorizontal: 0,
        marginBottom: wp(12),
        ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }),
      }} onPress={() => Alert.alert('Dernier Repas', 'Détails nutritionnels complets — bientôt disponible')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
          <ForkKnifeIcon />
          <Text style={{
            color: '#EAEEF3',
            fontSize: fp(14),
            fontWeight: '700',
            letterSpacing: wp(1),
            marginLeft: wp(8),
          }}>DERNIER REPAS</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Image repas — vraie image si disponible, sinon placeholder */}
          {lastMeal && lastMeal.image_url ? (
            <Image
              source={{ uri: lastMeal.image_url }}
              style={{
                width: wp(52),
                height: wp(52),
                borderRadius: wp(12),
                marginRight: wp(12),
              }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              width: wp(52),
              height: wp(52),
              borderRadius: wp(12),
              backgroundColor: 'rgba(30, 37, 48, 0.8)',
              borderWidth: 1,
              borderColor: 'rgba(62, 72, 85, 0.3)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: wp(12),
            }}>
              <Svg width={wp(28)} height={wp(28)} viewBox="0 0 32 32">
                <Defs>
                  <SvgLinearGradient id="plateGrd" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#8892A0" />
                    <Stop offset="100%" stopColor="#6B7B8D" />
                  </SvgLinearGradient>
                </Defs>
                <Ellipse cx="16" cy="22" rx="13" ry="5" fill="url(#plateGrd)" opacity={0.3} />
                <Ellipse cx="16" cy="20" rx="12" ry="4.5" fill="none" stroke="#8892A0" strokeWidth={1.2} opacity={0.5} />
                <Path d="M11 14 Q11 11 13 12 Q15 13 13 10" fill="none" stroke="#8892A0" strokeWidth={1} strokeLinecap="round" opacity={0.4} />
                <Path d="M16 13 Q16 10 18 11 Q20 12 18 9" fill="none" stroke="#8892A0" strokeWidth={1} strokeLinecap="round" opacity={0.35} />
              </Svg>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '600' }}>
              {lastMeal ? lastMeal.food_name : 'Aucun repas'}
            </Text>
            <Text style={{ color: '#8892A0', fontSize: fp(11), marginTop: 2 }}>
              {lastMeal
                ? `${Math.round(lastMeal.calories)} kcal • `
                : 'Scannez votre premier repas '}
              <Text style={{ color: '#EAEEF3' }}>
                {lastMeal
                  ? new Date(lastMeal.meal_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </Text>
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 4, gap: wp(10) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: wp(7), height: wp(7), borderRadius: wp(3.5), backgroundColor: '#FF6B8A', marginRight: wp(4) }} />
                <Text style={{ color: '#8892A0', fontSize: fp(10) }}>{lastMeal ? Math.round(lastMeal.protein_g || 0) : 0}g P</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: wp(7), height: wp(7), borderRadius: wp(3.5), backgroundColor: '#FFB800', marginRight: wp(4) }} />
                <Text style={{ color: '#8892A0', fontSize: fp(10) }}>{lastMeal ? Math.round(lastMeal.carbs_g || 0) : 0}g G</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: wp(7), height: wp(7), borderRadius: wp(3.5), backgroundColor: '#4DA6FF', marginRight: wp(4) }} />
                <Text style={{ color: '#8892A0', fontSize: fp(10) }}>{lastMeal ? Math.round(lastMeal.fat_g || 0) : 0}g L</Text>
              </View>
            </View>
          </View>
        </View>
      </MetalCard>

      {/* COACH ALIXEN */}
      <MetalCard style={{
        marginHorizontal: 0,
        marginBottom: wp(12),
        ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }),
      }} onPress={() => Alert.alert('Coach ALIXEN', 'Recommandations personnalisées IA — bientôt disponible')}>
        {/* Header Coach */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
          {/* Icône Coach ALIXEN — Avatar PNG */}
          <Image
            source={require('./assets/lixman-avatar.png')}
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              borderWidth: 1,
              borderColor: 'rgba(0, 217, 132, 0.25)',
            }}
          />
          <Text style={{
            color: '#EAEEF3',
            fontSize: fp(13),
            fontWeight: '700',
            letterSpacing: wp(1),
            marginLeft: wp(8),
          }}>COACH ALIXEN</Text>
          {/* Badge "IA" */}
          <View style={{
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            borderRadius: wp(6),
            paddingHorizontal: wp(6),
            paddingVertical: wp(2),
            marginLeft: wp(8),
          }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: fp(7),
              fontWeight: '800',
              color: '#D4AF37',
              letterSpacing: 1,
            }}>IA</Text>
          </View>
        </View>

        {/* Message du coach — une seule ligne punchy */}
        <Text style={{
          color: '#EAEEF3',
          fontSize: fp(12),
          lineHeight: fp(17),
          fontWeight: '500',
        }}>
          {consumedTotal === 0
            ? <>Bienvenue ! Scannez votre <Text style={{ color: '#00D984', fontWeight: '700' }}>premier repas</Text> pour activer le suivi.</>
            : consumedTotal < OBJECTIVE
              ? <>Déficit de <Text style={{ color: '#FF8C42', fontWeight: '700' }}>{OBJECTIVE - consumedTotal + burnedTotal} kcal</Text> — bonne stratégie pour la <Text style={{ color: '#00D984', fontWeight: '700' }}>perte de poids</Text> !</>
              : <>Surplus de <Text style={{ color: '#FF3B30', fontWeight: '700' }}>{consumedTotal - OBJECTIVE} kcal</Text> — pensez à une <Text style={{ color: '#4DA6FF', fontWeight: '700' }}>activité physique</Text> !</>
          }
        </Text>

        {/* Suggestions */}
        <View style={{
          backgroundColor: 'rgba(0, 217, 132, 0.03)',
          borderRadius: wp(10),
          padding: wp(10),
          marginTop: wp(8),
          borderWidth: 1,
          borderColor: 'rgba(0, 217, 132, 0.06)',
        }}>
          <Text style={{ color: '#8892A0', fontSize: fp(8), fontWeight: '700', letterSpacing: wp(1), marginBottom: wp(4) }}>SUGGESTIONS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ color: '#00D984', fontSize: fp(10), marginRight: wp(6) }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: fp(11) }}>
              {consumedTotal === 0 ? 'Scannez un repas pour activer les suggestions' : '25g de protéines au prochain repas'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ color: '#00D984', fontSize: fp(10), marginRight: wp(6) }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: fp(11) }}>
              {`${Math.max(0, Math.ceil((hydrationGoal - hydrationMl) / 250))} verre${Math.ceil((hydrationGoal - hydrationMl) / 250) > 1 ? 's' : ''} d'eau (hydratation à ${Math.round((hydrationMl / hydrationGoal) * 100)}%)`}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#00D984', fontSize: fp(10), marginRight: wp(6) }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: fp(11) }}>
              {burnedExtra > 0 ? `Bonne séance ! ${burnedExtra} kcal brûlées` : '15 min de marche pour brûler 85 kcal'}
            </Text>
          </View>
        </View>

        {/* Lien Voir Recettes */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Recettes adaptées',
              'Retrouvez vos recettes personnalisées dans l\'onglet Repas → Recettes !',
              [{ text: 'Aller aux Recettes', onPress: () => {} }]
            );
          }}
          activeOpacity={0.7}
        >
          <Text style={{
            color: '#00D984',
            fontSize: fp(11),
            fontWeight: '600',
            marginTop: wp(8),
          }}>
            Voir Recettes  ›
          </Text>
        </TouchableOpacity>
      </MetalCard>

      {/* SUGGESTION ACTIVITÉ (dynamique basée sur surplus) */}
      {consumedTotal - burnedExtra > OBJECTIVE && (
        <>
          <MetalCard style={{
            marginHorizontal: 0,
            marginBottom: 12,
            ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }),
          }}>
            <Text style={s.sectionTitle}>🏃 SUGGESTION ACTIVITÉ</Text>
            <Text style={s.surplusText}>Surplus : +{consumedTotal - burnedExtra - OBJECTIVE} kcal</Text>
            <View style={{ gap: 8, marginTop: 10 }}>
              {suggestActivities(consumedTotal - burnedExtra - OBJECTIVE).slice(0, 2).map((sug, i) => (
                <View key={i} style={s.activityRow}>
                  <Text style={{ fontSize: 16 }}>{ACTIVITY_ICONS[sug.activity] || '🏃'}</Text>
                  <Text style={s.activityText}>{sug.minutesNeeded} min {ACTIVITY_LABELS[sug.activity]}</Text>
                  <Text style={s.activityKcal}>-{sug.kcalBurned} kcal</Text>
                </View>
              ))}
            </View>
          </MetalCard>
        </>
      )}

      {/* STATS AVANCÉES — FLOUTÉES */}
      <MetalCard style={{
        marginHorizontal: 0,
        marginBottom: wp(12),
        ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }),
      }} onPress={() => Alert.alert(
        'Débloquer Mes Stats',
        'Accédez à vos statistiques sur 7 jours pour 200 Lix.',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Débloquer 200 Lix', onPress: () => console.log('Navigate to shop') },
        ]
      )}>
        {/* Ligne 1 : Titre */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: wp(8),
          paddingRight: wp(16),
        }}>
          <StatsIcon />
          <Text style={{
            color: '#EAEEF3',
            fontSize: fp(14),
            fontWeight: '700',
            letterSpacing: wp(1),
            marginLeft: wp(8),
          }}>MES STATS</Text>
          <Text style={{
            color: '#6B7280',
            fontSize: fp(10),
            marginLeft: wp(4),
          }}>(7 jours)</Text>
        </View>

        {/* Ligne 2 : Lock + Prix — centré */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: wp(8),
          paddingRight: wp(16),
        }}>
          <LockIcon size={wp(14)} />
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.08)',
            borderRadius: wp(8),
            paddingHorizontal: wp(8),
            paddingVertical: wp(3),
          }}>
            <LixCoinIcon size={wp(12)} />
            <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '700', marginLeft: wp(3) }}>200 Lix</Text>
          </View>
          <Text style={{ color: '#6B7280', fontSize: fp(10) }}>pour débloquer</Text>
        </View>
      </MetalCard>

    </ScrollView>
  );
};

// ============================================================
// COMPOSANT — Pages placeholder (Repas, Activité, Calendrier, Profil)
// ============================================================
const PlaceholderPage = ({ icon, title, locked }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
    <Text style={{ fontSize: 48 }}>{icon}</Text>
    <Text style={{ color: '#EAEEF3', fontSize: 22, fontWeight: '700', marginTop: 16 }}>{title}</Text>
    {locked && (
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <LockIcon size={32} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
          <LixGemIcon width={14} height={16} />
          <Text style={{ color: '#D4AF37', fontSize: 13 }}>300 Lix</Text>
          <Text style={{ color: '#8892A0', fontSize: 13 }}> ou </Text>
          <StarIcon />
          <Text style={{ color: '#00D984', fontSize: 13 }}> Premium</Text>
        </View>
      </View>
    )}
    {!locked && (
      <Text style={{ color: '#555E6C', fontSize: 13, marginTop: 12, textAlign: 'center' }}>
        Page en construction...
      </Text>
    )}
  </View>
);

// ============================================================
// COMPOSANT — Bottom Tab Bar (5 onglets)
// ============================================================
const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'medicai', label: 'MedicAi', iconActive: 'medkit', iconInactive: 'medkit-outline', locked: true, isMedicAi: true },
  { key: 'profile', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

const BottomTabs = ({ activeTab, onTabPress }) => (
  <View
    style={s.tabBar}
  >
    {TABS.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={s.tabItem}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <View style={{ position: 'relative' }}>
            {tab.isMedicAi ? (
              <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24">
                <Defs>
                  <SvgLinearGradient id="medicGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#FF6B8A" />
                    <Stop offset="100%" stopColor="#FF3B5C" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="8" y="2" width="8" height="20" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Rect x="2" y="8" width="20" height="8" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Path d="M12 11.5c.5-.8 1.5-1 2-.5s.5 1.5 0 2.5l-2 2-2-2c-.5-1-.5-2 0-2.5s1.5-.3 2 .5z"
                  fill="white" opacity={0.7} />
              </Svg>
            ) : (
              <Ionicons
                name={active ? tab.iconActive : tab.iconInactive}
                size={wp(22)}
                color={active ? '#00D984' : '#6B7B8D'}
              />
            )}
            {tab.locked && (
              <View style={s.tabLock}>
                <LockIcon size={10} />
              </View>
            )}
          </View>
          <Text style={[
            s.tabLabel,
            active && (tab.isMedicAi ? { color: '#FF3B5C' } : s.tabLabelActive),
            tab.isMedicAi && !active && { color: '#8892A0' },
          ]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ============================================================
// APP PRINCIPAL
// ============================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  // === DONNÉES RÉELLES SUPABASE ===
  const [realConsumed, setRealConsumed] = useState(0);
  const [realDailyTarget, setRealDailyTarget] = useState(2330);
  const [realLixBalance, setRealLixBalance] = useState(0);
  const [realGender, setRealGender] = useState('homme');
  const [lastMeal, setLastMeal] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const [tooltipStep, setTooltipStep] = useState(1);
  // 0 = pas de tooltip (fermé)
  // 1 à 4 = étape active
  // Au premier lancement : setTooltipStep(1)
  const scrollRef = React.useRef(null);
  /*
  // TODO: Activer anti-screenshot après migration vers EAS Build
  // ANTI-SCREENSHOT — Décommenter quand build standalone (pas Snack/Expo Go)
  useEffect(() => {
    const activateScreenProtection = async () => {
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        try {
          await ScreenCapture.preventScreenCaptureAsync();
        } catch (e) {
          console.log('Screen capture prevention not available');
        }
      }
    };
    activateScreenProtection();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);
  */

  const calcVitalityScore = () => {
    const OBJECTIVE = realDailyTarget || 2100;
    let score = 0;

    const netConsumed = realConsumed;
    if (OBJECTIVE > 0 && netConsumed > 0) {
      const ratio = netConsumed / OBJECTIVE;
      const deviation = Math.abs(1 - ratio);
      const nutritionPts = Math.max(0, 25 - Math.round(deviation * 83));
      score += nutritionPts;
    }

    const hydroGoal = realGender === 'femme' ? 2000 : 2500;
    const hydroPct = Math.min((hydrationMl / hydroGoal) * 100, 100);
    score += Math.round((hydroPct / 100) * 25);

    const weeklyMin = 0;
    const activityPts = Math.min(Math.round((weeklyMin / 150) * 25), 25);
    score += activityPts;

    let regPts = 0;
    if (moodFilled) regPts += 8;
    if (lastMeal) regPts += 9;
    regPts += Math.min(8, 8);
    score += regPts;

    return Math.min(100, Math.max(0, score));
  };

  // === CHARGER DONNÉES DASHBOARD ===
  const fetchDailyHydration = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase.rpc('get_daily_hydration', {
        p_user_id: TEST_USER_ID,
        p_date: today,
      });
      if (error) throw error;
      if (data && data.length > 0) {
        return {
          totalEffective: data[0].total_effective_ml,
          totalVolume: data[0].total_volume_ml,
          totalKcal: data[0].total_kcal,
          totalSugar: data[0].total_sugar_g,
          entryCount: data[0].entry_count,
        };
      }
      return { totalEffective: 0, totalVolume: 0, totalKcal: 0, totalSugar: 0, entryCount: 0 };
    } catch (err) {
      console.warn('fetchDailyHydration error:', err);
      return { totalEffective: 0, totalVolume: 0, totalKcal: 0, totalSugar: 0, entryCount: 0 };
    }
  };

  // === FETCH BOISSONS ===
  const BEVERAGE_CATS = [
    { id: 'all',              label: 'Tout',        icon: '🔍' },
    { id: 'african_juice',    label: 'Jus Afrique', icon: '🌍' },
    { id: 'african_hot',      label: 'Infusions',   icon: '☕' },
    { id: 'hot',              label: 'Chaud',       icon: '🍵' },
    { id: 'cold',             label: 'Froid',       icon: '🧊' },
    { id: 'fruit',            label: 'Fruits',      icon: '🍊' },
    { id: 'milk',             label: 'Lait',        icon: '🥛' },
  ];

  const fetchBeveragesByCategory = async (cat) => {
    setBeverageLoading(true);
    try {
      let query = supabase.from('beverages_master')
        .select('beverage_id,name,icon,category,sub_region,coeff,kcal_per_100ml,sugar_g_per_100ml,sugar_known,is_alcoholic,description')
        .order('name');
      if (cat !== 'all') query = query.eq('category', cat);
      const { data, error } = await query.limit(50);
      if (error) throw error;
      setBeverageList(data || []);
    } catch (err) {
      console.warn('fetchBeverages error:', err);
      setBeverageList([]);
    }
    setBeverageLoading(false);
  };

  const searchBeverages = async (q) => {
    if (!q || q.length < 2) {
      fetchBeveragesByCategory(beverageCategory);
      return;
    }
    setBeverageLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_beverages_fuzzy', {
        p_query: q, p_limit: 15,
      });
      if (error) throw error;
      setBeverageList(data || []);
    } catch (err) {
      console.warn('searchBeverages error:', err);
    }
    setBeverageLoading(false);
  };

  const selectBeverage = (bev) => {
    setSelectedBeverage(bev);
    setBeverageVolume(250);
    setSugarCubes(bev.sugar_known ? 0 : 2);
  };

  const QUICK_VOLUMES = [100, 150, 200, 250, 330, 500];

  const calcBeverageTotals = () => {
    if (!selectedBeverage) return { effectiveMl: 0, kcal: 0, sugarG: 0 };
    const vol = beverageVolume;
    const bev = selectedBeverage;
    const baseSugar = (bev.sugar_g_per_100ml * vol) / 100;
    const addedSugar = bev.sugar_known ? 0 : sugarCubes * SUGAR_CUBE_G;
    const totalSugar = baseSugar + addedSugar;
    const baseKcal = (bev.kcal_per_100ml * vol) / 100;
    const addedKcal = addedSugar * 4;
    const effectiveMl = Math.round(vol * bev.coeff);
    return {
      effectiveMl,
      kcal: Math.round(baseKcal + addedKcal),
      sugarG: Math.round(totalSugar * 10) / 10,
    };
  };

  const saveBeverage = async () => {
    if (!selectedBeverage || beverageSaving) return;
    setBeverageSaving(true);
    const totals = calcBeverageTotals();
    const bevName = selectedBeverage.name;
    const bevIcon = selectedBeverage.icon;
    const addedEffective = totals.effectiveMl;

    // 1. Mise à jour LOCALE immédiate (optimiste)
    setHydrationMl(prev => prev + addedEffective);
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    setHydroLogs(prev => [...prev, {
      time: timeStr,
      amount: addedEffective,
      type: bevName,
      icon: bevIcon,
    }]);

    // 1b. Afficher le toast de confirmation
    setBeverageToast({
      name: bevName,
      icon: bevIcon,
      effectiveMl: addedEffective,
      kcal: totals.kcal,
    });
    setTimeout(() => setBeverageToast(null), 2500);

    // 2. Fermer le modal immédiatement
    setSelectedBeverage(null);
    setBeverageSearch('');
    setShowBeverageModal(false);
    setBeverageSaving(false);

    // 3. Sauvegarder dans Supabase en arrière-plan
    try {
      const { error } = await supabase.rpc('add_beverage_log', {
        p_user_id: TEST_USER_ID,
        p_beverage_name: bevName,
        p_amount_ml: beverageVolume,
        p_hydration_coeff: selectedBeverage.coeff,
        p_source: 'manual',
        p_kcal: totals.kcal,
        p_sugar_g: totals.sugarG,
        p_sugar_estimated: !selectedBeverage.sugar_known,
        p_sugar_cubes: selectedBeverage.sugar_known ? 0 : sugarCubes,
      });
      if (error) {
        console.warn('add_beverage_log error:', error.message);
        Alert.alert('Erreur Supabase', error.message);
      }
      // Refresh depuis Supabase
      fetchDailyHydration().then(setHydrationData);
    } catch (err) {
      console.warn('saveBeverage error:', err);
      Alert.alert('Erreur', 'Boisson ajoutée localement. Sync Supabase échouée.');
    }
  };

  const loadDashboardFromSupabase = async () => {
    setIsLoadingDashboard(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Profil utilisateur
      const { data: profile } = await supabase
        .from('users_profile')
        .select('daily_calorie_target, lix_balance, gender')
        .eq('user_id', TEST_USER_ID)
        .single();

      if (profile) {
        setRealDailyTarget(profile.daily_calorie_target || 2330);
        setRealLixBalance(profile.lix_balance || 0);
        setRealGender(profile.gender === 'female' || profile.gender === 'femme' ? 'femme' : 'homme');
      }

      // 2. Résumé quotidien
      const { data: summary } = await supabase
        .from('daily_summary')
        .select('total_calories, total_protein, total_carbs, total_fat')
        .eq('user_id', TEST_USER_ID)
        .eq('date', today)
        .single();

      if (summary) {
        setRealConsumed(Math.round(summary.total_calories || 0));
      }

      // 3. Dernier repas
      const { data: meals } = await supabase
        .from('meals')
        .select('food_name, calories, protein_g, carbs_g, fat_g, meal_time, image_url')
        .eq('user_id', TEST_USER_ID)
        .order('meal_time', { ascending: false })
        .limit(1);

      if (meals && meals.length > 0) {
        setLastMeal(meals[0]);
      }

      // 4. Vérifier si un mood a déjà été enregistré aujourd'hui
      const todayStart = today + 'T00:00:00';
      const { data: todayMood } = await supabase
        .from('moods')
        .select('mood_level, weather')
        .eq('user_id', TEST_USER_ID)
        .gte('created_at', todayStart)
        .order('created_at', { ascending: false })
        .limit(1);

      if (todayMood && todayMood.length > 0) {
        setCurrentMood(todayMood[0].mood_level);
        setMoodFilled(true);
      }

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    }
    setIsLoadingDashboard(false);
  };

  useEffect(() => {
    loadDashboardFromSupabase();
    fetchDailyHydration().then((data) => {
      setHydrationData(data);
      // Synchroniser le state local avec les vraies données Supabase
      if (data.totalEffective > 0) {
        setHydrationMl(data.totalEffective);
      }
    });
  }, []);

  // Recharger quand on revient sur l'onglet home
  useEffect(() => {
    if (activeTab === 'home') {
      loadDashboardFromSupabase();
      fetchDailyHydration().then((data) => {
        setHydrationData(data);
        if (data.totalEffective > 0) {
          setHydrationMl(data.totalEffective);
        }
      });
    }
  }, [activeTab]);

  useEffect(() => {
    setVitalityScore(calcVitalityScore());
  }, [realConsumed, hydrationMl, moodFilled, lastMeal, realDailyTarget, realGender]);

  const [moodFilled, setMoodFilled] = useState(false);
  const [currentMood, setCurrentMood] = useState(null); // 'sad' | 'chill' | 'happy' | 'excited'
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [hydrationMl, setHydrationMl] = useState(0);
  const [vitalityScore, setVitalityScore] = useState(0);
  const [hydrationData, setHydrationData] = useState({
    totalEffective: 0, totalVolume: 0, totalKcal: 0, totalSugar: 0, entryCount: 0,
  });
  // === STATES MODAL BOISSONS ===
  const [showBeverageModal, setShowBeverageModal] = useState(false);
  const [beverageCategory, setBeverageCategory] = useState('all');
  const [beverageList, setBeverageList] = useState([]);
  const [beverageSearch, setBeverageSearch] = useState('');
  const [selectedBeverage, setSelectedBeverage] = useState(null);
  const [beverageVolume, setBeverageVolume] = useState(250);
  const [sugarCubes, setSugarCubes] = useState(2);
  const [beverageLoading, setBeverageLoading] = useState(false);
  const [beverageSaving, setBeverageSaving] = useState(false);
  const [beverageToast, setBeverageToast] = useState(null);
  const [hydroModalVisible, setHydroModalVisible] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [surplusAlertVisible, setSurplusAlertVisible] = useState(false);
  const [hydroLogs, setHydroLogs] = useState([]);

  // Mock sport activities done today
  const [activities, setActivities] = useState([
    { name: 'course', durationMin: 40, intensity: 'intense', kcalBurned: 573 },
  ]);

  const lixCount = realLixBalance;
  const notifCount = 1;
  const gender = realGender;
  const hydrationGoal = gender === 'homme' ? 2500 : 2000;

  // Calorie logic
  const consumedTotal = realConsumed + (hydrationData.totalKcal || 0);
  const burnedExtra = activities.reduce((sum, a) => sum + a.kcalBurned, 0);
  const burnedTotal = burnedExtra; // Calories brûlées par les activités du jour
  const surplus = Math.max(0, consumedTotal - burnedExtra - DAILY_OBJECTIVE);

  // Sport → hydration water loss
  const sportWaterLoss = activities.reduce((sum, a) => sum + calculateWaterLoss(a.durationMin, a.intensity), 0);
  const sportAlert = sportWaterLoss > 0
    ? `🏃 -${sportWaterLoss}ml (${activities.map(a => ACTIVITY_LABELS[a.name] || a.name).join(', ')})`
    : null;

  // ===== TOOLTIP OVERLAY — Tutoriel guidé 4 étapes =====
  const TooltipOverlay = () => {
    if (tooltipStep === 0) return null;

    const steps = [
      {
        title: 'Votre Humeur',
        description: 'Tapez sur ce visage chaque jour pour enregistrer votre humeur. Cela personnalise vos recettes et vos recommandations d\'activité.',
        icon: '😊',
        color: '#FF8C42',
        target: 'mood',
      },
      {
        title: 'Calories Consommées',
        description: 'Ce réacteur orange montre tout ce que vous avez mangé aujourd\'hui. Plus vous mangez, plus le glow s\'étend. Le satellite vert représente votre objectif.',
        icon: '🔥',
        color: '#FF8C42',
        target: 'bilan',
      },
      {
        title: 'Score Vitalité',
        description: 'L\'ADN central calcule votre score de santé sur 100. Il combine nutrition, hydratation, activité physique et régularité. Visez au-dessus de 80 !',
        icon: '🧬',
        color: '#00D984',
        target: 'bilan',
      },
      {
        title: 'Calories Restantes',
        description: 'Ce réacteur bleu montre combien vous pouvez encore manger. Le sport augmente ce nombre — c\'est votre bonus activité !',
        icon: '💪',
        color: '#4DA6FF',
        target: 'bilan',
      },
    ];

    const currentStep = steps[tooltipStep - 1];
    if (!currentStep) return null;
    const isLast = tooltipStep === steps.length;

    return (
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
      }}>
        {/* Overlay sombre simple — PAS de SVG Mask */}
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        }} />

        {/* Bulle de tooltip — TOUJOURS en bas, position fixe */}
        <View style={{
          position: 'absolute',
          bottom: wp(90),
          left: wp(16),
          right: wp(16),
          backgroundColor: '#1E2530',
          borderRadius: wp(18),
          padding: wp(18),
          borderWidth: 1.5,
          borderColor: currentStep.color + '40',
          shadowColor: currentStep.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
          elevation: 10,
          zIndex: 10000,
        }}>
          {/* Indicateur d'étape */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: wp(10),
            gap: wp(5),
          }}>
            {steps.map((_, i) => (
              <View key={i} style={{
                width: i + 1 === tooltipStep ? wp(18) : wp(6),
                height: wp(5),
                borderRadius: wp(3),
                backgroundColor: i + 1 === tooltipStep ? currentStep.color : 'rgba(255,255,255,0.15)',
              }} />
            ))}
          </View>

          {/* Numéro */}
          <Text style={{
            color: currentStep.color,
            fontSize: fp(9),
            fontWeight: '700',
            letterSpacing: 2,
            textAlign: 'center',
            marginBottom: wp(5),
          }}>{tooltipStep} / {steps.length}</Text>

          {/* Icône + Titre */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: wp(6) }}>
            <Text style={{ fontSize: fp(20), marginRight: wp(6) }}>{currentStep.icon}</Text>
            <Text style={{
              color: '#EAEEF3',
              fontSize: fp(16),
              fontWeight: '800',
            }}>{currentStep.title}</Text>
          </View>

          {/* Description */}
          <Text style={{
            color: '#8892A0',
            fontSize: fp(12),
            lineHeight: fp(18),
            textAlign: 'center',
            marginBottom: wp(14),
          }}>{currentStep.description}</Text>

          {/* Boutons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setTooltipStep(0)}>
              <Text style={{ color: '#8892A0', fontSize: fp(12), fontWeight: '500' }}>Passer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (isLast) {
                  setTooltipStep(0);
                } else {
                  setTooltipStep(tooltipStep + 1);
                  // Scroll vers la carte suivante
                  const scrollPositions = [0, 0, 0, 0];
                  scrollRef.current?.scrollTo({ y: scrollPositions[tooltipStep] || 0, animated: true });
                }
              }}
              style={{
                backgroundColor: currentStep.color,
                borderRadius: wp(10),
                paddingHorizontal: wp(18),
                paddingVertical: wp(8),
              }}
            >
              <Text style={{
                color: '#0D1117',
                fontSize: fp(13),
                fontWeight: '800',
              }}>{isLast ? 'Commencer !' : 'Suivant →'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ===== ENERGY PARTICLE — Animated particle for overflow taps =====
  const EnergyParticle = ({ x, y, emoji }) => {
    const anim = useRef(new RNAnimated.Value(0)).current;
    const drift = useRef((Math.random() - 0.5) * 50).current;

    useEffect(() => {
      RNAnimated.timing(anim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <RNAnimated.Text style={{
        position: 'absolute',
        left: x - 8,
        top: y ? y - 8 : 20,
        fontSize: 16,
        zIndex: 100,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -60 - Math.random() * 40] }) },
          { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }) },
        ],
        opacity: anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.8, 0] }),
      }}>{emoji}</RNAnimated.Text>
    );
  };

  // ===== FALLING STAR — For excited confetti =====
  // ===== MOOD MODAL — TikTok Tap Mechanism =====
  const MoodModal = () => {
    if (!showMoodModal) return null;

    const [moodLevel, setMoodLevel] = useState(0);
    const [lockedAtChill, setLockedAtChill] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [moodResult, setMoodResult] = useState(null);
    const [showWeather, setShowWeather] = useState(false);
    const [selectedWeather, setSelectedWeather] = useState(null);
    const [hasStartedTapping, setHasStartedTapping] = useState(false);
    const [tapCount, setTapCount] = useState(0);
    const [overflowTaps, setOverflowTaps] = useState(0);
    const [isExcited, setIsExcited] = useState(false);
    const [energyParticles, setEnergyParticles] = useState([]);
    const [excitedBuildUp, setExcitedBuildUp] = useState(0);
    const [currentTier, setCurrentTier] = useState(0);
    const [tierLabel, setTierLabel] = useState('');
    const [tierColor, setTierColor] = useState('#FFF');
    const [confetti, setConfetti] = useState([]);
    const [tubeLayout, setTubeLayout] = useState({ x: W / 2, y: H * 0.45 });
    const [tubeFlash, setTubeFlash] = useState(false);
    const decayTimer = useRef(null);
    const heartId = useRef(0);
    const inactivityTimer = useRef(null);
    const handAnim = useRef(new RNAnimated.Value(0)).current;
    const tubeShakeAnim = useRef(new RNAnimated.Value(0)).current;
    const tierLabelOpacity = useRef(new RNAnimated.Value(0)).current;

    const CHILL_THRESHOLD = 40;
    const HAPPY_THRESHOLD = 80;

    // DECAY — jauge descend si on ne tapote pas (3-tier locking)
    useEffect(() => {
      if (!hasStartedTapping || isExcited) return;

      decayTimer.current = setInterval(() => {
        setMoodLevel(prev => {
          if (prev >= 100) return 100;                        // Verrouillé 100%
          if (prev >= HAPPY_THRESHOLD) return Math.max(prev - 1.5, HAPPY_THRESHOLD);
          if (prev >= CHILL_THRESHOLD) return Math.max(prev - 1.5, CHILL_THRESHOLD);
          return Math.max(prev - 1.5, 0);
        });
      }, 100);
      return () => clearInterval(decayTimer.current);
    }, [hasStartedTapping, isExcited]);

    // Hand hint animation loop
    useEffect(() => {
      if (tapCount < 3) {
        RNAnimated.loop(
          RNAnimated.sequence([
            RNAnimated.timing(handAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            RNAnimated.timing(handAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          ])
        ).start();
      }
    }, [tapCount]);

    const handTranslateY = handAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
    const handOpacity = handAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });

    // Tube shake when overflow tapping (build-up)
    useEffect(() => {
      if (excitedBuildUp > 0 && excitedBuildUp < 5 && !isExcited) {
        const intensity = excitedBuildUp * 1.2;
        const animation = RNAnimated.loop(
          RNAnimated.sequence([
            RNAnimated.timing(tubeShakeAnim, { toValue: intensity, duration: 35, useNativeDriver: true }),
            RNAnimated.timing(tubeShakeAnim, { toValue: -intensity, duration: 35, useNativeDriver: true }),
          ])
        );
        animation.start();
        return () => { animation.stop(); tubeShakeAnim.setValue(0); };
      }
      if (isExcited) {
        tubeShakeAnim.setValue(0);
      }
    }, [excitedBuildUp, isExcited]);

    // Détection fin — 3 secondes sans tap (only if user has started tapping)
    useEffect(() => {
      if (moodResult || !hasStartedTapping) return;
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        let result;
        if (isExcited || moodLevel >= 100) result = 'excited';
        else if (moodLevel >= HAPPY_THRESHOLD) result = 'happy';
        else if (moodLevel >= CHILL_THRESHOLD) result = 'chill';
        else result = 'sad';
        setMoodResult(result);
        clearInterval(decayTimer.current);
      }, 3000);
      return () => clearTimeout(inactivityTimer.current);
    }, [moodLevel, hasStartedTapping, isExcited]);

    // Screen shake animation
    const screenShakeAnim = useRef(new RNAnimated.Value(0)).current;

    // Confetti + screen shake when Excited triggers
    useEffect(() => {
      if (isExcited) {
        const colors = ['#FF8C42', '#00D984', '#4DA6FF', '#D4AF37', '#FF6B8A', '#FFD93D', '#FFFFFF'];
        const newConfetti = Array.from({ length: 40 }, (_, i) => ({
          id: Date.now() + i,
          x: Math.random() * W,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 6,
          drift: (Math.random() - 0.5) * 80,
          rotateEnd: 360 + Math.random() * 720,
          delay: Math.random() * 600,
        }));
        setConfetti(newConfetti);
        setTimeout(() => setConfetti([]), 3500);

        // SCREEN SHAKE — tout l'écran tremble
        const shakeSequence = [];
        for (let i = 0; i < 15; i++) {
          shakeSequence.push(
            RNAnimated.timing(screenShakeAnim, {
              toValue: (Math.random() - 0.5) * 12,
              duration: 50 + Math.random() * 30,
              useNativeDriver: true,
            })
          );
        }
        shakeSequence.push(
          RNAnimated.timing(screenShakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          })
        );
        RNAnimated.sequence(shakeSequence).start();
      }
    }, [isExcited]);

    const Confetto = ({ item }) => {
      const fallAnim = useRef(new RNAnimated.Value(0)).current;
      const rotateAnim = useRef(new RNAnimated.Value(0)).current;

      useEffect(() => {
        const delay = item.delay || 0;
        const timer = setTimeout(() => {
          RNAnimated.parallel([
            RNAnimated.timing(fallAnim, {
              toValue: 1, duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            RNAnimated.timing(rotateAnim, {
              toValue: 1, duration: 1500 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ]).start();
        }, delay);
        return () => clearTimeout(timer);
      }, []);

      const translateY = fallAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, H + 50],
      });
      const translateX = fallAnim.interpolate({
        inputRange: [0, 0.3, 0.6, 1],
        outputRange: [0, item.drift * 0.5, item.drift * -0.3, item.drift],
      });
      const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', `${item.rotateEnd}deg`],
      });
      const opacity = fallAnim.interpolate({
        inputRange: [0, 0.1, 0.8, 1],
        outputRange: [0, 1, 1, 0],
      });

      return (
        <RNAnimated.View style={{
          position: 'absolute',
          left: item.x,
          top: 0,
          width: item.size,
          height: item.size * 2.5,
          borderRadius: item.size * 0.3,
          backgroundColor: item.color,
          transform: [{ translateY }, { translateX }, { rotate }],
          opacity,
          zIndex: 100,
        }} />
      );
    };

    // Tier feedback — flash label + vibration quand un palier est franchi
    const triggerTierFeedback = (tier) => {
      const labels = { 1: 'CHILL', 2: 'HEUREUX', 3: 'EXCITÉ' };
      const colors = { 1: '#00D984', 2: '#4DA6FF', 3: '#D4AF37' };

      setTierLabel(labels[tier] || '');
      setTierColor(colors[tier] || '#FFF');

      RNAnimated.sequence([
        RNAnimated.timing(tierLabelOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
        RNAnimated.delay(350),
        RNAnimated.timing(tierLabelOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setTierLabel(''));

      try {
        const { Vibration } = require('react-native');
        Vibration.vibrate(30);
      } catch(e) {}
    };

    useEffect(() => {
      let newTier = 0;
      if (isExcited) newTier = 3;
      else if (moodLevel >= 80) newTier = 2;
      else if (moodLevel >= 40) newTier = 1;

      if (newTier > currentTier) {
        setCurrentTier(newTier);
        triggerTierFeedback(newTier);
      }
    }, [moodLevel, isExcited]);

    const spawnHeartsAt = (x, y) => {
      // Couleurs adaptées au niveau actuel
      let emojis;
      if (isExcited || moodLevel >= 100) {
        emojis = ['💛', '⭐', '✨', '💫', '🌟'];
      } else if (moodLevel >= 80) {
        emojis = ['💙', '💎', '🩵', '💠'];
      } else if (moodLevel >= 40) {
        emojis = ['💚', '💚', '🤍', '💚'];
      } else {
        emojis = ['🤍', '🩶', '🤍', '🩶'];
      }

      const batch = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i + Math.random(),
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: x,
        y: y,
      }));
      setHearts(prev => [...prev, ...batch]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => !batch.find(b => b.id === h.id)));
      }, 1000);
    };

    const spawnEnergyAt = (x, y) => {
      const newParticles = Array.from({ length: 2 }, (_, i) => ({
        id: Date.now() + i + Math.random(),
        x: x,
        y: y,
        emoji: ['⚡', '✦', '🔥'][Math.floor(Math.random() * 3)],
      }));
      setEnergyParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => {
        setEnergyParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 800);
    };

    const handleTap = (touchX, touchY) => {
      if (moodResult) return;
      if (!hasStartedTapping) setHasStartedTapping(true);
      setTapCount(prev => prev + 1);

      // Spawner cœurs à la position du doigt
      spawnHeartsAt(touchX, touchY);

      // Flash sur le tube
      setTubeFlash(true);
      setTimeout(() => setTubeFlash(false), 200);

      if (isExcited) return;

      if (moodLevel >= 100) {
        // Overflow taps after reaching 100%
        setOverflowTaps(prev => prev + 1);
        setExcitedBuildUp(prev => {
          const next = prev + 1;
          if (next >= 5 && !isExcited) {
            setIsExcited(true);
            try {
              const { Vibration } = require('react-native');
              Vibration.vibrate([0, 50, 30, 50]);
            } catch(e) {}
          }
          return Math.min(next, 5);
        });
        // Particules énergie pendant le build-up
        spawnEnergyAt(touchX, touchY);
      } else if (tapCount < 3) {
        // First 3 taps: light progression (+1%)
        setMoodLevel(prev => Math.min(prev + 1, 100));
      } else {
        // Normal taps: +4%
        setMoodLevel(prev => Math.min(prev + 4, 100));
      }
    };

    const moodMessages = {
      sad: {
        tier: 0,
        title: 'Ça va aller...',
        message: 'Une petite activité sportive en plein air peut faire des merveilles ! Bougez, respirez, et revenez plus fort.',
        color: '#8892A0',
      },
      chill: {
        tier: 1,
        title: 'Belle énergie !',
        message: 'Maintenez votre énergie positive avec un bon repas équilibré. Votre corps vous remerciera.',
        color: '#00D984',
      },
      happy: {
        tier: 2,
        title: 'Au top !',
        message: 'Quelle énergie ! Profitez de cette journée pour atteindre vos objectifs. Rien ne peut vous arrêter !',
        color: '#4DA6FF',
      },
      excited: {
        tier: 3,
        title: 'Tu déborde d\'énergie !',
        message: 'C\'est le moment de tout donner ! Tu es au maximum de ton énergie !',
        color: '#D4AF37',
      },
    };

    const currentMoodZone = isExcited ? 'excited' : moodLevel >= HAPPY_THRESHOLD ? 'happy' : moodLevel >= CHILL_THRESHOLD ? 'chill' : 'sad';
    const activeTier = isExcited ? 3 : moodLevel >= 80 ? 2 : moodLevel >= 40 ? 1 : 0;

    return (
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9998,
      }}>
        <LinearGradient
          colors={['#0D1117', '#1A2029', '#0D1117']}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Pressable
            onPressIn={(event) => {
              const { pageX, pageY } = event.nativeEvent;
              handleTap(pageX, pageY);
            }}
            style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
          >
            <RNAnimated.View style={{
              flex: 1,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              transform: [
                { translateX: screenShakeAnim },
                { translateY: screenShakeAnim.interpolate({
                    inputRange: [-12, 0, 12],
                    outputRange: [6, 0, -6],
                  })
                },
              ],
            }}>
            {/* Cœurs flottants */}
            {hearts.map(heart => (
              <FloatingHeart key={heart.id} heart={heart} tubeCenter={tubeLayout} />
            ))}

            {/* Confettis (Excité) */}
            {confetti.map(item => (
              <Confetto key={item.id} item={item} />
            ))}

            {/* Titre */}
            {!moodResult && (
              <Text style={{
                color: '#EAEEF3',
                fontSize: 18,
                fontWeight: '800',
                letterSpacing: 2,
                marginBottom: 30,
              }}>COMMENT ALLEZ-VOUS ?</Text>
            )}

            {/* Flash label tier */}
            {tierLabel !== '' && (
              <RNAnimated.View style={{
                position: 'absolute',
                alignSelf: 'center',
                top: '42%',
                zIndex: 60,
                opacity: tierLabelOpacity,
                backgroundColor: 'rgba(0,0,0,0.7)',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: tierColor,
              }}>
                <Text style={{
                  color: tierColor,
                  fontSize: 20,
                  fontWeight: '900',
                  letterSpacing: 2,
                }}>
                  {tierLabel}
                </Text>
              </RNAnimated.View>
            )}

            {/* Barre verticale + Icônes */}
            {!moodResult && (
              <View
                onLayout={(e) => {
                  const { x, y, width, height } = e.nativeEvent.layout;
                  setTubeLayout({
                    x: x + width / 2,
                    y: y + height / 2,
                  });
                }}
                style={{ flexDirection: 'row', alignItems: 'flex-end', height: 300, position: 'relative' }}
              >
                {/* Hand hint — visible before 3 taps */}
                {tapCount < 3 && (
                  <RNAnimated.View style={{
                    position: 'absolute',
                    top: '45%',
                    right: wp(30),
                    alignItems: 'center',
                    transform: [{ translateY: handTranslateY }],
                    opacity: handOpacity,
                    zIndex: 10,
                  }}>
                    <Text style={{ fontSize: 50 }}>👆</Text>
                    <Text style={{
                      color: '#8892A0',
                      fontSize: 13,
                      marginTop: 4,
                      textAlign: 'center',
                    }}>
                      Tapotez{'\n'}partout !
                    </Text>
                  </RNAnimated.View>
                )}

                {/* Energy particles */}
                {energyParticles.map(p => (
                  <EnergyParticle key={p.id} x={p.x} y={p.y} emoji={p.emoji} />
                ))}

                {/* Icônes SVG à gauche */}
                <View style={{ justifyContent: 'space-between', height: 300, marginRight: 15, paddingVertical: 5, alignItems: 'center' }}>
                  <MoodIcon tier={3} size={42} active={activeTier === 3} />
                  <MoodIcon tier={2} size={42} active={activeTier === 2} />
                  <MoodIcon tier={1} size={42} active={activeTier === 1} />
                  <MoodIcon tier={0} size={42} active={activeTier === 0} />
                </View>

                {/* Barre verticale avec shake */}
                <RNAnimated.View style={{ transform: [{ translateX: tubeShakeAnim }] }}>
                  <View style={{
                    width: 50,
                    height: 300,
                    borderRadius: 25,
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    borderWidth: tubeFlash ? 2 : 1,
                    borderColor: tubeFlash
                      ? (isExcited ? '#D4AF37' : moodLevel >= 80 ? '#4DA6FF' : moodLevel >= 40 ? '#00D984' : '#8892A0')
                      : 'rgba(255, 255, 255, 0.1)',
                    shadowColor: tubeFlash
                      ? (isExcited ? '#D4AF37' : moodLevel >= 80 ? '#4DA6FF' : moodLevel >= 40 ? '#00D984' : '#FFFFFF')
                      : 'transparent',
                    shadowOpacity: tubeFlash ? 0.8 : 0,
                    shadowRadius: tubeFlash ? 15 : 0,
                    shadowOffset: { width: 0, height: 0 },
                    overflow: 'hidden',
                    justifyContent: 'flex-end',
                  }}>
                    {/* Barre 1 : Triste → Chill à 40% */}
                    <View style={{
                      position: 'absolute',
                      bottom: 300 * 0.40,
                      left: -4, right: -4, height: 2.5,
                      backgroundColor: '#00D984',
                      borderRadius: 1,
                      zIndex: 5,
                    }} />
                    {/* Barre 2 : Chill → Heureux à 80% */}
                    <View style={{
                      position: 'absolute',
                      bottom: 300 * 0.80,
                      left: -4, right: -4, height: 2.5,
                      backgroundColor: '#4DA6FF',
                      borderRadius: 1,
                      zIndex: 5,
                    }} />
                    {/* Barre 3 : Heureux → Excité à 95% */}
                    <View style={{
                      position: 'absolute',
                      bottom: 300 * 0.95,
                      left: -4, right: -4, height: 2.5,
                      backgroundColor: '#D4AF37',
                      borderRadius: 1,
                      zIndex: 5,
                    }} />

                    {/* Remplissage gradient */}
                    <LinearGradient
                      colors={
                        isExcited || (moodLevel >= 100 && overflowTaps > 0)
                          ? ['#D4AF37', '#FFE066']
                          : moodLevel >= HAPPY_THRESHOLD
                            ? ['#4DA6FF', '#7DD3FC']
                            : moodLevel >= CHILL_THRESHOLD
                              ? ['#00854F', '#00D984']
                              : ['#4A4F55', '#8892A0']
                      }
                      style={{
                        width: '100%',
                        height: `${moodLevel}%`,
                        borderRadius: 25,
                      }}
                    />
                  </View>
                </RNAnimated.View>

                {/* Labels à droite */}
                <View style={{ justifyContent: 'space-between', height: 300, marginLeft: 15, paddingVertical: 5 }}>
                  <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700' }}>EXCITÉ</Text>
                  <Text style={{ color: '#4DA6FF', fontSize: 11, fontWeight: '700' }}>HEUREUX</Text>
                  <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '700' }}>CHILL</Text>
                  <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '700' }}>TRISTE</Text>
                </View>
              </View>
            )}

            {/* Instruction tap */}
            {!moodResult && (
              <Text style={{
                color: '#8892A0',
                fontSize: 12,
                marginTop: 25,
                textAlign: 'center',
              }}>Tapotez l'écran pour exprimer votre humeur !</Text>
            )}

            {/* Résultat Mood */}
            {moodResult && !showWeather && (
              <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
                {/* Confettis for Excited result */}
                {moodResult === 'excited' && confetti.length > 0 &&
                  confetti.map(item => ( <Confetto key={item.id} item={item} /> ))
                }
                <View style={{
                  marginBottom: 15,
                  shadowColor: moodMessages[moodResult].color,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 20,
                  elevation: 10,
                }}>
                  <MoodIcon tier={moodMessages[moodResult].tier} size={70} active={true} />
                </View>
                <Text style={{
                  color: moodMessages[moodResult].color,
                  fontSize: 22,
                  fontWeight: '800',
                  marginBottom: 10,
                }}>{moodMessages[moodResult].title}</Text>
                <Text style={{
                  color: '#8892A0',
                  fontSize: 14,
                  lineHeight: 22,
                  textAlign: 'center',
                  marginBottom: 30,
                }}>{moodMessages[moodResult].message}</Text>

                <View style={{
                  backgroundColor: 'rgba(0,217,132,0.06)',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(0,217,132,0.15)',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginBottom: 20,
                  marginTop: 10,
                }}>
                  <Text style={{
                    color: '#00D984',
                    fontSize: 12,
                    textAlign: 'center',
                    fontWeight: '600',
                  }}>
                    🔗 Votre humeur personnalise vos recettes et activités du jour
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setShowWeather(true)}
                  style={{
                    backgroundColor: moodMessages[moodResult].color,
                    borderRadius: 14,
                    paddingHorizontal: 30,
                    paddingVertical: 12,
                  }}
                >
                  <Text style={{ color: '#0D1117', fontSize: 15, fontWeight: '800' }}>Continuer →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setMoodLevel(0);
                    setLockedAtChill(false);
                    setMoodResult(null);
                    setHearts([]);
                    setHasStartedTapping(false);
                    setTapCount(0);
                    setOverflowTaps(0);
                    setIsExcited(false);
                    setEnergyParticles([]);
                    setExcitedBuildUp(0);
                    setCurrentTier(0);
                    setTierLabel('');
                    setTierColor('#FFF');
                    setConfetti([]);
                    tubeShakeAnim.setValue(0);
                    tierLabelOpacity.setValue(0);
                  }}
                  style={{ marginTop: 15 }}
                >
                  <Text style={{ color: '#8892A0', fontSize: 12 }}>Refaire</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Sélection Météo */}
            {showWeather && (
              <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
                <Text style={{
                  color: '#EAEEF3',
                  fontSize: 16,
                  fontWeight: '800',
                  letterSpacing: 2,
                  marginBottom: 8,
                }}>QUEL TEMPS FAIT-IL ?</Text>
                <Text style={{
                  color: '#8892A0',
                  fontSize: 12,
                  marginBottom: 25,
                  textAlign: 'center',
                }}>Cela nous aide à adapter vos recommandations</Text>

                <View style={{ flexDirection: 'row', gap: 15 }}>
                  {/* Pluvieux */}
                  <TouchableOpacity
                    onPress={() => setSelectedWeather('rainy')}
                    style={{
                      width: 90, height: 100,
                      borderRadius: 18,
                      backgroundColor: selectedWeather === 'rainy' ? 'rgba(77, 166, 255, 0.15)' : 'rgba(255,255,255,0.04)',
                      borderWidth: 1.5,
                      borderColor: selectedWeather === 'rainy' ? '#4DA6FF' : 'rgba(255,255,255,0.08)',
                      justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 35 }}>🌧️</Text>
                    <Text style={{ color: '#4DA6FF', fontSize: 11, fontWeight: '700', marginTop: 5 }}>Pluvieux</Text>
                  </TouchableOpacity>

                  {/* Nuageux */}
                  <TouchableOpacity
                    onPress={() => setSelectedWeather('cloudy')}
                    style={{
                      width: 90, height: 100,
                      borderRadius: 18,
                      backgroundColor: selectedWeather === 'cloudy' ? 'rgba(136, 146, 160, 0.15)' : 'rgba(255,255,255,0.04)',
                      borderWidth: 1.5,
                      borderColor: selectedWeather === 'cloudy' ? '#8892A0' : 'rgba(255,255,255,0.08)',
                      justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 35 }}>☁️</Text>
                    <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '700', marginTop: 5 }}>Nuageux</Text>
                  </TouchableOpacity>

                  {/* Ensoleillé */}
                  <TouchableOpacity
                    onPress={() => setSelectedWeather('sunny')}
                    style={{
                      width: 90, height: 100,
                      borderRadius: 18,
                      backgroundColor: selectedWeather === 'sunny' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
                      borderWidth: 1.5,
                      borderColor: selectedWeather === 'sunny' ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                      justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 35 }}>☀️</Text>
                    <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700', marginTop: 5 }}>Ensoleillé</Text>
                  </TouchableOpacity>
                </View>

                {/* Bouton Valider */}
                {selectedWeather && (
                  <View style={{ marginTop: 25, alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          // 1. Sauvegarder dans la table moods
                          await supabase.from('moods').insert({
                            user_id: TEST_USER_ID,
                            mood_level: moodResult,
                            weather: selectedWeather,
                            tap_count: tapCount,
                            max_gauge_percent: Math.round(moodLevel),
                          });

                          // 2. Mettre à jour users_profile avec le mood + météo du jour
                          await supabase.from('users_profile').update({
                            current_mood: moodResult,
                            current_weather: selectedWeather,
                          }).eq('user_id', TEST_USER_ID);

                        } catch (e) {
                          console.warn('Mood save error:', e);
                          // Sauvegarder localement même si Supabase échoue
                        }

                        // Mettre à jour l'état local
                        setCurrentMood(moodResult);
                        setMoodFilled(true);
                        setShowMoodModal(false);
                      }}
                      style={{
                        backgroundColor: '#00D984',
                        borderRadius: 14,
                        paddingHorizontal: 30,
                        paddingVertical: 12,
                      }}
                    >
                      <Text style={{ color: '#0D1117', fontSize: 15, fontWeight: '800' }}>Valider ✓</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => Alert.alert(
                        'Recettes Suggérées',
                        'Découvrez des recettes adaptées à votre humeur et à la météo du jour !',
                      )}
                      style={{ marginTop: 12 }}
                    >
                      <Text style={{ color: '#00D984', fontSize: 12, fontWeight: '600' }}>
                        Voir les Recettes Suggérées  ›
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            </RNAnimated.View>
          </Pressable>
        </LinearGradient>
      </View>
    );
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DashboardContent
            onHydrationPress={() => setHydroModalVisible(true)}
            hydrationMl={hydrationMl}
            hydrationGoal={hydrationGoal}
            gender={gender}
            burnedExtra={burnedExtra}
            sportAlert={sportAlert}
            consumedTotal={consumedTotal}
            burnedTotal={burnedTotal}
            scrollRef={scrollRef}
            dailyTarget={realDailyTarget}
            lastMeal={lastMeal}
            tooltipStep={tooltipStep}
            vitalityScore={vitalityScore}
          />
        );
      case 'meals':
        return <RepasPage />;
      case 'activity':
        return <ActivityPage />;
      case 'medicai':
        return <PlaceholderPage icon={'🏥'} title="MedicAi" locked />;
      case 'profile':
        // TEMPORAIRE: NeumorphPage remplace Profil pour tests design
        return <NeumorphPage />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#1E2530' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1E2530" />

        {/* Background métallique propre */}
        <MetallicBackground />

        {/* Contenu principal */}
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Header
            moodFilled={moodFilled}
            currentMood={currentMood}
            lixCount={lixCount}
            notifCount={notifCount}
            onMoodPress={() => setShowMoodModal(true)}
            onLixPress={() => setActiveTab('profile')}
            highlightMood={tooltipStep === 1}
          />
          {renderPage()}
        </SafeAreaView>

        <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'transparent' }}>
          <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
        </SafeAreaView>

        {/* Modal Hydratation fullscreen */}
        <HydrationModal
          visible={hydroModalVisible}
          onClose={() => setHydroModalVisible(false)}
          currentMl={hydrationMl}
          setCurrentMl={setHydrationMl}
          goalMl={hydrationGoal}
          gender={gender}
          hydroLogs={hydroLogs}
          setHydroLogs={setHydroLogs}
          onAddBeverage={() => {
            setShowBeverageModal(true);
            setBeverageCategory('all');
            setSelectedBeverage(null);
            setBeverageSearch('');
            fetchBeveragesByCategory('all');
          }}
          showResetConfirm={showResetConfirm}
          setShowResetConfirm={setShowResetConfirm}
        />

        {/* Surplus alert modal */}
        <SurplusAlertModal
          visible={surplusAlertVisible}
          onClose={() => setSurplusAlertVisible(false)}
          surplus={surplus}
          onAddActivity={() => setActiveTab('activity')}
        />

        {/* ===== MOOD MODAL — TikTok Tap ===== */}
        <MoodModal />

        {/* ══════ MODAL AJOUTER BOISSONS ══════ */}
        <Modal visible={showBeverageModal} animationType="slide" transparent={false}>
          <LinearGradient
            colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
            locations={[0, 0.25, 0.5, 0.75, 1]}
            style={{ flex: 1 }}
          >
            {/* HEADER — compact, premium */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: Platform.OS === 'android' ? 38 : 50,
              paddingHorizontal: wp(14), paddingBottom: 10,
              borderBottomWidth: 1, borderBottomColor: 'rgba(0,217,132,0.08)',
            }}>
              <Pressable
                onPress={() => { setShowBeverageModal(false); setSelectedBeverage(null); }}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Ionicons name="close" size={18} color="#8892A0" />
              </Pressable>
              <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800', letterSpacing: 1 }}>
                BOISSONS
              </Text>
              <View style={{ width: 36 }} />
            </View>

            {/* BARRE DE RECHERCHE — MetalCard style */}
            <View style={{
              marginHorizontal: wp(14), marginTop: 10, marginBottom: 8,
              backgroundColor: 'rgba(37,42,48,0.8)',
              borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(74,79,85,0.5)',
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
            }}>
              <Ionicons name="search" size={16} color="#8892A0" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Rechercher (bissap, chai, zobo...)"
                placeholderTextColor="#555E6C"
                value={beverageSearch}
                onChangeText={(t) => { setBeverageSearch(t); searchBeverages(t); }}
                style={{ flex: 1, color: '#EAEEF3', fontSize: fp(13), paddingVertical: 10 }}
              />
              {beverageSearch ? (
                <Pressable onPress={() => { setBeverageSearch(''); fetchBeveragesByCategory(beverageCategory); }}>
                  <Ionicons name="close-circle" size={18} color="#555E6C" />
                </Pressable>
              ) : null}
            </View>

            {/* CARROUSEL CATÉGORIES */}
            <View style={{ height: 36, marginBottom: 8 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: wp(14), alignItems: 'center', height: 36 }}
              >
                {BEVERAGE_CATS.map((cat) => {
                  const active = beverageCategory === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => { setBeverageCategory(cat.id); setBeverageSearch(''); fetchBeveragesByCategory(cat.id); }}
                      style={{
                        flexDirection: 'row', alignItems: 'center',
                        height: 30,
                        paddingHorizontal: 10, marginRight: 6,
                        borderRadius: 15,
                        backgroundColor: active ? '#00D984' : 'rgba(51,58,66,0.6)',
                        borderWidth: 1,
                        borderColor: active ? '#00D984' : 'rgba(74,79,85,0.4)',
                      }}
                    >
                      <Text style={{ fontSize: 11, marginRight: 3 }}>{cat.icon}</Text>
                      <Text style={{
                        color: active ? '#1A1D22' : '#AABBCC',
                        fontSize: fp(10), fontWeight: '700',
                      }}>{cat.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* GRILLE DE BOISSONS / PANNEAU SÉLECTION */}
            <ScrollView style={{ flex: 1, paddingHorizontal: wp(14) }} showsVerticalScrollIndicator={false}>

              {/* ══════ MODE SÉLECTION : panneau config ══════ */}
              {selectedBeverage ? (
                <View style={{ paddingTop: 6 }}>
                  {/* Bouton retour */}
                  <Pressable
                    onPress={() => setSelectedBeverage(null)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}
                  >
                    <Ionicons name="arrow-back" size={18} color="#00D984" />
                    <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600', marginLeft: 6 }}>
                      Retour aux boissons
                    </Text>
                  </Pressable>

                  <View style={{ borderRadius: wp(16), overflow: 'hidden' }}>
                    <LinearGradient
                      colors={['#2A3038', '#222830', '#1E2228']}
                      style={{
                        padding: wp(14),
                        borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                        borderRadius: wp(16),
                      }}
                    >
                      {/* EN-TÊTE */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ fontSize: 36, marginRight: 12 }}>{selectedBeverage.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800' }}>
                            {selectedBeverage.name}
                          </Text>
                          {selectedBeverage.description ? (
                            <Text numberOfLines={2} style={{ color: '#6B7280', fontSize: fp(10), marginTop: 2 }}>
                              {selectedBeverage.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* SOURCE SCIENTIFIQUE */}
                      <View style={{
                        backgroundColor: 'rgba(77,166,255,0.06)',
                        borderRadius: 8, padding: 8, marginBottom: 12,
                        borderWidth: 1, borderColor: 'rgba(77,166,255,0.1)',
                      }}>
                        <Text style={{ color: '#4DA6FF', fontSize: fp(8), fontWeight: '600' }}>
                          📊 Hydratation : {(selectedBeverage.coeff * 100).toFixed(0)}% — Beverage Hydration Index (Maughan et al., 2016, Am J Clin Nutr)
                        </Text>
                      </View>

                      {/* VOLUMES RAPIDES */}
                      <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '700', letterSpacing: 1, marginBottom: 6 }}>VOLUME</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
                        {QUICK_VOLUMES.map((v) => (
                          <Pressable
                            key={v}
                            onPress={() => setBeverageVolume(v)}
                            style={{
                              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
                              marginRight: 6, marginBottom: 5,
                              backgroundColor: beverageVolume === v ? '#00D984' : 'rgba(51,58,66,0.6)',
                              borderWidth: 1,
                              borderColor: beverageVolume === v ? '#00D984' : 'rgba(74,79,85,0.3)',
                            }}
                          >
                            <Text style={{
                              color: beverageVolume === v ? '#1A1D22' : '#AABBCC',
                              fontSize: fp(12), fontWeight: '700',
                            }}>{v} ml</Text>
                          </Pressable>
                        ))}
                        <View style={{
                          flexDirection: 'row', alignItems: 'center',
                          backgroundColor: 'rgba(51,58,66,0.6)', borderRadius: 14,
                          paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(74,79,85,0.3)',
                        }}>
                          <TextInput
                            placeholder="..."
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            value={QUICK_VOLUMES.includes(beverageVolume) ? '' : String(beverageVolume)}
                            onChangeText={(t) => { const n = parseInt(t); if (n > 0 && n <= 2000) setBeverageVolume(n); }}
                            style={{ color: '#EAEEF3', fontSize: fp(12), width: 35, textAlign: 'center' }}
                          />
                          <Text style={{ color: '#555E6C', fontSize: fp(10) }}>ml</Text>
                        </View>
                      </View>

                      {/* CUBES DE SUCRE */}
                      {!selectedBeverage.sugar_known ? (
                        <View style={{ marginBottom: 12 }}>
                          <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '700', letterSpacing: 1, marginBottom: 6 }}>SUCRE AJOUTÉ</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                            {[0, 1, 2, 3, 4, 5].map((n) => (
                              <Pressable
                                key={n}
                                onPress={() => setSugarCubes(n)}
                                style={{
                                  width: 36, height: 36, borderRadius: 10, marginRight: 5, marginBottom: 4,
                                  backgroundColor: n === 0
                                    ? (sugarCubes === 0 ? 'rgba(0,217,132,0.15)' : 'rgba(51,58,66,0.6)')
                                    : (sugarCubes >= n ? 'rgba(255,217,61,0.2)' : 'rgba(51,58,66,0.6)'),
                                  borderWidth: sugarCubes === n ? 1.5 : 1,
                                  borderColor: n === 0
                                    ? (sugarCubes === 0 ? '#00D984' : 'rgba(74,79,85,0.3)')
                                    : (sugarCubes >= n ? '#FFD93D' : 'rgba(74,79,85,0.3)'),
                                  justifyContent: 'center', alignItems: 'center',
                                }}
                              >
                                <Text style={{ fontSize: 14 }}>{n === 0 ? '🚫' : '🧊'}</Text>
                              </Pressable>
                            ))}
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                            <Text style={{ color: '#FFD93D', fontSize: fp(10), fontWeight: '700' }}>
                              {sugarCubes === 0 ? 'Sans sucre' : sugarCubes === 1 ? 'Léger' : sugarCubes <= 3 ? 'Sucré' : 'Très sucré'}
                            </Text>
                            <Text style={{ color: '#6B7280', fontSize: fp(9) }}>
                              +{sugarCubes * SUGAR_CUBE_G}g → +{sugarCubes * SUGAR_CUBE_G * 4} kcal
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      {/* RÉSUMÉ 3 CHIFFRES */}
                      {(() => {
                        const t = calcBeverageTotals();
                        return (
                          <View style={{
                            backgroundColor: 'rgba(13,17,23,0.5)', borderRadius: wp(12),
                            padding: 12, marginBottom: 12,
                            flexDirection: 'row', justifyContent: 'space-around',
                            borderWidth: 1, borderColor: 'rgba(74,79,85,0.2)',
                          }}>
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ color: '#00D984', fontSize: fp(18), fontWeight: '900' }}>{t.effectiveMl}</Text>
                              <Text style={{ color: '#6B7280', fontSize: fp(9) }}>ml effectifs</Text>
                            </View>
                            <View style={{ width: 1, backgroundColor: 'rgba(74,79,85,0.3)' }} />
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ color: '#FF8C42', fontSize: fp(18), fontWeight: '900' }}>{t.kcal}</Text>
                              <Text style={{ color: '#6B7280', fontSize: fp(9) }}>kcal</Text>
                            </View>
                            <View style={{ width: 1, backgroundColor: 'rgba(74,79,85,0.3)' }} />
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ color: '#FFD93D', fontSize: fp(18), fontWeight: '900' }}>{t.sugarG}g</Text>
                              <Text style={{ color: '#6B7280', fontSize: fp(9) }}>sucre</Text>
                            </View>
                          </View>
                        );
                      })()}

                      {/* BOUTON VALIDER */}
                      <Pressable
                        onPress={saveBeverage}
                        disabled={beverageSaving}
                        style={({ pressed }) => ({
                          backgroundColor: beverageSaving ? '#333A42' : '#00D984',
                          borderRadius: wp(12), paddingVertical: 14, alignItems: 'center',
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                          shadowColor: '#00D984',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: beverageSaving ? 0 : 0.3,
                          shadowRadius: 10, elevation: beverageSaving ? 0 : 6,
                        })}
                      >
                        <Text style={{
                          color: beverageSaving ? '#555E6C' : '#0D1117',
                          fontSize: fp(14), fontWeight: '900', letterSpacing: 0.5,
                        }}>
                          {beverageSaving ? 'Enregistrement...' : `✓  AJOUTER ${beverageVolume}ml`}
                        </Text>
                      </Pressable>
                    </LinearGradient>
                  </View>
                </View>
              ) : (
                <>
                  {/* ══════ MODE GRILLE : liste des boissons ══════ */}
                  {beverageLoading ? (
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                      <Text style={{ fontSize: 32 }}>🔄</Text>
                      <Text style={{ color: '#555E6C', fontSize: fp(13), marginTop: 8 }}>Chargement...</Text>
                    </View>
                  ) : beverageList.length === 0 ? (
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                      <Text style={{ fontSize: 32 }}>🔍</Text>
                      <Text style={{ color: '#555E6C', fontSize: fp(13), marginTop: 8 }}>Aucune boisson trouvée</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: wp(8), paddingTop: 6 }}>
                      {beverageList.map((bev) => {
                        const coeffColor = getCoeffColor(bev.coeff);
                        return (
                          <Pressable
                            key={bev.beverage_id}
                            onPress={() => selectBeverage(bev)}
                            style={{
                              width: (W - wp(14) * 2 - wp(8) * 2) / 3,
                              paddingVertical: 10, paddingHorizontal: 6, borderRadius: wp(14),
                              backgroundColor: 'rgba(30,34,40,0.8)',
                              borderWidth: 1, borderColor: 'rgba(74,79,85,0.3)',
                            }}
                          >
                            <Text style={{ fontSize: 28, textAlign: 'center' }}>{bev.icon}</Text>
                            <Text numberOfLines={2} style={{
                              color: '#EAEEF3', fontSize: fp(10), fontWeight: '600',
                              textAlign: 'center', marginTop: 4, minHeight: 28,
                            }}>{bev.name}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 3 }}>
                              <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: coeffColor, marginRight: 3 }} />
                              <Text style={{ color: coeffColor, fontSize: fp(9), fontWeight: '800' }}>
                                {(bev.coeff * 100).toFixed(0)}%
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </>
              )}
              <View style={{ height: 30 }} />
            </ScrollView>
          </LinearGradient>
        </Modal>

        {/* ══════ TOAST BOISSON AJOUTÉE ══════ */}
        {beverageToast && (
          <View style={{
            position: 'absolute',
            top: Platform.OS === 'android' ? 40 : 55,
            left: wp(16), right: wp(16),
            zIndex: 99999,
          }}>
            <View style={{
              backgroundColor: 'rgba(0, 217, 132, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(0, 217, 132, 0.3)',
              borderRadius: wp(14),
              paddingVertical: 12,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#00D984',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 8,
            }}>
              <Text style={{ fontSize: 22, marginRight: 10 }}>{beverageToast.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '800' }}>
                  ✓ {beverageToast.name} ajouté
                </Text>
                <Text style={{ color: '#8892A0', fontSize: fp(10), marginTop: 2 }}>
                  {beverageToast.effectiveMl}ml effectifs • {beverageToast.kcal} kcal
                </Text>
              </View>
              <DropletIcon size={18} />
            </View>
          </View>
        )}

        {/* ===== TOOLTIP OVERLAY — Tutoriel guidé ===== */}
        <TooltipOverlay />
      </View>
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================
const s = StyleSheet.create({
  // === HEADER ===
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(14),
    paddingTop: wp(8),
    paddingBottom: wp(8),
  },
  moodBtn: { position: 'relative' },
  moodCircle: {
    width: wp(36), height: wp(36), borderRadius: wp(18),
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderWidth: wp(1.5), borderColor: '#00D984',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  moodBadge: {
    position: 'absolute', top: -3, right: -3,
    width: wp(12), height: wp(12), borderRadius: wp(6),
    backgroundColor: '#FF8C42',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#1E2530',
  },
  lixBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(21, 27, 35, 0.8)',
    paddingHorizontal: wp(10), paddingVertical: wp(5),
    borderRadius: wp(18),
    borderWidth: 1, borderColor: 'rgba(62, 72, 85, 0.5)',
  },
  lixCount: { color: '#EAEEF3', fontSize: fp(14), fontWeight: '700' },
  lixLabel: { color: '#8892A0', fontSize: fp(10), fontWeight: '500', marginLeft: wp(3) },
  notifBadge: {
    position: 'absolute', top: -5, right: -7,
    backgroundColor: '#FF3B30', borderRadius: 7,
    width: 14, height: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#1E2530',
  },
  notifBadgeText: { color: '#FFF', fontSize: fp(8), fontWeight: '800' },

  // === SECTION TITLES ===
  sectionSubtitle: {
    color: '#00D984', fontSize: 11, fontWeight: '600',
    letterSpacing: 2, textAlign: 'center', marginBottom: 14,
  },
  sectionTitle: {
    color: '#EAEEF3', fontSize: 15, fontWeight: '700',
    letterSpacing: 0.5, marginTop: 18, marginBottom: 8, marginLeft: 4,
  },
  sectionTitleText: {
    color: '#EAEEF3', fontSize: 15, fontWeight: '700',
    letterSpacing: 0.5,
  },

  // === GLASS CARD ===
  glassCard: {
    borderRadius: 16, padding: 16,
    backgroundColor: 'rgba(21,27,35,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(62, 72, 85, 0.5)',
    borderTopColor: 'rgba(138,146,160,0.20)',
    borderLeftColor: 'rgba(107,123,141,0.10)',
    borderRightColor: 'rgba(42,48,59,0.20)',
    borderBottomColor: 'rgba(26,31,38,0.30)',
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardShine: {
    position: 'absolute', top: 0, left: 14, right: 14,
    height: 1, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // === ENERGY CARD ===
  cardLabel: {
    color: '#EAEEF3', fontSize: 12, fontWeight: '800', letterSpacing: 2.5,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
  },
  statusDot: {
    width: 10, height: 10, borderRadius: 5, marginRight: 8,
  },
  bigNumber: { color: '#00D984', fontSize: 38, fontWeight: '800' },
  bigUnit: { color: '#555E6C', fontSize: 16, fontWeight: '600' },
  cardHint: { color: '#555E6C', fontSize: 12, marginTop: 8 },

  // === PROGRESS BAR ===
  progressBg: {
    height: wp(8), borderRadius: wp(4), marginTop: wp(12),
    backgroundColor: 'rgba(80,95,115,0.15)',
    overflow: 'hidden', position: 'relative',
  },
  progressFill: { height: '100%', borderRadius: wp(4) },
  progressText: {
    position: 'absolute', right: 0, top: -18,
    color: '#8892A0', fontSize: fp(11), fontWeight: '700',
  },

  // === ECG LEGEND ===
  legendRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 14,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(80,95,115,0.08)',
  },
  legendItem: { alignItems: 'center', flex: 1 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  legendLabel: { color: '#8892A0', fontSize: 10, fontWeight: '500' },
  legendValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },

  // === HYDRATION CARD (compact) ===
  hydrationCard: {
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(62,72,85,0.3)',
    padding: 14, marginTop: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  hydrationTitle: {
    color: '#EAEEF3', fontSize: fp(12), fontWeight: '700', letterSpacing: wp(1),
  },
  hydrationLiters: {
    color: '#4DA6FF', fontSize: fp(13), fontWeight: '800',
  },
  hydroBar: {
    height: wp(8), borderRadius: wp(4), marginTop: wp(8),
    backgroundColor: '#2A3040', overflow: 'hidden',
  },
  hydroBarFill: {
    height: '100%', borderRadius: 4,
    shadowColor: '#00BFA6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  hydroGlasses: { color: '#8892A0', fontSize: fp(10) },
  hydroPercent: { color: '#4DA6FF', fontSize: fp(11), fontWeight: '700' },

  // === HYDRATION MODAL ===
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  modalTitle: {
    color: '#EAEEF3', fontSize: 18, fontWeight: '800', letterSpacing: 2,
  },
  hydroModalSubtitle: {
    color: '#8892A0', fontSize: 13, fontWeight: '600', letterSpacing: 1.5,
    textAlign: 'center', marginTop: 12, lineHeight: 20,
  },
  hydroBigCount: { fontSize: 26, fontWeight: '800', marginTop: 8 },
  addWaterBtn: {
    backgroundColor: '#00D984', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 40, marginTop: 20,
  },
  addWaterBtnText: {
    color: '#0C1219', fontSize: 14, fontWeight: '800', letterSpacing: 1,
  },
  qtyBtn: {
    backgroundColor: 'rgba(21,27,35,0.7)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(62,72,85,0.3)',
    paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center',
  },
  qtyBtnText: { color: '#C0C8D4', fontSize: 12, fontWeight: '600', marginTop: 4 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  resetBtn: {
    marginTop: 30, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(80,95,115,0.2)',
    paddingVertical: 12, paddingHorizontal: 30,
  },
  resetBtnText: { color: '#8892A0', fontSize: 12, fontWeight: '600' },

  // === FUN BUTTONS (Mood + Spin) ===
  funButton: {
    flex: 1, borderRadius: 14, paddingVertical: 14,
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderWidth: 1, borderColor: 'rgba(80,95,115,0.10)',
    alignItems: 'center', position: 'relative',
  },
  funBtnText: {
    color: '#EAEEF3', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 4,
  },
  funBtnSub: { color: '#555E6C', fontSize: 9, marginTop: 2 },
  funBadge: {
    position: 'absolute', top: 6, right: 8,
    backgroundColor: '#00D984', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },

  // === MEAL CARD ===
  mealPhoto: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: 'rgba(0, 217, 132, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 132, 0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  mealName: { color: '#EAEEF3', fontSize: 15, fontWeight: '700' },
  mealMeta: { color: '#555E6C', fontSize: 12, marginTop: 3 },
  macroTag: { color: '#8892A0', fontSize: 11, fontWeight: '600' },

  // === ADVICE CARD ===
  adviceText: { color: '#8892A0', fontSize: 12, fontStyle: 'italic', lineHeight: 20 },
  adviceLink: {
    flexDirection: 'row', alignItems: 'center', marginTop: 10,
  },
  adviceLinkText: { color: '#00D984', fontSize: 13, fontWeight: '600' },

  // === ACTIVITY SUGGESTION ===
  surplusText: { color: '#FF6B4A', fontSize: 14, fontWeight: '700' },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  activityText: { flex: 1, color: '#C0C8D4', fontSize: 13 },
  activityKcal: { color: '#00D984', fontSize: 13, fontWeight: '700' },

  // === LOCK OVERLAY ===
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(12,18,25,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  lockText: { color: '#C0C8D4', fontSize: 13, fontWeight: '600', marginTop: 6 },
  lockPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  lockPrice: { color: '#00D984', fontSize: 13, fontWeight: '700' },
  lockOr: { color: '#555E6C', fontSize: 11 },
  lockPremium: { color: '#D4AF37', fontSize: 13, fontWeight: '700' },

  // === BOTTOM TAB BAR ===
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#141A22',
    borderTopWidth: 1,
    borderTopColor: 'rgba(74,79,85,0.5)',
    paddingTop: wp(10),
    paddingBottom: Platform.OS === 'android' ? 20 : 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 20,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: wp(4),
  },
  tabLabel: {
    color: '#6B7B8D', fontSize: fp(9), fontWeight: '600', letterSpacing: wp(0.3), marginTop: -2,
  },
  tabLabelActive: { color: '#00D984' },
  tabLock: {
    position: 'absolute', top: -3, right: -6,
    backgroundColor: 'rgba(21,27,35,0.9)', borderRadius: 6,
    width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
  },

  // === MINUS BUTTON (hydration) ===
  minusBtn: {
    marginTop: 6, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(30,35,45,0.8)',
    borderWidth: 1, borderColor: 'rgba(255,59,48,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  minusBtnText: {
    color: '#FF3B30', fontSize: 18, fontWeight: '700', lineHeight: 20,
  },

  // === ADD BEVERAGE BUTTON (PRO) ===
  addBeverageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(21,27,35,0.8)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
    paddingVertical: 14, paddingHorizontal: 24, marginTop: 18,
  },
  addBeverageBtnText: {
    color: '#C0C8D4', fontSize: 13, fontWeight: '700', letterSpacing: 0.5,
  },
  proBadgeLg: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
});
