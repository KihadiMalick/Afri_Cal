import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ToastMessage(props) {
  var message = props.message;
  var type = props.type || 'info';
  var visible = props.visible;
  var translateY = useRef(new Animated.Value(-80)).current;
  var opacity = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 350, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  var colors = {
    success: { bg: 'rgba(0,217,132,0.12)', border: 'rgba(0,217,132,0.3)', icon: 'checkmark-circle', iconColor: '#00D984' },
    error:   { bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.3)', icon: 'close-circle', iconColor: '#FF6B6B' },
    info:    { bg: 'rgba(77,166,255,0.12)', border: 'rgba(77,166,255,0.3)', icon: 'information-circle', iconColor: '#4DA6FF' },
    warning: { bg: 'rgba(255,140,66,0.12)', border: 'rgba(255,140,66,0.3)', icon: 'warning', iconColor: '#FF8C42' },
  };
  var c = colors[type] || colors.info;

  return (
    <Animated.View style={{
      position: 'absolute', top: 16, left: 20, right: 20, zIndex: 9999,
      transform: [{ translateY: translateY }], opacity: opacity,
    }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: c.bg, borderRadius: 12, borderWidth: 1,
        borderColor: c.border, paddingHorizontal: 16, paddingVertical: 12,
      }}>
        <Ionicons name={c.icon} size={20} color={c.iconColor} />
        <Text style={{ color: '#EAEEF3', fontSize: 13, fontWeight: '500', flex: 1 }}>{message}</Text>
      </View>
    </Animated.View>
  );
}
