import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Ellipse } from 'react-native-svg';
import { wp, fp } from '../../constants/layout';

var TRACK_W = 280;
var TRACK_H = wp(55);
var RX = 110;
var RY = 18;
var CX = TRACK_W / 2;
var CY = TRACK_H / 2 - 8;
var TRAIL_LENGTH_SLOW = 14;
var TRAIL_LENGTH_FAST = 8;

function getEllipsePoint(angle, cx, cy, rx, ry) {
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

export default function PulseTrack(props) {
  var color = props.color || '#00E5FF';
  var speed = props.speed || 'slow';
  var isActive = props.isActive || false;
  var distance = props.distance || '0 m';
  var calories = props.calories || 0;
  var waterLost = props.waterLost || 0;
  var duration = props.duration || '0 min';
  var hasParticles = props.hasParticles || false;

  var angleRef = useRef(0);
  var trailRef = useRef([]);
  var particlesRef = useRef([]);
  var frameRef = useRef(null);
  var lapCountRef = useRef(0);
  var _forceUpdate = useState(0);
  var forceUpdate = _forceUpdate[1];

  var lapFlash = useRef(new Animated.Value(0)).current;

  // Track dimensions from layout
  var _trackW = useState(TRACK_W);
  var trackW = _trackW[0]; var setTrackW = _trackW[1];

  var cx = trackW / 2;
  var rx = Math.min(trackW * 0.40, 130);
  var ry = 18;
  var cy = CY;

  var angleStep = speed === 'fast' ? 0.06 : 0.02;
  var trailLen = speed === 'fast' ? TRAIL_LENGTH_FAST : TRAIL_LENGTH_SLOW;

  useEffect(function() {
    if (isActive) {
      var prevLap = lapCountRef.current;
      frameRef.current = setInterval(function() {
        angleRef.current += angleStep;

        // Lap detection
        var currentLap = Math.floor(angleRef.current / (2 * Math.PI));
        if (currentLap > prevLap) {
          prevLap = currentLap;
          lapCountRef.current = currentLap;
          Animated.sequence([
            Animated.timing(lapFlash, { toValue: 0.2, duration: 250, useNativeDriver: false }),
            Animated.timing(lapFlash, { toValue: 0, duration: 250, useNativeDriver: false }),
          ]).start();
        }

        // Trail
        var pt = getEllipsePoint(angleRef.current, cx, cy, rx, ry);
        trailRef.current.unshift({ x: pt.x, y: pt.y });
        if (trailRef.current.length > trailLen) {
          trailRef.current = trailRef.current.slice(0, trailLen);
        }

        // Particles (fast/course only)
        if (hasParticles && Math.random() > 0.4) {
          particlesRef.current.push({
            x: pt.x + (Math.random() - 0.5) * 8,
            y: pt.y + (Math.random() - 0.5) * 8,
            life: 12,
          });
        }
        // Age particles
        particlesRef.current = particlesRef.current
          .map(function(p) { return { x: p.x, y: p.y - 0.3, life: p.life - 1 }; })
          .filter(function(p) { return p.life > 0; });

        forceUpdate(function(v) { return v + 1; });
      }, 40);

      return function() {
        if (frameRef.current) clearInterval(frameRef.current);
      };
    }
  }, [isActive, cx, rx, ry]);

  var headPt = getEllipsePoint(angleRef.current, cx, cy, rx, ry);

  return (
    <View
      style={{
        height: TRACK_H, borderRadius: 16, overflow: 'hidden',
        backgroundColor: '#1A1D22', borderWidth: 1, borderColor: '#3A3F46',
      }}
      onLayout={function(e) { setTrackW(e.nativeEvent.layout.width); }}
    >
      {/* Lap flash overlay */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: color, opacity: lapFlash, borderRadius: 16,
      }} />

      {/* Lap counter */}
      {lapCountRef.current > 0 && (
        <View style={{ position: 'absolute', top: wp(4), alignSelf: 'center', zIndex: 5 }}>
          <Text style={{ color: color, fontSize: fp(8), fontWeight: '700', opacity: 0.7 }}>
            Tour {lapCountRef.current}
          </Text>
        </View>
      )}

      {/* Track ellipse (SVG background) */}
      <Svg width={trackW} height={TRACK_H} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12}
        />
        <Ellipse cx={cx} cy={cy} rx={rx} ry={ry}
          fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1}
        />
      </Svg>

      {/* Trail dots */}
      {trailRef.current.map(function(pt, i) {
        var opacity = (1 - i / trailLen) * 0.5;
        var size = Math.max(1.5, 4 - i * 0.2);
        return (
          <View key={'tr' + i} style={{
            position: 'absolute',
            left: pt.x - size / 2, top: pt.y - size / 2,
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: color, opacity: opacity,
          }} />
        );
      })}

      {/* Particles (course only) */}
      {particlesRef.current.map(function(p, i) {
        var opacity = (p.life / 12) * 0.6;
        return (
          <View key={'pa' + i} style={{
            position: 'absolute',
            left: p.x - 1, top: p.y - 1,
            width: 2, height: 2, borderRadius: 1,
            backgroundColor: color, opacity: opacity,
          }} />
        );
      })}

      {/* Head dot + halo */}
      <View style={{
        position: 'absolute',
        left: headPt.x - 6, top: headPt.y - 6,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: color, opacity: 0.25,
      }} />
      <View style={{
        position: 'absolute',
        left: headPt.x - 4, top: headPt.y - 4,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: color,
      }} />

      {/* Center: duration */}
      <View style={{ position: 'absolute', top: cy - fp(14), left: 0, right: 0, alignItems: 'center' }}>
        <Text style={{
          color: color, fontSize: fp(22), fontWeight: '500',
          fontVariant: ['tabular-nums'],
        }}>{duration}</Text>
      </View>

      {/* Bottom indicators */}
      <View style={{
        position: 'absolute', bottom: wp(4), left: 0, right: 0,
        flexDirection: 'row', justifyContent: 'center', gap: wp(20),
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#FF6B8A', fontSize: fp(12), fontWeight: '700' }}>{distance}</Text>
          <Text style={{ color: '#888', fontSize: fp(8) }}>distance</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#FFD93D', fontSize: fp(12), fontWeight: '700' }}>{calories}</Text>
          <Text style={{ color: '#888', fontSize: fp(8) }}>kcal</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#4DA6FF', fontSize: fp(12), fontWeight: '700' }}>{waterLost}</Text>
          <Text style={{ color: '#888', fontSize: fp(8) }}>ml eau</Text>
        </View>
      </View>
    </View>
  );
}
