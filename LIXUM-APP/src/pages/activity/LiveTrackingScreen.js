import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Pressable, ScrollView,
  Modal, Platform, Alert, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Polyline, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { supabase } from '../../config/supabase';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import {
  SPEED_ZONES, getSpeedZone, FOOD_ITEMS, getFoodEquivalent,
  WEATHER_WATER_MULTIPLIER, getWeatherWaterMult,
  LIVE_MILESTONES, CHAR_REACTIONS, getLang,
  ANTI_CHEAT_MAX_SPEED, ANTI_CHEAT_DURATION,
  AUTO_PAUSE_SPEED, AUTO_PAUSE_DELAY,
  HYDRATION_REMINDER_INTERVAL, ALIXEN_VOICE_LANG,
} from './activityConstants';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

export default function LiveTrackingScreen({
  visible,
  onClose,
  onActivitySaved,
  activeChar,
  userWeight,
  dailyTarget,
  totalEaten,
  totalBurnedBefore,
  userMood,
}) {
  var _lc = useLang(); var lang = _lc.lang;
  var t = getLang(lang);

  // === ÉTATS ===
  var _liveActive = useState(false); var liveActive = _liveActive[0]; var setLiveActive = _liveActive[1];
  var _liveCountdown = useState(0); var liveCountdown = _liveCountdown[0]; var setLiveCountdown = _liveCountdown[1];
  var _livePaused = useState(false); var livePaused = _livePaused[0]; var setLivePaused = _livePaused[1];
  var _liveAutoPaused = useState(false); var liveAutoPaused = _liveAutoPaused[0]; var setLiveAutoPaused = _liveAutoPaused[1];
  var _liveDistance = useState(0); var liveDistance = _liveDistance[0]; var setLiveDistance = _liveDistance[1];
  var _liveDuration = useState(0); var liveDuration = _liveDuration[0]; var setLiveDuration = _liveDuration[1];
  var _liveCalories = useState(0); var liveCalories = _liveCalories[0]; var setLiveCalories = _liveCalories[1];
  var _liveWater = useState(0); var liveWater = _liveWater[0]; var setLiveWater = _liveWater[1];
  var _liveSpeed = useState(0); var liveSpeed = _liveSpeed[0]; var setLiveSpeed = _liveSpeed[1];
  var _liveMaxSpeed = useState(0); var liveMaxSpeed = _liveMaxSpeed[0]; var setLiveMaxSpeed = _liveMaxSpeed[1];
  var _liveAvgSpeed = useState(0); var liveAvgSpeed = _liveAvgSpeed[0]; var setLiveAvgSpeed = _liveAvgSpeed[1];
  var _liveZone = useState(SPEED_ZONES[0]); var liveZone = _liveZone[0]; var setLiveZone = _liveZone[1];
  var _livePrevZone = useState(null); var livePrevZone = _livePrevZone[0]; var setLivePrevZone = _livePrevZone[1];
  var _liveMilestone = useState(null); var liveMilestone = _liveMilestone[0]; var setLiveMilestone = _liveMilestone[1];
  var _liveHydrationAlert = useState(false); var liveHydrationAlert = _liveHydrationAlert[0]; var setLiveHydrationAlert = _liveHydrationAlert[1];
  var _liveWalkTime = useState(0); var liveWalkTime = _liveWalkTime[0]; var setLiveWalkTime = _liveWalkTime[1];
  var _liveRunTime = useState(0); var liveRunTime = _liveRunTime[0]; var setLiveRunTime = _liveRunTime[1];
  var _liveCharMsg = useState(''); var liveCharMsg = _liveCharMsg[0]; var setLiveCharMsg = _liveCharMsg[1];
  var _liveFoodEquiv = useState(null); var liveFoodEquiv = _liveFoodEquiv[0]; var setLiveFoodEquiv = _liveFoodEquiv[1];
  var _liveWeatherMult = useState(1.2); var liveWeatherMult = _liveWeatherMult[0]; var setLiveWeatherMult = _liveWeatherMult[1];
  var _liveRoute = useState([]); var liveRoute = _liveRoute[0]; var setLiveRoute = _liveRoute[1];
  var _liveStartCoord = useState(null); var liveStartCoord = _liveStartCoord[0]; var setLiveStartCoord = _liveStartCoord[1];
  var _alixenMuted = useState(false); var alixenMuted = _alixenMuted[0]; var setAlixenMuted = _alixenMuted[1];
  var _alixenMessages = useState([]); var alixenMessages = _alixenMessages[0]; var setAlixenMessages = _alixenMessages[1];
  var _alixenSpeaking = useState(false); var alixenSpeaking = _alixenSpeaking[0]; var setAlixenSpeaking = _alixenSpeaking[1];

  // === REFS ===
  var liveLocationSubRef = useRef(null);
  var liveTimerRef = useRef(null);
  var liveLastPosRef = useRef(null);
  var liveMilestonesHitRef = useRef({});
  var liveSpeedSamplesRef = useRef([]);
  var liveStillCounterRef = useRef(0);
  var liveHydrationTimerRef = useRef(0);
  var liveSuspectCounterRef = useRef(0);
  var liveCaloriesAccRef = useRef(0);
  var liveWaterAccRef = useRef(0);
  var liveCharMsgTimerRef = useRef(null);
  var alixenLastDistRef = useRef(0);
  var alixenLastTimeRef = useRef(0);
  var alixenNearGoalRef = useRef(false);

  // === FONCTIONS ===

  function haversineDistance(lat1, lon1, lat2, lon2) {
    var R = 6371000;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function vibrateZoneChange(newZone, prevZone) {
    if (!prevZone || prevZone.zone === newZone.zone) return;
    if (newZone.zone === 'pause') return;
    if (SPEED_ZONES.indexOf(newZone) > SPEED_ZONES.indexOf(prevZone)) {
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      Vibration.vibrate(80);
    }
  }

  function showCharReaction(zone, langCode) {
    var reaction = CHAR_REACTIONS[zone.zone];
    if (!reaction) return;
    var msg = langCode === 'en' ? reaction.msgEN : reaction.msgFR;
    setLiveCharMsg(msg);
    if (liveCharMsgTimerRef.current) clearTimeout(liveCharMsgTimerRef.current);
    liveCharMsgTimerRef.current = setTimeout(function() { setLiveCharMsg(''); }, 4000);
  }

  var startLiveTracking = function() {
    (async function() {
      try {
        var profileData = await supabase
          .from('users_profile')
          .select('current_weather')
          .eq('user_id', TEST_USER_ID)
          .maybeSingle();
        if (profileData.data && profileData.data.current_weather) {
          setLiveWeatherMult(getWeatherWaterMult(profileData.data.current_weather));
        }
      } catch (e) {}
    })();

    setLiveCountdown(3);
    var countInterval = setInterval(function() {
      setLiveCountdown(function(prev) {
        if (prev <= 1) {
          clearInterval(countInterval);
          launchGPS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // === JSX (phases suivantes) ===

  if (!visible && !liveActive && liveCountdown === 0) return null;
  return null;
}
