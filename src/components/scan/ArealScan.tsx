"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle, X, Zap, Sun } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN — v4 "The Swirl"
   Gyroscope circular swirl · Wireframe Mesh Lidar · 10 captures
   ══════════════════════════════════════════════════════════ */

export interface ArealScanProps {
  onScanComplete: (frames: string[], coveragePct: number) => void;
  onCancel: () => void;
  locale: "fr" | "en";
}

/* ── Swirl sectors (18 sectors × 20°) ── */
const SWIRL_SECTORS  = 18;
const COMPLETE_AT    = 12;   // 12/18 sectors (~67%) → done
const TARGET_FRAMES  = 10;   // exactly 10 frames to capture
const DONE_AT_PCT    = Math.round((COMPLETE_AT / SWIRL_SECTORS) * 100); // ≈ 67

/* ── Wireframe mesh ── */
const MESH_COLS     = 22;   // grid columns
const MESH_ROWS     = 16;   // grid rows
const SAMPLE_W      = 44;   // offscreen brightness sample width
const SAMPLE_H      = 32;   // offscreen brightness sample height
const MESH_UPDATE_F = 4;    // frames between mesh resamples
const MESH_MAX_ELEV = 8;    // max vertex elevation displacement (px)

/* ── Low-light threshold (avg luma 0-1) ── */
const DARK_THRESHOLD = 0.12;

/* ── Inline keyframes ── */
const SCAN_STYLES = `
  @keyframes swirlAnim {
    0%   { transform: rotate(0deg);   }
    100% { transform: rotate(360deg); }
  }
  @keyframes darkWarnFade {
    from { opacity:0; transform:translateY(-5px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes meshIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
`;

