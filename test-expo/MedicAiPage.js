// ──────────────────────────────────────────────────────────────────────────────
// MedicAiPage.js — LIXUM MedicAi Chat Page with LixMan (Phase A)
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Platform, Animated, KeyboardAvoidingView,
  Dimensions, StatusBar, SafeAreaView, ActivityIndicator,
  FlatList, PixelRatio, Keyboard, Pressable,
} from 'react-native';
import Svg, {
  G, Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop,
  Text as SvgText,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Responsive system ────────────────────────────────────────────────────────
const W = SCREEN_WIDTH;
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

// ============================================
// CONFIG SUPABASE (même que les autres pages)
// ============================================
const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';

// User test (même UUID que partout)
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ============================================
// TABS CONFIG
// ============================================
const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'medicai', label: 'MedicAi', iconActive: 'medkit', iconInactive: 'medkit-outline', locked: false, isMedicAi: true },
  { key: 'profile', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

// ============================================
// LOCK ICON
// ============================================
const LockIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill="#8892A0" opacity={0.6} />
    <Path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill="#EAEEF3" />
  </Svg>
);

// ============================================
// BOTTOM TABS (identique aux autres pages)
// ============================================
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
// RENDU FORMATÉ — Markdown + Liens Recettes
// Gère : **bold**, - listes, [RECETTE:nom], sauts de ligne
// ============================================
const FormattedText = ({ text, style, onRecipePress }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <View>
      {lines.map((line, lineIndex) => {
        if (line.trim() === '') {
          return <View key={lineIndex} style={{ height: 6 }} />;
        }

        // Détecter [RECETTE:nom_du_plat]
        const recipeMatch = line.match(/\[RECETTE:(.*?)\]/);
        if (recipeMatch) {
          const recipeName = recipeMatch[1];
          return (
            <TouchableOpacity
              key={lineIndex}
              onPress={() => onRecipePress && onRecipePress(recipeName)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,217,132,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(0,217,132,0.3)',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginVertical: 4,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>🍽️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#00D984', fontSize: 13, fontWeight: 'bold' }}>
                  {recipeName}
                </Text>
                <Text style={{ color: '#888', fontSize: 9 }}>
                  Appuyez pour voir la recette →
                </Text>
              </View>
              <Text style={{ color: '#00D984', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          );
        }

        // Ligne "- " = puce de liste
        const isBullet = line.trim().startsWith('- ');
        const cleanLine = isBullet ? line.trim().substring(2) : line;

        // Parser **bold**
        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        return (
          <View key={lineIndex} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2, paddingLeft: isBullet ? 4 : 0 }}>
            {isBullet && (
              <Text style={[style, { marginRight: 6 }]}>•</Text>
            )}
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={partIndex} style={[style, { fontWeight: 'bold', color: '#FFF' }]}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              return <Text key={partIndex} style={style}>{part}</Text>;
            })}
          </View>
        );
      })}
    </View>
  );
};

// ============================================
// FOND PARTICULES ORGANIQUES
// ============================================
const ParticleBackground = () => {
  const particles = useRef(
    Array.from({ length: 25 }, (_, i) => ({
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(SCREEN_HEIGHT + Math.random() * 200),
      size: 2 + Math.random() * 4,
      opacity: 0.08 + Math.random() * 0.15,
      speed: 15000 + Math.random() * 25000,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const animate = () => {
        p.y.setValue(SCREEN_HEIGHT + 50);
        p.x.setValue(Math.random() * SCREEN_WIDTH);
        Animated.timing(p.y, {
          toValue: -50,
          duration: p.speed,
          useNativeDriver: true,
        }).start(() => animate());
      };
      setTimeout(animate, Math.random() * 10000);
    });
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#040608' }}>
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: '#00D984',
            opacity: p.opacity,
            transform: [
              { translateX: p.x },
              { translateY: p.y },
            ],
          }}
        />
      ))}

      {/* Overlay sombre pour lisibilité */}
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(4, 6, 8, 0.6)',
      }} />
    </View>
  );
};

