import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StatusBar, Platform,
  Animated as RNAnimated, TouchableOpacity, Image, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
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

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function DashboardPage({ navigation }) {
  const [realConsumed, setRealConsumed] = useState(0);
  const [realDailyTarget, setRealDailyTarget] = useState(2330);
  const [realLixBalance, setRealLixBalance] = useState(0);
  const [realGender, setRealGender] = useState('homme');
  const [lastMeal, setLastMeal] = useState(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEnergy, setUserEnergy] = useState(20);
  const [activities, setActivities] = useState([]);
  const [tooltipStep, setTooltipStep] = useState(1);
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
  var _showStatsModal = useState(false);
  var showStatsModal = _showStatsModal[0]; var setShowStatsModal = _showStatsModal[1];
  var _weeklyStats = useState(null);
  var weeklyStats = _weeklyStats[0]; var setWeeklyStats = _weeklyStats[1];
  var _statsLoading = useState(false);
  var statsLoading = _statsLoading[0]; var setStatsLoading = _statsLoading[1];
  var _statsUnlockedUntil = useState(null);
  var statsUnlockedUntil = _statsUnlockedUntil[0]; var setStatsUnlockedUntil = _statsUnlockedUntil[1];
  const [showBeverageModal, setShowBeverageModal] = useState(false);
  const [beverageToast, setBeverageToast] = useState(null);
  const [activeChar, setActiveChar] = useState(null);
  const [pagePowers, setPagePowers] = useState([]);
  const [toggleStates, setToggleStates] = useState({});

  var showToast = function(message, color) {
    setToastMsg({ message: message, color: color || '#00D984' });
    setTimeout(function() { setToastMsg(null); }, 2500);
  };

  const calcVitalityScore = () => {
    const OBJECTIVE = realDailyTarget || 2100;
    let score = 0;
    if (OBJECTIVE > 0 && realConsumed > 0) {
      const deviation = Math.abs(1 - realConsumed / OBJECTIVE);
      score += Math.max(0, 25 - Math.round(deviation * 83));
    }
    const hydroGoal = realGender === 'femme' ? 2000 : 2500;
    score += Math.round((Math.min((hydrationMl / hydroGoal) * 100, 100) / 100) * 25);
    score += 0;
    let regPts = 0;
    if (moodFilled) regPts += 8;
    if (lastMeal) regPts += 9;
    regPts += Math.min(8, 8);
    score += regPts;
    return Math.min(100, Math.max(0, score));
  };

  var fetchDailyHydration = async function() {
    try {
      var today = new Date().toISOString().split('T')[0];
      var { data, error } = await supabase.rpc('get_daily_hydration', { p_user_id: TEST_USER_ID, p_date: today });
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
    setHistoryLoading(true);
    try {
      var days = [];
      for (var d = 6; d >= 0; d--) {
        var date = new Date(); date.setDate(date.getDate() - d);
        var dateStr = date.toISOString().split('T')[0];
        var dayName = JOURS_COURTS[date.getDay()];
        days.push({ date: dateStr, dayName: dayName, totalMl: 0, goalMl: hydrationGoal });
      }
      for (var i = 0; i < days.length; i++) {
        try {
          var result = await supabase.rpc('get_daily_hydration', { p_user_id: TEST_USER_ID, p_date: days[i].date });
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
    if (realLixBalance < 100) { showToast('💎 Lix insuffisants — il vous faut 100 Lix', '#FF6B6B'); return; }
    try {
      var newBalance = realLixBalance - 100;
      var unlockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('users_profile').update({ lix_balance: newBalance, hydration_history_unlocked_until: unlockUntil }).eq('user_id', TEST_USER_ID);
      setRealLixBalance(newBalance); setHistoryUnlockedUntil(unlockUntil); fetchWeeklyHydration();
      try { var Vibration = require('react-native').Vibration; Vibration.vibrate([0, 30, 50, 30]); } catch(e) {}
    } catch(err) { console.warn('unlockHistoryWithLix error:', err); showToast('⚠️ Erreur — réessayez', '#FF6B6B'); }
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
    if (realLixBalance < 200) { showToast('💎 Lix insuffisants — il vous faut 200 Lix', '#FF6B6B'); return; }
    try {
      var newBalance = realLixBalance - 200;
      var unlockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('users_profile').update({ lix_balance: newBalance, stats_unlocked_until: unlockUntil }).eq('user_id', TEST_USER_ID);
      setRealLixBalance(newBalance); setStatsUnlockedUntil(unlockUntil); fetchWeeklyStats();
      try { var Vibration = require('react-native').Vibration; Vibration.vibrate([0, 30, 50, 30]); } catch(e) {}
    } catch(err) { console.warn('unlockStatsWithLix error:', err); showToast('⚠️ Erreur — réessayez', '#FF6B6B'); }
  };

  var fetchWeeklyStats = async function() {
    setStatsLoading(true);
    try {
      var days = [];
      for (var d = 6; d >= 0; d--) {
        var date = new Date(); date.setDate(date.getDate() - d);
        var dateStr = date.toISOString().split('T')[0];
        var dayName = JOURS_COURTS[date.getDay()];
        days.push({ date: dateStr, dayName: dayName, calories: 0, protein: 0, carbs: 0, fat: 0, activityMin: 0, activityKcal: 0, hydrationMl: 0, mood: null });
      }
      for (var i = 0; i < days.length; i++) {
        var dy = days[i];
        try { var sumRes = await supabase.from('daily_summary').select('total_calories, total_protein, total_carbs, total_fat').eq('user_id', TEST_USER_ID).eq('date', dy.date).single(); if (sumRes.data) { dy.calories = Math.round(sumRes.data.total_calories || 0); dy.protein = Math.round(sumRes.data.total_protein || 0); dy.carbs = Math.round(sumRes.data.total_carbs || 0); dy.fat = Math.round(sumRes.data.total_fat || 0); } } catch(e) {}
        try { var actRes = await supabase.from('user_activities').select('duration_min, calories_burned').eq('user_id', TEST_USER_ID).gte('performed_at', dy.date + 'T00:00:00').lt('performed_at', dy.date + 'T23:59:59'); if (actRes.data) { dy.activityMin = actRes.data.reduce(function(s, a) { return s + (a.duration_min || 0); }, 0); dy.activityKcal = actRes.data.reduce(function(s, a) { return s + (a.calories_burned || 0); }, 0); } } catch(e) {}
        try { var hydRes = await supabase.rpc('get_daily_hydration', { p_user_id: TEST_USER_ID, p_date: dy.date }); if (hydRes.data && hydRes.data.length > 0) { dy.hydrationMl = hydRes.data[0].total_effective_ml || 0; } } catch(e) {}
        try { var moodRes = await supabase.from('moods').select('mood_level').eq('user_id', TEST_USER_ID).gte('created_at', dy.date + 'T00:00:00').lt('created_at', dy.date + 'T23:59:59').limit(1); if (moodRes.data && moodRes.data.length > 0) { dy.mood = moodRes.data[0].mood_level; } } catch(e) {}
      }
      setWeeklyStats(days);
    } catch(err) { console.warn('fetchWeeklyStats error:', err); }
    setStatsLoading(false);
  };

  var fetchDayHydrationLogs = async function(dateStr) {
    try {
      var { data } = await supabase.from('hydration_logs')
        .select('beverage_name, amount_ml, effective_ml, kcal, logged_at')
        .eq('user_id', TEST_USER_ID)
        .gte('logged_at', dateStr + 'T00:00:00').lt('logged_at', dateStr + 'T23:59:59')
        .order('logged_at', { ascending: true });
      setSelectedDayLogs(data || []);
    } catch(e) { console.warn('fetchDayLogs error:', e); setSelectedDayLogs([]); }
  };

  var loadDashboardFromSupabase = async function() {
    setIsLoadingDashboard(true);
    try {
      var today = new Date().toISOString().split('T')[0];
      var { data: profile } = await supabase.from('users_profile').select('full_name, daily_calorie_target, lix_balance, energy, gender, hydration_history_unlocked_until, stats_unlocked_until').eq('user_id', TEST_USER_ID).single();
      if (profile) {
        setUserName(profile.full_name || ''); setRealDailyTarget(profile.daily_calorie_target || 2330);
        setRealLixBalance(profile.lix_balance || 0); setUserEnergy(profile.energy || 20);
        setRealGender(profile.gender === 'female' || profile.gender === 'femme' ? 'femme' : 'homme');
        setHistoryUnlockedUntil(profile.hydration_history_unlocked_until || null);
        setStatsUnlockedUntil(profile.stats_unlocked_until || null);
      }
      var { data: summary } = await supabase.from('daily_summary').select('total_calories').eq('user_id', TEST_USER_ID).eq('date', today).single();
      if (summary) setRealConsumed(Math.round(summary.total_calories || 0));
      var { data: meals } = await supabase.from('meals').select('food_name, calories, protein_g, carbs_g, fat_g, meal_time, image_url, source').eq('user_id', TEST_USER_ID).order('meal_time', { ascending: false }).limit(1);
      if (meals && meals.length > 0) setLastMeal(meals[0]);
      var todayStart = today + 'T00:00:00';
      var { data: todayMood } = await supabase.from('moods').select('mood_level, weather').eq('user_id', TEST_USER_ID).gte('created_at', todayStart).order('created_at', { ascending: false }).limit(1);
      if (todayMood && todayMood.length > 0) { setCurrentMood(todayMood[0].mood_level); setMoodFilled(true); }
      try {
        var { data: todayActivities } = await supabase.from('user_activities').select('activity_id, duration_min, calories_burned, water_lost_ml, performed_at').eq('user_id', TEST_USER_ID).gte('performed_at', today + 'T00:00:00').order('performed_at', { ascending: false });
        if (todayActivities && todayActivities.length > 0) {
          setActivities(todayActivities.map(function(a) { return { name: 'activité', durationMin: a.duration_min || 0, intensity: 'modere', kcalBurned: a.calories_burned || 0, waterLostMl: a.water_lost_ml || 0 }; }));
        } else { setActivities([]); }
      } catch(e) { setActivities([]); }
    } catch (err) { console.warn('Erreur chargement dashboard:', err); }
    setIsLoadingDashboard(false);
  };

  var loadPagePowers = async function() {
    try {
      var { data: collection } = await supabase.rpc('get_user_collection', { p_user_id: TEST_USER_ID });
      var active = (collection || []).find(function(c) { return c.is_active; });
      if (!active) { setActiveChar(null); setPagePowers([]); return; }
      setActiveChar(active);
      var { data: powers } = await supabase.rpc('get_character_powers', { p_user_id: TEST_USER_ID, p_slug: active.slug });
      setPagePowers((powers || []).filter(function(p) { return p.redirect_page === 'accueil'; }));
    } catch (e) { console.warn('Dashboard powers load error:', e); }
  };

  var consumePower = async function(powerKey) {
    try {
      var { data } = await supabase.rpc('use_character_power', { p_user_id: TEST_USER_ID, p_power_key: powerKey });
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
  var hydrationGoalValue = gender === 'homme' ? 2500 : 2000;
  var consumedTotal = realConsumed + (hydrationData.totalKcal || 0);
  var burnedExtra = activities.reduce(function(sum, a) { return sum + a.kcalBurned; }, 0);
  var burnedTotal = burnedExtra;
  var surplus = Math.max(0, consumedTotal - burnedExtra - DAILY_OBJECTIVE);
  var sportWaterLoss = activities.reduce(function(sum, a) { return sum + calculateWaterLoss(a.durationMin, a.intensity); }, 0);
  var sportAlert = sportWaterLoss > 0 ? '🏃 -' + sportWaterLoss + 'ml perdus — pensez à compenser' : null;

  useEffect(function() {
    loadDashboardFromSupabase();
    loadPagePowers();
    fetchDailyHydration().then(function(data) {
      setHydrationData(data);
      if (data.totalEffective > 0) setHydrationMl(data.totalEffective);
    });
  }, []);

  useEffect(function() {
    setVitalityScore(calcVitalityScore());
  }, [realConsumed, hydrationMl, moodFilled, lastMeal, realDailyTarget, realGender]);

  return (
    <View style={{ flex: 1, backgroundColor: '#1E2530' }}>
      <Text style={{ color: '#FFF', padding: 20 }}>DashboardPage loading...</Text>
    </View>
  );
}
