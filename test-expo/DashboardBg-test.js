// LIXUM - Dashboard Background Test — Low-Poly Emeraude
// Copier-coller dans App.js sur snack.expo.dev
// Dependances: expo-linear-gradient, @expo/vector-icons,
//              react-native-svg, react-native-safe-area-context
// Memes dependances que les autres fichiers test

import React, { useMemo } from 'react';
import { View, Dimensions, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon } from 'react-native-svg';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;

// ============================================================
// GENERATION DES TRIANGLES LOW-POLY
// ============================================================

function generateTriangles(width, height) {
  var triangles = [];
  var cols = 14;
  var rows = 24;
  var cellW = width / cols;
  var cellH = height / rows;

  for (var row = 0; row < rows; row++) {
    for (var col = 0; col < cols; col++) {
      var seed = row * cols + col;
      var jitterX = ((Math.sin(seed * 127.1) * 43758.5453) % 1) * cellW * 0.15;
      var jitterY = ((Math.sin(seed * 269.5) * 43758.5453) % 1) * cellH * 0.15;

      var x = col * cellW + jitterX;
      var y = row * cellH + jitterY;
      var x2 = (col + 1) * cellW + ((Math.sin((seed + 1) * 127.1) * 43758.5453) % 1) * cellW * 0.15;
      var y2 = row * cellH + ((Math.sin((seed + 1) * 269.5) * 43758.5453) % 1) * cellH * 0.15;
      var x3 = (col + 0.5) * cellW + ((Math.sin((seed + 2) * 127.1) * 43758.5453) % 1) * cellW * 0.1;
      var y3 = (row + 1) * cellH + ((Math.sin((seed + 2) * 269.5) * 43758.5453) % 1) * cellH * 0.15;

      // Distance du centre-haut
      var centerX = width / 2;
      var centerY = height * 0.15;
      var distX = Math.abs((x + x2) / 2 - centerX) / (width / 2);
      var distY = Math.abs((y + y2) / 2 - centerY) / height;
      var dist = Math.min(1, Math.sqrt(distX * distX + distY * distY));

      var intensity = Math.max(0, 1 - dist * 1.2);
      var hueShift = (Math.sin(seed * 0.7) + 1) / 2;

      // Triangle 1 (haut)
      triangles.push({
        points: x + ',' + y + ' ' + x2 + ',' + y2 + ' ' + x3 + ',' + y3,
        intensity: intensity,
        hueShift: hueShift,
        seed: seed,
      });

      // Triangle 2 (bas — miroir)
      var x4 = (col + 1) * cellW + ((Math.sin((seed + 3) * 127.1) * 43758.5453) % 1) * cellW * 0.15;
      var y4 = (row + 1) * cellH + ((Math.sin((seed + 3) * 269.5) * 43758.5453) % 1) * cellH * 0.15;
      triangles.push({
        points: x2 + ',' + y2 + ' ' + x3 + ',' + y3 + ' ' + x4 + ',' + y4,
        intensity: intensity * 0.85,
        hueShift: hueShift,
        seed: seed + 100,
      });
    }
  }
  return triangles;
}

function getTriangleColor(intensity, hueShift, seed) {
  if (intensity < 0.05) {
    var brightness = 12 + Math.floor(seed % 5);
    return {
      fill: 'rgba(' + brightness + ',' + (brightness + 3) + ',' + (brightness + 8) + ',0.15)',
      stroke: 'rgba(' + (brightness + 10) + ',' + (brightness + 15) + ',' + (brightness + 25) + ',0.03)',
    };
  }

  var r = 0;
  var g = Math.floor(180 + hueShift * 37);
  var b = Math.floor(100 + hueShift * 32);

  var fillOpacity = intensity * 0.07;
  var strokeOpacity = intensity * 0.05;
  var facetVar = ((Math.sin(seed * 3.7) + 1) / 2) * 0.02;

  return {
    fill: 'rgba(' + r + ',' + g + ',' + b + ',' + (fillOpacity + facetVar) + ')',
    stroke: 'rgba(' + r + ',' + Math.min(255, g + 30) + ',' + Math.min(255, b + 20) + ',' + strokeOpacity + ')',
  };
}

// ============================================================
// LOW-POLY BACKGROUND COMPONENT
// ============================================================

function LowPolyBackground() {
  var triangles = useMemo(function () {
    return generateTriangles(W, H);
  }, []);

  var triangleElements = [];
  for (var i = 0; i < triangles.length; i++) {
    var tri = triangles[i];
    var colors = getTriangleColor(tri.intensity, tri.hueShift, tri.seed);
    triangleElements.push(
      <Polygon
        key={i}
        points={tri.points}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth="0.5"
      />
    );
  }

  // Lignes horizontales brossees (effet metal)
  var brushLines = [];
  for (var j = 0; j < 30; j++) {
    var lineY = j * (H / 30);
    brushLines.push(
      <Polygon
        key={'line-' + j}
        points={'0,' + lineY + ' ' + W + ',' + lineY + ' ' + W + ',' + (lineY + 0.5) + ' 0,' + (lineY + 0.5)}
        fill="rgba(107,123,141,0.015)"
      />
    );
  }

  return (
    <View style={s.bgContainer}>
      {/* Gradient de base sombre */}
      <LinearGradient
        colors={['#0D1520', '#111D2B', '#0F1925', '#0B1018']}
        locations={[0, 0.3, 0.6, 1]}
        style={s.bgFull}
      />

      {/* Polygones low-poly */}
      <Svg width={W} height={H} style={s.bgSvg} pointerEvents="none">
        {triangleElements}
      </Svg>

      {/* Glow emeraude central en haut */}
      <View style={{
        position: 'absolute',
        top: -80,
        left: W * 0.15,
        right: W * 0.15,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(0,217,132,0.06)',
      }} />

      {/* Second glow plus petit et plus intense */}
      <View style={{
        position: 'absolute',
        top: -40,
        left: W * 0.25,
        right: W * 0.25,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(0,217,132,0.04)',
      }} />

      {/* Lignes horizontales brossees */}
      <Svg width={W} height={H} style={s.bgSvg} pointerEvents="none">
        {brushLines}
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
      <View style={{ flex: 1, backgroundColor: '#0D1520' }}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1520" />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom', 'left', 'right']}>

          <LowPolyBackground />

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
