import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable, RefreshControl,
  Animated as RNAnimated, Image, Platform, Easing, StyleSheet, Modal, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Ellipse, Circle as SvgCircle, Line as SvgLine, G, Rect } from 'react-native-svg';
import MetalCard from '../../components/shared/MetalCard';
import {
  wp, fp, DAILY_OBJECTIVE, H,
  suggestActivities, ACTIVITY_ICONS, ACTIVITY_LABELS,
  formatNumberFR, formatTimeFR,
  REACTOR_SIZE, DNA_WIDTH,
} from './dashboardConstants';
import { LixGemIcon, ForkKnifeIcon, StatsIcon } from './dashboardIcons';
import { EcgPulse, ReactorCore, DnaHelix, HydrationCardCompact } from './dashboardComponents';
var AlixenIcon = require('../../components/AlixenIcon');

var getFoodEmoji = function(name) {
  var n = (name || '').toLowerCase();
  if (n.indexOf('croissant') >= 0 || n.indexOf('pain') >= 0 || n.indexOf('baguette') >= 0) return '🥐';
  if (n.indexOf('riz') >= 0) return '🍚';
  if (n.indexOf('poulet') >= 0 || n.indexOf('chicken') >= 0) return '🍗';
  if (n.indexOf('poisson') >= 0 || n.indexOf('thon') >= 0 || n.indexOf('saumon') >= 0 || n.indexOf('tilapia') >= 0) return '🐟';
  if (n.indexOf('salade') >= 0 || n.indexOf('légume') >= 0 || n.indexOf('legume') >= 0) return '🥗';
  if (n.indexOf('soupe') >= 0 || n.indexOf('bouillon') >= 0) return '🍲';
  if (n.indexOf('pâte') >= 0 || n.indexOf('pasta') >= 0 || n.indexOf('spaghetti') >= 0) return '🍝';
  if (n.indexOf('viande') >= 0 || n.indexOf('boeuf') >= 0 || n.indexOf('bœuf') >= 0 || n.indexOf('steak') >= 0) return '🥩';
  if (n.indexOf('oeuf') >= 0 || n.indexOf('œuf') >= 0 || n.indexOf('omelette') >= 0) return '🥚';
  if (n.indexOf('fruit') >= 0 || n.indexOf('banane') >= 0 || n.indexOf('mangue') >= 0 || n.indexOf('pomme') >= 0) return '🍎';
  if (n.indexOf('ndolé') >= 0 || n.indexOf('ndole') >= 0 || n.indexOf('épinard') >= 0 || n.indexOf('epinard') >= 0) return '🥬';
  if (n.indexOf('pizza') >= 0) return '🍕';
  if (n.indexOf('burger') >= 0 || n.indexOf('hamburger') >= 0) return '🍔';
  if (n.indexOf('sandwich') >= 0) return '🥪';
  if (n.indexOf('gâteau') >= 0 || n.indexOf('gateau') >= 0 || n.indexOf('dessert') >= 0 || n.indexOf('pâtisserie') >= 0) return '🍰';
  if (n.indexOf('accra') >= 0 || n.indexOf('beignet') >= 0) return '🧆';
  if (n.indexOf('lait') >= 0 || n.indexOf('yaourt') >= 0) return '🥛';
  return '🍽️';
};

