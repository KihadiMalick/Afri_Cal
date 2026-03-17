// ──────────────────────────────────────────────────────────────────────────────
// MedicAiPage.js — LIXUM MedicAi : Réseau Synaptique à Balles Métalliques
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
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC3pUn0';

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
              <Text style={{ fontSize: 16, marginRight: 8 }}>{'\uD83C\uDF7D\uFE0F'}</Text>
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
              <Text style={[style, { marginRight: 6 }]}>{'\u2022'}</Text>
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
// FOND AVEC PARTICULES MÉTALLIQUES
// ============================================
const MetalParticleBackground = () => {
  const particles = useRef(
    Array.from({ length: 20 }, () => ({
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      y: new Animated.Value(SCREEN_HEIGHT + Math.random() * 100),
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.04 + Math.random() * 0.08,
      speed: 18000 + Math.random() * 20000,
    }))
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      const go = () => {
        p.y.setValue(SCREEN_HEIGHT + 30);
        p.x.setValue(Math.random() * SCREEN_WIDTH);
        Animated.timing(p.y, { toValue: -30, duration: p.speed, useNativeDriver: true }).start(go);
      };
      setTimeout(go, Math.random() * 8000);
    });
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#020405' }}>
      {particles.map((p, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', width: p.size, height: p.size, borderRadius: p.size,
          backgroundColor: i % 3 === 0 ? '#4A4F55' : '#00D984',
          opacity: p.opacity,
          transform: [{ translateX: p.x }, { translateY: p.y }],
        }} />
      ))}
    </View>
  );
};

