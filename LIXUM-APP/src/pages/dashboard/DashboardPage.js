import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StatusBar, Platform, Modal, RefreshControl,
  Animated as RNAnimated, TouchableOpacity, Image, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import BottomTabs from '../../components/shared/NavBar';
import {
  wp, fp, W, H,
  JOURS_COURTS, pad2, formatNumberFR,
  DAILY_OBJECTIVE, calculateWaterLoss,
} from './dashboardConstants';
import { LixGem, MoodIcon } from './dashboardIcons';
import { MetallicBackground, SurplusAlertModal } from './dashboardComponents';
import DashboardContent, { TooltipOverlay } from './DashboardContent';
import HydrationModal from './HydrationModal';
import BeverageModal from './BeverageModal';
import MoodModal from './MoodModal';
import { useAuth } from '../../config/AuthContext';

export default function DashboardPage({ navigation }) {
  var auth = useAuth(); var userId = auth.userId;
  var realLixBalance = auth.lixBalance; var updateLixBalance = auth.updateLixBalance;
  var userEnergy = auth.energy; var updateEnergy = auth.updateEnergy;
  var refreshLixFromServer = auth.refreshLixFromServer;
  const [realConsumed, setRealConsumed] = useState(0);
  const [realDailyTarget, setRealDailyTarget] = useState(2330);
  const [realGender, setRealGender] = useState('homme');
  const [lastMeal, setLastMeal] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [userName, setUserName] = useState('');
  const [activities, setActivities] = useState([]);
  const [tooltipStep, setTooltipStep] = useState(0);
  var _rawSetTooltipStep = setTooltipStep;
  var setTooltipStepPersist = function(val) {
    _rawSetTooltipStep(val);
    if (val === 0) AsyncStorage.setItem('dashboard_tooltip_seen', 'true').catch(function() {});
  };
  useEffect(function() {
    AsyncStorage.getItem('dashboard_tooltip_seen').then(function(v) {
      if (!v) _rawSetTooltipStep(1);
    }).catch(function() {});
  }, []);
  const scrollRef = useRef(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [moodFilled, setMoodFilled] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [hydrationMl, setHydrationMl] = useState(0);
  const [vitalityScore, setVitalityScore] = useState(0);
  const [hydrationData, setHydrationData] = useState({ totalEffective: 0, totalVolume: 0, totalKcal: 0, totalSugar: 0, entryCount: 0 });
  const [hydrationGoal, setHydrationGoal] = useState(2500);
  const [hydroModalVisible, setHydroModalVisible] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hydroLogs, setHydroLogs] = useState([]);
  const [showHistoryLock, setShowHistoryLock] = useState(false);
  var _historyUnlockedUntil = useState(null);
  var historyUnlockedUntil = _historyUnlockedUntil[0]; var setHistoryUnlockedUntil = _historyUnlockedUntil[1];
  var _historyData = useState([]);
  var historyData = _historyData[0]; var setHistoryData = _historyData[1];
  var _historyLoading = useState(false);
  var historyLoading = _historyLoading[0]; var setHistoryLoading = _historyLoading[1];
  var _selectedHistoryDay = useState(null);
  var selectedHistoryDay = _selectedHistoryDay[0]; var setSelectedHistoryDay = _selectedHistoryDay[1];
  var _selectedDayLogs = useState([]);
  var selectedDayLogs = _selectedDayLogs[0]; var setSelectedDayLogs = _selectedDayLogs[1];
  const [surplusAlertVisible, setSurplusAlertVisible] = useState(false);
  var _statsLoading = useState(false);
  var statsLoading = _statsLoading[0]; var setStatsLoading = _statsLoading[1];
  var _statsUnlockedUntil = useState(null);
  var statsUnlockedUntil = _statsUnlockedUntil[0]; var setStatsUnlockedUntil = _statsUnlockedUntil[1];
  const [showBeverageModal, setShowBeverageModal] = useState(false);
  const [beverageToast, setBeverageToast] = useState(null);
  var beverageToastTimerRef = useRef(null);
  var _lixAlert = useState({ visible: false, missing: 0, type: '' });
  var lixAlert = _lixAlert[0]; var setLixAlert = _lixAlert[1];
  var _refreshing = useState(false);
  var refreshing = _refreshing[0]; var setRefreshing = _refreshing[1];

  var onRefresh = async function() {
    setRefreshing(true);
    try {
      await Promise.all([
        loadDashboardFromSupabase(),
        loadPagePowers(),
        fetchDailyHydration().then(function(data) { setHydrationData(data); setHydrationMl(data.totalEffective || 0); }),
      ]);
    } catch(err) { console.warn('onRefresh error:', err); }
    setRefreshing(false);
  };
  const [activeChar, setActiveChar] = useState(null);
  const [pagePowers, setPagePowers] = useState([]);
  const [toggleStates, setToggleStates] = useState({});

  var toastTimerRef = useRef(null);
  var showToast = function(message, color) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg({ message: message, color: color || '#00D984' });
    toastTimerRef.current = setTimeout(function() { setToastMsg(null); }, 2500);
  };
  useEffect(function() { return function() { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); if (beverageToastTimerRef.current) clearTimeout(beverageToastTimerRef.current); }; }, []);

  var calcVitalityScore = function() {
    var OBJECTIVE = realDailyTarget || 2100;
    var score = 0;
    if (OBJECTIVE > 0 && realConsumed > 0) {
      var deviation = Math.abs(1 - realConsumed / OBJECTIVE);
      score += Math.max(0, 25 - Math.round(deviation * 83));
    }
    var hydroGoal = realGender === 'femme' ? 2000 : 2500;
    score += Math.round((Math.min((hydrationMl / hydroGoal) * 100, 100) / 100) * 25);
    var totalActivityMin = activities.reduce(function(s, a) { return s + (a.durationMin || 0); }, 0);
    score += Math.round(Math.min(totalActivityMin / 30, 1) * 25);
    var regPts = 0;
    if (moodFilled) regPts += 8;
    if (lastMeal) regPts += 9;
    regPts += Math.min(8, 8);
    score += regPts;
    return Math.min(100, Math.max(0, score));
  };

  var fetchDailyHydration = async function() {
    if (!userId) return { totalEffective: 0, totalVolume: 0, totalKcal: 0, totalSugar: 0, entryCount: 0 };
    try {
      var today = new Date().toISOString().split('T')[0];
      var { data, error } = await supabase.rpc('get_daily_hydration', { p_user_id: userId, p_date: today });
      if (error) throw error;
      if (data && data.length > 0) {
        return { totalEffective: data[0].total_effective_ml, totalVolume: data[0].total_volume_ml, totalKcal: data[0].total_kcal, totalSugar: data[0].total_sugar_g, entryCount: data[0].entry_count };
      }
      return { totalEffective: 0, totalVolume: 0, totalKcal: 0, totalSugar: 0, entryCount: 0 };
    } catch (err) {
      console.warn('fetchDailyHydration error:', err);
      return { totalEffective: 0, totalVolume: 0, totalKcal: 0, totalSugar: 0, entryCount: 0 };
    }
  };

  var fetchWeeklyHydration = async function() {
    if (!userId) return;
    setHistoryLoading(true);
    try {
      var days = [];
      for (var d = 6; d >= 0; d--) {
        var date = new Date(); date.setDate(date.getDate() - d);
        var dateStr = date.toISOString().split('T')[0];
        var dayName = JOURS_COURTS[date.getDay()];
        days.push({ date: dateStr, dayName: dayName, totalMl: 0, goalMl: hydrationGoal });
      }
      var hydrationResults = await Promise.all(days.map(function(day) {
        return supabase.rpc('get_daily_hydration', { p_user_id: userId, p_date: day.date });
      }));
      for (var i = 0; i < days.length; i++) {
        try {
          var result = hydrationResults[i];
          if (result.data && result.data.length > 0) {
            days[i].totalMl = result.data[0].total_effective_ml || 0;
          }
        } catch(e) {}
      }
      setHistoryData(days);
    } catch(err) { console.warn('fetchWeeklyHydration error:', err); }
    setHistoryLoading(false);
  };

  var unlockHistoryWithLix = async function() {
    if (!userId) { showToast('⚠️ Connectez-vous d\'abord', '#FF6B6B'); return; }
    if (realLixBalance < 100) { setLixAlert({ visible: true, missing: 100 - realLixBalance, type: 'hydration' }); return; }
    try {
      var newBalance = realLixBalance - 100;
      var unlockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      var { data, error } = await supabase.from('users_profile').update({ lix_balance: newBalance, hydration_history_unlocked_until: unlockUntil }).eq('user_id', userId).select('lix_balance, hydration_history_unlocked_until').single();
      if (error) { showToast('⚠️ Erreur Supabase: ' + error.message, '#FF6B6B'); return; }
      if (data) {
        updateLixBalance(data.lix_balance);
        setHistoryUnlockedUntil(data.hydration_history_unlocked_until);
      }
      fetchWeeklyHydration();
      showToast('💎 Historique débloqué ! -100 Lix', '#00D984');
      try { var Vibration = require('react-native').Vibration; Vibration.vibrate([0, 30, 50, 30]); } catch(e) {}
    } catch(err) { showToast('⚠️ Erreur — réessayez', '#FF6B6B'); }
  };

  var unlockHistoryWithPower = async function() {
    if (!activeChar) return;
    var hydroPower = pagePowers.find(function(p) { return p.action_type === 'modal_inline' && p.redirect_page === 'accueil'; });
    if (!hydroPower || !hydroPower.unlocked) { showToast('🐬 Équipez Coral Dolphin Niv 2', '#4DA6FF'); return; }
    var result = await consumePower(hydroPower.power_key);
    if (result.success) {
      fetchWeeklyHydration();
      try { var Vibration = require('react-native').Vibration; Vibration.vibrate([0, 30, 50, 30]); } catch(e) {}
    }
  };

  var unlockStatsWithLix = async function() {
    if (realLixBalance < 200) { setLixAlert({ visible: true, missing: 200 - realLixBalance, type: 'stats' }); return; }
    try {
      var newBalance = realLixBalance - 200;
      var unlockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      var { data, error } = await supabase.from('users_profile').update({ lix_balance: newBalance, stats_unlocked_until: unlockUntil }).eq('user_id', userId).select('lix_balance, stats_unlocked_until').single();
      if (error) { console.warn('unlockStats update error:', error); showToast('⚠️ Erreur — réessayez', '#FF6B6B'); return; }
      if (data) { updateLixBalance(data.lix_balance); setStatsUnlockedUntil(data.stats_unlocked_until); }
      fetchWeeklyStats();
      try { var Vibration = require('react-native').Vibration; Vibration.vibrate([0, 30, 50, 30]); } catch(e) {}
    } catch(err) { console.warn('unlockStatsWithLix error:', err); showToast('⚠️ Erreur — réessayez', '#FF6B6B'); }
  };

  var fetchWeeklyStats = async function() {
    if (!userId) return;
    setStatsLoading(true);
    try {
      var days = [];
      for (var d = 6; d >= 0; d--) {
        var date = new Date(); date.setDate(date.getDate() - d);
        var dateStr = date.toISOString().split('T')[0];
        var dayName = JOURS_COURTS[date.getDay()];
        days.push({ date: dateStr, dayName: dayName, calories: 0, protein: 0, carbs: 0, fat: 0, activityMin: 0, activityKcal: 0, hydrationMl: 0, mood: null });
      }
      await Promise.all(days.map(function(dy) {
        return Promise.all([
          supabase.from('daily_summary').select('total_calories, total_protein, total_carbs, total_fat').eq('user_id', userId).eq('date', dy.date).single(),
          supabase.from('user_activities').select('duration_min, calories_burned').eq('user_id', userId).gte('performed_at', dy.date + 'T00:00:00').lt('performed_at', dy.date + 'T23:59:59'),
          supabase.rpc('get_daily_hydration', { p_user_id: userId, p_date: dy.date }),
          supabase.from('moods').select('mood_level').eq('user_id', userId).gte('created_at', dy.date + 'T00:00:00').lt('created_at', dy.date + 'T23:59:59').limit(1),
        ]).then(function(results) {
          var sumRes = results[0]; var actRes = results[1]; var hydRes = results[2]; var moodRes = results[3];
          if (sumRes.data) { dy.calories = Math.round(sumRes.data.total_calories || 0); dy.protein = Math.round(sumRes.data.total_protein || 0); dy.carbs = Math.round(sumRes.data.total_carbs || 0); dy.fat = Math.round(sumRes.data.total_fat || 0); }
          if (actRes.data) { dy.activityMin = actRes.data.reduce(function(s, a) { return s + (a.duration_min || 0); }, 0); dy.activityKcal = actRes.data.reduce(function(s, a) { return s + (a.calories_burned || 0); }, 0); }
          if (hydRes.data && hydRes.data.length > 0) { dy.hydrationMl = hydRes.data[0].total_effective_ml || 0; }
          if (moodRes.data && moodRes.data.length > 0) { dy.mood = moodRes.data[0].mood_level; }
        });
      }));
      setWeeklyStats(days);
    } catch(err) { console.warn('fetchWeeklyStats error:', err); }
    setStatsLoading(false);
  };

  var fetchDayHydrationLogs = async function(dateStr) {
    if (!userId) return;
    try {
      var { data } = await supabase.from('hydration_logs')
        .select('beverage_name, amount_ml, effective_ml, kcal, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', dateStr + 'T00:00:00').lt('logged_at', dateStr + 'T23:59:59')
        .order('logged_at', { ascending: true });
      setSelectedDayLogs(data || []);
    } catch(e) { console.warn('fetchDayLogs error:', e); setSelectedDayLogs([]); }
  };

  var loadDashboardFromSupabase = async function() {
    if (!userId) return;
    setIsLoadingDashboard(true);
    try {
      var today = new Date().toISOString().split('T')[0];
      var todayStart = today + 'T00:00:00';
      var [profileRes, summaryRes, mealsRes, moodRes, activitiesRes] = await Promise.all([
        supabase.from('users_profile').select('full_name, daily_calorie_target, lix_balance, energy, gender, hydration_history_unlocked_until, stats_unlocked_until').eq('user_id', userId).single(),
        supabase.from('daily_summary').select('total_calories').eq('user_id', userId).eq('date', today).single(),
        supabase.from('meals').select('food_name, calories, protein_g, carbs_g, fat_g, meal_time, image_url, source').eq('user_id', userId).order('meal_time', { ascending: false }).limit(1),
        supabase.from('moods').select('mood_level, weather').eq('user_id', userId).gte('created_at', todayStart).order('created_at', { ascending: false }).limit(1),
        supabase.from('user_activities').select('activity_id, duration_min, calories_burned, water_lost_ml, performed_at').eq('user_id', userId).gte('performed_at', todayStart).order('performed_at', { ascending: false }),
      ]);
      var profile = profileRes.data;
      if (profile) {
        setUserName(profile.full_name || ''); setRealDailyTarget(profile.daily_calorie_target || 2330);
        updateLixBalance(profile.lix_balance || 0); updateEnergy(profile.energy || 20);
        setRealGender(profile.gender === 'female' || profile.gender === 'femme' ? 'femme' : 'homme');
        setHistoryUnlockedUntil(profile.hydration_history_unlocked_until || null);
        setStatsUnlockedUntil(profile.stats_unlocked_until || null);
      }
      var summary = summaryRes.data;
      if (summary) setRealConsumed(Math.round(summary.total_calories || 0));
      var meals = mealsRes.data;
      if (meals && meals.length > 0) setLastMeal(meals[0]);
      var todayMood = moodRes.data;
      if (todayMood && todayMood.length > 0) { setCurrentMood(todayMood[0].mood_level); setMoodFilled(true); }
      var todayActivities = activitiesRes.data;
      if (todayActivities && todayActivities.length > 0) {
        setActivities(todayActivities.map(function(a) { return { name: 'activité', durationMin: a.duration_min || 0, intensity: 'modere', kcalBurned: a.calories_burned || 0, waterLostMl: a.water_lost_ml || 0 }; }));
      } else { setActivities([]); }
    } catch (err) { console.warn('Erreur chargement dashboard:', err); }
    setIsLoadingDashboard(false);
  };

  var loadPagePowers = async function() {
    if (!userId) return;
    try {
      var { data: collection } = await supabase.rpc('get_user_collection', { p_user_id: userId });
      var active = (collection || []).find(function(c) { return c.is_active; });
      if (!active) { setActiveChar(null); setPagePowers([]); return; }
      setActiveChar(active);
      var { data: powers } = await supabase.rpc('get_character_powers', { p_user_id: userId, p_slug: active.slug });
      setPagePowers((powers || []).filter(function(p) { return p.redirect_page === 'accueil'; }));
    } catch (e) { console.warn('Dashboard powers load error:', e); }
  };

  var consumePower = async function(powerKey) {
    try {
      var { data } = await supabase.rpc('use_character_power', { p_user_id: userId, p_power_key: powerKey });
      if (data?.success) {
        setActiveChar(function(prev) { return prev ? Object.assign({}, prev, { uses_remaining: data.uses_remaining }) : null; });
        return { success: true, uses_remaining: data.uses_remaining };
      }
      if (data?.error === 'No uses remaining') { showToast('⚡ Utilisations épuisées — recharge dans Caractères', '#FF6B6B'); }
      return { success: false, error: data?.error };
    } catch (e) { console.error('Consume power error:', e); return { success: false, error: 'network' }; }
  };

  var isUnlockedByLix = function(unlockedUntil) { return unlockedUntil && new Date(unlockedUntil) > new Date(); };
  var hasActivePower = function(actionType) { return pagePowers.some(function(p) { return p.action_type === actionType && p.unlocked; }); };
  var isHydrationHistoryUnlocked = function() { return isUnlockedByLix(historyUnlockedUntil) || hasActivePower('modal_inline'); };
  var isStatsUnlocked = function() { return isUnlockedByLix(statsUnlockedUntil) || hasActivePower('stats_report'); };

  var gender = realGender;
  var hydrationGoalBase = gender === 'homme' ? 2500 : 2000;
  var consumedTotal = realConsumed + (hydrationData.totalKcal || 0);
  var burnedExtra = activities.reduce(function(sum, a) { return sum + a.kcalBurned; }, 0);
  var burnedTotal = burnedExtra;
  var surplus = Math.max(0, consumedTotal - burnedExtra - DAILY_OBJECTIVE);
  var totalWaterLost = activities.reduce(function(sum, a) { return sum + (a.waterLostMl || 0); }, 0);
  var adjustedHydrationGoal = hydrationGoalBase + totalWaterLost;
  var sportWaterLoss = totalWaterLost;
  var sportAlert = sportWaterLoss > 0 ? '🏃 -' + sportWaterLoss + 'ml perdus — pensez à compenser' : null;

  useEffect(function() {
    if (userId) {
      loadDashboardFromSupabase();
      loadPagePowers();
      fetchDailyHydration().then(function(data) {
        setHydrationData(data);
        setHydrationMl(data.totalEffective || 0);
      });
    }
  }, [userId]);

  // Refresh all data when page gains focus (returning from Activity, Repas, etc.)
  useFocusEffect(useCallback(function() {
    if (userId) {
      refreshLixFromServer();
      loadDashboardFromSupabase();
      fetchDailyHydration().then(function(data) {
        setHydrationData(data);
        setHydrationMl(data.totalEffective || 0);
      });
    }
  }, [userId]));

  var vitalityDebounceRef = useRef(null);
  useEffect(function() {
    var newScore = calcVitalityScore();
    setVitalityScore(newScore);
    if (userId && vitalityDebounceRef.current) clearTimeout(vitalityDebounceRef.current);
    if (userId) {
      vitalityDebounceRef.current = setTimeout(function() {
        supabase.from('users_profile').update({ vitality_score: newScore }).eq('user_id', userId).then(function() {});
      }, 2000);
    }
    return function() { if (vitalityDebounceRef.current) clearTimeout(vitalityDebounceRef.current); };
  }, [realConsumed, hydrationMl, moodFilled, lastMeal, realDailyTarget, realGender, activities, userId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#1E2530' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E2530" />
      <MetallicBackground />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <DashboardHeader
          moodFilled={moodFilled} currentMood={currentMood}
          lixCount={realLixBalance} userEnergy={userEnergy}
          onMoodPress={function() { setShowMoodModal(true); }}
          onLixPress={function() { if (navigation) navigation.navigate('LixVerse'); }}
          onProfilePress={function() { if (navigation) navigation.navigate('Profile'); }}
          highlightMood={tooltipStep === 1}
        />

        <DashboardContent
          onHydrationPress={function() { setHydroModalVisible(true); }}
          hydrationMl={hydrationMl} hydrationGoal={adjustedHydrationGoal} gender={gender}
          totalWaterLost={totalWaterLost}
          burnedExtra={burnedExtra} sportAlert={sportAlert}
          consumedTotal={consumedTotal} burnedTotal={burnedTotal}
          scrollRef={scrollRef} dailyTarget={realDailyTarget} lastMeal={lastMeal}
          tooltipStep={tooltipStep} vitalityScore={vitalityScore}
          vitalityDetails={{
            consumed: realConsumed, target: realDailyTarget || 2100,
            hydroMl: hydrationMl, hydroGoal: realGender === 'femme' ? 2000 : 2500,
            activityMin: activities.reduce(function(s, a) { return s + (a.durationMin || 0); }, 0),
            moodFilled: moodFilled, lastMeal: lastMeal
          }}
          activeChar={activeChar} pagePowers={pagePowers}
          toggleStates={toggleStates} setToggleStates={setToggleStates}
          consumePower={consumePower} userName={userName}
          refreshing={refreshing} onRefresh={onRefresh}
          onAvatarPress={function() {}}
          onNavigate={function(tab) {
            var routes = { meals: 'Repas', activity: 'Activite', medicai: 'MedicAi', lixverse: 'LixVerse' };
            if (routes[tab] && navigation) navigation.navigate(routes[tab]);
          }}
          showToast={showToast}
          onOpenStats={async function() {
            if (isStatsUnlocked()) {
              navigation.navigate('MedicAi', { openSection: 'stats' });
            } else {
              await unlockStatsWithLix();
              if (realLixBalance >= 200) navigation.navigate('MedicAi', { openSection: 'stats' });
            }
          }}
        />
      </SafeAreaView>

      <HydrationModal
        visible={hydroModalVisible} onClose={function() { setHydroModalVisible(false); }}
        currentMl={hydrationMl} setCurrentMl={setHydrationMl}
        goalMl={adjustedHydrationGoal} gender={gender}
        hydroLogs={hydroLogs} setHydroLogs={setHydroLogs}
        onAddBeverage={function() { setShowBeverageModal(true); }}
        showResetConfirm={showResetConfirm} setShowResetConfirm={setShowResetConfirm}
        showHistoryLock={showHistoryLock} setShowHistoryLock={setShowHistoryLock}
        historyUnlocked={isHydrationHistoryUnlocked()}
        historyUnlockedUntil={historyUnlockedUntil} isUnlockedByLix={isUnlockedByLix}
        hasActivePower={hasActivePower} selectedDayLogs={selectedDayLogs}
        fetchDayHydrationLogs={fetchDayHydrationLogs}
        historyData={historyData} historyLoading={historyLoading}
        selectedHistoryDay={selectedHistoryDay} setSelectedHistoryDay={setSelectedHistoryDay}
        unlockHistoryWithLix={unlockHistoryWithLix} unlockHistoryWithPower={unlockHistoryWithPower}
        fetchWeeklyHydration={fetchWeeklyHydration} pagePowers={pagePowers} activeChar={activeChar}
      />

      <BeverageModal
        visible={showBeverageModal} onClose={function() { setShowBeverageModal(false); }}
        onBeverageAdded={function(effectiveMl, bevName, bevIcon, kcal) {
          setHydrationMl(function(prev) { return prev + effectiveMl; });
          var now = new Date();
          setHydroLogs(function(prev) { return prev.concat([{ time: pad2(now.getHours()) + ':' + pad2(now.getMinutes()), amount: effectiveMl, type: bevName, icon: bevIcon }]); });
          setBeverageToast({ name: bevName, icon: bevIcon, effectiveMl: effectiveMl, kcal: kcal });
          if (beverageToastTimerRef.current) clearTimeout(beverageToastTimerRef.current);
          beverageToastTimerRef.current = setTimeout(function() { setBeverageToast(null); }, 2500);
          fetchDailyHydration().then(setHydrationData);
        }}
      />

      <SurplusAlertModal
        visible={surplusAlertVisible} onClose={function() { setSurplusAlertVisible(false); }}
        surplus={surplus} onAddActivity={function() { if (navigation) navigation.navigate('Activite'); }}
      />

      <MoodModal
        visible={showMoodModal} onClose={function() { setShowMoodModal(false); }}
        onMoodSaved={function(moodResult, selectedWeather) { setCurrentMood(moodResult); setMoodFilled(true); }}
      />

      {beverageToast && (
        <View style={{ position: 'absolute', top: Platform.OS === 'android' ? 40 : 55, left: wp(16), right: wp(16), zIndex: 99999 }}>
          <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(14), padding: wp(12), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginRight: wp(8) }}>{beverageToast.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700' }}>{beverageToast.name} ajouté</Text>
              <Text style={{ color: '#8892A0', fontSize: fp(10) }}>+{beverageToast.effectiveMl}ml effectifs · {beverageToast.kcal} kcal</Text>
            </View>
          </View>
        </View>
      )}

      {toastMsg && (
        <View style={{ position: 'absolute', top: Platform.OS === 'android' ? 40 : 55, left: wp(16), right: wp(16), zIndex: 99998 }}>
          <View style={{ backgroundColor: (toastMsg.color || '#00D984') + '20', borderRadius: wp(12), padding: wp(10), borderWidth: 1, borderColor: (toastMsg.color || '#00D984') + '40', alignItems: 'center' }}>
            <Text style={{ color: toastMsg.color || '#00D984', fontSize: fp(12), fontWeight: '600' }}>{toastMsg.message}</Text>
          </View>
        </View>
      )}

      <Modal visible={lixAlert.visible} transparent animationType="fade" onRequestClose={function() { setLixAlert({ visible: false, missing: 0, type: '' }); }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
          <View style={{ backgroundColor: '#1E2530', borderRadius: 20, padding: 24, width: '100%', borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.3)', alignItems: 'center' }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>💎</Text>
            <Text style={{ color: '#EAEEF3', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>Solde insuffisant</Text>
            <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 }}>
              {'Il vous manque ' + lixAlert.missing + ' Lix pour débloquer cette fonctionnalité.'}
            </Text>
            <TouchableOpacity onPress={function() { setLixAlert({ visible: false, missing: 0, type: '' }); if (navigation) navigation.navigate('LixVerse'); }} activeOpacity={0.7}
              style={{ width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 8, backgroundColor: 'rgba(0,217,132,0.15)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.3)' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#00D984' }}>Obtenir des Lix</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={function() { setLixAlert({ visible: false, missing: 0, type: '' }); }} activeOpacity={0.7}
              style={{ width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TooltipOverlay tooltipStep={tooltipStep} setTooltipStep={setTooltipStepPersist} scrollRef={scrollRef} />

      <BottomTabs activeTab="home" onTabPress={function(key) {
        if (key === 'home') return;
        var routes = { meals: 'Repas', medicai: 'MedicAi', activity: 'Activite', lixverse: 'LixVerse' };
        if (routes[key] && navigation) navigation.navigate(routes[key]);
      }} />
    </View>
  );
}

function DashboardHeader({ moodFilled, currentMood, lixCount, onMoodPress, onLixPress, onProfilePress, highlightMood, userEnergy }) {
  var _dropdown = useState(false);
  var dropdownOpen = _dropdown[0]; var setDropdownOpen = _dropdown[1];
  var dropdownAnim = useRef(new RNAnimated.Value(0)).current;
  var toggleDropdown = function() {
    var toValue = dropdownOpen ? 0 : 1;
    RNAnimated.timing(dropdownAnim, { toValue: toValue, duration: 200, useNativeDriver: true }).start();
    setDropdownOpen(!dropdownOpen);
  };

  var shakeAnim = useRef(new RNAnimated.Value(0)).current;
  useEffect(function() {
    if (moodFilled) return;
    var shake = function() {
      RNAnimated.sequence([
        RNAnimated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    };
    shake();
    var interval = setInterval(shake, 3000);
    return function() { clearInterval(interval); };
  }, [moodFilled]);

  var rotate = shakeAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-6deg', '0deg', '6deg'] });
  var moodPulse = useRef(new RNAnimated.Value(0)).current;
  useEffect(function() {
    if (highlightMood) {
      var pulse = RNAnimated.loop(RNAnimated.sequence([
        RNAnimated.timing(moodPulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.timing(moodPulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));
      pulse.start();
      return function() { pulse.stop(); };
    }
  }, [highlightMood]);

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, overflow: 'visible' }}>
      <View style={{ flex: 0 }}>
        <Text style={{ fontSize: fp(20), fontWeight: '900', color: '#EAEEF3', letterSpacing: 1 }}>LIXUM</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 0, flexShrink: 0 }}>
        <TouchableOpacity onPress={onMoodPress} activeOpacity={0.7} style={{ position: 'relative', marginRight: 8 }}>
          <RNAnimated.View style={{
            transform: [
              { rotate: highlightMood ? '0deg' : rotate },
              { scale: highlightMood ? moodPulse.interpolate({ inputRange: [0, 1], outputRange: [1.3, 1.5] }) : 1 },
            ],
            opacity: highlightMood ? moodPulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) : 1,
          }}>
            <View style={{
              width: 38, height: 38, borderRadius: 19,
              borderWidth: highlightMood ? 3 : 2,
              borderColor: highlightMood ? '#FF8C42' : moodFilled ? '#00D984' : '#FF8C42',
              backgroundColor: highlightMood ? 'rgba(255,140,66,0.25)' : 'rgba(21,27,35,0.7)',
              justifyContent: 'center', alignItems: 'center',
              shadowColor: highlightMood ? '#FF8C42' : moodFilled ? '#00D984' : '#FF8C42',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: highlightMood ? 1 : 0.3,
              shadowRadius: highlightMood ? 20 : 6,
              elevation: highlightMood ? 15 : 4,
            }}>
              <MoodIcon tier={currentMood === 'excited' ? 3 : currentMood === 'happy' ? 2 : currentMood === 'chill' ? 1 : 0} size={24} active={true} />
            </View>
          </RNAnimated.View>
          {!moodFilled && (
            <View style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF8C42', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#1E2530' }}>
              <Text style={{ color: 'white', fontSize: 8, fontWeight: '800' }}>!</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleDropdown} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: '#4A4F55', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
          <LixGem size={14} />
          <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: fp(14), marginLeft: 4 }}>{lixCount}</Text>
          <Text style={{ color: '#888', fontSize: fp(10), marginLeft: 4 }}>▾</Text>
        </TouchableOpacity>
      </View>
      {dropdownOpen && (
        <TouchableOpacity activeOpacity={1} onPress={toggleDropdown} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: -500, zIndex: 998 }}>
          <RNAnimated.View style={{ position: 'absolute', top: 55, right: 14, backgroundColor: '#252A30', borderWidth: 1, borderColor: '#4A4F55', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, zIndex: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 10, opacity: dropdownAnim, transform: [{ translateY: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }] }}>
            <TouchableOpacity onPress={function() { toggleDropdown(); if (onLixPress) onLixPress(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
              <LixGem size={13} />
              <Text style={{ color: '#D4AF37', fontWeight: '800', fontSize: 16, marginLeft: 6 }}>{lixCount}</Text>
              <Text style={{ color: '#6B7280', fontSize: 12, marginLeft: 4 }}>Lix</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={function() { toggleDropdown(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
              <Svg width={13} height={13} viewBox="0 0 24 24">
                <Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill={userEnergy <= 5 ? '#FF6B6B' : '#FFB800'} />
              </Svg>
              <Text style={{ color: userEnergy <= 5 ? '#FF6B6B' : '#EAEEF3', fontWeight: '800', fontSize: 16, marginLeft: 6 }}>{userEnergy}</Text>
              <Text style={{ color: '#6B7280', fontSize: 12, marginLeft: 4 }}>énergie</Text>
            </TouchableOpacity>
            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(74,79,85,0.4)', marginVertical: 4 }} />
            <TouchableOpacity onPress={function() { toggleDropdown(); if (onProfilePress) onProfilePress(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#252A30', borderWidth: 1.5, borderColor: '#00D984', justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" fill="#8892A0" />
                </Svg>
                <View style={{ position: 'absolute', bottom: -1, right: -1, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#00D984', borderWidth: 1.5, borderColor: '#252A30' }} />
              </View>
              <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '600', marginLeft: 6, flex: 1 }}>Mon Profil</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>→</Text>
            </TouchableOpacity>
          </RNAnimated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}
