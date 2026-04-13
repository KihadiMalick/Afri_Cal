import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line } from 'react-native-svg';

var W = Dimensions.get('window').width;
var wp = function(size) { return (W / 320) * size; };
var fp = function(size) { return Math.round((W / 320) * size); };

export default function EnergyGateModal(props) {
  var visible = props.visible || false;
  var onClose = props.onClose;
  var energyCost = props.energyCost || 0;
  var energyBalance = props.energyBalance || 0;
  var lixBalance = props.lixBalance || 0;
  var onRecharge = props.onRecharge;
  var onViewPlans = props.onViewPlans;

  var scaleAnim = useRef(new Animated.Value(0.9)).current;
  var opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(function() {
    if (visible) {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', opacity: opacityAnim,
      }}>
        <Animated.View style={{
          width: W * 0.88, borderRadius: 20, overflow: 'hidden',
          transform: [{ scale: scaleAnim }],
        }}>
          <View style={{
            backgroundColor: '#2A303B', borderRadius: 20,
            borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)',
            paddingHorizontal: wp(20), paddingVertical: wp(24),
            alignItems: 'center',
          }}>
            {/* Icone eclair */}
            <View style={{
              width: wp(56), height: wp(56), borderRadius: wp(28),
              backgroundColor: 'rgba(255,186,0,0.12)',
              borderWidth: 1, borderColor: 'rgba(255,186,0,0.25)',
              justifyContent: 'center', alignItems: 'center',
              marginBottom: wp(14),
            }}>
              <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h7l-2 8 10-12h-7z" fill="#FFB800" />
              </Svg>
            </View>

            {/* Titre */}
            <Text style={{ color: '#EAEEF3', fontSize: fp(16), fontWeight: '800', marginBottom: wp(8), textAlign: 'center' }}>
              Énergie insuffisante
            </Text>

            {/* Message */}
            <Text style={{ color: '#8892A0', fontSize: fp(12), textAlign: 'center', lineHeight: fp(18), marginBottom: wp(18) }}>
              {'Cette action coûte ' + energyCost + ' énergie.\nIl te reste ' + energyBalance + ' énergie.'}
            </Text>

            {/* Bouton Recharger */}
            <Pressable
              onPress={function() { if (onRecharge) onRecharge(); }}
              style={function(state) {
                return {
                  width: '100%', paddingVertical: wp(13), borderRadius: 12,
                  backgroundColor: state.pressed ? 'rgba(0,217,132,0.8)' : '#00D984',
                  alignItems: 'center', marginBottom: wp(10),
                };
              }}
            >
              <Text style={{ color: '#1A1D22', fontSize: fp(13), fontWeight: '800' }}>Recharger avec Lix</Text>
            </Pressable>

            {/* Bouton Abonnements */}
            <Pressable
              onPress={function() { if (onViewPlans) onViewPlans(); }}
              style={function(state) {
                return {
                  width: '100%', paddingVertical: wp(12), borderRadius: 12,
                  backgroundColor: 'transparent',
                  borderWidth: 1, borderColor: state.pressed ? '#00D984' : 'rgba(0,217,132,0.35)',
                  alignItems: 'center', marginBottom: wp(10),
                };
              }}
            >
              <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700' }}>Voir les abonnements</Text>
            </Pressable>

            {/* Bouton Annuler */}
            <Pressable
              onPress={function() { if (onClose) onClose(); }}
              style={function(state) {
                return {
                  paddingVertical: wp(8), opacity: state.pressed ? 0.6 : 1,
                };
              }}
            >
              <Text style={{ color: '#666', fontSize: fp(11) }}>Annuler</Text>
            </Pressable>

            {/* Solde en bas */}
            <View style={{
              marginTop: wp(14), paddingTop: wp(12),
              borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
              width: '100%', alignItems: 'center',
            }}>
              <Text style={{ color: '#5A6070', fontSize: fp(10) }}>
                {'Solde: ' + lixBalance + ' Lix  |  ' + energyBalance + ' Énergie'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
