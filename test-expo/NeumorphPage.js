import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Pressable,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ============================================
// COULEURS NEUMORPHISM
// ============================================
const COLORS = {
  // Thème clair
  light: {
    bg: '#E4E8EC',
    shadowDark: 'rgba(163,177,198,0.6)',
    shadowLight: 'rgba(255,255,255,0.8)',
    accent: '#00D984',
    accentDark: '#00B870',
    accentLight: '#33FFAA',
    text: '#2D3436',
    textMuted: '#636E72',
    surface: '#E4E8EC',
  },
  // Thème sombre
  dark: {
    bg: '#1A1D22',
    shadowDark: 'rgba(0,0,0,0.5)',
    shadowLight: 'rgba(50,55,62,0.4)',
    accent: '#00D984',
    accentDark: '#00B870',
    accentLight: '#33FFAA',
    text: '#E0E0E0',
    textMuted: '#888888',
    surface: '#252A30',
  },
};

// ============================================
// SWITCH NEUMORPHIQUE (inspiré du CSS fourni)
// ============================================
const NeumorphSwitch = ({ value, onToggle, theme }) => {
  const slideAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const C = theme === 'dark' ? COLORS.dark : COLORS.light;

  const SWITCH_WIDTH = SCREEN_WIDTH * 0.55;
  const SWITCH_HEIGHT = SWITCH_WIDTH / 2.5;
  const BUTTON_WIDTH = SWITCH_WIDTH * 0.52;
  const BUTTON_HEIGHT = SWITCH_HEIGHT * 0.75;
  const BUTTON_PADDING = SWITCH_WIDTH * 0.04;
  const CIRCLE_SIZE = BUTTON_HEIGHT * 0.75;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: value ? 1 : 0,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const buttonLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BUTTON_PADDING, SWITCH_WIDTH - BUTTON_WIDTH - BUTTON_PADDING],
  });

  const indicatorLeftOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 1],
  });

  const indicatorRightOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.15],
  });

  const fillWidth = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Pressable onPress={onToggle}>
      <View style={{
        width: SWITCH_WIDTH,
        height: SWITCH_HEIGHT,
        borderRadius: SWITCH_HEIGHT,
        backgroundColor: C.surface,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        // Neumorphic inset shadow simulé
        borderWidth: 1,
        borderColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
        shadowColor: C.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
      }}>
        {/* Ombre interne (simulation) */}
        <View style={{
          position: 'absolute',
          top: 2, left: 2, right: 2, bottom: 2,
          borderRadius: SWITCH_HEIGHT,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
          backgroundColor: 'transparent',
        }} />

        {/* Indicateur gauche (accent color quand ON) */}
        <Animated.View style={{
          position: 'absolute',
          left: SWITCH_WIDTH * 0.08,
          width: SWITCH_WIDTH * 0.38,
          height: SWITCH_HEIGHT * 0.55,
          borderTopLeftRadius: SWITCH_HEIGHT,
          borderBottomLeftRadius: SWITCH_HEIGHT,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          overflow: 'hidden',
        }}>
          <Animated.View style={{
            width: '100%',
            height: '100%',
            borderRadius: SWITCH_HEIGHT,
            opacity: indicatorLeftOpacity,
          }}>
            {/* Gradient orange/doré simulé */}
            <View style={{
              flex: 1,
              borderTopLeftRadius: SWITCH_HEIGHT,
              borderBottomLeftRadius: SWITCH_HEIGHT,
              backgroundColor: '#FF9F43',
              shadowColor: '#FF6B3D',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}>
              {/* Highlight en haut */}
              <View style={{
                position: 'absolute',
                top: 2,
                left: '10%',
                width: '60%',
                height: '30%',
                borderRadius: 20,
                backgroundColor: 'rgba(255,220,150,0.3)',
              }} />
            </View>
          </Animated.View>
        </Animated.View>

        {/* Indicateur droit (gris quand OFF) */}
        <Animated.View style={{
          position: 'absolute',
          right: SWITCH_WIDTH * 0.08,
          width: SWITCH_WIDTH * 0.38,
          height: SWITCH_HEIGHT * 0.55,
          borderTopRightRadius: SWITCH_HEIGHT,
          borderBottomRightRadius: SWITCH_HEIGHT,
          opacity: indicatorRightOpacity,
          backgroundColor: theme === 'dark' ? 'rgba(60,65,72,0.6)' : 'rgba(180,190,200,0.5)',
          // Inset shadow
          borderWidth: 0.5,
          borderColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
        }} />

        {/* BOUTON PRINCIPAL (glisse) */}
        <Animated.View style={{
          position: 'absolute',
          left: buttonLeft,
          width: BUTTON_WIDTH,
          height: BUTTON_HEIGHT,
          borderRadius: BUTTON_HEIGHT,
          // Gradient métallique simulé
          backgroundColor: theme === 'dark' ? '#353A42' : '#E8ECEF',
          // Ombre portée forte
          shadowColor: C.shadowDark,
          shadowOffset: { width: 4, height: 6 },
          shadowOpacity: 0.6,
          shadowRadius: 10,
          elevation: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 0.5,
          borderColor: theme === 'dark' ? 'rgba(80,85,92,0.3)' : 'rgba(255,255,255,0.8)',
        }}>
          {/* Reflet en haut du bouton */}
          <View style={{
            position: 'absolute',
            top: 3,
            left: '10%',
            width: '80%',
            height: '30%',
            borderRadius: BUTTON_HEIGHT,
            backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.5)',
          }} />

          {/* Deux cercles yeux sur le bouton */}
          <View style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            marginRight: CIRCLE_SIZE * 0.15,
            backgroundColor: theme === 'dark' ? '#2A2F36' : '#DDE1E5',
            // Neumorphic inset
            borderWidth: 0.5,
            borderColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)',
            shadowColor: C.shadowDark,
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 2,
          }}>
            {/* Highlight */}
            <View style={{
              position: 'absolute',
              top: 3,
              left: 3,
              width: CIRCLE_SIZE * 0.35,
              height: CIRCLE_SIZE * 0.35,
              borderRadius: CIRCLE_SIZE,
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
            }} />
          </View>

          <View style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            backgroundColor: theme === 'dark' ? '#2A2F36' : '#DDE1E5',
            borderWidth: 0.5,
            borderColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)',
            shadowColor: C.shadowDark,
            shadowOffset: { width: 1, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 2,
          }}>
            <View style={{
              position: 'absolute',
              top: 3,
              left: 3,
              width: CIRCLE_SIZE * 0.35,
              height: CIRCLE_SIZE * 0.35,
              borderRadius: CIRCLE_SIZE,
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
            }} />
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
};

