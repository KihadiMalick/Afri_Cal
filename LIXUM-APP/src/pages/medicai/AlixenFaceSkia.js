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
var NUM_PARTICLES = 150;
var CONN_DIST = 35;
var MAX_CONN = 60;
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

function getMemoryTarget(p, t) {
  var ag = 3 + Math.sin(t * 1.5 + p.id * 0.3) * 2;
  return { x: p.homeX + Math.sin(t * 0.8 + p.phX) * ag, y: p.homeY + Math.cos(t * 0.6 + p.phY) * ag };
}

function isMemoryFlash(pid, el) {
  var slot = Math.floor(el * 5);
  for (var f = 0; f < 5; f++) { if (Math.floor(sr(slot * 7.7 + f * 13.3) * NUM_PARTICLES) === pid) return true; }
  return false;
}

function getSadTarget(p, t) {
  var idx = p.id;
  if (idx < 160) { var a = (idx / 160) * Math.PI * 2; var r = 38 + (sr(idx * 3.3) - 0.5) * 3; return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.85 + Math.sin(t * 1.2) * 0.5 }; }
  if (idx < 185) { var a2 = ((idx - 160) / 25) * Math.PI * 2; var r2 = 4 + sr(idx * 4.4) * 2; return { x: -14 + Math.cos(a2) * r2, y: -12 + Math.sin(a2) * r2 }; }
  if (idx < 210) { var a3 = ((idx - 185) / 25) * Math.PI * 2; var r3 = 4 + sr(idx * 5.5) * 2; return { x: 14 + Math.cos(a3) * r3, y: -12 + Math.sin(a3) * r3 }; }
  if (idx < 310) { var s = ((idx - 210) / 99); var sx = (s - 0.5) * 40; var curve = -Math.sin(s * Math.PI) * 12; return { x: sx, y: 14 + curve + (sr(idx * 6.6) - 0.5) * 2.5 + Math.sin(t * 1.5) * 0.8 }; }
  var a4 = sr(idx * 7.7) * Math.PI * 2; var r4 = 45 + sr(idx * 8.8) * 15;
  return { x: Math.cos(a4) * r4, y: Math.sin(a4) * r4 * 0.5 + Math.sin(t * 0.3 + idx) * 3 };
}

function getHappyTarget(p, t) {
  var idx = p.id;
  if (idx < 160) { var a = (idx / 160) * Math.PI * 2; var r = 38 + (sr(idx * 3.3) - 0.5) * 3; return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.85 + Math.sin(t * 2) * 0.8 }; }
  if (idx < 185) { var a2 = ((idx - 160) / 25) * Math.PI * 2; var r2 = 4 + sr(idx * 4.4) * 2; return { x: -14 + Math.cos(a2) * r2, y: -12 + Math.sin(a2) * r2 }; }
  if (idx < 210) { var a3 = ((idx - 185) / 25) * Math.PI * 2; var r3 = 4 + sr(idx * 5.5) * 2; return { x: 14 + Math.cos(a3) * r3, y: -12 + Math.sin(a3) * r3 }; }
  if (idx < 310) { var s = ((idx - 210) / 99); var sx = (s - 0.5) * 40; var curve = Math.sin(s * Math.PI) * 12; return { x: sx, y: 14 + curve + (sr(idx * 6.6) - 0.5) * 2.5 + Math.sin(t * 2) * 0.8 }; }
  var risePhase = (t * 0.4 + sr(idx * 7.7)) % 1;
  return { x: (sr(idx * 2.2) - 0.5) * 80 + Math.sin(t * 2 + idx * 0.2) * 2, y: 35 - risePhase * 65 };
}

