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
 * Premium glass-morphism card with emerald-tinted borders.
 * backdrop-filter: blur(24px) saturate(180%) on web.
 */
export function GlassCard({ children, vitality = false, style, padding = 'md' }: GlassCardProps) {
  const tk = useTokens();
  const pad = padding === 'sm' ? 16 : padding === 'lg' ? 28 : 22;

  if (vitality) {
    return (
      <LinearGradient
        colors={['rgba(0,201,150,0.10)', 'rgba(0,201,150,0.03)']}
        start={{ x: 0.15, y: 0.08 }}
        end={{ x: 0.85, y: 0.92 }}
        style={[
          styles.vitalityCard,
          {
            borderColor: 'rgba(0,201,150,0.22)',
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
          borderColor: 'rgba(0,201,150,0.15)',
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
    // @ts-ignore — web-only for true glass effect
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    transition: 'border-color 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  } as any,
  default: {},
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  vitalityCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
