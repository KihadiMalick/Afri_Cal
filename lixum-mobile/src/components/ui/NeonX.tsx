import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTokens } from '@/context/ThemeContext';

const FONT_BOLD = Platform.OS === 'web' ? 'Poppins_700Bold, sans-serif' : 'Poppins_700Bold';
const FONT_BLACK = Platform.OS === 'web' ? 'Poppins_900Black, sans-serif' : 'Poppins_900Black';
const FONT_MEDIUM = Platform.OS === 'web' ? 'Poppins_500Medium, sans-serif' : 'Poppins_500Medium';

interface NeonXProps {
  size?: number;
}

/**
 * Brushed metal "LX" logo mark with emerald ring glow.
 */
export function NeonX({ size = 16 }: NeonXProps) {
  const tk = useTokens();
  return (
    <View style={styles.container}>
      <Text style={[styles.letter, { fontSize: size, color: '#9CA3AF' }]}>L</Text>
      <Text style={[styles.xLetter, {
        fontSize: size,
        color: tk.accent,
        textShadowColor: 'rgba(0,200,150,0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      }]}>X</Text>
    </View>
  );
}

export function LixumLogo({ size = 14, showSub = true }: { size?: number; showSub?: boolean }) {
  return (
    <View style={styles.logoWrap}>
      {/* Brushed metal LX with emerald ring */}
      <View style={styles.logoRing}>
        <NeonX size={size} />
      </View>
      {showSub && (
        <View style={styles.logoTextCol}>
          <Text style={styles.brandName}>
            LIXUM
          </Text>
          <Text style={styles.subText}>
            BIO-DIGITAL DASHBOARD
          </Text>
        </View>
      )}
    </View>
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
    borderWidth: 1.5,
    borderColor: 'rgba(0,200,150,0.25)',
    backgroundColor: 'rgba(0,200,150,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 12px rgba(0,200,150,0.10), inset 0 0 8px rgba(0,200,150,0.05)',
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
    color: '#E8E8E8',
    fontFamily: FONT_BOLD,
  },
  subText: {
    fontSize: 7,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: '#888888',
    fontFamily: FONT_MEDIUM,
  },
});
