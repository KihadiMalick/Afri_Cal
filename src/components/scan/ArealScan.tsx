"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CheckCircle, X,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Scan,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN — v2
   Professional guided 4-phase spatial scanner
   ══════════════════════════════════════════════════════════ */

export interface ArealScanProps {
  onScanComplete: (frames: string[], coveragePct: number) => void;
  onCancel: () => void;
  locale: "fr" | "en";
}

/* ── Spherical coverage grid ── */
const AZ_SECTORS   = 24;
const EL_SECTORS   = 12;
const TOTAL_CELLS  = AZ_SECTORS * EL_SECTORS;
const TARGET_PCT   = 0.65;   // 65% → scan complete

/* ── Frame capture milestones (% coverage) ── */
const MILESTONES = [6, 20, 32, 44, 56, 68, 80, 92, 98];

/* ── 4 guided phases ── */
const PHASES = [
  {
    id: 1, from: 0,  to: 25,
    arrow: "down"  as const,
    labelFr: "Phase 1 · Face avant",    labelEn: "Phase 1 · Front",
    hintFr:  "Tenez le téléphone face au plat, légèrement au-dessus",
    hintEn:  "Hold your phone in front of the dish, slightly above",
  },
  {
    id: 2, from: 25, to: 50,
    arrow: "up"    as const,
    labelFr: "Phase 2 · Face arrière",  labelEn: "Phase 2 · Behind",
    hintFr:  "Déplacez-vous doucement derrière le plat",
    hintEn:  "Slowly move to the back of the dish",
  },
  {
    id: 3, from: 50, to: 75,
    arrow: "right" as const,
    labelFr: "Phase 3 · Côté droit",    labelEn: "Phase 3 · Right side",
    hintFr:  "Passez maintenant sur le côté droit du plat",
    hintEn:  "Now move to the right side of the dish",
  },
  {
    id: 4, from: 75, to: 100,
    arrow: "left"  as const,
    labelFr: "Phase 4 · Côté gauche",   labelEn: "Phase 4 · Left side",
    hintFr:  "Terminez par le côté gauche — presque fini !",
    hintEn:  "Finish on the left side — almost done!",
  },
] as const;

const ARROW_MAP = {
  down:  ArrowDown,
  up:    ArrowUp,
  right: ArrowRight,
  left:  ArrowLeft,
} as const;

/* ── Inline keyframes ── */
const SCAN_STYLES = `
  @keyframes arrowBounce {
    0%,100% { transform: translateY(0);    opacity:1;   }
    50%      { transform: translateY(6px);  opacity:.65; }
  }
  @keyframes arrowBounceUp {
    0%,100% { transform: translateY(0);    opacity:1;   }
    50%      { transform: translateY(-6px); opacity:.65; }
  }
  @keyframes arrowBounceRight {
    0%,100% { transform: translateX(0);   opacity:1;   }
    50%      { transform: translateX(6px); opacity:.65; }
  }
  @keyframes arrowBounceLeft {
    0%,100% { transform: translateX(0);    opacity:1;   }
    50%      { transform: translateX(-6px); opacity:.65; }
  }
  @keyframes phaseFlash {
    0%   { opacity:0; }
    30%  { opacity:1; }
    100% { opacity:1; }
  }
`;

const ARROW_ANIM = {
  down:  "arrowBounce .9s ease-in-out infinite",
  up:    "arrowBounceUp .9s ease-in-out infinite",
  right: "arrowBounceRight .9s ease-in-out infinite",
  left:  "arrowBounceLeft .9s ease-in-out infinite",
} as const;

