// LIXUM - Welcome Onboarding (Tinder-Style) v6.0
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, react-native-gesture-handler,
//              react-native-reanimated, @expo/vector-icons, react-native-svg
// Logo: mettre logo-lx.png dans le dossier assets du Snack
//
// v6.0 — Cartes Pokemon premium avec bordures metalliques,
//         max 2 cartes rendues, drapeaux au niveau logo,
//         fond gris gradient partout, CARD_H 0.44

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
var CARD_W = SCREEN_WIDTH - 56;
var CARD_H = SCREEN_HEIGHT * 0.44;
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
    <View style={{ alignItems: 'center', marginBottom: 10 }}>
      <Animated.View style={[{
        position: 'absolute', width: 80, height: 80, borderRadius: 40,
        backgroundColor: color, top: -12,
      }, glowStyle]} />
      <Animated.View style={[{ width: 52, height: 52 }, pulseStyle]}>
        {type === 'scan' && <ScanXIcon size={52} color={color} />}
        {type === 'nutrition' && (
          <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={52} height={52} viewBox="0 0 56 56">
              <Circle cx="28" cy="28" r="26" fill="rgba(0,0,0,0.3)" stroke={color + '50'} strokeWidth="1.5" />
            </Svg>
            <Ionicons name="flask" size={24} color={color} style={{ position: 'absolute' }} />
          </View>
        )}
        {type === 'dashboard' && (
          <View style={{ width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={52} height={52} viewBox="0 0 56 56">
              <Circle cx="28" cy="28" r="26" fill="rgba(0,0,0,0.3)" stroke={color + '50'} strokeWidth="1.5" />
            </Svg>
            <Ionicons name="pulse" size={24} color={color} style={{ position: 'absolute' }} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

// ============================================================
// SWIPE HINT — centre en bas de la carte
// ============================================================

function SwipeHint(props) {
  var lang = props.lang;
  var translateX = useRef(new RNAnimated.Value(0)).current;
  var loopRef = useRef(null);

  useEffect(function () {
    loopRef.current = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.delay(500),
        RNAnimated.timing(translateX, { toValue: -40, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.timing(translateX, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        RNAnimated.delay(1000),
      ])
    );
    loopRef.current.start();
    return function () { if (loopRef.current) loopRef.current.stop(); };
  }, []);

  return (
    <RNAnimated.View style={{
      transform: [{ translateX: translateX }],
    }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)', gap: 6,
      }}>
        <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '600' }}>
          {lang === 'fr' ? 'Glissez' : 'Swipe'}
        </Text>
        <Ionicons name="arrow-back" size={13} color="#00D984" />
      </View>
    </RNAnimated.View>
  );
}

// ============================================================
// CARTE POKEMON PREMIUM — cadre metallique + lisere emeraude
// MAX 2 cartes rendues : active + suivante
// ============================================================

