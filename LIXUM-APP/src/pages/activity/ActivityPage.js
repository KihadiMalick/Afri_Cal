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

  // === JSX (phases suivantes) ===

  return null;
}
