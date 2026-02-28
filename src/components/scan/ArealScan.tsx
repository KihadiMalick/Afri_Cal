"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle, X, RotateCcw, Zap, Sun } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN — v4  "The Swirl"
   DeviceMotion gyroscope swirl · LiDAR wireframe mesh
   ══════════════════════════════════════════════════════════ */

export interface ArealScanProps {
  onScanComplete: (frames: string[], coveragePct: number) => void;
  onCancel: () => void;
  locale: "fr" | "en";
}

/* ── Swirl accumulation constants ── */
const TARGET_DEGREES = 1440;   // ~20s of active arm-swirling
const COMPLETE_AT    = 65;     // % to fire onScanComplete
const MIN_RATE       = 8;      // °/s noise floor (ignore trembling)
const MILESTONES     = [6, 15, 24, 33, 42, 51, 60, 69, 80, 92]; // capture %, 10 frames

/* ── Wireframe mesh sampling resolution ── */
const MESH_W = 22;
const MESH_H = 16;
const MESH_SAMPLE_EVERY = 5;   // frames between brightness resample

/* ── Low-light ── */
const DARK_THRESHOLD = 0.12;

/* ── Animations ── */
const SCAN_STYLES = `
  @keyframes spinCcw  { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
  @keyframes darkIn   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes glowPulse{ 0%,100%{opacity:.75} 50%{opacity:1} }
`;

