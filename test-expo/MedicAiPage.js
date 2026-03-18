// ──────────────────────────────────────────────────────────────────────────────
// MedicAiPage.js — MedicAi : Thème Cabinet Médical + Parcours en S
// Fond gris clair, boules neumorphiques, parcours S-path + creux liquide
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Platform, Animated, KeyboardAvoidingView,
  Dimensions, StatusBar, PixelRatio, Keyboard, Pressable, Alert, Modal, ActivityIndicator,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle, Line,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';


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
// BUBBLE COLORS — Bicolore cerveau ALIXEN (Rouge IA / Bleu User)
// ============================================
const BUBBLE_COLOR_AI = '#E74C3C';    // Rouge - reponses ALIXEN
const BUBBLE_COLOR_USER = '#3498DB';  // Bleu - messages utilisateur

// ============================================
// LOCK ICON
// ============================================
const BottomSpacer = () => (
  <View style={{ height: wp(70) }} />
);

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
        width: wp(130),
        height: wp(85),
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
          <View style={{ marginBottom: 6 }}>
            {iconElement}
          </View>

          {/* Titre */}
          <Text style={{
            color: titleColor,
            fontSize: fp(12),
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
      }}>ALIXEN réfléchit...</Text>
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
          style={{ color: '#3A4550', fontSize: 13, lineHeight: fp(22) }}
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
  const bubbleColor = isBot ? BUBBLE_COLOR_AI : BUBBLE_COLOR_USER;

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

  const isActive = status === 'unread' || isSearchHit;

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { translateX: wobbleX.interpolate({ inputRange: [0, 1], outputRange: [-1, 1] }) },
        { translateY: wobbleY.interpolate({ inputRange: [0, 1], outputRange: [-0.8, 0.8] }) },
      ],
      opacity: dimmed ? 0.3 : 1,
      alignItems: 'center',
    }}>
      <Pressable onPress={() => { if (status !== 'loading') onPress(); }}>
        <View style={{
          width: wp(32),
          height: wp(32),
          borderRadius: wp(10),
          backgroundColor: isActive
            ? (isBot ? 'rgba(231,76,60,0.25)' : 'rgba(52,152,219,0.25)')
            : (isBot ? 'rgba(231,76,60,0.12)' : 'rgba(52,152,219,0.12)'),
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: isActive ? 1.5 : 0.5,
          borderColor: bubbleColor,
          ...(isActive ? {
            shadowColor: bubbleColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 6,
            elevation: 4,
          } : {}),
          overflow: 'hidden',
        }}>
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
              fontWeight: '700',
              zIndex: 1,
            }}>
              {index + 1}
            </Text>
          )}

          {/* Glow pour bulle search hit */}
          {isSearchHit && (
            <View style={{
              position: 'absolute',
              width: wp(32) + 6,
              height: wp(32) + 6,
              borderRadius: wp(10) + 3,
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

const SynapticNetwork = ({ messages, searchHits, onBallPress, onNewSession }) => {
  const totalCount = messages.length + 1; // +1 for "new session" button
  const totalRows = Math.ceil(totalCount / BALLS_PER_ROW);
  const containerHeight = totalRows * (S_BALL_SIZE + 12) + 10;

  // Position of the "new session" button = next slot after last message
  const newSessionPos = getBallPosition(messages.length);

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

      {/* Bouton Nouvelle session — dernier element du S */}
      {messages.length > 0 && (
        <View style={{
          position: 'absolute',
          left: newSessionPos.x - S_BALL_SIZE / 2,
          top: newSessionPos.y,
        }}>
          <Pressable
            delayPressIn={120}
            onPress={onNewSession}
            style={({ pressed }) => ({
              width: wp(32),
              height: wp(32),
              borderRadius: wp(10),
              backgroundColor: 'rgba(0,217,132,0.08)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(0,217,132,0.3)',
              borderStyle: 'dashed',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '300' }}>+</Text>
          </Pressable>
        </View>
      )}
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
// MEDIBOOK — DATA + ICONS
// ============================================
const mbDataStatus = [
  { name: 'Nutrition', days: 87, total: 90, percent: 96 },
  { name: 'Hydratation', days: 72, total: 90, percent: 80 },
  { name: 'Activité physique', days: 45, total: 90, percent: 50 },
  { name: 'Humeur', days: 60, total: 90, percent: 67 },
  { name: 'Conversations ALIXEN', days: 8, total: null, percent: null, status: 'OK' },
  { name: 'Secret Pocket', days: null, total: null, percent: null, status: 'Optionnel' },
];

const mbSections = [
  { icon: 'user', title: 'Page de garde', desc: 'Nom, âge, LixTag, période', color: '#00D984' },
  { icon: 'body', title: 'Profil morphologique', desc: 'Poids, taille, BMI, BMR, TDEE', color: '#4DA6FF' },
  { icon: 'food', title: 'Nutrition 3 mois', desc: 'Calories, macros, tendances', color: '#FF8C42' },
  { icon: 'water', title: 'Hydratation', desc: 'Moyenne vs objectif', color: '#4DA6FF' },
  { icon: 'run', title: 'Activité physique', desc: 'Fréquence, types, calories', color: '#00D984' },
  { icon: 'mood', title: "Courbe d'humeur", desc: 'Évolution et corrélations', color: '#9B6DFF' },
  { icon: 'alert', title: "Points d'attention", desc: 'Carences, alertes ALIXEN', color: '#FF6B6B' },
  { icon: 'qr', title: 'QR Code profil', desc: 'Lien vers votre profil Lixum', color: '#D4AF37' },
];

const MbSectionIcon = ({ type, color, size = wp(18) }) => {
  switch (type) {
    case 'user':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" /><Path d="M4 21v-1a6 6 0 0112 0v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'body':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="5" r="3" stroke={color} strokeWidth="1.5" /><Path d="M12 10v8m-4-6h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M9 22l3-4 3 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'food':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 2v8c0 1.1.9 2 2 2h2a2 2 0 002-2V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="6" y1="2" x2="6" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M18 2c0 4-2 6-2 10h4c0-4-2-6-2-10z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><Line x1="18" y1="12" x2="18" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'water':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2c-4 6-7 9-7 13a7 7 0 0014 0c0-4-3-7-7-13z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></Svg>);
    case 'run':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="14" cy="4" r="2" stroke={color} strokeWidth="1.5" /><Path d="M6 20l4-4 2 2 4-5 2 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><Path d="M10 16l-2-4 5-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'mood':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" /><Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="9" cy="10" r="0.5" fill={color} /><Circle cx="15" cy="10" r="0.5" fill={color} /></Svg>);
    case 'alert':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="12" cy="16" r="0.5" fill={color} /></Svg>);
    case 'qr':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="14" y="14" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5" /><Line x1="21" y1="14" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="14" y1="21" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    default: return null;
  }
};

const mbGetBarColor = (percent) => {
  if (percent >= 80) return '#00D984';
  if (percent >= 50) return '#FF8C42';
  return '#FF6B6B';
};

const MbProgressRow = ({ item }) => {
  const hasPercent = item.percent !== null;
  // Fix: Conversations ALIXEN = emerald, Secret Pocket = gold (not black)
  const barColor = hasPercent
    ? mbGetBarColor(item.percent)
    : item.status === 'OK' ? '#00D984' : '#D4AF37';
  const detail = item.total
    ? `${item.days} jours sur ${item.total}`
    : item.days ? `${item.days} sessions` : '';

  return (
    <View style={{ marginBottom: wp(14) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(4) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436' }}>{item.name}</Text>
          {detail ? <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)' }}>{detail}</Text> : null}
        </View>
        <Text style={{ fontSize: fp(12), fontWeight: '700', color: hasPercent ? barColor : barColor }}>
          {hasPercent ? `${item.percent}%` : item.status}
        </Text>
      </View>
      <View style={{ height: wp(6), borderRadius: wp(3), backgroundColor: '#E8ECF0', overflow: 'hidden' }}>
        <View style={{
          height: '100%',
          width: hasPercent ? `${item.percent}%` : (item.status === 'OK' ? '30%' : '15%'),
          borderRadius: wp(3), backgroundColor: barColor,
        }} />
      </View>
    </View>
  );
};

// ============================================
// SECRET POCKET — DATA + ICONS
// ============================================
const spCategories = [
  { id: 'diagnostics', title: 'Diagnostics à surveiller', desc: 'Diabète, hypertension, cholestérol...', icon: 'heart-pulse', color: '#FF6B6B', count: 2 },
  { id: 'allergies', title: 'Allergies et intolérances', desc: 'Alimentaires, médicamenteuses...', icon: 'shield-alert', color: '#FF8C42', count: 1 },
  { id: 'medications', title: 'Médicaments en cours', desc: 'Traitements actuels et posologie', icon: 'pill', color: '#4DA6FF', count: 0 },
  { id: 'lab-results', title: "Résultats d'analyses", desc: 'Bilans sanguins, examens...', icon: 'flask', color: '#00D984', count: 3 },
  { id: 'notes', title: 'Notes personnelles', desc: 'Vos observations de santé', icon: 'edit', color: '#9B6DFF', count: 5 },
  { id: 'conversations', title: 'Conversations sensibles', desc: 'Échanges privés avec ALIXEN', icon: 'message-lock', color: '#D4AF37', count: 4 },
];

const renderCategoryIcon = (iconName, color, size = wp(20)) => {
  switch (iconName) {
    case 'heart-pulse':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke={color} strokeWidth="1.5" /><Path d="M3 12h4l3-6 4 12 3-6h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'shield-alert':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke={color} strokeWidth="1.5" /><Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="12" cy="16" r="0.5" fill={color} /></Svg>);
    case 'pill':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M10.5 1.5l-8 8a4.24 4.24 0 006 6l8-8a4.24 4.24 0 00-6-6z" stroke={color} strokeWidth="1.5" /><Line x1="8" y1="8" x2="14" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'flask':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M9 2v6l-5 8a3 3 0 002.6 4.5h10.8A3 3 0 0020 16l-5-8V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="9" y1="2" x2="15" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M7 15h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'edit':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={color} strokeWidth="1.5" /></Svg>);
    case 'message-lock':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.5" /><Rect x="9" y="8" width="6" height="5" rx="1" stroke={color} strokeWidth="1.5" /><Path d="M10 8V6.5a2 2 0 014 0V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    default: return null;
  }
};

// ============================================
// SCAN STEP ROW — Ligne d'étape du scan IA
// ============================================
const ScanStepRow = ({ step, index, isLatest }) => {
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: wp(10),
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.04)',
      opacity: opacityAnim,
    }}>
      <View style={{
        width: wp(22), height: wp(22), borderRadius: wp(11),
        backgroundColor: 'rgba(0,217,132,0.15)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: wp(12),
      }}>
        <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
          <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>
      <Text style={{
        fontSize: fp(13), color: '#FFF', fontWeight: '500', flex: 1,
      }}>
        {step.text}
      </Text>
    </Animated.View>
  );
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
export default function MedicAiPage() {
  // Sub-page navigation
  const [currentSubPage, setCurrentSubPage] = useState('main');

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
  const [showNewSessionSheet, setShowNewSessionSheet] = useState(false);

  // Secret Pocket state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAddDataSheet, setShowAddDataSheet] = useState(false);
  const [showCompactConfirm, setShowCompactConfirm] = useState(false);
  const [showRechargeSheet, setShowRechargeSheet] = useState(false);
  const [showCategoryUploadSheet, setShowCategoryUploadSheet] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Navigation interne MediBook
  const [mediBookView, setMediBookView] = useState('landing');
  const [activeProfile, setActiveProfile] = useState('self');
  const [children, setChildren] = useState([
    { id: 'child-0', name: 'Mon enfant', age: '', free: true },
  ]);
  const [carnetPhotos, setCarnetPhotos] = useState([]);
  const [statsTab, setStatsTab] = useState('nutrition');

  // Données médicales chargées depuis Supabase
  const [medicalData, setMedicalData] = useState({
    analyses: [],
    medications: [],
    allergies: [],
    vaccinations: [],
    diagnostics: [],
    vitalityScore: 0,
    profileId: null,
  });
  const [medicalDataLoading, setMedicalDataLoading] = useState(false);
  const [nutritionWeekData, setNutritionWeekData] = useState(null);

  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showAddChildSheet, setShowAddChildSheet] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [showChildNameInput, setShowChildNameInput] = useState(false);
  const [newChildIsFree, setNewChildIsFree] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [showCarnetPageSheet, setShowCarnetPageSheet] = useState(false);
  const [selectedCarnetPage, setSelectedCarnetPage] = useState(null);
  const [showAnalyzeSheet, setShowAnalyzeSheet] = useState(false);

  // Upload / Scan IA
  const [uploadState, setUploadState] = useState('idle');
  const [scanResults, setScanResults] = useState(null);
  const [scanSteps, setScanSteps] = useState([]);
  const [scanContext, setScanContext] = useState(null);
  const [scanCategory, setScanCategory] = useState(null);
  const [scanFileName, setScanFileName] = useState('');

  // Énergie — valeurs dérivées
  const energyLeft = energyLimit - energyUsed;
  const energyPercent = Math.max(0, Math.min(100, (energyLeft / energyLimit) * 100));
  const getEnergyColor = (pct) => {
    if (pct > 60) return '#00D984';
    if (pct > 35) return '#F1C40F';
    if (pct > 15) return '#FF8C42';
    return '#FF6B6B';
  };
  const energyColor = getEnergyColor(energyPercent);

  // Progress bar color — evolves with message count
  const getProgressColor = () => {
    const progress = Math.min((messages.length / 30) * 100, 100);
    if (progress < 50) return 'rgba(0, 217, 132, 0.25)';
    if (progress < 75) return 'rgba(255, 140, 66, 0.25)';
    if (progress < 90) return 'rgba(255, 107, 107, 0.25)';
    return 'rgba(231, 76, 60, 0.35)';
  };

  // Refs
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const carnetPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mediBookView === 'carnet' && carnetPhotos.filter(p => p).length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(carnetPulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(carnetPulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      carnetPulseAnim.setValue(1);
    }
  }, [mediBookView, carnetPhotos]);

  // Animations d'entrée
  const contentEntry = useRef(new Animated.Value(0)).current;
  const inputEntry = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Sub-page animation refs
  const mbGenerateScale = useRef(new Animated.Value(1)).current;
  const spAddScale = useRef(new Animated.Value(1)).current;

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

  // ── Charger données médicales quand on entre dans Mes Stats ──────────────
  React.useEffect(() => {
    if (mediBookView === 'stats') {
      loadMedicalData();
    }
  }, [mediBookView]);

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
    setMessages(prev => {
      if (prev.length >= 30) {
        Alert.alert(
          'Session pleine',
          'Vous avez atteint la limite de 30 échanges par session.\n\nCompactez cette conversation pour la ranger dans votre Secret Pocket et démarrer une nouvelle session.',
          [
            { text: 'Compacter et ranger', onPress: () => console.log('Compactage vers Secret Pocket') },
            { text: 'Annuler', style: 'cancel' },
          ]
        );
        return prev;
      }
      return [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        _isNew: true,
        _status: 'read',
      }];
    });
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

  // ── Parse dates françaises ───────────────────────────────────────────────
  const parseFrenchDate = (dateStr) => {
    if (!dateStr) return null;
    const months = {
      'janvier': '01', 'février': '02', 'mars': '03', 'avril': '04',
      'mai': '05', 'juin': '06', 'juillet': '07', 'août': '08',
      'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12',
    };
    const match = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (match) {
      const month = months[match[2].toLowerCase()];
      if (month) return match[3] + '-' + month + '-' + match[1].padStart(2, '0');
    }
    const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) return slashMatch[3] + '-' + slashMatch[2] + '-' + slashMatch[1];
    return null;
  };

  // ── Chargement données médicales depuis Supabase ──────────────────────────
  const loadMedicalData = async () => {
    setMedicalDataLoading(true);
    try {
      const userId = TEST_USER_ID;
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      };

      // Charger le profil
      const profileRes = await fetch(
        SUPABASE_URL + '/rest/v1/health_profiles?user_id=eq.' + userId + '&profile_type=eq.self&limit=1',
        { headers }
      );
      const profiles = await profileRes.json();
      const profileId = profiles[0]?.id || null;
      const vitalityScore = profiles[0]?.vitality_score || 0;

      // Charger les analyses
      const analysesRes = await fetch(
        SUPABASE_URL + '/rest/v1/medical_analyses?user_id=eq.' + userId + '&order=created_at.desc',
        { headers }
      );
      const analyses = await analysesRes.json();

      // Charger les médicaments actifs
      const medsRes = await fetch(
        SUPABASE_URL + '/rest/v1/medications?user_id=eq.' + userId + '&status=eq.active&order=created_at.desc',
        { headers }
      );
      const medications = await medsRes.json();

      // Charger les allergies
      const allergiesRes = await fetch(
        SUPABASE_URL + '/rest/v1/allergies?user_id=eq.' + userId + '&order=created_at.desc',
        { headers }
      );
      const allergiesData = await allergiesRes.json();

      // Charger les vaccinations
      const vaccRes = await fetch(
        SUPABASE_URL + '/rest/v1/vaccinations?user_id=eq.' + userId + '&order=administration_date.desc',
        { headers }
      );
      const vaccinations = await vaccRes.json();

      // Charger les diagnostics
      const diagRes = await fetch(
        SUPABASE_URL + '/rest/v1/diagnostics?user_id=eq.' + userId + '&order=created_at.desc',
        { headers }
      );
      const diagnostics = await diagRes.json();

      // Charger les 7 derniers jours de nutrition
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const nutritionRes = await fetch(
        SUPABASE_URL + '/rest/v1/daily_summary?user_id=eq.' + userId +
        '&date=gte.' + sevenDaysAgo + '&date=lte.' + today + '&order=date.asc',
        { headers }
      );
      const nutritionData = await nutritionRes.json();
      if (Array.isArray(nutritionData) && nutritionData.length > 0) {
        setNutritionWeekData(nutritionData);
      }

      setMedicalData({
        analyses: Array.isArray(analyses) ? analyses : [],
        medications: Array.isArray(medications) ? medications : [],
        allergies: Array.isArray(allergiesData) ? allergiesData : [],
        vaccinations: Array.isArray(vaccinations) ? vaccinations : [],
        diagnostics: Array.isArray(diagnostics) ? diagnostics : [],
        vitalityScore: vitalityScore,
        profileId: profileId,
      });

    } catch (error) {
      console.error('Erreur chargement données médicales:', error);
    } finally {
      setMedicalDataLoading(false);
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
        'Vous avez atteint la limite de 30 échanges. Souhaitez-vous compacter cette conversation et la ranger dans votre Secret Pocket ?',
        [
          { text: 'Compacter et ranger', onPress: () => console.log('Compactage vers Secret Pocket') },
          { text: 'Continuer quand même', style: 'cancel' },
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
    setMessages(prev => {
      if (prev.length >= 30) return prev;
      return [...prev, userMsg];
    });

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
      setMessages(prev => {
        if (prev.length >= 30) return prev;
        return [...prev, botMsg];
      });

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
      setMessages(prev => {
        if (prev.length >= 30) return prev;
        return [...prev, botMsg];
      });
    }
    setIsLoading(false);
  };

  // ── UPLOAD & SCAN IA ────────────────────────────────────────────────────
  const pickDocument = async (context, category = null) => {
    try {
      setScanContext(context);
      setScanCategory(category);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      startAIScan(file.uri, file.name, file.mimeType, null);
    } catch (error) {
      console.log('Erreur sélection document:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le document.');
    }
  };

  const takePhoto = async (context, category = null) => {
    try {
      setScanContext(context);
      setScanCategory(category);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', "L'accès à la caméra est nécessaire pour scanner vos documents.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled) return;
      startAIScan(result.assets[0].uri, 'Photo capturée', 'image/jpeg', result.assets[0].base64);
    } catch (error) {
      console.log('Erreur caméra:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo.');
    }
  };

  const pickImage = async (context, category = null) => {
    try {
      setScanContext(context);
      setScanCategory(category);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', "L'accès à la galerie est nécessaire.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled) return;
      startAIScan(result.assets[0].uri, 'Image sélectionnée', 'image/jpeg', result.assets[0].base64);
    } catch (error) {
      console.log('Erreur galerie:', error);
      Alert.alert('Erreur', "Impossible de sélectionner l'image.");
    }
  };

  const callScanAPI = async (fileUri, fileName, mimeType, base64Data) => {
    try {
      let imageBase64 = base64Data;

      // Si pas de base64 fourni (cas du DocumentPicker pour les PDFs),
      // on ne peut pas lire un PDF en base64 dans Expo Snack sans FileSystem.
      // Retourner des résultats simulés réalistes pour le test.
      if (!imageBase64) {
        console.log('Document PDF sélectionné — scan simulé (Snack ne supporte pas FileSystem)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          documentType: 'Bilan sanguin complet',
          date: '15 mars 2026',
          laboratory: 'Laboratoire BioMed — Paris',
          patient: 'KIHADI Malick',
          summary: 'Bilan sanguin réalisé à jeun. Résultats globalement normaux avec anomalies au niveau du bilan lipidique et du bilan martial nécessitant un suivi.',
          data: [
            { label: 'Glycémie à jeun', value: '1.05 g/L', ref: '0.70 - 1.10 g/L', status: 'normal' },
            { label: 'Hémoglobine', value: '14.2 g/dL', ref: '13.0 - 17.0 g/dL', status: 'normal' },
            { label: 'Globules blancs', value: '7.200 G/L', ref: '4.000 - 10.000 G/L', status: 'normal' },
            { label: 'Plaquettes', value: '245 G/L', ref: '150 - 400 G/L', status: 'normal' },
            { label: 'Cholestérol total', value: '2.45 g/L', ref: '< 2.00 g/L', status: 'elevated' },
            { label: 'LDL Cholestérol', value: '1.72 g/L', ref: '< 1.60 g/L', status: 'elevated' },
            { label: 'HDL Cholestérol', value: '0.48 g/L', ref: '> 0.40 g/L', status: 'normal' },
            { label: 'Triglycérides', value: '1.25 g/L', ref: '< 1.50 g/L', status: 'normal' },
            { label: 'Fer sérique', value: '45 µg/dL', ref: '60 - 170 µg/dL', status: 'low' },
            { label: 'Ferritine', value: '18 ng/mL', ref: '30 - 300 ng/mL', status: 'low' },
            { label: 'Transferrine', value: '3.8 g/L', ref: '2.0 - 3.6 g/L', status: 'elevated' },
            { label: 'Vitamine D', value: '22 ng/mL', ref: '30 - 100 ng/mL', status: 'low' },
            { label: 'Vitamine B12', value: '380 pg/mL', ref: '200 - 900 pg/mL', status: 'normal' },
            { label: 'Créatinine', value: '9.8 mg/L', ref: '7.0 - 13.0 mg/L', status: 'normal' },
            { label: 'ASAT (TGO)', value: '28 UI/L', ref: '< 40 UI/L', status: 'normal' },
            { label: 'ALAT (TGP)', value: '32 UI/L', ref: '< 41 UI/L', status: 'normal' },
          ],
          medications: [],
          alerts: [
            'Cholestérol total et LDL élevés — Surveiller l\'alimentation, réduire les graisses saturées',
            'Fer sérique et ferritine bas — Risque d\'anémie ferriprive, consulter votre médecin',
            'Transferrine élevée — Confirme la carence en fer (compensation physiologique)',
            'Vitamine D insuffisante — Supplémentation recommandée',
          ],
          category: 'lab-results',
        };
      }

      // Si base64 disponible (photo depuis caméra ou galerie), appeler la VRAIE API
      const response = await fetch(`${SUPABASE_URL}/functions/v1/scan-medical`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          imageBase64: imageBase64,
          mimeType: mimeType || 'image/jpeg',
          userId: TEST_USER_ID,
          context: scanContext || 'medibook',
          category: scanCategory || 'lab-results',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Scan API error:', errorText);
        return { error: 'L\'analyse a échoué. Réessayez.' };
      }

      return await response.json();
    } catch (error) {
      console.error('Scan API call error:', error);
      return { error: 'Erreur de connexion. Vérifiez votre réseau.' };
    }
  };

  const startAIScan = async (fileUri, fileName, mimeType, base64Data = null) => {
    setUploadState('scanning');
    setScanSteps([]);
    setScanResults(null);
    setScanFileName(fileName || 'Document');

    const steps = [
      { text: 'Ouverture du document...', delay: 800 },
      { text: 'Détection du type de document...', delay: 1200 },
      { text: 'Lecture du contenu...', delay: 1000 },
      { text: 'Envoi à ALIXEN pour analyse...', delay: 1500 },
    ];

    // Jouer les étapes d'animation PENDANT que l'API travaille
    const animationPromise = (async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, steps[i].delay));
        setScanSteps(prev => [...prev, { text: steps[i].text, completed: true }]);
      }
    })();

    // EN PARALLÈLE, lancer le vrai appel API
    const apiPromise = callScanAPI(fileUri, fileName, mimeType, base64Data);

    // Attendre les deux
    const [_, apiResult] = await Promise.all([animationPromise, apiPromise]);

    // Ajouter les dernières étapes après retour API
    const postSteps = [
      'Analyse des valeurs et références...',
      'Identification des points d\'attention...',
      'Préparation du résumé...',
    ];

    for (let i = 0; i < postSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setScanSteps(prev => [...prev, { text: postSteps[i], completed: true }]);
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    if (apiResult.error) {
      Alert.alert('Erreur d\'analyse', apiResult.error);
      setUploadState('idle');
      return;
    }

    setScanResults(apiResult);
    setUploadState('results');
  };

  // ── RENDER SCANNING SCREEN ─────────────────────────────────────────────
  const renderScanningScreen = () => (
    <View style={{ flex: 1, backgroundColor: '#1A1D22', paddingHorizontal: wp(20), paddingTop: wp(60), paddingBottom: wp(70) }}>
      {/* Bouton retour */}
      <Pressable
        onPress={() => {
          setUploadState('idle');
          setScanSteps([]);
        }}
        style={{
          position: 'absolute', top: wp(16), left: wp(16), zIndex: 10,
          width: wp(36), height: wp(36), borderRadius: wp(18),
          backgroundColor: 'rgba(255,255,255,0.08)',
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Text style={{ color: '#FFF', fontSize: fp(18) }}>{"<"}</Text>
      </Pressable>

      <View style={{ alignItems: 'center', marginBottom: wp(40) }}>
        <View style={{
          width: wp(70), height: wp(70), borderRadius: wp(35),
          backgroundColor: 'rgba(0,217,132,0.1)',
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', marginBottom: wp(16),
        }}>
          <Svg width={wp(32)} height={wp(32)} viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <Path d="M14 2v6h6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </View>
        <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
          ALIXEN analyse...
        </Text>
        <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)' }}>
          {scanFileName}
        </Text>
        <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.25)', marginTop: wp(2) }}>
          Ne fermez pas l'application
        </Text>
      </View>

      <View style={{ paddingHorizontal: wp(8) }}>
        {scanSteps.map((step, index) => (
          <View key={index} style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: wp(10),
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.04)',
          }}>
            <View style={{
              width: wp(22), height: wp(22), borderRadius: wp(11),
              backgroundColor: 'rgba(0,217,132,0.15)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: wp(12),
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700' }}>{'✓'}</Text>
            </View>
            <Text style={{
              fontSize: fp(13),
              color: index === scanSteps.length - 1 ? '#00D984' : 'rgba(255,255,255,0.6)',
              fontWeight: index === scanSteps.length - 1 ? '600' : '400',
              flex: 1,
            }}>
              {step.text}
            </Text>
          </View>
        ))}
        {scanSteps.length < 7 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), opacity: 0.6 }}>
            <ActivityIndicator size="small" color="#00D984" style={{ marginRight: wp(12) }} />
            <Text style={{ fontSize: fp(13), color: 'rgba(0,217,132,0.7)', fontStyle: 'italic' }}>
              Traitement en cours...
            </Text>
          </View>
        )}
      </View>

      <View style={{ position: 'absolute', bottom: wp(40), left: wp(20), right: wp(20) }}>
        <Pressable onPress={() => { setUploadState('idle'); setScanSteps([]); }}
          style={{ alignItems: 'center', padding: wp(14) }}>
          <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text>
        </Pressable>
      </View>
    </View>
  );

  // ── RENDER SCAN RESULTS ────────────────────────────────────────────────
  const renderScanResults = () => (
    <ScrollView style={{ flex: 1, backgroundColor: '#1A1D22' }} contentContainerStyle={{ paddingBottom: wp(50) }}>
      <View style={{ paddingHorizontal: wp(16), paddingTop: wp(20) }}>
        {/* Bouton retour */}
        <Pressable
          onPress={() => {
            Alert.alert(
              'Quitter l\'analyse ?',
              'Les données extraites seront perdues.',
              [
                { text: 'Quitter', style: 'destructive', onPress: () => {
                  setUploadState('idle');
                  setScanResults(null);
                  setScanSteps([]);
                }},
                { text: 'Continuer', style: 'cancel' },
              ]
            );
          }}
          style={{
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            marginBottom: wp(8),
          }}
        >
          <Text style={{ color: '#FFF', fontSize: fp(18) }}>{"<"}</Text>
        </Pressable>

        {/* Header résultats */}
        <View style={{ alignItems: 'center', marginBottom: wp(24) }}>
          <View style={{
            width: wp(50), height: wp(50), borderRadius: wp(25),
            backgroundColor: 'rgba(0,217,132,0.12)',
            justifyContent: 'center', alignItems: 'center', marginBottom: wp(12),
          }}>
            <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
          <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>Analyse terminée</Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>
            Vérifiez les données avant de valider
          </Text>
        </View>

        {/* Info document */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14),
          marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
            {scanResults?.documentType}
          </Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)' }}>
            {scanResults?.date} — {scanResults?.source}
          </Text>
          {scanResults?.laboratory && scanResults.laboratory !== 'Non spécifié' && (
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>
              {scanResults.laboratory}
            </Text>
          )}
          <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.6)', marginTop: wp(8), lineHeight: fp(19) }}>
            {scanResults?.summary}
          </Text>
        </View>

        {/* Données extraites */}
        <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
          Données extraites
        </Text>
        {scanResults?.data.map((item, index) => (
          <View key={index} style={{
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: wp(12), paddingHorizontal: wp(12),
            backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(10), marginBottom: wp(6),
            borderLeftWidth: wp(3),
            borderLeftColor: item.status === 'normal' ? '#00D984' : item.status === 'elevated' ? '#FF8C42' : '#FF6B6B',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{item.label}</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>Réf: {item.ref}</Text>
            </View>
            <Text style={{
              fontSize: fp(14), fontWeight: '700',
              color: item.status === 'normal' ? '#00D984' : item.status === 'elevated' ? '#FF8C42' : '#FF6B6B',
            }}>{item.value}</Text>
          </View>
        ))}

        {/* Section Médicaments (si ordonnance) */}
        {scanResults?.medications && scanResults.medications.length > 0 && (
          <View style={{ marginTop: wp(16) }}>
            <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#4DA6FF', marginBottom: wp(10) }}>
              Médicaments prescrits
            </Text>
            {scanResults.medications.map((med, index) => (
              <View key={index} style={{
                paddingVertical: wp(12), paddingHorizontal: wp(12),
                backgroundColor: 'rgba(77,166,255,0.06)',
                borderRadius: wp(10), marginBottom: wp(6),
                borderLeftWidth: wp(3), borderLeftColor: '#4DA6FF',
              }}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>
                  {med.name}
                </Text>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.5)', marginTop: wp(2) }}>
                  {med.dosage} — {med.frequency} — {med.duration}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Alertes */}
        {scanResults?.alerts && scanResults.alerts.length > 0 && (
          <View style={{ marginTop: wp(16) }}>
            <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FF6B6B', marginBottom: wp(10) }}>
              Points d'attention
            </Text>
            {scanResults.alerts.map((alertText, index) => (
              <View key={index} style={{
                flexDirection: 'row', alignItems: 'flex-start',
                paddingVertical: wp(10), paddingHorizontal: wp(12),
                backgroundColor: 'rgba(255,107,107,0.06)', borderRadius: wp(10), marginBottom: wp(6),
                borderWidth: 1, borderColor: 'rgba(255,107,107,0.1)',
              }}>
                <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8), marginTop: wp(2) }}>
                  <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FF6B6B" strokeWidth="1.5"/>
                  <Line x1="12" y1="9" x2="12" y2="13" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                  <Circle cx="12" cy="16" r="0.5" fill="#FF6B6B"/>
                </Svg>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,107,107,0.8)', flex: 1, lineHeight: fp(17) }}>
                  {alertText}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Boutons */}
        <View style={{ marginTop: wp(28), marginBottom: wp(40) }}>
          <Pressable delayPressIn={120}
            onPress={async () => {
              setUploadState('integrating');

              try {
                const userId = TEST_USER_ID;
                const headers = {
                  'apikey': SUPABASE_ANON_KEY,
                  'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal',
                };

                // 1. Sauvegarder le document scanné
                await fetch(SUPABASE_URL + '/rest/v1/scanned_documents', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    user_id: userId,
                    document_type: scanResults.documentType || 'Document médical',
                    document_date: scanResults.date || null,
                    laboratory: scanResults.laboratory || null,
                    patient_name: scanResults.patient || null,
                    summary: scanResults.summary || '',
                    raw_ai_response: scanResults,
                    scan_context: scanContext || 'medibook',
                    scan_category: scanCategory || 'lab-results',
                    items_extracted: (scanResults.data?.length || 0) + (scanResults.medications?.length || 0),
                  }),
                });

                // 2. Insérer les analyses médicales
                if (scanResults.data && scanResults.data.length > 0) {
                  const analysesInsert = scanResults.data.map(item => ({
                    user_id: userId,
                    label: item.label,
                    value: item.value,
                    value_numeric: parseFloat(item.value) || null,
                    unit: item.value.split(' ').pop() || null,
                    reference_range: item.ref || null,
                    status: item.status || 'normal',
                    category: scanResults.documentType || 'Bilan',
                    document_date: scanResults.date ? parseFrenchDate(scanResults.date) : null,
                    laboratory: scanResults.laboratory || null,
                  }));

                  await fetch(SUPABASE_URL + '/rest/v1/medical_analyses', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(analysesInsert),
                  });
                }

                // 3. Insérer les médicaments
                if (scanResults.medications && scanResults.medications.length > 0) {
                  const medsInsert = scanResults.medications.map(med => ({
                    user_id: userId,
                    name: med.name,
                    dosage: med.dosage || null,
                    frequency: med.frequency || null,
                    duration: med.duration || null,
                    status: 'active',
                  }));

                  await fetch(SUPABASE_URL + '/rest/v1/medications', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(medsInsert),
                  });
                }

                // 4. Succès
                setUploadState('idle');
                setScanResults(null);
                setScanSteps([]);

                Alert.alert(
                  'Données intégrées ✓',
                  'Les informations ont été ajoutées avec succès. Consultez vos Mes Stats pour voir les résultats.',
                );

                // Recharger les données si on est dans un contexte MediBook
                if (scanContext === 'medibook' || scanContext === 'secretpocket') {
                  loadMedicalData();
                }

              } catch (error) {
                console.error('Erreur insertion Supabase:', error);
                setUploadState('idle');
                Alert.alert('Erreur', "L'intégration a échoué. Réessayez.");
              }
            }}>
            <LinearGradient colors={['#00D984', '#00B871']}
              style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(10) }}>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Valider et intégrer</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.7)', marginTop: wp(2) }}>
                {scanContext === 'secretpocket'
                  ? 'Ajouter dans ' + (scanCategory || 'Secret Pocket')
                  : 'Intégrer dans votre MediBook'}
              </Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => { setUploadState('idle'); setScanResults(null); setScanSteps([]); }}
            style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.4)' }}>Rejeter et supprimer</Text>
          </Pressable>
        </View>
      </View>
      <BottomSpacer />
    </ScrollView>
  );

  // ── CAPTURE CARNET PAGE ──────────────────────────────────────────────────
  const captureCarnetPage = (index) => {
    setSelectedCarnetPage(index);
    setShowCarnetPageSheet(true);
  };

  // ── LIXUM TABLE COMPONENT ───────────────────────────────────────────────
  const renderLixumTable = (title, columns, rows, accentColor = '#00D984') => {
    return (
      <View style={{
        backgroundColor: '#FAFBFC', borderRadius: wp(16),
        overflow: 'hidden', marginBottom: wp(12),
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
      }}>
        <LinearGradient
          colors={['#3A3F46', '#252A30']}
          style={{
            flexDirection: 'row', paddingVertical: wp(10), paddingHorizontal: wp(12),
          }}
        >
          {columns.map((col, i) => (
            <Text key={i} style={{
              flex: col.flex || 1,
              fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.7)',
              letterSpacing: 0.5, textTransform: 'uppercase',
              textAlign: col.align || 'left',
            }}>
              {col.label}
            </Text>
          ))}
        </LinearGradient>

        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{
            flexDirection: 'row', paddingVertical: wp(10), paddingHorizontal: wp(12),
            borderBottomWidth: rowIndex < rows.length - 1 ? 1 : 0,
            borderBottomColor: 'rgba(0,0,0,0.04)',
            backgroundColor: rowIndex % 2 === 0 ? '#FAFBFC' : '#F5F6F8',
          }}>
            {row.map((cell, cellIndex) => (
              <Text key={cellIndex} style={{
                flex: columns[cellIndex]?.flex || 1,
                fontSize: fp(12),
                fontWeight: cell.bold ? '600' : '400',
                color: cell.color || '#2D3436',
                textAlign: columns[cellIndex]?.align || 'left',
              }}>
                {cell.text || cell}
              </Text>
            ))}
          </View>
        ))}

        {rows.length === 0 && (
          <View style={{ padding: wp(20), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>
              Aucune donnée enregistrée
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ── PROFILE SWITCH BUTTON COMPONENT ──────────────────────────────────────
  const renderProfileSwitchButton = () => (
    <Pressable
      onPress={() => setShowProfileSwitcher(true)}
      delayPressIn={120}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,217,132,0.12)',
        borderRadius: wp(12),
        paddingHorizontal: wp(8),
        paddingVertical: wp(5),
        borderWidth: 1,
        borderColor: 'rgba(0,217,132,0.2)',
        maxWidth: wp(90),
      }}
    >
      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(4) }}>
        <Path d="M17 1l4 4-4 4" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M3 11V9a4 4 0 014-4h14" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M7 23l-4-4 4-4" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M21 13v2a4 4 0 01-4 4H3" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
      <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }} numberOfLines={1}>
        {activeProfile === 'self' ? 'Moi' : (children.find(c => c.id === activeProfile)?.name || 'Enfant')}
      </Text>
    </Pressable>
  );

  // ── RENDER MEDIBOOK LANDING ────────────────────────────────────────────────
  const renderMediBookLanding = () => (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#3A3F46', '#252A30']}
        style={{
          paddingTop: Platform.OS === 'android' ? 35 : 50,
          paddingBottom: wp(12), paddingHorizontal: wp(12),
          flexDirection: 'row', alignItems: 'center',
          borderBottomWidth: 1, borderBottomColor: '#4A4F55',
        }}
      >
        <Pressable delayPressIn={120} onPress={() => { setMediBookView('landing'); setCurrentSubPage('main'); }}
          style={({ pressed }) => ({
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            marginRight: wp(10),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>MediBook</Text>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Votre rapport santé</Text>
        </View>
        {renderProfileSwitchButton()}
        <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(10), paddingHorizontal: wp(8), paddingVertical: wp(4), marginLeft: wp(6) }}>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>500 Lix</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(20), paddingBottom: wp(50) }}>
        {/* Carte 1 : Importer mon carnet de santé */}
        <Pressable delayPressIn={120} onPress={() => setMediBookView('carnet')}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              borderRadius: wp(20), padding: wp(24),
              marginBottom: wp(16), borderWidth: 1, borderColor: '#4A4F55',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: wp(16) }}>
              <Svg width={wp(50)} height={wp(50)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="16" height="20" rx="2" stroke="#00D984" strokeWidth="1.5"/>
                <Line x1="4" y1="2" x2="4" y2="22" stroke="#00D984" strokeWidth="3" strokeLinecap="round"/>
                <Line x1="8" y1="6" x2="16" y2="6" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Line x1="8" y1="10" x2="16" y2="10" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Line x1="8" y1="14" x2="14" y2="14" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Circle cx="18" cy="18" r="5" fill="#252A30" stroke="#00D984" strokeWidth="1.5"/>
                <Circle cx="18" cy="18" r="2" stroke="#00D984" strokeWidth="1.2"/>
              </Svg>
            </View>
            <Text style={{ fontSize: fp(17), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: wp(6) }}>
              Importer mon carnet de santé
            </Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: fp(17) }}>
              Photographiez les pages de votre carnet physique. ALIXEN scannera et extraira toutes les informations.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Carte 2 : Continuer avec mes données */}
        <Pressable delayPressIn={120} onPress={() => setMediBookView('report')}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              borderRadius: wp(20), padding: wp(24),
              marginBottom: wp(16), borderWidth: 1, borderColor: '#4A4F55',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: wp(16) }}>
              <Svg width={wp(50)} height={wp(50)} viewBox="0 0 24 24" fill="none">
                <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            <Text style={{ fontSize: fp(17), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: wp(6) }}>
              Continuer avec mes données
            </Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: fp(17) }}>
              Utilisez les données enregistrées dans l'app (nutrition, activité, humeur) pour générer votre rapport.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Carte 3 : Mes Stats */}
        <Pressable delayPressIn={120} onPress={() => setMediBookView('stats')}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(14),
            padding: wp(14), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
          }}>
            <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(12) }}>
              <Line x1="18" y1="20" x2="18" y2="10" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
              <Line x1="12" y1="20" x2="12" y2="4" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
              <Line x1="6" y1="20" x2="6" y2="14" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#2D3436' }}>Mes Stats</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)' }}>Graphiques et évolution santé</Text>
            </View>
            <Text style={{ fontSize: fp(16), color: 'rgba(0,0,0,0.2)' }}>{">"}</Text>
          </View>
        </Pressable>

        {/* Section info en bas du landing */}
        <View style={{ marginTop: wp(20), paddingHorizontal: wp(4) }}>
          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#2D3436', marginBottom: wp(12) }}>
            Comment ça marche ?
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(14) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(0,217,132,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '700' }}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436', marginBottom: wp(2) }}>
                Photographiez ou importez
              </Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', lineHeight: fp(16) }}>
                Votre carnet de santé, bilans, ordonnances, résultats d'analyses...
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(14) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(77,166,255,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#4DA6FF', fontSize: fp(13), fontWeight: '700' }}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436', marginBottom: wp(2) }}>
                ALIXEN analyse tout
              </Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', lineHeight: fp(16) }}>
                Vaccins, médicaments, diagnostics, allergies — chaque info va dans la bonne section.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(20) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(212,175,55,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#D4AF37', fontSize: fp(13), fontWeight: '700' }}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436', marginBottom: wp(2) }}>
                Générez votre MediBook
              </Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', lineHeight: fp(16) }}>
                Un rapport PDF complet à imprimer pour votre médecin. 500 Lix.
              </Text>
            </View>
          </View>
        </View>
        <BottomSpacer />
      </ScrollView>
    </View>
  );

  // ── RENDER CARNET CAPTURE ──────────────────────────────────────────────────
  const renderCarnetCapture = () => {
    const caseSize = (Dimensions.get('window').width - wp(16) * 2 - wp(8) * 3) / 4;
    const capturedCount = carnetPhotos.filter(p => p).length;

    return (
      <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}
        >
          <Pressable delayPressIn={120} onPress={() => setMediBookView('landing')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>Carnet de santé</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>25 emplacements disponibles</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(50) }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) }}>
            {Array.from({ length: 25 }, (_, index) => (
              carnetPhotos[index] ? (
                <Pressable
                  key={index}
                  onPress={() => {
                    Alert.alert(
                      'Page ' + (index + 1),
                      'Supprimer cette photo ?',
                      [
                        { text: 'Supprimer', style: 'destructive', onPress: () => {
                          setCarnetPhotos(prev => {
                            const updated = [...prev];
                            updated[index] = undefined;
                            return updated;
                          });
                        }},
                        { text: 'Annuler', style: 'cancel' },
                      ]
                    );
                  }}
                  style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), overflow: 'hidden',
                    borderWidth: 2, borderColor: '#00D984',
                  }}
                >
                  <Image
                    source={{ uri: carnetPhotos[index].uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  <View style={{
                    position: 'absolute', top: wp(2), left: wp(2),
                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: wp(8),
                    paddingHorizontal: wp(4), paddingVertical: wp(1),
                  }}>
                    <Text style={{ color: '#FFF', fontSize: fp(8), fontWeight: '700' }}>{index + 1}</Text>
                  </View>
                </Pressable>
              ) : (index === 0 && capturedCount === 0) ? (
                <Pressable key={index} onPress={() => captureCarnetPage(0)}>
                  <Animated.View style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), borderWidth: 2,
                    borderColor: '#00D984', borderStyle: 'dashed',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(0,217,132,0.08)',
                    transform: [{ scale: carnetPulseAnim }],
                  }}>
                    <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none" style={{ marginBottom: wp(4) }}>
                      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <Circle cx="12" cy="13" r="4" stroke="#00D984" strokeWidth="1.5"/>
                    </Svg>
                    <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '600' }}>
                      Commencez ici
                    </Text>
                  </Animated.View>
                </Pressable>
              ) : (
                <Pressable
                  key={index}
                  onPress={() => captureCarnetPage(index)}
                  style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fp(16) }}>+</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.15)', fontSize: fp(8), marginTop: wp(2) }}>{index + 1}</Text>
                </Pressable>
              )
            ))}
          </View>

          <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: wp(12) }}>
            {capturedCount} page{capturedCount > 1 ? 's' : ''} capturée{capturedCount > 1 ? 's' : ''} sur 25
          </Text>

          {capturedCount > 0 && (
            <View style={{ marginTop: wp(20), paddingHorizontal: wp(8) }}>
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  const photos = carnetPhotos.filter(p => p);
                  if (photos.length === 0) return;
                  setShowAnalyzeSheet(true);
                }}
              >
                <LinearGradient
                  colors={['#00D984', '#00B871']}
                  style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center' }}
                >
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>
                    Intégrer ({capturedCount} page{capturedCount > 1 ? 's' : ''})
                  </Text>
                </LinearGradient>
              </Pressable>
              <Text style={{
                fontSize: fp(12), color: 'rgba(255,255,255,0.3)',
                textAlign: 'center', marginTop: wp(10),
              }}>
                Vous pouvez ajouter d'autres pages avant d'intégrer
              </Text>
            </View>
          )}
          <BottomSpacer />
        </ScrollView>
      </View>
    );
  };

  // ── RENDER MEDIBOOK STATS ──────────────────────────────────────────────────
  const renderMediBookStats = () => {
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const caloriesData = [1920, 1750, 2050, 1800, 1650, 2200, 1850];
    const burnedData = [320, 280, 450, 180, 510, 0, 220];
    const moodData = [3, 4, 3, 2, 4, 5, 4];

    const StatsCard = ({ title, children: cardChildren }) => (
      <View style={{
        backgroundColor: '#FAFBFC', borderRadius: wp(16),
        padding: wp(16), marginBottom: wp(12),
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
      }}>
        <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#2D3436', marginBottom: wp(12) }}>
          {title}
        </Text>
        {cardChildren}
      </View>
    );

    const renderNutritionTab = () => {
      // Données live ou fallback hardcodé
      const hasLiveData = nutritionWeekData && nutritionWeekData.length > 0;
      const liveCalories = hasLiveData ? nutritionWeekData.map(d => d.total_calories || 0) : caloriesData;
      const avgCalories = hasLiveData
        ? Math.round(liveCalories.reduce((s, c) => s + c, 0) / liveCalories.length)
        : 1850;
      const liveProtein = hasLiveData
        ? Math.round(nutritionWeekData.reduce((s, d) => s + (d.total_protein || 0), 0) / nutritionWeekData.length)
        : 92;
      const liveCarbs = hasLiveData
        ? Math.round(nutritionWeekData.reduce((s, d) => s + (d.total_carbs || 0), 0) / nutritionWeekData.length)
        : 215;
      const liveFat = hasLiveData
        ? Math.round(nutritionWeekData.reduce((s, d) => s + (d.total_fat || 0), 0) / nutritionWeekData.length)
        : 62;
      const totalMacros = liveProtein + liveCarbs + liveFat || 1;
      const pctProtein = Math.round((liveProtein / totalMacros) * 100);
      const pctCarbs = Math.round((liveCarbs / totalMacros) * 100);
      const pctFat = 100 - pctProtein - pctCarbs;
      const calPct = Math.min(100, Math.round((avgCalories / 2100) * 100));

      const chartCalories = hasLiveData ? liveCalories : caloriesData;
      const chartDays = hasLiveData
        ? nutritionWeekData.map(d => {
            const dt = new Date(d.date);
            return ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][dt.getDay()];
          })
        : weekDays;

      return (
        <>
          <StatsCard title="Calories moyennes / jour">
            <Text style={{ fontSize: fp(28), fontWeight: '700', color: '#00D984' }}>{avgCalories.toLocaleString('fr-FR')} kcal</Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)', marginTop: wp(4) }}>Objectif : 2 100 kcal</Text>
            <View style={{ height: wp(6), backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: wp(3), marginTop: wp(10) }}>
              <View style={{ width: calPct + '%', height: '100%', backgroundColor: '#00D984', borderRadius: wp(3) }} />
            </View>
          </StatsCard>

          <StatsCard title="Répartition macros">
            {[
              { label: 'Protéines', value: liveProtein + 'g', pct: pctProtein, color: '#4DA6FF' },
              { label: 'Glucides', value: liveCarbs + 'g', pct: pctCarbs, color: '#00D984' },
              { label: 'Lipides', value: liveFat + 'g', pct: pctFat, color: '#FF8C42' },
            ].map((macro, i) => (
              <View key={i} style={{ marginBottom: wp(10) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                  <Text style={{ fontSize: fp(12), color: '#2D3436', fontWeight: '600' }}>{macro.label}</Text>
                  <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)' }}>{macro.value} — {macro.pct}%</Text>
                </View>
                <View style={{ height: wp(6), backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: wp(3) }}>
                  <View style={{ width: macro.pct + '%', height: '100%', backgroundColor: macro.color, borderRadius: wp(3) }} />
                </View>
              </View>
            ))}
          </StatsCard>

          <StatsCard title="Derniers 7 jours">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: wp(80) }}>
              {chartCalories.map((cal, i) => {
                const maxCal = Math.max(2200, ...chartCalories);
                const h = (cal / maxCal) * wp(65);
                const inTarget = cal >= 1800 && cal <= 2200;
                return (
                  <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ width: wp(16), height: h, backgroundColor: inTarget ? '#00D984' : '#FF8C42', borderRadius: wp(4) }} />
                    <Text style={{ fontSize: fp(8), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>{chartDays[i] || ''}</Text>
                  </View>
                );
              })}
            </View>
          </StatsCard>
        </>
      );
    };

    const renderSanteTab = () => {
      if (medicalDataLoading) {
        return (
          <View style={{ padding: wp(40), alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#00D984" />
            <Text style={{ fontSize: fp(13), color: 'rgba(0,0,0,0.4)', marginTop: wp(10) }}>
              Chargement des données...
            </Text>
          </View>
        );
      }

      const analysesRows = medicalData.analyses.map(a => [
        { text: a.label, bold: true },
        a.value,
        {
          text: a.status === 'normal' ? 'Normal'
            : a.status === 'elevated' ? 'Élevé'
            : a.status === 'low' ? 'Bas'
            : a.status === 'critical' ? 'Critique'
            : a.status,
          color: a.status === 'normal' ? '#00D984'
            : a.status === 'elevated' ? '#FF6B6B'
            : a.status === 'low' ? '#FF8C42'
            : a.status === 'critical' ? '#FF6B6B'
            : '#999',
          bold: true,
        },
      ]);

      const medsRows = medicalData.medications.map(m => [
        { text: m.name, bold: true },
        (m.dosage || '') + (m.frequency ? ' / ' + m.frequency : ''),
        { text: m.duration || '-', color: '#00D984' },
      ]);

      const allergiesRows = medicalData.allergies.map(a => [
        { text: a.allergen, bold: true },
        a.type || '-',
        {
          text: a.severity === 'severe' ? 'Sévère'
            : a.severity === 'moderate' ? 'Modéré'
            : a.severity === 'mild' ? 'Léger'
            : a.severity === 'life_threatening' ? 'Vital'
            : a.severity || '-',
          color: a.severity === 'severe' || a.severity === 'life_threatening' ? '#FF6B6B'
            : a.severity === 'moderate' ? '#FF8C42'
            : '#00D984',
          bold: true,
        },
      ]);

      const vaccRows = medicalData.vaccinations.map(v => {
        const dateStr = v.administration_date
          ? new Date(v.administration_date).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })
          : '-';
        const rappelStr = v.next_due_date
          ? 'Rappel ' + new Date(v.next_due_date).getFullYear()
          : '✓ À jour';
        const rappelColor = v.next_due_date ? '#FF8C42' : '#00D984';

        return [
          { text: v.vaccine_name, bold: true },
          dateStr,
          { text: rappelStr, color: rappelColor },
        ];
      });

      return (
        <>
          <StatsCard title="Score Vitalité">
            <View style={{ alignItems: 'center', marginVertical: wp(8) }}>
              <View style={{
                width: wp(100), height: wp(100), borderRadius: wp(50),
                borderWidth: wp(6), borderColor: '#00D984',
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: 'rgba(0,217,132,0.05)',
              }}>
                <Text style={{ fontSize: fp(28), fontWeight: '800', color: '#00D984' }}>{medicalData.vitalityScore || 0}</Text>
                <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.3)' }}>/100</Text>
              </View>
            </View>
          </StatsCard>

          {renderLixumTable('Analyses',
            [{ label: 'Analyse', flex: 2 }, { label: 'Valeur', flex: 1.2 }, { label: 'Statut', flex: 1, align: 'right' }],
            analysesRows,
            '#00D984'
          )}

          {renderLixumTable('Médicaments',
            [{ label: 'Médicament', flex: 2 }, { label: 'Posologie', flex: 1.5 }, { label: 'Durée', flex: 1, align: 'right' }],
            medsRows,
            '#4DA6FF'
          )}

          {renderLixumTable('Allergies',
            [{ label: 'Allergène', flex: 2 }, { label: 'Type', flex: 1.5 }, { label: 'Sévérité', flex: 1, align: 'right' }],
            allergiesRows,
            '#FF8C42'
          )}

          {renderLixumTable('Vaccins',
            [{ label: 'Vaccin', flex: 2 }, { label: 'Date', flex: 1.2 }, { label: 'Rappel', flex: 1, align: 'right' }],
            vaccRows,
            '#00D984'
          )}
        </>
      );
    };

    const renderActiviteTab = () => (
      <>
        <StatsCard title="Cette semaine">
          <Text style={{ fontSize: fp(28), fontWeight: '700', color: '#00D984' }}>12 450 pas / jour</Text>
          <Text style={{ fontSize: fp(16), fontWeight: '600', color: '#4DA6FF', marginTop: wp(6) }}>4h32 d'activité</Text>
        </StatsCard>

        <StatsCard title="Calories brûlées">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: wp(80) }}>
            {burnedData.map((cal, i) => {
              const maxCal = 510;
              const h = Math.max(wp(4), (cal / maxCal) * wp(65));
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{ width: wp(16), height: h, backgroundColor: '#FF8C42', borderRadius: wp(4) }} />
                  <Text style={{ fontSize: fp(8), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>{weekDays[i]}</Text>
                </View>
              );
            })}
          </View>
        </StatsCard>
      </>
    );

    const renderHumeurTab = () => (
      <>
        <StatsCard title="Humeur moyenne">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
            <Text style={{ fontSize: fp(32) }}>😊</Text>
            <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#00D984' }}>Plutôt bien</Text>
          </View>
        </StatsCard>

        <StatsCard title="Courbe 7 jours">
          <View style={{ height: wp(80), flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {moodData.map((val, i) => {
              const h = (val / 5) * wp(65);
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: wp(10), height: wp(10), borderRadius: wp(5),
                    backgroundColor: '#00D984',
                    marginBottom: h,
                  }} />
                  <Text style={{ fontSize: fp(8), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>{weekDays[i]}</Text>
                </View>
              );
            })}
          </View>
        </StatsCard>
      </>
    );

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}
        >
          <Pressable delayPressIn={120} onPress={() => setMediBookView('landing')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>Mes Stats</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(50) }}>
          {/* Onglets */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: wp(12) }}>
            {['nutrition', 'santé', 'activité', 'humeur'].map(tab => (
              <Pressable
                key={tab}
                onPress={() => setStatsTab(tab)}
                style={{
                  paddingHorizontal: wp(18), paddingVertical: wp(8),
                  borderRadius: wp(20), marginRight: wp(8),
                  backgroundColor: statsTab === tab ? '#00D984' : 'rgba(0,0,0,0.05)',
                }}
              >
                <Text style={{
                  fontSize: fp(13), fontWeight: '600',
                  color: statsTab === tab ? '#FFF' : '#2D3436',
                }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {statsTab === 'nutrition' && renderNutritionTab()}
          {statsTab === 'santé' && renderSanteTab()}
          {statsTab === 'activité' && renderActiviteTab()}
          {statsTab === 'humeur' && renderHumeurTab()}
          <BottomSpacer />
        </ScrollView>
      </View>
    );
  };

  // ── RENDER MEDIBOOK REPORT (ancien contenu) ────────────────────────────────
  const renderMediBookReport = () => (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <LinearGradient
        colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
        style={{
          paddingTop: Platform.OS === 'android' ? 35 : 50,
          paddingBottom: wp(12), paddingHorizontal: wp(12),
          flexDirection: 'row', alignItems: 'center',
          borderBottomWidth: 1, borderBottomColor: '#4A4F55',
        }}
      >
        <Pressable delayPressIn={120} onPress={() => setMediBookView('landing')}
          style={({ pressed }) => ({
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            marginRight: wp(10),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>MediBook</Text>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Votre rapport santé</Text>
        </View>
        {renderProfileSwitchButton()}
        <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(10), paddingHorizontal: wp(8), paddingVertical: wp(4), marginLeft: wp(6) }}>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>500 Lix</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(50) }}>
        {/* Illustration — compact spacing */}
        <View style={{ alignItems: 'center', marginTop: wp(8), marginBottom: wp(6) }}>
          <Svg width={wp(56)} height={wp(56)} viewBox="0 0 64 64" fill="none">
            <Rect x="12" y="8" width="28" height="48" rx="3" stroke="#00D984" strokeWidth="1.5" />
            <Line x1="18" y1="18" x2="34" y2="18" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="24" x2="34" y2="24" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="30" x2="30" y2="30" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="36" x2="28" y2="36" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="46" cy="20" r="6" stroke="#00D984" strokeWidth="1.5" />
            <Path d="M46 26v10c0 4-3 7-7 7s-7-3-7-7" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="46" cy="20" r="2" fill="#00D984" />
          </Svg>
        </View>

        {/* Etat des donnees */}
        <View style={{
          backgroundColor: '#FAFBFC', borderRadius: wp(16),
          borderLeftWidth: wp(3), borderLeftColor: '#00D984',
          padding: wp(16), marginBottom: wp(20),
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
        }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', marginBottom: wp(16) }}>
            État de vos données
          </Text>
          {mbDataStatus.map((item, i) => <MbProgressRow key={i} item={item} />)}
        </View>

        {/* Contenu du rapport */}
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', marginTop: wp(4), marginBottom: wp(14) }}>
          Contenu de votre MediBook
        </Text>
        {mbSections.map((sec, i) => (
          <LinearGradient key={i} colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: wp(12), padding: wp(12), marginBottom: wp(8),
              borderWidth: 1, borderColor: '#4A4F55',
            }}>
            <View style={{
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: `${sec.color}20`,
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <MbSectionIcon type={sec.icon} color={sec.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: fp(13), fontWeight: '600' }}>{sec.title}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(11) }}>{sec.desc}</Text>
            </View>
          </LinearGradient>
        ))}

        {/* Bouton Generer */}
        <Pressable delayPressIn={120}
          onPress={() => Alert.alert('MediBook', 'La génération de votre MediBook sera disponible prochainement !')}
          onPressIn={() => Animated.timing(mbGenerateScale, { toValue: 0.95, duration: 120, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(mbGenerateScale, { toValue: 1, useNativeDriver: true }).start()}>
          <Animated.View style={{ transform: [{ scale: mbGenerateScale }], marginTop: wp(24), marginBottom: wp(32) }}>
            <LinearGradient colors={['#00D984', '#00B871']}
              style={{ borderRadius: wp(16), paddingVertical: wp(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(10) }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="12" height="18" rx="2" stroke="#FFF" strokeWidth="1.5" />
                <Line x1="8" y1="7" x2="12" y2="7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Line x1="8" y1="11" x2="12" y2="11" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Path d="M16 8l4 4-4 4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: fp(16), fontWeight: '700' }}>Générer mon MediBook</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fp(11) }}>500 Lix — Rapport PDF 3 mois</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
        <BottomSpacer />
      </ScrollView>
    </View>
  );

  // ── RENDER MEDIBOOK (ROUTER) ───────────────────────────────────────────────
  const renderMediBook = () => {
    if (mediBookView === 'carnet') return renderCarnetCapture();
    if (mediBookView === 'stats') return renderMediBookStats();
    if (mediBookView === 'report') return renderMediBookReport();
    return renderMediBookLanding();
  };

  // ── RENDER SECRET POCKET — LOCKED ──────────────────────────────────────
  const renderSecretPocketLocked = () => (
    <LinearGradient colors={['#1A1D22', '#252A30', '#1A1D22']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View style={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(16) }}>
        <Pressable delayPressIn={120}
          onPress={() => { setIsUnlocked(false); setCurrentSubPage('main'); }}
          style={({ pressed }) => ({
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
            justifyContent: 'center', alignItems: 'center',
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: wp(70) }}>
        <Svg width={wp(90)} height={wp(90)} viewBox="0 0 64 64" fill="none">
          <Path d="M32 4L8 16v12c0 16.5 10.2 31.9 24 36 13.8-4.1 24-19.5 24-36V16L32 4z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" />
          <Rect x="22" y="26" width="20" height="16" rx="3" stroke="#D4AF37" strokeWidth="1.5" />
          <Path d="M26 26v-4a6 6 0 0112 0v4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="32" cy="34" r="2" fill="#D4AF37" />
          <Line x1="32" y1="36" x2="32" y2="39" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
        <Text style={{ color: '#D4AF37', fontSize: fp(24), fontWeight: '800', letterSpacing: 1, marginTop: wp(20) }}>Secret Pocket</Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(13), marginTop: wp(6) }}>Votre coffre-fort santé confidentiel</Text>

        <Pressable delayPressIn={120} onPress={() => setIsUnlocked(true)}
          style={({ pressed }) => ({
            width: wp(70), height: wp(70), borderRadius: wp(35),
            backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1.5, borderColor: '#D4AF37',
            justifyContent: 'center', alignItems: 'center', marginTop: wp(32),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(34)} height={wp(34)} viewBox="0 0 24 24" fill="none">
            <Path d="M3.5 11c0-4.69 3.81-8.5 8.5-8.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M20.5 11c0-4.69-3.81-8.5-8.5-8.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M5.5 11c0-3.59 2.91-6.5 6.5-6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M18.5 11c0-3.59-2.91-6.5-6.5-6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M7.5 11a4.5 4.5 0 014.5-4.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M16.5 11a4.5 4.5 0 00-4.5-4.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M9.5 11a2.5 2.5 0 015 0" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M3.5 11v1.5c0 2.5 1 4.8 2.6 6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M20.5 11v1.5c0 2.5-1 4.8-2.6 6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M5.5 11v3c0 2 1.2 3.8 3 5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M18.5 11v3c0 2-1.2 3.8-3 5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M9.5 11v5c0 1 .5 2 1.5 2.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M14.5 11v5c0 1-.5 2-1.5 2.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M12 11v8" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
          </Svg>
        </Pressable>
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: fp(11), marginTop: wp(12) }}>Appuyez pour déverrouiller</Text>
      </View>

      {/* Texte confiance — fixed: paddingBottom wp(50) */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: wp(6), paddingBottom: wp(50), marginBottom: wp(10),
      }}>
        <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
          <Rect x="5" y="11" width="14" height="10" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <Path d="M8 11V7a4 4 0 018 0v4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fp(10) }}>Chiffrement de bout en bout</Text>
      </View>
    </LinearGradient>
  );

  // ── RENDER SECRET POCKET — UNLOCKED ────────────────────────────────────
  const renderSecretPocketUnlocked = () => (
    <LinearGradient colors={['#1A1D22', '#252A30', '#1E2328']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingBottom: wp(12), paddingHorizontal: wp(16),
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: 'rgba(74,79,85,0.5)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(12) }}>
          <Pressable delayPressIn={120}
            onPress={() => { setIsUnlocked(false); setCurrentSubPage('main'); }}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: '#252A30', borderWidth: 1, borderColor: '#4A4F55',
              justifyContent: 'center', alignItems: 'center',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View>
            <Text style={{ color: '#D4AF37', fontSize: fp(20), fontWeight: '700' }}>Secret Pocket</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(11) }}>Espace confidentiel</Text>
          </View>
        </View>
        <Pressable delayPressIn={120}
          onPress={() => {
            Alert.alert(
              'Verrouiller',
              'Votre Secret Pocket sera verrouillé.',
              [
                { text: 'Verrouiller', onPress: () => { setIsUnlocked(false); setCurrentSubPage('main'); } },
                { text: 'Annuler', style: 'cancel' },
              ]
            );
          }}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: wp(4),
            backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
            borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: wp(5),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
            <Rect x="5" y="11" width="14" height="10" rx="2" stroke="#D4AF37" strokeWidth="1.5" />
            <Path d="M8 11V7a4 4 0 018 0v4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '600' }}>Verrouiller</Text>
        </Pressable>
      </View>

      {/* Indicateur securite */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: wp(6),
        backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(8),
        marginHorizontal: wp(16), marginTop: wp(10), marginBottom: wp(16),
        padding: wp(8), paddingHorizontal: wp(12),
      }}>
        <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" />
        </Svg>
        <Text style={{ color: 'rgba(212,175,55,0.6)', fontSize: fp(10) }}>Chiffré et sécurisé — Auto-lock 30s</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(50) }}>
        {/* Categories — MetalCard gradient */}
        {spCategories.map((cat) => (
          <Pressable key={cat.id} delayPressIn={120}
            onPress={() => console.log('Ouvrir ' + cat.id)}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }], marginBottom: wp(10) })}>
            <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
              style={{
                flexDirection: 'row', alignItems: 'center',
                borderRadius: wp(16), padding: wp(16),
                borderWidth: 1, borderColor: '#4A4F55',
              }}>
              <View style={{
                width: wp(44), height: wp(44), borderRadius: wp(22),
                backgroundColor: `${cat.color}1F`,
                justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
              }}>
                {renderCategoryIcon(cat.icon, cat.color)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: fp(14), fontWeight: '600' }}>{cat.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: fp(11), marginTop: wp(2) }}>{cat.desc}</Text>
              </View>
              {cat.count > 0 ? (
                <View style={{
                  width: wp(24), height: wp(24), borderRadius: wp(12),
                  backgroundColor: `${cat.color}33`,
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(8),
                }}>
                  <Text style={{ color: cat.color, fontSize: fp(11), fontWeight: '700' }}>{cat.count}</Text>
                </View>
              ) : (
                <View style={{
                  width: wp(24), height: wp(24), borderRadius: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(8),
                }}>
                  <Text style={{ fontSize: fp(11), fontWeight: '600', color: 'rgba(255,255,255,0.2)' }}>0</Text>
                </View>
              )}
              <Text style={{ color: 'rgba(255,255,255,0.15)', fontSize: fp(16) }}>{">"}</Text>
            </LinearGradient>
          </Pressable>
        ))}

        {/* Bouton ajouter — opens bottom sheet */}
        <Pressable delayPressIn={120}
          onPress={() => setShowAddDataSheet(true)}
          onPressIn={() => Animated.timing(spAddScale, { toValue: 0.95, duration: 120, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(spAddScale, { toValue: 1, useNativeDriver: true }).start()}>
          <Animated.View style={{ transform: [{ scale: spAddScale }], marginTop: wp(16), marginBottom: wp(32) }}>
            <LinearGradient colors={['#D4AF37', '#B8941F']}
              style={{ borderRadius: wp(16), paddingVertical: wp(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(8) }}>
              <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={{ color: '#FFFFFF', fontSize: fp(15), fontWeight: '700' }}>Ajouter des données</Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>
        <BottomSpacer />
      </ScrollView>
    </LinearGradient>
  );

  // ── RENDER SECRET POCKET — Dispatcher ──────────────────────────────────
  const renderSecretPocket = () => {
    if (!isUnlocked) return renderSecretPocketLocked();
    return renderSecretPocketUnlocked();
  };

  // ── RENDER CONTENT (conditionnel) ─────────────────────────────────────
  const renderContent = () => {
    if (uploadState === 'scanning') return renderScanningScreen();
    if (uploadState === 'results') return renderScanResults();
    if (uploadState === 'integrating') {
      return (
        <View style={{ flex: 1, backgroundColor: '#1A1D22', justifyContent: 'center', alignItems: 'center', paddingBottom: wp(70) }}>
          <ActivityIndicator size="large" color="#00D984" />
          <Text style={{ fontSize: fp(16), fontWeight: '600', color: '#FFF', marginTop: wp(16) }}>
            Intégration en cours...
          </Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>
            Organisation des données
          </Text>
        </View>
      );
    }
    if (currentSubPage === 'medibook') return renderMediBook();
    if (currentSubPage === 'secretpocket') return renderSecretPocket();
    return renderMain();
  };

  // ── RENDER MAIN (page principale MedicAi) ──────────────────────────────
  const renderMain = () => (
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
        <View style={{ alignItems: 'flex-end' }}>
          {energyLeft > 0 ? (
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
              <Svg width={wp(10)} height={wp(10)} viewBox="0 0 24 24" fill="#00D984">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </Svg>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00D984' }} />
              <Text style={{ color: '#00A878', fontSize: 10 }}>En ligne</Text>
            </View>
          ) : (
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: wp(12), paddingHorizontal: wp(10), paddingVertical: wp(4),
              borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)',
              backgroundColor: 'rgba(255,107,107,0.08)',
              gap: 4,
            }}>
              <Svg width={wp(10)} height={wp(10)} viewBox="0 0 24 24" fill="#FF6B6B">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </Svg>
              <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), backgroundColor: '#FF6B6B' }} />
              <Text style={{ fontSize: fp(11), fontWeight: '600', color: '#FF6B6B' }}>Hors énergie</Text>
            </View>
          )}
          <Text style={{
            fontSize: fp(9),
            fontWeight: '600',
            color: 'rgba(0,217,132,0.4)',
            letterSpacing: 1.5,
            marginTop: wp(3),
          }}>LXM-2K7F4A</Text>
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
            paddingHorizontal: wp(24),
            marginTop: 8,
            marginBottom: wp(14),
          }}>
            <MetalCard
              title="MediBook"
              iconElement={
                <Svg width={wp(30)} height={wp(30)} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="2" width="14" height="20" rx="2" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                  <Line x1="7" y1="8" x2="13" y2="8" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="7" y1="12" x2="13" y2="12" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="7" y1="16" x2="11" y2="16" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="21" y1="2" x2="21" y2="6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  <Line x1="19" y1="4" x2="23" y2="4" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                </Svg>
              }
              onPress={() => setCurrentSubPage('medibook')}
            />
            <MetalCard
              title="Secret Pocket"
              titleColor="#D4AF37"
              iconElement={
                <Svg width={wp(30)} height={wp(30)} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                  <Rect x="9" y="10" width="6" height="5" rx="1" stroke="#D4AF37" strokeWidth="1.5" fill="none"/>
                  <Path d="M10 10V8a2 2 0 014 0v2" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                </Svg>
              }
              onPress={() => setCurrentSubPage('secretpocket')}
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
              onNewSession={() => setShowNewSessionSheet(true)}
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
            marginHorizontal: wp(12),
            marginBottom: wp(12),
            borderRadius: wp(28),
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
            position: 'relative',
          }}>
            {/* Barre de progression — couleur évolue selon le remplissage */}
            <View style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: `${Math.min((messages.length / 30) * 100, 100)}%`,
              backgroundColor: getProgressColor(),
              borderTopLeftRadius: wp(28),
              borderBottomLeftRadius: wp(28),
            }}/>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: wp(4),
              paddingVertical: wp(4),
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

              {/* Champ message — zone délimitée */}
              <View style={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                borderRadius: wp(20),
                paddingHorizontal: wp(14),
                marginHorizontal: wp(6),
                borderWidth: 1,
                borderColor: 'rgba(0, 0, 0, 0.06)',
              }}>
                <TextInput
                  ref={inputRef}
                  style={{
                    fontSize: fp(14),
                    color: '#2D3436',
                    paddingVertical: wp(8),
                    maxHeight: 50,
                  }}
                  placeholder="Votre message"
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  selectionColor="#00A878"
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  blurOnSubmit={false}
                  editable={!isLocked}
                />
              </View>

              {/* Bouton Envoyer / X rouge si énergie vide */}
              {isLocked ? (
                <Pressable
                  delayPressIn={120}
                  onPress={() => setShowRechargeSheet(true)}
                  style={({ pressed }) => ({
                    width: wp(38), height: wp(38), borderRadius: wp(19),
                    backgroundColor: 'rgba(255,107,107,0.15)',
                    borderWidth: 1.5, borderColor: '#FF6B6B',
                    justifyContent: 'center', alignItems: 'center',
                    transform: [{ scale: pressed ? 0.92 : 1 }],
                  })}
                >
                  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                    <Line x1="18" y1="6" x2="6" y2="18" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round"/>
                    <Line x1="6" y1="6" x2="18" y2="18" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round"/>
                  </Svg>
                </Pressable>
              ) : (
                <TouchableOpacity
                  onPress={() => { if (inputText.trim()) sendMessage(); }}
                  disabled={!inputText.trim()}
                  style={{
                    width: 38, height: 38, borderRadius: 19,
                    backgroundColor: '#FFFFFF',
                    justifyContent: 'center', alignItems: 'center',
                    shadowColor: 'rgba(0,0,0,0.15)',
                    shadowOffset: { width: 3, height: 3 },
                    shadowOpacity: 0.5, shadowRadius: 5, elevation: 5,
                    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
                  }}
                >
                  <Text style={{
                    color: inputText.trim() ? '#00D984' : 'rgba(0,0,0,0.12)',
                    fontSize: 15, fontWeight: 'bold',
                  }}>{'➤'}</Text>
                </TouchableOpacity>
              )}
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
    </View>
  );

  // ── RENDER ALL MODALS (toujours rendus) ──────────────────────────────────
  const renderAllModals = () => (
    <>
      {/* Bottom Sheet — Ajouter des données (Secret Pocket) */}
      <Modal visible={showAddDataSheet} transparent animationType="slide" onRequestClose={() => setShowAddDataSheet(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={() => setShowAddDataSheet(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34) }}>
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(20) }} />
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>Ajouter des données</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>Dans quelle catégorie souhaitez-vous ajouter ?</Text>
              {spCategories.map((cat) => (
                <Pressable key={cat.id} delayPressIn={120}
                  onPress={() => {
                    setShowAddDataSheet(false);
                    setTimeout(() => {
                      setSelectedCategory(cat);
                      setShowCategoryUploadSheet(true);
                    }, 300);
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: wp(12), paddingHorizontal: wp(12),
                    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: wp(14), marginBottom: wp(8),
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                  }}>
                  <View style={{
                    width: wp(40), height: wp(40), borderRadius: wp(10),
                    backgroundColor: cat.color + '18',
                    justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                  }}>
                    {renderCategoryIcon(cat.icon, cat.color, wp(18))}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>{cat.title}</Text>
                    <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)' }}>{cat.desc}</Text>
                  </View>
                  <Text style={{ fontSize: fp(16), color: 'rgba(255,255,255,0.2)' }}>{">"}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setShowAddDataSheet(false)}
                style={{ marginTop: wp(8), paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Sheet — Upload catégorie Secret Pocket */}
      <Modal visible={showCategoryUploadSheet} transparent animationType="slide" onRequestClose={() => setShowCategoryUploadSheet(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={() => setShowCategoryUploadSheet(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34) }}>
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(20) }} />
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>{selectedCategory?.title}</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>Comment souhaitez-vous ajouter des données ?</Text>
              <Pressable delayPressIn={120}
                onPress={() => { setShowCategoryUploadSheet(false); setTimeout(() => pickImage('secretpocket', selectedCategory?.id), 300); }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(14), paddingHorizontal: wp(12), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: wp(14), marginBottom: wp(10), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(0,217,132,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                    <Circle cx="8.5" cy="8.5" r="1.5" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                    <Path d="M21 15l-5-5L5 21" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>Depuis la galerie</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Charger une photo existante</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>
              <Pressable delayPressIn={120}
                onPress={() => { setShowCategoryUploadSheet(false); setTimeout(() => takePhoto('secretpocket', selectedCategory?.id), 300); }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(14), paddingHorizontal: wp(12), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: wp(14), marginBottom: wp(10), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(255,140,66,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Circle cx="12" cy="13" r="4" stroke="#FF8C42" strokeWidth="1.5" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>Prendre une photo</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Utiliser la caméra</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>
              <Pressable delayPressIn={120}
                onPress={() => { setShowCategoryUploadSheet(false); setTimeout(() => pickDocument('secretpocket', selectedCategory?.id), 300); }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(14), paddingHorizontal: wp(12), backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: wp(14), marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(77,166,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Path d="M14 2v6h6" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>Scanner un document</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>PDF, Word ou image</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>
              <Pressable onPress={() => setShowCategoryUploadSheet(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

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
              }}>Ajouter un fichier</Text>
              <Text style={{
                fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(24),
              }}>Que souhaitez-vous envoyer à ALIXEN ?</Text>

              {/* Option 1 : Charger une photo */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); setTimeout(() => pickImage('medibook'), 300); }}
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
                    <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                    <Circle cx="8.5" cy="8.5" r="1.5" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                    <Path d="M21 15l-5-5L5 21" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>Charger une photo</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Depuis votre galerie</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 2 : Prendre une photo */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); setTimeout(() => takePhoto('medibook'), 300); }}
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
                    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Circle cx="12" cy="13" r="4" stroke="#FF8C42" strokeWidth="1.5" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>Prendre une photo</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Utiliser la caméra</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 3 : Importer un document */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); setTimeout(() => pickDocument('medibook'), 300); }}
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
                    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Path d="M14 2v6h6" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>Importer un document</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>PDF, Word ou image</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 4 : Uploader mes macros */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); Alert.alert('Macros', 'ALIXEN va vous guider pour partager vos macronutriments. Cette fonctionnalité arrive très bientôt !'); }}
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
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Line x1="18" y1="20" x2="18" y2="10" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="12" y1="20" x2="12" y2="4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="6" y1="20" x2="6" y2="14" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>Uploader mes macros</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Partager vos données nutritionnelles</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 5 : Conversation compactée */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowDocumentSheet(false); setTimeout(() => pickDocument('secretpocket', 'conversations'), 300); }}
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
                    <Rect x="3" y="6" width="18" height="14" rx="2" stroke="#9B6DFF" strokeWidth="1.5"/>
                    <Path d="M3 10h18" stroke="#9B6DFF" strokeWidth="1.5"/>
                    <Line x1="12" y1="3" x2="12" y2="6" stroke="#9B6DFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="12" y1="10" x2="12" y2="20" stroke="#9B6DFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="3" y1="15" x2="21" y2="15" stroke="#9B6DFF" strokeWidth="1.5" strokeLinecap="round"/>
                    <Circle cx="12" cy="15" r="1.5" stroke="#9B6DFF" strokeWidth="1.5"/>
                    <Path d="M8 2l0 2.5" stroke="#9B6DFF" strokeWidth="1.2" strokeLinecap="round"/>
                    <Path d="M16 2l0 2.5" stroke="#9B6DFF" strokeWidth="1.2" strokeLinecap="round"/>
                    <Path d="M6.5 3L8 4.5 9.5 3" stroke="#9B6DFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M14.5 3L16 4.5 17.5 3" stroke="#9B6DFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Conversation compactée</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Réimporter depuis Secret Pocket</Text>
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

      {/* === BOTTOM SHEET — Nouvelle session === */}
      <Modal
        visible={showNewSessionSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewSessionSheet(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setShowNewSessionSheet(false)}
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
              }}>Nouvelle session</Text>
              <Text style={{
                fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(24), lineHeight: fp(18),
              }}>Que souhaitez-vous faire de cette conversation ?</Text>

              {/* Option 1 : Compacter et ranger */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowNewSessionSheet(false);
                  setTimeout(() => setShowCompactConfirm(true), 300);
                }}
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
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="6" width="18" height="14" rx="2" stroke="#D4AF37" strokeWidth="1.5"/>
                    <Path d="M3 10h18" stroke="#D4AF37" strokeWidth="1.5"/>
                    <Line x1="12" y1="3" x2="12" y2="6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="12" y1="10" x2="12" y2="20" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="3" y1="15" x2="21" y2="15" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Circle cx="12" cy="15" r="1.5" stroke="#D4AF37" strokeWidth="1.5"/>
                    <Path d="M8 2l0 2.5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                    <Path d="M16 2l0 2.5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                    <Path d="M6.5 3L8 4.5 9.5 3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M14.5 3L16 4.5 17.5 3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Compacter et ranger</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Sauvegarder dans votre Secret Pocket</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 2 : Demarrer a zero */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowNewSessionSheet(false); console.log('Nouvelle session vierge'); }}
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
                    <Circle cx="12" cy="12" r="9" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                    <Line x1="12" y1="8" x2="12" y2="16" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="8" y1="12" x2="16" y2="12" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Nouvelle session vierge</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Sans sauvegarder la conversation</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 3 : Supprimer */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowNewSessionSheet(false); console.log('Session supprimée'); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,107,107,0.05)',
                  borderRadius: wp(14), marginBottom: wp(16),
                  borderWidth: 1, borderColor: 'rgba(255,107,107,0.1)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(255,107,107,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FF6B6B', marginBottom: wp(2) }}>Supprimer la session</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,107,107,0.4)' }}>Cette action est irréversible</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,107,107,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Bouton Annuler */}
              <Pressable
                onPress={() => setShowNewSessionSheet(false)}
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

      {/* ===== MODAL — Confirmation Compacter et ranger ===== */}
      <Modal
        visible={showCompactConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompactConfirm(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24),
        }}>
          <LinearGradient
            colors={['#2A2F36', '#1E2328', '#252A30']}
            style={{
              borderRadius: wp(20), paddingHorizontal: wp(24), paddingVertical: wp(28),
              width: '100%', alignItems: 'center',
            }}
          >
            {/* Icone boite compactée gold */}
            <View style={{
              width: wp(60), height: wp(60), borderRadius: wp(30),
              backgroundColor: 'rgba(212,175,55,0.12)',
              justifyContent: 'center', alignItems: 'center', marginBottom: wp(16),
              borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
            }}>
              <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="6" width="18" height="14" rx="2" stroke="#D4AF37" strokeWidth="1.5"/>
                <Path d="M3 10h18" stroke="#D4AF37" strokeWidth="1.5"/>
                <Line x1="12" y1="3" x2="12" y2="6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                <Line x1="12" y1="10" x2="12" y2="20" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                <Line x1="3" y1="15" x2="21" y2="15" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                <Circle cx="12" cy="15" r="1.5" stroke="#D4AF37" strokeWidth="1.5"/>
                <Path d="M8 2l0 2.5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                <Path d="M16 2l0 2.5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                <Path d="M6.5 3L8 4.5 9.5 3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M14.5 3L16 4.5 17.5 3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>

            <Text style={{
              fontSize: fp(18), fontWeight: '700', color: '#FFFFFF',
              textAlign: 'center', marginBottom: wp(8),
            }}>Compacter cette discussion ?</Text>

            <Text style={{
              fontSize: fp(13), color: 'rgba(255,255,255,0.5)',
              textAlign: 'center', lineHeight: fp(19), marginBottom: wp(8),
            }}>
              Votre conversation sera compactée et rangée dans votre Secret Pocket.
            </Text>

            {/* Info securite */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(212,175,55,0.08)',
              borderRadius: wp(10), padding: wp(10),
              marginBottom: wp(24), width: '100%',
            }}>
              <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8) }}>
                <Path d="M3.5 11c0-4.69 3.81-8.5 8.5-8.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M20.5 11c0-4.69-3.81-8.5-8.5-8.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M5.5 11c0-3.59 2.91-6.5 6.5-6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M18.5 11c0-3.59-2.91-6.5-6.5-6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M9.5 11a2.5 2.5 0 015 0" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M3.5 11v1.5c0 2.5 1 4.8 2.6 6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M20.5 11v1.5c0 2.5-1 4.8-2.6 6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M12 11v8" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
              </Svg>
              <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.7)', flex: 1 }}>
                Vous aurez besoin de votre empreinte digitale pour la retrouver dans Secret Pocket.
              </Text>
            </View>

            {/* Bouton Confirmer */}
            <Pressable
              delayPressIn={120}
              onPress={() => {
                setShowCompactConfirm(false);
                console.log('Discussion compactée vers Secret Pocket');
              }}
              style={{ width: '100%', marginBottom: wp(10) }}
            >
              <LinearGradient
                colors={['#D4AF37', '#B8941F']}
                style={{
                  width: '100%', paddingVertical: wp(14),
                  borderRadius: wp(14), alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>
                  Confirmer et ranger
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Bouton Annuler */}
            <Pressable
              onPress={() => setShowCompactConfirm(false)}
              style={{ width: '100%', paddingVertical: wp(12), alignItems: 'center' }}
            >
              <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* ===== MODAL — Recharge énergie ===== */}
      <Modal
        visible={showRechargeSheet}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRechargeSheet(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24),
        }}>
          <LinearGradient
            colors={['#2A2F36', '#1E2328', '#252A30']}
            style={{
              borderRadius: wp(20), paddingHorizontal: wp(24), paddingVertical: wp(28),
              width: '100%', alignItems: 'center',
            }}
          >
            {/* Icône éclair barré */}
            <View style={{
              width: wp(60), height: wp(60), borderRadius: wp(30),
              backgroundColor: 'rgba(255,107,107,0.12)',
              justifyContent: 'center', alignItems: 'center',
              marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)',
            }}>
              <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#FF6B6B" strokeWidth="1.5" strokeLinejoin="round"/>
                <Line x1="4" y1="4" x2="20" y2="20" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            </View>

            <Text style={{
              fontSize: fp(18), fontWeight: '700', color: '#FFFFFF',
              textAlign: 'center', marginBottom: wp(8),
            }}>Énergie épuisée</Text>

            <Text style={{
              fontSize: fp(13), color: 'rgba(255,255,255,0.5)',
              textAlign: 'center', lineHeight: fp(19), marginBottom: wp(20),
            }}>
              Vous avez utilisé toute votre énergie pour cette session. Rechargez pour continuer à discuter avec ALIXEN.
            </Text>

            {/* Option : Recharger avec Lix */}
            <Pressable delayPressIn={120}
              onPress={() => {
                setEnergyUsed(prev => Math.max(0, prev - ENERGY_CONFIG.ENERGY_PER_RECHARGE));
                setShowRechargeSheet(false);
              }}
              style={{ width: '100%', marginBottom: wp(10) }}>
              <LinearGradient colors={['#00D984', '#00B871']}
                style={{
                  width: '100%', paddingVertical: wp(14),
                  borderRadius: wp(14), alignItems: 'center',
                  flexDirection: 'row', justifyContent: 'center',
                }}>
                <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8) }}>
                  <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FFFFFF"/>
                </Svg>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>
                  Recharger — 100 Lix = 10 énergie
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Info délai */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: wp(10), padding: wp(12),
              marginBottom: wp(16), width: '100%',
            }}>
              <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8) }}>
                <Circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <Line x1="12" y1="7" x2="12" y2="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                <Line x1="12" y1="12" x2="15" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
              </Svg>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', flex: 1 }}>
                Ou attendez la recharge automatique toutes les 6 heures
              </Text>
            </View>

            {/* Bouton Fermer */}
            <Pressable onPress={() => setShowRechargeSheet(false)}
              style={{
                width: '100%', paddingVertical: wp(12), alignItems: 'center',
                borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              }}>
              <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Fermer</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* ===== MODAL — Profil Switcher MediBook ===== */}
      <Modal
        visible={showProfileSwitcher}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileSwitcher(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowProfileSwitcher(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(20) }}/>

              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                Changer de profil
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>
                Sélectionnez le carnet à consulter
              </Text>

              {/* Mon carnet */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setActiveProfile('self'); setShowProfileSwitcher(false); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: activeProfile === 'self' ? 'rgba(0,217,132,0.1)' : 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1,
                  borderColor: activeProfile === 'self' ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(22),
                  backgroundColor: 'rgba(0,217,132,0.15)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="8" r="4" stroke="#00D984" strokeWidth="1.5"/>
                    <Path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF' }}>Mon carnet</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>LXM-2K7F4A</Text>
                </View>
                {activeProfile === 'self' && (
                  <View style={{ width: wp(22), height: wp(22), borderRadius: wp(11), backgroundColor: '#00D984', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: fp(12), fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </Pressable>

              {/* Enfants */}
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  delayPressIn={120}
                  onPress={() => {
                    if (child.name === 'Mon enfant' || child.name.startsWith('Enfant ')) {
                      setShowProfileSwitcher(false);
                      setNewChildIsFree(child.free);
                      setNewChildName('');
                      setEditingChildId(child.id);
                      setTimeout(() => setShowChildNameInput(true), 400);
                    } else {
                      setActiveProfile(child.id);
                      setShowProfileSwitcher(false);
                    }
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: wp(14), paddingHorizontal: wp(12),
                    backgroundColor: activeProfile === child.id ? 'rgba(77,166,255,0.1)' : 'rgba(255,255,255,0.05)',
                    borderRadius: wp(14), marginBottom: wp(10),
                    borderWidth: 1,
                    borderColor: activeProfile === child.id ? 'rgba(77,166,255,0.3)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <View style={{
                    width: wp(44), height: wp(44), borderRadius: wp(22),
                    backgroundColor: 'rgba(77,166,255,0.15)',
                    justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                  }}>
                    <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="8" r="3" stroke="#4DA6FF" strokeWidth="1.5"/>
                      <Path d="M8 21v-1a4 4 0 018 0v1" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round"/>
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF' }}>{child.name}</Text>
                    <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>
                      {child.free ? 'Gratuit' : '5 000 Lix'}
                    </Text>
                  </View>
                  {activeProfile === child.id && (
                    <View style={{ width: wp(22), height: wp(22), borderRadius: wp(11), backgroundColor: '#4DA6FF', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#FFF', fontSize: fp(12), fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}

              {/* Ajouter un enfant */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowProfileSwitcher(false);
                  const isFree = children.length === 0;
                  setNewChildIsFree(isFree);
                  setNewChildName('');
                  setEditingChildId(null);
                  setTimeout(() => setShowChildNameInput(true), 400);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  borderRadius: wp(14), marginBottom: wp(12),
                  borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)', borderStyle: 'dashed',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(22),
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Text style={{ color: '#D4AF37', fontSize: fp(20), fontWeight: '300' }}>+</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#D4AF37' }}>Ajouter un enfant</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.5)' }}>
                    {children.length === 0 ? '1er enfant gratuit' : '5 000 Lix par enfant'}
                  </Text>
                </View>
              </Pressable>

              <Pressable onPress={() => setShowProfileSwitcher(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Fermer</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Sheet — Carnet Page (Photo / Galerie) */}
      <Modal
        visible={showCarnetPageSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCarnetPageSheet(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowCarnetPageSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(20) }}/>

              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                Page {selectedCarnetPage !== null ? selectedCarnetPage + 1 : ''}
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>
                Comment souhaitez-vous ajouter cette page ?
              </Text>

              {/* Prendre une photo */}
              <Pressable
                delayPressIn={120}
                onPress={async () => {
                  setShowCarnetPageSheet(false);
                  const permission = await ImagePicker.requestCameraPermissionsAsync();
                  if (!permission.granted) return;
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                    base64: true,
                  });
                  if (!result.canceled) {
                    const photo = result.assets[0];
                    setCarnetPhotos(prev => {
                      const updated = [...prev];
                      updated[selectedCarnetPage] = { uri: photo.uri, base64: photo.base64, index: selectedCarnetPage };
                      return updated;
                    });
                  }
                }}
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
                    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Circle cx="12" cy="13" r="4" stroke="#FF8C42" strokeWidth="1.5"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Prendre une photo</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Photographier la page du carnet</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Depuis la galerie */}
              <Pressable
                delayPressIn={120}
                onPress={async () => {
                  setShowCarnetPageSheet(false);
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                    base64: true,
                  });
                  if (!result.canceled) {
                    const photo = result.assets[0];
                    setCarnetPhotos(prev => {
                      const updated = [...prev];
                      updated[selectedCarnetPage] = { uri: photo.uri, base64: photo.base64, index: selectedCarnetPage };
                      return updated;
                    });
                  }
                }}
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
                  backgroundColor: 'rgba(0,217,132,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#00D984" strokeWidth="1.5"/>
                    <Circle cx="8.5" cy="8.5" r="1.5" stroke="#00D984" strokeWidth="1.5"/>
                    <Path d="M21 15l-5-5L5 21" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Depuis la galerie</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Choisir une photo existante</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowCarnetPageSheet(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Sheet — Analyser pages carnet */}
      <Modal
        visible={showAnalyzeSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAnalyzeSheet(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowAnalyzeSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
                alignItems: 'center',
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(24) }}/>

              <View style={{
                width: wp(60), height: wp(60), borderRadius: wp(30),
                backgroundColor: 'rgba(0,217,132,0.12)',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
              }}>
                <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                  <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M14 2v6h6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>

              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>
                Analyser {carnetPhotos.filter(p => p).length} page{carnetPhotos.filter(p => p).length > 1 ? 's' : ''}
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: fp(19), marginBottom: wp(24), paddingHorizontal: wp(10) }}>
                ALIXEN va analyser vos pages et extraire toutes les informations médicales : vaccins, médicaments, diagnostics, examens...
              </Text>

              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowAnalyzeSheet(false);
                  const photos = carnetPhotos.filter(p => p);
                  if (photos.length > 0) {
                    startAIScan(photos[0].uri, 'Carnet de santé (' + photos.length + ' pages)', 'image/jpeg', photos[0].base64);
                  }
                }}
                style={{ width: '100%' }}
              >
                <LinearGradient
                  colors={['#00D984', '#00B871']}
                  style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', width: '100%' }}
                >
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Lancer l'analyse</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => setShowAnalyzeSheet(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', width: '100%', marginTop: wp(8) }}
              >
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal — Saisie nom enfant */}
      <Modal
        visible={showChildNameInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChildNameInput(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: wp(24),
        }}>
          <LinearGradient
            colors={['#2A2F36', '#1E2328', '#252A30']}
            style={{
              borderRadius: wp(20), paddingHorizontal: wp(24),
              paddingVertical: wp(28), width: '100%',
            }}
          >
            <View style={{
              width: wp(50), height: wp(50), borderRadius: wp(25),
              backgroundColor: 'rgba(77,166,255,0.12)',
              justifyContent: 'center', alignItems: 'center',
              alignSelf: 'center', marginBottom: wp(16),
            }}>
              <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="3" stroke="#4DA6FF" strokeWidth="1.5"/>
                <Path d="M8 21v-1a4 4 0 018 0v1" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round"/>
              </Svg>
            </View>

            <Text style={{
              fontSize: fp(18), fontWeight: '700', color: '#FFF',
              textAlign: 'center', marginBottom: wp(6),
            }}>{editingChildId ? 'Nommer cet enfant' : 'Ajouter un enfant'}</Text>

            <Text style={{
              fontSize: fp(12), color: 'rgba(255,255,255,0.4)',
              textAlign: 'center', marginBottom: wp(20),
            }}>
              {editingChildId
                ? 'Entrez le prénom de votre enfant'
                : newChildIsFree
                  ? 'Premier enfant gratuit'
                  : 'Coût : 5 000 Lix'
              }
            </Text>

            <View style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: wp(12), paddingHorizontal: wp(14),
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              marginBottom: wp(24),
            }}>
              <TextInput
                style={{
                  fontSize: fp(15), color: '#FFF',
                  paddingVertical: wp(12),
                }}
                placeholder="Prénom de l'enfant"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={newChildName}
                onChangeText={setNewChildName}
                autoFocus={true}
                maxLength={30}
              />
            </View>

            <Pressable
              delayPressIn={120}
              onPress={() => {
                if (newChildName.trim().length === 0) {
                  Alert.alert('Nom requis', 'Veuillez entrer le prénom de l\'enfant.');
                  return;
                }
                if (editingChildId) {
                  setChildren(prev => prev.map(c =>
                    c.id === editingChildId ? { ...c, name: newChildName.trim() } : c
                  ));
                  setActiveProfile(editingChildId);
                  setEditingChildId(null);
                } else {
                  const newChild = {
                    id: 'child-' + children.length,
                    name: newChildName.trim(),
                    age: '',
                    free: newChildIsFree,
                  };
                  setChildren(prev => [...prev, newChild]);
                  setActiveProfile(newChild.id);
                }
                setShowChildNameInput(false);
                setNewChildName('');
              }}
            >
              <LinearGradient
                colors={['#4DA6FF', '#3A8FE8']}
                style={{
                  paddingVertical: wp(14), borderRadius: wp(14),
                  alignItems: 'center', width: '100%',
                }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>
                  {editingChildId
                    ? 'Confirmer'
                    : newChildIsFree
                      ? 'Ajouter gratuitement'
                      : 'Ajouter (5 000 Lix)'
                  }
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => { setShowChildNameInput(false); setNewChildName(''); setEditingChildId(null); }}
              style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(8) }}
            >
              <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );

  // ── FINAL RETURN ───────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      {renderContent()}
      {renderAllModals()}
    </View>
  );
}
