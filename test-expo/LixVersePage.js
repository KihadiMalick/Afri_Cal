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

  const renderDefiTab = () => (<ScrollView style={{flex:1}} contentContainerStyle={{padding:wp(16),paddingBottom:wp(100)}}><Text style={{color:'#FFF',fontSize:fp(14)}}>Défi — sera rempli par chunk 2</Text></ScrollView>);
  const renderCharactersTab = () => (<ScrollView style={{flex:1}} contentContainerStyle={{padding:wp(16),paddingBottom:wp(100)}}><Text style={{color:'#FFF',fontSize:fp(14)}}>Caractères — sera rempli par chunk 3</Text></ScrollView>);
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