// ============================================
// CARTE HOLOGRAPHIQUE avec circuit animé
// ============================================
const HologramCard = ({ icon, title, subtitle, color, onPress }) => {
  const glowAnim = useRef(new Animated.Value(0.2)).current;
  const circuitAnim = useRef(new Animated.Value(0)).current;
  const isPressed = useRef(false);

  const handlePressIn = () => {
    isPressed.current = true;
    Animated.timing(circuitAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start();
    Animated.timing(glowAnim, { toValue: 0.6, duration: 400, useNativeDriver: false }).start();
  };

  const handlePressOut = () => {
    isPressed.current = false;
    Animated.timing(circuitAnim, { toValue: 0, duration: 600, useNativeDriver: false }).start();
    Animated.timing(glowAnim, { toValue: 0.2, duration: 600, useNativeDriver: false }).start();
  };

  const circuitColor = circuitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`rgba(${color === '#FFB400' ? '255,180,0' : '0,217,132'},0.15)`, `rgba(${color === '#FFB400' ? '255,180,0' : '0,217,132'},0.8)`],
  });

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={{ flex: 1, marginHorizontal: 4 }}
    >
      {/* Circuit vers LixMan (ligne verticale) */}
      <Animated.View style={{
        alignSelf: 'center',
        width: 1.5,
        height: 12,
        backgroundColor: circuitColor,
        marginBottom: 2,
      }} />
      {/* Point de connexion */}
      <Animated.View style={{
        alignSelf: 'center',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: circuitColor,
        marginBottom: 4,
      }} />

      {/* Carte */}
      <Animated.View style={{
        backgroundColor: 'rgba(10,15,25,0.8)',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: circuitAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [`rgba(${color === '#FFB400' ? '255,180,0' : '0,217,132'},0.2)`, color],
        }),
        padding: 12,
        alignItems: 'center',
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
      }}>
        <Text style={{ fontSize: 24, marginBottom: 4 }}>{icon}</Text>
        <Text style={{ color: color, fontSize: 12, fontWeight: 'bold' }}>{title}</Text>
        <Text style={{ color: '#555', fontSize: 8, marginTop: 2 }}>{subtitle}</Text>
      </Animated.View>
    </Pressable>
  );
};

// ============================================
// LIXMAN HOLOGRAMME VIVANT
// ============================================
const LixManHologram = ({ todaySummary, userProfile, onMediBookPress, onSecretPocketPress }) => {
  const haloAnim = useRef(new Animated.Value(0.15)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, { toValue: 0.35, duration: 2500, useNativeDriver: false }),
        Animated.timing(haloAnim, { toValue: 0.15, duration: 2500, useNativeDriver: false }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const calories = todaySummary?.total_calories || 0;
  const tdee = userProfile?.tdee || 2000;
  const water = todaySummary?.total_water || 0;

  return (
    <View style={{ alignItems: 'center', marginVertical: 6 }}>
      {/* Conteneur hologramme */}
      <View style={{ width: SCREEN_WIDTH - 32, alignItems: 'center', position: 'relative' }}>

        {/* HALO VERT qui respire derrière l'image */}
        <Animated.View style={{
          position: 'absolute',
          top: 5,
          width: SCREEN_WIDTH - 48,
          height: 165,
          borderRadius: 20,
          backgroundColor: '#00D984',
          opacity: haloAnim,
          transform: [{ scale: 1.03 }],
        }} />

        {/* Image LixMan principale */}
        <Image
          source={require('./assets/lixman-doctor.png')}
          style={{
            width: SCREEN_WIDTH - 48,
            height: 160,
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: 'rgba(0,217,132,0.4)',
          }}
          resizeMode="cover"
        />

        {/* DONNÉES EN ORBITE — 3 bulles qui flottent autour de l'image */}
        <Animated.View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: orbitRotation }],
        }}>
          {/* Bulle Calories — en haut à droite */}
          <Animated.View style={{
            position: 'absolute',
            top: -8,
            right: 10,
            transform: [{ rotate: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) }],
          }}>
            <View style={{
              backgroundColor: 'rgba(6,8,12,0.85)',
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: 'rgba(0,217,132,0.4)',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 10 }}>🔥</Text>
              <Text style={{ color: '#FF6B3D', fontSize: 10, fontWeight: 'bold', marginLeft: 3 }}>
                {calories} kcal
              </Text>
            </View>
          </Animated.View>

          {/* Bulle Eau — en bas à gauche */}
          <Animated.View style={{
            position: 'absolute',
            bottom: -8,
            left: 10,
            transform: [{ rotate: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) }],
          }}>
            <View style={{
              backgroundColor: 'rgba(6,8,12,0.85)',
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: 'rgba(77,166,255,0.4)',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 10 }}>💧</Text>
              <Text style={{ color: '#4DA6FF', fontSize: 10, fontWeight: 'bold', marginLeft: 3 }}>
                {water} ml
              </Text>
            </View>
          </Animated.View>

          {/* Bulle Objectif — en haut à gauche */}
          <Animated.View style={{
            position: 'absolute',
            top: -8,
            left: 10,
            transform: [{ rotate: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] }) }],
          }}>
            <View style={{
              backgroundColor: 'rgba(6,8,12,0.85)',
              borderRadius: 20,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: 'rgba(0,217,132,0.4)',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 10 }}>🎯</Text>
              <Text style={{ color: '#00D984', fontSize: 10, fontWeight: 'bold', marginLeft: 3 }}>
                {Math.round((calories / tdee) * 100)}%
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Sous-titre */}
        <Text style={{
          color: 'rgba(0,217,132,0.5)',
          fontSize: 9,
          textAlign: 'center',
          marginTop: 6,
          fontStyle: 'italic',
          letterSpacing: 1,
        }}>
          ESPACE SANTÉ INTELLIGENT
        </Text>
      </View>

      {/* DOSSIERS HOLOGRAPHIQUES connectés */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        paddingHorizontal: 16,
        width: '100%',
      }}>
        <HologramCard
          icon="📋"
          title="MediBook"
          subtitle="Dossier médical"
          color="#00D984"
          onPress={onMediBookPress}
        />
        <HologramCard
          icon="🔐"
          title="Secret Pocket"
          subtitle="Coffre-fort santé"
          color="#FFB400"
          onPress={onSecretPocketPress}
        />
      </View>
    </View>
  );
};

