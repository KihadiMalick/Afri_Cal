// LIXUM - Welcome Onboarding (Tinder-Style Swipe Cards) v1.0
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, react-native-gesture-handler,
//              react-native-reanimated, @expo/vector-icons
// Logo: mettre logo-lx.png dans le dossier assets du Snack
//
// Navigation simulee : "Commencer" et "Se connecter" affichent une Alert
// (a remplacer par router.push quand on aura le vrai routing)

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
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
  Easing,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;
var CARD_WIDTH = SCREEN_WIDTH - 48;
var CARD_HEIGHT = SCREEN_HEIGHT * 0.48;
var SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

var logoImage = require('./assets/logo-lx.png');

// ============================================================
// TRADUCTIONS
// ============================================================

var texts = {
  fr: {
    tagline: 'VOTRE TABLEAU DE BORD VITAL',

    slide1Title: 'SCAN X',
    slide1Subtitle: 'Technologie de reconnaissance avancee',
    slide1Body: 'Ce n\'est pas un simple scanner.\n\nSCAN X analyse vos repas sous\nmultiples angles en temps reel.\n\nComposition nutritionnelle detaillee\nen moins de 3 secondes.\n\nProteines. Glucides. Lipides.\nChaque molecule compte.',

    slide2Title: 'NUTRITION SOURCEE',
    slide2Subtitle: 'Donnees scientifiques certifiees',
    slide2Body: 'Nos donnees nutritionnelles proviennent\nde sources institutionnelles verifiees :\n\n\u25C6  USDA \u2014 Departement Agriculture US\n\u25C6  FAO \u2014 Organisation Nations Unies\n\u25C6  ANSES \u2014 Agence Nationale Securite\n\nDes recettes intelligentes qui s\'adaptent\na votre humeur et votre metabolisme.\n\nPas d\'approximation. De la science.',

    slide3Title: 'DASHBOARD VITAL',
    slide3Subtitle: 'Votre hygiene de vie, quantifiee',
    slide3Body: 'Un tableau de bord qui ne ment pas.\n\nScore de vitalite en temps reel.\nSuivi de vos calories consommees,\nbrulees et restantes.\n\nChaque decision alimentaire impacte\nvotre courbe. Chaque activite sportive\nla transforme.\n\nReprenez le controle.\nVotre corps vous remerciera.',

    cta: 'Commencer',
    hasAccount: 'Deja un compte ?',
    signIn: 'Se connecter',
    swipeHint: 'Swipez',
    readyTitle: 'Pret a commencer ?',
    readySub: 'Rejoignez LIXUM et reprenez\nle controle de votre vitalite',
  },
  en: {
    tagline: 'YOUR VITAL DASHBOARD',

    slide1Title: 'SCAN X',
    slide1Subtitle: 'Advanced recognition technology',
    slide1Body: 'This is not a simple scanner.\n\nSCAN X analyzes your meals from\nmultiple angles in real-time.\n\nDetailed nutritional breakdown\nin under 3 seconds.\n\nProteins. Carbs. Fats.\nEvery molecule matters.',

    slide2Title: 'VERIFIED NUTRITION',
    slide2Subtitle: 'Certified scientific data',
    slide2Body: 'Our nutritional data comes from\nverified institutional sources:\n\n\u25C6  USDA \u2014 US Dept. of Agriculture\n\u25C6  FAO \u2014 United Nations Organization\n\u25C6  ANSES \u2014 French Safety Agency\n\nSmart recipes that adapt to your\nmood, goals, and metabolism.\n\nNo guesswork. Pure science.',

    slide3Title: 'VITAL DASHBOARD',
    slide3Subtitle: 'Your lifestyle, quantified',
    slide3Body: 'A dashboard that doesn\'t lie.\n\nReal-time vitality score.\nTrack your calories consumed,\nburned, and remaining.\n\nEvery food decision impacts\nyour curve. Every workout\ntransforms it.\n\nTake back control.\nYour body will thank you.',

    cta: 'Get Started',
    hasAccount: 'Already have an account?',
    signIn: 'Sign in',
    swipeHint: 'Swipe',
    readyTitle: 'Ready to start?',
    readySub: 'Join LIXUM and take back\ncontrol of your vitality',
  },
};

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
        withTiming(1.08, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) })
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

  var iconName = 'scan';
  if (type === 'nutrition') iconName = 'flask';
  if (type === 'dashboard') iconName = 'pulse';

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

      <Animated.View style={[{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1.5,
        borderColor: color + '50',
        alignItems: 'center',
        justifyContent: 'center',
      }, pulseStyle]}>
        <Ionicons name={iconName} size={28} color={color} />
      </Animated.View>
    </View>
  );
}

