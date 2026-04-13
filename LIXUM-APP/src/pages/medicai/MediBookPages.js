import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, Platform, Animated, Dimensions, StatusBar, Pressable, ActivityIndicator,
  Modal,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle, Ellipse, Line,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { wp, fp, SCREEN_WIDTH, SCREEN_HEIGHT, SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';
import { useAuth } from '../../config/AuthContext';
import { supabase } from '../../config/supabase';
import { BottomSpacer } from './shared';
import LixumModal from '../../components/shared/LixumModal';

export const mbDataStatus = [
  { name: 'Nutrition', days: 87, total: 90, percent: 96 },
  { name: 'Hydratation', days: 72, total: 90, percent: 80 },
  { name: 'Activité physique', days: 45, total: 90, percent: 50 },
  { name: 'Humeur', days: 60, total: 90, percent: 67 },
  { name: 'Conversations ALIXEN', days: 8, total: null, percent: null, status: 'OK' },
  { name: 'Secret Pocket', days: null, total: null, percent: null, status: 'Optionnel' },
];

export const mbSections = [
  { icon: 'user', title: 'Page de garde', desc: 'Nom, âge, LixTag, période', color: '#00D984' },
  { icon: 'body', title: 'Profil morphologique', desc: 'Poids, taille, BMI, BMR, TDEE', color: '#4DA6FF' },
  { icon: 'food', title: 'Nutrition 3 mois', desc: 'Calories, macros, tendances', color: '#FF8C42' },
  { icon: 'water', title: 'Hydratation', desc: 'Moyenne vs objectif', color: '#4DA6FF' },
  { icon: 'run', title: 'Activité physique', desc: 'Fréquence, types, calories', color: '#00D984' },
  { icon: 'mood', title: "Courbe d'humeur", desc: 'Évolution et corrélations', color: '#9B6DFF' },
  { icon: 'alert', title: "Points d'attention", desc: 'Carences, alertes ALIXEN', color: '#FF6B6B' },
  { icon: 'qr', title: 'QR Code profil', desc: 'Lien vers votre profil Lixum', color: '#D4AF37' },
];

export const MbSectionIcon = ({ type, color, size = wp(18) }) => {
  switch (type) {
    case 'user':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" /><Path d="M4 21v-1a6 6 0 0112 0v1" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'body':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="5" r="3" stroke={color} strokeWidth="1.5" /><Path d="M12 10v8m-4-6h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M9 22l3-4 3 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'food':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 2v8c0 1.1.9 2 2 2h2a2 2 0 002-2V2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="6" y1="2" x2="6" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Path d="M18 2c0 4-2 6-2 10h4c0-4-2-6-2-10z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><Line x1="18" y1="12" x2="18" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    case 'water':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2c-4 6-7 9-7 13a7 7 0 0014 0c0-4-3-7-7-13z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /></Svg>);
    case 'run':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="14" cy="4" r="2" stroke={color} strokeWidth="1.5" /><Path d="M6 20l4-4 2 2 4-5 2 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><Path d="M10 16l-2-4 5-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>);
    case 'mood':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" /><Path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="9" cy="10" r="0.5" fill={color} /><Circle cx="15" cy="10" r="0.5" fill={color} /></Svg>);
    case 'alert':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" /><Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Circle cx="12" cy="16" r="0.5" fill={color} /></Svg>);
    case 'qr':
      return (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.5" /><Rect x="14" y="14" width="4" height="4" rx="0.5" stroke={color} strokeWidth="1.5" /><Line x1="21" y1="14" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" /><Line x1="14" y1="21" x2="21" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" /></Svg>);
    default: return null;
  }
};

export const mbGetBarColor = (percent) => {
  if (percent >= 80) return '#00D984';
  if (percent >= 50) return '#FF8C42';
  return '#FF6B6B';
};

export const MbProgressRow = ({ item }) => {
  const hasPercent = item.percent !== null;
  // Fix: Conversations ALIXEN = emerald, Secret Pocket = gold (not black)
  const barColor = hasPercent
    ? mbGetBarColor(item.percent)
    : item.status === 'OK' ? '#00D984' : '#D4AF37';
  const detail = item.total
    ? `${item.days} jours sur ${item.total}`
    : item.days ? `${item.days} sessions` : '';

  return (
    <View style={{ marginBottom: wp(14) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(4) }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436' }}>{item.name}</Text>
          {detail ? <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)' }}>{detail}</Text> : null}
        </View>
        <Text style={{ fontSize: fp(12), fontWeight: '700', color: hasPercent ? barColor : barColor }}>
          {hasPercent ? `${item.percent}%` : item.status}
        </Text>
      </View>
      <View style={{ height: wp(6), borderRadius: wp(3), backgroundColor: '#E8ECF0', overflow: 'hidden' }}>
        <View style={{
          height: '100%',
          width: hasPercent ? `${item.percent}%` : (item.status === 'OK' ? '30%' : '15%'),
          borderRadius: wp(3), backgroundColor: barColor,
        }} />
      </View>
    </View>
  );
};

// ============================================
// SECRET POCKET — DATA + ICONS
// ============================================
// TODO: Quand le champ is_secret sera ajouté dans Supabase,
// remplacer les compteurs hardcodés par les données réelles :
// count: medicalData.analyses.filter(a => a.is_secret).length
// count: medicalData.allergies.filter(a => a.is_secret).length
// etc.
const spCategories = [
  { id: 'diagnostics', title: 'Diagnostics à surveiller', desc: 'Diabète, hypertension, cholestérol...', icon: 'heart-pulse', color: '#FF6B6B', count: 0 },
  { id: 'allergies', title: 'Allergies et intolérances', desc: 'Alimentaires, médicamenteuses...', icon: 'shield-alert', color: '#FF8C42', count: 0 },
  { id: 'medications', title: 'Médicaments en cours', desc: 'Traitements actuels et posologie', icon: 'pill', color: '#4DA6FF', count: 0 },
  { id: 'lab-results', title: "Résultats d'analyses", desc: 'Bilans sanguins, examens...', icon: 'flask', color: '#00D984', count: 0 },
  { id: 'notes', title: 'Notes personnelles', desc: 'Vos observations de santé', icon: 'edit', color: '#9B6DFF', count: 0 },
  { id: 'conversations', title: 'Conversations sensibles', desc: 'Échanges privés avec ALIXEN', icon: 'message-lock', color: '#D4AF37', count: 0 },
];

const renderCategoryIcon = (iconName, color, size = wp(20)) => {
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

// ============================================
// SCAN STEP ROW — Ligne d'étape du scan IA
// ============================================
export const ScanStepRow = ({ step, index, isLatest }) => {
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: wp(10),
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.04)',
      opacity: opacityAnim,
    }}>
      <View style={{
        width: wp(22), height: wp(22), borderRadius: wp(11),
        backgroundColor: 'rgba(0,217,132,0.15)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: wp(12),
      }}>
        <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
          <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>
      <Text style={{
        fontSize: fp(13), color: '#FFF', fontWeight: '500', flex: 1,
      }}>
        {step.text}
      </Text>
    </Animated.View>
  );
};

