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

// ScrollPicker — identique au Register
const ProfileScrollPicker = (pickerProps) => {
  const values = pickerProps.values;
  const selectedValue = pickerProps.selectedValue;
  const onSelect = pickerProps.onSelect;
  const unit = pickerProps.unit;
  const color = pickerProps.color || '#00D984';
  const pickerHeight = pickerProps.height || 160;
  const ITEM_H = 40;
  const scrollRef = useRef(null);

  const initialIdx = Math.max(0, values.indexOf(selectedValue));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: initialIdx * ITEM_H, animated: false });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const snapToNearest = useCallback((event) => {
    const y = event.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, values.length - 1));
    if (values[clamped] !== selectedValue) onSelect(values[clamped]);
  }, [values, selectedValue, onSelect]);

  return (
    <View style={{ height: pickerHeight, borderRadius: wp(12), overflow: 'hidden', borderWidth: 1, borderColor: color + '18', backgroundColor: '#0A0E14' }}>
      <View style={{ position: 'absolute', top: pickerHeight / 2 - ITEM_H / 2, left: wp(4), right: wp(4), height: ITEM_H, borderRadius: wp(8), backgroundColor: color + '0D', zIndex: 0 }}>
        <View style={{ position: 'absolute', left: 0, top: wp(4), bottom: wp(4), width: wp(3), borderRadius: wp(2), backgroundColor: color }} />
      </View>
      <LinearGradient colors={['#0A0E14', 'rgba(10,14,20,0.5)', 'rgba(10,14,20,0)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: pickerHeight * 0.35, zIndex: 3 }} pointerEvents="none" />
      <LinearGradient colors={['rgba(10,14,20,0)', 'rgba(10,14,20,0.5)', '#0A0E14']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: pickerHeight * 0.35, zIndex: 3 }} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate={0.92}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled={true}
        onMomentumScrollEnd={snapToNearest}
        onScrollEndDrag={(e) => {
          const v = e.nativeEvent.velocity;
          if (!v || Math.abs(v.y) < 0.1) snapToNearest(e);
        }}
        contentContainerStyle={{ paddingTop: pickerHeight / 2 - ITEM_H / 2, paddingBottom: pickerHeight / 2 - ITEM_H / 2 }}
      >
        {values.map((val, i) => {
          const isSel = val === selectedValue;
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
  const [profile, setProfile] = useState(null);
  const [lixBalance, setLixBalance] = useState(0);
  const [ownedCharacters, setOwnedCharacters] = useState(0);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [lang, setLang] = useState('fr');
  const T = {
    fr: {
      personalData: 'DONNÉES PERSONNELLES',
      age: 'Âge', weight: 'Poids', height: 'Taille', bmi: 'IMC',
      years: 'ans', kg: 'kg', cm: 'cm',
      editProfile: 'Modifier mon profil',
      settings: 'PARAMÈTRES',
      location: 'Ma localisation', locationSub: 'Pour les recommandations ALIXEN',
      subscription: 'Mon abonnement', subscriptionSub: 'Gérer, changer ou résilier',
      notifications: 'Notifications', notifSub: 'Rappels médicaments, analyses',
      learn: 'APPRENDRE',
      glossary: 'Comprendre les termes', glossarySub: 'BMR, TDEE, Macros, IMC...',
      guide: 'Guide LIXUM', guideSub: 'Toutes les fonctionnalités',
      legal: 'LÉGAL & SUPPORT',
      privacy: 'Politique de confidentialité',
      terms: 'Termes et conditions',
      contact: 'Nous contacter',
      rate: 'Évaluer LIXUM',
      logout: 'Se déconnecter',
      deleteAccount: 'Supprimer mon compte',
      logoutConfirm: 'Es-tu sûr ?',
      deleteConfirm: 'Action irréversible.',
      cancel: 'Annuler',
      notDefined: 'Non définie',
      free: 'Gratuit',
      objective: 'Objectif',
      madeWith: 'Fait avec ❤️ au Burundi',
    },
    en: {
      personalData: 'PERSONAL DATA',
      age: 'Age', weight: 'Weight', height: 'Height', bmi: 'BMI',
      years: 'yrs', kg: 'kg', cm: 'cm',
      editProfile: 'Edit my profile',
      settings: 'SETTINGS',
      location: 'My location', locationSub: 'For ALIXEN recommendations',
      subscription: 'My subscription', subscriptionSub: 'Manage, change or cancel',
      notifications: 'Notifications', notifSub: 'Medication, test reminders',
      learn: 'LEARN',
      glossary: 'Understand the terms', glossarySub: 'BMR, TDEE, Macros, BMI...',
      guide: 'LIXUM Guide', guideSub: 'All features',
      legal: 'LEGAL & SUPPORT',
      privacy: 'Privacy policy',
      terms: 'Terms and conditions',
      contact: 'Contact us',
      rate: 'Rate LIXUM',
      logout: 'Log out',
      deleteAccount: 'Delete my account',
      logoutConfirm: 'Are you sure?',
      deleteConfirm: 'This action is irreversible.',
      cancel: 'Cancel',
      notDefined: 'Not set',
      free: 'Free',
      objective: 'Goal',
      madeWith: 'Made with ❤️ in Burundi',
    },
  };
  const t = T[lang] || T.fr;
  const [toast, setToast] = useState(null);

  const showToast = (message, color) => {
    setToast({ message, color: color || '#00D984' });
    setTimeout(() => setToast(null), 2500);
  };
  const hdrs = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID + '&select=*', { headers: hdrs }),
        fetch(SUPABASE_URL + '/rest/v1/lixverse_user_characters?user_id=eq.' + TEST_USER_ID + '&select=character_id', { headers: hdrs }),
      ]);
      const [pD, cD] = await Promise.all([pRes.json(), cRes.json()]);
      if (pD && pD[0]) { setProfile(pD[0]); setLixBalance(pD[0].lix_balance || 0); setEditName(pD[0].full_name || ''); setEditAge(String(pD[0].age || '')); setEditWeight(String(pD[0].weight || '')); setEditHeight(String(pD[0].height || '')); }
      if (Array.isArray(cD)) setOwnedCharacters(cD.length);
    } catch (e) { console.error('Profile:', e); }
  };

  const saveProfile = async () => {
    try {
      const h = { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
      const body = {
        full_name: editName.trim(),
        age: parseInt(editAge) || null,
        weight: parseFloat(editWeight) || null,
        height: parseFloat(editHeight) || null,
      };
      const res = await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID, {
        method: 'PATCH', headers: h, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data && data[0]) {
        setProfile(data[0]);
        setLixBalance(data[0].lix_balance || 0);
      }
      setShowEditProfile(false);
      showToast('Profil mis à jour ✓', '#00D984');
    } catch (e) { showToast('Erreur de sauvegarde', '#FF6B6B'); }
  };

  const saveLocation = async (city) => {
    setEditLocation(city); setShowLocationPicker(false);
    showToast('📍 ' + city + ' enregistrée', '#FF8C42');
  };

  const Section = ({ icon, title, subtitle, onPress, color, rightText }) => (
    <Pressable delayPressIn={120} onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(14), paddingHorizontal: wp(16), backgroundColor: pressed ? 'rgba(255,255,255,0.04)' : 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' })}>
      <View style={{ width: wp(36), height: wp(36), borderRadius: wp(10), backgroundColor: (color || '#00D984') + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}><Text style={{ fontSize: fp(16) }}>{icon}</Text></View>
      <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{title}</Text>{subtitle && <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(1) }}>{subtitle}</Text>}</View>
      {rightText && <Text style={{ fontSize: fp(11), color: color || 'rgba(255,255,255,0.3)', fontWeight: '600' }}>{rightText}</Text>}
      <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.15)', marginLeft: wp(8) }}>›</Text>
    </Pressable>
  );

  const imc = profile ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : '—';
  const imcColor = imc < 18.5 ? '#FF8C42' : imc < 25 ? '#00D984' : imc < 30 ? '#FF8C42' : '#FF6B6B';
  const subTier = profile?.is_premium ? 'Gold' : 'Gratuit';
  const subColor = profile?.is_premium ? '#D4AF37' : 'rgba(255,255,255,0.3)';

  const ACTIVITY_LEVELS = [
    { label: 'Sédentaire', desc: 'Peu ou pas d\'exercice', emoji: '🛋️' },
    { label: 'Légèrement actif', desc: '1-2 fois/semaine', emoji: '🚶‍♂️' },
    { label: 'Modérément actif', desc: '3-5 fois/semaine', emoji: '🚴‍♂️' },
    { label: 'Très actif', desc: '6-7 fois/semaine', emoji: '🏋️‍♂️' },
    { label: 'Extrêmement actif', desc: 'Athlète / travail physique', emoji: '🔥' },
  ];
  const DIETS = [
    { key: 'classic', label: 'Classique', emoji: '🍗', color: '#00D984' },
    { key: 'vegetarian', label: 'Végétarien', emoji: '🥬', color: '#00BFA6' },
    { key: 'vegan', label: 'Végan', emoji: '🌱', color: '#00D984' },
    { key: 'keto', label: 'Kéto', emoji: '🥑', color: '#D4AF37' },
    { key: 'halal', label: 'Halal', emoji: '🌙', color: '#00BFA6' },
  ];
  const GOALS = [
    { key: 'lose', label: 'Perte de poids', emoji: '📉', color: '#00BFA6' },
    { key: 'maintain', label: 'Maintien', emoji: '⚖️', color: '#00D984' },
    { key: 'gain', label: 'Prise de masse', emoji: '📈', color: '#D4AF37' },
  ];

  const renderModals = () => (
    <>
      {/* Modal Éditer Profil — COMPLET */}
      <Modal visible={showEditProfile} transparent animationType="fade" onRequestClose={() => setShowEditProfile(false)}>
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
            <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#00D984', marginBottom: wp(20) }}>{t.editProfile}</Text>

            {/* Nom */}
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(4) }}>Nom complet</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(10), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(12) }}>
              <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(10) }} value={editName} onChangeText={setEditName} placeholder="Malick KIHADI" placeholderTextColor="rgba(255,255,255,0.2)" />
            </View>

            {/* Âge / Poids / Taille — ScrollPickers */}
            <View style={{ flexDirection: 'row', gap: wp(6), marginBottom: wp(16), height: wp(160) }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', marginBottom: wp(4), textAlign: 'center', fontWeight: '700', letterSpacing: 1.5 }}>POIDS</Text>
                <ProfileScrollPicker
                  values={Array.from({ length: 171 }, (_, i) => 30 + i)}
                  selectedValue={parseInt(editWeight) || 70}
                  onSelect={(v) => setEditWeight(String(v))}
                  unit="kg"
                  color="#00D984"
                  height={wp(130)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', marginBottom: wp(4), textAlign: 'center', fontWeight: '700', letterSpacing: 1.5 }}>TAILLE</Text>
                <ProfileScrollPicker
                  values={Array.from({ length: 101 }, (_, i) => 120 + i)}
                  selectedValue={parseInt(editHeight) || 175}
                  onSelect={(v) => setEditHeight(String(v))}
                  unit="cm"
                  color="#00BFA6"
                  height={wp(130)}
                />
              </View>
              <View style={{ flex: 0.8 }}>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', marginBottom: wp(4), textAlign: 'center', fontWeight: '700', letterSpacing: 1.5 }}>ÂGE</Text>
                <ProfileScrollPicker
                  values={Array.from({ length: 84 }, (_, i) => 12 + i)}
                  selectedValue={parseInt(editAge) || 25}
                  onSelect={(v) => setEditAge(String(v))}
                  unit="ans"
                  color="#D4AF37"
                  height={wp(130)}
                />
              </View>
            </View>

            {/* Sexe */}
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8) }}>Sexe</Text>
            <View style={{ flexDirection: 'row', gap: wp(10), marginBottom: wp(16) }}>
              {[{ key: 'male', label: 'Homme', emoji: '♂️', color: '#4A90D9' }, { key: 'female', label: 'Femme', emoji: '♀️', color: '#E875A0' }].map(g => {
                const sel = (profile?.gender || 'male') === g.key;
                return (
                  <Pressable key={g.key} onPress={() => setProfile(p => p ? { ...p, gender: g.key } : p)} style={{ flex: 1, paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: sel ? g.color + '15' : 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: sel ? g.color + '40' : 'rgba(255,255,255,0.08)' }}>
                    <Text style={{ fontSize: fp(20) }}>{g.emoji}</Text>
                    <Text style={{ fontSize: fp(11), fontWeight: '600', color: sel ? g.color : 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>{g.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Niveau d'activité */}
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8) }}>Niveau d'activité</Text>
            {ACTIVITY_LEVELS.map((lvl, i) => {
              const sel = (profile?.activity_level ?? 2) === i;
              return (
                <Pressable key={i} onPress={() => setProfile(p => p ? { ...p, activity_level: i } : p)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), paddingHorizontal: wp(12), borderRadius: wp(10), marginBottom: wp(6), backgroundColor: sel ? 'rgba(0,217,132,0.08)' : 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: sel ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.06)', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
                  <Text style={{ fontSize: fp(20), marginRight: wp(10) }}>{lvl.emoji}</Text>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(12), fontWeight: '600', color: sel ? '#00D984' : '#FFF' }}>{lvl.label}</Text><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>{lvl.desc}</Text></View>
                  {sel && <Text style={{ fontSize: fp(14), color: '#00D984' }}>✓</Text>}
                </Pressable>
              );
            })}

            {/* Régime alimentaire */}
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8), marginTop: wp(12) }}>Régime alimentaire</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(6), marginBottom: wp(16) }}>
              {DIETS.map(d => {
                const sel = (profile?.diet || 'classic') === d.key;
                return (
                  <Pressable key={d.key} onPress={() => setProfile(p => p ? { ...p, diet: d.key } : p)} style={{ paddingVertical: wp(8), paddingHorizontal: wp(12), borderRadius: wp(10), backgroundColor: sel ? d.color + '15' : 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: sel ? d.color + '35' : 'rgba(255,255,255,0.06)' }}>
                    <Text style={{ fontSize: fp(11), color: sel ? d.color : 'rgba(255,255,255,0.4)' }}>{d.emoji} {d.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Objectif */}
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(8) }}>Mon objectif</Text>
            <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(20) }}>
              {GOALS.map(g => {
                const sel = (profile?.goal || 'maintain') === g.key;
                return (
                  <Pressable key={g.key} onPress={() => setProfile(p => p ? { ...p, goal: g.key } : p)} style={{ flex: 1, paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: sel ? g.color + '12' : 'rgba(255,255,255,0.03)', borderWidth: 1.5, borderColor: sel ? g.color + '40' : 'rgba(255,255,255,0.06)' }}>
                    <Text style={{ fontSize: fp(22) }}>{g.emoji}</Text>
                    <Text style={{ fontSize: fp(9), fontWeight: '600', color: sel ? g.color : 'rgba(255,255,255,0.4)', marginTop: wp(4), textAlign: 'center' }}>{g.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Boutons */}
            <Pressable delayPressIn={120} onPress={saveProfile} style={{ marginBottom: wp(8) }}>
              <LinearGradient colors={['#00D984', '#00B871']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Enregistrer les modifications</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setShowEditProfile(false)} style={{ paddingVertical: wp(12), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Localisation */}
      <Modal visible={showLocationPicker} transparent animationType="fade" onRequestClose={() => setShowLocationPicker(false)}>
        <View style={{ flex: 1, backgroundColor: '#1A1D22', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20), paddingTop: Platform.OS === 'android' ? 35 : 50 }}>
          <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%' }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>Ma localisation</Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(16) }}>ALIXEN utilisera cette info pour recommander des lieux près de toi.</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(10), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(16) }}>
              <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} value={editLocation} onChangeText={setEditLocation} placeholder="Ex : Bujumbura" placeholderTextColor="rgba(255,255,255,0.2)" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(16) }}>
              <View style={{ flexDirection: 'row', gap: wp(6) }}>
                {['Bujumbura', 'Kigali', 'Nairobi', 'Dakar', 'Abidjan', 'Kinshasa', 'Lagos', 'Douala', 'Paris', 'Bruxelles'].map(c => (
                  <Pressable key={c} onPress={() => setEditLocation(c)} style={{ paddingHorizontal: wp(12), paddingVertical: wp(6), borderRadius: wp(8), backgroundColor: editLocation === c ? '#00D984' : 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: editLocation === c ? '#00D984' : 'rgba(255,255,255,0.08)' }}><Text style={{ fontSize: fp(12), color: editLocation === c ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{c}</Text></Pressable>
                ))}
              </View>
            </ScrollView>
            <Pressable delayPressIn={120} onPress={() => editLocation.trim() ? saveLocation(editLocation.trim()) : Alert.alert('Choisis une ville')}><LinearGradient colors={['#00D984', '#00B871']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Enregistrer</Text></LinearGradient></Pressable>
            <Pressable onPress={() => setShowLocationPicker(false)} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(4) }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text></Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* Modal Glossaire */}
      <Modal visible={showGlossary} transparent animationType="fade" onRequestClose={() => setShowGlossary(false)}>
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
            <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#00D984', marginBottom: wp(20) }}>Comprendre les termes</Text>
            {[
              { t: 'BMR', d: 'Basal Metabolic Rate — Calories brûlées au repos pour survivre.' },
              { t: 'TDEE', d: 'Total Daily Energy Expenditure — Calories totales brûlées par jour avec activité.' },
              { t: 'Protéines', d: 'Pour les muscles et os. Sources : viande, poisson, œufs, légumineuses.' },
              { t: 'Glucides', d: 'Source d\'énergie principale. Sources : riz, pain, manioc, plantain.' },
              { t: 'Lipides', d: 'Graisses pour le cerveau et hormones. Sources : huile, avocat, noix.' },
              { t: 'IMC', d: 'Indice de Masse Corporelle. Poids / Taille². Normal : 18.5-24.9.' },
              { t: 'Score Vitalité', d: 'Score LIXUM 0-100 basé sur nutrition, hydratation, activité, mood et suivi médical.' },
              { t: 'Lix', d: 'Monnaie virtuelle LIXUM. 1$ = 1000 Lix. Recharge énergie, ouvre caisses.' },
              { t: 'Énergie', d: 'Carburant pour ALIXEN et scans. Reset chaque jour à minuit.' },
              { t: 'Xscan', d: 'Scanner un plat avec la caméra pour calories et macros via IA.' },
            ].map((g, i) => (
              <View key={i} style={{ marginBottom: wp(14), backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12), padding: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#00D984', marginBottom: wp(4) }}>{g.t}</Text>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', lineHeight: fp(18) }}>{g.d}</Text>
              </View>
            ))}
            <Pressable onPress={() => setShowGlossary(false)} style={{ paddingVertical: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#00D984' }}>Fermer</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Guide */}
      <Modal visible={showFeatures} transparent animationType="fade" onRequestClose={() => setShowFeatures(false)}>
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
            <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#4DA6FF', marginBottom: wp(20) }}>Guide LIXUM</Text>
            {[
              { i: '🏠', n: 'Dashboard', d: 'Vue d\'ensemble : calories, hydratation, vitalité, humeur.' },
              { i: '🍽', n: 'Repas', d: 'Scan photo ou saisie manuelle. Suivi macros temps réel.' },
              { i: '🏃', n: 'Activité', d: 'Marche et course avec distance, durée, calories.' },
              { i: '🤖', n: 'ALIXEN', d: 'Coach santé IA. Nutrition, médicaments, recommandations locales.' },
              { i: '📋', n: 'MediBook', d: 'Dossier médical : médicaments, analyses, allergies.' },
              { i: '🔒', n: 'Secret Pocket', d: 'Coffre-fort sécurisé pour documents santé.' },
              { i: '🏆', n: 'LixVerse', d: 'Défis, groupes, Wall of Health, caractères, Spin Wheel.' },
              { i: '🎰', n: 'Spin Wheel', d: 'Tourne la roue pour Lix, énergie ou caisses.' },
              { i: '🃏', n: 'Caractères', d: '13 cartes à collectionner avec bonus et réductions.' },
            ].map((f, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: wp(12), backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12), padding: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                <Text style={{ fontSize: fp(28), marginRight: wp(12) }}>{f.i}</Text>
                <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>{f.n}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.45)', lineHeight: fp(16) }}>{f.d}</Text></View>
              </View>
            ))}
            <Pressable onPress={() => setShowFeatures(false)} style={{ paddingVertical: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#4DA6FF' }}>Fermer</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Abonnement */}
      <Modal visible={showSubscription} transparent animationType="fade" onRequestClose={() => setShowSubscription(false)}>
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
            <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#D4AF37', marginBottom: wp(16) }}>Mon abonnement</Text>
            <View style={{ backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: wp(16), padding: wp(20), marginBottom: wp(20), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center' }}>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)' }}>Plan actuel</Text>
              <Text style={{ fontSize: fp(28), fontWeight: '800', color: subColor, marginTop: wp(4) }}>{subTier}</Text>
            </View>
            {[
              { name: 'Silver', price: '$4.99/mois', lix: '6 000 Lix', energy: '60/jour', color: '#A4B0BE', features: 'ALIXEN + Recettes + 3 Xscans/jour' },
              { name: 'Gold', price: '$9.99/mois', lix: '12 000 Lix', energy: '150/jour', color: '#D4AF37', features: 'Silver + MediBook + Secret Pocket + Scan médical' },
              { name: 'Platinum', price: '$14.99/mois', lix: '20 000 Lix', energy: '300/jour', color: '#00CEC9', features: 'TOUT débloqué + Famille + Priorité' },
            ].map((p, i) => (
              <Pressable key={i} delayPressIn={120} onPress={() => showToast('💳 ' + p.name + ' — disponible au lancement', p.color)} style={({ pressed }) => ({ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(16), marginBottom: wp(8), borderWidth: 1, borderColor: p.color + '30', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}><Text style={{ fontSize: fp(16), fontWeight: '700', color: p.color }}>{p.name}</Text><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{p.price}</Text></View>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>{p.lix} | Énergie {p.energy}</Text>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)', marginTop: wp(4) }}>{p.features}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => showToast('Actif jusqu\'à la fin de la période', '#FF6B6B')} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(8) }}><Text style={{ fontSize: fp(12), color: 'rgba(255,107,107,0.5)' }}>Résilier mon abonnement</Text></Pressable>
            <Pressable onPress={() => setShowSubscription(false)} style={{ paddingVertical: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#D4AF37' }}>Fermer</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Confidentialité */}
      <Modal visible={showPrivacy} transparent animationType="fade" onRequestClose={() => setShowPrivacy(false)}>
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
            <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#9B6DFF', marginBottom: wp(16) }}>Politique de confidentialité</Text>
            {[
              { t: 'Données collectées', d: 'Profil, repas, scans, données médicales, activité — uniquement ce que tu fournis.' },
              { t: 'Utilisation', d: 'Suivi santé personnalisé via ALIXEN. Aucune donnée vendue à des tiers.' },
              { t: 'Stockage', d: 'Serveurs sécurisés Supabase (AWS). Secret Pocket chiffré.' },
              { t: 'Localisation', d: 'Usage unique effacé après utilisation. En profil, sauvegardé avec ton accord.' },
              { t: 'IA', d: 'Conversations ALIXEN via API Anthropic. Non stockées au-delà du traitement.' },
              { t: 'Suppression', d: 'Demande suppression complète à tout moment depuis le profil.' },
              { t: 'RGPD', d: 'Droit d\'accès, rectification, portabilité et suppression de tes données.' },
            ].map((s, i) => (
              <View key={i} style={{ marginBottom: wp(14) }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#9B6DFF', marginBottom: wp(4) }}>{s.t}</Text><Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.45)', lineHeight: fp(18) }}>{s.d}</Text></View>
            ))}
            <Pressable onPress={() => setShowPrivacy(false)} style={{ paddingVertical: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#9B6DFF' }}>Fermer</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Termes */}
      <Modal visible={showTerms} transparent animationType="fade" onRequestClose={() => setShowTerms(false)}>
        <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <ScrollView contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(20), paddingBottom: wp(40) }}>
            <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#FF8C42', marginBottom: wp(16) }}>Termes et conditions</Text>
            {[
              { t: 'Acceptation', d: 'En utilisant LIXUM, tu acceptes ces termes.' },
              { t: 'Service', d: 'LIXUM est un compagnon santé IA. Ne remplace PAS un avis médical.' },
              { t: 'Compte', d: 'Tu es responsable de la sécurité de ton compte. Un seul par personne.' },
              { t: 'Lix et achats', d: 'Monnaie virtuelle non remboursable. Abonnements résiliables.' },
              { t: 'Caractères', d: 'Objets virtuels basés sur la chance. Probabilités affichées.' },
              { t: 'Contenu', d: 'Pas de contenu inapproprié. Messages Wall of Health modérés.' },
              { t: 'Propriété', d: 'LIXUM, ALIXEN, LixVerse sont propriété de LIXUM. Reproduction interdite.' },
              { t: 'Responsabilité', d: 'LIXUM non responsable des décisions santé basées sur l\'app.' },
              { t: 'Modifications', d: 'Termes modifiables. Utilisateurs informés des changements.' },
            ].map((s, i) => (
              <View key={i} style={{ marginBottom: wp(14) }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FF8C42', marginBottom: wp(4) }}>{s.t}</Text><Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.45)', lineHeight: fp(18) }}>{s.d}</Text></View>
            ))}
            <Pressable onPress={() => setShowTerms(false)} style={{ paddingVertical: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FF8C42' }}>Fermer</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#1A1D22', '#252A30', '#1E2328']} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingBottom: wp(100) }}>
          {/* Header */}
          <View style={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingBottom: wp(20) }}>
            {/* Drapeaux langue en haut à droite */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: wp(16), marginBottom: wp(12), gap: wp(6) }}>
              <Pressable onPress={() => setLang('fr')} style={{ paddingHorizontal: wp(8), paddingVertical: wp(5), borderRadius: wp(6), borderWidth: 1, borderColor: lang === 'fr' ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.08)', backgroundColor: lang === 'fr' ? 'rgba(0,217,132,0.08)' : 'transparent' }}>
                <Text style={{ fontSize: fp(14) }}>🇫🇷</Text>
              </Pressable>
              <Pressable onPress={() => setLang('en')} style={{ paddingHorizontal: wp(8), paddingVertical: wp(5), borderRadius: wp(6), borderWidth: 1, borderColor: lang === 'en' ? 'rgba(0,217,132,0.4)' : 'rgba(255,255,255,0.08)', backgroundColor: lang === 'en' ? 'rgba(0,217,132,0.08)' : 'transparent' }}>
                <Text style={{ fontSize: fp(14) }}>🇬🇧</Text>
              </Pressable>
            </View>
            <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>{profile?.full_name || '...'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginTop: wp(4) }}>
              <View style={{ backgroundColor: subColor + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(2), borderWidth: 1, borderColor: subColor + '40' }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: subColor }}>{subTier}</Text></View>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)' }}>{profile?.lixtag || 'LXM-2K7F4A'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: wp(16), marginTop: wp(16) }}>
              {[{ v: lixBalance, l: 'Lix', c: '#D4AF37' }, { v: ownedCharacters + '/13', l: 'Cartes', c: '#4DA6FF' }, { v: profile?.discipline_streak || 0, l: 'Streak', c: '#00D984' }].map((s, i) => (
                <View key={i} style={{ alignItems: 'center' }}><Text style={{ fontSize: fp(18), fontWeight: '800', color: s.c }}>{s.v}</Text><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{s.l}</Text></View>
              ))}
            </View>
            </View>
          </View>

          {/* Données */}
          <View style={{ marginBottom: wp(8) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.personalData}</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', paddingVertical: wp(12), paddingHorizontal: wp(16), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                {[{ l: t.age, v: (profile?.age || '—') + ' ' + t.years }, { l: t.weight, v: (profile?.weight || '—') + ' ' + t.kg }, { l: t.height, v: (profile?.height || '—') + ' ' + t.cm }, { l: t.bmi, v: imc, c: imcColor }].map((d, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>{d.l}</Text><Text style={{ fontSize: fp(14), fontWeight: '700', color: d.c || '#FFF', marginTop: wp(2) }}>{d.v}</Text></View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', paddingVertical: wp(12), paddingHorizontal: wp(16) }}>
                {[{ l: 'BMR', v: (profile?.bmr || '—') + ' kcal' }, { l: 'TDEE', v: (profile?.tdee || '—') + ' kcal' }, { l: t.objective, v: profile?.goal || '—' }].map((d, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>{d.l}</Text><Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF', marginTop: wp(2) }}>{d.v}</Text></View>
                ))}
              </View>
            </View>
          </View>

          <Pressable delayPressIn={120} onPress={() => setShowEditProfile(true)} style={({ pressed }) => ({ marginHorizontal: wp(16), marginBottom: wp(20), transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <LinearGradient colors={['#00D984', '#00B871']} style={{ paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{t.editProfile}</Text></LinearGradient>
          </Pressable>

          {/* Paramètres */}
          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.settings}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon="📍" title={t.location} subtitle={t.locationSub} color="#FF8C42" rightText={editLocation || t.notDefined} onPress={() => setShowLocationPicker(true)} />
            <Section icon="💳" title={t.subscription} subtitle={t.subscriptionSub} color="#D4AF37" rightText={subTier} onPress={() => setShowSubscription(true)} />
            <Section icon="🔔" title={t.notifications} subtitle={t.notifSub} color="#4DA6FF" onPress={() => showToast('🔔 Disponible après le build', '#4DA6FF')} />

          </View>

          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.learn}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon="📖" title={t.glossary} subtitle={t.glossarySub} color="#00D984" onPress={() => setShowGlossary(true)} />
            <Section icon="🗺" title={t.guide} subtitle={t.guideSub} color="#4DA6FF" onPress={() => setShowFeatures(true)} />
          </View>

          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>{t.legal}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon="🔐" title={t.privacy} color="#9B6DFF" onPress={() => setShowPrivacy(true)} />
            <Section icon="📜" title={t.terms} color="#FF8C42" onPress={() => setShowTerms(true)} />
            <Section icon="💬" title={t.contact} subtitle="support@lixum.app" color="#00D984" onPress={() => showToast('💬 support@lixum.app', '#00D984')} />
            <Section icon="⭐" title={t.rate} color="#D4AF37" onPress={() => showToast('⭐ Merci ! Disponible au lancement', '#D4AF37')} />
          </View>

          <Pressable delayPressIn={120} onPress={() => Alert.alert('Déconnexion', t.logoutConfirm, [{ text: t.cancel, style: 'cancel' }, { text: 'Déconnexion', style: 'destructive' }])} style={({ pressed }) => ({ marginHorizontal: wp(16), marginBottom: wp(16), paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,107,107,0.05)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)' })}>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FF6B6B' }}>{t.logout}</Text>
          </Pressable>

          <Pressable onPress={() => Alert.alert('Supprimer', t.deleteConfirm, [{ text: t.cancel, style: 'cancel' }, { text: 'Supprimer', style: 'destructive' }])} style={{ marginHorizontal: wp(16), marginBottom: wp(16), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,107,107,0.4)' }}>{t.deleteAccount}</Text>
          </Pressable>

          <View style={{ alignItems: 'center', paddingBottom: wp(20) }}>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.15)' }}>LIXUM v1.0.0-beta</Text>
            <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.1)', marginTop: wp(2) }}>{t.madeWith}</Text>
          </View>
        </ScrollView>
        {renderModals()}
        {/* Toast notification custom */}
        {toast && (
          <View style={{
            position: 'absolute', top: Platform.OS === 'android' ? 45 : 60,
            left: wp(20), right: wp(20),
            backgroundColor: '#252A30', borderRadius: wp(14),
            paddingVertical: wp(14), paddingHorizontal: wp(20),
            flexDirection: 'row', alignItems: 'center', gap: wp(10),
            borderWidth: 1.5, borderColor: toast.color + '40',
            shadowColor: toast.color, shadowOpacity: 0.3, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 10,
            zIndex: 9999,
          }}>
            <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: toast.color }} />
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', flex: 1 }}>{toast.message}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}
