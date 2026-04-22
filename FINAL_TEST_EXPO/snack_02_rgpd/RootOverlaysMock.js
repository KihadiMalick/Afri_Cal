import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useAuth } from './MockAuthContext';
import RestoreAccountModal from './components/RestoreAccountModal';
import AccountDeletedSuccessScreen from './components/AccountDeletedSuccessScreen';

function RootOverlaysMock() {
  var auth = useAuth();

  var _isRestoring = useState(false);
  var isRestoring = _isRestoring[0];
  var setIsRestoring = _isRestoring[1];

  function handleRestore() {
    if (isRestoring) return;
    setIsRestoring(true);
    auth.restoreAccount().then(function(res) {
      if (!res || res.success !== true) {
        console.warn('[RootOverlaysMock] restoreAccount failed:', res);
      }
      setIsRestoring(false);
    });
  }

  function handleRejectAndSignOut() {
    auth.signOut();
  }

  function handleAcknowledge() {
    if (auth.acknowledgeAccountDeleted) {
      auth.acknowledgeAccountDeleted();
    }
  }

  var restoreVisible = auth.deletionPending !== null && auth.deletionPending !== undefined && !auth.accountDeletedSuccessVisible;

  var showTestPanel = !restoreVisible && !auth.accountDeletedSuccessVisible;

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

      {showTestPanel ? (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: Platform.OS === 'ios' ? 20 : 12, backgroundColor: '#1A1D22', borderRadius: 14, borderWidth: 1, borderColor: '#2A303B', padding: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#00D984', letterSpacing: 2, marginBottom: 8 }}>
            {'SNACK TEST PANEL'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable
              onPress={function() { auth.testTriggerRestoreModal(15); }}
              style={function(s) {
                return {
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: 'rgba(0,217,132,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(0,217,132,0.4)',
                  alignItems: 'center',
                  opacity: s.pressed ? 0.7 : 1
                };
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#00D984' }}>{'Restore J+15'}</Text>
            </Pressable>
            <Pressable
              onPress={function() { auth.testTriggerRestoreModal(1); }}
              style={function(s) {
                return {
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255,165,0,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,165,0,0.4)',
                  alignItems: 'center',
                  opacity: s.pressed ? 0.7 : 1
                };
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFA500' }}>{'Urgent J+1'}</Text>
            </Pressable>
            <Pressable
              onPress={function() { auth.testReset(); }}
              style={function(s) {
                return {
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255,107,107,0.08)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,107,107,0.3)',
                  alignItems: 'center',
                  opacity: s.pressed ? 0.7 : 1
                };
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF6B6B' }}>{'Reset'}</Text>
            </Pressable>
          </View>
          {auth.lastAction ? (
            <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 6, fontFamily: 'monospace' }} numberOfLines={1}>
              {'▸ ' + auth.lastAction}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default RootOverlaysMock;
