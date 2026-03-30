// ──────────────────────────────────────────────────────────────────────────────
// medicai/AlixenFace.js — ALIXEN Constellation Protéique Vivante
// Système de particules sans forme permanente — 6 états comportementaux
// ──────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle, Line, G, Polygon, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

var W = Dimensions.get('window').width;
var HEX_W = W - 32;
var HEX_H = 180;
var HEX_CX = HEX_W / 2;
var HEX_CY = HEX_H / 2;
var HEX_INSET = 30;
var NUM_PARTICLES = 420;
var FPS = 33;
var CONN_DIST = 16;
var MAX_CONN = 45;
var WIRE_LEN = 55;

var HEX_PTS = [
  { x: HEX_INSET, y: 0 }, { x: HEX_W - HEX_INSET, y: 0 },
  { x: HEX_W, y: HEX_H / 2 }, { x: HEX_W - HEX_INSET, y: HEX_H },
  { x: HEX_INSET, y: HEX_H }, { x: 0, y: HEX_H / 2 },
];
var HEX_STR = HEX_PTS.map(function(p) { return p.x + ',' + p.y; }).join(' ');
var WIRES = [
  { x: HEX_CX - 40, dir: 'down', color: '#4DA6FF', role: 'alixen' },
  { x: HEX_CX, dir: 'up', color: '#00D984', role: 'user' },
  { x: HEX_CX + 40, dir: 'down', color: '#4DA6FF', role: 'alixen' },
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
    var size = layer === 'core' ? 1.2 + sr(i * 5.5) * 1.3 : layer === 'mid' ? 0.8 + sr(i * 6.3) * 1.0 : layer === 'ambient' ? 0.4 + sr(i * 7.1) * 0.8 : 0.2 + sr(i * 8.9) * 0.5;
    var cr = sr(i * 11.3 + 0.5);
    var color = cr < 0.35 ? '#4DA6FF' : cr < 0.55 ? '#2A7FFF' : cr < 0.70 ? '#7DD3FC' : cr < 0.80 ? '#B8E4FF' : cr < 0.90 ? '#00D984' : cr < 0.96 ? '#00A866' : '#D4AF37';
    var baseOp = layer === 'core' ? 0.60 + sr(i * 9.7) * 0.35 : layer === 'mid' ? 0.30 + sr(i * 10.1) * 0.30 : layer === 'ambient' ? 0.10 + sr(i * 12.3) * 0.18 : 0.04 + sr(i * 13.7) * 0.10;
    p.push({
      id: i, homeX: px - HEX_CX, homeY: py - HEX_CY, size: size, color: color,
      layer: layer, baseOp: baseOp,
      phX: sr(i * 17.3) * Math.PI * 2, phY: sr(i * 19.7) * Math.PI * 2,
      fX1: 0.4 + sr(i * 31.7) * 0.35, fY1: 0.35 + sr(i * 37.3) * 0.30,
      fX2: 0.2 + sr(i * 41.1) * 0.15, fY2: 0.15 + sr(i * 43.9) * 0.12,
      drift: layer === 'dust' ? 8 : layer === 'ambient' ? 6 : layer === 'mid' ? 3.5 : 2.2,
    });
    i++;
  }
  return p;
}

// ═══ SHAPES ═══
function getSpeakTarget(p, t) {
  var idx = p.id;
  var bandY = ((idx % 8) - 3.5) * 6;
  var spread = 30 + Math.sin(t * 3 - Math.abs(bandY) * 0.1) * 20;
  var posInBand = (Math.floor(idx / 8) / (NUM_PARTICLES / 8)) * 2 - 1;
  var x = posInBand * spread;
  var waveX = Math.sin(t * 4 + idx * 0.05) * 3;
  return { x: x + waveX, y: bandY };
}

