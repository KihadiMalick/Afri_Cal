import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Path, Circle, Ellipse, Line, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { wp, fp } from '../../constants/layout';
import LockIcon from './LockIcon';

const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'medicai', label: 'MedicAi', iconActive: 'medkit', iconInactive: 'medkit-outline', isMedicAi: true },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'lixverse', label: 'LixVerse', iconActive: 'planet', iconInactive: 'planet-outline', isLixVerse: true },
];

const AvatarButton = ({ activeChar, userName, onPress, size = 30 }) => {
  const charEmojis = { 'emerald_owl': '🦉', 'hawk_eye': '🦅', 'ruby_tiger': '🐯', 'amber_fox': '🦊', 'gipsy': '🕷️', 'jade_phoenix': '🔥', 'silver_wolf': '🐺', 'boukki': '🦴', 'iron_rhino': '🦏', 'coral_dolphin': '🐬' };
  const emoji = activeChar?.slug ? charEmojis[activeChar.slug] : null;
  const initial = (userName || 'U').charAt(0).toUpperCase();
  const borderColor = emoji ? '#00D984' : '#4DA6FF';
  return (
    <TouchableOpacity onPress={onPress} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: borderColor + '15', borderWidth: 1.5, borderColor: borderColor + '50', justifyContent: 'center', alignItems: 'center' }}>
      {emoji ? <Text style={{ fontSize: size * 0.55 }}>{emoji}</Text> : <Text style={{ fontSize: size * 0.45, fontWeight: '800', color: borderColor }}>{initial}</Text>}
    </TouchableOpacity>
  );
};

const BottomTabs = ({ activeTab, onTabPress }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#1E2530',
      borderTopWidth: 1,
      borderTopColor: 'rgba(74,79,85,0.5)',
      paddingTop: 8,
      paddingBottom: Platform.OS === 'android' ? 12 : 28,
      height: Platform.OS === 'android' ? 62 : 80,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 20,
    }}
  >
    {TABS.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: wp(4) }}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <View style={{ position: 'relative' }}>
            {tab.isMedicAi ? (
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Defs>
                  <SvgLinearGradient id="medicGrad" x1="0.5" y1="0" x2="0.5" y2="1">
                    <Stop offset="0%" stopColor="#FF6B8A" />
                    <Stop offset="100%" stopColor="#FF3B5C" />
                  </SvgLinearGradient>
                </Defs>
                <Rect x="8" y="2" width="8" height="20" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Rect x="2" y="8" width="20" height="8" rx="2" fill="url(#medicGrad)" opacity={active ? 1 : 0.5} />
                <Path d="M12 11.5c.5-.8 1.5-1 2-.5s.5 1.5 0 2.5l-2 2-2-2c-.5-1-.5-2 0-2.5s1.5-.3 2 .5z"
                  fill="white" opacity={0.7} />
              </Svg>
            ) : tab.isLixVerse ? (
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Circle cx="12" cy="12" r="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={1.2} opacity={active ? 0.9 : 0.5} />
                <Ellipse cx="12" cy="12" rx="4" ry="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.8} opacity={active ? 0.6 : 0.3} />
                <Ellipse cx="12" cy="12" rx="7.5" ry="10" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.6} opacity={active ? 0.4 : 0.2} />
                <Ellipse cx="12" cy="8" rx="9" ry="2.5" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.7} opacity={active ? 0.5 : 0.25} />
                <Line x1="2" y1="12" x2="22" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.8} opacity={active ? 0.5 : 0.3} />
                <Ellipse cx="12" cy="16" rx="9" ry="2.5" fill="none" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.7} opacity={active ? 0.5 : 0.25} />
                <Circle cx="12" cy="2.5" r={1.3} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                <Circle cx="5" cy="5.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="19" cy="5.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="3" cy="12" r={1.2} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                <Circle cx="21" cy="12" r={1.2} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                <Circle cx="8" cy="8" r={1} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.8 : 0.3} />
                <Circle cx="16" cy="8" r={1} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.8 : 0.3} />
                <Circle cx="12" cy="12" r={1.3} fill={active ? "#FFFFFF" : "#8892A0"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="7" cy="15.5" r={1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.8 : 0.35} />
                <Circle cx="17" cy="15.5" r={1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.8 : 0.35} />
                <Circle cx="5.5" cy="18.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="18.5" cy="18.5" r={1.1} fill={active ? "#00D984" : "#6B7B8D"} opacity={active ? 0.9 : 0.4} />
                <Circle cx="12" cy="21.5" r={1.3} fill={active ? "#5DFFB4" : "#6B7B8D"} opacity={active ? 1 : 0.5} />
                <Line x1="12" y1="2.5" x2="8" y2="8" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.5 : 0.2} />
                <Line x1="12" y1="2.5" x2="16" y2="8" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.5 : 0.2} />
                <Line x1="8" y1="8" x2="12" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="16" y1="8" x2="12" y2="12" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="12" y1="12" x2="7" y2="15.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="12" y1="12" x2="17" y2="15.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="7" y1="15.5" x2="12" y2="21.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
                <Line x1="17" y1="15.5" x2="12" y2="21.5" stroke={active ? "#00D984" : "#6B7B8D"} strokeWidth={0.5} opacity={active ? 0.4 : 0.2} />
              </Svg>
            ) : (
              <Ionicons
                name={active ? tab.iconActive : tab.iconInactive}
                size={24}
                color={active ? '#00D984' : '#6B7B8D'}
              />
            )}
            {tab.locked && (
              <View style={{
                position: 'absolute', top: -3, right: -6,
                backgroundColor: 'rgba(21,27,35,0.9)', borderRadius: 6,
                width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
              }}>
                <LockIcon size={10} />
              </View>
            )}
          </View>
          <Text style={[
            { color: '#6B7B8D', fontSize: 10, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },
            active && (tab.isMedicAi ? { color: '#FF3B5C' } : { color: '#00D984' }),
            tab.isMedicAi && !active && { color: '#8892A0' },
            tab.isLixVerse && !active && { color: '#6B7B8D' },
          ]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export { AvatarButton };
export default BottomTabs;
