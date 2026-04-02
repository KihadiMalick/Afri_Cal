// LIXUM — AlixenFace V6 — Image Frame + Particle Overlay
// Copier-coller dans App.js sur snack.expo.dev
// Uploader alixen-frame.png dans /assets/ sur Snack Expo

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, Image, Dimensions, StatusBar, Pressable, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, G, Defs, LinearGradient as SvgLinearGradient, RadialGradient, Stop, Ellipse, Rect, Path, Text as SvgText } from 'react-native-svg';

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
var NUM_PARTICLES = 420;
var FPS = 33;
var CONN_DIST = Math.round(HEX_W * 0.153);
var MAX_CONN = 300;
var WIRE_LEN = 55;
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
  var pulse = isLeft ? (Math.sin(t * 1.8) * 0.5 + 0.5) : (Math.sin(t * 1.8 + Math.PI) * 0.5 + 0.5);
  var scale = 0.85 + pulse * 0.15;
  return { x: px * scale, y: py * scale };
}
var membraneImpacts = [];

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
  var r = Math.max(2, widthAtY - Math.sin(t * 2 + progress * 3) * 3);
  return { x: Math.cos(sr(idx * 4.4) * Math.PI * 2 + t * 0.3) * r, y: funnelY };
}
function getEyeTarget(p, t) {
  var idx = p.id;
  if (idx < 40) { var a = (idx / 40) * Math.PI * 2; var r = 3 + sr(idx * 3.3) * (6 - 2 - Math.sin(t * 2.5) * 2); return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.9 }; }
  if (idx < 140) { var a = ((idx - 40) / 100) * Math.PI * 2 + t * 0.12; var r = 18 + sr(idx * 4.7) * 5; return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.75 }; }
  if (idx < 240) { var eIdx = idx - 140; var t2 = eIdx / 99; var angle = (t2 * 2 - 1) * Math.PI * 0.85; var rx = 55; var ry = 18; var x = Math.cos(angle) * rx; var isTop = eIdx < 50; var y = isTop ? -Math.sqrt(Math.max(0, 1 - (x * x) / (rx * rx))) * ry : Math.sqrt(Math.max(0, 1 - (x * x) / (rx * rx))) * ry * 0.7; return { x: x, y: y + (isTop ? -Math.sin(t * 1.2) * 2 : Math.sin(t * 1.2) * 2) }; }
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
  if (idx < 185) { var a = ((idx - 160) / 25) * Math.PI * 2; var r = 4 + sr(idx * 4.4) * 2; return { x: -14 + Math.cos(a) * r, y: -12 + Math.sin(a) * r }; }
  if (idx < 210) { var a = ((idx - 185) / 25) * Math.PI * 2; var r = 4 + sr(idx * 5.5) * 2; return { x: 14 + Math.cos(a) * r, y: -12 + Math.sin(a) * r }; }
  if (idx < 310) { var s = ((idx - 210) / 99); var x = (s - 0.5) * 40; var curve = -Math.sin(s * Math.PI) * 12; return { x: x, y: 14 + curve + (sr(idx * 6.6) - 0.5) * 2.5 + Math.sin(t * 1.5) * 0.8 }; }
  var a = sr(idx * 7.7) * Math.PI * 2; var r = 45 + sr(idx * 8.8) * 15;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.5 + Math.sin(t * 0.3 + idx) * 3 };
}
function getHappyTarget(p, t) {
  var idx = p.id;
  if (idx < 160) { var a = (idx / 160) * Math.PI * 2; var r = 38 + (sr(idx * 3.3) - 0.5) * 3; return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.85 + Math.sin(t * 2) * 0.8 }; }
  if (idx < 185) { var a = ((idx - 160) / 25) * Math.PI * 2; var r = 4 + sr(idx * 4.4) * 2; return { x: -14 + Math.cos(a) * r, y: -12 + Math.sin(a) * r }; }
  if (idx < 210) { var a = ((idx - 185) / 25) * Math.PI * 2; var r = 4 + sr(idx * 5.5) * 2; return { x: 14 + Math.cos(a) * r, y: -12 + Math.sin(a) * r }; }
  if (idx < 310) { var s = ((idx - 210) / 99); var x = (s - 0.5) * 40; var curve = Math.sin(s * Math.PI) * 12; return { x: x, y: 14 + curve + (sr(idx * 6.6) - 0.5) * 2.5 + Math.sin(t * 2) * 0.8 }; }
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
  var x = startX + (endX - startX) * progress;
  var sCurve = Math.sin(progress * Math.PI * 2) * (HEX_W * 0.18);
  var y = startY + (endY - startY) * progress + sCurve;
  return { x: x, y: y };
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
    var a = (arrIdx / 50) * Math.PI * 2 + t * 0.8;
    var r = 5 + sr(idx * 4.4) * 7;
    var arrived = phase > 0.75;
    var sparkle = arrived ? (1 + Math.sin(t * 8 + arrIdx * 1.5) * 0.3) : 1;
    return { x: pinEnd.x + Math.cos(a) * r * sparkle, y: pinEnd.y + Math.sin(a) * r * 0.7 * sparkle };
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


