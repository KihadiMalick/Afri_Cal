import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Dimensions, PixelRatio, StatusBar, Alert, Modal, TextInput, Image } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const W = SCREEN_WIDTH;
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => Math.round(PixelRatio.roundToNearestPixel((W / BASE_WIDTH) * size));

const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// ═══ CONNECTEURS ═══
const CONNECTORS = [
  { id: 'apple_health', name: 'Apple Health', emoji: '\uD83C\uDF4E', color: '#FF3B30',
    dataFr: 'Pas \u00b7 Cardio \u00b7 Sommeil \u00b7 Activit\u00e9s', dataEn: 'Steps \u00b7 Heart rate \u00b7 Sleep \u00b7 Activities' },
  { id: 'samsung_health', name: 'Samsung Health', emoji: '\uD83D\uDC99', color: '#1428A0',
    dataFr: 'Pas \u00b7 Cardio \u00b7 Sommeil \u00b7 Activit\u00e9s', dataEn: 'Steps \u00b7 Heart rate \u00b7 Sleep \u00b7 Activities' },
  { id: 'fitbit', name: 'Fitbit', emoji: '\u231A', color: '#00B0B9',
    dataFr: 'Pas \u00b7 Sommeil \u00b7 Cardio', dataEn: 'Steps \u00b7 Sleep \u00b7 Heart rate' },
  { id: 'strava', name: 'Strava', emoji: '\uD83C\uDFC3', color: '#FC4C02',
    dataFr: 'Course \u00b7 V\u00e9lo \u00b7 Distance \u00b7 GPS', dataEn: 'Running \u00b7 Cycling \u00b7 Distance \u00b7 GPS' },
];

// Mifflin-St Jeor — Source : American Dietetic Association (2005)
var ACTIVITY_MULTIPLIERS_MAP = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extreme: 1.9,
};

var ACTIVITY_LEVEL_KEYS = ['sedentary', 'light', 'moderate', 'active', 'extreme'];

function activityLevelToIndex(level) {
  var idx = ACTIVITY_LEVEL_KEYS.indexOf(level);
  return idx >= 0 ? idx : 2;
}

function activityIndexToKey(index) {
  return ACTIVITY_LEVEL_KEYS[index] || 'moderate';
}

function calculateBMR(weight, height, age, gender) {
  if (!weight || !height || !age) return 0;
  var w = parseFloat(weight) || 70;
  var h = parseFloat(height) || 175;
  var a = parseInt(age) || 25;
  if (gender === 'female') {
    return Math.round(10 * w + 6.25 * h - 5 * a - 161);
  }
  return Math.round(10 * w + 6.25 * h - 5 * a + 5);
}

function calculateTDEE(bmr, activityLevel) {
  var mult = ACTIVITY_MULTIPLIERS_MAP[activityLevel] || 1.55;
  return Math.round(bmr * mult);
}

function calculateDailyTarget(tdee, goal, targetWeightLoss, targetMonths) {
  if (goal === 'maintain' || !goal) return tdee;
  var totalKcal = (targetWeightLoss || 5) * 7700;
  var days = Math.max(30, (targetMonths || 3) * 30);
  var dailyDelta = Math.min(1000, Math.round(totalKcal / days));
  if (goal === 'lose') return tdee - dailyDelta;
  if (goal === 'gain') return tdee + dailyDelta;
  return tdee;
}

