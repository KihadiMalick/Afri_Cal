import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Polygon, Circle, Line, Rect, Ellipse, G,
  Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { wp, fp } from './dashboardConstants';

let _gemIdx = 0;
const LixGemIcon = ({ width = 20, height = 22 }) => {
  const id = useMemo(() => `gem${_gemIdx++}`, []);
  return (
    <Svg width={width} height={height} viewBox="0 0 20 24">
      <Defs>
        <SvgLinearGradient id={`${id}B`} x1="0" y1="0" x2="0.2" y2="1">
          <Stop offset="0%" stopColor="#5DFFB4" />
          <Stop offset="30%" stopColor="#00D984" />
          <Stop offset="65%" stopColor="#00A866" />
          <Stop offset="100%" stopColor="#005C38" />
        </SvgLinearGradient>
        <SvgLinearGradient id={`${id}C`} x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#8AFFDA" />
          <Stop offset="100%" stopColor="#00D984" />
        </SvgLinearGradient>
      </Defs>
      <Polygon points="10,1 2,8 5.5,22 14.5,22 18,8" fill={`url(#${id}B)`} />
      <Polygon points="10,1 2,8 18,8" fill={`url(#${id}C)`} />
      <Polygon points="6.5,8 13.5,8 12,5 8,5" fill="#5DFFB4" opacity={0.35} />
      <Polygon points="2,8 5.5,22 10,8" fill="#00BF78" opacity={0.25} />
      <Polygon points="18,8 14.5,22 10,8" fill="#007A4A" opacity={0.35} />
      <Line x1="2" y1="8" x2="18" y2="8" stroke="#8AFFDA" strokeWidth={0.5} opacity={0.5} />
      <Polygon points="8.5,3.5 10,1.5 11.5,3.5 10,5.5" fill="white" opacity={0.5} />
      <Circle cx="5.5" cy="6.5" r={0.6} fill="white" opacity={0.35} />
    </Svg>
  );
};

let _coinIdx = 0;
const LixCoinIcon = ({ size = 18 }) => {
  const id = useMemo(() => `lxc${_coinIdx++}`, []);
  const s = size;
  const hs = s / 2;
  const hex = [
    `${hs},${0}`,
    `${s},${s * 0.25}`,
    `${s},${s * 0.75}`,
    `${hs},${s}`,
    `${0},${s * 0.75}`,
    `${0},${s * 0.25}`,
  ].join(' ');

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <SvgLinearGradient id={`${id}F`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#2A3A30" />
          <Stop offset="30%" stopColor="#1A2A22" />
          <Stop offset="70%" stopColor="#1E3028" />
          <Stop offset="100%" stopColor="#142018" />
        </SvgLinearGradient>
        <SvgLinearGradient id={`${id}E`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#5DFFB4" />
          <Stop offset="50%" stopColor="#00D984" />
          <Stop offset="100%" stopColor="#00854F" />
        </SvgLinearGradient>
        <SvgLinearGradient id={`${id}L`} x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0%" stopColor="#5DFFB4" />
          <Stop offset="100%" stopColor="#00D984" />
        </SvgLinearGradient>
      </Defs>
      <Polygon points={hex} fill="#00D984" opacity={0.1} transform="translate(0.5, 0.5)" />
      <Polygon points={hex} fill={`url(#${id}F)`} />
      <Polygon points={hex} fill="none" stroke={`url(#${id}E)`} strokeWidth={1.2} />
      <Path d={`M ${hs},0 L ${s},${s * 0.25} L ${hs},${s * 0.35} L 0,${s * 0.25} Z`} fill="#5DFFB4" opacity={0.08} />
      <Path
        d={`M ${s * 0.35},${s * 0.28} L ${s * 0.35},${s * 0.68} L ${s * 0.65},${s * 0.68}`}
        fill="none"
        stroke={`url(#${id}L)`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={s * 0.3} cy={s * 0.3} r={1} fill="white" opacity={0.35} />
    </Svg>
  );
};

const HeartIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="heartGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FF6B8A" />
        <Stop offset="100%" stopColor="#FF3B5C" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#heartGrad)" />
    <Ellipse cx="8" cy="7.5" rx="2.5" ry="1.8" fill="white" opacity={0.25} />
  </Svg>
);

const FlameIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="flameGrad" x1="0.5" y1="1" x2="0.5" y2="0">
        <Stop offset="0%" stopColor="#FF4500" />
        <Stop offset="50%" stopColor="#FF8C42" />
        <Stop offset="100%" stopColor="#FFD700" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M12 2C8.5 7 4 9.5 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2-1-3.5-2-5-.5 1.5-1.5 2.5-3 3-1-4-3-6.5-3-10z" fill="url(#flameGrad)" />
    <Path d="M12 22c-2.21 0-4-1.79-4-4 0-2 2-3.5 3-5.5.5 1 1.5 1.5 2.5 2 .5-1.5 1-3 .5-4.5 1 1.5 2 3.5 2 5.5 0 1.5-.5 2.5-1.5 3.5-.5.5-1.5 1-2.5 1z" fill="#FFD700" opacity={0.5} />
  </Svg>
);

const BoltIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="boltGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FFE066" />
        <Stop offset="100%" stopColor="#FFB800" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="url(#boltGrad)" />
    <Path d="M11 5l-4 7h3.5l-.5 4 4.5-6H11l.5-5z" fill="white" opacity={0.15} />
  </Svg>
);

const DropletIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="dropGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#7DD3FC" />
        <Stop offset="100%" stopColor="#0EA5E9" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M12 2C12 2 5 11 5 16c0 3.87 3.13 7 7 7s7-3.13 7-7c0-5-7-14-7-14z" fill="url(#dropGrad)" />
    <Ellipse cx="9.5" cy="15" rx="2" ry="2.5" fill="white" opacity={0.2} />
  </Svg>
);

const PlateIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="none" stroke="#00D984" strokeWidth={1.5} />
    <Circle cx="12" cy="12" r="6" fill="none" stroke="#00D984" strokeWidth={1} opacity={0.5} />
    <Line x1="2" y1="12" x2="5" y2="12" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" />
    <Line x1="19" y1="12" x2="22" y2="12" stroke="#00D984" strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

const ForkKnifeIcon = () => (
  <Svg width={wp(18)} height={wp(18)} viewBox="0 0 24 24">
    <Path d="M4 16h16c0 2.2-1.8 4-4 4H8c-2.2 0-4-1.8-4-4z" fill="#8892A0" opacity={0.6} />
    <Path d="M2 14h20v2H2z" fill="#8892A0" opacity={0.4} />
    <Path d="M9 8c0-1 .5-3 3-3s3 2 3 3" fill="none" stroke="#8892A0" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
  </Svg>
);

const LightbulbIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="bulbGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FFE066" />
        <Stop offset="100%" stopColor="#FFB800" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" fill="url(#bulbGrad)" />
    <Rect x="9" y="19" width="6" height="1.5" rx="0.75" fill="#FFB800" opacity={0.7} />
    <Rect x="9.5" y="21" width="5" height="1.5" rx="0.75" fill="#FFB800" opacity={0.5} />
    <Path d="M10 12.5C10 11 11 10 12 10s2 1 2 2.5" fill="none" stroke="white" strokeWidth={0.8} opacity={0.4} />
  </Svg>
);

const StatsIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="statsGrad" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0%" stopColor="#00A866" />
        <Stop offset="100%" stopColor="#00D984" />
      </SvgLinearGradient>
    </Defs>
    <Rect x="3" y="14" width="4" height="8" rx="1" fill="url(#statsGrad)" opacity={0.6} />
    <Rect x="10" y="8" width="4" height="14" rx="1" fill="url(#statsGrad)" opacity={0.8} />
    <Rect x="17" y="4" width="4" height="18" rx="1" fill="url(#statsGrad)" />
  </Svg>
);

const StarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#D4AF37" />
  </Svg>
);

const GoalFlag = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id="flagGold" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFE066" />
        <Stop offset="100%" stopColor="#D4AF37" />
      </SvgLinearGradient>
    </Defs>
    <Line x1="5" y1="2" x2="5" y2="22" stroke="#D4AF37" strokeWidth={2} strokeLinecap="round" />
    <Path d="M5 3C5 3 8 1.5 11 4C14 6.5 17 5 19 3V13C17 15 14 16 11 13.5C8 11 5 12.5 5 12.5V3Z" fill="url(#flagGold)" />
    <Circle cx="5" cy="22" r="1.2" fill="#D4AF37" />
  </Svg>
);