export const MediBookContent = (props) => {
  const {
    // Navigation
    mediBookView, setMediBookView,
    reportSection, setReportSection,
    setCurrentSubPage,
    // Données médicales
    medicalData, medicalDataLoading,
    nutritionWeekData, userProfile,
    // Scan state
    uploadState, setUploadState,
    scanResults, setScanResults,
    scanSteps, setScanSteps,
    scanContext, setScanContext,
    scanFileName,
    // Carnet
    carnetPhotos, setCarnetPhotos,
    carnetPulseAnim,
    selectedCarnetPage, setSelectedCarnetPage,
    showCarnetPageSheet, setShowCarnetPageSheet,
    showAnalyzeSheet, setShowAnalyzeSheet,
    showMediBookUploadSheet, setShowMediBookUploadSheet,
    // Stats
    statsTab, setStatsTab,
    analysesTab, setAnalysesTab,
    medsTab, setMedsTab,
    // Profil switch
    activeProfile, children,
    showProfileSwitcher, setShowProfileSwitcher,
    // Fonctions
    loadMedicalData,
    startMedicalScan,
    handleTransferToSecretPocket,
    toggleMedicationReminder,
    toggleMedicationTaken,
    isTakenAtTime,
    archiveMedication,
    // Modals
    showAddMedSheet, setShowAddMedSheet,
    showAddAnalysisSheet, setShowAddAnalysisSheet,
    showAddDiagSheet, setShowAddDiagSheet,
    showAddAllergySheet, setShowAddAllergySheet,
    showAddVaccSheet, setShowAddVaccSheet,
    // Animation
    mbGenerateScale,
  } = props;

  var auth = useAuth();
  var userId = auth.userId;

  var _mbModal = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });
  var mbModal = _mbModal[0]; var setMbModal = _mbModal[1];
  var closeMbModal = function() { setMbModal(function(p) { return Object.assign({}, p, { visible: false }); }); };
  var showMbModal = function(type, title, message, extra) { setMbModal(Object.assign({ visible: true, type: type, title: title, message: message, onClose: closeMbModal, onConfirm: null, confirmText: 'Confirmer', cancelText: 'Annuler' }, extra || {})); };

  // ── CALENDAR STATES ────────────────────────────────────────────────────────
  var _calMonth = useState(new Date().getMonth());
  var calendarMonth = _calMonth[0]; var setCalendarMonth = _calMonth[1];
  var _calYear = useState(new Date().getFullYear());
  var calendarYear = _calYear[0]; var setCalendarYear = _calYear[1];
  var _selectedDay = useState(null);
  var selectedDay = _selectedDay[0]; var setSelectedDay = _selectedDay[1];
  var _calFilters = useState({ diagnostic: true, medication: true, vaccination: true, analysis: true, allergy: true });
  var calendarFilters = _calFilters[0]; var setCalendarFilters = _calFilters[1];
  var _calView = useState('month');
  var calendarView = _calView[0]; var setCalendarView = _calView[1];
  var _calEventDetail = useState(null);
  var calEventDetail = _calEventDetail[0]; var setCalEventDetail = _calEventDetail[1];
  var calSlideAnim = useRef(new Animated.Value(0)).current;

  var getAuthHeaders = async function() {
    var result = await supabase.auth.getSession();
    var token = result.data.session ? result.data.session.access_token : SUPABASE_ANON_KEY;
    return { 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  };

  const captureCarnetPage = (index) => {
    setSelectedCarnetPage(index);
    setShowCarnetPageSheet(true);
  };

  // ── RENDER SCANNING SCREEN ─────────────────────────────────────────────
  const renderScanningScreen = () => (
    <View style={{ flex: 1, backgroundColor: '#1A1D22', paddingHorizontal: wp(20), paddingTop: wp(60), paddingBottom: wp(70) }}>
      {/* Bouton retour */}
      <Pressable
        onPress={() => {
          setUploadState('idle');
          setScanSteps([]);
        }}
        style={{
          position: 'absolute', top: wp(16), left: wp(16), zIndex: 10,
          width: wp(36), height: wp(36), borderRadius: wp(18),
          backgroundColor: 'rgba(255,255,255,0.08)',
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <Text style={{ color: '#FFF', fontSize: fp(18) }}>{"<"}</Text>
      </Pressable>

      <View style={{ alignItems: 'center', marginBottom: wp(40) }}>
        <View style={{
          width: wp(70), height: wp(70), borderRadius: wp(35),
          backgroundColor: 'rgba(0,217,132,0.1)',
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)', marginBottom: wp(16),
        }}>
          <Svg width={wp(32)} height={wp(32)} viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <Path d="M14 2v6h6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </View>
        <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
          ALIXEN analyse...
        </Text>
        <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)' }}>
          {scanFileName}
        </Text>
        <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.25)', marginTop: wp(2) }}>
          Ne fermez pas l'application
        </Text>
      </View>

      <View style={{ paddingHorizontal: wp(8) }}>
        {scanSteps.map((step, index) => (
          <View key={index} style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: wp(10),
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255,255,255,0.04)',
          }}>
            <View style={{
              width: wp(22), height: wp(22), borderRadius: wp(11),
              backgroundColor: 'rgba(0,217,132,0.15)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: wp(12),
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(12), fontWeight: '700' }}>{'✓'}</Text>
            </View>
            <Text style={{
              fontSize: fp(13),
              color: index === scanSteps.length - 1 ? '#00D984' : 'rgba(255,255,255,0.6)',
              fontWeight: index === scanSteps.length - 1 ? '600' : '400',
              flex: 1,
            }}>
              {step.text}
            </Text>
          </View>
        ))}
        {scanSteps.length < 7 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: wp(10), opacity: 0.6 }}>
            <ActivityIndicator size="small" color="#00D984" style={{ marginRight: wp(12) }} />
            <Text style={{ fontSize: fp(13), color: 'rgba(0,217,132,0.7)', fontStyle: 'italic' }}>
              Traitement en cours...
            </Text>
          </View>
        )}
      </View>

      <View style={{ position: 'absolute', bottom: wp(40), left: wp(20), right: wp(20) }}>
        <Pressable onPress={() => { setUploadState('idle'); setScanSteps([]); }}
          style={{ alignItems: 'center', padding: wp(14) }}>
          <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.3)' }}>Annuler</Text>
        </Pressable>
      </View>
    </View>
  );

  // ── RENDER SCAN RESULTS ────────────────────────────────────────────────
  const renderScanResults = () => {
    // Détecter si c'est un scan de nourriture (pas un document médical)
    const isFoodScan = scanResults?.documentType === 'Non médical' ||
      scanResults?.category === 'food' ||
      (scanResults?.documentType || '').toLowerCase().includes('plat') ||
      (scanResults?.documentType || '').toLowerCase().includes('aliment');

    // Si c'est de la nourriture scannée depuis MediBook
    if (isFoodScan && scanContext === 'medibook') {
      const detectedAllergens = medicalData.allergies.filter(a => {
        const allergen = (a.allergen || '').toLowerCase();
        const summary = (scanResults?.summary || '').toLowerCase();
        return summary.includes(allergen) ||
          (scanResults?.data || []).some(d =>
            (d.label || '').toLowerCase().includes(allergen)
          );
      });

      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#1A1D22' }}>
          <View style={{ paddingHorizontal: wp(16), paddingTop: wp(20) }}>

            {/* Bouton retour */}
            <Pressable onPress={() => { setUploadState('idle'); setScanResults(null); }}
              style={{ width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginBottom: wp(16) }}>
              <Text style={{ color: '#FFF', fontSize: fp(18) }}>{"<"}</Text>
            </Pressable>

            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: wp(24) }}>
              <View style={{
                width: wp(60), height: wp(60), borderRadius: wp(30),
                backgroundColor: detectedAllergens.length > 0 ? 'rgba(255,107,107,0.12)' : 'rgba(0,217,132,0.12)',
                justifyContent: 'center', alignItems: 'center', marginBottom: wp(12),
              }}>
                <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                  {detectedAllergens.length > 0 ? (
                    <>
                      <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FF6B6B" strokeWidth="1.5"/>
                      <Line x1="12" y1="9" x2="12" y2="13" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round"/>
                      <Circle cx="12" cy="16" r="0.5" fill="#FF6B6B"/>
                    </>
                  ) : (
                    <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  )}
                </Svg>
              </View>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>
                {detectedAllergens.length > 0 ? 'Allergènes détectés !' : 'Aucun allergène détecté'}
              </Text>
              <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(4), textAlign: 'center' }}>
                Analyse basée sur votre profil allergique
              </Text>
            </View>

            {/* Description du plat */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14),
              padding: wp(14), marginBottom: wp(16),
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
            }}>
              <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(4) }}>
                {scanResults?.documentType || 'Plat identifié'}
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', lineHeight: fp(19) }}>
                {scanResults?.summary || ''}
              </Text>
            </View>

            {/* Allergènes trouvés */}
            {detectedAllergens.length > 0 && (
              <View style={{ marginBottom: wp(16) }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FF6B6B', marginBottom: wp(10) }}>
                  Attention — Allergènes dans ce plat
                </Text>
                {detectedAllergens.map((allergen, i) => (
                  <View key={i} style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,107,107,0.08)', borderRadius: wp(12),
                    padding: wp(12), marginBottom: wp(8),
                    borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)',
                  }}>
                    <View style={{
                      width: wp(36), height: wp(36), borderRadius: wp(18),
                      backgroundColor: allergen.severity === 'severe' ? 'rgba(255,107,107,0.2)' : 'rgba(255,140,66,0.2)',
                      justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                    }}>
                      <Text style={{ fontSize: fp(16) }}>{'⚠'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{allergen.allergen}</Text>
                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>
                        Sévérité : {allergen.severity === 'severe' ? 'Sévère' : allergen.severity === 'moderate' ? 'Modéré' : 'Léger'}
                      </Text>
                    </View>
                    <View style={{
                      paddingHorizontal: wp(8), paddingVertical: wp(3),
                      backgroundColor: allergen.severity === 'severe' ? 'rgba(255,107,107,0.2)' : 'rgba(255,140,66,0.2)',
                      borderRadius: wp(6),
                    }}>
                      <Text style={{
                        fontSize: fp(9), fontWeight: '700',
                        color: allergen.severity === 'severe' ? '#FF6B6B' : '#FF8C42',
                      }}>
                        {allergen.severity === 'severe' ? 'DANGER' : 'ATTENTION'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Message de redirection vers Repas */}
            <View style={{
              backgroundColor: 'rgba(77,166,255,0.08)', borderRadius: wp(14),
              padding: wp(14), marginBottom: wp(24),
              borderWidth: 1, borderColor: 'rgba(77,166,255,0.15)',
              flexDirection: 'row', alignItems: 'center',
            }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(10) }}>
                <Circle cx="12" cy="12" r="10" stroke="#4DA6FF" strokeWidth="1.5"/>
                <Line x1="12" y1="8" x2="12" y2="12" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round"/>
                <Circle cx="12" cy="16" r="0.5" fill="#4DA6FF"/>
              </Svg>
              <Text style={{ fontSize: fp(12), color: 'rgba(77,166,255,0.8)', flex: 1, lineHeight: fp(17) }}>
                Pour connaître les calories et macronutriments de ce plat, utilisez le scan de la page Repas.
              </Text>
            </View>

            {/* Bouton retour */}
            <Pressable
              delayPressIn={120}
              onPress={() => { setUploadState('idle'); setScanResults(null); setScanSteps([]); }}
              style={{
                paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                marginBottom: wp(20),
              }}
            >
              <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>Compris, merci</Text>
            </Pressable>

            <View style={{ height: wp(70) }} />
          </View>
        </ScrollView>
      );
    }

    // Résultats médicaux standard
    return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1A1D22' }} contentContainerStyle={{ paddingBottom: wp(50) }}>
      <View style={{ paddingHorizontal: wp(16), paddingTop: wp(20) }}>
        {/* Bouton retour */}
        <Pressable
          onPress={() => {
            showMbModal('confirm', 'Quitter l\'analyse ?', 'Les données extraites seront perdues.', { confirmText: 'Quitter', cancelText: 'Continuer', onConfirm: function() { closeMbModal(); setUploadState('idle'); setScanResults(null); setScanSteps([]); } });
          }}
          style={{
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            marginBottom: wp(8),
          }}
        >
          <Text style={{ color: '#FFF', fontSize: fp(18) }}>{"<"}</Text>
        </Pressable>

        {/* Header résultats */}
        <View style={{ alignItems: 'center', marginBottom: wp(24) }}>
          <View style={{
            width: wp(50), height: wp(50), borderRadius: wp(25),
            backgroundColor: 'rgba(0,217,132,0.12)',
            justifyContent: 'center', alignItems: 'center', marginBottom: wp(12),
          }}>
            <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
              <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </View>
          <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>Analyse terminée</Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>
            Vérifiez les données avant de valider
          </Text>
        </View>

        {/* Info document */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(14), padding: wp(14),
          marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
            {scanResults?.documentType}
          </Text>
          <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)' }}>
            {scanResults?.date} — {scanResults?.source}
          </Text>
          {scanResults?.laboratory && scanResults.laboratory !== 'Non spécifié' && (
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>
              {scanResults.laboratory}
            </Text>
          )}
          <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.6)', marginTop: wp(8), lineHeight: fp(19) }}>
            {scanResults?.summary}
          </Text>
        </View>

        {/* Données extraites */}
        <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
          Données extraites
        </Text>
        {scanResults?.data.map((item, index) => (
          <View key={index} style={{
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: wp(12), paddingHorizontal: wp(12),
            backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: wp(10), marginBottom: wp(6),
            borderLeftWidth: wp(3),
            borderLeftColor: item.status === 'normal' ? '#00D984' : item.status === 'elevated' ? '#FF8C42' : '#FF6B6B',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#FFF' }}>{item.label}</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>Réf: {item.ref}</Text>
            </View>
            <Text style={{
              fontSize: fp(14), fontWeight: '700',
              color: item.status === 'normal' ? '#00D984' : item.status === 'elevated' ? '#FF8C42' : '#FF6B6B',
            }}>{item.value}</Text>
          </View>
        ))}

        {/* Section Médicaments */}
        {scanResults?.medications && scanResults.medications.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
              Médicaments détectés
            </Text>
            {scanResults.medications.map((med, i) => (
              <View key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
                padding: wp(14), marginBottom: wp(8),
                borderLeftWidth: 3, borderLeftColor: '#4DA6FF',
              }}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{med.name}</Text>
                {med.dosage && (
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginTop: wp(3) }}>
                    {med.dosage}{med.frequency ? ' — ' + med.frequency : ''}
                  </Text>
                )}
                {med.duration && (
                  <Text style={{ fontSize: fp(12), color: '#00D984', marginTop: wp(2) }}>
                    Durée : {med.duration}
                  </Text>
                )}
                {med.notes && (
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginTop: wp(4) }}>
                    {med.notes}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Vaccinations */}
        {scanResults?.vaccinations && scanResults.vaccinations.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
              Vaccins détectés
            </Text>
            {scanResults.vaccinations.map((vac, i) => (
              <View key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
                padding: wp(14), marginBottom: wp(8),
                borderLeftWidth: 3, borderLeftColor: '#00D984',
              }}>
                <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{vac.name}</Text>
                <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginTop: wp(3) }}>
                  {vac.date || ''}{vac.dose ? ' — ' + vac.dose : ''}
                </Text>
                {vac.nextDue && (
                  <Text style={{ fontSize: fp(12), color: '#FF8C42', marginTop: wp(2) }}>
                    Prochain rappel : {vac.nextDue}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Allergies */}
        {scanResults?.allergies && scanResults.allergies.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
              Allergies détectées
            </Text>
            {scanResults.allergies.map((allergy, i) => (
              <View key={i} style={{
                backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
                padding: wp(14), marginBottom: wp(8),
                borderLeftWidth: 3,
                borderLeftColor: allergy.severity === 'severe' || allergy.severity === 'life_threatening' ? '#FF6B6B' : '#FF8C42',
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', flex: 1 }}>{allergy.allergen}</Text>
                  <View style={{
                    paddingHorizontal: wp(8), paddingVertical: wp(3),
                    backgroundColor: allergy.severity === 'severe' ? 'rgba(255,107,107,0.2)' : 'rgba(255,140,66,0.2)',
                    borderRadius: wp(6),
                  }}>
                    <Text style={{
                      fontSize: fp(9), fontWeight: '700',
                      color: allergy.severity === 'severe' ? '#FF6B6B' : '#FF8C42',
                    }}>
                      {allergy.severity === 'severe' ? 'SÉVÈRE' : allergy.severity === 'moderate' ? 'MODÉRÉ' : allergy.severity === 'mild' ? 'LÉGER' : allergy.severity?.toUpperCase() || ''}
                    </Text>
                  </View>
                </View>
                {allergy.type && (
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginTop: wp(3) }}>
                    Type : {allergy.type}
                  </Text>
                )}
                {allergy.reaction && (
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>
                    Réaction : {allergy.reaction}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Section Diagnostics */}
        {scanResults?.diagnostics && scanResults.diagnostics.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(12) }}>
              Diagnostics détectés
            </Text>
            {scanResults.diagnostics.map(function(diag, i) {
              var sevColor = diag.severity === 'severe' ? '#FF6B6B' : diag.severity === 'moderate' ? '#FF8C42' : '#00D984';
              return (
                <View key={i} style={{
                  backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: wp(12),
                  padding: wp(14), marginBottom: wp(8),
                  borderLeftWidth: 3, borderLeftColor: '#FF6B6B',
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF', flex: 1 }}>{diag.condition_name}</Text>
                    <View style={{ backgroundColor: sevColor + '30', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                      <Text style={{ fontSize: fp(9), fontWeight: '700', color: sevColor }}>
                        {diag.severity === 'severe' ? 'SÉVÈRE' : diag.severity === 'moderate' ? 'MODÉRÉ' : 'LÉGER'}
                      </Text>
                    </View>
                  </View>
                  {diag.notes ? (
                    <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)', marginTop: wp(3), fontStyle: 'italic' }}>{diag.notes}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Section Alertes */}
        {scanResults?.alerts && scanResults.alerts.length > 0 && (
          <View style={{ marginTop: wp(20) }}>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FF6B6B', marginBottom: wp(12) }}>
              Points d'attention
            </Text>
            {scanResults.alerts.map((alert, i) => (
              <View key={i} style={{
                backgroundColor: alert.type === 'critical' ? 'rgba(255,107,107,0.08)' : 'rgba(255,140,66,0.08)',
                borderRadius: wp(12), padding: wp(14), marginBottom: wp(8),
                borderWidth: 1,
                borderColor: alert.type === 'critical' ? 'rgba(255,107,107,0.2)' : 'rgba(255,140,66,0.2)',
              }}>
                <Text style={{ fontSize: fp(13), color: alert.type === 'critical' ? '#FF6B6B' : '#FF8C42' }}>
                  {typeof alert === 'string' ? alert : alert.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Boutons */}
        <View style={{ marginTop: wp(28), marginBottom: wp(40) }}>
          <Pressable delayPressIn={120}
            onPress={async () => {
              setUploadState('integrating');

              try {
                if (!userId) { showMbModal('error', 'Erreur', 'Utilisateur non connecté'); setUploadState('idle'); return; }
                const headers = await getAuthHeaders();
                headers['Prefer'] = 'return=minimal';

                var scanDate = scanResults.date || null;

                // Insérer les analyses
                if (scanResults.data && scanResults.data.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/medical_analyses', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.data.map(item => ({
                      user_id: userId,
                      label: item.label,
                      value: item.value,
                      value_numeric: parseFloat(item.value) || null,
                      reference_range: item.ref || null,
                      status: item.status || 'normal',
                      category: scanResults.category || 'other',
                      analysis_date: item.date || scanDate,
                    }))),
                  });
                }

                // Insérer les médicaments
                if (scanResults.medications && scanResults.medications.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/medications', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.medications.map(med => ({
                      user_id: userId,
                      name: med.name,
                      dosage: med.dosage || null,
                      frequency: med.frequency || null,
                      duration: med.duration || null,
                      status: 'active',
                      start_date: med.start_date || scanDate,
                    }))),
                  });
                }

                // Insérer les vaccinations
                if (scanResults.vaccinations && scanResults.vaccinations.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/vaccinations', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.vaccinations.map(vac => ({
                      user_id: userId,
                      vaccine_name: vac.name,
                      administration_date: vac.date || scanDate,
                      dose_number: parseInt(vac.dose) || 1,
                      status: 'completed',
                      next_due_date: vac.nextDue || null,
                    }))),
                  });
                }

                // Insérer les allergies
                if (scanResults.allergies && scanResults.allergies.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/allergies', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.allergies.map(a => ({
                      user_id: userId,
                      allergen: a.allergen,
                      type: a.type || null,
                      severity: a.severity || 'moderate',
                      reaction: a.reaction || null,
                    }))),
                  });
                }

                // Insérer les diagnostics
                if (scanResults.diagnostics && scanResults.diagnostics.length > 0) {
                  await fetch(SUPABASE_URL + '/rest/v1/diagnostics', {
                    method: 'POST', headers,
                    body: JSON.stringify(scanResults.diagnostics.map(function(d) {
                      return {
                        user_id: userId,
                        condition_name: d.condition_name,
                        severity: d.severity || 'moderate',
                        status: d.status || 'active',
                        notes: d.notes || null,
                        diagnosed_date: d.diagnosed_date || scanDate,
                        diagnosed_by: d.diagnosed_by || null,
                        source: 'scan',
                      };
                    })),
                  });
                }

                // Sauvegarder le document scanné
                await fetch(SUPABASE_URL + '/rest/v1/scanned_documents', {
                  method: 'POST', headers,
                  body: JSON.stringify({
                    user_id: userId,
                    document_type: scanResults.documentType || 'Document',
                    summary: scanResults.summary || '',
                    raw_ai_response: scanResults,
                    scan_context: 'medibook',
                    items_extracted: (scanResults.data?.length || 0) + (scanResults.medications?.length || 0) + (scanResults.vaccinations?.length || 0) + (scanResults.allergies?.length || 0) + (scanResults.diagnostics?.length || 0),
                  }),
                });

                // Succès
                setScanResults(null);
                setScanSteps([]);
                setUploadState('idle');

                showMbModal('success', 'Données intégrées ✓', 'Les informations ont été ajoutées à votre MediBook. Consultez Mes Stats pour voir les résultats.');

                // Recharger les données médicales
                loadMedicalData();

              } catch (error) {
                console.error('Erreur intégration:', error);
                setUploadState('idle');
                showMbModal('error', 'Erreur', 'L\'intégration a échoué. Réessayez.');
              }
            }}>
            <LinearGradient colors={['#00D984', '#00B871']}
              style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(10) }}>
              <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Valider et intégrer</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.7)', marginTop: wp(2) }}>
                Intégrer dans votre MediBook
              </Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => { setUploadState('idle'); setScanResults(null); setScanSteps([]); }}
            style={{ paddingVertical: wp(14), borderRadius: wp(14), alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.4)' }}>Rejeter et supprimer</Text>
          </Pressable>
        </View>
      </View>
      <BottomSpacer />
    </ScrollView>
  );
  };

  // ── CAPTURE CARNET PAGE ──────────────────────────────────────────────────

  // ── LIXUM TABLE COMPONENT ───────────────────────────────────────────────
  const renderLixumTable = (title, columns, rows, accentColor = '#00D984', onTransfer = null) => {
    return (
      <View style={{
        backgroundColor: '#FAFBFC', borderRadius: wp(16),
        overflow: 'hidden', marginBottom: wp(12),
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
      }}>
        <LinearGradient
          colors={['#3A3F46', '#252A30']}
          style={{
            flexDirection: 'row', paddingVertical: wp(10), paddingHorizontal: wp(12),
            borderTopLeftRadius: wp(16), borderTopRightRadius: wp(16),
          }}
        >
          {columns.map((col, i) => (
            <Text key={i} style={{
              flex: col.flex || 1,
              fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.7)',
              letterSpacing: 0.5, textTransform: 'uppercase',
              textAlign: col.align || 'left',
            }}>
              {col.label}
            </Text>
          ))}
          {onTransfer && (
            <Text style={{ width: wp(30), marginLeft: wp(8), fontSize: fp(10), fontWeight: '700', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>{'🔒'}</Text>
          )}
        </LinearGradient>

        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{
            flexDirection: 'row', alignItems: 'center',
            paddingVertical: wp(10), paddingHorizontal: wp(12),
            borderBottomWidth: rowIndex < rows.length - 1 ? 1 : 0,
            borderBottomColor: 'rgba(0,0,0,0.04)',
            backgroundColor: rowIndex % 2 === 0 ? '#FAFBFC' : '#F5F6F8',
          }}>
            {row.map((cell, cellIndex) => {
              const cellData = typeof cell === 'object' ? cell : { text: cell };
              return (
                <Text key={cellIndex} style={{
                  flex: columns[cellIndex]?.flex || 1,
                  fontSize: fp(12),
                  fontWeight: cellData.bold ? '600' : '400',
                  color: cellData.color || '#2D3436',
                  textAlign: columns[cellIndex]?.align || 'left',
                }}>
                  {cellData.text || cell}
                </Text>
              );
            })}
            {onTransfer && (
              <Pressable
                onPress={() => onTransfer(rowIndex, row)}
                style={{
                  width: wp(30), height: wp(28), borderRadius: wp(8),
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  justifyContent: 'center', alignItems: 'center',
                  marginLeft: wp(8),
                }}
              >
                <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round"/>
                </Svg>
              </Pressable>
            )}
          </View>
        ))}

        {rows.length === 0 && (
          <View style={{ padding: wp(20), alignItems: 'center' }}>
            <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>
              Aucune donnée enregistrée
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ── PROFILE SWITCH BUTTON COMPONENT ──────────────────────────────────────
  const renderProfileSwitchButton = () => (
    <Pressable
      onPress={() => setShowProfileSwitcher(true)}
      delayPressIn={120}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,217,132,0.12)',
        borderRadius: wp(12),
        paddingHorizontal: wp(8),
        paddingVertical: wp(5),
        borderWidth: 1,
        borderColor: 'rgba(0,217,132,0.2)',
        maxWidth: wp(90),
      }}
    >
      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(4) }}>
        <Path d="M17 1l4 4-4 4" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M3 11V9a4 4 0 014-4h14" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M7 23l-4-4 4-4" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M21 13v2a4 4 0 01-4 4H3" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
      <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#00D984' }} numberOfLines={1}>
        {activeProfile === 'self' ? 'Moi' : (children.find(c => c.id === activeProfile)?.name || 'Enfant')}
      </Text>
    </Pressable>
  );

  // ── RENDER MEDIBOOK LANDING ────────────────────────────────────────────────
  const renderMediBookLanding = () => (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#3A3F46', '#252A30']}
        style={{
          paddingTop: Platform.OS === 'android' ? 35 : 50,
          paddingBottom: wp(12), paddingHorizontal: wp(12),
          flexDirection: 'row', alignItems: 'center',
          borderBottomWidth: 1, borderBottomColor: '#4A4F55',
        }}
      >
        <Pressable delayPressIn={120} onPress={() => { setMediBookView('landing'); setCurrentSubPage('main'); }}
          style={({ pressed }) => ({
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            marginRight: wp(10),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>MediBook</Text>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Votre rapport santé</Text>
        </View>
        {renderProfileSwitchButton()}
        <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(10), paddingHorizontal: wp(8), paddingVertical: wp(4), marginLeft: wp(6) }}>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>500 Lix</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(20), paddingBottom: wp(50) }}>
        {/* Carte 1 : Importer mon carnet de santé */}
        <Pressable delayPressIn={120} onPress={() => setMediBookView('carnet')}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              borderRadius: wp(16), padding: wp(16),
              marginBottom: wp(10), borderWidth: 1, borderColor: '#4A4F55',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: wp(10) }}>
              <Svg width={wp(36)} height={wp(36)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="16" height="20" rx="2" stroke="#00D984" strokeWidth="1.5"/>
                <Line x1="4" y1="2" x2="4" y2="22" stroke="#00D984" strokeWidth="3" strokeLinecap="round"/>
                <Line x1="8" y1="6" x2="16" y2="6" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Line x1="8" y1="10" x2="16" y2="10" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Line x1="8" y1="14" x2="14" y2="14" stroke="#00D984" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
                <Circle cx="18" cy="18" r="5" fill="#252A30" stroke="#00D984" strokeWidth="1.5"/>
                <Circle cx="18" cy="18" r="2" stroke="#00D984" strokeWidth="1.2"/>
              </Svg>
            </View>
            <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: wp(4) }}>
              Importer mon carnet de santé
            </Text>
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: fp(15) }}>
              Photographiez les pages de votre carnet physique.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Carte 2 : Continuer avec mes données */}
        <Pressable delayPressIn={120} onPress={() => setMediBookView('report')}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              borderRadius: wp(16), padding: wp(16),
              marginBottom: wp(10), borderWidth: 1, borderColor: '#4A4F55',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: wp(10) }}>
              <Svg width={wp(36)} height={wp(36)} viewBox="0 0 24 24" fill="none">
                <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>
            <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: wp(4) }}>
              Continuer avec mes données
            </Text>
            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: fp(15) }}>
              Données de l'app pour générer votre rapport.
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Carte 3 : Mes Stats */}
        <Pressable delayPressIn={120} onPress={() => setMediBookView('stats')}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(14),
            padding: wp(14), borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)',
          }}>
            <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(12) }}>
              <Line x1="18" y1="20" x2="18" y2="10" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
              <Line x1="12" y1="20" x2="12" y2="4" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
              <Line x1="6" y1="20" x2="6" y2="14" stroke="#00D984" strokeWidth="2" strokeLinecap="round"/>
            </Svg>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#2D3436' }}>Mes Stats</Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)' }}>Graphiques et évolution santé</Text>
            </View>
            <Text style={{ fontSize: fp(16), color: 'rgba(0,0,0,0.2)' }}>{">"}</Text>
          </View>
        </Pressable>

        {/* Section info en bas du landing */}
        <View style={{ marginTop: wp(20), paddingHorizontal: wp(4) }}>
          <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#2D3436', marginBottom: wp(12) }}>
            Comment ça marche ?
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(14) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(0,217,132,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#00D984', fontSize: fp(13), fontWeight: '700' }}>1</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436', marginBottom: wp(2) }}>
                Photographiez ou importez
              </Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', lineHeight: fp(16) }}>
                Votre carnet de santé, bilans, ordonnances, résultats d'analyses...
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(14) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(77,166,255,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#4DA6FF', fontSize: fp(13), fontWeight: '700' }}>2</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436', marginBottom: wp(2) }}>
                ALIXEN analyse tout
              </Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', lineHeight: fp(16) }}>
                Vaccins, médicaments, diagnostics, allergies — chaque info va dans la bonne section.
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: wp(20) }}>
            <View style={{
              width: wp(28), height: wp(28), borderRadius: wp(8),
              backgroundColor: 'rgba(212,175,55,0.1)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <Text style={{ color: '#D4AF37', fontSize: fp(13), fontWeight: '700' }}>3</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(13), fontWeight: '600', color: '#2D3436', marginBottom: wp(2) }}>
                Générez votre MediBook
              </Text>
              <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', lineHeight: fp(16) }}>
                Un rapport PDF complet à imprimer pour votre médecin. 500 Lix.
              </Text>
            </View>
          </View>
        </View>
        <BottomSpacer />
      </ScrollView>

      {/* Bouton flottant + Ajouter — en bas à droite */}
      <Pressable
        delayPressIn={120}
        onPress={() => setShowMediBookUploadSheet(true)}
        style={{
          position: 'absolute',
          bottom: wp(80),
          right: wp(20),
          width: wp(56),
          height: wp(56),
          borderRadius: wp(28),
          overflow: 'hidden',
          shadowColor: '#00D984',
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
          zIndex: 100,
        }}
      >
        <LinearGradient
          colors={['#00D984', '#00B871']}
          style={{
            width: '100%', height: '100%',
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
          </Svg>
        </LinearGradient>
      </Pressable>
    </View>
  );

  // ── RENDER CARNET CAPTURE ──────────────────────────────────────────────────
  const renderCarnetCapture = () => {
    const caseSize = (Dimensions.get('window').width - wp(16) * 2 - wp(8) * 3) / 4;
    const capturedCount = carnetPhotos.filter(p => p).length;

    return (
      <View style={{ flex: 1, backgroundColor: '#1A1D22' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}
        >
          <Pressable delayPressIn={120} onPress={() => setMediBookView('landing')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>Carnet de santé</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>25 emplacements disponibles</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(50) }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) }}>
            {Array.from({ length: 25 }, (_, index) => (
              carnetPhotos[index] ? (
                <Pressable
                  key={index}
                  onPress={() => {
                    showMbModal('confirm', 'Page ' + (index + 1), 'Supprimer cette photo ?', { confirmText: 'Supprimer', onConfirm: function() { closeMbModal(); setCarnetPhotos(function(prev) { var updated = prev.slice(); updated[index] = undefined; return updated; }); } });
                  }}
                  style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), overflow: 'hidden',
                    borderWidth: 2, borderColor: '#00D984',
                  }}
                >
                  <Image
                    source={{ uri: carnetPhotos[index].uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  <View style={{
                    position: 'absolute', top: wp(2), left: wp(2),
                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: wp(8),
                    paddingHorizontal: wp(4), paddingVertical: wp(1),
                  }}>
                    <Text style={{ color: '#FFF', fontSize: fp(8), fontWeight: '700' }}>{index + 1}</Text>
                  </View>
                </Pressable>
              ) : (index === 0 && capturedCount === 0) ? (
                <Pressable key={index} onPress={() => captureCarnetPage(0)}>
                  <Animated.View style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), borderWidth: 2,
                    borderColor: '#00D984', borderStyle: 'dashed',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(0,217,132,0.08)',
                    transform: [{ scale: carnetPulseAnim }],
                  }}>
                    <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none" style={{ marginBottom: wp(4) }}>
                      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <Circle cx="12" cy="13" r="4" stroke="#00D984" strokeWidth="1.5"/>
                    </Svg>
                    <Text style={{ color: '#00D984', fontSize: fp(10), fontWeight: '600' }}>
                      Commencez ici
                    </Text>
                  </Animated.View>
                </Pressable>
              ) : (
                <Pressable
                  key={index}
                  onPress={() => captureCarnetPage(index)}
                  style={{
                    width: caseSize, height: caseSize,
                    borderRadius: wp(12), borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed',
                    justifyContent: 'center', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: fp(16) }}>+</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.15)', fontSize: fp(8), marginTop: wp(2) }}>{index + 1}</Text>
                </Pressable>
              )
            ))}
          </View>

          <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: wp(12) }}>
            {capturedCount} page{capturedCount > 1 ? 's' : ''} capturée{capturedCount > 1 ? 's' : ''} sur 25
          </Text>

          {capturedCount > 0 && (
            <View style={{ marginTop: wp(20), paddingHorizontal: wp(8) }}>
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  const photos = carnetPhotos.filter(p => p);
                  if (photos.length === 0) return;
                  setShowAnalyzeSheet(true);
                }}
              >
                <LinearGradient
                  colors={['#00D984', '#00B871']}
                  style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center' }}
                >
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>
                    Intégrer ({capturedCount} page{capturedCount > 1 ? 's' : ''})
                  </Text>
                </LinearGradient>
              </Pressable>
              <Text style={{
                fontSize: fp(12), color: 'rgba(255,255,255,0.3)',
                textAlign: 'center', marginTop: wp(10),
              }}>
                Vous pouvez ajouter d'autres pages avant d'intégrer
              </Text>
            </View>
          )}
          <BottomSpacer />
        </ScrollView>
      </View>
    );
  };

  // ── RENDER MEDIBOOK STATS ──────────────────────────────────────────────────
  const renderMediBookStats = () => {
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const caloriesData = [1920, 1750, 2050, 1800, 1650, 2200, 1850];
    const burnedData = [320, 280, 450, 180, 510, 0, 220];
    const moodData = [3, 4, 3, 2, 4, 5, 4];

    const StatsCard = ({ title, children: cardChildren }) => (
      <View style={{
        backgroundColor: '#FAFBFC', borderRadius: wp(16),
        padding: wp(16), marginBottom: wp(12),
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
      }}>
        <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#2D3436', marginBottom: wp(12) }}>
          {title}
        </Text>
        {cardChildren}
      </View>
    );

    const renderNutritionTab = () => {
      // Données live ou fallback hardcodé
      const hasLiveData = nutritionWeekData && nutritionWeekData.length > 0;
      const liveCalories = hasLiveData ? nutritionWeekData.map(d => d.total_calories || 0) : caloriesData;
      const avgCalories = hasLiveData
        ? Math.round(liveCalories.reduce((s, c) => s + c, 0) / liveCalories.length)
        : 1850;
      const liveProtein = hasLiveData
        ? Math.round(nutritionWeekData.reduce((s, d) => s + (d.total_protein || 0), 0) / nutritionWeekData.length)
        : 92;
      const liveCarbs = hasLiveData
        ? Math.round(nutritionWeekData.reduce((s, d) => s + (d.total_carbs || 0), 0) / nutritionWeekData.length)
        : 215;
      const liveFat = hasLiveData
        ? Math.round(nutritionWeekData.reduce((s, d) => s + (d.total_fat || 0), 0) / nutritionWeekData.length)
        : 62;
      const totalMacros = liveProtein + liveCarbs + liveFat || 1;
      const pctProtein = Math.round((liveProtein / totalMacros) * 100);
      const pctCarbs = Math.round((liveCarbs / totalMacros) * 100);
      const pctFat = 100 - pctProtein - pctCarbs;
      const calPct = Math.min(100, Math.round((avgCalories / 2100) * 100));

      const chartCalories = hasLiveData ? liveCalories : caloriesData;
      const chartDays = hasLiveData
        ? nutritionWeekData.map(d => {
            const dt = new Date(d.date);
            return ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][dt.getDay()];
          })
        : weekDays;

      return (
        <>
          <StatsCard title="Calories moyennes / jour">
            <Text style={{ fontSize: fp(28), fontWeight: '700', color: '#00D984' }}>{avgCalories.toLocaleString('fr-FR')} kcal</Text>
            <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)', marginTop: wp(4) }}>Objectif : 2 100 kcal</Text>
            <View style={{ height: wp(6), backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: wp(3), marginTop: wp(10) }}>
              <View style={{ width: calPct + '%', height: '100%', backgroundColor: '#00D984', borderRadius: wp(3) }} />
            </View>
          </StatsCard>

          <StatsCard title="Répartition macros">
            {[
              { label: 'Protéines', value: liveProtein + 'g', pct: pctProtein, color: '#4DA6FF' },
              { label: 'Glucides', value: liveCarbs + 'g', pct: pctCarbs, color: '#00D984' },
              { label: 'Lipides', value: liveFat + 'g', pct: pctFat, color: '#FF8C42' },
            ].map((macro, i) => (
              <View key={i} style={{ marginBottom: wp(10) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: wp(4) }}>
                  <Text style={{ fontSize: fp(12), color: '#2D3436', fontWeight: '600' }}>{macro.label}</Text>
                  <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)' }}>{macro.value} — {macro.pct}%</Text>
                </View>
                <View style={{ height: wp(6), backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: wp(3) }}>
                  <View style={{ width: macro.pct + '%', height: '100%', backgroundColor: macro.color, borderRadius: wp(3) }} />
                </View>
              </View>
            ))}
          </StatsCard>

          <StatsCard title="Derniers 7 jours">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: wp(80) }}>
              {chartCalories.map((cal, i) => {
                const maxCal = Math.max(2200, ...chartCalories);
                const h = (cal / maxCal) * wp(65);
                const inTarget = cal >= 1800 && cal <= 2200;
                return (
                  <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ width: wp(16), height: h, backgroundColor: inTarget ? '#00D984' : '#FF8C42', borderRadius: wp(4) }} />
                    <Text style={{ fontSize: fp(8), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>{chartDays[i] || ''}</Text>
                  </View>
                );
              })}
            </View>
          </StatsCard>
        </>
      );
    };

    const renderSanteTab = () => {
      if (medicalDataLoading) {
        return (
          <View style={{ padding: wp(40), alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#00D984" />
            <Text style={{ fontSize: fp(13), color: 'rgba(0,0,0,0.4)', marginTop: wp(10) }}>
              Chargement des données...
            </Text>
          </View>
        );
      }

      const analysesRows = medicalData.analyses.map(a => [
        { text: a.label, bold: true },
        a.value,
        {
          text: a.status === 'normal' ? 'Normal'
            : a.status === 'elevated' ? 'Élevé'
            : a.status === 'low' ? 'Bas'
            : a.status === 'critical' ? 'Critique'
            : a.status,
          color: a.status === 'normal' ? '#00D984'
            : a.status === 'elevated' ? '#FF6B6B'
            : a.status === 'low' ? '#FF8C42'
            : a.status === 'critical' ? '#FF6B6B'
            : '#999',
          bold: true,
        },
      ]);

      const medsRows = medicalData.medications.map(m => [
        { text: m.name, bold: true },
        (m.dosage || '') + (m.frequency ? ' / ' + m.frequency : ''),
        { text: m.duration || '-', color: '#00D984' },
      ]);

      const allergiesRows = medicalData.allergies.map(a => [
        { text: a.allergen, bold: true },
        a.type || '-',
        {
          text: a.severity === 'severe' ? 'Sévère'
            : a.severity === 'moderate' ? 'Modéré'
            : a.severity === 'mild' ? 'Léger'
            : a.severity === 'life_threatening' ? 'Vital'
            : a.severity || '-',
          color: a.severity === 'severe' || a.severity === 'life_threatening' ? '#FF6B6B'
            : a.severity === 'moderate' ? '#FF8C42'
            : '#00D984',
          bold: true,
        },
      ]);

      const vaccRows = medicalData.vaccinations.map(v => {
        const dateStr = v.administration_date
          ? new Date(v.administration_date).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })
          : '-';
        const rappelStr = v.next_due_date
          ? 'Rappel ' + new Date(v.next_due_date).getFullYear()
          : '✓ À jour';
        const rappelColor = v.next_due_date ? '#FF8C42' : '#00D984';

        return [
          { text: v.vaccine_name, bold: true },
          dateStr,
          { text: rappelStr, color: rappelColor },
        ];
      });

      return (
        <>
          <StatsCard title="Score Vitalité">
            <View style={{ alignItems: 'center', marginVertical: wp(8) }}>
              <View style={{
                width: wp(100), height: wp(100), borderRadius: wp(50),
                borderWidth: wp(6), borderColor: '#00D984',
                justifyContent: 'center', alignItems: 'center',
                backgroundColor: 'rgba(0,217,132,0.05)',
              }}>
                <Text style={{ fontSize: fp(28), fontWeight: '800', color: '#00D984' }}>{medicalData.vitalityScore || 0}</Text>
                <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.3)' }}>/100</Text>
              </View>
            </View>
          </StatsCard>

          {renderLixumTable('Analyses',
            [{ label: 'Analyse', flex: 2 }, { label: 'Valeur', flex: 1.2 }, { label: 'Statut', flex: 1, align: 'right' }],
            analysesRows,
            '#00D984',
            (rowIndex, row) => handleTransferToSecretPocket('analyses', rowIndex, row)
          )}

          {renderLixumTable('Médicaments',
            [{ label: 'Médicament', flex: 2 }, { label: 'Posologie', flex: 1.5 }, { label: 'Durée', flex: 1, align: 'right' }],
            medsRows,
            '#4DA6FF',
            (rowIndex, row) => handleTransferToSecretPocket('medications', rowIndex, row)
          )}

          {renderLixumTable('Allergies',
            [{ label: 'Allergène', flex: 2 }, { label: 'Type', flex: 1.5 }, { label: 'Sévérité', flex: 1, align: 'right' }],
            allergiesRows,
            '#FF8C42',
            (rowIndex, row) => handleTransferToSecretPocket('allergies', rowIndex, row)
          )}

          {renderLixumTable('Vaccins',
            [{ label: 'Vaccin', flex: 2 }, { label: 'Date', flex: 1.2 }, { label: 'Rappel', flex: 1, align: 'right' }],
            vaccRows,
            '#00D984',
            (rowIndex, row) => handleTransferToSecretPocket('vaccinations', rowIndex, row)
          )}
        </>
      );
    };

    const renderActiviteTab = () => (
      <>
        <StatsCard title="Cette semaine">
          <Text style={{ fontSize: fp(28), fontWeight: '700', color: '#00D984' }}>12 450 pas / jour</Text>
          <Text style={{ fontSize: fp(16), fontWeight: '600', color: '#4DA6FF', marginTop: wp(6) }}>4h32 d'activité</Text>
        </StatsCard>

        <StatsCard title="Calories brûlées">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: wp(80) }}>
            {burnedData.map((cal, i) => {
              const maxCal = 510;
              const h = Math.max(wp(4), (cal / maxCal) * wp(65));
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{ width: wp(16), height: h, backgroundColor: '#FF8C42', borderRadius: wp(4) }} />
                  <Text style={{ fontSize: fp(8), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>{weekDays[i]}</Text>
                </View>
              );
            })}
          </View>
        </StatsCard>
      </>
    );

    const renderHumeurTab = () => (
      <>
        <StatsCard title="Humeur moyenne">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
            <Text style={{ fontSize: fp(32) }}>😊</Text>
            <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#00D984' }}>Plutôt bien</Text>
          </View>
        </StatsCard>

        <StatsCard title="Courbe 7 jours">
          <View style={{ height: wp(80), flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            {moodData.map((val, i) => {
              const h = (val / 5) * wp(65);
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{
                    width: wp(10), height: wp(10), borderRadius: wp(5),
                    backgroundColor: '#00D984',
                    marginBottom: h,
                  }} />
                  <Text style={{ fontSize: fp(8), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>{weekDays[i]}</Text>
                </View>
              );
            })}
          </View>
        </StatsCard>
      </>
    );

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}
        >
          <Pressable delayPressIn={120} onPress={() => setMediBookView('landing')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center',
              marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>Mes Stats</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(50) }}>
          {/* Onglets */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: wp(12) }}>
            {['nutrition', 'santé', 'activité', 'humeur'].map(tab => (
              <Pressable
                key={tab}
                onPress={() => setStatsTab(tab)}
                style={{
                  paddingHorizontal: wp(18), paddingVertical: wp(8),
                  borderRadius: wp(20), marginRight: wp(8),
                  backgroundColor: statsTab === tab ? '#00D984' : 'rgba(0,0,0,0.05)',
                }}
              >
                <Text style={{
                  fontSize: fp(13), fontWeight: '600',
                  color: statsTab === tab ? '#FFF' : '#2D3436',
                }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {statsTab === 'nutrition' && renderNutritionTab()}
          {statsTab === 'santé' && renderSanteTab()}
          {statsTab === 'activité' && renderActiviteTab()}
          {statsTab === 'humeur' && renderHumeurTab()}
          <BottomSpacer />
        </ScrollView>

        {/* Bouton flottant + Ajouter — en bas à droite */}
        <Pressable
          delayPressIn={120}
          onPress={() => setShowMediBookUploadSheet(true)}
          style={{
            position: 'absolute',
            bottom: wp(80),
            right: wp(20),
            width: wp(56),
            height: wp(56),
            borderRadius: wp(28),
            overflow: 'hidden',
            shadowColor: '#00D984',
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
            zIndex: 100,
          }}
        >
          <LinearGradient
            colors={['#00D984', '#00B871']}
            style={{
              width: '100%', height: '100%',
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
          </LinearGradient>
        </Pressable>
      </View>
    );
  };

  const renderAnalysesDetail = () => {
    const doneList = medicalData.analyses.filter(a => !a.is_scheduled);
    const scheduledList = medicalData.scheduledAnalyses;
    const getDaysUntil = (dateStr) => {
      if (!dateStr) return null;
      return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={() => setReportSection('hub')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Analyses médicales</Text>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(100) }}>
          <View style={{ flexDirection: 'row', marginVertical: wp(12), gap: wp(8) }}>
            {[
              { key: 'done', label: 'Effectuées (' + doneList.length + ')' },
              { key: 'scheduled', label: 'À venir (' + scheduledList.length + ')' },
            ].map(tab => (
              <Pressable key={tab.key} onPress={() => setAnalysesTab(tab.key)}
                style={{
                  flex: 1, paddingVertical: wp(10), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: analysesTab === tab.key ? '#00D984' : 'rgba(0,0,0,0.05)',
                }}>
                <Text style={{
                  fontSize: fp(13), fontWeight: '600',
                  color: analysesTab === tab.key ? '#FFF' : '#2D3436',
                }}>{tab.label}</Text>
              </Pressable>
            ))}
          </View>

          {analysesTab === 'done' && (
            doneList.length === 0 ? (
              <View style={{ padding: wp(30), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                  Aucune analyse effectuée.{'\n'}Scannez un bilan sanguin pour commencer.
                </Text>
              </View>
            ) : (
              doneList.map((a, i) => (
                <View key={i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(14),
                  marginBottom: wp(8), borderLeftWidth: wp(3),
                  borderLeftColor: a.status === 'normal' ? '#00D984' : a.status === 'elevated' ? '#FF8C42' : a.status === 'low' ? '#FF8C42' : a.status === 'critical' ? '#FF6B6B' : '#999',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436', flex: 1 }}>{a.label}</Text>
                    <Text style={{
                      fontSize: fp(13), fontWeight: '700',
                      color: a.status === 'normal' ? '#00D984' : a.status === 'elevated' || a.status === 'low' ? '#FF8C42' : '#FF6B6B',
                    }}>{a.value}</Text>
                  </View>
                  {a.reference_range && (
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(4) }}>Réf : {a.reference_range}</Text>
                  )}
                  {a.laboratory && (
                    <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.25)', marginTop: wp(2) }}>
                      {a.laboratory}{a.analysis_date ? ' — ' + new Date(a.analysis_date).toLocaleDateString('fr-FR') : ''}
                    </Text>
                  )}
                </View>
              ))
            )
          )}

          {analysesTab === 'scheduled' && (
            scheduledList.length === 0 ? (
              <View style={{ padding: wp(30), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                  Aucune analyse planifiée.{'\n'}ALIXEN peut vous aider à en programmer.
                </Text>
              </View>
            ) : (
              scheduledList.map((a, i) => {
                const days = getDaysUntil(a.scheduled_date);
                const isUrgent = days !== null && days <= 7;
                return (
                  <View key={i} style={{
                    backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(14),
                    marginBottom: wp(8), borderLeftWidth: wp(3),
                    borderLeftColor: isUrgent ? '#FF6B6B' : '#FF8C42',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436', flex: 1 }}>{a.label}</Text>
                      <View style={{
                        backgroundColor: isUrgent ? 'rgba(255,107,107,0.15)' : 'rgba(255,140,66,0.15)',
                        borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3),
                      }}>
                        <Text style={{ fontSize: fp(11), fontWeight: '700', color: isUrgent ? '#FF6B6B' : '#FF8C42' }}>J-{days}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.5)', marginTop: wp(4) }}>
                      {a.scheduled_date ? new Date(a.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </Text>
                    {a.prescribed_by && (
                      <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(2) }}>Prescrit par {a.prescribed_by}</Text>
                    )}
                    {a.laboratory && (
                      <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)' }}>{a.laboratory}</Text>
                    )}
                    {a.notes && (
                      <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.3)', fontStyle: 'italic', marginTop: wp(4) }}>{a.notes}</Text>
                    )}
                    {a.reminder_enabled && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(6), gap: wp(4) }}>
                        <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
                          <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </Svg>
                        <Text style={{ fontSize: fp(10), color: '#00D984' }}>Rappel activé</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )
          )}
          <BottomSpacer />
        </ScrollView>

      {analysesTab === 'scheduled' && (
        <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
          <Pressable delayPressIn={120}
            onPress={() => setShowAddAnalysisSheet(true)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#00D984', borderRadius: wp(28),
              paddingHorizontal: wp(22), paddingVertical: wp(14),
              shadowColor: '#00D984', shadowOpacity: 0.4, shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 }, elevation: 8, gap: wp(8),
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}>
            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Planifier une analyse</Text>
          </Pressable>
        </View>
      )}
      </View>
    );
  };

  const renderMedicationsDetail = () => {
    const activeList = medicalData.medications;
    const terminatedList = medicalData.medsTerminated;
    const getProgress = (med) => {
      if (!med.start_date || !med.end_date) return null;
      const start = new Date(med.start_date).getTime();
      const end = new Date(med.end_date).getTime();
      const now = Date.now();
      const total = end - start;
      if (total <= 0) return 100;
      return Math.min(100, Math.max(0, Math.round(((now - start) / total) * 100)));
    };
    const getDayInfo = (med) => {
      if (!med.start_date || !med.end_date) return '';
      const start = new Date(med.start_date);
      const end = new Date(med.end_date);
      const now = new Date();
      const daysDone = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return 'Jour ' + Math.min(daysDone, totalDays) + '/' + totalDays;
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={() => setReportSection('hub')}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Médicaments</Text>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(100) }}>
          <View style={{ flexDirection: 'row', marginVertical: wp(12), gap: wp(8) }}>
            {[
              { key: 'active', label: 'En cours (' + activeList.length + ')' },
              { key: 'terminated', label: 'Archivés (' + terminatedList.length + ')' },
            ].map(tab => (
              <Pressable key={tab.key} onPress={() => setMedsTab(tab.key)}
                style={{
                  flex: 1, paddingVertical: wp(10), borderRadius: wp(14), alignItems: 'center',
                  backgroundColor: medsTab === tab.key ? '#4DA6FF' : 'rgba(0,0,0,0.05)',
                }}>
                <Text style={{
                  fontSize: fp(13), fontWeight: '600',
                  color: medsTab === tab.key ? '#FFF' : '#2D3436',
                }}>{tab.label}</Text>
              </Pressable>
            ))}
          </View>

          {medsTab === 'active' && (
            activeList.length === 0 ? (
              <View style={{ padding: wp(30), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                  Aucun traitement en cours.{'\n'}Scannez une ordonnance ou ajoutez manuellement.
                </Text>
              </View>
            ) : (
              activeList.map((med, i) => {
                const progress = getProgress(med);
                const dayInfo = getDayInfo(med);
                const freq = med.frequency_per_day || 1;
                const takenCount = med.taken_today ? freq : 0;
                return (
                  <View key={i} style={{
                    backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
                    marginBottom: wp(10), borderLeftWidth: wp(4), borderLeftColor: '#4DA6FF',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436' }}>{med.name}</Text>
                        <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>
                          {med.dosage || (med.dosage_value ? med.dosage_value + ' ' + (med.dosage_unit || 'mg') : '')}{med.frequency ? ' — ' + med.frequency : ''}
                        </Text>
                      </View>
                      {dayInfo ? (
                        <View style={{
                          backgroundColor: 'rgba(77,166,255,0.1)', borderRadius: wp(8),
                          paddingHorizontal: wp(8), paddingVertical: wp(4),
                        }}>
                          <Text style={{ fontSize: fp(10), fontWeight: '600', color: '#4DA6FF' }}>{dayInfo}</Text>
                        </View>
                      ) : null}
                    </View>
                    {progress !== null && (
                      <View style={{ marginTop: wp(10) }}>
                        <View style={{ height: wp(6), backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: wp(3), overflow: 'hidden' }}>
                          <View style={{ width: progress + '%', height: '100%', backgroundColor: progress >= 80 ? '#00D984' : '#4DA6FF', borderRadius: wp(3) }} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: wp(4) }}>
                          <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.3)' }}>
                            {med.start_date ? new Date(med.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''}
                          </Text>
                          <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.3)' }}>
                            {med.end_date ? new Date(med.end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''}
                          </Text>
                        </View>
                      </View>
                    )}
                    {(() => {
                      const defaultTimes = { 1: ['08:00'], 2: ['08:00', '20:00'], 3: ['08:00', '14:00', '20:00'], 4: ['08:00', '12:00', '16:00', '20:00'] };
                      const times = (med.frequency_times && med.frequency_times.length > 0) ? med.frequency_times : (defaultTimes[freq] || ['08:00']);
                      const todayTakenCount = Array.isArray(med.taken_history) ? med.taken_history.filter(h => h.date === new Date().toISOString().split('T')[0]).length : 0;
                      return (
                        <View style={{ marginTop: wp(10) }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(6) }}>
                            <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)' }}>Prises du jour</Text>
                            <Text style={{ fontSize: fp(11), fontWeight: '600', color: todayTakenCount >= times.length ? '#00D984' : 'rgba(0,0,0,0.3)' }}>
                              {todayTakenCount}/{times.length}
                            </Text>
                          </View>
                          {times.map((time, ti) => {
                            const taken = isTakenAtTime(med.taken_history, time);
                            return (
                              <Pressable key={ti} delayPressIn={120}
                                onPress={() => toggleMedicationTaken(med.id, ti, med.taken_history, times)}
                                style={({ pressed }) => ({
                                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                  backgroundColor: taken ? 'rgba(0,217,132,0.08)' : 'rgba(0,0,0,0.02)',
                                  borderRadius: wp(10), paddingHorizontal: wp(12), paddingVertical: wp(8),
                                  marginBottom: wp(4),
                                  borderWidth: 1,
                                  borderColor: taken ? 'rgba(0,217,132,0.2)' : 'rgba(0,0,0,0.06)',
                                  transform: [{ scale: pressed ? 0.97 : 1 }],
                                })}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                                  <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                                    <Circle cx="12" cy="12" r="9" stroke={taken ? '#00D984' : 'rgba(0,0,0,0.2)'} strokeWidth="1.5"/>
                                    <Line x1="12" y1="7" x2="12" y2="12" stroke={taken ? '#00D984' : 'rgba(0,0,0,0.2)'} strokeWidth="1.5" strokeLinecap="round"/>
                                    <Line x1="12" y1="12" x2="15" y2="14" stroke={taken ? '#00D984' : 'rgba(0,0,0,0.2)'} strokeWidth="1.5" strokeLinecap="round"/>
                                  </Svg>
                                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: taken ? '#00D984' : '#2D3436' }}>
                                    {time}
                                  </Text>
                                  {taken && (
                                    <Text style={{ fontSize: fp(10), color: 'rgba(0,217,132,0.6)' }}>
                                      Pris
                                    </Text>
                                  )}
                                </View>
                                <View style={{
                                  width: wp(24), height: wp(24), borderRadius: wp(6),
                                  backgroundColor: taken ? '#00D984' : 'rgba(0,0,0,0.04)',
                                  borderWidth: taken ? 0 : 1.5,
                                  borderColor: 'rgba(0,0,0,0.12)',
                                  justifyContent: 'center', alignItems: 'center',
                                }}>
                                  {taken && (
                                    <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                                      <Path d="M20 6L9 17l-5-5" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </Svg>
                                  )}
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      );
                    })()}
                    <Pressable
                      delayPressIn={120}
                      onPress={() => toggleMedicationReminder(med.id, med.reminder_enabled)}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', marginTop: wp(8), gap: wp(4),
                        backgroundColor: med.reminder_enabled ? 'rgba(0,217,132,0.08)' : 'rgba(0,0,0,0.04)',
                        borderRadius: wp(10), paddingHorizontal: wp(10), paddingVertical: wp(5),
                        alignSelf: 'flex-start',
                        borderWidth: 1,
                        borderColor: med.reminder_enabled ? 'rgba(0,217,132,0.2)' : 'rgba(0,0,0,0.08)',
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}
                    >
                      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
                        {med.reminder_enabled ? (
                          <>
                            <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <Path d="M13.73 21a2 2 0 01-3.46 0" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                          </>
                        ) : (
                          <>
                            <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <Line x1="3" y1="3" x2="21" y2="21" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round"/>
                          </>
                        )}
                      </Svg>
                      <Text style={{ fontSize: fp(10), color: med.reminder_enabled ? '#00D984' : 'rgba(0,0,0,0.3)' }}>
                        {med.reminder_enabled ? 'Rappel activé' : 'Activer le rappel'}
                      </Text>
                    </Pressable>
                    <Pressable delayPressIn={120}
                      onPress={() => archiveMedication(med.id, med.name)}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', marginTop: wp(4), gap: wp(4),
                        backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: wp(10),
                        paddingHorizontal: wp(10), paddingVertical: wp(5), alignSelf: 'flex-start',
                        borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}>
                      <Svg width={wp(12)} height={wp(12)} viewBox="0 0 24 24" fill="none">
                        <Path d="M21 8v13H3V8" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <Path d="M1 3h22v5H1z" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <Line x1="10" y1="12" x2="14" y2="12" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                      </Svg>
                      <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.3)' }}>Archiver</Text>
                    </Pressable>
                  </View>
                );
              })
            )
          )}

          {medsTab === 'terminated' && (
            terminatedList.length === 0 ? (
              <View style={{ padding: wp(30), alignItems: 'center' }}>
                <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>Aucun traitement archivé.</Text>
              </View>
            ) : (
              terminatedList.map((med, i) => (
                <View key={i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(14),
                  marginBottom: wp(8), borderLeftWidth: wp(3), borderLeftColor: 'rgba(0,0,0,0.1)', opacity: 0.7,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
                }}>
                  <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{med.name}</Text>
                  <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>
                    {med.dosage || ''}{med.duration ? ' — ' + med.duration : ''}
                  </Text>
                  {med.start_date && med.end_date && (
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>
                      Du {new Date(med.start_date).toLocaleDateString('fr-FR')} au {new Date(med.end_date).toLocaleDateString('fr-FR')}
                    </Text>
                  )}
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: wp(6),
                    paddingHorizontal: wp(8), paddingVertical: wp(2), alignSelf: 'flex-start', marginTop: wp(6),
                  }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: 'rgba(0,0,0,0.35)' }}>Archivé</Text>
                  </View>
                </View>
              ))
            )
          )}
          <BottomSpacer />
        </ScrollView>

      {/* FAB Ajouter un médicament — centré */}
      <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
        <Pressable
          delayPressIn={120}
          onPress={() => setShowAddMedSheet(true)}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#4DA6FF',
            borderRadius: wp(28), paddingHorizontal: wp(22), paddingVertical: wp(14),
            shadowColor: '#4DA6FF', shadowOpacity: 0.4, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 8,
            gap: wp(8),
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
            <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
          </Svg>
          <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Ajouter un médicament</Text>
        </Pressable>
      </View>
      </View>
    );
  };

  const renderReportHub = () => {
    const activeCount = medicalData.medications.length;
    const terminatedCount = medicalData.medsTerminated.length;
    const doneAnalyses = medicalData.analyses.length;
    const scheduledCount = medicalData.scheduledAnalyses.length;
    const allergiesCount = medicalData.allergies.length;
    const vaccCount = medicalData.vaccinations.length;
    const diagCount = medicalData.diagnostics.length;
    const nextScheduled = medicalData.scheduledAnalyses.length > 0 ? medicalData.scheduledAnalyses[0] : null;
    const daysUntilNext = nextScheduled ? Math.ceil((new Date(nextScheduled.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    const SectionCard = ({ title, subtitle, count, color, icon, onPress, badge }) => (
      <Pressable delayPressIn={120} onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
          marginBottom: wp(10), flexDirection: 'row', alignItems: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          borderLeftWidth: wp(4), borderLeftColor: color,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}>
        <View style={{
          width: wp(44), height: wp(44), borderRadius: wp(14),
          backgroundColor: color + '15', justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
        }}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#2D3436' }}>{title}</Text>
          <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>{subtitle}</Text>
        </View>
        {badge && (
          <View style={{
            backgroundColor: badge.bgColor || 'rgba(255,107,107,0.15)',
            borderRadius: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(3), marginRight: wp(8),
          }}>
            <Text style={{ fontSize: fp(10), fontWeight: '700', color: badge.color || '#FF6B6B' }}>{badge.text}</Text>
          </View>
        )}
        <View style={{
          backgroundColor: color + '20', borderRadius: wp(10),
          paddingHorizontal: wp(10), paddingVertical: wp(4), marginRight: wp(8),
        }}>
          <Text style={{ fontSize: fp(13), fontWeight: '700', color: color }}>{count}</Text>
        </View>
        <Text style={{ fontSize: fp(16), color: 'rgba(0,0,0,0.15)' }}>{">"}</Text>
      </Pressable>
    );

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={() => { setReportSection('hub'); setMediBookView('landing'); }}
            style={({ pressed }) => ({
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>Mes données</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Centre de commande santé</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(50) }}>
          {/* Score Vitalité + prochain RDV */}
          <View style={{
            backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16), marginBottom: wp(16),
            flexDirection: 'row', alignItems: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <View style={{
              width: wp(56), height: wp(56), borderRadius: wp(28),
              borderWidth: wp(4), borderColor: '#00D984',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
            }}>
              <Text style={{ fontSize: fp(18), fontWeight: '800', color: '#00D984' }}>{medicalData.vitalityScore || 0}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>Score Vitalité</Text>
              {nextScheduled ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(4) }}>
                  <View style={{
                    backgroundColor: daysUntilNext <= 7 ? 'rgba(255,107,107,0.15)' : 'rgba(255,140,66,0.15)',
                    borderRadius: wp(6), paddingHorizontal: wp(6), paddingVertical: wp(2), marginRight: wp(6),
                  }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '700', color: daysUntilNext <= 7 ? '#FF6B6B' : '#FF8C42' }}>J-{daysUntilNext}</Text>
                  </View>
                  <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', flex: 1 }} numberOfLines={1}>{nextScheduled.label}</Text>
                </View>
              ) : (
                <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.3)', marginTop: wp(4) }}>Aucune analyse planifiée</Text>
              )}
            </View>
          </View>

          {medicalDataLoading && (
            <View style={{ padding: wp(20), alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#00D984" />
            </View>
          )}

          <SectionCard title="Analyses médicales"
            subtitle={scheduledCount > 0 ? scheduledCount + ' analyse' + (scheduledCount > 1 ? 's' : '') + ' à venir' : 'Historique de vos bilans'}
            count={doneAnalyses} color="#00D984"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M9 2v6l-5 8a3 3 0 002.6 4.5h10.8A3 3 0 0020 16l-5-8V2" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" /><Line x1="9" y1="2" x2="15" y2="2" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" /></Svg>}
            onPress={() => setReportSection('analyses')}
            badge={scheduledCount > 0 ? { text: scheduledCount + ' à venir', color: '#FF8C42', bgColor: 'rgba(255,140,66,0.15)' } : null}
          />

          <SectionCard title="Médicaments"
            subtitle={activeCount > 0 ? activeCount + ' traitement' + (activeCount > 1 ? 's' : '') + ' en cours' : 'Aucun traitement actif'}
            count={activeCount + terminatedCount} color="#4DA6FF"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M10.5 1.5l-8 8a4.24 4.24 0 006 6l8-8a4.24 4.24 0 00-6-6z" stroke="#4DA6FF" strokeWidth="1.5" /><Line x1="8" y1="8" x2="14" y2="14" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" /></Svg>}
            onPress={() => setReportSection('medications')}
            badge={activeCount > 0 ? { text: activeCount + ' actif' + (activeCount > 1 ? 's' : ''), color: '#00D984', bgColor: 'rgba(0,217,132,0.15)' } : null}
          />

          <SectionCard title="Allergies et intolérances"
            subtitle={allergiesCount > 0 ? 'Profil allergique enregistré' : 'Aucune allergie enregistrée'}
            count={allergiesCount} color="#FF8C42"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#FF8C42" strokeWidth="1.5" /></Svg>}
            onPress={function() { setReportSection('allergies'); }}
          />

          <SectionCard title="Carnet vaccinal"
            subtitle={vaccCount > 0 ? vaccCount + ' vaccin' + (vaccCount > 1 ? 's' : '') + ' enregistré' + (vaccCount > 1 ? 's' : '') : 'Aucun vaccin enregistré'}
            count={vaccCount} color="#9B6DFF"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M18 2l4 4-9.5 9.5-4-4L18 2z" stroke="#9B6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><Path d="M8.5 11.5L2 18v4h4l6.5-6.5" stroke="#9B6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            onPress={function() { setReportSection('vaccinations'); }}
          />

          <SectionCard title="Diagnostics à surveiller"
            subtitle={diagCount > 0 ? diagCount + ' diagnostic' + (diagCount > 1 ? 's' : '') : 'Aucun diagnostic enregistré'}
            count={diagCount} color="#FF6B6B"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke="#FF6B6B" strokeWidth="1.5" /><Path d="M3 12h4l3-6 4 12 3-6h4" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></Svg>}
            onPress={function() { setReportSection('diagnostics'); }}
          />

          <SectionCard title="Calendrier de santé"
            subtitle={(doneAnalyses + activeCount + terminatedCount + allergiesCount + vaccCount + diagCount) + ' événements médicaux'}
            count="" color="#D4AF37"
            icon={<Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="18" rx="2" stroke="#D4AF37" strokeWidth="1.5" /><Line x1="16" y1="2" x2="16" y2="6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" /><Line x1="8" y1="2" x2="8" y2="6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" /><Line x1="3" y1="10" x2="21" y2="10" stroke="#D4AF37" strokeWidth="1.5" /></Svg>}
            onPress={function() { setReportSection('calendar'); setSelectedDay(null); }}
          />

          <Pressable delayPressIn={120} onPress={() => setReportSection('pdf-preview')} style={{ marginTop: wp(12), marginBottom: wp(16) }}>
            <LinearGradient colors={['#00D984', '#00B871']}
              style={{ borderRadius: wp(16), paddingVertical: wp(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(10) }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="12" height="18" rx="2" stroke="#FFF" strokeWidth="1.5" />
                <Line x1="8" y1="7" x2="12" y2="7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Path d="M16 8l4 4-4 4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: fp(16), fontWeight: '700' }}>Générer mon MediBook</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fp(11) }}>500 Lix — Rapport PDF 3 mois</Text>
              </View>
            </LinearGradient>
          </Pressable>

          <BottomSpacer />
        </ScrollView>

        <Pressable delayPressIn={120} onPress={() => setShowMediBookUploadSheet(true)}
          style={{
            position: 'absolute', bottom: wp(80), right: wp(20),
            width: wp(56), height: wp(56), borderRadius: wp(28), overflow: 'hidden',
            shadowColor: '#00D984', shadowOpacity: 0.4, shadowRadius: 12, elevation: 8, zIndex: 100,
          }}>
          <LinearGradient colors={['#00D984', '#00B871']}
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
          </LinearGradient>
        </Pressable>
      </View>
    );
  };

  const renderPdfPreview = () => (
    <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
        style={{
          paddingTop: Platform.OS === 'android' ? 35 : 50,
          paddingBottom: wp(12), paddingHorizontal: wp(12),
          flexDirection: 'row', alignItems: 'center',
          borderBottomWidth: 1, borderBottomColor: '#4A4F55',
        }}
      >
        <Pressable delayPressIn={120} onPress={() => setReportSection('hub')}
          style={({ pressed }) => ({
            width: wp(36), height: wp(36), borderRadius: wp(18),
            backgroundColor: 'rgba(255,255,255,0.08)',
            justifyContent: 'center', alignItems: 'center',
            marginRight: wp(10),
            transform: [{ scale: pressed ? 0.92 : 1 }],
          })}>
          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }} numberOfLines={1}>MediBook PDF</Text>
          <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Prévisualisation du rapport</Text>
        </View>
        {renderProfileSwitchButton()}
        <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: wp(10), paddingHorizontal: wp(8), paddingVertical: wp(4), marginLeft: wp(6) }}>
          <Text style={{ color: '#D4AF37', fontSize: fp(10), fontWeight: '700' }}>500 Lix</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingBottom: wp(50) }}>
        <View style={{ alignItems: 'center', marginTop: wp(8), marginBottom: wp(6) }}>
          <Svg width={wp(56)} height={wp(56)} viewBox="0 0 64 64" fill="none">
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

        <View style={{
          backgroundColor: '#FAFBFC', borderRadius: wp(16),
          borderLeftWidth: wp(3), borderLeftColor: '#00D984',
          padding: wp(16), marginBottom: wp(20),
          shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
        }}>
          <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', marginBottom: wp(16) }}>
            État de vos données
          </Text>
          {mbDataStatus.map((item, i) => <MbProgressRow key={i} item={item} />)}
        </View>

        <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', marginTop: wp(4), marginBottom: wp(14) }}>
          Contenu de votre MediBook
        </Text>
        {mbSections.map((sec, i) => (
          <LinearGradient key={i} colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              flexDirection: 'row', alignItems: 'center',
              borderRadius: wp(12), padding: wp(12), marginBottom: wp(8),
              borderWidth: 1, borderColor: '#4A4F55',
            }}>
            <View style={{
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: sec.color + '20',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
            }}>
              <MbSectionIcon type={sec.icon} color={sec.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: fp(13), fontWeight: '600' }}>{sec.title}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: fp(11) }}>{sec.desc}</Text>
            </View>
          </LinearGradient>
        ))}

        <Pressable delayPressIn={120}
          onPress={function() { showMbModal('info', 'MediBook', 'La génération PDF sera disponible prochainement !'); }}
          onPressIn={() => Animated.timing(mbGenerateScale, { toValue: 0.95, duration: 120, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(mbGenerateScale, { toValue: 1, useNativeDriver: true }).start()}>
          <Animated.View style={{ transform: [{ scale: mbGenerateScale }], marginTop: wp(24), marginBottom: wp(32) }}>
            <LinearGradient colors={['#00D984', '#00B871']}
              style={{ borderRadius: wp(16), paddingVertical: wp(16), flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: wp(10) }}>
              <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                <Rect x="4" y="2" width="12" height="18" rx="2" stroke="#FFF" strokeWidth="1.5" />
                <Line x1="8" y1="7" x2="12" y2="7" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Line x1="8" y1="11" x2="12" y2="11" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
                <Path d="M16 8l4 4-4 4" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <View>
                <Text style={{ color: '#FFFFFF', fontSize: fp(16), fontWeight: '700' }}>Générer mon MediBook</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: fp(11) }}>500 Lix — Rapport PDF 3 mois</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </Pressable>
        <BottomSpacer />
      </ScrollView>
    </View>
  );

  // ── RENDER ALLERGIES DETAIL ────────────────────────────────────────────
  var renderAllergiesDetail = function() {
    var allergyList = medicalData.allergies || [];
    var TYPE_STYLES = {
      alimentaire: { color: '#FF8C42', label: 'Alimentaire' },
      medicamenteuse: { color: '#FF6B6B', label: 'Médicamenteuse' },
      respiratoire: { color: '#4DA6FF', label: 'Respiratoire' },
      cutanee: { color: '#9B6DFF', label: 'Cutanée' },
    };
    var SEV_COLORS = { mild: '#00D984', moderate: '#FF8C42', severe: '#FF6B6B' };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{ paddingTop: Platform.OS === 'android' ? 35 : 50, paddingBottom: wp(12), paddingHorizontal: wp(12), flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4A4F55' }}>
          <Pressable delayPressIn={120} onPress={function() { setReportSection('hub'); }}
            style={function(state) { return { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10), transform: [{ scale: state.pressed ? 0.92 : 1 }] }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Allergies et intolérances</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
          {allergyList.length === 0 ? (
            <View style={{ padding: wp(30), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                Aucune allergie enregistrée.{'\n'}Scannez un document ou ajoutez manuellement.
              </Text>
            </View>
          ) : (
            allergyList.map(function(allergy, i) {
              var typeStyle = TYPE_STYLES[allergy.type] || { color: '#999', label: allergy.type || 'Autre' };
              var sevColor = SEV_COLORS[allergy.severity] || '#999';
              return (
                <View key={allergy.id || i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
                  marginBottom: wp(10), borderLeftWidth: wp(4), borderLeftColor: typeStyle.color,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436', flex: 1 }}>{allergy.allergen}</Text>
                    <View style={{ flexDirection: 'row', gap: wp(6) }}>
                      <View style={{ backgroundColor: typeStyle.color + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: typeStyle.color }}>{typeStyle.label}</Text>
                      </View>
                      <View style={{ backgroundColor: sevColor + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: sevColor }}>
                          {allergy.severity === 'severe' ? 'SÉVÈRE' : allergy.severity === 'moderate' ? 'MODÉRÉ' : 'LÉGER'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {allergy.reaction ? (
                    <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.45)', marginTop: wp(6), fontStyle: 'italic' }} numberOfLines={2}>{allergy.reaction}</Text>
                  ) : null}
                </View>
              );
            })
          )}
          <BottomSpacer />
        </ScrollView>

        <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
          <Pressable delayPressIn={120}
            onPress={function() { setShowAddAllergySheet(true); }}
            style={function(state) { return {
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#FF8C42', borderRadius: wp(28), paddingHorizontal: wp(22), paddingVertical: wp(14),
              shadowColor: '#FF8C42', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
              gap: wp(8), transform: [{ scale: state.pressed ? 0.95 : 1 }],
            }; }}>
            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Ajouter une allergie</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ── RENDER VACCINATIONS DETAIL ───────────────────────────────────────────
  var renderVaccinationsDetail = function() {
    var vaccList = medicalData.vaccinations || [];
    var now = Date.now();

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{ paddingTop: Platform.OS === 'android' ? 35 : 50, paddingBottom: wp(12), paddingHorizontal: wp(12), flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#4A4F55' }}>
          <Pressable delayPressIn={120} onPress={function() { setReportSection('hub'); }}
            style={function(state) { return { width: wp(36), height: wp(36), borderRadius: wp(18), backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginRight: wp(10), transform: [{ scale: state.pressed ? 0.92 : 1 }] }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Carnet vaccinal</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
          {vaccList.length === 0 ? (
            <View style={{ padding: wp(30), alignItems: 'center' }}>
              <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                Aucun vaccin enregistré.{'\n'}Scannez votre carnet ou ajoutez manuellement.
              </Text>
            </View>
          ) : (
            vaccList.map(function(vac, i) {
              var nextDue = vac.next_due_date ? new Date(vac.next_due_date).getTime() : null;
              var isOverdue = nextDue && nextDue < now;
              var isSoon = nextDue && !isOverdue && (nextDue - now) < 90 * 24 * 60 * 60 * 1000;
              return (
                <View key={vac.id || i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
                  marginBottom: wp(10), borderLeftWidth: wp(4), borderLeftColor: '#9B6DFF',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436' }}>{vac.vaccine_name}</Text>
                      {vac.administration_date ? (
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>
                          {new Date(vac.administration_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </Text>
                      ) : null}
                      {vac.administered_by ? (
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(2) }}>{vac.administered_by}</Text>
                      ) : null}
                    </View>
                    <View style={{ flexDirection: 'row', gap: wp(6), alignItems: 'center' }}>
                      <View style={{ backgroundColor: 'rgba(155,109,255,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#9B6DFF' }}>{'Dose ' + (vac.dose_number || 1)}</Text>
                      </View>
                      {isOverdue ? (
                        <View style={{ backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                          <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#FF6B6B' }}>Rappel en retard</Text>
                        </View>
                      ) : isSoon ? (
                        <View style={{ backgroundColor: 'rgba(255,140,66,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                          <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#FF8C42' }}>Rappel bientôt</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                  {vac.next_due_date ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: wp(8), gap: wp(6) }}>
                      <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                        <Rect x="3" y="4" width="18" height="18" rx="2" stroke={isOverdue ? '#FF6B6B' : '#FF8C42'} strokeWidth="1.5" />
                        <Line x1="16" y1="2" x2="16" y2="6" stroke={isOverdue ? '#FF6B6B' : '#FF8C42'} strokeWidth="1.5" strokeLinecap="round" />
                        <Line x1="8" y1="2" x2="8" y2="6" stroke={isOverdue ? '#FF6B6B' : '#FF8C42'} strokeWidth="1.5" strokeLinecap="round" />
                        <Line x1="3" y1="10" x2="21" y2="10" stroke={isOverdue ? '#FF6B6B' : '#FF8C42'} strokeWidth="1.5" />
                      </Svg>
                      <Text style={{ fontSize: fp(11), color: isOverdue ? '#FF6B6B' : '#FF8C42', fontWeight: '600' }}>
                        {'Prochain rappel : ' + new Date(vac.next_due_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
          <BottomSpacer />
        </ScrollView>

        <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
          <Pressable delayPressIn={120}
            onPress={function() { setShowAddVaccSheet(true); }}
            style={function(state) { return {
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#9B6DFF', borderRadius: wp(28), paddingHorizontal: wp(22), paddingVertical: wp(14),
              shadowColor: '#9B6DFF', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8,
              gap: wp(8), transform: [{ scale: state.pressed ? 0.95 : 1 }],
            }; }}>
            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Ajouter un vaccin</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ── RENDER DIAGNOSTICS DETAIL ──────────────────────────────────────────
  var renderDiagnosticsDetail = function() {
    var diagList = medicalData.diagnostics || [];
    var SEVERITY_COLORS = { mild: '#00D984', moderate: '#FF8C42', severe: '#FF6B6B' };
    var STATUS_STYLES = {
      active: { bg: 'rgba(255,107,107,0.15)', color: '#FF6B6B', label: 'Actif' },
      resolved: { bg: 'rgba(0,217,132,0.15)', color: '#00D984', label: 'Résolu' },
      chronic: { bg: 'rgba(77,166,255,0.15)', color: '#4DA6FF', label: 'Chronique' },
      monitoring: { bg: 'rgba(241,196,15,0.15)', color: '#F1C40F', label: 'Suivi' },
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={function() { setReportSection('hub'); }}
            style={function(state) { return {
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: state.pressed ? 0.92 : 1 }],
            }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Diagnostics</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(100) }}>
          {diagList.length === 0 ? (
            <View style={{ padding: wp(30), alignItems: 'center' }}>
              <Svg width={wp(48)} height={wp(48)} viewBox="0 0 24 24" fill="none" style={{ marginBottom: wp(12), opacity: 0.3 }}>
                <Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke="#FF6B6B" strokeWidth="1.5" />
                <Path d="M3 12h4l3-6 4 12 3-6h4" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ fontSize: fp(14), color: 'rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: fp(20) }}>
                Aucun diagnostic enregistré.{'\n'}Ajoutez vos diagnostics pour un suivi complet.
              </Text>
            </View>
          ) : (
            diagList.map(function(diag, i) {
              var sevColor = SEVERITY_COLORS[diag.severity] || '#999';
              var statusStyle = STATUS_STYLES[diag.status] || STATUS_STYLES.active;
              return (
                <View key={diag.id || i} style={{
                  backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(16),
                  marginBottom: wp(10), borderLeftWidth: wp(4), borderLeftColor: sevColor,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: wp(8) }}>
                      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436' }}>{diag.condition_name}</Text>
                      {diag.diagnosed_by ? (
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>
                          {'Dr. ' + diag.diagnosed_by}
                        </Text>
                      ) : null}
                    </View>
                    <View style={{ flexDirection: 'row', gap: wp(6), alignItems: 'center' }}>
                      <View style={{ backgroundColor: sevColor + '20', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: sevColor }}>
                          {diag.severity === 'severe' ? 'SÉVÈRE' : diag.severity === 'moderate' ? 'MODÉRÉ' : 'LÉGER'}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: statusStyle.bg, borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                        <Text style={{ fontSize: fp(9), fontWeight: '700', color: statusStyle.color }}>{statusStyle.label}</Text>
                      </View>
                    </View>
                  </View>
                  {diag.diagnosed_date ? (
                    <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(6) }}>
                      {'Diagnostiqué le ' + new Date(diag.diagnosed_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                  ) : null}
                  {diag.notes ? (
                    <Text style={{ fontSize: fp(12), color: 'rgba(0,0,0,0.45)', marginTop: wp(6), fontStyle: 'italic' }} numberOfLines={2}>
                      {diag.notes}
                    </Text>
                  ) : null}
                </View>
              );
            })
          )}
          <BottomSpacer />
        </ScrollView>

        <View style={{ position: 'absolute', bottom: wp(30), left: 0, right: 0, alignItems: 'center' }}>
          <Pressable
            delayPressIn={120}
            onPress={function() { setShowAddDiagSheet(true); }}
            style={function(state) { return {
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#FF6B6B',
              borderRadius: wp(28), paddingHorizontal: wp(22), paddingVertical: wp(14),
              shadowColor: '#FF6B6B', shadowOpacity: 0.4, shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 }, elevation: 8,
              gap: wp(8),
              transform: [{ scale: state.pressed ? 0.95 : 1 }],
            }; }}
          >
            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
              <Line x1="12" y1="5" x2="12" y2="19" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
              <Line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round"/>
            </Svg>
            <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#FFF' }}>Ajouter un diagnostic</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  // ── CALENDAR HELPERS ──────────────────────────────────────────────────────
  var CAL_COLORS = { diagnostic: '#FF6B6B', medication: '#4DA6FF', vaccination: '#9B6DFF', analysis: '#00D984', allergy: '#FF8C42' };
  var CAL_LABELS = { diagnostic: 'Diagnostic', medication: 'Médicament', vaccination: 'Vaccin', analysis: 'Analyse', allergy: 'Allergie' };
  var MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  var DAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  var getCalendarEvents = function() {
    var events = [];
    (medicalData.diagnostics || []).forEach(function(d) {
      var dt = d.diagnosed_date || d.created_at;
      if (dt) events.push({ type: 'diagnostic', date: new Date(dt), title: d.condition_name || 'Diagnostic', detail: (d.severity ? (d.severity === 'severe' ? 'Sévère' : d.severity === 'moderate' ? 'Modéré' : 'Léger') : '') + (d.status ? ' — ' + (d.status === 'active' ? 'Actif' : d.status === 'resolved' ? 'Résolu' : d.status) : ''), raw: d });
    });
    (medicalData.medications || []).forEach(function(m) {
      var dt = m.start_date || m.created_at;
      if (dt) events.push({ type: 'medication', date: new Date(dt), title: m.name || 'Médicament', detail: (m.dosage || '') + (m.frequency ? ' — ' + m.frequency : ''), raw: m });
    });
    (medicalData.vaccinations || []).forEach(function(v) {
      var dt = v.administration_date || v.created_at;
      if (dt) events.push({ type: 'vaccination', date: new Date(dt), title: v.vaccine_name || 'Vaccin', detail: 'Dose ' + (v.dose_number || 1) + (v.next_due_date ? ' — Rappel ' + new Date(v.next_due_date).getFullYear() : ''), raw: v });
    });
    (medicalData.analyses || []).forEach(function(a) {
      var dt = a.created_at;
      if (dt) events.push({ type: 'analysis', date: new Date(dt), title: a.label || 'Analyse', detail: (a.value || '') + (a.status ? ' — ' + (a.status === 'normal' ? 'Normal' : a.status === 'elevated' ? 'Élevé' : a.status === 'low' ? 'Bas' : a.status === 'critical' ? 'Critique' : a.status) : ''), raw: a });
    });
    (medicalData.allergies || []).forEach(function(al) {
      var dt = al.created_at;
      if (dt) events.push({ type: 'allergy', date: new Date(dt), title: al.allergen || 'Allergie', detail: (al.type || '') + (al.severity ? ' — ' + (al.severity === 'severe' ? 'Sévère' : al.severity === 'life_threatening' ? 'Vital' : al.severity === 'moderate' ? 'Modéré' : 'Léger') : ''), raw: al });
    });
    return events;
  };

  var getEventsForDay = function(day, month, year, filters) {
    var all = getCalendarEvents();
    return all.filter(function(e) {
      if (!filters[e.type]) return false;
      return e.date.getDate() === day && e.date.getMonth() === month && e.date.getFullYear() === year;
    });
  };

  var getDaysInMonth = function(month, year) { return new Date(year, month + 1, 0).getDate(); };
  var getFirstDayOfWeek = function(month, year) { var d = new Date(year, month, 1).getDay(); return d === 0 ? 6 : d - 1; };

  var formatCalDate = function(d) { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); };

  // ── RENDER CALENDAR SECTION ────────────────────────────────────────────────
  var renderCalendarSection = function() {
    var daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    var firstDay = getFirstDayOfWeek(calendarMonth, calendarYear);
    var today = new Date();
    var isCurrentMonth = today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;
    var todayDate = today.getDate();
    var allEvents = getCalendarEvents();
    var cellSize = (SCREEN_WIDTH - wp(32) - wp(6) * 6) / 7;

    var calendarRows = [];
    var currentRow = [];
    var i;
    for (i = 0; i < firstDay; i++) { currentRow.push(null); }
    for (i = 1; i <= daysInMonth; i++) {
      currentRow.push(i);
      if (currentRow.length === 7) { calendarRows.push(currentRow); currentRow = []; }
    }
    if (currentRow.length > 0) {
      while (currentRow.length < 7) { currentRow.push(null); }
      calendarRows.push(currentRow);
    }

    var getDayPastilles = function(day) {
      if (!day) return [];
      var types = {};
      allEvents.forEach(function(e) {
        if (e.date.getDate() === day && e.date.getMonth() === calendarMonth && e.date.getFullYear() === calendarYear && calendarFilters[e.type]) {
          types[e.type] = true;
        }
      });
      return Object.keys(types);
    };

    var dayEvents = selectedDay ? getEventsForDay(selectedDay, calendarMonth, calendarYear, calendarFilters) : [];

    var handleDayPress = function(day) {
      if (!day) return;
      var evts = getEventsForDay(day, calendarMonth, calendarYear, calendarFilters);
      if (evts.length === 0) { setSelectedDay(null); return; }
      setSelectedDay(day);
      calSlideAnim.setValue(0);
      Animated.timing(calSlideAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    };

    var goToPrevMonth = function() {
      setSelectedDay(null);
      if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
      else { setCalendarMonth(calendarMonth - 1); }
    };
    var goToNextMonth = function() {
      setSelectedDay(null);
      if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
      else { setCalendarMonth(calendarMonth + 1); }
    };

    return (
      <View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#3A3F46', '#252A30']}
          style={{
            paddingTop: Platform.OS === 'android' ? 35 : 50,
            paddingBottom: wp(12), paddingHorizontal: wp(12),
            flexDirection: 'row', alignItems: 'center',
            borderBottomWidth: 1, borderBottomColor: '#4A4F55',
          }}>
          <Pressable delayPressIn={120} onPress={function() { setReportSection('hub'); setSelectedDay(null); }}
            style={function(state) { return {
              width: wp(36), height: wp(36), borderRadius: wp(18),
              backgroundColor: 'rgba(255,255,255,0.08)',
              justifyContent: 'center', alignItems: 'center', marginRight: wp(10),
              transform: [{ scale: state.pressed ? 0.92 : 1 }],
            }; }}>
            <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none">
              <Path d="M15 19l-7-7 7-7" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF' }}>Calendrier santé</Text>
            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.5)' }}>Tous vos événements médicaux</Text>
          </View>
          {renderProfileSwitchButton()}
        </LinearGradient>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: wp(16), paddingTop: wp(12), paddingBottom: wp(100) }}>
          {/* Navigation mois */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(10), marginBottom: wp(10),
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            <Pressable delayPressIn={120} onPress={goToPrevMonth}
              style={function(state) { return {
                width: wp(36), height: wp(36), borderRadius: wp(12),
                backgroundColor: state.pressed ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
                justifyContent: 'center', alignItems: 'center',
              }; }}>
              <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                <Path d="M15 19l-7-7 7-7" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
            <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#2D3436' }}>
              {MONTH_NAMES[calendarMonth] + ' ' + calendarYear}
            </Text>
            <Pressable delayPressIn={120} onPress={goToNextMonth}
              style={function(state) { return {
                width: wp(36), height: wp(36), borderRadius: wp(12),
                backgroundColor: state.pressed ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.03)',
                justifyContent: 'center', alignItems: 'center',
              }; }}>
              <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                <Path d="M9 5l7 7-7 7" stroke="#2D3436" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </View>

          {/* Grille calendrier */}
          <View style={{
            backgroundColor: '#FAFBFC', borderRadius: wp(16), padding: wp(10), marginBottom: wp(12),
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}>
            {/* En-têtes jours */}
            <View style={{ flexDirection: 'row', marginBottom: wp(6) }}>
              {DAY_HEADERS.map(function(dh) {
                return (
                  <View key={dh} style={{ width: cellSize, alignItems: 'center', paddingVertical: wp(4) }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '600', color: 'rgba(0,0,0,0.35)' }}>{dh}</Text>
                  </View>
                );
              })}
            </View>
            {/* Lignes de jours */}
            {calendarRows.map(function(row, ri) {
              return (
                <View key={'row-' + ri} style={{ flexDirection: 'row', marginBottom: wp(2) }}>
                  {row.map(function(day, ci) {
                    var pastilles = getDayPastilles(day);
                    var isToday = isCurrentMonth && day === todayDate;
                    var isSelected = day === selectedDay;
                    var hasEvents = pastilles.length > 0;
                    return (
                      <Pressable key={'cell-' + ri + '-' + ci} delayPressIn={80}
                        onPress={function() { handleDayPress(day); }}
                        style={function(state) { return {
                          width: cellSize, height: cellSize + wp(6), alignItems: 'center', justifyContent: 'center',
                          borderRadius: wp(10),
                          backgroundColor: isSelected ? 'rgba(0,217,132,0.12)' : state.pressed && day ? 'rgba(0,0,0,0.04)' : 'transparent',
                          borderWidth: isToday ? 1.5 : 0, borderColor: '#00D984',
                        }; }}>
                        {day ? (
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{
                              fontSize: fp(13), fontWeight: isToday || isSelected ? '700' : '400',
                              color: isSelected ? '#00D984' : isToday ? '#00D984' : '#2D3436',
                            }}>
                              {day}
                            </Text>
                            {/* Pastilles */}
                            {hasEvents ? (
                              <View style={{ flexDirection: 'row', marginTop: wp(2), gap: wp(2) }}>
                                {pastilles.slice(0, 3).map(function(t, pi) {
                                  return (
                                    <View key={pi} style={{
                                      width: wp(5), height: wp(5), borderRadius: wp(2.5),
                                      backgroundColor: CAL_COLORS[t],
                                    }} />
                                  );
                                })}
                              </View>
                            ) : null}
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}
          </View>

          {/* Liste événements du jour sélectionné */}
          {selectedDay && dayEvents.length > 0 ? (
            <View>
              <Text style={{ fontSize: fp(14), fontWeight: '700', color: '#2D3436', marginBottom: wp(10), marginTop: wp(4) }}>
                {selectedDay + ' ' + MONTH_NAMES[calendarMonth] + ' ' + calendarYear}
              </Text>
              {dayEvents.map(function(evt, ei) {
                var slideY = calSlideAnim.interpolate({ inputRange: [0, 1], outputRange: [30 + ei * 10, 0] });
                return (
                  <Animated.View key={ei} style={{
                    opacity: calSlideAnim,
                    transform: [{ translateY: slideY }],
                  }}>
                    <Pressable delayPressIn={120}
                      onPress={function() { setCalEventDetail(evt); }}
                      style={function(state) { return {
                        backgroundColor: '#FAFBFC', borderRadius: wp(14), padding: wp(14),
                        marginBottom: wp(8), flexDirection: 'row', alignItems: 'center',
                        borderLeftWidth: wp(4), borderLeftColor: CAL_COLORS[evt.type],
                        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
                        transform: [{ scale: state.pressed ? 0.97 : 1 }],
                      }; }}>
                      <View style={{
                        width: wp(10), height: wp(10), borderRadius: wp(5),
                        backgroundColor: CAL_COLORS[evt.type], marginRight: wp(12),
                      }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#2D3436' }}>{evt.title}</Text>
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.35)', marginTop: wp(1) }}>{CAL_LABELS[evt.type]}</Text>
                        <Text style={{ fontSize: fp(11), color: 'rgba(0,0,0,0.4)', marginTop: wp(2) }}>{evt.detail}</Text>
                        <Text style={{ fontSize: fp(10), color: 'rgba(0,0,0,0.25)', marginTop: wp(3) }}>{formatCalDate(evt.date)}</Text>
                      </View>
                      <Text style={{ fontSize: fp(16), color: 'rgba(0,0,0,0.15)' }}>{">"}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          ) : null}

          <BottomSpacer />
        </ScrollView>
      </View>
    );
  };

  const renderMediBookReport = () => {
    if (reportSection === 'pdf-preview') return renderPdfPreview();
    if (reportSection === 'analyses') return renderAnalysesDetail();
    if (reportSection === 'medications') return renderMedicationsDetail();
    if (reportSection === 'allergies') return renderAllergiesDetail();
    if (reportSection === 'vaccinations') return renderVaccinationsDetail();
    if (reportSection === 'diagnostics') return renderDiagnosticsDetail();
    if (reportSection === 'calendar') return renderCalendarSection();
    return renderReportHub();
  };

  // ── RENDER MEDIBOOK (ROUTER) ───────────────────────────────────────────────
  const renderMediBook = () => {
    if (mediBookView === 'carnet') return renderCarnetCapture();
    if (mediBookView === 'stats') return renderMediBookStats();
    if (mediBookView === 'report') return renderMediBookReport();
    return renderMediBookLanding();
  };


  if (uploadState === 'scanning') return renderScanningScreen();
  if (uploadState === 'results') return renderScanResults();
  if (uploadState === 'integrating') {
    return (
      <View style={{ flex: 1, backgroundColor: '#1A1D22', justifyContent: 'center', alignItems: 'center', paddingBottom: wp(70) }}>
        <ActivityIndicator size="large" color="#00D984" />
        <Text style={{ fontSize: fp(16), fontWeight: '600', color: '#FFF', marginTop: wp(16) }}>
          Intégration en cours...
        </Text>
        <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(4) }}>
          Organisation des données
        </Text>
      </View>
    );
  }
  var mbModalEl = React.createElement(LixumModal, { visible: mbModal.visible, type: mbModal.type, title: mbModal.title, message: mbModal.message, onConfirm: mbModal.onConfirm, onClose: mbModal.onClose || closeMbModal, confirmText: mbModal.confirmText, cancelText: mbModal.cancelText });

  if (mediBookView === 'carnet') return React.createElement(View, { style: { flex: 1 } }, renderCarnetCapture(), mbModalEl);
  if (mediBookView === 'stats') return React.createElement(View, { style: { flex: 1 } }, renderMediBookStats(), mbModalEl);
  if (mediBookView === 'report') return React.createElement(View, { style: { flex: 1 } }, renderMediBookReport(), mbModalEl);
  return React.createElement(View, { style: { flex: 1 } }, renderMediBookLanding(), mbModalEl);
};
