// ──────────────────────────────────────────────────────────────────────────────
// medicai/index.js — MedicAi : Composant principal
// State, routing, API calls, renderMain, renderContent
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Platform, Animated, KeyboardAvoidingView,
  Dimensions, StatusBar, PixelRatio, Keyboard, Pressable, Alert, Modal, ActivityIndicator,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle, Ellipse, Line,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

import { SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER_ID, ENERGY_CONFIG, TABS, wp, fp, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';
import { BottomTabs, FormattedText, FormattedResponseText, MetalCard, parseQuickReplies, parseAlixenResponse, QuickReplyButtons, BottomSpacer, LockIcon, ScrollArrow } from './shared';
import { SynapticNetwork, ResponseCard, LoadingSteps, FileQueuePreview, ModalScrollContent } from './AlixenChat';
import { MediBookContent } from './MediBookPages';
import { SecretPocketContent } from './SecretPocket';
import { AllModals } from './Modals';

const DoctorHeader = () => (
  <View style={{
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.42,
    backgroundColor: '#DDE2E8',
    overflow: 'hidden',
  }}>
    <Image
      source={require('../assets/lixman-doctor.png')}
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.42,
      }}
      resizeMode="cover"
    />
    {/* Dégradé de fondu en bas pour transition douce vers le fond */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 25,
    }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,0.0)' }} />
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,0.3)' }} />
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,0.6)' }} />
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,0.85)' }} />
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,1)' }} />
    </View>
  </View>
);