// ============================================
// INDICATEUR DE RÉFLEXION — Impulsions nerveuses
// ============================================
const ThinkingIndicator = () => {
  const brainPulse = useRef(new Animated.Value(0.3)).current;
  const impulse1 = useRef(new Animated.Value(0)).current;
  const impulse2 = useRef(new Animated.Value(0)).current;
  const impulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(brainPulse, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(brainPulse, { toValue: 0.3, duration: 600, useNativeDriver: false }),
      ])
    ).start();

    const pulseSequence = () => {
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(impulse1, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(impulse1, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.timing(impulse2, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(impulse2, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]),
        Animated.sequence([
          Animated.timing(impulse3, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.timing(impulse3, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]),
      ]).start(() => pulseSequence());
    };
    pulseSequence();
  }, []);

  return (
    <View style={{ alignSelf: 'flex-start', marginBottom: 10, maxWidth: '85%' }}>
      {/* Avatar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginLeft: 4 }}>
        <Image
          source={require('./assets/lixman-avatar.png')}
          style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5, borderWidth: 1.5, borderColor: '#00D984' }}
          resizeMode="cover"
        />
        <Text style={{ color: '#00D984', fontSize: 11, fontWeight: 'bold' }}>LixMan</Text>
      </View>

      {/* Bulle avec cerveau et impulsions */}
      <View style={{
        backgroundColor: 'rgba(15,20,30,0.9)',
        borderRadius: 16,
        borderTopLeftRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,217,132,0.2)',
        borderLeftWidth: 3,
        borderLeftColor: '#00D984',
      }}>
        {/* Ligne cerveau + texte */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {/* Cerveau qui pulse */}
          <Animated.View style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: brainPulse.interpolate({
              inputRange: [0.3, 1],
              outputRange: ['rgba(0,217,132,0.1)', 'rgba(0,217,132,0.3)'],
            }),
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
            borderWidth: 1.5,
            borderColor: brainPulse.interpolate({
              inputRange: [0.3, 1],
              outputRange: ['rgba(0,217,132,0.2)', 'rgba(0,217,132,0.7)'],
            }),
          }}>
            <Text style={{ fontSize: 18 }}>🧠</Text>
          </Animated.View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#00D984', fontSize: 12, fontWeight: 'bold' }}>
              Analyse en cours
            </Text>
            <Text style={{ color: '#555', fontSize: 9, marginTop: 2 }} numberOfLines={1}>
              Consultation de vos données...
            </Text>
          </View>
        </View>

        {/* Impulsions nerveuses (3 points qui s'allument en cascade) */}
        <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'center' }}>
          {[impulse1, impulse2, impulse3].map((imp, i) => (
            <Animated.View key={i} style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              marginHorizontal: 6,
              backgroundColor: imp.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(0,217,132,0.15)', '#00D984'],
              }),
              transform: [{
                scale: imp.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.3],
                }),
              }],
            }} />
          ))}
        </View>
      </View>
    </View>
  );
};

