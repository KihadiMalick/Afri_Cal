import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, TouchableOpacity,
  Animated, Modal, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  G, Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { wp, fp } from '../../constants/layout';
import MetalCard from '../../components/shared/MetalCard';
import {
  ACTIVITY_DATA, T, getLang, calcCalories, calcWater,
  TIME_STEPS,
} from './activityConstants';

// ── Décors SVG du chemin de marche ──

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

// ── Chaussures SVG ──

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

// ── Non-linear slider distance interpolation ──
const sliderToDistance = (sliderValue, flags) => {
  const maxIdx = flags.length - 1;
  const pos = sliderValue * maxIdx;
  const segmentIndex = Math.min(Math.floor(pos), maxIdx - 1);
  const segmentProgress = pos - segmentIndex;
  const fromFlag = flags[Math.min(segmentIndex, maxIdx)];
  const toFlag = flags[Math.min(segmentIndex + 1, maxIdx)];
  return fromFlag.distance + (toFlag.distance - fromFlag.distance) * segmentProgress;
};

// ── Custom Slider (Walk / Run) ──
const ActivitySlider = ({
  type, mode, value, onChange, shoeAnim,
  flags, maxDistance, maxTime, accentColor,
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

        {/* Flag markers */}
        {flagList.map((flag, idx) => {
          const equalPos = flagList.length > 1 ? idx / (flagList.length - 1) : 0;
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
            ? <WalkShoeAnimated shoeAnim={shoeAnim} />
            : <RunShoeAnimated shoeAnim={shoeAnim} />
          }
        </Animated.View>
      </View>
    </View>
  );
};

// ── Toggle Pill (Distance | Temps) ──
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

// ── SportIcon — Premium SVG line icons ──
var SportIcon = function(props) {
  var type = props.type;
  var size = props.size || wp(24);
  var color = props.color || '#00D984';

  switch(type) {
    case 'marche':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M10 9h4l1 4-2 2v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M14 13l2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M10 9l-1.5 7-2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'course':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="14" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M8 11l3-2 3 1 2-3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M11 10l-2 5-3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M14 12l1 4 3 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'velo':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="6" cy="16" r="3.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Circle cx="18" cy="16" r="3.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M6 16l4-8h4l2 4h2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M14 8l4 8" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Circle cx="14" cy="6" r="1.2" stroke={color} strokeWidth={1.4} fill="none" />
        </Svg>
      );
    case 'natation':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="8" cy="8" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M6 14l2-3 4-1 4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M2 21c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.5} />
        </Svg>
      );
    case 'musculation':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 7v10M18 7v10" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M3 9v6M21 9v6" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );
    case 'yoga':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 7v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M8 10l4 2 4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M7 19l5-7 5 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'corde':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="6" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 8v4M10 12l-2 4M14 12l2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M5 4c0 8 3 14 7 16 4-2 7-8 7-16" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'football':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 3l2.5 5.5H21M12 3L9.5 8.5H3M12 21l2.5-5.5H21M12 21L9.5 15.5H3" stroke={color} strokeWidth={1} fill="none" opacity={0.5} />
          <Path d="M8.5 8.5l3.5 1 3.5-1M8.5 15.5l3.5-1 3.5 1M8.5 8.5v7M15.5 8.5v7" stroke={color} strokeWidth={1} fill="none" opacity={0.4} />
        </Svg>
      );
    case 'basketball':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M3 12h18" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M12 3v18" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M5.5 5.5c3 2.5 3 8.5 0 13" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M18.5 5.5c-3 2.5-3 8.5 0 13" stroke={color} strokeWidth={1.2} fill="none" />
        </Svg>
      );
    case 'danse':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="14" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M14 6l-2 4-4-1" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10v4l3 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 14l-3 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M16 7l2-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'tennis':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Ellipse cx="11" cy="9" rx="6" ry="7" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M5.5 6c2.5 1.5 5 5 2.5 10" stroke={color} strokeWidth={1.1} fill="none" />
          <Path d="M16 4c-2 2.5-5 5.5-10.5 3" stroke={color} strokeWidth={1.1} fill="none" />
          <Path d="M13 15l4.5 5.5" stroke={color} strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Circle cx="19.5" cy="5.5" r="1.8" stroke={color} strokeWidth={1.3} fill={color} opacity={0.25} />
        </Svg>
      );
    case 'boxe':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M7 8c0-2 1.5-4 4-4h1c2 0 3.5 1.5 3.5 3.5V10c0 0.5 0.5 1 1 1h0.5c1 0 2 1 2 2v1c0 2-1.5 3.5-3.5 3.5H10c-2 0-3.5-1.5-3.5-3.5L7 8z" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M10 7.5h4" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <Path d="M10 10h3.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <Path d="M9 17.5l-1.5 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M13 17.5l1 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );

    case 'randonnee':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v6l-3 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 12l3 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M17 3v18" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M17 3l-3 3" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <Path d="M17 7l-2 2" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'escalade':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v4l4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10l-3 4 1 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10l2 6 3-1" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Rect x="2" y="2" width="3" height="20" rx="1" stroke={color} strokeWidth={1.2} fill="none" opacity={0.3} />
        </Svg>
      );
    case 'spinning':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="6" cy="17" r="3.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Circle cx="18" cy="17" r="3.5" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M6 17l5-9h3l4 9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M10 8l-1-3h5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'hiit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'pilates':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="16" cy="6" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M4 16h4l4-5 4 1" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M16 8l-4 3v4l-4 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Line x1="2" y1="20" x2="22" y2="20" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.3} />
        </Svg>
      );
    case 'badminton':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2c-2 3-2 6 0 8s2 5 0 8" stroke={color} strokeWidth={1.4} fill="none" />
          <Ellipse cx="12" cy="6" rx="3.5" ry="5" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 11l-1 9" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Line x1="9" y1="4" x2="15" y2="4" stroke={color} strokeWidth={1} opacity={0.4} />
          <Line x1="9" y1="6" x2="15" y2="6" stroke={color} strokeWidth={1} opacity={0.4} />
          <Line x1="9" y1="8" x2="15" y2="8" stroke={color} strokeWidth={1} opacity={0.4} />
        </Svg>
      );
    case 'volleyball':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 3c-1 4-4 7-8.5 7" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M20.5 10c-4 0-7.5 3-8.5 8" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M6 19.5c2-3 6.5-5 13-3.5" stroke={color} strokeWidth={1.2} fill="none" />
        </Svg>
      );
    case 'handball':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="10" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M10 6l2 4 4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10l-2 5-3 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 10l2 5 3 1" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Circle cx="18" cy="5" r="1.8" stroke={color} strokeWidth={1.4} fill="none" />
        </Svg>
      );
    case 'rugby':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Ellipse cx="12" cy="12" rx="9" ry="6" transform="rotate(-30 12 12)" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M6 6l12 12" stroke={color} strokeWidth={1.2} fill="none" />
          <Path d="M8 12l4-4M12 16l4-4" stroke={color} strokeWidth={1} fill="none" opacity={0.5} />
        </Svg>
      );
    case 'cricket':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M5 19L15 5" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Rect x="13" y="2" width="4" height="6" rx="1" stroke={color} strokeWidth={1.4} fill="none" transform="rotate(20 15 5)" />
          <Circle cx="18" cy="17" r="3" stroke={color} strokeWidth={1.6} fill="none" />
          <Line x1="16" y1="15" x2="20" y2="19" stroke={color} strokeWidth={1} opacity={0.4} />
        </Svg>
      );
    case 'golf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 3v15" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M12 3l6 4-6 3z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill={color} opacity={0.2} />
          <Path d="M12 3l6 4-6 3z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
          <Ellipse cx="12" cy="20" rx="5" ry="1.5" stroke={color} strokeWidth={1.2} fill="none" opacity={0.4} />
        </Svg>
      );
    case 'ski':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6l-3 5 1 5-3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 6l3 5-1 5 3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M2 20l20-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'surf':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 7v4l-4 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 11l3 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M3 17c3-3 6-3 9 0s6 3 9 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M6 20c3-2 6-2 9 0" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.4} />
        </Svg>
      );
    case 'kayak':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="7" r="1.8" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 8.8v4" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M9 10l3 2.8 3-2.8" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M7 16l-3-5" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M17 16l3-5" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M3 17c0 0 3-2.5 9-2.5s9 2.5 9 2.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M5 17.5c0 0 2.5 2 7 2s7-2 7-2" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.5} />
        </Svg>
      );

    case 'equitation':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 14c2-4 5-6 8-6s4 2 5 4l3-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M4 14l1 6M12 12l1 8M17 12l1 8" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Circle cx="19" cy="8" r="1.5" stroke={color} strokeWidth={1.4} fill="none" />
          <Path d="M20 7l2-2" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'patinage':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 12l3-6h6l3 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M6 12v4c0 1 1 2 2 2h8c1 0 2-1 2-2v-4" stroke={color} strokeWidth={1.6} fill="none" />
          <Line x1="4" y1="20" x2="20" y2="20" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M8 20v-2M16 20v-2" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'ping_pong':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="10" cy="10" r="6" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M14 14l5 6" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Circle cx="18" cy="6" r="1.5" stroke={color} strokeWidth={1.4} fill={color} opacity={0.3} />
        </Svg>
      );
    case 'squash':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="18" height="18" rx="1" stroke={color} strokeWidth={1.4} fill="none" opacity={0.3} />
          <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth={1} opacity={0.3} />
          <Ellipse cx="12" cy="10" rx="3" ry="4" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 14l-1 7" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
          <Circle cx="16" cy="7" r="1.2" stroke={color} strokeWidth={1.4} fill={color} opacity={0.3} />
        </Svg>
      );
    case 'crossfit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 8v8M20 8v8" stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M7 6v12M17 6v12" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M10 3l2 2 2-2" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'zumba':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M8 8l4 3 4-3" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M9 11l-2 5 2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M15 11l2 5-2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx="5" cy="6" r="0.8" fill={color} opacity={0.4} />
          <Circle cx="19" cy="8" r="0.8" fill={color} opacity={0.4} />
        </Svg>
      );
    case 'aquagym':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M8 10l4 2 4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 7v5" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <Path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke={color} strokeWidth={1.2} strokeLinecap="round" fill="none" opacity={0.4} />
        </Svg>
      );
    case 'stretching':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M6 8l6 4 6-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M12 12l-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M12 12l6 3" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'tai_chi':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.4} fill="none" />
          <Path d="M12 3c0 9-5 9-5 9s5 0 5 9" stroke={color} strokeWidth={1.4} fill="none" />
          <Circle cx="9.5" cy="8" r="1.5" fill={color} opacity={0.3} />
          <Circle cx="14.5" cy="16" r="1.5" stroke={color} strokeWidth={1.2} fill="none" />
        </Svg>
      );
    case 'menage':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2v14" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M8 16l4 1 4-1" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M7 17l-1 5h12l-1-5" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M9 6l6 2" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.5} />
        </Svg>
      );
    case 'jardinage':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 22v-8" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7z" stroke={color} strokeWidth={1.6} fill={color} opacity={0.1} />
          <Path d="M12 14c-4 0-7-3-7-7 4 0 7 3 7 7z" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M12 10c3-1 6-4 6-7-4 0-7 3-6 7z" stroke={color} strokeWidth={1.6} fill="none" />
          <Line x1="10" y1="22" x2="14" y2="22" stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.4} />
        </Svg>
      );
    case 'escalier':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 20h4v-4h4v-4h4v-4h4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx="14" cy="5" r="1.5" stroke={color} strokeWidth={1.4} fill="none" />
          <Path d="M14 6.5l-1 3 1 2" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      );
    case 'lutte_africaine':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="8" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Circle cx="16" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M8 6l2 4 2-1 2 1 2-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M10 10l-3 5-2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M14 10l3 5 2 4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M10 10v4l-2 3" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
          <Path d="M14 10v4l2 3" stroke={color} strokeWidth={1.4} strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'danse_africaine':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.8} fill="none" />
          <Path d="M12 6v4" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Path d="M7 8l5 2 5-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M9 10l-3 5 1 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M15 10l3 5-1 5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Circle cx="4" cy="7" r="1" fill={color} opacity={0.3} />
          <Circle cx="20" cy="7" r="1" fill={color} opacity={0.3} />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} fill="none" />
          <Path d="M8 12h8M12 8v8" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        </Svg>
      );
  }
};

// ── Sport Card (for grid) ──
const SportCard = ({ sportKey, onPress, lang, userWeight }) => {
  const sport = ACTIVITY_DATA[sportKey];
  var weightKg = userWeight || 70;
  var kcalPerHour = Math.round(sport.met * weightKg);
  var sportLabel = lang === 'en' ? (sport.labelEN || sport.label) : sport.label;
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
        <SportIcon type={sportKey} size={wp(24)} color={sport.color} />
        <Text style={{
          color: '#EAEEF3', fontSize: fp(10), fontWeight: '700',
          marginTop: wp(4), textAlign: 'center',
        }}>
          {sportLabel}
        </Text>
        <Text style={{
          color: sport.color, fontSize: fp(8), fontWeight: '600',
          marginTop: wp(2),
        }}>
          {kcalPerHour} kcal/h
        </Text>
      </View>
    </MetalCard>
  );
};

// === PHASES SUIVANTES ===
