// ──────────────────────────────────────────────────────────────────────────────
// MediBookPage.js — MediBook : Rapport Sante Imprimable (3 mois)
// ──────────────────────────────────────────────────────────────────────────────
import React, { useRef } from 'react';
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
// DATA — Etat des donnees (hardcoded)
// ============================================
const dataStatus = [
  { name: 'Nutrition', days: 87, total: 90, percent: 96 },
  { name: 'Hydratation', days: 72, total: 90, percent: 80 },
  { name: 'Activite physique', days: 45, total: 90, percent: 50 },
  { name: 'Humeur', days: 60, total: 90, percent: 67 },
  { name: 'Conversations ALIXEN', days: 8, total: null, percent: null, status: 'OK' },
  { name: 'Secret Pocket', days: null, total: null, percent: null, status: 'Optionnel' },
];

const sections = [
  { icon: 'user', title: 'Page de garde', desc: 'Nom, age, LixTag, periode', color: '#00D984' },
  { icon: 'body', title: 'Profil morphologique', desc: 'Poids, taille, BMI, BMR, TDEE', color: '#4DA6FF' },
  { icon: 'food', title: 'Nutrition 3 mois', desc: 'Calories, macros, tendances', color: '#FF8C42' },
  { icon: 'water', title: 'Hydratation', desc: 'Moyenne vs objectif', color: '#4DA6FF' },
  { icon: 'run', title: 'Activite physique', desc: 'Frequence, types, calories', color: '#00D984' },
  { icon: 'mood', title: "Courbe d'humeur", desc: 'Evolution et correlations', color: '#9B6DFF' },
  { icon: 'alert', title: "Points d'attention", desc: 'Carences, alertes ALIXEN', color: '#FF6B6B' },
  { icon: 'qr', title: 'QR Code profil', desc: 'Lien vers votre profil Lixum', color: '#D4AF37' },
];

// ============================================
// SECTION ICONS — SF Symbols style
// ============================================
const SectionIcon = ({ type, color, size = wp(18) }) => {
  switch (type) {
    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
          <Path d="M4 21v-1a6 6 0 0112 0v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case 'body':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="5" r="3" stroke={color} strokeWidth="1.5" />
          <Path d="M12 10v8m-4-6h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M9 22l3-4 3 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'food':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 2v8c0 1.1.9 2 2 2h2a2 2 0 002-2V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="6" y1="2" x2="6" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M18 2c0 4-2 6-2 10h4c0-4-2-6-2-10z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <Line x1="18" y1="12" x2="18" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    case 'water':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2c-4 6-7 9-7 13a7 7 0 0014 0c0-4-3-7-7-13z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        </Svg>
      );
    case 'run':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="14" cy="4" r="2" stroke={color} strokeWidth="1.5" />
          <Path d="M6 20l4-4 2 2 4-5 2 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M10 16l-2-4 5-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'mood':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
          <Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="9" cy="10" r="0.5" fill={color} />
          <Circle cx="15" cy="10" r="0.5" fill={color} />
        </Svg>
      );
    case 'alert':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
          <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="12" cy="16" r="0.5" fill={color} />
        </Svg>
      );
    case 'qr':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
          <Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
          <Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" />
          <Rect x="14" y="14" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5" />
          <Line x1="21" y1="14" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="14" y1="21" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    default:
      return null;
  }
};

// ============================================
// PROGRESS BAR
// ============================================
const getBarColor = (percent) => {
  if (percent >= 80) return '#00D984';
  if (percent >= 50) return '#FF8C42';
  return '#FF6B6B';
};

