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

  const getManualIngTotals = () => {
    return manualIngredients.reduce((acc, ing) => ({
      calories: acc.calories + (ing.calories || 0),
      protein_g: Math.round((acc.protein_g + (ing.protein_g || 0)) * 10) / 10,
      carbs_g: Math.round((acc.carbs_g + (ing.carbs_g || 0)) * 10) / 10,
      fat_g: Math.round((acc.fat_g + (ing.fat_g || 0)) * 10) / 10,
      fiber_g: Math.round((acc.fiber_g + (ing.fiber_g || 0)) * 10) / 10,
    }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
  };

  // --- SAUVEGARDE ---

  const saveManualMeal = async () => {
    if (isSavingManual) return;

    let totals, mealName, ingredientsDetail, portionG;

    if (manualTab === 'meals' && selectedMeal) {
      totals = getMealMacros();
      mealName = selectedMeal.name;
      portionG = manualPortionG;
      ingredientsDetail = mealComponents.map(c => ({
        name: c.component_name,
        percentage: c.percentage_estimate,
        quantity_g: Math.round((c.percentage_estimate / 100) * manualPortionG),
      }));
    } else if (manualTab === 'ingredients' && manualIngredients.length > 0) {
      totals = getManualIngTotals();
      mealName = manualIngredients.map(i => i.name).slice(0, 3).join(' + ');
      portionG = manualIngredients.reduce((sum, i) => sum + (i.quantity_g || 0), 0);
      ingredientsDetail = manualIngredients;
    } else {
      return;
    }

    setIsSavingManual(true);
    try {
      const { data, error } = await supabase.rpc('add_meal_and_update_summary', {
        p_user_id: TEST_USER_ID,
        p_meal_type: manualMealType || getAutoMealType(),
        p_food_name: mealName,
        p_calories: Math.round(totals.calories),
        p_protein: totals.protein_g,
        p_carbs: totals.carbs_g,
        p_fat: totals.fat_g,
        p_fiber: totals.fiber_g,
        p_source: 'manual',
        p_confidence: null,
        p_photo_url: null,
        p_ingredients_detail: ingredientsDetail,
        p_food_db_id: null,
        p_volume_ml: null,
        p_texture: null,
        p_portion_g: portionG,
      });

      if (error) {
        console.error('Erreur sauvegarde manuelle:', error);
        alert('Erreur : ' + error.message);
        setIsSavingManual(false);
        return;
      }

      setSaveManualSuccess(true);
      setTimeout(() => {
        onMealSaved();
        closeManualEntry();
        setIsSavingManual(false);
        setSaveManualSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Erreur réseau:', err);
      alert('Erreur réseau.');
      setIsSavingManual(false);
    }
  };

  // === JSX ===

  if (!visible) return null;
  return (
    <View style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 2000,
      backgroundColor: '#0D1117',
    }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: Platform.OS === 'android' ? 50 : 60,
          paddingHorizontal: wp(16), paddingBottom: wp(10),
          borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)',
        }}>
          <Pressable onPress={closeManualEntry}>
            <Text style={{ color: '#8892A0', fontSize: fp(14) }}>✕ Fermer</Text>
          </Pressable>
          <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800' }}>
            AJOUTER UN REPAS
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* ONGLETS — Plats / Ingrédients */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: wp(16),
          marginTop: wp(12),
          marginBottom: wp(12),
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}>
          {/* Onglet Plats — gratuit */}
          <Pressable
            onPress={() => setManualTab('meals')}
            style={{
              flex: 1,
              paddingVertical: wp(12),
              alignItems: 'center',
              backgroundColor: manualTab === 'meals' ? 'rgba(0,217,132,0.12)' : 'transparent',
              borderRightWidth: 0.5,
              borderRightColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 3 }}>🍽️</Text>
            <Text style={{
              color: manualTab === 'meals' ? '#00D984' : '#8892A0',
              fontSize: fp(11),
              fontWeight: manualTab === 'meals' ? '800' : '600',
            }}>Plats</Text>
            <Text style={{ color: '#00D984', fontSize: fp(7), fontWeight: '600', marginTop: 2 }}>GRATUIT</Text>
          </Pressable>

          {/* Onglet Ingrédients — verrouillé */}
          <Pressable
            onPress={() => setManualTab('ingredients')}
            style={{
              flex: 1,
              paddingVertical: wp(12),
              alignItems: 'center',
              backgroundColor: manualTab === 'ingredients' ? 'rgba(212,175,55,0.10)' : 'transparent',
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 3 }}>🧪</Text>
            <Text style={{
              color: manualTab === 'ingredients' ? '#D4AF37' : '#8892A0',
              fontSize: fp(11),
              fontWeight: manualTab === 'ingredients' ? '800' : '600',
            }}>Ingrédients</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '600' }}>50 Lix</Text>
              <Text style={{ color: '#5A6070', fontSize: fp(7), marginHorizontal: 3 }}>ou</Text>
              <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '600' }}>★ PRO</Text>
            </View>
          </Pressable>
        </View>

        <ScrollView
          ref={manualScrollRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: wp(200) }}
        >
          {/* === PHASE 8 : Onglet Plats JSX === */}
          {/* === PHASE 9 : Onglet Ingrédients + Save JSX === */}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
