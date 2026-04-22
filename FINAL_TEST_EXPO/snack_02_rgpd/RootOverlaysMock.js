import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useAuth } from './MockAuthContext';
import { T } from './mockT';
import RestoreAccountModal from './components/RestoreAccountModal';
import AccountDeletedSuccessScreen from './components/AccountDeletedSuccessScreen';

// Banner inline (copie fidele du prod RootOverlays.js)
function Banner(props) {
  var deletionPending = props.deletionPending;
  var language = props.language;
  var onPress = props.onPress;
  var t = language === 'EN' ? T.en : T.fr;

  var scheduledDate = new Date(deletionPending.scheduledDeletionAt);
  var now = new Date();
  var diffMs = scheduledDate.getTime() - now.getTime();
  var daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  var isUrgent = daysLeft < 3;

  var messageTemplate = isUrgent ? t.bannerDeletionPendingUrgent : t.bannerDeletionPending;
  var message = (messageTemplate || '').replace('{days}', String(daysLeft));

  var bgColor = isUrgent ? 'rgba(255,107,107,0.15)' : 'rgba(255,165,0,0.12)';
  var borderColor = isUrgent ? '#FF6B6B' : '#FFA500';
  var paddingTop = Platform.OS === 'ios' ? 44 : 24;

  return (
    <Pressable
      onPress={onPress}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: paddingTop,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: bgColor,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 9999
      }}
    >
      <Text numberOfLines={2} style={{ color: '#FFFFFF', fontSize: 13, flex: 1, marginRight: 10 }}>
        {message}
      </Text>
      <Text style={{ color: borderColor, fontSize: 13, fontWeight: '700' }}>
        {(t.bannerRestoreLink || 'Restaurer') + ' →'}
      </Text>
    </Pressable>
  );
}

function RootOverlaysMock() {
  var auth = useAuth();

  var _isRestoring = useState(false);
  var isRestoring = _isRestoring[0];
  var setIsRestoring = _isRestoring[1];

  var _showRestoreModal = useState(false);
  var showRestoreModal = _showRestoreModal[0];
  var setShowRestoreModal = _showRestoreModal[1];

  // Ouvre modale automatiquement si deletionPending ET qu'on n'a pas explicitement
  // voulu afficher SEULEMENT la banniere (testSetBannerOnly laisse showRestoreModal=false).
  // L'ouverture auto ne re-declenche pas car on synchronise sur mount uniquement du deletionPending.
  var _autoOpenedFor = useState(null);
  var autoOpenedFor = _autoOpenedFor[0];
  var setAutoOpenedFor = _autoOpenedFor[1];

  useEffect(function() {
    if (auth.deletionPending && !auth.accountDeletedSuccessVisible) {
      // Auto-open la modale une seule fois pour un deletionPending donne (via testTriggerRestoreModal)
      // mais laisse la banniere seule si lastAction === banniere seule J+X
      var isBannerOnlyMode = auth.lastAction && auth.lastAction.indexOf('banniere seule') >= 0;
      if (!isBannerOnlyMode && autoOpenedFor !== auth.deletionPending.scheduledDeletionAt) {
        setShowRestoreModal(true);
        setAutoOpenedFor(auth.deletionPending.scheduledDeletionAt);
      }
    } else {
      setShowRestoreModal(false);
      setAutoOpenedFor(null);
    }
  }, [auth.deletionPending, auth.accountDeletedSuccessVisible, auth.lastAction]);

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

  function handleCloseRestoreModal() {
    setShowRestoreModal(false);
  }

  function handleAcknowledge() {
    if (auth.acknowledgeAccountDeleted) {
      auth.acknowledgeAccountDeleted();
    }
  }

  function handleBannerPress() {
    setShowRestoreModal(true);
  }

  var bannerVisible = auth.deletionPending !== null && auth.deletionPending !== undefined && !showRestoreModal && !auth.accountDeletedSuccessVisible;

  var showTestPanel = !showRestoreModal && !auth.accountDeletedSuccessVisible;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {bannerVisible ? (
        <Banner
          deletionPending={auth.deletionPending}
          language={auth.language || 'FR'}
          onPress={handleBannerPress}
        />
      ) : null}

      <RestoreAccountModal
        visible={showRestoreModal}
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

      {showTestPanel ? (
        <View style={{ position: 'absolute', left: 12, right: 12, bottom: Platform.OS === 'ios' ? 20 : 12, backgroundColor: '#1A1D22', borderRadius: 14, borderWidth: 1, borderColor: '#2A303B', padding: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#00D984', letterSpacing: 2, marginBottom: 8 }}>
            {'SNACK TEST PANEL'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
            <Pressable
              onPress={function() { auth.testTriggerRestoreModal(15); }}
              style={function(s) {
                return { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(0,217,132,0.12)', borderWidth: 1, borderColor: 'rgba(0,217,132,0.4)', alignItems: 'center', opacity: s.pressed ? 0.7 : 1 };
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#00D984' }}>{'Restore J+15'}</Text>
            </Pressable>
            <Pressable
              onPress={function() { auth.testTriggerRestoreModal(1); }}
              style={function(s) {
                return { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,165,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,165,0,0.4)', alignItems: 'center', opacity: s.pressed ? 0.7 : 1 };
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFA500' }}>{'Urgent J+1'}</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable
              onPress={function() { auth.testSetBannerOnly(15); }}
              style={function(s) {
                return { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(0,191,166,0.12)', borderWidth: 1, borderColor: 'rgba(0,191,166,0.4)', alignItems: 'center', opacity: s.pressed ? 0.7 : 1 };
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#00BFA6' }}>{'Bannière J+15'}</Text>
            </Pressable>
            <Pressable
              onPress={function() { auth.testReset(); }}
              style={function(s) {
                return { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,107,107,0.08)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.3)', alignItems: 'center', opacity: s.pressed ? 0.7 : 1 };
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#FF6B6B' }}>{'Reset'}</Text>
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
