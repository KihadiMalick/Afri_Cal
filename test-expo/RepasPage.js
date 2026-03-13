// LIXUM - Page Repas / Meals — Phase 2 (refonte post-screenshot)
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

const MOCK_FREQUENT = [
  { name: 'Riz + Haricots', cal: 285 },
  { name: 'Ugali', cal: 310 },
  { name: 'Pain beurré', cal: 320 },
  { name: 'Banane plantain', cal: 230 },
  { name: 'Fumbwa', cal: 195 },
  { name: 'Sambaza frit', cal: 280 },
];

const MOCK_RECIPES = [
  { name: 'Thieboudienne', origin: '🇸🇳 Sénégal', cal: 520, color: '#8B4513' },
  { name: 'Ndolé', origin: '🇨🇲 Cameroun', cal: 380, color: '#2E5A1C' },
  { name: 'Fumbwa', origin: '🇧🇮 Burundi', cal: 290, color: '#1E4A20' },
  { name: 'Ugali + Sukuma', origin: '🇰🇪 Kenya', cal: 350, color: '#8B6914' },
  { name: 'Mafé', origin: '🇲🇱 Mali', cal: 480, color: '#A0522D' },
  { name: 'Jollof Rice', origin: '🇳🇬 Nigeria', cal: 410, color: '#B22222' },
];

