import React, { useEffect } from 'react';
import { Modal, Pressable, View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { wp, fp } from '../../constants/layout';
import { getAlixenCTA, getLixverseCTA } from '../../config/notificationCTAMap';

function pad2(n) { return n < 10 ? '0' + n : String(n); }

function humanizeTimestamp(iso) {
  if (!iso) return 'Récemment';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return 'Récemment';
  var now = new Date();
  var diffMs = now - d;
  if (diffMs < 60 * 1000) return "À l'instant";
  if (diffMs < 60 * 60 * 1000) {
    var mins = Math.max(1, Math.floor(diffMs / (60 * 1000)));
    return 'Il y a ' + mins + ' minute' + (mins > 1 ? 's' : '');
  }
  if (diffMs < 24 * 60 * 60 * 1000) {
    var hrs = Math.floor(diffMs / (60 * 60 * 1000));
    return 'Il y a ' + hrs + ' heure' + (hrs > 1 ? 's' : '');
  }
  if (diffMs < 48 * 60 * 60 * 1000) {
    return 'Hier à ' + pad2(d.getHours()) + 'h' + pad2(d.getMinutes());
  }
  if (diffMs < 7 * 24 * 60 * 60 * 1000) {
    var days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    return 'Il y a ' + days + ' jours';
  }
  var months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  return pad2(d.getDate()) + ' ' + months[d.getMonth()] + '. à ' + pad2(d.getHours()) + 'h' + pad2(d.getMinutes());
}

export default function NotificationDetailSheet(props) {
  var visible = props.visible;
  var onClose = props.onClose;
  var notification = props.notification;
  var source = props.source;
  var navigation = props.navigation;
  var onMarkRead = props.onMarkRead;

  useEffect(function() {
    if (visible && notification && !notification.read_at && onMarkRead) {
      onMarkRead(notification.id);
    }
  }, [visible, notification && notification.id]);

  if (!notification) {
    return (
      <Modal visible={false} transparent={true} animationType="slide" onRequestClose={onClose} />
    );
  }

  var cta = source === 'alixen'
    ? getAlixenCTA(notification, navigation)
    : getLixverseCTA(notification, navigation);

  var isUrgent = notification.is_urgent === true;
  var iconBg = notification.color ? (notification.color + '20') : 'rgba(0,217,132,0.15)';
  var iconGlyph = notification.icon || (source === 'alixen' ? '💚' : '🌍');

  var tagStyle;
  var tagLabel;
  if (source === 'alixen') {
    tagStyle = { bg: 'rgba(0,217,132,0.15)', border: '#00D984', color: '#00D984' };
    tagLabel = 'ALIXEN';
  } else if (notification.is_admin) {
    tagStyle = { bg: 'rgba(212,175,55,0.15)', border: '#D4AF37', color: '#D4AF37' };
    tagLabel = notification.admin_source || 'OFFICIEL LIXUM';
  } else {
    tagStyle = { bg: 'rgba(255,255,255,0.06)', border: '#3A3F46', color: '#B4B2A9' };
    tagLabel = 'LIXVERSE';
  }

  var onCtaPress = function() {
    if (cta && cta.action) cta.action();
    if (onClose) onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <Pressable onPress={function() {}} style={{ backgroundColor: '#1A2029', borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), maxHeight: '85%', overflow: 'hidden' }}>
            {isUrgent ? (
              <View style={{ height: wp(6), backgroundColor: '#FF3B5C', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: fp(10), fontWeight: '700', color: '#FFF', letterSpacing: 0.8 }}>⚠ ALERTE URGENTE</Text>
              </View>
            ) : null}
            <View style={{ padding: wp(20) }}>
              <View style={{ width: wp(40), height: wp(4), borderRadius: wp(2), backgroundColor: '#3A3F46', alignSelf: 'center', marginBottom: wp(16) }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: wp(20) }}>
                <View style={{ width: wp(56), height: wp(56), borderRadius: wp(16), backgroundColor: iconBg, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(32) }}>{iconGlyph}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8) }}>
                  <View style={{ paddingVertical: wp(4), paddingHorizontal: wp(10), borderRadius: wp(6), borderWidth: 0.5, backgroundColor: tagStyle.bg, borderColor: tagStyle.border }}>
                    <Text style={{ fontSize: fp(10), fontWeight: '500', letterSpacing: 0.8, color: tagStyle.color }}>{tagLabel}</Text>
                  </View>
                  <Pressable onPress={onClose} style={{ width: wp(32), height: wp(32), borderRadius: wp(16), backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' }}>
                    <Svg width={wp(14)} height={wp(14)} viewBox="0 0 24 24" fill="none">
                      <Path d="M6 6L18 18M6 18L18 6" stroke="#FFF" strokeWidth={1.5} strokeLinecap="round" />
                    </Svg>
                  </Pressable>
                </View>
              </View>

              <Text style={{ fontSize: fp(20), fontWeight: '700', color: '#FFF', lineHeight: fp(26), marginBottom: wp(6) }}>{notification.title}</Text>
              <Text style={{ fontSize: fp(12), color: '#6B7280', marginBottom: wp(16) }}>{humanizeTimestamp(notification.created_at)}</Text>

              <View style={{ height: 0.5, backgroundColor: '#2A303B', marginBottom: wp(16) }} />

              <ScrollView style={{ maxHeight: wp(200) }} showsVerticalScrollIndicator={false}>
                <Text style={{ fontSize: fp(15), color: 'rgba(255,255,255,0.85)', lineHeight: fp(22) }}>{notification.message}</Text>
              </ScrollView>

              <View style={{ height: wp(24) }} />

              {cta ? (
                <Pressable onPress={onCtaPress} style={{ height: wp(52), backgroundColor: '#00D984', borderRadius: wp(14), justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: fp(15), fontWeight: '700', color: '#000' }}>{cta.label + ' →'}</Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
