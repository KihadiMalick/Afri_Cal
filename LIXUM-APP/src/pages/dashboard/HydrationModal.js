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

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

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
      p_user_id: TEST_USER_ID,
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
      p_user_id: TEST_USER_ID,
      p_date: new Date().toISOString().split('T')[0],
    }).then(function() {}).catch(function() {});
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
            <Text style={{ color: '#FFF', textAlign: 'center' }}>HydrationModal content placeholder</Text>
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
