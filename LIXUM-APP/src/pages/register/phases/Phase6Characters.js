import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, runOnJS, interpolate, Extrapolation,
  FadeInDown,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { W, C, SWIPE_THRESHOLD } from '../registerConstants';
import { CircuitPattern } from '../registerComponents';

var CHAR_CARD_W = W - 60;
var CHAR_CARD_H = 420;

var emeraldOwlImg = null;
try { emeraldOwlImg = require('../../../../assets/images/emerald_owl.webp'); } catch(e) {}
var mosquitoImg = null;
try { mosquitoImg = require('../../../../assets/images/mosquito.webp'); } catch(e) {}
var diamondSimbaImg = null;
try { diamondSimbaImg = require('../../../../assets/images/diamond_simba.webp'); } catch(e) {}

function CharacterCard(props) {
  var char = props.character, isTop = props.isTop, onSwipe = props.onSwipe;
  var translateX = useSharedValue(0), translateY = useSharedValue(0), rotateZ = useSharedValue(0);

  var gesture = Gesture.Pan().enabled(isTop)
    .onUpdate(function(e) {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.3;
      rotateZ.value = interpolate(e.translationX, [-W, 0, W], [-12, 0, 12], Extrapolation.CLAMP);
    })
    .onEnd(function(e) {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        var dir = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(dir * W * 1.5, { duration: 300 });
        rotateZ.value = withTiming(dir * 20, { duration: 300 });
        runOnJS(onSwipe)();
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotateZ.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  var animStyle = useAnimatedStyle(function() {
    if (!isTop) return {};
    return { transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { rotateZ: rotateZ.value + 'deg' }] };
  });
  var behindStyle = !isTop ? { transform: [{ scale: 0.95 }, { translateY: 10 }], opacity: 0.5 } : {};

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ position: 'absolute', alignSelf: 'center', zIndex: isTop ? 10 : 5 }, isTop ? animStyle : behindStyle]}>
        <View style={{
          width: CHAR_CARD_W, borderRadius: 16, overflow: 'hidden',
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 16,
        }}>
          {char.image ? (
            <Image source={char.image} style={{ width: '100%', height: CHAR_CARD_H }} resizeMode="cover" />
          ) : (
            <View style={{ height: CHAR_CARD_H, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0E14',
              borderRadius: 16, borderWidth: 1.5, borderColor: char.borderColors[0] + '30' }}>
              <CircuitPattern width={CHAR_CARD_W} height={CHAR_CARD_H} color={char.borderColors[0] + '08'} />
              <Text style={{ fontSize: 80, position: 'absolute' }}>{char.fallbackEmoji}</Text>
              <Text style={{ position: 'absolute', bottom: 50, color: '#EAEEF3', fontSize: 18, fontWeight: '800', letterSpacing: 2 }}>{char.name}</Text>
              <Text style={{ position: 'absolute', bottom: 32, color: char.levelColor, fontSize: 11, fontWeight: '600' }}>{char.power}</Text>
              <View style={{ position: 'absolute', top: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4,
                borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: char.levelColor + '40' }}>
                <Text style={{ color: char.levelColor, fontSize: 9, fontWeight: '800', letterSpacing: 2 }}>{char.level}</Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function Phase6Characters({ lang }) {
  var _ci = useState(0), ci = _ci[0], setCi = _ci[1];

  var characters = [
    {
      name: 'EMERALD OWL', level: 'STANDARD', levelColor: '#00D984',
      borderColors: ['#00D984', '#00A866', '#006B40'],
      power: lang === 'fr' ? 'R\u00e9sum\u00e9 nutritionnel quotidien' : 'Daily nutrition summary',
      image: emeraldOwlImg,
      fallbackEmoji: '🦉',
    },
    {
      name: 'MOSQUITO', level: lang === 'fr' ? '\u00c9LITE' : 'ELITE', levelColor: '#B388FF',
      borderColors: ['#B388FF', '#8F6DCC', '#6B5299'],
      power: lang === 'fr' ? 'L\'Essaim \u2014 acc\u00e8s Niv1 toute carte' : 'The Swarm \u2014 Lv1 access all cards',
      image: mosquitoImg,
      fallbackEmoji: '🦟',
    },
    {
      name: 'DIAMOND SIMBA', level: lang === 'fr' ? 'MYTHIQUE' : 'MYTHIC', levelColor: '#D4AF37',
      borderColors: ['#D4AF37', '#C5A028', '#8B7516'],
      power: lang === 'fr' ? 'XP +50% + Rapport PDF mensuel' : 'XP +50% + Monthly PDF report',
      image: diamondSimbaImg,
      fallbackEmoji: '🦁',
    },
  ];

  var allSwiped = ci >= characters.length;
  var handleSwipe = function() { setCi(function(p) { return Math.min(p + 1, characters.length); }); };

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(212,175,55,0.08)',
          borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="diamond-outline" size={24} color="#D4AF37" />
        </View>
        <Text style={{ color: '#EAEEF3', fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 8 }}>
          {lang === 'fr' ? 'Vos Compagnons' : 'Your Companions'}
        </Text>
        <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 4 }}>
          {lang === 'fr' ? 'Collectionnez et d\u00e9bloquez des pouvoirs' : 'Collect and unlock powers'}
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {!allSwiped ? (
          <View style={{ width: CHAR_CARD_W, height: CHAR_CARD_H }}>
            {characters.slice(0).reverse().map(function(char, ri) {
              var ai = characters.length - 1 - ri;
              if (ai < ci || ai > ci + 1) return null;
              return <CharacterCard key={char.name} character={char} isTop={ai === ci} onSwipe={handleSwipe} />;
            })}
          </View>
        ) : (
          <Animated.View entering={FadeInDown.duration(600).springify()} style={{ alignItems: 'center', padding: 24 }}>
            <Ionicons name="sparkles" size={36} color="#D4AF37" />
            <Text style={{ color: '#EAEEF3', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 12 }}>
              {lang === 'fr' ? 'Et bien d\'autres \u00e0 d\u00e9couvrir...' : 'And many more to discover...'}
            </Text>
            <Text style={{ color: '#8892A0', fontSize: 12, textAlign: 'center', marginTop: 6 }}>
              {lang === 'fr' ? '16 caract\u00e8res \u00b7 5 niveaux de raret\u00e9' : '16 characters \u00b7 5 rarity levels'}
            </Text>
          </Animated.View>
        )}

        {ci === 0 && !allSwiped ? (
          <View pointerEvents="none" style={{ position: 'absolute', bottom: 10, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)',
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
            flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="chevron-back" size={12} color="#D4AF37" />
            <Text style={{ color: '#D4AF37', fontSize: 10, fontWeight: '600' }}>{lang === 'fr' ? 'Glissez' : 'Swipe'}</Text>
            <Ionicons name="chevron-forward" size={12} color="#D4AF37" />
          </View>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
        {characters.map(function(_, i) {
          return (
            <View key={i} style={{ width: i === ci ? 20 : 6, height: 6, borderRadius: 3,
              backgroundColor: i === ci ? '#D4AF37' : i < ci ? '#8B7516' : 'rgba(62,72,85,0.3)' }} />
          );
        })}
      </View>

    </View>
  );
}

export default Phase6Characters;
