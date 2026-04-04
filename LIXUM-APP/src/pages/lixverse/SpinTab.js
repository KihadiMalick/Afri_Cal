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
    if (!showSpinResultModal || !spinWinnerSeg) return null;
    const rw = spinWinnerSeg.reward;
    const srv = serverResult || {};
    const rv = srv.reward_value || {};

    let iconContent = null;
    let title = '';
    let subtitle = '';
    let accentColor = '#00D984';
    let btnText = 'Récupérer';
    let hasBorder = false;

    if (rw.type === 'energy') {
      iconContent = (
        <Svg width={wp(48)} height={wp(48)} viewBox="0 0 24 24">
          <Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill="#FFB800" />
          <Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill="none" stroke="#FFF" strokeWidth={0.5} opacity={0.3} />
        </Svg>
      );
      title = '+' + (rv.energy || rw.amount) + ' Énergie';
      accentColor = '#00D984';
    } else if (rw.type === 'lix') {
      iconContent = <LixGem size={wp(48)} />;
      title = '+' + (rv.lix || rw.amount) + ' Lix';
      accentColor = '#D4AF37';
    } else if (rw.type === 'scan') {
      iconContent = (
        <Svg width={wp(48)} height={wp(48)} viewBox="0 0 24 24" fill="none">
          <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" fill="#4DA6FF" />
          <Circle cx="12" cy="13" r="4" fill="#1A1D22" stroke="#FFF" strokeWidth="1" />
          <Circle cx="12" cy="13" r="2" fill="#4DA6FF" opacity={0.5} />
        </Svg>
      );
      title = '+' + (rv.scans || rw.amount) + ' Scan' + ((rv.scans || rw.amount) > 1 ? 's' : '') + ' gratuit' + ((rv.scans || rw.amount) > 1 ? 's' : '');
      accentColor = '#4DA6FF';
    } else if (rw.type === 'free_spin') {
      iconContent = (
        <View style={{ width: wp(56), height: wp(56), borderRadius: wp(28), backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' }}>
          <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
            <Path d="M20 12v10H4V12" stroke="#D4AF37" strokeWidth={2} />
            <Path d="M2 7h20v5H2z" stroke="#D4AF37" strokeWidth={2} />
            <Path d="M12 22V7" stroke="#D4AF37" strokeWidth={2} />
            <Path d="M12 7c-1.5-2-4-3-4-3s1 3 4 3z" fill="#D4AF37" />
            <Path d="M12 7c1.5-2 4-3 4-3s-1 3-4 3z" fill="#D4AF37" />
          </Svg>
        </View>
      );
      title = 'Tour gratuit gagné !';
      subtitle = 'Utilise-le maintenant';
      accentColor = '#D4AF37';
      btnText = 'Spinner !';
    } else if (rw.type === 'fragment') {
      const charTier = srv.character_tier || rw.tier;
      const tierColors = { mythique: '#E040FB', elite: '#B388FF', rare: '#4DA6FF', standard: '#00D984' };
      accentColor = tierColors[charTier] || '#00D984';
      hasBorder = true;
      const charEmoji = srv.character_emoji || (fragmentResult ? fragmentResult.emoji : '🧩');
      iconContent = <Text style={{ fontSize: fp(56) }}>{charEmoji}</Text>;
      title = (srv.character_name || (fragmentResult ? fragmentResult.name : 'Fragment')) + '';
      subtitle = '+' + (rv.fragment || rw.amount) + ' fragment ' + (charTier || '').charAt(0).toUpperCase() + (charTier || '').slice(1);
      btnText = 'INTÉGRER ←';
    } else if (rw.type === 'card') {
      accentColor = '#D4AF37';
      hasBorder = true;
      iconContent = <Text style={{ fontSize: fp(56) }}>{fragmentResult ? fragmentResult.emoji : '🏆'}</Text>;
      title = 'CARTE COMPLÈTE !';
      subtitle = (fragmentResult ? fragmentResult.name : 'Personnage') + ' débloqué';
      btnText = 'Voir →';
    }

    return (
      <Modal visible={showSpinResultModal} transparent animationType="fade" onRequestClose={onCloseSpinResult}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20) }}>
          <View style={{
            borderRadius: wp(24), width: '100%', alignItems: 'center', overflow: 'hidden',
            borderWidth: hasBorder ? 2 : 0, borderColor: accentColor,
          }}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#1A1D22']}
              style={{ width: '100%', alignItems: 'center', paddingVertical: wp(32), paddingHorizontal: wp(24) }}>

              <View style={{
                width: wp(90), height: wp(90), borderRadius: wp(45),
                backgroundColor: accentColor + '10',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: wp(16),
                shadowColor: accentColor,
                shadowOpacity: 0.4,
                shadowRadius: wp(20),
                elevation: 8,
              }}>
                <Animated.View style={{
                  transform: [{ scale: (rw.type === 'fragment' || rw.type === 'card') ? spinResultPulse : 1 }],
                }}>
                  {iconContent}
                </Animated.View>
              </View>

              <Text style={{
                fontSize: rw.type === 'card' ? fp(24) : fp(22),
                fontWeight: '800', color: accentColor,
                textAlign: 'center', marginBottom: wp(4),
                letterSpacing: rw.type === 'card' ? 2 : 0,
              }}>{title}</Text>

              {subtitle ? (
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: wp(4) }}>{subtitle}</Text>
              ) : null}

              {fragmentResult && fragmentResult.levelUp && (
                <View style={{
                  backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: wp(10),
                  paddingHorizontal: wp(16), paddingVertical: wp(6), marginTop: wp(8),
                  borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
                }}>
                  <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#D4AF37' }}>⬆️ Niveau {fragmentResult.newLevel} atteint !</Text>
                </View>
              )}

              <Pressable delayPressIn={120}
                onPress={() => {
                  onCloseSpinResult();
                  if (rw.type === 'fragment' || rw.type === 'card' || rw.type === 'full_card') {
                    onGoToCharacters();
                  }
                }}
                style={({ pressed }) => ({ width: '100%', marginTop: wp(20), transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                <View style={{
                  paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: accentColor + '20',
                  borderWidth: 1.5, borderColor: accentColor + '50',
                }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: accentColor }}>{btnText}</Text>
                </View>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    );
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

      <View style={{ alignItems: 'center', marginBottom: wp(20) }}>
        <Animated.View style={{
          marginBottom: -wp(8), zIndex: 10,
          transform: [{ rotate: arrowRotation }],
          shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: wp(4), shadowOffset: { width: 0, height: wp(2) }, elevation: 6,
        }}>
          <Svg width={wp(20)} height={wp(28)} viewBox="0 0 20 28">
            <Defs>
              <SvgLinearGradient id="arrowGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#D4AF37" />
                <Stop offset="1" stopColor="#B8952E" />
              </SvgLinearGradient>
            </Defs>
            <Polygon points="10,28 0,4 3,0 17,0 20,4" fill="url(#arrowGrad)" stroke="#8B7A2E" strokeWidth="1.5" strokeLinejoin="round" />
          </Svg>
        </Animated.View>

        <View style={{
          width: svgSize, height: svgSize,
          shadowColor: spinTier === 'mega' ? '#D4AF37' : spinTier === 'super' ? '#FF8C42' : '#00D984',
          shadowOpacity: isSpinning ? 0.4 : 0.15,
          shadowRadius: isSpinning ? wp(20) : wp(10),
          shadowOffset: { width: 0, height: 0 },
          elevation: isSpinning ? 8 : 3,
        }}>
          <Animated.View style={{ width: svgSize, height: svgSize, transform: [{ rotate: rot }] }}>
            <Svg width={svgSize} height={svgSize} viewBox={'0 0 ' + svgSize + ' ' + svgSize}>
              <Defs>
                {usedColors.map(color => {
                  const grad = SEGMENT_GRADIENTS[color] || { inner: color, outer: color };
                  return (
                    <RadialGradient key={'grad_' + color} id={'sg_' + color.replace('#', '')} cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor={grad.inner} stopOpacity="0.95" />
                      <Stop offset="100%" stopColor={grad.outer} stopOpacity="1" />
                    </RadialGradient>
                  );
                })}
                <RadialGradient id="hubGrad" cx="50%" cy="40%" r="60%">
                  <Stop offset="0%" stopColor="#4A5060" />
                  <Stop offset="100%" stopColor="#1A1D22" />
                </RadialGradient>
              </Defs>

              {angledSegs.map((seg, i) => (
                <Path key={'seg' + i}
                  d={describeArc(cx, cy, innerR, seg.startAngle, seg.startAngle + seg.sweepAngle)}
                  fill={'url(#sg_' + seg.color.replace('#', '') + ')'}
                />
              ))}

              {angledSegs.map((seg, i) => {
                const rad = (seg.startAngle - 90) * Math.PI / 180;
                const lx = cx + innerR * Math.cos(rad);
                const ly = cy + innerR * Math.sin(rad);
                return <Line key={'sep' + i} x1={cx} y1={cy} x2={lx} y2={ly} stroke="#1A1D22" strokeWidth={wp(1.5)} />;
              })}

              {winnerGlowIdx !== null && angledSegs[winnerGlowIdx] && (
                <Path
                  d={describeArc(cx, cy, innerR, angledSegs[winnerGlowIdx].startAngle, angledSegs[winnerGlowIdx].startAngle + angledSegs[winnerGlowIdx].sweepAngle)}
                  fill="rgba(255,255,255,0.35)"
                  opacity={0.5}
                />
              )}

              {angledSegs.map((seg, i) => {
                const midAngle = seg.startAngle + seg.sweepAngle / 2;
                const midRad = (midAngle - 90) * Math.PI / 180;
                const rType = getSegmentRewardType(seg);
                const iconR = (rType === 'card' || rType === 'full_card') ? innerR * 0.65 : innerR * 0.72;
                const iconSize = (rType === 'card' || rType === 'full_card') ? wp(16) : wp(20);
                const iconX = cx + iconR * Math.cos(midRad);
                const iconY = cy + iconR * Math.sin(midRad);
                return (
                  <G key={'lbl' + i}>
                    {renderSegmentIcon(rType, seg.reward.tier, iconX, iconY, iconSize, midAngle)}
                  </G>
                );
              })}

              <Circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#D4AF37" strokeWidth={wp(1.5)} />
              <Circle cx={cx} cy={cy} r={wheelR} fill="none" stroke="#3A3F46" strokeWidth={wp(8)} />
              <Circle cx={cx} cy={cy} r={wheelR - wp(4)} fill="none" stroke="#D4AF37" strokeWidth={wp(1.5)} />

              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * 30 - 90) * Math.PI / 180;
                const rx = cx + wheelR * Math.cos(a);
                const ry = cy + wheelR * Math.sin(a);
                return (
                  <G key={'rv' + i}>
                    <Circle cx={rx} cy={ry} r={wp(5)} fill="rgba(212,175,55,0.3)" />
                    <Circle cx={rx} cy={ry} r={wp(3.5)} fill="#D4AF37" />
                    <Circle cx={rx - wp(0.8)} cy={ry - wp(0.8)} r={wp(1.5)} fill="#F0E070" />
                  </G>
                );
              })}

              <Circle cx={cx} cy={cy} r={wp(30)} fill="rgba(0,0,0,0.25)" />
              <Circle cx={cx} cy={cy} r={wp(28)} fill="url(#hubGrad)" stroke="#D4AF37" strokeWidth={wp(2)} />
            </Svg>
          </Animated.View>

          <View style={{
            position: 'absolute', top: cy - wp(28), left: cx - wp(28),
            width: wp(56), height: wp(56), borderRadius: wp(28),
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Text style={{ fontSize: fp(22) }}>{spinTier === 'mega' ? '💎' : spinTier === 'super' ? '🔥' : '⚡'}</Text>
            <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37', marginTop: -wp(2) }}>
              {spinTier === 'mega' ? 'MEGA' : spinTier === 'super' ? 'SUPER' : 'SPIN'}
            </Text>
          </View>
        </View>

        <Animated.View style={{
          transform: [{ scale: (spinCost === 0 && spinTier === 'normal' && !isSpinning) ? Animated.multiply(spinBtnScale, freeBtnPulse) : spinBtnScale }],
          marginTop: wp(16), width: wp(260),
          opacity: (isSpinning || spinLoading) ? 0.5 : 1,
        }}>
          <Pressable delayPressIn={120} onPress={onDoSpin} disabled={isSpinning || spinLoading}
            onPressIn={onBtnPressIn} onPressOut={onBtnPressOut}
            style={{ width: '100%' }}>
            <LinearGradient colors={spinBtnColors}
              style={{
                paddingVertical: wp(14), borderRadius: wp(24), alignItems: 'center', height: wp(48), justifyContent: 'center',
                borderWidth: spinCost === 0 && spinTier === 'normal' ? 0 : 2,
                borderColor: spinBtnBorder,
                shadowColor: spinTier === 'mega' ? '#D4AF37' : spinTier === 'super' ? '#FF8C42' : 'transparent',
                shadowOpacity: spinTier !== 'normal' ? 0.4 : 0,
                shadowRadius: spinTier === 'mega' ? wp(12) : wp(8),
                elevation: spinTier !== 'normal' ? 4 : 0,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                {spinCost === 0 && spinTier === 'normal' && (
                  <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                    <Path d="M20 12v10H4V12" stroke="#FFF" strokeWidth={2} />
                    <Path d="M2 7h20v5H2z" stroke="#FFF" strokeWidth={2} />
                    <Path d="M12 22V7" stroke="#FFF" strokeWidth={2} />
                    <Path d="M12 7c-1.5-2-4-3-4-3s1 3 4 3z" fill="#FFF" />
                    <Path d="M12 7c1.5-2 4-3 4-3s-1 3-4 3z" fill="#FFF" />
                  </Svg>
                )}
                <Text style={{ fontSize: spinCost === 0 ? fp(17) : fp(15), fontWeight: '800', color: '#FFF', letterSpacing: spinCost === 0 ? 1 : 0 }}>{spinBtnLabel}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View style={{ marginTop: wp(10), alignItems: 'center' }}>
          {freeSpinAvailable && !freeSpinUsed ? (
            <Text style={{ fontSize: fp(11), color: '#00D984' }}>🎁 1 spin gratuit disponible</Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
              <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                <Path d="M12 6v6l4 2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              </Svg>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.35)', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                {timeToFree || '--:--:--'}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ alignItems: 'center', marginVertical: wp(16) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(12) }}>
          <View style={{ width: wp(40), height: 1, backgroundColor: 'rgba(212,175,55,0.12)' }} />
          <LixGem size={wp(12)} />
          <View style={{ width: wp(40), height: 1, backgroundColor: 'rgba(212,175,55,0.12)' }} />
        </View>
      </View>

      <View style={{ paddingHorizontal: wp(16), marginBottom: wp(24) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#D4AF37', marginBottom: wp(4) }}>Abonnements</Text>
        <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)', marginBottom: wp(12) }}>Débloque l'accès complet à LIXUM</Text>

        <Pressable delayPressIn={120} onPress={() => showLixAlert('Gold', 'Bientôt disponible.\n\n10 000 Lix/mois + 150 énergie/6h + fragments bonus', [{ text: 'Me notifier', color: '#D4AF37' }, { text: 'Fermer', style: 'cancel' }], '⭐')}
          style={({ pressed }) => ({ marginBottom: wp(8), transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <LinearGradient colors={['#3A3F46', '#252A30', '#333A42']}
            style={{ borderRadius: wp(14), padding: wp(16), borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.3)', flexDirection: 'row', alignItems: 'center', shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}>
            <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(212,175,55,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12), borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' }}>
              <Text style={{ fontSize: fp(20) }}>⭐</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#D4AF37' }}>Gold</Text>
                <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(1) }}>
                  <Text style={{ fontSize: fp(8), fontWeight: '700', color: '#D4AF37' }}>POPULAIRE</Text>
                </View>
              </View>
              <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>10K Lix + 150 énergie/6h + fragments</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(212,175,55,0.2)', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6) }}>
              <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#D4AF37' }}>$9.99</Text>
              <Text style={{ fontSize: fp(8), color: 'rgba(212,175,55,0.6)', textAlign: 'center' }}>/mois</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable delayPressIn={120} onPress={() => showLixAlert('Platinum', 'Bientôt disponible.\n\n18 000 Lix/mois + 350 énergie/6h + fragments Elite', [{ text: 'Me notifier', color: '#00CEC9' }, { text: 'Fermer', style: 'cancel' }], '💎')}
          style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <LinearGradient colors={['#3A3F46', '#252A30', '#333A42']}
            style={{ borderRadius: wp(14), padding: wp(16), borderWidth: 1.5, borderColor: 'rgba(0,206,201,0.3)', flexDirection: 'row', alignItems: 'center', shadowColor: '#00CEC9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}>
            <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(0,206,201,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12), borderWidth: 1, borderColor: 'rgba(0,206,201,0.25)' }}>
              <Text style={{ fontSize: fp(20) }}>💎</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#00CEC9' }}>Platinum</Text>
              <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>18K Lix + 350 énergie/6h + fragments Elite</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(0,206,201,0.2)', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6) }}>
              <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#00CEC9' }}>$14.99</Text>
              <Text style={{ fontSize: fp(8), color: 'rgba(0,206,201,0.6)', textAlign: 'center' }}>/mois</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={{ alignItems: 'center', marginVertical: wp(16) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(12) }}>
          <View style={{ width: wp(40), height: 1, backgroundColor: 'rgba(212,175,55,0.12)' }} />
          <LixGem size={wp(12)} />
          <View style={{ width: wp(40), height: 1, backgroundColor: 'rgba(212,175,55,0.12)' }} />
        </View>
      </View>

      <View style={{ paddingHorizontal: wp(16) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Acheter des Lix</Text>
        {[{ n: 'Micro', p: '$0.99', l: 990, b: '', c: '#00D984' }, { n: 'Basic', p: '$4.99', l: 5240, b: '+5%', c: '#4DA6FF' }, { n: 'Standard', p: '$9.99', l: 10990, b: '+10%', c: '#9B6DFF', best: true }, { n: 'Mega', p: '$29.99', l: 35990, b: '+20%', c: '#D4AF37' }, { n: 'Ultra', p: '$99.99', l: 129990, b: '+30%', c: '#D4AF37', ultra: true }].map((pk, i) => (
          <Pressable key={i} delayPressIn={120} onPress={() => showLixAlert('Achat ' + pk.n, pk.p + ' → ' + pk.l.toLocaleString('fr-FR') + ' Lix\n\nBientôt disponible.', [{ text: 'OK', style: 'cancel' }], '💎')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(14), borderRadius: wp(14), marginBottom: wp(8), backgroundColor: 'transparent', borderWidth: pk.ultra ? 2 : pk.best ? 1.5 : 1, borderColor: pk.ultra ? '#D4AF37' : pk.best ? pk.c + '50' : pk.c + '25', ...(pk.ultra ? { shadowColor: '#D4AF37', shadowOpacity: 0.3, shadowRadius: wp(8), elevation: 4 } : {}), transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: pk.c + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}><LixGem size={wp(22)} /></View>
            <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), flexWrap: 'wrap' }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{pk.n}</Text>{pk.b ? <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(1) }}><Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37' }}>{pk.b}</Text></View> : null}</View><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{pk.l.toLocaleString('fr-FR')} Lix</Text>{pk.best ? <View style={{ backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(2), marginTop: wp(3), alignSelf: 'flex-start' }}><Text style={{ fontSize: fp(7), fontWeight: '800', color: '#00D984' }}>MEILLEUR RAPPORT</Text></View> : null}</View>
            <View style={{ backgroundColor: pk.c + '20', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6) }}><Text style={{ fontSize: fp(13), fontWeight: '700', color: pk.c }}>{pk.p}</Text></View>
          </Pressable>
        ))}
      </View>

      <View style={{ paddingHorizontal: wp(16), marginTop: wp(24) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Recharger énergie</Text>
        {[{ n: 'Mini', e: 30, l: 300, d: 'Recharge légère', emoji: '⚡', c: '#FFB800' }, { n: 'Standard', e: 80, l: 700, d: 'Recharge quotidienne', emoji: '⚡', c: '#FF8C42', best: true }, { n: 'XL', e: 200, l: 1500, d: 'Recharge complète', emoji: '🔋', c: '#FF6B6B' }].map((pk, i) => (
          <Pressable key={i} delayPressIn={120} onPress={() => {
            if (lixBalance < pk.l) {
              showLixAlert('Lix insuffisants', 'Il faut ' + pk.l + ' Lix pour cette recharge.\n\nTon solde : ' + lixBalance + ' Lix', [{ text: 'Fermer', style: 'cancel' }], '⚡');
              return;
            }
            showLixAlert(
              '⚡ Confirmer la recharge ?',
              '+' + pk.e + ' énergie pour ' + pk.l + ' Lix\n\nTon solde après : ' + (lixBalance - pk.l).toLocaleString('fr-FR') + ' Lix',
              [
                {
                  text: 'Confirmer',
                  color: '#00D984',
                  onPress: async () => {
                    try {
                      await fetch(SUPABASE_URL + '/rest/v1/rpc/recharge_energy_with_lix', {
                        method: 'POST',
                        headers: POST_HEADERS,
                        body: JSON.stringify({ p_user_id: TEST_USER_ID, p_lix_cost: pk.l, p_energy_amount: pk.e }),
                      });
                    } catch (e) {
                      fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID, {
                        method: 'PATCH',
                        headers: POST_HEADERS,
                        body: JSON.stringify({
                          lix_balance: lixBalance - pk.l,
                          energy: userEnergy + pk.e,
                        }),
                      }).catch(() => {});
                    }
                    showLixAlert('Rechargé', '+' + pk.e + ' énergie ajoutée !\n\nNouveau solde : ' + (lixBalance - pk.l).toLocaleString('fr-FR') + ' Lix', [{ text: 'Super', color: '#00D984' }], '⚡');
                  },
                },
                { text: 'Annuler', style: 'cancel' },
              ],
              '⚡'
            );
          }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(12), borderRadius: wp(12), marginBottom: wp(6), backgroundColor: pk.best ? 'rgba(255,140,66,0.06)' : 'transparent', borderWidth: pk.best ? 1.5 : 1, borderColor: pk.best ? (pk.c || '#00D984') + '40' : 'rgba(255,255,255,0.08)', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <Text style={{ fontSize: fp(14), marginRight: wp(10) }}>{pk.emoji || '⚡'}</Text>
            <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
  <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>+{pk.e} énergie</Text>
  {pk.best && <View style={{ backgroundColor: 'rgba(255,140,66,0.15)', borderRadius: wp(4), paddingHorizontal: wp(5), paddingVertical: wp(1) }}><Text style={{ fontSize: fp(7), fontWeight: '800', color: '#FF8C42' }}>POPULAIRE</Text></View>}
</View><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{pk.d}</Text></View>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: pk.c || '#00D984' }}>{pk.l} Lix</Text>
          </Pressable>
        ))}
      </View>

      {renderSpinResultModal()}

      <Modal visible={showFragmentModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20) }}>
          {fragmentResult && (
            <Animated.View style={{
              transform: [{ translateX: fragmentSlideAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -W] }) }],
              opacity: fragmentSlideAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.5, 0] }),
            }}>
              <View style={{
                backgroundColor: '#1E2530', borderRadius: wp(20),
                borderWidth: 1.5,
                borderColor: fragmentResult.isComplete ? '#D4AF37'
                  : fragmentResult.tier === 'mythique' ? 'rgba(212,175,55,0.4)'
                  : fragmentResult.tier === 'elite' ? 'rgba(138,43,226,0.4)'
                  : fragmentResult.tier === 'rare' ? 'rgba(77,166,255,0.4)'
                  : 'rgba(0,217,132,0.3)',
                padding: wp(24), alignItems: 'center', width: W - wp(40),
              }}>
                <Text style={{ fontSize: fp(50), marginBottom: wp(10) }}>{fragmentResult.emoji}</Text>
                <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#EAEEF3', marginBottom: wp(4) }}>{fragmentResult.name}</Text>
                <Text style={{
                  fontSize: fp(10), fontWeight: '700', letterSpacing: 2,
                  color: fragmentResult.tier === 'mythique' ? '#D4AF37'
                    : fragmentResult.tier === 'elite' ? '#B388FF'
                    : fragmentResult.tier === 'rare' ? '#4DA6FF'
                    : '#00D984',
                  textTransform: 'uppercase', marginBottom: wp(14),
                }}>{fragmentResult.tier}</Text>

                {fragmentResult.isComplete ? (
                  <View style={{ alignItems: 'center', marginBottom: wp(14) }}>
                    <Text style={{ fontSize: fp(22), marginBottom: wp(6) }}>🎉</Text>
                    <Text style={{ fontSize: fp(14), fontWeight: '800', color: '#D4AF37', textAlign: 'center' }}>CARTE COMPLÈTE !</Text>
                    <Text style={{ fontSize: fp(11), color: '#8892A0', textAlign: 'center', marginTop: wp(4) }}>{fragmentResult.name} est maintenant Niveau 1 !</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', marginBottom: wp(14) }}>
                    <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#00D984' }}>+{fragmentResult.amount} fragment{fragmentResult.amount > 1 ? 's' : ''} 🧩</Text>
                    <Text style={{ fontSize: fp(11), color: '#8892A0', marginTop: wp(4) }}>{fragmentResult.totalFrags} / {fragmentResult.fragsNeeded} pour Niv 1</Text>
                    <View style={{ width: '80%', height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: wp(8) }}>
                      <View style={{
                        width: Math.min((fragmentResult.totalFrags / fragmentResult.fragsNeeded) * 100, 100) + '%',
                        height: '100%', borderRadius: wp(4),
                        backgroundColor: fragmentResult.tier === 'mythique' ? '#D4AF37'
                          : fragmentResult.tier === 'elite' ? '#B388FF'
                          : fragmentResult.tier === 'rare' ? '#4DA6FF' : '#00D984',
                      }} />
                    </View>
                  </View>
                )}

                {fragmentResult.levelUp && (
                  <View style={{ backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: wp(10), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', paddingHorizontal: wp(14), paddingVertical: wp(8), marginBottom: wp(14), width: '100%' }}>
                    <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#D4AF37', textAlign: 'center' }}>⬆️ Niveau {fragmentResult.newLevel} atteint !</Text>
                  </View>
                )}

                <Pressable
                  onPress={() => {
                    Animated.timing(fragmentSlideAnim, {
                      toValue: 1, duration: 400, useNativeDriver: true,
                      easing: Easing.inOut(Easing.ease),
                    }).start(async () => {
                      onCloseFragmentModal();
                      onGoToCharacters();
                      try {
                        const res = await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID + '&select=lix_balance,energy', { headers: HEADERS });
                        const d = await res.json();
                        if (d && d[0]) {
                          if (d[0].lix_balance != null || d[0].energy != null) {
                            onCloseFragmentModal();
                          }
                        }
                      } catch (e) {}
                    });
                  }}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? '#00B572' : '#00D984',
                    borderRadius: wp(14), paddingVertical: wp(14), paddingHorizontal: wp(40),
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text style={{ fontSize: fp(14), fontWeight: '800', color: '#1A1D22', letterSpacing: 1 }}>INTÉGRER ←</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}
