import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';

const PULSE_COLOR = 'rgba(0,255,157,0.18)';
const RING_COLOR = 'rgba(0,255,157,0.10)';

export function HeartbeatPulse() {
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

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      <Animated.View style={[{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: PULSE_COLOR, position: 'absolute',
      }, pulseStyle]} />
      <Animated.View style={[{
        width: sizeRing, height: sizeRing, borderRadius: sizeRing / 2,
        borderWidth: 1, borderColor: RING_COLOR,
        backgroundColor: 'transparent', position: 'absolute',
      }, ringStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
