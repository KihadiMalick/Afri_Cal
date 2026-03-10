// LIXUM - Login Page — Premium Geometric Design
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que WelcomePage-test.js et RegisterPage-test.js

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polygon, Line, Circle as SvgCircle, Path } from 'react-native-svg';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;

// ============================================================
// COULEURS
// ============================================================

var C = {
  bgDeep: '#0F1A2B',
  bgCard: 'rgba(21, 27, 35, 0.85)',
  bgInput: '#0A0E14',
  metalBorder: '#3E4855',
  emerald: '#00D984',
  emeraldDark: '#00A866',
  turquoise: '#00BFA6',
  gold: '#D4AF37',
  textPrimary: '#EAEEF3',
  textSecondary: '#8892A0',
  textMuted: '#555E6C',
  error: '#FF4D4D',
};

// ============================================================
// TRADUCTIONS
// ============================================================

var texts = {
  fr: {
    title: 'Connexion',
    subtitle: 'Acc\u00e9dez \u00e0 votre tableau de bord',
    email: 'EMAIL',
    emailPlaceholder: 'votre@email.com',
    password: 'MOT DE PASSE',
    login: 'Se connecter',
    or: 'OU',
    google: 'Continuer avec Google',
    forgot: 'Mot de passe oubli\u00e9 ?',
    back: 'Retour',
    errorTitle: 'Erreur',
    errorEmpty: 'Veuillez remplir tous les champs',
    successTitle: 'Connexion simul\u00e9e',
    successMsg: 'Bienvenue sur LIXUM !',
  },
  en: {
    title: 'Sign In',
    subtitle: 'Access your dashboard',
    email: 'EMAIL',
    emailPlaceholder: 'your@email.com',
    password: 'PASSWORD',
    login: 'Sign In',
    or: 'OR',
    google: 'Continue with Google',
    forgot: 'Forgot password?',
    back: 'Back',
    errorTitle: 'Error',
    errorEmpty: 'Please fill all fields',
    successTitle: 'Login simulated',
    successMsg: 'Welcome to LIXUM!',
  },
};

// ============================================================
// GEOMETRIC BACKGROUND — Polygones tech futuristes
// ============================================================

