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
 * Premium card system — Metallic Brushed Industrial:
 * - Default: smoked glass panel with metallic tint
 * - vitality: hero card with emerald-tinted smoked glass + depth
 * - metalButton: brushed dark metal panel with neon backlight glow
 */
export function GlassCard({
  children,
  vitality = false,
  metalButton = false,
  style,
  padding = 'md',
}: GlassCardProps) {
  const pad = padding === 'sm' ? 14 : padding === 'lg' ? 28 : 20;

  /* ---- Vitality hero card: smoked glass with emerald tint + metallic depth ---- */
  if (vitality) {
    return (
      <View style={[styles.vitalityOuter, style]}>
        {/* Subtle emerald ambient glow behind the card */}
        <View style={styles.vitalityAmbient} />
        <LinearGradient
          colors={['#1E1E1E', '#252525', '#1E1E1E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.vitalityCard,
            { padding: pad },
            vitalityWebShadow,
          ]}
        >
          {/* Top metallic highlight line */}
          <View style={styles.topHighlight} />
          {children}
        </LinearGradient>
      </View>
    );
  }

  /* ---- Metal button card: brushed steel with neon backlight ---- */
  if (metalButton) {
    return (
      <View style={[styles.metalButtonOuter, style]}>
        {/* Neon glow layer — the "keyboard backlight" behind the button */}
        <View style={styles.neonGlow} />
        {/* Brushed metal surface */}
        <LinearGradient
          colors={['#2A2A2A', '#1E1E1E', '#232323', '#1E1E1E', '#2A2A2A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.metalButtonInner,
            { padding: pad },
            metalWebShadow,
          ]}
        >
          {/* Top highlight — metallic reflection */}
          <View style={styles.metalTopHighlight} />
          {children}
        </LinearGradient>
      </View>
    );
  }

  /* ---- Default: smoked glass panel with metallic tint ---- */
  return (
    <LinearGradient
      colors={['#1E1E1E', '#1A1A1A', '#1E1E1E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        { padding: pad },
        glassWebShadow,
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}

// Legacy compat alias
export function Card({ children, padding = 'md', style }: { children: React.ReactNode; padding?: 'sm' | 'md' | 'lg'; style?: ViewStyle }) {
  return <GlassCard padding={padding} style={style}>{children}</GlassCard>;
}

/* ================================================================== */
/*  Web-specific shadow/blur styles                                    */
/* ================================================================== */
const glassWebShadow: ViewStyle = Platform.select({
  web: {
    // @ts-ignore
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    transition: 'border-color 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)',
  } as any,
  default: {},
});

const vitalityWebShadow: ViewStyle = Platform.select({
  web: {
    // @ts-ignore
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
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
    transition: 'border-color 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.15s ease-out',
  } as any,
  default: {},
});

/* ================================================================== */
/*  Styles                                                             */
/* ================================================================== */
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    overflow: 'hidden',
  },

  /* --- Vitality hero card --- */
  vitalityOuter: {
    position: 'relative',
    borderRadius: 16,
  },
  vitalityAmbient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(0,200,150,0.03)',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: '0 0 60px rgba(0,200,150,0.06)',
      } as any,
      default: {},
    }),
  },
  vitalityCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,200,150,0.18)',
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  /* --- Metal button card --- */
  metalButtonOuter: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'visible',
  },
  neonGlow: {
    position: 'absolute',
    left: -1,
    right: -1,
    top: -1,
    bottom: -1,
    borderRadius: 15,
    backgroundColor: 'rgba(0,200,150,0.08)',
    ...Platform.select({
      web: {
        // @ts-ignore
        boxShadow: 'inset 0 0 24px rgba(0,200,150,0.12), 0 0 20px rgba(0,200,150,0.06)',
      } as any,
      default: {},
    }),
  },
  metalButtonInner: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    overflow: 'hidden',
  },
  metalTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
