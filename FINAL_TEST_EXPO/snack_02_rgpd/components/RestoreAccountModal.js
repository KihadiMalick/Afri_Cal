import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { T } from '../mockT';

var COLORS = {
  bgCard: '#1A1D22',
  bgInner: '#0F131A',
  borderSubtle: '#2A303B',
  borderAccent: 'rgba(0,217,132,0.4)',
  emerald: '#00D984',
  emeraldHover: '#00B871',
  textPrimary: '#FFFFFF',
  textSecondary: '#B8BEC5',
  textTertiary: '#6B7280',
  danger: '#FF6B6B',
  dangerMuted: 'rgba(255,107,107,0.3)',
  warning: '#FFA500',
  overlay: 'rgba(0,0,0,0.85)'
};

function formatDateFR(isoStr) {
  if (!isoStr) return '';
  var d = new Date(isoStr);
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = d.getFullYear();
  return day + '/' + month + '/' + year;
}

function computeDaysLeft(isoStr) {
  if (!isoStr) return 0;
  var scheduled = new Date(isoStr).getTime();
  var now = Date.now();
  var diff = scheduled - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function pickBadgeColor(days) {
  if (days > 10) return COLORS.emerald;
  if (days >= 3) return COLORS.warning;
  return COLORS.danger;
}

function RestoreAccountModal(props) {
  var visible = props.visible;
  var deletionPending = props.deletionPending;
  var onRestore = props.onRestore;
  var onRejectAndSignOut = props.onRejectAndSignOut;
  var isRestoring = props.isRestoring;
  var language = props.language || 'FR';

  var t = language === 'EN' ? T.en : T.fr;

  var _showDoubleConfirm = useState(false);
  var showDoubleConfirm = _showDoubleConfirm[0];
  var setShowDoubleConfirm = _showDoubleConfirm[1];

  var pulseAnim = useRef(new Animated.Value(1)).current;
  var mountedHapticRef = useRef(false);

  var scheduledDateISO = deletionPending ? deletionPending.scheduledDeletionAt : null;
  var formattedDate = formatDateFR(scheduledDateISO);
  var daysLeft = computeDaysLeft(scheduledDateISO);
  var badgeColor = pickBadgeColor(daysLeft);
  var isUrgent = daysLeft < 3;

  var bodyText = t.restoreModalBody.replace('{date}', formattedDate);
  var badgeLabel = (daysLeft > 1 ? t.restoreDaysLeft : t.restoreDayLeftSingular).replace('{n}', String(daysLeft));

  useEffect(function() {
    if (visible && !mountedHapticRef.current) {
      mountedHapticRef.current = true;
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    }
    if (!visible) {
      mountedHapticRef.current = false;
      setShowDoubleConfirm(false);
    }
  }, [visible]);

  useEffect(function() {
    if (isUrgent && visible) {
      var loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.55, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true })
        ])
      );
      loop.start();
      return function() { loop.stop(); };
    }
    pulseAnim.setValue(1);
  }, [isUrgent, visible]);

  function handleRestore() {
    if (isRestoring) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    onRestore();
  }

  function handleOpenDoubleConfirm() {
    if (isRestoring) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}
    setShowDoubleConfirm(true);
  }

  function handleCancelDoubleConfirm() {
    setShowDoubleConfirm(false);
  }

  function handleConfirmRejectFinal() {
    if (isRestoring) return;
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (e) {}
    setShowDoubleConfirm(false);
    onRejectAndSignOut();
  }

  var doubleBody = t.restoreRejectDoubleConfirmBody.replace('{date}', formattedDate);

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={function() { if (!isRestoring) onRejectAndSignOut(); }}>
      <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <View style={{ backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 24, width: '100%', maxWidth: 420, borderWidth: 1, borderColor: COLORS.borderAccent }}>
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <Animated.View style={{ opacity: isUrgent ? pulseAnim : 1, width: 64, height: 64, borderRadius: 32, backgroundColor: isUrgent ? 'rgba(255,107,107,0.15)' : 'rgba(0,217,132,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 2, borderColor: badgeColor + '55' }}>
              <Text style={{ fontSize: 32 }}>{isUrgent ? '⚠' : '♻️'}</Text>
            </Animated.View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' }}>
              {t.restoreModalTitle}
            </Text>
          </View>

          <View style={{ backgroundColor: COLORS.bgInner, borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 22, textAlign: 'center' }}>
              {bodyText}
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Animated.View style={{ opacity: isUrgent ? pulseAnim : 1, backgroundColor: badgeColor + '20', borderWidth: 1.5, borderColor: badgeColor + '60', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 }}>
              <Text style={{ fontSize: 12, color: badgeColor, fontWeight: '800', letterSpacing: 1 }}>
                {badgeLabel.toUpperCase()}
              </Text>
            </Animated.View>
          </View>

          {isRestoring ? (
            <View style={{ paddingVertical: 18, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={COLORS.emerald} />
            </View>
          ) : (
            <View>
              <Pressable
                onPress={handleRestore}
                style={function(s) {
                  return {
                    paddingVertical: 15,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: COLORS.emerald,
                    opacity: s.pressed ? 0.88 : 1,
                    marginBottom: 10
                  };
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#000', letterSpacing: 0.5 }}>
                  {'✓  '}{t.restoreConfirmButton}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleOpenDoubleConfirm}
                style={function(s) {
                  return {
                    paddingVertical: 13,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: COLORS.dangerMuted,
                    opacity: s.pressed ? 0.7 : 1
                  };
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.danger }}>
                  {t.restoreRejectButton}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Modal visible={showDoubleConfirm} transparent={true} animationType="fade" onRequestClose={handleCancelDoubleConfirm}>
          <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <View style={{ backgroundColor: COLORS.bgCard, borderRadius: 20, padding: 22, width: '100%', maxWidth: 400, borderWidth: 1, borderColor: COLORS.dangerMuted }}>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,107,107,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 26 }}>{'⚠'}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' }}>
                  {t.restoreRejectDoubleConfirmTitle}
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, textAlign: 'center', marginBottom: 20 }}>
                {doubleBody}
              </Text>
              <Pressable
                onPress={handleConfirmRejectFinal}
                style={function(s) {
                  return {
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: COLORS.danger,
                    opacity: s.pressed ? 0.85 : 1,
                    marginBottom: 8
                  };
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>
                  {t.restoreRejectDoubleConfirmButton}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCancelDoubleConfirm}
                style={function(s) {
                  return {
                    paddingVertical: 12,
                    alignItems: 'center',
                    opacity: s.pressed ? 0.7 : 1
                  };
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.emerald }}>
                  {t.restoreRejectCancel}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

export default RestoreAccountModal;
