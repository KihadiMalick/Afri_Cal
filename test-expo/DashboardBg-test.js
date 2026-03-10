// LIXUM - Dashboard Background Test — Circuit Board ULTIMATE
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que les autres fichiers test

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Dimensions, Text, StyleSheet, StatusBar, Animated as RNAnimated } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Rect, Path, G } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

// ============================================
// UTILITAIRE — pseudo-random deterministe
// ============================================
const seededRandom = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ============================================
// GENERATEUR DE CIRCUIT BOARD
// ============================================
const generateCircuitBoard = (width, height) => {
  const traces = [];       // Lignes principales (epaisses)
  const thinTraces = [];   // Lignes secondaires (fines)
  const nodes = [];        // Points de connexion
  const chips = [];        // Composants IC (rectangles)
  const dotGrids = [];     // Grilles de petits points
  const hexagons = [];     // Formes hexagonales

  // === TRACES PRINCIPALES — lignes epaisses avec coudes 90° ===
  const mainTraceCount = 25;
  for (let i = 0; i < mainTraceCount; i++) {
    const seed = i * 17 + 42;
    const startX = seededRandom(seed) * width;
    const startY = seededRandom(seed + 1) * height;
    const segments = 3 + Math.floor(seededRandom(seed + 2) * 4); // 3-6 segments

    let path = `M ${startX} ${startY}`;
    let cx = startX;
    let cy = startY;
    const points = [{ x: cx, y: cy }];

    for (let s = 0; s < segments; s++) {
      const isHorizontal = s % 2 === 0;
      const length = 40 + seededRandom(seed + s * 3 + 10) * 120;
      const direction = seededRandom(seed + s * 3 + 11) > 0.5 ? 1 : -1;

      if (isHorizontal) {
        cx += length * direction;
        cx = Math.max(10, Math.min(width - 10, cx));
      } else {
        cy += length * direction;
        cy = Math.max(10, Math.min(height - 10, cy));
      }
      path += ` L ${cx} ${cy}`;
      points.push({ x: cx, y: cy });
    }

    traces.push({ path, points, seed });
  }

  // === TRACES SECONDAIRES — plus fines, plus nombreuses ===
  const thinTraceCount = 40;
  for (let i = 0; i < thinTraceCount; i++) {
    const seed = i * 23 + 100;
    const startX = seededRandom(seed) * width;
    const startY = seededRandom(seed + 1) * height;
    const segments = 2 + Math.floor(seededRandom(seed + 2) * 3);

    let path = `M ${startX} ${startY}`;
    let cx = startX;
    let cy = startY;

    for (let s = 0; s < segments; s++) {
      const isH = s % 2 === (seededRandom(seed + 5) > 0.5 ? 0 : 1);
      const len = 20 + seededRandom(seed + s * 5 + 20) * 80;
      const dir = seededRandom(seed + s * 5 + 21) > 0.5 ? 1 : -1;

      if (isH) {
        cx += len * dir;
        cx = Math.max(5, Math.min(width - 5, cx));
      } else {
        cy += len * dir;
        cy = Math.max(5, Math.min(height - 5, cy));
      }
      path += ` L ${cx} ${cy}`;
    }

    thinTraces.push({ path, seed });
  }

  // === NODES — points de connexion aux extremites des traces ===
  traces.forEach((trace) => {
    trace.points.forEach((pt, idx) => {
      if (seededRandom(trace.seed + idx * 7) > 0.3) {
        nodes.push({
          x: pt.x, y: pt.y,
          type: seededRandom(trace.seed + idx * 13) > 0.6 ? 'glow' : 'normal',
          size: 1.5 + seededRandom(trace.seed + idx * 11) * 2,
        });
      }
    });
  });

  // === CHIPS — rectangles de composants IC ===
  const chipCount = 6;
  for (let i = 0; i < chipCount; i++) {
    const seed = i * 31 + 200;
    // Pousse les chips vers les bords de l'ecran
    const rawX = seededRandom(seed);
    const rawY = seededRandom(seed + 1);
    const cx = rawX < 0.5
      ? 15 + rawX * width * 0.35
      : width - 15 - (1 - rawX) * width * 0.35;
    const cy = rawY < 0.5
      ? 20 + rawY * height * 0.3
      : height - 20 - (1 - rawY) * height * 0.3;
    const w = 12 + seededRandom(seed + 2) * 16; // 12-28
    const h = 8 + seededRandom(seed + 3) * 10;  // 8-18
    const pins = 2 + Math.floor(seededRandom(seed + 4) * 4); // 2-5 pins de chaque cote

    chips.push({ x: cx - w / 2, y: cy - h / 2, w, h, pins, seed });
  }

  // === GRILLES DE POINTS — petits carres de dots ===
  const gridCount = 8;
  for (let i = 0; i < gridCount; i++) {
    const seed = i * 37 + 300;
    const gx = 20 + seededRandom(seed) * (width - 60);
    const gy = 20 + seededRandom(seed + 1) * (height - 60);
    const cols = 3 + Math.floor(seededRandom(seed + 2) * 4); // 3-6
    const rows = 2 + Math.floor(seededRandom(seed + 3) * 3); // 2-4
    const spacing = 5 + seededRandom(seed + 4) * 4;

    dotGrids.push({ x: gx, y: gy, cols, rows, spacing, seed });
  }

  // === HEXAGONES — formes geometriques ===
  const hexCount = 5;
  for (let i = 0; i < hexCount; i++) {
    const seed = i * 43 + 400;
    const cx = 40 + seededRandom(seed) * (width - 80);
    const cy = 40 + seededRandom(seed + 1) * (height - 80);
    const r = 12 + seededRandom(seed + 2) * 18;

    let path = '';
    for (let a = 0; a < 6; a++) {
      const angle = (Math.PI / 3) * a - Math.PI / 6;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      path += (a === 0 ? 'M' : 'L') + ` ${px} ${py}`;
    }
    path += ' Z';
    hexagons.push({ path, cx, cy, r, seed });
  }

  return { traces, thinTraces, nodes, chips, dotGrids, hexagons };
};

