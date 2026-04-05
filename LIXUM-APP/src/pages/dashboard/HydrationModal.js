import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable,
  Modal, Platform, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { wp, fp, JOURS_COURTS, pad2, formatTimeFR, formatNumberFR } from './dashboardConstants';
import { LixGem } from './dashboardIcons';
import { SilhouetteFill, HydrationClock } from './dashboardComponents';
import { useAuth } from '../../config/AuthContext';

const HydrationModal = ({
  visible, onClose,
  currentMl, setCurrentMl,
  goalMl, gender,
  hydroLogs, setHydroLogs,
  onAddBeverage,
  showResetConfirm, setShowResetConfirm,
  showHistoryLock, setShowHistoryLock,
  historyUnlocked,
  historyData, historyLoading,
  selectedHistoryDay, setSelectedHistoryDay,
  unlockHistoryWithLix, unlockHistoryWithPower,
  fetchWeeklyHydration,
  pagePowers, activeChar,
  historyUnlockedUntil, isUnlockedByLix, hasActivePower,
  selectedDayLogs, fetchDayHydrationLogs,
}) => {
  var auth = useAuth(); var userId = auth.userId;
  const percent = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  const glasses = Math.round(currentMl / 250);
  const totalGlasses = Math.round(goalMl / 250);

  var _deleteConfirm = useState(null);
  var deleteConfirmIdx = _deleteConfirm[0]; var setDeleteConfirmIdx = _deleteConfirm[1];

  var _selectedDayLogs = selectedDayLogs || [];
  var _fetchDayHydrationLogs = fetchDayHydrationLogs || function() {};
  var _historyData = historyData || [];

  const getTimeStr = () => {
    const now = new Date();
    return pad2(now.getHours()) + ':' + pad2(now.getMinutes());
  };

  const addWater = (ml) => {
    setCurrentMl(prev => prev + ml);
    setHydroLogs(prev => [...prev, { time: getTimeStr(), amount: ml, type: 'eau', icon: '💧' }]);
    try {
      var Vibration = require('react-native').Vibration;
      Vibration.vibrate(30);
    } catch(e) {}
    supabase.rpc('add_beverage_log', {
      p_user_id: userId,
      p_beverage_name: 'eau',
      p_amount_ml: ml,
      p_hydration_coeff: 1.0,
      p_source: 'manual',
      p_kcal: 0,
      p_sugar_g: 0,
      p_sugar_estimated: false,
      p_sugar_cubes: 0,
    }).then(function(res) {
      if (res.error) console.warn('addWater Supabase error:', res.error.message);
    }).catch(function(e) {
      console.warn('addWater save error:', e);
    });
  };

  const removeWater = (ml) => {
    setCurrentMl(prev => Math.max(0, prev - ml));
    setHydroLogs(prev => {
      const idx = [...prev].reverse().findIndex(l => l.amount === ml && l.type === 'eau');
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return [...prev.slice(0, realIdx), ...prev.slice(realIdx + 1)];
    });
    try {
      var Vibration = require('react-native').Vibration;
      Vibration.vibrate(15);
    } catch(e) {}
    supabase.rpc('get_daily_hydration', {
      p_user_id: userId,
      p_date: new Date().toISOString().split('T')[0],
    }).then(function() {}).catch(function(err) { console.warn('[LIXUM] hydration refresh error:', err); });
  };

  const palierLabels = gender === 'homme'
    ? ['0.6L', '1.25L', '1.9L', '2.5L']
    : ['0.5L', '1L', '1.5L', '2L'];

  const quantities = [
    { ml: 50, icon: '🥛', label: '50ml' },
    { ml: 250, icon: '🥤', label: '250ml' },
    { ml: 1000, icon: '🫗', label: '1L' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <LinearGradient
        colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="#EAEEF3" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>HYDRATATION</Text>
            <Text style={{ fontSize: 20 }}>💧</Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

            <View style={{ alignItems: 'center', marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <SilhouetteFill fillPercent={percent} height={260} gender={gender} showBubbles />
                <View style={{ marginLeft: 20, height: 260, justifyContent: 'space-between', paddingVertical: 12 }}>
                  {palierLabels.slice().reverse().map((label, i) => {
                    const palierPct = (4 - i) * 25;
                    const reached = percent >= palierPct;
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ width: 12, height: 1, backgroundColor: reached ? '#4DA6FF' : '#2A3040' }} />
                        <Text style={{ color: reached ? '#4DA6FF' : '#555E6C', fontSize: 11, marginLeft: 6, fontWeight: reached ? '700' : '400' }}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 16, paddingHorizontal: 32 }}>
              <Text style={{ fontSize: 28, fontWeight: '900' }}>
                <Text style={{ color: '#4DA6FF' }}>{formatNumberFR(currentMl)}</Text>
                <Text style={{ color: '#555E6C', fontSize: 16 }}> / {formatNumberFR(goalMl)} ml</Text>
              </Text>
              <View style={{ width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginTop: 10 }}>
                <LinearGradient colors={['#4DA6FF', '#00BCD4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: percent + '%', height: '100%', borderRadius: 4 }} />
              </View>
              <Text style={{ color: '#4DA6FF', fontSize: 13, fontWeight: '700', marginTop: 8 }}>{percent}% • {glasses}/{totalGlasses} verres</Text>
            </View>

            <View style={{ marginHorizontal: 24, marginBottom: 12, backgroundColor: 'rgba(30,37,48,0.4)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(77,166,255,0.08)' }}>
              <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 14 }}>EAU 💧</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                {quantities.map((item) => (
                  <View key={item.ml} style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                      style={{ width: 54, height: 54, borderRadius: 14, backgroundColor: 'rgba(21,27,35,0.8)', borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)', justifyContent: 'center', alignItems: 'center' }}
                      activeOpacity={0.7} onPress={() => addWater(item.ml)}
                    >
                      <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                      <Text style={{ color: '#C0C8D4', fontSize: 10, fontWeight: '700', marginTop: 1 }}>{item.label}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ marginTop: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(30,35,45,0.8)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', justifyContent: 'center', alignItems: 'center' }}
                      activeOpacity={0.7} onPress={() => removeWater(item.ml)}
                    >
                      <Text style={{ color: '#FF3B30', fontSize: 16, fontWeight: '700', lineHeight: 18 }}>−</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 24, marginBottom: 20, backgroundColor: 'rgba(0, 217, 132, 0.08)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0, 217, 132, 0.25)', paddingVertical: 14 }}
              activeOpacity={0.7} onPress={onAddBeverage}
            >
              <Text style={{ color: '#00D984', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 }}>AJOUTER BOISSONS 🥤</Text>
            </TouchableOpacity>

            <View style={{ marginHorizontal: 24 }}>
              <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 12 }}>AUJOURD'HUI</Text>
              {hydroLogs.length === 0 ? (
                <View style={{ backgroundColor: 'rgba(30,37,48,0.3)', borderRadius: 14, paddingVertical: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(74,79,85,0.15)', alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, marginBottom: 8 }}>💧</Text>
                  <Text style={{ color: '#555E6C', fontSize: 12 }}>Ajoutez votre première boisson du jour</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: 'rgba(30,37,48,0.25)', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(74,79,85,0.12)' }}>
                  {hydroLogs.slice().reverse().map(function(log, i, arr) {
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: 'rgba(74,79,85,0.1)', backgroundColor: i === 0 ? 'rgba(0,217,132,0.04)' : 'transparent' }}>
                        {deleteConfirmIdx !== i ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 18, width: 28 }}>{log.icon || '💧'}</Text>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '600' }}>{log.type || 'eau'}</Text>
                              <Text style={{ color: '#555E6C', fontSize: 10, marginTop: 1 }}>{log.time}</Text>
                            </View>
                            <Text style={{ color: '#4DA6FF', fontSize: 14, fontWeight: '800', marginRight: 10 }}>+{log.amount} ml</Text>
                            <Pressable onPress={function() { setDeleteConfirmIdx(i); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ color: '#8892A0', fontSize: 10 }}>🗑</Text>
                            </Pressable>
                          </View>
                        ) : (
                          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: '#FF6B6B', fontSize: 12, fontWeight: '600', flex: 1 }}>Supprimer +{log.amount}ml {log.type || 'eau'} ?</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <Pressable onPress={function() { setDeleteConfirmIdx(null); }}
                                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '600' }}>Non</Text>
                              </Pressable>
                              <Pressable onPress={function() {
                                var realIdx = arr.length - 1 - i;
                                var removedLog = hydroLogs[realIdx];
                                if (!removedLog) { setDeleteConfirmIdx(null); return; }
                                setHydroLogs(function(prev) { return prev.filter(function(_, idx) { return idx !== realIdx; }); });
                                setCurrentMl(function(prev) { return Math.max(0, prev - removedLog.amount); });
                                try { var Vibration = require('react-native').Vibration; Vibration.vibrate(15); } catch(e) {}
                                setDeleteConfirmIdx(null);
                              }}
                                style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' }}>
                                <Text style={{ color: '#FF3B30', fontSize: 11, fontWeight: '700' }}>Oui</Text>
                              </Pressable>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={function() { setShowHistoryLock(true); if (historyUnlocked) fetchWeeklyHydration(); }}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 24, marginTop: 20, marginHorizontal: 24 }}
            >
              <Text style={{ fontSize: 14, marginRight: 10 }}>🔒</Text>
              <Text style={{ color: '#8892A0', fontSize: 13, fontWeight: '600' }}>Voir 7 jours et +</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12, backgroundColor: 'rgba(0, 217, 132, 0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 }}>
                <Text style={{ color: '#00D984', fontSize: 12, fontWeight: '700' }}>100 Lix</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowResetConfirm(true)} style={{ alignSelf: 'center', marginTop: 24, marginBottom: 30 }}>
              <Text style={{ color: '#8892A0', fontSize: 11, opacity: 0.5 }}>Réinitialiser les données du jour</Text>
            </TouchableOpacity>

            <Modal visible={showHistoryLock} animationType="slide" transparent={false}>
              <LinearGradient colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
                    <TouchableOpacity onPress={function() { setShowHistoryLock(false); setSelectedHistoryDay(null); }}>
                      <Ionicons name="chevron-back" size={24} color="#EAEEF3" />
                    </TouchableOpacity>
                    <Text style={{ color: '#EAEEF3', fontSize: 18, fontWeight: '800', letterSpacing: 2 }}>HISTORIQUE 7 JOURS</Text>
                    <Text style={{ fontSize: 20 }}>💧</Text>
                  </View>
                  <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {!historyUnlocked ? (
                      <View style={{ alignItems: 'center', paddingTop: 20 }}>
                        <View style={{ width: '100%', height: 160, borderRadius: 16, backgroundColor: 'rgba(30,37,48,0.4)', borderWidth: 1, borderColor: 'rgba(74,79,85,0.2)', padding: 16, marginBottom: 20, overflow: 'hidden' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', flex: 1 }}>
                            {[65, 45, 80, 55, 35, 70, 20].map(function(h, i) {
                              return (
                                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                                  <View style={{ width: 16, height: h + '%', borderRadius: 4, backgroundColor: 'rgba(77,166,255,0.12)' }} />
                                  <Text style={{ color: '#555E6C', fontSize: 8, marginTop: 4 }}>{['L', 'M', 'M', 'J', 'V', 'S', 'D'][i]}</Text>
                                </View>
                              );
                            })}
                          </View>
                          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(30,37,48,0.6)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 32 }}>🔒</Text>
                          </View>
                        </View>
                        <Text style={{ color: '#EAEEF3', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>Historique Complet</Text>
                        <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>Suivez votre hydratation sur 7 jours et identifiez vos habitudes.</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, width: '100%' }}>
                          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(74,79,85,0.2)' }} />
                          <Text style={{ color: '#555E6C', fontSize: 10, fontWeight: '600', marginHorizontal: 12, letterSpacing: 1 }}>DÉBLOQUER AVEC</Text>
                          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(74,79,85,0.2)' }} />
                        </View>
                        <TouchableOpacity onPress={unlockHistoryWithLix} style={{ width: '100%', paddingVertical: 16, borderRadius: 14, backgroundColor: 'rgba(0,217,132,0.08)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)', alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                          <LixGem size={16} />
                          <Text style={{ color: '#00D984', fontSize: 16, fontWeight: '800' }}>100 Lix</Text>
                          <Text style={{ color: '#8892A0', fontSize: 12 }}>• Accès 24h</Text>
                        </TouchableOpacity>
                        {(function() {
                          var hydroPower = (pagePowers || []).find(function(p) { return p.action_type === 'modal_inline' && p.redirect_page === 'accueil'; });
                          var hasPower = hydroPower && hydroPower.unlocked;
                          return (
                            <TouchableOpacity onPress={hasPower ? unlockHistoryWithPower : null} disabled={!hasPower}
                              style={{ width: '100%', paddingVertical: 16, borderRadius: 14, backgroundColor: hasPower ? 'rgba(77,166,255,0.08)' : 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: hasPower ? 'rgba(77,166,255,0.25)' : 'rgba(74,79,85,0.15)', alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: hasPower ? 1 : 0.4 }}>
                              <Text style={{ fontSize: 16 }}>🐬</Text>
                              <Text style={{ color: hasPower ? '#4DA6FF' : '#555E6C', fontSize: 14, fontWeight: '700' }}>{hasPower ? 'Pouvoir Coral Dolphin' : 'Aucun pouvoir compatible'}</Text>
                            </TouchableOpacity>
                          );
                        })()}
                        <TouchableOpacity onPress={function() { setShowHistoryLock(false); }} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
                          <Text style={{ color: '#8892A0', fontSize: 13, fontWeight: '600' }}>Plus tard</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{ paddingTop: 8 }}>
                        {historyLoading ? (
                          <View style={{ alignItems: 'center', paddingTop: 60 }}>
                            <Text style={{ fontSize: 32 }}>💧</Text>
                            <Text style={{ color: '#555E6C', fontSize: 13, marginTop: 12 }}>Chargement de l'historique...</Text>
                          </View>
                        ) : (
                          <View>
                            {isUnlockedByLix && isUnlockedByLix(historyUnlockedUntil) && !(hasActivePower && hasActivePower('modal_inline')) && (
                              <View style={{ backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: wp(10), padding: wp(8), marginBottom: wp(12), borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(6) }}>
                                <Text style={{ fontSize: fp(12) }}>⏳</Text>
                                <Text style={{ fontSize: fp(10), color: '#D4AF37', fontWeight: '600' }}>Accès expire dans {Math.max(0, Math.ceil((new Date(historyUnlockedUntil) - new Date()) / 3600000))}h</Text>
                              </View>
                            )}
                            <View style={{ backgroundColor: 'rgba(30,37,48,0.4)', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(77,166,255,0.1)' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140 }}>
                                {_historyData.map(function(day, i) {
                                  var pct = day.goalMl > 0 ? Math.min((day.totalMl / day.goalMl) * 100, 100) : 0;
                                  var barColor = pct >= 100 ? '#00D984' : pct >= 50 ? '#4DA6FF' : '#FF8C42';
                                  var isToday = i === _historyData.length - 1;
                                  return (
                                    <Pressable key={i} onPress={function() { setSelectedHistoryDay(selectedHistoryDay === i ? null : i); }} style={{ alignItems: 'center', flex: 1 }}>
                                      <Text style={{ color: '#8892A0', fontSize: 9, fontWeight: '700', marginBottom: 4 }}>{(day.totalMl / 1000).toFixed(1)}L</Text>
                                      <View style={{ width: 20, height: Math.max(pct * 1.2, 4), borderRadius: 4, backgroundColor: barColor, borderWidth: isToday ? 1.5 : 0, borderColor: isToday ? '#FFFFFF' : 'transparent' }} />
                                      <Text style={{ color: isToday ? '#EAEEF3' : '#8892A0', fontSize: 9, fontWeight: isToday ? '800' : '600', marginTop: 6, textTransform: 'capitalize' }}>{day.dayName.replace('.', '')}</Text>
                                    </Pressable>
                                  );
                                })}
                              </View>
                              <View style={{ position: 'absolute', left: 16, right: 16, top: 16, height: 1, borderTopWidth: 1, borderTopColor: 'rgba(0,217,132,0.25)', borderStyle: 'dashed' }} />
                            </View>
                            {(function() {
                              var totalAll = _historyData.reduce(function(s, d) { return s + d.totalMl; }, 0);
                              var avg = _historyData.length > 0 ? totalAll / _historyData.length : 0;
                              var best = _historyData.reduce(function(b, d) { return d.totalMl > b.totalMl ? d : b; }, { totalMl: 0, dayName: '' });
                              var daysReached = _historyData.filter(function(d) { return d.totalMl >= d.goalMl; }).length;
                              return (
                                <View style={{ backgroundColor: 'rgba(30,37,48,0.3)', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(74,79,85,0.12)' }}>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                    <View style={{ alignItems: 'center' }}>
                                      <Text style={{ color: '#4DA6FF', fontSize: 18, fontWeight: '900' }}>{(avg / 1000).toFixed(1)}L</Text>
                                      <Text style={{ color: '#6B7280', fontSize: 9, marginTop: 2 }}>Moyenne / jour</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: 'rgba(74,79,85,0.3)' }} />
                                    <View style={{ alignItems: 'center' }}>
                                      <Text style={{ color: '#00D984', fontSize: 18, fontWeight: '900' }}>{(best.totalMl / 1000).toFixed(1)}L</Text>
                                      <Text style={{ color: '#6B7280', fontSize: 9, marginTop: 2 }}>Meilleur jour</Text>
                                    </View>
                                    <View style={{ width: 1, backgroundColor: 'rgba(74,79,85,0.3)' }} />
                                    <View style={{ alignItems: 'center' }}>
                                      <Text style={{ color: daysReached >= 5 ? '#00D984' : '#FF8C42', fontSize: 18, fontWeight: '900' }}>{daysReached}/7</Text>
                                      <Text style={{ color: '#6B7280', fontSize: 9, marginTop: 2 }}>Objectif atteint</Text>
                                    </View>
                                  </View>
                                </View>
                              );
                            })()}
                            <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '800', letterSpacing: 2, marginBottom: 12 }}>DÉTAIL PAR JOUR</Text>
                            <View style={{ backgroundColor: 'rgba(30,37,48,0.25)', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(74,79,85,0.12)' }}>
                              {_historyData.slice().reverse().map(function(day, i, arr) {
                                var pct = day.goalMl > 0 ? Math.min(Math.round((day.totalMl / day.goalMl) * 100), 100) : 0;
                                var isToday = i === 0;
                                var barColor = pct >= 100 ? '#00D984' : pct >= 50 ? '#4DA6FF' : pct > 0 ? '#FF8C42' : '#555E6C';
                                return (
                                  <View key={i}>
                                    <Pressable onPress={function() {
                                      if (selectedHistoryDay === i) { setSelectedHistoryDay(null); } else { setSelectedHistoryDay(i); _fetchDayHydrationLogs(day.date); }
                                    }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: (selectedHistoryDay !== i && i < arr.length - 1) ? 1 : 0, borderBottomColor: 'rgba(74,79,85,0.1)', backgroundColor: selectedHistoryDay === i ? 'rgba(77,166,255,0.04)' : 'transparent' }}>
                                      <Text style={{ fontSize: 16, width: 24 }}>💧</Text>
                                      <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={{ color: isToday ? '#EAEEF3' : '#C0C8D4', fontSize: 13, fontWeight: isToday ? '700' : '600' }}>
                                          {isToday ? 'Aujourd\'hui' : day.dayName.charAt(0).toUpperCase() + day.dayName.slice(1).replace('.', '')}
                                        </Text>
                                        <Text style={{ color: '#555E6C', fontSize: 10, marginTop: 1 }}>{day.date}</Text>
                                      </View>
                                      <Text style={{ color: barColor, fontSize: 14, fontWeight: '800', marginRight: 8 }}>{(day.totalMl / 1000).toFixed(1)}L</Text>
                                      <View style={{ backgroundColor: barColor + '20', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                                        <Text style={{ color: barColor, fontSize: 10, fontWeight: '700' }}>{pct}%</Text>
                                      </View>
                                      <Text style={{ color: '#555E6C', fontSize: 14, marginLeft: 8 }}>{selectedHistoryDay === i ? '⌄' : '›'}</Text>
                                    </Pressable>
                                    {selectedHistoryDay === i && (
                                      <View style={{ backgroundColor: 'rgba(77,166,255,0.04)', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: 'rgba(74,79,85,0.1)' }}>
                                        {_selectedDayLogs.length === 0 ? (
                                          <Text style={{ color: '#555E6C', fontSize: 11, textAlign: 'center', paddingVertical: 8 }}>Aucune entrée ce jour</Text>
                                        ) : (
                                          _selectedDayLogs.map(function(log, j) {
                                            var time = formatTimeFR(log.logged_at);
                                            return (
                                              <View key={j} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}>
                                                <Text style={{ fontSize: 14, width: 22 }}>💧</Text>
                                                <View style={{ flex: 1, marginLeft: 6 }}>
                                                  <Text style={{ color: '#EAEEF3', fontSize: 12, fontWeight: '600' }}>{log.beverage_name || 'eau'}</Text>
                                                  <Text style={{ color: '#555E6C', fontSize: 9 }}>{time}</Text>
                                                </View>
                                                <Text style={{ color: '#4DA6FF', fontSize: 12, fontWeight: '800' }}>+{log.effective_ml || log.amount_ml}ml</Text>
                                              </View>
                                            );
                                          })
                                        )}
                                      </View>
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </ScrollView>
                </SafeAreaView>
              </LinearGradient>
            </Modal>

            <Modal visible={showResetConfirm} animationType="fade" transparent>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
                <View style={{ backgroundColor: '#1E2530', borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)' }}>
                  <Text style={{ color: '#EAEEF3', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 12 }}>Réinitialiser ?</Text>
                  <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>Votre hydratation du jour sera remise à zéro. Cette action est irréversible.</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => setShowResetConfirm(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(136,146,160,0.2)', alignItems: 'center' }}>
                      <Text style={{ color: '#8892A0', fontSize: 14, fontWeight: '600' }}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setCurrentMl(0); setHydroLogs([]); setShowResetConfirm(false); }} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', alignItems: 'center' }}>
                      <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '800' }}>Réinitialiser</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );
};

export default HydrationModal;

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  modalTitle: {
    color: '#EAEEF3', fontSize: 18, fontWeight: '800', letterSpacing: 2,
  },
});
