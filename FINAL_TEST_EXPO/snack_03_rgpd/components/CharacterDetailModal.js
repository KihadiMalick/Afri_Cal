import React from 'react';
import { View, Text, Image, ScrollView, Pressable, Modal, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TIER_CONFIG, CHARACTER_EMOJIS, getCharacterImageUrl, SUPABASE_URL, POST_HEADERS } from '../lixverseConstants';
import { useAuth } from '../MockAuthContext';
import { hapticLight, hapticMedium } from '../utils/haptics';
import { t } from '../mockT';

var SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CharacterDetailModal(props) {
  var auth = useAuth();
  var _flipped = React.useState(false);
  var flipped = _flipped[0];
  var setFlipped = _flipped[1];

  var _powers = React.useState([]);
  var powers = _powers[0];
  var setPowers = _powers[1];

  var _imageFailed = React.useState(false);
  var imageFailed = _imageFailed[0];
  var setImageFailed = _imageFailed[1];

  var flipAnim = React.useRef(new Animated.Value(0)).current;

  var ch = props.character;

  React.useEffect(function() {
    if (ch && ch.owned) {
      fetchPowers();
    } else {
      setPowers([]);
    }
    setFlipped(false);
    flipAnim.setValue(0);
    setImageFailed(false);
  }, [ch ? ch.slug : null]);

  async function fetchPowers() {
    try {
      var res = await fetch(SUPABASE_URL + '/rest/v1/rpc/get_character_powers', {
        method: 'POST',
        headers: POST_HEADERS,
        body: JSON.stringify({ p_user_id: auth.userId, p_slug: ch.slug })
      });
      var data = await res.json();
      setPowers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[Modal] fetchPowers error:', e);
    }
  }

  function flipCard() {
    hapticMedium();
    var toValue = flipped ? 0 : 1;
    Animated.timing(flipAnim, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: false
    }).start();
    setFlipped(!flipped);
  }

  function close() {
    hapticLight();
    props.onClose();
  }

  function handleImageError() {
    setImageFailed(true);
  }

  if (!ch) return null;

  var config = TIER_CONFIG[ch.tier] || TIER_CONFIG.standard;
  var imageUrl = getCharacterImageUrl(ch.image_url);
  var emoji = CHARACTER_EMOJIS[ch.slug] || '✨';
  var canShowImage = imageUrl && !imageFailed;
  var owned = ch.owned === true;
  var isActive = ch.is_active === true;

  var frontOpacity = flipAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  var backOpacity = flipAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  function renderStatsGrid() {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 18, paddingVertical: 14, paddingHorizontal: 12, marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#9A9EA3', fontSize: 10, letterSpacing: 1 }}>{t('level')}</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>
            {ch.level === 3 ? t('max') : ch.level}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#9A9EA3', fontSize: 10, letterSpacing: 1 }}>FRAGS</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>
            {ch.fragments || 0}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#9A9EA3', fontSize: 10, letterSpacing: 1 }}>USES</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>
            {ch.uses_remaining || 0}/{ch.max_uses_per_cycle || 3}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#9A9EA3', fontSize: 10, letterSpacing: 1 }}>{t('bonus')}</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 2 }}>
            ×{ch.efficiency_bonus || 1}
          </Text>
        </View>
      </View>
    );
  }

  function renderUnlockProgress() {
    var threshold = ch.frags_niv1 || 1;
    var progress = Math.min(100, ((ch.fragments || 0) / threshold) * 100);
    return (
      <View style={{ marginHorizontal: 16, marginTop: 18, padding: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: '#9A9EA3', fontSize: 12 }}>Vers déblocage</Text>
          <Text style={{ color: config.primary, fontSize: 12, fontWeight: 'bold' }}>
            {ch.fragments || 0} / {threshold} frags
          </Text>
        </View>
        <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <View style={{ width: progress + '%', height: '100%', backgroundColor: config.primary }} />
        </View>
      </View>
    );
  }

  function renderActionButtons() {
    if (!owned) {
      return (
        <View style={{ marginHorizontal: 16, marginTop: 14, padding: 12, backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', alignItems: 'center' }}>
          <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600' }}>
            Obtenir via Défis
          </Text>
        </View>
      );
    }

    return (
      <View style={{ marginHorizontal: 16, marginTop: 18 }}>
        <Pressable
          onPress={flipCard}
          style={{ paddingVertical: 14, backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#00D984', marginBottom: 10 }}
        >
          <Text style={{ color: '#00D984', fontSize: 14, fontWeight: 'bold' }}>
            Voir les pouvoirs →
          </Text>
        </Pressable>

        {isActive ? (
          <View style={{ paddingVertical: 14, backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#00D984' }}>
            <Text style={{ color: '#00D984', fontSize: 14, fontWeight: 'bold' }}>
              ✓ Caractère actuellement actif
            </Text>
          </View>
        ) : (
          <View style={{ paddingVertical: 14, backgroundColor: '#3A3F46', borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: '#9A9EA3', fontSize: 14, fontWeight: 'bold' }}>
              {t('activate')} (Phase 5)
            </Text>
          </View>
        )}
      </View>
    );
  }

  function renderFrontView() {
    return (
      <Animated.View
        pointerEvents={flipped ? 'none' : 'auto'}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: frontOpacity }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <View style={{ width: 220, height: 290, borderRadius: 14, overflow: 'hidden', borderWidth: 2, borderColor: config.primary }}>
              {canShowImage ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={handleImageError}
                />
              ) : (
                <LinearGradient colors={config.gradient} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 110, opacity: owned ? 1 : 0.4 }}>{emoji}</Text>
                </LinearGradient>
              )}
              {!owned ? (
                <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 48 }}>🔒</Text>
                </View>
              ) : null}
            </View>
            <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 5, backgroundColor: config.secondary, borderRadius: 8 }}>
              <Text style={{ color: config.primary, fontSize: 11, fontWeight: 'bold', letterSpacing: 2 }}>
                {config.label}
              </Text>
            </View>
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 16 }}>
            {owned ? ch.name : '???'}
          </Text>

          {owned ? (
            <Text style={{ color: config.primary, fontSize: 12, textAlign: 'center', marginTop: 4, fontWeight: '600' }}>
              {ch.specialty_fr || ''}
            </Text>
          ) : null}

          {owned && ch.description_fr ? (
            <Text style={{ color: '#E5E7EB', fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20, paddingHorizontal: 16 }}>
              {ch.description_fr}
            </Text>
          ) : null}

          {owned ? renderStatsGrid() : renderUnlockProgress()}

          {renderActionButtons()}
        </ScrollView>
      </Animated.View>
    );
  }

  function renderPowerRow(power, idx) {
    var unlocked = (ch.level || 0) >= (power.level_required || 1);
    var canUse = unlocked && isActive && (ch.uses_remaining || 0) > 0;

    return (
      <View
        key={power.power_key || idx}
        style={{ marginBottom: 12, padding: 14, backgroundColor: unlocked ? 'rgba(0,217,132,0.06)' : 'rgba(255,255,255,0.03)', borderRadius: 10, borderWidth: 1, borderColor: unlocked ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.05)' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ color: '#9A9EA3', fontSize: 9, letterSpacing: 1, marginRight: 6 }}>
            NIV {power.level_required || 1}
          </Text>
          {power.is_superpower ? <Text style={{ fontSize: 11, marginRight: 4 }}>⭐</Text> : null}
          <Text style={{ color: unlocked ? '#FFFFFF' : '#6B6F75', fontSize: 13, fontWeight: 'bold', flex: 1 }} numberOfLines={1}>
            {power.name_fr || power.power_key}
          </Text>
          {!unlocked ? <Text style={{ fontSize: 11 }}>🔒</Text> : null}
        </View>
        <Text style={{ color: unlocked ? '#E5E7EB' : '#6B6F75', fontSize: 11, lineHeight: 16 }}>
          {power.description_fr || ''}
        </Text>
        {canUse ? (
          <View style={{ marginTop: 10, paddingVertical: 8, backgroundColor: '#00D984', borderRadius: 6, alignItems: 'center' }}>
            <Text style={{ color: '#1A1D22', fontSize: 12, fontWeight: 'bold' }}>
              {t('activate_power')} (Phase 5)
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  function renderBackView() {
    return (
      <Animated.View
        pointerEvents={flipped ? 'auto' : 'none'}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: backOpacity }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>
              {t('powers')}
            </Text>
            <Text style={{ color: config.primary, fontSize: 12, marginTop: 4 }}>
              {ch.name}
            </Text>
          </View>

          <View style={{ marginTop: 18, paddingHorizontal: 16 }}>
            {powers.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <ActivityIndicator color={config.primary} />
              </View>
            ) : (
              powers.map(function(power, idx) { return renderPowerRow(power, idx); })
            )}
          </View>

          <View style={{ marginHorizontal: 16, marginTop: 18 }}>
            <Pressable
              onPress={flipCard}
              style={{ paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3A3F46' }}
            >
              <Text style={{ color: '#9A9EA3', fontSize: 14, fontWeight: 'bold' }}>
                ← Retour
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: '#1A1D22',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: SCREEN_HEIGHT * 0.95,
          borderTopWidth: 2,
          borderTopColor: isActive ? '#00D984' : config.primary,
          overflow: 'hidden'
        }}>
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#3A3F46', borderRadius: 2 }} />
          </View>

          <View style={{ flex: 1, position: 'relative' }}>
            {renderFrontView()}
            {renderBackView()}
          </View>

          <Pressable
            onPress={close}
            style={{ paddingVertical: 14, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#2A2F36' }}
          >
            <Text style={{ color: '#9A9EA3', fontSize: 14 }}>{t('close')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
