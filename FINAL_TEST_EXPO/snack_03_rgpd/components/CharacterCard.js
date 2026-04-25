import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TIER_CONFIG, CHARACTER_EMOJIS, getCharacterImageUrl } from '../lixverseConstants';
import { wp, fp } from '../utils/layout';
import { hapticLight } from '../utils/haptics';

export default function CharacterCard(props) {
  var ch = props.character;
  var onPress = props.onPress;
  var _imageFailed = React.useState(false);
  var imageFailed = _imageFailed[0];
  var setImageFailed = _imageFailed[1];

  var config = TIER_CONFIG[ch.tier] || TIER_CONFIG.standard;
  var imageUrl = getCharacterImageUrl(ch.image_url);
  var emoji = CHARACTER_EMOJIS[ch.slug] || '✨';
  var canShowImage = imageUrl && !imageFailed;
  var owned = ch.owned === true;
  var isActive = ch.is_active === true;

  function handlePress() {
    hapticLight();
    if (onPress) onPress(ch);
  }

  function handleImageError() {
    setImageFailed(true);
  }

  function getNextThreshold() {
    var lvl = ch.level || 0;
    if (lvl === 0) return ch.frags_niv1 || 10;
    if (lvl === 1) return ch.frags_niv2 || 20;
    if (lvl >= 2) return ch.frags_max || 30;
    return 10;
  }

  var fragsCurrent = ch.fragments || 0;
  var fragsThreshold = getNextThreshold();
  var fragsPercent = Math.min(100, (fragsCurrent / fragsThreshold) * 100);
  var levelLabel = ch.level >= 2 ? 'MAX' : 'Niv ' + ((ch.level || 0) + 1);

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: '47%',
        margin: '1.5%',
        borderRadius: wp(12),
        overflow: 'hidden',
        borderWidth: isActive ? 2.5 : 1,
        borderColor: isActive ? '#00D984' : (owned ? config.primary : '#3A3F46'),
        position: 'relative'
      }}
    >
      {/* === ENFANT PLACEHOLDER pour forcer la hauteur via aspectRatio === */}
      {/* Yoga RN a besoin d'un enfant dans le flow normal pour calculer la hauteur quand tous les autres sont absolute */}
      <View style={{ width: '100%', aspectRatio: 0.75 }} />

      {/* === IMAGE PLEINEMENT VISIBLE (pas d'overlay sombre) === */}
      {canShowImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        <LinearGradient
          colors={config.gradient}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: fp(80) }}>{emoji}</Text>
        </LinearGradient>
      )}

      {/* === BADGE NIVEAU top-left (uniquement si owned) === */}
      {owned ? (
        <View style={{
          position: 'absolute',
          top: wp(8),
          left: wp(8),
          paddingHorizontal: wp(8),
          paddingVertical: wp(3),
          backgroundColor: 'rgba(15, 18, 21, 0.85)',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: config.primary
        }}>
          <Text style={{
            color: config.primary,
            fontSize: fp(9),
            fontWeight: 'bold',
            letterSpacing: 0.5
          }}>
            {levelLabel}
          </Text>
        </View>
      ) : null}

      {/* === BADGE ACTIF top-right (outline emerald cohérent) === */}
      {isActive ? (
        <View style={{
          position: 'absolute',
          top: wp(8),
          right: wp(8),
          paddingHorizontal: wp(8),
          paddingVertical: wp(3),
          backgroundColor: 'rgba(0, 217, 132, 0.15)',
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: '#00D984'
        }}>
          <Text style={{
            color: '#00D984',
            fontSize: fp(9),
            fontWeight: 'bold',
            letterSpacing: 0.8
          }}>
            ACTIF
          </Text>
        </View>
      ) : null}

      {/* === BADGE "À DÉBLOQUER" top-right (uniquement si !owned) === */}
      {!owned && !isActive ? (
        <View style={{
          position: 'absolute',
          top: wp(8),
          right: wp(8),
          paddingHorizontal: wp(8),
          paddingVertical: wp(3),
          backgroundColor: 'rgba(15, 18, 21, 0.85)',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: '#9A9EA3'
        }}>
          <Text style={{
            color: '#E5E7EB',
            fontSize: fp(9),
            fontWeight: 'bold',
            letterSpacing: 0.8
          }}>
            À DÉBLOQUER
          </Text>
        </View>
      ) : null}

      {/* === PLAQUE DÉGRADÉ SEMI-TRANSPARENTE BAS === */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: wp(10),
          paddingTop: wp(40),
          paddingBottom: wp(10)
        }}
      >
        <Text style={{
          color: '#FFFFFF',
          fontSize: fp(13),
          fontWeight: 'bold'
        }} numberOfLines={1}>
          {ch.name}
        </Text>

        {/* Barre progress fragments */}
        <View style={{
          height: 3,
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          marginTop: 6,
          overflow: 'hidden'
        }}>
          <View style={{
            width: fragsPercent + '%',
            height: '100%',
            backgroundColor: config.primary
          }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ color: '#E5E7EB', fontSize: fp(10) }}>
            {fragsCurrent}/{fragsThreshold} frags
          </Text>
          <Text style={{ color: '#9A9EA3', fontSize: fp(10) }}>
            {ch.uses_remaining || 0}/{ch.max_uses_per_cycle || 3} uses
          </Text>
        </View>
      </LinearGradient>

    </Pressable>
  );
}
