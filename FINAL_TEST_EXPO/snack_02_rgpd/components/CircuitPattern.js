import React from 'react';
import Svg, { Line, Circle, Rect } from 'react-native-svg';

export default function CircuitPattern(props) {
  var width = props.width;
  var height = props.height;
  var color = props.color || 'rgba(0, 217, 132, 0.06)';
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Line x1="20" y1={height * 0.15} x2={width * 0.35} y2={height * 0.15} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.35} cy={height * 0.15} r="2" fill={color} />
      <Line x1={width * 0.35} y1={height * 0.15} x2={width * 0.35} y2={height * 0.25} stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.65} y1={height * 0.12} x2={width - 20} y2={height * 0.12} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.65} cy={height * 0.12} r="2" fill={color} />
      <Line x1={width * 0.65} y1={height * 0.12} x2={width * 0.65} y2={height * 0.20} stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.65} y1={height * 0.20} x2={width * 0.75} y2={height * 0.20} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.75} cy={height * 0.20} r="1.5" fill={color} />
      <Line x1="15" y1={height * 0.50} x2="15" y2={height * 0.60} stroke={color} strokeWidth="0.8" />
      <Line x1="15" y1={height * 0.60} x2={width * 0.20} y2={height * 0.60} stroke={color} strokeWidth="0.8" />
      <Rect x={width * 0.20 - 3} y={height * 0.60 - 3} width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.70} y1={height * 0.75} x2={width - 15} y2={height * 0.75} stroke={color} strokeWidth="0.8" />
      <Line x1={width - 15} y1={height * 0.75} x2={width - 15} y2={height * 0.85} stroke={color} strokeWidth="0.8" />
      <Circle cx={width - 15} cy={height * 0.85} r="2" fill={color} />
      <Line x1={width * 0.15} y1={height * 0.82} x2={width * 0.30} y2={height * 0.82} stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.30} y1={height * 0.82} x2={width * 0.30} y2={height * 0.90} stroke={color} strokeWidth="0.8" />
      <Rect x={width * 0.30 - 3} y={height * 0.90 - 3} width="6" height="6" rx="1" fill="none" stroke={color} strokeWidth="0.8" />
      <Line x1={width * 0.30 + 3} y1={height * 0.90} x2={width * 0.45} y2={height * 0.90} stroke={color} strokeWidth="0.8" />
      <Circle cx={width * 0.45} cy={height * 0.90} r="1.5" fill={color} />
      <Circle cx={width * 0.50} cy={height * 0.30} r="1" fill={color} />
      <Circle cx={width * 0.85} cy={height * 0.45} r="1" fill={color} />
      <Circle cx={width * 0.25} cy={height * 0.70} r="1" fill={color} />
    </Svg>
  );
}
