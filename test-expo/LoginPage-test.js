// LIXUM - Login Page Test v2.2
// Copier-coller dans App.js sur snack.expo.dev
// Dependance: expo-linear-gradient
// Logo: mettre logo-lx.png dans le dossier assets du Snack
//
// v2.2 — Glassmorphism card, glass buttons, logo 150x150, biometrique turquoise

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

var COLORS = {
  bgDeep: '#080A0E',
  bgPrimary: '#0D1117',
  bgSecondary: '#151B23',
  bgTertiary: '#1C2330',
  metalLight: '#3A4250',
  metalMid: '#2A303B',
  metalDark: '#1B1F26',
  metalBorder: '#3E4855',
  metalShine: '#6B7B8D',
  emerald: '#00D984',
  emeraldBright: '#00FFB2',
  emeraldDark: '#00A866',
  emeraldDeep: '#006B40',
  emeraldMuted: 'rgba(0, 217, 132, 0.15)',
  turquoise: '#00BFA6',
  textPrimary: '#EAEEF3',
  textSecondary: '#8892A0',
  textMuted: '#555E6C',
  textPlaceholder: '#3E4855',
};

var texts = {
  fr: {
    tagline: 'VOTRE TABLEAU DE BORD VITAL',
    title: 'Connexion',
    subtitle: 'Accede a ton dashboard de vitalite',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: '........',
    loginButton: 'Se connecter',
    separator: 'OU',
    googleButton: 'Continuer avec Google',
    biometricButton: 'Connexion biometrique',
    noAccount: 'Pas de compte ?',
    signUp: "S'inscrire",
    errorTitle: 'Erreur',
    errorEmpty: 'Remplis tous les champs',
  },
  en: {
    tagline: 'YOUR VITAL DASHBOARD',
    title: 'Sign In',
    subtitle: 'Access your vitality dashboard',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '........',
    loginButton: 'Sign In',
    separator: 'OR',
    googleButton: 'Continue with Google',
    biometricButton: 'Biometric Login',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    errorTitle: 'Error',
    errorEmpty: 'Please fill in all fields',
  },
};

var logoImage = require('./assets/logo-lx.png');

