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
    <View style={[{ width: width as any, height, borderRadius: radius, overflow: 'hidden', borderWidth: 1, borderColor: '#3E4855' }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1B1F26' }]} />
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(0,217,132,0.08)', 'rgba(0,217,132,0.05)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

export const LoadingSkeleton = SkeletonLoader;

export function DashboardSkeleton() {
  return (
    <View style={skStyles.container}>
      <View style={skStyles.headerRow}>
        <SkeletonLoader width={140} height={36} radius={10} />
        <SkeletonLoader width={80} height={20} radius={8} />
      </View>
      {/* Vitality + ECG card */}
      <SkeletonLoader height={280} radius={16} />
      {/* 4 stat cards 2x2 */}
      <View style={skStyles.grid}>
        <SkeletonLoader height={110} radius={14} style={skStyles.gridItem} />
        <SkeletonLoader height={110} radius={14} style={skStyles.gridItem} />
        <SkeletonLoader height={110} radius={14} style={skStyles.gridItem} />
        <SkeletonLoader height={110} radius={14} style={skStyles.gridItem} />
      </View>
      {/* Meals card */}
      <SkeletonLoader height={140} radius={16} />
      {/* Activity card */}
      <SkeletonLoader height={180} radius={16} />
    </View>
  );
}

const skStyles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%' as any, marginBottom: 12 },
});
