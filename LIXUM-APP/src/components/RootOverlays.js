import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../config/AuthContext';
import RestoreAccountModal from './profile/RestoreAccountModal';
import AccountDeletedSuccessScreen from './profile/AccountDeletedSuccessScreen';

function RootOverlays() {
  var auth = useAuth();

  var _isRestoring = useState(false);
  var isRestoring = _isRestoring[0];
  var setIsRestoring = _isRestoring[1];

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

  var handleAcknowledge = async function() {
    if (auth.acknowledgeAccountDeleted) {
      await auth.acknowledgeAccountDeleted();
    }
  };

  var restoreVisible = auth.deletionPending !== null && auth.deletionPending !== undefined && !auth.accountDeletedSuccessVisible;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <RestoreAccountModal
        visible={restoreVisible}
        deletionPending={auth.deletionPending}
        onRestore={handleRestore}
        onRejectAndSignOut={handleRejectAndSignOut}
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
