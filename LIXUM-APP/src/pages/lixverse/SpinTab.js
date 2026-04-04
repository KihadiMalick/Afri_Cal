import React, { useRef } from 'react';
import { View, Text, ScrollView, Pressable, Platform,
  Animated, Dimensions, PixelRatio, Modal, ActivityIndicator,
  Easing } from 'react-native';
import Svg, { Defs, Path, Circle, G, Polygon, Line,
  LinearGradient as SvgLinearGradient, RadialGradient,
  Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  LixGem, renderLixGemSegment, renderSegmentIcon
} from './lixverseComponents';
import {
  SUPABASE_URL, POST_HEADERS, HEADERS,
  NORMAL_SEGMENTS, SUPER_SEGMENTS, MEGA_SEGMENTS,
  SLUGS_BY_TIER, CHAR_NAMES, CHAR_EMOJIS, FRAGS_NIV1,
  SEGMENT_GRADIENTS, TEST_USER_ID,
  getSegmentAngles, describeArc, getSegmentRewardType
} from './lixverseConstants';
import { wp, fp } from '../../constants/layout';

const W = Dimensions.get('window').width;

export default function SpinTab({
  lixBalance,
  userEnergy,
  spinTier,
  setSpinTier,
  freeSpinAvailable,
  freeSpinUsed,
  nextFreeAt,
  timeToFree,
  isSpinning,
  spinLoading,
  winnerGlowIdx,
  spinAnim,
  arrowBounce,
  spinBtnScale,
  freeBtnPulse,
  glowOpacity,
  showSpinResultModal,
  spinWinnerSeg,
  serverResult,
  fragmentResult,
  showFragmentModal,
  fragmentSlideAnim,
  spinResultPulse,
  onDoSpin,
  onCloseSpinResult,
  onCloseFragmentModal,
  onGoToCharacters,
  onGoToLixSpin,
  showLixAlert,
  lixSpinScrollRef,
}) {
  const getSegments = () => {
    if (spinTier === 'super') return SUPER_SEGMENTS;
    if (spinTier === 'mega') return MEGA_SEGMENTS;
    return NORMAL_SEGMENTS;
  };

  const segments = getSegments();
  const angledSegs = getSegmentAngles(segments);
  const wheelR = wp(120);
  const innerR = wp(112);
  const cx = wp(130);
  const cy = wp(130);
  const svgSize = cx * 2;
  const rot = spinAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
  const arrowRotation = arrowBounce.interpolate({ inputRange: [0, 1, 1.6], outputRange: ['0deg', '15deg', '25deg'] });

  let spinCost = 0;
  if (spinTier === 'normal') spinCost = (freeSpinAvailable && !freeSpinUsed) ? 0 : 50;
  else if (spinTier === 'super') spinCost = 150;
  else spinCost = 500;

  const spinBtnLabel = spinTier === 'normal' ? (spinCost === 0 ? '🎁 SPIN GRATUIT' : 'SPIN — 50 Lix')
    : spinTier === 'super' ? 'SUPERSPIN — 150 Lix 🔥'
    : 'MEGASPIN — 500 Lix 💎';

  const spinBtnColors = spinTier === 'normal' && spinCost === 0 ? ['#00D984', '#00B871', '#009960']
    : spinTier === 'super' ? ['#FF8C42', '#E67E22']
    : spinTier === 'mega' ? ['#D4AF37', '#B8941F']
    : ['#3A3F46', '#252A30'];
  const spinBtnBorder = spinTier === 'mega' ? '#D4AF37' : spinTier === 'super' ? '#FF8C42' : (spinCost === 0 ? '#5DFFB4' : '#4A4F55');

  const tierButtons = [
    { key: 'normal', label: 'Spin ⚡', sub: !freeSpinUsed ? 'Gratuit' : '50 Lix' },
    { key: 'super', label: 'SuperSpin 🔥', sub: '150 Lix' },
    { key: 'mega', label: 'MegaSpin 💎', sub: '500 Lix' },
  ];

  const onBtnPressIn = () => {
    Animated.spring(spinBtnScale, { toValue: 0.94, friction: 8, tension: 200, useNativeDriver: true }).start();
  };
  const onBtnPressOut = () => {
    Animated.spring(spinBtnScale, { toValue: 1, friction: 5, tension: 300, useNativeDriver: true }).start();
  };

  const usedColors = [...new Set(angledSegs.map(s => s.color))];

  const renderSpinResultModal = () => {
    return null;
  };

  return (
    <ScrollView ref={lixSpinScrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100) }}>
      <View style={{ alignItems: 'center', paddingTop: wp(8), marginBottom: wp(10) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: wp(12), paddingVertical: wp(8), paddingHorizontal: wp(20), borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)', gap: wp(8) }}>
          <LixGem size={wp(18)} />
          <Text style={{ fontSize: fp(24), fontWeight: '800', color: '#D4AF37' }}>{lixBalance.toLocaleString('fr-FR')}</Text>
          <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.5)' }}>Lix</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: wp(8), marginBottom: wp(12), paddingHorizontal: wp(12) }}>
        {tierButtons.map(tb => {
          const active = spinTier === tb.key;
          return (
            <Pressable key={tb.key} delayPressIn={120}
              onPress={() => { if (!isSpinning) { setSpinTier(tb.key); } }}
              style={({ pressed }) => ({
                flex: 1, height: wp(50), borderRadius: wp(12),
                overflow: 'hidden',
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? '#D4AF37' : '#4A4F55',
                ...(active && tb.key === 'normal' ? { shadowColor: '#00D984', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 } : {}),
                ...(active && tb.key === 'super' ? { shadowColor: '#FF8C42', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 } : {}),
                ...(active && tb.key === 'mega' ? { shadowColor: '#D4AF37', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 } : {}),
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}>
              {active ? (
                <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                  style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(4) }}>
                  <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>{tb.label}</Text>
                  <Text style={{ fontSize: fp(10), color: '#D4AF37', marginTop: wp(2) }}>{tb.sub}</Text>
                </LinearGradient>
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(30,35,42,0.6)', paddingHorizontal: wp(4) }}>
                  <Text style={{ fontSize: fp(11), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>{tb.label}</Text>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)', marginTop: wp(2) }}>{tb.sub}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
