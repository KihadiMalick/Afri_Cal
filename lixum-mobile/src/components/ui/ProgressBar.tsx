import React, { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  percent: number;
  height?: number;
  style?: ViewStyle;
  gradientColors?: string[];
}

export function ProgressBar({
  percent,
  height = 8,
  style,
  gradientColors = ['#2A303B', '#00897B', '#00BFA6', '#00D984'],
}: ProgressBarProps) {
  const fillAnim = useSharedValue(0);

  useEffect(() => {
    fillAnim.value = withTiming(Math.min(percent, 100) / 100, {
      duration: 1200,
      easing: Easing.out(Easing.ease),
    });
  }, [percent]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillAnim.value * 100}%` as any,
  }));

  return (
    <View style={[styles.track, { height }, style]}>
      <Animated.View style={[styles.fill, { height }, fillStyle]}>
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 4,
    backgroundColor: '#1C2330',
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
    overflow: 'hidden',
  },
});