function getBrainTarget(p, t) {
  var idx = p.id;
  var hemiGap = 25;
  if (idx < 10) {
    var speed = 1.5 + sr(idx * 3.3) * 1.0;
    var phase = Math.sin(t * speed + idx * 0.628);
    return { x: phase * hemiGap, y: Math.sin(t * 2.3 + idx * 1.7) * 5 };
  }
  var isLeft = (idx % 2 === 0);
  var centerX = isLeft ? -hemiGap : hemiGap;
  var ovalAngle = sr(idx * 4.7) * Math.PI * 2;
  var px = centerX + Math.cos(ovalAngle + t * 0.15) * (28 + sr(idx * 5.1) * 12) * 0.5;
  var py = Math.sin(ovalAngle + t * 0.12) * (32 + sr(idx * 6.3) * 10) * 0.5;
  var leftPulse = Math.sin(t * 1.8) * 0.5 + 0.5;
  var rightPulse = Math.sin(t * 1.8 + Math.PI) * 0.5 + 0.5;
  var scale = 0.85 + (isLeft ? leftPulse : rightPulse) * 0.15;
  return { x: px * scale, y: py * scale };
}

function getListenTarget(p, t) {
  var idx = p.id;
  var progress = (idx / NUM_PARTICLES);
  var funnelY = -40 + progress * 80;
  var widthAtY = 60 * (1 - progress * 0.85);
  var angle = sr(idx * 4.4) * Math.PI * 2 + t * 0.3;
  var converge = Math.sin(t * 2 + progress * 3) * 5;
  var r = Math.max(2, widthAtY - converge);
  return { x: Math.cos(angle) * r, y: funnelY };
}

function getEyeTarget(p, t) {
  var idx = p.id;
  if (idx < 40) {
    var a = (idx / 40) * Math.PI * 2;
    var contract = 2 + Math.sin(t * 2.5) * 2;
    var r = 3 + sr(idx * 3.3) * (6 - contract);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.9 };
  }
  if (idx < 140) {
    var a = ((idx - 40) / 100) * Math.PI * 2 + t * 0.12;
    var r = 18 + sr(idx * 4.7) * 5;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.75 };
  }
  if (idx < 240) {
    var eIdx = idx - 140;
    var t2 = eIdx / 99;
    var angle = (t2 * 2 - 1) * Math.PI * 0.85;
    var rx = 55;
    var ry = 18;
    var x = Math.cos(angle) * rx;
    var isTop = eIdx < 50;
    var y = isTop ? -Math.sqrt(Math.max(0, 1 - (x * x) / (rx * rx))) * ry : Math.sqrt(Math.max(0, 1 - (x * x) / (rx * rx))) * ry * 0.7;
    var blink = Math.sin(t * 1.2) * 2;
    return { x: x, y: y + (isTop ? -blink : blink) };
  }
  if (idx < 270) {
    var cIdx = idx - 240;
    var isRight = cIdx >= 15;
    var ci = cIdx % 15;
    var cornerX = isRight ? 52 : -52;
    var cAngle = isRight ? (-0.3 + ci * 0.04) : (Math.PI + 0.3 - ci * 0.04);
    var cR = 8 + ci * 0.8;
    return { x: cornerX + Math.cos(cAngle) * cR, y: Math.sin(cAngle) * cR };
  }
  var scanX = Math.sin(t * 3.5) * 50;
  var lIdx = idx - 270;
  return { x: scanX + sr(idx * 2.1) * 4, y: (lIdx / (NUM_PARTICLES - 270)) * 30 - 15 };
}

function getMemoryTarget(p, t) {
  var agitation = 3 + Math.sin(t * 1.5 + p.id * 0.3) * 2;
  return { x: p.homeX + Math.sin(t * 0.8 + p.phX) * agitation, y: p.homeY + Math.cos(t * 0.6 + p.phY) * agitation };
}

function isMemoryFlash(particleId, elapsed) {
  var slot = Math.floor(elapsed * 5);
  for (var f = 0; f < 5; f++) {
    if (Math.floor(sr(slot * 7.7 + f * 13.3) * NUM_PARTICLES) === particleId) return true;
  }
  return false;
}

function getTarget(p, t, state) {
  switch (state) {
    case 'speaking': return getSpeakTarget(p, t);
    case 'thinking': return getBrainTarget(p, t);
    case 'listening': return getListenTarget(p, t);
    case 'scanning': return getEyeTarget(p, t);
    case 'memory': return getMemoryTarget(p, t);
    default: return { x: p.homeX, y: p.homeY };
  }
}

