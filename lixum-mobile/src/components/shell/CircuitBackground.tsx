import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Rect } from 'react-native-svg';
import { useTheme } from '@/context/ThemeContext';

export function CircuitBackground() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';
  const lineColor = isDark ? 'rgba(0,255,157,0.10)' : 'rgba(0,150,80,0.12)';
  const circleColor = isDark ? 'rgba(0,255,157,0.16)' : 'rgba(0,150,80,0.18)';
  const rectColor = isDark ? 'rgba(0,255,157,0.09)' : 'rgba(0,150,80,0.10)';

  const TILE = 80;

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        {/* Horizontal lines */}
        <Line x1="0" y1="20" x2={TILE * 6} y2="20" stroke={lineColor} strokeWidth={0.4} />
        <Line x1="0" y1="60" x2={TILE * 6} y2="60" stroke={lineColor} strokeWidth={0.4} />
        <Line x1="0" y1={TILE + 20} x2={TILE * 6} y2={TILE + 20} stroke={lineColor} strokeWidth={0.4} />
        <Line x1="0" y1={TILE + 60} x2={TILE * 6} y2={TILE + 60} stroke={lineColor} strokeWidth={0.4} />
        {/* Vertical lines */}
        <Line x1="20" y1="0" x2="20" y2={TILE * 12} stroke={lineColor} strokeWidth={0.4} />
        <Line x1="60" y1="0" x2="60" y2={TILE * 12} stroke={lineColor} strokeWidth={0.4} />
        <Line x1={TILE + 20} y1="0" x2={TILE + 20} y2={TILE * 12} stroke={lineColor} strokeWidth={0.4} />
        <Line x1={TILE + 60} y1="0" x2={TILE + 60} y2={TILE * 12} stroke={lineColor} strokeWidth={0.4} />
        {/* Crosshair nodes */}
        <Circle cx="20" cy="20" r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Circle cx="60" cy="20" r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Circle cx="20" cy="60" r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Circle cx="60" cy="60" r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Circle cx={TILE + 20} cy={TILE + 20} r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        <Circle cx={TILE + 60} cy={TILE + 60} r="2" fill="none" stroke={circleColor} strokeWidth={0.5} />
        {/* Chip rects */}
        <Rect x="36" y="36" width="8" height="8" fill="none" stroke={rectColor} strokeWidth={0.4} rx="1" />
        <Rect x={TILE + 36} y={TILE + 36} width="8" height="8" fill="none" stroke={rectColor} strokeWidth={0.4} rx="1" />
      </Svg>
    </View>
  );
}