function GeometricBackground(props) {
  var w = props.width;
  var h = props.height;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Gradient de base */}
      <LinearGradient
        colors={['#0F1A2B', '#142236', '#0F1A2B', '#0D1520']}
        locations={[0, 0.35, 0.7, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Polygones geometriques */}
      <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
        {/* Grands triangles de fond — tres subtils */}
        <Polygon
          points={
            '0,0 ' + (w * 0.6) + ',0 ' + (w * 0.3) + ',' + (h * 0.35)
          }
          fill="rgba(0, 217, 132, 0.02)"
          stroke="rgba(0, 217, 132, 0.04)"
          strokeWidth="0.5"
        />
        <Polygon
          points={
            w + ',0 ' + w + ',' + (h * 0.4) + ' ' + (w * 0.5) + ',' + (h * 0.15)
          }
          fill="rgba(0, 191, 166, 0.02)"
          stroke="rgba(0, 191, 166, 0.03)"
          strokeWidth="0.5"
        />
        <Polygon
          points={
            '0,' + (h * 0.6) + ' ' + (w * 0.4) + ',' + (h * 0.45) + ' ' + (w * 0.2) + ',' + h
          }
          fill="rgba(0, 217, 132, 0.015)"
          stroke="rgba(0, 217, 132, 0.03)"
          strokeWidth="0.5"
        />
        <Polygon
          points={
            w + ',' + (h * 0.5) + ' ' + (w * 0.6) + ',' + h + ' ' + w + ',' + h
          }
          fill="rgba(0, 191, 166, 0.015)"
          stroke="rgba(0, 191, 166, 0.03)"
          strokeWidth="0.5"
        />

        {/* Triangles moyens — un peu plus visibles */}
        <Polygon
          points={
            (w * 0.1) + ',' + (h * 0.2) + ' ' +
            (w * 0.35) + ',' + (h * 0.1) + ' ' +
            (w * 0.25) + ',' + (h * 0.35)
          }
          fill="rgba(0, 217, 132, 0.025)"
          stroke="rgba(0, 217, 132, 0.05)"
          strokeWidth="0.8"
        />
        <Polygon
          points={
            (w * 0.65) + ',' + (h * 0.25) + ' ' +
            (w * 0.9) + ',' + (h * 0.15) + ' ' +
            (w * 0.8) + ',' + (h * 0.4)
          }
          fill="rgba(0, 191, 166, 0.02)"
          stroke="rgba(0, 191, 166, 0.04)"
          strokeWidth="0.8"
        />
        <Polygon
          points={
            (w * 0.3) + ',' + (h * 0.65) + ' ' +
            (w * 0.55) + ',' + (h * 0.55) + ' ' +
            (w * 0.45) + ',' + (h * 0.8)
          }
          fill="rgba(0, 217, 132, 0.02)"
          stroke="rgba(0, 217, 132, 0.04)"
          strokeWidth="0.8"
        />
        <Polygon
          points={
            (w * 0.7) + ',' + (h * 0.6) + ' ' +
            (w * 0.95) + ',' + (h * 0.7) + ' ' +
            (w * 0.85) + ',' + (h * 0.85)
          }
          fill="rgba(212, 175, 55, 0.012)"
          stroke="rgba(212, 175, 55, 0.025)"
          strokeWidth="0.5"
        />

        {/* Petits triangles decoratifs */}
        <Polygon
          points={
            (w * 0.5) + ',' + (h * 0.05) + ' ' +
            (w * 0.55) + ',' + (h * 0.02) + ' ' +
            (w * 0.53) + ',' + (h * 0.08)
          }
          fill="rgba(0, 217, 132, 0.04)"
        />
        <Polygon
          points={
            (w * 0.15) + ',' + (h * 0.5) + ' ' +
            (w * 0.2) + ',' + (h * 0.47) + ' ' +
            (w * 0.18) + ',' + (h * 0.53)
          }
          fill="rgba(0, 191, 166, 0.04)"
        />
        <Polygon
          points={
            (w * 0.85) + ',' + (h * 0.9) + ' ' +
            (w * 0.9) + ',' + (h * 0.87) + ' ' +
            (w * 0.88) + ',' + (h * 0.93)
          }
          fill="rgba(0, 217, 132, 0.03)"
        />

        {/* Lignes de connexion entre les polygones */}
        <Line
          x1={w * 0.3} y1={h * 0.35}
          x2={w * 0.5} y2={h * 0.15}
          stroke="rgba(0, 217, 132, 0.04)" strokeWidth="0.5"
        />
        <Line
          x1={w * 0.8} y1={h * 0.4}
          x2={w * 0.6} y2={h * 0.55}
          stroke="rgba(0, 191, 166, 0.03)" strokeWidth="0.5"
        />
        <Line
          x1={w * 0.2} y1={h * 0.7}
          x2={w * 0.45} y2={h * 0.8}
          stroke="rgba(0, 217, 132, 0.03)" strokeWidth="0.5"
        />

        {/* Petits points aux intersections */}
        <SvgCircle cx={w * 0.3} cy={h * 0.35} r="2" fill="rgba(0, 217, 132, 0.08)" />
        <SvgCircle cx={w * 0.5} cy={h * 0.15} r="2" fill="rgba(0, 217, 132, 0.08)" />
        <SvgCircle cx={w * 0.8} cy={h * 0.4} r="1.5" fill="rgba(0, 191, 166, 0.06)" />
        <SvgCircle cx={w * 0.25} cy={h * 0.35} r="1.5" fill="rgba(0, 217, 132, 0.06)" />
        <SvgCircle cx={w * 0.6} cy={h * 0.55} r="2" fill="rgba(0, 191, 166, 0.07)" />
        <SvgCircle cx={w * 0.45} cy={h * 0.8} r="1.5" fill="rgba(0, 217, 132, 0.05)" />
      </Svg>
    </View>
  );
}

// ============================================================
// GOOGLE ICON — SVG colore officiel
// ============================================================

