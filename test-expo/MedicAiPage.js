// ──────────────────────────────────────────────────────────────────────────────
// MedicAiPage.js — LIXUM MedicAi : Réseau Synaptique à Balles Métalliques
// Redesign : Fond PCB, ALIXEN cerveau, circuits, dossiers métal, boules 3 états
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
// FOND PCB (Circuits imprimés)
// ============================================
const PCBBackground = () => {
  return (
    <View style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#0a0e14',
    }}>
      {/* Grille verticale fine */}
      {Array.from({ length: Math.ceil(SCREEN_WIDTH / 12) }, (_, i) => (
        <View key={`gv-${i}`} style={{
          position: 'absolute',
          left: i * 12,
          top: 0,
          width: 0.3,
          height: '100%',
          backgroundColor: 'rgba(0,217,132,0.015)',
        }} />
      ))}
      {/* Grille horizontale fine */}
      {Array.from({ length: 50 }, (_, i) => (
        <View key={`gh-${i}`} style={{
          position: 'absolute',
          top: i * 12,
          left: 0,
          height: 0.3,
          width: '100%',
          backgroundColor: 'rgba(0,217,132,0.015)',
        }} />
      ))}
    </View>
  );
};

// ============================================
// ALIXEN BRAIN — Cerveau dans bulle métallique
// ============================================
const AlixenBrain = () => {
  const pulseAnim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 2000, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
      {/* Bulle métallique du cerveau */}
      <View style={{
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#252A30',
        borderWidth: 1.5,
        borderColor: '#4A4F55',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00D984',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
      }}>
        {/* Reflet métallique */}
        <View style={{
          position: 'absolute',
          top: 3,
          left: 8,
          width: 28,
          height: 16,
          borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.06)',
          transform: [{ rotate: '-15deg' }],
        }} />

        {/* Image du cerveau (lixman-avatar.png) */}
        <Image
          source={require('./assets/lixman-avatar.png')}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          resizeMode="cover"
        />

        {/* Anneau vert externe animé */}
        <Animated.View style={{
          position: 'absolute',
          top: -3,
          left: -3,
          right: -3,
          bottom: -3,
          borderRadius: 38,
          borderWidth: 0.5,
          borderColor: 'rgba(0,217,132,0.3)',
          opacity: pulseAnim,
        }} />
      </View>
    </View>
  );
};

// ============================================
// CIRCUITS DE CONNEXION (Y-split)
// ============================================
const CircuitConnectors = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: false })
    ).start();
  }, []);

  const dotOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0.2, 0.6, 0.2, 0.6, 0.2],
  });

  return (
    <View style={{ alignItems: 'center', marginBottom: 2 }}>
      {/* Ligne verticale depuis ALIXEN */}
      <View style={{ width: 1.5, height: 18, backgroundColor: 'rgba(0,217,132,0.15)' }} />

      {/* Point de jonction central (gros, pulsant) */}
      <Animated.View style={{
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: 'rgba(0,217,132,0.4)',
        opacity: dotOpacity,
        marginVertical: 1,
      }} />

      {/* Branches horizontales + verticales vers MediBook et SecretPocket */}
      <View style={{
        flexDirection: 'row',
        width: SCREEN_WIDTH - 40,
        height: 25,
        position: 'relative',
      }}>
        {/* Ligne horizontale gauche */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: 1.5,
          backgroundColor: 'rgba(0,217,132,0.12)',
        }} />
        {/* Ligne verticale gauche */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1.5,
          height: 25,
          backgroundColor: 'rgba(0,217,132,0.12)',
        }} />
        {/* Point en bas à gauche */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: -2,
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: 'rgba(0,217,132,0.3)',
        }} />

        {/* Ligne horizontale droite */}
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: 1.5,
          backgroundColor: 'rgba(0,217,132,0.12)',
        }} />
        {/* Ligne verticale droite */}
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 1.5,
          height: 25,
          backgroundColor: 'rgba(212,175,55,0.12)',
        }} />
        {/* Point en bas à droite */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: -2,
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: 'rgba(212,175,55,0.3)',
        }} />

        {/* POINT LUMINEUX QUI VOYAGE à gauche */}
        <Animated.View style={{
          position: 'absolute',
          top: -2,
          left: pulseAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['48%', '0%', '48%'],
          }),
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: '#00D984',
          opacity: dotOpacity,
        }} />

        {/* POINT LUMINEUX QUI VOYAGE à droite */}
        <Animated.View style={{
          position: 'absolute',
          top: -2,
          right: pulseAnim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['48%', '0%', '48%'],
          }),
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: '#D4AF37',
          opacity: dotOpacity,
        }} />
      </View>
    </View>
  );
};

