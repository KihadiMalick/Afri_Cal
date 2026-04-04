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
  randomSlugFromTier, NAV_TABS
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

  return (
    <View style={{ flex: 1, backgroundColor: '#141A22' }}>
      <Text style={{ color: '#FFF', padding: 20 }}>LixVersePage orchestrator - state loaded</Text>
    </View>
  );
}
