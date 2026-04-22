import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useAuth } from '../config/AuthContext';
import { T } from '../pages/profile/profileConstants';
import RestoreAccountModal from './profile/RestoreAccountModal';
import AccountDeletedSuccessScreen from './profile/AccountDeletedSuccessScreen';

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

function RootOverlays() {
  var auth = useAuth();

  var _isRestoring = useState(false);
  var isRestoring = _isRestoring[0];
  var setIsRestoring = _isRestoring[1];

  var _showRestoreModal = useState(false);
  var showRestoreModal = _showRestoreModal[0];
  var setShowRestoreModal = _showRestoreModal[1];

  // Ouvre la modale au premier detecte deletionPending (comportement existant).
  // Si user ferme la modale sans restorer, la banniere prend le relais.
  useEffect(function() {
    if (auth.deletionPending && !auth.accountDeletedSuccessVisible) {
      setShowRestoreModal(true);
    } else {
      setShowRestoreModal(false);
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
    setShowRestoreModal(false);
  };

  var handleAcknowledge = async function() {
    if (auth.acknowledgeAccountDeleted) {
      await auth.acknowledgeAccountDeleted();
    }
  };

  var handleBannerPress = function() {
    setShowRestoreModal(true);
  };

  var bannerVisible = auth.deletionPending !== null && auth.deletionPending !== undefined && !showRestoreModal && !auth.accountDeletedSuccessVisible;

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
    </View>
  );
}

export default RootOverlays;
