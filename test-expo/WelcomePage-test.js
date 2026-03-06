// LIXUM - Welcome Onboarding (Tinder-Style) v2.0
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, react-native-gesture-handler,
//              react-native-reanimated, @expo/vector-icons, react-native-svg
// Logo: mettre logo-lx.png dans le dossier assets du Snack
//
// v2.0 — Cartes opaques, logo 100x100, CTA cache pendant swipes,
//         textes courts avec icones, SVG ScanX, page finale en carte,
//         swipe hint anime, FadeInDown

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing as REasing,
  FadeInDown,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line } from 'react-native-svg';

var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;
var CARD_WIDTH = SCREEN_WIDTH - 48;
var CARD_HEIGHT = SCREEN_HEIGHT * 0.52;
var SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

var logoImage = require('./assets/logo-lx.png');

// ============================================================
// TRADUCTIONS — textes courts avec icones
// ============================================================

var texts = {
  fr: {
    tagline: 'VOTRE TABLEAU DE BORD VITAL',
    slide1Title: 'SCAN X',
    slide1Subtitle: 'Reconnaissance avancee',
    slide1Lines: [
      { icon: 'scan-outline', text: 'Analyse multi-angles en temps reel' },
      { icon: 'timer-outline', text: 'Resultats en moins de 3 secondes' },
      { icon: 'nutrition-outline', text: 'Proteines \u00B7 Glucides \u00B7 Lipides' },
      { icon: 'sparkles-outline', text: 'Chaque molecule compte' },
    ],
    slide2Title: 'NUTRITION SOURCEE',
    slide2Subtitle: 'Donnees scientifiques certifiees',
    slide2Lines: [
      { icon: 'shield-checkmark-outline', text: 'Sources : USDA \u00B7 FAO \u00B7 ANSES' },
      { icon: 'restaurant-outline', text: 'Recettes adaptees a votre humeur' },
      { icon: 'body-outline', text: 'Ajustees a votre metabolisme' },
      { icon: 'beaker-outline', text: 'Pas d\'approximation, de la science' },
    ],
    slide3Title: 'DASHBOARD VITAL',
    slide3Subtitle: 'Votre hygiene de vie, quantifiee',
    slide3Lines: [
      { icon: 'pulse-outline', text: 'Score de vitalite en temps reel' },
      { icon: 'flame-outline', text: 'Calories consommees et brulees' },
      { icon: 'trending-up-outline', text: 'Chaque decision impacte votre courbe' },
      { icon: 'fitness-outline', text: 'Reprenez le controle' },
    ],
    cta: 'Commencer',
    hasAccount: 'Deja un compte ?',
    signIn: 'Se connecter',
    readyTitle: 'Pret a commencer ?',
    readySub: 'Rejoignez LIXUM et reprenez\nle controle de votre vitalite',
  },
  en: {
    tagline: 'YOUR VITAL DASHBOARD',
    slide1Title: 'SCAN X',
    slide1Subtitle: 'Advanced recognition',
    slide1Lines: [
      { icon: 'scan-outline', text: 'Multi-angle real-time analysis' },
      { icon: 'timer-outline', text: 'Results in under 3 seconds' },
      { icon: 'nutrition-outline', text: 'Proteins \u00B7 Carbs \u00B7 Fats' },
      { icon: 'sparkles-outline', text: 'Every molecule matters' },
    ],
    slide2Title: 'VERIFIED NUTRITION',
    slide2Subtitle: 'Certified scientific data',
    slide2Lines: [
      { icon: 'shield-checkmark-outline', text: 'Sources: USDA \u00B7 FAO \u00B7 ANSES' },
      { icon: 'restaurant-outline', text: 'Recipes adapted to your mood' },
      { icon: 'body-outline', text: 'Adjusted to your metabolism' },
      { icon: 'beaker-outline', text: 'No guesswork, pure science' },
    ],
    slide3Title: 'VITAL DASHBOARD',
    slide3Subtitle: 'Your lifestyle, quantified',
    slide3Lines: [
      { icon: 'pulse-outline', text: 'Real-time vitality score' },
      { icon: 'flame-outline', text: 'Calories consumed & burned' },
      { icon: 'trending-up-outline', text: 'Every decision impacts your curve' },
      { icon: 'fitness-outline', text: 'Take back control' },
    ],
    cta: 'Get Started',
    hasAccount: 'Already have an account?',
    signIn: 'Sign in',
    readyTitle: 'Ready to start?',
    readySub: 'Join LIXUM and take back\ncontrol of your vitality',
  },
};

