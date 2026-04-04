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
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}
