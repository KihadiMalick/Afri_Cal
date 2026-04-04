import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  Animated as RNAnimated, Image, Platform, Easing, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Ellipse } from 'react-native-svg';
import MetalCard from '../../components/shared/MetalCard';
import LockIcon from '../../components/shared/LockIcon';
import {
  wp, fp, DAILY_OBJECTIVE,
  suggestActivities, ACTIVITY_ICONS, ACTIVITY_LABELS,
  formatNumberFR, formatTimeFR,
  REACTOR_SIZE, DNA_WIDTH,
} from './dashboardConstants';
import { LixGemIcon, LixCoinIcon, ForkKnifeIcon, StatsIcon } from './dashboardIcons';
import { EcgPulse, ReactorCore, DnaHelix, HydrationCardCompact } from './dashboardComponents';

const DashboardContent = ({
  onHydrationPress, hydrationMl, hydrationGoal, gender,
  burnedExtra, sportAlert, consumedTotal, burnedTotal,
  scrollRef, dailyTarget, lastMeal, tooltipStep,
  vitalityScore, activeChar, pagePowers,
  toggleStates, setToggleStates, consumePower,
  userName, onAvatarPress, onNavigate, showToast, onOpenStats,
}) => {
  const OBJECTIVE = dailyTarget || DAILY_OBJECTIVE;
  const [showInfoLeft, setShowInfoLeft] = useState(false);
  const [showInfoRight, setShowInfoRight] = useState(false);
  const remaining = Math.max(0, OBJECTIVE - (consumedTotal - burnedTotal));
  var _mealExpanded = useState(false);
  var mealExpanded = _mealExpanded[0]; var setMealExpanded = _mealExpanded[1];
  var _coachExpanded = useState(false);
  var coachExpanded = _coachExpanded[0]; var setCoachExpanded = _coachExpanded[1];
  const tooltipPulse = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (tooltipStep > 0) {
      const pulse = RNAnimated.loop(RNAnimated.sequence([
        RNAnimated.timing(tooltipPulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        RNAnimated.timing(tooltipPulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]));
      pulse.start();
      return () => pulse.stop();
    } else { tooltipPulse.setValue(0); }
  }, [tooltipStep]);

  const pulseOpacity = tooltipPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const pulseScale = tooltipPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <ScrollView ref={scrollRef} style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(15), paddingTop: wp(8) }}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={function() { setShowInfoLeft(false); setShowInfoRight(false); }}>

      <View style={{ marginBottom: wp(6), opacity: tooltipStep > 0 ? 0.05 : 1 }}>
        <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#EAEEF3' }}>
          {new Date().getHours() < 12 ? 'Bonjour' : new Date().getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'} 👋
        </Text>
        <Text style={{ fontSize: fp(10), color: '#6B7280', marginTop: wp(2) }}>
          {!lastMeal ? 'Commencez par scanner votre premier repas' : consumedTotal + ' kcal consommées aujourd\'hui'}
        </Text>
      </View>

      <MetalCard style={{ marginHorizontal: 0, marginBottom: wp(12), ...([2, 3, 4].includes(tooltipStep) && { borderColor: tooltipStep === 2 ? '#FF8C42' : tooltipStep === 3 ? '#00D984' : '#4DA6FF', borderWidth: 2, zIndex: 10001 }) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(10) }}>
          <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(9), fontWeight: '800', letterSpacing: wp(2), color: '#8892A0' }}>BILAN ÉNERGÉTIQUE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: fp(13), fontWeight: '800', color: '#00D984', textShadowColor: 'rgba(0, 217, 132, 0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 }}>{formatNumberFR(OBJECTIVE)} kcal</Text>
              <Text style={{ fontSize: fp(7), fontWeight: '600', color: '#6B7280', letterSpacing: 0.5, marginTop: wp(1) }}>Objectif du Jour</Text>
            </View>
            <View style={{ width: wp(5), height: wp(5), borderRadius: wp(2.5), backgroundColor: '#00D984', marginLeft: wp(4) }} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', overflow: 'visible', paddingVertical: 4 }}>
          <View style={{ alignItems: 'center', width: REACTOR_SIZE + 20 }}>
            <RNAnimated.View style={{ opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 2 ? (tooltipStep === 2 ? pulseOpacity : 1) : 0.05, transform: tooltipStep === 2 ? [{ scale: pulseScale }] : [] }}>
              <ReactorCore size={REACTOR_SIZE} value={consumedTotal} percentage={Math.round((consumedTotal / OBJECTIVE) * 100)} label="Consommé" color="#FF8C42" colorLight="#FFB87A" colorDark="#CC6020" clockwise={true} />
            </RNAnimated.View>
            <RNAnimated.View style={{ alignItems: 'center', marginTop: 4, opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 2 ? (tooltipStep === 2 ? pulseOpacity : 1) : 0.05 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(11), fontWeight: '700', color: '#FF8C42' }}>{formatNumberFR(consumedTotal)} kcal</Text>
                <Pressable onPress={function() { setShowInfoLeft(function(v) { return !v; }); setShowInfoRight(false); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: showInfoLeft ? 'rgba(255,140,66,0.15)' : 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: showInfoLeft ? 'rgba(255,140,66,0.3)' : 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: wp(4) }}>
                  <Text style={{ color: showInfoLeft ? '#FF8C42' : '#8892A0', fontSize: fp(8), fontWeight: '700' }}>i</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: fp(9), fontWeight: '600', color: '#8892A0', marginTop: 2 }}>Consommé</Text>
            </RNAnimated.View>
          </View>

          <RNAnimated.View style={{ opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 3 ? (tooltipStep === 3 ? pulseOpacity : 1) : 0.05, transform: tooltipStep === 3 ? [{ scale: pulseScale }] : [] }}>
            <DnaHelix height={REACTOR_SIZE * 1.45} width={DNA_WIDTH} />
          </RNAnimated.View>

          <View style={{ alignItems: 'center', width: REACTOR_SIZE + 20 }}>
            <RNAnimated.View style={{ opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 4 ? (tooltipStep === 4 ? pulseOpacity : 1) : 0.05, transform: tooltipStep === 4 ? [{ scale: pulseScale }] : [] }}>
              <ReactorCore size={REACTOR_SIZE} value={remaining} percentage={Math.round((remaining / OBJECTIVE) * 100)} label="Reste" color="#4DA6FF" colorLight="#8DCAFF" colorDark="#2B7ACC" clockwise={false} />
            </RNAnimated.View>
            <RNAnimated.View style={{ alignItems: 'center', marginTop: 4, opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 4 ? (tooltipStep === 4 ? pulseOpacity : 1) : 0.05 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(11), fontWeight: '700', color: '#4DA6FF' }}>{formatNumberFR(remaining)} kcal</Text>
                <Pressable onPress={function() { setShowInfoRight(function(v) { return !v; }); setShowInfoLeft(false); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: showInfoRight ? 'rgba(77,166,255,0.15)' : 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: showInfoRight ? 'rgba(77,166,255,0.3)' : 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: wp(4) }}>
                  <Text style={{ color: showInfoRight ? '#4DA6FF' : '#8892A0', fontSize: fp(8), fontWeight: '700' }}>i</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: fp(9), fontWeight: '600', color: '#8892A0', marginTop: 2 }}>Reste</Text>
            </RNAnimated.View>
          </View>
        </View>

        <RNAnimated.View style={{ alignItems: 'center', marginTop: wp(12), opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 3 ? (tooltipStep === 3 ? pulseOpacity : 1) : 0.05 }}>
          <EcgPulse score={vitalityScore} />
          <Text style={{ fontSize: fp(8), fontWeight: '700', color: '#D4AF37', marginTop: 2, letterSpacing: 1.5 }}>VITALITÉ</Text>
        </RNAnimated.View>

        {showInfoLeft && (
          <View style={{ backgroundColor: 'rgba(255,140,66,0.06)', borderRadius: wp(12), padding: wp(12), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(255,140,66,0.15)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
              <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(14), fontWeight: '800', color: '#FF8C42' }}>{Math.round((consumedTotal / OBJECTIVE) * 100)}%</Text>
              <Text style={{ color: '#8892A0', fontSize: fp(10), marginLeft: wp(6) }}>du quota journalier</Text>
            </View>
            <Text style={{ color: '#EAEEF3', fontSize: fp(11), lineHeight: fp(16), marginBottom: wp(8) }}>Votre activité sportive brûle vos calories consommées.</Text>
            {burnedExtra > 0 && (
              <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: wp(8), padding: wp(8) }}>
                <Text style={{ color: '#FF3B30', fontSize: fp(10), fontWeight: '700' }}>- {burnedExtra} kcal brûlées (sport)</Text>
                <Text style={{ color: '#FF8C42', fontSize: fp(10), fontWeight: '700', marginTop: wp(2) }}>= {formatNumberFR(consumedTotal)} kcal net consommé</Text>
              </View>
            )}
          </View>
        )}

        {showInfoRight && (
          <View style={{ backgroundColor: 'rgba(77,166,255,0.06)', borderRadius: wp(12), padding: wp(12), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
              <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(14), fontWeight: '800', color: '#4DA6FF' }}>{Math.min(Math.round((remaining / OBJECTIVE) * 100), 100)}%</Text>
              <Text style={{ color: '#8892A0', fontSize: fp(10), marginLeft: wp(6) }}>de vos calories disponibles</Text>
            </View>
            <Text style={{ color: '#EAEEF3', fontSize: fp(11), lineHeight: fp(16), marginBottom: wp(8) }}>Si vous faites de l'activité, vos calories consommées diminuent et augmentent votre marge restante.</Text>
            {burnedExtra > 0 && (
              <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: wp(8), padding: wp(8) }}>
                <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '700' }}>+ {burnedExtra} kcal bonus sport</Text>
                <Text style={{ color: '#4DA6FF', fontSize: fp(10), fontWeight: '700', marginTop: wp(2) }}>= {formatNumberFR(remaining)} kcal disponibles</Text>
              </View>
            )}
          </View>
        )}
      </MetalCard>

      <Text style={{ color: '#FFF' }}>Rest of DashboardContent - Phase 5.2+</Text>
    </ScrollView>
  );
};

export default DashboardContent;
