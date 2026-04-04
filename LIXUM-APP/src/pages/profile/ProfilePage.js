import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StatusBar, Modal, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  W, wp, fp,
  SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER_ID,
  CONNECTORS,
  activityLevelToIndex, activityIndexToKey,
  calculateBMR, calculateTDEE, calculateDailyTarget,
  XP_MILESTONES, getNextMilestone, getXPForLevel,
  ACTIVITY_LEVELS, DIETS, GOALS,
  T,
  getCharEmoji,
} from './profileConstants';

var ProfileScrollPicker = function(pickerProps) {
  var values = pickerProps.values, selectedValue = pickerProps.selectedValue, onSelect = pickerProps.onSelect, unit = pickerProps.unit;
  var color = pickerProps.color || '#00D984', pickerHeight = pickerProps.height || 160, ITEM_H = 40;
  var scrollRef = useRef(null);
  var initialIdx = Math.max(0, values.indexOf(selectedValue));
  useEffect(function() { var timer = setTimeout(function() { if (scrollRef.current) scrollRef.current.scrollTo({ y: initialIdx * ITEM_H, animated: false }); }, 150); return function() { clearTimeout(timer); }; }, []);
  var snapToNearest = useCallback(function(event) { var y = event.nativeEvent.contentOffset.y; var idx = Math.round(y / ITEM_H); var clamped = Math.max(0, Math.min(idx, values.length - 1)); if (values[clamped] !== selectedValue) onSelect(values[clamped]); }, [values, selectedValue, onSelect]);
  return (
    <View style={{ height: pickerHeight, borderRadius: wp(12), overflow: 'hidden', borderWidth: 1, borderColor: color + '18', backgroundColor: '#0A0E14' }}>
      <View style={{ position: 'absolute', top: pickerHeight / 2 - ITEM_H / 2, left: wp(4), right: wp(4), height: ITEM_H, borderRadius: wp(8), backgroundColor: color + '0D', zIndex: 0 }}>
        <View style={{ position: 'absolute', left: 0, top: wp(4), bottom: wp(4), width: wp(3), borderRadius: wp(2), backgroundColor: color }} />
      </View>
      <LinearGradient colors={['#0A0E14', 'rgba(10,14,20,0.5)', 'rgba(10,14,20,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: pickerHeight * 0.35, zIndex: 3 }} pointerEvents="none" />
      <LinearGradient colors={['rgba(10,14,20,0)', 'rgba(10,14,20,0.5)', '#0A0E14']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: pickerHeight * 0.35, zIndex: 3 }} pointerEvents="none" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} snapToInterval={ITEM_H} decelerationRate={0.92} bounces={false} overScrollMode="never" nestedScrollEnabled={true} onMomentumScrollEnd={snapToNearest}
        onScrollEndDrag={function(e) { var v = e.nativeEvent.velocity; if (!v || Math.abs(v.y) < 0.1) snapToNearest(e); }}
        contentContainerStyle={{ paddingTop: pickerHeight / 2 - ITEM_H / 2, paddingBottom: pickerHeight / 2 - ITEM_H / 2 }}>
        {values.map(function(val, i) { var isSel = val === selectedValue; return (
          <View key={val + '-' + i} style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: isSel ? color : 'rgba(255,255,255,0.15)', fontSize: isSel ? fp(18) : fp(12), fontWeight: isSel ? '800' : '400' }}>{isSel ? val + ' ' + unit : String(val)}</Text>
          </View>
        ); })}
      </ScrollView>
    </View>
  );
};