// ============================================
// BALLE MÉTALLIQUE — Noeud du réseau
// ============================================
const MetalBall = ({ index, isBot, onPress, isHighlighted, isNew }) => {
  const scaleAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isNew) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }

    const wobbleDuration = 3000 + (index % 5) * 500;
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobbleAnim, { toValue: 1, duration: wobbleDuration / 2, useNativeDriver: true }),
        Animated.timing(wobbleAnim, { toValue: 0, duration: wobbleDuration / 2, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const wobbleTranslateY = wobbleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1.5],
  });
  const wobbleScale = wobbleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.015, 1],
  });

  const primaryColor = isBot ? '#E84040' : '#4DA6FF';
  const innerGlow = isBot ? 'rgba(232,64,64,0.15)' : 'rgba(77,166,255,0.15)';

  const BALL_SIZE = 28;

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { translateY: wobbleTranslateY },
        { scale: wobbleScale },
      ],
    }}>
      <Pressable onPress={onPress}>
        <View style={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: BALL_SIZE / 2,
          backgroundColor: '#252A30',
          borderWidth: 1.2,
          borderColor: isHighlighted ? primaryColor : '#4A4F55',
          shadowColor: isHighlighted ? primaryColor : '#000',
          shadowOffset: { width: 0, height: isHighlighted ? 0 : 2 },
          shadowOpacity: isHighlighted ? 0.6 : 0.4,
          shadowRadius: isHighlighted ? 8 : 4,
          elevation: isHighlighted ? 8 : 3,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          {/* Reflet métallique en haut */}
          <View style={{
            position: 'absolute',
            top: 1,
            left: BALL_SIZE * 0.15,
            width: BALL_SIZE * 0.5,
            height: BALL_SIZE * 0.35,
            borderRadius: BALL_SIZE * 0.25,
            backgroundColor: 'rgba(255,255,255,0.08)',
            transform: [{ rotate: '-15deg' }],
          }} />

          {/* Reflet secondaire petit */}
          <View style={{
            position: 'absolute',
            bottom: BALL_SIZE * 0.2,
            right: BALL_SIZE * 0.15,
            width: 3,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: 'rgba(255,255,255,0.04)',
          }} />

          {/* Bord intérieur coloré */}
          <View style={{
            position: 'absolute',
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            borderRadius: BALL_SIZE / 2,
            borderWidth: 0.5,
            borderColor: innerGlow,
          }} />

          {/* Numéro */}
          <Text style={{
            color: isHighlighted ? '#FFF' : primaryColor,
            fontSize: 9,
            fontWeight: 'bold',
            opacity: isHighlighted ? 1 : 0.7,
          }}>
            {index + 1}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================
// RÉSEAU SYNAPTIQUE EN S — Circuit neural
// ============================================
const BALLS_PER_ROW = 10;
const BALL_SIZE = 28;
const BALL_GAP = 4;
const ROW_SPACING = 16;
const PADDING_H = 8;

const getBallPosition = (index) => {
  const row = Math.floor(index / BALLS_PER_ROW);
  const col = index % BALLS_PER_ROW;
  const isReversed = row % 2 === 1;
  const actualCol = isReversed ? (BALLS_PER_ROW - 1 - col) : col;
  const x = PADDING_H + actualCol * (BALL_SIZE + BALL_GAP);
  const y = row * (BALL_SIZE + ROW_SPACING);
  return { x, y, row };
};

const SynapticNetwork = ({ messages, highlightedIndices, onBallPress }) => {
  const totalRows = Math.ceil(messages.length / BALLS_PER_ROW);
  const containerHeight = totalRows * (BALL_SIZE + ROW_SPACING) + 10;

  return (
    <View style={{
      height: containerHeight,
      width: '100%',
      paddingHorizontal: 4,
      position: 'relative',
    }}>
      {/* Circuit de fond (traits verts entre les balles) */}
      {messages.map((msg, i) => {
        if (i === 0) return null;
        const prev = getBallPosition(i - 1);
        const curr = getBallPosition(i);
        const prevRow = Math.floor((i - 1) / BALLS_PER_ROW);
        const currRow = Math.floor(i / BALLS_PER_ROW);

        if (prevRow === currRow) {
          const leftX = Math.min(prev.x, curr.x) + BALL_SIZE / 2;
          const width = Math.abs(curr.x - prev.x);
          return (
            <View key={`line-${i}`} style={{
              position: 'absolute',
              left: leftX,
              top: curr.y + BALL_SIZE / 2 - 0.5,
              width: width,
              height: 1,
              backgroundColor: 'rgba(0,217,132,0.08)',
            }} />
          );
        } else {
          return (
            <View key={`line-${i}`} style={{
              position: 'absolute',
              left: prev.x + BALL_SIZE / 2 - 0.5,
              top: prev.y + BALL_SIZE / 2,
              width: 1,
              height: ROW_SPACING,
              backgroundColor: 'rgba(0,217,132,0.08)',
            }} />
          );
        }
      })}

      {/* Points de connexion entre les lignes */}
      {messages.map((msg, i) => {
        const prevRow = Math.floor((i - 1) / BALLS_PER_ROW);
        const currRow = Math.floor(i / BALLS_PER_ROW);
        if (i > 0 && prevRow !== currRow) {
          const prev = getBallPosition(i - 1);
          return (
            <View key={`dot-${i}`} style={{
              position: 'absolute',
              left: prev.x + BALL_SIZE / 2 - 2,
              top: prev.y + BALL_SIZE / 2 + ROW_SPACING / 2 - 2,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(0,217,132,0.2)',
            }} />
          );
        }
        return null;
      })}

      {/* Les balles métalliques */}
      {messages.map((msg, i) => {
        const pos = getBallPosition(i);
        const isBot = msg.role === 'assistant';
        const isHighlighted = highlightedIndices.includes(i);
        return (
          <View key={msg.id} style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
          }}>
            <MetalBall
              index={i}
              isBot={isBot}
              isHighlighted={isHighlighted}
              isNew={msg._isNew}
              onPress={() => onBallPress(msg, i)}
            />
          </View>
        );
      })}
    </View>
  );
};

// ============================================
// BALLE D'ATTENTE — ALIXEN réfléchit
// ============================================
const WaitingBall = () => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#252A30',
      borderWidth: 1.5,
      borderColor: pulseAnim.interpolate({
        inputRange: [0.3, 1],
        outputRange: ['rgba(232,64,64,0.2)', 'rgba(232,64,64,0.7)'],
      }),
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#E84040',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: pulseAnim,
      shadowRadius: 8,
      elevation: 5,
    }}>
      <Animated.Text style={{ fontSize: 12, opacity: pulseAnim }}>{'\uD83E\uDDE0'}</Animated.Text>
    </Animated.View>
  );
};

