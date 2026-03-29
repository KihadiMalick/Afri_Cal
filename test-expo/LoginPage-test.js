// LIXUM - Login Page — Premium Geometric Design
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que WelcomePage-test.js et RegisterPage-test.js

import React, { useState } from 'react';
// === POLISH v1 — Alert supprimé, Modal + ActivityIndicator ajoutés ===
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
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

// === POLISH v1 — Supabase config ===
var SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';

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
    errorEmpty: 'Veuillez remplir email et mot de passe (8 caract\u00e8res min)',
    successTitle: 'Connexion simul\u00e9e',
    successMsg: 'Bienvenue sur LIXUM !',
    // === POLISH v1 — Traductions ajoutées ===
    googleRedirect: 'Tu vas \u00eatre redirig\u00e9 vers Google pour te connecter.',
    loginSuccess: 'Connexion r\u00e9ussie. Redirection...',
    welcome: 'Bienvenue !',
    connectionError: 'Probl\u00e8me de connexion. V\u00e9rifie ton internet.',
    continueBtn: 'Continuer',
    googleError: 'Erreur Google',
    invalidLogin: 'Email ou mot de passe incorrect.',
    emailNotConfirmed: 'V\u00e9rifie ton email pour confirmer ton compte.',
    tooManyRequests: 'Trop de tentatives. R\u00e9essaie dans quelques minutes.',
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
    errorEmpty: 'Please fill email and password (8 chars min)',
    successTitle: 'Login simulated',
    successMsg: 'Welcome to LIXUM!',
    // === POLISH v1 — Traductions ajoutées ===
    googleRedirect: 'You will be redirected to Google to sign in.',
    loginSuccess: 'Login successful. Redirecting...',
    welcome: 'Welcome!',
    connectionError: 'Connection problem. Check your internet.',
    continueBtn: 'Continue',
    googleError: 'Google Error',
    invalidLogin: 'Invalid email or password.',
    emailNotConfirmed: 'Check your email to confirm your account.',
    tooManyRequests: 'Too many attempts. Please retry in a few minutes.',
  },
};

// ============================================================
// GEOMETRIC BACKGROUND — Polygones tech futuristes
// ============================================================