// ============================================
// DOSSIER MÉTALLIQUE
// ============================================
const MetalFolder = ({ title, subtitle, borderColor, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#1e2228',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderColor,
    padding: 8,
    alignItems: 'center',
  }}>
    {/* Tab métallique */}
    <View style={{
      position: 'absolute',
      top: -4,
      width: 35,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.03)',
    }} />
    {/* Reflet */}
    <View style={{
      position: 'absolute',
      top: 2,
      left: 4,
      right: 4,
      height: 10,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.02)',
    }} />
    <Text style={{ color: borderColor.replace('0.3', '0.6'), fontSize: 12, fontWeight: 'bold' }}>{title}</Text>
    <Text style={{ color: '#555', fontSize: 8, marginTop: 1 }}>{subtitle}</Text>
  </TouchableOpacity>
);

// ============================================
// BALLE MÉTALLIQUE — 3 états : loading, unread, read
// ============================================
const MetalBall = ({ index, isBot, onPress, isHighlighted, isNew, status }) => {
  const scaleAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const wobbleAnim = useRef(new Animated.Value(0)).current;
  const loadPulse = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    if (isNew) {
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }).start();
    }
    const dur = 3000 + (index % 5) * 500;
    Animated.loop(Animated.sequence([
      Animated.timing(wobbleAnim, { toValue: 1, duration: dur / 2, useNativeDriver: true }),
      Animated.timing(wobbleAnim, { toValue: 0, duration: dur / 2, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      Animated.loop(Animated.sequence([
        Animated.timing(loadPulse, { toValue: 0.8, duration: 500, useNativeDriver: false }),
        Animated.timing(loadPulse, { toValue: 0.2, duration: 500, useNativeDriver: false }),
      ])).start();
    } else {
      loadPulse.setValue(1);
    }
  }, [status]);

  const wobbleY = wobbleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] });

  // Couleurs selon status
  let borderColor, glowColor;
  if (status === 'loading') {
    borderColor = loadPulse.interpolate({
      inputRange: [0.2, 0.8],
      outputRange: ['rgba(0,217,132,0.15)', 'rgba(0,217,132,0.6)'],
    });
    glowColor = '#00D984';
  } else if (status === 'unread') {
    borderColor = '#00D984';
    glowColor = '#00D984';
  } else {
    borderColor = isBot ? 'rgba(232,64,64,0.4)' : 'rgba(77,166,255,0.4)';
    glowColor = isBot ? '#E84040' : '#4DA6FF';
  }

  const BALL_SZ = 34;

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }, { translateY: wobbleY }],
    }}>
      <Pressable onPress={() => { if (status !== 'loading') onPress(); }}>
        <Animated.View style={{
          width: BALL_SZ,
          height: BALL_SZ,
          borderRadius: BALL_SZ / 2,
          backgroundColor: '#252A30',
          borderWidth: status === 'loading' ? 1.5 : 1,
          borderColor: borderColor,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: status === 'loading' || status === 'unread' ? 0.4 : 0.15,
          shadowRadius: status === 'loading' || status === 'unread' ? 8 : 4,
          elevation: status === 'loading' || status === 'unread' ? 6 : 3,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          {/* Reflet métallique */}
          <View style={{
            position: 'absolute', top: 2, left: BALL_SZ * 0.15,
            width: BALL_SZ * 0.45, height: BALL_SZ * 0.3,
            borderRadius: BALL_SZ * 0.2,
            backgroundColor: 'rgba(255,255,255,0.07)',
            transform: [{ rotate: '-15deg' }],
          }} />

          {/* Bordure extérieure métal */}
          <View style={{
            position: 'absolute', top: 1, left: 1, right: 1, bottom: 1,
            borderRadius: BALL_SZ / 2,
            borderWidth: 0.3,
            borderColor: 'rgba(74,79,85,0.3)',
          }} />

          {/* Contenu : numéro ou indicateur loading */}
          {status === 'loading' ? (
            <Animated.View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#00D984',
              opacity: loadPulse,
            }} />
          ) : (
            <Text style={{
              color: status === 'unread' ? '#00D984' : (isBot ? 'rgba(232,64,64,0.6)' : 'rgba(77,166,255,0.6)'),
              fontSize: 11,
              fontWeight: 'bold',
            }}>
              {index + 1}
            </Text>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================
// RÉSEAU SYNAPTIQUE EN S — Circuit neural
// ============================================
const BALLS_PER_ROW = 8;
const BALL_SIZE = 34;
const BALL_GAP = 2;
const GAP = BALL_SIZE + BALL_GAP; // = 36
const ROW_SPACING = 16;
const TOTAL_BALLS_WIDTH = BALLS_PER_ROW * GAP;
const PADDING_H = (SCREEN_WIDTH - TOTAL_BALLS_WIDTH) / 2;

const getBallPosition = (index) => {
  const row = Math.floor(index / BALLS_PER_ROW);
  const col = index % BALLS_PER_ROW;
  const isReversed = row % 2 === 1;
  const actualCol = isReversed ? (BALLS_PER_ROW - 1 - col) : col;
  const x = PADDING_H + actualCol * GAP;
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
              status={msg._status || 'read'}
              onPress={() => onBallPress(msg, i)}
            />
          </View>
        );
      })}
    </View>
  );
};

