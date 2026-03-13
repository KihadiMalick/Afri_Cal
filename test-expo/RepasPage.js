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
  Animated, ScrollView, PixelRatio, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  { name: 'Thieboudienne', origin: '\u{1F1F8}\u{1F1F3} Sénégal', cal: 520, color: '#7A3B10' },
  { name: 'Ndolé', origin: '\u{1F1E8}\u{1F1F2} Cameroun', cal: 380, color: '#1E4A20' },
  { name: 'Fumbwa', origin: '\u{1F1E7}\u{1F1EE} Burundi', cal: 290, color: '#1A3A1E' },
  { name: 'Ugali + Sukuma', origin: '\u{1F1F0}\u{1F1EA} Kenya', cal: 350, color: '#6A5010' },
  { name: 'Mafé', origin: '\u{1F1F2}\u{1F1F1} Mali', cal: 480, color: '#8A4520' },
  { name: 'Jollof Rice', origin: '\u{1F1F3}\u{1F1EC} Nigeria', cal: 410, color: '#8B1A1A' },
];

// ============================================
// COMPOSANT — SectionTitle (FIX 3)
// ============================================
const SectionTitle = ({ title, rightAction, rightLabel }) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(16),
    marginBottom: wp(10),
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
  const cardWidth = wp(175);

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

            {/* Nom + calories */}
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

            {/* Bouton + Ajouter — discret */}
            <Pressable delayPressIn={120}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                marginTop: wp(8), paddingVertical: wp(4),
                borderRadius: 8,
                borderWidth: 1,
                borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(0,217,132,0.12)',
              })}
            >
              <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700', marginRight: 3 }}>+</Text>
              <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '600' }}>
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

          {/* Bouton + */}
          <View style={{
            width: wp(36), height: wp(36), borderRadius: wp(18),
            borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.2)',
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.04)',
            marginTop: wp(8),
          }}>
            <Text style={{ color: '#00D984', fontSize: fp(20), fontWeight: '300' }}>+</Text>
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
  }, [glowAnim]);

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
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: wp(80) }}
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
                style={{ borderRadius: 15, paddingHorizontal: wp(14), paddingVertical: wp(10) }}
              >
                {/* Ligne émeraude top */}
                <View style={{
                  position: 'absolute', top: 0, left: 20, right: 20,
                  height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
                }}/>

                {/* Tout sur 2 lignes serrées */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ color: '#FF8C42', fontSize: fp(18), fontWeight: '800' }}>
                      {MOCK_CALORIES.consumed.toLocaleString('fr-FR')}
                    </Text>
                    <Text style={{ color: '#5A6070', fontSize: fp(12), marginLeft: 4 }}>
                      / {MOCK_CALORIES.goal.toLocaleString('fr-FR')} kcal
                    </Text>
                  </View>
                  <Text style={{ color: '#FF8C42', fontSize: fp(13), fontWeight: '700' }}>{calPercent}%</Text>
                </View>

                {/* Barre fine */}
                <View style={{
                  height: 4, backgroundColor: 'rgba(255,140,66,0.12)',
                  borderRadius: 2, marginTop: wp(6), overflow: 'hidden',
                }}>
                  <View style={{
                    height: '100%', width: `${Math.min(calPercent, 100)}%`,
                    backgroundColor: calPercent > 100 ? '#FF3B30' : '#FF8C42', borderRadius: 2,
                  }} />
                </View>

                {/* Macros en ligne */}
                <View style={{ flexDirection: 'row', marginTop: wp(7), gap: wp(14) }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', marginRight: 4 }}/>
                    <Text style={{ color: '#6A7080', fontSize: fp(10) }}>{MOCK_CALORIES.protein}g P</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD93D', marginRight: 4 }}/>
                    <Text style={{ color: '#6A7080', fontSize: fp(10) }}>{MOCK_CALORIES.carbs}g G</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4DA6FF', marginRight: 4 }}/>
                    <Text style={{ color: '#6A7080', fontSize: fp(10) }}>{MOCK_CALORIES.fat}g L</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* ======== 3. BOUTON XSCAN (FIX 2B — réduit ~30%) ======== */}
          <Pressable
            onPressIn={() => {}}
            delayPressIn={120}
            style={({ pressed }) => ({
              marginHorizontal: wp(16),
              marginTop: wp(14),
              transform: [{ scale: pressed ? 0.975 : 1 }],
            })}
          >
            <View style={{
              borderRadius: 18, padding: 1.5,
              backgroundColor: '#4A4F55', elevation: 12,
              shadowColor: '#00D984', shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3, shadowRadius: 12,
            }}>
              <LinearGradient
                colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
                style={{
                  borderRadius: 17,
                  paddingVertical: wp(16),
                  alignItems: 'center',
                }}
              >
                {/* Ligne émeraude top */}
                <View style={{
                  position: 'absolute', top: 0, left: 20, right: 20,
                  height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
                }}/>

                {/* Boule métallique — plus petite */}
                <View style={{
                  width: wp(48), height: wp(48), borderRadius: wp(24),
                  backgroundColor: '#3A3F46',
                  borderWidth: 1.5, borderColor: '#5A5F65',
                  shadowColor: '#000', shadowOffset: { width: 2, height: 3 },
                  shadowOpacity: 0.5, shadowRadius: 5, elevation: 8,
                  justifyContent: 'center', alignItems: 'center',
                  marginBottom: wp(10),
                }}>
                  <View style={{
                    position: 'absolute', top: wp(6), left: wp(8),
                    width: wp(14), height: wp(8), borderRadius: wp(7),
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  }}/>
                  <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24">
                    <Line x1="4" y1="4" x2="20" y2="20" stroke="#00D984" strokeWidth={1.8} opacity={0.7}/>
                    <Line x1="20" y1="4" x2="4" y2="20" stroke="#00D984" strokeWidth={1.8} opacity={0.7}/>
                    <Circle cx="12" cy="12" r="2" fill="#00D984" opacity={0.9}/>
                  </Svg>
                </View>

                {/* XSCAN texte */}
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ color: '#00D984', fontSize: fp(22), fontWeight: '900', letterSpacing: 1 }}>X</Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(22), fontWeight: '900', letterSpacing: 1 }}>SCAN</Text>
                </View>

                <Text style={{ color: '#5A6070', fontSize: fp(11), marginTop: wp(3) }}>
                  {lang === 'fr' ? 'Scanner votre repas' : 'Scan your meal'}
                </Text>

                {/* Badge IA VISION — plus petit */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: 'rgba(212,175,55,0.08)',
                  paddingHorizontal: 8, paddingVertical: 2,
                  borderRadius: 6, borderWidth: 0.5,
                  borderColor: 'rgba(212,175,55,0.2)',
                  marginTop: wp(6),
                }}>
                  <Text style={{ color: '#D4AF37', fontSize: fp(9), fontWeight: '700', letterSpacing: 1 }}>IA VISION</Text>
                </View>
              </LinearGradient>
            </View>
          </Pressable>

          {/* Compteur scan */}
          <Text style={{ color: '#5A6070', fontSize: fp(10), textAlign: 'center', marginTop: wp(5) }}>
            {lang === 'fr' ? '1/1 scan gratuit restant' : '1/1 free scan remaining'}
          </Text>

          {/* ======== 4. BOUTONS SECONDAIRES (FIX 2C — compacts) ======== */}
          <View style={{
            flexDirection: 'row', justifyContent: 'center',
            gap: wp(14), marginTop: wp(10), marginHorizontal: wp(16),
          }}>
            {[
              { icon: 'gallery', label: lang === 'fr' ? 'Galerie' : 'Gallery' },
              { icon: 'manual', label: lang === 'fr' ? 'Manuel' : 'Manual' },
            ].map((btn, i) => (
              <Pressable key={i} delayPressIn={120}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  paddingHorizontal: wp(14), paddingVertical: wp(8),
                  borderRadius: 10, borderWidth: 1, borderColor: '#3A3F46',
                })}
              >
                <Svg width={15} height={15} viewBox="0 0 18 18">
                  {btn.icon === 'gallery' ? (
                    <>
                      <Rect x="1" y="1" width="16" height="16" rx="3" fill="none" stroke="#8892A0" strokeWidth={1.3}/>
                      <Circle cx="6" cy="6.5" r="2" fill="#8892A0" opacity={0.5}/>
                      <Path d="M1 13L5.5 8.5L9 12L12 9L17 14" stroke="#8892A0" strokeWidth={1.2} fill="none" strokeLinecap="round"/>
                    </>
                  ) : (
                    <>
                      <Path d="M13.5 2.5L15.5 4.5L5.5 14.5L2 16L3.5 12.5L13.5 2.5Z" fill="none" stroke="#8892A0" strokeWidth={1.3} strokeLinecap="round"/>
                      <Path d="M11.5 4.5L13.5 6.5" stroke="#8892A0" strokeWidth={1.3} strokeLinecap="round"/>
                    </>
                  )}
                </Svg>
                <Text style={{ color: '#8892A0', fontSize: fp(12), fontWeight: '600', marginLeft: 6 }}>{btn.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* ======== 5. SECTION PLAT DU JOUR (FIX 3+4+7) ======== */}
          <View style={{ marginTop: wp(22) }}>
            <SectionTitle title={lang === 'fr' ? 'Plat du jour' : 'Meals today'} />

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: wp(16), gap: wp(10) }}
              snapToInterval={wp(175) + wp(10)}
              decelerationRate="fast"
            >
              <MealDayCard
                icon="\u2600\uFE0F"
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
                icon="\u{1F324}\uFE0F"
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
                icon="\u{1F319}"
                label={lang === 'fr' ? 'Dîner' : 'Dinner'}
                meal={null}
                lang={lang}
              />
              <MealDayCard
                icon="\u{1F37F}"
                label={lang === 'fr' ? 'Snack' : 'Snack'}
                meal={null}
                lang={lang}
              />
            </ScrollView>
          </View>

          {/* ======== 6. SECTION RECETTES (FIX 3+5+7) ======== */}
          <View style={{ marginTop: wp(22) }}>
            <SectionTitle
              title={lang === 'fr' ? 'Recettes' : 'Recipes'}
              rightLabel={lang === 'fr' ? 'Voir tout \u203A' : 'See all \u203A'}
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
                  {/* Zone image — fond coloré + overlay */}
                  <LinearGradient
                    colors={[recipe.color, 'rgba(0,0,0,0.4)']}
                    style={{
                      width: '100%', height: wp(90),
                      justifyContent: 'flex-end',
                      padding: wp(8),
                    }}
                  >
                    {/* Petit badge calories en haut à droite */}
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

                    {/* Placeholder visuel au centre — assiette SVG subtile */}
                    <View style={{ position: 'absolute', top: '30%', alignSelf: 'center', opacity: 0.15 }}>
                      <Svg width={36} height={36} viewBox="0 0 36 36">
                        <Ellipse cx="18" cy="25" rx="14" ry="6" fill="none" stroke="#FFF" strokeWidth={1.5}/>
                        <Path d="M4 25C4 21 10 17 18 17C26 17 32 21 32 25" fill="none" stroke="#FFF" strokeWidth={1.5}/>
                      </Svg>
                    </View>
                  </LinearGradient>

                  {/* Infos en bas — fond métallique */}
                  <View style={{
                    backgroundColor: '#1A1F28',
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

          {/* ======== 7. SECTION PLATS FRÉQUENTS (FIX 3+6+7) ======== */}
          <View style={{ marginTop: wp(22), marginBottom: wp(16) }}>
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
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RepasPage;
