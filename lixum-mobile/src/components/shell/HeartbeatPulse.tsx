import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';

export function HeartbeatPulse() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const { width, height } = useWindowDimensions();
  const size = Math.min(width, height) * 0.55;
  const sizeRing = Math.min(width, height) * 0.78;

  const pulseScale = useSharedValue(1);
  const ringScale = useSharedValue(1);

  const E = Easing.bezier(0.36, 0.07, 0.19, 0.97);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 560, easing: E }),
        withTiming(0.97, { duration: 560, easing: E }),
        withTiming(1.09, { duration: 560, easing: E }),
        withTiming(1, { duration: 920, easing: E }),
        withTiming(1, { duration: 400 }),
      ), -1, false
    );
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.22, { duration: 560, easing: E }),
        withTiming(1.12, { duration: 1120, easing: E }),
        withTiming(1, { duration: 2320, easing: E }),
      ), -1, false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const pulseColor = isDark ? 'rgba(0,255,157,0.18)' : 'rgba(0,200,100,0.12)';
  const ringColor = isDark ? 'rgba(0,255,157,0.10)' : 'rgba(0,180,90,0.08)';

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      <Animated.View style={[{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: pulseColor, position: 'absolute',
      }, pulseStyle]} />
      <Animated.View style={[{
        width: sizeRing, height: sizeRing, borderRadius: sizeRing / 2,
        borderWidth: 1, borderColor: ringColor,
        backgroundColor: 'transparent', position: 'absolute',
      }, ringStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
