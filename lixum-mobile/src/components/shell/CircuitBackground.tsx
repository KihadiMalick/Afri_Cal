import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Rect, Path } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

// Metallic palette — steel grays with subtle emerald data filaments
const GRID_LINE   = 'rgba(120,130,150,0.04)';
const GRID_ACCENT = 'rgba(120,130,150,0.07)';
const NODE        = 'rgba(120,130,150,0.10)';
const CHIP        = 'rgba(120,130,150,0.06)';
const DOT         = 'rgba(120,130,150,0.12)';
const FILAMENT    = 'rgba(0,229,160,0.05)';
const FILAMENT_B  = 'rgba(0,229,160,0.08)';

/**
 * Full-screen metallic grid with subtle emerald data filaments.
 * Steel gray grid + emerald circuit traces.
 */
export function CircuitBackground() {
  const GRID = 60;
  const cols = Math.ceil(W / GRID) + 1;
  const rows = Math.ceil(H / GRID) + 1;

  const lines: React.ReactNode[] = [];
  let k = 0;

  // Horizontal grid lines — very subtle steel
  for (let r = 0; r < rows; r++) {
    const y = r * GRID;
    lines.push(
      <Line key={k++} x1="0" y1={y} x2={W} y2={y} stroke={GRID_LINE} strokeWidth={0.3} />
    );
  }

  // Vertical grid lines
  for (let c = 0; c < cols; c++) {
    const x = c * GRID;
    lines.push(
      <Line key={k++} x1={x} y1="0" x2={x} y2={H} stroke={GRID_LINE} strokeWidth={0.3} />
    );
  }

  // Brighter accent grid lines (every 4th)
  for (let r = 0; r < rows; r += 4) {
    const y = r * GRID;
    lines.push(
      <Line key={k++} x1="0" y1={y} x2={W} y2={y} stroke={GRID_ACCENT} strokeWidth={0.5} />
    );
  }
  for (let c = 0; c < cols; c += 4) {
    const x = c * GRID;
    lines.push(
      <Line key={k++} x1={x} y1="0" x2={x} y2={H} stroke={GRID_ACCENT} strokeWidth={0.5} />
    );
  }

  // Intersection nodes (small circles at every 4th intersection)
  for (let r = 0; r < rows; r += 4) {
    for (let c = 0; c < cols; c += 4) {
      lines.push(
        <Circle key={k++} cx={c * GRID} cy={r * GRID} r={2} fill="none" stroke={NODE} strokeWidth={0.5} />
      );
    }
  }

  // Filled dots at select intersections
  for (let r = 1; r < rows; r += 5) {
    for (let c = 2; c < cols; c += 6) {
      lines.push(
        <Circle key={k++} cx={c * GRID} cy={r * GRID} r={1.2} fill={DOT} />
      );
    }
  }

  // Chip rectangles — brushed metal feel
  const chipPositions = [
    [2, 1], [6, 3], [1, 6], [4, 8], [8, 2], [3, 10], [7, 6], [1, 12], [5, 11], [9, 9],
  ];
  for (const [c, r] of chipPositions) {
    if (c < cols && r < rows) {
      const cx = c * GRID - 8;
      const cy = r * GRID - 8;
      lines.push(
        <Rect key={k++} x={cx} y={cy} width={14} height={14} fill="none" stroke={CHIP} strokeWidth={0.4} rx={2} />
      );
      lines.push(
        <Line key={k++} x1={cx + 3} y1={cy} x2={cx + 3} y2={cy - 5} stroke={CHIP} strokeWidth={0.3} />,
        <Line key={k++} x1={cx + 11} y1={cy} x2={cx + 11} y2={cy - 5} stroke={CHIP} strokeWidth={0.3} />,
        <Line key={k++} x1={cx + 3} y1={cy + 14} x2={cx + 3} y2={cy + 19} stroke={CHIP} strokeWidth={0.3} />,
        <Line key={k++} x1={cx + 11} y1={cy + 14} x2={cx + 11} y2={cy + 19} stroke={CHIP} strokeWidth={0.3} />,
      );
    }
  }

  // Emerald data filaments — circuit traces
  const traces = [
    `M ${GRID * 1} ${GRID * 2} L ${GRID * 2} ${GRID * 2} L ${GRID * 2} ${GRID * 4}`,
    `M ${GRID * 5} ${GRID * 1} L ${GRID * 5} ${GRID * 3} L ${GRID * 7} ${GRID * 3}`,
    `M ${GRID * 3} ${GRID * 7} L ${GRID * 5} ${GRID * 7} L ${GRID * 5} ${GRID * 9} L ${GRID * 7} ${GRID * 9}`,
    `M ${GRID * 1} ${GRID * 9} L ${GRID * 1} ${GRID * 11} L ${GRID * 3} ${GRID * 11}`,
    `M ${GRID * 7} ${GRID * 1} L ${GRID * 9} ${GRID * 1} L ${GRID * 9} ${GRID * 4}`,
    `M ${GRID * 2} ${GRID * 13} L ${GRID * 4} ${GRID * 13} L ${GRID * 4} ${GRID * 15}`,
  ];
  for (const d of traces) {
    lines.push(
      <Path key={k++} d={d} fill="none" stroke={FILAMENT} strokeWidth={0.7} />
    );
  }

  // Brighter emerald traces
  const brightTraces = [
    `M ${GRID * 3} ${GRID * 4} L ${GRID * 4} ${GRID * 4} L ${GRID * 4} ${GRID * 6}`,
    `M ${GRID * 6} ${GRID * 5} L ${GRID * 8} ${GRID * 5}`,
  ];
  for (const d of brightTraces) {
    lines.push(
      <Path key={k++} d={d} fill="none" stroke={FILAMENT_B} strokeWidth={0.9} />
    );
  }

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]} pointerEvents="none">
      <Svg width={W} height={H}>
        {lines}
      </Svg>
    </View>
  );
}
