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

    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: wp(100), paddingTop: wp(8) }}>
        <HumanTabSelector activeTab="binome" />
        <View style={{ alignItems: 'center', paddingHorizontal: wp(16) }}>
          <Text style={{ fontSize: fp(22), fontWeight: '800', color: '#D4AF37', letterSpacing: 2, marginBottom: wp(4) }}>BINÔME</Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(16) }}>Trouve ton partenaire santé</Text>
        </View>

        {(binomeStatus === 'none' || binomeStatus === 'searching') && (
          <View style={{
            marginHorizontal: wp(16), borderRadius: wp(16), overflow: 'hidden',
            borderWidth: 1.5, borderColor: 'rgba(77,166,255,0.12)',
            height: wp(180), position: 'relative',
            backgroundColor: '#0D1117',
          }}>
            <Image
              source={require('../../assets/world-map-dark.webp')}
              style={{ width: '100%', height: '100%', position: 'absolute', opacity: 0.75 }}
              resizeMode="cover"
            />
            {WORLD_DOTS.map((dot, i) => {
              const dotSize = dot.size === 'large' ? wp(4) : dot.size === 'medium' ? wp(3) : wp(2);
              return (
                <View key={i} style={{
                  position: 'absolute',
                  left: (dot.x / 800) * (SCREEN_WIDTH - wp(32)) - dotSize / 2,
                  top: (dot.y / 400) * wp(180) - dotSize / 2,
                  width: dotSize, height: dotSize, borderRadius: dotSize / 2,
                  backgroundColor: 'rgba(180, 210, 240, 0.3)',
                }} />
              );
            })}
            {binomeStatus === 'searching' && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                {[pulseRing1, pulseRing2, pulseRing3].map((anim, i) => (
                  <Animated.View key={i} style={{
                    position: 'absolute',
                    width: wp(160), height: wp(160), borderRadius: wp(80),
                    borderWidth: 1, borderColor: '#D4AF37',
                    opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1.2] }) }],
                  }} />
                ))}
                <Animated.View style={{
                  position: 'absolute', width: wp(2), height: wp(70),
                  backgroundColor: '#D4AF37', opacity: 0.5,
                  transform: [{ rotate: radarRotate }],
                }} />
                <View style={{
                  width: wp(14), height: wp(14), borderRadius: wp(7),
                  backgroundColor: '#D4AF37', borderWidth: 2.5, borderColor: '#FFF',
                  shadowColor: '#D4AF37', shadowOpacity: 1, shadowRadius: wp(10), elevation: 8,
                }} />
                {scanLines.map((line, i) => (
                  <View key={line.id || i} style={{
                    position: 'absolute', left: line.x1, top: line.y1,
                    width: line.length, height: 1,
                    backgroundColor: 'rgba(212,175,55,0.12)',
                    transform: [{ rotate: line.angle + 'deg' }],
                  }} />
                ))}
              </View>
            )}
          </View>
        )}

        {(binomeStatus === 'none' || binomeStatus === 'searching') && (
          <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: wp(8), marginBottom: wp(12) }}>4 832 membres actifs</Text>
        )}

        {binomeStatus === 'searching' && (
          <View style={{ marginHorizontal: wp(16), marginTop: wp(4) }}>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: wp(12), padding: wp(12), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(8) }}>
                <Text style={{ fontSize: fp(9), fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(0,217,132,0.5)' }}>LAT {searchCoords.lat}</Text>
                <Text style={{ fontSize: fp(9), fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(0,217,132,0.5)' }}>LNG {searchCoords.lng}</Text>
                <Text style={{ fontSize: fp(9), fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: 'rgba(212,175,55,0.5)' }}>{searchProgress}%</Text>
              </View>
              <View style={{ height: wp(4), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(2), marginBottom: wp(8), overflow: 'hidden' }}>
                <LinearGradient colors={['#00D984', '#D4AF37']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: searchProgress + '%', borderRadius: wp(2) }} />
              </View>
              <Text style={{ fontSize: fp(11), color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginBottom: wp(4) }}>
                {'> '}{SEARCH_STEP_TEXTS[searchStep] || '...'}
              </Text>
              {compatibilityScore > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginTop: wp(4) }}>
                  <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.3)', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>COMPATIBILITÉ</Text>
                  <View style={{ flex: 1, height: wp(3), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: wp(1.5), overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: compatibilityScore + '%', backgroundColor: compatibilityScore > 70 ? '#00D984' : '#FF8C42', borderRadius: wp(1.5) }} />
                  </View>
                  <Text style={{ fontSize: fp(10), fontWeight: '700', color: compatibilityScore > 70 ? '#00D984' : '#FF8C42', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{compatibilityScore}%</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {binomeStatus === 'proposed' && binomePartner && (
          <View style={{ paddingHorizontal: wp(16) }}>
            <View style={{ alignItems: 'center', marginBottom: wp(12) }}>
              <View style={{ backgroundColor: 'rgba(0,217,132,0.12)', borderRadius: wp(20), paddingHorizontal: wp(16), paddingVertical: wp(6), borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)', flexDirection: 'row', alignItems: 'center', gap: wp(6) }}>
                <Text style={{ fontSize: fp(11), color: 'rgba(0,217,132,0.6)' }}>Compatibilité</Text>
                <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#00D984' }}>{compatibilityScore}%</Text>
              </View>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(16), padding: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: wp(12) }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(12) }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>Vous</Text>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>LXM-2K7F4A</Text>
                  <Text style={{ fontSize: fp(20), marginTop: wp(4) }}>🇧🇮</Text>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginTop: wp(4) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>Score 72</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', paddingHorizontal: wp(10) }}>
                  <Text style={{ fontSize: fp(24), color: 'rgba(212,175,55,0.5)' }}>⇄</Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#FFF' }}>{binomePartner.display_name}</Text>
                  <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.35)' }}>{binomePartner.lixtag}</Text>
                  <Text style={{ fontSize: fp(20), marginTop: wp(4) }}>{binomePartner.country_flag}</Text>
                  <View style={{ backgroundColor: 'rgba(0,217,132,0.15)', borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginTop: wp(4) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }}>Score {binomePartner.vitality_score}</Text>
                  </View>
                </View>
              </View>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginBottom: wp(8) }}>
                {binomeDistance ? binomeDistance.toLocaleString('fr-FR') + ' km vous séparent' : ''}
              </Text>
              <Text style={{ fontSize: fp(12), fontWeight: '600', color: '#D4AF37', marginBottom: wp(8) }}>Points en commun</Text>
              {binomeCommonPoints.map((point, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), paddingVertical: wp(6), borderBottomWidth: i < binomeCommonPoints.length - 1 ? 1 : 0, borderBottomColor: 'rgba(255,255,255,0.04)' }}>
                  <View style={{ width: wp(24), height: wp(24), borderRadius: wp(12), backgroundColor: 'rgba(0,217,132,0.12)', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(11), color: '#00D984' }}>✓</Text>
                  </View>
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', flex: 1 }}>{point.text}</Text>
                </View>
              ))}
            </View>
            <Pressable delayPressIn={120} onPress={onSendBinomeRequest}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
              <LinearGradient colors={['#D4AF37', '#B8941F']}
                style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(8) }}>
                <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Envoyer la demande</Text>
                <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.6)', marginTop: wp(2) }}>
                  Une invitation sera envoyée à {binomePartner.display_name}
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={onResetBinomeState} style={{ paddingVertical: wp(12), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.25)' }}>Chercher quelqu'un d'autre</Text>
            </Pressable>
          </View>
        )}

        {binomeStatus === 'pending_sent' && binomePartner && (
          <View style={{ paddingHorizontal: wp(16), alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(16), padding: wp(20), borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', alignItems: 'center', width: '100%', marginBottom: wp(16) }}>
              <Text style={{ fontSize: fp(28), marginBottom: wp(8) }}>{binomePartner.country_flag}</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>{binomePartner.display_name}</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginBottom: wp(16) }}>{binomePartner.lixtag}</Text>
              <Animated.View style={{ width: '100%', opacity: pendingPulse }}>
                <View style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.3)' }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#D4AF37' }}>En attente de confirmation...</Text>
                </View>
              </Animated.View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginTop: wp(12) }}>
                <ActivityIndicator size="small" color="#D4AF37" />
                <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.5)' }}>Notification envoyée à {binomePartner.display_name}</Text>
              </View>
            </View>
            <Pressable onPress={() => { pendingPulse.stopAnimation(); onResetBinomeState(); }} style={{ paddingVertical: wp(12) }}>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.25)' }}>Annuler la demande</Text>
            </Pressable>
          </View>
        )}

        {binomeStatus === 'declined' && (
          <View style={{ paddingHorizontal: wp(16), alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(255,107,107,0.06)', borderRadius: wp(16), padding: wp(24), borderWidth: 1, borderColor: 'rgba(255,107,107,0.12)', alignItems: 'center', width: '100%', marginBottom: wp(16) }}>
              <Text style={{ fontSize: fp(36), marginBottom: wp(12) }}>😔</Text>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>Demande déclinée</Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: fp(18) }}>
                {binomePartner?.display_name || 'L\'utilisateur'} a décliné l'invitation.{'\n'}Votre identité reste confidentielle.
              </Text>
            </View>
            <Pressable delayPressIn={120} onPress={onResetBinomeState}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], width: '100%' })}>
              <LinearGradient colors={['#D4AF37', '#B8941F']}
                style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Relancer la recherche</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {binomeStatus === 'no_match' && (
          <View style={{ paddingHorizontal: wp(16), alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(16), padding: wp(24), borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', width: '100%', marginBottom: wp(16) }}>
              <View style={{ width: wp(70), height: wp(70), borderRadius: wp(35), backgroundColor: 'rgba(77,166,255,0.1)', borderWidth: 1, borderColor: 'rgba(77,166,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: wp(16) }}>
                <Svg width={wp(32)} height={wp(32)} viewBox="0 0 24 24" fill="none">
                  <Circle cx="11" cy="11" r="7" stroke="#4DA6FF" strokeWidth="1.5" />
                  <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" />
                  <Path d="M11 8a3 3 0 00-3 3" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" />
                </Svg>
              </View>
              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', marginBottom: wp(6), textAlign: 'center' }}>Aucun binôme disponible</Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: fp(18), marginBottom: wp(16) }}>
                Tous les profils compatibles ont déjà un binôme actif. De nouveaux membres rejoignent LIXUM chaque jour !
              </Text>
              {retryAfterTime && (
                <View style={{ backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: wp(14), padding: wp(16), width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)' }}>
                  <Text style={{ fontSize: fp(10), color: 'rgba(212,175,55,0.5)', letterSpacing: 1, marginBottom: wp(6) }}>PROCHAINE TENTATIVE DANS</Text>
                  <Text style={{ fontSize: fp(24), fontWeight: '800', color: '#D4AF37', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>{retryCountdown || '—'}</Text>
                </View>
              )}
              {!retryAfterTime ? (
                <Pressable delayPressIn={120} onPress={onResetBinomeState}
                  style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], width: '100%', marginTop: wp(16) })}>
                  <LinearGradient colors={['#D4AF37', '#B8941F']}
                    style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Relancer la recherche</Text>
                  </LinearGradient>
                </Pressable>
              ) : (
                <View style={{ width: '100%', marginTop: wp(16), paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: 'rgba(255,255,255,0.2)' }}>Recherche verrouillée</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), backgroundColor: 'rgba(0,217,132,0.06)', borderRadius: wp(12), padding: wp(12), width: '100%', borderWidth: 1, borderColor: 'rgba(0,217,132,0.1)' }}>
              <Text style={{ fontSize: fp(16) }}>💡</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,217,132,0.6)', flex: 1, lineHeight: fp(16) }}>
                En attendant, continue tes défis et améliore ton Score Vitalité pour augmenter tes chances de match !
              </Text>
            </View>
          </View>
        )}

        {binomeStatus === 'none' && (
          <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: wp(16) }}>
            {retryAfterTime ? (
              <View style={{ width: '100%', paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: 'rgba(255,255,255,0.2)' }}>
                  Recherche disponible dans {retryCountdown || '—'}
                </Text>
              </View>
            ) : (
              <Pressable delayPressIn={120} onPress={onStartBinomeSearch} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }], width: '100%' })}>
                <LinearGradient colors={['#D4AF37', '#B8941F']} style={{ paddingVertical: wp(16), borderRadius: wp(16), alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Appeler mon Binôme</Text>
                </LinearGradient>
              </Pressable>
            )}
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)', marginTop: wp(12), textAlign: 'center' }}>
              Matching basé sur : objectifs, régime, activités
            </Text>
          </View>
        )}
      </ScrollView>
    );
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

      {showLixSignPicker && (
        <Modal visible={true} transparent animationType="slide" onRequestClose={() => setShowLixSignPicker(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <LinearGradient colors={['#2A2F36', '#1E2328', '#252A30']} style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), maxHeight: '70%' }}>
              <View style={{ padding: wp(16), borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(12) }}>
                  <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>Envoyer un LixSign</Text>
                  <Pressable onPress={() => setShowLixSignPicker(false)}>
                    <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>✕</Text>
                  </Pressable>
                </View>
                <View style={{
                  flexDirection: 'row', alignItems: 'center', gap: wp(8),
                  backgroundColor: 'rgba(0,217,132,0.06)', borderRadius: wp(10),
                  padding: wp(10), marginBottom: wp(12),
                  borderWidth: 1, borderColor: 'rgba(0,217,132,0.1)',
                }}>
                  <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#00D984" strokeWidth="1.5" strokeLinejoin="round"/>
                  </Svg>
                  <Text style={{ fontSize: fp(9), color: 'rgba(0,217,132,0.6)', flex: 1, lineHeight: fp(13) }}>
                    Chez LIXUM, la communication se fait par signes pour protéger votre santé mentale et prévenir tout harcèlement.
                  </Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: wp(6) }}>
                    {Object.entries(LIXSIGNS).map(([key, cat]) => (
                      <Pressable key={key} onPress={() => setLixSignCategory(key)}
                        style={{
                          paddingHorizontal: wp(12), paddingVertical: wp(6), borderRadius: wp(10),
                          backgroundColor: lixSignCategory === key ? cat.color + '25' : 'rgba(255,255,255,0.05)',
                          borderWidth: 1, borderColor: lixSignCategory === key ? cat.color + '50' : 'rgba(255,255,255,0.08)',
                        }}>
                        <Text style={{ fontSize: fp(10), fontWeight: '600', color: lixSignCategory === key ? cat.color : 'rgba(255,255,255,0.4)' }}>{cat.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <ScrollView contentContainerStyle={{ padding: wp(16) }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(10), justifyContent: 'center' }}>
                  {LIXSIGNS[lixSignCategory]?.signs.map(sign => (
                    <Pressable key={sign.id} delayPressIn={120} onPress={() => onSendLixSign(sign)}
                      style={({ pressed }) => ({
                        width: (SCREEN_WIDTH - wp(74)) / 3, alignItems: 'center', paddingVertical: wp(12),
                        borderRadius: wp(14), backgroundColor: 'rgba(255,255,255,0.04)',
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                        transform: [{ scale: pressed ? 0.9 : 1 }],
                      })}>
                      <View style={{
                        width: wp(48), height: wp(48), borderRadius: wp(24),
                        backgroundColor: LIXSIGNS[lixSignCategory].color + '15',
                        borderWidth: 1, borderColor: LIXSIGNS[lixSignCategory].color + '30',
                        justifyContent: 'center', alignItems: 'center', marginBottom: wp(6),
                      }}>
                        <Svg width={wp(24)} height={wp(24)} viewBox={sign.viewBox} fill={LIXSIGNS[lixSignCategory].color}>
                          <Path d={sign.svgPath} />
                        </Svg>
                      </View>
                      <Text style={{ fontSize: fp(9), color: 'rgba(255,255,255,0.5)', textAlign: 'center' }} numberOfLines={1}>{sign.text}</Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </LinearGradient>
          </View>
        </Modal>
      )}
    </View>
  );
}
