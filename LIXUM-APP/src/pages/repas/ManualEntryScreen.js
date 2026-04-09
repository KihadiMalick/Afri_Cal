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
import { useAuth } from '../../config/AuthContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';

export default function ManualEntryScreen({ visible, onClose, onMealSaved, initialMealType }) {
  var auth = useAuth(); var userId = auth.userId;
  var _lc = useLang(); var lang = _lc.lang;

  // === ÉTATS ===
  const [manualTab, setManualTab] = useState('meals');
  const [manualPortionG, setManualPortionG] = useState(350);
  const [editingPortion, setEditingPortion] = useState(false);
  const [tempPortion, setTempPortion] = useState('350');
  const [manualMealType, setManualMealType] = useState(null);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [saveManualSuccess, setSaveManualSuccess] = useState(false);

  useEffect(function() {
    if (visible && initialMealType) {
      setManualMealType(initialMealType);
    }
  }, [visible, initialMealType]);

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
        p_user_id: userId,
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
          {/* ====== ONGLET PLATS ====== */}
          {manualTab === 'meals' && (
            <View style={{ paddingHorizontal: wp(16) }}>

              {/* Barre de recherche plats */}
              {!selectedMeal && (
                <>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: 14, paddingHorizontal: wp(12),
                    borderWidth: 1, borderColor: mealSearchQuery.length > 0 ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.05)',
                  }}>
                    <Text style={{ color: '#5A6070', fontSize: 16, marginRight: 8 }}>🔍</Text>
                    <TextInput
                      value={mealSearchQuery}
                      onChangeText={searchMeals}
                      placeholder={lang === 'fr' ? 'Chercher un plat (ex: Thiéboudienne, Pizza...)' : 'Search a meal...'}
                      placeholderTextColor="#5A6070"
                      style={{ flex: 1, color: '#EAEEF3', fontSize: fp(13), paddingVertical: wp(12) }}
                    />
                    {mealSearchQuery.length > 0 && (
                      <Pressable onPress={() => { setMealSearchQuery(''); setMealSearchResults([]); }}>
                        <Text style={{ color: '#8892A0', fontSize: 16 }}>✕</Text>
                      </Pressable>
                    )}
                  </View>

                  {isMealSearching && (
                    <Text style={{ color: '#00D984', fontSize: fp(10), marginTop: wp(6), fontStyle: 'italic' }}>Recherche...</Text>
                  )}

                  {/* Résultats */}
                  {mealSearchResults.length > 0 && (
                    <View style={{
                      marginTop: wp(8), borderRadius: 14,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                      overflow: 'hidden',
                    }}>
                      {mealSearchResults.map((meal, i) => (
                        <Pressable
                          key={meal.id}
                          onPress={() => selectMeal(meal)}
                          style={({ pressed }) => ({
                            paddingVertical: wp(12), paddingHorizontal: wp(12),
                            backgroundColor: pressed ? 'rgba(0,217,132,0.08)' : 'transparent',
                            borderBottomWidth: i < mealSearchResults.length - 1 ? 0.5 : 0,
                            borderBottomColor: 'rgba(255,255,255,0.05)',
                          })}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1, marginRight: wp(8) }}>
                              <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700' }}>{meal.name}</Text>
                              <Text style={{ color: '#5A6070', fontSize: fp(9), marginTop: 2 }}>
                                {meal.country_origin || ''} • {meal.category || ''}
                              </Text>
                              {meal.description && (
                                <Text style={{ color: '#5A6070', fontSize: fp(8), marginTop: 2 }} numberOfLines={1}>{meal.description}</Text>
                              )}
                            </View>
                            <Text style={{ color: '#FF8C42', fontSize: fp(12), fontWeight: '700' }}>
                              {meal.kcal_per_100g} kcal/100g
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {mealSearchQuery.length >= 2 && !isMealSearching && mealSearchResults.length === 0 && (
                    <View style={{
                      marginTop: wp(8), padding: wp(12), borderRadius: 14,
                      backgroundColor: 'rgba(255,140,66,0.06)',
                      borderWidth: 0.5, borderColor: 'rgba(255,140,66,0.15)',
                    }}>
                      <Text style={{ color: '#FF8C42', fontSize: fp(11), textAlign: 'center' }}>
                        "{mealSearchQuery}" non trouvé. Essayez l'onglet Ingrédients →
                      </Text>
                    </View>
                  )}
                </>
              )}

              {/* PLAT SÉLECTIONNÉ — fiche détaillée */}
              {selectedMeal && (
                <>
                  {/* Bouton retour */}
                  <Pressable onPress={deselectMeal} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(12) }}>
                    <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600' }}>← Autre plat</Text>
                  </Pressable>

                <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#4A4F55', overflow: 'hidden', marginBottom: wp(16) }}>
                <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{ borderRadius: 15, padding: wp(16) }}>

                  {/* Nom + Pays */}
                  <Text style={{ color: '#EAEEF3', fontSize: fp(20), fontWeight: '900', marginBottom: wp(4) }}>
                    {selectedMeal.name}
                  </Text>
                  <Text style={{ color: '#5A6070', fontSize: fp(11), marginBottom: wp(12) }}>
                    {selectedMeal.country_origin} • {selectedMeal.category}
                  </Text>

                  {/* Totaux macros */}
                  <View style={{
                    borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.25)', borderWidth: 1, borderColor: '#4A4F55', marginBottom: wp(16), padding: wp(14), alignItems: 'center',
                  }}>
                      <Text style={{ color: '#00D984', fontSize: fp(28), fontWeight: '900' }}>
                        {getMealMacros().calories} kcal
                      </Text>
                      <View style={{ flexDirection: 'row', marginTop: wp(8), gap: wp(16) }}>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B8A', marginBottom: 2 }} />
                          <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{getMealMacros().protein_g}g</Text>
                          <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Protéines</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginBottom: 2 }} />
                          <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{getMealMacros().carbs_g}g</Text>
                          <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Glucides</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4DA6FF', marginBottom: 2 }} />
                          <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{getMealMacros().fat_g}g</Text>
                          <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Lipides</Text>
                        </View>
                      </View>
                  </View>

                  {/* Portion modifiable */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: wp(16),
                  }}>
                    <Text style={{ color: '#8892A0', fontSize: fp(11), fontWeight: '700', letterSpacing: 1.5 }}>PORTION</Text>
                    {editingPortion ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TextInput
                          value={tempPortion}
                          onChangeText={setTempPortion}
                          keyboardType="numeric"
                          autoFocus
                          style={{
                            color: '#00D984', fontSize: fp(14), fontWeight: '700',
                            backgroundColor: 'rgba(0,217,132,0.08)',
                            borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
                            minWidth: 60, borderWidth: 1, borderColor: 'rgba(0,217,132,0.3)',
                            textAlign: 'center',
                          }}
                          onSubmitEditing={() => {
                            const val = parseFloat(tempPortion);
                            if (!isNaN(val) && val > 0) setManualPortionG(val);
                            setEditingPortion(false);
                          }}
                          onBlur={() => {
                            const val = parseFloat(tempPortion);
                            if (!isNaN(val) && val > 0) setManualPortionG(val);
                            setEditingPortion(false);
                          }}
                        />
                        <Text style={{ color: '#5A6070', fontSize: fp(12), marginLeft: 4 }}>g</Text>
                      </View>
                    ) : (
                      <Pressable onPress={() => { setEditingPortion(true); setTempPortion(String(manualPortionG)); }}>
                        <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '700', textDecorationLine: 'underline' }}>
                          {manualPortionG}g — modifier
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Composition du plat (informatif) */}
                  {mealComponents.length > 0 && (
                    <View style={{ marginBottom: wp(16) }}>
                      <Text style={{ color: '#8892A0', fontSize: fp(11), fontWeight: '700', letterSpacing: 1.5, marginBottom: wp(8) }}>
                        COMPOSITION ({mealComponents.length} ingrédients)
                      </Text>
                      {mealComponents.map((comp, i) => (
                        <View key={i} style={{
                          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                          paddingVertical: wp(6),
                          borderBottomWidth: i < mealComponents.length - 1 ? 0.5 : 0,
                          borderBottomColor: 'rgba(255,255,255,0.05)',
                        }}>
                          <Text style={{ color: '#EAEEF3', fontSize: fp(12), flex: 1 }}>{comp.component_name}</Text>
                          <Text style={{ color: '#5A6070', fontSize: fp(10), marginRight: wp(6) }}>
                            {Math.round((comp.percentage_estimate / 100) * manualPortionG)}g
                          </Text>
                          <Text style={{ color: '#8892A0', fontSize: fp(9), marginRight: wp(8) }}>{comp.percentage_estimate}%</Text>
                          <Pressable
                            onPress={() => setMealComponents(prev => prev.filter((_, idx) => idx !== i))}
                            style={({ pressed }) => ({
                              width: 24, height: 24, borderRadius: 12,
                              backgroundColor: pressed ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.08)',
                              justifyContent: 'center', alignItems: 'center',
                              borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)',
                            })}
                          >
                            <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '700' }}>×</Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                </LinearGradient>
                </View>
                </>
              )}
            </View>
          )}

          {/* ====== ONGLET INGRÉDIENTS ====== */}
          {manualTab === 'ingredients' && (
            <View style={{ paddingHorizontal: wp(16) }}>

              {/* Totaux en temps réel */}
              {manualIngredients.length > 0 && (
                <View style={{
                  borderRadius: 16, padding: 1, backgroundColor: '#4A4F55', marginBottom: wp(16),
                }}>
                  <LinearGradient
                    colors={['#3A3F46', '#252A30', '#1A1D22']}
                    style={{ borderRadius: 15, padding: wp(14), alignItems: 'center' }}
                  >
                    <Text style={{ color: '#FF8C42', fontSize: fp(28), fontWeight: '900' }}>
                      {getManualIngTotals().calories} kcal
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: wp(8), gap: wp(16) }}>
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', marginBottom: 2 }} />
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{getManualIngTotals().protein_g}g</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Protéines</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginBottom: 2 }} />
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{getManualIngTotals().carbs_g}g</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Glucides</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4DA6FF', marginBottom: 2 }} />
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{getManualIngTotals().fat_g}g</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>Lipides</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              )}

              {/* Liste ingrédients ajoutés */}
              {manualIngredients.map((ing, index) => (
                <View key={index} style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 14, marginBottom: wp(8), padding: wp(12),
                  borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '600' }}>{ing.name}</Text>
                    {manualEditingQtyIndex === index ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <TextInput
                          value={manualTempQty}
                          onChangeText={setManualTempQty}
                          keyboardType="numeric"
                          autoFocus
                          style={{
                            color: '#00D984', fontSize: fp(12), fontWeight: '700',
                            backgroundColor: 'rgba(0,217,132,0.08)',
                            borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
                            minWidth: 50, borderWidth: 1, borderColor: 'rgba(0,217,132,0.3)',
                          }}
                          onSubmitEditing={() => updateManualIngQty(index, manualTempQty)}
                          onBlur={() => { if (manualTempQty) updateManualIngQty(index, manualTempQty); else { setManualEditingQtyIndex(null); setManualTempQty(''); } }}
                        />
                        <Text style={{ color: '#5A6070', fontSize: fp(11), marginLeft: 4 }}>g</Text>
                      </View>
                    ) : (
                      <Pressable onPress={() => { setManualEditingQtyIndex(index); setManualTempQty(String(ing.quantity_g || 100)); }}>
                        <Text style={{ color: '#00D984', fontSize: fp(11), marginTop: 3, textDecorationLine: 'underline' }}>
                          {ing.quantity_g || 100}g — modifier
                        </Text>
                      </Pressable>
                    )}
                  </View>
                  <Text style={{ color: '#FF8C42', fontSize: fp(13), fontWeight: '700', marginRight: wp(10) }}>{ing.calories} kcal</Text>
                  <Pressable onPress={() => removeManualIngredient(index)} style={({ pressed }) => ({
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: pressed ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.08)',
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)',
                  })}>
                    <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '700' }}>×</Text>
                  </Pressable>
                </View>
              ))}

              {/* Barre de recherche ingrédients */}
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 14, paddingHorizontal: wp(12),
                borderWidth: 1, borderColor: ingSearchQuery.length > 0 ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.05)',
                marginTop: wp(8),
              }}>
                <Text style={{ color: '#5A6070', fontSize: 16, marginRight: 8 }}>🔍</Text>
                <TextInput
                  value={ingSearchQuery}
                  onChangeText={searchManualIngredients}
                  placeholder="Ajouter un ingrédient..."
                  placeholderTextColor="#5A6070"
                  style={{ flex: 1, color: '#EAEEF3', fontSize: fp(13), paddingVertical: wp(12) }}
                  onFocus={() => {
                    setTimeout(() => { if (manualScrollRef.current) manualScrollRef.current.scrollToEnd({ animated: true }); }, 300);
                  }}
                />
                {ingSearchQuery.length > 0 && (
                  <Pressable onPress={() => { setIngSearchQuery(''); setIngSearchResults([]); }}>
                    <Text style={{ color: '#8892A0', fontSize: 16 }}>✕</Text>
                  </Pressable>
                )}
              </View>

              {isIngSearching && (
                <Text style={{ color: '#D4AF37', fontSize: fp(10), marginTop: wp(6), fontStyle: 'italic' }}>Recherche...</Text>
              )}

              {ingSearchResults.length > 0 && (
                <View style={{
                  marginTop: wp(8), borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                }}>
                  {ingSearchResults.map((result, i) => (
                    <Pressable key={i} onPress={() => addManualIngredient(result)}
                      style={({ pressed }) => ({
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                        paddingVertical: wp(10), paddingHorizontal: wp(12),
                        backgroundColor: pressed ? 'rgba(212,175,55,0.08)' : 'transparent',
                        borderBottomWidth: i < ingSearchResults.length - 1 ? 0.5 : 0,
                        borderBottomColor: 'rgba(255,255,255,0.05)',
                      })}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '600' }}>{result.name}</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(9), marginTop: 2 }}>
                          {result.kcal_per_100g} kcal/100g
                        </Text>
                      </View>
                      <View style={{
                        backgroundColor: 'rgba(212,175,55,0.08)',
                        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                        borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                      }}>
                        <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>+ Ajouter</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* SÉLECTEUR CRÉNEAU — commun aux 2 onglets */}
          {((manualTab === 'meals' && selectedMeal) || (manualTab === 'ingredients' && manualIngredients.length > 0)) && (
            <View style={{ paddingHorizontal: wp(16), marginTop: wp(20) }}>
              <Text style={{ color: '#8892A0', fontSize: fp(11), fontWeight: '700', letterSpacing: 1.5, marginBottom: wp(8) }}>
                CRÉNEAU REPAS
              </Text>
              <View style={{ flexDirection: 'row', gap: wp(8) }}>
                {MEAL_SLOTS.map((slot) => {
                  const isSelected = manualMealType === slot.key;
                  return (
                    <Pressable key={slot.key} onPress={() => setManualMealType(slot.key)}
                      style={({ pressed }) => ({
                        flex: 1, flexDirection: 'column', alignItems: 'center',
                        paddingVertical: wp(10), borderRadius: 12,
                        backgroundColor: isSelected ? 'rgba(0,217,132,0.12)' : pressed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                        borderWidth: 1.5, borderColor: isSelected ? 'rgba(0,217,132,0.4)' : '#2A2F36',
                      })}
                    >
                      <Text style={{ fontSize: 16, marginBottom: 3 }}>{slot.icon}</Text>
                      <Text style={{
                        color: isSelected ? '#00D984' : '#8892A0',
                        fontSize: fp(9), fontWeight: isSelected ? '800' : '600',
                      }}>{lang === 'fr' ? slot.label_fr : slot.label_en}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Récompense Lix */}
              <View style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                marginTop: wp(16),
                backgroundColor: 'rgba(212,175,55,0.06)',
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
              }}>
                <Text style={{ fontSize: 14, marginRight: 6 }}>🏆</Text>
                <Text style={{ color: '#D4AF37', fontSize: fp(11), fontWeight: '600' }}>
                  +3 Lix • Saisie manuelle
                </Text>
              </View>
            </View>
          )}

        </ScrollView>

        {/* Bouton CONFIRMER fixe en bas */}
        {((manualTab === 'meals' && selectedMeal) || (manualTab === 'ingredients' && manualIngredients.length > 0)) && (
          <View style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingHorizontal: wp(16), paddingBottom: Platform.OS === 'android' ? 55 : 40,
            paddingTop: wp(10),
            backgroundColor: '#0D1117',
            borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.05)',
          }}>
            <Pressable
              onPress={saveManualMeal}
              disabled={isSavingManual || saveManualSuccess}
              style={({ pressed }) => ({
                paddingVertical: wp(14), borderRadius: 14,
                backgroundColor: saveManualSuccess ? '#00D984' : 'transparent',
                borderWidth: saveManualSuccess ? 0 : 1.5,
                borderColor: isSavingManual ? 'rgba(0,217,132,0.4)' : '#00D984',
                alignItems: 'center',
                opacity: pressed ? 0.7 : isSavingManual ? 0.6 : 1,
              })}
            >
              <Text style={{ color: saveManualSuccess ? '#0D1117' : '#00D984', fontSize: fp(15), fontWeight: '800' }}>
                {saveManualSuccess ? '✓ SAUVEGARDÉ ! +3 Lix' : isSavingManual ? '⏳ SAUVEGARDE...' : '✓ CONFIRMER LE REPAS'}
              </Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
