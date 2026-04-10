import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, TouchableOpacity,
  ScrollView, FlatList, Modal, Image, ActivityIndicator,
  Animated, StatusBar,
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

import { useAuth } from '../../config/AuthContext';
import LixumModal from '../../components/shared/LixumModal';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';

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
  initialTab,
}) {
  var auth = useAuth(); var userId = auth.userId;
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
  var _alixenMealSlot = useState(null); var alixenMealSlot = _alixenMealSlot[0]; var setAlixenMealSlot = _alixenMealSlot[1];
  var _alixenAltCategories = useState([]); var alixenAltCategories = _alixenAltCategories[0]; var setAlixenAltCategories = _alixenAltCategories[1];
  var _alixenGlobalComment = useState(null); var alixenGlobalComment = _alixenGlobalComment[0]; var setAlixenGlobalComment = _alixenGlobalComment[1];

  // Modal state
  var _modalCfg = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null, onClose: null, confirmText: 'Confirmer', cancelText: 'Annuler' });
  var modalCfg = _modalCfg[0]; var setModalCfg = _modalCfg[1];
  var closeModal = function() { setModalCfg(function(p) { return Object.assign({}, p, { visible: false }); }); };
  var showModal = function(type, title, message, extra) { setModalCfg(Object.assign({ visible: true, type: type, title: title, message: message, onClose: closeModal, onConfirm: null, confirmText: 'Confirmer', cancelText: 'Annuler' }, extra || {})); };

  // === LOADING ANIMATION ALIXEN — 5 tubes ===
  var TUBE_COUNT = 5;
  var TUBE_LABELS = ['Ton Objectif', 'Ta Santé', 'Ingrédients', 'Préparation', 'Présentation'];
  var TUBE_COLORS = ['#4DA6FF', 'rgba(255,255,255,0.7)', '#FFD93D', '#FF8C42', '#00D984'];
  var TUBE_DURATION = 1500;

  var _tubePhase = useState(0); var tubePhase = _tubePhase[0]; var setTubePhase = _tubePhase[1];
  var tubeFills = useRef([
    new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
    new Animated.Value(0), new Animated.Value(0),
  ]).current;
  var tubePulse = useRef(new Animated.Value(0.7)).current;
  var tubeGlow = useRef(new Animated.Value(0)).current;
  var tubeBubbles = useRef([
    new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
  ]).current;
  var tubeTimers = useRef([]);
  var tubePulseLoop = useRef(null);
  var tubeBubbleLoop = useRef(null);

  useEffect(function() {
    if (alixenLoading) {
      setTubePhase(0);
      tubeFills.forEach(function(f) { f.setValue(0); });
      tubeGlow.setValue(0);

      // Pulse loop for active tube liquid
      tubePulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(tubePulse, { toValue: 1, duration: 400, useNativeDriver: false }),
          Animated.timing(tubePulse, { toValue: 0.7, duration: 400, useNativeDriver: false }),
        ])
      );
      tubePulseLoop.current.start();

      // Bubble loop
      tubeBubbleLoop.current = Animated.loop(
        Animated.stagger(300, tubeBubbles.map(function(b) {
          return Animated.sequence([
            Animated.timing(b, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.timing(b, { toValue: 1, duration: 800, useNativeDriver: true }),
          ]);
        }))
      );
      tubeBubbleLoop.current.start();

      // Sequential tube fills
      var timers = [];
      for (var i = 0; i < TUBE_COUNT; i++) {
        (function(idx) {
          var t = setTimeout(function() {
            setTubePhase(idx);
            Animated.timing(tubeFills[idx], {
              toValue: 1, duration: TUBE_DURATION, useNativeDriver: false,
            }).start(function() {
              if (idx === TUBE_COUNT - 1) {
                // Final glow
                Animated.sequence([
                  Animated.timing(tubeGlow, { toValue: 0.3, duration: 200, useNativeDriver: false }),
                  Animated.timing(tubeGlow, { toValue: 0, duration: 200, useNativeDriver: false }),
                ]).start();
              }
            });
          }, idx * TUBE_DURATION);
          timers.push(t);
        })(i);
      }
      tubeTimers.current = timers;

      return function() {
        tubeTimers.current.forEach(function(t) { clearTimeout(t); });
        if (tubePulseLoop.current) tubePulseLoop.current.stop();
        if (tubeBubbleLoop.current) tubeBubbleLoop.current.stop();
      };
    } else {
      // Loading done — fill all tubes instantly
      tubeFills.forEach(function(f) { f.setValue(1); });
      if (tubePulseLoop.current) tubePulseLoop.current.stop();
      if (tubeBubbleLoop.current) tubeBubbleLoop.current.stop();
    }
  }, [alixenLoading]);

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
    if (!userId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: moodData } = await supabase
        .from('moods')
        .select('mood_level, weather')
        .eq('user_id', userId)
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
      setRecipesTab(initialTab || 'general');
      setRecipesSearch('');
      setRecipesRegion('all');
      setRecipesCategory('all');
      setRecipesPage(0);
      loadRecipes(0);
      if (userId) {
        loadMoodRecipes();
      }
      setAlixenRecipeScreen('welcome');
      setAlixenProposals([]);
      setAlixenSelectedRecipe(null);
      setAlixenCategory(null);
      setAlixenMealSlot(null);
      setAlixenMyIngredients([]);
      setAlixenAdvice(null);
      setAlixenAltCategories([]);
      setAlixenGlobalComment(null);
      if (userId) {
        loadAlixenContext();
      }
    }
  }, [visible, userId]);

  const openRecipeDetail = async (recipe) => {
    setSelectedRecipe(recipe);
    setLoadingIngredients(true);
    try {
      const { data, error } = await supabase
        .from('meal_components_master')
        .select('component_name, percentage_estimate')
        .eq('meal_id', recipe.id)
        .order('percentage_estimate', { ascending: false });

      if (!error && data) {
        setRecipeIngredients(data);
      } else {
        setRecipeIngredients([]);
      }
    } catch (e) {
      setRecipeIngredients([]);
    }
    setLoadingIngredients(false);
  };

  const closeRecipeDetail = () => {
    setSelectedRecipe(null);
    setRecipeIngredients([]);
    setRecipeSteps(null);
    setDisplayedSteps('');
    setIsTyping(false);
    setLoadingSteps(false);
  };

  const addRecipeToMeals = async () => {
    if (!selectedRecipe || !selectedSlot || addingMeal) return;
    setAddingMeal(true);

    try {
      const today = new Date().toISOString().split('T')[0];

      const isSnackOrSide = selectedRecipe.category?.includes('Snack')
        || selectedRecipe.category?.includes('Accompagnement')
        || selectedSlot === 'snack';
      const portionGrams = isSnackOrSide ? 150 : 300;
      const factor = portionGrams / 100;

      const mealData = {
        user_id: userId,
        date: today,
        meal_type: selectedSlot,
        meal_name: selectedRecipe.name,
        food_items: [{
          name: selectedRecipe.name,
          quantity_g: portionGrams,
          kcal: Math.round(selectedRecipe.kcal_per_100g * factor),
          protein: parseFloat((selectedRecipe.protein_per_100g * factor).toFixed(1)),
          carbs: parseFloat((selectedRecipe.carbs_per_100g * factor).toFixed(1)),
          fat: parseFloat((selectedRecipe.fat_per_100g * factor).toFixed(1)),
        }],
        total_kcal: Math.round(selectedRecipe.kcal_per_100g * factor),
        total_protein: parseFloat((selectedRecipe.protein_per_100g * factor).toFixed(1)),
        total_carbs: parseFloat((selectedRecipe.carbs_per_100g * factor).toFixed(1)),
        total_fat: parseFloat((selectedRecipe.fat_per_100g * factor).toFixed(1)),
        source: 'recipe',
      };

      const { error: mealError } = await supabase
        .from('meals')
        .insert(mealData);

      if (mealError) throw mealError;

      const { error: summaryError } = await supabase.rpc(
        'add_meal_and_update_summary',
        {
          p_user_id: userId,
          p_date: today,
          p_kcal: Math.round(selectedRecipe.kcal_per_100g * factor),
          p_protein: parseFloat((selectedRecipe.protein_per_100g * factor).toFixed(1)),
          p_carbs: parseFloat((selectedRecipe.carbs_per_100g * factor).toFixed(1)),
          p_fat: parseFloat((selectedRecipe.fat_per_100g * factor).toFixed(1)),
        }
      );

      if (summaryError) console.warn('Summary update warning:', summaryError);

      setShowAddConfirm(false);
      setSelectedSlot(null);
      setAddingMeal(false);
      closeRecipeDetail();
      onMealSaved();

    } catch (e) {
      console.error('Add recipe error:', e);
      setAddingMeal(false);
      showModal('error', 'Erreur', 'Impossible d\'ajouter ce plat. Réessayez.');
    }
  };

  const typewriterEffect = (fullText, callback) => {
    setIsTyping(true);
    setDisplayedSteps('');
    let index = 0;
    const speed = 12;

    const interval = setInterval(() => {
      if (index < fullText.length) {
        const chunk = fullText.slice(index, Math.min(index + 3, fullText.length));
        setDisplayedSteps(prev => prev + chunk);
        index += 3;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (callback) callback();
      }
    }, speed);

    return () => clearInterval(interval);
  };

  const generateRecipeSteps = async () => {
    if (!selectedRecipe || loadingSteps) return;
    setLoadingSteps(true);

    try {
      const { data: cached } = await supabase
        .from('recipe_steps_cache')
        .select('steps_text')
        .eq('meal_id', selectedRecipe.id)
        .eq('language', 'fr')
        .maybeSingle();

      if (cached && cached.steps_text) {
        setRecipeSteps(cached.steps_text);
        setLoadingSteps(false);
        typewriterEffect(cached.steps_text);
        return;
      }

      const ingredientsList = recipeIngredients
        .map(ing => `${ing.component_name} (${ing.percentage_estimate}%)`)
        .join(', ');

      const response = await fetch(
        SUPABASE_URL + '/functions/v1/generate-recipe',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            meal_name: selectedRecipe.name,
            country: selectedRecipe.country_origin,
            region: selectedRecipe.region,
            category: selectedRecipe.category,
            ingredients: ingredientsList,
            description: selectedRecipe.description || '',
            language: 'fr',
          }),
        }
      );

      const result = await response.json();

      if (result.steps) {
        setRecipeSteps(result.steps);
        setLoadingSteps(false);
        typewriterEffect(result.steps);
      } else {
        throw new Error(result.error || 'Erreur génération');
      }
    } catch (e) {
      console.error('Recipe generation error:', e);
      setLoadingSteps(false);
      setRecipeSteps('__ERROR__');
    }
  };

  var loadAlixenContext = async function() {
    if (!userId) return null;
    try {
      var today = new Date().toISOString().split('T')[0];
      var hour = new Date().getHours();
      var minutes = new Date().getMinutes();

      var profileRes = await supabase
        .from('users_profile')
        .select('full_name, daily_calorie_target, weight, gender, activity_level, dietary_regime, current_mood, current_weather, bmr, tdee')
        .eq('user_id', userId)
        .maybeSingle();
      var profile = profileRes.data || {};

      var summaryRes = await supabase
        .from('daily_summary')
        .select('total_calories, total_protein, total_carbs, total_fat, meals_count')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();
      var summary = summaryRes.data || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, meals_count: 0 };

      var mealsRes = await supabase
        .from('meals')
        .select('food_name, calories, meal_type, meal_time')
        .eq('user_id', userId)
        .eq('date', today)
        .order('meal_time', { ascending: true });
      var todayMealsList = mealsRes.data || [];

      var activitiesRes = await supabase
        .from('activities')
        .select('calories_burned')
        .eq('user_id', userId)
        .eq('date', today);
      var totalBurned = (activitiesRes.data || []).reduce(function(sum, a) { return sum + (a.calories_burned || 0); }, 0);

      var target = profile.daily_calorie_target || 2330;
      var eaten = summary.total_calories || 0;
      var remaining = target - eaten + totalBurned;
      var protTarget = Math.round((target * 0.25) / 4);
      var carbsTarget = Math.round((target * 0.50) / 4);
      var fatTarget = Math.round((target * 0.25) / 9);
      var protRemaining = Math.max(0, protTarget - (summary.total_protein || 0));
      var carbsRemaining = Math.max(0, carbsTarget - (summary.total_carbs || 0));
      var fatRemaining = Math.max(0, fatTarget - (summary.total_fat || 0));

      var mealsRemaining = 0;
      var hasBreakfast = todayMealsList.some(function(m) { return m.meal_type === 'breakfast'; });
      var hasLunch = todayMealsList.some(function(m) { return m.meal_type === 'lunch'; });
      var hasDinner = todayMealsList.some(function(m) { return m.meal_type === 'dinner'; });
      if (hour < 10 && !hasBreakfast) mealsRemaining++;
      if (hour < 14 && !hasLunch) mealsRemaining++;
      if (!hasDinner) mealsRemaining++;
      mealsRemaining++;

      var timeOfDay = hour < 10 ? 'morning' : hour < 14 ? 'midday' : hour < 17 ? 'afternoon' : hour < 20 ? 'evening' : 'night';

      var ctx = {
        userName: (profile.full_name || '').split(' ')[0] || 'Membre',
        hour: hour,
        minutes: minutes,
        timeOfDay: timeOfDay,
        regime: profile.dietary_regime || 'standard',
        mood: profile.current_mood || null,
        weather: profile.current_weather || null,
        weight: profile.weight || 70,
        gender: profile.gender || 'male',
        target: target,
        eaten: eaten,
        burned: totalBurned,
        remaining: remaining,
        protRemaining: protRemaining,
        carbsRemaining: carbsRemaining,
        fatRemaining: fatRemaining,
        mealsToday: todayMealsList,
        mealsCount: summary.meals_count || 0,
        mealsRemaining: mealsRemaining,
        hasBreakfast: hasBreakfast,
        hasLunch: hasLunch,
        hasDinner: hasDinner,
      };

      try {
        var owlRes = await supabase
          .from('lixverse_user_characters')
          .select('level')
          .eq('user_id', userId)
          .eq('character_slug', 'emerald_owl')
          .maybeSingle();
        if (owlRes.data && owlRes.data.level >= 2) {
          setAlixenHasOwlPass(true);
        }
      } catch (e) {}

      try {
        var today2 = new Date().toISOString().split('T')[0];
        var usageRes = await supabase
          .from('meals')
          .select('id')
          .eq('user_id', userId)
          .eq('source', 'alixen_recipe')
          .gte('created_at', today2 + 'T00:00:00')
          .limit(1);
        if (usageRes.data && usageRes.data.length > 0) {
          setAlixenFreeUsedToday(true);
        }
      } catch (e) {}

      setAlixenContext(ctx);

      var greeting = '';
      var name = ctx.userName;
      var regimeLabel = ctx.regime === 'halal' ? 'halal' : ctx.regime === 'vegan' ? 'vegan' : ctx.regime === 'vegetarian' ? 'végétarien' : ctx.regime === 'keto' ? 'keto' : '';
      var regimeText = regimeLabel ? 'Avec ton régime ' + regimeLabel + ', ' : '';

      if (ctx.remaining <= 0) {
        greeting = name + ', tu as déjà atteint ton objectif de ' + ctx.target + ' kcal aujourd\'hui ! Si tu veux quand même manger, je te propose quelque chose de très léger.';
      } else if (timeOfDay === 'night' && ctx.remaining > 800) {
        greeting = name + ', il est ' + hour + 'h' + (minutes < 10 ? '0' : '') + minutes + ' et il te reste ' + Math.round(ctx.remaining) + ' kcal. C\'est beaucoup pour un repas nocturne — je vais te proposer des options légères et on ajuste demain.';
      } else if (timeOfDay === 'night') {
        greeting = name + ', il est ' + hour + 'h' + (minutes < 10 ? '0' : '') + minutes + '. ' + regimeText + 'qu\'est-ce qui te ferait plaisir pour ce dernier repas ? Il te reste ' + Math.round(ctx.remaining) + ' kcal.';
      } else if (timeOfDay === 'morning') {
        greeting = 'Bonjour ' + name + ' ! ' + regimeText + 'qu\'est-ce qui te ferait plaisir ce matin ? Tu as ' + Math.round(ctx.remaining) + ' kcal pour la journée.';
      } else if (timeOfDay === 'midday') {
        greeting = name + ', c\'est l\'heure du déjeuner ! ' + regimeText + 'il te reste ' + Math.round(ctx.remaining) + ' kcal et ' + Math.round(ctx.protRemaining) + 'g de protéines à atteindre.';
      } else {
        greeting = name + ', il te reste ' + Math.round(ctx.remaining) + ' kcal pour aujourd\'hui. ' + regimeText + 'qu\'est-ce qui te ferait plaisir ?';
      }

      setAlixenGreeting(greeting);
      return ctx;
    } catch (e) {
      console.error('loadAlixenContext error:', e);
      return null;
    }
  };

  var checkAlixenRecipeCost = function() {
    if (alixenHasOwlPass) return { allowed: true, cost: 0, reason: 'owl' };
    if (!alixenFreeUsedToday) return { allowed: true, cost: 0, reason: 'free' };
    if (lixBalance >= 50) return { allowed: true, cost: 50, reason: 'lix' };
    return { allowed: false, cost: 50, reason: 'insufficient' };
  };

  var deductAlixenLix = async function(cost) {
    if (cost <= 0) return true;
    try {
      var res = await supabase.rpc('deduct_lix', {
        p_user_id: userId,
        p_amount: cost,
        p_reason: 'alixen_recipe',
      });
      if (res.error) {
        var currentRes = await supabase
          .from('users_profile')
          .select('lix_balance')
          .eq('user_id', userId)
          .single();
        var current = (currentRes.data || {}).lix_balance || 0;
        if (current < cost) return false;
        await supabase
          .from('users_profile')
          .update({ lix_balance: current - cost })
          .eq('user_id', userId);
      }
      setLixBalance(function(prev) { return prev - cost; });
      return true;
    } catch (e) {
      console.error('Deduct lix error:', e);
      return false;
    }
  };

  var generateAlixenProposals = async function(category) {
    setAlixenLoading(true);
    setAlixenProposals([]);

    try {
      var ctx = alixenContext;
      if (!ctx) {
        ctx = await loadAlixenContext();
      }
      if (!ctx) {
        setAlixenLoading(false);
        showModal('error', 'Erreur', 'Impossible de charger le contexte.');
        return;
      }

      var userIngList = '';
      if (category === 'my_ingredients' && alixenMyIngredients.length > 0) {
        userIngList = alixenMyIngredients.map(function(ing) { return ing.name; }).join(', ');
      }

      var mealsText = ctx.mealsToday.map(function(m) {
        return m.meal_type + ': ' + m.food_name + ' (' + m.calories + ' kcal)';
      }).join(', ') || 'Aucun repas aujourd\'hui';

      var prompt = 'Tu es ALIXEN, chef cuisinier IA personnel dans l\'app LIXUM.\n\n' +
        'PROFIL DU MEMBRE:\n' +
        'Prénom: ' + ctx.userName + '\n' +
        'Régime: ' + ctx.regime + '\n' +
        'Poids: ' + ctx.weight + 'kg, Sexe: ' + ctx.gender + '\n\n' +
        'BILAN DU JOUR:\n' +
        'Objectif: ' + ctx.target + ' kcal\n' +
        'Déjà mangé: ' + ctx.eaten + ' kcal (' + mealsText + ')\n' +
        'Brûlé en activité: ' + ctx.burned + ' kcal\n' +
        'RESTANT: ' + Math.round(ctx.remaining) + ' kcal | ' +
        Math.round(ctx.protRemaining) + 'g prot | ' +
        Math.round(ctx.carbsRemaining) + 'g gluc | ' +
        Math.round(ctx.fatRemaining) + 'g lip\n' +
        'Repas restants estimés: ' + ctx.mealsRemaining + '\n\n' +
        'CONTEXTE:\n' +
        'Heure: ' + ctx.hour + 'h' + (ctx.minutes < 10 ? '0' : '') + ctx.minutes + '\n' +
        'Moment: ' + ctx.timeOfDay + '\n' +
        (ctx.mood ? 'Humeur: ' + ctx.mood + '\n' : '') +
        (ctx.weather ? 'Météo: ' + ctx.weather + '\n' : '') +
        '\nCATÉGORIE CHOISIE: ' + (category === 'my_ingredients' ? 'Recette avec ingrédients imposés' : category) + '\n' +
        (userIngList ? 'INGRÉDIENTS IMPOSÉS: ' + userIngList + '\n' : '') +
        '\nRÈGLES STRICTES:\n' +
        '1. Propose EXACTEMENT 3 recettes: une légère, une normale (dîner), une consistante\n' +
        '2. Adapte les grammes pour couvrir les macros RESTANTES\n' +
        '3. Respecte le régime (' + ctx.regime + ')\n' +
        '4. NUIT (après 20h): PAS de riz ni plats lourds. Soupes, milkshakes, yaourts, salades\n' +
        '5. Si > 800 kcal restantes le soir: signale et propose de rattraper demain\n' +
        '6. Culture africaine: mafé/thiéboudienne = MIDI uniquement\n' +
        '7. Chaque recette: nom, kcal total, protéines/glucides/lipides, temps de préparation, liste ingrédients avec grammes ET kcal par ingrédient, étapes de préparation\n' +
        '8. Si météo pluie + humeur triste: privilégie soupes réconfortantes\n' +
        '9. Description courte et motivante en 1 phrase pour chaque option\n' +
        '\nRÉPONDS EN JSON STRICTEMENT (pas de markdown, pas de backticks):\n' +
        '{"proposals":[{"name":"Nom","kcal":520,"protein":45,"carbs":60,"fat":20,"time":"25 min","description":"Phrase motivante courte","ingredients":[{"name":"Poulet","quantity":"180g","kcal":248},{"name":"Riz","quantity":"100g","kcal":130}],"steps":"1. Faire... 2. Ajouter..."}]}\n' +
        'IMPORTANT: Exactement 3 objets dans proposals. JSON pur, rien d\'autre.';

      var response = await fetch(
        SUPABASE_URL + '/functions/v1/lixman-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            userId: userId,
            message: prompt,
            mode: 'recipe',
          }),
        }
      );

      var data = await response.json();
      var rawMessage = data.message || data.reply || '';

      if (data.proposals && Array.isArray(data.proposals) && data.proposals.length > 0) {
        setAlixenProposals(data.proposals);
        setAlixenAltCategories(Array.isArray(data.alt_categories) ? data.alt_categories : []);
        setAlixenGlobalComment(data.global_comment || null);
        setAlixenLoading(false);
        if (ctx.timeOfDay === 'night' && ctx.remaining > 800) {
          setAlixenAdvice(
            ctx.userName + ', il te reste ' + Math.round(ctx.remaining) + ' kcal mais il est ' + ctx.hour + 'h. ' +
            'C\'est trop pour un seul repas nocturne. Je te suggère un repas de 400-500 kcal ce soir et on ajuste demain au petit-déjeuner.'
          );
        }
        return;
      }

      try {
        var cleaned = rawMessage.replace(/```json/g, '').replace(/```/g, '').trim();
        var parsed = JSON.parse(cleaned);
        var proposals = parsed.proposals || [];

        if (proposals.length > 0) {
          setAlixenProposals(proposals);
          setAlixenAltCategories(Array.isArray(parsed.alt_categories) ? parsed.alt_categories : []);
          setAlixenGlobalComment(parsed.global_comment || null);
          if (ctx.timeOfDay === 'night' && ctx.remaining > 800) {
            setAlixenAdvice(
              ctx.userName + ', il te reste ' + Math.round(ctx.remaining) + ' kcal mais il est ' + ctx.hour + 'h. ' +
              'C\'est trop pour un seul repas nocturne. Je te suggère un repas de 400-500 kcal ce soir et on ajuste demain au petit-déjeuner.'
            );
          }
        } else {
          throw new Error('No proposals');
        }
      } catch (parseError) {
        console.error('Parse error:', parseError, 'Raw:', rawMessage);
        var fallbackProposals = generateFallbackProposals(ctx, category);
        setAlixenProposals(fallbackProposals);
      }

    } catch (e) {
      console.error('generateAlixenProposals error:', e);
      var ctx2 = alixenContext || { remaining: 500, protRemaining: 30, timeOfDay: 'evening' };
      setAlixenProposals(generateFallbackProposals(ctx2, category));
    }

    setAlixenLoading(false);
  };

  var generateFallbackProposals = function(ctx, category) {
    var remaining = ctx.remaining || 500;
    var isNight = ctx.timeOfDay === 'night';

    if (isNight) {
      return [
        {
          name: 'Soupe de lentilles',
          kcal: Math.min(350, Math.round(remaining * 0.5)),
          protein: 22, carbs: 38, fat: 8, time: '30 min',
          description: 'Réconfortante et légère pour le soir',
          ingredients: [
            { name: 'Lentilles corail', quantity: '80g', kcal: 120 },
            { name: 'Carotte', quantity: '100g', kcal: 41 },
            { name: 'Oignon', quantity: '50g', kcal: 20 },
            { name: 'Tomate', quantity: '100g', kcal: 18 },
            { name: 'Huile d\'olive', quantity: '10ml', kcal: 90 },
            { name: 'Cumin, sel, poivre', quantity: 'QS', kcal: 0 },
          ],
          steps: '1. Rincer les lentilles.\n2. Faire revenir l\'oignon émincé dans l\'huile.\n3. Ajouter les carottes en dés et les tomates.\n4. Ajouter les lentilles et 500ml d\'eau.\n5. Cuire 20 min à feu doux.\n6. Mixer et assaisonner.',
        },
        {
          name: 'Yaourt aux fruits et miel',
          kcal: Math.min(250, Math.round(remaining * 0.35)),
          protein: 12, carbs: 35, fat: 6, time: '5 min',
          description: 'Léger et nutritif, parfait avant le coucher',
          ingredients: [
            { name: 'Yaourt nature', quantity: '200g', kcal: 120 },
            { name: 'Banane', quantity: '100g', kcal: 89 },
            { name: 'Miel', quantity: '15g', kcal: 45 },
          ],
          steps: '1. Verser le yaourt dans un bol.\n2. Trancher la banane.\n3. Disposer les fruits sur le yaourt.\n4. Arroser de miel.',
        },
        {
          name: 'Milkshake protéiné banane-cacao',
          kcal: Math.min(400, Math.round(remaining * 0.6)),
          protein: 25, carbs: 45, fat: 12, time: '5 min',
          description: 'Calorique mais facile à digérer',
          ingredients: [
            { name: 'Lait', quantity: '250ml', kcal: 150 },
            { name: 'Banane', quantity: '120g', kcal: 107 },
            { name: 'Cacao en poudre', quantity: '15g', kcal: 52 },
            { name: 'Beurre de cacahuète', quantity: '15g', kcal: 94 },
          ],
          steps: '1. Mettre tous les ingrédients dans un blender.\n2. Mixer 30 secondes.\n3. Servir frais.',
        },
      ];
    }

    return [
      {
        name: 'Salade composée',
        kcal: Math.round(remaining * 0.4),
        protein: 18, carbs: 20, fat: 12, time: '15 min',
        description: 'Fraîche et équilibrée',
        ingredients: [
          { name: 'Laitue', quantity: '100g', kcal: 15 },
          { name: 'Tomate', quantity: '100g', kcal: 18 },
          { name: 'Œuf dur', quantity: '2 pièces', kcal: 140 },
          { name: 'Vinaigrette', quantity: '15ml', kcal: 75 },
        ],
        steps: '1. Laver et couper la laitue.\n2. Couper les tomates en quartiers.\n3. Faire cuire les œufs 10 min.\n4. Assembler et assaisonner.',
      },
      {
        name: 'Poulet grillé + légumes',
        kcal: Math.round(remaining * 0.65),
        protein: 42, carbs: 25, fat: 15, time: '30 min',
        description: 'Classique, protéiné et satisfaisant',
        ingredients: [
          { name: 'Blanc de poulet', quantity: '180g', kcal: 248 },
          { name: 'Brocoli', quantity: '150g', kcal: 51 },
          { name: 'Patate douce', quantity: '100g', kcal: 86 },
          { name: 'Huile d\'olive', quantity: '10ml', kcal: 90 },
        ],
        steps: '1. Griller le poulet assaisonné 6 min par côté.\n2. Cuire les brocolis à la vapeur 8 min.\n3. Rôtir la patate douce en cubes 20 min au four.\n4. Servir ensemble.',
      },
      {
        name: 'Riz + haricots + avocat',
        kcal: Math.round(remaining * 0.85),
        protein: 28, carbs: 65, fat: 22, time: '25 min',
        description: 'Complet et énergétique',
        ingredients: [
          { name: 'Riz', quantity: '150g', kcal: 195 },
          { name: 'Haricots rouges', quantity: '120g', kcal: 127 },
          { name: 'Avocat', quantity: '80g', kcal: 128 },
          { name: 'Oignon', quantity: '30g', kcal: 12 },
          { name: 'Tomate', quantity: '50g', kcal: 9 },
        ],
        steps: '1. Cuire le riz 15 min.\n2. Réchauffer les haricots avec l\'oignon.\n3. Couper l\'avocat en tranches.\n4. Assembler dans un bol.',
      },
    ];
  };

  // === JSX ===

  if (!visible && !selectedRecipe && !showAddConfirm) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1300 }}>
      {/* Écran principal recettes */}
      {visible && !selectedRecipe && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1400,
          backgroundColor: '#0D1117',
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 50,
            paddingHorizontal: wp(16), paddingBottom: wp(10),
            borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)',
          }}>
            <Pressable onPress={onClose}>
              <Text style={{ color: '#8892A0', fontSize: fp(14) }}>✕ {lang === 'fr' ? 'Fermer' : 'Close'}</Text>
            </Pressable>
            <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800', letterSpacing: 1 }}>
              {lang === 'fr' ? 'RECETTES' : 'RECIPES'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          {/* 2 Onglets : Général / ALIXEN Chef — MetalCard dense */}
          <View style={{
            flexDirection: 'row', marginHorizontal: wp(16), marginTop: wp(10),
            gap: wp(8),
          }}>
            <Pressable
              onPress={function() { setRecipesTab('general'); if (recipesData.length === 0) loadRecipes(0); }}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{
                  borderRadius: 14, paddingVertical: wp(12), alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: recipesTab === 'general' ? '#00D984' : '#4A4F55',
                }}
              >
                {recipesTab === 'general' && (
                  <View style={{
                    position: 'absolute', top: -1, left: -1, right: -1, bottom: -1,
                    borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.3)',
                  }} />
                )}
                <Text style={{ fontSize: 16, marginBottom: 2 }}>🌍</Text>
                <Text style={{
                  color: recipesTab === 'general' ? '#00D984' : '#8892A0',
                  fontSize: fp(11), fontWeight: recipesTab === 'general' ? '800' : '600',
                }}>{lang === 'fr' ? 'Général' : 'General'}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={function() { setRecipesTab('personalized'); loadMoodRecipes(); }}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{
                  borderRadius: 14, paddingVertical: wp(12), alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: recipesTab === 'personalized' ? '#00D984' : '#4A4F55',
                }}
              >
                {recipesTab === 'personalized' && (
                  <View style={{
                    position: 'absolute', top: -1, left: -1, right: -1, bottom: -1,
                    borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.3)',
                  }} />
                )}
                <Text style={{ fontSize: 16, marginBottom: 2 }}>🤖</Text>
                <Text style={{
                  color: recipesTab === 'personalized' ? '#00D984' : '#8892A0',
                  fontSize: fp(11), fontWeight: recipesTab === 'personalized' ? '800' : '600',
                }}><Text style={{ color: recipesTab === 'personalized' ? '#00D984' : '#8892A0' }}>ALIXEN</Text> Chef</Text>
                <Text style={{ color: '#8892A0', fontSize: fp(7), fontWeight: '600', marginTop: 1 }}>
                  Recettes Personnalisées
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* ═══ ONGLET GÉNÉRAL ═══ */}
          {recipesTab === 'general' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: wp(100) }}
            >
              {/* Barre de recherche */}
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 14, paddingHorizontal: wp(12),
                marginHorizontal: wp(16), marginTop: wp(12),
                borderWidth: 1, borderColor: recipesSearch.length > 0 ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.05)',
              }}>
                <Text style={{ color: '#5A6070', fontSize: 16, marginRight: 8 }}>🔍</Text>
                <TextInput
                  value={recipesSearch}
                  onChangeText={(text) => {
                    setRecipesSearch(text);
                    setRecipesPage(0);
                    loadRecipes(0, text, recipesRegion, recipesCategory);
                  }}
                  placeholder={lang === 'fr' ? 'Chercher un plat...' : 'Search a dish...'}
                  placeholderTextColor="#5A6070"
                  style={{ flex: 1, color: '#EAEEF3', fontSize: fp(13), paddingVertical: wp(11) }}
                />
                {recipesSearch.length > 0 && (
                  <Pressable onPress={() => { setRecipesSearch(''); loadRecipes(0, '', recipesRegion, recipesCategory); }}>
                    <Text style={{ color: '#8892A0', fontSize: 16 }}>✕</Text>
                  </Pressable>
                )}
              </View>

              {/* Chips Régions */}
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(12), gap: wp(6) }}
              >
                {RECIPE_REGIONS.map((r) => {
                  const active = recipesRegion === r.key;
                  return (
                    <Pressable key={r.key} onPress={() => {
                      setRecipesRegion(r.key);
                      setRecipesPage(0);
                      loadRecipes(0, recipesSearch, r.key, recipesCategory);
                    }}>
                      <View style={{
                        paddingHorizontal: wp(10), paddingVertical: wp(7),
                        borderRadius: 10,
                        backgroundColor: active ? 'rgba(0,217,132,0.12)' : 'rgba(255,255,255,0.03)',
                        borderWidth: 1, borderColor: active ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.06)',
                      }}>
                        <Text style={{
                          color: active ? '#00D984' : '#8892A0',
                          fontSize: fp(10), fontWeight: active ? '700' : '500',
                        }}>{lang === 'fr' ? r.label : r.labelEn}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Chips Catégories */}
              <ScrollView
                horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(8), gap: wp(6), paddingBottom: wp(12) }}
              >
                {RECIPE_CATEGORIES.map((c) => {
                  const active = recipesCategory === c.key;
                  return (
                    <Pressable key={c.key} onPress={() => {
                      setRecipesCategory(c.key);
                      setRecipesPage(0);
                      loadRecipes(0, recipesSearch, recipesRegion, c.key);
                    }}>
                      <View style={{
                        paddingHorizontal: wp(10), paddingVertical: wp(7),
                        borderRadius: 10,
                        backgroundColor: active ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                        borderWidth: 1, borderColor: active ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
                      }}>
                        <Text style={{
                          color: active ? '#D4AF37' : '#8892A0',
                          fontSize: fp(10), fontWeight: active ? '700' : '500',
                        }}>{lang === 'fr' ? c.label : c.labelEn}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Compteur résultats */}
              <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8) }}>
                <Text style={{ color: '#5A6070', fontSize: fp(10) }}>
                  {recipesData.length} {lang === 'fr' ? 'recettes trouvées' : 'recipes found'}
                  {recipesLoading ? (lang === 'fr' ? ' • Chargement...' : ' • Loading...') : ''}
                </Text>
              </View>

              {/* Grille 2 colonnes */}
              <FlatList
                data={recipesData}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: wp(10) }}
                renderItem={({ item: recipe }) => (
                  <Pressable
                    onPress={() => openRecipeDetail(recipe)}
                    style={({ pressed }) => ({
                      width: '48%',
                      marginBottom: wp(12),
                      borderRadius: wp(10), overflow: 'hidden',
                      backgroundColor: '#1E2530',
                      borderWidth: 1, borderColor: pressed ? 'rgba(0,217,132,0.2)' : 'rgba(255,255,255,0.04)',
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      height: wp(200),
                    })}
                  >
                    {/* Zone image */}
                    <View style={{
                      height: '58%', backgroundColor: '#151B23',
                      justifyContent: 'center', alignItems: 'center',
                      borderTopLeftRadius: wp(10), borderTopRightRadius: wp(10),
                    }}>
                      <LinearGradient
                        colors={['rgba(0,217,132,0.06)', 'rgba(0,217,132,0.02)', 'transparent']}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                      />
                      <Text style={{ fontSize: 28 }}>{getFlag(recipe.country_origin)}</Text>
                      <View style={{
                        position: 'absolute', top: wp(6), right: wp(6),
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
                      }}>
                        <Text style={{ color: '#FF8C42', fontSize: fp(8), fontWeight: '700' }}>
                          {Math.round(recipe.kcal_per_100g)} kcal
                        </Text>
                      </View>
                    </View>

                    {/* Infos */}
                    <View style={{ padding: wp(8), flex: 1, justifyContent: 'center' }}>
                      <Text style={{
                        color: '#FFFFFF', fontSize: fp(11), fontWeight: '700',
                      }} numberOfLines={1}>{getFlag(recipe.country_origin)} {recipe.name}</Text>
                      <Text style={{ color: '#9CA3AF', fontSize: fp(9), marginTop: 2 }} numberOfLines={1}>
                        {Math.round(recipe.kcal_per_100g)} kcal · {recipe.country_origin}
                      </Text>
                      <View style={{ flexDirection: 'row', marginTop: wp(4), gap: wp(6) }}>
                        <Text style={{ color: '#FF6B6B', fontSize: fp(8), fontWeight: '600' }}>{recipe.protein_per_100g}P</Text>
                        <Text style={{ color: '#FFD93D', fontSize: fp(8), fontWeight: '600' }}>{recipe.carbs_per_100g}G</Text>
                        <Text style={{ color: '#4DA6FF', fontSize: fp(8), fontWeight: '600' }}>{recipe.fat_per_100g}L</Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              />

              {/* Bouton Charger plus */}
              {recipesHasMore && recipesData.length > 0 && (
                <Pressable
                  onPress={() => {
                    const nextPage = recipesPage + 1;
                    setRecipesPage(nextPage);
                    loadRecipes(nextPage, recipesSearch, recipesRegion, recipesCategory, true);
                  }}
                  style={({ pressed }) => ({
                    marginHorizontal: wp(40), marginTop: wp(16),
                    paddingVertical: wp(12), borderRadius: 12,
                    backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.06)',
                    borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                    alignItems: 'center',
                  })}
                >
                  <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700' }}>
                    {recipesLoading ? '⏳' : (lang === 'fr' ? '+ Voir plus' : '+ See more')}
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          )}

          {/* ═══ ONGLET PERSONNALISÉ ═══ */}
          {recipesTab === 'personalized' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: wp(100) }}
              keyboardShouldPersistTaps="handled"
            >
              {/* ═══ ÉCRAN WELCOME — ALIXEN accueil ═══ */}
              {alixenRecipeScreen === 'welcome' && (
                <View style={{ paddingHorizontal: wp(16), paddingTop: wp(14) }}>

                  {/* Carte ALIXEN greeting — compacte */}
                  <View style={{
                    backgroundColor: '#2A303B', borderRadius: 14,
                    borderWidth: 1, borderColor: '#3A3F46',
                    padding: wp(12), marginBottom: wp(12),
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                      <Text style={{ fontSize: fp(16), marginRight: wp(8) }}>🤖</Text>
                      <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '800', flex: 1 }}>ALIXEN</Text>
                      <View style={{
                        backgroundColor: 'rgba(0,217,132,0.08)',
                        paddingHorizontal: wp(8), paddingVertical: wp(2), borderRadius: wp(6),
                      }}>
                        <Text style={{ color: '#00D984', fontSize: fp(8), fontWeight: '700' }}>IA</Text>
                      </View>
                    </View>
                    <Text style={{
                      color: '#EAEEF3', fontSize: fp(11), lineHeight: fp(17),
                      fontStyle: 'italic',
                    }} numberOfLines={2}>
                      "{alixenGreeting || 'Chargement...'}"
                    </Text>
                  </View>

                  {/* Pilules macros */}
                  {alixenContext && (
                    <View style={{
                      flexDirection: 'row', marginBottom: wp(14), gap: wp(8),
                    }}>
                      <View style={{
                        flex: 1, backgroundColor: 'rgba(255,140,66,0.06)',
                        borderRadius: wp(8), padding: wp(8), alignItems: 'center',
                        borderWidth: 0.5, borderColor: 'rgba(255,140,66,0.15)',
                      }}>
                        <Text style={{ color: '#FF8C42', fontSize: fp(14), fontWeight: '800' }}>
                          {Math.round(alixenContext.remaining)}
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>kcal restant</Text>
                      </View>
                      <View style={{
                        flex: 1, backgroundColor: 'rgba(255,107,107,0.06)',
                        borderRadius: wp(8), padding: wp(8), alignItems: 'center',
                        borderWidth: 0.5, borderColor: 'rgba(255,107,107,0.15)',
                      }}>
                        <Text style={{ color: '#FF6B6B', fontSize: fp(14), fontWeight: '800' }}>
                          {Math.round(alixenContext.protRemaining)}g
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>prot. restant</Text>
                      </View>
                      <View style={{
                        flex: 1, backgroundColor: 'rgba(0,217,132,0.06)',
                        borderRadius: wp(8), padding: wp(8), alignItems: 'center',
                        borderWidth: 0.5, borderColor: 'rgba(0,217,132,0.15)',
                      }}>
                        <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '800' }}>
                          {alixenContext.mealsCount}
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>repas pris</Text>
                      </View>
                    </View>
                  )}

                  {/* Badge coût */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    marginBottom: wp(10),
                  }}>
                    {alixenHasOwlPass ? (
                      <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: 'rgba(0,217,132,0.08)',
                        paddingHorizontal: wp(10), paddingVertical: wp(4),
                        borderRadius: wp(8), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                      }}>
                        <Text style={{ fontSize: fp(10), marginRight: wp(4) }}>🦉</Text>
                        <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                          Emerald Owl · Recettes illimitées
                        </Text>
                      </View>
                    ) : !alixenFreeUsedToday ? (
                      <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: 'rgba(0,217,132,0.08)',
                        paddingHorizontal: wp(10), paddingVertical: wp(4),
                        borderRadius: wp(8), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                      }}>
                        <Text style={{ fontSize: fp(10), marginRight: wp(4) }}>🎁</Text>
                        <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                          1 recette gratuite disponible
                        </Text>
                      </View>
                    ) : (
                      <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: 'rgba(212,175,55,0.08)',
                        paddingHorizontal: wp(10), paddingVertical: wp(4),
                        borderRadius: wp(8), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                      }}>
                        <Text style={{ fontSize: fp(10), marginRight: wp(4) }}>💎</Text>
                        <Text style={{ color: '#D4AF37', fontSize: fp(9), fontWeight: '700' }}>
                          50 Lix par recette
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8), marginLeft: wp(6) }}>
                          ou 🦉 Emerald Owl Niv2
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* ── ÉTAPE 1 : Sélection créneau (si pas encore choisi) ── */}
                  {!alixenMealSlot && (
                    <View>
                      <Text style={{
                        color: '#8892A0', fontSize: fp(10), fontWeight: '700',
                        letterSpacing: 1.5, marginBottom: wp(10),
                      }}>
                        CHOISIS TON CRÉNEAU
                      </Text>

                      <View style={{
                        flexDirection: 'row', flexWrap: 'wrap', gap: wp(10),
                      }}>
                        {[
                          { key: 'breakfast', emoji: '☀️', label: 'Petit-déjeuner' },
                          { key: 'lunch', emoji: '⛅', label: 'Déjeuner' },
                          { key: 'dinner', emoji: '🌙', label: 'Dîner' },
                          { key: 'snack', emoji: '🍿', label: 'Snacks' },
                        ].map(function(slot) {
                          return (
                            <Pressable
                              key={slot.key}
                              onPress={function() { setAlixenMealSlot(slot.key); }}
                              style={{ width: '47%' }}
                            >
                              <LinearGradient
                                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                                style={{
                                  borderRadius: 14, paddingVertical: wp(20), alignItems: 'center',
                                  borderWidth: 1.5, borderColor: '#4A4F55',
                                }}
                              >
                                <Text style={{ fontSize: fp(28), marginBottom: wp(6) }}>{slot.emoji}</Text>
                                <Text style={{
                                  color: '#EAEEF3', fontSize: fp(12), fontWeight: '700',
                                }}>{slot.label}</Text>
                              </LinearGradient>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* ── ÉTAPE 2 : Créneau sélectionné → catégories ── */}
                  {alixenMealSlot && (
                    <View>
                      {/* Bouton retour créneau */}
                      <Pressable onPress={function() { setAlixenMealSlot(null); }}>
                        <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600', marginBottom: wp(10) }}>
                          ← Changer de créneau
                        </Text>
                      </Pressable>

                      {/* Chip créneau sélectionné */}
                      <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: 'rgba(0,217,132,0.08)',
                        borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(5),
                        alignSelf: 'flex-start', marginBottom: wp(12),
                        borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                      }}>
                        <Text style={{ fontSize: fp(12), marginRight: wp(4) }}>
                          {alixenMealSlot === 'breakfast' ? '☀️' : alixenMealSlot === 'lunch' ? '⛅' : alixenMealSlot === 'dinner' ? '🌙' : '🍿'}
                        </Text>
                        <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '700' }}>
                          {alixenMealSlot === 'breakfast' ? 'Petit-déjeuner' : alixenMealSlot === 'lunch' ? 'Déjeuner' : alixenMealSlot === 'dinner' ? 'Dîner' : 'Snacks'}
                        </Text>
                      </View>

                      <Text style={{
                        color: '#8892A0', fontSize: fp(10), fontWeight: '700',
                        letterSpacing: 1.5, marginBottom: wp(10),
                      }}>
                        QUE VEUX-TU PRÉPARER ?
                      </Text>

                      <View style={{
                        flexDirection: 'row', flexWrap: 'wrap',
                        gap: wp(8),
                      }}>
                        {ALIXEN_CATEGORIES.filter(function(cat) { return cat.key !== 'snack'; }).map(function(cat) {
                          var isNight = alixenContext && alixenContext.timeOfDay === 'night';
                          var isHeavy = cat.key === 'rice' || cat.key === 'hearty';
                          var isLight = cat.key === 'light' || cat.key === 'soup' || cat.key === 'milkshake' || cat.key === 'salad';

                          return (
                            <Pressable
                              key={cat.key}
                              onPress={function() {
                                var costCheck = checkAlixenRecipeCost();
                                if (!costCheck.allowed) {
                                  showModal('error', '💎 Lix insuffisants', 'Il te faut 50 Lix pour une recette ALIXEN.\n\nAlternatives :\n• Reviens demain pour ta recette gratuite\n• Obtiens des Lix dans le LixVerse\n• Débloque Emerald Owl Niv2 pour des recettes illimitées', { type: 'confirm', confirmText: 'Aller au LixVerse', cancelText: 'OK', onConfirm: function() { closeModal(); if (onNavigate) onNavigate('lixverse'); onClose(); } });
                                  return;
                                }
                                if (costCheck.cost > 0) {
                                  showModal('confirm', '🤖 Recette ALIXEN', 'Ta recette gratuite du jour a été utilisée.\nCette génération coûte 50 Lix.\n\nSolde : ' + lixBalance + ' Lix', {
                                    confirmText: 'Confirmer (50 Lix)', cancelText: 'Annuler',
                                    onConfirm: function() {
                                      closeModal();
                                      deductAlixenLix(50).then(function(success) {
                                        if (success) {
                                          setAlixenCategory(cat.key);
                                          setAlixenRecipeScreen('proposals');
                                          setAlixenLoading(true);
                                          generateAlixenProposals(cat.key);
                                        } else {
                                          showModal('error', 'Erreur', 'Impossible de débiter les Lix.');
                                        }
                                      });
                                    },
                                  });
                                  return;
                                }
                                setAlixenCategory(cat.key);
                                setAlixenRecipeScreen('proposals');
                                setAlixenLoading(true);
                                generateAlixenProposals(cat.key);
                              }}
                              style={function(state) {
                                return {
                                  width: '31%',
                                  paddingVertical: wp(14),
                                  borderRadius: 14,
                                  backgroundColor: state.pressed ? 'rgba(0,217,132,0.10)' : '#2A303B',
                                  borderWidth: 1,
                                  borderColor: state.pressed
                                    ? 'rgba(0,217,132,0.4)'
                                    : isNight && isLight
                                      ? 'rgba(0,217,132,0.25)'
                                      : isNight && isHeavy
                                        ? 'rgba(255,140,66,0.15)'
                                        : '#3A3F46',
                                  alignItems: 'center',
                                  opacity: isNight && isHeavy ? 0.5 : 1,
                                };
                              }}
                            >
                              <Text style={{ fontSize: fp(20), marginBottom: wp(4) }}>{cat.emoji}</Text>
                              <Text style={{
                                color: '#EAEEF3', fontSize: fp(9), fontWeight: '600',
                                textAlign: 'center',
                              }} numberOfLines={1}>{cat.label}</Text>
                              {isNight && isHeavy && (
                                <Text style={{ color: '#FF8C42', fontSize: fp(7), marginTop: wp(2) }}>Déconseillé</Text>
                              )}
                              {isNight && isLight && (
                                <Text style={{ color: '#00D984', fontSize: fp(7), marginTop: wp(2) }}>Recommandé</Text>
                              )}
                            </Pressable>
                          );
                        })}
                      </View>

                      <View style={{
                        height: 1, backgroundColor: 'rgba(255,255,255,0.05)',
                        marginVertical: wp(16),
                      }} />

                      {/* Bouton "Mes ingrédients" — MetalCard bordure dense */}
                      <Pressable
                        onPress={function() {
                          setAlixenRecipeScreen('my_ingredients');
                          setAlixenMyIngredients([]);
                          setAlixenIngSearch('');
                          setAlixenIngResults([]);
                        }}
                        style={function(state) {
                          return {
                            borderRadius: 14, overflow: 'hidden',
                            opacity: state.pressed ? 0.85 : 1,
                          };
                        }}
                      >
                        <LinearGradient
                          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                          style={{
                            flexDirection: 'row', alignItems: 'center',
                            padding: wp(14), borderRadius: 14,
                            borderWidth: 1.5, borderColor: '#4A4F55',
                          }}
                        >
                          <View style={{
                            width: wp(40), height: wp(40), borderRadius: wp(12),
                            backgroundColor: 'rgba(0,217,132,0.08)',
                            justifyContent: 'center', alignItems: 'center',
                            marginRight: wp(12), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                          }}>
                            <Text style={{ fontSize: fp(18) }}>🔍</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '800' }}>
                              Mes ingrédients
                            </Text>
                            <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                              Propose tes ingrédients, ALIXEN crée la recette
                            </Text>
                          </View>
                          <Text style={{ color: '#00D984', fontSize: fp(16) }}>›</Text>
                        </LinearGradient>
                      </Pressable>

                      {alixenContext && alixenContext.mood && (
                        <View style={{
                          flexDirection: 'row', alignItems: 'center',
                          marginTop: wp(12), gap: wp(8),
                        }}>
                          <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            backgroundColor: 'rgba(0,217,132,0.06)',
                            borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4),
                          }}>
                            <Text style={{ fontSize: fp(10), marginRight: wp(4) }}>
                              {alixenContext.mood === 'happy' ? '😊' : alixenContext.mood === 'sad' ? '😢' : alixenContext.mood === 'stressed' ? '😰' : alixenContext.mood === 'tired' ? '😴' : '😐'}
                            </Text>
                            <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '600' }}>
                              {alixenContext.mood}
                            </Text>
                          </View>
                          {alixenContext.weather && (
                            <View style={{
                              flexDirection: 'row', alignItems: 'center',
                              backgroundColor: 'rgba(77,166,255,0.06)',
                              borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4),
                            }}>
                              <Text style={{ fontSize: fp(10), marginRight: wp(4) }}>
                                {alixenContext.weather === 'sunny' ? '☀️' : alixenContext.weather === 'rainy' ? '🌧️' : '⛅'}
                              </Text>
                              <Text style={{ color: '#4DA6FF', fontSize: fp(9), fontWeight: '600' }}>
                                {alixenContext.weather}
                              </Text>
                            </View>
                          )}
                          <Text style={{ color: '#5A6070', fontSize: fp(8), fontStyle: 'italic' }}>
                            ALIXEN adapte ses suggestions
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                </View>
              )}

              {/* ═══ ÉCRAN PROPOSALS ═══ */}
              {alixenRecipeScreen === 'proposals' && (
                <View style={{ paddingHorizontal: wp(16), paddingTop: wp(14) }}>

                  <Pressable onPress={function() { setAlixenRecipeScreen('welcome'); setAlixenProposals([]); }}>
                    <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600', marginBottom: wp(12) }}>← Changer de créneau</Text>
                  </Pressable>

                  {alixenLoading && (
                    <View style={{
                      backgroundColor: '#2A303B', borderRadius: 16,
                      borderWidth: 1, borderColor: '#3A3F46',
                      padding: wp(20), alignItems: 'center',
                    }}>
                      {/* Glow overlay */}
                      <Animated.View style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        borderRadius: 16, backgroundColor: 'rgba(0,217,132,0.1)',
                        opacity: tubeGlow,
                      }} />

                      {/* Title */}
                      <Text style={{
                        color: '#00D984', fontSize: fp(14), fontWeight: '600',
                        marginBottom: wp(4),
                      }}>ALIXEN cuisine pour toi...</Text>
                      <Text style={{
                        color: '#888', fontSize: fp(11), marginBottom: wp(16),
                      }}>{TUBE_LABELS[tubePhase] || ''}</Text>

                      {/* 5 tubes */}
                      <View style={{
                        flexDirection: 'row', justifyContent: 'center',
                        gap: wp(12), marginBottom: wp(10),
                      }}>
                        {[0, 1, 2, 3, 4].map(function(idx) {
                          var tubeH = wp(55);
                          var tubeW = wp(14);
                          var isActive = idx === tubePhase;
                          var isFilled = idx < tubePhase;
                          return (
                            <View key={idx} style={{ alignItems: 'center' }}>
                              {/* Tube */}
                              <View style={{
                                width: tubeW, height: tubeH, borderRadius: 8,
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                                backgroundColor: 'transparent', overflow: 'hidden',
                              }}>
                                {/* Liquid fill */}
                                <Animated.View style={{
                                  position: 'absolute', bottom: 0, left: 0, right: 0,
                                  backgroundColor: TUBE_COLORS[idx],
                                  borderRadius: 6,
                                  opacity: isActive ? tubePulse : 1,
                                  height: tubeFills[idx].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, tubeH - 2],
                                  }),
                                }} />
                                {/* Bubbles — active tube only */}
                                {isActive && tubeBubbles.map(function(b, bi) {
                                  var leftPos = bi === 0 ? 2 : bi === 1 ? 6 : 4;
                                  return (
                                    <Animated.View key={bi} style={{
                                      position: 'absolute',
                                      left: leftPos, width: 3, height: 3, borderRadius: 2,
                                      backgroundColor: 'rgba(255,255,255,0.5)',
                                      opacity: b.interpolate({
                                        inputRange: [0, 0.3, 0.7, 1],
                                        outputRange: [0, 0.7, 0.7, 0],
                                      }),
                                      transform: [{
                                        translateY: b.interpolate({
                                          inputRange: [0, 1],
                                          outputRange: [tubeH - 8, 4],
                                        }),
                                      }],
                                    }} />
                                  );
                                })}
                              </View>
                              {/* Label */}
                              <Text style={{
                                color: isActive ? '#CCC' : isFilled ? TUBE_COLORS[idx] : '#555',
                                fontSize: fp(7), textAlign: 'center',
                                marginTop: wp(4), width: wp(42),
                              }} numberOfLines={1}>{TUBE_LABELS[idx]}</Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {!alixenLoading && alixenProposals.length > 0 && (
                    <View>
                      {/* Global comment ALIXEN (optionnel) */}
                      {alixenGlobalComment ? (
                        <View style={{
                          backgroundColor: '#2A303B', borderRadius: 14,
                          borderWidth: 1, borderColor: '#3A3F46',
                          padding: wp(12), marginBottom: wp(12),
                          flexDirection: 'row',
                        }}>
                          <Text style={{ fontSize: fp(14), marginRight: wp(8), marginTop: wp(1) }}>🤖</Text>
                          <Text style={{
                            color: '#CCC', fontSize: fp(12), flex: 1,
                            lineHeight: fp(18),
                          }}>
                            {alixenGlobalComment}
                          </Text>
                        </View>
                      ) : (
                        <Text style={{
                          color: '#AAA', fontSize: fp(11), fontWeight: '700',
                          letterSpacing: 2, marginBottom: wp(12),
                          textTransform: 'uppercase',
                        }}>
                          ALIXEN TE PROPOSE 3 OPTIONS
                        </Text>
                      )}

                      {alixenProposals.map(function(proposal, idx) {
                        var typeEmojis = ['🥗', '🍲', '🥩'];
                        var emoji = typeEmojis[idx] || '🍽️';
                        var isOver = alixenContext && proposal.kcal > alixenContext.remaining;
                        var slotLabel = alixenMealSlot === 'breakfast' ? 'Petit-déj' : alixenMealSlot === 'lunch' ? 'Déjeuner' : alixenMealSlot === 'dinner' ? 'Dîner' : alixenMealSlot === 'snack' ? 'Snacks' : '';

                        return (
                          <Pressable
                            key={idx}
                            onPress={function() {
                              setAlixenSelectedRecipe(proposal);
                              setAlixenRecipeScreen('detail');
                            }}
                            style={function(state) {
                              return {
                                backgroundColor: state.pressed ? '#333A44' : '#2A303B',
                                borderRadius: 14,
                                borderWidth: 1,
                                borderColor: state.pressed ? 'rgba(0,217,132,0.3)' : '#3A3F46',
                                padding: wp(14),
                                marginBottom: wp(12),
                              };
                            }}
                          >
                            {/* Ligne 1 — Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                              <Text style={{ fontSize: fp(18), marginRight: wp(8) }}>{emoji}</Text>
                              <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: wp(3) }}>
                                  {slotLabel !== '' && (
                                    <View style={{
                                      backgroundColor: 'rgba(0,217,132,0.15)',
                                      paddingHorizontal: wp(8), paddingVertical: wp(2), borderRadius: 8,
                                    }}>
                                      <Text style={{ color: '#00D984', fontSize: fp(8), fontWeight: '800' }}>{slotLabel}</Text>
                                    </View>
                                  )}
                                  {isOver && (
                                    <View style={{
                                      backgroundColor: 'rgba(255,140,66,0.1)',
                                      paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4),
                                    }}>
                                      <Text style={{ color: '#FF8C42', fontSize: fp(7), fontWeight: '700' }}>Au-dessus</Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={{
                                  color: '#EAEEF3', fontSize: fp(14), fontWeight: '700',
                                }} numberOfLines={1}>
                                  {proposal.name || 'Recette'}
                                </Text>
                              </View>
                              <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: '#00D984', fontSize: fp(20), fontWeight: '800' }}>
                                  {proposal.kcal || '—'}
                                </Text>
                                <Text style={{ color: '#888', fontSize: fp(11) }}>kcal</Text>
                              </View>
                            </View>

                            {/* Ligne 2 — Description */}
                            {proposal.description && (
                              <Text style={{
                                color: '#AAA', fontSize: fp(12),
                                fontStyle: 'italic', marginBottom: wp(8),
                              }} numberOfLines={2}>
                                "{proposal.description}"
                              </Text>
                            )}

                            {/* Ligne 3 — Macros + temps */}
                            <View style={{ flexDirection: 'row', gap: wp(10), marginBottom: wp(10) }}>
                              <Text style={{ color: '#FF6B8A', fontSize: fp(9), fontWeight: '600' }}>
                                P: {proposal.protein || 0}g
                              </Text>
                              <Text style={{ color: '#FFD93D', fontSize: fp(9), fontWeight: '600' }}>
                                G: {proposal.carbs || 0}g
                              </Text>
                              <Text style={{ color: '#4DA6FF', fontSize: fp(9), fontWeight: '600' }}>
                                L: {proposal.fat || 0}g
                              </Text>
                              <Text style={{ color: '#888', fontSize: fp(8) }}>
                                • {proposal.time || '20 min'}
                              </Text>
                            </View>

                            {/* Ligne 4 — Commentaire ALIXEN */}
                            {proposal.comment ? (
                              <View style={{
                                backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: 10,
                                padding: wp(10), marginBottom: wp(8),
                                flexDirection: 'row',
                              }}>
                                <Text style={{ fontSize: fp(12), marginRight: wp(6), marginTop: wp(1) }}>💬</Text>
                                <Text style={{
                                  color: '#CCC', fontSize: fp(11), fontStyle: 'italic',
                                  flex: 1, lineHeight: fp(16),
                                }}>
                                  {proposal.comment}
                                </Text>
                              </View>
                            ) : null}

                            {/* Ligne 5 — Hydratation */}
                            {proposal.water_ml ? (
                              <View style={{
                                flexDirection: 'row', alignItems: 'center',
                                marginBottom: wp(10),
                              }}>
                                <Text style={{ fontSize: fp(11), marginRight: wp(4) }}>💧</Text>
                                <Text style={{ color: '#00E5FF', fontSize: fp(10) }}>
                                  Boire {proposal.water_ml}ml d'eau{proposal.water_tip ? ' — ' + proposal.water_tip : ''}
                                </Text>
                              </View>
                            ) : null}

                            {/* Ligne 6 — Bouton contour emerald */}
                            <View style={{
                              paddingVertical: wp(8), borderRadius: 10,
                              backgroundColor: 'transparent',
                              borderWidth: 1, borderColor: '#00D984',
                              alignItems: 'center',
                            }}>
                              <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '700' }}>
                                Voir la recette →
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}

                      {/* Catégories alternatives */}
                      {alixenAltCategories.length > 0 && (
                        <View style={{ marginTop: wp(4), marginBottom: wp(8) }}>
                          <Text style={{ color: '#888', fontSize: fp(11), marginBottom: wp(8) }}>
                            Pas convaincu ? Essaie plutôt :
                          </Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: wp(8) }}>
                            {alixenAltCategories.map(function(altCat, altIdx) {
                              var altLabel = altCat.label || altCat;
                              return (
                                <Pressable
                                  key={altIdx}
                                  onPress={function() {
                                    setAlixenLoading(true);
                                    setAlixenProposals([]);
                                    setAlixenAltCategories([]);
                                    setAlixenGlobalComment(null);
                                    generateAlixenProposals(altLabel);
                                  }}
                                  style={function(state) {
                                    return {
                                      backgroundColor: state.pressed ? '#333A44' : '#2A303B',
                                      borderRadius: 20,
                                      borderWidth: 1,
                                      borderColor: state.pressed ? 'rgba(0,217,132,0.3)' : '#3A3F46',
                                      paddingHorizontal: wp(16),
                                      paddingVertical: wp(8),
                                    };
                                  }}
                                >
                                  <Text style={{ color: '#CCC', fontSize: fp(11) }}>{altLabel}</Text>
                                </Pressable>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}

                      {/* Bouton "Autres suggestions" — MetalCard simple */}
                      <Pressable
                        onPress={function() {
                          setAlixenLoading(true);
                          generateAlixenProposals(alixenCategory);
                        }}
                        style={function(state) {
                          return {
                            paddingVertical: wp(10), borderRadius: 14,
                            backgroundColor: state.pressed ? '#333A44' : '#2A303B',
                            borderWidth: 1, borderColor: '#3A3F46',
                            alignItems: 'center', marginTop: wp(6),
                          };
                        }}
                      >
                        <Text style={{ color: '#AAA', fontSize: fp(11), fontWeight: '600' }}>
                          ↻ Autres suggestions
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={function() {
                          setAlixenRecipeScreen('my_ingredients');
                          setAlixenMyIngredients([]);
                          setAlixenIngSearch('');
                        }}
                        style={{ paddingVertical: wp(10), alignItems: 'center', marginTop: wp(4) }}
                      >
                        <Text style={{ color: '#D4AF37', fontSize: fp(11), fontWeight: '600' }}>
                          🔍 Je préfère proposer mes ingrédients
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {/* ═══ ÉCRAN MES INGRÉDIENTS ═══ */}
              {alixenRecipeScreen === 'my_ingredients' && (
                <View style={{ paddingHorizontal: wp(16), paddingTop: wp(14) }}>

                  <Pressable onPress={function() { setAlixenRecipeScreen('welcome'); }}>
                    <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600', marginBottom: wp(12) }}>← Retour</Text>
                  </Pressable>

                  <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800', marginBottom: wp(4) }}>
                    🔍 Mes ingrédients
                  </Text>
                  <Text style={{ color: '#5A6070', fontSize: fp(10), marginBottom: wp(16) }}>
                    Sélectionne tes ingrédients et ALIXEN créera une recette sur mesure
                  </Text>

                  {alixenMyIngredients.length > 0 && (
                    <View style={{
                      flexDirection: 'row', flexWrap: 'wrap', gap: wp(6),
                      marginBottom: wp(12),
                    }}>
                      {alixenMyIngredients.map(function(ing, idx) {
                        return (
                          <Pressable
                            key={idx}
                            onPress={function() {
                              setAlixenMyIngredients(function(prev) {
                                return prev.filter(function(_, i) { return i !== idx; });
                              });
                            }}
                            style={{
                              flexDirection: 'row', alignItems: 'center',
                              backgroundColor: 'rgba(0,217,132,0.08)',
                              borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(6),
                              borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                            }}
                          >
                            <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>{ing.name}</Text>
                            <Text style={{ color: '#FF6B6B', fontSize: fp(12), fontWeight: '700', marginLeft: wp(6) }}>×</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: 14, paddingHorizontal: wp(12),
                    borderWidth: 1, borderColor: alixenIngSearch.length > 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.05)',
                  }}>
                    <Text style={{ color: '#5A6070', fontSize: 16, marginRight: 8 }}>🔍</Text>
                    <TextInput
                      value={alixenIngSearch}
                      onChangeText={function(text) {
                        setAlixenIngSearch(text);
                        if (text.length >= 2) {
                          setAlixenIngSearching(true);
                          supabase.rpc('search_ingredients_fuzzy', {
                            search_term: text,
                            max_results: 6,
                          }).then(function(res) {
                            setAlixenIngResults(res.data || []);
                            setAlixenIngSearching(false);
                          }).catch(function() {
                            setAlixenIngSearching(false);
                          });
                        } else {
                          setAlixenIngResults([]);
                        }
                      }}
                      placeholder="Rechercher un ingrédient..."
                      placeholderTextColor="#5A6070"
                      style={{ flex: 1, color: '#EAEEF3', fontSize: fp(13), paddingVertical: wp(12) }}
                    />
                    {alixenIngSearch.length > 0 && (
                      <Pressable onPress={function() { setAlixenIngSearch(''); setAlixenIngResults([]); }}>
                        <Text style={{ color: '#8892A0', fontSize: 16 }}>✕</Text>
                      </Pressable>
                    )}
                  </View>

                  {alixenIngSearching && (
                    <Text style={{ color: '#D4AF37', fontSize: fp(10), marginTop: wp(6), fontStyle: 'italic' }}>Recherche...</Text>
                  )}
                  {alixenIngResults.length > 0 && (
                    <View style={{
                      marginTop: wp(8), borderRadius: 14,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                      overflow: 'hidden',
                    }}>
                      {alixenIngResults.map(function(result, i) {
                        var already = alixenMyIngredients.some(function(ing) { return ing.name === result.name; });
                        return (
                          <Pressable
                            key={i}
                            onPress={function() {
                              if (!already) {
                                setAlixenMyIngredients(function(prev) { return prev.concat([result]); });
                                setAlixenIngSearch('');
                                setAlixenIngResults([]);
                              }
                            }}
                            style={function(state) {
                              return {
                                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                                paddingVertical: wp(10), paddingHorizontal: wp(12),
                                backgroundColor: state.pressed ? 'rgba(212,175,55,0.08)' : 'transparent',
                                borderBottomWidth: i < alixenIngResults.length - 1 ? 0.5 : 0,
                                borderBottomColor: 'rgba(255,255,255,0.05)',
                                opacity: already ? 0.4 : 1,
                              };
                            }}
                          >
                            <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '600', flex: 1 }}>{result.name}</Text>
                            <Text style={{ color: already ? '#5A6070' : '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>
                              {already ? '✓ Ajouté' : '+ Ajouter'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  {alixenMyIngredients.length >= 2 && (
                    <Pressable
                      onPress={function() {
                        var costCheck = checkAlixenRecipeCost();
                        if (!costCheck.allowed) {
                          showModal('error', '💎 Lix insuffisants', 'Il te faut 50 Lix pour une recette ALIXEN.\n\nReviens demain pour ta recette gratuite ou obtiens des Lix dans le LixVerse.');
                          return;
                        }
                        if (costCheck.cost > 0) {
                          showModal('confirm', '🤖 Recette ALIXEN', 'Cette génération coûte 50 Lix.\nSolde : ' + lixBalance + ' Lix', {
                            confirmText: 'Confirmer (50 Lix)', cancelText: 'Annuler',
                            onConfirm: function() {
                              closeModal();
                              deductAlixenLix(50).then(function(success) {
                                if (success) {
                                  setAlixenRecipeScreen('proposals');
                                  setAlixenLoading(true);
                                  generateAlixenProposals('my_ingredients');
                                }
                              });
                            },
                          });
                          return;
                        }
                        setAlixenRecipeScreen('proposals');
                        setAlixenLoading(true);
                        generateAlixenProposals('my_ingredients');
                      }}
                      style={function(state) {
                        return {
                          marginTop: wp(20), paddingVertical: wp(14), borderRadius: wp(14),
                          backgroundColor: state.pressed ? '#00B572' : '#00D984',
                          alignItems: 'center',
                        };
                      }}
                    >
                      <Text style={{ color: '#0D1117', fontSize: fp(15), fontWeight: '800' }}>
                        🤖 ALIXEN, fais-moi une recette !
                      </Text>
                      <Text style={{ color: 'rgba(0,0,0,0.5)', fontSize: fp(10), marginTop: wp(2) }}>
                        Avec {alixenMyIngredients.length} ingrédients sélectionnés
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* ═══ ÉCRAN DETAIL RECETTE ALIXEN ═══ */}
              {alixenRecipeScreen === 'detail' && alixenSelectedRecipe && (
                <View style={{ paddingHorizontal: wp(16), paddingTop: wp(14) }}>

                  <Pressable onPress={function() { setAlixenRecipeScreen('proposals'); setAlixenAdvice(null); }}>
                    <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600', marginBottom: wp(12) }}>← Retour aux suggestions</Text>
                  </Pressable>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                    <Text style={{ fontSize: fp(22), marginRight: wp(8) }}>🍽️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#EAEEF3', fontSize: fp(18), fontWeight: '800' }}>
                        {alixenSelectedRecipe.name}
                      </Text>
                      <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: wp(2) }}>
                        Par ALIXEN · Adaptée pour toi
                      </Text>
                    </View>
                  </View>

                  <View style={{
                    borderRadius: wp(14), padding: 1, backgroundColor: '#4A4F55',
                    marginTop: wp(12), marginBottom: wp(16),
                  }}>
                    <LinearGradient
                      colors={['#3A3F46', '#252A30', '#1A1D22']}
                      style={{ borderRadius: wp(13), padding: wp(14), alignItems: 'center' }}
                    >
                      <Text style={{ color: '#FF8C42', fontSize: fp(26), fontWeight: '900' }}>
                        {alixenSelectedRecipe.kcal || 0} kcal
                      </Text>
                      <View style={{ flexDirection: 'row', marginTop: wp(8), gap: wp(14) }}>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', marginBottom: 2 }} />
                          <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700' }}>{alixenSelectedRecipe.protein || 0}g</Text>
                          <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Protéines</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginBottom: 2 }} />
                          <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700' }}>{alixenSelectedRecipe.carbs || 0}g</Text>
                          <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Glucides</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4DA6FF', marginBottom: 2 }} />
                          <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700' }}>{alixenSelectedRecipe.fat || 0}g</Text>
                          <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Lipides</Text>
                        </View>
                      </View>

                      {alixenContext && (
                        <View style={{ width: '100%', marginTop: wp(12) }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                            <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Couverture objectif restant</Text>
                            <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                              {Math.min(100, Math.round((alixenSelectedRecipe.kcal / Math.max(1, alixenContext.remaining)) * 100))}%
                            </Text>
                          </View>
                          <View style={{ height: 4, backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                            <View style={{
                              height: '100%', borderRadius: 2,
                              backgroundColor: alixenSelectedRecipe.kcal > alixenContext.remaining ? '#FF8C42' : '#00D984',
                              width: Math.min(100, Math.round((alixenSelectedRecipe.kcal / Math.max(1, alixenContext.remaining)) * 100)) + '%',
                            }} />
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </View>

                  <View style={{ marginBottom: wp(16) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
                      <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#D4AF37', marginRight: wp(8) }} />
                      <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '700' }}>
                        Ingrédients (1 personne)
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: '#252A30', borderRadius: wp(12),
                      borderWidth: 1, borderColor: '#4A4F55', overflow: 'hidden',
                    }}>
                      {(alixenSelectedRecipe.ingredients || []).map(function(ing, idx) {
                        return (
                          <View key={idx} style={{
                            flexDirection: 'row', alignItems: 'center',
                            paddingVertical: wp(10), paddingHorizontal: wp(14),
                            borderBottomWidth: idx < (alixenSelectedRecipe.ingredients || []).length - 1 ? 1 : 0,
                            borderBottomColor: 'rgba(74,79,85,0.3)',
                          }}>
                            <View style={{
                              width: 6, height: 6, borderRadius: 3,
                              backgroundColor: idx < 3 ? '#D4AF37' : '#5A6070',
                              marginRight: wp(10),
                            }} />
                            <Text style={{ color: '#E5E7EB', fontSize: fp(12), flex: 1 }}>
                              {ing.name}
                            </Text>
                            <Text style={{ color: '#D4AF37', fontSize: fp(11), fontWeight: '700', marginRight: wp(10) }}>
                              {ing.quantity}
                            </Text>
                            <Text style={{ color: '#5A6070', fontSize: fp(9) }}>
                              {ing.kcal || ''}{ing.kcal ? ' kcal' : ''}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  {alixenSelectedRecipe.steps && (
                    <View style={{ marginBottom: wp(16) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
                        <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: '#FF8C42', marginRight: wp(8) }} />
                        <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '700' }}>Préparation</Text>
                        {alixenSelectedRecipe.time && (
                          <Text style={{ color: '#5A6070', fontSize: fp(10), marginLeft: wp(8) }}>
                            ⏱ {alixenSelectedRecipe.time}
                          </Text>
                        )}
                      </View>
                      <View style={{
                        backgroundColor: '#252A30', borderRadius: wp(12),
                        borderWidth: 1, borderColor: '#4A4F55', padding: wp(14),
                      }}>
                        <Text style={{ color: '#D1D5DB', fontSize: fp(12), lineHeight: fp(20) }}>
                          {alixenSelectedRecipe.steps}
                        </Text>
                      </View>
                    </View>
                  )}

                  {alixenAdvice && (
                    <View style={{
                      backgroundColor: 'rgba(255,140,66,0.06)',
                      borderRadius: wp(12), padding: wp(14),
                      borderWidth: 1, borderColor: 'rgba(255,140,66,0.2)',
                      marginBottom: wp(16),
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                        <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>🤖</Text>
                        <Text style={{ color: '#FF8C42', fontSize: fp(11), fontWeight: '700' }}>Conseil ALIXEN</Text>
                      </View>
                      <Text style={{ color: '#EAEEF3', fontSize: fp(11), lineHeight: fp(17) }}>
                        {alixenAdvice}
                      </Text>
                    </View>
                  )}

                  <View style={{ gap: wp(10), marginBottom: wp(40) }}>
                    <Pressable
                      onPress={function() {
                        var hour = new Date().getHours();
                        var slot = hour < 10 ? 'breakfast' : hour < 14 ? 'lunch' : hour < 21 ? 'dinner' : 'snack';

                        if (alixenContext && alixenContext.timeOfDay === 'night' && alixenSelectedRecipe.kcal > 500) {
                          setAlixenAdvice(
                            'D\'accord pour le ' + alixenSelectedRecipe.name + ' ! Comme c\'est riche (' + alixenSelectedRecipe.kcal + ' kcal) et qu\'il est tard, je te recommande :\n' +
                            '• Une petite marche de 15 min après le repas\n' +
                            '• Boire 300ml d\'eau avant de manger\n' +
                            '• Demain matin, un petit-déjeuner léger pour équilibrer'
                          );
                        }

                        var recipe = alixenSelectedRecipe;
                        supabase.rpc('add_meal_and_update_summary', {
                          p_user_id: userId,
                          p_meal_type: slot,
                          p_food_name: recipe.name,
                          p_calories: Math.round(recipe.kcal || 0),
                          p_protein: Math.round((recipe.protein || 0) * 10) / 10,
                          p_carbs: Math.round((recipe.carbs || 0) * 10) / 10,
                          p_fat: Math.round((recipe.fat || 0) * 10) / 10,
                          p_fiber: 0,
                          p_source: 'alixen_recipe',
                          p_confidence: null,
                          p_photo_url: null,
                          p_ingredients_detail: recipe.ingredients || [],
                          p_food_db_id: null,
                          p_volume_ml: null,
                          p_texture: null,
                          p_portion_g: null,
                        }).then(function(res) {
                          if (res.error) {
                            showModal('error', 'Erreur', res.error.message);
                          } else {
                            showModal('success', '✅ Ajouté !', recipe.name + ' ajouté au ' + (slot === 'breakfast' ? 'petit-déjeuner' : slot === 'lunch' ? 'déjeuner' : slot === 'dinner' ? 'dîner' : 'snack') + '.', { onClose: function() { closeModal(); onMealSaved(); onClose(); } });
                            setAlixenFreeUsedToday(true);
                          }
                        });
                      }}
                      style={function(state) {
                        return {
                          paddingVertical: wp(14), borderRadius: wp(14),
                          backgroundColor: state.pressed ? '#00B572' : '#00D984',
                          alignItems: 'center',
                        };
                      }}
                    >
                      <Text style={{ color: '#0D1117', fontSize: fp(15), fontWeight: '800' }}>
                        ✓ Ajouter à mes repas
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={function() {
                        onOpenCooking(alixenSelectedRecipe);
                      }}
                      style={function(state) {
                        return {
                          paddingVertical: wp(14), borderRadius: wp(14),
                          backgroundColor: state.pressed ? '#CC7A00' : '#FF8C42',
                          alignItems: 'center', flexDirection: 'row',
                          justifyContent: 'center', gap: wp(8),
                        };
                      }}
                    >
                      <Text style={{ fontSize: fp(18) }}>👨‍🍳</Text>
                      <View>
                        <Text style={{ color: '#FFFFFF', fontSize: fp(15), fontWeight: '800' }}>
                          Préparation Assistée
                        </Text>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: fp(9) }}>
                          Minuteurs intelligents + étapes guidées
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={function() {
                        showModal('info', '📝 Modifier', 'La modification des quantités sera disponible prochainement.');
                      }}
                      style={function(state) {
                        return {
                          paddingVertical: wp(12), borderRadius: wp(14),
                          backgroundColor: state.pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                          borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                          alignItems: 'center',
                        };
                      }}
                    >
                      <Text style={{ color: '#8892A0', fontSize: fp(12), fontWeight: '600' }}>
                        📝 Modifier les quantités
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={function() {
                        setAlixenRecipeScreen('proposals');
                        setAlixenAdvice(null);
                      }}
                      style={{ paddingVertical: wp(8), alignItems: 'center' }}
                    >
                      <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>
                        ↻ Autre recette
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

            </ScrollView>
          )}

          {/* === PHASE 7-8 placeholder removed === */}
        </View>
      )}

      {/* ══════ MODAL — Fiche Recette Détaillée ══════ */}
      <Modal
        visible={selectedRecipe !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={closeRecipeDetail}
      >
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <StatusBar barStyle="light-content" backgroundColor="#1A1D22" />

          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {selectedRecipe && (
              <>
                {/* Image header */}
                <View style={{ width: '100%', height: wp(280), backgroundColor: '#252A30' }}>
                  <Image
                    source={{ uri: selectedRecipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }}
                    style={{ width: '100%', height: '100%', opacity: 0.85 }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(26,29,34,0.6)', '#1A1D22']}
                    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: wp(100) }}
                  />
                  <TouchableOpacity
                    onPress={closeRecipeDetail}
                    style={{
                      position: 'absolute', top: wp(45), right: wp(16),
                      width: wp(36), height: wp(36), borderRadius: wp(18),
                      backgroundColor: 'rgba(37,42,48,0.9)',
                      borderWidth: 1, borderColor: '#4A4F55',
                      alignItems: 'center', justifyContent: 'center', zIndex: 10,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: fp(16), fontWeight: '700' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Infos principales */}
                <View style={{ paddingHorizontal: wp(18), marginTop: -wp(20) }}>
                  <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#FFFFFF', marginBottom: wp(4) }}>
                    {getFlag(selectedRecipe.country_origin)} {selectedRecipe.name}
                  </Text>
                  <Text style={{ fontSize: fp(12), color: '#9CA3AF', marginBottom: wp(2) }}>
                    {selectedRecipe.country_origin} · {selectedRecipe.region}
                  </Text>
                  <View style={{
                    alignSelf: 'flex-start', backgroundColor: 'rgba(0,217,132,0.15)',
                    borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(3),
                    marginTop: wp(6), marginBottom: wp(16),
                  }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>
                      {selectedRecipe.category}
                    </Text>
                  </View>

                  {/* Card valeurs nutritionnelles */}
                  <View style={{
                    borderRadius: wp(14), borderWidth: 1, borderColor: '#4A4F55',
                    padding: wp(14), marginBottom: wp(20), backgroundColor: '#252A30',
                  }}>
                    <Text style={{
                      fontSize: fp(11), fontWeight: '700', color: '#D4AF37',
                      letterSpacing: 1.5, textTransform: 'uppercase',
                      marginBottom: wp(12), textAlign: 'center',
                    }}>
                      Valeurs nutritionnelles · 100g
                    </Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(12) }}>
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: fp(10), color: '#9CA3AF', marginBottom: wp(3) }}>🔥 Calories</Text>
                        <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#FF8C42' }}>
                          {Math.round(selectedRecipe.kcal_per_100g)}
                        </Text>
                        <Text style={{ fontSize: fp(9), color: '#6B7280' }}>kcal</Text>
                      </View>
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: fp(10), color: '#9CA3AF', marginBottom: wp(3) }}>Protéines</Text>
                        <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#FF6B6B' }}>
                          {selectedRecipe.protein_per_100g?.toFixed(1) || '0'}
                        </Text>
                        <View style={{ width: wp(50), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,107,107,0.15)', marginTop: wp(3) }}>
                          <View style={{ width: `${Math.min((selectedRecipe.protein_per_100g || 0) / 30 * 100, 100)}%`, height: '100%', borderRadius: wp(2), backgroundColor: '#FF6B6B' }} />
                        </View>
                        <Text style={{ fontSize: fp(8), color: '#6B7280', marginTop: wp(2) }}>g</Text>
                      </View>
                      <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: fp(10), color: '#9CA3AF', marginBottom: wp(3) }}>Glucides</Text>
                        <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#FFD93D' }}>
                          {selectedRecipe.carbs_per_100g?.toFixed(1) || '0'}
                        </Text>
                        <View style={{ width: wp(50), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,217,61,0.15)', marginTop: wp(3) }}>
                          <View style={{ width: `${Math.min((selectedRecipe.carbs_per_100g || 0) / 60 * 100, 100)}%`, height: '100%', borderRadius: wp(2), backgroundColor: '#FFD93D' }} />
                        </View>
                        <Text style={{ fontSize: fp(8), color: '#6B7280', marginTop: wp(2) }}>g</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: wp(30) }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(10), color: '#9CA3AF', marginBottom: wp(3) }}>Lipides</Text>
                        <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#4DA6FF' }}>
                          {selectedRecipe.fat_per_100g?.toFixed(1) || '0'}
                        </Text>
                        <View style={{ width: wp(50), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(77,166,255,0.15)', marginTop: wp(3) }}>
                          <View style={{ width: `${Math.min((selectedRecipe.fat_per_100g || 0) / 30 * 100, 100)}%`, height: '100%', borderRadius: wp(2), backgroundColor: '#4DA6FF' }} />
                        </View>
                        <Text style={{ fontSize: fp(8), color: '#6B7280', marginTop: wp(2) }}>g</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(10), color: '#9CA3AF', marginBottom: wp(3) }}>Fibres</Text>
                        <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#00D984' }}>
                          {selectedRecipe.fiber_per_100g?.toFixed(1) || '0'}
                        </Text>
                        <View style={{ width: wp(50), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(0,217,132,0.15)', marginTop: wp(3) }}>
                          <View style={{ width: `${Math.min((selectedRecipe.fiber_per_100g || 0) / 15 * 100, 100)}%`, height: '100%', borderRadius: wp(2), backgroundColor: '#00D984' }} />
                        </View>
                        <Text style={{ fontSize: fp(8), color: '#6B7280', marginTop: wp(2) }}>g</Text>
                      </View>
                    </View>
                  </View>

                  {/* Section ingrédients */}
                  <View style={{ marginBottom: wp(20) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(12) }}>
                      <View style={{ width: wp(3), height: wp(18), backgroundColor: '#D4AF37', borderRadius: wp(2), marginRight: wp(8) }} />
                      <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFFFFF' }}>Ingrédients</Text>
                      <Text style={{ fontSize: fp(11), color: '#6B7280', marginLeft: wp(6) }}>({recipeIngredients.length})</Text>
                    </View>

                    {loadingIngredients ? (
                      <View style={{ paddingVertical: wp(20), alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#D4AF37" />
                        <Text style={{ fontSize: fp(10), color: '#6B7280', marginTop: wp(6) }}>Chargement des ingrédients...</Text>
                      </View>
                    ) : recipeIngredients.length === 0 ? (
                      <View style={{
                        paddingVertical: wp(16), paddingHorizontal: wp(12),
                        backgroundColor: 'rgba(255,140,66,0.08)', borderRadius: wp(10),
                        borderWidth: 1, borderColor: 'rgba(255,140,66,0.2)',
                      }}>
                        <Text style={{ fontSize: fp(11), color: '#FF8C42', textAlign: 'center' }}>
                          Composition détaillée bientôt disponible
                        </Text>
                      </View>
                    ) : (
                      <View style={{
                        backgroundColor: '#252A30', borderRadius: wp(12),
                        borderWidth: 1, borderColor: '#4A4F55', overflow: 'hidden',
                      }}>
                        {recipeIngredients.map((ing, index) => (
                          <View key={index} style={{
                            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                            paddingVertical: wp(10), paddingHorizontal: wp(14),
                            borderBottomWidth: index < recipeIngredients.length - 1 ? 1 : 0,
                            borderBottomColor: 'rgba(74,79,85,0.4)',
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                              <View style={{
                                width: wp(6), height: wp(6), borderRadius: wp(3),
                                backgroundColor: index < 3 ? '#D4AF37' : index < 6 ? '#FF8C42' : '#4A4F55',
                                marginRight: wp(10),
                              }} />
                              <Text style={{ fontSize: fp(12), color: '#E5E7EB', flex: 1 }} numberOfLines={1}>
                                {ing.component_name}
                              </Text>
                            </View>
                            <Text style={{
                              fontSize: fp(11), fontWeight: '700',
                              color: index < 3 ? '#D4AF37' : '#9CA3AF', marginLeft: wp(8),
                            }}>
                              {ing.percentage_estimate}%
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* Section description */}
                  {selectedRecipe.description ? (
                    <View style={{ marginBottom: wp(20) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
                        <View style={{ width: wp(3), height: wp(18), backgroundColor: '#4DA6FF', borderRadius: wp(2), marginRight: wp(8) }} />
                        <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFFFFF' }}>Description</Text>
                      </View>
                      <Text style={{ fontSize: fp(12), color: '#D1D5DB', lineHeight: fp(18), paddingHorizontal: wp(4) }}>
                        {selectedRecipe.description}
                      </Text>
                    </View>
                  ) : null}

                  {/* Section préparation ALIXEN */}
                  <View style={{ marginBottom: wp(20) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(12) }}>
                      <View style={{ width: wp(3), height: wp(18), backgroundColor: '#FF8C42', borderRadius: wp(2), marginRight: wp(8) }} />
                      <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFFFFF' }}>Préparation</Text>
                      <Text style={{ fontSize: fp(9), color: '#FF8C42', marginLeft: wp(8), fontStyle: 'italic' }}>par ALIXEN</Text>
                    </View>

                    {!recipeSteps && !loadingSteps && (
                      <TouchableOpacity
                        onPress={generateRecipeSteps}
                        activeOpacity={0.85}
                        style={{
                          borderRadius: wp(14), borderWidth: 1.5, borderColor: '#FF8C42',
                          paddingVertical: wp(16), paddingHorizontal: wp(16),
                          alignItems: 'center', backgroundColor: 'rgba(255,140,66,0.08)',
                        }}
                      >
                        <Text style={{ fontSize: fp(22), marginBottom: wp(6) }}>🧑‍🍳</Text>
                        <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FF8C42', marginBottom: wp(4) }}>
                          Générer la recette complète
                        </Text>
                        <Text style={{ fontSize: fp(10), color: '#6B7280' }}>
                          15 Lix · Étapes détaillées par ALIXEN IA
                        </Text>
                      </TouchableOpacity>
                    )}

                    {loadingSteps && (
                      <View style={{
                        borderRadius: wp(14), borderWidth: 1, borderColor: '#4A4F55',
                        paddingVertical: wp(24), paddingHorizontal: wp(16),
                        alignItems: 'center', backgroundColor: '#252A30',
                      }}>
                        <ActivityIndicator size="small" color="#FF8C42" />
                        <Text style={{ fontSize: fp(11), color: '#FF8C42', marginTop: wp(10), fontStyle: 'italic' }}>
                          ALIXEN prépare votre recette...
                        </Text>
                        <Text style={{ fontSize: fp(9), color: '#6B7280', marginTop: wp(4) }}>
                          Analyse des ingrédients et traditions culinaires
                        </Text>
                      </View>
                    )}

                    {recipeSteps === '__ERROR__' && (
                      <View style={{
                        borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)',
                        paddingVertical: wp(16), paddingHorizontal: wp(16),
                        backgroundColor: 'rgba(255,107,107,0.08)', alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: fp(11), color: '#FF6B6B', textAlign: 'center' }}>
                          Impossible de générer la recette pour le moment.
                        </Text>
                        <TouchableOpacity onPress={() => { setRecipeSteps(null); setDisplayedSteps(''); }} style={{ marginTop: wp(10) }}>
                          <Text style={{ fontSize: fp(11), color: '#FF8C42', fontWeight: '600' }}>Réessayer</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {recipeSteps && recipeSteps !== '__ERROR__' && (
                      <View style={{
                        borderRadius: wp(14), borderWidth: 1, borderColor: '#4A4F55',
                        padding: wp(16), backgroundColor: '#252A30',
                      }}>
                        <Text style={{ fontSize: fp(12), color: '#D1D5DB', lineHeight: fp(20) }}>
                          {displayedSteps}
                          {isTyping && (
                            <Text style={{ color: '#FF8C42', fontWeight: '700' }}>▊</Text>
                          )}
                        </Text>
                        {!isTyping && displayedSteps.length > 0 && (
                          <View style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                            marginTop: wp(14), paddingTop: wp(10),
                            borderTopWidth: 1, borderTopColor: 'rgba(74,79,85,0.4)',
                          }}>
                            <Text style={{ fontSize: fp(9), color: '#6B7280', fontStyle: 'italic' }}>
                              🤖 Recette générée par ALIXEN · basée sur {recipeIngredients.length} ingrédients
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Bouton ajouter */}
                  <TouchableOpacity
                    onPress={() => setShowAddConfirm(true)}
                    activeOpacity={0.85}
                    style={{
                      borderRadius: wp(14), borderWidth: 1.5, borderColor: '#00D984',
                      paddingVertical: wp(14), alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'row', marginBottom: wp(40),
                      backgroundColor: 'rgba(0,217,132,0.12)',
                    }}
                  >
                    <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#00D984' }}>
                      🍽️  Ajouter ce plat
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ══════ MODAL — Confirmation ajout repas ══════ */}
      <Modal
        visible={showAddConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowAddConfirm(false);
          setSelectedSlot(null);
        }}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: wp(20),
        }}>
          <View style={{
            width: '100%', backgroundColor: '#1A1D22',
            borderRadius: wp(18), borderWidth: 1, borderColor: '#4A4F55',
            padding: wp(20),
          }}>
            <Text style={{
              fontSize: fp(16), fontWeight: '800', color: '#FFFFFF',
              textAlign: 'center', marginBottom: wp(4),
            }}>
              Ajouter à mon journal
            </Text>

            {selectedRecipe && (
              <>
                <View style={{
                  backgroundColor: '#252A30', borderRadius: wp(12),
                  padding: wp(14), marginTop: wp(14), marginBottom: wp(16),
                  borderWidth: 1, borderColor: '#4A4F55',
                }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFFFFF', marginBottom: wp(4) }}>
                    {getFlag(selectedRecipe.country_origin)} {selectedRecipe.name}
                  </Text>
                  <Text style={{ fontSize: fp(11), color: '#9CA3AF', marginBottom: wp(6) }}>
                    Portion : {selectedRecipe.category?.includes('Snack') || selectedRecipe.category?.includes('Accompagnement') ? '150g' : '300g'}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: wp(12) }}>
                    <Text style={{ fontSize: fp(11), color: '#FF8C42', fontWeight: '700' }}>
                      🔥 {Math.round(selectedRecipe.kcal_per_100g * (selectedRecipe.category?.includes('Snack') || selectedRecipe.category?.includes('Accompagnement') ? 1.5 : 3))} kcal
                    </Text>
                    <Text style={{ fontSize: fp(10), color: '#FF6B6B' }}>
                      P:{(selectedRecipe.protein_per_100g * (selectedRecipe.category?.includes('Snack') || selectedRecipe.category?.includes('Accompagnement') ? 1.5 : 3)).toFixed(0)}g
                    </Text>
                    <Text style={{ fontSize: fp(10), color: '#FFD93D' }}>
                      G:{(selectedRecipe.carbs_per_100g * (selectedRecipe.category?.includes('Snack') || selectedRecipe.category?.includes('Accompagnement') ? 1.5 : 3)).toFixed(0)}g
                    </Text>
                    <Text style={{ fontSize: fp(10), color: '#4DA6FF' }}>
                      L:{(selectedRecipe.fat_per_100g * (selectedRecipe.category?.includes('Snack') || selectedRecipe.category?.includes('Accompagnement') ? 1.5 : 3)).toFixed(0)}g
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: fp(12), fontWeight: '600', color: '#9CA3AF', marginBottom: wp(10) }}>
                  Choisir le créneau :
                </Text>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(20) }}>
                  {MEAL_SLOTS.map((slot) => (
                    <TouchableOpacity
                      key={slot.key}
                      onPress={() => setSelectedSlot(slot.key)}
                      style={{
                        flex: 1, minWidth: '45%',
                        paddingVertical: wp(12), paddingHorizontal: wp(10),
                        borderRadius: wp(10), borderWidth: 1.5,
                        borderColor: selectedSlot === slot.key ? '#00D984' : '#4A4F55',
                        backgroundColor: selectedSlot === slot.key ? 'rgba(0,217,132,0.12)' : '#252A30',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{
                        fontSize: fp(11),
                        fontWeight: selectedSlot === slot.key ? '700' : '500',
                        color: selectedSlot === slot.key ? '#00D984' : '#9CA3AF',
                      }}>
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: wp(10) }}>
                  <TouchableOpacity
                    onPress={() => { setShowAddConfirm(false); setSelectedSlot(null); }}
                    style={{
                      flex: 1, paddingVertical: wp(13), borderRadius: wp(12),
                      borderWidth: 1, borderColor: '#4A4F55', alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: fp(13), color: '#9CA3AF', fontWeight: '600' }}>Annuler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={addRecipeToMeals}
                    disabled={!selectedSlot || addingMeal}
                    style={{
                      flex: 1.5, paddingVertical: wp(13), borderRadius: wp(12),
                      backgroundColor: selectedSlot ? '#00D984' : 'rgba(0,217,132,0.2)',
                      alignItems: 'center', opacity: selectedSlot ? 1 : 0.5,
                    }}
                  >
                    {addingMeal ? (
                      <ActivityIndicator size="small" color="#1A1D22" />
                    ) : (
                      <Text style={{
                        fontSize: fp(13), fontWeight: '700',
                        color: selectedSlot ? '#1A1D22' : '#6B7280',
                      }}>
                        Confirmer ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <LixumModal
        visible={modalCfg.visible}
        type={modalCfg.type}
        title={modalCfg.title}
        message={modalCfg.message}
        onConfirm={modalCfg.onConfirm}
        onClose={modalCfg.onClose || closeModal}
        confirmText={modalCfg.confirmText}
        cancelText={modalCfg.cancelText}
      />
    </View>
  );
}
