import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, Animated, Pressable,
  TouchableOpacity, Linking, Platform, Easing,
} from 'react-native';
import Svg, {
  Defs, Rect, Path, Circle, Ellipse, Line,
  LinearGradient as SvgLinearGradient, Stop,
  Polyline as SvgPolyline,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { wp, fp, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';
import { FormattedText, FormattedResponseText, parseQuickReplies, QuickReplyButtons, ScrollArrow } from './shared';

// === ALIXEN SUPER CONTEXT v1 — Direction Parser ===
export const parseDirectionBlocks = (text) => {
  if (!text) return [{ type: 'text', content: text }];
  const directionRegex = /\[DIRECTION\]\s*(\{[\s\S]*?\})\s*\[\/DIRECTION\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = directionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    try {
      const data = JSON.parse(match[1]);
      parts.push({ type: 'direction', data });
    } catch (e) {
      parts.push({ type: 'text', content: match[0] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
};

// === ALIXEN SUPER CONTEXT v1 — DirectionCard Component ===
export const DirectionCard = ({ placeName, placeAddress, description, destLat, destLng, userLat, userLng }) => {
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // layout animation - cannot use native driver
    }).start();
  }, []);

  const cardWidth = 280;
  const cardHeight = 160;
  const startX = 30, startY = cardHeight - 30;
  const endX = cardWidth - 30, endY = 30;
  const midX = cardWidth / 2, midY = cardHeight / 2 - 20;

  const pathPoints = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
    const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
    pathPoints.push(`${x},${y}`);
  }

  const openGoogleMaps = () => {
    const url = Platform.select({
      android: `google.navigation:q=${destLat},${destLng}`,
      ios: `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`,
      default: `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=walking`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`);
    });
  };

  const [visiblePoints, setVisiblePoints] = useState(1);

  useEffect(() => {
    const listener = animProgress.addListener(({ value }) => {
      setVisiblePoints(Math.max(1, Math.floor(value * pathPoints.length)));
    });
    return () => animProgress.removeListener(listener);
  }, []);

  return (
    <View style={{
      backgroundColor: '#1a1f2e',
      borderRadius: 16,
      padding: 12,
      marginVertical: 8,
      width: cardWidth + 24,
      borderWidth: 1,
      borderColor: 'rgba(46, 204, 113, 0.3)',
    }}>
      {/* Mini carte avec animation du trajet */}
      <View style={{
        width: cardWidth,
        height: cardHeight,
        backgroundColor: '#0d1117',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        <Svg width={cardWidth} height={cardHeight}>
          {/* Grille de fond style carte */}
          {[...Array(8)].map((_, i) => (
            <SvgPolyline
              key={`grid-h-${i}`}
              points={`0,${i * 20} ${cardWidth},${i * 20}`}
              stroke="rgba(46, 204, 113, 0.06)"
              strokeWidth="0.5"
            />
          ))}
          {[...Array(15)].map((_, i) => (
            <SvgPolyline
              key={`grid-v-${i}`}
              points={`${i * 20},0 ${i * 20},${cardHeight}`}
              stroke="rgba(46, 204, 113, 0.06)"
              strokeWidth="0.5"
            />
          ))}

          {/* Chemin animé */}
          <SvgPolyline
            points={pathPoints.slice(0, visiblePoints).join(' ')}
            fill="none"
            stroke="#2ecc71"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point de départ (bleu) */}
          <Circle cx={startX} cy={startY} r="6" fill="#3498db" />
          <Circle cx={startX} cy={startY} r="3" fill="#fff" />

          {/* Point d'arrivée (vert) — visible quand animation terminée */}
          {visiblePoints >= pathPoints.length && (
            <>
              <Circle cx={endX} cy={endY} r="6" fill="#2ecc71" />
              <Circle cx={endX} cy={endY} r="3" fill="#fff" />
            </>
          )}
        </Svg>

        {/* Labels sur la carte */}
        <View style={{ position: 'absolute', bottom: 8, left: 8 }}>
          <Text style={{ color: '#3498db', fontSize: 9, fontWeight: '700' }}>{'📍 Vous'}</Text>
        </View>
        {visiblePoints >= pathPoints.length && (
          <View style={{ position: 'absolute', top: 8, right: 8 }}>
            <Text style={{ color: '#2ecc71', fontSize: 9, fontWeight: '700' }} numberOfLines={1}>{'🏪 '}{placeName}</Text>
          </View>
        )}
      </View>

      {/* Infos du lieu */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{placeName}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>{placeAddress}</Text>
        {description ? (
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
            {description}
          </Text>
        ) : null}
      </View>

      {/* Bouton ouvrir Google Maps */}
      <TouchableOpacity
        onPress={openGoogleMaps}
        activeOpacity={0.8}
        style={{
          marginTop: 10,
          backgroundColor: '#2ecc71',
          borderRadius: 10,
          paddingVertical: 10,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 16 }}>{'🗺️'}</Text>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Ouvrir dans Google Maps</Text>
      </TouchableOpacity>
    </View>
  );
};

export const LoadingSteps = React.memo(({ steps }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;

  const displaySteps = steps && steps.length > 0 ? steps : ['Préparation de la réponse...'];

  useEffect(() => {
    setStepIndex(0);
    fadeAnim.setValue(1);
  }, [steps]);

  useEffect(() => {
    if (displaySteps.length <= 1) return;
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setStepIndex(prev => {
          const next = prev + 1;
          return next < displaySteps.length ? next : prev;
        });
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [displaySteps.length]);

  useEffect(() => {
    const createBounce = (anim, delay) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -4, duration: 200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.delay(400 - delay),
      ]));
    createBounce(bounce1, 0).start();
    createBounce(bounce2, 150).start();
    createBounce(bounce3, 300).start();
  }, []);

  return (
    <View style={{
      backgroundColor: 'rgba(0, 217, 132, 0.06)',
      borderRadius: wp(14),
      paddingHorizontal: wp(14),
      paddingVertical: wp(10),
      borderWidth: 1,
      borderColor: 'rgba(0, 217, 132, 0.12)',
      alignSelf: 'stretch',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: wp(6) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {[bounce1, bounce2, bounce3].map((anim, i) => (
            <Animated.View key={i} style={{
              width: wp(5), height: wp(5), borderRadius: wp(2.5),
              backgroundColor: '#00D984',
              transform: [{ translateY: anim }],
            }} />
          ))}
        </View>
        <Text style={{ fontSize: fp(11), fontWeight: '700', color: '#00D984', letterSpacing: 0.5 }}>ALIXEN</Text>
      </View>
      <Animated.Text style={{
        fontSize: fp(12),
        color: 'rgba(0, 150, 100, 0.6)',
        fontStyle: 'italic',
        opacity: fadeAnim,
      }}>
        {displaySteps[stepIndex] || 'Préparation de la réponse...'}
      </Animated.Text>
    </View>
  );
});

export const FileQueuePreview = ({ files, onRemove }) => {
  if (!files || files.length === 0) return null;

  return (
    <View style={{
      flexDirection: 'row', paddingHorizontal: wp(8),
      paddingTop: wp(8), paddingBottom: wp(4),
      gap: wp(8),
    }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: wp(8) }}>
          {files.map((file) => (
            <View key={file.id} style={{
              width: wp(56), height: wp(56), borderRadius: wp(12),
              overflow: 'hidden', position: 'relative',
              borderWidth: 1, borderColor: 'rgba(0,217,132,0.2)',
            }}>
              {file.type === 'image' && file.uri ? (
                <Image
                  source={{ uri: file.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  blurRadius={2}
                />
              ) : (
                <View style={{
                  width: '100%', height: '100%',
                  backgroundColor: 'rgba(77,166,255,0.08)',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Svg width={wp(20)} height={wp(20)} viewBox="0 0 24 24" fill="none">
                    <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M14 2v6h6" stroke="#4DA6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                  <Text numberOfLines={1} style={{
                    fontSize: fp(7), color: '#4DA6FF', marginTop: wp(2),
                    maxWidth: wp(48), textAlign: 'center',
                  }}>{file.name}</Text>
                </View>
              )}
              {/* Badge type */}
              <View style={{
                position: 'absolute', bottom: wp(2), left: wp(2),
                backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: wp(4),
                paddingHorizontal: wp(4), paddingVertical: wp(1),
              }}>
                <Text style={{ fontSize: fp(7), color: '#FFF', fontWeight: '700' }}>
                  {file.type === 'image' ? '📷' : '📄'}
                </Text>
              </View>
              {/* Bouton X */}
              <Pressable
                onPress={() => onRemove(file.id)}
                style={{
                  position: 'absolute', top: wp(-2), right: wp(-2),
                  width: wp(18), height: wp(18), borderRadius: wp(9),
                  backgroundColor: 'rgba(255,59,48,0.9)',
                  justifyContent: 'center', alignItems: 'center',
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                }}
              >
                <Text style={{ color: '#FFF', fontSize: fp(9), fontWeight: '800', lineHeight: fp(10) }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// === ALIXEN SUPER CONTEXT v1 — ResponseCard with DirectionCard support ===
export const ResponseCard = React.memo(({ currentMessage, isLoading, isUserMessage, onQuickReply, onPreciserPress, loadingSteps, userLocation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (currentMessage || isLoading) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [currentMessage, isLoading]);

  // Effet machine à écrire pour les réponses IA
  useEffect(() => {
    if (currentMessage && !isUserMessage && !isLoading) {
      setDisplayedText('');
      let idx = 0;
      const interval = setInterval(() => {
        idx += 2;
        if (idx >= currentMessage.length) {
          setDisplayedText(currentMessage);
          clearInterval(interval);
        } else {
          setDisplayedText(currentMessage.substring(0, idx));
        }
      }, 15);
      return () => clearInterval(interval);
    } else if (isUserMessage && currentMessage) {
      setDisplayedText(currentMessage);
    }
  }, [currentMessage, isUserMessage, isLoading]);

  if (!currentMessage && !isLoading) return null;

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      marginHorizontal: 10,
      marginBottom: 8,
      borderRadius: wp(16),
      backgroundColor: '#FAFBFC',
      borderWidth: 1,
      borderColor: isLoading ? 'rgba(0,200,130,0.1)' : (isUserMessage ? 'rgba(70,140,220,0.1)' : 'rgba(210,80,80,0.1)'),
      borderLeftWidth: (!isUserMessage || isLoading) ? wp(3) : 1,
      borderLeftColor: (!isUserMessage || isLoading) ? '#00D984' : (isUserMessage ? 'rgba(70,140,220,0.1)' : 'rgba(210,80,80,0.1)'),
      padding: 14,
      minHeight: 50,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    }}>
      {/* Badge ALIXEN premium */}
      {!isUserMessage && !isLoading && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(6), marginBottom: wp(8) }}>
          <LinearGradient
            colors={['#00D984', '#00B871']}
            style={{
              width: wp(20),
              height: wp(20),
              borderRadius: wp(10),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: fp(9), fontWeight: '800' }}>AI</Text>
          </LinearGradient>
          <Text style={{
            fontSize: fp(13),
            fontWeight: '700',
            color: '#2D3436',
            letterSpacing: 1,
          }}>ALIXEN</Text>
        </View>
      )}
      {isUserMessage && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 }}>
          <View style={{
            width: 7, height: 7, borderRadius: 3.5,
            backgroundColor: '#4A8CDC',
          }} />
          <Text style={{
            color: 'rgba(70,130,210,0.5)',
            fontSize: 9, fontWeight: '600', letterSpacing: 1,
          }}>VOUS</Text>
        </View>
      )}

      {/* Contenu */}
      {isLoading ? (
        <LoadingSteps steps={loadingSteps} />
      ) : (() => {
        const fullText = displayedText + (!isUserMessage && displayedText.length < (currentMessage || '').length ? '|' : '');
        const { cleanText, choices } = parseQuickReplies(fullText);
        const isTypingDone = !isUserMessage && displayedText.length >= (currentMessage || '').length;
        return (
          <>
            {isTypingDone && !isUserMessage ? (
              // === ALIXEN SUPER CONTEXT v1 — Render DirectionCards inline ===
              (() => {
                const dirParts = parseDirectionBlocks(cleanText);
                const hasDirections = dirParts.some(p => p.type === 'direction');
                if (hasDirections) {
                  return (
                    <View>
                      {dirParts.map((part, pi) => {
                        if (part.type === 'direction') {
                          return (
                            <DirectionCard
                              key={`dir-${pi}`}
                              placeName={part.data.place_name}
                              placeAddress={part.data.place_address}
                              description={part.data.description}
                              destLat={part.data.dest_lat}
                              destLng={part.data.dest_lng}
                              userLat={userLocation?.lat}
                              userLng={userLocation?.lng}
                            />
                          );
                        }
                        return (
                          <FormattedResponseText
                            key={`txt-${pi}`}
                            text={part.content}
                            style={{ color: '#3A4550', fontSize: 13, lineHeight: fp(22) }}
                          />
                        );
                      })}
                    </View>
                  );
                }
                return (
                  <FormattedResponseText
                    text={cleanText}
                    style={{ color: '#3A4550', fontSize: 13, lineHeight: fp(22) }}
                  />
                );
              })()
            ) : (
              <Text style={{ color: '#3A4550', fontSize: 13, lineHeight: fp(22) }}>
                {cleanText}
              </Text>
            )}
            {isTypingDone && !isUserMessage && choices.length > 0 && (
              <QuickReplyButtons
                choices={choices}
                onPress={onQuickReply}
                onPreciser={onPreciserPress}
              />
            )}
          </>
        );
      })()}
    </Animated.View>
  );
});

export let _ballGradIdx = 0;
export const NeumorphBall = React.memo(({ index, isBot, isSearchHit, isSearchActive, status, onPress, hasAttachment, contentLength, isLatest, previewText, timestamp }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const loadPulse = useRef(new Animated.Value(0.3)).current;
  const latestPulse = useRef(new Animated.Value(1)).current;
  const searchGlow = useRef(new Animated.Value(0)).current;
  const gradId = useRef('ball' + (_ballGradIdx++)).current;
  const [showPreview, setShowPreview] = useState(false);

  const baseSize = wp(30);
  const sizeBonus = contentLength > 200 ? wp(6) : contentLength > 100 ? wp(3) : 0;
  const BALL_SIZE = baseSize + sizeBonus;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (status === 'loading') {
      Animated.loop(Animated.sequence([
        Animated.timing(loadPulse, { toValue: 0.8, duration: 500, useNativeDriver: true }),
        Animated.timing(loadPulse, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])).start();
    }
  }, [status]);

  useEffect(() => {
    if (isLatest) {
      Animated.loop(Animated.sequence([
        Animated.timing(latestPulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(latestPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])).start();
    }
  }, [isLatest]);

  useEffect(() => {
    if (isSearchHit) {
      Animated.loop(Animated.sequence([
        Animated.timing(searchGlow, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(searchGlow, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])).start();
    } else {
      searchGlow.setValue(0);
    }
  }, [isSearchHit]);

  const dimmed = isSearchActive && !isSearchHit;
  const isActive = status === 'unread' || isSearchHit;

  const topColor = isBot ? '#FF8A80' : '#7DD3FC';
  const bottomColor = isBot ? '#C62828' : '#0A5EB5';
  const glowColor = isBot ? '#E74C3C' : '#3498DB';

  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <Animated.View style={{
      transform: [
        { scale: Animated.multiply(scaleAnim, isLatest ? latestPulse : new Animated.Value(1)) },
      ],
      opacity: dimmed ? 0.25 : 1,
      alignItems: 'center',
    }}>
      <Pressable
        onPress={() => { if (status !== 'loading') { setShowPreview(false); onPress(); } }}
        onLongPress={() => setShowPreview(true)}
        delayLongPress={400}
        onPressOut={() => setTimeout(() => setShowPreview(false), 2000)}
      >
        <View style={{
          width: BALL_SIZE,
          height: BALL_SIZE,
          borderRadius: BALL_SIZE / 2,
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isActive ? 0.6 : isLatest ? 0.4 : 0.3,
          shadowRadius: isActive ? 8 : isLatest ? 6 : 4,
          elevation: isActive ? 6 : 3,
        }}>
          <Svg width={BALL_SIZE} height={BALL_SIZE} viewBox="0 0 32 32">
            <Defs>
              <SvgLinearGradient id={gradId} x1="0.5" y1="0" x2="0.5" y2="1">
                <Stop offset="0%" stopColor={topColor} />
                <Stop offset="100%" stopColor={bottomColor} />
              </SvgLinearGradient>
            </Defs>
            <Circle cx="16" cy="16" r="15" fill={`url(#${gradId})`} />
            <Ellipse cx="11" cy="10" rx="5" ry="3.5" fill="white" opacity={0.22} />
            <Circle cx="9" cy="8.5" r="1.8" fill="white" opacity={0.15} />
          </Svg>
          {status === 'loading' ? (
            <Animated.View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Animated.View style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: '#FFF', opacity: loadPulse,
              }} />
            </Animated.View>
          ) : (
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Text style={{
                color: '#FFF', fontSize: fp(BALL_SIZE > baseSize ? 12 : 11),
                fontWeight: '800',
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                {index + 1}
              </Text>
            </View>
          )}
        </View>
        {isSearchHit && (
          <Animated.View style={{
            position: 'absolute',
            top: -3, left: -3, right: -3, bottom: -3,
            borderRadius: BALL_SIZE / 2 + 3,
            borderWidth: 2,
            borderColor: '#D4AF37',
            opacity: searchGlow,
          }} />
        )}
        {hasAttachment && (
          <View style={{
            position: 'absolute', bottom: -wp(3),
            alignSelf: 'center',
            width: wp(6), height: wp(6), borderRadius: wp(3),
            backgroundColor: isBot ? '#E74C3C' : '#3498DB',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
          }} />
        )}
      </Pressable>
      {showPreview && previewText && (
        <View style={{
          position: 'absolute', top: BALL_SIZE + 4,
          backgroundColor: 'rgba(26,32,48,0.95)',
          borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
          borderWidth: 1,
          borderColor: isBot ? 'rgba(231,76,60,0.3)' : 'rgba(52,152,219,0.3)',
          width: wp(120), zIndex: 100,
        }}>
          <Text numberOfLines={2} style={{
            color: '#EAEEF3', fontSize: fp(10), lineHeight: fp(14),
          }}>{previewText}</Text>
          <Text style={{
            color: 'rgba(255,255,255,0.3)', fontSize: fp(8), marginTop: 2,
          }}>{timeStr}</Text>
        </View>
      )}
    </Animated.View>
  );
});

export const S_BALL_SIZE = 32;
export const BALLS_PER_ROW = 8;
export const S_GAP = S_BALL_SIZE + 4; // 36
export const S_PADDING_H = (SCREEN_WIDTH - BALLS_PER_ROW * S_GAP) / 2;

export const getBallPosition = (index) => {
  const row = Math.floor(index / BALLS_PER_ROW);
  const col = index % BALLS_PER_ROW;
  const reversed = row % 2 === 1; // Lignes impaires inversées = S
  const actualCol = reversed ? (BALLS_PER_ROW - 1 - col) : col;
  return {
    x: S_PADDING_H + actualCol * S_GAP + S_GAP / 2,
    y: row * (S_BALL_SIZE + 12),
  };
};

export const SynapticNetwork = React.memo(({ messages, searchHits, onBallPress, onNewSession }) => {
  const totalCount = messages.length + 1; // +1 for "new session" button
  const totalRows = Math.ceil(totalCount / BALLS_PER_ROW);
  const containerHeight = totalRows * (S_BALL_SIZE + 12) + 10;

  // Position of the "new session" button = next slot after last message
  const newSessionPos = getBallPosition(messages.length);

  return (
    <View style={{ height: containerHeight, position: 'relative', marginHorizontal: 8 }}>
      {/* Lignes de connexion entre boules adjacentes */}
      {messages.map((msg, i) => {
        if (i === 0) return null;
        const pos = getBallPosition(i);
        const prevPos = getBallPosition(i - 1);
        const prevRow = Math.floor((i - 1) / BALLS_PER_ROW);
        const curRow = Math.floor(i / BALLS_PER_ROW);

        if (prevRow === curRow) {
          // Même ligne : ligne horizontale
          const minX = Math.min(pos.x, prevPos.x);
          const maxX = Math.max(pos.x, prevPos.x);
          return (
            <View key={`line-${i}`} style={{
              position: 'absolute',
              left: minX,
              top: pos.y + S_BALL_SIZE / 2 - 0.5,
              width: maxX - minX,
              height: 1,
              backgroundColor: messages[i].role === 'assistant' ? 'rgba(231,76,60,0.12)' : 'rgba(52,152,219,0.12)',
            }} />
          );
        } else {
          // Changement de ligne : ligne verticale
          return (
            <View key={`line-${i}`} style={{
              position: 'absolute',
              left: prevPos.x - 0.5,
              top: prevPos.y + S_BALL_SIZE / 2,
              width: 1,
              height: pos.y - prevPos.y,
              backgroundColor: messages[i].role === 'assistant' ? 'rgba(231,76,60,0.08)' : 'rgba(52,152,219,0.08)',
            }} />
          );
        }
      })}

      {/* Boules */}
      {messages.map((msg, i) => {
        const pos = getBallPosition(i);
        const isSearch = searchHits && searchHits.has(i);
        return (
          <View key={msg.id || `ball-${i}`} style={{
            position: 'absolute',
            left: pos.x - S_BALL_SIZE / 2,
            top: pos.y,
          }}>
            <NeumorphBall
              index={i}
              isBot={msg.role === 'assistant'}
              isSearchHit={isSearch}
              isSearchActive={searchHits && searchHits.size > 0}
              status={msg._status || 'read'}
              onPress={() => onBallPress(msg, i)}
              hasAttachment={msg._hasAttachment}
              contentLength={msg.content ? msg.content.length : 0}
              isLatest={i === messages.length - 1}
              previewText={msg.content ? msg.content.substring(0, 60) : ''}
              timestamp={msg.timestamp}
            />
          </View>
        );
      })}

      {/* Bouton Nouvelle session — dernier element du S */}
      {messages.length > 0 && (
        <View style={{
          position: 'absolute',
          left: newSessionPos.x - S_BALL_SIZE / 2,
          top: newSessionPos.y,
        }}>
          <Pressable
            delayPressIn={120}
            onPress={onNewSession}
            style={({ pressed }) => ({
              width: wp(32),
              height: wp(32),
              borderRadius: wp(10),
              backgroundColor: 'rgba(0,217,132,0.08)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(0,217,132,0.3)',
              borderStyle: 'dashed',
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <Text style={{ color: '#00D984', fontSize: fp(14), fontWeight: '300' }}>+</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

export const HighlightedText = ({ text, searchTerm, currentIndex, style, onLayoutOccurrence }) => {
  if (!text || !searchTerm || !searchTerm.trim()) {
    return <Text style={style}>{text}</Text>;
  }

  const term = searchTerm.toLowerCase();
  const parts = [];
  let remaining = text;
  let globalIdx = 0;
  let occurrenceIdx = 0;

  while (remaining.length > 0) {
    const lowerRemaining = remaining.toLowerCase();
    const matchPos = lowerRemaining.indexOf(term);
    if (matchPos === -1) {
      parts.push({ text: remaining, isHighlight: false, idx: -1 });
      break;
    }
    if (matchPos > 0) {
      parts.push({ text: remaining.substring(0, matchPos), isHighlight: false, idx: -1 });
    }
    parts.push({
      text: remaining.substring(matchPos, matchPos + searchTerm.length),
      isHighlight: true,
      idx: occurrenceIdx,
    });
    occurrenceIdx++;
    remaining = remaining.substring(matchPos + searchTerm.length);
    globalIdx += matchPos + searchTerm.length;
  }

  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (!part.isHighlight) {
          return <Text key={i}>{part.text}</Text>;
        }
        const isActive = part.idx === currentIndex;
        return (
          <Text
            key={i}
            onLayout={onLayoutOccurrence ? (e) => onLayoutOccurrence(part.idx, e.nativeEvent.layout.y) : undefined}
            style={{
              backgroundColor: isActive ? 'rgba(212, 175, 55, 0.6)' : 'rgba(212, 175, 55, 0.3)',
              borderRadius: 4,
              paddingHorizontal: 2,
            }}
          >
            {part.text}
          </Text>
        );
      })}
    </Text>
  );
};

export const countOccurrences = (text, term) => {
  if (!text || !term || !term.trim()) return 0;
  const lower = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  let count = 0;
  let pos = 0;
  while ((pos = lower.indexOf(lowerTerm, pos)) !== -1) {
    count++;
    pos += lowerTerm.length;
  }
  return count;
};

// === ALIXEN SUPER CONTEXT v1 — ModalScrollContent with DirectionCard support ===
export const ModalScrollContent = ({ selectedMessage, closeModal, handleRecipePress, searchTerm, onQuickReply, onPreciserPress, userLocation }) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const scrollRef = useRef(null);
  const occurrenceYPositions = useRef({});

  const totalOccurrences = countOccurrences(selectedMessage.content, searchTerm);
  const hasSearch = searchTerm && searchTerm.trim() && totalOccurrences > 0;

  const handleLayoutOccurrence = (idx, y) => {
    occurrenceYPositions.current[idx] = y;
  };

  const navigateHighlight = (direction) => {
    if (totalOccurrences === 0) return;
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentHighlightIndex + 1) % totalOccurrences;
    } else {
      nextIndex = (currentHighlightIndex - 1 + totalOccurrences) % totalOccurrences;
    }
    setCurrentHighlightIndex(nextIndex);
    const y = occurrenceYPositions.current[nextIndex];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 40), animated: true });
    }
  };

  return (
    <View>
      {/* Barre de navigation recherche */}
      {hasSearch && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 8,
          paddingVertical: 4,
        }}>
          <Pressable
            onPress={() => navigateHighlight('prev')}
            style={{
              width: wp(30),
              height: wp(30),
              borderRadius: wp(15),
              backgroundColor: '#3A3F46',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>‹</Text>
          </Pressable>

          <Text style={{ color: '#999', fontSize: 11 }}>
            {currentHighlightIndex + 1} sur {totalOccurrences} résultat{totalOccurrences > 1 ? 's' : ''}
          </Text>

          <Pressable
            onPress={() => navigateHighlight('next')}
            style={{
              width: wp(30),
              height: wp(30),
              borderRadius: wp(15),
              backgroundColor: '#3A3F46',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: 'bold' }}>›</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={{ maxHeight: SCREEN_HEIGHT * 0.45 }}
        onContentSizeChange={(w, h) => setIsScrollable(h > 300)}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          setIsAtBottom(layoutMeasurement.height + contentOffset.y >= contentSize.height - 20);
        }}
        scrollEventThrottle={16}
      >
        {hasSearch ? (
          <HighlightedText
            text={selectedMessage.content}
            searchTerm={searchTerm}
            currentIndex={currentHighlightIndex}
            style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}
            onLayoutOccurrence={handleLayoutOccurrence}
          />
        ) : selectedMessage.role === 'assistant' ? (
          // === ALIXEN SUPER CONTEXT v1 — Direction blocks in modal ===
          (() => {
            const dirParts = parseDirectionBlocks(selectedMessage.content);
            const hasDirections = dirParts.some(p => p.type === 'direction');
            if (hasDirections) {
              return (
                <View>
                  {dirParts.map((part, pi) => {
                    if (part.type === 'direction') {
                      return (
                        <DirectionCard
                          key={`mdir-${pi}`}
                          placeName={part.data.place_name}
                          placeAddress={part.data.place_address}
                          description={part.data.description}
                          destLat={part.data.dest_lat}
                          destLng={part.data.dest_lng}
                          userLat={userLocation?.lat}
                          userLng={userLocation?.lng}
                        />
                      );
                    }
                    return (
                      <FormattedText
                        key={`mtxt-${pi}`}
                        text={part.content}
                        style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}
                        onRecipePress={(name) => { closeModal(); handleRecipePress(name); }}
                      />
                    );
                  })}
                </View>
              );
            }
            return (
              <FormattedText
                text={selectedMessage.content}
                style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}
                onRecipePress={(name) => { closeModal(); handleRecipePress(name); }}
              />
            );
          })()
        ) : (
          <FormattedResponseText
            text={selectedMessage.content}
            style={{ color: '#3A4550', fontSize: 13, lineHeight: 21 }}
          />
        )}
      </ScrollView>
      {selectedMessage.role === 'assistant' && (() => {
        const { choices } = parseQuickReplies(selectedMessage.content);
        if (choices.length === 0) return null;
        return (
          <QuickReplyButtons
            choices={choices}
            onPress={onQuickReply}
            onPreciser={onPreciserPress}
          />
        );
      })()}
      {isScrollable && !isAtBottom && <ScrollArrow />}
    </View>
  );
};
