import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, TouchableOpacity,
  Animated, Platform, Dimensions, Alert, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line, Circle, Rect, Ellipse, Defs, Mask,
  LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import { MOCK_FREQUENT, MOCK_RECIPES, getFlag } from './repasConstants';

// Composants partagés
import BottomTabs, { AvatarButton } from '../../components/shared/NavBar';
import CircuitPattern from '../../components/shared/CircuitPattern';
import PageHeader from '../../components/shared/PageHeader';

// Composants Repas
import MealDayCard from '../../components/repas/MealDayCard';
import AddMealModal from '../../components/repas/AddMealModal';

// Sous-écrans Repas
import XscanScreen from './XscanScreen';
import ManualEntryScreen from './ManualEntryScreen';
import CartScanScreen from './CartScanScreen';
import RecettesScreen from './RecettesScreen';
import CookingModeScreen from './CookingModeScreen';
import { useAuth } from '../../config/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const W = Dimensions.get('window').width;
const BASE_WIDTH = 320;
const MEAL_CARD_WIDTH = wp(160);

// SectionTitle — composant local (sans barre verte, le borderLeft du container parent fait office)
const SectionTitle = ({ title, rightAction, rightLabel }) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  }}>
    <Text style={{
      color: '#FFFFFF',
      fontSize: fp(16),
      fontWeight: '900',
      letterSpacing: 1,
      textTransform: 'uppercase',
    }}>
      {title}
    </Text>
    {rightLabel && (
      <Pressable onPressIn={rightAction}>
        <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>
          {rightLabel}
        </Text>
      </Pressable>
    )}
  </View>
);

