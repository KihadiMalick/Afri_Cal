import React from 'react';
import { View, Text, Image, ScrollView, Pressable, Modal, Animated, Dimensions, ActivityIndicator, Easing, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler';
import { TIER_CONFIG, CHARACTER_EMOJIS, CHARACTER_LORE, getCharacterImageUrl, SUPABASE_URL, POST_HEADERS } from '../lixverseConstants';
import { useAuth } from '../MockAuthContext';
import { hapticLight, hapticMedium } from '../utils/haptics';
import { wp, fp } from '../utils/layout';
import { t } from '../mockT';
import GoldenParticles from './GoldenParticles';

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

  // === DRAG-TO-DISMISS Phase 2.7 ===
  var dragY = React.useRef(new Animated.Value(0)).current;
  var _isDragging = React.useState(false);
  var isDragging = _isDragging[0];
  var setIsDragging = _isDragging[1];

  // Constantes drag (B2 + B4 décisions Malick)
  var DRAG_DISMISS_THRESHOLD = SCREEN_HEIGHT * 0.40 * 0.92; // 40% du modal qui fait 92% écran
  var DRAG_VELOCITY_THRESHOLD = 500; // px/s — swipe rapide ferme

  var ch = props.character;

  // === PHASE 3 ANIMS partagées (pas de tilt — conflit drag/flip) ===
  var breathAnim = props.breathAnim;
  var floatAnim = props.floatAnim;
  var auraAnim = props.auraAnim;
  var particleAnim1 = props.particleAnim1;
  var particleAnim2 = props.particleAnim2;

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
    Animated.timing(flipAnim, {
      toValue: flipped ? 0 : 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start(function() {
      setFlipped(!flipped);
    });
  }

  function close() {
    hapticLight();
    props.onClose();
  }

  function handleImageError() {
    setImageFailed(true);
  }

  function handleActivate() {
    hapticMedium();
    console.log('[Phase 5] handleActivate appelé pour', ch && ch.slug);
  }

  function getFragsMax() {
    if (!ch) return 10;
    var lvl = ch.level || 0;
    if (lvl === 0) return ch.frags_niv1 || 10;
    if (lvl === 1) return ch.frags_niv2 || 20;
    if (lvl >= 2) return ch.frags_max || 30;
    return 10;
  }

  function renderDecoratedHeader(label) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#D4AF37', maxWidth: 40, marginRight: 12 }} />
        <Text style={{ color: '#FFFFFF', fontSize: fp(20), fontWeight: 'bold', letterSpacing: 2 }}>
          {label}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#D4AF37', maxWidth: 40, marginLeft: 12 }} />
      </View>
    );
  }

  // === HANDLERS DRAG-TO-DISMISS (Phase 2.7) ===
  var onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: false }
  );

  function onHandlerStateChange(event) {
    var nativeEvent = event.nativeEvent;

    if (nativeEvent.state === GestureState.BEGAN) {
      setIsDragging(true);
      return;
    }

    if (nativeEvent.state === GestureState.END || nativeEvent.state === GestureState.CANCELLED) {
      setIsDragging(false);

      var translationY = nativeEvent.translationY;
      var velocityY = nativeEvent.velocityY;
      var shouldDismiss = false;

      // B2 : seuil distance
      if (translationY > DRAG_DISMISS_THRESHOLD) {
        shouldDismiss = true;
      }

      // B4 : seuil velocity (swipe rapide vers le bas)
      // Protection : 50px minimum pour éviter fermeture sur tap rapide
      if (velocityY > DRAG_VELOCITY_THRESHOLD && translationY > 50) {
        shouldDismiss = true;
      }

      // Empêcher fermeture si drag vers le haut (sécurité)
      if (translationY < 0) {
        shouldDismiss = false;
      }

      if (shouldDismiss) {
        Animated.timing(dragY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false
        }).start(function() {
          dragY.setValue(0);
          close();
        });
      } else {
        // C2 : retour position 200ms timing easing cubic
        Animated.timing(dragY, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false
        }).start();
      }
    }
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

  // === INTERPOLATIONS Phase 3 (image card uniquement, pas de tilt) ===
  var auraIntensityByTier = {
    standard: 0.10,
    rare: 0.15,
    elite: 0.20,
    mythic: 0.25,
    ultimate: 0.35
  };
  var auraMaxOpacity = owned ? (auraIntensityByTier[ch.tier] || 0.10) : 0;

  var modalScaleInterpolated = breathAnim ? breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) : 1;
  var modalTranslateYInterpolated = floatAnim ? floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) : 0;
  var modalAuraOpacityInterpolated = auraAnim ? auraAnim.interpolate({ inputRange: [0, 1], outputRange: [0, auraMaxOpacity] }) : 0;

  function renderStatsGrid() {
    if (!owned) return null;

    function renderStatCard(label, value) {
      return (
        <View style={{
          flex: 1,
          marginHorizontal: 4,
          paddingVertical: 12,
          paddingHorizontal: 8,
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.06)',
          alignItems: 'center'
        }}>
          <Text style={{ color: '#6B6F75', fontSize: fp(9), fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 }}>
            {label}
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: fp(18), fontWeight: 'bold' }}>
            {value}
          </Text>
        </View>
      );
    }

    var fragsCurrent = ch.fragments || 0;
    var fragsMax = getFragsMax();
    var bonusValue = ch.efficiency_bonus ? '×' + (1 + ch.efficiency_bonus).toFixed(1) : '×1.0';

    return (
      <View style={{ flexDirection: 'row', marginTop: 18, marginHorizontal: 12 }}>
        {renderStatCard('NIV', ch.level || 1)}
        {renderStatCard('FRAGS', fragsCurrent + '/' + fragsMax)}
        {renderStatCard('USES', (ch.uses_remaining || 0) + '/' + (ch.max_uses_per_cycle || 3))}
        {renderStatCard('BONUS', bonusValue)}
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
    return (
      <View style={{ marginTop: 18, marginHorizontal: 16 }}>

        {/* Bouton "Voir les détails →" — outline emerald (référence) */}
        <Pressable
          onPress={flipCard}
          style={{
            paddingVertical: 14,
            backgroundColor: 'rgba(0, 217, 132, 0.08)',
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#00D984',
            marginBottom: 10
          }}
        >
          <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: 'bold' }}>
            Voir les détails →
          </Text>
        </Pressable>

        {/* Caractère actif : badge outline emerald (cohérence) */}
        {owned && isActive ? (
          <View style={{
            paddingVertical: 14,
            backgroundColor: 'rgba(0, 217, 132, 0.08)',
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#00D984'
          }}>
            <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: 'bold' }}>
              ✓ Caractère actuellement actif
            </Text>
          </View>
        ) : null}

        {/* Caractère possédé non actif : "Activer ce caractère" outline emerald */}
        {owned && !isActive ? (
          <Pressable
            onPress={handleActivate}
            style={{
              paddingVertical: 14,
              backgroundColor: 'rgba(0, 217, 132, 0.08)',
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#00D984'
            }}
          >
            <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: 'bold' }}>
              Activer ce caractère (Phase 5)
            </Text>
          </Pressable>
        ) : null}

        {/* Caractère locked : CTA "Obtenir via Défis ou Map" — outline gold */}
        {!owned ? (
          <View style={{
            paddingVertical: 14,
            backgroundColor: 'rgba(212, 175, 55, 0.08)',
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#D4AF37'
          }}>
            <Text style={{ color: '#D4AF37', fontSize: fp(13), fontWeight: '600' }}>
              Obtenir via Défis ou Map LIX-QUEST
            </Text>
          </View>
        ) : null}

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

          {/* === IMAGE CARTE — sans cadre, sans nom, sans tier badge === */}
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <Animated.View style={{
              width: wp(290),
              height: wp(385),
              borderRadius: wp(8),
              overflow: 'hidden',
              backgroundColor: '#000',
              shadowColor: '#D4AF37',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 14,
              transform: [
                { scale: modalScaleInterpolated },
                { translateY: modalTranslateYInterpolated }
              ]
            }}>
              {canShowImage ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  onError={handleImageError}
                />
              ) : (
                <LinearGradient colors={config.gradient} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(110) }}>{emoji}</Text>
                </LinearGradient>
              )}

              {/* === AURA PULSE overlay (uniquement si owned) === */}
              {owned ? (
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: config.primary,
                    opacity: modalAuraOpacityInterpolated
                  }}
                />
              ) : null}

              {/* === PARTICULES DORÉES (mythic + ultimate owned uniquement) === */}
              {owned && (ch.tier === 'mythic' || ch.tier === 'ultimate') ? (
                <GoldenParticles particleAnim1={particleAnim1} particleAnim2={particleAnim2} />
              ) : null}

              {/* Badge "À DÉBLOQUER" si non possédé — remplace l'overlay sombre + 🔒 */}
              {!owned ? (
                <View style={{
                  position: 'absolute',
                  top: wp(12),
                  right: wp(12),
                  paddingHorizontal: wp(10),
                  paddingVertical: wp(4),
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: '#9A9EA3',
                  backgroundColor: 'rgba(15, 18, 21, 0.85)'
                }}>
                  <Text style={{
                    color: '#E5E7EB',
                    fontSize: fp(10),
                    fontWeight: 'bold',
                    letterSpacing: 1.2
                  }}>
                    À DÉBLOQUER
                  </Text>
                </View>
              ) : null}
            </Animated.View>
          </View>

          {/* === STATS GRID === */}
          {renderStatsGrid()}

          {/* === UNLOCK PROGRESS si !owned === */}
          {!owned ? renderUnlockProgress() : null}

          {/* === BOUTONS D'ACTION === */}
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
    var lore = CHARACTER_LORE[ch.slug] || null;

    return (
      <Animated.View
        pointerEvents={flipped ? 'auto' : 'none'}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: backOpacity }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

          {/* === SECTION DESCRIPTION === */}
          {renderDecoratedHeader('DESCRIPTION')}
          <Text style={{ color: config.primary, fontSize: fp(11), marginTop: 4, textAlign: 'center' }}>
            {ch.name}
          </Text>

          {lore ? (
            <View style={{ marginTop: 18, marginHorizontal: 16 }}>
              {/* Tagline plus discrète — introduction */}
              <Text style={{
                color: '#9A9EA3',
                fontSize: fp(12),
                lineHeight: fp(18),
                fontStyle: 'italic',
                textAlign: 'center'
              }}>
                {lore.tagline}
              </Text>

              {/* Pouvoir ancestral plus impactant — cœur du message */}
              <Text style={{
                color: '#FFFFFF',
                fontSize: fp(14),
                lineHeight: fp(22),
                marginTop: 14,
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {lore.power}
              </Text>

              {/* Localisation */}
              <View style={{ marginTop: 18, padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(14), marginRight: 8 }}>📍</Text>
                  <Text style={{ color: '#E5E7EB', fontSize: fp(12), flex: 1 }}>
                    {lore.location}
                  </Text>
                </View>
                {lore.time_window ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ fontSize: fp(14), marginRight: 8 }}>⏰</Text>
                    <Text style={{ color: config.primary, fontSize: fp(12), fontWeight: '600', flex: 1 }}>
                      {lore.time_window}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* === SÉPARATEUR === */}
          <View style={{ marginVertical: 20, marginHorizontal: 32, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* === SECTION POUVOIRS === */}
          {renderDecoratedHeader('POUVOIRS')}
          <Text style={{ color: config.primary, fontSize: fp(11), marginTop: 4, textAlign: 'center' }}>
            {ch.name}
          </Text>

          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            {powers.length === 0 ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <ActivityIndicator color={config.primary} />
              </View>
            ) : (
              powers.map(function(power, idx) { return renderPowerRow(power, idx); })
            )}
          </View>

          {/* === BOUTON RETOUR === */}
          <View style={{ marginHorizontal: 16, marginTop: 18 }}>
            <Pressable
              onPress={flipCard}
              style={{ paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3A3F46' }}
            >
              <Text style={{ color: '#9A9EA3', fontSize: fp(14), fontWeight: 'bold' }}>
                ← Retour
              </Text>
            </Pressable>
          </View>

        </ScrollView>
      </Animated.View>
    );
  }

  var gradientStart = config.secondary || 'rgba(60,60,60,0.3)';

  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
        <Animated.View style={{
          height: SCREEN_HEIGHT * 0.92,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 2,
          borderTopColor: isActive ? '#00D984' : config.primary,
          overflow: 'hidden',
          transform: [{
            translateY: dragY.interpolate({
              inputRange: [-100, 0, SCREEN_HEIGHT],
              outputRange: [0, 0, SCREEN_HEIGHT],
              extrapolate: 'clamp'
            })
          }]
        }}>
          <LinearGradient
            colors={['#0F1215', '#1A1D22', '#252A30']}
            locations={[0, 0.5, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              flex: 1,
              paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 12,
              paddingBottom: 34
            }}
          >
            {/* === ZONE DRAG (grabber + zone tappable élargie) === */}
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              activeOffsetY={[-10, 10]}
              failOffsetX={[-20, 20]}
            >
              <Animated.View style={{ paddingTop: 8, paddingBottom: 12, alignItems: 'center' }}>
                <View style={{
                  width: 40,
                  height: 4,
                  backgroundColor: isDragging ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                  borderRadius: 2
                }} />
              </Animated.View>
            </PanGestureHandler>

            {/* Container relatif pour les 2 vues empilées en absolute */}
            <View style={{ flex: 1, position: 'relative' }}>
              {renderFrontView()}
              {renderBackView()}
            </View>

            {/* Bouton Fermer (safe area respectée) */}
            <Pressable onPress={close} style={{ paddingVertical: 12, alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ color: '#9A9EA3', fontSize: fp(14) }}>{t('close')}</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}
