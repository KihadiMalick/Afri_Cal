import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, Modal, ActivityIndicator,
} from 'react-native';
import Svg, {
  Rect, Path, Circle, Line,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { wp, fp, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';
import LixumModal from '../../components/shared/LixumModal';

export const AllModals = (props) => {
  const {
    // MediBook Upload Sheet
    showMediBookUploadSheet, setShowMediBookUploadSheet,
    takePhoto, pickImage, pickDocument,
    // Document Sheet
    showDocumentSheet, setShowDocumentSheet,
    setCurrentSubPage,
    // New Session Sheet
    showNewSessionSheet, setShowNewSessionSheet,
    onStartFreshSession,
    showCompactConfirm, setShowCompactConfirm,
    // Recharge Sheet
    showRechargeSheet, setShowRechargeSheet,
    setEnergyUsed,
    // Profile Switcher
    showProfileSwitcher, setShowProfileSwitcher,
    activeProfile, setActiveProfile,
    children, setChildren,
    editingChildId, setEditingChildId,
    newChildIsFree, setNewChildIsFree,
    // Child Name Input
    showChildNameInput, setShowChildNameInput,
    newChildName, setNewChildName,
    // Carnet Page Sheet
    showCarnetPageSheet, setShowCarnetPageSheet,
    selectedCarnetPage,
    carnetPhotos, setCarnetPhotos,
    // Analyze Sheet
    showAnalyzeSheet, setShowAnalyzeSheet,
    startMedicalScan,
    // Add Medication
    showAddMedSheet, setShowAddMedSheet,
    addMedStep, setAddMedStep,
    medSearchQuery,
    medSearchResults, setMedSearchResults,
    selectedMedFromDb, setSelectedMedFromDb,
    searchMedications, selectMedFromDb,
    searchMedicationAI,
    newMedDosageValue, setNewMedDosageValue,
    newMedDosageUnit, setNewMedDosageUnit,
    newMedFrequency, setNewMedFrequency,
    newMedDuration, setNewMedDuration,
    newMedReminder, setNewMedReminder,
    confirmAddMedication,
    // Add Analysis
    showAddAnalysisSheet, setShowAddAnalysisSheet,
    newAnalysisLabel, setNewAnalysisLabel,
    newAnalysisDate, setNewAnalysisDate,
    newAnalysisDoctor, setNewAnalysisDoctor,
    newAnalysisLab, setNewAnalysisLab,
    newAnalysisNotes, setNewAnalysisNotes,
    confirmAddAnalysis,
    // Add Diagnostic
    showAddDiagSheet, setShowAddDiagSheet,
    addDiagStep, setAddDiagStep,
    diagSearchQuery,
    diagSearchResults, setDiagSearchResults,
    selectedDiagFromDb, setSelectedDiagFromDb,
    searchDiseases, selectDiagFromDb,
    newDiagSeverity, setNewDiagSeverity,
    newDiagDate, setNewDiagDate,
    newDiagDoctor, setNewDiagDoctor,
    newDiagStatus, setNewDiagStatus,
    newDiagNotes, setNewDiagNotes,
    confirmAddDiagnostic,
    // Add Allergy
    showAddAllergySheet, setShowAddAllergySheet,
    newAllergyAllergen, setNewAllergyAllergen,
    newAllergyType, setNewAllergyType,
    newAllergySeverity, setNewAllergySeverity,
    newAllergyReaction, setNewAllergyReaction,
    confirmAddAllergy,
    // Add Vaccination
    showAddVaccSheet, setShowAddVaccSheet,
    newVaccName, setNewVaccName,
    newVaccDate, setNewVaccDate,
    newVaccDose, setNewVaccDose,
    newVaccNextDue, setNewVaccNextDue,
    newVaccDoctor, setNewVaccDoctor,
    newVaccBatch, setNewVaccBatch,
    confirmAddVaccination,
  } = props;

  var _modalsModal = useState({ visible: false, type: 'info', title: '', message: '', onConfirm: null });
  var modalsModal = _modalsModal[0]; var setModalsModal = _modalsModal[1];
  var closeModalsModal = function() { setModalsModal(function(p) { return Object.assign({}, p, { visible: false }); }); };

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}>
      {/* Bottom Sheet — Ajouter à MediBook (bouton FAB +) */}
      <Modal
        visible={showMediBookUploadSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMediBookUploadSheet(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowMediBookUploadSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(20) }}/>

              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                Ajouter à MediBook
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>
                ALIXEN analysera et classera automatiquement
              </Text>

              {/* Option 1 : Prendre une photo */}
              <Pressable delayPressIn={120}
                onPress={() => { setShowMediBookUploadSheet(false); setTimeout(() => takePhoto('medibook'), 300); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}>
                <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(255,140,66,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Circle cx="12" cy="13" r="4" stroke="#FF8C42" strokeWidth="1.5"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Prendre une photo</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Document, ordonnance, plat, médicament...</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 2 : Depuis la galerie */}
              <Pressable delayPressIn={120}
                onPress={() => { setShowMediBookUploadSheet(false); setTimeout(() => pickImage('medibook'), 300); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}>
                <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(0,217,132,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#00D984" strokeWidth="1.5"/>
                    <Circle cx="8.5" cy="8.5" r="1.5" stroke="#00D984" strokeWidth="1.5"/>
                    <Path d="M21 15l-5-5L5 21" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Depuis la galerie</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Choisir une image existante</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 3 : Importer un document */}
              <Pressable delayPressIn={120}
                onPress={() => { setShowMediBookUploadSheet(false); setTimeout(() => pickDocument('medibook'), 300); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(16),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}>
                <View style={{ width: wp(44), height: wp(44), borderRadius: wp(12), backgroundColor: 'rgba(77,166,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12) }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M14 2v6h6" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Importer un document</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>PDF ou fichier</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              <Pressable onPress={() => setShowMediBookUploadSheet(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Secret Pocket modals removed — scan/upload purged from Secret Pocket */}

      {/* === BOTTOM SHEET — Ajouter un document === */}
      <Modal
        visible={showDocumentSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocumentSheet(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setShowDocumentSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24),
                borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20),
                paddingTop: wp(12),
                paddingBottom: wp(34),
              }}
            >
              {/* Poignée */}
              <View style={{
                width: wp(40), height: wp(4), borderRadius: wp(2),
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignSelf: 'center', marginBottom: wp(20),
              }}/>

              {/* Titre */}
              <Text style={{
                fontSize: fp(20), fontWeight: '700', color: '#FFFFFF', marginBottom: wp(4),
              }}>Envoyer à ALIXEN</Text>
              <Text style={{
                fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(24),
              }}>Choisissez le type de contenu à partager</Text>

              {/* Option 1 : Photo ou image (galerie) */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowDocumentSheet(false);
                  setTimeout(() => {
                    pickImage('chat');
                  }, 300);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(16), paddingHorizontal: wp(14),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(16), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(48), height: wp(48), borderRadius: wp(14),
                  backgroundColor: 'rgba(0,217,132,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
                }}>
                  <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
                    <Path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(3) }}>Photo ou image</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Depuis la galerie ou la caméra</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 2 : Prendre une photo (caméra) */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowDocumentSheet(false);
                  setTimeout(() => {
                    takePhoto('chat');
                  }, 300);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(16), paddingHorizontal: wp(14),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(16), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(48), height: wp(48), borderRadius: wp(14),
                  backgroundColor: 'rgba(77,166,255,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
                }}>
                  <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
                    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Circle cx="12" cy="13" r="4" stroke="#4DA6FF" strokeWidth="1.5"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(3) }}>Prendre une photo</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Utiliser la caméra</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 3 : Document PDF */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowDocumentSheet(false);
                  setTimeout(() => {
                    pickDocument('chat');
                  }, 300);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(16), paddingHorizontal: wp(14),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(16), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(48), height: wp(48), borderRadius: wp(14),
                  backgroundColor: 'rgba(255,107,107,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
                }}>
                  <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
                    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(3) }}>Document PDF</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Importer un document</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 4 : Partager ma localisation */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowDocumentSheet(false);
                  setTimeout(() => {
                    setModalsModal({ visible: true, type: 'confirm', title: 'Partager ma localisation', message: 'ALIXEN utilisera ta position une seule fois pour te recommander des supermarchés, restaurants et salles de sport à proximité.\n\nTa localisation sera automatiquement effacée après utilisation.', confirmText: 'Partager', cancelText: 'Non merci', onConfirm: closeModalsModal, onClose: closeModalsModal });
                  }, 300);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(16), paddingHorizontal: wp(14),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(16), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(48), height: wp(48), borderRadius: wp(14),
                  backgroundColor: 'rgba(77,166,255,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
                }}>
                  <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
                    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Circle cx="12" cy="10" r="3" stroke="#4DA6FF" strokeWidth="1.5"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(3) }}>Partager ma localisation</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Usage unique — effacée après utilisation</Text>
                </View>
                <View style={{
                  backgroundColor: 'rgba(77,166,255,0.15)', borderRadius: wp(6),
                  paddingHorizontal: wp(6), paddingVertical: wp(2),
                }}>
                  <Text style={{ fontSize: fp(8), fontWeight: '700', color: '#4DA6FF' }}>1x</Text>
                </View>
              </Pressable>

              {/* Option 5 : Importer conversation compactée */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowDocumentSheet(false);
                  setTimeout(() => {
                    setModalsModal({ visible: true, type: 'confirm', title: 'Importer une conversation', message: 'Sélectionnez une conversation compactée depuis votre Secret Pocket pour la réimporter dans cette session.', confirmText: 'Ouvrir Secret Pocket', onConfirm: function() { closeModalsModal(); setCurrentSubPage('secretpocket'); }, onClose: closeModalsModal });
                  }, 300);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(16), paddingHorizontal: wp(14),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(16), marginBottom: wp(20),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(48), height: wp(48), borderRadius: wp(14),
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(14),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="6" width="18" height="14" rx="2" stroke="#D4AF37" strokeWidth="1.5"/>
                    <Path d="M3 10h18" stroke="#D4AF37" strokeWidth="1.5"/>
                    <Line x1="12" y1="3" x2="12" y2="6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Circle cx="12" cy="15" r="1.5" stroke="#D4AF37" strokeWidth="1.5"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF', marginBottom: wp(3) }}>Importer une conversation</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Depuis votre Secret Pocket</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Bouton Annuler */}
              <Pressable
                onPress={() => setShowDocumentSheet(false)}
                style={{
                  paddingVertical: wp(14), alignItems: 'center',
                  borderRadius: wp(16), borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* === BOTTOM SHEET — Nouvelle session === */}
      <Modal
        visible={showNewSessionSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewSessionSheet(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            justifyContent: 'flex-end',
          }}
          onPress={() => setShowNewSessionSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24),
                borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20),
                paddingTop: wp(12),
                paddingBottom: wp(34),
              }}
            >
              {/* Poignee */}
              <View style={{
                width: wp(40), height: wp(4), borderRadius: wp(2),
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignSelf: 'center', marginBottom: wp(20),
              }}/>

              {/* Titre */}
              <Text style={{
                fontSize: fp(20), fontWeight: '700', color: '#FFFFFF', marginBottom: wp(4),
              }}>Nouvelle session</Text>
              <Text style={{
                fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(24), lineHeight: fp(18),
              }}>Que souhaitez-vous faire de cette conversation ?</Text>

              {/* Option 1 : Compacter et ranger */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowNewSessionSheet(false);
                  setTimeout(() => setShowCompactConfirm(true), 300);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="6" width="18" height="14" rx="2" stroke="#D4AF37" strokeWidth="1.5"/>
                    <Path d="M3 10h18" stroke="#D4AF37" strokeWidth="1.5"/>
                    <Line x1="12" y1="3" x2="12" y2="6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="12" y1="10" x2="12" y2="20" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="3" y1="15" x2="21" y2="15" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                    <Circle cx="12" cy="15" r="1.5" stroke="#D4AF37" strokeWidth="1.5"/>
                    <Path d="M8 2l0 2.5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                    <Path d="M16 2l0 2.5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                    <Path d="M6.5 3L8 4.5 9.5 3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M14.5 3L16 4.5 17.5 3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Compacter et ranger</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Sauvegarder dans votre Secret Pocket</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 2 : Demarrer a zero */}
              <Pressable
                delayPressIn={120}
                onPress={function() { setShowNewSessionSheet(false); if (onStartFreshSession) onStartFreshSession(); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(0,217,132,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="9" stroke="#00D984" strokeWidth="1.5" fill="none"/>
                    <Line x1="12" y1="8" x2="12" y2="16" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                    <Line x1="8" y1="12" x2="16" y2="12" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Nouvelle session vierge</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Sans sauvegarder la conversation</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Option 3 : Supprimer */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setShowNewSessionSheet(false); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,107,107,0.05)',
                  borderRadius: wp(14), marginBottom: wp(16),
                  borderWidth: 1, borderColor: 'rgba(255,107,107,0.1)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(255,107,107,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FF6B6B', marginBottom: wp(2) }}>Supprimer la session</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,107,107,0.4)' }}>Cette action est irréversible</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,107,107,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Bouton Annuler */}
              <Pressable
                onPress={() => setShowNewSessionSheet(false)}
                style={{
                  paddingVertical: wp(14), alignItems: 'center',
                  borderRadius: wp(14), borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ===== MODAL — Confirmation Compacter et ranger ===== */}
      <Modal
        visible={showCompactConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCompactConfirm(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24),
        }}>
          <LinearGradient
            colors={['#2A2F36', '#1E2328', '#252A30']}
            style={{
              borderRadius: wp(20), paddingHorizontal: wp(24), paddingVertical: wp(28),
              width: '100%', alignItems: 'center',
            }}
          >
            {/* Icone boite compactée gold */}
            <View style={{
              width: wp(60), height: wp(60), borderRadius: wp(30),
              backgroundColor: 'rgba(212,175,55,0.12)',
              justifyContent: 'center', alignItems: 'center', marginBottom: wp(16),
              borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
            }}>
              <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="6" width="18" height="14" rx="2" stroke="#D4AF37" strokeWidth="1.5"/>
                <Path d="M3 10h18" stroke="#D4AF37" strokeWidth="1.5"/>
                <Line x1="12" y1="3" x2="12" y2="6" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                <Line x1="12" y1="10" x2="12" y2="20" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                <Line x1="3" y1="15" x2="21" y2="15" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                <Circle cx="12" cy="15" r="1.5" stroke="#D4AF37" strokeWidth="1.5"/>
                <Path d="M8 2l0 2.5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                <Path d="M16 2l0 2.5" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                <Path d="M6.5 3L8 4.5 9.5 3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M14.5 3L16 4.5 17.5 3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            </View>

            <Text style={{
              fontSize: fp(18), fontWeight: '700', color: '#FFFFFF',
              textAlign: 'center', marginBottom: wp(8),
            }}>Compacter cette discussion ?</Text>

            <Text style={{
              fontSize: fp(13), color: 'rgba(255,255,255,0.5)',
              textAlign: 'center', lineHeight: fp(19), marginBottom: wp(8),
            }}>
              Votre conversation sera compactée et rangée dans votre Secret Pocket.
            </Text>

            {/* Info securite */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(212,175,55,0.08)',
              borderRadius: wp(10), padding: wp(10),
              marginBottom: wp(24), width: '100%',
            }}>
              <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8) }}>
                <Path d="M3.5 11c0-4.69 3.81-8.5 8.5-8.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M20.5 11c0-4.69-3.81-8.5-8.5-8.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M5.5 11c0-3.59 2.91-6.5 6.5-6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M18.5 11c0-3.59-2.91-6.5-6.5-6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M9.5 11a2.5 2.5 0 015 0" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M3.5 11v1.5c0 2.5 1 4.8 2.6 6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M20.5 11v1.5c0 2.5-1 4.8-2.6 6.5" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
                <Path d="M12 11v8" stroke="#D4AF37" strokeWidth="1.3" strokeLinecap="round"/>
              </Svg>
              <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.7)', flex: 1 }}>
                Vous aurez besoin de votre empreinte digitale pour la retrouver dans Secret Pocket.
              </Text>
            </View>

            {/* Bouton Confirmer */}
            <Pressable
              delayPressIn={120}
              onPress={() => {
                setShowCompactConfirm(false);
              }}
              style={{ width: '100%', marginBottom: wp(10) }}
            >
              <LinearGradient
                colors={['#D4AF37', '#B8941F']}
                style={{
                  width: '100%', paddingVertical: wp(14),
                  borderRadius: wp(14), alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>
                  Confirmer et ranger
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Bouton Annuler */}
            <Pressable
              onPress={() => setShowCompactConfirm(false)}
              style={{ width: '100%', paddingVertical: wp(12), alignItems: 'center' }}
            >
              <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* ===== MODAL — Recharge énergie ===== */}
      <Modal
        visible={showRechargeSheet}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRechargeSheet(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center', alignItems: 'center', paddingHorizontal: wp(24),
        }}>
          <LinearGradient
            colors={['#2A2F36', '#1E2328', '#252A30']}
            style={{
              borderRadius: wp(20), paddingHorizontal: wp(24), paddingVertical: wp(28),
              width: '100%', alignItems: 'center',
            }}
          >
            {/* Icône éclair barré */}
            <View style={{
              width: wp(60), height: wp(60), borderRadius: wp(30),
              backgroundColor: 'rgba(255,107,107,0.12)',
              justifyContent: 'center', alignItems: 'center',
              marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(255,107,107,0.2)',
            }}>
              <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#FF6B6B" strokeWidth="1.5" strokeLinejoin="round"/>
                <Line x1="4" y1="4" x2="20" y2="20" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round"/>
              </Svg>
            </View>

            <Text style={{
              fontSize: fp(18), fontWeight: '700', color: '#FFFFFF',
              textAlign: 'center', marginBottom: wp(8),
            }}>Énergie épuisée</Text>

            <Text style={{
              fontSize: fp(13), color: 'rgba(255,255,255,0.5)',
              textAlign: 'center', lineHeight: fp(19), marginBottom: wp(20),
            }}>
              Vous avez utilisé toute votre énergie pour cette session. Rechargez pour continuer à discuter avec ALIXEN.
            </Text>

            {/* Option : Recharger avec Lix */}
            <Pressable delayPressIn={120}
              onPress={() => {
                setEnergyUsed(prev => Math.max(0, prev - 30));
                setShowRechargeSheet(false);
              }}
              style={{ width: '100%', marginBottom: wp(10) }}>
              <LinearGradient colors={['#00D984', '#00B871']}
                style={{
                  width: '100%', paddingVertical: wp(14),
                  borderRadius: wp(14), alignItems: 'center',
                }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>
                  Recharger +30 énergie — 300 Lix
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Option : Mega recharge */}
            <Pressable delayPressIn={120}
              onPress={() => {
                setEnergyUsed(prev => Math.max(0, prev - 80));
                setShowRechargeSheet(false);
              }}
              style={{ width: '100%', marginBottom: wp(10) }}>
              <View style={{
                width: '100%', paddingVertical: wp(14),
                borderRadius: wp(14), alignItems: 'center',
                backgroundColor: 'rgba(0,217,132,0.1)',
                borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
              }}>
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#00D984' }}>
                  Recharger +80 énergie — 700 Lix
                </Text>
                <Text style={{ fontSize: fp(11), color: 'rgba(0,217,132,0.5)', marginTop: wp(2) }}>
                  Meilleur rapport qualité-prix
                </Text>
              </View>
            </Pressable>

            {/* Info délai */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: wp(10), padding: wp(12),
              marginBottom: wp(16), width: '100%',
            }}>
              <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8) }}>
                <Circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <Line x1="12" y1="7" x2="12" y2="12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                <Line x1="12" y1="12" x2="15" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
              </Svg>
              <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', flex: 1 }}>
                Ou attendez la recharge automatique toutes les 6 heures
              </Text>
            </View>

            {/* Bouton Fermer */}
            <Pressable onPress={() => setShowRechargeSheet(false)}
              style={{
                width: '100%', paddingVertical: wp(12), alignItems: 'center',
                borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              }}>
              <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Fermer</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* ===== MODAL — Profil Switcher MediBook ===== */}
      <Modal
        visible={showProfileSwitcher}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProfileSwitcher(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowProfileSwitcher(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(20) }}/>

              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                Changer de profil
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>
                Sélectionnez le carnet à consulter
              </Text>

              {/* Mon carnet */}
              <Pressable
                delayPressIn={120}
                onPress={() => { setActiveProfile('self'); setShowProfileSwitcher(false); }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: activeProfile === 'self' ? 'rgba(0,217,132,0.1)' : 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1,
                  borderColor: activeProfile === 'self' ? 'rgba(0,217,132,0.3)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(22),
                  backgroundColor: 'rgba(0,217,132,0.15)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="8" r="4" stroke="#00D984" strokeWidth="1.5"/>
                    <Path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF' }}>Mon carnet</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>LXM-2K7F4A</Text>
                </View>
                {activeProfile === 'self' && (
                  <View style={{ width: wp(22), height: wp(22), borderRadius: wp(11), backgroundColor: '#00D984', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: fp(12), fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </Pressable>

              {/* Enfants */}
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  delayPressIn={120}
                  onPress={() => {
                    if (child.name === 'Mon enfant' || child.name.startsWith('Enfant ')) {
                      setShowProfileSwitcher(false);
                      setNewChildIsFree(child.free);
                      setNewChildName('');
                      setEditingChildId(child.id);
                      setTimeout(() => setShowChildNameInput(true), 400);
                    } else {
                      setActiveProfile(child.id);
                      setShowProfileSwitcher(false);
                    }
                  }}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: wp(14), paddingHorizontal: wp(12),
                    backgroundColor: activeProfile === child.id ? 'rgba(77,166,255,0.1)' : 'rgba(255,255,255,0.05)',
                    borderRadius: wp(14), marginBottom: wp(10),
                    borderWidth: 1,
                    borderColor: activeProfile === child.id ? 'rgba(77,166,255,0.3)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <View style={{
                    width: wp(44), height: wp(44), borderRadius: wp(22),
                    backgroundColor: 'rgba(77,166,255,0.15)',
                    justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                  }}>
                    <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="8" r="3" stroke="#4DA6FF" strokeWidth="1.5"/>
                      <Path d="M8 21v-1a4 4 0 018 0v1" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round"/>
                    </Svg>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF' }}>{child.name}</Text>
                    <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>
                      {child.free ? 'Gratuit' : '5 000 Lix'}
                    </Text>
                  </View>
                  {activeProfile === child.id && (
                    <View style={{ width: wp(22), height: wp(22), borderRadius: wp(11), backgroundColor: '#4DA6FF', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#FFF', fontSize: fp(12), fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}

              {/* Ajouter un enfant */}
              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowProfileSwitcher(false);
                  const isFree = children.length === 0;
                  setNewChildIsFree(isFree);
                  setNewChildName('');
                  setEditingChildId(null);
                  setTimeout(() => setShowChildNameInput(true), 400);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  borderRadius: wp(14), marginBottom: wp(12),
                  borderWidth: 1.5, borderColor: 'rgba(212,175,55,0.2)', borderStyle: 'dashed',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(22),
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Text style={{ color: '#D4AF37', fontSize: fp(20), fontWeight: '300' }}>+</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#D4AF37' }}>Ajouter un enfant</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(212,175,55,0.5)' }}>
                    {children.length === 0 ? '1er enfant gratuit' : '5 000 Lix par enfant'}
                  </Text>
                </View>
              </Pressable>

              <Pressable onPress={() => setShowProfileSwitcher(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Fermer</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Sheet — Carnet Page (Photo / Galerie) */}
      <Modal
        visible={showCarnetPageSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCarnetPageSheet(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowCarnetPageSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(20) }}/>

              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                Page {selectedCarnetPage !== null ? selectedCarnetPage + 1 : ''}
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>
                Comment souhaitez-vous ajouter cette page ?
              </Text>

              {/* Prendre une photo */}
              <Pressable
                delayPressIn={120}
                onPress={async () => {
                  setShowCarnetPageSheet(false);
                  const permission = await ImagePicker.requestCameraPermissionsAsync();
                  if (!permission.granted) return;
                  const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                    base64: true,
                  });
                  if (!result.canceled) {
                    const photo = result.assets[0];
                    setCarnetPhotos(prev => {
                      const updated = [...prev];
                      updated[selectedCarnetPage] = { uri: photo.uri, base64: photo.base64, index: selectedCarnetPage };
                      return updated;
                    });
                  }
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(10),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(255,140,66,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Circle cx="12" cy="13" r="4" stroke="#FF8C42" strokeWidth="1.5"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Prendre une photo</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Photographier la page du carnet</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              {/* Depuis la galerie */}
              <Pressable
                delayPressIn={120}
                onPress={async () => {
                  setShowCarnetPageSheet(false);
                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 0.8,
                    base64: true,
                  });
                  if (!result.canceled) {
                    const photo = result.assets[0];
                    setCarnetPhotos(prev => {
                      const updated = [...prev];
                      updated[selectedCarnetPage] = { uri: photo.uri, base64: photo.base64, index: selectedCarnetPage };
                      return updated;
                    });
                  }
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: wp(14), paddingHorizontal: wp(12),
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: wp(14), marginBottom: wp(16),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{
                  width: wp(44), height: wp(44), borderRadius: wp(12),
                  backgroundColor: 'rgba(0,217,132,0.1)',
                  justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                }}>
                  <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                    <Rect x="3" y="3" width="18" height="18" rx="2" stroke="#00D984" strokeWidth="1.5"/>
                    <Circle cx="8.5" cy="8.5" r="1.5" stroke="#00D984" strokeWidth="1.5"/>
                    <Path d="M21 15l-5-5L5 21" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: '#FFF', marginBottom: wp(2) }}>Depuis la galerie</Text>
                  <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>Choisir une photo existante</Text>
                </View>
                <Text style={{ fontSize: fp(18), color: 'rgba(255,255,255,0.25)' }}>{">"}</Text>
              </Pressable>

              <Pressable
                onPress={() => setShowCarnetPageSheet(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bottom Sheet — Analyser pages carnet */}
      <Modal
        visible={showAnalyzeSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAnalyzeSheet(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowAnalyzeSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
                alignItems: 'center',
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(24) }}/>

              <View style={{
                width: wp(60), height: wp(60), borderRadius: wp(30),
                backgroundColor: 'rgba(0,217,132,0.12)',
                justifyContent: 'center', alignItems: 'center',
                marginBottom: wp(16), borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
              }}>
                <Svg width={wp(28)} height={wp(28)} viewBox="0 0 24 24" fill="none">
                  <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <Path d="M14 2v6h6" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </Svg>
              </View>

              <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF', marginBottom: wp(8) }}>
                Analyser {carnetPhotos.filter(p => p).length} page{carnetPhotos.filter(p => p).length > 1 ? 's' : ''}
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: fp(19), marginBottom: wp(24), paddingHorizontal: wp(10) }}>
                ALIXEN va analyser vos pages et extraire toutes les informations médicales : vaccins, médicaments, diagnostics, examens...
              </Text>

              <Pressable
                delayPressIn={120}
                onPress={() => {
                  setShowAnalyzeSheet(false);
                  const photos = carnetPhotos.filter(p => p);
                  if (photos.length > 0) {
                    startMedicalScan(photos[0].base64, 'Carnet de santé (' + photos.length + ' pages)', 'carnet');
                  }
                }}
                style={{ width: '100%' }}
              >
                <LinearGradient
                  colors={['#00D984', '#00B871']}
                  style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', width: '100%' }}
                >
                  <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Lancer l'analyse</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => setShowAnalyzeSheet(false)}
                style={{ paddingVertical: wp(14), alignItems: 'center', width: '100%', marginTop: wp(8) }}
              >
                <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text>
              </Pressable>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal — Saisie nom enfant */}
      <Modal
        visible={showChildNameInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChildNameInput(false)}
      >
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: wp(24),
        }}>
          <LinearGradient
            colors={['#2A2F36', '#1E2328', '#252A30']}
            style={{
              borderRadius: wp(20), paddingHorizontal: wp(24),
              paddingVertical: wp(28), width: '100%',
            }}
          >
            <View style={{
              width: wp(50), height: wp(50), borderRadius: wp(25),
              backgroundColor: 'rgba(77,166,255,0.12)',
              justifyContent: 'center', alignItems: 'center',
              alignSelf: 'center', marginBottom: wp(16),
            }}>
              <Svg width={wp(24)} height={wp(24)} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="8" r="3" stroke="#4DA6FF" strokeWidth="1.5"/>
                <Path d="M8 21v-1a4 4 0 018 0v1" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round"/>
              </Svg>
            </View>

            <Text style={{
              fontSize: fp(18), fontWeight: '700', color: '#FFF',
              textAlign: 'center', marginBottom: wp(6),
            }}>{editingChildId ? 'Nommer cet enfant' : 'Ajouter un enfant'}</Text>

            <Text style={{
              fontSize: fp(12), color: 'rgba(255,255,255,0.4)',
              textAlign: 'center', marginBottom: wp(20),
            }}>
              {editingChildId
                ? 'Entrez le prénom de votre enfant'
                : newChildIsFree
                  ? 'Premier enfant gratuit'
                  : 'Coût : 5 000 Lix'
              }
            </Text>

            <View style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: wp(12), paddingHorizontal: wp(14),
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              marginBottom: wp(24),
            }}>
              <TextInput
                style={{
                  fontSize: fp(15), color: '#FFF',
                  paddingVertical: wp(12),
                }}
                placeholder="Prénom de l'enfant"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={newChildName}
                onChangeText={setNewChildName}
                autoFocus={true}
                maxLength={30}
              />
            </View>

            <Pressable
              delayPressIn={120}
              onPress={() => {
                if (newChildName.trim().length === 0) {
                  setModalsModal({ visible: true, type: 'info', title: 'Nom requis', message: 'Veuillez entrer le prénom de l\'enfant.', onClose: closeModalsModal });
                  return;
                }
                if (editingChildId) {
                  setChildren(prev => prev.map(c =>
                    c.id === editingChildId ? { ...c, name: newChildName.trim() } : c
                  ));
                  setActiveProfile(editingChildId);
                  setEditingChildId(null);
                } else {
                  const newChild = {
                    id: 'child-' + children.length,
                    name: newChildName.trim(),
                    age: '',
                    free: newChildIsFree,
                  };
                  setChildren(prev => [...prev, newChild]);
                  setActiveProfile(newChild.id);
                }
                setShowChildNameInput(false);
                setNewChildName('');
              }}
            >
              <LinearGradient
                colors={['#4DA6FF', '#3A8FE8']}
                style={{
                  paddingVertical: wp(14), borderRadius: wp(14),
                  alignItems: 'center', width: '100%',
                }}
              >
                <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#FFF' }}>
                  {editingChildId
                    ? 'Confirmer'
                    : newChildIsFree
                      ? 'Ajouter gratuitement'
                      : 'Ajouter (5 000 Lix)'
                  }
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={() => { setShowChildNameInput(false); setNewChildName(''); setEditingChildId(null); }}
              style={{ paddingVertical: wp(12), alignItems: 'center', marginTop: wp(8) }}
            >
              <Text style={{ fontSize: fp(14), color: 'rgba(255,255,255,0.35)' }}>Annuler</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>

      {/* ===== MODAL — Ajout Médicament ===== */}
      <Modal
        visible={showAddMedSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => { setShowAddMedSheet(false); setAddMedStep('search'); setMedSearchQuery(''); setMedSearchResults([]); setSelectedMedFromDb(null); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => { setShowAddMedSheet(false); setAddMedStep('search'); }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
                maxHeight: SCREEN_HEIGHT * 0.85,
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }}/>

              {addMedStep === 'search' ? (
                <>
                  <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                    Ajouter un médicament
                  </Text>
                  <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(16) }}>
                    Recherchez dans notre base de 150+ médicaments
                  </Text>

                  {/* Barre de recherche */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(14),
                    paddingHorizontal: wp(14), marginBottom: wp(12),
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  }}>
                    <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8) }}>
                      <Circle cx="11" cy="11" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                      <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                    </Svg>
                    <TextInput
                      style={{ flex: 1, fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }}
                      placeholder="Nom du médicament..."
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={medSearchQuery}
                      onChangeText={searchMedications}
                      autoFocus={true}
                    />
                    {medSearchQuery.length > 0 && (
                      <Pressable onPress={() => { setMedSearchQuery(''); setMedSearchResults([]); }}>
                        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: fp(16) }}>✕</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Résultats */}
                  <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.4 }}>
                    {medSearchResults.map((med, i) => (
                        med._loading ? (
                          <View key="loading" style={{
                            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                            paddingVertical: wp(20), gap: wp(10),
                          }}>
                            <ActivityIndicator size="small" color="#D4AF37" />
                            <Text style={{ fontSize: fp(13), color: '#D4AF37' }}>ALIXEN recherche...</Text>
                          </View>
                        ) : (
                      <Pressable key={med.id || i} delayPressIn={120}
                        onPress={() => selectMedFromDb(med)}
                        style={({ pressed }) => ({
                          flexDirection: 'row', alignItems: 'center',
                          paddingVertical: wp(12), paddingHorizontal: wp(12),
                          backgroundColor: pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                          borderRadius: wp(12), marginBottom: wp(6),
                          borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                        })}>
                        <View style={{
                          width: wp(38), height: wp(38), borderRadius: wp(12),
                          backgroundColor: 'rgba(77,166,255,0.1)',
                          justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                        }}>
                          <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                            <Path d="M10.5 1.5l-8 8a4.24 4.24 0 006 6l8-8a4.24 4.24 0 00-6-6z" stroke="#4DA6FF" strokeWidth="1.5"/>
                          </Svg>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{med.name}</Text>
                          <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.4)' }}>
                            {med.category || ''}{med.form ? ' — ' + med.form : ''}
                          </Text>
                          {med.brand_names && med.brand_names.length > 0 && (
                            <Text style={{ fontSize: fp(10), color: 'rgba(255,255,255,0.25)', marginTop: wp(1) }}>
                              {med.brand_names.slice(0, 3).join(', ')}
                            </Text>
                          )}
                        </View>
                        <Text style={{ fontSize: fp(16), color: 'rgba(255,255,255,0.2)' }}>{">"}</Text>
                      </Pressable>
                        )
                    ))}

                    {medSearchQuery.length >= 2 && medSearchResults.length === 0 && (
                      <View style={{ padding: wp(20), alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: wp(12) }}>
                          Aucun médicament trouvé pour "{medSearchQuery}"
                        </Text>
                        <Pressable delayPressIn={120}
                          onPress={() => searchMedicationAI(medSearchQuery)}
                          style={{
                            flexDirection: 'row', alignItems: 'center',
                            backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(12),
                            paddingHorizontal: wp(16), paddingVertical: wp(10),
                            borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
                          }}>
                          <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8) }}>
                            <Circle cx="12" cy="12" r="9" stroke="#D4AF37" strokeWidth="1.5"/>
                            <Path d="M12 8v4l3 3" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round"/>
                          </Svg>
                          <Text style={{ fontSize: fp(12), fontWeight: '600', color: '#D4AF37' }}>
                            Recherche IA approfondie — 50 Lix
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </ScrollView>

                  <Pressable onPress={() => { setShowAddMedSheet(false); setAddMedStep('search'); setMedSearchQuery(''); setMedSearchResults([]); }}
                    style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: wp(8) }}>
                    <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
                  </Pressable>
                </>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* ÉTAPE DOSAGE */}
                  <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                    {selectedMedFromDb ? selectedMedFromDb.name : 'Médicament'}
                  </Text>
                  <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginBottom: wp(20) }}>
                    {selectedMedFromDb ? (selectedMedFromDb.category || '') + (selectedMedFromDb.form ? ' — ' + selectedMedFromDb.form : '') : ''}
                  </Text>

                  {/* Warning si disponible */}
                  {selectedMedFromDb && selectedMedFromDb.warnings && (
                    <View style={{
                      backgroundColor: 'rgba(255,140,66,0.08)', borderRadius: wp(12),
                      padding: wp(12), marginBottom: wp(16),
                      borderWidth: 1, borderColor: 'rgba(255,140,66,0.15)',
                    }}>
                      <Text style={{ fontSize: fp(11), color: '#FF8C42', lineHeight: fp(16) }}>
                        {'⚠ '}{selectedMedFromDb.warnings}
                      </Text>
                    </View>
                  )}

                  {/* Dosage */}
                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(8) }}>Dosage</Text>
                  <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(16) }}>
                    <View style={{
                      flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                      paddingHorizontal: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                    }}>
                      <TextInput
                        style={{ fontSize: fp(16), color: '#FFF', paddingVertical: wp(12), textAlign: 'center' }}
                        value={newMedDosageValue}
                        onChangeText={setNewMedDosageValue}
                        keyboardType="numeric"
                        placeholder="500"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', gap: wp(6), alignItems: 'center' }}>
                        {['mg', 'mL', 'UI', 'g', 'µg'].map(unit => (
                          <Pressable key={unit} onPress={() => setNewMedDosageUnit(unit)}
                            style={{
                              paddingHorizontal: wp(14), paddingVertical: wp(10), borderRadius: wp(10),
                              backgroundColor: newMedDosageUnit === unit ? '#4DA6FF' : 'rgba(255,255,255,0.06)',
                              borderWidth: 1, borderColor: newMedDosageUnit === unit ? '#4DA6FF' : 'rgba(255,255,255,0.1)',
                            }}>
                            <Text style={{ fontSize: fp(13), fontWeight: '600', color: newMedDosageUnit === unit ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{unit}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Dosages suggérés */}
                  {selectedMedFromDb && selectedMedFromDb.common_dosages && selectedMedFromDb.common_dosages.length > 0 && (
                    <View style={{ marginBottom: wp(16) }}>
                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.3)', marginBottom: wp(6) }}>Dosages courants :</Text>
                      <View style={{ flexDirection: 'row', gap: wp(6), flexWrap: 'wrap' }}>
                        {selectedMedFromDb.common_dosages.map((d, i) => (
                          <Pressable key={i} onPress={() => {
                            const num = d.replace(/[^0-9.]/g, '');
                            const unit = d.replace(/[0-9.]/g, '').trim() || 'mg';
                            if (num) setNewMedDosageValue(num);
                            if (unit) setNewMedDosageUnit(unit);
                          }}
                            style={{
                              paddingHorizontal: wp(12), paddingVertical: wp(6), borderRadius: wp(8),
                              backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                            }}>
                            <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.5)' }}>{d}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Fréquence */}
                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(8) }}>Fréquence</Text>
                  <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(16) }}>
                    {[1, 2, 3, 4].map(freq => (
                      <Pressable key={freq} onPress={() => setNewMedFrequency(freq)}
                        style={{
                          flex: 1, paddingVertical: wp(12), borderRadius: wp(12), alignItems: 'center',
                          backgroundColor: newMedFrequency === freq ? '#4DA6FF' : 'rgba(255,255,255,0.06)',
                          borderWidth: 1, borderColor: newMedFrequency === freq ? '#4DA6FF' : 'rgba(255,255,255,0.1)',
                        }}>
                        <Text style={{ fontSize: fp(14), fontWeight: '700', color: newMedFrequency === freq ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{freq}x</Text>
                        <Text style={{ fontSize: fp(9), color: newMedFrequency === freq ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>/jour</Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Durée */}
                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(8) }}>Durée du traitement</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(16) }}>
                    <View style={{ flexDirection: 'row', gap: wp(6) }}>
                      {['3 jours', '5 jours', '7 jours', '10 jours', '14 jours', '21 jours', '1 mois', '2 mois', '3 mois', 'continu'].map(dur => (
                        <Pressable key={dur} onPress={() => setNewMedDuration(dur)}
                          style={{
                            paddingHorizontal: wp(14), paddingVertical: wp(10), borderRadius: wp(10),
                            backgroundColor: newMedDuration === dur ? '#4DA6FF' : 'rgba(255,255,255,0.06)',
                            borderWidth: 1, borderColor: newMedDuration === dur ? '#4DA6FF' : 'rgba(255,255,255,0.1)',
                          }}>
                          <Text style={{ fontSize: fp(12), fontWeight: '600', color: newMedDuration === dur ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{dur}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Rappel toggle */}
                  <Pressable delayPressIn={120} onPress={() => setNewMedReminder(!newMedReminder)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: wp(14),
                      padding: wp(14), marginBottom: wp(20),
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(10) }}>
                      <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                        <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={newMedReminder ? '#00D984' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={newMedReminder ? '#00D984' : 'rgba(255,255,255,0.3)'} strokeWidth="1.5" strokeLinecap="round"/>
                      </Svg>
                      <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>Rappels de prise</Text>
                    </View>
                    <View style={{
                      width: wp(44), height: wp(24), borderRadius: wp(12),
                      backgroundColor: newMedReminder ? '#00D984' : 'rgba(255,255,255,0.15)',
                      justifyContent: 'center',
                      paddingHorizontal: wp(2),
                    }}>
                      <View style={{
                        width: wp(20), height: wp(20), borderRadius: wp(10),
                        backgroundColor: '#FFF',
                        alignSelf: newMedReminder ? 'flex-end' : 'flex-start',
                      }} />
                    </View>
                  </Pressable>

                  {/* Boutons */}
                  <Pressable delayPressIn={120} onPress={confirmAddMedication}>
                    <LinearGradient colors={['#4DA6FF', '#3A8FE8']}
                      style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(10) }}>
                      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>
                        Ajouter {selectedMedFromDb ? selectedMedFromDb.name : ''} {newMedDosageValue} {newMedDosageUnit}
                      </Text>
                      <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.6)', marginTop: wp(2) }}>
                        {newMedFrequency}x/jour — {newMedDuration}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable onPress={() => { setAddMedStep('search'); setSelectedMedFromDb(null); }}
                    style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Retour à la recherche</Text>
                  </Pressable>
                </ScrollView>
              )}
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ===== MODAL — Planifier une analyse ===== */}
      <Modal
        visible={showAddAnalysisSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddAnalysisSheet(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={() => setShowAddAnalysisSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }}/>

              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                Planifier une analyse
              </Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>
                Ajoutez une analyse à venir pour recevoir un rappel
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Type d'analyse */}
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Type d'analyse *</Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                  paddingHorizontal: wp(14), marginBottom: wp(14),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                }}>
                  <TextInput
                    style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }}
                    placeholder="Ex : Bilan sanguin complet, NFS, Glycémie..."
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={newAnalysisLabel}
                    onChangeText={setNewAnalysisLabel}
                  />
                </View>

                {/* Suggestions rapides */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: wp(14) }}>
                  <View style={{ flexDirection: 'row', gap: wp(6) }}>
                    {['Bilan sanguin complet', 'NFS', 'Glycémie', 'Bilan lipidique', 'Bilan hépatique', 'Bilan rénal', 'TSH', 'Vitamine D', 'Fer sérique', 'CRP'].map(s => (
                      <Pressable key={s} onPress={() => setNewAnalysisLabel(s)}
                        style={{
                          paddingHorizontal: wp(12), paddingVertical: wp(6), borderRadius: wp(8),
                          backgroundColor: newAnalysisLabel === s ? '#00D984' : 'rgba(255,255,255,0.06)',
                          borderWidth: 1, borderColor: newAnalysisLabel === s ? '#00D984' : 'rgba(255,255,255,0.08)',
                        }}>
                        <Text style={{ fontSize: fp(11), color: newAnalysisLabel === s ? '#FFF' : 'rgba(255,255,255,0.4)' }}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {/* Date */}
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Date prévue *</Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                  paddingHorizontal: wp(14), marginBottom: wp(14),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                }}>
                  <TextInput
                    style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }}
                    placeholder="JJ/MM/AAAA"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={newAnalysisDate}
                    onChangeText={(text) => {
                      // Auto-format: ajouter les / automatiquement
                      const cleaned = text.replace(/[^0-9]/g, '');
                      let formatted = cleaned;
                      if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                      if (cleaned.length > 4) formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
                      setNewAnalysisDate(formatted);
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                {/* Médecin */}
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Médecin prescripteur</Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                  paddingHorizontal: wp(14), marginBottom: wp(14),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                }}>
                  <TextInput
                    style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }}
                    placeholder="Dr. ..."
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={newAnalysisDoctor}
                    onChangeText={setNewAnalysisDoctor}
                  />
                </View>

                {/* Laboratoire */}
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Laboratoire</Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                  paddingHorizontal: wp(14), marginBottom: wp(14),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                }}>
                  <TextInput
                    style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }}
                    placeholder="Nom du laboratoire"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={newAnalysisLab}
                    onChangeText={setNewAnalysisLab}
                  />
                </View>

                {/* Notes */}
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Notes</Text>
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                  paddingHorizontal: wp(14), marginBottom: wp(20),
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                }}>
                  <TextInput
                    style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12), minHeight: wp(50) }}
                    placeholder="Analyses spécifiques demandées, consignes à jeun..."
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={newAnalysisNotes}
                    onChangeText={setNewAnalysisNotes}
                    multiline
                  />
                </View>

                {/* Bouton confirmer */}
                <Pressable delayPressIn={120} onPress={confirmAddAnalysis}>
                  <LinearGradient colors={['#00D984', '#00B871']}
                    style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(10) }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Planifier cette analyse</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={() => setShowAddAnalysisSheet(false)}
                  style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
                </Pressable>
              </ScrollView>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>
      {/* ===== MODAL — Ajouter une allergie ===== */}
      <Modal
        visible={showAddAllergySheet}
        transparent={true}
        animationType="slide"
        onRequestClose={function() { setShowAddAllergySheet(false); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={function() { setShowAddAllergySheet(false); }}
        >
          <Pressable onPress={function(e) { e.stopPropagation(); }}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34) }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }}/>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>Ajouter une allergie</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>Renseignez votre profil allergique</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Substance allergène *</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} placeholder="Ex : Arachides, Pénicilline, Pollen..." placeholderTextColor="rgba(255,255,255,0.25)" value={newAllergyAllergen} onChangeText={setNewAllergyAllergen} autoFocus={true} />
                </View>

                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(8) }}>Type</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(16) }}>
                  {[
                    { key: 'alimentaire', label: 'Alimentaire', color: '#FF8C42' },
                    { key: 'medicamenteuse', label: 'Médicamenteuse', color: '#FF6B6B' },
                    { key: 'respiratoire', label: 'Respiratoire', color: '#4DA6FF' },
                    { key: 'cutanee', label: 'Cutanée', color: '#9B6DFF' },
                  ].map(function(t) {
                    var isActive = newAllergyType === t.key;
                    return (
                      <Pressable key={t.key} onPress={function() { setNewAllergyType(t.key); }}
                        style={{ paddingVertical: wp(10), paddingHorizontal: wp(14), borderRadius: wp(10), backgroundColor: isActive ? t.color + '20' : 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: isActive ? t.color : 'rgba(255,255,255,0.08)' }}>
                        <Text style={{ fontSize: fp(12), fontWeight: '700', color: isActive ? t.color : 'rgba(255,255,255,0.4)' }}>{t.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(8) }}>Sévérité</Text>
                <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(16) }}>
                  {[
                    { key: 'mild', label: 'Légère', color: '#00D984' },
                    { key: 'moderate', label: 'Modérée', color: '#FF8C42' },
                    { key: 'severe', label: 'Sévère', color: '#FF6B6B' },
                  ].map(function(s) {
                    var isActive = newAllergySeverity === s.key;
                    return (
                      <Pressable key={s.key} onPress={function() { setNewAllergySeverity(s.key); }}
                        style={{ flex: 1, paddingVertical: wp(10), borderRadius: wp(10), alignItems: 'center', backgroundColor: isActive ? s.color + '20' : 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: isActive ? s.color : 'rgba(255,255,255,0.08)' }}>
                        <Text style={{ fontSize: fp(12), fontWeight: '700', color: isActive ? s.color : 'rgba(255,255,255,0.4)' }}>{s.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Réaction (optionnel)</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), marginBottom: wp(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12), minHeight: wp(50) }} placeholder="Décrivez la réaction..." placeholderTextColor="rgba(255,255,255,0.25)" value={newAllergyReaction} onChangeText={setNewAllergyReaction} multiline />
                </View>

                <Pressable delayPressIn={120} onPress={confirmAddAllergy}>
                  <LinearGradient colors={['#FF8C42', '#E67E3C']} style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(10) }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Confirmer et ajouter</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={function() { setShowAddAllergySheet(false); }}
                  style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
                </Pressable>
              </ScrollView>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ===== MODAL — Ajouter un vaccin ===== */}
      <Modal
        visible={showAddVaccSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={function() { setShowAddVaccSheet(false); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={function() { setShowAddVaccSheet(false); }}
        >
          <Pressable onPress={function(e) { e.stopPropagation(); }}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{ borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34) }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }}/>
              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>Ajouter un vaccin</Text>
              <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(20) }}>Complétez votre carnet vaccinal</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Nom du vaccin *</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} placeholder="Ex : BCG, ROR, COVID-19 Pfizer..." placeholderTextColor="rgba(255,255,255,0.25)" value={newVaccName} onChangeText={setNewVaccName} autoFocus={true} />
                </View>

                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Date d'administration</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} placeholder="JJ/MM/AAAA" placeholderTextColor="rgba(255,255,255,0.25)" value={newVaccDate} onChangeText={setNewVaccDate} keyboardType="numeric" />
                </View>

                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(8) }}>Numéro de dose</Text>
                <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(16) }}>
                  {[1, 2, 3, 4, 5].map(function(d) {
                    var isActive = newVaccDose === d;
                    return (
                      <Pressable key={d} onPress={function() { setNewVaccDose(d); }}
                        style={{ width: wp(44), height: wp(44), borderRadius: wp(12), justifyContent: 'center', alignItems: 'center', backgroundColor: isActive ? 'rgba(155,109,255,0.2)' : 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: isActive ? '#9B6DFF' : 'rgba(255,255,255,0.08)' }}>
                        <Text style={{ fontSize: fp(15), fontWeight: '700', color: isActive ? '#9B6DFF' : 'rgba(255,255,255,0.4)' }}>{d}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Prochain rappel (optionnel)</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} placeholder="JJ/MM/AAAA" placeholderTextColor="rgba(255,255,255,0.25)" value={newVaccNextDue} onChangeText={setNewVaccNextDue} keyboardType="numeric" />
                </View>

                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Médecin / Centre (optionnel)</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), marginBottom: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} placeholder="Nom du médecin ou centre" placeholderTextColor="rgba(255,255,255,0.25)" value={newVaccDoctor} onChangeText={setNewVaccDoctor} />
                </View>

                <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Numéro de lot (optionnel)</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12), paddingHorizontal: wp(14), marginBottom: wp(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <TextInput style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }} placeholder="Ex : AB1234" placeholderTextColor="rgba(255,255,255,0.25)" value={newVaccBatch} onChangeText={setNewVaccBatch} />
                </View>

                <Pressable delayPressIn={120} onPress={confirmAddVaccination}>
                  <LinearGradient colors={['#9B6DFF', '#8B5CF6']} style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(10) }}>
                    <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Confirmer et ajouter</Text>
                  </LinearGradient>
                </Pressable>
                <Pressable onPress={function() { setShowAddVaccSheet(false); }}
                  style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>Annuler</Text>
                </Pressable>
              </ScrollView>
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ===== MODAL — Ajouter un diagnostic ===== */}
      <Modal
        visible={showAddDiagSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={function() { setShowAddDiagSheet(false); setAddDiagStep('search'); setDiagSearchResults([]); setSelectedDiagFromDb(null); }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
          onPress={function() { setShowAddDiagSheet(false); setAddDiagStep('search'); }}
        >
          <Pressable onPress={function(e) { e.stopPropagation(); }}>
            <LinearGradient
              colors={['#2A2F36', '#1E2328', '#252A30']}
              style={{
                borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24),
                paddingHorizontal: wp(20), paddingTop: wp(12), paddingBottom: wp(34),
                maxHeight: SCREEN_HEIGHT * 0.85,
              }}
            >
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: wp(16) }}/>

              {addDiagStep === 'search' ? (
                <View>
                  <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', marginBottom: wp(4) }}>
                    Ajouter un diagnostic
                  </Text>
                  <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.5)', marginBottom: wp(16) }}>
                    97+ maladies référencées
                  </Text>

                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(14),
                    paddingHorizontal: wp(14), marginBottom: wp(12),
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  }}>
                    <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(8) }}>
                      <Circle cx="11" cy="11" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                      <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round"/>
                    </Svg>
                    <TextInput
                      style={{ flex: 1, fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }}
                      placeholder="Nom de la maladie..."
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={diagSearchQuery}
                      onChangeText={searchDiseases}
                      autoFocus={true}
                    />
                    {diagSearchQuery.length > 0 ? (
                      <Pressable onPress={function() { searchDiseases(''); }}>
                        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: fp(16) }}>✕</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.4 }}>
                    {diagSearchResults.map(function(disease, i) {
                      return (
                        <Pressable key={disease.id || i} delayPressIn={120}
                          onPress={function() { selectDiagFromDb(disease); }}
                          style={function(state) { return {
                            flexDirection: 'row', alignItems: 'center',
                            paddingVertical: wp(12), paddingHorizontal: wp(12),
                            backgroundColor: state.pressed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                            borderRadius: wp(12), marginBottom: wp(6),
                            borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                          }; }}
                        >
                          <View style={{
                            width: wp(38), height: wp(38), borderRadius: wp(12),
                            backgroundColor: 'rgba(255,107,107,0.1)',
                            justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                          }}>
                            <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24" fill="none">
                              <Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke="#FF6B6B" strokeWidth="1.5" />
                            </Svg>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: fp(14), fontWeight: '600', color: '#FFF' }}>{disease.name_fr}</Text>
                            <Text style={{ fontSize: fp(11), color: 'rgba(255,255,255,0.35)', marginTop: wp(2) }}>{disease.category || ''}</Text>
                          </View>
                          {disease.is_chronic ? (
                            <View style={{ backgroundColor: 'rgba(77,166,255,0.15)', borderRadius: wp(6), paddingHorizontal: wp(8), paddingVertical: wp(3) }}>
                              <Text style={{ fontSize: fp(9), fontWeight: '700', color: '#4DA6FF' }}>Chronique</Text>
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}

                    {diagSearchQuery.length >= 3 && diagSearchResults.length === 0 ? (
                      <View style={{ padding: wp(16), alignItems: 'center' }}>
                        <Text style={{ fontSize: fp(13), color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: wp(12) }}>
                          Aucun résultat pour "{diagSearchQuery}"
                        </Text>
                        <Pressable
                          onPress={function() {
                            selectDiagFromDb({ name_fr: diagSearchQuery.trim(), source: 'ai', id: null, icd_code: null, category: null, is_chronic: false });
                          }}
                          style={function(state) { return {
                            flexDirection: 'row', alignItems: 'center', gap: wp(6),
                            backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: wp(12),
                            paddingHorizontal: wp(14), paddingVertical: wp(10),
                            borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
                            opacity: state.pressed ? 0.7 : 1,
                          }; }}
                        >
                          <Text style={{ fontSize: fp(12), color: '#D4AF37' }}>Pas trouvé ? Ajouter manuellement</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </ScrollView>
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: wp(16) }}>
                    <View style={{
                      width: wp(44), height: wp(44), borderRadius: wp(14),
                      backgroundColor: 'rgba(255,107,107,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: wp(12),
                    }}>
                      <Svg width={wp(22)} height={wp(22)} viewBox="0 0 24 24" fill="none">
                        <Path d="M20.42 4.58a5.4 5.4 0 00-7.65 0L12 5.36l-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 000-7.65z" stroke="#FF6B6B" strokeWidth="1.5" />
                      </Svg>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: fp(18), fontWeight: '700', color: '#FFF' }}>{selectedDiagFromDb ? selectedDiagFromDb.name_fr : ''}</Text>
                      {selectedDiagFromDb && selectedDiagFromDb.category ? (
                        <Text style={{ fontSize: fp(12), color: 'rgba(255,255,255,0.4)', marginTop: wp(2) }}>{selectedDiagFromDb.category}</Text>
                      ) : null}
                    </View>
                  </View>

                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(8) }}>Sévérité</Text>
                  <View style={{ flexDirection: 'row', gap: wp(8), marginBottom: wp(16) }}>
                    {[
                      { key: 'mild', label: 'Légère', color: '#00D984' },
                      { key: 'moderate', label: 'Modérée', color: '#FF8C42' },
                      { key: 'severe', label: 'Sévère', color: '#FF6B6B' },
                    ].map(function(sev) {
                      var isActive = newDiagSeverity === sev.key;
                      return (
                        <Pressable key={sev.key} onPress={function() { setNewDiagSeverity(sev.key); }}
                          style={{
                            flex: 1, paddingVertical: wp(10), borderRadius: wp(10), alignItems: 'center',
                            backgroundColor: isActive ? sev.color + '20' : 'rgba(255,255,255,0.04)',
                            borderWidth: 1.5, borderColor: isActive ? sev.color : 'rgba(255,255,255,0.08)',
                          }}>
                          <Text style={{ fontSize: fp(12), fontWeight: '700', color: isActive ? sev.color : 'rgba(255,255,255,0.4)' }}>{sev.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(8) }}>Statut</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginBottom: wp(16) }}>
                    {[
                      { key: 'active', label: 'Actif', color: '#FF6B6B' },
                      { key: 'chronic', label: 'Chronique', color: '#4DA6FF' },
                      { key: 'monitoring', label: 'En rémission', color: '#F1C40F' },
                      { key: 'resolved', label: 'Résolu', color: '#00D984' },
                    ].map(function(st) {
                      var isActive = newDiagStatus === st.key;
                      return (
                        <Pressable key={st.key} onPress={function() { setNewDiagStatus(st.key); }}
                          style={{
                            paddingVertical: wp(10), paddingHorizontal: wp(14), borderRadius: wp(10),
                            backgroundColor: isActive ? st.color + '20' : 'rgba(255,255,255,0.04)',
                            borderWidth: 1.5, borderColor: isActive ? st.color : 'rgba(255,255,255,0.08)',
                          }}>
                          <Text style={{ fontSize: fp(12), fontWeight: '700', color: isActive ? st.color : 'rgba(255,255,255,0.4)' }}>{st.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Date du diagnostic</Text>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                    paddingHorizontal: wp(14), marginBottom: wp(14),
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  }}>
                    <TextInput
                      style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }}
                      placeholder="JJ/MM/AAAA"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={newDiagDate}
                      onChangeText={setNewDiagDate}
                      keyboardType="numeric"
                    />
                  </View>

                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Diagnostiqué par</Text>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                    paddingHorizontal: wp(14), marginBottom: wp(14),
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  }}>
                    <TextInput
                      style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12) }}
                      placeholder="Nom du médecin"
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={newDiagDoctor}
                      onChangeText={setNewDiagDoctor}
                    />
                  </View>

                  <Text style={{ fontSize: fp(13), fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: wp(6) }}>Notes</Text>
                  <View style={{
                    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: wp(12),
                    paddingHorizontal: wp(14), marginBottom: wp(20),
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                  }}>
                    <TextInput
                      style={{ fontSize: fp(15), color: '#FFF', paddingVertical: wp(12), minHeight: wp(60) }}
                      placeholder="Observations, contexte..."
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      value={newDiagNotes}
                      onChangeText={setNewDiagNotes}
                      multiline
                    />
                  </View>

                  <Pressable delayPressIn={120} onPress={confirmAddDiagnostic}>
                    <LinearGradient colors={['#00D984', '#00B871']}
                      style={{ paddingVertical: wp(16), borderRadius: wp(14), alignItems: 'center', marginBottom: wp(10) }}>
                      <Text style={{ fontSize: fp(16), fontWeight: '700', color: '#FFF' }}>Confirmer et ajouter</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable onPress={function() { setAddDiagStep('search'); setSelectedDiagFromDb(null); }}
                    style={{ paddingVertical: wp(14), alignItems: 'center', borderRadius: wp(14), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Text style={{ fontSize: fp(15), fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>← Changer</Text>
                  </Pressable>
                </ScrollView>
              )}
            </LinearGradient>
          </Pressable>
        </Pressable>
      </Modal>
      <LixumModal visible={modalsModal.visible} type={modalsModal.type} title={modalsModal.title} message={modalsModal.message} onConfirm={modalsModal.onConfirm} onClose={modalsModal.onClose || closeModalsModal} confirmText={modalsModal.confirmText} cancelText={modalsModal.cancelText} />
    </View>
  );
};
