import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated, Platform, Pressable,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle, Ellipse, Line,
  LinearGradient as SvgLinearGradient, Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { wp, fp, SCREEN_WIDTH, TABS } from './constants';

export const BottomSpacer = () => (
  <View style={{ height: wp(70) }} />
);

export const LockIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill="#8892A0" opacity={0.6} />
    <Path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill="#EAEEF3" />
  </Svg>
);

// ============================================
// BOTTOM TABS (identique aux autres pages)
// ============================================
export const BottomTabs = ({ activeTab, onTabPress }) => (
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
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}
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

// ============================================
// RENDU FORMATÉ — Markdown + Liens Recettes
// ============================================
export const FormattedText = ({ text, style, onRecipePress }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <View>
      {lines.map((line, lineIndex) => {
        if (line.trim() === '') {
          return <View key={lineIndex} style={{ height: 6 }} />;
        }

        const recipeMatch = line.match(/\[RECETTE:(.*?)\]/);
        if (recipeMatch) {
          const recipeName = recipeMatch[1];
          return (
            <TouchableOpacity
              key={lineIndex}
              onPress={() => onRecipePress && onRecipePress(recipeName)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0,217,132,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(0,217,132,0.3)',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginVertical: 4,
              }}
            >
              <Text style={{ fontSize: 16, marginRight: 8 }}>{'🍽️'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#00D984', fontSize: 13, fontWeight: 'bold' }}>
                  {recipeName}
                </Text>
                <Text style={{ color: '#888', fontSize: 9 }}>
                  Appuyez pour voir la recette →
                </Text>
              </View>
              <Text style={{ color: '#00D984', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          );
        }

        const isBullet = line.trim().startsWith('- ');
        const cleanLine = isBullet ? line.trim().substring(2) : line;

        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

        return (
          <View key={lineIndex} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2, paddingLeft: isBullet ? 4 : 0 }}>
            {isBullet && (
              <Text style={[style, { marginRight: 6 }]}>{'\u2022'}</Text>
            )}
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <Text key={partIndex} style={[style, { fontWeight: 'bold', color: '#1A2030' }]}>
                    {part.slice(2, -2)}
                  </Text>
                );
              }
              return <Text key={partIndex} style={style}>{part}</Text>;
            })}
          </View>
        );
      })}
    </View>
  );
};

// ============================================
// SCROLL ARROW — Flèche animée pour indiquer le scroll
// ============================================
export const ScrollArrow = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      alignSelf: 'center',
      marginTop: 4,
      marginBottom: 2,
      transform: [{
        translateY: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 6],
        }),
      }],
    }}>
      <Text style={{ color: 'rgba(0,160,130,0.4)', fontSize: 20 }}>↓</Text>
    </Animated.View>
  );
};

// Parse ALIXEN_DATA du texte brut (filet de sécurité côté app)
export const parseAlixenResponse = (rawText) => {
  if (!rawText) return { cleanText: '', pendingAction: null };
  let pendingAction = null;
  let cleanText = rawText;
  const dataMatch = rawText.match(/\[ALIXEN_DATA\]([\s\S]*?)\[\/ALIXEN_DATA\]/);
  if (dataMatch) {
    cleanText = rawText.replace(/\[ALIXEN_DATA\][\s\S]*?\[\/ALIXEN_DATA\]/, '').trim();
    try {
      let rawJson = dataMatch[1].trim().replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '');
      const parsed = JSON.parse(rawJson);
      pendingAction = parsed.pending_action || null;
    } catch (e) {
    }
  }
  return { cleanText, pendingAction };
};

