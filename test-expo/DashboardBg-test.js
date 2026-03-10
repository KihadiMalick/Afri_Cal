// LIXUM - Dashboard Background Test — Circuit Board Gris + Points Emeraude
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que les autres fichiers test

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Dimensions, Text, StyleSheet, StatusBar, Animated as RNAnimated, Easing } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle, Rect, Path } from 'react-native-svg';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;

// ============================================================
// CIRCUIT BOARD BACKGROUND — Metallique + Emeraude
// ============================================================

function CircuitBoardBackground() {
  // Animation pour les points lumineux qui pulsent
  var glowAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(function () {
    var loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(glowAnim, {
          toValue: 1, duration: 2000,
          easing: Easing.inOut(Easing.ease), useNativeDriver: false,
        }),
        RNAnimated.timing(glowAnim, {
          toValue: 0, duration: 2000,
          easing: Easing.inOut(Easing.ease), useNativeDriver: false,
        }),
      ])
    );
    loop.start();
    return function () { loop.stop(); };
  }, []);

  // Interpolation pour l'opacite du glow
  var glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.45],
  });

  // Generer le reseau de circuits
  var circuits = useMemo(function () {
    var nodePositions = [];

    // Grille de base avec decalage aleatoire
    var gridSpacing = 55;

    for (var x = 20; x < W - 20; x += gridSpacing) {
      for (var y = 30; y < H - 30; y += gridSpacing) {
        // Decalage pseudo-aleatoire
        var seed = x * 127 + y * 311;
        var jx = ((Math.sin(seed) * 43758.5453) % 1) * 20 - 10;
        var jy = ((Math.cos(seed) * 43758.5453) % 1) * 20 - 10;
        var nx = x + jx;
        var ny = y + jy;

        // Seulement ~40% des positions ont un node
        if (((Math.sin(seed * 1.7) + 1) / 2) > 0.6) continue;

        // Distance du centre pour varier l'intensite
        var distFromCenter = Math.sqrt(
          Math.pow((nx - W / 2) / (W / 2), 2) +
          Math.pow((ny - H / 2) / (H / 2), 2)
        );

        // Type de node : petit point, moyen, ou composant
        var nodeType = ((Math.sin(seed * 2.3) + 1) / 2);

        nodePositions.push({ x: nx, y: ny, dist: distFromCenter, type: nodeType, seed: seed });
      }
    }

    // Creer les lignes de connexion entre nodes proches
    var paths = [];
    for (var i = 0; i < nodePositions.length; i++) {
      for (var j = i + 1; j < nodePositions.length; j++) {
        var a = nodePositions[i];
        var b = nodePositions[j];
        var dist = Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

        // Connecter seulement les nodes proches (< 80px)
        if (dist < 80 && dist > 30) {
          // Seulement ~30% des connexions possibles
          if (((Math.sin(a.seed + b.seed) + 1) / 2) > 0.7) continue;

          // Style de ligne : droite OU avec un coude a 90 degres
          var hasElbow = ((Math.sin(a.seed * 3.1 + b.seed) + 1) / 2) > 0.5;

          paths.push({
            x1: a.x, y1: a.y,
            x2: b.x, y2: b.y,
            hasElbow: hasElbow,
            intensity: Math.max(0, 1 - (a.dist + b.dist) / 2),
          });
        }
      }
    }

    return { nodes: nodePositions, paths: paths };
  }, []);

  return (
    <View style={s.bgContainer}>
      {/* FOND GRADIENT GRIS METALLIQUE */}
      <LinearGradient
        colors={['#1A1F28', '#1E2530', '#222A35', '#1E2530', '#1A1F28']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={s.bgFull}
      />

      {/* Leger gradient plus clair au centre (effet de profondeur) */}
      <View style={{
        position: 'absolute',
        top: H * 0.15,
        left: W * 0.1,
        right: W * 0.1,
        height: H * 0.35,
        borderRadius: H * 0.2,
        backgroundColor: 'rgba(42, 50, 65, 0.15)',
      }} />

      {/* CIRCUIT BOARD SVG */}
      <Svg width={W} height={H} style={s.bgSvg}>

        {/* LIGNES DE CIRCUIT */}
        {circuits.paths.map(function (path, i) {
          var opacity = 0.06 + path.intensity * 0.06;

          if (path.hasElbow) {
            var midX = path.x2;
            var midY = path.y1;
            return (
              <Path
                key={'p-' + i}
                d={'M ' + path.x1 + ' ' + path.y1 + ' L ' + midX + ' ' + midY + ' L ' + path.x2 + ' ' + path.y2}
                fill="none"
                stroke={'rgba(107, 123, 141, ' + opacity + ')'}
                strokeWidth="0.8"
              />
            );
          }

          return (
            <Line
              key={'p-' + i}
              x1={path.x1} y1={path.y1}
              x2={path.x2} y2={path.y2}
              stroke={'rgba(107, 123, 141, ' + opacity + ')'}
              strokeWidth="0.8"
            />
          );
        })}

        {/* NODES — Points de connexion */}
        {circuits.nodes.map(function (node, i) {
          var intensity = Math.max(0, 1 - node.dist);

          if (node.type > 0.8) {
            // COMPOSANT — petit carre (simule un chip/resistance)
            return (
              <React.Fragment key={'n-' + i}>
                <Rect
                  x={node.x - 4} y={node.y - 3}
                  width="8" height="6" rx="1"
                  fill="none"
                  stroke={'rgba(107, 123, 141, ' + (0.08 + intensity * 0.06) + ')'}
                  strokeWidth="0.8"
                />
              </React.Fragment>
            );
          }

          if (node.type > 0.5) {
            // POINT MOYEN — cercle avec bordure
            return (
              <Circle
                key={'n-' + i}
                cx={node.x} cy={node.y} r="2.5"
                fill="none"
                stroke={'rgba(107, 123, 141, ' + (0.08 + intensity * 0.06) + ')'}
                strokeWidth="0.8"
              />
            );
          }

          // PETIT POINT — juste un dot
          return (
            <Circle
              key={'n-' + i}
              cx={node.x} cy={node.y} r="1.2"
              fill={'rgba(107, 123, 141, ' + (0.10 + intensity * 0.08) + ')'}
            />
          );
        })}
      </Svg>

      {/* POINTS LUMINEUX EMERAUDE — pulsent avec l'animation */}
      <RNAnimated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: glowOpacity }}>
        <Svg width={W} height={H}>
          {circuits.nodes
            .filter(function (_, i) { return i % 7 === 0; })
            .map(function (node, i) {
              var intensity = Math.max(0, 1 - node.dist * 0.8);
              if (intensity < 0.1) return null;

              return (
                <React.Fragment key={'g-' + i}>
                  {/* Halo glow */}
                  <Circle
                    cx={node.x} cy={node.y} r="6"
                    fill={'rgba(0, 217, 132, ' + (intensity * 0.08) + ')'}
                  />
                  {/* Point brillant central */}
                  <Circle
                    cx={node.x} cy={node.y} r="2"
                    fill={'rgba(0, 217, 132, ' + (intensity * 0.35) + ')'}
                  />
                </React.Fragment>
              );
            })}
        </Svg>
      </RNAnimated.View>

      {/* DEUXIEME VAGUE de points lumineux (decalee dans le temps) */}
      <RNAnimated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        opacity: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.35, 0.1],
        }),
      }}>
        <Svg width={W} height={H}>
          {circuits.nodes
            .filter(function (_, i) { return i % 7 === 3; })
            .map(function (node, i) {
              var intensity = Math.max(0, 1 - node.dist * 0.8);
              if (intensity < 0.1) return null;

              return (
                <React.Fragment key={'g2-' + i}>
                  <Circle
                    cx={node.x} cy={node.y} r="5"
                    fill={'rgba(0, 217, 132, ' + (intensity * 0.06) + ')'}
                  />
                  <Circle
                    cx={node.x} cy={node.y} r="1.5"
                    fill={'rgba(0, 217, 132, ' + (intensity * 0.30) + ')'}
                  />
                </React.Fragment>
              );
            })}
        </Svg>
      </RNAnimated.View>

      {/* LIGNES HORIZONTALES BROSSEES — effet metal subtil */}
      <Svg width={W} height={H} style={s.bgSvg} pointerEvents="none">
        {Array.from({ length: 40 }).map(function (_, i) {
          return (
            <Line
              key={'brush-' + i}
              x1="0" y1={i * (H / 40)}
              x2={W} y2={i * (H / 40)}
              stroke="rgba(107, 123, 141, 0.012)"
              strokeWidth="0.5"
            />
          );
        })}
      </Svg>
    </View>
  );
}

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
      <View style={{ flex: 1, backgroundColor: '#1A1F28' }}>
        <StatusBar barStyle="light-content" backgroundColor="#1A1F28" />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>

          <CircuitBoardBackground />

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
  bgContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  bgFull: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  bgSvg: {
    position: 'absolute',
    top: 0, left: 0,
  },
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