function getWowTarget(p, t) {
  var idx = p.id; var phase = t % 4.5;
  var tiltAngle = -0.75 + Math.sin((phase / 4.5) * Math.PI) * 0.55;
  if (idx < 50) { var ci = idx / 49; var side = (sr(idx * 2.2) - 0.5) * (1.5 + ci * 5); return { x: -60 + ci * 55 * Math.cos(tiltAngle) + side * Math.sin(tiltAngle), y: 40 + ci * 55 * Math.sin(tiltAngle) - side * Math.cos(tiltAngle) }; }
  var confIdx = idx - 50; var confGroup = confIdx % 3; var shotStart = confGroup * 1.4; var shotPhase = phase - shotStart;
  var tipX = -60 + 55 * Math.cos(tiltAngle); var tipY = 40 + 55 * Math.sin(tiltAngle);
  if (shotPhase < 0 || shotPhase > 1.2) { return { x: tipX + sr(idx * 2.2) * 4, y: tipY + sr(idx * 3.3) * 4 }; }
  var eT = shotPhase / 1.2; var spreadAngle = tiltAngle + (sr(idx * 8.8) - 0.5) * 1.6; var speed = 55 + sr(idx * 9.9) * 60;
  return { x: tipX + Math.cos(spreadAngle) * speed * eT, y: tipY + Math.sin(spreadAngle) * speed * eT };
}

function getHeartTarget(p, t) {
  var hT = (p.id / NUM_PARTICLES) * Math.PI * 2; var s = 2.8;
  var hx = s * 16 * Math.pow(Math.sin(hT), 3); var hy = -s * (13 * Math.cos(hT) - 5 * Math.cos(2 * hT) - 2 * Math.cos(3 * hT) - Math.cos(4 * hT));
  var beat = 1 + Math.sin(t * 3) * 0.06;
  return { x: hx * beat + sr(p.id * 5.5) * 4 - 2, y: hy * beat + sr(p.id * 6.6) * 4 - 7 };
}

function gpsPathPoint(progress) {
  var startX = -HEX_W * 0.32; var startY = -HEX_H * 0.35;
  var endX = HEX_W * 0.32; var endY = HEX_H * 0.35;
  var gx = startX + (endX - startX) * progress;
  var sCurve = Math.sin(progress * Math.PI * 2) * (HEX_W * 0.18);
  var gy = startY + (endY - startY) * progress + sCurve;
  return { x: gx, y: gy };
}

function getGpsTarget(p, t) {
  var idx = p.id;
  var cycle = 5.0;
  var phase = (t % cycle) / cycle;
  if (idx < 30) {
    var pinCenter = gpsPathPoint(0);
    var a = (idx / 30) * Math.PI * 2 + t * 0.5;
    var r = 4 + sr(idx * 3.3) * 6;
    var pulse = 1 + Math.sin(t * 2) * 0.15;
    return { x: pinCenter.x + Math.cos(a) * r * pulse, y: pinCenter.y + Math.sin(a) * r * 0.7 * pulse };
  }
  if (idx >= NUM_PARTICLES - 50) {
    var arrIdx = idx - (NUM_PARTICLES - 50);
    var pinEnd = gpsPathPoint(1);
    var a2 = (arrIdx / 50) * Math.PI * 2 + t * 0.8;
    var r2 = 5 + sr(idx * 4.4) * 7;
    var arrived = phase > 0.75;
    var sparkle = arrived ? (1 + Math.sin(t * 8 + arrIdx * 1.5) * 0.3) : 1;
    return { x: pinEnd.x + Math.cos(a2) * r2 * sparkle, y: pinEnd.y + Math.sin(a2) * r2 * 0.7 * sparkle };
  }
  var trailIdx = idx - 30;
  var totalTrail = NUM_PARTICLES - 80;
  var posOnPath = trailIdx / totalTrail;
  var drawProgress = phase * 1.3;
  if (posOnPath > drawProgress) {
    var waitPt = gpsPathPoint(0);
    return { x: waitPt.x + sr(idx * 2.2) * 8 - 4, y: waitPt.y + sr(idx * 3.3) * 6 - 3 };
  }
  var pt = gpsPathPoint(posOnPath);
  var jitter = Math.sin(t * 3 + idx * 0.4) * 1.5;
  var recentness = Math.max(0, 1 - (drawProgress - posOnPath) * 5);
  var trailSpread = 2 + recentness * 3;
  return { x: pt.x + Math.sin(idx * 1.7) * trailSpread + jitter, y: pt.y + Math.cos(idx * 2.3) * trailSpread * 0.5 };
}

