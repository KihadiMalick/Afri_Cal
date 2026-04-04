import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Pressable,
  Animated as RNAnimated, Easing, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../../config/supabase';
import { W, H, wp, fp } from './dashboardConstants';
import { MoodIcon } from './dashboardIcons';

const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

const FloatingHeart = ({ heart, tubeCenter }) => {
  const anim = useRef(new RNAnimated.Value(0)).current;
  const heartSize = 18 + Math.random() * 8;
  const startX = heart.x;
  const startY = heart.y;
  const endX = tubeCenter?.x || W / 2;
  const endY = tubeCenter?.y || H * 0.45;
  const controlX = startX + (endX - startX) * 0.5 + (Math.random() - 0.5) * 100;
  const controlY = Math.min(startY, endY) - 50 - Math.random() * 60;

  useEffect(() => {
    RNAnimated.timing(anim, {
      toValue: 1, duration: 700 + Math.random() * 200,
      easing: Easing.inOut(Easing.ease), useNativeDriver: true,
    }).start();
  }, []);

  const translateX = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [startX, startX + (controlX - startX) * 0.44, controlX * 0.5 + (startX + endX) * 0.25, endX + (controlX - endX) * 0.19, endX],
  });
  const translateY = anim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [startY, startY + (controlY - startY) * 0.44, controlY * 0.5 + (startY + endY) * 0.25, endY + (controlY - endY) * 0.19, endY],
  });
  const scale = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [1.2, 1, 0.5, 0] });
  const opacity = anim.interpolate({ inputRange: [0, 0.2, 0.85, 1], outputRange: [0.9, 1, 0.8, 0] });

  return (
    <RNAnimated.Text style={{
      position: 'absolute', left: 0, top: 0, fontSize: heartSize, zIndex: 100,
      transform: [{ translateX }, { translateY }, { scale }], opacity,
    }}>{heart.emoji}</RNAnimated.Text>
  );
};

const EnergyParticle = ({ x, y, emoji }) => {
  const anim = useRef(new RNAnimated.Value(0)).current;
  const drift = useRef((Math.random() - 0.5) * 50).current;
  useEffect(() => {
    RNAnimated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);
  return (
    <RNAnimated.Text style={{
      position: 'absolute', left: x - 8, top: y ? y - 8 : 20, fontSize: 16, zIndex: 100,
      transform: [
        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -60 - Math.random() * 40] }) },
        { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, drift] }) },
      ],
      opacity: anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.8, 0] }),
    }}>{emoji}</RNAnimated.Text>
  );
};

