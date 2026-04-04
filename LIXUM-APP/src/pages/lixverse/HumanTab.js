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

export default function HumanTab({
  humanTab,
  setHumanTab,
  binomeStatus,
  binomePartner,
  binomeCommonPoints,
  binomeDistance,
  binomeMessages,
  searchProgress,
  searchStep,
  searchCoords,
  compatibilityScore,
  scanLines,
  retryAfterTime,
  retryCountdown,
  showLixSignPicker,
  setShowLixSignPicker,
  lixSignCategory,
  setLixSignCategory,
  tooltipSign,
  setTooltipSign,
  radarAnim,
  pulseRing1,
  pulseRing2,
  pulseRing3,
  pendingPulse,
  showLixAlert,
  onStartBinomeSearch,
  onResetBinomeState,
  onBreakBinome,
  onSendBinomeRequest,
  onSendLixSign,
}) {
  const HumanTabSelector = ({ activeTab }) => (
    <View style={{
      flexDirection: 'row', marginHorizontal: wp(16), marginBottom: wp(12),
      backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12), padding: wp(3),
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    }}>
      <Pressable onPress={() => setHumanTab('binome')} style={{
        flex: 1, paddingVertical: wp(10), borderRadius: wp(10),
        backgroundColor: activeTab === 'binome' ? 'rgba(0,217,132,0.12)' : 'transparent',
        borderWidth: activeTab === 'binome' ? 1 : 0, borderColor: 'rgba(0,217,132,0.25)', alignItems: 'center',
      }}>
        <Text style={{ fontSize: fp(12), fontWeight: '700', color: activeTab === 'binome' ? '#00D984' : '#6B7B8D' }}>🤝 Binôme</Text>
      </Pressable>
      <Pressable onPress={() => setHumanTab('suivi')} style={{
        flex: 1, paddingVertical: wp(10), borderRadius: wp(10),
        backgroundColor: activeTab === 'suivi' ? 'rgba(212,175,55,0.12)' : 'transparent',
        borderWidth: activeTab === 'suivi' ? 1 : 0, borderColor: 'rgba(212,175,55,0.25)', alignItems: 'center',
      }}>
        <Text style={{ fontSize: fp(12), fontWeight: '700', color: activeTab === 'suivi' ? '#D4AF37' : '#6B7B8D' }}>👨‍⚕️ Suivi Humain</Text>
      </Pressable>
    </View>
  );

  function renderBinomeContent() {
    const radarRotate = radarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const SEARCH_STEP_TEXTS = [
      'Analyse morphologique du profil...',
      'Extraction des paramètres nutritionnels...',
      'Corrélation des objectifs de santé...',
      'Triangulation géographique...',
      'Scan des profils compatibles...',
      'Calcul de l\'indice de compatibilité...',
      'Vérification anti-triche...',
      'Binôme identifié !',
    ];

    if (binomeStatus === 'matched' && binomePartner) {
      const myCalories = 1200;
      const myBurned = 280;
      const myMood = '💪';
      const myWeather = '🌤️';
      return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100), paddingHorizontal: wp(16), paddingTop: wp(8) }}>
          <View style={{ marginHorizontal: wp(-16) }}><HumanTabSelector activeTab="binome" /></View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(16), padding: wp(16), marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>Vous</Text>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.4)' }}>LXM-2K7F4A</Text>
                <Text style={{ fontSize: fp(16) }}>🇧🇮</Text>
                <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginTop: wp(4) }}>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#00D984' }}>Score 72</Text>
                </View>
              </View>
              <View style={{ alignItems: 'center', paddingHorizontal: wp(10) }}>
                <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="#D4AF37">
                  <Path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
                </Svg>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#FFF' }}>{binomePartner.display_name}</Text>
                <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.4)' }}>{binomePartner.lixtag}</Text>
                <Text style={{ fontSize: fp(16) }}>{binomePartner.country_flag}</Text>
                <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginTop: wp(4) }}>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#00D984' }}>Score {binomePartner.vitality_score}</Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'center', marginTop: wp(10), gap: wp(4) }}>
              <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{binomePartner.distance_km?.toLocaleString('fr-FR')} km vous séparent</Text>
              <Text style={{ fontSize: fp(12), fontWeight: '700', color: '#FF8C42' }}>🔥 {binomePartner.streak_days} jours de streak commun</Text>
            </View>
          </View>

          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>Aujourd'hui</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14), marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <View style={{ flexDirection: 'row', marginBottom: wp(4) }}>
              <Text style={{ flex: 1, fontSize: fp(10), fontWeight: '600', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Vous</Text>
              <Text style={{ width: wp(80), fontSize: fp(10), fontWeight: '600', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}></Text>
              <Text style={{ flex: 1, fontSize: fp(10), fontWeight: '600', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>{binomePartner.display_name.split(' ')[0]}</Text>
            </View>
            {[
              { label: 'Calories mangées', mine: myCalories, theirs: binomePartner.today_calories_eaten, icon: '🍽️' },
              { label: 'Calories brûlées', mine: myBurned, theirs: binomePartner.today_calories_burned, icon: '🔥' },
              { label: 'Humeur', mine: myMood, theirs: binomePartner.today_mood, icon: '😊' },
              { label: 'Météo', mine: myWeather, theirs: binomePartner.today_weather, icon: '🌤️' },
            ].map((row, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(6), borderTopWidth: i > 0 ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.04)' }}>
                <Text style={{ flex: 1, fontSize: fp(13), fontWeight: '600', color: '#FFF', textAlign: 'center' }}>{row.mine}</Text>
                <Text style={{ width: wp(80), fontSize: fp(10), color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{row.icon} {row.label.split(' ').pop()}</Text>
                <Text style={{ flex: 1, fontSize: fp(13), fontWeight: '600', color: '#FFF', textAlign: 'center' }}>{row.theirs}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>Objectif du jour</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14), marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(8) }}>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Progression commune</Text>
              <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#00D984' }}>68%</Text>
            </View>
            <View style={{ height: wp(8), borderRadius: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <View style={{ height: '100%', width: '68%', borderRadius: wp(4), backgroundColor: '#00D984' }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: wp(10), gap: wp(6) }}>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>🔥 {binomePartner.streak_days} jours consécutifs réussis</Text>
            </View>
          </View>

          <Pressable delayPressIn={120} onPress={() => setShowLixSignPicker(true)} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], marginBottom: wp(16) })}>
            <LinearGradient colors={['#D4AF37', '#B8941F']} style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: wp(8) }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="#FFF">
                <Path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </Svg>
              <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>Envoyer un LixSign</Text>
            </LinearGradient>
          </Pressable>

          {binomeMessages.length > 0 && (
            <View>
              <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>Messages récents</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(14), padding: wp(12), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                {binomeMessages.slice(-10).reverse().map(msg => (
                  <LixSignBubble
                    key={msg.id}
                    sign={msg}
                    isOwn={msg.from === 'me'}
                    showText={msg.showText || tooltipSign === msg.id}
                    onPress={() => {
                      if (msg.from === 'partner') {
                        setTooltipSign(msg.id);
                        setTimeout(() => setTooltipSign(null), 3000);
                      }
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          <Pressable onPress={onBreakBinome} style={{ paddingVertical: wp(20), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(255,75,75,0.4)' }}>Rompre le Binôme</Text>
          </Pressable>
        </ScrollView>
      );
    }

    return <View><Text style={{ color: 'rgba(255,255,255,0.3)' }}>Loading binome states...</Text></View>;
  }

  if (humanTab === 'suivi') {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: wp(8), paddingBottom: wp(100) }}>
          <HumanTabSelector activeTab="suivi" />
          <SuiviHumainTeaser showLixAlert={showLixAlert} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {renderBinomeContent()}
    </View>
  );
}
