import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, TouchableOpacity,
  Animated, Platform, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../config/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';

// Composants partagés
import BottomTabs from '../../components/shared/NavBar';
import MetalCard from '../../components/shared/MetalCard';
import PageHeader from '../../components/shared/PageHeader';

// Composants Activité
import {
  TreeIcon, BenchIcon, BirdsIcon, PondIcon,
  SportIcon, SportCard, SportModal,
  WalkShoeAnimated, RunShoeAnimated,
} from './activityComponents';
import LiveTrackingScreen from './LiveTrackingScreen';
import PostReportModal from './PostReportModal';

// Constantes
import {
  ACTIVITY_DATA, getLang, calcCalories, calcWater,
  FOOD_ITEMS, getFoodEquivalent,
  OTHER_SPORTS, WALK_DISTANCE_MAP, WALK_LANDMARKS,
  RUN_FLAGS, TIME_STEPS, formatDuration, formatDistance,
} from './activityConstants';

const WALK_SCENE_W = 2000;
const WALK_MAX_DIST = 10000;
const WALK_CANVAS_H = 48;
const RUN_SCENE_W = 8400;
const RUN_MAX_DIST = 42000;
const RUN_CANVAS_H = 48;
const RUN_METERS_PER_PIXEL = RUN_MAX_DIST / RUN_SCENE_W;
const RUN_PIXELS_PER_METER = RUN_SCENE_W / RUN_MAX_DIST;

