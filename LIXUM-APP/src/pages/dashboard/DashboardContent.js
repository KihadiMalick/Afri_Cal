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

      <HydrationCardCompact currentMl={hydrationMl} goalMl={hydrationGoal} gender={gender} onPress={onHydrationPress} sportAlert={sportAlert} tooltipStep={tooltipStep} />

      <MetalCard style={{ marginHorizontal: 0, marginBottom: wp(12), ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }) }} onPress={function() { if (!lastMeal) { onNavigate('meals'); } else { setMealExpanded(function(v) { return !v; }); } }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
          <ForkKnifeIcon />
          <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '700', letterSpacing: wp(1), marginLeft: wp(8) }}>DERNIER REPAS</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {lastMeal && lastMeal.image_url ? (
            <Image source={{ uri: lastMeal.image_url }} style={{ width: wp(52), height: wp(52), borderRadius: wp(12), marginRight: wp(12) }} resizeMode="cover" />
          ) : (
            <View style={{ width: wp(52), height: wp(52), borderRadius: wp(12), backgroundColor: 'rgba(30, 37, 48, 0.8)', borderWidth: 1, borderColor: 'rgba(62, 72, 85, 0.3)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
              <Svg width={wp(28)} height={wp(28)} viewBox="0 0 32 32">
                <Defs>
                  <SvgLinearGradient id="plateGrd" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#8892A0" />
                    <Stop offset="100%" stopColor="#6B7B8D" />
                  </SvgLinearGradient>
                </Defs>
                <Ellipse cx="16" cy="22" rx="13" ry="5" fill="url(#plateGrd)" opacity={0.3} />
                <Ellipse cx="16" cy="20" rx="12" ry="4.5" fill="none" stroke="#8892A0" strokeWidth={1.2} opacity={0.5} />
                <Path d="M11 14 Q11 11 13 12 Q15 13 13 10" fill="none" stroke="#8892A0" strokeWidth={1} strokeLinecap="round" opacity={0.4} />
                <Path d="M16 13 Q16 10 18 11 Q20 12 18 9" fill="none" stroke="#8892A0" strokeWidth={1} strokeLinecap="round" opacity={0.35} />
              </Svg>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '600' }}>
              {lastMeal ? lastMeal.food_name : 'Aucun repas scanné'}
            </Text>
            <Text style={{ color: '#8892A0', fontSize: fp(11), marginTop: 2 }}>
              {lastMeal ? Math.round(lastMeal.calories) + ' kcal • ' : 'Prenez une photo de votre plat →'}
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

      <MetalCard style={{ marginHorizontal: 0, marginBottom: wp(12), ...(tooltipStep > 0 && { opacity: 0.05, zIndex: 0 }) }} onPress={function() { setCoachExpanded(function(v) { return !v; }); }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,217,132,0.12)', borderWidth: 1, borderColor: 'rgba(0, 217, 132, 0.25)', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>🤖</Text>
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
        <View style={{ backgroundColor: 'rgba(0, 217, 132, 0.03)', borderRadius: wp(10), padding: wp(10), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(0, 217, 132, 0.06)' }}>
          <Text style={{ color: '#8892A0', fontSize: fp(8), fontWeight: '700', letterSpacing: wp(1), marginBottom: wp(4) }}>SUGGESTIONS</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ color: '#00D984', fontSize: fp(10), marginRight: wp(6) }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: fp(11) }}>{!lastMeal ? 'Scannez un repas pour activer les suggestions' : '25g de protéines au prochain repas'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ color: '#00D984', fontSize: fp(10), marginRight: wp(6) }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: fp(11) }}>{Math.max(0, Math.ceil((hydrationGoal - hydrationMl) / 250))} verre{Math.ceil((hydrationGoal - hydrationMl) / 250) > 1 ? 's' : ''} d'eau (hydratation à {Math.round((hydrationMl / hydrationGoal) * 100)}%)</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#00D984', fontSize: fp(10), marginRight: wp(6) }}>+</Text>
            <Text style={{ color: '#EAEEF3', fontSize: fp(11) }}>{burnedExtra > 0 ? 'Bonne séance ! ' + burnedExtra + ' kcal brûlées' : '15 min de marche pour brûler 85 kcal'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={function() { onNavigate('meals'); }} activeOpacity={0.7}
          style={{ backgroundColor: 'rgba(0, 217, 132, 0.08)', borderRadius: wp(10), borderWidth: 1, borderColor: 'rgba(0, 217, 132, 0.15)', paddingVertical: wp(8), paddingHorizontal: wp(12), marginTop: wp(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>📸</Text>
          <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '700' }}>Scanner mon premier plat</Text>
          <Text style={{ color: '#00D984', fontSize: fp(11), marginLeft: wp(4) }}>→</Text>
        </TouchableOpacity>
        {coachExpanded && (
          <View style={{ backgroundColor: 'rgba(0,217,132,0.04)', borderRadius: wp(12), padding: wp(12), marginTop: wp(10), borderWidth: 1, borderColor: 'rgba(0,217,132,0.1)' }}>
            <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#EAEEF3', marginBottom: wp(10) }}>🧠 Analyse du jour</Text>
            {(function() {
              var OBJECTIVE_CALC = dailyTarget || 2100;
              var hydroGoalCalc = gender === 'femme' ? 2000 : 2500;
              var nutritionPct = OBJECTIVE_CALC > 0 && consumedTotal > 0 ? Math.max(0, Math.min(100, 100 - Math.round(Math.abs(1 - consumedTotal / OBJECTIVE_CALC) * 330))) : 0;
              var hydroPct = Math.min(Math.round((hydrationMl / hydroGoalCalc) * 100), 100);
              var activityPct = 0;
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8), paddingRight: wp(16) }}>
          <StatsIcon />
          <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '700', letterSpacing: wp(1), marginLeft: wp(8) }}>MES STATS</Text>
          <Text style={{ color: '#6B7280', fontSize: fp(10), marginLeft: wp(4) }}>(7 jours)</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(8), paddingRight: wp(16) }}>
          <LockIcon size={wp(14)} />
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
            <LixCoinIcon size={wp(12)} />
            <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '700', marginLeft: wp(3) }}>200 Lix</Text>
          </View>
          <Text style={{ color: '#6B7280', fontSize: fp(10) }}>pour débloquer</Text>
        </View>
      </MetalCard>
    </ScrollView>
  );
};

