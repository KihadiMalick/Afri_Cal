import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useAuth } from '../config/AuthContext';
import { T } from '../pages/profile/profileConstants';

function DeletionBanner(props) {
  var auth = useAuth();
  var deletionPending = auth.deletionPending;
  var language = auth.language || 'FR';
  var t = language === 'EN' ? T.en : T.fr;

  if (!deletionPending) {
    return null;
  }

  var scheduledDate = new Date(deletionPending.scheduledDeletionAt);
  var now = new Date();
  var diffMs = scheduledDate.getTime() - now.getTime();
  var daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  var isUrgent = daysLeft < 3;
  var messageTemplate = isUrgent ? t.bannerDeletionPendingUrgent : t.bannerDeletionPending;
  var message = (messageTemplate || '').replace('{days}', String(daysLeft));

  var bgColor = isUrgent ? 'rgba(255,107,107,0.18)' : 'rgba(255,165,0,0.15)';
  var borderColor = isUrgent ? '#FF6B6B' : '#FFA500';
  var statusBarTop = Platform.OS === 'ios' ? 44 : 28;

  return (
    <Pressable
      onPress={props.onPress}
      style={{
        paddingTop: statusBarTop + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: bgColor,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Text
        numberOfLines={2}
        style={{ color: '#FFFFFF', fontSize: 13, flex: 1, marginRight: 10, fontWeight: '500' }}
      >
        {message}
      </Text>
      <Text style={{ color: borderColor, fontSize: 13, fontWeight: '700' }}>
        {(t.bannerRestoreLink || 'Restaurer') + ' →'}
      </Text>
    </Pressable>
  );
}

export default DeletionBanner;
