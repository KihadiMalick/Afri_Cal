import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../config/LanguageContext';
import { wp, fp } from '../../constants/layout';

export default function AddMealModal({ visible, onClose, onScan, onGallery, onManual }) {
  var _lc = useLang(); var lang = _lc.lang;
  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1500,
      backgroundColor: 'rgba(0,0,0,0.85)',
      justifyContent: 'center', alignItems: 'center',
      paddingHorizontal: wp(20),
    }}>
      <View style={{
        width: '100%', borderRadius: 20, padding: 1.2,
        backgroundColor: '#4A4F55',
      }}>
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{ borderRadius: 19, padding: wp(20) }}
        >
          <View style={{
            position: 'absolute', top: 0, left: 20, right: 20,
            height: 1, backgroundColor: 'rgba(0,217,132,0.10)',
          }}/>

          <Text style={{
            color: '#EAEEF3', fontSize: fp(18), fontWeight: '800',
            textAlign: 'center', marginBottom: wp(4),
          }}>
            {lang === 'fr' ? 'Ajouter un repas' : 'Add a meal'}
          </Text>
          <Text style={{
            color: '#5A6070', fontSize: fp(11), textAlign: 'center',
            marginBottom: wp(20),
          }}>
            {lang === 'fr' ? 'Choisissez votre méthode' : 'Choose your method'}
          </Text>

          {/* Option 1 : Xscan */}
          <Pressable
            onPress={onScan}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center',
              padding: wp(14), borderRadius: 14, marginBottom: wp(10),
              backgroundColor: pressed ? 'rgba(0,217,132,0.12)' : 'rgba(0,217,132,0.04)',
              borderWidth: 1.2, borderColor: pressed ? 'rgba(0,217,132,0.4)' : 'rgba(0,217,132,0.15)',
            })}
          >
            <View style={{
              width: wp(40), height: wp(40), borderRadius: wp(12),
              backgroundColor: 'rgba(0,217,132,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
              borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
            }}>
              <Svg width={20} height={20} viewBox="0 0 20 20">
                <Line x1="4" y1="4" x2="16" y2="16" stroke="#00D984" strokeWidth={2.5} strokeLinecap="round"/>
                <Line x1="16" y1="4" x2="4" y2="16" stroke="#00D984" strokeWidth={2.5} strokeLinecap="round"/>
              </Svg>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '800' }}>Xscan</Text>
              <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                {lang === 'fr' ? 'Scanner en temps réel avec la caméra' : 'Real-time camera scan'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#00D984" />
          </Pressable>

          {/* Option 2 : Galerie Photo */}
          <Pressable
            onPress={onGallery}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center',
              padding: wp(14), borderRadius: 14, marginBottom: wp(10),
              backgroundColor: pressed ? 'rgba(255,140,66,0.10)' : 'rgba(255,140,66,0.04)',
              borderWidth: 1.2, borderColor: pressed ? 'rgba(255,140,66,0.3)' : 'rgba(255,140,66,0.12)',
            })}
          >
            <View style={{
              width: wp(40), height: wp(40), borderRadius: wp(12),
              backgroundColor: 'rgba(255,140,66,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
              borderWidth: 1, borderColor: 'rgba(255,140,66,0.2)',
            }}>
              <Ionicons name="image-outline" size={20} color="#FF8C42" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FF8C42', fontSize: fp(14), fontWeight: '800' }}>
                {lang === 'fr' ? 'Galerie Photo' : 'Photo Gallery'}
              </Text>
              <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                {lang === 'fr' ? 'Charger une photo existante' : 'Load an existing photo'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FF8C42" />
          </Pressable>

          {/* Option 3 : Saisie Manuelle */}
          <Pressable
            onPress={onManual}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center',
              padding: wp(14), borderRadius: 14, marginBottom: wp(16),
              backgroundColor: pressed ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              borderWidth: 1.2, borderColor: pressed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
            })}
          >
            <View style={{
              width: wp(40), height: wp(40), borderRadius: wp(12),
              backgroundColor: 'rgba(255,255,255,0.04)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            }}>
              <Ionicons name="create-outline" size={20} color="#8892A0" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#EAEEF3', fontSize: fp(14), fontWeight: '800' }}>
                {lang === 'fr' ? 'Saisie manuelle' : 'Manual entry'}
              </Text>
              <Text style={{ color: '#5A6070', fontSize: fp(10), marginTop: 2 }}>
                {lang === 'fr' ? 'Rechercher et ajouter un plat' : 'Search and add a meal'}
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(0,217,132,0.08)',
              paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(7), fontWeight: '700' }}>GRATUIT</Text>
            </View>
          </Pressable>

          {/* Bouton Annuler */}
          <Pressable
            onPress={onClose}
            style={{ alignItems: 'center', paddingVertical: wp(8) }}
          >
            <Text style={{ color: '#5A6070', fontSize: fp(13) }}>
              {lang === 'fr' ? 'Annuler' : 'Cancel'}
            </Text>
          </Pressable>
        </LinearGradient>
      </View>
    </View>
  );
}
