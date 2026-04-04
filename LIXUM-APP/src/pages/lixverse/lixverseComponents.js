import React from 'react';
import Svg, { Path, Circle, Ellipse, G, Polygon, Rect,
  Text as SvgText, LinearGradient as SvgLinearGradient,
  RadialGradient, Stop, Line } from 'react-native-svg';

const LixGem = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 1C16 7 20 12 20 16C20 20.4 16.4 23 12 23C7.6 23 4 20.4 4 16C4 12 8 7 12 1Z" fill="#007A50" stroke="#00D984" strokeWidth={1.2} />
    <Path d="M12 5C14.5 9 17 12.5 17 15.5C17 18.5 14.8 20.5 12 20.5C9.2 20.5 7 18.5 7 15.5C7 12.5 9.5 9 12 5Z" fill="#009960" stroke="#33E8A0" strokeWidth={0.5} />
    <Ellipse cx={9.5} cy={11} rx={2.5} ry={4} fill="#5DFFB4" opacity={0.3} transform="rotate(-20, 9.5, 11)" />
    <Circle cx={9} cy={8} r={1.5} fill="#FFF" opacity={0.55} />
  </Svg>
);

const MedalIcon = ({ rank, size = 22 }) => {
  const colors = {
    1: { main: '#D4AF37', inner: '#FFD700', shine: '#FFF5CC' },
    2: { main: '#8E9AAF', inner: '#C0C0C0', shine: '#E8E8E8' },
    3: { main: '#A0522D', inner: '#CD7F32', shine: '#E8C8A0' },
  };
  const c = colors[rank] || colors[3];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="10" r="9" fill={c.main} opacity={0.3} />
      <Circle cx="12" cy="10" r="7" fill={c.inner} />
      <Circle cx="12" cy="10" r="5.5" fill={c.main} />
      <SvgText x="12" y="14" fontSize="9" fontWeight="800" fill={c.shine} textAnchor="middle">{rank}</SvgText>
      <Path d="M7 19l2-5h6l2 5-2.5-1.5L12 21l-2.5-2.5L7 19z" fill={c.main} opacity={0.8} />
    </Svg>
  );
};

const TrophyIcon = ({ size = 20, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 4h10v2a5 5 0 01-10 0V4z" fill={color} opacity={0.9} />
    <Path d="M5 4h2v3a3 3 0 01-3-3h1z" fill={color} opacity={0.5} />
    <Path d="M17 4h2a3 3 0 01-3 3V4h1z" fill={color} opacity={0.5} />
    <Rect x="10" y="12" width="4" height="4" rx="1" fill={color} opacity={0.7} />
    <Rect x="8" y="16" width="8" height="2" rx="1" fill={color} />
  </Svg>
);

const MysteryCardIcon = ({ size = 18, color = '#D4AF37' }) => (
  <Svg width={size} height={size * 1.3} viewBox="0 0 18 24">
    <Rect x="1" y="1" width="16" height="22" rx="2.5" fill="rgba(255,255,255,0.06)" stroke={color} strokeWidth="1.2" />
    <Rect x="3" y="3" width="12" height="18" rx="1.5" fill="rgba(255,255,255,0.03)" />
    <SvgText x="9" y="16" fontSize="12" fontWeight="800" fill={color} textAnchor="middle" opacity={0.8}>?</SvgText>
  </Svg>
);

const FragmentIcon = ({ size = 14, color = '#D4AF37' }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path d="M8 1l3 5.5L8 15 5 6.5z" fill={color} opacity={0.8} />
    <Path d="M8 1l3 5.5H5z" fill={color} />
    <Path d="M5 6.5L8 15l-1-4z" fill={color} opacity={0.5} />
  </Svg>
);

const ChevronDown = ({ size = 14, color = 'rgba(255,255,255,0.3)', rotated = false }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" style={rotated ? { transform: [{ rotate: '180deg' }] } : {}}>
    <Path d="M4 6l4 4 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);