// ============================================
// GÉNÉRATEUR DE PARTICULES ALIXEN
// ============================================
const generateParticles = (CX, CY, screenW, imageH) => {
  const particles = [];

  // ============================================
  // GROUPE 1 : AU-DESSUS DE LA TÊTE (25 particules)
  // Jaune/vert lumineux — énergie du cerveau qui émane
  // Doivent être VISIBLES, tailles variées, certaines grosses
  // Remplir tout l'arc au-dessus du crâne
  // ============================================
  for (let i = 0; i < 25; i++) {
    const spreadX = -screenW * 0.3 + Math.random() * screenW * 0.6;
    const topY = Math.random() * 45;
    particles.push({
      baseX: CX + spreadX,
      baseY: topY,
      size: 1.5 + Math.random() * 5.5,
      color: Math.random() > 0.35
        ? 'rgba(210,225,80,' + (0.15 + Math.random() * 0.35) + ')'
        : 'rgba(130,225,140,' + (0.12 + Math.random() * 0.28) + ')',
      ampX: 2 + Math.random() * 7,
      ampY: 2 + Math.random() * 8,
      durationX: 2500 + Math.random() * 3500,
      durationY: 3000 + Math.random() * 3500,
      animX: new Animated.Value(Math.random()),
      animY: new Animated.Value(Math.random()),
      animOpacity: new Animated.Value(0.1 + Math.random() * 0.15),
      minOpacity: 0.06 + Math.random() * 0.1,
      maxOpacity: 0.25 + Math.random() * 0.4,
      pulseDuration: 1200 + Math.random() * 2500,
      layer: Math.random() > 0.4 ? 'front' : 'back',
    });
  }

  // ============================================
  // GROUPE 2 : CÔTÉ GAUCHE DENSE (25 particules)
  // Turquoise/cyan — correspond à la joue gauche du visage
  // BEAUCOUP de particules, du bord gauche de l'écran
  // jusqu'au centre du visage, sur toute la hauteur
  // ============================================
  for (let i = 0; i < 25; i++) {
    particles.push({
      baseX: 5 + Math.random() * (CX - 15),
      baseY: 15 + Math.random() * (imageH - 30),
      size: 1 + Math.random() * 6.5,
      color: Math.random() > 0.25
        ? 'rgba(0,210,210,' + (0.08 + Math.random() * 0.25) + ')'
        : 'rgba(0,230,190,' + (0.06 + Math.random() * 0.2) + ')',
      ampX: 3 + Math.random() * 8,
      ampY: 2 + Math.random() * 6,
      durationX: 3500 + Math.random() * 5000,
      durationY: 3000 + Math.random() * 4500,
      animX: new Animated.Value(Math.random()),
      animY: new Animated.Value(Math.random()),
      animOpacity: new Animated.Value(0.04 + Math.random() * 0.1),
      minOpacity: 0.03 + Math.random() * 0.07,
      maxOpacity: 0.12 + Math.random() * 0.25,
      pulseDuration: 2000 + Math.random() * 4000,
      layer: 'back',
    });
  }

  // ============================================
  // GROUPE 3 : CÔTÉ DROIT DENSE (25 particules)
  // Violet/rose/mauve — correspond au côté droit du visage
  // Même densité que le côté gauche mais en violet
  // Du centre jusqu'au bord droit de l'écran
  // ============================================
  for (let i = 0; i < 25; i++) {
    particles.push({
      baseX: CX + 15 + Math.random() * (CX - 15),
      baseY: 15 + Math.random() * (imageH - 30),
      size: 1 + Math.random() * 6.5,
      color: Math.random() > 0.3
        ? 'rgba(185,135,210,' + (0.07 + Math.random() * 0.2) + ')'
        : Math.random() > 0.5
          ? 'rgba(210,155,190,' + (0.05 + Math.random() * 0.15) + ')'
          : 'rgba(160,120,200,' + (0.06 + Math.random() * 0.18) + ')',
      ampX: 3 + Math.random() * 8,
      ampY: 2 + Math.random() * 6,
      durationX: 3500 + Math.random() * 5000,
      durationY: 3000 + Math.random() * 4500,
      animX: new Animated.Value(Math.random()),
      animY: new Animated.Value(Math.random()),
      animOpacity: new Animated.Value(0.04 + Math.random() * 0.08),
      minOpacity: 0.02 + Math.random() * 0.06,
      maxOpacity: 0.1 + Math.random() * 0.22,
      pulseDuration: 2000 + Math.random() * 4000,
      layer: 'back',
    });
  }

  // ============================================
  // GROUPE 4 : FRONT & CERVEAU (15 particules)
  // Jaune vif — DEVANT l'image, sur le front
  // Petites, rapides, très lumineuses
  // Simulent l'activité cérébrale en temps réel
  // ============================================
  for (let i = 0; i < 15; i++) {
    particles.push({
      baseX: CX - 35 + Math.random() * 70,
      baseY: 10 + Math.random() * 50,
      size: 0.8 + Math.random() * 3,
      color: Math.random() > 0.45
        ? 'rgba(225,235,100,' + (0.2 + Math.random() * 0.4) + ')'
        : 'rgba(185,225,85,' + (0.15 + Math.random() * 0.35) + ')',
      ampX: 1 + Math.random() * 4,
      ampY: 1 + Math.random() * 3.5,
      durationX: 1800 + Math.random() * 2200,
      durationY: 2000 + Math.random() * 2200,
      animX: new Animated.Value(Math.random()),
      animY: new Animated.Value(Math.random()),
      animOpacity: new Animated.Value(0.12 + Math.random() * 0.2),
      minOpacity: 0.08 + Math.random() * 0.1,
      maxOpacity: 0.3 + Math.random() * 0.45,
      pulseDuration: 700 + Math.random() * 1200,
      layer: 'front',
    });
  }

  // ============================================
  // GROUPE 5 : JOUES & BAS DU VISAGE (10 particules)
  // Cyan doux DEVANT l'image — très faible opacité
  // Donne un effet de vie sans cacher les détails
  // ============================================
  for (let i = 0; i < 10; i++) {
    particles.push({
      baseX: CX - 50 + Math.random() * 100,
      baseY: imageH * 0.35 + Math.random() * (imageH * 0.4),
      size: 1 + Math.random() * 3.5,
      color: 'rgba(0,215,205,' + (0.04 + Math.random() * 0.08) + ')',
      ampX: 2 + Math.random() * 5,
      ampY: 1.5 + Math.random() * 4,
      durationX: 4000 + Math.random() * 5000,
      durationY: 3500 + Math.random() * 4500,
      animX: new Animated.Value(Math.random()),
      animY: new Animated.Value(Math.random()),
      animOpacity: new Animated.Value(0.02 + Math.random() * 0.04),
      minOpacity: 0.01 + Math.random() * 0.03,
      maxOpacity: 0.05 + Math.random() * 0.1,
      pulseDuration: 3000 + Math.random() * 5000,
      layer: 'front',
    });
  }

  // ============================================
  // GROUPE 6 : DERRIÈRE LA TÊTE (15 particules)
  // Mix de toutes les couleurs — autour du contour
  // de la tête, dans le halo. Moyennement visibles.
  // Comblent l'espace entre le visage et les bords
  // ============================================
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 35 + Math.random() * 55;
    const colors = [
      'rgba(0,200,200,' + (0.06 + Math.random() * 0.15) + ')',
      'rgba(170,130,200,' + (0.05 + Math.random() * 0.12) + ')',
      'rgba(200,220,90,' + (0.05 + Math.random() * 0.12) + ')',
      'rgba(0,220,170,' + (0.06 + Math.random() * 0.14) + ')',
    ];
    particles.push({
      baseX: CX + Math.cos(angle) * dist,
      baseY: CY + Math.sin(angle) * dist * 0.8,
      size: 2 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      ampX: 3 + Math.random() * 6,
      ampY: 2 + Math.random() * 5,
      durationX: 3500 + Math.random() * 4500,
      durationY: 3000 + Math.random() * 4000,
      animX: new Animated.Value(Math.random()),
      animY: new Animated.Value(Math.random()),
      animOpacity: new Animated.Value(0.04 + Math.random() * 0.08),
      minOpacity: 0.02 + Math.random() * 0.06,
      maxOpacity: 0.1 + Math.random() * 0.2,
      pulseDuration: 2500 + Math.random() * 4000,
      layer: 'back',
    });
  }

  // ============================================
  // GROUPE 7 : FOND GÉNÉRAL (30 particules)
  // Éparpillées sur TOUT l'espace — coins, bords, partout
  // Toutes couleurs (cyan, violet, jaune, blanc, vert, rose)
  // Grosses et petites mélangées
  // Remplissent les zones vides pour que rien ne soit mort
  // ============================================
  for (let i = 0; i < 30; i++) {
    const colors = [
      'rgba(0,200,210,' + (0.03 + Math.random() * 0.1) + ')',
      'rgba(180,135,210,' + (0.02 + Math.random() * 0.08) + ')',
      'rgba(210,225,90,' + (0.02 + Math.random() * 0.08) + ')',
      'rgba(255,255,255,' + (0.02 + Math.random() * 0.06) + ')',
      'rgba(0,225,175,' + (0.03 + Math.random() * 0.09) + ')',
      'rgba(210,155,185,' + (0.02 + Math.random() * 0.07) + ')',
      'rgba(100,200,230,' + (0.03 + Math.random() * 0.08) + ')',
    ];
    particles.push({
      baseX: Math.random() * screenW,
      baseY: Math.random() * imageH,
      size: 1.5 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      ampX: 3 + Math.random() * 10,
      ampY: 3 + Math.random() * 8,
      durationX: 4500 + Math.random() * 7000,
      durationY: 4500 + Math.random() * 6000,
      animX: new Animated.Value(Math.random()),
      animY: new Animated.Value(Math.random()),
      animOpacity: new Animated.Value(0.02 + Math.random() * 0.05),
      minOpacity: 0.01 + Math.random() * 0.03,
      maxOpacity: 0.06 + Math.random() * 0.12,
      pulseDuration: 4000 + Math.random() * 6000,
      layer: 'back',
    });
  }

  return particles;
};

