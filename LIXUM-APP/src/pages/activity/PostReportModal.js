import React from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import { getFoodEquivalent, getLang } from './activityConstants';

export default function PostReportModal({
  visible,
  onClose,
  lastActivity,
  hookResults,
  weeklyMinutes,
}) {
  var _lc = useLang(); var lang = _lc.lang;
  var t = getLang(lang);

  if (!visible || !lastActivity) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center', paddingHorizontal: wp(20),
      }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false}>
          <View style={{
            backgroundColor: '#1A1D22', borderRadius: wp(18),
            borderWidth: 1, borderColor: '#4A4F55', padding: wp(20),
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: fp(40), marginBottom: wp(8) }}>🎉</Text>

            <Text style={{
              fontSize: fp(18), fontWeight: '800', color: '#00D984',
              marginBottom: wp(4),
            }}>
              {t.bravo}
            </Text>

            <Text style={{
              fontSize: fp(11), color: '#9CA3AF', textAlign: 'center',
              marginBottom: wp(16),
            }}>
              {lastActivity.type === 'walk' ? t.niceWalk :
               lastActivity.type === 'run' ? t.niceRun :
               t.sessionOf + ' ' + lastActivity.name + ' ' + t.finished}
            </Text>

            {/* Résultats hooks pouvoirs */}
            {hookResults && Object.keys(hookResults).length > 0 && (
              <View style={{ width: '100%', marginBottom: wp(8), gap: wp(6) }}>
                {Object.values(hookResults).map((result, idx) => {
                  switch (result.type) {
                    case 'xp_boost':
                      return (
                        <View key={idx} style={{
                          flexDirection: 'row', alignItems: 'center',
                          backgroundColor: 'rgba(212,175,55,0.08)',
                          borderRadius: wp(10), borderWidth: 1,
                          borderColor: 'rgba(212,175,55,0.2)',
                          paddingHorizontal: wp(12), paddingVertical: wp(8),
                        }}>
                          <Text style={{ fontSize: fp(18), marginRight: wp(8) }}>{result.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>
                              {result.char_name} • +{result.percentage}% XP
                            </Text>
                            <Text style={{ color: '#8892A0', fontSize: fp(9), marginTop: wp(2) }}>
                              {result.base_xp} XP + {result.bonus_xp} bonus = {result.total_xp} XP
                            </Text>
                          </View>
                          <Text style={{ color: '#D4AF37', fontSize: fp(14), fontWeight: '900' }}>
                            +{result.bonus_xp}
                          </Text>
                        </View>
                      );
                    default:
                      return null;
                  }
                })}
              </View>
            )}

            {/* === PHASE 2 === */}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
