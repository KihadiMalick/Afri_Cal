"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle, X, Scan, RotateCcw, Zap, Sun } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN — v3
   Circular rotation scan · Sobel edge detection · Low-light guard
   ══════════════════════════════════════════════════════════ */

export interface ArealScanProps {
  onScanComplete: (frames: string[], coveragePct: number) => void;
  onCancel: () => void;
  locale: "fr" | "en";
}

/* ── Azimuth sectors (one full circle = 36 sectors of 10°) ── */
const AZ_SECTORS     = 36;
const COMPLETE_AT    = 65;   // % to trigger scan done
const MILESTONES     = [8, 18, 28, 38, 48, 58, COMPLETE_AT]; // capture triggers

/* ── Edge detection offscreen resolution ── */
const EDGE_W          = 80;
const EDGE_H          = 60;
const EDGE_THRESHOLD  = 0.22;
const EDGE_EVERY      = 8;   // frames between Sobel runs

/* ── Low-light threshold (avg luma 0-1) ── */
const DARK_THRESHOLD  = 0.12;

/* ── Inline keyframes ── */
const SCAN_STYLES = `
  @keyframes rotateSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulseGlow {
    0%,100% { opacity:.7; }
    50%      { opacity:1; }
  }
  @keyframes darkWarning {
    0%   { opacity:0; transform:translateY(-6px); }
    100% { opacity:1; transform:translateY(0); }
  }
`;

