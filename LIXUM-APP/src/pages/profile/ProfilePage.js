import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StatusBar, Modal, TextInput, Image, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import Markdown from 'react-native-markdown-display';
import {
  W, wp, fp,
  SUPABASE_URL, SUPABASE_ANON_KEY,
  CONNECTORS,
  activityLevelToIndex, activityIndexToKey,
  calculateBMR, calculateTDEE, calculateDailyTarget,
  XP_MILESTONES, getNextMilestone, getXPForLevel,
  ACTIVITY_LEVELS, DIETS, GOALS,
  T,
  getCharEmoji,
} from './profileConstants';
import { useAuth } from '../../config/AuthContext';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import MetalCard from '../../components/shared/MetalCard';

var markdownStyles = {
  body: { color: '#FFF', fontSize: fp(14), lineHeight: fp(22) },
  heading1: { color: '#00D984', fontSize: fp(22), fontWeight: 'bold', marginTop: wp(20), marginBottom: wp(12), borderBottomWidth: 1, borderBottomColor: 'rgba(0,217,132,0.3)', paddingBottom: wp(8) },
  heading2: { color: '#FFF', fontSize: fp(18), fontWeight: 'bold', marginTop: wp(16), marginBottom: wp(8) },
  heading3: { color: '#00D984', fontSize: fp(16), fontWeight: '600', marginTop: wp(12), marginBottom: wp(6) },
  heading4: { color: '#8892A0', fontSize: fp(14), fontWeight: '600', marginTop: wp(8), marginBottom: wp(4), textTransform: 'uppercase', letterSpacing: 0.5 },
  paragraph: { color: '#FFF', fontSize: fp(14), lineHeight: fp(22), marginBottom: wp(10) },
  strong: { color: '#00D984', fontWeight: 'bold' },
  em: { color: '#8892A0', fontStyle: 'italic' },
  bullet_list: { marginVertical: wp(8) },
  ordered_list: { marginVertical: wp(8) },
  list_item: { marginBottom: wp(6), color: '#FFF' },
  bullet_list_icon: { color: '#00D984', marginRight: wp(8) },
  ordered_list_icon: { color: '#00D984', marginRight: wp(8), fontWeight: 'bold' },
  link: { color: '#00D984', textDecorationLine: 'underline' },
  code_inline: { backgroundColor: '#1E2530', color: '#00D984', paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4), fontSize: fp(13) },
  code_block: { backgroundColor: '#1E2530', color: '#FFF', padding: wp(12), borderRadius: wp(8), marginVertical: wp(8), fontSize: fp(13) },
  fence: { backgroundColor: '#1E2530', color: '#FFF', padding: wp(12), borderRadius: wp(8), marginVertical: wp(8), fontSize: fp(13) },
  blockquote: { borderLeftWidth: wp(3), borderLeftColor: '#00D984', paddingLeft: wp(12), backgroundColor: 'rgba(0,217,132,0.05)', paddingVertical: wp(8), marginVertical: wp(8) },
  hr: { backgroundColor: '#2A303B', height: 1, marginVertical: wp(16) },
  table: { borderWidth: 1, borderColor: '#2A303B', borderRadius: wp(6), marginVertical: wp(10) },
  thead: { backgroundColor: '#1E2530' },
  th: { color: '#00D984', fontWeight: 'bold', padding: wp(8), fontSize: fp(13) },
  td: { color: '#FFF', padding: wp(8), fontSize: fp(13), borderTopWidth: 1, borderTopColor: '#2A303B' }
};

