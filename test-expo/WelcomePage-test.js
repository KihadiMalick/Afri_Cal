// LIXUM - Welcome Onboarding (Tinder-Style) v5.0
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, react-native-gesture-handler,
//              react-native-reanimated, @expo/vector-icons, react-native-svg
// Logo: mettre logo-lx.png dans le dossier assets du Snack
//
// v5.0 — Drapeaux absolus aux bords, LIXUM blanc, pas de glow bar,
//         cartes 100% opaques bg solide, cartes plus hautes, meilleurs margins

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
var CARD_HEIGHT = SCREEN_HEIGHT * 0.56;
var SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

var logoImage = require('./assets/logo-lx.png');

// ============================================================
// TRADUCTIONS
// ============================================================

var texts = {
  fr: {
    welcome: 'Bienvenue \u00e0 la technologie',
    brandName: 'LIXUM',
    tagline: 'VOTRE TABLEAU DE BORD VITAL',

    slide1Title: 'SCAN X',
    slide1Subtitle: 'Le meilleur outil de scan du march\u00e9',
    slide1Lines: [
      { icon: 'scan-outline', text: 'Analyses multi-angles en temps r\u00e9el' },
      { icon: 'hardware-chip-outline', text: 'R\u00e9sultats avec moteur de calcul robuste' },
      { icon: 'nutrition-outline', text: 'Prot\u00e9ines \u00B7 Glucides \u00B7 Lipides d\u00e9taill\u00e9s' },
    ],

    slide2Title: 'NUTRITION SOURC\u00c9E',
    slide2Subtitle: 'Des donn\u00e9es que vous pouvez v\u00e9rifier',
    slide2Lines: [
      { icon: 'shield-checkmark-outline', text: 'Sources certifi\u00e9es : USDA \u00B7 FAO \u00B7 ANSES' },
      { icon: 'restaurant-outline', text: 'Recettes adapt\u00e9es \u00e0 votre humeur' },
      { icon: 'flask-outline', text: 'Z\u00e9ro approximation, que de la science' },
    ],

    slide3Title: 'DASHBOARD VITAL',
    slide3Subtitle: 'Votre hygi\u00e8ne de vie, quantifi\u00e9e',
    slide3Lines: [
      { icon: 'pulse-outline', text: 'Score de vitalit\u00e9 en temps r\u00e9el' },
      { icon: 'flame-outline', text: 'Suivi calories consomm\u00e9es et br\u00fbl\u00e9es' },
      { icon: 'trending-up-outline', text: 'Reprenez le contr\u00f4le de votre courbe' },
    ],

    hasAccount: 'D\u00e9j\u00e0 un compte ?',
    signIn: 'Se connecter',
    readyTitle: 'Pr\u00eat \u00e0 commencer ?',
    joinBtn: 'Rejoindre LIXUM',
    swipeHint: 'Glissez',
  },
  en: {
    welcome: 'Welcome to',
    brandName: 'LIXUM',
    tagline: 'YOUR VITAL DASHBOARD',

    slide1Title: 'SCAN X',
    slide1Subtitle: 'The best scanning tool on the market',
    slide1Lines: [
      { icon: 'scan-outline', text: 'Multi-angle real-time analysis' },
      { icon: 'hardware-chip-outline', text: 'Results powered by robust engine' },
      { icon: 'nutrition-outline', text: 'Proteins \u00B7 Carbs \u00B7 Fats detailed' },
    ],

    slide2Title: 'VERIFIED NUTRITION',
    slide2Subtitle: 'Data you can actually verify',
    slide2Lines: [
      { icon: 'shield-checkmark-outline', text: 'Certified sources: USDA \u00B7 FAO \u00B7 ANSES' },
      { icon: 'restaurant-outline', text: 'Recipes adapted to your mood' },
      { icon: 'flask-outline', text: 'Zero guesswork, pure science' },
    ],

    slide3Title: 'VITAL DASHBOARD',
    slide3Subtitle: 'Your lifestyle, quantified',
    slide3Lines: [
      { icon: 'pulse-outline', text: 'Real-time vitality score' },
      { icon: 'flame-outline', text: 'Track calories consumed & burned' },
      { icon: 'trending-up-outline', text: 'Take back control of your curve' },
    ],

    hasAccount: 'Already have an account?',
    signIn: 'Sign in',
    readyTitle: 'Ready to start?',
    joinBtn: 'Join LIXUM',
    swipeHint: 'Swipe',
  },
};

