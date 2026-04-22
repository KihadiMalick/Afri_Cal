import React, { useState } from 'react';
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

// === ProfileScrollPicker (copie l.74-99 prod) ===
// Sera ajoute en Phase 3b

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