export default function ProfilePage({ navigation }) {
  var _profile = useState(null), profile = _profile[0], setProfile = _profile[1];
  var _lixBalance = useState(0), lixBalance = _lixBalance[0], setLixBalance = _lixBalance[1];
  var _ownedCharacters = useState(0), ownedCharacters = _ownedCharacters[0], setOwnedCharacters = _ownedCharacters[1];
  var _userXP = useState({ user_xp: 0, user_level: 1, xp_progress: 0, xp_needed: 80, xp_percent: 0 }), userXP = _userXP[0], setUserXP = _userXP[1];
  var _activeCharSlug = useState(null), activeCharSlug = _activeCharSlug[0], setActiveCharSlug = _activeCharSlug[1];
  var _userEnergy = useState(20), userEnergy = _userEnergy[0], setUserEnergy = _userEnergy[1];
  var _showEditProfile = useState(false), showEditProfile = _showEditProfile[0], setShowEditProfile = _showEditProfile[1];
  var _showLocationPicker = useState(false), showLocationPicker = _showLocationPicker[0], setShowLocationPicker = _showLocationPicker[1];
  var _showGlossary = useState(false), showGlossary = _showGlossary[0], setShowGlossary = _showGlossary[1];
  var _showFeatures = useState(false), showFeatures = _showFeatures[0], setShowFeatures = _showFeatures[1];
  var _showSubscription = useState(false), showSubscription = _showSubscription[0], setShowSubscription = _showSubscription[1];
  var _showPrivacy = useState(false), showPrivacy = _showPrivacy[0], setShowPrivacy = _showPrivacy[1];
  var _showTerms = useState(false), showTerms = _showTerms[0], setShowTerms = _showTerms[1];
  var _showMilestones = useState(false), showMilestones = _showMilestones[0], setShowMilestones = _showMilestones[1];
  var _showLogoutConfirm = useState(false), showLogoutConfirm = _showLogoutConfirm[0], setShowLogoutConfirm = _showLogoutConfirm[1];
  var _showDeleteConfirm = useState(false), showDeleteConfirm = _showDeleteConfirm[0], setShowDeleteConfirm = _showDeleteConfirm[1];
  var _editName = useState(''), editName = _editName[0], setEditName = _editName[1];
  var _editAge = useState(''), editAge = _editAge[0], setEditAge = _editAge[1];
  var _editWeight = useState(''), editWeight = _editWeight[0], setEditWeight = _editWeight[1];
  var _editHeight = useState(''), editHeight = _editHeight[0], setEditHeight = _editHeight[1];
  var _editLocation = useState(''), editLocation = _editLocation[0], setEditLocation = _editLocation[1];
  var _lang = useState('fr'), lang = _lang[0], setLang = _lang[1];
  var _connectedApps = useState({}), connectedApps = _connectedApps[0], setConnectedApps = _connectedApps[1];
  var _toast = useState(null), toast = _toast[0], setToast = _toast[1];
  var t = T[lang] || T.fr;
  var showToast = function(message, color) { setToast({ message: message, color: color || '#00D984' }); setTimeout(function() { setToast(null); }, 2500); };
  useEffect(function() { loadProfile(); }, []);

  var loadProfile = function() {
    Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID + '&select=*', { headers: hdrs }),
      fetch(SUPABASE_URL + '/rest/v1/lixverse_user_characters?user_id=eq.' + TEST_USER_ID + '&select=character_slug,is_active,level', { headers: hdrs }),
    ]).then(function(responses) { return Promise.all(responses.map(function(r) { return r.json(); })); })
    .then(function(results) {
      var pD = results[0]; var cD = results[1];
      if (pD && pD[0]) { setProfile(pD[0]); setLixBalance(pD[0].lix_balance || 0); setUserEnergy(pD[0].energy || 20); setEditName(pD[0].full_name || ''); setEditAge(String(pD[0].age || '')); setEditWeight(String(pD[0].weight || '')); setEditHeight(String(pD[0].height || '')); if (pD[0].language === 'EN') setLang('en'); else setLang('fr'); }
      if (Array.isArray(cD)) { setOwnedCharacters(cD.length); var activeC = cD.find(function(c) { return c.is_active; }); if (activeC) setActiveCharSlug(activeC.character_slug); }
      fetch(SUPABASE_URL + '/rest/v1/rpc/get_user_xp', { method: 'POST', headers: Object.assign({}, hdrs, { 'Content-Type': 'application/json' }), body: JSON.stringify({ p_user_id: TEST_USER_ID }) })
        .then(function(r) { return r.json(); }).then(function(d) { if (d) setUserXP(d); }).catch(function() {});
    }).catch(function(e) { console.error('Profile:', e); });
  };

  var saveProfile = function() {
    var h = Object.assign({}, hdrs, { 'Content-Type': 'application/json', 'Prefer': 'return=representation' });
    var currentGender = profile ? profile.gender || 'male' : 'male';
    var currentActivityLevel = profile ? profile.activity_level : 'moderate';
    if (typeof currentActivityLevel === 'number') currentActivityLevel = activityIndexToKey(currentActivityLevel);
    var newBMR = calculateBMR(editWeight, editHeight, editAge, currentGender);
    var newTDEE = calculateTDEE(newBMR, currentActivityLevel);
    var currentGoal = profile ? profile.goal || 'maintain' : 'maintain';
    var newTarget = calculateDailyTarget(newTDEE, currentGoal, profile ? profile.target_weight_loss : 0, profile ? profile.target_months : 3);
    var body = { full_name: editName.trim(), age: parseInt(editAge) || null, weight: parseFloat(editWeight) || null, height: parseFloat(editHeight) || null, gender: currentGender, activity_level: currentActivityLevel, dietary_regime: profile ? (profile.dietary_regime || 'classic') : 'classic', goal: currentGoal, bmr: newBMR, tdee: newTDEE, daily_calorie_target: newTarget, language: lang === 'en' ? 'EN' : 'FR' };
    fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID, { method: 'PATCH', headers: h, body: JSON.stringify(body) })
      .then(function(r) { return r.json(); }).then(function(data) { if (data && data[0]) { setProfile(data[0]); setLixBalance(data[0].lix_balance || 0); } setShowEditProfile(false); showToast(lang === 'fr' ? 'Profil mis \u00e0 jour \u2713' : 'Profile updated \u2713', '#00D984'); })
      .catch(function() { showToast(lang === 'fr' ? 'Erreur de sauvegarde' : 'Save error', '#FF6B6B'); });
  };

  var saveLocation = function(city) { setEditLocation(city); setShowLocationPicker(false); showToast('\uD83D\uDCCD ' + city, '#FF8C42'); };
  var toggleConnector = function(connId) { setConnectedApps(function(prev) { var n = Object.assign({}, prev); if (n[connId]) { delete n[connId]; showToast(lang === 'fr' ? 'D\u00e9connect\u00e9' : 'Disconnected', '#FF6B6B'); } else { n[connId] = { connectedAt: new Date().toISOString(), lastSync: new Date().toISOString() }; showToast(lang === 'fr' ? 'Connect\u00e9 \u2713' : 'Connected \u2713', '#00D984'); } return n; }); };
  var handleLogout = function() { AsyncStorage.multiRemove(['lixum_access_token', 'lixum_user_id']).catch(function() {}); setShowLogoutConfirm(false); navigation.navigate('Register'); };
  var handleDeleteAccount = function() { AsyncStorage.multiRemove(['lixum_access_token', 'lixum_user_id']).catch(function() {}); setShowDeleteConfirm(false); navigation.navigate('Register'); };

  var Section = function(props) {
    return (
      <Pressable delayPressIn={120} onPress={props.onPress} style={function(s) { return { flexDirection: 'row', alignItems: 'center', paddingVertical: wp(14), paddingHorizontal: wp(16), backgroundColor: s.pressed ? 'rgba(255,255,255,0.04)' : 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' }; }}>
        <View style={{ width: wp(36), height: wp(36), borderRadius: wp(10), backgroundColor: (props.color || '#00D984') + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}><Text style={{ fontSize: fp(16) }}>{props.icon}</Text></View>
        <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{props.title}</Text>{props.subtitle ? <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(1) }}>{props.subtitle}</Text> : null}</View>
        {props.rightText ? <Text style={{ fontSize: fp(11), color: props.color || 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{props.rightText}</Text> : null}
        <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.15)', marginLeft: wp(8) }}>{'\u203A'}</Text>
      </Pressable>
    );
  };

  var imc = profile && profile.weight && profile.height ? (profile.weight / ((profile.height / 100) * (profile.height / 100))).toFixed(1) : '\u2014';
  var imcColor = imc < 18.5 ? '#FF8C42' : imc < 25 ? '#00D984' : imc < 30 ? '#FF8C42' : '#FF6B6B';
  var subTier = profile && profile.is_premium ? 'Gold' : t.free;
  var subColor = profile && profile.is_premium ? '#D4AF37' : 'rgba(255,255,255,0.3)';
  var avatarEmoji = getCharEmoji(activeCharSlug);
  var avatarInitial = (profile && profile.full_name ? profile.full_name : 'U').charAt(0).toUpperCase();
  var avatarColor = activeCharSlug ? '#00D984' : '#4DA6FF';

  var renderConnectorCard = function(conn, i) {
    var isConnected = !!connectedApps[conn.id]; var dataText = lang === 'fr' ? conn.dataFr : conn.dataEn;
    return (
      <View key={conn.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(12), paddingHorizontal: wp(14), backgroundColor: isConnected ? conn.color + '08' : 'transparent', borderBottomWidth: i < CONNECTORS.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
        <View style={{ width: wp(40), height: wp(40), borderRadius: wp(10), backgroundColor: conn.color + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12), borderWidth: isConnected ? 1.5 : 0, borderColor: isConnected ? conn.color + '40' : 'transparent' }}><Text style={{ fontSize: fp(18) }}>{conn.emoji}</Text></View>
        <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}><Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{conn.name}</Text>{isConnected ? <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), backgroundColor: '#00D984' }} /> : null}</View><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginTop: wp(2) }}>{dataText}</Text></View>
        <Pressable delayPressIn={120} onPress={function() { toggleConnector(conn.id); }} style={function(s) { return { paddingHorizontal: wp(12), paddingVertical: wp(7), borderRadius: wp(8), backgroundColor: isConnected ? 'rgba(255,107,107,0.08)' : conn.color + '15', borderWidth: 1, borderColor: isConnected ? 'rgba(255,107,107,0.2)' : conn.color + '30', transform: [{ scale: s.pressed ? 0.92 : 1 }] }; }}>
          <Text style={{ fontSize: fp(10), fontWeight: '700', color: isConnected ? '#FF6B6B' : conn.color }}>{isConnected ? t.disconnect : t.connect}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#1A1D22', '#252A30', '#1E2328']} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingBottom: wp(100) }}>
          <View style={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingBottom: wp(20) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wp(16), marginBottom: wp(12) }}>
              <Pressable onPress={function() { navigation.goBack(); }} style={{ paddingVertical: wp(5), paddingHorizontal: wp(8) }}><Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.4)' }}>{'\u2190'}</Text></Pressable>
              <View style={{ flexDirection: 'row', gap: wp(6) }}>
                <Pressable onPress={function() { setLang('fr'); }} style={{ paddingHorizontal: wp(8), paddingVertical: wp(5), borderRadius: wp(6), borderWidth: 1, borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.08)', backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'transparent' }}><Text style={{ fontSize: fp(14) }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text></Pressable>
                <Pressable onPress={function() { setLang('en'); }} style={{ paddingHorizontal: wp(8), paddingVertical: wp(5), borderRadius: wp(6), borderWidth: 1, borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.08)', backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'transparent' }}><Text style={{ fontSize: fp(14) }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text></Pressable>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: wp(72), height: wp(72), borderRadius: wp(36), backgroundColor: avatarColor + '15', borderWidth: 2.5, borderColor: avatarColor + '50', justifyContent: 'center', alignItems: 'center', marginBottom: wp(10) }}>{avatarEmoji ? <Text style={{ fontSize: fp(32) }}>{avatarEmoji}</Text> : <Text style={{ fontSize: fp(28), fontWeight: '900', color: avatarColor }}>{avatarInitial}</Text>}</View>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>{profile ? profile.full_name : '...'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginTop: wp(4) }}>
                <View style={{ backgroundColor: subColor + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(2), borderWidth: 1, borderColor: subColor + '40' }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: subColor }}>{subTier}</Text></View>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)' }}>{profile ? profile.lixtag : 'LXM-...'}</Text>
              </View>
              <View style={{ width: '100%', paddingHorizontal: wp(32), marginTop: wp(14) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)' }}><Text style={{ fontSize: fp(11), fontWeight: '800', color: '#00D984', letterSpacing: 1 }}>NIV {userXP.user_level}</Text></View>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{userXP.xp_progress} / {userXP.xp_needed} XP</Text>
                </View>
                <View style={{ height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}><LinearGradient colors={['#00D984', '#00B871']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: Math.min(userXP.xp_percent || 0, 100) + '%', height: '100%', borderRadius: wp(4) }} /></View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: wp(20), marginTop: wp(16) }}>
                {[{ val: lixBalance, label: 'Lix', color: '#D4AF37' }, { val: userEnergy, label: lang === 'fr' ? '\u00c9nergie' : 'Energy', color: '#FFB800' }, { val: ownedCharacters + '/16', label: 'Cartes', color: '#00D984' }].map(function(s, i) { return (
                  <View key={i} style={{ alignItems: 'center' }}><Text style={{ fontSize: fp(18), fontWeight: '800', color: s.color }}>{s.val}</Text><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginTop: wp(2) }}>{s.label}</Text></View>
                ); })}
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.personalData}</Text></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(16), gap: wp(8), marginBottom: wp(12) }}>
            {[{ label: t.age, val: profile ? profile.age + ' ' + t.years : '\u2014', color: '#D4AF37' }, { label: t.weight, val: profile ? profile.weight + ' ' + t.kg : '\u2014', color: '#00D984' }, { label: t.height, val: profile ? profile.height + ' ' + t.cm : '\u2014', color: '#00BFA6' }, { label: t.bmi, val: imc, color: imcColor }].map(function(d, i) { return (
              <View key={i} style={{ width: (W - wp(40)) / 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: wp(4) }}>{d.label}</Text>
                <Text style={{ fontSize: fp(16), fontWeight: '700', color: d.color }}>{d.val}</Text>
              </View>
            ); })}
          </View>
          <Pressable delayPressIn={120} onPress={function() { setShowEditProfile(true); }} style={{ marginHorizontal: wp(16), marginBottom: wp(20), paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.06)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)' }}><Text style={{ fontSize: fp(13), fontWeight: '600', color: '#00D984' }}>{t.editProfile}</Text></Pressable>

          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(4) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.settings}</Text></View>
          <Section icon={'\uD83D\uDCCD'} title={t.location} subtitle={t.locationSub} color="#FF8C42" rightText={editLocation || t.notDefined} onPress={function() { setShowLocationPicker(true); }} />
          <Section icon={'\u2B50'} title={t.subscription} subtitle={t.subscriptionSub} color="#D4AF37" rightText={subTier} onPress={function() { setShowSubscription(true); }} />
          <Section icon={'\uD83D\uDD14'} title={t.notifications} subtitle={t.notifSub} color="#4DA6FF" rightText={t.comingSoon} onPress={function() { showToast(t.comingSoon, '#4DA6FF'); }} />

          <View style={{ paddingHorizontal: wp(16), marginTop: wp(16), marginBottom: wp(4) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.connectors}</Text></View>
          <Text style={{ paddingHorizontal: wp(16), fontSize: fp(11), color: 'rgba(255,255,255,0.3)', marginBottom: wp(8) }}>{t.connectorsDesc}</Text>
          <View style={{ marginHorizontal: wp(16), borderRadius: wp(14), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: wp(16) }}>{CONNECTORS.map(renderConnectorCard)}</View>

          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(4) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.learn}</Text></View>
          <Section icon={'\uD83D\uDCD6'} title={t.glossary} subtitle={t.glossarySub} color="#9B6DFF" onPress={function() { setShowGlossary(true); }} />
          <Section icon={'\uD83D\uDCA1'} title={t.guide} subtitle={t.guideSub} color="#00D984" onPress={function() { setShowFeatures(true); }} />

          <View style={{ paddingHorizontal: wp(16), marginTop: wp(16), marginBottom: wp(4) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.legal}</Text></View>
          <Section icon={'\uD83D\uDD12'} title={t.privacy} color="#9B6DFF" onPress={function() { setShowPrivacy(true); }} />
          <Section icon={'\uD83D\uDCC4'} title={t.terms} color="#FF8C42" onPress={function() { setShowTerms(true); }} />
          <Section icon={'\uD83D\uDCE7'} title={t.contact} color="#4DA6FF" onPress={function() { showToast('contact@lixum.app', '#4DA6FF'); }} />
          <Section icon={'\u2B50'} title={t.rate} color="#D4AF37" onPress={function() { showToast(t.comingSoon, '#D4AF37'); }} />

          <Pressable delayPressIn={120} onPress={function() { setShowLogoutConfirm(true); }} style={{ marginHorizontal: wp(16), marginTop: wp(16), marginBottom: wp(16), paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,107,107,0.05)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)' }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FF6B6B' }}>{t.logout}</Text></Pressable>
          <Pressable onPress={function() { setShowDeleteConfirm(true); }} style={{ marginHorizontal: wp(16), marginBottom: wp(16), alignItems: 'center' }}><Text style={{ fontSize: fp(12), color: 'rgba(255,107,107,0.4)' }}>{t.deleteAccount}</Text></Pressable>
          <View style={{ alignItems: 'center', paddingBottom: wp(20) }}><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.15)' }}>LIXUM v1.0.0-beta</Text><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.1)', marginTop: wp(2) }}>{t.madeWith}</Text></View>
        </ScrollView>

        <Modal visible={showLogoutConfirm} transparent animationType="fade" onRequestClose={function() { setShowLogoutConfirm(false); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
            <View style={{ backgroundColor: '#1A1D22', borderRadius: wp(20), padding: wp(24), width: '100%', borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)' }}>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: fp(8) }}>{t.logout}</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: wp(20) }}>{t.logoutConfirm}</Text>
              <Pressable delayPressIn={120} onPress={handleLogout} style={{ paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,107,107,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.25)', marginBottom: wp(8) }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FF6B6B' }}>{t.logout}</Text></Pressable>
              <Pressable onPress={function() { setShowLogoutConfirm(false); }} style={{ paddingVertical: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>{t.cancel}</Text></Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={showDeleteConfirm} transparent animationType="fade" onRequestClose={function() { setShowDeleteConfirm(false); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
            <View style={{ backgroundColor: '#1A1D22', borderRadius: wp(20), padding: wp(24), width: '100%', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)' }}>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: fp(8) }}>{t.deleteAccount}</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: wp(20) }}>{t.deleteConfirm}</Text>
              <Pressable delayPressIn={120} onPress={handleDeleteAccount} style={{ paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,59,48,0.12)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', marginBottom: wp(8) }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FF3B30' }}>{t.deleteAccount}</Text></Pressable>
              <Pressable onPress={function() { setShowDeleteConfirm(false); }} style={{ paddingVertical: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>{t.cancel}</Text></Pressable>
            </View>
          </View>
        </Modal>

        {toast ? (
          <View style={{ position: 'absolute', top: Platform.OS === 'android' ? 45 : 60, left: wp(20), right: wp(20), backgroundColor: '#252A30', borderRadius: wp(14), paddingVertical: wp(14), paddingHorizontal: wp(20), flexDirection: 'row', alignItems: 'center', gap: wp(10), borderWidth: 1.5, borderColor: toast.color + '40', zIndex: 9999 }}>
            <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: toast.color }} />
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', flex: 1 }}>{toast.message}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}