// ============================================
// COMPOSANT — MealDayCard (card horizontale)
// ============================================
const MealDayCard = ({ icon, label, meal, lang }) => {
  const cardWidth = wp(220);

  if (meal) {
    // CARD AVEC REPAS
    return (
      <Pressable
        delayPressIn={120}
        style={({ pressed }) => ({
          width: cardWidth,
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
            style={{ borderRadius: 17, padding: wp(14) }}
          >
            {/* Ligne émeraude top */}
            <View style={{
              position: 'absolute', top: 0, left: 20, right: 20,
              height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
            }}/>

            {/* Header card : icône + label + heure */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(10) }}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
              <Text style={{
                color: '#8892A0', fontSize: fp(11), fontWeight: '700',
                letterSpacing: 1, marginLeft: 6, textTransform: 'uppercase',
              }}>{label}</Text>
              <Text style={{
                color: '#5A6070', fontSize: fp(10), marginLeft: 'auto',
              }}>{meal.time}</Text>
            </View>

            {/* Photo placeholder + infos */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Placeholder assiette fumante */}
              <View style={{
                width: wp(46), height: wp(46), borderRadius: 12,
                backgroundColor: '#2A2F36',
                justifyContent: 'center', alignItems: 'center',
                marginRight: wp(10),
                borderWidth: 1, borderColor: '#3A3F46',
              }}>
                <Svg width={24} height={24} viewBox="0 0 24 24">
                  <Ellipse cx="12" cy="17" rx="10" ry="4" fill="none" stroke="#5A6070" strokeWidth={1.2}/>
                  <Path d="M2 17C2 14.5 6 12 12 12C18 12 22 14.5 22 17" fill="none" stroke="#5A6070" strokeWidth={1.2}/>
                  <Path d="M9 9C9 7.5 10.5 6.5 10.5 5" stroke="#5A6070" strokeWidth={0.8} strokeLinecap="round" opacity={0.5}/>
                  <Path d="M12 8C12 6.5 13.5 5.5 13.5 4" stroke="#5A6070" strokeWidth={0.8} strokeLinecap="round" opacity={0.5}/>
                  <Path d="M15 9C15 7.5 16.5 6.5 16.5 5" stroke="#5A6070" strokeWidth={0.8} strokeLinecap="round" opacity={0.5}/>
                </Svg>
              </View>

              {/* Infos */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: '#EAEEF3', fontSize: fp(13), fontWeight: '700',
                }} numberOfLines={1}>{meal.name}</Text>
                <Text style={{
                  color: '#FF8C42', fontSize: fp(12), fontWeight: '700', marginTop: 3,
                }}>{meal.calories} kcal</Text>
              </View>
            </View>

            {/* Macros en ligne */}
            <View style={{ flexDirection: 'row', marginTop: wp(10), gap: wp(10) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', marginRight: 3 }}/>
                <Text style={{ color: '#6A7080', fontSize: fp(10) }}>{meal.protein}g P</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginRight: 3 }}/>
                <Text style={{ color: '#6A7080', fontSize: fp(10) }}>{meal.carbs}g G</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4DA6FF', marginRight: 3 }}/>
                <Text style={{ color: '#6A7080', fontSize: fp(10) }}>{meal.fat}g L</Text>
              </View>
            </View>

            {/* Bouton + Ajouter un plat */}
            <Pressable
              delayPressIn={120}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: wp(10),
                paddingVertical: wp(6),
                borderRadius: 10,
                borderWidth: 1,
                borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(0,217,132,0.15)',
                backgroundColor: pressed ? 'rgba(0,217,132,0.06)' : 'transparent',
              })}
            >
              <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '700', marginRight: 4 }}>+</Text>
              <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '600' }}>
                {lang === 'fr' ? 'Ajouter un plat' : 'Add a dish'}
              </Text>
            </Pressable>

          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  // CARD VIDE — créneau sans repas
  return (
    <Pressable
      delayPressIn={120}
      style={({ pressed }) => ({
        width: cardWidth,
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
          style={{
            borderRadius: 17,
            padding: wp(14),
            minHeight: wp(160),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Ligne émeraude top */}
          <View style={{
            position: 'absolute', top: 0, left: 20, right: 20,
            height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
          }}/>

          {/* Header */}
          <View style={{
            position: 'absolute', top: wp(14), left: wp(14),
            flexDirection: 'row', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 18 }}>{icon}</Text>
            <Text style={{
              color: '#8892A0', fontSize: fp(11), fontWeight: '700',
              letterSpacing: 1, marginLeft: 6, textTransform: 'uppercase',
            }}>{label}</Text>
          </View>

          {/* Bouton + central */}
          <View style={{
            width: wp(48), height: wp(48), borderRadius: wp(24),
            borderWidth: 2, borderColor: 'rgba(0,217,132,0.25)',
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.05)',
            marginTop: wp(10),
          }}>
            <Text style={{ color: '#00D984', fontSize: fp(24), fontWeight: '300' }}>+</Text>
          </View>

          <Text style={{
            color: '#5A6070', fontSize: fp(11), marginTop: wp(8),
          }}>
            {lang === 'fr' ? 'Ajouter un repas' : 'Add a meal'}
          </Text>

        </LinearGradient>
      </View>
    </Pressable>
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

  return (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: wp(20) }}
    >
      {/* ======== 1. HEADER — paddingTop aligné avec le dashboard ======== */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(16),
        paddingTop: wp(45),
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

      {/* Compteur scans — logique freemium */}
      <Text style={{
        color: '#5A6070',
        fontSize: fp(11),
        textAlign: 'center',
        marginTop: wp(6),
      }}>
        {lang === 'fr' ? '1/1 scan gratuit restant' : '1/1 free scan remaining'}
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

      {/* ======== 5. SECTION PLAT DU JOUR — scroll horizontal ======== */}
      <View style={{ marginTop: wp(24) }}>
        <Text style={{
          color: '#EAEEF3',
          fontSize: fp(16),
          fontWeight: '800',
          letterSpacing: 1.5,
          paddingHorizontal: wp(16),
          marginBottom: wp(12),
        }}>
          {lang === 'fr' ? '🍽️  PLAT DU JOUR' : '🍽️  MEALS TODAY'}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(12) }}
          snapToInterval={wp(220) + wp(12)}
          decelerationRate="fast"
        >
          {/* Card Petit-déjeuner (rempli) */}
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

          {/* Card Déjeuner (rempli) */}
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

          {/* Card Dîner (vide) */}
          <MealDayCard
            icon="🌙"
            label={lang === 'fr' ? 'Dîner' : 'Dinner'}
            meal={null}
            lang={lang}
          />

          {/* Card Snack (vide) */}
          <MealDayCard
            icon="🍿"
            label={lang === 'fr' ? 'Snack' : 'Snack'}
            meal={null}
            lang={lang}
          />
        </ScrollView>
      </View>

      {/* ======== 6. SECTION RECETTES — scroll horizontal ======== */}
      <View style={{ marginTop: wp(28) }}>
        {/* Header avec titre + "Voir tout" */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between',
          alignItems: 'center', paddingHorizontal: wp(16),
          marginBottom: wp(12),
        }}>
          <Text style={{
            color: '#EAEEF3',
            fontSize: fp(16),
            fontWeight: '800',
            letterSpacing: 1.5,
          }}>
            {lang === 'fr' ? '🍳  RECETTES' : '🍳  RECIPES'}
          </Text>
          <Pressable>
            <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '600' }}>
              {lang === 'fr' ? 'Voir tout ›' : 'See all ›'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(12) }}
        >
          {MOCK_RECIPES.map((recipe, index) => (
            <Pressable
              key={index}
              delayPressIn={120}
              onPressIn={() => { /* TODO: naviguer vers page Recettes */ }}
              style={({ pressed }) => ({
                width: wp(150),
                borderRadius: 16,
                overflow: 'hidden',
                transform: [{ scale: pressed ? 0.96 : 1 }],
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
              })}
            >
              {/* Image placeholder — fond coloré avec assiette SVG */}
              <View style={{
                width: '100%',
                height: wp(120),
                backgroundColor: recipe.color,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                {/* Overlay foncé en bas pour le texte */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '60%',
                  }}
                />
                {/* Icône placeholder assiette */}
                <Svg width={40} height={40} viewBox="0 0 40 40" style={{ opacity: 0.3 }}>
                  <Ellipse cx="20" cy="28" rx="16" ry="7" fill="none" stroke="#FFF" strokeWidth={1.5}/>
                  <Path d="M4 28C4 23 10 18 20 18C30 18 36 23 36 28" fill="none" stroke="#FFF" strokeWidth={1.5}/>
                  <Path d="M15 13C15 10 18 8 18 5" stroke="#FFF" strokeWidth={1} strokeLinecap="round" opacity={0.6}/>
                  <Path d="M20 11C20 8 23 6 23 3" stroke="#FFF" strokeWidth={1} strokeLinecap="round" opacity={0.6}/>
                  <Path d="M25 13C25 10 28 8 28 5" stroke="#FFF" strokeWidth={1} strokeLinecap="round" opacity={0.6}/>
                </Svg>
              </View>

              {/* Infos en bas */}
              <View style={{
                backgroundColor: '#1E2530',
                padding: wp(10),
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}>
                <Text style={{
                  color: '#EAEEF3', fontSize: fp(12), fontWeight: '700',
                }} numberOfLines={1}>{recipe.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                  <Text style={{ color: '#8892A0', fontSize: fp(10) }}>{recipe.origin}</Text>
                  <Text style={{ color: '#FF8C42', fontSize: fp(10), fontWeight: '600' }}>{recipe.cal} kcal</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ======== 7. SECTION PLATS FRÉQUENTS — en dernier ======== */}
      <View style={{ marginTop: wp(28), marginBottom: wp(100) }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: wp(16), marginBottom: wp(12),
        }}>
          <Svg width={14} height={14} viewBox="0 0 14 14">
            <Path d="M7.5 1L3 8H7L6.5 13L11 6H7L7.5 1Z" fill="#FFD93D" opacity={0.8} />
          </Svg>
          <Text style={{
            color: '#EAEEF3',
            fontSize: fp(16),
            fontWeight: '800',
            letterSpacing: 1.5,
            marginLeft: 8,
          }}>
            {lang === 'fr' ? 'PLATS FRÉQUENTS' : 'FREQUENT MEALS'}
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
                width: wp(90),
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
                width: wp(42), height: wp(42), borderRadius: wp(21),
                backgroundColor: '#2E333A',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: wp(6),
                borderWidth: 1, borderColor: '#3A3F46',
              }}>
                <Svg width={22} height={22} viewBox="0 0 22 22">
                  <Ellipse cx="11" cy="15" rx="9" ry="4" fill="none" stroke="#5A6070" strokeWidth={1.2} />
                  <Path d="M2 15C2 12.5 6 10 11 10C16 10 20 12.5 20 15" fill="none" stroke="#5A6070" strokeWidth={1.2} />
                </Svg>
              </View>
              <Text style={{
                color: '#EAEEF3', fontSize: fp(11), fontWeight: '600',
                textAlign: 'center',
              }} numberOfLines={1}>{item.name}</Text>
              <Text style={{
                color: '#8892A0', fontSize: fp(10), marginTop: 2,
              }}>{item.cal} kcal</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

export default RepasPage;