// ============================================
// SABLIER — Remplace la barre d'énergie
// ============================================
const HourglassTimer = ({ tokensUsed, tokenLimit }) => {
  const sandAnim = useRef(new Animated.Value(0)).current;

  const usagePercent = Math.min(tokensUsed / tokenLimit, 1);
  const isExpired = usagePercent >= 1;

  useEffect(() => {
    if (!isExpired) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sandAnim, { toValue: 1, duration: 4000, useNativeDriver: false }),
          Animated.timing(sandAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      ).start();
    }
  }, [isExpired]);

  const GLASS_W = 28;
  const GLASS_H = 44;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: GLASS_W,
        height: GLASS_H,
        position: 'relative',
        alignItems: 'center',
      }}>
        {/* Cadre haut */}
        <View style={{
          width: GLASS_W,
          height: 3,
          backgroundColor: '#4A4F55',
          borderRadius: 1.5,
        }} />

        {/* Partie haute (sable qui descend = tokens restants) */}
        <View style={{
          width: GLASS_W - 6,
          height: GLASS_H * 0.4,
          overflow: 'hidden',
          alignItems: 'center',
        }}>
          <View style={{
            width: '100%',
            height: '100%',
            borderBottomLeftRadius: GLASS_W * 0.4,
            borderBottomRightRadius: GLASS_W * 0.4,
            backgroundColor: 'rgba(30,35,42,0.6)',
            borderWidth: 0.5,
            borderColor: 'rgba(74,79,85,0.4)',
            overflow: 'hidden',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              width: '100%',
              height: `${Math.max((1 - usagePercent) * 100, 0)}%`,
              backgroundColor: isExpired ? 'rgba(232,64,64,0.3)' : 'rgba(0,217,132,0.25)',
              borderBottomLeftRadius: GLASS_W * 0.3,
              borderBottomRightRadius: GLASS_W * 0.3,
            }} />
          </View>
        </View>

        {/* Goulot */}
        <View style={{
          width: 4,
          height: 4,
          backgroundColor: 'rgba(0,217,132,0.15)',
          borderRadius: 2,
        }} />

        {/* Partie basse (sable qui s'accumule = tokens utilisés) */}
        <View style={{
          width: GLASS_W - 6,
          height: GLASS_H * 0.4,
          overflow: 'hidden',
          alignItems: 'center',
        }}>
          <View style={{
            width: '100%',
            height: '100%',
            borderTopLeftRadius: GLASS_W * 0.4,
            borderTopRightRadius: GLASS_W * 0.4,
            backgroundColor: 'rgba(30,35,42,0.6)',
            borderWidth: 0.5,
            borderColor: 'rgba(74,79,85,0.4)',
            overflow: 'hidden',
            justifyContent: 'flex-end',
          }}>
            <View style={{
              width: '100%',
              height: `${usagePercent * 100}%`,
              backgroundColor: isExpired ? 'rgba(232,64,64,0.3)' : 'rgba(0,217,132,0.2)',
              borderTopLeftRadius: GLASS_W * 0.2,
              borderTopRightRadius: GLASS_W * 0.2,
            }} />
          </View>
        </View>

        {/* Cadre bas */}
        <View style={{
          width: GLASS_W,
          height: 3,
          backgroundColor: '#4A4F55',
          borderRadius: 1.5,
        }} />
      </View>

      {/* Compteur texte */}
      <Text style={{
        color: isExpired ? 'rgba(232,64,64,0.5)' : 'rgba(0,217,132,0.4)',
        fontSize: 7,
        marginTop: 3,
        fontWeight: 'bold',
      }}>
        {tokenLimit - tokensUsed > 0 ? `${tokenLimit - tokensUsed}` : '\u00C9PUIS\u00C9'}
      </Text>
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
      _status: 'unread',
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
      _status: 'unread',
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

  // ── Modal message (balle pressée) — marque comme lu ──────────────────────
  const handleBallPress = (message, index) => {
    if (message._status === 'loading') return;
    setSelectedMessage({ ...message, index });
    if (message._status === 'unread') {
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, _status: 'read' } : m
      ));
    }
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

  // ── Envoi de message et appel IA (cycle loading → unread → read) ────────
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const userText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
      _isNew: true,
      _status: 'read',
    };

    const botMsgId = (Date.now() + 1).toString();
    const botMsgLoading = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      _isNew: true,
      _status: 'loading',
    };

    setMessages(prev => [...prev, userMsg, botMsgLoading]);

    try {
      const context = buildUserContext();
      const messagesToSend = [...messages, userMsg]
        .map(m => ({ role: m.role, content: m.content }))
        .filter(m => m.content);

      const response = await fetch(
        SUPABASE_URL + '/functions/v1/lixman-chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ messages: messagesToSend, userId: TEST_USER_ID, userContext: context }),
        }
      );

      const data = await response.json();

      if (data.message) {
        setMessages(prev => prev.map(m =>
          m.id === botMsgId ? { ...m, content: data.message, _status: 'unread' } : m
        ));
        if (data.tokens_used) setTokenUsed(prev => prev + data.tokens_used);
      } else {
        setMessages(prev => prev.map(m =>
          m.id === botMsgId ? { ...m, content: data.error || "Désolé, erreur de connexion.", _status: 'unread' } : m
        ));
      }
    } catch (error) {
      console.error('Erreur ALIXEN:', error);
      setMessages(prev => prev.map(m =>
        m.id === botMsgId ? { ...m, content: "Erreur réseau. Vérifiez votre connexion.", _status: 'unread' } : m
      ));
    }
    setIsLoading(false);
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {/* Fond PCB avec grille de circuits */}
      <PCBBackground />

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

      {/* ===== PRÉSENTATION ALIXEN (remplace la barre énergie) ===== */}
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(10,14,20,0.8)',
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,217,132,0.08)',
      }}>
        <Text style={{
          color: 'rgba(0,217,132,0.5)',
          fontSize: 12,
          fontWeight: 'bold',
          letterSpacing: 6,
          textAlign: 'center',
        }}>
          ALIXEN
        </Text>
        <Text style={{
          color: 'rgba(0,217,132,0.2)',
          fontSize: 7,
          letterSpacing: 2.5,
          textAlign: 'center',
          marginTop: 1,
        }}>
          ESPACE SANT{'\u00C9'} INTELLIGENT
        </Text>
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
          {/* ALIXEN Brain — Cerveau dans bulle métallique */}
          <AlixenBrain />

          {/* Circuits de connexion vers les dossiers */}
          <CircuitConnectors />

          {/* Dossiers métalliques + Sablier au centre */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 6, alignItems: 'center' }}>
            <MetalFolder
              title="MediBook"
              subtitle="Dossier médical"
              borderColor="rgba(0,217,132,0.3)"
              onPress={() => addBotMessage("Le MediBook sera disponible prochainement. \uD83D\uDCCB")}
            />

            {/* SABLIER AU CENTRE */}
            <View style={{ marginHorizontal: 6 }}>
              <HourglassTimer tokensUsed={tokenUsed} tokenLimit={tokenLimit} />
            </View>

            <MetalFolder
              title="Secret Pocket"
              subtitle="Coffre-fort santé"
              borderColor="rgba(212,175,55,0.3)"
              onPress={() => addBotMessage("Le Secret Pocket sera disponible prochainement. \uD83D\uDD10")}
            />
          </View>

          {/* Circuit descendant des dossiers vers les boules */}
          <View style={{ alignItems: 'center', marginBottom: 4 }}>
            <View style={{ width: 1.5, height: 14, backgroundColor: 'rgba(0,217,132,0.1)' }} />
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,217,132,0.25)' }} />
          </View>

          {/* RÉSEAU DE BALLES MÉTALLIQUES EN S */}
          <SynapticNetwork
            messages={messages}
            highlightedIndices={searchResults.length > 0 && searchIndex >= 0 ? [searchResults[searchIndex]] : []}
            onBallPress={handleBallPress}
          />

          {/* LÉGENDE */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#252A30', borderWidth: 1, borderColor: 'rgba(232,64,64,0.4)' }} />
              <Text style={{ color: '#555', fontSize: 9 }}>ALIXEN</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#252A30', borderWidth: 1, borderColor: 'rgba(77,166,255,0.4)' }} />
              <Text style={{ color: '#555', fontSize: 9 }}>Vous</Text>
            </View>
          </View>

          {/* Résultat de recherche */}
          {searchResults.length > 0 && searchIndex >= 0 && (
            <Text style={{ textAlign: 'center', color: 'rgba(77,166,255,0.4)', fontSize: 8, marginTop: 3 }}>
              Boule #{searchResults[searchIndex] + 1} — {searchIndex + 1}/{searchResults.length}
            </Text>
          )}
          {searchQuery.trim() !== '' && searchResults.length === 0 && (
            <Text style={{ textAlign: 'center', color: '#444', fontSize: 8, marginTop: 4 }}>
              Aucun résultat
            </Text>
          )}
        </ScrollView>

        {/* ===== CARTE MÉTALLIQUE DE SAISIE ===== */}
        <View style={{
          marginHorizontal: 6,
          marginBottom: 4,
          paddingHorizontal: 8,
          paddingVertical: 8,
          backgroundColor: '#1A1D22',
          borderRadius: 14,
          borderWidth: 0.8,
          borderColor: '#4A4F55',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 4,
        }}>
          {/* Reflet métallique en haut de la carte */}
          <View style={{
            position: 'absolute',
            top: 2,
            left: 8,
            right: 8,
            height: 10,
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.02)',
          }} />

          {/* LIGNE DU HAUT : Recherche (gauche) + Upload (droite) */}
          <View style={{ flexDirection: 'row', marginBottom: 6, gap: 6 }}>
            {/* Recherche — haut gauche */}
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(45,50,58,0.6)',
              borderRadius: 12,
              borderWidth: 0.5,
              borderColor: 'rgba(77,166,255,0.15)',
              paddingHorizontal: 10,
              paddingVertical: Platform.OS === 'ios' ? 8 : 5,
            }}>
              <TextInput
                style={{ flex: 1, color: '#4DA6FF', fontSize: 11, paddingVertical: 0 }}
                placeholder="Chercher..."
                placeholderTextColor="rgba(77,166,255,0.25)"
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <TouchableOpacity onPress={() => navigateSearch(-1)} style={{ paddingHorizontal: 3 }}>
                <Text style={{ color: 'rgba(77,166,255,0.35)', fontSize: 11 }}>{'\u25C0'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateSearch(1)} style={{ paddingHorizontal: 3 }}>
                <Text style={{ color: 'rgba(77,166,255,0.35)', fontSize: 11 }}>{'\u25B6'}</Text>
              </TouchableOpacity>
            </View>

            {/* Upload — haut droite */}
            <TouchableOpacity
              onPress={() => addBotMessage("L'import de fichiers sera disponible prochainement.")}
              style={{
                backgroundColor: 'rgba(45,50,58,0.6)',
                borderRadius: 12,
                borderWidth: 0.5,
                borderColor: 'rgba(212,175,55,0.15)',
                paddingHorizontal: 14,
                paddingVertical: Platform.OS === 'ios' ? 8 : 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'rgba(212,175,55,0.45)', fontSize: 11 }}>Upload</Text>
            </TouchableOpacity>
          </View>

          {/* LIGNE DU BAS : Message (centre) + Envoyer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(45,50,58,0.6)',
              borderRadius: 12,
              borderWidth: 0.5,
              borderColor: 'rgba(0,217,132,0.15)',
              paddingHorizontal: 12,
              paddingVertical: Platform.OS === 'ios' ? 8 : 5,
            }}>
              <TextInput
                ref={inputRef}
                style={{ color: '#E0E0E0', fontSize: 12, paddingVertical: 0, maxHeight: 60 }}
                placeholder="Consultez ALIXEN..."
                placeholderTextColor="rgba(0,217,132,0.25)"
                selectionColor="#00D984"
                value={inputText}
                onChangeText={setInputText}
                multiline
                blurOnSubmit={false}
              />
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: inputText.trim() ? '#00D984' : 'rgba(0,217,132,0.08)',
                borderWidth: inputText.trim() ? 0 : 0.6,
                borderColor: 'rgba(0,217,132,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: inputText.trim() ? '#00D984' : 'transparent',
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: inputText.trim() ? 4 : 0,
              }}
            >
              <Text style={{
                color: inputText.trim() ? '#000' : 'rgba(0,217,132,0.3)',
                fontSize: 14,
                fontWeight: 'bold',
              }}>{'\u27A4'}</Text>
            </TouchableOpacity>
          </View>
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
