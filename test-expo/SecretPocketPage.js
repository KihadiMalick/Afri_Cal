// NOTE: Ce fichier est une version standalone.
// Pour le test Snack, tout est integre dans MedicAiPage.js
// Ce fichier sera utilise lors de la migration vers la structure finale (EAS Build)
// ──────────────────────────────────────────────────────────────────────────────
// SecretPocketPage.js — Secret Pocket : Coffre-Fort Sante Chiffre
// ──────────────────────────────────────────────────────────────────────────────
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, Platform, Dimensions, StatusBar, Alert, Animated,
} from 'react-native';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BASE_WIDTH = 320;
const wp = (size) => (size * SCREEN_WIDTH) / BASE_WIDTH;
const fp = (size) => (size * SCREEN_WIDTH) / BASE_WIDTH;

// ============================================
// CATEGORY ICONS — SF Symbols style
// ============================================
const CategoryIcon = ({ type, color, size = wp(20) }) => {
  switch (type) {
    case 'heart-pulse':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke={color} strokeWidth="1.5" />
          <Path d="M3 12h4l3-6 4 12 3-6h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'shield-alert':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke={color} strokeWidth="1.5" />
          <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="12" cy="16" r="0.5" fill={color} />
        </Svg>
      );
    case 'pill':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M10.5 1.5l-8 8a4.24 4.24 0 006 6l8-8a4.24 4.24 0 00-6-6z" stroke={color} strokeWidth="1.5" />
          <Line x1="8" y1="8" x2="14" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case 'flask':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 2v6l-5 8a3 3 0 002.6 4.5h10.8A3 3 0 0020 16l-5-8V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="9" y1="2" x2="15" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M7 15h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case 'edit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={color} strokeWidth="1.5" />
        </Svg>
      );
    case 'message-lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.5" />
          <Rect x="9" y="8" width="6" height="5" rx="1" stroke={color} strokeWidth="1.5" />
          <Path d="M10 8V6.5a2 2 0 014 0V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    default:
      return null;
  }
};

// ============================================
// DATA — Categories (hardcoded)
// ============================================
const categories = [
  {
    id: 'diagnostics',
    title: 'Diagnostics a surveiller',
    desc: 'Diabete, hypertension, cholesterol...',
    icon: 'heart-pulse',
    color: '#FF6B6B',
    count: 2,
  },
  {
    id: 'allergies',
    title: 'Allergies et intolerances',
    desc: 'Alimentaires, medicamenteuses...',
    icon: 'shield-alert',
    color: '#FF8C42',
    count: 1,
  },
  {
    id: 'medications',
    title: 'Medicaments en cours',
    desc: 'Traitements actuels et posologie',
    icon: 'pill',
    color: '#4DA6FF',
    count: 0,
  },
  {
    id: 'lab-results',
    title: "Resultats d'analyses",
    desc: 'Bilans sanguins, examens...',
    icon: 'flask',
    color: '#00D984',
    count: 3,
  },
  {
    id: 'notes',
    title: 'Notes personnelles',
    desc: 'Vos observations de sante',
    icon: 'edit',
    color: '#9B6DFF',
    count: 5,
  },
  {
    id: 'conversations',
    title: 'Conversations sensibles',
    desc: 'Echanges prives avec ALIXEN',
    icon: 'message-lock',
    color: '#D4AF37',
    count: 4,
  },
];

// ============================================
// LOCKED SCREEN
// ============================================
const LockedScreen = ({ onUnlock, onBack }) => (
  <LinearGradient
    colors={['#1A1D22', '#252A30', '#1A1D22']}
    style={{ flex: 1 }}
  >
    <StatusBar barStyle="light-content" />

    {/* Bouton retour */}
    <View style={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(16) }}>
      <Pressable
        delayPressIn={120}
        onPress={onBack}
        style={({ pressed }) => ({
          width: wp(36), height: wp(36), borderRadius: wp(18),
          backgroundColor: '#252A30', borderWidth: 1, borderColor: '#4A4F55',
          justifyContent: 'center', alignItems: 'center',
          transform: [{ scale: pressed ? 0.92 : 1 }],
        })}
      >
        <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
          <Path d="M15 19l-7-7 7-7" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </View>

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: wp(40) }}>
      {/* Grand bouclier/verrou */}
      <Svg width={wp(90)} height={wp(90)} viewBox="0 0 64 64" fill="none">
        <Path d="M32 4L8 16v12c0 16.5 10.2 31.9 24 36 13.8-4.1 24-19.5 24-36V16L32 4z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" />
        <Rect x="22" y="26" width="20" height="16" rx="3" stroke="#D4AF37" strokeWidth="1.5" />
        <Path d="M26 26v-4a6 6 0 0112 0v4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="32" cy="34" r="2" fill="#D4AF37" />
        <Line x1="32" y1="36" x2="32" y2="39" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>

      {/* Titre */}
      <Text style={{
        color: '#D4AF37', fontSize: fp(24), fontWeight: '800',
        letterSpacing: 1, marginTop: wp(20),
      }}>Secret Pocket</Text>

      {/* Sous-titre */}
      <Text style={{
        color: 'rgba(255,255,255,0.4)', fontSize: fp(13), marginTop: wp(6),
      }}>Votre coffre-fort sante confidentiel</Text>

      {/* Bouton deverrouiller */}
      <Pressable
        delayPressIn={120}
        onPress={onUnlock}
        style={({ pressed }) => ({
          width: wp(70), height: wp(70), borderRadius: wp(35),
          backgroundColor: 'rgba(212,175,55,0.1)',
          borderWidth: 1.5, borderColor: '#D4AF37',
          justifyContent: 'center', alignItems: 'center',
          marginTop: wp(32),
          transform: [{ scale: pressed ? 0.92 : 1 }],
        })}
      >
        <Svg width={wp(32)} height={wp(32)} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2a7 7 0 00-7 7v0a7 7 0 007 7" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M17 5.5A6.97 6.97 0 0119 9v2" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M12 6a3 3 0 00-3 3v4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M15 9a3 3 0 00-3-3" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M12 10v6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M8 16a5 5 0 004 4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      </Pressable>
      <Text style={{
        color: 'rgba(255,255,255,0.3)', fontSize: fp(11), marginTop: wp(12),
      }}>Appuyez pour deverrouiller</Text>
    </View>

    {/* Texte confiance en bas */}
    <View style={{
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: wp(6), paddingBottom: Platform.OS === 'android' ? wp(20) : wp(30),
    }}>
      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
        <Rect x="5" y="11" width="14" height="10" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <Path d="M8 11V7a4 4 0 018 0v4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
      <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fp(10) }}>Chiffrement de bout en bout</Text>
    </View>
  </LinearGradient>
);

