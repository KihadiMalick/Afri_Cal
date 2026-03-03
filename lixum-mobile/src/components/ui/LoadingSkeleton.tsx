import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width = '100%', height = 20, radius = 24, style }: SkeletonProps) {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1700 }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [-200, 200]) }],
  }));

  return (
    <View style={[{ width: width as any, height, borderRadius: radius, overflow: 'hidden' }, style]}>
      <View style={[StyleSheet.absoluteFill, {
        backgroundColor: isDark ? 'rgba(0,255,157,0.04)' : 'rgba(0,140,70,0.06)',
      }]} />
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={
            isDark
              ? ['transparent', 'rgba(0,255,157,0.10)', 'rgba(0,255,157,0.07)', 'transparent']
              : ['transparent', 'rgba(0,140,70,0.16)', 'rgba(0,140,70,0.10)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

// Alias for backward compat
export const LoadingSkeleton = SkeletonLoader;

export function DashboardSkeleton() {
  return (
    <View style={skStyles.container}>
      <SkeletonLoader height={180} radius={32} style={skStyles.item} />
      <View style={skStyles.row}>
        <SkeletonLoader height={100} radius={28} style={skStyles.flex} />
        <SkeletonLoader height={100} radius={28} style={skStyles.flex} />
      </View>
      <SkeletonLoader height={120} radius={28} style={skStyles.item} />
      <SkeletonLoader height={200} radius={28} style={skStyles.item} />
    </View>
  );
}

const skStyles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  item: { marginBottom: 0 },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
