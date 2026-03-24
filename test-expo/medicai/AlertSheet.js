import React from 'react';
import { View, Text, Modal, Pressable, Dimensions, PixelRatio } from 'react-native';
import Svg, { Path, Line, Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const W = Dimensions.get('window').width;
const BASE_WIDTH = 320;
const wp = (size) => (W / BASE_WIDTH) * size;
const fp = (size) => {
  const scaled = (W / BASE_WIDTH) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaled));
};

const ICONS = {
  warning: {
    bg: 'rgba(255,140,66,0.12)',
    border: 'rgba(255,140,66,0.2)',
    color: '#FF8C42',
    render: (s) => (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FF8C42" strokeWidth="1.5" strokeLinejoin="round" />
        <Line x1="12" y1="9" x2="12" y2="13" stroke="#FF8C42" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="12" cy="16" r="0.5" fill="#FF8C42" />
      </Svg>
    ),
  },
  success: {
    bg: 'rgba(0,217,132,0.12)',
    border: 'rgba(0,217,132,0.2)',
    color: '#00D984',
    render: (s) => (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17l-5-5" stroke="#00D984" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
  error: {
    bg: 'rgba(255,107,107,0.12)',
    border: 'rgba(255,107,107,0.2)',
    color: '#FF6B6B',
    render: (s) => (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Line x1="18" y1="6" x2="6" y2="18" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
        <Line x1="6" y1="6" x2="18" y2="18" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    ),
  },
  info: {
    bg: 'rgba(77,166,255,0.12)',
    border: 'rgba(77,166,255,0.2)',
    color: '#4DA6FF',
    render: (s) => (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke="#4DA6FF" strokeWidth="1.5" />
        <Line x1="12" y1="8" x2="12" y2="12" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" />
        <Circle cx="12" cy="16" r="0.5" fill="#4DA6FF" />
      </Svg>
    ),
  },
  lock: {
    bg: 'rgba(212,175,55,0.12)',
    border: 'rgba(212,175,55,0.2)',
    color: '#D4AF37',
    render: (s) => (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Rect x="5" y="11" width="14" height="10" rx="2" stroke="#D4AF37" strokeWidth="1.5" />
        <Path d="M8 11V7a4 4 0 018 0v4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    ),
  },
  trash: {
    bg: 'rgba(255,107,107,0.12)',
    border: 'rgba(255,107,107,0.2)',
    color: '#FF6B6B',
    render: (s) => (
      <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <Path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
  },
};

export default function AlertSheet({ visible, onClose, title, message, icon = 'info', buttons = [] }) {
  if (!visible) return null;
  const iconConfig = ICONS[icon] || ICONS.info;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={['#2A2F36', '#1E2328', '#252A30']}
            style={{
              borderTopLeftRadius: wp(24),
              borderTopRightRadius: wp(24),
              paddingHorizontal: wp(20),
              paddingTop: wp(12),
              paddingBottom: wp(34),
              alignItems: 'center',
            }}
          >
            {/* Poignée */}
            <View style={{
              width: wp(40), height: wp(4), borderRadius: wp(2),
              backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: wp(20),
            }} />

            {/* Icône */}
            <View style={{
              width: wp(60), height: wp(60), borderRadius: wp(30),
              backgroundColor: iconConfig.bg,
              borderWidth: 1, borderColor: iconConfig.border,
              justifyContent: 'center', alignItems: 'center',
              marginBottom: wp(16),
            }}>
              {iconConfig.render(wp(28))}
            </View>

            {/* Titre */}
            <Text style={{
              fontSize: fp(18), fontWeight: '700', color: '#FFF',
              textAlign: 'center', marginBottom: wp(8),
            }}>
              {title}
            </Text>

            {/* Message */}
            <Text style={{
              fontSize: fp(13), color: 'rgba(255,255,255,0.5)',
              textAlign: 'center', lineHeight: fp(19),
              marginBottom: wp(24), paddingHorizontal: wp(10),
            }}>
              {message}
            </Text>

            {/* Boutons */}
            {buttons.map((btn, i) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';
              return (
                <Pressable
                  key={i}
                  delayPressIn={120}
                  onPress={() => {
                    onClose();
                    if (btn.onPress) btn.onPress();
                  }}
                  style={({ pressed }) => ({
                    width: '100%',
                    paddingVertical: wp(14),
                    borderRadius: wp(14),
                    alignItems: 'center',
                    marginBottom: wp(8),
                    backgroundColor: isCancel
                      ? 'transparent'
                      : isDestructive
                        ? 'rgba(255,107,107,0.1)'
                        : (btn.color ? btn.color + '20' : 'rgba(0,217,132,0.1)'),
                    borderWidth: isCancel ? 1 : isDestructive ? 1 : 0,
                    borderColor: isCancel
                      ? 'rgba(255,255,255,0.1)'
                      : isDestructive
                        ? 'rgba(255,107,107,0.2)'
                        : 'transparent',
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  })}
                >
                  <Text style={{
                    fontSize: fp(15),
                    fontWeight: isCancel ? '500' : '700',
                    color: isCancel
                      ? 'rgba(255,255,255,0.4)'
                      : isDestructive
                        ? '#FF6B6B'
                        : (btn.color || '#00D984'),
                  }}>
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
