// ──────────────────────────────────────────────────────────────────────────────
// ActivityPage.js — LIXUM Activity Page with Animated Walk/Run Sliders
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, Dimensions, ScrollView, Pressable, Platform,
  Animated, PixelRatio, TextInput, Alert, TouchableOpacity,
  Modal, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  G, Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { createClient } from '@supabase/supabase-js';

// ── Supabase ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ── Responsive system ────────────────────────────────────────────────────────
const { width: W } = Dimensions.get('window');
const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ── Format helpers ───────────────────────────────────────────────────────────
const formatDuration = (minutes) => {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.round((rounded / 60) * 10) / 10;
  return `${hours} h`;
};

const formatDistance = (meters) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${Math.round(meters / 100) / 10} km`;
};

// ── Activity data ────────────────────────────────────────────────────────────
const ACTIVITY_DATA = {
  marche: { kcal_per_hour: 280, icon: '🚶', label: 'Marche', color: '#00D984', km_per_hour: 5, water_per_hour_ml: 400 },
  course: { kcal_per_hour: 700, icon: '🏃', label: 'Course', color: '#00D984', km_per_hour: 8, water_per_hour_ml: 900 },
  velo: { kcal_per_hour: 500, icon: '🚴', label: 'Vélo', color: '#4DA6FF', water_per_hour_ml: 600 },
  natation: { kcal_per_hour: 600, icon: '🏊', label: 'Natation', color: '#00BCD4', water_per_hour_ml: 700 },
  musculation: { kcal_per_hour: 400, icon: '🏋️', label: 'Musculation', color: '#FF6B6B', water_per_hour_ml: 500 },
  yoga: { kcal_per_hour: 200, icon: '🧘', label: 'Yoga', color: '#B39DDB', water_per_hour_ml: 300 },
  corde: { kcal_per_hour: 800, icon: '⏭', label: 'Corde à sauter', color: '#FFD93D', water_per_hour_ml: 800 },
  football: { kcal_per_hour: 600, icon: '⚽', label: 'Football', color: '#66BB6A', water_per_hour_ml: 700 },
  basketball: { kcal_per_hour: 650, icon: '🏀', label: 'Basketball', color: '#FF7043', water_per_hour_ml: 750 },
  danse: { kcal_per_hour: 450, icon: '💃', label: 'Danse', color: '#EC407A', water_per_hour_ml: 500 },
};

const RUN_FLAGS = [
  { distance: 400, label: '400m' },
  { distance: 1000, label: '1 km' },
  { distance: 2000, label: '2 km' },
  { distance: 5000, label: '5 km' },
  { distance: 10000, label: '10 km' },
  { distance: 21000, label: '21 km' },
];

const TIME_STEPS = [5, 10, 15, 20, 30, 45, 60];

const OTHER_SPORTS = ['velo', 'natation', 'musculation', 'yoga', 'corde', 'football', 'basketball', 'danse'];

// ── Walk Immersive Trail ─────────────────────────────────────────────────────
const WALK_DISTANCE_MAP = [
  { pos: 0, meters: 0 },
  { pos: 0.02, meters: 0 },
  { pos: 0.22, meters: 500 },
  { pos: 0.42, meters: 2000 },
  { pos: 0.65, meters: 5000 },
  { pos: 0.98, meters: 10000 },
  { pos: 1.0, meters: 10000 },
];

const WALK_LANDMARKS = [
  { type: 'house', position: 0.02, label: 'Départ' },
  { type: 'tree', position: 0.22, label: '500m' },
  { type: 'bench', position: 0.42, label: '2 km' },
  { type: 'birds', position: 0.65, label: '5 km' },
  { type: 'pond', position: 0.98, label: '10 km' },
];

const walkSliderToDistance = (value) => {
  for (let i = 1; i < WALK_DISTANCE_MAP.length; i++) {
    if (value <= WALK_DISTANCE_MAP[i].pos) {
      const prev = WALK_DISTANCE_MAP[i - 1];
      const curr = WALK_DISTANCE_MAP[i];
      const t = (value - prev.pos) / (curr.pos - prev.pos);
      return prev.meters + (curr.meters - prev.meters) * t;
    }
  }
  return 10000;
};

const generateFootprints = (progress, canvasWidth, canvasHeight) => {
  const prints = [];
  const totalPrints = 20;
  const midY = canvasHeight * 0.5;
  const amplitude = canvasHeight * 0.15;

  for (let i = 0; i < totalPrints; i++) {
    const t = i / totalPrints;
    if (t > progress) break;

    const x = t * canvasWidth * 0.85 + canvasWidth * 0.08;
    const waveOffset = Math.sin(t * Math.PI * 3) * amplitude;
    const isRight = i % 2 === 0;
    const footOffset = isRight ? -5 : 5;
    const y = midY + waveOffset + footOffset;

    const distanceFromCurrent = progress - t;
    const fadeStart = 0.3;
    const opacity = distanceFromCurrent > fadeStart
      ? Math.max(0, 1 - ((distanceFromCurrent - fadeStart) / fadeStart))
      : 0.8;

    prints.push({ x, y, isRight, opacity });
  }
  return prints;
};

// ── SVG Decor Components ─────────────────────────────────────────────────────
const FootprintSVG = ({ x, y, isRight, opacity, color = '#00D984' }) => (
  <G opacity={opacity} transform={`translate(${x}, ${y}) rotate(${isRight ? 15 : -15})`}>
    <Ellipse cx={0} cy={0} rx={4} ry={6} fill={color} opacity={0.7} />
    <Circle cx={isRight ? 2 : -2} cy={-6} r={1.5} fill={color} opacity={0.6} />
    <Circle cx={0} cy={-7} r={1.5} fill={color} opacity={0.6} />
    <Circle cx={isRight ? -2 : 2} cy={-6} r={1.5} fill={color} opacity={0.6} />
  </G>
);

const HouseIcon = ({ x, y }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Path d="M0 -8 L8 0 L-8 0 Z" fill="#8892A0" opacity={0.6} />
    <Rect x={-5} y={0} width={10} height={8} fill="#8892A0" opacity={0.4} />
    <Rect x={-2} y={3} width={4} height={5} fill="#5A6070" opacity={0.5} />
    <Rect x={3} y={1} width={3} height={3} fill="#D4AF37" opacity={0.3} />
  </G>
);

const TreeIcon = ({ x, y, passed }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Rect x={-1.5} y={0} width={3} height={8} fill="#8B6914" opacity={0.6} />
    <Circle cx={0} cy={-4} r={7} fill="#00D984" opacity={passed ? 0.4 : 0.25} />
    <Circle cx={-4} cy={-2} r={5} fill="#00D984" opacity={passed ? 0.35 : 0.2} />
    <Circle cx={4} cy={-2} r={5} fill="#00D984" opacity={passed ? 0.35 : 0.2} />
    {passed && (
      <Ellipse cx={6} cy={4} rx={2} ry={1} fill="#00D984" opacity={0.3}
        transform="rotate(45, 6, 4)" />
    )}
  </G>
);

const BenchIcon = ({ x, y }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Rect x={-8} y={-1} width={16} height={2} rx={1} fill="#8892A0" opacity={0.5} />
    <Rect x={-7} y={-5} width={14} height={2} rx={1} fill="#8892A0" opacity={0.4} />
    <Line x1={-6} y1={1} x2={-6} y2={5} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={6} y1={1} x2={6} y2={5} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={-6} y1={-5} x2={-6} y2={-1} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={6} y1={-5} x2={6} y2={-1} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
  </G>
);

const BirdsIcon = ({ x, y, passed }) => (
  <G transform={`translate(${x}, ${y - (passed ? 5 : 0)})`}>
    <Path d={`M${-4} ${0} Q${-2} ${-3} ${0} ${0}`} fill="none" stroke="#8892A0" strokeWidth={1.2} opacity={passed ? 0.3 : 0.5} />
    <Path d={`M${3} ${-4} Q${5} ${-7} ${7} ${-4}`} fill="none" stroke="#8892A0" strokeWidth={1.2} opacity={passed ? 0.25 : 0.45} />
    <Path d={`M${-7} ${-3} Q${-5} ${-6} ${-3} ${-3}`} fill="none" stroke="#8892A0" strokeWidth={1} opacity={passed ? 0.2 : 0.4} />
  </G>
);

const PondIcon = ({ x, y }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Ellipse cx={0} cy={4} rx={14} ry={8} fill="#4DA6FF" opacity={0.15} />
    <Ellipse cx={0} cy={4} rx={12} ry={6} fill="#4DA6FF" opacity={0.1} />
    <Path d="M-8 3 Q-4 1 0 3 Q4 5 8 3" fill="none" stroke="#4DA6FF" strokeWidth={0.8} opacity={0.3} />
    <Path d="M-6 6 Q-2 4 2 6 Q6 8 10 6" fill="none" stroke="#4DA6FF" strokeWidth={0.6} opacity={0.2} />
    <Ellipse cx={0} cy={1} rx={4} ry={2.5} fill="#FFB800" opacity={0.6} />
    <Circle cx={-3} cy={-1} r={2.5} fill="#FFB800" opacity={0.6} />
    <Path d="M-5.5 -1 L-7 -0.5 L-5.5 0" fill="#FF8C42" opacity={0.7} />
    <Circle cx={-3.5} cy={-1.5} r={0.6} fill="#0D1117" />
  </G>
);

// ── LockIcon ─────────────────────────────────────────────────────────────────
const LockIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill="#8892A0" opacity={0.6} />
    <Path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill="#EAEEF3" />
  </Svg>
);

// ── Bottom Tabs ──────────────────────────────────────────────────────────────
const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'medicai', label: 'MedicAi', iconActive: 'medkit', iconInactive: 'medkit-outline', locked: true, isMedicAi: true },
  { key: 'profile', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

const BottomTabs = ({ activeTab, onTabPress }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#141A22',
      borderTopWidth: 1,
      borderTopColor: 'rgba(74,79,85,0.5)',
      paddingTop: wp(10),
      paddingBottom: Platform.OS === 'android' ? 50 : 34,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 20,
    }}
  >
    {TABS.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: wp(4) }}
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
              <View style={{
                position: 'absolute', top: -3, right: -6,
                backgroundColor: 'rgba(21,27,35,0.9)', borderRadius: 6,
                width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
              }}>
                <LockIcon size={10} />
              </View>
            )}
          </View>
          <Text style={[
            { color: '#6B7B8D', fontSize: fp(9), fontWeight: '600', letterSpacing: wp(0.3), marginTop: -2 },
            active && (tab.isMedicAi ? { color: '#FF3B5C' } : { color: '#00D984' }),
            tab.isMedicAi && !active && { color: '#8892A0' },
          ]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ── MetalCard ────────────────────────────────────────────────────────────────
const MetalCard = ({ children, style, onPress, noPadding = false }) => {
  if (!onPress) {
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
    marginBottom: wp(8),
  },
  innerGradient: {
    borderRadius: wp(17),
    overflow: 'hidden',
  },
  cardContent: {
    padding: 8,
    paddingTop: 6,
    paddingBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: wp(17),
  },
});

// ── SectionTitle ─────────────────────────────────────────────────────────────
const SectionTitle = ({ title, rightAction, rightLabel }) => (
  <View style={{
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: wp(16), marginBottom: wp(4),
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 3, height: 18, borderRadius: 1.5,
        backgroundColor: '#00D984', marginRight: 8,
      }} />
      <Text style={{
        color: '#EAEEF3', fontSize: fp(14), fontWeight: '800',
        letterSpacing: 2, textTransform: 'uppercase',
      }}>
        {title}
      </Text>
    </View>
    {rightLabel && (
      <Pressable onPressIn={rightAction}>
        <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>
          {rightLabel}
        </Text>
      </Pressable>
    )}
  </View>
);

// ── MetallicBackground ───────────────────────────────────────────────────────
const MetallicBackground = () => (
  <LinearGradient
    colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
    locations={[0, 0.25, 0.5, 0.75, 1]}
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
  />
);

// ── FIX 2: SVG Sneaker Icons ─────────────────────────────────────────────────
const WalkShoeIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M8 28 L8 20 Q8 16 12 15 L22 13 Q26 12 28 14 L32 16 Q36 18 36 22 L36 26 Q36 30 32 30 L12 30 Q8 30 8 28Z"
      fill="none" stroke="#00D984" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 15 L14 10 Q14 8 16 8 L20 8 Q22 8 22 10 L22 13"
      fill="none" stroke="#00D984" strokeWidth={2} strokeLinecap="round" />
    <Line x1="16" y1="18" x2="16" y2="14" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Line x1="20" y1="17" x2="20" y2="13" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Path d="M10 28 L34 28" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    <Line x1="2" y1="22" x2="6" y2="22" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.4} />
    <Line x1="1" y1="25" x2="5" y2="25" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
    <Line x1="3" y1="19" x2="6" y2="19" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.3} />
  </Svg>
);

const RunShoeIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path d="M6 26 L10 17 Q12 13 16 12 L24 10 Q28 9 30 12 L34 16 Q38 19 36 23 L34 27 Q32 30 28 30 L10 30 Q6 30 6 26Z"
      fill="none" stroke="#00D984" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 12 L18 6 Q19 4 21 5 L24 7 Q25 8 24 10"
      fill="none" stroke="#00D984" strokeWidth={2} strokeLinecap="round" />
    <Line x1="18" y1="15" x2="17" y2="11" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Line x1="22" y1="14" x2="21" y2="10" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Path d="M8 28 L30 28" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    <Line x1="0" y1="20" x2="5" y2="20" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
    <Line x1="-1" y1="23" x2="4" y2="23" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
    <Line x1="1" y1="17" x2="5" y2="17" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
    <Line x1="-2" y1="26" x2="3" y2="26" stroke="#00D984" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
  </Svg>
);

const WalkShoeAnimated = ({ shoeAnim }) => {
  const bounce = shoeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  return (
    <Animated.View style={{ transform: [{ translateY: bounce }] }}>
      <WalkShoeIcon size={wp(28)} />
    </Animated.View>
  );
};

const RunShoeAnimated = ({ shoeAnim }) => {
  const bounce = shoeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });
  return (
    <Animated.View style={{ transform: [{ translateY: bounce }] }}>
      <RunShoeIcon size={wp(28)} />
    </Animated.View>
  );
};

// ── FIX 3: Non-linear slider distance interpolation ─────────────────────────
const sliderToDistance = (sliderValue, flags) => {
  const maxIdx = flags.length - 1;
  const pos = sliderValue * maxIdx;
  const segmentIndex = Math.min(Math.floor(pos), maxIdx - 1);
  const segmentProgress = pos - segmentIndex;
  const fromFlag = flags[Math.min(segmentIndex, maxIdx)];
  const toFlag = flags[Math.min(segmentIndex + 1, maxIdx)];
  return fromFlag.distance + (toFlag.distance - fromFlag.distance) * segmentProgress;
};

// ── Custom Slider (Walk / Run) ───────────────────────────────────────────────
const ActivitySlider = ({
  type,
  mode,
  value,
  onChange,
  shoeAnim,
  flags,
  maxDistance,
  maxTime,
  accentColor,
}) => {
  const barRef = useRef(null);
  const [barWidth, setBarWidth] = useState(0);
  const [barX, setBarX] = useState(0);

  const isWalk = type === 'marche';
  const trackBg = isWalk ? 'rgba(0,217,132,0.08)' : 'rgba(255,140,66,0.08)';
  const trackLineColor = isWalk ? 'rgba(0,217,132,0.15)' : 'rgba(255,255,255,0.12)';

  const handleTouch = (evt) => {
    const touchX = evt.nativeEvent.pageX - barX;
    const clamped = Math.max(0, Math.min(1, touchX / barWidth));
    onChange(clamped);
  };

  const flagList = mode === 'distance' ? flags : TIME_STEPS;

  return (
    <View style={{ marginTop: wp(12) }}>
      {/* Slider track */}
      <View
        ref={barRef}
        onLayout={(e) => {
          setBarWidth(e.nativeEvent.layout.width);
          barRef.current?.measureInWindow?.((x) => setBarX(x));
          if (e.nativeEvent.layout.x !== undefined) {
            barRef.current?.measure?.((fx, fy, fw, fh, px) => {
              if (px !== undefined) setBarX(px);
            });
          }
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderMove={handleTouch}
        onResponderRelease={handleTouch}
        onResponderStart={handleTouch}
        style={{
          height: wp(50),
          backgroundColor: trackBg,
          borderRadius: wp(12),
          overflow: 'hidden',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: isWalk ? 'rgba(0,217,132,0.12)' : 'rgba(255,140,66,0.12)',
        }}
      >
        {/* Track ruler lines */}
        {isWalk ? (
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row' }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <View key={i} style={{
                width: 1, height: '100%',
                backgroundColor: trackLineColor,
                marginLeft: i === 0 ? 0 : (barWidth || 200) / 30,
              }} />
            ))}
          </View>
        ) : (
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}>
            {[0.25, 0.5, 0.75].map((pos, i) => (
              <View key={i} style={{
                position: 'absolute', left: 0, right: 0,
                top: `${pos * 100}%`,
                height: 1,
                backgroundColor: trackLineColor,
              }} />
            ))}
          </View>
        )}

        {/* FIX 3: Flag markers — equally spaced */}
        {flagList.map((flag, idx) => {
          const equalPos = flagList.length > 1 ? idx / (flagList.length - 1) : 0;

          // Find nearest flag to current slider value
          const isNearest = (() => {
            let minDist = Infinity;
            let nearestIdx = 0;
            flagList.forEach((_, fi) => {
              const fPos = flagList.length > 1 ? fi / (flagList.length - 1) : 0;
              const d = Math.abs(value - fPos);
              if (d < minDist) { minDist = d; nearestIdx = fi; }
            });
            return nearestIdx === idx;
          })();

          return (
            <View key={idx} style={{
              position: 'absolute',
              left: `${equalPos * 100}%`,
              top: wp(2),
              alignItems: 'center',
              transform: [{ translateX: -wp(10) }],
            }}>
              <Text style={{
                fontSize: fp(7),
                color: isNearest ? accentColor : '#555E6C',
                fontWeight: isNearest ? '700' : '500',
              }}>
                {String.fromCodePoint(0x1F3C1)}
              </Text>
              <Text style={{
                fontSize: fp(7),
                color: isNearest ? accentColor : '#555E6C',
                fontWeight: isNearest ? '700' : '500',
                marginTop: wp(1),
              }}>
                {mode === 'distance' ? flag.label : `${flag}m`}
              </Text>
            </View>
          );
        })}

        {/* Filled track */}
        <View style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${value * 100}%`,
          backgroundColor: isWalk ? 'rgba(0,217,132,0.12)' : 'rgba(255,140,66,0.12)',
          borderTopLeftRadius: wp(12),
          borderBottomLeftRadius: wp(12),
        }} />

        {/* Moving indicator — FIX 2: sneaker icons */}
        <Animated.View style={{
          position: 'absolute',
          left: barWidth > 0 ? value * (barWidth - wp(28)) : 0,
          top: wp(14),
          width: wp(28),
          height: wp(28),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {isWalk
            ? <WalkShoeAnimated shoeAnim={shoeAnim} />
            : <RunShoeAnimated shoeAnim={shoeAnim} />
          }
        </Animated.View>
      </View>
    </View>
  );
};

