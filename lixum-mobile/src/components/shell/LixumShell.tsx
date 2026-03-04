import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * LixumShell — Full-screen gradient background.
 * Replaces all geometric SVG/circuit patterns with a smooth vertical gradient.
 */
export function LixumShell({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={['#0D1117', '#0F1923', '#0D1117', '#0A0F14']}
      locations={[0, 0.35, 0.7, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