const TooltipOverlay = ({ tooltipStep, setTooltipStep, scrollRef }) => {
  if (tooltipStep === 0) return null;
  const steps = [
    { title: 'Votre Humeur', description: 'Tapez sur ce visage chaque jour pour enregistrer votre humeur. Cela personnalise vos recettes et vos recommandations d\'activité.', icon: '😊', color: '#FF8C42' },
    { title: 'Calories Consommées', description: 'Ce réacteur orange montre tout ce que vous avez mangé aujourd\'hui. Plus vous mangez, plus le glow s\'étend. Le satellite vert représente votre objectif.', icon: '🔥', color: '#FF8C42' },
    { title: 'Score Vitalité', description: 'L\'ADN central calcule votre score de santé sur 100. Il combine nutrition, hydratation, activité physique et régularité. Visez au-dessus de 80 !', icon: '🧬', color: '#00D984' },
    { title: 'Calories Restantes', description: 'Ce réacteur bleu montre combien vous pouvez encore manger. Le sport augmente ce nombre — c\'est votre bonus activité !', icon: '💪', color: '#4DA6FF' },
  ];
  const currentStep = steps[tooltipStep - 1];
  if (!currentStep) return null;
  const isLast = tooltipStep === steps.length;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)' }} />
      <View style={{ position: 'absolute', bottom: wp(90), left: wp(16), right: wp(16), backgroundColor: '#1E2530', borderRadius: wp(18), padding: wp(18), borderWidth: 1.5, borderColor: currentStep.color + '40', shadowColor: currentStep.color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 10, zIndex: 10000 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: wp(10), gap: wp(5) }}>
          {steps.map(function(_, i) {
            return (
              <View key={i} style={{ width: i + 1 === tooltipStep ? wp(18) : wp(6), height: wp(5), borderRadius: wp(3), backgroundColor: i + 1 === tooltipStep ? currentStep.color : 'rgba(255,255,255,0.15)' }} />
            );
          })}
        </View>
        <Text style={{ color: currentStep.color, fontSize: fp(9), fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginBottom: wp(5) }}>{tooltipStep} / {steps.length}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: wp(6) }}>
          <Text style={{ fontSize: fp(20), marginRight: wp(6) }}>{currentStep.icon}</Text>
          <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800' }}>{currentStep.title}</Text>
        </View>
        <Text style={{ color: '#8892A0', fontSize: fp(12), lineHeight: fp(18), textAlign: 'center', marginBottom: wp(14) }}>{currentStep.description}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={function() { setTooltipStep(0); }}>
            <Text style={{ color: '#8892A0', fontSize: fp(12), fontWeight: '500' }}>Passer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={function() {
            if (isLast) { setTooltipStep(0); }
            else { setTooltipStep(tooltipStep + 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }
          }} style={{ backgroundColor: currentStep.color, borderRadius: wp(10), paddingHorizontal: wp(18), paddingVertical: wp(8) }}>
            <Text style={{ color: '#0D1117', fontSize: fp(13), fontWeight: '800' }}>{isLast ? 'Commencer !' : 'Suivant →'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
