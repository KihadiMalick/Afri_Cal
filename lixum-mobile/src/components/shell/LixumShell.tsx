import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { CircuitBackground } from './CircuitBackground';
import { HeartbeatPulse } from './HeartbeatPulse';
import { ECGOverlay } from './ECGOverlay';

export function LixumShell({ children }: { children: React.ReactNode }) {
  const { tokens, transitioning } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: tokens.mainBg }]}>
      <CircuitBackground />
      <HeartbeatPulse />
      <View style={styles.content}>
        {children}
      </View>
      {transitioning && <ECGOverlay />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