// ScrollPicker
var ProfileScrollPicker = function(pickerProps) {
  var values = pickerProps.values;
  var selectedValue = pickerProps.selectedValue;
  var onSelect = pickerProps.onSelect;
  var unit = pickerProps.unit;
  var color = pickerProps.color || '#00D984';
  var pickerHeight = pickerProps.height || 160;
  var ITEM_H = 40;
  var scrollRef = useRef(null);
  var initialIdx = Math.max(0, values.indexOf(selectedValue));

  useEffect(function() {
    var timer = setTimeout(function() {
      if (scrollRef.current) scrollRef.current.scrollTo({ y: initialIdx * ITEM_H, animated: false });
    }, 150);
    return function() { clearTimeout(timer); };
  }, []);

  var snapToNearest = useCallback(function(event) {
    var y = event.nativeEvent.contentOffset.y;
    var idx = Math.round(y / ITEM_H);
    var clamped = Math.max(0, Math.min(idx, values.length - 1));
    if (values[clamped] !== selectedValue) onSelect(values[clamped]);
  }, [values, selectedValue, onSelect]);

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
        {values.map(function(val, i) {
          var isSel = val === selectedValue;
          return (
            <View key={val + '-' + i} style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: isSel ? color : 'rgba(255,255,255,0.15)', fontSize: isSel ? fp(18) : fp(12), fontWeight: isSel ? '800' : '400' }}>
                {isSel ? val + ' ' + unit : String(val)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default function ProfilePage() {
  var _profile = useState(null), profile = _profile[0], setProfile = _profile[1];
  var _lixBalance = useState(0), lixBalance = _lixBalance[0], setLixBalance = _lixBalance[1];
  var _ownedCharacters = useState(0), ownedCharacters = _ownedCharacters[0], setOwnedCharacters = _ownedCharacters[1];
  var _userXP = useState({ user_xp: 0, user_level: 1, xp_progress: 0, xp_needed: 80, xp_percent: 0 }), userXP = _userXP[0], setUserXP = _userXP[1];
  var _activeCharSlug = useState(null), activeCharSlug = _activeCharSlug[0], setActiveCharSlug = _activeCharSlug[1];
  var _activeCharName = useState(null), activeCharName = _activeCharName[0], setActiveCharName = _activeCharName[1];
  var _userEnergy = useState(20), userEnergy = _userEnergy[0], setUserEnergy = _userEnergy[1];
  var _showEditProfile = useState(false), showEditProfile = _showEditProfile[0], setShowEditProfile = _showEditProfile[1];
  var _showLocationPicker = useState(false), showLocationPicker = _showLocationPicker[0], setShowLocationPicker = _showLocationPicker[1];
  var _showGlossary = useState(false), showGlossary = _showGlossary[0], setShowGlossary = _showGlossary[1];
  var _showFeatures = useState(false), showFeatures = _showFeatures[0], setShowFeatures = _showFeatures[1];
  var _showSubscription = useState(false), showSubscription = _showSubscription[0], setShowSubscription = _showSubscription[1];
  var _showPrivacy = useState(false), showPrivacy = _showPrivacy[0], setShowPrivacy = _showPrivacy[1];
  var _showTerms = useState(false), showTerms = _showTerms[0], setShowTerms = _showTerms[1];
  var _editName = useState(''), editName = _editName[0], setEditName = _editName[1];
  var _editAge = useState(''), editAge = _editAge[0], setEditAge = _editAge[1];
  var _editWeight = useState(''), editWeight = _editWeight[0], setEditWeight = _editWeight[1];
  var _editHeight = useState(''), editHeight = _editHeight[0], setEditHeight = _editHeight[1];
  var _editLocation = useState(''), editLocation = _editLocation[0], setEditLocation = _editLocation[1];
  var _lang = useState('fr'), lang = _lang[0], setLang = _lang[1];
  var _connectedApps = useState({}), connectedApps = _connectedApps[0], setConnectedApps = _connectedApps[1];
  var _showMilestones = useState(false), showMilestones = _showMilestones[0], setShowMilestones = _showMilestones[1];

  var T = {
    fr: {
      personalData: 'DONN\u00c9ES PERSONNELLES', age: '\u00c2ge', weight: 'Poids', height: 'Taille', bmi: 'IMC',
      years: 'ans', kg: 'kg', cm: 'cm', editProfile: 'Modifier mon profil',
      settings: 'PARAM\u00c8TRES', connectors: 'CONNECTEURS',
      location: 'Ma localisation', locationSub: 'Pour les recommandations ALIXEN',
      subscription: 'Mon abonnement', subscriptionSub: 'G\u00e9rer, changer ou r\u00e9silier',
      notifications: 'Notifications', notifSub: 'Rappels m\u00e9dicaments, analyses',
      learn: 'APPRENDRE', glossary: 'Comprendre les termes', glossarySub: 'BMR, TDEE, Macros, IMC...',
      guide: 'Guide LIXUM', guideSub: 'Toutes les fonctionnalit\u00e9s',
      legal: 'L\u00c9GAL & SUPPORT', privacy: 'Politique de confidentialit\u00e9', terms: 'Termes et conditions',
      contact: 'Nous contacter', rate: '\u00c9valuer LIXUM', logout: 'Se d\u00e9connecter',
      deleteAccount: 'Supprimer mon compte', logoutConfirm: 'Es-tu s\u00fbr ?',
      deleteConfirm: 'Action irr\u00e9versible.', cancel: 'Annuler', notDefined: 'Non d\u00e9finie',
      free: 'Gratuit', objective: 'Objectif', madeWith: 'Fait avec \u2764\uFE0F au Burundi',
      connected: 'Connect\u00e9', connect: 'Connecter', disconnect: 'D\u00e9connecter',
      comingSoon: 'Bient\u00f4t', lastSync: 'Derni\u00e8re sync',
      connectorsDesc: 'Synchronisez vos montres et apps de sant\u00e9',
    },
    en: {
      personalData: 'PERSONAL DATA', age: 'Age', weight: 'Weight', height: 'Height', bmi: 'BMI',
      years: 'yrs', kg: 'kg', cm: 'cm', editProfile: 'Edit my profile',
      settings: 'SETTINGS', connectors: 'CONNECTORS',
      location: 'My location', locationSub: 'For ALIXEN recommendations',
      subscription: 'My subscription', subscriptionSub: 'Manage, change or cancel',
      notifications: 'Notifications', notifSub: 'Medication, test reminders',
      learn: 'LEARN', glossary: 'Understand the terms', glossarySub: 'BMR, TDEE, Macros, BMI...',
      guide: 'LIXUM Guide', guideSub: 'All features',
      legal: 'LEGAL & SUPPORT', privacy: 'Privacy policy', terms: 'Terms and conditions',
      contact: 'Contact us', rate: 'Rate LIXUM', logout: 'Log out',
      deleteAccount: 'Delete my account', logoutConfirm: 'Are you sure?',
      deleteConfirm: 'This action is irreversible.', cancel: 'Cancel', notDefined: 'Not set',
      free: 'Free', objective: 'Goal', madeWith: 'Made with \u2764\uFE0F in Burundi',
      connected: 'Connected', connect: 'Connect', disconnect: 'Disconnect',
      comingSoon: 'Soon', lastSync: 'Last sync', syncNow: 'Sync',
      connectorsDesc: 'Sync your watches and health apps',
    },
  };
  var t = T[lang] || T.fr;

  var XP_MILESTONES = [
    { level: 10,  lix: 500,    energy: 20,  reward: '1 carte Rare',       rewardEn: '1 Rare card',        emoji: '🃏', color: '#4DA6FF' },
    { level: 25,  lix: 1500,   energy: 50,  reward: '1 carte Elite',      rewardEn: '1 Elite card',       emoji: '🎴', color: '#A855F7' },
    { level: 50,  lix: 5000,   energy: 100, reward: '1 carte Mythique',   rewardEn: '1 Mythic card',      emoji: '🌟', color: '#D4AF37' },
    { level: 75,  lix: 10000,  energy: 200, reward: '5 frags Mythique',   rewardEn: '5 Mythic frags',     emoji: '💎', color: '#FF6B8A' },
    { level: 100, lix: 25000,  energy: 500, reward: 'Badge Légendaire',   rewardEn: 'Legendary Badge',    emoji: '👑', color: '#FFD700' },
  ];

  var getNextMilestone = function(currentLevel) {
    for (var i = 0; i < XP_MILESTONES.length; i++) {
      if (XP_MILESTONES[i].level > currentLevel) return XP_MILESTONES[i];
    }
    return null;
  };

  var getXPForLevel = function(level) {
    var total = 0;
    for (var n = 1; n < level; n++) {
      total += Math.round(30 + n * 50);
    }
    return total;
  };

  var _toast = useState(null), toast = _toast[0], setToast = _toast[1];

  var showToast = function(message, color) {
    setToast({ message: message, color: color || '#00D984' });
    setTimeout(function() { setToast(null); }, 2500);
  };
  var hdrs = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };

  useEffect(function() { loadProfile(); }, []);

  var loadProfile = function() {
    Promise.all([
      fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID + '&select=*', { headers: hdrs }),
      fetch(SUPABASE_URL + '/rest/v1/lixverse_user_characters?user_id=eq.' + TEST_USER_ID + '&select=character_slug,is_active,level', { headers: hdrs }),
    ]).then(function(responses) {
      return Promise.all(responses.map(function(r) { return r.json(); }));
    }).then(function(results) {
      var pD = results[0]; var cD = results[1];
      if (pD && pD[0]) { setProfile(pD[0]); setLixBalance(pD[0].lix_balance || 0); setUserEnergy(pD[0].energy || 20); setEditName(pD[0].full_name || ''); setEditAge(String(pD[0].age || '')); setEditWeight(String(pD[0].weight || '')); setEditHeight(String(pD[0].height || '')); if (pD[0].language === 'EN') setLang('en'); else setLang('fr'); }
      if (Array.isArray(cD)) { setOwnedCharacters(cD.length); var activeC = cD.find(function(c) { return c.is_active; }); if (activeC) setActiveCharSlug(activeC.character_slug); }
      // XP
      fetch(SUPABASE_URL + '/rest/v1/rpc/get_user_xp', { method: 'POST', headers: Object.assign({}, hdrs, { 'Content-Type': 'application/json' }), body: JSON.stringify({ p_user_id: TEST_USER_ID }) })
        .then(function(r) { return r.json(); }).then(function(d) { if (d) setUserXP(d); }).catch(function() {});
    }).catch(function(e) { console.error('Profile:', e); });
  };

  var saveProfile = function() {
    var h = Object.assign({}, hdrs, { 'Content-Type': 'application/json', 'Prefer': 'return=representation' });

    var currentGender = profile ? profile.gender || 'male' : 'male';
    var currentActivityLevel = profile ? profile.activity_level : 'moderate';
    if (typeof currentActivityLevel === 'number') currentActivityLevel = activityIndexToKey(currentActivityLevel);
    var currentDiet = profile ? (profile.dietary_regime || profile.diet || 'classic') : 'classic';
    var currentGoal = profile ? profile.goal || 'maintain' : 'maintain';

    var newBMR = calculateBMR(editWeight, editHeight, editAge, currentGender);
    var newTDEE = calculateTDEE(newBMR, currentActivityLevel);
    var newTarget = calculateDailyTarget(newTDEE, currentGoal, profile ? profile.target_weight_loss : 0, profile ? profile.target_months : 3);

    var body = {
      full_name: editName.trim(),
      age: parseInt(editAge) || null,
      weight: parseFloat(editWeight) || null,
      height: parseFloat(editHeight) || null,
      gender: currentGender,
      activity_level: currentActivityLevel,
      dietary_regime: currentDiet,
      goal: currentGoal,
      bmr: newBMR,
      tdee: newTDEE,
      daily_calorie_target: newTarget,
      language: lang === 'en' ? 'EN' : 'FR',
    };

    fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID, { method: 'PATCH', headers: h, body: JSON.stringify(body) })
      .then(function(r) { return r.json(); }).then(function(data) {
        if (data && data[0]) { setProfile(data[0]); setLixBalance(data[0].lix_balance || 0); }
        setShowEditProfile(false);
        showToast(lang === 'fr' ? 'Profil mis \u00e0 jour \u2713' : 'Profile updated \u2713', '#00D984');
      }).catch(function() {
        showToast(lang === 'fr' ? 'Erreur de sauvegarde' : 'Save error', '#FF6B6B');
      });
  };

  var saveLocation = function(city) { setEditLocation(city); setShowLocationPicker(false); showToast('\uD83D\uDCCD ' + city + ' enregistr\u00e9e', '#FF8C42'); };

  var toggleConnector = function(connId) {
    setConnectedApps(function(prev) {
      var n = Object.assign({}, prev);
      if (n[connId]) { delete n[connId]; showToast(lang === 'fr' ? 'D\u00e9connect\u00e9' : 'Disconnected', '#FF6B6B'); }
      else { n[connId] = { connectedAt: new Date().toISOString(), lastSync: new Date().toISOString() }; showToast(lang === 'fr' ? 'Connect\u00e9 \u2713' : 'Connected \u2713', '#00D984'); }
      return n;
    });
  };

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

  var imc = profile ? (profile.weight / ((profile.height / 100) * (profile.height / 100))).toFixed(1) : '\u2014';
  var imcColor = imc < 18.5 ? '#FF8C42' : imc < 25 ? '#00D984' : imc < 30 ? '#FF8C42' : '#FF6B6B';
  var subTier = profile && profile.is_premium ? 'Gold' : 'Gratuit';
  var subColor = profile && profile.is_premium ? '#D4AF37' : 'rgba(255,255,255,0.3)';

  var getCharEmoji = function(slug) {
    var map = { 'emerald_owl': '\uD83E\uDD89', 'hawk_eye': '\uD83E\uDD85', 'ruby_tiger': '\uD83D\uDC2F', 'amber_fox': '\uD83E\uDD8A', 'gipsy': '\uD83D\uDD77\uFE0F' };
    return map[slug] || null;
  };

  var avatarEmoji = getCharEmoji(activeCharSlug);
  var avatarInitial = (profile && profile.full_name ? profile.full_name : 'U').charAt(0).toUpperCase();
  var avatarColor = activeCharSlug ? '#00D984' : '#4DA6FF';

  var ACTIVITY_LEVELS = [
    { label: 'S\u00e9dentaire', desc: 'Peu ou pas d\'exercice', emoji: '\uD83D\uDECB\uFE0F' },
    { label: 'L\u00e9g\u00e8rement actif', desc: '1-2 fois/semaine', emoji: '\uD83D\uDEB6\u200D\u2642\uFE0F' },
    { label: 'Mod\u00e9r\u00e9ment actif', desc: '3-5 fois/semaine', emoji: '\uD83D\uDEB4\u200D\u2642\uFE0F' },
    { label: 'Tr\u00e8s actif', desc: '6-7 fois/semaine', emoji: '\uD83C\uDFCB\uFE0F\u200D\u2642\uFE0F' },
    { label: 'Extr\u00eamement actif', desc: 'Athl\u00e8te / travail physique', emoji: '\uD83D\uDD25' },
  ];
  var DIETS = [
    { key: 'classic', label: 'Classique', emoji: '\uD83C\uDF57', color: '#00D984' },
    { key: 'vegetarian', label: 'V\u00e9g\u00e9tarien', emoji: '\uD83E\uDD6C', color: '#00BFA6' },
    { key: 'vegan', label: 'V\u00e9gan', emoji: '\uD83C\uDF31', color: '#00D984' },
    { key: 'keto', label: 'K\u00e9to', emoji: '\uD83E\uDD51', color: '#D4AF37' },
    { key: 'halal', label: 'Halal', emoji: '\uD83C\uDF19', color: '#00BFA6' },
  ];
  var GOALS = [
    { key: 'lose', label: 'Perte de poids', emoji: '\uD83D\uDCC9', color: '#00BFA6' },
    { key: 'maintain', label: 'Maintien', emoji: '\u2696\uFE0F', color: '#00D984' },
    { key: 'gain', label: 'Prise de masse', emoji: '\uD83D\uDCC8', color: '#D4AF37' },
  ];

  // ═══ RENDER CONNECTEUR CARD ═══
  var renderConnectorCard = function(conn, i) {
    var isConnected = !!connectedApps[conn.id];
    var dataText = lang === 'fr' ? conn.dataFr : conn.dataEn;

    return (
      <View key={conn.id} style={{
        flexDirection: 'row', alignItems: 'center', paddingVertical: wp(12), paddingHorizontal: wp(14),
        backgroundColor: isConnected ? conn.color + '08' : 'transparent',
        borderBottomWidth: i < CONNECTORS.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)',
      }}>
        <View style={{
          width: wp(40), height: wp(40), borderRadius: wp(10),
          backgroundColor: conn.color + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
          borderWidth: isConnected ? 1.5 : 0, borderColor: isConnected ? conn.color + '40' : 'transparent',
        }}>
          <Text style={{ fontSize: fp(18) }}>{conn.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
            <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{conn.name}</Text>
            {isConnected && <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), backgroundColor: '#00D984' }} />}
          </View>
          <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginTop: wp(2) }}>{dataText}</Text>
          {isConnected && connectedApps[conn.id] && connectedApps[conn.id].lastSync && (
            <Text style={{ fontSize: fp(8), color: conn.color, marginTop: wp(2) }}>
              {t.lastSync} : {new Date(connectedApps[conn.id].lastSync).toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
        <Pressable delayPressIn={120} onPress={function() { toggleConnector(conn.id); }}
          style={function(s) { return {
            paddingHorizontal: wp(12), paddingVertical: wp(7), borderRadius: wp(8),
            backgroundColor: isConnected ? 'rgba(255,107,107,0.08)' : conn.color + '15',
            borderWidth: 1, borderColor: isConnected ? 'rgba(255,107,107,0.2)' : conn.color + '30',
            transform: [{ scale: s.pressed ? 0.92 : 1 }],
          }; }}>
          <Text style={{ fontSize: fp(10), fontWeight: '700', color: isConnected ? '#FF6B6B' : conn.color }}>
            {isConnected ? t.disconnect : t.connect}
          </Text>
        </Pressable>
      </View>
    );
  };

  var renderModals = function() {
    return (
      <View>
        {/* Modal \u00c9diter Profil */}
        <Modal visible={showEditProfile} transparent animationType="fade" onRequestClose={function() { setShowEditProfile(false); }}>
          <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
            <StatusBar barStyle="light-content" backgroundColor="#1A1D22" />
            <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#00D984', marginBottom: wp(20) }}>{t.editProfile}</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(4) }}>Nom complet</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(10), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(12) }}>
                <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(10) }} value={editName} onChangeText={setEditName} placeholder="Pr\u00e9nom Nom" placeholderTextColor="rgba(255,255,255,0.2)" />
              </View>
              <View style={{ flexDirection: 'row', gap: wp(6), marginBottom: wp(16), height: wp(160) }}>
                <View style={{ flex: 1 }}><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', marginBottom: wp(4), textAlign: 'center', fontWeight: '700', letterSpacing: 1.5 }}>POIDS</Text><ProfileScrollPicker values={Array.from({ length: 171 }, function(_, i) { return 30 + i; })} selectedValue={parseInt(editWeight) || 70} onSelect={function(v) { setEditWeight(String(v)); }} unit="kg" color="#00D984" height={wp(130)} /></View>
                <View style={{ flex: 1 }}><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', marginBottom: wp(4), textAlign: 'center', fontWeight: '700', letterSpacing: 1.5 }}>TAILLE</Text><ProfileScrollPicker values={Array.from({ length: 101 }, function(_, i) { return 120 + i; })} selectedValue={parseInt(editHeight) || 175} onSelect={function(v) { setEditHeight(String(v)); }} unit="cm" color="#00BFA6" height={wp(130)} /></View>
                <View style={{ flex: 0.8 }}><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', marginBottom: wp(4), textAlign: 'center', fontWeight: '700', letterSpacing: 1.5 }}>\u00c2GE</Text><ProfileScrollPicker values={Array.from({ length: 84 }, function(_, i) { return 12 + i; })} selectedValue={parseInt(editAge) || 25} onSelect={function(v) { setEditAge(String(v)); }} unit="ans" color="#D4AF37" height={wp(130)} /></View>
              </View>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8) }}>Sexe</Text>
              <View style={{ flexDirection: 'row', gap: wp(10), marginBottom: wp(16) }}>
                {[{ key: 'male', label: 'Homme', emoji: '\u2642\uFE0F', color: '#4A90D9' }, { key: 'female', label: 'Femme', emoji: '\u2640\uFE0F', color: '#E875A0' }].map(function(g) { var sel = (profile && profile.gender || 'male') === g.key; return (
                  <Pressable key={g.key} onPress={function() { setProfile(function(p) { return p ? Object.assign({}, p, { gender: g.key }) : p; }); }} style={{ flex: 1, paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: sel ? g.color + '15' : 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: sel ? g.color + '40' : 'rgba(255,255,255,0.08)' }}>
                    <Text style={{ fontSize: fp(20) }}>{g.emoji}</Text>
                    <Text style={{ fontSize: fp(11), fontWeight: '600', color: sel ? g.color : 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>{g.label}</Text>
                  </Pressable>
                ); })}
              </View>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8) }}>Niveau d'activit\u00e9</Text>
              {ACTIVITY_LEVELS.map(function(lvl, i) { var sel = activityLevelToIndex(profile ? profile.activity_level : 'moderate') === i; return (
                <Pressable key={i} onPress={function() { setProfile(function(p) { return p ? Object.assign({}, p, { activity_level: activityIndexToKey(i) }) : p; }); }} style={function(s) { return { flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), paddingHorizontal: wp(12), borderRadius: wp(10), marginBottom: wp(6), backgroundColor: sel ? 'rgba(0,217,132,0.08)' : 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: sel ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.06)', transform: [{ scale: s.pressed ? 0.97 : 1 }] }; }}>
                  <Text style={{ fontSize: fp(20), marginRight: wp(10) }}>{lvl.emoji}</Text>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(12), fontWeight: '600', color: sel ? '#00D984' : '#FFF' }}>{lvl.label}</Text><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>{lvl.desc}</Text></View>
                  {sel ? <Text style={{ fontSize: fp(14), color: '#00D984' }}>{'\u2713'}</Text> : null}
                </Pressable>
              ); })}
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8), marginTop: wp(12) }}>R\u00e9gime alimentaire</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(6), marginBottom: wp(16) }}>
                {DIETS.map(function(d) { var sel = (profile && (profile.dietary_regime || profile.diet) || 'classic') === d.key; return (
                  <Pressable key={d.key} onPress={function() { setProfile(function(p) { return p ? Object.assign({}, p, { dietary_regime: d.key }) : p; }); }} style={{ paddingVertical: wp(8), paddingHorizontal: wp(12), borderRadius: wp(10), backgroundColor: sel ? d.color + '15' : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: sel ? d.color + '35' : 'rgba(255,255,255,0.06)' }}>
                    <Text style={{ fontSize: fp(11), color: sel ? d.color : 'rgba(255,255,255,0.4)' }}>{d.emoji} {d.label}</Text>
                  </Pressable>
                ); })}
              </View>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8) }}>Mon objectif</Text>
              <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(20) }}>
                {GOALS.map(function(g) { var sel = (profile && profile.goal || 'maintain') === g.key; return (
                  <Pressable key={g.key} onPress={function() { setProfile(function(p) { return p ? Object.assign({}, p, { goal: g.key }) : p; }); }} style={{ flex: 1, paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: sel ? g.color + '12' : 'rgba(255,255,255,0.03)', borderWidth: 1.5, borderColor: sel ? g.color + '40' : 'rgba(255,255,255,0.06)' }}>
                    <Text style={{ fontSize: fp(22) }}>{g.emoji}</Text>
                    <Text style={{ fontSize: fp(9), fontWeight: '600', color: sel ? g.color : 'rgba(255,255,255,0.4)', marginTop: wp(4), textAlign: 'center' }}>{g.label}</Text>
                  </Pressable>
                ); })}
              </View>
              {(function() {
                var currentActivityLevel = profile ? profile.activity_level : 'moderate';
                if (typeof currentActivityLevel === 'number') currentActivityLevel = activityIndexToKey(currentActivityLevel);
                var previewBMR = calculateBMR(editWeight, editHeight, editAge, profile ? profile.gender : 'male');
                var previewTDEE = calculateTDEE(previewBMR, currentActivityLevel);
                if (previewBMR > 0) {
                  return (
                    <View style={{ backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: wp(6) }}>
                        {lang === 'fr' ? 'CALCUL AUTOMATIQUE' : 'AUTO CALCULATION'}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: wp(20) }}>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#D4AF37' }}>{previewBMR}</Text>
                          <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.3)' }}>BMR kcal</Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#00D984' }}>{previewTDEE}</Text>
                          <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.3)' }}>TDEE kcal</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: fp(7), color: 'rgba(255,255,255,0.2)', marginTop: wp(6), textAlign: 'center' }}>
                        Mifflin-St Jeor (ADA, 2005)
                      </Text>
                    </View>
                  );
                }
                return null;
              })()}
              <Pressable delayPressIn={120} onPress={saveProfile} style={{ marginBottom: wp(8) }}><LinearGradient colors={['#00D984', '#00B871']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>{lang === 'fr' ? 'Enregistrer les modifications' : 'Save changes'}</Text></LinearGradient></Pressable>
              <Pressable onPress={function() { setShowEditProfile(false); }} style={{ paddingVertical: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text></Pressable>
            </ScrollView>
          </View>
        </Modal>

        {/* Modal Localisation */}
        <Modal visible={showLocationPicker} transparent animationType="fade" onRequestClose={function() { setShowLocationPicker(false); }}>
          <View style={{ flex: 1, backgroundColor: '#1A1D22', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20), paddingTop: Platform.OS === 'android' ? 35 : 50 }}>
            <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%' }}>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>Ma localisation</Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(16) }}>ALIXEN utilisera cette info pour recommander des lieux pr\u00e8s de toi.</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(10), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(16) }}>
                <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} value={editLocation} onChangeText={setEditLocation} placeholder="Ex : Bujumbura" placeholderTextColor="rgba(255,255,255,0.2)" />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(16) }}><View style={{ flexDirection: 'row', gap: wp(6) }}>
                {['Bujumbura', 'Kigali', 'Nairobi', 'Dakar', 'Abidjan', 'Kinshasa', 'Lagos', 'Douala', 'Paris', 'Bruxelles'].map(function(c) { return (
                  <Pressable key={c} onPress={function() { setEditLocation(c); }} style={{ paddingHorizontal: wp(12), paddingVertical: wp(6), borderRadius: wp(8), backgroundColor: editLocation === c ? '#00D984' : 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: editLocation === c ? '#00D984' : 'rgba(255,255,255,0.08)' }}><Text style={{ fontSize: fp(12), color: editLocation === c ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{c}</Text></Pressable>
                ); })}
              </View></ScrollView>
              <Pressable delayPressIn={120} onPress={function() { if (editLocation.trim()) saveLocation(editLocation.trim()); else showToast('Choisis une ville', '#FF8C42'); }}><LinearGradient colors={['#00D984', '#00B871']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Enregistrer</Text></LinearGradient></Pressable>
              <Pressable onPress={function() { setShowLocationPicker(false); }} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(4) }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text></Pressable>
            </LinearGradient>
          </View>
        </Modal>

        {/* Modal Glossaire */}
        <Modal visible={showGlossary} transparent animationType="fade" onRequestClose={function() { setShowGlossary(false); }}>
          <View style={{ flex: 1, backgroundColor: '#1A1D22' }}><StatusBar barStyle="light-content" backgroundColor="#1A1D22" />
            <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#00D984', marginBottom: wp(20) }}>Comprendre les termes</Text>
              {[{ t: 'BMR', d: 'Basal Metabolic Rate \u2014 Calories br\u00fbl\u00e9es au repos pour survivre.' },{ t: 'TDEE', d: 'Total Daily Energy Expenditure \u2014 Calories totales br\u00fbl\u00e9es par jour avec activit\u00e9.' },{ t: 'Prot\u00e9ines', d: 'Pour les muscles et os. Sources : viande, poisson, \u0153ufs, l\u00e9gumineuses.' },{ t: 'Glucides', d: 'Source d\'\u00e9nergie principale. Sources : riz, pain, manioc, plantain.' },{ t: 'Lipides', d: 'Graisses pour le cerveau et hormones. Sources : huile, avocat, noix.' },{ t: 'IMC', d: 'Indice de Masse Corporelle. Poids / Taille\u00b2. Normal : 18.5-24.9.' },{ t: 'Score Vitalit\u00e9', d: 'Score LIXUM 0-100 bas\u00e9 sur nutrition, hydratation, activit\u00e9, mood et suivi m\u00e9dical.' },{ t: 'Lix', d: 'Monnaie virtuelle LIXUM. 1$ = 1000 Lix. Recharge \u00e9nergie, ouvre caisses.' },{ t: 'XP Utilisateur', d: 'Points d\'exp\u00e9rience gagn\u00e9s via scans (+10), activit\u00e9s (+calories), humeur (+5).' },{ t: '\u00c9nergie', d: '20 gratuite/jour pour tous. Alimente ALIXEN, scans, caract\u00e8res.' },{ t: 'Xscan', d: 'Scanner un plat avec la cam\u00e9ra pour calories et macros via IA.' }].map(function(g, i) { return (
                <View key={i} style={{ marginBottom: wp(14), backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12), padding: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#00D984', marginBottom: wp(4) }}>{g.t}</Text>
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', lineHeight: fp(18) }}>{g.d}</Text>
                </View>
              ); })}
              <Pressable onPress={function() { setShowGlossary(false); }} style={{ paddingVertical: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#00D984' }}>Fermer</Text></Pressable>
            </ScrollView>
          </View>
        </Modal>

        {/* Modal Guide */}
        <Modal visible={showFeatures} transparent animationType="fade" onRequestClose={function() { setShowFeatures(false); }}>
          <View style={{ flex: 1, backgroundColor: '#1A1D22' }}><StatusBar barStyle="light-content" backgroundColor="#1A1D22" />
            <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#4DA6FF', marginBottom: wp(20) }}>Guide LIXUM</Text>
              {[{ i: '\uD83C\uDFE0', n: 'Dashboard', d: 'Vue d\'ensemble : calories, hydratation, vitalit\u00e9, humeur.' },{ i: '\uD83C\uDF7D', n: 'Repas', d: 'Scan photo ou saisie manuelle. Suivi macros temps r\u00e9el.' },{ i: '\uD83C\uDFC3', n: 'Activit\u00e9', d: 'Marche et course avec distance, dur\u00e9e, calories.' },{ i: '\uD83E\uDD16', n: 'ALIXEN', d: 'Coach sant\u00e9 IA. Nutrition, m\u00e9dicaments, recommandations.' },{ i: '\uD83D\uDCCB', n: 'MediBook', d: 'Dossier m\u00e9dical : m\u00e9dicaments, analyses, allergies.' },{ i: '\uD83D\uDD12', n: 'Secret Pocket', d: 'Coffre-fort s\u00e9curis\u00e9 pour documents sant\u00e9.' },{ i: '\uD83C\uDFC6', n: 'LixVerse', d: 'D\u00e9fis, groupes, Wall of Health, caract\u00e8res, Spin.' },{ i: '\uD83C\uDFB0', n: 'Spin Wheel', d: 'Tourne la roue pour Lix, \u00e9nergie ou caisses.' },{ i: '\uD83C\uDCCF', n: 'Caract\u00e8res', d: '16 cartes \u00e0 collectionner avec pouvoirs et bonus.' }].map(function(f, i) { return (
                <View key={i} style={{ flexDirection: 'row', marginBottom: wp(12), backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12), padding: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ fontSize: fp(28), marginRight: wp(12) }}>{f.i}</Text>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>{f.n}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.45)', lineHeight: fp(16) }}>{f.d}</Text></View>
                </View>
              ); })}
              <Pressable onPress={function() { setShowFeatures(false); }} style={{ paddingVertical: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#4DA6FF' }}>Fermer</Text></Pressable>
            </ScrollView>
          </View>
        </Modal>

        {/* Modal Abonnement */}
        <Modal visible={showSubscription} transparent animationType="fade" onRequestClose={function() { setShowSubscription(false); }}>
          <View style={{ flex: 1, backgroundColor: '#1A1D22' }}><StatusBar barStyle="light-content" backgroundColor="#1A1D22" />
            <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#D4AF37', marginBottom: wp(16) }}>Mon abonnement</Text>
              <View style={{ backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: wp(16), padding: wp(20), marginBottom: wp(20), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center' }}>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)' }}>Plan actuel</Text>
                <Text style={{ fontSize: fp(28), fontWeight: '800', color: subColor, marginTop: wp(4) }}>{subTier}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,184,0,0.08)', borderRadius: wp(12), padding: wp(14), marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,184,0,0.2)', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: fp(22), marginRight: wp(10) }}>{'\u26A1'}</Text>
                <View style={{ flex: 1 }}><Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFB800' }}>20 \u00e9nergie gratuite / jour</Text><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>Pour tous les utilisateurs.</Text></View>
              </View>
              {[{ name: 'Silver', price: '$4.99/mois', lix: '5 000 Lix', energy: '50 bonus', frags: '2 frags Standard', color: '#A4B0BE' },{ name: 'Gold', price: '$9.99/mois', lix: '10 000 Lix', energy: '100 bonus', frags: '3 frags Rare', color: '#D4AF37' },{ name: 'Platinum', price: '$14.99/mois', lix: '18 000 Lix', energy: '200 bonus', frags: '2 frags Elite', color: '#00CEC9' }].map(function(p, i) { return (
                <Pressable key={i} delayPressIn={120} onPress={function() { showToast('\uD83D\uDCB3 ' + p.name + ' \u2014 disponible au lancement', p.color); }} style={function(s) { return { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(16), marginBottom: wp(8), borderWidth: 1, borderColor: p.color + '30', transform: [{ scale: s.pressed ? 0.97 : 1 }] }; }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}><Text style={{ fontSize: fp(16), fontWeight: '700', color: p.color }}>{p.name}</Text><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{p.price}</Text></View>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>{p.lix} + {p.energy} \u00e9nergie + {p.frags}</Text>
                </Pressable>
              ); })}
              <Pressable onPress={function() { setShowSubscription(false); }} style={{ paddingVertical: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#D4AF37' }}>Fermer</Text></Pressable>
            </ScrollView>
          </View>
        </Modal>

        {/* Modal Confidentialit\u00e9 */}
        <Modal visible={showPrivacy} transparent animationType="fade" onRequestClose={function() { setShowPrivacy(false); }}>
          <View style={{ flex: 1, backgroundColor: '#1A1D22' }}><StatusBar barStyle="light-content" backgroundColor="#1A1D22" />
            <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#9B6DFF', marginBottom: wp(16) }}>Politique de confidentialit\u00e9</Text>
              {[{ t: 'Donn\u00e9es collect\u00e9es', d: 'Profil, repas, scans, donn\u00e9es m\u00e9dicales, activit\u00e9 \u2014 uniquement ce que tu fournis.' },{ t: 'Utilisation', d: 'Suivi sant\u00e9 personnalis\u00e9 via ALIXEN. Aucune donn\u00e9e vendue \u00e0 des tiers.' },{ t: 'Stockage', d: 'Serveurs s\u00e9curis\u00e9s Supabase (AWS). Secret Pocket chiffr\u00e9.' },{ t: 'IA', d: 'Conversations ALIXEN via API Anthropic. Non stock\u00e9es au-del\u00e0 du traitement.' },{ t: 'Suppression', d: 'Demande suppression compl\u00e8te \u00e0 tout moment depuis le profil.' },{ t: 'RGPD', d: 'Droit d\'acc\u00e8s, rectification, portabilit\u00e9 et suppression de tes donn\u00e9es.' }].map(function(s, i) { return (
                <View key={i} style={{ marginBottom: wp(14) }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#9B6DFF', marginBottom: wp(4) }}>{s.t}</Text><Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.45)', lineHeight: fp(18) }}>{s.d}</Text></View>
              ); })}
              <Pressable onPress={function() { setShowPrivacy(false); }} style={{ paddingVertical: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#9B6DFF' }}>Fermer</Text></Pressable>
            </ScrollView>
          </View>
        </Modal>

        {/* Modal Termes */}
        <Modal visible={showTerms} transparent animationType="fade" onRequestClose={function() { setShowTerms(false); }}>
          <View style={{ flex: 1, backgroundColor: '#1A1D22' }}><StatusBar barStyle="light-content" backgroundColor="#1A1D22" />
            <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#FF8C42', marginBottom: wp(16) }}>Termes et conditions</Text>
              {[{ t: 'Acceptation', d: 'En utilisant LIXUM, tu acceptes ces termes.' },{ t: 'Service', d: 'LIXUM est un compagnon sant\u00e9 IA. Ne remplace PAS un avis m\u00e9dical.' },{ t: 'Lix et achats', d: 'Monnaie virtuelle non remboursable. Abonnements r\u00e9siliables.' },{ t: 'Propri\u00e9t\u00e9', d: 'LIXUM, ALIXEN, LixVerse sont propri\u00e9t\u00e9 de LIXUM.' },{ t: 'Responsabilit\u00e9', d: 'LIXUM non responsable des d\u00e9cisions sant\u00e9 bas\u00e9es sur l\'app.' }].map(function(s, i) { return (
                <View key={i} style={{ marginBottom: wp(14) }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FF8C42', marginBottom: wp(4) }}>{s.t}</Text><Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.45)', lineHeight: fp(18) }}>{s.d}</Text></View>
              ); })}
              <Pressable onPress={function() { setShowTerms(false); }} style={{ paddingVertical: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FF8C42' }}>Fermer</Text></Pressable>
            </ScrollView>
          </View>
        </Modal>

        {/* ═══ MODAL TOUS LES PALIERS ═══ */}
        <Modal visible={showMilestones} transparent animationType="fade" onRequestClose={function() { setShowMilestones(false); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: wp(20) }}>
            <View style={{
              backgroundColor: '#1A1D22', borderRadius: wp(20), padding: wp(20),
              borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
              maxHeight: '80%',
            }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(16) }}>
                <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#EAEEF3', letterSpacing: 1 }}>
                  {lang === 'fr' ? 'PALIERS XP' : 'XP MILESTONES'}
                </Text>
                <Pressable onPress={function() { setShowMilestones(false); }}
                  style={{ width: wp(28), height: wp(28), borderRadius: wp(14), backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#8892A0', fontSize: fp(14), fontWeight: '600' }}>✕</Text>
                </Pressable>
              </View>

              {/* Niveau actuel */}
              <View style={{
                backgroundColor: 'rgba(0,217,132,0.06)', borderRadius: wp(12),
                padding: wp(12), marginBottom: wp(16),
                borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(8),
              }}>
                <Text style={{ fontSize: fp(14), fontWeight: '900', color: '#00D984' }}>NIV {userXP.user_level || 1}</Text>
                <View style={{ width: 1, height: wp(16), backgroundColor: 'rgba(255,255,255,0.1)' }} />
                <Text style={{ fontSize: fp(12), color: '#8892A0' }}>{(userXP.user_xp || 0).toLocaleString('fr-FR')} XP</Text>
              </View>

              {/* Liste des paliers */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {XP_MILESTONES.map(function(m, i) {
                  var reached = (userXP.user_level || 1) >= m.level;
                  var isCurrent = !reached && (i === 0 || (userXP.user_level || 1) >= XP_MILESTONES[i - 1].level);
                  return (
                    <View key={m.level} style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingVertical: wp(12), paddingHorizontal: wp(10),
                      borderBottomWidth: i < XP_MILESTONES.length - 1 ? 1 : 0,
                      borderBottomColor: 'rgba(255,255,255,0.04)',
                      backgroundColor: isCurrent ? m.color + '08' : 'transparent',
                      borderRadius: isCurrent ? wp(10) : 0,
                    }}>
                      {/* Icône état */}
                      <View style={{
                        width: wp(32), height: wp(32), borderRadius: wp(16),
                        backgroundColor: reached ? m.color + '20' : 'rgba(255,255,255,0.04)',
                        borderWidth: 1.5,
                        borderColor: reached ? m.color : isCurrent ? m.color + '40' : 'rgba(255,255,255,0.08)',
                        justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
                      }}>
                        {reached ? (
                          <Text style={{ fontSize: fp(14) }}>✓</Text>
                        ) : (
                          <Text style={{ fontSize: fp(14) }}>{m.emoji}</Text>
                        )}
                      </View>

                      {/* Info palier */}
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: fp(12), fontWeight: '800',
                          color: reached ? m.color : isCurrent ? '#EAEEF3' : '#555E6C',
                        }}>
                          NIV {m.level}
                        </Text>
                        <Text style={{
                          fontSize: fp(9),
                          color: reached ? '#8892A0' : '#555E6C',
                          marginTop: wp(2),
                        }}>
                          {m.lix.toLocaleString('fr-FR')} Lix · {m.energy} {lang === 'fr' ? 'énergie' : 'energy'} · {lang === 'fr' ? m.reward : m.rewardEn}
                        </Text>
                      </View>

                      {/* Badge état */}
                      {reached ? (
                        <View style={{ backgroundColor: m.color + '15', paddingHorizontal: wp(8), paddingVertical: wp(3), borderRadius: wp(6) }}>
                          <Text style={{ fontSize: fp(8), fontWeight: '700', color: m.color }}>
                            {lang === 'fr' ? 'OBTENU' : 'EARNED'}
                          </Text>
                        </View>
                      ) : isCurrent ? (
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: fp(10), fontWeight: '700', color: m.color }}>
                            {Math.max(0, getXPForLevel(m.level) - (userXP.user_xp || 0)).toLocaleString('fr-FR')}
                          </Text>
                          <Text style={{ fontSize: fp(7), color: '#555E6C' }}>XP restant</Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: fp(9), color: '#555E6C' }}>🔒</Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#1A1D22', '#252A30', '#1E2328']} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingBottom: wp(100) }}>
          {/* Header */}
          <View style={{ paddingTop: Platform.OS === 'android' ? 50 : 60, paddingBottom: wp(20) }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: wp(16), marginBottom: wp(12), gap: wp(6) }}>
              <Pressable onPress={function() { setLang('fr'); fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID, { method: 'PATCH', headers: Object.assign({}, hdrs, { 'Content-Type': 'application/json' }), body: JSON.stringify({ language: 'FR' }) }).catch(function() {}); }} style={{ paddingHorizontal: wp(8), paddingVertical: wp(5), borderRadius: wp(6), borderWidth: 1, borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.08)', backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'transparent' }}><Text style={{ fontSize: fp(14) }}>{'\uD83C\uDDEB\uD83C\uDDF7'}</Text></Pressable>
              <Pressable onPress={function() { setLang('en'); fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID, { method: 'PATCH', headers: Object.assign({}, hdrs, { 'Content-Type': 'application/json' }), body: JSON.stringify({ language: 'EN' }) }).catch(function() {}); }} style={{ paddingHorizontal: wp(8), paddingVertical: wp(5), borderRadius: wp(6), borderWidth: 1, borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.08)', backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'transparent' }}><Text style={{ fontSize: fp(14) }}>{'\uD83C\uDDEC\uD83C\uDDE7'}</Text></Pressable>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: wp(72), height: wp(72), borderRadius: wp(36), backgroundColor: avatarColor + '15', borderWidth: 2.5, borderColor: avatarColor + '50', justifyContent: 'center', alignItems: 'center', marginBottom: wp(10), shadowColor: avatarColor, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}>
                {avatarEmoji ? <Text style={{ fontSize: fp(32) }}>{avatarEmoji}</Text> : <Text style={{ fontSize: fp(28), fontWeight: '900', color: avatarColor }}>{avatarInitial}</Text>}
              </View>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>{profile ? profile.full_name : '...'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginTop: wp(4) }}>
                <View style={{ backgroundColor: subColor + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(2), borderWidth: 1, borderColor: subColor + '40' }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: subColor }}>{subTier}</Text></View>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)' }}>{profile ? profile.lixtag : 'LXM-...'}</Text>
              </View>
              {/* Barre XP */}
              <View style={{ width: '100%', paddingHorizontal: wp(32), marginTop: wp(14) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)' }}><Text style={{ fontSize: fp(11), fontWeight: '800', color: '#00D984', letterSpacing: 1 }}>NIV {userXP.user_level}</Text></View>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{userXP.xp_progress} / {userXP.xp_needed} XP</Text>
                </View>
                <View style={{ height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}><LinearGradient colors={['#00D984', '#00B871']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: Math.min(userXP.xp_percent || 0, 100) + '%', height: '100%', borderRadius: wp(4) }} /></View>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: wp(4) }}>{userXP.user_xp || 0} XP total</Text>
                {/* ═══ PROCHAIN PALIER ═══ */}
                {(function() {
                  var next = getNextMilestone(userXP.user_level || 1);
                  if (!next) {
                    return (
                      <View style={{
                        marginTop: wp(10), paddingVertical: wp(8), paddingHorizontal: wp(12),
                        backgroundColor: 'rgba(255,215,0,0.06)', borderRadius: wp(10),
                        borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(6),
                      }}>
                        <Text style={{ fontSize: fp(16) }}>👑</Text>
                        <Text style={{ fontSize: fp(11), fontWeight: '800', color: '#FFD700', letterSpacing: 0.5 }}>
                          {lang === 'fr' ? 'NIVEAU MAXIMUM ATTEINT' : 'MAX LEVEL REACHED'}
                        </Text>
                      </View>
                    );
                  }
                  var xpToNext = getXPForLevel(next.level) - (userXP.user_xp || 0);
                  if (xpToNext < 0) xpToNext = 0;
                  return (
                    <Pressable
                      delayPressIn={120}
                      onPress={function() { setShowMilestones(true); }}
                      style={function(s) { return {
                        marginTop: wp(10), paddingVertical: wp(10), paddingHorizontal: wp(14),
                        backgroundColor: next.color + '08', borderRadius: wp(12),
                        borderWidth: 1, borderColor: next.color + '20',
                        transform: [{ scale: s.pressed ? 0.97 : 1 }],
                      }; }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(18), marginRight: wp(8) }}>{next.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                            <Text style={{ fontSize: fp(10), fontWeight: '800', color: next.color, letterSpacing: 0.5 }}>
                              {lang === 'fr' ? 'PROCHAIN PALIER' : 'NEXT MILESTONE'} : NIV {next.level}
                            </Text>
                          </View>
                          <Text style={{ fontSize: fp(9), color: '#8892A0', marginTop: wp(2) }}>
                            {next.lix.toLocaleString('fr-FR')} Lix · {next.energy} {lang === 'fr' ? 'énergie' : 'energy'} · {lang === 'fr' ? next.reward : next.rewardEn}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: fp(10), fontWeight: '700', color: next.color }}>
                            {xpToNext.toLocaleString('fr-FR')}
                          </Text>
                          <Text style={{ fontSize: fp(7), color: '#555E6C' }}>XP restant</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })()}
              </View>
              {/* Stats rapides */}
              <View style={{ flexDirection: 'row', gap: wp(12), marginTop: wp(16) }}>
                {[{ v: lixBalance, l: 'Lix', c: '#D4AF37' },{ v: userEnergy, l: '\u00c9nergie', c: '#FFB800' },{ v: ownedCharacters + '/16', l: 'Cartes', c: '#4DA6FF' },{ v: profile ? profile.discipline_streak || 0 : 0, l: 'Streak', c: '#00D984' }].map(function(s, i) { return (
                  <View key={i} style={{ alignItems: 'center' }}><Text style={{ fontSize: fp(16), fontWeight: '800', color: s.c }}>{s.v}</Text><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.35)' }}>{s.l}</Text></View>
                ); })}
              </View>
            </View>
          </View>

          {/* Donn\u00e9es personnelles */}
          <View style={{ marginBottom: wp(8) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.personalData}</Text>
            <View style={{ marginHorizontal: wp(12), borderRadius: wp(16), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <LinearGradient colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']} style={{ padding: wp(16) }}>
                <View style={{ flexDirection: 'row', marginBottom: wp(14) }}>
                  {[{ l: t.age, v: profile ? profile.age || '\u2014' : '\u2014', u: t.years, c: '#FFF' },{ l: t.weight, v: profile ? profile.weight || '\u2014' : '\u2014', u: t.kg, c: '#FFF' },{ l: t.height, v: profile ? profile.height || '\u2014' : '\u2014', u: t.cm, c: '#FFF' },{ l: t.bmi, v: imc, u: '', c: imcColor }].map(function(d, i) { return (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginBottom: wp(4) }}>{d.l}</Text><Text style={{ fontSize: fp(17), fontWeight: '800', color: d.c }}>{d.v}</Text>{d.u ? <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.2)', marginTop: wp(1) }}>{d.u}</Text> : null}</View>
                  ); })}
                </View>
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: wp(14) }} />
                <View style={{ flexDirection: 'row' }}>
                  {[{ l: 'BMR', v: profile ? profile.bmr || '\u2014' : '\u2014', u: 'kcal', c: '#D4AF37' },{ l: 'TDEE', v: profile ? profile.tdee || '\u2014' : '\u2014', u: 'kcal', c: '#00D984' },{ l: t.objective, v: profile ? (profile.goal === 'lose' ? (lang === 'fr' ? 'Perte' : 'Lose') : profile.goal === 'gain' ? (lang === 'fr' ? 'Prise' : 'Gain') : profile.goal === 'maintain' ? (lang === 'fr' ? 'Maintien' : 'Maintain') : '\u2014') : '\u2014', u: '', c: '#4DA6FF' }].map(function(d, i) { return (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginBottom: wp(4) }}>{d.l}</Text><Text style={{ fontSize: fp(15), fontWeight: '700', color: d.c }}>{d.v}</Text>{d.u ? <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.2)', marginTop: wp(1) }}>{d.u}</Text> : null}</View>
                  ); })}
                </View>
              </LinearGradient>
            </View>
          </View>

          <Pressable delayPressIn={120} onPress={function() { setShowEditProfile(true); }} style={function(s) { return { marginHorizontal: wp(16), marginBottom: wp(20), transform: [{ scale: s.pressed ? 0.97 : 1 }] }; }}>
            <LinearGradient colors={['#00D984', '#00B871']} style={{ paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{t.editProfile}</Text></LinearGradient>
          </Pressable>

          {/* Param\u00e8tres */}
          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.settings}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon={'\uD83D\uDCCD'} title={t.location} subtitle={t.locationSub} color="#FF8C42" rightText={editLocation || t.notDefined} onPress={function() { setShowLocationPicker(true); }} />
            <Section icon={'\uD83D\uDCB3'} title={t.subscription} subtitle={t.subscriptionSub} color="#D4AF37" rightText={subTier} onPress={function() { setShowSubscription(true); }} />
            <Section icon={'\uD83D\uDD14'} title={t.notifications} subtitle={t.notifSub} color="#4DA6FF" onPress={function() { showToast('\uD83D\uDD14 Disponible apr\u00e8s le build', '#4DA6FF'); }} />
          </View>

          {/* ═══════════════════════════════════════════════ */}
          {/* ═══ CONNECTEURS — Montres & Apps Sant\u00e9 ═══ */}
          {/* ═══════════════════════════════════════════════ */}
          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.connectors}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            {/* Header avec description */}
            <View style={{ paddingHorizontal: wp(16), paddingTop: wp(12), paddingBottom: wp(8), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                <View style={{ width: wp(32), height: wp(32), borderRadius: wp(8), backgroundColor: 'rgba(0,217,132,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)' }}>
                  <Text style={{ fontSize: fp(16) }}>{'\u231A'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF' }}>{t.connectorsDesc}</Text>
                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.25)', marginTop: wp(2) }}>
                    {Object.keys(connectedApps).length > 0
                      ? Object.keys(connectedApps).length + (lang === 'fr' ? ' connect\u00e9(s)' : ' connected')
                      : lang === 'fr' ? 'Aucune connexion' : 'No connections'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Liste des connecteurs */}
            {CONNECTORS.map(function(c, i) { return renderConnectorCard(c, i); })}
          </View>

          {/* Apprendre */}
          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.learn}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon={'\uD83D\uDCD6'} title={t.glossary} subtitle={t.glossarySub} color="#00D984" onPress={function() { setShowGlossary(true); }} />
            <Section icon={'\uD83D\uDDFA'} title={t.guide} subtitle={t.guideSub} color="#4DA6FF" onPress={function() { setShowFeatures(true); }} />
          </View>

          {/* L\u00e9gal */}
          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.legal}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon={'\uD83D\uDD10'} title={t.privacy} color="#9B6DFF" onPress={function() { setShowPrivacy(true); }} />
            <Section icon={'\uD83D\uDCDC'} title={t.terms} color="#FF8C42" onPress={function() { setShowTerms(true); }} />
            <Section icon={'\uD83D\uDCAC'} title={t.contact} subtitle="support@lixum.app" color="#00D984" onPress={function() { showToast('\uD83D\uDCAC support@lixum.app', '#00D984'); }} />
            <Section icon={'\u2B50'} title={t.rate} color="#D4AF37" onPress={function() { showToast('\u2B50 Merci ! Disponible au lancement', '#D4AF37'); }} />
          </View>

          {/* D\u00e9connexion */}
          <Pressable delayPressIn={120} onPress={function() { Alert.alert('D\u00e9connexion', t.logoutConfirm, [{ text: t.cancel, style: 'cancel' }, { text: 'D\u00e9connexion', style: 'destructive' }]); }} style={{ marginHorizontal: wp(16), marginBottom: wp(16), paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,107,107,0.05)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)' }}>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FF6B6B' }}>{t.logout}</Text>
          </Pressable>

          <Pressable onPress={function() { Alert.alert('Supprimer', t.deleteConfirm, [{ text: t.cancel, style: 'cancel' }, { text: 'Supprimer', style: 'destructive' }]); }} style={{ marginHorizontal: wp(16), marginBottom: wp(16), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,107,107,0.4)' }}>{t.deleteAccount}</Text>
          </Pressable>

          <View style={{ alignItems: 'center', paddingBottom: wp(20) }}>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.15)' }}>LIXUM v1.0.0-beta</Text>
            <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.1)', marginTop: wp(2) }}>{t.madeWith}</Text>
          </View>
        </ScrollView>
        {renderModals()}
        {toast ? (
          <View style={{ position: 'absolute', top: Platform.OS === 'android' ? 45 : 60, left: wp(20), right: wp(20), backgroundColor: '#252A30', borderRadius: wp(14), paddingVertical: wp(14), paddingHorizontal: wp(20), flexDirection: 'row', alignItems: 'center', gap: wp(10), borderWidth: 1.5, borderColor: toast.color + '40', shadowColor: toast.color, shadowOpacity: 0.3, shadowRadius: 12, elevation: 10, zIndex: 9999 }}>
            <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: toast.color }} />
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', flex: 1 }}>{toast.message}</Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}