// ============================================================
// ICONE SVG — SCAN X
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
// ICONE ANIMEE
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
      ), -1, true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: REasing.inOut(REasing.ease) }),
        withTiming(0.2, { duration: 2000, easing: REasing.inOut(REasing.ease) })
      ), -1, true
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
        position: 'absolute', width: 86, height: 86, borderRadius: 43,
        backgroundColor: color, top: -15,
      }, glowStyle]} />
      <Animated.View style={[{ width: 56, height: 56 }, pulseStyle]}>
        {type === 'scan' && <ScanXIcon size={56} color={color} />}
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
// SWIPE HINT — positionne a l interieur de la carte
// ============================================================

function SwipeHint(props) {
  var visible = props.visible;
  var lang = props.lang;
  var translateX = useRef(new RNAnimated.Value(0)).current;
  var opacity = useRef(new RNAnimated.Value(1)).current;
  var loopRef = useRef(null);

  useEffect(function () {
    if (!visible) {
      RNAnimated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      if (loopRef.current) loopRef.current.stop();
      return;
    }
    loopRef.current = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(500),
        RNAnimated.timing(translateX, { toValue: -50, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.timing(translateX, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.delay(1000),
      ])
    );
    loopRef.current.start();
    return function () { if (loopRef.current) loopRef.current.stop(); };
  }, [visible]);

  if (!visible) return null;

  return (
    <RNAnimated.View style={{
      position: 'absolute', bottom: 48, right: 30,
      transform: [{ translateX: translateX }], opacity: opacity, zIndex: 100,
    }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)', gap: 6,
      }}>
        <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '600' }}>
          {lang === 'fr' ? 'Glissez' : 'Swipe'}
        </Text>
        <Ionicons name="arrow-back" size={14} color="#00D984" />
      </View>
    </RNAnimated.View>
  );
}