function getTarget(p, t, state) {
  switch (state) {
    case 'speaking': return getSpeakTarget(p, t);
    case 'thinking': return getBrainTarget(p, t);
    case 'listening': return getListenTarget(p, t);
    case 'scanning': return getEyeTarget(p, t);
    case 'memory': return getMemoryTarget(p, t);
    case 'sad': return getSadTarget(p, t);
    case 'happy': return getHappyTarget(p, t);
    case 'wow': return getWowTarget(p, t);
    case 'heart': return getHeartTarget(p, t);
    case 'gps': return getGpsTarget(p, t);
    default: return { x: p.homeX, y: p.homeY };
  }
}

var AlixenParticlesSkia = React.memo(function AlixenParticlesSkia(props) {
  var reqState = props.state || 'idle';
  var keystrokeCount = props.keystrokeCount || 0;
  var particles = useMemo(function() { return genParticles(); }, []);
  var morphRef = useRef(0); var activeRef = useRef('idle'); var pendingRef = useRef(null); var phaseRef = useRef('idle'); var startRef = useRef(Date.now());
  var lastKeystrokeRef = useRef(0);
  var runningRef = useRef(true);
  var connFrameRef = useRef(0);

  // Pre-allocate once — mutate in place every frame, zero GC pressure
  var frameRef = useRef(null);
  if (!frameRef.current) {
    var initP = [];
    for (var pi = 0; pi < NUM_PARTICLES; pi++) { initP.push({ x: 0, y: 0, size: 1, opacity: 0, color: '#4DA6FF', layer: 'dust', flash: false }); }
    var initC = [];
    for (var ci = 0; ci < MAX_CONN; ci++) { initC.push({ x1: 0, y1: 0, x2: 0, y2: 0, op: 0 }); }
    frameRef.current = { p: initP, c: initC, connCount: 0, morph: 0, ready: false };
  }
  // Minimal state: single counter to trigger re-render
  var _frame = useState(0); var setFrame = _frame[1];

  useEffect(function() {
    if (keystrokeCount > 0 && keystrokeCount !== lastKeystrokeRef.current) {
      lastKeystrokeRef.current = keystrokeCount;
      var now = Date.now() / 1000;
      var impX = Math.sin(keystrokeCount * 7.13) * 0.75;
      var impY = Math.cos(keystrokeCount * 5.47) * 0.75;
      membraneImpacts.push({ x: impX, y: impY, time: now });
      membraneImpacts = membraneImpacts.filter(function(imp) { return now - imp.time < 1.0; });
    }
  }, [keystrokeCount]);

  useEffect(function() {
    var cur = activeRef.current;
    if (reqState === cur) return;
    if (reqState === 'idle') { phaseRef.current = 'out'; pendingRef.current = null; }
    else if (cur === 'idle') { activeRef.current = reqState; phaseRef.current = 'in'; }
    else { phaseRef.current = 'out'; pendingRef.current = reqState; }
  }, [reqState]);

  useEffect(function() {
    runningRef.current = true;
    startRef.current = Date.now();

    var tick = function() {
      if (!runningRef.current) return;
      var el = (Date.now() - startRef.current) / 1000;
      var ph = phaseRef.current; var m = morphRef.current;
      if (ph === 'in') { m += 0.025; if (m >= 1) { m = 1; phaseRef.current = 'active'; } }
      else if (ph === 'out') { m -= 0.03; if (m <= 0.02) { m = 0; var pend = pendingRef.current; if (pend) { activeRef.current = pend; pendingRef.current = null; phaseRef.current = 'in'; } else { activeRef.current = 'idle'; phaseRef.current = 'idle'; } } }
      else if (ph === 'active') { m = 1; } else { m = 0; }
      morphRef.current = m;
      var state = activeRef.current; var isMem = state === 'memory' && m > 0.5;
      var fd = frameRef.current;
      fd.morph = m;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dist = Math.sqrt(p.homeX * p.homeX + p.homeY * p.homeY);
        var dX = Math.sin(el * p.fX1 + p.phX) * p.drift + Math.sin(el * p.fX2 + p.phX * 1.7) * p.drift * 0.4;
        var dY = Math.cos(el * p.fY1 + p.phY) * p.drift + Math.cos(el * p.fY2 + p.phY * 1.3) * p.drift * 0.4;
        var idleX = HEX_CX + (p.homeX + dX); var idleY = HEX_CY + (p.homeY + dY);
        var tgt = getTarget(p, el, state);
        var needScale = (state === 'thinking' || state === 'scanning' || state === 'sad' || state === 'happy' || state === 'wow' || state === 'heart');
        var asc = needScale ? A_SCALE : 1;
        var tgtX = HEX_CX + tgt.x * asc; var tgtY = HEX_CY + tgt.y * asc;
        var delay = (dist / (Math.min(HEX_W, HEX_H) * 0.45)) * 0.3;
        var adj = Math.max(0, Math.min(1, (m - delay) / Math.max(0.01, 1 - delay)));
        var eased = adj < 0.5 ? 4 * adj * adj * adj : 1 - Math.pow(-2 * adj + 2, 3) / 2;
        var x = Math.max(4, Math.min(HEX_W - 4, idleX + (tgtX - idleX) * eased));
        var y = Math.max(4, Math.min(HEX_H - 4, idleY + (tgtY - idleY) * eased));
        var breathe = Math.sin(el * 0.35 + p.phX) * 0.5 + 0.5;
        var opacity = p.baseOp;
        if (state !== 'idle' && m > 0.4) { if (p.layer === 'core') opacity = Math.min(0.95, opacity * 1.8); if (p.layer === 'mid') opacity = Math.min(0.70, opacity * 1.5); }
        opacity = opacity * (0.85 + breathe * 0.15);
        var flash = false;
        if (isMem && isMemoryFlash(p.id, el)) { opacity = 1.0; flash = true; }
        var color = p.color;
        if (state === 'thinking' && m > 0.5 && p.id < 10) { color = '#D4AF37'; opacity = 0.9; }
        if (state === 'thinking' && m > 0.5 && p.id >= 10) { var pulseTh = (p.id % 2 === 0) ? (Math.sin(el * 1.8) * 0.5 + 0.5) : (Math.sin(el * 1.8 + Math.PI) * 0.5 + 0.5); opacity = opacity * (0.6 + pulseTh * 0.4); }
        var size = p.size;
        if (flash) size = p.size * 2.5;
        if (state === 'speaking' && m > 0.4) size *= (1 + Math.sin(el * 3 - (p.id % 6) * 0.9) * 0.2);
        var edgeN = dist / (Math.min(HEX_W, HEX_H) * 0.5);
        if (edgeN > 0.55) {
          var shimmer = Math.sin(el * 5 + p.phX * 3) * 0.5 + 0.5;
          var shimmerStr = (edgeN - 0.55) * 2.2;
          opacity = Math.min(1, opacity + shimmer * shimmerStr * 0.45);
          if (shimmer > 0.82) size *= 1.4;
        }
        // Mutate pre-allocated object in place — zero allocation
        var slot = fd.p[i];
        slot.x = x; slot.y = y; slot.size = size; slot.opacity = opacity; slot.color = color; slot.layer = p.layer; slot.flash = flash;
      }
      // Recalculate connections every 2 frames to halve CPU cost
      connFrameRef.current++;
      if (connFrameRef.current % 2 === 0) {
        var cc = 0;
        for (var a = 0; a < particles.length; a += 3) {
          if (cc >= MAX_CONN) break;
          for (var b = a + 1; b < Math.min(a + 40, particles.length); b++) {
            if (cc >= MAX_CONN) break;
            var pa = fd.p[a]; var pb = fd.p[b]; var dx = pa.x - pb.x; var dy = pa.y - pb.y; var dd = Math.sqrt(dx * dx + dy * dy);
            if (dd < CONN_DIST && dd > 2) { var lo = (1 - dd / CONN_DIST) * 0.35 * (0.5 + Math.sin(el * 1.2 + a * 0.3) * 0.5); if (lo > 0.01) { var cs = fd.c[cc]; cs.x1 = pa.x; cs.y1 = pa.y; cs.x2 = pb.x; cs.y2 = pb.y; cs.op = lo; cc++; } }
          }
        }
        for (var a2 = particles.length - 1; a2 > 0; a2 -= 3) {
          if (cc >= MAX_CONN) break;
          for (var b2 = a2 - 1; b2 > Math.max(a2 - 40, 0); b2--) {
            if (cc >= MAX_CONN) break;
            var pa2 = fd.p[a2]; var pb2 = fd.p[b2]; var dx2 = pa2.x - pb2.x; var dy2 = pa2.y - pb2.y; var dd2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (dd2 < CONN_DIST && dd2 > 2) { var lo2 = (1 - dd2 / CONN_DIST) * 0.35 * (0.5 + Math.sin(el * 1.2 + a2 * 0.3) * 0.5); if (lo2 > 0.01) { var cs2 = fd.c[cc]; cs2.x1 = pa2.x; cs2.y1 = pa2.y; cs2.x2 = pb2.x; cs2.y2 = pb2.y; cs2.op = lo2; cc++; } }
          }
        }
        if (state === 'thinking' && m > 0.5) { for (var mi = 0; mi < 9; mi++) { if (cc < MAX_CONN) { var csT = fd.c[cc]; csT.x1 = fd.p[mi].x; csT.y1 = fd.p[mi].y; csT.x2 = fd.p[mi + 1].x; csT.y2 = fd.p[mi + 1].y; csT.op = 0.12; cc++; } } }
        fd.connCount = cc;
      }
      fd.ready = true;
      // Single number increment — minimal React re-render, zero object creation
      setFrame(function(f) { return f + 1; });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return function() { runningRef.current = false; };
  }, []);

  var fd = frameRef.current;
  if (!fd || !fd.ready) return null;

  var nebulaOp = 1 - fd.morph;
  // Build connection elements only up to connCount (skip unused pool slots)
  var connElements = [];
  for (var ci = 0; ci < fd.connCount; ci++) {
    var c = fd.c[ci];
    connElements.push(React.createElement(Line, { key: 'c' + ci, p1: vec(c.x1, c.y1), p2: vec(c.x2, c.y2), color: '#4DA6FF', strokeWidth: 0.7 * P_SCALE, opacity: c.op, style: 'stroke' }));
  }

  return (
    <Canvas style={{ width: HEX_W, height: HEX_H }}>
      <Group opacity={nebulaOp}>
        <Oval x={HEX_CX - HEX_W * 0.78} y={HEX_CY - HEX_H * 0.55} width={HEX_W * 1.56} height={HEX_H * 1.1}>
          <RadialGradient
            c={vec(HEX_CX, HEX_CY)}
            r={HEX_W * 0.78}
            colors={['rgba(77,166,255,0.20)', 'rgba(42,127,255,0.12)', 'rgba(77,166,255,0.08)', 'rgba(42,127,255,0.05)', 'rgba(77,166,255,0.02)']}
            positions={[0, 0.25, 0.5, 0.75, 1]}
          />
        </Oval>
        <Oval x={HEX_CX - HEX_W * 0.25} y={HEX_CY + HEX_H * 0.12 - HEX_H * 0.20} width={HEX_W * 0.50} height={HEX_H * 0.40}>
          <RadialGradient
            c={vec(HEX_CX, HEX_CY + HEX_H * 0.12)}
            r={HEX_W * 0.25}
            colors={['rgba(0,217,132,0.12)', 'rgba(0,168,102,0.06)', 'rgba(0,217,132,0)']}
            positions={[0, 0.5, 1]}
          />
        </Oval>
      </Group>

      {connElements}

      {fd.p.map(function(p, i) {
        if (p.layer === 'dust' || p.layer === 'ambient') {
          return React.createElement(Circle, { key: 'p' + i, cx: p.x, cy: p.y, r: p.size, color: p.color, opacity: p.opacity });
        }
        return null;
      })}

      {fd.p.map(function(p, i) {
        if (p.layer === 'mid') {
          if (p.flash) {
            return React.createElement(Group, { key: 'm' + i },
              React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size * 2, color: p.color, opacity: 0.4 }),
              React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size, color: '#FFFFFF', opacity: 0.85 })
            );
          }
          return React.createElement(Group, { key: 'm' + i },
            React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size * 2.2, color: p.color, opacity: p.opacity * 0.05 }),
            React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size, color: p.color, opacity: p.opacity })
          );
        }
        return null;
      })}

      {fd.p.map(function(p, i) {
        if (p.layer === 'core') {
          if (p.flash) {
            return React.createElement(Group, { key: 'k' + i },
              React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size * 3, color: p.color, opacity: 0.25 }),
              React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size * 1.5, color: p.color, opacity: 0.8 }),
              React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size, color: '#FFFFFF', opacity: 0.95 })
            );
          }
          return React.createElement(Group, { key: 'k' + i },
            React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size * 3, color: p.color, opacity: p.opacity * 0.06 }),
            React.createElement(Circle, { cx: p.x, cy: p.y, r: p.size, color: p.color, opacity: p.opacity })
          );
        }
        return null;
      })}
    </Canvas>
  );
});