/* ═══════════════════════════════════════════════════════ */
export default function ArealScan({ onScanComplete, onCancel, locale }: ArealScanProps) {
  /* Refs */
  const videoRef       = useRef<HTMLVideoElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const offscreenRef   = useRef<HTMLCanvasElement | null>(null);
  const captureCanvas  = useRef<HTMLCanvasElement | null>(null);
  const rafRef         = useRef<number>(0);
  const frameTickRef   = useRef<number>(0);
  const brightnessRef  = useRef<number[]>([]);
  const coveredCells   = useRef<Set<number>>(new Set());
  const capturedAt     = useRef<Set<number>>(new Set());
  const capturedFrames = useRef<string[]>([]);
  const streamRef      = useRef<MediaStream | null>(null);

  /* State */
  const [uiPhase,       setUiPhase]       = useState<"intro" | "scanning" | "done">("intro");
  const [coverage,      setCoverage]      = useState(0);
  const [scanPhaseIdx,  setScanPhaseIdx]  = useState(0);
  const [phaseFlashing, setPhaseFlashing] = useState(false);
  const [orientOk,      setOrientOk]      = useState<boolean | null>(null);
  const [permDenied,    setPermDenied]    = useState(false);

  /* ── Capture one JPEG frame ── */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    if (!captureCanvas.current) captureCanvas.current = document.createElement("canvas");
    const cc  = captureCanvas.current;
    cc.width  = Math.min(video.videoWidth,  640);
    cc.height = Math.min(video.videoHeight, 480);
    const ctx = cc.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, cc.width, cc.height);
    capturedFrames.current.push(cc.toDataURL("image/jpeg", 0.72));
  }, []);

  /* ── Device orientation → coverage ── */
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const alpha = e.alpha ?? 0;
    const beta  = e.beta  ?? 0;
    void e.gamma;

    const az     = Math.floor(((alpha % 360) + 360) % 360 / 360 * AZ_SECTORS);
    const el     = Math.floor(Math.min(Math.max((beta + 90) / 180, 0), 0.999) * EL_SECTORS);
    const cellId = az * EL_SECTORS + el;

    if (!coveredCells.current.has(cellId)) {
      coveredCells.current.add(cellId);
      const pct = Math.round((coveredCells.current.size / TOTAL_CELLS) * 100);
      setCoverage(pct);

      /* Capture milestones */
      for (const m of MILESTONES) {
        if (pct >= m && !capturedAt.current.has(m)) {
          capturedAt.current.add(m);
          captureFrame();
        }
      }

      /* Phase transitions */
      const newIdx = pct < 25 ? 0 : pct < 50 ? 1 : pct < 75 ? 2 : 3;
      setScanPhaseIdx(prev => {
        if (newIdx !== prev) {
          setPhaseFlashing(true);
          setTimeout(() => setPhaseFlashing(false), 700);
          return newIdx;
        }
        return prev;
      });

      /* Completion */
      if (pct / 100 >= TARGET_PCT) {
        setUiPhase("done");
        onScanComplete(capturedFrames.current, pct);
      }
    }
  }, [captureFrame, onScanComplete]);

  /* ── Desktop fallback (auto-simulate rotation) ── */
  const startDesktopFallback = useCallback(() => {
    setOrientOk(false);
    let az = 0, el = 0;
    const iv = setInterval(() => {
      az = (az + 15) % 360;
      if (az === 0) el = (el + 30) % 180;
      handleOrientation({ alpha: az, beta: el - 90, gamma: 0 } as DeviceOrientationEvent);
    }, 130);
    return () => clearInterval(iv);
  }, [handleOrientation]);

  /* ── Request permission + start orientation ── */
  const startOrientation = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE?.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission();
        if (res !== "granted") { setPermDenied(true); return; }
      } catch { setPermDenied(true); return; }
    }
    const supported = "DeviceOrientationEvent" in window;
    setOrientOk(supported);
    if (supported) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    } else {
      startDesktopFallback();
    }
  }, [handleOrientation, startDesktopFallback]);

  /* ── Start camera (rear, no mirror) ── */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch { /* no camera on desktop – silently ignore */ }
  }, []);

  /* ── Canvas: professional structured-light overlay ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(animate); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(animate); return; }

    const W = canvas.width;
    const H = canvas.height;
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, W, H);

    /* ── A. Sample video brightness every 5 frames (low cost) ── */
    frameTickRef.current++;
    const COLS = 10, ROWS = 7;
    if (frameTickRef.current % 5 === 0 && video && video.readyState >= 2) {
      if (!offscreenRef.current) {
        offscreenRef.current = document.createElement("canvas");
        offscreenRef.current.width  = COLS;
        offscreenRef.current.height = ROWS;
      }
      const oCtx = offscreenRef.current.getContext("2d");
      if (oCtx) {
        oCtx.drawImage(video, 0, 0, COLS, ROWS);
        const px = oCtx.getImageData(0, 0, COLS, ROWS).data;
        brightnessRef.current = Array.from({ length: COLS * ROWS }, (_, i) =>
          (px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114) / 255
        );
      }
    }

    /* ── B. Structured-light dot grid (reacts to video content) ── */
    const cellW = W / COLS, cellH = H / ROWS;
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        const b     = brightnessRef.current[row * COLS + col] ?? 0.35;
        const pulse = Math.sin(t * 2.0 + col * 0.6 + row * 0.8) * 0.12 + 0.88;
        const r     = (b * 2.2 + 0.6) * pulse;
        const alpha = (b * 0.5 + 0.06).toFixed(3);
        const px    = (col + 0.5) * cellW;
        const py    = (row + 0.5) * cellH;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,157,${alpha})`;
        ctx.fill();
      }
    }

    /* ── C. Smooth oscillating scan line ── */
    const sweepY  = (Math.sin(t * 0.65) * 0.42 + 0.5) * H;
    const lineGrad = ctx.createLinearGradient(0, sweepY - 5, 0, sweepY + 5);
    lineGrad.addColorStop(0,   "rgba(0,255,157,0)");
    lineGrad.addColorStop(0.5, "rgba(0,255,157,0.60)");
    lineGrad.addColorStop(1,   "rgba(0,255,157,0)");
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, sweepY - 5, W, 10);

    /* ── D. Dashed focus rectangle (central 80% of frame) ── */
    const fx = W * 0.06, fy = H * 0.08;
    const fw = W * 0.88, fh = H * 0.84;
    const dashAlpha = (Math.sin(t * 0.5) * 0.08 + 0.20).toFixed(3);
    ctx.strokeStyle  = `rgba(0,255,157,${dashAlpha})`;
    ctx.lineWidth    = 1;
    ctx.setLineDash([8, 7]);
    ctx.strokeRect(fx, fy, fw, fh);
    ctx.setLineDash([]);

    /* ── E. Corner brackets on focus rect (solid, glowing) ── */
    const bLen = Math.min(W, H) * 0.055;
    ctx.strokeStyle = "rgba(0,255,157,0.85)";
    ctx.lineWidth   = 2.2;
    ctx.shadowColor = "#00ff9d";
    ctx.shadowBlur  = 10;
    ([ [fx,      fy,       1,  1],
       [fx + fw, fy,      -1,  1],
       [fx,      fy + fh,  1, -1],
       [fx + fw, fy + fh, -1, -1] ] as [number,number,number,number][])
      .forEach(([x, y, sx, sy]) => {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * bLen, y);          ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * bLen);          ctx.stroke();
      });
    ctx.shadowBlur = 0;

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  /* ── Resize canvas to match video container ── */
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (c) { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ── Start/stop animation loop ── */
  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("deviceorientation", handleOrientation, true);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [handleOrientation]);

  /* ── Start button ── */
  const handleStart = useCallback(async () => {
    setUiPhase("scanning");
    await startCamera();
    await startOrientation();
  }, [startCamera, startOrientation]);

  /* ── Derived phase values ── */
  const phase      = PHASES[scanPhaseIdx];
  const ArrowIcon  = ARROW_MAP[phase.arrow];
  const phaseInner = Math.max(0, Math.min(100,
    Math.round((coverage - phase.from) / (phase.to - phase.from) * 100)
  ));

  /* ── Circular gauge dims ── */
  const GR = 28, GCX = 34, GCY = 34;
  const circ  = 2 * Math.PI * GR;
  const dashOffset = circ * (1 - coverage / 100);

  /* ════════════════ RENDER ════════════════ */
  return (
    <div style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}>
      <style>{SCAN_STYLES}</style>

      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 z-30 p-2 rounded-full"
        style={{ background: "rgba(0,0,0,.55)", color: "rgba(255,255,255,.65)" }}
        aria-label="Fermer"
      >
        <X size={17} strokeWidth={2} />
      </button>

      {/* ══ INTRO ══ */}
      {uiPhase === "intro" && (
        <div
          className="relative flex flex-col items-center gap-6 rounded-[2rem] overflow-hidden py-10 px-5 text-center"
          style={{ background: "rgba(2,12,7,0.95)", border: "1px solid rgba(0,255,157,.15)", minHeight: "26rem" }}
        >
          {/* Background canvas (mesh preview) */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }} />

          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,255,157,.08)", border: "1px solid rgba(0,255,157,.28)", boxShadow: "0 0 32px rgba(0,255,157,.18)" }}
            >
              <Scan size={36} strokeWidth={1.3} style={{ color: "#00ff9d" }} />
            </div>

            {/* Logo */}
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
                ? "Scannez votre plat en 4 mouvements guidés, comme Face ID. L'IA reconstruit le volume en 3D."
                : "Scan your dish in 4 guided movements, like Face ID. AI rebuilds the 3D volume."}
            </p>

            {/* 4 phases preview */}
            <div className="flex gap-2 w-full max-w-xs">
              {PHASES.map((p) => {
                const Icon = ARROW_MAP[p.arrow];
                return (
                  <div
                    key={p.id}
                    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl"
                    style={{ background: "rgba(0,255,157,.06)", border: "1px solid rgba(0,255,157,.12)" }}
                  >
                    <Icon size={16} strokeWidth={2} style={{ color: "#00ff9d" }} />
                    <p className="text-[9px] font-bold text-white/50 uppercase tracking-wide leading-tight text-center">
                      {p.id}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Start */}
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

          {/* Video + professional overlay */}
          <div
            className="relative w-full rounded-[1.75rem] overflow-hidden"
            style={{ aspectRatio: "4/3", background: "#000" }}
          >
            {/* ── Live camera (no mirror) ── */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline muted autoPlay
            />

            {/* ── Structured-light canvas overlay ── */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ mixBlendMode: "screen" }}
            />

            {/* ── Circular coverage gauge (top-right) ── */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx={GCX} cy={GCY} r={GR}
                  fill="rgba(0,0,0,.52)"
                  stroke="rgba(0,255,157,.14)" strokeWidth="3.5" />
                <circle cx={GCX} cy={GCY} r={GR}
                  fill="none" stroke="#00ff9d" strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${GCX} ${GCY})`}
                  style={{ transition: "stroke-dashoffset .35s ease", filter: "drop-shadow(0 0 4px rgba(0,255,157,.85))" }}
                />
                <text x={GCX} y={GCY} textAnchor="middle" dominantBaseline="middle"
                  fill="#00ff9d" fontSize="12" fontWeight="900"
                  fontFamily="'Courier New',monospace"
                  style={{ filter: "drop-shadow(0 0 3px rgba(0,255,157,.7))" }}
                >
                  {coverage}%
                </text>
              </svg>
            </div>

            {/* ── Directional arrow (center-bottom of video) ── */}
            <div
              className="absolute bottom-3 inset-x-0 flex flex-col items-center gap-1 z-20"
              style={{ animation: phaseFlashing ? "phaseFlash .7s ease-out" : undefined }}
            >
              {/* Phase label badge */}
              <div
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ background: "rgba(0,0,0,.60)", border: "1px solid rgba(0,255,157,.35)", color: "#00ff9d" }}
              >
                {locale === "fr" ? phase.labelFr : phase.labelEn}
              </div>
              {/* Animated arrow */}
              <ArrowIcon
                size={32}
                strokeWidth={2.5}
                style={{
                  color: "#00ff9d",
                  filter: "drop-shadow(0 0 10px rgba(0,255,157,.9))",
                  animation: ARROW_ANIM[phase.arrow],
                }}
              />
            </div>
          </div>

          {/* ── Phase instruction card ── */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "rgba(0,255,157,.06)",
              border: "1px solid rgba(0,255,157,.15)",
              animation: phaseFlashing ? "phaseFlash .6s ease-out" : undefined,
            }}
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,255,157,.12)", border: "1px solid rgba(0,255,157,.25)" }}
            >
              <ArrowIcon size={16} strokeWidth={2.5} style={{ color: "#00ff9d" }} />
            </div>
            <p className="text-sm font-semibold text-white/80 leading-snug">
              {locale === "fr" ? phase.hintFr : phase.hintEn}
            </p>
          </div>

          {/* ── 4-phase segmented progress ── */}
          <div className="flex gap-1.5">
            {PHASES.map((p, i) => {
              const isActive   = i === scanPhaseIdx;
              const isDone     = i < scanPhaseIdx;
              const segFill    = isDone ? 100 : isActive ? phaseInner : 0;
              const SegIcon    = ARROW_MAP[p.arrow];
              return (
                <div key={p.id} className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between px-0.5">
                    <SegIcon
                      size={11}
                      strokeWidth={2.5}
                      style={{ color: isDone ? "#00ff9d" : isActive ? "#00ff9d" : "rgba(255,255,255,.25)" }}
                    />
                    <span
                      className="text-[9px] font-black"
                      style={{ color: isActive ? "#00ff9d" : "rgba(255,255,255,.25)", fontFamily: "'Courier New',monospace" }}
                    >
                      {isDone ? "✓" : isActive ? `${phaseInner}%` : ""}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-400"
                      style={{
                        width: `${segFill}%`,
                        background: isDone
                          ? "#00ff9d"
                          : "linear-gradient(90deg,#059669,#00ff9d)",
                        boxShadow: (isDone || isActive) ? "0 0 6px rgba(0,255,157,.55)" : "none",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sensor info */}
          {orientOk === false && (
            <p className="text-[10px] text-white/30 text-center font-medium">
              {locale === "fr" ? "Capteurs non détectés — simulation active" : "Sensors not detected — simulation active"}
            </p>
          )}
          {permDenied && (
            <p className="text-[10px] text-red-400/70 text-center font-medium">
              {locale === "fr" ? "Permission refusée — simulation manuelle active" : "Permission denied — manual simulation active"}
            </p>
          )}
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
              {locale === "fr" ? `Couverture : ${coverage}%` : `Coverage: ${coverage}%`}
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
