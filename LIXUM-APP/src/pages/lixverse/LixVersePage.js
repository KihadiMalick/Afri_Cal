import React, { useState, useRef, useEffect } from 'react';
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
  SUPABASE_URL, SUPABASE_ANON_KEY, TEST_USER_ID,
  HEADERS, POST_HEADERS, ALL_CHARACTERS, CHAR_NAMES,
  CHAR_EMOJIS, FRAGS_NIV1, TIER_CONFIG, SLUGS_BY_TIER,
  randomSlugFromTier, NAV_TABS,
  NORMAL_SEGMENTS, SUPER_SEGMENTS, MEGA_SEGMENTS,
  getSegmentAngles
} from './lixverseConstants';
import { LixGem } from './lixverseComponents';
import SpinTab from './SpinTab';
import DefiTab from './DefiTab';
import CharactersTab from './CharactersTab';
import HumanTab from './HumanTab';

const SCREEN_WIDTH = Dimensions.get('window').width;
const W = SCREEN_WIDTH;

export default function LixVersePage({ navigation }) {
  const [activeTab, setActiveTab] = useState('defi');
  const [lixBalance, setLixBalance] = useState(500);
  const [userEnergy, setUserEnergy] = useState(20);
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
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [freeSpinUsed, setFreeSpinUsed] = useState(false);
  const [spinTier, setSpinTier] = useState('normal');
  const [timeToFree, setTimeToFree] = useState('');
  const [showSpinResultModal, setShowSpinResultModal] = useState(false);
  const [spinWinnerSeg, setSpinWinnerSeg] = useState(null);
  const spinResultPulse = useRef(new Animated.Value(1)).current;
  const [fragmentResult, setFragmentResult] = useState(null);
  const [showFragmentModal, setShowFragmentModal] = useState(false);
  const [fragmentSaving, setFragmentSaving] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const [freeSpinAvailable, setFreeSpinAvailable] = useState(true);
  const [nextFreeAt, setNextFreeAt] = useState(null);
  const fragmentSlideAnim = useRef(new Animated.Value(0)).current;
  const lixSpinScrollRef = useRef(null);
  const [winnerGlowIdx, setWinnerGlowIdx] = useState(null);
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const arrowBounce = useRef(new Animated.Value(0)).current;
  const spinBtnScale = useRef(new Animated.Value(1)).current;
  const freeBtnPulse = useRef(new Animated.Value(1)).current;
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
  const unreadCount = notifList.filter(n => !n.read).length;
  const [stickerCatalog, setStickerCatalog] = useState([]);
  const [myCertification, setMyCertification] = useState(null);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showStickerCreation, setShowStickerCreation] = useState(false);
  const [selectedStickerChoice, setSelectedStickerChoice] = useState(null);
  const [stickerMessage, setStickerMessage] = useState('');
  const notifScrollX = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const cardViewIndexRef = useRef(0);
  const cardSlideAnim = useRef(new Animated.Value(0)).current;
  const [inlinePowerData, setInlinePowerData] = useState(null);
  const [inlinePowerLoading, setInlinePowerLoading] = useState(false);

  const showLixAlert = (title, message, buttons = [], emoji = '') => {
    setLixAlert({ visible: true, title, message, emoji, buttons });
  };
  const hideLixAlert = () => setLixAlert(prev => ({ ...prev, visible: false }));

  const toggleDropdown = () => {
    const toValue = dropdownOpen ? 0 : 1;
    Animated.timing(dropdownAnim, { toValue, duration: 200, useNativeDriver: false }).start();
    setDropdownOpen(!dropdownOpen);
  };

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
      const userId = TEST_USER_ID;
      const onb = await supaRpc('check_character_onboarding', { p_user_id: userId });
      const isOnboarded = onb?.first_character_chosen || false;
      setCharOnboarded(isOnboarded);
      if (!isOnboarded) {
        setShowCharOnboarding(true);
        const charsRes = await fetch(SUPABASE_URL + '/rest/v1/lixverse_characters?tier=eq.standard&order=sort_order.asc', { headers: HEADERS });
        const chars = await charsRes.json();
        setUserCollection((chars || []).map(c => ({ ...c, owned: false, level: 0, fragments: 0 })));
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
      const data = await supaRpc('choose_first_character', { p_user_id: TEST_USER_ID, p_slug: slug });
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
      const data = await supaRpc('set_active_character', { p_user_id: TEST_USER_ID, p_slug: slug });
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
      const data = await supaRpc('get_character_powers', { p_user_id: TEST_USER_ID, p_slug: slug });
      setCharPowers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Powers load error:', e);
    }
    setLoadingPowers(false);
  }

  async function consumePower(powerKey) {
    try {
      const data = await supaRpc('use_character_power', { p_user_id: TEST_USER_ID, p_power_key: powerKey });
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
      const data = await supaRpc('recharge_character', { p_user_id: TEST_USER_ID, p_slug: selectedChar.slug });
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

  const getSegments = () => {
    if (spinTier === 'super') return SUPER_SEGMENTS;
    if (spinTier === 'mega') return MEGA_SEGMENTS;
    return NORMAL_SEGMENTS;
  };

  async function checkFreeSpin() {
    try {
      const data = await supaRpc('check_free_spin_available', { p_user_id: TEST_USER_ID });
      if (data && typeof data === 'object') {
        const available = data.free_available !== false;
        setFreeSpinAvailable(available);
        setFreeSpinUsed(!available);
        if (data.next_free_at) {
          setNextFreeAt(new Date(data.next_free_at).getTime());
        } else {
          setNextFreeAt(null);
        }
      }
    } catch (e) {
      try {
        const res = await fetch(SUPABASE_URL + '/rest/v1/spin_history?user_id=eq.' + TEST_USER_ID + '&spin_tier=eq.normal&lix_cost=eq.0&order=created_at.desc&limit=1', { headers: HEADERS });
        const d = await res.json();
        if (Array.isArray(d) && d.length > 0) {
          const lastFree = new Date(d[0].created_at).getTime();
          const sixHoursMs = 6 * 60 * 60 * 1000;
          const nextAt = lastFree + sixHoursMs;
          if (Date.now() >= nextAt) {
            setFreeSpinAvailable(true); setFreeSpinUsed(false); setNextFreeAt(null);
          } else {
            setFreeSpinAvailable(false); setFreeSpinUsed(true); setNextFreeAt(nextAt);
          }
        } else {
          setFreeSpinAvailable(true); setFreeSpinUsed(false); setNextFreeAt(null);
        }
      } catch (e2) {
        setFreeSpinAvailable(true); setFreeSpinUsed(false);
      }
    }
  }

  const triggerArrowBounce = (strong) => {
    arrowBounce.setValue(strong ? 1.6 : 1);
    Animated.spring(arrowBounce, { toValue: 0, friction: 6, tension: 300, useNativeDriver: true }).start();
  };

  const onSpinComplete = (spinData) => {
    checkFreeSpin();
    const rv = spinData.reward_value || {};
    const rType = spinData.reward_type;
    if (rType === 'fragment' || rType === 'full_card') {
      const fragTier = rv.tier || spinData.character_tier || 'standard';
      const fragSlug = spinData.character_name ? Object.entries(CHAR_NAMES).find(([k,v]) => v === spinData.character_name)?.[0] : randomSlugFromTier(fragTier);
      const fragData = {
        slug: fragSlug || 'unknown',
        name: spinData.character_name || CHAR_NAMES[fragSlug] || fragSlug || 'Inconnu',
        emoji: spinData.character_emoji || CHAR_EMOJIS[fragSlug] || '🎭',
        tier: fragTier, amount: rv.fragment || 1,
        isComplete: rType === 'full_card', levelUp: false, newLevel: 0,
        totalFrags: rv.fragment || 1, fragsNeeded: FRAGS_NIV1[fragTier] || 3,
      };
      setFragmentResult(fragData);
      if (rType === 'full_card' && fragSlug) {
        supaRpc('add_character_fragment', { p_user_id: TEST_USER_ID, p_slug: fragSlug, p_amount: FRAGS_NIV1[fragTier] || 3 })
          .then(result => { if (result?.level_up) setFragmentResult(prev => prev ? { ...prev, levelUp: true, newLevel: result.new_level } : prev); })
          .catch(() => {});
      }
    }
  };

  async function distributeFragment(tier, amount) {
    const slug = randomSlugFromTier(tier);
    if (!slug) return null;
    setFragmentSaving(true);
    try {
      const data = await supaRpc('add_character_fragment', { p_user_id: TEST_USER_ID, p_slug: slug, p_amount: amount });
      const result = {
        slug, name: CHAR_NAMES[slug] || slug, emoji: CHAR_EMOJIS[slug] || '🎭', tier, amount,
        isComplete: amount >= FRAGS_NIV1[tier], levelUp: data?.level_up || false, newLevel: data?.new_level || 0,
        totalFrags: data?.fragments || amount, fragsNeeded: FRAGS_NIV1[tier],
      };
      setFragmentResult(result); setShowFragmentModal(true); fragmentSlideAnim.setValue(0);
      return result;
    } catch (e) {
      console.error('Fragment distribution error:', e);
      return null;
    } finally {
      setFragmentSaving(false);
    }
  }

  async function doSpin() {
    if (isSpinning || spinLoading) return;
    const segments = getSegments();
    setSpinLoading(true);
    try {
      const spinPromise = supaRpc('execute_spin', { p_user_id: TEST_USER_ID, p_spin_tier: spinTier });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connexion lente — réessaie')), 15000));
      const data = await Promise.race([spinPromise, timeoutPromise]);
      if (data && typeof data.reward_value === 'string') {
        try { data.reward_value = JSON.parse(data.reward_value); } catch(e) {}
      }
      if (!data?.success) {
        const errMsg = data?.error || data?.message || JSON.stringify(data);
        if (errMsg === 'Lix insuffisants' || errMsg === 'Insufficient Lix') {
          const required = data?.required || data?.cost || (spinTier === 'normal' ? 50 : spinTier === 'super' ? 150 : 500);
          const current = data?.current || data?.current_lix || lixBalance;
          showLixAlert('💰 Lix insuffisants', 'Il te faut ' + required + ' Lix pour ce spin.\n\nTon solde actuel : ' + current + ' Lix\nIl te manque ' + (required - current) + ' Lix.',
            [{ text: 'Recharger en Lix', color: '#D4AF37', onPress: () => { setActiveTab('lixspin'); setTimeout(() => { if (lixSpinScrollRef.current) lixSpinScrollRef.current.scrollTo({ y: 800, animated: true }); }, 300); } }, { text: 'Fermer', style: 'cancel' }], '💰');
        } else {
          showLixAlert('Erreur', errMsg, [{ text: 'OK', style: 'cancel' }], '⚠️');
        }
        setSpinLoading(false);
        return;
      }
      setServerResult(data);
      if (data.new_lix_balance !== undefined) setLixBalance(data.new_lix_balance);
      if (data.new_energy !== undefined) setUserEnergy(data.new_energy);
      if (data.is_free) { setFreeSpinUsed(true); setFreeSpinAvailable(false); setNextFreeAt(Date.now() + 6 * 60 * 60 * 1000); }
      setSpinLoading(false);

      const findWinnerIndex = (segs, srvData) => {
        const sType = srvData.reward_type;
        const sVal = srvData.reward_value || {};
        const typeMap = { 'energy': 'energy', 'lix': 'lix', 'fragment': 'fragment', 'xscan': 'scan', 'free_spin': 'free_spin', 'full_card': 'card' };
        const localType = typeMap[sType] || sType;
        let targetAmount = null;
        if (localType === 'energy') targetAmount = sVal.energy;
        if (localType === 'lix') targetAmount = sVal.lix;
        if (localType === 'scan') targetAmount = sVal.scans;
        if (localType === 'fragment') targetAmount = sVal.fragment;
        for (let i = 0; i < segs.length; i++) {
          const r = segs[i].reward;
          if (r.type !== localType) continue;
          if (localType === 'energy' && targetAmount != null && r.amount === targetAmount) return i;
          if (localType === 'lix' && targetAmount != null && r.amount === targetAmount) return i;
          if (localType === 'scan' && targetAmount != null && r.amount === targetAmount) return i;
          if (localType === 'fragment') { if (r.tier === (sVal.tier || srvData.character_tier)) return i; }
          if (localType === 'free_spin') return i;
          if (localType === 'card') return i;
        }
        for (let i = 0; i < segs.length; i++) { if (segs[i].reward.type === localType) return i; }
        return 0;
      };

      const winnerIndex = findWinnerIndex(segments, data);
      const winner = segments[winnerIndex];
      setIsSpinning(true); setSpinResult(null); setShowSpinResultModal(false); setSpinWinnerSeg(null);
      setWinnerGlowIdx(null); glowOpacity.setValue(0);

      const angledSegs = getSegmentAngles(segments);
      const winSeg = angledSegs[winnerIndex];
      const winMidAngle = winSeg.startAngle + winSeg.sweepAngle / 2;
      const targetAngle = 360 - winMidAngle;
      const totalRotation = 360 * 5 + targetAngle;
      const duration = spinTier === 'mega' ? 6000 : spinTier === 'super' ? 5000 : 4000;

      let lastTickIndex = -1;
      const totalTicks = 12;
      const listenerId = spinAnim.addListener(({ value }) => {
        const normalizedAngle = value % 360;
        const tickIndex = Math.floor(normalizedAngle / (360 / totalTicks));
        if (tickIndex !== lastTickIndex) {
          lastTickIndex = tickIndex;
          const progress = value / totalRotation;
          triggerArrowBounce(progress > 0.85);
        }
      });

      spinAnim.setValue(0);
      Animated.timing(spinAnim, {
        toValue: totalRotation, duration: duration,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }).start(() => {
        spinAnim.removeListener(listenerId);
        setIsSpinning(false); setSpinWinnerSeg(winner); setWinnerGlowIdx(winnerIndex);
        Animated.loop(Animated.sequence([
          Animated.timing(glowOpacity, { toValue: 0.6, duration: 500, useNativeDriver: true }),
          Animated.timing(glowOpacity, { toValue: 0.1, duration: 500, useNativeDriver: true }),
        ])).start();
        setTimeout(() => {
          glowOpacity.stopAnimation(); glowOpacity.setValue(0);
          setShowSpinResultModal(true);
          const rType = data.reward_value?.type || winner.reward.type;
          if (rType === 'fragment' || rType === 'card_complete' || rType === 'card') {
            spinResultPulse.setValue(1);
            Animated.loop(Animated.sequence([
              Animated.timing(spinResultPulse, { toValue: 1.15, duration: 600, useNativeDriver: true }),
              Animated.timing(spinResultPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
            ])).start();
          }
          onSpinComplete(data);
          if (data.reward_type === 'free_spin') { setFreeSpinAvailable(true); setFreeSpinUsed(false); setNextFreeAt(null); }
        }, 2000);
      });
    } catch (e) {
      console.error('Spin error:', e);
      showLixAlert('Erreur', e?.message || e?.details || JSON.stringify(e), [{ text: 'OK', style: 'cancel' }], '⚠️');
      setSpinLoading(false); setIsSpinning(false); setWinnerGlowIdx(null);
    }
  }

  async function handleCharRecharge(charId) {
    try {
      const data = await supaRpc('recharge_character', { p_user_id: TEST_USER_ID, p_slug: charId });
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

  return (
    <View style={{ flex: 1, backgroundColor: '#141A22' }}>
      <Text style={{ color: '#FFF', padding: 20 }}>LixVersePage orchestrator - state loaded</Text>
    </View>
  );
}