export default function MedicAiPage() {
  // Sub-page navigation
  const [currentSubPage, setCurrentSubPage] = useState('main');

  // Messages du chat
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Données utilisateur (chargées au mount)
  const [userProfile, setUserProfile] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [energyUsed, setEnergyUsed] = useState(0);
  const [energyLimit, setEnergyLimit] = useState(ENERGY_CONFIG.FREE_DAILY_ENERGY);
  const [lastResetTime, setLastResetTime] = useState(Date.now());

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

  // Secret Pocket state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAddDataSheet, setShowAddDataSheet] = useState(false);
  const [showCompactConfirm, setShowCompactConfirm] = useState(false);
  const [showRechargeSheet, setShowRechargeSheet] = useState(false);
  const [showCategoryUploadSheet, setShowCategoryUploadSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Navigation interne MediBook
  const [mediBookView, setMediBookView] = useState('landing');
  const [reportSection, setReportSection] = useState('hub');
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
  const [activeProfile, setActiveProfile] = useState('self');
  const [children, setChildren] = useState([
    { id: 'child-0', name: 'Mon enfant', age: '', free: true },
  ]);
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

  // Upload / Scan IA
  const [uploadState, setUploadState] = useState('idle');
  const [scanResults, setScanResults] = useState(null);
  const [scanSteps, setScanSteps] = useState([]);
  const [scanContext, setScanContext] = useState(null);
  const [scanCategory, setScanCategory] = useState(null);
  const [scanFileName, setScanFileName] = useState('');

  // Énergie — valeurs dérivées
  const energyLeft = Math.max(0, energyLimit - energyUsed);
  const energyPercent = Math.max(0, Math.min(100, (energyLeft / energyLimit) * 100));
  const getEnergyColor = (pct) => {
    if (pct > 60) return '#00D984';
    if (pct > 35) return '#F1C40F';
    if (pct > 15) return '#FF8C42';
    return '#FF6B6B';
  };
  const energyColor = getEnergyColor(energyPercent);

  // Progress bar color — evolves with message count
  const getProgressColor = () => {
    const progress = Math.min((energyUsed / energyLimit) * 100, 100);
    if (progress < 50) return 'rgba(0, 217, 132, 0.25)';
    if (progress < 75) return 'rgba(255, 140, 66, 0.25)';
    if (progress < 90) return 'rgba(255, 107, 107, 0.25)';
    return 'rgba(231, 76, 60, 0.35)';
  };

  // Refs
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const carnetPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mediBookView === 'carnet' && carnetPhotos.filter(p => p).length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(carnetPulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(carnetPulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      carnetPulseAnim.setValue(1);
    }
  }, [mediBookView, carnetPhotos]);

  // Animations d'entrée
  const contentEntry = useRef(new Animated.Value(0)).current;
  const inputEntry = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Sub-page animation refs
  const mbGenerateScale = useRef(new Animated.Value(1)).current;
  const spAddScale = useRef(new Animated.Value(1)).current;

  // ── Chargement des données au mount ──────────────────────────────────────
  useEffect(() => {
    loadUserData();
    loadTokenQuota();
    loadAvailableMeals();
    loadMedicalData();

    Animated.stagger(200, [
      Animated.spring(contentEntry, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(inputEntry, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
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

  // ── Lock quand quota atteint ──────────────────────────────────────────────
  useEffect(() => {
    setIsLocked(energyUsed >= energyLimit);
  }, [energyUsed, energyLimit]);

  // ── Timer reset automatique 6h ────────────────────────────────────────────
  useEffect(() => {
    const checkReset = setInterval(() => {
      if (Date.now() - lastResetTime >= ENERGY_CONFIG.SESSION_DURATION_MS) {
        setEnergyUsed(0);
        setLastResetTime(Date.now());
        setIsLocked(false);
      }
    }, 60000);
    return () => clearInterval(checkReset);
  }, [lastResetTime]);

  const addBotMessage = useCallback((text) => {
    setMessages(prev => {
      if (prev.length >= 30) {
        Alert.alert(
          'Session pleine',
          'Vous avez atteint la limite de 30 échanges par session.\n\nCompactez cette conversation pour la ranger dans votre Secret Pocket et démarrer une nouvelle session.',
          [
            { text: 'Compacter et ranger', onPress: () => console.log('Compactage vers Secret Pocket') },
            { text: 'Annuler', style: 'cancel' },
          ]
        );
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
    try {
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users_profile?user_id=eq.${TEST_USER_ID}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const profileData = await profileRes.json();
      if (profileData.length > 0) setUserProfile(profileData[0]);

      const today = new Date().toISOString().split('T')[0];
      const summaryRes = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_summary?user_id=eq.${TEST_USER_ID}&date=eq.${today}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const summaryData = await summaryRes.json();
      if (summaryData.length > 0) setTodaySummary(summaryData[0]);

      // Charger les repas du jour
      const todayStr = new Date().toISOString().split('T')[0];
      const mealsRes = await fetch(
        SUPABASE_URL + '/rest/v1/meals?user_id=eq.' + TEST_USER_ID + '&date=eq.' + todayStr + '&select=name,meal_type,calories,protein,carbs,fat&order=created_at.asc',
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY } }
      );
      const mealsData = await mealsRes.json();
      if (Array.isArray(mealsData)) setTodayMeals(mealsData);

      generateGreeting(profileData[0], summaryData[0]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      addBotMessage("Bonjour ! Je suis ALIXEN, votre coach nutritionniste IA personnel. Comment puis-je vous aider aujourd'hui ?");
    }
  };

  const loadTokenQuota = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/medic_token_quotas?user_id=eq.${TEST_USER_ID}&date=eq.${today}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const usedEnergy = Math.ceil((data[0].tokens_used || 0) / ENERGY_CONFIG.TOKEN_DIVISOR_SONNET);
        setEnergyUsed(usedEnergy);
      }
    } catch (error) {
      // Pas grave, on affiche les défauts
    }
  };

  const loadAvailableMeals = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/meals_master?select=id,name,category,calories_per_serving&order=name`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
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
      const userId = TEST_USER_ID;
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      };

      // Charger le profil
      const profileRes = await fetch(
        SUPABASE_URL + '/rest/v1/health_profiles?user_id=eq.' + userId + '&profile_type=eq.self&limit=1',
        { headers }
      );
      const profiles = await profileRes.json();
      const profileId = profiles[0]?.id || null;
      const vitalityScore = profiles[0]?.vitality_score || 0;

      // Charger les analyses
      const analysesRes = await fetch(
        SUPABASE_URL + '/rest/v1/medical_analyses?user_id=eq.' + userId + '&order=created_at.desc',
        { headers }
      );
      const analyses = await analysesRes.json();

      // Charger les médicaments actifs
      const medsRes = await fetch(
        SUPABASE_URL + '/rest/v1/medications?user_id=eq.' + userId + '&status=eq.active&order=created_at.desc',
        { headers }
      );
      const medications = await medsRes.json();

      // Charger les allergies
      const allergiesRes = await fetch(
        SUPABASE_URL + '/rest/v1/allergies?user_id=eq.' + userId + '&order=created_at.desc',
        { headers }
      );
      const allergiesData = await allergiesRes.json();

      // Charger les vaccinations
      const vaccRes = await fetch(
        SUPABASE_URL + '/rest/v1/vaccinations?user_id=eq.' + userId + '&order=administration_date.desc',
        { headers }
      );
      const vaccinations = await vaccRes.json();

      // Charger les diagnostics
      const diagRes = await fetch(
        SUPABASE_URL + '/rest/v1/diagnostics?user_id=eq.' + userId + '&order=created_at.desc',
        { headers }
      );
      const diagnostics = await diagRes.json();

      // Charger les médicaments terminés
      const medsTermRes = await fetch(
        SUPABASE_URL + '/rest/v1/medications?user_id=eq.' + userId + '&status=eq.completed&order=end_date.desc',
        { headers }
      );
      const medsTerminated = await medsTermRes.json();

      // Charger les analyses planifiées
      const scheduledRes = await fetch(
        SUPABASE_URL + '/rest/v1/medical_analyses?user_id=eq.' + userId + '&is_scheduled=eq.true&order=scheduled_date.asc',
        { headers }
      );
      const scheduledAnalyses = await scheduledRes.json();

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

  // ── Construire le contexte utilisateur ───────────────────────────────────
  const buildUserContext = () => {
    if (!userProfile) return 'Données utilisateur non disponibles.';

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

    // Résultats anormaux récents
    const abnormalResults = medicalData.analyses
      ? medicalData.analyses
          .filter(a => a.status === 'elevated' || a.status === 'low' || a.status === 'critical')
          .map(a => a.label + ': ' + a.value + ' (' + a.status + ')')
          .join(', ')
      : '';

    // Diagnostics
    const diagList = medicalData.diagnostics && medicalData.diagnostics.length > 0
      ? medicalData.diagnostics.map(d => d.condition || d.label || '').join(', ')
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

    return `
DONNÉES UTILISATEUR (${today}) :
- Nom : ${userProfile.full_name || 'N/A'}
- Âge : ${userProfile.age || 'N/A'} ans | Sexe : ${userProfile.gender || 'N/A'}
- Poids : ${userProfile.weight || 'N/A'} kg | Taille : ${userProfile.height || 'N/A'} cm
- Objectif : ${userProfile.goal || 'N/A'}
- BMR : ${userProfile.bmr || 'N/A'} kcal | TDEE : ${userProfile.tdee || 'N/A'} kcal
- Score Vitalité : ${vitalityScore}/100

MACROS AUJOURD'HUI :
- Calories : ${cal} / ${userProfile.tdee || 2000} kcal
- Protéines : ${protein}g | Glucides : ${carbs}g | Lipides : ${fat}g

${todayMeals.length > 0 ? '\nREPAS DU JOUR :\n' + todayMeals.map(m => '- ' + (m.meal_type === 'breakfast' ? 'Petit-déjeuner' : m.meal_type === 'lunch' ? 'Déjeuner' : m.meal_type === 'dinner' ? 'Dîner' : m.meal_type === 'snack' ? 'Collation' : (m.meal_type || 'Repas')) + ' : ' + (m.name || '?') + ' (' + (m.calories || '?') + ' kcal, P:' + (m.protein || 0) + 'g G:' + (m.carbs || 0) + 'g L:' + (m.fat || 0) + 'g)').join('\n') : '\nREPAS DU JOUR : Aucun repas enregistré aujourd\'hui.'}

DONNÉES MÉDICALES :
- Médicaments en cours : ${activeMeds}
- Allergies connues : ${allergiesList}
- Prochaines analyses : ${upcomingAnalyses}
${abnormalResults ? '- Résultats anormaux récents : ' + abnormalResults : ''}
${diagList ? '- Diagnostics à surveiller : ' + diagList : ''}

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
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            action: 'loading_steps',
            userMessage: userMessage,
            userContext: buildUserContext(),
          }),
        }
      );
      const data = await response.json();
      if (data.steps && Array.isArray(data.steps)) {
        setLoadingSteps(data.steps);
      }
    } catch (e) {
      console.log('Loading steps fetch error:', e.message);
    }
  };

  const sendImageToAlixen = async (base64Data, fileName, mimeType) => {
    if (isLoading || isLocked) return;
    if (messages.length >= 30) return;

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

    setTimeout(async () => {
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
              'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              messages: textMessages,
              userId: TEST_USER_ID,
              userContext: context,
              imageBase64: base64Data,
              mimeType: mimeType || 'image/jpeg',
            }),
          }
        );

        const data = await response.json();
        const replyText = data.message || data.error || 'Erreur de connexion.';

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

        if (data.tokens_used) {
          const energyCost = Math.ceil(data.tokens_used / ENERGY_CONFIG.TOKEN_DIVISOR);
          setEnergyUsed(prev => prev + energyCost);
        }
      } catch (error) {
        console.error('Erreur envoi image ALIXEN:', error);
        setLoadingSteps([]);
        setCardIsLoading(false);
        setCardMessage('Erreur réseau. Vérifiez votre connexion.');
        setCardIsUser(false);
        setMessages(prev => {
          if (prev.length >= 30) return prev;
          return [...prev, {
            id: botMsgId,
            role: 'assistant',
            content: 'Erreur réseau. Vérifiez votre connexion.',
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

    if (messages.length >= 30) return;

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

    setTimeout(async () => {
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
              'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
              'apikey': SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ messages: allMessages, userId: TEST_USER_ID, userContext: context }),
          }
        );

        const data = await response.json();
        const replyText = data.message || data.error || 'Erreur de connexion.';

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

        if (data.tokens_used) {
          const energyCost = Math.ceil(data.tokens_used / ENERGY_CONFIG.TOKEN_DIVISOR);
          setEnergyUsed(prev => prev + energyCost);
        }
      } catch (error) {
        console.error('Erreur Quick Reply:', error);
        setLoadingSteps([]);
        setCardIsLoading(false);
        setCardMessage('Erreur réseau. Vérifiez votre connexion.');
        setCardIsUser(false);
        setMessages(prev => {
          if (prev.length >= 30) return prev;
          return [...prev, {
            id: botMsgId,
            role: 'assistant',
            content: 'Erreur réseau. Vérifiez votre connexion.',
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
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      };

      if (action.type === 'save_meal_plan') {
        const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/save_weekly_meal_plan', {
          method: 'POST', headers,
          body: JSON.stringify({
            p_user_id: TEST_USER_ID,
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
          SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID,
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
            user_id: TEST_USER_ID,
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
        addBotMessage('Médicament ajouté : ' + action.payload.name + ' ✅\nRetrouve-le dans MediBook > Médicaments.');
      }

      if (action.type === 'add_analysis') {
        await fetch(SUPABASE_URL + '/rest/v1/medical_analyses', {
          method: 'POST', headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            user_id: TEST_USER_ID,
            label: action.payload.label,
            value: 'À effectuer',
            status: 'unknown',
            is_scheduled: true,
            scheduled_date: action.payload.scheduled_date,
            reminder_enabled: true,
          }),
        });
        addBotMessage('Analyse planifiée : ' + action.payload.label + ' ✅\nRetrouve-la dans MediBook > Analyses.');
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
      addBotMessage('Erreur lors de l\'exécution. Réessayez. ❌');
    }
  };

  const handlePreciserPress = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 150);
    setTimeout(() => {
      Keyboard.dismiss();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }, 300);
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
  };

  // ── Envoi de message et appel IA ────────────────────────────────────────
  const sendMessage = async () => {
    const hasFiles = fileQueue.length > 0;
    const hasText = inputText.trim().length > 0;
    if ((!hasText && !hasFiles) || isLoading || isLocked) return;

    // Limite 30 bulles par session
    if (messages.length >= 30) {
      Alert.alert(
        'Session pleine',
        'Vous avez atteint la limite de 30 échanges. Souhaitez-vous compacter cette conversation et la ranger dans votre Secret Pocket ?',
        [
          { text: 'Compacter et ranger', onPress: () => console.log('Compactage vers Secret Pocket') },
          { text: 'Continuer quand même', style: 'cancel' },
        ]
      );
      return;
    }

    const filesToSend = [...fileQueue];
    setFileQueue([]);

    const userText = hasText ? inputText.trim() : (filesToSend.length > 0 ? filesToSend.length + ' fichier' + (filesToSend.length > 1 ? 's' : '') + ' envoyé' + (filesToSend.length > 1 ? 's' : '') : '');
    setInputText('');
    setIsLoading(true);

    // 1. Afficher le message user dans la carte
    setCardMessage(userText);
    setCardIsUser(true);
    setCardIsLoading(false);

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
    setTimeout(() => {
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
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
              messages: messagesToSend,
              userId: TEST_USER_ID,
              userContext: context,
              imageBase64: filesToSend.length > 0 ? filesToSend[0].base64 : undefined,
              mimeType: filesToSend.length > 0 ? filesToSend[0].mimeType : undefined,
            }),
        }
      );

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

      if (data.tokens_used) {
        const energyCost = Math.ceil(data.tokens_used / ENERGY_CONFIG.TOKEN_DIVISOR);
        setEnergyUsed(prev => prev + energyCost);
        console.log('[ÉNERGIE] Tokens: ' + data.tokens_used + ' | Coût: ' + energyCost + ' énergie | Modèle: ' + (data.model_used || 'sonnet'));
      }

    } catch (error) {
      console.error('Erreur ALIXEN:', error);
      setLoadingSteps([]);
      setCardIsLoading(false);
      setCardMessage("Erreur réseau. Vérifiez votre connexion.");
      setCardIsUser(false);

      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: "Erreur réseau. Vérifiez votre connexion.",
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
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur scan-medical:', response.status, errorText);
        throw new Error('Erreur serveur: ' + response.status);
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
      Alert.alert(
        'Erreur d\'analyse',
        'ALIXEN n\'a pas pu analyser ce document. Vérifiez que l\'image est lisible et réessayez.\n\nDétail : ' + (error.message || 'Erreur inconnue'),
      );
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
      console.log('Erreur pickImage:', error);
    }
  };

  const takePhoto = async (context) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', 'Autorisez l\'accès à la caméra pour prendre des photos.');
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
      console.log('Erreur takePhoto:', error);
    }
  };

  const pickDocument = async (context) => {
    try {
      Alert.alert(
        'Importer un document',
        'Pour l\'instant, prenez une photo du document ou importez depuis la galerie.',
        [
          { text: 'Prendre une photo', onPress: () => takePhoto(context) },
          { text: 'Depuis la galerie', onPress: () => pickImage(context) },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.log('Erreur pickDocument:', error);
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
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
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
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
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
    Alert.alert(
      'Archiver ce médicament ?',
      '"' + medicationName + '" sera déplacé dans vos médicaments archivés. Vous pourrez toujours le consulter.',
      [
        {
          text: 'Archiver',
          onPress: async () => {
            try {
              await fetch(
                SUPABASE_URL + '/rest/v1/medications?id=eq.' + medicationId,
                {
                  method: 'PATCH',
                  headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal',
                  },
                  body: JSON.stringify({ status: 'completed' }),
                }
              );
              loadMedicalData();
            } catch (error) {
              console.error('Erreur archivage:', error);
              Alert.alert('Erreur', 'L\'archivage a échoué.');
            }
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
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
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
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
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: TEST_USER_ID,
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

      // Fermer et reset
      setShowAddMedSheet(false);
      setAddMedStep('search');
      setMedSearchQuery('');
      setMedSearchResults([]);
      setSelectedMedFromDb(null);

      // Recharger les données
      loadMedicalData();

      Alert.alert(
        'Médicament ajouté ✓',
        selectedMedFromDb.name + ' ' + newMedDosageValue + ' ' + newMedDosageUnit + ' a été ajouté à vos traitements en cours.',
      );
    } catch (error) {
      console.error('Erreur ajout médicament:', error);
      Alert.alert('Erreur', 'L\'ajout a échoué. Réessayez.');
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
      Alert.alert(
        'Recherche IA — 50 Lix',
        'ALIXEN va chercher "' + query + '" dans sa base de connaissances médicales.\n\nCoût : 50 Lix',
        [
          {
            text: 'Rechercher',
            onPress: async () => {
              try {
                setMedSearchResults([{ _loading: true, name: 'Recherche en cours...', id: 'loading' }]);

                const response = await fetch(
                  SUPABASE_URL + '/functions/v1/search-medication',
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      query: query,
                      userId: TEST_USER_ID,
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
                  Alert.alert(
                    'Non trouvé',
                    result.suggestion || 'ALIXEN n\'a pas trouvé ce médicament. Vérifiez l\'orthographe et réessayez.',
                  );
                }
              } catch (error) {
                console.error('Erreur recherche IA:', error);
                setMedSearchResults([]);
                Alert.alert('Erreur', 'La recherche IA a échoué. Vérifiez votre connexion.');
              }
            },
          },
          { text: 'Annuler', style: 'cancel', onPress: () => setMedSearchResults([]) },
        ]
      );
    } catch (error) {
      console.error('Erreur searchMedicationAI:', error);
    }
  };

  const confirmAddAnalysis = async () => {
    if (!newAnalysisLabel.trim()) {
      Alert.alert('Champ requis', 'Veuillez entrer le type d\'analyse.');
      return;
    }
    if (!newAnalysisDate.trim()) {
      Alert.alert('Champ requis', 'Veuillez entrer la date prévue (format : JJ/MM/AAAA).');
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
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          user_id: TEST_USER_ID,
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

      loadMedicalData();

      Alert.alert('Analyse planifiée ✓', newAnalysisLabel.trim() + ' a été ajoutée à vos analyses à venir.');
    } catch (error) {
      console.error('Erreur ajout analyse:', error);
      Alert.alert('Erreur', 'L\'ajout a échoué. Réessayez.');
    }
  };

  const handleTransferToSecretPocket = (tableName, rowIndex, rowData) => {
    const itemName = typeof rowData[0] === 'object' ? rowData[0].text : rowData[0];

    Alert.alert(
      'Transférer vers Secret Pocket',
      '"' + itemName + '" sera déplacé dans votre coffre-fort sécurisé et supprimé de MediBook.\n\nContinuer ?',
      [
        {
          text: 'Transférer',
          onPress: async () => {
            try {
              let sourceArray;
              let itemId;

              if (tableName === 'analyses') {
                sourceArray = medicalData.analyses;
                itemId = sourceArray[rowIndex]?.id;
              } else if (tableName === 'medications') {
                sourceArray = medicalData.medications;
                itemId = sourceArray[rowIndex]?.id;
              } else if (tableName === 'allergies') {
                sourceArray = medicalData.allergies;
                itemId = sourceArray[rowIndex]?.id;
              } else if (tableName === 'vaccinations') {
                sourceArray = medicalData.vaccinations;
                itemId = sourceArray[rowIndex]?.id;
              }

              if (!itemId) {
                console.log('Transfert simulé pour:', tableName, rowIndex);
                Alert.alert('Transféré ✓', '"' + itemName + '" a été déplacé dans votre Secret Pocket.');
                return;
              }

              // Pour l'instant, on supprime de la vue locale
              // TODO: Quand le champ is_secret sera ajouté dans Supabase, marquer l'élément comme secret au lieu de le supprimer
              setMedicalData(prev => ({
                ...prev,
                [tableName]: prev[tableName].filter((_, i) => i !== rowIndex),
              }));

              Alert.alert('Transféré ✓', '"' + itemName + '" a été déplacé dans votre Secret Pocket.');

            } catch (error) {
              console.error('Erreur transfert:', error);
              Alert.alert('Erreur', 'Le transfert a échoué.');
            }
          },
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };



  // ── RENDER CONTENT (conditionnel) ─────────────────────────────────────
  const renderContent = () => {
    if (currentSubPage === 'medibook' || uploadState === 'scanning' || uploadState === 'results' || uploadState === 'integrating') {
      return (
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
          handleTransferToSecretPocket={handleTransferToSecretPocket}
          toggleMedicationReminder={toggleMedicationReminder}
          toggleMedicationTaken={toggleMedicationTaken}
          isTakenAtTime={isTakenAtTime}
          archiveMedication={archiveMedication}
          showAddMedSheet={showAddMedSheet} setShowAddMedSheet={setShowAddMedSheet}
          showAddAnalysisSheet={showAddAnalysisSheet} setShowAddAnalysisSheet={setShowAddAnalysisSheet}
          mbGenerateScale={mbGenerateScale}
        />
      );
    }
    if (currentSubPage === 'secretpocket') {
      return <SecretPocketContent isUnlocked={isUnlocked} setIsUnlocked={setIsUnlocked} setCurrentSubPage={setCurrentSubPage} />;
    }
    return renderMain();
  };

  const renderMain = () => (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="dark-content" />

      {/* ===== HEADER — MedicAi sobre sur fond clair ===== */}
      <View style={{
        backgroundColor: '#F4F6F8',
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingBottom: 6,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
      }}>
        <View>
          <Text style={{ color: '#1A2030', fontSize: 22, fontWeight: 'bold' }}>MedicAi</Text>
          <Text style={{ color: 'rgba(0,150,120,0.45)', fontSize: 7, letterSpacing: 2 }}>ESPACE SANTÉ INTELLIGENT</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {energyLeft > 0 ? (
            <View style={{
              backgroundColor: 'rgba(0,180,130,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(0,180,130,0.2)',
              borderRadius: 14,
              paddingHorizontal: 8,
              paddingVertical: 3,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
              <Svg width={wp(10)} height={wp(10)} viewBox="0 0 24 24" fill="#00D984">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </Svg>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00D984' }} />
              <Text style={{ color: '#00A878', fontSize: 10 }}>En ligne</Text>
            </View>
          ) : (
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: wp(12), paddingHorizontal: wp(10), paddingVertical: wp(4),
              borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)',
              backgroundColor: 'rgba(255,107,107,0.08)',
              gap: 4,
            }}>
              <Svg width={wp(10)} height={wp(10)} viewBox="0 0 24 24" fill="#FF6B6B">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </Svg>
              <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), backgroundColor: '#FF6B6B' }} />
              <Text style={{ fontSize: fp(11), fontWeight: '600', color: '#FF6B6B' }}>Hors énergie</Text>
            </View>
          )}
          <Text style={{
            fontSize: fp(9),
            fontWeight: '600',
            color: energyPercent <= 15 ? 'rgba(255,107,107,0.6)' : energyPercent <= 40 ? 'rgba(255,140,66,0.5)' : 'rgba(0,217,132,0.4)',
            marginTop: wp(2),
          }}>
            {energyLeft > 0 ? energyLeft + ' énergie' : 'Énergie épuisée'}
          </Text>
          <Text style={{
            fontSize: fp(9),
            fontWeight: '600',
            color: 'rgba(0,217,132,0.4)',
            letterSpacing: 1.5,
            marginTop: wp(3),
          }}>LXM-2K7F4A</Text>
        </View>
      </View>

      {/* ===== ZONE DE CONTENU ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 10, paddingTop: 0 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image docteur */}
          <DoctorHeader />

          {/* Cartes MetalCard LIXUM — MediBook / SecretPocket */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: wp(12),
            paddingHorizontal: wp(24),
            marginTop: 8,
            marginBottom: wp(14),
          }}>
            <MetalCard
              title="MediBook"
              iconElement={
                <Svg width={wp(30)} height={wp(30)} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="2" width="14" height="20" rx="2" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                  <Line x1="7" y1="8" x2="13" y2="8" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="7" y1="12" x2="13" y2="12" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="7" y1="16" x2="11" y2="16" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="21" y1="2" x2="21" y2="6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="19" y1="4" x2="23" y2="4" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                </Svg>
              }
              onPress={() => setCurrentSubPage('medibook')}
            />
            <MetalCard
              title="Secret Pocket"
              titleColor="#D4AF37"
              iconElement={
                <Svg width={wp(30)} height={wp(30)} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                  <Rect x="9" y="10" width="6" height="5" rx="1" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                  <Path d="M10 10V8a2 2 0 014 0v2" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </Svg>
              }
              onPress={() => setCurrentSubPage('secretpocket')}
            />
          </View>

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
              onNewSession={() => setShowNewSessionSheet(true)}
            />
          </Animated.View>

          {/* Carte de réponse */}
          <ResponseCard
            currentMessage={cardMessage}
            isLoading={cardIsLoading}
            isUserMessage={cardIsUser}
            onQuickReply={handleQuickReply}
            onPreciserPress={handlePreciserPress}
            loadingSteps={loadingSteps}
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
              placeholder="Rechercher dans les messages..."
              placeholderTextColor="rgba(0,0,0,0.2)"
              value={searchQuery}
              onChangeText={handleSearch}
            />

            {/* Bouton fermer X */}
            <TouchableOpacity
              onPress={() => {
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
            marginBottom: wp(12),
            borderRadius: wp(28),
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            position: 'relative',
          }}>
            {/* Barre de progression — couleur évolue selon le remplissage */}
            <View style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: `${Math.min((energyUsed / energyLimit) * 100, 100)}%`,
              backgroundColor: getProgressColor(),
              borderTopLeftRadius: wp(28),
              borderBottomLeftRadius: wp(28),
            }}/>

            {/* Fichiers en attente */}
            <FileQueuePreview
              files={fileQueue}
              onRemove={(id) => setFileQueue(prev => prev.filter(f => f.id !== id))}
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
                onPress={() => setShowDocumentSheet(true)}
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
                onPress={() => setSearchVisible(!searchVisible)}
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
                  placeholder="Votre message"
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  selectionColor="#00A878"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  blurOnSubmit={false}
                  editable={!isLocked}
                />
              </View>

              {/* Bouton Envoyer / X rouge si énergie vide */}
              {isLocked ? (
                <Pressable
                  delayPressIn={120}
                  onPress={() => setShowRechargeSheet(true)}
                  style={({ pressed }) => ({
                    width: wp(38), height: wp(38), borderRadius: wp(19),
                    backgroundColor: 'rgba(255,107,107,0.15)',
                    borderWidth: 1.5, borderColor: '#FF6B6B',
                    justifyContent: 'center', alignItems: 'center',
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  })}
                >
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                    <Line x1="18" y1="6" x2="6" y2="18" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round"/>
                    <Line x1="6" y1="6" x2="18" y2="18" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round"/>
                  </Svg>
                </Pressable>
              ) : (
                <TouchableOpacity
                  onPress={() => { if (inputText.trim() || fileQueue.length > 0) sendMessage(); }}
                  disabled={!inputText.trim() && fileQueue.length === 0}
                  style={{
                    width: 38, height: 38, borderRadius: 19,
                    backgroundColor: '#FFFFFF',
                    justifyContent: 'center', alignItems: 'center',
                    shadowColor: 'rgba(0,0,0,0.15)',
                    shadowOffset: { width: 3, height: 3 },
                    shadowOpacity: 0.5, shadowRadius: 5, elevation: 5,
                    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
                  }}
                >
                  <Text style={{
                    color: (inputText.trim() || fileQueue.length > 0) ? '#00D984' : 'rgba(0,0,0,0.12)',
                    fontSize: 15, fontWeight: 'bold',
                  }}>{'➤'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* ===== BOTTOM TAB BAR ===== */}
      {!keyboardVisible && (
        <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
      )}

      {/* === MODAL MESSAGE COMPLET === */}
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
            borderColor: selectedMessage.role === 'assistant'
              ? 'rgba(210,80,80,0.15)' : 'rgba(70,140,220,0.15)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectedMessage.role === 'assistant' ? (
                  <>
                    <Image source={require('../assets/lixman-avatar.png')}
                      style={{ width: 22, height: 22, borderRadius: 11, marginRight: 8, borderWidth: 1, borderColor: '#D06060' }}
                      resizeMode="cover" />
                    <Text style={{ color: '#D06060', fontSize: 12, fontWeight: 'bold' }}>ALIXEN</Text>
                  </>
                ) : (
                  <Text style={{ color: '#4A8CDC', fontSize: 12, fontWeight: 'bold' }}>👤 Vous</Text>
                )}
                <Text style={{ color: 'rgba(0,0,0,0.2)', fontSize: 9, marginLeft: 8 }}>#{selectedMessage.index + 1}</Text>
              </View>
              <TouchableOpacity onPress={closeModal}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: 10 }}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Contenu scrollable avec surlignage et navigation */}
            <ModalScrollContent selectedMessage={selectedMessage} closeModal={closeModal} handleRecipePress={handleRecipePress} searchTerm={searchQuery} onQuickReply={(text) => { closeModal(); setTimeout(() => handleQuickReply(text), 300); }} onPreciserPress={() => { closeModal(); setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 300); }} />

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
              {energyUsed} énergie consommée sur {energyLimit}
            </Text>
            <Text style={{ color: '#AAA', fontSize: 10, textAlign: 'center', marginBottom: 16, lineHeight: 16 }}>
              Rechargez pour continuer à consulter ALIXEN.
            </Text>

            {/* Option 1 : Recharger 100 Lix */}
            <TouchableOpacity
              onPress={() => {
                setEnergyUsed(prev => Math.max(0, prev - ENERGY_CONFIG.ENERGY_PER_RECHARGE));
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
                setEnergyUsed(prev => Math.max(0, prev - 50));
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
                source={require('../assets/lixman-avatar.png')}
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
  );


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
        showCompactConfirm={showCompactConfirm} setShowCompactConfirm={setShowCompactConfirm}
        showRechargeSheet={showRechargeSheet} setShowRechargeSheet={setShowRechargeSheet}
        setEnergyUsed={setEnergyUsed}
        showProfileSwitcher={showProfileSwitcher} setShowProfileSwitcher={setShowProfileSwitcher}
        activeProfile={activeProfile} setActiveProfile={setActiveProfile}
        children={children} setChildren={setChildren}
        editingChildId={editingChildId} setEditingChildId={setEditingChildId}
        newChildIsFree={newChildIsFree} setNewChildIsFree={setNewChildIsFree}
        showChildNameInput={showChildNameInput} setShowChildNameInput={setShowChildNameInput}
        newChildName={newChildName} setNewChildName={setNewChildName}
        showCarnetPageSheet={showCarnetPageSheet} setShowCarnetPageSheet={setShowCarnetPageSheet}
        selectedCarnetPage={selectedCarnetPage}
        carnetPhotos={carnetPhotos} setCarnetPhotos={setCarnetPhotos}
        showAnalyzeSheet={showAnalyzeSheet} setShowAnalyzeSheet={setShowAnalyzeSheet}
        startMedicalScan={startMedicalScan}
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
      />
    </View>
  );
}
