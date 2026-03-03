import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTokens } from '@/context/ThemeContext';
import { shadows } from '@/theme/shadows';

interface GlassCardProps {
  children: React.ReactNode;
  vitality?: boolean;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
}

export function GlassCard({ children, vitality = false, style, padding = 'md' }: GlassCardProps) {
  const tk = useTokens();
  const pad = padding === 'sm' ? 16 : padding === 'lg' ? 24 : 20;

  if (vitality) {
    return (
      <LinearGradient
        colors={[tk.vCardBg1, tk.vCardBg2]}
        start={{ x: 0.15, y: 0.08 }}
        end={{ x: 0.85, y: 0.92 }}
        style={[styles.vitalityCard, { borderColor: tk.vCardBorder, padding: pad }, shadows.vitalityCard, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: tk.cardBg, borderColor: tk.cardBorder, padding: pad }, shadows.card, style]}>
      {children}
    </View>
  );
}

// Legacy compat alias
export function Card({ children, padding = 'md', style }: { children: React.ReactNode; padding?: 'sm' | 'md' | 'lg'; style?: ViewStyle }) {
  return <GlassCard padding={padding} style={style}>{children}</GlassCard>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  vitalityCard: {
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
