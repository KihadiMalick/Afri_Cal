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
import { createClient } from '@supabase/supabase-js';

// ── Supabase ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ── Screen dimensions ────────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;

// ── Responsive system ────────────────────────────────────────────────────────
const { width: W } = Dimensions.get('window');
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
  course: { kcal_per_hour: 700, icon: '🏃', label: 'Course', color: '#FF8C42', km_per_hour: 10, water_per_hour_ml: 900 },
  velo: { kcal_per_hour: 500, icon: '🚴', label: 'Vélo', color: '#4DA6FF', water_per_hour_ml: 600 },
  natation: { kcal_per_hour: 600, icon: '🏊', label: 'Natation', color: '#00BCD4', water_per_hour_ml: 700 },
  musculation: { kcal_per_hour: 400, icon: '🏋️', label: 'Musculation', color: '#FF6B6B', water_per_hour_ml: 500 },
  yoga: { kcal_per_hour: 200, icon: '🧘', label: 'Yoga', color: '#B39DDB', water_per_hour_ml: 300 },
  corde: { kcal_per_hour: 800, icon: '⏭', label: 'Corde à sauter', color: '#FFD93D', water_per_hour_ml: 800 },
  football: { kcal_per_hour: 600, icon: '⚽', label: 'Football', color: '#66BB6A', water_per_hour_ml: 700 },
  basketball: { kcal_per_hour: 650, icon: '🏀', label: 'Basketball', color: '#FF7043', water_per_hour_ml: 750 },
  danse: { kcal_per_hour: 450, icon: '💃', label: 'Danse', color: '#EC407A', water_per_hour_ml: 500 },
};

const WALK_FLAGS = [
  { distance: 100, label: '100m' },
  { distance: 500, label: '500m' },
  { distance: 1000, label: '1 km' },
  { distance: 2000, label: '2 km' },
  { distance: 5000, label: '5 km' },
  { distance: 10000, label: '10 km' },
];

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
    marginBottom: wp(12),
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

