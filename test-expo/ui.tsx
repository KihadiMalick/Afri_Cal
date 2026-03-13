/**
 * LIXUM UI Components — Self-contained for test preview
 * GlassCard, Button, Input, ProgressBar, LixumLogo
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Image,
  type ViewStyle,
  type TextStyle,
  type TextInputProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { DARK, spacing, borderRadius } from './theme';

const tk = DARK;

/* ================================================================
   GLASS CARD
   ================================================================ */
interface GlassCardProps {
  children: React.ReactNode;
  vitality?: boolean;
  metalButton?: boolean;
  style?: ViewStyle;
  padding?: 'sm' | 'md' | 'lg';
}

export function GlassCard({ children, vitality, metalButton, style, padding = 'md' }: GlassCardProps) {
  const pad = padding === 'sm' ? 14 : padding === 'lg' ? 24 : 20;

  if (vitality) {
    return (
      <View style={[gcStyles.shadow, gcStyles.vitalityShadow, style]}>
        <View style={{ borderRadius: 16, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#2E3440', '#1B1F26', '#1E232B', '#1B1F26']}
            locations={[0, 0.3, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[gcStyles.card, { padding: pad }]}
          >
            <View style={gcStyles.topHighlight} />
            {children}
          </LinearGradient>
        </View>
      </View>
    );
  }

  if (metalButton) {
    return (
      <View style={[gcStyles.shadow, style]}>
        <View style={{ borderRadius: 14, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#2E3440', '#1B1F26', '#252B35', '#1B1F26']}
            locations={[0, 0.3, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[gcStyles.metalBtn, { padding: pad }]}
          >
            <View style={gcStyles.metalHighlight} />
            {children}
          </LinearGradient>
        </View>
      </View>
    );
  }

  return (
    <View style={[gcStyles.shadow, style]}>
      <View style={{ borderRadius: 16, overflow: 'hidden' }}>
        <LinearGradient
          colors={['#2E3440', '#1B1F26', '#252B35', '#1B1F26']}
          locations={[0, 0.3, 0.6, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[gcStyles.card, { padding: pad }]}
        >
          <View style={gcStyles.topHighlight} />
          {children}
        </LinearGradient>
      </View>
    </View>
  );
}

export const Card = GlassCard;

const gcStyles = StyleSheet.create({
  shadow: {
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
  metalBtn: {
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
  metalHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#6B7B8D',
    opacity: 0.35,
  },
});

/* ================================================================
   BUTTON
   ================================================================ */
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title, onPress, variant = 'primary', size = 'md',
  fullWidth, loading, disabled, style, textStyle,
}: ButtonProps) {
  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: tk.accent },
    secondary: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: tk.cardBorder },
    accent: { backgroundColor: tk.accent },
    danger: { backgroundColor: tk.red },
  };
  const textColorMap: Record<string, string> = {
    primary: '#000', secondary: tk.t1, accent: '#000', danger: '#FFF',
  };
  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'] },
  };
  const textSizes: Record<string, number> = { sm: 13, md: 15, lg: 17 };

  return (
    <TouchableOpacity
      style={[
        btnStyles.base, variantStyles[variant], sizeStyles[size],
        fullWidth && btnStyles.full, disabled && btnStyles.disabled, style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <Text style={[btnStyles.text, { color: textColorMap[variant], fontSize: textSizes[size] }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const btnStyles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius.md },
  full: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '700' },
});

/* ================================================================
   INPUT
   ================================================================ */
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={inputStyles.container}>
      {label && <Text style={[inputStyles.label, { color: tk.t3 }]}>{label}</Text>}
      <TextInput
        style={[
          inputStyles.input,
          { backgroundColor: tk.inputBg, color: tk.t1, borderColor: error ? tk.red : tk.cardBorder },
          style,
        ]}
        placeholderTextColor={tk.t4}
        {...props}
      />
      {error && <Text style={[inputStyles.error, { color: tk.red }]}>{error}</Text>}
    </View>
  );
}

const inputStyles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
  input: { borderWidth: 1, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 16 },
  error: { fontSize: 12, marginTop: spacing.xs },
});

/* ================================================================
   PROGRESS BAR
   ================================================================ */
export function ProgressBar({
  percent, height = 8, style,
  gradientColors = ['#2A303B', '#00897B', '#00BFA6', '#00D984'],
}: {
  percent: number; height?: number; style?: ViewStyle;
  gradientColors?: string[];
}) {
  const fillAnim = useSharedValue(0);
  useEffect(() => {
    fillAnim.value = withTiming(Math.min(percent, 100) / 100, {
      duration: 1200, easing: Easing.out(Easing.ease),
    });
  }, [percent]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillAnim.value * 100}%` as any,
  }));

  return (
    <View style={[pbStyles.track, { height }, style]}>
      <Animated.View style={[pbStyles.fill, { height }, fillStyle]}>
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const pbStyles = StyleSheet.create({
  track: { borderRadius: 4, backgroundColor: '#1C2330', overflow: 'hidden' },
  fill: { borderRadius: 4, overflow: 'hidden' },
});

/* ================================================================
   SKELETON LOADER
   ================================================================ */
export function SkeletonLoader({ width = '100%' as any, height = 20, radius = 16, style }: {
  width?: number | string; height?: number; radius?: number; style?: ViewStyle;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1700 }), -1, true);
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-200, 200]) }],
  }));

  return (
    <View style={[{ width: width as any, height, borderRadius: radius, overflow: 'hidden', borderWidth: 1, borderColor: '#3E4855' }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1B1F26' }]} />
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,217,132,0.08)', 'rgba(0,217,132,0.05)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

/* ================================================================
   LIXUM LOGO / NEON X
   ================================================================ */
const FONT_BOLD = Platform.OS === 'web' ? 'Poppins_700Bold, sans-serif' : 'Poppins_700Bold';
const FONT_BLACK = Platform.OS === 'web' ? 'Poppins_900Black, sans-serif' : 'Poppins_900Black';
const FONT_MEDIUM = Platform.OS === 'web' ? 'Poppins_500Medium, sans-serif' : 'Poppins_500Medium';

export function NeonX({ size = 16 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: size, color: '#9CA3AF', fontFamily: FONT_BOLD, fontWeight: '700', letterSpacing: 1 }}>L</Text>
      <Text style={{
        fontSize: size, color: '#00D984', fontFamily: FONT_BLACK, fontWeight: '900', letterSpacing: 1,
        textShadowColor: 'rgba(0,217,132,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
      }}>X</Text>
    </View>
  );
}

export function LixumLogo({ size = 14, showSub = true }: { size?: number; showSub?: boolean }) {
  const scale = size / 14;
  return (
    <Image
      source={require('./assets/lixum-logo.png')}
      resizeMode="contain"
      style={{ width: 135 * scale, height: 42 * scale }}
    />
  );
}

const logoStyles = StyleSheet.create({
  ring: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(0,217,132,0.25)',
    backgroundColor: 'rgba(0,217,132,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  brand: {
    fontSize: 14, fontWeight: '800', letterSpacing: 4,
    color: '#EAEEF3', fontFamily: FONT_BOLD,
  },
  sub: {
    fontSize: 7, fontWeight: '500', textTransform: 'uppercase',
    letterSpacing: 3, color: '#555E6C', fontFamily: FONT_MEDIUM,
  },
});