function getWireMode(s) {
  if (s === 'listening' || s === 'scanning') return 'user';
  if (s === 'speaking' || s === 'thinking' || s === 'memory') return 'alixen';
  return 'idle';
}

var AlixenFaceSkia = function(props) {
  var wireMode = getWireMode(props.state || 'idle');
  var _imp = useState([]); var imps = _imp[0]; var setImps = _imp[1];

  useEffect(function() {
    var st = Date.now();
    var iv = setInterval(function() {
      var el = (Date.now() - st) / 1000; var ni = [];
      for (var w = 0; w < 3; w++) {
        var wire = WIRES[w];
        var active = (wireMode === 'user' && wire.role === 'user') || (wireMode === 'alixen' && wire.role === 'alixen');
        if (!active) continue;
        var sp = wire.role === 'user' ? 2.0 : 2.4;
        for (var k = 0; k < 3; k++) {
          var phase = (el / sp + k * 0.33) % 1;
          var p = wire.dir === 'down' ? phase : 1 - phase;
          var fI = phase < 0.15 ? phase / 0.15 : 1;
          var fO = phase > 0.85 ? (1 - phase) / 0.15 : 1;
          ni.push({ w: w, pos: p, op: fI * fO * 0.75, color: wire.color });
        }
      }
      setImps(ni);
    }, 50);
    return function() { clearInterval(iv); };
  }, [wireMode]);

  var tubeTop = FRAME_H * 0.68;
  var tubeHeight = FRAME_H * 0.16;
  var tubePositions = [FRAME_W * 0.415, FRAME_W * 0.503, FRAME_W * 0.59];

  var IMG_SCALE = 1.05;
  var naturalH = Math.round(FRAME_W * 0.68);
  var imgW, imgH, imgLeft, imgTop;
  if (FRAME_H < naturalH) {
    imgH = Math.round(FRAME_H * IMG_SCALE);
    imgW = Math.round(imgH / 0.667);
    imgLeft = Math.round((FRAME_W - imgW) / 2);
    imgTop = Math.round(-(imgH - FRAME_H) * 0.3);
  } else {
    imgW = Math.round(FRAME_W * IMG_SCALE);
    imgH = Math.round(imgW * 0.667);
    imgLeft = Math.round(-(imgW - FRAME_W) / 2);
    imgTop = Math.round(-(imgH - FRAME_H) * 0.35);
  }

  return (
    <View style={{ width: FRAME_W, height: FRAME_H, position: 'relative', overflow: 'visible' }}>
      <Image
        source={null}
        style={{ width: imgW, height: imgH, position: 'absolute', top: imgTop, left: imgLeft }}
        resizeMode="contain"
        pointerEvents="none"
      />
      <View style={{ position: 'absolute', top: INSET_Y_TOP, left: INSET_X, width: HEX_W, height: HEX_H }}>
        <AlixenParticlesSkia state={props.state} keystrokeCount={props.keystrokeCount} />
      </View>
      <Canvas style={{ position: 'absolute', top: 0, left: 0, width: FRAME_W, height: FRAME_H }} pointerEvents="none">
        {imps.map(function(imp, i) {
          var tx = tubePositions[imp.w];
          var cy = tubeTop + imp.pos * tubeHeight;
          return React.createElement(Group, { key: 'i' + i },
            React.createElement(Circle, { cx: tx, cy: cy, r: 5, color: imp.color, opacity: imp.op * 0.08 }),
            React.createElement(Circle, { cx: tx, cy: cy, r: 3, color: imp.color, opacity: imp.op * 0.35 }),
            React.createElement(Circle, { cx: tx, cy: cy, r: 1.5, color: imp.color, opacity: imp.op * 0.6 }),
            React.createElement(Circle, { cx: tx, cy: cy, r: 0.6, color: '#FFFFFF', opacity: imp.op * 0.8 })
          );
        })}
      </Canvas>
    </View>
  );
};

export { AlixenFaceSkia, getWireMode, FRAME_W, FRAME_H, MODULE_H, BRIDGE_TOP };
