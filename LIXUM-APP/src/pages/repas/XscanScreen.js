import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  View, Text, Pressable, Image, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Animated, Vibration, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Path, Rect, Defs, Mask } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../config/supabase';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import { MEAL_SLOTS } from './repasConstants';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const SCREEN_WIDTH = require('react-native').Dimensions.get('window').width;
const SCREEN_HEIGHT = require('react-native').Dimensions.get('window').height;

// ============================================================
// XscanScreen — Caméra + AR + Analyse + Résultat + Correction
// ============================================================

const XscanScreen = forwardRef(function XscanScreen({ visible, onClose, onMealSaved, userProfile }, ref) {
  var _lc = useLang(); var lang = _lc.lang;

  // === PERMISSIONS CAMÉRA ===
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const correctionScrollRef = useRef(null);

  // === STATES SCAN PRINCIPAL ===
  const [scanScreen, setScanScreen] = useState('none');
  // 'none' = pas de scan actif
  // 'camera' = caméra ouverte
  // 'analyzing' = écran analyse avec textes fun
  // 'result' = résultat du scan
  // 'ar_scan' = mode AR
  // 'error' = erreur

  const [scanMode, setScanMode] = useState('none');
  // 'none', 'double_choice', 'single_match', 'ai_fallback'

  const [scanSuggestions, setScanSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [aiVisual, setAiVisual] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternativeDishes, setAlternativeDishes] = useState([]);
  const [currentDishName, setCurrentDishName] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [analysisText, setAnalysisText] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [recalculating, setRecalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [scanError, setScanError] = useState(null);

  // === STATES CORRECTION ===
  const [correctionMode, setCorrectionMode] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingQuantityIndex, setEditingQuantityIndex] = useState(null);
  const [tempQuantity, setTempQuantity] = useState('');

  // === STATES AR ===
  const [arPhase, setArPhase] = useState('idle');
  // 'idle', 'center', 'navigating', 'tapping', 'complete'
  const [arCenterPlanted, setArCenterPlanted] = useState(false);
  const [arCurrentCorner, setArCurrentCorner] = useState(0);
  const [arCornerTaps, setArCornerTaps] = useState(0);
  const [arCornersDone, setArCornersDone] = useState([false, false, false, false]);
  const [arPhotos, setArPhotos] = useState([null, null, null, null]);
  const [arLastTapTime, setArLastTapTime] = useState(0);
  const [arCornerPulse] = useState(new Animated.Value(0));

  const centerStakeAnim = useRef(new Animated.Value(0)).current;
  const cornerStakeAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const ropeProgressAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const AR_CORNERS = [
    { key: 'topLeft', label: '↖', x: 0.18, y: 0.25, emoji: '🏔️' },
    { key: 'topRight', label: '↗', x: 0.82, y: 0.25, emoji: '🏔️' },
    { key: 'bottomLeft', label: '↙', x: 0.18, y: 0.75, emoji: '🏔️' },
    { key: 'bottomRight', label: '↘', x: 0.82, y: 0.75, emoji: '🏔️' },
  ];

  // === ANIMATIONS ===
  const glowIntensity = useRef(new Animated.Value(0)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;
  const [showRings, setShowRings] = useState(false);

  // Shake animation pour icône "Pas ce plat ?"
  const alertShakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanScreen === 'result') {
      const shake = Animated.loop(
        Animated.sequence([
          Animated.timing(alertShakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(alertShakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
          Animated.timing(alertShakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(alertShakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
          Animated.delay(2000),
        ])
      );
      shake.start();
      return () => shake.stop();
    }
  }, [scanScreen]);

  const alertRotate = alertShakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-12deg', '0deg', '12deg'],
  });

  // Pulse animation pour le coin AR actif
  useEffect(() => {
    if (arPhase === 'navigating' || arPhase === 'tapping') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(arCornerPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(arCornerPulse, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      arCornerPulse.setValue(0);
    }
  }, [arPhase]);

  // Loading texts pour l'écran d'analyse
  const loadingTexts = lang === 'fr'
    ? [
      '🍳 Cooking...',
      '🥣 Souping...',
      '🔪 Chopping...',
      '🍽️ Fooding...',
      '🫘 Okra okra...',
      '🐟 Tieb tieb...',
      '🥬 Ndolé ndolé...',
      '🍚 Fumbwa fumbwa...',
      '🔥 Mijotons tout ça...',
      '📊 Comptage des calories...',
    ]
    : [
      '🍳 Cooking...',
      '🥣 Souping...',
      '🔪 Chopping...',
      '🍽️ Fooding...',
      '🫘 Okra okra...',
      '🐟 Tieb tieb...',
      '🥬 Ndolé ndolé...',
      '🍚 Fumbwa fumbwa...',
      '🔥 Simmering flavors...',
      '📊 Counting calories...',
    ];

  // === EXPOSE METHODS VIA REF ===
  useImperativeHandle(ref, function() {
    return {
      openCamera: function() { activateScan(); },
      openGallery: function() { pickImageFromGallery(); },
    };
  });

  // ============================================================
  // FONCTIONS AR
  // ============================================================

  const resetArState = () => {
    setArPhase('idle');
    setArCenterPlanted(false);
    setArCurrentCorner(0);
    setArCornerTaps(0);
    setArCornersDone([false, false, false, false]);
    setArPhotos([null, null, null, null]);
    setArLastTapTime(0);
    centerStakeAnim.setValue(0);
    cornerStakeAnims.forEach(a => a.setValue(0));
    ropeProgressAnims.forEach(a => a.setValue(0));
  };

  const plantCenterStake = () => {
    if (arPhase !== 'center') return;
    setArCenterPlanted(true);
    Animated.spring(centerStakeAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start(() => {
      setArPhase('navigating');
      setArCurrentCorner(0);
    });
  };

  const tapCornerStake = async () => {
    const now = Date.now();
    if (now - arLastTapTime < 500) return;
    setArLastTapTime(now);

    const newTapCount = arCornerTaps + 1;
    setArCornerTaps(newTapCount);

    Animated.spring(cornerStakeAnims[arCurrentCorner], {
      toValue: newTapCount / 3,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();

    if (newTapCount === 1 && cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
          skipProcessing: true,
          exif: false,
        });
        const updated = [...arPhotos];
        updated[arCurrentCorner] = photo;
        setArPhotos(updated);
      } catch (e) {
        console.log('AR photo capture error:', e);
      }
    }

    if (newTapCount >= 3) {
      const updatedDone = [...arCornersDone];
      updatedDone[arCurrentCorner] = true;
      setArCornersDone(updatedDone);

      Animated.timing(ropeProgressAnims[arCurrentCorner], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      const allDone = updatedDone.every(d => d);
      if (allDone) {
        setTimeout(() => setArPhase('complete'), 600);
      } else {
        setTimeout(() => {
          const nextCorner = updatedDone.findIndex(d => !d);
          setArCurrentCorner(nextCorner);
          setArCornerTaps(0);
          setArPhase('navigating');
        }, 500);
      }
    }
  };

  const startArScan = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        alert(lang === 'fr' ? 'Permission caméra requise' : 'Camera permission required');
        return;
      }
    }
    resetArState();
    setArPhase('center');
    setScanScreen('ar_scan');
  };

  // ============================================================
  // FONCTIONS SCAN — capture + analyse
  // ============================================================

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: false,
        exif: false,
      });

      setCapturedPhoto(photo);
      setScanScreen('analyzing');

      runAnalysis(photo);
    } catch (error) {
      console.log('Erreur capture photo:', error);
      alert(lang === 'fr' ? 'Erreur lors de la capture' : 'Capture error');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert(lang === 'fr'
          ? 'Permission galerie requise pour charger une photo'
          : 'Gallery permission required to load a photo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        const photo = {
          uri: selectedImage.uri,
          base64: selectedImage.base64,
          width: selectedImage.width,
          height: selectedImage.height,
        };

        setCapturedPhoto(photo);
        setScanScreen('analyzing');
        runAnalysis(photo);
      }
    } catch (error) {
      console.error('Erreur galerie:', error);
      alert(lang === 'fr' ? 'Erreur lors du chargement de la photo' : 'Error loading photo');
    }
  };

  const runAnalysis = async (photo) => {
    setCurrentLoadingIndex(0);
    setAnalysisProgress(0);

    const textInterval = setInterval(() => {
      setCurrentLoadingIndex(prev => {
        if (prev >= loadingTexts.length - 1) return 0;
        return prev + 1;
      });
    }, 800);

    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 80) { clearInterval(progressInterval); return 80; }
        return prev + 2;
      });
    }, 100);

    try {
      const response = await fetch(
        'https://yuhordnzfpcswztujovi.supabase.co/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0',
          },
          body: JSON.stringify({
            photos_base64: [photo.base64],
            user_country: 'BI',
            user_origin_country: 'BI',
            lang: lang || 'fr',
          }),
        }
      );

      clearInterval(textInterval);
      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur serveur');
      }

      const result = await response.json();

      setScanMode(result.mode);
      setScanSuggestions(result.suggestions || []);
      setAiVisual(result.ai_visual || null);

      const aiSuggestionNames = (result.ai_visual?.original_suggestions || []).map(s => ({
        name_fr: s.name_fr,
        name_en: s.name_en,
        country: s.country,
        confidence: s.confidence,
      }));
      const seenCountries = new Set();
      const uniqueCountryDishes = aiSuggestionNames.filter(dish => {
        const country = dish.country || 'unknown';
        if (seenCountries.has(country)) return false;
        seenCountries.add(country);
        return true;
      });
      setAlternativeDishes(uniqueCountryDishes.length > 0 ? uniqueCountryDishes : aiSuggestionNames);

      if (result.suggestions && result.suggestions.length > 0) {
        const best = result.suggestions[0];
        setCurrentDishName(best.name_fr || best.name_en || '');
        setScanResult(best);
      } else if (result.ai_fallback) {
        const fb = result.ai_fallback;
        setCurrentDishName(fb.dish_name_fr || fb.dish_name_en || '');
        setScanResult({
          name_fr: fb.dish_name_fr,
          name_en: fb.dish_name_en,
          confidence: fb.confidence,
          ingredients: fb.ingredients,
          totals: fb.totals,
          calories: fb.totals?.calories || 0,
          protein_g: fb.totals?.protein_g || 0,
          carbs_g: fb.totals?.carbs_g || 0,
          fat_g: fb.totals?.fat_g || 0,
          source: 'ai_estimate',
        });
      } else {
        setScanResult({
          name_fr: 'Plat non identifié',
          name_en: 'Unidentified meal',
          confidence: 30,
          ingredients: [],
          totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 },
        });
        setCurrentDishName(lang === 'fr' ? 'Plat non identifié' : 'Unidentified meal');
      }

      const currentResult = scanResult || result.suggestions?.[0] || result.ai_fallback || {};
      const ingredients = currentResult.ingredients || result.suggestions?.[0]?.ingredients || result.ai_fallback?.ingredients || [];
      const confidence = currentResult.confidence || result.suggestions?.[0]?.confidence || result.ai_fallback?.confidence || 0;
      const totalCal = currentResult.totals?.calories || currentResult.calories || result.suggestions?.[0]?.calories || result.ai_fallback?.totals?.calories || 0;
      const dishName = (currentDishName || currentResult.name_fr || currentResult.dish_name_fr || '').toLowerCase();

      const suspectTerms = ['aucun', 'non identifié', 'unknown', 'unidentified', 'no ingredient', 'illustration', 'artistique', 'image', 'photo', 'dessin', 'logo', 'texte', 'document'];
      const hasSuspectName = suspectTerms.some(term => dishName.includes(term));
      const hasSuspectIngredient = ingredients.length <= 1 && ingredients.some(ing => {
        const ingName = (ing.name || '').toLowerCase();
        return suspectTerms.some(term => ingName.includes(term));
      });
      const isLowConfidenceLowCal = confidence < 50 && totalCal <= 150 && ingredients.length <= 1;
      const isNotFood = hasSuspectName || hasSuspectIngredient || isLowConfidenceLowCal;

      setAnalysisProgress(100);

      if (isNotFood) {
        const errorMessages = lang === 'fr' ? [
          { title: 'Hmm, ça ne ressemble pas à un plat 🤔', subtitle: 'Il semble que cette image soit autre chose que de la nourriture. Essayez avec une vraie photo de repas !' },
          { title: 'Oups, pas de nourriture détectée 🍽️', subtitle: 'Notre IA a cherché partout mais n\'a trouvé aucun aliment dans cette image. Prenez une photo de votre assiette !' },
          { title: 'Ce n\'est pas comestible... enfin, on espère ! 😄', subtitle: 'L\'image ne semble pas contenir de nourriture. Essayez avec un vrai plat, on fera le reste !' },
        ] : [
          { title: 'Hmm, that doesn\'t look like food 🤔', subtitle: 'This image seems to be something other than food. Try with a real meal photo!' },
          { title: 'Oops, no food detected 🍽️', subtitle: 'Our AI searched everywhere but found no food in this image. Take a picture of your plate!' },
          { title: 'That\'s not edible... we hope! 😄', subtitle: 'The image doesn\'t seem to contain food. Try with a real dish, we\'ll handle the rest!' },
        ];
        const randomMsg = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        setScanError(randomMsg);
        setTimeout(() => setScanScreen('error'), 500);
      } else {
        setScanError(null);
        setSelectedMealType(getAutoMealType());
        setTimeout(() => setScanScreen('result'), 500);
      }

    } catch (error) {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      console.error('Scan error:', error);
      alert(lang === 'fr'
        ? 'Erreur lors de l\'analyse : ' + error.message
        : 'Analysis error: ' + error.message);
      setScanScreen('none');
      onClose();
      setRecalculating(false);
      setCapturedPhoto(null);
      setCorrectionMode(false);
      setEditedIngredients([]);
      setSearchQuery('');
      setSearchResults([]);
      setEditingQuantityIndex(null);
      setTempQuantity('');
    }
  };

  const activateScan = async () => {
    setShowRings(true);
    ring1Anim.setValue(0);
    ring2Anim.setValue(0);
    ring3Anim.setValue(0);

    Animated.stagger(200, [
      Animated.timing(ring1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(ring2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(ring3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(async () => {
      setShowRings(false);
      ring1Anim.setValue(0);
      ring2Anim.setValue(0);
      ring3Anim.setValue(0);

      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          alert(lang === 'fr'
            ? 'Permission caméra requise pour scanner'
            : 'Camera permission required to scan');
          return;
        }
      }
      startArScan();
    });
  };

  // ============================================================
  // FONCTIONS CORRECTION + SAVE
  // ============================================================

  const recalculateIngredient = async (ingredientIndex, newName) => {
    if (!scanResult || !scanResult.ingredients) return;
    setRecalculating(true);

    try {
      const response = await fetch(
        'https://yuhordnzfpcswztujovi.supabase.co/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC3pUn0',
          },
          body: JSON.stringify({
            action: 'search_ingredients',
            query: newName,
            limit: 1,
          }),
        }
      );

      const data = await response.json();
      const results = data.results || [];

      const updatedIngredients = [...scanResult.ingredients];
      const oldIngredient = updatedIngredients[ingredientIndex];
      const quantity = oldIngredient.quantity_g || 100;

      if (results.length > 0) {
        const dbMatch = results[0];
        const factor = quantity / 100;

        updatedIngredients[ingredientIndex] = {
          ...oldIngredient,
          name: newName,
          name_en: newName,
          uncertain: false,
          alternatives: [],
          calories: Math.round((dbMatch.kcal_per_100g || 0) * factor),
          protein_g: Math.round((dbMatch.protein_per_100g || 0) * factor * 10) / 10,
          carbs_g: Math.round((dbMatch.carbs_per_100g || 0) * factor * 10) / 10,
          fat_g: Math.round((dbMatch.fat_per_100g || 0) * factor * 10) / 10,
          fiber_g: Math.round((dbMatch.fiber_per_100g || 0) * factor * 10) / 10,
          source: 'lixum_db',
        };
      } else {
        updatedIngredients[ingredientIndex] = {
          ...oldIngredient,
          name: newName,
          name_en: newName,
          uncertain: false,
          alternatives: [],
        };
      }

      const newTotals = updatedIngredients.reduce((acc, ing) => ({
        calories: acc.calories + (ing.calories || 0),
        protein_g: Math.round((acc.protein_g + (ing.protein_g || 0)) * 10) / 10,
        carbs_g: Math.round((acc.carbs_g + (ing.carbs_g || 0)) * 10) / 10,
        fat_g: Math.round((acc.fat_g + (ing.fat_g || 0)) * 10) / 10,
        fiber_g: Math.round((acc.fiber_g + (ing.fiber_g || 0)) * 10) / 10,
      }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });

      setScanResult({
        ...scanResult,
        ingredients: updatedIngredients,
        calories: newTotals.calories,
        protein_g: newTotals.protein_g,
        carbs_g: newTotals.carbs_g,
        fat_g: newTotals.fat_g,
        fiber_g: newTotals.fiber_g,
        totals: newTotals,
      });
      setRecalculating(false);
    } catch (error) {
      console.error('Erreur recalcul ingrédient:', error);
      const updatedIngredients = [...scanResult.ingredients];
      updatedIngredients[ingredientIndex] = {
        ...updatedIngredients[ingredientIndex],
        name: newName,
        name_en: newName,
        uncertain: false,
        alternatives: [],
      };
      setScanResult({ ...scanResult, ingredients: updatedIngredients });
      setRecalculating(false);
    }
  };

  // === FONCTIONS CORRECTION ===

  const removeIngredient = (index) => {
    const updated = editedIngredients.filter((_, i) => i !== index);
    setEditedIngredients(updated);
  };

  const updateQuantity = async (index, newQuantityStr) => {
    const newQty = parseFloat(newQuantityStr);
    if (isNaN(newQty) || newQty <= 0) return;

    const updated = [...editedIngredients];
    const ing = updated[index];
    const oldQty = ing.quantity_g || 100;

    try {
      const response = await fetch(
        'https://yuhordnzfpcswztujovi.supabase.co/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC3pUn0',
          },
          body: JSON.stringify({
            action: 'search_ingredients',
            query: ing.name,
            limit: 1,
          }),
        }
      );
      const data = await response.json();
      const results = data.results || [];

      if (results.length > 0) {
        const db = results[0];
        const factor = newQty / 100;
        updated[index] = {
          ...ing,
          quantity_g: newQty,
          calories: Math.round((db.kcal_per_100g || 0) * factor),
          protein_g: Math.round((db.protein_per_100g || 0) * factor * 10) / 10,
          carbs_g: Math.round((db.carbs_per_100g || 0) * factor * 10) / 10,
          fat_g: Math.round((db.fat_per_100g || 0) * factor * 10) / 10,
          fiber_g: Math.round((db.fiber_per_100g || 0) * factor * 10) / 10,
        };
      } else {
        const ratio = newQty / oldQty;
        updated[index] = {
          ...ing,
          quantity_g: newQty,
          calories: Math.round((ing.calories || 0) * ratio),
          protein_g: Math.round((ing.protein_g || 0) * ratio * 10) / 10,
          carbs_g: Math.round((ing.carbs_g || 0) * ratio * 10) / 10,
          fat_g: Math.round((ing.fat_g || 0) * ratio * 10) / 10,
          fiber_g: Math.round((ing.fiber_g || 0) * ratio * 10) / 10,
        };
      }
    } catch (e) {
      const ratio = newQty / oldQty;
      updated[index] = {
        ...ing,
        quantity_g: newQty,
        calories: Math.round((ing.calories || 0) * ratio),
        protein_g: Math.round((ing.protein_g || 0) * ratio * 10) / 10,
        carbs_g: Math.round((ing.carbs_g || 0) * ratio * 10) / 10,
        fat_g: Math.round((ing.fat_g || 0) * ratio * 10) / 10,
        fiber_g: Math.round((ing.fiber_g || 0) * ratio * 10) / 10,
      };
    }

    setEditedIngredients(updated);
    setEditingQuantityIndex(null);
    setTempQuantity('');
  };

  const searchIngredients = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        'https://yuhordnzfpcswztujovi.supabase.co/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC3pUn0',
          },
          body: JSON.stringify({
            action: 'search_ingredients',
            query: query,
            limit: 8,
          }),
        }
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error('Search error:', e);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const addIngredientFromSearch = (dbIngredient) => {
    const defaultQty = 100;
    const factor = defaultQty / 100;

    const newIng = {
      name: dbIngredient.name,
      name_en: dbIngredient.name,
      quantity_g: defaultQty,
      calories: Math.round((dbIngredient.kcal_per_100g || 0) * factor),
      protein_g: Math.round((dbIngredient.protein_per_100g || 0) * factor * 10) / 10,
      carbs_g: Math.round((dbIngredient.carbs_per_100g || 0) * factor * 10) / 10,
      fat_g: Math.round((dbIngredient.fat_per_100g || 0) * factor * 10) / 10,
      fiber_g: Math.round((dbIngredient.fiber_per_100g || 0) * factor * 10) / 10,
      source: 'lixum_db',
      certainty: 100,
      uncertain: false,
      alternatives: [],
      added_manually: true,
    };

    setEditedIngredients([...editedIngredients, newIng]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getEditedTotals = () => {
    return editedIngredients.reduce((acc, ing) => ({
      calories: acc.calories + (ing.calories || 0),
      protein_g: Math.round((acc.protein_g + (ing.protein_g || 0)) * 10) / 10,
      carbs_g: Math.round((acc.carbs_g + (ing.carbs_g || 0)) * 10) / 10,
      fat_g: Math.round((acc.fat_g + (ing.fat_g || 0)) * 10) / 10,
      fiber_g: Math.round((acc.fiber_g + (ing.fiber_g || 0)) * 10) / 10,
    }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });
  };

  const applyCorrection = () => {
    const totals = getEditedTotals();
    setScanResult({
      ...scanResult,
      ingredients: editedIngredients,
      calories: totals.calories,
      protein_g: totals.protein_g,
      carbs_g: totals.carbs_g,
      fat_g: totals.fat_g,
      fiber_g: totals.fiber_g,
      totals: totals,
    });
    setCorrectionMode(false);
    setEditedIngredients([]);
    setSearchQuery('');
    setSearchResults([]);
    setEditingQuantityIndex(null);
  };

  const getAutoMealType = () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 14) return 'lunch';
    if (hour < 21) return 'dinner';
    return 'snack';
  };

  const saveMealToSupabase = async () => {
    if (isSaving || !scanResult) return;
    setIsSaving(true);

    try {
      const totals = scanResult.totals || {
        calories: scanResult.calories || 0,
        protein_g: scanResult.protein_g || 0,
        carbs_g: scanResult.carbs_g || 0,
        fat_g: scanResult.fat_g || 0,
        fiber_g: scanResult.fiber_g || 0,
      };

      const totalWeight = (scanResult.ingredients || []).reduce(
        (sum, ing) => sum + (ing.quantity_g || 0), 0
      );

      const source = capturedPhoto?.uri?.startsWith('file') ? 'xscan_4' : 'gallery';

      const { data, error } = await supabase.rpc('add_meal_and_update_summary', {
        p_user_id: TEST_USER_ID,
        p_meal_type: selectedMealType || getAutoMealType(),
        p_food_name: currentDishName || scanResult.name_fr || 'Plat scanné',
        p_calories: Math.round(totals.calories || 0),
        p_protein: Math.round((totals.protein_g || 0) * 10) / 10,
        p_carbs: Math.round((totals.carbs_g || 0) * 10) / 10,
        p_fat: Math.round((totals.fat_g || 0) * 10) / 10,
        p_fiber: Math.round((totals.fiber_g || 0) * 10) / 10,
        p_source: source,
        p_confidence: scanResult.confidence || null,
        p_photo_url: null,
        p_ingredients_detail: scanResult.ingredients || [],
        p_food_db_id: null,
        p_volume_ml: null,
        p_texture: typeof scanResult.texture === 'string' ? scanResult.texture : null,
        p_portion_g: totalWeight > 0 ? totalWeight : null,
      });

      if (error) {
        console.error('Erreur sauvegarde Supabase:', error);
        alert('Erreur : ' + error.message);
        setIsSaving(false);
        return;
      }

      console.log('Repas sauvegardé ! ID:', data);
      setSaveSuccess(true);

      setTimeout(() => {
        onMealSaved();
        // Reset tous les states
        setScanScreen('none');
        onClose();
        setRecalculating(false);
        setScanResult(null);
        setCapturedPhoto(null);
        setShowAlternatives(false);
        setAlternativeDishes([]);
        setCurrentDishName('');
        setScanMode('none');
        setScanError(null);
        setScanSuggestions([]);
        setSelectedSuggestion(null);
        setAiVisual(null);
        alertShakeAnim.setValue(0);
        setCorrectionMode(false);
        setEditedIngredients([]);
        setSearchQuery('');
        setSearchResults([]);
        setEditingQuantityIndex(null);
        setTempQuantity('');
        setIsSaving(false);
        setSaveSuccess(false);
      }, 1500);

    } catch (err) {
      console.error('Erreur réseau:', err);
      alert('Erreur réseau. Vérifie ta connexion.');
      setIsSaving(false);
    }
  };

  // ============================================================
  // JSX (Phase 4-5)
  // ============================================================

  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 }}>
      {/* Phase 4-5: JSX screens will be added here */}
    </View>
  );
});

export default XscanScreen;
