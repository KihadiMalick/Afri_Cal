import React, { useEffect } from 'react';
import { View, Text, Pressable, Modal, StatusBar, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { T } from '../mockT';

var COLORS = {
  bgPrimary: '#0A0E14',
  bgAccent: 'rgba(0,217,132,0.06)',
  emerald: '#00D984',
  emeraldMuted: 'rgba(0,217,132,0.3)',
  textPrimary: '#FFFFFF',
  textSecondary: '#B8BEC5',
  textTertiary: '#6B7280'
};

function formatDateFR(isoStr) {
  if (!isoStr) return '';
  var d = new Date(isoStr);
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = d.getFullYear();
  return day + '/' + month + '/' + year;
}

function AccountDeletedSuccessScreen(props) {
  var visible = props.visible;
  var scheduledDate = props.scheduledDate;
  var onAcknowledge = props.onAcknowledge;
  var language = props.language || 'FR';

  var t = language === 'EN' ? T.en : T.fr;
  var formattedDate = formatDateFR(scheduledDate);
  var bodyText = t.deleteSuccessScreenBody.replace('{date}', formattedDate);

  useEffect(function() {
    if (visible) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
    }
  }, [visible]);

  function handleAcknowledge() {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    onAcknowledge();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={handleAcknowledge}>
      <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.bgAccent, borderWidth: 2, borderColor: COLORS.emeraldMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 28 }}>
            <Text style={{ fontSize: 72 }}>{'♻️'}</Text>
          </View>

          <Text style={{ fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 16 }}>
            {t.deleteSuccessScreenTitle}
          </Text>

          <Text style={{ fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 }}>
            {bodyText}
          </Text>

          <Text style={{ fontSize: 12, fontStyle: 'italic', color: COLORS.textTertiary, textAlign: 'center', opacity: 0.7 }}>
            {t.deleteSuccessScreenHint}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28 }}>
          <Pressable
            onPress={handleAcknowledge}
            style={function(s) {
              return {
                height: 56,
                borderRadius: 14,
                backgroundColor: COLORS.emerald,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: s.pressed ? 0.88 : 1
              };
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#000', letterSpacing: 0.5 }}>
              {t.deleteSuccessScreenButton}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default AccountDeletedSuccessScreen;
