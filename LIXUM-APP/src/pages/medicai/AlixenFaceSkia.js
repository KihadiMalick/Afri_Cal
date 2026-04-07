// ──────────────────────────────────────────────────────────────────────────────
// medicai/AlixenFaceSkia.js — ALIXEN V6 Skia : GPU-accelerated particle rendering
// Migration de react-native-svg vers @shopify/react-native-skia
// Drop-in replacement pour AlixenFace (alixenzone.js)
// ──────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Image, Dimensions } from 'react-native';
import { Canvas, Circle, Line, Group, vec, Oval, RadialGradient } from '@shopify/react-native-skia';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;
var FRAME_W = Math.min(W - 8, 420);
var FRAME_H = Math.min(Math.round(FRAME_W * 0.68), Math.round(H * 0.35));
var INSET_X = FRAME_W * 0.20;
var INSET_Y_TOP = FRAME_H * 0.12;
var INSET_Y_BOTTOM = FRAME_H * 0.385;
var HEX_W = FRAME_W - INSET_X * 2;
var HEX_H = FRAME_H - INSET_Y_TOP - INSET_Y_BOTTOM;
var HEX_CX = HEX_W / 2;
var HEX_CY = HEX_H / 2;
var HEX_INSET = Math.round(HEX_W * 0.085);
var NUM_PARTICLES = 300;
var CONN_DIST = 36;
var MAX_CONN = 200;
var P_SCALE = Math.max(1, FRAME_W / 312);
var A_SCALE = Math.max(1, HEX_W / 240);
var BRIDGE_TOP = Math.round(FRAME_H * 0.79);
var BRIDGE_H = Math.round(FRAME_W * 0.22);
var MODULE_H = BRIDGE_TOP + BRIDGE_H;

var HEX_PTS = [
  { x: HEX_INSET, y: 0 }, { x: HEX_W - HEX_INSET, y: 0 },
  { x: HEX_W, y: HEX_H / 2 }, { x: HEX_W - HEX_INSET, y: HEX_H },
  { x: HEX_INSET, y: HEX_H }, { x: 0, y: HEX_H / 2 },
];
var WIRES = [
  { x: FRAME_W / 2 - 45, dir: 'down', color: '#4DA6FF', role: 'alixen' },
  { x: FRAME_W / 2, dir: 'up', color: '#00D984', role: 'user' },
  { x: FRAME_W / 2 + 45, dir: 'down', color: '#4DA6FF', role: 'alixen' },
];

function sr(seed) { var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

function inHex(px, py) {
  var pts = HEX_PTS; var inside = false;
  for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    if (((pts[i].y > py) !== (pts[j].y > py)) && (px < (pts[j].x - pts[i].x) * (py - pts[i].y) / (pts[j].y - pts[i].y) + pts[i].x)) inside = !inside;
  }
  return inside;
}

function genParticles() {
  var p = []; var att = 0; var i = 0;
  while (i < NUM_PARTICLES && att < NUM_PARTICLES * 5) {
    att++;
    var px = sr(att * 3.17) * HEX_W; var py = sr(att * 7.93) * HEX_H;
    if (!inHex(px, py) || px < 8 || px > HEX_W - 8 || py < 8 || py > HEX_H - 8) continue;
    var d = Math.sqrt((px - HEX_CX) * (px - HEX_CX) + (py - HEX_CY) * (py - HEX_CY));
    var n = d / (Math.min(HEX_W, HEX_H) * 0.5);
    var layer = n < 0.25 ? 'core' : n < 0.5 ? 'mid' : n < 0.75 ? 'ambient' : 'dust';
    var size = (layer === 'core' ? 1.2 + sr(i * 5.5) * 1.3 : layer === 'mid' ? 0.8 + sr(i * 6.3) * 1.0 : layer === 'ambient' ? 0.6 + sr(i * 7.1) * 0.9 : 0.4 + sr(i * 8.9) * 0.7) * P_SCALE;
    var cr = sr(i * 11.3 + 0.5);
    var color = cr < 0.35 ? '#4DA6FF' : cr < 0.55 ? '#2A7FFF' : cr < 0.70 ? '#7DD3FC' : cr < 0.80 ? '#B8E4FF' : cr < 0.90 ? '#00D984' : cr < 0.96 ? '#00A866' : '#D4AF37';
    var baseOp = layer === 'core' ? 0.60 + sr(i * 9.7) * 0.35 : layer === 'mid' ? 0.30 + sr(i * 10.1) * 0.30 : layer === 'ambient' ? 0.18 + sr(i * 12.3) * 0.22 : 0.10 + sr(i * 13.7) * 0.15;
    p.push({
      id: i, homeX: px - HEX_CX, homeY: py - HEX_CY, size: size, color: color,
      layer: layer, baseOp: baseOp,
      phX: sr(i * 17.3) * Math.PI * 2, phY: sr(i * 19.7) * Math.PI * 2,
      fX1: 0.4 + sr(i * 31.7) * 0.35, fY1: 0.35 + sr(i * 37.3) * 0.30,
      fX2: 0.2 + sr(i * 41.1) * 0.15, fY2: 0.15 + sr(i * 43.9) * 0.12,
      drift: (layer === 'dust' ? 8 : layer === 'ambient' ? 6 : layer === 'mid' ? 3.5 : 2.2) * P_SCALE,
    });
    i++;
  }
  return p;
}

// --- TARGET FUNCTIONS PLACEHOLDER (Phase 3-4) ---
// --- COMPONENTS PLACEHOLDER (Phase 5-7) ---