// ============================================================
// CARTE SWIPEABLE
// ============================================================

function SwipeCard(props) {
  var slide = props.slide;
  var index = props.index;
  var totalCards = props.totalCards;
  var currentIndex = props.currentIndex;
  var onSwipe = props.onSwipe;
  var lang = props.lang;

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
          { zIndex: totalCards - index },
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
            colors={[
              'rgba(50, 58, 72, 0.75)',
              'rgba(35, 41, 52, 0.70)',
              'rgba(27, 31, 38, 0.80)',
              'rgba(21, 27, 35, 0.85)',
            ]}
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

            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.slideBody}>{slide.body}</Text>
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

            <View style={{
              position: 'absolute',
              bottom: 10,
              right: 16,
              flexDirection: 'row',
              alignItems: 'center',
              opacity: 0.4,
            }}>
              <Ionicons name="arrow-forward" size={14} color="#8892A0" />
              <Text style={{ color: '#8892A0', fontSize: 10, marginLeft: 4 }}>
                {lang === 'fr' ? 'Swipez' : 'Swipe'}
              </Text>
            </View>

          </LinearGradient>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// ============================================================
// PAGE WELCOME (assemblage)
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
      body: t.slide1Body,
      badges: ['AI-POWERED', 'REAL-TIME', 'MULTI-ANGLE'],
      color: '#00D984',
    },
    {
      key: 'nutrition',
      title: t.slide2Title,
      subtitle: t.slide2Subtitle,
      body: t.slide2Body,
      badges: ['USDA', 'FAO', 'ANSES'],
      color: '#00BFA6',
    },
    {
      key: 'dashboard',
      title: t.slide3Title,
      subtitle: t.slide3Subtitle,
      body: t.slide3Body,
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
    // TODO: remplacer par router.push('/register')
    Alert.alert('Navigation', 'Aller vers la page Inscription');
  };

  var handleSignIn = function () {
    // TODO: remplacer par router.push('/login')
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
            <View style={styles.logoSmallContainer}>
              <Image
                source={logoImage}
                style={styles.logoSmall}
                resizeMode="cover"
              />
            </View>

            <View style={{ position: 'absolute', right: 0, top: 0 }}>
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
              slides.slice().reverse().map(function (slide, reverseIndex) {
                var actualIndex = slides.length - 1 - reverseIndex;
                return (
                  <SwipeCard
                    key={slide.key}
                    slide={slide}
                    index={actualIndex}
                    totalCards={slides.length}
                    currentIndex={currentIndex}
                    onSwipe={handleSwipe}
                    lang={lang}
                  />
                );
              })
            ) : (
              <View style={styles.finalMessage}>
                <Ionicons name="checkmark-circle" size={60} color="#00D984" />
                <Text style={styles.finalTitle}>{t.readyTitle}</Text>
                <Text style={styles.finalSubtitle}>{t.readySub}</Text>
              </View>
            )}

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
          </View>

          <View style={styles.ctaContainer}>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
    paddingTop: 36,
  },
  logoSmallContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  logoSmall: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },

  // Lang switch
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

  // Tagline
  tagline: {
    color: '#555E6C',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },

  // Cards zone
  cardsZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOuter: {
    position: 'absolute',
    alignSelf: 'center',
  },

  // Slide content
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
  slideBody: {
    color: '#8892A0',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Badges
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

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    bottom: -30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },

  // Final message
  finalMessage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalTitle: {
    color: '#EAEEF3',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  finalSubtitle: {
    color: '#8892A0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // CTA buttons
  ctaContainer: {
    marginTop: 20,
    paddingBottom: 10,
  },
  ctaButton: {
    borderRadius: 14,
    marginBottom: 16,
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

  // Sign in
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
