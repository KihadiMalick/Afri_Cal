"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle, X, Zap, Sun, Crosshair, Scan } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN — v6 "Precision Mapping"
   Phase 1: AI Reconnaissance (continuous video analysis)
   Phase 2: 4-Point AR Mapping (dynamic lines + multi-angle capture)
   ══════════════════════════════════════════════════════════ */

export interface ArealScanProps {
  onScanComplete: (frames: string[], coveragePct: number) => void;
  onCancel: () => void;
  locale: "fr" | "en";
}

/* ── Capture targets ── */
const TARGET_FRAMES     = 12;           // 3 captures × 4 segments
const CAPTURES_PER_SEG  = 3;            // multi-angle captures per segment
const MAX_POINTS        = 4;            // quadrilateral corners

/* ── Particle system ── */
const PARTICLE_COUNT    = 60;
const PARTICLE_SPEED    = 0.4;

/* ── Low-light threshold ── */
const DARK_THRESHOLD    = 0.12;

/* ── Inline keyframes ── */
const SCAN_STYLES = `
  @keyframes swirlAnim {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes darkWarnFade {
    from { opacity:0; transform:translateY(-5px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes meshIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes reconPulse {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  @keyframes pointPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,157,0.7); }
    50% { box-shadow: 0 0 0 12px rgba(0,255,157,0); }
  }
  @keyframes scanLine {
    0% { transform: translateY(0); }
    100% { transform: translateY(100%); }
  }
  @keyframes particleFloat {
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes captureFlash {
    0% { opacity: 0.6; }
    100% { opacity: 0; }
  }
  @keyframes lineGlow {
    0%, 100% { filter: drop-shadow(0 0 4px rgba(0,255,157,0.6)); }
    50% { filter: drop-shadow(0 0 12px rgba(0,255,157,1)); }
  }
  @keyframes cornerPulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

/* ── Particle type ── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

/* ── Point on screen ── */
interface MapPoint {
  x: number;
  y: number;
}

/* ══════════════════════════════════════════════════════════ */
export default function ArealScan({ onScanComplete, onCancel, locale }: ArealScanProps) {
  /* ── Camera / canvas refs ── */
  const videoRef       = useRef<HTMLVideoElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const sampleCanvRef  = useRef<HTMLCanvasElement | null>(null);
  const captureCanvRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef         = useRef<number>(0);
  const frameTickRef   = useRef<number>(0);
  const avgBrightRef   = useRef<number>(0.5);
  const capturedFrames = useRef<string[]>([]);
  const streamRef      = useRef<MediaStream | null>(null);
  const particlesRef   = useRef<Particle[]>([]);
  const containerRef   = useRef<HTMLDivElement>(null);

  /* ── UI state ── */
  const [uiPhase,    setUiPhase]    = useState<"intro" | "recon" | "mapping" | "capturing" | "done">("intro");
  const [coverage,   setCoverage]   = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [isDark,     setIsDark]     = useState(false);
  const [torchOn,    setTorchOn]    = useState(false);
  const [torchAvail, setTorchAvail] = useState(false);
  const [reconText,  setReconText]  = useState(locale === "fr" ? "Analyse en cours..." : "Analyzing...");
  const [mapPoints,  setMapPoints]  = useState<MapPoint[]>([]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [segmentCaptures, setSegmentCaptures] = useState(0);
  const [captureFlash, setCaptureFlash] = useState(false);

  /* ── Init particles ── */
  useEffect(() => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * PARTICLE_SPEED * 0.01,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED * 0.01,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        life: Math.random() * 200,
        maxLife: 200 + Math.random() * 200,
      });
    }
    particlesRef.current = particles;
  }, []);

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
    cc.width  = Math.min(v.videoWidth,  640);
    cc.height = Math.min(v.videoHeight, 480);
    cc.getContext("2d")?.drawImage(v, 0, 0, cc.width, cc.height);
    capturedFrames.current.push(cc.toDataURL("image/jpeg", 0.72));
  }, []);

  /* ── Sample video brightness ── */
  const sampleBrightness = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    if (!sampleCanvRef.current) {
      sampleCanvRef.current = document.createElement("canvas");
      sampleCanvRef.current.width  = 32;
      sampleCanvRef.current.height = 24;
    }
    const ctx = sampleCanvRef.current.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, 32, 24);
    const { data } = ctx.getImageData(0, 0, 32, 24);
    let totalBright = 0;
    const numPixels = 32 * 24;
    for (let i = 0; i < data.length; i += 4) {
      totalBright += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
    }
    avgBrightRef.current = totalBright / numPixels;
  }, []);

  /* ── Draw particle system (white detection dots) ── */
  const drawParticles = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number, t: number) => {
      const particles = particlesRef.current;
      for (const p of particles) {
        /* Update position */
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        /* Wrap around */
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        /* Reset life cycle */
        if (p.life > p.maxLife) {
          p.life = 0;
          p.alpha = Math.random() * 0.5 + 0.1;
          p.vx = (Math.random() - 0.5) * PARTICLE_SPEED * 0.01;
          p.vy = (Math.random() - 0.5) * PARTICLE_SPEED * 0.01;
        }

        /* Flicker */
        const lifeProgress = p.life / p.maxLife;
        const fadeIn  = Math.min(1, lifeProgress * 10);
        const fadeOut = Math.max(0, 1 - (lifeProgress - 0.8) * 5);
        const flicker = 0.7 + Math.sin(t * 3 + p.x * 100) * 0.3;
        const a = p.alpha * fadeIn * fadeOut * flicker;

        /* Draw dot */
        const px = p.x * W;
        const py = p.y * H;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.fill();

        /* Glow for brighter particles */
        if (a > 0.3) {
          ctx.beginPath();
          ctx.arc(px, py, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,157,${(a * 0.15).toFixed(3)})`;
          ctx.fill();
        }
      }
    },
    []
  );

  /* ── Draw detection grid (dot matrix) ── */
  const drawDetectionGrid = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number, t: number) => {
      const cols = 16, rows = 12;
      const cellW = W / cols, cellH = H / rows;
      const pulse = Math.sin(t * 2) * 0.15 + 0.3;

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = c * cellW;
          const y = r * cellH;
          const distFromCenter = Math.sqrt(
            Math.pow((x - W / 2) / W, 2) + Math.pow((y - H / 2) / H, 2)
          );
          const a = Math.max(0, (pulse - distFromCenter * 0.5));
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,157,${a.toFixed(3)})`;
          ctx.fill();
        }
      }
    },
    []
  );

  /* ── Draw scan sweep line ── */
  const drawScanSweep = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number, t: number) => {
      const sweepY = ((t * 0.3) % 1) * H;
      const gradient = ctx.createLinearGradient(0, sweepY - 30, 0, sweepY + 30);
      gradient.addColorStop(0, "rgba(0,255,157,0)");
      gradient.addColorStop(0.5, "rgba(0,255,157,0.25)");
      gradient.addColorStop(1, "rgba(0,255,157,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, sweepY - 30, W, 60);

      /* Bright center line */
      ctx.beginPath();
      ctx.moveTo(0, sweepY);
      ctx.lineTo(W, sweepY);
      ctx.strokeStyle = "rgba(0,255,157,0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    },
    []
  );

  /* ── Draw corner brackets ── */
  const drawCornerBrackets = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number, t: number) => {
      const margin = 12;
      const bLen   = Math.min(W, H) * 0.06;
      const pulseA = Math.sin(t * 0.5) * 0.08 + 0.85;
      ctx.shadowColor = "#00ff9d";
      ctx.shadowBlur  = 12;
      ctx.strokeStyle = `rgba(0,255,157,${pulseA.toFixed(2)})`;
      ctx.lineWidth   = 2.2;
      const corners: [number, number, number, number][] = [
        [margin,     margin,      1,  1],
        [W - margin, margin,     -1,  1],
        [margin,     H - margin,  1, -1],
        [W - margin, H - margin, -1, -1],
      ];
      for (const [x, y, sx, sy] of corners) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * bLen, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * bLen); ctx.stroke();
      }
      ctx.shadowBlur = 0;
    },
    []
  );

  /* ── Draw AR mapping overlay (points + lines + frame) ── */
  const drawMappingOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number, t: number, points: MapPoint[]) => {
      if (points.length === 0) return;

      const scaleX = W / (containerRef.current?.offsetWidth || W);
      const scaleY = H / (containerRef.current?.offsetHeight || H);

      /* Draw completed lines between points */
      for (let i = 0; i < points.length; i++) {
        const next = (i + 1) % points.length;
        if (i >= points.length - 1 && points.length < MAX_POINTS) break;

        const p1 = { x: points[i].x * scaleX, y: points[i].y * scaleY };
        const p2 = { x: points[next].x * scaleX, y: points[next].y * scaleY };

        /* Line glow */
        ctx.shadowColor = "#00ff9d";
        ctx.shadowBlur = 10 + Math.sin(t * 2 + i) * 5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = "rgba(0,255,157,0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        /* Animated dash along line */
        const dashOffset = (t * 40) % 20;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -dashOffset;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        /* Distance label */
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const cmEstimate = Math.round(dist / 8);

        ctx.font = "bold 10px 'Courier New', monospace";
        ctx.textAlign = "center";
        const labelW = ctx.measureText(`${cmEstimate} cm`).width + 12;
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.beginPath();
        ctx.roundRect(midX - labelW / 2, midY - 8, labelW, 16, 4);
        ctx.fill();
        ctx.fillStyle = "#00ff9d";
        ctx.fillText(`${cmEstimate} cm`, midX, midY + 3.5);
      }

      /* Close the quadrilateral when 4 points are placed */
      if (points.length === MAX_POINTS) {
        /* Fill quadrilateral with transparent overlay */
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const p = { x: points[i].x * scaleX, y: points[i].y * scaleY };
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(0,255,157,0.06)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0,255,157,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* Draw point markers with pulse */
      for (let i = 0; i < points.length; i++) {
        const p = { x: points[i].x * scaleX, y: points[i].y * scaleY };
        const pulseSize = 4 + Math.sin(t * 3 + i) * 2;

        /* Outer pulse ring */
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize + 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,157,${(0.3 + Math.sin(t * 3 + i) * 0.15).toFixed(2)})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        /* Inner glow */
        ctx.shadowColor = "#00ff9d";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = "#00ff9d";
        ctx.fill();
        ctx.shadowBlur = 0;

        /* White center dot */
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

        /* Point label */
        ctx.font = "bold 9px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "#00ff9d";
        ctx.fillText(`P${i + 1}`, p.x, p.y - pulseSize - 6);
      }
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

    /* Sample brightness every 4 frames */
    if (frameTickRef.current % 4 === 0) {
      sampleBrightness();
      setIsDark(avgBrightRef.current < DARK_THRESHOLD);
    }

    /* Always draw particles + detection grid */
    drawParticles(ctx, W, H, t);
    drawDetectionGrid(ctx, W, H, t);
    drawCornerBrackets(ctx, W, H, t);

    /* Draw scan sweep during recon phase */
    if (uiPhase === "recon") {
      drawScanSweep(ctx, W, H, t);
    }

    /* Draw mapping overlay during mapping/capturing phases */
    if (uiPhase === "mapping" || uiPhase === "capturing") {
      drawMappingOverlay(ctx, W, H, t, mapPoints);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [sampleBrightness, drawParticles, drawDetectionGrid, drawScanSweep, drawCornerBrackets, drawMappingOverlay, uiPhase, mapPoints]);

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
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
  }, []);

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

  /* ── Phase 1: AI Reconnaissance ── */
  const startRecon = useCallback(async () => {
    setUiPhase("recon");
    await startCamera();

    /* Simulate AI reconnaissance phases */
    const reconSteps = locale === "fr"
      ? [
          "Détection du plat...",
          "Analyse des contours...",
          "Identification des ingrédients...",
          "Estimation des proportions...",
          "Reconnaissance terminée !",
        ]
      : [
          "Detecting dish...",
          "Analyzing contours...",
          "Identifying ingredients...",
          "Estimating proportions...",
          "Recognition complete!",
        ];

    for (let i = 0; i < reconSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setReconText(reconSteps[i]);
    }

    /* Capture a recon frame for initial AI analysis */
    captureFrame();

    await new Promise(resolve => setTimeout(resolve, 500));
    setUiPhase("mapping");
  }, [startCamera, captureFrame, locale]);

  /* ── Handle map point placement ── */
  const handleCanvasClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (uiPhase !== "mapping") return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setMapPoints((prev: MapPoint[]) => {
      if (prev.length >= MAX_POINTS) return prev;
      const newPoints = [...prev, { x, y }];

      /* When we have 2+ points, start segment capture sequence */
      if (newPoints.length >= 2) {
        startSegmentCapture(newPoints.length - 1);
      }

      return newPoints;
    });
  }, [uiPhase]); // startSegmentCapture added below

  /* ── Capture 3 frames for a segment (with slight delay between each) ── */
  const startSegmentCapture = useCallback((segIdx: number) => {
    setUiPhase("capturing");
    setActiveSegment(segIdx);
    setSegmentCaptures(0);

    let captured = 0;
    const captureInterval = setInterval(() => {
      captureFrame();
      captured++;
      setSegmentCaptures(captured);
      setCaptureFlash(true);
      setTimeout(() => setCaptureFlash(false), 150);

      const totalCaptured = capturedFrames.current.length;
      const pct = Math.round((totalCaptured / TARGET_FRAMES) * 100);
      setFrameCount(totalCaptured);
      setCoverage(Math.min(pct, 100));

      if (captured >= CAPTURES_PER_SEG) {
        clearInterval(captureInterval);

        /* Check if we need the closing segment (4th point → 1st point) */
        const currentPointCount = segIdx + 1;
        if (currentPointCount >= MAX_POINTS) {
          /* Final segment: capture 3 more for the closing line (P4→P1) */
          let closingCaptured = 0;
          const closingInterval = setInterval(() => {
            captureFrame();
            closingCaptured++;
            setCaptureFlash(true);
            setTimeout(() => setCaptureFlash(false), 150);

            const tc = capturedFrames.current.length;
            const p = Math.round((tc / TARGET_FRAMES) * 100);
            setFrameCount(tc);
            setCoverage(Math.min(p, 100));

            if (closingCaptured >= CAPTURES_PER_SEG) {
              clearInterval(closingInterval);
              /* All 12 captures done */
              setUiPhase("done");
              const finalPct = Math.round((capturedFrames.current.length / TARGET_FRAMES) * 100);
              onScanComplete([...capturedFrames.current].slice(0, TARGET_FRAMES), Math.min(finalPct, 100));
            }
          }, 350);
        } else {
          /* Return to mapping for next point */
          setUiPhase("mapping");
        }
      }
    }, 350);
  }, [captureFrame, onScanComplete]);

  /* ── Start scan ── */
  const handleStart = useCallback(async () => {
    await startRecon();
  }, [startRecon]);

  /* ── Frame gauge (12 arcs) ── */
  const GAUGE_R = 26, GAUGE_CX = 34, GAUGE_CY = 34, GAP_DEG = 4;
  const sectorArcs = Array.from({ length: TARGET_FRAMES }, (_, i) => {
    const sd = i * (360 / TARGET_FRAMES) - 90;
    const ed = sd + (360 / TARGET_FRAMES) - GAP_DEG;
    const pt = (d: number) => ({
      x: GAUGE_CX + GAUGE_R * Math.cos(d * Math.PI / 180),
      y: GAUGE_CY + GAUGE_R * Math.sin(d * Math.PI / 180),
    });
    const p1 = pt(sd), p2 = pt(ed);
    return {
      i,
      path: `M ${GAUGE_CX} ${GAUGE_CY} L ${p1.x} ${p1.y} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${p2.x} ${p2.y} Z`,
      captured: i < frameCount,
    };
  });

  /* ── Segment progress indicator ── */
  const segmentLabels = locale === "fr"
    ? ["Côté 1", "Côté 2", "Côté 3", "Côté 4"]
    : ["Side 1", "Side 2", "Side 3", "Side 4"];

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
            {/* Precision Mapping icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,255,157,.08)",
                border: "1px solid rgba(0,255,157,.28)",
                boxShadow: "0 0 32px rgba(0,255,157,.18)",
              }}
            >
              <Crosshair
                size={38}
                strokeWidth={1.5}
                style={{ color: "#00ff9d", filter: "drop-shadow(0 0 8px #00ff9d)" }}
              />
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
                Precision Mapping · AR Scan
              </p>
            </div>

            <p className="text-white/60 text-sm font-medium max-w-xs leading-relaxed">
              {locale === "fr"
                ? "L'IA analyse le plat en continu, puis vous définissez les contours en plaçant 4 points de repère. 12 clichés multi-angles sont capturés automatiquement."
                : "AI analyzes the dish continuously, then you define contours by placing 4 reference points. 12 multi-angle shots are captured automatically."}
            </p>

            {/* Steps pills */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {[
                {
                  icon: "🔍",
                  text: locale === "fr" ? "Phase 1 · Reconnaissance IA automatique" : "Phase 1 · Automatic AI reconnaissance",
                },
                {
                  icon: "📐",
                  text: locale === "fr" ? "Phase 2 · Cartographie 4 points AR" : "Phase 2 · 4-point AR mapping",
                },
                {
                  icon: "📸",
                  text: locale === "fr" ? "3 clichés × 4 côtés = 12 captures" : "3 shots × 4 sides = 12 captures",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(0,255,157,.05)", border: "1px solid rgba(0,255,157,.10)" }}
                >
                  <span className="text-sm">{step.icon}</span>
                  <p className="text-[11px] font-semibold text-white/55">{step.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="mt-1 px-10 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase text-black transition-all hover:brightness-110 active:scale-[.97]"
              style={{
                background: "#00ff9d",
                boxShadow: "0 0 28px rgba(0,255,157,.5), 0 4px 16px rgba(0,0,0,.3)",
              }}
            >
              {locale === "fr" ? "Lancer le Scan" : "Start Scan"}
            </button>
          </div>
        </div>
      )}

      {/* ══ RECON (AI analyzing) ══ */}
      {uiPhase === "recon" && (
        <div className="flex flex-col gap-3">
          <div
            ref={containerRef}
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

            {/* AI Recon status overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div
                className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl"
                style={{
                  background: "rgba(0,0,0,.65)",
                  border: "1px solid rgba(0,255,157,.25)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(0,255,157,.10)",
                    border: "1px solid rgba(0,255,157,.30)",
                    animation: "reconPulse 1.5s ease-in-out infinite",
                  }}
                >
                  <Scan size={24} strokeWidth={1.5} style={{ color: "#00ff9d" }} />
                </div>
                <p className="text-sm font-bold text-white/90">{reconText}</p>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "#00ff9d",
                        animation: `reconPulse 1s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recon progress label */}
          <div className="flex items-center justify-center">
            <div
              className="px-4 py-2 rounded-xl flex items-center gap-2"
              style={{ background: "rgba(0,255,157,.06)", border: "1px solid rgba(0,255,157,.12)" }}
            >
              <Scan size={14} style={{ color: "#00ff9d" }} />
              <p className="text-xs font-bold text-white/60">
                {locale === "fr"
                  ? "Phase 1 · Reconnaissance IA"
                  : "Phase 1 · AI Reconnaissance"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══ MAPPING (user places points) + CAPTURING ══ */}
      {(uiPhase === "mapping" || uiPhase === "capturing") && (
        <div className="flex flex-col gap-3">

          {/* Video + Overlay canvas */}
          <div
            ref={containerRef}
            className="relative w-full rounded-[1.75rem] overflow-hidden cursor-crosshair"
            style={{ aspectRatio: "4/3", background: "#000" }}
            onClick={uiPhase === "mapping" ? handleCanvasClick : undefined}
            onTouchStart={uiPhase === "mapping" ? handleCanvasClick : undefined}
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

            {/* Capture flash overlay */}
            {captureFlash && (
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  background: "rgba(0,255,157,0.15)",
                  animation: "captureFlash 0.2s ease-out forwards",
                }}
              />
            )}

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
                    ? "Lumière insuffisante"
                    : "Too dark"}
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

            {/* Point placement indicator */}
            {uiPhase === "mapping" && mapPoints.length < MAX_POINTS && (
              <div className="absolute bottom-2.5 left-0 right-0 flex justify-center z-20">
                <div
                  className="px-3 py-1.5 rounded-full flex items-center gap-2"
                  style={{ background: "rgba(0,0,0,.62)", border: "1px solid rgba(0,255,157,.30)" }}
                >
                  <Crosshair size={14} style={{ color: "#00ff9d" }} />
                  <p className="text-[11px] font-bold text-white/85">
                    {locale === "fr"
                      ? `Touchez pour placer le point ${mapPoints.length + 1}/${MAX_POINTS}`
                      : `Tap to place point ${mapPoints.length + 1}/${MAX_POINTS}`}
                  </p>
                </div>
              </div>
            )}

            {/* Capturing indicator */}
            {uiPhase === "capturing" && (
              <div className="absolute bottom-2.5 left-0 right-0 flex justify-center z-20">
                <div
                  className="px-4 py-2 rounded-full flex items-center gap-2"
                  style={{
                    background: "rgba(0,0,0,.72)",
                    border: "1px solid rgba(0,255,157,.40)",
                    boxShadow: "0 0 20px rgba(0,255,157,.2)",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: "#00ff9d",
                      animation: "reconPulse 0.5s ease-in-out infinite",
                      boxShadow: "0 0 8px #00ff9d",
                    }}
                  />
                  <p className="text-xs font-bold text-white/90">
                    {locale === "fr"
                      ? `Capture ${segmentCaptures}/${CAPTURES_PER_SEG} · ${segmentLabels[activeSegment - 1] || segmentLabels[0]}`
                      : `Capture ${segmentCaptures}/${CAPTURES_PER_SEG} · ${segmentLabels[activeSegment - 1] || segmentLabels[0]}`}
                  </p>
                </div>
              </div>
            )}

            {/* Frame gauge */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R + 5} fill="rgba(0,0,0,.52)" />
                {sectorArcs.map(({ i, path, captured }) => (
                  <path
                    key={i}
                    d={path}
                    fill={captured ? "#00ff9d" : "rgba(255,255,255,0.07)"}
                    style={{
                      filter: captured ? "drop-shadow(0 0 3px rgba(0,255,157,.6))" : "none",
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

            {/* Torch toggle */}
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
          </div>

          {/* Progress bar + segment indicators */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">
                {locale === "fr" ? "Cartographie Spatiale" : "Spatial Mapping"}
              </p>
              <p
                className="text-xs font-black"
                style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}
              >
                {frameCount} / {TARGET_FRAMES}
              </p>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${coverage}%`,
                  background: "linear-gradient(90deg,#059669,#00ff9d)",
                  boxShadow: "0 0 8px rgba(0,255,157,.55)",
                  transition: "width .3s ease",
                }}
              />
            </div>

            {/* Segment progress chips */}
            <div className="flex items-center gap-1.5 mt-1">
              {segmentLabels.map((label, i) => {
                const segStart = i * CAPTURES_PER_SEG + 1; // +1 for recon frame
                const segFrames = Math.max(0, Math.min(CAPTURES_PER_SEG, frameCount - segStart));
                const isActive = uiPhase === "capturing" && activeSegment === i + 1;
                const isComplete = segFrames >= CAPTURES_PER_SEG;

                return (
                  <div
                    key={label}
                    className="flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all"
                    style={{
                      background: isComplete
                        ? "rgba(0,255,157,.08)"
                        : isActive
                        ? "rgba(0,255,157,.04)"
                        : "rgba(255,255,255,.02)",
                      border: `1px solid ${
                        isComplete
                          ? "rgba(0,255,157,.25)"
                          : isActive
                          ? "rgba(0,255,157,.15)"
                          : "rgba(255,255,255,.05)"
                      }`,
                    }}
                  >
                    <p
                      className="text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        color: isComplete ? "#00ff9d" : isActive ? "rgba(0,255,157,.7)" : "rgba(255,255,255,.25)",
                      }}
                    >
                      {label}
                    </p>
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map(j => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full transition-all"
                          style={{
                            background: j < segFrames
                              ? "#00ff9d"
                              : "rgba(255,255,255,.10)",
                            boxShadow: j < segFrames
                              ? "0 0 4px rgba(0,255,157,.5)"
                              : "none",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-0.5">
              <p className="text-[10px] text-white/30 font-medium">
                {mapPoints.length}/{MAX_POINTS}{" "}
                {locale === "fr" ? "points placés" : "points placed"}
              </p>
              <p className="text-[10px] text-white/30 font-medium">
                {locale === "fr" ? "Détection de particules active" : "Particle detection active"}
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
              {locale === "fr" ? "Cartographie terminée !" : "Mapping complete!"}
            </p>
            <p className="text-sm text-white/50 font-medium">
              {locale === "fr"
                ? `${TARGET_FRAMES} clichés · ${MAX_POINTS} points · Cadre spatial reconstruit`
                : `${TARGET_FRAMES} frames · ${MAX_POINTS} points · Spatial frame reconstructed`}
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
