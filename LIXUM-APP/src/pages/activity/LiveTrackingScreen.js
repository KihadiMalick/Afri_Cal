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

const SUPABASE_URL = 'https://yuhordnzfpcswztujozi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1aG9yZG56ZnBjc3d6dHVqb3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzMwNDgsImV4cCI6MjA4NjkwOTA0OH0.maCsNdVUaUzxrUHFyahTDPRPZYctbUfefA5EMC7pUn0';
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

  var launchGPS = async function() {
    try {
      var perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission GPS requise', 'LIXUM a besoin du GPS pour le suivi en temps réel.', [{ text: 'OK' }]);
        return;
      }

      // Reset
      setLiveDistance(0); setLiveDuration(0); setLiveCalories(0); setLiveWater(0);
      setLiveSpeed(0); setLiveMaxSpeed(0); setLiveAvgSpeed(0);
      setLiveZone(SPEED_ZONES[0]); setLivePrevZone(null);
      setLiveMilestone(null); setLivePaused(false); setLiveAutoPaused(false);
      setLiveWalkTime(0); setLiveRunTime(0); setLiveCharMsg(''); setLiveFoodEquiv(null);
      liveLastPosRef.current = null; liveMilestonesHitRef.current = {};
      liveSpeedSamplesRef.current = []; liveStillCounterRef.current = 0;
      liveHydrationTimerRef.current = 0; liveSuspectCounterRef.current = 0;
      liveCaloriesAccRef.current = 0; liveWaterAccRef.current = 0;
      setLiveRoute([]); setLiveStartCoord(null);
      setLiveActive(true);
      setTimeout(function() { alixenSpeak('start'); }, 2000);

      // Timer durée (1s)
      liveTimerRef.current = setInterval(function() {
        setLivePaused(function(paused) {
          setLiveAutoPaused(function(autoPaused) {
            if (!paused && !autoPaused) {
              setLiveDuration(function(d) { return d + 1; });
              setLiveDuration(function(dur) {
                if (dur > 0 && dur % 300 === 0 && dur !== alixenLastTimeRef.current) {
                  alixenLastTimeRef.current = dur;
                  alixenSpeak('every5min');
                }
                return dur;
              });
              liveHydrationTimerRef.current += 1;
              if (liveHydrationTimerRef.current >= HYDRATION_REMINDER_INTERVAL) {
                liveHydrationTimerRef.current = 0;
                setLiveHydrationAlert(true);
                alixenSpeak('hydration');
                Vibration.vibrate([0, 200, 100, 200]);
                setTimeout(function() { setLiveHydrationAlert(false); }, 5000);
              }
            }
            return autoPaused;
          });
          return paused;
        });
      }, 1000);

      // Watcher GPS
      liveLocationSubRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 2 },
        function(location) {
          setLivePaused(function(paused) {
            if (paused) return paused;

            var lat = location.coords.latitude;
            var lon = location.coords.longitude;
            var accuracy = location.coords.accuracy || 999;
            var timestamp = location.timestamp;

            if (accuracy > 50) return paused;

            if (liveLastPosRef.current) {
              var dist = haversineDistance(liveLastPosRef.current.lat, liveLastPosRef.current.lon, lat, lon);
              var timeDelta = (timestamp - liveLastPosRef.current.timestamp) / 1000;
              if (timeDelta <= 0) timeDelta = 1;
              var speedMs = dist / timeDelta;
              var speedKmh = speedMs * 3.6;

              // Anti-triche
              if (speedKmh > ANTI_CHEAT_MAX_SPEED) {
                liveSuspectCounterRef.current += timeDelta;
                if (liveSuspectCounterRef.current > ANTI_CHEAT_DURATION) {
                  setLiveAutoPaused(true);
                  Vibration.vibrate([0, 300, 100, 300, 100, 300]);
                  Alert.alert('Vitesse suspecte', 'Vitesse trop élevée détectée. Tracking en pause.');
                }
                liveLastPosRef.current = { lat: lat, lon: lon, timestamp: timestamp };
                return paused;
              }
              liveSuspectCounterRef.current = 0;

              // Auto-pause si immobile
              if (speedKmh < AUTO_PAUSE_SPEED) {
                liveStillCounterRef.current += timeDelta;
                if (liveStillCounterRef.current > AUTO_PAUSE_DELAY) {
                  setLiveAutoPaused(true);
                }
              } else {
                liveStillCounterRef.current = 0;
                setLiveAutoPaused(function(was) { return was ? false : was; });
              }

              // Distance
              if (dist > 1 && dist < 100) {
                setLiveDistance(function(d) { return d + dist; });
              }

              // Vitesse
              setLiveSpeed(speedKmh);
              liveSpeedSamplesRef.current.push(speedKmh);
              if (speedKmh > 0) {
                setLiveMaxSpeed(function(max) { return Math.max(max, speedKmh); });
              }
              var avgS = liveSpeedSamplesRef.current.reduce(function(a, b) { return a + b; }, 0) / liveSpeedSamplesRef.current.length;
              setLiveAvgSpeed(avgS);

              // Zone MET + vibration + réaction caractère
              var newZone = getSpeedZone(speedKmh);
              setLiveZone(function(prevZ) {
                if (prevZ.zone !== newZone.zone) {
                  vibrateZoneChange(newZone, prevZ);
                  showCharReaction(newZone, lang);
                  alixenSpeak('zoneChange', { zoneFrom: prevZ.label, zoneTo: newZone.label });
                }
                return newZone;
              });

              // Walk vs Run time
              if (speedKmh >= 7) {
                setLiveRunTime(function(rt) { return rt + timeDelta; });
              } else if (speedKmh >= 1) {
                setLiveWalkTime(function(wt) { return wt + timeDelta; });
              }

              // Calories (MET variable × poids × temps)
              var calIncrement = (newZone.met * (userWeight || 70) * timeDelta) / 3600;
              liveCaloriesAccRef.current += calIncrement;
              var totalCal = Math.round(liveCaloriesAccRef.current);
              setLiveCalories(totalCal);

              // Proche de l'objectif calorique
              var surplus = (totalEaten || 0) - (totalBurnedBefore || 0) - totalCal - (dailyTarget || 2000);
              if (surplus <= 50 && surplus > -50 && !alixenNearGoalRef.current) {
                alixenNearGoalRef.current = true;
                alixenSpeak('nearGoal');
              }

              // Équivalent alimentaire en temps réel
              setLiveFoodEquiv(getFoodEquivalent(totalCal));

              // Eau perdue (ajustée au climat)
              var baseWaterRate = newZone.met > 7 ? 900 : newZone.met > 4 ? 600 : 400;
              var weatherMult = 1.2;
              setLiveWeatherMult(function(wm) { weatherMult = wm; return wm; });
              var waterIncrement = (baseWaterRate * weatherMult * timeDelta) / 3600;
              liveWaterAccRef.current += waterIncrement;
              setLiveWater(Math.round(liveWaterAccRef.current));
            }

            liveLastPosRef.current = { lat: lat, lon: lon, timestamp: timestamp };

            // Enregistrer le point sur le tracé
            setLiveRoute(function(prev) {
              return prev.concat([{ latitude: lat, longitude: lon }]);
            });
            if (!liveStartCoord) {
              setLiveStartCoord({ latitude: lat, longitude: lon });
            }

            // Milestones
            setLiveDistance(function(currentDist) {
              LIVE_MILESTONES.forEach(function(m) {
                if (currentDist >= m.distance && !liveMilestonesHitRef.current[m.distance]) {
                  liveMilestonesHitRef.current[m.distance] = true;
                  alixenSpeak('milestone', { milestone: m.labelFR });
                  setLiveMilestone(m);
                  Vibration.vibrate([0, 150, 80, 150, 80, 150]);
                  setTimeout(function() { setLiveMilestone(null); }, 4000);
                }
              });
              return currentDist;
            });

            // ALIXEN tous les 500m
            (function() {
              var last500 = Math.floor(alixenLastDistRef.current / 500);
              var curr500 = Math.floor((liveDistance + (liveLastPosRef.current ? 0 : 0)) / 500);
              if (curr500 > last500) {
                alixenLastDistRef.current = liveDistance;
                var isMilestone = false;
                LIVE_MILESTONES.forEach(function(m) {
                  if (Math.abs(liveDistance - m.distance) < 50) isMilestone = true;
                });
                if (!isMilestone) alixenSpeak('every500m');
              }
            })();

            return paused;
          });
        }
      );
    } catch (e) {
      console.error('GPS error:', e);
      Alert.alert('Erreur GPS', 'Impossible de démarrer le suivi GPS.');
    }
  };

  var toggleLivePause = function() {
    setLivePaused(function(p) { return !p; });
    setLiveAutoPaused(false);
    liveStillCounterRef.current = 0;
    Vibration.vibrate(50);
  };

  var stopLiveTracking = async function() {
    if (liveLocationSubRef.current) { liveLocationSubRef.current.remove(); liveLocationSubRef.current = null; }
    if (liveTimerRef.current) { clearInterval(liveTimerRef.current); liveTimerRef.current = null; }

    var dominantType = liveRunTime > liveWalkTime ? 'course' : 'marche';
    var durationMin = Math.round(liveDuration / 60);

    if (durationMin > 0 && liveDistance > 10) {
      var summary = {
        type: dominantType === 'course' ? 'run' : 'walk',
        name: dominantType === 'course' ? 'Course' : 'Marche',
        distance: liveDistance < 1000 ? Math.round(liveDistance) + ' m' : (Math.round(liveDistance / 100) / 10) + ' km',
        distanceRaw: Math.round(liveDistance),
        duration: durationMin,
        kcal: liveCalories,
        water: liveWater,
        speed: (Math.round(liveAvgSpeed * 10) / 10) + ' km/h',
        isGPS: true,
        maxSpeed: Math.round(liveMaxSpeed * 10) / 10,
        walkPercent: liveWalkTime + liveRunTime > 0 ? Math.round(liveWalkTime / (liveWalkTime + liveRunTime) * 100) : 100,
        runPercent: liveWalkTime + liveRunTime > 0 ? Math.round(liveRunTime / (liveWalkTime + liveRunTime) * 100) : 0,
        pace: liveAvgSpeed > 0 ? Math.floor(60 / liveAvgSpeed) + ':' + (Math.round((60 / liveAvgSpeed % 1) * 60) < 10 ? '0' : '') + Math.round((60 / liveAvgSpeed % 1) * 60) : '--:--',
        source: 'live_gps',
        weatherMult: liveWeatherMult,
        foodEquiv: liveFoodEquiv,
        route: liveRoute,
        startCoord: liveStartCoord,
        activityType: dominantType,
        intensity: liveAvgSpeed > 9 ? 'intense' : liveAvgSpeed > 5.5 ? 'modere' : 'leger',
      };
      onActivitySaved(summary);
    }

    await alixenSpeak('finish');
    setAlixenMessages([]);
    setAlixenSpeaking(false);
    alixenLastDistRef.current = 0;
    alixenLastTimeRef.current = 0;
    alixenNearGoalRef.current = false;
    Speech.stop();
    setLiveActive(false);
    onClose();
  };

  var alixenSpeak = async function(phase, extraContext) {
    try {
      var ctx = {
        phase: phase,
        distance: Math.round(liveDistance),
        duration: liveDuration,
        calories: liveCalories,
        water: liveWater,
        speed: Math.round(liveSpeed * 10) / 10,
        avgSpeed: Math.round(liveAvgSpeed * 10) / 10,
        zone: liveZone.label,
        walkPercent: liveWalkTime + liveRunTime > 0 ? Math.round(liveWalkTime / (liveWalkTime + liveRunTime) * 100) : 100,
        runPercent: liveWalkTime + liveRunTime > 0 ? Math.round(liveRunTime / (liveWalkTime + liveRunTime) * 100) : 0,
        userWeight: userWeight || 70,
        dailyTarget: dailyTarget || 2000,
        totalEaten: totalEaten || 0,
        totalBurnedBefore: totalBurnedBefore || 0,
        userMood: userMood || null,
        charName: activeChar ? activeChar.name : 'ALIXEN',
      };
      if (extraContext) {
        Object.keys(extraContext).forEach(function(k) { ctx[k] = extraContext[k]; });
      }

      var message = '';
      try {
        var response = await fetch(SUPABASE_URL + '/functions/v1/alixen-live-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
          body: JSON.stringify({ phase: phase, context: ctx }),
        });
        var data = await response.json();
        if (data && data.message) {
          message = data.message;
        }
      } catch (apiErr) {
        console.warn('ALIXEN API fallback:', apiErr);
      }

      if (!message) {
        var distStr = ctx.distance < 1000 ? ctx.distance + ' mètres' : (Math.round(ctx.distance / 100) / 10) + ' kilomètres';
        var durStr = Math.floor(ctx.duration / 60) + ' minutes';
        var remainCal = Math.max(0, ctx.totalEaten - ctx.totalBurnedBefore - ctx.calories - ctx.dailyTarget);

        switch(phase) {
          case 'start':
            message = 'C\'est parti ! Bonne session. Ton objectif aujourd\'hui : ' + ctx.dailyTarget + ' calories.';
            break;
          case 'every500m':
            message = distStr + ' parcourus, ' + ctx.calories + ' calories brûlées.';
            if (remainCal > 0) message += ' Encore ' + remainCal + ' calories pour atteindre ton objectif.';
            break;
          case 'every5min':
            message = durStr + ' d\'effort, ' + ctx.calories + ' calories. Vitesse moyenne ' + ctx.avgSpeed + ' km/h.';
            break;
          case 'zoneChange':
            message = 'Changement de rythme ! Tu passes en ' + (extraContext ? extraContext.zoneTo : ctx.zone) + '.';
            break;
          case 'milestone':
            message = (extraContext ? extraContext.milestone : 'Nouveau palier') + ' Excellent, continue !';
            break;
          case 'hydration':
            message = 'Tu as perdu environ ' + ctx.water + ' millilitres d\'eau. Pense à t\'hydrater.';
            break;
          case 'nearGoal':
            message = 'Tu approches de ton objectif calorique ! Encore quelques minutes et c\'est parfait.';
            break;
          case 'finish':
            message = 'Session terminée ! ' + ctx.calories + ' calories brûlées en ' + durStr + '. Pense à boire ' + Math.round(ctx.water * 1.3) + ' ml d\'eau.';
            break;
          default:
            message = 'Continue, tu gères bien.';
        }
      }

      setAlixenMessages(function(prev) {
        return [{ text: message, phase: phase, time: liveDuration, id: Date.now() }].concat(prev).slice(0, 20);
      });

      if (!alixenMuted) {
        setAlixenSpeaking(true);
        Speech.speak(message, {
          language: ALIXEN_VOICE_LANG,
          rate: 0.95,
          pitch: 1.0,
          onDone: function() { setAlixenSpeaking(false); },
          onError: function() { setAlixenSpeaking(false); },
        });
      }

    } catch (e) {
      console.warn('ALIXEN speak error:', e);
    }
  };

  // Cleanup
  useEffect(function() {
    return function() {
      if (liveLocationSubRef.current) liveLocationSubRef.current.remove();
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      Speech.stop();
    };
  }, []);

  // Start tracking when visible
  useEffect(function() {
    if (visible && !liveActive && liveCountdown === 0) {
      startLiveTracking();
    }
  }, [visible]);

  // === JSX (phases suivantes) ===

  // === JSX ===

  if (!visible && !liveActive && liveCountdown === 0) return null;
  return (
    <>
      {/* Countdown 3-2-1 */}
      <Modal visible={liveCountdown > 0} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: wp(120), height: wp(120), borderRadius: wp(60),
            borderWidth: 3, borderColor: '#00D984',
            justifyContent: 'center', alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.08)',
          }}>
            <Text style={{ fontSize: fp(60), fontWeight: '900', color: '#00D984' }}>
              {liveCountdown}
            </Text>
          </View>
          <Text style={{ color: '#8892A0', fontSize: fp(14), marginTop: wp(20), fontWeight: '600', letterSpacing: 2 }}>
            PRÉPAREZ-VOUS
          </Text>
        </View>
      </Modal>

      {/* Live tracking */}
      <Modal visible={liveActive} animationType="slide" onRequestClose={function() {}}>
        <View style={{ flex: 1, backgroundColor: '#0D1117' }}>
          <LinearGradient colors={['#0D1117', '#141A22', '#0D1117']} style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(30) }}>

              {/* Header */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: Platform.OS === 'android' ? 50 : 60, paddingHorizontal: wp(16), paddingBottom: wp(8),
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                  <View style={{
                    width: wp(10), height: wp(10), borderRadius: wp(5),
                    backgroundColor: livePaused || liveAutoPaused ? '#FFB800' : '#FF1744',
                  }} />
                  <Text style={{
                    color: livePaused || liveAutoPaused ? '#FFB800' : '#FF1744',
                    fontSize: fp(14), fontWeight: '800', letterSpacing: 2,
                  }}>
                    {livePaused ? 'PAUSE' : liveAutoPaused ? 'AUTO-PAUSE' : 'LIVE'}
                  </Text>
                </View>
                <Text style={{ color: '#EAEEF3', fontSize: fp(20), fontWeight: '700', fontVariant: ['tabular-nums'] }}>
                  {(function() {
                    var h = Math.floor(liveDuration / 3600);
                    var m = Math.floor((liveDuration % 3600) / 60);
                    var s = liveDuration % 60;
                    return (h > 0 ? h + ':' : '') + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
                  })()}
                </Text>
                <Pressable onPress={function() { setAlixenMuted(function(m) { return !m; }); }} style={{
                  width: wp(36), height: wp(36), borderRadius: wp(18),
                  backgroundColor: alixenMuted ? 'rgba(255,107,107,0.12)' : 'rgba(0,217,132,0.12)',
                  borderWidth: 1, borderColor: alixenMuted ? 'rgba(255,107,107,0.25)' : 'rgba(0,217,132,0.25)',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Ionicons name={alixenMuted ? 'volume-mute' : 'volume-high'} size={wp(16)} color={alixenMuted ? '#FF6B6B' : '#00D984'} />
                </Pressable>
              </View>

              {/* Caractère compagnon */}
              {activeChar && (
                <View style={{
                  marginHorizontal: wp(16), marginBottom: wp(10),
                  flexDirection: 'row', alignItems: 'center', gap: wp(10),
                  backgroundColor: liveZone.color + '08', borderRadius: wp(12),
                  padding: wp(10), borderWidth: 1, borderColor: liveZone.color + '15',
                }}>
                  <View style={{
                    width: wp(40), height: wp(40), borderRadius: wp(20),
                    backgroundColor: liveZone.color + '15', borderWidth: 1.5,
                    borderColor: liveZone.color + '30',
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: fp(20) }}>
                      {({ emerald_owl: '🦉', hawk_eye: '🦅', ruby_tiger: '🐯', amber_fox: '🦊', gipsy: '🕷️', jade_phoenix: '🔥', silver_wolf: '🐺', boukki: '🦴', iron_rhino: '🦏', coral_dolphin: '🐬' })[activeChar.slug] || '🎭'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fp(11), fontWeight: '700', color: liveZone.color }}>{activeChar.name}</Text>
                    {liveCharMsg ? (
                      <Text style={{ fontSize: fp(10), color: '#EAEEF3', marginTop: wp(2), fontStyle: 'italic' }}>"{liveCharMsg}"</Text>
                    ) : (
                      <Text style={{ fontSize: fp(9), color: '#8892A0', marginTop: wp(2) }}>
                        {livePaused || liveAutoPaused ? 'En attente...' : 'Court avec toi !'}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Barre d'intensité */}
              <View style={{
                marginHorizontal: wp(16), marginBottom: wp(12),
                backgroundColor: liveZone.color + '08', borderRadius: wp(14),
                padding: wp(14), borderWidth: 1, borderColor: liveZone.color + '20',
              }}>
                <View style={{ flexDirection: 'row', height: wp(8), borderRadius: wp(4), overflow: 'hidden', marginBottom: wp(10), gap: 2 }}>
                  {SPEED_ZONES.slice(1).map(function(z, i) {
                    var isActive = liveSpeed >= z.minSpeed && liveSpeed < z.maxSpeed;
                    var isPassed = liveSpeed >= z.maxSpeed;
                    return (
                      <View key={i} style={{
                        flex: 1, borderRadius: wp(4),
                        backgroundColor: isActive ? z.color : isPassed ? z.color + '60' : 'rgba(255,255,255,0.06)',
                      }} />
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: liveZone.color, fontSize: fp(16), fontWeight: '800' }}>{liveZone.label}</Text>
                  <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '600' }}>{Math.round(liveSpeed * 10) / 10} km/h</Text>
                </View>
                <Text style={{ color: '#8892A0', fontSize: fp(9), marginTop: wp(4) }}>
                  MET {liveZone.met} · {liveSpeed >= 7 ? 'Course' : 'Marche'}
                </Text>
              </View>

              {/* Distance géante */}
              <View style={{ alignItems: 'center', marginBottom: wp(6) }}>
                <Text style={{ color: '#EAEEF3', fontSize: fp(56), fontWeight: '900', fontVariant: ['tabular-nums'] }}>
                  {liveDistance < 1000 ? Math.round(liveDistance) : (Math.round(liveDistance / 10) / 100).toFixed(2)}
                </Text>
                <Text style={{ color: '#8892A0', fontSize: fp(16), fontWeight: '600', letterSpacing: 3, marginTop: -wp(4) }}>
                  {liveDistance < 1000 ? 'MÈTRES' : 'KM'}
                </Text>
              </View>

              {/* Mini-carte live */}
              {liveRoute.length > 1 && (
                <View style={{
                  marginHorizontal: wp(16), marginBottom: wp(12),
                  borderRadius: wp(14), overflow: 'hidden',
                  borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
                  height: wp(160),
                }}>
                  <MapView
                    style={{ flex: 1 }}
                    scrollEnabled={false} zoomEnabled={false} rotateEnabled={false} pitchEnabled={false}
                    customMapStyle={[
                      { elementType: 'geometry', stylers: [{ color: '#1A1D22' }] },
                      { elementType: 'labels.text.fill', stylers: [{ color: '#8892A0' }] },
                      { elementType: 'labels.text.stroke', stylers: [{ color: '#0D1117' }] },
                      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2A303B' }] },
                      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
                      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                    ]}
                    region={{
                      latitude: liveRoute[liveRoute.length - 1].latitude,
                      longitude: liveRoute[liveRoute.length - 1].longitude,
                      latitudeDelta: 0.008, longitudeDelta: 0.008,
                    }}
                  >
                    <Polyline coordinates={liveRoute} strokeColor="#00D984" strokeWidth={4} />
                    {liveStartCoord && (
                      <Marker coordinate={liveStartCoord} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#00D984', borderWidth: 2, borderColor: '#FFFFFF' }} />
                      </Marker>
                    )}
                    <Marker coordinate={liveRoute[liveRoute.length - 1]} anchor={{ x: 0.5, y: 0.5 }}>
                      <View style={{
                        width: 16, height: 16, borderRadius: 8,
                        backgroundColor: '#FF1744', borderWidth: 2, borderColor: '#FFFFFF',
                        shadowColor: '#FF1744', shadowOpacity: 0.5, shadowRadius: 6, elevation: 4,
                      }} />
                    </Marker>
                  </MapView>
                  <LinearGradient colors={['transparent', 'rgba(13,17,23,0.6)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 30 }} pointerEvents="none" />
                  <View style={{
                    position: 'absolute', top: wp(6), right: wp(6),
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: wp(6),
                    paddingHorizontal: wp(6), paddingVertical: wp(3),
                  }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00D984' }} />
                    <Text style={{ fontSize: fp(7), color: '#00D984', fontWeight: '700' }}>GPS</Text>
                  </View>
                </View>
              )}

              {/* === PHASE 6 : suite JSX === */}

            </ScrollView>

            {/* === PHASE 6 : boutons + toasts === */}

          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}
