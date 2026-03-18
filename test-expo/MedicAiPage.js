// ──────────────────────────────────────────────────────────────────────────────
// MedicAiPage.js — MedicAi : Thème Cabinet Médical + Parcours en S
// Fond gris clair, boules neumorphiques, parcours S-path + creux liquide
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Platform, Animated, KeyboardAvoidingView,
  Dimensions, StatusBar, PixelRatio, Keyboard, Pressable, Alert, Modal,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle, Line,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
// SYSTÈME ÉNERGIE LIXUM
// ============================================
const ENERGY_CONFIG = {
  TOKEN_DIVISOR: 100,
  TEST_ENERGY_LIMIT: 500,
  GOLD_ENERGY_LIMIT: 150,
  PLATINUM_ENERGY_LIMIT: 350,
  LIX_PER_RECHARGE_UNIT: 100,
  ENERGY_PER_RECHARGE: 10,
  SESSION_DURATION_MS: 6 * 60 * 60 * 1000,
};

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
// BUBBLE COLORS — Palette LIXUM 6 couleurs cyclique
// ============================================
const BUBBLE_COLORS = ['#00D984', '#4DA6FF', '#D4AF37', '#FF8C42', '#FF6B6B', '#9B6DFF'];
// Emerald, Blue, Gold, Orange, Coral, Purple — cycle sur chaque bulle

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
              <Text style={{ fontSize: 16, marginRight: 8 }}>{'🍽️'}</Text>
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
// SCROLL ARROW — Flèche animée pour indiquer le scroll
// ============================================
const ScrollArrow = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      alignSelf: 'center',
      marginTop: 4,
      marginBottom: 2,
      transform: [{
        translateY: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 6],
        }),
      }],
    }}>
      <Text style={{ color: 'rgba(0,160,130,0.4)', fontSize: 20 }}>↓</Text>
    </Animated.View>
  );
};

// ============================================
// FORMATTED RESPONSE TEXT — Parse **bold** markdown
// ============================================
const FormattedResponseText = ({ text, style }) => {
  if (!text) return null;

  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <Text key={i} style={{ fontWeight: 'bold' }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
  );
};

