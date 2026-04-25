import React from 'react';
import { View, Animated } from 'react-native';

// Phase 3 — 6 particules dorées flottantes (B2 : points dorés ronds)
// Parallax désynchronisé via 2 anims (cycle 5s + 7s)
// Visibles UNIQUEMENT sur tier mythic + ultimate (Diamond Simba, Alburax, TARDIGRUM)

var PARTICLE_POSITIONS = [
  { left: '15%', top: '10%', size: 4, anim: 1 },
  { left: '85%', top: '20%', size: 3, anim: 2 },
  { left: '50%', top: '5%',  size: 5, anim: 1 },
  { left: '20%', top: '70%', size: 3, anim: 2 },
  { left: '80%', top: '60%', size: 4, anim: 1 },
  { left: '60%', top: '85%', size: 3, anim: 2 }
];

export default function GoldenParticles(props) {
  var particleAnim1 = props.particleAnim1;
  var particleAnim2 = props.particleAnim2;

  function renderParticle(p, idx) {
    var anim = p.anim === 1 ? particleAnim1 : particleAnim2;

    // Translation Y : 0 → -8px → 0 sur le cycle complet
    var translateY = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, -8, 0]
    });

    // Opacity : 0 → 0.8 → 0 (apparition/disparition)
    var opacity = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 0]
    });

    return (
      <Animated.View
        key={idx}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          borderRadius: p.size / 2,
          backgroundColor: '#D4AF37',
          opacity: opacity,
          transform: [{ translateY: translateY }]
        }}
      />
    );
  }

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {PARTICLE_POSITIONS.map(renderParticle)}
    </View>
  );
}
