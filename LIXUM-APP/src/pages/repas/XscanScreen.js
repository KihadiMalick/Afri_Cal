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
  // FONCTIONS (Phase 2)
  // ============================================================

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
