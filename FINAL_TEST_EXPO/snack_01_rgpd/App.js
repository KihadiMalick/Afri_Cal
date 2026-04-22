import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ActivityIndicator, ScrollView, Platform, StatusBar, Alert } from 'react-native';

// ============================================================
// CONSTANTES DESIGN — Premium LIXUM (fond sombre + emerald)
// ============================================================

var COLORS = {
  bgPrimary: '#0A0E14',
  bgCard: '#1A1D22',
  borderSubtle: '#2A303B',
  borderAccent: 'rgba(0,217,132,0.4)',
  emerald: '#00D984',
  emeraldMuted: 'rgba(0,217,132,0.3)',
  textPrimary: '#FFFFFF',
  textSecondary: '#B8BEC5',
  textTertiary: '#6B7280',
  danger: '#FF6B6B',
  dangerMuted: 'rgba(255,107,107,0.3)',
  warning: '#FFA500',
  warningBg: 'rgba(255,165,0,0.08)',
  overlay: 'rgba(0,0,0,0.85)'
};

var T = {
  fr: {
    deleteAccountWarning: '⚠ Cette action est irréversible. Toutes vos données (repas, scans, caractères, XP, Lix) seront définitivement supprimées après 30 jours. Vous pouvez changer d\'avis en vous reconnectant dans ce délai.',
    deleteConfirmKeyword: 'SUPPRIMER',
    deleteConfirmPlaceholder: 'Tapez SUPPRIMER pour confirmer',
    deleteConfirmButton: 'Supprimer définitivement',
    deleteReasonPlaceholder: 'Pourquoi partez-vous ? (optionnel)',
    deleteReasonLabel: 'Raison (optionnel)',
    deleteCancelButton: 'Annuler',
    deleteModalTitle: 'Supprimer mon compte',
    restoreModalTitle: 'Votre compte est programmé pour suppression',
    restoreModalBody: 'Suppression prévue le {date}. Voulez-vous restaurer votre compte LIXUM ?',
    restoreConfirmButton: 'Restaurer mon compte',
    restoreRejectButton: 'Confirmer la suppression'
  }
};

var t = T.fr;

// ============================================================
// HELPERS
// ============================================================

function formatDateFR(date) {
  if (!date) return '';
  var d = new Date(date);
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = d.getFullYear();
  return day + '/' + month + '/' + year;
}