// ============================================
// BOUTON NEUMORPHIQUE (pressable avec enfoncement)
// ============================================
const NeumorphButton = ({ label, theme, onPress, color }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const C = theme === 'dark' ? COLORS.dark : COLORS.light;

  const handlePressIn = () => {
    Animated.timing(pressAnim, { toValue: 1, duration: 150, useNativeDriver: false }).start();
  };
  const handlePressOut = () => {
    Animated.timing(pressAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const shadowOpacity = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const innerShadowOpacity = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3] });
  const scaleVal = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={{
        width: SCREEN_WIDTH * 0.6,
        height: 50,
        borderRadius: 16,
        backgroundColor: C.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: C.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: shadowOpacity,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 0.5,
        borderColor: theme === 'dark' ? 'rgba(60,65,72,0.3)' : 'rgba(255,255,255,0.6)',
        transform: [{ scale: scaleVal }],
      }}>
        {/* Reflet en haut */}
        <View style={{
          position: 'absolute',
          top: 2,
          left: 8,
          right: 8,
          height: 15,
          borderRadius: 12,
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.4)',
        }} />
        {/* Inner shadow quand pressé */}
        <Animated.View style={{
          position: 'absolute',
          top: 2, left: 2, right: 2, bottom: 2,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)',
          opacity: innerShadowOpacity,
        }} />
        <Text style={{
          color: color || C.accent,
          fontSize: 14,
          fontWeight: 'bold',
          letterSpacing: 1,
        }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

// ============================================
// CARTE NEUMORPHIQUE
// ============================================
const NeumorphCard = ({ children, theme }) => {
  const C = theme === 'dark' ? COLORS.dark : COLORS.light;
  return (
    <View style={{
      width: SCREEN_WIDTH * 0.85,
      padding: 20,
      borderRadius: 20,
      backgroundColor: C.surface,
      shadowColor: C.shadowDark,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
      borderWidth: 0.5,
      borderColor: theme === 'dark' ? 'rgba(60,65,72,0.2)' : 'rgba(255,255,255,0.6)',
    }}>
      {/* Reflet */}
      <View style={{
        position: 'absolute',
        top: 3,
        left: 6,
        right: 6,
        height: 20,
        borderRadius: 16,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.35)',
      }} />
      {children}
    </View>
  );
};

// ============================================
// PAGE PRINCIPALE DE TEST
// ============================================
const NeumorphPage = () => {
  const [isDark, setIsDark] = useState(true);
  const [switchOn, setSwitchOn] = useState(false);
  const theme = isDark ? 'dark' : 'light';
  const C = isDark ? COLORS.dark : COLORS.light;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingVertical: 50, gap: 30 }}>

        {/* Titre */}
        <Text style={{ color: C.text, fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>
          Neumorphism Test
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 12 }}>
          LIXUM Design Lab
        </Text>

        {/* Toggle thème clair/sombre */}
        <NeumorphButton
          label={isDark ? 'PASSER EN CLAIR' : 'PASSER EN SOMBRE'}
          theme={theme}
          onPress={() => setIsDark(!isDark)}
          color={C.accent}
        />

        {/* Le SWITCH principal */}
        <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 10 }}>SWITCH NEUMORPHIQUE</Text>
        <NeumorphSwitch
          value={switchOn}
          onToggle={() => setSwitchOn(!switchOn)}
          theme={theme}
        />
        <Text style={{ color: C.textMuted, fontSize: 10 }}>
          {switchOn ? 'ON — Activé' : 'OFF — Désactivé'}
        </Text>

        {/* Carte neumorphique */}
        <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 10 }}>CARTE NEUMORPHIQUE</Text>
        <NeumorphCard theme={theme}>
          <Text style={{ color: C.accent, fontSize: 14, fontWeight: 'bold' }}>Score de Vitalité</Text>
          <Text style={{ color: C.text, fontSize: 32, fontWeight: 'bold', marginTop: 8 }}>87%</Text>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>Excellent — Continuez comme ça !</Text>
        </NeumorphCard>

        {/* Boutons */}
        <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 10 }}>BOUTONS NEUMORPHIQUES</Text>
        <NeumorphButton label="SCANNER UN REPAS" theme={theme} onPress={() => {}} />
        <NeumorphButton label="CONSULTER ALIXEN" theme={theme} onPress={() => {}} color="#4DA6FF" />
        <NeumorphButton label="ACTIVITÉ" theme={theme} onPress={() => {}} color="#FF8C42" />

        {/* Espace en bas */}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

export default NeumorphPage;
