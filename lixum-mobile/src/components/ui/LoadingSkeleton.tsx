import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius } from '@/theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadiusSize?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadiusSize = borderRadius.md,
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={style}>
      <Animated.View
        style={[
          {
            width: width as number,
            height,
            borderRadius: borderRadiusSize,
            backgroundColor: theme.border,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View style={skStyles.container}>
      <LoadingSkeleton height={120} style={skStyles.item} />
      <LoadingSkeleton height={80} style={skStyles.item} />
      <LoadingSkeleton height={80} style={skStyles.item} />
      <LoadingSkeleton height={200} style={skStyles.item} />
    </View>
  );
}

const skStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  item: {
    marginBottom: 8,
  },
});
