import React from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  vitality?: boolean;
  metalButton?: boolean;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Premium Metallic Card System v2:
 * - Default: metallic gradient panel
 * - vitality: hero card with deeper shadows
 * - metalButton: clickable stat card with press depth
 */
export function GlassCard({
  children,
  vitality = false,
  metalButton = false,
  style,
  padding = 'md',
}: GlassCardProps) {
  const pad = padding === 'sm' ? 14 : padding === 'lg' ? 24 : 20;

  /* ---- Vitality hero card ---- */
  if (vitality) {
    return (
      <View style={[styles.cardShadow, styles.vitalityShadow, style]}>
        <View style={{ borderRadius: 16, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#2E3440', '#1B1F26', '#1E232B', '#1B1F26']}
            locations={[0, 0.3, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.vitalityCard, { padding: pad }]}
          >
            {/* Metallic shine top highlight */}
            <View style={styles.topHighlight} />
            {children}
          </LinearGradient>
        </View>
      </View>
    );
  }

  /* ---- Metal button card (stat cards) ---- */
  if (metalButton) {
    return (
      <View style={[styles.cardShadow, style]}>
        <View style={{ borderRadius: 14, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#2E3440', '#1B1F26', '#252B35', '#1B1F26']}
            locations={[0, 0.3, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.metalButtonInner, { padding: pad }]}
          >
            <View style={styles.metalTopHighlight} />
            {children}
          </LinearGradient>
        </View>
      </View>
    );
  }

  /* ---- Default: metallic panel ---- */
  return (
    <View style={[styles.cardShadow, style]}>
      <View style={{ borderRadius: 16, overflow: 'hidden' }}>
        <LinearGradient
          colors={['#2E3440', '#1B1F26', '#252B35', '#1B1F26']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { padding: pad }]}
        >
          <View style={styles.topHighlight} />
          {children}
        </LinearGradient>
      </View>
    </View>
  );
}

// Legacy compat
export function Card({ children, padding = 'md', style }: { children: React.ReactNode; padding?: 'sm' | 'md' | 'lg'; style?: ViewStyle }) {
  return <GlassCard padding={padding} style={style}>{children}</GlassCard>;
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  vitalityShadow: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#3E4855',
    overflow: 'hidden',
  },
  vitalityCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#3E4855',
    overflow: 'hidden',
  },
  metalButtonInner: {
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#3E4855',
    overflow: 'hidden',
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    backgroundColor: '#6B7B8D',
    opacity: 0.35,
  },
  metalTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#6B7B8D',
    opacity: 0.35,
  },
});
