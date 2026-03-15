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
  Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { createClient } from '@supabase/supabase-js';

// ── Supabase ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ── Responsive system ────────────────────────────────────────────────────────
const { width: W } = Dimensions.get('window');
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
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

// ── SVG Shoe Footprints (Walk indicator) ─────────────────────────────────────
const ShoeFootprints = ({ shoeAnim }) => {
  const leftY = shoeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const rightY = shoeAnim.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: wp(24), height: wp(20) }}>
      <Animated.View style={{ transform: [{ translateY: leftY }], marginRight: wp(1) }}>
        <Svg width={wp(10)} height={wp(16)} viewBox="0 0 16 26">
          <Path
            d="M4 2C4 1 5 0 7 0C9 0 10 1 10 2L11 14C11 16 9 18 7 18C5 18 3 16 3 14L4 2Z"
            fill="#00D984"
            opacity={0.9}
          />
          <Ellipse cx="7" cy="22" rx="4" ry="3" fill="#00D984" opacity={0.7} />
        </Svg>
      </Animated.View>
      <Animated.View style={{ transform: [{ translateY: rightY }] }}>
        <Svg width={wp(10)} height={wp(16)} viewBox="0 0 16 26">
          <Path
            d="M6 2C6 1 7 0 9 0C11 0 12 1 12 2L13 14C13 16 11 18 9 18C7 18 5 16 5 14L6 2Z"
            fill="#00D984"
            opacity={0.9}
          />
          <Ellipse cx="9" cy="22" rx="4" ry="3" fill="#00D984" opacity={0.7} />
        </Svg>
      </Animated.View>
    </View>
  );
};

// ── SVG Runner Silhouette (Run indicator) ────────────────────────────────────
const RunnerSilhouette = ({ shoeAnim }) => {
  const bounce = shoeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -3] });

  return (
    <Animated.View style={{ transform: [{ translateY: bounce }] }}>
      <Svg width={wp(20)} height={wp(24)} viewBox="0 0 32 40">
        {/* Head */}
        <Circle cx="18" cy="5" r="4" fill="#FF8C42" opacity={0.9} />
        {/* Body */}
        <Path
          d="M18 9L16 20"
          stroke="#FF8C42"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arms */}
        <Path
          d="M16 13L10 10M16 13L22 16"
          stroke="#FF8C42"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Legs */}
        <Path
          d="M16 20L10 30M16 20L24 28"
          stroke="#FF8C42"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Feet */}
        <Path
          d="M10 30L6 31M24 28L28 27"
          stroke="#FF8C42"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
};

