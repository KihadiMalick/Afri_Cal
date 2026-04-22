import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Modal, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from './MockAuthContext';
import { useLang } from './MockLanguageContext';
import { T } from './mockT';
import { useFocusEffect, useRoute } from './MockNavigation';
import MetalCard from './components/MetalCard';
import DeleteAccountModal from './components/DeleteAccountModal';

// === Helpers layout (copies wp/fp de profileConstants sans deps) ===
var SCREEN_W = Dimensions.get('window').width;
var W = SCREEN_W;
var BASE = 400;
var wp = function(n) { return (W / BASE) * n; };
var fp = function(n) { return (W / BASE) * n; };

// === CONNECTORS (copie CONNECTORS de profileConstants) ===
var CONNECTORS = [
  { key: 'apple_health', name: 'Apple Health', emoji: '🍎', dataFr: 'Pas · Cardio · Sommeil · Activités', dataEn: 'Steps · Heart · Sleep · Activities', color: '#FF3B5C' },
  { key: 'samsung_health', name: 'Samsung Health', emoji: '💙', dataFr: 'Pas · Cardio · Sommeil · Activités', dataEn: 'Steps · Heart · Sleep · Activities', color: '#4DA6FF' },
  { key: 'fitbit', name: 'Fitbit', emoji: '⌚', dataFr: 'Pas · Sommeil · Cardio', dataEn: 'Steps · Sleep · Heart', color: '#00BFA6' },
  { key: 'strava', name: 'Strava', emoji: '🏃', dataFr: 'Course · Vélo · Distance · GPS', dataEn: 'Run · Bike · Distance · GPS', color: '#FF8C42' }
];

// === ProfileScrollPicker (copie fidele l.74-99 prod) ===
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

// === Section (copie l.329-339 prod) ===
// Sera ajoute en Phase 3c

function ProfilePageMock() {
  var auth = useAuth();
  var lang = useLang();
  var t = lang.language === 'EN' ? T.en : T.fr;

  // Donnees auth
  var profile = auth.profile;
  var lixBalance = auth.lixBalance;
  var userXP = auth.userXP;
  var subscriptionTier = auth.subscriptionTier;
  var energy = auth.energy;
  var ownedCharacters = auth.ownedCharacters;

  // States locaux
  var _hydrationGoal = useState(2.5);
  var hydrationGoal = _hydrationGoal[0];
  var setHydrationGoal = _hydrationGoal[1];

  var _showDelete = useState(false);
  var showDelete = _showDelete[0];
  var setShowDelete = _showDelete[1];

  var _isDeletingAccount = useState(false);
  var isDeletingAccount = _isDeletingAccount[0];
  var setIsDeletingAccount = _isDeletingAccount[1];

  var _showLogoutConfirm = useState(false);
  var showLogoutConfirm = _showLogoutConfirm[0];
  var setShowLogoutConfirm = _showLogoutConfirm[1];

  // Calculs derives (reproduction exacte prod)
  var imc = profile.weight / ((profile.height / 100) * (profile.height / 100));
  var imcFormatted = imc.toFixed(1);
  var imcColor;
  var imcLabel;
  var imcBarValue;
  if (imc < 18.5) { imcColor = '#4DA6FF'; imcLabel = 'Maigreur'; imcBarValue = imc; }
  else if (imc < 25) { imcColor = '#00D984'; imcLabel = 'Normal'; imcBarValue = imc; }
  else if (imc < 30) { imcColor = '#FF8C42'; imcLabel = 'Surpoids'; imcBarValue = imc; }
  else { imcColor = '#FF4444'; imcLabel = 'Obésité'; imcBarValue = Math.min(imc, 40); }
  var imcBarPosPercent = ((imcBarValue - 15) / (40 - 15)) * 100;
  imcBarPosPercent = Math.max(0, Math.min(100, imcBarPosPercent));

  // Tier info
  var tierInfo;
  if (subscriptionTier === 'platinum') tierInfo = { color: '#00D984', label: 'Platinum' };
  else if (subscriptionTier === 'gold') tierInfo = { color: '#D4AF37', label: 'Gold' };
  else if (subscriptionTier === 'silver') tierInfo = { color: '#C0C0C0', label: 'Silver' };
  else tierInfo = { color: 'rgba(255,255,255,0.3)', label: t.free || 'Gratuit' };

  // Avatar
  var avatarColor = '#4DA6FF';
  var avatarInitial = (profile.display_name || 'U').charAt(0).toUpperCase();

  // Handler delete (mock RPC -> trigger success screen)
  function handleDeleteConfirm(reasons, reasonOther) {
    setIsDeletingAccount(true);
    setTimeout(function() {
      setShowDelete(false);
      setIsDeletingAccount(false);
      var scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 30);
      auth.triggerAccountDeletedSuccess(scheduledDate.toISOString());
    }, 1500);
  }

  function handleLogout() {
    setShowLogoutConfirm(false);
    auth.signOut();
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#1A1D22', '#252A30', '#1E2328']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: wp(100) }} showsVerticalScrollIndicator={false}>
          {/* Sections ajoutees progressivement en Phases 3d-3i */}
          <View style={{ padding: wp(24), alignItems: 'center' }}>
            <Text style={{ color: '#8892A0', fontSize: fp(14) }}>{'ProfilePageMock skeleton — sections en cours d\'ajout'}</Text>
          </View>
        </ScrollView>

        <DeleteAccountModal
          visible={showDelete}
          onClose={function() { if (!isDeletingAccount) setShowDelete(false); }}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeletingAccount}
          language={lang.language}
        />
      </LinearGradient>
    </View>
  );
}

export default ProfilePageMock;
