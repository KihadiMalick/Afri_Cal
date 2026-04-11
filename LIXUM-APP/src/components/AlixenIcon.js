import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

function AlixenIcon(props) {
  var size = props.size || 32;

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx="16" cy="16" r="15" fill="#060B12" stroke="#00D984" strokeWidth={0.6} opacity={0.7} />

      <Ellipse cx="9" cy="12" rx="4.5" ry="8" fill="none" stroke="#4DA6FF" strokeWidth={1} opacity={0.85} />
      <Path d="M7 6 Q11 9 7 12 Q11 15 7 18" fill="none" stroke="#B0BEC5" strokeWidth={0.6} opacity={0.5} strokeLinecap="round" />
      <Path d="M11 6 Q7 9 11 12 Q7 15 11 18" fill="none" stroke="#B0BEC5" strokeWidth={0.6} opacity={0.5} strokeLinecap="round" />
      <Circle cx="9" cy="12" r="1" fill="#FFFFFF" opacity={0.4} />

      <Ellipse cx="23" cy="19" rx="4.5" ry="8" fill="none" stroke="#4DA6FF" strokeWidth={1} opacity={0.85} />
      <Path d="M21 13 Q25 16 21 19 Q25 22 21 25" fill="none" stroke="#B0BEC5" strokeWidth={0.6} opacity={0.5} strokeLinecap="round" />
      <Path d="M25 13 Q21 16 25 19 Q21 22 25 25" fill="none" stroke="#B0BEC5" strokeWidth={0.6} opacity={0.5} strokeLinecap="round" />
      <Circle cx="23" cy="19" r="1" fill="#FFFFFF" opacity={0.4} />

      <Circle cx="14" cy="14" r="0.8" fill="#FF8C42" opacity={0.85} />
      <Circle cx="16" cy="16" r="1" fill="#FF8C42" />
      <Circle cx="18" cy="17" r="0.8" fill="#FF8C42" opacity={0.85} />
      <Circle cx="15" cy="18" r="0.6" fill="#FF8C42" opacity={0.45} />
      <Circle cx="17" cy="14" r="0.6" fill="#FF8C42" opacity={0.45} />
    </Svg>
  );
}

module.exports = AlixenIcon;
