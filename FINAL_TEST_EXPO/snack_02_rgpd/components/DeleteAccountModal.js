import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, Pressable, TextInput, ActivityIndicator, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { T } from '../mockT';

var COLORS = {
  bgPrimary: '#0A0E14',
  bgCard: '#1A1D22',
  bgInput: '#0F131A',
  borderSubtle: '#2A303B',
  borderIdle: '#4A4F55',
  emerald: '#00D984',
  emeraldMuted: 'rgba(0,217,132,0.3)',
  textPrimary: '#FFFFFF',
  textSecondary: '#B8BEC5',
  textTertiary: '#6B7280',
  danger: '#FF6B6B',
  dangerStrong: '#FF3B30',
  dangerMuted: 'rgba(255,107,107,0.25)',
  warning: '#FFA500',
  warningBg: 'rgba(255,165,0,0.08)',
  overlay: 'rgba(0,0,0,0.82)'
};

function getKeyword(language) {
  return language === 'EN' ? 'DELETE' : 'SUPPRIMER';
}

function ReasonCheckbox(props) {
  var label = props.label;
  var checked = props.checked;
  var onToggle = props.onToggle;
  var disabled = props.disabled;

  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={function(s) {
        return {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: checked ? 'rgba(0,217,132,0.08)' : COLORS.bgInput,
          borderWidth: checked ? 2 : 1,
          borderColor: checked ? COLORS.emerald : COLORS.borderSubtle,
          marginBottom: 8,
          opacity: disabled ? 0.55 : (s.pressed ? 0.8 : 1)
        };
      }}
    >
      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: checked ? COLORS.emerald : COLORS.borderIdle, backgroundColor: checked ? COLORS.emerald : 'transparent', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
        {checked ? <Text style={{ color: '#000', fontSize: 14, fontWeight: '900' }}>{'✓'}</Text> : null}
      </View>
      <Text style={{ flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function DeleteAccountModal(props) {
  var visible = props.visible;
  var onClose = props.onClose;
  var onConfirm = props.onConfirm;
  var isDeleting = props.isDeleting;
  var language = props.language || 'FR';

  var t = language === 'EN' ? T.en : T.fr;
  var keyword = getKeyword(language);

  var _selectedReasons = useState({});
  var selectedReasons = _selectedReasons[0];
  var setSelectedReasons = _selectedReasons[1];

  var _otherText = useState('');
  var otherText = _otherText[0];
  var setOtherText = _otherText[1];

  var _confirmText = useState('');
  var confirmText = _confirmText[0];
  var setConfirmText = _confirmText[1];

  var _keywordMatch = useState(false);
  var keywordMatch = _keywordMatch[0];
  var setKeywordMatch = _keywordMatch[1];

  var _countdown = useState(0);
  var countdown = _countdown[0];
  var setCountdown = _countdown[1];

  var scaleAnim = useRef(new Animated.Value(1)).current;
  var glowAnim = useRef(new Animated.Value(0)).current;

  var reasonKeys = [
    { id: 'no_longer_use', label: t.deleteReasonNoLongerUse },
    { id: 'too_expensive', label: t.deleteReasonTooExpensive },
    { id: 'too_complex', label: t.deleteReasonTooComplex },
    { id: 'bugs', label: t.deleteReasonBugs },
    { id: 'privacy', label: t.deleteReasonPrivacy },
    { id: 'other', label: t.deleteReasonOther }
  ];

  function resetAll() {
    setSelectedReasons({});
    setOtherText('');
    setConfirmText('');
    setKeywordMatch(false);
    setCountdown(0);
    scaleAnim.setValue(1);
    glowAnim.setValue(0);
  }

  useEffect(function() {
    if (!visible) {
      resetAll();
    }
  }, [visible]);

  useEffect(function() {
    var match = confirmText.trim().toUpperCase() === keyword;
    if (match && !keywordMatch) {
      setKeywordMatch(true);
      setCountdown(2);
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: false, friction: 4 }),
        Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false })
      ]).start();
    } else if (!match && keywordMatch) {
      setKeywordMatch(false);
      setCountdown(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false, friction: 5 }),
        Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: false })
      ]).start();
    }
  }, [confirmText]);

  useEffect(function() {
    if (countdown > 0) {
      var timer = setTimeout(function() { setCountdown(countdown - 1); }, 1000);
      return function() { clearTimeout(timer); };
    }
  }, [countdown]);

  function toggleReason(id) {
    if (isDeleting) return;
    try { Haptics.selectionAsync(); } catch (e) {}
    var next = Object.assign({}, selectedReasons);
    if (next[id]) {
      delete next[id];
    } else {
      next[id] = true;
    }
    setSelectedReasons(next);
  }

  function handleClose() {
    if (isDeleting) return;
    onClose();
  }

  function handleConfirm() {
    if (!keywordMatch || countdown > 0 || isDeleting) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    var reasonsArray = [];
    for (var i = 0; i < reasonKeys.length; i++) {
      if (selectedReasons[reasonKeys[i].id]) {
        reasonsArray.push(reasonKeys[i].id);
      }
    }
    onConfirm(reasonsArray, otherText.trim());
  }

  var otherSelected = !!selectedReasons.other;
  var buttonPressable = keywordMatch && countdown === 0 && !isDeleting;

  var buttonBg = buttonPressable ? COLORS.danger : (keywordMatch ? 'rgba(255,107,107,0.45)' : 'rgba(74,79,85,0.35)');
  var buttonTextColor = buttonPressable ? '#FFFFFF' : (keywordMatch ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)');

  var buttonLabel = t.deleteConfirmButton;
  if (keywordMatch && countdown > 0) {
    buttonLabel = t.deleteConfirmCountdown.replace('{s}', String(countdown));
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ backgroundColor: COLORS.bgCard, borderRadius: 20, borderWidth: 1, borderColor: COLORS.dangerMuted, width: '92%', maxWidth: 440, maxHeight: '88%', overflow: 'hidden' }}>
            <ScrollView
              contentContainerStyle={{ padding: 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,107,107,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 22 }}>{'🗑️'}</Text>
                </View>
                <Text style={{ flex: 1, fontSize: 18, fontWeight: '800', color: COLORS.textPrimary }}>
                  {t.deleteAccountTitle}
                </Text>
              </View>

              <View style={{ backgroundColor: COLORS.warningBg, borderWidth: 1, borderColor: 'rgba(255,165,0,0.28)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 }}>
                  {t.deleteAccountWarning}
                </Text>
              </View>

              <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.textTertiary, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>
                {t.deleteReasonSectionTitle}
              </Text>

              {reasonKeys.map(function(r) {
                return (
                  <ReasonCheckbox
                    key={r.id}
                    label={r.label}
                    checked={!!selectedReasons[r.id]}
                    disabled={isDeleting}
                    onToggle={function() { toggleReason(r.id); }}
                  />
                );
              })}

              {otherSelected ? (
                <TextInput
                  value={otherText}
                  onChangeText={setOtherText}
                  placeholder={t.deleteReasonOtherPlaceholder}
                  placeholderTextColor={COLORS.textTertiary}
                  multiline={true}
                  numberOfLines={3}
                  editable={!isDeleting}
                  style={{ backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.borderSubtle, borderRadius: 10, padding: 12, color: COLORS.textPrimary, fontSize: 13, minHeight: 64, textAlignVertical: 'top', marginBottom: 18 }}
                />
              ) : <View style={{ height: 10 }} />}

              <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.textTertiary, letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' }}>
                {t.deleteConfirmSectionTitle}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 }}>
                {t.deleteConfirmLabel}
              </Text>
              <TextInput
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder={t.deleteConfirmPlaceholder}
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isDeleting}
                style={{ backgroundColor: COLORS.bgInput, borderWidth: 1.5, borderColor: keywordMatch ? COLORS.danger : COLORS.borderSubtle, borderRadius: 10, padding: 12, color: keywordMatch ? COLORS.danger : COLORS.textPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 2, textAlign: 'center', marginBottom: 20 }}
              />

              {isDeleting ? (
                <View style={{ paddingVertical: 18, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={COLORS.danger} />
                </View>
              ) : (
                <View>
                  <Animated.View style={{ transform: [{ scale: scaleAnim }], shadowColor: COLORS.danger, shadowOffset: { width: 0, height: 0 }, shadowRadius: 12, shadowOpacity: glowAnim, elevation: keywordMatch ? 8 : 0 }}>
                    <Pressable
                      onPress={handleConfirm}
                      disabled={!buttonPressable}
                      style={function(s) {
                        return {
                          paddingVertical: 15,
                          borderRadius: 12,
                          alignItems: 'center',
                          backgroundColor: buttonBg,
                          borderWidth: 1,
                          borderColor: keywordMatch ? COLORS.dangerStrong : COLORS.borderIdle,
                          opacity: s.pressed && buttonPressable ? 0.85 : 1
                        };
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: '800', color: buttonTextColor, letterSpacing: 0.5 }}>
                        {buttonLabel}
                      </Text>
                    </Pressable>
                  </Animated.View>
                  <Pressable
                    onPress={handleClose}
                    style={function(s) {
                      return {
                        paddingVertical: 14,
                        alignItems: 'center',
                        marginTop: 6,
                        opacity: s.pressed ? 0.6 : 1
                      };
                    }}
                  >
                    <Text style={{ fontSize: 14, color: COLORS.textTertiary, fontWeight: '600' }}>
                      {t.deleteCancelButton}
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export default DeleteAccountModal;