var AlixenParticles = function(props) {
  var reqState = props.state || 'idle';
  var keystrokeCount = props.keystrokeCount || 0;
  var particles = useMemo(function() { return genParticles(); }, []);
  var _pos = useState(null); var pos = _pos[0]; var setPos = _pos[1];
  var morphRef = useRef(0); var activeRef = useRef('idle'); var pendingRef = useRef(null); var phaseRef = useRef('idle'); var startRef = useRef(Date.now());
  var lastKeystrokeRef = useRef(0);

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
    var running = true; startRef.current = Date.now();
    var tick = function() {
      if (!running) return;
      var el = (Date.now() - startRef.current) / 1000;
      var ph = phaseRef.current; var m = morphRef.current;
      if (ph === 'in') { m += 0.025; if (m >= 1) { m = 1; phaseRef.current = 'active'; } }
      else if (ph === 'out') { m -= 0.03; if (m <= 0.02) { m = 0; var pend = pendingRef.current; if (pend) { activeRef.current = pend; pendingRef.current = null; phaseRef.current = 'in'; } else { activeRef.current = 'idle'; phaseRef.current = 'idle'; } } }
      else if (ph === 'active') { m = 1; } else { m = 0; }
      morphRef.current = m;
      var state = activeRef.current; var isMem = state === 'memory' && m > 0.5;
      var np = [];
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
        if (state === 'thinking' && m > 0.5 && p.id >= 10) { var pulse = (p.id % 2 === 0) ? (Math.sin(el * 1.8) * 0.5 + 0.5) : (Math.sin(el * 1.8 + Math.PI) * 0.5 + 0.5); opacity = opacity * (0.6 + pulse * 0.4); }
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
        np.push({ x: x, y: y, size: size, opacity: opacity, color: color, layer: p.layer, flash: flash });
      }
      var conns = [];
      for (var a = 0; a < particles.length; a += 3) {
        if (conns.length >= MAX_CONN) break;
        for (var b = a + 1; b < Math.min(a + 40, particles.length); b++) {
          if (conns.length >= MAX_CONN) break;
          var pa = np[a]; var pb = np[b]; var dx = pa.x - pb.x; var dy = pa.y - pb.y; var dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < CONN_DIST && dd > 2) { var lo = (1 - dd / CONN_DIST) * 0.35 * (0.5 + Math.sin(el * 1.2 + a * 0.3) * 0.5); if (lo > 0.01) conns.push({ x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, op: lo }); }
        }
      }
      for (var a2 = particles.length - 1; a2 > 0; a2 -= 3) {
        if (conns.length >= MAX_CONN) break;
        for (var b2 = a2 - 1; b2 > Math.max(a2 - 40, 0); b2--) {
          if (conns.length >= MAX_CONN) break;
          var pa2 = np[a2]; var pb2 = np[b2]; var dx2 = pa2.x - pb2.x; var dy2 = pa2.y - pb2.y; var dd2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dd2 < CONN_DIST && dd2 > 2) { var lo2 = (1 - dd2 / CONN_DIST) * 0.35 * (0.5 + Math.sin(el * 1.2 + a2 * 0.3) * 0.5); if (lo2 > 0.01) conns.push({ x1: pa2.x, y1: pa2.y, x2: pb2.x, y2: pb2.y, op: lo2 }); }
        }
      }
      if (state === 'thinking' && m > 0.5) { for (var mi = 0; mi < 9; mi++) conns.push({ x1: np[mi].x, y1: np[mi].y, x2: np[mi + 1].x, y2: np[mi + 1].y, op: 0.12 }); }
      setPos({ p: np, c: conns, morph: m });
    };
    var interval = setInterval(tick, FPS); tick();
    return function() { running = false; clearInterval(interval); };
  }, []);

  if (!pos) return null;

  return (
    <Svg width={HEX_W} height={HEX_H} viewBox={'0 0 ' + HEX_W + ' ' + HEX_H}>
      <Defs>
        <RadialGradient id="nebula" cx={HEX_CX + ''} cy={HEX_CY + ''} rx={(HEX_W * 0.78) + ''} ry={(HEX_H * 0.55) + ''} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#4DA6FF" stopOpacity={0.20 * (1 - pos.morph)} />
          <Stop offset="25%" stopColor="#2A7FFF" stopOpacity={0.12 * (1 - pos.morph)} />
          <Stop offset="50%" stopColor="#4DA6FF" stopOpacity={0.08 * (1 - pos.morph)} />
          <Stop offset="75%" stopColor="#2A7FFF" stopOpacity={0.05 * (1 - pos.morph)} />
          <Stop offset="100%" stopColor="#4DA6FF" stopOpacity={0.02 * (1 - pos.morph)} />
        </RadialGradient>
        <RadialGradient id="greenGlow" cx={HEX_CX + ''} cy={(HEX_CY + HEX_H * 0.12) + ''} rx={(HEX_W * 0.25) + ''} ry={(HEX_H * 0.20) + ''} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#00D984" stopOpacity={0.12 * (1 - pos.morph)} />
          <Stop offset="50%" stopColor="#00A866" stopOpacity={0.06 * (1 - pos.morph)} />
          <Stop offset="100%" stopColor="#00D984" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={HEX_CX} cy={HEX_CY} rx={HEX_W * 0.78} ry={HEX_H * 0.55} fill="url(#nebula)" />
      <Ellipse cx={HEX_CX} cy={HEX_CY + HEX_H * 0.12} rx={HEX_W * 0.25} ry={HEX_H * 0.20} fill="url(#greenGlow)" />
      {pos.c.map(function(c, i) { return (<Line key={'c' + i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#4DA6FF" strokeWidth={0.7 * P_SCALE} opacity={c.op} />); })}
      {pos.p.map(function(p, i) {
        if (p.layer === 'dust' || p.layer === 'ambient') return (<Circle key={'p' + i} cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={p.opacity} />);
        return null;
      })}
      {pos.p.map(function(p, i) {
        if (p.layer === 'mid') {
          if (p.flash) return (<G key={'m' + i}><Circle cx={p.x} cy={p.y} r={p.size * 2} fill={p.color} opacity={0.4} /><Circle cx={p.x} cy={p.y} r={p.size} fill="#FFFFFF" opacity={0.85} /></G>);
          return (<G key={'m' + i}><Circle cx={p.x} cy={p.y} r={p.size * 2.2} fill={p.color} opacity={p.opacity * 0.05} /><Circle cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={p.opacity} /></G>);
        }
        return null;
      })}
      {pos.p.map(function(p, i) {
        if (p.layer === 'core') {
          if (p.flash) return (<G key={'k' + i}><Circle cx={p.x} cy={p.y} r={p.size * 3} fill={p.color} opacity={0.25} /><Circle cx={p.x} cy={p.y} r={p.size * 1.5} fill={p.color} opacity={0.8} /><Circle cx={p.x} cy={p.y} r={p.size} fill="#FFFFFF" opacity={0.95} /></G>);
          return (<G key={'k' + i}><Circle cx={p.x} cy={p.y} r={p.size * 3} fill={p.color} opacity={p.opacity * 0.06} /><Circle cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={p.opacity} /></G>);
        }
        return null;
      })}
    </Svg>
  );
};

var AlixenFace = function(props) {
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
        source={require('./assets/alixen-frame.png')}
        style={{ width: imgW, height: imgH, position: 'absolute', top: imgTop, left: imgLeft }}
        resizeMode="contain"
        pointerEvents="none"
      />
      <View style={{ position: 'absolute', top: INSET_Y_TOP, left: INSET_X, width: HEX_W, height: HEX_H }}>
        <AlixenParticles state={props.state} keystrokeCount={props.keystrokeCount} />
      </View>
      <Svg width={FRAME_W} height={FRAME_H} viewBox={'0 0 ' + FRAME_W + ' ' + FRAME_H} style={{ position: 'absolute', top: 0, left: 0 }}>
        {imps.map(function(imp, i) {
          var tx = tubePositions[imp.w];
          var cy = tubeTop + imp.pos * tubeHeight;
          return (
            <G key={'i' + i}>
              <Circle cx={tx} cy={cy} r={5} fill={imp.color} opacity={imp.op * 0.08} />
              <Circle cx={tx} cy={cy} r={3} fill={imp.color} opacity={imp.op * 0.35} />
              <Circle cx={tx} cy={cy} r={1.5} fill={imp.color} opacity={imp.op * 0.6} />
              <Circle cx={tx} cy={cy} r={0.6} fill="#FFF" opacity={imp.op * 0.8} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

var CircuitWires = function(props) {
  var wireMode = props.wireMode || 'idle';
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

  return (
    <View style={{ width: FRAME_W, height: WIRE_LEN, alignSelf: 'center' }}>
      <Svg width={FRAME_W} height={WIRE_LEN} viewBox={'0 0 ' + FRAME_W + ' ' + WIRE_LEN}>
        <Defs>
          <SvgLinearGradient id="clG" x1="0.3" y1="0" x2="0.7" y2="1">
            <Stop offset="0%" stopColor="#A0AAB4" /><Stop offset="50%" stopColor="#6B7B8D" /><Stop offset="100%" stopColor="#3E4855" />
          </SvgLinearGradient>
        </Defs>
        {WIRES.map(function(wire, i) {
          var sX = wire.x; var eX = wire.x + (i === 0 ? -5 : i === 2 ? 5 : 0);
          var act = (wireMode === 'user' && wire.role === 'user') || (wireMode === 'alixen' && wire.role === 'alixen');
          return (
            <G key={'w' + i}>
              <Line x1={sX} y1={0} x2={eX} y2={WIRE_LEN} stroke="#1A1D22" strokeWidth={8} opacity={act ? 0.3 : 0.12} strokeLinecap="round" />
              <Line x1={sX} y1={0} x2={eX} y2={WIRE_LEN} stroke="#4A5568" strokeWidth={6} opacity={act ? 0.35 : 0.15} strokeLinecap="round" />
              <Line x1={sX} y1={0} x2={eX} y2={WIRE_LEN} stroke="#6B7B8D" strokeWidth={3.5} opacity={act ? 0.25 : 0.10} strokeLinecap="round" />
              <Line x1={sX} y1={0} x2={eX} y2={WIRE_LEN} stroke="#A0AAB4" strokeWidth={1} opacity={act ? 0.15 : 0.05} />
              <Line x1={sX} y1={0} x2={eX} y2={WIRE_LEN} stroke={wire.color} strokeWidth={0.6} opacity={act ? 0.25 : 0.03} />
              <Circle cx={sX} cy={0} r={6} fill="#2A303B" /><Circle cx={sX} cy={0} r={5} fill="url(#clG)" /><Circle cx={sX} cy={0} r={1.5} fill={wire.color} opacity={act ? 0.6 : 0.15} />
              <Circle cx={eX} cy={WIRE_LEN} r={5} fill="#2A303B" /><Circle cx={eX} cy={WIRE_LEN} r={4} fill="url(#clG)" /><Circle cx={eX} cy={WIRE_LEN} r={1.2} fill={wire.color} opacity={act ? 0.5 : 0.10} />
            </G>
          );
        })}
        {imps.map(function(imp, i) {
          var wire = WIRES[imp.w]; var sX = wire.x; var eX = wire.x + (imp.w === 0 ? -5 : imp.w === 2 ? 5 : 0);
          var cx = sX + (eX - sX) * imp.pos; var cy = imp.pos * WIRE_LEN;
          return (<G key={'i' + i}><Circle cx={cx} cy={cy} r={5} fill={imp.color} opacity={imp.op * 0.08} /><Circle cx={cx} cy={cy} r={3} fill={imp.color} opacity={imp.op * 0.35} /><Circle cx={cx} cy={cy} r={1.5} fill={imp.color} opacity={imp.op * 0.6} /><Circle cx={cx} cy={cy} r={0.6} fill="#FFF" opacity={imp.op * 0.8} /></G>);
        })}
      </Svg>
    </View>
  );
};

function getWireMode(s) {
  if (s === 'listening' || s === 'scanning') return 'user';
  if (s === 'speaking' || s === 'thinking' || s === 'memory') return 'alixen';
  return 'idle';
}

// ═══ FUNNEL BRIDGE UNIFIED — V2 recalé verticalement ═══
var FunnelBridgeUnified = function(props) {
  var wm = props.wireMode || 'idle';
  var VW = 300;
  // Positions entonnoirs dans le viewBox — bleus écartés vers les bords
  var fX = [VW * 0.37, VW * 0.503, VW * 0.635];
  // Barre horizontale
  var barY = 24;
  var barL = VW * 0.17; var barR = VW * 0.83;
  // Câbles endpoints
  var cableBot = 70;

  return (
    <View style={{ alignSelf: 'center', width: FRAME_W }}>
      <Svg width={FRAME_W} height={Math.round(FRAME_W * 0.22)} viewBox={'0 0 ' + VW + ' 100'} preserveAspectRatio="xMidYMin meet">
        <Defs>
          <SvgLinearGradient id="metalCap2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#A0AAB4" />
            <Stop offset="50%" stopColor="#6B7B8D" />
            <Stop offset="100%" stopColor="#3E4855" />
          </SvgLinearGradient>
        </Defs>

        {/* Entonnoirs + Supports */}
        {fX.map(function(tx, i) {
          var tubeColor = i === 1 ? '#00D984' : '#4DA6FF';
          // V2: Blue fTop=4 (tips plus courts), Green fTop=14 (cristal vert plus long)
          var fTop = i === 1 ? 14 : 4;
          var fBot = i === 1 ? fTop + 9 : fTop + 11;
          return (
            <G key={'f' + i}>
              <Line x1={tx - 12} y1={fTop} x2={tx - 2.5} y2={fBot} stroke="#6B7B8D" strokeWidth={1.5} opacity={0.6} />
              <Line x1={tx + 12} y1={fTop} x2={tx + 2.5} y2={fBot} stroke="#6B7B8D" strokeWidth={1.5} opacity={0.6} />
              <Ellipse cx={tx} cy={fTop} rx={12} ry={4} fill="#2A303B" />
              <Ellipse cx={tx} cy={fTop} rx={11} ry={3.5} fill="url(#metalCap2)" />
              <Ellipse cx={tx} cy={fTop + 0.5} rx={8.5} ry={2.5} fill="#1A1D22" opacity={0.4} />
              <Circle cx={tx} cy={fTop + 0.5} r={2} fill={tubeColor} opacity={0.35} />
              <Ellipse cx={tx} cy={fBot} rx={3} ry={1.4} fill="url(#metalCap2)" opacity={0.8} />
              <Line x1={tx - 8.5} y1={fTop + 3} x2={tx - 2} y2={fBot - 2} stroke={tubeColor} strokeWidth={0.4} opacity={0.20} />
              <Line x1={tx + 8.5} y1={fTop + 3} x2={tx + 2} y2={fBot - 2} stroke={tubeColor} strokeWidth={0.4} opacity={0.20} />
              <Circle cx={tx} cy={fBot - 1} r={3} fill={tubeColor} opacity={0.08} />
              <Circle cx={tx} cy={fBot - 1} r={2} fill={tubeColor} opacity={0.15} />
              <Circle cx={tx} cy={fBot - 1} r={0.8} fill="#FFF" opacity={0.3} />
              {/* Supports métalliques */}
              <Line x1={tx - 2.5} y1={fBot} x2={tx - 2.5} y2={barY} stroke="#6B7B8D" strokeWidth={1.8} opacity={0.5} strokeLinecap="round" />
              <Line x1={tx + 2.5} y1={fBot} x2={tx + 2.5} y2={barY} stroke="#6B7B8D" strokeWidth={1.8} opacity={0.5} strokeLinecap="round" />
              <Line x1={tx - 2} y1={fBot + 0.5} x2={tx - 2} y2={barY - 1} stroke="#A0AAB4" strokeWidth={0.4} opacity={0.25} />
              <Rect x={tx - 5} y={barY - 1.5} width={10} height={2} rx={1} fill="url(#metalCap2)" opacity={0.7} />
            </G>
          );
        })}

        {/* Barre horizontale */}
        <Rect x={barL} y={barY} width={barR - barL} height={3} rx={1.5} fill="#6B7B8D" />
        <Rect x={barL + 3} y={barY + 0.5} width={barR - barL - 6} height={1} rx={0.5} fill="#A0AAB4" opacity={0.3} />

        {/* Plaque LixTag Premium — badge identité suspendu */}
        <Line x1={VW * 0.5 - 30} y1={barY + 3} x2={VW * 0.5 - 30} y2={barY + 8} stroke="#6B7B8D" strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={VW * 0.5 + 30} y1={barY + 3} x2={VW * 0.5 + 30} y2={barY + 8} stroke="#6B7B8D" strokeWidth={1.8} strokeLinecap="round" />
        <Line x1={VW * 0.5 - 29.5} y1={barY + 3.5} x2={VW * 0.5 - 29.5} y2={barY + 8} stroke="#A0AAB4" strokeWidth={0.5} opacity={0.3} />
        <Line x1={VW * 0.5 + 29.5} y1={barY + 3.5} x2={VW * 0.5 + 29.5} y2={barY + 8} stroke="#A0AAB4" strokeWidth={0.5} opacity={0.3} />
        <Rect x={VW * 0.5 - 43} y={barY + 7} width={86} height={28} rx={7} fill="#0D1117" stroke="#3E4855" strokeWidth={1} />
        <Rect x={VW * 0.5 - 41} y={barY + 9} width={82} height={24} rx={6} fill="#1A1D22" stroke="#4A4F55" strokeWidth={0.6} />
        <Rect x={VW * 0.5 - 39} y={barY + 11} width={78} height={20} rx={5} fill="none" stroke="rgba(212,175,55,0.25)" strokeWidth={0.8} />
        <Line x1={VW * 0.5 - 33} y1={barY + 17} x2={VW * 0.5 + 33} y2={barY + 17} stroke="rgba(212,175,55,0.12)" strokeWidth={0.5} />
        <Circle cx={VW * 0.5 - 34} cy={barY + 22} r={1.2} fill="#D4AF37" opacity={0.30} />
        <Circle cx={VW * 0.5 + 34} cy={barY + 22} r={1.2} fill="#D4AF37" opacity={0.30} />
        <SvgText x={VW * 0.5} y={barY + 24} textAnchor="middle" fill="#D4AF37" fontSize={9} fontWeight="800" letterSpacing={2.5}>LXM-2K7F4A</SvgText>
        <SvgText x={VW * 0.5} y={barY + 29} textAnchor="middle" fill="#6B7B8D" fontSize={4.5} fontWeight="600" letterSpacing={1.2}>MEMBRE LIXUM</SvgText>

        {/* Capots aux extrémités */}
        <Rect x={barL - 7} y={barY - 3} width={14} height={9} rx={4.5} fill="#1A1D22" />
        <Rect x={barL - 6} y={barY - 2} width={12} height={7} rx={3.5} fill="#3E4855" />
        <Ellipse cx={barL} cy={barY + 1.5} rx={4} ry={2} fill="#4A4F55" />
        <Ellipse cx={barL} cy={barY + 1} rx={2.5} ry={1} fill="#6B7B8D" opacity={0.35} />
        <Rect x={barR - 7} y={barY - 3} width={14} height={9} rx={4.5} fill="#1A1D22" />
        <Rect x={barR - 6} y={barY - 2} width={12} height={7} rx={3.5} fill="#3E4855" />
        <Ellipse cx={barR} cy={barY + 1.5} rx={4} ry={2} fill="#4A4F55" />
        <Ellipse cx={barR} cy={barY + 1} rx={2.5} ry={1} fill="#6B7B8D" opacity={0.35} />

        {/* Câbles vrais S — émeraude gauche */}
        <Path d={'M ' + barL + ' ' + (barY + 2) + ' C ' + (barL - 28) + ' ' + (barY + 20) + ', ' + (VW * 0.27 + 28) + ' ' + (cableBot - 20) + ', ' + (VW * 0.27) + ' ' + cableBot} stroke="#00D984" strokeWidth={3} opacity={0.05} fill="none" strokeLinecap="round" />
        <Path d={'M ' + barL + ' ' + (barY + 2) + ' C ' + (barL - 28) + ' ' + (barY + 20) + ', ' + (VW * 0.27 + 28) + ' ' + (cableBot - 20) + ', ' + (VW * 0.27) + ' ' + cableBot} stroke="#00D984" strokeWidth={1.5} opacity={0.18} fill="none" strokeLinecap="round" />
        <Path d={'M ' + barL + ' ' + (barY + 2) + ' C ' + (barL - 28) + ' ' + (barY + 20) + ', ' + (VW * 0.27 + 28) + ' ' + (cableBot - 20) + ', ' + (VW * 0.27) + ' ' + cableBot} stroke="#B8E4FF" strokeWidth={0.5} opacity={0.25} fill="none" strokeLinecap="round" />
        {/* Câbles vrais S — doré droite */}
        <Path d={'M ' + barR + ' ' + (barY + 2) + ' C ' + (barR + 28) + ' ' + (barY + 20) + ', ' + (VW * 0.73 - 28) + ' ' + (cableBot - 20) + ', ' + (VW * 0.73) + ' ' + cableBot} stroke="#D4AF37" strokeWidth={3} opacity={0.05} fill="none" strokeLinecap="round" />
        <Path d={'M ' + barR + ' ' + (barY + 2) + ' C ' + (barR + 28) + ' ' + (barY + 20) + ', ' + (VW * 0.73 - 28) + ' ' + (cableBot - 20) + ', ' + (VW * 0.73) + ' ' + cableBot} stroke="#D4AF37" strokeWidth={1.5} opacity={0.18} fill="none" strokeLinecap="round" />
        <Path d={'M ' + barR + ' ' + (barY + 2) + ' C ' + (barR + 28) + ' ' + (barY + 20) + ', ' + (VW * 0.73 - 28) + ' ' + (cableBot - 20) + ', ' + (VW * 0.73) + ' ' + cableBot} stroke="#FFF5D4" strokeWidth={0.5} opacity={0.25} fill="none" strokeLinecap="round" />
        {/* Jonctions métal câble-carte */}
        <Circle cx={VW * 0.27} cy={cableBot} r={5} fill="#1A1D22" />
        <Circle cx={VW * 0.27} cy={cableBot} r={4} fill="#3E4855" />
        <Circle cx={VW * 0.27} cy={cableBot} r={2.5} fill="#6B7B8D" />
        <Circle cx={VW * 0.27} cy={cableBot} r={1} fill="#00D984" opacity={0.5} />
        <Circle cx={VW * 0.73} cy={cableBot} r={5} fill="#1A1D22" />
        <Circle cx={VW * 0.73} cy={cableBot} r={4} fill="#3E4855" />
        <Circle cx={VW * 0.73} cy={cableBot} r={2.5} fill="#6B7B8D" />
        <Circle cx={VW * 0.73} cy={cableBot} r={1} fill="#D4AF37" opacity={0.5} />
      </Svg>
    </View>
  );
};

// ═══ APP ═══
export default function App() {
  var _s = useState('thinking'); var cs = _s[0]; var setS = _s[1];
  var _ks = useState(0); var ksCount = _ks[0]; var setKsCount = _ks[1];
  var _txt = useState(''); var txt = _txt[0]; var setTxt = _txt[1];
  var _pulse = useState(0); var pulse = _pulse[0]; var setPulse = _pulse[1];
  var _search = useState(false); var searchOn = _search[0]; var setSearchOn = _search[1];

  useEffect(function() {
    var st = Date.now();
    var iv = setInterval(function() {
      setPulse(Math.sin((Date.now() - st) / 1000 * 2) * 0.5 + 0.5);
    }, 80);
    return function() { clearInterval(iv); };
  }, []);

  var wm = getWireMode(cs);
  var mockBalls = [
    { id: 1, role: 'assistant' }, { id: 2, role: 'user' },
    { id: 3, role: 'assistant' }, { id: 4, role: 'user' },
    { id: 5, role: 'assistant' },
  ];

  return (
    <SafeAreaProvider><View style={{ flex: 1, backgroundColor: '#E8ECF0' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F8" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={{ backgroundColor: '#F4F6F8', paddingHorizontal: 16, paddingVertical: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' }}>
          <View>
            <Text style={{ color: '#1A2030', fontSize: 18, fontWeight: '800' }}>MedicAi</Text>
            <Text style={{ color: 'rgba(0,150,120,0.45)', fontSize: 7, letterSpacing: 2 }}>ESPACE SANTÉ INTELLIGENT</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.08)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)' }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#00D984', marginRight: 5 }} />
            <Text style={{ color: '#00D984', fontSize: 9, fontWeight: '700' }}>ALIXEN ACTIF</Text>
          </View>
        </View>

        {/* Zone sombre ALIXEN */}
        <View style={{ backgroundColor: '#1E2530', overflow: 'hidden' }}>
          <View style={{ width: FRAME_W, height: MODULE_H, alignSelf: 'center' }}>
            <View style={{ position: 'absolute', top: BRIDGE_TOP, left: 0, width: FRAME_W }}>
              <FunnelBridgeUnified wireMode={wm} />
            </View>
            <AlixenFace state={cs} keystrokeCount={ksCount} />
          </View>
          <View style={{ alignSelf: 'stretch', flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 6, marginTop: Math.round(FRAME_W * -0.065), gap: 8 }}>
            <Pressable style={{ flex: 1, backgroundColor: '#2A303B', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,217,132,0.15)', borderTopWidth: 2, borderTopColor: 'rgba(0,217,132,0.25)' }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Rect x="3" y="2" width="14" height="20" rx="2" stroke="#00D984" strokeWidth="1.5" fill="none" />
                <Line x1="7" y1="8" x2="13" y2="8" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
                <Line x1="7" y1="12" x2="13" y2="12" stroke="#00D984" strokeWidth="1.5" strokeLinecap="round" />
              </Svg>
              <Text style={{ color: '#00D984', fontSize: 8, fontWeight: '700', marginTop: 2 }}>MediBook</Text>
            </Pressable>
            <Pressable style={{ flex: 1, backgroundColor: '#2A303B', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', borderTopWidth: 2, borderTopColor: 'rgba(212,175,55,0.25)' }}>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#D4AF37" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <Rect x="9" y="10" width="6" height="5" rx="1" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
              </Svg>
              <Text style={{ color: '#D4AF37', fontSize: 8, fontWeight: '700', marginTop: 2 }}>Secret Pocket</Text>
            </Pressable>
          </View>
        </View>

        {/* Zone scrollable chat */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8, paddingTop: 4 }}>
          {/* Labels ALIXEN / Membre — bulles animées */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 8, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: wm === 'alixen' ? 12 : 10, height: wm === 'alixen' ? 12 : 10, borderRadius: 6, backgroundColor: '#4DA6FF', marginRight: 5, justifyContent: 'center', alignItems: 'center', opacity: wm === 'alixen' ? (0.8 + pulse * 0.2) : 0.35 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF', opacity: wm === 'alixen' ? (0.6 + pulse * 0.4) : 0.3 }} />
              </View>
              <Text style={{ color: wm === 'alixen' ? '#4DA6FF' : '#8892A0', fontSize: 9, fontWeight: '600' }}>ALIXEN</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: wm === 'user' ? 12 : 10, height: wm === 'user' ? 12 : 10, borderRadius: 6, backgroundColor: '#00D984', marginRight: 5, justifyContent: 'center', alignItems: 'center', opacity: wm === 'user' ? (0.8 + pulse * 0.2) : 0.35 }}>
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF', opacity: wm === 'user' ? (0.6 + pulse * 0.4) : 0.3 }} />
              </View>
              <Text style={{ color: wm === 'user' ? '#00D984' : '#8892A0', fontSize: 9, fontWeight: '600' }}>Membre</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 4, marginBottom: 10 }}>
            {mockBalls.map(function(b) {
              var isBot = b.role === 'assistant';
              var topC = isBot ? '#7DB8FF' : '#66EDAA';
              var botC = isBot ? '#1A6BC4' : '#00A868';
              return (
                <View key={b.id} style={{ width: 32, height: 32, borderRadius: 16, overflow: 'hidden' }}>
                  <LinearGradient colors={[topC, botC]} style={{ width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>{b.id}</Text>
                  </LinearGradient>
                </View>
              );
            })}
            <View style={{ width: 32, height: 32, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(0,217,132,0.3)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,217,132,0.05)' }}>
              <Text style={{ color: '#00D984', fontSize: 14, fontWeight: '300' }}>+</Text>
            </View>
          </View>

          <View style={{ marginHorizontal: 10, marginBottom: 8, borderRadius: 16, backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: 'rgba(77,166,255,' + (0.10 + pulse * 0.08) + ')', borderLeftWidth: 3, borderLeftColor: '#4DA6FF', padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#4DA6FF', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '800' }}>AI</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#2D3436', letterSpacing: 1 }}>ALIXEN</Text>
            </View>
            <Text style={{ color: '#3A4550', fontSize: 13, lineHeight: 20 }}>Avec tes 25 ans, 75kg pour 1m78 et ton objectif de maintien, voici tes besoins quotidiens : Calories 2100 kcal, Proteines 120g, Glucides 260g, Lipides 70g. Tu es a 45g sur 120g recommandes.</Text>
          </View>
        </ScrollView>

        {/* Zone fixe bas — Saisie */}
        {searchOn && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#FFF', marginHorizontal: 8, borderRadius: 14, marginBottom: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' }}>
            <TextInput autoFocus style={{ flex: 1, color: '#00A878', fontSize: 13, paddingVertical: 3 }} placeholder="Rechercher dans les messages..." placeholderTextColor="rgba(0,0,0,0.2)" />
            <Pressable onPress={function() { setSearchOn(false); }} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center', marginLeft: 6 }}>
              <Text style={{ color: '#999', fontSize: 12, fontWeight: 'bold' }}>X</Text>
            </Pressable>
          </View>
        )}
        <View style={{ marginHorizontal: 12, marginBottom: 8, borderRadius: 28, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 4, gap: 5 }}>
            <Pressable style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#4A4F55', overflow: 'hidden' }}>
              <LinearGradient colors={['#3A3F46', '#252A30']} style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Line x1="12" y1="5" x2="12" y2="19" stroke="#00D984" strokeWidth="2" strokeLinecap="round" />
                  <Line x1="5" y1="12" x2="19" y2="12" stroke="#00D984" strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={function() { setSearchOn(!searchOn); }} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#4A4F55', overflow: 'hidden' }}>
              <LinearGradient colors={['#3A3F46', '#252A30']} style={{ width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Circle cx="11" cy="11" r="7" stroke="#00D984" strokeWidth="2" fill="none" />
                  <Line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#00D984" strokeWidth="2" strokeLinecap="round" />
                </Svg>
              </LinearGradient>
            </Pressable>
            <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 14, marginHorizontal: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
              <TextInput value={txt} onChangeText={function(val) { setTxt(val); setKsCount(ksCount + 1); if (cs !== 'listening') { setS('listening'); } }} placeholder="Votre message" placeholderTextColor="rgba(0,0,0,0.3)" style={{ fontSize: 13, color: '#2D3436', paddingVertical: 8 }} />
            </View>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' }}>
              <Text style={{ color: txt.trim() ? '#00D984' : 'rgba(0,0,0,0.12)', fontSize: 14, fontWeight: 'bold' }}>{'➤'}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View></SafeAreaProvider>
  );
}
