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

  // === JSX (phases suivantes) ===

  if (!visible) return null;
  return null;
}
