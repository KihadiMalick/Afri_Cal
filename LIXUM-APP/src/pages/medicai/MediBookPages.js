import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Platform, Animated, Easing, Dimensions, StatusBar, Pressable, ActivityIndicator,
  Modal, Alert,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle, Ellipse, Line, Polyline, Polygon, G,
  Text as SvgText,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { wp, fp, SCREEN_WIDTH, SCREEN_HEIGHT, SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';
import { useAuth } from '../../config/AuthContext';
import { supabase } from '../../config/supabase';
import { BottomSpacer } from './shared';
import LixumModal from '../../components/shared/LixumModal';
var NotificationService = require('../../services/NotificationService');

export const mbDataStatus = [
  { name: 'Nutrition', days: 87, total: 90, percent: 96 },
  { name: 'Hydratation', days: 72, total: 90, percent: 80 },
  { name: 'Activité physique', days: 45, total: 90, percent: 50 },
  { name: 'Humeur', days: 60, total: 90, percent: 67 },
  { name: 'Conversations ALIXEN', days: 8, total: null, percent: null, status: 'OK' },
  { name: 'Secret Pocket', days: null, total: null, percent: null, status: 'Optionnel' },
];

export const mbSections = [
  { icon: 'user', title: 'Page de garde', desc: 'Nom, âge, LixTag, période', color: '#00D984' },
  { icon: 'body', title: 'Profil morphologique', desc: 'Poids, taille, BMI, BMR, TDEE', color: '#4DA6FF' },
  { icon: 'food', title: 'Nutrition 3 mois', desc: 'Calories, macros, tendances', color: '#FF8C42' },
  { icon: 'water', title: 'Hydratation', desc: 'Moyenne vs objectif', color: '#4DA6FF' },
  { icon: 'run', title: 'Activité physique', desc: 'Fréquence, types, calories', color: '#00D984' },
  { icon: 'mood', title: "Courbe d'humeur", desc: 'Évolution et corrélations', color: '#9B6DFF' },
  { icon: 'alert', title: "Points d'attention", desc: 'Carences, alertes ALIXEN', color: '#FF6B6B' },
  { icon: 'qr', title: 'QR Code profil', desc: 'Lien vers votre profil Lixum', color: '#D4AF37' },
];

export const MbSectionIcon = ({ type, color, size = wp(18) }) => {
  switch (type) {
    case 'user':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" /><Path d="M4 21v-1a6 6 0 0112 0v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'body':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="5" r="3" stroke={color} strokeWidth="1.5" /><Path d="M12 10v8m-4-6h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M9 22l3-4 3 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'food':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 2v8c0 1.1.9 2 2 2h2a2 2 0 002-2V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="6" y1="2" x2="6" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M18 2c0 4-2 6-2 10h4c0-4-2-6-2-10z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><Line x1="18" y1="12" x2="18" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'water':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2c-4 6-7 9-7 13a7 7 0 0014 0c0-4-3-7-7-13z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></Svg>);
    case 'run':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="14" cy="4" r="2" stroke={color} strokeWidth="1.5" /><Path d="M6 20l4-4 2 2 4-5 2 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><Path d="M10 16l-2-4 5-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'mood':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" /><Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="9" cy="10" r="0.5" fill={color} /><Circle cx="15" cy="10" r="0.5" fill={color} /></Svg>);
    case 'alert':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="12" cy="16" r="0.5" fill={color} /></Svg>);
    case 'qr':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="14" y="14" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5" /><Line x1="21" y1="14" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="14" y1="21" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    default: return null;
  }
};

export const mbGetBarColor = (percent) => {
  if (percent >= 80) return '#00D984';
  if (percent >= 50) return '#FF8C42';
  return '#FF6B6B';
};

export const MbProgressRow = ({ item }) => {
  const hasPercent = item.percent !== null;
  // Fix: Conversations ALIXEN = emerald, Secret Pocket = gold (not black)
  const barColor = hasPercent
    ? mbGetBarColor(item.percent)
    : item.status === 'OK' ? '#00D984' : '#D4AF37';
  const detail = item.total
    ? `${item.days} jours sur ${item.total}`
    : item.days ? `${item.days} sessions` : '';

  return (
    <View style={{ marginBottom: wp(14) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(4) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436' }}>{item.name}</Text>
          {detail ? <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)' }}>{detail}</Text> : null}
        </View>
        <Text style={{ fontSize: fp(12), fontWeight: '700', color: hasPercent ? barColor : barColor }}>
          {hasPercent ? `${item.percent}%` : item.status}
        </Text>
      </View>
      <View style={{ height: wp(6), borderRadius: wp(3), backgroundColor: '#E8ECF0', overflow: 'hidden' }}>
        <View style={{
          height: '100%',
          width: hasPercent ? `${item.percent}%` : (item.status === 'OK' ? '30%' : '15%'),
          borderRadius: wp(3), backgroundColor: barColor,
        }} />
      </View>
    </View>
  );
};

// ============================================
// SECRET POCKET — DATA + ICONS
// ============================================
// TODO: Quand le champ is_secret sera ajouté dans Supabase,
// remplacer les compteurs hardcodés par les données réelles :
// count: medicalData.analyses.filter(a => a.is_secret).length
// count: medicalData.allergies.filter(a => a.is_secret).length
// etc.
const spCategories = [
  { id: 'diagnostics', title: 'Diagnostics à surveiller', desc: 'Diabète, hypertension, cholestérol...', icon: 'heart-pulse', color: '#FF6B6B', count: 0 },
  { id: 'allergies', title: 'Allergies et intolérances', desc: 'Alimentaires, médicamenteuses...', icon: 'shield-alert', color: '#FF8C42', count: 0 },
  { id: 'medications', title: 'Médicaments en cours', desc: 'Traitements actuels et posologie', icon: 'pill', color: '#4DA6FF', count: 0 },
  { id: 'lab-results', title: "Résultats d'analyses", desc: 'Bilans sanguins, examens...', icon: 'flask', color: '#00D984', count: 0 },
  { id: 'notes', title: 'Notes personnelles', desc: 'Vos observations de santé', icon: 'edit', color: '#9B6DFF', count: 0 },
  { id: 'conversations', title: 'Conversations sensibles', desc: 'Échanges privés avec ALIXEN', icon: 'message-lock', color: '#D4AF37', count: 0 },
];

const renderCategoryIcon = (iconName, color, size = wp(20)) => {
  switch (iconName) {
    case 'heart-pulse':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke={color} strokeWidth="1.5" /><Path d="M3 12h4l3-6 4 12 3-6h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'shield-alert':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke={color} strokeWidth="1.5" /><Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="12" cy="16" r="0.5" fill={color} /></Svg>);
    case 'pill':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M10.5 1.5l-8 8a4.24 4.24 0 006 6l8-8a4.24 4.24 0 00-6-6z" stroke={color} strokeWidth="1.5" /><Line x1="8" y1="8" x2="14" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'flask':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M9 2v6l-5 8a3 3 0 002.6 4.5h10.8A3 3 0 0020 16l-5-8V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="9" y1="2" x2="15" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M7 15h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'edit':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={color} strokeWidth="1.5" /></Svg>);
    case 'message-lock':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.5" /><Rect x="9" y="8" width="6" height="5" rx="1" stroke={color} strokeWidth="1.5" /><Path d="M10 8V6.5a2 2 0 014 0V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    default: return null;
  }
};

// ============================================
// SCAN STEP ROW — Ligne d'étape du scan IA
// ============================================
export const ScanStepRow = ({ step, index, isLatest }) => {
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: wp(10),
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.04)',
      opacity: opacityAnim,
    }}>
      <View style={{
        width: wp(22), height: wp(22), borderRadius: wp(11),
        backgroundColor: 'rgba(0,217,132,0.15)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: wp(12),
      }}>
        <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
          <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>
      <Text style={{
        fontSize: fp(13), color: '#FFF', fontWeight: '500', flex: 1,
      }}>
        {step.text}
      </Text>
    </Animated.View>
  );
};

