/**
 * GradientBar – SVG gradient progress bar (no expo-linear-gradient dependency)
 * Cross-platform alternative using react-native-svg.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface GradientBarProps {
  /** Progress from 0 to 1 */
  progress: number;
  /** Bar height in px */
  height?: number;
  /** Gradient stop colors [start, end] */
  colors?: [string, string];
}

export function GradientBar({
  progress,
  height = 8,
  colors = ['#00ff9d', '#00e5ff'],
}: GradientBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const r = height / 2;

  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.track, { height, borderRadius: r }]} />
      {clamped > 0 && (
        <View style={[StyleSheet.absoluteFill, { width: `${clamped * 100}%` as any }]}>
          <Svg width="100%" height={height}>
            <Defs>
              <LinearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors[0]} stopOpacity="1" />
                <Stop offset="1" stopColor={colors[1]} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height={height} rx={r} ry={r} fill="url(#gradBar)" />
          </Svg>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,
  },
  track: {
    width: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
});
