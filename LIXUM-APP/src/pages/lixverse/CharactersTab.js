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
                  </View>
                </Animated.View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
