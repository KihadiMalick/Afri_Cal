import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, TouchableOpacity,
  Animated, Platform, Image, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';

// Composants partagés
import BottomTabs from '../../components/shared/NavBar';
import MetalCard from '../../components/shared/MetalCard';

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

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const WALK_SCENE_W = 2000;
const WALK_MAX_DIST = 10000;
const WALK_CANVAS_H = 85;
const RUN_SCENE_W = 8400;
const RUN_MAX_DIST = 42000;
const RUN_CANVAS_H = 85;
const RUN_METERS_PER_PIXEL = RUN_MAX_DIST / RUN_SCENE_W;
const RUN_PIXELS_PER_METER = RUN_SCENE_W / RUN_MAX_DIST;

export default function ActivityPage({ onNavigate }) {
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
  const [lixBalance, setLixBalance] = useState(0);
  const [userEnergy, setUserEnergy] = useState(20);
  var _weight = useState(70); var userWeight = _weight[0]; var setUserWeight = _weight[1];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

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
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: profile } = await supabase
        .from('users_profile')
        .select('daily_calorie_target, current_mood, weight')
        .eq('user_id', TEST_USER_ID)
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
        .eq('user_id', TEST_USER_ID)
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
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .eq('date', today)
      .order('created_at', { ascending: false });
    if (data) setTodayActivities(data);
  };

  const fetchWeeklyMinutes = async () => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('user_activities')
        .select('duration_min')
        .eq('user_id', TEST_USER_ID)
        .gte('performed_at', monday.toISOString());
      const total = (data || []).reduce((sum, a) => sum + (a.duration_min || 0), 0);
      setWeeklyMinutes(total);
    } catch (e) {
      console.warn('Weekly minutes error:', e);
    }
  };

  // Init
  useEffect(() => {
    loadTodayActivities();
    fetchSmartData();
    fetchWeeklyMinutes();
    loadPagePowers();
    (async () => {
      try {
        const { data: profile } = await supabase.from('users_profile').select('full_name, lix_balance, weight').eq('user_id', TEST_USER_ID).maybeSingle();
        if (profile) {
          setUserNameAvatar(profile.full_name || '');
          setLixBalance(profile.lix_balance || 0);
          if (profile.weight) setUserWeight(profile.weight);
        }
      } catch (e) {}
    })();
    (async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase.from('user_activities').select('id').eq('user_id', TEST_USER_ID).gte('created_at', today + 'T00:00:00').limit(1);
        if (data && data.length > 0) setLixRewardedToday(true);
      } catch (e) {}
    })();
  }, []);

  // === FONCTIONS POUVOIRS + SAVE ===

  const ACTIVITY_PAGE = 'activite';

  const loadPagePowers = async () => {
    try {
      const { data: collection } = await supabase
        .rpc('get_user_collection', { p_user_id: TEST_USER_ID });
      const active = (collection || []).find(c => c.is_active);
      if (!active) { setActiveChar(null); setPagePowers([]); return; }
      setActiveChar(active);
      const { data: powers } = await supabase
        .rpc('get_character_powers', { p_user_id: TEST_USER_ID, p_slug: active.slug });
      setPagePowers((powers || []).filter(p => p.redirect_page === ACTIVITY_PAGE && p.unlocked));
    } catch (e) {
      console.warn('Page powers load error:', e);
    }
  };

  const consumePower = async (powerKey) => {
    try {
      const { data } = await supabase.rpc('use_character_power', {
        p_user_id: TEST_USER_ID, p_power_key: powerKey,
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
        p_user_id: TEST_USER_ID,
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
        p_activity_id: activityId, p_user_id: TEST_USER_ID,
      });
      if (error) { alert('Erreur suppression : ' + error.message); return; }
      await loadTodayActivities();
    } catch (e) {
      console.error('Delete activity error:', e);
    }
  };

  // === FONCTIONS UI ===

  var toggleDropdown = function() {
    var toValue = dropdownOpen ? 0 : 1;
    Animated.spring(dropdownAnim, { toValue: toValue, tension: 80, friction: 10, useNativeDriver: false }).start();
    setDropdownOpen(!dropdownOpen);
  };

  const handleTabPress = (key) => {
    if (key === 'activity') return;
    if (onNavigate) onNavigate(key);
    setActiveTab(key);
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
      setTimeout(() => { setRunSaved(false); setRunScrollOffset(0); runMilestoneHitRef.current = {}; }, 1500);
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

  // === JSX (phases suivantes) ===

  return null;
}