export const MediBookContent = (props) => {
  const {
    // Navigation
    mediBookView, setMediBookView,
    reportSection, setReportSection,
    setCurrentSubPage,
    // Données médicales
    medicalData, medicalDataLoading,
    nutritionWeekData, userProfile,
    // Scan state
    uploadState, setUploadState,
    scanResults, setScanResults,
    scanSteps, setScanSteps,
    scanContext, setScanContext,
    scanFileName,
    batchPhotos, batchProgress, batchIdState,
    // Carnet
    carnetPhotos, setCarnetPhotos,
    carnetPulseAnim,
    selectedCarnetPage, setSelectedCarnetPage,
    showCarnetPageSheet, setShowCarnetPageSheet,
    showAnalyzeSheet, setShowAnalyzeSheet,
    showMediBookUploadSheet, setShowMediBookUploadSheet,
    // Stats
    statsTab, setStatsTab,
    analysesTab, setAnalysesTab,
    medsTab, setMedsTab,
    // Profil switch
    activeProfile, children,
    showProfileSwitcher, setShowProfileSwitcher,
    // Fonctions
    loadMedicalData,
    startMedicalScan,
    startBatchScan,
    handleTransferToSecretPocket,
    toggleMedicationReminder,
    toggleMedicationTaken,
    isTakenAtTime,
    archiveMedication,
    // Modals
    showAddMedSheet, setShowAddMedSheet,
    showAddAnalysisSheet, setShowAddAnalysisSheet,
    showAddDiagSheet, setShowAddDiagSheet,
    showAddAllergySheet, setShowAddAllergySheet,
    // Vaccine calendar
    vaccCalendarView, setVaccCalendarView, vaccSchedule, vaccStats,
    vaccPriorityFilter, setVaccPriorityFilter, vaccCalendarLoading,
    openAddVaccFromCalendar, getOverdueText,
    showAddVaccSheet, setShowAddVaccSheet,
    // Animation
    mbGenerateScale,
  } = props;

  var auth = useAuth();
  var userId = auth.userId;

  var _mbModal = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });
  var mbModal = _mbModal[0]; var setMbModal = _mbModal[1];
  var closeMbModal = function() { setMbModal(function(p) { return Object.assign({}, p, { visible: false }); }); };
  var showMbModal = function(type, title, message, extra) { setMbModal(Object.assign({ visible: true, type: type, title: title, message: message, onClose: closeMbModal, onConfirm: null, confirmText: 'Confirmer', cancelText: 'Annuler' }, extra || {})); };

  // ── CALENDAR STATES ────────────────────────────────────────────────────────
  var _calMonth = useState(new Date().getMonth());
  var calendarMonth = _calMonth[0]; var setCalendarMonth = _calMonth[1];
  var _calYear = useState(new Date().getFullYear());
  var calendarYear = _calYear[0]; var setCalendarYear = _calYear[1];
  var _selectedDay = useState(null);
  var selectedDay = _selectedDay[0]; var setSelectedDay = _selectedDay[1];
  var _calFilters = useState({ diagnostic: true, medication: true, vaccination: true, analysis: true, allergy: true });
  var calendarFilters = _calFilters[0]; var setCalendarFilters = _calFilters[1];
  var _calView = useState('month');
  var calendarView = _calView[0]; var setCalendarView = _calView[1];
  var _calEventDetail = useState(null);
  var calEventDetail = _calEventDetail[0]; var setCalEventDetail = _calEventDetail[1];
  var calSlideAnim = useRef(new Animated.Value(0)).current;
  var _upcomingReminders = useState([]);
  var upcomingReminders = _upcomingReminders[0]; var setUpcomingReminders = _upcomingReminders[1];
  var _showAddDataSheet = useState(false);
  var showAddDataSheet = _showAddDataSheet[0]; var setShowAddDataSheet = _showAddDataSheet[1];
  var _reminderDetail = useState(null);
  var reminderDetail = _reminderDetail[0]; var setReminderDetail = _reminderDetail[1];
  var _reminderPostponeDate = useState('');
  var reminderPostponeDate = _reminderPostponeDate[0]; var setReminderPostponeDate = _reminderPostponeDate[1];

  // ── STATS STATES ──────────────────────────────────────────────────────────
  var _statsLoading = useState(false);
  var statsLoading = _statsLoading[0]; var setStatsLoading = _statsLoading[1];
  var _nutritionStats = useState([]);
  var nutritionStats = _nutritionStats[0]; var setNutritionStats = _nutritionStats[1];
  var _activityStats = useState([]);
  var activityStats = _activityStats[0]; var setActivityStats = _activityStats[1];
  var _moodStats = useState([]);
  var moodStats = _moodStats[0]; var setMoodStats = _moodStats[1];
  var _hydrationStats = useState([]);
  var hydrationStats = _hydrationStats[0]; var setHydrationStats = _hydrationStats[1];
  var _healthTimeline = useState([]);
  var healthTimeline = _healthTimeline[0]; var setHealthTimeline = _healthTimeline[1];
  var _healthInsights = useState([]);
  var healthInsights = _healthInsights[0]; var setHealthInsights = _healthInsights[1];
  var _statsVaccData = useState(null);
  var statsVaccData = _statsVaccData[0]; var setStatsVaccData = _statsVaccData[1];
  var _rangeAccess = useState({ '7d': { has_access: true }, '30d': { has_access: false, lix_cost: 500 }, '365d': { has_access: false, lix_cost: 5000 }, 'all': { has_access: false, lix_cost: 10000 } });
  var rangeAccess = _rangeAccess[0]; var setRangeAccess = _rangeAccess[1];
  var _selectedRange = useState({ key: '7d', label: '7J', days: 7 });
  var selectedRange = _selectedRange[0]; var setSelectedRange = _selectedRange[1];
  var _showUnlockModal = useState(false);
  var showUnlockModal = _showUnlockModal[0]; var setShowUnlockModal = _showUnlockModal[1];
  var _unlockTarget = useState(null);
  var unlockTarget = _unlockTarget[0]; var setUnlockTarget = _unlockTarget[1];

  // ── NUTRITION ANIMATION STATES (top level — hooks cannot be inside nested functions) ──
  var _nutCalBarAnim = useRef(new Animated.Value(0)).current;
  var _nutProtBarAnim = useRef(new Animated.Value(0)).current;
  var _nutCarbBarAnim = useRef(new Animated.Value(0)).current;
  var _nutFatBarAnim = useRef(new Animated.Value(0)).current;
  var _nutCurveOpacity = useRef(new Animated.Value(0)).current;
  var _nutHydBarAnim = useRef(new Animated.Value(0)).current;
  var _nutDisplayCal = useState(0);
  var nutDisplayCal = _nutDisplayCal[0]; var setNutDisplayCal = _nutDisplayCal[1];
  var _nutSelectedPoint = useState(null);
  var nutSelectedPoint = _nutSelectedPoint[0]; var setNutSelectedPoint = _nutSelectedPoint[1];
  var _nutAnimRan = useRef(false);

  // ── ASSISTANCE MÉDICALE STATES ────────────────────────────────────────────
  var _showQrModal = useState(false);
  var showQrModal = _showQrModal[0]; var setShowQrModal = _showQrModal[1];
  var _qrShareToken = useState(null);
  var qrShareToken = _qrShareToken[0]; var setQrShareToken = _qrShareToken[1];
  var _qrExpiresAt = useState(null);
  var qrExpiresAt = _qrExpiresAt[0]; var setQrExpiresAt = _qrExpiresAt[1];
  var _qrLoading = useState(false);
  var qrLoading = _qrLoading[0]; var setQrLoading = _qrLoading[1];
  // Live consultation states
  var _liveMeds = useState([]);
  var liveMeds = _liveMeds[0]; var setLiveMeds = _liveMeds[1];
  var _liveMedSearch = useState('');
  var liveMedSearch = _liveMedSearch[0]; var setLiveMedSearch = _liveMedSearch[1];
  var _liveMedResults = useState([]);
  var liveMedResults = _liveMedResults[0]; var setLiveMedResults = _liveMedResults[1];
  var _liveWeight = useState('');
  var liveWeight = _liveWeight[0]; var setLiveWeight = _liveWeight[1];
  var _liveTemp = useState('');
  var liveTemp = _liveTemp[0]; var setLiveTemp = _liveTemp[1];
  var _liveTensionH = useState('');
  var liveTensionH = _liveTensionH[0]; var setLiveTensionH = _liveTensionH[1];
  var _liveTensionL = useState('');
  var liveTensionL = _liveTensionL[0]; var setLiveTensionL = _liveTensionL[1];
  var _liveHeight = useState('');
  var liveHeight = _liveHeight[0]; var setLiveHeight = _liveHeight[1];
  var _liveDiag = useState('');
  var liveDiag = _liveDiag[0]; var setLiveDiag = _liveDiag[1];
  var _liveSeverity = useState('moderate');
  var liveSeverity = _liveSeverity[0]; var setLiveSeverity = _liveSeverity[1];
  var _liveNotes = useState('');
  var liveNotes = _liveNotes[0]; var setLiveNotes = _liveNotes[1];
  var _liveDoctor = useState('');
  var liveDoctor = _liveDoctor[0]; var setLiveDoctor = _liveDoctor[1];
  var _liveSaving = useState(false);
  var liveSaving = _liveSaving[0]; var setLiveSaving = _liveSaving[1];

  var getAuthHeaders = async function() {
    var result = await supabase.auth.getSession();
    var token = result.data.session ? result.data.session.access_token : SUPABASE_ANON_KEY;
    return { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  };

  // ── STATS RPC HELPERS ─────────────────────────────────────────────────────
  var fetchRPC = async function(rpcName, params) {
    var headers = await getAuthHeaders();
    var r = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + rpcName, {
      method: 'POST', headers: headers, body: JSON.stringify(params)
    });
    return r.json();
  };

  var loadAllStats = async function(daysBack) {
    if (!userId) return;
    setStatsLoading(true);
    try {
      var fmId = activeProfile !== 'self' ? activeProfile : null;
      var results = await Promise.all([
        fetchRPC('get_nutrition_stats', { p_user_id: userId, p_days_back: daysBack }),
        fetchRPC('get_activity_stats', { p_user_id: userId, p_days_back: daysBack }),
        fetchRPC('get_mood_stats', { p_user_id: userId, p_days_back: daysBack }),
        fetchRPC('get_hydration_stats', { p_user_id: userId, p_days_back: daysBack }),
        fetchRPC('get_health_timeline', { p_user_id: userId, p_family_member_id: fmId, p_days_back: daysBack }),
        fetchRPC('get_health_insights', { p_user_id: userId, p_family_member_id: fmId, p_days_back: daysBack }),
        fetchRPC('get_vaccine_completion_stats_by_user', { p_user_id: userId, p_family_member_id: fmId })
      ]);
      console.log('[Stats] nutrition:', Array.isArray(results[0]) ? results[0].length + ' rows' : 'error', results[0] && results[0].error ? results[0].error : '');
      console.log('[Stats] activity:', Array.isArray(results[1]) ? results[1].length + ' rows' : 'error', results[1] && results[1].error ? results[1].error : '');
      console.log('[Stats] mood:', Array.isArray(results[2]) ? results[2].length + ' rows' : 'error', results[2] && results[2].error ? results[2].error : '');
      console.log('[Stats] hydration:', Array.isArray(results[3]) ? results[3].length + ' rows' : 'error', results[3] && results[3].error ? results[3].error : '');
      console.log('[Stats] timeline:', Array.isArray(results[4]) ? results[4].length + ' rows' : 'error', results[4] && results[4].error ? results[4].error : '');
      console.log('[Stats] insights:', Array.isArray(results[5]) ? results[5].length + ' rows' : 'error', results[5] && results[5].error ? results[5].error : '');
      console.log('[Stats] vaccStats:', results[6]);
      setNutritionStats(Array.isArray(results[0]) ? results[0] : []);
      setActivityStats(Array.isArray(results[1]) ? results[1] : []);
      setMoodStats(Array.isArray(results[2]) ? results[2] : []);
      setHydrationStats(Array.isArray(results[3]) ? results[3] : []);
      setHealthTimeline(Array.isArray(results[4]) ? results[4] : []);
      setHealthInsights(Array.isArray(results[5]) ? results[5] : []);
      setStatsVaccData(results[6] && results[6][0] ? results[6][0] : null);
    } catch(err) { console.log('[Stats] Erreur:', err); }
    setStatsLoading(false);
  };

  var checkRangeAccess = async function() {
    if (!userId) return;
    try {
      var results = await Promise.all([
        fetchRPC('check_stats_access_for_range', { p_user_id: userId, p_range_key: '7d' }),
        fetchRPC('check_stats_access_for_range', { p_user_id: userId, p_range_key: '30d' }),
        fetchRPC('check_stats_access_for_range', { p_user_id: userId, p_range_key: '365d' }),
        fetchRPC('check_stats_access_for_range', { p_user_id: userId, p_range_key: 'all' })
      ]);
      setRangeAccess({
        '7d': results[0] && results[0][0] ? results[0][0] : { has_access: true },
        '30d': results[1] && results[1][0] ? results[1][0] : { has_access: false, lix_cost: 500 },
        '365d': results[2] && results[2][0] ? results[2][0] : { has_access: false, lix_cost: 5000 },
        'all': results[3] && results[3][0] ? results[3][0] : { has_access: false, lix_cost: 10000 }
      });
    } catch(err) { console.log('Erreur accès:', err); }
  };

  useEffect(function() {
    if (mediBookView === 'stats' && userId) {
      loadAllStats(selectedRange.days);
      checkRangeAccess();
    }
  }, [mediBookView]);

  const captureCarnetPage = (index) => {
    setSelectedCarnetPage(index);
    setShowCarnetPageSheet(true);
  };

  // ── RENDER SCANNING SCREEN ─────────────────────────────────────────────
  const renderScanningScreen = () => (
    <View style={{ flex: 1, backgroundColor: '#1A1D22', paddingHorizontal: wp(20), paddingTop: wp(60), paddingBottom: wp(70) }}>
      {/* Bouton retour */}
      <Pressable
        onPress={() => {
          setUploadState('idle');
          setScanSteps([]);
        }}
        style={{
          position: 'absolute', top: wp(16), left: wp(16), zIndex: 10,
          width: wp(36), height: wp(36), borderRadius: wp(18),
          backgroundColor: 'rgba(255,255,255,0.08)',
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Text style={{ color: '#FFF', fontSize: fp(18) }}>{"<"}</Text>
      </Pressable>

      <View style={{ alignItems: 'center', marginBottom: wp(40) }}>
        <View style={{
          width: wp(70), height: wp(70), borderRadius: wp(35),
          backgroundColor: 'rgba(0,217,132,0.1)',
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', marginBottom: wp(16),
        }}>
          <Svg width={wp(32)} height={wp(32)} viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <Path d="M14 2v6h6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </View>
        <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
          ALIXEN analyse...
        </Text>
        <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)' }}>
          {scanFileName}
        </Text>
        {batchProgress ? (
          <Text style={{ fontSize: fp(12), color: '#9B6DFF', fontWeight: '600', marginTop: wp(6) }}>
            {batchProgress}
          </Text>
        ) : null}
        <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.25)', marginTop: wp(2) }}>
          Ne fermez pas l'application
        </Text>
      </View>

      <View style={{ paddingHorizontal: wp(8) }}>
        {scanSteps.map((step, index) => (
          <View key={index} style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: wp(10),
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.04)',
          }}>
            <View style={{
              width: wp(22), height: wp(22), borderRadius: wp(11),
              backgroundColor: 'rgba(0,217,132,0.15)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: wp(12),
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700' }}>{'✓'}</Text>
            </View>
            <Text style={{
              fontSize: fp(13),
              color: index === scanSteps.length - 1 ? '#00D984' : 'rgba(255,255,255,0.6)',
              fontWeight: index === scanSteps.length - 1 ? '600' : '400',
              flex: 1,
            }}>
              {step.text}
            </Text>
          </View>
        ))}
        {scanSteps.length < 7 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), opacity: 0.6 }}>
            <ActivityIndicator size="small" color="#00D984" style={{ marginRight: wp(12) }} />
            <Text style={{ fontSize: fp(13), color: 'rgba(0,217,132,0.7)', fontStyle: 'italic' }}>
              Traitement en cours...
            </Text>
          </View>
        )}
      </View>

      <View style={{ position: 'absolute', bottom: wp(40), left: wp(20), right: wp(20) }}>
        <Pressable onPress={() => { setUploadState('idle'); setScanSteps([]); }}
          style={{ alignItems: 'center', padding: wp(14) }}>
          <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text>
        </Pressable>
      </View>
    </View>
  );

  // ── RENDER SCAN RESULTS ────────────────────────────────────────────────
  const renderScanResults = () => {
    // Détecter si c'est un scan de nourriture (pas un document médical)
    const isFoodScan = scanResults?.documentType === 'Non médical' ||
      scanResults?.category === 'food' ||
      (scanResults?.documentType || '').toLowerCase().includes('plat') ||
      (scanResults?.documentType || '').toLowerCase().includes('aliment');

    // Si c'est de la nourriture scannée depuis MediBook
    if (isFoodScan && scanContext === 'medibook') {
      const detectedAllergens = medicalData.allergies.filter(a => {
        const allergen = (a.allergen || '').toLowerCase();
        const summary = (scanResults?.summary || '').toLowerCase();
        return summary.includes(allergen) ||
          (scanResults?.data || []).some(d =>
            (d.label || '').toLowerCase().includes(allergen)
          );
      });

      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <View style={{ paddingHorizontal: wp(16), paddingTop: wp(20) }}>

            {/* Bouton retour */}
            <Pressable onPress={() => { setUploadState('idle'); setScanResults(null); }}
              style={{ width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: wp(16) }}>
              <Text style={{ color: '#FFF', fontSize: fp(18) }}>{"<"}</Text>
            </Pressable>

            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: wp(24) }}>
              <View style={{
                width: wp(60), height: wp(60), borderRadius: wp(30),
                backgroundColor: detectedAllergens.length > 0 ? 'rgba(255,107,107,0.12)' : 'rgba(0,217,132,0.12)',
                justifyContent: 'center', alignItems: 'center', marginBottom: wp(12),
              }}>
                <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                  {detectedAllergens.length > 0 ? (
                    <>
                      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FF6B6B" strokeWidth="1.5"/>
                      <Line x1="12" y1="9" x2="12" y2="13" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                      <Circle cx="12" cy="16" r="0.5" fill="#FF6B6B"/>
                    </>
                  ) : (
                    <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </Svg>
              </View>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>
                {detectedAllergens.length > 0 ? 'Allergènes détectés !' : 'Aucun allergène détecté'}
              </Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(4), textAlign: 'center' }}>
                Analyse basée sur votre profil allergique
              </Text>
            </View>

            {/* Description du plat */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14),
              padding: wp(14), marginBottom: wp(16),
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            }}>
              <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(4) }}>
                {scanResults?.documentType || 'Plat identifié'}
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', lineHeight: fp(19) }}>
                {scanResults?.summary || ''}
              </Text>
            </View>

            {/* Allergènes trouvés */}
            {detectedAllergens.length > 0 && (
              <View style={{ marginBottom: wp(16) }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FF6B6B', marginBottom: wp(10) }}>
                  Attention — Allergènes dans ce plat
                </Text>
                {detectedAllergens.map((allergen, i) => (
                  <View key={i} style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,107,107,0.08)', borderRadius: wp(12),
                    padding: wp(12), marginBottom: wp(8),
                    borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)',
                  }}>
                    <View style={{
                      width: wp(36), height: wp(36), borderRadius: wp(18),
                      backgroundColor: allergen.severity === 'severe' ? 'rgba(255,107,107,0.2)' : 'rgba(255,140,66,0.2)',
                      justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                    }}>
                      <Text style={{ fontSize: fp(16) }}>{'⚠'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{allergen.allergen}</Text>
                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>
                        Sévérité : {allergen.severity === 'severe' ? 'Sévère' : allergen.severity === 'moderate' ? 'Modéré' : 'Léger'}
                      </Text>
                    </View>
                    <View style={{
                      paddingHorizontal: wp(8), paddingVertical: wp(3),
                      backgroundColor: allergen.severity === 'severe' ? 'rgba(255,107,107,0.2)' : 'rgba(255,140,66,0.2)',
                      borderRadius: wp(6),
                    }}>
                      <Text style={{
                        fontSize: fp(9), fontWeight: '700',
                        color: allergen.severity === 'severe' ? '#FF6B6B' : '#FF8C42',
                      }}>
                        {allergen.severity === 'severe' ? 'DANGER' : 'ATTENTION'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Message de redirection vers Repas */}
            <View style={{
              backgroundColor: 'rgba(77,166,255,0.08)', borderRadius: wp(14),
              padding: wp(14), marginBottom: wp(24),
              borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)',
              flexDirection: 'row', alignItems: 'center',
            }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(10) }}>
                <Circle cx="12" cy="12" r="10" stroke="#4DA6FF" strokeWidth="1.5"/>
                <Line x1="12" y1="8" x2="12" y2="12" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round"/>
                <Circle cx="12" cy="16" r="0.5" fill="#4DA6FF"/>
              </Svg>
              <Text style={{ fontSize: fp(12), color: 'rgba(77,166,255,0.8)', flex: 1, lineHeight: fp(17) }}>
                Pour connaître les calories et macronutriments de ce plat, utilisez le scan de la page Repas.
              </Text>
            </View>

            {/* Bouton retour */}
            <Pressable
              delayPressIn={120}
              onPress={() => { setUploadState('idle'); setScanResults(null); setScanSteps([]); }}
              style={{
                paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                marginBottom: wp(20),
              }}
            >
              <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Compris, merci</Text>
            </Pressable>

            <View style={{ height: wp(70) }} />
          </View>
        </ScrollView>
      );
    }

    // Résultats médicaux standard
    return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1A1D22' }} contentContainerStyle={{ paddingBottom: wp(50) }}>
      <View style={{ paddingHorizontal: wp(16), paddingTop: wp(20) }}>
        {/* Bouton retour */}
        <Pressable
          onPress={() => {
            showMbModal('confirm', 'Quitter l\'analyse ?', 'Les données extraites seront perdues.', { confirmText: 'Quitter', cancelText: 'Continuer', onConfirm: function() { closeMbModal(); setUploadState('idle'); setScanResults(null); setScanSteps([]); } });
          }}
          style={{
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            marginBottom: wp(8),
          }}
        >
          <Text style={{ color: '#FFF', fontSize: fp(18) }}>{"<"}</Text>
        </Pressable>

        {/* Header résultats */}
        <View style={{ alignItems: 'center', marginBottom: wp(24) }}>
          <View style={{
            width: wp(50), height: wp(50), borderRadius: wp(25),
            backgroundColor: 'rgba(0,217,132,0.12)',
            justifyContent: 'center', alignItems: 'center', marginBottom: wp(12),
          }}>
            <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
          <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>Analyse terminée</Text>
          {scanResults && scanResults._batchPhotoCount ? (
            <Text style={{ fontSize: fp(12), color: '#9B6DFF', fontWeight: '600', marginTop: wp(4) }}>
              {'Batch de ' + scanResults._batchPhotoCount + ' photos analysées'}
            </Text>
          ) : null}
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>
            Vérifiez les données avant de valider
          </Text>
        </View>

        {/* Info document */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14),
          marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
            {scanResults?.documentType}
          </Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)' }}>
            {scanResults?.date} — {scanResults?.source}
          </Text>
          {scanResults?.laboratory && scanResults.laboratory !== 'Non spécifié' && (
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>
              {scanResults.laboratory}
            </Text>
          )}
          <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.6)', marginTop: wp(8), lineHeight: fp(19) }}>
            {scanResults?.summary}
          </Text>
        </View>

        {/* Données extraites */}
        <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
          Données extraites
        </Text>
        {scanResults?.data.map((item, index) => (
          <View key={index} style={{
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: wp(12), paddingHorizontal: wp(12),
            backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(10), marginBottom: wp(6),
            borderLeftWidth: wp(3),
            borderLeftColor: item.status === 'normal' ? '#00D984' : item.status === 'elevated' ? '#FF8C42' : '#FF6B6B',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{item.label}</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>Réf: {item.ref}</Text>
            </View>
            <Text style={{
              fontSize: fp(14), fontWeight: '700',
              color: item.status === 'normal' ? '#00D984' : item.status === 'elevated' ? '#FF8C42' : '#FF6B6B',
            }}>{item.value}</Text>
          </View>
        ))}

        {/* Section Médicaments */}
        {scanResults?.medications && scanResults.medications.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
              Médicaments détectés
            </Text>
            {scanResults.medications.map((med, i) => (
              <View key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
                padding: wp(14), marginBottom: wp(8),
                borderLeftWidth: 3, borderLeftColor: '#4DA6FF',
              }}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{med.name}</Text>
                {med.dosage && (
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginTop: wp(3) }}>
                    {med.dosage}{med.frequency ? ' — ' + med.frequency : ''}
                  </Text>
                )}
                {med.duration && (
                  <Text style={{ fontSize: fp(12), color: '#00D984', marginTop: wp(2) }}>
                    Durée : {med.duration}
                  </Text>
                )}
                {med.notes && (
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginTop: wp(4) }}>
                    {med.notes}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Vaccinations */}
        {scanResults?.vaccinations && scanResults.vaccinations.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
              Vaccins détectés
            </Text>
            {scanResults.vaccinations.map((vac, i) => (
              <View key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
                padding: wp(14), marginBottom: wp(8),
                borderLeftWidth: 3, borderLeftColor: '#00D984',
              }}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{vac.name}</Text>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginTop: wp(3) }}>
                  {vac.date || ''}{vac.dose ? ' — ' + vac.dose : ''}
                </Text>
                {vac.nextDue && (
                  <Text style={{ fontSize: fp(12), color: '#FF8C42', marginTop: wp(2) }}>
                    Prochain rappel : {vac.nextDue}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Allergies */}
        {scanResults?.allergies && scanResults.allergies.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
              Allergies détectées
            </Text>
            {scanResults.allergies.map((allergy, i) => (
              <View key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
                padding: wp(14), marginBottom: wp(8),
                borderLeftWidth: 3,
                borderLeftColor: allergy.severity === 'severe' || allergy.severity === 'life_threatening' ? '#FF6B6B' : '#FF8C42',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', flex: 1 }}>{allergy.allergen}</Text>
                  <View style={{
                    paddingHorizontal: wp(8), paddingVertical: wp(3),
                    backgroundColor: allergy.severity === 'severe' ? 'rgba(255,107,107,0.2)' : 'rgba(255,140,66,0.2)',
                    borderRadius: wp(6),
                  }}>
                    <Text style={{
                      fontSize: fp(9), fontWeight: '700',
                      color: allergy.severity === 'severe' ? '#FF6B6B' : '#FF8C42',
                    }}>
                      {allergy.severity === 'severe' ? 'SÉVÈRE' : allergy.severity === 'moderate' ? 'MODÉRÉ' : allergy.severity === 'mild' ? 'LÉGER' : allergy.severity?.toUpperCase() || ''}
                    </Text>
                  </View>
                </View>
                {allergy.type && (
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginTop: wp(3) }}>
                    Type : {allergy.type}
                  </Text>
                )}
                {allergy.reaction && (
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>
                    Réaction : {allergy.reaction}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Diagnostics */}
        {scanResults?.diagnostics && scanResults.diagnostics.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
              Diagnostics détectés
            </Text>
            {scanResults.diagnostics.map(function(diag, i) {
              var sevColor = diag.severity === 'severe' ? '#FF6B6B' : diag.severity === 'moderate' ? '#FF8C42' : '#00D984';
              return (
                <View key={i} style={{
                  backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
                  padding: wp(14), marginBottom: wp(8),
                  borderLeftWidth: 3, borderLeftColor: '#FF6B6B',
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', flex: 1 }}>{diag.condition_name}</Text>
                    <View style={{ backgroundColor: sevColor + '30', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                      <Text style={{ fontSize: fp(9), fontWeight: '700', color: sevColor }}>
                        {diag.severity === 'severe' ? 'SÉVÈRE' : diag.severity === 'moderate' ? 'MODÉRÉ' : 'LÉGER'}
                      </Text>
                    </View>
                  </View>
                  {diag.notes ? (
                    <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginTop: wp(3), fontStyle: 'italic' }}>{diag.notes}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Section Alertes */}
        {scanResults?.alerts && scanResults.alerts.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FF6B6B', marginBottom: wp(12) }}>
              Points d'attention
            </Text>
            {scanResults.alerts.map((alert, i) => (
              <View key={i} style={{
                backgroundColor: alert.type === 'critical' ? 'rgba(255,107,107,0.08)' : 'rgba(255,140,66,0.08)',
                borderRadius: wp(12), padding: wp(14), marginBottom: wp(8),
                borderWidth: 1,
                borderColor: alert.type === 'critical' ? 'rgba(255,107,107,0.2)' : 'rgba(255,140,66,0.2)',
              }}>
                <Text style={{ fontSize: fp(13), color: alert.type === 'critical' ? '#FF6B6B' : '#FF8C42' }}>
                  {typeof alert === 'string' ? alert : alert.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Boutons */}
        <View style={{ marginTop: wp(28), marginBottom: wp(40) }}>
          <Pressable delayPressIn={120}
            onPress={async () => {
              setUploadState('integrating');

              try {
                if (!userId) { showMbModal('error', 'Erreur', 'Utilisateur non connecté'); setUploadState('idle'); return; }
                const headers = await getAuthHeaders();
                headers['Prefer'] = 'return=minimal';

                var scanDate = scanResults.date || null;
                var fmId = activeProfile === 'self' ? null : activeProfile;

                // Insérer les analyses
                if (scanResults.data && scanResults.data.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/medical_analyses', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.data.map(item => ({
                      user_id: userId,
                      family_member_id: fmId,
                      label: item.label,
                      value: item.value,
                      value_numeric: parseFloat(item.value) || null,
                      reference_range: item.ref || null,
                      status: item.status || 'normal',
                      category: scanResults.category || 'other',
                      analysis_date: item.date || scanDate,
                    }))),
                  });
                }

                // Insérer les médicaments
                if (scanResults.medications && scanResults.medications.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/medications', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.medications.map(med => ({
                      user_id: userId,
                      family_member_id: fmId,
                      name: med.name,
                      dosage: med.dosage || null,
                      frequency: med.frequency || null,
                      duration: med.duration || null,
                      status: 'active',
                      start_date: med.start_date || scanDate,
                    }))),
                  });
                }

                // Insérer les vaccinations
                if (scanResults.vaccinations && scanResults.vaccinations.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/vaccinations', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.vaccinations.map(vac => ({
                      user_id: userId,
                      family_member_id: fmId,
                      vaccine_name: vac.name,
                      administration_date: vac.date || scanDate,
                      dose_number: parseInt(vac.dose) || 1,
                      status: 'completed',
                      next_due_date: vac.nextDue || null,
                    }))),
                  });
                  // Schedule vaccine reminders for those with next_due_date
                  scanResults.vaccinations.forEach(function(vac) {
                    if (vac.nextDue) {
                      NotificationService.scheduleVaccineReminder({
                        vaccine_name: vac.name,
                        next_due_date: vac.nextDue,
                        dose_number: parseInt(vac.dose) || 1,
                      }, userId);
                    }
                  });
                }

                // Insérer les allergies
                if (scanResults.allergies && scanResults.allergies.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/allergies', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.allergies.map(a => ({
                      user_id: userId,
                      family_member_id: fmId,
                      allergen: a.allergen,
                      type: a.type || null,
                      severity: a.severity || 'moderate',
                      reaction: a.reaction || null,
                    }))),
                  });
                }

                // Insérer les diagnostics
                if (scanResults.diagnostics && scanResults.diagnostics.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/diagnostics', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.diagnostics.map(function(d) {
                      return {
                        user_id: userId,
                        family_member_id: fmId,
                        condition_name: d.condition_name,
                        severity: d.severity || 'moderate',
                        status: d.status || 'active',
                        notes: d.notes || null,
                        diagnosed_date: d.diagnosed_date || scanDate,
                        diagnosed_by: d.diagnosed_by || null,
                        source: 'scan',
                      };
                    })),
                  });
                }

                // Sauvegarder le document scanné
                await fetch(SUPABASE_URL + '/rest/v1/scanned_documents', {
                  method: 'POST', headers,
                  body: JSON.stringify({
                    user_id: userId,
                    family_member_id: fmId,
                    document_type: scanResults.documentType || 'Document',
                    summary: scanResults.summary || '',
                    raw_ai_response: scanResults,
                    scan_context: 'medibook',
                    items_extracted: (scanResults.data?.length || 0) + (scanResults.medications?.length || 0) + (scanResults.vaccinations?.length || 0) + (scanResults.allergies?.length || 0) + (scanResults.diagnostics?.length || 0),
                    batch_id: scanResults._batchId || null,
                    energy_cost: scanResults._energyCost || null,
                  }),
                });

                // Succès
                setScanResults(null);
                setScanSteps([]);
                setUploadState('idle');

                showMbModal('success', 'Données intégrées ✓', 'Les informations ont été ajoutées à votre MediBook. Consultez Mes Stats pour voir les résultats.');

                // Recharger les données médicales
                loadMedicalData();

              } catch (error) {
                console.error('Erreur intégration:', error);
                setUploadState('idle');
                showMbModal('error', 'Erreur', 'L\'intégration a échoué. Réessayez.');
              }
            }}>
            <LinearGradient colors={['#00D984', '#00B871']}
              style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(10) }}>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Valider et intégrer</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.7)', marginTop: wp(2) }}>
                Intégrer dans votre MediBook
              </Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => { setUploadState('idle'); setScanResults(null); setScanSteps([]); }}
            style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.4)' }}>Rejeter et supprimer</Text>
          </Pressable>
        </View>
      </View>
      <BottomSpacer />
    </ScrollView>
  );
  };

  // ── CAPTURE CARNET PAGE ──────────────────────────────────────────────────

  // ── LIXUM TABLE COMPONENT ───────────────────────────────────────────────
  const renderLixumTable = (title, columns, rows, accentColor = '#00D984', onTransfer = null) => {
    return (
      <View style={{
        backgroundColor: '#FAFBFC', borderRadius: wp(16),
        overflow: 'hidden', marginBottom: wp(12),
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
      }}>
        <LinearGradient
          colors={['#3A3F46', '#252A30']}
          style={{
            flexDirection: 'row', paddingVertical: wp(10), paddingHorizontal: wp(12),
            borderTopLeftRadius: wp(16), borderTopRightRadius: wp(16),
          }}
        >
          {columns.map((col, i) => (
            <Text key={i} style={{
              flex: col.flex || 1,
              fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.7)',
              letterSpacing: 0.5, textTransform: 'uppercase',
              textAlign: col.align || 'left',
            }}>
              {col.label}
            </Text>
          ))}
          {onTransfer && (
            <Text style={{ width: wp(30), marginLeft: wp(8), fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>{'🔒'}</Text>
          )}
        </LinearGradient>

        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: wp(10), paddingHorizontal: wp(12),
            borderBottomWidth: rowIndex < rows.length - 1 ? 1 : 0,
            borderBottomColor: 'rgba(0,0,0,0.04)',
            backgroundColor: rowIndex % 2 === 0 ? '#FAFBFC' : '#F5F6F8',
          }}>
            {row.map((cell, cellIndex) => {
              const cellData = typeof cell === 'object' ? cell : { text: cell };
              return (
                <Text key={cellIndex} style={{
                  flex: columns[cellIndex]?.flex || 1,
                  fontSize: fp(12),
                  fontWeight: cellData.bold ? '600' : '400',
                  color: cellData.color || '#2D3436',
                  textAlign: columns[cellIndex]?.align || 'left',
                }}>
                  {cellData.text || cell}
                </Text>
              );
            })}
            {onTransfer && (
              <Pressable
                onPress={() => onTransfer(rowIndex, row)}
                style={{
                  width: wp(30), height: wp(28), borderRadius: wp(8),
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  justifyContent: 'center', alignItems: 'center',
                  marginLeft: wp(8),
                }}
              >
                <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round"/>
                </Svg>
              </Pressable>
            )}
          </View>
        ))}

        {rows.length === 0 && (
          <View style={{ padding: wp(20), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>
              Aucune donnée enregistrée
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ── PROFILE SWITCH BUTTON COMPONENT ──────────────────────────────────────
  const renderProfileSwitchButton = () => (
    <Pressable
      onPress={() => setShowProfileSwitcher(true)}
      delayPressIn={120}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,217,132,0.12)',
        borderRadius: wp(12),
        paddingHorizontal: wp(8),
        paddingVertical: wp(5),
        borderWidth: 1,
        borderColor: 'rgba(0,217,132,0.2)',
        maxWidth: wp(90),
      }}
    >
      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(4) }}>
        <Path d="M17 1l4 4-4 4" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M3 11V9a4 4 0 014-4h14" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M7 23l-4-4 4-4" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M21 13v2a4 4 0 01-4 4H3" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
      <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }} numberOfLines={1}>
        {activeProfile === 'self' ? 'Moi' : (children.find(c => c.id === activeProfile)?.name || 'Enfant')}
      </Text>
    </Pressable>
  );

  // ── RENDER MEDIBOOK LANDING ────────────────────────────────────────────────
  const renderMediBookLanding = () => (
    <View style={{ flex: 1, backgroundColor: '#1A2029' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#3A3F46', '#252A30']}
        style={{
          paddingTop: Platform.OS === 'android' ? 35 : 50,
          paddingBottom: wp(12), paddingHorizontal: wp(12),
          flexDirection: 'row', alignItems: 'center',
          borderBottomWidth: 1, borderBottomColor: '#4A4F55',
        }}
      >
        <Pressable delayPressIn={120} onPress={() => { setMediBookView('landing'); setCurrentSubPage('main'); }}
          style={({ pressed }) => ({
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            marginRight: wp(10),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>MediBook</Text>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Votre rapport santé</Text>
        </View>
        {renderProfileSwitchButton()}
        <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(10), paddingHorizontal: wp(8), paddingVertical: wp(4), marginLeft: wp(6) }}>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>{(auth.lixBalance || 0) + ' Lix'}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(20), paddingBottom: wp(50) }}>
        {/* Bouton Ajouter des données de santé — accès direct */}
        <Pressable delayPressIn={120} onPress={function() { setShowAddDataSheet(true); }}>
          <LinearGradient
            colors={['#00D98420', '#00D98408']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: wp(14), padding: wp(14),
              marginBottom: wp(14), borderWidth: 1, borderColor: '#00D98440',
            }}>
            <View style={{ width: wp(40), height: wp(40), borderRadius: wp(12), backgroundColor: '#00D984', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
              <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                <Line x1="12" y1="5" x2="12" y2="19" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
                <Line x1="5" y1="12" x2="19" y2="12" stroke="#000" strokeWidth="2.5" strokeLinecap="round"/>
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Ajouter des données de santé</Text>
              <Text style={{ fontSize: fp(11), color: '#00D98499', marginTop: wp(2) }}>Vaccins, médicaments, analyses...</Text>
            </View>
            <Text style={{ fontSize: fp(16), color: '#00D984' }}>{"›"}</Text>
          </LinearGradient>
        </Pressable>

        {/* Carte 1 : Importer mon carnet de santé */}
        <Pressable delayPressIn={120} onPress={() => setMediBookView('carnet')}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              borderRadius: wp(16), padding: wp(16),
              marginBottom: wp(10), borderWidth: 1, borderColor: '#4A4F55',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: wp(10) }}>
              <Svg width={wp(36)} height={wp(36)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="16" height="20" rx="2" stroke="#00D984" strokeWidth="1.5"/>
                <Line x1="4" y1="2" x2="4" y2="22" stroke="#00D984" strokeWidth="3" strokeLinecap="round"/>
                <Line x1="8" y1="6" x2="16" y2="6" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Line x1="8" y1="10" x2="16" y2="10" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Line x1="8" y1="14" x2="14" y2="14" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Circle cx="18" cy="18" r="5" fill="#252A30" stroke="#00D984" strokeWidth="1.5"/>
                <Circle cx="18" cy="18" r="2" stroke="#00D984" strokeWidth="1.2"/>
              </Svg>
            </View>
            <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: wp(4) }}>
              Importer mon carnet de santé
            </Text>
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: fp(15) }}>
              Photographiez les pages de votre carnet physique.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Carte 2 : Assistance médicale */}
        <Pressable delayPressIn={120} onPress={function() { setMediBookView('assistance'); }}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              borderRadius: wp(16), padding: wp(16),
              marginBottom: wp(10), borderWidth: 1, borderColor: '#4A4F55',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: wp(10) }}>
              <Svg width={wp(36)} height={wp(36)} viewBox="0 0 24 24" fill="none">
                <Path d="M4.8 2.3A.3.3 0 015 2h14a.3.3 0 01.3.3v19.4a.3.3 0 01-.3.3H5a.3.3 0 01-.2-.3V2.3z" stroke="#9B8ACF" strokeWidth="1.5" />
                <Path d="M12 6v4m-2-2h4" stroke="#9B8ACF" strokeWidth="1.5" strokeLinecap="round" />
                <Circle cx="12" cy="15" r="2.5" stroke="#9B8ACF" strokeWidth="1.5" />
                <Path d="M9.5 17.5L8 22m5-4.5L14.5 22" stroke="#9B8ACF" strokeWidth="1.2" strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: wp(4) }}>
              Assistance médicale
            </Text>
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: fp(15) }}>
              QR code, PDF, consultation live
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Carte 3 : Mes Stats */}
        <Pressable delayPressIn={120} onPress={function() { setMediBookView('stats'); }}
          style={function(state) { return {
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#2A303B', borderRadius: wp(14),
            padding: wp(16), borderWidth: 1, borderColor: '#3A3F46',
            gap: wp(12),
            transform: [{ scale: state.pressed ? 0.97 : 1 }],
          }; }}>
          <View style={{ width: wp(40), height: wp(40), borderRadius: wp(10), backgroundColor: '#00D98415', justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
              <Line x1="18" y1="20" x2="18" y2="10" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
              <Line x1="12" y1="20" x2="12" y2="4" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
              <Line x1="6" y1="20" x2="6" y2="14" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Mes Stats</Text>
            <Text style={{ fontSize: fp(11), color: '#888' }}>Graphiques et évolution santé</Text>
          </View>
          <Text style={{ fontSize: fp(14), color: '#555' }}>{">"}</Text>
        </Pressable>

        {/* Section info en bas du landing */}
        <View style={{ marginTop: wp(20), paddingHorizontal: wp(4) }}>
          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
            Comment ça marche ?
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(14) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(0,217,132,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '700' }}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>
                Photographiez ou importez
              </Text>
              <Text style={{ fontSize: fp(11), color: '#888', lineHeight: fp(16) }}>
                Votre carnet de santé, bilans, ordonnances, résultats d'analyses...
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(14) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(77,166,255,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#4DA6FF', fontSize: fp(13), fontWeight: '700' }}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>
                ALIXEN analyse tout
              </Text>
              <Text style={{ fontSize: fp(11), color: '#888', lineHeight: fp(16) }}>
                Vaccins, médicaments, diagnostics, allergies — chaque info va dans la bonne section.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(20) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(212,175,55,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#D4AF37', fontSize: fp(13), fontWeight: '700' }}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>
                Générez votre MediBook
              </Text>
              <Text style={{ fontSize: fp(11), color: '#888', lineHeight: fp(16) }}>
                Un rapport PDF complet à imprimer pour votre médecin. 500 Lix.
              </Text>
            </View>
          </View>
        </View>
        <BottomSpacer />
      </ScrollView>

      {/* BottomSheet — Ajouter des données de santé */}
      <Modal visible={showAddDataSheet} transparent animationType="slide"
        onRequestClose={function() { setShowAddDataSheet(false); }}>
        <Pressable onPress={function() { setShowAddDataSheet(false); }}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <Pressable onPress={function(e) { e.stopPropagation(); }}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34) }}>
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }}/>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>Ajouter des données</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(16) }}>Choisissez le type de données à ajouter</Text>

              {[
                { icon: '📷', label: 'Scanner un document', sub: 'Photo ou galerie', onPress: function() { setShowAddDataSheet(false); setTimeout(function() { setShowMediBookUploadSheet(true); }, 300); } },
                { icon: '💊', label: 'Ajouter un médicament', sub: 'Traitement en cours', onPress: function() { setShowAddDataSheet(false); setTimeout(function() { setShowAddMedSheet(true); }, 300); } },
                { icon: '🏥', label: 'Ajouter un diagnostic', sub: 'Pathologie à surveiller', onPress: function() { setShowAddDataSheet(false); setTimeout(function() { setShowAddDiagSheet(true); }, 300); } },
                { icon: '💉', label: 'Ajouter un vaccin', sub: 'Carnet vaccinal', onPress: function() { setShowAddDataSheet(false); setTimeout(function() { setShowAddVaccSheet(true); }, 300); } },
                { icon: '⚠️', label: 'Ajouter une allergie', sub: 'Profil allergique', onPress: function() { setShowAddDataSheet(false); setTimeout(function() { setShowAddAllergySheet(true); }, 300); } },
                { icon: '🔬', label: 'Planifier une analyse', sub: 'Bilan à venir', onPress: function() { setShowAddDataSheet(false); setTimeout(function() { setShowAddAnalysisSheet(true); }, 300); } },
              ].map(function(opt, oi) {
                return (
                  <Pressable key={oi} delayPressIn={120} onPress={opt.onPress}
                    style={function(state) { return {
                      flexDirection: 'row', alignItems: 'center',
                      paddingVertical: wp(12), paddingHorizontal: wp(10),
                      backgroundColor: state.pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                      borderRadius: wp(12), marginBottom: wp(6),
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                    }; }}>
                    <Text style={{ fontSize: fp(18), marginRight: wp(12) }}>{opt.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{opt.label}</Text>
                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)' }}>{opt.sub}</Text>
                    </View>
                    <Text style={{ fontSize: fp(16), color: 'rgba(255,255,255,0.2)' }}>{">"}</Text>
                  </Pressable>
                );
              })}

              <Pressable onPress={function() { setShowAddDataSheet(false); }}
                style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(6), borderRadius: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Fermer</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );

  // ── RENDER CARNET CAPTURE ──────────────────────────────────────────────────
  const renderCarnetCapture = () => {
    const caseSize = (Dimensions.get('window').width - wp(16) * 2 - wp(8) * 2) / 3;
    const capturedCount = carnetPhotos.filter(p => p).length;

    return (
      <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}
        >
          <Pressable delayPressIn={120} onPress={() => setMediBookView('landing')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>Carnet de santé</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>10 pages maximum</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(50) }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) }}>
            {Array.from({ length: 10 }, (_, index) => (
              carnetPhotos[index] ? (
                <Pressable
                  key={index}
                  onPress={() => {
                    showMbModal('confirm', 'Page ' + (index + 1), 'Supprimer cette photo ?', { confirmText: 'Supprimer', onConfirm: function() { closeMbModal(); setCarnetPhotos(function(prev) { var updated = prev.slice(); updated[index] = undefined; return updated; }); } });
                  }}
                  style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), overflow: 'hidden',
                    borderWidth: 2, borderColor: '#00D984',
                  }}
                >
                  <Image
                    source={{ uri: carnetPhotos[index].uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  <View style={{
                    position: 'absolute', top: wp(2), left: wp(2),
                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: wp(8),
                    paddingHorizontal: wp(4), paddingVertical: wp(1),
                  }}>
                    <Text style={{ color: '#FFF', fontSize: fp(8), fontWeight: '700' }}>{index + 1}</Text>
                  </View>
                </Pressable>
              ) : (index === 0 && capturedCount === 0) ? (
                <Pressable key={index} onPress={() => captureCarnetPage(0)}>
                  <Animated.View style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), borderWidth: 2,
                    borderColor: '#00D984', borderStyle: 'dashed',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(0,217,132,0.08)',
                    transform: [{ scale: carnetPulseAnim }],
                  }}>
                    <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none" style={{ marginBottom: wp(4) }}>
                      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <Circle cx="12" cy="13" r="4" stroke="#00D984" strokeWidth="1.5"/>
                    </Svg>
                    <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '600' }}>
                      Commencez ici
                    </Text>
                  </Animated.View>
                </Pressable>
              ) : (
                <Pressable
                  key={index}
                  onPress={() => captureCarnetPage(index)}
                  style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fp(16) }}>+</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.15)', fontSize: fp(8), marginTop: wp(2) }}>{index + 1}</Text>
                </Pressable>
              )
            ))}
          </View>

          <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: wp(12) }}>
            {capturedCount} page{capturedCount > 1 ? 's' : ''} capturée{capturedCount > 1 ? 's' : ''} sur 10
          </Text>

          {capturedCount > 0 && (
            <View style={{ marginTop: wp(20), paddingHorizontal: wp(8) }}>
              <Pressable
                delayPressIn={120}
                onPress={function() {
                  var photos = carnetPhotos.filter(function(p) { return p; });
                  if (photos.length === 0) return;
                  if (photos.length > 10) {
                    showMbModal('info', 'Limite atteinte', 'Maximum 10 photos par analyse. Vous avez ' + photos.length + ' pages. Veuillez en retirer pour continuer.');
                    return;
                  }
                  // Use batch scan to send ALL photos (groups of 5, same as "Plusieurs photos")
                  if (startBatchScan) {
                    var batchReady = photos.map(function(p) { return { uri: p.uri, base64: p.base64 }; });
                    startBatchScan(batchReady, 'carnet');
                  }
                }}
              >
                <LinearGradient
                  colors={['#00D984', '#00B871']}
                  style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center' }}
                >
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>
                    Intégrer ({capturedCount} page{capturedCount > 1 ? 's' : ''})
                  </Text>
                </LinearGradient>
              </Pressable>
              <Text style={{
                fontSize: fp(12), color: 'rgba(255,255,255,0.3)',
                textAlign: 'center', marginTop: wp(10),
              }}>
                Vous pouvez ajouter d'autres pages avant d'intégrer
              </Text>
            </View>
          )}
          <BottomSpacer />
        </ScrollView>
      </View>
    );
  };

  // ── RENDER MEDIBOOK STATS (PREMIUM DARK REDESIGN) ──────────────────────────
  var renderMediBookStats = function() {
    var familyMemberId = activeProfile !== 'self' ? activeProfile : null;
    // ── Progress percentages (real data) ──
    var nutAvg = nutritionStats.length > 0 ? Math.round(nutritionStats.reduce(function(s, d) { return s + (d.total_kcal || 0); }, 0) / nutritionStats.length) : 0;
    var nutritionPercent = Math.min(100, Math.round((nutAvg / 2100) * 100));
    var vitalitePercent = medicalData.vitalityScore || 0;
    var humeurPercent = moodStats.length > 0 ? Math.round(moodStats.reduce(function(s, d) { return s + (d.max_gauge_percent || 0); }, 0) / moodStats.length) : 0;
    var actAvgBurned = activityStats.length > 0 ? Math.round(activityStats.reduce(function(s, d) { return s + (d.total_calories_burned || 0); }, 0) / activityStats.length) : 0;
    var activitePercent = Math.min(100, Math.round((actAvgBurned / 500) * 100));
    var santePercent = statsVaccData ? Math.round(statsVaccData.completion_percent || 0) : 0;

    var TAB_ITEMS = [
      { key: 'nutrition', emoji: '🥗', label: 'NUTRITION', color: '#00D984', pct: nutritionPercent, top: 0, leftPct: 50, anchor: 'center', big: true },
      { key: 'vitalite', emoji: '💚', label: 'VITALITE', color: '#9B8ACF', pct: vitalitePercent, top: wp(40), leftPct: 8, anchor: 'left', big: false },
      { key: 'humeur', emoji: '😊', label: 'HUMEUR', color: '#FFD93D', pct: humeurPercent, top: wp(40), leftPct: 92, anchor: 'right', big: false },
      { key: 'activite', emoji: '🏃', label: 'ACTIVITE', color: '#4DA6FF', pct: activitePercent, top: wp(88), leftPct: 22, anchor: 'left', big: false },
      { key: 'sante', emoji: '🏥', label: 'SANTE', color: '#FF6B8A', pct: santePercent, top: wp(88), leftPct: 78, anchor: 'right', big: false }
    ];
    var TIME_RANGES = [
      { key: '7d', label: '7J', days: 7 },
      { key: '30d', label: '30J', days: 30 },
      { key: '365d', label: '1A', days: 365 },
      { key: 'all', label: 'Origine', days: 9999 }
    ];
    var containerW = SCREEN_WIDTH - wp(32);

    // ── Handle time range tap ──
    var onTimeRangeTap = function(range) {
      var access = rangeAccess[range.key];
      if (access && !access.has_access) {
        setUnlockTarget(range);
        setShowUnlockModal(true);
        return;
      }
      setSelectedRange(range);
      loadAllStats(range.days);
    };

    // ── Render progress ring bubble ──
    var renderBubble = function(tab) {
      var isActive = statsTab === tab.key;
      var trackR = tab.big ? wp(42) : wp(35);
      var innerR = tab.big ? wp(34) : wp(28);
      var svgSize = (trackR + 4) * 2;
      var half = svgSize / 2;
      var sw = isActive ? 3 : 2.5;
      var circ = 2 * Math.PI * trackR;
      var offset = circ - (tab.pct / 100) * circ;
      var emojiSz = tab.big ? fp(22) : fp(18);
      var labelSz = tab.big ? fp(8) : fp(7);

      var posStyle = {};
      if (tab.anchor === 'center') {
        posStyle = { left: (containerW - svgSize) / 2 };
      } else if (tab.anchor === 'left') {
        posStyle = { left: containerW * (tab.leftPct / 100) };
      } else {
        posStyle = { right: containerW * ((100 - tab.leftPct) / 100) };
      }
      return (
        <Pressable key={tab.key} delayPressIn={120}
          onPress={function() { _nutAnimRan.current = false; setStatsTab(tab.key); }}
          style={function(state) { return Object.assign({
            position: 'absolute', top: tab.top,
            width: svgSize, height: svgSize,
            transform: [{ scale: state.pressed ? 0.9 : (isActive ? 1.05 : 1) }],
          }, posStyle); }}>
          <Svg width={svgSize} height={svgSize}>
            <Circle cx={half} cy={half} r={trackR} stroke="#3A3F46" strokeWidth={sw} fill="none" />
            <Circle cx={half} cy={half} r={trackR} stroke={tab.color} strokeWidth={sw} fill="none"
              strokeDasharray={String(circ)} strokeDashoffset={String(offset)}
              strokeLinecap="round" rotation="-90" origin={half + ',' + half} />
            <Circle cx={half} cy={half} r={innerR} fill={isActive ? '#252A30' : '#2A303B'} />
            <SvgText x={half} y={half - 2} textAnchor="middle" fontSize={emojiSz} fill="white">{tab.emoji}</SvgText>
            <SvgText x={half} y={half + (tab.big ? 14 : 12)} textAnchor="middle"
              fontSize={labelSz} fontWeight={isActive ? '600' : '400'}
              fill={isActive ? tab.color : '#888'}>{tab.label}</SvgText>
          </Svg>
        </Pressable>
      );
    };
    // ── NUTRITION TAB ──
    var renderNutritionContent = function() {
      var data = nutritionStats;
      var hasData = data && data.length > 0;
      if (!hasData) {
        return (
          <View style={{ padding: wp(40), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(40), marginBottom: wp(12) }}>🥗</Text>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Pas de données nutrition</Text>
            <Text style={{ fontSize: fp(12), color: '#888', marginTop: wp(4) }}>Commencez à tracker vos repas !</Text>
          </View>
        );
      }
      var avgCalories = Math.round(data.reduce(function(s, d) { return s + (d.total_kcal || 0); }, 0) / data.length);
      var avgProtein = Math.round(data.reduce(function(s, d) { return s + (d.total_protein || 0); }, 0) / data.length);
      var avgCarbs = Math.round(data.reduce(function(s, d) { return s + (d.total_carbs || 0); }, 0) / data.length);
      var avgFat = Math.round(data.reduce(function(s, d) { return s + (d.total_fat || 0); }, 0) / data.length);
      var avgFiber = Math.round(data.reduce(function(s, d) { return s + (d.total_fiber || 0); }, 0) / data.length);
      var avgMeals = (data.reduce(function(s, d) { return s + (d.meal_count || 0); }, 0) / data.length).toFixed(1);
      var objectifCal = 2100;
      var calPct = Math.min(100, Math.round((avgCalories / objectifCal) * 100));
      var deltaVsObj = Math.round(((avgCalories - objectifCal) / objectifCal) * 100);
      var totalMacros = avgProtein + avgCarbs + avgFat || 1;
      var pctProtein = Math.round((avgProtein / totalMacros) * 100);
      var pctCarbs = Math.round((avgCarbs / totalMacros) * 100);
      var pctFat = 100 - pctProtein - pctCarbs;

      var hydData = hydrationStats;
      var avgHydration = hydData && hydData.length > 0
        ? Math.round(hydData.reduce(function(s, d) { return s + (d.total_ml || 0); }, 0) / hydData.length) : 0;
      var hydObjectif = 2500;
      var hydPct = Math.min(100, Math.round((avgHydration / hydObjectif) * 100));

      var chartW = SCREEN_WIDTH - wp(64);
      var chartH = wp(120);
      var maxCal = Math.max.apply(null, data.map(function(d) { return d.total_kcal || 0; }).concat([objectifCal + 200]));
      var points = data.map(function(d, i) {
        var x = data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2;
        var y = chartH - ((d.total_kcal || 0) / maxCal) * (chartH - wp(10));
        return x + ',' + y;
      }).join(' ');
      var areaPoints = '0,' + chartH + ' ' + points + ' ' + chartW + ',' + chartH;
      var objY = chartH - (objectifCal / maxCal) * (chartH - wp(10));

      // Animations — use top-level refs, trigger imperatively
      if (!_nutAnimRan.current) {
        _nutAnimRan.current = true;
        // Reset animated values
        _nutCalBarAnim.setValue(0); _nutProtBarAnim.setValue(0);
        _nutCarbBarAnim.setValue(0); _nutFatBarAnim.setValue(0);
        _nutCurveOpacity.setValue(0); _nutHydBarAnim.setValue(0);
        // Counter animation
        var target = avgCalories; var steps = 30;
        var stepVal = target / steps; var stepDelay = 600 / steps; var cur = 0;
        var iv = setInterval(function() {
          cur += stepVal;
          if (cur >= target) { setNutDisplayCal(target); clearInterval(iv); }
          else { setNutDisplayCal(Math.round(cur)); }
        }, stepDelay);
        // Bars stagger
        Animated.stagger(100, [
          Animated.timing(_nutCalBarAnim, { toValue: calPct, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
          Animated.timing(_nutProtBarAnim, { toValue: pctProtein, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
          Animated.timing(_nutCarbBarAnim, { toValue: pctCarbs, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
          Animated.timing(_nutFatBarAnim, { toValue: pctFat, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
        ]).start();
        Animated.timing(_nutCurveOpacity, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
        Animated.timing(_nutHydBarAnim, { toValue: hydPct, duration: 600, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
      }

      var calBarWidth = _nutCalBarAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
      var protBarWidth = _nutProtBarAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
      var carbBarWidth = _nutCarbBarAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
      var fatBarWidth = _nutFatBarAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
      var hydBarWidth = _nutHydBarAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
      var macroBarWidths = [protBarWidth, carbBarWidth, fatBarWidth];
      var selectedPoint = nutSelectedPoint; var setSelectedPoint = setNutSelectedPoint;

      return (
        <Pressable onPress={function() { setSelectedPoint(null); }} style={{ flex: 1 }}>
        <View>
          {/* Hero — Calories */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#888', letterSpacing: 1 }}>CALORIES MOY. / JOUR</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: wp(6) }}>
              <Text style={{ fontSize: fp(28), fontWeight: '800', color: '#FFF' }}>{nutDisplayCal}</Text>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#888', marginLeft: wp(4) }}>kcal</Text>
              <View style={{ flex: 1 }} />
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: deltaVsObj < 0 ? '#FF6B8A' : '#00D984' }}>{(deltaVsObj > 0 ? '+' : '') + deltaVsObj + '% vs obj'}</Text>
            </View>
            <Text style={{ fontSize: fp(11), color: '#888', marginTop: wp(2) }}>{'Objectif : ' + objectifCal + ' kcal'}</Text>
            <View style={{ height: wp(6), backgroundColor: '#1E2530', borderRadius: wp(3), marginTop: wp(10) }}>
              <Animated.View style={{ width: calBarWidth, height: '100%', backgroundColor: '#00D984', borderRadius: wp(3) }} />
            </View>
            <Text style={{ fontSize: fp(10), color: '#00D984', textAlign: 'right', marginTop: wp(4) }}>{calPct + '%'}</Text>
          </View>

          {/* Macros — 3 mini cartes */}
          <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(12) }}>
            {[
              { label: 'Protéines', value: avgProtein + 'g', pct: pctProtein, color: '#4DA6FF' },
              { label: 'Glucides', value: avgCarbs + 'g', pct: pctCarbs, color: '#00D984' },
              { label: 'Lipides', value: avgFat + 'g', pct: pctFat, color: '#FFD93D' },
            ].map(function(m, i) {
              return (
                <View key={i} style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12) }}>
                  <Text style={{ fontSize: fp(11), fontWeight: '600', color: '#FFF' }}>{m.label}</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: m.color, marginTop: wp(4) }}>{m.value}</Text>
                  <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>{m.pct + '%'}</Text>
                  <View style={{ height: wp(4), backgroundColor: '#1E2530', borderRadius: wp(2), marginTop: wp(6) }}>
                    <Animated.View style={{ width: macroBarWidths[i], height: '100%', backgroundColor: m.color, borderRadius: wp(2) }} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Courbe Calories */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Évolution calories</Text>
            <Animated.View style={{ opacity: _nutCurveOpacity }}>
            <Svg width={chartW} height={chartH}>
              <Defs>
                <SvgLinearGradient id="calAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#00D984" stopOpacity="0.3" />
                  <Stop offset="1" stopColor="#00D984" stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              <Polygon points={areaPoints} fill="url(#calAreaGrad)" />
              <Polyline points={points} fill="none" stroke="#00D984" strokeWidth="2" strokeLinejoin="round" />
              <Line x1="0" y1={objY} x2={chartW} y2={objY} stroke="#FF6B8A" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
              {data.map(function(d, i) {
                var x = data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2;
                var y = chartH - ((d.total_kcal || 0) / maxCal) * (chartH - wp(10));
                return <Circle key={i} cx={x} cy={y} r={selectedPoint && selectedPoint.idx === i ? 6 : 3.5} fill="#00D984" />;
              })}
            </Svg>
            {/* Pressable overlays for chart points */}
            {data.map(function(d, i) {
              var x = data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2;
              var y = chartH - ((d.total_kcal || 0) / maxCal) * (chartH - wp(10));
              return (
                <Pressable key={'pt' + i}
                  onPress={function(e) { e.stopPropagation(); setSelectedPoint({ idx: i, value: d.total_kcal || 0, date: d.stat_date, x: x, y: y }); }}
                  style={{ position: 'absolute', left: x - wp(12), top: y - wp(12), width: wp(24), height: wp(24) }} />
              );
            })}
            {/* Tooltip */}
            {selectedPoint ? (
              <View style={{
                position: 'absolute', left: Math.max(0, Math.min(selectedPoint.x - wp(35), chartW - wp(70))),
                top: Math.max(0, selectedPoint.y - wp(40)),
                backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#00D984',
                borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4), alignItems: 'center',
              }}>
                <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700' }}>{selectedPoint.value + ' kcal'}</Text>
                <Text style={{ color: '#888', fontSize: fp(9) }}>{selectedPoint.date ? new Date(selectedPoint.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : ''}</Text>
              </View>
            ) : null}
            </Animated.View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(6) }}>
              {data.length <= 10 ? data.map(function(d, i) {
                var dt = new Date(d.stat_date);
                var lbl = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][dt.getDay()];
                return <Text key={i} style={{ fontSize: fp(8), color: '#666' }}>{lbl}</Text>;
              }) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                  <Text style={{ fontSize: fp(8), color: '#666' }}>{data[0] ? data[0].stat_date.substring(5, 10) : ''}</Text>
                  <Text style={{ fontSize: fp(8), color: '#666' }}>{data[data.length - 1] ? data[data.length - 1].stat_date.substring(5, 10) : ''}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Hydratation */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Hydratation</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(14) }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#4DA6FF' }}>{avgHydration}</Text>
                  <Text style={{ fontSize: fp(12), color: '#888', marginLeft: wp(4) }}>{'/ ' + hydObjectif + ' ml'}</Text>
                </View>
                <View style={{ height: wp(6), backgroundColor: '#1E2530', borderRadius: wp(3), marginTop: wp(8) }}>
                  <Animated.View style={{ width: hydBarWidth, height: '100%', backgroundColor: '#4DA6FF', borderRadius: wp(3) }} />
                </View>
              </View>
              <View style={{ width: wp(50), height: wp(50), justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={wp(50)} height={wp(50)} viewBox="0 0 50 50">
                  <Circle cx="25" cy="25" r="20" stroke="#1E2530" strokeWidth="4" fill="none" />
                  <Circle cx="25" cy="25" r="20" stroke="#4DA6FF" strokeWidth="4" fill="none"
                    strokeDasharray={String(2 * Math.PI * 20)}
                    strokeDashoffset={String(2 * Math.PI * 20 * (1 - hydPct / 100))}
                    strokeLinecap="round" rotation="-90" origin="25,25" />
                </Svg>
                <Text style={{ position: 'absolute', fontSize: fp(10), fontWeight: '700', color: '#4DA6FF' }}>{hydPct + '%'}</Text>
              </View>
            </View>
          </View>

          {/* Mini stats */}
          <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(12) }}>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>{avgMeals}</Text>
              <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>repas/jour</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>{avgFiber + 'g'}</Text>
              <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>fibres/jour</Text>
            </View>
          </View>
        </View>
        </Pressable>
      );
    };

    // ── VITALITÉ TAB ──
    var renderVitaliteContent = function() {
      var vScore = medicalData.vitalityScore || 0;
      var circumference = 2 * Math.PI * 42;
      var offset = circumference * (1 - vScore / 100);

      // Piliers de vitalité — calculs
      var nutData = nutritionStats;
      var nutScore = nutData && nutData.length > 0
        ? Math.min(100, Math.round((nutData.reduce(function(s, d) { return s + (d.total_kcal || 0); }, 0) / nutData.length / 2100) * 100))
        : 0;
      var hydData = hydrationStats;
      var hydScore = hydData && hydData.length > 0
        ? Math.min(100, Math.round((hydData.reduce(function(s, d) { return s + (d.total_ml || 0); }, 0) / hydData.length / 2500) * 100))
        : 0;
      var actData = activityStats;
      var actScore = actData && actData.length > 0
        ? Math.min(100, Math.round((actData.reduce(function(s, d) { return s + (d.total_calories_burned || 0); }, 0) / actData.length / 500) * 100))
        : 0;
      var mData = moodStats;
      var moodScore = mData && mData.length > 0
        ? Math.round(mData.reduce(function(s, d) { return s + (d.max_gauge_percent || 0); }, 0) / mData.length)
        : 0;
      var regScore = nutData && nutData.length > 0 ? Math.min(100, Math.round((nutData.length / selectedRange.days) * 100)) : 0;

      var piliers = [
        { label: 'Nutrition', score: nutScore, color: '#00D984' },
        { label: 'Activité', score: actScore, color: '#4DA6FF' },
        { label: 'Hydratation', score: hydScore, color: '#4DA6FF' },
        { label: 'Régularité', score: regScore, color: '#FFD93D' },
        { label: 'Humeur', score: moodScore, color: '#9B8ACF' }
      ];

      // Courbe vitalité (from daily_summary nutrition data as proxy)
      var chartW = SCREEN_WIDTH - wp(64);
      var chartH = wp(100);

      // Insights non-médicaux
      var nonMedInsights = healthInsights.filter(function(ins) {
        return ins.insight_type !== 'diagnostic' && ins.insight_type !== 'medicament' && ins.insight_type !== 'vaccination' && ins.insight_type !== 'allergie';
      });

      return (
        <View>
          {/* Hero — Anneau Score Vitalité */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(20), marginBottom: wp(12), alignItems: 'center' }}>
            <View style={{ width: wp(120), height: wp(120), justifyContent: 'center', alignItems: 'center' }}>
              <Svg width={wp(120)} height={wp(120)} viewBox="0 0 100 100">
                <Circle cx="50" cy="50" r="42" stroke="#3A3F46" strokeWidth="6" fill="none" />
                <Circle cx="50" cy="50" r="42" stroke="#00D984" strokeWidth="6" fill="none"
                  strokeDasharray={String(circumference)}
                  strokeDashoffset={String(offset)}
                  strokeLinecap="round" rotation="-90" origin="50,50" />
              </Svg>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Text style={{ fontSize: fp(28), fontWeight: '800', color: '#FFF' }}>{vScore}</Text>
                <Text style={{ fontSize: fp(11), color: '#888' }}>/100</Text>
              </View>
            </View>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', marginTop: wp(10) }}>Score Vitalité</Text>
            <Text style={{ fontSize: fp(11), color: '#888', marginTop: wp(2) }}>Moyenne sur la période</Text>
          </View>

          {/* Piliers de vitalité */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Piliers de vitalité</Text>
            {piliers.map(function(p, idx) {
              var barW = Math.max(0, Math.min(100, p.score));
              return (
                <View key={idx} style={{ marginBottom: idx < piliers.length - 1 ? wp(10) : 0 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                    <Text style={{ fontSize: fp(12), fontWeight: '600', color: '#FFF' }}>{p.label}</Text>
                    <Text style={{ fontSize: fp(12), fontWeight: '600', color: p.color }}>{p.score}/100</Text>
                  </View>
                  <View style={{ height: wp(6), backgroundColor: '#1E2530', borderRadius: wp(3) }}>
                    <View style={{ width: barW + '%', height: '100%', backgroundColor: p.color, borderRadius: wp(3) }} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Insights ALIXEN */}
          {nonMedInsights.length > 0 ? (
            <View style={{ marginBottom: wp(12) }}>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>ALIXEN a remarqué...</Text>
              {nonMedInsights.slice(0, 5).map(function(ins, idx) {
                var insColor = ins.insight_color || '#00D984';
                return (
                  <View key={idx} style={{
                    backgroundColor: insColor + '10', borderLeftWidth: wp(3), borderLeftColor: insColor,
                    padding: wp(12), marginBottom: wp(8), borderRadius: 0,
                  }}>
                    <Text style={{ fontSize: fp(12), fontWeight: '600', color: '#FFF' }}>{ins.insight_icon || '💡'} {ins.insight_text || ''}</Text>
                    {ins.insight_value ? <Text style={{ fontSize: fp(11), color: '#888', marginTop: wp(2) }}>{ins.insight_value}</Text> : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      );
    };
    var renderActiviteContent = function() {
      var data = activityStats;
      var hasData = data && data.length > 0;
      if (!hasData) {
        return (
          <View style={{ padding: wp(40), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(40), marginBottom: wp(12) }}>🏃</Text>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Pas de données d'activité</Text>
            <Text style={{ fontSize: fp(12), color: '#888', marginTop: wp(4) }}>Les données apparaîtront depuis votre suivi quotidien</Text>
          </View>
        );
      }
      var avgBurned = Math.round(data.reduce(function(s, d) { return s + (d.total_calories_burned || 0); }, 0) / data.length);
      var avgBalance = Math.round(data.reduce(function(s, d) { return s + (d.calorie_balance || 0); }, 0) / data.length);
      var totalBurned = data.reduce(function(s, d) { return s + (d.total_calories_burned || 0); }, 0);
      var bestDay = data.reduce(function(best, d) { return (d.total_calories_burned || 0) > (best.total_calories_burned || 0) ? d : best; }, data[0]);
      var bestDayDate = bestDay && bestDay.stat_date ? new Date(bestDay.stat_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '-';

      var chartW = SCREEN_WIDTH - wp(64);
      var chartH = wp(100);
      var maxBurned = Math.max.apply(null, data.map(function(d) { return d.total_calories_burned || 0; }).concat([100]));
      var barW = Math.max(wp(8), (chartW / data.length) - wp(4));

      // Balance chart
      var balanceMax = Math.max.apply(null, data.map(function(d) { return Math.abs(d.calorie_balance || 0); }).concat([100]));

      return (
        <View>
          {/* Hero */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#888', letterSpacing: 1 }}>CETTE PÉRIODE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: wp(6) }}>
              <Text style={{ fontSize: fp(28), fontWeight: '800', color: '#FFF' }}>{avgBurned}</Text>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#888', marginLeft: wp(4) }}>kcal brûlées / jour</Text>
            </View>
            <Text style={{ fontSize: fp(12), color: avgBalance <= 0 ? '#00D984' : '#FFD93D', marginTop: wp(4) }}>
              {'Balance : ' + (avgBalance > 0 ? '+' : '') + avgBalance + ' kcal'}
            </Text>
          </View>

          {/* Bar chart — Calories brûlées */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Calories brûlées</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: chartH }}>
              {data.map(function(d, i) {
                var val = d.total_calories_burned || 0;
                var h = Math.max(wp(4), (val / maxBurned) * (chartH - wp(10)));
                var bal = d.calorie_balance || 0;
                return (
                  <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ width: Math.min(barW, wp(16)), height: h, backgroundColor: bal <= 0 ? '#00D984' : '#FFD93D', borderRadius: wp(4) }} />
                  </View>
                );
              })}
            </View>
            {/* X labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(6) }}>
              {data.length <= 10 ? data.map(function(d, i) {
                var dt = new Date(d.stat_date);
                return <Text key={i} style={{ fontSize: fp(8), color: '#666', flex: 1, textAlign: 'center' }}>{['Di','Lu','Ma','Me','Je','Ve','Sa'][dt.getDay()]}</Text>;
              }) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                  <Text style={{ fontSize: fp(8), color: '#666' }}>{data[0] ? data[0].stat_date.substring(5, 10) : ''}</Text>
                  <Text style={{ fontSize: fp(8), color: '#666' }}>{data[data.length - 1] ? data[data.length - 1].stat_date.substring(5, 10) : ''}</Text>
                </View>
              )}
            </View>
            {/* Ligne moyenne */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(8) }}>
              <View style={{ width: wp(12), height: 1, backgroundColor: '#FF6B8A', marginRight: wp(6) }} />
              <Text style={{ fontSize: fp(10), color: '#888' }}>{'Moy. ' + avgBurned + ' kcal'}</Text>
            </View>
          </View>

          {/* Balance calorique — Line chart */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Balance calorique</Text>
            <Svg width={chartW} height={chartH}>
              <Defs>
                <SvgLinearGradient id="balPos" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#FF6B8A" stopOpacity="0.2" />
                  <Stop offset="1" stopColor="#FF6B8A" stopOpacity="0" />
                </SvgLinearGradient>
                <SvgLinearGradient id="balNeg" x1="0" y1="1" x2="0" y2="0">
                  <Stop offset="0" stopColor="#00D984" stopOpacity="0.2" />
                  <Stop offset="1" stopColor="#00D984" stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              {/* Zero line */}
              <Line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2} stroke="#3A3F46" strokeWidth="1" strokeDasharray="4,4" />
              {/* Balance line */}
              {data.length > 1 ? (
                <Polyline
                  points={data.map(function(d, i) {
                    var x = (i / (data.length - 1)) * chartW;
                    var bal = d.calorie_balance || 0;
                    var y = (chartH / 2) - (bal / balanceMax) * (chartH / 2 - wp(5));
                    return x + ',' + y;
                  }).join(' ')}
                  fill="none" stroke="#4DA6FF" strokeWidth="2" strokeLinejoin="round"
                />
              ) : null}
              {data.map(function(d, i) {
                var x = data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2;
                var bal = d.calorie_balance || 0;
                var y = (chartH / 2) - (bal / balanceMax) * (chartH / 2 - wp(5));
                return <Circle key={i} cx={x} cy={y} r="3" fill={bal <= 0 ? '#00D984' : '#FF6B8A'} />;
              })}
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(6) }}>
              <Text style={{ fontSize: fp(9), color: '#00D984' }}>Déficit (bien)</Text>
              <Text style={{ fontSize: fp(9), color: '#FF6B8A' }}>Surplus</Text>
            </View>
          </View>

          {/* Résumé hebdo */}
          <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(12) }}>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>{totalBurned}</Text>
              <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>kcal total</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#00D984' }}>{bestDayDate}</Text>
              <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>meilleur jour</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>{avgBurned}</Text>
              <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>moy/jour</Text>
            </View>
          </View>
        </View>
      );
    };
    var renderHumeurContent = function() {
      var data = moodStats;
      var hasData = data && data.length > 0;
      if (!hasData) {
        return (
          <View style={{ padding: wp(40), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(40), marginBottom: wp(12) }}>😊</Text>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Pas de données d'humeur</Text>
            <Text style={{ fontSize: fp(12), color: '#888', marginTop: wp(4) }}>Utilisez le mood gauge pour tracker votre humeur !</Text>
          </View>
        );
      }
      var avgPct = Math.round(data.reduce(function(s, d) { return s + (d.max_gauge_percent || 0); }, 0) / data.length);
      var heroEmoji = avgPct <= 20 ? '😢' : avgPct <= 40 ? '😔' : avgPct <= 60 ? '😐' : avgPct <= 80 ? '😊' : '😍';
      var heroLabel = avgPct <= 20 ? 'Très bas' : avgPct <= 40 ? 'Bas' : avgPct <= 60 ? 'Neutre' : avgPct <= 80 ? 'Bien' : 'Excellent';
      var heroColor = avgPct < 40 ? '#FF6B8A' : avgPct <= 60 ? '#FFD93D' : '#00D984';

      // Courbe humeur
      var chartW = SCREEN_WIDTH - wp(64);
      var chartH = wp(100);

      // Corrélation météo
      var weatherGroups = {};
      data.forEach(function(d) {
        var w = d.weather || 'Inconnu';
        if (!weatherGroups[w]) weatherGroups[w] = { total: 0, count: 0 };
        weatherGroups[w].total += (d.max_gauge_percent || 0);
        weatherGroups[w].count++;
      });
      var WEATHER_EMOJIS = { 'Soleil': '☀️', 'Nuageux': '☁️', 'Pluie': '🌧️', 'Neige': '❄️', 'Orage': '⛈️', 'Brouillard': '🌫️', 'Vent': '💨' };
      var weatherStats = Object.keys(weatherGroups).map(function(w) {
        return { weather: w, emoji: WEATHER_EMOJIS[w] || '🌡️', avg: Math.round(weatherGroups[w].total / weatherGroups[w].count) };
      }).sort(function(a, b) { return b.avg - a.avg; });

      // Distribution
      var dist = [0, 0, 0, 0, 0];
      data.forEach(function(d) {
        var p = d.max_gauge_percent || 0;
        if (p <= 20) dist[4]++;
        else if (p <= 40) dist[3]++;
        else if (p <= 60) dist[2]++;
        else if (p <= 80) dist[1]++;
        else dist[0]++;
      });
      var distItems = [
        { emoji: '😍', range: '81-100%', count: dist[0] },
        { emoji: '😊', range: '61-80%', count: dist[1] },
        { emoji: '😐', range: '41-60%', count: dist[2] },
        { emoji: '😔', range: '21-40%', count: dist[3] },
        { emoji: '😢', range: '0-20%', count: dist[4] }
      ];
      var maxDist = Math.max.apply(null, dist.concat([1]));

      // Best / worst days
      var bestDay = data.reduce(function(best, d) { return (d.max_gauge_percent || 0) > (best.max_gauge_percent || 0) ? d : best; }, data[0]);
      var worstDay = data.reduce(function(worst, d) { return (d.max_gauge_percent || 0) < (worst.max_gauge_percent || 0) ? d : worst; }, data[0]);
      var formatDate = function(ds) { return ds ? new Date(ds).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '-'; };
      var getEmoji = function(p) { return p <= 20 ? '😢' : p <= 40 ? '😔' : p <= 60 ? '😐' : p <= 80 ? '😊' : '😍'; };

      return (
        <View>
          {/* Hero — Humeur moyenne */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(20), marginBottom: wp(12), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(48) }}>{heroEmoji}</Text>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: heroColor, marginTop: wp(8) }}>{heroLabel}</Text>
            <Text style={{ fontSize: fp(14), color: '#FFF', marginTop: wp(4) }}>{avgPct + '%'}</Text>
            <Text style={{ fontSize: fp(11), color: '#888', marginTop: wp(2) }}>Humeur moyenne sur la période</Text>
          </View>

          {/* Courbe Humeur */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Évolution humeur</Text>
            <Svg width={chartW} height={chartH}>
              <Defs>
                <SvgLinearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={heroColor} stopOpacity="0.25" />
                  <Stop offset="1" stopColor={heroColor} stopOpacity="0" />
                </SvgLinearGradient>
              </Defs>
              {data.length > 1 ? (
                <View>
                  <Polygon
                    points={'0,' + chartH + ' ' + data.map(function(d, i) {
                      var x = (i / (data.length - 1)) * chartW;
                      var y = chartH - ((d.max_gauge_percent || 0) / 100) * (chartH - wp(10));
                      return x + ',' + y;
                    }).join(' ') + ' ' + chartW + ',' + chartH}
                    fill="url(#moodGrad)"
                  />
                  <Polyline
                    points={data.map(function(d, i) {
                      var x = (i / (data.length - 1)) * chartW;
                      var y = chartH - ((d.max_gauge_percent || 0) / 100) * (chartH - wp(10));
                      return x + ',' + y;
                    }).join(' ')}
                    fill="none" stroke={heroColor} strokeWidth="2" strokeLinejoin="round"
                  />
                </View>
              ) : null}
              {data.map(function(d, i) {
                var x = data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2;
                var pct = d.max_gauge_percent || 0;
                var y = chartH - (pct / 100) * (chartH - wp(10));
                var dotColor = pct < 40 ? '#FF6B8A' : pct <= 60 ? '#FFD93D' : '#00D984';
                return <Circle key={i} cx={x} cy={y} r="4" fill={dotColor} />;
              })}
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(6) }}>
              {data.length <= 10 ? data.map(function(d, i) {
                var dt = new Date(d.stat_date);
                return <Text key={i} style={{ fontSize: fp(8), color: '#666' }}>{['Di','Lu','Ma','Me','Je','Ve','Sa'][dt.getDay()]}</Text>;
              }) : (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', flex: 1 }}>
                  <Text style={{ fontSize: fp(8), color: '#666' }}>{data[0] ? data[0].stat_date.substring(5, 10) : ''}</Text>
                  <Text style={{ fontSize: fp(8), color: '#666' }}>{data[data.length - 1] ? data[data.length - 1].stat_date.substring(5, 10) : ''}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Corrélation Météo */}
          {weatherStats.length > 0 ? (
            <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Humeur × Météo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: wp(8) }}>
                  {weatherStats.map(function(ws, i) {
                    var wColor = ws.avg < 40 ? '#FF6B8A' : ws.avg <= 60 ? '#FFD93D' : '#00D984';
                    return (
                      <View key={i} style={{ backgroundColor: '#1E2530', borderRadius: wp(12), padding: wp(10), paddingHorizontal: wp(14), alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(20) }}>{ws.emoji}</Text>
                        <Text style={{ fontSize: fp(11), fontWeight: '600', color: wColor, marginTop: wp(4) }}>{ws.avg + '%'}</Text>
                        <Text style={{ fontSize: fp(9), color: '#666', marginTop: wp(2) }}>{ws.weather}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : null}

          {/* Distribution */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Distribution</Text>
            {distItems.map(function(di, idx) {
              var pct = data.length > 0 ? Math.round((di.count / data.length) * 100) : 0;
              return (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(16), width: wp(28) }}>{di.emoji}</Text>
                  <Text style={{ fontSize: fp(10), color: '#888', width: wp(50) }}>{di.range}</Text>
                  <View style={{ flex: 1, height: wp(8), backgroundColor: '#1E2530', borderRadius: wp(4), marginHorizontal: wp(8) }}>
                    <View style={{ width: (di.count / maxDist * 100) + '%', height: '100%', backgroundColor: '#00D984', borderRadius: wp(4) }} />
                  </View>
                  <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#FFF', width: wp(30), textAlign: 'right' }}>{pct + '%'}</Text>
                </View>
              );
            })}
          </View>

          {/* Meilleur / Pire jour */}
          <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(12) }}>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12) }}>
              <Text style={{ fontSize: fp(10), color: '#888' }}>Meilleur jour</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(4), gap: wp(6) }}>
                <Text style={{ fontSize: fp(20) }}>{getEmoji(bestDay ? bestDay.max_gauge_percent : 0)}</Text>
                <View>
                  <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#00D984' }}>{(bestDay ? bestDay.max_gauge_percent : 0) + '%'}</Text>
                  <Text style={{ fontSize: fp(9), color: '#666' }}>{formatDate(bestDay ? bestDay.stat_date : null)}</Text>
                </View>
              </View>
            </View>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12) }}>
              <Text style={{ fontSize: fp(10), color: '#888' }}>Jour difficile</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(4), gap: wp(6) }}>
                <Text style={{ fontSize: fp(20) }}>{getEmoji(worstDay ? worstDay.max_gauge_percent : 0)}</Text>
                <View>
                  <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FF6B8A' }}>{(worstDay ? worstDay.max_gauge_percent : 0) + '%'}</Text>
                  <Text style={{ fontSize: fp(9), color: '#666' }}>{formatDate(worstDay ? worstDay.stat_date : null)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    };
    var renderSanteContent = function() {
      var tl = healthTimeline || [];
      var ins = healthInsights || [];
      var vs = statsVaccData;
      var EVENT_ICONS = { 'diagnostic': '🤒', 'vaccination': '💉', 'allergie': '⚠️', 'medicament': '💊', 'analyse': '🔬' };

      // Counts
      var diagCount = tl.filter(function(e) { return e.event_type === 'diagnostic'; }).length;
      var vaccDone = vs ? (vs.done_count || 0) : 0;
      var medCount = tl.filter(function(e) { return e.event_type === 'medicament'; }).length;
      var overdueCount = vs ? (vs.overdue_count || 0) : 0;
      var allergyCount = tl.filter(function(e) { return e.event_type === 'allergie'; }).length;
      var analysisCount = tl.filter(function(e) { return e.event_type === 'analyse'; }).length;

      var summaryChips = [
        { icon: '🤒', count: diagCount, label: 'maladies', color: '#FF6B8A' },
        { icon: '💉', count: vaccDone, label: 'vaccins', color: '#9B8ACF' },
        { icon: '💊', count: medCount, label: 'traitements', color: '#00D984' },
        { icon: '⚠️', count: overdueCount, label: 'rappel dû', color: '#FF6B8A' },
        { icon: '🛡️', count: allergyCount, label: 'allergie', color: '#FFD93D' },
        { icon: '🔬', count: analysisCount, label: 'analyses', color: '#4DA6FF' }
      ];

      // Maladies par mois
      var diseasesByMonth = {};
      tl.forEach(function(e) {
        if (e.event_type === 'diagnostic' && e.event_date) {
          var monthKey = e.event_date.substring(0, 7);
          if (!diseasesByMonth[monthKey]) diseasesByMonth[monthKey] = 0;
          diseasesByMonth[monthKey]++;
        }
      });
      var monthKeys = Object.keys(diseasesByMonth).sort();
      var maxDisease = Math.max.apply(null, monthKeys.map(function(k) { return diseasesByMonth[k]; }).concat([1]));

      // Allergies from timeline
      var allergies = tl.filter(function(e) { return e.event_type === 'allergie'; });

      // Medications from timeline
      var medications = tl.filter(function(e) { return e.event_type === 'medicament'; });

      // Analyses from timeline
      var analyses = tl.filter(function(e) { return e.event_type === 'analyse'; });

      // Vaccine completion
      var vaccPct = vs ? (vs.completion_percent || 0) : 0;
      var vaccTotal = vs ? (vs.total_vaccines || 0) : 0;
      var vaccCircum = 2 * Math.PI * 22;

      return (
        <View>
          {/* Section A — Résumé en chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(12) }}>
            {summaryChips.map(function(chip, i) {
              return (
                <View key={i} style={{ width: (SCREEN_WIDTH - wp(56)) / 3, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(10), alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(18) }}>{chip.icon}</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: chip.color, marginTop: wp(4) }}>{chip.count}</Text>
                  <Text style={{ fontSize: fp(9), color: '#888', marginTop: wp(2) }}>{chip.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Section B — Maladies par mois */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Historique des maladies</Text>
            {monthKeys.length > 0 ? (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: wp(60) }}>
                  {monthKeys.map(function(mk, i) {
                    var h = Math.max(wp(4), (diseasesByMonth[mk] / maxDisease) * wp(50));
                    return (
                      <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: fp(9), color: '#FF6B8A', marginBottom: wp(4) }}>{diseasesByMonth[mk]}</Text>
                        <View style={{ width: wp(14), height: h, backgroundColor: '#FF6B8A', borderRadius: wp(4) }} />
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(6) }}>
                  {monthKeys.map(function(mk, i) {
                    return <Text key={i} style={{ fontSize: fp(8), color: '#666', flex: 1, textAlign: 'center' }}>{mk.substring(5)}</Text>;
                  })}
                </View>
              </View>
            ) : (
              <View style={{ backgroundColor: '#00D98410', borderRadius: wp(10), padding: wp(14), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(12), color: '#00D984' }}>Aucune maladie enregistrée — continuez comme ça ! 💪</Text>
              </View>
            )}
          </View>

          {/* Section C — Timeline */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>📅 Chronologie santé</Text>
            {tl.length > 0 ? tl.slice(0, 20).map(function(evt, idx) {
              var evtColor = evt.color_code || '#888';
              var evtIcon = EVENT_ICONS[evt.event_type] || '📋';
              var evtDate = evt.event_date ? new Date(evt.event_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '';
              return (
                <View key={idx} style={{ flexDirection: 'row', marginBottom: wp(12) }}>
                  {/* Ligne verticale + point */}
                  <View style={{ width: wp(24), alignItems: 'center' }}>
                    {idx > 0 ? <View style={{ width: wp(2), height: wp(12), backgroundColor: '#3A3F46', position: 'absolute', top: -wp(12) }} /> : null}
                    <View style={{ width: wp(12), height: wp(12), borderRadius: wp(6), backgroundColor: evtColor, marginTop: wp(2) }} />
                    {idx < Math.min(tl.length, 20) - 1 ? <View style={{ width: wp(2), flex: 1, backgroundColor: '#3A3F46', marginTop: wp(2) }} /> : null}
                  </View>
                  {/* Content */}
                  <View style={{ flex: 1, marginLeft: wp(8), paddingBottom: wp(4) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
                      <Text style={{ fontSize: fp(11), color: '#888' }}>{evtDate}</Text>
                      <Text style={{ fontSize: fp(10), color: evtColor, fontWeight: '600', textTransform: 'uppercase' }}>{evtIcon + ' ' + (evt.event_type || '')}</Text>
                    </View>
                    <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF', marginTop: wp(2) }}>{evt.title || ''}</Text>
                    {evt.subtitle ? <Text style={{ fontSize: fp(11), color: '#888', marginTop: wp(1) }}>{evt.subtitle}</Text> : null}
                  </View>
                </View>
              );
            }) : (
              <Text style={{ fontSize: fp(12), color: '#888', textAlign: 'center', padding: wp(12) }}>Aucun événement de santé sur cette période.</Text>
            )}
          </View>

          {/* Section D — Allergies */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🛡️ Allergies connues</Text>
            {allergies.length > 0 ? allergies.map(function(a, i) {
              var sev = (a.severity || '').toLowerCase();
              var sevLabel = sev === 'severe' || sev === 'grave' ? 'Sévère' : sev === 'moderate' || sev === 'modéré' ? 'Modéré' : 'Léger';
              var sevBg = sev === 'severe' || sev === 'grave' ? '#FF6B8A15' : sev === 'moderate' || sev === 'modéré' ? '#FFD93D15' : '#4DA6FF15';
              var sevColor = sev === 'severe' || sev === 'grave' ? '#FF6B8A' : sev === 'moderate' || sev === 'modéré' ? '#FFD93D' : '#4DA6FF';
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(8), borderBottomWidth: i < allergies.length - 1 ? 1 : 0, borderBottomColor: '#3A3F46' }}>
                  <Text style={{ fontSize: fp(14), marginRight: wp(8) }}>⚠️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{a.title || ''}</Text>
                    {a.event_date ? <Text style={{ fontSize: fp(10), color: '#666', marginTop: wp(2) }}>{'Détecté le ' + new Date(a.event_date).toLocaleDateString('fr-FR')}</Text> : null}
                  </View>
                  <View style={{ backgroundColor: sevBg, paddingHorizontal: wp(8), paddingVertical: wp(3), borderRadius: wp(6) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: sevColor }}>{sevLabel}</Text>
                  </View>
                </View>
              );
            }) : (
              <Text style={{ fontSize: fp(12), color: '#888', textAlign: 'center' }}>Aucune allergie enregistrée</Text>
            )}
          </View>

          {/* Section E — Médicaments */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>💊 Traitements</Text>
            {medications.length > 0 ? medications.slice(0, 10).map(function(m, i) {
              var isActive = !m.subtitle || m.subtitle.indexOf('Terminé') === -1;
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(8), borderBottomWidth: i < Math.min(medications.length, 10) - 1 ? 1 : 0, borderBottomColor: '#3A3F46' }}>
                  <Text style={{ fontSize: fp(14), marginRight: wp(8) }}>💊</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{m.title || ''}</Text>
                    {m.subtitle ? <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>{m.subtitle}</Text> : null}
                  </View>
                  <View style={{ backgroundColor: isActive ? '#00D98415' : '#3A3F46', paddingHorizontal: wp(8), paddingVertical: wp(3), borderRadius: wp(6) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: isActive ? '#00D984' : '#888' }}>{isActive ? 'En cours' : 'Terminé'}</Text>
                  </View>
                </View>
              );
            }) : (
              <Text style={{ fontSize: fp(12), color: '#888', textAlign: 'center' }}>Aucun traitement enregistré</Text>
            )}
          </View>

          {/* Section F — Couverture vaccinale */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>💉 Vaccination</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(14) }}>
              <View style={{ width: wp(60), height: wp(60), justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={wp(60)} height={wp(60)} viewBox="0 0 50 50">
                  <Circle cx="25" cy="25" r="22" stroke="#3A3F46" strokeWidth="4" fill="none" />
                  <Circle cx="25" cy="25" r="22" stroke="#9B8ACF" strokeWidth="4" fill="none"
                    strokeDasharray={String(vaccCircum)}
                    strokeDashoffset={String(vaccCircum * (1 - vaccPct / 100))}
                    strokeLinecap="round" rotation="-90" origin="25,25" />
                </Svg>
                <Text style={{ position: 'absolute', fontSize: fp(12), fontWeight: '700', color: '#9B8ACF' }}>{vaccPct + '%'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{vaccDone + '/' + vaccTotal + ' vaccins à jour'}</Text>
                {overdueCount > 0 ? <Text style={{ fontSize: fp(11), color: '#FF6B8A', marginTop: wp(4) }}>{'⚠️ ' + overdueCount + ' rappel' + (overdueCount > 1 ? 's' : '') + ' en retard'}</Text> : null}
              </View>
            </View>
          </View>

          {/* Section G — Analyses récentes */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🔬 Dernières analyses</Text>
            {analyses.length > 0 ? analyses.slice(0, 8).map(function(a, i) {
              var isNormal = (a.subtitle || '').toLowerCase().indexOf('normal') !== -1;
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(8), borderBottomWidth: i < Math.min(analyses.length, 8) - 1 ? 1 : 0, borderBottomColor: '#3A3F46' }}>
                  <Text style={{ fontSize: fp(14), marginRight: wp(8) }}>🔬</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{a.title || ''}</Text>
                    {a.subtitle ? <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>{a.subtitle}</Text> : null}
                  </View>
                  {a.event_date ? <Text style={{ fontSize: fp(10), color: '#666' }}>{new Date(a.event_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</Text> : null}
                </View>
              );
            }) : (
              <Text style={{ fontSize: fp(12), color: '#888', textAlign: 'center' }}>Aucune analyse sur cette période</Text>
            )}
          </View>
        </View>
      );
    };

    // ── Tab router ──
    var renderActiveTab = function() {
      if (statsTab === 'nutrition') return renderNutritionContent();
      if (statsTab === 'vitalite') return renderVitaliteContent();
      if (statsTab === 'activite') return renderActiviteContent();
      if (statsTab === 'humeur') return renderHumeurContent();
      if (statsTab === 'sante') return renderSanteContent();
      return renderNutritionContent();
    };

    // ── MAIN RENDER ──
    return (
      <View style={{ flex: 1, backgroundColor: '#1A2029' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={function() { setMediBookView('landing'); }}
            style={function(state) { return {
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: state.pressed ? 0.92 : 1 }],
            }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>Mes Stats</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Dashboard santé premium</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(50) }}>
          {/* Semi-arc navigation */}
          <View style={{ position: 'relative', height: wp(168), marginTop: wp(10), marginBottom: wp(16) }}>
            {TAB_ITEMS.map(function(tab) { return renderBubble(tab); })}
          </View>

          {/* Time range chips */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: wp(8), marginBottom: wp(16) }}>
            {TIME_RANGES.map(function(range) {
              var isSelected = selectedRange.key === range.key;
              var access = rangeAccess[range.key];
              var isLocked = access && !access.has_access;
              return (
                <Pressable key={range.key} delayPressIn={120}
                  onPress={function() { onTimeRangeTap(range); }}
                  style={function(state) { return {
                    paddingHorizontal: wp(14), paddingVertical: wp(8),
                    borderRadius: wp(20),
                    backgroundColor: isSelected ? '#00D98425' : '#2A303B',
                    borderWidth: 1,
                    borderColor: isSelected ? '#00D984' : '#3A3F46',
                    flexDirection: 'row', alignItems: 'center', gap: wp(4),
                    transform: [{ scale: state.pressed ? 0.95 : 1 }],
                  }; }}>
                  <Text style={{ fontSize: fp(12), fontWeight: '600', color: isSelected ? '#00D984' : isLocked ? '#666' : '#FFF' }}>{range.label}</Text>
                  {isLocked ? <Text style={{ fontSize: fp(10), color: '#666' }}>{'🔒'}</Text> : null}
                </Pressable>
              );
            })}
          </View>

          {/* Loading or content */}
          {statsLoading ? (
            <View style={{ padding: wp(40), alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#00D984" />
              <Text style={{ fontSize: fp(13), color: '#888', marginTop: wp(10) }}>Chargement des statistiques...</Text>
            </View>
          ) : renderActiveTab()}

          <BottomSpacer />
        </ScrollView>

        {/* Modal déblocage time range */}
        <Modal visible={showUnlockModal} transparent animationType="fade"
          onRequestClose={function() { setShowUnlockModal(false); }}>
          <Pressable onPress={function() { setShowUnlockModal(false); }}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: wp(24) }}>
            <Pressable onPress={function(e) { e.stopPropagation(); }}
              style={{ width: '100%' }}>
              <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']}
                style={{ borderRadius: wp(20), padding: wp(24) }}>
                <Text style={{ fontSize: fp(28), textAlign: 'center', marginBottom: wp(10) }}>📊</Text>
                <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', textAlign: 'center' }}>
                  {'Historique ' + (unlockTarget ? unlockTarget.label : '')}
                </Text>
                <Text style={{ fontSize: fp(13), color: '#888', textAlign: 'center', marginTop: wp(8), lineHeight: fp(18) }}>
                  {'Analysez vos tendances de santé sur ' + (unlockTarget && unlockTarget.days === 30 ? 'les 30 derniers jours' : unlockTarget && unlockTarget.days === 365 ? 'les 12 derniers mois' : 'toute la période') + '.'}
                </Text>

                <View style={{ backgroundColor: '#1E2530', borderRadius: wp(12), padding: wp(14), marginTop: wp(16) }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(6) }}>
                    <Text style={{ fontSize: fp(12), color: '#888' }}>Coût</Text>
                    <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFD93D' }}>
                      {(unlockTarget ? (rangeAccess[unlockTarget.key] ? rangeAccess[unlockTarget.key].lix_cost : 0) : 0) + ' Lix (accès 24h)'}
                    </Text>
                  </View>
                </View>

                <Pressable delayPressIn={120}
                  onPress={function() {
                    if (!unlockTarget) return;
                    fetchRPC('unlock_stats_range', { p_user_id: userId, p_range_key: unlockTarget.key })
                      .then(function(result) {
                        if (result && result[0] && result[0].success) {
                          setShowUnlockModal(false);
                          var updated = Object.assign({}, rangeAccess);
                          updated[unlockTarget.key] = { has_access: true, access_reason: 'temporary', expires_at: result[0].unlocked_until };
                          setRangeAccess(updated);
                          setSelectedRange(unlockTarget);
                          loadAllStats(unlockTarget.days);
                        } else {
                          Alert.alert('Erreur', (result && result[0] ? result[0].message : '') || 'Solde Lix insuffisant');
                        }
                      })
                      .catch(function() { Alert.alert('Erreur', 'Impossible de débloquer cette plage'); });
                  }}
                  style={function(state) { return {
                    borderWidth: 1.5, borderColor: '#00D984', backgroundColor: 'transparent',
                    borderRadius: wp(12), paddingVertical: wp(14), paddingHorizontal: wp(20),
                    marginTop: wp(14), alignItems: 'center', justifyContent: 'center',
                    transform: [{ scale: state.pressed ? 0.96 : 1 }],
                  }; }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#00D984' }}>
                    {'💎 Débloquer 24h — ' + (unlockTarget ? (rangeAccess[unlockTarget.key] ? rangeAccess[unlockTarget.key].lix_cost : 0) : 0) + ' Lix'}
                  </Text>
                </Pressable>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: wp(14), marginBottom: wp(6) }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#3A3F46' }} />
                  <Text style={{ fontSize: fp(11), color: '#666', marginHorizontal: wp(10) }}>ou</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#3A3F46' }} />
                </View>

                <Text style={{ fontSize: fp(12), color: '#888', textAlign: 'center' }}>Passez à un abonnement pour un accès illimité</Text>
                <Pressable style={{ marginTop: wp(8), alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#00D984' }}>Voir les abonnements →</Text>
                </Pressable>

                <Pressable onPress={function() { setShowUnlockModal(false); }}
                  style={{ marginTop: wp(14), paddingVertical: wp(10), alignItems: 'center', borderRadius: wp(12), borderWidth: 1, borderColor: '#3A3F46' }}>
                  <Text style={{ fontSize: fp(13), color: '#666' }}>Annuler</Text>
                </Pressable>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  };

  const renderAnalysesDetail = () => {
    const doneList = medicalData.analyses.filter(a => !a.is_scheduled);
    const scheduledList = medicalData.scheduledAnalyses;
    const getDaysUntil = (dateStr) => {
      if (!dateStr) return null;
      return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={() => setReportSection('hub')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Analyses médicales</Text>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(100) }}>
          <View style={{ flexDirection: 'row', marginVertical: wp(12), gap: wp(8) }}>
            {[
              { key: 'done', label: 'Effectuées (' + doneList.length + ')' },
              { key: 'scheduled', label: 'À venir (' + scheduledList.length + ')' },
            ].map(tab => (
              <Pressable key={tab.key} onPress={() => setAnalysesTab(tab.key)}
                style={{
                  flex: 1, paddingVertical: wp(10), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: analysesTab === tab.key ? '#00D984' : 'rgba(0,0,0,0.05)',
                }}>
                <Text style={{
                  fontSize: fp(13), fontWeight: '600',
                  color: analysesTab === tab.key ? '#FFF' : '#2D3436',
                }}>{tab.label}</Text>
              </Pressable>
            ))}
          </View>

          {analysesTab === 'done' && (
            doneList.length === 0 ? (
              <View style={{ padding: wp(30), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                  Aucune analyse effectuée.{'\n'}Scannez un bilan sanguin pour commencer.
                </Text>
              </View>
            ) : (
              doneList.map((a, i) => (
                <View key={i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(14),
                  marginBottom: wp(8), borderLeftWidth: wp(3),
                  borderLeftColor: a.status === 'normal' ? '#00D984' : a.status === 'elevated' ? '#FF8C42' : a.status === 'low' ? '#FF8C42' : a.status === 'critical' ? '#FF6B6B' : '#999',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436', flex: 1 }}>{a.label}</Text>
                    <Text style={{
                      fontSize: fp(13), fontWeight: '700',
                      color: a.status === 'normal' ? '#00D984' : a.status === 'elevated' || a.status === 'low' ? '#FF8C42' : '#FF6B6B',
                    }}>{a.value}</Text>
                  </View>
                  {a.reference_range && (
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(4) }}>Réf : {a.reference_range}</Text>
                  )}
                  {a.laboratory && (
                    <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.25)', marginTop: wp(2) }}>
                      {a.laboratory}{a.analysis_date ? ' — ' + new Date(a.analysis_date).toLocaleDateString('fr-FR') : ''}
                    </Text>
                  )}
                </View>
              ))
            )
          )}

          {analysesTab === 'scheduled' && (
            scheduledList.length === 0 ? (
              <View style={{ padding: wp(30), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                  Aucune analyse planifiée.{'\n'}ALIXEN peut vous aider à en programmer.
                </Text>
              </View>
            ) : (
              scheduledList.map((a, i) => {
                const days = getDaysUntil(a.scheduled_date);
                const isUrgent = days !== null && days <= 7;
                return (
                  <View key={i} style={{
                    backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(14),
                    marginBottom: wp(8), borderLeftWidth: wp(3),
                    borderLeftColor: isUrgent ? '#FF6B6B' : '#FF8C42',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436', flex: 1 }}>{a.label}</Text>
                      <View style={{
                        backgroundColor: isUrgent ? 'rgba(255,107,107,0.15)' : 'rgba(255,140,66,0.15)',
                        borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3),
                      }}>
                        <Text style={{ fontSize: fp(11), fontWeight: '700', color: isUrgent ? '#FF6B6B' : '#FF8C42' }}>J-{days}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.5)', marginTop: wp(4) }}>
                      {a.scheduled_date ? new Date(a.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </Text>
                    {a.prescribed_by && (
                      <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(2) }}>Prescrit par {a.prescribed_by}</Text>
                    )}
                    {a.laboratory && (
                      <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)' }}>{a.laboratory}</Text>
                    )}
                    {a.notes && (
                      <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.3)', fontStyle: 'italic', marginTop: wp(4) }}>{a.notes}</Text>
                    )}
                    {a.reminder_enabled && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(6), gap: wp(4) }}>
                        <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
                          <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </Svg>
                        <Text style={{ fontSize: fp(10), color: '#00D984' }}>Rappel activé</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )
          )}
          <BottomSpacer />
        </ScrollView>

      {analysesTab === 'scheduled' && (
        <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
          <Pressable delayPressIn={120}
            onPress={() => setShowAddAnalysisSheet(true)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#00D984', borderRadius: wp(28),
              paddingHorizontal: wp(22), paddingVertical: wp(14),
              shadowColor: '#00D984', shadowOpacity: 0.4, shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 }, elevation: 8, gap: wp(8),
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}>
            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Planifier une analyse</Text>
          </Pressable>
        </View>
      )}
      </View>
    );
  };

  const renderMedicationsDetail = () => {
    const activeList = medicalData.medications;
    const terminatedList = medicalData.medsTerminated;
    const getProgress = (med) => {
      if (!med.start_date || !med.end_date) return null;
      const start = new Date(med.start_date).getTime();
      const end = new Date(med.end_date).getTime();
      const now = Date.now();
      const total = end - start;
      if (total <= 0) return 100;
      return Math.min(100, Math.max(0, Math.round(((now - start) / total) * 100)));
    };
    const getDayInfo = (med) => {
      if (!med.start_date || !med.end_date) return '';
      const start = new Date(med.start_date);
      const end = new Date(med.end_date);
      const now = new Date();
      const daysDone = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return 'Jour ' + Math.min(daysDone, totalDays) + '/' + totalDays;
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={() => setReportSection('hub')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Médicaments</Text>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(100) }}>
          <View style={{ flexDirection: 'row', marginVertical: wp(12), gap: wp(8) }}>
            {[
              { key: 'active', label: 'En cours (' + activeList.length + ')' },
              { key: 'terminated', label: 'Archivés (' + terminatedList.length + ')' },
            ].map(tab => (
              <Pressable key={tab.key} onPress={() => setMedsTab(tab.key)}
                style={{
                  flex: 1, paddingVertical: wp(10), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: medsTab === tab.key ? '#4DA6FF' : 'rgba(0,0,0,0.05)',
                }}>
                <Text style={{
                  fontSize: fp(13), fontWeight: '600',
                  color: medsTab === tab.key ? '#FFF' : '#2D3436',
                }}>{tab.label}</Text>
              </Pressable>
            ))}
          </View>

          {medsTab === 'active' && (
            activeList.length === 0 ? (
              <View style={{ padding: wp(30), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                  Aucun traitement en cours.{'\n'}Scannez une ordonnance ou ajoutez manuellement.
                </Text>
              </View>
            ) : (
              activeList.map((med, i) => {
                const progress = getProgress(med);
                const dayInfo = getDayInfo(med);
                const freq = med.frequency_per_day || 1;
                const takenCount = med.taken_today ? freq : 0;
                return (
                  <View key={i} style={{
                    backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
                    marginBottom: wp(10), borderLeftWidth: wp(4), borderLeftColor: '#4DA6FF',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436' }}>{med.name}</Text>
                        <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>
                          {med.dosage || (med.dosage_value ? med.dosage_value + ' ' + (med.dosage_unit || 'mg') : '')}{med.frequency ? ' — ' + med.frequency : ''}
                        </Text>
                      </View>
                      {dayInfo ? (
                        <View style={{
                          backgroundColor: 'rgba(77,166,255,0.1)', borderRadius: wp(8),
                          paddingHorizontal: wp(8), paddingVertical: wp(4),
                        }}>
                          <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#4DA6FF' }}>{dayInfo}</Text>
                        </View>
                      ) : null}
                    </View>
                    {progress !== null && (
                      <View style={{ marginTop: wp(10) }}>
                        <View style={{ height: wp(6), backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: wp(3), overflow: 'hidden' }}>
                          <View style={{ width: progress + '%', height: '100%', backgroundColor: progress >= 80 ? '#00D984' : '#4DA6FF', borderRadius: wp(3) }} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(4) }}>
                          <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.3)' }}>
                            {med.start_date ? new Date(med.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''}
                          </Text>
                          <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.3)' }}>
                            {med.end_date ? new Date(med.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''}
                          </Text>
                        </View>
                      </View>
                    )}
                    {(() => {
                      const defaultTimes = { 1: ['08:00'], 2: ['08:00', '20:00'], 3: ['08:00', '14:00', '20:00'], 4: ['08:00', '12:00', '16:00', '20:00'] };
                      const times = (med.frequency_times && med.frequency_times.length > 0) ? med.frequency_times : (defaultTimes[freq] || ['08:00']);
                      const todayTakenCount = Array.isArray(med.taken_history) ? med.taken_history.filter(h => h.date === new Date().toISOString().split('T')[0]).length : 0;
                      return (
                        <View style={{ marginTop: wp(10) }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}>
                            <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)' }}>Prises du jour</Text>
                            <Text style={{ fontSize: fp(11), fontWeight: '600', color: todayTakenCount >= times.length ? '#00D984' : 'rgba(0,0,0,0.3)' }}>
                              {todayTakenCount}/{times.length}
                            </Text>
                          </View>
                          {times.map((time, ti) => {
                            const taken = isTakenAtTime(med.taken_history, time);
                            return (
                              <Pressable key={ti} delayPressIn={120}
                                onPress={() => toggleMedicationTaken(med.id, ti, med.taken_history, times)}
                                style={({ pressed }) => ({
                                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                  backgroundColor: taken ? 'rgba(0,217,132,0.08)' : 'rgba(0,0,0,0.02)',
                                  borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(8),
                                  marginBottom: wp(4),
                                  borderWidth: 1,
                                  borderColor: taken ? 'rgba(0,217,132,0.2)' : 'rgba(0,0,0,0.06)',
                                  transform: [{ scale: pressed ? 0.97 : 1 }],
                                })}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                                  <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                                    <Circle cx="12" cy="12" r="9" stroke={taken ? '#00D984' : 'rgba(0,0,0,0.2)'} strokeWidth="1.5"/>
                                    <Line x1="12" y1="7" x2="12" y2="12" stroke={taken ? '#00D984' : 'rgba(0,0,0,0.2)'} strokeWidth="1.5" strokeLinecap="round"/>
                                    <Line x1="12" y1="12" x2="15" y2="14" stroke={taken ? '#00D984' : 'rgba(0,0,0,0.2)'} strokeWidth="1.5" strokeLinecap="round"/>
                                  </Svg>
                                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: taken ? '#00D984' : '#2D3436' }}>
                                    {time}
                                  </Text>
                                  {taken && (
                                    <Text style={{ fontSize: fp(10), color: 'rgba(0,217,132,0.6)' }}>
                                      Pris
                                    </Text>
                                  )}
                                </View>
                                <View style={{
                                  width: wp(24), height: wp(24), borderRadius: wp(6),
                                  backgroundColor: taken ? '#00D984' : 'rgba(0,0,0,0.04)',
                                  borderWidth: taken ? 0 : 1.5,
                                  borderColor: 'rgba(0,0,0,0.12)',
                                  justifyContent: 'center', alignItems: 'center',
                                }}>
                                  {taken && (
                                    <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                                      <Path d="M20 6L9 17l-5-5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </Svg>
                                  )}
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      );
                    })()}
                    <Pressable
                      delayPressIn={120}
                      onPress={() => toggleMedicationReminder(med.id, med.reminder_enabled)}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', marginTop: wp(8), gap: wp(4),
                        backgroundColor: med.reminder_enabled ? 'rgba(0,217,132,0.08)' : 'rgba(0,0,0,0.04)',
                        borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: wp(5),
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: med.reminder_enabled ? 'rgba(0,217,132,0.2)' : 'rgba(0,0,0,0.08)',
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}
                    >
                      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
                        {med.reminder_enabled ? (
                          <>
                            <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <Path d="M13.73 21a2 2 0 01-3.46 0" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                          </>
                        ) : (
                          <>
                            <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <Line x1="3" y1="3" x2="21" y2="21" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                          </>
                        )}
                      </Svg>
                      <Text style={{ fontSize: fp(10), color: med.reminder_enabled ? '#00D984' : 'rgba(0,0,0,0.3)' }}>
                        {med.reminder_enabled ? 'Rappel activé' : 'Activer le rappel'}
                      </Text>
                    </Pressable>
                    <Pressable delayPressIn={120}
                      onPress={() => archiveMedication(med.id, med.name)}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', marginTop: wp(4), gap: wp(4),
                        backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(10),
                        paddingHorizontal: wp(10), paddingVertical: wp(5), alignSelf: 'flex-start',
                        borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}>
                      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
                        <Path d="M21 8v13H3V8" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <Path d="M1 3h22v5H1z" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <Line x1="10" y1="12" x2="14" y2="12" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                      </Svg>
                      <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.3)' }}>Archiver</Text>
                    </Pressable>
                  </View>
                );
              })
            )
          )}

          {medsTab === 'terminated' && (
            terminatedList.length === 0 ? (
              <View style={{ padding: wp(30), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>Aucun traitement archivé.</Text>
              </View>
            ) : (
              terminatedList.map((med, i) => (
                <View key={i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(14),
                  marginBottom: wp(8), borderLeftWidth: wp(3), borderLeftColor: 'rgba(0,0,0,0.1)', opacity: 0.7,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{med.name}</Text>
                  <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>
                    {med.dosage || ''}{med.duration ? ' — ' + med.duration : ''}
                  </Text>
                  {med.start_date && med.end_date && (
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>
                      Du {new Date(med.start_date).toLocaleDateString('fr-FR')} au {new Date(med.end_date).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: wp(6),
                    paddingHorizontal: wp(8), paddingVertical: wp(2), alignSelf: 'flex-start', marginTop: wp(6),
                  }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: 'rgba(0,0,0,0.35)' }}>Archivé</Text>
                  </View>
                </View>
              ))
            )
          )}
          <BottomSpacer />
        </ScrollView>

      {/* FAB Ajouter un médicament — centré */}
      <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          delayPressIn={120}
          onPress={() => setShowAddMedSheet(true)}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#4DA6FF',
            borderRadius: wp(28), paddingHorizontal: wp(22), paddingVertical: wp(14),
            shadowColor: '#4DA6FF', shadowOpacity: 0.4, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 8,
            gap: wp(8),
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
          </Svg>
          <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Ajouter un médicament</Text>
        </Pressable>
      </View>
      </View>
    );
  };

  const renderReportHub = () => {
    const activeCount = medicalData.medications.length;
    const terminatedCount = medicalData.medsTerminated.length;
    const doneAnalyses = medicalData.analyses.length;
    const scheduledCount = medicalData.scheduledAnalyses.length;
    const allergiesCount = medicalData.allergies.length;
    const vaccCount = medicalData.vaccinations.length;
    const diagCount = medicalData.diagnostics.length;
    const nextScheduled = medicalData.scheduledAnalyses.length > 0 ? medicalData.scheduledAnalyses[0] : null;
    const daysUntilNext = nextScheduled ? Math.ceil((new Date(nextScheduled.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    var SectionCard = function(p) { return (
      <Pressable delayPressIn={120} onPress={p.onPress}
        style={function(state) { return {
          backgroundColor: '#2A303B', borderRadius: wp(12), padding: wp(14),
          marginBottom: wp(8), flexDirection: 'row', alignItems: 'center',
          gap: wp(12), borderWidth: 1, borderColor: '#3A3F46',
          transform: [{ scale: state.pressed ? 0.97 : 1 }],
        }; }}>
        <View style={{
          width: wp(40), height: wp(40), borderRadius: wp(10),
          backgroundColor: p.color + '15', justifyContent: 'center', alignItems: 'center',
        }}>
          {p.icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{p.title}</Text>
          <Text style={{ fontSize: fp(11), color: '#888', marginTop: wp(2) }}>{p.subtitle}</Text>
        </View>
        {p.badge ? (
          <View style={{
            backgroundColor: p.badge.bgColor || 'rgba(255,107,107,0.15)',
            borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginRight: wp(8),
          }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: p.badge.color || '#FF6B6B' }}>{p.badge.text}</Text>
          </View>
        ) : null}
        <View style={{
          backgroundColor: p.color + '15', borderRadius: wp(10),
          paddingHorizontal: wp(10), paddingVertical: wp(3), minWidth: wp(22),
        }}>
          <Text style={{ fontSize: fp(11), fontWeight: '600', color: p.color, textAlign: 'center' }}>{p.count}</Text>
        </View>
        <Text style={{ fontSize: fp(14), color: '#555' }}>{">"}</Text>
      </Pressable>
    ); };

    return (
      <View style={{ flex: 1, backgroundColor: '#1A2029' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={() => { setReportSection('hub'); setMediBookView('landing'); }}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>Mes données</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Centre de commande santé</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(50) }}>
          {/* Score Vitalité + prochain RDV */}
          <View style={{
            backgroundColor: '#2A303B', borderRadius: wp(12), padding: wp(16), marginBottom: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderWidth: 1, borderColor: '#3A3F46',
          }}>
            <View style={{
              width: wp(56), height: wp(56), borderRadius: wp(28),
              borderWidth: wp(4), borderColor: '#3A3F46',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
              position: 'relative',
            }}>
              <View style={{
                position: 'absolute', width: wp(56), height: wp(56), borderRadius: wp(28),
                borderWidth: wp(4), borderColor: '#00D984', borderTopColor: 'transparent',
                transform: [{ rotate: '45deg' }],
              }} />
              <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#FFF' }}>{medicalData.vitalityScore || 0}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Score Vitalité</Text>
              {nextScheduled ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(4) }}>
                  <View style={{
                    backgroundColor: daysUntilNext <= 7 ? 'rgba(255,107,107,0.15)' : 'rgba(255,140,66,0.15)',
                    borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(2), marginRight: wp(6),
                  }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '700', color: daysUntilNext <= 7 ? '#FF6B6B' : '#FF8C42' }}>J-{daysUntilNext}</Text>
                  </View>
                  <Text style={{ fontSize: fp(11), color: '#888', flex: 1 }} numberOfLines={1}>{nextScheduled.label}</Text>
                </View>
              ) : (
                <Text style={{ fontSize: fp(11), color: '#888', marginTop: wp(4) }}>Aucune analyse planifiée</Text>
              )}
            </View>
          </View>

          {medicalDataLoading && (
            <View style={{ padding: wp(20), alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#00D984" />
            </View>
          )}

          <SectionCard title="Analyses médicales"
            subtitle={scheduledCount > 0 ? scheduledCount + ' analyse' + (scheduledCount > 1 ? 's' : '') + ' à venir' : 'Historique de vos bilans'}
            count={doneAnalyses} color="#4DA6FF"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M9 2v6l-5 8a3 3 0 002.6 4.5h10.8A3 3 0 0020 16l-5-8V2" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" /><Line x1="9" y1="2" x2="15" y2="2" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" /></Svg>}
            onPress={function() { setReportSection('analyses'); }}
            badge={scheduledCount > 0 ? { text: scheduledCount + ' à venir', color: '#FF8C42', bgColor: 'rgba(255,140,66,0.15)' } : null}
          />

          <SectionCard title="Médicaments"
            subtitle={activeCount > 0 ? activeCount + ' traitement' + (activeCount > 1 ? 's' : '') + ' en cours' : 'Aucun traitement actif'}
            count={activeCount + terminatedCount} color="#00D984"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M10.5 1.5l-8 8a4.24 4.24 0 006 6l8-8a4.24 4.24 0 00-6-6z" stroke="#00D984" strokeWidth="1.5" /><Line x1="8" y1="8" x2="14" y2="14" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" /></Svg>}
            onPress={function() { setReportSection('medications'); }}
            badge={activeCount > 0 ? { text: activeCount + ' actif' + (activeCount > 1 ? 's' : ''), color: '#00D984', bgColor: 'rgba(0,217,132,0.15)' } : null}
          />

          <SectionCard title="Allergies et intolérances"
            subtitle={allergiesCount > 0 ? 'Profil allergique enregistré' : 'Aucune allergie enregistrée'}
            count={allergiesCount} color="#FFD93D"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#FFD93D" strokeWidth="1.5" /></Svg>}
            onPress={function() { setReportSection('allergies'); }}
          />

          <SectionCard title="Carnet vaccinal"
            subtitle={vaccCount > 0 ? vaccCount + ' vaccin' + (vaccCount > 1 ? 's' : '') + ' enregistré' + (vaccCount > 1 ? 's' : '') : 'Aucun vaccin enregistré'}
            count={vaccCount} color="#9B8ACF"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M18 2l4 4-9.5 9.5-4-4L18 2z" stroke="#9B8ACF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><Path d="M8.5 11.5L2 18v4h4l6.5-6.5" stroke="#9B8ACF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            onPress={function() { setReportSection('vaccinations'); }}
          />

          <SectionCard title="Diagnostics à surveiller"
            subtitle={diagCount > 0 ? diagCount + ' diagnostic' + (diagCount > 1 ? 's' : '') : 'Aucun diagnostic enregistré'}
            count={diagCount} color="#FF6B8A"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke="#FF6B8A" strokeWidth="1.5" /><Path d="M3 12h4l3-6 4 12 3-6h4" stroke="#FF6B8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            onPress={function() { setReportSection('diagnostics'); }}
          />

          <View>
            <SectionCard title="Calendrier de santé"
              subtitle={(doneAnalyses + activeCount + terminatedCount + allergiesCount + vaccCount + diagCount) + ' événements médicaux'}
              count="" color="#00D984"
              icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="18" rx="2" stroke="#00D984" strokeWidth="1.5" /><Line x1="16" y1="2" x2="16" y2="6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" /><Line x1="8" y1="2" x2="8" y2="6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" /><Line x1="3" y1="10" x2="21" y2="10" stroke="#00D984" strokeWidth="1.5" /></Svg>}
              onPress={function() { setReportSection('calendar'); setSelectedDay(null); }}
            />
            {upcomingReminders.filter(function(r) { return r.urgency === 'overdue' || r.urgency === 'week' || r.urgency === 'month'; }).length > 0 ? (
              <View style={{
                position: 'absolute', top: wp(-4), right: wp(-4),
                width: wp(20), height: wp(20), borderRadius: wp(10),
                backgroundColor: '#E24B4A', justifyContent: 'center', alignItems: 'center',
                zIndex: 10,
              }}>
                <Text style={{ fontSize: fp(10), fontWeight: '800', color: '#FFF' }}>
                  {upcomingReminders.filter(function(r) { return r.urgency === 'overdue' || r.urgency === 'week' || r.urgency === 'month'; }).length}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable delayPressIn={120} onPress={() => setReportSection('pdf-preview')} style={{ marginTop: wp(12), marginBottom: wp(16) }}>
            <LinearGradient colors={['#00D984', '#00B871']}
              style={{ borderRadius: wp(16), paddingVertical: wp(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(10) }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="12" height="18" rx="2" stroke="#FFF" strokeWidth="1.5" />
                <Line x1="8" y1="7" x2="12" y2="7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Path d="M16 8l4 4-4 4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: fp(16), fontWeight: '700' }}>Générer mon MediBook</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fp(11) }}>500 Lix — Rapport PDF 3 mois</Text>
              </View>
            </LinearGradient>
          </Pressable>

          <BottomSpacer />
        </ScrollView>

      </View>
    );
  };

  const renderPdfPreview = () => (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
        style={{
          paddingTop: Platform.OS === 'android' ? 35 : 50,
          paddingBottom: wp(12), paddingHorizontal: wp(12),
          flexDirection: 'row', alignItems: 'center',
          borderBottomWidth: 1, borderBottomColor: '#4A4F55',
        }}
      >
        <Pressable delayPressIn={120} onPress={() => setReportSection('hub')}
          style={({ pressed }) => ({
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            marginRight: wp(10),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>MediBook PDF</Text>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Prévisualisation du rapport</Text>
        </View>
        {renderProfileSwitchButton()}
        <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(10), paddingHorizontal: wp(8), paddingVertical: wp(4), marginLeft: wp(6) }}>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>{(auth.lixBalance || 0) + ' Lix'}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(50) }}>
        <View style={{ alignItems: 'center', marginTop: wp(8), marginBottom: wp(6) }}>
          <Svg width={wp(56)} height={wp(56)} viewBox="0 0 64 64" fill="none">
            <Rect x="12" y="8" width="28" height="48" rx="3" stroke="#00D984" strokeWidth="1.5" />
            <Line x1="18" y1="18" x2="34" y2="18" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="24" x2="34" y2="24" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="30" x2="30" y2="30" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="36" x2="28" y2="36" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="46" cy="20" r="6" stroke="#00D984" strokeWidth="1.5" />
            <Path d="M46 26v10c0 4-3 7-7 7s-7-3-7-7" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="46" cy="20" r="2" fill="#00D984" />
          </Svg>
        </View>

        <View style={{
          backgroundColor: '#FAFBFC', borderRadius: wp(16),
          borderLeftWidth: wp(3), borderLeftColor: '#00D984',
          padding: wp(16), marginBottom: wp(20),
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
        }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', marginBottom: wp(16) }}>
            État de vos données
          </Text>
          {mbDataStatus.map((item, i) => <MbProgressRow key={i} item={item} />)}
        </View>

        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', marginTop: wp(4), marginBottom: wp(14) }}>
          Contenu de votre MediBook
        </Text>
        {mbSections.map((sec, i) => (
          <LinearGradient key={i} colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: wp(12), padding: wp(12), marginBottom: wp(8),
              borderWidth: 1, borderColor: '#4A4F55',
            }}>
            <View style={{
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: sec.color + '20',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <MbSectionIcon type={sec.icon} color={sec.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: fp(13), fontWeight: '600' }}>{sec.title}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(11) }}>{sec.desc}</Text>
            </View>
          </LinearGradient>
        ))}

        <Pressable delayPressIn={120}
          onPress={function() { showMbModal('info', 'MediBook', 'La génération PDF sera disponible prochainement !'); }}
          onPressIn={() => Animated.timing(mbGenerateScale, { toValue: 0.95, duration: 120, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(mbGenerateScale, { toValue: 1, useNativeDriver: true }).start()}>
          <Animated.View style={{ transform: [{ scale: mbGenerateScale }], marginTop: wp(24), marginBottom: wp(32) }}>
            <LinearGradient colors={['#00D984', '#00B871']}
              style={{ borderRadius: wp(16), paddingVertical: wp(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(10) }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="12" height="18" rx="2" stroke="#FFF" strokeWidth="1.5" />
                <Line x1="8" y1="7" x2="12" y2="7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Line x1="8" y1="11" x2="12" y2="11" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Path d="M16 8l4 4-4 4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: fp(16), fontWeight: '700' }}>Générer mon MediBook</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fp(11) }}>500 Lix — Rapport PDF 3 mois</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
        <BottomSpacer />
      </ScrollView>
    </View>
  );

  // ── RENDER ALLERGIES DETAIL ────────────────────────────────────────────
  var renderAllergiesDetail = function() {
    var allergyList = medicalData.allergies || [];
    var TYPE_STYLES = {
      alimentaire: { color: '#FF8C42', label: 'Alimentaire' },
      medicamenteuse: { color: '#FF6B6B', label: 'Médicamenteuse' },
      respiratoire: { color: '#4DA6FF', label: 'Respiratoire' },
      cutanee: { color: '#9B6DFF', label: 'Cutanée' },
    };
    var SEV_COLORS = { mild: '#00D984', moderate: '#FF8C42', severe: '#FF6B6B' };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{ paddingTop: Platform.OS === 'android' ? 35 : 50, paddingBottom: wp(12), paddingHorizontal: wp(12), flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4A4F55' }}>
          <Pressable delayPressIn={120} onPress={function() { setReportSection('hub'); }}
            style={function(state) { return { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10), transform: [{ scale: state.pressed ? 0.92 : 1 }] }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Allergies et intolérances</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
          {allergyList.length === 0 ? (
            <View style={{ padding: wp(30), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                Aucune allergie enregistrée.{'\n'}Scannez un document ou ajoutez manuellement.
              </Text>
            </View>
          ) : (
            allergyList.map(function(allergy, i) {
              var typeStyle = TYPE_STYLES[allergy.type] || { color: '#999', label: allergy.type || 'Autre' };
              var sevColor = SEV_COLORS[allergy.severity] || '#999';
              return (
                <View key={allergy.id || i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
                  marginBottom: wp(10), borderLeftWidth: wp(4), borderLeftColor: typeStyle.color,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', flex: 1 }}>{allergy.allergen}</Text>
                    <View style={{ flexDirection: 'row', gap: wp(6) }}>
                      <View style={{ backgroundColor: typeStyle.color + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: typeStyle.color }}>{typeStyle.label}</Text>
                      </View>
                      <View style={{ backgroundColor: sevColor + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: sevColor }}>
                          {allergy.severity === 'severe' ? 'SÉVÈRE' : allergy.severity === 'moderate' ? 'MODÉRÉ' : 'LÉGER'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {allergy.reaction ? (
                    <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.45)', marginTop: wp(6), fontStyle: 'italic' }} numberOfLines={2}>{allergy.reaction}</Text>
                  ) : null}
                </View>
              );
            })
          )}
          <BottomSpacer />
        </ScrollView>

        <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
          <Pressable delayPressIn={120}
            onPress={function() { setShowAddAllergySheet(true); }}
            style={function(state) { return {
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#FF8C42', borderRadius: wp(28), paddingHorizontal: wp(22), paddingVertical: wp(14),
              shadowColor: '#FF8C42', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
              gap: wp(8), transform: [{ scale: state.pressed ? 0.95 : 1 }],
            }; }}>
            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Ajouter une allergie</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ── RENDER VACCINATIONS DETAIL ───────────────────────────────────────────
  var renderVaccinationsDetail = function() {
    var vaccList = medicalData.vaccinations || [];
    var now = Date.now();

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{ paddingTop: Platform.OS === 'android' ? 35 : 50, paddingBottom: wp(12), paddingHorizontal: wp(12), flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4A4F55' }}>
          <Pressable delayPressIn={120} onPress={function() { setReportSection('hub'); }}
            style={function(state) { return { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10), transform: [{ scale: state.pressed ? 0.92 : 1 }] }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Carnet vaccinal</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(12), paddingBottom: wp(100) }}>
          {/* Tab Switch */}
          <View style={{ flexDirection: 'row', marginBottom: wp(14), backgroundColor: '#1E2530', borderRadius: wp(10), padding: wp(3) }}>
            <Pressable onPress={function() { setVaccCalendarView('calendar'); }}
              style={{ flex: 1, paddingVertical: wp(10), borderRadius: wp(8), backgroundColor: vaccCalendarView === 'calendar' ? '#2A303B' : 'transparent', alignItems: 'center' }}>
              <Text style={{ color: vaccCalendarView === 'calendar' ? '#00D984' : 'rgba(0,0,0,0.35)', fontSize: fp(12), fontWeight: vaccCalendarView === 'calendar' ? '700' : '400' }}>Mon calendrier</Text>
            </Pressable>
            <Pressable onPress={function() { setVaccCalendarView('list'); }}
              style={{ flex: 1, paddingVertical: wp(10), borderRadius: wp(8), backgroundColor: vaccCalendarView === 'list' ? '#2A303B' : 'transparent', alignItems: 'center' }}>
              <Text style={{ color: vaccCalendarView === 'list' ? '#00D984' : 'rgba(0,0,0,0.35)', fontSize: fp(12), fontWeight: vaccCalendarView === 'list' ? '700' : '400' }}>Mes vaccins</Text>
            </Pressable>
          </View>

          {vaccCalendarView === 'calendar' ? (
            <View>
              {vaccCalendarLoading ? (
                <View style={{ alignItems: 'center', padding: wp(40) }}>
                  <ActivityIndicator size="large" color="#00D984" />
                  <Text style={{ color: 'rgba(0,0,0,0.3)', fontSize: fp(12), marginTop: wp(12) }}>Chargement du calendrier vaccinal...</Text>
                </View>
              ) : (
                <View>
                  {/* Anneau de progression */}
                  {vaccStats ? (
                    <View style={{ backgroundColor: '#2A303B', borderRadius: wp(16), padding: wp(20), marginBottom: wp(14), borderWidth: 1, borderColor: '#3A3F46', alignItems: 'center' }}>
                      <View style={{ alignItems: 'center', marginBottom: wp(14) }}>
                        {(function() {
                          var pct = vaccStats.completion_percent || 0;
                          var sz = wp(120); var sw = wp(8); var r = (sz - sw) / 2;
                          var circ = 2 * Math.PI * r;
                          var off = circ - (pct / 100) * circ;
                          var col = pct <= 30 ? '#FF6B8A' : pct <= 60 ? '#FFD93D' : pct <= 80 ? '#4DA6FF' : '#00D984';
                          return (
                            <View style={{ width: sz, height: sz, alignItems: 'center', justifyContent: 'center' }}>
                              <Svg width={sz} height={sz} style={{ position: 'absolute' }}>
                                <Circle cx={sz / 2} cy={sz / 2} r={r} stroke="#3A3F46" strokeWidth={sw} fill="transparent" />
                                <Circle cx={sz / 2} cy={sz / 2} r={r} stroke={col} strokeWidth={sw} fill="transparent"
                                  strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
                                  transform={'rotate(-90 ' + (sz / 2) + ' ' + (sz / 2) + ')'} />
                              </Svg>
                              <Text style={{ fontSize: fp(28), fontWeight: '800', color: '#FFF' }}>{Math.round(pct)}%</Text>
                              <Text style={{ fontSize: fp(10), color: '#888', marginTop: wp(2) }}>couverture</Text>
                            </View>
                          );
                        })()}
                      </View>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: wp(8) }}>
                        {[
                          { label: 'Faits', count: vaccStats.done_count || 0, bg: 'rgba(0,217,132,0.12)', color: '#00D984' },
                          { label: 'Partiels', count: vaccStats.partial_count || 0, bg: 'rgba(255,217,61,0.12)', color: '#FFD93D' },
                          { label: 'À faire', count: vaccStats.pending_count || 0, bg: 'rgba(77,166,255,0.12)', color: '#4DA6FF' },
                          { label: 'En retard', count: vaccStats.overdue_count || 0, bg: 'rgba(255,107,138,0.12)', color: '#FF6B8A' },
                        ].map(function(s) {
                          return (
                            <View key={s.label} style={{ backgroundColor: s.bg, borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4) }}>
                              <Text style={{ fontSize: fp(10), fontWeight: '700', color: s.color }}>{s.count + ' ' + s.label}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}

                  {/* Filtres priorité */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(14) }} contentContainerStyle={{ gap: wp(6) }}>
                    {[
                      { key: null, label: 'Tous', color: '#00D984' },
                      { key: 'Essentiel', label: 'Essentiel', color: '#FF6B8A' },
                      { key: 'Recommandé', label: 'Recommandé', color: '#FFD93D' },
                      { key: 'Conseillé', label: 'Conseillé', color: '#4DA6FF' },
                      { key: 'Voyage', label: 'Voyage', color: '#9B8ACF' },
                    ].map(function(f) {
                      var active = vaccPriorityFilter === f.key;
                      return (
                        <Pressable key={f.label} onPress={function() { setVaccPriorityFilter(f.key); }}
                          style={{ paddingHorizontal: wp(14), paddingVertical: wp(7), borderRadius: wp(20), backgroundColor: active ? f.color : 'transparent', borderWidth: 1.5, borderColor: active ? f.color : 'rgba(0,0,0,0.1)' }}>
                          <Text style={{ fontSize: fp(11), fontWeight: '600', color: active ? (f.key === 'Recommandé' ? '#000' : '#FFF') : 'rgba(0,0,0,0.35)' }}>{f.label}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {/* Cartes vaccins groupées */}
                  {(function() {
                    var STATUS_CFG = {
                      done: { label: 'Fait \u2713', color: '#00D984', bg: 'rgba(0,217,132,0.12)' },
                      partial: { label: 'Partiel', color: '#FFD93D', bg: 'rgba(255,217,61,0.12)' },
                      pending: { label: '\u00C0 faire', color: '#4DA6FF', bg: 'rgba(77,166,255,0.12)' },
                      overdue: { label: 'En retard', color: '#FF6B8A', bg: 'rgba(255,107,138,0.12)' },
                    };
                    var PRIO_CFG = {
                      'Essentiel': { color: '#FF6B8A', label: 'Vaccins obligatoires' },
                      'Recommandé': { color: '#FFD93D', label: 'Fortement conseillés' },
                      'Conseillé': { color: '#4DA6FF', label: 'Selon votre profil' },
                      'Voyage': { color: '#9B8ACF', label: 'Pour les voyageurs' },
                    };
                    var filtered = vaccSchedule;
                    if (vaccPriorityFilter) {
                      filtered = vaccSchedule.filter(function(v) { return v.priority === vaccPriorityFilter; });
                    }
                    var grouped = {};
                    filtered.forEach(function(v) {
                      var p = v.priority || 'Autre';
                      if (!grouped[p]) grouped[p] = [];
                      grouped[p].push(v);
                    });
                    var order = ['Essentiel', 'Recommandé', 'Conseillé', 'Voyage'];
                    return order.map(function(prio) {
                      if (!grouped[prio] || grouped[prio].length === 0) return null;
                      var pCfg = PRIO_CFG[prio] || { color: '#888', label: '' };
                      return (
                        <View key={prio} style={{ marginBottom: wp(16) }}>
                          <Text style={{ fontSize: fp(11), fontWeight: '700', color: pCfg.color, letterSpacing: 1, marginBottom: wp(8), textTransform: 'uppercase' }}>
                            {prio + ' — ' + pCfg.label}
                          </Text>
                          {grouped[prio].map(function(v, vi) {
                            var sCfg = STATUS_CFG[v.status] || STATUS_CFG.pending;
                            return (
                              <Pressable key={v.vaccine_id || vi} delayPressIn={80}
                                onPress={function() {
                                  if (v.status !== 'done' && openAddVaccFromCalendar) {
                                    openAddVaccFromCalendar({ id: v.vaccine_id, name: v.vaccine_name, total_doses: v.total_doses, doses_done: v.doses_done, booster_interval_days: v.booster_interval_days });
                                  }
                                }}
                                style={function(state) { return {
                                  backgroundColor: '#2A303B', borderRadius: wp(12), padding: wp(14),
                                  marginBottom: wp(8), borderWidth: 1, borderColor: '#3A3F46',
                                  transform: [{ scale: state.pressed && v.status !== 'done' ? 0.97 : 1 }],
                                }; }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                  {/* Indicateur statut */}
                                  <View style={{ width: wp(24), height: wp(24), borderRadius: wp(12), marginRight: wp(12), justifyContent: 'center', alignItems: 'center', backgroundColor: sCfg.bg, borderWidth: v.status === 'pending' ? 1.5 : 0, borderColor: 'rgba(255,255,255,0.15)' }}>
                                    <Text style={{ fontSize: fp(10), color: sCfg.color, fontWeight: '700' }}>
                                      {v.status === 'done' ? '\u2713' : v.status === 'partial' ? '\u25D0' : v.status === 'overdue' ? '!' : '\u25CB'}
                                    </Text>
                                  </View>
                                  {/* Contenu */}
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#EAEEF3' }}>{v.vaccine_name}</Text>
                                    {v.disease_target ? (
                                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(1) }}>{v.disease_target}</Text>
                                    ) : null}
                                    {v.display_age_label ? (
                                      <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)', marginTop: wp(1) }}>{v.display_age_label}</Text>
                                    ) : null}
                                  </View>
                                  {/* Badge */}
                                  <View style={{ backgroundColor: sCfg.bg, borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                                    <Text style={{ fontSize: fp(10), fontWeight: '700', color: sCfg.color }}>{sCfg.label}</Text>
                                  </View>
                                </View>
                                {/* Infos supplémentaires */}
                                {(v.status === 'done' || v.status === 'partial') && v.last_dose_date ? (
                                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', marginTop: wp(6), marginLeft: wp(36) }}>
                                    {new Date(v.last_dose_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) + ' — Dose ' + (v.doses_done || 1) + '/' + (v.total_doses || 1)}
                                  </Text>
                                ) : null}
                                {v.status === 'partial' && v.next_due_date ? (
                                  <Text style={{ fontSize: fp(10), color: '#FFD93D', marginTop: wp(3), marginLeft: wp(36) }}>
                                    {'\u23F0 Prochaine dose : ' + new Date(v.next_due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                  </Text>
                                ) : null}
                                {v.status === 'overdue' && v.next_due_date && getOverdueText ? (
                                  <Text style={{ fontSize: fp(10), color: '#FF6B8A', marginTop: wp(3), marginLeft: wp(36) }}>
                                    {'\u26A0\uFE0F Rappel dépassé depuis ' + getOverdueText(v.next_due_date)}
                                  </Text>
                                ) : null}
                              </Pressable>
                            );
                          })}
                        </View>
                      );
                    });
                  })()}
                </View>
              )}
            </View>
          ) : (
            <View>
              {/* Onglet Mes vaccins — liste existante */}
              {vaccList.length === 0 ? (
                <View style={{ padding: wp(30), alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                    Aucun vaccin enregistré.{'\n'}Scannez votre carnet ou ajoutez manuellement.
                  </Text>
                </View>
              ) : (
                vaccList.map(function(vac, i) {
                  var nextDue = vac.next_due_date ? new Date(vac.next_due_date).getTime() : null;
                  var isOverdue = nextDue && nextDue < now;
                  var isSoon = nextDue && !isOverdue && (nextDue - now) < 90 * 24 * 60 * 60 * 1000;
                  return (
                    <View key={vac.id || i} style={{
                      backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
                      marginBottom: wp(10), borderLeftWidth: wp(4), borderLeftColor: '#9B6DFF',
                      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436' }}>{vac.vaccine_name}</Text>
                          {vac.administration_date ? (
                            <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>
                              {new Date(vac.administration_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </Text>
                          ) : null}
                          {vac.administered_by ? (
                            <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(2) }}>{vac.administered_by}</Text>
                          ) : null}
                        </View>
                        <View style={{ flexDirection: 'row', gap: wp(6), alignItems: 'center' }}>
                          <View style={{ backgroundColor: 'rgba(155,109,255,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                            <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#9B6DFF' }}>{'Dose ' + (vac.dose_number || 1)}</Text>
                          </View>
                          {isOverdue ? (
                            <View style={{ backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                              <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#FF6B6B' }}>Rappel en retard</Text>
                            </View>
                          ) : isSoon ? (
                            <View style={{ backgroundColor: 'rgba(255,140,66,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                              <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#FF8C42' }}>Rappel bientôt</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      {vac.next_due_date ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(8), gap: wp(6) }}>
                          <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                            <Rect x="3" y="4" width="18" height="18" rx="2" stroke={isOverdue ? '#FF6B6B' : '#FF8C42'} strokeWidth="1.5" />
                            <Line x1="16" y1="2" x2="16" y2="6" stroke={isOverdue ? '#FF6B6B' : '#FF8C42'} strokeWidth="1.5" strokeLinecap="round" />
                            <Line x1="8" y1="2" x2="8" y2="6" stroke={isOverdue ? '#FF6B6B' : '#FF8C42'} strokeWidth="1.5" strokeLinecap="round" />
                            <Line x1="3" y1="10" x2="21" y2="10" stroke={isOverdue ? '#FF6B6B' : '#FF8C42'} strokeWidth="1.5" />
                          </Svg>
                          <Text style={{ fontSize: fp(11), color: isOverdue ? '#FF6B6B' : '#FF8C42', fontWeight: '600' }}>
                            {'Prochain rappel : ' + new Date(vac.next_due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          )}
          <BottomSpacer />
        </ScrollView>

        <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
          <Pressable delayPressIn={120}
            onPress={function() { setShowAddVaccSheet(true); }}
            style={function(state) { return {
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#9B6DFF', borderRadius: wp(28), paddingHorizontal: wp(22), paddingVertical: wp(14),
              shadowColor: '#9B6DFF', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
              gap: wp(8), transform: [{ scale: state.pressed ? 0.95 : 1 }],
            }; }}>
            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Ajouter un vaccin</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ── RENDER DIAGNOSTICS DETAIL ──────────────────────────────────────────
  var renderDiagnosticsDetail = function() {
    var diagList = medicalData.diagnostics || [];
    var SEVERITY_COLORS = { mild: '#00D984', moderate: '#FF8C42', severe: '#FF6B6B' };
    var STATUS_STYLES = {
      active: { bg: 'rgba(255,107,107,0.15)', color: '#FF6B6B', label: 'Actif' },
      resolved: { bg: 'rgba(0,217,132,0.15)', color: '#00D984', label: 'Résolu' },
      chronic: { bg: 'rgba(77,166,255,0.15)', color: '#4DA6FF', label: 'Chronique' },
      monitoring: { bg: 'rgba(241,196,15,0.15)', color: '#F1C40F', label: 'Suivi' },
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={function() { setReportSection('hub'); }}
            style={function(state) { return {
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: state.pressed ? 0.92 : 1 }],
            }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Diagnostics</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
          {diagList.length === 0 ? (
            <View style={{ padding: wp(30), alignItems: 'center' }}>
              <Svg width={wp(48)} height={wp(48)} viewBox="0 0 24 24" fill="none" style={{ marginBottom: wp(12), opacity: 0.3 }}>
                <Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke="#FF6B6B" strokeWidth="1.5" />
                <Path d="M3 12h4l3-6 4 12 3-6h4" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: fp(20) }}>
                Aucun diagnostic enregistré.{'\n'}Ajoutez vos diagnostics pour un suivi complet.
              </Text>
            </View>
          ) : (
            diagList.map(function(diag, i) {
              var sevColor = SEVERITY_COLORS[diag.severity] || '#999';
              var statusStyle = STATUS_STYLES[diag.status] || STATUS_STYLES.active;
              return (
                <View key={diag.id || i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
                  marginBottom: wp(10), borderLeftWidth: wp(4), borderLeftColor: sevColor,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: wp(8) }}>
                      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436' }}>{diag.condition_name}</Text>
                      {diag.diagnosed_by ? (
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>
                          {'Dr. ' + diag.diagnosed_by}
                        </Text>
                      ) : null}
                    </View>
                    <View style={{ flexDirection: 'row', gap: wp(6), alignItems: 'center' }}>
                      <View style={{ backgroundColor: sevColor + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: sevColor }}>
                          {diag.severity === 'severe' ? 'SÉVÈRE' : diag.severity === 'moderate' ? 'MODÉRÉ' : 'LÉGER'}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: statusStyle.bg, borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: statusStyle.color }}>{statusStyle.label}</Text>
                      </View>
                    </View>
                  </View>
                  {diag.diagnosed_date ? (
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(6) }}>
                      {'Diagnostiqué le ' + new Date(diag.diagnosed_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                  ) : null}
                  {diag.notes ? (
                    <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.45)', marginTop: wp(6), fontStyle: 'italic' }} numberOfLines={2}>
                      {diag.notes}
                    </Text>
                  ) : null}
                </View>
              );
            })
          )}
          <BottomSpacer />
        </ScrollView>

        <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
          <Pressable
            delayPressIn={120}
            onPress={function() { setShowAddDiagSheet(true); }}
            style={function(state) { return {
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#FF6B6B',
              borderRadius: wp(28), paddingHorizontal: wp(22), paddingVertical: wp(14),
              shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 }, elevation: 8,
              gap: wp(8),
              transform: [{ scale: state.pressed ? 0.95 : 1 }],
            }; }}
          >
            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Ajouter un diagnostic</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ── CALENDAR HELPERS ──────────────────────────────────────────────────────
  var CAL_COLORS = { diagnostic: '#FF6B6B', medication: '#4DA6FF', vaccination: '#9B6DFF', analysis: '#00D984', allergy: '#FF8C42' };
  var CAL_LABELS = { diagnostic: 'Diagnostic', medication: 'Médicament', vaccination: 'Vaccin', analysis: 'Analyse', allergy: 'Allergie' };
  var MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  var DAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  var getCalendarEvents = function() {
    var events = [];
    (medicalData.diagnostics || []).forEach(function(d) {
      var dt = d.diagnosed_date || d.created_at;
      if (dt) events.push({ type: 'diagnostic', date: new Date(dt), title: d.condition_name || 'Diagnostic', detail: (d.severity ? (d.severity === 'severe' ? 'Sévère' : d.severity === 'moderate' ? 'Modéré' : 'Léger') : '') + (d.status ? ' — ' + (d.status === 'active' ? 'Actif' : d.status === 'resolved' ? 'Résolu' : d.status) : ''), raw: d });
    });
    (medicalData.medications || []).forEach(function(m) {
      var dt = m.start_date || m.created_at;
      if (dt) events.push({ type: 'medication', date: new Date(dt), title: m.name || 'Médicament', detail: (m.dosage || '') + (m.frequency ? ' — ' + m.frequency : ''), raw: m });
    });
    (medicalData.vaccinations || []).forEach(function(v) {
      var dt = v.administration_date || v.created_at;
      if (dt) events.push({ type: 'vaccination', date: new Date(dt), title: v.vaccine_name || 'Vaccin', detail: 'Dose ' + (v.dose_number || 1) + (v.next_due_date ? ' — Rappel ' + new Date(v.next_due_date).getFullYear() : ''), raw: v });
    });
    (medicalData.analyses || []).forEach(function(a) {
      var dt = a.created_at;
      if (dt) events.push({ type: 'analysis', date: new Date(dt), title: a.label || 'Analyse', detail: (a.value || '') + (a.status ? ' — ' + (a.status === 'normal' ? 'Normal' : a.status === 'elevated' ? 'Élevé' : a.status === 'low' ? 'Bas' : a.status === 'critical' ? 'Critique' : a.status) : ''), raw: a });
    });
    (medicalData.allergies || []).forEach(function(al) {
      var dt = al.created_at;
      if (dt) events.push({ type: 'allergy', date: new Date(dt), title: al.allergen || 'Allergie', detail: (al.type || '') + (al.severity ? ' — ' + (al.severity === 'severe' ? 'Sévère' : al.severity === 'life_threatening' ? 'Vital' : al.severity === 'moderate' ? 'Modéré' : 'Léger') : ''), raw: al });
    });
    return events;
  };

  var getEventsForDay = function(day, month, year, filters) {
    var all = getCalendarEvents();
    return all.filter(function(e) {
      if (!filters[e.type]) return false;
      return e.date.getDate() === day && e.date.getMonth() === month && e.date.getFullYear() === year;
    });
  };

  var getDaysInMonth = function(month, year) { return new Date(year, month + 1, 0).getDate(); };
  var getFirstDayOfWeek = function(month, year) { var d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; };

  var formatCalDate = function(d) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); };

  // ── LOAD UPCOMING REMINDERS ────────────────────────────────────────────────
  var loadUpcomingReminders = function() {
    if (!userId) return;
    var now = new Date();
    var todayStr = now.toISOString().split('T')[0];
    var reminders = [];

    getAuthHeaders().then(function(headers) {
      var vaccUpcomingUrl = SUPABASE_URL + '/rest/v1/vaccinations?select=*&user_id=eq.' + userId + '&next_due_date=not.is.null&next_due_date=gte.' + todayStr + '&order=next_due_date.asc&limit=5';
      var vaccOverdueUrl = SUPABASE_URL + '/rest/v1/vaccinations?select=*&user_id=eq.' + userId + '&next_due_date=not.is.null&next_due_date=lt.' + todayStr + '&order=next_due_date.asc';
      var analUpcomingUrl = SUPABASE_URL + '/rest/v1/medical_analyses?select=*&user_id=eq.' + userId + '&is_scheduled=eq.true&scheduled_date=gte.' + todayStr + '&order=scheduled_date.asc&limit=5';
      var analOverdueUrl = SUPABASE_URL + '/rest/v1/medical_analyses?select=*&user_id=eq.' + userId + '&is_scheduled=eq.true&scheduled_date=lt.' + todayStr + '&order=scheduled_date.asc';

      Promise.all([
        fetch(vaccUpcomingUrl, { headers: headers }).then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
        fetch(vaccOverdueUrl, { headers: headers }).then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
        fetch(analUpcomingUrl, { headers: headers }).then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
        fetch(analOverdueUrl, { headers: headers }).then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
      ]).then(function(results) {
        var vaccUpcoming = results[0]; var vaccOverdue = results[1];
        var analUpcoming = results[2]; var analOverdue = results[3];

        vaccOverdue.forEach(function(v) {
          var dueDate = new Date(v.next_due_date);
          var daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
          reminders.push({ kind: 'vaccine', urgency: 'overdue', title: v.vaccine_name || 'Vaccin', dueDate: dueDate, daysLate: daysLate, raw: v });
        });
        analOverdue.forEach(function(a) {
          var dueDate = new Date(a.scheduled_date);
          var daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
          reminders.push({ kind: 'analysis', urgency: 'overdue', title: a.label || 'Analyse', dueDate: dueDate, daysLate: daysLate, raw: a });
        });
        vaccUpcoming.forEach(function(v) {
          var dueDate = new Date(v.next_due_date);
          var daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          var urg = daysUntil <= 7 ? 'week' : daysUntil <= 30 ? 'month' : 'quarter';
          reminders.push({ kind: 'vaccine', urgency: urg, title: v.vaccine_name || 'Vaccin', dueDate: dueDate, daysUntil: daysUntil, raw: v });
        });
        analUpcoming.forEach(function(a) {
          var dueDate = new Date(a.scheduled_date);
          var daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          var urg = daysUntil <= 7 ? 'week' : daysUntil <= 30 ? 'month' : 'quarter';
          reminders.push({ kind: 'analysis', urgency: urg, title: a.label || 'Analyse', dueDate: dueDate, daysUntil: daysUntil, raw: a });
        });

        reminders.sort(function(a, b) {
          var order = { overdue: 0, week: 1, month: 2, quarter: 3 };
          return (order[a.urgency] || 4) - (order[b.urgency] || 4);
        });
        setUpcomingReminders(reminders);
      });
    });
  };

  useEffect(function() { loadUpcomingReminders(); }, [userId]);

  var REMINDER_STYLES = {
    overdue: { bg: 'rgba(226,75,74,0.15)', border: '#E24B4A' },
    week: { bg: 'rgba(226,75,74,0.1)', border: '#E24B4A' },
    month: { bg: 'rgba(186,117,23,0.1)', border: '#BA7517' },
    quarter: { bg: 'rgba(29,158,117,0.1)', border: '#1D9E75' },
  };

  var getReminderText = function(r) {
    var prefix = r.kind === 'vaccine' ? 'Vaccin' : 'Analyse';
    if (r.urgency === 'overdue') return prefix + ' ' + r.title + ' en retard de ' + r.daysLate + ' jour' + (r.daysLate > 1 ? 's' : '');
    if (r.urgency === 'week') return 'Rappel ' + prefix.toLowerCase() + ' ' + r.title + ' — dans ' + r.daysUntil + ' jour' + (r.daysUntil > 1 ? 's' : '');
    if (r.urgency === 'month') return 'Rappel ' + prefix.toLowerCase() + ' ' + r.title + ' — dans ' + r.daysUntil + ' jours';
    return prefix + ' ' + r.title + ' prévu le ' + formatCalDate(r.dueDate);
  };

  // ── RENDER CALENDAR SECTION ────────────────────────────────────────────────
  var renderCalendarSection = function() {
    var daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    var firstDay = getFirstDayOfWeek(calendarMonth, calendarYear);
    var today = new Date();
    var isCurrentMonth = today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;
    var todayDate = today.getDate();
    var allEvents = getCalendarEvents();
    var cellSize = (SCREEN_WIDTH - wp(32) - wp(6) * 6) / 7;

    var calendarRows = [];
    var currentRow = [];
    var i;
    for (i = 0; i < firstDay; i++) { currentRow.push(null); }
    for (i = 1; i <= daysInMonth; i++) {
      currentRow.push(i);
      if (currentRow.length === 7) { calendarRows.push(currentRow); currentRow = []; }
    }
    if (currentRow.length > 0) {
      while (currentRow.length < 7) { currentRow.push(null); }
      calendarRows.push(currentRow);
    }

    var getDayPastilles = function(day) {
      if (!day) return [];
      var types = {};
      allEvents.forEach(function(e) {
        if (e.date.getDate() === day && e.date.getMonth() === calendarMonth && e.date.getFullYear() === calendarYear && calendarFilters[e.type]) {
          types[e.type] = true;
        }
      });
      return Object.keys(types);
    };

    var dayEvents = selectedDay ? getEventsForDay(selectedDay, calendarMonth, calendarYear, calendarFilters) : [];

    var handleDayPress = function(day) {
      if (!day) return;
      var evts = getEventsForDay(day, calendarMonth, calendarYear, calendarFilters);
      if (evts.length === 0) { setSelectedDay(null); return; }
      setSelectedDay(day);
      calSlideAnim.setValue(0);
      Animated.timing(calSlideAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    };

    var goToPrevMonth = function() {
      setSelectedDay(null);
      if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
      else { setCalendarMonth(calendarMonth - 1); }
    };
    var goToNextMonth = function() {
      setSelectedDay(null);
      if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
      else { setCalendarMonth(calendarMonth + 1); }
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={function() { setReportSection('hub'); setSelectedDay(null); }}
            style={function(state) { return {
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: state.pressed ? 0.92 : 1 }],
            }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Calendrier santé</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Tous vos événements médicaux</Text>
          </View>
          {/* Toggle Mois | Année */}
          <View style={{
            flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: wp(10), padding: wp(3), marginRight: wp(8),
          }}>
            <Pressable delayPressIn={80} onPress={function() { setCalendarView('month'); }}
              style={{
                paddingHorizontal: wp(10), paddingVertical: wp(5), borderRadius: wp(8),
                backgroundColor: calendarView === 'month' ? '#00D984' : 'transparent',
              }}>
              <Text style={{ fontSize: fp(10), fontWeight: '700', color: calendarView === 'month' ? '#FFF' : 'rgba(255,255,255,0.5)' }}>Mois</Text>
            </Pressable>
            <Pressable delayPressIn={80} onPress={function() { setCalendarView('year'); }}
              style={{
                paddingHorizontal: wp(10), paddingVertical: wp(5), borderRadius: wp(8),
                backgroundColor: calendarView === 'year' ? '#00D984' : 'transparent',
              }}>
              <Text style={{ fontSize: fp(10), fontWeight: '700', color: calendarView === 'year' ? '#FFF' : 'rgba(255,255,255,0.5)' }}>Année</Text>
            </Pressable>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(12), paddingBottom: wp(100) }}>
          {/* Rappels à venir */}
          {upcomingReminders.length > 0 ? (
            <View style={{ marginBottom: wp(12) }}>
              <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#2D3436', marginBottom: wp(8) }}>Rappels à venir</Text>
              {upcomingReminders.map(function(rem, ri) {
                var style = REMINDER_STYLES[rem.urgency] || REMINDER_STYLES.quarter;
                return (
                  <Pressable key={ri} delayPressIn={80}
                    onPress={function() { setReminderDetail(rem); setReminderPostponeDate(''); }}
                    style={function(state) { return {
                      backgroundColor: style.bg, borderRadius: wp(12), padding: wp(12),
                      marginBottom: wp(6), borderLeftWidth: wp(4), borderLeftColor: style.border,
                      flexDirection: 'row', alignItems: 'center',
                      transform: [{ scale: state.pressed ? 0.97 : 1 }],
                    }; }}>
                    <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(10) }}>
                      {rem.kind === 'vaccine' ? (
                        <Path d="M18 2l4 4-9.5 9.5-4-4L18 2zM8.5 11.5L2 18v4h4l6.5-6.5" stroke={style.border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      ) : (
                        <Path d="M9 2v6l-5 8a3 3 0 002.6 4.5h10.8A3 3 0 0020 16l-5-8V2M9 2h6" stroke={style.border} strokeWidth="1.5" strokeLinecap="round" />
                      )}
                    </Svg>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fp(12), fontWeight: '600', color: style.border }}>{getReminderText(rem)}</Text>
                      <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.35)', marginTop: wp(1) }}>{formatCalDate(rem.dueDate)}</Text>
                    </View>
                    <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.15)' }}>{">"}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {calendarView === 'month' ? (
          <View>
          {/* Navigation mois */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(10), marginBottom: wp(10),
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <Pressable delayPressIn={120} onPress={goToPrevMonth}
              style={function(state) { return {
                width: wp(36), height: wp(36), borderRadius: wp(12),
                backgroundColor: state.pressed ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
                justifyContent: 'center', alignItems: 'center',
              }; }}>
              <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                <Path d="M15 19l-7-7 7-7" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436' }}>
              {MONTH_NAMES[calendarMonth] + ' ' + calendarYear}
            </Text>
            <Pressable delayPressIn={120} onPress={goToNextMonth}
              style={function(state) { return {
                width: wp(36), height: wp(36), borderRadius: wp(12),
                backgroundColor: state.pressed ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
                justifyContent: 'center', alignItems: 'center',
              }; }}>
              <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                <Path d="M9 5l7 7-7 7" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </View>

          {/* Barre de filtres */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ marginBottom: wp(10) }}
            contentContainerStyle={{ paddingHorizontal: wp(2), gap: wp(6) }}>
            {[
              { key: 'diagnostic', label: 'Diagnostics', color: '#FF6B6B', emoji: '\uD83D\uDD34' },
              { key: 'medication', label: 'Médicaments', color: '#4DA6FF', emoji: '\uD83D\uDD35' },
              { key: 'analysis', label: 'Analyses', color: '#00D984', emoji: '\uD83D\uDFE2' },
              { key: 'vaccination', label: 'Vaccins', color: '#9B6DFF', emoji: '\uD83D\uDFE3' },
              { key: 'allergy', label: 'Allergies', color: '#FF8C42', emoji: '\uD83D\uDFE0' },
            ].map(function(chip) {
              var active = calendarFilters[chip.key];
              return (
                <Pressable key={chip.key} delayPressIn={80}
                  onPress={function() {
                    setCalendarFilters(function(prev) {
                      var next = Object.assign({}, prev);
                      next[chip.key] = !prev[chip.key];
                      return next;
                    });
                  }}
                  style={function(state) { return {
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: active ? chip.color : 'transparent',
                    borderRadius: wp(20), paddingHorizontal: wp(12), paddingVertical: wp(7),
                    borderWidth: 1.5,
                    borderColor: active ? chip.color : 'rgba(0,0,0,0.15)',
                    transform: [{ scale: state.pressed ? 0.95 : 1 }],
                  }; }}>
                  <Text style={{ fontSize: fp(12), marginRight: wp(4) }}>{chip.emoji}</Text>
                  <Text style={{
                    fontSize: fp(11), fontWeight: '600',
                    color: active ? '#FFF' : 'rgba(0,0,0,0.35)',
                  }}>{chip.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Grille calendrier */}
          <View style={{
            backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(10), marginBottom: wp(12),
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            {/* En-têtes jours */}
            <View style={{ flexDirection: 'row', marginBottom: wp(6) }}>
              {DAY_HEADERS.map(function(dh) {
                return (
                  <View key={dh} style={{ width: cellSize, alignItems: 'center', paddingVertical: wp(4) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: 'rgba(0,0,0,0.35)' }}>{dh}</Text>
                  </View>
                );
              })}
            </View>
            {/* Lignes de jours */}
            {calendarRows.map(function(row, ri) {
              return (
                <View key={'row-' + ri} style={{ flexDirection: 'row', marginBottom: wp(2) }}>
                  {row.map(function(day, ci) {
                    var pastilles = getDayPastilles(day);
                    var isToday = isCurrentMonth && day === todayDate;
                    var isSelected = day === selectedDay;
                    var hasEvents = pastilles.length > 0;
                    return (
                      <Pressable key={'cell-' + ri + '-' + ci} delayPressIn={80}
                        onPress={function() { handleDayPress(day); }}
                        style={function(state) { return {
                          width: cellSize, height: cellSize + wp(6), alignItems: 'center', justifyContent: 'center',
                          borderRadius: wp(10),
                          backgroundColor: isSelected ? 'rgba(0,217,132,0.12)' : state.pressed && day ? 'rgba(0,0,0,0.04)' : 'transparent',
                          borderWidth: isToday ? 1.5 : 0, borderColor: '#00D984',
                        }; }}>
                        {day ? (
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{
                              fontSize: fp(13), fontWeight: isToday || isSelected ? '700' : '400',
                              color: isSelected ? '#00D984' : isToday ? '#00D984' : '#2D3436',
                            }}>
                              {day}
                            </Text>
                            {/* Pastilles */}
                            {hasEvents ? (
                              <View style={{ flexDirection: 'row', marginTop: wp(2), gap: wp(2) }}>
                                {pastilles.slice(0, 3).map(function(t, pi) {
                                  return (
                                    <View key={pi} style={{
                                      width: wp(5), height: wp(5), borderRadius: wp(2.5),
                                      backgroundColor: CAL_COLORS[t],
                                    }} />
                                  );
                                })}
                              </View>
                            ) : null}
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>

          {/* Liste événements du jour sélectionné */}
          {selectedDay && dayEvents.length > 0 ? (
            <View>
              <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#2D3436', marginBottom: wp(10), marginTop: wp(4) }}>
                {selectedDay + ' ' + MONTH_NAMES[calendarMonth] + ' ' + calendarYear}
              </Text>
              {dayEvents.map(function(evt, ei) {
                var slideY = calSlideAnim.interpolate({ inputRange: [0, 1], outputRange: [30 + ei * 10, 0] });
                return (
                  <Animated.View key={ei} style={{
                    opacity: calSlideAnim,
                    transform: [{ translateY: slideY }],
                  }}>
                    <Pressable delayPressIn={120}
                      onPress={function() { setCalEventDetail(evt); }}
                      style={function(state) { return {
                        backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(14),
                        marginBottom: wp(8), flexDirection: 'row', alignItems: 'center',
                        borderLeftWidth: wp(4), borderLeftColor: CAL_COLORS[evt.type],
                        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                        transform: [{ scale: state.pressed ? 0.97 : 1 }],
                      }; }}>
                      <View style={{
                        width: wp(10), height: wp(10), borderRadius: wp(5),
                        backgroundColor: CAL_COLORS[evt.type], marginRight: wp(12),
                      }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{evt.title}</Text>
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(1) }}>{CAL_LABELS[evt.type]}</Text>
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>{evt.detail}</Text>
                        <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.25)', marginTop: wp(3) }}>{formatCalDate(evt.date)}</Text>
                      </View>
                      <Text style={{ fontSize: fp(16), color: 'rgba(0,0,0,0.15)' }}>{">"}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          ) : null}
          </View>
          ) : (
          <View>
            {/* Vue année — grille 4x3 */}
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(10), marginBottom: wp(12),
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
            }}>
              <Pressable delayPressIn={120} onPress={function() { setCalendarYear(calendarYear - 1); }}
                style={function(state) { return {
                  width: wp(36), height: wp(36), borderRadius: wp(12),
                  backgroundColor: state.pressed ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
                  justifyContent: 'center', alignItems: 'center',
                }; }}>
                <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                  <Path d="M15 19l-7-7 7-7" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#2D3436', marginHorizontal: wp(20) }}>{calendarYear}</Text>
              <Pressable delayPressIn={120} onPress={function() { setCalendarYear(calendarYear + 1); }}
                style={function(state) { return {
                  width: wp(36), height: wp(36), borderRadius: wp(12),
                  backgroundColor: state.pressed ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
                  justifyContent: 'center', alignItems: 'center',
                }; }}>
                <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 5l7 7-7 7" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {MONTH_NAMES.map(function(mName, mi) {
                var monthEvents = allEvents.filter(function(e) {
                  return e.date.getMonth() === mi && e.date.getFullYear() === calendarYear && calendarFilters[e.type];
                });
                var eventCount = monthEvents.length;
                var typesInMonth = {};
                monthEvents.forEach(function(e) { typesInMonth[e.type] = true; });
                var pastilleTypes = Object.keys(typesInMonth).slice(0, 5);
                var isCurrentMonth = mi === new Date().getMonth() && calendarYear === new Date().getFullYear();
                var cardW = (SCREEN_WIDTH - wp(32) - wp(10) * 3) / 4;

                return (
                  <Pressable key={mi} delayPressIn={80}
                    onPress={function() { setCalendarMonth(mi); setCalendarView('month'); setSelectedDay(null); }}
                    style={function(state) { return {
                      width: cardW, backgroundColor: '#FAFBFC', borderRadius: wp(12),
                      padding: wp(8), marginBottom: wp(10), alignItems: 'center',
                      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
                      borderWidth: isCurrentMonth ? 1.5 : 0, borderColor: '#00D984',
                      transform: [{ scale: state.pressed ? 0.95 : 1 }],
                    }; }}>
                    <Text style={{
                      fontSize: fp(11), fontWeight: '700',
                      color: isCurrentMonth ? '#00D984' : '#2D3436', marginBottom: wp(4),
                    }}>
                      {mName.substring(0, 3)}
                    </Text>
                    {eventCount > 0 ? (
                      <View style={{
                        backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: wp(8),
                        paddingHorizontal: wp(6), paddingVertical: wp(2), marginBottom: wp(4),
                      }}>
                        <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#00D984' }}>{eventCount}</Text>
                      </View>
                    ) : (
                      <Text style={{ fontSize: fp(9), color: 'rgba(0,0,0,0.2)', marginBottom: wp(4) }}>—</Text>
                    )}
                    {pastilleTypes.length > 0 ? (
                      <View style={{ flexDirection: 'row', gap: wp(2) }}>
                        {pastilleTypes.map(function(t, pi) {
                          return (
                            <View key={pi} style={{
                              width: wp(5), height: wp(5), borderRadius: wp(2.5),
                              backgroundColor: CAL_COLORS[t],
                            }} />
                          );
                        })}
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
          )}

          <BottomSpacer />
        </ScrollView>

        {/* Modal détail rappel */}
        <Modal visible={reminderDetail !== null} transparent animationType="slide"
          onRequestClose={function() { setReminderDetail(null); }}>
          <Pressable onPress={function() { setReminderDetail(null); }}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <Pressable onPress={function() {}}
              style={{
                backgroundColor: '#FAFBFC', borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                padding: wp(20), paddingBottom: wp(40), maxHeight: SCREEN_HEIGHT * 0.65,
              }}>
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(0,0,0,0.12)', alignSelf: 'center', marginBottom: wp(16) }} />
              {reminderDetail ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Type + titre */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(14) }}>
                    <View style={{
                      width: wp(40), height: wp(40), borderRadius: wp(12),
                      backgroundColor: (REMINDER_STYLES[reminderDetail.urgency] || REMINDER_STYLES.quarter).bg,
                      justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                    }}>
                      <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                        {reminderDetail.kind === 'vaccine' ? (
                          <Path d="M18 2l4 4-9.5 9.5-4-4L18 2zM8.5 11.5L2 18v4h4l6.5-6.5" stroke={(REMINDER_STYLES[reminderDetail.urgency] || REMINDER_STYLES.quarter).border} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        ) : (
                          <Path d="M9 2v6l-5 8a3 3 0 002.6 4.5h10.8A3 3 0 0020 16l-5-8V2M9 2h6" stroke={(REMINDER_STYLES[reminderDetail.urgency] || REMINDER_STYLES.quarter).border} strokeWidth="1.5" strokeLinecap="round" />
                        )}
                      </Svg>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#2D3436' }}>{reminderDetail.title}</Text>
                      <Text style={{ fontSize: fp(12), color: (REMINDER_STYLES[reminderDetail.urgency] || REMINDER_STYLES.quarter).border, fontWeight: '600', marginTop: wp(2) }}>
                        {reminderDetail.kind === 'vaccine' ? 'Vaccin' : 'Analyse programmée'}
                      </Text>
                    </View>
                  </View>

                  {/* Date prévue */}
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(10) }}>
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Date prévue</Text>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{formatCalDate(reminderDetail.dueDate)}</Text>
                    {reminderDetail.urgency === 'overdue' ? (
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#E24B4A', marginTop: wp(4) }}>{'En retard de ' + reminderDetail.daysLate + ' jour' + (reminderDetail.daysLate > 1 ? 's' : '')}</Text>
                    ) : (
                      <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)', marginTop: wp(4) }}>{'Dans ' + reminderDetail.daysUntil + ' jour' + ((reminderDetail.daysUntil || 0) > 1 ? 's' : '')}</Text>
                    )}
                  </View>

                  {/* Médecin prescripteur */}
                  {reminderDetail.raw && (reminderDetail.raw.prescribed_by || reminderDetail.raw.administered_by) ? (
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(10) }}>
                      <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Prescripteur</Text>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{reminderDetail.raw.prescribed_by || reminderDetail.raw.administered_by}</Text>
                    </View>
                  ) : null}

                  {/* Dose info pour vaccins */}
                  {reminderDetail.kind === 'vaccine' && reminderDetail.raw && reminderDetail.raw.dose_number ? (
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(10) }}>
                      <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Dernière dose</Text>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{'Dose ' + reminderDetail.raw.dose_number}</Text>
                    </View>
                  ) : null}

                  {/* Bouton Marquer comme fait */}
                  <Pressable delayPressIn={120}
                    onPress={function() {
                      var rem = reminderDetail;
                      if (!rem || !userId) return;
                      getAuthHeaders().then(function(headers) {
                        if (rem.kind === 'vaccine') {
                          var newDose = (rem.raw.dose_number || 1) + 1;
                          fetch(SUPABASE_URL + '/rest/v1/vaccinations', {
                            method: 'POST', headers: headers,
                            body: JSON.stringify({
                              user_id: userId,
                              family_member_id: activeProfile === 'self' ? null : activeProfile,
                              vaccine_name: rem.raw.vaccine_name,
                              dose_number: newDose,
                              administration_date: new Date().toISOString().split('T')[0],
                              status: 'completed',
                            }),
                          }).then(function() {
                            return fetch(SUPABASE_URL + '/rest/v1/vaccinations?id=eq.' + rem.raw.id, {
                              method: 'PATCH', headers: Object.assign({}, headers, { 'Prefer': 'return=minimal' }),
                              body: JSON.stringify({ next_due_date: null }),
                            });
                          }).then(function() {
                            NotificationService.cancelAllReminders(rem.raw.id, userId);
                            setReminderDetail(null);
                            loadUpcomingReminders();
                            if (loadMedicalData) loadMedicalData();
                            showMbModal('success', 'Vaccin enregistré', rem.title + ' — dose ' + newDose + ' marquée comme faite.');
                          });
                        } else {
                          fetch(SUPABASE_URL + '/rest/v1/medical_analyses?id=eq.' + rem.raw.id, {
                            method: 'PATCH', headers: Object.assign({}, headers, { 'Prefer': 'return=minimal' }),
                            body: JSON.stringify({ is_scheduled: false, analysis_date: new Date().toISOString().split('T')[0] }),
                          }).then(function() {
                            NotificationService.cancelAllReminders(rem.raw.id, userId);
                            setReminderDetail(null);
                            loadUpcomingReminders();
                            if (loadMedicalData) loadMedicalData();
                            showMbModal('success', 'Analyse complétée', rem.title + ' marquée comme effectuée.');
                          });
                        }
                      });
                    }}
                    style={function(state) { return {
                      backgroundColor: '#00D984', borderRadius: wp(12),
                      paddingVertical: wp(14), alignItems: 'center', marginTop: wp(6),
                      transform: [{ scale: state.pressed ? 0.97 : 1 }],
                    }; }}>
                    <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>Marquer comme fait</Text>
                  </Pressable>

                  {/* Reporter — mini date input */}
                  <View style={{ marginTop: wp(10) }}>
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(4) }}>Reporter à une nouvelle date (JJ/MM/AAAA)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                      <TextInput
                        value={reminderPostponeDate}
                        onChangeText={function(t) { setReminderPostponeDate(t); }}
                        placeholder="ex: 15/06/2026"
                        placeholderTextColor="rgba(0,0,0,0.2)"
                        style={{
                          flex: 1, backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: wp(10),
                          paddingHorizontal: wp(12), paddingVertical: wp(10), fontSize: fp(13), color: '#2D3436',
                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                        }}
                      />
                      <Pressable delayPressIn={120}
                        onPress={function() {
                          var rem = reminderDetail;
                          if (!rem || !userId || !reminderPostponeDate) return;
                          var parts = reminderPostponeDate.split('/');
                          if (parts.length !== 3) { showMbModal('info', 'Format invalide', 'Utilisez le format JJ/MM/AAAA'); return; }
                          var newDate = parts[2] + '-' + parts[1] + '-' + parts[0];
                          if (isNaN(new Date(newDate).getTime())) { showMbModal('info', 'Date invalide', 'Vérifiez la date saisie.'); return; }
                          getAuthHeaders().then(function(headers) {
                            var table = rem.kind === 'vaccine' ? 'vaccinations' : 'medical_analyses';
                            var field = rem.kind === 'vaccine' ? 'next_due_date' : 'scheduled_date';
                            var body = {};
                            body[field] = newDate;
                            fetch(SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + rem.raw.id, {
                              method: 'PATCH', headers: Object.assign({}, headers, { 'Prefer': 'return=minimal' }),
                              body: JSON.stringify(body),
                            }).then(function() {
                              // Cancel old notifications then reschedule with new date
                              NotificationService.cancelAllReminders(rem.raw.id, userId).then(function() {
                                var updatedRaw = Object.assign({}, rem.raw);
                                if (rem.kind === 'vaccine') {
                                  updatedRaw.next_due_date = newDate;
                                  NotificationService.scheduleVaccineReminder(updatedRaw, userId);
                                } else {
                                  updatedRaw.scheduled_date = newDate;
                                  NotificationService.scheduleAnalysisReminder(updatedRaw, userId);
                                }
                              });
                              setReminderDetail(null);
                              setReminderPostponeDate('');
                              loadUpcomingReminders();
                              if (loadMedicalData) loadMedicalData();
                              showMbModal('success', 'Rappel reporté', rem.title + ' reporté au ' + reminderPostponeDate + '.');
                            });
                          });
                        }}
                        style={function(state) { return {
                          backgroundColor: 'transparent', borderRadius: wp(10), borderWidth: 1.5, borderColor: '#00D984',
                          paddingHorizontal: wp(14), paddingVertical: wp(10),
                          transform: [{ scale: state.pressed ? 0.95 : 1 }],
                        }; }}>
                        <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#00D984' }}>Reporter</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Fermer */}
                  <Pressable delayPressIn={120} onPress={function() { setReminderDetail(null); }}
                    style={{ alignItems: 'center', marginTop: wp(14), paddingVertical: wp(8) }}>
                    <Text style={{ fontSize: fp(13), color: 'rgba(0,0,0,0.35)' }}>Fermer</Text>
                  </Pressable>
                </ScrollView>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>

        {/* Modal détail événement */}
        <Modal visible={calEventDetail !== null} transparent animationType="slide"
          onRequestClose={function() { setCalEventDetail(null); }}>
          <Pressable onPress={function() { setCalEventDetail(null); }}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <Pressable onPress={function() {}}
              style={{
                backgroundColor: '#FAFBFC', borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                padding: wp(20), paddingBottom: wp(40), maxHeight: SCREEN_HEIGHT * 0.7,
              }}>
              {/* Handle */}
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(0,0,0,0.12)', alignSelf: 'center', marginBottom: wp(16) }} />
              {calEventDetail ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Type badge + titre */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(12) }}>
                    <View style={{
                      width: wp(12), height: wp(12), borderRadius: wp(6),
                      backgroundColor: CAL_COLORS[calEventDetail.type], marginRight: wp(10),
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#2D3436' }}>{calEventDetail.title}</Text>
                      <Text style={{ fontSize: fp(12), color: CAL_COLORS[calEventDetail.type], fontWeight: '600', marginTop: wp(2) }}>{CAL_LABELS[calEventDetail.type]}</Text>
                    </View>
                  </View>

                  {/* Date */}
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(12) }}>
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Date</Text>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{formatCalDate(calEventDetail.date)}</Text>
                  </View>

                  {/* Détails selon type */}
                  {calEventDetail.type === 'diagnostic' && calEventDetail.raw ? (
                    <View>
                      <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(10) }}>
                        {calEventDetail.raw.severity ? (
                          <View style={{ backgroundColor: (CAL_COLORS.diagnostic) + '15', borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4) }}>
                            <Text style={{ fontSize: fp(11), fontWeight: '700', color: CAL_COLORS.diagnostic }}>
                              {calEventDetail.raw.severity === 'severe' ? 'Sévère' : calEventDetail.raw.severity === 'moderate' ? 'Modéré' : 'Léger'}
                            </Text>
                          </View>
                        ) : null}
                        {calEventDetail.raw.status ? (
                          <View style={{ backgroundColor: calEventDetail.raw.status === 'active' ? 'rgba(255,107,107,0.12)' : 'rgba(0,217,132,0.12)', borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4) }}>
                            <Text style={{ fontSize: fp(11), fontWeight: '700', color: calEventDetail.raw.status === 'active' ? '#FF6B6B' : '#00D984' }}>
                              {calEventDetail.raw.status === 'active' ? 'Actif' : calEventDetail.raw.status === 'resolved' ? 'Résolu' : calEventDetail.raw.status}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      {calEventDetail.raw.diagnosed_by ? (
                        <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.5)', marginBottom: wp(6) }}>{'Dr. ' + calEventDetail.raw.diagnosed_by}</Text>
                      ) : null}
                      {calEventDetail.raw.notes ? (
                        <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.45)', fontStyle: 'italic', lineHeight: fp(18) }}>{calEventDetail.raw.notes}</Text>
                      ) : null}
                    </View>
                  ) : null}

                  {calEventDetail.type === 'medication' && calEventDetail.raw ? (
                    <View>
                      {calEventDetail.raw.dosage ? (
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Dosage</Text>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{calEventDetail.raw.dosage}</Text>
                        </View>
                      ) : null}
                      {calEventDetail.raw.frequency ? (
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Fréquence</Text>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{calEventDetail.raw.frequency}</Text>
                        </View>
                      ) : null}
                      {calEventDetail.raw.duration ? (
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Durée</Text>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{calEventDetail.raw.duration}</Text>
                        </View>
                      ) : null}
                      {calEventDetail.raw.status ? (
                        <View style={{ backgroundColor: calEventDetail.raw.status === 'active' ? 'rgba(0,217,132,0.12)' : 'rgba(0,0,0,0.04)', borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4), alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: fp(11), fontWeight: '700', color: calEventDetail.raw.status === 'active' ? '#00D984' : 'rgba(0,0,0,0.4)' }}>
                            {calEventDetail.raw.status === 'active' ? 'En cours' : 'Terminé'}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {calEventDetail.type === 'vaccination' && calEventDetail.raw ? (
                    <View>
                      <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(8) }}>
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Dose</Text>
                        <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{'Dose ' + (calEventDetail.raw.dose_number || 1)}</Text>
                      </View>
                      {calEventDetail.raw.next_due_date ? (
                        <View style={{ backgroundColor: 'rgba(255,140,66,0.1)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Prochain rappel</Text>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FF8C42' }}>{formatCalDate(calEventDetail.raw.next_due_date)}</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4), alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#00D984' }}>A jour</Text>
                        </View>
                      )}
                    </View>
                  ) : null}

                  {calEventDetail.type === 'analysis' && calEventDetail.raw ? (
                    <View>
                      {calEventDetail.raw.value ? (
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Valeur</Text>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{calEventDetail.raw.value}</Text>
                        </View>
                      ) : null}
                      {calEventDetail.raw.status ? (
                        <View style={{ backgroundColor: (calEventDetail.raw.status === 'normal' ? 'rgba(0,217,132,0.12)' : calEventDetail.raw.status === 'elevated' || calEventDetail.raw.status === 'critical' ? 'rgba(255,107,107,0.12)' : 'rgba(255,140,66,0.12)'), borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4), alignSelf: 'flex-start' }}>
                          <Text style={{ fontSize: fp(11), fontWeight: '700', color: calEventDetail.raw.status === 'normal' ? '#00D984' : calEventDetail.raw.status === 'elevated' || calEventDetail.raw.status === 'critical' ? '#FF6B6B' : '#FF8C42' }}>
                            {calEventDetail.raw.status === 'normal' ? 'Normal' : calEventDetail.raw.status === 'elevated' ? 'Élevé' : calEventDetail.raw.status === 'low' ? 'Bas' : 'Critique'}
                          </Text>
                        </View>
                      ) : null}
                      {calEventDetail.raw.prescribed_by ? (
                        <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.5)', marginTop: wp(8) }}>{'Prescrit par ' + calEventDetail.raw.prescribed_by}</Text>
                      ) : null}
                      {calEventDetail.raw.laboratory ? (
                        <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.5)', marginTop: wp(4) }}>{'Labo: ' + calEventDetail.raw.laboratory}</Text>
                      ) : null}
                    </View>
                  ) : null}

                  {calEventDetail.type === 'allergy' && calEventDetail.raw ? (
                    <View>
                      {calEventDetail.raw.type ? (
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Type</Text>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{calEventDetail.raw.type}</Text>
                        </View>
                      ) : null}
                      {calEventDetail.raw.severity ? (
                        <View style={{ backgroundColor: (calEventDetail.raw.severity === 'severe' || calEventDetail.raw.severity === 'life_threatening' ? 'rgba(255,107,107,0.12)' : calEventDetail.raw.severity === 'moderate' ? 'rgba(255,140,66,0.12)' : 'rgba(0,217,132,0.12)'), borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4), alignSelf: 'flex-start', marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(11), fontWeight: '700', color: calEventDetail.raw.severity === 'severe' || calEventDetail.raw.severity === 'life_threatening' ? '#FF6B6B' : calEventDetail.raw.severity === 'moderate' ? '#FF8C42' : '#00D984' }}>
                            {calEventDetail.raw.severity === 'severe' ? 'Sévère' : calEventDetail.raw.severity === 'life_threatening' ? 'Vital' : calEventDetail.raw.severity === 'moderate' ? 'Modéré' : 'Léger'}
                          </Text>
                        </View>
                      ) : null}
                      {calEventDetail.raw.reaction ? (
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(12), padding: wp(12) }}>
                          <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginBottom: wp(2) }}>Réaction</Text>
                          <Text style={{ fontSize: fp(13), color: '#2D3436', lineHeight: fp(18) }}>{calEventDetail.raw.reaction}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {/* Bouton fermer */}
                  <Pressable delayPressIn={120} onPress={function() { setCalEventDetail(null); }}
                    style={function(state) { return {
                      backgroundColor: '#E8ECF0', borderRadius: wp(12),
                      paddingVertical: wp(12), alignItems: 'center', marginTop: wp(16),
                      transform: [{ scale: state.pressed ? 0.97 : 1 }],
                    }; }}>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>Fermer</Text>
                  </Pressable>
                </ScrollView>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  };

  const renderMediBookReport = () => {
    if (reportSection === 'pdf-preview') return renderPdfPreview();
    if (reportSection === 'analyses') return renderAnalysesDetail();
    if (reportSection === 'medications') return renderMedicationsDetail();
    if (reportSection === 'allergies') return renderAllergiesDetail();
    if (reportSection === 'vaccinations') return renderVaccinationsDetail();
    if (reportSection === 'diagnostics') return renderDiagnosticsDetail();
    if (reportSection === 'calendar') return renderCalendarSection();
    return renderReportHub();
  };

  // ── RENDER ASSISTANCE MÉDICALE ─────────────────────────────────────────────
  var renderAssistanceMedicale = function() {
    var generateQrShare = async function() {
      setQrLoading(true);
      try {
        var result = await fetchRPC('generate_medical_share', { p_user_id: userId, p_doctor_name: null, p_duration_minutes: 30 });
        if (result && result[0]) {
          setQrShareToken(result[0].share_token);
          setQrExpiresAt(result[0].expires_at);
          setShowQrModal(true);
        } else {
          showMbModal('error', 'Erreur', 'Impossible de générer le QR code.');
        }
      } catch(err) { console.log('QR error:', err); showMbModal('error', 'Erreur', 'Échec de la génération.'); }
      setQrLoading(false);
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#1A2029' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{ paddingTop: Platform.OS === 'android' ? 35 : 50, paddingBottom: wp(12), paddingHorizontal: wp(12), flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4A4F55' }}>
          <Pressable delayPressIn={120} onPress={function() { setMediBookView('landing'); }}
            style={function(state) { return { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10), transform: [{ scale: state.pressed ? 0.92 : 1 }] }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Assistance médicale</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Partage, rapports et consultation</Text>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(50) }}>

          {/* 1. Consulter mes données */}
          <Pressable delayPressIn={120} onPress={function() { setMediBookView('report'); }}
            style={function(state) { return {
              backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14),
              padding: wp(16), flexDirection: 'row', alignItems: 'center', gap: wp(12), marginBottom: wp(16),
              transform: [{ scale: state.pressed ? 0.97 : 1 }],
            }; }}>
            <View style={{ width: wp(40), height: wp(40), borderRadius: wp(10), backgroundColor: '#4DA6FF15', justifyContent: 'center', alignItems: 'center' }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Consulter mes données</Text>
              <Text style={{ fontSize: fp(11), color: '#888' }}>Vaccins, médicaments, analyses...</Text>
            </View>
            <Text style={{ fontSize: fp(14), color: '#555' }}>{">"}</Text>
          </Pressable>

          {/* 2. QR Code + PDF côte à côte */}
          <View style={{ flexDirection: 'row', gap: wp(12), marginBottom: wp(16) }}>
            {/* QR Code */}
            <Pressable delayPressIn={120} onPress={function() { generateQrShare(); }}
              style={function(state) { return {
                flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#00D98440', borderRadius: wp(14),
                padding: wp(16), alignItems: 'center',
                transform: [{ scale: state.pressed ? 0.96 : 1 }],
              }; }}>
              {qrLoading ? <ActivityIndicator size="small" color="#00D984" /> : (
                <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: '#00D98415', justifyContent: 'center', alignItems: 'center', marginBottom: wp(8) }}>
                  <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="3" width="7" height="7" rx="1" stroke="#00D984" strokeWidth="1.5" />
                    <Rect x="14" y="3" width="7" height="7" rx="1" stroke="#00D984" strokeWidth="1.5" />
                    <Rect x="3" y="14" width="7" height="7" rx="1" stroke="#00D984" strokeWidth="1.5" />
                    <Rect x="14" y="14" width="3" height="3" fill="#00D984" />
                    <Rect x="18" y="18" width="3" height="3" fill="#00D984" />
                    <Rect x="14" y="18" width="3" height="3" fill="#00D984" />
                  </Svg>
                </View>
              )}
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>QR Code</Text>
              <Text style={{ fontSize: fp(10), color: '#00D984', marginTop: wp(2) }}>Partage 30 min</Text>
            </Pressable>

            {/* PDF */}
            <Pressable delayPressIn={120} onPress={function() { setReportSection('pdf-preview'); setMediBookView('report'); }}
              style={function(state) { return {
                flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#9B8ACF40', borderRadius: wp(14),
                padding: wp(16), alignItems: 'center',
                transform: [{ scale: state.pressed ? 0.96 : 1 }],
              }; }}>
              <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: '#9B8ACF15', justifyContent: 'center', alignItems: 'center', marginBottom: wp(8) }}>
                <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
                  <Rect x="4" y="2" width="12" height="18" rx="2" stroke="#9B8ACF" strokeWidth="1.5" />
                  <Line x1="8" y1="7" x2="12" y2="7" stroke="#9B8ACF" strokeWidth="1.5" strokeLinecap="round" />
                  <Path d="M16 8l4 4-4 4" stroke="#9B8ACF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>PDF</Text>
              <Text style={{ fontSize: fp(10), color: '#9B8ACF', marginTop: wp(2) }}>Rapport complet</Text>
            </Pressable>
          </View>

          {/* 3. Mode consultation live */}
          <Pressable delayPressIn={120} onPress={function() { setMediBookView('live'); }}
            style={function(state) { return {
              backgroundColor: '#00D98408', borderWidth: 1.5, borderColor: '#00D98440', borderRadius: wp(12),
              padding: wp(16), flexDirection: 'row', alignItems: 'center', gap: wp(12), marginBottom: wp(20),
              transform: [{ scale: state.pressed ? 0.97 : 1 }],
            }; }}>
            <View style={{ width: wp(12), height: wp(12), borderRadius: wp(6), backgroundColor: '#00D984' }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#00D984' }}>Mode consultation live</Text>
              <Text style={{ fontSize: fp(11), color: '#aaa', marginTop: wp(2) }}>Saisissez les données pendant votre consultation</Text>
            </View>
            <Text style={{ fontSize: fp(14), color: '#00D984' }}>{"›"}</Text>
          </Pressable>

          {/* 4. Info gratuit */}
          <View style={{ backgroundColor: '#2A303B', borderRadius: wp(12), padding: wp(14), borderWidth: 1, borderColor: '#3A3F46' }}>
            <Text style={{ fontSize: fp(11), color: '#888', textAlign: 'center', lineHeight: fp(16) }}>
              Toutes les fonctionnalités d'assistance médicale sont gratuites. Vos données sont partagées de manière sécurisée et temporaire.
            </Text>
          </View>

          <BottomSpacer />
        </ScrollView>

        {/* QR Modal */}
        <Modal visible={showQrModal} transparent animationType="fade" onRequestClose={function() { setShowQrModal(false); }}>
          <Pressable onPress={function() { setShowQrModal(false); }} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: wp(24) }}>
            <Pressable onPress={function(e) { e.stopPropagation(); }} style={{ width: '100%' }}>
              <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']} style={{ borderRadius: wp(20), padding: wp(24), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>Partage médical</Text>
                <Text style={{ fontSize: fp(12), color: '#888', marginBottom: wp(20), textAlign: 'center' }}>Montrez ce QR code à votre médecin</Text>

                {/* QR placeholder — requires react-native-qrcode-svg */}
                <View style={{ width: wp(200), height: wp(200), backgroundColor: '#FFF', borderRadius: wp(12), justifyContent: 'center', alignItems: 'center', marginBottom: wp(16) }}>
                  <Text style={{ fontSize: fp(10), color: '#333', textAlign: 'center', padding: wp(10) }}>
                    {'lixum.com/share/' + (qrShareToken || '...')}
                  </Text>
                  <Text style={{ fontSize: fp(8), color: '#888' }}>QR code (installer react-native-qrcode-svg)</Text>
                </View>

                {qrExpiresAt ? (
                  <Text style={{ fontSize: fp(12), color: '#00D984', fontWeight: '600', marginBottom: wp(16) }}>
                    {'Expire à ' + new Date(qrExpiresAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                ) : null}

                <Pressable onPress={function() { setShowQrModal(false); }}
                  style={{ paddingVertical: wp(12), paddingHorizontal: wp(40), borderRadius: wp(12), borderWidth: 1, borderColor: '#3A3F46' }}>
                  <Text style={{ fontSize: fp(14), color: '#888' }}>Fermer</Text>
                </Pressable>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  };

  // ── RENDER LIVE CONSULTATION ──────────────────────────────────────────────
  var renderLiveConsultation = function() {
    var saveLiveConsultation = async function() {
      if (liveMeds.length === 0 && !liveDiag.trim()) {
        showMbModal('info', 'Données requises', 'Ajoutez au moins un médicament ou un diagnostic.');
        return;
      }
      setLiveSaving(true);
      try {
        var headers = await getAuthHeaders();
        headers['Prefer'] = 'return=minimal';
        var fmId = activeProfile === 'self' ? null : activeProfile;
        var today = new Date().toISOString().split('T')[0];

        // Sauvegarder les médicaments prescrits
        if (liveMeds.length > 0) {
          await fetch(SUPABASE_URL + '/rest/v1/medications', {
            method: 'POST', headers: headers,
            body: JSON.stringify(liveMeds.map(function(m) {
              return { user_id: userId, family_member_id: fmId, name: m.name, dosage: m.dosage || null, status: 'active', start_date: today, source: 'live_consultation' };
            })),
          });
        }

        // Sauvegarder le diagnostic
        if (liveDiag.trim()) {
          await fetch(SUPABASE_URL + '/rest/v1/diagnostics', {
            method: 'POST', headers: headers,
            body: JSON.stringify({
              user_id: userId, family_member_id: fmId, condition_name: liveDiag.trim(),
              severity: liveSeverity, status: 'active', diagnosed_date: today,
              diagnosed_by: liveDoctor.trim() || null, notes: liveNotes.trim() || null, source: 'live_consultation',
            }),
          });
        }

        // Mettre à jour poids/taille dans users_profile
        var profileUpdate = {};
        if (liveWeight.trim()) profileUpdate.weight = parseFloat(liveWeight);
        if (liveHeight.trim()) profileUpdate.height = parseFloat(liveHeight);
        if (Object.keys(profileUpdate).length > 0) {
          await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId, {
            method: 'PATCH', headers: headers,
            body: JSON.stringify(profileUpdate),
          });
        }

        setLiveSaving(false);
        // Reset
        setLiveMeds([]); setLiveMedSearch(''); setLiveDiag(''); setLiveNotes('');
        setLiveTemp(''); setLiveTensionH(''); setLiveTensionL(''); setLiveSeverity('moderate'); setLiveDoctor('');
        loadMedicalData();
        showMbModal('success', 'Consultation sauvegardée ✓', 'Les données ont été ajoutées à votre MediBook.');
        setMediBookView('assistance');
      } catch(err) {
        console.log('Live save error:', err);
        setLiveSaving(false);
        showMbModal('error', 'Erreur', 'La sauvegarde a échoué. Réessayez.');
      }
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#1A2029' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{ paddingTop: Platform.OS === 'android' ? 35 : 50, paddingBottom: wp(12), paddingHorizontal: wp(12), flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4A4F55' }}>
          <Pressable delayPressIn={120} onPress={function() { setMediBookView('assistance'); }}
            style={function(state) { return { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10), transform: [{ scale: state.pressed ? 0.92 : 1 }] }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
              <View style={{ width: wp(10), height: wp(10), borderRadius: wp(5), backgroundColor: '#00D984' }} />
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Consultation live</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(50) }}>

          {/* Nom du médecin */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(14), marginBottom: wp(16) }}>
            <Text style={{ fontSize: fp(10), color: '#888', marginBottom: wp(6) }}>MÉDECIN (optionnel)</Text>
            <TextInput value={liveDoctor} onChangeText={setLiveDoctor} placeholder="Dr. Nom" placeholderTextColor="#555"
              style={{ fontSize: fp(14), color: '#FFF', padding: 0 }} />
          </View>

          {/* Section 1 — Médicaments prescrits */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#FF6B8A40', borderRadius: wp(14), padding: wp(16), marginBottom: wp(16) }}>
            <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FF6B8A', marginBottom: wp(12) }}>Médicaments prescrits</Text>
            {liveMeds.map(function(m, i) {
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E2530', borderRadius: wp(8), padding: wp(10), marginBottom: wp(6), gap: wp(8) }}>
                  <Text style={{ fontSize: fp(13), color: '#FFF', flex: 1 }}>{m.name}</Text>
                  <View style={{ backgroundColor: m.conflict ? '#FFD93D20' : '#00D98420', paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4) }}>
                    <Text style={{ fontSize: fp(9), color: m.conflict ? '#FFD93D' : '#00D984', fontWeight: '600' }}>{m.conflict ? '⚠' : '✓'}</Text>
                  </View>
                  <Pressable onPress={function() { setLiveMeds(function(prev) { return prev.filter(function(_, j) { return j !== i; }); }); }}>
                    <Text style={{ fontSize: fp(14), color: '#FF6B8A' }}>✕</Text>
                  </Pressable>
                </View>
              );
            })}
            <TextInput value={liveMedSearch} onChangeText={setLiveMedSearch} placeholder="Ajouter un médicament..."
              placeholderTextColor="#555" style={{ fontSize: fp(13), color: '#FFF', backgroundColor: '#1E2530', borderRadius: wp(8), padding: wp(10), marginTop: wp(4) }}
              onSubmitEditing={function() {
                if (liveMedSearch.trim()) {
                  setLiveMeds(function(prev) { return prev.concat([{ name: liveMedSearch.trim(), dosage: null, conflict: false }]); });
                  setLiveMedSearch('');
                }
              }} returnKeyType="done" />
          </View>

          {/* Section 2 — Mesures vitales */}
          <Text style={{ fontSize: fp(12), fontWeight: '600', color: '#888', marginBottom: wp(8) }}>MESURES VITALES</Text>
          <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(8) }}>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12) }}>
              <Text style={{ fontSize: fp(10), color: '#888', marginBottom: wp(4) }}>Poids (kg)</Text>
              <TextInput value={liveWeight} onChangeText={setLiveWeight} placeholder="--" placeholderTextColor="#555"
                keyboardType="numeric" style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', padding: 0 }} />
            </View>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12) }}>
              <Text style={{ fontSize: fp(10), color: '#888', marginBottom: wp(4) }}>Température (°C)</Text>
              <TextInput value={liveTemp} onChangeText={setLiveTemp} placeholder="37.0" placeholderTextColor="#555"
                keyboardType="numeric" style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', padding: 0 }} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(16) }}>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12) }}>
              <Text style={{ fontSize: fp(10), color: '#888', marginBottom: wp(4) }}>Tension</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput value={liveTensionH} onChangeText={setLiveTensionH} placeholder="12" placeholderTextColor="#555"
                  keyboardType="numeric" style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', padding: 0, width: wp(30) }} />
                <Text style={{ fontSize: fp(18), color: '#555', marginHorizontal: wp(4) }}>/</Text>
                <TextInput value={liveTensionL} onChangeText={setLiveTensionL} placeholder="8" placeholderTextColor="#555"
                  keyboardType="numeric" style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', padding: 0, width: wp(30) }} />
              </View>
            </View>
            <View style={{ flex: 1, backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), padding: wp(12) }}>
              <Text style={{ fontSize: fp(10), color: '#888', marginBottom: wp(4) }}>Taille (cm)</Text>
              <TextInput value={liveHeight} onChangeText={setLiveHeight} placeholder="--" placeholderTextColor="#555"
                keyboardType="numeric" style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', padding: 0 }} />
            </View>
          </View>

          {/* Section 3 — Diagnostic */}
          <View style={{ backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(14), padding: wp(16), marginBottom: wp(16) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '600', color: '#888', marginBottom: wp(8) }}>DIAGNOSTIC</Text>
            <TextInput value={liveDiag} onChangeText={setLiveDiag} placeholder="Diagnostic (optionnel)"
              placeholderTextColor="#555" style={{ fontSize: fp(14), color: '#FFF', backgroundColor: '#1E2530', borderRadius: wp(8), padding: wp(10), marginBottom: wp(10) }} />
            <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(10) }}>
              {[
                { key: 'mild', label: 'Léger', color: '#00D984' },
                { key: 'moderate', label: 'Modéré', color: '#FFD93D' },
                { key: 'severe', label: 'Sévère', color: '#FF6B8A' },
              ].map(function(sev) {
                var isSel = liveSeverity === sev.key;
                return (
                  <Pressable key={sev.key} onPress={function() { setLiveSeverity(sev.key); }}
                    style={{ flex: 1, paddingVertical: wp(8), borderRadius: wp(8), alignItems: 'center',
                      backgroundColor: isSel ? sev.color + '20' : '#1E2530', borderWidth: 1, borderColor: isSel ? sev.color : '#3A3F46' }}>
                    <Text style={{ fontSize: fp(11), fontWeight: '600', color: isSel ? sev.color : '#888' }}>{sev.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput value={liveNotes} onChangeText={setLiveNotes} placeholder="Notes (optionnel)"
              placeholderTextColor="#555" multiline numberOfLines={3}
              style={{ fontSize: fp(12), color: '#FFF', backgroundColor: '#1E2530', borderRadius: wp(8), padding: wp(10), minHeight: wp(60), textAlignVertical: 'top' }} />
          </View>

          {/* Section 4 — Bouton validation */}
          <Pressable delayPressIn={120} onPress={function() { saveLiveConsultation(); }}
            style={function(state) { return {
              backgroundColor: '#00D984', borderRadius: wp(14), paddingVertical: wp(16), alignItems: 'center', marginBottom: wp(16),
              transform: [{ scale: state.pressed ? 0.96 : 1 }], opacity: liveSaving ? 0.6 : 1,
            }; }}>
            {liveSaving ? <ActivityIndicator size="small" color="#000" /> :
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#000' }}>Tout valider et sauvegarder</Text>}
          </Pressable>

          <BottomSpacer />
        </ScrollView>
      </View>
    );
  };

  // ── RENDER MEDIBOOK (ROUTER) ───────────────────────────────────────────────
  const renderMediBook = () => {
    if (mediBookView === 'carnet') return renderCarnetCapture();
    if (mediBookView === 'stats') return renderMediBookStats();
    if (mediBookView === 'report') return renderMediBookReport();
    if (mediBookView === 'assistance') return renderAssistanceMedicale();
    if (mediBookView === 'live') return renderLiveConsultation();
    return renderMediBookLanding();
  };


  if (uploadState === 'scanning') return renderScanningScreen();
  if (uploadState === 'results') return renderScanResults();
  if (uploadState === 'integrating') {
    return (
      <View style={{ flex: 1, backgroundColor: '#1A1D22', justifyContent: 'center', alignItems: 'center', paddingBottom: wp(70) }}>
        <ActivityIndicator size="large" color="#00D984" />
        <Text style={{ fontSize: fp(16), fontWeight: '600', color: '#FFF', marginTop: wp(16) }}>
          Intégration en cours...
        </Text>
        <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>
          Organisation des données
        </Text>
      </View>
    );
  }
  var mbModalEl = React.createElement(LixumModal, { visible: mbModal.visible, type: mbModal.type, title: mbModal.title, message: mbModal.message, onConfirm: mbModal.onConfirm, onClose: mbModal.onClose || closeMbModal, confirmText: mbModal.confirmText, cancelText: mbModal.cancelText });

  if (mediBookView === 'carnet') return React.createElement(View, { style: { flex: 1 } }, renderCarnetCapture(), mbModalEl);
  if (mediBookView === 'stats') return React.createElement(View, { style: { flex: 1 } }, renderMediBookStats(), mbModalEl);
  if (mediBookView === 'report') return React.createElement(View, { style: { flex: 1 } }, renderMediBookReport(), mbModalEl);
  if (mediBookView === 'assistance') return React.createElement(View, { style: { flex: 1 } }, renderAssistanceMedicale(), mbModalEl);
  if (mediBookView === 'live') return React.createElement(View, { style: { flex: 1 } }, renderLiveConsultation(), mbModalEl);
  return React.createElement(View, { style: { flex: 1 } }, renderMediBookLanding(), mbModalEl);
};
