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
  KeyboardAvoidingView, Keyboard,
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

// TODO PRODUCTION: Remplacer TEST_USER_ID par l'ID du user authentifié via supabase.auth.getUser()
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

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
const MOCK_FREQUENT = [
  { name: 'Riz + Haricots', cal: 285 },
  { name: 'Ugali', cal: 310 },
  { name: 'Pain beurré', cal: 320 },
  { name: 'Banane plantain', cal: 230 },
  { name: 'Fumbwa', cal: 195 },
  { name: 'Sambaza frit', cal: 280 },
];

const MOCK_RECIPES = [
  {
    name: 'Thieboudienne',
    origin: '🇸🇳 Sénégal',
    cal: 520,
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&h=200&fit=crop',
  },
  {
    name: 'Pizza Margherita',
    origin: '🇮🇹 Italie',
    cal: 680,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=300&h=200&fit=crop',
  },
  {
    name: 'Couscous Royal',
    origin: '🇲🇦 Maroc',
    cal: 450,
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=300&h=200&fit=crop',
  },
  {
    name: 'Brochettes Viande',
    origin: '🇧🇮 Burundi',
    cal: 380,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop',
  },
  {
    name: 'Poulet Yassa',
    origin: '🇸🇳 Sénégal',
    cal: 320,
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=300&h=200&fit=crop',
  },
  {
    name: 'Salade Mixte',
    origin: '🌍 Mondial',
    cal: 180,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
  },
];