// ============================================
// UNLOCKED SCREEN
// ============================================
const UnlockedScreen = ({ onBack, onLock }) => {
  const addScale = useRef(new Animated.Value(1)).current;

  return (
    <LinearGradient
      colors={['#1A1D22', '#252A30', '#1E2328']}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* ===== HEADER ===== */}
      <View style={{
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingBottom: wp(12),
        paddingHorizontal: wp(16),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(74,79,85,0.5)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(12) }}>
          {/* Bouton retour */}
          <Pressable
            delayPressIn={120}
            onPress={onBack}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: '#252A30', borderWidth: 1, borderColor: '#4A4F55',
              justifyContent: 'center', alignItems: 'center',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View>
            <Text style={{ color: '#D4AF37', fontSize: fp(20), fontWeight: '700' }}>Secret Pocket</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(11) }}>Espace confidentiel</Text>
          </View>
        </View>
        {/* Bouton verrouiller */}
        <Pressable
          delayPressIn={120}
          onPress={() => { onLock(); onBack(); }}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: wp(4),
            backgroundColor: 'rgba(212,175,55,0.1)',
            borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
            borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: wp(5),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}
        >
          <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
            <Rect x="5" y="11" width="14" height="10" rx="2" stroke="#D4AF37" strokeWidth="1.5" />
            <Path d="M8 11V7a4 4 0 018 0v4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          </Svg>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '600' }}>Verrouiller</Text>
        </Pressable>
      </View>

      {/* Indicateur securite */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: wp(6),
        backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(8),
        marginHorizontal: wp(16), marginTop: wp(10), marginBottom: wp(16),
        padding: wp(8), paddingHorizontal: wp(12),
      }}>
        <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" />
        </Svg>
        <Text style={{ color: 'rgba(212,175,55,0.6)', fontSize: fp(10) }}>Chiffre et securise — Auto-lock 30s</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(40) }}
      >
        {/* Categories */}
        {categories.map((cat) => (
          <Pressable
            key={cat.id}
            delayPressIn={120}
            onPress={() => console.log('Ouvrir ' + cat.id)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.97 : 1 }],
              marginBottom: wp(10),
            })}
          >
            <LinearGradient
              colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
              style={{
                flexDirection: 'row', alignItems: 'center',
                borderRadius: wp(16), padding: wp(16),
                borderWidth: 1, borderColor: '#4A4F55',
              }}
            >
              {/* Icone */}
              <View style={{
                width: wp(44), height: wp(44), borderRadius: wp(22),
                backgroundColor: `${cat.color}1F`,
                justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
              }}>
                <CategoryIcon type={cat.icon} color={cat.color} />
              </View>
              {/* Texte */}
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: fp(14), fontWeight: '600' }}>{cat.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: fp(11), marginTop: wp(2) }}>{cat.desc}</Text>
              </View>
              {/* Badge compteur */}
              {cat.count > 0 ? (
                <View style={{
                  width: wp(24), height: wp(24), borderRadius: wp(12),
                  backgroundColor: `${cat.color}33`,
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(8),
                }}>
                  <Text style={{ color: cat.color, fontSize: fp(11), fontWeight: '700' }}>{cat.count}</Text>
                </View>
              ) : (
                <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fp(10), marginRight: wp(8) }}>Vide</Text>
              )}
              <Text style={{ color: 'rgba(255,255,255,0.15)', fontSize: fp(16) }}>{">"}</Text>
            </LinearGradient>
          </Pressable>
        ))}

        {/* Bouton ajouter */}
        <Pressable
          delayPressIn={120}
          onPress={() => Alert.alert('Ajout', 'Selection de la categorie a venir')}
          onPressIn={() => Animated.timing(addScale, { toValue: 0.95, duration: 120, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(addScale, { toValue: 1, useNativeDriver: true }).start()}
        >
          <Animated.View style={{ transform: [{ scale: addScale }], marginTop: wp(16), marginBottom: wp(32) }}>
            <LinearGradient
              colors={['#D4AF37', '#B8941F']}
              style={{
                borderRadius: wp(16), paddingVertical: wp(16),
                flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(8),
              }}
            >
              <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
                <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2" strokeLinecap="round" />
              </Svg>
              <Text style={{ color: '#FFFFFF', fontSize: fp(15), fontWeight: '700' }}>Ajouter des donnees</Text>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function SecretPocketPage({ onBack }) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isUnlocked) {
    return <LockedScreen onUnlock={() => setIsUnlocked(true)} onBack={onBack} />;
  }

  return <UnlockedScreen onBack={onBack} onLock={() => setIsUnlocked(false)} />;
}
