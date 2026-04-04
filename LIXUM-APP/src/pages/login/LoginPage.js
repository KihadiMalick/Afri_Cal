import React, { useState } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity,
  Platform, StatusBar, KeyboardAvoidingView, ScrollView,
  StyleSheet, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polygon, Line, Circle as SvgCircle, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { W, H, C, SUPABASE_URL, SUPABASE_ANON_KEY, texts } from './loginConstants';

function GeometricBackground() {
  var w = W; var h = H;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <LinearGradient colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
        <Polygon points={'0,0 ' + (w * 0.6) + ',0 ' + (w * 0.3) + ',' + (h * 0.35)} fill="rgba(0,217,132,0.02)" stroke="rgba(0,217,132,0.04)" strokeWidth="0.5" />
        <Polygon points={w + ',0 ' + w + ',' + (h * 0.4) + ' ' + (w * 0.5) + ',' + (h * 0.15)} fill="rgba(0,191,166,0.02)" stroke="rgba(0,191,166,0.03)" strokeWidth="0.5" />
        <Polygon points={'0,' + (h * 0.6) + ' ' + (w * 0.4) + ',' + (h * 0.45) + ' ' + (w * 0.2) + ',' + h} fill="rgba(0,217,132,0.015)" stroke="rgba(0,217,132,0.03)" strokeWidth="0.5" />
        <Polygon points={w + ',' + (h * 0.5) + ' ' + (w * 0.6) + ',' + h + ' ' + w + ',' + h} fill="rgba(0,191,166,0.015)" stroke="rgba(0,191,166,0.03)" strokeWidth="0.5" />
        <Polygon points={(w * 0.1) + ',' + (h * 0.2) + ' ' + (w * 0.35) + ',' + (h * 0.1) + ' ' + (w * 0.25) + ',' + (h * 0.35)} fill="rgba(0,217,132,0.025)" stroke="rgba(0,217,132,0.05)" strokeWidth="0.8" />
        <Polygon points={(w * 0.65) + ',' + (h * 0.25) + ' ' + (w * 0.9) + ',' + (h * 0.15) + ' ' + (w * 0.8) + ',' + (h * 0.4)} fill="rgba(0,191,166,0.02)" stroke="rgba(0,191,166,0.04)" strokeWidth="0.8" />
        <Polygon points={(w * 0.3) + ',' + (h * 0.65) + ' ' + (w * 0.55) + ',' + (h * 0.55) + ' ' + (w * 0.45) + ',' + (h * 0.8)} fill="rgba(0,217,132,0.02)" stroke="rgba(0,217,132,0.04)" strokeWidth="0.8" />
        <Polygon points={(w * 0.7) + ',' + (h * 0.6) + ' ' + (w * 0.95) + ',' + (h * 0.7) + ' ' + (w * 0.85) + ',' + (h * 0.85)} fill="rgba(212,175,55,0.012)" stroke="rgba(212,175,55,0.025)" strokeWidth="0.5" />
        <Polygon points={(w * 0.5) + ',' + (h * 0.05) + ' ' + (w * 0.55) + ',' + (h * 0.02) + ' ' + (w * 0.53) + ',' + (h * 0.08)} fill="rgba(0,217,132,0.04)" />
        <Polygon points={(w * 0.15) + ',' + (h * 0.5) + ' ' + (w * 0.2) + ',' + (h * 0.47) + ' ' + (w * 0.18) + ',' + (h * 0.53)} fill="rgba(0,191,166,0.04)" />
        <Polygon points={(w * 0.85) + ',' + (h * 0.9) + ' ' + (w * 0.9) + ',' + (h * 0.87) + ' ' + (w * 0.88) + ',' + (h * 0.93)} fill="rgba(0,217,132,0.03)" />
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

var LogoImg = null;
try { LogoImg = require('../../../assets/logo-lx.png'); } catch (e) { LogoImg = null; }

export default function LoginPage({ navigation }) {
  var _lang = useState('fr'), lang = _lang[0], setLang = _lang[1];
  var _email = useState(''), email = _email[0], setEmail = _email[1];
  var _password = useState(''), password = _password[0], setPassword = _password[1];
  var _showPassword = useState(false), showPassword = _showPassword[0], setShowPassword = _showPassword[1];
  var _loading = useState(false), loading = _loading[0], setLoading = _loading[1];
  var _lixAlert = useState({ visible: false, title: '', message: '', emoji: '', buttons: [] });
  var lixAlert = _lixAlert[0], setLixAlert = _lixAlert[1];

  var showLixAlert = function(title, message, buttons, emoji) {
    setLixAlert({ visible: true, title: title, message: message, emoji: emoji || '', buttons: buttons || [] });
  };
  var hideLixAlert = function() {
    setLixAlert(function(prev) { return Object.assign({}, prev, { visible: false }); });
  };
  var t = texts[lang];

  var handleLogin = function() {
    if (!email || password.length < 8) { showLixAlert(t.errorTitle, t.errorEmpty, [{ text: 'OK', style: 'cancel' }], '\u26a0\ufe0f'); return; }
    setLoading(true);
    fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password: password }),
    }).then(function(res) { return res.json(); }).then(function(data) {
      setLoading(false);
      if (data.error) {
        var errorMsg = data.error_description || data.msg || data.error;
        if (lang === 'fr') {
          if (errorMsg.includes('Invalid login')) errorMsg = t.invalidLogin;
          else if (errorMsg.includes('Email not confirmed')) errorMsg = t.emailNotConfirmed;
          else if (errorMsg.includes('too many requests')) errorMsg = t.tooManyRequests;
        }
        showLixAlert(t.errorTitle, errorMsg, [{ text: 'OK', style: 'cancel' }], '\u274c');
      } else if (data.access_token) {
        showLixAlert(t.welcome, t.loginSuccess, [{
          text: t.continueBtn, color: '#00D984',
          onPress: function() {
            AsyncStorage.setItem('lixum_access_token', data.access_token).catch(function() {});
            AsyncStorage.setItem('lixum_user_id', data.user && data.user.id ? data.user.id : '').catch(function() {});
            navigation.navigate('MainTabs');
          },
        }], '\u2705');
      }
    }).catch(function() {
      setLoading(false);
      showLixAlert(t.errorTitle, t.connectionError, [{ text: 'OK', style: 'cancel' }], '\ud83d\udce1');
    });
  };

  var handleGoogleLogin = function() {
    setLoading(true);
    try {
      var WebBrowser = require('expo-web-browser');
      var AuthSession = require('expo-auth-session');
      var redirectUrl = AuthSession.makeRedirectUri({ scheme: 'lixum', path: 'auth/callback' });
      var authUrl = SUPABASE_URL + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(redirectUrl);
      WebBrowser.openAuthSessionAsync(authUrl, redirectUrl).then(function(result) {
        setLoading(false);
        if (result.type === 'success' && result.url) {
          var url = result.url;
          var hashPart = url.split('#')[1] || '';
          var params = {};
          hashPart.split('&').forEach(function(pair) { var parts = pair.split('='); if (parts[0] && parts[1]) params[parts[0]] = decodeURIComponent(parts[1]); });
          if (params.access_token) {
            showLixAlert(t.welcome, lang === 'fr' ? 'Connexion Google r\u00e9ussie !' : 'Google login successful!', [{
              text: t.continueBtn, color: '#00D984',
              onPress: function() {
                AsyncStorage.setItem('lixum_access_token', params.access_token).catch(function() {});
                navigation.navigate('MainTabs');
              },
            }], '\u2705');
          } else if (params.error_description) {
            showLixAlert(t.googleError, decodeURIComponent(params.error_description), [{ text: 'OK', style: 'cancel' }], '\u274c');
          }
        }
      }).catch(function() {
        setLoading(false);
        showLixAlert(t.errorTitle, lang === 'fr' ? 'Impossible d\'ouvrir l\'authentification Google.' : 'Unable to open Google authentication.', [{ text: 'OK', style: 'cancel' }], '\ud83d\udce1');
      });
    } catch (e) {
      setLoading(false);
      var Linking = require('react-native').Linking;
      var authUrl2 = SUPABASE_URL + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent('https://yuhordnzfpcswztujovi.supabase.co');
      showLixAlert('Google Auth', t.googleRedirect, [
        { text: lang === 'fr' ? 'Ouvrir Google' : 'Open Google', color: '#4285F4', onPress: function() { Linking.openURL(authUrl2); } },
        { text: lang === 'fr' ? 'Annuler' : 'Cancel', style: 'cancel' },
      ], '\ud83d\udd10');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1E2530' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E2530" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
        <GeometricBackground />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'flex-end', marginBottom: 10, marginTop: 10 }}>
              <TouchableOpacity onPress={function() { setLang('en'); }}>
                <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, borderWidth: 1, borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.4)', backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'transparent' }}>
                  <Text style={{ fontSize: 14 }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={function() { setLang('fr'); }}>
                <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, borderWidth: 1, borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.4)', backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'transparent' }}>
                  <Text style={{ fontSize: 14 }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginBottom: 6 }}>
              {LogoImg ? (
                <Image source={LogoImg} style={{ width: 100, height: 100, borderRadius: 22 }} resizeMode="cover" />
              ) : (
                <View style={{ width: 100, height: 100, borderRadius: 22, backgroundColor: 'rgba(0,217,132,0.08)', borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '900', color: C.emerald, letterSpacing: 2 }}>LX</Text>
                </View>
              )}
            </View>

            <View style={styles.glassCard}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50 }}>
                <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)', 'transparent']} style={{ flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
              </View>
              <View style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <View style={{ padding: 22, paddingTop: 26 }}>
                <Text style={{ color: C.textPrimary, fontSize: 24, fontWeight: '700', marginBottom: 4 }}>{t.title}</Text>
                <Text style={{ color: C.textSecondary, fontSize: 13, marginBottom: 22 }}>{t.subtitle}</Text>

                <Text style={styles.label}>{t.email}</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="mail-outline" size={16} color={C.textMuted} style={{ marginRight: 10 }} />
                  <TextInput value={email} onChangeText={function(v) { setEmail(v); }} placeholder={t.emailPlaceholder} placeholderTextColor={C.metalBorder} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={styles.input} />
                </View>

                <Text style={styles.label}>{t.password}</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed-outline" size={16} color={C.textMuted} style={{ marginRight: 10 }} />
                  <TextInput value={password} onChangeText={function(v) { setPassword(v); }} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} style={styles.input} />
                  <TouchableOpacity onPress={function() { setShowPassword(!showPassword); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={C.textMuted} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 18, marginTop: -4 }}
                  onPress={function() { showLixAlert(lang === 'fr' ? 'R\u00e9initialisation' : 'Reset Password', lang === 'fr' ? 'Fonctionnalit\u00e9 de r\u00e9cup\u00e9ration bient\u00f4t disponible.' : 'Password recovery coming soon.', [{ text: 'OK', style: 'cancel' }], '\uD83D\uDD11'); }}>
                  <Text style={{ color: C.emerald, fontSize: 11, fontWeight: '600' }}>{t.forgot}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.7} style={{ marginBottom: 16 }}>
                  <View style={[styles.loginBtn, (!email || password.length < 8) && { opacity: 0.4 }]}>
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(0,217,132,0.03)', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
                    {loading ? (
                      <ActivityIndicator size="small" color={C.emerald} />
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="log-in-outline" size={18} color={C.emerald} />
                        <Text style={{ color: C.emerald, fontSize: 15, fontWeight: '700' }}>{t.login}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(62,72,85,0.3)' }} />
                  <Text style={{ color: C.textMuted, fontSize: 11, marginHorizontal: 12, letterSpacing: 2 }}>{t.or}</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(62,72,85,0.3)' }} />
                </View>

                <TouchableOpacity onPress={handleGoogleLogin} activeOpacity={0.7}>
                  <View style={styles.googleBtn}>
                    <GoogleIcon size={18} />
                    <Text style={{ color: C.textPrimary, fontSize: 13, fontWeight: '600' }}>{t.google}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={function() { navigation.navigate('Register'); }}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, marginBottom: 10, gap: 6 }}>
              <Ionicons name="arrow-back" size={16} color={C.textMuted} />
              <Text style={{ color: C.textMuted, fontSize: 13 }}>{t.back}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={function() { navigation.navigate('Register'); }} style={{ alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: C.textSecondary, fontSize: 12 }}>
                {lang === 'fr' ? 'Pas encore de compte ? ' : "Don't have an account? "}
                <Text style={{ color: C.emerald, fontWeight: '700' }}>{lang === 'fr' ? 'S\'inscrire \u2192' : 'Sign up \u2192'}</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={lixAlert.visible} transparent animationType="fade" onRequestClose={hideLixAlert}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
            <LinearGradient colors={['#1E2530', '#161C26', '#121820']} style={{ borderRadius: 20, paddingHorizontal: 24, paddingVertical: 28, width: '100%', alignItems: 'center' }}>
              {lixAlert.emoji ? <Text style={{ fontSize: 36, marginBottom: 12 }}>{lixAlert.emoji}</Text> : null}
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#EAEEF3', textAlign: 'center', marginBottom: 8 }}>{lixAlert.title}</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 19, marginBottom: 20 }}>{lixAlert.message}</Text>
              {lixAlert.buttons.map(function(btn, i) {
                var isCancel = btn.style === 'cancel';
                var btnColor = btn.color || (isCancel ? 'rgba(255,255,255,0.4)' : '#00D984');
                return (
                  <TouchableOpacity key={i} onPress={function() { hideLixAlert(); if (btn.onPress) btn.onPress(); }} activeOpacity={0.7}
                    style={{ width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 6, backgroundColor: isCancel ? 'transparent' : btnColor + '20', borderWidth: isCancel ? 1 : 0, borderColor: isCancel ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                    <Text style={{ fontSize: 15, fontWeight: isCancel ? '500' : '700', color: btnColor }}>{btn.text}</Text>
                  </TouchableOpacity>
                );
              })}
              {lixAlert.buttons.length === 0 ? (
                <TouchableOpacity onPress={hideLixAlert} style={{ paddingVertical: 14, width: '100%', alignItems: 'center', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.4)' }}>OK</Text>
                </TouchableOpacity>
              ) : null}
            </LinearGradient>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

var styles = StyleSheet.create({
  glassCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1.2, borderTopColor: 'rgba(138,146,160,0.3)', borderLeftColor: 'rgba(107,123,141,0.15)', borderRightColor: 'rgba(42,48,59,0.3)', borderBottomColor: 'rgba(26,31,38,0.4)', backgroundColor: 'rgba(21, 27, 35, 0.85)' },
  label: { color: '#8892A0', fontSize: 11, fontWeight: '600', marginBottom: 6, letterSpacing: 1.2 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A0E14', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(62,72,85,0.3)', paddingHorizontal: 12, marginBottom: 14 },
  input: { flex: 1, color: '#EAEEF3', fontSize: 14, paddingVertical: Platform.OS === 'ios' ? 14 : 12 },
  loginBtn: { borderRadius: 12, borderWidth: 1.3, borderColor: 'rgba(0,217,132,0.4)', backgroundColor: 'rgba(0,217,132,0.08)', paddingVertical: 15, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  googleBtn: { borderRadius: 12, borderWidth: 1.2, borderColor: 'rgba(62,72,85,0.3)', backgroundColor: 'rgba(21,27,35,0.5)', paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
});