export default function RepasPage({ navigation }) {
  var _lc = useLang(); var lang = _lc.lang;
  var auth = useAuth(); var userId = auth.userId;
  var lixBalance = auth.lixBalance; var updateLixBalance = auth.updateLixBalance;
  var userEnergy = auth.energy; var refreshLixFromServer = auth.refreshLixFromServer;

  // === DONNÉES SUPABASE ===
  const [dailySummary, setDailySummary] = useState({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    meals_count: 0,
  });
  const [userProfile, setUserProfile] = useState({
    daily_calorie_target: 2330,
  });
  const [todayMeals, setTodayMeals] = useState([]);
  const [frequentMeals, setFrequentMeals] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Système pouvoirs caractères
  const [activeChar, setActiveChar] = useState(null);
  const [pagePowers, setPagePowers] = useState([]);
  const [toggleStates, setToggleStates] = useState({});

  // Fonctionnalités spécifiques
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionMeal, setSuggestionMeal] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [todaySubstitutions, setTodaySubstitutions] = useState(0);
  const [userNameAvatar, setUserNameAvatar] = useState('');
  const [activeCharAvatar, setActiveCharAvatar] = useState(null);
  // Mood × Météo
  const [userMood, setUserMood] = useState(null);
  const [userWeather, setUserWeather] = useState(null);

  // === ÉTATS UI ===
  const [activeTab, setActiveTab] = useState('meals');

  // Sous-écrans
  const [showXscan, setShowXscan] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showCartScan, setShowCartScan] = useState(false);
  const [showRecettes, setShowRecettes] = useState(false);
  var recettesInitialTab = useRef('general');
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState(null);

  // AddMealModal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalSlot, setAddModalSlot] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);

  // Animated flux lines for XSCAN
  var fluxAnim = useRef(new Animated.Value(0)).current;
  useEffect(function() {
    Animated.loop(Animated.timing(fluxAnim, { toValue: 1, duration: 1500, easing: require('react-native').Easing.linear, useNativeDriver: true })).start();
  }, []);

  // Bouton X animations
  const [isXPressed, setIsXPressed] = useState(false);
  const glowIntensity = useRef(new Animated.Value(0)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;
  const [showRings, setShowRings] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Ref XscanScreen
  const xscanRef = useRef(null);



  // === FONCTIONS ===

  const loadDashboardData = async () => {
    if (!userId) return;
    setIsLoadingData(true);
    try {
      const { data: profile } = await supabase
        .from('users_profile')
        .select('daily_calorie_target, lix_balance')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setUserProfile({ daily_calorie_target: profile.daily_calorie_target || 2330 });
        updateLixBalance(profile.lix_balance || 0);
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: summary } = await supabase
        .from('daily_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (summary) {
        setDailySummary({
          total_calories: summary.total_calories || 0,
          total_protein: Math.round((summary.total_protein || 0) * 10) / 10,
          total_carbs: Math.round((summary.total_carbs || 0) * 10) / 10,
          total_fat: Math.round((summary.total_fat || 0) * 10) / 10,
          meals_count: summary.meals_count || 0,
        });
      }

      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .order('meal_time', { ascending: true });

      if (meals) {
        setTodayMeals(meals);
      }

      const { data: frequent } = await supabase
        .from('meals')
        .select('food_name, calories')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (frequent && frequent.length > 0) {
        const countMap = {};
        frequent.forEach(m => {
          if (!countMap[m.food_name]) {
            countMap[m.food_name] = { name: m.food_name, cal: m.calories, count: 0 };
          }
          countMap[m.food_name].count++;
        });
        const sorted = Object.values(countMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setFrequentMeals(sorted);
      }

    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
    setIsLoadingData(false);
  };

  const REPAS_PAGE = 'repas';

  const loadPagePowers = async () => {
    if (!userId) return;
    try {
      const { data: collection } = await supabase
        .rpc('get_user_collection', { p_user_id: userId });
      const active = (collection || []).find(c => c.is_active);
      if (!active) { setActiveChar(null); setPagePowers([]); return; }
      setActiveChar(active);

      const { data: powers } = await supabase
        .rpc('get_character_powers', {
          p_user_id: userId,
          p_slug: active.slug,
        });
      setPagePowers((powers || []).filter(p => p.redirect_page === REPAS_PAGE));
    } catch (e) {
      console.warn('Repas powers load error:', e);
    }
  };

  useEffect(() => {
    if (userId) {
      loadDashboardData();
      loadPagePowers();
      (async () => {
        try {
          const { data: profile } = await supabase.from('users_profile').select('full_name').eq('user_id', userId).maybeSingle();
          if (profile) setUserNameAvatar(profile.full_name || '');
          const { data: chars } = await supabase.from('lixverse_user_characters').select('character_slug').eq('user_id', userId).eq('is_active', true).maybeSingle();
          if (chars) setActiveCharAvatar({ slug: chars.character_slug });
        } catch (e) {}
      })();
    }
  }, [userId]);

  // Refresh Lix balance when page gains focus
  useFocusEffect(useCallback(function() {
    if (userId) refreshLixFromServer();
  }, [userId, refreshLixFromServer]));

  useEffect(() => {
    const fetchMoodWeather = async () => {
      try {
        const { data } = await supabase
          .from('users_profile')
          .select('current_mood, current_weather')
          .eq('user_id', userId)
          .maybeSingle();
        if (data) {
          setUserMood(data.current_mood);
          setUserWeather(data.current_weather);
        }
      } catch (e) {
        console.warn('Mood fetch error:', e);
      }
    };
    if (userId) fetchMoodWeather();
  }, [userId]);

  // === FONCTIONS POUVOIRS ===

  const consumePower = async (powerKey) => {
    try {
      const { data } = await supabase.rpc('use_character_power', {
        p_user_id: userId,
        p_power_key: powerKey,
      });
      if (data?.success) {
        setActiveChar(prev => prev ? { ...prev, uses_remaining: data.uses_remaining } : null);
        return { success: true, uses_remaining: data.uses_remaining };
      }
      if (data?.error === 'No uses remaining') {
        Alert.alert('⚡ Utilisations épuisées',
          'Recharge ton ' + (activeChar?.name || 'personnage') + ' dans l\'onglet Caractères.');
      }
      return { success: false, error: data?.error };
    } catch (e) {
      console.error('Consume power error:', e);
      return { success: false, error: 'network' };
    }
  };

  const isPowerAvailable = (powerKey) => {
    const power = pagePowers.find(p => p.power_key === powerKey);
    return power?.unlocked === true;
  };

  const powerConsumesUse = (powerKey) => {
    const FREE_POWERS = [
      'owl_resume_macros',
      'owl_alerte_macros',
      'fox_mode_regime',
    ];
    return !FREE_POWERS.includes(powerKey);
  };

  const handleInlinePower = (power) => {
    switch (power.power_key) {
      case 'owl_resume_macros':
        setShowResumeModal(true);
        break;
      case 'hawk_micronutriments':
        Alert.alert('🔬 Micronutriments', 'Disponible après votre prochain scan Xscan.');
        break;
      case 'fox_sub_1':
      case 'fox_sub_2':
      case 'fox_sub_3':
        setTodaySubstitutions(prev => prev + 1);
        Alert.alert('🦊 Substitution', 'Tap sur un ingrédient pour voir des alternatives.');
        break;
      case 'gipsy_correlation_1':
      case 'gipsy_correlation_2':
        Alert.alert('🕷️ Corrélation', 'Graphique corrélation humeur-nutrition en cours de développement.');
        break;
      default:
        Alert.alert(power.name_fr || power.power_key, power.description_fr || '');
    }
  };

  const handleRedirectPower = (power) => {
    switch (power.power_key) {
      case 'owl_suggestion_repas':
        handleSuggestionRepas();
        break;
      case 'hawk_comparateur':
        Alert.alert('⚖️ Comparateur', 'Sélectionnez 2 scans à comparer. (À venir)');
        break;
      case 'hawk_historique':
        Alert.alert('📈 Historique', 'Historique de vos 30 derniers scans. (À venir)');
        break;
      case 'gipsy_toile_sante':
        Alert.alert('🕸️ Toile de Santé', 'Rapport mensuel croisé en cours de développement.');
        break;
      default:
        Alert.alert(power.name_fr || power.power_key, power.description_fr || '');
    }
  };

  const handleSuggestionRepas = async () => {
    setLoadingSuggestion(true);
    try {
      const protTarget = Math.round((userProfile.daily_calorie_target * 0.25) / 4);
      const protMissing = Math.max(0, protTarget - dailySummary.total_protein);

      const { data: meals } = await supabase
        .from('meals_master')
        .select('*')
        .gte('protein_per_100g', protMissing / 3)
        .order('protein_per_100g', { ascending: false })
        .limit(5);

      if (meals && meals.length > 0) {
        const random = meals[Math.floor(Math.random() * meals.length)];
        setSuggestionMeal(random);
        setShowSuggestionModal(true);
      } else {
        Alert.alert('🍽️ Suggestion', 'Aucun plat trouvé pour compléter vos macros.');
      }
    } catch (e) {
      console.error('Suggestion error:', e);
    }
    setLoadingSuggestion(false);
  };

  // === FONCTIONS UI ===

  const handleTabPress = (key) => {
    if (key === 'meals') return;
    const routes = { home: 'Accueil', meals: 'Repas', medicai: 'MedicAi', activity: 'Activite', lixverse: 'LixVerse' };
    if (routes[key] && navigation) navigation.navigate(routes[key]);
  };

  const activateScan = () => {
    setShowRings(true);
    ring1Anim.setValue(0);
    ring2Anim.setValue(0);
    ring3Anim.setValue(0);

    Animated.stagger(200, [
      Animated.timing(ring1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(ring2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(ring3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setShowRings(false);
      ring1Anim.setValue(0);
      ring2Anim.setValue(0);
      ring3Anim.setValue(0);
      setShowXscan(true);
      if (xscanRef.current?.openCamera) xscanRef.current.openCamera();
    });
  };

  // Animation glow pulsant pour Xscan
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const calPercent = userProfile.daily_calorie_target > 0
    ? Math.round((dailySummary.total_calories / userProfile.daily_calorie_target) * 100)
    : 0;

  // === JSX ===

  return (
    <LinearGradient
      colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 55 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* ═══ 1. HEADER ═══ */}
          <PageHeader
            title="MES REPAS"
            lixBalance={lixBalance}
            userEnergy={userEnergy}
            onLixPress={function() { if (navigation) navigation.navigate('LixVerse'); }}
            onProfilePress={function() { if (navigation) navigation.navigate('Profile'); }}
          />

          {/* ═══ 2. RÉSUMÉ CALORIES ═══ */}
          <View style={{ marginHorizontal: wp(16), marginTop: wp(12) }}>
            <View style={{
              borderRadius: 16, borderWidth: 1.5,
              borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D',
              borderRightColor: '#3E4855', borderBottomColor: '#2A303B',
              backgroundColor: '#2A303B', elevation: 8,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4, shadowRadius: 8,
            }}>
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{ borderRadius: 14 }}
              >
                <View style={{ padding: wp(16) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Svg width={20} height={20} viewBox="0 0 20 20" style={{ marginRight: 6, top: 2 }}>
                        <Path d="M10 1C10 1 4 7 4 12C4 15.3 6.7 18 10 18C13.3 18 16 15.3 16 12C16 7 10 1 10 1Z" fill="#FF8C42" opacity={0.85}/>
                        <Path d="M10 6C10 6 7 9.5 7 12C7 13.7 8.3 15 10 15C11.7 15 13 13.7 13 12C13 9.5 10 6 10 6Z" fill="#FFB74D" opacity={0.7}/>
                      </Svg>
                      <Text style={{ color: '#FF8C42', fontSize: fp(26), fontWeight: '900' }}>
                        {dailySummary.total_calories.toLocaleString('fr-FR')}
                      </Text>
                      <Text style={{ color: '#5A6070', fontSize: fp(14), marginLeft: 4 }}>
                        / {userProfile.daily_calorie_target.toLocaleString('fr-FR')} kcal
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(255,140,66,0.12)',
                      paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                    }}>
                      <Text style={{ color: '#FF8C42', fontSize: fp(12), fontWeight: '800' }}>{calPercent}%</Text>
                    </View>
                  </View>

                  <View style={{
                    height: 7, backgroundColor: 'rgba(255,140,66,0.08)',
                    borderRadius: 4, marginTop: wp(10), overflow: 'hidden',
                  }}>
                    <LinearGradient
                      colors={['#FF8C42', '#FFB74D']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={{ height: '100%', width: `${Math.min(calPercent, 100)}%`, borderRadius: 4 }}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', marginTop: wp(12), gap: wp(8) }}>
                    {[
                      { value: `${dailySummary.total_protein}g`, color: '#FF6B6B', label: lang === 'fr' ? 'Protéines' : 'Protein' },
                      { value: `${dailySummary.total_carbs}g`, color: '#FFD93D', label: lang === 'fr' ? 'Glucides' : 'Carbs' },
                      { value: `${dailySummary.total_fat}g`, color: '#4DA6FF', label: lang === 'fr' ? 'Lipides' : 'Fat' },
                    ].map((m, i) => (
                      <View key={i} style={{
                        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: 10, paddingVertical: wp(8), alignItems: 'center',
                        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                      }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color, marginBottom: 4 }}/>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700' }}>{m.value}</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8), marginTop: 2 }}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* ═══ BANDEAU PERSONNAGE ACTIF ═══ */}
          {activeChar && (
            <View style={{
              marginHorizontal: wp(16), marginTop: wp(8),
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(0,217,132,0.04)',
              borderRadius: wp(12), padding: wp(10),
              borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)',
            }}>
              <View style={{
                width: wp(32), height: wp(32), borderRadius: wp(16),
                backgroundColor: 'rgba(0,217,132,0.1)',
                justifyContent: 'center', alignItems: 'center',
                marginRight: wp(10), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
              }}>
                <Text style={{ fontSize: fp(16) }}>
                  {activeChar.slug === 'emerald_owl' ? '🦉' :
                   activeChar.slug === 'hawk_eye' ? '🦅' :
                   activeChar.slug === 'ruby_tiger' ? '🐯' :
                   activeChar.slug === 'amber_fox' ? '🦊' :
                   activeChar.slug === 'gipsy' ? '🕷️' : '🎭'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '700' }}>
                  {activeChar.name}
                </Text>
                <Text style={{ color: '#5A6070', fontSize: fp(8) }}>
                  {activeChar.uses_remaining}/{activeChar.max_uses_per_cycle || 10} utilisations
                </Text>
              </View>
              <Text style={{ color: '#00D984', fontSize: fp(9) }}>ACTIF ✅</Text>
            </View>
          )}

          {/* ═══ 3. CARTE XSCAN ═══ */}
          <View style={{ marginHorizontal: wp(16), marginTop: 16 }}>
            <View style={{
              borderRadius: 16, borderWidth: 1.5,
              borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D',
              borderRightColor: '#3E4855', borderBottomColor: '#2A303B',
              backgroundColor: '#2A303B', elevation: 12,
              shadowColor: '#00D984', shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15, shadowRadius: 12,
            }}>
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{ borderRadius: 17, padding: wp(12) }}
              >
                <View style={{
                  position: 'absolute', top: 0, left: 20, right: 20,
                  height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
                }}/>

                <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: wp(6) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ color: '#00D984', fontSize: fp(22), fontWeight: '900', letterSpacing: 1 }}>X</Text>
                    <Text style={{ color: '#EAEEF3', fontSize: fp(22), fontWeight: '900', letterSpacing: 1 }}>SCAN</Text>
                  </View>
                  <Text style={{ color: '#8892A0', fontSize: fp(11) }}>
                    {lang === 'fr' ? 'Scanner votre repas' : 'Scan your meal'}
                  </Text>
                </View>

                <View style={{ alignItems: 'center', marginBottom: wp(6) }}>
                  <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                    {/* Left flux chevrons — 3 groupes pointant vers le X */}
                    <View style={{ width: wp(80), height: wp(65), justifyContent: 'center', marginRight: wp(10) }}>
                      {/* Base lines gris */}
                      <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70" style={{ position: 'absolute' }}>
                        {/* Groupe 1 */}
                        <Line x1="0" y1="10" x2="45" y2="10" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="0" y1="35" x2="60" y2="35" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="0" y1="60" x2="45" y2="60" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        {/* Groupe 2 */}
                        <Line x1="75" y1="10" x2="120" y2="10" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="75" y1="35" x2="135" y2="35" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="75" y1="60" x2="120" y2="60" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        {/* Groupe 3 */}
                        <Line x1="150" y1="10" x2="195" y2="10" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="150" y1="35" x2="210" y2="35" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="150" y1="60" x2="195" y2="60" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                      </Svg>
                      {/* G1 top */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.02, 0.08, 0.14, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="0" y1="10" x2="45" y2="10" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G1 mid */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.11, 0.17, 0.23, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="0" y1="35" x2="60" y2="35" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G1 bot */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.20, 0.26, 0.32, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="0" y1="60" x2="45" y2="60" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G2 top */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.29, 0.35, 0.41, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="75" y1="10" x2="120" y2="10" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G2 mid */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.38, 0.44, 0.50, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="75" y1="35" x2="135" y2="35" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G2 bot */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.47, 0.53, 0.59, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="75" y1="60" x2="120" y2="60" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G3 top */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.56, 0.62, 0.68, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="150" y1="10" x2="195" y2="10" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G3 mid */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.65, 0.71, 0.77, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="150" y1="35" x2="210" y2="35" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G3 bot */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.74, 0.80, 0.86, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="150" y1="60" x2="195" y2="60" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    {showRings && (
                      <>
                        <Animated.View style={{
                          position: 'absolute',
                          width: wp(58), height: wp(58), borderRadius: wp(29),
                          borderWidth: 2, borderColor: '#00D984',
                          opacity: ring1Anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.9, 0.5, 0.1] }),
                          transform: [{ scale: ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
                        }}/>
                        <Animated.View style={{
                          position: 'absolute',
                          width: wp(68), height: wp(68), borderRadius: wp(34),
                          borderWidth: 1.5, borderColor: '#00D984',
                          opacity: ring2Anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.8, 0.3, 0.05] }),
                          transform: [{ scale: ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }],
                        }}/>
                        <Animated.View style={{
                          position: 'absolute',
                          width: wp(80), height: wp(80), borderRadius: wp(40),
                          borderWidth: 1, borderColor: '#00D984',
                          opacity: ring3Anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.6, 0.2, 0] }),
                          transform: [{ scale: ring3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
                        }}/>
                      </>
                    )}

                    <View
                      style={{
                        width: wp(75), height: wp(75), borderRadius: wp(37.5),
                        backgroundColor: '#22272E',
                        borderWidth: 1.5, borderColor: '#3A3F46',
                        justifyContent: 'center', alignItems: 'center',
                        overflow: 'hidden',
                        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.5, shadowRadius: 6, elevation: 2,
                      }}
                    >
                      <View style={{
                        width: wp(65), height: wp(65), borderRadius: wp(32.5),
                        backgroundColor: '#1A1F26',
                        borderWidth: 1, borderColor: '#2E333A',
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        <View style={{
                          width: wp(58), height: wp(58), borderRadius: wp(29),
                          backgroundColor: 'transparent',
                          justifyContent: 'center', alignItems: 'center',
                        }}>
                          <View style={{
                            width: wp(52), height: wp(52), borderRadius: wp(26),
                            backgroundColor: isXPressed ? '#162A1E' : '#14181E',
                            borderWidth: 1,
                            borderColor: isXPressed ? 'rgba(0,217,132,0.2)' : '#1E2228',
                            justifyContent: 'center', alignItems: 'center',
                            shadowColor: '#00D984',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: isXPressed ? 0.6 : 0,
                            shadowRadius: isXPressed ? 20 : 0,
                            elevation: isXPressed ? 8 : 0,
                          }}>
                            <Pressable
                              onPressIn={() => {
                                setIsXPressed(true);
                                Animated.timing(glowIntensity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
                              }}
                              onPressOut={() => {
                                setIsXPressed(false);
                                Animated.timing(glowIntensity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
                              }}
                              onPress={activateScan}
                              style={({ pressed }) => ({
                                width: wp(44), height: wp(44), borderRadius: wp(22),
                                backgroundColor: pressed ? '#1E2530' : '#2A2F38',
                                borderWidth: 1.5, borderColor: '#2A2F36',
                                justifyContent: 'center', alignItems: 'center',
                                elevation: pressed ? 2 : 10,
                                transform: [{ scale: pressed ? 0.94 : 1 }],
                              })}
                            >
                              <Svg width={wp(26)} height={wp(26)} viewBox="0 0 40 40">
                                <Line x1="7" y1="7" x2="33" y2="33" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/>
                                <Line x1="33" y1="7" x2="7" y2="33" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/>
                                <Circle cx="20" cy="20" r="3" fill="#00D984" opacity={0.3}/>
                                <Circle cx="20" cy="20" r="1.5" fill="#00D984" opacity={0.7}/>
                                <Circle cx="7" cy="7" r="3" fill="none" stroke="#00D984" strokeWidth={1.2} opacity={0.3}/>
                                <Circle cx="33" cy="7" r="3" fill="none" stroke="#00D984" strokeWidth={1.2} opacity={0.3}/>
                                <Circle cx="7" cy="33" r="3" fill="none" stroke="#00D984" strokeWidth={1.2} opacity={0.3}/>
                                <Circle cx="33" cy="33" r="3" fill="none" stroke="#00D984" strokeWidth={1.2} opacity={0.3}/>
                              </Svg>
                            </Pressable>
                          </View>
                        </View>
                      </View>
                    </View>
                    </View>

                    {/* Right flux chevrons — miroir, pointant vers le X */}
                    <View style={{ width: wp(80), height: wp(65), justifyContent: 'center', marginLeft: wp(10) }}>
                      {/* Base lines gris */}
                      <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70" style={{ position: 'absolute' }}>
                        {/* Groupe 1 (le plus éloigné, à droite) */}
                        <Line x1="210" y1="10" x2="165" y2="10" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="210" y1="35" x2="150" y2="35" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="210" y1="60" x2="165" y2="60" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        {/* Groupe 2 */}
                        <Line x1="135" y1="10" x2="90" y2="10" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="135" y1="35" x2="75" y2="35" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="135" y1="60" x2="90" y2="60" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        {/* Groupe 3 (le plus proche du X) */}
                        <Line x1="60" y1="10" x2="15" y2="10" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="60" y1="35" x2="0" y2="35" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                        <Line x1="60" y1="60" x2="15" y2="60" stroke="#4A4F55" strokeWidth={3} strokeLinecap="round"/>
                      </Svg>
                      {/* G1 top */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.02, 0.08, 0.14, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="210" y1="10" x2="165" y2="10" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G1 mid */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.11, 0.17, 0.23, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="210" y1="35" x2="150" y2="35" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G1 bot */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.20, 0.26, 0.32, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="210" y1="60" x2="165" y2="60" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G2 top */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.29, 0.35, 0.41, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="135" y1="10" x2="90" y2="10" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G2 mid */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.38, 0.44, 0.50, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="135" y1="35" x2="75" y2="35" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G2 bot */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.47, 0.53, 0.59, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="135" y1="60" x2="90" y2="60" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G3 top */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.56, 0.62, 0.68, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="60" y1="10" x2="15" y2="10" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G3 mid */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.65, 0.71, 0.77, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="60" y1="35" x2="0" y2="35" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                      {/* G3 bot */}
                      <Animated.View style={{ position: 'absolute', opacity: fluxAnim.interpolate({ inputRange: [0, 0.74, 0.80, 0.86, 1], outputRange: [0.15, 0.15, 1, 0.15, 0.15] }) }}>
                        <Svg width={wp(80)} height={wp(65)} viewBox="0 0 210 70"><Line x1="60" y1="60" x2="15" y2="60" stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/></Svg>
                      </Animated.View>
                    </View>
                  </View>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Pressable
                    onPress={() => { setShowXscan(true); if (xscanRef.current?.openGallery) xscanRef.current.openGallery(); }}
                    delayPressIn={120}
                    style={({ pressed }) => ({
                      flexDirection: 'row', alignItems: 'center',
                      backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.06)',
                      paddingHorizontal: wp(12), paddingVertical: wp(8),
                      borderRadius: 10, borderWidth: 1,
                      borderColor: pressed ? 'rgba(0,217,132,0.35)' : 'rgba(0,217,132,0.15)',
                    })}
                  >
                    <Svg width={16} height={16} viewBox="0 0 16 16" style={{ marginRight: 6 }}>
                      <Rect x="1" y="3" width="14" height="10" rx="2" fill="none" stroke="#00D984" strokeWidth={1.2}/>
                      <Circle cx="8" cy="8.5" r="3" fill="none" stroke="#00D984" strokeWidth={1.2}/>
                      <Circle cx="8" cy="8.5" r="1" fill="#00D984" opacity={0.5}/>
                      <Rect x="5.5" y="2" width="5" height="2" rx="1" fill="none" stroke="#00D984" strokeWidth={0.8}/>
                    </Svg>
                    <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '700' }}>
                      {lang === 'fr' ? 'Charger Photo' : 'Load Photo'}
                    </Text>
                  </Pressable>
                </View>

                {/* Dots scans */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: wp(6), gap: wp(6) }}>
                  {[0, 1, 2].map((i) => {
                    const totalScans = 1;
                    const isFilled = i < totalScans;
                    return (
                      <View key={i} style={{
                        width: wp(16), height: wp(16), borderRadius: wp(8),
                        backgroundColor: isFilled ? '#1A2E25' : '#1E2228',
                        borderWidth: 1.5, borderColor: isFilled ? '#00D984' : '#3A3F46',
                        justifyContent: 'center', alignItems: 'center',
                        shadowColor: isFilled ? '#00D984' : 'transparent',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: isFilled ? 0.4 : 0, shadowRadius: 6,
                        elevation: isFilled ? 4 : 0,
                      }}>
                        {isFilled ? (
                          <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: '#00D984' }}>
                            <View style={{ position: 'absolute', top: 1, left: 2, width: 3, height: 2, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.35)' }}/>
                          </View>
                        ) : (
                          <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: '#15191F', borderWidth: 0.5, borderColor: '#2A2F36' }}/>
                        )}
                      </View>
                    );
                  })}
                  <Text style={{ color: '#8892A0', fontSize: fp(12), fontWeight: '600', marginLeft: wp(8) }}>
                    {lang === 'fr' ? '1 Scan Restant' : '1 Scan Remaining'}
                  </Text>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.08)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: wp(6) }}>
                    <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '800', letterSpacing: 1 }}>LUCKY</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* CartScan banner — premium */}
          <View style={{ marginHorizontal: wp(16), marginTop: 20 }}>
            <TouchableOpacity
              onPress={function() { setShowCartScan(true); }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{
                  borderRadius: 16, borderWidth: 1.5, borderColor: '#4A4F55',
                  padding: wp(16), flexDirection: 'row', alignItems: 'center',
                }}
              >
                {/* Badge SMART */}
                <View style={{
                  position: 'absolute', top: wp(8), right: wp(10),
                  backgroundColor: 'rgba(0,217,132,0.15)',
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                }}>
                  <Text style={{ color: '#00D984', fontSize: fp(8), fontWeight: '800', letterSpacing: 1 }}>SMART</Text>
                </View>

                {/* Zone gauche — scanner barcode visuel */}
                <View style={{ width: wp(56), alignItems: 'center', marginRight: wp(14) }}>
                  <View style={{
                    width: wp(40), height: wp(52), borderRadius: 8,
                    borderWidth: 1.5, borderColor: '#00D984',
                    justifyContent: 'center', alignItems: 'center',
                    overflow: 'hidden',
                  }}>
                    {/* Barcode lines */}
                    <View style={{ width: '60%', height: 2, backgroundColor: '#00D984', opacity: 0.4, marginBottom: 4 }} />
                    <View style={{ width: '80%', height: 2, backgroundColor: '#00D984', opacity: 0.5, marginBottom: 4 }} />
                    <View style={{ width: '50%', height: 2, backgroundColor: '#00D984', opacity: 0.35, marginBottom: 4 }} />
                    <View style={{ width: '70%', height: 2, backgroundColor: '#00D984', opacity: 0.45 }} />
                    {/* Red scan laser line */}
                    <View style={{
                      position: 'absolute', left: -2, right: -2, top: '48%',
                      height: 2, backgroundColor: '#FF6B8A', opacity: 0.9,
                    }} />
                  </View>
                  <Text style={{ color: '#666', fontSize: fp(8), marginTop: wp(3) }}>ou photo</Text>
                </View>

                {/* Zone droite — texte */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#00D984', marginBottom: wp(3) }}>CARTSCAN</Text>
                  <Text style={{ fontSize: fp(11), color: '#EAEEF3', marginBottom: wp(2) }}>
                    Scannez vos produits en magasin
                  </Text>
                  <Text style={{ fontSize: fp(9), color: '#888' }}>
                    Code-barres ou photo · Alertes allergies en direct
                  </Text>
                </View>

                {/* Chevron */}
                <Text style={{ fontSize: fp(18), color: '#00D984', marginLeft: wp(4) }}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bouton Ajouter Manuellement — contour emerald */}
          <View style={{ marginHorizontal: wp(16), marginTop: 20 }}>
            <Pressable
              onPress={function() { setShowManualEntry(true); }}
              style={function(state) {
                return {
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  paddingVertical: wp(12), borderRadius: 12,
                  backgroundColor: 'transparent',
                  borderWidth: 1, borderColor: '#00D984',
                  opacity: state.pressed ? 0.7 : 1,
                };
              }}
            >
              <Svg width={14} height={14} viewBox="0 0 16 16" style={{ marginRight: 6 }}>
                <Path d="M12 1.5L14.5 4L5 13.5L1.5 14.5L2.5 11L12 1.5Z" fill="none" stroke="#00D984" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M10 3.5L12.5 6" stroke="#00D984" strokeWidth={1.2} strokeLinecap="round"/>
              </Svg>
              <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>
                {lang === 'fr' ? 'Ajouter Manuellement' : 'Add Manually'}
              </Text>
            </Pressable>
          </View>

          {/* ═══ 5. PLATS DU JOUR ═══ */}
          <View style={{ marginTop: 28, marginHorizontal: wp(16) }}>
          <View style={{ borderRadius: 16, borderWidth: 1.5, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D', borderRightColor: '#3E4855', borderBottomColor: '#2A303B', backgroundColor: '#2A303B' }}>
          <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{
            borderRadius: 15, padding: 16,
            borderLeftWidth: 3, borderLeftColor: '#00D984',
          }}>
            <SectionTitle title={lang === 'fr' ? 'Plat du jour' : 'Meals today'} />
            <ScrollView
              horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: wp(12) }}
              snapToInterval={MEAL_CARD_WIDTH + wp(12)}
              decelerationRate="fast"
            >
              {[
                { key: 'breakfast', icon: '☀️', label: lang === 'fr' ? 'Petit-déjeuner' : 'Breakfast' },
                { key: 'lunch', icon: '🌤️', label: lang === 'fr' ? 'Déjeuner' : 'Lunch' },
                { key: 'dinner', icon: '🌙', label: lang === 'fr' ? 'Dîner' : 'Dinner' },
                { key: 'snack', icon: '🍿', label: lang === 'fr' ? 'Snack' : 'Snack' },
              ].map((slot) => {
                const slotMeals = todayMeals.filter(m => m.meal_type === slot.key);
                const firstMeal = slotMeals.length > 0 ? slotMeals[0] : null;
                return (
                  <MealDayCard
                    key={slot.key}
                    slotKey={slot.key}
                    icon={slot.icon}
                    label={slot.label}
                    meals={slotMeals}
                    meal={firstMeal ? {
                      name: firstMeal.food_name,
                      calories: Math.round(firstMeal.calories),
                      protein: Math.round(firstMeal.protein_g || 0),
                      carbs: Math.round(firstMeal.carbs_g || 0),
                      fat: Math.round(firstMeal.fat_g || 0),
                      time: new Date(firstMeal.meal_time).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
                    } : null}
                    lang={lang}
                    onAddMeal={(slotKey) => {
                      setAddModalSlot(slotKey);
                      setShowAddModal(true);
                    }}
                  />
                );
              })}
            </ScrollView>
          </LinearGradient>
          </View>
          </View>

          {/* ═══ SECTIONS POUVOIRS CARACTÈRES ═══ */}
          {pagePowers.map(power => {
            const isUnlocked = power.unlocked;
            switch (power.action_type) {
              case 'modal_inline': {
                return (
                  <View key={power.power_key} style={{ marginTop: wp(8) }}>
                    <View style={{ marginHorizontal: wp(16), borderRadius: 16, padding: 1, backgroundColor: isUnlocked ? '#4A4F55' : 'rgba(74,79,85,0.3)' }}>
                      <LinearGradient
                        colors={isUnlocked ? ['#3A3F46', '#252A30', '#333A42', '#1A1D22'] : ['#2A2F36', '#1E2228', '#2A2F36', '#1A1D22']}
                        style={{ borderRadius: 15, padding: wp(14) }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>{power.icon || '🔮'}</Text>
                          <Text style={{ color: isUnlocked ? '#D4AF37' : '#555E6C', fontSize: fp(11), fontWeight: '700', flex: 1 }}>
                            {power.name_fr || power.power_key}
                          </Text>
                          {!isUnlocked && <Text style={{ color: '#FF6B6B', fontSize: fp(8), fontWeight: '600' }}>🔒 Niv{power.level_required}</Text>}
                        </View>
                        <Text style={{ color: isUnlocked ? '#8892A0' : '#444B55', fontSize: fp(9), marginBottom: wp(8) }}>{power.description_fr || ''}</Text>
                        {isUnlocked ? (
                          <Pressable
                            onPress={async () => { if (powerConsumesUse(power.power_key)) { const r = await consumePower(power.power_key); if (!r.success) return; } handleInlinePower(power); }}
                            style={({ pressed }) => ({ paddingVertical: wp(8), borderRadius: wp(8), backgroundColor: pressed ? 'rgba(0,217,132,0.15)' : 'rgba(0,217,132,0.08)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', alignItems: 'center' })}
                          >
                            <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '700' }}>Activer</Text>
                          </Pressable>
                        ) : (
                          <View style={{ paddingVertical: wp(8), borderRadius: wp(8), backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' }}>
                            <Text style={{ color: '#555E6C', fontSize: fp(9) }}>🔒 Débloque avec {activeChar?.name || 'personnage'} Niv{power.level_required}{power.lix_cost_non_owner > 0 ? ' ou ' + power.lix_cost_non_owner + ' Lix' : ''}</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </View>
                  </View>
                );
              }
              case 'redirect': {
                const isSuperpower = power.is_superpower;
                return (
                  <View key={power.power_key} style={{ marginTop: wp(8) }}>
                    <View style={{ marginHorizontal: wp(16), borderRadius: 16, padding: 1, backgroundColor: isUnlocked ? '#4A4F55' : 'rgba(74,79,85,0.3)' }}>
                      <LinearGradient
                        colors={isUnlocked ? ['#3A3F46', '#252A30', '#333A42', '#1A1D22'] : ['#2A2F36', '#1E2228', '#2A2F36', '#1A1D22']}
                        style={{ borderRadius: 15, padding: wp(14) }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                          <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>{power.icon || '🔮'}</Text>
                          <Text style={{ color: isUnlocked ? '#D4AF37' : '#555E6C', fontSize: fp(11), fontWeight: '700', flex: 1 }}>{power.name_fr || power.power_key}</Text>
                          {isSuperpower && isUnlocked && (
                            <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4) }}>
                              <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '800' }}>SUPERPOWER</Text>
                            </View>
                          )}
                          {!isUnlocked && <Text style={{ color: '#FF6B6B', fontSize: fp(8), fontWeight: '600' }}>🔒 Niv{power.level_required}</Text>}
                        </View>
                        <Text style={{ color: isUnlocked ? '#8892A0' : '#444B55', fontSize: fp(9), marginBottom: wp(8) }}>{power.description_fr || ''}</Text>
                        {isUnlocked ? (
                          <Pressable
                            onPress={async () => { if (powerConsumesUse(power.power_key)) { const r = await consumePower(power.power_key); if (!r.success) return; } handleRedirectPower(power); }}
                            style={({ pressed }) => ({ paddingVertical: wp(8), borderRadius: wp(8), backgroundColor: pressed ? (isSuperpower ? 'rgba(212,175,55,0.15)' : 'rgba(0,217,132,0.15)') : (isSuperpower ? 'rgba(212,175,55,0.08)' : 'rgba(0,217,132,0.08)'), borderWidth: 1, borderColor: isSuperpower ? 'rgba(212,175,55,0.2)' : 'rgba(0,217,132,0.2)', alignItems: 'center' })}
                          >
                            <Text style={{ color: isSuperpower ? '#D4AF37' : '#00D984', fontSize: fp(10), fontWeight: '700' }}>{isSuperpower ? '⭐ Activer' : 'Ouvrir →'}</Text>
                          </Pressable>
                        ) : (
                          <View style={{ paddingVertical: wp(8), borderRadius: wp(8), backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' }}>
                            <Text style={{ color: '#555E6C', fontSize: fp(9) }}>🔒 Débloque avec {activeChar?.name || 'personnage'} Niv{power.level_required}{power.lix_cost_non_owner > 0 ? ' ou ' + power.lix_cost_non_owner + ' Lix' : ''}</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </View>
                  </View>
                );
              }
              case 'toggle': {
                const isOn = toggleStates[power.power_key] || false;
                return (
                  <View key={power.power_key} style={{ marginTop: wp(8) }}>
                    <View style={{ marginHorizontal: wp(16), borderRadius: 16, padding: 1, backgroundColor: isUnlocked ? '#4A4F55' : 'rgba(74,79,85,0.3)' }}>
                      <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{ borderRadius: 15, padding: wp(14) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>{power.icon || '🔔'}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: isUnlocked ? '#EAEEF3' : '#555E6C', fontSize: fp(11), fontWeight: '700' }}>{power.name_fr || power.power_key}</Text>
                            <Text style={{ color: '#8892A0', fontSize: fp(8), marginTop: wp(2) }}>{power.description_fr || ''}</Text>
                          </View>
                          {isUnlocked ? (
                            <Pressable
                              onPress={() => setToggleStates(prev => ({ ...prev, [power.power_key]: !prev[power.power_key] }))}
                              style={{ width: wp(40), height: wp(22), borderRadius: wp(11), backgroundColor: isOn ? '#00D984' : 'rgba(255,255,255,0.1)', padding: wp(2), justifyContent: 'center' }}
                            >
                              <View style={{ width: wp(18), height: wp(18), borderRadius: wp(9), backgroundColor: '#FFFFFF', alignSelf: isOn ? 'flex-end' : 'flex-start' }} />
                            </Pressable>
                          ) : (
                            <Text style={{ color: '#FF6B6B', fontSize: fp(8) }}>🔒 Niv{power.level_required}</Text>
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                );
              }
              default: return null;
            }
          })}

          {/* ═══ 6. SECTION RECETTES ═══ */}
          <View style={{ marginTop: 28, marginHorizontal: wp(16) }}>
          <View style={{ borderRadius: 16, borderWidth: 1.5, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D', borderRightColor: '#3E4855', borderBottomColor: '#2A303B', backgroundColor: '#2A303B' }}>
          <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{
            borderRadius: 15, padding: 16,
            borderLeftWidth: 3, borderLeftColor: '#00D984',
          }}>
            <SectionTitle
              title={lang === 'fr' ? 'Recettes' : 'Recipes'}
              rightLabel={lang === 'fr' ? 'Voir tout ›' : 'See all ›'}
              rightAction={function() { recettesInitialTab.current = 'general'; setShowRecettes(true); }}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: wp(12) }}>
              {MOCK_RECIPES.map((recipe, index) => (
                <Pressable key={index} delayPressIn={120}
                  style={({ pressed }) => ({
                    width: wp(140),
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <View style={{
                    borderRadius: 20, padding: 3, borderWidth: 2,
                    borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D',
                    borderRightColor: '#3E4855', borderBottomColor: '#2A303B',
                    backgroundColor: '#2A303B',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.5, shadowRadius: 12, elevation: 10,
                  }}>
                    <View style={{
                      borderRadius: 16, borderWidth: 1.5,
                      borderColor: 'rgba(0,217,132,0.25)', overflow: 'hidden',
                      backgroundColor: '#151B23',
                    }}>
                      <View style={{
                        position: 'absolute', top: 0, left: 12, right: 12,
                        height: 1, backgroundColor: 'rgba(136,146,160,0.2)', zIndex: 1,
                      }}/>
                      <View style={{ width: '100%', height: wp(95), backgroundColor: '#1A1D22' }}>
                        <Image source={{ uri: recipe.image }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%' }} />
                        <View style={{ position: 'absolute', top: wp(6), right: wp(6), backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: '#FF8C42', fontSize: fp(8), fontWeight: '700' }}>{recipe.cal} kcal</Text>
                        </View>
                      </View>
                      <View style={{ paddingHorizontal: wp(8), paddingVertical: wp(7) }}>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(11), fontWeight: '700' }} numberOfLines={1}>{recipe.name}</Text>
                        <Text style={{ color: '#6A7080', fontSize: fp(9), marginTop: 2 }}>{recipe.origin}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </LinearGradient>
          </View>
          </View>

          {/* ═══ RECETTES POUR VOUS — Mood × Météo ═══ */}
          {userMood && (
            <View style={{ marginTop: 28, paddingHorizontal: wp(16) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                <View style={{ width: wp(3), height: wp(16), backgroundColor: '#00D984', borderRadius: wp(2), marginRight: wp(8) }} />
                <Text style={{ fontSize: fp(16), fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 }}>RECETTES POUR VOUS</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10), gap: wp(8) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                  <Text style={{ fontSize: fp(12), marginRight: wp(4) }}>
                    {userMood === 'excited' ? '🌟' : userMood === 'happy' ? '😊' : userMood === 'chill' ? '😌' : '😔'}
                  </Text>
                  <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '600' }}>
                    {userMood === 'excited' ? 'Excité' : userMood === 'happy' ? 'Heureux' : userMood === 'chill' ? 'Chill' : 'Triste'}
                  </Text>
                </View>
                {userWeather && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(77,166,255,0.08)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                    <Text style={{ fontSize: fp(12), marginRight: wp(4) }}>
                      {userWeather === 'sunny' ? '☀️' : userWeather === 'cloudy' ? '☁️' : '🌧️'}
                    </Text>
                    <Text style={{ color: '#4DA6FF', fontSize: fp(10), fontWeight: '600' }}>
                      {userWeather === 'sunny' ? 'Ensoleillé' : userWeather === 'cloudy' ? 'Nuageux' : 'Pluvieux'}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={function() { recettesInitialTab.current = 'personalized'; setShowRecettes(true); }}>
              <View style={{ backgroundColor: '#252A30', borderRadius: wp(14), borderWidth: 0.5, borderColor: 'rgba(74,79,85,0.4)', padding: wp(14) }}>
                <Text style={{ fontSize: fp(12), color: '#EAEEF3', fontWeight: '600', marginBottom: wp(6) }}>
                  {userMood === 'sad' && userWeather === 'rainy' ? '🍲 Journée cocooning — un bon plat chaud réconfortant'
                    : userMood === 'sad' && userWeather === 'sunny' ? '🥗 Profitez du soleil avec un repas léger et vitaminé'
                    : userMood === 'sad' ? '🍲 Un plat réconfortant pour remonter le moral'
                    : userMood === 'chill' && userWeather === 'rainy' ? '🍜 Temps parfait pour une soupe maison'
                    : userMood === 'chill' && userWeather === 'sunny' ? '🥙 Repas frais et équilibré pour profiter de la journée'
                    : userMood === 'chill' ? '🥗 Quelque chose de simple et équilibré'
                    : userMood === 'happy' && userWeather === 'sunny' ? '🥝 Énergie positive ! Essayez un smoothie bowl vitaminé'
                    : userMood === 'happy' ? '🍛 Bonne humeur = bon moment pour essayer une nouvelle recette'
                    : userMood === 'excited' && userWeather === 'sunny' ? '🔥 Énergie maximale ! Un repas protéiné pour performer'
                    : userMood === 'excited' ? '💪 Plein d\'énergie ! Misez sur les protéines et les glucides complexes'
                    : '🍽️ Découvrez nos suggestions du jour'}
                </Text>
                <Text style={{ fontSize: fp(9), color: '#6B7280', fontStyle: 'italic' }}>
                  Suggestion basée sur votre humeur et la météo du jour
                </Text>
              </View>
              </TouchableOpacity>
            </View>
          )}

          {/* ═══ 7. PLATS FRÉQUENTS ═══ */}
          <View style={{ marginTop: 28, marginHorizontal: wp(16) }}>
          <View style={{ borderRadius: 16, borderWidth: 1.5, borderTopColor: '#8892A0', borderLeftColor: '#6B7B8D', borderRightColor: '#3E4855', borderBottomColor: '#2A303B', backgroundColor: '#2A303B' }}>
          <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{
            borderRadius: 15, padding: 16,
            borderLeftWidth: 3, borderLeftColor: '#00D984',
          }}>
            <SectionTitle title={lang === 'fr' ? 'Plats fréquents' : 'Frequent meals'} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: wp(12) }}>
              {(frequentMeals.length > 0 ? frequentMeals : MOCK_FREQUENT).map(function(item, index) {
                var nameLower = (item.name || '').toLowerCase();
                var foodEmoji = nameLower.indexOf('croissant') >= 0 || nameLower.indexOf('pain') >= 0 || nameLower.indexOf('baguette') >= 0 ? '🥐'
                  : nameLower.indexOf('riz') >= 0 ? '🍚'
                  : nameLower.indexOf('poulet') >= 0 || nameLower.indexOf('chicken') >= 0 ? '🍗'
                  : nameLower.indexOf('poisson') >= 0 || nameLower.indexOf('thon') >= 0 || nameLower.indexOf('saumon') >= 0 || nameLower.indexOf('tilapia') >= 0 ? '🐟'
                  : nameLower.indexOf('salade') >= 0 || nameLower.indexOf('légume') >= 0 || nameLower.indexOf('legume') >= 0 ? '🥗'
                  : nameLower.indexOf('soupe') >= 0 || nameLower.indexOf('bouillon') >= 0 ? '🍲'
                  : nameLower.indexOf('pâte') >= 0 || nameLower.indexOf('pasta') >= 0 || nameLower.indexOf('spaghetti') >= 0 ? '🍝'
                  : nameLower.indexOf('viande') >= 0 || nameLower.indexOf('boeuf') >= 0 || nameLower.indexOf('bœuf') >= 0 || nameLower.indexOf('steak') >= 0 ? '🥩'
                  : nameLower.indexOf('oeuf') >= 0 || nameLower.indexOf('œuf') >= 0 || nameLower.indexOf('omelette') >= 0 ? '🥚'
                  : nameLower.indexOf('fruit') >= 0 || nameLower.indexOf('banane') >= 0 || nameLower.indexOf('mangue') >= 0 || nameLower.indexOf('pomme') >= 0 ? '🍎'
                  : nameLower.indexOf('ndolé') >= 0 || nameLower.indexOf('ndole') >= 0 || nameLower.indexOf('épinard') >= 0 || nameLower.indexOf('epinard') >= 0 ? '🥬'
                  : nameLower.indexOf('pizza') >= 0 ? '🍕'
                  : nameLower.indexOf('burger') >= 0 || nameLower.indexOf('hamburger') >= 0 ? '🍔'
                  : nameLower.indexOf('sandwich') >= 0 ? '🥪'
                  : nameLower.indexOf('gâteau') >= 0 || nameLower.indexOf('gateau') >= 0 || nameLower.indexOf('dessert') >= 0 || nameLower.indexOf('pâtisserie') >= 0 ? '🍰'
                  : nameLower.indexOf('accra') >= 0 || nameLower.indexOf('beignet') >= 0 ? '🧆'
                  : nameLower.indexOf('lait') >= 0 || nameLower.indexOf('yaourt') >= 0 ? '🥛'
                  : '🍽️';

                return (
                <Pressable key={index} delayPressIn={120}
                  style={function(state) {
                    return {
                      width: wp(90),
                      borderRadius: wp(10), overflow: 'hidden',
                      backgroundColor: '#1E2530',
                      borderWidth: 1, borderColor: state.pressed ? 'rgba(0,217,132,0.2)' : 'rgba(255,255,255,0.04)',
                      transform: [{ scale: state.pressed ? 0.95 : 1 }],
                    };
                  }}
                >
                <View style={{
                  padding: wp(8), alignItems: 'center',
                  height: wp(90),
                }}>
                  <Text style={{ fontSize: fp(22), marginBottom: wp(4) }}>{foodEmoji}</Text>
                  <Text style={{ color: '#EAEEF3', fontSize: fp(9), fontWeight: '600', textAlign: 'center' }} numberOfLines={2}>{item.name}</Text>
                  <Text style={{ color: '#5A6070', fontSize: fp(8), marginTop: 1 }} numberOfLines={1}>{item.cal} kcal</Text>
                </View>
                </Pressable>
                );
              })}
            </ScrollView>
          </LinearGradient>
          </View>
          </View>


        </ScrollView>

        {/* ═══ SOUS-ÉCRANS MONTÉS CONDITIONNELLEMENT ═══ */}
        <XscanScreen
          ref={xscanRef}
          visible={showXscan}
          onClose={() => setShowXscan(false)}
          onMealSaved={() => { setShowXscan(false); loadDashboardData(); }}
          userProfile={userProfile}
          pagePowers={pagePowers}
          activeChar={activeChar}
          initialMealType={addModalSlot}
        />
        <ManualEntryScreen
          visible={showManualEntry}
          onClose={() => setShowManualEntry(false)}
          onMealSaved={() => { setShowManualEntry(false); loadDashboardData(); }}
          initialMealType={addModalSlot}
        />
        <CartScanScreen
          visible={showCartScan}
          onClose={() => setShowCartScan(false)}
        />
        <RecettesScreen
          visible={showRecettes}
          onClose={() => setShowRecettes(false)}
          onMealSaved={() => loadDashboardData()}
          userMood={userMood}
          userWeather={userWeather}
          lixBalance={lixBalance}
          setLixBalance={updateLixBalance}
          initialTab={recettesInitialTab.current}
          onNavigate={function(key) { var routes = { home: 'Accueil', meals: 'Repas', medicai: 'MedicAi', activity: 'Activite', lixverse: 'LixVerse', profile: 'Profile' }; if (routes[key] && navigation) navigation.navigate(routes[key]); }}
          onOpenCooking={(recipe) => { setCookingRecipe(recipe); setShowCookingMode(true); }}
        />
        <CookingModeScreen
          visible={showCookingMode}
          recipe={cookingRecipe}
          onClose={() => setShowCookingMode(false)}
        />
        <AddMealModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onScan={() => { setShowAddModal(false); setShowXscan(true); if (xscanRef.current?.openCamera) xscanRef.current.openCamera(); }}
          onGallery={() => { setShowAddModal(false); setShowXscan(true); if (xscanRef.current?.openGallery) xscanRef.current.openGallery(); }}
          onManual={() => { setShowAddModal(false); setShowManualEntry(true); }}
        />

        {/* ═══ BOTTOM TABS ═══ */}
        <BottomTabs
          activeTab={activeTab}
          onTabPress={handleTabPress}
          lang={lang}
        />

      </View>
    </LinearGradient>
  );
}
