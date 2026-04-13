import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  View, Text, Pressable, Image, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Animated, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Path, Rect, Defs, Mask } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase';
import LixumModal from '../../components/shared/LixumModal';
import EnergyGateModal from '../../components/shared/EnergyGateModal';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import { MEAL_SLOTS } from './repasConstants';
import { useAuth } from '../../config/AuthContext';
const SCREEN_WIDTH = require('react-native').Dimensions.get('window').width;
const SCREEN_HEIGHT = require('react-native').Dimensions.get('window').height;

// ============================================================
// XscanScreen — Caméra + AR + Analyse + Résultat + Correction
// ============================================================

const XscanScreen = forwardRef(function XscanScreen({
  visible, onClose, onMealSaved, userProfile,
  pagePowers, activeChar, todaySubstitutions, setTodaySubstitutions, consumePower,
  initialMealType,
}, ref) {
  var auth = useAuth(); var userId = auth.userId;
  var updateEnergy = auth.updateEnergy; var refreshLixFromServer = auth.refreshLixFromServer;
  var _lc = useLang(); var lang = _lc.lang;

  // Energy gate state
  var _energyGateData = useState(null); var energyGateData = _energyGateData[0]; var setEnergyGateData = _energyGateData[1];

  // Modal state
  var _xModalCfg = useState({ visible: false, type: 'info', title: '', message: '' });
  var xModalCfg = _xModalCfg[0]; var setXModalCfg = _xModalCfg[1];
  var closeXModal = function() { setXModalCfg(function(p) { return Object.assign({}, p, { visible: false }); }); };

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

  useEffect(function() {
    if (visible && initialMealType) {
      setSelectedMealType(initialMealType);
    }
  }, [visible, initialMealType]);

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

  // Analyse orbital + pulse animations
  var orbitAnim = useRef(new Animated.Value(0)).current;
  var pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(function() {
    if (scanScreen === 'analyzing') {
      var orbitLoop = Animated.loop(Animated.timing(orbitAnim, { toValue: 1, duration: 3000, easing: require('react-native').Easing.linear, useNativeDriver: true }));
      var pulseLoop = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]));
      orbitLoop.start();
      pulseLoop.start();
      return function() { orbitLoop.stop(); pulseLoop.stop(); };
    } else {
      orbitAnim.setValue(0);
      pulseAnim.setValue(0);
    }
  }, [scanScreen]);

  var orbitRotate = orbitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  var orbitRotateReverse = orbitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

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
      }
    }

    if (newTapCount >= 3) {
      const updatedDone = [...arCornersDone];
      updatedDone[arCurrentCorner] = true;
      setArCornersDone(updatedDone);

      Animated.timing(ropeProgressAnims[arCurrentCorner], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false, // layout animation - cannot use native driver
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
      const { data: { session } } = await supabase.auth.getSession();
      var authToken = session?.access_token || SUPABASE_ANON_KEY;
      console.log('[XScan] Starting scan-meal request',
        'hasSession:', !!session,
        'tokenPrefix:', authToken.substring(0, 20) + '...',
        'base64Length:', photo.base64 ? photo.base64.length : 0);

      const response = await fetch(
        SUPABASE_URL + '/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken,
          },
          body: JSON.stringify({
            photos_base64: [photo.base64],
            user_id: userId,
            user_country: 'BI',
            user_origin_country: 'BI',
            lang: lang || 'fr',
          }),
        }
      );

      clearInterval(textInterval);
      clearInterval(progressInterval);

      console.log('[XScan] Response status:', response.status);

      if (response.status === 402) {
        var gateData = await response.json();
        setEnergyGateData(gateData);
        clearInterval(textInterval);
        clearInterval(progressInterval);
        return;
      }

      if (!response.ok) {
        var errorText = '';
        try { var errorData = await response.json(); errorText = errorData.error || JSON.stringify(errorData); }
        catch (e) { try { errorText = await response.text(); } catch (e2) { errorText = 'Status ' + response.status; } }
        console.error('[XScan] Server error:', response.status, errorText);
        throw new Error(errorText || 'Erreur serveur (HTTP ' + response.status + ')');
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
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (session?.access_token || SUPABASE_ANON_KEY),
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
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (session?.access_token || SUPABASE_ANON_KEY),
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
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        SUPABASE_URL + '/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (session?.access_token || SUPABASE_ANON_KEY),
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
        p_user_id: userId,
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
  // JSX
  // ============================================================

  if (!visible) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 }}>

      {/* ═══════ ÉCRAN XSCAN AR — Mode Pieux & Cordes ═══════ */}
      {scanScreen === 'ar_scan' && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 2000,
          backgroundColor: '#000',
        }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
          >
            <View style={{ flex: 1 }}>

              {/* Header AR */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: Platform.OS === 'android' ? 50 : 60,
                paddingHorizontal: wp(20),
                zIndex: 10,
              }}>
                <Pressable
                  onPress={() => { setScanScreen('none'); resetArState(); onClose(); }}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center', alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '300' }}>✕</Text>
                </Pressable>

                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ color: '#00D984', fontSize: fp(16), fontWeight: '900' }}>X</Text>
                  <Text style={{ color: '#FFF', fontSize: fp(16), fontWeight: '900' }}>SCAN</Text>
                  <View style={{
                    marginLeft: 8, backgroundColor: 'rgba(212,175,55,0.2)',
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                  }}>
                    <Text style={{ color: '#D4AF37', fontSize: fp(8), fontWeight: '800' }}>AR</Text>
                  </View>
                </View>

                {/* Compteur photos */}
                <View style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
                }}>
                  <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700' }}>
                    📸 {arPhotos.filter(p => p !== null).length}/4
                  </Text>
                </View>
              </View>

              {/* ═══ CORDES SVG — relient centre aux coins ═══ */}
              {arCenterPlanted && (
                <Svg
                  width={SCREEN_WIDTH}
                  height={SCREEN_HEIGHT}
                  style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}
                  pointerEvents="none"
                >
                  {AR_CORNERS.map((corner, i) => {
                    const cx = SCREEN_WIDTH / 2;
                    const cy = SCREEN_HEIGHT / 2;
                    const tx = corner.x * SCREEN_WIDTH;
                    const ty = corner.y * SCREEN_HEIGHT;
                    const isDone = arCornersDone[i];
                    const isActive = arCurrentCorner === i && !isDone;

                    return (
                      <React.Fragment key={corner.key}>
                        <Line
                          x1={cx} y1={cy}
                          x2={tx} y2={ty}
                          stroke={isDone ? '#00D984' : isActive ? '#D4AF37' : 'rgba(255,255,255,0.15)'}
                          strokeWidth={isDone ? 2.5 : isActive ? 2 : 1}
                          strokeDasharray={isDone ? '0' : '6,4'}
                          opacity={isDone ? 0.8 : isActive ? 0.7 : 0.3}
                        />
                        <Circle cx={cx} cy={cy} r={3} fill="#D4AF37" opacity={0.6} />
                      </React.Fragment>
                    );
                  })}
                </Svg>
              )}

              {/* ═══ PHASE 1 : RÉTICULE CENTRAL — en attente du tap ═══ */}
              {arPhase === 'center' && (
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  justifyContent: 'center', alignItems: 'center',
                  zIndex: 5,
                }}>
                  {/* Instruction */}
                  <View style={{
                    position: 'absolute', top: SCREEN_HEIGHT * 0.15,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                    borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
                  }}>
                    <Text style={{ color: '#D4AF37', fontSize: fp(13), fontWeight: '700', textAlign: 'center' }}>
                      {lang === 'fr' ? '🎯 Placez le viseur au centre du plat' : '🎯 Place the reticle at the center'}
                    </Text>
                    <Text style={{ color: '#8892A0', fontSize: fp(10), textAlign: 'center', marginTop: 4 }}>
                      {lang === 'fr' ? 'Puis tapez pour planter le pieu' : 'Then tap to plant the stake'}
                    </Text>
                  </View>

                  {/* Réticule de visée */}
                  <Pressable onPress={plantCenterStake}>
                    <View style={{
                      width: wp(80), height: wp(80),
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Svg width={wp(80)} height={wp(80)} viewBox="0 0 80 80">
                        <Circle cx="40" cy="40" r="35" fill="none" stroke="#D4AF37" strokeWidth={1.5} opacity={0.6} />
                        <Line x1="40" y1="10" x2="40" y2="25" stroke="#D4AF37" strokeWidth={1.5} strokeLinecap="round" />
                        <Line x1="40" y1="55" x2="40" y2="70" stroke="#D4AF37" strokeWidth={1.5} strokeLinecap="round" />
                        <Line x1="10" y1="40" x2="25" y2="40" stroke="#D4AF37" strokeWidth={1.5} strokeLinecap="round" />
                        <Line x1="55" y1="40" x2="70" y2="40" stroke="#D4AF37" strokeWidth={1.5} strokeLinecap="round" />
                        <Circle cx="40" cy="40" r="4" fill="#D4AF37" opacity={0.8} />
                        <Circle cx="40" cy="40" r="2" fill="#FFF" opacity={0.6} />
                      </Svg>
                    </View>
                  </Pressable>
                </View>
              )}

              {/* ═══ PIEU CENTRAL PLANTÉ — animation ═══ */}
              {arCenterPlanted && (
                <Animated.View style={{
                  position: 'absolute',
                  top: SCREEN_HEIGHT / 2 - wp(20),
                  left: SCREEN_WIDTH / 2 - wp(12),
                  zIndex: 6,
                  transform: [{
                    scale: centerStakeAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.3, 1],
                    }),
                  }],
                  opacity: centerStakeAnim,
                }}>
                  <Svg width={wp(24)} height={wp(40)} viewBox="0 0 24 40">
                    <Rect x="8" y="0" width="8" height="32" rx="2" fill="#8B6914" />
                    <Rect x="9" y="0" width="2" height="32" fill="#A07D1A" opacity={0.5} />
                    <Path d="M8 32L12 40L16 32" fill="#6B4F10" />
                    <Rect x="6" y="0" width="12" height="4" rx="1" fill="#D4AF37" />
                    <Rect x="7" y="1" width="4" height="2" rx="0.5" fill="#E8C547" opacity={0.4} />
                  </Svg>
                </Animated.View>
              )}

              {/* ═══ 4 COINS — pieux cibles ═══ */}
              {arCenterPlanted && AR_CORNERS.map((corner, i) => {
                const isDone = arCornersDone[i];
                const isActive = arCurrentCorner === i && !isDone && (arPhase === 'navigating' || arPhase === 'tapping');
                const tapProgress = isActive ? arCornerTaps / 3 : isDone ? 1 : 0;

                return (
                  <Animated.View
                    key={corner.key}
                    style={{
                      position: 'absolute',
                      top: corner.y * SCREEN_HEIGHT - wp(25),
                      left: corner.x * SCREEN_WIDTH - wp(25),
                      width: wp(50), height: wp(50),
                      zIndex: 7,
                      opacity: isActive ? 1 : isDone ? 0.6 : 0.4,
                      transform: isActive ? [{
                        scale: arCornerPulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.15],
                        }),
                      }] : [],
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        if (isActive) {
                          setArPhase('tapping');
                          tapCornerStake();
                        }
                      }}
                      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                    >
                      {/* Cercle cible */}
                      <View style={{
                        width: wp(44), height: wp(44), borderRadius: wp(22),
                        borderWidth: 2,
                        borderColor: isDone ? '#00D984' : isActive ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                        backgroundColor: isDone
                          ? 'rgba(0,217,132,0.15)'
                          : isActive
                            ? 'rgba(212,175,55,0.12)'
                            : 'rgba(0,0,0,0.3)',
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        {isDone ? (
                          <Text style={{ color: '#00D984', fontSize: 18, fontWeight: '900' }}>✓</Text>
                        ) : (
                          <Svg width={wp(20)} height={wp(30)} viewBox="0 0 20 30">
                            <Rect x="7" y="0" width="6" height={20 * (1 - tapProgress)} rx="1"
                              fill={isActive ? '#D4AF37' : '#5A6070'} />
                            <Path d={`M7 ${20 * (1 - tapProgress)}L10 ${24 * (1 - tapProgress)}L13 ${20 * (1 - tapProgress)}`}
                              fill={isActive ? '#A08020' : '#3A4050'} />
                            <Line x1="3" y1="20" x2="17" y2="20"
                              stroke={isActive ? '#D4AF37' : '#5A6070'} strokeWidth={1} opacity={0.4} />
                          </Svg>
                        )}
                      </View>

                      {/* Label numéro */}
                      <View style={{
                        position: 'absolute', top: -8, right: -4,
                        backgroundColor: isDone ? '#00D984' : isActive ? '#D4AF37' : '#3A4050',
                        width: 18, height: 18, borderRadius: 9,
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        <Text style={{ color: isDone || isActive ? '#000' : '#8892A0', fontSize: 10, fontWeight: '800' }}>
                          {i + 1}
                        </Text>
                      </View>

                      {/* Barre de progression 3 taps */}
                      {isActive && arCornerTaps > 0 && (
                        <View style={{
                          position: 'absolute', bottom: -10,
                          flexDirection: 'row', gap: 3,
                        }}>
                          {[0, 1, 2].map(t => (
                            <View key={t} style={{
                              width: 8, height: 4, borderRadius: 2,
                              backgroundColor: t < arCornerTaps ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                            }} />
                          ))}
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}

              {/* ═══ INSTRUCTION NAVIGATION ═══ */}
              {(arPhase === 'navigating' || arPhase === 'tapping') && (
                <View style={{
                  position: 'absolute',
                  bottom: Platform.OS === 'android' ? 100 : 120,
                  left: wp(20), right: wp(20),
                  zIndex: 10,
                }}>
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 16, padding: wp(14),
                    borderWidth: 1,
                    borderColor: arPhase === 'tapping' ? 'rgba(212,175,55,0.4)' : 'rgba(0,217,132,0.2)',
                    alignItems: 'center',
                  }}>
                    <Text style={{
                      color: '#EAEEF3', fontSize: fp(14), fontWeight: '700',
                      textAlign: 'center', marginBottom: 4,
                    }}>
                      {arPhase === 'tapping'
                        ? (lang === 'fr'
                          ? `🔨 Tapez ! (${arCornerTaps}/3)`
                          : `🔨 Tap! (${arCornerTaps}/3)`)
                        : (lang === 'fr'
                          ? `📍 Dirigez vers le point ${arCurrentCorner + 1}`
                          : `📍 Move to point ${arCurrentCorner + 1}`)
                      }
                    </Text>
                    <Text style={{ color: '#8892A0', fontSize: fp(10), textAlign: 'center' }}>
                      {arPhase === 'tapping'
                        ? (lang === 'fr' ? 'Tapez 3 fois pour ancrer le pieu' : 'Tap 3 times to anchor the stake')
                        : (lang === 'fr' ? 'Bougez le téléphone vers le coin qui brille' : 'Move your phone to the glowing corner')
                      }
                    </Text>
                  </View>
                </View>
              )}

              {/* ═══ PHASE COMPLÈTE — Résumé 4 photos ═══ */}
              {arPhase === 'complete' && (
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  justifyContent: 'center', alignItems: 'center',
                  zIndex: 20,
                  paddingHorizontal: wp(20),
                }}>
                  <Text style={{ color: '#00D984', fontSize: fp(22), fontWeight: '900', marginBottom: wp(6) }}>
                    {lang === 'fr' ? '4 angles capturés !' : '4 angles captured!'}
                  </Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(12), marginBottom: wp(20), textAlign: 'center' }}>
                    {lang === 'fr' ? 'Analyse multi-angle en cours...' : 'Multi-angle analysis in progress...'}
                  </Text>

                  {/* Grille 2x2 des photos */}
                  <View style={{
                    flexDirection: 'row', flexWrap: 'wrap',
                    gap: wp(8), justifyContent: 'center',
                    marginBottom: wp(24),
                  }}>
                    {arPhotos.map((photo, i) => (
                      <View key={i} style={{
                        width: wp(120), height: wp(90), borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: 2, borderColor: photo ? '#00D984' : '#3A3F46',
                        backgroundColor: '#1A1D22',
                      }}>
                        {photo ? (
                          <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#3A3F46', fontSize: 20 }}>📷</Text>
                          </View>
                        )}
                        <View style={{
                          position: 'absolute', top: 4, left: 4,
                          backgroundColor: photo ? '#00D984' : '#3A3F46',
                          width: 18, height: 18, borderRadius: 9,
                          justifyContent: 'center', alignItems: 'center',
                        }}>
                          <Text style={{ color: photo ? '#000' : '#8892A0', fontSize: 9, fontWeight: '800' }}>{i + 1}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Bouton Analyser */}
                  <Pressable
                    onPress={() => {
                      const bestPhoto = arPhotos.find(p => p !== null);
                      if (bestPhoto) {
                        setCapturedPhoto(bestPhoto);
                        setScanScreen('analyzing');
                        resetArState();
                        runAnalysis(bestPhoto);
                      }
                    }}
                    style={({ pressed }) => ({
                      width: '100%',
                      paddingVertical: wp(14), borderRadius: 14,
                      backgroundColor: pressed ? '#00B572' : '#00D984',
                      alignItems: 'center',
                    })}
                  >
                    <Text style={{ color: '#0D1117', fontSize: fp(15), fontWeight: '800' }}>
                      {lang === 'fr' ? '🔬 Lancer l\'analyse multi-angle' : '🔬 Launch multi-angle analysis'}
                    </Text>
                  </Pressable>

                  {/* Badge premium */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(212,175,55,0.08)',
                    paddingHorizontal: 14, paddingVertical: 6,
                    borderRadius: 10, marginTop: wp(14),
                  }}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>🏆</Text>
                    <Text style={{ color: '#D4AF37', fontSize: fp(11), fontWeight: '600' }}>
                      +15 Lix • XSCAN AR
                    </Text>
                  </View>
                </View>
              )}

            </View>
          </CameraView>
        </View>
      )}

      {/* ═══════ ÉCRAN CAMÉRA — plein écran ═══════ */}
      {scanScreen === 'camera' && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 2000,
          backgroundColor: '#000',
        }}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
          >
            <View style={{ flex: 1, justifyContent: 'space-between' }}>

              {/* Header caméra */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: Platform.OS === 'android' ? 50 : 60,
                paddingHorizontal: wp(20),
              }}>
                <Pressable
                  onPress={() => { setScanScreen('none'); onClose(); setRecalculating(false); setCorrectionMode(false); setEditedIngredients([]); setSearchQuery(''); setSearchResults([]); setEditingQuantityIndex(null); setTempQuantity(''); }}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center', alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '300' }}>✕</Text>
                </Pressable>

                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ color: '#00D984', fontSize: fp(18), fontWeight: '900' }}>X</Text>
                  <Text style={{ color: '#FFF', fontSize: fp(18), fontWeight: '900' }}>SCAN</Text>
                </View>

                <View style={{ width: 40 }}/>
              </View>

              {/* Zone centrale — cadre de scan */}
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <View style={{
                  width: wp(260),
                  height: wp(260),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {/* Coin haut-gauche */}
                  <View style={{
                    position: 'absolute', top: 0, left: 0,
                    width: 40, height: 40,
                    borderTopWidth: 3, borderLeftWidth: 3,
                    borderColor: '#00D984', borderTopLeftRadius: 12,
                  }}/>
                  {/* Coin haut-droit */}
                  <View style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 40, height: 40,
                    borderTopWidth: 3, borderRightWidth: 3,
                    borderColor: '#00D984', borderTopRightRadius: 12,
                  }}/>
                  {/* Coin bas-gauche */}
                  <View style={{
                    position: 'absolute', bottom: 0, left: 0,
                    width: 40, height: 40,
                    borderBottomWidth: 3, borderLeftWidth: 3,
                    borderColor: '#00D984', borderBottomLeftRadius: 12,
                  }}/>
                  {/* Coin bas-droit */}
                  <View style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 40, height: 40,
                    borderBottomWidth: 3, borderRightWidth: 3,
                    borderColor: '#00D984', borderBottomRightRadius: 12,
                  }}/>

                  <Text style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: fp(13),
                    textAlign: 'center',
                  }}>
                    {lang === 'fr' ? 'Centrez votre plat\ndans le cadre' : 'Center your meal\nin the frame'}
                  </Text>
                </View>
              </View>

              {/* Bas — bouton capture */}
              <View style={{
                alignItems: 'center',
                paddingBottom: Platform.OS === 'android' ? 60 : 80,
              }}>
                <Pressable
                  onPress={takePicture}
                  style={({ pressed }) => ({
                    width: 72, height: 72, borderRadius: 36,
                    backgroundColor: pressed ? 'rgba(0,217,132,0.8)' : 'rgba(255,255,255,0.9)',
                    justifyContent: 'center', alignItems: 'center',
                    borderWidth: 4,
                    borderColor: '#00D984',
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  })}
                >
                  <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: '#FFF',
                    borderWidth: 2, borderColor: '#00D984',
                  }}/>
                </Pressable>

                <Text style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: fp(11),
                  marginTop: 10,
                }}>
                  {lang === 'fr' ? 'Appuyez pour capturer' : 'Tap to capture'}
                </Text>
              </View>

            </View>
          </CameraView>
        </View>
      )}

      {/* ═══════ ÉCRAN ANALYSE ═══════ */}
      {scanScreen === 'analyzing' && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 2000,
          backgroundColor: '#0D1117',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {capturedPhoto && (
            <Image
              source={{ uri: capturedPhoto.uri }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.15,
              }}
              blurRadius={10}
            />
          )}

          <View style={{ alignItems: 'center', paddingHorizontal: wp(30) }}>

            {/* Anneaux orbitaux + photo */}
            <View style={{ width: wp(180), height: wp(180), justifyContent: 'center', alignItems: 'center', marginBottom: wp(24) }}>
              {/* Anneau extérieur — vert doux */}
              <Animated.View style={{
                position: 'absolute', width: wp(180), height: wp(180),
                borderRadius: wp(90), borderWidth: 1.5,
                borderColor: 'transparent', borderTopColor: 'rgba(0,217,132,0.35)', borderBottomColor: 'rgba(0,217,132,0.12)',
                transform: [{ rotate: orbitRotate }],
              }} />
              {/* Anneau intérieur — gold */}
              <Animated.View style={{
                position: 'absolute', width: wp(160), height: wp(160),
                borderRadius: wp(80), borderWidth: 1.5,
                borderColor: 'transparent', borderTopColor: '#D4AF37', borderBottomColor: 'rgba(212,175,55,0.15)',
                transform: [{ rotate: orbitRotateReverse }],
              }} />

              {capturedPhoto ? (
                <View style={{
                  width: wp(140), height: wp(140), borderRadius: 20,
                  overflow: 'hidden',
                  borderWidth: 2, borderColor: 'rgba(0,217,132,0.2)',
                }}>
                  <Image
                    source={{ uri: capturedPhoto.uri }}
                    style={{ width: '100%', height: '100%' }}
                  />
                  <View style={{
                    position: 'absolute',
                    left: 0, right: 0,
                    height: 2,
                    backgroundColor: 'rgba(0,217,132,0.35)',
                    top: '50%',
                    opacity: 0.6,
                  }}/>
                </View>
              ) : null}
            </View>

            {/* Label ANALYSE EN COURS */}
            <Text style={{
              color: 'rgba(0,217,132,0.35)',
              fontSize: fp(10),
              fontWeight: '800',
              letterSpacing: 3,
              marginBottom: wp(10),
              textAlign: 'center',
            }}>
              ANALYSE EN COURS
            </Text>

            <Text style={{
              color: '#EAEEF3',
              fontSize: fp(20),
              fontWeight: '700',
              marginBottom: wp(24),
              textAlign: 'center',
              minHeight: fp(28),
            }}>
              {loadingTexts[currentLoadingIndex]}
            </Text>

            {/* Barre de progression + point pulse */}
            <View style={{ width: wp(220), alignItems: 'flex-start' }}>
              <View style={{
                width: wp(220),
                height: 6,
                backgroundColor: 'rgba(0,217,132,0.1)',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: analysisProgress + '%',
                  backgroundColor: 'rgba(0,217,132,0.35)',
                  borderRadius: 3,
                }}/>
              </View>
              {/* Point pulse au bout de la barre */}
              <Animated.View style={{
                position: 'absolute',
                top: -2,
                left: wp(220) * analysisProgress / 100 - 5,
                width: 10, height: 10, borderRadius: 5,
                backgroundColor: 'rgba(0,217,132,0.35)',
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.3] }) }],
              }} />
            </View>

            <Text style={{
              color: '#5A6070',
              fontSize: fp(11),
              marginTop: wp(8),
            }}>
              {analysisProgress}%
            </Text>
          </View>
        </View>
      )}

      {/* ═══════ ÉCRAN ERREUR — Image non-alimentaire ═══════ */}
      {scanScreen === 'error' && scanError && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 2000,
          backgroundColor: '#0D1117',
        }}>
          {/* Photo floue en fond */}
          {capturedPhoto && (
            <Image
              source={{ uri: capturedPhoto.uri }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.08,
              }}
              blurRadius={20}
            />
          )}

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: wp(30),
              paddingTop: Platform.OS === 'android' ? 60 : 80,
              paddingBottom: Platform.OS === 'android' ? 60 : 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Icône principale */}
            <View style={{
              width: wp(80), height: wp(80), borderRadius: wp(40),
              backgroundColor: 'rgba(255,140,66,0.08)',
              borderWidth: 2, borderColor: 'rgba(255,140,66,0.2)',
              justifyContent: 'center', alignItems: 'center',
              marginBottom: wp(24),
            }}>
              <Svg width={40} height={40} viewBox="0 0 40 40">
                <Circle cx="17" cy="17" r="10" fill="none" stroke="#FF8C42" strokeWidth={2.5}/>
                <Line x1="25" y1="25" x2="35" y2="35" stroke="#FF8C42" strokeWidth={2.5} strokeLinecap="round"/>
                <Line x1="13" y1="13" x2="21" y2="21" stroke="#FF8C42" strokeWidth={2} strokeLinecap="round"/>
                <Line x1="21" y1="13" x2="13" y2="21" stroke="#FF8C42" strokeWidth={2} strokeLinecap="round"/>
              </Svg>
            </View>

            {/* Mini photo capturée */}
            {capturedPhoto && (
              <View style={{
                width: wp(100), height: wp(100), borderRadius: 16,
                overflow: 'hidden', marginBottom: wp(24),
                borderWidth: 2, borderColor: 'rgba(255,140,66,0.2)',
                opacity: 0.7,
              }}>
                <Image
                  source={{ uri: capturedPhoto.uri }}
                  style={{ width: '100%', height: '100%' }}
                />
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <View style={{
                    width: '140%', height: 3, backgroundColor: 'rgba(255,59,48,0.6)',
                    transform: [{ rotate: '-45deg' }],
                  }}/>
                </View>
              </View>
            )}

            {/* Titre */}
            <Text style={{
              color: '#EAEEF3', fontSize: fp(20), fontWeight: '800',
              textAlign: 'center', marginBottom: wp(10),
              lineHeight: fp(26),
            }}>
              {scanError.title}
            </Text>

            {/* Sous-titre */}
            <Text style={{
              color: '#8892A0', fontSize: fp(13), textAlign: 'center',
              lineHeight: fp(20), marginBottom: wp(30),
            }}>
              {scanError.subtitle}
            </Text>

            {/* Conseils */}
            <View style={{
              width: '100%', borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
              padding: wp(16), marginBottom: wp(30),
            }}>
              <Text style={{
                color: '#8892A0', fontSize: fp(10), fontWeight: '700',
                letterSpacing: 1.5, marginBottom: wp(10),
              }}>
                {lang === 'fr' ? 'CONSEILS POUR UN BON SCAN' : 'TIPS FOR A GOOD SCAN'}
              </Text>
              {[
                { emoji: '📸', text: lang === 'fr' ? 'Prenez la photo de haut, bien centrée' : 'Take the photo from above, well centered' },
                { emoji: '💡', text: lang === 'fr' ? 'Assurez-vous d\'un bon éclairage' : 'Make sure lighting is good' },
                { emoji: '🍽️', text: lang === 'fr' ? 'Le plat doit être bien visible dans le cadre' : 'The dish should be clearly visible in frame' },
                { emoji: '🚫', text: lang === 'fr' ? 'Évitez les images floues ou non-alimentaires' : 'Avoid blurry or non-food images' },
              ].map((tip, i) => (
                <View key={i} style={{
                  flexDirection: 'row', alignItems: 'center',
                  marginBottom: i < 3 ? wp(8) : 0,
                }}>
                  <Text style={{ fontSize: 14, marginRight: wp(8) }}>{tip.emoji}</Text>
                  <Text style={{ color: '#EAEEF3', fontSize: fp(11), flex: 1 }}>{tip.text}</Text>
                </View>
              ))}
            </View>

            {/* Boutons */}
            <View style={{ width: '100%', gap: wp(10) }}>
              {/* Réessayer */}
              <Pressable
                onPress={() => {
                  setScanScreen('none');
                  setScanError(null);
                  setScanResult(null);
                  setCapturedPhoto(null);
                  setCurrentDishName('');
                  setScanMode('none');
                  setScanSuggestions([]);
                  setAiVisual(null);
                  pickImageFromGallery();
                }}
                style={({ pressed }) => ({
                  paddingVertical: wp(14), borderRadius: 14,
                  backgroundColor: pressed ? '#00B572' : '#00D984',
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#0D1117', fontSize: fp(15), fontWeight: '800' }}>
                  {lang === 'fr' ? '📸 Réessayer avec une autre photo' : '📸 Try again with another photo'}
                </Text>
              </Pressable>

              {/* Fermer */}
              <Pressable
                onPress={() => {
                  setScanScreen('none');
                  setScanError(null);
                  setScanResult(null);
                  setCapturedPhoto(null);
                  setCurrentDishName('');
                  setScanMode('none');
                  setScanSuggestions([]);
                  setAiVisual(null);
                  onClose();
                }}
                style={{ alignItems: 'center', paddingVertical: wp(8) }}
              >
                <Text style={{ color: '#5A6070', fontSize: fp(12) }}>
                  {lang === 'fr' ? 'Fermer' : 'Close'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      )}

      {/* ══════ ÉCRAN RÉSULTAT ══════ */}
      {scanScreen === 'result' && scanResult && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 2000,
          backgroundColor: '#0D1117',
        }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: wp(100) }}
          >
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: Platform.OS === 'android' ? 50 : 60,
              paddingHorizontal: wp(16),
              paddingBottom: wp(12),
            }}>
              <Pressable onPress={() => {
                setScanScreen('none');
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
              }}>
                <Text style={{ color: '#8892A0', fontSize: fp(14) }}>✕ {lang === 'fr' ? 'Fermer' : 'Close'}</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ color: '#00D984', fontSize: fp(16), fontWeight: '900' }}>X</Text>
                <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '900' }}>SCAN</Text>
              </View>
              <View style={{ width: 60 }}/>
            </View>

            {/* Photo capturée */}
            {capturedPhoto && (
              <View style={{
                marginHorizontal: wp(16),
                height: wp(200),
                borderRadius: 18,
                overflow: 'hidden',
                marginBottom: wp(16),
              }}>
                <Image
                  source={{ uri: capturedPhoto.uri }}
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            )}

            {/* Nom du plat */}
            <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '700', marginRight: 8 }}>✅</Text>
                <Text style={{ color: '#8892A0', fontSize: fp(12) }}>
                  {lang === 'fr' ? 'Plat identifié' : 'Meal identified'}
                </Text>
              </View>

              <Text style={{
                color: '#EAEEF3', fontSize: fp(22), fontWeight: '900',
                marginBottom: wp(6),
              }}>
                {currentDishName || scanResult.name_fr || scanResult.dish_name_fr || 'Plat non identifié'}
              </Text>

              {/* Lien "Pas ce plat ?" avec icône shake */}
              <Pressable
                onPress={() => setShowAlternatives(true)}
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}
              >
                <Animated.View style={{
                  transform: [{ rotate: alertRotate }],
                  marginRight: 6,
                }}>
                  <View style={{
                    width: 20, height: 20, borderRadius: 10,
                    backgroundColor: 'rgba(255,140,66,0.15)',
                    borderWidth: 1, borderColor: 'rgba(255,140,66,0.4)',
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Text style={{ color: '#FF8C42', fontSize: 12, fontWeight: '900' }}>!</Text>
                  </View>
                </Animated.View>

                <Text style={{
                  color: '#FF8C42',
                  fontSize: fp(12),
                  fontWeight: '600',
                  textDecorationLine: 'underline',
                }}>
                  {lang === 'fr' ? 'Pas ce plat ? Clique ici !' : 'Not this dish? Tap here!'}
                </Text>
              </Pressable>

              {/* Barre de confiance */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#8892A0', fontSize: fp(11), marginRight: 8 }}>
                  {lang === 'fr' ? 'Confiance :' : 'Confidence:'}
                </Text>
                <View style={{
                  flex: 1, height: 5, backgroundColor: 'rgba(0,217,132,0.1)',
                  borderRadius: 3, overflow: 'hidden', marginRight: 8,
                }}>
                  <View style={{
                    height: '100%',
                    width: `${scanResult.confidence || 50}%`,
                    backgroundColor: (scanResult.confidence || 50) > 70 ? '#00D984' : (scanResult.confidence || 50) > 50 ? '#FF8C42' : '#FF3B30',
                    borderRadius: 3,
                  }} />
                </View>
                <Text style={{
                  color: (scanResult.confidence || 50) > 70 ? '#00D984' : '#FF8C42',
                  fontSize: fp(12), fontWeight: '700',
                }}>
                  {scanResult.confidence || 50}%
                </Text>
              </View>
            </View>

            {/* MetalCard : liste des ingrédients */}
            <View style={{ marginHorizontal: wp(16), marginBottom: wp(16) }}>
              <View style={{
                borderRadius: 18, padding: 1.2,
                backgroundColor: '#4A4F55', elevation: 12,
              }}>
                <LinearGradient
                  colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                  style={{ borderRadius: 17, padding: wp(16) }}
                >
                  <View style={{
                    position: 'absolute', top: 0, left: 20, right: 20,
                    height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
                  }}/>

                  <Text style={{
                    color: '#8892A0', fontSize: fp(11), fontWeight: '700',
                    letterSpacing: 1.5, marginBottom: wp(12),
                  }}>
                    {lang === 'fr' ? 'INGRÉDIENTS DÉTECTÉS' : 'DETECTED INGREDIENTS'}
                  </Text>

                  {(scanResult.ingredients || []).map((ing, index) => (
                    <View key={index} style={{
                      paddingVertical: wp(8),
                      borderBottomWidth: index < (scanResult.ingredients || []).length - 1 ? 0.5 : 0,
                      borderBottomColor: 'rgba(255,255,255,0.05)',
                    }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '600' }}>
                              {ing.name}
                            </Text>
                            {ing.uncertain && (
                              <View style={{
                                marginLeft: 6, width: 18, height: 18, borderRadius: 9,
                                backgroundColor: 'rgba(255,140,66,0.15)',
                                justifyContent: 'center', alignItems: 'center',
                                borderWidth: 1, borderColor: 'rgba(255,140,66,0.3)',
                              }}>
                                <Text style={{ color: '#FF8C42', fontSize: fp(10), fontWeight: '800' }}>?</Text>
                              </View>
                            )}
                          </View>
                          <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                            {ing.quantity_g}g
                            {ing.source === 'ai_estimate' ? ' • estimation IA' : ''}
                          </Text>
                        </View>
                        <Text style={{ color: '#FF8C42', fontSize: fp(13), fontWeight: '700' }}>
                          {ing.calories} kcal
                        </Text>
                      </View>

                      {/* Alternatives si incertain */}
                      {ing.uncertain && ing.alternatives && ing.alternatives.length > 0 && (
                        <View style={{
                          flexDirection: 'row', flexWrap: 'wrap',
                          marginTop: wp(6), gap: wp(6),
                        }}>
                          <Text style={{ color: '#5A6070', fontSize: fp(9), alignSelf: 'center', marginRight: 4 }}>
                            {lang === 'fr' ? 'Plutôt :' : 'Rather:'}
                          </Text>
                          {ing.alternatives.map((alt, altIndex) => (
                            <Pressable
                              key={altIndex}
                              onPress={() => recalculateIngredient(index, alt)}
                              style={({ pressed }) => ({
                                backgroundColor: pressed ? 'rgba(0,217,132,0.15)' : 'rgba(255,255,255,0.05)',
                                paddingHorizontal: 10, paddingVertical: 4,
                                borderRadius: 8, borderWidth: 0.5,
                                borderColor: pressed ? '#00D984' : '#3A3F46',
                              })}
                            >
                              <Text style={{ color: '#EAEEF3', fontSize: fp(10), fontWeight: '600' }}>
                                {alt}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}

                  <View style={{
                    height: 1, backgroundColor: 'rgba(0,217,132,0.15)',
                    marginVertical: wp(12),
                  }}/>

                  {/* Totaux */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '800' }}>TOTAL</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {recalculating && (
                        <Text style={{ color: '#00D984', fontSize: fp(10), marginRight: 8, fontStyle: 'italic' }}>
                          {lang === 'fr' ? 'recalcul...' : 'recalculating...'}
                        </Text>
                      )}
                      <Text style={{ color: '#FF8C42', fontSize: fp(18), fontWeight: '900' }}>
                        {scanResult.totals?.calories || scanResult.calories || 0} kcal
                      </Text>
                    </View>
                  </View>

                  {/* Macros */}
                  <View style={{ flexDirection: 'row', marginTop: wp(10), gap: wp(8) }}>
                    {[
                      { value: `${(scanResult.totals?.protein_g || scanResult.protein_g || 0).toFixed(1)}g`, color: '#FF6B6B', label: lang === 'fr' ? 'Protéines' : 'Protein' },
                      { value: `${(scanResult.totals?.carbs_g || scanResult.carbs_g || 0).toFixed(1)}g`, color: '#FFD93D', label: lang === 'fr' ? 'Glucides' : 'Carbs' },
                      { value: `${(scanResult.totals?.fat_g || scanResult.fat_g || 0).toFixed(1)}g`, color: '#4DA6FF', label: lang === 'fr' ? 'Lipides' : 'Fat' },
                    ].map((m, i) => (
                      <View key={i} style={{
                        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: 10, paddingVertical: wp(8), alignItems: 'center',
                        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                      }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: m.color, marginBottom: 3 }}/>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>{m.value}</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8), marginTop: 1 }}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Infos supplémentaires */}
            <View style={{ paddingHorizontal: wp(16), marginBottom: wp(20) }}>
              <Text style={{ color: '#5A6070', fontSize: fp(11) }}>
                ⚖️ {lang === 'fr' ? 'Poids estimé' : 'Estimated weight'} : ~{
                  (() => {
                    const totalGrams = (scanResult.ingredients || []).reduce((sum, ing) => sum + (ing.quantity_g || 0), 0);
                    if (totalGrams >= 1000) {
                      return (totalGrams / 1000).toFixed(1) + ' kg';
                    }
                    return totalGrams + 'g';
                  })()
                }
                {scanResult.texture ? (' • 🍽️ ' + (
                  typeof scanResult.texture === 'string' ? scanResult.texture : ''
                )) : ''}
              </Text>
            </View>

            {/* Sélecteur de créneau */}
            <View style={{ paddingHorizontal: wp(16), marginBottom: wp(20) }}>
              <Text style={{ color: '#8892A0', fontSize: fp(11), fontWeight: '700', letterSpacing: 1.5, marginBottom: wp(8) }}>
                {lang === 'fr' ? 'CRÉNEAU REPAS' : 'MEAL SLOT'}
              </Text>
              <View style={{ flexDirection: 'row', gap: wp(8) }}>
                {MEAL_SLOTS.map((slot) => {
                  const isSelected = selectedMealType === slot.key;
                  return (
                    <Pressable
                      key={slot.key}
                      onPress={() => setSelectedMealType(slot.key)}
                      style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: 'column',
                        alignItems: 'center',
                        paddingVertical: wp(10),
                        borderRadius: 12,
                        backgroundColor: isSelected
                          ? 'rgba(0,217,132,0.12)'
                          : pressed
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(255,255,255,0.02)',
                        borderWidth: 1.5,
                        borderColor: isSelected
                          ? 'rgba(0,217,132,0.4)'
                          : '#2A2F36',
                      })}
                    >
                      <Text style={{ fontSize: 16, marginBottom: 3 }}>{slot.icon}</Text>
                      <Text style={{
                        color: isSelected ? '#00D984' : '#8892A0',
                        fontSize: fp(9),
                        fontWeight: isSelected ? '800' : '600',
                      }}>
                        {lang === 'fr' ? slot.label_fr : slot.label_en}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ══════ SUBSTITUTION — Amber Fox (via pagePowers) ══════ */}
            {(() => {
              const foxPower = (pagePowers || []).find(p =>
                (p.power_key === 'fox_sub_1' || p.power_key === 'fox_sub_2' || p.power_key === 'fox_sub_3') && p.unlocked
              );
              if (!foxPower) return null;

              const maxSubs = activeChar?.level >= 3 ? 3 : activeChar?.level >= 2 ? 2 : 1;

              return (
                <View style={{ marginHorizontal: wp(16), marginBottom: wp(16) }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,140,66,0.06)',
                    borderRadius: 14, padding: wp(12),
                    borderWidth: 1, borderColor: 'rgba(255,140,66,0.15)',
                  }}>
                    <Text style={{ fontSize: fp(16), marginRight: wp(8) }}>{foxPower.icon || '🦊'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#FF8C42', fontSize: fp(11), fontWeight: '700' }}>{foxPower.name_fr || 'Substitution'}</Text>
                      <Text style={{ color: '#5A6070', fontSize: fp(9), marginTop: 2 }}>
                        {todaySubstitutions}/{maxSubs} utilisée{todaySubstitutions > 1 ? 's' : ''} aujourd'hui
                      </Text>
                    </View>
                    <Pressable
                      onPress={async () => {
                        if (todaySubstitutions >= maxSubs) {
                          setXModalCfg({ visible: true, type: 'info', title: 'Limite atteinte', message: maxSubs + ' substitution' + (maxSubs > 1 ? 's' : '') + ' max par jour', onClose: closeXModal });
                          return;
                        }
                        const result = await consumePower(foxPower.power_key);
                        if (!result.success) return;
                        setTodaySubstitutions(prev => prev + 1);
                        setXModalCfg({ visible: true, type: 'info', title: '🦊 Substitution', message: 'Tap sur un ingrédient dans la liste ci-dessus pour voir des alternatives plus saines.', onClose: closeXModal });
                      }}
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? 'rgba(255,140,66,0.2)' : 'rgba(255,140,66,0.1)',
                        paddingHorizontal: wp(12), paddingVertical: wp(6), borderRadius: wp(8),
                        borderWidth: 1, borderColor: 'rgba(255,140,66,0.3)',
                      })}
                    >
                      <Text style={{ color: '#FF8C42', fontSize: fp(10), fontWeight: '700' }}>Substituer</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })()}

            {/* Boutons Corriger + Confirmer */}
            <View style={{
              flexDirection: 'row',
              paddingHorizontal: wp(16),
              gap: wp(12),
              marginBottom: wp(16),
            }}>
              <Pressable
                onPress={() => {
                  setEditedIngredients([...(scanResult.ingredients || [])]);
                  setCorrectionMode(true);
                  setSearchQuery('');
                  setSearchResults([]);
                  setEditingQuantityIndex(null);
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: wp(14),
                  borderRadius: 14,
                  backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                  borderWidth: 1, borderColor: '#3A3F46',
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#8892A0', fontSize: fp(14), fontWeight: '700' }}>
                  {lang === 'fr' ? 'Corriger' : 'Correct'}
                </Text>
              </Pressable>

              <Pressable
                onPress={saveMealToSupabase}
                disabled={isSaving || saveSuccess}
                style={({ pressed }) => ({
                  flex: 2,
                  paddingVertical: wp(14),
                  borderRadius: 14,
                  backgroundColor: saveSuccess
                    ? '#00D984'
                    : isSaving
                      ? 'rgba(0,217,132,0.12)'
                      : pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.06)',
                  borderWidth: saveSuccess ? 0 : 1,
                  borderColor: saveSuccess
                    ? 'transparent'
                    : pressed ? 'rgba(0,217,132,0.35)' : 'rgba(0,217,132,0.15)',
                  alignItems: 'center',
                  opacity: isSaving ? 0.7 : 1,
                })}
              >
                <Text style={{ color: saveSuccess ? '#0D1117' : '#00D984', fontSize: fp(14), fontWeight: '800' }}>
                  {saveSuccess
                    ? '✓ SAUVEGARDÉ ! +10 Lix'
                    : isSaving
                      ? '⏳ SAUVEGARDE...'
                      : '✓ CONFIRMER'}
                </Text>
              </Pressable>
            </View>

            {/* Récompense Lix */}
            <View style={{
              alignItems: 'center',
              paddingBottom: wp(20),
            }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: 'rgba(212,175,55,0.08)',
                paddingHorizontal: 14, paddingVertical: 6,
                borderRadius: 10,
              }}>
                <Text style={{ fontSize: 14, marginRight: 6 }}>🏆</Text>
                <Text style={{ color: '#D4AF37', fontSize: fp(12), fontWeight: '700' }}>
                  +10 Lix • XSCAN {lang === 'fr' ? 'réussi' : 'complete'} !
                </Text>
              </View>
            </View>

          </ScrollView>

          {/* ══════ POPUP ALTERNATIVES — "Pas ce plat ?" ══════ */}
          {showAlternatives && (
            <View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 3000,
              paddingHorizontal: wp(20),
            }}>
              <View style={{
                width: '100%',
                borderRadius: 20,
                padding: 1.2,
                backgroundColor: '#4A4F55',
              }}>
                <LinearGradient
                  colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                  style={{ borderRadius: 19, padding: wp(20) }}
                >
                  {/* Ligne émeraude top */}
                  <View style={{
                    position: 'absolute', top: 0, left: 20, right: 20,
                    height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
                  }} />

                  {/* Titre */}
                  <Text style={{
                    color: '#EAEEF3', fontSize: fp(18), fontWeight: '800',
                    textAlign: 'center', marginBottom: wp(6),
                  }}>
                    {lang === 'fr' ? 'Autres plats possibles' : 'Other possible dishes'}
                  </Text>
                  <Text style={{
                    color: '#8892A0', fontSize: fp(11), textAlign: 'center',
                    marginBottom: wp(16),
                  }}>
                    {lang === 'fr'
                      ? 'Les ingrédients et macros restent identiques'
                      : 'Ingredients and macros stay the same'}
                  </Text>

                  {/* Liste des alternatives */}
                  {alternativeDishes.map((alt, index) => {
                    const isCurrentDish = (alt.name_fr || alt.name_en) === currentDishName;
                    const countryFlag =
                      alt.country === 'SN' ? '🇸🇳' :
                      alt.country === 'ML' ? '🇲🇱' :
                      alt.country === 'CM' ? '🇨🇲' :
                      alt.country === 'BI' ? '🇧🇮' :
                      alt.country === 'NG' ? '🇳🇬' :
                      alt.country === 'KE' ? '🇰🇪' :
                      alt.country === 'CI' ? '🇨🇮' :
                      alt.country === 'IN' ? '🇮🇳' :
                      alt.country === 'GN' ? '🇬🇳' :
                      alt.country === 'BF' ? '🇧🇫' :
                      alt.country === 'CD' ? '🇨🇩' :
                      alt.country === 'TG' ? '🇹🇬' :
                      '🌍';

                    return (
                      <Pressable
                        key={index}
                        onPress={() => {
                          if (!isCurrentDish) {
                            const newDishName = lang === 'fr' ? alt.name_fr : alt.name_en;
                            setCurrentDishName(newDishName);

                            const matchingSuggestion = scanSuggestions.find(
                              s => s.name_fr === alt.name_fr || s.name_en === alt.name_en
                            );

                            if (matchingSuggestion && matchingSuggestion.ingredients && matchingSuggestion.ingredients.length > 0) {
                              setScanResult(matchingSuggestion);
                            }

                            setShowAlternatives(false);
                          }
                        }}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: wp(12),
                          paddingHorizontal: wp(14),
                          borderRadius: 14,
                          marginBottom: wp(8),
                          backgroundColor: isCurrentDish
                            ? 'rgba(0,217,132,0.10)'
                            : pressed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                          borderWidth: 1,
                          borderColor: isCurrentDish
                            ? 'rgba(0,217,132,0.3)'
                            : '#2A2F36',
                        })}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <Text style={{ fontSize: 22, marginRight: wp(10) }}>{countryFlag}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              color: isCurrentDish ? '#00D984' : '#EAEEF3',
                              fontSize: fp(14), fontWeight: '700',
                            }} numberOfLines={1}>
                              {lang === 'fr' ? alt.name_fr : alt.name_en}
                            </Text>
                            <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                              {alt.confidence}% {lang === 'fr' ? 'de confiance' : 'confidence'}
                            </Text>
                          </View>
                        </View>

                        {isCurrentDish ? (
                          <View style={{
                            width: 22, height: 22, borderRadius: 11,
                            backgroundColor: '#00D984',
                            justifyContent: 'center', alignItems: 'center',
                          }}>
                            <Text style={{ color: '#0D1117', fontSize: 12, fontWeight: '900' }}>✓</Text>
                          </View>
                        ) : (
                          <View style={{
                            width: 22, height: 22, borderRadius: 11,
                            borderWidth: 1.5, borderColor: '#3A3F46',
                          }} />
                        )}
                      </Pressable>
                    );
                  })}

                  {/* Fun fact nutritionnel */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(212,175,55,0.06)',
                    paddingHorizontal: wp(12),
                    paddingVertical: wp(8),
                    borderRadius: 10,
                    marginTop: wp(10),
                  }}>
                    <Text style={{ fontSize: 14, marginRight: 8 }}>💡</Text>
                    <Text style={{
                      color: '#8892A0', fontSize: fp(9), fontStyle: 'italic',
                      flex: 1, lineHeight: fp(13),
                    }}>
                      {lang === 'fr'
                        ? 'Chaque plat porte une identité culinaire unique. Votre dashboard se base sur les ingrédients détectés.'
                        : 'Every dish carries a unique culinary identity. Your dashboard is based on detected ingredients.'}
                    </Text>
                  </View>

                  {/* Bouton fermer */}
                  <Pressable
                    onPress={function() { setShowAlternatives(false); }}
                    style={({ pressed }) => ({
                      marginTop: wp(8),
                      paddingVertical: wp(12),
                      borderRadius: 14,
                      backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.06)',
                      borderWidth: 1,
                      borderColor: pressed ? 'rgba(0,217,132,0.35)' : 'rgba(0,217,132,0.15)',
                      alignItems: 'center',
                    })}
                  >
                    <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '800' }}>
                      {lang === 'fr' ? 'Valider' : 'Confirm'}
                    </Text>
                  </Pressable>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* ══════ ÉCRAN CORRECTION ══════ */}
          {correctionMode && (
            <View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              zIndex: 2500,
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
                <Pressable onPress={() => {
                  setCorrectionMode(false);
                  setEditedIngredients([]);
                  setSearchQuery('');
                  setSearchResults([]);
                  setEditingQuantityIndex(null);
                }}>
                  <Text style={{ color: '#8892A0', fontSize: fp(14) }}>✕ {lang === 'fr' ? 'Annuler' : 'Cancel'}</Text>
                </Pressable>
                <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800' }}>
                  {lang === 'fr' ? 'Corriger' : 'Correct'}
                </Text>
                <Pressable onPress={applyCorrection}>
                  <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '700' }}>
                    ✓ {lang === 'fr' ? 'Valider' : 'Apply'}
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                ref={correctionScrollRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: wp(250) }}
              >
                {/* Totaux en temps réel */}
                <View style={{
                  marginHorizontal: wp(16), marginTop: wp(12), marginBottom: wp(16),
                  borderRadius: 16, padding: 1,
                  backgroundColor: '#4A4F55',
                }}>
                  <LinearGradient
                    colors={['#3A3F46', '#252A30', '#1A1D22']}
                    style={{ borderRadius: 15, padding: wp(14), alignItems: 'center' }}
                  >
                    <Text style={{ color: '#FF8C42', fontSize: fp(28), fontWeight: '900' }}>
                      {getEditedTotals().calories} kcal
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: wp(8), gap: wp(16) }}>
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', marginBottom: 2 }} />
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>
                          {getEditedTotals().protein_g.toFixed(1)}g
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>{lang === 'fr' ? 'Protéines' : 'Protein'}</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginBottom: 2 }} />
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>
                          {getEditedTotals().carbs_g.toFixed(1)}g
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>{lang === 'fr' ? 'Glucides' : 'Carbs'}</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4DA6FF', marginBottom: 2 }} />
                        <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '700' }}>
                          {getEditedTotals().fat_g.toFixed(1)}g
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8) }}>{lang === 'fr' ? 'Lipides' : 'Fat'}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Liste des ingrédients éditables */}
                <View style={{ paddingHorizontal: wp(16) }}>
                  <Text style={{
                    color: '#8892A0', fontSize: fp(11), fontWeight: '700',
                    letterSpacing: 1.5, marginBottom: wp(10),
                  }}>
                    {lang === 'fr' ? 'INGRÉDIENTS' : 'INGREDIENTS'} ({editedIngredients.length})
                  </Text>

                  {editedIngredients.map((ing, index) => (
                    <View key={index} style={{
                      flexDirection: 'row', alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderRadius: 14, marginBottom: wp(8),
                      padding: wp(12),
                      borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                    }}>
                      {/* Info ingrédient */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '600' }}>
                          {ing.name}
                          {ing.added_manually && (
                            <Text style={{ color: '#00D984', fontSize: fp(9) }}> +ajouté</Text>
                          )}
                        </Text>

                        {/* Quantité — tap pour éditer */}
                        {editingQuantityIndex === index ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <TextInput
                              value={tempQuantity}
                              onChangeText={setTempQuantity}
                              keyboardType="numeric"
                              autoFocus={true}
                              style={{
                                color: '#00D984', fontSize: fp(12), fontWeight: '700',
                                backgroundColor: 'rgba(0,217,132,0.08)',
                                borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
                                minWidth: 50, borderWidth: 1, borderColor: 'rgba(0,217,132,0.3)',
                              }}
                              onSubmitEditing={() => updateQuantity(index, tempQuantity)}
                              onBlur={() => {
                                if (tempQuantity) updateQuantity(index, tempQuantity);
                                else { setEditingQuantityIndex(null); setTempQuantity(''); }
                              }}
                            />
                            <Text style={{ color: '#5A6070', fontSize: fp(11), marginLeft: 4 }}>g</Text>
                          </View>
                        ) : (
                          <Pressable onPress={() => {
                            setEditingQuantityIndex(index);
                            setTempQuantity(String(ing.quantity_g || 100));
                          }}>
                            <Text style={{ color: '#00D984', fontSize: fp(11), marginTop: 3, textDecorationLine: 'underline' }}>
                              {ing.quantity_g || 100}g — {lang === 'fr' ? 'modifier' : 'edit'}
                            </Text>
                          </Pressable>
                        )}
                      </View>

                      {/* Calories */}
                      <Text style={{ color: '#FF8C42', fontSize: fp(13), fontWeight: '700', marginRight: wp(10) }}>
                        {ing.calories} kcal
                      </Text>

                      {/* Bouton supprimer */}
                      <Pressable
                        onPress={() => removeIngredient(index)}
                        style={({ pressed }) => ({
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: pressed ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.08)',
                          justifyContent: 'center', alignItems: 'center',
                          borderWidth: 1, borderColor: 'rgba(255,59,48,0.2)',
                        })}
                      >
                        <Text style={{ color: '#FF3B30', fontSize: 14, fontWeight: '700' }}>×</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>

                {/* Barre de recherche — Ajouter un ingrédient */}
                <View style={{ paddingHorizontal: wp(16), marginTop: wp(16) }}>
                  <Text style={{
                    color: '#8892A0', fontSize: fp(11), fontWeight: '700',
                    letterSpacing: 1.5, marginBottom: wp(8),
                  }}>
                    {lang === 'fr' ? 'AJOUTER UN INGRÉDIENT' : 'ADD INGREDIENT'}
                  </Text>

                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: 14, paddingHorizontal: wp(12),
                    borderWidth: 1, borderColor: searchQuery.length > 0 ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.05)',
                  }}>
                    <Text style={{ color: '#5A6070', fontSize: 16, marginRight: 8 }}>🔍</Text>
                    <TextInput
                      value={searchQuery}
                      onChangeText={searchIngredients}
                      placeholder={lang === 'fr' ? 'Tapez un ingrédient...' : 'Type an ingredient...'}
                      placeholderTextColor="#5A6070"
                      onFocus={() => {
                        setTimeout(() => {
                          if (correctionScrollRef.current) {
                            correctionScrollRef.current.scrollToEnd({ animated: true });
                          }
                        }, 300);
                      }}
                      style={{
                        flex: 1, color: '#EAEEF3', fontSize: fp(13),
                        paddingVertical: wp(12),
                      }}
                    />
                    {searchQuery.length > 0 && (
                      <Pressable onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
                        <Text style={{ color: '#8892A0', fontSize: 16 }}>✕</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Indicateur de recherche */}
                  {isSearching && (
                    <Text style={{ color: '#00D984', fontSize: fp(10), marginTop: wp(6), fontStyle: 'italic' }}>
                      {lang === 'fr' ? 'Recherche...' : 'Searching...'}
                    </Text>
                  )}

                  {/* Résultats de recherche */}
                  {searchResults.length > 0 && (
                    <View style={{
                      marginTop: wp(8),
                      borderRadius: 14,
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                      overflow: 'hidden',
                    }}>
                      {searchResults.map((result, i) => (
                        <Pressable
                          key={i}
                          onPress={() => addIngredientFromSearch(result)}
                          style={({ pressed }) => ({
                            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                            paddingVertical: wp(10), paddingHorizontal: wp(12),
                            backgroundColor: pressed ? 'rgba(0,217,132,0.08)' : 'transparent',
                            borderBottomWidth: i < searchResults.length - 1 ? 0.5 : 0,
                            borderBottomColor: 'rgba(255,255,255,0.05)',
                          })}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#EAEEF3', fontSize: fp(12), fontWeight: '600' }}>
                              {result.name}
                            </Text>
                            <Text style={{ color: '#5A6070', fontSize: fp(9), marginTop: 2 }}>
                              {result.category || ''} • {result.kcal_per_100g} kcal/100g
                              {result.table === 'preparations_master' ? ' • cuit' : ''}
                            </Text>
                          </View>
                          <View style={{
                            backgroundColor: 'rgba(0,217,132,0.08)',
                            paddingHorizontal: 10, paddingVertical: 4,
                            borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                          }}>
                            <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '700' }}>
                              + {lang === 'fr' ? 'Ajouter' : 'Add'}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Message si aucun résultat */}
                  {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <View style={{
                      marginTop: wp(8), padding: wp(12),
                      borderRadius: 14, backgroundColor: 'rgba(255,140,66,0.06)',
                      borderWidth: 0.5, borderColor: 'rgba(255,140,66,0.15)',
                    }}>
                      <Text style={{ color: '#FF8C42', fontSize: fp(11), textAlign: 'center' }}>
                        {lang === 'fr'
                          ? `"${searchQuery}" non trouvé dans notre base`
                          : `"${searchQuery}" not found in our database`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Info Lix */}
                <View style={{
                  marginHorizontal: wp(16), marginTop: wp(24),
                  alignItems: 'center',
                }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(212,175,55,0.06)',
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: 10,
                  }}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>🏆</Text>
                    <Text style={{ color: '#D4AF37', fontSize: fp(11), fontWeight: '600' }}>
                      +5 Lix • {lang === 'fr' ? 'Correction confirmée' : 'Correction confirmed'}
                    </Text>
                  </View>
                </View>

              </ScrollView>

              {/* Bouton Valider fixe en bas */}
              <View style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                paddingHorizontal: wp(16), paddingBottom: Platform.OS === 'android' ? 55 : 40,
                paddingTop: wp(10),
                backgroundColor: '#0D1117',
                borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.05)',
              }}>
                <Pressable
                  onPress={applyCorrection}
                  style={({ pressed }) => ({
                    paddingVertical: wp(14),
                    borderRadius: 14,
                    backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.06)',
                    borderWidth: 1,
                    borderColor: pressed ? 'rgba(0,217,132,0.35)' : 'rgba(0,217,132,0.15)',
                    alignItems: 'center',
                  })}
                >
                  <Text style={{ color: '#00D984', fontSize: fp(15), fontWeight: '800' }}>
                    ✓ {lang === 'fr' ? 'APPLIQUER LA CORRECTION' : 'APPLY CORRECTION'}
                  </Text>
                </Pressable>
              </View>
              </KeyboardAvoidingView>
            </View>
          )}

        </View>
      )}

      <LixumModal visible={xModalCfg.visible} type={xModalCfg.type} title={xModalCfg.title} message={xModalCfg.message} onClose={xModalCfg.onClose || closeXModal} />
      <EnergyGateModal
        visible={energyGateData !== null}
        onClose={function() { setEnergyGateData(null); }}
        energyCost={energyGateData ? energyGateData.energy_cost : 0}
        energyBalance={energyGateData ? energyGateData.energy_balance : 0}
        lixBalance={energyGateData ? energyGateData.lix_balance : 0}
        onRecharge={function() { setEnergyGateData(null); refreshLixFromServer(); }}
        onViewPlans={function() { setEnergyGateData(null); console.log('Navigate to subscription plans'); }}
      />
    </View>
  );
});

export default XscanScreen;