function addDays(n) {
  var d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ============================================================
// DeleteConfirmModal — double confirmation "SUPPRIMER"
// ============================================================

function DeleteConfirmModal(props) {
  var visible = props.visible;
  var onClose = props.onClose;
  var onConfirm = props.onConfirm;
  var isDeleting = props.isDeleting;

  var _confirmText = useState('');
  var confirmText = _confirmText[0];
  var setConfirmText = _confirmText[1];

  var _reason = useState('');
  var reason = _reason[0];
  var setReason = _reason[1];

  var keywordMatches = confirmText.trim().toUpperCase() === t.deleteConfirmKeyword;

  function handleConfirm() {
    if (!keywordMatches || isDeleting) return;
    onConfirm(reason);
  }

  function handleClose() {
    if (isDeleting) return;
    setConfirmText('');
    setReason('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <View style={{ backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: COLORS.dangerMuted }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 22, marginRight: 10 }}>{'🗑️'}</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, flex: 1 }}>{t.deleteModalTitle}</Text>
          </View>

          <View style={{ backgroundColor: COLORS.warningBg, borderWidth: 1, borderColor: 'rgba(255,165,0,0.25)', borderRadius: 12, padding: 14, marginBottom: 18 }}>
            <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 }}>
              {t.deleteAccountWarning}
            </Text>
          </View>

          <Text style={{ fontSize: 11, color: COLORS.textTertiary, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>
            {t.deleteReasonLabel}
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder={t.deleteReasonPlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            multiline={true}
            numberOfLines={3}
            editable={!isDeleting}
            style={{ backgroundColor: COLORS.bgPrimary, borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 10, padding: 12, color: COLORS.textPrimary, fontSize: 13, minHeight: 70, textAlignVertical: 'top', marginBottom: 16 }}
          />

          <Text style={{ fontSize: 11, color: COLORS.textTertiary, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>
            Confirmation
          </Text>
          <TextInput
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={t.deleteConfirmPlaceholder}
            placeholderTextColor={COLORS.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isDeleting}
            style={{ backgroundColor: COLORS.bgPrimary, borderWidth: 1, borderColor: keywordMatches ? COLORS.danger : COLORS.borderSubtle, borderRadius: 10, padding: 12, color: keywordMatches ? COLORS.danger : COLORS.textPrimary, fontSize: 15, fontWeight: '700', letterSpacing: 2, marginBottom: 20 }}
          />

          {isDeleting ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.danger} />
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 10 }}>Suppression en cours...</Text>
            </View>
          ) : (
            <View>
              <Pressable
                onPress={handleConfirm}
                disabled={!keywordMatches}
                style={function(s) {
                  return {
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: keywordMatches ? 'rgba(255,107,107,0.15)' : 'rgba(255,107,107,0.04)',
                    borderWidth: 1,
                    borderColor: keywordMatches ? COLORS.danger : COLORS.dangerMuted,
                    opacity: s.pressed && keywordMatches ? 0.7 : 1,
                    marginBottom: 8
                  };
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: keywordMatches ? COLORS.danger : 'rgba(255,107,107,0.4)' }}>
                  {t.deleteConfirmButton}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleClose}
                style={function(s) {
                  return {
                    paddingVertical: 12,
                    alignItems: 'center',
                    opacity: s.pressed ? 0.6 : 1
                  };
                }}
              >
                <Text style={{ fontSize: 14, color: COLORS.textTertiary }}>{t.deleteCancelButton}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================================
// RestoreAccountModal — user revient dans les 30 jours
// ============================================================

function RestoreAccountModal(props) {
  var visible = props.visible;
  var scheduledDate = props.scheduledDate;
  var onRestore = props.onRestore;
  var onReject = props.onReject;
  var isRestoring = props.isRestoring;

  var formattedDate = formatDateFR(scheduledDate);
  var daysRemaining = scheduledDate ? Math.max(0, Math.ceil((new Date(scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  var isUrgent = daysRemaining <= 3;

  var bodyText = t.restoreModalBody.replace('{date}', formattedDate);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={function() { if (!isRestoring) onReject(); }}>
      <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <View style={{ backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: COLORS.borderAccent }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isUrgent ? 'rgba(255,165,0,0.15)' : 'rgba(0,217,132,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 28 }}>{isUrgent ? '⚠' : '♻️'}</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' }}>
              {t.restoreModalTitle}
            </Text>
          </View>

          <View style={{ backgroundColor: COLORS.bgPrimary, borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, textAlign: 'center' }}>
              {bodyText}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 12, color: isUrgent ? COLORS.warning : COLORS.emerald, fontWeight: '700' }}>
              {daysRemaining} {daysRemaining > 1 ? 'jours restants' : 'jour restant'}
            </Text>
          </View>

          {isRestoring ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.emerald} />
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 10 }}>Restauration en cours...</Text>
            </View>
          ) : (
            <View>
              <Pressable
                onPress={onRestore}
                style={function(s) {
                  return {
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: COLORS.emerald,
                    opacity: s.pressed ? 0.85 : 1,
                    marginBottom: 10
                  };
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#000' }}>
                  {'✓ '}{t.restoreConfirmButton}
                </Text>
              </Pressable>
              <Pressable
                onPress={onReject}
                style={function(s) {
                  return {
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: COLORS.dangerMuted,
                    opacity: s.pressed ? 0.7 : 1
                  };
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.danger }}>
                  {t.restoreRejectButton}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================================
// MockScenariosPanel — boutons de test
// ============================================================

function MockScenariosPanel(props) {
  var onTriggerDelete = props.onTriggerDelete;
  var onTriggerRestoreJ15 = props.onTriggerRestoreJ15;
  var onTriggerRestoreJ1 = props.onTriggerRestoreJ1;
  var lastAction = props.lastAction;

  var scenarios = [
    { id: 'delete', label: 'Simuler demande suppression', emoji: '🗑️', color: COLORS.danger, onPress: onTriggerDelete },
    { id: 'restore15', label: 'Simuler retour utilisateur (J+15)', emoji: '♻️', color: COLORS.emerald, onPress: onTriggerRestoreJ15 },
    { id: 'restore1', label: 'Simuler retour urgent (J+1)', emoji: '⚠', color: COLORS.warning, onPress: onTriggerRestoreJ1 }
  ];

  return (
    <View style={{ backgroundColor: COLORS.bgCard, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSubtle, padding: 16, marginBottom: 20 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.emerald, letterSpacing: 2, marginBottom: 14 }}>
        SCENARIOS DE TEST
      </Text>

      {scenarios.map(function(sc) {
        return (
          <Pressable
            key={sc.id}
            onPress={sc.onPress}
            style={function(s) {
              return {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: s.pressed ? 'rgba(255,255,255,0.04)' : COLORS.bgPrimary,
                borderWidth: 1,
                borderColor: COLORS.borderSubtle,
                marginBottom: 8
              };
            }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: sc.color + '18', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 18 }}>{sc.emoji}</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary }}>
              {sc.label}
            </Text>
            <Text style={{ fontSize: 16, color: sc.color }}>{'›'}</Text>
          </Pressable>
        );
      })}

      <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.borderSubtle }}>
        <Text style={{ fontSize: 10, color: COLORS.textTertiary, letterSpacing: 1, marginBottom: 4 }}>
          DERNIERE ACTION
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.emerald, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
          {lastAction || '(aucune)'}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// App principal — orchestrateur
// ============================================================

export default function App() {
  var _showDelete = useState(false);
  var showDelete = _showDelete[0];
  var setShowDelete = _showDelete[1];

  var _showRestore = useState(false);
  var showRestore = _showRestore[0];
  var setShowRestore = _showRestore[1];

  var _scheduledDate = useState(null);
  var scheduledDate = _scheduledDate[0];
  var setScheduledDate = _scheduledDate[1];

  var _isDeleting = useState(false);
  var isDeleting = _isDeleting[0];
  var setIsDeleting = _isDeleting[1];

  var _isRestoring = useState(false);
  var isRestoring = _isRestoring[0];
  var setIsRestoring = _isRestoring[1];

  var _lastAction = useState('');
  var lastAction = _lastAction[0];
  var setLastAction = _lastAction[1];

  function logAction(msg) {
    console.log('[Snack01]', msg);
    setLastAction(msg);
  }

  function handleTriggerDelete() {
    logAction('Ouverture modal suppression');
    setShowDelete(true);
  }

  function handleTriggerRestoreJ15() {
    var d = addDays(15);
    setScheduledDate(d);
    logAction('Ouverture modal restauration (J+15)');
    setShowRestore(true);
  }

  function handleTriggerRestoreJ1() {
    var d = addDays(1);
    setScheduledDate(d);
    logAction('Ouverture modal restauration urgente (J+1)');
    setShowRestore(true);
  }

  function handleConfirmDelete(reason) {
    setIsDeleting(true);
    logAction('request_account_deletion(reason=' + (reason ? '"' + reason.slice(0, 30) + '..."' : 'null') + ')');
    setTimeout(function() {
      setIsDeleting(false);
      setShowDelete(false);
      var eraseDate = addDays(30);
      Alert.alert(
        'Suppression programmee',
        'Compte sera efface le ' + formatDateFR(eraseDate) + '. Reconnectez-vous avant pour restaurer.',
        [{ text: 'OK' }]
      );
      logAction('Suppression OK (efface le ' + formatDateFR(eraseDate) + ')');
    }, 1500);
  }

  function handleCancelDelete() {
    setShowDelete(false);
    logAction('Annulation suppression');
  }

  function handleRestore() {
    setIsRestoring(true);
    logAction('restore_account()');
    setTimeout(function() {
      setIsRestoring(false);
      setShowRestore(false);
      Alert.alert(
        'Compte restaure',
        'Bienvenue a nouveau sur LIXUM ! Toutes vos donnees sont preservees.',
        [{ text: 'Continuer' }]
      );
      logAction('Restauration OK');
    }, 1000);
  }

  function handleRejectRestore() {
    setShowRestore(false);
    logAction('User confirme suppression -> signOut');
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />
      <ScrollView
        contentContainerStyle={{ paddingTop: Platform.OS === 'android' ? 50 : 70, paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.emerald, letterSpacing: 3, marginBottom: 6 }}>
            LIXUM
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 }}>
            Test RGPD Snack #01
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textTertiary, lineHeight: 18 }}>
            Modals suppression compte (double confirmation) + restauration dans la fenetre 30 jours
          </Text>
        </View>

        <MockScenariosPanel
          onTriggerDelete={handleTriggerDelete}
          onTriggerRestoreJ15={handleTriggerRestoreJ15}
          onTriggerRestoreJ1={handleTriggerRestoreJ1}
          lastAction={lastAction}
        />

        <View style={{ backgroundColor: COLORS.bgCard, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSubtle, padding: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.textSecondary, letterSpacing: 2, marginBottom: 8 }}>
            INFOS TEST
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textTertiary, lineHeight: 20 }}>
            {'• Modal suppression : tape SUPPRIMER (majuscules ou minuscules) pour activer le bouton.\n'}
            {'• Modal restauration : le bouton vert restore, le bouton rouge confirme la suppression.\n'}
            {'• Les appels RPC sont mockes avec setTimeout (1.5s delete, 1s restore).\n'}
            {'• L\'Alert natif s\'affiche a la fin de chaque action reussie.'}
          </Text>
        </View>
      </ScrollView>

      <DeleteConfirmModal
        visible={showDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />

      <RestoreAccountModal
        visible={showRestore}
        scheduledDate={scheduledDate}
        isRestoring={isRestoring}
        onRestore={handleRestore}
        onReject={handleRejectRestore}
      />
    </View>
  );
}