const DashboardContent = ({
  onHydrationPress, hydrationMl, hydrationGoal, gender,
  totalWaterLost,
  burnedExtra, sportAlert, consumedTotal, burnedTotal, dailyMacros,
  scrollRef, dailyTarget, lastMeal, tooltipStep,
  vitalityScore, vitalityDetails, activeChar, pagePowers,
  toggleStates, setToggleStates, consumePower,
  userName, onAvatarPress, onNavigate, showToast, onOpenStats,
  refreshing, onRefresh,
}) => {
  const OBJECTIVE = dailyTarget || DAILY_OBJECTIVE;
  const [showInfoLeft, setShowInfoLeft] = useState(false);
  const [showInfoRight, setShowInfoRight] = useState(false);
  var _showVitalityInfo = useState(false); var showVitalityInfo = _showVitalityInfo[0]; var setShowVitalityInfo = _showVitalityInfo[1];
  const remaining = Math.max(0, OBJECTIVE - (consumedTotal - burnedTotal));
  var netConsumed = Math.max(0, consumedTotal - burnedTotal);
  console.log('DEBUG netConsumed:', netConsumed, 'remaining:', remaining, 'consumedTotal:', consumedTotal, 'burnedTotal:', burnedTotal, 'OBJECTIVE:', OBJECTIVE);
  var _mealExpanded = useState(false);
  var mealExpanded = _mealExpanded[0]; var setMealExpanded = _mealExpanded[1];
  var _coachExpanded = useState(false);
  var coachExpanded = _coachExpanded[0]; var setCoachExpanded = _coachExpanded[1];
  const tooltipPulse = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (tooltipStep > 0) {
      const pulse = RNAnimated.loop(RNAnimated.sequence([
        RNAnimated.timing(tooltipPulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.timing(tooltipPulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));
      pulse.start();
      return () => pulse.stop();
    } else { tooltipPulse.setValue(0); }
  }, [tooltipStep]);

  const pulseOpacity = tooltipPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
  const pulseScale = tooltipPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] });

  return (
    <View style={{ flex: 1 }}>
    <ScrollView ref={scrollRef} style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: 20, paddingTop: wp(8) }}
      showsVerticalScrollIndicator={false}
      onScrollBeginDrag={function() { setShowInfoLeft(false); setShowInfoRight(false); }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || false}
          onRefresh={onRefresh}
          tintColor="#00D984"
          colors={['#00D984']}
          progressBackgroundColor="#1E2530"
        />
      }>

      <View style={{ marginBottom: wp(6), opacity: tooltipStep > 0 ? 0.05 : 1 }}>
        <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#EAEEF3' }}>
          {(function() {
            var h = new Date().getHours();
            var greeting = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
            if (!userName) return greeting + ' 👋';
            var firstName = userName.split(' ')[0];
            var prefix = gender === 'homme' ? 'Mr ' : gender === 'femme' ? 'Mme ' : '';
            return greeting + ' ' + prefix + firstName + ' 👋';
          })()}
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
            <View style={{ width: wp(5), height: wp(5), borderRadius: wp(2.5), backgroundColor: '#00D984', marginLeft: wp(4), alignSelf: 'flex-start', marginTop: wp(5) }} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', overflow: 'visible', paddingVertical: 4, paddingHorizontal: 6 }}>
          <View style={{ alignItems: 'center', width: REACTOR_SIZE + 20 }}>
            <RNAnimated.View style={{ opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 2 ? (tooltipStep === 2 ? pulseOpacity : 1) : 0.05, transform: tooltipStep === 2 ? [{ scale: pulseScale }] : [] }}>
              <ReactorCore size={REACTOR_SIZE} value={netConsumed} percentage={Math.round((netConsumed / OBJECTIVE) * 100)} label="Consommé" color="#FF8C42" colorLight="#FFB87A" colorDark="#CC6020" clockwise={true} />
            </RNAnimated.View>
            <RNAnimated.View style={{ alignItems: 'center', marginTop: 4, opacity: tooltipStep === 0 || tooltipStep === 1 || tooltipStep === 2 ? (tooltipStep === 2 ? pulseOpacity : 1) : 0.05 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(11), fontWeight: '700', color: '#FF8C42' }}>{formatNumberFR(netConsumed)} kcal</Text>
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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
            <Text style={{ fontSize: fp(8), fontWeight: '700', color: '#D4AF37', letterSpacing: 1.5 }}>VITALITÉ</Text>
            <Pressable onPress={function() { setShowVitalityInfo(true); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ width: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', justifyContent: 'center', alignItems: 'center', marginLeft: wp(5) }}>
              <Text style={{ color: '#D4AF37', fontSize: fp(8), fontWeight: '700' }}>i</Text>
            </Pressable>
          </View>
        </RNAnimated.View>

        {showInfoLeft && (
          <View style={{ backgroundColor: 'rgba(255,140,66,0.06)', borderRadius: wp(12), padding: wp(12), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(255,140,66,0.15)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
              <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(14), fontWeight: '800', color: '#FF8C42' }}>{Math.round((netConsumed / OBJECTIVE) * 100)}%</Text>
              <Text style={{ color: '#8892A0', fontSize: fp(10), marginLeft: wp(6) }}>du quota journalier</Text>
            </View>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: wp(8), padding: wp(8) }}>
                <Text style={{ color: '#EAEEF3', fontSize: fp(10), fontWeight: '700' }}>{formatNumberFR(consumedTotal)} kcal repas</Text>
                <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '700', marginTop: wp(2) }}>- {burnedExtra || 0} kcal sport</Text>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: wp(4) }} />
                <Text style={{ color: '#FF8C42', fontSize: fp(11), fontWeight: '800' }}>= {formatNumberFR(netConsumed)} kcal net consomme</Text>
              </View>
          </View>
        )}

        {showInfoRight && (
          <View style={{ backgroundColor: 'rgba(77,166,255,0.06)', borderRadius: wp(12), padding: wp(12), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
              <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(14), fontWeight: '800', color: '#4DA6FF' }}>{Math.min(Math.round((remaining / OBJECTIVE) * 100), 100)}%</Text>
              <Text style={{ color: '#8892A0', fontSize: fp(10), marginLeft: wp(6) }}>de vos calories disponibles</Text>
            </View>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: wp(8), padding: wp(8) }}>
                <Text style={{ color: '#EAEEF3', fontSize: fp(10), fontWeight: '700' }}>{formatNumberFR(OBJECTIVE)} kcal objectif</Text>
                <Text style={{ color: '#FF8C42', fontSize: fp(10), fontWeight: '700', marginTop: wp(2) }}>- {formatNumberFR(consumedTotal)} kcal repas</Text>
                {burnedExtra > 0 ? React.createElement(Text, { style: { color: '#00D984', fontSize: fp(10), fontWeight: '700', marginTop: wp(2) } }, '+ ' + (burnedExtra || 0) + ' kcal sport') : null}
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: wp(4) }} />
                <Text style={{ color: '#4DA6FF', fontSize: fp(11), fontWeight: '800' }}>= {formatNumberFR(remaining)} kcal disponibles</Text>
              </View>
          </View>
        )}
      </MetalCard>

      {pagePowers && pagePowers.length > 0 && activeChar && tooltipStep === 0 && (
        <View style={{ marginBottom: wp(4) }}>
          {pagePowers.map(function(power) {
            var isUnlocked = power.unlocked;
            switch (power.action_type) {
              case 'streak_tracker': {
                if (!isUnlocked) return null;
                return (
                  <MetalCard key={power.power_key} style={{ marginHorizontal: 0, marginBottom: wp(8) }}>
                    <Pressable delayPressIn={120} onPress={async function() { var r = await consumePower(power.power_key); if (!r.success) return; showToast('📊 Tracker de streaks — bientôt disponible', '#00D984'); }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                        <Text style={{ fontSize: fp(16), marginRight: wp(6) }}>{power.icon || '📊'}</Text>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700', letterSpacing: wp(1) }}>{power.name_fr || power.power_key}</Text>
                        <View style={{ marginLeft: 'auto', backgroundColor: 'rgba(0,217,132,0.08)', paddingHorizontal: wp(8), paddingVertical: wp(3), borderRadius: wp(8) }}>
                          <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>{activeChar.name}</Text>
                        </View>
                      </View>
                      <Text style={{ color: '#8892A0', fontSize: fp(10), marginBottom: wp(8) }}>{power.description_fr || ''}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        {[{ label: 'Scan', icon: '📸', days: 0 }, { label: 'Activité', icon: '🏃', days: 0 }, { label: 'Humeur', icon: '😊', days: 0 }, { label: 'Hydra', icon: '💧', days: 0 }].map(function(cat, i) {
                          return (
                            <View key={i} style={{ alignItems: 'center' }}>
                              <Text style={{ fontSize: fp(16) }}>{cat.icon}</Text>
                              <Text style={{ color: cat.days > 0 ? '#00D984' : '#555E6C', fontSize: fp(12), fontWeight: '800', marginTop: wp(2) }}>{cat.days}j</Text>
                              <Text style={{ color: '#6B7280', fontSize: fp(8) }}>{cat.label}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </Pressable>
                  </MetalCard>
                );
              }
              case 'toggle': {
                if (!isUnlocked) return null;
                var isOn = toggleStates[power.power_key] || false;
                return (
                  <View key={power.power_key} style={{ marginHorizontal: 0, marginBottom: wp(8), flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.04)', borderRadius: wp(12), padding: wp(10), borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)' }}>
                    <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>{power.icon || '💰'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#EAEEF3', fontSize: fp(11), fontWeight: '700' }}>{power.name_fr || power.power_key}</Text>
                      <Text style={{ color: '#8892A0', fontSize: fp(8), marginTop: wp(1) }}>{power.description_fr || ''}</Text>
                    </View>
                    <Pressable onPress={function() { setToggleStates(function(prev) { return Object.assign({}, prev, { [power.power_key]: !prev[power.power_key] }); }); }}
                      style={{ width: wp(40), height: wp(22), borderRadius: wp(11), backgroundColor: isOn ? '#00D984' : 'rgba(255,255,255,0.1)', padding: wp(2), justifyContent: 'center' }}>
                      <View style={{ width: wp(18), height: wp(18), borderRadius: wp(9), backgroundColor: '#FFFFFF', alignSelf: isOn ? 'flex-end' : 'flex-start' }} />
                    </Pressable>
                  </View>
                );
              }
              case 'hydration_reminder': {
                if (!isUnlocked) return null;
                var glassesLeft = Math.max(0, Math.ceil((hydrationGoal - hydrationMl) / 250));
                if (glassesLeft === 0) return null;
                return (
                  <View key={power.power_key} style={{ marginHorizontal: 0, marginBottom: wp(8), flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(77,166,255,0.06)', borderRadius: wp(12), padding: wp(10), borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)' }}>
                    <Text style={{ fontSize: fp(18), marginRight: wp(8) }}>{power.icon || '💧'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#4DA6FF', fontSize: fp(11), fontWeight: '700' }}>{power.name_fr || power.power_key}</Text>
                      <Text style={{ color: '#8892A0', fontSize: fp(9), marginTop: wp(2) }}>Bois 250ml maintenant — encore {glassesLeft} verre{glassesLeft > 1 ? 's' : ''} pour ton objectif</Text>
                    </View>
                    <Pressable onPress={onHydrationPress} style={{ backgroundColor: 'rgba(77,166,255,0.12)', paddingHorizontal: wp(10), paddingVertical: wp(6), borderRadius: wp(8), borderWidth: 1, borderColor: 'rgba(77,166,255,0.25)' }}>
                      <Text style={{ color: '#4DA6FF', fontSize: fp(9), fontWeight: '700' }}>+250ml</Text>
                    </Pressable>
                  </View>
                );
              }
              case 'modal_inline': {
                if (!isUnlocked) return null;
                return (
                  <MetalCard key={power.power_key} style={{ marginHorizontal: 0, marginBottom: wp(8) }}>
                    <Pressable delayPressIn={120} onPress={async function() { var r = await consumePower(power.power_key); if (!r.success) return; showToast((power.icon || '🌊') + ' Tracker hydratation avancé — bientôt', '#4DA6FF'); }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(16), marginRight: wp(6) }}>{power.icon || '🌊'}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{power.name_fr || power.power_key}</Text>
                          <Text style={{ color: '#8892A0', fontSize: fp(9), marginTop: wp(2) }}>{power.description_fr || ''}</Text>
                        </View>
                        {power.is_superpower && (
                          <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4) }}>
                            <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '800' }}>SUPERPOWER</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </MetalCard>
                );
              }
              case 'redirect': {
                if (!isUnlocked) return null;
                return (
                  <MetalCard key={power.power_key} style={{ marginHorizontal: 0, marginBottom: wp(8) }}>
                    <Pressable delayPressIn={120} onPress={async function() { var r = await consumePower(power.power_key); if (!r.success) return; showToast((power.icon || '🔮') + ' ' + (power.name_fr || 'Pouvoir') + ' — bientôt', '#D4AF37'); }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(16), marginRight: wp(6) }}>{power.icon || '🔮'}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: '#D4AF37', fontSize: fp(12), fontWeight: '700' }}>{power.name_fr || power.power_key}</Text>
                          <Text style={{ color: '#8892A0', fontSize: fp(9), marginTop: wp(2) }}>{power.description_fr || ''}</Text>
                        </View>
                        {power.is_superpower && (
                          <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4) }}>
                            <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '800' }}>SUPERPOWER</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  </MetalCard>
                );
              }
              default: return null;
            }
          })}
        </View>
      )}

      <HydrationCardCompact currentMl={hydrationMl} goalMl={hydrationGoal} gender={gender} onPress={onHydrationPress} sportAlert={sportAlert} tooltipStep={tooltipStep} totalWaterLost={totalWaterLost || 0} />

      <MetalCard style={{ marginHorizontal: 0, marginBottom: wp(12), ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }) }} onPress={function() { if (!lastMeal) { onNavigate('meals'); } else { setMealExpanded(function(v) { return !v; }); } }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
          <ForkKnifeIcon />
          <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '700', letterSpacing: wp(1), marginLeft: wp(8) }}>DERNIER REPAS</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {lastMeal && (lastMeal.photo_url || lastMeal.image_url) ? (
            <Image source={{ uri: lastMeal.photo_url || lastMeal.image_url }} style={{ width: wp(52), height: wp(52), borderRadius: wp(12), marginRight: wp(12) }} resizeMode="cover" />
          ) : (
            <View style={{ width: wp(52), height: wp(52), borderRadius: wp(12), backgroundColor: '#2A303B', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
              <Text style={{ fontSize: fp(28) }}>{getFoodEmoji(lastMeal ? lastMeal.food_name : '')}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '600', flex: 1 }}>
                {lastMeal ? lastMeal.food_name : 'Aucun repas enregistré'}
              </Text>
              {lastMeal ? React.createElement(View, { style: { backgroundColor: lastMeal.source === 'manual' ? 'rgba(138,143,152,0.15)' : 'rgba(0,217,132,0.12)', borderRadius: wp(4), paddingHorizontal: wp(5), paddingVertical: wp(1), marginLeft: wp(6) } },
                React.createElement(Text, { style: { fontSize: fp(10), fontWeight: '700', color: lastMeal.source === 'manual' ? '#8A8F98' : '#00D984' } }, lastMeal.source === 'manual' ? 'Manuel' : 'IA')
              ) : null}
            </View>
            <Text style={{ color: '#8892A0', fontSize: fp(11), marginTop: 2 }}>
              {lastMeal ? Math.round(lastMeal.calories) + ' kcal \u2022 ' : 'Scannez ou ajoutez votre plat \u2192'}
              <Text style={{ color: '#EAEEF3' }}>{lastMeal ? formatTimeFR(lastMeal.meal_time) : ''}</Text>
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 4, gap: wp(10) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: wp(7), height: wp(7), borderRadius: wp(3.5), backgroundColor: '#FF6B8A', marginRight: wp(4) }} />
                <Text style={{ color: '#8892A0', fontSize: fp(10) }}>{lastMeal ? Math.round(lastMeal.protein_g || 0) : 0}g P</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: wp(7), height: wp(7), borderRadius: wp(3.5), backgroundColor: '#FFB800', marginRight: wp(4) }} />
                <Text style={{ color: '#8892A0', fontSize: fp(10) }}>{lastMeal ? Math.round(lastMeal.carbs_g || 0) : 0}g G</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: wp(7), height: wp(7), borderRadius: wp(3.5), backgroundColor: '#4DA6FF', marginRight: wp(4) }} />
                <Text style={{ color: '#8892A0', fontSize: fp(10) }}>{lastMeal ? Math.round(lastMeal.fat_g || 0) : 0}g L</Text>
              </View>
            </View>
            {lastMeal ? (
              <Text style={{ color: mealExpanded ? '#8A8F98' : '#00D984', fontSize: 12, fontWeight: '600', alignSelf: 'flex-end', marginTop: 6 }}>
                {mealExpanded ? 'Voir moins \u25B4' : 'Voir plus \u25BE'}
              </Text>
            ) : null}
          </View>
        </View>
        {mealExpanded && lastMeal && (
          <View style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: wp(12), padding: wp(12), marginTop: wp(10), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#8892A0', letterSpacing: 1, marginBottom: wp(8) }}>DÉTAIL NUTRITIONNEL</Text>
            {[
              { label: 'Protéines', value: Math.round(lastMeal.protein_g || 0), color: '#FF6B8A', pct: Math.round(((lastMeal.protein_g || 0) * 4 / Math.max(lastMeal.calories, 1)) * 100) },
              { label: 'Glucides', value: Math.round(lastMeal.carbs_g || 0), color: '#FFB800', pct: Math.round(((lastMeal.carbs_g || 0) * 4 / Math.max(lastMeal.calories, 1)) * 100) },
              { label: 'Lipides', value: Math.round(lastMeal.fat_g || 0), color: '#4DA6FF', pct: Math.round(((lastMeal.fat_g || 0) * 9 / Math.max(lastMeal.calories, 1)) * 100) },
            ].map(function(m, i) {
              return (
                <View key={i} style={{ marginBottom: wp(6) }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(2) }}>
                    <Text style={{ fontSize: fp(10), color: '#EAEEF3', fontWeight: '600' }}>{m.label}</Text>
                    <Text style={{ fontSize: fp(10), color: m.color, fontWeight: '700' }}>{m.value}g · {m.pct}%</Text>
                  </View>
                  <View style={{ height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <View style={{ width: Math.min(m.pct, 100) + '%', height: '100%', borderRadius: wp(2), backgroundColor: m.color }} />
                  </View>
                </View>
              );
            })}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: wp(6), paddingTop: wp(6), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' }}>
              <Text style={{ fontSize: fp(9), color: '#555E6C' }}>Source : {lastMeal.source === 'scan' ? 'Scan IA' : 'Manuel'}</Text>
              <Pressable onPress={function() { onNavigate('meals'); }} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: fp(10), color: '#00D984', fontWeight: '600' }}>Voir dans Repas</Text>
                <Text style={{ fontSize: fp(10), color: '#00D984', marginLeft: wp(3) }}>→</Text>
              </Pressable>
            </View>
          </View>
        )}
      </MetalCard>

      <MetalCard style={{ marginHorizontal: 0, marginBottom: wp(12), ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,217,132,0.12)', borderWidth: 1, borderColor: 'rgba(0, 217, 132, 0.25)', justifyContent: 'center', alignItems: 'center' }}>
            <AlixenIcon size={28} />
          </View>
          <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700', letterSpacing: wp(1), marginLeft: wp(8) }}>COACH ALIXEN</Text>
          <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.12)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(2), marginLeft: wp(8) }}>
            <Text style={{ fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo', fontSize: fp(7), fontWeight: '800', color: '#D4AF37', letterSpacing: 1 }}>IA</Text>
          </View>
        </View>
        <Text style={{ color: '#EAEEF3', fontSize: fp(12), lineHeight: fp(17), fontWeight: '500' }}>
          {!lastMeal
            ? 'Bienvenue ! Scannez votre premier repas pour activer le suivi.'
            : consumedTotal < OBJECTIVE
              ? 'Déficit de ' + (OBJECTIVE - consumedTotal + burnedTotal) + ' kcal — bonne stratégie pour la perte de poids !'
              : 'Surplus de ' + (consumedTotal - OBJECTIVE) + ' kcal — pensez à une activité physique !'}
        </Text>
        {(function() {
          var OBJECTIVE_S = dailyTarget || 2100;
          var proteinTarget = Math.round(OBJECTIVE_S * 0.25 / 4);
          var carbsTarget = Math.round(OBJECTIVE_S * 0.45 / 4);
          var fatTarget = Math.round(OBJECTIVE_S * 0.30 / 9);
          var dm = dailyMacros || { protein: 0, carbs: 0, fat: 0 };
          var proteinDef = proteinTarget - (dm.protein || 0);
          var carbsDef = carbsTarget - (dm.carbs || 0);
          var fatDef = fatTarget - (dm.fat || 0);

          var s1 = null;
          if (!lastMeal) {
            s1 = React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 } },
              React.createElement(Text, { style: { color: '#00D984', fontSize: fp(10), marginRight: wp(6) } }, '+'),
              React.createElement(Text, { style: { color: '#EAEEF3', fontSize: fp(11) } }, 'Scannez ou ajoutez un repas pour activer les suggestions')
            );
          } else if (proteinDef > 0 || carbsDef > 0 || fatDef > 0) {
            var macroLabel = 'proteines'; var macroDef = proteinDef; var macroColor = '#FF6B8A';
            if (carbsDef > proteinDef && carbsDef > fatDef) { macroLabel = 'glucides'; macroDef = carbsDef; macroColor = '#FFD93D'; }
            else if (fatDef > proteinDef && fatDef > carbsDef) { macroLabel = 'lipides'; macroDef = fatDef; macroColor = '#4DA6FF'; }
            s1 = React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 } },
              React.createElement(Text, { style: { color: '#00D984', fontSize: fp(10), marginRight: wp(6) } }, '+'),
              React.createElement(Text, { style: { color: macroColor, fontSize: fp(11), fontWeight: '600' } }, 'Privilegiez les ' + macroLabel + ' : ~' + Math.round(macroDef) + 'g restants')
            );
          }

          var s2 = null;
          var sportHydroBonus = Math.round((burnedExtra || 0) * 1.2);
          var adjustedGoal = hydrationGoal + sportHydroBonus;
          var glassesNeeded = Math.max(0, Math.ceil((adjustedGoal - hydrationMl) / 250));
          if (hydrationMl < adjustedGoal) {
            s2 = React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 } },
              React.createElement(Text, { style: { color: '#00D984', fontSize: fp(10), marginRight: wp(6) } }, '+'),
              React.createElement(Text, { style: { color: '#EAEEF3', fontSize: fp(11) } },
                glassesNeeded + ' verre' + (glassesNeeded > 1 ? 's' : '') + ' d\'eau pour atteindre votre objectif' + (sportHydroBonus > 0 ? ' (+' + sportHydroBonus + 'ml sport)' : '')
              )
            );
          }

          var actMin = vitalityDetails && vitalityDetails.activityMin ? vitalityDetails.activityMin : 0;
          var s3done = actMin >= 30;
          var s3 = null;
          if (s3done) {
            s3 = React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center' } },
              React.createElement(Text, { style: { color: '#00D984', fontSize: fp(10), marginRight: wp(6) } }, '\u2713'),
              React.createElement(Text, { style: { color: '#00D984', fontSize: fp(11), fontWeight: '600' } }, 'Objectif activité atteint ! ' + (burnedExtra || 0) + ' kcal brûlées')
            );
          } else {
            var remainingMin = Math.max(0, 30 - actMin);
            var estKcal = remainingMin * 4;
            s3 = React.createElement(View, { style: { flexDirection: 'row', alignItems: 'center' } },
              React.createElement(Text, { style: { color: '#00D984', fontSize: fp(10), marginRight: wp(6) } }, '+'),
              React.createElement(Text, { style: { color: '#EAEEF3', fontSize: fp(11) } }, remainingMin + ' min de marche pour bruler ~' + estKcal + ' kcal')
            );
          }

          var allDone = !s1 && !s2 && s3done;

          if (allDone) {
            return React.createElement(View, { style: { backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(12), padding: wp(16), marginTop: wp(8), alignItems: 'center' } },
              React.createElement(Text, { style: { fontSize: fp(28) } }, '\uD83C\uDFC6'),
              React.createElement(Text, { style: { color: '#00D984', fontSize: fp(14), fontWeight: '600', textAlign: 'center', marginTop: wp(6) } }, 'Journee exemplaire ! Tous vos objectifs sont atteints.'),
              React.createElement(Text, { style: { color: '#8A8F98', fontSize: fp(12), textAlign: 'center', marginTop: wp(4) } }, 'Continuez comme ca, ALIXEN est fier de vous.')
            );
          }

          return React.createElement(View, { style: { backgroundColor: 'rgba(0,217,132,0.03)', borderRadius: wp(10), padding: wp(10), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(0,217,132,0.06)' } },
            React.createElement(Text, { style: { color: '#8892A0', fontSize: fp(8), fontWeight: '700', letterSpacing: wp(1), marginBottom: wp(4) } }, 'SUGGESTIONS'),
            s1, s2, s3
          );
        })()}
        <TouchableOpacity onPress={function() { onNavigate('meals'); }} activeOpacity={0.7}
          style={{ backgroundColor: 'rgba(0, 217, 132, 0.08)', borderRadius: wp(10), borderWidth: 1, borderColor: 'rgba(0, 217, 132, 0.15)', paddingVertical: wp(8), paddingHorizontal: wp(12), marginTop: wp(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>📸</Text>
          <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '700' }}>Scanner mon premier plat</Text>
          <Text style={{ color: '#00D984', fontSize: fp(11), marginLeft: wp(4) }}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={function() { setCoachExpanded(function(v) { return !v; }); }} activeOpacity={0.7}
          style={{ alignItems: 'center', marginTop: wp(10), paddingVertical: wp(4) }}>
          <Text style={{ color: '#00D984', fontSize: 14, fontWeight: '600' }}>
            {'Analyse du jour ' + (coachExpanded ? '▲' : '▼')}
          </Text>
        </TouchableOpacity>
        {coachExpanded && (
          <View style={{ backgroundColor: 'rgba(0,217,132,0.04)', borderRadius: wp(12), padding: wp(12), marginTop: wp(10), borderWidth: 1, borderColor: 'rgba(0,217,132,0.1)' }}>
            <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#EAEEF3', marginBottom: wp(10) }}>🧠 Analyse du jour</Text>
            {(function() {
              var OBJECTIVE_CALC = dailyTarget || 2100;
              var hydroGoalCalc = hydrationGoal || (gender === 'femme' ? 2000 : 2500);
              var nutritionPct = OBJECTIVE_CALC > 0 && consumedTotal > 0 ? Math.max(0, Math.min(100, 100 - Math.round(Math.abs(1 - consumedTotal / OBJECTIVE_CALC) * 330))) : 0;
              var hydroPct = Math.min(Math.round((hydrationMl / hydroGoalCalc) * 100), 100);
              var totalDurationMin = vitalityDetails && vitalityDetails.activityMin ? vitalityDetails.activityMin : 0;
              var activityPct = Math.min(100, Math.round((totalDurationMin / 30) * 100));
              var regularityPct = Math.round(((lastMeal ? 50 : 0) + (hydrationMl > 0 ? 30 : 0) + 20) / 100 * 100);
              return [
                { label: 'Nutrition', pct: nutritionPct, color: '#FF8C42' },
                { label: 'Hydratation', pct: hydroPct, color: '#4DA6FF' },
                { label: 'Activité', pct: activityPct, color: '#00D984' },
                { label: 'Régularité', pct: regularityPct, color: '#D4AF37' },
              ].map(function(c, i) {
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                    <Text style={{ fontSize: fp(10), color: '#8892A0', width: wp(70), fontWeight: '600' }}>{c.label}</Text>
                    <View style={{ flex: 1, height: wp(5), borderRadius: wp(2.5), backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginRight: wp(8) }}>
                      <View style={{ width: Math.min(c.pct, 100) + '%', height: '100%', borderRadius: wp(2.5), backgroundColor: c.color }} />
                    </View>
                    <Text style={{ fontSize: fp(9), color: c.color, fontWeight: '700', width: wp(28), textAlign: 'right' }}>{c.pct}%</Text>
                  </View>
                );
              });
            })()}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: wp(8), paddingTop: wp(8), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)', gap: wp(8) }}>
              <Text style={{ fontSize: fp(10), color: '#8892A0' }}>Score Vitalité actuel :</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '900', color: vitalityScore >= 70 ? '#00D984' : vitalityScore >= 40 ? '#FFD93D' : '#FF6B6B' }}>{vitalityScore}/100</Text>
            </View>
            <Pressable onPress={function() { onNavigate('medicai'); }} style={{ marginTop: wp(10), paddingVertical: wp(10), borderRadius: wp(10), backgroundColor: 'rgba(0,217,132,0.08)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(6) }}>
              <Text style={{ fontSize: fp(14) }}>💬</Text>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#00D984' }}>Discuter avec ALIXEN</Text>
              <Text style={{ fontSize: fp(12), color: '#00D984' }}>→</Text>
            </Pressable>
          </View>
        )}
      </MetalCard>

      {consumedTotal - burnedExtra > OBJECTIVE && (
        <MetalCard style={{ marginHorizontal: 0, marginBottom: 12, ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }) }}>
          <Text style={localStyles.sectionTitle}>🏃 SUGGESTION ACTIVITÉ</Text>
          <Text style={localStyles.surplusText}>Surplus : +{consumedTotal - burnedExtra - OBJECTIVE} kcal</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {suggestActivities(consumedTotal - burnedExtra - OBJECTIVE).slice(0, 2).map(function(sug, i) {
              return (
                <View key={i} style={localStyles.activityRow}>
                  <Text style={{ fontSize: 16 }}>{ACTIVITY_ICONS[sug.activity] || '🏃'}</Text>
                  <Text style={localStyles.activityText}>{sug.minutesNeeded} min {ACTIVITY_LABELS[sug.activity]}</Text>
                  <Text style={localStyles.activityKcal}>-{sug.kcalBurned} kcal</Text>
                </View>
              );
            })}
          </View>
        </MetalCard>
      )}

      <MetalCard style={{ marginHorizontal: 0, marginBottom: wp(12), ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }) }} onPress={function() { if (onOpenStats) onOpenStats(); }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: wp(16) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <StatsIcon />
            <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '700', letterSpacing: wp(1), marginLeft: wp(8) }}>MES STATS</Text>
          </View>
          <Text style={{ color: '#6B7280', fontSize: fp(18), fontWeight: '300' }}>›</Text>
        </View>
        <Text style={{ color: '#8892A0', fontSize: fp(11), marginTop: wp(6), paddingRight: wp(16) }}>Voir mes statistiques</Text>
      </MetalCard>
    </ScrollView>

    <Modal visible={showVitalityInfo} transparent animationType="fade" onRequestClose={function() { setShowVitalityInfo(false); }}>
      <Pressable onPress={function() { setShowVitalityInfo(false); }} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <Pressable onPress={function() {}} style={{ width: '100%', maxWidth: 380, backgroundColor: '#1A1D22', borderRadius: wp(16), borderWidth: 1, borderColor: '#4A4F55', padding: wp(16), maxHeight: H * 0.82 }}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <Text style={{ color: '#D4AF37', fontSize: fp(15), fontWeight: '800', textAlign: 'center', letterSpacing: 1 }}>Votre score de Vitalité</Text>
            <Text style={{ color: '#8892A0', fontSize: fp(11), textAlign: 'center', marginTop: wp(6), marginBottom: wp(14), lineHeight: fp(16) }}>Votre Vitalité reflète votre équilibre santé du jour sur 100 points, répartis en 4 piliers :</Text>

            {(function() {
              var vd = vitalityDetails || {};
              var consumed = vd.consumed || 0;
              var target = vd.target || 2100;
              var hydroMl = vd.hydroMl || 0;
              var hydroGoal = vd.hydroGoal || 2500;
              var actMin = vd.activityMin || 0;
              var mf = vd.moodFilled || false;
              var lm = vd.lastMeal;

              var nutRatioVal = target > 0 && consumed > 0 ? consumed / target : 0;
              var nutScore = 0;
              if (consumed > 0 && target > 0) {
                if (nutRatioVal <= 1.0) {
                  nutScore = Math.round(nutRatioVal * 25);
                } else if (nutRatioVal <= 1.2) {
                  nutScore = Math.round(25 - (nutRatioVal - 1.0) * 50);
                } else {
                  nutScore = Math.max(0, Math.round(25 - (nutRatioVal - 1.0) * 25));
                }
              }
              var nutRatio = target > 0 ? consumed / target : 0;
              var nutPos = Math.max(0, Math.min(1, nutRatio / 2));

              var hydroScore = Math.round((Math.min((hydroMl / hydroGoal) * 100, 100) / 100) * 25);
              var hydroRatio = hydroGoal > 0 ? hydroMl / hydroGoal : 0;
              var hydroPos = Math.max(0, Math.min(1, hydroRatio / 2));

              var actScore = Math.round(Math.min(actMin / 30, 1) * 25);
              var actNorm = Math.min(actMin / 30, 1);

              var regPts = 0;
              if (mf) regPts += 8;
              if (lm) regPts += 9;
              regPts += 8;
              var regNorm = regPts / 25;

              var BAR_W = 240;
              var BAR_H = 14;

              return React.createElement(View, null,
                React.createElement(View, { style: { marginBottom: wp(16) } },
                  React.createElement(Text, { style: { color: '#FFF', fontSize: fp(13), fontWeight: '700', marginBottom: wp(6) } }, '\uD83C\uDF7D Nutrition (' + nutScore + '/25)'),
                  React.createElement(View, { style: { alignItems: 'center' } },
                    React.createElement(Svg, { width: BAR_W, height: BAR_H + 20, viewBox: '0 0 ' + BAR_W + ' ' + (BAR_H + 20) },
                      React.createElement(Defs, null,
                        React.createElement(SvgLinearGradient, { id: 'nutGrad', x1: '0', y1: '0', x2: '1', y2: '0' },
                          React.createElement(Stop, { offset: '0%', stopColor: '#FF6B6B' }),
                          React.createElement(Stop, { offset: '25%', stopColor: '#FF8C42' }),
                          React.createElement(Stop, { offset: '50%', stopColor: '#00D984' }),
                          React.createElement(Stop, { offset: '75%', stopColor: '#FF8C42' }),
                          React.createElement(Stop, { offset: '100%', stopColor: '#FF6B6B' })
                        )
                      ),
                      React.createElement(Rect, { x: 0, y: 6, width: BAR_W, height: BAR_H, rx: BAR_H / 2, fill: 'url(#nutGrad)', opacity: 0.85 }),
                      React.createElement(SvgLine, { x1: BAR_W / 2, y1: 4, x2: BAR_W / 2, y2: BAR_H + 8, stroke: '#FFF', strokeWidth: 1, opacity: 0.4 }),
                      React.createElement(Path, { d: 'M ' + (nutPos * BAR_W - 5) + ' 2 L ' + (nutPos * BAR_W + 5) + ' 2 L ' + (nutPos * BAR_W) + ' 8 Z', fill: '#FFF' }),
                      React.createElement(SvgLine, { x1: nutPos * BAR_W, y1: 8, x2: nutPos * BAR_W, y2: BAR_H + 8, stroke: '#FFF', strokeWidth: 2.5 })
                    ),
                    React.createElement(Text, { style: { color: '#8892A0', fontSize: fp(8), marginTop: 2 } }, formatNumberFR(target) + ' kcal objectif')
                  ),
                  React.createElement(Text, { style: { color: '#6B7280', fontSize: fp(10), marginTop: wp(4), lineHeight: fp(15) } }, 'Plus vous approchez de votre objectif calorique, plus vous gagnez de points. Trop ou pas assez fait baisser le score.')
                ),

                React.createElement(View, { style: { marginBottom: wp(16) } },
                  React.createElement(Text, { style: { color: '#FFF', fontSize: fp(13), fontWeight: '700', marginBottom: wp(6) } }, '\uD83D\uDCA7 Hydratation (' + hydroScore + '/25)'),
                  React.createElement(View, { style: { alignItems: 'center' } },
                    React.createElement(Svg, { width: BAR_W, height: BAR_H + 20, viewBox: '0 0 ' + BAR_W + ' ' + (BAR_H + 20) },
                      React.createElement(Defs, null,
                        React.createElement(SvgLinearGradient, { id: 'hydroGrad', x1: '0', y1: '0', x2: '1', y2: '0' },
                          React.createElement(Stop, { offset: '0%', stopColor: '#FF6B6B' }),
                          React.createElement(Stop, { offset: '25%', stopColor: '#FF8C42' }),
                          React.createElement(Stop, { offset: '50%', stopColor: '#00D984' }),
                          React.createElement(Stop, { offset: '75%', stopColor: '#FF8C42' }),
                          React.createElement(Stop, { offset: '100%', stopColor: '#FF6B6B' })
                        )
                      ),
                      React.createElement(Rect, { x: 0, y: 6, width: BAR_W, height: BAR_H, rx: BAR_H / 2, fill: 'url(#hydroGrad)', opacity: 0.85 }),
                      React.createElement(SvgLine, { x1: BAR_W / 2, y1: 4, x2: BAR_W / 2, y2: BAR_H + 8, stroke: '#FFF', strokeWidth: 1, opacity: 0.4 }),
                      React.createElement(Path, { d: 'M ' + (hydroPos * BAR_W - 5) + ' 2 L ' + (hydroPos * BAR_W + 5) + ' 2 L ' + (hydroPos * BAR_W) + ' 8 Z', fill: '#FFF' }),
                      React.createElement(SvgLine, { x1: hydroPos * BAR_W, y1: 8, x2: hydroPos * BAR_W, y2: BAR_H + 8, stroke: '#FFF', strokeWidth: 2.5 })
                    ),
                    React.createElement(Text, { style: { color: '#8892A0', fontSize: fp(8), marginTop: 2 } }, (hydroGoal / 1000).toFixed(1) + 'L objectif')
                  ),
                  React.createElement(Text, { style: { color: '#6B7280', fontSize: fp(10), marginTop: wp(4), lineHeight: fp(15) } }, 'Buvez régulièrement. Objectif : 2.5L (homme) / 2L (femme).')
                ),

                (function() {
                  var GW = 120; var GH = 70; var cx = GW / 2; var cy = GH - 6; var rOuter = 50; var rInner = 38;
                  function gaugeArc(norm) {
                    var angle = Math.PI + norm * Math.PI;
                    var ex = cx + Math.cos(angle) * rOuter;
                    var ey = cy + Math.sin(angle) * rOuter;
                    return { x: ex, y: ey };
                  }
                  function needlePt(norm) {
                    var angle = Math.PI + norm * Math.PI;
                    return { x: cx + Math.cos(angle) * (rInner - 4), y: cy + Math.sin(angle) * (rInner - 4) };
                  }
                  function makeGauge(label, score, norm, desc, key) {
                    var np = needlePt(norm);
                    return React.createElement(View, { key: key, style: { marginBottom: wp(16) } },
                      React.createElement(Text, { style: { color: '#FFF', fontSize: fp(13), fontWeight: '700', marginBottom: wp(6) } }, label),
                      React.createElement(View, { style: { alignItems: 'center' } },
                        React.createElement(Svg, { width: GW, height: GH, viewBox: '0 0 ' + GW + ' ' + GH },
                          React.createElement(Defs, null,
                            React.createElement(SvgLinearGradient, { id: 'gauge' + key, x1: '0', y1: '0', x2: '1', y2: '0' },
                              React.createElement(Stop, { offset: '0%', stopColor: '#FF6B6B' }),
                              React.createElement(Stop, { offset: '33%', stopColor: '#FF8C42' }),
                              React.createElement(Stop, { offset: '66%', stopColor: '#FFD93D' }),
                              React.createElement(Stop, { offset: '100%', stopColor: '#00D984' })
                            )
                          ),
                          React.createElement(Path, {
                            d: 'M ' + (cx - rOuter) + ' ' + cy + ' A ' + rOuter + ' ' + rOuter + ' 0 0 1 ' + (cx + rOuter) + ' ' + cy,
                            stroke: 'url(#gauge' + key + ')', strokeWidth: 10, fill: 'none', strokeLinecap: 'round'
                          }),
                          React.createElement(SvgLine, { x1: cx, y1: cy, x2: np.x, y2: np.y, stroke: '#FFF', strokeWidth: 2.5, strokeLinecap: 'round' }),
                          React.createElement(SvgCircle, { cx: cx, cy: cy, r: 4, fill: '#4A4F55' }),
                          React.createElement(SvgCircle, { cx: cx, cy: cy, r: 2.5, fill: '#D4AF37' })
                        ),
                        React.createElement(Text, { style: { color: '#FFF', fontSize: fp(14), fontWeight: '800', marginTop: -2 } }, score + '/25')
                      ),
                      React.createElement(Text, { style: { color: '#6B7280', fontSize: fp(10), marginTop: wp(4), lineHeight: fp(15) } }, desc)
                    );
                  }
                  return React.createElement(View, null,
                    makeGauge('\uD83C\uDFC3 Activit\u00e9 (' + actScore + '/25)', actScore, actNorm, '30 minutes d\'activit\u00e9 physique par jour pour le maximum.', 'act'),
                    makeGauge('\u2728 R\u00e9gularit\u00e9 (' + regPts + '/25)', regPts, regNorm, 'Loguer vos repas, remplir votre humeur et utiliser l\'app r\u00e9guli\u00e8rement.', 'reg')
                  );
                })()
              );
            })()}

            <TouchableOpacity activeOpacity={0.7} onPress={function() { setShowVitalityInfo(false); }} style={{ backgroundColor: '#00D984', borderRadius: 12, paddingVertical: 14, marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: '#1A1D22', fontSize: 16, fontWeight: '700' }}>Compris</Text>
            </TouchableOpacity>
          </ScrollView>
          <TouchableOpacity activeOpacity={0.7} onPress={function() { setShowVitalityInfo(false); }} style={{ position: 'absolute', top: 12, right: 12 }}>
            <Text style={{ color: '#8A8F98', fontSize: 20 }}>✕</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
    </View>
  );
};

