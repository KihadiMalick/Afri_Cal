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

  // === ÉTATS UI (phases suivantes) ===

  // === FONCTIONS (phases suivantes) ===

  // === JSX (phases suivantes) ===

  return null;
}
