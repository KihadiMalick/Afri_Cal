import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StatusBar, Modal, TextInput, Image, KeyboardAvoidingView, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
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
  XP_MILESTONES, XP_SOURCES, getNextMilestone, getXPForLevel,
  ACTIVITY_LEVELS, DIETS, GOALS,
  T,
  getCharEmoji,
} from './profileConstants';
import { useAuth } from '../../config/AuthContext';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import MetalCard from '../../components/shared/MetalCard';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import EditProfilePage from './EditProfilePage';

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
  var _showContactPicker = useState(false), showContactPicker = _showContactPicker[0], setShowContactPicker = _showContactPicker[1];
  var _connectedApps = useState({}), connectedApps = _connectedApps[0], setConnectedApps = _connectedApps[1];
  var _toast = useState(null), toast = _toast[0], setToast = _toast[1];
  var _isDeletingAccount = useState(false), isDeletingAccount = _isDeletingAccount[0], setIsDeletingAccount = _isDeletingAccount[1];
  var t = T.fr;
  var showToast = function(message, color) { setToast({ message: message, color: color || '#00D984' }); setTimeout(function() { setToast(null); }, 2500); };

  // Deep-link : ouvrir la modale d'edition si route.params.scrollTo === 'weight'.
  useEffect(function() {
    if (route.params && route.params.scrollTo === 'weight') {
      setShowEditProfile(true);
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
      if (pD && pD[0]) { setProfile(pD[0]); updateLixBalance(pD[0].lix_balance || 0); setUserEnergy(pD[0].energy || 20); }
      if (Array.isArray(cD)) { setOwnedCharacters(cD.length); var activeC = cD.find(function(c) { return c.is_active; }); if (activeC) setActiveCharSlug(activeC.character_slug); }
      fetch(SUPABASE_URL + '/rest/v1/rpc/get_user_xp', { method: 'POST', headers: Object.assign({}, hdrs, { 'Content-Type': 'application/json' }), body: JSON.stringify({ p_user_id: userId }) })
        .then(function(r) { return r.json(); }).then(function(d) { if (d) setUserXP(d); }).catch(function(err) { console.warn('[LIXUM] XP fetch error:', err); });
    }).catch(function(e) { console.error('Profile:', e); });
  };


  var toggleConnector = function(connId) { setConnectedApps(function(prev) { var n = Object.assign({}, prev); if (n[connId]) { delete n[connId]; showToast('D\u00e9connect\u00e9', '#FF6B6B'); } else { n[connId] = { connectedAt: new Date().toISOString(), lastSync: new Date().toISOString() }; showToast('Connect\u00e9 \u2713', '#00D984'); } return n; }); };
  var handleLogout = function() { auth.signOut(); setShowLogoutConfirm(false); };

  var handleDeleteAccount = async function(selectedReasons, reasonOther) {
    if (!userId) {
      showToast(t.deleteGenericError || 'Erreur', '#FF6B6B');
      return;
    }
    setIsDeletingAccount(true);
    try {
      var reasonParts = (selectedReasons || []).slice();
      if (reasonOther && reasonOther.length > 0) {
        reasonParts.push('other: ' + reasonOther);
      }
      var reasonFinal = reasonParts.length > 0 ? reasonParts.join(' | ') : null;

      var res = await supabase.rpc('request_account_deletion', {
        p_user_id: userId,
        p_reason: reasonFinal,
        p_ip_hash: null,
        p_user_agent: Platform.OS + '/' + String(Platform.Version),
        p_reason_codes: selectedReasons && selectedReasons.length > 0 ? selectedReasons : null
      });

      if (res.error) {
        console.warn('request_account_deletion error:', res.error);
        showToast(t.deleteGenericError || 'Erreur', '#FF6B6B');
        setIsDeletingAccount(false);
        return;
      }

      var data = res.data;

      if (!data || data.success === false) {
        if (data && data.error === 'admin_cannot_be_deleted') {
          showToast(t.deleteAdminBlocked || 'Admin bloque', '#FF6B6B');
        } else {
          showToast(t.deleteGenericError || 'Erreur', '#FF6B6B');
        }
        setIsDeletingAccount(false);
        return;
      }

      setShowDeleteConfirm(false);
      setIsDeletingAccount(false);
      if (auth.triggerAccountDeletedSuccess) {
        auth.triggerAccountDeletedSuccess(data.scheduled_hard_delete_at);
      }
    } catch (err) {
      console.warn('handleDeleteAccount exception:', err);
      showToast(t.deleteGenericError || 'Erreur', '#FF6B6B');
      setIsDeletingAccount(false);
    }
  };

  var handleCloseMilestones = function() { setShowMilestones(false); };
  var handleOpenContact = function() { setShowContactPicker(true); };
  var handleCloseContact = function() { setShowContactPicker(false); };

  var openMailto = function(category) {
    setShowContactPicker(false);
    var subject = '[' + category + '] ';
    var url = 'mailto:contact@lixum.com?subject=' + encodeURIComponent(subject);
    Linking.openURL(url).catch(function(err) {
      console.error('Erreur ouverture mail:', err);
    });
  };

  var handleContactBug = function() { openMailto('BUG'); };
  var handleContactSuggestion = function() { openMailto('SUGGESTION'); };
  var handleContactBilling = function() { openMailto('FACTURATION'); };
  var handleContactRGPD = function() { openMailto('RGPD'); };
  var handleContactPartnership = function() { openMailto('PARTENARIAT'); };

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
  var imcLabel = imcNum < 18.5 ? 'Insuffisance' : imcNum < 25 ? 'Normal' : imcNum < 30 ? 'Surpoids' : 'Obésité';
  var imcBarPos = Math.min(Math.max(((imcNum - 15) / 25) * 100, 0), 100);
  var tierInfo = (function() {
    var tier = (auth && auth.subscriptionTier) || 'free';
    if (tier === 'platinum') return { label: 'Platinum', color: '#00D984' };
    if (tier === 'gold')     return { label: 'Gold',     color: '#D4AF37' };
    if (tier === 'silver')   return { label: 'Silver',   color: '#C0C0C0' };
    return { label: t.free, color: 'rgba(255,255,255,0.3)' };
  })();
  var subTier = tierInfo.label;
  var subColor = tierInfo.color;
  var avatarEmoji = getCharEmoji(activeCharSlug);
  var displayNameForAvatar = (profile && profile.display_name) || 'U';
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
      fetchLegalDocument('privacy', 'fr');
    }
  }, [showPrivacy]);

  useEffect(function() {
    if (showTerms) {
      fetchLegalDocument('terms', 'fr');
    }
  }, [showTerms]);

  var renderConnectorCard = function(conn, i) {
    var isConnected = !!connectedApps[conn.id]; var dataText = conn.dataFr;
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
            <View style={{ flexDirection: 'row', paddingHorizontal: wp(16), marginBottom: wp(12) }}>
              <Pressable onPress={function() { navigation.goBack(); }} style={{ paddingVertical: wp(5), paddingHorizontal: wp(8) }}><Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.4)' }}>{'\u2190'}</Text></Pressable>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: wp(72), height: wp(72), borderRadius: wp(36), backgroundColor: avatarColor + '15', borderWidth: 2.5, borderColor: avatarColor + '50', justifyContent: 'center', alignItems: 'center', marginBottom: wp(10) }}>{avatarEmoji ? <Text style={{ fontSize: fp(32) }}>{avatarEmoji}</Text> : <Text style={{ fontSize: fp(28), fontWeight: '900', color: avatarColor }}>{avatarInitial}</Text>}</View>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>{profile ? (profile.display_name || 'Utilisateur') : '...'}</Text>
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
                {[{ val: lixBalance, label: 'Lix', color: '#D4AF37' }, { val: userEnergy, label: '\u00c9nergie', color: '#FFB800' }, { val: ownedCharacters + '/16', label: 'Cartes', color: '#00D984' }].map(function(s, i) { return (
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
                  Personnalisez votre profil
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 10, marginTop: 2, lineHeight: 14 }}>
                  Choisissez comment vous souhaitez être appelé par LIXUM
                </Text>
              </View>
              <Text style={{ fontSize: 16, color: '#00D984' }}>{'\u203A'}</Text>
            </Pressable>
          ) : null}

          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.personalData}</Text></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(16), justifyContent: 'space-between', gap: 12, marginBottom: wp(12) }}>
            <View style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: wp(4) }}>{t.age}</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#D4AF37' }}>{profile ? profile.age + ' ' + t.years : '\u2014'}</Text>
            </View>
            <View style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: wp(4) }}>{t.weight}</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#00D984' }}>{profile ? profile.weight + ' ' + t.kg : '\u2014'}</Text>
            </View>
            <View style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: wp(4) }}>{t.height}</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#00BFA6' }}>{profile ? profile.height + ' ' + t.cm : '\u2014'}</Text>
            </View>
            <View style={{ width: '48%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: wp(4) }}>{t.bmi}</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: imcColor }}>{imc}</Text>
            </View>
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

          <Pressable delayPressIn={120} onPress={function() { setShowEditProfile(true); }} style={{ marginHorizontal: wp(16), marginBottom: wp(16), paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.06)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)' }}><Text style={{ fontSize: fp(13), fontWeight: '600', color: '#00D984' }}>{t.editProfile}</Text></Pressable>

          <EditProfilePage
            visible={showEditProfile}
            onClose={function() { setShowEditProfile(false); }}
            profile={profile}
            onSaveSuccess={function(updatedProfile) { if (updatedProfile) { setProfile(updatedProfile); updateLixBalance(updatedProfile.lix_balance || 0); } showToast('Profil mis \u00e0 jour', '#00D984'); }}
          />

          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(4) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.settings}</Text></View>
          <Section icon={'\uD83D\uDCCD'} title={t.location} subtitle={t.locationSub} color="#FF8C42" rightText={(profile && (profile.city || profile.location)) || t.notDefined} onPress={function() { setShowLocationPicker(true); }} />
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
          <Section icon={'\uD83D\uDCE7'} title={t.contact} color="#4DA6FF" onPress={handleOpenContact} />
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

        <DeleteAccountModal
          visible={showDeleteConfirm}
          onClose={function() { if (!isDeletingAccount) setShowDeleteConfirm(false); }}
          onConfirm={handleDeleteAccount}
          isDeleting={isDeletingAccount}
          language={auth.language || 'FR'}
        />

        <Modal visible={showMilestones} transparent animationType="fade" onRequestClose={handleCloseMilestones}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: wp(16) }}>
            <View style={{ backgroundColor: '#1E2530', borderRadius: wp(20), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)', maxHeight: '88%', overflow: 'hidden' }}>
              <View style={{ padding: wp(20), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ color: '#FFF', fontSize: fp(20), fontWeight: '700' }}>Mes paliers XP</Text>
                <Text style={{ color: '#8892A0', fontSize: fp(13), marginTop: wp(4) }}>Progresse pour débloquer des récompenses</Text>
              </View>
              <ScrollView contentContainerStyle={{ padding: wp(20) }}>
                <View style={{ backgroundColor: '#252A30', borderRadius: wp(14), padding: wp(16), marginBottom: wp(20), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)' }}>
                  <Text style={{ color: '#8892A0', fontSize: fp(11), fontWeight: '600', letterSpacing: 1, marginBottom: wp(8) }}>TON NIVEAU ACTUEL</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ color: '#00D984', fontSize: fp(32), fontWeight: '800' }}>NIV {userXP.user_level}</Text>
                    <Text style={{ color: '#FFF', fontSize: fp(14), marginLeft: wp(12) }}>{userXP.xp_progress} / {userXP.xp_needed} XP</Text>
                  </View>
                  <View style={{ height: wp(6), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(3), marginTop: wp(10), overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: (userXP.xp_percent || 0) + '%', backgroundColor: '#00D984', borderRadius: wp(3) }} />
                  </View>
                </View>
                {XP_MILESTONES.map(function(m) {
                  var reached = userXP.user_level >= m.level;
                  return (
                    <View key={m.level} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#252A30', borderRadius: wp(14), padding: wp(14), marginBottom: wp(10), borderWidth: 1, borderColor: reached ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.05)', opacity: reached ? 1 : 0.55 }}>
                      <View style={{ width: wp(48), height: wp(48), borderRadius: wp(24), backgroundColor: reached ? 'rgba(0,217,132,0.15)' : 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: wp(14) }}>
                        <Text style={{ fontSize: fp(22) }}>{reached ? '\uD83C\uDFC6' : m.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(4) }}>
                          <Text style={{ color: reached ? '#00D984' : '#FFF', fontSize: fp(16), fontWeight: '700' }}>Niveau {m.level}</Text>
                          {reached ? <Text style={{ color: '#00D984', fontSize: fp(11), marginLeft: wp(8), fontWeight: '600' }}>{'\u2713 ATTEINT'}</Text> : null}
                        </View>
                        <Text style={{ color: '#F2C94C', fontSize: fp(12), fontWeight: '600' }}>{m.lix.toLocaleString('fr-FR')} Lix \u00b7 {m.energy} \u00e9</Text>
                        <Text style={{ color: m.color, fontSize: fp(12), fontWeight: '600', marginTop: wp(2) }}>{m.reward}</Text>
                      </View>
                    </View>
                  );
                })}
                <View style={{ marginTop: wp(20), backgroundColor: '#252A30', borderRadius: wp(14), padding: wp(16) }}>
                  <Text style={{ color: '#FFF', fontSize: fp(14), fontWeight: '700', marginBottom: wp(12) }}>Comment gagner de l'XP ?</Text>
                  {XP_SOURCES.map(function(s, idx) {
                    return (
                      <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: wp(6), borderBottomWidth: idx < XP_SOURCES.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                        <Text style={{ color: '#8892A0', fontSize: fp(13) }}>{s.label}</Text>
                        <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '600' }}>{s.value}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
              <Pressable onPress={handleCloseMilestones} style={{ padding: wp(16), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', alignItems: 'center' }}>
                <Text style={{ color: '#00D984', fontSize: fp(15), fontWeight: '700' }}>Fermer</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <Modal visible={showContactPicker} transparent animationType="fade" onRequestClose={handleCloseContact}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: wp(16) }}>
            <View style={{ backgroundColor: '#1E2530', borderRadius: wp(20), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)', overflow: 'hidden' }}>
              <View style={{ padding: wp(20), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ color: '#FFF', fontSize: fp(20), fontWeight: '700' }}>Nous contacter</Text>
                <Text style={{ color: '#8892A0', fontSize: fp(13), marginTop: wp(4) }}>Choisis le sujet de ton message</Text>
              </View>
              <View style={{ padding: wp(16) }}>
                <Pressable onPress={handleContactBug} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#252A30', borderRadius: wp(12), padding: wp(14), marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(22), marginRight: wp(14) }}>{'\uD83D\uDC1B'}</Text>
                  <Text style={{ flex: 1, color: '#FFF', fontSize: fp(15), fontWeight: '600' }}>Bug technique</Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(18) }}>{'\u203A'}</Text>
                </Pressable>
                <Pressable onPress={handleContactSuggestion} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#252A30', borderRadius: wp(12), padding: wp(14), marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(22), marginRight: wp(14) }}>{'\uD83D\uDCA1'}</Text>
                  <Text style={{ flex: 1, color: '#FFF', fontSize: fp(15), fontWeight: '600' }}>Suggestion fonctionnalité</Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(18) }}>{'\u203A'}</Text>
                </Pressable>
                <Pressable onPress={handleContactBilling} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#252A30', borderRadius: wp(12), padding: wp(14), marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(22), marginRight: wp(14) }}>{'\uD83D\uDCB3'}</Text>
                  <Text style={{ flex: 1, color: '#FFF', fontSize: fp(15), fontWeight: '600' }}>Facturation / abonnement</Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(18) }}>{'\u203A'}</Text>
                </Pressable>
                <Pressable onPress={handleContactRGPD} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#252A30', borderRadius: wp(12), padding: wp(14), marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(22), marginRight: wp(14) }}>{'\uD83D\uDD12'}</Text>
                  <Text style={{ flex: 1, color: '#FFF', fontSize: fp(15), fontWeight: '600' }}>Données personnelles (RGPD)</Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(18) }}>{'\u203A'}</Text>
                </Pressable>
                <Pressable onPress={handleContactPartnership} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#252A30', borderRadius: wp(12), padding: wp(14) }}>
                  <Text style={{ fontSize: fp(22), marginRight: wp(14) }}>{'\uD83E\uDD1D'}</Text>
                  <Text style={{ flex: 1, color: '#FFF', fontSize: fp(15), fontWeight: '600' }}>Partenariat / business</Text>
                  <Text style={{ color: '#8892A0', fontSize: fp(18) }}>{'\u203A'}</Text>
                </Pressable>
              </View>
              <View style={{ padding: wp(12), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', alignItems: 'center' }}>
                <Text style={{ color: '#8892A0', fontSize: fp(11), marginBottom: wp(10) }}>Réponse sous 48h ouvrées</Text>
                <Pressable onPress={handleCloseContact}>
                  <Text style={{ color: '#00D984', fontSize: fp(15), fontWeight: '700' }}>Annuler</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={showPrivacy} animationType="slide" transparent={false} onRequestClose={function() { setShowPrivacy(false); }}>
          <View style={legalStyles.legalModalRoot}>
            <View style={legalStyles.legalModalHeader}>
              <Text style={legalStyles.legalModalTitle}>Politique de confidentialité</Text>
              <TouchableOpacity onPress={function() { setShowPrivacy(false); }} style={legalStyles.legalModalClose}>
                <Text style={legalStyles.legalModalCloseText}>{'\u2715'}</Text>
              </TouchableOpacity>
            </View>
            {legalLoading ? (
              <View style={legalStyles.legalLoaderContainer}>
                <ActivityIndicator size="large" color="#00D984" />
                <Text style={legalStyles.legalLoaderText}>Chargement du document...</Text>
              </View>
            ) : legalError ? (
              <View style={legalStyles.legalErrorContainer}>
                <Text style={legalStyles.legalErrorIcon}>{'\u26A0\uFE0F'}</Text>
                <Text style={legalStyles.legalErrorText}>{legalError}</Text>
                <TouchableOpacity onPress={function() { fetchLegalDocument('privacy', 'fr'); }} style={legalStyles.legalRetryButton}>
                  <Text style={legalStyles.legalRetryText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={legalStyles.legalScrollView} contentContainerStyle={legalStyles.legalScrollContent} showsVerticalScrollIndicator={false}>
                <Markdown style={markdownStyles}>
                  {legalCache.privacy && legalCache.privacy.fr ? legalCache.privacy.fr.content : ''}
                </Markdown>
                <View style={legalStyles.legalFooter}>
                  <Text style={legalStyles.legalFooterText}>
                    Version {legalCache.privacy && legalCache.privacy.fr ? legalCache.privacy.fr.version : ''}{' \u00B7 '}En vigueur depuis le {legalCache.privacy && legalCache.privacy.fr ? legalCache.privacy.fr.effective_date : ''}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </Modal>

        <Modal visible={showTerms} animationType="slide" transparent={false} onRequestClose={function() { setShowTerms(false); }}>
          <View style={legalStyles.legalModalRoot}>
            <View style={legalStyles.legalModalHeader}>
              <Text style={legalStyles.legalModalTitle}>Termes et conditions</Text>
              <TouchableOpacity onPress={function() { setShowTerms(false); }} style={legalStyles.legalModalClose}>
                <Text style={legalStyles.legalModalCloseText}>{'\u2715'}</Text>
              </TouchableOpacity>
            </View>
            {legalLoading ? (
              <View style={legalStyles.legalLoaderContainer}>
                <ActivityIndicator size="large" color="#00D984" />
                <Text style={legalStyles.legalLoaderText}>Chargement du document...</Text>
              </View>
            ) : legalError ? (
              <View style={legalStyles.legalErrorContainer}>
                <Text style={legalStyles.legalErrorIcon}>{'\u26A0\uFE0F'}</Text>
                <Text style={legalStyles.legalErrorText}>{legalError}</Text>
                <TouchableOpacity onPress={function() { fetchLegalDocument('terms', 'fr'); }} style={legalStyles.legalRetryButton}>
                  <Text style={legalStyles.legalRetryText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={legalStyles.legalScrollView} contentContainerStyle={legalStyles.legalScrollContent} showsVerticalScrollIndicator={false}>
                <Markdown style={markdownStyles}>
                  {legalCache.terms && legalCache.terms.fr ? legalCache.terms.fr.content : ''}
                </Markdown>
                <View style={legalStyles.legalFooter}>
                  <Text style={legalStyles.legalFooterText}>
                    Version {legalCache.terms && legalCache.terms.fr ? legalCache.terms.fr.version : ''}{' \u00B7 '}En vigueur depuis le {legalCache.terms && legalCache.terms.fr ? legalCache.terms.fr.effective_date : ''}
                  </Text>
                </View>
              </ScrollView>
            )}
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
