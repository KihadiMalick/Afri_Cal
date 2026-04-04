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

            {/* Résumé en grille */}
            <View style={{
              flexDirection: 'row', flexWrap: 'wrap',
              justifyContent: 'space-around', width: '100%',
              backgroundColor: '#252A30', borderRadius: wp(12),
              padding: wp(14), marginBottom: wp(14),
            }}>
              {lastActivity.distance ? (
                <View style={{ alignItems: 'center', minWidth: '30%', marginBottom: wp(8) }}>
                  <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{t.distance}</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFFFFF' }}>{lastActivity.distance}</Text>
                </View>
              ) : null}
              <View style={{ alignItems: 'center', minWidth: '30%', marginBottom: wp(8) }}>
                <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{t.duration}</Text>
                <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FFFFFF' }}>{lastActivity.duration} min</Text>
              </View>
              <View style={{ alignItems: 'center', minWidth: '30%', marginBottom: wp(8) }}>
                <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{t.calories}</Text>
                <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#FF8C42' }}>{lastActivity.kcal} kcal</Text>
              </View>
              {lastActivity.water ? (
                <View style={{ alignItems: 'center', minWidth: '30%' }}>
                  <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{t.waterLostLabel}</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#4DA6FF' }}>{lastActivity.water} ml</Text>
                </View>
              ) : null}
              {lastActivity.speed ? (
                <View style={{ alignItems: 'center', minWidth: '30%' }}>
                  <Text style={{ fontSize: fp(8), color: '#6B7280' }}>{t.avgSpeed}</Text>
                  <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#D4AF37' }}>{lastActivity.speed}</Text>
                </View>
              ) : null}
            </View>

            {/* Carte du parcours GPS */}
            {lastActivity.isGPS && lastActivity.route && lastActivity.route.length > 1 && (
              <View style={{
                width: '100%', borderRadius: wp(14), overflow: 'hidden',
                marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
                height: wp(200),
              }}>
                <MapView
                  style={{ flex: 1 }}
                  scrollEnabled={true} zoomEnabled={true} rotateEnabled={false}
                  customMapStyle={[
                    { elementType: 'geometry', stylers: [{ color: '#1A1D22' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#8892A0' }] },
                    { elementType: 'labels.text.stroke', stylers: [{ color: '#0D1117' }] },
                    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2A303B' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
                    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                  ]}
                  initialRegion={(function() {
                    var r = lastActivity.route;
                    var minLat = r[0].latitude, maxLat = r[0].latitude;
                    var minLng = r[0].longitude, maxLng = r[0].longitude;
                    for (var i = 1; i < r.length; i++) {
                      if (r[i].latitude < minLat) minLat = r[i].latitude;
                      if (r[i].latitude > maxLat) maxLat = r[i].latitude;
                      if (r[i].longitude < minLng) minLng = r[i].longitude;
                      if (r[i].longitude > maxLng) maxLng = r[i].longitude;
                    }
                    return {
                      latitude: (minLat + maxLat) / 2,
                      longitude: (minLng + maxLng) / 2,
                      latitudeDelta: Math.max(0.005, (maxLat - minLat) * 1.4),
                      longitudeDelta: Math.max(0.005, (maxLng - minLng) * 1.4),
                    };
                  })()}
                >
                  <Polyline coordinates={lastActivity.route} strokeColor="#00D984" strokeWidth={4} />
                  {lastActivity.startCoord && (
                    <Marker coordinate={lastActivity.startCoord} anchor={{ x: 0.5, y: 0.5 }}>
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 }}>
                          <Text style={{ color: '#00D984', fontSize: 9, fontWeight: '700' }}>DÉPART</Text>
                        </View>
                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#00D984', borderWidth: 2, borderColor: '#FFF' }} />
                      </View>
                    </Marker>
                  )}
                  {lastActivity.route.length > 0 && (
                    <Marker coordinate={lastActivity.route[lastActivity.route.length - 1]} anchor={{ x: 0.5, y: 0.5 }}>
                      <View style={{ alignItems: 'center' }}>
                        <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 4 }}>
                          <Text style={{ color: '#FF1744', fontSize: 9, fontWeight: '700' }}>ARRIVÉE</Text>
                        </View>
                        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF1744', borderWidth: 2, borderColor: '#FFF' }} />
                      </View>
                    </Marker>
                  )}
                </MapView>
                <View style={{
                  position: 'absolute', bottom: wp(8), left: wp(8),
                  backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: wp(8),
                  paddingHorizontal: wp(10), paddingVertical: wp(5),
                  flexDirection: 'row', alignItems: 'center', gap: wp(6),
                }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00D984' }} />
                  <Text style={{ color: '#EAEEF3', fontSize: fp(11), fontWeight: '700' }}>{lastActivity.distance}</Text>
                </View>
              </View>
            )}

            {/* === PHASE 3 === */}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
