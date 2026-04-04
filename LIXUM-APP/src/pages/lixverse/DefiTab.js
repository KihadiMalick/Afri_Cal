import React from 'react';
import { View, Text, ScrollView, Pressable, Animated,
  Image, ActivityIndicator } from 'react-native';
import Svg, { Circle, Line, Rect, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LixGem, MedalIcon, TrophyIcon, MysteryCardIcon,
  FragmentIcon, ChevronDown
} from './lixverseComponents';
import { wp, fp } from '../../constants/layout';

export default function DefiTab({
  challenges,
  challengeScores,
  loading,
  myGroups,
  wallStickers,
  floatingHearts,
  comboCount,
  strikeActive,
  stickerShakeAnims,
  myCertification,
  leaderboardTab,
  setLeaderboardTab,
  leaderboardExpanded,
  setLeaderboardExpanded,
  leaderboardData,
  leaderboardLoading,
  individualLB,
  countryLB,
  lbTabLoading,
  challengeLeaders,
  expandedRewards,
  setExpandedRewards,
  eligibilityChecking,
  pendingRequests,
  showLixAlert,
  onOpenGroupDetail,
  onCopyInviteCode,
  onSetShowCertificationModal,
  onSetShowSearchGroup,
  onSetShowPendingRequests,
  onCheckEligibilityAndProceed,
  onHandleStickerTap,
  onSetSelectedSticker,
  onSetShowGiftModal,
  onFetchIndividualLB,
  onFetchCountryLB,
  leaderboardChallengeId,
}) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100) }}>
      <View style={{ marginBottom: wp(16) }}>
        <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#D4AF37', letterSpacing: 1 }}>WALL OF HEALTH</Text>
          {myCertification && myCertification.is_certified && !myCertification.has_sticker && (
            <Pressable delayPressIn={120} onPress={() => onSetShowCertificationModal(true)}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: wp(4),
                backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(8),
                paddingHorizontal: wp(8), paddingVertical: wp(4),
                borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}>
              <Text style={{ fontSize: fp(12) }}>❓</Text>
              <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37' }}>BADGE</Text>
            </Pressable>
          )}
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.3)' }}>{Math.min(wallStickers.length, 9)}/9</Text>
        </View>
        <View style={{
          marginHorizontal: wp(8), borderRadius: wp(16), overflow: 'hidden',
          borderWidth: 2, borderColor: '#8B7A2E',
          shadowColor: '#D4AF37',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 14,
          elevation: 8,
        }}>
          <LinearGradient colors={['#3A3F46', '#2D3238', '#3A3F46', '#333840']}
            style={{ minHeight: wp(280), padding: wp(12), position: 'relative' }}>
            {[
              { top: wp(6), left: wp(6), borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: wp(4) },
              { top: wp(6), right: wp(6), borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: wp(4) },
              { bottom: wp(6), left: wp(6), borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: wp(4) },
              { bottom: wp(6), right: wp(6), borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: wp(4) },
            ].map((cornerStyle, i) => (
              <View key={i} style={{
                position: 'absolute', zIndex: 10,
                width: wp(20), height: wp(20),
                borderColor: '#8B7A2E',
                ...cornerStyle,
              }} />
            ))}
            <View style={{ alignItems: 'center', marginBottom: wp(4), paddingTop: wp(0) }}>
              <Image
                source={require('../../assets/wall-of-health-title.webp')}
                style={{
                  width: wp(300),
                  height: wp(60),
                }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(8), marginBottom: wp(8) }}>
              <View style={{
                backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(8),
                paddingHorizontal: wp(10), paddingVertical: wp(3),
                borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)',
              }}>
                <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#D4AF37', letterSpacing: 1 }}>
                  {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </Text>
              </View>
              <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.25)' }}>
                {Math.max(0, 9 - wallStickers.length)}/9 places restantes
              </Text>
            </View>
            {wallStickers.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: wp(30) }}>
                <Text style={{ fontSize: fp(32), marginBottom: wp(8) }}>🏆</Text>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: 'rgba(255,255,255,0.25)', marginBottom: wp(4) }}>
                  Le mur attend ses héros du mois
                </Text>
                <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.15)', textAlign: 'center', paddingHorizontal: wp(20) }}>
                  9 places — seuls les profils certifiés par l'algorithme anti-triche peuvent être affichés
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: wp(6), paddingBottom: wp(8), paddingHorizontal: wp(4) }}>
                {wallStickers.slice(0, 9).map((sticker, i) => {
                  const id = sticker.id;
                  const hearts = floatingHearts.filter(h => h.stickerId === id);
                  const combo = comboCount[id] || 0;
                  const isStrike = strikeActive[id] || false;
                  const shakeAnim = stickerShakeAnims[id];
                  const cardBg = isStrike
                    ? 'rgba(212,175,55,0.35)'
                    : combo >= 3
                      ? 'rgba(0,217,132,0.22)'
                      : 'rgba(45,50,56,0.85)';
                  const cardBorder = isStrike
                    ? 'rgba(212,175,55,0.7)'
                    : combo >= 3
                      ? 'rgba(0,217,132,0.4)'
                      : 'rgba(255,255,255,0.2)';
                  const glowColor = isStrike ? '#D4AF37' : '#00D984';
                  return (
                    <Animated.View key={id || i} style={{
                      width: wp(85), alignItems: 'center', padding: wp(6),
                      transform: [
                        { rotate: (sticker.rotation || (i % 2 === 0 ? -5 : 5)) + 'deg' },
                        { translateX: shakeAnim || 0 },
                      ],
                    }}>
                      {hearts.map(h => (
                        <Text key={h.id} style={{
                          position: 'absolute', top: -wp(12), left: wp(30) + (h.x || 0),
                          fontSize: fp(combo >= 5 ? 18 : 14), zIndex: 20, opacity: 0.9,
                        }}>{h.emoji || '🩶'}</Text>
                      ))}
                      {combo >= 3 && (
                        <View style={{
                          position: 'absolute', top: -wp(6), right: wp(2), zIndex: 30,
                          backgroundColor: isStrike ? '#D4AF37' : '#00D984',
                          borderRadius: wp(8), paddingHorizontal: wp(5), paddingVertical: wp(1),
                        }}>
                          <Text style={{ fontSize: fp(8), fontWeight: '800', color: isStrike ? '#1A1D22' : '#FFF' }}>
                            x{combo}
                          </Text>
                        </View>
                      )}
                      <View style={{
                        width: wp(24), height: wp(10), borderTopLeftRadius: wp(5), borderTopRightRadius: wp(5),
                        borderBottomLeftRadius: wp(2), borderBottomRightRadius: wp(2),
                        marginBottom: wp(-4), zIndex: 2,
                        borderWidth: 1.5,
                        borderColor: isStrike ? '#D4AF37' : 'rgba(212,175,55,0.5)',
                        backgroundColor: isStrike ? 'rgba(212,175,55,0.35)' : 'rgba(212,175,55,0.15)',
                        shadowColor: '#D4AF37',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isStrike ? 0.5 : 0.2,
                        shadowRadius: 3,
                        elevation: 2,
                      }}>
                        <View style={{
                          position: 'absolute', top: wp(1.5), left: wp(4), right: wp(4),
                          height: wp(2), borderRadius: wp(1),
                          backgroundColor: 'rgba(255,255,255,0.2)',
                        }} />
                      </View>
                      <Pressable
                        onPress={() => onHandleStickerTap(sticker)}
                        delayPressIn={0}
                        style={({ pressed }) => ({
                          backgroundColor: cardBg,
                          borderRadius: wp(12),
                          padding: wp(8), alignItems: 'center', width: '100%',
                          borderWidth: 1.5, borderColor: cardBorder,
                          transform: [{ scale: pressed ? 0.92 : 1 }],
                          ...(isStrike ? {
                            shadowColor: glowColor,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.6,
                            shadowRadius: wp(8),
                            elevation: 8,
                          } : {}),
                        })}
                      >
                        <Text style={{ fontSize: fp(24) }}>{sticker.sticker_emoji}</Text>
                        <Text style={{
                          fontSize: fp(8), fontWeight: '700',
                          color: isStrike ? '#D4AF37' : '#FFF',
                          marginTop: wp(3),
                        }} numberOfLines={1}>
                          {sticker.display_name}
                        </Text>
                        <Text style={{
                          fontSize: fp(6),
                          color: isStrike ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.4)',
                          marginTop: wp(1), fontStyle: 'italic',
                        }} numberOfLines={1}>
                          {sticker.message}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(6), marginTop: wp(4), width: '100%' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                            <Text style={{ fontSize: fp(10) }}>{isStrike ? '💛' : '🩶'}</Text>
                            <Text numberOfLines={1} style={{
                              fontSize: fp(8), fontWeight: isStrike ? '700' : '400',
                              color: isStrike ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                              maxWidth: wp(28),
                            }}>
                              {(sticker.like_count || 0) >= 1000
                                ? ((sticker.like_count || 0) / 1000).toFixed(1) + 'K'
                                : (sticker.like_count || 0)}
                            </Text>
                          </View>
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation && e.stopPropagation();
                              onSetSelectedSticker(sticker);
                              onSetShowGiftModal(true);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={({ pressed }) => ({ transform: [{ scale: pressed ? 1.3 : 1 }] })}
                          >
                            <Text style={{ fontSize: fp(10) }}>🎁</Text>
                          </Pressable>
                          {sticker.lix_received > 0 && (
                            <Text numberOfLines={1} style={{ fontSize: fp(6), color: 'rgba(212,175,55,0.5)', maxWidth: wp(22) }}>{sticker.lix_received}L</Text>
                          )}
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
                {wallStickers.length >= 9 && (
                  <View style={{ width: '100%', alignItems: 'center', paddingTop: wp(8) }}>
                    <Text style={{ fontSize: fp(9), color: 'rgba(212,175,55,0.35)', fontStyle: 'italic' }}>
                      Mur complet — prochain renouvellement le 1er du mois
                    </Text>
                  </View>
                )}
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}