function PokemonCard(props) {
  var slide = props.slide;
  var index = props.index;
  var isTopCard = props.isTopCard;
  var currentIndex = props.currentIndex;
  var onSwipe = props.onSwipe;
  var lang = props.lang;

  var translateX = useSharedValue(0);
  var translateY = useSharedValue(0);
  var rotateZ = useSharedValue(0);

  var gesture = Gesture.Pan()
    .enabled(isTopCard)
    .onUpdate(function (event) {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3;
      rotateZ.value = interpolate(
        event.translationX, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-12, 0, 12],
        Extrapolation.CLAMP
      );
    })
    .onEnd(function (event) {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        var dir = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(dir * SCREEN_WIDTH * 1.5, { duration: 300 });
        rotateZ.value = withTiming(dir * 20, { duration: 300 });
        runOnJS(onSwipe)(dir);
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  var animStyle = useAnimatedStyle(function () {
    if (!isTopCard) return {};
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: rotateZ.value + 'deg' },
      ],
    };
  });

  var behindStyle = !isTopCard ? {
    transform: [{ scale: 0.95 }, { translateY: 10 }],
    opacity: 0.5,
  } : {};

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[
        {
          position: 'absolute',
          alignSelf: 'center',
          zIndex: isTopCard ? 10 : 5,
        },
        isTopCard ? animStyle : behindStyle,
      ]}>
        <View style={{
          width: CARD_W + 8,
          height: CARD_H + 8,
          borderRadius: 24,
          padding: 4,
          borderWidth: 2,
          borderTopColor: '#8892A0',
          borderLeftColor: '#6B7B8D',
          borderRightColor: '#3E4855',
          borderBottomColor: '#2A303B',
          backgroundColor: '#2A303B',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.6,
          shadowRadius: 16,
          elevation: 14,
        }}>
          <View style={{
            flex: 1,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: 'rgba(0,217,132,0.35)',
            overflow: 'hidden',
            shadowColor: '#00D984',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}>
            <View style={{
              flex: 1,
              backgroundColor: '#151B23',
              borderRadius: 18,
            }}>
              <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 110,
                borderTopLeftRadius: 18, borderTopRightRadius: 18, overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={['#1E2530', '#1A2028', '#151B23']}
                  start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
                  style={{ flex: 1 }}
                />
              </View>

              <View style={{
                position: 'absolute', top: 0, left: 16, right: 16,
                height: 1, backgroundColor: 'rgba(136,146,160,0.25)',
              }} />

              <View style={{
                flex: 1,
                paddingHorizontal: 22,
                paddingTop: 24,
                paddingBottom: 14,
                justifyContent: 'space-between',
              }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{ marginBottom: 10 }}>
                    <SlideIcon type={slide.key} color={slide.color} />
                  </View>
                  <Text style={{
                    color: '#EAEEF3', fontSize: 20, fontWeight: '800',
                    letterSpacing: 3, textAlign: 'center', marginBottom: 3,
                  }}>
                    {slide.title}
                  </Text>
                  <Text style={{
                    color: '#8892A0', fontSize: 11, fontWeight: '500',
                    letterSpacing: 1, textAlign: 'center',
                  }}>
                    {slide.subtitle}
                  </Text>
                </View>

                <View style={{ gap: 14 }}>
                  {slide.lines.map(function (line, i) {
                    return (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{
                          width: 34, height: 34, borderRadius: 17,
                          backgroundColor: 'rgba(0,217,132,0.10)',
                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.18)',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Ionicons name={line.icon} size={16} color="#00D984" />
                        </View>
                        <Text style={{
                          color: '#EAEEF3', fontSize: 12.5, fontWeight: '500',
                          flex: 1, lineHeight: 17,
                        }}>
                          {line.text}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View>
                  {isTopCard && currentIndex === 0 ? (
                    <View style={{ alignItems: 'center', marginBottom: 8 }}>
                      <SwipeHint lang={lang} />
                    </View>
                  ) : null}

                  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                    {slide.badges.map(function (badge, i) {
                      return (
                        <View key={i} style={{
                          paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5,
                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.22)',
                          backgroundColor: 'rgba(0,217,132,0.05)',
                        }}>
                          <Text style={{ color: '#00D984', fontSize: 8, fontWeight: '700', letterSpacing: 0.8 }}>
                            {badge}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
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
      <LinearGradient
        colors={['#1C2435', '#1A2030', '#1C2435']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>

          <View style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginTop: 8,
            marginBottom: 6,
          }}>
            <TouchableOpacity
              onPress={function () { setLang('en'); }}
              activeOpacity={0.7}
              style={{ position: 'absolute', left: 0 }}
            >
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 7, paddingVertical: 4,
                borderRadius: 6, borderWidth: 1, gap: 3,
                borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.5)',
                backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'rgba(27,31,38,0.6)',
              }}>
                <Text style={{ fontSize: 11 }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text>
                <Text style={{ color: lang === 'en' ? '#00D984' : '#555E6C', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 }}>EN</Text>
              </View>
            </TouchableOpacity>

            <View style={{
              width: 140, height: 140, borderRadius: 30,
              shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5, shadowRadius: 14, elevation: 12,
            }}>
              <Image source={logoImage}
                style={{ width: 140, height: 140, borderRadius: 30 }} resizeMode="cover" />
            </View>

            <TouchableOpacity
              onPress={function () { setLang('fr'); }}
              activeOpacity={0.7}
              style={{ position: 'absolute', right: 0 }}
            >
              <View style={{
                flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 7, paddingVertical: 4,
                borderRadius: 6, borderWidth: 1, gap: 3,
                borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.5)',
                backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'rgba(27,31,38,0.6)',
              }}>
                <Text style={{ fontSize: 11 }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text>
                <Text style={{ color: lang === 'fr' ? '#00D984' : '#555E6C', fontSize: 8, fontWeight: '700', letterSpacing: 0.5 }}>FR</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={{
            color: '#8892A0', fontSize: 13, fontWeight: '400',
            letterSpacing: 1, textAlign: 'center',
            marginTop: 4, marginBottom: 2,
          }}>
            {t.welcome}
          </Text>

          <Text style={{
            color: '#EAEEF3', fontSize: 26, fontWeight: '900',
            letterSpacing: 6, textAlign: 'center',
            marginBottom: 12,
          }}>
            {t.brandName}
          </Text>

          <Text style={{
            color: '#555E6C', fontSize: 9, fontWeight: '600',
            letterSpacing: 4, textAlign: 'center',
            marginBottom: 12, textTransform: 'uppercase',
          }}>
            {t.tagline}
          </Text>

          <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 0,
          }}>
            {!allSwiped ? (
              <View style={{ width: CARD_W + 8, height: CARD_H + 8 }}>
                {slides.map(function (slide, index) {
                  if (index < currentIndex) return null;
                  if (index > currentIndex + 1) return null;
                  var isTopCard = index === currentIndex;
                  return (
                    <PokemonCard
                      key={slide.key}
                      slide={slide}
                      index={index}
                      isTopCard={isTopCard}
                      currentIndex={currentIndex}
                      onSwipe={handleSwipe}
                      lang={lang}
                    />
                  );
                })}
              </View>
            ) : (
              <Animated.View entering={FadeInDown.duration(600).springify()}>
                <View style={{
                  width: CARD_W + 8, height: CARD_H + 8,
                  borderRadius: 24, padding: 4,
                  borderWidth: 2,
                  borderTopColor: '#8892A0',
                  borderLeftColor: '#6B7B8D',
                  borderRightColor: '#3E4855',
                  borderBottomColor: '#2A303B',
                  backgroundColor: '#2A303B',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.6,
                  shadowRadius: 16,
                  elevation: 14,
                  alignSelf: 'center',
                }}>
                  <View style={{
                    flex: 1, borderRadius: 20, borderWidth: 1.5,
                    borderColor: 'rgba(0,217,132,0.35)', overflow: 'hidden',
                  }}>
                    <View style={{
                      flex: 1, backgroundColor: '#151B23', borderRadius: 18,
                      paddingVertical: 30, paddingHorizontal: 24, alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <View style={{
                        position: 'absolute', top: 0, left: 16, right: 16,
                        height: 1, backgroundColor: 'rgba(136,146,160,0.25)',
                      }} />

                      <View style={{
                        width: 60, height: 60, borderRadius: 30,
                        backgroundColor: 'rgba(0,217,132,0.10)',
                        borderWidth: 1.5, borderColor: '#00D984',
                        alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                      }}>
                        <Ionicons name="checkmark" size={30} color="#00D984" />
                      </View>

                      <Text style={{
                        color: '#EAEEF3', fontSize: 20, fontWeight: '700',
                        textAlign: 'center', marginBottom: 22,
                      }}>
                        {t.readyTitle}
                      </Text>

                      <TouchableOpacity activeOpacity={0.7} onPress={handleJoin}
                        style={{ width: '100%', borderRadius: 14 }}>
                        <View style={{
                          borderRadius: 14, borderWidth: 1.3, borderColor: 'rgba(0,217,132,0.4)',
                          backgroundColor: 'rgba(0,217,132,0.10)', paddingVertical: 15,
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
                          <Text style={{ color: '#00D984', fontSize: 15, fontWeight: '700', letterSpacing: 1 }}>
                            {t.joinBtn}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}
          </View>

          <View style={{
            flexDirection: 'row', justifyContent: 'center',
            alignItems: 'center', gap: 8,
            marginTop: 14, marginBottom: 12,
          }}>
            {slides.map(function (_, i) {
              return (
                <View key={i} style={{
                  height: 8, borderRadius: 4,
                  backgroundColor: i === currentIndex ? '#00D984' : i < currentIndex ? '#00A866' : '#3E4855',
                  width: i === currentIndex ? 24 : 8,
                }} />
              );
            })}
          </View>

          {allSwiped ? (
            <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}
              style={{ marginTop: 8, marginBottom: 20, alignItems: 'center' }}>
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
      </LinearGradient>
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
    paddingBottom: 20,
  },
});