// Parse les [CHOIX:X:texte] dans le texte
export const parseQuickReplies = (text) => {
  if (!text) return { cleanText: '', choices: [] };
  const choices = [];
  const regex = /\[CHOIX:([^:]+):([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    choices.push({ key: match[1], label: match[2] });
  }
  const cleanText = text.replace(/\[CHOIX:[^\]]+\]/g, '').trim();
  return { cleanText, choices };
};

// Composant boutons Quick Reply
export const QuickReplyButtons = ({ choices, onPress, onPreciser }) => {
  if (!choices || choices.length === 0) return null;
  return (
    <View style={{ marginTop: wp(10), gap: wp(6) }}>
      {choices.map((choice, i) => {
        const isPreciser = choice.key === 'PRÉCISER' || choice.key === 'PRECISER';
        return (
          <Pressable
            key={i}
            delayPressIn={120}
            onPress={() => isPreciser ? (onPreciser && onPreciser()) : (onPress && onPress(choice.label))}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isPreciser ? 'rgba(0,0,0,0.03)' : 'rgba(0,217,132,0.06)',
              borderRadius: wp(12),
              paddingVertical: wp(10),
              paddingHorizontal: wp(14),
              borderWidth: 1,
              borderColor: isPreciser ? 'rgba(0,0,0,0.08)' : 'rgba(0,217,132,0.15)',
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            {!isPreciser && (
              <View style={{
                width: wp(22), height: wp(22), borderRadius: wp(11),
                backgroundColor: 'rgba(0,217,132,0.12)',
                justifyContent: 'center', alignItems: 'center',
                marginRight: wp(10),
              }}>
                <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#00D984' }}>{choice.key}</Text>
              </View>
            )}
            {isPreciser && (
              <Svg width={wp(16)} height={wp(16)} viewBox="0 0 24 24" fill="none" style={{ marginRight: wp(10) }}>
                <Path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5"/>
              </Svg>
            )}
            <Text style={{
              fontSize: fp(13),
              fontWeight: isPreciser ? '400' : '500',
              color: isPreciser ? 'rgba(0,0,0,0.4)' : '#2D3436',
              flex: 1,
            }}>
              {choice.label}
            </Text>
            {!isPreciser && (
              <Text style={{ fontSize: fp(14), color: 'rgba(0,217,132,0.4)' }}>{"›"}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

// ============================================
// FORMATTED RESPONSE TEXT — Parse **bold** markdown
// ============================================
export const FormattedResponseText = ({ text, style }) => {
  if (!text) return null;

  const tagRegex = /\[(TITRE|ALERTE|INFO|SUCCESS|PRIX)\]([\s\S]*?)\[\/\1\]|\[SECTION:([\s\S]*?)\]([\s\S]*?)\[\/SECTION\]/;
  const elements = [];
  let remaining = text;
  let key = 0;
  let safety = 0;

  const renderLine = (line, lineKey) => {
    if (line.trim() === '') return <View key={lineKey} style={{ height: 6 }} />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text key={lineKey} style={[style, { marginBottom: 2 }]}>
        {parts.map((p, pi) => {
          if (p.startsWith('**') && p.endsWith('**')) {
            return <Text key={pi} style={{ fontWeight: 'bold', color: '#1A2030' }}>{p.slice(2, -2)}</Text>;
          }
          return <Text key={pi}>{p}</Text>;
        })}
      </Text>
    );
  };

  const renderLines = (block) => {
    block.split('\n').forEach((line) => { elements.push(renderLine(line, key++)); });
  };

  while (remaining.length > 0 && safety < 200) {
    safety++;
    const match = remaining.match(tagRegex);
    if (!match) { renderLines(remaining); break; }
    if (match.index > 0) renderLines(remaining.substring(0, match.index));

    const tagType = match[1] || 'SECTION';
    const tagContent = match[1] ? match[2] : match[4];
    const sectionTitle = match[3] || '';

    if (tagType === 'TITRE') {
      elements.push(
        <View key={key++} style={{ marginBottom: wp(10), marginTop: wp(4) }}>
          <Text style={{ fontSize: fp(16), fontWeight: '800', color: '#00D984', letterSpacing: 0.3 }}>{tagContent.trim()}</Text>
          <View style={{ height: 2, backgroundColor: 'rgba(0,217,132,0.2)', borderRadius: 1, marginTop: wp(4), width: '40%' }} />
        </View>
      );
    } else if (tagType === 'SECTION') {
      elements.push(
        <View key={key++} style={{ marginBottom: wp(8), backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: wp(10), padding: wp(10), borderLeftWidth: wp(3), borderLeftColor: '#00D984' }}>
          <Text style={{ fontSize: fp(13), fontWeight: '700', color: '#2D3436', marginBottom: wp(4) }}>{sectionTitle.trim()}</Text>
          {tagContent.trim().split('\n').filter(l => l.trim()).map((line, li) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (<Text key={li} style={{ fontSize: fp(12), color: '#3A4550', lineHeight: fp(18), marginBottom: wp(2) }}>{parts.map((p, pi) => { if (p.startsWith('**') && p.endsWith('**')) return <Text key={pi} style={{ fontWeight: 'bold', color: '#1A2030' }}>{p.slice(2, -2)}</Text>; return <Text key={pi}>{p}</Text>; })}</Text>);
          })}
        </View>
      );
    } else if (tagType === 'ALERTE') {
      elements.push(
        <View key={key++} style={{ marginBottom: wp(8), backgroundColor: 'rgba(255,107,107,0.08)', borderRadius: wp(10), padding: wp(10), borderLeftWidth: wp(3), borderLeftColor: '#FF6B6B', flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: fp(14), marginRight: wp(6), marginTop: wp(-1) }}>⚠️</Text>
          <Text style={{ fontSize: fp(12), color: '#D63031', lineHeight: fp(18), flex: 1, fontWeight: '500' }}>{tagContent.trim()}</Text>
        </View>
      );
    } else if (tagType === 'INFO') {
      elements.push(
        <View key={key++} style={{ marginBottom: wp(8), backgroundColor: 'rgba(77,166,255,0.08)', borderRadius: wp(10), padding: wp(10), borderLeftWidth: wp(3), borderLeftColor: '#4DA6FF', flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: fp(14), marginRight: wp(6), marginTop: wp(-1) }}>💡</Text>
          <Text style={{ fontSize: fp(12), color: '#2980B9', lineHeight: fp(18), flex: 1 }}>{tagContent.trim()}</Text>
        </View>
      );
    } else if (tagType === 'SUCCESS') {
      elements.push(
        <View key={key++} style={{ marginBottom: wp(8), backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: wp(10), padding: wp(10), borderLeftWidth: wp(3), borderLeftColor: '#00D984', flexDirection: 'row', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: fp(14), marginRight: wp(6), marginTop: wp(-1) }}>✅</Text>
          <Text style={{ fontSize: fp(12), color: '#00A878', lineHeight: fp(18), flex: 1, fontWeight: '500' }}>{tagContent.trim()}</Text>
        </View>
      );
    } else if (tagType === 'PRIX') {
      elements.push(
        <View key={key++} style={{ marginBottom: wp(8), backgroundColor: 'rgba(212,175,55,0.08)', borderRadius: wp(10), padding: wp(10), borderLeftWidth: wp(3), borderLeftColor: '#D4AF37', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: fp(14), marginRight: wp(6) }}>💰</Text>
          <Text style={{ fontSize: fp(13), color: '#B8860B', lineHeight: fp(18), flex: 1, fontWeight: '600' }}>{tagContent.trim()}</Text>
        </View>
      );
    }
    remaining = remaining.substring(match.index + match[0].length);
  }
  return <View>{elements}</View>;
};

// ============================================
// METAL CARD — Style LIXUM sombre avec dégradé
// ============================================
export const MetalCard = ({ title, titleColor = '#00D984', iconElement, onPress }) => {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const handlePressIn = () => Animated.timing(pressAnim, { toValue: 1, duration: 120, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.timing(pressAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();

  const scaleVal = pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] });

  return (
    <Pressable delayPressIn={120} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
      <Animated.View style={{
        width: wp(130),
        height: wp(85),
        borderRadius: wp(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        transform: [{ scale: scaleVal }],
      }}>
        <LinearGradient
          colors={['#3A3F46', '#252A30', '#333A42', '#1A1D22']}
          style={{
            flex: 1,
            borderRadius: wp(16),
            borderWidth: 1,
            borderColor: '#4A4F55',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Icône SVG */}
          <View style={{ marginBottom: 6 }}>
            {iconElement}
          </View>

          {/* Titre */}
          <Text style={{
            color: titleColor,
            fontSize: fp(12),
            fontWeight: '700',
            letterSpacing: 0.5,
          }}>{title}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};