// ============================================
// METAL CARD — Style LIXUM sombre avec dégradé
// ============================================
const MetalCard = ({ title, titleColor = '#00D984', iconElement, onPress }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const handlePressIn = () => Animated.timing(pressAnim, { toValue: 1, duration: 120, useNativeDriver: false }).start();
  const handlePressOut = () => Animated.timing(pressAnim, { toValue: 0, duration: 180, useNativeDriver: false }).start();

  const scaleVal = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

  return (
    <Pressable delayPressIn={120} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={{
        width: wp(150),
        height: wp(100),
        borderRadius: wp(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        transform: [{ scale: scaleVal }],
      }}>
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{
            flex: 1,
            borderRadius: wp(16),
            borderWidth: 1,
            borderColor: '#4A4F55',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Icône SVG */}
          <View style={{ marginBottom: 8 }}>
            {iconElement}
          </View>

          {/* Titre */}
          <Text style={{
            color: titleColor,
            fontSize: fp(14),
            fontWeight: '700',
            letterSpacing: 0.5,
          }}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

// (GrooveLiquidInput removed — replaced by gradient input bar in render)

// ============================================
// LOADING DOTS — Premium typing indicator with bounce
// ============================================
const LoadingDots = () => {
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -4, duration: 200, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.delay(400 - delay),
        ])
      );

    createBounce(bounce1, 0).start();
    createBounce(bounce2, 150).start();
    createBounce(bounce3, 300).start();
  }, []);

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 217, 132, 0.08)',
      borderRadius: wp(16),
      paddingHorizontal: wp(16),
      paddingVertical: wp(8),
      borderWidth: 1,
      borderColor: 'rgba(0, 217, 132, 0.15)',
      alignSelf: 'flex-start',
      gap: wp(8),
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {[bounce1, bounce2, bounce3].map((anim, i) => (
          <Animated.View key={i} style={{
            width: wp(6),
            height: wp(6),
            borderRadius: wp(3),
            backgroundColor: '#00D984',
            transform: [{ translateY: anim }],
          }} />
        ))}
      </View>
      <Text style={{
        fontSize: fp(12),
        color: 'rgba(0, 217, 132, 0.7)',
        fontStyle: 'italic',
      }}>ALIXEN reflechit...</Text>
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
      borderRadius: wp(16),
      backgroundColor: '#FAFBFC',
      borderWidth: 1,
      borderColor: isLoading ? 'rgba(0,200,130,0.1)' : (isUserMessage ? 'rgba(70,140,220,0.1)' : 'rgba(210,80,80,0.1)'),
      borderLeftWidth: (!isUserMessage || isLoading) ? wp(3) : 1,
      borderLeftColor: (!isUserMessage || isLoading) ? '#00D984' : (isUserMessage ? 'rgba(70,140,220,0.1)' : 'rgba(210,80,80,0.1)'),
      padding: 14,
      minHeight: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    }}>
      {/* Badge ALIXEN premium */}
      {!isUserMessage && !isLoading && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: wp(8) }}>
          <LinearGradient
            colors={['#00D984', '#00B871']}
            style={{
              width: wp(20),
              height: wp(20),
              borderRadius: wp(10),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: fp(9), fontWeight: '800' }}>AI</Text>
          </LinearGradient>
          <Text style={{
            fontSize: fp(13),
            fontWeight: '700',
            color: '#2D3436',
            letterSpacing: 1,
          }}>ALIXEN</Text>
        </View>
      )}
      {isUserMessage && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
          <View style={{
            width: 7, height: 7, borderRadius: 3.5,
            backgroundColor: '#4A8CDC',
          }} />
          <Text style={{
            color: 'rgba(70,130,210,0.5)',
            fontSize: 9, fontWeight: '600', letterSpacing: 1,
          }}>VOUS</Text>
        </View>
      )}

      {/* Contenu */}
      {isLoading ? (
        <LoadingDots />
      ) : (
        <FormattedResponseText
          text={displayedText + (!isUserMessage && displayedText.length < (currentMessage || '').length ? '|' : '')}
          style={{ color: '#3A4550', fontSize: 13, lineHeight: 20 }}
        />
      )}
    </Animated.View>
  );
};