// ============================================
// BULLE HOLOGRAPHIQUE pour LixMan
// ============================================
const HoloBubble = ({ content, timestamp, onRecipePress }) => {
  const flashAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      alignSelf: 'flex-start',
      maxWidth: '85%',
      marginBottom: 10,
      opacity: opacityAnim,
      transform: [{ translateY: slideAnim }],
    }}>
      {/* Avatar + nom */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, marginLeft: 4 }}>
        <Image
          source={require('./assets/lixman-avatar.png')}
          style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5, borderWidth: 1.5, borderColor: '#00D984' }}
          resizeMode="cover"
        />
        <Text style={{ color: '#00D984', fontSize: 11, fontWeight: 'bold' }}>LixMan</Text>
      </View>

      {/* Bulle holographique */}
      <Animated.View style={{
        backgroundColor: 'rgba(12,18,28,0.85)',
        borderRadius: 14,
        borderTopLeftRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: flashAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(0,217,132,0.15)', 'rgba(0,217,132,0.8)'],
        }),
        borderLeftWidth: 3,
        borderLeftColor: flashAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['#00D984', '#00FFB2'],
        }),
        shadowColor: '#00D984',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: flashAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.05, 0.3],
        }),
        shadowRadius: 8,
      }}>
        <FormattedText
          text={content}
          style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20 }}
          onRecipePress={onRecipePress}
        />
      </Animated.View>

      {/* Heure */}
      <Text style={{ color: '#444', fontSize: 9, marginTop: 2, marginLeft: 4 }}>
        {timestamp ? new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
      </Text>
    </Animated.View>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function MedicAiPage() {
  // Messages du chat
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Données utilisateur (chargées au mount)
  const [userProfile, setUserProfile] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [tokenUsed, setTokenUsed] = useState(0);
  const [tokenLimit, setTokenLimit] = useState(1000);

  // Plats disponibles + modal recette
  const [availableMeals, setAvailableMeals] = useState([]);
  const [recipeModal, setRecipeModal] = useState(null);

  // Navigation
  const [activeTab, setActiveTab] = useState('medicai');

  // Clavier
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Refs
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  // ── Chargement des données au mount ──────────────────────────────────────
  useEffect(() => {
    loadUserData();
    loadTokenQuota();
    loadAvailableMeals();
  }, []);

  // ── Keyboard listener ────────────────────────────────────────────────────
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const addBotMessage = useCallback((text) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
      timestamp: new Date(),
    }]);
  }, []);

  const loadUserData = async () => {
    try {
      // Profil utilisateur
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users_profile?id=eq.${TEST_USER_ID}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const profileData = await profileRes.json();
      if (profileData.length > 0) setUserProfile(profileData[0]);

      // Résumé du jour
      const today = new Date().toISOString().split('T')[0];
      const summaryRes = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_summary?user_id=eq.${TEST_USER_ID}&date=eq.${today}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const summaryData = await summaryRes.json();
      if (summaryData.length > 0) setTodaySummary(summaryData[0]);

      // Générer le message d'accueil après chargement
      generateGreeting(profileData[0], summaryData[0]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      addBotMessage("Bonjour ! Je suis LixMan, votre coach nutritionniste IA personnel. Comment puis-je vous aider aujourd'hui ?");
    }
  };

  const loadTokenQuota = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/medic_token_quotas?user_id=eq.${TEST_USER_ID}&date=eq.${today}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const data = await res.json();
      if (data.length > 0) {
        setTokenUsed(data[0].tokens_used);
        setTokenLimit(data[0].tokens_limit);
      }
    } catch (error) {
      // Pas grave, on affiche les défauts
    }
  };

  const loadAvailableMeals = async () => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/meals_master?select=id,name,category,calories_per_serving&order=name`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) setAvailableMeals(data);
    } catch (error) {
      console.error('Erreur chargement plats:', error);
    }
  };

  // ── Message d'accueil intelligent ────────────────────────────────────────
  const generateGreeting = (profile, summary) => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    const name = profile?.first_name || 'cher membre';

    let greeting = '';

    if (!summary || summary.total_calories === 0) {
      if (hour > 13) {
        greeting = `${timeGreeting} ${name} ! Ravi de vous revoir dans votre espace santé. 👋\n\nJe remarque que vous n'avez encore rien mangé aujourd'hui... Tout va bien ?\n\nN'oubliez pas que sauter des repas n'est jamais bon pour le métabolisme. Même un fruit ou un yaourt, c'est mieux que rien. 🍎`;
      } else {
        greeting = `Bienvenue ${name} dans votre espace santé intelligent ! 👋\n\nJe suis LixMan, votre coach nutritionniste IA personnel. Ici, tout est confidentiel et pensé pour votre bien-être.\n\nParlez-moi de vos objectifs santé, je suis tout ouïe.`;
      }
    } else {
      const calories = summary.total_calories || 0;
      const tdee = profile?.tdee || 2000;
      const percentage = Math.round((calories / tdee) * 100);

      greeting = `${timeGreeting} ${name} ! Content de vous revoir. 👋\n\nJ'ai jeté un œil à vos données du jour depuis votre espace santé : vous êtes à ${calories} kcal sur ${tdee} kcal (${percentage}%).\n\n`;

      if (percentage < 30 && hour > 14) {
        greeting += `C'est un peu bas pour cette heure-ci. Vous avez prévu de manger bientôt ? 🤔`;
      } else if (percentage > 100) {
        greeting += `Vous avez dépassé votre objectif calorique aujourd'hui. Ce n'est pas grave si c'est occasionnel ! On en discute ? 😊`;
      } else {
        greeting += `Vous êtes bien parti ! De quoi voulez-vous qu'on parle ? 😊`;
      }
    }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
    }]);
  };

  // ── Construire le contexte utilisateur ───────────────────────────────────
  const buildUserContext = () => {
    if (!userProfile) return 'Données utilisateur non disponibles.';

    const today = new Date().toLocaleDateString('fr-FR');
    const cal = todaySummary?.total_calories || 0;
    const protein = todaySummary?.total_protein || 0;
    const carbs = todaySummary?.total_carbs || 0;
    const fat = todaySummary?.total_fat || 0;

    // Liste des plats disponibles
    const mealsList = availableMeals.length > 0
      ? availableMeals.map(m => `${m.name} (${m.calories_per_serving || '?'} kcal)`).join(', ')
      : 'Liste non chargée';

    return `
DONNÉES UTILISATEUR (${today}) :
- Nom : ${userProfile.first_name || 'N/A'} ${userProfile.last_name || ''}
- Âge : ${userProfile.age || 'N/A'} ans | Sexe : ${userProfile.gender || 'N/A'}
- Poids : ${userProfile.weight || 'N/A'} kg | Taille : ${userProfile.height || 'N/A'} cm
- Objectif : ${userProfile.goal || 'N/A'}
- BMR : ${userProfile.bmr || 'N/A'} kcal | TDEE : ${userProfile.tdee || 'N/A'} kcal

MACROS AUJOURD'HUI :
- Calories : ${cal} / ${userProfile.tdee || 2000} kcal
- Protéines : ${protein}g | Glucides : ${carbs}g | Lipides : ${fat}g

PLATS DISPONIBLES DANS L'APP (liste de la base de recettes) :
${mealsList}
    `;
  };

  // ── Gestion clic recette ─────────────────────────────────────────────────
  const handleRecipePress = (recipeName) => {
    setRecipeModal({ name: recipeName });
  };

  const confirmNavigateToRecipe = () => {
    const recipeName = recipeModal?.name;
    setRecipeModal(null);
    setActiveTab('repas');
    // TODO EAS Build avec React Navigation :
    // navigation.navigate('Repas', { recipe: recipeName, section: 'recettes' });
  };

  // ── Envoi de message et appel IA ─────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Construire le contexte utilisateur
      const userContext = buildUserContext();

      // Construire l'historique pour l'API (les 20 derniers messages max)
      const chatHistory = [...messages, userMessage]
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

      // Appel à l'Edge Function LixMan
      const response = await fetch(`${SUPABASE_URL}/functions/v1/lixman-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: chatHistory,
          userId: TEST_USER_ID,
          userContext: userContext,
        }),
      });

      const data = await response.json();

      if (data.error) {
        addBotMessage("Désolé, j'ai atteint la limite de tokens pour aujourd'hui. Revenez demain ou utilisez des Lix pour continuer. 🔋");
      } else {
        addBotMessage(data.message || data.content?.[0]?.text || "Hmm, je n'ai pas pu traiter votre message. Réessayez ?");
        if (data.tokens_used) setTokenUsed(prev => prev + data.tokens_used);
      }
    } catch (error) {
      console.error('Erreur LixMan:', error);
      addBotMessage("Oups, une erreur est survenue. Vérifiez votre connexion et réessayez. 🔄");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Fond vivant — Particules organiques */}
      <ParticleBackground />

      <StatusBar barStyle="light-content" />

      {/* ===== HEADER — Minimaliste et premium ===== */}
      <View style={{
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingHorizontal: 16,
        paddingBottom: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View>
          <Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 }}>
            MedicAi
          </Text>
          <Text style={{ color: 'rgba(0,217,132,0.4)', fontSize: 8, letterSpacing: 2, marginTop: 1 }}>
            ESPACE SANTÉ INTELLIGENT
          </Text>
        </View>
        <View style={{
          backgroundColor: 'rgba(0,217,132,0.08)',
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: 'rgba(0,217,132,0.25)',
        }}>
          <Text style={{ color: '#00D984', fontSize: 11 }}>🟢 En ligne</Text>
        </View>
      </View>

      {/* ===== BARRE ÉNERGIE — Style organique ===== */}
      <View style={{
        marginHorizontal: 16,
        marginBottom: 6,
        backgroundColor: 'rgba(10,14,22,0.8)',
        borderRadius: 12,
        padding: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,217,132,0.1)',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: 'rgba(0,217,132,0.5)', fontSize: 9, letterSpacing: 1.5 }}>
            ⚡ ÉNERGIE DISPONIBLE
          </Text>
          <Text style={{ color: '#777', fontSize: 9 }}>{tokenUsed} / {tokenLimit}</Text>
        </View>
        <View style={{ height: 3, backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: 2, overflow: 'hidden' }}>
          <View style={{
            height: '100%',
            width: `${Math.min((tokenUsed / tokenLimit) * 100, 100)}%`,
            backgroundColor: (tokenUsed / tokenLimit) < 0.6 ? '#00D984' : (tokenUsed / tokenLimit) < 0.85 ? '#FF8C00' : '#FF4444',
            borderRadius: 2,
          }} />
        </View>
      </View>

      {/* ===== ZONE DE CHAT ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {/* LIXMAN HOLOGRAMME — Toujours visible */}
          <LixManHologram
            todaySummary={todaySummary}
            userProfile={userProfile}
            onMediBookPress={() => {
              addBotMessage("Le MediBook sera disponible dans une prochaine mise à jour. Il vous permettra de stocker vos ordonnances, rendez-vous et rappels de médicaments. 📋");
            }}
            onSecretPocketPress={() => {
              addBotMessage("Le Secret Pocket sera disponible dans une prochaine mise à jour. Vos données sensibles seront chiffrées et accessibles uniquement par empreinte digitale. 🔐");
            }}
          />

          {/* MESSAGES — Bulles holographiques */}
          {messages.map((msg) => (
            msg.role === 'assistant' ? (
              <HoloBubble
                key={msg.id}
                content={msg.content}
                timestamp={msg.timestamp}
                onRecipePress={handleRecipePress}
              />
            ) : (
              <Animated.View
                key={msg.id}
                style={{
                  alignSelf: 'flex-end',
                  maxWidth: '80%',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#666', fontSize: 10, marginBottom: 2, textAlign: 'right' }}>Vous</Text>
                <View style={{
                  backgroundColor: 'rgba(0,217,132,0.1)',
                  borderRadius: 14,
                  borderTopRightRadius: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: 'rgba(0,217,132,0.25)',
                  borderRightWidth: 3,
                  borderRightColor: 'rgba(0,217,132,0.4)',
                }}>
                  <Text style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20 }}>{msg.content}</Text>
                </View>
                <Text style={{ color: '#444', fontSize: 9, marginTop: 2, textAlign: 'right' }}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </Animated.View>
            )
          ))}

          {/* Indicateur "LixMan réfléchit..." — Impulsions nerveuses */}
          {isTyping && <ThinkingIndicator />}
        </ScrollView>

        {/* ===== BARRE DE SAISIE — Style holographique ===== */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: 'rgba(6,8,12,0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,217,132,0.2)',
        }}>
          {/* Bouton pièce jointe */}
          <TouchableOpacity
            style={{ padding: 6, marginRight: 4 }}
            onPress={() => {
              addBotMessage("La fonction d'import de documents sera disponible prochainement dans le MediBook. Restez connecté ! 📋");
            }}
          >
            <Text style={{ fontSize: 18, opacity: 0.7 }}>📎</Text>
          </TouchableOpacity>

          {/* Champ texte holographique */}
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(15,20,30,0.8)',
            borderRadius: 22,
            borderWidth: 1,
            borderColor: 'rgba(0,217,132,0.2)',
            paddingHorizontal: 16,
            paddingVertical: Platform.OS === 'ios' ? 10 : 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <TextInput
              ref={inputRef}
              style={{
                flex: 1,
                color: '#FFFFFF',
                fontSize: 14,
                maxHeight: 80,
                paddingVertical: 0,
              }}
              placeholder="Consultez LixMan..."
              placeholderTextColor="#444"
              selectionColor="#00D984"
              value={inputText}
              onChangeText={setInputText}
              multiline
              blurOnSubmit={false}
            />
          </View>

          {/* Bouton micro */}
          <TouchableOpacity
            style={{ padding: 6, marginLeft: 4 }}
            onPress={() => {
              addBotMessage("La reconnaissance vocale sera disponible prochainement. En attendant, tapez votre message ! 🎤");
            }}
          >
            <Text style={{ fontSize: 16, opacity: 0.7 }}>🎤</Text>
          </TouchableOpacity>

          {/* Bouton envoyer — pulse quand il y a du texte */}
          <TouchableOpacity
            style={{
              marginLeft: 6,
              width: 38,
              height: 38,
              borderRadius: 19,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: inputText.trim() ? '#00D984' : 'rgba(0,217,132,0.15)',
              borderWidth: inputText.trim() ? 0 : 1,
              borderColor: 'rgba(0,217,132,0.3)',
              shadowColor: inputText.trim() ? '#00D984' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 6,
              elevation: inputText.trim() ? 4 : 0,
            }}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={{
              color: inputText.trim() ? '#000' : 'rgba(0,217,132,0.4)',
              fontSize: 16,
              fontWeight: 'bold'
            }}>
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ===== BOTTOM TAB BAR ===== */}
      {!keyboardVisible && (
        <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
      )}

      {/* === MODAL CONFIRMATION RECETTE === */}
      {recipeModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: '#1A1A2E',
            borderRadius: 16,
            padding: 20,
            width: SCREEN_WIDTH * 0.85,
            borderWidth: 1,
            borderColor: '#333',
          }}>
            {/* Avatar LixMan */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={require('./assets/lixman-avatar.png')}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#00D984' }}
                resizeMode="cover"
              />
              <Text style={{ color: '#00D984', fontSize: 14, fontWeight: 'bold' }}>LixMan</Text>
            </View>

            {/* Message */}
            <Text style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
              Tu veux voir la recette "{recipeModal.name}" dans la section Repas ? 🍽️
            </Text>

            {/* Boutons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setRecipeModal(null)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#333',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: '#888', fontSize: 13 }}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmNavigateToRecipe}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: '#00D984',
                  alignItems: 'center',
                  marginLeft: 8,
                }}
              >
                <Text style={{ color: '#000', fontSize: 13, fontWeight: 'bold' }}>Voir la recette</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
