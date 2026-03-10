// LIXUM - Dashboard Background Test — Circuit Board ULTIMATE
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que les autres fichiers test

import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  View, Dimensions, Text, StyleSheet, StatusBar,
  Animated as RNAnimated, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Rect, Path, G, Defs, LinearGradient as SvgGradient, Stop, Polygon } from 'react-native-svg';
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
// COMPOSANT — Icône Gem SVG (diamant émeraude style jeu vidéo)
// ============================================================
const GemIcon = ({ size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <SvgGradient id="gemGrad" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#00D984" stopOpacity="1" />
        <Stop offset="1" stopColor="#00A866" stopOpacity="1" />
      </SvgGradient>
      <SvgGradient id="gemShine" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.6" />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </SvgGradient>
    </Defs>
    {/* Corps du diamant */}
    <Polygon points="12,2 22,9 12,22 2,9" fill="url(#gemGrad)" />
    {/* Facette supérieure */}
    <Polygon points="12,2 22,9 12,9 2,9" fill="rgba(255,255,255,0.15)" />
    {/* Reflet shine haut-gauche */}
    <Polygon points="2,9 7,9 12,2" fill="url(#gemShine)" />
    {/* Ligne facette milieu */}
    <Line x1="2" y1="9" x2="22" y2="9" stroke="rgba(0,180,100,0.4)" strokeWidth="0.5" />
    <Line x1="7" y1="9" x2="12" y2="22" stroke="rgba(0,180,100,0.25)" strokeWidth="0.3" />
    <Line x1="17" y1="9" x2="12" y2="22" stroke="rgba(0,180,100,0.25)" strokeWidth="0.3" />
  </Svg>
);

// ============================================================
// COMPOSANT — Header Global (Mood + LIXUM + Lix)
// ============================================================
const Header = ({ moodFilled, lixCount, onMoodPress, onLixPress }) => {
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
        <GemIcon size={20} />
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
// COMPOSANT — Dashboard Content (page Accueil)
// ============================================================
const DashboardContent = () => {
  const consumed = 1585;
  const objective = 2330;
  const remaining = objective - consumed;
  const percent = Math.round((consumed / objective) * 100);

  const miniCards = [
    { icon: '\u{1F525}', label: 'Br\u00FBl\u00E9', value: '1 585', sub: 'kcal', color: '#FF6B4A' },
    { icon: '\u{1F4AA}', label: 'Prot\u00E9ines', value: '82%', sub: 'objectif', color: '#00D984' },
    { icon: '\u{1F35A}', label: 'Glucides', value: '55%', sub: 'objectif', color: '#00BFA6' },
  ];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Sous-titre */}
      <Text style={s.sectionSubtitle}>BIO-DIGITAL DASHBOARD</Text>

      {/* ====== CARTE PRINCIPALE — Mon Énergie du Jour ====== */}
      <GlassCard>
        <Text style={s.cardLabel}>MON \u00C9NERGIE DU JOUR</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 10 }}>
          <View style={[s.statusDot, { backgroundColor: percent >= 80 ? '#00D984' : percent >= 50 ? '#D4AF37' : '#FF6B4A' }]} />
          <Text style={s.bigNumber}>{consumed.toLocaleString('fr-FR')}</Text>
          <Text style={s.bigUnit}> kcal</Text>
        </View>
        <ProgressBar percent={percent} />
        <Text style={s.cardHint}>
          Encore {remaining.toLocaleString('fr-FR')} kcal \u00E0 manger
        </Text>
      </GlassCard>

      {/* ====== 3 MINI-CARTES ====== */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        {miniCards.map((item, i) => (
          <View key={i} style={s.miniCard}>
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
            <Text style={[s.miniValue, { color: item.color }]}>{item.value}</Text>
            <Text style={s.miniLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* ====== BOUTONS MOOD + SPIN ====== */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
        <TouchableOpacity style={s.funButton} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>{'\u{1F636}'}</Text>
          <Text style={s.funBtnText}>MOOD</Text>
          <View style={s.funBadge}>
            <Text style={{ color: '#0C1219', fontSize: 7, fontWeight: '800' }}>NEW</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={s.funButton} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>{'\u{1F3B0}'}</Text>
          <Text style={s.funBtnText}>SPIN</Text>
          <Text style={s.funBtnSub}>1x gratuit</Text>
        </TouchableOpacity>
      </View>

      {/* ====== INDICATEUR SCROLL ====== */}
      <View style={{ alignItems: 'center', marginTop: 14, marginBottom: 6 }}>
        <Text style={{ color: '#555E6C', fontSize: 11 }}>{'\u2195'} glisser pour plus</Text>
      </View>

      {/* ======================================================= */}
      {/* BELOW THE FOLD — Zone scrollable                        */}
      {/* ======================================================= */}

      {/* DERNIER REPAS */}
      <Text style={s.sectionTitle}>{'\u{1F37D}\uFE0F'} DERNIER REPAS</Text>
      <GlassCard>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={s.mealPhoto}>
            <Ionicons name="camera-outline" size={24} color="#555E6C" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.mealName}>Poulet grill\u00E9 + Riz</Text>
            <Text style={s.mealMeta}>450 kcal \u2022 12h30</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
              <Text style={s.macroTag}>{'\u{1F4AA}'} 35g</Text>
              <Text style={s.macroTag}>{'\u{1F35A}'} 20g</Text>
              <Text style={s.macroTag}>{'\u{1F9C8}'} 15g</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* CONSEIL DU JOUR */}
      <Text style={s.sectionTitle}>{'\u{1F4A1}'} CONSEIL DU JOUR</Text>
      <GlassCard>
        <Text style={s.adviceText}>
          {'"Journ\u00E9e nuageuse ? Essayez un bon Gratin de l\u00E9gumes pour le r\u00E9confort !"'}
        </Text>
        <TouchableOpacity style={s.adviceLink} activeOpacity={0.7}>
          <Text style={s.adviceLinkText}>Voir Recettes {'\u{1F37D}\uFE0F'}</Text>
          <Ionicons name="chevron-forward" size={14} color="#00D984" />
        </TouchableOpacity>
      </GlassCard>

      {/* SUGGESTION ACTIVITÉ */}
      <Text style={s.sectionTitle}>{'\u{1F3C3}'} SUGGESTION ACTIVIT\u00C9</Text>
      <GlassCard>
        <Text style={s.surplusText}>Surplus : +320 kcal</Text>
        <View style={{ gap: 8, marginTop: 10 }}>
          <View style={s.activityRow}>
            <Text style={{ fontSize: 16 }}>{'\u{1F6B6}'}</Text>
            <Text style={s.activityText}>40 min marche rapide</Text>
            <Text style={s.activityKcal}>-320 kcal</Text>
          </View>
          <View style={s.activityRow}>
            <Text style={{ fontSize: 16 }}>{'\u{1F3C3}'}</Text>
            <Text style={s.activityText}>25 min course</Text>
            <Text style={s.activityKcal}>-320 kcal</Text>
          </View>
        </View>
      </GlassCard>

      {/* STATS AVANCÉES — FLOUTÉES */}
      <Text style={s.sectionTitle}>{'\u{1F4CA}'} MES STATS (7 jours)</Text>
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
          <Ionicons name="lock-closed" size={28} color="#8892A0" />
          <Text style={s.lockText}>D\u00E9bloquer</Text>
          <View style={s.lockPriceRow}>
            <GemIcon size={14} />
            <Text style={s.lockPrice}> 200 Lix</Text>
            <Text style={s.lockOr}>  ou  </Text>
            <Text style={s.lockPremium}>{'\u2B50'} Premium</Text>
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
        <Ionicons name="lock-closed" size={32} color="#D4AF37" />
        <Text style={{ color: '#8892A0', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
          Contenu Premium{'\n'}
          <Text style={{ color: '#D4AF37' }}>{'\u{1F48E}'} 300 Lix</Text> ou <Text style={{ color: '#00D984' }}>{'\u2B50'} Premium</Text>
        </Text>
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
  { key: 'activity', label: 'Activit\u00E9', iconActive: 'fitness', iconInactive: 'fitness-outline' },
  { key: 'calendar', label: 'Calendrier', iconActive: 'calendar', iconInactive: 'calendar-outline', locked: true },
  { key: 'profile', label: 'Profil', iconActive: 'person', iconInactive: 'person-outline' },
];

const BottomTabs = ({ activeTab, onTabPress }) => (
  <View style={s.tabBar}>
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
                <Ionicons name="lock-closed" size={8} color="#D4AF37" />
              </View>
            )}
          </View>
          <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ============================================================
// APP PRINCIPAL
// ============================================================

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [moodFilled, setMoodFilled] = useState(false);
  const lixCount = 150;

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardContent />;
      case 'meals':
        return <PlaceholderPage icon={'\u{1F37D}\uFE0F'} title="Repas" />;
      case 'activity':
        return <PlaceholderPage icon={'\u{1F3C3}'} title="Activit\u00E9" />;
      case 'calendar':
        return <PlaceholderPage icon={'\u{1F4C5}'} title="Calendrier" locked />;
      case 'profile':
        return <PlaceholderPage icon={'\u{1F464}'} title="Profil" />;
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

        {/* Voile d\u00E9poli */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(13, 17, 23, 0.3)',
          }}
        />

        {/* Contenu principal */}
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Header
            moodFilled={moodFilled}
            lixCount={lixCount}
            onMoodPress={() => setMoodFilled(!moodFilled)}
            onLixPress={() => setActiveTab('profile')}
          />
          {renderPage()}
        </SafeAreaView>

        {/* Bottom Tab Navigation */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'transparent' }}>
          <BottomTabs activeTab={activeTab} onTabPress={setActiveTab} />
        </SafeAreaView>
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderWidth: 1, borderColor: 'rgba(138,146,160,0.15)',
    justifyContent: 'center', alignItems: 'center',
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

  // === SECTION TITLES ===
  sectionSubtitle: {
    color: '#00D984', fontSize: 11, fontWeight: '600',
    letterSpacing: 2, textAlign: 'center', marginBottom: 14,
  },
  sectionTitle: {
    color: '#8892A0', fontSize: 12, fontWeight: '700',
    letterSpacing: 1.5, marginTop: 18, marginBottom: 8, marginLeft: 4,
  },

  // === GLASS CARD ===
  glassCard: {
    borderRadius: 16, padding: 16,
    backgroundColor: 'rgba(21,27,35,0.75)',
    borderWidth: 1,
    borderTopColor: 'rgba(138,146,160,0.20)',
    borderLeftColor: 'rgba(107,123,141,0.10)',
    borderRightColor: 'rgba(42,48,59,0.20)',
    borderBottomColor: 'rgba(26,31,38,0.30)',
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

  // === MINI CARDS ===
  miniCard: {
    flex: 1, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 6,
    backgroundColor: 'rgba(21,27,35,0.7)',
    borderWidth: 1, borderColor: 'rgba(80,95,115,0.10)',
    alignItems: 'center',
  },
  miniValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  miniLabel: { color: '#555E6C', fontSize: 10, fontWeight: '600', marginTop: 2 },

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
  adviceText: { color: '#C0C8D4', fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
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
    backgroundColor: 'rgba(21,27,35,0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(80,95,115,0.12)',
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
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
});