// ── SectionTitle ─────────────────────────────────────────────────────────────
const SectionTitle = ({ title, rightAction, rightLabel }) => (
  <View style={{
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: wp(16), marginBottom: wp(12),
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
      fill="none" stroke="#FF8C42" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 12 L18 6 Q19 4 21 5 L24 7 Q25 8 24 10"
      fill="none" stroke="#FF8C42" strokeWidth={2} strokeLinecap="round" />
    <Line x1="18" y1="15" x2="17" y2="11" stroke="#FF8C42" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Line x1="22" y1="14" x2="21" y2="10" stroke="#FF8C42" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
    <Path d="M8 28 L30 28" stroke="#FF8C42" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
    <Line x1="0" y1="20" x2="5" y2="20" stroke="#FF8C42" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
    <Line x1="-1" y1="23" x2="4" y2="23" stroke="#FF8C42" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
    <Line x1="1" y1="17" x2="5" y2="17" stroke="#FF8C42" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
    <Line x1="-2" y1="26" x2="3" y2="26" stroke="#FF8C42" strokeWidth={2} strokeLinecap="round" opacity={0.3} />
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

  // Walk modal
  const [walkModalVisible, setWalkModalVisible] = useState(false);
  const [walkMode, setWalkMode] = useState('distance');
  const [walkSliderValue, setWalkSliderValue] = useState(0);
  const [walkRoundTrip, setWalkRoundTrip] = useState(false);
  const [walkSaved, setWalkSaved] = useState(false);
  const [walkBarWidth, setWalkBarWidth] = useState(W - wp(64));
  const [walkCanvasWidth, setWalkCanvasWidth] = useState(SCREEN_H - 24);
  const [walkCanvasHeight, setWalkCanvasHeight] = useState(SCREEN_W - 100);

  // Run slider
  const [runMode, setRunMode] = useState('distance');
  const [runValue, setRunValue] = useState(0.15);

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

  // ── Calculations ───────────────────────────────────────────────────────
  const WALK_MAX_DIST = 10000; // 10 km in metres
  const RUN_MAX_DIST = 21000;  // 21 km in metres
  const MAX_TIME = 60;         // minutes

  // FIX 3: Run — use non-linear distance interpolation
  const runDistanceM = runMode === 'distance' ? sliderToDistance(runValue, RUN_FLAGS) : null;
  const runDistanceKm = runDistanceM !== null ? runDistanceM / 1000 : null;
  const runTimeMins = runMode === 'temps' ? runValue * MAX_TIME : null;

  const runCalories = runMode === 'distance'
    ? Math.round((runDistanceKm / ACTIVITY_DATA.course.km_per_hour) * ACTIVITY_DATA.course.kcal_per_hour)
    : Math.round((runTimeMins / 60) * ACTIVITY_DATA.course.kcal_per_hour);

  const runDuration = runMode === 'distance'
    ? Math.round((runDistanceKm / ACTIVITY_DATA.course.km_per_hour) * 60)
    : Math.round(runTimeMins);

  const runDistDisplay = runMode === 'distance'
    ? runDistanceKm
    : (runTimeMins / 60) * ACTIVITY_DATA.course.km_per_hour;

  const runWater = Math.round((runDuration / 60) * ACTIVITY_DATA.course.water_per_hour_ml);

  // Day totals
  const totalCalories = todayActivities.reduce((s, a) => s + (a.calories_burned || 0), 0);
  const totalDuration = todayActivities.reduce((s, a) => s + (a.duration_minutes || 0), 0);
  const totalWater = todayActivities.reduce((s, a) => s + (a.water_lost_ml || 0), 0);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAddRun = async () => {
    const dur = runDuration;
    const cal = runCalories;
    const water = runWater;
    const ok = await saveActivity('course', dur, cal, 'modere', water);
    if (ok) {
      setRunSaved(true);
      setTimeout(() => setRunSaved(false), 1500);
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

  // ── Walk computed values ─────────────────────────────────────────────────
  const WALK_DIST_MAP = [
    { pos: 0, meters: 0 }, { pos: 0.25, meters: 500 }, { pos: 0.5, meters: 2000 },
    { pos: 0.75, meters: 5000 }, { pos: 1.0, meters: 10000 },
  ];
  const WALK_TIME_MAP = [
    { pos: 0, min: 0 }, { pos: 0.25, min: 15 }, { pos: 0.5, min: 30 },
    { pos: 0.75, min: 60 }, { pos: 1.0, min: 120 },
  ];
  const interpMap = (map, val, key) => {
    for (let i = 1; i < map.length; i++) {
      if (val <= map[i].pos) {
        const p = map[i - 1], c = map[i];
        return p[key] + (c[key] - p[key]) * ((val - p.pos) / (c.pos - p.pos));
      }
    }
    return map[map.length - 1][key];
  };
  const walkDistMeters = walkMode === 'distance'
    ? interpMap(WALK_DIST_MAP, walkSliderValue, 'meters')
    : (interpMap(WALK_TIME_MAP, walkSliderValue, 'min') / 60) * 5000;
  const walkDurMinutes = walkMode === 'distance'
    ? (walkDistMeters / 5000) * 60
    : interpMap(WALK_TIME_MAP, walkSliderValue, 'min');
  const walkCalBase = (walkDurMinutes / 60) * 280;
  const walkWaterMl = (walkDurMinutes / 60) * 400;
  const walkMult = walkRoundTrip ? 2 : 1;
  const walkCaloriesDisplay = Math.round(walkCalBase * walkMult);
  const walkDistDisplay = (() => {
    const d = walkDistMeters * walkMult;
    return d < 1000 ? `${Math.round(d)} m` : `${Math.round(d / 100) / 10} km`;
  })();
  const walkDurDisplay = (() => {
    const m = Math.round(walkDurMinutes * walkMult);
    return m < 60 ? `${m} min` : `${Math.round(m / 6) / 10} h`;
  })();
  const walkWaterDisplay = Math.round(walkWaterMl * walkMult);

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

          {/* CARTE MARCHE — compacte */}
          <SectionTitle title="Marche" />
          <View style={{
            borderRadius: wp(18), padding: wp(1.2),
            backgroundColor: '#4A4F55',
            shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
            marginHorizontal: wp(14), marginBottom: wp(12),
          }}>
            <LinearGradient
              colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
              style={{ borderRadius: wp(17), overflow: 'hidden' }}
            >
              <View style={{ padding: wp(16), borderWidth: 1, borderColor: 'rgba(0,0,0,0.25)', borderRadius: wp(17) }}>
                <View style={{ position: 'absolute', top: 0, left: 25, right: 25, height: 1, backgroundColor: 'rgba(0,217,132,0.10)' }} />

                {/* Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
                  <Text style={{ fontSize: 22, marginRight: 8 }}>{String.fromCodePoint(0x1F6B6)}</Text>
                  <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800', letterSpacing: 1 }}>MARCHE</Text>
                </View>

                {/* Phrase motivante */}
                <Text style={{ color: '#8892A0', fontSize: fp(11), lineHeight: fp(16), marginBottom: wp(10) }}>
                  La marche est le meilleur exercice. <Text style={{ color: '#00D984', fontWeight: '700' }}>30 min/jour</Text> change votre vie.
                </Text>

                {/* Info calories */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(12) }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF8C42', marginRight: 6 }} />
                  <Text style={{ color: '#5A6070', fontSize: fp(10) }}>~56 kcal/km à vitesse normale {String.fromCodePoint(0x2022)} {String.fromCodePoint(0x1F4A7)} ~80 ml/km</Text>
                </View>

                {/* Bouton Marcher */}
                <Pressable
                  onPress={() => {
                    setWalkSliderValue(0);
                    setWalkRoundTrip(false);
                    setWalkSaved(false);
                    setWalkMode('distance');
                    setWalkModalVisible(true);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: wp(12),
                    borderRadius: 14,
                    backgroundColor: pressed ? '#00B572' : '#00D984',
                    alignItems: 'center',
                  })}
                >
                  <Text style={{ color: '#0D1117', fontSize: fp(14), fontWeight: '800' }}>{String.fromCodePoint(0x1F6B6)} Marcher</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>

          {/* RUN HERO */}
          <SectionTitle title="Course" />
          <MetalCard>
            <View>
              {/* Card header */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: wp(4),
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <RunShoeIcon size={wp(18)} />
                  <Text style={{
                    color: '#EAEEF3', fontSize: fp(14), fontWeight: '800',
                    letterSpacing: 1.5, marginLeft: wp(6),
                  }}>
                    COURSE
                  </Text>
                </View>
                <ModePill mode={runMode} onToggle={setRunMode} accentColor="#FF8C42" />
              </View>

              {/* Slider */}
              <ActivitySlider
                type="course"
                mode={runMode}
                value={runValue}
                onChange={setRunValue}
                shoeAnim={shoeAnim}
                flags={RUN_FLAGS}
                maxDistance={RUN_MAX_DIST}
                maxTime={MAX_TIME}
                accentColor="#FF8C42"
              />

              {/* Value display — FIX 4: formatted durations */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
                marginTop: wp(10), paddingHorizontal: wp(4),
              }}>
                <View>
                  <Text style={{ color: '#FF8C42', fontSize: fp(22), fontWeight: '900' }}>
                    {formatDistance(runDistDisplay * 1000)}
                  </Text>
                  {runMode === 'temps' && (
                    <Text style={{ color: '#555E6C', fontSize: fp(9), marginTop: wp(2) }}>
                      ~{formatDistance(runDistDisplay * 1000)} à allure modérée
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#FF8C42', fontSize: fp(18), fontWeight: '900' }}>
                    {runCalories} kcal
                  </Text>
                  <Text style={{ color: '#555E6C', fontSize: fp(9), marginTop: wp(2) }}>
                    ~{formatDuration(runDuration)} {String.fromCodePoint(0x00B7)} {String.fromCodePoint(0x1F4A7)} {runWater} ml
                  </Text>
                </View>
              </View>

              {/* Add button — FIX 7: feedback */}
              <TouchableOpacity
                onPress={handleAddRun}
                activeOpacity={0.7}
                style={{
                  backgroundColor: runSaved ? '#2ECC71' : '#FF8C42',
                  borderRadius: wp(12),
                  paddingVertical: wp(11), alignItems: 'center',
                  marginTop: wp(14),
                }}
              >
                <Text style={{ color: '#000', fontSize: fp(12), fontWeight: '800' }}>
                  {runSaved ? '✓ AJOUTÉ ! +5 Lix' : `✓ AJOUTER COURSE — ${runCalories} kcal`}
                </Text>
              </TouchableOpacity>
            </View>
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

      {/* MODAL MARCHE FULLSCREEN — MODE PAYSAGE */}
      <Modal visible={walkModalVisible} animationType="slide" transparent={false} supportedOrientations={['portrait', 'landscape']}>
        <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
          {/* Contenu tourné en paysage */}
          <View style={{
            width: SCREEN_H,
            height: SCREEN_W,
            transform: [{ rotate: '90deg' }, { translateX: (SCREEN_H - SCREEN_W) / 2 }, { translateY: (SCREEN_H - SCREEN_W) / 2 }],
          }}>
            <LinearGradient
              colors={['#1E2530', '#222A35', '#1A2029']}
              style={{ flex: 1 }}
            >
              {/* Header compact — une seule ligne */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: 8,
              }}>
                {/* Fermer */}
                <Pressable onPress={() => setWalkModalVisible(false)}>
                  <Text style={{ color: '#8892A0', fontSize: 13 }}>{String.fromCodePoint(0x2715)}</Text>
                </Pressable>

                {/* Toggle Distance/Temps — compact */}
                <View style={{
                  flexDirection: 'row',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 10, padding: 2,
                }}>
                  <Pressable
                    onPress={() => { setWalkMode('distance'); setWalkSliderValue(0); }}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8,
                      backgroundColor: walkMode === 'distance' ? '#00D984' : 'transparent',
                    }}
                  >
                    <Text style={{ color: walkMode === 'distance' ? '#0D1117' : '#8892A0', fontSize: 11, fontWeight: '700' }}>Distance</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { setWalkMode('temps'); setWalkSliderValue(0); }}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8,
                      backgroundColor: walkMode === 'temps' ? '#00D984' : 'transparent',
                    }}
                  >
                    <Text style={{ color: walkMode === 'temps' ? '#0D1117' : '#8892A0', fontSize: 11, fontWeight: '700' }}>Temps</Text>
                  </Pressable>
                </View>

                {/* Aller/Retour compact */}
                <Pressable onPress={() => setWalkRoundTrip(!walkRoundTrip)}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                    backgroundColor: walkRoundTrip ? 'rgba(0,217,132,0.15)' : 'rgba(255,255,255,0.05)',
                    borderWidth: 1, borderColor: walkRoundTrip ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{ color: walkRoundTrip ? '#00D984' : '#8892A0', fontSize: 10, fontWeight: '700' }}>
                    {String.fromCodePoint(0x2194)} A/R {walkRoundTrip ? String.fromCodePoint(0x00D7) + '2' : ''}
                  </Text>
                </Pressable>

                {/* Infos calories — compact */}
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#FF8C42', fontSize: 18, fontWeight: '900' }}>
                    {Math.round(walkCaloriesDisplay)} kcal
                  </Text>
                  <Text style={{ color: '#5A6070', fontSize: 9 }}>
                    {walkDistDisplay} {String.fromCodePoint(0x00B7)} {walkDurDisplay} {String.fromCodePoint(0x00B7)} {String.fromCodePoint(0x1F4A7)} {walkWaterDisplay} ml
                  </Text>
                </View>
              </View>

              {/* CANVAS — occupe presque tout l'espace restant */}
              <View
                style={{
                  flex: 1,
                  marginHorizontal: 12,
                  marginBottom: 8,
                  borderRadius: 16,
                  backgroundColor: 'rgba(0,217,132,0.03)',
                  borderWidth: 1,
                  borderColor: 'rgba(0,217,132,0.08)',
                  overflow: 'hidden',
                }}
                onLayout={(e) => {
                  setWalkCanvasWidth(e.nativeEvent.layout.width);
                  setWalkCanvasHeight(e.nativeEvent.layout.height);
                }}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(evt) => {
                  const x = evt.nativeEvent.locationX;
                  setWalkSliderValue(Math.max(0, Math.min(1, x / (walkCanvasWidth || 1))));
                }}
                onResponderMove={(evt) => {
                  const x = evt.nativeEvent.locationX;
                  setWalkSliderValue(Math.max(0, Math.min(1, x / (walkCanvasWidth || 1))));
                }}
              >
                <Svg width={walkCanvasWidth || SCREEN_H - 24} height={walkCanvasHeight || SCREEN_W - 80}
                  viewBox={`0 0 ${walkCanvasWidth || 600} ${walkCanvasHeight || 250}`}>

                  {/* Gazon subtil — petites touffes d'herbe */}
                  {Array.from({ length: 50 }, (_, i) => {
                    const x = (i / 50) * (walkCanvasWidth || 600);
                    const h = walkCanvasHeight || 250;
                    return (
                      <G key={`g-${i}`}>
                        <Line x1={x} y1={h} x2={x - 1} y2={h - 4 - Math.random() * 3} stroke="#00D984" strokeWidth={0.8} opacity={0.08} />
                        <Line x1={x + 2} y1={h} x2={x + 1} y2={h - 3 - Math.random() * 3} stroke="#00D984" strokeWidth={0.8} opacity={0.06} />
                      </G>
                    );
                  })}

                  {/* Ligne de sol */}
                  <Line x1={0} y1={(walkCanvasHeight || 250) - 1} x2={walkCanvasWidth || 600} y2={(walkCanvasHeight || 250) - 1}
                    stroke="#00D984" strokeWidth={0.5} opacity={0.1} />

                  {(() => {
                    const cW = walkCanvasWidth || 600;
                    const cH = walkCanvasHeight || 250;
                    const midY = cH * 0.55;
                    const margin = cW * 0.06;
                    const usable = cW - margin * 2;
                    const passed = (p) => walkSliderValue >= p;

                    return (
                      <>
                        {/* ===== MAISON — Départ (colorée, premium) ===== */}
                        <G transform={`translate(${margin}, ${midY - 15})`}>
                          {/* Cheminée */}
                          <Rect x={6} y={-12} width={3} height={6} fill="#8892A0" opacity={0.5} />
                          {/* Fumée */}
                          <Circle cx={8} cy={-14} r={2} fill="#8892A0" opacity={0.2} />
                          <Circle cx={10} cy={-17} r={1.5} fill="#8892A0" opacity={0.15} />
                          {/* Toit */}
                          <Path d="M-2 -4 L10 -12 L22 -4 Z" fill="#FF6B6B" opacity={0.7} />
                          {/* Mur */}
                          <Rect x={0} y={-4} width={20} height={16} fill="#FFE4B5" opacity={0.6} />
                          {/* Porte */}
                          <Rect x={7} y={2} width={6} height={10} rx={1} fill="#8B6914" opacity={0.7} />
                          {/* Poignée */}
                          <Circle cx={11.5} cy={7} r={0.8} fill="#D4AF37" opacity={0.8} />
                          {/* Fenêtre gauche */}
                          <Rect x={1.5} y={-1} width={4} height={4} rx={0.5} fill="#4DA6FF" opacity={0.4} />
                          <Line x1={3.5} y1={-1} x2={3.5} y2={3} stroke="#FFE4B5" strokeWidth={0.5} opacity={0.5} />
                          <Line x1={1.5} y1={1} x2={5.5} y2={1} stroke="#FFE4B5" strokeWidth={0.5} opacity={0.5} />
                          {/* Fenêtre droite */}
                          <Rect x={14.5} y={-1} width={4} height={4} rx={0.5} fill="#4DA6FF" opacity={0.4} />
                        </G>

                        {/* ===== ARBRE — position 22% (coloré, premium) ===== */}
                        <G transform={`translate(${margin + 0.22 * usable}, ${midY - 10})`}>
                          {/* Tronc texturé */}
                          <Rect x={-2} y={6} width={4} height={14} fill="#8B6914" opacity={0.7} />
                          <Line x1={-1} y1={8} x2={-1} y2={18} stroke="#6B4C12" strokeWidth={0.5} opacity={0.3} />
                          <Line x1={1} y1={7} x2={1} y2={19} stroke="#A07A18" strokeWidth={0.5} opacity={0.2} />
                          {/* Feuillage — 3 cercles verts riches */}
                          <Circle cx={0} cy={-2} r={10} fill="#2ECC71" opacity={0.7} />
                          <Circle cx={-6} cy={2} r={7} fill="#27AE60" opacity={0.6} />
                          <Circle cx={6} cy={2} r={7} fill="#27AE60" opacity={0.6} />
                          <Circle cx={0} cy={-6} r={5} fill="#58D68D" opacity={0.4} />
                          {/* Pomme qui tombe si passé */}
                          {passed(0.22) && (
                            <G>
                              <Circle cx={7} cy={18} r={3} fill="#FF3B30" opacity={0.8} />
                              <Line x1={7} y1={15} x2={7.5} y2={13.5} stroke="#8B6914" strokeWidth={1} />
                              <Ellipse cx={8.5} cy={13} rx={2} ry={1} fill="#27AE60" opacity={0.5} transform="rotate(-30, 8.5, 13)" />
                            </G>
                          )}
                        </G>

                        {/* ===== BANC — position 42% (coloré, détaillé) ===== */}
                        <G transform={`translate(${margin + 0.42 * usable}, ${midY + 2})`}>
                          {/* Planches assise — bois chaud */}
                          <Rect x={-12} y={-2} width={24} height={2.5} rx={1} fill="#D4A574" opacity={0.8} />
                          <Rect x={-12} y={1} width={24} height={2.5} rx={1} fill="#C4956A" opacity={0.7} />
                          {/* Planches dossier */}
                          <Rect x={-11} y={-8} width={22} height={2} rx={1} fill="#D4A574" opacity={0.7} />
                          <Rect x={-11} y={-5.5} width={22} height={2} rx={1} fill="#C4956A" opacity={0.6} />
                          {/* Pieds métal */}
                          <Path d="M-9 3.5 L-10 10 L-8 10 L-7 3.5" fill="#5A6070" opacity={0.7} />
                          <Path d="M9 3.5 L8 10 L10 10 L11 3.5" fill="#5A6070" opacity={0.7} />
                          {/* Montants dossier */}
                          <Rect x={-9} y={-8} width={2} height={11} rx={0.5} fill="#5A6070" opacity={0.6} />
                          <Rect x={9} y={-8} width={2} height={11} rx={0.5} fill="#5A6070" opacity={0.6} />
                          {/* Accoudoirs */}
                          <Rect x={-13} y={-3} width={4} height={2} rx={1} fill="#5A6070" opacity={0.5} />
                          <Rect x={11} y={-3} width={4} height={2} rx={1} fill="#5A6070" opacity={0.5} />
                        </G>

                        {/* ===== OISEAUX — position 65% (vrais oiseaux SVG, colorés, GRANDS) ===== */}
                        <G transform={`translate(${margin + 0.65 * usable}, ${midY - (passed(0.65) ? 25 : 5)})`}>
                          {/* Oiseau 1 — grand, bleu */}
                          <G transform="translate(0, 0)">
                            <Ellipse cx={0} cy={0} rx={5} ry={3} fill="#4DA6FF" opacity={0.8} />
                            <Circle cx={-4} cy={-1.5} r={2.5} fill="#4DA6FF" opacity={0.8} />
                            <Path d="M-6.5 -1.5 L-8.5 -0.5 L-6.5 0" fill="#FF8C42" opacity={0.9} />
                            <Circle cx={-5} cy={-2} r={0.7} fill="white" />
                            <Circle cx={-5.2} cy={-2} r={0.4} fill="#0D1117" />
                            {/* Aile */}
                            <Path d="M-1 -2 Q3 -8 8 -3 Q4 -1 0 0" fill="#5BC0EB" opacity={0.6} />
                            {/* Queue */}
                            <Path d="M5 0 L9 -2 L8 1 Z" fill="#4DA6FF" opacity={0.6} />
                          </G>

                          {/* Oiseau 2 — petit, vert */}
                          <G transform="translate(14, -8) scale(0.7)">
                            <Ellipse cx={0} cy={0} rx={5} ry={3} fill="#00D984" opacity={0.7} />
                            <Circle cx={-4} cy={-1.5} r={2.5} fill="#00D984" opacity={0.7} />
                            <Path d="M-6.5 -1.5 L-8 -0.5 L-6.5 0" fill="#FF8C42" opacity={0.8} />
                            <Circle cx={-5} cy={-2} r={0.6} fill="white" />
                            <Circle cx={-5.2} cy={-2} r={0.35} fill="#0D1117" />
                            <Path d="M-1 -2 Q3 -7 7 -2 Q3 0 0 0" fill="#5DFFB4" opacity={0.5} />
                          </G>

                          {/* Oiseau 3 — moyen, jaune */}
                          <G transform="translate(-12, -12) scale(0.6)">
                            <Ellipse cx={0} cy={0} rx={5} ry={3} fill="#FFD93D" opacity={0.7} />
                            <Circle cx={-4} cy={-1.5} r={2.5} fill="#FFD93D" opacity={0.7} />
                            <Path d="M-6.5 -1.5 L-8 -0.5 L-6.5 0" fill="#FF8C42" opacity={0.8} />
                            <Circle cx={-5} cy={-2} r={0.6} fill="white" />
                            <Circle cx={-5.2} cy={-2} r={0.35} fill="#0D1117" />
                            <Path d="M-1 -2 Q3 -7 7 -2 Q3 0 0 0" fill="#FFE066" opacity={0.5} />
                          </G>
                        </G>

                        {/* ===== ÉTANG + CANARD — position 93% (coloré, vivant) ===== */}
                        <G transform={`translate(${margin + 0.93 * usable}, ${midY})`}>
                          {/* Eau */}
                          <Ellipse cx={0} cy={5} rx={20} ry={12} fill="#4DA6FF" opacity={0.12} />
                          <Ellipse cx={0} cy={5} rx={16} ry={9} fill="#4DA6FF" opacity={0.08} />
                          {/* Rides */}
                          <Path d="M-12 4 Q-6 1 0 4 Q6 7 12 4" fill="none" stroke="#4DA6FF" strokeWidth={0.8} opacity={0.25} />
                          <Path d="M-9 8 Q-3 5 3 8 Q9 11 15 8" fill="none" stroke="#4DA6FF" strokeWidth={0.6} opacity={0.15} />
                          {/* Nénuphars */}
                          <Ellipse cx={-10} cy={8} rx={3} ry={1.5} fill="#27AE60" opacity={0.4} />
                          <Circle cx={-10} cy={7} r={1} fill="#FF6B8A" opacity={0.3} />
                          <Ellipse cx={8} cy={10} rx={2.5} ry={1.2} fill="#27AE60" opacity={0.3} />
                          {/* Canard — coloré et vivant */}
                          <Ellipse cx={0} cy={1} rx={6} ry={3.5} fill="#FFB800" opacity={0.85} />
                          <Circle cx={-5} cy={-2} r={3.5} fill="#27AE60" opacity={0.8} />
                          <Path d="M-8.5 -2 L-11 -1 L-8.5 0" fill="#FF8C42" opacity={0.9} />
                          <Circle cx={-6} cy={-2.5} r={1} fill="white" />
                          <Circle cx={-6.3} cy={-2.5} r={0.5} fill="#0D1117" />
                          {/* Queue relevée */}
                          <Path d="M6 -1 L9 -4 L7 0" fill="#FFB800" opacity={0.7} />
                          {/* Reflet dans l'eau */}
                          <Ellipse cx={0} cy={6} rx={5} ry={2} fill="#FFB800" opacity={0.1} />
                        </G>

                        {/* ===== TRACES DE PAS — orientées horizontalement, moins nombreuses ===== */}
                        {(() => {
                          const prints = [];
                          const totalPrints = 14;

                          for (let i = 0; i < totalPrints; i++) {
                            const t = i / totalPrints;
                            if (t > walkSliderValue) break;

                            const baseX = margin + t * usable;

                            let waveY = 0;
                            const nearTree = Math.abs(t - 0.22) < 0.06;
                            const nearBench = Math.abs(t - 0.42) < 0.06;
                            const nearBirds = Math.abs(t - 0.65) < 0.05;

                            if (nearTree) waveY = 22;
                            else if (nearBench) waveY = -20;
                            else if (nearBirds) waveY = 18;
                            else waveY = Math.sin(t * Math.PI * 4) * 6;

                            const isRight = i % 2 === 0;
                            const footOffset = isRight ? -4 : 4;
                            const y = midY + waveY + footOffset;

                            const dist = walkSliderValue - t;
                            const opacity = dist > 0.20 ? Math.max(0, 0.6 - (dist - 0.20) * 3) : 0.6;

                            if (opacity <= 0) continue;

                            const footAngle = isRight ? 80 : 100;

                            prints.push(
                              <G key={`fp-${i}`} opacity={opacity}
                                transform={`translate(${baseX}, ${y}) rotate(${footAngle})`}>
                                <Ellipse cx={0} cy={0} rx={3} ry={5} fill="#00D984" opacity={0.5} />
                                <Circle cx={isRight ? 1 : -1} cy={-5} r={1.2} fill="#00D984" opacity={0.4} />
                                <Circle cx={0} cy={-5.5} r={1.2} fill="#00D984" opacity={0.4} />
                                <Circle cx={isRight ? -1 : 1} cy={-5} r={1.2} fill="#00D984" opacity={0.4} />
                              </G>
                            );
                          }
                          return prints;
                        })()}

                        {/* Barre de progression — en bas du canvas */}
                        <Rect x={margin} y={cH - 10} width={usable} height={6} rx={3} fill="rgba(0,217,132,0.08)" />
                        <Rect x={margin} y={cH - 10} width={Math.max(0, usable * walkSliderValue)} height={6} rx={3} fill="#00D984" opacity={0.7} />

                        {/* Labels paliers — en bas */}
                        {(walkMode === 'distance'
                          ? ['D\u00e9part', '500m', '2 km', '5 km', '10 km']
                          : ['5 min', '15 min', '30 min', '1 h', '2 h']
                        ).map((label, i, arr) => {
                          const pos = margin + (i / (arr.length - 1)) * usable;
                          const isActive = Math.abs(walkSliderValue - (i / (arr.length - 1))) < 0.12;
                          return (
                            <SvgText key={`lb-${i}`} x={pos} y={cH - 14}
                              fill={isActive ? '#00D984' : '#5A6070'}
                              fontSize={9} fontWeight={isActive ? '800' : '400'}
                              textAnchor="middle">
                              {label}
                            </SvgText>
                          );
                        })}
                      </>
                    );
                  })()}
                </Svg>
              </View>

              {/* Bouton CONFIRMER — compact en bas */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                paddingHorizontal: 16,
                paddingBottom: 8,
              }}>
                <Pressable
                  onPress={async () => {
                    if (walkCaloriesDisplay === 0) return;
                    const cmult = walkRoundTrip ? 2 : 1;
                    const success = await saveActivity('marche',
                      Math.round(walkDurMinutes * cmult),
                      Math.round(walkCaloriesDisplay),
                      'modere',
                      Math.round(walkWaterMl * cmult)
                    );
                    if (success) {
                      setWalkSaved(true);
                      setTimeout(() => { setWalkSaved(false); setWalkModalVisible(false); }, 1500);
                    }
                  }}
                  disabled={walkSaved || walkSliderValue === 0}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                    borderRadius: 12,
                    backgroundColor: walkSaved ? '#00D984' : walkSliderValue === 0 ? 'rgba(0,217,132,0.3)' : pressed ? '#00B572' : '#00D984',
                  })}
                >
                  <Text style={{ color: '#0D1117', fontSize: 14, fontWeight: '800' }}>
                    {walkSaved ? '\u2713 AJOUT\u00c9 ! +5 Lix' : `\u2713 MARCHE \u2014 ${Math.round(walkCaloriesDisplay)} kcal`}
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

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