const MoodModal = ({ visible, onClose, onMoodSaved }) => {
  const [moodLevel, setMoodLevel] = useState(0);
  const [lockedAtChill, setLockedAtChill] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [moodResult, setMoodResult] = useState(null);
  const [showWeather, setShowWeather] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [hasStartedTapping, setHasStartedTapping] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [overflowTaps, setOverflowTaps] = useState(0);
  const [isExcited, setIsExcited] = useState(false);
  const [energyParticles, setEnergyParticles] = useState([]);
  const [excitedBuildUp, setExcitedBuildUp] = useState(0);
  const [currentTier, setCurrentTier] = useState(0);
  const [tierLabel, setTierLabel] = useState('');
  const [tierColor, setTierColor] = useState('#FFF');
  const [confetti, setConfetti] = useState([]);
  const [tubeLayout, setTubeLayout] = useState({ x: W / 2, y: H * 0.45 });
  const [tubeFlash, setTubeFlash] = useState(false);
  const decayTimer = useRef(null);
  const heartId = useRef(0);
  const inactivityTimer = useRef(null);
  const handAnim = useRef(new RNAnimated.Value(0)).current;
  const tubeShakeAnim = useRef(new RNAnimated.Value(0)).current;
  const tierLabelOpacity = useRef(new RNAnimated.Value(0)).current;
  const screenShakeAnim = useRef(new RNAnimated.Value(0)).current;

  const CHILL_THRESHOLD = 40;
  const HAPPY_THRESHOLD = 80;

  const Confetto = ({ item }) => {
    const fallAnim = useRef(new RNAnimated.Value(0)).current;
    const rotateAnim = useRef(new RNAnimated.Value(0)).current;
    useEffect(() => {
      const delay = item.delay || 0;
      const timer = setTimeout(() => {
        RNAnimated.parallel([
          RNAnimated.timing(fallAnim, { toValue: 1, duration: 2000 + Math.random() * 1000, useNativeDriver: true }),
          RNAnimated.timing(rotateAnim, { toValue: 1, duration: 1500 + Math.random() * 1000, useNativeDriver: true }),
        ]).start();
      }, delay);
      return () => clearTimeout(timer);
    }, []);
    const translateY = fallAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, H + 50] });
    const translateX = fallAnim.interpolate({ inputRange: [0, 0.3, 0.6, 1], outputRange: [0, item.drift * 0.5, item.drift * -0.3, item.drift] });
    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', item.rotateEnd + 'deg'] });
    const opacity = fallAnim.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });
    return (
      <RNAnimated.View style={{
        position: 'absolute', left: item.x, top: 0, width: item.size, height: item.size * 2.5,
        borderRadius: item.size * 0.3, backgroundColor: item.color,
        transform: [{ translateY }, { translateX }, { rotate }], opacity, zIndex: 100,
      }} />
    );
  };

  useEffect(() => {
    if (!hasStartedTapping || isExcited) return;
    decayTimer.current = setInterval(() => {
      setMoodLevel(prev => {
        if (prev >= 100) return 100;
        if (prev >= HAPPY_THRESHOLD) return Math.max(prev - 1.5, HAPPY_THRESHOLD);
        if (prev >= CHILL_THRESHOLD) return Math.max(prev - 1.5, CHILL_THRESHOLD);
        return Math.max(prev - 1.5, 0);
      });
    }, 100);
    return () => clearInterval(decayTimer.current);
  }, [hasStartedTapping, isExcited]);

  useEffect(() => {
    if (tapCount < 3) {
      RNAnimated.loop(RNAnimated.sequence([
        RNAnimated.timing(handAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        RNAnimated.timing(handAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])).start();
    }
  }, [tapCount]);

  const handTranslateY = handAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const handOpacity = handAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.6, 1, 0.6] });

  useEffect(() => {
    if (excitedBuildUp > 0 && excitedBuildUp < 5 && !isExcited) {
      const intensity = excitedBuildUp * 1.2;
      const animation = RNAnimated.loop(RNAnimated.sequence([
        RNAnimated.timing(tubeShakeAnim, { toValue: intensity, duration: 35, useNativeDriver: true }),
        RNAnimated.timing(tubeShakeAnim, { toValue: -intensity, duration: 35, useNativeDriver: true }),
      ]));
      animation.start();
      return () => { animation.stop(); tubeShakeAnim.setValue(0); };
    }
    if (isExcited) tubeShakeAnim.setValue(0);
  }, [excitedBuildUp, isExcited]);

  useEffect(() => {
    if (moodResult || !hasStartedTapping) return;
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      let result;
      if (isExcited || moodLevel >= 100) result = 'excited';
      else if (moodLevel >= HAPPY_THRESHOLD) result = 'happy';
      else if (moodLevel >= CHILL_THRESHOLD) result = 'chill';
      else result = 'sad';
      setMoodResult(result);
      clearInterval(decayTimer.current);
    }, 3000);
    return () => clearTimeout(inactivityTimer.current);
  }, [moodLevel, hasStartedTapping, isExcited]);

  useEffect(() => {
    if (isExcited) {
      const colors = ['#FF8C42', '#00D984', '#4DA6FF', '#D4AF37', '#FF6B8A', '#FFD93D', '#FFFFFF'];
      const newConfetti = Array.from({ length: 40 }, (_, i) => ({
        id: Date.now() + i, x: Math.random() * W, color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6, drift: (Math.random() - 0.5) * 80, rotateEnd: 360 + Math.random() * 720, delay: Math.random() * 600,
      }));
      setConfetti(newConfetti);
      setTimeout(() => setConfetti([]), 3500);
      const shakeSequence = [];
      for (let i = 0; i < 15; i++) {
        shakeSequence.push(RNAnimated.timing(screenShakeAnim, { toValue: (Math.random() - 0.5) * 12, duration: 50 + Math.random() * 30, useNativeDriver: true }));
      }
      shakeSequence.push(RNAnimated.timing(screenShakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }));
      RNAnimated.sequence(shakeSequence).start();
    }
  }, [isExcited]);

  const triggerTierFeedback = (tier) => {
    const labels = { 1: 'CHILL', 2: 'HEUREUX', 3: 'EXCITÉ' };
    const tColors = { 1: '#00D984', 2: '#4DA6FF', 3: '#D4AF37' };
    setTierLabel(labels[tier] || ''); setTierColor(tColors[tier] || '#FFF');
    RNAnimated.sequence([
      RNAnimated.timing(tierLabelOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
      RNAnimated.delay(350),
      RNAnimated.timing(tierLabelOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setTierLabel(''));
    try { var Vibration = require('react-native').Vibration; Vibration.vibrate(30); } catch(e) {}
  };

  useEffect(() => {
    let newTier = 0;
    if (isExcited) newTier = 3;
    else if (moodLevel >= 80) newTier = 2;
    else if (moodLevel >= 40) newTier = 1;
    if (newTier > currentTier) { setCurrentTier(newTier); triggerTierFeedback(newTier); }
  }, [moodLevel, isExcited]);

  const spawnHeartsAt = (x, y) => {
    let emojis;
    if (isExcited || moodLevel >= 100) emojis = ['💛', '⭐', '✨', '💫', '🌟'];
    else if (moodLevel >= 80) emojis = ['💙', '💎', '🩵', '💠'];
    else if (moodLevel >= 40) emojis = ['💚', '💚', '🤍', '💚'];
    else emojis = ['🤍', '🩶', '🤍', '🩶'];
    const batch = Array.from({ length: 3 }, (_, i) => ({ id: Date.now() + i + Math.random(), emoji: emojis[Math.floor(Math.random() * emojis.length)], x, y }));
    setHearts(prev => [...prev, ...batch]);
    setTimeout(() => setHearts(prev => prev.filter(h => !batch.find(b => b.id === h.id))), 1000);
  };

  const spawnEnergyAt = (x, y) => {
    const newParticles = Array.from({ length: 2 }, (_, i) => ({ id: Date.now() + i + Math.random(), x, y, emoji: ['⚡', '✦', '🔥'][Math.floor(Math.random() * 3)] }));
    setEnergyParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => setEnergyParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 800);
  };

  const handleTap = (touchX, touchY) => {
    if (moodResult) return;
    if (!hasStartedTapping) setHasStartedTapping(true);
    setTapCount(prev => prev + 1);
    spawnHeartsAt(touchX, touchY);
    setTubeFlash(true); setTimeout(() => setTubeFlash(false), 200);
    if (isExcited) return;
    if (moodLevel >= 100) {
      setOverflowTaps(prev => prev + 1);
      setExcitedBuildUp(prev => {
        const next = prev + 1;
        if (next >= 5 && !isExcited) { setIsExcited(true); try { var Vibration = require('react-native').Vibration; Vibration.vibrate([0, 50, 30, 50]); } catch(e) {} }
        return Math.min(next, 5);
      });
      spawnEnergyAt(touchX, touchY);
    } else if (tapCount < 3) { setMoodLevel(prev => Math.min(prev + 1, 100)); }
    else { setMoodLevel(prev => Math.min(prev + 4, 100)); }
  };

  const moodMessages = {
    sad: { tier: 0, title: 'Ça va aller...', message: 'Une petite activité sportive en plein air peut faire des merveilles ! Bougez, respirez, et revenez plus fort.', color: '#8892A0' },
    chill: { tier: 1, title: 'Belle énergie !', message: 'Maintenez votre énergie positive avec un bon repas équilibré. Votre corps vous remerciera.', color: '#00D984' },
    happy: { tier: 2, title: 'Au top !', message: 'Quelle énergie ! Profitez de cette journée pour atteindre vos objectifs. Rien ne peut vous arrêter !', color: '#4DA6FF' },
    excited: { tier: 3, title: 'Tu déborde d\'énergie !', message: 'C\'est le moment de tout donner ! Tu es au maximum de ton énergie !', color: '#D4AF37' },
  };

  const activeTier = isExcited ? 3 : moodLevel >= 80 ? 2 : moodLevel >= 40 ? 1 : 0;

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}>
      <Text style={{ color: '#FFF' }}>MoodModal render placeholder</Text>
    </View>
  );
};

export default MoodModal;
