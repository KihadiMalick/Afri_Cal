// ──────────────────────────────────────────────────────────────────────────────
// medicai/index.js — MedicAi : Composant principal
// State, routing, API calls, renderMain, renderContent
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Platform, Animated, KeyboardAvoidingView,
  Dimensions, StatusBar, PixelRatio, Keyboard, Pressable, Modal, ActivityIndicator, BackHandler,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle, Ellipse, Line,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { SUPABASE_URL, SUPABASE_ANON_KEY, ENERGY_CONFIG, TABS, wp, fp, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';
import { useAuth } from '../../config/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';
import LixumModal from '../../components/shared/LixumModal';
import { BottomTabs, FormattedText, FormattedResponseText, MetalCard, parseQuickReplies, parseAlixenResponse, QuickReplyButtons, BottomSpacer, LockIcon, ScrollArrow } from './shared';
import { SynapticNetwork, ResponseCard, LoadingSteps, FileQueuePreview, ModalScrollContent, parseDirectionBlocks, DirectionCard, HighlightedText, countOccurrences } from './AlixenChat';
// === ALIXEN SUPER CONTEXT v1 — Geolocation ===
import * as Location from 'expo-location';
import { MediBookContent } from './MediBookPages';
import { SecretPocketContent } from './SecretPocket';
import { AllModals } from './Modals';
import AlertSheet from './AlertSheet';
import { AlixenFace, FunnelBridgeUnified, getWireMode, FRAME_W, FRAME_H, MODULE_H, BRIDGE_TOP } from './alixenzone';
import PageHeader from '../../components/shared/PageHeader';
import EnergyGateModal from '../../components/shared/EnergyGateModal';
var NotificationService = require('../../services/NotificationService');



export default function MedicAiPage({ navigation, route }) {
  var insets = useSafeAreaInsets();
  var auth = useAuth();
  var userId = auth.userId;
  var lixBalance = auth.lixBalance; var updateLixBalance = auth.updateLixBalance;
  var userEnergy = auth.energy; var updateEnergy = auth.updateEnergy; var refreshLixFromServer = auth.refreshLixFromServer;

  // Energy gate state (server-side 402)
  var _energyGateData = useState(null); var energyGateData = _energyGateData[0]; var setEnergyGateData = _energyGateData[1];

  // Modal state
  var _mModal = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null, onClose: null, confirmText: 'Confirmer', cancelText: 'Annuler' });
  var mModal = _mModal[0]; var setMModal = _mModal[1];
  var closeMModal = function() { setMModal(function(p) { return Object.assign({}, p, { visible: false }); }); };
  var showMModal = function(type, title, message, extra) { setMModal(Object.assign({ visible: true, type: type, title: title, message: message, onClose: closeMModal, onConfirm: null, confirmText: 'Confirmer', cancelText: 'Annuler' }, extra || {})); };

  var getAlixenErrorMessage = function(status, error) {
    if (status === 429) return '⚠️ ALIXEN reçoit beaucoup de demandes. Réessayez dans quelques secondes.';
    if (status === 500 || status === 502 || status === 503) return '⚠️ ALIXEN est en mise à jour. Réessayez dans quelques instants.';
    if (status >= 400 && status < 500) return '⚠️ ALIXEN n\'a pas pu traiter cette demande. Réessayez.';
    if (error && (error.message || '').indexOf('timeout') >= 0) return '⚠️ La réponse prend trop de temps. Réessayez avec un message plus court.';
    if (error && (error.message || '').indexOf('Connexion lente') >= 0) return '⚠️ La réponse prend trop de temps. Réessayez avec un message plus court.';
    return '⚠️ Connexion interrompue. Vérifiez votre connexion internet et réessayez.';
  };

  var getAuthHeaders = async function() {
    var result = await supabase.auth.getSession();
    var token = result.data.session ? result.data.session.access_token : SUPABASE_ANON_KEY;
    return { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  };

  // ── CACHED AUTH TOKEN for synchronous header usage ──
  var _authTokenRef = useRef(SUPABASE_ANON_KEY);
  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      if (result.data.session) {
        _authTokenRef.current = result.data.session.access_token;
        console.log('[Auth] JWT token cached (length: ' + result.data.session.access_token.length + ')');
      } else {
        console.log('[Auth] No session — using anon key');
      }
    });
    var sub = supabase.auth.onAuthStateChange(function(event, session) {
      if (session) { _authTokenRef.current = session.access_token; }
      else { _authTokenRef.current = SUPABASE_ANON_KEY; }
    });
    return function() { if (sub && sub.data && sub.data.subscription) sub.data.subscription.unsubscribe(); };
  }, []);
  var authHeaders = function() {
    return { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current, 'Content-Type': 'application/json' };
  };

  // Sub-page navigation
  const [currentSubPage, setCurrentSubPage] = useState('main');

  // Messages du chat
  const [messages, setMessages] = useState([]);
  var chatStorageKey = userId ? 'alixen_chat_' + userId : null;

  var saveChatToStorage = function(msgs) {
    if (!chatStorageKey) return;
    try { AsyncStorage.setItem(chatStorageKey, JSON.stringify(msgs)); } catch (e) {}
  };

  var clearChatStorage = function() {
    if (!chatStorageKey) return;
    try { AsyncStorage.removeItem(chatStorageKey); } catch (e) {}
  };

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Données utilisateur (chargées au mount)
  const [userProfile, setUserProfile] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [userNameAvatar, setUserNameAvatar] = useState('');
  const [activeCharAvatar, setActiveCharAvatar] = useState(null);
  // === ALIXEN SUPER CONTEXT v1 — Geolocation + Super Context ===
  const [userLocation, setUserLocation] = useState(null);
  const alixenContextRef = useRef(null);

  // Plats disponibles + modal recette
  const [availableMeals, setAvailableMeals] = useState([]);
  const [recipeModal, setRecipeModal] = useState(null);

  // Modal message complet
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Recherche dans les messages
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchHits, setSearchHits] = useState(new Set());

  // Navigation
  const [activeTab, setActiveTab] = useState('medicai');

  // Carte de réponse
  const [cardMessage, setCardMessage] = useState(null);
  const [cardIsUser, setCardIsUser] = useState(false);
  const [cardIsLoading, setCardIsLoading] = useState(false);
  var _cardIsError = useState(false);
  var cardIsError = _cardIsError[0]; var setCardIsError = _cardIsError[1];
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [fileQueue, setFileQueue] = useState([]);

  // Clavier
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showDocumentSheet, setShowDocumentSheet] = useState(false);
  const [showNewSessionSheet, setShowNewSessionSheet] = useState(false);
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [emotionOverride, setEmotionOverride] = useState(null);
  const emotionTimerRef = useRef(null);
  const emotionDelayRef = useRef(null);
  const wowTimerRef = useRef(null);
  const wowDelayRef = useRef(null);
  const chatDelayTimerRef = useRef(null);
  const preciserTimersRef = useRef([]);
  const [userLang, setUserLang] = useState('FR');

  // AlertSheet state
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', icon: 'info', buttons: [] });
  const showAlert = (title, message, buttons = [{ text: 'OK', style: 'cancel' }], icon = 'info') => {
    setAlertConfig({ visible: true, title, message, icon, buttons });
  };
  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  // Secret Pocket state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAddDataSheet, setShowAddDataSheet] = useState(false);
  const [showCompactConfirm, setShowCompactConfirm] = useState(false);
  const [showRechargeSheet, setShowRechargeSheet] = useState(false);
  const [showCategoryUploadSheet, setShowCategoryUploadSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [secretPocketItems, setSecretPocketItems] = useState([]);
  const [openSpCategory, setOpenSpCategory] = useState(null);

  // Session compactage
  const [isCompacting, setIsCompacting] = useState(false);
  const [compactStep, setCompactStep] = useState(0);

  // Navigation interne MediBook
  const [mediBookView, setMediBookView] = useState('landing');
  const [reportSection, setReportSection] = useState('hub');

  // ── Handle deep navigation from Dashboard "Mes Stats" ──
  useEffect(function() {
    var params = route && route.params ? route.params : {};
    if (params.openSection === 'stats') {
      setCurrentSubPage('medibook');
      setMediBookView('stats');
      // Clear param to avoid re-triggering on re-focus
      if (navigation.setParams) navigation.setParams({ openSection: undefined });
    }
  }, [route && route.params && route.params.openSection]);
  const [analysesTab, setAnalysesTab] = useState('done');
  const [medsTab, setMedsTab] = useState('active');
  const [showAddMedSheet, setShowAddMedSheet] = useState(false);
  const [medSearchQuery, setMedSearchQuery] = useState('');
  const [medSearchResults, setMedSearchResults] = useState([]);
  const [selectedMedFromDb, setSelectedMedFromDb] = useState(null);
  const [addMedStep, setAddMedStep] = useState('search');
  const [newMedDosageValue, setNewMedDosageValue] = useState('500');
  const [newMedDosageUnit, setNewMedDosageUnit] = useState('mg');
  const [newMedFrequency, setNewMedFrequency] = useState(2);
  const [newMedDuration, setNewMedDuration] = useState('7 jours');
  const [newMedReminder, setNewMedReminder] = useState(true);
  const [showAddAnalysisSheet, setShowAddAnalysisSheet] = useState(false);
  const [newAnalysisLabel, setNewAnalysisLabel] = useState('');
  const [newAnalysisDate, setNewAnalysisDate] = useState('');
  const [newAnalysisDoctor, setNewAnalysisDoctor] = useState('');
  const [newAnalysisLab, setNewAnalysisLab] = useState('');
  const [newAnalysisNotes, setNewAnalysisNotes] = useState('');
  // Add Diagnostic
  var [showAddDiagSheet, setShowAddDiagSheet] = useState(false);
  var [addDiagStep, setAddDiagStep] = useState('search');
  var [diagSearchQuery, setDiagSearchQuery] = useState('');
  var [diagSearchResults, setDiagSearchResults] = useState([]);
  var [selectedDiagFromDb, setSelectedDiagFromDb] = useState(null);
  var [newDiagSeverity, setNewDiagSeverity] = useState('moderate');
  var [newDiagDate, setNewDiagDate] = useState('');
  var [newDiagDoctor, setNewDiagDoctor] = useState('');
  var [newDiagStatus, setNewDiagStatus] = useState('active');
  var [newDiagNotes, setNewDiagNotes] = useState('');
  // Add Allergy
  var [showAddAllergySheet, setShowAddAllergySheet] = useState(false);
  var [newAllergyAllergen, setNewAllergyAllergen] = useState('');
  var [newAllergyType, setNewAllergyType] = useState('alimentaire');
  var [newAllergySeverity, setNewAllergySeverity] = useState('moderate');
  var [newAllergyReaction, setNewAllergyReaction] = useState('');
  // Add Vaccination
  var [showAddVaccSheet, setShowAddVaccSheet] = useState(false);
  var [newVaccName, setNewVaccName] = useState('');
  var [newVaccDate, setNewVaccDate] = useState('');
  var [newVaccDose, setNewVaccDose] = useState(1);
  var [newVaccNextDue, setNewVaccNextDue] = useState('');
  var [newVaccDoctor, setNewVaccDoctor] = useState('');
  var [newVaccBatch, setNewVaccBatch] = useState('');
  var _vaccSearchResults = useState([]);
  var vaccSearchResults = _vaccSearchResults[0]; var setVaccSearchResults = _vaccSearchResults[1];
  var _selectedVaccineFromDb = useState(null);
  var selectedVaccineFromDb = _selectedVaccineFromDb[0]; var setSelectedVaccineFromDb = _selectedVaccineFromDb[1];
  var _vaccReminderNote = useState('');
  var vaccReminderNote = _vaccReminderNote[0]; var setVaccReminderNote = _vaccReminderNote[1];
  var _vaccReminderAutoFilled = useState(false);
  var vaccReminderAutoFilled = _vaccReminderAutoFilled[0]; var setVaccReminderAutoFilled = _vaccReminderAutoFilled[1];
  // Vaccine calendar dashboard
  var _vaccCalView = useState('calendar');
  var vaccCalendarView = _vaccCalView[0]; var setVaccCalendarView = _vaccCalView[1];
  var _vaccSchedule = useState([]);
  var vaccSchedule = _vaccSchedule[0]; var setVaccSchedule = _vaccSchedule[1];
  var _vaccStats = useState(null);
  var vaccStats = _vaccStats[0]; var setVaccStats = _vaccStats[1];
  var _vaccPriorityFilter = useState(null);
  var vaccPriorityFilter = _vaccPriorityFilter[0]; var setVaccPriorityFilter = _vaccPriorityFilter[1];
  var _vaccCalLoading = useState(false);
  var vaccCalendarLoading = _vaccCalLoading[0]; var setVaccCalendarLoading = _vaccCalLoading[1];
  const [activeProfile, setActiveProfile] = useState('self');
  const [children, setChildren] = useState([]);
  const [carnetPhotos, setCarnetPhotos] = useState([]);
  const [statsTab, setStatsTab] = useState('nutrition');

  // Données médicales chargées depuis Supabase
  const [medicalData, setMedicalData] = useState({
    analyses: [],
    medications: [],
    allergies: [],
    vaccinations: [],
    diagnostics: [],
    vitalityScore: 0,
    profileId: null,
    medsTerminated: [],
    scheduledAnalyses: [],
  });
  const [medicalDataLoading, setMedicalDataLoading] = useState(false);
  const [nutritionWeekData, setNutritionWeekData] = useState(null);

  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showAddChildSheet, setShowAddChildSheet] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [showChildNameInput, setShowChildNameInput] = useState(false);
  const [newChildIsFree, setNewChildIsFree] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [showCarnetPageSheet, setShowCarnetPageSheet] = useState(false);
  const [selectedCarnetPage, setSelectedCarnetPage] = useState(null);
  const [showAnalyzeSheet, setShowAnalyzeSheet] = useState(false);
  const [showMediBookUploadSheet, setShowMediBookUploadSheet] = useState(false);

  // Medical share (QR code for doctors)
  var _shareToken = useState(null); var shareToken = _shareToken[0]; var setShareToken = _shareToken[1];
  var _shareLoading = useState(false); var shareLoading = _shareLoading[0]; var setShareLoading = _shareLoading[1];
  var _shareError = useState(null); var shareError = _shareError[0]; var setShareError = _shareError[1];
  var _shareExpiry = useState(null); var shareExpiry = _shareExpiry[0]; var setShareExpiry = _shareExpiry[1];

  // Upload / Scan IA
  const [uploadState, setUploadState] = useState('idle');
  const [scanResults, setScanResults] = useState(null);
  const [scanSteps, setScanSteps] = useState([]);
  const [scanContext, setScanContext] = useState(null);
  const [scanCategory, setScanCategory] = useState(null);
  const [scanFileName, setScanFileName] = useState('');
  // Batch scan
  var _batchPhotos = useState([]);
  var batchPhotos = _batchPhotos[0]; var setBatchPhotos = _batchPhotos[1];
  var _showBatchPreview = useState(false);
  var showBatchPreview = _showBatchPreview[0]; var setShowBatchPreview = _showBatchPreview[1];
  var _batchProgress = useState('');
  var batchProgress = _batchProgress[0]; var setBatchProgress = _batchProgress[1];
  var _batchId = useState(null);
  var batchIdState = _batchId[0]; var setBatchIdState = _batchId[1];

  // === ALIXEN Face State — dérivé des variables de chat ===
  const getAlixenState = function() {
    if (emotionOverride) return emotionOverride;
    if (uploadState === 'scanning') return 'scanning';
    if (cardIsUser) return 'listening';
    if (cardIsLoading || isLoading) return 'thinking';
    if (cardMessage && !cardIsUser && !cardIsLoading) return 'speaking';
    if (medicalDataLoading) return 'memory';
    return 'idle';
  };
  const alixenState = getAlixenState();

  // Helper: déclencher une émotion temporaire après speaking
  var triggerEmotion = function(emotion) {
    if (!emotion) return;
    if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
    if (emotionDelayRef.current) clearTimeout(emotionDelayRef.current);
    emotionDelayRef.current = setTimeout(function() {
      setEmotionOverride(emotion);
      emotionTimerRef.current = setTimeout(function() {
        setEmotionOverride(null);
        emotionTimerRef.current = null;
      }, 3500);
    }, 500);
  };

  // Helper: texte de mention pour chaque état
  var getAlixenMention = function(state) {
    if (userLang === 'EN') {
      switch (state) {
        case 'thinking': return 'ALIXEN is thinking...';
        case 'speaking': return 'ALIXEN is responding...';
        case 'scanning': return 'ALIXEN is analyzing...';
        case 'memory': return 'ALIXEN is consulting...';
        case 'happy': return 'ALIXEN is delighted!';
        case 'sad': return 'ALIXEN is sad...';
        case 'heart': return 'ALIXEN is touched';
        case 'wow': return 'ALIXEN is impressed!';
        case 'gps': return 'ALIXEN is locating...';
        default: return '';
      }
    }
    switch (state) {
      case 'thinking': return 'ALIXEN réfléchit...';
      case 'speaking': return 'ALIXEN répond...';
      case 'scanning': return 'ALIXEN analyse...';
      case 'memory': return 'ALIXEN consulte...';
      case 'happy': return 'ALIXEN est ravie !';
      case 'sad': return 'ALIXEN est triste...';
      case 'heart': return 'ALIXEN est touchée';
      case 'wow': return 'ALIXEN est impressionnée !';
      case 'gps': return 'ALIXEN localise...';
      default: return '';
    }
  };
  var wm = getWireMode(alixenState);

  // Pulse animation for labels — native driver, zero JS re-renders
  var pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(function() {
    var anim = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]));
    anim.start();
    return function() { anim.stop(); };
  }, []);
  useEffect(function() {
    return function() {
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
      if (emotionDelayRef.current) clearTimeout(emotionDelayRef.current);
      if (wowTimerRef.current) clearTimeout(wowTimerRef.current);
      if (wowDelayRef.current) clearTimeout(wowDelayRef.current);
      if (chatDelayTimerRef.current) clearTimeout(chatDelayTimerRef.current);
      preciserTimersRef.current.forEach(function(t) { clearTimeout(t); });
    };
  }, []);

  // Dynamic Secret Pocket categories with real counts
  const spCategories = useMemo(function() { return [
    { id: 'diagnostics', title: 'Diagnostics à surveiller', desc: 'Diabète, hypertension, cholestérol...', icon: 'heart-pulse', color: '#FF6B6B', count: secretPocketItems.filter(function(i) { return i.category === 'diagnostics'; }).length },
    { id: 'allergies', title: 'Allergies et intolérances', desc: 'Alimentaires, médicamenteuses...', icon: 'shield-alert', color: '#FF8C42', count: secretPocketItems.filter(function(i) { return i.category === 'allergies'; }).length },
    { id: 'medications', title: 'Médicaments en cours', desc: 'Traitements actuels et posologie', icon: 'pill', color: '#4DA6FF', count: secretPocketItems.filter(function(i) { return i.category === 'medications'; }).length },
    { id: 'lab-results', title: "Résultats d'analyses", desc: 'Bilans sanguins, examens...', icon: 'flask', color: '#00D984', count: secretPocketItems.filter(function(i) { return i.category === 'lab-results'; }).length },
    { id: 'notes', title: 'Notes personnelles', desc: 'Vos observations de santé', icon: 'edit', color: '#9B6DFF', count: secretPocketItems.filter(function(i) { return i.category === 'notes'; }).length },
    { id: 'conversations', title: 'Conversations sensibles', desc: 'Échanges privés avec ALIXEN', icon: 'message-lock', color: '#D4AF37', count: secretPocketItems.filter(function(i) { return i.category === 'conversations'; }).length },
  ]; }, [secretPocketItems]);

  // Refs
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const carnetPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(function() {
    var anim = null;
    if (mediBookView === 'carnet' && carnetPhotos.filter(function(p) { return p; }).length === 0) {
      anim = Animated.loop(Animated.sequence([
        Animated.timing(carnetPulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(carnetPulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ]));
      anim.start();
    } else {
      carnetPulseAnim.setValue(1);
    }
    return function() { if (anim) anim.stop(); };
  }, [mediBookView, carnetPhotos]);

  // Animations d'entrée
  const contentEntry = useRef(new Animated.Value(0)).current;
  const inputEntry = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Sub-page animation refs
  const mbGenerateScale = useRef(new Animated.Value(1)).current;
  const spAddScale = useRef(new Animated.Value(1)).current;

  // ── Persist chat to AsyncStorage on every change ──────────────────────────
  useEffect(function() {
    if (messages.length > 0) { saveChatToStorage(messages); }
  }, [messages]);

  // ── Chargement des données au mount ──────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    loadUserData();
    loadAvailableMeals();
    loadMedicalData();
    loadFamilyMembers();
    loadVaccineSchedule();
    // Avatar profil
    (async () => {
      try {
        const pRes = await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId + '&select=full_name,lix_balance', { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current } });
        const pD = await pRes.json();
        if (pD && pD[0]) {
          setUserNameAvatar(pD[0].full_name || '');
          updateLixBalance(pD[0].lix_balance || 0);
        }
        const cRes = await fetch(SUPABASE_URL + '/rest/v1/lixverse_user_characters?user_id=eq.' + userId + '&is_active=eq.true&select=character_slug', { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current } });
        const cD = await cRes.json();
        if (cD && cD[0]) setActiveCharAvatar({ slug: cD[0].character_slug });
      } catch (e) {}
    })();

    Animated.stagger(200, [
      Animated.spring(contentEntry, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(inputEntry, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [userId]);

  // Refresh Lix balance when page gains focus
  var _pageActive = useState(true); var pageActive = _pageActive[0]; var setPageActive = _pageActive[1];
  useFocusEffect(useCallback(function() {
    setPageActive(true);
    if (userId) refreshLixFromServer();
    return function() { setPageActive(false); };
  }, [userId, refreshLixFromServer]));

  // Close MedicAi — navigate to Home
  var closeMedicAi = function() {
    if (navigation) navigation.navigate('Accueil');
  };

  // Android back button → close MedicAi
  useEffect(function() {
    var handler = BackHandler.addEventListener('hardwareBackPress', function() {
      closeMedicAi();
      return true;
    });
    return function() { handler.remove(); };
  }, []);

  // ── Afficher le message de bienvenue dans la carte ──────────────────────
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setCardMessage(messages[0].content);
      setCardIsUser(false);
      setCardIsLoading(false);
    }
  }, [messages.length]);

  // ── Keyboard listener ────────────────────────────────────────────────────
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // ── Charger données médicales quand on entre dans Mes Stats ──────────────
  React.useEffect(() => {
    if (mediBookView === 'stats' || mediBookView === 'report') {
      loadMedicalData();
    }
  }, [mediBookView]);

  // ── Recharger les données médicales quand on change de profil ───────────
  React.useEffect(function() {
    if (userId) loadMedicalData();
  }, [activeProfile]);

  const addBotMessage = useCallback((text) => {
    setMessages(prev => {
      if (prev.length >= 24) {
        showMModal('confirm', 'Session complète', 'Tu as atteint 24 messages dans cette session. Ouvre une nouvelle discussion en cliquant sur + pour continuer.', { confirmText: 'Compris', cancelText: null, onConfirm: closeMModal });
        return prev;
      }
      return [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        _isNew: true,
        _status: 'read',
      }];
    });
  }, []);

  const loadUserData = async () => {
    // Load persisted chat first
    if (chatStorageKey) {
      try {
        var saved = await AsyncStorage.getItem(chatStorageKey);
        if (saved) {
          var parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            // Set card to last assistant message
            for (var si = parsed.length - 1; si >= 0; si--) {
              if (parsed[si].role === 'assistant') {
                setCardMessage(parsed[si].content);
                setCardIsUser(false);
                setCardIsLoading(false);
                break;
              }
            }
            // Skip greeting — chat restored
            try {
              var profileRes2 = await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId + '&select=*', { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current } });
              var pd2 = await profileRes2.json();
              if (pd2.length > 0) setUserProfile(pd2[0]);
            } catch (e) {}
            return;
          }
        }
      } catch (e) {}
    }
    try {
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users_profile?user_id=eq.${userId}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current } }
      );
      const profileData = await profileRes.json();
      if (profileData.length > 0) {
        setUserProfile(profileData[0]);
        if (profileData[0].language) setUserLang(profileData[0].language === 'EN' ? 'EN' : 'FR');
      }

      const today = new Date().toISOString().split('T')[0];
      const summaryRes = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_summary?user_id=eq.${userId}&date=eq.${today}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current } }
      );
      const summaryData = await summaryRes.json();
      if (summaryData.length > 0) setTodaySummary(summaryData[0]);

      // Charger les repas du jour
      const todayStr = new Date().toISOString().split('T')[0];
      const mealsRes = await fetch(
        SUPABASE_URL + '/rest/v1/meals?user_id=eq.' + userId + '&date=eq.' + todayStr + '&select=name,meal_type,calories,protein,carbs,fat&order=created_at.asc',
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current } }
      );
      const mealsData = await mealsRes.json();
      if (Array.isArray(mealsData)) setTodayMeals(mealsData);

      generateGreeting(profileData[0], summaryData[0]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      addBotMessage("Bonjour ! Je suis ALIXEN, votre coach nutritionniste IA personnel. Comment puis-je vous aider aujourd'hui ?");
    }
  };

  const loadAvailableMeals = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/meals_master?select=id,name,category,calories_per_serving&order=name`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current } }
      );
      const data = await res.json();
      if (Array.isArray(data)) setAvailableMeals(data);
    } catch (error) {
      console.error('Erreur chargement plats:', error);
    }
  };

  // ── Parse dates françaises ───────────────────────────────────────────────
  const parseFrenchDate = (dateStr) => {
    if (!dateStr) return null;
    const months = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12',
    };
    const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (match) {
      const month = months[match[2].toLowerCase()];
      if (month) return match[3] + '-' + month + '-' + match[1].padStart(2, '0');
    }
    const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) return slashMatch[3] + '-' + slashMatch[2] + '-' + slashMatch[1];
    return null;
  };

  // ── Chargement données médicales depuis Supabase ──────────────────────────
  const loadMedicalData = async () => {
    setMedicalDataLoading(true);
    try {
      var headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + _authTokenRef.current,
        'Content-Type': 'application/json',
      };

      // Filtre par profil: enfant → family_member_id=eq.UUID, self → pas de filtre (compatibilité)
      var fmFilter = activeProfile !== 'self' ? '&family_member_id=eq.' + activeProfile : '';

      // Charger le profil
      var profileRes = await fetch(
        SUPABASE_URL + '/rest/v1/health_profiles?user_id=eq.' + userId + '&profile_type=eq.self&limit=1',
        { headers: headers }
      );
      var profiles = await profileRes.json();
      var profileId = profiles[0]?.id || null;
      var vitalityScore = profiles[0]?.vitality_score || 0;

      // Charger les analyses
      var analysesRes = await fetch(
        SUPABASE_URL + '/rest/v1/medical_analyses?user_id=eq.' + userId + fmFilter + '&order=created_at.desc',
        { headers: headers }
      );
      var analyses = await analysesRes.json();

      // Charger les médicaments actifs
      var medsRes = await fetch(
        SUPABASE_URL + '/rest/v1/medications?user_id=eq.' + userId + fmFilter + '&status=eq.active&order=created_at.desc',
        { headers: headers }
      );
      var medications = await medsRes.json();

      // Charger les allergies
      var allergiesRes = await fetch(
        SUPABASE_URL + '/rest/v1/allergies?user_id=eq.' + userId + fmFilter + '&order=created_at.desc',
        { headers: headers }
      );
      var allergiesData = await allergiesRes.json();

      // Charger les vaccinations
      var vaccLoadUrl = SUPABASE_URL + '/rest/v1/vaccinations?user_id=eq.' + userId + fmFilter + '&order=administration_date.desc';
      console.log('[loadMedicalData] vaccinations URL:', vaccLoadUrl);
      var vaccRes2 = await fetch(vaccLoadUrl, { headers: headers });
      var vaccinations = await vaccRes2.json();
      console.log('[loadMedicalData] vaccinations status:', vaccRes2.status, 'count:', Array.isArray(vaccinations) ? vaccinations.length : 'NOT_ARRAY', vaccinations && vaccinations.message ? vaccinations.message : '');

      // Charger les diagnostics
      var diagRes = await fetch(
        SUPABASE_URL + '/rest/v1/diagnostics?user_id=eq.' + userId + fmFilter + '&order=created_at.desc',
        { headers: headers }
      );
      var diagnostics = await diagRes.json();

      // Charger les médicaments terminés
      var medsTermRes = await fetch(
        SUPABASE_URL + '/rest/v1/medications?user_id=eq.' + userId + fmFilter + '&status=eq.completed&order=end_date.desc',
        { headers: headers }
      );
      var medsTerminated = await medsTermRes.json();

      // Charger les analyses planifiées
      var scheduledRes = await fetch(
        SUPABASE_URL + '/rest/v1/medical_analyses?user_id=eq.' + userId + fmFilter + '&is_scheduled=eq.true&order=scheduled_date.asc',
        { headers: headers }
      );
      var scheduledAnalyses = await scheduledRes.json();

      // Charger les 7 derniers jours de nutrition
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nutritionRes = await fetch(
        SUPABASE_URL + '/rest/v1/daily_summary?user_id=eq.' + userId +
        '&date=gte.' + sevenDaysAgo + '&date=lte.' + today + '&order=date.asc',
        { headers }
      );
      const nutritionData = await nutritionRes.json();
      if (Array.isArray(nutritionData) && nutritionData.length > 0) {
        setNutritionWeekData(nutritionData);
      }

      setMedicalData({
        analyses: Array.isArray(analyses) ? analyses : [],
        medications: Array.isArray(medications) ? medications : [],
        allergies: Array.isArray(allergiesData) ? allergiesData : [],
        vaccinations: Array.isArray(vaccinations) ? vaccinations : [],
        diagnostics: Array.isArray(diagnostics) ? diagnostics : [],
        medsTerminated: Array.isArray(medsTerminated) ? medsTerminated : [],
        scheduledAnalyses: Array.isArray(scheduledAnalyses) ? scheduledAnalyses : [],
        vitalityScore: vitalityScore,
        profileId: profileId,
      });

    } catch (error) {
      console.error('Erreur chargement données médicales:', error);
    } finally {
      setMedicalDataLoading(false);
    }
  };

  // ── Charger les profils enfants depuis Supabase ─────────────────────────
  var loadFamilyMembers = async function() {
    if (!userId) return;
    try {
      var res = await fetch(
        SUPABASE_URL + '/rest/v1/family_members?user_id=eq.' + userId + '&is_active=eq.true&relation=eq.child&order=created_at.asc&select=*',
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current } }
      );
      var data = await res.json();
      if (Array.isArray(data)) {
        setChildren(data.map(function(fm) {
          var age = '';
          if (fm.birth_date) {
            var diff = Date.now() - new Date(fm.birth_date).getTime();
            age = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)) + ' ans';
          }
          return { id: fm.id, name: fm.name, age: age, birth_date: fm.birth_date, gender: fm.gender, medical_profile_unlocked: fm.medical_profile_unlocked };
        }));
      }
    } catch (e) {
      console.warn('Erreur chargement family_members:', e);
    }
  };

  // ── Message d'accueil intelligent ────────────────────────────────────────
  const generateGreeting = (profile, summary) => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const name = profile?.full_name?.split(' ')[0] || 'cher membre';

    let greeting = '';

    if (!summary || summary.total_calories === 0) {
      if (hour > 13) {
        greeting = `${timeGreeting} ${name} ! Ravi de vous revoir dans votre espace santé. \uD83D\uDC4B\n\nJe remarque que vous n'avez encore rien mangé aujourd'hui... Tout va bien ?\n\nN'oubliez pas que sauter des repas n'est jamais bon pour le métabolisme. Même un fruit ou un yaourt, c'est mieux que rien. \uD83C\uDF4E`;
      } else {
        greeting = `Bienvenue ${name} dans votre espace santé intelligent ! \uD83D\uDC4B\n\nJe suis ALIXEN, votre coach nutritionniste IA personnel. Ici, tout est confidentiel et pensé pour votre bien-être.\n\nParlez-moi de vos objectifs santé, je suis tout ouïe.`;
      }
    } else {
      const calories = summary.total_calories || 0;
      const tdee = profile?.tdee || 2000;
      const percentage = Math.round((calories / tdee) * 100);

      greeting = `${timeGreeting} ${name} ! Content de vous revoir. \uD83D\uDC4B\n\nJ'ai jeté un œil à vos données du jour depuis votre espace santé : vous êtes à ${calories} kcal sur ${tdee} kcal (${percentage}%).\n\n`;

      if (percentage < 30 && hour > 14) {
        greeting += `C'est un peu bas pour cette heure-ci. Vous avez prévu de manger bientôt ? \uD83E\uDD14`;
      } else if (percentage > 100) {
        greeting += `Vous avez dépassé votre objectif calorique aujourd'hui. Ce n'est pas grave si c'est occasionnel ! On en discute ? \uD83D\uDE0A`;
      } else {
        greeting += `Vous êtes bien parti ! De quoi voulez-vous qu'on parle ? \uD83D\uDE0A`;
      }
    }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
      _isNew: true,
      _status: 'read',
    }]);
  };

  // === ALIXEN SUPER CONTEXT v1 — Geolocation (lazy, on-demand) ===
  var requestLocationOnce = async function() {
    if (userLocation) return userLocation;
    try {
      var result = await Location.requestForegroundPermissionsAsync();
      if (result.status === 'granted') {
        var loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        var coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setUserLocation(coords);
        return coords;
      }
    } catch (e) {}
    return null;
  };

  // === CHECK WOW EVENTS AU MONTAGE ===
  useEffect(function() {
    async function checkWowEvents() {
      try {
        var headers = {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + _authTokenRef.current,
        };
        var last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        var yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        var hasWow = false;

        // 1. Défi top 10 terminé récemment
        var challengeRes = await fetch(
          SUPABASE_URL + '/rest/v1/lixverse_challenges?user_id=eq.' + userId + '&status=eq.completed&order=created_at.desc&limit=1',
          { headers: headers }
        );
        var challengeData = await challengeRes.json();
        if (Array.isArray(challengeData) && challengeData.length > 0) {
          var completedAt = challengeData[0].completed_at || challengeData[0].updated_at;
          if (completedAt && completedAt >= last24h) hasWow = true;
        }

        // 2. Objectif journalier de la veille respecté
        if (!hasWow) {
          var dailyRes = await fetch(
            SUPABASE_URL + '/rest/v1/daily_summary?user_id=eq.' + userId + '&date=eq.' + yesterday + '&limit=1',
            { headers: headers }
          );
          var dailyData = await dailyRes.json();
          if (Array.isArray(dailyData) && dailyData.length > 0 && dailyData[0].objective_met) hasWow = true;
        }

        if (hasWow) {
          wowDelayRef.current = setTimeout(function() {
            setEmotionOverride('wow');
            wowTimerRef.current = setTimeout(function() {
              setEmotionOverride(null);
              wowTimerRef.current = null;
            }, 4000);
          }, 2000);
        }
      } catch (e) {
      }
    }
    checkWowEvents();
  }, []);

  // === ALIXEN SUPER CONTEXT v1 — Data Loader ===
  const getWeekStart = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff).toISOString().split('T')[0];
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const loadAlixenContext = async (userId) => {
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + _authTokenRef.current,
      'Content-Type': 'application/json',
    };

    const fetchTable = async (table, select = '*', filters = '') => {
      try {
        const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&user_id=eq.${userId}${filters}`;
        const res = await fetch(url, { headers });
        return res.ok ? await res.json() : [];
      } catch { return []; }
    };

    const [
      characters,
      medibook,
      profile,
      challenges,
      groupMembers,
      weekMeals,
      weekActivities,
      weekMoods,
      weekHydration,
      dailySummary,
    ] = await Promise.all([
      fetchTable('lixverse_user_characters', 'character_slug,level,xp,unlocked_at,is_active'),
      fetchTable('health_profiles', '*'),
      fetchTable('users_profile', '*', '').then(r => r[0] || {}),
      fetchTable('lixverse_challenges', '*', '&status=in.(active,completed)&order=created_at.desc&limit=10'),
      fetchTable('lixverse_group_members', '*'),
      fetchTable('meals', '*', `&created_at=gte.${getWeekStart()}&order=created_at.desc`),
      fetchTable('activities', '*', `&created_at=gte.${getWeekStart()}&order=created_at.desc`),
      fetchTable('moods', '*', `&created_at=gte.${getWeekStart()}&order=created_at.desc`),
      fetchTable('daily_summary', 'total_calories,total_protein,total_carbs,total_fat,hydration_ml', `&date=gte.${getWeekStart()}&order=date.desc`),
      fetchTable('daily_summary', '*', `&date=eq.${getTodayDate()}`).then(r => r[0] || {}),
    ]);

    return {
      characters,
      medibook,
      profile,
      challenges,
      groupMembers,
      weekMeals,
      weekActivities,
      weekMoods,
      weekHydration,
      dailySummary,
    };
  };

  // === ALIXEN SUPER CONTEXT v1 — Load context at mount + refresh every 5 min ===
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const ctx = await loadAlixenContext(userId);
        alixenContextRef.current = ctx;
      } catch (e) {
      }
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userId]);

  // ── Construire le contexte utilisateur ───────────────────────────────────
  const buildUserContext = () => {
    if (!userProfile) return 'Données utilisateur non disponibles.';

    var langPrefix = 'LANGUE PRÉFÉRÉE : ' + userLang + '\n\n';
    const today = new Date().toLocaleDateString('fr-FR');
    const dayOfMonth = new Date().getDate();
    const hour = new Date().getHours();
    const cal = todaySummary?.total_calories || 0;
    const protein = todaySummary?.total_protein || 0;
    const carbs = todaySummary?.total_carbs || 0;
    const fat = todaySummary?.total_fat || 0;

    const mealsList = availableMeals.length > 0
      ? availableMeals.slice(0, 20).map(m => m.name + ' (' + (m.calories_per_serving || '?') + ' kcal)').join(', ')
      : 'Liste non chargée';

    // Médicaments actifs
    const activeMeds = medicalData.medications.length > 0
      ? medicalData.medications.map(m => {
          const dosage = m.dosage || (m.dosage_value ? m.dosage_value + ' ' + (m.dosage_unit || 'mg') : '');
          const freq = m.frequency || (m.frequency_per_day ? m.frequency_per_day + 'x/jour' : '');
          const dayInfo = m.start_date && m.end_date
            ? 'jour ' + Math.min(
                Math.ceil((Date.now() - new Date(m.start_date).getTime()) / (1000 * 60 * 60 * 24)),
                Math.ceil((new Date(m.end_date).getTime() - new Date(m.start_date).getTime()) / (1000 * 60 * 60 * 24))
              ) + '/' + Math.ceil((new Date(m.end_date).getTime() - new Date(m.start_date).getTime()) / (1000 * 60 * 60 * 24))
            : '';
          return m.name + ' ' + dosage + ' ' + freq + (dayInfo ? ' (' + dayInfo + ')' : '');
        }).join('; ')
      : 'Aucun traitement en cours';

    // Allergies
    const allergiesList = medicalData.allergies.length > 0
      ? medicalData.allergies.map(a => a.allergen + ' (' + (a.severity === 'severe' ? 'SÉVÈRE' : a.severity === 'moderate' ? 'modéré' : a.severity || '') + ')').join(', ')
      : 'Aucune allergie enregistrée';

    // Analyses à venir
    const upcomingAnalyses = medicalData.scheduledAnalyses && medicalData.scheduledAnalyses.length > 0
      ? medicalData.scheduledAnalyses.map(a => {
          const days = Math.ceil((new Date(a.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24));
          return a.label + ' dans ' + days + ' jours' + (a.laboratory ? ' au ' + a.laboratory : '');
        }).join('; ')
      : 'Aucune analyse planifiée';

    // Rappels vaccins
    var now = new Date();
    var vaccineReminders = '';
    var vaccineOverdue = '';
    if (medicalData.vaccinations && medicalData.vaccinations.length > 0) {
      var upcoming = medicalData.vaccinations.filter(function(v) { return v.next_due_date && new Date(v.next_due_date) >= now; });
      var overdue = medicalData.vaccinations.filter(function(v) { return v.next_due_date && new Date(v.next_due_date) < now; });
      if (upcoming.length > 0) {
        vaccineReminders = upcoming.map(function(v) {
          var d = Math.ceil((new Date(v.next_due_date) - now) / (1000 * 60 * 60 * 24));
          return 'Vaccin ' + (v.vaccine_name || '?') + ' le ' + new Date(v.next_due_date).toLocaleDateString('fr-FR') + ' (dans ' + d + ' jours)';
        }).join('; ');
      }
      if (overdue.length > 0) {
        vaccineOverdue = overdue.map(function(v) {
          var d = Math.ceil((now - new Date(v.next_due_date)) / (1000 * 60 * 60 * 24));
          return 'Vaccin ' + (v.vaccine_name || '?') + ' prévu le ' + new Date(v.next_due_date).toLocaleDateString('fr-FR') + ' (retard de ' + d + ' jours)';
        }).join('; ');
      }
    }
    // Analyses en retard
    var analysesOverdue = '';
    if (medicalData.scheduledAnalyses && medicalData.scheduledAnalyses.length > 0) {
      var overdueAn = medicalData.scheduledAnalyses.filter(function(a) { return a.scheduled_date && new Date(a.scheduled_date) < now; });
      if (overdueAn.length > 0) {
        analysesOverdue = overdueAn.map(function(a) {
          var d = Math.ceil((now - new Date(a.scheduled_date)) / (1000 * 60 * 60 * 24));
          return 'Analyse ' + (a.label || '?') + ' prévue le ' + new Date(a.scheduled_date).toLocaleDateString('fr-FR') + ' (retard de ' + d + ' jours)';
        }).join('; ');
      }
    }

    // Résultats anormaux récents
    const abnormalResults = medicalData.analyses
      ? medicalData.analyses
          .filter(a => a.status === 'elevated' || a.status === 'low' || a.status === 'critical')
          .map(a => a.label + ': ' + a.value + ' (' + a.status + ')')
          .join(', ')
      : '';

    // Diagnostics
    const diagList = medicalData.diagnostics && medicalData.diagnostics.length > 0
      ? medicalData.diagnostics.map(d => d.condition_name || '').join(', ')
      : '';

    // Score vitalité
    const vitalityScore = medicalData.vitalityScore || 0;

    // Contexte temporel pour proactivité
    let temporalContext = '';
    if (dayOfMonth >= 25) {
      temporalContext = 'CONTEXTE TEMPOREL : Nous sommes le ' + dayOfMonth + ' du mois. C\'est bientôt la fin du mois — si pertinent, tu peux proposer un plan de courses pour le mois prochain.';
    }
    if (hour >= 17 && hour <= 20 && cal < (userProfile.tdee || 2000) * 0.6) {
      temporalContext += ' Il est ' + hour + 'h et l\'utilisateur n\'a mangé que ' + cal + ' kcal. Tu peux suggérer des idées de dîner.';
    }

    // Activités du jour
    var todayActivitiesContext = '';
    if (alixenContextRef.current && alixenContextRef.current.weekActivities) {
      var todayStr = new Date().toISOString().split('T')[0];
      var todayActs = alixenContextRef.current.weekActivities.filter(function(a) {
        return a.performed_at && a.performed_at.startsWith(todayStr);
      });
      if (todayActs.length > 0) {
        todayActivitiesContext = '\nACTIVITÉS AUJOURD\'HUI :\n' + todayActs.map(function(a) {
          return '- ' + (a.name || a.type || 'Activité') + ' ' + (a.duration_min || '?') + ' min — ' + (a.calories_burned || '?') + ' kcal brûlées';
        }).join('\n');
      } else {
        todayActivitiesContext = '\nACTIVITÉS AUJOURD\'HUI : Aucune activité enregistrée.';
      }
    }

    return langPrefix + `DONNÉES UTILISATEUR (${today}) :
- Nom : ${userProfile.full_name || 'N/A'}
- Âge : ${userProfile.age || 'N/A'} ans | Sexe : ${userProfile.gender || 'N/A'}
- Poids : ${userProfile.weight || 'N/A'} kg | Taille : ${userProfile.height || 'N/A'} cm
- Objectif : ${userProfile.goal || 'N/A'} | Cible : ${userProfile.daily_calorie_target || userProfile.tdee || 'N/A'} kcal/jour
- BMR : ${userProfile.bmr || 'N/A'} kcal | TDEE : ${userProfile.tdee || 'N/A'} kcal
- IMC : ${userProfile.weight && userProfile.height ? (userProfile.weight / ((userProfile.height / 100) * (userProfile.height / 100))).toFixed(1) : 'N/A'}
- Niveau d'activité : ${userProfile.activity_level || 'N/A'}
- Régime alimentaire : ${userProfile.dietary_regime || 'classique'}
- Humeur actuelle : ${userProfile.current_mood || 'non renseignée'} | Météo : ${userProfile.current_weather || 'non renseignée'}
- Score Vitalité : ${vitalityScore}/100

MACROS AUJOURD'HUI :
- Calories : ${cal} / ${userProfile.daily_calorie_target || userProfile.tdee || 2000} kcal (objectif ajusté)
- Protéines : ${protein}g | Glucides : ${carbs}g | Lipides : ${fat}g

${todayMeals.length > 0 ? '\nREPAS DU JOUR :\n' + todayMeals.map(m => '- ' + (m.meal_type === 'breakfast' ? 'Petit-déjeuner' : m.meal_type === 'lunch' ? 'Déjeuner' : m.meal_type === 'dinner' ? 'Dîner' : m.meal_type === 'snack' ? 'Collation' : (m.meal_type || 'Repas')) + ' : ' + (m.name || '?') + ' (' + (m.calories || '?') + ' kcal, P:' + (m.protein || 0) + 'g G:' + (m.carbs || 0) + 'g L:' + (m.fat || 0) + 'g)').join('\n') : '\nREPAS DU JOUR : Aucun repas enregistré aujourd\'hui.'}
${todayActivitiesContext}

DONNÉES MÉDICALES :
- Médicaments en cours : ${activeMeds}
- Allergies connues : ${allergiesList}
- Prochaines analyses : ${upcomingAnalyses}
${abnormalResults ? '- Résultats anormaux récents : ' + abnormalResults : ''}
${diagList ? '- Diagnostics à surveiller : ' + diagList : ''}
${vaccineReminders ? '- Rappels vaccins à venir : ' + vaccineReminders : ''}
${vaccineOverdue || analysesOverdue ? 'ATTENTION — Rappels en retard : ' + [vaccineOverdue, analysesOverdue].filter(Boolean).join('; ') : ''}

${temporalContext}

PLATS DISPONIBLES DANS L'APP :
${mealsList}

INSTRUCTIONS DE RÉPONSE OBLIGATOIRES :
1. Tu es ALIXEN, coach santé IA chaleureux et bienveillant. Tu tutoies l'utilisateur.
2. IMPORTANT — CHOIX RAPIDES : À la fin de CHAQUE réponse, tu DOIS proposer 2 à 5 choix rapides pour que l'utilisateur puisse répondre en un clic. Utilise EXACTEMENT ce format sur des lignes séparées :
[CHOIX:1:Texte du premier choix]
[CHOIX:2:Texte du deuxième choix]
[CHOIX:3:Texte du troisième choix]
[CHOIX:PRÉCISER:Autre chose...]
Le dernier choix DOIT toujours être [CHOIX:PRÉCISER:Autre chose...] pour permettre la saisie libre.
3. Les choix doivent être pertinents et anticiper ce que l'utilisateur veut probablement demander ensuite.
4. Si l'utilisateur a des allergies, TOUJOURS les vérifier avant de recommander un plat ou un médicament.
5. Si l'utilisateur demande des infos sur un médicament qu'il prend, utilise les données ci-dessus.
6. Ne pose JAMAIS de diagnostic. Tu peux suggérer de consulter un médecin.
7. Sois proactif : si tu vois des résultats anormaux ou des analyses à venir, mentionne-les naturellement.
8. Garde tes réponses concises (max 150 mots avant les choix).
    `;
  };

  const fetchLoadingSteps = async (userMessage) => {
    try {
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/lixman-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _authTokenRef.current,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'loading_steps',
            userMessage: userMessage,
            userId: userId,
            userContext: buildUserContext(),
            lang: userLang,
          }),
        }
      );
      const data = await response.json();
      if (data.steps && Array.isArray(data.steps)) {
        setLoadingSteps(data.steps);
      }
    } catch (e) {
    }
  };

  const sendImageToAlixen = async (base64Data, fileName, mimeType) => {
    if (isLoading || isLocked) return;
    if (messages.length >= 24) return;

    const userText = 'Photo envoyée : ' + (fileName || 'Document');
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
      _isNew: true,
      _status: 'read',
      _hasAttachment: true,
    };

    setCardMessage(userText);
    setCardIsUser(true);
    setCardIsLoading(false);

    setMessages(prev => {
      if (prev.length >= 30) return prev;
      return [...prev, userMsg];
    });

    setLoadingSteps([]);
    fetchLoadingSteps('Analyse d\'image : ' + (fileName || 'photo'));

    if (chatDelayTimerRef.current) clearTimeout(chatDelayTimerRef.current);
    chatDelayTimerRef.current = setTimeout(async () => {
      setCardMessage(null);
      setCardIsUser(false);
      setCardIsLoading(true);
      setIsLoading(true);

      const botMsgId = (Date.now() + 1).toString();
      try {
        const context = buildUserContext();
        const textMessages = [...messages, userMsg]
          .map(m => ({ role: m.role, content: m.content }))
          .filter(m => m.content);

        const response = await fetch(
          SUPABASE_URL + '/functions/v1/lixman-chat',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + _authTokenRef.current,
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              messages: textMessages,
              userId: userId,
              userContext: context,
              lang: userLang,
              imageBase64: base64Data,
              mimeType: mimeType || 'image/jpeg',
              // === ALIXEN SUPER CONTEXT v1 ===
              ...(userLocation && { user_lat: userLocation.lat, user_lng: userLocation.lng }),
              ...(alixenContextRef.current && { alixen_context: alixenContextRef.current }),
            }),
          }
        );

        if (response.status === 402) {
          var gateData = await response.json();
          setEnergyGateData(gateData); setIsLoading(false); setCardIsLoading(false); return;
        }
        const data = await response.json();
        const replyText = data.message || data.error || '⚠️ ALIXEN est en mise à jour. Réessayez dans quelques instants.';

        const alixenParsed = parseAlixenResponse(replyText);
        const finalText = alixenParsed.cleanText;
        if (data.pending_action || alixenParsed.pendingAction) setPendingAction(data.pending_action || alixenParsed.pendingAction);

        setLoadingSteps([]);
        setCardIsLoading(false);
        setCardMessage(finalText);
        setCardIsUser(false);

        // Déclencher émotion si présente
        if (data.emotion) triggerEmotion(data.emotion);

        setMessages(prev => {
          if (prev.length >= 30) return prev;
          return [...prev, {
            id: botMsgId,
            role: 'assistant',
            content: finalText,
            timestamp: new Date(),
            _isNew: true,
            _status: 'read',
          }];
        });

        if (data.energy_remaining != null) updateEnergy(data.energy_remaining);
      } catch (error) {
        console.error('Erreur envoi image ALIXEN:', error);
        var errMsg = getAlixenErrorMessage(null, error);
        setLoadingSteps([]);
        setCardIsLoading(false);
        setCardMessage(errMsg);
        setCardIsUser(false);
        setCardIsError(true);
        setMessages(prev => {
          if (prev.length >= 30) return prev;
          return [...prev, {
            id: botMsgId,
            role: 'assistant',
            content: errMsg,
            timestamp: new Date(),
            _isNew: true,
            _status: 'read',
          }];
        });
      }
      setIsLoading(false);
    }, 800);
  };

  const handleQuickReply = (text) => {
    if (!text || isLoading || isLocked) return;

    const isConfirmation = text.toLowerCase().includes('sauvegarde') ||
                           text.toLowerCase().includes('oui') ||
                           text.toLowerCase().includes('confirme') ||
                           text.toLowerCase().includes('enregistre');

    if (isConfirmation && pendingAction) {
      executeAlixenAction(pendingAction);
      setPendingAction(null);
    }

    if (messages.length >= 24) {
      showMModal('info', 'Session complète', 'Tu as atteint 24 messages dans cette session. Ouvre une nouvelle discussion en cliquant sur + pour continuer.', { confirmText: 'Compris', onConfirm: closeMModal });
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      _isNew: true,
      _status: 'read',
    };

    setCardMessage(text);
    setCardIsUser(true);
    setCardIsLoading(false);

    setMessages(prev => {
      if (prev.length >= 30) return prev;
      return [...prev, userMsg];
    });

    setLoadingSteps([]);
    fetchLoadingSteps(text);

    if (chatDelayTimerRef.current) clearTimeout(chatDelayTimerRef.current);
    chatDelayTimerRef.current = setTimeout(async () => {
      setCardMessage(null);
      setCardIsUser(false);
      setCardIsLoading(true);
      setIsLoading(true);

      const botMsgId = (Date.now() + 1).toString();
      try {
        const context = buildUserContext();
        const allMessages = [...messages, userMsg]
          .map(m => ({ role: m.role, content: m.content }))
          .filter(m => m.content);

        const response = await fetch(
          SUPABASE_URL + '/functions/v1/lixman-chat',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + _authTokenRef.current,
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              messages: allMessages, userId: userId, userContext: context, lang: userLang,
              // === ALIXEN SUPER CONTEXT v1 ===
              ...(userLocation && { user_lat: userLocation.lat, user_lng: userLocation.lng }),
              ...(alixenContextRef.current && { alixen_context: alixenContextRef.current }),
            }),
          }
        );

        if (response.status === 402) {
          var gateData = await response.json();
          setEnergyGateData(gateData); setIsLoading(false); setCardIsLoading(false); return;
        }
        const data = await response.json();
        const replyText = data.message || data.error || '⚠️ ALIXEN est en mise à jour. Réessayez dans quelques instants.';

        const alixenParsed = parseAlixenResponse(replyText);
        const finalText = alixenParsed.cleanText;
        if (data.pending_action || alixenParsed.pendingAction) setPendingAction(data.pending_action || alixenParsed.pendingAction);

        setLoadingSteps([]);
        setCardIsLoading(false);
        setCardMessage(finalText);
        setCardIsUser(false);

        setMessages(prev => {
          if (prev.length >= 30) return prev;
          return [...prev, {
            id: botMsgId,
            role: 'assistant',
            content: finalText,
            timestamp: new Date(),
            _isNew: true,
            _status: 'read',
          }];
        });

        if (data.energy_remaining != null) updateEnergy(data.energy_remaining);
      } catch (error) {
        console.error('Erreur Quick Reply:', error);
        var errMsg = getAlixenErrorMessage(null, error);
        setLoadingSteps([]);
        setCardIsLoading(false);
        setCardMessage(errMsg);
        setCardIsUser(false);
        setCardIsError(true);
        setMessages(prev => {
          if (prev.length >= 30) return prev;
          return [...prev, {
            id: botMsgId,
            role: 'assistant',
            content: errMsg,
            timestamp: new Date(),
            _isNew: true,
            _status: 'read',
          }];
        });
      }
      setIsLoading(false);
    }, 800);
  };

  const executeAlixenAction = async (action) => {
    try {
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + _authTokenRef.current,
        'Content-Type': 'application/json',
      };
      var fmId = activeProfile === 'self' ? null : activeProfile;

      if (action.type === 'save_meal_plan') {
        const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/save_weekly_meal_plan', {
          method: 'POST', headers,
          body: JSON.stringify({
            p_user_id: userId,
            p_week_start: action.payload.week_start,
            p_meals: action.payload.meals,
          }),
        });
        const result = await res.json();
        if (result.success) {
          addBotMessage('Menu sauvegardé avec succès dans ta page Repas ! ✅\n\n' + (action.payload.meals.length) + ' jours ont été enregistrés.');
        }
      }

      if (action.type === 'update_weight') {
        await fetch(
          SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId,
          {
            method: 'PATCH', headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ weight: action.payload.weight }),
          }
        );
        setUserProfile(prev => prev ? { ...prev, weight: action.payload.weight } : prev);
        addBotMessage('Poids mis à jour : ' + action.payload.weight + ' kg ✅');
      }

      if (action.type === 'add_medication') {
        const startDate = new Date().toISOString().split('T')[0];
        const durationDays = action.payload.duration_days || 7;
        const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        await fetch(SUPABASE_URL + '/rest/v1/medications', {
          method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: userId,
            family_member_id: fmId,
            name: action.payload.name,
            dosage: action.payload.dosage,
            frequency: action.payload.frequency,
            duration: action.payload.duration,
            status: 'active',
            start_date: startDate,
            end_date: endDate,
            reminder_enabled: true,
            source: 'alixen',
          }),
        });
        // Schedule medication reminder (ALIXEN sets reminder_enabled: true)
        NotificationService.scheduleMedicationReminder({
          name: action.payload.name,
          dosage: action.payload.dosage,
          reminder_enabled: true,
          frequency_times: ['08:00'],
          id: null,
        }, userId);
        addBotMessage('Médicament ajouté : ' + action.payload.name + ' ✅\nRetrouve-le dans MediBook > Médicaments.');
      }

      if (action.type === 'add_diagnostic') {
        await fetch(SUPABASE_URL + '/rest/v1/diagnostics', {
          method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: userId,
            family_member_id: fmId,
            condition_name: action.payload.condition_name,
            severity: action.payload.severity || 'moderate',
            status: action.payload.status || 'active',
            diagnosed_date: action.payload.diagnosed_date || null,
            diagnosed_by: action.payload.diagnosed_by || null,
            notes: action.payload.notes || null,
            source: 'alixen',
          }),
        });
        addBotMessage('Diagnostic ajouté : ' + action.payload.condition_name + ' ✅\nRetrouve-le dans MediBook > Diagnostics.');
      }

      if (action.type === 'add_allergy') {
        await fetch(SUPABASE_URL + '/rest/v1/allergies', {
          method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: userId,
            family_member_id: fmId,
            allergen: action.payload.allergen,
            type: action.payload.type || 'autre',
            severity: action.payload.severity || 'moderate',
            reaction: action.payload.reaction || null,
          }),
        });
        console.log('[ALIXEN] ✅ Allergie ajoutée: ' + action.payload.allergen);
        loadMedicalData();
        addBotMessage('Allergie ajoutée : ' + action.payload.allergen + ' ✅\nRetrouve-la dans MediBook > Allergies.');
      }

      if (action.type === 'add_vaccination') {
        await fetch(SUPABASE_URL + '/rest/v1/vaccinations', {
          method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: userId,
            family_member_id: fmId,
            vaccine_name: action.payload.vaccine_name,
            administration_date: action.payload.date || new Date().toISOString().split('T')[0],
            dose_number: action.payload.dose_number || 1,
            next_due_date: action.payload.next_due_date || null,
            administered_by: action.payload.administered_by || null,
            batch_number: action.payload.batch_number || null,
            status: 'completed',
          }),
        });
        console.log('[ALIXEN] ✅ Vaccination ajoutée: ' + action.payload.vaccine_name);
        // Schedule vaccine reminder if next_due_date provided
        if (action.payload.next_due_date) {
          NotificationService.scheduleVaccineReminder({
            vaccine_name: action.payload.vaccine_name,
            next_due_date: action.payload.next_due_date,
            dose_number: action.payload.dose_number || 1,
          }, userId);
        }
        loadMedicalData();
        addBotMessage('Vaccination ajoutée : ' + action.payload.vaccine_name + ' ✅\nRetrouve-la dans MediBook > Carnet vaccinal.');
      }

      if (action.type === 'add_analysis') {
        await fetch(SUPABASE_URL + '/rest/v1/medical_analyses', {
          method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: userId,
            family_member_id: fmId,
            label: action.payload.label,
            value: 'À effectuer',
            status: 'unknown',
            is_scheduled: true,
            scheduled_date: action.payload.scheduled_date,
            reminder_enabled: true,
          }),
        });
        // Schedule analysis reminder
        if (action.payload.scheduled_date) {
          NotificationService.scheduleAnalysisReminder({
            label: action.payload.label,
            is_scheduled: true,
            scheduled_date: action.payload.scheduled_date,
            id: null,
          }, userId);
        }
        addBotMessage('Analyse planifiée : ' + action.payload.label + ' ✅\nRetrouve-la dans MediBook > Analyses.');
      }

      if (action.type === 'add_full_diagnosis') {
        var p = action.payload;
        var startDate = new Date().toISOString().split('T')[0];
        var insertCount = 0;

        // a) INSERT diagnostic
        if (p.diagnosis && p.diagnosis.condition_name) {
          await fetch(SUPABASE_URL + '/rest/v1/diagnostics', {
            method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              user_id: userId,
              family_member_id: fmId,
              condition_name: p.diagnosis.condition_name,
              severity: p.diagnosis.severity || 'moderate',
              status: p.diagnosis.status || 'active',
              diagnosed_date: p.diagnosis.diagnosed_date || null,
              diagnosed_by: p.diagnosis.diagnosed_by || null,
              notes: (p.dietary_notes ? 'Alimentation: ' + p.dietary_notes + '. ' : '') + (p.activity_notes ? 'Activité: ' + p.activity_notes : ''),
              source: 'alixen',
            }),
          });
          console.log('[ALIXEN] ✅ Diagnostic inséré: ' + p.diagnosis.condition_name);
          insertCount++;
        }

        // b) INSERT medications
        if (p.medications && p.medications.length > 0) {
          for (var mi = 0; mi < p.medications.length; mi++) {
            var med = p.medications[mi];
            var durationDays = parseInt(med.duration) || 7;
            var endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            await fetch(SUPABASE_URL + '/rest/v1/medications', {
              method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
              body: JSON.stringify({
                user_id: userId,
                family_member_id: fmId,
                name: med.name,
                dosage: med.dosage || null,
                frequency: med.frequency || null,
                duration: med.duration || null,
                status: 'active',
                start_date: startDate,
                end_date: endDate,
                reminder_enabled: true,
                source: 'alixen',
              }),
            });
            console.log('[ALIXEN] ✅ Médicament inséré: ' + med.name);
            // Schedule medication reminder
            NotificationService.scheduleMedicationReminder({
              name: med.name,
              dosage: med.dosage || null,
              reminder_enabled: true,
              frequency_times: ['08:00'],
              id: null,
            }, userId);
            insertCount++;
          }
        }

        // c) INSERT scheduled analyses
        if (p.analyses && p.analyses.length > 0) {
          for (var ai = 0; ai < p.analyses.length; ai++) {
            var an = p.analyses[ai];
            await fetch(SUPABASE_URL + '/rest/v1/medical_analyses', {
              method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
              body: JSON.stringify({
                user_id: userId,
                family_member_id: fmId,
                label: an.label,
                value: 'À effectuer',
                status: 'unknown',
                is_scheduled: true,
                scheduled_date: an.scheduled_date || null,
                reminder_enabled: true,
              }),
            });
            console.log('[ALIXEN] ✅ Analyse planifiée: ' + an.label);
            // Schedule analysis reminder
            if (an.scheduled_date) {
              NotificationService.scheduleAnalysisReminder({
                label: an.label,
                is_scheduled: true,
                scheduled_date: an.scheduled_date,
                id: null,
              }, userId);
            }
            insertCount++;
          }
        }

        loadMedicalData();
        addBotMessage('Diagnostic complet enregistré ✅\n\n' + insertCount + ' élément' + (insertCount > 1 ? 's' : '') + ' ajouté' + (insertCount > 1 ? 's' : '') + ' dans ton MediBook :\n' +
          (p.diagnosis ? '• Diagnostic : ' + p.diagnosis.condition_name + '\n' : '') +
          (p.medications && p.medications.length > 0 ? '• ' + p.medications.length + ' médicament' + (p.medications.length > 1 ? 's' : '') + '\n' : '') +
          (p.analyses && p.analyses.length > 0 ? '• ' + p.analyses.length + ' analyse' + (p.analyses.length > 1 ? 's' : '') + ' planifiée' + (p.analyses.length > 1 ? 's' : '') + '\n' : '') +
          '\nRetrouve tout dans MediBook > Mes données.');
      }

      if (action.type === 'navigate') {
        const target = action.payload.target;
        if (target === 'repas') setActiveTab('meals');
        else if (target === 'activity') setActiveTab('activity');
        else if (target === 'medibook') setCurrentSubPage('medibook');
        else if (target === 'analyses') { setCurrentSubPage('medibook'); setMediBookView('report'); setReportSection('analyses'); }
        else if (target === 'medications') { setCurrentSubPage('medibook'); setMediBookView('report'); setReportSection('medications'); }
      }

    } catch (error) {
      console.error('Erreur action ALIXEN:', error);
      addBotMessage('⚠️ Connexion interrompue. Vérifiez votre connexion internet et réessayez.');
    }
  };

  const handlePreciserPress = () => {
    preciserTimersRef.current.forEach(t => clearTimeout(t));
    preciserTimersRef.current = [];
    var pt1 = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 150);
    preciserTimersRef.current.push(pt1);
    var pt2 = setTimeout(() => {
      Keyboard.dismiss();
      var pt3 = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      preciserTimersRef.current.push(pt3);
    }, 300);
    preciserTimersRef.current.push(pt2);
  };

  // ── Gestion clic recette ─────────────────────────────────────────────────
  const handleRecipePress = (recipeName) => {
    setRecipeModal({ name: recipeName });
  };

  const confirmNavigateToRecipe = () => {
    const recipeName = recipeModal?.name;
    setRecipeModal(null);
    setActiveTab('repas');
  };

  // ── Modal message (balle pressée) — marque comme lu ──────────────────────
  const handleBallPress = (message, index) => {
    if (message._status === 'loading') return;
    setSelectedMessage({ ...message, index });
    if (message._status === 'unread') {
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, _status: 'read' } : m
      ));
    }
  };

  const closeModal = () => {
    setSelectedMessage(null);
  };

  // ── Strip ALIXEN formatting for plain text preview ────────────────────
  var stripAlixenFormatting = function(text) {
    if (!text) return '';
    var t = text;
    t = t.replace(/\[TITRE\]([\s\S]*?)\[\/TITRE\]/g, '$1');
    t = t.replace(/\[SECTION:[^\]]*\]([\s\S]*?)\[\/SECTION\]/g, '$1');
    t = t.replace(/\[ALERTE\]([\s\S]*?)\[\/ALERTE\]/g, '$1');
    t = t.replace(/\[INFO\]([\s\S]*?)\[\/INFO\]/g, '$1');
    t = t.replace(/\[SUCCESS\]([\s\S]*?)\[\/SUCCESS\]/g, '$1');
    t = t.replace(/\[PRIX\]([\s\S]*?)\[\/PRIX\]/g, '$1');
    t = t.replace(/\[CHOIX:[^\]]*\][^\n]*/g, '');
    t = t.replace(/\[ALIXEN_EMOTION:[^\]]*\]/g, '');
    t = t.replace(/\*\*(.*?)\*\*/g, '$1');
    t = t.replace(/\n{3,}/g, '\n\n');
    return t.trim();
  };

  // ── Recherche dans les messages ────────────────────────────────────────
  const toggleSearchModal = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery('');
      setSearchHits(new Set());
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchHits(new Set());
      return;
    }
    const hits = new Set();
    const low = text.toLowerCase();
    messages.forEach((m, i) => {
      if (m.content.toLowerCase().includes(low)) hits.add(i);
    });
    setSearchHits(hits);
    if (hits.size > 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // ── Envoi de message et appel IA ────────────────────────────────────────
  const sendMessage = async () => {
    const hasFiles = fileQueue.length > 0;
    const hasText = inputText.trim().length > 0;
    if ((!hasText && !hasFiles) || isLoading || isLocked) return;

    // Limite 24 bulles par session
    if (messages.length >= 24) {
      showMModal('info', 'Session complète', 'Tu as atteint 24 messages dans cette session. Ouvre une nouvelle discussion en cliquant sur + pour continuer.', { confirmText: 'Compris', onConfirm: closeMModal });
      return;
    }

    const filesToSend = [...fileQueue];
    setFileQueue([]);

    const userText = hasText ? inputText.trim() : (filesToSend.length > 0 ? filesToSend.length + ' fichier' + (filesToSend.length > 1 ? 's' : '') + ' envoyé' + (filesToSend.length > 1 ? 's' : '') : '');
    setInputText('');
    Keyboard.dismiss();

    // 1. Afficher le message user dans la carte — green flux visible
    setCardMessage(userText);
    setCardIsUser(true);
    setCardIsLoading(false);
    setIsLoading(true);

    // 2. Créer la boule user
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
      _isNew: true,
      _status: 'read',
      _hasAttachment: filesToSend.length > 0,
    };
    setMessages(prev => {
      if (prev.length >= 30) return prev;
      return [...prev, userMsg];
    });

    // 3. Lancer les loading steps en parallèle
    setLoadingSteps([]);
    fetchLoadingSteps(userText);

    // 4. Après 800ms, passer en mode chargement
    if (chatDelayTimerRef.current) clearTimeout(chatDelayTimerRef.current);
    chatDelayTimerRef.current = setTimeout(() => {
      setCardMessage(null);
      setCardIsUser(false);
      setCardIsLoading(true);
    }, 800);

    // 4. Appel à l'API
    const botMsgId = (Date.now() + 1).toString();
    try {
      const context = buildUserContext();
      const messagesToSend = [...messages, userMsg]
        .map(m => ({ role: m.role, content: m.content }))
        .filter(m => m.content);

      const response = await fetch(
        SUPABASE_URL + '/functions/v1/lixman-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _authTokenRef.current,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
              messages: messagesToSend,
              userId: userId,
              userContext: context,
              lang: userLang,
              imageBase64: filesToSend.length > 0 ? filesToSend[0].base64 : undefined,
              mimeType: filesToSend.length > 0 ? filesToSend[0].mimeType : undefined,
              // === ALIXEN SUPER CONTEXT v1 ===
              ...(userLocation && { user_lat: userLocation.lat, user_lng: userLocation.lng }),
              ...(alixenContextRef.current && { alixen_context: alixenContextRef.current }),
            }),
        }
      );

      if (response.status === 402) {
        var gateData = await response.json();
        setEnergyGateData(gateData); setIsLoading(false); setCardIsLoading(false); return;
      }
      const data = await response.json();
      const replyText = data.message || data.error || "Erreur de connexion.";

      const alixenParsed = parseAlixenResponse(replyText);
      const finalText = alixenParsed.cleanText;
      if (data.pending_action || alixenParsed.pendingAction) setPendingAction(data.pending_action || alixenParsed.pendingAction);

      // 5. Afficher la réponse IA dans la carte
      setLoadingSteps([]);
      setCardIsLoading(false);
      setCardMessage(finalText);
      setCardIsUser(false);

      // 5b. Déclencher émotion si présente
      if (data.emotion) triggerEmotion(data.emotion);

      // 6. Créer la boule IA
      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: finalText,
        timestamp: new Date(),
        _isNew: true,
        _status: 'read',
      };
      setMessages(prev => {
        if (prev.length >= 30) return prev;
        return [...prev, botMsg];
      });

      if (data.energy_remaining != null) updateEnergy(data.energy_remaining);

    } catch (error) {
      console.error('Erreur ALIXEN:', error);
      var errMsg = getAlixenErrorMessage(null, error);
      setLoadingSteps([]);
      setCardIsLoading(false);
      setCardMessage(errMsg);
      setCardIsUser(false);

      var botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: errMsg,
        timestamp: new Date(),
        _isNew: true,
        _status: 'read',
      };
      setMessages(prev => {
        if (prev.length >= 30) return prev;
        return [...prev, botMsg];
      });
    }
    setIsLoading(false);
  };

  // ── NOUVEAU PIPELINE SCAN MEDICAL ────────────────────────────────────
  const startMedicalScan = async (base64Data, fileName, context) => {
    // 1. Reset complet
    setScanResults(null);
    setScanSteps([]);
    setScanContext(context);
    setUploadState('scanning');
    setScanFileName(fileName || 'Document');

    // 2. Animation progressive des étapes
    const steps = [
      'Ouverture du document...',
      'Détection du type de document...',
      'Lecture du contenu...',
      'Envoi à ALIXEN pour analyse...',
      'Analyse des valeurs et références...',
      'Identification des points d\'attention...',
      'Traitement en cours...',
    ];

    // Lancer l'animation des étapes
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        setScanSteps(prev => [...prev, { text: steps[currentStep], done: true }]);
        currentStep++;
      }
    }, 1500);

    try {
      // 3. Appel à l'Edge Function scan-medical
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/scan-medical',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + _authTokenRef.current,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: 'image/jpeg',
            userId: '00000000-0000-0000-0000-000000000001',
            context: context || 'medibook',
            category: 'notes',
          }),
        }
      );

      clearInterval(stepInterval);

      if (response.status === 402) {
        var gateData = await response.json();
        setEnergyGateData(gateData);
        setUploadState(null);
        return;
      }

      if (!response.ok) {
        console.error('Erreur scan-medical:', response.status);
        throw { _status: response.status, message: getAlixenErrorMessage(response.status) };
      }

      const result = await response.json();

      // 4. Vérifier si le résultat contient une erreur
      if (result.error) {
        throw new Error(result.error);
      }

      // 5. Marquer toutes les étapes comme terminées
      setScanSteps(steps.map(text => ({ text, done: true })));

      // 6. Attendre un court instant pour que l'utilisateur voie les checkmarks
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 7. Afficher les résultats
      setScanResults(result);
      setUploadState('results');

    } catch (error) {
      clearInterval(stepInterval);
      console.error('Erreur scan médical:', error);
      setUploadState('idle');
      setScanResults(null);
      var scanErrMsg = error && error._status ? error.message : getAlixenErrorMessage(null, error);
      showMModal('error', 'Analyse impossible', scanErrMsg);
    }
  };

  const pickImage = async (context) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        const photo = result.assets[0];
        if (context === 'chat') {
          setFileQueue(prev => [...prev, {
            id: Date.now().toString(),
            type: 'image',
            uri: photo.uri,
            base64: photo.base64,
            name: 'Photo',
            mimeType: 'image/jpeg',
          }]);
        } else if (context === 'medibook' || context === 'carnet') {
          startMedicalScan(photo.base64, 'Photo importée', context);
        }
      }
    } catch (error) {
    }
  };

  const takePhoto = async (context) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        showMModal('error', 'Permission requise', 'Autorisez l\'accès à la caméra pour prendre des photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets[0]) {
        const photo = result.assets[0];
        if (context === 'chat') {
          setFileQueue(prev => [...prev, {
            id: Date.now().toString(),
            type: 'image',
            uri: photo.uri,
            base64: photo.base64,
            name: 'Photo',
            mimeType: 'image/jpeg',
          }]);
        } else if (context === 'medibook' || context === 'carnet') {
          startMedicalScan(photo.base64, 'Photo capturée', context);
        }
      }
    } catch (error) {
    }
  };

  var pickDocument = async function(context) {
    try {
      var result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      var file = result.assets[0];
      var fileSizeKb = (file.size || 0) / 1024;
      // Estimate pages: ~80KB per page (rough average for scanned PDFs)
      var estimatedPages = Math.max(1, Math.round(fileSizeKb / 80));

      if (estimatedPages > 10) {
        Alert.alert(
          'Document trop volumineux',
          'Ce document fait environ ' + estimatedPages + ' pages (taille : ' + Math.round(fileSizeKb) + ' Ko).\nMaximum 10 pages autorisées.\n\nConseil : Divisez votre PDF ou photographiez les pages importantes.',
          [{ text: 'Compris' }]
        );
        return;
      }

      var cost = estimatedPages <= 5 ? 50 : 80;
      Alert.alert(
        'Importer ce PDF ?',
        file.name + '\n~' + estimatedPages + ' page' + (estimatedPages > 1 ? 's' : '') + ' détectée' + (estimatedPages > 1 ? 's' : '') + '\nCoût : ' + cost + ' énergie',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Analyser', onPress: async function() {
            try {
              // Read file as base64 via fetch
              var fileResponse = await fetch(file.uri);
              var blob = await fileResponse.blob();
              var base64 = await new Promise(function(resolve, reject) {
                var reader = new FileReader();
                reader.onloadend = function() {
                  var b64 = reader.result;
                  if (b64 && b64.indexOf(',') !== -1) b64 = b64.split(',')[1];
                  resolve(b64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
              if (!base64) { showMModal('error', 'Erreur', 'Impossible de lire le fichier.'); return; }
              startMedicalScan(base64, file.name || 'Document PDF', context || 'medibook');
            } catch (readErr) {
              console.warn('Erreur lecture PDF:', readErr);
              showMModal('error', 'Erreur', 'Impossible de lire ce fichier PDF.');
            }
          }},
        ]
      );
    } catch (error) {
      console.warn('Erreur DocumentPicker:', error);
    }
  };

  // ── BATCH PHOTO PICKER ──────────────────────────────────────────────────
  var pickMultiplePhotos = async function() {
    try {
      var result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        base64: true,
        selectionLimit: 10,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        var photos = result.assets.slice(0, 10).map(function(asset, i) {
          return { id: Date.now() + '-' + i, uri: asset.uri, base64: asset.base64 };
        });
        setBatchPhotos(photos);
        setShowBatchPreview(true);
      }
    } catch (error) {
      console.warn('Erreur sélection multiple:', error);
    }
  };

  var removeBatchPhoto = function(photoId) {
    setBatchPhotos(function(prev) { return prev.filter(function(p) { return p.id !== photoId; }); });
  };

  var getBatchEnergyCost = function(count) { return count <= 5 ? 50 : 80; };

  var generateBatchId = function() {
    var s4 = function() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };

  var mergeScanResults = function(results) {
    var merged = { data: [], medications: [], vaccinations: [], allergies: [], diagnostics: [], alerts: [], summary: '', documentType: 'Batch', date: null };
    var seen = {};
    results.forEach(function(r) {
      if (!r) return;
      if (r.date && !merged.date) merged.date = r.date;
      if (r.summary) merged.summary += (merged.summary ? '\n' : '') + r.summary;
      if (r.documentType && r.documentType !== 'Document') merged.documentType = r.documentType;
      (r.data || []).forEach(function(d) {
        var key = 'a:' + (d.label || '');
        if (!seen[key]) { seen[key] = true; merged.data.push(d); }
      });
      (r.medications || []).forEach(function(m) {
        var key = 'm:' + (m.name || '').toLowerCase();
        if (!seen[key]) { seen[key] = true; merged.medications.push(m); }
        else {
          var idx = merged.medications.findIndex(function(x) { return (x.name || '').toLowerCase() === (m.name || '').toLowerCase(); });
          if (idx >= 0 && m.dosage && !merged.medications[idx].dosage) merged.medications[idx] = m;
        }
      });
      (r.vaccinations || []).forEach(function(v) {
        var key = 'v:' + (v.name || '').toLowerCase();
        if (!seen[key]) { seen[key] = true; merged.vaccinations.push(v); }
      });
      (r.allergies || []).forEach(function(a) {
        var key = 'al:' + (a.allergen || '').toLowerCase();
        if (!seen[key]) { seen[key] = true; merged.allergies.push(a); }
      });
      (r.diagnostics || []).forEach(function(d) {
        var key = 'd:' + (d.condition_name || '').toLowerCase();
        if (!seen[key]) { seen[key] = true; merged.diagnostics.push(d); }
      });
      (r.alerts || []).forEach(function(al) { merged.alerts.push(al); });
    });
    return merged;
  };

  var startBatchScan = async function(photos, context) {
    if (!photos || photos.length === 0) return;
    var totalPhotos = photos.length;
    var cost = getBatchEnergyCost(totalPhotos);
    var bid = generateBatchId();
    setBatchIdState(bid);
    setScanResults(null);
    setScanSteps([]);
    setScanContext(context || 'medibook');
    setScanFileName('Batch de ' + totalPhotos + ' photos');
    setUploadState('scanning');
    setBatchProgress('Préparation du batch...');

    // Split into sub-batches of max 5
    var subBatches = [];
    for (var i = 0; i < photos.length; i += 5) {
      subBatches.push(photos.slice(i, i + 5));
    }

    // Steps animation
    var steps = [];
    for (var sb = 0; sb < subBatches.length; sb++) {
      steps.push('Lot ' + (sb + 1) + '/' + subBatches.length + ' — envoi de ' + subBatches[sb].length + ' photo' + (subBatches[sb].length > 1 ? 's' : '') + '...');
      steps.push('Lot ' + (sb + 1) + '/' + subBatches.length + ' — analyse en cours...');
    }
    steps.push('Fusion des résultats...');
    steps.push('Dédoublonnage...');

    var stepIdx = 0;
    var addStep = function(text) {
      setScanSteps(function(prev) { return prev.concat([{ text: text, done: true }]); });
    };

    try {
      var allResults = [];

      for (var bi = 0; bi < subBatches.length; bi++) {
        var batch = subBatches[bi];
        setBatchProgress('Lot ' + (bi + 1) + '/' + subBatches.length + ' en cours...');
        addStep(steps[stepIdx]); stepIdx++;

        // Build images array for this sub-batch
        var imagesBase64 = batch.map(function(p) { return p.base64; });

        var response = await fetch(
          SUPABASE_URL + '/functions/v1/scan-medical',
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + _authTokenRef.current,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64: imagesBase64[0],
              images_base64: imagesBase64,
              mimeType: 'image/jpeg',
              userId: userId || '00000000-0000-0000-0000-000000000001',
              context: context || 'medibook',
              category: 'notes',
              batch_id: bid,
              batch_index: bi,
              batch_total: subBatches.length,
              energy_cost: bi === 0 ? cost : 0,
              feature: 'medic',
            }),
          }
        );

        if (response.status === 402) {
          var gateData = await response.json();
          setEnergyGateData(gateData);
          setUploadState('idle');
          setBatchProgress('');
          return;
        }

        if (!response.ok) {
          var errorText = await response.text();
          throw new Error('Erreur lot ' + (bi + 1) + ': ' + response.status);
        }

        var result = await response.json();
        if (result.error) throw new Error(result.error);
        allResults.push(result);
        addStep(steps[stepIdx]); stepIdx++;
      }

      // Merge all results
      setBatchProgress('Fusion des résultats...');
      addStep(steps[stepIdx]); stepIdx++;
      var merged = mergeScanResults(allResults);
      merged._batchId = bid;
      merged._batchPhotoCount = totalPhotos;
      merged._energyCost = cost;

      // Dedup step
      addStep(steps[stepIdx]); stepIdx++;

      await new Promise(function(resolve) { setTimeout(resolve, 800); });

      setScanResults(merged);
      setUploadState('results');
      setBatchProgress('');
      setBatchPhotos([]);

    } catch (error) {
      console.error('Erreur batch scan:', error);
      setUploadState('idle');
      setBatchProgress('');
      setScanResults(null);
      var batchErrMsg = error && error._status ? error.message : getAlixenErrorMessage(null, error);
      showMModal('error', 'Analyse impossible', batchErrMsg);
    }
  };

  // ── TRANSFERT VERS SECRET POCKET ──────────────────────────────────────
  const toggleMedicationReminder = async (medicationId, currentValue) => {
    try {
      const newValue = !currentValue;
      await fetch(
        SUPABASE_URL + '/rest/v1/medications?id=eq.' + medicationId,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + _authTokenRef.current,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ reminder_enabled: newValue }),
        }
      );
      // Mettre à jour localement
      setMedicalData(prev => ({
        ...prev,
        medications: prev.medications.map(m =>
          m.id === medicationId ? { ...m, reminder_enabled: newValue } : m
        ),
      }));
      // Schedule or cancel notifications
      if (newValue) {
        var med = medicalData.medications.find(function(m) { return m.id === medicationId; });
        if (med) NotificationService.scheduleMedicationReminder(Object.assign({}, med, { reminder_enabled: true }), userId);
      } else {
        NotificationService.cancelAllReminders(medicationId, userId);
      }
    } catch (error) {
      console.error('Erreur toggle rappel:', error);
    }
  };

  const toggleMedicationTaken = async (medicationId, timeIndex, currentTakenHistory, freqTimes) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const time = freqTimes[timeIndex];
      let history = Array.isArray(currentTakenHistory) ? [...currentTakenHistory] : [];

      // Vérifier si déjà pris à cette heure aujourd'hui
      const existingIndex = history.findIndex(h => h.date === today && h.time === time);
      if (existingIndex >= 0) {
        // Retirer (toggle off)
        history.splice(existingIndex, 1);
      } else {
        // Ajouter (toggle on)
        history.push({ date: today, time: time, taken: true, taken_at: new Date().toISOString() });
      }

      // Calculer si toutes les prises du jour sont faites
      const todayTaken = history.filter(h => h.date === today).length;
      const allTakenToday = todayTaken >= freqTimes.length;

      await fetch(
        SUPABASE_URL + '/rest/v1/medications?id=eq.' + medicationId,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + _authTokenRef.current,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            taken_history: history,
            taken_today: allTakenToday,
          }),
        }
      );

      // Mettre à jour localement
      setMedicalData(prev => ({
        ...prev,
        medications: prev.medications.map(m =>
          m.id === medicationId ? { ...m, taken_history: history, taken_today: allTakenToday } : m
        ),
      }));
    } catch (error) {
      console.error('Erreur toggle prise:', error);
    }
  };

  const isTakenAtTime = (takenHistory, time) => {
    if (!Array.isArray(takenHistory)) return false;
    const today = new Date().toISOString().split('T')[0];
    return takenHistory.some(h => h.date === today && h.time === time);
  };

  const archiveMedication = async (medicationId, medicationName) => {
    showMModal('confirm', 'Archiver ce médicament ?', '"' + medicationName + '" sera déplacé dans vos médicaments archivés. Vous pourrez toujours le consulter.', {
      confirmText: 'Archiver',
      onConfirm: async function() {
        closeMModal();
        try {
          await fetch(SUPABASE_URL + '/rest/v1/medications?id=eq.' + medicationId, {
            method: 'PATCH',
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status: 'completed' }),
          });
          loadMedicalData();
        } catch (error) {
          console.error('Erreur archivage:', error);
          showMModal('error', 'Archivage échoué', '⚠️ Connexion interrompue. Vérifiez votre connexion internet et réessayez.');
        }
      },
    });
  };

  const searchMedications = async (query) => {
    setMedSearchQuery(query);
    if (query.length < 2) {
      setMedSearchResults([]);
      return;
    }
    try {
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/rpc/search_medications_db',
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + _authTokenRef.current,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ search_term: query, max_results: 8 }),
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setMedSearchResults(data);
      }
    } catch (error) {
      console.error('Erreur recherche médicament:', error);
    }
  };

  const selectMedFromDb = (med) => {
    setSelectedMedFromDb(med);
    setNewMedDosageValue(med.common_dosages && med.common_dosages.length > 0 ? med.common_dosages[0].replace(/[^0-9.]/g, '') : '500');
    setNewMedDosageUnit(med.common_dosages && med.common_dosages.length > 0 ? med.common_dosages[0].replace(/[0-9.]/g, '') || 'mg' : 'mg');
    setNewMedFrequency(med.common_frequencies && med.common_frequencies.length > 0 ? parseInt(med.common_frequencies[0]) || 2 : 2);
    setNewMedDuration(med.common_durations && med.common_durations.length > 0 ? med.common_durations[0] : '7 jours');
    setAddMedStep('dosage');
  };

  const confirmAddMedication = async () => {
    if (!selectedMedFromDb) return;
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const durationDays = parseDurationToDays(newMedDuration);
      const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const defaultTimes = {
        1: ['08:00'],
        2: ['08:00', '20:00'],
        3: ['08:00', '14:00', '20:00'],
        4: ['08:00', '12:00', '16:00', '20:00'],
      };

      await fetch(SUPABASE_URL + '/rest/v1/medications', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + _authTokenRef.current,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: userId,
          family_member_id: activeProfile === 'self' ? null : activeProfile,
          name: selectedMedFromDb.name,
          dosage: newMedDosageValue + ' ' + newMedDosageUnit,
          frequency: newMedFrequency + 'x/jour',
          duration: newMedDuration,
          status: 'active',
          start_date: startDate,
          end_date: endDate,
          dosage_value: parseFloat(newMedDosageValue) || 0,
          dosage_unit: newMedDosageUnit,
          frequency_per_day: newMedFrequency,
          frequency_times: defaultTimes[newMedFrequency] || ['08:00'],
          reminder_enabled: newMedReminder,
          taken_today: false,
          source: 'manual',
          medication_db_id: (selectedMedFromDb.id && !String(selectedMedFromDb.id).startsWith('ai-')) ? selectedMedFromDb.id : null,
        }),
      });

      // Schedule medication reminder if enabled
      if (newMedReminder) {
        NotificationService.scheduleMedicationReminder({
          name: selectedMedFromDb.name,
          dosage: newMedDosageValue + ' ' + newMedDosageUnit,
          reminder_enabled: true,
          frequency_times: defaultTimes[newMedFrequency] || ['08:00'],
          id: null,
        }, userId);
      }

      // Fermer et reset
      setShowAddMedSheet(false);
      setAddMedStep('search');
      setMedSearchQuery('');
      setMedSearchResults([]);
      setSelectedMedFromDb(null);

      // Recharger les données
      await loadMedicalData();

      showMModal('success', 'Médicament ajouté ✓', selectedMedFromDb.name + ' ' + newMedDosageValue + ' ' + newMedDosageUnit + ' a été ajouté à vos traitements en cours.');
    } catch (error) {
      console.error('Erreur ajout médicament:', error);
      showMModal('error', 'Ajout échoué', '⚠️ Connexion interrompue. Vérifiez votre connexion internet et réessayez.');
    }
  };

  const parseDurationToDays = (duration) => {
    if (!duration) return 7;
    const lower = duration.toLowerCase();
    if (lower.includes('continu')) return 365;
    const numMatch = lower.match(/(\d+)/);
    const num = numMatch ? parseInt(numMatch[1]) : 7;
    if (lower.includes('mois')) return num * 30;
    if (lower.includes('semaine')) return num * 7;
    return num;
  };

  const searchMedicationAI = async (query) => {
    try {
      showMModal('confirm', 'Recherche IA — 50 Lix', 'ALIXEN va chercher "' + query + '" dans sa base de connaissances médicales.\n\nCoût : 50 Lix', {
        confirmText: 'Rechercher', cancelText: 'Annuler',
        onClose: function() { closeMModal(); setMedSearchResults([]); },
        onConfirm: async function() {
          closeMModal();
          try {
            setMedSearchResults([{ _loading: true, name: 'Recherche en cours...', id: 'loading' }]);

                const response = await fetch(
                  SUPABASE_URL + '/functions/v1/search-medication',
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': 'Bearer ' + _authTokenRef.current,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      query: query,
                      userId: userId,
                    }),
                  }
                );

                const result = await response.json();

                if (result.found && result.medication) {
                  // Convertir au format attendu par la liste
                  const med = {
                    id: 'ai-' + Date.now(),
                    name: result.medication.name,
                    brand_names: result.medication.brand_names || [],
                    active_ingredient: result.medication.active_ingredient || '',
                    category: result.medication.category || '',
                    common_dosages: result.medication.common_dosages || [],
                    common_frequencies: result.medication.common_frequencies || [],
                    common_durations: result.medication.common_durations || [],
                    form: result.medication.form || 'Comprimé',
                    warnings: result.medication.warnings || '',
                    interactions: result.medication.interactions || [],
                    _fromAI: true,
                  };
                  setMedSearchResults([med]);
                } else {
                  setMedSearchResults([]);
                  showMModal('info', 'Non trouvé', result.suggestion || 'ALIXEN n\'a pas trouvé ce médicament. Vérifiez l\'orthographe et réessayez.');
                }
              } catch (error) {
                console.error('Erreur recherche IA:', error);
                setMedSearchResults([]);
                showMModal('error', 'Recherche impossible', '⚠️ Connexion interrompue. Vérifiez votre connexion internet et réessayez.');
              }
        },
      });
    } catch (error) {
      console.error('Erreur searchMedicationAI:', error);
    }
  };

  const confirmAddAnalysis = async () => {
    if (!newAnalysisLabel.trim()) {
      showMModal('info', 'Champ requis', 'Veuillez entrer le type d\'analyse.');
      return;
    }
    if (!newAnalysisDate.trim()) {
      showMModal('info', 'Champ requis', 'Veuillez entrer la date prévue (format : JJ/MM/AAAA).');
      return;
    }

    try {
      // Parser la date JJ/MM/AAAA
      const dateParts = newAnalysisDate.split('/');
      let scheduledDate = null;
      if (dateParts.length === 3) {
        scheduledDate = dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0];
      } else {
        // Essayer format AAAA-MM-JJ directement
        scheduledDate = newAnalysisDate;
      }

      await fetch(SUPABASE_URL + '/rest/v1/medical_analyses', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + _authTokenRef.current,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: userId,
          family_member_id: activeProfile === 'self' ? null : activeProfile,
          label: newAnalysisLabel.trim(),
          value: 'À effectuer',
          status: 'unknown',
          is_scheduled: true,
          scheduled_date: scheduledDate,
          reminder_enabled: true,
          prescribed_by: newAnalysisDoctor.trim() || null,
          laboratory: newAnalysisLab.trim() || null,
          notes: newAnalysisNotes.trim() || null,
        }),
      });

      setShowAddAnalysisSheet(false);
      setNewAnalysisLabel('');
      setNewAnalysisDate('');
      setNewAnalysisDoctor('');
      setNewAnalysisLab('');
      setNewAnalysisNotes('');

      await loadMedicalData();

      showMModal('success', 'Analyse planifiée ✓', newAnalysisLabel.trim() + ' a été ajoutée à vos analyses à venir.');
    } catch (error) {
      console.error('Erreur ajout analyse:', error);
      showMModal('error', 'Erreur', 'L\'ajout a échoué. Réessayez.');
    }
  };

  // ── DIAGNOSTIC — Recherche DB + sélection + confirmation ──────────────
  var searchDiseases = async function(query) {
    setDiagSearchQuery(query);
    if (query.length < 2) { setDiagSearchResults([]); return; }
    try {
      var res = await fetch(
        SUPABASE_URL + '/rest/v1/rpc/search_diseases_db',
        {
          method: 'POST',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current, 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_query: query, p_limit: 8 }),
        }
      );
      var data = await res.json();
      if (Array.isArray(data)) setDiagSearchResults(data);
    } catch (error) {
      console.error('Erreur recherche maladie:', error);
    }
  };

  var selectDiagFromDb = function(disease) {
    setSelectedDiagFromDb(disease);
    setNewDiagStatus(disease.is_chronic ? 'chronic' : 'active');
    setAddDiagStep('details');
  };

  var confirmAddDiagnostic = async function() {
    if (!selectedDiagFromDb) return;
    try {
      var diagDate = null;
      if (newDiagDate.trim()) {
        var parts = newDiagDate.split('/');
        diagDate = parts.length === 3 ? parts[2] + '-' + parts[1] + '-' + parts[0] : newDiagDate;
      }
      await fetch(SUPABASE_URL + '/rest/v1/diagnostics', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          user_id: userId,
          family_member_id: activeProfile === 'self' ? null : activeProfile,
          condition_name: selectedDiagFromDb.name_fr,
          icd_code: selectedDiagFromDb.icd_code || null,
          severity: newDiagSeverity,
          diagnosed_date: diagDate,
          diagnosed_by: newDiagDoctor.trim() || null,
          status: newDiagStatus,
          notes: newDiagNotes.trim() || null,
          disease_db_id: selectedDiagFromDb.id || null,
          source: selectedDiagFromDb.source === 'ai' ? 'ai' : 'manual',
        }),
      });
      setShowAddDiagSheet(false);
      setAddDiagStep('search'); setDiagSearchQuery(''); setDiagSearchResults([]); setSelectedDiagFromDb(null);
      setNewDiagSeverity('moderate'); setNewDiagDate(''); setNewDiagDoctor(''); setNewDiagStatus('active'); setNewDiagNotes('');
      await loadMedicalData();
      showMModal('success', 'Diagnostic ajouté ✓', selectedDiagFromDb.name_fr + ' a été ajouté à vos diagnostics.');
    } catch (error) {
      console.error('Erreur ajout diagnostic:', error);
      showMModal('error', 'Erreur', 'L\'ajout a échoué. Réessayez.');
    }
  };

  var confirmAddAllergy = async function() {
    if (!newAllergyAllergen.trim()) { showMModal('info', 'Champ requis', 'Veuillez entrer la substance allergène.'); return; }
    try {
      await fetch(SUPABASE_URL + '/rest/v1/allergies', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          user_id: userId,
          family_member_id: activeProfile === 'self' ? null : activeProfile,
          allergen: newAllergyAllergen.trim(),
          type: newAllergyType,
          severity: newAllergySeverity,
          reaction: newAllergyReaction.trim() || null,
          source: 'manual',
        }),
      });
      setShowAddAllergySheet(false);
      setNewAllergyAllergen(''); setNewAllergyType('alimentaire'); setNewAllergySeverity('moderate'); setNewAllergyReaction('');
      await loadMedicalData();
      showMModal('success', 'Allergie ajoutée ✓', newAllergyAllergen.trim() + ' a été ajoutée à vos allergies.');
    } catch (error) {
      console.error('Erreur ajout allergie:', error);
      showMModal('error', 'Erreur', 'L\'ajout a échoué. Réessayez.');
    }
  };

  // ── VACCINE CALENDAR DASHBOARD ──────────────────────────────────────────
  var loadVaccineSchedule = function() {
    if (!userId) return;
    setVaccCalendarLoading(true);
    var memberId = activeProfile !== 'self' ? activeProfile : null;
    var headers = { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current };
    Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/rpc/get_personalized_vaccine_schedule_by_user', {
        method: 'POST', headers: headers,
        body: JSON.stringify({ p_user_id: userId, p_family_member_id: memberId }),
      }).then(function(r) { return r.ok ? r.json() : []; }).catch(function() { return []; }),
      fetch(SUPABASE_URL + '/rest/v1/rpc/get_vaccine_completion_stats_by_user', {
        method: 'POST', headers: headers,
        body: JSON.stringify({ p_user_id: userId, p_family_member_id: memberId, p_priority_filter: null }),
      }).then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    ]).then(function(results) {
      if (Array.isArray(results[0])) setVaccSchedule(results[0]);
      if (results[1]) {
        var stats = Array.isArray(results[1]) ? results[1][0] : results[1];
        if (stats) setVaccStats(stats);
      }
      setVaccCalendarLoading(false);
    }).catch(function() { setVaccCalendarLoading(false); });
  };

  var getOverdueText = function(nextDueDate) {
    if (!nextDueDate) return '';
    var due = new Date(nextDueDate);
    var now = new Date();
    var diffMs = now - due;
    if (diffMs <= 0) return '';
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return diffDays + ' jour' + (diffDays > 1 ? 's' : '');
    var diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return diffMonths + ' mois';
    var diffYears = Math.floor(diffMonths / 12);
    return diffYears + ' an' + (diffYears > 1 ? 's' : '');
  };

  var openAddVaccFromCalendar = function(vaccine) {
    selectVaccineFromDb(vaccine);
    var nextDose = (vaccine.doses_done || 0) + 1;
    if (nextDose > (vaccine.total_doses || 1)) nextDose = vaccine.total_doses || 1;
    setNewVaccDose(nextDose);
    setShowAddVaccSheet(true);
  };

  // ── VACCINE SEARCH + AUTO-REMINDER ─────────────────────────────────────
  var searchVaccinesDb = function(query) {
    if (!query || query.length < 2) { setVaccSearchResults([]); return; }
    fetch(SUPABASE_URL + '/rest/v1/rpc/search_vaccines_db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current },
      body: JSON.stringify({ search_query: query, max_results: 8 }),
    }).then(function(res) { return res.json(); })
      .then(function(data) { if (Array.isArray(data)) setVaccSearchResults(data); })
      .catch(function() { setVaccSearchResults([]); });
  };

  var selectVaccineFromDb = function(vaccine) {
    if (!vaccine) {
      setSelectedVaccineFromDb(null); setNewVaccName(''); setVaccSearchResults([]);
      setVaccReminderNote(''); setVaccReminderAutoFilled(false); setNewVaccNextDue('');
      return;
    }
    setSelectedVaccineFromDb(vaccine);
    setNewVaccName(vaccine.name);
    setVaccSearchResults([]);
    setVaccReminderNote(''); setVaccReminderAutoFilled(false); setNewVaccNextDue('');
    tryFetchVaccReminder(vaccine, newVaccDose, newVaccDate);
  };

  var fetchVaccineReminder = function(vaccineId, doseNumber, adminDate) {
    if (!vaccineId || !doseNumber || !adminDate) return;
    fetch(SUPABASE_URL + '/rest/v1/rpc/get_vaccine_reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current },
      body: JSON.stringify({ p_vaccine_id: vaccineId, p_dose_number: doseNumber, p_administration_date: adminDate }),
    }).then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.next_reminder_date) {
          setNewVaccNextDue(data.next_reminder_date);
          setVaccReminderNote(data.reminder_note || '');
          setVaccReminderAutoFilled(true);
        } else if (data && data.reminder_type === 'none') {
          setVaccReminderNote(data.reminder_note || 'Aucun rappel nécessaire');
          setVaccReminderAutoFilled(false); setNewVaccNextDue('');
        }
      })
      .catch(function() {});
  };

  var tryFetchVaccReminder = function(vaccine, dose, date) {
    var v = vaccine || selectedVaccineFromDb;
    if (v && v.id && dose && date) fetchVaccineReminder(v.id, dose, date);
  };

  var confirmAddVaccination = async function() {
    if (!newVaccName.trim()) { showMModal('info', 'Champ requis', 'Veuillez entrer le nom du vaccin.'); return; }
    try {
      var vaccDate = null;
      if (newVaccDate.trim()) {
        var parts = newVaccDate.split('/');
        vaccDate = parts.length === 3 ? parts[2] + '-' + parts[1] + '-' + parts[0] : newVaccDate;
      }
      var nextDue = null;
      if (newVaccNextDue.trim()) {
        var ndParts = newVaccNextDue.split('/');
        nextDue = ndParts.length === 3 ? ndParts[2] + '-' + ndParts[1] + '-' + ndParts[0] : newVaccNextDue;
      }
      var vaccBody = {
          user_id: userId,
          family_member_id: activeProfile === 'self' ? null : activeProfile,
          vaccine_name: newVaccName.trim(),
          administration_date: vaccDate || new Date().toISOString().split('T')[0],
          dose_number: newVaccDose,
          next_due_date: nextDue,
          administered_by: newVaccDoctor.trim() || null,
          batch_number: newVaccBatch.trim() || null,
          vaccine_master_id: selectedVaccineFromDb ? selectedVaccineFromDb.id : null,
          status: 'completed',
          source: 'manual',
      };
      console.log('[Vacc INSERT] body:', JSON.stringify(vaccBody));
      var vaccRes = await fetch(SUPABASE_URL + '/rest/v1/vaccinations', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + _authTokenRef.current, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify(vaccBody),
      });
      var vaccResBody = await vaccRes.text();
      console.log('[Vacc INSERT] status:', vaccRes.status, 'response:', vaccResBody);
      // Schedule vaccine reminder if next_due_date provided
      if (nextDue) {
        NotificationService.scheduleVaccineReminder({
          vaccine_name: newVaccName.trim(),
          next_due_date: nextDue,
          dose_number: newVaccDose,
        }, userId);
      }
      setShowAddVaccSheet(false);
      setNewVaccName(''); setNewVaccDate(''); setNewVaccDose(1); setNewVaccNextDue(''); setNewVaccDoctor(''); setNewVaccBatch('');
      setSelectedVaccineFromDb(null); setVaccSearchResults([]); setVaccReminderNote(''); setVaccReminderAutoFilled(false);
      await loadMedicalData();
      loadVaccineSchedule();
      showMModal('success', 'Vaccin ajouté ✓', newVaccName.trim() + ' a été ajouté à votre carnet vaccinal.');
    } catch (error) {
      console.error('Erreur ajout vaccination:', error);
      showMModal('error', 'Erreur', 'L\'ajout a échoué. Réessayez.');
    }
  };

  const handleTransferToSecretPocket = (tableName, rowIndex, rowData) => {
    const itemName = typeof rowData[0] === 'object' ? rowData[0].text : rowData[0];

    showMModal('confirm', 'Transférer vers Secret Pocket', '"' + itemName + '" sera déplacé dans votre coffre-fort sécurisé et supprimé de MediBook.\n\nContinuer ?', {
      confirmText: 'Transférer',
      onConfirm: async function() {
        closeMModal();
        try {
          var sourceArray;
          var itemId;
          if (tableName === 'analyses') { sourceArray = medicalData.analyses; itemId = sourceArray[rowIndex]?.id; }
          else if (tableName === 'medications') { sourceArray = medicalData.medications; itemId = sourceArray[rowIndex]?.id; }
          else if (tableName === 'allergies') { sourceArray = medicalData.allergies; itemId = sourceArray[rowIndex]?.id; }
          else if (tableName === 'vaccinations') { sourceArray = medicalData.vaccinations; itemId = sourceArray[rowIndex]?.id; }

          if (!itemId) { showMModal('success', 'Transféré ✓', '"' + itemName + '" a été déplacé dans votre Secret Pocket.'); return; }

          setMedicalData(function(prev) { var updated = Object.assign({}, prev); updated[tableName] = prev[tableName].filter(function(_, i) { return i !== rowIndex; }); return updated; });
          showMModal('success', 'Transféré ✓', '"' + itemName + '" a été déplacé dans votre Secret Pocket.');
        } catch (error) {
          console.error('Erreur transfert:', error);
          showMModal('error', 'Erreur', 'Le transfert a échoué.');
        }
      },
    }
    );
  };

  // ── MEDICAL SHARE — Generate QR code token for doctors ──
  var generateMedicalShare = async function() {
    if (shareLoading) return;
    setShareLoading(true);
    setShareError(null);
    try {
      var { data, error } = await supabase.rpc('create_medical_share', { p_duration_minutes: 30 });
      if (error) throw error;
      if (data && data.length > 0 && data[0].share_token) {
        setShareToken(data[0].share_token);
        setShareExpiry(new Date(Date.now() + 30 * 60 * 1000));
      } else if (data && data.share_token) {
        setShareToken(data.share_token);
        setShareExpiry(new Date(Date.now() + 30 * 60 * 1000));
      } else {
        throw new Error('Aucun token reçu');
      }
    } catch (err) {
      console.error('[MedicalShare] Erreur:', err);
      setShareError('Impossible de générer le lien de partage. Réessayez.');
    } finally {
      setShareLoading(false);
    }
  };

  // ── HOISTED useCallbacks (must run on every render to keep hook count constant) ──
  var cbNewSession = useCallback(function() { setShowNewSessionSheet(true); }, []);
  var cbRemoveFile = useCallback(function(id) { setFileQueue(function(prev) { return prev.filter(function(f) { return f.id !== id; }); }); }, []);
  var cbOpenDocSheet = useCallback(function() { setShowDocumentSheet(true); }, []);
  var cbToggleSearch = useCallback(function() { setSearchVisible(function(v) { return !v; }); }, []);
  var cbOpenRecharge = useCallback(function() { setShowRechargeSheet(true); }, []);
  var cbSendMessage = useCallback(function() { if (inputText.trim() || fileQueue.length > 0) sendMessage(); }, [inputText, fileQueue, sendMessage]);

  // ── RENDER CONTENT (conditionnel — keys forcent React à remonter les composants) ──
  var renderContent = function() {
    if (currentSubPage === 'medibook' || uploadState === 'scanning' || uploadState === 'results' || uploadState === 'integrating') {
      return (
        <View key="medibook-wrapper" style={{ flex: 1 }}>
        <MediBookContent
          mediBookView={mediBookView} setMediBookView={setMediBookView}
          reportSection={reportSection} setReportSection={setReportSection}
          setCurrentSubPage={setCurrentSubPage}
          medicalData={medicalData} medicalDataLoading={medicalDataLoading}
          nutritionWeekData={nutritionWeekData} userProfile={userProfile}
          uploadState={uploadState} setUploadState={setUploadState}
          scanResults={scanResults} setScanResults={setScanResults}
          scanSteps={scanSteps} setScanSteps={setScanSteps}
          scanContext={scanContext} setScanContext={setScanContext}
          scanFileName={scanFileName}
          batchPhotos={batchPhotos} batchProgress={batchProgress}
          batchIdState={batchIdState}
          carnetPhotos={carnetPhotos} setCarnetPhotos={setCarnetPhotos}
          carnetPulseAnim={carnetPulseAnim}
          selectedCarnetPage={selectedCarnetPage} setSelectedCarnetPage={setSelectedCarnetPage}
          showCarnetPageSheet={showCarnetPageSheet} setShowCarnetPageSheet={setShowCarnetPageSheet}
          showAnalyzeSheet={showAnalyzeSheet} setShowAnalyzeSheet={setShowAnalyzeSheet}
          showMediBookUploadSheet={showMediBookUploadSheet} setShowMediBookUploadSheet={setShowMediBookUploadSheet}
          statsTab={statsTab} setStatsTab={setStatsTab}
          analysesTab={analysesTab} setAnalysesTab={setAnalysesTab}
          medsTab={medsTab} setMedsTab={setMedsTab}
          activeProfile={activeProfile} children={children}
          showProfileSwitcher={showProfileSwitcher} setShowProfileSwitcher={setShowProfileSwitcher}
          loadMedicalData={loadMedicalData}
          startMedicalScan={startMedicalScan}
          startBatchScan={startBatchScan}
          handleTransferToSecretPocket={handleTransferToSecretPocket}
          toggleMedicationReminder={toggleMedicationReminder}
          toggleMedicationTaken={toggleMedicationTaken}
          isTakenAtTime={isTakenAtTime}
          archiveMedication={archiveMedication}
          showAddMedSheet={showAddMedSheet} setShowAddMedSheet={setShowAddMedSheet}
          showAddAnalysisSheet={showAddAnalysisSheet} setShowAddAnalysisSheet={setShowAddAnalysisSheet}
          showAddDiagSheet={showAddDiagSheet} setShowAddDiagSheet={setShowAddDiagSheet}
          showAddAllergySheet={showAddAllergySheet} setShowAddAllergySheet={setShowAddAllergySheet}
          vaccCalendarView={vaccCalendarView} setVaccCalendarView={setVaccCalendarView}
          vaccSchedule={vaccSchedule} vaccStats={vaccStats}
          vaccPriorityFilter={vaccPriorityFilter} setVaccPriorityFilter={setVaccPriorityFilter}
          vaccCalendarLoading={vaccCalendarLoading} openAddVaccFromCalendar={openAddVaccFromCalendar}
          getOverdueText={getOverdueText}
          showAddVaccSheet={showAddVaccSheet} setShowAddVaccSheet={setShowAddVaccSheet}
          mbGenerateScale={mbGenerateScale}
          shareToken={shareToken} shareLoading={shareLoading} shareError={shareError} shareExpiry={shareExpiry}
          generateMedicalShare={generateMedicalShare}
        />
        </View>
      );
    }
    if (currentSubPage === 'secretpocket') {
      return <View key="secretpocket-wrapper" style={{ flex: 1 }}><SecretPocketContent isUnlocked={isUnlocked} setIsUnlocked={setIsUnlocked} setCurrentSubPage={setCurrentSubPage} /></View>;
    }
    return renderMain();
  };

  var renderMain = function() { return (
    <View key="main-wrapper" style={{ flex: 1, backgroundColor: '#1A1D22' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E2530" />

      {/* ===== HEADER — MedicAi immersive ===== */}
      <View style={{
        backgroundColor: '#1E2530',
        paddingTop: Platform.OS === 'android' ? 44 : 50,
        paddingHorizontal: 16, paddingBottom: 6,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: fp(22), fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }}>Medic</Text>
          <Text style={{ fontSize: fp(22), fontWeight: '900', color: '#4DA6FF', letterSpacing: 1 }}>Ai</Text>
        </View>
        <Pressable onPress={closeMedicAi} style={function(state) {
          return {
            width: 36, height: 36, borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.1)',
            justifyContent: 'center', alignItems: 'center',
            opacity: state.pressed ? 0.7 : 1,
          };
        }}>
          <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '600' }}>✕</Text>
        </Pressable>
      </View>

      {/* ===== ZONE DE CONTENU ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ===== ZONE ALIXEN STICKY (hors du scroll) ===== */}
        <View style={{ backgroundColor: '#1E2530', overflow: 'hidden' }}>
          <View style={{ width: FRAME_W, height: MODULE_H, alignSelf: 'center' }}>
            <View style={{ position: 'absolute', top: BRIDGE_TOP, left: 0, width: FRAME_W }}>
              <FunnelBridgeUnified wireMode={wm} />
            </View>
            <AlixenFace state={alixenState} keystrokeCount={keystrokeCount} paused={!pageActive} />
          </View>
          <View style={{ alignSelf: 'stretch', flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 4, marginTop: Math.round(FRAME_W * -0.065), gap: 8 }}>
            <MetalCard
              title="MediBook"
              iconElement={
                <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="2" width="14" height="20" rx="2" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                  <Line x1="7" y1="8" x2="13" y2="8" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="7" y1="12" x2="13" y2="12" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                </Svg>
              }
              onPress={function() { setCurrentSubPage('medibook'); }}
            />
            <MetalCard
              title="Secret Pocket"
              titleColor="#D4AF37"
              iconElement={
                <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                  <Rect x="9" y="10" width="6" height="5" rx="1" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                  <Path d="M10 10V8a2 2 0 014 0v2" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </Svg>
              }
              onPress={function() { setCurrentSubPage('secretpocket'); }}
            />
          </View>
        </View>

        {/* Labels ALIXEN / Membre — sticky */}
        <View style={{ backgroundColor: '#1E2530', paddingTop: 4, paddingBottom: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Animated.View style={{ width: wm === 'alixen' ? 12 : 10, height: wm === 'alixen' ? 12 : 10, borderRadius: 6, backgroundColor: '#4DA6FF', marginRight: 5, justifyContent: 'center', alignItems: 'center', opacity: wm === 'alixen' ? pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.0] }) : 0.35 }}>
                <Animated.View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF', opacity: wm === 'alixen' ? pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.0] }) : 0.3 }} />
              </Animated.View>
              <Text style={{ color: wm === 'alixen' ? '#4DA6FF' : '#8892A0', fontSize: 9, fontWeight: '600' }}>ALIXEN</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Animated.View style={{ width: wm === 'user' ? 12 : 10, height: wm === 'user' ? 12 : 10, borderRadius: 6, backgroundColor: '#00D984', marginRight: 5, justifyContent: 'center', alignItems: 'center', opacity: wm === 'user' ? pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.0] }) : 0.35 }}>
                <Animated.View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF', opacity: wm === 'user' ? pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.0] }) : 0.3 }} />
              </Animated.View>
              <Text style={{ color: wm === 'user' ? '#00D984' : '#8892A0', fontSize: 9, fontWeight: '600' }}>{userLang === 'EN' ? 'Member' : 'Membre'}</Text>
            </View>
          </View>
          {alixenState !== 'idle' && alixenState !== 'listening' && getAlixenMention(alixenState) ? (
            <Animated.Text style={{ textAlign: 'center', color: wm === 'alixen' ? '#4DA6FF' : '#00D984', fontSize: 8, fontWeight: '600', opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.8] }), marginBottom: 2 }}>
              {getAlixenMention(alixenState)}
            </Animated.Text>
          ) : null}
        </View>

        {/* ===== ZONE CHAT SCROLLABLE ===== */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 80 + insets.bottom, paddingTop: 8 }}
          onContentSizeChange={function() { /* removed auto-scroll — user reads from top */ }}
          keyboardShouldPersistTaps="handled"
        >

          {/* Boules en S */}
          <Animated.View style={{
            opacity: contentEntry,
            transform: [{ translateY: contentEntry.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            marginBottom: wp(4),
          }}>
            <SynapticNetwork
              messages={messages}
              searchHits={searchHits}
              onBallPress={handleBallPress}
              onNewSession={cbNewSession}
              sessionFull={messages.length >= 24}
            />
          </Animated.View>

          {/* Carte de réponse */}
          {/* === ALIXEN SUPER CONTEXT v1 — userLocation prop === */}
          <ResponseCard
            currentMessage={cardMessage}
            isLoading={cardIsLoading}
            isUserMessage={cardIsUser}
            isError={cardIsError}
            onQuickReply={handleQuickReply}
            onPreciserPress={handlePreciserPress}
            loadingSteps={loadingSteps}
            userLocation={userLocation}
          />
        </ScrollView>

        {/* Panneau recherche (si ouvert) — avec bouton X */}
        {searchVisible && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 8,
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.04)',
            marginHorizontal: 8,
            borderRadius: 14,
            marginBottom: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <TextInput
              autoFocus
              style={{ flex: 1, color: '#00A878', fontSize: 13, paddingVertical: 4 }}
              placeholder={userLang === 'EN' ? 'Search messages...' : 'Rechercher dans les messages...'}
              placeholderTextColor="rgba(0,0,0,0.2)"
              value={searchQuery}
              onChangeText={handleSearch}
            />

            {/* Bouton submit recherche */}
            {searchQuery.trim().length > 0 ? (
              <TouchableOpacity
                onPress={function() { Keyboard.dismiss(); }}
                style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: 'rgba(0,217,132,0.15)',
                  justifyContent: 'center', alignItems: 'center',
                  marginLeft: 6,
                }}
              >
                <Text style={{ color: '#00D984', fontSize: 14, fontWeight: 'bold' }}>⌕</Text>
              </TouchableOpacity>
            ) : null}

            {/* Bouton fermer X */}
            <TouchableOpacity
              onPress={function() {
                setSearchVisible(false);
                setSearchQuery('');
                setSearchHits(new Set());
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(0,0,0,0.05)',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
              }}
            >
              <Text style={{ color: '#999', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>

            {/* Compteur résultats en dessous */}
            {searchHits.size > 0 && (
              <Text style={{
                position: 'absolute',
                bottom: -14,
                left: 12,
                color: '#00A878',
                fontSize: 8,
              }}>
                {searchHits.size} bulle{searchHits.size > 1 ? 's' : ''} trouvée{searchHits.size > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}

        {/* Zone de saisie avec dégradé emerald */}
        <Animated.View style={{
          opacity: inputEntry,
          transform: [{ translateY: inputEntry.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}>
          <View style={{
            marginHorizontal: wp(12),
            marginBottom: Math.max(insets.bottom, 12) + 4,
            borderRadius: wp(28),
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            borderWidth: 1, borderColor: 'rgba(0,217,132,0.3)',
            shadowColor: '#00D984',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 3,
          }}>
            {/* Accent line énergie */}
            <View style={{
              position: 'absolute',
              left: 0, top: 0, right: 0, height: 2,
              backgroundColor: 'rgba(0,217,132,0.2)',
            }}/>

            {/* Fichiers en attente */}
            <FileQueuePreview
              files={fileQueue}
              onRemove={cbRemoveFile}
            />

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: wp(4),
              paddingVertical: wp(4),
              gap: 6,
            }}>
              {/* Bouton "+" ajout document */}
              <Pressable
                delayPressIn={120}
                onPress={cbOpenDocSheet}
                style={({ pressed }) => ({
                  width: wp(38),
                  height: wp(38),
                  borderRadius: wp(19),
                  borderWidth: 1,
                  borderColor: '#4A4F55',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
              >
                <LinearGradient
                  colors={['#3A3F46', '#252A30']}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: wp(19),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                    <Line x1="12" y1="5" x2="12" y2="19" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
                    <Line x1="5" y1="12" x2="19" y2="12" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
                  </Svg>
                </LinearGradient>
              </Pressable>

              {/* Bouton Recherche — style MetalCard comme le "+" */}
              <Pressable
                delayPressIn={120}
                onPress={cbToggleSearch}
                style={({ pressed }) => ({
                  width: wp(38),
                  height: wp(38),
                  borderRadius: wp(19),
                  borderWidth: 1,
                  borderColor: '#4A4F55',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
              >
                <LinearGradient
                  colors={['#3A3F46', '#252A30']}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: wp(19),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                    <Circle cx="11" cy="11" r="7" stroke="#00D984" strokeWidth="2" fill="none"/>
                    <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
                  </Svg>
                </LinearGradient>
              </Pressable>

              {/* Champ message — zone délimitée */}
              <View style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: wp(20),
                paddingHorizontal: wp(14),
                marginHorizontal: wp(6),
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.06)',
              }}>
                <TextInput
                  ref={inputRef}
                  style={{
                    fontSize: fp(14),
                    color: '#2D3436',
                    paddingVertical: wp(8),
                    maxHeight: 50,
                  }}
                  placeholder={userLang === 'EN' ? 'Your message' : 'Votre message'}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  selectionColor="#00A878"
                  value={inputText}
                  onChangeText={function(t) { setInputText(t); setKeystrokeCount(function(c) { return c + 1; }); }}
                  multiline
                  blurOnSubmit={false}
                  editable={!isLocked}
                />
              </View>

              {/* Bouton Micro / Envoyer / X rouge si énergie vide */}
              {isLocked ? (
                <Pressable
                  delayPressIn={120}
                  onPress={cbOpenRecharge}
                  style={function(state) {
                    return {
                      width: wp(38), height: wp(38), borderRadius: wp(19),
                      backgroundColor: 'rgba(255,107,107,0.15)',
                      borderWidth: 1.5, borderColor: '#FF6B6B',
                      justifyContent: 'center', alignItems: 'center',
                      transform: [{ scale: state.pressed ? 0.92 : 1 }],
                    };
                  }}
                >
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                    <Line x1="18" y1="6" x2="6" y2="18" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round"/>
                    <Line x1="6" y1="6" x2="18" y2="18" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round"/>
                  </Svg>
                </Pressable>
              ) : (inputText.trim() || fileQueue.length > 0) ? (
                <TouchableOpacity
                  onPress={cbSendMessage}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: '#FFFFFF',
                    justifyContent: 'center', alignItems: 'center',
                    shadowColor: 'rgba(0,0,0,0.15)',
                    shadowOffset: { width: 3, height: 3 },
                    shadowOpacity: 0.5, shadowRadius: 5, elevation: 5,
                    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
                  }}
                >
                  <Text style={{ color: '#00D984', fontSize: 15, fontWeight: 'bold' }}>{'➤'}</Text>
                </TouchableOpacity>
              ) : (
                <Pressable
                  delayPressIn={120}
                  onPress={function() { console.log('Micro pressed'); }}
                  style={function(state) {
                    return {
                      width: 40, height: 40, borderRadius: 20,
                      backgroundColor: 'transparent',
                      justifyContent: 'center', alignItems: 'center',
                      transform: [{ scale: state.pressed ? 0.92 : 1 }],
                    };
                  }}
                >
                  <Ionicons name="mic-outline" size={wp(22)} color="#00D984" />
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* BottomTabs removed — MedicAi is immersive full-screen */}

      {/* === MODAL MESSAGE COMPLET — plain text preview === */}
      {selectedMessage && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center', alignItems: 'center', zIndex: 200,
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={closeModal} activeOpacity={1}
          />
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 20,
            padding: 16,
            width: SCREEN_WIDTH * 0.92,
            maxHeight: SCREEN_HEIGHT * 0.65,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: '#333', fontSize: 12, fontWeight: '700' }}>
                {selectedMessage.role === 'assistant' ? 'ALIXEN' : 'Vous'} #{selectedMessage.index + 1}
              </Text>
              <TouchableOpacity onPress={closeModal}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: 10 }}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Content — highlighted if searching */}
            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.45 }}>
              {searchQuery && searchQuery.trim() ? (
                <HighlightedText
                  text={stripAlixenFormatting(selectedMessage.content)}
                  searchTerm={searchQuery}
                  currentIndex={0}
                  style={{ color: '#333', fontSize: fp(13), lineHeight: 20 }}
                />
              ) : (
                <Text style={{ color: '#333', fontSize: fp(13), lineHeight: 20 }}>
                  {stripAlixenFormatting(selectedMessage.content)}
                </Text>
              )}
            </ScrollView>

            {/* Heure */}
            <Text style={{ color: 'rgba(0,0,0,0.2)', fontSize: 8, marginTop: 8, textAlign: 'right' }}>
              {selectedMessage.timestamp
                ? new Date(selectedMessage.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : ''}
            </Text>
          </View>
        </View>
      )}

      {/* === MODAL LOCK — Énergie épuisée === */}
      {showLockModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 500,
        }}>
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 20,
            padding: 24,
            width: SCREEN_WIDTH * 0.85,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <Text style={{ fontSize: 30, marginBottom: 10 }}>🔒</Text>
            <Text style={{ color: '#1A2030', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
              Énergie épuisée
            </Text>
            <Text style={{ color: '#888', fontSize: 11, textAlign: 'center', marginBottom: 4 }}>
              {userEnergy} énergie restante
            </Text>
            <Text style={{ color: '#AAA', fontSize: 10, textAlign: 'center', marginBottom: 16, lineHeight: 16 }}>
              Rechargez pour continuer à consulter ALIXEN.
            </Text>

            {/* Option 1 : Recharger 100 Lix */}
            <TouchableOpacity
              onPress={() => {
                refreshLixFromServer();
                setShowLockModal(false);
                addBotMessage("Recharge de 10 énergie effectuée ! Continuons. 💚");
              }}
              style={{
                width: '100%',
                backgroundColor: '#00D984',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>
                Recharger — 100 Lix = +10 énergie
              </Text>
            </TouchableOpacity>

            {/* Option 2 : Mega recharge 500 Lix */}
            <TouchableOpacity
              onPress={() => {
                refreshLixFromServer();
                setShowLockModal(false);
                addBotMessage("Recharge de 50 énergie effectuée ! ALIXEN est prête. 🚀");
              }}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,217,132,0.1)',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(0,217,132,0.2)',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#00A878', fontSize: 13, fontWeight: '600' }}>
                Mega Recharge — 500 Lix = +50 énergie
              </Text>
            </TouchableOpacity>

            {/* Option 3 : Upgrader */}
            <TouchableOpacity
              onPress={() => {
                setShowLockModal(false);
                addBotMessage("Les abonnements seront disponibles prochainement !");
              }}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#1A2030', fontSize: 12 }}>
                Upgrader mon abonnement
              </Text>
            </TouchableOpacity>

            {/* Option 4 : Attendre */}
            <TouchableOpacity onPress={() => setShowLockModal(false)}>
              <Text style={{ color: '#BBB', fontSize: 10, marginTop: 4 }}>
                Attendre le rechargement (6h)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* === MODAL CONFIRMATION RECETTE === */}
      {recipeModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 20,
            width: SCREEN_WIDTH * 0.85,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Avatar ALIXEN */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={null}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#00D984' }}
                resizeMode="cover"
              />
              <Text style={{ color: '#00A878', fontSize: 14, fontWeight: 'bold' }}>ALIXEN</Text>
            </View>

            {/* Message */}
            <Text style={{ color: '#3A4550', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
              Tu veux voir la recette "{recipeModal.name}" dans la section Repas ? {'🍽️'}
            </Text>

            {/* Boutons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setRecipeModal(null)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.08)',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmNavigateToRecipe}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: '#00D984',
                  alignItems: 'center',
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>Voir la recette</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  ); };


  // ── FINAL RETURN ───────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      <AllModals
        showMediBookUploadSheet={showMediBookUploadSheet} setShowMediBookUploadSheet={setShowMediBookUploadSheet}
        takePhoto={takePhoto} pickImage={pickImage} pickDocument={pickDocument}
        showDocumentSheet={showDocumentSheet} setShowDocumentSheet={setShowDocumentSheet}
        setCurrentSubPage={setCurrentSubPage}
        showNewSessionSheet={showNewSessionSheet} setShowNewSessionSheet={setShowNewSessionSheet}
        onStartFreshSession={function() { setMessages([]); clearChatStorage(); setCardMessage(null); setCardIsUser(false); setCardIsLoading(false); setCardIsError(false); loadUserData(); }}
        showCompactConfirm={showCompactConfirm} setShowCompactConfirm={setShowCompactConfirm}
        showRechargeSheet={showRechargeSheet} setShowRechargeSheet={setShowRechargeSheet}
        showProfileSwitcher={showProfileSwitcher} setShowProfileSwitcher={setShowProfileSwitcher}
        activeProfile={activeProfile} setActiveProfile={setActiveProfile}
        children={children} setChildren={setChildren}
        loadFamilyMembers={loadFamilyMembers}
        lixBalance={lixBalance} refreshLixFromServer={refreshLixFromServer}
        editingChildId={editingChildId} setEditingChildId={setEditingChildId}
        newChildIsFree={newChildIsFree} setNewChildIsFree={setNewChildIsFree}
        showChildNameInput={showChildNameInput} setShowChildNameInput={setShowChildNameInput}
        newChildName={newChildName} setNewChildName={setNewChildName}
        showCarnetPageSheet={showCarnetPageSheet} setShowCarnetPageSheet={setShowCarnetPageSheet}
        selectedCarnetPage={selectedCarnetPage}
        carnetPhotos={carnetPhotos} setCarnetPhotos={setCarnetPhotos}
        showAnalyzeSheet={showAnalyzeSheet} setShowAnalyzeSheet={setShowAnalyzeSheet}
        startMedicalScan={startMedicalScan}
        pickMultiplePhotos={pickMultiplePhotos}
        batchPhotos={batchPhotos} setBatchPhotos={setBatchPhotos}
        showBatchPreview={showBatchPreview} setShowBatchPreview={setShowBatchPreview}
        getBatchEnergyCost={getBatchEnergyCost} removeBatchPhoto={removeBatchPhoto}
        startBatchScan={startBatchScan}
        showAddMedSheet={showAddMedSheet} setShowAddMedSheet={setShowAddMedSheet}
        addMedStep={addMedStep} setAddMedStep={setAddMedStep}
        medSearchQuery={medSearchQuery}
        medSearchResults={medSearchResults} setMedSearchResults={setMedSearchResults}
        selectedMedFromDb={selectedMedFromDb} setSelectedMedFromDb={setSelectedMedFromDb}
        searchMedications={searchMedications} selectMedFromDb={selectMedFromDb}
        searchMedicationAI={searchMedicationAI}
        newMedDosageValue={newMedDosageValue} setNewMedDosageValue={setNewMedDosageValue}
        newMedDosageUnit={newMedDosageUnit} setNewMedDosageUnit={setNewMedDosageUnit}
        newMedFrequency={newMedFrequency} setNewMedFrequency={setNewMedFrequency}
        newMedDuration={newMedDuration} setNewMedDuration={setNewMedDuration}
        newMedReminder={newMedReminder} setNewMedReminder={setNewMedReminder}
        confirmAddMedication={confirmAddMedication}
        showAddAnalysisSheet={showAddAnalysisSheet} setShowAddAnalysisSheet={setShowAddAnalysisSheet}
        newAnalysisLabel={newAnalysisLabel} setNewAnalysisLabel={setNewAnalysisLabel}
        newAnalysisDate={newAnalysisDate} setNewAnalysisDate={setNewAnalysisDate}
        newAnalysisDoctor={newAnalysisDoctor} setNewAnalysisDoctor={setNewAnalysisDoctor}
        newAnalysisLab={newAnalysisLab} setNewAnalysisLab={setNewAnalysisLab}
        newAnalysisNotes={newAnalysisNotes} setNewAnalysisNotes={setNewAnalysisNotes}
        confirmAddAnalysis={confirmAddAnalysis}
        showAddDiagSheet={showAddDiagSheet} setShowAddDiagSheet={setShowAddDiagSheet}
        addDiagStep={addDiagStep} setAddDiagStep={setAddDiagStep}
        diagSearchQuery={diagSearchQuery}
        diagSearchResults={diagSearchResults} setDiagSearchResults={setDiagSearchResults}
        selectedDiagFromDb={selectedDiagFromDb} setSelectedDiagFromDb={setSelectedDiagFromDb}
        searchDiseases={searchDiseases} selectDiagFromDb={selectDiagFromDb}
        newDiagSeverity={newDiagSeverity} setNewDiagSeverity={setNewDiagSeverity}
        newDiagDate={newDiagDate} setNewDiagDate={setNewDiagDate}
        newDiagDoctor={newDiagDoctor} setNewDiagDoctor={setNewDiagDoctor}
        newDiagStatus={newDiagStatus} setNewDiagStatus={setNewDiagStatus}
        newDiagNotes={newDiagNotes} setNewDiagNotes={setNewDiagNotes}
        confirmAddDiagnostic={confirmAddDiagnostic}
        showAddAllergySheet={showAddAllergySheet} setShowAddAllergySheet={setShowAddAllergySheet}
        newAllergyAllergen={newAllergyAllergen} setNewAllergyAllergen={setNewAllergyAllergen}
        newAllergyType={newAllergyType} setNewAllergyType={setNewAllergyType}
        newAllergySeverity={newAllergySeverity} setNewAllergySeverity={setNewAllergySeverity}
        newAllergyReaction={newAllergyReaction} setNewAllergyReaction={setNewAllergyReaction}
        confirmAddAllergy={confirmAddAllergy}
        showAddVaccSheet={showAddVaccSheet} setShowAddVaccSheet={setShowAddVaccSheet}
        newVaccName={newVaccName} setNewVaccName={setNewVaccName}
        newVaccDate={newVaccDate} setNewVaccDate={setNewVaccDate}
        newVaccDose={newVaccDose} setNewVaccDose={setNewVaccDose}
        newVaccNextDue={newVaccNextDue} setNewVaccNextDue={setNewVaccNextDue}
        newVaccDoctor={newVaccDoctor} setNewVaccDoctor={setNewVaccDoctor}
        newVaccBatch={newVaccBatch} setNewVaccBatch={setNewVaccBatch}
        confirmAddVaccination={confirmAddVaccination}
        vaccSearchResults={vaccSearchResults} searchVaccinesDb={searchVaccinesDb}
        selectedVaccineFromDb={selectedVaccineFromDb} selectVaccineFromDb={selectVaccineFromDb}
        vaccReminderNote={vaccReminderNote} vaccReminderAutoFilled={vaccReminderAutoFilled}
        tryFetchVaccReminder={tryFetchVaccReminder}
      />
      <LixumModal visible={mModal.visible} type={mModal.type} title={mModal.title} message={mModal.message} onConfirm={mModal.onConfirm} onClose={mModal.onClose || closeMModal} confirmText={mModal.confirmText} cancelText={mModal.cancelText} />
      <EnergyGateModal
        visible={energyGateData !== null}
        onClose={function() { setEnergyGateData(null); }}
        energyCost={energyGateData ? energyGateData.energy_cost : 0}
        energyBalance={energyGateData ? energyGateData.energy_balance : 0}
        lixBalance={lixBalance}
        onRecharge={function() { setEnergyGateData(null); refreshLixFromServer(); }}
        onViewPlans={function() { setEnergyGateData(null); console.log('Navigate to subscription plans'); }}
      />
    </View>
  );
}
