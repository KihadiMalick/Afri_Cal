import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useAuth } from '../config/AuthContext';
import RestoreAccountModal from './profile/RestoreAccountModal';
import AccountDeletedSuccessScreen from './profile/AccountDeletedSuccessScreen';

function RootOverlays(props) {
  var auth = useAuth();

  var _isRestoring = useState(false);
  var isRestoring = _isRestoring[0];
  var setIsRestoring = _isRestoring[1];

  // Synchronise la modale avec l'etat RGPD : si pas de deletionPending,
  // ou si écran success est visible, on force la fermeture de la modale.
  // L'ouverture est declenchee uniquement par le tap de la banniere
  // (geree dans App.js via setShowRestoreModal lifted).
  useEffect(function() {
    if (!auth.deletionPending || auth.accountDeletedSuccessVisible) {
      props.setShowRestoreModal(false);
    }
  }, [auth.deletionPending, auth.accountDeletedSuccessVisible]);

  var handleRestore = async function() {
    if (isRestoring) return;
    setIsRestoring(true);
    try {
      var res = await auth.restoreAccount();
      if (!res || res.success !== true) {
        console.warn('[RootOverlays] restoreAccount failed:', res);
      }
    } catch (e) {
      console.warn('[RootOverlays] restoreAccount exception:', e);
    } finally {
      setIsRestoring(false);
    }
  };

  var handleRejectAndSignOut = async function() {
    try {
      await auth.signOut();
    } catch (e) {
      console.warn('[RootOverlays] signOut exception:', e);
    }
  };

  var handleCloseRestoreModal = function() {
    props.setShowRestoreModal(false);
  };

  var handleAcknowledge = async function() {
    if (auth.acknowledgeAccountDeleted) {
      await auth.acknowledgeAccountDeleted();
    }
  };

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <RestoreAccountModal
        visible={props.showRestoreModal === true}
        deletionPending={auth.deletionPending}
        onRestore={handleRestore}
        onRejectAndSignOut={handleRejectAndSignOut}
        onClose={handleCloseRestoreModal}
        isRestoring={isRestoring}
        language={auth.language || 'FR'}
      />
      <AccountDeletedSuccessScreen
        visible={auth.accountDeletedSuccessVisible === true}
        scheduledDate={auth.accountDeletedScheduledDate}
        onAcknowledge={handleAcknowledge}
        language={auth.language || 'FR'}
      />
    </View>
  );
}

export default RootOverlays;
