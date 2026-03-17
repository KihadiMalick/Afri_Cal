// ──────────────────────────────────────────────────────────────────────────────
// MedicAiPage.js — MedicAi : Thème Cabinet Médical + Constellation Libre
// Fond gris clair, boules neumorphiques, positionnement force-directed
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Platform, Animated, KeyboardAvoidingView,
  Dimensions, StatusBar, PixelRatio, Keyboard, Pressable,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle,
  LinearGradient as SvgLinearGradient, Stop,
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

        const isBullet = line.trim().startsWith('- ');
        const cleanLine = isBullet ? line.trim().substring(2) : line;

        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        return (
          <View key={lineIndex} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2, paddingLeft: isBullet ? 4 : 0 }}>
            {isBullet && (
              <Text style={[style, { marginRight: 6 }]}>{'\u2022'}</Text>
            )}
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={partIndex} style={[style, { fontWeight: 'bold', color: '#1A2030' }]}>
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
// DOCTOR HEADER — Image paysage lixman-doctor.png
// ============================================
const DoctorHeader = () => (
  <View style={{
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.42,
    backgroundColor: '#DDE2E8',
    overflow: 'hidden',
  }}>
    <Image
      source={require('./assets/lixman-doctor.png')}
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.42,
      }}
      resizeMode="cover"
    />
    {/* Dégradé de fondu en bas pour transition douce vers le fond */}
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 25,
    }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,0.0)' }} />
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,0.3)' }} />
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,0.6)' }} />
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,0.85)' }} />
      <View style={{ flex: 1, backgroundColor: 'rgba(232,236,240,1)' }} />
    </View>
  </View>
);

// ============================================
// LOADING DOTS (3 points qui pulsent en séquence)
// ============================================
const LoadingDots = () => {
  const anims = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    anims.forEach((a, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0.3, duration: 400, useNativeDriver: false }),
      ])).start();
    });
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 6, paddingVertical: 4 }}>
      {anims.map((a, i) => (
        <Animated.View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00D984', opacity: a }} />
      ))}
    </View>
  );
};

// ============================================
// RESPONSE CARD — Carte blanche en bas
// ============================================
const ResponseCard = ({ currentMessage, isLoading, isUserMessage }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (currentMessage || isLoading) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [currentMessage, isLoading]);

  // Effet machine à écrire pour les réponses IA
  useEffect(() => {
    if (currentMessage && !isUserMessage && !isLoading) {
      setDisplayedText('');
      let idx = 0;
      const interval = setInterval(() => {
        idx += 2;
        if (idx >= currentMessage.length) {
          setDisplayedText(currentMessage);
          clearInterval(interval);
        } else {
          setDisplayedText(currentMessage.substring(0, idx));
        }
      }, 15);
      return () => clearInterval(interval);
    } else if (isUserMessage && currentMessage) {
      setDisplayedText(currentMessage);
    }
  }, [currentMessage, isUserMessage, isLoading]);

  if (!currentMessage && !isLoading) return null;

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      marginHorizontal: 10,
      marginBottom: 8,
      borderRadius: 16,
      backgroundColor: '#FFF',
      borderWidth: 1,
      borderColor: isLoading ? 'rgba(0,200,130,0.1)' : (isUserMessage ? 'rgba(70,140,220,0.1)' : 'rgba(210,80,80,0.1)'),
      padding: 14,
      minHeight: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    }}>
      {/* Indicateur */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        <View style={{
          width: 7, height: 7, borderRadius: 3.5,
          backgroundColor: isLoading ? '#00D984' : (isUserMessage ? '#4A8CDC' : '#D06060'),
        }} />
        <Text style={{
          color: isLoading ? 'rgba(0,170,120,0.5)' : (isUserMessage ? 'rgba(70,130,210,0.5)' : 'rgba(200,80,80,0.5)'),
          fontSize: 9, fontWeight: '600', letterSpacing: 1,
        }}>
          {isLoading ? 'ALIXEN R\u00C9FL\u00C9CHIT...' : (isUserMessage ? 'VOUS' : 'ALIXEN')}
        </Text>
      </View>

      {/* Contenu */}
      {isLoading ? (
        <LoadingDots />
      ) : (
        <Text style={{ color: '#3A4550', fontSize: 13, lineHeight: 20 }}>
          {displayedText}
          {!isUserMessage && displayedText.length < (currentMessage || '').length && (
            <Text style={{ color: '#00D984' }}>|</Text>
          )}
        </Text>
      )}
    </Animated.View>
  );
};