// ── Toggle Pill (Distance | Temps) ───────────────────────────────────────────
const ModePill = ({ mode, onToggle, accentColor }) => (
  <View style={{
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: wp(10),
    padding: wp(2),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  }}>
    {['distance', 'temps'].map((m) => (
      <Pressable
        key={m}
        onPress={() => onToggle(m)}
        style={{
          paddingHorizontal: wp(10),
          paddingVertical: wp(4),
          borderRadius: wp(8),
          backgroundColor: mode === m ? accentColor : 'transparent',
        }}
      >
        <Text style={{
          fontSize: fp(9),
          fontWeight: '700',
          color: mode === m ? '#000' : '#8892A0',
          textTransform: 'capitalize',
        }}>
          {m}
        </Text>
      </Pressable>
    ))}
  </View>
);

// ── Sport Card (for grid) ────────────────────────────────────────────────────
const SportCard = ({ sportKey, onPress }) => {
  const sport = ACTIVITY_DATA[sportKey];
  return (
    <MetalCard
      onPress={onPress}
      style={{
        marginHorizontal: 0,
        marginBottom: wp(8),
        flex: 1,
      }}
    >
      <View style={{ alignItems: 'center', paddingVertical: wp(4) }}>
        <Text style={{ fontSize: fp(22) }}>{sport.icon}</Text>
        <Text style={{
          color: '#EAEEF3', fontSize: fp(10), fontWeight: '700',
          marginTop: wp(4), textAlign: 'center',
        }}>
          {sport.label}
        </Text>
        <Text style={{
          color: sport.color, fontSize: fp(8), fontWeight: '600',
          marginTop: wp(2),
        }}>
          {sport.kcal_per_hour} kcal/h
        </Text>
      </View>
    </MetalCard>
  );
};