// ============================================
// NEUMORPH BALL — Boule neumorphique cabinet médical
// ============================================
const NeumorphBall = ({ index, isBot, isSearchHit, isSearchActive, status, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const wobbleX = useRef(new Animated.Value(0)).current;
  const wobbleY = useRef(new Animated.Value(0)).current;
  const loadPulse = useRef(new Animated.Value(0.3)).current;

  const BALL_SIZE = 30;
  const bubbleColor = BUBBLE_COLORS[index % BUBBLE_COLORS.length];

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

  // Opacite reduite si recherche active et pas un hit
  const dimmed = isSearchActive && !isSearchHit;

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { translateX: wobbleX.interpolate({ inputRange: [0, 1], outputRange: [-1, 1] }) },
        { translateY: wobbleY.interpolate({ inputRange: [0, 1], outputRange: [-0.8, 0.8] }) },
      ],
      opacity: dimmed ? 0.3 : 1,
    }}>
      <Pressable onPress={() => { if (status !== 'loading') onPress(); }}>
        <View style={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: BALL_SIZE / 2,
          backgroundColor: 'transparent',
          borderWidth: isSearchHit ? wp(3) : wp(2.5),
          borderColor: bubbleColor,
          shadowColor: (status === 'unread' || isSearchHit) ? bubbleColor : 'rgba(0,0,0,0.15)',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: (status === 'unread' || isSearchHit) ? 0.4 : 0.2,
          shadowRadius: (status === 'unread' || isSearchHit) ? 8 : 4,
          elevation: (status === 'unread' || isSearchHit) ? 4 : 2,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          {/* Centre sombre MetalCard */}
          <View style={{
            position: 'absolute',
            width: BALL_SIZE - wp(5),
            height: BALL_SIZE - wp(5),
            borderRadius: (BALL_SIZE - wp(5)) / 2,
            backgroundColor: '#1E2530',
          }} />

          {/* Contenu */}
          {status === 'loading' ? (
            <Animated.View style={{
              width: 8, height: 8, borderRadius: 4,
              backgroundColor: bubbleColor,
              opacity: loadPulse,
            }} />
          ) : (
            <Text style={{
              color: bubbleColor,
              fontSize: fp(11),
              fontWeight: '600',
              zIndex: 1,
            }}>
              {index + 1}
            </Text>
          )}

          {/* Glow pour bulle search hit */}
          {isSearchHit && (
            <View style={{
              position: 'absolute',
              width: BALL_SIZE + 6,
              height: BALL_SIZE + 6,
              borderRadius: (BALL_SIZE + 6) / 2,
              borderWidth: 2,
              borderColor: '#00D984',
              zIndex: -1,
            }} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================
// SYNAPTIC NETWORK — Parcours en S organisé
// ============================================
const S_BALL_SIZE = 32;
const BALLS_PER_ROW = 8;
const S_GAP = S_BALL_SIZE + 4; // 36
const S_PADDING_H = (SCREEN_WIDTH - BALLS_PER_ROW * S_GAP) / 2;

const getBallPosition = (index) => {
  const row = Math.floor(index / BALLS_PER_ROW);
  const col = index % BALLS_PER_ROW;
  const reversed = row % 2 === 1; // Lignes impaires inversées = S
  const actualCol = reversed ? (BALLS_PER_ROW - 1 - col) : col;
  return {
    x: S_PADDING_H + actualCol * S_GAP + S_GAP / 2,
    y: row * (S_BALL_SIZE + 12),
  };
};

const SynapticNetwork = ({ messages, searchHits, onBallPress }) => {
  const totalRows = Math.ceil(messages.length / BALLS_PER_ROW);
  const containerHeight = totalRows * (S_BALL_SIZE + 12) + 10;

  return (
    <View style={{ height: containerHeight, position: 'relative', marginHorizontal: 8 }}>
      {/* Lignes de connexion entre boules adjacentes */}
      {messages.map((msg, i) => {
        if (i === 0) return null;
        const pos = getBallPosition(i);
        const prevPos = getBallPosition(i - 1);
        const prevRow = Math.floor((i - 1) / BALLS_PER_ROW);
        const curRow = Math.floor(i / BALLS_PER_ROW);

        if (prevRow === curRow) {
          // Même ligne : ligne horizontale
          const minX = Math.min(pos.x, prevPos.x);
          const maxX = Math.max(pos.x, prevPos.x);
          return (
            <View key={`line-${i}`} style={{
              position: 'absolute',
              left: minX,
              top: pos.y + S_BALL_SIZE / 2 - 0.5,
              width: maxX - minX,
              height: 1,
              backgroundColor: 'rgba(0,180,160,0.08)',
            }} />
          );
        } else {
          // Changement de ligne : ligne verticale
          return (
            <View key={`line-${i}`} style={{
              position: 'absolute',
              left: prevPos.x - 0.5,
              top: prevPos.y + S_BALL_SIZE / 2,
              width: 1,
              height: pos.y - prevPos.y,
              backgroundColor: 'rgba(0,180,160,0.06)',
            }} />
          );
        }
      })}

      {/* Boules */}
      {messages.map((msg, i) => {
        const pos = getBallPosition(i);
        const isSearch = searchHits && searchHits.has(i);
        return (
          <View key={msg.id || `ball-${i}`} style={{
            position: 'absolute',
            left: pos.x - S_BALL_SIZE / 2,
            top: pos.y,
          }}>
            <NeumorphBall
              index={i}
              isBot={msg.role === 'assistant'}
              isSearchHit={isSearch}
              isSearchActive={searchHits && searchHits.size > 0}
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
// HIGHLIGHTED TEXT — Surlignage des mots-clés dans le texte
// ============================================
const HighlightedText = ({ text, searchTerm, currentIndex, style, onLayoutOccurrence }) => {
  if (!text || !searchTerm || !searchTerm.trim()) {
    return <Text style={style}>{text}</Text>;
  }

  const term = searchTerm.toLowerCase();
  const parts = [];
  let remaining = text;
  let globalIdx = 0;
  let occurrenceIdx = 0;

  while (remaining.length > 0) {
    const lowerRemaining = remaining.toLowerCase();
    const matchPos = lowerRemaining.indexOf(term);
    if (matchPos === -1) {
      parts.push({ text: remaining, isHighlight: false, idx: -1 });
      break;
    }
    if (matchPos > 0) {
      parts.push({ text: remaining.substring(0, matchPos), isHighlight: false, idx: -1 });
    }
    parts.push({
      text: remaining.substring(matchPos, matchPos + searchTerm.length),
      isHighlight: true,
      idx: occurrenceIdx,
    });
    occurrenceIdx++;
    remaining = remaining.substring(matchPos + searchTerm.length);
    globalIdx += matchPos + searchTerm.length;
  }

  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (!part.isHighlight) {
          return <Text key={i}>{part.text}</Text>;
        }
        const isActive = part.idx === currentIndex;
        return (
          <Text
            key={i}
            onLayout={onLayoutOccurrence ? (e) => onLayoutOccurrence(part.idx, e.nativeEvent.layout.y) : undefined}
            style={{
              backgroundColor: isActive ? 'rgba(212, 175, 55, 0.6)' : 'rgba(212, 175, 55, 0.3)',
              borderRadius: 4,
              paddingHorizontal: 2,
            }}
          >
            {part.text}
          </Text>
        );
      })}
    </Text>
  );
};

// Compte les occurrences d'un terme dans un texte
const countOccurrences = (text, term) => {
  if (!text || !term || !term.trim()) return 0;
  const lower = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  let count = 0;
  let pos = 0;
  while ((pos = lower.indexOf(lowerTerm, pos)) !== -1) {
    count++;
    pos += lowerTerm.length;
  }
  return count;
};

// ============================================
// MODAL SCROLL CONTENT — ScrollView avec surlignage + flèches navigation
// ============================================
const ModalScrollContent = ({ selectedMessage, closeModal, handleRecipePress, searchTerm }) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const scrollRef = useRef(null);
  const occurrenceYPositions = useRef({});

  const totalOccurrences = countOccurrences(selectedMessage.content, searchTerm);
  const hasSearch = searchTerm && searchTerm.trim() && totalOccurrences > 0;

  const handleLayoutOccurrence = (idx, y) => {
    occurrenceYPositions.current[idx] = y;
  };

  const navigateHighlight = (direction) => {
    if (totalOccurrences === 0) return;
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentHighlightIndex + 1) % totalOccurrences;
    } else {
      nextIndex = (currentHighlightIndex - 1 + totalOccurrences) % totalOccurrences;
    }
    setCurrentHighlightIndex(nextIndex);
    const y = occurrenceYPositions.current[nextIndex];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 40), animated: true });
    }
  };

  return (
    <View>
      {/* Barre de navigation recherche */}
      {hasSearch && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 8,
          paddingVertical: 4,
        }}>
          <Pressable
            onPress={() => navigateHighlight('prev')}
            style={{
              width: wp(30),
              height: wp(30),
              borderRadius: wp(15),
              backgroundColor: '#3A3F46',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>‹</Text>
          </Pressable>

          <Text style={{ color: '#999', fontSize: 11 }}>
            {currentHighlightIndex + 1} sur {totalOccurrences} résultat{totalOccurrences > 1 ? 's' : ''}
          </Text>

          <Pressable
            onPress={() => navigateHighlight('next')}
            style={{
              width: wp(30),
              height: wp(30),
              borderRadius: wp(15),
              backgroundColor: '#3A3F46',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>›</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={{ maxHeight: SCREEN_HEIGHT * 0.45 }}
        onContentSizeChange={(w, h) => setIsScrollable(h > 300)}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          setIsAtBottom(layoutMeasurement.height + contentOffset.y >= contentSize.height - 20);
        }}
        scrollEventThrottle={16}
      >
        {hasSearch ? (
          <HighlightedText
            text={selectedMessage.content}
            searchTerm={searchTerm}
            currentIndex={currentHighlightIndex}
            style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}
            onLayoutOccurrence={handleLayoutOccurrence}
          />
        ) : selectedMessage.role === 'assistant' ? (
          <FormattedText
            text={selectedMessage.content}
            style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}
            onRecipePress={(name) => { closeModal(); handleRecipePress(name); }}
          />
        ) : (
          <FormattedResponseText
            text={selectedMessage.content}
            style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}
          />
        )}
      </ScrollView>
      {isScrollable && !isAtBottom && <ScrollArrow />}
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
  const [energyUsed, setEnergyUsed] = useState(0);
  const [energyLimit, setEnergyLimit] = useState(ENERGY_CONFIG.TEST_ENERGY_LIMIT);
  const [lastResetTime, setLastResetTime] = useState(Date.now());

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

  // Lock state
  const [isLocked, setIsLocked] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showDocumentSheet, setShowDocumentSheet] = useState(false);

  // Refs
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  // Animations d'entrée
  const contentEntry = useRef(new Animated.Value(0)).current;
  const inputEntry = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

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

  // ── Lock quand quota atteint ──────────────────────────────────────────────
  useEffect(() => {
    setIsLocked(energyUsed >= energyLimit);
  }, [energyUsed, energyLimit]);

  // ── Timer reset automatique 6h ────────────────────────────────────────────
  useEffect(() => {
    const checkReset = setInterval(() => {
      if (Date.now() - lastResetTime >= ENERGY_CONFIG.SESSION_DURATION_MS) {
        setEnergyUsed(0);
        setLastResetTime(Date.now());
        setIsLocked(false);
      }
    }, 60000);
    return () => clearInterval(checkReset);
  }, [lastResetTime]);

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
        const usedEnergy = Math.ceil((data[0].tokens_used || 0) / ENERGY_CONFIG.TOKEN_DIVISOR);
        setEnergyUsed(usedEnergy);
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
    if (!inputText.trim() || isLoading || isLocked) return;

    // Limite 30 bulles par session
    if (messages.length >= 30) {
      Alert.alert(
        'Session pleine',
        'Vous avez atteint la limite de 30 echanges. Souhaitez-vous compacter cette conversation et la ranger dans votre Secret Pocket ?',
        [
          { text: 'Compacter et ranger', onPress: () => console.log('Compactage Secret Pocket') },
          { text: 'Continuer quand meme', style: 'cancel' },
        ]
      );
      return;
    }

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

      if (data.tokens_used) {
        const energyCost = Math.ceil(data.tokens_used / ENERGY_CONFIG.TOKEN_DIVISOR);
        setEnergyUsed(prev => {
          const newUsed = prev + energyCost;
          console.log(`[ÉNERGIE] Tokens: ${data.tokens_used} → Coût: ${energyCost} énergie | Total: ${newUsed}/${energyLimit}`);
          return newUsed;
        });
      }

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
          contentContainerStyle={{ paddingBottom: 10, paddingTop: 0 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image docteur */}
          <DoctorHeader />

          {/* Cartes MetalCard LIXUM — MediBook / SecretPocket */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: wp(12),
            paddingHorizontal: 16,
            marginTop: 8,
            marginBottom: 4,
          }}>
            <MetalCard
              title="MediBook"
              iconElement={
                <Svg width={wp(36)} height={wp(36)} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="2" width="14" height="20" rx="2" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                  <Line x1="7" y1="8" x2="13" y2="8" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="7" y1="12" x2="13" y2="12" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="7" y1="16" x2="11" y2="16" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="19" y1="3" x2="19" y2="7" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="17" y1="5" x2="21" y2="5" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                </Svg>
              }
              onPress={() => addBotMessage("Le MediBook sera disponible prochainement. Votre dossier médical complet avec bilans, rappels et médicaments.")}
            />
            <MetalCard
              title="Secret Pocket"
              titleColor="#D4AF37"
              iconElement={
                <Svg width={wp(36)} height={wp(36)} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                  <Rect x="9" y="10" width="6" height="5" rx="1" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                  <Path d="M10 10V8a2 2 0 014 0v2" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </Svg>
              }
              onPress={() => addBotMessage("Le Secret Pocket sera disponible prochainement. Votre coffre-fort santé chiffré.")}
            />
          </View>

          {/* Boules en S */}
          <Animated.View style={{
            opacity: contentEntry,
            transform: [{ translateY: contentEntry.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            marginBottom: wp(4),
          }}>
            <SynapticNetwork
              messages={messages}
              searchHits={searchHits}
              onBallPress={handleBallPress}
            />
          </Animated.View>

          {/* Carte de réponse */}
          <ResponseCard
            currentMessage={cardMessage}
            isLoading={cardIsLoading}
            isUserMessage={cardIsUser}
          />
        </ScrollView>

        {/* Panneau recherche (si ouvert) — avec bouton X */}
        {searchVisible && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 8,
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.04)',
            marginHorizontal: 8,
            borderRadius: 14,
            marginBottom: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 2,
          }}>
            <TextInput
              autoFocus
              style={{ flex: 1, color: '#00A878', fontSize: 13, paddingVertical: 4 }}
              placeholder="Rechercher dans les messages..."
              placeholderTextColor="rgba(0,0,0,0.2)"
              value={searchQuery}
              onChangeText={handleSearch}
            />

            {/* Bouton fermer X */}
            <TouchableOpacity
              onPress={() => {
                setSearchVisible(false);
                setSearchQuery('');
                setSearchHits(new Set());
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(0,0,0,0.05)',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 8,
              }}
            >
              <Text style={{ color: '#999', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>

            {/* Compteur résultats en dessous */}
            {searchHits.size > 0 && (
              <Text style={{
                position: 'absolute',
                bottom: -14,
                left: 12,
                color: '#00A878',
                fontSize: 8,
              }}>
                {searchHits.size} bulle{searchHits.size > 1 ? 's' : ''} trouvée{searchHits.size > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}

        {/* Zone de saisie avec dégradé emerald */}
        <Animated.View style={{
          opacity: inputEntry,
          transform: [{ translateY: inputEntry.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}>
          <View style={{
            marginHorizontal: 14,
            marginBottom: 6,
            borderRadius: 22,
            overflow: 'hidden',
          }}>
            {/* Dégradé en fond */}
            <LinearGradient
              colors={['rgba(0,217,132,0.05)', 'rgba(0,217,132,0.15)', 'rgba(0,217,132,0.3)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                borderRadius: 22,
              }}
            />

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 6,
              gap: 6,
            }}>
              {/* Bouton "+" ajout document */}
              <Pressable
                delayPressIn={120}
                onPress={() => setShowDocumentSheet(true)}
                style={({ pressed }) => ({
                  width: wp(38),
                  height: wp(38),
                  borderRadius: wp(19),
                  borderWidth: 1,
                  borderColor: '#4A4F55',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
              >
                <LinearGradient
                  colors={['#3A3F46', '#252A30']}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: wp(19),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                    <Line x1="12" y1="5" x2="12" y2="19" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
                    <Line x1="5" y1="12" x2="19" y2="12" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
                  </Svg>
                </LinearGradient>
              </Pressable>

              {/* Bouton Recherche — style MetalCard comme le "+" */}
              <Pressable
                delayPressIn={120}
                onPress={() => setSearchVisible(!searchVisible)}
                style={({ pressed }) => ({
                  width: wp(38),
                  height: wp(38),
                  borderRadius: wp(19),
                  borderWidth: 1,
                  borderColor: '#4A4F55',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                })}
              >
                <LinearGradient
                  colors={['#3A3F46', '#252A30']}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: wp(19),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                    <Circle cx="11" cy="11" r="7" stroke="#00D984" strokeWidth="2" fill="none"/>
                    <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
                  </Svg>
                </LinearGradient>
              </Pressable>

              {/* Champ message */}
              <View style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: 18,
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === 'ios' ? 7 : 4,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.05)',
                shadowColor: 'rgba(0,0,0,0.04)',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 1,
              }}>
                <TextInput
                  ref={inputRef}
                  style={{
                    color: '#3A4550',
                    fontSize: 12,
                    paddingVertical: 0,
                    maxHeight: 50,
                  }}
                  placeholder="Consultez ALIXEN..."
                  placeholderTextColor="rgba(0,0,0,0.2)"
                  selectionColor="#00A878"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  blurOnSubmit={false}
                  editable={!isLocked}
                />
              </View>

              {/* Bouton Envoyer — rond blanc */}
              <TouchableOpacity
                onPress={() => {
                  if (isLocked) {
                    Animated.sequence([
                      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
                      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
                      Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
                      Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
                      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
                    ]).start();
                    setShowLockModal(true);
                    return;
                  }
                  if (inputText.trim()) sendMessage();
                }}
                disabled={!inputText.trim() && !isLocked}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: isLocked ? 'rgba(40,40,50,0.8)' : '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: isLocked ? '#D85050' : 'rgba(0,0,0,0.15)',
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.5,
                  shadowRadius: 5,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: isLocked ? 'rgba(216,80,80,0.3)' : 'rgba(0,0,0,0.06)',
                }}
              >
                <Text style={{
                  color: isLocked ? '#D85050' : (inputText.trim() ? '#00A878' : 'rgba(0,0,0,0.12)'),
                  fontSize: 15,
                  fontWeight: 'bold',
                }}>
                  {isLocked ? '🔒' : '➤'}
                </Text>
              </TouchableOpacity>
            </View>
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
                  <Text style={{ color: '#4A8CDC', fontSize: 12, fontWeight: 'bold' }}>👤 Vous</Text>
                )}
                <Text style={{ color: 'rgba(0,0,0,0.2)', fontSize: 9, marginLeft: 8 }}>#{selectedMessage.index + 1}</Text>
              </View>
              <TouchableOpacity onPress={closeModal}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
                <Text style={{ color: 'rgba(0,0,0,0.4)', fontSize: 10 }}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Contenu scrollable avec surlignage et navigation */}
            <ModalScrollContent selectedMessage={selectedMessage} closeModal={closeModal} handleRecipePress={handleRecipePress} searchTerm={searchQuery} />

            {/* Heure */}
            <Text style={{ color: 'rgba(0,0,0,0.2)', fontSize: 8, marginTop: 8, textAlign: 'right' }}>
              {selectedMessage.timestamp
                ? new Date(selectedMessage.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                : ''}
            </Text>
          </View>
        </View>
      )}

      {/* === MODAL LOCK — Énergie épuisée === */}
      {showLockModal && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 500,
        }}>
          <View style={{
            backgroundColor: '#FFF',
            borderRadius: 20,
            padding: 24,
            width: SCREEN_WIDTH * 0.85,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
          }}>
            <Text style={{ fontSize: 30, marginBottom: 10 }}>🔒</Text>
            <Text style={{ color: '#1A2030', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
              Énergie épuisée
            </Text>
            <Text style={{ color: '#888', fontSize: 11, textAlign: 'center', marginBottom: 4 }}>
              {energyUsed} énergie consommée sur {energyLimit}
            </Text>
            <Text style={{ color: '#AAA', fontSize: 10, textAlign: 'center', marginBottom: 16, lineHeight: 16 }}>
              Rechargez pour continuer à consulter ALIXEN.
            </Text>

            {/* Option 1 : Recharger 100 Lix */}
            <TouchableOpacity
              onPress={() => {
                setEnergyUsed(prev => Math.max(0, prev - ENERGY_CONFIG.ENERGY_PER_RECHARGE));
                setShowLockModal(false);
                addBotMessage("Recharge de 10 énergie effectuée ! Continuons. 💚");
              }}
              style={{
                width: '100%',
                backgroundColor: '#00D984',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: 'bold' }}>
                Recharger — 100 Lix = +10 énergie
              </Text>
            </TouchableOpacity>

            {/* Option 2 : Mega recharge 500 Lix */}
            <TouchableOpacity
              onPress={() => {
                setEnergyUsed(prev => Math.max(0, prev - 50));
                setShowLockModal(false);
                addBotMessage("Recharge de 50 énergie effectuée ! ALIXEN est prête. 🚀");
              }}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,217,132,0.1)',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(0,217,132,0.2)',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#00A878', fontSize: 13, fontWeight: '600' }}>
                Mega Recharge — 500 Lix = +50 énergie
              </Text>
            </TouchableOpacity>

            {/* Option 3 : Upgrader */}
            <TouchableOpacity
              onPress={() => {
                setShowLockModal(false);
                addBotMessage("Les abonnements seront disponibles prochainement !");
              }}
              style={{
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.04)',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#1A2030', fontSize: 12 }}>
                Upgrader mon abonnement
              </Text>
            </TouchableOpacity>

            {/* Option 4 : Attendre */}
            <TouchableOpacity onPress={() => setShowLockModal(false)}>
              <Text style={{ color: '#BBB', fontSize: 10, marginTop: 4 }}>
                Attendre le rechargement (6h)
              </Text>
            </TouchableOpacity>
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
              Tu veux voir la recette "{recipeModal.name}" dans la section Repas ? {'🍽️'}
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

      {/* === BOTTOM SHEET — Ajouter un document === */}
      <Modal
        visible={showDocumentSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocumentSheet(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setShowDocumentSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24),
                borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20),
                paddingTop: wp(12),
                paddingBottom: wp(34),
              }}
            >
              {/* Poignee */}
              <View style={{
                width: wp(40), height: wp(4), borderRadius: wp(2),
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignSelf: 'center', marginBottom: wp(20),
              }}/>

              {/* Titre */}
              <Text style={{
                fontSize: fp(20), fontWeight: '700', color: '#FFFFFF', marginBottom: wp(4),
              }}>Ajouter un document</Text>
              <Text style={{
                fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(24),
              }}>Choisissez le type de fichier a analyser par ALIXEN</Text>

              {/* Option 1 : Bilan sanguin */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); console.log('Bilan sanguin'); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(0,217,132,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Path d="M14 2v6h6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Line x1="9" y1="13" x2="15" y2="13" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="9" y1="17" x2="13" y2="17" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Bilan sanguin</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Importez un fichier PDF</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 2 : Ordonnance */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); console.log('Ordonnance'); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(255,140,66,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Rect x="2" y="3" width="20" height="18" rx="2" stroke="#FF8C42" strokeWidth="1.5" fill="none"/>
                    <Circle cx="12" cy="11" r="3" stroke="#FF8C42" strokeWidth="1.5" fill="none"/>
                    <Path d="M7 21v-1a5 5 0 0110 0v1" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Ordonnance</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Prenez ou importez une photo</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 3 : Resultats labo */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); console.log('Resultats labo'); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(77,166,255,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 2v4m6-4v4" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    <Path d="M8 2h8a2 2 0 012 2v3l-3 11a2 2 0 01-2 2h-2a2 2 0 01-2-2L6 7V4a2 2 0 012-2z" stroke="#4DA6FF" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                    <Circle cx="12" cy="12" r="2" stroke="#4DA6FF" strokeWidth="1.5" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Resultats laboratoire</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>PDF ou photo de vos analyses</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 4 : Importer une conversation compactee */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); console.log('Import conversation'); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(16),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(155,109,255,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#9B6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Path d="M7 10l5 5 5-5" stroke="#9B6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Line x1="12" y1="15" x2="12" y2="3" stroke="#9B6DFF" strokeWidth="1.5" strokeLinecap="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Conversation compactee</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Reimporter depuis Secret Pocket</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Bouton Annuler */}
              <Pressable
                onPress={() => setShowDocumentSheet(false)}
                style={{
                  paddingVertical: wp(14), alignItems: 'center',
                  borderRadius: wp(14), borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