export default function ActivityPage({ navigation }) {
  var auth = useAuth(); var userId = auth.userId;
  var lixBalance = auth.lixBalance; var updateLixBalance = auth.updateLixBalance;
  var userEnergy = auth.energy; var refreshLixFromServer = auth.refreshLixFromServer;
  var _lc = useLang(); var lang = _lc.lang;
  var t = getLang(lang);

  // === ÉTATS ===
  const [todayActivities, setTodayActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('activity');

  // Walk UI
  const [walkScrollOffset, setWalkScrollOffset] = useState(0);
  const [walkCanvasW, setWalkCanvasW] = useState(280);
  const [walkRoundTrip, setWalkRoundTrip] = useState(false);
  const [walkSaved, setWalkSaved] = useState(false);
  const [walkGlow, setWalkGlow] = useState(false);
  const walkIntervalRef = useRef(null);
  const walkSpeedRef = useRef(2);
  const walkHoldStartRef = useRef(0);

  // Run UI
  const [runScrollOffset, setRunScrollOffset] = useState(0);
  const [runCanvasW, setRunCanvasW] = useState(280);
  const [runRoundTrip, setRunRoundTrip] = useState(false);
  const [runSaved, setRunSaved] = useState(false);
  const [runGlow, setRunGlow] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runMilestone, setRunMilestone] = useState(null);
  const runIntervalRef = useRef(null);
  const runSpeedRef = useRef(2);
  const runHoldStartRef = useRef(0);
  const isRunMovingRef = useRef(false);
  const runMilestoneTimerRef = useRef(null);
  const runMilestoneHitRef = useRef({});
  const runSaveTimerRef = useRef(null);
  const walkSaveTimerRef = useRef(null);

  // Sport modal
  const [modalSport, setModalSport] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Post-report
  const [showPostReport, setShowPostReport] = useState(false);
  const [lastActivity, setLastActivity] = useState(null);

  // Live GPS
  const [showLive, setShowLive] = useState(false);

  // Smart recommendations
  const [caloriesToBurn, setCaloriesToBurn] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(2000);
  const [totalEaten, setTotalEaten] = useState(0);
  const [totalBurnedActivities, setTotalBurnedActivities] = useState(0);
  const [userMood, setUserMood] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [lixRewardedToday, setLixRewardedToday] = useState(false);

  // Pouvoirs caractères
  const [activeChar, setActiveChar] = useState(null);
  const [pagePowers, setPagePowers] = useState([]);
  const [hookResults, setHookResults] = useState({});
  const [userNameAvatar, setUserNameAvatar] = useState('');
  // lixBalance and userEnergy from AuthContext
  var _weight = useState(70); var userWeight = _weight[0]; var setUserWeight = _weight[1];

  // Shoe animation
  const shoeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shoeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(shoeAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // === FONCTIONS DONNÉES ===

  const generateRecommendation = (toBurn, mood, weight) => {
    if (toBurn <= 0) {
      setRecommendation({
        type: 'maintain', emoji: '✅',
        title: t.inObjective,
        subtitle: t.walkKeeps,
        activity: t.walk, duration: '15 min', distance: '1 km', color: '#00D984',
      });
      return;
    }

    const walkHours = toBurn / (ACTIVITY_DATA.marche.met * weight);
    const walkMin = Math.ceil(walkHours * 60);
    const walkKm = (walkMin * 5 / 60).toFixed(1);
    const runHours = toBurn / (ACTIVITY_DATA.course.met * weight);
    const runMin = Math.ceil(runHours * 60);
    const runKm = (runMin * 8 / 60).toFixed(1);

    let preferActivity = 'both';
    if (mood) {
      if (mood === 'sad' || mood === 'chill') preferActivity = 'walk';
      if (mood === 'happy' || mood === 'excited') preferActivity = 'run';
    }

    if (preferActivity === 'walk' || (preferActivity === 'both' && toBurn < 150)) {
      setRecommendation({
        type: 'burn', emoji: '🚶',
        title: toBurn + ' ' + t.toCompensate,
        subtitle: t.walk + ' ' + walkMin + ' min (\u2248' + walkKm + ' km)',
        activity: t.walk, duration: walkMin + ' min', distance: walkKm + ' km', color: '#FF8C42',
      });
    } else if (preferActivity === 'run') {
      setRecommendation({
        type: 'burn', emoji: '🏃',
        title: toBurn + ' ' + t.toCompensate,
        subtitle: t.run + ' ' + runMin + ' min (\u2248' + runKm + ' km)',
        activity: t.run, duration: runMin + ' min', distance: runKm + ' km', color: '#FF8C42',
      });
    } else {
      setRecommendation({
        type: 'burn', emoji: '🔥',
        title: toBurn + ' ' + t.toCompensate,
        subtitle: t.walk + ' ' + walkMin + ' min ou ' + t.run + ' ' + runMin + ' min',
        activity: t.walk + ' / ' + t.run, duration: walkMin + ' / ' + runMin + ' min', distance: walkKm + ' / ' + runKm + ' km', color: '#FF8C42',
      });
    }
  };

  const fetchSmartData = async () => {
    if (!userId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: profile } = await supabase
        .from('users_profile')
        .select('daily_calorie_target, current_mood, weight')
        .eq('user_id', userId)
        .maybeSingle();

      const target = profile?.daily_calorie_target || 2000;
      const mood = profile?.current_mood || null;
      const weight = profile?.weight || 70;
      setUserWeight(weight);
      setDailyTarget(target);
      setUserMood(mood);

      const { data: summary } = await supabase
        .from('daily_summary')
        .select('total_calories, total_calories_burned')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      const eaten = summary?.total_calories || 0;
      const burned = summary?.total_calories_burned || 0;
      setTotalEaten(eaten);
      setTotalBurnedActivities(burned);

      const balance = eaten - burned - target;
      const toBurn = balance > 0 ? balance : 0;
      setCaloriesToBurn(toBurn);
      generateRecommendation(toBurn, mood, weight);
    } catch (e) {
      console.warn('Smart data fetch error:', e);
    }
  };

  const loadTodayActivities = async () => {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: false });
    if (data) setTodayActivities(data);
  };

  const fetchWeeklyMinutes = async () => {
    if (!userId) return;
    try {
      var now = new Date();
      var dayOfWeek = now.getDay();
      var monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      // Try activities table first (main table), fallback to user_activities
      var { data, error } = await supabase
        .from('activities')
        .select('duration_minutes')
        .eq('user_id', userId)
        .gte('created_at', monday.toISOString());
      if (error || !data) {
        var res2 = await supabase
          .from('user_activities')
          .select('duration_minutes, duration_min')
          .eq('user_id', userId)
          .gte('performed_at', monday.toISOString());
        data = res2.data || [];
      }
      var total = (data || []).reduce(function(sum, a) { return sum + (a.duration_minutes || a.duration_min || 0); }, 0);
      setWeeklyMinutes(total);
    } catch (e) {
      console.warn('Weekly minutes error:', e);
    }
  };

  // Init
  useEffect(() => {
    if (userId) {
      loadTodayActivities();
      fetchSmartData();
      fetchWeeklyMinutes();
      loadPagePowers();
      (async () => {
        try {
          const { data: profile } = await supabase.from('users_profile').select('full_name, lix_balance, weight').eq('user_id', userId).maybeSingle();
          if (profile) {
            setUserNameAvatar(profile.full_name || '');
            updateLixBalance(profile.lix_balance || 0);
            if (profile.weight) setUserWeight(profile.weight);
          }
        } catch (e) {}
      })();
      (async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const { data } = await supabase.from('user_activities').select('id').eq('user_id', userId).gte('created_at', today + 'T00:00:00').limit(1);
          if (data && data.length > 0) setLixRewardedToday(true);
        } catch (e) {}
      })();
    }
  }, [userId]);

  // Refresh Lix balance when page gains focus
  useFocusEffect(useCallback(function() {
    if (userId) refreshLixFromServer();
  }, [userId, refreshLixFromServer]));

  // === FONCTIONS POUVOIRS + SAVE ===

  const ACTIVITY_PAGE = 'activite';

  const loadPagePowers = async () => {
    if (!userId) return;
    try {
      const { data: collection } = await supabase
        .rpc('get_user_collection', { p_user_id: userId });
      const active = (collection || []).find(c => c.is_active);
      if (!active) { setActiveChar(null); setPagePowers([]); return; }
      setActiveChar(active);
      const { data: powers } = await supabase
        .rpc('get_character_powers', { p_user_id: userId, p_slug: active.slug });
      setPagePowers((powers || []).filter(p => p.redirect_page === ACTIVITY_PAGE && p.unlocked));
    } catch (e) {
      console.warn('Page powers load error:', e);
    }
  };

  const consumePower = async (powerKey) => {
    try {
      const { data } = await supabase.rpc('use_character_power', {
        p_user_id: userId, p_power_key: powerKey,
      });
      if (data?.success) {
        setActiveChar(prev => prev ? { ...prev, uses_remaining: data.uses_remaining } : null);
        return { success: true, uses_remaining: data.uses_remaining };
      }
      if (data?.error === 'No uses remaining') {
        Alert.alert('⚡ Utilisations épuisées', 'Recharge ton ' + (activeChar?.name || 'personnage') + ' dans l\'onglet Caractères.');
      }
      return { success: false, error: data?.error };
    } catch (e) {
      return { success: false, error: 'network' };
    }
  };

  const getPowerByType = (actionType) => {
    return pagePowers.filter(p => p.action_type === actionType).sort((a, b) => (b.level_required || 0) - (a.level_required || 0))[0] || null;
  };

  const extractMultiplier = (power) => {
    if (!power?.redirect_filter) return 1.0;
    if (power.redirect_filter.includes('30')) return 1.30;
    if (power.redirect_filter.includes('20')) return 1.20;
    if (power.redirect_filter.includes('10')) return 1.10;
    return 1.0;
  };

  const runPostSaveHooks = async (activityType, caloriesBurned, durationMin) => {
    const results = {};
    for (const power of pagePowers) {
      if (power.action_type === 'redirect_with_boost' && activeChar?.uses_remaining > 0) {
        const consumed = await consumePower(power.power_key);
        if (consumed.success) {
          const multiplier = extractMultiplier(power);
          const baseXP = Math.round(caloriesBurned);
          const bonusXP = Math.round(baseXP * (multiplier - 1));
          results.xp_boost = {
            type: 'xp_boost', icon: power.icon || '🐯', char_name: activeChar?.name,
            multiplier, percentage: Math.round((multiplier - 1) * 100),
            base_xp: baseXP, bonus_xp: bonusXP, total_xp: baseXP + bonusXP,
            uses_remaining: consumed.uses_remaining,
          };
        }
      }
    }
    setHookResults(results);
    loadPagePowers();
    return results;
  };

  const saveActivity = async (activityType, durationMin, caloriesBurned, intensity, waterLost) => {
    const actData = ACTIVITY_DATA[activityType];
    if (!actData) return false;
    try {
      const { error } = await supabase.rpc('add_user_activity', {
        p_user_id: userId,
        p_name: actData.label, p_type: activityType,
        p_duration_minutes: Math.round(durationMin),
        p_calories_burned: Math.round(caloriesBurned),
        p_intensity: intensity || 'modere',
        p_water_lost_ml: Math.round(waterLost),
      });
      if (error) { alert('Erreur : ' + error.message); return false; }
      if (pagePowers.length > 0) { await runPostSaveHooks(activityType, caloriesBurned, durationMin); } else { setHookResults({}); }
      await loadTodayActivities();
      fetchSmartData();
      if (!lixRewardedToday) setLixRewardedToday(true);
      return true;
    } catch (e) {
      alert('Erreur réseau.');
      return false;
    }
  };

  const deleteActivity = async (activityId) => {
    try {
      const { error } = await supabase.rpc('delete_user_activity', {
        p_activity_id: activityId, p_user_id: userId,
      });
      if (error) { alert('Erreur suppression : ' + error.message); return; }
      await loadTodayActivities();
    } catch (e) {
      console.error('Delete activity error:', e);
    }
  };

  // === FONCTIONS UI ===

  const handleTabPress = (key) => {
    if (key === 'activity') return;
    const routes = { home: 'Accueil', meals: 'Repas', medicai: 'MedicAi', activity: 'Activite', lixverse: 'LixVerse' };
    if (routes[key] && navigation) navigation.navigate(routes[key]);
  };

  // Walk computed values
  const walkMaxS = WALK_SCENE_W - walkCanvasW;
  const walkProg = walkMaxS > 0 ? walkScrollOffset / walkMaxS : 0;
  const walkDistM = walkProg * WALK_MAX_DIST;
  const walkMul = walkRoundTrip ? 2 : 1;
  const walkDurMin = (walkDistM / 5000) * 60;
  var walkCal = calcCalories(ACTIVITY_DATA.marche.met, userWeight, walkDurMin * walkMul, 'modere');
  var walkWater = calcWater(ACTIVITY_DATA.marche.water_per_hour_ml, walkDurMin * walkMul, 'modere');
  const walkDistFinal = walkDistM * walkMul;
  const walkDistStr = walkDistFinal < 1000 ? Math.round(walkDistFinal) + ' m' : (Math.round(walkDistFinal / 100) / 10) + ' km';
  const walkDurStr = (function() { var m = Math.round(walkDurMin * walkMul); return m < 60 ? m + ' min' : (Math.round(m / 6) / 10) + ' h'; })();

  // Run computed values
  const runMaxS = RUN_SCENE_W - runCanvasW;
  const runProg = runMaxS > 0 ? runScrollOffset / runMaxS : 0;
  var runDistM = (runScrollOffset * RUN_METERS_PER_PIXEL) || 0;
  const runMul = runRoundTrip ? 2 : 1;
  var runDistKm = ((runDistM * runMul) / 1000) || 0;
  var runDuration = Math.round((runDistKm / 8) * 60) || 0;
  var runCalories = calcCalories(ACTIVITY_DATA.course.met, userWeight || 70, runDuration, 'modere') || 0;
  var runWater = calcWater(ACTIVITY_DATA.course.water_per_hour_ml || 900, runDuration, 'modere') || 0;
  const runDistFinal = runDistM * runMul;
  const runDistStr = runDistFinal < 1000 ? Math.round(runDistFinal) + ' m' : (Math.round(runDistFinal / 100) / 10) + ' km';
  const runDurStr = (function() { var m = Math.round(runDuration); return m < 60 ? m + ' min' : (Math.round(m / 6) / 10) + ' h'; })();

  // Day totals
  const totalCalories = todayActivities.reduce((s, a) => s + (a.calories_burned || 0), 0);
  const totalDuration = todayActivities.reduce((s, a) => s + (a.duration_minutes || 0), 0);
  const totalWater = todayActivities.reduce((s, a) => s + (a.water_lost_ml || 0), 0);
  const todayDateStr = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' });

  // Walk knob
  const startWalkMoving = (direction) => {
    setWalkGlow(true);
    walkHoldStartRef.current = Date.now();
    walkSpeedRef.current = 2;
    walkIntervalRef.current = setInterval(() => {
      const holdDuration = Date.now() - walkHoldStartRef.current;
      if (holdDuration > 3000) walkSpeedRef.current = 16;
      else if (holdDuration > 2000) walkSpeedRef.current = 10;
      else if (holdDuration > 1000) walkSpeedRef.current = 6;
      else if (holdDuration > 500) walkSpeedRef.current = 4;
      else walkSpeedRef.current = 2;
      setWalkScrollOffset(prev => Math.max(0, Math.min(prev + direction * walkSpeedRef.current, WALK_SCENE_W - walkCanvasW)));
    }, 50);
  };
  const stopWalkMoving = () => {
    setWalkGlow(false);
    if (walkIntervalRef.current) { clearInterval(walkIntervalRef.current); walkIntervalRef.current = null; }
  };
  useEffect(() => { return () => { if (walkIntervalRef.current) clearInterval(walkIntervalRef.current); }; }, []);

  // Run knob
  const startRunMoving = (direction) => {
    setRunGlow(true);
    runHoldStartRef.current = Date.now();
    runSpeedRef.current = 2;
    isRunMovingRef.current = true;
    setIsRunning(true);
    runIntervalRef.current = setInterval(() => {
      const holdDuration = Date.now() - runHoldStartRef.current;
      if (holdDuration > 3000) runSpeedRef.current = 16;
      else if (holdDuration > 2000) runSpeedRef.current = 10;
      else if (holdDuration > 1000) runSpeedRef.current = 6;
      else if (holdDuration > 500) runSpeedRef.current = 4;
      else runSpeedRef.current = 2;
      setRunScrollOffset(prev => Math.max(0, Math.min(prev + direction * runSpeedRef.current, RUN_SCENE_W - runCanvasW)));
    }, 50);
  };
  const stopRunMoving = () => {
    setRunGlow(false);
    isRunMovingRef.current = false;
    setIsRunning(false);
    if (runIntervalRef.current) { clearInterval(runIntervalRef.current); runIntervalRef.current = null; }
  };
  useEffect(() => { return () => { if (runIntervalRef.current) clearInterval(runIntervalRef.current); }; }, []);
  useEffect(() => { return () => { if (runMilestoneTimerRef.current) clearTimeout(runMilestoneTimerRef.current); if (runSaveTimerRef.current) clearTimeout(runSaveTimerRef.current); if (walkSaveTimerRef.current) clearTimeout(walkSaveTimerRef.current); }; }, []);

  // Run milestone detection
  useEffect(() => {
    const milestones = [500, 1000, 2000, 5000, 10000, 21000];
    milestones.forEach(m => {
      if (runDistM >= m && runDistM < m + 50 && !runMilestoneHitRef.current[m]) {
        runMilestoneHitRef.current[m] = true;
        setRunMilestone(m);
        if (runMilestoneTimerRef.current) clearTimeout(runMilestoneTimerRef.current);
        runMilestoneTimerRef.current = setTimeout(() => setRunMilestone(null), 3000);
      }
    });
  }, [runScrollOffset]);

  // Handlers
  const handleAddRun = async () => {
    if (runCalories === 0) return;
    const ok = await saveActivity('course', runDuration, runCalories, 'modere', runWater);
    if (ok) {
      setRunSaved(true);
      setLastActivity({ type: 'run', name: t.run, distance: runDistStr, duration: runDuration, kcal: runCalories, water: runWater, speed: null });
      setShowPostReport(true);
      fetchWeeklyMinutes();
      if (runSaveTimerRef.current) clearTimeout(runSaveTimerRef.current);
      runSaveTimerRef.current = setTimeout(() => { setRunSaved(false); setRunScrollOffset(0); runMilestoneHitRef.current = {}; }, 1500);
    }
  };

  const handleSportSave = async (sportKey, duration, calories, intensity, waterLost) => {
    const ok = await saveActivity(sportKey, duration, calories, intensity, waterLost);
    if (ok) {
      setModalVisible(false);
      setLastActivity({ type: 'other', name: ACTIVITY_DATA[sportKey].label, distance: null, duration: duration, kcal: calories, water: null, speed: null });
      setShowPostReport(true);
      fetchWeeklyMinutes();
    }
  };

  const handleDeleteActivity = (activity) => {
    Alert.alert(t.delete, t.deleteConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => deleteActivity(activity.id) },
    ]);
  };

  // === JSX ===

  return (
    <LinearGradient
      colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 55 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>

          {/* Header */}
          <PageHeader
            title="MES ACTIVITÉS"
            lixBalance={lixBalance}
            userEnergy={userEnergy}
            onLixPress={function() { if (navigation) navigation.navigate('LixVerse'); }}
            onProfilePress={function() { if (navigation) navigation.navigate('Profile'); }}
          />

          {/* Power banners */}
          {pagePowers.length > 0 && activeChar && (
            <View style={{ marginHorizontal: wp(16), marginBottom: wp(4), gap: wp(4) }}>
              {pagePowers.map(power => {
                if (power.action_type === 'redirect_with_boost') {
                  const pct = Math.round((extractMultiplier(power) - 1) * 100);
                  return (
                    <View key={power.power_key} style={{
                      flexDirection: 'row', alignItems: 'center',
                      backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: wp(12),
                      borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', padding: wp(8),
                    }}>
                      <View style={{
                        width: wp(32), height: wp(32), borderRadius: wp(16),
                        backgroundColor: 'rgba(212,175,55,0.1)', justifyContent: 'center', alignItems: 'center',
                        marginRight: wp(8), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                      }}>
                        <Text style={{ fontSize: fp(16) }}>{power.icon || '🐯'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>{activeChar.name}</Text>
                        <Text style={{ color: '#8892A0', fontSize: fp(8), marginTop: wp(1) }}>+{pct}% {t.perActivity}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: '#D4AF37', fontSize: fp(12), fontWeight: '800' }}>{activeChar.uses_remaining}/{activeChar.max_uses_per_cycle || 10}</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(7) }}>{t.uses}</Text>
                      </View>
                    </View>
                  );
                }
                return null;
              })}
            </View>
          )}

          {/* Day summary */}
          <View style={{ marginHorizontal: wp(16), marginTop: wp(8), marginBottom: 16 }}>
          <View style={{ borderRadius: 16, borderWidth: 1.5, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D', borderRightColor: '#3E4855', borderBottomColor: '#2A303B', backgroundColor: '#2A303B', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}>
          <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{ borderRadius: 14, padding: wp(10) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(8) }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: fp(9), color: '#9CA3AF', fontWeight: '600', marginBottom: wp(4) }}>{t.burned}</Text>
                <Text style={{ fontSize: fp(22), fontWeight: '900', color: '#FF8C42' }}>{totalCalories}</Text>
                <Text style={{ fontSize: fp(8), color: '#6B7280' }}>kcal</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(74,79,85,0.4)', marginHorizontal: wp(4) }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: fp(9), color: '#9CA3AF', fontWeight: '600', marginBottom: wp(4) }}>{t.toBurn}</Text>
                <Text style={{ fontSize: fp(22), fontWeight: '900', color: caloriesToBurn > 0 ? '#FF6B6B' : '#00D984' }}>{caloriesToBurn}</Text>
                <Text style={{ fontSize: fp(8), color: '#6B7280' }}>kcal</Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(74,79,85,0.3)', marginBottom: wp(6) }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginLeft: wp(6) }}>
                  <Text style={{ fontSize: fp(7), color: '#6B7280' }}>{t.time}</Text>
                  <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFFFFF' }}>{formatDuration(totalDuration)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginLeft: wp(6) }}>
                  <Text style={{ fontSize: fp(7), color: '#6B7280' }}>{t.waterLost}</Text>
                  <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#4DA6FF' }}>{totalWater} ml</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
          </View>
          </View>

          {/* OMS weekly */}
          <View style={{ marginHorizontal: wp(16), marginBottom: 16 }}>
          <View style={{ borderRadius: 16, borderWidth: 1.5, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D', borderRightColor: '#3E4855', borderBottomColor: '#2A303B', backgroundColor: '#2A303B' }}>
          <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{
            borderRadius: 14, paddingHorizontal: wp(10), paddingVertical: wp(6),
            flexDirection: 'row', alignItems: 'center',
          }}>
            <View style={{ width: wp(32), height: wp(32), marginRight: wp(8) }}>
              <Svg width={wp(32)} height={wp(32)} viewBox="0 0 32 32">
                <Circle cx="16" cy="16" r="13" stroke="rgba(74,79,85,0.3)" strokeWidth="3" fill="none" />
                <Circle cx="16" cy="16" r="13"
                  stroke={weeklyMinutes >= 150 ? '#00D984' : '#FF8C42'} strokeWidth="3" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 13}`}
                  strokeDashoffset={`${2 * Math.PI * 13 * (1 - Math.min(weeklyMinutes / 150, 1))}`}
                  transform="rotate(-90 16 16)"
                />
              </Svg>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: fp(8), fontWeight: '800', color: weeklyMinutes >= 150 ? '#00D984' : '#FFFFFF' }}>
                  {Math.min(Math.round((weeklyMinutes / 150) * 100), 100)}%
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: fp(14), fontWeight: '800', color: weeklyMinutes >= 150 ? '#00D984' : '#FFFFFF' }}>{weeklyMinutes}</Text>
                <Text style={{ fontSize: fp(9), color: '#6B7280', marginLeft: wp(3) }}>/ 150 min</Text>
              </View>
              <Text style={{ fontSize: fp(7), color: '#6B7280', marginTop: wp(1) }}>{t.weeklyObj}</Text>
            </View>
            {weeklyMinutes >= 150 && <Text style={{ fontSize: fp(16) }}>🏅</Text>}
          </LinearGradient>
          </View>
          </View>

          {/* ═══ MARCHE — SIDE-SCROLL ═══ */}
          <MetalCard style={{
            marginHorizontal: wp(16), marginBottom: 16, borderRadius: wp(14), borderWidth: 0.5,
            borderColor: walkGlow ? 'rgba(0,217,132,0.5)' : 'rgba(74,79,85,0.3)',
          }}>
            {/* Header row: titre + stats alignés */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
              <View style={{ width: 3, height: 18, borderRadius: 1.5, backgroundColor: '#00D984', marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontSize: fp(14), fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{t.walk}</Text>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(8) }}>
                <Text style={{ fontSize: fp(9), color: '#FF6B6B', fontWeight: '600' }}>📍{walkDistStr}</Text>
                <Text style={{ fontSize: fp(9), color: '#FF8C42', fontWeight: '600' }}>🔥{walkCal}kcal</Text>
                <Text style={{ fontSize: fp(9), color: '#4DA6FF', fontWeight: '600' }}>💧{walkWater}ml</Text>
              </View>
            </View>

            {/* Canvas SVG */}
            <View
              style={{ position: 'relative', height: WALK_CANVAS_H, borderRadius: wp(10), overflow: 'hidden', backgroundColor: 'rgba(0,217,132,0.03)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.08)' }}
              onLayout={(e) => setWalkCanvasW(e.nativeEvent.layout.width)}
            >
              <Svg width={walkCanvasW} height={WALK_CANVAS_H} viewBox={`${walkScrollOffset} 0 ${walkCanvasW} ${WALK_CANVAS_H}`}>
                <Defs>
                  <SvgLinearGradient id="wSkyGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#87CEEB" stopOpacity={0.9} />
                    <Stop offset="40%" stopColor="#B0E0FF" stopOpacity={0.7} />
                    <Stop offset="100%" stopColor="#E8F5E9" stopOpacity={0.3} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="wGrassGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#4CAF50" stopOpacity={0.4} />
                    <Stop offset="100%" stopColor="#2E7D32" stopOpacity={0.6} />
                  </SvgLinearGradient>
                  <SvgLinearGradient id="wPathGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#D7CCC8" stopOpacity={0.3} />
                    <Stop offset="100%" stopColor="#A1887F" stopOpacity={0.2} />
                  </SvgLinearGradient>
                </Defs>
                {(function() {
                  var scW = WALK_SCENE_W;
                  var scH = WALK_CANVAS_H;
                  var groundY = scH * 0.60;
                  var pathY = scH * 0.58;
                  return (
                    <G>
                      <Rect x={0} y={0} width={scW} height={groundY} fill="url(#wSkyGrad)" />
                      <Rect x={0} y={groundY} width={scW} height={scH - groundY} fill="url(#wGrassGrad)" />
                      <Path d={`M0 ${pathY + 5} Q500 ${pathY - 2} 1000 ${pathY + 3} Q1500 ${pathY - 1} ${scW} ${pathY + 5}`}
                        fill="none" stroke="url(#wPathGrad)" strokeWidth={18} strokeLinecap="round" />
                      <TreeIcon x={440} y={pathY - 15} passed={walkScrollOffset > 300} />
                      <BenchIcon x={840} y={pathY} />
                      <BirdsIcon x={1300} y={pathY - 20} passed={walkProg > 0.65} />
                      <PondIcon x={1850} y={pathY - 5} />
                    </G>
                  );
                })()}
              </Svg>

              <LinearGradient colors={['#252A30', 'rgba(37,42,48,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30 }} />
              <LinearGradient colors={['rgba(37,42,48,0)', '#252A30']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30 }} />
            </View>

            {/* Controls */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(4), paddingVertical: wp(4), marginTop: wp(4) }}>
              <TouchableOpacity onPress={() => setWalkRoundTrip(!walkRoundTrip)} style={{
                backgroundColor: walkRoundTrip ? 'rgba(0,217,132,0.1)' : 'transparent',
                borderRadius: wp(6), borderWidth: 0.5,
                borderColor: walkRoundTrip ? 'rgba(0,217,132,0.3)' : 'rgba(74,79,85,0.4)',
                paddingHorizontal: wp(5), paddingVertical: wp(3),
              }}>
                <Text style={{ fontSize: fp(7), color: walkRoundTrip ? '#00D984' : '#6B7280' }}>
                  {walkRoundTrip ? '↔ ' + t.roundTripX2 : '↔ ' + t.roundTrip}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(4) }}>
                <Pressable onPressIn={() => startWalkMoving(-1)} onPressOut={stopWalkMoving}
                  style={({ pressed }) => ({
                    width: wp(36), height: wp(36), borderRadius: wp(18),
                    backgroundColor: pressed ? '#2A303B' : '#1A1D22',
                    borderWidth: 1.5, borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.12)',
                    alignItems: 'center', justifyContent: 'center',
                  })}
                >
                  <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24">
                    <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
                <Text style={{ fontSize: fp(7), color: '#555E6C', fontWeight: '600' }}>{t.hold}</Text>
                <Pressable onPressIn={() => startWalkMoving(1)} onPressOut={stopWalkMoving}
                  style={({ pressed }) => ({
                    width: wp(36), height: wp(36), borderRadius: wp(18),
                    backgroundColor: pressed ? '#2A303B' : '#1A1D22',
                    borderWidth: 1.5, borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.12)',
                    alignItems: 'center', justifyContent: 'center',
                  })}
                >
                  <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24">
                    <Path d="M9 5l7 7-7 7" stroke="#00D984" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
              </View>

              <View style={{ alignItems: 'flex-end', maxWidth: wp(60) }}>
                <Text style={{ fontSize: fp(13), fontWeight: '800', color: '#00D984' }} numberOfLines={1}>{walkDurStr}</Text>
                <Text style={{ fontSize: fp(7), color: '#6B7280' }} numberOfLines={1}>{t.normalSpeed}</Text>
              </View>
            </View>

            {/* Buttons: Confirm + LIVE */}
            <View style={{ flexDirection: 'row', gap: wp(8), marginTop: wp(6) }}>
              {walkScrollOffset > 0 && (
                <Pressable
                  onPress={async () => {
                    if (walkCal === 0) return;
                    const ok = await saveActivity('marche', Math.round(walkDurMin * walkMul), walkCal, 'modere', walkWater);
                    if (ok) {
                      setWalkSaved(true);
                      setLastActivity({ type: 'walk', name: t.walk, distance: walkDistStr, duration: Math.round(walkDurMin * walkMul), kcal: walkCal, water: walkWater, speed: null });
                      setShowPostReport(true);
                      fetchWeeklyMinutes();
                      if (walkSaveTimerRef.current) clearTimeout(walkSaveTimerRef.current);
                      walkSaveTimerRef.current = setTimeout(() => { setWalkSaved(false); setWalkScrollOffset(0); }, 1500);
                    }
                  }}
                  disabled={walkSaved}
                  style={({ pressed }) => ({
                    flex: 2, paddingVertical: wp(9), borderRadius: wp(10),
                    backgroundColor: walkSaved ? '#00D984' : pressed ? '#00B572' : '#00D984',
                    alignItems: 'center',
                  })}
                >
                  <Text style={{ color: '#1A1D22', fontSize: fp(11), fontWeight: '700' }}>
                    {walkSaved ? String.fromCodePoint(0x2713) + ' ' + t.added : String.fromCodePoint(0x2713) + ' ' + t.validate + ' — ' + walkCal + ' kcal'}
                  </Text>
                </Pressable>
              )}
              <TouchableOpacity
                onPress={() => setShowLive(true)}
                style={{
                  flex: 1, backgroundColor: 'rgba(255,107,107,0.12)',
                  borderRadius: wp(10), borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.4)',
                  paddingVertical: wp(9), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(4),
                }}
              >
                <View style={{ width: wp(7), height: wp(7), borderRadius: wp(4), backgroundColor: '#FF6B6B' }} />
                <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FF6B6B' }}>{t.live}</Text>
              </TouchableOpacity>
            </View>
          </MetalCard>

          {/* ═══ COURSE — SAVANE AFRICAINE ═══ */}
          <MetalCard style={{
            marginHorizontal: wp(16), marginBottom: 16, borderRadius: wp(14), borderWidth: 0.5,
            borderColor: runGlow ? 'rgba(255,140,66,0.5)' : 'rgba(74,79,85,0.3)',
          }}>
            {/* Header row: titre + stats alignés */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
              <View style={{ width: 3, height: 18, borderRadius: 1.5, backgroundColor: '#00D984', marginRight: 8 }} />
              <Text style={{ color: '#FFFFFF', fontSize: fp(14), fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{t.run}</Text>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: wp(8) }}>
                <Text style={{ fontSize: fp(9), color: '#FF6B6B', fontWeight: '600' }}>📍{runDistStr}</Text>
                <Text style={{ fontSize: fp(9), color: '#FF8C42', fontWeight: '600' }}>🔥{runCalories}kcal</Text>
                <Text style={{ fontSize: fp(9), color: '#4DA6FF', fontWeight: '600' }}>💧{runWater}ml</Text>
              </View>
            </View>

            {/* Canvas SVG savane */}
            <View
              style={{ position: 'relative', height: RUN_CANVAS_H, borderRadius: wp(10), overflow: 'hidden', backgroundColor: '#D4632A', borderWidth: 1, borderColor: 'rgba(232,148,74,0.3)' }}
              onLayout={(e) => setRunCanvasW(e.nativeEvent.layout.width)}
            >
              <Svg width={runCanvasW} height={RUN_CANVAS_H} viewBox={`0 0 ${runCanvasW} ${RUN_CANVAS_H}`} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                {(function() {
                  var cW = runCanvasW;
                  var cH = RUN_CANVAS_H;
                  var groundY = cH * 0.45;
                  var sOff = runScrollOffset;
                  var trailY = groundY + cH * 0.15;
                  var trailH = cH * 0.2;
                  var sunX = cW * 0.8 - sOff * 0.05;

                  var trees = [
                    { x: 100, type: 'acacia' }, { x: 400, type: 'baobab' },
                    { x: 750, type: 'acacia' }, { x: 1100, type: 'baobab' },
                    { x: 1500, type: 'acacia' }, { x: 2000, type: 'baobab' },
                    { x: 2600, type: 'acacia' }, { x: 3200, type: 'baobab' },
                  ];

                  return (
                    <G>
                      {/* Ciel coucher de soleil */}
                      <Rect x={0} y={0} width={cW} height={groundY} fill="#D4632A" />
                      <Rect x={0} y={cH * 0.3} width={cW} height={cH * 0.15} fill="#E8944A" opacity={0.7} />

                      {/* Soleil */}
                      <Circle cx={sunX} cy={cH * 0.38} r={22} fill="#F5C040" opacity={0.9} />
                      <Circle cx={sunX} cy={cH * 0.38} r={14} fill="#FADE6A" opacity={0.6} />

                      {/* Silhouettes arbres */}
                      {trees.map(function(tree, i) {
                        var tx = tree.x - sOff * 0.3;
                        if (tx < -40 || tx > cW + 40) return null;
                        if (tree.type === 'acacia') {
                          return (
                            <G key={'t' + i}>
                              <Rect x={tx - 1} y={groundY - 30} width={3} height={30} fill="#1A0F05" opacity={0.8} />
                              <Ellipse cx={tx} cy={groundY - 32} rx={22} ry={8} fill="#1A0F05" opacity={0.8} />
                            </G>
                          );
                        }
                        return (
                          <G key={'t' + i}>
                            <Path d={`M${tx - 5} ${groundY} L${tx - 3} ${groundY - 25} L${tx + 3} ${groundY - 25} L${tx + 5} ${groundY} Z`} fill="#1A0F05" opacity={0.8} />
                            <Ellipse cx={tx} cy={groundY - 28} rx={15} ry={10} fill="#1A0F05" opacity={0.8} />
                          </G>
                        );
                      })}

                      {/* Sol savane + piste */}
                      <Rect x={0} y={groundY} width={cW} height={cH * 0.55} fill="#5A3E1B" />
                      <Rect x={0} y={trailY} width={cW} height={trailH} fill="#4A3418" />
                    </G>
                  );
                })()}
              </Svg>

              {/* Brouillards */}
              <LinearGradient colors={['#5A3E1B', 'rgba(90,62,27,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30 }} />
              <LinearGradient colors={['rgba(90,62,27,0)', '#5A3E1B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30 }} />

              {/* Poussière */}
              {isRunning && (
                <View style={{ position: 'absolute', left: '18%', bottom: 10, flexDirection: 'row' }}>
                  {[0.35, 0.25, 0.15, 0.08].map(function(op, i) {
                    return <View key={i} style={{ width: 4 + i * 3, height: 4 + i * 3, borderRadius: 10, backgroundColor: 'rgba(140, 110, 60, ' + op + ')', marginRight: 2 }} />;
                  })}
                </View>
              )}
            </View>

            {/* Controls */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(4), paddingVertical: wp(4), marginTop: wp(4) }}>
              <TouchableOpacity onPress={() => setRunRoundTrip(!runRoundTrip)} style={{
                backgroundColor: runRoundTrip ? 'rgba(0,217,132,0.1)' : 'transparent',
                borderRadius: wp(6), borderWidth: 0.5,
                borderColor: runRoundTrip ? 'rgba(0,217,132,0.3)' : 'rgba(74,79,85,0.4)',
                paddingHorizontal: wp(5), paddingVertical: wp(3),
              }}>
                <Text style={{ fontSize: fp(7), color: runRoundTrip ? '#00D984' : '#6B7280' }}>
                  {runRoundTrip ? '↔ ' + t.roundTripX2 : '↔ ' + t.roundTrip}
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(4) }}>
                <Pressable onPressIn={() => startRunMoving(-1)} onPressOut={stopRunMoving}
                  style={({ pressed }) => ({
                    width: wp(36), height: wp(36), borderRadius: wp(18),
                    backgroundColor: pressed ? '#2A303B' : '#1A1D22',
                    borderWidth: 1.5, borderColor: pressed ? 'rgba(255,140,66,0.4)' : 'rgba(255,255,255,0.12)',
                    alignItems: 'center', justifyContent: 'center',
                  })}
                >
                  <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24">
                    <Path d="M15 19l-7-7 7-7" stroke="#FF8C42" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
                <Text style={{ fontSize: fp(7), color: '#555E6C', fontWeight: '600' }}>{t.hold}</Text>
                <Pressable onPressIn={() => startRunMoving(1)} onPressOut={stopRunMoving}
                  style={({ pressed }) => ({
                    width: wp(36), height: wp(36), borderRadius: wp(18),
                    backgroundColor: pressed ? '#2A303B' : '#1A1D22',
                    borderWidth: 1.5, borderColor: pressed ? 'rgba(255,140,66,0.4)' : 'rgba(255,255,255,0.12)',
                    alignItems: 'center', justifyContent: 'center',
                  })}
                >
                  <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24">
                    <Path d="M9 5l7 7-7 7" stroke="#FF8C42" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </Pressable>
              </View>

              <View style={{ alignItems: 'flex-end', maxWidth: wp(60) }}>
                <Text style={{ fontSize: fp(13), fontWeight: '800', color: '#00D984' }} numberOfLines={1}>{runDurStr}</Text>
                <Text style={{ fontSize: fp(7), color: '#6B7280' }} numberOfLines={1}>{t.normalPace}</Text>
              </View>
            </View>

            {/* Buttons: Confirm + LIVE */}
            <View style={{ flexDirection: 'row', gap: wp(8), marginTop: wp(6) }}>
              {runScrollOffset > 0 && (
                <Pressable onPress={handleAddRun} disabled={runSaved}
                  style={({ pressed }) => ({
                    flex: 2, paddingVertical: wp(9), borderRadius: wp(10),
                    backgroundColor: runSaved ? '#00D984' : pressed ? '#00B572' : '#00D984',
                    alignItems: 'center',
                  })}
                >
                  <Text style={{ color: '#1A1D22', fontSize: fp(11), fontWeight: '700' }}>
                    {runSaved ? String.fromCodePoint(0x2713) + ' ' + t.added : String.fromCodePoint(0x2713) + ' ' + t.validate + ' — ' + runCalories + ' kcal'}
                  </Text>
                </Pressable>
              )}
              <TouchableOpacity onPress={() => setShowLive(true)} style={{
                flex: 1, backgroundColor: 'rgba(255,107,107,0.12)',
                borderRadius: wp(10), borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.4)',
                paddingVertical: wp(9), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(4),
              }}>
                <View style={{ width: wp(7), height: wp(7), borderRadius: wp(4), backgroundColor: '#FF6B6B' }} />
                <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FF6B6B' }}>{t.live}</Text>
              </TouchableOpacity>
            </View>
          </MetalCard>

          {/* Other sports — grouped MetalCard */}
          <View style={{ marginHorizontal: wp(16), marginBottom: 16 }}>
            <View style={{ borderRadius: 16, borderWidth: 1.5, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D', borderRightColor: '#3E4855', borderBottomColor: '#2A303B', backgroundColor: '#2A303B' }}>
              <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{ borderRadius: 14, padding: 16, borderLeftWidth: 3, borderLeftColor: '#00D984' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
                  <Text style={{ color: '#FFFFFF', fontSize: fp(14), fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{t.otherActivities}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: wp(8) }}>
                  {OTHER_SPORTS.map(function(key) {
                    return (
                      <View key={key} style={{ width: wp(100) }}>
                        <SportCard
                          sportKey={key}
                          onPress={function() { setModalSport(key); setModalVisible(true); }}
                          lang={lang}
                          userWeight={userWeight}
                        />
                      </View>
                    );
                  })}
                </ScrollView>
              </LinearGradient>
            </View>
          </View>

          {/* Today's history — grouped MetalCard */}
          <View style={{ marginHorizontal: wp(16), marginBottom: 16 }}>
            <View style={{ borderRadius: 16, borderWidth: 1.5, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D', borderRightColor: '#3E4855', borderBottomColor: '#2A303B', backgroundColor: '#2A303B' }}>
              <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{ borderRadius: 14, padding: 16, borderLeftWidth: 3, borderLeftColor: '#00D984' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
                  <Text style={{ color: '#FFFFFF', fontSize: fp(14), fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>{t.todayHistory}</Text>
                </View>
                {todayActivities.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: wp(10), backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                    <Text style={{ color: '#555E6C', fontSize: fp(11), fontWeight: '600', textAlign: 'center' }}>
                      {t.noActivity}
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: wp(8) }}>
                    {todayActivities.map((act) => {
                      const sportData = ACTIVITY_DATA[act.type] || {};
                      const sportColor = sportData.color || '#00D984';
                      const createdTime = act.created_at
                        ? new Date(act.created_at).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
                        : '';
                      return (
                        <View key={act.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: wp(10) }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={{ marginRight: wp(8) }}>
                              <SportIcon type={act.type} size={wp(20)} color={sportColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{act.name}</Text>
                              <View style={{ flexDirection: 'row', marginTop: wp(2), gap: wp(8), flexWrap: 'wrap' }}>
                                <Text style={{ color: '#8892A0', fontSize: fp(9) }}>{formatDuration(act.duration_minutes)}</Text>
                                <Text style={{ color: '#FF8C42', fontSize: fp(9), fontWeight: '700' }}>{act.calories_burned} kcal</Text>
                                {act.water_lost_ml > 0 && (
                                  <Text style={{ color: '#4DA6FF', fontSize: fp(9) }}>{String.fromCodePoint(0x1F4A7)} {act.water_lost_ml} ml</Text>
                                )}
                                <Text style={{ color: '#555E6C', fontSize: fp(9) }}>{createdTime}</Text>
                                {act.source === 'live_gps' && (
                                  <View style={{ backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: wp(4), paddingHorizontal: wp(4), paddingVertical: wp(1) }}>
                                    <Text style={{ fontSize: fp(7), color: '#00D984', fontWeight: '700' }}>GPS</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                          <Pressable onPress={() => handleDeleteActivity(act)} style={{
                            width: wp(24), height: wp(24), borderRadius: wp(12),
                            backgroundColor: 'rgba(255,107,107,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: wp(8),
                          }}>
                            <Ionicons name="close" size={wp(14)} color="#FF6B6B" />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>

          {/* Recommendation — grouped MetalCard */}
          {recommendation && (
            <View style={{ marginHorizontal: wp(16), marginBottom: 16 }}>
              <View style={{ borderRadius: 16, borderWidth: 1.5, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D', borderRightColor: '#3E4855', borderBottomColor: '#2A303B', backgroundColor: '#2A303B' }}>
              <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{
                borderRadius: 14, padding: wp(14),
                borderLeftWidth: 3,
                borderLeftColor: recommendation.color,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }}>{t.recommendation}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                  <View style={{ marginRight: wp(8) }}>
                    <SportIcon type={recommendation.type === 'maintain' ? 'marche' : 'course'} size={wp(24)} color={recommendation.color} />
                  </View>
                  <Text style={{ fontSize: fp(14), fontWeight: '700', color: recommendation.color, flex: 1 }}>{recommendation.title}</Text>
                </View>
                <Text style={{ fontSize: fp(11), color: '#D1D5DB', lineHeight: fp(16), marginBottom: wp(8) }}>
                  {recommendation.subtitle}
                </Text>
                {recommendation.type === 'burn' && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#252A30', borderRadius: wp(10), padding: wp(10) }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{t.activityLabel}</Text>
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFFFFF' }}>{recommendation.activity}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{t.durationSmall}</Text>
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FF8C42' }}>{recommendation.duration}</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{t.distanceSmall}</Text>
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#4DA6FF' }}>{recommendation.distance}</Text>
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  onPress={function() {
                    if (recommendation.activity === t.walk || recommendation.activity === t.walk + ' / ' + t.run) {
                      var targetDist = parseFloat(recommendation.distance) * 1000;
                      var targetOffset = (targetDist / WALK_MAX_DIST) * (WALK_SCENE_W - walkCanvasW);
                      setWalkScrollOffset(Math.min(targetOffset, WALK_SCENE_W - walkCanvasW));
                    }
                  }}
                  style={{ marginTop: wp(10), paddingVertical: wp(10), borderRadius: wp(10), backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#00D984', alignItems: 'center' }}
                >
                  <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '700' }}>{t.startNow}</Text>
                </TouchableOpacity>
              </LinearGradient>
              </View>
            </View>
          )}

          {/* Lix reward badge */}
          {lixRewardedToday ? (
            <View style={{
              alignSelf: 'center', backgroundColor: 'rgba(0,217,132,0.08)',
              borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', borderRadius: wp(10),
              paddingVertical: wp(8), paddingHorizontal: wp(16), marginVertical: wp(12),
              flexDirection: 'row', alignItems: 'center', gap: wp(6),
            }}>
              <Text style={{ fontSize: fp(11), color: '#00D984', fontWeight: '600' }}>
                {String.fromCodePoint(0x2705)} {t.bonusObtained}
              </Text>
            </View>
          ) : (
            <View style={{
              alignSelf: 'center', backgroundColor: 'rgba(212,175,55,0.08)',
              borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: wp(10),
              paddingVertical: wp(8), paddingHorizontal: wp(16), marginVertical: wp(12),
              flexDirection: 'row', alignItems: 'center', gap: wp(6),
            }}>
              <Text style={{ fontSize: fp(14) }}>{String.fromCodePoint(0x1F3C6)}</Text>
              <Text style={{ fontSize: fp(11), fontWeight: '600', color: '#D4AF37' }}>{t.bonusFirst}</Text>
            </View>
          )}

        </ScrollView>

        {/* Sous-écrans montés conditionnellement */}
        <LiveTrackingScreen
          visible={showLive}
          onClose={() => setShowLive(false)}
          onActivitySaved={(summary) => {
            setLastActivity(summary);
            setShowPostReport(true);
            loadTodayActivities();
            fetchSmartData();
            fetchWeeklyMinutes();
            if (!lixRewardedToday) setLixRewardedToday(true);
          }}
          activeChar={activeChar}
          userWeight={userWeight}
          dailyTarget={dailyTarget}
          totalEaten={totalEaten}
          totalBurnedBefore={totalBurnedActivities}
          userMood={userMood}
        />

        <PostReportModal
          visible={showPostReport}
          onClose={() => { setShowPostReport(false); setHookResults({}); }}
          lastActivity={lastActivity}
          hookResults={hookResults}
          weeklyMinutes={weeklyMinutes}
        />

        <SportModal
          visible={modalVisible}
          sportKey={modalSport}
          onClose={() => setModalVisible(false)}
          onSave={handleSportSave}
          lang={lang}
          userWeight={userWeight}
        />

        {/* BottomTabs */}
        <BottomTabs
          activeTab={activeTab}
          onTabPress={handleTabPress}
          lang={lang}
        />

      </View>
    </LinearGradient>
  );
}