// ============================================================
// CARTE SWIPEABLE — RADICALEMENT OPAQUE bg solide #1A2028
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
        event.translationX, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15],
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
          { position: 'absolute', alignSelf: 'center', borderRadius: 20, overflow: 'hidden' },
          { zIndex: totalCards - index },
          isTopCard ? topCardStyle : stackStyle,
        ]}
      >
        <View style={{
          width: CARD_WIDTH, height: CARD_HEIGHT,
          backgroundColor: '#1A2028',
          borderRadius: 20, overflow: 'hidden', position: 'relative',
        }}>
          <LinearGradient
            colors={['rgba(46,54,64,0.6)', 'rgba(37,44,54,0.3)', 'transparent']}
            locations={[0, 0.4, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
          />

          <View style={{
            position: 'absolute',
            top: -1, left: -1, right: -1, bottom: -1,
            borderRadius: 21, borderWidth: 1,
            borderColor: isTopCard ? 'rgba(0,217,132,0.2)' : 'rgba(0,217,132,0.05)',
            shadowColor: '#00D984',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isTopCard ? 0.15 : 0.05,
            shadowRadius: 20,
          }} />

          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, borderRadius: 20,
            borderWidth: 1.2,
            borderTopColor: 'rgba(138,146,160,0.35)',
            borderLeftColor: 'rgba(107,123,141,0.2)',
            borderRightColor: 'rgba(42,48,59,0.4)',
            borderBottomColor: 'rgba(26,31,38,0.5)',
            height: '100%',
          }} />

          <View style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 50,
          }}>
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0)']}
              start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
              style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            />
          </View>
          <View style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />

          <View style={{ position: 'absolute', top: 8, left: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0,217,132,0.35)' }} />
          <View style={{ position: 'absolute', top: 8, right: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0,217,132,0.35)' }} />
          <View style={{ position: 'absolute', bottom: 8, left: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0,217,132,0.25)' }} />
          <View style={{ position: 'absolute', bottom: 8, right: 8, width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(0,217,132,0.25)' }} />

          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20, justifyContent: 'space-between' }}>
            <View>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <SlideIcon type={slide.key} color={slide.color} />
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
            </View>

            <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
              {slide.lines.map(function (line, i) {
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 18,
                      backgroundColor: 'rgba(0,217,132,0.12)',
                      borderWidth: 1, borderColor: 'rgba(0,217,132,0.20)',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ionicons name={line.icon} size={17} color="#00D984" />
                    </View>
                    <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '500', flex: 1, lineHeight: 19 }}>
                      {line.text}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.badgesRow}>
              {slide.badges.map(function (badge, i) {
                return (
                  <View key={i} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                );
              })}
            </View>
          </View>
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
      key: 'scan', title: t.slide1Title, subtitle: t.slide1Subtitle,
      lines: t.slide1Lines, badges: ['AI-POWERED', 'REAL-TIME', 'MULTI-ANGLE'], color: '#00D984',
    },
    {
      key: 'nutrition', title: t.slide2Title, subtitle: t.slide2Subtitle,
      lines: t.slide2Lines, badges: ['USDA', 'FAO', 'ANSES'], color: '#00D984',
    },
    {
      key: 'dashboard', title: t.slide3Title, subtitle: t.slide3Subtitle,
      lines: t.slide3Lines, badges: ['REAL-TIME', 'ECG', 'AI COACH'], color: '#00D984',
    },
  ];

  var handleSwipe = useCallback(function (direction) {
    setTimeout(function () {
      setCurrentIndex(function (prev) { return Math.min(prev + 1, slides.length); });
    }, 200);
  }, [slides.length]);

  var handleJoin = function () {
    Alert.alert('Navigation', 'Aller vers la page Inscription');
  };

  var handleSignIn = function () {
    Alert.alert('Navigation', 'Aller vers la page Connexion');
  };

  var allSwiped = currentIndex >= slides.length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#1A2028' }}>
        <LinearGradient
          colors={['rgba(30,38,50,0.5)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120 }}
        />

        <View style={styles.content}>

          <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 10 }}>
            <View style={styles.logoContainer}>
              <Image source={logoImage} style={styles.logo} resizeMode="cover" />
            </View>
          </View>

          <View style={{
            position: 'relative',
            width: '100%', marginBottom: 2, paddingHorizontal: 4,
            alignItems: 'center', justifyContent: 'center',
            minHeight: 36,
          }}>
            <TouchableOpacity
              onPress={function () { setLang('en'); }} activeOpacity={0.7}
              style={{ position: 'absolute', left: 0 }}
            >
              <View style={[styles.flagBtn, {
                borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.5)',
                backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'rgba(27,31,38,0.6)',
              }]}>
                <Text style={{ fontSize: 12 }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text>
                <Text style={[styles.flagLabel, { color: lang === 'en' ? '#00D984' : '#555E6C' }]}>EN</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.welcomeText}>{t.welcome}</Text>

            <TouchableOpacity
              onPress={function () { setLang('fr'); }} activeOpacity={0.7}
              style={{ position: 'absolute', right: 0 }}
            >
              <View style={[styles.flagBtn, {
                borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.5)',
                backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'rgba(27,31,38,0.6)',
              }]}>
                <Text style={{ fontSize: 12 }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text>
                <Text style={[styles.flagLabel, { color: lang === 'fr' ? '#00D984' : '#555E6C' }]}>FR</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.brandName}>{t.brandName}</Text>
          <Text style={styles.tagline}>{t.tagline}</Text>

          <View style={styles.cardsZone}>
            {!allSwiped ? (
              <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
                {slides.slice().reverse().map(function (slide, reverseIndex) {
                  var actualIndex = slides.length - 1 - reverseIndex;
                  return (
                    <SwipeCard
                      key={slide.key} slide={slide} index={actualIndex}
                      totalCards={slides.length} currentIndex={currentIndex}
                      onSwipe={handleSwipe}
                    />
                  );
                })}
                <SwipeHint visible={currentIndex === 0} lang={lang} />
              </View>
            ) : (
              <Animated.View entering={FadeInDown.duration(600).springify()}
                style={{ width: CARD_WIDTH, borderRadius: 20, overflow: 'hidden' }}>
                <View style={{
                  backgroundColor: '#1A2028', borderRadius: 20, overflow: 'hidden',
                  borderWidth: 1.2,
                  borderTopColor: 'rgba(138,146,160,0.3)',
                  borderLeftColor: 'rgba(107,123,141,0.15)',
                  borderRightColor: 'rgba(42,48,59,0.3)',
                  borderBottomColor: 'rgba(26,31,38,0.4)',
                }}>
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' }}>
                    <LinearGradient
                      colors={['rgba(46,54,64,0.6)', 'rgba(37,44,54,0.3)', 'transparent']}
                      locations={[0, 0.4, 1]}
                      start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                      style={{ flex: 1 }}
                    />
                  </View>

                  <View style={{ position: 'absolute', top: 0, left: 14, right: 14, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />

                  <View style={{ paddingVertical: 36, paddingHorizontal: 24, alignItems: 'center' }}>
                    <View style={{
                      width: 64, height: 64, borderRadius: 32,
                      backgroundColor: 'rgba(0,217,132,0.10)',
                      borderWidth: 1.5, borderColor: '#00D984',
                      alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                    }}>
                      <Ionicons name="checkmark" size={32} color="#00D984" />
                    </View>

                    <Text style={{
                      color: '#EAEEF3', fontSize: 22, fontWeight: '700',
                      textAlign: 'center', marginBottom: 24,
                    }}>
                      {t.readyTitle}
                    </Text>

                    <TouchableOpacity activeOpacity={0.7} onPress={handleJoin}
                      style={{ width: '100%', borderRadius: 14 }}>
                      <View style={{
                        borderRadius: 14, borderWidth: 1.3, borderColor: 'rgba(0,217,132,0.4)',
                        backgroundColor: 'rgba(0,217,132,0.10)', paddingVertical: 16,
                        alignItems: 'center', overflow: 'hidden',
                      }}>
                        <View style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                          backgroundColor: 'rgba(0,217,132,0.04)',
                          borderTopLeftRadius: 14, borderTopRightRadius: 14,
                        }} />
                        <View style={{
                          position: 'absolute', top: 0, left: 20, right: 20, height: 1,
                          backgroundColor: 'rgba(0,217,132,0.25)',
                        }} />
                        <Text style={{ color: '#00D984', fontSize: 16, fontWeight: '700', letterSpacing: 1 }}>
                          {t.joinBtn}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            )}
          </View>

          <View style={styles.bottomZone}>
            <View style={styles.dotsContainer}>
              {slides.map(function (_, i) {
                return (
                  <View key={i} style={[styles.dot, {
                    backgroundColor: i === currentIndex ? '#00D984' : i < currentIndex ? '#00A866' : '#3E4855',
                    width: i === currentIndex ? 24 : 8,
                  }]} />
                );
              })}
            </View>

            {allSwiped ? (
              <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}
                style={{ marginTop: 20, marginBottom: 30, alignItems: 'center' }}>
                <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}
                  style={{
                    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24,
                    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(62,72,85,0.4)',
                    backgroundColor: 'rgba(27,31,38,0.4)', gap: 6,
                  }}>
                  <Text style={{ color: '#8892A0', fontSize: 14, fontWeight: '500' }}>{t.hasAccount}</Text>
                  <Text style={{ color: '#00D984', fontSize: 14, fontWeight: '700' }}>{t.signIn}</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : null}
          </View>

        </View>
      </View>
    </GestureHandlerRootView>
  );
}

