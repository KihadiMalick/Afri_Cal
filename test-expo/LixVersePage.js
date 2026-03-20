import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Animated, Dimensions, PixelRatio, StatusBar, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import Svg, { Defs, Rect, Path, Circle, Line, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const W = SCREEN_WIDTH;
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => Math.round(PixelRatio.roundToNearestPixel((W / BASE_WIDTH) * size));

const SUPABASE_URL = 'https://yuhordnzfpcswztujovi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';
const HEADERS = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };
const POST_HEADERS = { ...HEADERS, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };

const ALL_CHARACTERS = [
  { id: 'nutrix', name: 'NUTRIX', tier: 'standard', color: '#00D984', emoji: '🥗', desc: 'Recettes gratuites, plans -50%', bonus_abonne: 'Recettes : 5→0 Lix', bonus_non_abonne: 'Recettes 24h', unlock_hours: 24 },
  { id: 'scanix', name: 'SCANIX', tier: 'standard', color: '#4DA6FF', emoji: '📷', desc: 'Xscans extra -50%', bonus_abonne: 'Xscan : 20→10 Lix', bonus_non_abonne: 'Xscans illimités 24h', unlock_hours: 24 },
  { id: 'sporta', name: 'SPORTA', tier: 'standard', color: '#FF8C42', emoji: '🏃', desc: 'Sport -50%', bonus_abonne: 'Programme : 40→20 Lix', bonus_non_abonne: 'Sport 24h', unlock_hours: 24 },
  { id: 'healix', name: 'HEALIX', tier: 'rare', color: '#E74C3C', emoji: '💬', desc: 'Chat énergie réduite', bonus_abonne: 'Énergie : 8→5', bonus_non_abonne: 'Chat 72h', unlock_hours: 72 },
  { id: 'medika', name: 'MEDIKA', tier: 'rare', color: '#00D984', emoji: '💊', desc: 'Médical -50%', bonus_abonne: 'Recherche : 50→25', bonus_non_abonne: 'MediBook 72h', unlock_hours: 72 },
  { id: 'lokia', name: 'LOKIA', tier: 'rare', color: '#9B6DFF', emoji: '📍', desc: 'Localisation gratuite', bonus_abonne: 'Loc : 15→0 Lix', bonus_non_abonne: 'Reco locales 72h', unlock_hours: 72 },
  { id: 'shielda', name: 'SHIELDA', tier: 'rare', color: '#D4AF37', emoji: '🛡', desc: 'PDF -40%', bonus_abonne: 'PDF : 500→300', bonus_non_abonne: 'Secret Pocket 72h', unlock_hours: 72 },
  { id: 'famila', name: 'FAMILA', tier: 'rare', color: '#FF6B6B', emoji: '👨‍👩‍👧', desc: 'Famille -50%', bonus_abonne: 'Enfant : 5000→2500', bonus_non_abonne: 'Famille 72h', unlock_hours: 72 },
  { id: 'opusx', name: 'OPUSX', tier: 'elite', color: '#4DA6FF', emoji: '🧠', desc: 'Opus -40%', bonus_abonne: 'Opus : 25→15 énergie', bonus_non_abonne: 'Opus 7 jours', unlock_hours: 168 },
  { id: 'webix', name: 'WEBIX', tier: 'elite', color: '#00D984', emoji: '🌐', desc: 'Web -40%', bonus_abonne: 'Web : 42→25 énergie', bonus_non_abonne: 'Web 7 jours', unlock_hours: 168 },
  { id: 'docta', name: 'DOCTA', tier: 'elite', color: '#FF8C42', emoji: '📋', desc: 'Scan bonus', bonus_abonne: 'Scan : 15→0 Lix', bonus_non_abonne: 'Scan 7 jours', unlock_hours: 168 },
  { id: 'goldia', name: 'GOLDIA', tier: 'hyper', color: '#D4AF37', emoji: '👑', desc: '+50% énergie + premium', bonus_abonne: '+50% énergie', bonus_non_abonne: 'TOUT 30 jours', unlock_hours: 720 },
];

const TIER_CONFIG = {
  standard: { label: 'Standard', color: '#00D984', bg: 'rgba(0,217,132,0.1)', border: 'rgba(0,217,132,0.3)' },
  rare: { label: 'Rare', color: '#4DA6FF', bg: 'rgba(77,166,255,0.1)', border: 'rgba(77,166,255,0.3)' },
  elite: { label: 'Elite', color: '#9B6DFF', bg: 'rgba(155,109,255,0.1)', border: 'rgba(155,109,255,0.3)' },
  hyper: { label: 'Hyper Rare', color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.3)' },
};

