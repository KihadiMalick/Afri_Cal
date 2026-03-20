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
  const [wallStickers, setWallStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [stickerCatalog, setStickerCatalog] = useState([]);
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
      // Wall of Health stickers
      const wallRes = await fetch(SUPABASE_URL + '/rest/v1/wall_stickers?is_visible=eq.true&order=like_count.desc&limit=30', { headers: hdrs });
      const wallData = await wallRes.json();
      if (Array.isArray(wallData)) setWallStickers(wallData);
      // Sticker catalog
      const catRes = await fetch(SUPABASE_URL + '/rest/v1/wall_sticker_catalog?is_available=eq.true&order=sort_order.asc', { headers: hdrs });
      const catData = await catRes.json();
      if (Array.isArray(catData)) setStickerCatalog(catData);
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
      {/* WALL OF HEALTH — Mur magnétique */}
      <View style={{ marginBottom: wp(16) }}>
        <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#D4AF37', letterSpacing: 1 }}>WALL OF HEALTH</Text>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)' }}>{wallStickers.length} stickers</Text>
        </View>
        {/* Le mur gris métallique */}
        <View style={{
          marginHorizontal: wp(8), borderRadius: wp(16), overflow: 'hidden',
          borderWidth: 2, borderColor: 'rgba(74,79,85,0.6)',
        }}>
          <LinearGradient colors={['#3A3F46', '#2D3238', '#3A3F46', '#333840']}
            style={{ minHeight: wp(280), padding: wp(12), position: 'relative' }}>
            {/* Vis métalliques aux coins */}
            {[[wp(8), wp(8)], [wp(8), null, null, wp(8)], [null, null, wp(8), wp(8)], [null, wp(8), wp(8)]].map((pos, i) => (
              <View key={i} style={{
                position: 'absolute', zIndex: 10,
                top: pos[0] != null ? pos[0] : undefined,
                right: pos[1] != null ? pos[1] : undefined,
                bottom: pos[2] != null ? pos[2] : undefined,
                left: pos[3] != null ? pos[3] : undefined,
                width: wp(10), height: wp(10), borderRadius: wp(5),
                backgroundColor: 'rgba(74,79,85,0.8)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              }} />
            ))}
            {/* Titre gravé */}
            <View style={{ alignItems: 'center', marginBottom: wp(12), paddingTop: wp(8) }}>
              <Text style={{ fontSize: fp(8), fontWeight: '700', color: 'rgba(212,175,55,0.4)', letterSpacing: 3 }}>✦ LIXUM WALL OF HEALTH ✦</Text>
            </View>
            {/* Stickers disposés organiquement */}
            {wallStickers.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: wp(40) }}>
                <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.2)' }}>Le mur attend ses premiers héros...</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: wp(10), paddingBottom: wp(8) }}>
                {wallStickers.slice(0, 12).map((sticker, i) => (
                  <Pressable key={sticker.id || i} delayPressIn={80}
                    onPress={() => setSelectedSticker(sticker)}
                    style={({ pressed }) => ({
                      width: wp(75), alignItems: 'center', padding: wp(6),
                      transform: [
                        { scale: pressed ? 0.88 : 1 },
                        { rotate: (sticker.rotation || (i % 2 === 0 ? -5 : 5)) + 'deg' },
                      ],
                    })}>
                    {/* Aimant */}
                    <View style={{
                      width: wp(18), height: wp(6), borderRadius: wp(3),
                      backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: wp(-3), zIndex: 2,
                    }} />
                    {/* Sticker card */}
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(10),
                      padding: wp(8), alignItems: 'center', width: '100%',
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                    }}>
                      <Text style={{ fontSize: fp(22) }}>{sticker.sticker_emoji}</Text>
                      <Text style={{ fontSize: fp(7), fontWeight: '600', color: '#FFF', marginTop: wp(3) }} numberOfLines={1}>
                        {sticker.display_name}
                      </Text>
                      <Text style={{ fontSize: fp(6), color: 'rgba(255,255,255,0.35)', marginTop: wp(1), fontStyle: 'italic' }} numberOfLines={1}>
                        {sticker.message}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4), marginTop: wp(3) }}>
                        <Text style={{ fontSize: fp(7), color: 'rgba(255,255,255,0.25)' }}>
                          {sticker.like_count >= 1000 ? (sticker.like_count / 1000).toFixed(1) + 'K' : sticker.like_count} 🩶
                        </Text>
                        {sticker.lix_received > 0 && (
                          <Text style={{ fontSize: fp(7), color: 'rgba(212,175,55,0.4)' }}>
                            {sticker.lix_received} L
                          </Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </LinearGradient>
        </View>
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
  const doSpin = () => {
    if (isSpinning) return;
    const cost = freeSpinUsed ? 50 : 0;
    if (cost > 0 && lixBalance < cost) { Alert.alert('Lix insuffisants', 'Il faut 50 Lix.\nSolde: ' + lixBalance); return; }
    setIsSpinning(true); setSpinResult(null);
    if (cost > 0) setLixBalance(p => p - cost);
    if (!freeSpinUsed) setFreeSpinUsed(true);
    const tw = SPIN_RESULTS.reduce((s, r) => s + r.weight, 0);
    let rn = Math.random() * tw; let res = SPIN_RESULTS[0];
    for (const r of SPIN_RESULTS) { rn -= r.weight; if (rn <= 0) { res = r; break; } }
    spinAnim.setValue(0);
    Animated.timing(spinAnim, { toValue: (5 + Math.random() * 3) * 360, duration: 3000 + Math.random() * 1500, useNativeDriver: true }).start(() => {
      setIsSpinning(false); setSpinResult(res);
      if (res.type === 'lix') setLixBalance(p => p + res.value);
      fetch(SUPABASE_URL + '/rest/v1/lixverse_spin_history', { method: 'POST', headers: { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }, body: JSON.stringify({ user_id: TEST_USER_ID, result_type: res.type, result_value: String(res.value), lix_spent: cost, was_free: cost === 0 }) }).catch(() => {});
    });
  };

  const renderLixSpinTab = () => {
    const spinCost = freeSpinUsed ? 50 : 0;
    const rot = spinAnim.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100) }}>
        <View style={{ alignItems: 'center', paddingTop: wp(16), marginBottom: wp(20) }}>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', letterSpacing: 2, marginBottom: wp(4) }}>MON SOLDE</Text>
          <Text style={{ fontSize: fp(32), fontWeight: '800', color: '#D4AF37' }}>{lixBalance.toLocaleString('fr-FR')}</Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(212,175,55,0.5)' }}>Lix</Text>
        </View>
        <View style={{ alignItems: 'center', marginBottom: wp(24) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(14) }}>Spin Wheel</Text>
          {!freeSpinUsed && <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(10), paddingHorizontal: wp(14), paddingVertical: wp(6), marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)' }}><Text style={{ fontSize: fp(12), fontWeight: '600', color: '#00D984' }}>1 tour gratuit !</Text></View>}
          <View style={{ width: wp(200), height: wp(200), marginBottom: wp(16) }}>
            <Animated.View style={{ width: wp(200), height: wp(200), borderRadius: wp(100), borderWidth: wp(4), borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.04)', transform: [{ rotate: rot }] }}>
              {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (<View key={i} style={{ position: 'absolute', width: wp(2), height: wp(80), backgroundColor: ['#00D984','#4DA6FF','#FF8C42','#9B6DFF','#D4AF37','#FF6B6B','#00D984','#4DA6FF','#FF8C42','#9B6DFF','#D4AF37','#FF6B6B'][i] + '30', top: wp(20), left: wp(99), transform: [{ rotate: (i*30)+'deg' }], transformOrigin: 'bottom center' }} />))}
              <View style={{ width: wp(50), height: wp(50), borderRadius: wp(25), backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: fp(10), fontWeight: '800', color: '#FFF' }}>LIX</Text></View>
            </Animated.View>
          </View>
          <Pressable delayPressIn={120} onPress={doSpin} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], opacity: isSpinning ? 0.5 : 1 })}>
            <LinearGradient colors={spinCost === 0 ? ['#00D984','#00B871'] : ['#D4AF37','#B8941F']} style={{ paddingHorizontal: wp(36), paddingVertical: wp(14), borderRadius: wp(24) }}>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>{isSpinning ? '...' : spinCost === 0 ? 'Tourner GRATUIT' : 'Tourner — 50 Lix'}</Text>
            </LinearGradient>
          </Pressable>
          {spinResult && <View style={{ marginTop: wp(16), paddingVertical: wp(14), paddingHorizontal: wp(24), borderRadius: wp(14), alignItems: 'center', backgroundColor: spinResult.color + '15', borderWidth: 1, borderColor: spinResult.color + '30' }}><Text style={{ fontSize: fp(18), fontWeight: '700', color: spinResult.type === 'nothing' ? 'rgba(255,255,255,0.3)' : spinResult.color }}>{spinResult.type === 'nothing' ? '😔 Rien' : '🎉 ' + spinResult.label}</Text></View>}
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: wp(16), marginBottom: wp(20) }} />
        <View style={{ paddingHorizontal: wp(16) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Acheter des Lix</Text>
          {[{ n: 'Micro', p: '$0.99', l: 990, b: '', c: '#00D984' }, { n: 'Basic', p: '$4.99', l: 5240, b: '+5%', c: '#4DA6FF' }, { n: 'Standard', p: '$9.99', l: 10990, b: '+10%', c: '#9B6DFF' }, { n: 'Mega', p: '$29.99', l: 35990, b: '+20%', c: '#D4AF37' }, { n: 'Ultra', p: '$99.99', l: 129990, b: '+30%', c: '#D4AF37' }].map((pk, i) => (
            <Pressable key={i} delayPressIn={120} onPress={() => Alert.alert('Achat', pk.n + ' : ' + pk.p + ' → ' + pk.l.toLocaleString('fr-FR') + ' Lix\n\nBientôt disponible.')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(14), borderRadius: wp(14), marginBottom: wp(8), backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: pk.c + '25', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: pk.c + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}><Text style={{ fontSize: fp(16), fontWeight: '800', color: pk.c }}>L</Text></View>
              <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{pk.n}</Text>{pk.b ? <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(1) }}><Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37' }}>{pk.b}</Text></View> : null}</View><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{pk.l.toLocaleString('fr-FR')} Lix</Text></View>
              <View style={{ backgroundColor: pk.c + '20', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6) }}><Text style={{ fontSize: fp(13), fontWeight: '700', color: pk.c }}>{pk.p}</Text></View>
            </Pressable>
          ))}
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: wp(12) }}>Les Lix ne débloquent pas le premium. Abonnez-vous pour MedicAi et plus.</Text>
        </View>
        <View style={{ paddingHorizontal: wp(16), marginTop: wp(24) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>Recharger énergie</Text>
          {[{ n: 'Mini', e: 30, l: 300, d: '~3 chats' }, { n: 'Standard', e: 80, l: 700, d: '~8 chats' }, { n: 'XL', e: 200, l: 1500, d: '~20 chats' }].map((pk, i) => (
            <Pressable key={i} delayPressIn={120} onPress={() => { if (lixBalance < pk.l) { Alert.alert('Insuffisant', pk.l + ' Lix requis'); return; } setLixBalance(p => p - pk.l); Alert.alert('✓', '+' + pk.e + ' énergie !'); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: wp(12), borderRadius: wp(12), marginBottom: wp(6), backgroundColor: 'rgba(0,217,132,0.05)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)', transform: [{ scale: pressed ? 0.97 : 1 }] })}>
              <Text style={{ fontSize: fp(14), marginRight: wp(10) }}>⚡</Text>
              <View style={{ flex: 1 }}><Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>+{pk.e} énergie</Text><Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{pk.d}</Text></View>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#00D984' }}>{pk.l} Lix</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  };

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
      <Modal visible={showCreateGroup} transparent animationType="fade" onRequestClose={() => setShowCreateGroup(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
          <LinearGradient colors={['#2A2F36','#1E2328','#252A30']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%' }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>Créer un groupe</Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(20) }}>{selectedChallenge?.title || 'Défi'}</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(20) }}>
              <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} placeholder="Nom de ton équipe..." placeholderTextColor="rgba(255,255,255,0.25)" value={newGroupName} onChangeText={setNewGroupName} autoFocus maxLength={30} />
            </View>
            <Pressable delayPressIn={120} onPress={createGroup}><LinearGradient colors={['#D4AF37','#B8941F']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Créer et inviter</Text></LinearGradient></Pressable>
            <Pressable onPress={() => setShowCreateGroup(false)} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(8) }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text></Pressable>
          </LinearGradient>
        </View>
      </Modal>
      <Modal visible={showJoinGroup} transparent animationType="fade" onRequestClose={() => setShowJoinGroup(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
          <LinearGradient colors={['#2A2F36','#1E2328','#252A30']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%' }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>Rejoindre un groupe</Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(20) }}>Code d'invitation de ton ami</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: wp(20) }}>
              <TextInput style={{ fontSize: fp(18), color: '#D4AF37', paddingVertical: wp(14), textAlign: 'center', letterSpacing: 2, fontWeight: '700' }} placeholder="XXXXX-XXXX" placeholderTextColor="rgba(212,175,55,0.3)" value={joinCode} onChangeText={setJoinCode} autoFocus autoCapitalize="characters" maxLength={10} />
            </View>
            <Pressable delayPressIn={120} onPress={joinGroup}><LinearGradient colors={['#00D984','#00B871']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center' }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Rejoindre</Text></LinearGradient></Pressable>
            <Pressable onPress={() => setShowJoinGroup(false)} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(8) }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text></Pressable>
          </LinearGradient>
        </View>
      </Modal>
      {showCharacterDetail && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowCharacterDetail(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
            <LinearGradient colors={['#2A2F36','#1E2328','#252A30']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: fp(48), marginBottom: wp(10) }}>{showCharacterDetail.emoji}</Text>
              <View style={{ backgroundColor: TIER_CONFIG[showCharacterDetail.tier].bg, borderRadius: wp(8), paddingHorizontal: wp(12), paddingVertical: wp(4), marginBottom: wp(8) }}><Text style={{ fontSize: fp(11), fontWeight: '700', color: TIER_CONFIG[showCharacterDetail.tier].color }}>{TIER_CONFIG[showCharacterDetail.tier].label}</Text></View>
              <Text style={{ fontSize: fp(22), fontWeight: '800', color: showCharacterDetail.color, marginBottom: wp(6) }}>{showCharacterDetail.name}</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: wp(16) }}>{showCharacterDetail.desc}</Text>
              <View style={{ width: '100%', backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(8), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)' }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: '#00D984', marginBottom: wp(4) }}>SI ABONNÉ :</Text><Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)' }}>{showCharacterDetail.bonus_abonne}</Text></View>
              <View style={{ width: '100%', backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: wp(12), padding: wp(12), marginBottom: wp(20), borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)' }}><Text style={{ fontSize: fp(10), fontWeight: '700', color: '#D4AF37', marginBottom: wp(4) }}>SI NON ABONNÉ :</Text><Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)' }}>{showCharacterDetail.bonus_non_abonne} ({showCharacterDetail.unlock_hours}h)</Text></View>
              {ownedCharacters.includes(showCharacterDetail.id) ? <View style={{ backgroundColor: showCharacterDetail.color + '20', borderRadius: wp(14), paddingVertical: wp(12), width: '100%', alignItems: 'center' }}><Text style={{ fontSize: fp(14), fontWeight: '700', color: showCharacterDetail.color }}>✓ Possédé</Text></View> : <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: wp(14), paddingVertical: wp(12), width: '100%', alignItems: 'center' }}><Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)' }}>Ouvre des caisses !</Text></View>}
              <Pressable onPress={() => setShowCharacterDetail(null)} style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(12) }}><Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Fermer</Text></Pressable>
            </LinearGradient>
          </View>
        </Modal>
      )}
      {/* Modal Sticker Detail */}
      {selectedSticker && !showGiftModal && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setSelectedSticker(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
            <LinearGradient colors={['#3A3F46', '#2D3238', '#3A3F46']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(74,79,85,0.6)' }}>
              <Text style={{ fontSize: fp(56), marginBottom: wp(8) }}>{selectedSticker.sticker_emoji}</Text>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', marginBottom: wp(2) }}>{selectedSticker.display_name}</Text>
              {selectedSticker.country_flag && <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(6) }}>{selectedSticker.country_flag} {selectedSticker.country}</Text>}
              <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(10), paddingHorizontal: wp(14), paddingVertical: wp(8), marginBottom: wp(12) }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', textAlign: 'center' }}>"{selectedSticker.message}"</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: wp(16), marginBottom: wp(16) }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#FFF' }}>{selectedSticker.vitality_score?.toFixed(0) || '—'}</Text>
                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>Vitalité</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#FFF' }}>{selectedSticker.like_count >= 1000 ? (selectedSticker.like_count / 1000).toFixed(1) + 'K' : selectedSticker.like_count}</Text>
                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>🩶 Likes</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(20), fontWeight: '800', color: '#D4AF37' }}>{selectedSticker.lix_received}</Text>
                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>Lix reçus</Text>
                </View>
              </View>
              {/* Bouton Like */}
              <Pressable delayPressIn={50}
                onPress={() => {
                  setSelectedSticker(s => ({ ...s, like_count: (s.like_count || 0) + 1 }));
                  setWallStickers(prev => prev.map(s => s.id === selectedSticker.id ? { ...s, like_count: (s.like_count || 0) + 1 } : s));
                  fetch(SUPABASE_URL + '/rest/v1/rpc/like_wall_sticker', { method: 'POST', headers: { ...hdrs, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_sticker_id: selectedSticker.id, p_user_id: TEST_USER_ID }) }).catch(() => {});
                }}
                style={({ pressed }) => ({
                  width: '100%', paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
                  transform: [{ scale: pressed ? 0.95 : 1 }], marginBottom: wp(8),
                })}>
                <Text style={{ fontSize: fp(16), fontWeight: '600', color: '#FFF' }}>🩶 Liker</Text>
              </Pressable>
              {/* Bouton Offrir Lix */}
              <Pressable delayPressIn={120}
                onPress={() => setShowGiftModal(true)}
                style={({ pressed }) => ({
                  width: '100%', paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
                  transform: [{ scale: pressed ? 0.95 : 1 }], marginBottom: wp(8),
                })}>
                <Text style={{ fontSize: fp(16), fontWeight: '600', color: '#D4AF37' }}>🎁 Offrir des Lix</Text>
              </Pressable>
              <Pressable onPress={() => setSelectedSticker(null)} style={{ paddingVertical: wp(10) }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Fermer</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </Modal>
      )}
      {/* Modal Gift Lix */}
      {showGiftModal && selectedSticker && (
        <Modal visible={true} transparent animationType="fade" onRequestClose={() => setShowGiftModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
            <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: fp(32), marginBottom: wp(8) }}>🎁</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>Offrir des Lix à {selectedSticker.display_name}</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(20) }}>Ton solde : {lixBalance} Lix</Text>
              {[10, 50, 100, 500].map(amount => (
                <Pressable key={amount} delayPressIn={120}
                  onPress={() => {
                    if (lixBalance < amount) { Alert.alert('Lix insuffisants'); return; }
                    setLixBalance(p => p - amount);
                    setSelectedSticker(s => ({ ...s, lix_received: (s.lix_received || 0) + amount }));
                    setWallStickers(prev => prev.map(s => s.id === selectedSticker.id ? { ...s, lix_received: (s.lix_received || 0) + amount } : s));
                    fetch(SUPABASE_URL + '/rest/v1/rpc/gift_lix_to_sticker', { method: 'POST', headers: { ...hdrs, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_sticker_id: selectedSticker.id, p_from_user_id: TEST_USER_ID, p_amount: amount }) }).catch(() => {});
                    Alert.alert('Merci 🎁', amount + ' Lix offerts à ' + selectedSticker.display_name + ' !');
                    setShowGiftModal(false);
                  }}
                  style={({ pressed }) => ({
                    width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    paddingVertical: wp(14), paddingHorizontal: wp(16), borderRadius: wp(12), marginBottom: wp(6),
                    backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{amount} Lix</Text>
                  <Text style={{ fontSize: fp(12), color: '#D4AF37' }}>Offrir →</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setShowGiftModal(false)} style={{ paddingVertical: wp(12), marginTop: wp(8) }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </Modal>
      )}
    </View>
  );
}