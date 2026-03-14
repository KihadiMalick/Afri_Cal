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
  Animated, ScrollView, PixelRatio, Platform, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Path, Rect, Ellipse, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

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
      paddingBottom: Platform.OS === 'android' ? 35 : 30,
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
const MealDayCard = ({ icon, label, meal, lang }) => {
  const cardWidth = wp(240);

  if (meal) {
    return (
      <Pressable delayPressIn={120}
        style={({ pressed }) => ({
          width: cardWidth,
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
            style={{ borderRadius: 15, padding: wp(11) }}
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
                width: wp(52), height: wp(52), borderRadius: 14,
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
                  color: '#FF8C42', fontSize: fp(11), fontWeight: '700', marginTop: 2,
                }}>{meal.calories} kcal</Text>

                {/* Macros compacts */}
                <View style={{ flexDirection: 'row', marginTop: wp(6), gap: wp(8) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FF6B6B', marginRight: 3 }}/>
                    <Text style={{ color: '#5A6070', fontSize: fp(9) }}>{meal.protein}g P</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FFD93D', marginRight: 3 }}/>
                    <Text style={{ color: '#5A6070', fontSize: fp(9) }}>{meal.carbs}g G</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#4DA6FF', marginRight: 3 }}/>
                    <Text style={{ color: '#5A6070', fontSize: fp(9) }}>{meal.fat}g L</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Bouton + Ajouter — plus visible */}
            <Pressable delayPressIn={120}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                marginTop: wp(8), paddingVertical: wp(8),
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
        width: cardWidth,
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
            minHeight: wp(135),
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
            width: wp(54), height: wp(54), borderRadius: wp(27),
            borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.25)',
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.06)',
            marginTop: wp(8),
            shadowColor: '#00D984',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 6,
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
      <View style={{ flex: 1, paddingTop: Platform.OS === 'android' ? 20 : 30 }}>
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
            paddingTop: wp(20),
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
                      { value: `${MOCK_CALORIES.protein}g`, color: '#FF6B6B', letter: 'P' },
                      { value: `${MOCK_CALORIES.carbs}g`, color: '#FFD93D', letter: 'G' },
                      { value: `${MOCK_CALORIES.fat}g`, color: '#4DA6FF', letter: 'L' },
                    ].map((m, i) => (
                      <View key={i} style={{
                        flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
                        borderRadius: 10, paddingVertical: wp(8), alignItems: 'center',
                        borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)',
                      }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color, marginBottom: 4 }}/>
                        <Text style={{ color: '#EAEEF3', fontSize: fp(13), fontWeight: '700' }}>{m.value}</Text>
                        <Text style={{ color: '#5A6070', fontSize: fp(9), marginTop: 2, letterSpacing: 0.5 }}>{m.letter}</Text>
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

                {/* CENTRE : Gros bouton X cliquable */}
                <View style={{ alignItems: 'center', marginBottom: wp(16) }}>
                  <Pressable
                    onPressIn={() => { /* TODO: lancer le scan Xscan */ }}
                    delayPressIn={80}
                    style={({ pressed }) => ({
                      width: wp(100),
                      height: wp(100),
                      borderRadius: wp(50),
                      backgroundColor: pressed ? '#252A30' : '#2E333A',
                      borderWidth: 2,
                      borderColor: pressed ? '#00D984' : '#4A4F55',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: pressed ? '#00D984' : '#000',
                      shadowOffset: { width: 0, height: pressed ? 1 : 4 },
                      shadowOpacity: pressed ? 0.5 : 0.4,
                      shadowRadius: pressed ? 4 : 10,
                      elevation: pressed ? 4 : 14,
                      transform: [{ scale: pressed ? 0.93 : 1 }],
                    })}
                  >
                    {/* Anneau orbital */}
                    <Svg width={wp(100)} height={wp(100)} viewBox="0 0 100 100"
                      style={{ position: 'absolute' }}>
                      <Circle cx="50" cy="50" r="46" fill="none"
                              stroke="rgba(0,217,132,0.12)" strokeWidth={1} strokeDasharray="5 7" />
                      <Circle cx="96" cy="50" r="2.5" fill="#00D984" opacity={0.5}/>
                    </Svg>

                    {/* Reflet réaliste */}
                    <View style={{
                      position: 'absolute', top: wp(14), left: wp(20),
                      width: wp(28), height: wp(12), borderRadius: wp(10),
                      backgroundColor: 'rgba(255,255,255,0.10)',
                      transform: [{ rotate: '-25deg' }],
                    }}/>

                    {/* X SVG — GRAND */}
                    <Svg width={wp(48)} height={wp(48)} viewBox="0 0 48 48">
                      <Line x1="8" y1="8" x2="40" y2="40" stroke="#00D984" strokeWidth={4} strokeLinecap="round"/>
                      <Line x1="40" y1="8" x2="8" y2="40" stroke="#00D984" strokeWidth={4} strokeLinecap="round"/>
                      <Circle cx="24" cy="24" r="4" fill="#00D984" opacity={0.4}/>
                      <Circle cx="24" cy="24" r="2" fill="#00D984" opacity={0.8}/>
                      <Circle cx="8" cy="8" r="3.5" fill="none" stroke="#00D984" strokeWidth={1.5} opacity={0.35}/>
                      <Circle cx="40" cy="8" r="3.5" fill="none" stroke="#00D984" strokeWidth={1.5} opacity={0.35}/>
                      <Circle cx="8" cy="40" r="3.5" fill="none" stroke="#00D984" strokeWidth={1.5} opacity={0.35}/>
                      <Circle cx="40" cy="40" r="3.5" fill="none" stroke="#00D984" strokeWidth={1.5} opacity={0.35}/>
                    </Svg>
                  </Pressable>
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
                    onPressIn={() => { /* TODO: ouvrir galerie / image picker */ }}
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
              snapToInterval={wp(240) + wp(10)}
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
      </View>
    </LinearGradient>
  );
};

export default RepasPage;
