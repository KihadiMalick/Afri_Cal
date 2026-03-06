/**
 * LIXUM - Login Page Test v2 (Logo PNG + Metal Brosse + Switch Langue)
 *
 * Usage: Copier-coller ce contenu dans App.js sur snack.expo.dev
 * Dependances Snack: ajouter "expo-linear-gradient" dans package.json
 *
 * IMPORTANT pour le logo:
 *   1. Dans Snack Expo, cree un dossier "assets" (panneau gauche)
 *   2. Upload ton image logo-lx.png dedans
 *   3. Le require('./assets/logo-lx.png') fonctionnera automatiquement
 *
 * Version: 2.0
 * Date: 2026-03-06
 * Status: TEST - A valider avant integration dans le repo final
 * Changelog:
 *   v2.0 - Logo PNG au lieu du logo code en couches
 *        - Carte connexion metal brosse amelioree (gradient clair → sombre)
 *        - Switch FR/EN en haut a droite
 *        - Tous les textes traduits via dictionnaire
 *        - Tagline changee: "VOTRE TABLEAU DE BORD VITAL"
 */

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

// === PALETTE LIXUM PREMIUM ===
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

// === DICTIONNAIRE DE TRADUCTION ===
const texts = {
  fr: {
    tagline: 'VOTRE TABLEAU DE BORD VITAL',
    title: 'Connexion',
    subtitle: 'Accede a ton dashboard de vitalite',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Mot de passe',
    passwordPlaceholder: '••••••••',
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
    passwordPlaceholder: '••••••••',
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

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('fr');

  const t = texts[lang];

  // --- Handlers (remplacer par la vraie logique Supabase dans le repo final) ---
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert(t.errorTitle, t.errorEmpty);
      return;
    }
    Alert.alert('Test Login', `Email: ${email}`);
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google', 'Google OAuth - a implementer');
  };

  const handleBiometric = () => {
    Alert.alert('Biometrique', 'Biometric login - a implementer');
  };

  const handleRegister = () => {
    Alert.alert('Navigation', 'Aller vers /register');
  };

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
        {/* ====== SWITCH DE LANGUE FR | EN ====== */}
        <View style={styles.langRow}>
          <View style={styles.langCapsule}>
            {/* Bouton FR */}
            <TouchableOpacity onPress={() => setLang('fr')} activeOpacity={0.7}>
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

            {/* Separateur */}
            <View style={styles.langSep} />

            {/* Bouton EN */}
            <TouchableOpacity onPress={() => setLang('en')} activeOpacity={0.7}>
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

        {/* ====== LOGO — Image PNG ====== */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <View style={styles.logoWrap}>
            <Image
              source={require('./assets/logo-lx.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* TAGLINE */}
        <Text style={styles.tagline}>{t.tagline}</Text>

        {/* ====== CARTE CONNEXION — Metal brosse ameliore ====== */}
        <View style={styles.cardShadow}>
          {/* Cadre exterieur bisaute */}
          <View style={styles.cardBevel}>
            <LinearGradient
              colors={[
                '#3A4250',
                '#4A5568',
                '#3E4855',
                '#2E3440',
                '#252B35',
                '#1E232B',
              ]}
              locations={[0, 0.12, 0.3, 0.55, 0.8, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.card}
            >
              {/* Reflet diffus en haut (40px) */}
              <View style={styles.cardReflectWrap}>
                <LinearGradient
                  colors={[
                    'rgba(107, 123, 141, 0.25)',
                    'rgba(107, 123, 141, 0.08)',
                    'rgba(107, 123, 141, 0)',
                  ]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={{ flex: 1 }}
                />
              </View>

              {/* Ligne highlight nette 1px */}
              <View style={styles.cardShine} />

              {/* Lignes texture brossee */}
              {[60, 120, 180, 240, 300, 360].map((topPos, i) => (
                <View
                  key={i}
                  style={{
                    position: 'absolute',
                    top: topPos,
                    left: 10,
                    right: 10,
                    height: 0.5,
                    backgroundColor: '#6B7B8D',
                    opacity: 0.04 + (i % 2) * 0.02,
                  }}
                />
              ))}

              {/* Titre */}
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>

              {/* ── EMAIL ── */}
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

              {/* ── MOT DE PASSE ── */}
              <Text style={styles.label}>{t.passwordLabel}</Text>
              <View style={[styles.inputWrap, { marginBottom: 24 }]}>
                <TextInput
                  placeholder={t.passwordPlaceholder}
                  placeholderTextColor={COLORS.textPlaceholder}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
              </View>

              {/* ── BOUTON SE CONNECTER — Gradient premium ── */}
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

              {/* ── SEPARATEUR OU ── */}
              <View style={styles.separator}>
                <View style={styles.sepLine} />
                <Text style={styles.sepText}>{t.separator}</Text>
                <View style={styles.sepLine} />
              </View>

              {/* ── BOUTON GOOGLE — Metal outlined ── */}
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

              {/* ── BOUTON BIOMETRIQUE — Emeraude translucide ── */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleBiometric}
                style={{ marginBottom: 20 }}
              >
                <View style={styles.btnBio}>
                  <View style={styles.btnBioShine} />
                  <Text style={{ fontSize: 18 }}>🔒</Text>
                  <Text style={styles.btnBioText}>{t.biometricButton}</Text>
                </View>
              </TouchableOpacity>

              {/* ── LIEN S'INSCRIRE ── */}
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

// === STYLES ===
const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* ── Switch Langue ── */
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

  /* ── Logo PNG ── */
  logoWrap: {
    width: 110,
    height: 110,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 16,
  },
  logoImage: {
    width: 110,
    height: 110,
    borderRadius: 24,
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

  /* ── Carte Connexion — Metal brosse ameliore ── */
  cardShadow: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
    elevation: 16,
    marginTop: 0,
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
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 24,
  },

  /* ── Inputs — Effet encastre metal ── */
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrap: {
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1.2,
    borderTopColor: '#0A0D12',
    borderLeftColor: '#0D1015',
    borderRightColor: '#2A303B',
    borderBottomColor: '#3E4855',
  },
  input: {
    color: COLORS.textPrimary,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  /* ── Bouton Se connecter — Gradient premium ── */
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
    color: COLORS.bgPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* ── Separateur OU ── */
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

  /* ── Bouton Google — Metal outlined ── */
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
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  btnGoogleText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },

  /* ── Bouton Biometrique — Emeraude translucide ── */
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
    color: COLORS.emerald,
    fontSize: 14,
    fontWeight: '600',
  },

  /* ── Lien S'inscrire ── */
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLink: {
    color: COLORS.emerald,
    fontSize: 14,
    fontWeight: '700',
  },
});