export default function App() {
  var _email = useState('');
  var email = _email[0];
  var setEmail = _email[1];

  var _password = useState('');
  var password = _password[0];
  var setPassword = _password[1];

  var _lang = useState('fr');
  var lang = _lang[0];
  var setLang = _lang[1];

  var t = texts[lang];

  var handleLogin = function () {
    if (!email || !password) {
      Alert.alert(t.errorTitle, t.errorEmpty);
      return;
    }
    Alert.alert('Test Login', 'Email: ' + email);
  };

  var handleGoogleLogin = function () {
    Alert.alert('Google', 'Google OAuth - a implementer');
  };

  var handleBiometric = function () {
    Alert.alert('Biometrique', 'Biometric login - a implementer');
  };

  var handleRegister = function () {
    Alert.alert('Navigation', 'Aller vers /register');
  };

  // Switch langue FR/EN
  function LangSwitch() {
    return (
      <View style={styles.langRow}>
        <View style={styles.langCapsule}>
          <TouchableOpacity onPress={function () { setLang('fr'); }} activeOpacity={0.7}>
            {lang === 'fr' ? (
              <LinearGradient
                colors={['#00D984', '#00C278', '#00A866']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.langBtnActive}
              >
                <Text style={styles.langTextActive}>FR</Text>
              </LinearGradient>
            ) : (
              <View style={styles.langBtnInactive}>
                <Text style={styles.langTextInactive}>FR</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.langSep} />
          <TouchableOpacity onPress={function () { setLang('en'); }} activeOpacity={0.7}>
            {lang === 'en' ? (
              <LinearGradient
                colors={['#00D984', '#00C278', '#00A866']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.langBtnActive}
              >
                <Text style={styles.langTextActive}>EN</Text>
              </LinearGradient>
            ) : (
              <View style={styles.langBtnInactive}>
                <Text style={styles.langTextInactive}>EN</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#080A0E', '#0D1117', '#0F1923', '#0D1117', '#080A0E']}
      locations={[0, 0.2, 0.5, 0.8, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <LangSwitch />

        {/* CORRECTION 3 — Logo 150x150 */}
        <View style={{ alignItems: 'center', marginBottom: 14 }}>
          <View style={styles.logoWrap}>
            <Image
              source={logoImage}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>

        <Text style={styles.tagline}>{t.tagline}</Text>

        {/* CORRECTION 4 — Carte Glassmorphism */}
        <View style={styles.cardShadow}>
          <View style={styles.cardBevel}>
            <LinearGradient
              colors={[
                'rgba(58, 66, 80, 0.65)',
                'rgba(42, 48, 59, 0.55)',
                'rgba(30, 35, 43, 0.60)',
                'rgba(27, 31, 38, 0.70)',
              ]}
              locations={[0, 0.3, 0.6, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.card}
            >
              <View style={styles.glassReflectWrap}>
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.10)',
                    'rgba(255, 255, 255, 0.03)',
                    'rgba(255, 255, 255, 0)',
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ flex: 1 }}
                />
              </View>

              <View style={styles.glassHighlight} />

              <View style={styles.glassDiagonalReflect} />

              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>

              <Text style={styles.label}>{t.emailLabel}</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder={t.emailPlaceholder}
                  placeholderTextColor={COLORS.textPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>{t.passwordLabel}</Text>
              <View style={[styles.inputWrap, { marginBottom: 24 }]}>
                <TextInput
                  placeholder={t.passwordPlaceholder}
                  placeholderTextColor={COLORS.textPlaceholder}
                  secureTextEntry={true}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
              </View>

              {/* CORRECTION 1 — Bouton Se connecter Glass */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLogin}
                style={styles.btnConnectWrap}
              >
                <View style={styles.btnConnectGlass}>
                  <View style={styles.btnConnectGlassReflet} />
                  <View style={styles.btnConnectGlassLine} />
                  <Text style={styles.btnConnectText}>{t.loginButton}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.separator}>
                <View style={styles.sepLine} />
                <Text style={styles.sepText}>{t.separator}</Text>
                <View style={styles.sepLine} />
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleGoogleLogin}
                style={{ marginBottom: 12 }}
              >
                <View style={styles.btnGoogle}>
                  <View style={styles.btnGoogleShine} />
                  <Text style={styles.googleG}>G</Text>
                  <Text style={styles.btnGoogleText}>{t.googleButton}</Text>
                </View>
              </TouchableOpacity>

              {/* CORRECTION 2 — Bouton Biometrique Turquoise */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBiometric}
                style={{ marginBottom: 20 }}
              >
                <View style={styles.btnBio}>
                  <View style={styles.btnBioReflet} />
                  <Text style={{ fontSize: 18 }}>&#x1F512;</Text>
                  <Text style={styles.btnBioText}>{t.biometricButton}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
                  {t.noAccount}{' '}
                </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.registerLink}>{t.signUp}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

var styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Lang switch
  langRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingTop: 8,
  },
  langCapsule: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: '#3E4855',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  langBtnActive: {
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  langTextActive: {
    color: '#0D1117',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  langBtnInactive: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#1B1F26',
  },
  langTextInactive: {
    color: '#555E6C',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  langSep: {
    width: 1,
    backgroundColor: '#3E4855',
  },

  // CORRECTION 3 — Logo 150x150
  logoWrap: {
    width: 150,
    height: 150,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 30,
  },

  tagline: {
    color: '#555E6C',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },

  // CORRECTION 4 — Carte Glassmorphism
  cardShadow: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 14,
  },
  cardBevel: {
    borderRadius: 20,
    borderWidth: 1.2,
    borderTopColor: 'rgba(107, 123, 141, 0.5)',
    borderLeftColor: 'rgba(107, 123, 141, 0.25)',
    borderRightColor: 'rgba(42, 48, 59, 0.5)',
    borderBottomColor: 'rgba(26, 31, 38, 0.6)',
    overflow: 'hidden',
  },
  card: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
  },
  glassReflectWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 1,
  },
  glassDiagonalReflect: {
    position: 'absolute',
    top: -60,
    left: -30,
    width: 180,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 90,
    transform: [{ rotate: '45deg' }],
  },

  title: {
    color: '#EAEEF3',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#8892A0',
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    color: '#8892A0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrap: {
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: 'rgba(13, 17, 23, 0.8)',
    borderWidth: 1.2,
    borderTopColor: 'rgba(10, 13, 18, 0.9)',
    borderLeftColor: 'rgba(13, 16, 21, 0.9)',
    borderRightColor: 'rgba(42, 48, 59, 0.6)',
    borderBottomColor: 'rgba(62, 72, 85, 0.5)',
  },
  input: {
    color: '#EAEEF3',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // CORRECTION 1 — Bouton Se connecter Glass
  btnConnectWrap: {
    marginBottom: 20,
    borderRadius: 14,
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  btnConnectGlass: {
    borderRadius: 14,
    borderWidth: 1.3,
    borderColor: 'rgba(0, 217, 132, 0.4)',
    backgroundColor: 'rgba(0, 217, 132, 0.08)',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  btnConnectGlassReflet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 217, 132, 0.04)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  btnConnectGlassLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(0, 217, 132, 0.3)',
  },
  btnConnectText: {
    color: '#00D984',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },

  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sepLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(42, 48, 59, 0.8)',
  },
  sepText: {
    color: '#555E6C',
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 14,
    letterSpacing: 2,
  },

  btnGoogle: {
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(62, 72, 85, 0.6)',
    backgroundColor: 'rgba(21, 27, 35, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  btnGoogleShine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(107, 123, 141, 0.15)',
  },
  googleG: {
    color: '#EAEEF3',
    fontSize: 18,
    fontWeight: '700',
  },
  btnGoogleText: {
    color: '#EAEEF3',
    fontSize: 14,
    fontWeight: '600',
  },

  // CORRECTION 2 — Bouton Biometrique Turquoise
  btnBio: {
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 191, 166, 0.3)',
    backgroundColor: 'rgba(0, 191, 166, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  btnBioReflet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 191, 166, 0.03)',
  },
  btnBioText: {
    color: '#00BFA6',
    fontSize: 14,
    fontWeight: '600',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLink: {
    color: '#00D984',
    fontSize: 14,
    fontWeight: '700',
  },
});
