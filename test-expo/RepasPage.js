// LIXUM - Page Repas / Meals — Phase 1
// Même design system que DashboardBg-test.js
// Dépendances: expo-linear-gradient, react-native-svg, react-native-safe-area-context

import React, { useEffect, useRef, useState } from 'react';
import {
  View, Dimensions, Text, StyleSheet, Pressable, Image,
  Animated, ScrollView, PixelRatio, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Path, Rect, Ellipse } from 'react-native-svg';

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
// COMPOSANT — MetalCard (copié depuis DashboardBg-test.js)
// ============================================
const MetalCard = ({ children, style, onPress, noPadding = false }) => {
  if (!onPress) {
    return (
      <View style={[metalStyles.outerBorder, style]}>
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={metalStyles.innerGradient}
        >
          <View style={[metalStyles.cardContent, noPadding && { padding: 0 }]}>
            <View style={{
              position: 'absolute', top: 0, left: 25, right: 25,
              height: 1, backgroundColor: 'rgba(0, 217, 132, 0.10)', borderRadius: 0.5,
            }} />
            {children}
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      delayPressIn={120}
      unstable_pressDelay={120}
      style={({ pressed }) => [
        metalStyles.outerBorder,
        style,
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: pressed ? 2 : 8 },
          shadowOpacity: pressed ? 0.6 : 0.5,
          shadowRadius: pressed ? 4 : 16,
          elevation: pressed ? 4 : 12,
          transform: [{ scale: pressed ? 0.975 : 1 }],
          backgroundColor: pressed ? '#3E434A' : '#4A4F55',
        },
      ]}
    >
      <LinearGradient
        colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={metalStyles.innerGradient}
      >
        <View style={[metalStyles.cardContent, noPadding && { padding: 0 }]}>
          <View style={{
            position: 'absolute', top: 0, left: 25, right: 25,
            height: 1, backgroundColor: 'rgba(0, 217, 132, 0.10)', borderRadius: 0.5,
          }} />
          <View style={{
            position: 'absolute',
            top: wp(10), right: wp(10),
            width: wp(18), height: wp(18),
            borderRadius: wp(9),
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ color: '#8892A0', fontSize: fp(10), fontWeight: '600', marginTop: -1 }}>›</Text>
          </View>
          {children}
        </View>
      </LinearGradient>
    </Pressable>
  );
};

const metalStyles = StyleSheet.create({
  outerBorder: {
    borderRadius: wp(18),
    padding: wp(1.2),
    backgroundColor: '#4A4F55',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
    marginHorizontal: wp(14),
    marginBottom: wp(12),
  },
  innerGradient: {
    borderRadius: wp(17),
    overflow: 'hidden',
  },
  cardContent: {
    padding: wp(16),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: wp(17),
  },
});

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

const MOCK_TODAY_MEALS = {
  breakfast: {
    name: 'Thé + Pain beurré',
    calories: 320,
    protein: 8,
    carbs: 45,
    fat: 12,
    time: '7h30',
    photoUri: null,
  },
  lunch: {
    name: 'Poulet grillé + Riz',
    calories: 450,
    protein: 35,
    carbs: 42,
    fat: 15,
    time: '12h30',
    photoUri: null,
  },
  dinner: null,
  snack: null,
};

const MOCK_FREQUENT = [
  { name: 'Riz + Haricots', cal: 285 },
  { name: 'Ugali', cal: 310 },
  { name: 'Pain beurré', cal: 320 },
  { name: 'Banane plantain', cal: 230 },
  { name: 'Fumbwa', cal: 195 },
  { name: 'Sambaza frit', cal: 280 },
];

