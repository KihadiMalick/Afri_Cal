import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({ width = '100%', height = 20, radius = 16, style }: SkeletonProps) {
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
    <View style={[{ width: width as any, height, borderRadius: radius, overflow: 'hidden', borderWidth: 1, borderColor: '#2A2A2A' }, style]}>
      <View style={[StyleSheet.absoluteFill, {
        backgroundColor: '#1A1A1A',
      }]} />
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,200,150,0.08)', 'rgba(0,200,150,0.05)', 'transparent']}
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
      {/* Header skeleton */}
      <View style={skStyles.headerRow}>
        <SkeletonLoader width={140} height={36} radius={10} />
        <SkeletonLoader width={80} height={20} radius={8} />
      </View>
      {/* Vitality card */}
      <SkeletonLoader height={200} radius={16} style={skStyles.item} />
      {/* 3 metric cards */}
      <View style={skStyles.row}>
        <SkeletonLoader height={110} radius={14} style={skStyles.flex} />
        <SkeletonLoader height={110} radius={14} style={skStyles.flex} />
        <SkeletonLoader height={110} radius={14} style={skStyles.flex} />
      </View>
      {/* Meals card */}
      <SkeletonLoader height={140} radius={16} style={skStyles.item} />
      {/* Activity card */}
      <SkeletonLoader height={160} radius={16} style={skStyles.item} />
    </View>
  );
}

const skStyles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  item: { marginBottom: 0 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
});
