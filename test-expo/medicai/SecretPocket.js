import React from 'react';
import {
  View, Text, ScrollView, Modal, Platform, StatusBar, Pressable,
} from 'react-native';
import Svg, {
  Rect, Path, Circle, Line,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { wp, fp } from './constants';
import { BottomSpacer } from './shared';

// ============================================
// SECRET POCKET — DATA + ICONS
// ============================================
// TODO: Quand le champ is_secret sera ajouté dans Supabase,
// remplacer les compteurs hardcodés par les données réelles :
// count: medicalData.analyses.filter(a => a.is_secret).length
// count: medicalData.allergies.filter(a => a.is_secret).length
// etc.
export const spCategories = [
  { id: 'diagnostics', title: 'Diagnostics à surveiller', desc: 'Diabète, hypertension, cholestérol...', icon: 'heart-pulse', color: '#FF6B6B', count: 0 },
  { id: 'allergies', title: 'Allergies et intolérances', desc: 'Alimentaires, médicamenteuses...', icon: 'shield-alert', color: '#FF8C42', count: 0 },
  { id: 'medications', title: 'Médicaments en cours', desc: 'Traitements actuels et posologie', icon: 'pill', color: '#4DA6FF', count: 0 },
  { id: 'lab-results', title: "Résultats d'analyses", desc: 'Bilans sanguins, examens...', icon: 'flask', color: '#00D984', count: 0 },
  { id: 'notes', title: 'Notes personnelles', desc: 'Vos observations de santé', icon: 'edit', color: '#9B6DFF', count: 0 },
  { id: 'conversations', title: 'Conversations sensibles', desc: 'Échanges privés avec ALIXEN', icon: 'message-lock', color: '#D4AF37', count: 0 },
];

export const renderCategoryIcon = (iconName, color, size = wp(20)) => {
  switch (iconName) {
    case 'heart-pulse':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke={color} strokeWidth="1.5" /><Path d="M3 12h4l3-6 4 12 3-6h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'shield-alert':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke={color} strokeWidth="1.5" /><Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="12" cy="16" r="0.5" fill={color} /></Svg>);
    case 'pill':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M10.5 1.5l-8 8a4.24 4.24 0 006 6l8-8a4.24 4.24 0 00-6-6z" stroke={color} strokeWidth="1.5" /><Line x1="8" y1="8" x2="14" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'flask':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M9 2v6l-5 8a3 3 0 002.6 4.5h10.8A3 3 0 0020 16l-5-8V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="9" y1="2" x2="15" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M7 15h10" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'edit':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke={color} strokeWidth="1.5" /></Svg>);
    case 'message-lock':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={color} strokeWidth="1.5" /><Rect x="9" y="8" width="6" height="5" rx="1" stroke={color} strokeWidth="1.5" /><Path d="M10 8V6.5a2 2 0 014 0V8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    default: return null;
  }
};