function getHeartbeat(elapsed) {
  var cycle = elapsed % 3.0;
  if (cycle < 0.12) return Math.sin(cycle / 0.12 * Math.PI) * 0.06;
  if (cycle > 0.25 && cycle < 0.35) return Math.sin((cycle - 0.25) / 0.10 * Math.PI) * 0.03;
  return 0;
}

// ═══ ALIXEN FACE COMPONENT ═══
export var AlixenFace = function(props) {
  var reqState = props.state || 'idle';
  var particles = useMemo(function() { return genParticles(); }, []);
  var _pos = useState(null);
  var pos = _pos[0]; var setPos = _pos[1];
  var morphRef = useRef(0);
  var activeRef = useRef('idle');
  var pendingRef = useRef(null);
  var phaseRef = useRef('idle');
  var startRef = useRef(Date.now());

  useEffect(function() {
    var cur = activeRef.current;
    if (reqState === cur) return;
    if (reqState === 'idle') { phaseRef.current = 'out'; pendingRef.current = null; }
    else if (cur === 'idle') { activeRef.current = reqState; phaseRef.current = 'in'; }
    else { phaseRef.current = 'out'; pendingRef.current = reqState; }
  }, [reqState]);

  useEffect(function() {
    var running = true;
    startRef.current = Date.now();
    var tick = function() {
      if (!running) return;
      var el = (Date.now() - startRef.current) / 1000;
      var ph = phaseRef.current;
      var m = morphRef.current;
      if (ph === 'in') { m += 0.025; if (m >= 1) { m = 1; phaseRef.current = 'active'; } }
      else if (ph === 'out') { m -= 0.03; if (m <= 0.02) { m = 0; var pend = pendingRef.current; if (pend) { activeRef.current = pend; pendingRef.current = null; phaseRef.current = 'in'; } else { activeRef.current = 'idle'; phaseRef.current = 'idle'; } } }
      else if (ph === 'active') { m = 1; }
      else { m = 0; }
      morphRef.current = m;

      var state = activeRef.current;
      var hb = getHeartbeat(el);
      var isMemState = state === 'memory' && m > 0.5;
      var np = [];

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dX = Math.sin(el * p.fX1 + p.phX) * p.drift + Math.sin(el * p.fX2 + p.phX * 1.7) * p.drift * 0.4;
        var dY = Math.cos(el * p.fY1 + p.phY) * p.drift + Math.cos(el * p.fY2 + p.phY * 1.3) * p.drift * 0.4;
        var hbF = 1 - hb;
        var idleX = HEX_CX + (p.homeX + dX) * hbF;
        var idleY = HEX_CY + (p.homeY + dY) * hbF;
        var tgt = getTarget(p, el, state);
        var tgtX = HEX_CX + tgt.x;
        var tgtY = HEX_CY + tgt.y;
        var dist = Math.sqrt(p.homeX * p.homeX + p.homeY * p.homeY);
        var delay = (dist / (Math.min(HEX_W, HEX_H) * 0.45)) * 0.3;
        var adj = Math.max(0, Math.min(1, (m - delay) / Math.max(0.01, 1 - delay)));
        var eased = adj < 0.5 ? 4 * adj * adj * adj : 1 - Math.pow(-2 * adj + 2, 3) / 2;
        var x = Math.max(4, Math.min(HEX_W - 4, idleX + (tgtX - idleX) * eased));
        var y = Math.max(4, Math.min(HEX_H - 4, idleY + (tgtY - idleY) * eased));
        var breathe = Math.sin(el * 0.35 + p.phX) * 0.5 + 0.5;
        var opacity = p.baseOp;
        if (state !== 'idle' && m > 0.4) {
          if (p.layer === 'core') opacity = Math.min(0.95, opacity * 1.8);
          if (p.layer === 'mid') opacity = Math.min(0.70, opacity * 1.5);
        }
        opacity = opacity * (0.85 + breathe * 0.15);
        var flash = false;
        if (isMemState && isMemoryFlash(p.id, el)) { opacity = 1.0; flash = true; }
        var color = p.color;
        if (state === 'thinking' && m > 0.5 && p.id < 10) { color = '#D4AF37'; opacity = 0.9; }
        if (state === 'thinking' && m > 0.5 && p.id >= 10) {
          var pulse = (p.id % 2 === 0) ? (Math.sin(el * 1.8) * 0.5 + 0.5) : (Math.sin(el * 1.8 + Math.PI) * 0.5 + 0.5);
          opacity = opacity * (0.6 + pulse * 0.4);
        }
        var size = p.size;
        if (flash) size = p.size * 2.5;
        if (state === 'speaking' && m > 0.4) { size *= (1 + Math.sin(el * 3 - (p.id % 6) * 0.9) * 0.2); }
        np.push({ x: x, y: y, size: size, opacity: opacity, color: color, layer: p.layer, flash: flash });
      }

      var conns = [];
      for (var a = 0; a < Math.min(particles.length, 100); a += 2) {
        if (conns.length >= MAX_CONN) break;
        for (var b = a + 1; b < Math.min(particles.length, 100); b += 2) {
          if (conns.length >= MAX_CONN) break;
          var pa = np[a]; var pb = np[b];
          var dx = pa.x - pb.x; var dy = pa.y - pb.y;
          var dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < CONN_DIST && dd > 2) {
            var lo = (1 - dd / CONN_DIST) * 0.15 * (0.5 + Math.sin(el * 1.2 + a * 0.3) * 0.5);
            if (lo > 0.01) conns.push({ x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y, op: lo });
          }
        }
      }
      if (state === 'thinking' && m > 0.5) {
        for (var mi = 0; mi < 9; mi++) conns.push({ x1: np[mi].x, y1: np[mi].y, x2: np[mi + 1].x, y2: np[mi + 1].y, op: 0.12 });
      }
      setPos({ p: np, c: conns });
    };
    var interval = setInterval(tick, FPS);
    tick();
    return function() { running = false; clearInterval(interval); };
  }, []);

  if (!pos) return null;

  return (
    <View style={{ width: HEX_W, height: HEX_H }}>
      <Svg width={HEX_W} height={HEX_H} viewBox={'0 0 ' + HEX_W + ' ' + HEX_H}>
        <Defs>
          <SvgLinearGradient id="hF" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#4DA6FF" stopOpacity="0.04" />
            <Stop offset="50%" stopColor="#4DA6FF" stopOpacity="0.06" />
            <Stop offset="100%" stopColor="#4DA6FF" stopOpacity="0.03" />
          </SvgLinearGradient>
          <SvgLinearGradient id="mB" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#8892A0" />
            <Stop offset="25%" stopColor="#6B7B8D" />
            <Stop offset="50%" stopColor="#4A5568" />
            <Stop offset="75%" stopColor="#6B7B8D" />
            <Stop offset="100%" stopColor="#8892A0" />
          </SvgLinearGradient>
        </Defs>
        <Polygon points={HEX_STR} fill="url(#hF)" />
        <Polygon points={HEX_STR} fill="none" stroke="url(#mB)" strokeWidth={1.8} />
        <Polygon points={HEX_STR} fill="none" stroke="#4A5568" strokeWidth={0.5} opacity={0.5} />
        {HEX_PTS.map(function(pt, i) { return (<G key={'v' + i}><Circle cx={pt.x} cy={pt.y} r={3} fill="#3E4855" /><Circle cx={pt.x} cy={pt.y} r={2} fill="#6B7B8D" /><Circle cx={pt.x} cy={pt.y} r={0.8} fill="#8892A0" opacity={0.8} /></G>); })}
        {pos.c.map(function(c, i) { return (<Line key={'c' + i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2} stroke="#4DA6FF" strokeWidth={0.3} opacity={c.op} />); })}
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
    </View>
  );
};

