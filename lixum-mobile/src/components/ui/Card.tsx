import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  vitality?: boolean;
  /** Brushed metal button panel with neon glow underneath */
  metalButton?: boolean;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Premium card system:
 * - Default: smoked glass panel
 * - vitality: hero card with emerald-tinted smoked glass
 * - metalButton: brushed dark metal panel with neon backlight glow
 */
export function GlassCard({
  children,
  vitality = false,
  metalButton = false,
  style,
  padding = 'md',
}: GlassCardProps) {
  const pad = padding === 'sm' ? 16 : padding === 'lg' ? 28 : 22;

  /* ---- Vitality hero card: smoked glass with emerald tint ---- */
  if (vitality) {
    return (
      <LinearGradient
        colors={['rgba(0,201,150,0.07)', 'rgba(12,16,22,0.85)']}
        start={{ x: 0.15, y: 0.08 }}
        end={{ x: 0.85, y: 0.92 }}
        style={[
          styles.vitalityCard,
          {
            borderColor: 'rgba(0,201,150,0.18)',
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

  /* ---- Metal button card: brushed steel with neon backlight ---- */
  if (metalButton) {
    return (
      <View style={[styles.metalButtonOuter, style]}>
        {/* Neon glow layer behind the button */}
        <View style={styles.neonGlow} />
        {/* Brushed metal surface */}
        <LinearGradient
          colors={['rgba(28,32,40,0.92)', 'rgba(18,22,28,0.96)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.metalButtonInner,
            { padding: pad },
            metalWebShadow,
          ]}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  /* ---- Default: smoked glass panel ---- */
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: 'rgba(18,22,28,0.55)',
          borderColor: 'rgba(120,130,150,0.10)',
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
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    transition: 'border-color 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  } as any,
  default: {},
});

const metalWebShadow: ViewStyle = Platform.select({
  web: {
    // @ts-ignore
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
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
  metalButtonOuter: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  neonGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,229,160,0.06)',
    borderRadius: 20,
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: 'inset 0 0 20px rgba(0,229,160,0.08), 0 0 15px rgba(0,229,160,0.04)',
      } as any,
      default: {},
    }),
  },
  metalButtonInner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(120,130,150,0.12)',
    margin: 2,
    overflow: 'hidden',
  },
});
