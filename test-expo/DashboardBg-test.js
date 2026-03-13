// LIXUM - Dashboard Background Test — Nebula Grid Premium
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que les autres fichiers test

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  View, Dimensions, Text, StyleSheet, StatusBar, Alert, Pressable,
  Animated as RNAnimated, ScrollView, TouchableOpacity, Platform, Modal, Easing,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Rect, Path, G, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon, ClipPath, Ellipse, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width: W, height: H } = Dimensions.get('window');

// ============================================
// UTILITAIRE — pseudo-random deterministe
// ============================================
const seededRandom = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
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
// COMPOSANT — Header Global (Mood + LIXUM + Lix)
// ============================================================
const Header = ({ moodFilled, lixCount, notifCount = 0, onMoodPress, onLixPress }) => {
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

  return (
    <View style={s.header}>
      {/* Mood icon — gauche */}
      <TouchableOpacity onPress={onMoodPress} activeOpacity={0.7} style={s.moodBtn}>
        <RNAnimated.View style={{ transform: [{ rotate: moodFilled ? '0deg' : rotate }] }}>
          <View style={s.moodCircle}>
            <Text style={{ fontSize: 20 }}>{moodFilled ? '\u{1F60A}' : '\u{1F636}'}</Text>
          </View>
        </RNAnimated.View>
        {!moodFilled && (
          <View style={s.moodBadge}>
            <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>!</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Logo LIXUM — centre */}
      <Text style={s.logoText}>LIXUM</Text>

      {/* Lix counter — droite */}
      <TouchableOpacity onPress={onLixPress} activeOpacity={0.7} style={s.lixBtn}>
        <View style={{ position: 'relative', marginRight: 5 }}>
          <LixCoinIcon size={18} />
          {notifCount > 0 && (
            <View style={s.notifBadge}>
              <Text style={s.notifBadgeText}>{notifCount}</Text>
            </View>
          )}
        </View>
        <Text style={s.lixCount}>{lixCount.toLocaleString('fr-FR')}</Text>
        <Text style={s.lixLabel}>Lix</Text>
      </TouchableOpacity>
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
            top: 10, right: 10,
            width: 18, height: 18,
            borderRadius: 9,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#8892A0', fontSize: 10, fontWeight: '600', marginTop: -1 }}>›</Text>
          </View>
          {children}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const metalStyles = StyleSheet.create({
  outerBorder: {
    borderRadius: 18,
    padding: 1.2,
    backgroundColor: '#4A4F55',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    marginHorizontal: 14,
    marginBottom: 12,
  },
  innerGradient: {
    borderRadius: 17,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 17,
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
  const glowRadius = coreRadius + (maxGlowRadius - coreRadius) * (percentage / 100);

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
          backgroundColor: 'rgba(13, 17, 23, 0.45)',
          borderWidth: 1, borderColor: color + '30',
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
const CARD_MARGIN = 14;
const CARD_PAD = 16;
const DNA_WIDTH = 60;
const GAP = 4;
const TOTAL_SIDES = (CARD_MARGIN + CARD_PAD + 1.2) * 2;
const REACTOR_SIZE = Math.min(
  Math.floor((W - TOTAL_SIDES - DNA_WIDTH - GAP * 2) / 2),
  95
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
const HydrationCardCompact = ({ currentMl, goalMl, gender, onPress, sportAlert }) => {
  const percent = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  const glasses = Math.round(currentMl / 250);
  const totalGlasses = Math.round(goalMl / 250);
  const liters = (currentMl / 1000).toFixed(1);
  const goalL = (goalMl / 1000).toFixed(1);

  return (
      <MetalCard style={{ marginHorizontal: 0, marginBottom: 12 }} onPress={onPress}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Mini silhouette gauche */}
          <SilhouetteFill fillPercent={percent} height={56} gender={gender} />

          {/* Infos droite */}
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <DropletIcon size={16} />
                <Text style={s.hydrationTitle}>HYDRATATION</Text>
              </View>
              <Text style={s.hydrationLiters}>{liters} / {goalL}L</Text>
            </View>

            {/* Barre de progression */}
            <View style={s.hydroBar}>
              <LinearGradient
                colors={['#4DA6FF', '#00BCD4']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.hydroBarFill, { width: percent + '%' }]}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
              <Text style={s.hydroGlasses}>{glasses}/{totalGlasses} verres 🥛</Text>
              <Text style={s.hydroPercent}>{percent}%</Text>
            </View>

            {/* Sport water loss alert */}
            {sportAlert ? (
              <Text style={{ color: '#FF8C42', fontSize: 10, marginTop: 4 }}>{sportAlert}</Text>
            ) : (
              <Text style={{ color: '#555E6C', fontSize: 10, marginTop: 4 }}>Tap pour ajouter →</Text>
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
const HydrationModal = ({ visible, onClose, currentMl, setCurrentMl, goalMl, gender, hydroLogs, setHydroLogs }) => {
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
      <View style={{ flex: 1, backgroundColor: '#0C1219' }}>
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
            <Text style={s.hydroModalSubtitle}>MON HYDRATATION{'\n'}AUJOURD'HUI</Text>

            {/* Grande silhouette avec marqueurs + bulles */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
              <SilhouetteFill fillPercent={percent} height={220} gender={gender} showBubbles />
              {/* Marqueurs paliers */}
              <View style={{ marginLeft: 16, height: 220, justifyContent: 'space-between', paddingVertical: 8 }}>
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

            {/* Compteur */}
            <Text style={s.hydroBigCount}>
              <Text style={{ color: '#4DA6FF' }}>{currentMl.toLocaleString('fr-FR')}</Text>
              <Text style={{ color: '#555E6C' }}> / {goalMl.toLocaleString('fr-FR')} ml</Text>
            </Text>

            {/* Barre large */}
            <View style={[s.hydroBar, { width: W - 64, height: 10, marginTop: 10 }]}>
              <LinearGradient
                colors={['#4DA6FF', '#00BCD4']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.hydroBarFill, { width: percent + '%', height: 10 }]}
              />
            </View>
            <Text style={{ color: '#4DA6FF', fontSize: 14, fontWeight: '700', marginTop: 6 }}>{percent}% • {glasses}/{totalGlasses} verres</Text>

            {/* Low hydration warning */}
            {percent < 30 && percent > 0 && (
              <View style={{ backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 10, padding: 10, marginTop: 10, width: W - 64 }}>
                <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                  ⚠️ Pensez à vous réhydrater ! 💧
                </Text>
              </View>
            )}

            {/* Boutons quantité avec + (tap) et − */}
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 20 }}>
              {quantities.map((item) => (
                <View key={item.ml} style={{ alignItems: 'center' }}>
                  <TouchableOpacity style={s.qtyBtn} activeOpacity={0.7} onPress={() => addWater(item.ml)}>
                    <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                    <Text style={s.qtyBtnText}>{item.label}</Text>
                  </TouchableOpacity>
                  {/* Bouton minus */}
                  <TouchableOpacity style={s.minusBtn} activeOpacity={0.7} onPress={() => removeWater(item.ml)}>
                    <Text style={s.minusBtnText}>−</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Bouton AJOUTER BOISSONS — PRO */}
            <TouchableOpacity style={s.addBeverageBtn} activeOpacity={0.7}>
              <Text style={s.addBeverageBtnText}>AJOUTER BOISSONS 🥤</Text>
              <View style={s.proBadgeLg}>
                <Ionicons name="lock-closed" size={10} color="#D4AF37" />
                <Text style={{ color: '#D4AF37', fontSize: 10, fontWeight: '800', marginLeft: 3 }}>PRO</Text>
              </View>
            </TouchableOpacity>
            <Text style={{ color: '#555E6C', fontSize: 10, marginTop: 4, textAlign: 'center' }}>
              L'IA analyse la composition en eau de toute boisson
            </Text>

            {/* Historique */}
            <View style={{ width: W - 64, marginTop: 24 }}>
              <Text style={{ color: '#8892A0', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 10 }}>━ Historique aujourd'hui ━</Text>
              {hydroLogs.map((log, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                  <Text style={{ color: '#555E6C', fontSize: 12, width: 50 }}>{log.time}</Text>
                  <Text style={{ fontSize: 14 }}>{log.icon || '💧'}</Text>
                  <Text style={{ color: log.amount < 0 ? '#FF8C42' : '#C0C8D4', fontSize: 13, marginLeft: 6, flex: 1 }}>
                    {log.amount > 0 ? '+' : ''}{log.amount}ml {log.type}
                  </Text>
                </View>
              ))}
              {hydroLogs.length === 0 && (
                <Text style={{ color: '#555E6C', fontSize: 12, fontStyle: 'italic' }}>Aucune entrée aujourd'hui</Text>
              )}
            </View>

            {/* Réinitialiser */}
            <TouchableOpacity
              style={s.resetBtn}
              activeOpacity={0.7}
              onPress={() => { setCurrentMl(0); }}
            >
              <Text style={s.resetBtnText}>🔄 RÉINITIALISER</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// SectionDivider supprimé — espacement uniforme 12px entre cartes

// ScrollableMetricCards supprimé — mini-cartes retirées pour épuration

// ============================================================
// COMPOSANT — Dashboard Content (page Accueil)
// ============================================================
const DashboardContent = ({ onHydrationPress, hydrationMl, hydrationGoal, gender, burnedExtra, sportAlert, consumedTotal, burnedTotal }) => {
  const streakDays = 12;
  const streakColor = streakDays >= 14 ? '#D4AF37'
    : streakDays >= 7 ? '#00D984'
    : streakDays >= 3 ? '#00BFA6' : '#8892A0';

  // Reste = Objectif - (Consommé - Brûlé total) → 2330 - (1585 - 870) = 1615
  const remaining = Math.max(0, DAILY_OBJECTIVE - (consumedTotal - burnedTotal));

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 35, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ====== CARTE PRINCIPALE — Bilan Énergétique Area Fill ====== */}
      <MetalCard style={{ marginHorizontal: 0, marginBottom: 12 }}>
        {/* HEADER — une seule ligne, tout aligné */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <Text style={{
            fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
            fontSize: 9,
            fontWeight: '800',
            letterSpacing: 2,
            color: '#8892A0',
          }}>BILAN ÉNERGÉTIQUE</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '800',
              color: '#00D984',
              textShadowColor: 'rgba(0, 217, 132, 0.3)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
            }}>{DAILY_OBJECTIVE.toLocaleString('fr-FR')} kcal</Text>
            <View style={{
              width: 5, height: 5, borderRadius: 2.5,
              backgroundColor: '#00D984', marginLeft: 4,
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
          <ReactorCore
            size={REACTOR_SIZE}
            value={consumedTotal}
            percentage={Math.round((consumedTotal / DAILY_OBJECTIVE) * 100)}
            label="Consommé"
            color="#FF8C42"
            colorLight="#FFB87A"
            colorDark="#CC6020"
            clockwise={true}
          />

          {/* ADN CENTRAL — Score Vitalité (125% de REACTOR_SIZE) */}
          <DnaHelix height={REACTOR_SIZE * 1.25} width={DNA_WIDTH} />

          {/* RÉACTEUR DROIT — Reste (sens antihoraire) */}
          <ReactorCore
            size={REACTOR_SIZE}
            value={remaining}
            percentage={Math.round((remaining / DAILY_OBJECTIVE) * 100)}
            label="Reste"
            color="#4DA6FF"
            colorLight="#8DCAFF"
            colorDark="#2B7ACC"
            clockwise={false}
          />
        </View>

        {/* ===== LABELS — version épurée ===== */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 0,
          marginTop: 10,
        }}>
          {/* Consommé */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: 15,
              fontWeight: '800',
              color: '#FF8C42',
              textShadowColor: 'rgba(255, 140, 66, 0.2)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
            }}>{Math.round((consumedTotal / DAILY_OBJECTIVE) * 100)}%</Text>
            <Text style={{
              fontSize: 9, fontWeight: '600', color: '#8892A0', marginTop: 2,
            }}>Consommé</Text>
            <Text style={{
              fontSize: 8,
              fontWeight: '700',
              color: '#FF3B30',
              marginTop: 3,
            }}>- 870 Kcal/Sport</Text>
          </View>

          {/* Vitalité */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: 15,
              fontWeight: '900',
              color: '#00D984',
              textShadowColor: 'rgba(0, 217, 132, 0.4)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 6,
            }}>84</Text>
            <Text style={{
              fontSize: 8, fontWeight: '700', color: '#D4AF37', marginTop: 2,
              letterSpacing: 1.5,
            }}>VITALITÉ</Text>
          </View>

          {/* Reste */}
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: 15,
              fontWeight: '800',
              color: '#4DA6FF',
              textShadowColor: 'rgba(77, 166, 255, 0.2)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4,
            }}>{Math.round((remaining / DAILY_OBJECTIVE) * 100)}%</Text>
            <Text style={{
              fontSize: 9, fontWeight: '600', color: '#8892A0', marginTop: 2,
            }}>Reste</Text>
          </View>
        </View>
      </MetalCard>

      {/* ====== CARTE HYDRATATION COMPACTE ====== */}
      <HydrationCardCompact
        currentMl={hydrationMl}
        goalMl={hydrationGoal}
        gender={gender}
        onPress={onHydrationPress}
        sportAlert={sportAlert}
      />

      {/* ======================================================= */}
      {/* BELOW THE FOLD — Zone scrollable                        */}
      {/* ======================================================= */}

      {/* DERNIER REPAS */}
      <MetalCard style={{ marginHorizontal: 0, marginBottom: 12 }} onPress={() => Alert.alert('Dernier Repas', 'Détails nutritionnels complets — bientôt disponible')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <PlateIcon />
          <Text style={{
            color: '#EAEEF3',
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: 1,
            marginLeft: 8,
          }}>DERNIER REPAS</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: 'rgba(0, 217, 132, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(0, 217, 132, 0.12)',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            shadowColor: '#00D984',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 2,
          }}>
            <PlateIcon />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#EAEEF3', fontSize: 14, fontWeight: '600' }}>Poulet grillé + Riz</Text>
            <Text style={{ color: '#8892A0', fontSize: 11, marginTop: 2 }}>450 kcal • <Text style={{ color: '#EAEEF3' }}>12h30</Text></Text>
            <View style={{ flexDirection: 'row', marginTop: 4, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FF6B8A', marginRight: 4 }} />
                <Text style={{ color: '#8892A0', fontSize: 10 }}>35g P</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FFB800', marginRight: 4 }} />
                <Text style={{ color: '#8892A0', fontSize: 10 }}>20g G</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4DA6FF', marginRight: 4 }} />
                <Text style={{ color: '#8892A0', fontSize: 10 }}>15g L</Text>
              </View>
            </View>
          </View>
        </View>
      </MetalCard>

      {/* COACH LIXMAN */}
      <MetalCard style={{ marginHorizontal: 0, marginBottom: 12 }} onPress={() => Alert.alert('Coach LixMan', 'Recommandations personnalisées IA — bientôt disponible')}>
        {/* Header Coach */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {/* Icône robot/coach — petit cercle émeraude avec un "L" */}
          <View style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: 'rgba(0, 217, 132, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(0, 217, 132, 0.25)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: 12,
              fontWeight: '900',
              color: '#00D984',
            }}>L</Text>
          </View>
          <Text style={{
            color: '#EAEEF3',
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 1,
            marginLeft: 8,
          }}>COACH LIXMAN</Text>
          {/* Badge "IA" */}
          <View style={{
            backgroundColor: 'rgba(212, 175, 55, 0.12)',
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginLeft: 8,
          }}>
            <Text style={{
              fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
              fontSize: 7,
              fontWeight: '800',
              color: '#D4AF37',
              letterSpacing: 1,
            }}>IA</Text>
          </View>
        </View>

        {/* Message du coach — une seule ligne punchy */}
        <Text style={{
          color: '#EAEEF3',
          fontSize: 12,
          lineHeight: 17,
          fontWeight: '500',
        }}>
          Déficit de <Text style={{ color: '#FF8C42', fontWeight: '700' }}>412 kcal</Text> — bonne stratégie pour la <Text style={{ color: '#00D984', fontWeight: '700' }}>perte de poids</Text> !
        </Text>

        {/* Suggestions */}
        <View style={{
          backgroundColor: 'rgba(0, 217, 132, 0.03)',
          borderRadius: 10,
          padding: 10,
          marginTop: 8,
          borderWidth: 1,
          borderColor: 'rgba(0, 217, 132, 0.06)',
        }}>
          <Text style={{ color: '#8892A0', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 4 }}>SUGGESTIONS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ color: '#00D984', fontSize: 10, marginRight: 6 }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: 11 }}>25g de protéines au prochain repas</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ color: '#00D984', fontSize: 10, marginRight: 6 }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: 11 }}>1 verre d'eau (hydratation à 60%)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#00D984', fontSize: 10, marginRight: 6 }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: 11 }}>15 min de marche pour brûler 85 kcal</Text>
          </View>
        </View>

        {/* Lien Voir Recettes */}
        <TouchableOpacity
          onPress={() => Alert.alert('Recettes', 'Recettes adaptées à votre profil — bientôt disponible')}
          activeOpacity={0.7}
        >
          <Text style={{
            color: '#00D984',
            fontSize: 11,
            fontWeight: '600',
            marginTop: 8,
          }}>
            Voir Recettes  ›
          </Text>
        </TouchableOpacity>
      </MetalCard>

      {/* SUGGESTION ACTIVITÉ (dynamique basée sur surplus) */}
      {consumedTotal - burnedExtra > DAILY_OBJECTIVE && (
        <>
          <MetalCard style={{ marginHorizontal: 0, marginBottom: 12 }}>
            <Text style={s.sectionTitle}>🏃 SUGGESTION ACTIVITÉ</Text>
            <Text style={s.surplusText}>Surplus : +{consumedTotal - burnedExtra - DAILY_OBJECTIVE} kcal</Text>
            <View style={{ gap: 8, marginTop: 10 }}>
              {suggestActivities(consumedTotal - burnedExtra - DAILY_OBJECTIVE).slice(0, 2).map((sug, i) => (
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
      <MetalCard style={{ marginHorizontal: 0, marginBottom: 12 }} onPress={() => Alert.alert(
        'Débloquer Mes Stats',
        'Accédez à vos statistiques sur 7 jours pour 200 Lix ou avec un abonnement Premium.',
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Débloquer', onPress: () => console.log('Navigate to shop') },
        ]
      )}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <StatsIcon />
          <Text style={{
            color: '#EAEEF3',
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: 1,
            marginLeft: 8,
          }}>MES STATS (7 jours)</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <LockIcon size={28} />
          <Text style={{ color: '#8892A0', fontSize: 13, fontWeight: '600', marginTop: 8 }}>Débloquer</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <LixCoinIcon size={12} />
            <Text style={{ color: '#00D984', fontSize: 13, fontWeight: '700' }}> 200 Lix</Text>
            <Text style={{ color: '#8892A0', fontSize: 12, marginHorizontal: 6 }}>ou</Text>
            <StarIcon />
            <Text style={{ color: '#D4AF37', fontSize: 13, fontWeight: '700' }}> Premium</Text>
          </View>
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
  { key: 'calendar', label: 'Calendrier', iconActive: 'calendar', iconInactive: 'calendar-outline', locked: true },
  { key: 'profile', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

const BottomTabs = ({ activeTab, onTabPress }) => (
  <LinearGradient
    colors={['rgba(30, 37, 48, 0)', 'rgba(26, 32, 41, 0.92)', '#181E26']}
    locations={[0, 0.4, 1]}
    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
    style={s.tabBar}
  >
    {/* Séparateur métallique */}
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, backgroundColor: 'rgba(74, 79, 85, 0.4)' }} />
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
            <Ionicons
              name={active ? tab.iconActive : tab.iconInactive}
              size={22}
              color={active ? '#00D984' : '#6B7B8D'}
            />
            {tab.locked && (
              <View style={s.tabLock}>
                <LockIcon size={10} />
              </View>
            )}
          </View>
          <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </LinearGradient>
);

// ============================================================
// APP PRINCIPAL
// ============================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [moodFilled, setMoodFilled] = useState(false);
  const [hydrationMl, setHydrationMl] = useState(1500);
  const [hydroModalVisible, setHydroModalVisible] = useState(false);
  const [surplusAlertVisible, setSurplusAlertVisible] = useState(false);
  const [hydroLogs, setHydroLogs] = useState([
    { time: '08:30', amount: 250, type: 'eau', icon: '💧' },
    { time: '10:15', amount: 500, type: 'eau', icon: '💧' },
    { time: '12:45', amount: 250, type: 'eau', icon: '💧' },
    { time: '15:00', amount: 500, type: 'eau', icon: '💧' },
  ]);

  // Mock sport activities done today
  const [activities, setActivities] = useState([
    { name: 'course', durationMin: 40, intensity: 'intense', kcalBurned: 573 },
  ]);

  const lixCount = 150;
  const notifCount = 1;
  const gender = 'homme';
  const hydrationGoal = gender === 'homme' ? 2500 : 2000;

  // Calorie logic
  const consumedTotal = 1585; // mock — from scanned meals
  const burnedExtra = activities.reduce((sum, a) => sum + a.kcalBurned, 0);
  const burnedTotal = 870; // BMR spread + sport
  const surplus = Math.max(0, consumedTotal - burnedExtra - DAILY_OBJECTIVE);

  // Sport → hydration water loss
  const sportWaterLoss = activities.reduce((sum, a) => sum + calculateWaterLoss(a.durationMin, a.intensity), 0);
  const sportAlert = sportWaterLoss > 0
    ? `🏃 -${sportWaterLoss}ml (${activities.map(a => ACTIVITY_LABELS[a.name] || a.name).join(', ')})`
    : null;

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
          />
        );
      case 'meals':
        return <PlaceholderPage icon={'🍽️'} title="Repas" />;
      case 'activity':
        return <PlaceholderPage icon={'🏃'} title="Activité" />;
      case 'calendar':
        return <PlaceholderPage icon={'📅'} title="Calendrier" locked />;
      case 'profile':
        return <PlaceholderPage icon={'👤'} title="Profil" />;
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
            lixCount={lixCount}
            notifCount={notifCount}
            onMoodPress={() => setMoodFilled(!moodFilled)}
            onLixPress={() => setActiveTab('profile')}
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
        />

        {/* Surplus alert modal */}
        <SurplusAlertModal
          visible={surplusAlertVisible}
          onClose={() => setSurplusAlertVisible(false)}
          surplus={surplus}
          onAddActivity={() => setActiveTab('activity')}
        />
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
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  moodBtn: { position: 'relative' },
  moodCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderWidth: 2, borderColor: '#00D984',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  moodBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#00D984',
    justifyContent: 'center', alignItems: 'center',
  },
  logoText: {
    color: '#EAEEF3', fontSize: 22, fontWeight: '800', letterSpacing: 4,
    textShadowColor: 'rgba(0, 217, 132, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  lixBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(21, 27, 35, 0.8)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(62, 72, 85, 0.5)',
  },
  lixCount: { color: '#EAEEF3', fontSize: 15, fontWeight: '700' },
  lixLabel: { color: '#8892A0', fontSize: 11, fontWeight: '500', marginLeft: 3 },
  notifBadge: {
    position: 'absolute', top: -5, right: -7,
    backgroundColor: '#FF3B30', borderRadius: 7,
    width: 14, height: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#1E2530',
  },
  notifBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '800' },

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
    height: 8, borderRadius: 4, marginTop: 12,
    backgroundColor: 'rgba(80,95,115,0.15)',
    overflow: 'hidden', position: 'relative',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: {
    position: 'absolute', right: 0, top: -18,
    color: '#8892A0', fontSize: 11, fontWeight: '700',
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
    color: '#EAEEF3', fontSize: 12, fontWeight: '700', letterSpacing: 1,
  },
  hydrationLiters: {
    color: '#4DA6FF', fontSize: 13, fontWeight: '800',
  },
  hydroBar: {
    height: 8, borderRadius: 4, marginTop: 8,
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
  hydroGlasses: { color: '#8892A0', fontSize: 10 },
  hydroPercent: { color: '#4DA6FF', fontSize: 11, fontWeight: '700' },

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
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 0 : 48,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4,
  },
  tabLabel: {
    color: '#6B7B8D', fontSize: 9, fontWeight: '600', letterSpacing: 0.3, marginTop: -2,
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