// ═══ CIRCUIT WIRES ═══
export var CircuitWires = function(props) {
  var wireMode = props.wireMode || 'idle';
  var _imp = useState([]);
  var imps = _imp[0]; var setImps = _imp[1];

  useEffect(function() {
    var st = Date.now();
    var iv = setInterval(function() {
      var el = (Date.now() - st) / 1000;
      var ni = [];
      for (var w = 0; w < 3; w++) {
        var wire = WIRES[w];
        var active = (wireMode === 'user' && wire.role === 'user') || (wireMode === 'alixen' && wire.role === 'alixen');
        if (!active) continue;
        var sp = wire.role === 'user' ? 1.4 : 1.8;
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
    <View style={{ width: HEX_W, height: WIRE_LEN, alignSelf: 'center' }}>
      <Svg width={HEX_W} height={WIRE_LEN} viewBox={'0 0 ' + HEX_W + ' ' + WIRE_LEN}>
        {WIRES.map(function(wire, i) {
          var sX = wire.x; var eX = wire.x + (i === 0 ? -6 : i === 2 ? 6 : 0);
          var act = (wireMode === 'user' && wire.role === 'user') || (wireMode === 'alixen' && wire.role === 'alixen');
          return (
            <G key={'w' + i}>
              <Line x1={sX} y1={0} x2={eX} y2={WIRE_LEN} stroke="#4A5568" strokeWidth={2.5} opacity={act ? 0.7 : 0.25} />
              <Line x1={sX} y1={0} x2={eX} y2={WIRE_LEN} stroke="#6B7B8D" strokeWidth={1.2} opacity={act ? 0.9 : 0.35} />
              <Line x1={sX} y1={0} x2={eX} y2={WIRE_LEN} stroke={wire.color} strokeWidth={0.4} opacity={act ? 0.3 : 0.04} />
              <Circle cx={sX} cy={0} r={3.5} fill="#3E4855" /><Circle cx={sX} cy={0} r={2.5} fill="#6B7B8D" /><Circle cx={sX} cy={0} r={1} fill={wire.color} opacity={act ? 0.6 : 0.12} />
              <Circle cx={eX} cy={WIRE_LEN} r={3} fill="#3E4855" /><Circle cx={eX} cy={WIRE_LEN} r={2} fill="#6B7B8D" /><Circle cx={eX} cy={WIRE_LEN} r={0.8} fill={wire.color} opacity={act ? 0.5 : 0.08} />
            </G>
          );
        })}
        {imps.map(function(imp, i) {
          var wire = WIRES[imp.w];
          var sX = wire.x; var eX = wire.x + (imp.w === 0 ? -6 : imp.w === 2 ? 6 : 0);
          var cx = sX + (eX - sX) * imp.pos; var cy = imp.pos * WIRE_LEN;
          return (<G key={'i' + i}><Circle cx={cx} cy={cy} r={7} fill={imp.color} opacity={imp.op * 0.12} /><Circle cx={cx} cy={cy} r={3} fill={imp.color} opacity={imp.op * 0.45} /><Circle cx={cx} cy={cy} r={1.2} fill="#FFF" opacity={imp.op * 0.7} /></G>);
        })}
      </Svg>
    </View>
  );
};

// ═══ HELPER — State → Wire Mode ═══
export function getWireMode(state) {
  if (state === 'listening' || state === 'scanning') return 'user';
  if (state === 'speaking' || state === 'thinking' || state === 'memory') return 'alixen';
  return 'idle';
}

// ═══ ALIXEN HEADER — Container complet (remplace DoctorHeader) ═══
export var AlixenHeader = function(props) {
  var alixenState = props.state || 'idle';
  var wireMode = getWireMode(alixenState);

  return (
    <View style={{
      width: W,
      backgroundColor: '#1A2029',
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 0,
    }}>
      <LinearGradient
        colors={['#1E2530', '#222A35', '#1A2029']}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        }}
      />
      <AlixenFace state={alixenState} />
      <CircuitWires wireMode={wireMode} />
      {/* Separator bar */}
      <View style={{ height: 2, marginHorizontal: 0, marginBottom: 4 }}>
        <View style={{ height: 1, backgroundColor: '#4A5568', opacity: 0.6 }} />
      </View>
      {/* Transition dégradé vers fond clair MedicAi */}
      <View style={{
        height: 15,
        marginHorizontal: -16,
      }}>
        <LinearGradient
          colors={['#1A2029', 'rgba(26,32,41,0.7)', 'rgba(232,236,240,0.5)', '#E8ECF0']}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
};
