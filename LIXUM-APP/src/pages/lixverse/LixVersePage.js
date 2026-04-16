import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TouchableOpacity,
  Platform, Animated, Dimensions, PixelRatio, StatusBar,
  Modal, TextInput, ActivityIndicator, Image, Easing } from 'react-native';
import Svg, { Defs, Path, Circle, Rect, Line,
  LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { wp, fp } from '../../constants/layout';
import BottomTabs from '../../components/shared/NavBar';
import {
  SUPABASE_URL, SUPABASE_ANON_KEY,
  HEADERS, POST_HEADERS, ALL_CHARACTERS, CHAR_NAMES,
  CHAR_EMOJIS, FRAGS_NIV1, TIER_CONFIG, SLUGS_BY_TIER,
  randomSlugFromTier, NAV_TABS,
  WORLD_DOTS
} from './lixverseConstants';
import { useAuth } from '../../config/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { LixGem } from './lixverseComponents';
import PageHeader from '../../components/shared/PageHeader';
import DefiTab from './DefiTab';
import CharactersTab from './CharactersTab';
import HumanTab from './HumanTab';
import LixShopTab from './LixShopTab';

const SCREEN_WIDTH = Dimensions.get('window').width;
const W = SCREEN_WIDTH;

export default function LixVersePage({ navigation }) {
  var auth = useAuth(); var userId = auth.userId;
  var lixBalance = auth.lixBalance; var updateLixBalance = auth.updateLixBalance;
  var userEnergy = auth.energy; var refreshLixFromServer = auth.refreshLixFromServer;
  var alixenNotifications = auth.alixenNotifications || [];
  var alixenNotifCount = auth.notifCount || 0;
  var markNotificationRead = auth.markNotificationRead;
  var markAllNotificationsRead = auth.markAllNotificationsRead;
  const [activeTab, setActiveTab] = useState('defi');
  const [ownedCharacters, setOwnedCharacters] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengeScores, setChallengeScores] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [eligibilityChecking, setEligibilityChecking] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [leaderboardTab, setLeaderboardTab] = useState('equipes');
  const [leaderboardExpanded, setLeaderboardExpanded] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [leaderboardChallengeId, setLeaderboardChallengeId] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [challengeLeaders, setChallengeLeaders] = useState({});
  const [expandedRewards, setExpandedRewards] = useState({});
  const [individualLB, setIndividualLB] = useState(null);
  const [countryLB, setCountryLB] = useState(null);
  const [lbTabLoading, setLbTabLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetail, setGroupDetail] = useState(null);
  const [groupDetailLoading, setGroupDetailLoading] = useState(false);
  const [poking, setPoking] = useState(false);
  const [publicProfile, setPublicProfile] = useState(null);
  const [publicProfileLoading, setPublicProfileLoading] = useState(false);
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [showSearchGroup, setShowSearchGroup] = useState(false);
  const [searchGroupQuery, setSearchGroupQuery] = useState('');
  const [searchGroupResults, setSearchGroupResults] = useState([]);
  const [searchGroupLoading, setSearchGroupLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [pendingRequestsLoading, setPendingRequestsLoading] = useState(false);
  const [showCharacterDetail, setShowCharacterDetail] = useState(null);
  const [wallStickers, setWallStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [shakingSticker, setShakingSticker] = useState(null);
  const [comboCount, setComboCount] = useState({});
  const [comboTimer, setComboTimer] = useState({});
  const [strikeActive, setStrikeActive] = useState({});
  const stickerShakeAnims = useRef({}).current;
  const [lixAlert, setLixAlert] = useState({ visible: false, title: '', message: '', emoji: '', buttons: [] });
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifList, setNotifList] = useState([]);
  var lixverseUnread = notifList.filter(function(n) { return !n.read; }).length;
  var unreadCount = lixverseUnread + alixenNotifCount;
  const [stickerCatalog, setStickerCatalog] = useState([]);
  const [myCertification, setMyCertification] = useState(null);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showStickerCreation, setShowStickerCreation] = useState(false);
  const [selectedStickerChoice, setSelectedStickerChoice] = useState(null);
  const [stickerMessage, setStickerMessage] = useState('');
  const notifScrollX = useRef(new Animated.Value(0)).current;
  const [binomeStatus, setBinomeStatus] = useState('none');
  const [binomePartner, setBinomePartner] = useState(null);
  const [binomeCommonPoints, setBinomeCommonPoints] = useState([]);
  const [binomeDistance, setBinomeDistance] = useState(null);
  const [binomePokes, setBinomePokes] = useState([]);
  const [showLixSignPicker, setShowLixSignPicker] = useState(false);
  const [lixSignCategory, setLixSignCategory] = useState('encouragement');
  const [binomeMessages, setBinomeMessages] = useState([]);
  const [showBinomeAlert, setShowBinomeAlert] = useState({ visible: false, title: '', message: '', icon: null, buttons: [] });
  const [showBreakConfirm, setShowBreakConfirm] = useState(false);
  const [tooltipSign, setTooltipSign] = useState(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStep, setSearchStep] = useState(0);
  const [searchCoords, setSearchCoords] = useState({ lat: '—', lng: '—' });
  const [compatibilityScore, setCompatibilityScore] = useState(0);
  const [scanLines, setScanLines] = useState([]);
  const [retryAfterTime, setRetryAfterTime] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState('');
  const radarAnim = useRef(new Animated.Value(0)).current;
  const radarScale = useRef(new Animated.Value(0.2)).current;
  const radarOpacity = useRef(new Animated.Value(0.8)).current;
  const pulseRing1 = useRef(new Animated.Value(0)).current;
  const pulseRing2 = useRef(new Animated.Value(0)).current;
  const pulseRing3 = useRef(new Animated.Value(0)).current;
  const coordsFlicker = useRef(new Animated.Value(1)).current;
  const compatAnim = useRef(new Animated.Value(0)).current;
  const pendingPulse = useRef(new Animated.Value(0.6)).current;
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharDetail, setShowCharDetail] = useState(false);
  const [charOnboarded, setCharOnboarded] = useState(null);
  const [userCollection, setUserCollection] = useState([]);
  const [activeCharSlug, setActiveCharSlug] = useState(null);
  const [showCharOnboarding, setShowCharOnboarding] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);
  const [previewChar, setPreviewChar] = useState(null);
  const [cardViewIndex, setCardViewIndex] = useState(0);
  const [charFlipped, setCharFlipped] = useState(false);
  const [charPowers, setCharPowers] = useState([]);
  const [loadingPowers, setLoadingPowers] = useState(false);
  const [onboardingSelected, setOnboardingSelected] = useState(null);
  const [inlinePowerModal, setInlinePowerModal] = useState(null);
  const [humanTab, setHumanTab] = useState('binome');
  const [userNameAvatar, setUserNameAvatar] = useState('');
  const flipAnim = useRef(new Animated.Value(0)).current;
  const cardViewIndexRef = useRef(0);
  const cardSlideAnim = useRef(new Animated.Value(0)).current;
  const floatingHeartTimersRef = useRef([]);
  const binomeSearchTimersRef = useRef([]);
  const binomeSearchIntervalsRef = useRef([]);
  const [inlinePowerData, setInlinePowerData] = useState(null);
  const [inlinePowerLoading, setInlinePowerLoading] = useState(false);

  const showLixAlert = (title, message, buttons = [], emoji = '') => {
    setLixAlert({ visible: true, title, message, emoji, buttons });
  };
  const hideLixAlert = () => setLixAlert(prev => ({ ...prev, visible: false }));

  useEffect(() => {
    return () => {
      floatingHeartTimersRef.current.forEach(t => clearTimeout(t));
      binomeSearchTimersRef.current.forEach(t => clearTimeout(t));
      binomeSearchIntervalsRef.current.forEach(t => clearInterval(t));
    };
  }, []);


  const navigateCard = (direction) => {
    const newIdx = cardViewIndex + direction;
    if (newIdx < 0 || newIdx >= ALL_CHARACTERS.length) return;
    Animated.timing(cardSlideAnim, {
      toValue: -direction,
      duration: 180,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      cardViewIndexRef.current = newIdx;
      setCardViewIndex(newIdx);
      cardSlideAnim.setValue(direction);
      Animated.spring(cardSlideAnim, {
        toValue: 0, friction: 9, tension: 120,
        useNativeDriver: true,
      }).start();
    });
  };

  const supaRpc = async (fnName, params = {}) => {
    const res = await fetch(SUPABASE_URL + '/rest/v1/rpc/' + fnName, {
      method: 'POST', headers: POST_HEADERS, body: JSON.stringify(params),
    });
    return res.json();
  };

  const flipCard = () => {
    const toVal = charFlipped ? 0 : 1;
    Animated.timing(flipAnim, {
      toValue: toVal, duration: 300, useNativeDriver: true,
    }).start(() => setCharFlipped(!charFlipped));
  };

  const FREE_POWER_TYPES = ['toggle'];
  const FREE_POWER_KEYS = ['owl_resume_macros', 'owl_alerte_macros', 'fox_mode_regime'];

  const shouldConsumePower = (power) => {
    if (FREE_POWER_TYPES.includes(power.action_type)) return false;
    if (FREE_POWER_KEYS.includes(power.power_key)) return false;
    return true;
  };

  async function loadCharacterData() {
    try {
      if (!userId) return;
      const onb = await supaRpc('check_character_onboarding', { p_user_id: userId });
      const isOnboarded = onb?.first_character_chosen || false;
      setCharOnboarded(isOnboarded);
      if (!isOnboarded) {
        setShowCharOnboarding(true);
        const charsRes = await fetch(SUPABASE_URL + '/rest/v1/lixverse_characters?tier=eq.standard&order=sort_order.asc', { headers: HEADERS });
        const chars = await charsRes.json();
        setUserCollection((chars || []).map(c => ({ ...c, owned: false, level: 0, fragments: 0, fragments_required: FRAGS_NIV1[c.tier] || 3 })));
        return;
      }
      const collection = await supaRpc('get_user_collection', { p_user_id: userId });
      if (collection && Array.isArray(collection)) {
        setUserCollection(collection);
        const active = collection.find(c => c.is_active);
        if (active) setActiveCharSlug(active.slug);
      }
    } catch (e) {
      console.error('Character load error:', e);
    }
  }

  async function chooseFirstCharacter(slug) {
    try {
      const data = await supaRpc('choose_first_character', { p_user_id: userId, p_slug: slug });
      if (data?.success) {
        setCharOnboarded(true);
        setShowCharOnboarding(false);
        setActiveCharSlug(slug);
        loadCharacterData();
      }
    } catch (e) {
      console.error('Choose character error:', e);
    }
  }

  async function switchActiveCharacter(slug) {
    try {
      const data = await supaRpc('set_active_character', { p_user_id: userId, p_slug: slug });
      if (data?.success) {
        setActiveCharSlug(slug);
        setUserCollection(prev => prev.map(c => ({ ...c, is_active: c.slug === slug })));
      }
    } catch (e) {
      console.error('Switch character error:', e);
    }
  }

  async function loadCharPowers(slug) {
    setLoadingPowers(true);
    try {
      const data = await supaRpc('get_character_powers', { p_user_id: userId, p_slug: slug });
      setCharPowers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Powers load error:', e);
    }
    setLoadingPowers(false);
  }

  async function consumePower(powerKey) {
    try {
      const data = await supaRpc('use_character_power', { p_user_id: userId, p_power_key: powerKey });
      if (data?.success) {
        setUserCollection(prev => prev.map(c =>
          c.slug === selectedChar?.slug
            ? { ...c, uses_remaining: data.uses_remaining }
            : c
        ));
        return { success: true, uses_remaining: data.uses_remaining };
      }
      if (data?.error === 'No uses remaining') {
        showLixAlert('⚡ Utilisations épuisées',
          'Recharge ton ' + (selectedChar?.name || '') + ' dans l\'onglet Caractères.',
          [{ text: 'Recharger', color: '#00D984', onPress: () => rechargeChar() }, { text: 'Fermer', style: 'cancel' }], '⚡');
        return { success: false, error: 'no_uses' };
      }
      return { success: false, error: data?.error };
    } catch (e) {
      console.error('Consume power error:', e);
      return { success: false, error: 'network' };
    }
  }

  async function rechargeChar() {
    if (!selectedChar) return;
    try {
      const data = await supaRpc('recharge_character', { p_user_id: userId, p_slug: selectedChar.slug });
      if (data?.success) {
        setUserCollection(prev => prev.map(c =>
          c.slug === selectedChar.slug
            ? { ...c, uses_remaining: data.uses_restored }
            : c
        ));
      }
    } catch (e) {
      console.error('Recharge error:', e);
    }
  }

  async function handleCharRecharge(charId) {
    try {
      const data = await supaRpc('recharge_character', { p_user_id: userId, p_slug: charId });
      if (data?.success) {
        setUserCollection(prev => prev.map(c =>
          (c.slug || c.id) === charId
            ? { ...c, uses_remaining: data.uses_restored || c.uses_max }
            : c
        ));
        showLixAlert('Rechargé', '+' + (data.uses_restored || '?') + ' utilisations restaurées !', [{ text: 'Super', color: '#00D984' }], '⚡');
      } else {
        showLixAlert('Erreur', data?.error || 'Recharge échouée', [{ text: 'OK', style: 'cancel' }], '⚠️');
      }
    } catch (e) {
      console.error('Recharge error:', e);
      showLixAlert('Erreur', 'Problème de connexion', [{ text: 'OK', style: 'cancel' }], '⚠️');
    }
  }

  const hdrs = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY };

  async function loadAll() {
    if (!userId) return;
    setLoading(true);
    try {
      const [a,b,c,d,e] = await Promise.all([
        fetch(SUPABASE_URL+'/rest/v1/users_profile?user_id=eq.'+userId+'&select=lix_balance,energy',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_user_characters?user_id=eq.'+userId+'&select=character_id',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_challenges?is_active=eq.true&order=start_date.asc&select=id,title,description,challenge_type,target_value,target_unit,duration_days,start_date,end_date,registration_deadline,is_active,template_key,color,icon,reward_lix_first,reward_lix_second,reward_lix_third,reward_lix_participation,total_participants,total_groups',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_notifications?order=created_at.desc&limit=20',{headers:hdrs}),
        fetch(SUPABASE_URL+'/rest/v1/lixverse_group_members?user_id=eq.'+userId+'&select=group_id,personal_score,lixverse_groups(id,name,member_count,total_score,invite_code,challenge_id)',{headers:hdrs}),
      ]);
      const [aD,bD,cD,dD,eD] = await Promise.all([a.json(),b.json(),c.json(),d.json(),e.json()]);
      if(aD[0]?.lix_balance!=null)updateLixBalance(aD[0].lix_balance);
      if(aD[0]?.energy!=null&&auth.updateEnergy)auth.updateEnergy(aD[0].energy);
      if(Array.isArray(bD))setOwnedCharacters(bD.map(x=>x.character_id));
      if(Array.isArray(cD))setChallenges(cD);
      if(Array.isArray(dD))setNotifications(dD);
      if (Array.isArray(dD) && dD.length > 0) {
        setNotifList(dD.map(n => ({
          id: n.id || String(Math.random()),
          title: n.notification_type === 'character_won' ? 'Carte gagnée !'
               : n.notification_type === 'wall_sticker' ? 'Wall of Health'
               : n.notification_type === 'challenge_end' ? 'Défi terminé'
               : n.notification_type === 'poke' ? 'Poke reçu'
               : n.notification_type === 'group_join' ? 'Nouveau membre'
               : n.notification_type === 'binome_request' ? 'Demande Binôme'
               : 'Notification',
          message: n.message || '',
          emoji: n.notification_type === 'character_won' ? '🎉' : n.notification_type === 'wall_sticker' ? '🏆' : n.notification_type === 'poke' ? '📢' : n.notification_type === 'group_join' ? '🤝' : n.notification_type === 'binome_request' ? '💛' : '📬',
          color: n.color || '#D4AF37',
          time: n.created_at ? new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
          read: n.read || false, type: n.notification_type,
        })));
      }
      if(Array.isArray(eD))setMyGroups(eD);
      const wallRes = await fetch(SUPABASE_URL + '/rest/v1/wall_stickers?is_visible=eq.true&order=like_count.desc&limit=30', { headers: hdrs });
      const wallData = await wallRes.json();
      if (Array.isArray(wallData)) setWallStickers(wallData);
      const catRes = await fetch(SUPABASE_URL + '/rest/v1/wall_sticker_catalog?is_available=eq.true&order=sort_order.asc', { headers: hdrs });
      const catData = await catRes.json();
      if (Array.isArray(catData)) setStickerCatalog(catData);
      const certMonth = new Date().toISOString().slice(0, 7);
      const prevMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
      const certRes = await fetch(SUPABASE_URL + '/rest/v1/wall_certifications?user_id=eq.' + userId + '&or=(month_year.eq.' + certMonth + ',month_year.eq.' + prevMonth + ')&order=month_year.desc&limit=1', { headers: hdrs });
      const certData = await certRes.json();
      if (Array.isArray(certData) && certData.length > 0) setMyCertification(certData[0]);
    } catch(err) { console.error('Load:', err); }
    setLoading(false);
  }

  async function fetchChallengeScores() {
    try {
      const data = await supaRpc('get_user_challenge_scores', { p_user_id: userId });
      if (Array.isArray(data)) return data;
      return [];
    } catch (err) { return []; }
  }

  async function fetchLeaderboard(challengeId) {
    if (!challengeId) return;
    setLeaderboardLoading(true);
    try {
      const data = await supaRpc('get_challenge_leaderboard', { p_challenge_id: challengeId, p_user_id: userId });
      if (data && data.top_groups) setLeaderboardData(data);
    } catch (e) { console.error('Leaderboard error:', e); }
    setLeaderboardLoading(false);
  }

  async function fetchChallengeLeaders() {
    try {
      const data = await supaRpc('get_all_challenges_leaders', {});
      if (data && Array.isArray(data)) {
        const map = {};
        data.forEach(item => { if (item.challenge_id && item.top3) map[item.challenge_id] = item.top3; });
        setChallengeLeaders(map);
      }
    } catch (e) {}
  }

  async function fetchIndividualLB(challengeId) {
    if (!challengeId) return;
    setLbTabLoading(true);
    try {
      const data = await supaRpc('get_individual_leaderboard', { p_challenge_id: challengeId, p_user_id: userId });
      if (data) setIndividualLB(data);
    } catch (e) {}
    setLbTabLoading(false);
  }

  async function fetchCountryLB(challengeId) {
    if (!challengeId) return;
    setLbTabLoading(true);
    try {
      const data = await supaRpc('get_country_leaderboard', { p_challenge_id: challengeId, p_user_id: userId });
      if (data) setCountryLB(data);
    } catch (e) {}
    setLbTabLoading(false);
  }

  async function checkEligibilityAndProceed(challenge, action) {
    setEligibilityChecking(true);
    try {
      const data = await supaRpc('check_challenge_eligibility', { p_user_id: userId });
      setEligibilityChecking(false);
      if (data?.eligible) {
        setSelectedChallenge(challenge);
        if (action === 'create') setShowCreateGroup(true);
        else setShowJoinGroup(true);
      } else {
        const daysNeeded = data?.days_needed || 5;
        const detail = data?.detail || {};
        showLixAlert('🔍 Analyse de régularité',
          'Pour participer aux défis, LIXUM vérifie que tu utilises l\'app régulièrement.\n\nActivité détectée : ' + (data?.active_days || 0) + '/7 jours minimum\n• Repas loggés : ' + (detail.meals || 0) + ' jours\n• Activités : ' + (detail.activities || 0) + ' jours\n• Humeur : ' + (detail.moods || 0) + ' jours\n\nContinue à utiliser LIXUM pendant encore ' + daysNeeded + ' jour' + (daysNeeded > 1 ? 's' : '') + ' pour débloquer les défis.',
          [{ text: 'Compris', color: '#D4AF37' }], '🛡️');
      }
    } catch (e) {
      setEligibilityChecking(false);
      setSelectedChallenge(challenge);
      if (action === 'create') setShowCreateGroup(true);
      else setShowJoinGroup(true);
    }
  }

  async function createGroup() {
    if (!newGroupName.trim() || !selectedChallenge) return;
    try {
      const cd = await supaRpc('check_create_group_cooldown', { p_user_id: userId });
      if (cd && !cd.allowed) {
        showLixAlert('⏳ Cooldown actif', 'Tu as supprimé un groupe récemment.\nTu pourras en créer un nouveau dans ' + cd.days_left + ' jour' + (cd.days_left > 1 ? 's' : '') + '.', [{ text: 'Compris', style: 'cancel' }], '⏳');
        return;
      }
    } catch (e) {}
    try {
      const code = selectedChallenge.challenge_type.toUpperCase().slice(0, 5) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      const h = { ...hdrs, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
      const res = await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups', { method: 'POST', headers: h, body: JSON.stringify({ challenge_id: selectedChallenge.id, name: newGroupName.trim(), created_by: userId, creator_lixtag: 'LXM-2K7F4A', invite_code: code, member_count: 1 }) });
      const g = await res.json();
      if (g && g[0]) {
        await fetch(SUPABASE_URL + '/rest/v1/lixverse_group_members', { method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ group_id: g[0].id, user_id: userId, lixtag: 'LXM-2K7F4A', country: 'Burundi' }) });
        showLixAlert('Groupe créé', '"' + newGroupName.trim() + '"\n\nCode : ' + code, [{ text: 'Parfait', color: '#00D984' }], '✅');
        setShowCreateGroup(false); setNewGroupName(''); loadAll();
      }
    } catch (e) { showLixAlert('Erreur', 'Création échouée.', [{ text: 'OK', style: 'cancel' }], '❌'); }
  }

  async function joinGroup() {
    if (!joinCode.trim()) return;
    try {
      const h = { ...hdrs, 'Content-Type': 'application/json' };
      const res = await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups?invite_code=eq.' + joinCode.trim().toUpperCase() + '&select=*', { headers: hdrs });
      const gs = await res.json();
      if (!gs || gs.length === 0) { showLixAlert('Code invalide', 'Aucun groupe trouvé avec ce code.', [{ text: 'Réessayer', style: 'cancel' }], '🔍'); return; }
      const g = gs[0];
      await fetch(SUPABASE_URL + '/rest/v1/lixverse_group_members', { method: 'POST', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ group_id: g.id, user_id: userId, lixtag: 'LXM-2K7F4A', country: 'Burundi' }) });
      await fetch(SUPABASE_URL + '/rest/v1/lixverse_groups?id=eq.' + g.id, { method: 'PATCH', headers: { ...h, 'Prefer': 'return=minimal' }, body: JSON.stringify({ member_count: g.member_count + 1 }) });
      showLixAlert('Rejoint', 'Tu fais partie de "' + g.name + '" !', [{ text: 'Super', color: '#00D984' }], '🤝');
      setShowJoinGroup(false); setJoinCode(''); loadAll();
    } catch (e) { showLixAlert('Erreur', 'Impossible de rejoindre.', [{ text: 'OK', style: 'cancel' }], '❌'); }
  }

  async function openGroupDetail(group) {
    const groupId = group.lixverse_groups?.id || group.group_id;
    if (!groupId) return;
    setSelectedGroup(group); setGroupDetailLoading(true); setGroupDetail(null);
    try {
      const data = await supaRpc('get_group_details', { p_group_id: groupId });
      if (data && !data.error) setGroupDetail(data);
    } catch (e) { console.error('Group detail error:', e); }
    setGroupDetailLoading(false);
  }

  async function pokeGroup() {
    if (poking || !groupDetail?.group?.id) return;
    setPoking(true);
    try {
      const data = await supaRpc('poke_group', { p_user_id: userId, p_group_id: groupDetail.group.id });
      if (data?.success) {
        showLixAlert('📢 Poke envoyé !', data.poked_count + ' membre' + (data.poked_count > 1 ? 's' : '') + ' notifié' + (data.poked_count > 1 ? 's' : ''), [{ text: 'On se bouge !', color: '#FF8C42' }], '📢');
      } else {
        showLixAlert('⏳ Patience', data?.error || 'Réessaie plus tard', [{ text: 'OK', style: 'cancel' }], '⏳');
      }
    } catch (e) { console.error('Poke error:', e); }
    setPoking(false);
  }

  async function deleteGroup() {
    if (!groupDetail?.group?.id) return;
    showLixAlert('🗑️ Supprimer le groupe ?', 'Tous les membres seront retirés et les scores perdus.\n\nCette action est irréversible.',
      [{ text: 'Supprimer', color: '#FF6B6B', onPress: async () => {
        try {
          const data = await supaRpc('delete_group', { p_user_id: userId, p_group_id: groupDetail.group.id });
          if (data?.success) { setSelectedGroup(null); setGroupDetail(null); loadAll(); showLixAlert('Groupe supprimé', '"' + data.deleted_group + '" a été dissous.', [{ text: 'OK', color: '#00D984' }], '✅'); }
          else { showLixAlert('Erreur', data?.error || 'Impossible de supprimer', [{ text: 'OK', style: 'cancel' }], '❌'); }
        } catch (e) { console.error('Delete group error:', e); }
      }}, { text: 'Annuler', style: 'cancel' }], '🗑️');
  }

  async function leaveGroup() {
    if (!groupDetail?.group?.id) return;
    showLixAlert('Quitter le groupe ?', 'Tu perdras tes points dans "' + groupDetail.group.name + '".',
      [{ text: 'Quitter', color: '#FF6B6B', onPress: async () => {
        try {
          const data = await supaRpc('leave_group', { p_user_id: userId, p_group_id: groupDetail.group.id });
          if (data?.success) { setSelectedGroup(null); setGroupDetail(null); loadAll(); showLixAlert('Groupe quitté', 'Tu as quitté "' + data.left_group + '".', [{ text: 'OK', style: 'cancel' }], '👋'); }
          else { showLixAlert('Erreur', data?.error || 'Impossible', [{ text: 'OK', style: 'cancel' }], '❌'); }
        } catch (e) { console.error('Leave group error:', e); }
      }}, { text: 'Rester', style: 'cancel' }], '👋');
  }

  async function openPublicProfile(lixtag) {
    if (!lixtag) return;
    setPublicProfileLoading(true); setPublicProfile(null); setShowPublicProfile(true);
    try {
      const data = await supaRpc('get_public_profile', { p_lixtag: lixtag });
      if (data && !data.error) setPublicProfile(data);
    } catch (e) { console.error('Public profile error:', e); }
    setPublicProfileLoading(false);
  }

  async function copyInviteCode(code) {
    try {
      await Clipboard.setStringAsync(code);
      showLixAlert('📋 Copié !', 'Code ' + code + ' copié dans le presse-papier.', [{ text: 'Super', color: '#00D984' }], '📋');
    } catch (e) {
      showLixAlert('Code', code, [{ text: 'OK', style: 'cancel' }], '📋');
    }
  }

  async function searchGroups(query) {
    if (!query || query.trim().length < 2) { setSearchGroupResults([]); return; }
    setSearchGroupLoading(true);
    try {
      const data = await supaRpc('search_groups_fuzzy', { p_query: query.trim(), p_limit: 10 });
      setSearchGroupResults(Array.isArray(data) ? data : []);
    } catch (e) { setSearchGroupResults([]); }
    setSearchGroupLoading(false);
  }

  async function requestJoinGroup(group) {
    try {
      const data = await supaRpc('request_join_group', { p_user_id: userId, p_group_id: group.id });
      if (data?.success) {
        showLixAlert('✅ Demande envoyée', 'Le leader de "' + data.group_name + '" recevra ta demande.', [{ text: 'Compris', color: '#D4AF37' }], '📩');
        setShowSearchGroup(false); setSearchGroupQuery(''); setSearchGroupResults([]);
      } else {
        showLixAlert('Info', data?.error || 'Impossible d\'envoyer.', [{ text: 'OK', style: 'cancel' }], 'ℹ️');
      }
    } catch (e) { showLixAlert('Erreur', 'Problème de connexion.', [{ text: 'OK', style: 'cancel' }], '❌'); }
  }

  async function loadPendingRequests() {
    setPendingRequestsLoading(true);
    try {
      const data = await supaRpc('get_pending_requests', { p_user_id: userId });
      setPendingRequests(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Pending requests error:', e); }
    setPendingRequestsLoading(false);
  }

  async function handleJoinRequest(requestId, accept) {
    try {
      const data = await supaRpc('handle_join_request', { p_leader_id: userId, p_request_id: requestId, p_accept: accept });
      if (data?.success) {
        const action = accept ? 'acceptée' : 'rejetée';
        showLixAlert(accept ? '✅ Accepté' : '❌ Rejeté', 'Demande de ' + data.requester_lixtag + ' ' + action + '.', [{ text: 'OK', color: accept ? '#00D984' : '#FF6B6B' }], accept ? '🤝' : '👋');
        loadPendingRequests(); loadAll();
      } else { showLixAlert('Erreur', data?.error || 'Action impossible.', [{ text: 'OK', style: 'cancel' }], '❌'); }
    } catch (e) { console.error('Handle request error:', e); }
  }

  const handleStickerTap = (sticker) => {
    const id = sticker.id;
    setWallStickers(prev => prev.map(s => s.id === id ? { ...s, like_count: (s.like_count || 0) + 1 } : s));
    fetch(SUPABASE_URL + '/rest/v1/rpc/like_wall_sticker', { method: 'POST', headers: { ...hdrs, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_sticker_id: id, p_user_id: userId }) }).catch(() => {});
    supaRpc('score_social_action', { p_user_id: userId }).catch(() => {});
    const heartId = Date.now() + Math.random();
    const heartEmojis = ['🩶', '🤍', '💛', '⭐', '✨'];
    const emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    setFloatingHearts(prev => [...prev, { id: heartId, stickerId: id, x: Math.random() * wp(40) - wp(20), emoji }]);
    var heartTimer = setTimeout(() => { setFloatingHearts(prev => prev.filter(h => h.id !== heartId)); floatingHeartTimersRef.current = floatingHeartTimersRef.current.filter(t => t !== heartTimer); }, 1200);
    floatingHeartTimersRef.current.push(heartTimer);
    const prevCount = comboCount[id] || 0;
    const newCount = prevCount + 1;
    setComboCount(prev => ({ ...prev, [id]: newCount }));
    if (comboTimer[id]) clearTimeout(comboTimer[id]);
    const timer = setTimeout(() => { setComboCount(prev => ({ ...prev, [id]: 0 })); setStrikeActive(prev => ({ ...prev, [id]: false })); }, 2000);
    setComboTimer(prev => ({ ...prev, [id]: timer }));
    if (!stickerShakeAnims[id]) stickerShakeAnims[id] = new Animated.Value(0);
    const shakeIntensity = Math.min(newCount * 1.5, 12);
    Animated.sequence([
      Animated.timing(stickerShakeAnims[id], { toValue: shakeIntensity, duration: 50, useNativeDriver: true }),
      Animated.timing(stickerShakeAnims[id], { toValue: -shakeIntensity, duration: 50, useNativeDriver: true }),
      Animated.timing(stickerShakeAnims[id], { toValue: shakeIntensity * 0.6, duration: 50, useNativeDriver: true }),
      Animated.timing(stickerShakeAnims[id], { toValue: -shakeIntensity * 0.6, duration: 50, useNativeDriver: true }),
      Animated.timing(stickerShakeAnims[id], { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    if (newCount >= 5) setStrikeActive(prev => ({ ...prev, [id]: true }));
  };

  const sendLixSign = (sign) => {
    setBinomeMessages(prev => [...prev, { id: Date.now().toString(), sign_id: sign.id, from: 'me', timestamp: new Date().toISOString(), showText: false }]);
    setShowLixSignPicker(false);
  };

  const resetBinomeState = () => {
    setBinomeStatus('none'); setBinomePartner(null); setBinomeMessages([]);
    setBinomeCommonPoints([]); setBinomeDistance(null);
    setSearchProgress(0); setSearchStep(0); setCompatibilityScore(0); setScanLines([]);
  };

  const breakBinome = () => {
    setShowBinomeAlert({
      visible: true, title: 'Rompre le Binôme ?',
      message: 'Tu perdras ta connexion avec ' + (binomePartner?.display_name || 'ton binôme') + ' et ton streak.',
      icon: '💔',
      buttons: [
        { text: 'Annuler', style: 'cancel', onPress: () => setShowBinomeAlert({ visible: false, title: '', message: '', icon: null, buttons: [] }) },
        { text: 'Rompre', style: 'destructive', onPress: () => { resetBinomeState(); setShowBinomeAlert({ visible: false, title: '', message: '', icon: null, buttons: [] }); } },
      ],
    });
  };

  const startBinomeSearch = () => {
    binomeSearchTimersRef.current.forEach(t => clearTimeout(t));
    binomeSearchIntervalsRef.current.forEach(t => clearInterval(t));
    binomeSearchTimersRef.current = [];
    binomeSearchIntervalsRef.current = [];
    setBinomeStatus('searching'); setSearchProgress(0); setSearchStep(0); setCompatibilityScore(0); setScanLines([]);
    radarAnim.setValue(0);
    Animated.loop(Animated.timing(radarAnim, { toValue: 1, duration: 2000, useNativeDriver: true })).start();
    const startPulseRing = (anim, delay) => {
      var pulseTimer = setTimeout(() => {
        Animated.loop(Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])).start();
      }, delay);
      binomeSearchTimersRef.current.push(pulseTimer);
    };
    pulseRing1.setValue(0); pulseRing2.setValue(0); pulseRing3.setValue(0);
    startPulseRing(pulseRing1, 0); startPulseRing(pulseRing2, 700); startPulseRing(pulseRing3, 1400);
    const coordsInterval = setInterval(() => {
      setSearchCoords({ lat: (Math.random() * 60 - 30).toFixed(4) + '°', lng: (Math.random() * 120 - 60).toFixed(4) + '°' });
    }, 150);
    binomeSearchIntervalsRef.current.push(coordsInterval);
    const linesInterval = setInterval(() => {
      const centerX = (SCREEN_WIDTH - wp(32)) / 2;
      const centerY = wp(90);
      const dotIdx = Math.floor(Math.random() * WORLD_DOTS.length);
      const dot = WORLD_DOTS[dotIdx];
      const dotX = (dot.x / 800) * (SCREEN_WIDTH - wp(32));
      const dotY = (dot.y / 400) * wp(180);
      const dx = dotX - centerX; const dy = dotY - centerY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      setScanLines(prev => [...prev, { x1: centerX, y1: centerY, length, angle, id: Date.now() }].slice(-8));
    }, 800);
    binomeSearchIntervalsRef.current.push(linesInterval);
    const SEARCH_STEPS = [
      { text: 'Analyse morphologique du profil...', duration: 1500 },
      { text: 'Extraction des paramètres nutritionnels...', duration: 1800 },
      { text: 'Corrélation des objectifs de santé...', duration: 2000 },
      { text: 'Triangulation géographique...', duration: 1500 },
      { text: 'Scan des profils compatibles...', duration: 2500 },
      { text: 'Calcul de l\'indice de compatibilité...', duration: 2000 },
      { text: 'Vérification anti-triche...', duration: 1200 },
      { text: 'Binôme identifié !', duration: 800 },
    ];
    let stepIdx = 0; let elapsed = 0;
    const totalDuration = SEARCH_STEPS.reduce((s, step) => s + step.duration, 0);
    const stepTimer = () => {
      if (stepIdx >= SEARCH_STEPS.length) return;
      setSearchStep(stepIdx);
      setSearchProgress(Math.min(100, Math.round((elapsed / totalDuration) * 100)));
      if (stepIdx >= 4) setCompatibilityScore(Math.min(87, Math.round(((stepIdx - 4) / (SEARCH_STEPS.length - 4)) * 87)));
      elapsed += SEARCH_STEPS[stepIdx].duration; stepIdx++;
      if (stepIdx < SEARCH_STEPS.length) {
        var st = setTimeout(stepTimer, SEARCH_STEPS[stepIdx - 1].duration);
        binomeSearchTimersRef.current.push(st);
      } else {
        var ft = setTimeout(async () => {
          clearInterval(coordsInterval); clearInterval(linesInterval);
          radarAnim.stopAnimation(); pulseRing1.stopAnimation(); pulseRing2.stopAnimation(); pulseRing3.stopAnimation();
          try {
            const matchData = await supaRpc('find_binome_match', { p_user_id: userId });
            if (!matchData || matchData.error || !matchData.match_found) {
              setSearchProgress(100); setCompatibilityScore(0); setBinomeStatus('no_match');
              setRetryAfterTime(Date.now() + 24 * 60 * 60 * 1000);
            } else {
              setCompatibilityScore(matchData.compatibility_score || 87); setSearchProgress(100);
              setBinomePartner({
                lixtag: matchData.partner_lixtag, display_name: matchData.partner_lixtag,
                country: matchData.partner_country || '', country_flag: matchData.partner_flag || '🌍',
                vitality_score: matchData.partner_vitality || 0, goal: matchData.partner_goal || '',
                distance_km: matchData.distance_km || null, common_points: matchData.common_points || [],
                today_calories_eaten: 0, today_calories_burned: 0, today_mood: '—', today_weather: '—', streak_days: 0,
              });
              setBinomeCommonPoints(matchData.common_points || []); setBinomeDistance(matchData.distance_km || null);
              setBinomeStatus('proposed');
            }
          } catch (e) {
            console.error('Binome search error:', e);
            setSearchProgress(100); setCompatibilityScore(0); setBinomeStatus('no_match');
            setRetryAfterTime(Date.now() + 24 * 60 * 60 * 1000);
          }
        }, SEARCH_STEPS[SEARCH_STEPS.length - 1].duration);
        binomeSearchTimersRef.current.push(ft);
      }
    };
    stepTimer();
  };

  useEffect(() => {
    if (selectedChar && ALL_CHARACTERS[cardViewIndex]) {
      const newCharId = ALL_CHARACTERS[cardViewIndex].id;
      const collectionChar = userCollection.find(c => (c.slug || c.id) === newCharId);
      if (collectionChar) {
        setSelectedChar({ ...collectionChar, slug: collectionChar.slug || newCharId });
      } else {
        const fallback = ALL_CHARACTERS[cardViewIndex];
        setSelectedChar({ ...fallback, slug: newCharId, owned: false, level: 0, xp: 0, xp_next: 1000, uses_remaining: 0, uses_max: fallback.uses || 10, fragments: 0, fragments_required: FRAGS_NIV1[fallback.tier] || 3 });
      }
      loadCharPowers(newCharId);
    }
  }, [cardViewIndex]);

  useEffect(() => {
    loadAll();
    (async () => {
      try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId + '&select=full_name', { headers: HEADERS });
        const d = await res.json();
        if (d && d[0]) setUserNameAvatar(d[0].full_name || '');
      } catch (e) {}
    })();
    fetchChallengeScores().then(scores => setChallengeScores(scores));
  }, [userId]);

  // Refresh Lix balance when page gains focus
  useFocusEffect(useCallback(function() {
    if (userId) refreshLixFromServer();
  }, [userId, refreshLixFromServer]));

  useEffect(() => { if (activeTab === 'characters') loadCharacterData(); }, [activeTab]);
  useEffect(() => { if (activeTab === 'defi') { fetchChallengeScores().then(scores => setChallengeScores(scores)); loadPendingRequests(); } }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'defi') return;
    if (challenges.length > 0 && !leaderboardChallengeId) {
      setLeaderboardChallengeId(challenges[0].id); fetchLeaderboard(challenges[0].id);
    } else if (leaderboardChallengeId) { fetchLeaderboard(leaderboardChallengeId); }
    fetchChallengeLeaders();
    const interval = setInterval(() => { if (leaderboardChallengeId) fetchLeaderboard(leaderboardChallengeId); }, 300000);
    return () => clearInterval(interval);
  }, [activeTab, challenges.length, leaderboardChallengeId]);

  useEffect(() => {
    if (notifications.length === 0) return;
    Animated.loop(Animated.timing(notifScrollX, { toValue: -(notifications.length * wp(280)), duration: notifications.length * 5000, useNativeDriver: true })).start();
  }, [notifications]);

  useEffect(() => {
    if (!retryAfterTime) return;
    const interval = setInterval(() => {
      const diff = retryAfterTime - Date.now();
      if (diff <= 0) { setRetryAfterTime(null); setRetryCountdown(''); clearInterval(interval); return; }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setRetryCountdown((hours > 0 ? hours + 'h ' : '') + (minutes > 0 ? minutes + 'min ' : '') + seconds + 's');
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfterTime]);

  async function sendBinomeRequestLive() {
    setBinomeStatus('pending_sent');
    Animated.loop(Animated.sequence([
      Animated.timing(pendingPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(pendingPulse, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
    ])).start();
    try {
      const reqData = await supaRpc('send_binome_request', { p_user_id: userId, p_partner_lixtag: binomePartner.lixtag });
      if (!reqData?.success) {
        pendingPulse.stopAnimation();
        showLixAlert('Erreur', reqData?.error || 'Impossible d\'envoyer', [{ text: 'OK', style: 'cancel' }], '⚠️');
        setBinomeStatus('proposed');
      }
    } catch (e) {
      console.error('Binome request error:', e);
      pendingPulse.stopAnimation();
      showLixAlert('Erreur', 'Problème de connexion', [{ text: 'OK', style: 'cancel' }], '⚠️');
      setBinomeStatus('proposed');
    }
  }

  const navigateTo = (page) => {
    if (navigation && navigation.navigate) navigation.navigate(page);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#141A22' }}>
      <LinearGradient colors={['#1A1D22','#252A30','#1E2328']} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content"/>
        <View style={{ paddingTop: Platform.OS === 'android' ? 50 : 55 }}>
          <PageHeader
            title="LixVerse"
            subtitle="UNIVERS LIXUM"
            titleColor="#D4AF37"
            lixBalance={lixBalance}
            userEnergy={userEnergy}
            onLixPress={function() { }}
            onProfilePress={function() { if (navigation) navigation.navigate('Profile'); }}
            rightExtra={
              <Pressable delayPressIn={120} onPress={() => setShowNotifPanel(true)}
                style={({ pressed }) => ({
                  width: wp(36), height: wp(36), borderRadius: wp(18),
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  justifyContent: 'center', alignItems: 'center',
                  marginRight: wp(10),
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                })}>
                <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                  <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M13.73 21a2 2 0 01-3.46 0" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
                </Svg>
                {unreadCount > 0 && (
                  <View style={{ position: 'absolute', top: wp(-2), right: wp(-2), minWidth: wp(16), height: wp(16), borderRadius: wp(8), backgroundColor: '#FF3B5C', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(4), borderWidth: 1.5, borderColor: '#1A1D22' }}>
                    <Text style={{ fontSize: fp(8), fontWeight: '800', color: '#FFF' }}>{unreadCount}</Text>
                  </View>
                )}
              </Pressable>
            }
          />
        </View>

        {notifications.length > 0 && (
          <View style={{ height: wp(28), backgroundColor: 'rgba(212,175,55,0.06)', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)', overflow: 'hidden', justifyContent: 'center' }}>
            <Animated.View style={{ flexDirection: 'row', transform: [{ translateX: notifScrollX }] }}>
              {[...notifications, ...notifications].map((n, i) => (
                <View key={i} style={{ width: wp(280), flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(10), gap: wp(6) }}>
                  <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), backgroundColor: n.color || '#D4AF37' }} />
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)', flex: 1 }} numberOfLines={1}>{n.message}</Text>
                </View>
              ))}
            </Animated.View>
          </View>
        )}

        <View style={{ flexDirection: 'row', marginHorizontal: wp(16), marginVertical: wp(10), gap: wp(6) }}>
          {[
            { key: 'defi', label: 'Défi', icon: '🏆' },
            { key: 'human', label: 'Human', icon: '🤝' },
            { key: 'characters', label: 'Caractères', icon: '🃏' },
            { key: 'lix', label: 'Lix', icon: '💎' },
          ].map(function(tab) {
            var isActive = activeTab === tab.key;
            return (
              <Pressable key={tab.key} onPress={function() { setActiveTab(tab.key); }} style={{ flex: 1 }}>
                <View style={{
                  borderRadius: 20, padding: 2, borderWidth: 1.5,
                  borderTopColor: isActive ? '#D4AF37' : '#8892A0',
                  borderLeftColor: isActive ? '#B8972A' : '#6B7B8D',
                  borderRightColor: isActive ? '#8B7A2E' : '#3E4855',
                  borderBottomColor: isActive ? '#6B5D1E' : '#2A303B',
                  backgroundColor: '#2A303B',
                }}>
                  <View style={{
                    borderRadius: 16, borderWidth: 1,
                    borderColor: isActive ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.06)',
                    backgroundColor: '#151B23',
                    paddingVertical: wp(8), alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: fp(14) }}>{tab.icon}</Text>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', marginTop: wp(2), color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}>{tab.label}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'defi' && (
          <DefiTab
            challenges={challenges} challengeScores={challengeScores} loading={loading}
            myGroups={myGroups} wallStickers={wallStickers} floatingHearts={floatingHearts}
            comboCount={comboCount} strikeActive={strikeActive} stickerShakeAnims={stickerShakeAnims}
            myCertification={myCertification} leaderboardTab={leaderboardTab} setLeaderboardTab={setLeaderboardTab}
            leaderboardExpanded={leaderboardExpanded} setLeaderboardExpanded={setLeaderboardExpanded}
            leaderboardData={leaderboardData} leaderboardLoading={leaderboardLoading}
            individualLB={individualLB} countryLB={countryLB} lbTabLoading={lbTabLoading}
            challengeLeaders={challengeLeaders} expandedRewards={expandedRewards} setExpandedRewards={setExpandedRewards}
            eligibilityChecking={eligibilityChecking} pendingRequests={pendingRequests} showLixAlert={showLixAlert}
            onOpenGroupDetail={openGroupDetail} onCopyInviteCode={copyInviteCode}
            onSetShowCertificationModal={(v) => setShowCertificationModal(v)}
            onSetShowSearchGroup={(v) => setShowSearchGroup(v)}
            onSetShowPendingRequests={(v) => setShowPendingRequests(v)}
            onCheckEligibilityAndProceed={checkEligibilityAndProceed}
            onHandleStickerTap={handleStickerTap}
            onSetSelectedSticker={(s) => setSelectedSticker(s)}
            onSetShowGiftModal={(v) => setShowGiftModal(v)}
            onFetchIndividualLB={fetchIndividualLB} onFetchCountryLB={fetchCountryLB}
            leaderboardChallengeId={leaderboardChallengeId}
          />
        )}

        {activeTab === 'human' && (
          <HumanTab
            humanTab={humanTab} setHumanTab={setHumanTab}
            binomeStatus={binomeStatus} binomePartner={binomePartner}
            binomeCommonPoints={binomeCommonPoints} binomeDistance={binomeDistance}
            binomeMessages={binomeMessages} searchProgress={searchProgress}
            searchStep={searchStep} searchCoords={searchCoords}
            compatibilityScore={compatibilityScore} scanLines={scanLines}
            retryAfterTime={retryAfterTime} retryCountdown={retryCountdown}
            showLixSignPicker={showLixSignPicker} setShowLixSignPicker={setShowLixSignPicker}
            lixSignCategory={lixSignCategory} setLixSignCategory={setLixSignCategory}
            tooltipSign={tooltipSign} setTooltipSign={setTooltipSign}
            radarAnim={radarAnim} pulseRing1={pulseRing1} pulseRing2={pulseRing2} pulseRing3={pulseRing3}
            pendingPulse={pendingPulse} showLixAlert={showLixAlert}
            onStartBinomeSearch={startBinomeSearch} onResetBinomeState={resetBinomeState}
            onBreakBinome={breakBinome} onSendBinomeRequest={sendBinomeRequestLive}
            onSendLixSign={sendLixSign}
          />
        )}

        {activeTab === 'characters' && (
          <CharactersTab
            userCollection={userCollection} ownedCharacters={ownedCharacters}
            activeCharSlug={activeCharSlug} selectedChar={selectedChar}
            setSelectedChar={setSelectedChar} charFlipped={charFlipped}
            setCharFlipped={setCharFlipped} cardViewIndex={cardViewIndex}
            setCardViewIndex={setCardViewIndex} cardViewIndexRef={cardViewIndexRef}
            charPowers={charPowers} loadingPowers={loadingPowers}
            onboardingSelected={onboardingSelected}
            inlinePowerModal={inlinePowerModal} setInlinePowerModal={setInlinePowerModal}
            inlinePowerData={inlinePowerData} inlinePowerLoading={inlinePowerLoading}
            flipAnim={flipAnim} cardSlideAnim={cardSlideAnim} showLixAlert={showLixAlert}
            onSwitchActiveCharacter={switchActiveCharacter} onLoadCharPowers={loadCharPowers}
            onNavigateCard={navigateCard} onFlipCard={flipCard}
            onRechargeChar={rechargeChar} onShouldConsumePower={shouldConsumePower}
            onConsumePower={consumePower} onGoToSpin={() => setActiveTab('defi')}
            onNavigateTo={navigateTo}
          />
        )}

        {activeTab === 'lix' && (
          <LixShopTab showLixAlert={showLixAlert} />
        )}
      </LinearGradient>

      <BottomTabs
        activeTab="lixverse"
        medicaiNotifCount={auth.notifCount}
        onTabPress={(key) => {
          if (key === 'lixverse') return;
          const pageMap = { home: 'Accueil', meals: 'Repas', medicai: 'MedicAi', activity: 'Activite' };
          if (pageMap[key] && navigation) navigation.navigate(pageMap[key]);
        }}
      />

      {/* ── ALIXEN NOTIFICATIONS BOTTOM SHEET ── */}
      <Modal visible={showNotifPanel} transparent animationType="slide" onRequestClose={function() { setShowNotifPanel(false); }}>
        <Pressable onPress={function() { setShowNotifPanel(false); }} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '75%' }}>
            <Pressable onPress={function() {}} style={{ backgroundColor: '#1A2029', borderTopLeftRadius: wp(20), borderTopRightRadius: wp(20), paddingBottom: wp(30) }}>
              <View style={{ alignItems: 'center', paddingVertical: wp(10) }}>
                <View style={{ width: wp(36), height: wp(4), borderRadius: wp(2), backgroundColor: '#3A3F46' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(20), marginBottom: wp(14) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                  <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>Notifications</Text>
                  {unreadCount > 0 ? (
                    <View style={{ backgroundColor: '#FF3B5C20', borderRadius: wp(8), paddingHorizontal: wp(7), paddingVertical: wp(2) }}>
                      <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FF3B5C' }}>{unreadCount}</Text>
                    </View>
                  ) : null}
                </View>
                {unreadCount > 1 ? (
                  <Pressable onPress={function() { if (markAllNotificationsRead) markAllNotificationsRead(); }} hitSlop={8}>
                    <Text style={{ fontSize: fp(11), color: '#00D984', fontWeight: '600' }}>Tout marquer comme lu</Text>
                  </Pressable>
                ) : null}
              </View>
              <ScrollView style={{ maxHeight: wp(400) }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(16) }}>
                {(function() {
                  var safeAlixen = Array.isArray(alixenNotifications)
                    ? alixenNotifications.filter(function(n) { return n && n.id; })
                    : [];
                  var safeLixverse = Array.isArray(notifList) ? notifList : [];
                  var allNotifs = safeAlixen.map(function(n) {
                    var CHAR_EMOJIS = { 'emerald_owl': '🦉', 'hawk_eye': '🦅', 'ruby_tiger': '🐯', 'amber_fox': '🦊', 'gipsy': '🕷️', 'jade_phoenix': '🔥', 'silver_wolf': '🐺', 'boukki': '🦴', 'iron_rhino': '🦏', 'coral_dolphin': '🐬' };
                    return {
                      id: 'alixen_' + n.id,
                      rawId: n.id,
                      title: n.title || 'Notification',
                      message: n.message || '',
                      emoji: (n.character_slug || null) ? (CHAR_EMOJIS[n.character_slug] || '🧠') : '🧠',
                      color: n.color || '#00D984',
                      time: n.created_at ? (function() { var d = new Date(n.created_at); var now = new Date(); var diff = now - d; if (diff < 3600000) return 'il y a ' + Math.max(1, Math.floor(diff / 60000)) + ' min'; if (diff < 86400000) return 'il y a ' + Math.floor(diff / 3600000) + 'h'; if (diff < 172800000) return 'hier'; return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); })() : '',
                      read: false,
                      source: 'alixen',
                    };
                  }).concat(safeLixverse.map(function(n) {
                    return {
                      id: 'lv_' + (n.id || Math.random()),
                      rawId: n.id,
                      title: n.title || 'Notification',
                      message: n.message || '',
                      emoji: n.emoji || '📬',
                      color: n.color || '#D4AF37',
                      time: n.time || '',
                      read: n.read || false,
                      source: 'lixverse',
                    };
                  }));
                  if (allNotifs.length === 0) return (
                    <View style={{ padding: wp(30), alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(32), marginBottom: wp(8) }}>🔔</Text>
                      <Text style={{ fontSize: fp(13), color: '#888', fontStyle: 'italic' }}>Aucune notification</Text>
                    </View>
                  );
                  return allNotifs.map(function(notif) {
                    return (
                      <Pressable key={notif.id} delayPressIn={120}
                        onPress={function() {
                          if (notif.source === 'alixen' && markNotificationRead) {
                            markNotificationRead(notif.rawId);
                          }
                        }}
                        style={function(state) { return {
                          backgroundColor: '#2A303B', borderWidth: 1, borderColor: '#3A3F46',
                          borderLeftWidth: notif.read ? 1 : 3,
                          borderLeftColor: notif.read ? '#3A3F46' : '#00D984',
                          borderRadius: wp(12), padding: wp(14), marginBottom: wp(8),
                          flexDirection: 'row', gap: wp(10),
                          opacity: state.pressed ? 0.7 : (notif.read ? 0.6 : 1),
                        }; }}>
                        <View style={{
                          width: wp(36), height: wp(36), borderRadius: wp(18),
                          backgroundColor: notif.color + '15',
                          justifyContent: 'center', alignItems: 'center',
                        }}>
                          <Text style={{ fontSize: fp(16) }}>{notif.emoji}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(2) }}>
                            <Text style={{ fontSize: fp(13), fontWeight: '600', color: notif.read ? '#888' : '#FFF', flex: 1 }} numberOfLines={1}>{notif.title}</Text>
                            <Text style={{ fontSize: fp(9), color: notif.source === 'alixen' ? '#00D984' : '#D4AF37', fontWeight: '600', marginLeft: wp(6) }}>{notif.source === 'alixen' ? 'ALIXEN' : 'LIXVERSE'}</Text>
                          </View>
                          <Text style={{ fontSize: fp(11), color: '#aaa', lineHeight: fp(16) }} numberOfLines={2}>{notif.message}</Text>
                          {notif.time ? <Text style={{ fontSize: fp(9), color: '#666', marginTop: wp(4) }}>{notif.time}</Text> : null}
                        </View>
                      </Pressable>
                    );
                  });
                })()}
              </ScrollView>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={lixAlert.visible} transparent animationType="fade" onRequestClose={hideLixAlert}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24) }}>
          <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']} style={{ borderRadius: wp(20), padding: wp(24), width: '100%', alignItems: 'center' }}>
            {lixAlert.emoji ? <Text style={{ fontSize: fp(36), marginBottom: wp(12) }}>{lixAlert.emoji}</Text> : null}
            <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: wp(8) }}>{lixAlert.title}</Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: fp(18), marginBottom: wp(20) }}>{lixAlert.message}</Text>
            {lixAlert.buttons.map((btn, i) => (
              <Pressable key={i} onPress={() => { hideLixAlert(); if (btn.onPress) btn.onPress(); }}
                style={({ pressed }) => ({
                  width: '100%', paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center', marginBottom: wp(6),
                  backgroundColor: btn.style === 'cancel' ? 'rgba(255,255,255,0.06)' : (btn.color || '#D4AF37') + '20',
                  borderWidth: 1, borderColor: btn.style === 'cancel' ? 'rgba(255,255,255,0.1)' : (btn.color || '#D4AF37') + '50',
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: btn.style === 'cancel' ? 'rgba(255,255,255,0.4)' : (btn.color || '#D4AF37') }}>{btn.text}</Text>
              </Pressable>
            ))}
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}
