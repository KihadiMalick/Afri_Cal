import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

var SCREEN_WIDTH = Dimensions.get('window').width;
var SCREEN_HEIGHT = Dimensions.get('window').height;

export default function TechBackground() {
  var W = SCREEN_WIDTH;
  var H = SCREEN_HEIGHT;
  var gridSpacing = 50;
  var lines = [];
  var dots = [];
  for (var y = 0; y < H; y += gridSpacing) {
    lines.push(
      <Line key={'h-' + y} x1="0" y1={y} x2={W} y2={y}
        stroke="rgba(62, 72, 85, 0.25)" strokeWidth="0.5" />
    );
  }
  for (var x = 0; x < W; x += gridSpacing) {
    lines.push(
      <Line key={'v-' + x} x1={x} y1="0" x2={x} y2={H}
        stroke="rgba(62, 72, 85, 0.25)" strokeWidth="0.5" />
    );
  }
  for (var x2 = 0; x2 < W; x2 += gridSpacing * 2) {
    for (var y2 = 0; y2 < H; y2 += gridSpacing * 2) {
      dots.push(
        <Circle key={'d-' + x2 + '-' + y2} cx={x2} cy={y2} r="1.5"
          fill="rgba(0, 217, 132, 0.14)" />
      );
    }
  }
  return (
    <Svg width={W} height={H}
      style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      {lines}
      {dots}
      <Line x1="60" y1={H * 0.35} x2="90" y2={H * 0.35}
        stroke="rgba(0,217,132,0.15)" strokeWidth="1" strokeDasharray="4 3" />
      <Line x1={W - 90} y1={H * 0.35} x2={W - 60} y2={H * 0.35}
        stroke="rgba(0,217,132,0.15)" strokeWidth="1" strokeDasharray="4 3" />
      <Line x1="60" y1={H * 0.42} x2="80" y2={H * 0.42}
        stroke="rgba(62,72,85,0.2)" strokeWidth="0.5" />
      <Line x1={W - 80} y1={H * 0.42} x2={W - 60} y2={H * 0.42}
        stroke="rgba(62,72,85,0.2)" strokeWidth="0.5" />
    </Svg>
  );
}