// ============================================
// NEUMORPH BALL — Boule neumorphique cabinet médical
// ============================================
const NeumorphBall = ({ index, isBot, isSearchHit, status, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const wobbleX = useRef(new Animated.Value(0)).current;
  const wobbleY = useRef(new Animated.Value(0)).current;
  const loadPulse = useRef(new Animated.Value(0.3)).current;

  const BALL_SIZE = 30;

  useEffect(() => {
    // Entrée avec spring
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
    // Wobble continu
    const dur = 2500 + (index % 5) * 500;
    Animated.loop(Animated.sequence([
      Animated.timing(wobbleX, { toValue: 1, duration: dur, useNativeDriver: true }),
      Animated.timing(wobbleX, { toValue: 0, duration: dur, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(wobbleY, { toValue: 1, duration: dur * 0.8, useNativeDriver: true }),
      Animated.timing(wobbleY, { toValue: 0, duration: dur * 0.8, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      Animated.loop(Animated.sequence([
        Animated.timing(loadPulse, { toValue: 0.8, duration: 500, useNativeDriver: false }),
        Animated.timing(loadPulse, { toValue: 0.3, duration: 500, useNativeDriver: false }),
      ])).start();
    }
  }, [status]);

  // Couleurs
  let borderColor, numColor, shadowColor;
  if (isSearchHit) {
    borderColor = 'rgba(0,200,100,0.7)';
    numColor = 'rgba(0,160,80,0.7)';
    shadowColor = '#00C864';
  } else if (status === 'loading') {
    borderColor = 'rgba(0,200,130,0.4)';
    numColor = 'rgba(0,200,130,0.5)';
    shadowColor = '#00D984';
  } else if (status === 'unread') {
    borderColor = 'rgba(0,200,130,0.6)';
    numColor = '#00A878';
    shadowColor = '#00D984';
  } else {
    borderColor = isBot ? 'rgba(210,80,80,0.3)' : 'rgba(70,140,220,0.3)';
    numColor = isBot ? 'rgba(200,70,70,0.55)' : 'rgba(60,130,210,0.55)';
    shadowColor = isBot ? '#D06060' : '#4A8CDC';
  }

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { translateX: wobbleX.interpolate({ inputRange: [0, 1], outputRange: [-1, 1] }) },
        { translateY: wobbleY.interpolate({ inputRange: [0, 1], outputRange: [-0.8, 0.8] }) },
      ],
    }}>
      <Pressable onPress={() => { if (status !== 'loading') onPress(); }}>
        <View style={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: BALL_SIZE / 2,
          backgroundColor: '#EDF0F4',
          borderWidth: isSearchHit ? 2 : 1,
          borderColor: borderColor,
          // Ombre neumorphique sombre (bas-droite)
          shadowColor: isSearchHit ? shadowColor : 'rgba(0,0,0,0.12)',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: isSearchHit ? 0.4 : 0.3,
          shadowRadius: isSearchHit ? 8 : 4,
          elevation: isSearchHit ? 6 : 3,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          {/* Highlight neumorphique haut-gauche (lumière) */}
          <View style={{
            position: 'absolute',
            top: 1,
            left: BALL_SIZE * 0.1,
            width: BALL_SIZE * 0.5,
            height: BALL_SIZE * 0.3,
            borderRadius: BALL_SIZE,
            backgroundColor: 'rgba(255,255,255,0.5)',
            transform: [{ rotate: '-15deg' }],
          }} />

          {/* Ombre intérieure bas */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 2,
            right: 2,
            height: BALL_SIZE * 0.3,
            borderBottomLeftRadius: BALL_SIZE / 2,
            borderBottomRightRadius: BALL_SIZE / 2,
            backgroundColor: 'rgba(0,0,0,0.03)',
          }} />

          {/* Contenu */}
          {status === 'loading' ? (
            <Animated.View style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: '#00D984',
              opacity: loadPulse,
            }} />
          ) : (
            <Text style={{
              color: numColor,
              fontSize: 10,
              fontWeight: 'bold',
            }}>
              {index + 1}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================
// CONSTELLATION NETWORK — Positionnement force-directed
// ============================================
const ConstellationNetwork = ({ messages, searchHits, onBallPress }) => {
  const positions = useRef([]).current;
  const BALL_SIZE = 30;
  const BALL_RADIUS = BALL_SIZE / 2;

  // Calculer les positions quand messages change
  useMemo(() => {
    positions.length = 0;
    const padX = 22;
    const padY = 8;
    const areaW = SCREEN_WIDTH - padX * 2;
    const areaH = Math.max(200, Math.ceil(messages.length / 4) * 65 + 40);

    messages.forEach((m, i) => {
      let x, y, ok, att = 0;
      do {
        ok = true;
        // Biais : ALIXEN légèrement plus haut, User légèrement plus bas
        const yBias = m.role === 'assistant' ? 0.35 : 0.65;
        x = padX + Math.random() * areaW;
        y = padY + areaH * (yBias - 0.25 + Math.random() * 0.5);
        // Vérifier pas de chevauchement
        for (let j = 0; j < positions.length; j++) {
          const dx = x - positions[j].x, dy = y - positions[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < BALL_SIZE * 1.4) { ok = false; break; }
        }
        att++;
      } while (!ok && att < 200);
      positions.push({ x, y, vx: 0, vy: 0 });
    });

    // Relaxation de forces (80 itérations)
    for (let iter = 0; iter < 80; iter++) {
      for (let i = 0; i < positions.length; i++) {
        positions[i].vx = 0;
        positions[i].vy = 0;
        // Répulsion entre toutes les boules
        for (let j = 0; j < positions.length; j++) {
          if (i === j) continue;
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const minDist = BALL_SIZE * 1.6;
          if (d < minDist) {
            const force = (minDist - d) / minDist * 2;
            positions[i].vx += (dx / d) * force;
            positions[i].vy += (dy / d) * force;
          }
        }
        // Attraction vers la paire question/réponse
        if (i > 0) {
          const pair = i % 2 === 1 ? i - 1 : i + 1;
          if (pair < positions.length && pair >= 0) {
            const dx = positions[pair].x - positions[i].x;
            const dy = positions[pair].y - positions[i].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > BALL_SIZE * 3) {
              positions[i].vx += dx * 0.012;
              positions[i].vy += dy * 0.012;
            }
          }
        }
      }
      // Appliquer les vitesses avec limites
      positions.forEach(p => {
        p.x = Math.max(padX, Math.min(SCREEN_WIDTH - padX, p.x + p.vx));
        p.y = Math.max(padY, Math.min(padY + areaH, p.y + p.vy));
      });
    }
  }, [messages.length]);

  const containerHeight = positions.length > 0
    ? Math.max(...positions.map(p => p.y)) + BALL_SIZE + 20
    : 200;

  return (
    <View style={{ height: containerHeight, position: 'relative' }}>
      {/* Lignes de connexion paires question→réponse */}
      {messages.map((msg, i) => {
        if (i === 0 || i % 2 === 0) return null;
        const pairIdx = i - 1;
        if (!positions[i] || !positions[pairIdx]) return null;
        const x1 = positions[pairIdx].x;
        const y1 = positions[pairIdx].y;
        const x2 = positions[i].x;
        const y2 = positions[i].y;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View key={`line-${i}`} style={{
            position: 'absolute',
            left: x1,
            top: y1,
            width: len,
            height: 1,
            backgroundColor: 'rgba(0,180,130,0.12)',
            transform: [{ rotate: `${angle}deg` }],
            transformOrigin: '0 0',
          }} />
        );
      })}

      {/* Boules */}
      {messages.map((msg, i) => {
        if (!positions[i]) return null;
        const isSearch = searchHits && searchHits.has(i);
        return (
          <View key={msg.id} style={{
            position: 'absolute',
            left: positions[i].x - BALL_RADIUS,
            top: positions[i].y - BALL_RADIUS,
          }}>
            <NeumorphBall
              index={i}
              isBot={msg.role === 'assistant'}
              isSearchHit={isSearch}
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

  // Modal message complet
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Recherche dans les messages
  const [searchQuery, setSearchQuery] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchHits, setSearchHits] = useState(new Set());

  // Navigation
  const [activeTab, setActiveTab] = useState('medicai');

  // Carte de réponse
  const [cardMessage, setCardMessage] = useState(null);
  const [cardIsUser, setCardIsUser] = useState(false);
  const [cardIsLoading, setCardIsLoading] = useState(false);

  // Clavier
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Refs
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  // Animations d'entrée
  const contentEntry = useRef(new Animated.Value(0)).current;
  const inputEntry = useRef(new Animated.Value(0)).current;

  // ── Chargement des données au mount ──────────────────────────────────────
  useEffect(() => {
    loadUserData();
    loadTokenQuota();
    loadAvailableMeals();

    Animated.stagger(200, [
      Animated.spring(contentEntry, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.spring(inputEntry, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Afficher le message de bienvenue dans la carte ──────────────────────
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setCardMessage(messages[0].content);
      setCardIsUser(false);
      setCardIsLoading(false);
    }
  }, [messages.length]);

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
      _status: 'read',
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
      _status: 'read',
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
  const toggleSearchModal = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery('');
      setSearchHits(new Set());
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setSearchHits(new Set());
      return;
    }
    const hits = new Set();
    const low = text.toLowerCase();
    messages.forEach((m, i) => {
      if (m.content.toLowerCase().includes(low)) hits.add(i);
    });
    setSearchHits(hits);
  };

  // ── Envoi de message et appel IA ────────────────────────────────────────
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    const userText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // 1. Afficher le message user dans la carte
    setCardMessage(userText);
    setCardIsUser(true);
    setCardIsLoading(false);

    // 2. Créer la boule user
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
      _isNew: true,
      _status: 'read',
    };
    setMessages(prev => [...prev, userMsg]);

    // 3. Après 800ms, passer en mode chargement
    setTimeout(() => {
      setCardMessage(null);
      setCardIsUser(false);
      setCardIsLoading(true);
    }, 800);

    // 4. Appel à l'API
    const botMsgId = (Date.now() + 1).toString();
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
      const replyText = data.message || data.error || "Erreur de connexion.";

      // 5. Afficher la réponse IA dans la carte
      setCardIsLoading(false);
      setCardMessage(replyText);
      setCardIsUser(false);

      // 6. Créer la boule IA
      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: replyText,
        timestamp: new Date(),
        _isNew: true,
        _status: 'read',
      };
      setMessages(prev => [...prev, botMsg]);

      if (data.tokens_used) setTokenUsed(prev => prev + data.tokens_used);

    } catch (error) {
      console.error('Erreur ALIXEN:', error);
      setCardIsLoading(false);
      setCardMessage("Erreur réseau. Vérifiez votre connexion.");
      setCardIsUser(false);

      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: "Erreur réseau. Vérifiez votre connexion.",
        timestamp: new Date(),
        _isNew: true,
        _status: 'read',
      };
      setMessages(prev => [...prev, botMsg]);
    }
    setIsLoading(false);
  };

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="dark-content" />

      {/* ===== HEADER — MedicAi sobre sur fond clair ===== */}
      <View style={{
        backgroundColor: '#F4F6F8',
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingBottom: 6,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
      }}>
        <View>
          <Text style={{ color: '#1A2030', fontSize: 22, fontWeight: 'bold' }}>MedicAi</Text>
          <Text style={{ color: 'rgba(0,150,120,0.45)', fontSize: 7, letterSpacing: 2 }}>ESPACE SANTÉ INTELLIGENT</Text>
        </View>
        <View style={{
          backgroundColor: 'rgba(0,180,130,0.08)',
          borderWidth: 1,
          borderColor: 'rgba(0,180,130,0.2)',
          borderRadius: 14,
          paddingHorizontal: 8,
          paddingVertical: 3,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00D984' }} />
          <Text style={{ color: '#00A878', fontSize: 10 }}>En ligne</Text>
        </View>
      </View>

      {/* ===== ZONE DE CONTENU ===== */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 10 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image docteur */}
          <DoctorHeader />

          {/* Chips MediBook / SecretPocket / Sablier */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 6 }}>
            <TouchableOpacity
              onPress={() => addBotMessage("Le MediBook sera disponible prochainement.")}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: 'rgba(0,180,130,0.15)',
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              <Text style={{ color: '#00A878', fontSize: 10, fontWeight: '600' }}>MediBook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => addBotMessage("Le Secret Pocket sera disponible prochainement.")}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: 'rgba(190,160,50,0.15)',
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              <Text style={{ color: '#B89A30', fontSize: 10, fontWeight: '600' }}>Secret Pocket</Text>
            </TouchableOpacity>

            {/* Sablier compteur */}
            <View style={{
              backgroundColor: '#FFF',
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.05)',
            }}>
              <Text style={{ color: 'rgba(0,160,120,0.5)', fontSize: 10 }}>
                {tokenLimit - tokenUsed > 0 ? `\u23F3 ${tokenLimit - tokenUsed}` : '\u23F3 \u00C9PUIS\u00C9'}
              </Text>
            </View>
          </View>

          {/* Constellation de boules */}
          <Animated.View style={{
            opacity: contentEntry,
            transform: [{ translateY: contentEntry.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          }}>
            <ConstellationNetwork
              messages={messages}
              searchHits={searchHits}
              onBallPress={handleBallPress}
            />
          </Animated.View>

          {/* Légende discrète */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 8, marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EDF0F4', borderWidth: 1, borderColor: 'rgba(210,80,80,0.3)' }} />
              <Text style={{ color: 'rgba(0,0,0,0.3)', fontSize: 8 }}>ALIXEN</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EDF0F4', borderWidth: 1, borderColor: 'rgba(70,140,220,0.3)' }} />
              <Text style={{ color: 'rgba(0,0,0,0.3)', fontSize: 8 }}>Vous</Text>
            </View>
          </View>

          {/* Carte de réponse */}
          <ResponseCard
            currentMessage={cardMessage}
            isLoading={cardIsLoading}
            isUserMessage={cardIsUser}
          />
        </ScrollView>

        {/* Panneau recherche (si ouvert) */}
        {searchVisible && (
          <View style={{
            paddingHorizontal: 10,
            paddingVertical: 8,
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.04)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(0,0,0,0.04)',
          }}>
            <TextInput
              autoFocus
              style={{ color: '#00A878', fontSize: 13, paddingVertical: 4 }}
              placeholder="Rechercher dans les messages..."
              placeholderTextColor="rgba(0,0,0,0.2)"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchHits.size > 0 && (
              <Text style={{ color: '#00A878', fontSize: 9, marginTop: 3 }}>
                {searchHits.size} bulle{searchHits.size > 1 ? 's' : ''} trouvée{searchHits.size > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}

        {/* Barre de saisie : Loupe + Message + Envoyer */}
        <Animated.View style={{
          opacity: inputEntry,
          transform: [{ translateY: inputEntry.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 6,
            gap: 6,
            backgroundColor: '#E8ECF0',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.04)',
          }}>
            {/* Bouton Loupe neumorphique */}
            <TouchableOpacity
              onPress={toggleSearchModal}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#EDF0F4',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
                borderWidth: 0.5,
                borderColor: 'rgba(255,255,255,0.6)',
              }}
            >
              <Text style={{ fontSize: 16 }}>{'\uD83D\uDD0D'}</Text>
            </TouchableOpacity>

            {/* Champ message */}
            <View style={{
              flex: 1,
              backgroundColor: '#FFF',
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: Platform.OS === 'ios' ? 8 : 5,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
              shadowColor: 'rgba(0,0,0,0.04)',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 1,
            }}>
              <TextInput
                ref={inputRef}
                style={{ color: '#3A4550', fontSize: 12, paddingVertical: 0, maxHeight: 60 }}
                placeholder="Consultez ALIXEN..."
                placeholderTextColor="rgba(0,0,0,0.2)"
                selectionColor="#00A878"
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
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: inputText.trim() ? '#00D984' : '#EDF0F4',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: inputText.trim() ? '#00D984' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: inputText.trim() ? 0.3 : 0,
                shadowRadius: 5,
                elevation: inputText.trim() ? 4 : 0,
              }}
            >
              <Text style={{
                color: inputText.trim() ? '#FFF' : 'rgba(0,0,0,0.15)',
                fontSize: 14,
                fontWeight: 'bold',
              }}>{'\u27A4'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* ===== BOTTOM TAB BAR ===== */}
      {!keyboardVisible && (
        <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
      )}

      {/* === MODAL MESSAGE COMPLET === */}
      {selectedMessage && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center', alignItems: 'center', zIndex: 200,
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={closeModal} activeOpacity={1}
          />
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 20,
            padding: 16,
            width: SCREEN_WIDTH * 0.92,
            maxHeight: SCREEN_HEIGHT * 0.65,
            borderWidth: 1,
            borderColor: selectedMessage.role === 'assistant'
              ? 'rgba(210,80,80,0.15)' : 'rgba(70,140,220,0.15)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectedMessage.role === 'assistant' ? (
                  <>
                    <Image source={require('./assets/lixman-avatar.png')}
                      style={{ width: 22, height: 22, borderRadius: 11, marginRight: 8, borderWidth: 1, borderColor: '#D06060' }}
                      resizeMode="cover" />
                    <Text style={{ color: '#D06060', fontSize: 12, fontWeight: 'bold' }}>ALIXEN</Text>
                  </>
                ) : (
                  <Text style={{ color: '#4A8CDC', fontSize: 12, fontWeight: 'bold' }}>{'\uD83D\uDC64'} Vous</Text>
                )}
                <Text style={{ color: 'rgba(0,0,0,0.2)', fontSize: 9, marginLeft: 8 }}>#{selectedMessage.index + 1}</Text>
              </View>
              <TouchableOpacity onPress={closeModal}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: 10 }}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Contenu scrollable */}
            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.45 }}>
              {selectedMessage.role === 'assistant' ? (
                <FormattedText
                  text={selectedMessage.content}
                  style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}
                  onRecipePress={(name) => { closeModal(); handleRecipePress(name); }}
                />
              ) : (
                <Text style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}>
                  {selectedMessage.content}
                </Text>
              )}
            </ScrollView>

            {/* Heure */}
            <Text style={{ color: 'rgba(0,0,0,0.2)', fontSize: 8, marginTop: 8, textAlign: 'right' }}>
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
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 16,
            padding: 20,
            width: SCREEN_WIDTH * 0.85,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.06)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Avatar ALIXEN */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Image
                source={require('./assets/lixman-avatar.png')}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#00D984' }}
                resizeMode="cover"
              />
              <Text style={{ color: '#00A878', fontSize: 14, fontWeight: 'bold' }}>ALIXEN</Text>
            </View>

            {/* Message */}
            <Text style={{ color: '#3A4550', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
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
                  borderColor: 'rgba(0,0,0,0.08)',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: 13 }}>Annuler</Text>
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
                <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>Voir la recette</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