// ============================================
// COMPOSANT — MealSlot (créneau de repas)
// ============================================
const MealSlot = ({ icon, label, meal, lang }) => {
  if (meal) {
    return (
      <View style={{ marginBottom: wp(12) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
          <Text style={{ fontSize: 16 }}>{icon}</Text>
          <Text style={{
            color: '#5A6070', fontSize: fp(11), fontWeight: '700',
            letterSpacing: 1.5, marginLeft: 6, textTransform: 'uppercase',
          }}>{label}</Text>
          <Text style={{ color: '#3A3F46', fontSize: fp(11), marginLeft: 'auto' }}>{meal.time}</Text>
        </View>

        <Pressable
          delayPressIn={120}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.975 : 1 }],
          })}
        >
          <View style={{
            borderRadius: 18, padding: 1.2,
            backgroundColor: '#4A4F55', elevation: 12,
            shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 8,
          }}>
            <LinearGradient
              colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
              style={{ borderRadius: 17, padding: wp(12) }}
            >
              <View style={{
                position: 'absolute', top: 0, left: 20, right: 20,
                height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
              }} />

              <View style={{
                position: 'absolute', top: wp(10), right: wp(10),
                width: 18, height: 18, borderRadius: 9,
                backgroundColor: 'rgba(255,255,255,0.05)',
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Text style={{ color: '#5A6070', fontSize: 11 }}>›</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: wp(50), height: wp(50), borderRadius: 12,
                  backgroundColor: '#2A2F36',
                  justifyContent: 'center', alignItems: 'center',
                  marginRight: wp(12),
                  borderWidth: 1, borderColor: '#3A3F46',
                }}>
                  {meal.photoUri ? (
                    <Image source={{ uri: meal.photoUri }}
                      style={{ width: wp(50), height: wp(50), borderRadius: 12 }} />
                  ) : (
                    <Svg width={28} height={28} viewBox="0 0 28 28">
                      <Ellipse cx="14" cy="20" rx="12" ry="5" fill="none" stroke="#5A6070" strokeWidth={1.3} />
                      <Path d="M2 20C2 17 7 14 14 14C21 14 26 17 26 20" fill="none" stroke="#5A6070" strokeWidth={1.3} />
                      <Path d="M10 11C10 9 12 8 12 6" stroke="#5A6070" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
                      <Path d="M14 10C14 8 16 7 16 5" stroke="#5A6070" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
                      <Path d="M18 11C18 9 20 8 20 6" stroke="#5A6070" strokeWidth={1} strokeLinecap="round" opacity={0.5} />
                    </Svg>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: '#EAEEF3', fontSize: fp(14), fontWeight: '700',
                  }}>{meal.name}</Text>

                  <Text style={{
                    color: '#8892A0', fontSize: fp(12), marginTop: 3,
                  }}>
                    {meal.calories} kcal • {meal.time}
                  </Text>

                  <View style={{ flexDirection: 'row', marginTop: 5, gap: wp(10) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', marginRight: 3 }} />
                      <Text style={{ color: '#6A7080', fontSize: fp(11) }}>{meal.protein}g P</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginRight: 3 }} />
                      <Text style={{ color: '#6A7080', fontSize: fp(11) }}>{meal.carbs}g G</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4DA6FF', marginRight: 3 }} />
                      <Text style={{ color: '#6A7080', fontSize: fp(11) }}>{meal.fat}g L</Text>
                    </View>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Pressable>
      </View>
    );
  }

  // Créneau vide — placeholder dashed
  return (
    <View style={{ marginBottom: wp(12) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text style={{
          color: '#5A6070', fontSize: fp(11), fontWeight: '700',
          letterSpacing: 1.5, marginLeft: 6, textTransform: 'uppercase',
        }}>{label}</Text>
      </View>

      <Pressable
        onPressIn={() => { /* TODO: ouvrir ajout repas pour ce créneau */ }}
        delayPressIn={120}
        style={({ pressed }) => ({
          borderRadius: 18,
          borderWidth: 1.5,
          borderColor: pressed ? 'rgba(0,217,132,0.3)' : '#2A2F36',
          borderStyle: 'dashed',
          padding: wp(18),
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? 'rgba(0,217,132,0.03)' : 'transparent',
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#3A4050', fontSize: fp(18), marginRight: 8 }}>+</Text>
          <Text style={{ color: '#3A4050', fontSize: fp(13) }}>
            {lang === 'fr' ? 'Ajouter un repas' : 'Add a meal'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

// ============================================
// COMPOSANT PRINCIPAL — RepasPage
// ============================================
const RepasPage = () => {
  const [lang] = useState('fr');

  // Animation glow pulsant pour Xscan
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const calPercent = Math.round((MOCK_CALORIES.consumed / MOCK_CALORIES.goal) * 100);

  const mealSlots = [
    { icon: '☀️', labelFr: 'Petit-déjeuner', labelEn: 'Breakfast', key: 'breakfast' },
    { icon: '🌤️', labelFr: 'Déjeuner', labelEn: 'Lunch', key: 'lunch' },
    { icon: '🌙', labelFr: 'Dîner', labelEn: 'Dinner', key: 'dinner' },
    { icon: '🍿', labelFr: 'Snack', labelEn: 'Snack', key: 'snack' },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: wp(20) }}
    >
      {/* ======== 1. HEADER ======== */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(16),
        paddingTop: wp(12),
        paddingBottom: wp(8),
      }}>
        <Text style={{
          color: '#EAEEF3',
          fontSize: fp(20),
          fontWeight: '800',
          letterSpacing: 2,
        }}>
          MES REPAS
        </Text>

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

      {/* ======== 2. RÉSUMÉ CALORIES DU JOUR ======== */}
      <MetalCard>
        <View style={{ padding: wp(14) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Svg width={16} height={16} viewBox="0 0 16 16">
                <Path d="M8 1C8 1 3 6 3 10C3 12.8 5.2 15 8 15C10.8 15 13 12.8 13 10C13 6 8 1 8 1Z"
                  fill="#FF8C42" opacity={0.9} />
                <Path d="M8 5C8 5 5.5 8 5.5 10.5C5.5 11.9 6.6 13 8 13C9.4 13 10.5 11.9 10.5 10.5C10.5 8 8 5 8 5Z"
                  fill="#FFB74D" opacity={0.8} />
              </Svg>
              <Text style={{ color: '#FF8C42', fontSize: fp(20), fontWeight: '800', marginLeft: 6 }}>
                {MOCK_CALORIES.consumed.toLocaleString('fr-FR')}
              </Text>
              <Text style={{ color: '#8892A0', fontSize: fp(14), marginLeft: 4 }}>
                / {MOCK_CALORIES.goal.toLocaleString('fr-FR')} kcal
              </Text>
            </View>
            <Text style={{ color: '#FF8C42', fontSize: fp(14), fontWeight: '700' }}>{calPercent}%</Text>
          </View>

          {/* Barre de progression */}
          <View style={{
            height: 6,
            backgroundColor: 'rgba(255,140,66,0.12)',
            borderRadius: 3,
            marginTop: wp(8),
            overflow: 'hidden',
          }}>
            <View style={{
              height: '100%',
              width: `${Math.min(calPercent, 100)}%`,
              backgroundColor: calPercent > 100 ? '#FF3B30' : '#FF8C42',
              borderRadius: 3,
            }} />
          </View>

          {/* Macros */}
          <View style={{ flexDirection: 'row', marginTop: wp(10), gap: wp(16) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B6B', marginRight: 5 }} />
              <Text style={{ color: '#8892A0', fontSize: fp(12) }}>{MOCK_CALORIES.protein}g</Text>
              <Text style={{ color: '#5A6070', fontSize: fp(11), marginLeft: 3 }}>P</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD93D', marginRight: 5 }} />
              <Text style={{ color: '#8892A0', fontSize: fp(12) }}>{MOCK_CALORIES.carbs}g</Text>
              <Text style={{ color: '#5A6070', fontSize: fp(11), marginLeft: 3 }}>G</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4DA6FF', marginRight: 5 }} />
              <Text style={{ color: '#8892A0', fontSize: fp(12) }}>{MOCK_CALORIES.fat}g</Text>
              <Text style={{ color: '#5A6070', fontSize: fp(11), marginLeft: 3 }}>L</Text>
            </View>
          </View>
        </View>
      </MetalCard>

      {/* ======== 3. BOUTON XSCAN ======== */}
      <Pressable
        onPressIn={() => { /* TODO: ouvrir le scan */ }}
        delayPressIn={120}
        style={({ pressed }) => ({
          marginHorizontal: wp(16),
          marginTop: wp(16),
          transform: [{ scale: pressed ? 0.975 : 1 }],
        })}
      >
        <Animated.View style={{
          borderRadius: 20,
          padding: 2,
          backgroundColor: '#4A4F55',
          elevation: 16,
          shadowColor: '#00D984',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowOpacity,
          shadowRadius: 15,
        }}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{ borderRadius: 18, padding: wp(20), alignItems: 'center' }}
          >
            {/* Ligne émeraude top */}
            <View style={{
              position: 'absolute', top: 0, left: 20, right: 20,
              height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
            }} />

            {/* Boule métallique */}
            <View style={{
              width: wp(60), height: wp(60), borderRadius: wp(30),
              backgroundColor: '#3A3F46',
              borderWidth: 1.5, borderColor: '#5A5F65',
              shadowColor: '#000', shadowOffset: { width: 2, height: 3 },
              shadowOpacity: 0.6, shadowRadius: 6, elevation: 10,
              justifyContent: 'center', alignItems: 'center',
              marginBottom: wp(14),
            }}>
              {/* Reflet */}
              <View style={{
                position: 'absolute', top: wp(8), left: wp(10),
                width: wp(18), height: wp(10), borderRadius: wp(9),
                backgroundColor: 'rgba(255,255,255,0.18)',
              }} />
              {/* Rails en X */}
              <Svg width={wp(30)} height={wp(30)} viewBox="0 0 30 30">
                <Line x1="5" y1="5" x2="25" y2="25" stroke="#00D984" strokeWidth={1.5} opacity={0.6} />
                <Line x1="25" y1="5" x2="5" y2="25" stroke="#00D984" strokeWidth={1.5} opacity={0.6} />
                <Circle cx="15" cy="15" r="2.5" fill="#00D984" opacity={0.8} />
              </Svg>
            </View>

            {/* Texte XSCAN */}
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: wp(4) }}>
              <Text style={{
                color: '#00D984',
                fontSize: fp(26),
                fontWeight: '900',
                letterSpacing: 1,
              }}>X</Text>
              <Text style={{
                color: '#8892A0',
                fontSize: fp(26),
                fontWeight: '900',
                letterSpacing: 1,
              }}>SCAN</Text>
            </View>

            {/* Sous-texte */}
            <Text style={{
              color: '#8892A0',
              fontSize: fp(13),
              marginBottom: wp(4),
            }}>
              {lang === 'fr' ? 'Scanner votre repas' : 'Scan your meal'}
            </Text>

            {/* Badge IA VISION */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(212,175,55,0.08)',
              paddingHorizontal: 10, paddingVertical: 3,
              borderRadius: 8, borderWidth: 0.5,
              borderColor: 'rgba(212,175,55,0.2)',
            }}>
              <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700', letterSpacing: 1 }}>
                IA VISION
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>

      {/* Compteur scans freemium */}
      <Text style={{
        color: '#5A6070',
        fontSize: fp(11),
        textAlign: 'center',
        marginTop: wp(6),
      }}>
        {lang === 'fr' ? '2/3 scans restants' : '2/3 scans remaining'}
      </Text>

      {/* ======== 4. BOUTONS SECONDAIRES ======== */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: wp(20),
        marginTop: wp(14),
        marginHorizontal: wp(16),
      }}>
        {/* Bouton Galerie */}
        <Pressable
          onPressIn={() => { /* TODO: ouvrir image picker */ }}
          delayPressIn={120}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            paddingHorizontal: wp(16),
            paddingVertical: wp(10),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#3A3F46',
          })}
        >
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Rect x="1" y="1" width="16" height="16" rx="3" fill="none" stroke="#8892A0" strokeWidth={1.3} />
            <Circle cx="6" cy="6.5" r="2" fill="#8892A0" opacity={0.6} />
            <Path d="M1 13L5.5 8.5L9 12L12 9L17 14" stroke="#8892A0" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={{ color: '#8892A0', fontSize: fp(13), fontWeight: '600', marginLeft: 8 }}>
            {lang === 'fr' ? 'Galerie' : 'Gallery'}
          </Text>
        </Pressable>

        {/* Bouton Saisie manuelle */}
        <Pressable
          onPressIn={() => { /* TODO: ouvrir recherche manuelle */ }}
          delayPressIn={120}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
            paddingHorizontal: wp(16),
            paddingVertical: wp(10),
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#3A3F46',
          })}
        >
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M13.5 2.5L15.5 4.5L5.5 14.5L2 16L3.5 12.5L13.5 2.5Z"
              fill="none" stroke="#8892A0" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M11.5 4.5L13.5 6.5" stroke="#8892A0" strokeWidth={1.3} strokeLinecap="round" />
          </Svg>
          <Text style={{ color: '#8892A0', fontSize: fp(13), fontWeight: '600', marginLeft: 8 }}>
            {lang === 'fr' ? 'Manuel' : 'Manual'}
          </Text>
        </Pressable>
      </View>

      {/* ======== 5. TIMELINE REPAS DU JOUR ======== */}
      <View style={{ marginTop: wp(24), paddingHorizontal: wp(16) }}>
        <Text style={{
          color: '#5A6070',
          fontSize: fp(11),
          fontWeight: '700',
          letterSpacing: 2,
          marginBottom: wp(12),
          textTransform: 'uppercase',
        }}>
          {lang === 'fr' ? 'Repas du jour' : "Today's meals"}
        </Text>

        {mealSlots.map((slot) => (
          <MealSlot
            key={slot.key}
            icon={slot.icon}
            label={lang === 'fr' ? slot.labelFr : slot.labelEn}
            meal={MOCK_TODAY_MEALS[slot.key]}
            lang={lang}
          />
        ))}
      </View>

      {/* ======== 6. PLATS FRÉQUENTS ======== */}
      <View style={{ marginTop: wp(20), marginBottom: wp(20) }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: wp(16), marginBottom: wp(10),
        }}>
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Path d="M7.5 1L3 8H7L6.5 13L11 6H7L7.5 1Z" fill="#FFD93D" opacity={0.8} />
          </Svg>
          <Text style={{
            color: '#5A6070', fontSize: fp(11), fontWeight: '700',
            letterSpacing: 2, marginLeft: 6, textTransform: 'uppercase',
          }}>
            {lang === 'fr' ? 'Plats fréquents' : 'Frequent meals'}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(10) }}
        >
          {MOCK_FREQUENT.map((item, index) => (
            <Pressable
              key={index}
              delayPressIn={120}
              style={({ pressed }) => ({
                width: wp(85),
                backgroundColor: pressed ? '#2A2F36' : '#222830',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#3A3F46',
                padding: wp(10),
                alignItems: 'center',
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <View style={{
                width: wp(40), height: wp(40), borderRadius: wp(20),
                backgroundColor: '#2E333A',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: wp(6),
              }}>
                <Svg width={22} height={22} viewBox="0 0 22 22">
                  <Ellipse cx="11" cy="15" rx="9" ry="4" fill="none" stroke="#5A6070" strokeWidth={1.2} />
                  <Path d="M2 15C2 12.5 6 10 11 10C16 10 20 12.5 20 15" fill="none" stroke="#5A6070" strokeWidth={1.2} />
                </Svg>
              </View>

              <Text style={{
                color: '#EAEEF3', fontSize: fp(11), fontWeight: '600',
                textAlign: 'center',
              }} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={{
                color: '#8892A0', fontSize: fp(10), marginTop: 2,
              }}>
                {item.cal} kcal
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default RepasPage;
