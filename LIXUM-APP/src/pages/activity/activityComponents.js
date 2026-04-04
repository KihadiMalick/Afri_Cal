import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, TouchableOpacity,
  Animated, Modal, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  G, Line, Circle, Path, Rect, Ellipse, Defs,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { wp, fp } from '../../constants/layout';
import {
  ACTIVITY_DATA, T, getLang, calcCalories, calcWater,
} from './activityConstants';

// ── Décors SVG du chemin de marche ──

const TreeIcon = ({ x, y, passed }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Rect x={-1.5} y={0} width={3} height={8} fill="#8B6914" opacity={0.6} />
    <Circle cx={0} cy={-4} r={7} fill="#00D984" opacity={passed ? 0.4 : 0.25} />
    <Circle cx={-4} cy={-2} r={5} fill="#00D984" opacity={passed ? 0.35 : 0.2} />
    <Circle cx={4} cy={-2} r={5} fill="#00D984" opacity={passed ? 0.35 : 0.2} />
    {passed && (
      <Ellipse cx={6} cy={4} rx={2} ry={1} fill="#00D984" opacity={0.3}
        transform="rotate(45, 6, 4)" />
    )}
  </G>
);

const BenchIcon = ({ x, y }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Rect x={-8} y={-1} width={16} height={2} rx={1} fill="#8892A0" opacity={0.5} />
    <Rect x={-7} y={-5} width={14} height={2} rx={1} fill="#8892A0" opacity={0.4} />
    <Line x1={-6} y1={1} x2={-6} y2={5} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={6} y1={1} x2={6} y2={5} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={-6} y1={-5} x2={-6} y2={-1} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
    <Line x1={6} y1={-5} x2={6} y2={-1} stroke="#8892A0" strokeWidth={1.5} opacity={0.4} />
  </G>
);

const BirdsIcon = ({ x, y, passed }) => (
  <G transform={`translate(${x}, ${y - (passed ? 5 : 0)})`}>
    <Path d={`M${-4} ${0} Q${-2} ${-3} ${0} ${0}`} fill="none" stroke="#8892A0" strokeWidth={1.2} opacity={passed ? 0.3 : 0.5} />
    <Path d={`M${3} ${-4} Q${5} ${-7} ${7} ${-4}`} fill="none" stroke="#8892A0" strokeWidth={1.2} opacity={passed ? 0.25 : 0.45} />
    <Path d={`M${-7} ${-3} Q${-5} ${-6} ${-3} ${-3}`} fill="none" stroke="#8892A0" strokeWidth={1} opacity={passed ? 0.2 : 0.4} />
  </G>
);

const PondIcon = ({ x, y }) => (
  <G transform={`translate(${x}, ${y})`}>
    <Ellipse cx={0} cy={4} rx={14} ry={8} fill="#4DA6FF" opacity={0.15} />
    <Ellipse cx={0} cy={4} rx={12} ry={6} fill="#4DA6FF" opacity={0.1} />
    <Path d="M-8 3 Q-4 1 0 3 Q4 5 8 3" fill="none" stroke="#4DA6FF" strokeWidth={0.8} opacity={0.3} />
    <Path d="M-6 6 Q-2 4 2 6 Q6 8 10 6" fill="none" stroke="#4DA6FF" strokeWidth={0.6} opacity={0.2} />
    <Ellipse cx={0} cy={1} rx={4} ry={2.5} fill="#FFB800" opacity={0.6} />
    <Circle cx={-3} cy={-1} r={2.5} fill="#FFB800" opacity={0.6} />
    <Path d="M-5.5 -1 L-7 -0.5 L-5.5 0" fill="#FF8C42" opacity={0.7} />
    <Circle cx={-3.5} cy={-1.5} r={0.6} fill="#0D1117" />
  </G>
);

// === PHASES SUIVANTES ===