// ============================================================
// ICONE SVG — SCAN X (diagonales croisees + viseur)
// ============================================================

function ScanXIcon(props) {
  var size = props.size || 56;
  var color = props.color || '#00D984';
  return (
    <Svg width={size} height={size} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="26" fill="rgba(0,0,0,0.3)" stroke={color + '50'} strokeWidth="1.5" />
      <Line x1="14" y1="14" x2="42" y2="42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="42" y1="14" x2="14" y2="42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 10 18 L 10 10 L 18 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M 38 10 L 46 10 L 46 18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M 10 38 L 10 46 L 18 46" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M 38 46 L 46 46 L 46 38" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="28" cy="28" r="3" fill={color} opacity="0.6" />
    </Svg>
  );
}

// ============================================================
// ICONE ANIMEE (pulse + glow)
// ============================================================

function SlideIcon(props) {
  var type = props.type;
  var color = props.color;
  var pulse = useSharedValue(1);
  var glow = useSharedValue(0.2);

  useEffect(function () {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500, easing: REasing.inOut(REasing.ease) }),
        withTiming(1, { duration: 1500, easing: REasing.inOut(REasing.ease) })
      ),
      -1, true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: REasing.inOut(REasing.ease) }),
        withTiming(0.2, { duration: 2000, easing: REasing.inOut(REasing.ease) })
      ),
      -1, true
    );
  }, []);

  var pulseStyle = useAnimatedStyle(function () {
    return { transform: [{ scale: pulse.value }] };
  });

  var glowStyle = useAnimatedStyle(function () {
    return { opacity: glow.value };
  });

  return (
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <Animated.View style={[{
        position: 'absolute',
        width: 86,
        height: 86,
        borderRadius: 43,
        backgroundColor: color,
        top: -15,
      }, glowStyle]} />

      <Animated.View style={[{ width: 56, height: 56 }, pulseStyle]}>
        {type === 'scan' && (
          <ScanXIcon size={56} color={color} />
        )}
        {type === 'nutrition' && (
          <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={56} height={56} viewBox="0 0 56 56">
              <Circle cx="28" cy="28" r="26" fill="rgba(0,0,0,0.3)" stroke={color + '50'} strokeWidth="1.5" />
            </Svg>
            <Ionicons name="flask" size={26} color={color} style={{ position: 'absolute' }} />
          </View>
        )}
        {type === 'dashboard' && (
          <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={56} height={56} viewBox="0 0 56 56">
              <Circle cx="28" cy="28" r="26" fill="rgba(0,0,0,0.3)" stroke={color + '50'} strokeWidth="1.5" />
            </Svg>
            <Ionicons name="pulse" size={26} color={color} style={{ position: 'absolute' }} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ============================================================
// SWIPE HINT — doigt anime (visible uniquement slide 0)
// ============================================================

function SwipeHint(props) {
  var visible = props.visible;
  var translateX = useRef(new RNAnimated.Value(0)).current;
  var opacity = useRef(new RNAnimated.Value(1)).current;
  var loopRef = useRef(null);

  useEffect(function () {
    if (!visible) {
      RNAnimated.timing(opacity, {
        toValue: 0, duration: 300, useNativeDriver: true,
      }).start();
      if (loopRef.current) loopRef.current.stop();
      return;
    }

    loopRef.current = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(500),
        RNAnimated.timing(translateX, {
          toValue: -60, duration: 800,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        RNAnimated.timing(translateX, {
          toValue: 0, duration: 500,
          easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
        RNAnimated.delay(1000),
      ])
    );
    loopRef.current.start();
    return function () {
      if (loopRef.current) loopRef.current.stop();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <RNAnimated.View style={{
      position: 'absolute',
      bottom: 60,
      right: 40,
      transform: [{ translateX: translateX }],
      opacity: opacity,
      zIndex: 100,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 217, 132, 0.2)',
      }}>
        <Ionicons name="hand-left-outline" size={18} color="#00D984" />
        <Ionicons name="arrow-back" size={12} color="#00D984" style={{ marginLeft: 4 }} />
      </View>
    </RNAnimated.View>
  );
}

// ============================================================
// CARTE SWIPEABLE — OPAQUE
// ============================================================

function SwipeCard(props) {
  var slide = props.slide;
  var index = props.index;
  var totalCards = props.totalCards;
  var currentIndex = props.currentIndex;
  var onSwipe = props.onSwipe;

  var translateX = useSharedValue(0);
  var translateY = useSharedValue(0);
  var rotateZ = useSharedValue(0);

  var isTopCard = index === currentIndex;
  var stackOffset = index - currentIndex;

  var gesture = Gesture.Pan()
    .enabled(isTopCard)
    .onUpdate(function (event) {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
      rotateZ.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd(function (event) {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        var direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * SCREEN_WIDTH * 1.5, { duration: 300 });
        rotateZ.value = withTiming(direction * 25, { duration: 300 });
        runOnJS(onSwipe)(direction);
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  var topCardStyle = useAnimatedStyle(function () {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: rotateZ.value + 'deg' },
      ],
    };
  });

  var stackStyle = useAnimatedStyle(function () {
    if (stackOffset <= 0) return {};
    return {
      transform: [
        { scale: interpolate(stackOffset, [0, 1, 2], [1, 0.95, 0.9]) },
        { translateY: stackOffset * 12 },
      ],
      opacity: interpolate(stackOffset, [0, 1, 2], [1, 0.7, 0.4]),
    };
  });

  if (index < currentIndex) return null;
  if (index > currentIndex + 2) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.cardOuter,
          { zIndex: totalCards - index, backgroundColor: '#0D1117' },
          isTopCard ? topCardStyle : stackStyle,
        ]}
      >
        <View style={{
          position: 'absolute',
          top: -1, left: -1, right: -1, bottom: -1,
          borderRadius: 21,
          borderWidth: 1,
          borderColor: isTopCard
            ? 'rgba(0, 217, 132, 0.2)'
            : 'rgba(0, 217, 132, 0.05)',
          shadowColor: '#00D984',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: isTopCard ? 0.15 : 0.05,
          shadowRadius: 20,
        }} />

        <View style={{
          borderRadius: 20,
          borderWidth: 1.2,
          borderTopColor: 'rgba(138, 146, 160, 0.35)',
          borderLeftColor: 'rgba(107, 123, 141, 0.2)',
          borderRightColor: 'rgba(42, 48, 59, 0.4)',
          borderBottomColor: 'rgba(26, 31, 38, 0.5)',
          overflow: 'hidden',
        }}>
          <LinearGradient
            colors={['#323A48', '#232932', '#1B1F26', '#161A21']}
            locations={[0, 0.3, 0.6, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              paddingHorizontal: 24,
              paddingTop: 28,
              paddingBottom: 20,
              justifyContent: 'space-between',
            }}
          >
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 50,
            }}>
              <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
              />
            </View>

            <View style={{
              position: 'absolute', top: 0, left: 14, right: 14,
              height: 1, backgroundColor: 'rgba(255,255,255,0.1)',
            }} />

            <View style={{ position: 'absolute', top: 8, left: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0, 217, 132, 0.35)' }} />
            <View style={{ position: 'absolute', top: 8, right: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0, 217, 132, 0.35)' }} />
            <View style={{ position: 'absolute', bottom: 8, left: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0, 217, 132, 0.25)' }} />
            <View style={{ position: 'absolute', bottom: 8, right: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0, 217, 132, 0.25)' }} />

            <View>
              <View style={styles.iconContainer}>
                <SlideIcon type={slide.key} color={slide.color} />
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', gap: 14 }}>
              {slide.lines.map(function (line, i) {
                return (
                  <View key={i} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}>
                    <View style={{
                      width: 32, height: 32, borderRadius: 16,
                      backgroundColor: slide.color + '15',
                      borderWidth: 1,
                      borderColor: slide.color + '25',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ionicons name={line.icon} size={16} color={slide.color} />
                    </View>
                    <Text style={{
                      color: '#EAEEF3', fontSize: 13, fontWeight: '500',
                      flex: 1, lineHeight: 18,
                    }}>
                      {line.text}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.badgesRow}>
              {slide.badges.map(function (badge, i) {
                return (
                  <View key={i} style={[styles.badge, { borderColor: slide.color + '33' }]}>
                    <Text style={[styles.badgeText, { color: slide.color }]}>{badge}</Text>
                  </View>
                );
              })}
            </View>

          </LinearGradient>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// ============================================================
// PAGE WELCOME
// ============================================================

export default function App() {
  var _lang = useState('fr');
  var lang = _lang[0];
  var setLang = _lang[1];

  var _currentIndex = useState(0);
  var currentIndex = _currentIndex[0];
  var setCurrentIndex = _currentIndex[1];

  var t = texts[lang];

  var slides = [
    {
      key: 'scan',
      title: t.slide1Title,
      subtitle: t.slide1Subtitle,
      lines: t.slide1Lines,
      badges: ['AI-POWERED', 'REAL-TIME', 'MULTI-ANGLE'],
      color: '#00D984',
    },
    {
      key: 'nutrition',
      title: t.slide2Title,
      subtitle: t.slide2Subtitle,
      lines: t.slide2Lines,
      badges: ['USDA', 'FAO', 'ANSES'],
      color: '#00BFA6',
    },
    {
      key: 'dashboard',
      title: t.slide3Title,
      subtitle: t.slide3Subtitle,
      lines: t.slide3Lines,
      badges: ['REAL-TIME', 'ECG', 'AI COACH'],
      color: '#00D984',
    },
  ];

  var handleSwipe = useCallback(function (direction) {
    setTimeout(function () {
      setCurrentIndex(function (prev) {
        return Math.min(prev + 1, slides.length);
      });
    }, 200);
  }, [slides.length]);

  var handleGetStarted = function () {
    Alert.alert('Navigation', 'Aller vers la page Inscription');
  };

  var handleSignIn = function () {
    Alert.alert('Navigation', 'Aller vers la page Connexion');
  };

  var allSwiped = currentIndex >= slides.length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#080A0E', '#0D1117', '#0F1923', '#0D1117', '#080A0E']}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={styles.page}>

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={logoImage}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>

            <View style={styles.langAbsolute}>
              <View style={styles.langSwitch}>
                <TouchableOpacity onPress={function () { setLang('fr'); }} activeOpacity={0.7}>
                  {lang === 'fr' ? (
                    <LinearGradient
                      colors={['#00D984', '#00C278', '#00A866']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={styles.langBtnActive}
                    >
                      <Text style={styles.langTxtActive}>FR</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.langBtnInactive}>
                      <Text style={styles.langTxtInactive}>FR</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={{ width: 1, backgroundColor: '#3E4855' }} />
                <TouchableOpacity onPress={function () { setLang('en'); }} activeOpacity={0.7}>
                  {lang === 'en' ? (
                    <LinearGradient
                      colors={['#00D984', '#00C278', '#00A866']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={styles.langBtnActive}
                    >
                      <Text style={styles.langTxtActive}>EN</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.langBtnInactive}>
                      <Text style={styles.langTxtInactive}>EN</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.tagline}>{t.tagline}</Text>

          <View style={styles.cardsZone}>
            {!allSwiped ? (
              <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
                {slides.slice().reverse().map(function (slide, reverseIndex) {
                  var actualIndex = slides.length - 1 - reverseIndex;
                  return (
                    <SwipeCard
                      key={slide.key}
                      slide={slide}
                      index={actualIndex}
                      totalCards={slides.length}
                      currentIndex={currentIndex}
                      onSwipe={handleSwipe}
                    />
                  );
                })}
                <SwipeHint visible={currentIndex === 0} />
              </View>
            ) : (
              <Animated.View
                entering={FadeInDown.duration(600).springify()}
                style={{
                  width: CARD_WIDTH,
                  borderRadius: 20,
                  borderWidth: 1.2,
                  borderTopColor: 'rgba(138, 146, 160, 0.35)',
                  borderLeftColor: 'rgba(107, 123, 141, 0.2)',
                  borderRightColor: 'rgba(42, 48, 59, 0.4)',
                  borderBottomColor: 'rgba(26, 31, 38, 0.5)',
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={['#323A48', '#232932', '#1B1F26', '#161A21']}
                  locations={[0, 0.3, 0.6, 1]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{
                    paddingVertical: 40,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                  }}
                >
                  <View style={{
                    position: 'absolute', top: 0, left: 14, right: 14,
                    height: 1, backgroundColor: 'rgba(255,255,255,0.1)',
                  }} />

                  <View style={{
                    width: 70, height: 70, borderRadius: 35,
                    backgroundColor: 'rgba(0, 217, 132, 0.12)',
                    borderWidth: 2, borderColor: '#00D984',
                    alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20,
                  }}>
                    <Ionicons name="checkmark" size={36} color="#00D984" />
                  </View>

                  <Text style={{
                    color: '#EAEEF3', fontSize: 22, fontWeight: '700',
                    textAlign: 'center', marginBottom: 10,
                  }}>
                    {t.readyTitle}
                  </Text>
                  <Text style={{
                    color: '#8892A0', fontSize: 14, textAlign: 'center', lineHeight: 22,
                  }}>
                    {t.readySub}
                  </Text>
                </LinearGradient>
              </Animated.View>
            )}
          </View>

          <View style={styles.bottomZone}>
            <View style={styles.dotsContainer}>
              {slides.map(function (_, i) {
                var isActive = i === currentIndex;
                var isDone = i < currentIndex;
                return (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isActive ? '#00D984'
                          : isDone ? '#00A866' : '#3E4855',
                        width: isActive ? 24 : 8,
                      },
                    ]}
                  />
                );
              })}
            </View>

            {allSwiped ? (
              <Animated.View entering={FadeInDown.duration(500).springify()}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleGetStarted}
                  style={styles.ctaButton}
                >
                  <View style={styles.ctaInner}>
                    <View style={styles.ctaReflet} />
                    <View style={styles.ctaHighlight} />
                    <Text style={styles.ctaText}>{t.cta}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.signInRow}>
                  <Text style={styles.signInLabel}>{t.hasAccount} </Text>
                  <TouchableOpacity onPress={handleSignIn}>
                    <Text style={styles.signInLink}>{t.signIn}</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : null}
          </View>

        </View>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

// ============================================================
// STYLES
// ============================================================

var styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 8,
    marginBottom: 6,
    paddingTop: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 12,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 22,
  },

  langAbsolute: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: 0,
  },
  langSwitch: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#3E4855',
  },
  langBtnActive: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  langBtnInactive: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1B1F26',
  },
  langTxtActive: {
    color: '#0D1117',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  langTxtInactive: {
    color: '#555E6C',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },

  tagline: {
    color: '#555E6C',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  cardsZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardOuter: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 20,
  },

  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  slideTitle: {
    color: '#EAEEF3',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 4,
  },
  slideSubtitle: {
    color: '#8892A0',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },

  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 217, 132, 0.06)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },

  bottomZone: {
    paddingBottom: 10,
    minHeight: 120,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  ctaButton: {
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  ctaInner: {
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: 'rgba(0, 217, 132, 0.4)',
    backgroundColor: 'rgba(0, 217, 132, 0.08)',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ctaReflet: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 217, 132, 0.04)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  ctaHighlight: {
    position: 'absolute',
    top: 0, left: 20, right: 20,
    height: 1,
    backgroundColor: 'rgba(0, 217, 132, 0.3)',
  },
  ctaText: {
    color: '#00D984',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },

  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInLabel: {
    color: '#555E6C',
    fontSize: 14,
  },
  signInLink: {
    color: '#00D984',
    fontSize: 14,
    fontWeight: '700',
  },
});
