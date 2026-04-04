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

var EcgPulse = function(props) {
  var score = props.score || 0;
  var color = score >= 70 ? '#00D984' : score >= 40 ? '#FFD93D' : '#FF6B6B';
  var glowColor = score >= 70 ? 'rgba(0,217,132,0.4)' : score >= 40 ? 'rgba(255,217,61,0.4)' : 'rgba(255,107,107,0.4)';
  var pulseDuration = score > 75 ? 1400 : score > 50 ? 1000 : score > 25 ? 700 : 400;
  var pulseAnim = useRef(new RNAnimated.Value(0.3)).current;
  useEffect(function() {
    var pulse = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, { toValue: 1, duration: pulseDuration * 0.3, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        RNAnimated.timing(pulseAnim, { toValue: 0.3, duration: pulseDuration * 0.7, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return function() { pulse.stop(); };
  }, [pulseDuration]);
  var ecgPath = 'M0,10 L4,10 L6,4 L8,16 L10,8 L12,12 L14,10 L18,10 L20,6 L22,14 L24,10 L28,10 L30,3 L32,17 L34,9 L36,11 L38,10 L42,10';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginLeft: wp(6) }}>
      <RNAnimated.View style={{ opacity: pulseAnim, marginRight: wp(3) }}>
        <Svg width={wp(30)} height={wp(14)} viewBox="0 0 42 20">
          <Path d={ecgPath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </RNAnimated.View>
      <View style={{ width: 1.5, height: wp(12), backgroundColor: color, opacity: 0.4, marginRight: wp(4), borderRadius: 1 }} />
      <Text style={{
        fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
        fontSize: fp(15), fontWeight: '900', color: color,
        textShadowColor: glowColor, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6,
      }}>{score}</Text>
      <View style={{ width: 1.5, height: wp(12), backgroundColor: color, opacity: 0.4, marginLeft: wp(4), borderRadius: 1 }} />
      <RNAnimated.View style={{ opacity: pulseAnim, marginLeft: wp(3) }}>
        <Svg width={wp(30)} height={wp(14)} viewBox="0 0 42 20">
          <Path d={ecgPath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </RNAnimated.View>
    </View>
  );
};

const ReactorCore = ({ size, value, percentage, label, color, colorLight, colorDark, clockwise = true }) => {
  const outerRotation = useRotation(10000, !clockwise);
  const innerRotation = useRotation(7000, clockwise);
  const coreSize = size * 0.50;
  const innerRingSize = size * 0.72;
  const cappedPercentage = Math.min(percentage, 140);
  const coreRadius = coreSize / 2;
  const maxGlowRadius = size / 2 - 2;
  const glowRadius = coreRadius + (maxGlowRadius - coreRadius) * (cappedPercentage / 100);

  return (
    <View style={{ width: size + 20, height: size + 20, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ position: 'absolute', width: glowRadius * 2, height: glowRadius * 2, borderRadius: glowRadius, backgroundColor: color, opacity: 0.10 + (percentage / 100) * 0.10 }} />
        <View style={{ position: 'absolute', width: glowRadius * 0.8, height: glowRadius * 0.8, borderRadius: glowRadius * 0.4, backgroundColor: color, opacity: 0.08 + (percentage / 100) * 0.08 }} />
        <RNAnimated.View style={{ position: 'absolute', width: size + 20, height: size + 20, left: -10, top: -10, transform: [{ rotate: outerRotation }] }}>
          <Svg width={size + 20} height={size + 20} viewBox={`0 0 ${size + 20} ${size + 20}`}>
            <Defs>
              <SvgLinearGradient id={`reactor_${label.replace(/\s/g, '_')}_outer`} x1="0.5" y1="0" x2="0.5" y2="1">
                <Stop offset="0%" stopColor={colorLight} />
                <Stop offset="100%" stopColor={color} />
              </SvgLinearGradient>
            </Defs>
            <Circle cx={(size + 20) / 2} cy={(size + 20) / 2} r={size / 2 - 2} fill="none" stroke={`url(#reactor_${label.replace(/\s/g, '_')}_outer)`} strokeWidth={1.5} strokeOpacity={0.6} strokeDasharray="6 3" />
            <Circle cx={(size + 20) / 2} cy={(size + 20) / 2} r={size / 2 - 9} fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.3} strokeDasharray="4 2" />
            <Circle cx={(size + 20) / 2} cy={12} r={2.5} fill="#00D984" />
            <Circle cx={(size + 20) / 2} cy={12} r={5} fill="#00D984" opacity={0.15} />
            <Circle cx={(size + 20) / 2} cy={12} r={8} fill="#00D984" opacity={0.06} />
            <Circle cx={(size + 20) / 2} cy={size + 8} r={2} fill={colorLight} opacity={0.6} />
            <Circle cx={(size + 20) / 2} cy={size + 8} r={4} fill={colorLight} opacity={0.12} />
          </Svg>
        </RNAnimated.View>
        <RNAnimated.View style={{ position: 'absolute', width: innerRingSize + 12, height: innerRingSize + 12, left: (size - innerRingSize - 12) / 2, top: (size - innerRingSize - 12) / 2, transform: [{ rotate: innerRotation }] }}>
          <Svg width={innerRingSize + 12} height={innerRingSize + 12} viewBox={`0 0 ${innerRingSize + 12} ${innerRingSize + 12}`}>
            <Defs>
              <SvgLinearGradient id={`reactor_${label.replace(/\s/g, '_')}_inner_i`} x1="0.5" y1="0" x2="0.5" y2="1">
                <Stop offset="0%" stopColor={colorLight} stopOpacity={0.6} />
                <Stop offset="100%" stopColor={colorDark} stopOpacity={0.3} />
              </SvgLinearGradient>
            </Defs>
            <Circle cx={(innerRingSize + 12) / 2} cy={(innerRingSize + 12) / 2} r={innerRingSize / 2 - 2} fill="none" stroke={`url(#reactor_${label.replace(/\s/g, '_')}_inner_i)`} strokeWidth={0.8} strokeOpacity={0.4} strokeDasharray="4 2" />
            <Circle cx={(innerRingSize + 12) / 2} cy={8} r={2} fill={colorLight} opacity={0.8} />
            <Circle cx={(innerRingSize + 12) / 2} cy={8} r={4.5} fill={colorLight} opacity={0.15} />
          </Svg>
        </RNAnimated.View>
        <View style={{ width: coreSize, height: coreSize, borderRadius: coreSize / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 }}>
          <View style={{ position: 'absolute', width: coreSize * 0.85, height: coreSize * 0.85, borderRadius: coreSize * 0.425, backgroundColor: color, opacity: 0.08 }} />
          <Svg width={coreSize * 0.45} height={coreSize * 0.55} viewBox="0 0 14 18">
            <Path d="M8 1L2 10h4.5L5 17l7-10H7.5L8 1z" fill={color} opacity={0.7} />
            <Path d="M8 1L2 10h4.5L5 17l7-10H7.5L8 1z" fill="none" stroke={colorLight} strokeWidth={0.5} opacity={0.4} />
          </Svg>
        </View>
      </View>
    </View>
  );
};

const DnaHelix = ({ height = 68, width = 60 }) => {
  var svgH = height;
  var svgW = width;
  var cx = svgW / 2;
  var amp = svgW * 0.22;
  var segments = 24;
  var turns = 4;
  return (
    <View style={{ alignItems: 'center', width: svgW }}>
      <View style={{ width: svgW, height: svgH }}>
        <Svg width={svgW} height={svgH} viewBox={'0 0 ' + svgW + ' ' + svgH}>
          {Array.from({ length: segments }, function(_, i) {
            var t = i / (segments - 1);
            var y = 4 + t * (svgH - 8);
            var angle = t * Math.PI * turns;
            var x1 = cx + Math.sin(angle) * amp;
            var x2 = cx + Math.sin(angle + Math.PI) * amp;
            var depth = Math.cos(angle);
            var r1 = depth > 0 ? 2.5 : 1.2;
            var r2 = depth < 0 ? 2.5 : 1.2;
            var op1 = depth > 0 ? 0.75 : 0.15;
            var op2 = depth < 0 ? 0.75 : 0.15;
            var color1 = '#00D984';
            var color2 = '#4DA6FF';
            var showBridge = Math.abs(depth) > 0.3 && i % 3 === 0;
            var bridgeColor = i % 6 === 0 ? '#5DFFB4' : '#7DD3FC';
            var bridgeOp = 0.2 + Math.abs(depth) * 0.2;
            return (
              <G key={'dna' + i}>
                {showBridge ? (
                  <Line x1={x1} y1={y} x2={x2} y2={y} stroke={bridgeColor} strokeWidth={1.2} strokeLinecap="round" opacity={bridgeOp} />
                ) : null}
                {depth > 0.5 ? (<Circle cx={x1} cy={y} r={6} fill={color1} opacity={0.06} />) : null}
                {depth < -0.5 ? (<Circle cx={x2} cy={y} r={6} fill={color2} opacity={0.06} />) : null}
                <Circle cx={x1} cy={y} r={r1} fill={color1} opacity={op1} />
                <Circle cx={x2} cy={y} r={r2} fill={color2} opacity={op2} />
                {showBridge && Math.abs(depth) > 0.5 ? (
                  <G>
                    <Circle cx={depth > 0 ? x1 : x2} cy={y} r={3} fill="#D4AF37" opacity={0.35} />
                    <Circle cx={depth > 0 ? x1 : x2} cy={y} r={6} fill="#D4AF37" opacity={0.05} />
                  </G>
                ) : null}
              </G>
            );
          })}
          {Array.from({ length: segments - 1 }, function(_, i) {
            var t1 = i / (segments - 1);
            var t2 = (i + 1) / (segments - 1);
            var angle1 = t1 * Math.PI * turns;
            var angle2 = t2 * Math.PI * turns;
            if (Math.sin(angle1) * Math.sin(angle2) < 0) {
              var y = 4 + ((t1 + t2) / 2) * (svgH - 8);
              return (
                <G key={'cx' + i}>
                  <Circle cx={cx} cy={y} r={2.5} fill="#FFFFFF" opacity={0.12} />
                  <Circle cx={cx} cy={y} r={5} fill="#FFFFFF" opacity={0.03} />
                </G>
              );
            }
            return null;
          })}
        </Svg>
      </View>
    </View>
  );
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
