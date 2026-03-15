// LIXUM - Page Repas / Meals — Phase 3 (Premium Polish)
// Même design system que DashboardBg-test.js
// Dépendances: expo-linear-gradient, react-native-svg, react-native-safe-area-context

/*
PRICING SCAN XSCAN :
- Utilisateur GRATUIT : 1 scan/jour (Xscan OU Galerie, partagé)
- Abonné PREMIUM : 3 scans/jour (Xscan OU Galerie, partagé)
- Au-delà du quota : 100 Lix par scan supplémentaire
- Saisie manuelle : TOUJOURS gratuite et illimitée

ABONNEMENTS :
- Premium Pro : 14,99$/mois → 15 000 Lix offerts
- Premium Standard : 9,99$/mois → 10 000 Lix offerts
*/


import React, { useEffect, useRef, useState } from 'react';
import {
  View, Dimensions, Text, StyleSheet, Pressable, Image,
  Animated, ScrollView, PixelRatio, Platform, TouchableOpacity, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Path, Rect, Ellipse, Defs, Mask, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { createClient } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';

const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { width: W } = Dimensions.get('window');

// ============================================
// SYSTÈME RESPONSIVE — Base design : 320dp
// ============================================
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ============================================
// MOCK DATA
// ============================================
const MOCK_CALORIES = {
  consumed: 1585,
  goal: 2330,
  protein: 89,
  carbs: 120,
  fat: 52,
};

const MOCK_FREQUENT = [
  { name: 'Riz + Haricots', cal: 285 },
  { name: 'Ugali', cal: 310 },
  { name: 'Pain beurré', cal: 320 },
  { name: 'Banane plantain', cal: 230 },
  { name: 'Fumbwa', cal: 195 },
  { name: 'Sambaza frit', cal: 280 },
];

const MOCK_RECIPES = [
  { name: 'Thieboudienne', origin: '🇸🇳 Sénégal', cal: 520, bgTop: '#8B4513', bgBottom: '#5D2E0D', ingredients: ['🐟', '🍚', '🥕'] },
  { name: 'Ndolé', origin: '🇨🇲 Cameroun', cal: 380, bgTop: '#2E5A1C', bgBottom: '#1A3510', ingredients: ['🥬', '🥜', '🍖'] },
  { name: 'Fumbwa', origin: '🇧🇮 Burundi', cal: 290, bgTop: '#1E4A20', bgBottom: '#0F2810', ingredients: ['🥬', '🫘', '🧅'] },
  { name: 'Ugali + Sukuma', origin: '🇰🇪 Kenya', cal: 350, bgTop: '#8B6914', bgBottom: '#5A440D', ingredients: ['🌽', '🥬', '🧅'] },
  { name: 'Mafé', origin: '🇲🇱 Mali', cal: 480, bgTop: '#A0522D', bgBottom: '#6B3720', ingredients: ['🥜', '🍖', '🍅'] },
  { name: 'Jollof Rice', origin: '🇳🇬 Nigeria', cal: 410, bgTop: '#B22222', bgBottom: '#7A1717', ingredients: ['🍚', '🍅', '🌶️'] },
];

// ============================================
// COMPOSANT — LockIcon (copié du dashboard)
// ============================================
const LockIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill="#8892A0" opacity={0.6} />
    <Path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill="#EAEEF3" />
  </Svg>
);

// ============================================
// COMPOSANT — Bottom Tab Bar (copié du dashboard)
// ============================================
const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'medicai', label: 'MedicAi', iconActive: 'medkit', iconInactive: 'medkit-outline', locked: true, isMedicAi: true },
  { key: 'profile', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

const BottomTabs = ({ activeTab, onTabPress }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#141A22',
      borderTopWidth: 1,
      borderTopColor: 'rgba(74,79,85,0.5)',
      paddingTop: wp(10),
      paddingBottom: Platform.OS === 'android' ? 50 : 34,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 20,
    }}
  >
    {TABS.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: wp(4) }}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <View style={{ position: 'relative' }}>
            {tab.isMedicAi ? (
              <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24">
                <Defs>
                  <SvgLinearGradient id="medicGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#FF6B8A" />
                    <Stop offset="100%" stopColor="#FF3B5C" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="8" y="2" width="8" height="20" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Rect x="2" y="8" width="20" height="8" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Path d="M12 11.5c.5-.8 1.5-1 2-.5s.5 1.5 0 2.5l-2 2-2-2c-.5-1-.5-2 0-2.5s1.5-.3 2 .5z"
                  fill="white" opacity={0.7} />
              </Svg>
            ) : (
              <Ionicons
                name={active ? tab.iconActive : tab.iconInactive}
                size={wp(22)}
                color={active ? '#00D984' : '#6B7B8D'}
              />
            )}
            {tab.locked && (
              <View style={{
                position: 'absolute', top: -3, right: -6,
                backgroundColor: 'rgba(21,27,35,0.9)', borderRadius: 6,
                width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
              }}>
                <LockIcon size={10} />
              </View>
            )}
          </View>
          <Text style={[
            { color: '#6B7B8D', fontSize: fp(9), fontWeight: '600', letterSpacing: wp(0.3), marginTop: -2 },
            active && (tab.isMedicAi ? { color: '#FF3B5C' } : { color: '#00D984' }),
            tab.isMedicAi && !active && { color: '#8892A0' },
          ]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ============================================
// COMPOSANT — SectionTitle (FIX 3)
// ============================================
const SectionTitle = ({ title, rightAction, rightLabel }) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(16),
    marginBottom: wp(12),
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{
        width: 3, height: 18, borderRadius: 1.5,
        backgroundColor: '#00D984', marginRight: 8,
      }}/>
      <Text style={{
        color: '#EAEEF3',
        fontSize: fp(14),
        fontWeight: '800',
        letterSpacing: 2,
        textTransform: 'uppercase',
      }}>
        {title}
      </Text>
    </View>
    {rightLabel && (
      <Pressable onPressIn={rightAction}>
        <Text style={{ color: '#00D984', fontSize: fp(11), fontWeight: '600' }}>
          {rightLabel}
        </Text>
      </Pressable>
    )}
  </View>
);

// ============================================
// COMPOSANT — MealDayCard (FIX 4 — compact)
// ============================================
const MEAL_CARD_WIDTH = wp(160);
const MEAL_CARD_HEIGHT = wp(150);

