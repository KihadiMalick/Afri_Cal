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

var membraneImpacts = [];

function getSpeakTarget(p, t) {
  var idx = p.id;
  var numRings = 6;
  var ring = idx % numRings;
  var posInRing = Math.floor(idx / numRings);
  var totalInRing = Math.ceil(NUM_PARTICLES / numRings);
  var angle = (posInRing / totalInRing) * Math.PI * 2 + ring * 0.5;
  var baseR = 8 + ring * (HEX_W * 0.065);
  var pulse = Math.sin(t * 3.5 - ring * 1.2) * (5 + ring * 2);
  var r = baseR + pulse;
  var wobble = Math.sin(t * 2 + idx * 0.15) * 1.5;
  return { x: Math.cos(angle + t * 0.15) * (r + wobble), y: Math.sin(angle + t * 0.15) * (r + wobble) * 0.55 };
}

function getBrainTarget(p, t) {
  var idx = p.id; var hemiGap = 45;
  if (idx < 10) { return { x: Math.sin(t * (1.5 + sr(idx * 3.3)) + idx * 0.628) * hemiGap, y: Math.sin(t * 2.3 + idx * 1.7) * 8 }; }
  var isLeft = (idx % 2 === 0); var centerX = isLeft ? -hemiGap : hemiGap;
  var px = centerX + Math.cos(sr(idx * 4.7) * Math.PI * 2 + t * 0.15) * (28 + sr(idx * 5.1) * 12) * 0.85;
  var py = Math.sin(sr(idx * 4.7) * Math.PI * 2 + t * 0.12) * (32 + sr(idx * 6.3) * 10) * 0.85;
  var pulseLR = isLeft ? (Math.sin(t * 1.8) * 0.5 + 0.5) : (Math.sin(t * 1.8 + Math.PI) * 0.5 + 0.5);
  var scale = 0.85 + pulseLR * 0.15;
  return { x: px * scale, y: py * scale };
}

function getListenTarget(p, t) {
  var idx = p.id;
  if (idx < 100) {
    var ringLayers = 3;
    var layer = idx % ringLayers;
    var posInLayer = Math.floor(idx / ringLayers);
    var totalInLayer = Math.ceil(100 / ringLayers);
    var angle = (posInLayer / totalInLayer) * Math.PI * 2 + t * 0.3 + layer * 0.3;
    var baseR = HEX_W * 0.28 + layer * 5;
    var r = baseR + Math.sin(t * 2 + posInLayer * 0.2) * 3;
    var splashY = 0;
    var now = Date.now() / 1000;
    for (var k = 0; k < membraneImpacts.length; k++) {
      var imp = membraneImpacts[k];
      var age = now - imp.time;
      if (age > 0.9) continue;
      var impAngle = Math.atan2(imp.y, imp.x);
      var angleDist = Math.abs(((angle - impAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
      if (angleDist < 1.2) {
        var spatial = Math.max(0, 1 - angleDist / 1.2);
        var upSplash = Math.max(0, 1 - age * 2.5) * Math.exp(-age * 3);
        splashY -= upSplash * spatial * 16;
        splashY += Math.sin(age * Math.PI * 6) * Math.exp(-age * 5) * spatial * 3;
      }
    }
    return { x: Math.cos(angle) * r, y: -22 + Math.sin(angle) * r * 0.12 + splashY };
  }
  var fIdx = idx - 100;
  var progress = fIdx / (NUM_PARTICLES - 100);
  var funnelY = -18 + progress * 58;
  var widthAtY = HEX_W * 0.35 * (1 - progress * 0.92);
  var rF = Math.max(2, widthAtY - Math.sin(t * 2 + progress * 3) * 3);
  return { x: Math.cos(sr(idx * 4.4) * Math.PI * 2 + t * 0.3) * rF, y: funnelY };
}

function getEyeTarget(p, t) {
  var idx = p.id;
  if (idx < 40) { var a = (idx / 40) * Math.PI * 2; var r = 3 + sr(idx * 3.3) * (6 - 2 - Math.sin(t * 2.5) * 2); return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.9 }; }
  if (idx < 140) { var a2 = ((idx - 40) / 100) * Math.PI * 2 + t * 0.12; var r2 = 18 + sr(idx * 4.7) * 5; return { x: Math.cos(a2) * r2, y: Math.sin(a2) * r2 * 0.75 }; }
  if (idx < 240) { var eIdx = idx - 140; var t2 = eIdx / 99; var ang = (t2 * 2 - 1) * Math.PI * 0.85; var rx = 55; var ry = 18; var ex = Math.cos(ang) * rx; var isTop = eIdx < 50; var ey = isTop ? -Math.sqrt(Math.max(0, 1 - (ex * ex) / (rx * rx))) * ry : Math.sqrt(Math.max(0, 1 - (ex * ex) / (rx * rx))) * ry * 0.7; return { x: ex, y: ey + (isTop ? -Math.sin(t * 1.2) * 2 : Math.sin(t * 1.2) * 2) }; }
  if (idx < 270) { var cIdx = idx - 240; var isRight = cIdx >= 15; var ci = cIdx % 15; var cornerX = isRight ? 52 : -52; var cAngle = isRight ? (-0.3 + ci * 0.04) : (Math.PI + 0.3 - ci * 0.04); return { x: cornerX + Math.cos(cAngle) * (8 + ci * 0.8), y: Math.sin(cAngle) * (8 + ci * 0.8) }; }
  return { x: Math.sin(t * 3.5) * 50 + sr(idx * 2.1) * 4, y: ((idx - 270) / (NUM_PARTICLES - 270)) * 30 - 15 };
}

// --- TARGET FUNCTIONS PART 2 PLACEHOLDER (Phase 4) ---
// --- COMPONENTS PLACEHOLDER (Phase 5-7) ---
