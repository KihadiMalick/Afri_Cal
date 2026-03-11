// LIXUM - Dashboard Background Test — Circuit Board ULTIMATE
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que les autres fichiers test

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  View, Dimensions, Text, StyleSheet, StatusBar,
  Animated as RNAnimated, ScrollView, TouchableOpacity, Platform, Modal,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Rect, Path, G, Defs, LinearGradient as SvgGradient, Stop, Polygon, ClipPath, Ellipse } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

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

      {/* FOND GRADIENT METALLIC DARK → DEEP BLACK */}
      <LinearGradient
        colors={['#1A2030', '#141A24', '#0D1117']}
        locations={[0, 0.5, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* GLOW AMBIANT — large halo émeraude */}
      <View style={{
        position: 'absolute',
        top: H * 0.08, left: -W * 0.15, right: -W * 0.15,
        height: H * 0.55, borderRadius: H * 0.28,
        backgroundColor: 'rgba(0, 217, 132, 0.035)',
      }}/>
      {/* Second glow plus concentré */}
      <View style={{
        position: 'absolute',
        top: H * 0.18, left: W * 0.05, right: W * 0.05,
        height: H * 0.35, borderRadius: H * 0.18,
        backgroundColor: 'rgba(0, 217, 132, 0.030)',
      }}/>
      {/* Point radiant central — glow émeraude visible */}
      <View style={{
        position: 'absolute',
        top: H * 0.22, left: W * 0.15, right: W * 0.15,
        height: H * 0.20, borderRadius: H * 0.10,
        backgroundColor: 'rgba(0, 217, 132, 0.06)',
      }}/>
      {/* Micro spot lumineux au coeur */}
      <View style={{
        position: 'absolute',
        top: H * 0.30, left: W * 0.30, right: W * 0.30,
        height: H * 0.08, borderRadius: H * 0.04,
        backgroundColor: 'rgba(0, 217, 132, 0.045)',
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
// COMPOSANT — Icône Gem SVG (émeraude taillée premium)
// ============================================================
const GemIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="gemBodyGrad" x1="0" y1="0" x2="0.2" y2="1">
        <Stop offset="0%" stopColor="#5DFFB4" />
        <Stop offset="30%" stopColor="#00D984" />
        <Stop offset="65%" stopColor="#00A866" />
        <Stop offset="100%" stopColor="#005C38" />
      </SvgGradient>
      <SvgGradient id="gemTopGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#8AFFDA" />
        <Stop offset="100%" stopColor="#00D984" />
      </SvgGradient>
    </Defs>
    {/* Corps principal — pentagone taillé */}
    <Polygon points="12,2 3,9 7,22 17,22 21,9" fill="url(#gemBodyGrad)" />
    {/* Couronne supérieure */}
    <Polygon points="12,2 3,9 21,9" fill="url(#gemTopGrad)" />
    {/* Facette table centrale */}
    <Polygon points="8,9 16,9 14.5,5.5 9.5,5.5" fill="#5DFFB4" opacity={0.35} />
    {/* Facettes inférieures — gauche */}
    <Polygon points="3,9 7,22 12,9" fill="#00BF78" opacity={0.25} />
    {/* Facettes inférieures — droite */}
    <Polygon points="21,9 17,22 12,9" fill="#007A4A" opacity={0.35} />
    {/* Facette centrale basse */}
    <Polygon points="7,22 17,22 12,9" fill="#009960" opacity={0.2} />
    {/* Ceinture (girdle) */}
    <Line x1="3" y1="9" x2="21" y2="9" stroke="#8AFFDA" strokeWidth={0.6} opacity={0.5} />
    {/* Reflet brillant principal */}
    <Polygon points="10,4 12,2.5 14,4 12,6" fill="white" opacity={0.5} />
    {/* Éclat secondaire */}
    <Circle cx="6.5" cy="7.5" r={0.7} fill="white" opacity={0.35} />
    {/* Éclat tertiaire */}
    <Circle cx="16" cy="13" r={0.5} fill="white" opacity={0.2} />
  </Svg>
);

// ============================================================
// ICÔNES SVG CUSTOM — remplacent les emojis
// ============================================================
const HeartIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="heartGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FF6B8A" />
        <Stop offset="100%" stopColor="#FF3B5C" />
      </SvgGradient>
    </Defs>
    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#heartGrad)" />
    <Ellipse cx="8" cy="7.5" rx="2.5" ry="1.8" fill="white" opacity={0.25} />
  </Svg>
);

const FlameIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="flameGrad" x1="0.5" y1="1" x2="0.5" y2="0">
        <Stop offset="0%" stopColor="#FF4500" />
        <Stop offset="50%" stopColor="#FF8C42" />
        <Stop offset="100%" stopColor="#FFD700" />
      </SvgGradient>
    </Defs>
    <Path d="M12 2C8.5 7 4 9.5 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2-1-3.5-2-5-.5 1.5-1.5 2.5-3 3-1-4-3-6.5-3-10z" fill="url(#flameGrad)" />
    <Path d="M12 22c-2.21 0-4-1.79-4-4 0-2 2-3.5 3-5.5.5 1 1.5 1.5 2.5 2 .5-1.5 1-3 .5-4.5 1 1.5 2 3.5 2 5.5 0 1.5-.5 2.5-1.5 3.5-.5.5-1.5 1-2.5 1z" fill="#FFD700" opacity={0.5} />
  </Svg>
);

const BoltIcon = () => (
  <Svg width={28} height={28} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="boltGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FFE066" />
        <Stop offset="100%" stopColor="#FFB800" />
      </SvgGradient>
    </Defs>
    <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="url(#boltGrad)" />
    <Path d="M11 5l-4 7h3.5l-.5 4 4.5-6H11l.5-5z" fill="white" opacity={0.15} />
  </Svg>
);

const DropletIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="dropGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#7DD3FC" />
        <Stop offset="100%" stopColor="#0EA5E9" />
      </SvgGradient>
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

const LightbulbIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="bulbGrad" x1="0.5" y1="0" x2="0.5" y2="1">
        <Stop offset="0%" stopColor="#FFE066" />
        <Stop offset="100%" stopColor="#FFB800" />
      </SvgGradient>
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
      <SvgGradient id="statsGrad" x1="0" y1="1" x2="0" y2="0">
        <Stop offset="0%" stopColor="#00A866" />
        <Stop offset="100%" stopColor="#00D984" />
      </SvgGradient>
    </Defs>
    <Rect x="3" y="14" width="4" height="8" rx="1" fill="url(#statsGrad)" opacity={0.6} />
    <Rect x="10" y="8" width="4" height="14" rx="1" fill="url(#statsGrad)" opacity={0.8} />
    <Rect x="17" y="4" width="4" height="18" rx="1" fill="url(#statsGrad)" />
  </Svg>
);

const LockIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect x="5" y="11" width="14" height="10" rx="2" fill="#8892A0" opacity={0.6} />
    <Path d="M8 11V7c0-2.21 1.79-4 4-4s4 1.79 4 4v4" fill="none" stroke="#8892A0" strokeWidth={2} strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.5" fill="#EAEEF3" />
  </Svg>
);

const StarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#D4AF37" />
  </Svg>
);

