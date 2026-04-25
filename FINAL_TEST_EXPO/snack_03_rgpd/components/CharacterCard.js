import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TIER_CONFIG, CHARACTER_EMOJIS, getCharacterImageUrl } from '../lixverseConstants';

export default function CharacterCard(props) {
  var ch = props.character;
  var _imageFailed = React.useState(false);
  var imageFailed = _imageFailed[0];
  var setImageFailed = _imageFailed[1];

  var config = TIER_CONFIG[ch.tier] || TIER_CONFIG.standard;
  var owned = ch.owned === true;
  var isActive = ch.is_active === true;
  var imageUrl = getCharacterImageUrl(ch.image_url);
  var emoji = CHARACTER_EMOJIS[ch.slug] || '✨';
  var canShowImage = owned && imageUrl && !imageFailed;

  function getLevelLabel() {
    if (!owned) return null;
    if (ch.level === 1) return 'Niv 1';
    if (ch.level === 2) return 'Niv 2';
    if (ch.level === 3) return 'MAX';
    return null;
  }

  function getNextThreshold() {
    if (!owned) return ch.frags_niv1 || 0;
    if (ch.level === 1) return ch.frags_niv2 || 0;
    if (ch.level === 2) return ch.frags_max || 0;
    return ch.frags_max || 0;
  }

  function getProgressPercent() {
    var current = ch.fragments || 0;
    var threshold = getNextThreshold();
    if (threshold === 0) return 0;
    var pct = (current / threshold) * 100;
    if (pct > 100) pct = 100;
    return pct;
  }

  function handlePress() {
    props.onPress(ch);
  }

  function handleImageError() {
    setImageFailed(true);
  }

  var levelLabel = getLevelLabel();

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: '47%',
        margin: '1.5%',
        aspectRatio: 0.75,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: isActive ? 2.5 : (owned ? 1.5 : 1),
        borderColor: isActive ? '#00D984' : (owned ? config.primary : '#3A3F46'),
        backgroundColor: '#0F1215'
      }}
    >
      {canShowImage ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          resizeMode="cover"
          onError={handleImageError}
        />
      ) : (
        <LinearGradient
          colors={config.gradient}
          style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 80, opacity: owned ? 1 : 0.4 }}>{emoji}</Text>
        </LinearGradient>
      )}

      {!owned ? (
        <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.65)' }} />
      ) : null}

      {isActive ? (
        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#00D984', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
          <Text style={{ color: '#1A1D22', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 }}>
            ACTIF
          </Text>
        </View>
      ) : null}

      {(owned && levelLabel) ? (
        <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: config.primary }}>
          <Text style={{ color: config.primary, fontSize: 9, fontWeight: 'bold' }}>
            {levelLabel}
          </Text>
        </View>
      ) : null}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.95)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, paddingTop: 24 }}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 }} numberOfLines={1}>
          {owned ? ch.name : '???'}
        </Text>

        {(!owned || ch.level < 3) ? (
          <View style={{ marginTop: 4 }}>
            <View style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <View style={{ width: getProgressPercent() + '%', height: '100%', backgroundColor: config.primary }} />
            </View>
            <Text style={{ color: config.primary, fontSize: 9, marginTop: 2 }}>
              {ch.fragments || 0} / {getNextThreshold()} frags
            </Text>
          </View>
        ) : null}

        {owned ? (
          <Text style={{ color: '#9A9EA3', fontSize: 9, marginTop: 2 }}>
            {ch.uses_remaining || 0}/{ch.max_uses_per_cycle || 3} uses
          </Text>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}
