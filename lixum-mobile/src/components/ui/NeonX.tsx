import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTokens } from '@/context/ThemeContext';

interface NeonXProps {
  size?: number;
}

export function NeonX({ size = 16 }: NeonXProps) {
  const tk = useTokens();
  return (
    <View style={styles.container}>
      <Text style={[styles.letter, { fontSize: size, color: tk.logoLetter }]}>LI</Text>
      <Text style={[styles.xLetter, {
        fontSize: size,
        color: tk.accent,
        textShadowColor: 'rgba(0,255,157,0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 12,
      }]}>X</Text>
      <Text style={[styles.letter, { fontSize: size, color: tk.logoLetter }]}>UM</Text>
    </View>
  );
}

export function LixumLogo({ size = 14, showSub = true }: { size?: number; showSub?: boolean }) {
  const tk = useTokens();
  return (
    <View style={styles.logoWrap}>
      <NeonX size={size} />
      {showSub && (
        <Text style={[styles.subText, { color: tk.lixumSubColor }]}>
          Bio-Digital Dashboard
        </Text>
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
    fontFamily: 'Courier New',
    fontWeight: '700',
    letterSpacing: 2,
  },
  xLetter: {
    fontFamily: 'Courier New',
    fontWeight: '700',
    letterSpacing: 2,
  },
  logoWrap: {
    alignItems: 'flex-start',
    gap: 2,
  },
  subText: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
});
