import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay, Easing,
} from 'react-native-reanimated';

/**
 * Three smooth diffuse glow dots — metallic steel + emerald accent.
 * Two steel gray glows + one subtle emerald for depth.
 */
export function HeartbeatPulse() {
  const { width, height } = useWindowDimensions();

  const dots = [
    { x: width * 0.2, y: height * 0.25, size: 200, color: 'rgba(120,130,150,0.04)', delay: 0 },
    { x: width * 0.75, y: height * 0.5, size: 160, color: 'rgba(0,229,160,0.03)', delay: 1200 },
    { x: width * 0.35, y: height * 0.78, size: 180, color: 'rgba(120,130,150,0.03)', delay: 2400 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((dot, i) => (
        <GlowDot key={i} {...dot} />
      ))}
    </View>
  );
}

function GlowDot({ x, y, size, color, delay }: {
  x: number; y: number; size: number; color: string; delay: number;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const E = Easing.bezier(0.4, 0, 0.2, 1);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: E }),
        withTiming(0.3, { duration: 2000, easing: E }),
        withTiming(0.7, { duration: 1500, easing: E }),
        withTiming(0, { duration: 2500, easing: E }),
        withTiming(0, { duration: 1000 }),
      ), -1, false
    ));
    scale.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: E }),
        withTiming(0.9, { duration: 2000, easing: E }),
        withTiming(1.1, { duration: 1500, easing: E }),
        withTiming(0.8, { duration: 2500, easing: E }),
        withTiming(0.8, { duration: 1000 }),
      ), -1, false
    ));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}