function GeometricBackground() {
  var w = W;
  var h = H;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <LinearGradient
        colors={['#0F1A2B', '#142236', '#0F1A2B', '#0D1520']}
        locations={[0, 0.35, 0.7, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
        <Polygon points={'0,0 ' + (w * 0.6) + ',0 ' + (w * 0.3) + ',' + (h * 0.35)}
          fill="rgba(0,217,132,0.02)" stroke="rgba(0,217,132,0.04)" strokeWidth="0.5" />
        <Polygon points={w + ',0 ' + w + ',' + (h * 0.4) + ' ' + (w * 0.5) + ',' + (h * 0.15)}
          fill="rgba(0,191,166,0.02)" stroke="rgba(0,191,166,0.03)" strokeWidth="0.5" />
        <Polygon points={'0,' + (h * 0.6) + ' ' + (w * 0.4) + ',' + (h * 0.45) + ' ' + (w * 0.2) + ',' + h}
          fill="rgba(0,217,132,0.015)" stroke="rgba(0,217,132,0.03)" strokeWidth="0.5" />
        <Polygon points={w + ',' + (h * 0.5) + ' ' + (w * 0.6) + ',' + h + ' ' + w + ',' + h}
          fill="rgba(0,191,166,0.015)" stroke="rgba(0,191,166,0.03)" strokeWidth="0.5" />
        <Polygon points={(w * 0.1) + ',' + (h * 0.2) + ' ' + (w * 0.35) + ',' + (h * 0.1) + ' ' + (w * 0.25) + ',' + (h * 0.35)}
          fill="rgba(0,217,132,0.025)" stroke="rgba(0,217,132,0.05)" strokeWidth="0.8" />
        <Polygon points={(w * 0.65) + ',' + (h * 0.25) + ' ' + (w * 0.9) + ',' + (h * 0.15) + ' ' + (w * 0.8) + ',' + (h * 0.4)}
          fill="rgba(0,191,166,0.02)" stroke="rgba(0,191,166,0.04)" strokeWidth="0.8" />
        <Polygon points={(w * 0.3) + ',' + (h * 0.65) + ' ' + (w * 0.55) + ',' + (h * 0.55) + ' ' + (w * 0.45) + ',' + (h * 0.8)}
          fill="rgba(0,217,132,0.02)" stroke="rgba(0,217,132,0.04)" strokeWidth="0.8" />
        <Polygon points={(w * 0.7) + ',' + (h * 0.6) + ' ' + (w * 0.95) + ',' + (h * 0.7) + ' ' + (w * 0.85) + ',' + (h * 0.85)}
          fill="rgba(212,175,55,0.012)" stroke="rgba(212,175,55,0.025)" strokeWidth="0.5" />
        <Polygon points={(w * 0.5) + ',' + (h * 0.05) + ' ' + (w * 0.55) + ',' + (h * 0.02) + ' ' + (w * 0.53) + ',' + (h * 0.08)}
          fill="rgba(0,217,132,0.04)" />
        <Polygon points={(w * 0.15) + ',' + (h * 0.5) + ' ' + (w * 0.2) + ',' + (h * 0.47) + ' ' + (w * 0.18) + ',' + (h * 0.53)}
          fill="rgba(0,191,166,0.04)" />
        <Polygon points={(w * 0.85) + ',' + (h * 0.9) + ' ' + (w * 0.9) + ',' + (h * 0.87) + ' ' + (w * 0.88) + ',' + (h * 0.93)}
          fill="rgba(0,217,132,0.03)" />
        <Line x1={w * 0.3} y1={h * 0.35} x2={w * 0.5} y2={h * 0.15} stroke="rgba(0,217,132,0.04)" strokeWidth="0.5" />
        <Line x1={w * 0.8} y1={h * 0.4} x2={w * 0.6} y2={h * 0.55} stroke="rgba(0,191,166,0.03)" strokeWidth="0.5" />
        <Line x1={w * 0.2} y1={h * 0.7} x2={w * 0.45} y2={h * 0.8} stroke="rgba(0,217,132,0.03)" strokeWidth="0.5" />
        <SvgCircle cx={w * 0.3} cy={h * 0.35} r="2" fill="rgba(0,217,132,0.08)" />
        <SvgCircle cx={w * 0.5} cy={h * 0.15} r="2" fill="rgba(0,217,132,0.08)" />
        <SvgCircle cx={w * 0.8} cy={h * 0.4} r="1.5" fill="rgba(0,191,166,0.06)" />
        <SvgCircle cx={w * 0.25} cy={h * 0.35} r="1.5" fill="rgba(0,217,132,0.06)" />
        <SvgCircle cx={w * 0.6} cy={h * 0.55} r="2" fill="rgba(0,191,166,0.07)" />
        <SvgCircle cx={w * 0.45} cy={h * 0.8} r="1.5" fill="rgba(0,217,132,0.05)" />
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
// LOGO
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

  var _loading = useState(false);
  var loading = _loading[0]; var setLoading = _loading[1];

  // === POLISH v1 — Custom modal replaces Alert.alert ===
  var _lixAlert = useState({ visible: false, title: '', message: '', emoji: '', buttons: [] });
  var lixAlert = _lixAlert[0]; var setLixAlert = _lixAlert[1];

  var showLixAlert = function(title, message, buttons, emoji) {
    setLixAlert({ visible: true, title: title, message: message, emoji: emoji || '', buttons: buttons || [] });
  };
  var hideLixAlert = function() {
    setLixAlert(function(prev) { return Object.assign({}, prev, { visible: false }); });
  };

  var t = texts[lang];

  // === POLISH v1 — Login email LIVE via Supabase ===
  var handleLogin = function() {
    if (!email || password.length < 8) {
      showLixAlert(t.errorTitle, t.errorEmpty, [{ text: 'OK', style: 'cancel' }], '\u26a0\ufe0f');
      return;
    }
    setLoading(true);

    fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password: password,
      }),
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      setLoading(false);
      if (data.error) {
        var errorMsg = data.error_description || data.msg || data.error;
        // Traduire les erreurs courantes
        if (lang === 'fr') {
          if (errorMsg.includes('Invalid login')) errorMsg = t.invalidLogin;
          else if (errorMsg.includes('Email not confirmed')) errorMsg = t.emailNotConfirmed;
          else if (errorMsg.includes('too many requests')) errorMsg = t.tooManyRequests;
        }
        showLixAlert(
          t.errorTitle,
          errorMsg,
          [{ text: 'OK', style: 'cancel' }],
          '\u274c'
        );
      } else if (data.access_token) {
        // Succès — stocker le token et naviguer
        showLixAlert(
          t.welcome,
          t.loginSuccess,
          [{
            text: t.continueBtn,
            color: '#00D984',
            onPress: function() {
              // TODO: Sauvegarder data.access_token + data.refresh_token
              // TODO: Naviguer vers Dashboard
              // AsyncStorage.setItem('supabase_token', data.access_token);
              console.log('Login success, user:', data.user?.id);
            }
          }],
          '\u2705'
        );
      }
    })
    .catch(function(err) {
      setLoading(false);
      showLixAlert(
        t.errorTitle,
        t.connectionError,
        [{ text: 'OK', style: 'cancel' }],
        '\ud83d\udce1'
      );
    });
  };

  // === POLISH v1 — Google Auth avec fallback Snack ===
  var handleGoogleLogin = function() {
    setLoading(true);

    try {
      // Tenter le flow OAuth complet
      var WebBrowser = require('expo-web-browser');
      var AuthSession = require('expo-auth-session');

      var redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'lixum',
        path: 'auth/callback',
      });

      var authUrl = SUPABASE_URL + '/auth/v1/authorize?' +
        'provider=google' +
        '&redirect_to=' + encodeURIComponent(redirectUrl);

      WebBrowser.openAuthSessionAsync(authUrl, redirectUrl)
        .then(function(result) {
          setLoading(false);

          if (result.type === 'success' && result.url) {
            // Extraire les tokens de l'URL de retour
            var url = result.url;
            var hashPart = url.split('#')[1] || '';
            var params = {};
            hashPart.split('&').forEach(function(pair) {
              var parts = pair.split('=');
              if (parts[0] && parts[1]) params[parts[0]] = decodeURIComponent(parts[1]);
            });

            if (params.access_token) {
              showLixAlert(
                t.welcome,
                lang === 'fr' ? 'Connexion Google r\u00e9ussie !' : 'Google login successful!',
                [{
                  text: t.continueBtn,
                  color: '#00D984',
                  onPress: function() {
                    // TODO: Sauvegarder params.access_token + params.refresh_token
                    // TODO: Naviguer vers Dashboard
                    console.log('Google login success, token:', params.access_token?.slice(0, 20) + '...');
                  }
                }],
                '\u2705'
              );
            } else if (params.error_description) {
              showLixAlert(
                t.googleError,
                decodeURIComponent(params.error_description),
                [{ text: 'OK', style: 'cancel' }],
                '\u274c'
              );
            }
          } else if (result.type === 'cancel' || result.type === 'dismiss') {
            // L'utilisateur a fermé le navigateur — pas d'erreur à afficher
          }
        })
        .catch(function(err) {
          setLoading(false);
          showLixAlert(
            t.errorTitle,
            lang === 'fr'
              ? 'Impossible d\'ouvrir l\'authentification Google. V\u00e9rifie ta connexion.'
              : 'Unable to open Google authentication. Check your connection.',
            [{ text: 'OK', style: 'cancel' }],
            '\ud83d\udce1'
          );
        });
    } catch (e) {
      setLoading(false);
      // Fallback Snack Expo : ouvrir le lien dans le navigateur via Linking
      var Linking = require('react-native').Linking;
      var authUrl = SUPABASE_URL + '/auth/v1/authorize?provider=google&redirect_to=' +
        encodeURIComponent('https://yuhordnzfpcswztujovi.supabase.co');

      showLixAlert(
        'Google Auth',
        t.googleRedirect,
        [
          {
            text: lang === 'fr' ? 'Ouvrir Google' : 'Open Google',
            color: '#4285F4',
            onPress: function() { Linking.openURL(authUrl); }
          },
          { text: lang === 'fr' ? 'Annuler' : 'Cancel', style: 'cancel' }
        ],
        '\ud83d\udd10'
      );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0F1A2B' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0F1A2B" />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>

          <GeometricBackground />

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1, paddingHorizontal: 24,
                justifyContent: 'center',
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >

              {/* DRAPEAUX */}
              <View style={{
                flexDirection: 'row', gap: 6, justifyContent: 'flex-end',
                marginBottom: 10, marginTop: 10,
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

              {/* CARTE GLASSMORPHISM */}
              <View style={styles.glassCard}>
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 50,
                }}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)', 'transparent']}
                    style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
                  />
                </View>
                <View style={{
                  position: 'absolute', top: 0, left: 12, right: 12,
                  height: 1, backgroundColor: 'rgba(255,255,255,0.08)',
                }} />

                <View style={{ padding: 22, paddingTop: 26 }}>

                  <Text style={{ color: C.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: 4 }}>
                    {t.title}
                  </Text>
                  <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 22 }}>
                    {t.subtitle}
                  </Text>

                  {/* ===== EMAIL ===== */}
                  <Text style={styles.label}>{t.email}</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={16} color={C.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                      value={email}
                      onChangeText={function (v) { setEmail(v); }}
                      placeholder={t.emailPlaceholder}
                      placeholderTextColor={C.metalBorder}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>

                  {/* ===== MOT DE PASSE ===== */}
                  <Text style={styles.label}>{t.password}</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={16} color={C.textMuted} style={{ marginRight: 10 }} />
                    <TextInput
                      value={password}
                      onChangeText={function (v) { setPassword(v); }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={function () { setShowPassword(!showPassword); }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                        size={18} color={C.textMuted}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Mot de passe oublie */}
                  <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 18, marginTop: -4 }}>
                    <Text style={{ color: C.emerald, fontSize: 11, fontWeight: '600' }}>
                      {t.forgot}
                    </Text>
                  </TouchableOpacity>

                  {/* ===== BOUTON SE CONNECTER ===== */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.7}
                    style={{ marginBottom: 16 }}
                  >
                    <View style={[
                      styles.loginBtn,
                      (!email || password.length < 8) && { opacity: 0.4 },
                    ]}>
                      <View style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                        backgroundColor: 'rgba(0,217,132,0.03)',
                        borderTopLeftRadius: 12, borderTopRightRadius: 12,
                      }} />
                      {/* === POLISH v1 — ActivityIndicator remplace "..." === */}
                      {loading ? (
                        <ActivityIndicator size="small" color={C.emerald} />
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
                    <Text style={{ color: C.textMuted, fontSize: 11, marginHorizontal: 12, letterSpacing: 2 }}>
                      {t.or}
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(62,72,85,0.3)' }} />
                  </View>

                  {/* BOUTON GOOGLE */}
                  <TouchableOpacity onPress={handleGoogleLogin} activeOpacity={0.7}>
                    <View style={styles.googleBtn}>
                      <GoogleIcon size={18} />
                      <Text style={{ color: C.textPrimary, fontSize: 13, fontWeight: '600' }}>
                        {t.google}
                      </Text>
                    </View>
                  </TouchableOpacity>

                </View>
              </View>

              {/* BOUTON RETOUR */}
              {/* === POLISH v1 — Bouton Retour showLixAlert === */}
              <TouchableOpacity
                onPress={function () {
                  showLixAlert(
                    lang === 'fr' ? 'Navigation' : 'Navigation',
                    lang === 'fr' ? 'Retour vers la page d\'accueil' : 'Back to welcome page',
                    [{ text: 'OK', style: 'cancel' }],
                    '\u21a9\ufe0f'
                  );
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  justifyContent: 'center', marginTop: 16, marginBottom: 20, gap: 6,
                }}
              >
                <Ionicons name="arrow-back" size={16} color={C.textMuted} />
                <Text style={{ color: C.textMuted, fontSize: 13 }}>{t.back}</Text>
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>

          {/* === POLISH v1 — Modal LIXUM Custom (remplace Alert.alert Android) === */}
          <Modal visible={lixAlert.visible} transparent animationType="fade" onRequestClose={hideLixAlert}>
            <View style={{
              flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
              justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24,
            }}>
              <LinearGradient colors={['#1E2530', '#161C26', '#121820']}
                style={{ borderRadius: 20, paddingHorizontal: 24, paddingVertical: 28, width: '100%', alignItems: 'center' }}>

                {lixAlert.emoji ? (
                  <Text style={{ fontSize: 36, marginBottom: 12 }}>{lixAlert.emoji}</Text>
                ) : null}

                <Text style={{
                  fontSize: 18, fontWeight: '700', color: '#EAEEF3',
                  textAlign: 'center', marginBottom: 8,
                }}>{lixAlert.title}</Text>

                <Text style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.5)',
                  textAlign: 'center', lineHeight: 19, marginBottom: 20,
                }}>{lixAlert.message}</Text>

                {lixAlert.buttons.map(function(btn, i) {
                  var isCancel = btn.style === 'cancel';
                  var btnColor = btn.color || (isCancel ? 'rgba(255,255,255,0.4)' : '#00D984');
                  return (
                    <TouchableOpacity key={i}
                      onPress={function() { hideLixAlert(); if (btn.onPress) btn.onPress(); }}
                      activeOpacity={0.7}
                      style={{
                        width: '100%', paddingVertical: 14, borderRadius: 14,
                        alignItems: 'center', marginBottom: 6,
                        backgroundColor: isCancel ? 'transparent' : btnColor + '20',
                        borderWidth: isCancel ? 1 : 0,
                        borderColor: isCancel ? 'rgba(255,255,255,0.1)' : 'transparent',
                      }}>
                      <Text style={{
                        fontSize: 15,
                        fontWeight: isCancel ? '500' : '700',
                        color: btnColor,
                      }}>{btn.text}</Text>
                    </TouchableOpacity>
                  );
                })}

                {lixAlert.buttons.length === 0 ? (
                  <TouchableOpacity onPress={hideLixAlert}
                    style={{
                      paddingVertical: 14, width: '100%', alignItems: 'center',
                      borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                    }}>
                    <Text style={{ fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.4)' }}>OK</Text>
                  </TouchableOpacity>
                ) : null}
              </LinearGradient>
            </View>
          </Modal>

        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================

var styles = StyleSheet.create({
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
  label: {
    color: '#8892A0',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0E14',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(62,72,85,0.3)',
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: '#EAEEF3',
    fontSize: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
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