function GoogleIcon(props) {
  var size = props.size || 18;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

// ============================================================
// LOGO — avec fallback si image absente
// ============================================================

var LogoImg = null;
try { LogoImg = require('./assets/logo-lx.png'); } catch (e) { LogoImg = null; }

// ============================================================
// APP PRINCIPALE — LOGIN PAGE
// ============================================================

export default function App() {
  var _lang = useState('fr');
  var lang = _lang[0]; var setLang = _lang[1];

  var _email = useState('');
  var email = _email[0]; var setEmail = _email[1];

  var _password = useState('');
  var password = _password[0]; var setPassword = _password[1];

  var _showPassword = useState(false);
  var showPassword = _showPassword[0]; var setShowPassword = _showPassword[1];

  var _focusedField = useState(null);
  var focusedField = _focusedField[0]; var setFocusedField = _focusedField[1];

  var _loading = useState(false);
  var loading = _loading[0]; var setLoading = _loading[1];

  var t = texts[lang];
  var canLogin = email.length > 0 && password.length >= 8;

  var handleLogin = useCallback(function () {
    if (!canLogin) return;
    setLoading(true);
    // Simule un appel reseau
    setTimeout(function () {
      setLoading(false);
      Alert.alert(t.successTitle, t.successMsg);
    }, 1200);
  }, [canLogin, t]);

  var handleGoogleLogin = useCallback(function () {
    Alert.alert(
      'Google Auth',
      lang === 'fr'
        ? 'L\'authentification Google sera connect\u00e9e \u00e0 Supabase.'
        : 'Google authentication will be connected to Supabase.'
    );
  }, [lang]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0F1A2B' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0F1A2B" />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>

          {/* BACKGROUND GEOMETRIQUE */}
          <GeometricBackground width={W} height={H} />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={{
              flex: 1, paddingHorizontal: 24,
              justifyContent: 'center',
            }}>

              {/* DRAPEAUX — haut droite */}
              <View style={{
                position: 'absolute', top: 10, right: 0,
                flexDirection: 'row', gap: 6, zIndex: 10,
              }}>
                <TouchableOpacity onPress={function () { setLang('en'); }}>
                  <View style={{
                    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5,
                    borderWidth: 1,
                    borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.4)',
                    backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'transparent',
                  }}>
                    <Text style={{ fontSize: 14 }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={function () { setLang('fr'); }}>
                  <View style={{
                    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5,
                    borderWidth: 1,
                    borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.4)',
                    backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'transparent',
                  }}>
                    <Text style={{ fontSize: 14 }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* LOGO */}
              <View style={{ alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                  width: 100, height: 100, borderRadius: 22,
                }}>
                  {LogoImg ? (
                    <Image
                      source={LogoImg}
                      style={{ width: 100, height: 100, borderRadius: 22 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={{
                      width: 100, height: 100, borderRadius: 22,
                      backgroundColor: 'rgba(0,217,132,0.08)',
                      borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.2)',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 28, fontWeight: '900', color: C.emerald, letterSpacing: 2 }}>LX</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* CARTE GLASSMORPHISM */}
              <View style={s.glassCard}>
                {/* Reflet glass haut */}
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 50,
                  zIndex: 0,
                }}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)', 'transparent']}
                    style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                  />
                </View>
                {/* Lisere lumineux */}
                <View style={{
                  position: 'absolute', top: 0, left: 12, right: 12,
                  height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
                }} />

                <View style={{ padding: 22, paddingTop: 26, zIndex: 1 }}>

                  {/* Titre */}
                  <Text style={{
                    color: C.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: 4,
                  }}>
                    {t.title}
                  </Text>
                  <Text style={{
                    color: C.textSecondary, fontSize: 13, marginBottom: 22,
                  }}>
                    {t.subtitle}
                  </Text>

                  {/* INPUT EMAIL */}
                  <Text style={s.inputLabel}>{t.email}</Text>
                  <View style={[
                    s.inputRow,
                    focusedField === 'email' && s.inputRowFocused,
                  ]}>
                    <Ionicons
                      name="mail-outline" size={16}
                      color={focusedField === 'email' ? C.emerald : C.textMuted}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      onFocus={function () { setFocusedField('email'); }}
                      onBlur={function () { setFocusedField(null); }}
                      placeholder={t.emailPlaceholder}
                      placeholderTextColor={C.metalBorder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={s.inputText}
                    />
                  </View>

                  {/* INPUT MOT DE PASSE */}
                  <Text style={s.inputLabel}>{t.password}</Text>
                  <View style={[
                    s.inputRow,
                    { marginBottom: 6 },
                    focusedField === 'pass' && s.inputRowFocused,
                  ]}>
                    <Ionicons
                      name="lock-closed-outline" size={16}
                      color={focusedField === 'pass' ? C.emerald : C.textMuted}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      onFocus={function () { setFocusedField('pass'); }}
                      onBlur={function () { setFocusedField(null); }}
                      secureTextEntry={!showPassword}
                      style={s.inputText}
                    />
                    <TouchableOpacity onPress={function () { setShowPassword(!showPassword); }}>
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={18} color={C.textMuted}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Mot de passe oublie */}
                  <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 18 }}>
                    <Text style={{ color: C.emerald, fontSize: 11, fontWeight: '600' }}>
                      {t.forgot}
                    </Text>
                  </TouchableOpacity>

                  {/* BOUTON SE CONNECTER — glass emeraude */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={!canLogin || loading}
                    activeOpacity={0.7}
                    style={{ marginBottom: 16, opacity: canLogin ? 1 : 0.4 }}
                  >
                    <View style={s.loginBtn}>
                      {/* Reflet subtil haut du bouton */}
                      <View style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                        backgroundColor: 'rgba(0,217,132,0.03)',
                        borderTopLeftRadius: 12, borderTopRightRadius: 12,
                      }} />
                      {loading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="sync-outline" size={16} color={C.emerald} />
                          <Text style={{ color: C.emerald, fontSize: 14, fontWeight: '600' }}>...</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="log-in-outline" size={18} color={C.emerald} />
                          <Text style={{ color: C.emerald, fontSize: 15, fontWeight: '700' }}>
                            {t.login}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* SEPARATEUR */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(62,72,85,0.3)' }} />
                    <Text style={{
                      color: C.textMuted, fontSize: 11,
                      marginHorizontal: 12, letterSpacing: 2,
                    }}>
                      {t.or}
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(62,72,85,0.3)' }} />
                  </View>

                  {/* BOUTON GOOGLE */}
                  <TouchableOpacity onPress={handleGoogleLogin} activeOpacity={0.7}>
                    <View style={s.googleBtn}>
                      <GoogleIcon size={18} />
                      <Text style={{ color: C.textPrimary, fontSize: 13, fontWeight: '600' }}>
                        {t.google}
                      </Text>
                    </View>
                  </TouchableOpacity>

                </View>
              </View>

              {/* BOUTON RETOUR */}
              <TouchableOpacity
                onPress={function () {
                  Alert.alert(
                    lang === 'fr' ? 'Navigation' : 'Navigation',
                    lang === 'fr' ? 'Retour vers la page d\'accueil' : 'Back to welcome page'
                  );
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'center', marginTop: 16, gap: 6,
                }}
              >
                <Ionicons name="arrow-back" size={16} color={C.textMuted} />
                <Text style={{ color: C.textMuted, fontSize: 13 }}>{t.back}</Text>
              </TouchableOpacity>

            </View>
          </KeyboardAvoidingView>

        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================

var s = StyleSheet.create({
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderTopColor: 'rgba(138,146,160,0.3)',
    borderLeftColor: 'rgba(107,123,141,0.15)',
    borderRightColor: 'rgba(42,48,59,0.3)',
    borderBottomColor: 'rgba(26,31,38,0.4)',
    backgroundColor: 'rgba(21, 27, 35, 0.85)',
  },
  inputLabel: {
    color: '#8892A0',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  inputRow: {
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: '#0A0E14',
    borderWidth: 1.2,
    borderColor: 'rgba(62,72,85,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  inputRowFocused: {
    borderColor: 'rgba(0,217,132,0.35)',
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inputText: {
    flex: 1,
    color: '#EAEEF3',
    fontSize: 14,
    paddingVertical: 13,
  },
  loginBtn: {
    borderRadius: 12,
    borderWidth: 1.3,
    borderColor: 'rgba(0,217,132,0.4)',
    backgroundColor: 'rgba(0,217,132,0.08)',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  googleBtn: {
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(62,72,85,0.3)',
    backgroundColor: 'rgba(21,27,35,0.5)',
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
});
