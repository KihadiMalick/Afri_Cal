import React from 'react';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

export default function LixIcon(props) {
  var s = props.size || 14;
  return (
    <Svg width={s} height={s} viewBox="0 0 24 24">
      <Path d="M12 1C16 7 20 12 20 16C20 20.4 16.4 23 12 23C7.6 23 4 20.4 4 16C4 12 8 7 12 1Z" fill="#007A50" stroke="#00D984" strokeWidth={1.2} />
      <Path d="M12 5C14.5 9 17 12.5 17 15.5C17 18.5 14.8 20.5 12 20.5C9.2 20.5 7 18.5 7 15.5C7 12.5 9.5 9 12 5Z" fill="#009960" stroke="#33E8A0" strokeWidth={0.5} />
      <Ellipse cx={9.5} cy={11} rx={2.5} ry={4} fill="#5DFFB4" opacity={0.3} transform="rotate(-20, 9.5, 11)" />
      <Circle cx={9} cy={8} r={1.5} fill="#FFF" opacity={0.55} />
    </Svg>
  );
}
