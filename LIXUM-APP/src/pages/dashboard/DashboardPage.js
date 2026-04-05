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
import { useAuth } from '../../config/AuthContext';

export default function DashboardPage({ navigation }) {
  var auth = useAuth(); var userId = auth.userId;
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
      for (var i = 0; i < days.length; i++) {
        try {
          var result = await supabase.rpc('get_daily_hydration', { p_user_id: userId, p_date: days[i].date });
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
      await supabase.from('users_profile').update({ lix_balance: newBalance, hydration_history_unlocked_until: unlockUntil }).eq('user_id', userId);
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
      await supabase.from('users_profile').update({ lix_balance: newBalance, stats_unlocked_until: unlockUntil }).eq('user_id', userId);
      setRealLixBalance(newBalance); setStatsUnlockedUntil(unlockUntil); fetchWeeklyStats();
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
      for (var i = 0; i < days.length; i++) {
        var dy = days[i];
        try { var sumRes = await supabase.from('daily_summary').select('total_calories, total_protein, total_carbs, total_fat').eq('user_id', userId).eq('date', dy.date).single(); if (sumRes.data) { dy.calories = Math.round(sumRes.data.total_calories || 0); dy.protein = Math.round(sumRes.data.total_protein || 0); dy.carbs = Math.round(sumRes.data.total_carbs || 0); dy.fat = Math.round(sumRes.data.total_fat || 0); } } catch(e) {}
        try { var actRes = await supabase.from('user_activities').select('duration_min, calories_burned').eq('user_id', userId).gte('performed_at', dy.date + 'T00:00:00').lt('performed_at', dy.date + 'T23:59:59'); if (actRes.data) { dy.activityMin = actRes.data.reduce(function(s, a) { return s + (a.duration_min || 0); }, 0); dy.activityKcal = actRes.data.reduce(function(s, a) { return s + (a.calories_burned || 0); }, 0); } } catch(e) {}
        try { var hydRes = await supabase.rpc('get_daily_hydration', { p_user_id: userId, p_date: dy.date }); if (hydRes.data && hydRes.data.length > 0) { dy.hydrationMl = hydRes.data[0].total_effective_ml || 0; } } catch(e) {}
        try { var moodRes = await supabase.from('moods').select('mood_level').eq('user_id', userId).gte('created_at', dy.date + 'T00:00:00').lt('created_at', dy.date + 'T23:59:59').limit(1); if (moodRes.data && moodRes.data.length > 0) { dy.mood = moodRes.data[0].mood_level; } } catch(e) {}
      }
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
      var { data: profile } = await supabase.from('users_profile').select('full_name, daily_calorie_target, lix_balance, energy, gender, hydration_history_unlocked_until, stats_unlocked_until').eq('user_id', userId).single();
      if (profile) {
        setUserName(profile.full_name || ''); setRealDailyTarget(profile.daily_calorie_target || 2330);
        setRealLixBalance(profile.lix_balance || 0); setUserEnergy(profile.energy || 20);
        setRealGender(profile.gender === 'female' || profile.gender === 'femme' ? 'femme' : 'homme');
        setHistoryUnlockedUntil(profile.hydration_history_unlocked_until || null);
        setStatsUnlockedUntil(profile.stats_unlocked_until || null);
      }
      var { data: summary } = await supabase.from('daily_summary').select('total_calories').eq('user_id', userId).eq('date', today).single();
      if (summary) setRealConsumed(Math.round(summary.total_calories || 0));
      var { data: meals } = await supabase.from('meals').select('food_name, calories, protein_g, carbs_g, fat_g, meal_time, image_url, source').eq('user_id', userId).order('meal_time', { ascending: false }).limit(1);
      if (meals && meals.length > 0) setLastMeal(meals[0]);
      var todayStart = today + 'T00:00:00';
      var { data: todayMood } = await supabase.from('moods').select('mood_level, weather').eq('user_id', userId).gte('created_at', todayStart).order('created_at', { ascending: false }).limit(1);
      if (todayMood && todayMood.length > 0) { setCurrentMood(todayMood[0].mood_level); setMoodFilled(true); }
      try {
        var { data: todayActivities } = await supabase.from('user_activities').select('activity_id, duration_min, calories_burned, water_lost_ml, performed_at').eq('user_id', userId).gte('performed_at', today + 'T00:00:00').order('performed_at', { ascending: false });
        if (todayActivities && todayActivities.length > 0) {
          setActivities(todayActivities.map(function(a) { return { name: 'activité', durationMin: a.duration_min || 0, intensity: 'modere', kcalBurned: a.calories_burned || 0, waterLostMl: a.water_lost_ml || 0 }; }));
        } else { setActivities([]); }
      } catch(e) { setActivities([]); }
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
  var hydrationGoalValue = gender === 'homme' ? 2500 : 2000;
  var consumedTotal = realConsumed + (hydrationData.totalKcal || 0);
  var burnedExtra = activities.reduce(function(sum, a) { return sum + a.kcalBurned; }, 0);
  var burnedTotal = burnedExtra;
  var surplus = Math.max(0, consumedTotal - burnedExtra - DAILY_OBJECTIVE);
  var sportWaterLoss = activities.reduce(function(sum, a) { return sum + calculateWaterLoss(a.durationMin, a.intensity); }, 0);
  var sportAlert = sportWaterLoss > 0 ? '🏃 -' + sportWaterLoss + 'ml perdus — pensez à compenser' : null;

  useEffect(function() {
    if (userId) {
      loadDashboardFromSupabase();
      loadPagePowers();
      fetchDailyHydration().then(function(data) {
        setHydrationData(data);
        if (data.totalEffective > 0) setHydrationMl(data.totalEffective);
      });
    }
  }, [userId]);

  useEffect(function() {
    setVitalityScore(calcVitalityScore());
  }, [realConsumed, hydrationMl, moodFilled, lastMeal, realDailyTarget, realGender]);

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
          highlightMood={tooltipStep === 1}
        />

        <DashboardContent
          onHydrationPress={function() { setHydroModalVisible(true); }}
          hydrationMl={hydrationMl} hydrationGoal={hydrationGoalValue} gender={gender}
          burnedExtra={burnedExtra} sportAlert={sportAlert}
          consumedTotal={consumedTotal} burnedTotal={burnedTotal}
          scrollRef={scrollRef} dailyTarget={realDailyTarget} lastMeal={lastMeal}
          tooltipStep={tooltipStep} vitalityScore={vitalityScore}
          activeChar={activeChar} pagePowers={pagePowers}
          toggleStates={toggleStates} setToggleStates={setToggleStates}
          consumePower={consumePower} userName={userName}
          onAvatarPress={function() {}}
          onNavigate={function(tab) {
            var routes = { meals: 'Repas', activity: 'Activite', medicai: 'MedicAi', lixverse: 'LixVerse' };
            if (routes[tab] && navigation) navigation.navigate(routes[tab]);
          }}
          showToast={showToast}
          onOpenStats={function() { setShowStatsModal(true); if (isStatsUnlocked()) fetchWeeklyStats(); }}
        />
      </SafeAreaView>

      <HydrationModal
        visible={hydroModalVisible} onClose={function() { setHydroModalVisible(false); }}
        currentMl={hydrationMl} setCurrentMl={setHydrationMl}
        goalMl={hydrationGoalValue} gender={gender}
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
          setTimeout(function() { setBeverageToast(null); }, 2500);
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

      <TooltipOverlay tooltipStep={tooltipStep} setTooltipStep={setTooltipStep} scrollRef={scrollRef} />

      <BottomTabs activeTab="home" onTabPress={function(key) {
        if (key === 'home') return;
        var routes = { meals: 'Repas', medicai: 'MedicAi', activity: 'Activite', lixverse: 'LixVerse' };
        if (routes[key] && navigation) navigation.navigate(routes[key]);
      }} />
    </View>
  );
}

function DashboardHeader({ moodFilled, currentMood, lixCount, onMoodPress, onLixPress, highlightMood, userEnergy }) {
  var _dropdown = useState(false);
  var dropdownOpen = _dropdown[0]; var setDropdownOpen = _dropdown[1];
  var dropdownAnim = useRef(new RNAnimated.Value(0)).current;
  var toggleDropdown = function() {
    var toValue = dropdownOpen ? 0 : 1;
    RNAnimated.timing(dropdownAnim, { toValue: toValue, duration: 200, useNativeDriver: false }).start();
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
          <RNAnimated.View style={{ position: 'absolute', top: 60, right: 14, backgroundColor: 'rgba(16, 20, 28, 0.97)', borderWidth: 1, borderColor: '#4A4F55', borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, zIndex: 999, minWidth: 180, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10, opacity: dropdownAnim, transform: [{ translateY: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }}>
            <TouchableOpacity onPress={function() { toggleDropdown(); if (onLixPress) onLixPress(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <LixGem size={14} />
              <Text style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>{lixCount}</Text>
              <Text style={{ color: '#888', fontSize: 14, marginLeft: 6 }}>Lix</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={function() { toggleDropdown(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill={userEnergy <= 5 ? '#FF6B6B' : '#FFB800'} />
              </Svg>
              <Text style={{ color: userEnergy <= 5 ? '#FF6B6B' : '#FFF', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>{userEnergy}</Text>
              <Text style={{ color: '#888', fontSize: 14, marginLeft: 6 }}>énergie</Text>
            </TouchableOpacity>
            <View style={{ borderTopWidth: 1, borderTopColor: '#4A4F55', marginVertical: 4 }} />
            <TouchableOpacity onPress={function() { toggleDropdown(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 18 }}>👤</Text>
              <Text style={{ color: '#FFF', fontSize: 14, marginLeft: 8, flex: 1 }}>Mon Profil</Text>
              <Text style={{ color: '#888', fontSize: 14 }}>→</Text>
            </TouchableOpacity>
          </RNAnimated.View>
        </TouchableOpacity>
      )}
    </View>
  );
}