const LixGem = ({ size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 1C16 7 20 12 20 16C20 20.4 16.4 23 12 23C7.6 23 4 20.4 4 16C4 12 8 7 12 1Z" fill="#007A50" stroke="#00D984" strokeWidth={1.2} />
    <Path d="M12 5C14.5 9 17 12.5 17 15.5C17 18.5 14.8 20.5 12 20.5C9.2 20.5 7 18.5 7 15.5C7 12.5 9.5 9 12 5Z" fill="#009960" stroke="#33E8A0" strokeWidth={0.5} />
    <Ellipse cx={9.5} cy={11} rx={2.5} ry={4} fill="#5DFFB4" opacity={0.3} transform="rotate(-20, 9.5, 11)" />
    <Circle cx={9} cy={8} r={1.5} fill="#FFF" opacity={0.55} />
  </Svg>
);

const MoodIcon = ({ tier, size = 42, active = false }) => {
  const configs = {
    0: {
      bgColors: ['#2A2E35', '#1E2228'],
      borderColor: '#8892A0',
      glowColor: 'rgba(136,146,160,0.3)',
      face: (s) => (
        <G>
          <Path d={`M${s*0.32} ${s*0.42} Q${s*0.37} ${s*0.47} ${s*0.42} ${s*0.42}`}
                stroke="#8892A0" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
          <Path d={`M${s*0.58} ${s*0.42} Q${s*0.63} ${s*0.47} ${s*0.68} ${s*0.42}`}
                stroke="#8892A0" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
          <Path d={`M${s*0.35} ${s*0.65} Q${s*0.5} ${s*0.58} ${s*0.65} ${s*0.65}`}
                stroke="#8892A0" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
        </G>
      ),
    },
    1: {
      bgColors: ['#1A2E25', '#152820'],
      borderColor: '#00D984',
      glowColor: 'rgba(0,217,132,0.25)',
      face: (s) => (
        <G>
          <Path d={`M${s*0.30} ${s*0.42} L${s*0.42} ${s*0.42}`}
                stroke="#00D984" strokeWidth={2} strokeLinecap="round"/>
          <Path d={`M${s*0.58} ${s*0.42} L${s*0.70} ${s*0.42}`}
                stroke="#00D984" strokeWidth={2} strokeLinecap="round"/>
          <Path d={`M${s*0.35} ${s*0.62} Q${s*0.5} ${s*0.68} ${s*0.65} ${s*0.62}`}
                stroke="#00D984" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
        </G>
      ),
    },
    2: {
      bgColors: ['#1A2535', '#152030'],
      borderColor: '#4DA6FF',
      glowColor: 'rgba(77,166,255,0.25)',
      face: (s) => (
        <G>
          <Circle cx={s*0.37} cy={s*0.40} r={s*0.045} fill="#4DA6FF"/>
          <Circle cx={s*0.63} cy={s*0.40} r={s*0.045} fill="#4DA6FF"/>
          <Path d={`M${s*0.30} ${s*0.58} Q${s*0.5} ${s*0.75} ${s*0.70} ${s*0.58}`}
                stroke="#4DA6FF" strokeWidth={2} fill="none" strokeLinecap="round"/>
        </G>
      ),
    },
    3: {
      bgColors: ['#2E2818', '#282215'],
      borderColor: '#D4AF37',
      glowColor: 'rgba(212,175,55,0.35)',
      face: (s) => (
        <G>
          <Path d={`M${s*0.28} ${s*0.40} Q${s*0.36} ${s*0.32} ${s*0.44} ${s*0.40}`}
                stroke="#D4AF37" strokeWidth={2.2} fill="none" strokeLinecap="round"/>
          <Path d={`M${s*0.56} ${s*0.40} Q${s*0.64} ${s*0.32} ${s*0.72} ${s*0.40}`}
                stroke="#D4AF37" strokeWidth={2.2} fill="none" strokeLinecap="round"/>
          <Circle cx={s*0.36} cy={s*0.33} r={s*0.025} fill="#FFE066"/>
          <Circle cx={s*0.64} cy={s*0.33} r={s*0.025} fill="#FFE066"/>
          <Path d={`M${s*0.28} ${s*0.56} Q${s*0.50} ${s*0.78} ${s*0.72} ${s*0.56}`}
                stroke="#D4AF37" strokeWidth={2.2} fill="none" strokeLinecap="round"/>
          <Path d={`M${s*0.32} ${s*0.58} Q${s*0.50} ${s*0.74} ${s*0.68} ${s*0.58}`}
                fill="#D4AF37" opacity={0.2}/>
          <Line x1={s*0.50} y1={s*0.02} x2={s*0.50} y2={s*0.10}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.45} strokeLinecap="round"/>
          <Line x1={s*0.82} y1={s*0.12} x2={s*0.76} y2={s*0.18}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.35} strokeLinecap="round"/>
          <Line x1={s*0.18} y1={s*0.12} x2={s*0.24} y2={s*0.18}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.35} strokeLinecap="round"/>
          <Line x1={s*0.92} y1={s*0.38} x2={s*0.85} y2={s*0.40}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.3} strokeLinecap="round"/>
          <Line x1={s*0.08} y1={s*0.38} x2={s*0.15} y2={s*0.40}
                stroke="#D4AF37" strokeWidth={1.5} opacity={0.3} strokeLinecap="round"/>
        </G>
      ),
    },
  };

  const config = configs[tier];
  const s = size;

  return (
    <View style={{
      width: s, height: s,
      borderRadius: s / 2,
      shadowColor: config.borderColor,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: active ? 0.9 : 0.3,
      shadowRadius: active ? 14 : 6,
      elevation: active ? 10 : 4,
      transform: [{ scale: active ? 1.15 : 1 }],
    }}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Defs>
          <SvgLinearGradient id={`moodBg${tier}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={config.bgColors[0]} />
            <Stop offset="1" stopColor={config.bgColors[1]} />
          </SvgLinearGradient>
        </Defs>
        <Circle cx={s/2} cy={s/2} r={s/2 - 1} fill="none"
                stroke={config.glowColor} strokeWidth={3}/>
        <Circle cx={s/2} cy={s/2} r={s/2 - 3} fill={`url(#moodBg${tier})`}/>
        <Circle cx={s/2} cy={s/2} r={s/2 - 3} fill="none"
                stroke={config.borderColor} strokeWidth={1.5} opacity={active ? 1 : 0.8}/>
        {config.face(s)}
      </Svg>
    </View>
  );
};

export {
  LixGemIcon, LixCoinIcon,
  HeartIcon, FlameIcon, BoltIcon, DropletIcon, PlateIcon,
  ForkKnifeIcon, LightbulbIcon, StatsIcon, StarIcon, GoalFlag,
  LixGem, MoodIcon,
};
