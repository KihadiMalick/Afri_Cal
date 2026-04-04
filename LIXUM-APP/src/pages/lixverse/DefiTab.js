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

      <View style={{ paddingHorizontal: wp(16), marginBottom: wp(12) }}>
        <View style={{ flexDirection: 'row', gap: wp(8) }}>
          <Pressable onPress={() => onSetShowSearchGroup(true)} delayPressIn={120}
            style={({ pressed }) => ({
              flex: 1, flexDirection: 'row', alignItems: 'center', gap: wp(8),
              backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
              paddingHorizontal: wp(12), paddingVertical: wp(10),
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Circle cx="11" cy="11" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
            </Svg>
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.25)' }}>Rechercher une équipe...</Text>
          </Pressable>

          {pendingRequests.length > 0 && (
            <Pressable onPress={() => onSetShowPendingRequests(true)} delayPressIn={120}
              style={({ pressed }) => ({
                width: wp(44), height: wp(44), borderRadius: wp(12),
                backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
                justifyContent: 'center', alignItems: 'center',
                transform: [{ scale: pressed ? 0.9 : 1 }],
              })}>
              <Text style={{ fontSize: fp(16) }}>📩</Text>
              <View style={{
                position: 'absolute', top: -wp(4), right: -wp(4),
                minWidth: wp(16), height: wp(16), borderRadius: wp(8),
                backgroundColor: '#FF3B5C', justifyContent: 'center', alignItems: 'center',
                paddingHorizontal: wp(3), borderWidth: 1.5, borderColor: '#1A1D22',
              }}>
                <Text style={{ fontSize: fp(8), fontWeight: '800', color: '#FFF' }}>{pendingRequests.length}</Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>

      {myGroups.length > 0 && (
        <View style={{ paddingHorizontal: wp(16), marginBottom: wp(8) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Mes équipes</Text>
          {myGroups.map((gm, i) => {
            const g = gm.lixverse_groups; if (!g) return null;
            const score = challengeScores.find(s => s.challenge_id === g.challenge_id);
            return (
              <Pressable key={i} onPress={() => onOpenGroupDetail(gm)} delayPressIn={120}
                style={({ pressed }) => ({
                  backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14), marginBottom: wp(8),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                  borderLeftWidth: wp(3), borderLeftColor: '#D4AF37',
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{g.name}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>{g.member_count} membres | Score: {score?.group_total || g.total_score}</Text></View>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.1)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}><Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>Mon: {score?.personal_score || gm.personal_score || 0}</Text></View>
                </View>
                {score && (
                  <View style={{ flexDirection: 'row', gap: wp(8), marginTop: wp(6) }}>
                    <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>Rang: {score.group_rank || '-'}</Text>
                    <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>Aujourd'hui: +{score.today_points || 0} pts</Text>
                    {score.days_remaining > 0 && <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)' }}>{score.days_remaining}j restants</Text>}
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(8), backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4) }}>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)' }}>Code: </Text>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#D4AF37', letterSpacing: 1, flex: 1 }}>{g.invite_code}</Text>
                  <Pressable onPress={() => onCopyInviteCode(g.invite_code)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.85 : 1 }], padding: wp(4) })}>
                    <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                      <Rect x="9" y="9" width="13" height="13" rx="2" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" />
                      <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" />
                    </Svg>
                  </Pressable>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={{ paddingHorizontal: wp(16), marginBottom: wp(16) }}>
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: wp(14) }} />
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Défis du mois</Text>
        {loading ? <ActivityIndicator color="#D4AF37" style={{ padding: wp(20) }} /> : challenges.map(ch => {
          const dl = new Date(ch.registration_deadline);
          const hLeft = Math.max(0, Math.ceil((dl - new Date()) / 3600000));
          const dLeft = Math.floor(hLeft / 24);
          const isOpen = hLeft > 0;
          const isUrgent = hLeft > 0 && hLeft <= 24;
          const score = challengeScores.find(s => s.challenge_id === ch.id);
          const daysPassed = Math.max(0, Math.min(Math.ceil((new Date() - new Date(ch.start_date || ch.created_at)) / 86400000), ch.duration_days || 30));
          const progressPct = Math.max(0, Math.min(100, Math.round((daysPassed / (ch.duration_days || 30)) * 100)));
          return (
            <View key={ch.id} style={{ borderRadius: wp(16), marginBottom: wp(10), borderWidth: 1.5, borderColor: ch.color + '40', overflow: 'hidden' }}>
              <LinearGradient colors={['#2A2F36', '#1E2328']} style={{ padding: wp(16), borderRadius: wp(14) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(24), marginRight: wp(10) }}>{ch.icon}</Text>
                  <View style={{ flex: 1 }}><Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>{ch.title}</Text><Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{ch.duration_days}j | Max {ch.max_group_size}/équipe</Text></View>
                  <View style={{
                    backgroundColor: isOpen
                      ? (isUrgent ? 'rgba(255,107,107,0.15)' : 'rgba(0,217,132,0.12)')
                      : 'rgba(255,140,66,0.1)',
                    borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3),
                    borderWidth: 1,
                    borderColor: isOpen
                      ? (isUrgent ? 'rgba(255,107,107,0.25)' : 'rgba(0,217,132,0.2)')
                      : 'rgba(255,140,66,0.2)',
                  }}>
                    <Text style={{
                      fontSize: fp(9), fontWeight: '700',
                      color: isOpen
                        ? (isUrgent ? '#FF6B6B' : '#00D984')
                        : '#FF8C42',
                    }}>
                      {isOpen
                        ? (isUrgent ? hLeft + 'h restantes' : dLeft + 'j restants')
                        : 'Terminé'}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginBottom: wp(8) }}>{ch.description}</Text>
                <View style={{ marginBottom: wp(10), marginTop: wp(4) }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                    <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>
                      Jour {daysPassed}/{ch.duration_days || 30}{score ? '  ·  ' + (score.personal_score || 0) + ' pts' : ''}
                    </Text>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: ch.color || '#00D984' }}>
                      {score ? (score.group_rank ? '#' + score.group_rank + '  ' : '') + (score.today_points ? '+' + score.today_points + ' auj.' : '') : progressPct + '%'}
                    </Text>
                  </View>
                  <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), overflow: 'hidden' }}>
                    <View style={{
                      height: '100%', borderRadius: wp(2),
                      backgroundColor: ch.color || '#00D984',
                      width: Math.round(progressPct) + '%',
                      opacity: 0.85,
                      shadowColor: ch.color || '#00D984',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.5,
                      shadowRadius: wp(4),
                      elevation: 2,
                    }} />
                  </View>
                </View>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12), padding: wp(10), marginTop: wp(10), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  {[1, 2, 3].map(pos => {
                    const leaders = challengeLeaders[ch.id] || [];
                    const leader = leaders.find(l => l.rank === pos);
                    const posColors = { 1: '#D4AF37', 2: '#C0C0C0', 3: '#CD7F32' };
                    return (
                      <View key={pos} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(6), borderBottomWidth: pos < 3 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                        <MedalIcon rank={pos} size={wp(22)} />
                        <View style={{ flex: 1, marginLeft: wp(8) }}>
                          <Text style={{ fontSize: fp(11), fontWeight: '700', color: posColors[pos] }}>
                            {leader ? leader.name : ''}
                          </Text>
                          {leader && <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.25)', marginTop: wp(1) }}>{leader.total_score} pts</Text>}
                          {!leader && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                              <View style={{ width: wp(16), height: wp(16), borderRadius: wp(8), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.1)' }}>?</Text>
                              </View>
                              <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.15)', fontStyle: 'italic' }}>Place à prendre</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}

                  <Pressable
                    onPress={() => setExpandedRewards(prev => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                    style={({ pressed }) => ({
                      flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
                      paddingVertical: wp(8), marginTop: wp(4),
                      borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <TrophyIcon size={wp(14)} color="rgba(212,175,55,0.6)" />
                    <Text style={{ fontSize: fp(10), color: 'rgba(212,175,55,0.6)', marginLeft: wp(6), marginRight: wp(4) }}>
                      {expandedRewards[ch.id] ? 'Masquer les récompenses' : 'Voir les récompenses'}
                    </Text>
                    <ChevronDown size={wp(12)} color="rgba(212,175,55,0.6)" rotated={expandedRewards[ch.id]} />
                  </Pressable>

                  {expandedRewards[ch.id] && (
                    <View style={{ paddingTop: wp(6) }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(7), paddingHorizontal: wp(4) }}>
                        <MedalIcon rank={1} size={wp(18)} />
                        <View style={{ flex: 1, marginLeft: wp(8) }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: wp(4) }}>
                            <FragmentIcon size={wp(12)} color="#E040FB" />
                            <Text style={{ fontSize: fp(9), color: '#E040FB', fontWeight: '700' }}>1 frag Mythique</Text>
                            <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.2)' }}>+</Text>
                            <MysteryCardIcon size={wp(11)} color="#4FC3F7" />
                            <Text style={{ fontSize: fp(9), color: '#4FC3F7', fontWeight: '700' }}>1 carte Rare</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <LixGem size={wp(10)} />
                            <Text style={{ fontSize: fp(9), color: '#D4AF37', fontWeight: '700', marginLeft: wp(2) }}>{ch.reward_lix_first || 5000}</Text>
                          </View>
                          <Text style={{ fontSize: fp(9), color: '#7BED9F', fontWeight: '600' }}>⚡{ch.reward_energy_first || 100}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(7), paddingHorizontal: wp(4), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)' }}>
                        <MedalIcon rank={2} size={wp(18)} />
                        <View style={{ flex: 1, marginLeft: wp(8) }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: wp(4) }}>
                            <FragmentIcon size={wp(12)} color="#B388FF" />
                            <Text style={{ fontSize: fp(9), color: '#B388FF', fontWeight: '700' }}>1 frag Elite</Text>
                            <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.2)' }}>+</Text>
                            <MysteryCardIcon size={wp(11)} color="#66BB6A" />
                            <Text style={{ fontSize: fp(9), color: '#66BB6A', fontWeight: '700' }}>1 carte Standard</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <LixGem size={wp(10)} />
                            <Text style={{ fontSize: fp(9), color: '#D4AF37', fontWeight: '700', marginLeft: wp(2) }}>{ch.reward_lix_second || 3000}</Text>
                          </View>
                          <Text style={{ fontSize: fp(9), color: '#7BED9F', fontWeight: '600' }}>⚡{ch.reward_energy_second || 60}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(7), paddingHorizontal: wp(4), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)' }}>
                        <MedalIcon rank={3} size={wp(18)} />
                        <View style={{ flex: 1, marginLeft: wp(8) }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: wp(4) }}>
                            <FragmentIcon size={wp(12)} color="#4FC3F7" />
                            <Text style={{ fontSize: fp(9), color: '#4FC3F7', fontWeight: '700' }}>2 frags Rare</Text>
                            <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.2)' }}>+</Text>
                            <MysteryCardIcon size={wp(11)} color="#66BB6A" />
                            <Text style={{ fontSize: fp(9), color: '#66BB6A', fontWeight: '700' }}>1 carte Standard</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <LixGem size={wp(10)} />
                            <Text style={{ fontSize: fp(9), color: '#D4AF37', fontWeight: '700', marginLeft: wp(2) }}>{ch.reward_lix_third || 1500}</Text>
                          </View>
                          <Text style={{ fontSize: fp(9), color: '#7BED9F', fontWeight: '600' }}>⚡{ch.reward_energy_third || 40}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(6), paddingHorizontal: wp(4), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.03)' }}>
                        <View style={{ width: wp(18), height: wp(18), borderRadius: wp(9), backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: fp(7), color: 'rgba(255,255,255,0.25)', fontWeight: '700' }}>4-10</Text>
                        </View>
                        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.25)', marginLeft: wp(8) }}>Lix + Énergie selon le rang</Text>
                      </View>
                    </View>
                  )}
                </View>
                <View style={{ marginTop: wp(10), flexDirection: 'row', gap: wp(8) }}>
                  <Pressable
                    onPress={() => {
                      if (!isOpen) {
                        showLixAlert('⏳ Défi terminé', 'Ce défi est terminé. Les inscriptions sont closes.\nRendez-vous le mois prochain !', [{ text: 'OK', style: 'cancel' }], '⏳');
                        return;
                      }
                      onCheckEligibilityAndProceed(ch, 'create');
                    }}
                    disabled={eligibilityChecking}
                    delayPressIn={120}
                    style={({ pressed }) => ({
                      flex: 1, paddingVertical: wp(11), borderRadius: wp(12), alignItems: 'center',
                      backgroundColor: isOpen ? (ch.color || '#D4AF37') + '20' : 'rgba(255,255,255,0.03)',
                      borderWidth: 1.5, borderColor: isOpen ? (ch.color || '#D4AF37') + '50' : 'rgba(255,255,255,0.06)',
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                      opacity: eligibilityChecking ? 0.5 : (isOpen ? 1 : 0.5),
                    })}
                  >
                    <Text style={{ fontSize: fp(11), fontWeight: '700', color: isOpen ? (ch.color || '#D4AF37') : 'rgba(255,255,255,0.2)' }}>Créer une équipe</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (!isOpen) {
                        showLixAlert('⏳ Défi terminé', 'Ce défi est terminé. Les inscriptions sont closes.\nRendez-vous le mois prochain !', [{ text: 'OK', style: 'cancel' }], '⏳');
                        return;
                      }
                      onCheckEligibilityAndProceed(ch, 'join');
                    }}
                    disabled={eligibilityChecking}
                    delayPressIn={120}
                    style={({ pressed }) => ({
                      flex: 1, paddingVertical: wp(11), borderRadius: wp(12), alignItems: 'center',
                      backgroundColor: isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                      borderWidth: 1, borderColor: isOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                      opacity: eligibilityChecking ? 0.5 : (isOpen ? 1 : 0.5),
                    })}
                  >
                    <Text style={{ fontSize: fp(11), fontWeight: '600', color: isOpen ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)' }}>Rejoindre</Text>
                  </Pressable>
                </View>
                {!isOpen && (
                  <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: wp(4), fontStyle: 'italic' }}>Inscriptions closes — prochain défi le 1er du mois</Text>
                )}
              </LinearGradient>
            </View>
          );
        })}
      </View>

      <View style={{ paddingHorizontal: wp(16) }}>
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(10) }}>Classements</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(10) }}>
          <View style={{ flexDirection: 'row', gap: wp(4) }}>
            {[
              { key: 'equipes', label: 'Équipes' },
              { key: 'personnel', label: 'Personnel' },
              { key: 'binome', label: 'Binôme' },
              { key: 'pays', label: 'Pays' },
              { key: 'mondial', label: 'Mondial' },
            ].map(tab => (
              <Pressable key={tab.key}
                onPress={() => {
                  setLeaderboardTab(tab.key);
                  setLeaderboardExpanded(false);
                  if (tab.key === 'personnel' || tab.key === 'mondial') onFetchIndividualLB(leaderboardChallengeId);
                  if (tab.key === 'pays') onFetchCountryLB(leaderboardChallengeId);
                }}
                style={{
                  paddingHorizontal: wp(14), paddingVertical: wp(8), borderRadius: wp(10),
                  backgroundColor: leaderboardTab === tab.key ? 'rgba(212,175,55,0.15)' : 'transparent',
                  borderWidth: 1.5, borderColor: leaderboardTab === tab.key ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)',
                  shadowColor: leaderboardTab === tab.key ? '#D4AF37' : 'transparent',
                  shadowOpacity: leaderboardTab === tab.key ? 0.15 : 0,
                  shadowRadius: wp(4),
                  elevation: leaderboardTab === tab.key ? 2 : 0,
                }}>
                <Text style={{ fontSize: fp(11), fontWeight: leaderboardTab === tab.key ? '700' : '500', color: leaderboardTab === tab.key ? '#D4AF37' : 'rgba(255,255,255,0.35)' }}>
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={{
          backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(14),
          padding: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        }}>

          {leaderboardTab === 'equipes' && (
            <View>
              {leaderboardLoading && !leaderboardData ? (
                <ActivityIndicator color="#D4AF37" style={{ paddingVertical: wp(20) }} />
              ) : leaderboardData && Array.isArray(leaderboardData.top_groups) && leaderboardData.top_groups.length > 0 ? (
                <View>
                  {leaderboardData.top_groups.slice(0, 3).map((entry, i) => {
                    const rankColors = ['#D4AF37', '#C0C0C0', '#CD7F32'];
                    return (
                      <Pressable key={entry.id || i} delayPressIn={120}
                        onPress={() => onOpenGroupDetail({ group_id: entry.id, lixverse_groups: { id: entry.id, name: entry.name } })}
                        style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center',
                        paddingVertical: wp(10), paddingHorizontal: wp(6),
                        backgroundColor: i === 0 ? 'rgba(212,175,55,0.12)' : i === 1 ? 'rgba(192,192,192,0.08)' : 'rgba(205,127,50,0.08)',
                        borderRadius: wp(10), marginBottom: i < 2 ? wp(6) : 0,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                      })}>
                        <MedalIcon rank={i + 1} size={wp(24)} />
                        <View style={{ flex: 1, marginLeft: wp(8) }}>
                          <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>{entry.name}</Text>
                          <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', marginTop: wp(1) }}>{entry.member_count} membres · {entry.total_score} pts</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                          <View style={{ backgroundColor: rankColors[i] + '20', borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4), borderWidth: 1, borderColor: rankColors[i] + '30' }}>
                            <Text style={{ fontSize: fp(12), fontWeight: '800', color: rankColors[i] }}>{entry.total_score} <Text style={{ fontSize: fp(8), fontWeight: '500', opacity: 0.7 }}>pts</Text></Text>
                          </View>
                          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.15)' }}>›</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                  {leaderboardData.top_groups.length > 3 && (
                    <Pressable onPress={() => setLeaderboardExpanded(prev => !prev)}
                      style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: wp(10), marginTop: wp(8), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                      <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.5)', marginRight: wp(6) }}>
                        {leaderboardExpanded ? 'Masquer' : 'Voir le classement complet'}
                      </Text>
                      <ChevronDown size={wp(14)} color="rgba(212,175,55,0.5)" rotated={leaderboardExpanded} />
                    </Pressable>
                  )}
                  {leaderboardExpanded && leaderboardData.top_groups.slice(3).map((entry, i) => (
                    <Pressable key={entry.id || (i + 3)} delayPressIn={120}
                      onPress={() => onOpenGroupDetail({ group_id: entry.id, lixverse_groups: { id: entry.id, name: entry.name } })}
                      style={({ pressed }) => ({
                      flexDirection: 'row', alignItems: 'center',
                      paddingVertical: wp(8), paddingHorizontal: wp(6),
                      borderBottomWidth: i < leaderboardData.top_groups.length - 4 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)',
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    })}>
                      <View style={{ width: wp(26), height: wp(26), borderRadius: wp(13), backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.3)' }}>{entry.rank}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: wp(10) }}>
                        <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.5)' }} numberOfLines={1}>{entry.name}</Text>
                        <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.2)' }}>{entry.member_count} mbr</Text>
                      </View>
                      <Text style={{ fontSize: fp(11), fontWeight: '600', color: 'rgba(255,255,255,0.3)', marginRight: wp(4) }}>{entry.total_score} pts</Text>
                      <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.15)' }}>›</Text>
                    </Pressable>
                  ))}
                  {leaderboardData.my_rank && (
                    <View style={{ marginTop: wp(10), paddingTop: wp(10), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.08)',
                        borderRadius: wp(10), paddingVertical: wp(10), paddingHorizontal: wp(12),
                        borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
                      }}>
                        <View style={{ width: wp(30), height: wp(30), borderRadius: wp(15), backgroundColor: leaderboardData.my_rank <= 3 ? 'rgba(212,175,55,0.2)' : 'rgba(0,217,132,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10) }}>
                          <Text style={{ fontSize: fp(10), fontWeight: '800', color: leaderboardData.my_rank <= 3 ? '#D4AF37' : '#00D984' }}>
                            {leaderboardData.my_rank <= 10 ? '#' + leaderboardData.my_rank : leaderboardData.rank_bracket === 'top50' ? 'Top50' : leaderboardData.rank_bracket === 'top100' ? 'Top100' : '100+'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF' }}>{leaderboardData.my_group_name || 'Mon équipe'}</Text>
                          <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.35)' }}>
                            {leaderboardData.my_rank <= 10 ? 'Rang #' + leaderboardData.my_rank : leaderboardData.rank_bracket === 'top50' ? 'Top 50' : leaderboardData.rank_bracket === 'top100' ? 'Top 100' : 'Rang ' + leaderboardData.my_rank} sur {leaderboardData.total_groups}
                          </Text>
                        </View>
                        <View style={{ backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: wp(8), paddingHorizontal: wp(10), paddingVertical: wp(4) }}>
                          <Text style={{ fontSize: fp(12), fontWeight: '800', color: '#00D984' }}>{leaderboardData.my_score || 0}</Text>
                          <Text style={{ fontSize: fp(7), color: 'rgba(0,217,132,0.5)', textAlign: 'center' }}>pts</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  <Text style={{ fontSize: fp(8), color: 'rgba(255,255,255,0.12)', textAlign: 'center', marginTop: wp(8) }}>{leaderboardData.total_groups} équipes · Rafraîchi auto</Text>
                </View>
              ) : (
                <View style={{ paddingVertical: wp(20), alignItems: 'center' }}>
                  <TrophyIcon size={wp(30)} color="rgba(212,175,55,0.3)" />
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.3)', marginTop: wp(8) }}>Aucune équipe inscrite</Text>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.2)', marginTop: wp(4) }}>Crée la première équipe !</Text>
                </View>
              )}
            </View>
          )}

          {leaderboardTab === 'personnel' && (
            <View>
              {lbTabLoading ? (
                <ActivityIndicator color="#D4AF37" style={{ paddingVertical: wp(20) }} />
              ) : individualLB && Array.isArray(individualLB.top_users) && individualLB.top_users.length > 0 ? (
                <View>
                  {individualLB.top_users.slice(0, 3).map((u, i) => (
                    <View key={u.user_id || i} style={{
                      flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), paddingHorizontal: wp(6),
                      backgroundColor: i === 0 ? 'rgba(212,175,55,0.12)' : i === 1 ? 'rgba(192,192,192,0.08)' : 'rgba(205,127,50,0.08)',
                      borderRadius: wp(10), marginBottom: i < 2 ? wp(6) : 0,
                    }}>
                      <MedalIcon rank={i + 1} size={wp(24)} />
                      <View style={{ flex: 1, marginLeft: wp(8) }}>
                        <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF' }}>{u.lixtag}</Text>
                        <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.25)' }}>{u.country || '—'}</Text>
                      </View>
                      <Text style={{ fontSize: fp(12), fontWeight: '800', color: ['#D4AF37','#C0C0C0','#CD7F32'][i] }}>{u.personal_score} pts</Text>
                    </View>
                  ))}
                  {individualLB.top_users.length > 3 && (
                    <Pressable onPress={() => setLeaderboardExpanded(prev => !prev)}
                      style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: wp(10), marginTop: wp(8), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                      <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.5)', marginRight: wp(6) }}>{leaderboardExpanded ? 'Masquer' : 'Voir le top 10'}</Text>
                      <ChevronDown size={wp(14)} color="rgba(212,175,55,0.5)" rotated={leaderboardExpanded} />
                    </Pressable>
                  )}
                  {leaderboardExpanded && individualLB.top_users.slice(3).map((u, i) => (
                    <View key={u.user_id || (i + 3)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(8), paddingHorizontal: wp(6), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                      <View style={{ width: wp(26), height: wp(26), borderRadius: wp(13), backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.3)' }}>{u.rank}</Text>
                      </View>
                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.5)', flex: 1, marginLeft: wp(10) }}>{u.lixtag}</Text>
                      <Text style={{ fontSize: fp(11), fontWeight: '600', color: 'rgba(255,255,255,0.3)' }}>{u.personal_score} pts</Text>
                    </View>
                  ))}
                  {individualLB.my_rank && (
                    <View style={{ marginTop: wp(10), paddingTop: wp(10), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(10), paddingVertical: wp(10), paddingHorizontal: wp(12), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)' }}>
                        <View style={{ width: wp(30), height: wp(30), borderRadius: wp(15), backgroundColor: 'rgba(0,217,132,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10) }}>
                          <Text style={{ fontSize: fp(10), fontWeight: '800', color: '#00D984' }}>
                            {individualLB.my_rank <= 10 ? '#' + individualLB.my_rank : individualLB.rank_bracket === 'top50' ? 'Top50' : individualLB.rank_bracket === 'top100' ? 'Top100' : '100+'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FFF' }}>{individualLB.my_lixtag || 'Moi'}</Text>
                          <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.35)' }}>Mon score personnel</Text>
                        </View>
                        <Text style={{ fontSize: fp(14), fontWeight: '800', color: '#00D984' }}>{individualLB.my_score || 0} pts</Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ paddingVertical: wp(20), alignItems: 'center' }}>
                  <TrophyIcon size={wp(30)} color="rgba(212,175,55,0.3)" />
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.3)', marginTop: wp(8) }}>Aucun participant</Text>
                </View>
              )}
            </View>
          )}

          {leaderboardTab === 'binome' && (
            <View style={{ paddingVertical: wp(30), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(24), marginBottom: wp(8) }}>🤝</Text>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.3)' }}>Bientôt disponible</Text>
              <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.15)', marginTop: wp(4), textAlign: 'center', paddingHorizontal: wp(20) }}>Le classement Binôme arrivera avec la fonctionnalité de pairage santé.</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
