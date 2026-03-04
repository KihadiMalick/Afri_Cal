import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming,
  useAnimatedStyle, Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

function buildECGPath(cycles = 16): string {
  const W = 130, b = 35;
  let d = `M 0,${b}`;
  for (let i = 0; i < cycles; i++) {
    const x = i * W;
    d += ` L ${x + 15},${b} L ${x + 24},${b - 7} L ${x + 30},${b}`;
    d += ` L ${x + 38},${b} L ${x + 42},${b + 7} L ${x + 47},4 L ${x + 52},${b + 12} L ${x + 57},${b}`;
    d += ` L ${x + 69},${b} L ${x + 75},${b - 8} L ${x + 82},${b - 15} L ${x + 89},${b - 8} L ${x + 95},${b}`;
  }
  d += ` L ${cycles * W + 10},${b}`;
  return d;
}

const ECG_PATH = buildECGPath(16);
const VIEW_W = 16 * 130 + 10;
const PATH_LENGTH = VIEW_W * 1.4;

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function ECGOverlay() {
  const overlayOpacity = useSharedValue(0);
  const dashOffset = useSharedValue(PATH_LENGTH);
  const EASING = Easing.bezier(0.4, 0, 0.2, 1);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 100, easing: EASING });
    dashOffset.value = withTiming(0, { duration: 510, easing: EASING });
    setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 216, easing: EASING });
    }, 764);
  }, []);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
      <Svg
        viewBox={`0 0 ${VIEW_W} 60`}
        width={SCREEN_W}
        height={80}
        preserveAspectRatio="none"
        style={styles.svg}
      >
        <AnimatedPath
          d={ECG_PATH}
          fill="none"
          stroke="#00E5A0"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${PATH_LENGTH}`}
          animatedProps={pathProps}
        />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    zIndex: 9999,
    backgroundColor: 'rgba(4,5,8,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
});