const MEAL_SLOTS = [
  { key: 'breakfast', icon: '☀️', label_fr: 'Petit-déj', label_en: 'Breakfast' },
  { key: 'lunch', icon: '🌤️', label_fr: 'Déjeuner', label_en: 'Lunch' },
  { key: 'dinner', icon: '🌙', label_fr: 'Dîner', label_en: 'Dinner' },
  { key: 'snack', icon: '🍿', label_fr: 'Snack', label_en: 'Snack' },
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
const MEAL_CARD_HEIGHT = wp(170);

const MealDayCard = ({ icon, label, meal, meals, lang, onAddMeal, slotKey }) => {

  if (meal) {
    const allMeals = meals || [];
    const hasMultiple = allMeals.length > 1;

    return (
      <View style={{ width: MEAL_CARD_WIDTH }}>
        <View style={{
          borderRadius: 16, padding: 1,
          backgroundColor: '#4A4F55', elevation: 8,
          shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25, shadowRadius: 6,
        }}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{ borderRadius: 15, overflow: 'hidden', height: MEAL_CARD_HEIGHT }}
          >
            {/* Ligne émeraude */}
            <View style={{
              position: 'absolute', top: 0, left: 16, right: 16,
              height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
            }}/>

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: wp(11), paddingHorizontal: wp(11) }}>
              <Text style={{ fontSize: 14 }}>{icon}</Text>
              <Text style={{
                color: '#8892A0', fontSize: fp(9), fontWeight: '700',
                letterSpacing: 1, marginLeft: 4, textTransform: 'uppercase',
              }}>{label}</Text>
              {hasMultiple && (
                <View style={{
                  marginLeft: 'auto',
                  backgroundColor: 'rgba(0,217,132,0.1)',
                  paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
                }}>
                  <Text style={{ color: '#00D984', fontSize: fp(8), fontWeight: '700' }}>{allMeals.length}</Text>
                </View>
              )}
              {!hasMultiple && (
                <Text style={{ color: '#3A4050', fontSize: fp(9), marginLeft: 'auto' }}>{meal.time}</Text>
              )}
            </View>

            {/* Zone scrollable si plusieurs repas */}
            <ScrollView
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: wp(90), paddingHorizontal: wp(11), flexShrink: 1 }}
              contentContainerStyle={{ paddingBottom: wp(4), paddingTop: wp(6) }}
            >
              {(hasMultiple ? allMeals : [allMeals[0] || {}]).map((m, idx) => {
                const mealData = hasMultiple ? {
                  name: m.food_name,
                  calories: Math.round(m.calories || 0),
                  protein: Math.round(m.protein_g || 0),
                  carbs: Math.round(m.carbs_g || 0),
                  fat: Math.round(m.fat_g || 0),
                } : meal;

                return (
                  <View key={idx} style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingBottom: hasMultiple && idx < allMeals.length - 1 ? wp(6) : 0,
                    marginBottom: hasMultiple && idx < allMeals.length - 1 ? wp(6) : 0,
                    borderBottomWidth: hasMultiple && idx < allMeals.length - 1 ? 0.5 : 0,
                    borderBottomColor: 'rgba(255,255,255,0.05)',
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        color: '#EAEEF3', fontSize: fp(11), fontWeight: '700',
                      }} numberOfLines={1}>{mealData.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Text style={{
                          color: '#FF8C42', fontSize: fp(11), fontWeight: '700',
                        }}>{mealData.calories} kcal</Text>
                        <View style={{ flexDirection: 'row', marginLeft: wp(6), gap: wp(4) }}>
                          <Text style={{ color: '#FF6B6B', fontSize: fp(8), fontWeight: '600' }}>{mealData.protein}P</Text>
                          <Text style={{ color: '#FFD93D', fontSize: fp(8), fontWeight: '600' }}>{mealData.carbs}G</Text>
                          <Text style={{ color: '#4DA6FF', fontSize: fp(8), fontWeight: '600' }}>{mealData.fat}L</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Indicateur scroll si multiple */}
            {hasMultiple && (
              <View style={{ alignItems: 'center', paddingBottom: wp(2) }}>
                <Svg width={16} height={8} viewBox="0 0 16 8">
                  <Path d="M4 2L8 6L12 2" fill="none" stroke="#5A6070" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>
            )}

            {/* Bouton Ajouter en bas */}
            <View style={{ paddingHorizontal: wp(11), paddingBottom: wp(8), paddingTop: wp(2), marginTop: 'auto' }}>
              <Pressable delayPressIn={120}
                onPress={() => { if (onAddMeal) onAddMeal(slotKey); }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  paddingVertical: wp(5),
                  borderRadius: 10,
                  backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.04)',
                  borderWidth: 1,
                  borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(0,217,132,0.15)',
                })}
              >
                <Svg width={10} height={10} viewBox="0 0 10 10" style={{ marginRight: 3 }}>
                  <Line x1="5" y1="1" x2="5" y2="9" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round"/>
                  <Line x1="1" y1="5" x2="9" y2="5" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round"/>
                </Svg>
                <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                  {lang === 'fr' ? 'Ajouter' : 'Add'}
                </Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </View>
    );
  }

  // CARD VIDE
  return (
    <Pressable delayPressIn={120}
      onPress={() => { if (onAddMeal) onAddMeal(slotKey); }}
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
            height: MEAL_CARD_HEIGHT,
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

          {/* Icône thématique SVG selon le créneau */}
          <View style={{
            width: wp(44), height: wp(44), borderRadius: wp(22),
            borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)',
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.03)',
            marginTop: wp(8),
          }}>
            {slotKey === 'breakfast' && (
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Rect x="4" y="12" width="9" height="7" rx="1.5" fill="none" stroke="#5A6070" strokeWidth={1.2}/>
                <Path d="M13 13.5C14.5 13.5 15.5 14.2 15.5 15.5C15.5 16.8 14.5 17.5 13 17.5" fill="none" stroke="#5A6070" strokeWidth={1}/>
                <Path d="M6 11C6 9.5 7 9 7 8" fill="none" stroke="#5A6070" strokeWidth={0.8} opacity={0.5}/>
                <Path d="M9 10.5C9 9 10 8.5 10 7.5" fill="none" stroke="#5A6070" strokeWidth={0.8} opacity={0.5}/>
                <Path d="M15 8C15 5 17 4 19 5C19.5 6 19 8 17 9" fill="none" stroke="#5A6070" strokeWidth={1} opacity={0.6}/>
              </Svg>
            )}
            {slotKey === 'lunch' && (
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Ellipse cx="12" cy="16" rx="9" ry="3.5" fill="none" stroke="#5A6070" strokeWidth={1.2}/>
                <Path d="M3 16C3 13.5 6.5 11 12 11C17.5 11 21 13.5 21 16" fill="none" stroke="#5A6070" strokeWidth={1.2}/>
                <Path d="M8 9C8 7.5 9 7 9 6" fill="none" stroke="#5A6070" strokeWidth={0.8} opacity={0.4}/>
                <Path d="M12 8C12 6.5 13 6 13 5" fill="none" stroke="#5A6070" strokeWidth={0.8} opacity={0.4}/>
                <Path d="M16 9C16 7.5 17 7 17 6" fill="none" stroke="#5A6070" strokeWidth={0.8} opacity={0.4}/>
              </Svg>
            )}
            {slotKey === 'dinner' && (
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Circle cx="12" cy="13" r="8" fill="none" stroke="#5A6070" strokeWidth={1.2}/>
                <Circle cx="12" cy="13" r="5" fill="none" stroke="#5A6070" strokeWidth={0.7} opacity={0.4}/>
                <Line x1="2" y1="7" x2="2" y2="19" stroke="#5A6070" strokeWidth={1} strokeLinecap="round"/>
                <Line x1="22" y1="7" x2="22" y2="19" stroke="#5A6070" strokeWidth={1} strokeLinecap="round"/>
              </Svg>
            )}
            {slotKey === 'snack' && (
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path d="M8 7L6 17H18L16 7" fill="none" stroke="#5A6070" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M5 17H19" stroke="#5A6070" strokeWidth={1.2} strokeLinecap="round"/>
                <Circle cx="10" cy="12" r="1" fill="#5A6070" opacity={0.5}/>
                <Circle cx="14" cy="11" r="1" fill="#5A6070" opacity={0.5}/>
                <Circle cx="12" cy="14" r="0.8" fill="#5A6070" opacity={0.4}/>
              </Svg>
            )}
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
  // === DONNÉES RÉELLES SUPABASE ===
  const [dailySummary, setDailySummary] = useState({
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    meals_count: 0,
  });
  const [userProfile, setUserProfile] = useState({
    daily_calorie_target: 2330,
  });
  const [todayMeals, setTodayMeals] = useState([]);
  const [frequentMeals, setFrequentMeals] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // === SÉLECTEUR CRÉNEAU REPAS ===
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalSlot, setAddModalSlot] = useState(null);

  // === SAISIE MANUELLE ===
  const [manualMode, setManualMode] = useState(false);
  const [manualTab, setManualTab] = useState('meals'); // 'meals' ou 'ingredients'
  const [manualPortionG, setManualPortionG] = useState(350); // portion par défaut
  const [editingPortion, setEditingPortion] = useState(false);
  const [tempPortion, setTempPortion] = useState('350');
  const [manualMealType, setManualMealType] = useState(null);
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [saveManualSuccess, setSaveManualSuccess] = useState(false);

  // Onglet Plats
  const [mealSearchQuery, setMealSearchQuery] = useState('');
  const [mealSearchResults, setMealSearchResults] = useState([]);
  const [isMealSearching, setIsMealSearching] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null); // le plat choisi depuis meals_master
  const [mealComponents, setMealComponents] = useState([]); // ses ingrédients

  // Onglet Ingrédients (verrouillé)
  const [manualIngredients, setManualIngredients] = useState([]);
  const [ingSearchQuery, setIngSearchQuery] = useState('');
  const [ingSearchResults, setIngSearchResults] = useState([]);
  const [isIngSearching, setIsIngSearching] = useState(false);
  const [manualEditingQtyIndex, setManualEditingQtyIndex] = useState(null);
  const [manualTempQty, setManualTempQty] = useState('');
  const manualScrollRef = useRef(null);

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

  // === CHARGER LES DONNÉES SUPABASE ===
  const loadDashboardData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Charger le profil utilisateur (calorie_target)
      const { data: profile } = await supabase
        .from('users_profile')
        .select('daily_calorie_target')
        .eq('user_id', TEST_USER_ID)
        .single();

      if (profile) {
        setUserProfile({ daily_calorie_target: profile.daily_calorie_target || 2330 });
      }

      // 2. Charger le résumé quotidien
      const today = new Date().toISOString().split('T')[0];
      const { data: summary } = await supabase
        .from('daily_summary')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('date', today)
        .single();

      if (summary) {
        setDailySummary({
          total_calories: summary.total_calories || 0,
          total_protein: Math.round((summary.total_protein || 0) * 10) / 10,
          total_carbs: Math.round((summary.total_carbs || 0) * 10) / 10,
          total_fat: Math.round((summary.total_fat || 0) * 10) / 10,
          meals_count: summary.meals_count || 0,
        });
      }

      // 3. Charger les repas d'aujourd'hui
      const { data: meals } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .eq('date', today)
        .order('meal_time', { ascending: true });

      if (meals) {
        setTodayMeals(meals);
      }

      // 4. Charger les plats fréquents (top 6 les plus mangés)
      const { data: frequent } = await supabase
        .from('meals')
        .select('food_name, calories')
        .eq('user_id', TEST_USER_ID)
        .order('created_at', { ascending: false })
        .limit(20);

      if (frequent && frequent.length > 0) {
        const countMap = {};
        frequent.forEach(m => {
          if (!countMap[m.food_name]) {
            countMap[m.food_name] = { name: m.food_name, cal: m.calories, count: 0 };
          }
          countMap[m.food_name].count++;
        });
        const sorted = Object.values(countMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);
        setFrequentMeals(sorted);
      }

    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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
  const [scanError, setScanError] = useState(null);

  // === RECETTES STATES ===
  const [showRecipes, setShowRecipes] = useState(false);
  const [recipesTab, setRecipesTab] = useState('general'); // 'general' | 'personalized'
  const [recipesData, setRecipesData] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesSearch, setRecipesSearch] = useState('');
  const [recipesRegion, setRecipesRegion] = useState('all');
  const [recipesCategory, setRecipesCategory] = useState('all');
  const [recipesPage, setRecipesPage] = useState(0);
  const [recipesHasMore, setRecipesHasMore] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  // Personnalisé
  const [userMood, setUserMood] = useState(null); // { mood_level, weather }
  const [moodRecipes, setMoodRecipes] = useState([]);
  const [moodMessage, setMoodMessage] = useState('');

  const RECIPE_REGIONS = [
    { key: 'all', label: '🌍 Tout', labelEn: '🌍 All' },
    { key: 'Afrique de l\'Ouest', label: '🇸🇳 Afrique Ouest', labelEn: '🇸🇳 West Africa' },
    { key: 'Afrique de l\'Est', label: '🇰🇪 Afrique Est', labelEn: '🇰🇪 East Africa' },
    { key: 'Afrique Centrale', label: '🇨🇩 Afrique Centrale', labelEn: '🇨🇩 Central Africa' },
    { key: 'Afrique du Nord', label: '🇲🇦 Afrique Nord', labelEn: '🇲🇦 North Africa' },
    { key: 'Afrique Australe', label: '🇿🇦 Afrique Australe', labelEn: '🇿🇦 Southern Africa' },
    { key: 'Europe', label: '🇫🇷 Europe', labelEn: '🇫🇷 Europe' },
    { key: 'Asie', label: '🇯🇵 Asie', labelEn: '🇯🇵 Asia' },
    { key: 'Amérique', label: '🇺🇸 Amérique', labelEn: '🇺🇸 Americas' },
    { key: 'Moyen-Orient', label: '🇱🇧 Moyen-Orient', labelEn: '🇱🇧 Middle East' },
  ];

  const RECIPE_CATEGORIES = [
    { key: 'all', label: '🍽️ Tout', labelEn: '🍽️ All' },
    { key: 'Plat', label: '🍲 Consistant', labelEn: '🍲 Main' },
    { key: 'Soupe', label: '🥣 Soupe', labelEn: '🥣 Soup' },
    { key: 'Salade', label: '🥗 Salade', labelEn: '🥗 Salad' },
    { key: 'Petit-déjeuner', label: '🌅 Petit-déj', labelEn: '🌅 Breakfast' },
    { key: 'Snack', label: '🍿 Snack', labelEn: '🍿 Snack' },
    { key: 'Dessert', label: '🍰 Dessert', labelEn: '🍰 Dessert' },
    { key: 'Accompagnement', label: '🥘 Accomp.', labelEn: '🥘 Side' },
    { key: 'Boisson', label: '🥤 Boisson', labelEn: '🥤 Drink' },
  ];

  // Matrice Mood × Météo → catégories recommandées
  const MOOD_MATRIX = {
    'happy_sunny': { cats: ['Salade', 'Snack', 'Boisson'], msg_fr: 'Belle journée, beau mood ! Des plats frais et colorés pour vous ☀️', msg_en: 'Great day, great mood! Fresh and colorful dishes for you ☀️' },
    'happy_cloudy': { cats: ['Plat', 'Salade'], msg_fr: 'Bonne humeur même sous les nuages ! Un plat savoureux ? ⛅', msg_en: 'Good mood even under clouds! A tasty dish? ⛅' },
    'happy_rainy': { cats: ['Plat', 'Soupe'], msg_fr: 'Joyeux malgré la pluie ! Un bon plat chaud pour célébrer 🌧️', msg_en: 'Happy despite the rain! A warm dish to celebrate 🌧️' },
    'neutral_sunny': { cats: ['Salade', 'Plat', 'Snack'], msg_fr: 'Journée tranquille, plats équilibrés et agréables 🌤️', msg_en: 'Chill day, balanced and pleasant dishes 🌤️' },
    'neutral_cloudy': { cats: ['Plat', 'Accompagnement'], msg_fr: 'Un classique pour une journée classique ⛅', msg_en: 'A classic for a classic day ⛅' },
    'neutral_rainy': { cats: ['Soupe', 'Plat'], msg_fr: 'Temps de pluie, temps de soupe ! 🌧️', msg_en: 'Rainy day, soup day! 🌧️' },
    'sad_sunny': { cats: ['Snack', 'Salade', 'Dessert'], msg_fr: 'Le soleil est là pour vous ! Des plats légers pour remonter le moral 🌞', msg_en: 'The sun is here for you! Light dishes to lift your spirits 🌞' },
    'sad_cloudy': { cats: ['Soupe', 'Plat'], msg_fr: 'Un peu gris ? Du réconfort dans l\'assiette 🍲', msg_en: 'Feeling gray? Comfort on the plate 🍲' },
    'sad_rainy': { cats: ['Soupe', 'Plat', 'Dessert'], msg_fr: 'Un peu gris dehors et dedans ? Du réconfort chaud pour vous ❤️', msg_en: 'Gray outside and inside? Warm comfort for you ❤️' },
    'stressed_sunny': { cats: ['Salade', 'Boisson'], msg_fr: 'On respire... Des plats légers pour apaiser le corps 🧘', msg_en: 'Let\'s breathe... Light dishes to soothe 🧘' },
    'stressed_cloudy': { cats: ['Soupe', 'Salade'], msg_fr: 'Déstressez avec un plat simple et apaisant 🍃', msg_en: 'De-stress with a simple soothing dish 🍃' },
    'stressed_rainy': { cats: ['Soupe', 'Boisson'], msg_fr: 'Pluie et stress ? Une soupe chaude, rien de mieux 🫖', msg_en: 'Rain and stress? A warm soup, nothing better 🫖' },
    'tired_sunny': { cats: ['Plat', 'Snack', 'Petit-déjeuner'], msg_fr: 'Besoin d\'un boost ? Protéines et énergie au menu ! ⚡', msg_en: 'Need a boost? Protein and energy on the menu! ⚡' },
    'tired_cloudy': { cats: ['Plat', 'Petit-déjeuner'], msg_fr: 'Rechargez les batteries avec un plat costaud 🔋', msg_en: 'Recharge with a hearty dish 🔋' },
    'tired_rainy': { cats: ['Soupe', 'Plat'], msg_fr: 'Fatigue + pluie = soupe chaude et protéines 💪', msg_en: 'Tired + rain = warm soup and protein 💪' },
  };

  const getCountryFlag = (country) => {
    const flags = {
      'Sénégal': '🇸🇳', 'Nigeria': '🇳🇬', 'Cameroun': '🇨🇲', 'Bénin': '🇧🇯',
      'Côte d\'Ivoire': '🇨🇮', 'Ghana': '🇬🇭', 'Mali': '🇲🇱', 'Burkina Faso': '🇧🇫',
      'Guinée': '🇬🇳', 'Togo': '🇹🇬', 'Niger': '🇳🇪', 'Gambie': '🇬🇲',
      'Sierra Leone': '🇸🇱', 'Liberia': '🇱🇷', 'Mauritanie': '🇲🇷',
      'Kenya': '🇰🇪', 'Tanzanie': '🇹🇿', 'Ouganda': '🇺🇬', 'Rwanda': '🇷🇼',
      'Burundi': '🇧🇮', 'Éthiopie': '🇪🇹', 'Somalie': '🇸🇴', 'Érythrée': '🇪🇷',
      'Soudan': '🇸🇩', 'Djibouti': '🇩🇯', 'Madagascar': '🇲🇬',
      'RDC': '🇨🇩', 'Congo': '🇨🇬', 'Gabon': '🇬🇦', 'Tchad': '🇹🇩',
      'Centrafrique': '🇨🇫', 'Guinée Équatoriale': '🇬🇶',
      'Maroc': '🇲🇦', 'Algérie': '🇩🇿', 'Tunisie': '🇹🇳', 'Égypte': '🇪🇬', 'Libye': '🇱🇾',
      'Afrique du Sud': '🇿🇦', 'Zimbabwe': '🇿🇼', 'Mozambique': '🇲🇿',
      'Namibie': '🇳🇦', 'Botswana': '🇧🇼', 'Zambie': '🇿🇲', 'Malawi': '🇲🇼',
      'Angola': '🇦🇴', 'Lesotho': '🇱🇸', 'Eswatini': '🇸🇿',
      'France': '🇫🇷', 'Italie': '🇮🇹', 'Espagne': '🇪🇸', 'Grèce': '🇬🇷',
      'Allemagne': '🇩🇪', 'Portugal': '🇵🇹', 'Royaume-Uni': '🇬🇧',
      'États-Unis': '🇺🇸', 'Mexique': '🇲🇽', 'Brésil': '🇧🇷', 'Argentine': '🇦🇷',
      'Colombie': '🇨🇴', 'Pérou': '🇵🇪', 'Jamaïque': '🇯🇲', 'Haïti': '🇭🇹',
      'Japon': '🇯🇵', 'Corée du Sud': '🇰🇷', 'Chine': '🇨🇳', 'Thaïlande': '🇹🇭',
      'Vietnam': '🇻🇳', 'Inde': '🇮🇳', 'Indonésie': '🇮🇩', 'Philippines': '🇵🇭',
      'Liban': '🇱🇧', 'Turquie': '🇹🇷', 'Iran': '🇮🇷', 'Irak': '🇮🇶',
      'Israël': '🇮🇱', 'Syrie': '🇸🇾', 'Yémen': '🇾🇪',
      'Panafricain': '🌍', 'International': '🌍',
    };
    return flags[country] || '🍽️';
  };

  // Charger les recettes depuis meals_master
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

  // Charger le mood du jour et les recettes personnalisées
  const loadMoodRecipes = async () => {
    try {
      // 1. Récupérer le dernier mood du jour
      const today = new Date().toISOString().split('T')[0];
      const { data: moodData } = await supabase
        .from('moods')
        .select('mood_level, weather')
        .eq('user_id', TEST_USER_ID)
        .gte('created_at', today + 'T00:00:00')
        .order('created_at', { ascending: false })
        .limit(1);

      let mood = moodData && moodData[0] ? moodData[0] : null;
      setUserMood(mood);

      if (!mood) {
        setMoodMessage(lang === 'fr' ? 'Enregistrez votre humeur sur le Dashboard pour des recommandations personnalisées !' : 'Record your mood on the Dashboard for personalized recommendations!');
        setMoodRecipes([]);
        return;
      }

      // 2. Mapper mood_level vers notre clé
      const moodMap = { 'happy': 'happy', 'neutral': 'neutral', 'sad': 'sad', 'stressed': 'stressed', 'tired': 'tired', 'joyeux': 'happy', 'neutre': 'neutral', 'triste': 'sad', 'stressé': 'stressed', 'fatigué': 'tired' };
      const weatherMap = { 'sunny': 'sunny', 'cloudy': 'cloudy', 'rainy': 'rainy', 'ensoleillé': 'sunny', 'nuageux': 'cloudy', 'pluvieux': 'rainy', 'sun': 'sunny', 'cloud': 'cloudy', 'rain': 'rainy' };

      const mKey = moodMap[(mood.mood_level || '').toLowerCase()] || 'neutral';
      const wKey = weatherMap[(mood.weather || '').toLowerCase()] || 'cloudy';
      const matrixKey = mKey + '_' + wKey;
      const matrix = MOOD_MATRIX[matrixKey] || MOOD_MATRIX['neutral_cloudy'];

      setMoodMessage(lang === 'fr' ? matrix.msg_fr : matrix.msg_en);

      // 3. Charger les recettes qui matchent les catégories recommandées
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

  // Ouvrir l'écran Recettes
  const openRecipes = () => {
    setShowRecipes(true);
    setRecipesTab('general');
    setRecipesSearch('');
    setRecipesRegion('all');
    setRecipesCategory('all');
    setRecipesPage(0);
    loadRecipes(0);
    loadMoodRecipes();
  };

  // === XSCAN AR STATES ===
  const [arPhase, setArPhase] = useState('idle');
  // 'idle' = pas actif
  // 'center' = en attente du tap central
  // 'navigating' = en train de naviguer vers un coin
  // 'tapping' = en train de taper sur un coin (3 taps)
  // 'complete' = 4 coins terminés
  const [arCenterPlanted, setArCenterPlanted] = useState(false);
  const [arCurrentCorner, setArCurrentCorner] = useState(0); // 0-3
  const [arCornerTaps, setArCornerTaps] = useState(0); // 0-3 taps sur le coin actuel
  const [arCornersDone, setArCornersDone] = useState([false, false, false, false]);
  const [arPhotos, setArPhotos] = useState([null, null, null, null]);
  const [arLastTapTime, setArLastTapTime] = useState(0);
  const centerStakeAnim = useRef(new Animated.Value(0)).current; // 0=pas planté, 1=planté
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
  const [arCornerPulse] = useState(new Animated.Value(0));

  // Positions des 4 coins (en % de l'écran caméra)
  const AR_CORNERS = [
    { key: 'topLeft', label: '↖', x: 0.18, y: 0.25, emoji: '🏔️' },
    { key: 'topRight', label: '↗', x: 0.82, y: 0.25, emoji: '🏔️' },
    { key: 'bottomLeft', label: '↙', x: 0.18, y: 0.75, emoji: '🏔️' },
    { key: 'bottomRight', label: '↘', x: 0.82, y: 0.75, emoji: '🏔️' },
  ];

  // Pulse animation pour le coin actif
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

  // Fonction reset AR
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

  // Fonction planter le pieu central
  const plantCenterStake = () => {
    if (arPhase !== 'center') return;
    setArCenterPlanted(true);
    Animated.spring(centerStakeAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start(() => {
      // Après l'animation, passer à la navigation
      setArPhase('navigating');
      setArCurrentCorner(0);
    });
  };

  // Fonction taper sur un coin (3 taps nécessaires)
  const tapCornerStake = async () => {
    const now = Date.now();
    if (now - arLastTapTime < 500) return; // Intervalle minimum 500ms
    setArLastTapTime(now);

    const newTapCount = arCornerTaps + 1;
    setArCornerTaps(newTapCount);

    // Animation du pieu qui s'enfonce progressivement
    Animated.spring(cornerStakeAnims[arCurrentCorner], {
      toValue: newTapCount / 3,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();

    // 1er tap = capture photo silencieuse
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

    // 3ème tap = coin terminé
    if (newTapCount >= 3) {
      const updatedDone = [...arCornersDone];
      updatedDone[arCurrentCorner] = true;
      setArCornersDone(updatedDone);

      // Animation corde complète
      Animated.timing(ropeProgressAnims[arCurrentCorner], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      // Vérifier si tous les coins sont faits
      const allDone = updatedDone.every(d => d);
      if (allDone) {
        setTimeout(() => setArPhase('complete'), 600);
      } else {
        // Passer au prochain coin non fait
        setTimeout(() => {
          const nextCorner = updatedDone.findIndex(d => !d);
          setArCurrentCorner(nextCorner);
          setArCornerTaps(0);
          setArPhase('navigating');
        }, 500);
      }
    }
  };

  // Lancer le mode AR (appelé depuis activateScan)
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

  const [alternativeDishes, setAlternativeDishes] = useState([]);
  const [currentDishName, setCurrentDishName] = useState('');

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const correctionScrollRef = useRef(null);
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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

      // Détecter si l'image n'est pas de la nourriture
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
        // Ce n'est probablement pas de la nourriture
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
      // Calculer les totaux finaux
      const totals = scanResult.totals || {
        calories: scanResult.calories || 0,
        protein_g: scanResult.protein_g || 0,
        carbs_g: scanResult.carbs_g || 0,
        fat_g: scanResult.fat_g || 0,
        fiber_g: scanResult.fiber_g || 0,
      };

      // Poids total
      const totalWeight = (scanResult.ingredients || []).reduce(
        (sum, ing) => sum + (ing.quantity_g || 0), 0
      );

      // Déterminer la source
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

      // Attendre 1.5s pour montrer le succès, puis fermer
      setTimeout(() => {
        loadDashboardData();
        // Reset tous les states
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
        setIsSaving(false);
        setSaveSuccess(false);
      }, 1500);

    } catch (err) {
      console.error('Erreur réseau:', err);
      alert('Erreur réseau. Vérifie ta connexion.');
      setIsSaving(false);
    }
  };

  // === FONCTIONS SAISIE MANUELLE ===

  const openManualEntry = () => {
    setManualMode(true);
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
  };

  const closeManualEntry = () => {
    setManualMode(false);
    setSelectedMeal(null);
    setMealComponents([]);
    setManualIngredients([]);
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
    // Charger les composants (ingrédients du plat)
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
        'https://yuhordnzfpcswztujovi.supabase.co/functions/v1/scan-meal',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0',
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
      return; // rien à sauvegarder
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
        loadDashboardData();
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
      // Ouvrir le mode AR scan
      startArScan();
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

  const calPercent = userProfile.daily_calorie_target > 0
    ? Math.round((dailySummary.total_calories / userProfile.daily_calorie_target) * 100)
    : 0;

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
                        {dailySummary.total_calories.toLocaleString('fr-FR')}
                      </Text>
                      <Text style={{ color: '#5A6070', fontSize: fp(14), marginLeft: 4 }}>
                        / {userProfile.daily_calorie_target.toLocaleString('fr-FR')} kcal
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
                      { value: `${dailySummary.total_protein}g`, color: '#FF6B6B', label: lang === 'fr' ? 'Protéines' : 'Protein' },
                      { value: `${dailySummary.total_carbs}g`, color: '#FFD93D', label: lang === 'fr' ? 'Glucides' : 'Carbs' },
                      { value: `${dailySummary.total_fat}g`, color: '#4DA6FF', label: lang === 'fr' ? 'Lipides' : 'Fat' },
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
            onPress={openManualEntry}
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
              {[
                { key: 'breakfast', icon: '☀️', label: lang === 'fr' ? 'Petit-déjeuner' : 'Breakfast' },
                { key: 'lunch', icon: '🌤️', label: lang === 'fr' ? 'Déjeuner' : 'Lunch' },
                { key: 'dinner', icon: '🌙', label: lang === 'fr' ? 'Dîner' : 'Dinner' },
                { key: 'snack', icon: '🍿', label: lang === 'fr' ? 'Snack' : 'Snack' },
              ].map((slot) => {
                const slotMeals = todayMeals.filter(m => m.meal_type === slot.key);
                const firstMeal = slotMeals.length > 0 ? slotMeals[0] : null;
                return (
                  <MealDayCard
                    key={slot.key}
                    slotKey={slot.key}
                    icon={slot.icon}
                    label={slot.label}
                    meals={slotMeals}
                    meal={firstMeal ? {
                      name: firstMeal.food_name,
                      calories: Math.round(firstMeal.calories),
                      protein: Math.round(firstMeal.protein_g || 0),
                      carbs: Math.round(firstMeal.carbs_g || 0),
                      fat: Math.round(firstMeal.fat_g || 0),
                      time: new Date(firstMeal.meal_time).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
                    } : null}
                    lang={lang}
                    onAddMeal={(slotKey) => {
                      setAddModalSlot(slotKey);
                      setShowAddModal(true);
                    }}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* ======== 6. SECTION RECETTES (FIX 3+5+7) ======== */}
          <View style={{ marginTop: wp(20) }}>
            <SectionTitle
              title={lang === 'fr' ? 'Recettes' : 'Recipes'}
              rightLabel={lang === 'fr' ? 'Voir tout ›' : 'See all ›'}
              rightAction={openRecipes}
            />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(10) }}
            >
              {MOCK_RECIPES.map((recipe, index) => (
                <Pressable key={index} delayPressIn={120}
                  style={({ pressed }) => ({
                    width: wp(140),
                    borderRadius: 16,
                    overflow: 'hidden',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    backgroundColor: '#1E2530',
                  })}
                >
                  {/* Zone image — photo réelle */}
                  <View style={{
                    width: '100%', height: wp(95),
                    backgroundColor: '#1A1D22',
                  }}>
                    <Image
                      source={{ uri: recipe.image }}
                      style={{
                        width: '100%', height: '100%',
                        resizeMode: 'cover',
                      }}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.4)']}
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '40%',
                      }}
                    />
                    <View style={{
                      position: 'absolute', top: wp(6), right: wp(6),
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      paddingHorizontal: 6, paddingVertical: 2,
                      borderRadius: 6,
                    }}>
                      <Text style={{ color: '#FF8C42', fontSize: fp(8), fontWeight: '700' }}>
                        {recipe.cal} kcal
                      </Text>
                    </View>
                  </View>

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
              {(frequentMeals.length > 0 ? frequentMeals : MOCK_FREQUENT).map((item, index) => (
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
                    {index % 4 === 0 && (
                      <Svg width={16} height={16} viewBox="0 0 20 20">
                        <Ellipse cx="10" cy="14" rx="8" ry="3.5" fill="none" stroke="#FF8C42" strokeWidth={1}/>
                        <Path d="M2 14C2 12 5 9.5 10 9.5C15 9.5 18 12 18 14" fill="none" stroke="#FF8C42" strokeWidth={1}/>
                        <Path d="M7 12C7 10.5 8 10 8 9" fill="none" stroke="#FF8C42" strokeWidth={0.6} opacity={0.5}/>
                        <Path d="M13 11.5C13 10 14 9.5 14 8.5" fill="none" stroke="#FF8C42" strokeWidth={0.6} opacity={0.5}/>
                      </Svg>
                    )}
                    {index % 4 === 1 && (
                      <Svg width={16} height={16} viewBox="0 0 20 20">
                        <Rect x="4" y="8" width="8" height="6" rx="1" fill="none" stroke="#00D984" strokeWidth={1}/>
                        <Path d="M12 9C13.5 9 14.5 9.5 14.5 10.5C14.5 11.5 13.5 12 12 12" fill="none" stroke="#00D984" strokeWidth={0.8}/>
                        <Path d="M6 7C6 5.5 7 5 7 4" fill="none" stroke="#00D984" strokeWidth={0.6} opacity={0.5}/>
                        <Path d="M9 6.5C9 5 10 4.5 10 3.5" fill="none" stroke="#00D984" strokeWidth={0.6} opacity={0.5}/>
                      </Svg>
                    )}
                    {index % 4 === 2 && (
                      <Svg width={16} height={16} viewBox="0 0 20 20">
                        <Circle cx="10" cy="11" r="7" fill="none" stroke="#4DA6FF" strokeWidth={1}/>
                        <Circle cx="10" cy="11" r="4.5" fill="none" stroke="#4DA6FF" strokeWidth={0.6} opacity={0.4}/>
                        <Line x1="2" y1="6" x2="2" y2="16" stroke="#4DA6FF" strokeWidth={0.8} strokeLinecap="round"/>
                        <Line x1="18" y1="6" x2="18" y2="16" stroke="#4DA6FF" strokeWidth={0.8} strokeLinecap="round"/>
                      </Svg>
                    )}
                    {index % 4 === 3 && (
                      <Svg width={16} height={16} viewBox="0 0 20 20">
                        <Path d="M6 5L4 15H16L14 5" fill="none" stroke="#D4AF37" strokeWidth={1} strokeLinecap="round"/>
                        <Path d="M3 15H17" stroke="#D4AF37" strokeWidth={1} strokeLinecap="round"/>
                        <Circle cx="8" cy="10" r="1" fill="#D4AF37" opacity={0.5}/>
                        <Circle cx="12" cy="9" r="0.8" fill="#D4AF37" opacity={0.4}/>
                      </Svg>
                    )}
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

        {/* ÉCRAN SAISIE MANUELLE */}
        {manualMode && (
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

                        {/* Nom + Pays */}
                        <Text style={{ color: '#EAEEF3', fontSize: fp(20), fontWeight: '900', marginBottom: wp(4) }}>
                          {selectedMeal.name}
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(11), marginBottom: wp(12) }}>
                          {selectedMeal.country_origin} • {selectedMeal.category}
                        </Text>

                        {/* Totaux macros — MetalCard style */}
                        <View style={{
                          borderRadius: 16, padding: 1, backgroundColor: '#4A4F55', marginBottom: wp(16),
                        }}>
                          <LinearGradient
                            colors={['#3A3F46', '#252A30', '#1A1D22']}
                            style={{ borderRadius: 15, padding: wp(14), alignItems: 'center' }}
                          >
                            <Text style={{ color: '#FF8C42', fontSize: fp(28), fontWeight: '900' }}>
                              {getMealMacros().calories} kcal
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: wp(8), gap: wp(16) }}>
                              <View style={{ alignItems: 'center' }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', marginBottom: 2 }} />
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
                          </LinearGradient>
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
                      backgroundColor: saveManualSuccess ? '#00D984' : isSavingManual ? 'rgba(0,217,132,0.5)' : pressed ? '#00B572' : '#00D984',
                      alignItems: 'center',
                      opacity: isSavingManual ? 0.7 : 1,
                    })}
                  >
                    <Text style={{ color: '#0D1117', fontSize: fp(15), fontWeight: '800' }}>
                      {saveManualSuccess ? '✓ SAUVEGARDÉ ! +3 Lix' : isSavingManual ? '⏳ SAUVEGARDE...' : '✓ CONFIRMER LE REPAS'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        )}

        {/* ÉCRAN RECETTES — plein écran */}
        {showRecipes && !selectedRecipe && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1400,
            backgroundColor: '#0D1117',
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: Platform.OS === 'android' ? 50 : 60,
              paddingHorizontal: wp(16), paddingBottom: wp(10),
              borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)',
            }}>
              <Pressable onPress={() => setShowRecipes(false)}>
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
                <Text style={{ fontSize: 16, marginBottom: 2 }}>🧠</Text>
                <Text style={{
                  color: recipesTab === 'personalized' ? '#D4AF37' : '#8892A0',
                  fontSize: fp(11), fontWeight: recipesTab === 'personalized' ? '800' : '600',
                }}>{lang === 'fr' ? 'Personnalisé' : 'Personalized'}</Text>
                <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '600', marginTop: 1 }}>
                  {lang === 'fr' ? 'Mood + Météo' : 'Mood + Weather'}
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

                {/* Chips Régions — scroll horizontal */}
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

                {/* Chips Catégories — scroll horizontal */}
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
                <View style={{
                  flexDirection: 'row', flexWrap: 'wrap',
                  paddingHorizontal: wp(12),
                  justifyContent: 'space-between',
                }}>
                  {recipesData.map((recipe, index) => (
                    <Pressable
                      key={recipe.id}
                      onPress={() => setSelectedRecipe(recipe)}
                      style={({ pressed }) => ({
                        width: '48%',
                        marginBottom: wp(8),
                        borderRadius: 14, overflow: 'hidden',
                        backgroundColor: '#1E2530',
                        borderWidth: 1, borderColor: pressed ? 'rgba(0,217,132,0.2)' : 'rgba(255,255,255,0.04)',
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      })}
                    >
                      {/* Zone image placeholder — gradient + emoji drapeau */}
                      <View style={{
                        height: wp(50), backgroundColor: '#151B23',
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        <LinearGradient
                          colors={['rgba(0,217,132,0.06)', 'rgba(0,217,132,0.02)', 'transparent']}
                          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        />
                        <Text style={{ fontSize: 28 }}>{getCountryFlag(recipe.country_origin)}</Text>
                        {/* Badge calories */}
                        <View style={{
                          position: 'absolute', top: wp(6), right: wp(6),
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
                        }}>
                          <Text style={{ color: '#FF8C42', fontSize: fp(8), fontWeight: '700' }}>
                            {recipe.kcal_per_100g} kcal
                          </Text>
                        </View>
                      </View>

                      {/* Infos */}
                      <View style={{ padding: wp(8) }}>
                        <Text style={{
                          color: '#EAEEF3', fontSize: fp(11), fontWeight: '700',
                        }} numberOfLines={1}>{recipe.name}</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(8), marginTop: 2 }} numberOfLines={1}>
                          {recipe.country_origin} • {recipe.region}
                        </Text>
                        {/* Mini macros */}
                        <View style={{ flexDirection: 'row', marginTop: wp(4), gap: wp(6) }}>
                          <Text style={{ color: '#FF6B6B', fontSize: fp(7), fontWeight: '600' }}>{recipe.protein_per_100g}P</Text>
                          <Text style={{ color: '#FFD93D', fontSize: fp(7), fontWeight: '600' }}>{recipe.carbs_per_100g}G</Text>
                          <Text style={{ color: '#4DA6FF', fontSize: fp(7), fontWeight: '600' }}>{recipe.fat_per_100g}L</Text>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>

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
              >
                {/* Carte Mood + Météo du jour */}
                <View style={{
                  marginHorizontal: wp(16), marginTop: wp(14),
                  borderRadius: 16, padding: 1, backgroundColor: '#4A4F55',
                }}>
                  <LinearGradient
                    colors={['#3A3F46', '#252A30', '#1A1D22']}
                    style={{ borderRadius: 15, padding: wp(16) }}
                  >
                    <View style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 1, backgroundColor: 'rgba(212,175,55,0.10)' }} />

                    {userMood ? (
                      <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                          <Text style={{ fontSize: 22, marginRight: wp(8) }}>
                            {userMood.mood_level === 'happy' || userMood.mood_level === 'joyeux' ? '😊' : userMood.mood_level === 'sad' || userMood.mood_level === 'triste' ? '😢' : userMood.mood_level === 'stressed' || userMood.mood_level === 'stressé' ? '😠' : userMood.mood_level === 'tired' || userMood.mood_level === 'fatigué' ? '😴' : '😐'}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '700' }}>
                              {userMood.mood_level}
                            </Text>
                            <Text style={{ color: '#5A6070', fontSize: fp(10) }}>
                              {userMood.weather === 'sunny' || userMood.weather === 'ensoleillé' ? '☀️ Ensoleillé' : userMood.weather === 'rainy' || userMood.weather === 'pluvieux' ? '🌧️ Pluvieux' : '⛅ Nuageux'}
                            </Text>
                          </View>
                          <View style={{
                            backgroundColor: 'rgba(212,175,55,0.08)',
                            paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
                          }}>
                            <Text style={{ color: '#D4AF37', fontSize: fp(8), fontWeight: '700' }}>IA</Text>
                          </View>
                        </View>
                        <Text style={{ color: '#D4AF37', fontSize: fp(12), fontStyle: 'italic', lineHeight: fp(18) }}>
                          "{moodMessage}"
                        </Text>
                      </>
                    ) : (
                      <View style={{ alignItems: 'center', paddingVertical: wp(10) }}>
                        <Text style={{ fontSize: 30, marginBottom: wp(8) }}>🎭</Text>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700', textAlign: 'center', marginBottom: wp(4) }}>
                          {lang === 'fr' ? 'Pas encore de mood aujourd\'hui' : 'No mood recorded today'}
                        </Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(10), textAlign: 'center' }}>
                          {moodMessage}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </View>

                {/* Section "Pour votre humeur" — scroll horizontal */}
                {moodRecipes.length > 0 && (
                  <View style={{ marginTop: wp(20) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(16), marginBottom: wp(10) }}>
                      <View style={{ width: 3, height: 16, borderRadius: 1.5, backgroundColor: '#D4AF37', marginRight: 8 }} />
                      <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '800', letterSpacing: 1.5 }}>
                        {lang === 'fr' ? 'POUR VOTRE HUMEUR' : 'FOR YOUR MOOD'}
                      </Text>
                    </View>
                    <ScrollView
                      horizontal showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(10) }}
                    >
                      {moodRecipes.slice(0, 10).map((recipe) => (
                        <Pressable key={recipe.id} onPress={() => setSelectedRecipe(recipe)}
                          style={({ pressed }) => ({
                            width: wp(130), borderRadius: 14, overflow: 'hidden',
                            backgroundColor: '#1E2530',
                            borderWidth: 1, borderColor: pressed ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.04)',
                            transform: [{ scale: pressed ? 0.96 : 1 }],
                          })}
                        >
                          <View style={{
                            height: wp(65), backgroundColor: '#151B23',
                            justifyContent: 'center', alignItems: 'center',
                          }}>
                            <LinearGradient
                              colors={['rgba(212,175,55,0.08)', 'rgba(212,175,55,0.02)', 'transparent']}
                              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                            />
                            <Text style={{ fontSize: 24 }}>{getCountryFlag(recipe.country_origin)}</Text>
                            <View style={{
                              position: 'absolute', top: wp(4), right: wp(4),
                              backgroundColor: 'rgba(0,0,0,0.6)',
                              paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5,
                            }}>
                              <Text style={{ color: '#FF8C42', fontSize: fp(7), fontWeight: '700' }}>{recipe.kcal_per_100g} kcal</Text>
                            </View>
                          </View>
                          <View style={{ padding: wp(7) }}>
                            <Text style={{ color: '#EAEEF3', fontSize: fp(10), fontWeight: '700' }} numberOfLines={1}>{recipe.name}</Text>
                            <Text style={{ color: '#5A6070', fontSize: fp(7), marginTop: 1 }} numberOfLines={1}>{recipe.country_origin}</Text>
                          </View>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Filtres région + catégorie pour affiner */}
                <View style={{ marginTop: wp(20), paddingHorizontal: wp(16) }}>
                  <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '700', letterSpacing: 1.5, marginBottom: wp(8) }}>
                    {lang === 'fr' ? 'AFFINER PAR RÉGION' : 'FILTER BY REGION'}
                  </Text>
                </View>
                <ScrollView
                  horizontal showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(6), paddingBottom: wp(12) }}
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
                          paddingHorizontal: wp(10), paddingVertical: wp(7), borderRadius: 10,
                          backgroundColor: active ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                          borderWidth: 1, borderColor: active ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
                        }}>
                          <Text style={{ color: active ? '#D4AF37' : '#8892A0', fontSize: fp(10), fontWeight: active ? '700' : '500' }}>
                            {lang === 'fr' ? r.label : r.labelEn}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Grille filtrée */}
                <View style={{
                  flexDirection: 'row', flexWrap: 'wrap',
                  paddingHorizontal: wp(12),
                  justifyContent: 'space-between',
                }}>
                  {(recipesRegion !== 'all' ? recipesData : moodRecipes).map((recipe, index) => (
                    <Pressable
                      key={recipe.id + '-p-' + index}
                      onPress={() => setSelectedRecipe(recipe)}
                      style={({ pressed }) => ({
                        width: '48%',
                        marginBottom: wp(8),
                        borderRadius: 14, overflow: 'hidden',
                        backgroundColor: '#1E2530',
                        borderWidth: 1, borderColor: pressed ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      })}
                    >
                      <View style={{
                        height: wp(50), backgroundColor: '#151B23',
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                        <Text style={{ fontSize: 24 }}>{getCountryFlag(recipe.country_origin)}</Text>
                        <View style={{
                          position: 'absolute', top: wp(4), right: wp(4),
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5,
                        }}>
                          <Text style={{ color: '#FF8C42', fontSize: fp(7), fontWeight: '700' }}>{recipe.kcal_per_100g} kcal</Text>
                        </View>
                      </View>
                      <View style={{ padding: wp(8) }}>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(10), fontWeight: '700' }} numberOfLines={1}>{recipe.name}</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(7), marginTop: 1 }} numberOfLines={1}>{recipe.country_origin} • {recipe.category}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* MODAL — Comment ajouter un repas ? */}
        {showAddModal && (
          <View style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1500,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center', alignItems: 'center',
            paddingHorizontal: wp(20),
          }}>
            <View style={{
              width: '100%', borderRadius: 20, padding: 1.2,
              backgroundColor: '#4A4F55',
            }}>
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{ borderRadius: 19, padding: wp(20) }}
              >
                <View style={{
                  position: 'absolute', top: 0, left: 20, right: 20,
                  height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
                }}/>

                <Text style={{
                  color: '#EAEEF3', fontSize: fp(18), fontWeight: '800',
                  textAlign: 'center', marginBottom: wp(4),
                }}>
                  {lang === 'fr' ? 'Ajouter un repas' : 'Add a meal'}
                </Text>
                <Text style={{
                  color: '#5A6070', fontSize: fp(11), textAlign: 'center',
                  marginBottom: wp(20),
                }}>
                  {lang === 'fr'
                    ? 'Choisissez votre méthode'
                    : 'Choose your method'}
                </Text>

                {/* Option 1 : Xscan */}
                <Pressable
                  onPress={() => {
                    setShowAddModal(false);
                    setSelectedMealType(addModalSlot);
                    activateScan();
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center',
                    padding: wp(14), borderRadius: 14, marginBottom: wp(10),
                    backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.04)',
                    borderWidth: 1.2, borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(0,217,132,0.15)',
                  })}
                >
                  <View style={{
                    width: wp(40), height: wp(40), borderRadius: wp(12),
                    backgroundColor: 'rgba(0,217,132,0.08)',
                    justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                    borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                  }}>
                    <Svg width={20} height={20} viewBox="0 0 20 20">
                      <Line x1="4" y1="4" x2="16" y2="16" stroke="#00D984" strokeWidth={2.5} strokeLinecap="round"/>
                      <Line x1="16" y1="4" x2="4" y2="16" stroke="#00D984" strokeWidth={2.5} strokeLinecap="round"/>
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '800' }}>Xscan</Text>
                    <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                      {lang === 'fr' ? 'Scanner en temps réel avec la caméra' : 'Real-time camera scan'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#00D984" />
                </Pressable>

                {/* Option 2 : Galerie Photo */}
                <Pressable
                  onPress={() => {
                    setShowAddModal(false);
                    setSelectedMealType(addModalSlot);
                    pickImageFromGallery();
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center',
                    padding: wp(14), borderRadius: 14, marginBottom: wp(10),
                    backgroundColor: pressed ? 'rgba(255,140,66,0.10)' : 'rgba(255,140,66,0.04)',
                    borderWidth: 1.2, borderColor: pressed ? 'rgba(255,140,66,0.3)' : 'rgba(255,140,66,0.12)',
                  })}
                >
                  <View style={{
                    width: wp(40), height: wp(40), borderRadius: wp(12),
                    backgroundColor: 'rgba(255,140,66,0.08)',
                    justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                    borderWidth: 1, borderColor: 'rgba(255,140,66,0.2)',
                  }}>
                    <Ionicons name="image-outline" size={20} color="#FF8C42" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#FF8C42', fontSize: fp(14), fontWeight: '800' }}>
                      {lang === 'fr' ? 'Galerie Photo' : 'Photo Gallery'}
                    </Text>
                    <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                      {lang === 'fr' ? 'Charger une photo existante' : 'Load an existing photo'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#FF8C42" />
                </Pressable>

                {/* Option 3 : Saisie Manuelle */}
                <Pressable
                  onPress={() => {
                    setShowAddModal(false);
                    setManualMealType(addModalSlot);
                    openManualEntry();
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center',
                    padding: wp(14), borderRadius: 14, marginBottom: wp(16),
                    backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    borderWidth: 1.2, borderColor: pressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                  })}
                >
                  <View style={{
                    width: wp(40), height: wp(40), borderRadius: wp(12),
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                  }}>
                    <Ionicons name="create-outline" size={20} color="#8892A0" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '800' }}>
                      {lang === 'fr' ? 'Saisie manuelle' : 'Manual entry'}
                    </Text>
                    <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                      {lang === 'fr' ? 'Rechercher et ajouter un plat' : 'Search and add a meal'}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: 'rgba(0,217,132,0.08)',
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                  }}>
                    <Text style={{ color: '#00D984', fontSize: fp(7), fontWeight: '700' }}>GRATUIT</Text>
                  </View>
                </Pressable>

                {/* Bouton Annuler */}
                <Pressable
                  onPress={() => setShowAddModal(false)}
                  style={{ alignItems: 'center', paddingVertical: wp(8) }}
                >
                  <Text style={{ color: '#5A6070', fontSize: fp(13) }}>
                    {lang === 'fr' ? 'Annuler' : 'Cancel'}
                  </Text>
                </Pressable>
              </LinearGradient>
            </View>
          </View>
        )}

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

        {/* ÉCRAN XSCAN AR — Mode Pieux & Cordes */}
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
                    onPress={() => { setScanScreen('none'); resetArState(); }}
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
                          {/* Corde — ligne pointillée qui se solidifie */}
                          <Line
                            x1={cx} y1={cy}
                            x2={tx} y2={ty}
                            stroke={isDone ? '#00D984' : isActive ? '#D4AF37' : 'rgba(255,255,255,0.15)'}
                            strokeWidth={isDone ? 2.5 : isActive ? 2 : 1}
                            strokeDasharray={isDone ? '0' : '6,4'}
                            opacity={isDone ? 0.8 : isActive ? 0.7 : 0.3}
                          />
                          {/* Point d'ancrage au centre */}
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
                          {/* Cercle externe */}
                          <Circle cx="40" cy="40" r="35" fill="none" stroke="#D4AF37" strokeWidth={1.5} opacity={0.6} />
                          {/* Croix de visée */}
                          <Line x1="40" y1="10" x2="40" y2="25" stroke="#D4AF37" strokeWidth={1.5} strokeLinecap="round" />
                          <Line x1="40" y1="55" x2="40" y2="70" stroke="#D4AF37" strokeWidth={1.5} strokeLinecap="round" />
                          <Line x1="10" y1="40" x2="25" y2="40" stroke="#D4AF37" strokeWidth={1.5} strokeLinecap="round" />
                          <Line x1="55" y1="40" x2="70" y2="40" stroke="#D4AF37" strokeWidth={1.5} strokeLinecap="round" />
                          {/* Point central */}
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
                      {/* Pieu en bois */}
                      <Rect x="8" y="0" width="8" height="32" rx="2" fill="#8B6914" />
                      <Rect x="9" y="0" width="2" height="32" fill="#A07D1A" opacity={0.5} />
                      {/* Pointe */}
                      <Path d="M8 32L12 40L16 32" fill="#6B4F10" />
                      {/* Tête du pieu */}
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
                              {/* Mini pieu */}
                              <Rect x="7" y="0" width="6" height={20 * (1 - tapProgress)} rx="1"
                                fill={isActive ? '#D4AF37' : '#5A6070'} />
                              <Path d={`M7 ${20 * (1 - tapProgress)}L10 ${24 * (1 - tapProgress)}L13 ${20 * (1 - tapProgress)}`}
                                fill={isActive ? '#A08020' : '#3A4050'} />
                              {/* Ligne sol */}
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
                    {/* Titre */}
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
                        // Prendre la meilleure photo (la première non-null) comme photo principale
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

        {/* ÉCRAN ERREUR — Image non-alimentaire */}
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
                  {/* Loupe avec X */}
                  <Circle cx="17" cy="17" r="10" fill="none" stroke="#FF8C42" strokeWidth={2.5}/>
                  <Line x1="25" y1="25" x2="35" y2="35" stroke="#FF8C42" strokeWidth={2.5} strokeLinecap="round"/>
                  {/* X dans la loupe */}
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
                  {/* Barre diagonale "pas de nourriture" */}
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

              {/* Titre chaleureux */}
              <Text style={{
                color: '#EAEEF3', fontSize: fp(20), fontWeight: '800',
                textAlign: 'center', marginBottom: wp(10),
                lineHeight: fp(26),
              }}>
                {scanError.title}
              </Text>

              {/* Sous-titre explicatif */}
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
                    setScanError(null);
                    setScanSuggestions([]);
                    setAiVisual(null);
                    // Relancer directement la galerie
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

                {/* Saisie manuelle */}
                <Pressable
                  onPress={() => {
                    setScanScreen('none');
                    setScanError(null);
                    setScanResult(null);
                    setCapturedPhoto(null);
                    setCurrentDishName('');
                    openManualEntry();
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: wp(12), borderRadius: 14,
                    backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    borderWidth: 1, borderColor: '#3A3F46',
                    alignItems: 'center',
                  })}
                >
                  <Text style={{ color: '#8892A0', fontSize: fp(13), fontWeight: '600' }}>
                    {lang === 'fr' ? '✏️ Saisir manuellement' : '✏️ Enter manually'}
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
                    setScanError(null);
                    setScanSuggestions([]);
                    setAiVisual(null);
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

              {/* Sélecteur de créneau — cliquable */}
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
                        ? 'rgba(0,217,132,0.5)'
                        : pressed ? '#00B572' : '#00D984',
                    alignItems: 'center',
                    opacity: isSaving ? 0.7 : 1,
                  })}
                >
                  <Text style={{ color: '#0D1117', fontSize: fp(14), fontWeight: '800' }}>
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
                      backgroundColor: pressed ? '#00B572' : '#00D984',
                      alignItems: 'center',
                    })}
                  >
                    <Text style={{ color: '#0D1117', fontSize: fp(15), fontWeight: '800' }}>
                      ✓ {lang === 'fr' ? 'APPLIQUER LA CORRECTION' : 'APPLY CORRECTION'}
                    </Text>
                  </Pressable>
                </View>
                </KeyboardAvoidingView>
              </View>
            )}
          </View>
        )}

      </View>
    </LinearGradient>
  );
};

export default RepasPage;
