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

  return (
    <View style={{ flex: 1, backgroundColor: '#1E2530' }}>
      <Text style={{ color: '#FFF', padding: 20 }}>DashboardPage loading...</Text>
    </View>
  );
}