/* ══════════════════════════════════════════════════════════ */
export default function ArealScan({ onScanComplete, onCancel, locale }: ArealScanProps) {
  /* Refs */
  const videoRef        = useRef<HTMLVideoElement>(null);
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const offscreenRef    = useRef<HTMLCanvasElement | null>(null);
  const captureCanvas   = useRef<HTMLCanvasElement | null>(null);
  const rafRef          = useRef<number>(0);
  const frameTickRef    = useRef<number>(0);
  const edgeMagRef      = useRef<Float32Array | null>(null);
  const avgBrightRef    = useRef<number>(0.5);
  const coveredCells    = useRef<Set<number>>(new Set());
  const capturedAt      = useRef<Set<number>>(new Set());
  const capturedFrames  = useRef<string[]>([]);
  const streamRef       = useRef<MediaStream | null>(null);
  const orientSupported = useRef<boolean | null>(null);

  /* State */
  const [uiPhase,       setUiPhase]       = useState<"intro" | "scanning" | "done">("intro");
  const [coverage,      setCoverage]      = useState(0);
  const [visitedSet,    setVisitedSet]    = useState<Set<number>>(new Set());
  const [isDark,        setIsDark]        = useState(false);
  const [torchOn,       setTorchOn]       = useState(false);
  const [torchAvail,    setTorchAvail]    = useState(false);

  /* ── Toggle flashlight ── */
  const toggleTorch = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.srcObject) return;
    const track = (video.srcObject as MediaStream).getVideoTracks()[0];
    if (!track) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn(t => !t);
    } catch { /* torch not supported */ }
  }, [torchOn]);

  /* ── Capture one JPEG frame ── */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    if (!captureCanvas.current) captureCanvas.current = document.createElement("canvas");
    const cc  = captureCanvas.current;
    cc.width  = Math.min(video.videoWidth, 640);
    cc.height = Math.min(video.videoHeight, 480);
    const ctx = cc.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, cc.width, cc.height);
    capturedFrames.current.push(cc.toDataURL("image/jpeg", 0.72));
  }, []);

  /* ── Sobel edge detection on EDGE_W×EDGE_H buffer ── */
  const runEdgeDetection = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
      offscreenRef.current.width  = EDGE_W;
      offscreenRef.current.height = EDGE_H;
    }
    const oCtx = offscreenRef.current.getContext("2d");
    if (!oCtx) return;
    oCtx.drawImage(video, 0, 0, EDGE_W, EDGE_H);
    const { data } = oCtx.getImageData(0, 0, EDGE_W, EDGE_H);

    /* Grayscale */
    const gray = new Float32Array(EDGE_W * EDGE_H);
    let sum = 0;
    for (let i = 0; i < EDGE_W * EDGE_H; i++) {
      gray[i] = (data[i*4]*0.299 + data[i*4+1]*0.587 + data[i*4+2]*0.114) / 255;
      sum += gray[i];
    }
    avgBrightRef.current = sum / (EDGE_W * EDGE_H);

    /* Sobel magnitude */
    const mag = new Float32Array(EDGE_W * EDGE_H);
    for (let y = 1; y < EDGE_H - 1; y++) {
      for (let x = 1; x < EDGE_W - 1; x++) {
        const g = (r: number, c: number) => gray[r * EDGE_W + c];
        const Gx =
          -g(y-1,x-1) + g(y-1,x+1)
          -2*g(y,x-1)  + 2*g(y,x+1)
          -g(y+1,x-1)  + g(y+1,x+1);
        const Gy =
           g(y-1,x-1) + 2*g(y-1,x) + g(y-1,x+1)
          -g(y+1,x-1) - 2*g(y+1,x) - g(y+1,x+1);
        mag[y * EDGE_W + x] = Math.sqrt(Gx*Gx + Gy*Gy);
      }
    }
    edgeMagRef.current = mag;
  }, []);

  /* ── Device orientation → azimuth coverage ── */
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const alpha = e.alpha ?? 0;
    const sectorId = Math.floor(((alpha % 360) + 360) % 360 / 360 * AZ_SECTORS);

    if (!coveredCells.current.has(sectorId)) {
      coveredCells.current.add(sectorId);
      const pct = Math.round((coveredCells.current.size / AZ_SECTORS) * 100);
      setCoverage(pct);
      setVisitedSet(new Set(coveredCells.current));

      /* Capture at milestones */
      for (const m of MILESTONES) {
        if (pct >= m && !capturedAt.current.has(m)) {
          capturedAt.current.add(m);
          captureFrame();
        }
      }

      /* Done */
      if (pct >= COMPLETE_AT) {
        setUiPhase("done");
        onScanComplete(capturedFrames.current, pct);
      }
    }
  }, [captureFrame, onScanComplete]);

  /* ── Desktop fallback: auto-simulate full rotation ── */
  const startDesktopFallback = useCallback(() => {
    let az = 0;
    const iv = setInterval(() => {
      az = (az + 14) % 360;
      handleOrientation({ alpha: az, beta: 0, gamma: 0 } as DeviceOrientationEvent);
    }, 120);
    return () => clearInterval(iv);
  }, [handleOrientation]);

  /* ── Request orientation permission ── */
  const startOrientation = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE?.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission();
        if (res !== "granted") { startDesktopFallback(); return; }
      } catch { startDesktopFallback(); return; }
    }
    const supported = "DeviceOrientationEvent" in window;
    orientSupported.current = supported;
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
      const track = stream.getVideoTracks()[0];
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      /* Check torch capability */
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const caps = (track as any).getCapabilities?.() ?? {};
        if (caps.torch) setTorchAvail(true);
      } catch { /* ignore */ }
    } catch { /* no camera (desktop) */ }
  }, []);

  /* ── Canvas animation loop ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(animate); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(animate); return; }

    const W = canvas.width;
    const H = canvas.height;
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, W, H);
    frameTickRef.current++;

    /* ── 1. Run Sobel every EDGE_EVERY frames ── */
    if (frameTickRef.current % EDGE_EVERY === 0) {
      runEdgeDetection();
      setIsDark(avgBrightRef.current < DARK_THRESHOLD);
    }

    /* ── 2. Draw Sobel edge overlay (green glow) ── */
    const edges = edgeMagRef.current;
    if (edges) {
      const scaleX = W / EDGE_W;
      const scaleY = H / EDGE_H;
      for (let ey = 0; ey < EDGE_H; ey++) {
        for (let ex = 0; ex < EDGE_W; ex++) {
          const m = edges[ey * EDGE_W + ex];
          if (m > EDGE_THRESHOLD) {
            const alpha = Math.min(1, m * 2.5) * 0.80;
            ctx.fillStyle = `rgba(0,255,157,${alpha.toFixed(3)})`;
            /* Slightly blurred by drawing a rounded rect one pixel larger */
            ctx.fillRect(
              ex * scaleX - 0.5,
              ey * scaleY - 0.5,
              scaleX + 1,
              scaleY + 1,
            );
          }
        }
      }
    }

    /* ── 3. Smooth oscillating horizontal sweep line ── */
    const sweepY = (Math.sin(t * 0.7) * 0.42 + 0.5) * H;
    const lineGrad = ctx.createLinearGradient(0, sweepY - 4, 0, sweepY + 4);
    lineGrad.addColorStop(0,   "rgba(0,255,157,0)");
    lineGrad.addColorStop(0.5, "rgba(0,255,157,0.50)");
    lineGrad.addColorStop(1,   "rgba(0,255,157,0)");
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, sweepY - 4, W, 8);

    /* ── 4. Dashed focus rectangle ── */
    const fx = W * 0.05, fy = H * 0.07;
    const fw = W * 0.90, fh = H * 0.86;
    ctx.strokeStyle  = `rgba(0,255,157,${(Math.sin(t * 0.5) * 0.06 + 0.18).toFixed(3)})`;
    ctx.lineWidth    = 1;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(fx, fy, fw, fh);
    ctx.setLineDash([]);

    /* ── 5. Corner brackets ── */
    const bLen = Math.min(W, H) * 0.055;
    ctx.strokeStyle = "rgba(0,255,157,0.88)";
    ctx.lineWidth   = 2.5;
    ctx.shadowColor = "#00ff9d";
    ctx.shadowBlur  = 10;
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
  }, [runEdgeDetection]);

  /* ── Resize canvas to match container ── */
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

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("deviceorientation", handleOrientation, true);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [handleOrientation]);

  /* ── Start scan ── */
  const handleStart = useCallback(async () => {
    setUiPhase("scanning");
    await startCamera();
    await startOrientation();
  }, [startCamera, startOrientation]);

  /* ── Sector arc gauge: 36 slices around circle ── */
  const GAUGE_R  = 26, GAUGE_CX = 34, GAUGE_CY = 34;
  const GAP_DEG  = 2;
  const sectorArcs = Array.from({ length: AZ_SECTORS }, (_, i) => {
    const startDeg = i * (360 / AZ_SECTORS) - 90;
    const endDeg   = startDeg + (360 / AZ_SECTORS) - GAP_DEG;
    const s = (d: number) => ({ x: GAUGE_CX + GAUGE_R * Math.cos(d * Math.PI/180), y: GAUGE_CY + GAUGE_R * Math.sin(d * Math.PI/180) });
    const p1 = s(startDeg), p2 = s(endDeg);
    const large = (360 / AZ_SECTORS - GAP_DEG) > 180 ? 1 : 0;
    return { i, path: `M ${GAUGE_CX} ${GAUGE_CY} L ${p1.x} ${p1.y} A ${GAUGE_R} ${GAUGE_R} 0 ${large} 1 ${p2.x} ${p2.y} Z`, visited: visitedSet.has(i) };
  });

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}>
      <style>{SCAN_STYLES}</style>

      {/* Cancel */}
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
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.35 }} />
          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,255,157,.08)", border: "1px solid rgba(0,255,157,.28)", boxShadow: "0 0 32px rgba(0,255,157,.18)" }}
            >
              <RotateCcw size={36} strokeWidth={1.4} style={{ color: "#00ff9d", animation: "rotateSpin 3s linear infinite" }} />
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
                ? "Placez le plat devant vous et tournez lentement autour en un cercle complet. L'IA reconstruit le volume."
                : "Place the dish in front of you and slowly walk in a full circle around it. AI rebuilds the 3D volume."}
            </p>
            {/* Instruction row */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: "rgba(0,255,157,.07)", border: "1px solid rgba(0,255,157,.15)" }}
            >
              <RotateCcw size={16} strokeWidth={2} style={{ color: "#00ff9d" }} />
              <p className="text-xs font-semibold text-white/70">
                {locale === "fr"
                  ? "Tournez à 360° — 1 à 2 tours suffisent"
                  : "Rotate 360° — 1 to 2 turns is enough"}
              </p>
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

          {/* ── Video + overlay ── */}
          <div
            className="relative w-full rounded-[1.75rem] overflow-hidden"
            style={{ aspectRatio: "4/3", background: "#000" }}
          >
            {/* Camera (no mirror) */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline muted autoPlay
            />

            {/* Sobel + sweep + brackets canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ mixBlendMode: "screen" }}
            />

            {/* ── Low-light warning ── */}
            {isDark && (
              <div
                className="absolute top-2 inset-x-2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(0,0,0,.72)",
                  border: "1px solid rgba(250,204,21,.35)",
                  animation: "darkWarning .3s ease-out",
                }}
              >
                <Sun size={14} strokeWidth={2} style={{ color: "#fbbf24", flexShrink: 0 }} />
                <p className="text-xs font-semibold text-yellow-300/90 leading-snug">
                  {locale === "fr"
                    ? "Lumière insuffisante — allumez le flash ou déplacez-vous"
                    : "Too dark — turn on the flash or move to better light"}
                </p>
                {torchAvail && (
                  <button
                    onClick={toggleTorch}
                    className="ml-auto flex-shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase"
                    style={{ background: torchOn ? "#fbbf24" : "rgba(251,191,36,.2)", color: torchOn ? "#000" : "#fbbf24" }}
                  >
                    <Zap size={11} />
                  </button>
                )}
              </div>
            )}

            {/* ── Sector arc gauge (top-right) ── */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <svg width="68" height="68" viewBox="0 0 68 68">
                {/* Background disc */}
                <circle cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R + 5}
                  fill="rgba(0,0,0,.52)" />
                {/* Sector slices */}
                {sectorArcs.map(({ i, path, visited }) => (
                  <path
                    key={i}
                    d={path}
                    fill={visited ? "#00ff9d" : "rgba(255,255,255,0.07)"}
                    style={{
                      filter: visited ? "drop-shadow(0 0 3px rgba(0,255,157,.6))" : "none",
                      transition: "fill .2s ease",
                    }}
                  />
                ))}
                {/* Center hole + text */}
                <circle cx={GAUGE_CX} cy={GAUGE_CY} r={14} fill="rgba(0,0,0,.70)" />
                <text
                  x={GAUGE_CX} y={GAUGE_CY}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#00ff9d" fontSize="10" fontWeight="900"
                  fontFamily="'Courier New',monospace"
                  style={{ filter: "drop-shadow(0 0 3px rgba(0,255,157,.7))" }}
                >
                  {coverage}%
                </text>
              </svg>
            </div>

            {/* ── Flash toggle (bottom-right) if torch available and not dark ── */}
            {torchAvail && !isDark && (
              <button
                onClick={toggleTorch}
                className="absolute bottom-2.5 right-2.5 z-20 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: torchOn ? "rgba(251,191,36,.25)" : "rgba(0,0,0,.55)",
                  border: `1px solid ${torchOn ? "rgba(251,191,36,.5)" : "rgba(255,255,255,.12)"}`,
                }}
              >
                <Zap size={16} strokeWidth={2} style={{ color: torchOn ? "#fbbf24" : "rgba(255,255,255,.6)" }} />
              </button>
            )}

            {/* ── Circular motion instruction (bottom center) ── */}
            <div className="absolute bottom-2.5 left-0 right-0 flex flex-col items-center gap-1 z-20">
              <div
                className="px-3 py-1 rounded-full flex items-center gap-2"
                style={{ background: "rgba(0,0,0,.60)", border: "1px solid rgba(0,255,157,.30)" }}
              >
                <RotateCcw
                  size={14}
                  strokeWidth={2.5}
                  style={{
                    color: "#00ff9d",
                    filter: "drop-shadow(0 0 6px rgba(0,255,157,.9))",
                    animation: "rotateSpin 1.8s linear infinite",
                  }}
                />
                <p className="text-[11px] font-bold text-white/85">
                  {locale === "fr" ? "Tournez autour du plat" : "Circle around the dish"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Progress bar + label ── */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
                {locale === "fr" ? "Couverture circulaire" : "Circular coverage"}
              </p>
              <p
                className="text-xs font-black"
                style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}
              >
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
                  transition: "width .3s ease",
                }}
              />
            </div>
            <p className="text-[10px] text-white/30 text-center font-medium">
              {locale === "fr"
                ? `${Math.round((COMPLETE_AT - coverage) / (100/AZ_SECTORS))} secteurs restants`
                : `${Math.round((COMPLETE_AT - coverage) / (100/AZ_SECTORS))} sectors remaining`}
            </p>
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

      {/* ── Background Scan icon on intro canvas only ── */}
      {uiPhase !== "intro" && <Scan size={0} />}
    </div>
  );
}
