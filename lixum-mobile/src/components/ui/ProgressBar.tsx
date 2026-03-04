import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, type ViewStyle } from 'react-native';
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
  height = 4,
  style,
  gradientColors = ['#FF4444', '#FF8C00', '#FFD700', '#00C896'],
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
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    borderRadius: 9999,
    overflow: 'hidden',
  },
});
