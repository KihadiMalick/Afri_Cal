import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTokens } from '@/context/ThemeContext';
import { CircuitBackground } from './CircuitBackground';
import { HeartbeatPulse } from './HeartbeatPulse';

export function LixumShell({ children }: { children: React.ReactNode }) {
  const tokens = useTokens();

  return (
    <View style={[styles.container, { backgroundColor: tokens.mainBg }]}>
      <CircuitBackground />
      <HeartbeatPulse />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
