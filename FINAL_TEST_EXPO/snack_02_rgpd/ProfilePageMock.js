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

// === Section (copie fidele l.329-339 prod) ===
var Section = function(props) {
  return (
    <Pressable delayPressIn={120} onPress={props.onPress} style={function(s) { return { flexDirection: 'row', alignItems: 'center', paddingVertical: wp(14), paddingHorizontal: wp(16), backgroundColor: s.pressed ? 'rgba(255,255,255,0.04)' : 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' }; }}>
      <View style={{ width: wp(36), height: wp(36), borderRadius: wp(10), backgroundColor: (props.color || '#00D984') + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
        <Text style={{ fontSize: fp(16) }}>{props.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{props.title}</Text>
        {props.subtitle ? <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(1) }}>{props.subtitle}</Text> : null}
      </View>
      {props.rightText ? <Text style={{ fontSize: fp(11), color: props.color || 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{props.rightText}</Text> : null}
      <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.15)', marginLeft: wp(8) }}>{'›'}</Text>
    </Pressable>
  );
};

// === renderConnectorCard (helper inline ligne prod 401-412) ===
function renderConnectorCard(conn, i, t, isConnected, onToggle) {
  var dataText = t && t.__lang === 'EN' ? conn.dataEn : conn.dataFr;
  return (
    <View key={conn.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(12), paddingHorizontal: wp(14), backgroundColor: isConnected ? conn.color + '08' : 'transparent', borderBottomWidth: i < CONNECTORS.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
      <View style={{ width: wp(40), height: wp(40), borderRadius: wp(10), backgroundColor: conn.color + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12), borderWidth: isConnected ? 1.5 : 0, borderColor: isConnected ? conn.color + '40' : 'transparent' }}>
        <Text style={{ fontSize: fp(18) }}>{conn.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
          <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{conn.name}</Text>
          {isConnected ? <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), backgroundColor: '#00D984' }} /> : null}
        </View>
        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginTop: wp(2) }}>{dataText}</Text>
      </View>
      <Pressable delayPressIn={120} onPress={onToggle} style={function(s) { return { paddingHorizontal: wp(12), paddingVertical: wp(7), borderRadius: wp(8), backgroundColor: isConnected ? 'rgba(255,107,107,0.08)' : conn.color + '15', borderWidth: 1, borderColor: isConnected ? 'rgba(255,107,107,0.2)' : conn.color + '30', transform: [{ scale: s.pressed ? 0.92 : 1 }] }; }}>
        <Text style={{ fontSize: fp(10), fontWeight: '700', color: isConnected ? '#FF6B6B' : conn.color }}>{isConnected ? (t.disconnect || 'Déconnecter') : (t.connect || 'Connecter')}</Text>
      </Pressable>
    </View>
  );
}

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

          {/* ====== SECTION 1 : HEADER (copie fidele l.427-451 prod) ====== */}
          <View style={{ paddingTop: Platform.OS === 'android' ? 20 : 30, paddingBottom: wp(20) }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: wp(16), marginBottom: wp(12) }}>
              <Pressable onPress={function() {}} style={{ paddingVertical: wp(5), paddingHorizontal: wp(8) }}>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.4)' }}>{'←'}</Text>
              </Pressable>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: wp(72), height: wp(72), borderRadius: wp(36), backgroundColor: avatarColor + '15', borderWidth: 2.5, borderColor: avatarColor + '50', justifyContent: 'center', alignItems: 'center', marginBottom: wp(10) }}>
                <Text style={{ fontSize: fp(28), fontWeight: '900', color: avatarColor }}>{avatarInitial}</Text>
              </View>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>{profile.display_name || 'Utilisateur'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginTop: wp(4) }}>
                <View style={{ backgroundColor: tierInfo.color + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(2), borderWidth: 1, borderColor: tierInfo.color + '40' }}>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: tierInfo.color }}>{tierInfo.label}</Text>
                </View>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)' }}>{profile.lixtag || 'LXM-...'}</Text>
              </View>
              <View style={{ width: '100%', paddingHorizontal: wp(32), marginTop: wp(14) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)' }}>
                    <Text style={{ fontSize: fp(11), fontWeight: '800', color: '#00D984', letterSpacing: 1 }}>{'NIV ' + userXP.user_level}</Text>
                  </View>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{userXP.xp_progress + ' / ' + userXP.xp_needed + ' XP'}</Text>
                </View>
                <View style={{ height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                  <LinearGradient colors={['#00D984', '#00B871']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: Math.min(userXP.xp_percent || 0, 100) + '%', height: '100%', borderRadius: wp(4) }} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', paddingHorizontal: wp(20), marginTop: wp(16) }}>
                {[{ val: lixBalance, label: 'Lix', color: '#D4AF37' }, { val: energy, label: 'Énergie', color: '#FFB800' }, { val: ownedCharacters + '/16', label: 'Cartes', color: '#00D984' }].map(function(s, i) {
                  return (
                    <View key={i} style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(18), fontWeight: '800', color: s.color }}>{s.val}</Text>
                      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginTop: wp(2) }}>{s.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* ====== SECTION 2 : DONNEES PERSONNELLES 4 cards 2x2 (l.482-490 prod) ====== */}
          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8) }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.personalData}</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: wp(16), gap: wp(8), marginBottom: wp(12) }}>
            {[
              { label: t.age, val: profile.age + ' ' + t.years, color: '#D4AF37' },
              { label: t.weight, val: profile.weight + ' ' + t.kg, color: '#00D984' },
              { label: t.height, val: profile.height + ' ' + t.cm, color: '#00BFA6' },
              { label: t.bmi, val: imcFormatted, color: imcColor }
            ].map(function(d, i) {
              return (
                <View key={i} style={{ width: (W - wp(40)) / 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: wp(4) }}>{d.label}</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: d.color }}>{d.val}</Text>
                </View>
              );
            })}
          </View>

          {/* ====== SECTION 3 : IMC MetalCard visuelle (l.491-524 prod) ====== */}
          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
            <MetalCard>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '800', letterSpacing: 1.5 }}>{'IMC'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={{ color: imcColor, fontSize: fp(22), fontWeight: '900' }}>{imcFormatted}</Text>
                  <Text style={{ color: '#6B7280', fontSize: fp(10), marginLeft: 4 }}>{'kg/m²'}</Text>
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
                <View style={{ position: 'absolute', left: imcBarPosPercent + '%', marginLeft: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: imcColor, borderWidth: 2, borderColor: '#1E2530' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#6B7280', fontSize: 8 }}>{'15'}</Text>
                <Text style={{ color: '#6B7280', fontSize: 8 }}>{'18.5'}</Text>
                <Text style={{ color: '#6B7280', fontSize: 8 }}>{'25'}</Text>
                <Text style={{ color: '#6B7280', fontSize: 8 }}>{'30'}</Text>
                <Text style={{ color: '#6B7280', fontSize: 8 }}>{'40'}</Text>
              </View>
            </MetalCard>
          </View>

          {/* ====== SECTION 4 : Bouton Modifier mon profil (l.526 prod) ====== */}
          <Pressable delayPressIn={120} onPress={function() {}} style={{ marginHorizontal: wp(16), marginBottom: wp(20), paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.06)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)' }}>
            <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#00D984' }}>{t.editProfile}</Text>
          </Pressable>

          {/* ====== SECTION 5 : OBJECTIF HYDRATATION MetalCard (l.528-551 prod) ====== */}
          <MetalCard style={{ marginHorizontal: wp(16), marginBottom: wp(16) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
              <Text style={{ fontSize: fp(16), marginRight: wp(6) }}>{'💧'}</Text>
              <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', letterSpacing: 1.5 }}>{'OBJECTIF HYDRATATION'}</Text>
            </View>
            <Text style={{ fontSize: fp(12), color: '#8A8F98', marginBottom: wp(12) }}>{'Recommandé : 2.5L (H) / 2.0L (F)'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <ProfileScrollPicker
                  values={(function() { var arr = []; for (var i = 5; i <= 50; i++) { arr.push(i / 10); } return arr; })()}
                  selectedValue={hydrationGoal}
                  onSelect={function(val) { setHydrationGoal(val); }}
                  unit="L"
                  color="#4DA6FF"
                  height={140}
                />
              </View>
              <View style={{ marginLeft: wp(16), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(28), fontWeight: '800', color: '#00D984' }}>{hydrationGoal.toFixed(1)}</Text>
                <Text style={{ fontSize: fp(14), color: '#8A8F98' }}>{'L'}</Text>
                {hydrationGoal === 2.5 ? (
                  <View style={{ marginTop: wp(6), backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                    <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#00D984' }}>{'Recommandé'}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={{ fontSize: fp(12), marginTop: wp(10), color: hydrationGoal === 2.5 ? '#8A8F98' : hydrationGoal < 2.5 ? '#FF8C42' : '#4DA6FF' }}>
              {hydrationGoal === 2.5 ? 'Basé sur les recommandations EFSA' : hydrationGoal < 2.5 ? 'Inférieur aux recommandations standards' : 'Supérieur aux recommandations standards'}
            </Text>
          </MetalCard>

          {/* ====== SECTION 6 : PARAMETRES (l.652-655 prod) ====== */}
          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(4) }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.settings}</Text>
          </View>
          <Section icon={'📍'} title={t.location} subtitle={t.locationSub} color="#FF8C42" rightText={t.notDefined} onPress={function() {}} />
          <Section icon={'⭐'} title={t.subscription} subtitle={t.subscriptionSub} color="#D4AF37" rightText={tierInfo.label} onPress={function() {}} />
          <Section icon={'🔔'} title={t.notifications} subtitle={t.notifSub} color="#4DA6FF" rightText={t.comingSoon} onPress={function() {}} />

          {/* ====== SECTION 7 : CONNECTEURS (l.657-660 prod) ====== */}
          <View style={{ paddingHorizontal: wp(16), marginTop: wp(16), marginBottom: wp(4) }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.connectors}</Text>
          </View>
          <Text style={{ paddingHorizontal: wp(16), fontSize: fp(11), color: 'rgba(255,255,255,0.3)', marginBottom: wp(8) }}>{t.connectorsDesc}</Text>
          <View style={{ marginHorizontal: wp(16), borderRadius: wp(14), overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: wp(16) }}>
            {CONNECTORS.map(function(conn, i) {
              return renderConnectorCard(conn, i, Object.assign({ __lang: lang.language }, t), false, function() {});
            })}
          </View>

          {/* ====== SECTION 8 : APPRENDRE (l.661-663 prod) ====== */}
          <View style={{ paddingHorizontal: wp(16), marginBottom: wp(4) }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.learn}</Text>
          </View>
          <Section icon={'📖'} title={t.glossary} subtitle={t.glossarySub} color="#9B6DFF" onPress={function() {}} />
          <Section icon={'💡'} title={t.guide} subtitle={t.guideSub} color="#00D984" onPress={function() {}} />

          {/* ====== SECTION 9 : LEGAL & SUPPORT (l.665-669 prod) ====== */}
          <View style={{ paddingHorizontal: wp(16), marginTop: wp(16), marginBottom: wp(4) }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{t.legal}</Text>
          </View>
          <Section icon={'🔒'} title={t.privacy} color="#9B6DFF" onPress={function() {}} />
          <Section icon={'📄'} title={t.terms} color="#FF8C42" onPress={function() {}} />
          <Section icon={'📧'} title={t.contact} color="#4DA6FF" onPress={function() {}} />
          <Section icon={'⭐'} title={t.rate} color="#D4AF37" onPress={function() {}} />

          {/* ====== SECTION 10 : Logout + Delete + Footer (l.672-674 prod) ====== */}
          <Pressable delayPressIn={120} onPress={function() { setShowLogoutConfirm(true); }} style={{ marginHorizontal: wp(16), marginTop: wp(16), marginBottom: wp(16), paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,107,107,0.05)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)' }}>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FF6B6B' }}>{t.logout}</Text>
          </Pressable>
          <Pressable onPress={function() { setShowDelete(true); }} style={{ marginHorizontal: wp(16), marginBottom: wp(16), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,107,107,0.4)' }}>{'Supprimer mon compte'}</Text>
          </Pressable>
          <View style={{ alignItems: 'center', paddingBottom: wp(20) }}>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.15)' }}>{'LIXUM v1.0.0-beta'}</Text>
            <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.1)', marginTop: wp(2) }}>{t.madeWith}</Text>
          </View>

        </ScrollView>

        {/* ====== Modal logout confirm (l.676-685 prod) ====== */}
        <Modal visible={showLogoutConfirm} transparent animationType="fade" onRequestClose={function() { setShowLogoutConfirm(false); }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
            <View style={{ backgroundColor: '#1A1D22', borderRadius: wp(20), padding: wp(24), width: '100%', borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)' }}>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: fp(8) }}>{t.logout}</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: wp(20) }}>{t.logoutConfirm}</Text>
              <Pressable delayPressIn={120} onPress={handleLogout} style={{ paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,107,107,0.12)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.25)', marginBottom: wp(8) }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FF6B6B' }}>{t.logout}</Text>
              </Pressable>
              <Pressable onPress={function() { setShowLogoutConfirm(false); }} style={{ paddingVertical: wp(12), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>{t.cancel}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

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
