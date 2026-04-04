import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, TouchableOpacity,
  Animated, Platform, Dimensions, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line, Circle, Rect, Defs, Mask,
  LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import { MOCK_FREQUENT, MOCK_RECIPES, getFlag } from './repasConstants';

// Composants partagés
import BottomTabs, { AvatarButton } from '../../components/shared/NavBar';
import CircuitPattern from '../../components/shared/CircuitPattern';

// Composants Repas
import MealDayCard from '../../components/repas/MealDayCard';
import AddMealModal from '../../components/repas/AddMealModal';
import XscanTooltip from '../../components/repas/XscanTooltip';

// Sous-écrans Repas
import XscanScreen from './XscanScreen';
import ManualEntryScreen from './ManualEntryScreen';
import CartScanScreen from './CartScanScreen';
import RecettesScreen from './RecettesScreen';
import CookingModeScreen from './CookingModeScreen';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const W = Dimensions.get('window').width;
const BASE_WIDTH = 320;

// SectionTitle — composant local
const SectionTitle = ({ title, rightAction, rightLabel }) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(16),
    marginBottom: wp(12),
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 3, height: 18, borderRadius: 1.5,
        backgroundColor: '#00D984', marginRight: 8,
      }}/>
      <Text style={{
        color: '#FFFFFF',
        fontSize: fp(16),
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        {title}
      </Text>
    </View>
    {rightLabel && (
      <Pressable onPressIn={rightAction}>
        <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>
          {rightLabel}
        </Text>
      </Pressable>
    )}
  </View>
);

export default function RepasPage({ onNavigate }) {
  var _lc = useLang(); var lang = _lc.lang;

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
  const [lixBalance, setLixBalance] = useState(0);
  const [userEnergy, setUserEnergy] = useState(20);

  // Mood × Météo
  const [userMood, setUserMood] = useState(null);
  const [userWeather, setUserWeather] = useState(null);

  // === ÉTATS UI ===
  const [activeTab, setActiveTab] = useState('meals');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  // Sous-écrans
  const [showXscan, setShowXscan] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showCartScan, setShowCartScan] = useState(false);
  const [showRecettes, setShowRecettes] = useState(false);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const [cookingRecipe, setCookingRecipe] = useState(null);

  // AddMealModal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalSlot, setAddModalSlot] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);

  // Tooltip Xscan
  const [showScanTooltip, setShowScanTooltip] = useState(true);
  const [xButtonY, setXButtonY] = useState(0);

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
    setIsLoadingData(true);
    try {
      const { data: profile } = await supabase
        .from('users_profile')
        .select('daily_calorie_target, lix_balance')
        .eq('user_id', TEST_USER_ID)
        .single();

      if (profile) {
        setUserProfile({ daily_calorie_target: profile.daily_calorie_target || 2330 });
        setLixBalance(profile.lix_balance || 0);
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: summary } = await supabase
        .from('daily_summary')
        .select('*')
        .eq('user_id', TEST_USER_ID)
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
        .eq('user_id', TEST_USER_ID)
        .eq('date', today)
        .order('meal_time', { ascending: true });

      if (meals) {
        setTodayMeals(meals);
      }

      const { data: frequent } = await supabase
        .from('meals')
        .select('food_name, calories')
        .eq('user_id', TEST_USER_ID)
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
    try {
      const { data: collection } = await supabase
        .rpc('get_user_collection', { p_user_id: TEST_USER_ID });
      const active = (collection || []).find(c => c.is_active);
      if (!active) { setActiveChar(null); setPagePowers([]); return; }
      setActiveChar(active);

      const { data: powers } = await supabase
        .rpc('get_character_powers', {
          p_user_id: TEST_USER_ID,
          p_slug: active.slug,
        });
      setPagePowers((powers || []).filter(p => p.redirect_page === REPAS_PAGE));
    } catch (e) {
      console.warn('Repas powers load error:', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadPagePowers();
    (async () => {
      try {
        const { data: profile } = await supabase.from('users_profile').select('full_name').eq('user_id', TEST_USER_ID).maybeSingle();
        if (profile) setUserNameAvatar(profile.full_name || '');
        const { data: chars } = await supabase.from('lixverse_user_characters').select('character_slug').eq('user_id', TEST_USER_ID).eq('is_active', true).maybeSingle();
        if (chars) setActiveCharAvatar({ slug: chars.character_slug });
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    const fetchMoodWeather = async () => {
      try {
        const { data } = await supabase
          .from('users_profile')
          .select('current_mood, current_weather')
          .eq('user_id', TEST_USER_ID)
          .maybeSingle();
        if (data) {
          setUserMood(data.current_mood);
          setUserWeather(data.current_weather);
        }
      } catch (e) {
        console.warn('Mood fetch error:', e);
      }
    };
    fetchMoodWeather();
  }, []);

  // === JSX (phases suivantes) ===

  return null;
}
