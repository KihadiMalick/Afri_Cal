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
      const userId = TEST_USER_ID;
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
      Alert.alert('Erreur', 'Impossible d\'ajouter ce plat. Réessayez.');
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
    try {
      var today = new Date().toISOString().split('T')[0];
      var hour = new Date().getHours();
      var minutes = new Date().getMinutes();

      var profileRes = await supabase
        .from('users_profile')
        .select('full_name, daily_calorie_target, weight, gender, activity_level, dietary_regime, current_mood, current_weather, bmr, tdee')
        .eq('user_id', TEST_USER_ID)
        .maybeSingle();
      var profile = profileRes.data || {};

      var summaryRes = await supabase
        .from('daily_summary')
        .select('total_calories, total_protein, total_carbs, total_fat, meals_count')
        .eq('user_id', TEST_USER_ID)
        .eq('date', today)
        .maybeSingle();
      var summary = summaryRes.data || { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, meals_count: 0 };

      var mealsRes = await supabase
        .from('meals')
        .select('food_name, calories, meal_type, meal_time')
        .eq('user_id', TEST_USER_ID)
        .eq('date', today)
        .order('meal_time', { ascending: true });
      var todayMealsList = mealsRes.data || [];

      var activitiesRes = await supabase
        .from('activities')
        .select('calories_burned')
        .eq('user_id', TEST_USER_ID)
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
          .eq('user_id', TEST_USER_ID)
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
          .eq('user_id', TEST_USER_ID)
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
        p_user_id: TEST_USER_ID,
        p_amount: cost,
        p_reason: 'alixen_recipe',
      });
      if (res.error) {
        var currentRes = await supabase
          .from('users_profile')
          .select('lix_balance')
          .eq('user_id', TEST_USER_ID)
          .single();
        var current = (currentRes.data || {}).lix_balance || 0;
        if (current < cost) return false;
        await supabase
          .from('users_profile')
          .update({ lix_balance: current - cost })
          .eq('user_id', TEST_USER_ID);
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
        Alert.alert('Erreur', 'Impossible de charger le contexte.');
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
            userId: TEST_USER_ID,
            message: prompt,
            mode: 'recipe',
          }),
        }
      );

      var data = await response.json();
      var rawMessage = data.message || data.reply || '';

      if (data.proposals && Array.isArray(data.proposals) && data.proposals.length > 0) {
        setAlixenProposals(data.proposals);
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
    <>
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

          {/* 2 Onglets : Général / Personnalisé */}
          <View style={{
            flexDirection: 'row', marginHorizontal: wp(16), marginTop: wp(10),
            borderRadius: 14, overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
          }}>
            <Pressable
              onPress={() => { setRecipesTab('general'); if (recipesData.length === 0) loadRecipes(0); }}
              style={{
                flex: 1, paddingVertical: wp(12), alignItems: 'center',
                backgroundColor: recipesTab === 'general' ? 'rgba(0,217,132,0.12)' : 'transparent',
                borderRightWidth: 0.5, borderRightColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <Text style={{ fontSize: 16, marginBottom: 2 }}>🌍</Text>
              <Text style={{
                color: recipesTab === 'general' ? '#00D984' : '#8892A0',
                fontSize: fp(11), fontWeight: recipesTab === 'general' ? '800' : '600',
              }}>{lang === 'fr' ? 'Général' : 'General'}</Text>
              <Text style={{ color: '#00D984', fontSize: fp(7), fontWeight: '600', marginTop: 1 }}>
                {lang === 'fr' ? '524 plats' : '524 dishes'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => { setRecipesTab('personalized'); loadMoodRecipes(); }}
              style={{
                flex: 1, paddingVertical: wp(12), alignItems: 'center',
                backgroundColor: recipesTab === 'personalized' ? 'rgba(212,175,55,0.10)' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 16, marginBottom: 2 }}>🤖</Text>
              <Text style={{
                color: recipesTab === 'personalized' ? '#D4AF37' : '#8892A0',
                fontSize: fp(11), fontWeight: recipesTab === 'personalized' ? '800' : '600',
              }}>ALIXEN Chef</Text>
              <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '600', marginTop: 1 }}>
                Recettes IA
              </Text>
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

          {/* === PHASE 7-8 : Onglet ALIXEN === */}
        </View>
      )}

      {/* === PHASE 9 : Modal fiche recette === */}
      {/* === PHASE 10 : Modal confirmation === */}
    </>
  );
}
