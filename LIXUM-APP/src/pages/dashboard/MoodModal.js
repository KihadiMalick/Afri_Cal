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
import { useAuth } from '../../config/AuthContext';

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
  var auth = useAuth(); var userId = auth.userId;
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

  var resetAllStates = function() {
    setMoodLevel(0); setLockedAtChill(false); setMoodResult(null); setHearts([]); setShowWeather(false);
    setSelectedWeather(null); setHasStartedTapping(false); setTapCount(0); setOverflowTaps(0);
    setIsExcited(false); setEnergyParticles([]); setExcitedBuildUp(0);
    setCurrentTier(0); setTierLabel(''); setTierColor('#FFF'); setConfetti([]);
    tubeShakeAnim.setValue(0); tierLabelOpacity.setValue(0); screenShakeAnim.setValue(0);
  };

  useEffect(function() {
    if (!visible) resetAllStates();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}>
      <LinearGradient colors={['#0D1117', '#1A2029', '#0D1117']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Pressable onPressIn={(event) => { const { pageX, pageY } = event.nativeEvent; handleTap(pageX, pageY); }}
          style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <RNAnimated.View style={{
            flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center',
            transform: [{ translateX: screenShakeAnim }, { translateY: screenShakeAnim.interpolate({ inputRange: [-12, 0, 12], outputRange: [6, 0, -6] }) }],
          }}>
            {hearts.map(heart => (<FloatingHeart key={heart.id} heart={heart} tubeCenter={tubeLayout} />))}
            {confetti.map(item => (<Confetto key={item.id} item={item} />))}

            {!moodResult && (
              <Text style={{ color: '#EAEEF3', fontSize: 18, fontWeight: '800', letterSpacing: 2, marginBottom: 30 }}>COMMENT ALLEZ-VOUS ?</Text>
            )}

            {tierLabel !== '' && (
              <RNAnimated.View style={{ position: 'absolute', alignSelf: 'center', top: '42%', zIndex: 60, opacity: tierLabelOpacity, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: tierColor }}>
                <Text style={{ color: tierColor, fontSize: 20, fontWeight: '900', letterSpacing: 2 }}>{tierLabel}</Text>
              </RNAnimated.View>
            )}

            {!moodResult && (
              <View onLayout={(e) => { const { x, y, width, height } = e.nativeEvent.layout; setTubeLayout({ x: x + width / 2, y: y + height / 2 }); }}
                style={{ flexDirection: 'row', alignItems: 'flex-end', height: 300, position: 'relative' }}>
                {tapCount < 3 && (
                  <RNAnimated.View style={{ position: 'absolute', top: '45%', right: wp(30), alignItems: 'center', transform: [{ translateY: handTranslateY }], opacity: handOpacity, zIndex: 10 }}>
                    <Text style={{ fontSize: 50 }}>👆</Text>
                    <Text style={{ color: '#8892A0', fontSize: 13, marginTop: 4, textAlign: 'center' }}>Tapotez{'\n'}partout !</Text>
                  </RNAnimated.View>
                )}
                {energyParticles.map(p => (<EnergyParticle key={p.id} x={p.x} y={p.y} emoji={p.emoji} />))}
                <View style={{ justifyContent: 'space-between', height: 300, marginRight: 15, paddingVertical: 5, alignItems: 'center' }}>
                  <MoodIcon tier={3} size={42} active={activeTier === 3} />
                  <MoodIcon tier={2} size={42} active={activeTier === 2} />
                  <MoodIcon tier={1} size={42} active={activeTier === 1} />
                  <MoodIcon tier={0} size={42} active={activeTier === 0} />
                </View>
                <RNAnimated.View style={{ transform: [{ translateX: tubeShakeAnim }] }}>
                  <View style={{
                    width: 50, height: 300, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    borderWidth: tubeFlash ? 2 : 1,
                    borderColor: tubeFlash ? (isExcited ? '#D4AF37' : moodLevel >= 80 ? '#4DA6FF' : moodLevel >= 40 ? '#00D984' : '#8892A0') : 'rgba(255, 255, 255, 0.1)',
                    shadowColor: tubeFlash ? (isExcited ? '#D4AF37' : moodLevel >= 80 ? '#4DA6FF' : moodLevel >= 40 ? '#00D984' : '#FFFFFF') : 'transparent',
                    shadowOpacity: tubeFlash ? 0.8 : 0, shadowRadius: tubeFlash ? 15 : 0, shadowOffset: { width: 0, height: 0 },
                    overflow: 'hidden', justifyContent: 'flex-end',
                  }}>
                    <View style={{ position: 'absolute', bottom: 300 * 0.40, left: -4, right: -4, height: 2.5, backgroundColor: '#00D984', borderRadius: 1, zIndex: 5 }} />
                    <View style={{ position: 'absolute', bottom: 300 * 0.80, left: -4, right: -4, height: 2.5, backgroundColor: '#4DA6FF', borderRadius: 1, zIndex: 5 }} />
                    <View style={{ position: 'absolute', bottom: 300 * 0.95, left: -4, right: -4, height: 2.5, backgroundColor: '#D4AF37', borderRadius: 1, zIndex: 5 }} />
                    <LinearGradient
                      colors={isExcited || (moodLevel >= 100 && overflowTaps > 0) ? ['#D4AF37', '#FFE066'] : moodLevel >= HAPPY_THRESHOLD ? ['#4DA6FF', '#7DD3FC'] : moodLevel >= CHILL_THRESHOLD ? ['#00854F', '#00D984'] : ['#4A4F55', '#8892A0']}
                      style={{ width: '100%', height: moodLevel + '%', borderRadius: 25 }}
                    />
                  </View>
                </RNAnimated.View>
                <View style={{ justifyContent: 'space-between', height: 300, marginLeft: 15, paddingVertical: 5 }}>
                  <Text style={{ color: '#D4AF37', fontSize: 11, fontWeight: '700' }}>EXCITÉ</Text>
                  <Text style={{ color: '#4DA6FF', fontSize: 11, fontWeight: '700' }}>HEUREUX</Text>
                  <Text style={{ color: '#00D984', fontSize: 11, fontWeight: '700' }}>CHILL</Text>
                  <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '700' }}>TRISTE</Text>
                </View>
              </View>
            )}

            {!moodResult && (
              <Text style={{ color: '#8892A0', fontSize: 12, marginTop: 25, textAlign: 'center' }}>Tapotez l'écran pour exprimer votre humeur !</Text>
            )}

            {moodResult && !showWeather && (
              <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>
                {moodResult === 'excited' && confetti.length > 0 && confetti.map(item => (<Confetto key={item.id} item={item} />))}
                <View style={{ marginBottom: 15, shadowColor: moodMessages[moodResult].color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 10 }}>
                  <MoodIcon tier={moodMessages[moodResult].tier} size={70} active={true} />
                </View>
                <Text style={{ color: moodMessages[moodResult].color, fontSize: 22, fontWeight: '800', marginBottom: 10 }}>{moodMessages[moodResult].title}</Text>
                <Text style={{ color: '#8892A0', fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 30 }}>{moodMessages[moodResult].message}</Text>
                <View style={{ backgroundColor: 'rgba(0,217,132,0.06)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)', paddingHorizontal: 16, paddingVertical: 10, marginBottom: 20, marginTop: 10 }}>
                  <Text style={{ color: '#00D984', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>✨ ALIXEN a enregistré votre humeur et adaptera vos recommandations en conséquence</Text>
                </View>
                <TouchableOpacity onPress={() => setShowWeather(true)} style={{ backgroundColor: moodMessages[moodResult].color, borderRadius: 14, paddingHorizontal: 30, paddingVertical: 12 }}>
                  <Text style={{ color: '#0D1117', fontSize: 15, fontWeight: '800' }}>Continuer →</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetAllStates} style={{ marginTop: 15 }}>
                  <Text style={{ color: '#8892A0', fontSize: 12 }}>Refaire</Text>
                </TouchableOpacity>
              </View>
            )}

            {showWeather && (
              <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
                <Text style={{ color: '#EAEEF3', fontSize: 16, fontWeight: '800', letterSpacing: 2, marginBottom: 8 }}>QUEL TEMPS FAIT-IL ?</Text>
                <Text style={{ color: '#8892A0', fontSize: 12, marginBottom: 25, textAlign: 'center' }}>Cela nous aide à adapter vos recommandations</Text>
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  {[
                    { key: 'rainy', emoji: '🌧️', label: 'Pluvieux', color: '#4DA6FF' },
                    { key: 'cloudy', emoji: '☁️', label: 'Nuageux', color: '#8892A0' },
                    { key: 'sunny', emoji: '☀️', label: 'Ensoleillé', color: '#D4AF37' },
                  ].map(w => (
                    <TouchableOpacity key={w.key} onPress={() => setSelectedWeather(w.key)}
                      style={{
                        width: 90, height: 100, borderRadius: 18,
                        backgroundColor: selectedWeather === w.key ? w.color + '25' : 'rgba(255,255,255,0.04)',
                        borderWidth: 1.5, borderColor: selectedWeather === w.key ? w.color : 'rgba(255,255,255,0.08)',
                        justifyContent: 'center', alignItems: 'center',
                      }}>
                      <Text style={{ fontSize: 35 }}>{w.emoji}</Text>
                      <Text style={{ color: w.color, fontSize: 11, fontWeight: '700', marginTop: 5 }}>{w.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {selectedWeather && (
                  <View style={{ marginTop: 25, alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={async function() {
                        if (!userId) return;
                        try {
                          var today = new Date().toISOString().split('T')[0];
                          var countRes = await supabase.from('moods').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', today + 'T00:00:00').lt('created_at', today + 'T23:59:59');
                          if (countRes.count >= 20) {
                            if (onMoodSaved) onMoodSaved(moodResult, selectedWeather);
                            resetAllStates();
                            onClose();
                            return;
                          }
                          var moodNumeric = moodResult === 'excited' ? 5 : moodResult === 'happy' ? 4 : moodResult === 'chill' ? 3 : moodResult === 'sad' ? 2 : 1;
                          var moodInsertRes = await supabase.from('moods').insert({
                            user_id: userId, mood_level: moodNumeric,
                            weather: selectedWeather, tap_count: tapCount,
                            max_gauge_percent: Math.round(moodLevel),
                          });
                          if (moodInsertRes && moodInsertRes.error) {
                            console.warn('Mood insert error:', moodInsertRes.error);
                            throw moodInsertRes.error;
                          }
                          await supabase.from('users_profile').update({
                            current_mood: moodNumeric, current_weather: selectedWeather, last_mood_at: new Date().toISOString(),
                          }).eq('user_id', userId);

                          try {
                            Promise.resolve(supabase.rpc('add_user_xp', {
                              p_user_id: userId,
                              p_xp_amount: 5,
                              p_source: 'mood',
                              p_bonus_from: moodResult
                            })).then(null, function(e) { console.warn('add_user_xp mood error:', e); });
                          } catch (e) { console.warn('add_user_xp mood exception:', e); }

                          if (onMoodSaved) onMoodSaved(moodResult, selectedWeather);
                        } catch (e) {
                          console.warn('Mood save error:', e);
                        } finally {
                          resetAllStates();
                          onClose();
                        }
                      }}
                      style={{ backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: 14, paddingHorizontal: 30, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(0,217,132,0.4)' }}>
                      <Text style={{ color: '#00D984', fontSize: 15, fontWeight: '800' }}>Valider ✓</Text>
                    </TouchableOpacity>
                    <View style={{ height: 12 }} />
                  </View>
                )}
              </View>
            )}
          </RNAnimated.View>
        </Pressable>
      </LinearGradient>
    </View>
  );
};

export default MoodModal;
