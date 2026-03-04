import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Rect } from 'react-native-svg';

const LINE = 'rgba(0,255,157,0.10)';
const NODE = 'rgba(0,255,157,0.16)';
const CHIP = 'rgba(0,255,157,0.09)';

export function CircuitBackground() {
  const T = 80;

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <Svg width="100%" height="100%">
        {/* Horizontal lines */}
        <Line x1="0" y1="20" x2={T * 6} y2="20" stroke={LINE} strokeWidth={0.4} />
        <Line x1="0" y1="60" x2={T * 6} y2="60" stroke={LINE} strokeWidth={0.4} />
        <Line x1="0" y1={T + 20} x2={T * 6} y2={T + 20} stroke={LINE} strokeWidth={0.4} />
        <Line x1="0" y1={T + 60} x2={T * 6} y2={T + 60} stroke={LINE} strokeWidth={0.4} />
        {/* Vertical lines */}
        <Line x1="20" y1="0" x2="20" y2={T * 12} stroke={LINE} strokeWidth={0.4} />
        <Line x1="60" y1="0" x2="60" y2={T * 12} stroke={LINE} strokeWidth={0.4} />
        <Line x1={T + 20} y1="0" x2={T + 20} y2={T * 12} stroke={LINE} strokeWidth={0.4} />
        <Line x1={T + 60} y1="0" x2={T + 60} y2={T * 12} stroke={LINE} strokeWidth={0.4} />
        {/* Crosshair nodes */}
        <Circle cx="20" cy="20" r="2" fill="none" stroke={NODE} strokeWidth={0.5} />
        <Circle cx="60" cy="20" r="2" fill="none" stroke={NODE} strokeWidth={0.5} />
        <Circle cx="20" cy="60" r="2" fill="none" stroke={NODE} strokeWidth={0.5} />
        <Circle cx="60" cy="60" r="2" fill="none" stroke={NODE} strokeWidth={0.5} />
        <Circle cx={T + 20} cy={T + 20} r="2" fill="none" stroke={NODE} strokeWidth={0.5} />
        <Circle cx={T + 60} cy={T + 60} r="2" fill="none" stroke={NODE} strokeWidth={0.5} />
        {/* Chip rects */}
        <Rect x="36" y="36" width="8" height="8" fill="none" stroke={CHIP} strokeWidth={0.4} rx="1" />
        <Rect x={T + 36} y={T + 36} width="8" height="8" fill="none" stroke={CHIP} strokeWidth={0.4} rx="1" />
      </Svg>
    </View>
  );
}