export const SecretPocketContent = ({ isUnlocked, setIsUnlocked, setCurrentSubPage, showAlert, spCategories, openSpCategory, setOpenSpCategory, secretPocketItems }) => {

  const renderSecretPocketLocked = () => (
    <LinearGradient colors={['#1A1D22', '#252A30', '#1A1D22']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View style={{ paddingTop: Platform.OS === 'android' ? 40 : 55, paddingHorizontal: wp(16) }}>
        <Pressable delayPressIn={120}
          onPress={() => { setIsUnlocked(false); setCurrentSubPage('main'); }}
          style={({ pressed }) => ({
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
            justifyContent: 'center', alignItems: 'center',
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: wp(70) }}>
        <Svg width={wp(90)} height={wp(90)} viewBox="0 0 64 64" fill="none">
          <Path d="M32 4L8 16v12c0 16.5 10.2 31.9 24 36 13.8-4.1 24-19.5 24-36V16L32 4z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" />
          <Rect x="22" y="26" width="20" height="16" rx="3" stroke="#D4AF37" strokeWidth="1.5" />
          <Path d="M26 26v-4a6 6 0 0112 0v4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="32" cy="34" r="2" fill="#D4AF37" />
          <Line x1="32" y1="36" x2="32" y2="39" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
        <Text style={{ color: '#D4AF37', fontSize: fp(24), fontWeight: '800', letterSpacing: 1, marginTop: wp(20) }}>Secret Pocket</Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(13), marginTop: wp(6) }}>Votre coffre-fort santé confidentiel</Text>

        <Pressable delayPressIn={120} onPress={() => setIsUnlocked(true)}
          style={({ pressed }) => ({
            width: wp(70), height: wp(70), borderRadius: wp(35),
            backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1.5, borderColor: '#D4AF37',
            justifyContent: 'center', alignItems: 'center', marginTop: wp(32),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(34)} height={wp(34)} viewBox="0 0 24 24" fill="none">
            <Path d="M3.5 11c0-4.69 3.81-8.5 8.5-8.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M20.5 11c0-4.69-3.81-8.5-8.5-8.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M5.5 11c0-3.59 2.91-6.5 6.5-6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M18.5 11c0-3.59-2.91-6.5-6.5-6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M7.5 11a4.5 4.5 0 014.5-4.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M16.5 11a4.5 4.5 0 00-4.5-4.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M9.5 11a2.5 2.5 0 015 0" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M3.5 11v1.5c0 2.5 1 4.8 2.6 6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M20.5 11v1.5c0 2.5-1 4.8-2.6 6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M5.5 11v3c0 2 1.2 3.8 3 5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M18.5 11v3c0 2-1.2 3.8-3 5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M9.5 11v5c0 1 .5 2 1.5 2.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M14.5 11v5c0 1-.5 2-1.5 2.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
            <Path d="M12 11v8" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
          </Svg>
        </Pressable>
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: fp(11), marginTop: wp(12) }}>Appuyez pour déverrouiller</Text>
      </View>

      {/* Texte confiance — fixed: paddingBottom wp(50) */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: wp(6), paddingBottom: wp(50), marginBottom: wp(10),
      }}>
        <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
          <Rect x="5" y="11" width="14" height="10" rx="2" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <Path d="M8 11V7a4 4 0 018 0v4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fp(10) }}>Chiffrement de bout en bout</Text>
      </View>
    </LinearGradient>
  );

  // ── RENDER SECRET POCKET — UNLOCKED ────────────────────────────────────
  const renderSecretPocketUnlocked = () => (
    <LinearGradient colors={['#1A1D22', '#252A30', '#1E2328']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{
        paddingTop: Platform.OS === 'android' ? 35 : 50,
        paddingBottom: wp(12), paddingHorizontal: wp(16),
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: 'rgba(74,79,85,0.5)',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(12) }}>
          <Pressable delayPressIn={120}
            onPress={() => { setIsUnlocked(false); setCurrentSubPage('main'); }}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: '#252A30', borderWidth: 1, borderColor: '#4A4F55',
              justifyContent: 'center', alignItems: 'center',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View>
            <Text style={{ color: '#D4AF37', fontSize: fp(20), fontWeight: '700' }}>Secret Pocket</Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(11) }}>Espace confidentiel</Text>
          </View>
        </View>
        <Pressable delayPressIn={120}
          onPress={() => {
            showAlert(
              'Verrouiller',
              'Votre Secret Pocket sera verrouillé.',
              [
                { text: 'Verrouiller', onPress: () => { setIsUnlocked(false); setCurrentSubPage('main'); } },
                { text: 'Annuler', style: 'cancel' },
              ],
              'lock'
            );
          }}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: wp(4),
            backgroundColor: 'rgba(212,175,55,0.1)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
            borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: wp(5),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
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
        <Text style={{ color: 'rgba(212,175,55,0.6)', fontSize: fp(10) }}>Chiffré et sécurisé — Auto-lock 30s</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(50) }}>
        {/* Categories — MetalCard gradient */}
        {spCategories.map((cat) => (
          <Pressable key={cat.id} delayPressIn={120}
            onPress={() => setOpenSpCategory(cat.id)}
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }], marginBottom: wp(10) })}>
            <LinearGradient colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
              style={{
                flexDirection: 'row', alignItems: 'center',
                borderRadius: wp(16), padding: wp(16),
                borderWidth: 1, borderColor: '#4A4F55',
              }}>
              <View style={{
                width: wp(44), height: wp(44), borderRadius: wp(22),
                backgroundColor: `${cat.color}1F`,
                justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
              }}>
                {renderCategoryIcon(cat.icon, cat.color)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: fp(14), fontWeight: '600' }}>{cat.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: fp(11), marginTop: wp(2) }}>{cat.desc}</Text>
              </View>
              {cat.count > 0 ? (
                <View style={{
                  width: wp(24), height: wp(24), borderRadius: wp(12),
                  backgroundColor: `${cat.color}33`,
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(8),
                }}>
                  <Text style={{ color: cat.color, fontSize: fp(11), fontWeight: '700' }}>{cat.count}</Text>
                </View>
              ) : (
                <View style={{
                  width: wp(24), height: wp(24), borderRadius: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(8),
                }}>
                  <Text style={{ fontSize: fp(11), fontWeight: '600', color: 'rgba(255,255,255,0.2)' }}>0</Text>
                </View>
              )}
              <Text style={{ color: 'rgba(255,255,255,0.15)', fontSize: fp(16) }}>{">"}</Text>
            </LinearGradient>
          </Pressable>
        ))}

        {/* Info — transfert depuis MediBook */}
        <View style={{
          padding: wp(16), marginTop: wp(10),
          backgroundColor: 'rgba(212,175,55,0.05)',
          borderRadius: wp(14), borderWidth: 1,
          borderColor: 'rgba(212,175,55,0.1)',
        }}>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: fp(17) }}>
            Pour ajouter des données, importez-les d'abord dans MediBook puis transférez-les ici.
          </Text>
        </View>
        <BottomSpacer />
      </ScrollView>
    </LinearGradient>
  );

  const openCat = spCategories ? spCategories.find(c => c.id === openSpCategory) : null;
  const catItems = secretPocketItems ? secretPocketItems.filter(i => i.category === openSpCategory) : [];

  if (!isUnlocked) return renderSecretPocketLocked();
  return (
    <>
      {renderSecretPocketUnlocked()}
      {/* Category detail Modal */}
      <Modal visible={!!openSpCategory} transparent animationType="slide" onRequestClose={() => setOpenSpCategory(null)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setOpenSpCategory(null)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
                minHeight: wp(200),
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(20) }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(16) }}>
                {openCat && (
                  <View style={{
                    width: wp(40), height: wp(40), borderRadius: wp(20),
                    backgroundColor: (openCat.color || '#D4AF37') + '1F',
                    justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                  }}>
                    {renderCategoryIcon(openCat.icon, openCat.color)}
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>{openCat ? openCat.title : ''}</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>
                    {catItems.length} élément{catItems.length > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {catItems.length === 0 ? (
                <View style={{ paddingVertical: wp(30), alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: fp(13), textAlign: 'center' }}>
                    Aucun élément dans cette catégorie.{'\n'}Transférez des données depuis MediBook.
                  </Text>
                </View>
              ) : (
                <ScrollView style={{ maxHeight: wp(250) }}>
                  {catItems.map((item, idx) => (
                    <View key={item.id || idx} style={{
                      flexDirection: 'row', alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: wp(12), padding: wp(12), marginBottom: wp(8),
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#FFF', fontSize: fp(13), fontWeight: '600' }}>{item.name}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: fp(10), marginTop: wp(2) }}>
                          Transféré le {new Date(item.transferredAt).toLocaleDateString('fr-FR')}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              <Pressable
                delayPressIn={120}
                onPress={() => setOpenSpCategory(null)}
                style={({ pressed }) => ({
                  marginTop: wp(16), paddingVertical: wp(14), borderRadius: wp(14),
                  alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '500', color: 'rgba(255,255,255,0.4)' }}>Fermer</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