const MealDayCard = ({ icon, label, meal, lang }) => {

  if (meal) {
    return (
      <Pressable delayPressIn={120}
        style={({ pressed }) => ({
          width: MEAL_CARD_WIDTH,
          transform: [{ scale: pressed ? 0.975 : 1 }],
        })}
      >
        <View style={{
          borderRadius: 16, padding: 1,
          backgroundColor: '#4A4F55', elevation: 8,
          shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25, shadowRadius: 6,
        }}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{ borderRadius: 15, padding: wp(11), minHeight: MEAL_CARD_HEIGHT }}
          >
            {/* Ligne émeraude */}
            <View style={{
              position: 'absolute', top: 0, left: 16, right: 16,
              height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
            }}/>

            {/* Header compact */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
              <Text style={{ fontSize: 14 }}>{icon}</Text>
              <Text style={{
                color: '#8892A0', fontSize: fp(9), fontWeight: '700',
                letterSpacing: 1, marginLeft: 4, textTransform: 'uppercase',
              }}>{label}</Text>
              <Text style={{ color: '#3A4050', fontSize: fp(9), marginLeft: 'auto' }}>{meal.time}</Text>
            </View>

            {/* Miniature SVG + infos */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: wp(36), height: wp(36), borderRadius: 14,
                backgroundColor: '#252A30', justifyContent: 'center', alignItems: 'center',
                marginRight: wp(10),
              }}>
                <Svg width={30} height={30} viewBox="0 0 36 36">
                  <Ellipse cx="18" cy="25" rx="14" ry="6" fill="none" stroke="#5A6070" strokeWidth={1.5}/>
                  <Path d="M4 25C4 21 10 17 18 17C26 17 32 21 32 25" fill="none" stroke="#5A6070" strokeWidth={1.5}/>
                  <Path d="M14 15C14.5 12 16 10 18 10C20 10 21.5 12 22 15" fill="none" stroke="#5A6070" strokeWidth={1} opacity={0.5}/>
                  <Path d="M16 12C16 10 17 8 18 7" fill="none" stroke="#5A6070" strokeWidth={0.8} opacity={0.4}/>
                  <Path d="M20 13C20.5 11 21 9 21 8" fill="none" stroke="#5A6070" strokeWidth={0.8} opacity={0.4}/>
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: '#EAEEF3', fontSize: fp(12), fontWeight: '700',
                }} numberOfLines={1}>{meal.name}</Text>
                <Text style={{
                  color: '#FF8C42', fontSize: fp(13), fontWeight: '700', marginTop: 2,
                }}>{meal.calories} kcal</Text>

                {/* Macros compacts */}
                <View style={{ flexDirection: 'row', marginTop: wp(6), gap: wp(8) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF6B6B', marginRight: 3 }}/>
                    <Text style={{ color: '#5A6070', fontSize: fp(7) }}>{meal.protein}g {lang === 'fr' ? 'Protéines' : 'Protein'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFD93D', marginRight: 3 }}/>
                    <Text style={{ color: '#5A6070', fontSize: fp(7) }}>{meal.carbs}g {lang === 'fr' ? 'Glucides' : 'Carbs'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#4DA6FF', marginRight: 3 }}/>
                    <Text style={{ color: '#5A6070', fontSize: fp(7) }}>{meal.fat}g {lang === 'fr' ? 'Lipides' : 'Fat'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bouton + Ajouter — plus visible */}
            <Pressable delayPressIn={120}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                marginTop: wp(8), paddingVertical: wp(5),
                borderRadius: 12,
                backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.06)',
                borderWidth: 1,
                borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(0,217,132,0.2)',
              })}
            >
              <Svg width={12} height={12} viewBox="0 0 12 12" style={{ marginRight: 4 }}>
                <Line x1="6" y1="2" x2="6" y2="10" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round"/>
                <Line x1="2" y1="6" x2="10" y2="6" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round"/>
              </Svg>
              <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '700' }}>
                {lang === 'fr' ? 'Ajouter' : 'Add'}
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  // CARD VIDE
  return (
    <Pressable delayPressIn={120}
      style={({ pressed }) => ({
        width: MEAL_CARD_WIDTH,
        transform: [{ scale: pressed ? 0.975 : 1 }],
      })}
    >
      <View style={{
        borderRadius: 16, padding: 1,
        backgroundColor: '#4A4F55', elevation: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25, shadowRadius: 6,
      }}>
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{
            borderRadius: 15, padding: wp(11),
            minHeight: MEAL_CARD_HEIGHT,
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          <View style={{
            position: 'absolute', top: 0, left: 16, right: 16,
            height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
          }}/>

          {/* Header */}
          <View style={{
            position: 'absolute', top: wp(11), left: wp(11),
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 14 }}>{icon}</Text>
            <Text style={{
              color: '#8892A0', fontSize: fp(9), fontWeight: '700',
              letterSpacing: 1, marginLeft: 4, textTransform: 'uppercase',
            }}>{label}</Text>
          </View>

          {/* Bouton + central avec glow émeraude */}
          <View style={{
            width: wp(38), height: wp(38), borderRadius: wp(19),
            borderWidth: 2, borderColor: 'rgba(0,217,132,0.25)',
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.04)',
            marginTop: wp(8),
          }}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Line x1="12" y1="6" x2="12" y2="18" stroke="#00D984" strokeWidth={2} strokeLinecap="round"/>
              <Line x1="6" y1="12" x2="18" y2="12" stroke="#00D984" strokeWidth={2} strokeLinecap="round"/>
            </Svg>
          </View>
          <Text style={{ color: '#5A6070', fontSize: fp(9), marginTop: wp(5) }}>
            {lang === 'fr' ? 'Ajouter' : 'Add'}
          </Text>
        </LinearGradient>
      </View>
    </Pressable>
  );
};