var TooltipOverlay = function(props) {
  var tooltipStep = props.tooltipStep;
  var setTooltipStep = props.setTooltipStep;
  var scrollRef = props.scrollRef;

  if (tooltipStep === 0) return null;

  var dims = Dimensions.get('window');
  var screenW = dims.width;
  var screenH = dims.height;

  console.log('[LIXUM Tooltip] step:', tooltipStep, 'screen:', Math.round(screenW) + 'x' + Math.round(screenH), 'wp(90):', Math.round((screenW / 320) * 90));

  // Fallback : écran trop petit ou dimensions invalides
  var canShow = screenW >= 320 && screenH >= 500;
  if (!canShow) {
    console.log('[LIXUM Tooltip] Screen too small — skip tooltip, marking as seen');
    setTooltipStep(0);
    return null;
  }

  var steps = [
    { title: 'Votre Humeur', description: 'Tapez sur ce visage chaque jour pour enregistrer votre humeur. Cela personnalise vos recettes et vos recommandations d\'activité.', icon: '😊', color: '#FF8C42' },
    { title: 'Calories Consommées', description: 'Ce réacteur orange montre tout ce que vous avez mangé aujourd\'hui. Plus vous mangez, plus le glow s\'étend. Le satellite vert représente votre objectif.', icon: '🔥', color: '#FF8C42' },
    { title: 'Score Vitalité', description: 'L\'ADN central calcule votre score de santé sur 100. Il combine nutrition, hydratation, activité physique et régularité. Visez au-dessus de 80 !', icon: '🧬', color: '#00D984' },
    { title: 'Calories Restantes', description: 'Ce réacteur bleu montre combien vous pouvez encore manger. Le sport augmente ce nombre — c\'est votre bonus activité !', icon: '💪', color: '#4DA6FF' },
  ];
  var currentStep = steps[tooltipStep - 1];
  if (!currentStep) return null;
  var isLast = tooltipStep === steps.length;

  // Position safe : utiliser le MINIMUM entre wp(90) et 15% de la hauteur écran
  // Sur un phone normal (390x844) : min(wp(90)=110, 844*0.15=127) = 110 → OK
  // Sur Z Fold 5 déplié (904x1296) : min(wp(90)=254, 1296*0.15=194) = 194 → safe
  // Sur Z Fold 5 plié (412x938) : min(wp(90)=116, 938*0.15=141) = 116 → OK
  var cardBottom = Math.min((screenW / 320) * 90, screenH * 0.15);
  var cardMaxH = screenH * 0.55;

  console.log('[LIXUM Tooltip] cardBottom:', Math.round(cardBottom), 'cardMaxH:', Math.round(cardMaxH));

  return (
    React.createElement(View, { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 } },
      React.createElement(View, { style: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)' } }),
      React.createElement(View, {
        style: {
          position: 'absolute', bottom: cardBottom,
          left: wp(16), right: wp(16),
          maxHeight: cardMaxH,
          backgroundColor: '#1E2530', borderRadius: wp(18), padding: wp(18),
          borderWidth: 1.5, borderColor: currentStep.color + '40',
          shadowColor: currentStep.color,
          shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 15,
          elevation: 10, zIndex: 10000,
        }
      },
        React.createElement(ScrollView, { bounces: false, showsVerticalScrollIndicator: false },
          React.createElement(View, { style: { flexDirection: 'row', justifyContent: 'center', marginBottom: wp(10), gap: wp(5) } },
            steps.map(function(_, i) {
              return React.createElement(View, {
                key: i,
                style: {
                  width: i + 1 === tooltipStep ? wp(18) : wp(6),
                  height: wp(5), borderRadius: wp(3),
                  backgroundColor: i + 1 === tooltipStep ? currentStep.color : 'rgba(255,255,255,0.15)',
                }
              });
            })
          ),
          React.createElement(Text, {
            style: { color: currentStep.color, fontSize: fp(9), fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginBottom: wp(5) }
          }, tooltipStep + ' / ' + steps.length),
          React.createElement(View, {
            style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: wp(6) }
          },
            React.createElement(Text, { style: { fontSize: fp(20), marginRight: wp(6) } }, currentStep.icon),
            React.createElement(Text, { style: { color: '#EAEEF3', fontSize: fp(16), fontWeight: '800' } }, currentStep.title)
          ),
          React.createElement(Text, {
            style: { color: '#8892A0', fontSize: fp(12), lineHeight: fp(18), textAlign: 'center', marginBottom: wp(14) }
          }, currentStep.description),
          React.createElement(View, {
            style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
          },
            React.createElement(TouchableOpacity, {
              onPress: function() { setTooltipStep(0); }
            },
              React.createElement(Text, { style: { color: '#8892A0', fontSize: fp(12), fontWeight: '500' } }, 'Passer')
            ),
            React.createElement(TouchableOpacity, {
              onPress: function() {
                if (isLast) { setTooltipStep(0); }
                else { setTooltipStep(tooltipStep + 1); if (scrollRef && scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: true }); }
              },
              style: { backgroundColor: currentStep.color, borderRadius: wp(10), paddingHorizontal: wp(18), paddingVertical: wp(8) }
            },
              React.createElement(Text, { style: { color: '#0D1117', fontSize: fp(13), fontWeight: '800' } }, isLast ? 'Commencer !' : 'Suivant →')
            )
          )
        )
      )
    )
  );
};

const localStyles = StyleSheet.create({
  sectionTitle: {
    color: '#EAEEF3', fontSize: 15, fontWeight: '700',
    letterSpacing: 0.5, marginBottom: 8,
  },
  surplusText: { color: '#FF6B4A', fontSize: 14, fontWeight: '700' },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  activityText: { flex: 1, color: '#C0C8D4', fontSize: 13 },
  activityKcal: { color: '#00D984', fontSize: 13, fontWeight: '700' },
});

export default DashboardContent;
export { TooltipOverlay };
