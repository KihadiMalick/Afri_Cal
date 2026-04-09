import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

var W = Dimensions.get('window').width;

var ICONS = {
  confirm: '⚠️',
  error: '❌',
  success: '✅',
  info: 'ℹ️',
};

var ICON_BG = {
  confirm: 'rgba(255,140,66,0.15)',
  error: 'rgba(255,107,138,0.15)',
  success: 'rgba(0,217,132,0.15)',
  info: 'rgba(77,166,255,0.15)',
};

var BUTTON_COLOR = {
  confirm: '#00D984',
  error: '#FF6B8A',
  success: '#00D984',
  info: '#4DA6FF',
};

export default function LixumModal(props) {
  var visible = props.visible || false;
  var type = props.type || 'info';
  var title = props.title || '';
  var message = props.message || '';
  var onConfirm = props.onConfirm;
  var onCancel = props.onCancel;
  var onClose = props.onClose;
  var confirmText = props.confirmText || 'Confirmer';
  var cancelText = props.cancelText || 'Annuler';

  var scaleAnim = useRef(new Animated.Value(0.9)).current;
  var opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(function() {
    if (visible) {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  var handleClose = function() {
    Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(function() {
      if (onClose) onClose();
    });
  };

  var handleConfirm = function() {
    Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(function() {
      if (onConfirm) onConfirm();
    });
  };

  var handleCancel = function() {
    Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(function() {
      if (onCancel) onCancel();
      else if (onClose) onClose();
    });
  };

  var btnColor = BUTTON_COLOR[type] || '#00D984';

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={handleClose}>
      <Animated.View style={{
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center',
        opacity: opacityAnim,
      }}>
        <Animated.View style={{
          width: W * 0.85, transform: [{ scale: scaleAnim }],
        }}>
          <LinearGradient
            colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
            style={{
              borderRadius: 16, borderWidth: 1.5, borderColor: '#4A4F55',
              padding: 24, alignItems: 'center',
            }}
          >
            {/* Icon */}
            <View style={{
              width: 48, height: 48, borderRadius: 24,
              backgroundColor: ICON_BG[type] || ICON_BG.info,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{ fontSize: 22 }}>{ICONS[type] || ICONS.info}</Text>
            </View>

            {/* Title */}
            {title ? (
              <Text style={{
                fontSize: 16, fontWeight: '700', color: '#EAEEF3',
                textAlign: 'center', marginTop: 12,
              }}>{title}</Text>
            ) : null}

            {/* Message */}
            {message ? (
              <Text style={{
                fontSize: 12, color: '#AAA', textAlign: 'center',
                marginTop: 8, lineHeight: 18,
              }}>{message}</Text>
            ) : null}

            {/* Buttons */}
            <View style={{ width: '100%', marginTop: 20 }}>
              {type === 'confirm' ? (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Pressable
                    onPress={handleCancel}
                    style={function(state) {
                      return {
                        flex: 1, paddingVertical: 12, borderRadius: 10,
                        borderWidth: 1, borderColor: '#4A4F55',
                        alignItems: 'center',
                        opacity: state.pressed ? 0.7 : 1,
                      };
                    }}
                  >
                    <Text style={{ color: '#888', fontSize: 13, fontWeight: '600' }}>{cancelText}</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleConfirm}
                    style={function(state) {
                      return {
                        flex: 1, paddingVertical: 12, borderRadius: 10,
                        borderWidth: 1, borderColor: btnColor,
                        alignItems: 'center',
                        opacity: state.pressed ? 0.7 : 1,
                      };
                    }}
                  >
                    <Text style={{ color: btnColor, fontSize: 13, fontWeight: '600' }}>{confirmText}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={handleClose}
                  style={function(state) {
                    return {
                      paddingVertical: 12, borderRadius: 10,
                      borderWidth: 1, borderColor: btnColor,
                      alignItems: 'center',
                      opacity: state.pressed ? 0.7 : 1,
                    };
                  }}
                >
                  <Text style={{ color: btnColor, fontSize: 13, fontWeight: '600' }}>OK</Text>
                </Pressable>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
