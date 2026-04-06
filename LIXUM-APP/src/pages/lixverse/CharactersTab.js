import React from 'react';
import { View, Text, ScrollView, Pressable, Animated,
  Image, Modal, ActivityIndicator, Easing, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ALL_CHARACTERS, TIER_CONFIG, CHAR_NAMES, FRAGS_NIV1,
  CHARACTER_IMAGES, SUPABASE_URL,
  HEADERS, POST_HEADERS, getCharImage
} from './lixverseConstants';
import { LixGem } from './lixverseComponents';
import { useAuth } from '../../config/AuthContext';
import { wp, fp } from '../../constants/layout';

const SCREEN_WIDTH = Dimensions.get('window').width;
const W = SCREEN_WIDTH;
const cardW = (SCREEN_WIDTH - wp(48)) / 3;

export default function CharactersTab({
  userCollection,
  ownedCharacters,
  activeCharSlug,
  selectedChar,
  setSelectedChar,
  charFlipped,
  setCharFlipped,
  cardViewIndex,
  setCardViewIndex,
  cardViewIndexRef,
  charPowers,
  loadingPowers,
  onboardingSelected,
  inlinePowerModal,
  setInlinePowerModal,
  inlinePowerData,
  inlinePowerLoading,
  flipAnim,
  cardSlideAnim,
  showLixAlert,
  onSwitchActiveCharacter,
  onLoadCharPowers,
  onNavigateCard,
  onFlipCard,
  onRechargeChar,
  onShouldConsumePower,
  onConsumePower,
  onGoToSpin,
  onNavigateTo,
}) {
  var auth = useAuth(); var userId = auth.userId;
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1], outputRange: [1, 0]
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 1]
  });

  const activeChar = userCollection.find(c => c.slug === activeCharSlug && c.owned !== false);
  const getLevelBadge = (c) => {
    const lv = c.level || 0;
    if (lv >= 6) return { text: 'MAX', color: '#FF4757' };
    if (lv >= 3) return { text: 'Niv' + lv, color: '#D4AF37' };
    return { text: 'Niv' + lv, color: '#00D984' };
  };

  const closeCharModal = () => {
    setSelectedChar(null);
    setCharFlipped(false);
    flipAnim.setValue(0);
    setInlinePowerModal(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: 90 }}>
        {activeChar ? (
          <LinearGradient colors={['#3A3F46','#252A30','#333A42','#1A1D22']} style={{ borderRadius: wp(16), padding: wp(14), marginBottom: wp(16), borderWidth: 1, borderColor: '#4A4F55', shadowColor: '#00D984', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: wp(60), height: wp(60), borderRadius: wp(30), backgroundColor: 'rgba(0,217,132,0.12)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00D984', marginRight: wp(12) }}>
                {(() => {
                  const charImg = getCharImage(activeChar.slug || activeChar.id);
                  if (charImg.img) {
                    return <Image source={charImg.img} style={{ width: wp(54), height: wp(54), borderRadius: wp(27) }} resizeMode="cover" />;
                  }
                  return <Text style={{ fontSize: fp(28) }}>{charImg.emoji}</Text>;
                })()}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: wp(4) }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{activeChar.name || activeChar.slug}</Text>
                  <Text style={{ fontSize: fp(10), color: '#00D984', fontWeight: '700' }}>ACTIF ✅</Text>
                </View>
                <View style={{ height: wp(5), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(2.5), overflow: 'hidden', marginBottom: wp(4) }}>
                  <View style={{ height: '100%', borderRadius: wp(2.5), backgroundColor: '#00D984', width: Math.min(100, Math.round(((activeChar.xp || 0) / (activeChar.xp_next || 1000)) * 100)) + '%' }} />
                </View>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.4)' }}>{activeChar.xp || 0}/{activeChar.xp_next || 1000} XP</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4), marginTop: wp(2) }}>
                  <View style={{ height: wp(3), flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(1.5), overflow: 'hidden' }}>
                    <View style={{ height: '100%', borderRadius: wp(1.5), backgroundColor: '#FF8C42', width: Math.min(100, Math.round(((activeChar.uses_remaining || 0) / (activeChar.uses_max || 10)) * 100)) + '%' }} />
                  </View>
                  <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.35)' }}>{activeChar.uses_remaining || 0}/{activeChar.uses_max || 10} utilisations</Text>
                </View>
              </View>
              <Pressable delayPressIn={120} onPress={() => {
                if ((activeChar.level || 0) < 1) {
                  showLixAlert('🧩 Carte incomplète', 'Ce personnage n\'est pas encore débloqué. Rassemble tous les fragments d\'abord.', [{ text: 'OK', style: 'cancel' }], '🧩');
                  return;
                }
                setSelectedChar(activeChar); setCharFlipped(false); flipAnim.setValue(0); onLoadCharPowers(activeChar.slug);
              }} style={({ pressed }) => ({ backgroundColor: '#00D984', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(8), transform: [{ scale: pressed ? 0.93 : 1 }] })}>
                <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#1A1D22' }}>Utiliser</Text>
              </Pressable>
            </View>
          </LinearGradient>
        ) : (
          <View style={{ padding: wp(16), alignItems: 'center', marginBottom: wp(12) }}>
            <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.35)' }}>Aucun compagnon actif</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(12) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Ma collection</Text>
          <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(6), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' }}>
            <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#D4AF37' }}>🃏 {userCollection.filter(c => c.owned !== false).length}/{userCollection.length || 16}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(20) }}>
          {(userCollection.length > 0 ? userCollection : ALL_CHARACTERS.map(c => ({ ...c, slug: c.id, owned: ownedCharacters.includes(c.id), level: 0, xp: 0, xp_next: 1000, uses_remaining: 0, uses_max: 10, fragments: 0, fragments_required: 3, is_active: false }))).map(ch => {
            const hasCard = ch.owned !== false && ch.owned !== undefined ? ch.owned : ownedCharacters.includes(ch.slug || ch.id);
            const own = hasCard && (ch.level || 0) >= 1;
            const isActive = (ch.slug || ch.id) === activeCharSlug;
            const badge = getLevelBadge(ch);
            return (
              <Pressable key={ch.slug || ch.id} delayPressIn={120}
                onPress={() => {
                  setSelectedChar(ch); setCharFlipped(false); flipAnim.setValue(0);
                  const charIndex = ALL_CHARACTERS.findIndex(c => c.id === (ch.slug || ch.id));
                  const idx = charIndex >= 0 ? charIndex : 0;
                  setCardViewIndex(idx);
                  cardViewIndexRef.current = idx;
                  onLoadCharPowers(ch.slug || ch.id);
                }}
                style={({ pressed }) => ({
                  width: cardW, borderRadius: wp(14), overflow: 'hidden',
                  opacity: 1,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? '#00D984' : own ? '#4A4F55' : 'rgba(255,255,255,0.08)',
                  ...(isActive ? { shadowColor: '#00D984', shadowOpacity: 0.25, shadowRadius: 6, elevation: 4 } : {}),
                  transform: [{ scale: pressed ? 0.93 : 1 }],
                })}>
                <LinearGradient colors={['#3A3F46','#252A30','#333A42','#1A1D22']} style={{ alignItems: 'center', paddingVertical: wp(8), opacity: own ? 1 : 0.55 }}>
                  <View style={{ width: wp(50), height: wp(50), borderRadius: wp(25), backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginBottom: wp(4) }}>
                    {(() => {
                      const charImg = getCharImage(ch.slug || ch.id);
                      if (charImg.img) {
                        return <Image source={charImg.img} style={{ width: wp(46), height: wp(46), borderRadius: wp(23) }} resizeMode="cover" />;
                      }
                      return <Text style={{ fontSize: fp(24) }}>{charImg.emoji}</Text>;
                    })()}
                    {!own && <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: fp(20) }}>🔒</Text></View>}
                  </View>
                  <Text style={{ fontSize: fp(9), fontWeight: '700', color: own ? '#FFF' : 'rgba(255,255,255,0.4)', textAlign: 'center' }} numberOfLines={1}>{ch.name || ch.slug}</Text>
                  {own ? (
                    <View style={{ backgroundColor: badge.color, borderRadius: wp(4), paddingHorizontal: wp(5), paddingVertical: wp(1), marginTop: wp(3) }}>
                      <Text style={{ fontSize: fp(7), fontWeight: '700', color: '#FFF' }}>{badge.text}</Text>
                    </View>
                  ) : (
                    <View style={{ width: '80%', marginTop: wp(3), alignItems: 'center' }}>
                      <View style={{ width: '100%', height: wp(3), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(1.5), overflow: 'hidden', marginBottom: wp(2) }}>
                        <View style={{
                          height: '100%', borderRadius: wp(1.5),
                          backgroundColor: ch.tier === 'mythique' ? '#D4AF37'
                            : ch.tier === 'elite' ? '#B388FF'
                            : ch.tier === 'rare' ? '#4DA6FF' : '#00D984',
                          width: Math.min(100, Math.round(((ch.fragments || ch.duplicates_count || 0) / (ch.fragments_required || FRAGS_NIV1[ch.tier] || 3)) * 100)) + '%',
                        }} />
                      </View>
                      <Text style={{ fontSize: fp(7), color: 'rgba(255,255,255,0.25)' }}>
                        {ch.fragments || ch.duplicates_count || 0}/{ch.fragments_required || FRAGS_NIV1[ch.tier] || 3} frags
                      </Text>
                    </View>
                  )}
                  {own && (
                    <View style={{ width: '80%', marginTop: wp(4) }}>
                      <View style={{ height: wp(3), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(1.5), overflow: 'hidden' }}>
                        <View style={{ height: '100%', borderRadius: wp(1.5), backgroundColor: '#00D984', width: Math.min(100, Math.round(((ch.xp || 0) / (ch.xp_next || 1000)) * 100)) + '%' }} />
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {selectedChar && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={closeCharModal}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'flex-end' }} onPress={closeCharModal}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), overflow: 'hidden', maxHeight: '95%' }}>
                <Animated.View pointerEvents={charFlipped ? 'none' : 'auto'} style={{ opacity: frontInterpolate, position: charFlipped ? 'absolute' : 'relative', width: '100%' }}>
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.92)', borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingTop: wp(8), paddingBottom: wp(16) }}>
                    <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: wp(10) }} />

                    <View style={{ alignItems: 'center', height: wp(380), justifyContent: 'center' }}>
                      {cardViewIndex > 0 ? (
                        <Pressable
                          onPress={() => onNavigateCard(-1)}
                          style={({ pressed }) => ({
                            position: 'absolute', left: wp(6), top: wp(370) / 2 - wp(22), zIndex: 20,
                            width: wp(32), height: wp(44), borderRadius: wp(10),
                            justifyContent: 'center', alignItems: 'center',
                            backgroundColor: pressed ? 'rgba(0,217,132,0.25)' : 'rgba(0,0,0,0.5)',
                            borderWidth: 1.5,
                            borderColor: pressed ? 'rgba(0,217,132,0.6)' : 'rgba(255,255,255,0.12)',
                            transform: [{ scale: pressed ? 0.88 : 1 }],
                          })}
                        >
                          <Text style={{ fontSize: fp(20), color: 'rgba(255,255,255,0.7)', fontWeight: '300' }}>‹</Text>
                        </Pressable>
                      ) : null}

                      {cardViewIndex < ALL_CHARACTERS.length - 1 ? (
                        <Pressable
                          onPress={() => onNavigateCard(1)}
                          style={({ pressed }) => ({
                            position: 'absolute', right: wp(6), top: wp(370) / 2 - wp(22), zIndex: 20,
                            width: wp(32), height: wp(44), borderRadius: wp(10),
                            justifyContent: 'center', alignItems: 'center',
                            backgroundColor: pressed ? 'rgba(0,217,132,0.25)' : 'rgba(0,0,0,0.5)',
                            borderWidth: 1.5,
                            borderColor: pressed ? 'rgba(0,217,132,0.6)' : 'rgba(255,255,255,0.12)',
                            transform: [{ scale: pressed ? 0.88 : 1 }],
                          })}
                        >
                          <Text style={{ fontSize: fp(20), color: 'rgba(255,255,255,0.7)', fontWeight: '300' }}>›</Text>
                        </Pressable>
                      ) : null}

                      <Animated.View style={{
                        transform: [{ translateX: cardSlideAnim.interpolate({
                          inputRange: [-1, 0, 1],
                          outputRange: [-W * 0.5, 0, W * 0.5],
                        }) }],
                        opacity: cardSlideAnim.interpolate({
                          inputRange: [-1, -0.2, 0, 0.2, 1],
                          outputRange: [0, 1, 1, 1, 0],
                        }),
                      }}>
                        {(() => {
                          const ac = ALL_CHARACTERS[cardViewIndex];
                          if (!ac) return null;
                          const acSlug = ac.id;
                          const coll = userCollection.length > 0 ? userCollection : ALL_CHARACTERS.map(c => ({ ...c, slug: c.id, owned: ownedCharacters.includes(c.id), level: 0, xp: 0, xp_next: 1000, uses_remaining: 0, uses_max: 10, fragments: 0, fragments_required: 3, is_active: false }));
                          const ch = coll.find(c => (c.slug || c.id) === acSlug) || { ...ac, slug: acSlug, owned: false };
                          const charImg = getCharImage(acSlug);
                          const own = ch.owned !== false && ch.owned !== undefined ? ch.owned : ownedCharacters.includes(acSlug);
                          const usesRem = ch.uses_remaining || 0;
                          const usesMax = ch.uses_max || ac.uses || 10;
                          const name = CHAR_NAMES[acSlug] || ch.name || ac.name || acSlug;

                          return (
                            <View style={{ width: wp(280), height: wp(370), borderRadius: wp(8), overflow: 'hidden', backgroundColor: '#000' }}>
                              {charImg.img ? (
                                <Image source={charImg.img} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                              ) : (
                                <View style={{ width: '100%', height: '100%', backgroundColor: '#1E2530', justifyContent: 'center', alignItems: 'center' }}>
                                  <Text style={{ fontSize: fp(80) }}>{charImg.emoji}</Text>
                                  <Text style={{ fontSize: fp(12), fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginTop: wp(8) }}>{name}</Text>
                                </View>
                              )}
                              {own && (
                                <View style={{ position: 'absolute', top: wp(32), right: wp(28), backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), borderWidth: 1, borderColor: (ch.level || 0) >= 3 ? 'rgba(212,175,55,0.5)' : 'rgba(0,217,132,0.3)' }}>
                                  <Text style={{ fontSize: fp(9), fontWeight: '800', color: (ch.level || 0) >= 3 ? '#D4AF37' : '#00D984', letterSpacing: 0.5 }}>
                                    {(ch.level || 0) >= 3 ? 'MAX' : 'Niv ' + (ch.level || 0)}
                                  </Text>
                                </View>
                              )}
                              {own && (
                                <View style={{ position: 'absolute', top: wp(58), right: wp(28), backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>{usesRem}/{usesMax} ⚡</Text>
                                </View>
                              )}
                              {!own && (
                                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                                  <Text style={{ fontSize: fp(50) }}>🔒</Text>
                                </View>
                              )}
                            </View>
                          );
                        })()}
                      </Animated.View>
                    </View>

                    {(() => {
                      const ac = ALL_CHARACTERS[cardViewIndex];
                      if (!ac) return null;
                      const acSlug = ac.id;
                      const coll = userCollection.length > 0 ? userCollection : ALL_CHARACTERS.map(c => ({ ...c, slug: c.id, owned: ownedCharacters.includes(c.id), level: 0, xp: 0, xp_next: 1000, uses_remaining: 0, uses_max: 10, fragments: 0, fragments_required: 3, is_active: false }));
                      const ch = coll.find(c => (c.slug || c.id) === acSlug) || { ...ac, slug: acSlug, owned: false };
                      const hasCardCheck = ch.owned !== false && ch.owned !== undefined ? ch.owned : ownedCharacters.includes(acSlug);
                      const own = hasCardCheck && (ch.level || 0) >= 1;
                      const isActiveChar = acSlug === activeCharSlug;
                      const tier = ch.tier || ac.tier || 'standard';
                      const name = CHAR_NAMES[acSlug] || ch.name || ac.name || acSlug;
                      const usesRem = ch.uses_remaining || 0;
                      const usesMax = ch.uses_max || ac.uses || 10;
                      const xp = ch.xp || 0;
                      const xpNext = ch.xp_next || 1000;
                      const frags = ch.fragments || ch.duplicates_count || 0;
                      const fragsReq = ch.fragments_required || FRAGS_NIV1[tier] || 3;

                      return (
                        <View style={{ paddingHorizontal: (SCREEN_WIDTH - wp(280)) / 2 }}>
                          <View style={{ width: wp(280), marginTop: wp(8), alignItems: 'center' }}>
                            {own && (
                              <View style={{ width: '100%', marginTop: wp(4) }}>
                                <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), overflow: 'hidden' }}>
                                  <View style={{ height: '100%', borderRadius: wp(2), backgroundColor: '#5A4A2E', width: Math.min(100, Math.round((xp / xpNext) * 100)) + '%' }} />
                                </View>
                                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: wp(3) }}>{xp}/{xpNext} XP</Text>
                              </View>
                            )}
                            {!own && (
                              <View style={{ width: '100%', marginTop: wp(4) }}>
                                <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), overflow: 'hidden' }}>
                                  <View style={{ height: '100%', borderRadius: wp(2), backgroundColor: '#5A4A2E', width: Math.min(100, Math.round((frags / fragsReq) * 100)) + '%' }} />
                                </View>
                                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: wp(3) }}>🧩 {frags}/{fragsReq} fragments</Text>
                              </View>
                            )}
                            {own && isActiveChar && (
                              <View style={{ backgroundColor: 'rgba(139,122,46,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(2), marginTop: wp(6) }}>
                                <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#8B7A3E' }}>ACTIF ✓</Text>
                              </View>
                            )}
                          </View>

                          <View style={{ width: wp(280), marginTop: wp(6), gap: wp(4) }}>
                            {own && !isActiveChar && (
                              <Pressable delayPressIn={120} onPress={() => onSwitchActiveCharacter(acSlug)} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                                <LinearGradient colors={['#8B7A2E','#6B5A1E']} style={{ paddingVertical: wp(10), borderRadius: wp(10), alignItems: 'center' }}>
                                  <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF' }}>Équiper</Text>
                                </LinearGradient>
                              </Pressable>
                            )}
                            <Pressable delayPressIn={120}
                              onPress={() => {
                                if (!own && (ch.fragments || ch.duplicates_count || 0) > 0) {
                                  const remaining = (ch.fragments_required || FRAGS_NIV1[tier] || 3) - (ch.fragments || ch.duplicates_count || 0);
                                  showLixAlert('🧩 Fragments manquants', 'Il te manque encore ' + remaining + ' fragment' + (remaining > 1 ? 's' : '') + ' pour débloquer ' + name + '.\n\nTourne la roue ou participe aux défis !', [{ text: 'Aller au Spin', color: '#D4AF37', onPress: () => { closeCharModal(); onGoToSpin(); } }, { text: 'OK', style: 'cancel' }], '🧩');
                                  return;
                                }
                                if (own && usesRem === 0) {
                                  showLixAlert('⚡ Recharge nécessaire', 'Recharge ton ' + name + ' avec ' + (ch.recharge_energy || 10) + ' énergie.', [{ text: 'Recharger', color: '#00D984', onPress: () => onRechargeChar() }, { text: 'Fermer', style: 'cancel' }], '⚡');
                                } else {
                                  onFlipCard();
                                  if (charPowers.length === 0) onLoadCharPowers(acSlug);
                                }
                              }}
                              style={({ pressed }) => ({ opacity: (own && usesRem === 0) ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                              <LinearGradient colors={(own && usesRem === 0) ? ['#333A42','#2A2F36'] : ['#3A3520','#2A2815']} style={{ paddingVertical: wp(10), borderRadius: wp(10), alignItems: 'center' }}>
                                <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#B8A472' }}>
                                  {!own && (ch.fragments || ch.duplicates_count || 0) > 0
                                    ? 'Fragments : ' + (ch.fragments || ch.duplicates_count || 0) + '/' + (ch.fragments_required || FRAGS_NIV1[tier] || 3)
                                    : (own && usesRem === 0) ? 'Recharger'
                                    : own ? 'Pouvoirs →'
                                    : 'Aperçu Pouvoirs →'}
                                </Text>
                              </LinearGradient>
                            </Pressable>
                            {!own && (
                              <Pressable delayPressIn={120} onPress={() => { closeCharModal(); onGoToSpin(); }}
                                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                                <View style={{ paddingVertical: wp(10), borderRadius: wp(10), alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                  <Text style={{ fontSize: fp(11), fontWeight: '700', color: 'rgba(255,255,255,0.3)' }}>Obtenir via Spin ou Défis</Text>
                                </View>
                              </Pressable>
                            )}
                            <Pressable onPress={closeCharModal} style={{ paddingVertical: wp(8), alignItems: 'center' }}>
                              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.25)' }}>Fermer</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })()}

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: wp(12), gap: wp(4) }}>
                      {(() => {
                        const total = ALL_CHARACTERS.length;
                        const maxDots = 7;
                        let start = Math.max(0, cardViewIndex - Math.floor(maxDots / 2));
                        let end = start + maxDots;
                        if (end > total) { end = total; start = Math.max(0, end - maxDots); }
                        return ALL_CHARACTERS.slice(start, end).map((_, i) => {
                          const realIdx = start + i;
                          return <View key={realIdx} style={{ width: realIdx === cardViewIndex ? wp(8) : wp(5), height: realIdx === cardViewIndex ? wp(8) : wp(5), borderRadius: wp(4), backgroundColor: realIdx === cardViewIndex ? '#B8A472' : 'rgba(255,255,255,0.15)' }} />;
                        });
                      })()}
                    </View>

                    {ALL_CHARACTERS.length > 1 && (
                      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: wp(6), marginBottom: wp(4) }}>{cardViewIndex + 1}/{ALL_CHARACTERS.length}</Text>
                    )}
                  </View>
                </Animated.View>

                <Animated.View pointerEvents={!charFlipped ? 'none' : 'auto'} style={{ opacity: backInterpolate, position: !charFlipped ? 'absolute' : 'relative', width: '100%' }}>
                  <LinearGradient colors={['#0D0D0D','#111111','#0A0A0A','#080808']} style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34), minHeight: SCREEN_WIDTH * 1.3 }}>
                    <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }} />
                    <ScrollView style={{ flex: 1, maxHeight: SCREEN_WIDTH * 1.1 }} contentContainerStyle={{ paddingBottom: wp(60) }} showsVerticalScrollIndicator={true} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#D4AF37', textAlign: 'center', marginBottom: wp(16) }}>POUVOIRS</Text>

                      {(() => {
                        const currentChar = ALL_CHARACTERS[cardViewIndexRef.current];
                        const currentSlug = currentChar?.id;
                        const isOwned = userCollection.some(c => (c.slug || c.id) === currentSlug && c.owned !== false) || ownedCharacters.includes(currentSlug);
                        if (isOwned) return null;
                        return (
                          <View style={{ backgroundColor: 'rgba(255,140,66,0.1)', borderRadius: wp(10), padding: wp(10), marginBottom: wp(12), borderWidth: 1, borderColor: 'rgba(255,140,66,0.2)', flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                            <Text style={{ fontSize: fp(16) }}>🔒</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FF8C42' }}>Aperçu uniquement</Text>
                              <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.35)' }}>Obtiens cette carte pour activer ses pouvoirs</Text>
                            </View>
                          </View>
                        );
                      })()}

                      {loadingPowers ? (
                        <ActivityIndicator color="#D4AF37" size="large" style={{ marginVertical: wp(30) }} />
                      ) : charPowers.length > 0 ? charPowers.map((power, idx) => {
                        const isUnlocked = power.unlocked;
                        return (
                          <View key={power.power_key || idx} style={{
                            marginBottom: wp(8),
                            backgroundColor: isUnlocked ? 'rgba(0,217,132,0.06)' : 'rgba(255,255,255,0.02)',
                            borderRadius: wp(10), padding: wp(10),
                            borderWidth: 1,
                            borderColor: isUnlocked ? 'rgba(0,217,132,0.15)' : 'rgba(255,255,255,0.05)',
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                              <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>
                                {power.icon || '🔮'}
                              </Text>
                              <Text style={{
                                color: isUnlocked ? '#EAEEF3' : '#555E6C',
                                fontSize: fp(10), fontWeight: '700', flex: 1,
                              }}>
                                {power.name_fr || power.name || power.power_key}
                              </Text>
                              {power.is_superpower && isUnlocked && (
                                <View style={{
                                  backgroundColor: 'rgba(212,175,55,0.1)',
                                  paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4),
                                }}>
                                  <Text style={{ color: '#D4AF37', fontSize: fp(7), fontWeight: '800' }}>
                                    SUPERPOWER
                                  </Text>
                                </View>
                              )}
                              {!isUnlocked && (
                                <Text style={{ color: '#FF6B6B', fontSize: fp(8), fontWeight: '600' }}>
                                  🔒 Niv{power.level_required || power.required_level || 0}
                                </Text>
                              )}
                            </View>

                            <Text style={{
                              color: isUnlocked ? '#8892A0' : '#444B55',
                              fontSize: fp(8), marginBottom: wp(8),
                            }}>
                              {power.description_fr || power.description || ''}
                            </Text>

                            {isUnlocked ? (
                              (() => {
                                const POWER_NAV_MAP = {
                                  owl_suggestion_repas: 'RepasPage', hawk_comparateur: 'RepasPage', hawk_historique: 'RepasPage',
                                  fox_regime: 'RepasPage', gipsy_toile_sante: 'DashboardPage',
                                  phoenix_renaissance: 'RepasPage', wolf_meute: null, boukki_festin: 'RepasPage',
                                  dolphin_vague_bleue: 'DashboardPage',
                                  licornium_planner: 'RepasPage', licornium_corne: 'RepasPage',
                                  jaane_mue: 'ActivityPage', jaane_hypnose: 'ActivityPage',
                                  mosquito_essaim: null,
                                  simba_territoire: 'DashboardPage', simba_roi: 'DashboardPage',
                                  alburax_medibook: 'MedicAiPage',
                                  tardigrum_immortel: null,
                                };

                                switch (power.action_type) {
                                  case 'redirect':
                                    return (
                                      <Pressable delayPressIn={120}
                                        onPress={async () => {
                                          const currentSlugCheck = ALL_CHARACTERS[cardViewIndexRef.current]?.id;
                                          const isOwnedCheck = userCollection.some(c => (c.slug || c.id) === currentSlugCheck && c.owned !== false) || ownedCharacters.includes(currentSlugCheck);
                                          if (!isOwnedCheck) {
                                            showLixAlert('🔒 Carte requise', 'Obtiens ' + (CHAR_NAMES[currentSlugCheck] || 'cette carte') + ' pour utiliser ce pouvoir.', [{ text: 'Aller au Spin', color: '#D4AF37', onPress: () => { closeCharModal(); onGoToSpin(); } }, { text: 'Fermer', style: 'cancel' }], '🔒');
                                            return;
                                          }
                                          if (onShouldConsumePower(power)) {
                                            const r = await onConsumePower(power.power_key);
                                            if (!r.success) return;
                                          }
                                          closeCharModal();
                                          const targetNav = POWER_NAV_MAP[power.power_key];
                                          if (targetNav) onNavigateTo(targetNav);
                                        }}
                                        style={({ pressed }) => ({
                                          paddingVertical: wp(7), borderRadius: wp(8),
                                          backgroundColor: pressed ? 'rgba(0,217,132,0.15)' : 'rgba(0,217,132,0.08)',
                                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                                          alignItems: 'center',
                                        })}
                                      >
                                        <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                                          Ouvrir →
                                        </Text>
                                      </Pressable>
                                    );

                                  case 'redirect_with_boost':
                                    return (
                                      <Pressable delayPressIn={120}
                                        onPress={async () => {
                                          const currentSlugCheck = ALL_CHARACTERS[cardViewIndexRef.current]?.id;
                                          const isOwnedCheck = userCollection.some(c => (c.slug || c.id) === currentSlugCheck && c.owned !== false) || ownedCharacters.includes(currentSlugCheck);
                                          if (!isOwnedCheck) {
                                            showLixAlert('🔒 Carte requise', 'Obtiens ' + (CHAR_NAMES[currentSlugCheck] || 'cette carte') + ' pour utiliser ce pouvoir.', [{ text: 'Aller au Spin', color: '#D4AF37', onPress: () => { closeCharModal(); onGoToSpin(); } }, { text: 'Fermer', style: 'cancel' }], '🔒');
                                            return;
                                          }
                                          const r = await onConsumePower(power.power_key);
                                          if (!r.success) return;

                                          const boostMap = {
                                            tiger_xp_10: 1.10, tiger_xp_20: 1.20, tiger_xp_30_badge: 1.30,
                                            simba_rugissement: 1.50,
                                            alburax_streak_shield: 1.0, alburax_transcendance: 2.0,
                                            tardigrum_resistance: 1.30,
                                          };
                                          const boostMultiplier = boostMap[power.power_key] || 1.10;
                                          const boostType = power.power_key === 'alburax_transcendance' ? 'lix_multiplier'
                                            : power.power_key === 'alburax_streak_shield' ? 'streak_shield'
                                            : power.power_key === 'tardigrum_resistance' ? 'xp_activity'
                                            : 'xp_activity';
                                          const boostExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                                          fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId, {
                                            method: 'PATCH',
                                            headers: POST_HEADERS,
                                            body: JSON.stringify({
                                              active_boost: JSON.stringify({ type: boostType, multiplier: boostMultiplier, expires_at: boostExpiry, source: power.power_key }),
                                            }),
                                          }).catch(() => {});

                                          closeCharModal();
                                          const pctBoost = Math.round((boostMultiplier - 1) * 100);
                                          const boostMessages = {
                                            xp_activity: { emoji: '⚡', title: 'Boost XP activé !', msg: '+' + pctBoost + '% XP sur tes activités pendant 24h.', btn: 'Activité', nav: 'ActivityPage' },
                                            lix_multiplier: { emoji: '💰', title: 'Double Lix activé !', msg: 'Toutes tes récompenses Lix sont doublées pendant 24h.', btn: 'LixVerse', nav: null },
                                            streak_shield: { emoji: '🛡️', title: 'Streak Shield activé !', msg: 'Si tu oublies un jour, ton streak est protégé.', btn: 'OK', nav: null },
                                            energy_cost: { emoji: '🧬', title: 'Énergie /2 activé !', msg: 'Toutes les actions IA coûtent moitié moins d\'énergie pendant 24h.', btn: 'Super', nav: null },
                                          };
                                          const bm = boostMessages[boostType] || boostMessages.xp_activity;
                                          const buttons = bm.nav
                                            ? [{ text: bm.btn, color: '#D4AF37', onPress: () => onNavigateTo(bm.nav) }, { text: 'OK', style: 'cancel' }]
                                            : [{ text: bm.btn, color: '#00D984' }];
                                          showLixAlert(bm.emoji + ' ' + bm.title, bm.msg, buttons, bm.emoji);
                                        }}
                                        style={({ pressed }) => ({
                                          paddingVertical: wp(7), borderRadius: wp(8),
                                          backgroundColor: pressed ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.08)',
                                          borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                                          alignItems: 'center',
                                        })}
                                      >
                                        <Text style={{ color: '#D4AF37', fontSize: fp(9), fontWeight: '700' }}>
                                          Activer le Boost →
                                        </Text>
                                      </Pressable>
                                    );

                                  case 'modal_inline':
                                    return (
                                      <Pressable delayPressIn={120}
                                        onPress={async () => {
                                          const currentSlugCheck = ALL_CHARACTERS[cardViewIndexRef.current]?.id;
                                          const isOwnedCheck = userCollection.some(c => (c.slug || c.id) === currentSlugCheck && c.owned !== false) || ownedCharacters.includes(currentSlugCheck);
                                          if (!isOwnedCheck) {
                                            showLixAlert('🔒 Carte requise', 'Obtiens ' + (CHAR_NAMES[currentSlugCheck] || 'cette carte') + ' pour utiliser ce pouvoir.', [{ text: 'Aller au Spin', color: '#D4AF37', onPress: () => { closeCharModal(); onGoToSpin(); } }, { text: 'Fermer', style: 'cancel' }], '🔒');
                                            return;
                                          }
                                          if (onShouldConsumePower(power)) {
                                            const r = await onConsumePower(power.power_key);
                                            if (!r.success) return;
                                          }
                                          setInlinePowerModal(power.power_key);
                                        }}
                                        style={({ pressed }) => ({
                                          paddingVertical: wp(7), borderRadius: wp(8),
                                          backgroundColor: pressed ? 'rgba(0,217,132,0.15)' : 'rgba(0,217,132,0.08)',
                                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                                          alignItems: 'center',
                                        })}
                                      >
                                        <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                                          Activer
                                        </Text>
                                      </Pressable>
                                    );

                                  case 'toggle':
                                    return (
                                      <Pressable delayPressIn={120}
                                        onPress={async () => {
                                          const currentSlugCheck = ALL_CHARACTERS[cardViewIndexRef.current]?.id;
                                          const isOwnedCheck = userCollection.some(c => (c.slug || c.id) === currentSlugCheck && c.owned !== false) || ownedCharacters.includes(currentSlugCheck);
                                          if (!isOwnedCheck) {
                                            showLixAlert('🔒 Carte requise', 'Obtiens cette carte pour activer cette préférence.', [{ text: 'Fermer', style: 'cancel' }], '🔒');
                                            return;
                                          }
                                          showLixAlert('✅ Préférence activée', (power.name_fr || power.name || '') + ' est maintenant actif.\nTu recevras des notifications en conséquence.', [{ text: 'Super', color: '#00D984' }], '🔔');
                                          fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + userId, {
                                            method: 'PATCH', headers: POST_HEADERS,
                                            body: JSON.stringify({ ['pref_' + power.power_key]: true }),
                                          }).catch(() => {});
                                        }}
                                        style={({ pressed }) => ({
                                          flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                          paddingVertical: wp(7), borderRadius: wp(8),
                                          backgroundColor: pressed ? 'rgba(0,217,132,0.15)' : 'rgba(0,217,132,0.08)',
                                          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
                                        })}
                                      >
                                        <Text style={{ color: '#00D984', fontSize: fp(9), fontWeight: '700' }}>
                                          Activer / Désactiver
                                        </Text>
                                      </Pressable>
                                    );

                                  default:
                                    return (
                                      <Text style={{ color: '#555E6C', fontSize: fp(8), textAlign: 'center' }}>
                                        Type non supporté
                                      </Text>
                                    );
                                }
                              })()
                            ) : (
                              <View style={{
                                paddingVertical: wp(7), borderRadius: wp(8),
                                backgroundColor: 'rgba(255,255,255,0.03)',
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
                                alignItems: 'center',
                              }}>
                                <Text style={{ color: '#555E6C', fontSize: fp(8) }}>
                                  🔒 Débloque au Niveau {power.level_required || power.required_level || 0}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      }) : (
                        <View style={{ alignItems: 'center', paddingVertical: wp(30) }}>
                          <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)' }}>Aucun pouvoir chargé</Text>
                        </View>
                      )}

                      {inlinePowerModal === 'owl_resume_macros' && (
                        <View style={{ backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🦉 Résumé Nutritionnel</Text>
                          {inlinePowerLoading ? (
                            <ActivityIndicator color="#00D984" style={{ marginVertical: wp(20) }} />
                          ) : inlinePowerData ? (
                            <View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(12) }}>
                                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Aujourd'hui — {inlinePowerData.meals_count || 0} repas</Text>
                                <Text style={{ fontSize: fp(11), fontWeight: '700', color: Math.abs(inlinePowerData.total_calories - inlinePowerData.calorie_target) < inlinePowerData.calorie_target * 0.15 ? '#00D984' : '#FF8C42' }}>
                                  {inlinePowerData.total_calories || 0} / {inlinePowerData.calorie_target || '—'} kcal
                                </Text>
                              </View>
                              {[
                                { label: 'Protéines', val: inlinePowerData.total_protein, color: '#FF6B6B', unit: 'g' },
                                { label: 'Glucides', val: inlinePowerData.total_carbs, color: '#4DA6FF', unit: 'g' },
                                { label: 'Lipides', val: inlinePowerData.total_fat, color: '#D4AF37', unit: 'g' },
                                { label: 'Fibres', val: inlinePowerData.total_fiber, color: '#00D984', unit: 'g' },
                              ].map((m, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6) }}>
                                  <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: m.color, marginRight: wp(8) }} />
                                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.5)', flex: 1 }}>{m.label}</Text>
                                  <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>{Math.round(m.val || 0)}{m.unit}</Text>
                                </View>
                              ))}
                            </View>
                          ) : (
                            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucun repas enregistré aujourd'hui</Text>
                          )}
                        </View>
                      )}

                      {inlinePowerModal === 'hawk_micronutriments' && (
                        <View style={{ backgroundColor: 'rgba(77,166,255,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(77,166,255,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>🔬 Micronutriments</Text>
                          {inlinePowerLoading ? (
                            <ActivityIndicator color="#4DA6FF" style={{ marginVertical: wp(20) }} />
                          ) : inlinePowerData ? (
                            <View>
                              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(10) }}>
                                Dernier scan : {inlinePowerData.food_name} ({Math.round(inlinePowerData.calories || 0)} kcal)
                              </Text>
                              {[
                                { label: 'Protéines', val: inlinePowerData.protein_g, color: '#FF6B6B' },
                                { label: 'Glucides', val: inlinePowerData.carbs_g, color: '#4DA6FF' },
                                { label: 'Lipides', val: inlinePowerData.fat_g, color: '#D4AF37' },
                                { label: 'Fibres', val: inlinePowerData.fiber_g, color: '#00D984' },
                              ].map((m, i) => {
                                const total = (inlinePowerData.protein_g || 0) + (inlinePowerData.carbs_g || 0) + (inlinePowerData.fat_g || 0);
                                const pct = total > 0 ? Math.round(((m.val || 0) / total) * 100) : 0;
                                return (
                                  <View key={i} style={{ marginBottom: wp(8) }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(3) }}>
                                      <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>{m.label}</Text>
                                      <Text style={{ fontSize: fp(10), fontWeight: '700', color: m.color }}>{Math.round(m.val || 0)}g ({pct}%)</Text>
                                    </View>
                                    <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), overflow: 'hidden' }}>
                                      <View style={{ height: '100%', width: pct + '%', backgroundColor: m.color, borderRadius: wp(2) }} />
                                    </View>
                                  </View>
                                );
                              })}
                              {inlinePowerData.portion_g > 0 && (
                                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.25)', marginTop: wp(4) }}>Portion estimée : {Math.round(inlinePowerData.portion_g)}g</Text>
                              )}
                              {inlinePowerData.ingredients_detail && Array.isArray(inlinePowerData.ingredients_detail) && (
                                <View style={{ marginTop: wp(10) }}>
                                  <Text style={{ fontSize: fp(10), color: 'rgba(77,166,255,0.6)', marginBottom: wp(4) }}>Ingrédients détectés :</Text>
                                  {inlinePowerData.ingredients_detail.slice(0, 6).map((ing, i) => (
                                    <Text key={i} style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.35)', marginBottom: wp(2) }}>
                                      • {ing.name || ing.food_name || '—'} {ing.quantity_g ? '(' + Math.round(ing.quantity_g) + 'g)' : ''}
                                    </Text>
                                  ))}
                                </View>
                              )}
                            </View>
                          ) : (
                            <View style={{ alignItems: 'center', paddingVertical: wp(16) }}>
                              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', marginBottom: wp(10) }}>Aucun scan récent trouvé</Text>
                              <Pressable delayPressIn={120} onPress={() => { closeCharModal(); onNavigateTo('RepasPage'); }}
                                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                                <LinearGradient colors={['#4DA6FF','#2E86DE']} style={{ paddingVertical: wp(10), paddingHorizontal: wp(20), borderRadius: wp(10), alignItems: 'center' }}>
                                  <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>Scanner un repas →</Text>
                                </LinearGradient>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      )}

                      {(inlinePowerModal === 'fox_sub_1' || inlinePowerModal === 'fox_sub_2' || inlinePowerModal === 'fox_sub_3') && (
                        <View style={{ backgroundColor: 'rgba(255,140,66,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(255,140,66,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(6) }}>🔄 Substitution d'ingrédient</Text>
                          {inlinePowerLoading ? (
                            <ActivityIndicator color="#FF8C42" style={{ marginVertical: wp(20) }} />
                          ) : inlinePowerData && inlinePowerData.ingredients_detail && Array.isArray(inlinePowerData.ingredients_detail) ? (
                            <View>
                              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(10) }}>
                                Dernier scan : {inlinePowerData.food_name}
                              </Text>
                              <Text style={{ fontSize: fp(10), color: '#FF8C42', marginBottom: wp(8) }}>Choisis un ingrédient à remplacer :</Text>
                              {inlinePowerData.ingredients_detail.slice(0, 5).map((ing, i) => (
                                <Pressable key={i} delayPressIn={120}
                                  onPress={() => {
                                    closeCharModal();
                                    onNavigateTo('RepasPage');
                                    showLixAlert('🦊 Substitution demandée', 'Remplacer "' + (ing.name || ing.food_name || '—') + '" par une alternative plus saine.\n\nCette fonctionnalité sera disponible dans la page Repas.', [{ text: 'Compris', color: '#FF8C42' }], '🔄');
                                  }}
                                  style={({ pressed }) => ({
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                    paddingVertical: wp(8), paddingHorizontal: wp(10), marginBottom: wp(4),
                                    borderRadius: wp(8), backgroundColor: pressed ? 'rgba(255,140,66,0.15)' : 'rgba(255,255,255,0.03)',
                                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                                  })}>
                                  <Text style={{ fontSize: fp(11), color: '#FFF', flex: 1 }}>{ing.name || ing.food_name || '—'}</Text>
                                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginRight: wp(6) }}>{ing.quantity_g ? Math.round(ing.quantity_g) + 'g' : ''}</Text>
                                  <Text style={{ fontSize: fp(10), color: '#FF8C42' }}>Remplacer →</Text>
                                </Pressable>
                              ))}
                            </View>
                          ) : (
                            <View style={{ alignItems: 'center', paddingVertical: wp(16) }}>
                              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', marginBottom: wp(10) }}>Scanne un repas d'abord pour substituer un ingrédient</Text>
                              <Pressable delayPressIn={120} onPress={() => { closeCharModal(); onNavigateTo('RepasPage'); }}
                                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                                <LinearGradient colors={['#FF8C42','#E67E22']} style={{ paddingVertical: wp(10), paddingHorizontal: wp(20), borderRadius: wp(10), alignItems: 'center' }}>
                                  <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>Aller au scan →</Text>
                                </LinearGradient>
                              </Pressable>
                            </View>
                          )}
                        </View>
                      )}

                      {inlinePowerModal === 'gipsy_mood_nutrition' && (
                        <View style={{ backgroundColor: 'rgba(155,109,255,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(155,109,255,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🕸️ Humeur ↔ Nutrition</Text>
                          {inlinePowerLoading ? (
                            <ActivityIndicator color="#9B6DFF" style={{ marginVertical: wp(20) }} />
                          ) : inlinePowerData && inlinePowerData.summaries && inlinePowerData.summaries.length > 0 ? (
                            <View>
                              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: wp(80), marginBottom: wp(10) }}>
                                {inlinePowerData.summaries.slice(-7).map((s, i) => {
                                  const maxCal = Math.max(...inlinePowerData.summaries.map(x => x.total_calories || 0), 1);
                                  const h = Math.max(wp(8), ((s.total_calories || 0) / maxCal) * wp(60));
                                  const dayLabel = ['D','L','M','Me','J','V','S'][new Date(s.date).getDay()];
                                  const inBalance = s.calorie_target > 0 && Math.abs(s.calorie_balance) <= s.calorie_target * 0.15;
                                  const dayMood = (inlinePowerData.moods || []).find(m => m.created_at && m.created_at.slice(0, 10) === s.date);
                                  const moodEmoji = dayMood ? ({'Rayonnant': '😄', 'Bien': '😊', 'Neutre': '😐', 'Bas': '😔', 'Stressé': '😰'}[dayMood.mood_level] || '🔵') : '—';
                                  return (
                                    <View key={i} style={{ alignItems: 'center' }}>
                                      <Text style={{ fontSize: fp(10), marginBottom: wp(2) }}>{moodEmoji}</Text>
                                      <View style={{ width: wp(20), height: h, borderRadius: wp(4), backgroundColor: inBalance ? 'rgba(0,217,132,0.5)' : 'rgba(155,109,255,0.4)' }} />
                                      <Text style={{ fontSize: fp(7), color: 'rgba(255,255,255,0.3)', marginTop: wp(2) }}>{dayLabel}</Text>
                                      <Text style={{ fontSize: fp(6), color: 'rgba(255,255,255,0.2)' }}>{s.total_calories || 0}</Text>
                                    </View>
                                  );
                                })}
                              </View>
                              <View style={{ flexDirection: 'row', gap: wp(8), justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                                  <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(0,217,132,0.5)' }} />
                                  <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.3)' }}>Équilibré</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                                  <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(155,109,255,0.4)' }} />
                                  <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.3)' }}>Hors cible</Text>
                                </View>
                              </View>
                            </View>
                          ) : (
                            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Pas assez de données cette semaine. Continue à logger tes repas et ton humeur !</Text>
                          )}
                        </View>
                      )}

                      {inlinePowerModal === 'gipsy_hydra_energy' && (
                        <View style={{ backgroundColor: 'rgba(155,109,255,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(155,109,255,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🕸️ Hydratation ↔ Activité</Text>
                          {inlinePowerLoading ? (
                            <ActivityIndicator color="#9B6DFF" style={{ marginVertical: wp(20) }} />
                          ) : inlinePowerData && (inlinePowerData.hydration?.length > 0 || inlinePowerData.activities?.length > 0) ? (
                            <View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(6) }}>
                                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)' }}>7 derniers jours</Text>
                              </View>
                              {['L','M','Me','J','V','S','D'].slice(0, Math.max(inlinePowerData.hydration?.length || 0, inlinePowerData.activities?.length || 0, 1)).map((d, i) => {
                                const dayHyd = inlinePowerData.hydration?.[i];
                                const dayAct = inlinePowerData.activities?.[i];
                                return (
                                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(4), gap: wp(6) }}>
                                    <Text style={{ width: wp(20), fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>J{i + 1}</Text>
                                    <Text style={{ fontSize: fp(9), color: '#4DA6FF', width: wp(55) }}>💧 {dayHyd ? dayHyd.effective_ml + 'ml' : '—'}</Text>
                                    <Text style={{ fontSize: fp(9), color: '#FF8C42', flex: 1 }}>🔥 {dayAct ? dayAct.duration_minutes + 'min / ' + dayAct.calories_burned + 'kcal' : '—'}</Text>
                                  </View>
                                );
                              })}
                            </View>
                          ) : (
                            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Pas assez de données. Hydrate-toi et bouge cette semaine !</Text>
                          )}
                        </View>
                      )}

                      {(inlinePowerModal === 'phoenix_recovery_detect' || inlinePowerModal === 'phoenix_recovery_food') && (
                        <View style={{ backgroundColor: 'rgba(46,213,115,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(46,213,115,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🔥 Bilan Récupération</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#2ED573" style={{ marginVertical: wp(20) }} /> : inlinePowerData ? (
                            <View>
                              {inlinePowerData.activities && inlinePowerData.activities.length > 0 ? (
                                <View style={{ marginBottom: wp(10) }}>
                                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)', marginBottom: wp(6) }}>Activités aujourd'hui</Text>
                                  {inlinePowerData.activities.map((a, i) => (
                                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                                      <Text style={{ fontSize: fp(11), color: '#FFF' }}>{a.name || a.type}</Text>
                                      <Text style={{ fontSize: fp(11), color: '#FF8C42' }}>{a.duration_minutes}min · {a.calories_burned} kcal</Text>
                                    </View>
                                  ))}
                                  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: wp(8) }} />
                                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)' }}>Total brûlé : {inlinePowerData.activities.reduce((s, a) => s + (a.calories_burned || 0), 0)} kcal</Text>
                                </View>
                              ) : (
                                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', marginBottom: wp(8) }}>Aucune activité aujourd'hui</Text>
                              )}
                              {inlinePowerData.summary && (
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(10), padding: wp(10) }}>
                                  <Text style={{ fontSize: fp(10), color: '#2ED573', fontWeight: '700', marginBottom: wp(4) }}>Récupération recommandée</Text>
                                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>
                                    Balance calorique : {inlinePowerData.summary.calorie_balance > 0 ? '+' : ''}{inlinePowerData.summary.calorie_balance || 0} kcal
                                  </Text>
                                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)', marginTop: wp(2) }}>
                                    {(inlinePowerData.summary.calorie_balance || 0) < -200
                                      ? '⚠️ Déficit important — privilégie protéines + glucides lents'
                                      : (inlinePowerData.summary.calorie_balance || 0) > 200
                                        ? '💪 Surplus OK pour récupération musculaire'
                                        : '✅ Balance équilibrée — bonne récupération'}
                                  </Text>
                                </View>
                              )}
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucune donnée disponible</Text>}
                        </View>
                      )}

                      {inlinePowerModal === 'wolf_streak_tracker' && (
                        <View style={{ backgroundColor: 'rgba(164,176,190,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(164,176,190,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🐺 Streaks — 30 derniers jours</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#A4B0BE" style={{ marginVertical: wp(20) }} /> : inlinePowerData ? (
                            <View>
                              {[
                                { label: '🍽️ Repas loggés', days: inlinePowerData.mealDays, color: '#00D984' },
                                { label: '🏃 Activité', days: inlinePowerData.actDays, color: '#FF8C42' },
                                { label: '😊 Humeur', days: inlinePowerData.moodDays, color: '#9B6DFF' },
                                { label: '💧 Hydratation', days: inlinePowerData.hydDays, color: '#4DA6FF' },
                              ].map((cat, i) => {
                                const count = (cat.days || []).length;
                                const pct = Math.min(100, Math.round((count / 30) * 100));
                                return (
                                  <View key={i} style={{ marginBottom: wp(10) }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(3) }}>
                                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.5)' }}>{cat.label}</Text>
                                      <Text style={{ fontSize: fp(11), fontWeight: '700', color: cat.color }}>{count}/30 jours</Text>
                                    </View>
                                    <View style={{ height: wp(5), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2.5), overflow: 'hidden' }}>
                                      <View style={{ height: '100%', width: pct + '%', backgroundColor: cat.color, borderRadius: wp(2.5) }} />
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucune donnée</Text>}
                        </View>
                      )}

                      {(inlinePowerModal === 'boukki_calorie_remain' || inlinePowerModal === 'boukki_complement') && (
                        <View style={{ backgroundColor: 'rgba(205,127,50,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(205,127,50,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🦴 Calories — 7 jours</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#CD7F32" style={{ marginVertical: wp(20) }} /> : inlinePowerData && inlinePowerData.weekSummaries && inlinePowerData.weekSummaries.length > 0 ? (
                            <View>
                              {inlinePowerData.weekSummaries.map((s, i) => {
                                const remain = (s.calorie_target || 0) - (s.total_calories || 0);
                                const dayLabel = ['D','L','M','Me','J','V','S'][new Date(s.date).getDay()];
                                return (
                                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(6), gap: wp(6) }}>
                                    <Text style={{ width: wp(20), fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>{dayLabel}</Text>
                                    <View style={{ flex: 1, height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), overflow: 'hidden' }}>
                                      <View style={{ height: '100%', width: Math.min(100, Math.round(((s.total_calories || 0) / (s.calorie_target || 2000)) * 100)) + '%', backgroundColor: remain >= 0 ? '#00D984' : '#FF6B6B', borderRadius: wp(2) }} />
                                    </View>
                                    <Text style={{ fontSize: fp(9), color: remain >= 0 ? '#00D984' : '#FF6B6B', width: wp(50), textAlign: 'right' }}>{remain >= 0 ? '+' : ''}{remain} kcal</Text>
                                  </View>
                                );
                              })}
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucune donnée calorie cette semaine</Text>}
                        </View>
                      )}

                      {(inlinePowerModal === 'rhino_custom_goal' || inlinePowerModal === 'rhino_enriched_report' || inlinePowerModal === 'rhino_charge') && (
                        <View style={{ backgroundColor: 'rgba(116,125,140,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(116,125,140,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>
                            🦏 {inlinePowerModal === 'rhino_charge' ? 'Analyse Défis' : 'Stats Fitness — 7 jours'}
                          </Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#747D8C" style={{ marginVertical: wp(20) }} /> : inlinePowerData ? (
                            <View>
                              {inlinePowerModal === 'rhino_charge' && inlinePowerData.challengeScores && inlinePowerData.challengeScores.length > 0 ? (
                                inlinePowerData.challengeScores.map((cs, i) => (
                                  <View key={i} style={{ marginBottom: wp(8), backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(8), padding: wp(8) }}>
                                    <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>{cs.challenge_title}</Text>
                                    <View style={{ flexDirection: 'row', gap: wp(10), marginTop: wp(4) }}>
                                      <Text style={{ fontSize: fp(10), color: '#D4AF37' }}>#{cs.group_rank || '—'}</Text>
                                      <Text style={{ fontSize: fp(10), color: '#00D984' }}>{cs.personal_score || 0} pts</Text>
                                      <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)' }}>{cs.days_remaining || 0}j restants</Text>
                                    </View>
                                  </View>
                                ))
                              ) : null}
                              {inlinePowerData.activities && inlinePowerData.activities.length > 0 ? (
                                <View>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(6) }}>
                                    <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)' }}>Séances : {inlinePowerData.activities.length}</Text>
                                    <Text style={{ fontSize: fp(10), color: '#FF8C42', fontWeight: '700' }}>{inlinePowerData.activities.reduce((s, a) => s + (a.calories_burned || 0), 0)} kcal brûlées</Text>
                                  </View>
                                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)' }}>Durée totale : {inlinePowerData.activities.reduce((s, a) => s + (a.duration_minutes || 0), 0)} min</Text>
                                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>
                                    OMS : {Math.round(inlinePowerData.activities.reduce((s, a) => s + (a.duration_minutes || 0), 0) / 150 * 100)}% de l'objectif hebdo
                                  </Text>
                                </View>
                              ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)' }}>Aucune activité cette semaine</Text>}
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucune donnée</Text>}
                        </View>
                      )}

                      {(inlinePowerModal === 'dolphin_smart_hydration' || inlinePowerModal === 'dolphin_tracker') && (
                        <View style={{ backgroundColor: 'rgba(255,107,129,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(255,107,129,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🐬 Hydratation — {inlinePowerData?.rangeDays || 7} jours</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#FF6B81" style={{ marginVertical: wp(20) }} /> : inlinePowerData && inlinePowerData.hydrationLogs && inlinePowerData.hydrationLogs.length > 0 ? (
                            <View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(8) }}>
                                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)' }}>{inlinePowerData.hydrationLogs.length} entrées</Text>
                                <Text style={{ fontSize: fp(10), color: '#4DA6FF', fontWeight: '700' }}>
                                  {inlinePowerData.hydrationLogs.reduce((s, h) => s + (h.effective_ml || 0), 0)} ml effectifs
                                </Text>
                              </View>
                              {(() => {
                                const beverages = {};
                                (inlinePowerData.hydrationLogs || []).forEach(h => {
                                  const name = h.beverage_name || h.beverage_type || 'Eau';
                                  if (!beverages[name]) beverages[name] = { count: 0, totalMl: 0, coeff: h.hydration_coeff || 1 };
                                  beverages[name].count++;
                                  beverages[name].totalMl += h.effective_ml || 0;
                                });
                                return Object.entries(beverages).sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([name, data], i) => (
                                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(4), paddingVertical: wp(3) }}>
                                    <Text style={{ fontSize: fp(11), color: '#FFF', flex: 1 }}>{name}</Text>
                                    <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginRight: wp(8) }}>×{data.count}</Text>
                                    <Text style={{ fontSize: fp(10), color: data.coeff >= 0.9 ? '#00D984' : data.coeff >= 0.5 ? '#FF8C42' : '#FF6B6B', fontWeight: '600' }}>
                                      {data.totalMl}ml (×{data.coeff})
                                    </Text>
                                  </View>
                                ));
                              })()}
                              {inlinePowerData.hydrationLogs.some(h => (h.sugar_g || 0) > 0) && (
                                <View style={{ backgroundColor: 'rgba(255,140,66,0.1)', borderRadius: wp(8), padding: wp(8), marginTop: wp(8) }}>
                                  <Text style={{ fontSize: fp(9), color: '#FF8C42' }}>
                                    ⚠️ Sucre total boissons : {Math.round(inlinePowerData.hydrationLogs.reduce((s, h) => s + (h.sugar_g || 0), 0))}g
                                  </Text>
                                </View>
                              )}
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucune donnée d'hydratation</Text>}
                        </View>
                      )}

                      {inlinePowerModal === 'licornium_analyse' && (
                        <View style={{ backgroundColor: 'rgba(179,136,255,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(179,136,255,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🦄 Score Nutritionnel</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#B388FF" style={{ marginVertical: wp(20) }} /> : inlinePowerData && inlinePowerData.weekData && inlinePowerData.weekData.length > 0 ? (
                            <View>
                              {(() => {
                                const w = inlinePowerData.weekData;
                                const daysInRange = w.filter(s => s.calorie_target > 0 && Math.abs(s.calorie_balance) <= s.calorie_target * 0.15).length;
                                const avgProtein = Math.round(w.reduce((s, d) => s + (d.total_protein || 0), 0) / w.length);
                                const avgCarbs = Math.round(w.reduce((s, d) => s + (d.total_carbs || 0), 0) / w.length);
                                const avgFat = Math.round(w.reduce((s, d) => s + (d.total_fat || 0), 0) / w.length);
                                const avgFiber = Math.round(w.reduce((s, d) => s + (d.total_fiber || 0), 0) / w.length);
                                const score = Math.min(100, Math.round((daysInRange / Math.max(w.length, 1)) * 40 + (avgFiber >= 20 ? 20 : avgFiber) + (avgProtein >= 50 ? 20 : Math.round(avgProtein / 50 * 20)) + 20));
                                const scoreColor = score >= 75 ? '#00D984' : score >= 50 ? '#FF8C42' : '#FF6B6B';
                                return (
                                  <View>
                                    <View style={{ alignItems: 'center', marginBottom: wp(12) }}>
                                      <Text style={{ fontSize: fp(36), fontWeight: '800', color: scoreColor }}>{score}</Text>
                                      <Text style={{ fontSize: fp(10), color: scoreColor }}>/100 — {score >= 75 ? 'Excellent' : score >= 50 ? 'Bon' : 'À améliorer'}</Text>
                                    </View>
                                    <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)', marginBottom: wp(4) }}>Moyennes quotidiennes (7j)</Text>
                                    {[
                                      { label: 'Protéines', val: avgProtein + 'g', ok: avgProtein >= 50, ideal: '≥50g' },
                                      { label: 'Glucides', val: avgCarbs + 'g', ok: avgCarbs <= 300, ideal: '≤300g' },
                                      { label: 'Lipides', val: avgFat + 'g', ok: avgFat <= 80, ideal: '≤80g' },
                                      { label: 'Fibres', val: avgFiber + 'g', ok: avgFiber >= 20, ideal: '≥20g' },
                                    ].map((m, i) => (
                                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(4) }}>
                                        <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)', flex: 1 }}>{m.label}</Text>
                                        <Text style={{ fontSize: fp(11), fontWeight: '700', color: m.ok ? '#00D984' : '#FF8C42', marginRight: wp(8) }}>{m.val}</Text>
                                        <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.25)' }}>{m.ideal}</Text>
                                      </View>
                                    ))}
                                    <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)', marginTop: wp(6) }}>Jours équilibrés : {daysInRange}/{w.length}</Text>
                                  </View>
                                );
                              })()}
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Pas assez de données</Text>}
                        </View>
                      )}

                      {inlinePowerModal === 'jaane_venin' && (
                        <View style={{ backgroundColor: 'rgba(255,99,72,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(255,99,72,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🐍 Analyse Activité — 30 jours</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#FF6348" style={{ marginVertical: wp(20) }} /> : inlinePowerData && inlinePowerData.monthActivities && inlinePowerData.monthActivities.length > 0 ? (
                            <View>
                              {(() => {
                                const acts = inlinePowerData.monthActivities;
                                const totalMin = acts.reduce((s, a) => s + (a.duration_minutes || 0), 0);
                                const totalKcal = acts.reduce((s, a) => s + (a.calories_burned || 0), 0);
                                const uniqueDays = [...new Set(acts.map(a => a.date))].length;
                                const weeklyAvg = Math.round(totalMin / 4);
                                const omsPct = Math.round((weeklyAvg / 150) * 100);
                                const types = {};
                                acts.forEach(a => { const t = a.type || a.name || 'Autre'; types[t] = (types[t] || 0) + 1; });
                                return (
                                  <View>
                                    <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(12) }}>
                                      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(8), padding: wp(8), alignItems: 'center' }}>
                                        <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FF6348' }}>{acts.length}</Text>
                                        <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.3)' }}>séances</Text>
                                      </View>
                                      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(8), padding: wp(8), alignItems: 'center' }}>
                                        <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FF8C42' }}>{totalMin}</Text>
                                        <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.3)' }}>minutes</Text>
                                      </View>
                                      <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(8), padding: wp(8), alignItems: 'center' }}>
                                        <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#D4AF37' }}>{totalKcal}</Text>
                                        <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.3)' }}>kcal</Text>
                                      </View>
                                    </View>
                                    <View style={{ marginBottom: wp(8) }}>
                                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(3) }}>
                                        <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)' }}>OMS hebdo ({weeklyAvg} min/sem)</Text>
                                        <Text style={{ fontSize: fp(10), fontWeight: '700', color: omsPct >= 100 ? '#00D984' : '#FF8C42' }}>{omsPct}%</Text>
                                      </View>
                                      <View style={{ height: wp(5), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2.5), overflow: 'hidden' }}>
                                        <View style={{ height: '100%', width: Math.min(100, omsPct) + '%', backgroundColor: omsPct >= 100 ? '#00D984' : '#FF8C42', borderRadius: wp(2.5) }} />
                                      </View>
                                    </View>
                                    <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.4)' }}>
                                      Types : {Object.entries(types).map(([t, c]) => t + ' (×' + c + ')').join(', ')}
                                    </Text>
                                    <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)', marginTop: wp(2) }}>Jours actifs : {uniqueDays}/30</Text>
                                  </View>
                                );
                              })()}
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucune activité ce mois</Text>}
                        </View>
                      )}

                      {(inlinePowerModal === 'simba_rugissement' || inlinePowerModal === 'simba_territoire' || inlinePowerModal === 'simba_roi') && (
                        <View style={{ backgroundColor: 'rgba(0,206,201,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(0,206,201,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🦁 Rapport Santé — 7 jours</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#00CEC9" style={{ marginVertical: wp(20) }} /> : inlinePowerData ? (
                            <View>
                              {[
                                { label: '🍽️ Nutrition', val: (inlinePowerData.summaries || []).length + ' jours loggés', detail: 'Moy. ' + Math.round((inlinePowerData.summaries || []).reduce((s, d) => s + (d.total_calories || 0), 0) / Math.max((inlinePowerData.summaries || []).length, 1)) + ' kcal/j', color: '#00D984' },
                                { label: '🏃 Activité', val: (inlinePowerData.activities || []).length + ' séances', detail: Math.round((inlinePowerData.activities || []).reduce((s, a) => s + (a.duration_minutes || 0), 0)) + ' min totales', color: '#FF8C42' },
                                { label: '😊 Humeur', val: (inlinePowerData.moods || []).length + ' entrées', detail: (() => { const m = inlinePowerData.moods || []; const top = {}; m.forEach(x => { top[x.mood_level] = (top[x.mood_level] || 0) + 1; }); const best = Object.entries(top).sort((a,b) => b[1]-a[1])[0]; return best ? 'Dominant : ' + best[0] : '—'; })(), color: '#9B6DFF' },
                                { label: '💧 Hydratation', val: Math.round((inlinePowerData.hydration || []).reduce((s, h) => s + (h.effective_ml || 0), 0) / 1000 * 10) / 10 + 'L total', detail: 'Moy. ' + Math.round((inlinePowerData.hydration || []).reduce((s, h) => s + (h.effective_ml || 0), 0) / 7) + 'ml/j', color: '#4DA6FF' },
                              ].map((cat, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8), backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(8), padding: wp(8) }}>
                                  <Text style={{ fontSize: fp(12), marginRight: wp(8) }}>{cat.label.split(' ')[0]}</Text>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>{cat.val}</Text>
                                    <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.35)' }}>{cat.detail}</Text>
                                  </View>
                                  <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: cat.color }} />
                                </View>
                              ))}
                              <View style={{ backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(8), padding: wp(8), marginTop: wp(4), borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' }}>
                                <Text style={{ fontSize: fp(9), color: '#D4AF37', textAlign: 'center' }}>📄 Export PDF bientôt disponible</Text>
                              </View>
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucune donnée</Text>}
                        </View>
                      )}

                      {inlinePowerModal === 'mosquito_piqure_nutrition' && (
                        <View style={{ backgroundColor: 'rgba(123,237,159,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(123,237,159,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🦟 Piqûre Nutrition</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#7BED9F" style={{ marginVertical: wp(20) }} /> : inlinePowerData ? (
                            <View>
                              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginBottom: wp(6) }}>Dernier scan : {inlinePowerData.food_name}</Text>
                              {[
                                { label: 'Protéines', val: inlinePowerData.protein_g, color: '#FF6B6B' },
                                { label: 'Glucides', val: inlinePowerData.carbs_g, color: '#4DA6FF' },
                                { label: 'Lipides', val: inlinePowerData.fat_g, color: '#D4AF37' },
                              ].map((m, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.5)' }}>{m.label}</Text>
                                  <Text style={{ fontSize: fp(11), fontWeight: '700', color: m.color }}>{Math.round(m.val || 0)}g</Text>
                                </View>
                              ))}
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Scanne un repas pour utiliser cette piqûre</Text>}
                        </View>
                      )}

                      {inlinePowerModal === 'mosquito_piqure_activite' && (
                        <View style={{ backgroundColor: 'rgba(123,237,159,0.08)', borderRadius: wp(14), padding: wp(16), marginTop: wp(8), borderWidth: 1, borderColor: 'rgba(123,237,159,0.2)', maxHeight: wp(300), overflow: 'hidden' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>🦟 Piqûre Activité</Text>
                          {inlinePowerLoading ? <ActivityIndicator color="#7BED9F" style={{ marginVertical: wp(20) }} /> : inlinePowerData && inlinePowerData.activities && inlinePowerData.activities.length > 0 ? (
                            <View>
                              {inlinePowerData.activities.slice(0, 5).map((a, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                                  <Text style={{ fontSize: fp(11), color: '#FFF' }}>{a.name || a.type}</Text>
                                  <Text style={{ fontSize: fp(10), color: '#FF8C42' }}>{a.duration_minutes}min · {a.calories_burned}kcal</Text>
                                </View>
                              ))}
                              <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)', marginTop: wp(6) }}>
                                Total : {inlinePowerData.activities.reduce((s, a) => s + (a.duration_minutes || 0), 0)} min · {inlinePowerData.activities.reduce((s, a) => s + (a.calories_burned || 0), 0)} kcal
                              </Text>
                            </View>
                          ) : <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingVertical: wp(16) }}>Aucune activité récente</Text>}
                        </View>
                      )}

                      <Pressable onPress={() => { onFlipCard(); setInlinePowerModal(null); }} style={{ paddingVertical: wp(16), alignItems: 'center', marginTop: wp(8) }}>
                        <View style={{ paddingVertical: wp(10), paddingHorizontal: wp(30), borderRadius: wp(10), backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>↩ Retourner</Text>
                        </View>
                      </Pressable>

                      <Pressable onPress={closeCharModal} style={{ paddingVertical: wp(12), alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)' }}>Fermer</Text>
                      </Pressable>
                    </ScrollView>
                  </LinearGradient>
                </Animated.View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