// ============================================
// ALIXEN HEADER — Visage de particules vivantes
// ============================================
const AlixenHeader = () => {
  const IMAGE_HEIGHT = SCREEN_WIDTH * 0.55;
  const CX = SCREEN_WIDTH / 2;
  const CY = IMAGE_HEIGHT / 2;

  const particles = useRef(
    generateParticles(CX, CY, SCREEN_WIDTH, IMAGE_HEIGHT)
  ).current;

  useEffect(() => {
    particles.forEach((p) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p.animX, {
            toValue: 1,
            duration: p.durationX,
            useNativeDriver: true,
          }),
          Animated.timing(p.animX, {
            toValue: 0,
            duration: p.durationX,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(p.animY, {
            toValue: 1,
            duration: p.durationY,
            useNativeDriver: true,
          }),
          Animated.timing(p.animY, {
            toValue: 0,
            duration: p.durationY,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(p.animOpacity, {
            toValue: p.maxOpacity,
            duration: p.pulseDuration,
            useNativeDriver: true,
          }),
          Animated.timing(p.animOpacity, {
            toValue: p.minOpacity,
            duration: p.pulseDuration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={{
      width: SCREEN_WIDTH,
      height: IMAGE_HEIGHT + 30,
      backgroundColor: '#080E18',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* FOND SOMBRE BLEU-NUIT */}
      <View style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#080E18',
      }} />

      {/* LUEUR AMBIANTE — plus grande, plus visible */}
      <View style={{
        position: 'absolute',
        top: CY - 60,
        left: CX - 80,
        width: 160,
        height: 120,
        borderRadius: 80,
        backgroundColor: 'rgba(0,200,180,0.06)',
      }} />

      {/* LUEUR DU CERVEAU — plus intense */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: CX - 55,
        width: 110,
        height: 65,
        borderRadius: 55,
        backgroundColor: 'rgba(180,220,60,0.045)',
      }} />

      {/* LUEUR VIOLETTE côté droit */}
      <View style={{
        position: 'absolute',
        top: CY - 30,
        right: 10,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(170,130,200,0.03)',
      }} />

      {/* PARTICULES BACK — derrière l'image */}
      {particles.filter(p => p.layer === 'back').map((p, i) => (
        <Animated.View
          key={`back-${i}`}
          style={{
            position: 'absolute',
            left: p.baseX,
            top: p.baseY,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: p.color,
            opacity: p.animOpacity,
            transform: [
              {
                translateX: p.animX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-p.ampX, p.ampX],
                }),
              },
              {
                translateY: p.animY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-p.ampY, p.ampY],
                }),
              },
            ],
          }}
        />
      ))}

      {/* IMAGE ALIXEN */}
      <Image
        source={require('./assets/alixen-header.png')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: IMAGE_HEIGHT,
        }}
        resizeMode="contain"
      />

      {/* PARTICULES FRONT — devant l'image */}
      {particles.filter(p => p.layer === 'front').map((p, i) => (
        <Animated.View
          key={`front-${i}`}
          style={{
            position: 'absolute',
            left: p.baseX,
            top: p.baseY,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: p.color,
            opacity: p.animOpacity,
            transform: [
              {
                translateX: p.animX.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-p.ampX, p.ampX],
                }),
              },
              {
                translateY: p.animY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-p.ampY, p.ampY],
                }),
              },
            ],
          }}
        />
      ))}

      {/* NOM ALIXEN */}
      <View style={{
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}>
        <Text style={{
          color: 'rgba(0,220,190,0.5)',
          fontSize: 11,
          fontWeight: 'bold',
          letterSpacing: 5,
        }}>
          ALIXEN
        </Text>
        <Text style={{
          color: 'rgba(0,200,170,0.2)',
          fontSize: 7,
          letterSpacing: 2,
          marginTop: 1,
        }}>
          ESPRIT BIENVEILLANT
        </Text>
      </View>

      {/* COURBE DE SÉPARATION */}
      <View style={{
        position: 'absolute',
        bottom: -15,
        left: -10,
        right: -10,
        height: 30,
        borderTopLeftRadius: 200,
        borderTopRightRadius: 200,
        backgroundColor: '#020405',
      }} />
    </View>
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

  // Modal message complet (réseau synaptique)
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Recherche dans les messages
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(-1);

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
      _isNew: true,
    }]);
  }, []);

  const loadUserData = async () => {
    try {
      const profileRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users_profile?id=eq.${TEST_USER_ID}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const profileData = await profileRes.json();
      if (profileData.length > 0) setUserProfile(profileData[0]);

      const today = new Date().toISOString().split('T')[0];
      const summaryRes = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_summary?user_id=eq.${TEST_USER_ID}&date=eq.${today}&select=*`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
      );
      const summaryData = await summaryRes.json();
      if (summaryData.length > 0) setTodaySummary(summaryData[0]);

      generateGreeting(profileData[0], summaryData[0]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      addBotMessage("Bonjour ! Je suis ALIXEN, votre coach nutritionniste IA personnel. Comment puis-je vous aider aujourd'hui ?");
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
        greeting = `${timeGreeting} ${name} ! Ravi de vous revoir dans votre espace santé. \uD83D\uDC4B\n\nJe remarque que vous n'avez encore rien mangé aujourd'hui... Tout va bien ?\n\nN'oubliez pas que sauter des repas n'est jamais bon pour le métabolisme. Même un fruit ou un yaourt, c'est mieux que rien. \uD83C\uDF4E`;
      } else {
        greeting = `Bienvenue ${name} dans votre espace santé intelligent ! \uD83D\uDC4B\n\nJe suis ALIXEN, votre coach nutritionniste IA personnel. Ici, tout est confidentiel et pensé pour votre bien-être.\n\nParlez-moi de vos objectifs santé, je suis tout ouïe.`;
      }
    } else {
      const calories = summary.total_calories || 0;
      const tdee = profile?.tdee || 2000;
      const percentage = Math.round((calories / tdee) * 100);

      greeting = `${timeGreeting} ${name} ! Content de vous revoir. \uD83D\uDC4B\n\nJ'ai jeté un œil à vos données du jour depuis votre espace santé : vous êtes à ${calories} kcal sur ${tdee} kcal (${percentage}%).\n\n`;

      if (percentage < 30 && hour > 14) {
        greeting += `C'est un peu bas pour cette heure-ci. Vous avez prévu de manger bientôt ? \uD83E\uDD14`;
      } else if (percentage > 100) {
        greeting += `Vous avez dépassé votre objectif calorique aujourd'hui. Ce n'est pas grave si c'est occasionnel ! On en discute ? \uD83D\uDE0A`;
      } else {
        greeting += `Vous êtes bien parti ! De quoi voulez-vous qu'on parle ? \uD83D\uDE0A`;
      }
    }

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: greeting,
      timestamp: new Date(),
      _isNew: true,
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

  // ── Modal message (balle pressée) ──────────────────────────────────────
  const handleBallPress = (message, index) => {
    setSelectedMessage({ ...message, index });
  };

  const closeModal = () => {
    setSelectedMessage(null);
  };

  // ── Recherche dans les messages ────────────────────────────────────────
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setSearchIndex(-1);
      return;
    }
    const results = [];
    messages.forEach((msg, i) => {
      if (msg.content.toLowerCase().includes(query.toLowerCase())) {
        results.push(i);
      }
    });
    setSearchResults(results);
    setSearchIndex(results.length > 0 ? 0 : -1);
  };

  const navigateSearch = (direction) => {
    if (searchResults.length === 0) return;
    const newIndex = (searchIndex + direction + searchResults.length) % searchResults.length;
    setSearchIndex(newIndex);
  };

  // ── Envoi de message et appel IA ─────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
      _isNew: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const userContext = buildUserContext();

      const chatHistory = [...messages, userMessage]
        .slice(-20)
        .map(m => ({ role: m.role, content: m.content }));

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
        addBotMessage("Désolé, j'ai atteint la limite de tokens pour aujourd'hui. Revenez demain ou utilisez des Lix pour continuer. \uD83D\uDD0B");
      } else {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || data.content?.[0]?.text || "Hmm, je n'ai pas pu traiter votre message. Réessayez ?",
          timestamp: new Date(),
          _isNew: true,
        };
        setMessages(prev => [...prev, botMessage]);
        if (data.tokens_used) setTokenUsed(prev => prev + data.tokens_used);
      }
    } catch (error) {
      console.error('Erreur ALIXEN:', error);
      addBotMessage("Oups, une erreur est survenue. Vérifiez votre connexion et réessayez. \uD83D\uDD04");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Fond métallique avec particules */}
      <MetalParticleBackground />

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
            ESPACE SANT{'\u00C9'} INTELLIGENT
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
          <Text style={{ color: '#00D984', fontSize: 11 }}>{'\uD83D\uDFE2'} En ligne</Text>
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
            {'\u26A1'} {'\u00C9'}NERGIE DISPONIBLE
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
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 10, paddingHorizontal: 8 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {/* ZONE ALIXEN — Visage de particules vivantes */}
          <AlixenHeader />

          {/* OUTILS MediBook + Secret Pocket */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <TouchableOpacity onPress={() => addBotMessage("Le MediBook sera disponible prochainement. \uD83D\uDCCB")}
              style={{ backgroundColor: 'rgba(0,217,132,0.04)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)', paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, marginRight: 4 }}>{'\uD83D\uDCCB'}</Text>
              <Text style={{ color: 'rgba(0,217,132,0.6)', fontSize: 8, fontWeight: 'bold' }}>MediBook</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addBotMessage("Le Secret Pocket sera disponible prochainement. \uD83D\uDD10")}
              style={{ backgroundColor: 'rgba(255,180,0,0.03)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,180,0,0.1)', paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, marginRight: 4 }}>{'\uD83D\uDD10'}</Text>
              <Text style={{ color: 'rgba(255,180,0,0.6)', fontSize: 8, fontWeight: 'bold' }}>Secret Pocket</Text>
            </TouchableOpacity>
          </View>

          {/* RÉSEAU DE BALLES MÉTALLIQUES */}
          <SynapticNetwork
            messages={messages}
            highlightedIndices={searchResults.length > 0 && searchIndex >= 0 ? [searchResults[searchIndex]] : []}
            onBallPress={handleBallPress}
          />

          {/* BALLE D'ATTENTE si ALIXEN réfléchit */}
          {isTyping && (
            <View style={{ marginLeft: PADDING_H }}>
              <WaitingBall />
            </View>
          )}

          {/* LÉGENDE */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#252A30', borderWidth: 1, borderColor: 'rgba(232,64,64,0.4)' }} />
              <Text style={{ color: '#555', fontSize: 7 }}>ALIXEN</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#252A30', borderWidth: 1, borderColor: 'rgba(77,166,255,0.4)' }} />
              <Text style={{ color: '#555', fontSize: 7 }}>Vous</Text>
            </View>
          </View>

          {/* Résultat de recherche */}
          {searchResults.length > 0 && searchIndex >= 0 && (
            <Text style={{ textAlign: 'center', color: 'rgba(77,166,255,0.5)', fontSize: 8, marginTop: 4 }}>
              Balle #{searchResults[searchIndex] + 1} — {searchIndex + 1}/{searchResults.length}
            </Text>
          )}
          {searchQuery.trim() !== '' && searchResults.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#444', fontSize: 8, marginTop: 4 }}>
              Aucun résultat
            </Text>
          )}
        </ScrollView>

        {/* ===== BARRE DE SAISIE + RECHERCHE ===== */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 4,
          paddingHorizontal: 8, paddingVertical: 6,
          backgroundColor: 'rgba(3,4,6,0.97)',
          borderTopWidth: 1, borderTopColor: 'rgba(74,79,85,0.15)',
        }}>
          {/* Barre recherche */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center',
            backgroundColor: 'rgba(10,14,22,0.9)', borderRadius: 14,
            borderWidth: 1, borderColor: 'rgba(77,166,255,0.1)',
            paddingHorizontal: 8, paddingVertical: Platform.OS === 'ios' ? 7 : 4,
          }}>
            <TextInput
              style={{ flex: 1, color: '#4DA6FF', fontSize: 10, paddingVertical: 0 }}
              placeholder="Chercher..."
              placeholderTextColor="rgba(77,166,255,0.2)"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TouchableOpacity onPress={() => navigateSearch(-1)} style={{ paddingHorizontal: 3 }}>
              <Text style={{ color: 'rgba(77,166,255,0.4)', fontSize: 10 }}>{'\u25C0'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateSearch(1)} style={{ paddingHorizontal: 3 }}>
              <Text style={{ color: 'rgba(77,166,255,0.4)', fontSize: 10 }}>{'\u25B6'}</Text>
            </TouchableOpacity>
          </View>

          {/* Barre message */}
          <View style={{ flex: 1,
            backgroundColor: 'rgba(10,14,22,0.9)', borderRadius: 14,
            borderWidth: 1, borderColor: 'rgba(0,217,132,0.1)',
            paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 7 : 4,
          }}>
            <TextInput
              ref={inputRef}
              style={{ color: '#FFF', fontSize: 10, paddingVertical: 0, maxHeight: 60 }}
              placeholder="Consultez ALIXEN..."
              placeholderTextColor="rgba(255,255,255,0.15)"
              selectionColor="#00D984"
              value={inputText}
              onChangeText={setInputText}
              multiline
              blurOnSubmit={false}
            />
          </View>

          {/* Bouton envoyer */}
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: inputText.trim() ? '#00D984' : 'rgba(0,217,132,0.08)',
              borderWidth: inputText.trim() ? 0 : 1,
              borderColor: 'rgba(0,217,132,0.15)',
              justifyContent: 'center', alignItems: 'center',
              shadowColor: inputText.trim() ? '#00D984' : 'transparent',
              shadowOpacity: 0.3, shadowRadius: 6, elevation: inputText.trim() ? 4 : 0,
            }}
          >
            <Text style={{ color: inputText.trim() ? '#000' : 'rgba(0,217,132,0.3)', fontSize: 12, fontWeight: 'bold' }}>{'\u27A4'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ===== BOTTOM TAB BAR ===== */}
      {!keyboardVisible && (
        <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
      )}

      {/* === MODAL MESSAGE COMPLET (réseau synaptique métallique) === */}
      {selectedMessage && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.88)',
          justifyContent: 'center', alignItems: 'center', zIndex: 200,
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={closeModal} activeOpacity={1}
          />
          <View style={{
            backgroundColor: '#0D1118',
            borderRadius: 20,
            padding: 16,
            width: SCREEN_WIDTH * 0.92,
            maxHeight: SCREEN_HEIGHT * 0.65,
            borderWidth: 1.5,
            borderColor: selectedMessage.role === 'assistant'
              ? 'rgba(232,64,64,0.3)' : 'rgba(77,166,255,0.3)',
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectedMessage.role === 'assistant' ? (
                  <>
                    <Image source={require('./assets/lixman-avatar.png')}
                      style={{ width: 22, height: 22, borderRadius: 11, marginRight: 8, borderWidth: 1, borderColor: '#E84040' }}
                      resizeMode="cover" />
                    <Text style={{ color: '#E84040', fontSize: 12, fontWeight: 'bold' }}>ALIXEN</Text>
                  </>
                ) : (
                  <Text style={{ color: '#4DA6FF', fontSize: 12, fontWeight: 'bold' }}>{'\uD83D\uDC64'} Vous</Text>
                )}
                <Text style={{ color: '#333', fontSize: 9, marginLeft: 8 }}>#{selectedMessage.index + 1}</Text>
              </View>
              <TouchableOpacity onPress={closeModal}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#222' }}>
                <Text style={{ color: '#555', fontSize: 10 }}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Contenu scrollable */}
            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.45 }}>
              {selectedMessage.role === 'assistant' ? (
                <FormattedText
                  text={selectedMessage.content}
                  style={{ color: '#D0D0D0', fontSize: 13, lineHeight: 21 }}
                  onRecipePress={(name) => { closeModal(); handleRecipePress(name); }}
                />
              ) : (
                <Text style={{ color: '#D0D0D0', fontSize: 13, lineHeight: 21 }}>
                  {selectedMessage.content}
                </Text>
              )}
            </ScrollView>

            {/* Heure */}
            <Text style={{ color: '#333', fontSize: 8, marginTop: 8, textAlign: 'right' }}>
              {selectedMessage.timestamp
                ? new Date(selectedMessage.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : ''}
            </Text>
          </View>
        </View>
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
            {/* Avatar ALIXEN */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={require('./assets/lixman-avatar.png')}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#00D984' }}
                resizeMode="cover"
              />
              <Text style={{ color: '#00D984', fontSize: 14, fontWeight: 'bold' }}>ALIXEN</Text>
            </View>

            {/* Message */}
            <Text style={{ color: '#E0E0E0', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
              Tu veux voir la recette "{recipeModal.name}" dans la section Repas ? {'\uD83C\uDF7D\uFE0F'}
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