// ============================================================
// STYLES
// ============================================================

var styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },

  logoContainer: {
    width: 120, height: 120, borderRadius: 26,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 14,
  },
  logo: {
    width: 120, height: 120, borderRadius: 26,
  },

  flagBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1.2, gap: 4,
  },
  flagLabel: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1,
  },

  welcomeText: {
    color: '#8892A0', fontSize: 13, fontWeight: '400',
    letterSpacing: 1, textAlign: 'center',
  },
  brandName: {
    color: '#EAEEF3', fontSize: 26, fontWeight: '900',
    letterSpacing: 6, textAlign: 'center', marginTop: 2,
    marginBottom: 14,
  },
  tagline: {
    color: '#555E6C', fontSize: 9, fontWeight: '600',
    letterSpacing: 4, textAlign: 'center',
    marginTop: 0, marginBottom: 14, textTransform: 'uppercase',
  },

  cardsZone: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },

  slideTitle: {
    color: '#EAEEF3', fontSize: 22, fontWeight: '800',
    letterSpacing: 3, textAlign: 'center', marginBottom: 4,
  },
  slideSubtitle: {
    color: '#8892A0', fontSize: 12, fontWeight: '500',
    letterSpacing: 1, textAlign: 'center', marginBottom: 4,
  },

  badgesRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8,
  },
  badge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6,
    borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)',
    backgroundColor: 'rgba(0,217,132,0.06)',
  },
  badgeText: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1, color: '#00D984',
  },

  bottomZone: {
    paddingBottom: 10, minHeight: 80,
  },
  dotsContainer: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 8, marginBottom: 8,
  },
  dot: {
    height: 8, borderRadius: 4,
  },
});
