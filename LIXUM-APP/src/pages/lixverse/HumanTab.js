import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated,
  Image, ActivityIndicator, Platform, Modal, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { LIXSIGNS, WORLD_DOTS, TEST_USER_ID, SUPABASE_URL,
  POST_HEADERS } from './lixverseConstants';
import { wp, fp } from '../../constants/layout';

const SCREEN_WIDTH = Dimensions.get('window').width;

const LixSignBubble = ({ sign, isOwn, showText, onPress }) => {
  const category = Object.values(LIXSIGNS).find(cat => cat.signs.some(s => s.id === sign.sign_id));
  const signData = category?.signs.find(s => s.id === sign.sign_id);
  if (!signData || !category) return null;
  return (
    <Pressable onPress={onPress} delayPressIn={120}
      style={({ pressed }) => ({
        flexDirection: isOwn ? 'row-reverse' : 'row',
        alignItems: 'center', gap: wp(8),
        marginBottom: wp(6), alignSelf: isOwn ? 'flex-end' : 'flex-start',
        transform: [{ scale: pressed ? 0.92 : 1 }],
      })}>
      <View style={{
        width: wp(48), height: wp(48), borderRadius: wp(24),
        backgroundColor: isOwn ? 'rgba(0,217,132,0.12)' : 'rgba(77,166,255,0.12)',
        borderWidth: 1.5, borderColor: isOwn ? 'rgba(0,217,132,0.25)' : 'rgba(77,166,255,0.25)',
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Svg width={wp(24)} height={wp(24)} viewBox={signData.viewBox} fill={category.color}>
          <Path d={signData.svgPath} />
        </Svg>
      </View>
      {showText && (
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(10),
          paddingHorizontal: wp(10), paddingVertical: wp(6),
          maxWidth: wp(150),
        }}>
          <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.6)' }}>{signData.text}</Text>
        </View>
      )}
      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.2)' }}>
        {new Date(sign.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Pressable>
  );
};

const SuiviHumainTeaser = ({ showLixAlert }) => {
  const [notifyPressed, setNotifyPressed] = useState(false);
  return (
    <View style={{ paddingHorizontal: wp(16), alignItems: 'center' }}>
      <View style={{ backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: wp(20), paddingHorizontal: wp(16), paddingVertical: wp(6), borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', marginBottom: wp(16) }}>
        <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#D4AF37', letterSpacing: 2 }}>BIENTÔT DISPONIBLE</Text>
      </View>
      <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#EAEEF3', textAlign: 'center', marginBottom: wp(8) }}>Suivi Humain</Text>
      <Text style={{ fontSize: fp(12), color: '#8892A0', textAlign: 'center', lineHeight: fp(18), marginBottom: wp(20), paddingHorizontal: wp(10) }}>
        Un vrai nutritionniste te suit chaque semaine.{'\n'}Tes données santé lui sont envoyées automatiquement.{'\n'}Communication 100% confidentielle via LixTag.
      </Text>
      <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(16), padding: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: wp(20) }}>
        {[
          { step: '1', icon: '🔍', title: 'Trouve ton nutritionniste', desc: 'Recherche parmi des professionnels certifiés. Vois leur expérience dans l\'app.', color: '#4DA6FF' },
          { step: '2', icon: '🔒', title: 'Connexion anonyme', desc: 'Toi et le nutritionniste ne voyez que vos LixTags. LIXUM protège ton identité.', color: '#00D984' },
          { step: '3', icon: '📋', title: 'Rapport hebdomadaire', desc: 'Chaque semaine, le nutritionniste analyse tes données et envoie des recommandations personnalisées.', color: '#D4AF37' },
        ].map((item, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: idx < 2 ? wp(16) : 0 }}>
            <View style={{ alignItems: 'center', marginRight: wp(12), width: wp(30) }}>
              <View style={{ width: wp(28), height: wp(28), borderRadius: wp(14), backgroundColor: item.color + '15', borderWidth: 1.5, borderColor: item.color + '40', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14) }}>{item.icon}</Text>
              </View>
              {idx < 2 && <View style={{ width: 1.5, height: wp(16), backgroundColor: 'rgba(255,255,255,0.08)', marginTop: wp(4) }} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '700', color: item.color, marginBottom: wp(3) }}>{item.title}</Text>
              <Text style={{ fontSize: fp(10), color: '#8892A0', lineHeight: fp(15) }}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.06)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)', marginBottom: wp(16) }}>
        <Text style={{ fontSize: fp(20), marginRight: wp(10) }}>🛡️</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#00D984' }}>100% confidentiel</Text>
          <Text style={{ fontSize: fp(9), color: '#8892A0', marginTop: wp(2) }}>Tu communiques par Lixsigns uniquement. Le nutritionniste ne voit jamais ton nom.</Text>
        </View>
      </View>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,140,66,0.06)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,140,66,0.15)', marginBottom: wp(20) }}>
        <Text style={{ fontSize: fp(20), marginRight: wp(10) }}>⚠️</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FF8C42' }}>Coaching nutritionnel</Text>
          <Text style={{ fontSize: fp(9), color: '#8892A0', marginTop: wp(2) }}>Ce service propose du coaching nutritionnel, pas des consultations médicales. En cas de pathologie, consulte un médecin.</Text>
        </View>
      </View>
      <Pressable
        onPress={() => {
          setNotifyPressed(true);
          showLixAlert('🔔 Notification activée', 'Tu seras prévenu dès le lancement du Suivi Humain !', [{ text: 'Super', color: '#D4AF37' }], '🔔');
        }}
        disabled={notifyPressed}
        style={({ pressed }) => ({
          width: '100%', paddingVertical: wp(14), borderRadius: wp(14),
          backgroundColor: notifyPressed ? 'rgba(212,175,55,0.08)' : pressed ? '#B8952E' : '#D4AF37',
          borderWidth: notifyPressed ? 1 : 0, borderColor: 'rgba(212,175,55,0.3)',
          alignItems: 'center', transform: [{ scale: pressed && !notifyPressed ? 0.97 : 1 }],
        })}
      >
        <Text style={{ fontSize: fp(14), fontWeight: '700', color: notifyPressed ? '#D4AF37' : '#1A1D22' }}>
          {notifyPressed ? '🔔 Tu seras notifié' : '🔔 Me notifier au lancement'}
        </Text>
      </Pressable>
      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: wp(10), marginBottom: wp(20) }}>
        Coût estimé : à partir de 200 Lix/semaine
      </Text>
    </View>
  );
};