/* ══════════════════════════════════════════════════════════ */
export default function ArealScan({ onScanComplete, onCancel, locale }: ArealScanProps) {
  /* ── Refs ── */
  const videoRef       = useRef<HTMLVideoElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const sampleCanvRef  = useRef<HTMLCanvasElement | null>(null);
  const captureCanvRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef         = useRef<number>(0);
  const frameTickRef   = useRef<number>(0);
  const meshElevRef    = useRef<Float32Array | null>(null);
  const avgBrightRef   = useRef<number>(0.5);
  const coveredCells   = useRef<Set<number>>(new Set());
  const capturedFrames = useRef<string[]>([]);
  const streamRef      = useRef<MediaStream | null>(null);

  /* ── State ── */
  const [uiPhase,    setUiPhase]    = useState<"intro" | "scanning" | "done">("intro");
  const [coverage,   setCoverage]   = useState(0);
  const [visitedSet, setVisitedSet] = useState<Set<number>>(new Set());
  const [frameCount, setFrameCount] = useState(0);
  const [isDark,     setIsDark]     = useState(false);
  const [torchOn,    setTorchOn]    = useState(false);
  const [torchAvail, setTorchAvail] = useState(false);

  /* ── Toggle torch ── */
  const toggleTorch = useCallback(async () => {
    const track = (videoRef.current?.srcObject as MediaStream | null)
      ?.getVideoTracks()[0];
    if (!track) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn((t: boolean) => !t);
    } catch { /* torch not supported */ }
  }, [torchOn]);

  /* ── Capture one JPEG frame ── */
  const captureFrame = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    if (!captureCanvRef.current) captureCanvRef.current = document.createElement("canvas");
    const cc = captureCanvRef.current;
    cc.width  = Math.min(v.videoWidth, 640);
    cc.height = Math.min(v.videoHeight, 480);
    cc.getContext("2d")?.drawImage(v, 0, 0, cc.width, cc.height);
    capturedFrames.current.push(cc.toDataURL("image/jpeg", 0.72));
  }, []);

  /* ── Sample video brightness and build mesh elevation map ── */
  const updateMesh = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    if (!sampleCanvRef.current) {
      sampleCanvRef.current = document.createElement("canvas");
      sampleCanvRef.current.width  = SAMPLE_W;
      sampleCanvRef.current.height = SAMPLE_H;
    }
    const ctx = sampleCanvRef.current.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, SAMPLE_W, SAMPLE_H);
    const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);

    const numVerts = (MESH_COLS + 1) * (MESH_ROWS + 1);
    if (!meshElevRef.current || meshElevRef.current.length !== numVerts) {
      meshElevRef.current = new Float32Array(numVerts);
    }

    let totalBright = 0;
    for (let r = 0; r <= MESH_ROWS; r++) {
      for (let c = 0; c <= MESH_COLS; c++) {
        const sx = Math.round((c / MESH_COLS) * (SAMPLE_W - 1));
        const sy = Math.round((r / MESH_ROWS) * (SAMPLE_H - 1));
        const idx = (sy * SAMPLE_W + sx) * 4;
        const luma = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
        meshElevRef.current[r * (MESH_COLS + 1) + c] = luma;
        totalBright += luma;
      }
    }
    avgBrightRef.current = totalBright / numVerts;
  }, []);

  /* ── Draw Wireframe Mesh Lidar overlay ── */
  const drawMesh = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number, t: number) => {
      const elev = meshElevRef.current;
      if (!elev) return;

      /* Pre-compute vertex positions with brightness-driven elevation */
      const cx = W / 2, cy = H / 2;
      const verts: [number, number, number][] = []; // [x, y, brightness]
      for (let r = 0; r <= MESH_ROWS; r++) {
        for (let c = 0; c <= MESH_COLS; c++) {
          const bx = (c / MESH_COLS) * W;
          const by = (r / MESH_ROWS) * H;
          const e  = elev[r * (MESH_COLS + 1) + c];
          /* Bright areas → vertex pulled toward screen center (elevation) */
          const ddx  = bx - cx, ddy = by - cy;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
          const disp = (e - 0.35) * MESH_MAX_ELEV; // center on mid-gray
          verts.push([
            bx - (ddx / dist) * disp,
            by - (ddy / dist) * disp,
            e,
          ]);
        }
      }

      /* Pulsing base alpha */
      const pulse = Math.sin(t * 1.4) * 0.09 + 0.28; // 0.19…0.37

      /* Draw horizontal mesh lines */
      ctx.shadowColor = "#00ff9d";
      ctx.shadowBlur  = 5;
      for (let r = 0; r <= MESH_ROWS; r++) {
        ctx.beginPath();
        for (let c = 0; c <= MESH_COLS; c++) {
          const [vx, vy, br] = verts[r * (MESH_COLS + 1) + c];
          if (c === 0) ctx.moveTo(vx, vy);
          else         ctx.lineTo(vx, vy);
          void br;
        }
        /* Lines brighter near vertical center */
        const rowFade = 1 - Math.abs(r - MESH_ROWS / 2) / (MESH_ROWS / 2) * 0.35;
        ctx.strokeStyle = `rgba(0,255,157,${(pulse * rowFade).toFixed(3)})`;
        ctx.lineWidth   = 0.65;
        ctx.stroke();
      }

      /* Draw vertical mesh lines */
      for (let c = 0; c <= MESH_COLS; c++) {
        ctx.beginPath();
        for (let r = 0; r <= MESH_ROWS; r++) {
          const [vx, vy] = verts[r * (MESH_COLS + 1) + c];
          if (r === 0) ctx.moveTo(vx, vy);
          else         ctx.lineTo(vx, vy);
        }
        const colFade = 1 - Math.abs(c - MESH_COLS / 2) / (MESH_COLS / 2) * 0.35;
        ctx.strokeStyle = `rgba(0,255,157,${(pulse * colFade).toFixed(3)})`;
        ctx.lineWidth   = 0.65;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      /* Bright elevation points at high-detail vertices */
      for (let r = 0; r <= MESH_ROWS; r++) {
        for (let c = 0; c <= MESH_COLS; c++) {
          const [vx, vy, br] = verts[r * (MESH_COLS + 1) + c];
          if (br > 0.72) {
            ctx.shadowColor = "#00ff9d";
            ctx.shadowBlur  = 8;
            ctx.fillStyle   = `rgba(0,255,157,${((br - 0.72) * 2.2).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(vx, vy, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.shadowBlur = 0;

      /* Animated sweep line that follows the mesh surface */
      const sweepProgress = (Math.sin(t * 0.85) * 0.5 + 0.5);
      const sweepRow      = sweepProgress * MESH_ROWS;
      const r1 = Math.floor(sweepRow);
      const r2 = Math.min(MESH_ROWS, r1 + 1);
      const lf = sweepRow - r1;

      ctx.shadowColor = "#00ff9d";
      ctx.shadowBlur  = 18;
      ctx.beginPath();
      for (let c = 0; c <= MESH_COLS; c++) {
        const [v1x, v1y] = verts[r1 * (MESH_COLS + 1) + c];
        const [v2x, v2y] = verts[r2 * (MESH_COLS + 1) + c];
        const sx = v1x + (v2x - v1x) * lf;
        const sy = v1y + (v2y - v1y) * lf;
        if (c === 0) ctx.moveTo(sx, sy);
        else         ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = "rgba(0,255,157,0.88)";
      ctx.lineWidth   = 1.6;
      ctx.stroke();
      ctx.shadowBlur  = 0;

      /* Corner brackets */
      const margin = 12;
      const bLen   = Math.min(W, H) * 0.06;
      ctx.shadowColor = "#00ff9d";
      ctx.shadowBlur  = 12;
      ctx.strokeStyle = `rgba(0,255,157,${(Math.sin(t * 0.5) * 0.08 + 0.85).toFixed(2)})`;
      ctx.lineWidth   = 2.2;
      const corners: [number, number, number, number][] = [
        [margin,     margin,     1,  1],
        [W - margin, margin,    -1,  1],
        [margin,     H - margin, 1, -1],
        [W - margin, H - margin,-1, -1],
      ];
      for (const [x, y, sx, sy] of corners) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * bLen, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * bLen); ctx.stroke();
      }
      ctx.shadowBlur = 0;
    },
    []
  );

  /* ── Main animation loop ── */
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(animate); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(animate); return; }

    const W = canvas.width, H = canvas.height;
    const t = performance.now() / 1000;
    ctx.clearRect(0, 0, W, H);
    frameTickRef.current++;

    /* Resample brightness & update mesh */
    if (frameTickRef.current % MESH_UPDATE_F === 0) {
      updateMesh();
      setIsDark(avgBrightRef.current < DARK_THRESHOLD);
    }

    drawMesh(ctx, W, H, t);

    rafRef.current = requestAnimationFrame(animate);
  }, [updateMesh, drawMesh]);

  /* ── Handle device orientation → swirl sector tracking ── */
  const handleOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      const alpha = e.alpha ?? 0;
      const sectorId = Math.floor(
        (((alpha % 360) + 360) % 360 / 360) * SWIRL_SECTORS
      );

      if (!coveredCells.current.has(sectorId)) {
        coveredCells.current.add(sectorId);
        const sectorsCovered = coveredCells.current.size;
        const pct = Math.round((sectorsCovered / SWIRL_SECTORS) * 100);
        setCoverage(pct);
        setVisitedSet(new Set(coveredCells.current));

        /* Capture at evenly-spaced intervals → exactly TARGET_FRAMES */
        const targetNow = Math.min(
          TARGET_FRAMES,
          Math.ceil((sectorsCovered / COMPLETE_AT) * TARGET_FRAMES)
        );
        while (capturedFrames.current.length < targetNow) captureFrame();
        setFrameCount(capturedFrames.current.length);

        /* Done */
        if (sectorsCovered >= COMPLETE_AT) {
          while (capturedFrames.current.length < TARGET_FRAMES) captureFrame();
          setFrameCount(TARGET_FRAMES);
          setUiPhase("done");
          onScanComplete([...capturedFrames.current].slice(0, TARGET_FRAMES), pct);
        }
      }
    },
    [captureFrame, onScanComplete]
  );

  /* ── Desktop fallback: auto-simulate swirl ── */
  const startDesktopFallback = useCallback(() => {
    let az = 0;
    const iv = setInterval(() => {
      az = (az + 22) % 360;
      handleOrientation({ alpha: az, beta: 45, gamma: 0 } as DeviceOrientationEvent);
    }, 90);
    return () => clearInterval(iv);
  }, [handleOrientation]);

  /* ── Request orientation permission (iOS) ── */
  const startOrientation = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE?.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission();
        if (res !== "granted") { startDesktopFallback(); return; }
      } catch { startDesktopFallback(); return; }
    }
    if ("DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    } else {
      startDesktopFallback();
    }
  }, [handleOrientation, startDesktopFallback]);

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
        const caps = (track as any).getCapabilities?.() ?? {};
        if (caps.torch) setTorchAvail(true);
      } catch { /* no torch */ }
    } catch { /* desktop = no camera */ }
  }, []);

  /* ── Canvas resize ── */
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (c) { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ── Animation loop ── */
  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  /* ── Cleanup ── */
  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    window.removeEventListener("deviceorientation", handleOrientation, true);
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
  }, [handleOrientation]);

  /* ── Start scan ── */
  const handleStart = useCallback(async () => {
    setUiPhase("scanning");
    await startCamera();
    await startOrientation();
  }, [startCamera, startOrientation]);

  /* ── Swirl sector gauge ── */
  const GAUGE_R = 26, GAUGE_CX = 34, GAUGE_CY = 34, GAP_DEG = 3;
  const sectorArcs = Array.from({ length: SWIRL_SECTORS }, (_, i) => {
    const sd = i * (360 / SWIRL_SECTORS) - 90;
    const ed = sd + (360 / SWIRL_SECTORS) - GAP_DEG;
    const pt = (d: number) => ({
      x: GAUGE_CX + GAUGE_R * Math.cos(d * Math.PI / 180),
      y: GAUGE_CY + GAUGE_R * Math.sin(d * Math.PI / 180),
    });
    const p1 = pt(sd), p2 = pt(ed);
    return {
      i,
      path: `M ${GAUGE_CX} ${GAUGE_CY} L ${p1.x} ${p1.y} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${p2.x} ${p2.y} Z`,
      visited: visitedSet.has(i),
    };
  });

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
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
          style={{
            background: "rgba(2,12,7,0.95)",
            border: "1px solid rgba(0,255,157,.15)",
            minHeight: "26rem",
          }}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 0.28 }}
          />
          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Swirl icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,255,157,.08)",
                border: "1px solid rgba(0,255,157,.28)",
                boxShadow: "0 0 32px rgba(0,255,157,.18)",
              }}
            >
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="14" stroke="rgba(0,255,157,.20)" strokeWidth="1.5" />
                <path
                  d="M22 8 A14 14 0 1 1 9 31"
                  stroke="#00ff9d"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    filter: "drop-shadow(0 0 8px #00ff9d)",
                    animation: "swirlAnim 2.2s linear infinite",
                    transformOrigin: "22px 22px",
                  }}
                />
                <circle
                  cx="22" cy="22" r="3.5"
                  fill="#00ff9d"
                  style={{ filter: "drop-shadow(0 0 6px #00ff9d)" }}
                />
              </svg>
            </div>

            {/* Logo */}
            <div>
              <p
                className="font-black text-2xl tracking-[.18em] leading-none mb-0.5"
                style={{ fontFamily: "'Courier New',monospace" }}
              >
                <span style={{ color: "#8b949e" }}>LI</span>
                <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d" }}>X</span>
                <span style={{ color: "#8b949e" }}>UM</span>
              </p>
              <p
                className="text-[11px] font-bold uppercase tracking-[.28em]"
                style={{ color: "rgba(0,255,157,.55)" }}
              >
                Areal Scan · The Swirl
              </p>
            </div>

            <p className="text-white/60 text-sm font-medium max-w-xs leading-relaxed">
              {locale === "fr"
                ? "Tenez le téléphone au-dessus du plat et faites un mouvement circulaire du bras, comme pour verser de la sauce. Le maillage 3D s'adapte en temps réel."
                : "Hold your phone above the dish and make a circular arm motion, like pouring sauce. The 3D wireframe mesh adapts in real time."}
            </p>

            {/* Instruction pill */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: "rgba(0,255,157,.07)", border: "1px solid rgba(0,255,157,.15)" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 2 A6 6 0 1 1 2.8 11.5"
                  stroke="#00ff9d"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polyline
                  points="2 8 2.8 11.5 6 10.5"
                  stroke="#00ff9d"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-xs font-semibold text-white/70">
                {locale === "fr"
                  ? "Geste circulaire · 1 à 2 tours · 10 clichés capturés"
                  : "Circular swirl · 1 to 2 turns · 10 frames captured"}
              </p>
            </div>

            <button
              onClick={handleStart}
              className="mt-1 px-10 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase text-black transition-all hover:brightness-110 active:scale-[.97]"
              style={{
                background: "#00ff9d",
                boxShadow: "0 0 28px rgba(0,255,157,.5), 0 4px 16px rgba(0,0,0,.3)",
              }}
            >
              {locale === "fr" ? "Démarrer The Swirl" : "Start The Swirl"}
            </button>
          </div>
        </div>
      )}

      {/* ══ SCANNING ══ */}
      {uiPhase === "scanning" && (
        <div className="flex flex-col gap-3">

          {/* Video + Wireframe Mesh canvas */}
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
              style={{ mixBlendMode: "screen", animation: "meshIn .4s ease-out" }}
            />

            {/* Low-light warning */}
            {isDark && (
              <div
                className="absolute top-2 inset-x-2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  background: "rgba(0,0,0,.72)",
                  border: "1px solid rgba(250,204,21,.35)",
                  animation: "darkWarnFade .3s ease-out",
                }}
              >
                <Sun size={14} strokeWidth={2} style={{ color: "#fbbf24", flexShrink: 0 }} />
                <p className="text-xs font-semibold text-yellow-300/90 leading-snug">
                  {locale === "fr"
                    ? "Lumière insuffisante — allumez le flash ou déplacez-vous"
                    : "Too dark — turn on flash or move to better light"}
                </p>
                {torchAvail && (
                  <button
                    onClick={toggleTorch}
                    className="ml-auto flex-shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase"
                    style={{
                      background: torchOn ? "#fbbf24" : "rgba(251,191,36,.2)",
                      color: torchOn ? "#000" : "#fbbf24",
                    }}
                  >
                    <Zap size={11} />
                  </button>
                )}
              </div>
            )}

            {/* Sector gauge */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R + 5} fill="rgba(0,0,0,.52)" />
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

            {/* Torch toggle button */}
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

            {/* Swirl instruction */}
            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center z-20">
              <div
                className="px-3 py-1.5 rounded-full flex items-center gap-2"
                style={{ background: "rgba(0,0,0,.62)", border: "1px solid rgba(0,255,157,.30)" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1.5 A5.5 5.5 0 1 1 2.2 10"
                    stroke="#00ff9d"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                      filter: "drop-shadow(0 0 5px rgba(0,255,157,.9))",
                      animation: "swirlAnim 1.8s linear infinite",
                      transformOrigin: "7px 7px",
                    }}
                  />
                </svg>
                <p className="text-[11px] font-bold text-white/85">
                  {locale === "fr"
                    ? "Geste circulaire au-dessus du plat"
                    : "Circular swirl above the dish"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar + labels */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
                {locale === "fr" ? "Couverture Swirl" : "Swirl Coverage"}
              </p>
              <p
                className="text-xs font-black"
                style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}
              >
                {coverage}% / {DONE_AT_PCT}%
              </p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (coverage / DONE_AT_PCT) * 100)}%`,
                  background: "linear-gradient(90deg,#059669,#00ff9d)",
                  boxShadow: "0 0 8px rgba(0,255,157,.55)",
                  transition: "width .3s ease",
                }}
              />
            </div>
            <div className="flex items-center justify-between px-0.5">
              <p className="text-[10px] text-white/30 font-medium">
                {frameCount}/{TARGET_FRAMES}{" "}
                {locale === "fr" ? "clichés" : "frames"}
              </p>
              <p className="text-[10px] text-white/30 font-medium">
                {locale === "fr" ? "Maillage Wireframe actif" : "Wireframe Mesh active"}
              </p>
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
              {locale === "fr" ? "Swirl terminé !" : "Swirl complete!"}
            </p>
            <p className="text-sm text-white/50 font-medium">
              {locale === "fr"
                ? `${TARGET_FRAMES} clichés · Maillage reconstruit`
                : `${TARGET_FRAMES} frames · Mesh reconstructed`}
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
