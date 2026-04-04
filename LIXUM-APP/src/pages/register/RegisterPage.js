import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, Image, StatusBar, Platform, Modal,
  TouchableOpacity, KeyboardAvoidingView, ActivityIndicator,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import {
  W, H, C,
  SUPABASE_URL, SUPABASE_ANON_KEY,
  texts, calculateGoals,
  ACTIVITY_LABELS_DB, generateLixTag,
  isValidFullName, isValidEmail,
} from './registerConstants';
import { TechBackground, CircularProgress, NavigationButtons } from './registerComponents';
import Phase1Identity from './phases/Phase1Identity';
import Phase2Morphology from './phases/Phase2Morphology';
import Phase3Activity from './phases/Phase3Activity';
import Phase4Diet from './phases/Phase4Diet';
import Phase5Goals from './phases/Phase5Goals';
import Phase6Characters from './phases/Phase6Characters';

export default function RegisterPage({ navigation }) {
  var _lang = useState('fr'), lang = _lang[0], setLang = _lang[1];
  var _step = useState(1), step = _step[0], setStep = _step[1];
  var totalSteps = 6;
  var t = texts[lang];

  useEffect(function() {
    AsyncStorage.getItem('lixum_lang').then(function(s) { if (s === 'en' || s === 'fr') setLang(s); }).catch(function() {});
  }, []);
  var changeLang = function(nl) { setLang(nl); AsyncStorage.setItem('lixum_lang', nl).catch(function() {}); };

  var _fd = useState({
    fullName: '', email: '', emailConfirm: '', password: '', passwordConfirm: '', emailAvailable: null,
    weight: '70', height: '175', age: '25', gender: 'male', activityLevel: 2,
    diet: 'classic', goal: 'maintain', targetKg: 5, timelineDays: 90, paceMode: 1,
  });
  var fd = _fd[0], sf = _fd[1];
  var _loading = useState(false), loading = _loading[0], setLoading = _loading[1];
  var _lixAlert = useState({ visible: false, title: '', message: '', emoji: '', buttons: [], lixTag: '' });
  var lixAlert = _lixAlert[0], setLixAlert = _lixAlert[1];
  var showAlert = function(ti, msg, btns, em, tag) { setLixAlert({ visible: true, title: ti, message: msg, emoji: em || '', buttons: btns || [], lixTag: tag || '' }); };
  var hideAlert = function() { setLixAlert(function(p) { return Object.assign({}, p, { visible: false }); }); };

  var _showTransition = useState(false), showTransition = _showTransition[0], setShowTransition = _showTransition[1];
  var _transStep = useState(0), transStep = _transStep[0], setTransStep = _transStep[1];
  var _transName = useState(''), transName = _transName[0], setTransName = _transName[1];
  var transOpacity = useRef(new RNAnimated.Value(0)).current;
  var transPulse = useRef(new RNAnimated.Value(1)).current;
  var transProgress = useRef(new RNAnimated.Value(0)).current;
  var transTextOp = useRef(new RNAnimated.Value(0)).current;

  var calc = useMemo(function() { return calculateGoals(fd); },
    [fd.weight, fd.height, fd.age, fd.gender, fd.activityLevel, fd.goal, fd.targetKg, fd.paceMode, fd.timelineDays]);

  var stepInfo = lang === 'fr'
    ? [{ title: 'Identit\u00e9', sub: 'Vos informations' }, { title: 'Corps', sub: 'Votre morphologie' }, { title: 'Activit\u00e9', sub: 'Votre rythme' }, { title: 'R\u00e9gime', sub: 'Votre alimentation' }, { title: 'Objectif', sub: 'Votre parcours' }, { title: 'Compagnons', sub: 'Gamification' }]
    : [{ title: 'Identity', sub: 'Your info' }, { title: 'Body', sub: 'Your metrics' }, { title: 'Activity', sub: 'Your rhythm' }, { title: 'Diet', sub: 'Your food' }, { title: 'Goal', sub: 'Your journey' }, { title: 'Companions', sub: 'Gamification' }];

  var startTransition = function(name) {
    setTransName(name || ''); setTransStep(0); setShowTransition(true);
    transOpacity.setValue(0); transPulse.setValue(1); transProgress.setValue(0); transTextOp.setValue(0);
    RNAnimated.timing(transOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    RNAnimated.loop(RNAnimated.sequence([
      RNAnimated.timing(transPulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
      RNAnimated.timing(transPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
    ])).start();
    RNAnimated.timing(transProgress, { toValue: 100, duration: 3200, useNativeDriver: false }).start();
    RNAnimated.timing(transTextOp, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }).start();
    setTimeout(function() { setTransStep(1); }, 1000);
    setTimeout(function() { setTransStep(2); }, 2200);
    setTimeout(function() {
      setTransStep(3); transPulse.stopAnimation();
      setTimeout(function() {
        RNAnimated.timing(transOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start(function() {
          setShowTransition(false);
          if (navigation) navigation.navigate('Accueil');
        });
      }, 800);
    }, 3200);
  };

  var handleRegister = function() {
    setLoading(true);
    var clientLixTag = generateLixTag();
    fetch(SUPABASE_URL + '/auth/v1/signup', {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fd.email.trim().toLowerCase(), password: fd.password, data: { full_name: fd.fullName.trim() } }),
    }).then(function(r) { return r.json(); }).then(function(authData) {
      if (authData.error || authData.error_code || (authData.code && authData.code >= 400)) {
        setLoading(false);
        var msg = authData.error_description || authData.msg || authData.error || 'Erreur inconnue';
        var isAlreadyRegistered = (msg + '').includes('already') || (authData.error_code || '').includes('already');
        if (isAlreadyRegistered) {
          showAlert(
            lang === 'fr' ? 'Adresse d\u00e9j\u00e0 utilis\u00e9e' : 'Email already taken',
            lang === 'fr' ? 'Un compte existe d\u00e9j\u00e0 avec ' + fd.email + '.' : 'An account already exists with ' + fd.email + '.',
            [
              { text: lang === 'fr' ? 'Se connecter' : 'Sign in', color: '#00D984', onPress: function() { if (navigation) navigation.navigate('Login'); } },
              { text: lang === 'fr' ? "Modifier l'email" : 'Change email', style: 'cancel', onPress: function() { setStep(1); } },
            ], 'error');
        } else {
          if (lang === 'fr') { if (msg.includes('valid email')) msg = 'Adresse email invalide.'; else if (msg.includes('password')) msg = 'Mot de passe trop faible.'; }
          showAlert(lang === 'fr' ? 'Erreur' : 'Error', msg, [{ text: 'OK', style: 'cancel' }], 'error');
        }
        return;
      }
      var userId = (authData.user && authData.user.id) || authData.id;
      var accessToken = authData.access_token || (authData.session && authData.session.access_token);
      if (!userId) { setLoading(false); showAlert(lang === 'fr' ? 'Erreur' : 'Error', lang === 'fr' ? 'Impossible de cr\u00e9er le compte.' : 'Unable to create account.', [{ text: 'OK', style: 'cancel' }], 'error'); return; }

      fetch(SUPABASE_URL + '/rest/v1/rpc/create_user_profile', {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (accessToken || SUPABASE_ANON_KEY) },
        body: JSON.stringify({
          p_user_id: userId, p_full_name: fd.fullName.trim(), p_lixtag: clientLixTag,
          p_age: parseInt(fd.age) || 25, p_weight: parseFloat(fd.weight) || 70, p_height: parseFloat(fd.height) || 175,
          p_gender: fd.gender, p_activity_level: ACTIVITY_LABELS_DB[fd.activityLevel] || 'moderate',
          p_dietary_regime: fd.diet, p_goal: fd.goal,
          p_target_weight_loss: fd.goal === 'maintain' ? 0 : fd.targetKg,
          p_target_months: Math.max(3, fd.goal === 'maintain' ? 3 : Math.ceil(calc.modes[['ambitious', 'reasonable', 'realistic'][fd.paceMode]].days / 30)),
          p_daily_calorie_target: calc.dailyTarget, p_bmr: calc.bmr, p_tdee: calc.tdee, p_pace_mode: fd.paceMode,
        }),
      }).then(function(r) { return r.json(); }).then(function(profileResult) {
        setLoading(false);
        var finalTag = (profileResult && profileResult.lixtag) || clientLixTag;
        if (profileResult && profileResult.success === false) { showAlert(lang === 'fr' ? 'Erreur' : 'Error', profileResult.error || 'Erreur profil', [{ text: 'OK', style: 'cancel' }], 'error'); return; }
        AsyncStorage.setItem('lixum_user_id', userId).catch(function() {});
        showAlert(
          lang === 'fr' ? 'Bienvenue sur LIXUM !' : 'Welcome to LIXUM!',
          lang === 'fr' ? 'Ton compte est cr\u00e9\u00e9 !\n\nObjectif : ' + calc.dailyTarget + ' kcal/jour\n+50 LX Gems de bienvenue' : 'Account created!\n\nGoal: ' + calc.dailyTarget + ' kcal/day\n+50 LX Gems welcome bonus',
          [{ text: lang === 'fr' ? 'Commencer' : 'Get started', color: '#00D984', onPress: function() { hideAlert(); startTransition(fd.fullName.split(' ')[0]); } }],
          'success', finalTag);
      }).catch(function() {
        setLoading(false);
        showAlert(lang === 'fr' ? 'Bienvenue sur LIXUM !' : 'Welcome to LIXUM!',
          lang === 'fr' ? 'Compte cr\u00e9\u00e9 ! Profil sera sync\u00e9 au prochain lancement.' : 'Account created! Profile will sync on next launch.',
          [{ text: lang === 'fr' ? 'Commencer' : 'Get started', color: '#00D984', onPress: function() { hideAlert(); startTransition(fd.fullName.split(' ')[0]); } }],
          'success', clientLixTag);
      });
    }).catch(function() {
      setLoading(false);
      showAlert(lang === 'fr' ? 'Erreur' : 'Error', lang === 'fr' ? 'Probl\u00e8me de connexion.' : 'Connection problem.', [{ text: 'OK', style: 'cancel' }], 'error');
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#1E2530' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1E2530" />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>
          <LinearGradient colors={['#1E2530', '#222A35', '#1A2029', '#222A35', '#1E2530']} locations={[0, 0.25, 0.5, 0.75, 1]} style={{ flex: 1 }}>
            <TechBackground />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 6, gap: 14 }}>
                <CircularProgress step={step} total={totalSteps} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.textPrimary, fontSize: 15, fontWeight: '700' }}>{stepInfo[step - 1].title}</Text>
                  <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>{stepInfo[step - 1].sub}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[{ k: 'en', f: '🇬🇧' }, { k: 'fr', f: '🇫🇷' }].map(function(l) {
                    return (
                      <TouchableOpacity key={l.k} onPress={function() { changeLang(l.k); }}>
                        <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, borderWidth: 1, borderColor: lang === l.k ? 'rgba(0,217,132,0.4)' : 'rgba(62,72,85,0.4)', backgroundColor: lang === l.k ? 'rgba(0,217,132,0.08)' : 'transparent' }}>
                          <Text style={{ fontSize: 12 }}>{l.f}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 6, marginBottom: 2 }}>
                {Array.from({ length: totalSteps }).map(function(_, i) {
                  return <View key={i} style={{ width: i + 1 === step ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i + 1 <= step ? '#00D984' : 'rgba(62,72,85,0.3)' }} />;
                })}
              </View>

              <View style={{ height: 2, backgroundColor: 'rgba(62,72,85,0.2)', marginHorizontal: 20, marginBottom: 8, marginTop: 6 }}>
                <LinearGradient colors={['#00A866', '#00D984']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: (step / totalSteps * 100) + '%', borderRadius: 1 }} />
              </View>

              <View style={{ flex: 1 }}>
                {step === 1 ? <Phase1Identity formData={fd} setFormData={sf} t={t} lang={lang} /> : null}
                {step === 2 ? <Phase2Morphology formData={fd} setFormData={sf} t={t} lang={lang} /> : null}
                {step === 3 ? <Phase3Activity formData={fd} setFormData={sf} t={t} lang={lang} /> : null}
                {step === 4 ? <Phase4Diet formData={fd} setFormData={sf} t={t} lang={lang} /> : null}
                {step === 5 ? <Phase5Goals formData={fd} setFormData={sf} calculations={calc} t={t} lang={lang} /> : null}
                {step === 6 ? <Phase6Characters lang={lang} /> : null}
              </View>

              <NavigationButtons step={step} setStep={setStep} totalSteps={totalSteps} formData={fd} onComplete={handleRegister} t={t} loading={loading} />
            </KeyboardAvoidingView>

            <Modal visible={lixAlert.visible} transparent animationType="fade" onRequestClose={hideAlert}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
                <View style={{ backgroundColor: '#151B23', borderRadius: 20, padding: 24, width: '100%', borderWidth: 1.5, borderColor: lixAlert.emoji === 'error' ? 'rgba(255,77,77,0.3)' : 'rgba(0,217,132,0.3)', alignItems: 'center' }}>
                  <Text style={{ fontSize: 36, marginBottom: 12 }}>{lixAlert.emoji === 'error' ? '⚠️' : lixAlert.emoji === 'success' ? '🎉' : '📋'}</Text>
                  <Text style={{ color: '#EAEEF3', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>{lixAlert.title}</Text>
                  <Text style={{ color: '#8892A0', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 16 }}>{lixAlert.message}</Text>
                  {lixAlert.lixTag ? (
                    <TouchableOpacity onPress={function() { Clipboard.setStringAsync(lixAlert.lixTag).catch(function() {}); }}
                      style={{ backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: '#00D984', fontSize: 16, fontWeight: '900', letterSpacing: 2 }}>{lixAlert.lixTag}</Text>
                      <Ionicons name="copy-outline" size={14} color="#00D984" />
                    </TouchableOpacity>
                  ) : null}
                  {lixAlert.buttons.map(function(btn, i) {
                    return (
                      <TouchableOpacity key={i} onPress={function() { hideAlert(); if (btn.onPress) btn.onPress(); }} activeOpacity={0.7}
                        style={{ width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 6, backgroundColor: btn.style === 'cancel' ? 'rgba(255,255,255,0.04)' : (btn.color || '#00D984') + '15', borderWidth: 1, borderColor: btn.style === 'cancel' ? 'rgba(62,72,85,0.3)' : (btn.color || '#00D984') + '40' }}>
                        <Text style={{ color: btn.style === 'cancel' ? '#8892A0' : (btn.color || '#00D984'), fontSize: 14, fontWeight: '700' }}>{btn.text}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Modal>

            {showTransition ? (
              <RNAnimated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, opacity: transOpacity }}>
                <LinearGradient colors={['#0D1117', '#141A22', '#0D1117']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <RNAnimated.View style={{ transform: [{ scale: transPulse }], marginBottom: 30 }}>
                    <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(0,217,132,0.08)', borderWidth: 2, borderColor: 'rgba(0,217,132,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 60 }}>🌿</Text>
                    </View>
                  </RNAnimated.View>
                  <RNAnimated.View style={{ opacity: transTextOp, alignItems: 'center' }}>
                    <Text style={{ color: '#EAEEF3', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>LIXUM</Text>
                    <Text style={{ color: '#8892A0', fontSize: 13, marginBottom: 20 }}>
                      {transStep === 0 ? (lang === 'fr' ? 'Synchronisation...' : 'Syncing...') :
                       transStep === 1 ? (lang === 'fr' ? 'Chargement de vos donn\u00e9es...' : 'Loading your data...') :
                       transStep === 2 ? (lang === 'fr' ? 'Pr\u00e9paration de votre tableau de bord...' : 'Preparing your dashboard...') :
                       (lang === 'fr' ? 'Bienvenue, ' + transName + ' !' : 'Welcome, ' + transName + '!')}
                    </Text>
                    <View style={{ width: W * 0.6, height: 4, borderRadius: 2, backgroundColor: 'rgba(62,72,85,0.3)', overflow: 'hidden' }}>
                      <RNAnimated.View style={{ height: '100%', borderRadius: 2, backgroundColor: '#00D984', width: transProgress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }} />
                    </View>
                  </RNAnimated.View>
                </LinearGradient>
              </RNAnimated.View>
            ) : null}

          </LinearGradient>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}
