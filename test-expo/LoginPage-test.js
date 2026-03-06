// LIXUM - Login Page Test v2.1
// Copier-coller dans App.js sur snack.expo.dev
// Dependance: expo-linear-gradient
// Logo: mettre logo-lx.png dans le dossier assets du Snack

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

const COLORS = {
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
  textPrimary: '#EAEEF3',
  textSecondary: '#8892A0',
  textMuted: '#555E6C',
  textPlaceholder: '#3E4855',
};

const texts = {
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

const logoImage = require('./assets/logo-lx.png');

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('fr');
  const t = texts[lang];

  const handleLogin = function () {
    if (!email || !password) {
      Alert.alert(t.errorTitle, t.errorEmpty);
      return;
    }
    Alert.alert('Test Login', 'Email: ' + email);
  };

  const handleGoogleLogin = function () {
    Alert.alert('Google', 'Google OAuth - a implementer');
  };

  const handleBiometric = function () {
    Alert.alert('Biometrique', 'Biometric login - a implementer');
  };

  const handleRegister = function () {
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

  // Lignes texture brossee
  function BrushedLines() {
    var lines = [];
    var positions = [60, 120, 180, 240, 300, 360];
    for (var i = 0; i < positions.length; i++) {
      lines.push(
        <View
          key={i}
          style={{
            position: 'absolute',
            top: positions[i],
            left: 10,
            right: 10,
            height: 0.5,
            backgroundColor: '#6B7B8D',
            opacity: 0.04 + (i % 2) * 0.02,
          }}
        />
      );
    }
    return lines;
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

        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <View style={styles.logoWrap}>
            <Image
              source={logoImage}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        <Text style={styles.tagline}>{t.tagline}</Text>

        <View style={styles.cardShadow}>
          <View style={styles.cardBevel}>
            <LinearGradient
              colors={['#3A4250', '#4A5568', '#3E4855', '#2E3440', '#252B35', '#1E232B']}
              locations={[0, 0.12, 0.3, 0.55, 0.8, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.card}
            >
              <View style={styles.cardReflectWrap}>
                <LinearGradient
                  colors={['rgba(107, 123, 141, 0.25)', 'rgba(107, 123, 141, 0.08)', 'rgba(107, 123, 141, 0)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ flex: 1 }}
                />
              </View>

              <View style={styles.cardShine} />
              <BrushedLines />

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

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                style={styles.btnConnectWrap}
              >
                <View style={styles.btnConnectBorder}>
                  <LinearGradient
                    colors={['#00D984', '#00C278', '#00A866', '#00895A']}
                    locations={[0, 0.3, 0.7, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.btnConnectInner}
                  >
                    <View style={styles.btnShine} />
                    <View style={styles.btnHighlight} />
                    <Text style={styles.btnConnectText}>{t.loginButton}</Text>
                  </LinearGradient>
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

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBiometric}
                style={{ marginBottom: 20 }}
              >
                <View style={styles.btnBio}>
                  <View style={styles.btnBioShine} />
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
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 26,
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
  cardShadow: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
    elevation: 16,
  },
  cardBevel: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderTopColor: '#6B7B8D',
    borderLeftColor: '#5A6577',
    borderRightColor: '#2A303B',
    borderBottomColor: '#1A1F26',
    overflow: 'hidden',
  },
  card: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
  },
  cardReflectWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    overflow: 'hidden',
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: '#8892A0',
    opacity: 0.5,
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
    backgroundColor: '#0D1117',
    borderWidth: 1.2,
    borderTopColor: '#0A0D12',
    borderLeftColor: '#0D1015',
    borderRightColor: '#2A303B',
    borderBottomColor: '#3E4855',
  },
  input: {
    color: '#EAEEF3',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  btnConnectWrap: {
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnConnectBorder: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderTopColor: '#00FFB2',
    borderLeftColor: '#00D984',
    borderRightColor: '#00895A',
    borderBottomColor: '#006B40',
    overflow: 'hidden',
  },
  btnConnectInner: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  btnShine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#00FFB2',
    opacity: 0.5,
  },
  btnHighlight: {
    position: 'absolute',
    top: 1,
    left: '20%',
    right: '20%',
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  btnConnectText: {
    color: '#0D1117',
    fontSize: 16,
    fontWeight: '800',
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
    backgroundColor: '#2A303B',
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
    borderColor: '#3E4855',
    backgroundColor: '#151B23',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  btnGoogleShine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#6B7B8D',
    opacity: 0.15,
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
  btnBio: {
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 217, 132, 0.25)',
    backgroundColor: 'rgba(0, 217, 132, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  btnBioShine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#00D984',
    opacity: 0.12,
  },
  btnBioText: {
    color: '#00D984',
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
