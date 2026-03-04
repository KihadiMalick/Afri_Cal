import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTokens } from '@/context/ThemeContext';

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
        textShadowColor: 'rgba(0,229,160,0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      }]}>X</Text>
    </View>
  );
}

export function LixumLogo({ size = 14, showSub = true }: { size?: number; showSub?: boolean }) {
  const tk = useTokens();
  return (
    <View style={styles.logoWrap}>
      {/* Brushed metal LX with emerald ring */}
      <View style={styles.logoRing}>
        <NeonX size={size} />
      </View>
      {showSub && (
        <View style={styles.logoTextCol}>
          <Text style={[styles.brandName, { color: '#B0B8C4' }]}>
            LIXUM
          </Text>
          <Text style={[styles.subText, { color: tk.lixumSubColor }]}>
            Bio-Digital
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
    fontFamily: Platform.OS === 'web' ? 'Outfit_700Bold, sans-serif' : 'Outfit_700Bold',
    fontWeight: '700',
    letterSpacing: 1,
  },
  xLetter: {
    fontFamily: Platform.OS === 'web' ? 'Outfit_900Black, sans-serif' : 'Outfit_900Black',
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
    borderColor: 'rgba(0,229,160,0.25)',
    backgroundColor: 'rgba(0,229,160,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 12px rgba(0,229,160,0.10), inset 0 0 8px rgba(0,229,160,0.05)',
      } as any,
      default: {},
    }),
  },
  logoTextCol: {
    gap: 0,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 3,
    fontFamily: Platform.OS === 'web' ? 'Outfit_700Bold, sans-serif' : 'Outfit_700Bold',
  },
  subText: {
    fontSize: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
});