/* ═══════════════════════════════════════════════════════ */
export default function ArealScan({ onScanComplete, onCancel, locale }: ArealScanProps) {
  /* Refs */
  const videoRef       = useRef<HTMLVideoElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const offscreenRef   = useRef<HTMLCanvasElement | null>(null);
  const captureCanvas  = useRef<HTMLCanvasElement | null>(null);
  const rafRef         = useRef<number>(0);
  const frameTickRef   = useRef<number>(0);
  const meshBright     = useRef<Float32Array>(new Float32Array(MESH_W * MESH_H).fill(0.35));
  const totalDegRef    = useRef<number>(0);
  const capturedAt     = useRef<Set<number>>(new Set());
  const capturedFrames = useRef<string[]>([]);
  const streamRef      = useRef<MediaStream | null>(null);
  const lastEventMs    = useRef<number>(0);

  /* State */
  const [uiPhase,    setUiPhase]    = useState<"intro" | "scanning" | "done">("intro");
  const [coverage,   setCoverage]   = useState(0);
  const [isDark,     setIsDark]     = useState(false);
  const [torchOn,    setTorchOn]    = useState(false);
  const [torchAvail, setTorchAvail] = useState(false);

  /* ── Toggle flashlight ── */
  const toggleTorch = useCallback(async () => {
    const track = (videoRef.current?.srcObject as MediaStream | null)?.getVideoTracks()[0];
    if (!track) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn(t => !t);
    } catch { /* not supported */ }
  }, [torchOn]);

  /* ── Capture one JPEG frame ── */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    if (!captureCanvas.current) captureCanvas.current = document.createElement("canvas");
    const cc = captureCanvas.current;
    cc.width  = Math.min(video.videoWidth, 640);
    cc.height = Math.min(video.videoHeight, 480);
    const ctx = cc.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, cc.width, cc.height);
    capturedFrames.current.push(cc.toDataURL("image/jpeg", 0.72));
  }, []);

  /* ── DeviceMotion: accumulate angular displacement ── */
  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const rate = e.rotationRate;
    if (!rate) return;
    const now    = performance.now();
    const dtSec  = lastEventMs.current ? Math.min((now - lastEventMs.current) / 1000, 0.1) : 0.016;
    lastEventMs.current = now;

    /* Sum each axis contribution above the noise floor */
    const contribution =
      Math.max(0, Math.abs(rate.alpha ?? 0) - MIN_RATE) * dtSec +
      Math.max(0, Math.abs(rate.beta  ?? 0) - MIN_RATE) * dtSec +
      Math.max(0, Math.abs(rate.gamma ?? 0) - MIN_RATE) * dtSec;

    totalDegRef.current += contribution;
    const pct = Math.min(100, Math.round((totalDegRef.current / TARGET_DEGREES) * 100));
    setCoverage(pct);

    for (const m of MILESTONES) {
      if (pct >= m && !capturedAt.current.has(m)) {
        capturedAt.current.add(m);
        captureFrame();
      }
    }

    if (pct >= COMPLETE_AT) {
      setUiPhase("done");
      onScanComplete(capturedFrames.current, pct);
    }
  }, [captureFrame, onScanComplete]);

  /* ── Desktop fallback: auto-simulate swirl ── */
  const startFallback = useCallback(() => {
    const iv = setInterval(() => {
      totalDegRef.current += 28; // ~28°/tick at 50ms = 560°/s → reaches 1440° in ~2.5s
      const pct = Math.min(100, Math.round((totalDegRef.current / TARGET_DEGREES) * 100));
      setCoverage(pct);
      for (const m of MILESTONES) {
        if (pct >= m && !capturedAt.current.has(m)) {
          capturedAt.current.add(m);
          captureFrame();
        }
      }
      if (pct >= COMPLETE_AT) {
        clearInterval(iv);
        setUiPhase("done");
        onScanComplete(capturedFrames.current, pct);
      }
    }, 50);
    return iv;
  }, [captureFrame, onScanComplete]);

  /* ── Request DeviceMotion permission ── */
  const startMotion = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DME = DeviceMotionEvent as any;
    if (typeof DME?.requestPermission === "function") {
      try {
        const r = await DME.requestPermission();
        if (r !== "granted") { startFallback(); return; }
      } catch { startFallback(); return; }
    }
    if ("DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", handleMotion, true);
    } else {
      startFallback();
    }
  }, [handleMotion, startFallback]);

  /* ── Start rear camera ── */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((track as any).getCapabilities?.().torch) setTorchAvail(true);
      } catch { /* ignore */ }
    } catch { /* desktop */ }
  }, []);

  /* ── Canvas: LiDAR wireframe mesh ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(animate); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(animate); return; }

    const W = canvas.width, H = canvas.height;
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, W, H);
    frameTickRef.current++;

    /* ── 1. Resample video brightness every N frames ── */
    if (frameTickRef.current % MESH_SAMPLE_EVERY === 0) {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        if (!offscreenRef.current) {
          offscreenRef.current = document.createElement("canvas");
          offscreenRef.current.width  = MESH_W;
          offscreenRef.current.height = MESH_H;
        }
        const oCtx = offscreenRef.current.getContext("2d");
        if (oCtx) {
          oCtx.drawImage(video, 0, 0, MESH_W, MESH_H);
          const { data } = oCtx.getImageData(0, 0, MESH_W, MESH_H);
          let sum = 0;
          for (let i = 0; i < MESH_W * MESH_H; i++) {
            const b = (data[i*4] * 0.299 + data[i*4+1] * 0.587 + data[i*4+2] * 0.114) / 255;
            meshBright.current[i] = b;
            sum += b;
          }
          const avg = sum / (MESH_W * MESH_H);
          setIsDark(avg < DARK_THRESHOLD);
        }
      }
    }

    const cellW = W / MESH_W;
    const cellH = H / MESH_H;
    const MAX_DEFORM = cellH * 1.6;

    /* Vertex position: brightness pushes surface UP (food) or DOWN (plate edge) */
    const vx = (col: number, row: number) => {
      const c = Math.min(col, MESH_W - 1), r = Math.min(row, MESH_H - 1);
      const b = meshBright.current[r * MESH_W + c] ?? 0.35;
      /* Subtle horizontal drift based on local brightness gradient */
      const bLeft  = meshBright.current[r * MESH_W + Math.max(c-1, 0)] ?? b;
      const bRight = meshBright.current[r * MESH_W + Math.min(c+1, MESH_W-1)] ?? b;
      return {
        x: col * cellW + (bRight - bLeft) * cellW * 0.2,
        y: row * cellH + (0.5 - b) * (-MAX_DEFORM),
      };
    };

    /* ── 2. Draw wireframe horizontal lines ── */
    for (let row = 0; row <= MESH_H; row++) {
      ctx.beginPath();
      for (let col = 0; col <= MESH_W; col++) {
        const r = Math.min(row, MESH_H - 1);
        const c = Math.min(col, MESH_W - 1);
        const b = meshBright.current[r * MESH_W + c] ?? 0.35;
        const alpha = 0.04 + b * 0.28;
        const pulse = Math.sin(t * 1.5 + row * 0.4) * 0.04;
        ctx.strokeStyle = `rgba(0,255,157,${Math.min(0.9, alpha + pulse).toFixed(3)})`;
        ctx.lineWidth = 0.5 + b * 0.7;
        const { x, y } = vx(col, row);
        if (col === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    /* ── 3. Draw wireframe vertical lines ── */
    for (let col = 0; col <= MESH_W; col++) {
      ctx.beginPath();
      for (let row = 0; row <= MESH_H; row++) {
        const r = Math.min(row, MESH_H - 1);
        const c = Math.min(col, MESH_W - 1);
        const b = meshBright.current[r * MESH_W + c] ?? 0.35;
        const alpha = 0.04 + b * 0.22;
        ctx.strokeStyle = `rgba(0,255,157,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.4 + b * 0.5;
        const { x, y } = vx(col, row);
        if (row === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    /* ── 4. Oscillating scan beam (horizontal) ── */
    const sweepY = (Math.sin(t * 0.65) * 0.42 + 0.5) * H;
    const lineG  = ctx.createLinearGradient(0, sweepY - 5, 0, sweepY + 5);
    lineG.addColorStop(0,   "rgba(0,255,157,0)");
    lineG.addColorStop(0.5, "rgba(0,255,157,0.48)");
    lineG.addColorStop(1,   "rgba(0,255,157,0)");
    ctx.fillStyle = lineG;
    ctx.fillRect(0, sweepY - 5, W, 10);

    /* ── 5. Corner brackets ── */
    const fx = W * 0.05, fy = H * 0.07, fw = W * 0.90, fh = H * 0.86;
    const bLen = Math.min(W, H) * 0.055;
    ctx.strokeStyle = "rgba(0,255,157,0.85)";
    ctx.lineWidth   = 2.2;
    ctx.shadowColor = "#00ff9d";
    ctx.shadowBlur  = 9;
    ([ [fx,      fy,       1,  1],
       [fx + fw, fy,      -1,  1],
       [fx,      fy + fh,  1, -1],
       [fx + fw, fy + fh, -1, -1] ] as [number,number,number,number][])
      .forEach(([x, y, sx, sy]) => {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * bLen, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * bLen); ctx.stroke();
      });
    ctx.shadowBlur = 0;

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ── Resize canvas ── */
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (c) { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("devicemotion", handleMotion, true);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [handleMotion]);

  const handleStart = useCallback(async () => {
    setUiPhase("scanning");
    await startCamera();
    await startMotion();
  }, [startCamera, startMotion]);

  /* ── Progress arc ── */
  const ARC_R = 26, CX = 34, CY = 34;
  const circ  = 2 * Math.PI * ARC_R;
  const dashOff = circ * (1 - Math.min(coverage / COMPLETE_AT, 1));

  /* ═══ RENDER ═══ */
  return (
    <div style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}>
      <style>{SCAN_STYLES}</style>

      <button
        onClick={onCancel}
        className="absolute top-2 right-2 z-30 p-2 rounded-full"
        style={{ background: "rgba(0,0,0,.55)", color: "rgba(255,255,255,.65)" }}
      >
        <X size={17} strokeWidth={2} />
      </button>

      {/* ══ INTRO ══ */}
      {uiPhase === "intro" && (
        <div
          className="relative flex flex-col items-center gap-6 rounded-[2rem] overflow-hidden py-10 px-5 text-center"
          style={{ background: "rgba(2,12,7,0.95)", border: "1px solid rgba(0,255,157,.15)", minHeight: "26rem" }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }} />
          <div className="relative z-10 flex flex-col items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,255,157,.08)", border: "1px solid rgba(0,255,157,.28)", boxShadow: "0 0 32px rgba(0,255,157,.18)" }}
            >
              <RotateCcw
                size={38} strokeWidth={1.4}
                style={{ color: "#00ff9d", animation: "spinCcw 3s linear infinite" }}
              />
            </div>

            <div>
              <p className="font-black text-2xl tracking-[.18em] leading-none mb-0.5" style={{ fontFamily: "'Courier New',monospace" }}>
                <span style={{ color: "#8b949e" }}>LI</span>
                <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d" }}>X</span>
                <span style={{ color: "#8b949e" }}>UM</span>
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[.28em]" style={{ color: "rgba(0,255,157,.55)" }}>
                Areal Scan 3D
              </p>
            </div>

            <p className="text-white/60 text-sm font-medium max-w-xs leading-relaxed">
              {locale === "fr"
                ? "Tenez le téléphone au-dessus du plat et faites tourner votre bras en cercle — comme pour verser une sauce."
                : "Hold the phone above the dish and swirl your arm in a circle — like pouring a sauce."}
            </p>

            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: "rgba(0,255,157,.07)", border: "1px solid rgba(0,255,157,.15)" }}
            >
              <RotateCcw size={15} strokeWidth={2.5} style={{ color: "#00ff9d" }} />
              <p className="text-xs font-semibold text-white/70">
                {locale === "fr"
                  ? "Mouvement circulaire du bras · 10–20 secondes"
                  : "Circular arm movement · 10–20 seconds"}
              </p>
            </div>

            <button
              onClick={handleStart}
              className="mt-1 px-10 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase text-black transition-all hover:brightness-110 active:scale-[.97]"
              style={{ background: "#00ff9d", boxShadow: "0 0 28px rgba(0,255,157,.5), 0 4px 16px rgba(0,0,0,.3)" }}
            >
              {locale === "fr" ? "Démarrer le scan" : "Start Scan"}
            </button>
          </div>
        </div>
      )}

      {/* ══ SCANNING ══ */}
      {uiPhase === "scanning" && (
        <div className="flex flex-col gap-3">
          {/* Video + LiDAR wireframe overlay */}
          <div
            className="relative w-full rounded-[1.75rem] overflow-hidden"
            style={{ aspectRatio: "4/3", background: "#000" }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline muted autoPlay
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ mixBlendMode: "screen" }}
            />

            {/* Low-light warning */}
            {isDark && (
              <div
                className="absolute top-2 inset-x-2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "rgba(0,0,0,.72)", border: "1px solid rgba(250,204,21,.35)", animation: "darkIn .3s ease-out" }}
              >
                <Sun size={14} style={{ color: "#fbbf24", flexShrink: 0 }} />
                <p className="text-xs font-semibold text-yellow-300/90 leading-snug flex-1">
                  {locale === "fr"
                    ? "Trop sombre — allumez le flash ou déplacez-vous"
                    : "Too dark — turn on flash or move to better light"}
                </p>
                {torchAvail && (
                  <button
                    onClick={toggleTorch}
                    className="flex-shrink-0 px-2 py-1 rounded-lg"
                    style={{ background: torchOn ? "#fbbf24" : "rgba(251,191,36,.2)", color: torchOn ? "#000" : "#fbbf24" }}
                  >
                    <Zap size={12} />
                  </button>
                )}
              </div>
            )}

            {/* Progress arc gauge (top-right) */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx={CX} cy={CY} r={ARC_R + 5} fill="rgba(0,0,0,.52)" />
                <circle
                  cx={CX} cy={CY} r={ARC_R}
                  fill="none" stroke="rgba(0,255,157,.14)" strokeWidth="4"
                />
                <circle
                  cx={CX} cy={CY} r={ARC_R}
                  fill="none" stroke="#00ff9d" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOff}
                  transform={`rotate(-90 ${CX} ${CY})`}
                  style={{
                    transition: "stroke-dashoffset .3s ease",
                    filter: "drop-shadow(0 0 4px rgba(0,255,157,.85))",
                  }}
                />
                <text
                  x={CX} y={CY}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#00ff9d" fontSize="11" fontWeight="900"
                  fontFamily="'Courier New',monospace"
                  style={{ filter: "drop-shadow(0 0 3px rgba(0,255,157,.7))" }}
                >
                  {Math.min(coverage, COMPLETE_AT - 1 === coverage ? COMPLETE_AT : coverage)}%
                </text>
              </svg>
            </div>

            {/* Flash toggle */}
            {torchAvail && !isDark && (
              <button
                onClick={toggleTorch}
                className="absolute bottom-2.5 right-2.5 z-20 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: torchOn ? "rgba(251,191,36,.25)" : "rgba(0,0,0,.55)",
                  border: `1px solid ${torchOn ? "rgba(251,191,36,.5)" : "rgba(255,255,255,.12)"}`,
                }}
              >
                <Zap size={16} style={{ color: torchOn ? "#fbbf24" : "rgba(255,255,255,.6)" }} />
              </button>
            )}

            {/* Swirl instruction bottom */}
            <div className="absolute bottom-2.5 inset-x-0 flex justify-center z-20">
              <div
                className="px-3 py-1.5 rounded-full flex items-center gap-2"
                style={{ background: "rgba(0,0,0,.65)", border: "1px solid rgba(0,255,157,.30)" }}
              >
                <RotateCcw
                  size={14} strokeWidth={2.5}
                  style={{ color: "#00ff9d", filter: "drop-shadow(0 0 6px rgba(0,255,157,.9))", animation: "spinCcw 1.6s linear infinite" }}
                />
                <p className="text-[11px] font-bold text-white/85">
                  {locale === "fr" ? "Tournez votre bras au-dessus du plat" : "Swirl your arm above the dish"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                {locale === "fr" ? "Couverture spatiale" : "Spatial coverage"}
              </p>
              <p className="text-xs font-black" style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}>
                {coverage}% / {COMPLETE_AT}%
              </p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (coverage / COMPLETE_AT) * 100)}%`,
                  background: "linear-gradient(90deg,#059669,#00ff9d)",
                  boxShadow: "0 0 8px rgba(0,255,157,.55)",
                  transition: "width .25s ease",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ══ DONE ══ */}
      {uiPhase === "done" && (
        <div
          className="flex flex-col items-center gap-5 py-10 px-5 rounded-[2rem] text-center"
          style={{ background: "rgba(2,12,7,0.92)", border: "1px solid rgba(0,255,157,.22)" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,255,157,.12)", boxShadow: "0 0 36px rgba(0,255,157,.3)" }}
          >
            <CheckCircle size={42} strokeWidth={1.5} style={{ color: "#00ff9d" }} />
          </div>
          <div>
            <p className="text-xl font-black text-white mb-1">
              {locale === "fr" ? "Scan 3D terminé !" : "3D Scan complete!"}
            </p>
            <p className="text-sm text-white/50 font-medium">
              {locale === "fr"
                ? `${capturedFrames.current.length} clichés capturés`
                : `${capturedFrames.current.length} frames captured`}
            </p>
          </div>
          <div
            className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            style={{ background: "rgba(0,255,157,.10)", border: "1px solid rgba(0,255,157,.22)", color: "#00ff9d" }}
          >
            {locale === "fr" ? "Analyse LIXUM en cours…" : "LIXUM analysis in progress…"}
          </div>
        </div>
      )}
    </div>
  );
}
