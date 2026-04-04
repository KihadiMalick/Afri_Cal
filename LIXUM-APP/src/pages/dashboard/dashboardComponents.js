import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View, Text, Animated as RNAnimated, StyleSheet,
  TouchableOpacity, Pressable, Modal, Platform, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Line, Rect, G, Ellipse, ClipPath,
  Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import MetalCard from '../../components/shared/MetalCard';
import {
  W, H, wp, fp,
  DAILY_OBJECTIVE, ACTIVITIES_KCAL_PER_HOUR,
  ACTIVITY_ICONS, ACTIVITY_LABELS,
  MALE_PATH, FEMALE_PATH, BUBBLE_CONFIG,
  REACTOR_SIZE, DNA_WIDTH,
  suggestActivities, formatNumberFR,
} from './dashboardConstants';

const MetallicBackground = () => (
  <LinearGradient
    colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
    locations={[0, 0.25, 0.5, 0.75, 1]}
    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
  />
);

const GlassCard = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>
    <View style={styles.cardShine} />
    {children}
  </View>
);

const ProgressBar = ({ percent, color = '#00D984' }) => (
  <View style={styles.progressBg}>
    <LinearGradient
      colors={[color, color + 'AA']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={[styles.progressFill, { width: Math.min(percent, 100) + '%' }]}
    />
    <Text style={styles.progressText}>{percent}%</Text>
  </View>
);

const AvatarButton = ({ activeChar, userName, onPress, size = 30 }) => {
  const charEmojis = {
    'emerald_owl': '🦉', 'hawk_eye': '🦅', 'ruby_tiger': '🐯',
    'amber_fox': '🦊', 'gipsy': '🕷️',
    'jade_phoenix': '🔥', 'silver_wolf': '🐺', 'boukki': '🦴',
    'iron_rhino': '🦏', 'coral_dolphin': '🐬',
  };
  const emoji = activeChar?.slug ? charEmojis[activeChar.slug] : null;
  const initial = (userName || 'U').charAt(0).toUpperCase();
  const borderColor = emoji ? '#00D984' : '#4DA6FF';

  return (
    <Pressable onPress={onPress} style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: borderColor + '15',
      borderWidth: 1.5, borderColor: borderColor + '50',
      justifyContent: 'center', alignItems: 'center',
    }}>
      {emoji ? (
        <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text>
      ) : (
        <Text style={{ fontSize: size * 0.45, fontWeight: '800', color: borderColor }}>{initial}</Text>
      )}
    </Pressable>
  );
};

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

const styles = StyleSheet.create({
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
});
