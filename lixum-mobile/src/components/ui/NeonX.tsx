import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

const FONT_BOLD = Platform.OS === 'web' ? 'Poppins_700Bold, sans-serif' : 'Poppins_700Bold';
const FONT_BLACK = Platform.OS === 'web' ? 'Poppins_900Black, sans-serif' : 'Poppins_900Black';
const FONT_MEDIUM = Platform.OS === 'web' ? 'Poppins_500Medium, sans-serif' : 'Poppins_500Medium';

interface NeonXProps {
  size?: number;
}

export function NeonX({ size = 16 }: NeonXProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.letter, { fontSize: size, color: '#9CA3AF' }]}>L</Text>
      <Text style={[styles.xLetter, {
        fontSize: size,
        color: '#00D984',
        textShadowColor: 'rgba(0,217,132,0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      }]}>X</Text>
    </View>
  );
}

export function LixumLogo({ size = 14, showSub = true }: { size?: number; showSub?: boolean }) {
  const scale = size / 14;
  return (
    <Image
      source={require('../../../assets/lixum-logo.png')}
      resizeMode="contain"
      style={{ width: 135 * scale, height: 42 * scale }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letter: {
    fontFamily: FONT_BOLD,
    fontWeight: '700',
    letterSpacing: 1,
  },
  xLetter: {
    fontFamily: FONT_BLACK,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoRing: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,217,132,0.25)',
    backgroundColor: 'rgba(0,217,132,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 12px rgba(0,217,132,0.10), inset 0 0 8px rgba(0,217,132,0.05)',
      } as any,
      default: {},
    }),
  },
  logoTextCol: {
    gap: 1,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#EAEEF3',
    fontFamily: FONT_BOLD,
  },
  subText: {
    fontSize: 7,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: '#555E6C',
    fontFamily: FONT_MEDIUM,
  },
});
