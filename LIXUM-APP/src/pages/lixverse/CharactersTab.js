import React from 'react';
import { View, Text, ScrollView, Pressable, Animated,
  Image, Modal, ActivityIndicator, Easing, Dimensions } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ALL_CHARACTERS, TIER_CONFIG, CHAR_NAMES, FRAGS_NIV1,
  CHARACTER_IMAGES, TEST_USER_ID, SUPABASE_URL,
  HEADERS, POST_HEADERS, getCharImage
} from './lixverseConstants';
import { LixGem } from './lixverseComponents';
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
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
                                          fetch(SUPABASE_URL + '/rest/v1/users_profile?user_id=eq.' + TEST_USER_ID, {
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

                                  default:
                                    return (
                                      <Text style={{ color: '#555E6C', fontSize: fp(8), textAlign: 'center' }}>
                                        Action non implémentée
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
