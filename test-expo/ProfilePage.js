import React, { useState, useEffect } from 'react';
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
      await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID, { method: 'PATCH', headers: { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify({ full_name: editName.trim(), age: parseInt(editAge) || null, weight: parseFloat(editWeight) || null, height: parseFloat(editHeight) || null }) });
      Alert.alert('Profil mis à jour ✓'); setShowEditProfile(false); loadProfile();
    } catch (e) { Alert.alert('Erreur'); }
  };

  const saveLocation = async (city) => {
    setEditLocation(city); setShowLocationPicker(false);
    Alert.alert('Localisation enregistrée ✓', city + '\n\nALIXEN utilisera cette info.');
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

  // PLACEHOLDER MODALS — filled in chunk 2 and 3
  const renderModals = () => null;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#1A1D22', '#252A30', '#1E2328']} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={{ paddingBottom: wp(100) }}>
          {/* Header */}
          <View style={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingBottom: wp(20), alignItems: 'center' }}>
            <View style={{ width: wp(80), height: wp(80), borderRadius: wp(40), backgroundColor: 'rgba(0,217,132,0.12)', borderWidth: 2, borderColor: '#00D984', justifyContent: 'center', alignItems: 'center', marginBottom: wp(10) }}><Text style={{ fontSize: fp(36) }}>👤</Text></View>
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

          {/* Données */}
          <View style={{ marginBottom: wp(8) }}>
            <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>DONNÉES PERSONNELLES</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', paddingVertical: wp(12), paddingHorizontal: wp(16), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                {[{ l: 'Âge', v: (profile?.age || '—') + ' ans' }, { l: 'Poids', v: (profile?.weight || '—') + ' kg' }, { l: 'Taille', v: (profile?.height || '—') + ' cm' }, { l: 'IMC', v: imc, c: imcColor }].map((d, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>{d.l}</Text><Text style={{ fontSize: fp(14), fontWeight: '700', color: d.c || '#FFF', marginTop: wp(2) }}>{d.v}</Text></View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', paddingVertical: wp(12), paddingHorizontal: wp(16) }}>
                {[{ l: 'BMR', v: (profile?.bmr || '—') + ' kcal' }, { l: 'TDEE', v: (profile?.tdee || '—') + ' kcal' }, { l: 'Objectif', v: profile?.goal || '—' }].map((d, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}><Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>{d.l}</Text><Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF', marginTop: wp(2) }}>{d.v}</Text></View>
                ))}
              </View>
            </View>
          </View>

          <Pressable delayPressIn={120} onPress={() => setShowEditProfile(true)} style={({ pressed }) => ({ marginHorizontal: wp(16), marginBottom: wp(20), transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <LinearGradient colors={['#00D984', '#00B871']} style={{ paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>Modifier mon profil</Text></LinearGradient>
          </Pressable>

          {/* Paramètres */}
          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>PARAMÈTRES</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon="📍" title="Ma localisation" subtitle="Pour les recommandations ALIXEN" color="#FF8C42" rightText={editLocation || 'Non définie'} onPress={() => setShowLocationPicker(true)} />
            <Section icon="💳" title="Mon abonnement" subtitle="Gérer, changer ou résilier" color="#D4AF37" rightText={subTier} onPress={() => setShowSubscription(true)} />
            <Section icon="🔔" title="Notifications" subtitle="Rappels médicaments, analyses" color="#4DA6FF" onPress={() => Alert.alert('Notifications', 'Disponible après le build APK.')} />
            <Section icon="🌍" title="Langue" subtitle="Français" color="#9B6DFF" rightText="FR" onPress={() => Alert.alert('Langue', 'D\'autres langues bientôt.')} />
          </View>

          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>APPRENDRE</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon="📖" title="Comprendre les termes" subtitle="BMR, TDEE, Macros, IMC..." color="#00D984" onPress={() => setShowGlossary(true)} />
            <Section icon="🗺" title="Guide LIXUM" subtitle="Toutes les fonctionnalités" color="#4DA6FF" onPress={() => setShowFeatures(true)} />
          </View>

          <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.25)', paddingHorizontal: wp(16), paddingVertical: wp(8), letterSpacing: 1.5 }}>LÉGAL & SUPPORT</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: wp(12), borderRadius: wp(14), overflow: 'hidden', marginBottom: wp(16) }}>
            <Section icon="🔐" title="Politique de confidentialité" color="#9B6DFF" onPress={() => setShowPrivacy(true)} />
            <Section icon="📜" title="Termes et conditions" color="#FF8C42" onPress={() => setShowTerms(true)} />
            <Section icon="💬" title="Nous contacter" subtitle="support@lixum.app" color="#00D984" onPress={() => Alert.alert('Contact', 'support@lixum.app')} />
            <Section icon="⭐" title="Évaluer LIXUM" color="#D4AF37" onPress={() => Alert.alert('Merci !', 'Disponible après le Play Store.')} />
          </View>

          <Pressable delayPressIn={120} onPress={() => Alert.alert('Déconnexion', 'Es-tu sûr ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Déconnexion', style: 'destructive' }])} style={({ pressed }) => ({ marginHorizontal: wp(16), marginBottom: wp(16), paddingVertical: wp(14), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,107,107,0.05)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)' })}>
            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FF6B6B' }}>Se déconnecter</Text>
          </Pressable>

          <Pressable onPress={() => Alert.alert('Supprimer', 'Action irréversible.', [{ text: 'Annuler', style: 'cancel' }, { text: 'Supprimer', style: 'destructive' }])} style={{ marginHorizontal: wp(16), marginBottom: wp(16), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,107,107,0.4)' }}>Supprimer mon compte</Text>
          </Pressable>

          <View style={{ alignItems: 'center', paddingBottom: wp(20) }}>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.15)' }}>LIXUM v1.0.0-beta</Text>
            <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.1)', marginTop: wp(2) }}>Fait avec ❤️ au Burundi</Text>
          </View>
        </ScrollView>
        {renderModals()}
      </LinearGradient>
    </View>
  );
}