// ── Sport Modal ──────────────────────────────────────────────────────────────
const SportModal = ({ visible, sportKey, onClose, onSave }) => {
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState('modere');

  if (!sportKey) return null;
  const sport = ACTIVITY_DATA[sportKey];
  const multiplier = intensity === 'leger' ? 0.7 : intensity === 'intense' ? 1.3 : 1.0;
  const calories = Math.round((duration / 60) * sport.kcal_per_hour * multiplier);
  const waterLost = Math.round((duration / 60) * sport.water_per_hour_ml * multiplier);

  const intensities = [
    { key: 'leger', label: 'Léger', mult: 0.7 },
    { key: 'modere', label: 'Modéré', mult: 1.0 },
    { key: 'intense', label: 'Intense', mult: 1.3 },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center', alignItems: 'center',
        }}
      >
        <Pressable onPress={() => {}} style={{ width: W - wp(40) }}>
          <MetalCard style={{ marginHorizontal: 0, marginBottom: 0 }}>
            <View>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(12) }}>
                <Text style={{ fontSize: fp(22), marginRight: wp(8) }}>{sport.icon}</Text>
                <Text style={{
                  color: '#EAEEF3', fontSize: fp(16), fontWeight: '800',
                  letterSpacing: 1, textTransform: 'uppercase',
                }}>
                  {sport.label}
                </Text>
                <Pressable onPress={onClose} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close-circle" size={wp(22)} color="#555E6C" />
                </Pressable>
              </View>

              {/* Duration slider */}
              <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600', marginBottom: wp(6) }}>
                DURÉE : {duration} min
              </Text>
              <View style={{
                flexDirection: 'row', flexWrap: 'wrap', gap: wp(4), marginBottom: wp(12),
              }}>
                {[5, 10, 15, 20, 30, 45, 60, 90, 120].map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDuration(d)}
                    style={{
                      paddingHorizontal: wp(8), paddingVertical: wp(5),
                      borderRadius: wp(8),
                      backgroundColor: duration === d ? sport.color : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: duration === d ? sport.color : 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Text style={{
                      fontSize: fp(9), fontWeight: '700',
                      color: duration === d ? '#000' : '#8892A0',
                    }}>
                      {d}m
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Intensity */}
              <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600', marginBottom: wp(6) }}>
                INTENSITÉ
              </Text>
              <View style={{ flexDirection: 'row', gap: wp(6), marginBottom: wp(14) }}>
                {intensities.map((int) => (
                  <Pressable
                    key={int.key}
                    onPress={() => setIntensity(int.key)}
                    style={{
                      flex: 1, paddingVertical: wp(8), borderRadius: wp(8),
                      backgroundColor: intensity === int.key ? sport.color : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: intensity === int.key ? sport.color : 'rgba(255,255,255,0.08)',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: fp(9), fontWeight: '700',
                      color: intensity === int.key ? '#000' : '#8892A0',
                    }}>
                      {int.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Calories estimate */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: wp(14),
                paddingHorizontal: wp(8), paddingVertical: wp(8),
                backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(10),
              }}>
                <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600' }}>
                  Estimation
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ color: '#FF8C42', fontSize: fp(20), fontWeight: '900' }}>
                    {calories}
                  </Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(10), marginLeft: wp(3) }}>
                    kcal
                  </Text>
                </View>
              </View>

              {/* Save button */}
              <TouchableOpacity
                onPress={() => onSave(sportKey, duration, calories, intensity, waterLost)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: sport.color, borderRadius: wp(12),
                  paddingVertical: wp(12), alignItems: 'center',
                }}
              >
                <Text style={{ color: '#000', fontSize: fp(12), fontWeight: '800' }}>
                  ✓ Ajouter — {calories} kcal
                </Text>
              </TouchableOpacity>
            </View>
          </MetalCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const ActivityPage = ({ onNavigate }) => {
  // ── State ────────────────────────────────────────────────────────────────
  const [todayActivities, setTodayActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('activity');

  // Save feedback
  const [runSaved, setRunSaved] = useState(false);

  // Walk side-scroll
  const [walkScrollOffset, setWalkScrollOffset] = useState(0);
  const [walkCanvasW, setWalkCanvasW] = useState(280);
  const [walkRoundTrip, setWalkRoundTrip] = useState(false);
  const [walkSaved, setWalkSaved] = useState(false);

  // Walk knob controls
  const walkIntervalRef = useRef(null);
  const walkRotateAnimLeft = useRef(new Animated.Value(0)).current;
  const walkRotateAnimRight = useRef(new Animated.Value(0)).current;
  const walkSpeedRef = useRef(2);
  const walkHoldStartRef = useRef(0);

  // Run side-scroll (same system as walk)
  const [runScrollOffset, setRunScrollOffset] = useState(0);
  const [runCanvasW, setRunCanvasW] = useState(280);
  const [runRoundTrip, setRunRoundTrip] = useState(false);
  const runIntervalRef = useRef(null);
  const runRotateAnimLeft = useRef(new Animated.Value(0)).current;
  const runRotateAnimRight = useRef(new Animated.Value(0)).current;
  const runSpeedRef = useRef(2);
  const runHoldStartRef = useRef(0);
  const isRunMovingRef = useRef(false);
  const [runMilestone, setRunMilestone] = useState(null);
  const runMilestoneTimerRef = useRef(null);
  const runMilestoneHitRef = useRef({});

  // Lottie refs
  const walkCreatureRef = useRef(null);
  const horseAnimRef = useRef(null);
  const [isMarcheMoving, setIsMarcheMoving] = useState(false);
  const [isCourseMoving, setIsCourseMoving] = useState(false);

  // Sport modal
  const [modalSport, setModalSport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Shoe animation
  const shoeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shoeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(shoeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Load today's activities
  useEffect(() => { loadTodayActivities(); }, []);

  // ── Tab handler ─────────────────────────────────────────────────────────
  const handleTabPress = (key) => {
    if (key === 'activity') return;
    if (onNavigate) onNavigate(key);
    setActiveTab(key);
  };

  // ── Supabase functions ─────────────────────────────────────────────────
  const loadTodayActivities = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('date', today)
      .order('created_at', { ascending: false });
    if (data) setTodayActivities(data);
  };

  // FIX 6: Save via RPC (SECURITY DEFINER)
  const saveActivity = async (activityType, durationMin, caloriesBurned, intensity, waterLost) => {
    const actData = ACTIVITY_DATA[activityType];
    if (!actData) return false;

    try {
      const { data, error } = await supabase.rpc('add_user_activity', {
        p_user_id: TEST_USER_ID,
        p_name: actData.label,
        p_type: activityType,
        p_duration_minutes: Math.round(durationMin),
        p_calories_burned: Math.round(caloriesBurned),
        p_intensity: intensity || 'modere',
        p_water_lost_ml: Math.round(waterLost),
      });

      if (error) {
        console.error('Save activity error:', error);
        alert('Erreur : ' + error.message);
        return false;
      }

      await loadTodayActivities();
      return true;
    } catch (e) {
      console.error('Save error:', e);
      alert('Erreur réseau.');
      return false;
    }
  };

  // FIX 5: Delete via RPC (SECURITY DEFINER)
  const deleteActivity = async (activityId) => {
    try {
      const { error } = await supabase.rpc('delete_user_activity', {
        p_activity_id: activityId,
        p_user_id: TEST_USER_ID,
      });
      if (error) {
        console.error('Delete error:', error);
        alert('Erreur suppression : ' + error.message);
        return;
      }
      await loadTodayActivities();
    } catch (e) {
      console.error('Delete activity error:', e);
    }
  };

  // ── Run constants & calculations ──────────────────────────────────────
  const RUN_SCENE_W = 8400;       // 42km marathon canvas
  const RUN_MAX_DIST = 42000;     // 42 km in metres
  const RUN_CANVAS_H = 100;       // ultra-compact canvas height
  const RUN_PAS_SPACING = 28;     // same as walk

  // Jaguar animation frame
  const jaguarFrameRef = useRef(0);
  const jaguarTickRef = useRef(0);
  const JAGUAR_FRAME_COUNT = 4;

  const runMaxS = RUN_SCENE_W - runCanvasW;
  const runProg = runMaxS > 0 ? runScrollOffset / runMaxS : 0;
  const RUN_METERS_PER_PIXEL = RUN_MAX_DIST / RUN_SCENE_W;
  const RUN_PIXELS_PER_METER = RUN_SCENE_W / RUN_MAX_DIST;
  const runDistM = runScrollOffset * RUN_METERS_PER_PIXEL;
  const runMul = runRoundTrip ? 2 : 1;
  const runDistKm = (runDistM * runMul) / 1000;
  // Calories course ≈ 1.0 kcal/kg/km (userWeight ~70kg default)
  const userWeight = 70;
  const runCalories = Math.round(runDistKm * userWeight * 1.0);
  const runWater = Math.round(runDistKm * 150);
  const runDuration = Math.round((runDistKm / 8) * 60);
  const runDistFinal = runDistM * runMul;
  const runDistStr = runDistFinal < 1000 ? `${Math.round(runDistFinal)} m` : `${Math.round(runDistFinal / 100) / 10} km`;
  const runDurStr = (() => { const m = Math.round(runDuration); return m < 60 ? `${m} min` : `${Math.round(m / 6) / 10} h`; })();
  const runFootprintCount = Math.floor(runScrollOffset / RUN_PAS_SPACING);

  // Day totals
  const totalCalories = todayActivities.reduce((s, a) => s + (a.calories_burned || 0), 0);
  const totalDuration = todayActivities.reduce((s, a) => s + (a.duration_minutes || 0), 0);
  const totalWater = todayActivities.reduce((s, a) => s + (a.water_lost_ml || 0), 0);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAddRun = async () => {
    if (runCalories === 0) return;
    const ok = await saveActivity('course', runDuration, runCalories, 'modere', runWater);
    if (ok) {
      setRunSaved(true);
      setTimeout(() => {
        setRunSaved(false);
        setRunScrollOffset(0);
        runMilestoneHitRef.current = {};
      }, 1500);
    }
  };

  const handleSportSave = async (sportKey, duration, calories, intensity, waterLost) => {
    const ok = await saveActivity(sportKey, duration, calories, intensity, waterLost);
    if (ok) {
      setModalVisible(false);
      alert(`${ACTIVITY_DATA[sportKey].label} ajouté(e) ! ${calories} kcal`);
    }
  };

  const handleDeleteActivity = (activity) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous supprimer cette activité ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteActivity(activity.id) },
      ]
    );
  };

  const todayDateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  // ── Walk constants ─────────────────────────────────────────────────────
  const WALK_SCENE_W = 2000;
  const WALK_MAX_DIST = 10000;
  const WALK_CANVAS_H = 100;  // ultra-compact canvas height

  // ── Walk computed values ──────────────────────────────────────────────
  const walkMaxS = WALK_SCENE_W - walkCanvasW;
  const walkProg = walkMaxS > 0 ? walkScrollOffset / walkMaxS : 0;
  const walkDistM = walkProg * WALK_MAX_DIST;
  const walkMul = walkRoundTrip ? 2 : 1;
  const walkDurMin = (walkDistM / 5000) * 60;
  const walkCal = Math.round((walkDurMin / 60) * 280 * walkMul);
  const walkWater = Math.round((walkDurMin / 60) * 400 * walkMul);
  const walkDistFinal = walkDistM * walkMul;
  const walkDistStr = walkDistFinal < 1000 ? `${Math.round(walkDistFinal)} m` : `${Math.round(walkDistFinal / 100) / 10} km`;
  const walkDurStr = (() => { const m = Math.round(walkDurMin * walkMul); return m < 60 ? `${m} min` : `${Math.round(m / 6) / 10} h`; })();
  const WALK_PAS_SPACING = 28;
  const walkFootprintCount = Math.floor(walkScrollOffset / WALK_PAS_SPACING);

  // ── Walk knob interaction ─────────────────────────────────────────────
  const startWalkMoving = (direction) => {
    const activeRotateAnim = direction === 1 ? walkRotateAnimRight : walkRotateAnimLeft;
    walkHoldStartRef.current = Date.now();
    walkSpeedRef.current = 2;
    setIsMarcheMoving(true);
    if (walkCreatureRef.current) walkCreatureRef.current.play();
    walkIntervalRef.current = setInterval(() => {
      const holdDuration = Date.now() - walkHoldStartRef.current;
      if (holdDuration > 3000) walkSpeedRef.current = 16;
      else if (holdDuration > 2000) walkSpeedRef.current = 10;
      else if (holdDuration > 1000) walkSpeedRef.current = 6;
      else if (holdDuration > 500) walkSpeedRef.current = 4;
      else walkSpeedRef.current = 2;
      setWalkScrollOffset(prev => {
        const maxS = WALK_SCENE_W - walkCanvasW;
        return Math.max(0, Math.min(prev + direction * walkSpeedRef.current, maxS));
      });
      activeRotateAnim.setValue((activeRotateAnim.__getValue() || 0) + direction * 10);
    }, 50);
  };
  const stopWalkMoving = () => {
    setIsMarcheMoving(false);
    if (walkCreatureRef.current) walkCreatureRef.current.pause();
    if (walkIntervalRef.current) {
      clearInterval(walkIntervalRef.current);
      walkIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => { if (walkIntervalRef.current) clearInterval(walkIntervalRef.current); };
  }, []);

  // ── Run knob interaction ──────────────────────────────────────────────
  const startRunMoving = (direction) => {
    const activeRotateAnim = direction === 1 ? runRotateAnimRight : runRotateAnimLeft;
    runHoldStartRef.current = Date.now();
    runSpeedRef.current = 2;
    isRunMovingRef.current = true;
    setIsCourseMoving(true);
    if (horseAnimRef.current) horseAnimRef.current.play();
    runIntervalRef.current = setInterval(() => {
      const holdDuration = Date.now() - runHoldStartRef.current;
      if (holdDuration > 3000) runSpeedRef.current = 16;
      else if (holdDuration > 2000) runSpeedRef.current = 10;
      else if (holdDuration > 1000) runSpeedRef.current = 6;
      else if (holdDuration > 500) runSpeedRef.current = 4;
      else runSpeedRef.current = 2;
      setRunScrollOffset(prev => {
        const maxS = RUN_SCENE_W - runCanvasW;
        return Math.max(0, Math.min(prev + direction * runSpeedRef.current, maxS));
      });
      activeRotateAnim.setValue((activeRotateAnim.__getValue() || 0) + direction * 10);
      // Advance jaguar animation frame every 3 ticks (~150ms)
      jaguarTickRef.current += 1;
      if (jaguarTickRef.current >= 3) {
        jaguarTickRef.current = 0;
        jaguarFrameRef.current = (jaguarFrameRef.current + 1) % JAGUAR_FRAME_COUNT;
      }
    }, 50);
  };
  const stopRunMoving = () => {
    isRunMovingRef.current = false;
    setIsCourseMoving(false);
    if (horseAnimRef.current) horseAnimRef.current.pause();
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => { if (runIntervalRef.current) clearInterval(runIntervalRef.current); };
  }, []);

  // Run milestone detection
  useEffect(() => {
    const distanceM = runDistM;
    const milestones = [500, 1000, 2000, 5000, 10000, 21000];
    milestones.forEach(m => {
      if (distanceM >= m && distanceM < m + 50 && !runMilestoneHitRef.current[m]) {
        runMilestoneHitRef.current[m] = true;
        setRunMilestone(m);
        if (runMilestoneTimerRef.current) clearTimeout(runMilestoneTimerRef.current);
        runMilestoneTimerRef.current = setTimeout(() => setRunMilestone(null), 3000);
      }
    });
  }, [runScrollOffset]);

  const runKnobRotateLeft = runRotateAnimLeft.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ['-3600deg', '3600deg'],
  });
  const runKnobRotateRight = runRotateAnimRight.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ['-3600deg', '3600deg'],
  });

  const walkKnobRotateLeft = walkRotateAnimLeft.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ['-3600deg', '3600deg'],
  });
  const walkKnobRotateRight = walkRotateAnimRight.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ['-3600deg', '3600deg'],
  });

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <MetallicBackground />
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 55 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: wp(120) }}
        >
          {/* HEADER */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: wp(16), paddingBottom: wp(10),
          }}>
            <Text style={{
              color: '#EAEEF3', fontSize: fp(20), fontWeight: '800', letterSpacing: 2,
            }}>
              ACTIVITÉ
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(0,217,132,0.08)',
              paddingHorizontal: wp(12), paddingVertical: wp(6),
              borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '600' }}>
                Aujourd'hui
              </Text>
              <Text style={{ color: '#8892A0', fontSize: fp(11), marginLeft: 6 }}>
                {todayDateStr}
              </Text>
            </View>
          </View>

          {/* DAY SUMMARY */}
          <MetalCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(10), color: '#8892A0', fontWeight: '600', marginBottom: wp(2) }}>
                  {String.fromCodePoint(0x1F525)} Brûlé
                </Text>
                <Text style={{ fontSize: fp(18), color: '#FF8C42', fontWeight: '900' }}>
                  {totalCalories}
                </Text>
                <Text style={{ fontSize: fp(8), color: '#555E6C', fontWeight: '600' }}>kcal</Text>
              </View>

              <View style={{
                width: 1, height: wp(30),
                backgroundColor: 'rgba(255,255,255,0.06)',
              }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(10), color: '#8892A0', fontWeight: '600', marginBottom: wp(2) }}>
                  {String.fromCodePoint(0x23F1)} Temps
                </Text>
                <Text style={{ fontSize: fp(18), color: '#EAEEF3', fontWeight: '900' }}>
                  {formatDuration(totalDuration)}
                </Text>
              </View>

              <View style={{
                width: 1, height: wp(30),
                backgroundColor: 'rgba(255,255,255,0.06)',
              }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(10), color: '#8892A0', fontWeight: '600', marginBottom: wp(2) }}>
                  {String.fromCodePoint(0x1F4A7)} Eau perdue
                </Text>
                <Text style={{ fontSize: fp(18), color: '#4DA6FF', fontWeight: '900' }}>
                  {totalWater}
                </Text>
                <Text style={{ fontSize: fp(8), color: '#555E6C', fontWeight: '600' }}>ml</Text>
              </View>
            </View>
          </MetalCard>

          {/* MARCHE — SIDE-SCROLL TAPIS ROULANT */}
          <SectionTitle title="Marche" />
          <MetalCard style={{ marginBottom: wp(4) }}>
            {/* Header: Titre + données sur UNE ligne */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>{String.fromCodePoint(0x1F3C3)} MARCHE</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#FF6B3D', fontSize: 10 }}>{String.fromCodePoint(0x1F4CD)}{walkDistStr}</Text>
                <Text style={{ color: '#FF6B3D', fontSize: 10 }}>{String.fromCodePoint(0x1F525)}{walkCal}kcal</Text>
                <Text style={{ color: '#4DA6FF', fontSize: 10 }}>{String.fromCodePoint(0x1F4A7)}{walkWater}ml</Text>
              </View>
            </View>

            {/* Canvas SVG side-scroll + Lottie overlay */}
            <View
              style={{ height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative' }}
              onLayout={(e) => setWalkCanvasW(e.nativeEvent.layout.width)}
            >
              <Svg width={walkCanvasW} height={100} viewBox={`${walkScrollOffset} 0 ${walkCanvasW} 100`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <Defs>
                  <SvgLinearGradient id="wSkyGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#87CEEB" stopOpacity={0.9} />
                    <Stop offset="40%" stopColor="#B0E0FF" stopOpacity={0.7} />
                    <Stop offset="100%" stopColor="#E8F5E9" stopOpacity={0.3} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="wGrassGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#4CAF50" stopOpacity={0.4} />
                    <Stop offset="100%" stopColor="#2E7D32" stopOpacity={0.6} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="wPathGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#D7CCC8" stopOpacity={0.3} />
                    <Stop offset="100%" stopColor="#A1887F" stopOpacity={0.2} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="wSunGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#FFF9C4" />
                    <Stop offset="100%" stopColor="#FFD54F" />
                  </SvgLinearGradient>
                </Defs>

                {(() => {
                  const scW = WALK_SCENE_W;
                  const scH = WALK_CANVAS_H;
                  const groundY = scH * 0.60;
                  const pathY = scH * 0.58;
                  const centerX = walkScrollOffset + walkCanvasW / 2;
                  const passed = (px) => centerX > px;

                  return (
                    <>
                      {/* CIEL */}
                      <Rect x={0} y={0} width={scW} height={groundY} fill="url(#wSkyGrad)" />

                      {/* SOLEIL */}
                      <G transform="translate(1400, 20)">
                        {Array.from({ length: 12 }, (_, i) => {
                          const angle = (i / 12) * Math.PI * 2;
                          return <Line key={`sr-${i}`} x1={Math.cos(angle) * 14} y1={Math.sin(angle) * 14} x2={Math.cos(angle) * 22} y2={Math.sin(angle) * 22}
                            stroke="#FFD54F" strokeWidth={1.5} opacity={0.5} strokeLinecap="round" />;
                        })}
                        <Circle cx={0} cy={0} r={12} fill="url(#wSunGrad)" opacity={0.9} />
                        <Circle cx={-3} cy={-3} r={4} fill="#FFFFFF" opacity={0.3} />
                        {walkProg > 0.65 && (
                          <>
                            <Circle cx={0} cy={0} r={22} fill="#FFD54F" opacity={0.15} />
                            <Circle cx={0} cy={0} r={30} fill="#FFD54F" opacity={0.07} />
                            {Array.from({ length: 8 }, (_, i) => {
                              const a = (i / 8) * Math.PI * 2 + 0.2;
                              return <Line key={`xr-${i}`} x1={Math.cos(a) * 18} y1={Math.sin(a) * 18}
                                x2={Math.cos(a) * 28} y2={Math.sin(a) * 28}
                                stroke="#FFF9C4" strokeWidth={2} opacity={0.3} strokeLinecap="round" />;
                            })}
                          </>
                        )}
                      </G>

                      {/* NUAGES */}
                      <G transform="translate(200, 12)" opacity={0.6}>
                        <Ellipse cx={0} cy={0} rx={18} ry={8} fill="white" />
                        <Ellipse cx={-12} cy={2} rx={12} ry={7} fill="white" />
                        <Ellipse cx={12} cy={2} rx={14} ry={7} fill="white" />
                      </G>
                      <G transform="translate(700, 8)" opacity={0.4}>
                        <Ellipse cx={0} cy={0} rx={12} ry={5} fill="white" />
                        <Ellipse cx={-8} cy={1} rx={8} ry={5} fill="white" />
                        <Ellipse cx={8} cy={1} rx={10} ry={5} fill="white" />
                      </G>
                      <G transform="translate(1100, 18)" opacity={0.35}>
                        <Ellipse cx={0} cy={0} rx={14} ry={6} fill="white" />
                        <Ellipse cx={10} cy={1} rx={10} ry={5} fill="white" />
                      </G>
                      <G transform="translate(1600, 10)" opacity={0.5}>
                        <Ellipse cx={0} cy={0} rx={16} ry={7} fill="white" />
                        <Ellipse cx={-10} cy={2} rx={11} ry={6} fill="white" />
                        <Ellipse cx={10} cy={1} rx={12} ry={6} fill="white" />
                      </G>
                      <G transform="translate(1900, 22)" opacity={0.3}>
                        <Ellipse cx={0} cy={0} rx={10} ry={4} fill="white" />
                        <Ellipse cx={7} cy={1} rx={8} ry={4} fill="white" />
                      </G>

                      {/* COLLINES LOINTAINES */}
                      <Path d={`M0 ${groundY} Q300 ${groundY - 25} 600 ${groundY - 10} Q1000 ${groundY - 30} 1400 ${groundY - 8} Q1700 ${groundY - 20} ${scW} ${groundY} Z`}
                        fill="#81C784" opacity={0.25} />

                      {/* SOL / HERBE */}
                      <Rect x={0} y={groundY} width={scW} height={scH - groundY} fill="url(#wGrassGrad)" />

                      {/* Touffes d'herbe */}
                      {Array.from({ length: 120 }, (_, i) => {
                        const x = (i / 120) * scW + (Math.sin(i * 7) * 3);
                        return (
                          <G key={`wt-${i}`}>
                            <Line x1={x} y1={groundY} x2={x - 1.5} y2={groundY - 4 - (i % 3) * 2}
                              stroke="#66BB6A" strokeWidth={1.2} opacity={0.3} strokeLinecap="round" />
                            <Line x1={x + 2} y1={groundY} x2={x + 1} y2={groundY - 3 - (i % 4) * 1.5}
                              stroke="#4CAF50" strokeWidth={1} opacity={0.25} strokeLinecap="round" />
                          </G>
                        );
                      })}

                      {/* Fleurs */}
                      {[80, 250, 500, 750, 1000, 1250, 1500, 1750, 1950].map((fx, i) => {
                        const y = groundY + 8 + (i % 3) * 5;
                        const colors = ['#FF6B8A', '#FFD93D', '#E1BEE7', '#FF8A65', '#81D4FA', '#F48FB1', '#FFCC80', '#CE93D8', '#A5D6A7'];
                        return (
                          <G key={`wf-${i}`}>
                            <Line x1={fx} y1={y} x2={fx} y2={y - 5} stroke="#66BB6A" strokeWidth={0.8} opacity={0.4} />
                            <Circle cx={fx} cy={y - 6} r={2} fill={colors[i]} opacity={0.5} />
                            <Circle cx={fx} cy={y - 6} r={0.8} fill="#FFD54F" opacity={0.6} />
                          </G>
                        );
                      })}

                      {/* CHEMIN DE TERRE */}
                      <Path d={`M0 ${pathY + 5} Q500 ${pathY - 2} 1000 ${pathY + 3} Q1500 ${pathY - 1} ${scW} ${pathY + 5}`}
                        fill="none" stroke="url(#wPathGrad)" strokeWidth={18} strokeLinecap="round" />
                      <Path d={`M0 ${pathY + 12} Q500 ${pathY + 5} 1000 ${pathY + 10} Q1500 ${pathY + 6} ${scW} ${pathY + 12}`}
                        fill="none" stroke="#A5D6A7" strokeWidth={1} opacity={0.3} />

                      {/* MAISON — juste avant les premières empreintes */}
                      <G transform={`translate(${walkCanvasW * 0.4 - 40}, ${pathY - 30}) scale(1.8)`}>
                        <Rect x={6} y={-12} width={3} height={6} fill="#795548" opacity={0.6} />
                        <Circle cx={8} cy={-14} r={2.5} fill="#BDBDBD" opacity={0.3} />
                        <Path d="M-2 -4 L10 -14 L22 -4 Z" fill="#E53935" opacity={0.85} />
                        <Path d="M0 -4 L10 -12 L20 -4" fill="none" stroke="#C62828" strokeWidth={1} opacity={0.5} />
                        <Rect x={0} y={-4} width={20} height={18} fill="#FFECB3" opacity={0.85} />
                        <Rect x={7} y={3} width={6} height={11} rx={1} fill="#6D4C41" opacity={0.85} />
                        <Circle cx={11.5} cy={8} r={0.8} fill="#FFD54F" opacity={0.9} />
                        <Rect x={1.5} y={-1} width={4} height={4} rx={0.5} fill="#90CAF9" opacity={0.6} />
                        <Line x1={3.5} y1={-1} x2={3.5} y2={3} stroke="#FFECB3" strokeWidth={0.5} opacity={0.6} />
                        <Line x1={1.5} y1={1} x2={5.5} y2={1} stroke="#FFECB3" strokeWidth={0.5} opacity={0.6} />
                        <Rect x={14.5} y={-1} width={4} height={4} rx={0.5} fill="#90CAF9" opacity={0.6} />
                        <Line x1={16.5} y1={-1} x2={16.5} y2={3} stroke="#FFECB3" strokeWidth={0.5} opacity={0.6} />
                        <Line x1={14.5} y1={1} x2={18.5} y2={1} stroke="#FFECB3" strokeWidth={0.5} opacity={0.6} />
                      </G>

                      {/* ARBRE — x=440 */}
                      <G transform={`translate(440, ${pathY - 20}) scale(2)`}>
                        <Rect x={-2.5} y={8} width={5} height={16} fill="#795548" opacity={0.8} />
                        <Line x1={-1.5} y1={10} x2={-1.5} y2={22} stroke="#5D4037" strokeWidth={0.5} opacity={0.4} />
                        <Line x1={1.5} y1={9} x2={1.5} y2={23} stroke="#8D6E63" strokeWidth={0.5} opacity={0.3} />
                        <Circle cx={0} cy={0} r={12} fill="#43A047" opacity={0.85} />
                        <Circle cx={-7} cy={4} r={8} fill="#388E3C" opacity={0.75} />
                        <Circle cx={7} cy={4} r={8} fill="#388E3C" opacity={0.75} />
                        <Circle cx={0} cy={-5} r={7} fill="#66BB6A" opacity={0.5} />
                        <Circle cx={-4} cy={-2} r={3} fill="#81C784" opacity={0.3} />
                        {passed(440) && (
                          <G>
                            <Circle cx={8} cy={22} r={3.5} fill="#F44336" opacity={0.85} />
                            <Ellipse cx={9.5} cy={21} rx={1} ry={0.5} fill="white" opacity={0.3} />
                            <Line x1={8} y1={18.5} x2={8.5} y2={17} stroke="#795548" strokeWidth={1} />
                            <Ellipse cx={10} cy={16.5} rx={2.5} ry={1.2} fill="#66BB6A" opacity={0.6} transform="rotate(-30, 10, 16.5)" />
                          </G>
                        )}
                      </G>

                      {/* BANC — x=840 */}
                      <G transform={`translate(840, ${pathY - 4}) scale(1.8)`}>
                        <Rect x={-12} y={-2} width={24} height={3} rx={1.5} fill="#D7CCC8" opacity={0.9} />
                        <Rect x={-12} y={1.5} width={24} height={3} rx={1.5} fill="#BCAAA4" opacity={0.8} />
                        <Rect x={-11} y={-9} width={22} height={2.5} rx={1} fill="#D7CCC8" opacity={0.8} />
                        <Rect x={-11} y={-6} width={22} height={2.5} rx={1} fill="#BCAAA4" opacity={0.7} />
                        <Path d="M-9 4.5 L-10.5 12 L-8 12 L-6.5 4.5" fill="#616161" opacity={0.8} />
                        <Path d="M9 4.5 L7.5 12 L10 12 L11.5 4.5" fill="#616161" opacity={0.8} />
                        <Rect x={-10} y={-9} width={2.5} height={13} rx={0.5} fill="#616161" opacity={0.7} />
                        <Rect x={9.5} y={-9} width={2.5} height={13} rx={0.5} fill="#616161" opacity={0.7} />
                        <Rect x={-14} y={-4} width={5} height={2.5} rx={1} fill="#616161" opacity={0.6} />
                        <Rect x={11} y={-4} width={5} height={2.5} rx={1} fill="#616161" opacity={0.6} />
                      </G>

                      {/* COLOMBES BLANCHES — s'envolent vers le soleil quand passé */}
                      <G transform={`translate(1300, ${pathY - (walkProg > 0.65 ? 45 : 5)})`}>
                        {/* Colombe 1 — grande */}
                        <G transform={`translate(0, ${walkProg > 0.65 ? -10 : 0}) scale(1.8)`}>
                          <Ellipse cx={0} cy={0} rx={5} ry={2.5} fill="white" opacity={0.9} />
                          <Circle cx={-4} cy={-1} r={2.5} fill="white" opacity={0.9} />
                          <Path d="M-6.5 -1 L-8 0 L-6.5 0.5" fill="#FFB300" opacity={0.8} />
                          <Circle cx={-5.5} cy={-1.5} r={0.5} fill="#333" />
                          <Path d="M-1 -2 Q0 -9 8 -5 Q4 -1 0 0" fill="white" opacity={0.7} />
                          <Path d="M-1 2 Q0 8 7 5 Q3 2 0 1" fill="white" opacity={0.5} />
                        </G>
                        {/* Colombe 2 — moyenne */}
                        <G transform={`translate(18, ${walkProg > 0.65 ? -20 : -5}) scale(1.2)`}>
                          <Ellipse cx={0} cy={0} rx={5} ry={2.5} fill="white" opacity={0.8} />
                          <Circle cx={-4} cy={-1} r={2.5} fill="white" opacity={0.8} />
                          <Path d="M-6.5 -1 L-8 0 L-6.5 0.5" fill="#FFB300" opacity={0.7} />
                          <Circle cx={-5.5} cy={-1.5} r={0.4} fill="#333" />
                          <Path d="M-1 -2 Q0 -8 7 -4 Q3 -1 0 0" fill="white" opacity={0.6} />
                        </G>
                        {/* Colombe 3 — petite, plus haute */}
                        <G transform={`translate(-12, ${walkProg > 0.65 ? -30 : -8}) scale(0.9)`}>
                          <Ellipse cx={0} cy={0} rx={5} ry={2.5} fill="white" opacity={0.7} />
                          <Circle cx={-4} cy={-1} r={2.5} fill="white" opacity={0.7} />
                          <Path d="M-1 -2 Q0 -7 6 -3 Q3 -1 0 0" fill="white" opacity={0.5} />
                        </G>
                      </G>

                      {/* ÉTANG + CANARD — x=1850 */}
                      <G transform={`translate(1850, ${pathY - 5}) scale(1.8)`}>
                        <Ellipse cx={0} cy={6} rx={22} ry={14} fill="#4FC3F7" opacity={0.2} />
                        <Ellipse cx={0} cy={6} rx={18} ry={10} fill="#29B6F6" opacity={0.15} />
                        <Path d="M-14 5 Q-7 2 0 5 Q7 8 14 5" fill="none" stroke="#4FC3F7" strokeWidth={1} opacity={0.3} />
                        {walkProg > 0.88 && (
                          <>
                            <Circle cx={-3} cy={-6} r={1.5} fill="#4FC3F7" opacity={0.6} />
                            <Circle cx={4} cy={-8} r={1} fill="#4FC3F7" opacity={0.5} />
                            <Circle cx={-6} cy={-4} r={1} fill="#4FC3F7" opacity={0.4} />
                            <Circle cx={7} cy={-5} r={0.8} fill="#4FC3F7" opacity={0.4} />
                            <Path d="M-15 6 Q-8 3 0 6 Q8 9 15 6" fill="none" stroke="#4FC3F7" strokeWidth={1} opacity={0.4} />
                            <Ellipse cx={0} cy={5} rx={20} ry={12} fill="#4FC3F7" opacity={0.08} />
                          </>
                        )}
                        <Ellipse cx={-12} cy={9} rx={4} ry={2} fill="#66BB6A" opacity={0.5} />
                        <Circle cx={-12} cy={8} r={1.5} fill="#F48FB1" opacity={0.5} />
                        <Ellipse cx={10} cy={12} rx={3} ry={1.5} fill="#66BB6A" opacity={0.4} />
                        <Circle cx={10} cy={11} r={1} fill="#CE93D8" opacity={0.4} />
                        <Ellipse cx={0} cy={1} rx={7} ry={4} fill="#FFB300" opacity={0.9} />
                        <Circle cx={-6} cy={-3} r={4} fill="#2E7D32" opacity={0.9} />
                        <Circle cx={-7.5} cy={-3.5} r={1.3} fill="white" />
                        <Circle cx={-7.8} cy={-3.5} r={0.6} fill="#0D1117" />
                        <Path d="M-10 -3 L-13 -2 L-10 -1" fill="#FF6F00" opacity={0.95} />
                        <Path d="M7 -1 L10 -5 L8 1" fill="#FFB300" opacity={0.8} />
                        <Line x1={16} y1={-8} x2={16} y2={8} stroke="#8D6E63" strokeWidth={1.2} opacity={0.4} />
                        <Ellipse cx={16} cy={-9} rx={2} ry={3} fill="#8D6E63" opacity={0.3} />
                        <Line x1={18} y1={-5} x2={18} y2={8} stroke="#8D6E63" strokeWidth={1} opacity={0.3} />
                        <Ellipse cx={18} cy={-6} rx={1.5} ry={2.5} fill="#8D6E63" opacity={0.25} />
                      </G>

                    </>
                  );
                })()}
              </Svg>

              {/* Brouillard gauche */}
              <LinearGradient
                colors={['#252A30', 'rgba(37,42,48,0)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30 }}
              />
              {/* Brouillard droite */}
              <LinearGradient
                colors={['rgba(37,42,48,0)', '#252A30']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30 }}
              />

              {/* Oiseau marcheur Lottie (superposé) */}
              <LottieView
                ref={walkCreatureRef}
                source={require('./assets/walk-creature.json')}
                style={{
                  position: 'absolute',
                  width: 45,
                  height: 45,
                  left: '40%',
                  bottom: 5,
                }}
                autoPlay={false}
                loop={true}
                speed={1.2}
              />
            </View>

            {/* Ligne unique : A/R + Boutons 30px + Durée */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 3 }}>
              {/* GAUCHE : Aller/Retour */}
              <TouchableOpacity
                onPress={() => setWalkRoundTrip(!walkRoundTrip)}
                style={{
                  borderWidth: 1,
                  borderColor: walkRoundTrip ? '#00D984' : '#333',
                  borderRadius: 6,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  backgroundColor: walkRoundTrip ? 'rgba(0,217,132,0.1)' : 'transparent',
                }}
              >
                <Text style={{ color: walkRoundTrip ? '#00D984' : '#888', fontSize: 8 }}>
                  {walkRoundTrip ? '\u2194 A/R \u00D72' : '\u2194 A/R'}
                </Text>
              </TouchableOpacity>

              {/* CENTRE : Boutons molettes 30px */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#555', fontSize: 9, marginRight: 3 }}>{String.fromCodePoint(0x25C0)}</Text>
                <Pressable onPressIn={() => startWalkMoving(-1)} onPressOut={stopWalkMoving}>
                  <Animated.View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#444', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', transform: [{ rotate: walkKnobRotateLeft }] }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#222', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ width: 1.5, height: 8, backgroundColor: '#CCC', position: 'absolute', top: 2 }} />
                    </View>
                  </Animated.View>
                </Pressable>
                <View style={{ width: 14 }} />
                <Pressable onPressIn={() => startWalkMoving(1)} onPressOut={stopWalkMoving}>
                  <Animated.View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#444', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', transform: [{ rotate: walkKnobRotateRight }] }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#222', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ width: 1.5, height: 8, backgroundColor: '#CCC', position: 'absolute', top: 2 }} />
                    </View>
                  </Animated.View>
                </Pressable>
                <Text style={{ color: '#555', fontSize: 9, marginLeft: 3 }}>{String.fromCodePoint(0x25B6)}</Text>
              </View>

              {/* DROITE : Durée */}
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#00D984', fontSize: 13, fontWeight: 'bold' }}>{walkDurStr}</Text>
                <Text style={{ color: '#666', fontSize: 6 }}>vitesse norm.</Text>
              </View>
            </View>

            {/* Maintenez sous les boutons */}
            <Text style={{ textAlign: 'center', color: '#555', fontSize: 7, marginTop: 1, fontStyle: 'italic' }}>
              {String.fromCodePoint(0x261F)} Maintenez pour avancer
            </Text>

            {/* Bouton CONFIRMER compact */}
            <TouchableOpacity
              onPress={async () => {
                if (walkCal === 0) return;
                const success = await saveActivity('marche',
                  Math.round(walkDurMin * walkMul),
                  walkCal,
                  'modere',
                  walkWater
                );
                if (success) {
                  setWalkSaved(true);
                  setTimeout(() => {
                    setWalkSaved(false);
                    setWalkScrollOffset(0);
                  }, 1500);
                }
              }}
              disabled={walkSaved || walkScrollOffset === 0}
              style={{
                backgroundColor: walkSaved ? '#00D984' : walkScrollOffset === 0 ? 'rgba(0,217,132,0.3)' : '#00D984',
                borderRadius: 10,
                paddingVertical: 8,
                alignItems: 'center',
                marginTop: 3,
              }}
            >
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>
                {walkSaved ? '\u2713 AJOUTÉ ! +5 Lix' : `\u2713 MARCHE \u2014 ${walkCal} kcal`}
              </Text>
            </TouchableOpacity>
          </MetalCard>

          {/* COURSE — SAVANE AFRICAINE + CHEVAL LOTTIE */}
          <SectionTitle title="Course" />
          <MetalCard style={{ marginBottom: wp(4) }}>
            {/* Header: Titre + données sur UNE ligne */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>{String.fromCodePoint(0x1F3C3)} COURSE</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: '#FF6B3D', fontSize: 10 }}>{String.fromCodePoint(0x1F4CD)}{runDistStr}</Text>
                <Text style={{ color: '#FF6B3D', fontSize: 10 }}>{String.fromCodePoint(0x1F525)}{runCalories}kcal</Text>
                <Text style={{ color: '#4DA6FF', fontSize: 10 }}>{String.fromCodePoint(0x1F4A7)}{runWater}ml</Text>
              </View>
            </View>

            {/* Canvas SVG — Savane Africaine + Lottie overlay */}
            <View
              style={{ height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: '#D4632A' }}
              onLayout={(e) => setRunCanvasW(e.nativeEvent.layout.width)}
            >
              <Svg width={runCanvasW} height={100} viewBox={`0 0 ${runCanvasW} 100`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                {(() => {
                  const cW = runCanvasW;
                  const cH = RUN_CANVAS_H;
                  const groundY = cH * 0.45;
                  const FOOTPRINT_START_X = cW * 0.4;
                  const sOff = runScrollOffset;
                  const trailY = groundY + cH * 0.15;
                  const trailH = cH * 0.2;
                  const jFrame = jaguarFrameRef.current;
                  const isMoving = isRunMovingRef.current;

                  // Savanna trees (scroll with parallax 0.3x)
                  const trees = [
                    { x: 100, type: 'acacia' }, { x: 400, type: 'baobab' },
                    { x: 750, type: 'acacia' }, { x: 1100, type: 'baobab' },
                    { x: 1500, type: 'acacia' }, { x: 2000, type: 'baobab' },
                    { x: 2600, type: 'acacia' }, { x: 3200, type: 'baobab' },
                    { x: 3800, type: 'acacia' }, { x: 4500, type: 'baobab' },
                    { x: 5200, type: 'acacia' }, { x: 6000, type: 'baobab' },
                    { x: 6800, type: 'acacia' }, { x: 7500, type: 'baobab' },
                    { x: 8200, type: 'acacia' },
                  ];

                  // Grass tufts
                  const grassTufts = Array.from({ length: 60 }, (_, i) => ({
                    x: i * 140 + (Math.sin(i * 7) * 30),
                    height: 3 + (i % 4) * 2,
                  }));

                  // Distance markers
                  const markers = [
                    { distance: 0, label: 'DÉPART' },
                    { distance: 1000, label: '1 km' },
                    { distance: 2000, label: '2 km' },
                    { distance: 5000, label: '5 km' },
                    { distance: 10000, label: '10 km' },
                    { distance: 21000, label: '21 km' },
                    { distance: 42000, label: '42 km' },
                  ];

                  // Birds (quasi-fixed)
                  const birds = [
                    { x: cW * 0.55, y: 12 }, { x: cW * 0.65, y: 18 },
                    { x: cW * 0.45, y: 22 }, { x: cW * 0.75, y: 8 },
                  ];

                  // Jaguar position (fixed center of screen)
                  const jaguarX = cW * 0.5;
                  const jaguarY = trailY + trailH * 0.4;
                  const bodyStretch = (jFrame === 0 || jFrame === 2) ? 1.1 : 0.95;
                  const bodyLift = (jFrame === 1 || jFrame === 3) ? -2 : 0;
                  const tailWave = Math.sin(jFrame * Math.PI / 2) * 3;

                  // Sun position (parallax 0.05x)
                  const sunX = cW * 0.8 - sOff * 0.05;
                  const sunY = cH * 0.38;

                  return (
                    <>
                      {/* COUCHE 1: CIEL COUCHER DE SOLEIL */}
                      <Rect x={0} y={0} width={cW} height={groundY} fill="#D4632A" />
                      <Rect x={0} y={cH * 0.3} width={cW} height={cH * 0.15} fill="#E8944A" opacity={0.7} />

                      {/* COUCHE 2: SOLEIL */}
                      <Circle cx={sunX} cy={sunY} r={35} fill="#FADE6A" opacity={0.15} />
                      <Circle cx={sunX} cy={sunY} r={22} fill="#F5C040" opacity={0.9} />
                      <Circle cx={sunX} cy={sunY} r={14} fill="#FADE6A" opacity={0.6} />

                      {/* COUCHE 5: OISEAUX */}
                      {birds.map((bird, i) => {
                        const bx = bird.x - sOff * 0.1;
                        return (
                          <Path key={`bird-${i}`}
                            d={`M${bx - 5} ${bird.y + 2} Q${bx - 2} ${bird.y - 2} ${bx} ${bird.y} Q${bx + 2} ${bird.y - 2} ${bx + 5} ${bird.y + 2}`}
                            fill="none" stroke="#1A0F05" strokeWidth={1} opacity={0.6} />
                        );
                      })}

                      {/* COUCHE 3: SILHOUETTES D'ARBRES (parallaxe 0.3x) */}
                      {trees.map((tree, i) => {
                        const tx = tree.x - sOff * 0.3;
                        if (tx < -40 || tx > cW + 40) return null;
                        const baseY = groundY;
                        if (tree.type === 'acacia') {
                          return (
                            <G key={`tree-${i}`}>
                              <Rect x={tx - 1} y={baseY - 30} width={3} height={30} fill="#1A0F05" opacity={0.8} />
                              <Ellipse cx={tx} cy={baseY - 32} rx={22} ry={8} fill="#1A0F05" opacity={0.8} />
                            </G>
                          );
                        } else {
                          return (
                            <G key={`tree-${i}`}>
                              <Path d={`M${tx - 5} ${baseY} L${tx - 3} ${baseY - 25} L${tx + 3} ${baseY - 25} L${tx + 5} ${baseY} Z`} fill="#1A0F05" opacity={0.8} />
                              <Ellipse cx={tx} cy={baseY - 28} rx={15} ry={10} fill="#1A0F05" opacity={0.8} />
                            </G>
                          );
                        }
                      })}

                      {/* COUCHE 4: SOL DE SAVANE */}
                      <Rect x={0} y={groundY} width={cW} height={cH * 0.55} fill="#5A3E1B" />

                      {/* Herbes sèches (défilent avec le sol) */}
                      {grassTufts.map((g, i) => {
                        const gx = g.x - sOff;
                        if (gx < -10 || gx > cW + 10) return null;
                        return (
                          <Path key={`grass-${i}`}
                            d={`M${gx - 3} ${groundY} L${gx} ${groundY - 8 - g.height} L${gx + 3} ${groundY} Z`}
                            fill="#7A6030" opacity={0.4 + (i % 3) * 0.1} />
                        );
                      })}

                      {/* Piste de terre battue */}
                      <Rect x={0} y={trailY} width={cW} height={trailH} fill="#4A3418" />

                      {/* COUCHE 8: MARQUEURS — poteaux en bois */}
                      {markers.map((marker, i) => {
                        const mx = FOOTPRINT_START_X + (marker.distance * RUN_PIXELS_PER_METER) - sOff;
                        if (mx < -20 || mx > cW + 20) return null;
                        return (
                          <G key={`mk-${i}`}>
                            <Rect x={mx - 1} y={groundY} width={3} height={cH * 0.25} fill="#3A2510" />
                            <Rect x={mx - 14} y={groundY + 2} width={28} height={12} fill="#5A3E1B" stroke="#3A2510" strokeWidth={0.5} />
                            <SvgText x={mx} y={groundY + 11} fill="#E8944A" fontSize={8} fontWeight="bold" textAnchor="middle">
                              {marker.label}
                            </SvgText>
                          </G>
                        );
                      })}

                      {/* COUCHE 6: NUAGE DE POUSSIÈRE (derrière le jaguar) */}
                      {isMoving && [
                        { dx: -20, dy: -2, r: 4, o: 0.25 },
                        { dx: -28, dy: -5, r: 3, o: 0.18 },
                        { dx: -35, dy: -1, r: 5, o: 0.12 },
                        { dx: -24, dy: 3, r: 3.5, o: 0.2 },
                        { dx: -40, dy: -3, r: 2.5, o: 0.08 },
                        { dx: -15, dy: 2, r: 3, o: 0.22 },
                      ].map((p, i) => (
                        <Circle key={`dust-${i}`}
                          cx={jaguarX + p.dx} cy={jaguarY + p.dy}
                          r={p.r} fill="#8C6E3C" opacity={p.o} />
                      ))}

                      {/* COUCHE 7: LE JAGUAR ANIMÉ */}
                      <G transform={`translate(${jaguarX}, ${jaguarY})`}>
                        {/* Corps (ellipse horizontale) */}
                        <Ellipse cx={0} cy={bodyLift} rx={16 * bodyStretch} ry={6} fill="#C4872C" />

                        {/* Taches */}
                        {[[-6, -2], [-1, -3], [5, -1], [8, -3]].map(([sx, sy], i) => (
                          <Ellipse key={`spot-${i}`} cx={sx} cy={sy + bodyLift} rx={2} ry={1.5} fill="#6B4513" />
                        ))}

                        {/* Tête */}
                        <Ellipse cx={16 * bodyStretch + 4} cy={bodyLift - 2} rx={5} ry={4} fill="#C4872C" />

                        {/* Oreilles */}
                        <Path d={`M${18 * bodyStretch + 1} ${bodyLift - 6} L${18 * bodyStretch + 3} ${bodyLift - 10} L${18 * bodyStretch + 5} ${bodyLift - 6} Z`} fill="#3A2510" />
                        <Path d={`M${18 * bodyStretch + 5} ${bodyLift - 6} L${18 * bodyStretch + 7} ${bodyLift - 9} L${18 * bodyStretch + 9} ${bodyLift - 5} Z`} fill="#3A2510" />

                        {/* Oeil */}
                        <Circle cx={20 * bodyStretch + 2} cy={bodyLift - 3} r={1.5} fill="#FFD" />
                        <Circle cx={20 * bodyStretch + 2.5} cy={bodyLift - 3} r={0.7} fill="#111" />

                        {/* Pattes */}
                        {jFrame === 0 ? (
                          <>
                            <Line x1={10} y1={4 + bodyLift} x2={22} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={8} y1={4 + bodyLift} x2={10} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={-8} y1={4 + bodyLift} x2={-6} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={-10} y1={4 + bodyLift} x2={-22} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                          </>
                        ) : jFrame === 1 ? (
                          <>
                            <Line x1={8} y1={2 + bodyLift} x2={6} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={5} y1={2 + bodyLift} x2={3} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={-5} y1={2 + bodyLift} x2={-3} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={-8} y1={2 + bodyLift} x2={-6} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                          </>
                        ) : jFrame === 2 ? (
                          <>
                            <Line x1={10} y1={4 + bodyLift} x2={20} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={6} y1={4 + bodyLift} x2={4} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={-6} y1={4 + bodyLift} x2={-4} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={-10} y1={4 + bodyLift} x2={-20} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                          </>
                        ) : (
                          <>
                            <Line x1={7} y1={2 + bodyLift} x2={5} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={4} y1={2 + bodyLift} x2={2} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={-4} y1={2 + bodyLift} x2={-2} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                            <Line x1={-7} y1={2 + bodyLift} x2={-5} y2={12 + bodyLift} stroke="#3A2510" strokeWidth={2} strokeLinecap="round" />
                          </>
                        )}

                        {/* Queue */}
                        <Path
                          d={`M${-16 * bodyStretch} ${bodyLift} Q${-22} ${bodyLift - 8 + tailWave} ${-26} ${bodyLift - 5 + tailWave}`}
                          fill="none" stroke="#C4872C" strokeWidth={2} strokeLinecap="round" />
                        <Path
                          d={`M${-25} ${bodyLift - 6 + tailWave} L${-27} ${bodyLift - 4 + tailWave}`}
                          fill="none" stroke="#3A2510" strokeWidth={2.5} strokeLinecap="round" />
                      </G>

                      {/* MILESTONE EFFECTS */}
                      {runMilestone === 500 && (
                        <Rect x={0} y={0} width={cW} height={cH} fill="white" opacity={0.15} />
                      )}
                      {runMilestone === 2000 && (
                        <SvgText x={cW / 2} y={cH / 2} fill="#F5C040" opacity={0.9} fontSize={16} fontWeight="bold" textAnchor="middle">
                          2 KM
                        </SvgText>
                      )}
                      {runMilestone === 21000 && (
                        <>
                          <Rect x={0} y={0} width={cW} height={cH} fill="#FFD700" opacity={0.06} />
                          <SvgText x={cW / 2} y={cH / 2} fill="#FFD700" opacity={0.9} fontSize={14} fontWeight="bold" textAnchor="middle">
                            SEMI-MARATHON
                          </SvgText>
                        </>
                      )}
                    </>
                  );
                })()}
              </Svg>

              {/* Brouillard gauche */}
              <LinearGradient
                colors={['#5A3E1B', 'rgba(90,62,27,0)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30 }}
              />
              {/* Brouillard droite */}
              <LinearGradient
                colors={['rgba(90,62,27,0)', '#5A3E1B']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30 }}
              />

              {/* Cheval Lottie (superposé, miroir vers la droite) */}
              <LottieView
                ref={horseAnimRef}
                source={require('./assets/horse-run.json')}
                style={{
                  position: 'absolute',
                  width: 70,
                  height: 45,
                  left: '35%',
                  bottom: 8,
                  transform: [{ scaleX: -1 }],
                }}
                autoPlay={false}
                loop={true}
                speed={1.5}
              />

              {/* Nuage de poussière (visible seulement quand le cheval court) */}
              {isCourseMoving && (
                <View style={{
                  position: 'absolute',
                  left: '22%',
                  bottom: 6,
                  flexDirection: 'row',
                  opacity: 0.6,
                }}>
                  {[0.4, 0.3, 0.2, 0.1].map((op, i) => (
                    <View key={i} style={{
                      width: 5 + i * 3,
                      height: 5 + i * 3,
                      borderRadius: 10,
                      backgroundColor: `rgba(140, 110, 60, ${op})`,
                      marginRight: 2,
                    }} />
                  ))}
                </View>
              )}
            </View>

            {/* Ligne unique : A/R + Boutons 30px + Durée */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: 3 }}>
              {/* GAUCHE : Aller/Retour */}
              <TouchableOpacity
                onPress={() => setRunRoundTrip(!runRoundTrip)}
                style={{
                  borderWidth: 1,
                  borderColor: runRoundTrip ? '#00D984' : '#333',
                  borderRadius: 6,
                  paddingHorizontal: 5,
                  paddingVertical: 2,
                  backgroundColor: runRoundTrip ? 'rgba(0,217,132,0.1)' : 'transparent',
                }}
              >
                <Text style={{ color: runRoundTrip ? '#00D984' : '#888', fontSize: 8 }}>
                  {runRoundTrip ? '\u2194 A/R \u00D72' : '\u2194 A/R'}
                </Text>
              </TouchableOpacity>

              {/* CENTRE : Boutons molettes 30px */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#555', fontSize: 9, marginRight: 3 }}>{String.fromCodePoint(0x25C0)}</Text>
                <Pressable onPressIn={() => startRunMoving(-1)} onPressOut={stopRunMoving}>
                  <Animated.View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#444', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', transform: [{ rotate: runKnobRotateLeft }] }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#222', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ width: 1.5, height: 8, backgroundColor: '#CCC', position: 'absolute', top: 2 }} />
                    </View>
                  </Animated.View>
                </Pressable>
                <View style={{ width: 14 }} />
                <Pressable onPressIn={() => startRunMoving(1)} onPressOut={stopRunMoving}>
                  <Animated.View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#1A1A1A', borderWidth: 1.5, borderColor: '#444', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', transform: [{ rotate: runKnobRotateRight }] }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#222', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ width: 1.5, height: 8, backgroundColor: '#CCC', position: 'absolute', top: 2 }} />
                    </View>
                  </Animated.View>
                </Pressable>
                <Text style={{ color: '#555', fontSize: 9, marginLeft: 3 }}>{String.fromCodePoint(0x25B6)}</Text>
              </View>

              {/* DROITE : Durée */}
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#00D984', fontSize: 13, fontWeight: 'bold' }}>{runDurStr}</Text>
                <Text style={{ color: '#666', fontSize: 6 }}>vitesse norm.</Text>
              </View>
            </View>

            {/* Maintenez sous les boutons */}
            <Text style={{ textAlign: 'center', color: '#555', fontSize: 7, marginTop: 1, fontStyle: 'italic' }}>
              {String.fromCodePoint(0x261F)} Maintenez pour avancer
            </Text>

            {/* Bouton CONFIRMER compact — VERT */}
            <TouchableOpacity
              onPress={handleAddRun}
              disabled={runSaved || runScrollOffset === 0}
              style={{
                backgroundColor: runSaved ? '#00D984' : runScrollOffset === 0 ? 'rgba(0,217,132,0.3)' : '#00D984',
                borderRadius: 10,
                paddingVertical: 8,
                alignItems: 'center',
                marginTop: 3,
              }}
            >
              <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 13 }}>
                {runSaved ? '\u2713 AJOUTÉ ! +5 Lix' : `\u2713 COURSE \u2014 ${runCalories} kcal`}
              </Text>
            </TouchableOpacity>
          </MetalCard>

          {/* OTHER SPORTS GRID */}
          <SectionTitle title="Autres activités" />
          <View style={{
            flexDirection: 'row', flexWrap: 'wrap',
            paddingHorizontal: wp(14), gap: wp(8),
          }}>
            {OTHER_SPORTS.map((key) => (
              <View key={key} style={{ width: (W - wp(14) * 2 - wp(8)) / 2 }}>
                <SportCard
                  sportKey={key}
                  onPress={() => { setModalSport(key); setModalVisible(true); }}
                />
              </View>
            ))}
          </View>

          {/* TODAY'S HISTORY */}
          <View style={{ marginTop: wp(8) }}>
            <SectionTitle title="Aujourd'hui" />
          </View>

          {todayActivities.length === 0 ? (
            <MetalCard>
              <View style={{ alignItems: 'center', paddingVertical: wp(10) }}>
                <Text style={{ color: '#555E6C', fontSize: fp(11), fontWeight: '600', textAlign: 'center' }}>
                  Aucune activité aujourd'hui — commencez par une marche !
                </Text>
              </View>
            </MetalCard>
          ) : (
            todayActivities.map((act) => {
              const sportData = ACTIVITY_DATA[act.type] || {};
              const iconText = sportData.icon || String.fromCodePoint(0x1F3C5);
              const sportColor = sportData.color || '#00D984';
              const createdTime = act.created_at
                ? new Date(act.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <MetalCard key={act.id}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: fp(18), marginRight: wp(8) }}>{iconText}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>
                          {act.name}
                        </Text>
                        <View style={{ flexDirection: 'row', marginTop: wp(2), gap: wp(8) }}>
                          <Text style={{ color: '#8892A0', fontSize: fp(9) }}>
                            {formatDuration(act.duration_minutes)}
                          </Text>
                          <Text style={{ color: '#FF8C42', fontSize: fp(9), fontWeight: '700' }}>
                            {act.calories_burned} kcal
                          </Text>
                          {act.water_lost_ml > 0 && (
                            <Text style={{ color: '#4DA6FF', fontSize: fp(9) }}>
                              {String.fromCodePoint(0x1F4A7)} {act.water_lost_ml} ml
                            </Text>
                          )}
                          <Text style={{ color: '#555E6C', fontSize: fp(9) }}>
                            {createdTime}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleDeleteActivity(act)}
                      style={{
                        width: wp(24), height: wp(24), borderRadius: wp(12),
                        backgroundColor: 'rgba(255,107,107,0.1)',
                        justifyContent: 'center', alignItems: 'center',
                        marginLeft: wp(8),
                      }}
                    >
                      <Ionicons name="close" size={wp(14)} color="#FF6B6B" />
                    </Pressable>
                  </View>
                </MetalCard>
              );
            })
          )}

          {/* REWARD BADGE */}
          <View style={{
            alignItems: 'center', marginTop: wp(12), marginBottom: wp(16),
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(212,175,55,0.08)',
              paddingHorizontal: wp(16), paddingVertical: wp(8),
              borderRadius: wp(14),
              borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
            }}>
              <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>{String.fromCodePoint(0x1F3C6)}</Text>
              <Text style={{ color: '#D4AF37', fontSize: fp(11), fontWeight: '700' }}>
                +5 Lix par activité
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Tab Bar — FIX 1 */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <BottomTabs activeTab={activeTab} onTabPress={handleTabPress} />
      </View>


      {/* Sport Modal */}
      <SportModal
        visible={modalVisible}
        sportKey={modalSport}
        onClose={() => setModalVisible(false)}
        onSave={handleSportSave}
      />
    </View>
  );
};

export default ActivityPage;
