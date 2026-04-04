import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, TouchableOpacity,
  ScrollView, FlatList, Modal, Image, ActivityIndicator,
  StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../config/supabase';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import {
  RECIPE_REGIONS, RECIPE_CATEGORIES, ALIXEN_CATEGORIES,
  MOOD_MATRIX, getFlag, MEAL_SLOTS,
} from './repasConstants';

const SUPABASE_URL = 'https://yuhordnzfpcswztujozi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function RecettesScreen({
  visible,
  onClose,
  onMealSaved,
  userMood,
  userWeather,
  lixBalance,
  setLixBalance,
  onNavigate,
  onOpenCooking,
}) {
  var _lc = useLang(); var lang = _lc.lang;

  // === ÉTATS RECETTES ===
  const [recipesTab, setRecipesTab] = useState('general');
  const [recipesData, setRecipesData] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesSearch, setRecipesSearch] = useState('');
  const [recipesRegion, setRecipesRegion] = useState('all');
  const [recipesCategory, setRecipesCategory] = useState('all');
  const [recipesPage, setRecipesPage] = useState(0);
  const [recipesHasMore, setRecipesHasMore] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [recipeSteps, setRecipeSteps] = useState(null);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [displayedSteps, setDisplayedSteps] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAddConfirm, setShowAddConfirm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [addingMeal, setAddingMeal] = useState(false);
  const [moodRecipes, setMoodRecipes] = useState([]);
  const [moodMessage, setMoodMessage] = useState('');

  // === ÉTATS ALIXEN ===
  var _alixenRecipeScreen = useState('welcome'); var alixenRecipeScreen = _alixenRecipeScreen[0]; var setAlixenRecipeScreen = _alixenRecipeScreen[1];
  var _alixenContext = useState(null); var alixenContext = _alixenContext[0]; var setAlixenContext = _alixenContext[1];
  var _alixenProposals = useState([]); var alixenProposals = _alixenProposals[0]; var setAlixenProposals = _alixenProposals[1];
  var _alixenSelectedRecipe = useState(null); var alixenSelectedRecipe = _alixenSelectedRecipe[0]; var setAlixenSelectedRecipe = _alixenSelectedRecipe[1];
  var _alixenLoading = useState(false); var alixenLoading = _alixenLoading[0]; var setAlixenLoading = _alixenLoading[1];
  var _alixenCategory = useState(null); var alixenCategory = _alixenCategory[0]; var setAlixenCategory = _alixenCategory[1];
  var _alixenGreeting = useState(''); var alixenGreeting = _alixenGreeting[0]; var setAlixenGreeting = _alixenGreeting[1];
  var _alixenMyIngredients = useState([]); var alixenMyIngredients = _alixenMyIngredients[0]; var setAlixenMyIngredients = _alixenMyIngredients[1];
  var _alixenIngSearch = useState(''); var alixenIngSearch = _alixenIngSearch[0]; var setAlixenIngSearch = _alixenIngSearch[1];
  var _alixenIngResults = useState([]); var alixenIngResults = _alixenIngResults[0]; var setAlixenIngResults = _alixenIngResults[1];
  var _alixenIngSearching = useState(false); var alixenIngSearching = _alixenIngSearching[0]; var setAlixenIngSearching = _alixenIngSearching[1];
  var _alixenAdvice = useState(null); var alixenAdvice = _alixenAdvice[0]; var setAlixenAdvice = _alixenAdvice[1];
  var _alixenFreeUsedToday = useState(false); var alixenFreeUsedToday = _alixenFreeUsedToday[0]; var setAlixenFreeUsedToday = _alixenFreeUsedToday[1];
  var _alixenHasOwlPass = useState(false); var alixenHasOwlPass = _alixenHasOwlPass[0]; var setAlixenHasOwlPass = _alixenHasOwlPass[1];

  // === FONCTIONS ===

  const loadRecipes = async (page = 0, search = '', region = 'all', category = 'all', append = false) => {
    setRecipesLoading(true);
    try {
      let query = supabase
        .from('meals_master')
        .select('*')
        .order('name', { ascending: true })
        .range(page * 20, (page + 1) * 20 - 1);

      if (search.length >= 2) {
        query = query.ilike('search_name', '%' + search.toLowerCase() + '%');
      }
      if (region !== 'all') {
        if (region === 'Asie') {
          query = query.or('region.ilike.%Asie%');
        } else if (region === 'Amérique') {
          query = query.or('region.ilike.%Am%rique%');
        } else {
          query = query.ilike('region', '%' + region + '%');
        }
      }
      if (category !== 'all') {
        query = query.ilike('category', '%' + category + '%');
      }

      const { data, error } = await query;
      if (error) console.error('Recipes load error:', error);
      if (data) {
        setRecipesData(append ? [...recipesData, ...data] : data);
        setRecipesHasMore(data.length >= 20);
      }
    } catch (e) {
      console.error('Recipes error:', e);
    }
    setRecipesLoading(false);
  };

  const loadMoodRecipes = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: moodData } = await supabase
        .from('moods')
        .select('mood_level, weather')
        .eq('user_id', TEST_USER_ID)
        .gte('created_at', today + 'T00:00:00')
        .order('created_at', { ascending: false })
        .limit(1);

      let mood = moodData && moodData[0] ? moodData[0] : null;

      if (!mood) {
        setMoodMessage(lang === 'fr' ? 'Enregistrez votre humeur sur le Dashboard pour des recommandations personnalisées !' : 'Record your mood on the Dashboard for personalized recommendations!');
        setMoodRecipes([]);
        return;
      }

      const moodMap = { 'happy': 'happy', 'neutral': 'neutral', 'sad': 'sad', 'stressed': 'stressed', 'tired': 'tired', 'joyeux': 'happy', 'neutre': 'neutral', 'triste': 'sad', 'stressé': 'stressed', 'fatigué': 'tired' };
      const weatherMap = { 'sunny': 'sunny', 'cloudy': 'cloudy', 'rainy': 'rainy', 'ensoleillé': 'sunny', 'nuageux': 'cloudy', 'pluvieux': 'rainy', 'sun': 'sunny', 'cloud': 'cloudy', 'rain': 'rainy' };

      const mKey = moodMap[(mood.mood_level || '').toLowerCase()] || 'neutral';
      const wKey = weatherMap[(mood.weather || '').toLowerCase()] || 'cloudy';
      const matrixKey = mKey + '_' + wKey;
      const matrix = MOOD_MATRIX[matrixKey] || MOOD_MATRIX['neutral_cloudy'];

      setMoodMessage(lang === 'fr' ? matrix.msg_fr : matrix.msg_en);

      const catFilters = matrix.cats.map(c => 'category.ilike.%' + c + '%').join(',');
      const { data: recs } = await supabase
        .from('meals_master')
        .select('*')
        .or(catFilters)
        .order('name', { ascending: true })
        .limit(30);

      if (recs) setMoodRecipes(recs);
    } catch (e) {
      console.error('Mood recipes error:', e);
    }
  };

  // Initialisation quand visible passe à true
  useEffect(function() {
    if (visible) {
      setRecipesTab('general');
      setRecipesSearch('');
      setRecipesRegion('all');
      setRecipesCategory('all');
      setRecipesPage(0);
      loadRecipes(0);
      loadMoodRecipes();
      setAlixenRecipeScreen('welcome');
      setAlixenProposals([]);
      setAlixenSelectedRecipe(null);
      setAlixenCategory(null);
      setAlixenMyIngredients([]);
      setAlixenAdvice(null);
      loadAlixenContext();
    }
  }, [visible]);

  // === JSX (phases suivantes) ===

  if (!visible && !selectedRecipe && !showAddConfirm) return null;
  return null;
}
