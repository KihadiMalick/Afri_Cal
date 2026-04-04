import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../config/supabase';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import { MEAL_SLOTS } from './repasConstants';

const SUPABASE_URL = 'https://yuhordnzfpcswztujozi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function ManualEntryScreen({ visible, onClose, onMealSaved }) {
  var _lc = useLang(); var lang = _lc.lang;

  // === ÉTATS ===
  const [manualTab, setManualTab] = useState('meals');
  const [manualPortionG, setManualPortionG] = useState(350);
  const [editingPortion, setEditingPortion] = useState(false);
  const [tempPortion, setTempPortion] = useState('350');
  const [manualMealType, setManualMealType] = useState(null);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [saveManualSuccess, setSaveManualSuccess] = useState(false);

  // Onglet Plats
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [mealSearchResults, setMealSearchResults] = useState([]);
  const [isMealSearching, setIsMealSearching] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealComponents, setMealComponents] = useState([]);

  // Onglet Ingrédients
  const [manualIngredients, setManualIngredients] = useState([]);
  const [ingSearchQuery, setIngSearchQuery] = useState('');
  const [ingSearchResults, setIngSearchResults] = useState([]);
  const [isIngSearching, setIsIngSearching] = useState(false);
  const [manualEditingQtyIndex, setManualEditingQtyIndex] = useState(null);
  const [manualTempQty, setManualTempQty] = useState('');
  const manualScrollRef = useRef(null);

  // === FONCTIONS ===

  const getAutoMealType = () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 14) return 'lunch';
    if (hour < 21) return 'dinner';
    return 'snack';
  };

  // Initialisation quand visible passe à true
  useEffect(() => {
    if (visible) {
      setManualTab('meals');
      setManualMealType(getAutoMealType());
      setManualPortionG(350);
      setEditingPortion(false);
      setTempPortion('350');
      setMealSearchQuery('');
      setMealSearchResults([]);
      setSelectedMeal(null);
      setMealComponents([]);
      setManualIngredients([]);
      setIngSearchQuery('');
      setIngSearchResults([]);
      setManualEditingQtyIndex(null);
      setManualTempQty('');
      setIsSavingManual(false);
      setSaveManualSuccess(false);
    }
  }, [visible]);

  const closeManualEntry = () => {
    setSelectedMeal(null);
    setMealComponents([]);
    setManualIngredients([]);
    onClose();
  };

  // --- ONGLET PLATS ---

  const searchMeals = async (query) => {
    setMealSearchQuery(query);
    if (query.length < 2) { setMealSearchResults([]); return; }
    setIsMealSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_meals_fuzzy', {
        search_term: query,
        max_results: 8,
      });
      if (error) console.error('Meal RPC error:', error);
      if (data) setMealSearchResults(data);
    } catch (e) {
      console.error('Meal search error:', e);
    }
    setIsMealSearching(false);
  };

  const selectMeal = async (meal) => {
    setSelectedMeal(meal);
    setMealSearchQuery('');
    setMealSearchResults([]);
    try {
      const { data } = await supabase
        .from('meal_components_master')
        .select('component_name, percentage_estimate')
        .eq('meal_id', meal.id)
        .order('percentage_estimate', { ascending: false });
      if (data) setMealComponents(data);
    } catch (e) {
      console.error('Components load error:', e);
      setMealComponents([]);
    }
  };

  const getMealMacros = () => {
    if (!selectedMeal) return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 };
    const factor = manualPortionG / 100;
    return {
      calories: Math.round((selectedMeal.kcal_per_100g || 0) * factor),
      protein_g: Math.round((selectedMeal.protein_per_100g || 0) * factor * 10) / 10,
      carbs_g: Math.round((selectedMeal.carbs_per_100g || 0) * factor * 10) / 10,
      fat_g: Math.round((selectedMeal.fat_per_100g || 0) * factor * 10) / 10,
      fiber_g: Math.round((selectedMeal.fiber_per_100g || 0) * factor * 10) / 10,
    };
  };

  const deselectMeal = () => {
    setSelectedMeal(null);
    setMealComponents([]);
    setMealSearchQuery('');
  };

  // --- ONGLET INGRÉDIENTS ---

  const searchManualIngredients = async (query) => {
    setIngSearchQuery(query);
    if (query.length < 2) { setIngSearchResults([]); return; }
    setIsIngSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_ingredients_fuzzy', {
        search_term: query,
        max_results: 8,
      });
      if (error) console.error('RPC error:', error);
      if (data) {
        setIngSearchResults(data.map(item => ({
          name: item.name,
          kcal_per_100g: item.kcal_per_100g,
          protein_per_100g: item.protein_per_100g,
          carbs_per_100g: item.carbs_per_100g,
          fat_per_100g: item.fat_per_100g,
          fiber_per_100g: item.fiber_per_100g,
          category: item.category,
          table: item.source_table,
        })));
      }
    } catch (e) {
      console.error('Ingredient search error:', e);
      setIngSearchResults([]);
    }
    setIsIngSearching(false);
  };

  const addManualIngredient = (dbIngredient) => {
    const defaultQty = 100;
    const newIng = {
      name: dbIngredient.name,
      quantity_g: defaultQty,
      calories: Math.round((dbIngredient.kcal_per_100g || 0)),
      protein_g: Math.round((dbIngredient.protein_per_100g || 0) * 10) / 10,
      carbs_g: Math.round((dbIngredient.carbs_per_100g || 0) * 10) / 10,
      fat_g: Math.round((dbIngredient.fat_per_100g || 0) * 10) / 10,
      fiber_g: Math.round((dbIngredient.fiber_per_100g || 0) * 10) / 10,
      source: 'lixum_db',
    };
    setManualIngredients(prev => [...prev, newIng]);
    setIngSearchQuery('');
    setIngSearchResults([]);
  };

  const removeManualIngredient = (index) => {
    setManualIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const updateManualIngQty = async (index, newQtyStr) => {
    const newQty = parseFloat(newQtyStr);
    if (isNaN(newQty) || newQty <= 0) return;
    const updated = [...manualIngredients];
    const ing = updated[index];
    const oldQty = ing.quantity_g || 100;

    try {
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action: 'search_ingredients', query: ing.name, limit: 1 }),
        }
      );
      const data = await response.json();
      const results = data.results || [];
      if (results.length > 0) {
        const db = results[0];
        const factor = newQty / 100;
        updated[index] = { ...ing, quantity_g: newQty, calories: Math.round((db.kcal_per_100g || 0) * factor), protein_g: Math.round((db.protein_per_100g || 0) * factor * 10) / 10, carbs_g: Math.round((db.carbs_per_100g || 0) * factor * 10) / 10, fat_g: Math.round((db.fat_per_100g || 0) * factor * 10) / 10, fiber_g: Math.round((db.fiber_per_100g || 0) * factor * 10) / 10 };
      } else {
        const ratio = newQty / oldQty;
        updated[index] = { ...ing, quantity_g: newQty, calories: Math.round(ing.calories * ratio), protein_g: Math.round(ing.protein_g * ratio * 10) / 10, carbs_g: Math.round(ing.carbs_g * ratio * 10) / 10, fat_g: Math.round(ing.fat_g * ratio * 10) / 10, fiber_g: Math.round(ing.fiber_g * ratio * 10) / 10 };
      }
    } catch (e) {
      const ratio = newQty / oldQty;
      updated[index] = { ...ing, quantity_g: newQty, calories: Math.round(ing.calories * ratio), protein_g: Math.round(ing.protein_g * ratio * 10) / 10, carbs_g: Math.round(ing.carbs_g * ratio * 10) / 10, fat_g: Math.round(ing.fat_g * ratio * 10) / 10, fiber_g: Math.round(ing.fiber_g * ratio * 10) / 10 };
    }
    setManualIngredients(updated);
    setManualEditingQtyIndex(null);
    setManualTempQty('');
  };

  // === JSX (phases suivantes) ===

  if (!visible) return null;
  return null;
}
