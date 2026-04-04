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

  // === FONCTIONS (phases suivantes) ===

  // === JSX (phases suivantes) ===

  return null;
}