const GoalFlag = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="flagGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0%" stopColor="#FFD700" />
        <Stop offset="100%" stopColor="#D4AF37" />
      </SvgGradient>
    </Defs>
    <Line x1="5" y1="3" x2="5" y2="21" stroke="#D4AF37" strokeWidth={1.8} strokeLinecap="round" />
    <Path d="M5 3C5 3 8 2 11 4C14 6 17 5 19 3V12C17 14 14 15 11 13C8 11 5 12 5 12V3Z" fill="url(#flagGrad)" opacity={0.85} />
    <Path d="M7 4C9 3.5 11 4 13 5.5" fill="none" stroke="white" strokeWidth={0.5} opacity={0.4} />
    <Circle cx="5" cy="21" r="1.5" fill="#D4AF37" />
  </Svg>
);

// ============================================================
// COMPOSANT — Header Global (Mood + LIXUM + Lix)
// ============================================================
const Header = ({ moodFilled, lixCount, notifCount = 0, onMoodPress, onLixPress }) => {
  // Animation shake pour le mood non rempli
  const shakeAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (moodFilled) return;
    const shake = () => {
      RNAnimated.sequence([
        RNAnimated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: -1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
        RNAnimated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    };
    shake();
    const interval = setInterval(shake, 3000);
    return () => clearInterval(interval);
  }, [moodFilled]);

  const rotate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  return (
    <View style={s.header}>
      {/* Mood icon — gauche */}
      <TouchableOpacity onPress={onMoodPress} activeOpacity={0.7} style={s.moodBtn}>
        <RNAnimated.View style={{ transform: [{ rotate: moodFilled ? '0deg' : rotate }] }}>
          <View style={s.moodCircle}>
            <Text style={{ fontSize: 20 }}>{moodFilled ? '\u{1F60A}' : '\u{1F636}'}</Text>
          </View>
        </RNAnimated.View>
        {!moodFilled && (
          <View style={s.moodBadge}>
            <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>!</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Logo LIXUM — centre */}
      <Text style={s.logoText}>LIXUM</Text>

      {/* Lix counter — droite */}
      <TouchableOpacity onPress={onLixPress} activeOpacity={0.7} style={s.lixBtn}>
        <View style={{ position: 'relative' }}>
          <GemIcon size={20} />
          {notifCount > 0 && (
            <View style={s.notifBadge}>
              <Text style={s.notifBadgeText}>{notifCount}</Text>
            </View>
          )}
        </View>
        <Text style={s.lixCount}>{lixCount.toLocaleString('fr-FR')}</Text>
        <Text style={s.lixLabel}>Lix</Text>
      </TouchableOpacity>
    </View>
  );
};

// ============================================================
// COMPOSANT — Barre de progression
// ============================================================
const ProgressBar = ({ percent, color = '#00D984' }) => (
  <View style={s.progressBg}>
    <LinearGradient
      colors={[color, color + 'AA']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={[s.progressFill, { width: Math.min(percent, 100) + '%' }]}
    />
    <Text style={s.progressText}>{percent}%</Text>
  </View>
);

// ============================================================
// COMPOSANT — Carte Glassmorphism réutilisable
// ============================================================
const GlassCard = ({ children, style }) => (
  <View style={[s.glassCard, style]}>
    <View style={s.cardShine} />
    {children}
  </View>
);

// ============================================================
// UTILITAIRE — Bézier smooth path
// ============================================================
function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpy1 = prev.y;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
    const cpy2 = curr.y;
    d += ` C ${cpx1.toFixed(1)},${cpy1.toFixed(1)} ${cpx2.toFixed(1)},${cpy2.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
  }
  return d;
}

// ============================================================
// DONNÉES — Mock calories/activités
// ============================================================
const DAILY_OBJECTIVE = 2330;

const ACTIVITIES_KCAL_PER_HOUR = {
  'marche_rapide': 420,
  'course': 860,
  'velo': 640,
  'natation': 770,
  'musculation': 450,
  'yoga': 250,
  'corde_a_sauter': 900,
  'football': 680,
  'basketball': 720,
  'danse': 500,
};

const WATER_LOSS_PER_HOUR_ML = 700;

function calculateWaterLoss(durationMin, intensity) {
  const hours = durationMin / 60;
  const mult = { leger: 0.6, modere: 1.0, intense: 1.4 };
  return Math.round(hours * WATER_LOSS_PER_HOUR_ML * (mult[intensity] || 1.0));
}

function suggestActivities(surplusKcal) {
  return Object.entries(ACTIVITIES_KCAL_PER_HOUR)
    .map(([activity, kcalPerHour]) => ({
      activity,
      minutesNeeded: Math.ceil((surplusKcal / kcalPerHour) * 60),
      kcalBurned: surplusKcal,
    }))
    .filter(a => a.minutesNeeded <= 120)
    .sort((a, b) => a.minutesNeeded - b.minutesNeeded)
    .slice(0, 4);
}

const ACTIVITY_ICONS = {
  marche_rapide: '🚶', course: '🏃', velo: '🚴', natation: '🏊',
  musculation: '🏋️', yoga: '🧘', corde_a_sauter: '⏭', football: '⚽',
  basketball: '🏀', danse: '💃',
};
const ACTIVITY_LABELS = {
  marche_rapide: 'Marche rapide', course: 'Course', velo: 'Vélo', natation: 'Natation',
  musculation: 'Musculation', yoga: 'Yoga', corde_a_sauter: 'Corde à sauter',
  football: 'Football', basketball: 'Basketball', danse: 'Danse',
};

const MOCK_DAILY_DATA = {
  consumed: [
    0, 0, 80, 150, 320, 480, 650, 820, 980, 1100,
    1200, 1300, 1380, 1440, 1500, 1540, 1560, 1575, 1580, 1585
  ],
  burned: [
    0, 0, 0, 0, 50, 120, 200, 350, 500, 580,
    650, 700, 750, 790, 820, 840, 855, 862, 868, 870
  ],
};

const MOCK_GENERAL_DATA = [
  { week: 1, avgConsumed: 2100, avgBurned: 350 },
  { week: 2, avgConsumed: 2250, avgBurned: 420 },
  { week: 3, avgConsumed: 2180, avgBurned: 380 },
  { week: 4, avgConsumed: 2300, avgBurned: 450 },
  { week: 5, avgConsumed: 2150, avgBurned: 500 },
  { week: 6, avgConsumed: 2280, avgBurned: 480 },
  { week: 7, avgConsumed: 2200, avgBurned: 520 },
  { week: 8, avgConsumed: 2350, avgBurned: 550 },
  { week: 9, avgConsumed: 2280, avgBurned: 500 },
  { week: 10, avgConsumed: 2310, avgBurned: 480 },
  { week: 11, avgConsumed: 2330, avgBurned: 520 },
  { week: 12, avgConsumed: 2320, avgBurned: 550 },
];

// ============================================================
// COMPOSANT — Graphe 3 Dômes Premium Side-by-Side
// ============================================================
const EnergyDomesChart = ({ consomme = 1585, brule = 870, reste = 1615 }) => {
  const SCALE_WIDTH = 35;
  const cW = W - 64 - SCALE_WIDTH;
  const svgH = 200;
  const labelSpace = 24;
  const thirdW = cW / 3;
  const maxCalorie = 3000;
  const maxValue = maxCalorie;

  const domes = [
    { value: consomme, label: 'Consommé', color: '#00D984', gradId: 'domeGradGreen' },
    { value: brule, label: 'Brûlé / Sport', color: '#FF8C42', gradId: 'domeGradOrange' },
    { value: reste, label: 'Reste à récupérer', color: '#4DA6FF', gradId: 'domeGradBlue' },
  ];

  const getDomeH = (v) => (v / maxValue) * (svgH - 10);

  const buildDomePath = (idx, value) => {
    const x1 = idx * thirdW;
    const x2 = (idx + 1) * thirdW;
    const midX = (x1 + x2) / 2;
    const h = getDomeH(value);
    const topY = svgH - h;
    const baseY = svgH;
    const cp = thirdW * 0.3;
    return `M ${x1} ${baseY} C ${x1 + cp} ${baseY} ${x1 + cp} ${topY} ${midX} ${topY} C ${x2 - cp} ${topY} ${x2 - cp} ${baseY} ${x2} ${baseY} Z`;
  };

  // Render order: blue (back) → green (mid) → orange (front)
  const renderOrder = [2, 0, 1];

  const scaleTicks = [1000, 2000, 3000];

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <View style={{ height: svgH + labelSpace, flex: 1 }}>
        {/* Valeurs au sommet de chaque dôme */}
        {domes.map((dome, i) => {
          const h = getDomeH(dome.value);
          const topY = svgH - h;
          return (
            <Text key={`dv-${i}`} style={{
              position: 'absolute',
              top: topY + labelSpace - 24,
              left: i * thirdW,
              width: thirdW,
              textAlign: 'center',
              color: dome.color,
              fontSize: 18,
              fontWeight: '800',
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
              zIndex: 10,
            }}>
              {dome.value.toLocaleString('fr-FR')}
            </Text>
          );
        })}

        {/* SVG — lignes de grille + 3 dômes */}
        <Svg width={cW} height={svgH} style={{ position: 'absolute', bottom: 0, left: 0 }}>
          <Defs>
            {domes.map((dome) => (
              <SvgGradient key={dome.gradId} id={dome.gradId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={dome.color} stopOpacity="0.7" />
                <Stop offset="1" stopColor={dome.color} stopOpacity="0.05" />
              </SvgGradient>
            ))}
          </Defs>

          {/* Lignes de grille horizontales — derrière les dômes */}
          {[500, 1000, 1500, 2000, 2500, 3000].map((val) => {
            const y = svgH - (val / maxCalorie) * (svgH - 10);
            return (
              <Line
                key={`grid-${val}`}
                x1={0}
                y1={y}
                x2={cW}
                y2={y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth={1}
                strokeDasharray="4 6"
              />
            );
          })}

          {renderOrder.map((idx) => {
            const dome = domes[idx];
            const path = buildDomePath(idx, dome.value);
            const midX = idx * thirdW + thirdW / 2;
            const h = getDomeH(dome.value);
            const topY = svgH - h;
            return (
              <G key={`dome-${idx}`}>
                {/* Glow ellipse derrière le dôme */}
                <Ellipse
                  cx={midX}
                  cy={svgH - h * 0.4}
                  rx={thirdW * 0.5}
                  ry={h * 0.4}
                  fill={dome.color}
                  opacity={0.12}
                />
                {/* Stroke glow (large, transparent) */}
                <Path d={path} fill="none" stroke={dome.color} strokeWidth={6} opacity={0.12} />
                {/* Dôme principal */}
                <Path d={path} fill={`url(#${dome.gradId})`} stroke={dome.color} strokeWidth={2.5} />
                {/* Point sommet */}
                <Circle cx={midX} cy={topY} r={3} fill={dome.color} />
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Colonne paliers à droite */}
      <View style={{ width: SCALE_WIDTH, height: svgH + labelSpace, position: 'relative' }}>
        {scaleTicks.map(val => {
          const bottomOffset = (val / maxCalorie) * (svgH - 10);
          return (
            <Text key={`scale-${val}`} style={{
              position: 'absolute',
              bottom: bottomOffset - 5,
              left: 4,
              fontSize: 9,
              color: '#8892A0',
              opacity: 0.6,
            }}>
              {val.toLocaleString('fr-FR')}
            </Text>
          );
        })}
      </View>
      </View>

      {/* Labels sous les dômes */}
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        {domes.map((dome, i) => (
          <View key={`dl-${i}`} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#8892A0', fontSize: 11, textAlign: 'center' }}>{dome.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ============================================================
// COMPOSANT — Alerte Dépassement d'objectif
// ============================================================
const SurplusAlertModal = ({ visible, onClose, surplus, onAddActivity }) => {
  const suggestions = useMemo(() => suggestActivities(surplus), [surplus]);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: '#151B23', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,107,74,0.3)' }}>
          <Text style={{ color: '#FF6B4A', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 16 }}>
            ⚠️ DÉPASSEMENT D'OBJECTIF
          </Text>

          <View style={{ backgroundColor: 'rgba(255,107,74,0.08)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <Text style={{ color: '#C0C8D4', fontSize: 13 }}>Bilan net du jour : <Text style={{ color: '#FF6B4A', fontWeight: '700' }}>{(DAILY_OBJECTIVE + surplus).toLocaleString('fr-FR')} kcal</Text></Text>
            <Text style={{ color: '#C0C8D4', fontSize: 13, marginTop: 4 }}>Objectif : <Text style={{ fontWeight: '700' }}>{DAILY_OBJECTIVE.toLocaleString('fr-FR')} kcal</Text></Text>
            <Text style={{ color: '#FF6B4A', fontSize: 15, fontWeight: '800', marginTop: 6 }}>Surplus : +{surplus} kcal</Text>
          </View>

          <Text style={{ color: '#8892A0', fontSize: 12, fontWeight: '600', marginBottom: 10 }}>
            💡 Pour compenser, essayez :
          </Text>

          {suggestions.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < suggestions.length - 1 ? 1 : 0, borderBottomColor: 'rgba(80,95,115,0.1)' }}>
              <Text style={{ fontSize: 16, width: 28 }}>{ACTIVITY_ICONS[s.activity] || '🏃'}</Text>
              <Text style={{ flex: 1, color: '#C0C8D4', fontSize: 13 }}>{ACTIVITY_LABELS[s.activity]}</Text>
              <Text style={{ color: '#8892A0', fontSize: 12 }}>{s.minutesNeeded} min</Text>
              <Text style={{ color: '#00D984', fontSize: 12, fontWeight: '700', width: 60, textAlign: 'right' }}>-{s.kcalBurned}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={{ backgroundColor: '#00D984', borderRadius: 12, paddingVertical: 14, marginTop: 18, alignItems: 'center' }}
            activeOpacity={0.7}
            onPress={() => { onAddActivity && onAddActivity(); onClose(); }}
          >
            <Text style={{ color: '#0C1219', fontSize: 14, fontWeight: '800', letterSpacing: 1 }}>AJOUTER UNE ACTIVITÉ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(80,95,115,0.3)', paddingVertical: 12, marginTop: 10, alignItems: 'center' }}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <Text style={{ color: '#8892A0', fontSize: 13, fontWeight: '600' }}>OK, J'AI COMPRIS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ============================================================
// COMPOSANT — Silhouette SVG avec remplissage eau
// ============================================================
const MALE_PATH = 'M50,8 C50,8 42,8 42,16 C42,24 50,24 50,24 C50,24 58,24 58,16 C58,8 50,8 50,8 Z M50,26 L38,32 L32,60 L38,62 L42,42 L46,80 L42,120 L46,122 L50,90 L54,122 L58,120 L54,80 L58,42 L62,62 L68,60 L62,32 Z';
const FEMALE_PATH = 'M50,8 C50,8 42,8 42,16 C42,24 50,26 50,26 C50,26 58,24 58,16 C58,8 50,8 50,8 Z M50,28 L40,34 L34,55 L40,58 L38,42 L44,70 L38,75 L42,78 L46,80 L42,120 L46,122 L50,90 L54,122 L58,120 L54,80 L58,78 L62,75 L56,70 L62,42 L60,58 L66,55 L60,34 Z';

const BUBBLE_CONFIG = [
  { cx: 35, size: 3, duration: 2000, delay: 0 },
  { cx: 50, size: 2, duration: 2500, delay: 800 },
  { cx: 42, size: 4, duration: 3000, delay: 400 },
  { cx: 55, size: 2.5, duration: 2200, delay: 1200 },
  { cx: 38, size: 1.5, duration: 1800, delay: 600 },
  { cx: 58, size: 2, duration: 2600, delay: 1000 },
  { cx: 46, size: 3.5, duration: 2800, delay: 200 },
];

const SilhouetteFill = ({ fillPercent, height = 60, gender = 'homme', showBubbles = false }) => {
  const fillAnim = useRef(new RNAnimated.Value(fillPercent)).current;
  const svgPath = gender === 'femme' ? FEMALE_PATH : MALE_PATH;
  const vbH = 130;
  const ratio = height / vbH;
  const svgW = Math.round(100 * ratio);
  const clipId = `silClip_${height}_${gender}`;
  const gradId = `waterGrad_${height}_${gender}`;

  // Bubble animations
  const bubbleAnims = useRef(BUBBLE_CONFIG.map(() => new RNAnimated.Value(0))).current;
  const [bubblePositions, setBubblePositions] = useState(BUBBLE_CONFIG.map(() => 0));

  useEffect(() => {
    RNAnimated.timing(fillAnim, {
      toValue: fillPercent, duration: 400, useNativeDriver: false,
    }).start();
  }, [fillPercent]);

  useEffect(() => {
    if (!showBubbles || fillPercent < 10) return;
    const timers = [];
    bubbleAnims.forEach((anim, i) => {
      const cfg = BUBBLE_CONFIG[i];
      const startTimer = setTimeout(() => {
        const loop = () => {
          anim.setValue(0);
          RNAnimated.timing(anim, {
            toValue: 1, duration: cfg.duration, useNativeDriver: false,
          }).start(() => loop());
        };
        loop();
        // Track position for rendering
        anim.addListener(({ value }) => {
          setBubblePositions(prev => {
            const next = [...prev];
            next[i] = value;
            return next;
          });
        });
      }, cfg.delay);
      timers.push(startTimer);
    });
    return () => { timers.forEach(t => clearTimeout(t)); bubbleAnims.forEach(a => a.removeAllListeners()); };
  }, [showBubbles, fillPercent > 10]);

  const waterTop = vbH * (1 - fillPercent / 100);
  const waterHeight = vbH * (fillPercent / 100);

  return (
    <View style={{ width: svgW, height }}>
      {/* Static empty silhouette */}
      <Svg width={svgW} height={height} viewBox="0 0 100 130" style={{ position: 'absolute' }}>
        <Path d={svgPath} fill="#2A3040" opacity={0.5} />
      </Svg>
      {/* Filled silhouette with clipPath + bubbles */}
      <Svg width={svgW} height={height} viewBox="0 0 100 130" style={{ position: 'absolute' }}>
        <Defs>
          <ClipPath id={clipId}>
            <Path d={svgPath} />
          </ClipPath>
          <SvgGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor="#006994" stopOpacity="0.9" />
            <Stop offset="0.5" stopColor="#00BCD4" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#4DA6FF" stopOpacity="0.7" />
          </SvgGradient>
        </Defs>
        <G clipPath={`url(#${clipId})`}>
          <Rect x="0" y={waterTop} width="100" height={waterHeight} fill={`url(#${gradId})`} />
          {/* Animated bubbles inside water */}
          {showBubbles && fillPercent >= 10 && BUBBLE_CONFIG.map((cfg, i) => {
            const progress = bubblePositions[i] || 0;
            const bubbleY = waterTop + waterHeight - (progress * waterHeight);
            const oscillation = Math.sin(progress * Math.PI * 4) * 3;
            const opacity = progress < 0.8 ? 0.3 : 0.3 * (1 - (progress - 0.8) / 0.2);
            return (
              <Circle
                key={`bubble-${i}`}
                cx={cfg.cx + oscillation}
                cy={bubbleY}
                r={cfg.size}
                fill="#FFFFFF"
                opacity={Math.max(0, opacity)}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

// ============================================================
// COMPOSANT — Carte Hydratation compacte (dashboard)
// ============================================================
const HydrationCardCompact = ({ currentMl, goalMl, gender, onPress, sportAlert }) => {
  const percent = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  const glasses = Math.round(currentMl / 250);
  const totalGlasses = Math.round(goalMl / 250);
  const liters = (currentMl / 1000).toFixed(1);
  const goalL = (goalMl / 1000).toFixed(1);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={s.hydrationCard}>
      {/* Mini silhouette gauche */}
      <SilhouetteFill fillPercent={percent} height={56} gender={gender} />

      {/* Infos droite */}
      <View style={{ flex: 1, marginLeft: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <DropletIcon size={16} />
            <Text style={s.hydrationTitle}>HYDRATATION</Text>
          </View>
          <Text style={s.hydrationLiters}>{liters} / {goalL}L</Text>
        </View>

        {/* Barre de progression */}
        <View style={s.hydroBar}>
          <LinearGradient
            colors={['#4DA6FF', '#00BCD4']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[s.hydroBarFill, { width: percent + '%' }]}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
          <Text style={s.hydroGlasses}>{glasses}/{totalGlasses} verres 🥛</Text>
          <Text style={s.hydroPercent}>{percent}%</Text>
        </View>

        {/* Sport water loss alert */}
        {sportAlert ? (
          <Text style={{ color: '#FF8C42', fontSize: 10, marginTop: 4 }}>{sportAlert}</Text>
        ) : (
          <Text style={{ color: '#555E6C', fontSize: 10, marginTop: 4 }}>Tap pour ajouter →</Text>
        )}

        {/* Low hydration warning */}
        {percent < 30 && percent > 0 && (
          <Text style={{ color: '#FF3B30', fontSize: 10, fontWeight: '700', marginTop: 2 }}>
            ⚠️ Pensez à vous réhydrater ! 💧
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ============================================================
// COMPOSANT — Page Hydratation Fullscreen (Modal)
// ============================================================
const HydrationModal = ({ visible, onClose, currentMl, setCurrentMl, goalMl, gender, hydroLogs, setHydroLogs }) => {
  const percent = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  const glasses = Math.round(currentMl / 250);
  const totalGlasses = Math.round(goalMl / 250);

  const getTimeStr = () => {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  };

  const addWater = (ml) => {
    setCurrentMl(prev => prev + ml);
    setHydroLogs(prev => [...prev, { time: getTimeStr(), amount: ml, type: 'eau', icon: '💧' }]);
  };

  const removeWater = (ml) => {
    setCurrentMl(prev => Math.max(0, prev - ml));
    setHydroLogs(prev => {
      const idx = [...prev].reverse().findIndex(l => l.amount === ml && l.type === 'eau');
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return [...prev.slice(0, realIdx), ...prev.slice(realIdx + 1)];
    });
  };

  const palierLabels = gender === 'homme'
    ? ['0.6L', '1.25L', '1.9L', '2.5L']
    : ['0.5L', '1L', '1.5L', '2L'];

  const quantities = [
    { ml: 50, icon: '🥛', label: '50ml' },
    { ml: 250, icon: '🥤', label: '250ml' },
    { ml: 1000, icon: '🫗', label: '1L' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: '#0C1219' }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Header */}
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={24} color="#EAEEF3" />
            </TouchableOpacity>
            <Text style={s.modalTitle}>HYDRATATION</Text>
            <Text style={{ fontSize: 20 }}>💧</Text>
          </View>

          <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <Text style={s.hydroModalSubtitle}>MON HYDRATATION{'\n'}AUJOURD'HUI</Text>

            {/* Grande silhouette avec marqueurs + bulles */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
              <SilhouetteFill fillPercent={percent} height={220} gender={gender} showBubbles />
              {/* Marqueurs paliers */}
              <View style={{ marginLeft: 16, height: 220, justifyContent: 'space-between', paddingVertical: 8 }}>
                {palierLabels.slice().reverse().map((label, i) => {
                  const palierPct = (4 - i) * 25;
                  const reached = percent >= palierPct;
                  return (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 12, height: 1, backgroundColor: reached ? '#4DA6FF' : '#2A3040' }} />
                      <Text style={{ color: reached ? '#4DA6FF' : '#555E6C', fontSize: 11, marginLeft: 6, fontWeight: reached ? '700' : '400' }}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Compteur */}
            <Text style={s.hydroBigCount}>
              <Text style={{ color: '#4DA6FF' }}>{currentMl.toLocaleString('fr-FR')}</Text>
              <Text style={{ color: '#555E6C' }}> / {goalMl.toLocaleString('fr-FR')} ml</Text>
            </Text>

            {/* Barre large */}
            <View style={[s.hydroBar, { width: W - 64, height: 10, marginTop: 10 }]}>
              <LinearGradient
                colors={['#4DA6FF', '#00BCD4']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.hydroBarFill, { width: percent + '%', height: 10 }]}
              />
            </View>
            <Text style={{ color: '#4DA6FF', fontSize: 14, fontWeight: '700', marginTop: 6 }}>{percent}% • {glasses}/{totalGlasses} verres</Text>

            {/* Low hydration warning */}
            {percent < 30 && percent > 0 && (
              <View style={{ backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 10, padding: 10, marginTop: 10, width: W - 64 }}>
                <Text style={{ color: '#FF3B30', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                  ⚠️ Pensez à vous réhydrater ! 💧
                </Text>
              </View>
            )}

            {/* Boutons quantité avec + (tap) et − */}
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 20 }}>
              {quantities.map((item) => (
                <View key={item.ml} style={{ alignItems: 'center' }}>
                  <TouchableOpacity style={s.qtyBtn} activeOpacity={0.7} onPress={() => addWater(item.ml)}>
                    <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                    <Text style={s.qtyBtnText}>{item.label}</Text>
                  </TouchableOpacity>
                  {/* Bouton minus */}
                  <TouchableOpacity style={s.minusBtn} activeOpacity={0.7} onPress={() => removeWater(item.ml)}>
                    <Text style={s.minusBtnText}>−</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Bouton AJOUTER BOISSONS — PRO */}
            <TouchableOpacity style={s.addBeverageBtn} activeOpacity={0.7}>
              <Text style={s.addBeverageBtnText}>AJOUTER BOISSONS 🥤</Text>
              <View style={s.proBadgeLg}>
                <Ionicons name="lock-closed" size={10} color="#D4AF37" />
                <Text style={{ color: '#D4AF37', fontSize: 10, fontWeight: '800', marginLeft: 3 }}>PRO</Text>
              </View>
            </TouchableOpacity>
            <Text style={{ color: '#555E6C', fontSize: 10, marginTop: 4, textAlign: 'center' }}>
              L'IA analyse la composition en eau de toute boisson
            </Text>

            {/* Historique */}
            <View style={{ width: W - 64, marginTop: 24 }}>
              <Text style={{ color: '#8892A0', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 10 }}>━ Historique aujourd'hui ━</Text>
              {hydroLogs.map((log, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                  <Text style={{ color: '#555E6C', fontSize: 12, width: 50 }}>{log.time}</Text>
                  <Text style={{ fontSize: 14 }}>{log.icon || '💧'}</Text>
                  <Text style={{ color: log.amount < 0 ? '#FF8C42' : '#C0C8D4', fontSize: 13, marginLeft: 6, flex: 1 }}>
                    {log.amount > 0 ? '+' : ''}{log.amount}ml {log.type}
                  </Text>
                </View>
              ))}
              {hydroLogs.length === 0 && (
                <Text style={{ color: '#555E6C', fontSize: 12, fontStyle: 'italic' }}>Aucune entrée aujourd'hui</Text>
              )}
            </View>

            {/* Réinitialiser */}
            <TouchableOpacity
              style={s.resetBtn}
              activeOpacity={0.7}
              onPress={() => { setCurrentMl(0); }}
            >
              <Text style={s.resetBtnText}>🔄 RÉINITIALISER</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

// ============================================================
// COMPOSANT — Dashboard Content (page Accueil)
// ============================================================
const DashboardContent = ({ onHydrationPress, hydrationMl, hydrationGoal, gender, burnedExtra, sportAlert, consumedTotal, burnedTotal }) => {
  const [chartMode, setChartMode] = useState('daily');
  const streakDays = 12;
  const streakColor = streakDays >= 14 ? '#D4AF37'
    : streakDays >= 7 ? '#00D984'
    : streakDays >= 3 ? '#00BFA6' : '#8892A0';

  // Reste = Objectif - (Consommé - Brûlé total) → 2330 - (1585 - 870) = 1615
  const remaining = Math.max(0, DAILY_OBJECTIVE - (consumedTotal - burnedTotal));

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ====== CARTE PRINCIPALE — Bilan Énergétique Area Fill ====== */}
      <GlassCard>
        {/* Header: titre + objectif */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <Text style={s.cardLabel}>BILAN ÉNERGÉTIQUE</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#8892A0', fontSize: 11 }}>Objectif de Calories</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <GoalFlag />
              <Text style={{ color: '#EAEEF3', fontSize: 16, fontWeight: '800' }}>{DAILY_OBJECTIVE.toLocaleString('fr-FR')} kcal</Text>
            </View>
          </View>
        </View>

        <EnergyDomesChart consomme={consumedTotal} brule={burnedTotal} reste={remaining} />

        {/* Onglets Journalier / Général */}
        <View style={s.chartTabsRow}>
          <TouchableOpacity
            style={[s.chartTab, chartMode === 'daily' && s.chartTabActive]}
            onPress={() => setChartMode('daily')}
            activeOpacity={0.7}
          >
            <Text style={[s.chartTabText, chartMode === 'daily' && s.chartTabTextActive]}>Journalier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.chartTab, chartMode === 'general' && s.chartTabActive]}
            onPress={() => setChartMode('general')}
            activeOpacity={0.7}
          >
            <Text style={[s.chartTabText, chartMode === 'general' && s.chartTabTextActive]}>Général</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* ====== 3 MINI-CARTES — BMR / Discipline / TDEE ====== */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        {/* BMR */}
        <View style={s.miniCard}>
          <HeartIcon />
          <Text style={s.miniCardTitle}>BMR</Text>
          <Text style={[s.miniValue, { color: '#00D984' }]}>1 826</Text>
          <Text style={s.miniCardUnit}>kcal</Text>
        </View>
        {/* Discipline */}
        <View style={s.miniCard}>
          <FlameIcon />
          <Text style={s.miniCardTitle}>DISCIPLINE</Text>
          <Text style={[s.miniValue, { color: streakColor, fontSize: 26 }]}>{streakDays}</Text>
          <Text style={s.miniCardUnit}>jours série</Text>
        </View>
        {/* TDEE */}
        <View style={s.miniCard}>
          <BoltIcon />
          <Text style={s.miniCardTitle}>TDEE</Text>
          <Text style={[s.miniValue, { color: '#00D984' }]}>2 830</Text>
          <Text style={s.miniCardUnit}>kcal</Text>
        </View>
      </View>

      {/* ====== CARTE HYDRATATION COMPACTE ====== */}
      <HydrationCardCompact
        currentMl={hydrationMl}
        goalMl={hydrationGoal}
        gender={gender}
        onPress={onHydrationPress}
        sportAlert={sportAlert}
      />

      {/* ======================================================= */}
      {/* BELOW THE FOLD — Zone scrollable                        */}
      {/* ======================================================= */}

      {/* DERNIER REPAS */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18, marginBottom: 8, marginLeft: 4 }}>
        <PlateIcon />
        <Text style={s.sectionTitleText}>DERNIER REPAS</Text>
      </View>
      <GlassCard>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={s.mealPhoto}>
            <PlateIcon />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.mealName}>Poulet grillé + Riz</Text>
            <Text style={s.mealMeta}>450 kcal • 12h30</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B8A', marginRight: 4 }} />
                <Text style={s.macroTag}>35g P</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFB800', marginRight: 4 }} />
                <Text style={s.macroTag}>20g G</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4DA6FF', marginRight: 4 }} />
                <Text style={s.macroTag}>15g L</Text>
              </View>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* CONSEIL DU JOUR */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18, marginBottom: 8, marginLeft: 4 }}>
        <LightbulbIcon />
        <Text style={s.sectionTitleText}>CONSEIL DU JOUR</Text>
      </View>
      <GlassCard>
        <Text style={s.adviceText}>
          {'"Journée nuageuse ? Essayez un bon Gratin de légumes pour le réconfort !"'}
        </Text>
        <TouchableOpacity style={s.adviceLink} activeOpacity={0.7}>
          <Text style={s.adviceLinkText}>Voir Recettes</Text>
          <Ionicons name="chevron-forward" size={14} color="#00D984" />
        </TouchableOpacity>
      </GlassCard>

      {/* SUGGESTION ACTIVITÉ (dynamique basée sur surplus) */}
      {consumedTotal - burnedExtra > DAILY_OBJECTIVE && (
        <>
          <Text style={s.sectionTitle}>🏃 SUGGESTION ACTIVITÉ</Text>
          <GlassCard>
            <Text style={s.surplusText}>Surplus : +{consumedTotal - burnedExtra - DAILY_OBJECTIVE} kcal</Text>
            <View style={{ gap: 8, marginTop: 10 }}>
              {suggestActivities(consumedTotal - burnedExtra - DAILY_OBJECTIVE).slice(0, 2).map((sug, i) => (
                <View key={i} style={s.activityRow}>
                  <Text style={{ fontSize: 16 }}>{ACTIVITY_ICONS[sug.activity] || '🏃'}</Text>
                  <Text style={s.activityText}>{sug.minutesNeeded} min {ACTIVITY_LABELS[sug.activity]}</Text>
                  <Text style={s.activityKcal}>-{sug.kcalBurned} kcal</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </>
      )}

      {/* STATS AVANCÉES — FLOUTÉES */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18, marginBottom: 8, marginLeft: 4 }}>
        <StatsIcon />
        <Text style={s.sectionTitleText}>MES STATS (7 jours)</Text>
      </View>
      <View style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
        <GlassCard style={{ opacity: 0.3 }}>
          <View style={{ height: 80, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 6 }}>
              {[40, 65, 50, 80, 70, 55, 90].map((h, i) => (
                <View key={i} style={{
                  width: 20, height: h * 0.6, borderRadius: 4,
                  backgroundColor: 'rgba(0,217,132,0.3)',
                }} />
              ))}
            </View>
          </View>
        </GlassCard>
        {/* Overlay cadenas */}
        <View style={s.lockOverlay}>
          <LockIcon size={28} />
          <Text style={s.lockText}>Débloquer</Text>
          <View style={s.lockPriceRow}>
            <GemIcon size={14} />
            <Text style={s.lockPrice}> 200 Lix</Text>
            <Text style={s.lockOr}>  ou  </Text>
            <StarIcon />
            <Text style={s.lockPremium}> Premium</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

// ============================================================
// COMPOSANT — Pages placeholder (Repas, Activité, Calendrier, Profil)
// ============================================================
const PlaceholderPage = ({ icon, title, locked }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
    <Text style={{ fontSize: 48 }}>{icon}</Text>
    <Text style={{ color: '#EAEEF3', fontSize: 22, fontWeight: '700', marginTop: 16 }}>{title}</Text>
    {locked && (
      <View style={{ alignItems: 'center', marginTop: 20 }}>
        <LockIcon size={32} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
          <GemIcon size={14} />
          <Text style={{ color: '#D4AF37', fontSize: 13 }}>300 Lix</Text>
          <Text style={{ color: '#8892A0', fontSize: 13 }}> ou </Text>
          <StarIcon />
          <Text style={{ color: '#00D984', fontSize: 13 }}> Premium</Text>
        </View>
      </View>
    )}
    {!locked && (
      <Text style={{ color: '#555E6C', fontSize: 13, marginTop: 12, textAlign: 'center' }}>
        Page en construction...
      </Text>
    )}
  </View>
);

// ============================================================
// COMPOSANT — Bottom Tab Bar (5 onglets)
// ============================================================
const TABS = [
  { key: 'home', label: 'Accueil', iconActive: 'home', iconInactive: 'home-outline' },
  { key: 'meals', label: 'Repas', iconActive: 'restaurant', iconInactive: 'restaurant-outline' },
  { key: 'activity', label: 'Activité', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'calendar', label: 'Calendrier', iconActive: 'calendar', iconInactive: 'calendar-outline', locked: true },
  { key: 'profile', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

const BottomTabs = ({ activeTab, onTabPress }) => (
  <LinearGradient
    colors={['rgba(13, 17, 23, 0.0)', 'rgba(13, 17, 23, 0.7)', 'rgba(13, 17, 23, 0.97)']}
    locations={[0, 0.25, 1]}
    start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
    style={s.tabBar}
  >
    {/* Séparateur émeraude subtil */}
    <View style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 1, backgroundColor: 'rgba(0, 217, 132, 0.12)' }} />
    {TABS.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={s.tabItem}
          onPress={() => onTabPress(tab.key)}
          activeOpacity={0.7}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name={active ? tab.iconActive : tab.iconInactive}
              size={22}
              color={active ? '#00D984' : '#8892A0'}
            />
            {tab.locked && (
              <View style={s.tabLock}>
                <LockIcon size={10} />
              </View>
            )}
          </View>
          <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </LinearGradient>
);

// ============================================================
// APP PRINCIPAL
// ============================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [moodFilled, setMoodFilled] = useState(false);
  const [hydrationMl, setHydrationMl] = useState(1500);
  const [hydroModalVisible, setHydroModalVisible] = useState(false);
  const [surplusAlertVisible, setSurplusAlertVisible] = useState(false);
  const [hydroLogs, setHydroLogs] = useState([
    { time: '08:30', amount: 250, type: 'eau', icon: '💧' },
    { time: '10:15', amount: 500, type: 'eau', icon: '💧' },
    { time: '12:45', amount: 250, type: 'eau', icon: '💧' },
    { time: '15:00', amount: 500, type: 'eau', icon: '💧' },
  ]);

  // Mock sport activities done today
  const [activities, setActivities] = useState([
    { name: 'course', durationMin: 40, intensity: 'intense', kcalBurned: 573 },
  ]);

  const lixCount = 150;
  const notifCount = 1;
  const gender = 'homme';
  const hydrationGoal = gender === 'homme' ? 2500 : 2000;

  // Calorie logic
  const consumedTotal = 1585; // mock — from scanned meals
  const burnedExtra = activities.reduce((sum, a) => sum + a.kcalBurned, 0);
  const burnedTotal = 870; // BMR spread + sport
  const surplus = Math.max(0, consumedTotal - burnedExtra - DAILY_OBJECTIVE);

  // Sport → hydration water loss
  const sportWaterLoss = activities.reduce((sum, a) => sum + calculateWaterLoss(a.durationMin, a.intensity), 0);
  const sportAlert = sportWaterLoss > 0
    ? `🏃 -${sportWaterLoss}ml (${activities.map(a => ACTIVITY_LABELS[a.name] || a.name).join(', ')})`
    : null;

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DashboardContent
            onHydrationPress={() => setHydroModalVisible(true)}
            hydrationMl={hydrationMl}
            hydrationGoal={hydrationGoal}
            gender={gender}
            burnedExtra={burnedExtra}
            sportAlert={sportAlert}
            consumedTotal={consumedTotal}
            burnedTotal={burnedTotal}
          />
        );
      case 'meals':
        return <PlaceholderPage icon={'🍽️'} title="Repas" />;
      case 'activity':
        return <PlaceholderPage icon={'🏃'} title="Activité" />;
      case 'calendar':
        return <PlaceholderPage icon={'📅'} title="Calendrier" locked />;
      case 'profile':
        return <PlaceholderPage icon={'👤'} title="Profil" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0C1219' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0C1219" />

        {/* Background circuit board */}
        <CircuitBoardUltimate />

        {/* Voile dépoli */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(13, 17, 23, 0.3)',
          }}
        />

        {/* Glow radial émeraude — profondeur lumineuse */}
        <View pointerEvents="none" style={{
          position: 'absolute', top: '15%', left: W / 2 - 160,
          width: 320, height: 320, borderRadius: 160,
          backgroundColor: 'rgba(0, 217, 132, 0.04)',
        }} />
        <View pointerEvents="none" style={{
          position: 'absolute', top: '20%', left: W / 2 - 80,
          width: 160, height: 160, borderRadius: 80,
          backgroundColor: 'rgba(0, 217, 132, 0.06)',
        }} />

        {/* Contenu principal */}
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Header
            moodFilled={moodFilled}
            lixCount={lixCount}
            notifCount={notifCount}
            onMoodPress={() => setMoodFilled(!moodFilled)}
            onLixPress={() => setActiveTab('profile')}
          />
          {renderPage()}
        </SafeAreaView>

        {/* Bottom Tab Navigation */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'transparent' }}>
          <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
        </SafeAreaView>

        {/* Modal Hydratation fullscreen */}
        <HydrationModal
          visible={hydroModalVisible}
          onClose={() => setHydroModalVisible(false)}
          currentMl={hydrationMl}
          setCurrentMl={setHydrationMl}
          goalMl={hydrationGoal}
          gender={gender}
          hydroLogs={hydroLogs}
          setHydroLogs={setHydroLogs}
        />

        {/* Surplus alert modal */}
        <SurplusAlertModal
          visible={surplusAlertVisible}
          onClose={() => setSurplusAlertVisible(false)}
          surplus={surplus}
          onAddActivity={() => setActiveTab('activity')}
        />
      </View>
    </SafeAreaProvider>
  );
}

// ============================================================
// STYLES
// ============================================================
const s = StyleSheet.create({
  // === HEADER ===
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  moodBtn: { position: 'relative' },
  moodCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderWidth: 2, borderColor: '#00D984',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  moodBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#00D984',
    justifyContent: 'center', alignItems: 'center',
  },
  logoText: {
    color: '#EAEEF3', fontSize: 22, fontWeight: '800', letterSpacing: 4,
  },
  lixBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(21,27,35,0.7)',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(0,217,132,0.12)',
  },
  lixCount: { color: '#EAEEF3', fontSize: 15, fontWeight: '800' },
  lixLabel: { color: '#8892A0', fontSize: 11, fontWeight: '600' },
  notifBadge: {
    position: 'absolute', top: -6, right: -8,
    backgroundColor: '#FF3B30', borderRadius: 8,
    width: 16, height: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#1A2030',
  },
  notifBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' },

  // === SECTION TITLES ===
  sectionSubtitle: {
    color: '#00D984', fontSize: 11, fontWeight: '600',
    letterSpacing: 2, textAlign: 'center', marginBottom: 14,
  },
  sectionTitle: {
    color: '#EAEEF3', fontSize: 15, fontWeight: '700',
    letterSpacing: 0.5, marginTop: 18, marginBottom: 8, marginLeft: 4,
  },
  sectionTitleText: {
    color: '#EAEEF3', fontSize: 15, fontWeight: '700',
    letterSpacing: 0.5,
  },

  // === GLASS CARD ===
  glassCard: {
    borderRadius: 16, padding: 16,
    backgroundColor: 'rgba(21,27,35,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(62, 72, 85, 0.5)',
    borderTopColor: 'rgba(138,146,160,0.20)',
    borderLeftColor: 'rgba(107,123,141,0.10)',
    borderRightColor: 'rgba(42,48,59,0.20)',
    borderBottomColor: 'rgba(26,31,38,0.30)',
    shadowColor: '#00D984',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardShine: {
    position: 'absolute', top: 0, left: 14, right: 14,
    height: 1, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // === ENERGY CARD ===
  cardLabel: {
    color: '#8892A0', fontSize: 11, fontWeight: '700', letterSpacing: 2,
  },
  statusDot: {
    width: 10, height: 10, borderRadius: 5, marginRight: 8,
  },
  bigNumber: { color: '#00D984', fontSize: 38, fontWeight: '800' },
  bigUnit: { color: '#555E6C', fontSize: 16, fontWeight: '600' },
  cardHint: { color: '#555E6C', fontSize: 12, marginTop: 8 },

  // === PROGRESS BAR ===
  progressBg: {
    height: 8, borderRadius: 4, marginTop: 12,
    backgroundColor: 'rgba(80,95,115,0.15)',
    overflow: 'hidden', position: 'relative',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: {
    position: 'absolute', right: 0, top: -18,
    color: '#8892A0', fontSize: 11, fontWeight: '700',
  },

  // === ECG LEGEND ===
  legendRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 14,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(80,95,115,0.08)',
  },
  legendItem: { alignItems: 'center', flex: 1 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  legendLabel: { color: '#8892A0', fontSize: 10, fontWeight: '500' },
  legendValue: { fontSize: 15, fontWeight: '800', marginTop: 2 },

  // === MINI CARDS (BMR / Discipline / TDEE) ===
  miniCard: {
    flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 6,
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderWidth: 1, borderColor: 'rgba(62,72,85,0.3)',
    alignItems: 'center',
  },
  miniCardTitle: {
    color: '#8892A0', fontSize: 9, fontWeight: '700', letterSpacing: 1,
    marginTop: 4, marginBottom: 2,
  },
  miniValue: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  miniCardUnit: { color: '#8892A0', fontSize: 10, marginTop: 2 },

  // === HYDRATION CARD (compact) ===
  hydrationCard: {
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(62,72,85,0.3)',
    padding: 14, marginTop: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  hydrationTitle: {
    color: '#EAEEF3', fontSize: 12, fontWeight: '700', letterSpacing: 1,
  },
  hydrationLiters: {
    color: '#4DA6FF', fontSize: 13, fontWeight: '800',
  },
  hydroBar: {
    height: 8, borderRadius: 4, marginTop: 8,
    backgroundColor: '#2A3040', overflow: 'hidden',
  },
  hydroBarFill: { height: '100%', borderRadius: 4 },
  hydroGlasses: { color: '#8892A0', fontSize: 10 },
  hydroPercent: { color: '#4DA6FF', fontSize: 11, fontWeight: '700' },

  // === HYDRATION MODAL ===
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  modalTitle: {
    color: '#EAEEF3', fontSize: 18, fontWeight: '800', letterSpacing: 2,
  },
  hydroModalSubtitle: {
    color: '#8892A0', fontSize: 13, fontWeight: '600', letterSpacing: 1.5,
    textAlign: 'center', marginTop: 12, lineHeight: 20,
  },
  hydroBigCount: { fontSize: 26, fontWeight: '800', marginTop: 8 },
  addWaterBtn: {
    backgroundColor: '#00D984', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 40, marginTop: 20,
  },
  addWaterBtnText: {
    color: '#0C1219', fontSize: 14, fontWeight: '800', letterSpacing: 1,
  },
  qtyBtn: {
    backgroundColor: 'rgba(21,27,35,0.7)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(62,72,85,0.3)',
    paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center',
  },
  qtyBtnText: { color: '#C0C8D4', fontSize: 12, fontWeight: '600', marginTop: 4 },
  proBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.12)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  resetBtn: {
    marginTop: 30, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(80,95,115,0.2)',
    paddingVertical: 12, paddingHorizontal: 30,
  },
  resetBtnText: { color: '#8892A0', fontSize: 12, fontWeight: '600' },

  // === FUN BUTTONS (Mood + Spin) ===
  funButton: {
    flex: 1, borderRadius: 14, paddingVertical: 14,
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderWidth: 1, borderColor: 'rgba(80,95,115,0.10)',
    alignItems: 'center', position: 'relative',
  },
  funBtnText: {
    color: '#EAEEF3', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 4,
  },
  funBtnSub: { color: '#555E6C', fontSize: 9, marginTop: 2 },
  funBadge: {
    position: 'absolute', top: 6, right: 8,
    backgroundColor: '#00D984', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2,
  },

  // === MEAL CARD ===
  mealPhoto: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: 'rgba(80,95,115,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  mealName: { color: '#EAEEF3', fontSize: 15, fontWeight: '700' },
  mealMeta: { color: '#555E6C', fontSize: 12, marginTop: 3 },
  macroTag: { color: '#8892A0', fontSize: 11, fontWeight: '600' },

  // === ADVICE CARD ===
  adviceText: { color: '#8892A0', fontSize: 12, fontStyle: 'italic', lineHeight: 20 },
  adviceLink: {
    flexDirection: 'row', alignItems: 'center', marginTop: 10,
  },
  adviceLinkText: { color: '#00D984', fontSize: 13, fontWeight: '600' },

  // === ACTIVITY SUGGESTION ===
  surplusText: { color: '#FF6B4A', fontSize: 14, fontWeight: '700' },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  activityText: { flex: 1, color: '#C0C8D4', fontSize: 13 },
  activityKcal: { color: '#00D984', fontSize: 13, fontWeight: '700' },

  // === LOCK OVERLAY ===
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: 'rgba(12,18,25,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  lockText: { color: '#C0C8D4', fontSize: 13, fontWeight: '600', marginTop: 6 },
  lockPriceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  lockPrice: { color: '#00D984', fontSize: 13, fontWeight: '700' },
  lockOr: { color: '#555E6C', fontSize: 11 },
  lockPremium: { color: '#D4AF37', fontSize: 13, fontWeight: '700' },

  // === BOTTOM TAB BAR ===
  tabBar: {
    flexDirection: 'row',
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 0 : 48,
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4,
  },
  tabLabel: {
    color: '#8892A0', fontSize: 9, fontWeight: '600', marginTop: 3,
  },
  tabLabelActive: { color: '#00D984' },
  tabLock: {
    position: 'absolute', top: -3, right: -6,
    backgroundColor: 'rgba(21,27,35,0.9)', borderRadius: 6,
    width: 12, height: 12, justifyContent: 'center', alignItems: 'center',
  },

  // === CHART TABS (Journalier / Général) ===
  chartTabsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 14,
  },
  chartTab: {
    paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8,
  },
  chartTabActive: {
    backgroundColor: 'rgba(0,217,132,0.12)',
    borderBottomWidth: 2, borderBottomColor: '#00D984',
  },
  chartTabText: {
    color: '#8892A0', fontSize: 12, fontWeight: '600',
  },
  chartTabTextActive: {
    color: '#00D984',
  },

  // === MINUS BUTTON (hydration) ===
  minusBtn: {
    marginTop: 6, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(30,35,45,0.8)',
    borderWidth: 1, borderColor: 'rgba(255,59,48,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  minusBtnText: {
    color: '#FF3B30', fontSize: 18, fontWeight: '700', lineHeight: 20,
  },

  // === ADD BEVERAGE BUTTON (PRO) ===
  addBeverageBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(21,27,35,0.8)', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
    paddingVertical: 14, paddingHorizontal: 24, marginTop: 18,
  },
  addBeverageBtnText: {
    color: '#C0C8D4', fontSize: 13, fontWeight: '700', letterSpacing: 0.5,
  },
  proBadgeLg: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(212,175,55,0.15)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
});
