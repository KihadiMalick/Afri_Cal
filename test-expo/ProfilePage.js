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
  const renderModals = () => (
    <>
      {/* Modal Éditer Profil */}
      <Modal visible={showEditProfile} transparent animationType="fade" onRequestClose={() => setShowEditProfile(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20) }}>
          <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%' }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(20) }}>Modifier mon profil</Text>
            {[{ label: 'Nom complet', value: editName, set: setEditName, ph: 'Malick KIHADI', kb: 'default' }, { label: 'Âge', value: editAge, set: setEditAge, ph: '25', kb: 'numeric' }, { label: 'Poids (kg)', value: editWeight, set: setEditWeight, ph: '75', kb: 'numeric' }, { label: 'Taille (cm)', value: editHeight, set: setEditHeight, ph: '178', kb: 'numeric' }].map((f, i) => (
              <View key={i} style={{ marginBottom: wp(12) }}>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(4) }}>{f.label}</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(10), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(10) }} value={f.value} onChangeText={f.set} placeholder={f.ph} placeholderTextColor="rgba(255,255,255,0.2)" keyboardType={f.kb} />
                </View>
              </View>
            ))}
            <Pressable delayPressIn={120} onPress={saveProfile} style={{ marginTop: wp(8) }}><LinearGradient colors={['#00D984', '#00B871']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Enregistrer</Text></LinearGradient></Pressable>
            <Pressable onPress={() => setShowEditProfile(false)} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(4) }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text></Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* Modal Localisation */}
      <Modal visible={showLocationPicker} transparent animationType="fade" onRequestClose={() => setShowLocationPicker(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(20) }}>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
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
              <Pressable key={i} delayPressIn={120} onPress={() => Alert.alert(p.name, 'Disponible après le Play Store.\n\n' + p.features)} style={({ pressed }) => ({ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(16), marginBottom: wp(8), borderWidth: 1, borderColor: p.color + '30', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}><Text style={{ fontSize: fp(16), fontWeight: '700', color: p.color }}>{p.name}</Text><Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{p.price}</Text></View>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>{p.lix} | Énergie {p.energy}</Text>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)', marginTop: wp(4) }}>{p.features}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => Alert.alert('Résiliation', 'Actif jusqu\'à la fin de la période.')} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(8) }}><Text style={{ fontSize: fp(12), color: 'rgba(255,107,107,0.5)' }}>Résilier mon abonnement</Text></Pressable>
            <Pressable onPress={() => setShowSubscription(false)} style={{ paddingVertical: wp(12), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '600', color: '#D4AF37' }}>Fermer</Text></Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Confidentialité */}
      <Modal visible={showPrivacy} transparent animationType="fade" onRequestClose={() => setShowPrivacy(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' }}>
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