const CRATES = [
  { id: 'standard', name: 'Caisse Standard', cost: 300, tier: 'standard', color: '#00D984', desc: '1 Standard', emoji: '📦' },
  { id: 'rare', name: 'Caisse Rare', cost: 800, tier: 'rare', color: '#4DA6FF', desc: '1 Rare', emoji: '🎁' },
  { id: 'elite', name: 'Caisse Elite', cost: 2000, tier: 'elite', color: '#9B6DFF', desc: '1 Elite', emoji: '💎' },
  { id: 'hyper', name: 'Caisse Hyper', cost: 5000, tier: 'hyper', color: '#D4AF37', desc: 'Elite ou GOLDIA', emoji: '👑' },
];

const SPIN_RESULTS = [
  { label: '5 Lix', weight: 25, type: 'lix', value: 5, color: '#00D984' },
  { label: '10 Lix', weight: 15, type: 'lix', value: 10, color: '#00D984' },
  { label: '25 Lix', weight: 8, type: 'lix', value: 25, color: '#4DA6FF' },
  { label: '50 Lix', weight: 3, type: 'lix', value: 50, color: '#D4AF37' },
  { label: '100 Lix', weight: 1, type: 'lix', value: 100, color: '#D4AF37' },
  { label: 'Caisse Standard', weight: 15, type: 'crate', value: 'standard', color: '#00D984' },
  { label: 'Caisse Rare', weight: 8, type: 'crate', value: 'rare', color: '#4DA6FF' },
  { label: 'Caisse Elite', weight: 3, type: 'crate', value: 'elite', color: '#9B6DFF' },
  { label: 'Caisse Hyper', weight: 1, type: 'crate', value: 'hyper', color: '#D4AF37' },
  { label: '+15 Énergie', weight: 10, type: 'energy', value: 15, color: '#FF8C42' },
  { label: '+30 Énergie', weight: 5, type: 'energy', value: 30, color: '#FF8C42' },
  { label: 'Rien...', weight: 6, type: 'nothing', value: 0, color: '#666' },
];

const LIX_PACKS = [
  { name: 'Micro', price: '$0.99', lix: 990, bonus: '', color: '#00D984' },
  { name: 'Basic', price: '$4.99', lix: 5240, bonus: '+5%', color: '#4DA6FF' },
  { name: 'Standard', price: '$9.99', lix: 10990, bonus: '+10%', color: '#9B6DFF' },
  { name: 'Mega', price: '$29.99', lix: 35990, bonus: '+20%', color: '#D4AF37' },
  { name: 'Ultra', price: '$99.99', lix: 129990, bonus: '+30%', color: '#D4AF37' },
];