var legalStyles = {
  legalModalRoot: { flex: 1, backgroundColor: '#1E2530' },
  legalModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(16), paddingTop: wp(20), paddingBottom: wp(12), backgroundColor: '#252A30', borderBottomWidth: 1, borderBottomColor: '#2A303B' },
  legalModalTitle: { color: '#FFF', fontSize: fp(18), fontWeight: 'bold', flex: 1 },
  legalModalClose: { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: '#1E2530', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2A303B' },
  legalModalCloseText: { color: '#FFF', fontSize: fp(16), fontWeight: 'bold' },
  legalLangSwitch: { flexDirection: 'row', justifyContent: 'center', paddingVertical: wp(10), backgroundColor: '#252A30', gap: wp(8) },
  legalLangActive: { paddingHorizontal: wp(20), paddingVertical: wp(6), backgroundColor: '#00D984', borderRadius: wp(20) },
  legalLangInactive: { paddingHorizontal: wp(20), paddingVertical: wp(6), backgroundColor: '#1E2530', borderRadius: wp(20), borderWidth: 1, borderColor: '#2A303B' },
  legalLangActiveText: { color: '#1E2530', fontWeight: 'bold', fontSize: fp(13) },
  legalLangInactiveText: { color: '#8892A0', fontWeight: '600', fontSize: fp(13) },
  legalLoaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  legalLoaderText: { color: '#8892A0', fontSize: fp(14), marginTop: wp(12) },
  legalErrorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: wp(24) },
  legalErrorIcon: { fontSize: fp(40), marginBottom: wp(16) },
  legalErrorText: { color: '#8892A0', fontSize: fp(14), textAlign: 'center', marginBottom: wp(20), lineHeight: fp(20) },
  legalRetryButton: { paddingHorizontal: wp(28), paddingVertical: wp(12), backgroundColor: '#00D984', borderRadius: wp(24) },
  legalRetryText: { color: '#1E2530', fontWeight: 'bold', fontSize: fp(14) },
  legalScrollView: { flex: 1 },
  legalScrollContent: { paddingHorizontal: wp(20), paddingVertical: wp(20), paddingBottom: wp(40) },
  legalFooter: { marginTop: wp(30), paddingTop: wp(16), borderTopWidth: 1, borderTopColor: '#2A303B', alignItems: 'center' },
  legalFooterText: { color: '#8892A0', fontSize: fp(11), textAlign: 'center', fontStyle: 'italic' }
};

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
  var auth = useAuth();
  var route = useRoute();
  var userId = auth.userId;
  var lixBalance = auth.lixBalance; var updateLixBalance = auth.updateLixBalance;
  var refreshLixFromServer = auth.refreshLixFromServer;
  var getAuthHeaders = async function() {
    var result = await supabase.auth.getSession();
    var token = result.data.session ? result.data.session.access_token : SUPABASE_ANON_KEY;
    return { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  };
  var _profile = useState(null), profile = _profile[0], setProfile = _profile[1];
  // lixBalance from AuthContext
  var _ownedCharacters = useState(0), ownedCharacters = _ownedCharacters[0], setOwnedCharacters = _ownedCharacters[1];
  var _userXP = useState({ user_xp: 0, user_level: 1, xp_progress: 0, xp_needed: 80, xp_percent: 0 }), userXP = _userXP[0], setUserXP = _userXP[1];
  var _activeCharSlug = useState(null), activeCharSlug = _activeCharSlug[0], setActiveCharSlug = _activeCharSlug[1];
  var _userEnergy = useState(20), userEnergy = _userEnergy[0], setUserEnergy = _userEnergy[1];
  var _showEditProfile = useState(false), showEditProfile = _showEditProfile[0], setShowEditProfile = _showEditProfile[1];
  var _hydroGoalL = useState(null); var hydroGoalL = _hydroGoalL[0]; var setHydroGoalL = _hydroGoalL[1];
  var _showMedicalWarning = useState(false); var showMedicalWarning = _showMedicalWarning[0]; var setShowMedicalWarning = _showMedicalWarning[1];
  var _pendingHydroGoal = useState(null); var pendingHydroGoal = _pendingHydroGoal[0]; var setPendingHydroGoal = _pendingHydroGoal[1];
  var _showLocationPicker = useState(false), showLocationPicker = _showLocationPicker[0], setShowLocationPicker = _showLocationPicker[1];
  var _showGlossary = useState(false), showGlossary = _showGlossary[0], setShowGlossary = _showGlossary[1];
  var _showFeatures = useState(false), showFeatures = _showFeatures[0], setShowFeatures = _showFeatures[1];
  var _showSubscription = useState(false), showSubscription = _showSubscription[0], setShowSubscription = _showSubscription[1];
  var _showPrivacy = useState(false), showPrivacy = _showPrivacy[0], setShowPrivacy = _showPrivacy[1];
  var _showTerms = useState(false), showTerms = _showTerms[0], setShowTerms = _showTerms[1];
  var _legalCache = useState({ privacy: { fr: null, en: null }, terms: { fr: null, en: null } }), legalCache = _legalCache[0], setLegalCache = _legalCache[1];
  var _legalLoading = useState(false), legalLoading = _legalLoading[0], setLegalLoading = _legalLoading[1];
  var _legalError = useState(null), legalError = _legalError[0], setLegalError = _legalError[1];
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

  var weightInputRef = useRef(null);
  var _focusedField = useState(null), focusedField = _focusedField[0], setFocusedField = _focusedField[1];

  var ageNum = parseInt(editAge);
  var weightNum = parseFloat(editWeight);
  var heightNum = parseFloat(editHeight);
  var ageInvalid = editAge !== '' && (isNaN(ageNum) || ageNum < 1 || ageNum > 120);
  var weightInvalid = editWeight !== '' && (isNaN(weightNum) || weightNum < 20 || weightNum > 500);
  var heightInvalid = editHeight !== '' && (isNaN(heightNum) || heightNum < 50 || heightNum > 250);
  var nameEmpty = editName.trim() === '';
  var isFormValid = !ageInvalid && !weightInvalid && !heightInvalid && !nameEmpty && editAge !== '' && editWeight !== '' && editHeight !== '';
  var hasChanges = !!profile && (
    editName.trim() !== (profile.display_name || profile.full_name || '') ||
    editAge !== String(profile.age || '') ||
    editWeight !== String(profile.weight || '') ||
    editHeight !== String(profile.height || '') ||
    editLocation !== (profile.city || profile.location || '')
  );
  var canSave = isFormValid && hasChanges;

  useEffect(function() {
    if (showEditProfile && profile) {
      setEditName(profile.display_name || profile.full_name || '');
      setEditAge(profile.age ? String(profile.age) : '');
      setEditWeight(profile.weight ? String(profile.weight) : '');
      setEditHeight(profile.height ? String(profile.height) : '');
      setEditLocation(profile.city || profile.location || '');
    }
  }, [showEditProfile, profile]);

  useEffect(function() {
    if (route.params && route.params.scrollTo === 'weight') {
      setShowEditProfile(true);
      setTimeout(function() {
        if (weightInputRef.current) weightInputRef.current.focus();
      }, 600);
    }
  }, [route.params]);

  useEffect(function() { if (userId) loadProfile(); }, [userId]);

  useFocusEffect(useCallback(function() {
    if (userId) refreshLixFromServer();
  }, [userId, refreshLixFromServer]));

  var loadProfile = async function() {
    if (!userId) return;
    var hdrs = await getAuthHeaders();
    Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId + '&select=*', { headers: hdrs }),
      fetch(SUPABASE_URL + '/rest/v1/lixverse_user_characters?user_id=eq.' + userId + '&select=character_slug,is_active,level', { headers: hdrs }),
    ]).then(function(responses) { return Promise.all(responses.map(function(r) { return r.json(); })); })
    .then(function(results) {
      var pD = results[0]; var cD = results[1];
      if (pD && pD[0]) { setProfile(pD[0]); updateLixBalance(pD[0].lix_balance || 0); setUserEnergy(pD[0].energy || 20); setEditName(pD[0].display_name || pD[0].full_name || ''); setEditAge(String(pD[0].age || '')); setEditWeight(String(pD[0].weight || '')); setEditHeight(String(pD[0].height || '')); if (pD[0].language === 'EN') setLang('en'); else setLang('fr'); var cGoal = pD[0].custom_hydration_goal_ml; setHydroGoalL(cGoal ? (cGoal / 1000) : null); }
      if (Array.isArray(cD)) { setOwnedCharacters(cD.length); var activeC = cD.find(function(c) { return c.is_active; }); if (activeC) setActiveCharSlug(activeC.character_slug); }
      fetch(SUPABASE_URL + '/rest/v1/rpc/get_user_xp', { method: 'POST', headers: Object.assign({}, hdrs, { 'Content-Type': 'application/json' }), body: JSON.stringify({ p_user_id: userId }) })
        .then(function(r) { return r.json(); }).then(function(d) { if (d) setUserXP(d); }).catch(function(err) { console.warn('[LIXUM] XP fetch error:', err); });
    }).catch(function(e) { console.error('Profile:', e); });
  };

  var saveProfile = async function() {
    var authHdrs = await getAuthHeaders();
    var h = Object.assign({}, authHdrs, { 'Prefer': 'return=representation' });
    var currentGender = profile ? profile.gender || 'male' : 'male';
    var currentActivityLevel = profile ? profile.activity_level : 'moderate';
    if (typeof currentActivityLevel === 'number') currentActivityLevel = activityIndexToKey(currentActivityLevel);
    var newBMR = calculateBMR(editWeight, editHeight, editAge, currentGender);
    var newTDEE = calculateTDEE(newBMR, currentActivityLevel);
    var currentGoal = profile ? profile.goal || 'maintain' : 'maintain';
    var newTarget = calculateDailyTarget(newTDEE, currentGoal, profile ? profile.target_weight_loss : 0, profile ? profile.target_months : 3);
    var body = { display_name: editName.trim(), age: parseInt(editAge) || null, weight: parseFloat(editWeight) || null, height: parseFloat(editHeight) || null, gender: currentGender, activity_level: currentActivityLevel, dietary_regime: profile ? (profile.dietary_regime || 'classic') : 'classic', goal: currentGoal, bmr: newBMR, tdee: newTDEE, daily_calorie_target: newTarget, language: lang === 'en' ? 'EN' : 'FR' };
    fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId, { method: 'PATCH', headers: h, body: JSON.stringify(body) })
      .then(function(r) { return r.json(); }).then(function(data) { if (data && data[0]) { setProfile(data[0]); updateLixBalance(data[0].lix_balance || 0); } setShowEditProfile(false); showToast(lang === 'fr' ? 'Profil mis \u00e0 jour \u2713' : 'Profile updated \u2713', '#00D984'); })
      .catch(function() { showToast(lang === 'fr' ? 'Erreur de sauvegarde' : 'Save error', '#FF6B6B'); });
  };

  var saveLocation = function(city) { setEditLocation(city); setShowLocationPicker(false); showToast('\uD83D\uDCCD ' + city, '#FF8C42'); };
  var toggleConnector = function(connId) { setConnectedApps(function(prev) { var n = Object.assign({}, prev); if (n[connId]) { delete n[connId]; showToast(lang === 'fr' ? 'D\u00e9connect\u00e9' : 'Disconnected', '#FF6B6B'); } else { n[connId] = { connectedAt: new Date().toISOString(), lastSync: new Date().toISOString() }; showToast(lang === 'fr' ? 'Connect\u00e9 \u2713' : 'Connected \u2713', '#00D984'); } return n; }); };
  var defaultHydroGoalL = (profile && (profile.gender === 'female' || profile.gender === 'femme')) ? 2.0 : 2.5;
  var currentHydroL = hydroGoalL !== null ? hydroGoalL : defaultHydroGoalL;
  var hydroValues = [];
  for (var hv = 5; hv <= 50; hv++) { hydroValues.push(hv / 10); }

  var saveHydrationGoal = async function(valL) {
    var mlVal = Math.round(valL * 1000);
    var isDefault = valL === defaultHydroGoalL;
    var dbVal = isDefault ? null : mlVal;
    try {
      await supabase.from('users_profile').update({ custom_hydration_goal_ml: dbVal }).eq('user_id', userId);
      setHydroGoalL(isDefault ? null : valL);
      showToast('Objectif hydratation mis a jour', '#4DA6FF');
    } catch (e) { showToast('Erreur sauvegarde', '#FF6B6B'); }
  };

  var trySetHydroGoal = function(valL) {
    var mlVal = Math.round(valL * 1000);
    if (mlVal < 1500 || mlVal > 3500) {
      setPendingHydroGoal(valL);
      setShowMedicalWarning(true);
    } else {
      saveHydrationGoal(valL);
    }
  };

  var confirmMedicalWarning = function() {
    if (pendingHydroGoal !== null) saveHydrationGoal(pendingHydroGoal);
    setPendingHydroGoal(null);
    setShowMedicalWarning(false);
  };

  var handleLogout = function() { auth.signOut(); setShowLogoutConfirm(false); };
  var handleDeleteAccount = function() { auth.signOut(); setShowDeleteConfirm(false); };

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
  var imcNum = parseFloat(imc) || 0;
  var imcColor = imcNum < 18.5 ? '#4DA6FF' : imcNum < 25 ? '#00D984' : imcNum < 30 ? '#FF8C42' : '#FF4444';
  var imcLabel = imcNum < 18.5 ? (lang === 'fr' ? 'Insuffisance' : 'Underweight') : imcNum < 25 ? 'Normal' : imcNum < 30 ? (lang === 'fr' ? 'Surpoids' : 'Overweight') : (lang === 'fr' ? 'Obésité' : 'Obesity');
  var imcBarPos = Math.min(Math.max(((imcNum - 15) / 25) * 100, 0), 100);
  var subTier = profile && profile.is_premium ? 'Gold' : t.free;
  var subColor = profile && profile.is_premium ? '#D4AF37' : 'rgba(255,255,255,0.3)';
  var avatarEmoji = getCharEmoji(activeCharSlug);
  var displayNameForAvatar = (profile && (profile.display_name || profile.full_name)) || 'U';
  var avatarInitial = displayNameForAvatar.charAt(0).toUpperCase();
  var avatarColor = activeCharSlug ? '#00D984' : '#4DA6FF';

  function fetchLegalDocument(docType, language) {
    if (legalCache[docType] && legalCache[docType][language]) {
      setLegalLoading(false);
      setLegalError(null);
      return;
    }
    setLegalLoading(true);
    setLegalError(null);
    supabase
      .rpc('get_current_legal_document', { p_document_type: docType, p_language: language })
      .then(function(result) {
        var data = result.data;
        var error = result.error;
        if (error) {
          console.error('[Legal] RPC error:', error);
          setLegalError('Impossible de charger le document. V\u00e9rifiez votre connexion.');
          setLegalLoading(false);
          return;
        }
        if (!data || (Array.isArray(data) && data.length === 0)) {
          setLegalError('Document indisponible pour cette langue.');
          setLegalLoading(false);
          return;
        }
        var doc = Array.isArray(data) ? data[0] : data;
        var newCache = Object.assign({}, legalCache);
        newCache[docType] = Object.assign({}, newCache[docType]);
        newCache[docType][language] = doc;
        setLegalCache(newCache);
        setLegalLoading(false);
      })
      .catch(function(err) {
        console.error('[Legal] Catch:', err);
        setLegalError('Erreur r\u00e9seau. R\u00e9essayez.');
        setLegalLoading(false);
      });
  }

  useEffect(function() {
    if (showPrivacy) {
      fetchLegalDocument('privacy', lang);
    }
  }, [showPrivacy, lang]);

  useEffect(function() {
    if (showTerms) {
      fetchLegalDocument('terms', lang);
    }
  }, [showTerms, lang]);

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
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>{profile ? (profile.display_name || profile.full_name || 'Utilisateur') : '...'}</Text>
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

          {profile && !profile.display_name ? (
            <Pressable
              onPress={function() { setShowEditProfile(true); }}
              style={{
                marginHorizontal: 16,
                marginBottom: 12,
                padding: 12,
                borderRadius: 10,
                backgroundColor: 'rgba(0, 217, 132, 0.08)',
                borderWidth: 1,
                borderColor: 'rgba(0, 217, 132, 0.3)',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Text style={{ fontSize: 18 }}>{'\u2728'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#00D984', fontSize: 12, fontWeight: '600' }}>
                  {lang === 'fr' ? 'Personnalisez votre profil' : 'Personalize your profile'}
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 10, marginTop: 2, lineHeight: 14 }}>
                  {lang === 'fr' ? 'Choisissez comment vous souhaitez \u00eatre appel\u00e9 par LIXUM' : 'Choose how you\'d like LIXUM to address you'}
                </Text>
              </View>
              <Text style={{ fontSize: 16, color: '#00D984' }}>{'\u203A'}</Text>
            </Pressable>
          ) : null}

          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.personalData}</Text></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(16), gap: wp(8), marginBottom: wp(12) }}>
            {[{ label: t.age, val: profile ? profile.age + ' ' + t.years : '\u2014', color: '#D4AF37' }, { label: t.weight, val: profile ? profile.weight + ' ' + t.kg : '\u2014', color: '#00D984' }, { label: t.height, val: profile ? profile.height + ' ' + t.cm : '\u2014', color: '#00BFA6' }, { label: t.bmi, val: imc, color: imcColor }].map(function(d, i) { return (
              <View key={i} style={{ width: (W - wp(40)) / 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: wp(4) }}>{d.label}</Text>
                <Text style={{ fontSize: fp(16), fontWeight: '700', color: d.color }}>{d.val}</Text>
              </View>
            ); })}
          </View>
          {profile && profile.weight && profile.height && (
            <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
              <MetalCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '800', letterSpacing: 1.5 }}>IMC</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ color: imcColor, fontSize: fp(22), fontWeight: '900' }}>{imc}</Text>
                    <Text style={{ color: '#6B7280', fontSize: fp(10), marginLeft: 4 }}>kg/m²</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <View style={{ backgroundColor: imcColor + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: imcColor + '40' }}>
                    <Text style={{ color: imcColor, fontSize: fp(11), fontWeight: '700' }}>{imcLabel}</Text>
                  </View>
                </View>
                <View style={{ height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', marginBottom: 6 }}>
                  <View style={{ flex: 18.5, backgroundColor: '#4DA6FF', opacity: 0.3 }} />
                  <View style={{ flex: 6.4, backgroundColor: '#00D984', opacity: 0.3 }} />
                  <View style={{ flex: 5, backgroundColor: '#FF8C42', opacity: 0.3 }} />
                  <View style={{ flex: 10, backgroundColor: '#FF4444', opacity: 0.3 }} />
                </View>
                <View style={{ position: 'relative', height: 12, marginBottom: 4 }}>
                  <View style={{ position: 'absolute', left: imcBarPos + '%', marginLeft: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: imcColor, borderWidth: 2, borderColor: '#1E2530' }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#6B7280', fontSize: 8 }}>15</Text>
                  <Text style={{ color: '#6B7280', fontSize: 8 }}>18.5</Text>
                  <Text style={{ color: '#6B7280', fontSize: 8 }}>25</Text>
                  <Text style={{ color: '#6B7280', fontSize: 8 }}>30</Text>
                  <Text style={{ color: '#6B7280', fontSize: 8 }}>40</Text>
                </View>
              </MetalCard>
            </View>
          )}

          <Pressable delayPressIn={120} onPress={function() { setShowEditProfile(true); }} style={{ marginHorizontal: wp(16), marginBottom: wp(20), paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.06)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)' }}><Text style={{ fontSize: fp(13), fontWeight: '600', color: '#00D984' }}>{t.editProfile}</Text></Pressable>

          <MetalCard style={{ marginHorizontal: wp(16), marginBottom: wp(16) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
              <Text style={{ fontSize: fp(16), marginRight: wp(6) }}>💧</Text>
              <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', letterSpacing: 1.5 }}>OBJECTIF HYDRATATION</Text>
            </View>
            <Text style={{ fontSize: fp(12), color: '#8A8F98', marginBottom: wp(12) }}>Recommande : 2.5L (H) / 2.0L (F)</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <ProfileScrollPicker values={hydroValues} selectedValue={currentHydroL} onSelect={function(val) { trySetHydroGoal(val); }} unit="L" color="#4DA6FF" height={140} />
              </View>
              <View style={{ marginLeft: wp(16), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(28), fontWeight: '800', color: '#00D984' }}>{currentHydroL.toFixed(1)}</Text>
                <Text style={{ fontSize: fp(14), color: '#8A8F98' }}>L</Text>
                {currentHydroL === defaultHydroGoalL ? (
                  <View style={{ marginTop: wp(6), backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                    <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#00D984' }}>Recommande</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={{ fontSize: fp(12), marginTop: wp(10), color: currentHydroL === defaultHydroGoalL ? '#8A8F98' : currentHydroL < defaultHydroGoalL ? '#FF8C42' : '#4DA6FF' }}>
              {currentHydroL === defaultHydroGoalL ? 'Base sur les recommandations EFSA' : currentHydroL < defaultHydroGoalL ? 'Inferieur aux recommandations standards' : 'Superieur aux recommandations standards'}
            </Text>
          </MetalCard>

          <Modal visible={showEditProfile} transparent={true} animationType="slide" onRequestClose={function() { setShowEditProfile(false); }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <Pressable onPress={function() { setShowEditProfile(false); }} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                <Pressable onPress={function() {}} style={{ backgroundColor: '#1A2029', borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), maxHeight: '90%', paddingTop: wp(12), paddingHorizontal: wp(20), paddingBottom: wp(20) }}>
                  <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: '#3A3F46', alignSelf: 'center', marginBottom: wp(16) }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: wp(20) }}>
                    <View style={{ flex: 1, paddingRight: wp(12) }}>
                      <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Modifier mon profil</Text>
                      <Text style={{ fontSize: fp(11), color: '#6B7280', marginTop: wp(4) }}>Vos donnees sont privees et chiffrees</Text>
                    </View>
                    <Pressable onPress={function() { setShowEditProfile(false); }} style={{ width: wp(32), height: wp(32), borderRadius: wp(16), backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' }}>
                      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
                        <Path d="M6 6L18 18M18 6L6 18" stroke="#FFF" strokeWidth={1.5} strokeLinecap="round" />
                      </Svg>
                    </Pressable>
                  </View>

                  <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ maxHeight: wp(460) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: wp(12), textTransform: 'uppercase' }}>Identite</Text>

                    <View style={{ marginBottom: wp(16) }}>
                      <Text style={{ fontSize: fp(10), color: focusedField === 'name' ? '#00D984' : (nameEmpty ? '#FF3B5C' : '#6B7280'), marginBottom: wp(4), letterSpacing: 0.5 }}>
                        {lang === 'fr' ? 'Comment vous appeler' : 'How shall we call you'}
                      </Text>
                      <TextInput value={editName} onChangeText={setEditName} onFocus={function() { setFocusedField('name'); }} onBlur={function() { setFocusedField(null); }} autoCapitalize="words" placeholder={lang === 'fr' ? 'Malick, Maman, \u2600\ufe0f...' : 'John, Mom, \u2600\ufe0f...'} placeholderTextColor="#3A3F46" style={{ fontSize: fp(16), color: '#FFF', paddingVertical: wp(8), borderBottomWidth: 1, borderBottomColor: nameEmpty ? '#FF3B5C' : (focusedField === 'name' ? '#00D984' : '#3A3F46') }} />
                      <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 4, marginBottom: 12 }}>
                        {lang === 'fr' ? 'Visible uniquement par vous' : 'Only visible to you'}
                      </Text>
                    </View>

                    <View style={{ marginBottom: wp(16) }}>
                      <Text style={{ fontSize: fp(10), color: focusedField === 'age' ? '#00D984' : (ageInvalid ? '#FF3B5C' : '#6B7280'), marginBottom: wp(4), letterSpacing: 0.5 }}>Age</Text>
                      <TextInput value={editAge} onChangeText={setEditAge} onFocus={function() { setFocusedField('age'); }} onBlur={function() { setFocusedField(null); }} keyboardType="numeric" maxLength={3} placeholder="--" placeholderTextColor="#3A3F46" style={{ fontSize: fp(16), color: '#FFF', paddingVertical: wp(8), borderBottomWidth: 1, borderBottomColor: ageInvalid ? '#FF3B5C' : (focusedField === 'age' ? '#00D984' : '#3A3F46') }} />
                      {ageInvalid ? <Text style={{ fontSize: fp(11), color: '#FF3B5C', marginTop: wp(4) }}>Doit etre entre 1 et 120</Text> : null}
                    </View>

                    <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: wp(12), marginTop: wp(8), textTransform: 'uppercase' }}>Corps</Text>

                    <View style={{ marginBottom: wp(16) }}>
                      <Text style={{ fontSize: fp(10), color: focusedField === 'weight' ? '#00D984' : (weightInvalid ? '#FF3B5C' : '#6B7280'), marginBottom: wp(4), letterSpacing: 0.5 }}>Poids (kg)</Text>
                      <TextInput ref={weightInputRef} value={editWeight} onChangeText={setEditWeight} onFocus={function() { setFocusedField('weight'); }} onBlur={function() { setFocusedField(null); }} keyboardType="decimal-pad" maxLength={5} placeholder="--" placeholderTextColor="#3A3F46" style={{ fontSize: fp(16), color: '#FFF', paddingVertical: wp(8), borderBottomWidth: 1, borderBottomColor: weightInvalid ? '#FF3B5C' : (focusedField === 'weight' ? '#00D984' : '#3A3F46') }} />
                      {weightInvalid ? <Text style={{ fontSize: fp(11), color: '#FF3B5C', marginTop: wp(4) }}>Doit etre entre 20 et 500 kg</Text> : null}
                    </View>

                    <View style={{ marginBottom: wp(16) }}>
                      <Text style={{ fontSize: fp(10), color: focusedField === 'height' ? '#00D984' : (heightInvalid ? '#FF3B5C' : '#6B7280'), marginBottom: wp(4), letterSpacing: 0.5 }}>Taille (cm)</Text>
                      <TextInput value={editHeight} onChangeText={setEditHeight} onFocus={function() { setFocusedField('height'); }} onBlur={function() { setFocusedField(null); }} keyboardType="numeric" maxLength={3} placeholder="--" placeholderTextColor="#3A3F46" style={{ fontSize: fp(16), color: '#FFF', paddingVertical: wp(8), borderBottomWidth: 1, borderBottomColor: heightInvalid ? '#FF3B5C' : (focusedField === 'height' ? '#00D984' : '#3A3F46') }} />
                      {heightInvalid ? <Text style={{ fontSize: fp(11), color: '#FF3B5C', marginTop: wp(4) }}>Doit etre entre 50 et 250 cm</Text> : null}
                    </View>

                    <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginBottom: wp(12), marginTop: wp(8), textTransform: 'uppercase' }}>Localisation</Text>

                    <View style={{ marginBottom: wp(16) }}>
                      <Text style={{ fontSize: fp(10), color: focusedField === 'location' ? '#00D984' : '#6B7280', marginBottom: wp(4), letterSpacing: 0.5 }}>Ville</Text>
                      <TextInput value={editLocation} onChangeText={setEditLocation} onFocus={function() { setFocusedField('location'); }} onBlur={function() { setFocusedField(null); }} autoCapitalize="words" placeholder="Votre ville" placeholderTextColor="#3A3F46" style={{ fontSize: fp(16), color: '#FFF', paddingVertical: wp(8), borderBottomWidth: 1, borderBottomColor: focusedField === 'location' ? '#00D984' : '#3A3F46' }} />
                    </View>
                  </ScrollView>

                  <View style={{ flexDirection: 'row', gap: wp(12), marginTop: wp(12), paddingTop: wp(12), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)' }}>
                    <Pressable onPress={function() { setShowEditProfile(false); }} style={{ flex: 1, height: wp(48), borderWidth: 1, borderColor: '#3A3F46', borderRadius: wp(12), justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Annuler</Text>
                    </Pressable>
                    <Pressable disabled={!canSave} onPress={function() { if (canSave) saveProfile(); }} style={{ flex: 1.2, height: wp(52), backgroundColor: '#00D984', borderRadius: wp(12), justifyContent: 'center', alignItems: 'center', opacity: canSave ? 1 : 0.5 }}>
                      <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#000' }}>Enregistrer</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Pressable>
            </KeyboardAvoidingView>
          </Modal>

          <Modal visible={showMedicalWarning} transparent animationType="fade" onRequestClose={function() { setShowMedicalWarning(false); setPendingHydroGoal(null); }}>
            <Pressable onPress={function() { setShowMedicalWarning(false); setPendingHydroGoal(null); }} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20) }}>
              <Pressable onPress={function() {}} style={{ width: '100%', maxWidth: 320, borderRadius: 20, padding: 24, overflow: 'hidden' }}>
                <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 20 }} />
                <View style={{ alignItems: 'center' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,68,68,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(24), color: '#FF4444' }}>⚕</Text>
                  </View>
                  <Text style={{ color: '#FFF', fontSize: fp(18), fontWeight: '800', textAlign: 'center', marginTop: 16 }}>Avertissement medical</Text>
                  <Text style={{ color: '#C0C4CC', fontSize: fp(14), lineHeight: fp(22), textAlign: 'center', marginTop: 12 }}>
                    {pendingHydroGoal !== null && pendingHydroGoal < 1.5
                      ? 'Un objectif inferieur a 1.5L est generalement prescrit pour des conditions medicales specifiques (insuffisance cardiaque, insuffisance renale). Consultez votre medecin avant de modifier cet objectif.'
                      : 'Un apport superieur a 3.5L par jour peut entrainer une hyponatremie (baisse dangereuse du sodium sanguin). Consultez votre medecin.'}
                  </Text>
                  <Text style={{ color: '#666', fontSize: fp(10), fontStyle: 'italic', marginTop: 8 }}>Sources : EFSA 2010, NIH StatPearls 2025</Text>
                  <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
                    <Pressable delayPressIn={120} onPress={function() { setShowMedicalWarning(false); setPendingHydroGoal(null); }} style={{ flex: 1, borderWidth: 1, borderColor: '#4A4F55', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
                      <Text style={{ color: '#8A8F98', fontSize: fp(14), fontWeight: '600' }}>Annuler</Text>
                    </Pressable>
                    <Pressable delayPressIn={120} onPress={confirmMedicalWarning} style={{ flex: 1, backgroundColor: '#00D984', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginLeft: 12 }}>
                      <Text style={{ color: '#000', fontSize: fp(14), fontWeight: '700' }}>Je confirme</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </Pressable>
          </Modal>

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
