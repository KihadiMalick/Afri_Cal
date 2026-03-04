import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTokens } from '@/context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  vitality?: boolean;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Glass-morphism card — semi-transparent so the dark background
 * and circuit lines show through, like a glass tablet.
 */
export function GlassCard({ children, vitality = false, style, padding = 'md' }: GlassCardProps) {
  const tk = useTokens();
  const pad = padding === 'sm' ? 16 : padding === 'lg' ? 24 : 20;

  if (vitality) {
    return (
      <LinearGradient
        colors={['rgba(0,255,157,0.06)', 'rgba(0,255,157,0.02)']}
        start={{ x: 0.15, y: 0.08 }}
        end={{ x: 0.85, y: 0.92 }}
        style={[
          styles.vitalityCard,
          {
            borderColor: 'rgba(0,255,157,0.18)',
            padding: pad,
          },
          glassWebShadow,
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.10)',
          padding: pad,
        },
        glassWebShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Legacy compat alias
export function Card({ children, padding = 'md', style }: { children: React.ReactNode; padding?: 'sm' | 'md' | 'lg'; style?: ViewStyle }) {
  return <GlassCard padding={padding} style={style}>{children}</GlassCard>;
}

const glassWebShadow: ViewStyle = Platform.select({
  web: {
    // @ts-ignore — web-only backdrop filter for true glass effect
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  } as any,
  default: {},
});

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
