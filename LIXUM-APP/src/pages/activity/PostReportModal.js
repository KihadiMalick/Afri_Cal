import React from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';
import { getFoodEquivalent, getLang } from './activityConstants';
var AlixenIcon = require('../../components/AlixenIcon');

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
              fontSize: fp(18), fontWeight: '800', color: '#EAEEF3',
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

            {/* Stats GPS enrichies */}
            {lastActivity.isGPS && (
              <View style={{
                width: '100%', backgroundColor: '#252A30', borderRadius: wp(12),
                padding: wp(14), marginBottom: wp(14),
                borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: wp(12) }}>
                  <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: '#00D984' }} />
                  <Text style={{ fontSize: fp(9), color: '#8892A0', fontWeight: '700', letterSpacing: 1.5 }}>
                    DONNÉES GPS EN TEMPS RÉEL
                  </Text>
                  {lastActivity.weatherMult > 1.3 && (
                    <View style={{ backgroundColor: 'rgba(255,140,66,0.1)', paddingHorizontal: wp(6), paddingVertical: wp(2), borderRadius: wp(4) }}>
                      <Text style={{ fontSize: fp(7), color: '#FF8C42', fontWeight: '700' }}>CLIMAT CHAUD</Text>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: wp(14) }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>ALLURE</Text>
                    <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#EAEEF3' }}>{lastActivity.pace}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>/km</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>VIT. MAX</Text>
                    <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#D4AF37' }}>{lastActivity.maxSpeed}</Text>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>km/h</Text>
                  </View>
                  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>SOURCE</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4), marginTop: wp(2) }}>
                      <View style={{ width: wp(6), height: wp(6), borderRadius: wp(3), backgroundColor: '#00D984' }} />
                      <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#00D984' }}>GPS</Text>
                    </View>
                    <Text style={{ fontSize: fp(8), color: '#6B7280' }}>live</Text>
                  </View>
                </View>

                <Text style={{ fontSize: fp(9), color: '#8892A0', fontWeight: '600', marginBottom: wp(6) }}>RÉPARTITION</Text>
                <View style={{ flexDirection: 'row', height: wp(10), borderRadius: wp(5), overflow: 'hidden', marginBottom: wp(6) }}>
                  {lastActivity.walkPercent > 0 && (
                    <View style={{
                      flex: lastActivity.walkPercent, backgroundColor: '#00D984',
                      borderTopLeftRadius: wp(5), borderBottomLeftRadius: wp(5),
                      borderTopRightRadius: lastActivity.runPercent === 0 ? wp(5) : 0,
                      borderBottomRightRadius: lastActivity.runPercent === 0 ? wp(5) : 0,
                    }} />
                  )}
                  {lastActivity.runPercent > 0 && (
                    <View style={{
                      flex: lastActivity.runPercent, backgroundColor: '#FF8C42',
                      borderTopRightRadius: wp(5), borderBottomRightRadius: wp(5),
                      borderTopLeftRadius: lastActivity.walkPercent === 0 ? wp(5) : 0,
                      borderBottomLeftRadius: lastActivity.walkPercent === 0 ? wp(5) : 0,
                    }} />
                  )}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                    <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: '#00D984' }} />
                    <Text style={{ fontSize: fp(10), color: '#00D984', fontWeight: '600' }}>Marche {lastActivity.walkPercent}%</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(4) }}>
                    <View style={{ width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: '#FF8C42' }} />
                    <Text style={{ fontSize: fp(10), color: '#FF8C42', fontWeight: '600' }}>Course {lastActivity.runPercent}%</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Débrief ALIXEN post-effort */}
            {lastActivity.isGPS && (
              <View style={{
                width: '100%', borderRadius: wp(12), padding: wp(14), marginBottom: wp(14),
                backgroundColor: 'rgba(0,217,132,0.04)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: wp(10) }}>
                  <View style={{
                    width: wp(32), height: wp(32), borderRadius: wp(16),
                    backgroundColor: 'rgba(0,217,132,0.1)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)',
                    justifyContent: 'center', alignItems: 'center',
                  }}>
                    <AlixenIcon size={18} />
                  </View>
                  <View>
                    <Text style={{ fontSize: fp(12), fontWeight: '800', color: '#00D984' }}>ALIXEN</Text>
                    <Text style={{ fontSize: fp(8), color: '#8892A0' }}>Coach IA post-effort</Text>
                  </View>
                </View>

                <Text style={{ fontSize: fp(11), color: '#D1D5DB', lineHeight: fp(17) }}>
                  {(function() {
                    var msgs = [];
                    var dur = lastActivity.duration;
                    var water = lastActivity.water;
                    var avgSpd = parseFloat(lastActivity.speed) || 0;
                    var walkPct = lastActivity.walkPercent || 0;
                    var runPct = lastActivity.runPercent || 0;
                    var maxSpd = lastActivity.maxSpeed || 0;
                    var isHot = lastActivity.weatherMult > 1.3;

                    if (dur <= 15) {
                      msgs.push('Session courte mais efficace ! Chaque minute compte.');
                    } else if (dur <= 30) {
                      msgs.push('Belle session de ' + dur + ' minutes, c\'est le bon rythme pour la santé.');
                    } else {
                      msgs.push('Impressionnant ! ' + dur + ' minutes d\'effort, tu dépasses la recommandation OMS.');
                    }

                    if (runPct > 60) {
                      msgs.push('Tu as couru ' + runPct + '% du temps — belle dominante course.');
                    } else if (walkPct > 80) {
                      msgs.push('Marche dominante à ' + walkPct + '% — parfait pour la récupération active.');
                    } else {
                      msgs.push('Mix marche/course équilibré, idéal pour progresser en endurance.');
                    }

                    if (maxSpd > 12) {
                      msgs.push('Pointe à ' + maxSpd + ' km/h ! Tu as touché la zone sprint.');
                    } else if (avgSpd > 7) {
                      msgs.push('Allure moyenne de ' + avgSpd + ' km/h, rythme de jogging soutenu.');
                    }

                    var toRehydrate = Math.round(water * 1.3);
                    msgs.push('Tu as perdu ~' + water + 'ml d\'eau' + (isHot ? ' (ajusté climat chaud)' : '') + '. Bois au moins ' + toRehydrate + 'ml dans l\'heure qui vient.');

                    if (lastActivity.foodEquiv) {
                      if (lastActivity.foodEquiv.type === 'combo') {
                        msgs.push('Tu as brûlé \u2248 1 ' + lastActivity.foodEquiv.item1.label + ' ' + lastActivity.foodEquiv.item1.emoji + ' + 1 ' + lastActivity.foodEquiv.item2.label + ' ' + lastActivity.foodEquiv.item2.emoji);
                      } else if (lastActivity.foodEquiv.type === 'single') {
                        msgs.push('Tu as brûlé l\'équivalent de ' + lastActivity.foodEquiv.count + ' ' + lastActivity.foodEquiv.item.label + ' ' + lastActivity.foodEquiv.item.emoji);
                      }
                    }

                    return msgs.join('\n\n');
                  })()}
                </Text>

                <View style={{ marginTop: wp(10), paddingTop: wp(8), borderTopWidth: 1, borderTopColor: 'rgba(0,217,132,0.1)' }}>
                  <Text style={{ fontSize: fp(7), color: '#555E6C', textAlign: 'center', fontStyle: 'italic' }}>
                    Calcul MET variable en temps réel · Compendium of Physical Activities (Ainsworth, 2011)
                    {lastActivity.weatherMult > 1.3 ? ' · Coefficient climat ×' + lastActivity.weatherMult + ' (ACSM, 2007)' : ''}
                  </Text>
                </View>
              </View>
            )}

            {/* Équivalent alimentaire */}
            {(function() {
              var equiv = getFoodEquivalent(lastActivity.kcal);
              if (!equiv) return null;
              return (
                <View style={{
                  backgroundColor: 'rgba(255,140,66,0.08)', borderRadius: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,140,66,0.15)',
                  padding: wp(10), width: '100%',
                  flexDirection: 'row', alignItems: 'center',
                  marginBottom: wp(14),
                }}>
                  {equiv.type === 'combo' ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: wp(6) }}>
                      <Text style={{ fontSize: fp(22) }}>{equiv.item1.emoji}</Text>
                      <Text style={{ fontSize: fp(14), color: '#FF8C42', fontWeight: '700' }}>+</Text>
                      <Text style={{ fontSize: fp(22) }}>{equiv.item2.emoji}</Text>
                      <Text style={{ fontSize: fp(10), color: '#D1D5DB', flex: 1, marginLeft: wp(6) }}>
                        {'\u2248 1 ' + equiv.item1.label + ' + 1 ' + equiv.item2.label + ' brûlé'}
                      </Text>
                    </View>
                  ) : equiv.type === 'single' ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: wp(8) }}>
                      <Text style={{ fontSize: fp(22) }}>{equiv.item.emoji}</Text>
                      <Text style={{ fontSize: fp(10), color: '#D1D5DB', flex: 1 }}>
                        {'Équivalent de ' + equiv.count + ' ' + equiv.item.label + ' brûlé'}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })()}

            {/* Objectif OMS */}
            <Text style={{
              fontSize: fp(9), color: '#6B7280', textAlign: 'center',
              marginBottom: wp(14),
            }}>
              {t.weekOms} : {weeklyMinutes || 0} / 150 min
              {(weeklyMinutes || 0) >= 150 ? ' ' + String.fromCodePoint(0x2705) : ' · ' + t.still + ' ' + (150 - (weeklyMinutes || 0)) + ' min'}
            </Text>

            {/* Bouton fermer */}
            <TouchableOpacity
              onPress={onClose}
              style={{
                paddingVertical: wp(12), paddingHorizontal: wp(40),
                borderRadius: wp(12), backgroundColor: 'transparent',
                borderWidth: 1.5, borderColor: '#00D984',
              }}
            >
              <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#00D984' }}>
                {t.continueBtn} {String.fromCodePoint(0x1F4AA)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