const ProgressRow = ({ item }) => {
  const hasPercent = item.percent !== null;
  const barColor = hasPercent ? getBarColor(item.percent) : '#4A4F55';
  const detail = item.total
    ? `${item.days} jours sur ${item.total}`
    : item.days
    ? `${item.days} sessions`
    : '';

  return (
    <View style={{ marginBottom: wp(14) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(4) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436' }}>{item.name}</Text>
          {detail ? <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)' }}>{detail}</Text> : null}
        </View>
        <Text style={{
          fontSize: fp(12), fontWeight: '700',
          color: hasPercent ? barColor : 'rgba(0,0,0,0.35)',
        }}>
          {hasPercent ? `${item.percent}%` : item.status}
        </Text>
      </View>
      <View style={{ height: wp(6), borderRadius: wp(3), backgroundColor: '#E8ECF0', overflow: 'hidden' }}>
        <View style={{
          height: '100%',
          width: hasPercent ? `${item.percent}%` : (item.status === 'OK' ? '40%' : '15%'),
          borderRadius: wp(3),
          backgroundColor: barColor,
        }} />
      </View>
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function MediBookPage({ onBack }) {
  const generateScale = useRef(new Animated.Value(1)).current;

  return (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="light-content" />

      {/* ===== HEADER ===== */}
      <LinearGradient
        colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
        style={{
          paddingTop: Platform.OS === 'android' ? 35 : 50,
          paddingBottom: wp(14),
          paddingHorizontal: wp(16),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#4A4F55',
        }}
      >
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
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View>
            <Text style={{ color: '#FFFFFF', fontSize: fp(22), fontWeight: '700' }}>MediBook</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: fp(12) }}>Votre rapport sante</Text>
          </View>
        </View>
        {/* Badge prix */}
        <View style={{
          backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(10),
          paddingHorizontal: wp(10), paddingVertical: wp(4),
        }}>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>500 Lix</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(40) }}
      >
        {/* ===== ILLUSTRATION CENTRALE ===== */}
        <View style={{ alignItems: 'center', marginTop: wp(24), marginBottom: wp(20) }}>
          <Svg width={wp(80)} height={wp(80)} viewBox="0 0 64 64" fill="none">
            <Rect x="12" y="8" width="28" height="48" rx="3" stroke="#00D984" strokeWidth="1.5" />
            <Line x1="18" y1="18" x2="34" y2="18" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="24" x2="34" y2="24" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="30" x2="30" y2="30" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Line x1="18" y1="36" x2="28" y2="36" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="46" cy="20" r="6" stroke="#00D984" strokeWidth="1.5" />
            <Path d="M46 26v10c0 4-3 7-7 7s-7-3-7-7" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
            <Circle cx="46" cy="20" r="2" fill="#00D984" />
          </Svg>
        </View>

        {/* ===== ETAT DES DONNEES ===== */}
        <View style={{
          backgroundColor: '#FAFBFC', borderRadius: wp(16),
          borderLeftWidth: wp(3), borderLeftColor: '#00D984',
          padding: wp(16), marginBottom: wp(20),
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
        }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', marginBottom: wp(16) }}>
            Etat de vos donnees
          </Text>
          {dataStatus.map((item, i) => (
            <ProgressRow key={i} item={item} />
          ))}
        </View>

        {/* ===== CONTENU DU RAPPORT ===== */}
        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', marginTop: wp(4), marginBottom: wp(14) }}>
          Contenu de votre MediBook
        </Text>
        {sections.map((sec, i) => (
          <LinearGradient
            key={i}
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: wp(12), padding: wp(12), marginBottom: wp(8),
              borderWidth: 1, borderColor: '#4A4F55',
            }}
          >
            <View style={{
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: `${sec.color}20`,
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <SectionIcon type={sec.icon} color={sec.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: fp(13), fontWeight: '600' }}>{sec.title}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(11) }}>{sec.desc}</Text>
            </View>
          </LinearGradient>
        ))}

        {/* ===== BOUTON GENERER ===== */}
        <Pressable
          delayPressIn={120}
          onPress={() => Alert.alert('MediBook', 'La generation de votre MediBook sera disponible prochainement !')}
          onPressIn={() => Animated.timing(generateScale, { toValue: 0.95, duration: 120, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(generateScale, { toValue: 1, useNativeDriver: true }).start()}
        >
          <Animated.View style={{ transform: [{ scale: generateScale }], marginTop: wp(24), marginBottom: wp(32) }}>
            <LinearGradient
              colors={['#00D984', '#00B871']}
              style={{
                borderRadius: wp(16), paddingVertical: wp(16),
                flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(10),
              }}
            >
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="12" height="18" rx="2" stroke="#FFF" strokeWidth="1.5" />
                <Line x1="8" y1="7" x2="12" y2="7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Line x1="8" y1="11" x2="12" y2="11" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Path d="M16 8l4 4-4 4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: fp(16), fontWeight: '700' }}>Generer mon MediBook</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fp(11) }}>500 Lix — Rapport PDF 3 mois</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
      </ScrollView>
    </View>
  );
}