// ============================================
// COMPOSANT PRINCIPAL — CircuitBoardUltimate
// ============================================
const CircuitBoardUltimate = () => {
  const circuit = useMemo(() => generateCircuitBoard(W, H), []);

  // ============================================
  // SYSTÈME LED BLINK — 3 points secs désordonnés
  // ============================================
  const LED_POSITIONS = useMemo(() => [
    { x: W * 0.15, y: H * 0.12 },
    { x: W * 0.82, y: H * 0.42 },
    { x: W * 0.25, y: H * 0.78 },
  ], []);

  const led0 = useRef(new RNAnimated.Value(0)).current;
  const led1 = useRef(new RNAnimated.Value(0)).current;
  const led2 = useRef(new RNAnimated.Value(0)).current;
  const ledAnims = [led0, led1, led2];

  useEffect(() => {
    const timers = [];

    const blinkLed = (anim) => {
      const pause = 1500 + Math.random() * 3000;
      const timer = setTimeout(() => {
        RNAnimated.timing(anim, {
          toValue: 1, duration: 50, useNativeDriver: false,
        }).start(() => {
          const onTimer = setTimeout(() => {
            RNAnimated.timing(anim, {
              toValue: 0, duration: 80, useNativeDriver: false,
            }).start(() => {
              if (Math.random() < 0.3) {
                const dblTimer = setTimeout(() => {
                  RNAnimated.timing(anim, {
                    toValue: 1, duration: 50, useNativeDriver: false,
                  }).start(() => {
                    const dblOffTimer = setTimeout(() => {
                      RNAnimated.timing(anim, {
                        toValue: 0, duration: 80, useNativeDriver: false,
                      }).start(() => blinkLed(anim));
                    }, 100);
                    timers.push(dblOffTimer);
                  });
                }, 120);
                timers.push(dblTimer);
              } else {
                blinkLed(anim);
              }
            });
          }, 120);
          timers.push(onTimer);
        });
      }, pause);
      timers.push(timer);
    };

    ledAnims.forEach((anim, i) => {
      const startDelay = setTimeout(() => blinkLed(anim), i * 800 + Math.random() * 1000);
      timers.push(startDelay);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>

      {/* FOND GRADIENT GRIS-BLEU SOMBRE */}
      <LinearGradient
        colors={['#0C1219', '#101820', '#0E1A25', '#101820', '#0C1219']}
        locations={[0, 0.3, 0.5, 0.7, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* GLOW AMBIANT — large, doux, donne de la profondeur */}
      <View style={{
        position: 'absolute',
        top: H * 0.10, left: -W * 0.2, right: -W * 0.2,
        height: H * 0.50, borderRadius: H * 0.25,
        backgroundColor: 'rgba(0, 217, 132, 0.020)',
      }}/>
      {/* Second glow plus concentre */}
      <View style={{
        position: 'absolute',
        top: H * 0.20, left: W * 0.05, right: W * 0.05,
        height: H * 0.30, borderRadius: H * 0.15,
        backgroundColor: 'rgba(0, 217, 132, 0.015)',
      }}/>
      {/* Point de lumiere chaud au centre-haut */}
      <View style={{
        position: 'absolute',
        top: H * 0.28, left: W * 0.25, right: W * 0.25,
        height: H * 0.12, borderRadius: H * 0.06,
        backgroundColor: 'rgba(0, 217, 132, 0.025)',
      }}/>

      {/* ============================================ */}
      {/* COUCHE 1 — TRACES PRINCIPALES (epaisses)    */}
      {/* ============================================ */}
      <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
        {circuit.traces.map((t, i) => {
          // Les 8 premières traces sont les "artères" — plus épaisses et lumineuses
          const isMain = i < 8;
          return (
            <Path key={`mt-${i}`}
              d={t.path}
              fill="none"
              stroke={isMain
                ? "rgba(90, 110, 135, 0.30)"
                : "rgba(70, 85, 105, 0.12)"}
              strokeWidth={isMain ? 2.5 : 1}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </Svg>

      {/* ============================================ */}
      {/* COUCHE 2 — TRACES SECONDAIRES (fines)       */}
      {/* ============================================ */}
      <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>
        {circuit.thinTraces.map((t, i) => (
          <Path key={`tt-${i}`}
            d={t.path}
            fill="none"
            stroke="rgba(60, 75, 95, 0.08)"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>

      {/* ============================================ */}
      {/* COUCHE 3 — COMPOSANTS (chips, grids, hex)   */}
      {/* ============================================ */}
      <Svg width={W} height={H} style={{ position: 'absolute', top: 0, left: 0 }}>

        {/* CHIPS — rectangles IC avec pins */}
        {circuit.chips.map((chip, i) => (
          <G key={`chip-${i}`}>
            {/* Corps du chip */}
            <Rect
              x={chip.x} y={chip.y}
              width={chip.w} height={chip.h}
              rx="2"
              fill="rgba(15, 22, 32, 0.6)"
              stroke="rgba(80, 95, 115, 0.20)"
              strokeWidth="0.8"
            />
            {/* Pins haut */}
            {Array.from({ length: chip.pins }).map((_, p) => {
              const px = chip.x + (chip.w / (chip.pins + 1)) * (p + 1);
              return (
                <Line key={`ph-${i}-${p}`}
                  x1={px} y1={chip.y - 4} x2={px} y2={chip.y}
                  stroke="rgba(80, 95, 115, 0.18)" strokeWidth="0.8"
                />
              );
            })}
            {/* Pins bas */}
            {Array.from({ length: chip.pins }).map((_, p) => {
              const px = chip.x + (chip.w / (chip.pins + 1)) * (p + 1);
              return (
                <Line key={`pb-${i}-${p}`}
                  x1={px} y1={chip.y + chip.h} x2={px} y2={chip.y + chip.h + 4}
                  stroke="rgba(80, 95, 115, 0.18)" strokeWidth="0.8"
                />
              );
            })}
            {/* Petit cercle dans le coin du chip (marqueur) */}
            <Circle
              cx={chip.x + 3} cy={chip.y + 3} r="1"
              fill="rgba(80, 95, 115, 0.25)"
            />
          </G>
        ))}

        {/* GRILLES DE POINTS */}
        {circuit.dotGrids.map((grid, i) => (
          <G key={`grid-${i}`}>
            {Array.from({ length: grid.rows }).map((_, r) =>
              Array.from({ length: grid.cols }).map((_, c) => (
                <Circle key={`gd-${i}-${r}-${c}`}
                  cx={grid.x + c * grid.spacing}
                  cy={grid.y + r * grid.spacing}
                  r="1"
                  fill="rgba(80, 95, 115, 0.20)"
                />
              ))
            )}
          </G>
        ))}

        {/* HEXAGONES */}
        {circuit.hexagons.map((hex, i) => (
          <Path key={`hex-${i}`}
            d={hex.path}
            fill="none"
            stroke="rgba(80, 95, 115, 0.12)"
            strokeWidth="0.8"
          />
        ))}

        {/* NODES — points de connexion normaux (gris) */}
        {circuit.nodes.filter(n => n.type === 'normal').map((node, i) => (
          <Circle key={`nn-${i}`}
            cx={node.x} cy={node.y} r={node.size}
            fill="rgba(80, 95, 115, 0.25)"
          />
        ))}
      </Svg>

      {/* ============================================ */}
      {/* COUCHE 4 — LED BLINKS (3 points secs)        */}
      {/* ============================================ */}
      {LED_POSITIONS.map((pos, i) => (
        <RNAnimated.View
          key={`led-blink-${i}`}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: pos.x - 6,
            top: pos.y - 6,
            width: 12,
            height: 12,
            opacity: ledAnims[i],
          }}
        >
          {/* Halo diffus */}
          <View style={{
            position: 'absolute',
            top: -3, left: -3, right: -3, bottom: -3,
            borderRadius: 9,
            backgroundColor: 'rgba(0, 217, 132, 0.08)',
          }} />
          {/* Point central LED */}
          <View style={{
            position: 'absolute',
            top: 3, left: 3,
            width: 6, height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(0, 217, 132, 0.15)',
          }} />
          {/* Micro-dot vif */}
          <View style={{
            position: 'absolute',
            top: 4, left: 4,
            width: 4, height: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(0, 217, 132, 0.85)',
          }} />
        </RNAnimated.View>
      ))}

      {/* ============================================ */}
      {/* COUCHE 6 — Vignette sombre sur les bords     */}
      {/* (focus le regard au centre)                  */}
      {/* ============================================ */}
      <LinearGradient
        colors={['rgba(12,18,25,0.7)', 'rgba(12,18,25,0)', 'rgba(12,18,25,0)', 'rgba(12,18,25,0.7)']}
        locations={[0, 0.25, 0.75, 1]}
        start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(12,18,25,0.5)', 'rgba(12,18,25,0)', 'rgba(12,18,25,0)', 'rgba(12,18,25,0.5)']}
        locations={[0, 0.2, 0.8, 1]}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />

      {/* Zone centrale propre — masque le circuit au centre */}
      <View style={{
        position: 'absolute',
        top: H * 0.25, left: W * 0.05, right: W * 0.05,
        height: H * 0.45, borderRadius: 30,
        backgroundColor: 'rgba(12, 18, 25, 0.35)',
      }} pointerEvents="none" />
      {/* Deuxieme zone plus petite et plus opaque */}
      <View style={{
        position: 'absolute',
        top: H * 0.32, left: W * 0.10, right: W * 0.10,
        height: H * 0.30, borderRadius: 25,
        backgroundColor: 'rgba(12, 18, 25, 0.20)',
      }} pointerEvents="none" />
    </View>
  );
};

// ============================================================
// APP — PAGE TEST
// ============================================================

export default function App() {
  var miniCards = [
    { label: 'BMR', value: '1 826', color: '#00D984' },
    { label: 'TDEE', value: '2 830', color: '#00BFA6' },
    { label: 'GEMS', value: '150', color: '#D4AF37' },
  ];

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0C1219' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0C1219" />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>

          <CircuitBoardUltimate />

          {/* VOILE DÉPOLI — adoucit les circuits, derrière les cartes */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(13, 17, 23, 0.3)',
            }}
          />

          {/* Contenu test pour voir le contraste */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>

            <Text style={{
              color: '#EAEEF3', fontSize: 28, fontWeight: '800',
              letterSpacing: 4, textAlign: 'center', marginBottom: 8,
            }}>
              LIXUM
            </Text>
            <Text style={{
              color: '#00D984', fontSize: 14, fontWeight: '600',
              letterSpacing: 2, textAlign: 'center', marginBottom: 30,
            }}>
              BIO-DIGITAL DASHBOARD
            </Text>

            {/* Carte test glassmorphism */}
            <View style={s.testCard}>
              <View style={s.cardShine} />
              <Text style={{ color: '#8892A0', fontSize: 11, fontWeight: '600', letterSpacing: 2 }}>
                {'SCORE DE VITALIT\u00C9'}
              </Text>
              <Text style={{ color: '#00D984', fontSize: 42, fontWeight: '800', marginTop: 8 }}>
                2 330
              </Text>
              <Text style={{ color: '#555E6C', fontSize: 12 }}>kcal objectif quotidien</Text>
            </View>

            {/* Mini cartes test */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, width: '100%' }}>
              {miniCards.map(function (item, i) {
                return (
                  <View key={i} style={{
                    flex: 1, borderRadius: 12, padding: 12,
                    backgroundColor: 'rgba(21,27,35,0.7)',
                    borderWidth: 1, borderColor: item.color + '15',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: '#555E6C', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 }}>
                      {item.label}
                    </Text>
                    <Text style={{ color: item.color, fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                      {item.value}
                    </Text>
                  </View>
                );
              })}
            </View>

          </View>

        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================

var s = StyleSheet.create({
  testCard: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(21,27,35,0.75)',
    borderWidth: 1.2,
    borderTopColor: 'rgba(138,146,160,0.25)',
    borderLeftColor: 'rgba(107,123,141,0.12)',
    borderRightColor: 'rgba(42,48,59,0.25)',
    borderBottomColor: 'rgba(26,31,38,0.35)',
  },
  cardShine: {
    position: 'absolute',
    top: 0, left: 14, right: 14,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