export default function LixVersePage() {
  const [activeTab, setActiveTab] = useState('defi');
  const [lixBalance, setLixBalance] = useState(500);
  const [ownedCharacters, setOwnedCharacters] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [leaderboardTab, setLeaderboardTab] = useState('groups');
  const [showCharacterDetail, setShowCharacterDetail] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [freeSpinUsed, setFreeSpinUsed] = useState(false);
  const notifScrollX = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const hdrs = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (notifications.length === 0) return;
    Animated.loop(Animated.timing(notifScrollX, { toValue: -(notifications.length * wp(280)), duration: notifications.length * 5000, useNativeDriver: true })).start();
  }, [notifications]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [a,b,c,d,e] = await Promise.all([
        fetch(SUPABASE_URL+'/rest/v1/users_profile?user_id=eq.'+TEST_USER_ID+'&select=lix_balance',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_user_characters?user_id=eq.'+TEST_USER_ID+'&select=character_id',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_challenges?is_active=eq.true&order=start_date.asc',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_notifications?order=created_at.desc&limit=20',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_group_members?user_id=eq.'+TEST_USER_ID+'&select=group_id,personal_score,lixverse_groups(id,name,member_count,total_score,invite_code)',{headers:hdrs}),
      ]);
      const [aD,bD,cD,dD,eD] = await Promise.all([a.json(),b.json(),c.json(),d.json(),e.json()]);
      if(aD[0]?.lix_balance!=null)setLixBalance(aD[0].lix_balance);
      if(Array.isArray(bD))setOwnedCharacters(bD.map(x=>x.character_id));
      if(Array.isArray(cD))setChallenges(cD);
      if(Array.isArray(dD))setNotifications(dD);
      if(Array.isArray(eD))setMyGroups(eD);
    }catch(err){console.error('Load:',err);}
    setLoading(false);
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !selectedChallenge) return;
    try {
      const code = selectedChallenge.challenge_type.toUpperCase().slice(0, 5) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const h = { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
      const res = await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups', { method: 'POST', headers: h, body: JSON.stringify({ challenge_id: selectedChallenge.id, name: newGroupName.trim(), created_by: TEST_USER_ID, creator_lixtag: 'LXM-2K7F4A', invite_code: code, member_count: 1 }) });
      const g = await res.json();
      if (g && g[0]) {
        await fetch(SUPABASE_URL + '/rest/v1/lixverse_group_members', { method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ group_id: g[0].id, user_id: TEST_USER_ID, lixtag: 'LXM-2K7F4A', country: 'Burundi' }) });
        Alert.alert('Groupe créé ✓', '"' + newGroupName.trim() + '"\n\nCode : ' + code);
        setShowCreateGroup(false); setNewGroupName(''); loadAll();
      }
    } catch (e) { Alert.alert('Erreur', 'Création échouée.'); }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    try {
      const h = { ...hdrs, 'Content-Type': 'application/json' };
      const res = await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups?invite_code=eq.' + joinCode.trim().toUpperCase() + '&select=*', { headers: hdrs });
      const gs = await res.json();
      if (!gs || gs.length === 0) { Alert.alert('Code invalide'); return; }
      const g = gs[0];
      await fetch(SUPABASE_URL + '/rest/v1/lixverse_group_members', { method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ group_id: g.id, user_id: TEST_USER_ID, lixtag: 'LXM-2K7F4A', country: 'Burundi' }) });
      await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups?id=eq.' + g.id, { method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ member_count: g.member_count + 1 }) });
      Alert.alert('Rejoint ✓', '"' + g.name + '"'); setShowJoinGroup(false); setJoinCode(''); loadAll();
    } catch (e) { Alert.alert('Erreur', 'Impossible de rejoindre.'); }
  };

  const renderDefiTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100) }}>
      <View style={{ paddingHorizontal: wp(16), paddingTop: wp(16), marginBottom: wp(16) }}>
        <LinearGradient colors={['#D4AF37', '#B8941F', '#D4AF37']} style={{ borderRadius: wp(20), padding: wp(20), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.5)' }}>
          <Text style={{ fontSize: fp(28), marginBottom: wp(8) }}>🏛</Text>
          <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#FFF', letterSpacing: 1 }}>WALL OF HEALTH</Text>
          <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.7)', marginTop: wp(4), textAlign: 'center' }}>Le classement mondial de la santé LIXUM</Text>
          <View style={{ flexDirection: 'row', gap: wp(16), marginTop: wp(12) }}>
            {[{ v: challenges.length, l: 'Défis actifs' }, { v: myGroups.length, l: 'Mes groupes' }, { v: ownedCharacters.length, l: 'Caractères' }].map((s, i) => (
              <View key={i} style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#FFF' }}>{s.v}</Text>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.6)' }}>{s.l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>
      {myGroups.length > 0 && (
        <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Mes équipes</Text>
          {myGroups.map((gm, i) => {
            const g = gm.lixverse_groups; if (!g) return null;
            return (
              <View key={i} style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14), marginBottom: wp(8), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{g.name}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>{g.member_count} membres | Score: {g.total_score}</Text></View>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}><Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>Mon: {gm.personal_score || 0}</Text></View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(8), backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)' }}>Code: </Text><Text style={{ fontSize: fp(10), fontWeight: '700', color: '#D4AF37', letterSpacing: 1 }}>{g.invite_code}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
      <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Défis du mois</Text>
        {loading ? <ActivityIndicator color="#D4AF37" style={{ padding: wp(20) }} /> : challenges.map(ch => {
          const dl = new Date(ch.registration_deadline); const hLeft = Math.max(0, Math.ceil((dl - new Date()) / 3600000));
          return (
            <Pressable key={ch.id} delayPressIn={120} onPress={() => setSelectedChallenge(selectedChallenge?.id === ch.id ? null : ch)} style={({ pressed }) => ({ borderRadius: wp(16), marginBottom: wp(10), borderWidth: 1.5, borderColor: ch.color + '40', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ padding: wp(16) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(24), marginRight: wp(10) }}>{ch.icon}</Text>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>{ch.title}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{ch.duration_days}j | Max {ch.max_group_size}/équipe</Text></View>
                  <View style={{ backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3) }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FF6B6B' }}>{hLeft}h</Text></View>
                </View>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginBottom: wp(8) }}>{ch.description}</Text>
                <View style={{ flexDirection: 'row', gap: wp(6) }}>
                  {[{ e: '🥇', v: ch.reward_lix_first }, { e: '🥈', v: ch.reward_lix_second }, { e: '🥉', v: ch.reward_lix_third }].map((r, j) => (
                    <View key={j} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: j === 0 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), gap: wp(4) }}>
                      <Text style={{ fontSize: fp(10) }}>{r.e}</Text><Text style={{ fontSize: fp(10), fontWeight: '600', color: j === 0 ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}>{r.v} Lix</Text>
                    </View>
                  ))}
                </View>
                {selectedChallenge?.id === ch.id && (
                  <View style={{ marginTop: wp(10), flexDirection: 'row', gap: wp(8) }}>
                    <Pressable onPress={() => setShowCreateGroup(true)} style={{ flex: 1, paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: ch.color + '20', borderWidth: 1, borderColor: ch.color + '40' }}><Text style={{ fontSize: fp(12), fontWeight: '700', color: ch.color }}>Créer un groupe</Text></Pressable>
                    <Pressable onPress={() => setShowJoinGroup(true)} style={{ flex: 1, paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}><Text style={{ fontSize: fp(12), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Rejoindre</Text></Pressable>
                  </View>
                )}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
      <View style={{ paddingHorizontal: wp(16) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Classements</Text>
        <View style={{ flexDirection: 'row', gap: wp(6), marginBottom: wp(12) }}>
          {['Groupes', 'Personnel', 'Pays', 'Mondial'].map((t, i) => (
            <Pressable key={t} onPress={() => setLeaderboardTab(['groups', 'personal', 'country', 'global'][i])} style={{ flex: 1, paddingVertical: wp(8), borderRadius: wp(10), alignItems: 'center', backgroundColor: leaderboardTab === ['groups', 'personal', 'country', 'global'][i] ? '#D4AF37' : 'rgba(255,255,255,0.05)' }}>
              <Text style={{ fontSize: fp(10), fontWeight: '600', color: leaderboardTab === ['groups', 'personal', 'country', 'global'][i] ? '#1A1D22' : 'rgba(255,255,255,0.4)' }}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(14), padding: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          {[1, 2, 3, 4, 5].map(r => (
            <View key={r} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), borderBottomWidth: r < 5 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
              <View style={{ width: wp(28), height: wp(28), borderRadius: wp(14), backgroundColor: r <= 3 ? (r === 1 ? 'rgba(212,175,55,0.2)' : r === 2 ? 'rgba(192,192,192,0.2)' : 'rgba(205,127,50,0.2)') : 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10) }}>
                <Text style={{ fontSize: fp(12), fontWeight: '700', color: r === 1 ? '#D4AF37' : r === 2 ? '#C0C0C0' : r === 3 ? '#CD7F32' : 'rgba(255,255,255,0.3)' }}>{r}</Text>
              </View>
              <View style={{ flex: 1 }}><Text style={{ fontSize: fp(13), fontWeight: '600', color: r <= 3 ? '#FFF' : 'rgba(255,255,255,0.5)' }}>{['Team Burundi', 'Les Champions', 'Dakar Fit', 'Équipe 4', 'Équipe 5'][r - 1]}</Text></View>
              <Text style={{ fontSize: fp(14), fontWeight: '700', color: r <= 3 ? '#D4AF37' : 'rgba(255,255,255,0.3)' }}>{600 - r * 80} pts</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
  const openCrate = (crateId, cost, tier) => {
    if (lixBalance < cost) { Alert.alert('Lix insuffisants', 'Il faut ' + cost + ' Lix.\nTon solde: ' + lixBalance); return; }
    const tierChars = crateId === 'hyper' ? [...ALL_CHARACTERS.filter(c => c.tier === 'elite'), ...ALL_CHARACTERS.filter(c => c.tier === 'hyper')] : ALL_CHARACTERS.filter(c => c.tier === tier);
    let sel;
    if (crateId === 'hyper') { sel = Math.random() < 0.15 ? ALL_CHARACTERS.find(c => c.id === 'goldia') : tierChars.filter(c => c.tier === 'elite')[Math.floor(Math.random() * 3)]; }
    else { sel = tierChars[Math.floor(Math.random() * tierChars.length)]; }
    const dup = ownedCharacters.includes(sel.id);
    const ref = dup ? (sel.tier === 'standard' ? 100 : sel.tier === 'rare' ? 250 : sel.tier === 'elite' ? 700 : 2000) : 0;
    setLixBalance(p => p - cost + ref);
    if (!dup) setOwnedCharacters(p => [...p, sel.id]);
    const tc = TIER_CONFIG[sel.tier];
    if (dup) { Alert.alert(sel.emoji + ' Doublon !', sel.name + ' déjà possédé\n+' + ref + ' Lix remboursés'); }
    else { Alert.alert('🎉 ' + sel.name, tc.label + '\n' + sel.desc + '\n\nAbonné: ' + sel.bonus_abonne + '\nNon abonné: ' + sel.bonus_non_abonne + ' (' + sel.unlock_hours + 'h)'); }
    const h = { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' };
    if (!dup) fetch(SUPABASE_URL + '/rest/v1/lixverse_user_characters', { method: 'POST', headers: h, body: JSON.stringify({ user_id: TEST_USER_ID, character_id: sel.id, tier: sel.tier, obtained_via: 'crate' }) }).catch(() => {});
    fetch(SUPABASE_URL + '/rest/v1/lixverse_crate_history', { method: 'POST', headers: h, body: JSON.stringify({ user_id: TEST_USER_ID, crate_type: crateId, lix_spent: cost, character_won: sel.id, was_doublon: dup, lix_refunded: ref }) }).catch(() => {});
    fetch(SUPABASE_URL + '/rest/v1/lixverse_notifications', { method: 'POST', headers: h, body: JSON.stringify({ notification_type: 'character_won', lixtag: 'LXM-2K7F4A', message: 'LXM-2K7F4A a obtenu ' + sel.name + ' !', character_id: sel.id, color: sel.color }) }).catch(() => {});
  };

  const renderCharactersTab = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(16) }}>
        <View><Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Ma collection</Text><Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{ownedCharacters.length}/12</Text></View>
        <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' }}><Text style={{ fontSize: fp(11), fontWeight: '700', color: '#D4AF37' }}>{Math.round((ownedCharacters.length / 12) * 100)}%</Text></View>
      </View>
      {['standard', 'rare', 'elite', 'hyper'].map(tier => {
        const cfg = TIER_CONFIG[tier]; const chars = ALL_CHARACTERS.filter(c => c.tier === tier);
        return (
          <View key={tier} style={{ marginBottom: wp(20) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: wp(10) }}><View style={{ backgroundColor: cfg.bg, borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4) }}><Text style={{ fontSize: fp(11), fontWeight: '700', color: cfg.color }}>{cfg.label}</Text></View><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)' }}>{chars.filter(c => ownedCharacters.includes(c.id)).length}/{chars.length}</Text></View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) }}>
              {chars.map(ch => { const own = ownedCharacters.includes(ch.id); return (
                <Pressable key={ch.id} delayPressIn={120} onPress={() => setShowCharacterDetail(ch)} style={({ pressed }) => ({ width: (SCREEN_WIDTH - wp(48)) / 3, borderRadius: wp(16), padding: wp(12), alignItems: 'center', backgroundColor: own ? cfg.bg : 'rgba(255,255,255,0.02)', borderWidth: own ? 1.5 : 1, borderColor: own ? cfg.border : 'rgba(255,255,255,0.06)', opacity: own ? 1 : 0.45, transform: [{ scale: pressed ? 0.93 : 1 }] })}>
                  <Text style={{ fontSize: fp(28), marginBottom: wp(6) }}>{own ? ch.emoji : '❓'}</Text>
                  <Text style={{ fontSize: fp(9), fontWeight: '700', textAlign: 'center', color: own ? cfg.color : 'rgba(255,255,255,0.25)' }}>{own ? ch.name : '???'}</Text>
                  {own && <View style={{ backgroundColor: cfg.color, borderRadius: wp(4), paddingHorizontal: wp(6), paddingVertical: wp(1), marginTop: wp(4) }}><Text style={{ fontSize: fp(7), fontWeight: '700', color: '#FFF' }}>POSSÉDÉ</Text></View>}
                </Pressable>
              ); })}
            </View>
          </View>
        );
      })}
      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12), marginTop: wp(8) }}>Ouvrir une caisse</Text>
      {CRATES.map(cr => (
        <Pressable key={cr.id} delayPressIn={120} onPress={() => openCrate(cr.id, cr.cost, cr.tier)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(14), borderRadius: wp(14), marginBottom: wp(8), borderWidth: 1.5, borderColor: cr.color + '40', backgroundColor: cr.color + '08', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
          <Text style={{ fontSize: fp(28), marginRight: wp(12) }}>{cr.emoji}</Text>
          <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{cr.name}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>{cr.desc}</Text></View>
          <View style={{ backgroundColor: cr.color + '25', borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: wp(5) }}><Text style={{ fontSize: fp(12), fontWeight: '700', color: cr.color }}>{cr.cost}</Text></View>
        </Pressable>
      ))}
    </ScrollView>
  );
  const renderLixSpinTab = () => (<ScrollView style={{flex:1}} contentContainerStyle={{padding:wp(16),paddingBottom:wp(100)}}><Text style={{color:'#FFF',fontSize:fp(14)}}>Lix & Spin — sera rempli par chunk 4</Text></ScrollView>);

  return (
    <View style={{flex:1}}>
      <LinearGradient colors={['#1A1D22','#252A30','#1E2328']} style={{flex:1}}>
        <StatusBar barStyle="light-content"/>
        <View style={{paddingTop:Platform.OS==='android'?35:50,paddingBottom:wp(6),paddingHorizontal:wp(16),flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
          <View>
            <Text style={{fontSize:fp(24),fontWeight:'800',color:'#D4AF37',letterSpacing:1}}>LixVerse</Text>
            <Text style={{fontSize:fp(9),color:'rgba(255,255,255,0.3)',letterSpacing:2.5}}>UNIVERS LIXUM</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:wp(6),backgroundColor:'rgba(212,175,55,0.12)',borderRadius:wp(12),paddingHorizontal:wp(12),paddingVertical:wp(6),borderWidth:1,borderColor:'rgba(212,175,55,0.25)'}}>
            <View style={{width:wp(10),height:wp(10),borderRadius:wp(5),backgroundColor:'#D4AF37'}}/>
            <Text style={{fontSize:fp(14),fontWeight:'700',color:'#D4AF37'}}>{lixBalance} Lix</Text>
          </View>
        </View>
        {notifications.length>0&&(<View style={{height:wp(28),backgroundColor:'rgba(212,175,55,0.06)',borderBottomWidth:1,borderBottomColor:'rgba(212,175,55,0.1)',overflow:'hidden',justifyContent:'center'}}><Animated.View style={{flexDirection:'row',transform:[{translateX:notifScrollX}]}}>{[...notifications,...notifications].map((n,i)=>(<View key={i} style={{width:wp(280),flexDirection:'row',alignItems:'center',paddingHorizontal:wp(10),gap:wp(6)}}><View style={{width:wp(6),height:wp(6),borderRadius:wp(3),backgroundColor:n.color||'#D4AF37'}}/><Text style={{fontSize:fp(10),color:'rgba(255,255,255,0.5)',flex:1}} numberOfLines={1}>{n.message}</Text></View>))}</Animated.View></View>)}
        <View style={{flexDirection:'row',marginHorizontal:wp(16),marginVertical:wp(10),gap:wp(6)}}>
          {[{key:'defi',label:'Défi',icon:'🏆'},{key:'characters',label:'Caractères',icon:'🃏'},{key:'lixspin',label:'Lix & Spin',icon:'💎'}].map(tab=>(<Pressable key={tab.key} onPress={()=>setActiveTab(tab.key)} style={{flex:1,paddingVertical:wp(10),borderRadius:wp(12),alignItems:'center',backgroundColor:activeTab===tab.key?'#D4AF37':'rgba(255,255,255,0.05)',borderWidth:1,borderColor:activeTab===tab.key?'#D4AF37':'rgba(255,255,255,0.08)'}}><Text style={{fontSize:fp(14)}}>{tab.icon}</Text><Text style={{fontSize:fp(10),fontWeight:'600',marginTop:wp(2),color:activeTab===tab.key?'#1A1D22':'rgba(255,255,255,0.4)'}}>{tab.label}</Text></Pressable>))}
        </View>
        {activeTab==='defi'&&renderDefiTab()}
        {activeTab==='characters'&&renderCharactersTab()}
        {activeTab==='lixspin'&&renderLixSpinTab()}
      </LinearGradient>
    </View>
  );
}