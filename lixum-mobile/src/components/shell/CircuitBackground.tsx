import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Rect, Path } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

const LINE = 'rgba(0,255,157,0.07)';
const LINE_B = 'rgba(0,255,157,0.12)';
const NODE = 'rgba(0,255,157,0.18)';
const CHIP = 'rgba(0,255,157,0.10)';
const DOT = 'rgba(0,255,157,0.22)';

/**
 * Full-screen circuit-board pattern that shows through glass cards.
 * Grid of tech lines, nodes, chip outlines, and trace paths.
 */
export function CircuitBackground() {
  const GRID = 60;
  const cols = Math.ceil(W / GRID) + 1;
  const rows = Math.ceil(H / GRID) + 1;

  const lines: React.ReactNode[] = [];
  let k = 0;

  // Horizontal grid lines
  for (let r = 0; r < rows; r++) {
    const y = r * GRID;
    lines.push(
      <Line key={k++} x1="0" y1={y} x2={W} y2={y} stroke={LINE} strokeWidth={0.4} />
    );
  }

  // Vertical grid lines
  for (let c = 0; c < cols; c++) {
    const x = c * GRID;
    lines.push(
      <Line key={k++} x1={x} y1="0" x2={x} y2={H} stroke={LINE} strokeWidth={0.4} />
    );
  }

  // Brighter accent lines (every 3rd)
  for (let r = 0; r < rows; r += 3) {
    const y = r * GRID;
    lines.push(
      <Line key={k++} x1="0" y1={y} x2={W} y2={y} stroke={LINE_B} strokeWidth={0.6} />
    );
  }
  for (let c = 0; c < cols; c += 3) {
    const x = c * GRID;
    lines.push(
      <Line key={k++} x1={x} y1="0" x2={x} y2={H} stroke={LINE_B} strokeWidth={0.6} />
    );
  }

  // Intersection nodes (small circles at every 3rd intersection)
  for (let r = 0; r < rows; r += 3) {
    for (let c = 0; c < cols; c += 3) {
      lines.push(
        <Circle key={k++} cx={c * GRID} cy={r * GRID} r={2.5} fill="none" stroke={NODE} strokeWidth={0.6} />
      );
    }
  }

  // Filled dots at select intersections
  for (let r = 1; r < rows; r += 4) {
    for (let c = 2; c < cols; c += 5) {
      lines.push(
        <Circle key={k++} cx={c * GRID} cy={r * GRID} r={1.5} fill={DOT} />
      );
    }
  }

  // Chip rectangles scattered
  const chipPositions = [
    [2, 1], [5, 3], [1, 5], [4, 7], [7, 2], [3, 9], [6, 5], [1, 11], [5, 10], [8, 8],
  ];
  for (const [c, r] of chipPositions) {
    if (c < cols && r < rows) {
      const cx = c * GRID - 8;
      const cy = r * GRID - 8;
      lines.push(
        <Rect key={k++} x={cx} y={cy} width={16} height={16} fill="none" stroke={CHIP} strokeWidth={0.5} rx={2} />
      );
      // Chip pins
      lines.push(
        <Line key={k++} x1={cx + 4} y1={cy} x2={cx + 4} y2={cy - 6} stroke={CHIP} strokeWidth={0.4} />,
        <Line key={k++} x1={cx + 12} y1={cy} x2={cx + 12} y2={cy - 6} stroke={CHIP} strokeWidth={0.4} />,
        <Line key={k++} x1={cx + 4} y1={cy + 16} x2={cx + 4} y2={cy + 22} stroke={CHIP} strokeWidth={0.4} />,
        <Line key={k++} x1={cx + 12} y1={cy + 16} x2={cx + 12} y2={cy + 22} stroke={CHIP} strokeWidth={0.4} />,
      );
    }
  }

  // Trace paths (circuit traces connecting components)
  const traces = [
    `M ${GRID * 1} ${GRID * 2} L ${GRID * 2} ${GRID * 2} L ${GRID * 2} ${GRID * 4}`,
    `M ${GRID * 4} ${GRID * 1} L ${GRID * 4} ${GRID * 3} L ${GRID * 6} ${GRID * 3}`,
    `M ${GRID * 3} ${GRID * 6} L ${GRID * 5} ${GRID * 6} L ${GRID * 5} ${GRID * 8} L ${GRID * 7} ${GRID * 8}`,
    `M ${GRID * 1} ${GRID * 8} L ${GRID * 1} ${GRID * 10} L ${GRID * 3} ${GRID * 10}`,
    `M ${GRID * 6} ${GRID * 1} L ${GRID * 8} ${GRID * 1} L ${GRID * 8} ${GRID * 4}`,
    `M ${GRID * 2} ${GRID * 12} L ${GRID * 4} ${GRID * 12} L ${GRID * 4} ${GRID * 14}`,
  ];
  for (const d of traces) {
    lines.push(
      <Path key={k++} d={d} fill="none" stroke={LINE_B} strokeWidth={0.8} />
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
