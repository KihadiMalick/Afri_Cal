import React from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TIER_CONFIG, CHARACTER_EMOJIS, getCharacterImageUrl } from '../lixverseConstants';
import { t } from '../mockT';

export default function ActiveCharacterBanner(props) {
  var ch = props.character;
  var breathAnim = props.breathAnim;
  var _imageFailed = React.useState(false);
  var imageFailed = _imageFailed[0];
  var setImageFailed = _imageFailed[1];

  // === BREATH avatar 64x64 (subtil A1) ===
  var avatarScaleInterpolated = breathAnim ? breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) : 1;

  function handleImageError() {
    setImageFailed(true);
  }

  if (!ch) {
    return (
      <LinearGradient
        colors={['#1A1D22', '#0F1215']}
        style={{
          marginHorizontal: 16,
          marginTop: 4,
          marginBottom: 20,
          padding: 22,
          borderRadius: 18,
          borderWidth: 1.5,
          borderColor: '#3A3F46',
          alignItems: 'center'
        }}
      >
        <View style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: 'rgba(0,217,132,0.08)',
          borderWidth: 1.5,
          borderColor: 'rgba(0,217,132,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <Text style={{ fontSize: 28 }}>✨</Text>
        </View>
        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', marginBottom: 4 }}>
          {t('no_active_character')}
        </Text>
        <Text style={{ color: '#9A9EA3', fontSize: 12, textAlign: 'center', marginBottom: 14 }}>
          Choisis un caractère ci-dessous pour activer ses pouvoirs
        </Text>
        <View style={{ paddingHorizontal: 22, paddingVertical: 10, borderRadius: 22, borderWidth: 1.5, borderColor: '#00D984' }}>
          <Text style={{ color: '#00D984', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 }}>
            {t('choose_character')}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  var config = TIER_CONFIG[ch.tier] || TIER_CONFIG.standard;
  var imageUrl = getCharacterImageUrl(ch.image_url);
  var emoji = CHARACTER_EMOJIS[ch.slug] || '✨';
  var canShowImage = imageUrl && !imageFailed;

  return (
    <LinearGradient
      colors={['#252A30', '#1A1D22']}
      style={{
        marginHorizontal: 16,
        marginTop: 4,
        marginBottom: 20,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#00D984',
        shadowColor: '#00D984',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View style={{
          width: 64,
          height: 64,
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 1.5,
          borderColor: config.primary,
          transform: [{ scale: avatarScaleInterpolated }]
        }}>
          {canShowImage ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={handleImageError}
            />
          ) : (
            <LinearGradient
              colors={config.gradient}
              style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 36 }}>{emoji}</Text>
            </LinearGradient>
          )}
        </Animated.View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ color: '#00D984', fontSize: 10, fontWeight: 'bold', letterSpacing: 1.5 }}>
            CARACTÈRE ACTIF
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', marginTop: 2 }} numberOfLines={1}>
            {ch.name}
          </Text>
          <Text style={{ color: '#9A9EA3', fontSize: 11, marginTop: 2 }} numberOfLines={1}>
            {ch.specialty_fr || ''}
          </Text>
          <Text style={{ color: '#E5E7EB', fontSize: 11, marginTop: 4 }}>
            {ch.uses_remaining || 0}/{ch.max_uses_per_cycle || 3} uses · Recharge {ch.recharge_energy || 5}é
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