// ============================================
// COMPOSANT PRINCIPAL — RepasPage
// ============================================
const RepasPage = ({ onNavigate }) => {
  const [lang] = useState('fr');
  const [activeTab, setActiveTab] = useState('meals');

  const handleTabPress = (key) => {
    if (key === 'meals') return; // Déjà sur cette page
    if (onNavigate) {
      onNavigate(key);
    }
    setActiveTab(key);
  };

  // Glow diffus du bouton X au press
  const [isXPressed, setIsXPressed] = useState(false);
  const glowIntensity = useRef(new Animated.Value(0)).current;

  // Tooltip spotlight Xscan
  const [showScanTooltip, setShowScanTooltip] = useState(true);
  const [xButtonY, setXButtonY] = useState(0);

  // Animation 3 anneaux lumineux au press du bouton X
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;
  const [showRings, setShowRings] = useState(false);

  // === SHAKE ANIM pour icône "Pas ce plat ?" ===
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

  // === STATES SCAN ===
  const [scanScreen, setScanScreen] = useState('none');
  // 'none' = page Repas normale
  // 'camera' = caméra ouverte
  // 'analyzing' = écran analyse avec textes fun
  // 'result' = résultat du scan

  const [scanMode, setScanMode] = useState('none');
  // 'none', 'double_choice', 'single_match', 'ai_fallback'

  const [scanSuggestions, setScanSuggestions] = useState([]);
  // Les 2 suggestions de plats depuis la DB

  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  // Le plat choisi par l'utilisateur

  const [aiVisual, setAiVisual] = useState(null);
  // Les infos visuelles de l'IA (texture, volume, ingredients_seen)

  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternativeDishes, setAlternativeDishes] = useState([]);
  const [currentDishName, setCurrentDishName] = useState('');

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [analysisText, setAnalysisText] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [currentLoadingIndex, setCurrentLoadingIndex] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [recalculating, setRecalculating] = useState(false);

  // === STATES CORRECTION ===
  const [correctionMode, setCorrectionMode] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingQuantityIndex, setEditingQuantityIndex] = useState(null);
  const [tempQuantity, setTempQuantity] = useState('');

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

      // Stocker les infos visuelles IA
      setScanMode(result.mode);
      setScanSuggestions(result.suggestions || []);
      setAiVisual(result.ai_visual || null);

      // Récupérer les noms alternatifs depuis l'IA
      const aiSuggestionNames = (result.ai_visual?.original_suggestions || []).map(s => ({
        name_fr: s.name_fr,
        name_en: s.name_en,
        country: s.country,
        confidence: s.confidence,
      }));
      // Filtrer pour avoir des pays différents dans les alternatives
      const seenCountries = new Set();
      const uniqueCountryDishes = aiSuggestionNames.filter(dish => {
        const country = dish.country || 'unknown';
        if (seenCountries.has(country)) return false;
        seenCountries.add(country);
        return true;
      });
      setAlternativeDishes(uniqueCountryDishes.length > 0 ? uniqueCountryDishes : aiSuggestionNames);

      // TOUJOURS aller au résultat directement
      if (result.suggestions && result.suggestions.length > 0) {
        // Prendre la meilleure suggestion DB
        const best = result.suggestions[0];
        setCurrentDishName(best.name_fr || best.name_en || '');
        setScanResult(best);
      } else if (result.ai_fallback) {
        // Fallback IA
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

      setAnalysisProgress(100);
      setTimeout(() => setScanScreen('result'), 500);

    } catch (error) {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      console.error('Scan error:', error);
      alert(lang === 'fr'
        ? 'Erreur lors de l\'analyse : ' + error.message
        : 'Analysis error: ' + error.message);
      setScanScreen('none');
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

  const recalculateIngredient = async (ingredientIndex, newName) => {
    if (!scanResult || !scanResult.ingredients) return;
    setRecalculating(true);

    try {
      // Appeler l'Edge Function pour chercher les macros du nouvel ingrédient
      const response = await fetch(
        'https://yuhordnzfpcswztujovi.supabase.co/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0',
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

      // Copier les ingrédients
      const updatedIngredients = [...scanResult.ingredients];
      const oldIngredient = updatedIngredients[ingredientIndex];
      const quantity = oldIngredient.quantity_g || 100;

      if (results.length > 0) {
        // Ingrédient trouvé dans la DB → macros réelles
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
        // Pas trouvé → garder les mêmes macros mais changer le nom
        updatedIngredients[ingredientIndex] = {
          ...oldIngredient,
          name: newName,
          name_en: newName,
          uncertain: false,
          alternatives: [],
        };
      }

      // Recalculer les totaux
      const newTotals = updatedIngredients.reduce((acc, ing) => ({
        calories: acc.calories + (ing.calories || 0),
        protein_g: Math.round((acc.protein_g + (ing.protein_g || 0)) * 10) / 10,
        carbs_g: Math.round((acc.carbs_g + (ing.carbs_g || 0)) * 10) / 10,
        fat_g: Math.round((acc.fat_g + (ing.fat_g || 0)) * 10) / 10,
        fiber_g: Math.round((acc.fiber_g + (ing.fiber_g || 0)) * 10) / 10,
      }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });

      // Mettre à jour le résultat
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
      // En cas d'erreur, juste changer le nom
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
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0',
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
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0',
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

      // Vérifier la permission caméra
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          alert(lang === 'fr'
            ? 'Permission caméra requise pour scanner'
            : 'Camera permission required to scan');
          return;
        }
      }
      // Ouvrir la caméra
      setScanScreen('camera');
    });
  };
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SCREEN_HEIGHT = Dimensions.get('window').height;

  // Animation glow pulsant pour Xscan
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const calPercent = Math.round((MOCK_CALORIES.consumed / MOCK_CALORIES.goal) * 100);

  return (
    // FIX 1 — Même dégradé métallique que le dashboard
    <LinearGradient
      colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      style={{ flex: 1 }}
    >
      {/* TODO PRODUCTION: Remettre <SafeAreaView> avec <SafeAreaProvider> lors du build EAS final.
          Ce paddingTop fixe est un workaround temporaire pour Snack Expo uniquement.
          Lors de l'assemblage de toutes les pages pour la production :
          1. Ajouter <SafeAreaProvider> dans App.js racine
          2. Remplacer ce <View> par <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          3. Supprimer le paddingTop fixe */}
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 50 : 55 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: wp(120) }}
        >
          {/* ======== 1. HEADER — paddingTop aligné avec le dashboard ======== */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: wp(16),
            paddingTop: 0,
            paddingBottom: wp(10),
          }}>
            <Text style={{
              color: '#EAEEF3',
              fontSize: fp(20),
              fontWeight: '800',
              letterSpacing: 2,
            }}>
              MES REPAS
            </Text>

            {/* Badge date */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(0,217,132,0.08)',
              paddingHorizontal: wp(12),
              paddingVertical: wp(6),
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(0,217,132,0.15)',
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '600' }}>
                {lang === 'fr' ? "Aujourd'hui" : 'Today'}
              </Text>
              <Text style={{ color: '#8892A0', fontSize: fp(11), marginLeft: 6 }}>
                {new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>

          {/* ======== 2. RÉSUMÉ CALORIES DU JOUR (FIX 2A — compact) ======== */}
          <View style={{
            marginHorizontal: wp(16),
            marginTop: wp(12),
          }}>
            <View style={{
              borderRadius: 16, padding: 1,
              backgroundColor: '#4A4F55', elevation: 8,
              shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25, shadowRadius: 6,
            }}>
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{ borderRadius: 15 }}
              >
                <View style={{ padding: wp(16) }}>
                  {/* Ligne 1 : icône feu + calories + badge % */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                      <Svg width={20} height={20} viewBox="0 0 20 20" style={{ marginRight: 6, top: 2 }}>
                        <Path d="M10 1C10 1 4 7 4 12C4 15.3 6.7 18 10 18C13.3 18 16 15.3 16 12C16 7 10 1 10 1Z"
                              fill="#FF8C42" opacity={0.85}/>
                        <Path d="M10 6C10 6 7 9.5 7 12C7 13.7 8.3 15 10 15C11.7 15 13 13.7 13 12C13 9.5 10 6 10 6Z"
                              fill="#FFB74D" opacity={0.7}/>
                      </Svg>
                      <Text style={{ color: '#FF8C42', fontSize: fp(26), fontWeight: '900' }}>
                        {MOCK_CALORIES.consumed.toLocaleString('fr-FR')}
                      </Text>
                      <Text style={{ color: '#5A6070', fontSize: fp(14), marginLeft: 4 }}>
                        / {MOCK_CALORIES.goal.toLocaleString('fr-FR')} kcal
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'rgba(255,140,66,0.12)',
                      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                    }}>
                      <Text style={{ color: '#FF8C42', fontSize: fp(14), fontWeight: '800' }}>{calPercent}%</Text>
                    </View>
                  </View>

                  {/* Barre dégradé */}
                  <View style={{
                    height: 7, backgroundColor: 'rgba(255,140,66,0.08)',
                    borderRadius: 4, marginTop: wp(10), overflow: 'hidden',
                  }}>
                    <LinearGradient
                      colors={['#FF8C42', '#FFB74D']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={{ height: '100%', width: `${Math.min(calPercent, 100)}%`, borderRadius: 4 }}
                    />
                  </View>

                  {/* Macros dans mini cards */}
                  <View style={{ flexDirection: 'row', marginTop: wp(12), gap: wp(8) }}>
                    {[
                      { value: `${MOCK_CALORIES.protein}g`, color: '#FF6B6B', label: lang === 'fr' ? 'Protéines' : 'Protein' },
                      { value: `${MOCK_CALORIES.carbs}g`, color: '#FFD93D', label: lang === 'fr' ? 'Glucides' : 'Carbs' },
                      { value: `${MOCK_CALORIES.fat}g`, color: '#4DA6FF', label: lang === 'fr' ? 'Lipides' : 'Fat' },
                    ].map((m, i) => (
                      <View key={i} style={{
                        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: 10, paddingVertical: wp(8), alignItems: 'center',
                        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                      }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color, marginBottom: 4 }}/>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700' }}>{m.value}</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8), marginTop: 2 }}>{m.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* ======== 3. CARTE XSCAN — MetalCard NON cliquable ======== */}
          <View style={{ marginHorizontal: wp(16), marginTop: wp(20) }}>
            <View style={{
              borderRadius: 18, padding: 1.2,
              backgroundColor: '#4A4F55', elevation: 12,
              shadowColor: '#00D984', shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15, shadowRadius: 12,
            }}>
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{ borderRadius: 17, padding: wp(18) }}
              >
                {/* Ligne émeraude top */}
                <View style={{
                  position: 'absolute', top: 0, left: 20, right: 20,
                  height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
                }}/>

                {/* HEADER : XSCAN en haut à gauche */}
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: wp(20) }}>
                  <Text style={{
                    color: '#00D984', fontSize: fp(22), fontWeight: '900', letterSpacing: 1,
                  }}>X</Text>
                  <Text style={{
                    color: '#EAEEF3', fontSize: fp(22), fontWeight: '900', letterSpacing: 1,
                  }}>SCAN</Text>
                </View>

                {/* CENTRE : Bouton X avec profondeur */}
                <View style={{ alignItems: 'center', marginBottom: wp(16) }}>

                  {/* Conteneur relatif pour les anneaux animés */}
                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>

                    {/* Les 3 anneaux animés */}
                    {showRings && (
                      <>
                        <Animated.View style={{
                          position: 'absolute',
                          width: wp(82), height: wp(82), borderRadius: wp(41),
                          borderWidth: 2, borderColor: '#00D984',
                          opacity: ring1Anim.interpolate({
                            inputRange: [0, 0.3, 0.7, 1],
                            outputRange: [0, 0.9, 0.5, 0.1],
                          }),
                          transform: [{ scale: ring1Anim.interpolate({
                            inputRange: [0, 1], outputRange: [0.8, 1],
                          })}],
                        }}/>
                        <Animated.View style={{
                          position: 'absolute',
                          width: wp(96), height: wp(96), borderRadius: wp(48),
                          borderWidth: 1.5, borderColor: '#00D984',
                          opacity: ring2Anim.interpolate({
                            inputRange: [0, 0.3, 0.7, 1],
                            outputRange: [0, 0.8, 0.3, 0.05],
                          }),
                          transform: [{ scale: ring2Anim.interpolate({
                            inputRange: [0, 1], outputRange: [0.82, 1],
                          })}],
                        }}/>
                        <Animated.View style={{
                          position: 'absolute',
                          width: wp(115), height: wp(115), borderRadius: wp(57.5),
                          borderWidth: 1, borderColor: '#00D984',
                          opacity: ring3Anim.interpolate({
                            inputRange: [0, 0.3, 0.7, 1],
                            outputRange: [0, 0.6, 0.2, 0],
                          }),
                          transform: [{ scale: ring3Anim.interpolate({
                            inputRange: [0, 1], outputRange: [0.85, 1],
                          })}],
                        }}/>
                      </>
                    )}

                  {/* Anneau extérieur 1 — le plus grand, le plus subtil (bord du creux) */}
                  <View
                    onLayout={(event) => {
                      event.target.measureInWindow((x, y, width, height) => {
                        setXButtonY(y + height / 2 + wp(10));
                      });
                    }}
                    style={{
                    width: wp(120), height: wp(120), borderRadius: wp(60),
                    backgroundColor: '#22272E',
                    borderWidth: 1.5,
                    borderColor: '#3A3F46',
                    justifyContent: 'center', alignItems: 'center',
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.5,
                    shadowRadius: 6,
                    elevation: 2,
                  }}>

                    {/* Anneau intermédiaire — crée la marche du creux */}
                    <View style={{
                      width: wp(106), height: wp(106), borderRadius: wp(53),
                      backgroundColor: '#1A1F26',
                      borderWidth: 1,
                      borderColor: '#2E333A',
                      justifyContent: 'center', alignItems: 'center',
                    }}>

                      {/* Rainure circulaire — bordure émeraude supprimée */}
                      <View style={{
                        width: wp(96), height: wp(96), borderRadius: wp(48),
                        borderWidth: 0,
                        borderColor: 'transparent',
                        backgroundColor: 'transparent',
                        justifyContent: 'center', alignItems: 'center',
                      }}>

                        {/* Fond du creux — avec glow animé */}
                        <View style={{
                          width: wp(88), height: wp(88), borderRadius: wp(44),
                          backgroundColor: isXPressed ? '#162A1E' : '#14181E',
                          borderWidth: 1,
                          borderColor: isXPressed ? 'rgba(0,217,132,0.2)' : '#1E2228',
                          justifyContent: 'center', alignItems: 'center',
                          shadowColor: '#00D984',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: isXPressed ? 0.6 : 0,
                          shadowRadius: isXPressed ? 20 : 0,
                          elevation: isXPressed ? 8 : 0,
                        }}>

                          {/* LE BOUTON X CLIQUABLE — logé au fond du creux */}
                          <Pressable
                            onPressIn={() => {
                              setIsXPressed(true);
                              Animated.timing(glowIntensity, {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: false,
                              }).start();
                            }}
                            onPressOut={() => {
                              setIsXPressed(false);
                              Animated.timing(glowIntensity, {
                                toValue: 0,
                                duration: 400,
                                useNativeDriver: false,
                              }).start();
                            }}
                            onPress={activateScan}
                            style={({ pressed }) => ({
                              width: wp(72),
                              height: wp(72),
                              borderRadius: wp(36),
                              backgroundColor: pressed ? '#1E2530' : '#2A2F38',
                              borderWidth: 1.5,
                              borderColor: '#2A2F36',
                              justifyContent: 'center',
                              alignItems: 'center',
                              elevation: pressed ? 2 : 10,
                              transform: [{ scale: pressed ? 0.94 : 1 }],
                            })}
                          >
                            {/* X SVG — GRAND et visible */}
                            <Svg width={wp(40)} height={wp(40)} viewBox="0 0 40 40">
                              {/* Lignes du X */}
                              <Line x1="7" y1="7" x2="33" y2="33"
                                    stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/>
                              <Line x1="33" y1="7" x2="7" y2="33"
                                    stroke="#00D984" strokeWidth={3.5} strokeLinecap="round"/>
                              {/* Point central */}
                              <Circle cx="20" cy="20" r="3" fill="#00D984" opacity={0.3}/>
                              <Circle cx="20" cy="20" r="1.5" fill="#00D984" opacity={0.7}/>
                              {/* 4 petits cercles aux extrémités (trous) */}
                              <Circle cx="7" cy="7" r="3" fill="none"
                                      stroke="#00D984" strokeWidth={1.2} opacity={0.3}/>
                              <Circle cx="33" cy="7" r="3" fill="none"
                                      stroke="#00D984" strokeWidth={1.2} opacity={0.3}/>
                              <Circle cx="7" cy="33" r="3" fill="none"
                                      stroke="#00D984" strokeWidth={1.2} opacity={0.3}/>
                              <Circle cx="33" cy="33" r="3" fill="none"
                                      stroke="#00D984" strokeWidth={1.2} opacity={0.3}/>
                            </Svg>
                          </Pressable>

                        </View>
                      </View>
                    </View>
                  </View>

                  </View>{/* Fin conteneur relatif anneaux */}

                </View>

                {/* Texte sous le bouton */}
                <Text style={{
                  color: '#8892A0', fontSize: fp(13), textAlign: 'center',
                  marginBottom: wp(20),
                }}>
                  {lang === 'fr' ? 'Scanner votre repas' : 'Scan your meal'}
                </Text>

                {/* BAS : Charger Photo (gauche) + Scan Avancé IA (droite) */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  {/* Charger Photo — bas gauche */}
                  <Pressable
                    onPress={pickImageFromGallery}
                    delayPressIn={120}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.06)',
                      paddingHorizontal: wp(12),
                      paddingVertical: wp(8),
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: pressed ? 'rgba(0,217,132,0.35)' : 'rgba(0,217,132,0.15)',
                    })}
                  >
                    <Svg width={16} height={16} viewBox="0 0 16 16" style={{ marginRight: 6 }}>
                      <Rect x="1" y="3" width="14" height="10" rx="2" fill="none" stroke="#00D984" strokeWidth={1.2}/>
                      <Circle cx="8" cy="8.5" r="3" fill="none" stroke="#00D984" strokeWidth={1.2}/>
                      <Circle cx="8" cy="8.5" r="1" fill="#00D984" opacity={0.5}/>
                      <Rect x="5.5" y="2" width="5" height="2" rx="1" fill="none" stroke="#00D984" strokeWidth={0.8}/>
                    </Svg>
                    <Text style={{
                      color: '#00D984', fontSize: fp(11), fontWeight: '700',
                    }}>
                      {lang === 'fr' ? 'Charger Photo' : 'Load Photo'}
                    </Text>
                  </Pressable>

                  {/* Scan Avancé IA — bas droite */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(212,175,55,0.08)',
                    paddingHorizontal: wp(10),
                    paddingVertical: wp(6),
                    borderRadius: 10,
                    borderWidth: 0.5,
                    borderColor: 'rgba(212,175,55,0.2)',
                  }}>
                    <View style={{
                      width: 5, height: 5, borderRadius: 2.5,
                      backgroundColor: '#D4AF37', marginRight: 5,
                    }}/>
                    <Text style={{
                      color: '#D4AF37', fontSize: fp(9), fontWeight: '800', letterSpacing: 1,
                    }}>
                      {lang === 'fr' ? 'SCAN AVANCÉ IA' : 'AI ADVANCED SCAN'}
                    </Text>
                  </View>
                </View>

              </LinearGradient>
            </View>
          </View>

          {/* ======== DOTS SCANS — sous la carte Xscan ======== */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: wp(12),
            gap: wp(6),
          }}>
            {[0, 1, 2].map((i) => {
              const totalScans = 1; // 1=Lucky(Free), 2=Gold, 3=Platinum
              const isFilled = i < totalScans;

              return (
                <View key={i} style={{
                  width: wp(16),
                  height: wp(16),
                  borderRadius: wp(8),
                  backgroundColor: isFilled ? '#1A2E25' : '#1E2228',
                  borderWidth: 1.5,
                  borderColor: isFilled ? '#00D984' : '#3A3F46',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: isFilled ? '#00D984' : 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isFilled ? 0.4 : 0,
                  shadowRadius: 6,
                  elevation: isFilled ? 4 : 0,
                }}>
                  {isFilled ? (
                    <View style={{
                      width: wp(8), height: wp(8), borderRadius: wp(4),
                      backgroundColor: '#00D984',
                      shadowColor: '#00D984',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.6, shadowRadius: 3,
                    }}>
                      <View style={{
                        position: 'absolute', top: 1, left: 2,
                        width: 3, height: 2, borderRadius: 1.5,
                        backgroundColor: 'rgba(255,255,255,0.35)',
                      }}/>
                    </View>
                  ) : (
                    <View style={{
                      width: wp(8), height: wp(8), borderRadius: wp(4),
                      backgroundColor: '#15191F',
                      borderWidth: 0.5, borderColor: '#2A2F36',
                    }}/>
                  )}
                </View>
              );
            })}

            {/* Texte */}
            <Text style={{
              color: '#8892A0', fontSize: fp(12), fontWeight: '600', marginLeft: wp(8),
            }}>
              {lang === 'fr' ? '1 Scan Restant' : '1 Scan Remaining'}
            </Text>

            {/* Badge plan */}
            <View style={{
              backgroundColor: 'rgba(0,217,132,0.08)',
              paddingHorizontal: 8, paddingVertical: 2,
              borderRadius: 6, marginLeft: wp(6),
            }}>
              <Text style={{
                color: '#00D984', fontSize: fp(9), fontWeight: '800', letterSpacing: 1,
              }}>LUCKY</Text>
            </View>
          </View>

          {/* ======== AJOUTER MANUELLEMENT — centré sous les dots ======== */}
          <Pressable
            onPressIn={() => { /* TODO: ouvrir recherche manuelle DB */ }}
            delayPressIn={120}
            style={({ pressed }) => ({
              marginHorizontal: wp(40),
              marginTop: wp(14),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: wp(11),
              borderRadius: 14,
              backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderColor: pressed ? '#5A6070' : '#3A3F46',
            })}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16" style={{ marginRight: 8 }}>
              <Path d="M12 1.5L14.5 4L5 13.5L1.5 14.5L2.5 11L12 1.5Z"
                    fill="none" stroke="#8892A0" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"/>
              <Path d="M10 3.5L12.5 6" stroke="#8892A0" strokeWidth={1.2} strokeLinecap="round"/>
            </Svg>
            <Text style={{
              color: '#8892A0', fontSize: fp(13), fontWeight: '600',
            }}>
              {lang === 'fr' ? 'Ajouter Manuellement' : 'Add Manually'}
            </Text>
          </Pressable>

          {/* ======== 5. SECTION PLAT DU JOUR (FIX 3+4+7) ======== */}
          <View style={{ marginTop: wp(24) }}>
            <SectionTitle title={lang === 'fr' ? 'Plat du jour' : 'Meals today'} />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(10) }}
              snapToInterval={MEAL_CARD_WIDTH + wp(10)}
              decelerationRate="fast"
            >
              <MealDayCard
                icon="☀️"
                label={lang === 'fr' ? 'Petit-déjeuner' : 'Breakfast'}
                meal={{
                  name: 'Thé + Pain beurré',
                  calories: 320,
                  protein: 8, carbs: 45, fat: 12,
                  time: '7h30',
                }}
                lang={lang}
              />
              <MealDayCard
                icon="🌤️"
                label={lang === 'fr' ? 'Déjeuner' : 'Lunch'}
                meal={{
                  name: 'Poulet grillé + Riz',
                  calories: 450,
                  protein: 35, carbs: 42, fat: 15,
                  time: '12h30',
                }}
                lang={lang}
              />
              <MealDayCard
                icon="🌙"
                label={lang === 'fr' ? 'Dîner' : 'Dinner'}
                meal={null}
                lang={lang}
              />
              <MealDayCard
                icon="🍿"
                label={lang === 'fr' ? 'Snack' : 'Snack'}
                meal={null}
                lang={lang}
              />
            </ScrollView>
          </View>

          {/* ======== 6. SECTION RECETTES (FIX 3+5+7) ======== */}
          <View style={{ marginTop: wp(28) }}>
            <SectionTitle
              title={lang === 'fr' ? 'Recettes' : 'Recipes'}
              rightLabel={lang === 'fr' ? 'Voir tout ›' : 'See all ›'}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(10) }}
            >
              {MOCK_RECIPES.map((recipe, index) => (
                <Pressable key={index} delayPressIn={120}
                  style={({ pressed }) => ({
                    width: wp(130),
                    borderRadius: 14,
                    overflow: 'hidden',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    elevation: 6,
                  })}
                >
                  {/* Zone image — fond dégradé + emojis ingrédients */}
                  <LinearGradient
                    colors={[recipe.bgTop, recipe.bgBottom]}
                    style={{
                      width: '100%', height: wp(90),
                      justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    {/* Cercles décoratifs flous */}
                    <View style={{
                      position: 'absolute', top: wp(10), left: wp(8),
                      width: wp(30), height: wp(30), borderRadius: wp(15),
                      backgroundColor: 'rgba(255,255,255,0.06)',
                    }}/>
                    <View style={{
                      position: 'absolute', bottom: wp(12), right: wp(6),
                      width: wp(22), height: wp(22), borderRadius: wp(11),
                      backgroundColor: 'rgba(255,255,255,0.06)',
                    }}/>

                    {/* Badge calories en haut à droite */}
                    <View style={{
                      position: 'absolute', top: wp(6), right: wp(6),
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      paddingHorizontal: 6, paddingVertical: 2,
                      borderRadius: 6,
                    }}>
                      <Text style={{ color: '#FF8C42', fontSize: fp(8), fontWeight: '700' }}>
                        {recipe.cal} kcal
                      </Text>
                    </View>

                    {/* 3 emojis ingrédients au centre */}
                    <View style={{ flexDirection: 'row', gap: wp(6) }}>
                      {recipe.ingredients.map((emoji, ei) => (
                        <Text key={ei} style={{
                          fontSize: fp(28),
                          transform: [{ rotate: ei === 0 ? '-10deg' : ei === 2 ? '10deg' : '0deg' }],
                        }}>{emoji}</Text>
                      ))}
                    </View>
                  </LinearGradient>

                  {/* Infos en bas — fond sombre */}
                  <View style={{
                    backgroundColor: '#1E2530',
                    paddingHorizontal: wp(8), paddingVertical: wp(7),
                  }}>
                    <Text style={{
                      color: '#EAEEF3', fontSize: fp(11), fontWeight: '700',
                    }} numberOfLines={1}>{recipe.name}</Text>
                    <Text style={{
                      color: '#6A7080', fontSize: fp(9), marginTop: 2,
                    }}>{recipe.origin}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Séparateur */}
          <View style={{
            height: 1, backgroundColor: 'rgba(255,255,255,0.04)',
            marginHorizontal: wp(16), marginTop: wp(28),
          }}/>

          {/* ======== 7. SECTION PLATS FRÉQUENTS (FIX 3+6+7) ======== */}
          <View style={{ marginTop: wp(16), marginBottom: wp(16) }}>
            <SectionTitle title={lang === 'fr' ? 'Plats fréquents' : 'Frequent meals'} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(8) }}
            >
              {MOCK_FREQUENT.map((item, index) => (
                <Pressable key={index} delayPressIn={120}
                  style={({ pressed }) => ({
                    width: wp(75),
                    backgroundColor: pressed ? '#2A2F36' : '#1E2530',
                    borderRadius: 12,
                    borderWidth: 1, borderColor: '#2E333A',
                    padding: wp(8),
                    alignItems: 'center',
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <View style={{
                    width: wp(32), height: wp(32), borderRadius: wp(16),
                    backgroundColor: '#252A32',
                    justifyContent: 'center', alignItems: 'center',
                    marginBottom: wp(5),
                    borderWidth: 0.5, borderColor: '#3A3F46',
                  }}>
                    <Svg width={16} height={16} viewBox="0 0 20 20">
                      <Ellipse cx="10" cy="14" rx="8" ry="3.5" fill="none" stroke="#5A6070" strokeWidth={1}/>
                      <Path d="M2 14C2 12 5 9.5 10 9.5C15 9.5 18 12 18 14" fill="none" stroke="#5A6070" strokeWidth={1}/>
                    </Svg>
                  </View>
                  <Text style={{
                    color: '#EAEEF3', fontSize: fp(9), fontWeight: '600', textAlign: 'center',
                  }} numberOfLines={1}>{item.name}</Text>
                  <Text style={{ color: '#5A6070', fontSize: fp(8), marginTop: 1 }}>{item.cal} kcal</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* BOTTOM TAB BAR — positionnée en absolute en bas, HORS du ScrollView */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}>
          <BottomTabs activeTab={activeTab} onTabPress={handleTabPress} />
        </View>

        {/* ======== TOOLTIP SPOTLIGHT XSCAN ======== */}
        {showScanTooltip && xButtonY > 0 && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1000,
          }}>
            {/* Overlay SVG avec trou circulaire */}
            <Svg
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              style={{ position: 'absolute' }}
            >
              <Defs>
                <Mask id="spotlightMask">
                  <Rect x="0" y="0" width={SCREEN_WIDTH} height={SCREEN_HEIGHT} fill="white"/>
                  <Circle cx={SCREEN_WIDTH / 2} cy={xButtonY + wp(15)} r={wp(55)} fill="black"/>
                </Mask>
              </Defs>
              <Rect
                x="0" y="0"
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                fill="rgba(0,0,0,0.85)"
                mask="url(#spotlightMask)"
              />
              <Circle
                cx={SCREEN_WIDTH / 2}
                cy={xButtonY + wp(15)}
                r={wp(55)}
                fill="none"
                stroke="#00D984"
                strokeWidth={2}
                opacity={0.6}
              />
            </Svg>

            {/* Bulle de texte tooltip */}
            <View style={{
              position: 'absolute',
              top: xButtonY + wp(15) + wp(80),
              left: wp(24),
              right: wp(24),
              backgroundColor: '#1E2530',
              borderRadius: 16,
              padding: wp(18),
              borderWidth: 1,
              borderColor: 'rgba(0,217,132,0.2)',
              shadowColor: '#00D984',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 10,
            }}>
              {/* Flèche vers le haut */}
              <View style={{
                position: 'absolute',
                top: -8,
                alignSelf: 'center',
                width: 0, height: 0,
                borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 8,
                borderLeftColor: 'transparent', borderRightColor: 'transparent',
                borderBottomColor: '#1E2530',
              }}/>

              {/* Icône + Titre */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                <View style={{ marginRight: 8 }}>
                  <Svg width={22} height={22} viewBox="0 0 22 22">
                    <Circle cx="11" cy="11" r="10" fill="none" stroke="#00D984" strokeWidth={1.3} opacity={0.4}/>
                    <Circle cx="11" cy="11" r="6.5" fill="none" stroke="#00D984" strokeWidth={1.3} opacity={0.6}/>
                    <Circle cx="11" cy="11" r="3" fill="none" stroke="#00D984" strokeWidth={1.3} opacity={0.8}/>
                    <Circle cx="11" cy="11" r="1.2" fill="#00D984"/>
                    <Line x1="11" y1="11" x2="11" y2="1" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" opacity={0.7}/>
                  </Svg>
                </View>
                <Text style={{
                  color: '#00D984', fontSize: fp(15), fontWeight: '800',
                }}>
                  {lang === 'fr' ? 'Technologie Xscan' : 'Xscan Technology'}
                </Text>
              </View>

              {/* Description */}
              <Text style={{
                color: '#EAEEF3', fontSize: fp(13), lineHeight: fp(19),
                marginBottom: wp(10),
              }}>
                {lang === 'fr'
                  ? 'Testez la technologie de scan alimentaire la plus avancée du marché, de manière Fun.'
                  : 'Try the most advanced food scanning technology on the market, in a Fun way.'}
              </Text>

              {/* Badge scan gratuit */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,217,132,0.08)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
                alignSelf: 'flex-start',
                marginBottom: wp(12),
              }}>
                <Text style={{ fontSize: 14, marginRight: 6 }}>🎁</Text>
                <Text style={{
                  color: '#00D984', fontSize: fp(12), fontWeight: '700',
                }}>
                  {lang === 'fr'
                    ? '1 scan gratuit offert en bienvenue !'
                    : '1 free scan as a welcome gift!'}
                </Text>
              </View>

              {/* Bouton Compris */}
              <Pressable
                onPress={() => setShowScanTooltip(false)}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#00B572' : '#00D984',
                  borderRadius: 12,
                  paddingVertical: wp(10),
                  alignItems: 'center',
                })}
              >
                <Text style={{
                  color: '#0D1117', fontSize: fp(14), fontWeight: '800',
                }}>
                  {lang === 'fr' ? 'Compris !' : 'Got it!'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ÉCRAN CAMÉRA — plein écran */}
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
                    onPress={() => { setScanScreen('none'); setRecalculating(false); setCorrectionMode(false); setEditedIngredients([]); setSearchQuery(''); setSearchResults([]); setEditingQuantityIndex(null); setTempQuantity(''); }}
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

        {/* ÉCRAN ANALYSE */}
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

              {capturedPhoto && (
                <View style={{
                  width: wp(140), height: wp(140), borderRadius: 20,
                  overflow: 'hidden', marginBottom: wp(30),
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
                    backgroundColor: '#00D984',
                    top: '50%',
                    opacity: 0.6,
                  }}/>
                </View>
              )}

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

              <View style={{
                width: wp(220),
                height: 6,
                backgroundColor: 'rgba(0,217,132,0.1)',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <View style={{
                  height: '100%',
                  width: `${analysisProgress}%`,
                  backgroundColor: '#00D984',
                  borderRadius: 3,
                }}/>
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

        {/* ÉCRAN RÉSULTAT */}
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

              {/* Nom du plat — utilise currentDishName qui peut être modifié */}
              <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                  <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '700', marginRight: 8 }}>✅</Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(12) }}>
                    {lang === 'fr' ? 'Plat identifié' : 'Meal identified'}
                  </Text>
                </View>

                {/* Nom du plat */}
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
                  {/* Icône exclamation qui shake */}
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
                              {/* Badge "?" si incertain */}
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

                        {/* Alternatives si incertain — boutons cliquables */}
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
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: wp(16), marginBottom: wp(20),
              }}>
                <Text style={{ color: '#8892A0', fontSize: fp(12), marginRight: 8 }}>
                  {lang === 'fr' ? 'Créneau :' : 'Slot:'}
                </Text>
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: 'rgba(0,217,132,0.08)',
                  paddingHorizontal: 12, paddingVertical: 5,
                  borderRadius: 10,
                }}>
                  <Text style={{ fontSize: 14, marginRight: 5 }}>
                    {new Date().getHours() < 10 ? '☀️' : new Date().getHours() < 14 ? '🌤️' : new Date().getHours() < 21 ? '🌙' : '🍿'}
                  </Text>
                  <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600' }}>
                    {new Date().getHours() < 10
                      ? (lang === 'fr' ? 'Petit-déjeuner' : 'Breakfast')
                      : new Date().getHours() < 14
                        ? (lang === 'fr' ? 'Déjeuner' : 'Lunch')
                        : new Date().getHours() < 21
                          ? (lang === 'fr' ? 'Dîner' : 'Dinner')
                          : 'Snack'
                    }
                  </Text>
                </View>
              </View>

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
                  onPress={() => {
                    setScanScreen('none');
                    setRecalculating(false);
                    setScanResult(null);
                    setCapturedPhoto(null);
                    setShowAlternatives(false);
                    setAlternativeDishes([]);
                    setCurrentDishName('');
                    setScanMode('none');
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
                    alert(lang === 'fr' ? 'Repas ajouté ! +10 Lix' : 'Meal added! +10 Lix');
                  }}
                  style={({ pressed }) => ({
                    flex: 2,
                    paddingVertical: wp(14),
                    borderRadius: 14,
                    backgroundColor: pressed ? '#00B572' : '#00D984',
                    alignItems: 'center',
                  })}
                >
                  <Text style={{ color: '#0D1117', fontSize: fp(14), fontWeight: '800' }}>
                    ✓ {lang === 'fr' ? 'CONFIRMER' : 'CONFIRM'}
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

            {/* POPUP ALTERNATIVES — "Pas ce plat ?" */}
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

                              // Chercher si ce plat a des données complètes dans les suggestions
                              const matchingSuggestion = scanSuggestions.find(
                                s => s.name_fr === alt.name_fr || s.name_en === alt.name_en
                              );

                              if (matchingSuggestion && matchingSuggestion.ingredients && matchingSuggestion.ingredients.length > 0) {
                                // Ce plat a des données complètes → mettre à jour toute la fiche
                                setScanResult(matchingSuggestion);
                              }
                              // Sinon, garder les mêmes ingrédients (comportement actuel)

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
                            {/* Drapeau */}
                            <Text style={{ fontSize: 22, marginRight: wp(10) }}>{countryFlag}</Text>

                            {/* Nom + confiance */}
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

                          {/* Indicateur sélectionné */}
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
                      onPress={() => setShowAlternatives(false)}
                      style={({ pressed }) => ({
                        marginTop: wp(8),
                        paddingVertical: wp(12),
                        borderRadius: 14,
                        backgroundColor: pressed ? '#00B572' : '#00D984',
                        alignItems: 'center',
                      })}
                    >
                      <Text style={{ color: '#0D1117', fontSize: fp(14), fontWeight: '800' }}>
                        {lang === 'fr' ? 'Valider' : 'Confirm'}
                      </Text>
                    </Pressable>
                  </LinearGradient>
                </View>
              </View>
            )}

            {/* ÉCRAN CORRECTION */}
            {correctionMode && (
              <View style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 2500,
                backgroundColor: '#0D1117',
              }}>
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
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: wp(120) }}
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
                      backgroundColor: pressed ? '#00B572' : '#00D984',
                      alignItems: 'center',
                    })}
                  >
                    <Text style={{ color: '#0D1117', fontSize: fp(15), fontWeight: '800' }}>
                      ✓ {lang === 'fr' ? 'APPLIQUER LA CORRECTION' : 'APPLY CORRECTION'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

      </View>
    </LinearGradient>
  );
};

export default RepasPage;