// ── Custom Slider (Walk / Run) ───────────────────────────────────────────────
const ActivitySlider = ({
  type, // 'marche' or 'course'
  mode, // 'distance' or 'temps'
  value, // 0 to 1
  onChange,
  shoeAnim,
  flags,
  maxDistance, // in metres
  maxTime, // in minutes
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

  const currentValue = mode === 'distance'
    ? value * maxDistance
    : value * maxTime;

  const flagList = mode === 'distance' ? flags : TIME_STEPS;

  return (
    <View style={{ marginTop: wp(12) }}>
      {/* Slider track */}
      <View
        ref={barRef}
        onLayout={(e) => {
          setBarWidth(e.nativeEvent.layout.width);
          barRef.current?.measureInWindow?.((x) => setBarX(x));
          // Fallback: measure via pageX on layout
          if (e.nativeEvent.layout.x !== undefined) {
            // Approximate barX from layout
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
          // Grass-like vertical lines for walk
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
          // Olympic track lane lines for run
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

        {/* Flag markers */}
        {flagList.map((flag, idx) => {
          const flagVal = mode === 'distance'
            ? flag.distance / maxDistance
            : flag / maxTime;
          if (flagVal > 1) return null;

          const isNearest = (() => {
            const cv = value;
            let minDist = Infinity;
            let nearestIdx = 0;
            flagList.forEach((f, fi) => {
              const fv = mode === 'distance' ? f.distance / maxDistance : f / maxTime;
              const d = Math.abs(cv - fv);
              if (d < minDist) { minDist = d; nearestIdx = fi; }
            });
            return nearestIdx === idx;
          })();

          return (
            <View key={idx} style={{
              position: 'absolute',
              left: `${flagVal * 100}%`,
              top: wp(2),
              alignItems: 'center',
              transform: [{ translateX: -wp(10) }],
            }}>
              <Text style={{
                fontSize: fp(7),
                color: isNearest ? accentColor : '#555E6C',
                fontWeight: isNearest ? '700' : '500',
              }}>
                🏁
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

        {/* Moving indicator */}
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
            ? <ShoeFootprints shoeAnim={shoeAnim} />
            : <RunnerSilhouette shoeAnim={shoeAnim} />
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
const ActivityPage = () => {
  // ── State ────────────────────────────────────────────────────────────────
  const [todayActivities, setTodayActivities] = useState([]);

  // Walk slider
  const [walkMode, setWalkMode] = useState('distance');
  const [walkValue, setWalkValue] = useState(0.2);

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

  const saveActivity = async (activityType, durationMin, caloriesBurned, intensity, waterLost) => {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: TEST_USER_ID,
        name: ACTIVITY_DATA[activityType].label,
        type: activityType,
        duration_minutes: Math.round(durationMin),
        calories_burned: Math.round(caloriesBurned),
        intensity: intensity || 'modere',
        water_lost_ml: Math.round(waterLost),
      });

    if (error) {
      console.error('Save activity error:', error);
      alert('Erreur : ' + error.message);
      return false;
    }

    await loadTodayActivities();
    return true;
  };

  const deleteActivity = async (activityId) => {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId);
    if (!error) await loadTodayActivities();
  };

  // ── Calculations ───────────────────────────────────────────────────────
  const WALK_MAX_DIST = 10000; // 10 km in metres
  const RUN_MAX_DIST = 21000;  // 21 km in metres
  const MAX_TIME = 60;         // minutes

  // Walk
  const walkDistanceM = walkMode === 'distance' ? walkValue * WALK_MAX_DIST : null;
  const walkDistanceKm = walkDistanceM !== null ? walkDistanceM / 1000 : null;
  const walkTimeMins = walkMode === 'temps' ? walkValue * MAX_TIME : null;

  const walkCalories = walkMode === 'distance'
    ? Math.round((walkDistanceKm / ACTIVITY_DATA.marche.km_per_hour) * ACTIVITY_DATA.marche.kcal_per_hour)
    : Math.round((walkTimeMins / 60) * ACTIVITY_DATA.marche.kcal_per_hour);

  const walkDuration = walkMode === 'distance'
    ? Math.round((walkDistanceKm / ACTIVITY_DATA.marche.km_per_hour) * 60)
    : walkTimeMins;

  const walkDistDisplay = walkMode === 'distance'
    ? walkDistanceKm
    : (walkTimeMins / 60) * ACTIVITY_DATA.marche.km_per_hour;

  const walkWater = Math.round((walkDuration / 60) * ACTIVITY_DATA.marche.water_per_hour_ml);

  // Run
  const runDistanceM = runMode === 'distance' ? runValue * RUN_MAX_DIST : null;
  const runDistanceKm = runDistanceM !== null ? runDistanceM / 1000 : null;
  const runTimeMins = runMode === 'temps' ? runValue * MAX_TIME : null;

  const runCalories = runMode === 'distance'
    ? Math.round((runDistanceKm / ACTIVITY_DATA.course.km_per_hour) * ACTIVITY_DATA.course.kcal_per_hour)
    : Math.round((runTimeMins / 60) * ACTIVITY_DATA.course.kcal_per_hour);

  const runDuration = runMode === 'distance'
    ? Math.round((runDistanceKm / ACTIVITY_DATA.course.km_per_hour) * 60)
    : runTimeMins;

  const runDistDisplay = runMode === 'distance'
    ? runDistanceKm
    : (runTimeMins / 60) * ACTIVITY_DATA.course.km_per_hour;

  const runWater = Math.round((runDuration / 60) * ACTIVITY_DATA.course.water_per_hour_ml);

  // Day totals
  const totalCalories = todayActivities.reduce((s, a) => s + (a.calories_burned || 0), 0);
  const totalDuration = todayActivities.reduce((s, a) => s + (a.duration_minutes || 0), 0);
  const totalWater = todayActivities.reduce((s, a) => s + (a.water_lost_ml || 0), 0);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleAddWalk = async () => {
    const dist = walkDistDisplay;
    const dur = walkDuration;
    const cal = walkCalories;
    const water = walkWater;
    const ok = await saveActivity('marche', dur, cal, 'modere', water);
    if (ok) alert(`Marche ajoutée ! ${dist.toFixed(1)} km — ${cal} kcal`);
  };

  const handleAddRun = async () => {
    const dist = runDistDisplay;
    const dur = runDuration;
    const cal = runCalories;
    const water = runWater;
    const ok = await saveActivity('course', dur, cal, 'modere', water);
    if (ok) alert(`Course ajoutée ! ${dist.toFixed(1)} km — ${cal} kcal`);
  };

  const handleSportSave = async (sportKey, duration, calories, intensity, waterLost) => {
    const ok = await saveActivity(sportKey, duration, calories, intensity, waterLost);
    if (ok) {
      setModalVisible(false);
      alert(`${ACTIVITY_DATA[sportKey].label} ajouté(e) ! ${calories} kcal`);
    }
  };

  const handleDeleteActivity = (id) => {
    Alert.alert(
      'Supprimer',
      'Supprimer cette activité ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteActivity(id) },
      ]
    );
  };

  // ── Format helpers ─────────────────────────────────────────────────────
  const formatDist = (km) => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  const todayDateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <MetallicBackground />
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 55 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: wp(120) }}
        >
          {/* ═══ HEADER ═══ */}
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

          {/* ═══ SECTION 2 — DAY SUMMARY ═══ */}
          <MetalCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(10), color: '#8892A0', fontWeight: '600', marginBottom: wp(2) }}>
                  🔥 Brûlé
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
                  ⏱ Temps
                </Text>
                <Text style={{ fontSize: fp(18), color: '#EAEEF3', fontWeight: '900' }}>
                  {totalDuration}
                </Text>
                <Text style={{ fontSize: fp(8), color: '#555E6C', fontWeight: '600' }}>min</Text>
              </View>

              <View style={{
                width: 1, height: wp(30),
                backgroundColor: 'rgba(255,255,255,0.06)',
              }} />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(10), color: '#8892A0', fontWeight: '600', marginBottom: wp(2) }}>
                  💧 Eau perdue
                </Text>
                <Text style={{ fontSize: fp(18), color: '#4DA6FF', fontWeight: '900' }}>
                  {totalWater}
                </Text>
                <Text style={{ fontSize: fp(8), color: '#555E6C', fontWeight: '600' }}>ml</Text>
              </View>
            </View>
          </MetalCard>

          {/* ═══ SECTION 3 — WALK HERO ═══ */}
          <SectionTitle title="Marche" />
          <MetalCard>
            <View>
              {/* Card header */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: wp(4),
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24">
                    <Circle cx="12" cy="4" r="3" fill="#00D984" />
                    <Path
                      d="M12 7L11 14L8 22M12 7L14 12L18 14M11 14L15 18"
                      stroke="#00D984"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
                  <Text style={{
                    color: '#EAEEF3', fontSize: fp(14), fontWeight: '800',
                    letterSpacing: 1.5, marginLeft: wp(6),
                  }}>
                    MARCHE
                  </Text>
                </View>
                <ModePill mode={walkMode} onToggle={setWalkMode} accentColor="#00D984" />
              </View>

              {/* Slider */}
              <ActivitySlider
                type="marche"
                mode={walkMode}
                value={walkValue}
                onChange={setWalkValue}
                shoeAnim={shoeAnim}
                flags={WALK_FLAGS}
                maxDistance={WALK_MAX_DIST}
                maxTime={MAX_TIME}
                accentColor="#00D984"
              />

              {/* Value display */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
                marginTop: wp(10), paddingHorizontal: wp(4),
              }}>
                <View>
                  <Text style={{ color: '#00D984', fontSize: fp(22), fontWeight: '900' }}>
                    {formatDist(walkDistDisplay)}
                  </Text>
                  {walkMode === 'temps' && (
                    <Text style={{ color: '#555E6C', fontSize: fp(9), marginTop: wp(2) }}>
                      ~{formatDist(walkDistDisplay)} à vitesse normale
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#FF8C42', fontSize: fp(18), fontWeight: '900' }}>
                    {walkCalories} kcal
                  </Text>
                  <Text style={{ color: '#555E6C', fontSize: fp(9), marginTop: wp(2) }}>
                    ~{walkDuration} min · 💧 {walkWater} ml
                  </Text>
                </View>
              </View>

              {/* Add button */}
              <TouchableOpacity
                onPress={handleAddWalk}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#00D984', borderRadius: wp(12),
                  paddingVertical: wp(11), alignItems: 'center',
                  marginTop: wp(14),
                }}
              >
                <Text style={{ color: '#000', fontSize: fp(12), fontWeight: '800' }}>
                  ✓ AJOUTER MARCHE — {walkCalories} kcal
                </Text>
              </TouchableOpacity>
            </View>
          </MetalCard>

          {/* ═══ SECTION 4 — RUN HERO ═══ */}
          <SectionTitle title="Course" />
          <MetalCard>
            <View>
              {/* Card header */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: wp(4),
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24">
                    <Circle cx="14" cy="4" r="3" fill="#FF8C42" />
                    <Path
                      d="M14 7L12 14L7 20M14 7L18 11L22 12M12 14L17 18"
                      stroke="#FF8C42"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </Svg>
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

              {/* Value display */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
                marginTop: wp(10), paddingHorizontal: wp(4),
              }}>
                <View>
                  <Text style={{ color: '#FF8C42', fontSize: fp(22), fontWeight: '900' }}>
                    {formatDist(runDistDisplay)}
                  </Text>
                  {runMode === 'temps' && (
                    <Text style={{ color: '#555E6C', fontSize: fp(9), marginTop: wp(2) }}>
                      ~{formatDist(runDistDisplay)} à allure modérée
                    </Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: '#FF8C42', fontSize: fp(18), fontWeight: '900' }}>
                    {runCalories} kcal
                  </Text>
                  <Text style={{ color: '#555E6C', fontSize: fp(9), marginTop: wp(2) }}>
                    ~{runDuration} min · 💧 {runWater} ml
                  </Text>
                </View>
              </View>

              {/* Add button */}
              <TouchableOpacity
                onPress={handleAddRun}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#FF8C42', borderRadius: wp(12),
                  paddingVertical: wp(11), alignItems: 'center',
                  marginTop: wp(14),
                }}
              >
                <Text style={{ color: '#000', fontSize: fp(12), fontWeight: '800' }}>
                  ✓ AJOUTER COURSE — {runCalories} kcal
                </Text>
              </TouchableOpacity>
            </View>
          </MetalCard>

          {/* ═══ SECTION 5 — OTHER SPORTS GRID ═══ */}
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

          {/* ═══ SECTION 6 — TODAY'S HISTORY ═══ */}
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
              const iconText = sportData.icon || '🏅';
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
                            {act.duration_minutes} min
                          </Text>
                          <Text style={{ color: '#FF8C42', fontSize: fp(9), fontWeight: '700' }}>
                            {act.calories_burned} kcal
                          </Text>
                          {act.water_lost_ml > 0 && (
                            <Text style={{ color: '#4DA6FF', fontSize: fp(9) }}>
                              💧 {act.water_lost_ml} ml
                            </Text>
                          )}
                          <Text style={{ color: '#555E6C', fontSize: fp(9) }}>
                            {createdTime}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleDeleteActivity(act.id)}
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

          {/* ═══ SECTION 7 — REWARD BADGE ═══ */}
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
              <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>🏆</Text>
              <Text style={{ color: '#D4AF37', fontSize: fp(11), fontWeight: '700' }}>
                +5 Lix par activité
              </Text>
            </View>
          </View>
        </ScrollView>
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
