/**
 * LIXUM - Login Page Test (Premium Metal Brushed Design)
 *
 * Usage: Copier-coller ce contenu dans App.js sur snack.expo.dev
 * Dependance Snack: ajouter "expo-linear-gradient" dans package.json du Snack
 *
 * Version: 1.0
 * Date: 2026-03-05
 * Status: TEST - A valider avant integration dans le repo final
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

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Handlers (remplacer par la vraie logique Supabase dans le repo final) ---
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Remplis tous les champs');
      return;
    }
    Alert.alert('Test Login', `Email: ${email}`);
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google', 'Google OAuth - a implementer');
  };

  const handleBiometric = () => {
    Alert.alert('Biometrique', 'Connexion biometrique - a implementer');
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
        {/* ====== LOGO LX PREMIUM — 3 couches ====== */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {/* COUCHE 1 — Cadre exterieur bisaute (bord argente) */}
          <View style={styles.logoOuter}>
            {/* COUCHE 2 — Lisere emeraude */}
            <View style={styles.logoMiddle}>
              {/* COUCHE 3 — Surface metal brosse */}
              <LinearGradient
                colors={['#2E3440', '#1E232B', '#262C36', '#1E232B', '#1A1F27']}
                locations={[0, 0.25, 0.5, 0.75, 1]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.logoInner}
              >
                {/* Reflet lumiere haut */}
                <View style={styles.logoShine} />
                {/* Highlight centre-haut */}
                <View style={styles.logoHighlight} />

                {/* Texte LX */}
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={styles.logoL}>L</Text>
                  <Text style={styles.logoX}>X</Text>
                </View>

                {/* 4 points lumineux emeraude aux coins */}
                <View style={[styles.dot, { top: 6, left: 6 }]} />
                <View style={[styles.dot, { top: 6, right: 6 }]} />
                <View style={[styles.dot, { bottom: 6, left: 6 }]} />
                <View style={[styles.dot, { bottom: 6, right: 6 }]} />
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* TAGLINE */}
        <Text style={styles.tagline}>TRACK YOUR VITALITY</Text>

        {/* ====== CARTE CONNEXION — Metal brosse ====== */}
        <View style={styles.cardShadow}>
          <View style={{ borderRadius: 16, overflow: 'hidden' }}>
            <LinearGradient
              colors={['#2E3440', '#1B1F26', '#1E232B', '#1B1F26']}
              locations={[0, 0.3, 0.6, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Reflet metallique superieur */}
              <View style={styles.cardShine} />

              {/* Titre */}
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>
                Accede a ton dashboard de vitalite
              </Text>

              {/* ── EMAIL ── */}
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  placeholder="email@example.com"
                  placeholderTextColor={COLORS.textPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>

              {/* ── MOT DE PASSE ── */}
              <Text style={styles.label}>Mot de passe</Text>
              <View style={[styles.inputWrap, { marginBottom: 24 }]}>
                <TextInput
                  placeholder="••••••••"
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
                    <Text style={styles.btnConnectText}>Se connecter</Text>
                  </LinearGradient>
                </View>
              </TouchableOpacity>

              {/* ── SEPARATEUR OU ── */}
              <View style={styles.separator}>
                <View style={styles.sepLine} />
                <Text style={styles.sepText}>OU</Text>
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
                  <Text style={styles.btnGoogleText}>
                    Continuer avec Google
                  </Text>
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
                  <Text style={styles.btnBioText}>Connexion biometrique</Text>
                </View>
              </TouchableOpacity>

              {/* ── LIEN S'INSCRIRE ── */}
              <View style={styles.registerRow}>
                <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
                  Pas de compte ?{' '}
                </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.registerLink}>S'inscrire</Text>
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

  /* ── Logo LX Premium ── */
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 22,
    borderWidth: 2,
    borderTopColor: '#6B7B8D',
    borderLeftColor: '#5A6577',
    borderRightColor: '#2A303B',
    borderBottomColor: '#1A1F26',
    backgroundColor: '#13161B',
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 16,
  },
  logoMiddle: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(0, 217, 132, 0.35)',
    overflow: 'hidden',
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoShine: {
    position: 'absolute',
    top: 0,
    left: 15,
    right: 15,
    height: 1,
    backgroundColor: '#6B7B8D',
    opacity: 0.4,
  },
  logoHighlight: {
    position: 'absolute',
    top: 8,
    left: '30%',
    right: '30%',
    height: 20,
    backgroundColor: 'rgba(107, 123, 141, 0.08)',
    borderRadius: 10,
  },
  logoL: {
    fontSize: 36,
    fontWeight: '800',
    color: '#8892A0',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  logoX: {
    fontSize: 36,
    fontWeight: '900',
    color: '#00A866',
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 217, 132, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#00D984',
    opacity: 0.5,
  },
  tagline: {
    color: '#555E6C',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 5,
    textAlign: 'center',
    marginBottom: 30,
  },

  /* ── Carte Connexion ── */
  cardShadow: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 14,
  },
  card: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    borderWidth: 1.2,
    borderColor: '#3E4855',
    borderRadius: 16,
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: '#6B7B8D',
    opacity: 0.35,
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
