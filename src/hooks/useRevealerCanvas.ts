"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/* ══════════════════════════════════════════════════════════
   useRevealerCanvas — LIXUM Revealer Scan Engine
   ──────────────────────────────────────────────────────────
   Gyroscope-driven "scratch-card" reveal over the camera feed.
   • Dark holographic mask + matrix grid drawn on <canvas>
   • DeviceOrientationEvent (beta/gamma) → virtual cursor
   • destination-out composite → radial gradient eraser
   • Tracks % revealed, silently captures frames at thresholds
   • 60 fps via requestAnimationFrame
   ══════════════════════════════════════════════════════════ */

/* ── Configuration ── */
const MASK_COLOR          = "rgba(5,8,5,0.92)";
const GRID_COLOR          = "rgba(0,255,157,0.10)";
const GRID_SPACING        = 28;
const ERASER_RADIUS       = 52;
const ERASER_SOFT_EDGE    = 0.55;       // gradient falloff (0 = hard, 1 = very soft)
const SENSITIVITY_X       = 5.0;        // gamma → horizontal
const SENSITIVITY_Y       = 4.5;        // beta  → vertical
const SAMPLE_INTERVAL     = 6;          // sample transparency every N frames
const TOTAL_CAPTURES      = 10;
const CAPTURE_THRESHOLD   = 0.80;       // 80 % → success
const DESKTOP_SPEED       = 2.8;        // px per frame (mouse-fallback drift)

/* ── Capture threshold list: frame captured at 10%, 20%, … 100% ── */
const CAPTURE_PCTS = Array.from({ length: TOTAL_CAPTURES }, (_, i) =>
  Math.round(((i + 1) / TOTAL_CAPTURES) * 100)
);

/* ── Return type ── */
export interface RevealerState {
  /** 0–100 how much of the mask has been erased */
  revealedPct: number;
  /** Number of silently captured JPEG frames so far */
  capturedCount: number;
  /** true once revealedPct ≥ CAPTURE_THRESHOLD×100 */
  completed: boolean;
  /** true when gyroscope is available */
  gyroAvailable: boolean;
}

export interface UseRevealerCanvasOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Called once with the 10 base-64 JPEG frames when reveal completes */
  onComplete: (frames: string[]) => void;
  /** Enable/disable the engine (e.g. false while on intro screen) */
  enabled: boolean;
}

/* ══════════════════════════════════════════════════════════ */
export function useRevealerCanvas({
  canvasRef,
  videoRef,
  onComplete,
  enabled,
}: UseRevealerCanvasOptions): RevealerState {
  /* ── Mutable refs (no re-renders on every frame) ── */
  const cursorX       = useRef(0.5);   // normalised 0-1
  const cursorY       = useRef(0.5);
  const rafId         = useRef(0);
  const frameTick     = useRef(0);
  const maskDrawn     = useRef(false);
  const captures      = useRef<string[]>([]);
  const nextCapIdx    = useRef(0);
  const completedRef  = useRef(false);
  const captureCanvas = useRef<HTMLCanvasElement | null>(null);
  const gyroRef       = useRef(false);
  const betaBase      = useRef<number | null>(null);
  const gammaBase     = useRef<number | null>(null);
  // desktop fallback: mouse position
  const mouseX        = useRef<number | null>(null);
  const mouseY        = useRef<number | null>(null);
  const driftAngle    = useRef(Math.random() * Math.PI * 2);

  /* ── Exposed state (updated sparingly) ── */
  const [revealedPct,   setRevealedPct]   = useState(0);
  const [capturedCount, setCapturedCount] = useState(0);
  const [completed,     setCompleted]     = useState(false);
  const [gyroAvailable, setGyroAvailable] = useState(false);

  /* ── Draw the initial mask + matrix grid ── */
  const drawMask = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    /* Dark base */
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = MASK_COLOR;
    ctx.fillRect(0, 0, W, H);

    /* Matrix grid lines */
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth   = 0.5;
    for (let x = 0; x <= W; x += GRID_SPACING) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += GRID_SPACING) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* Node dots at intersections */
    ctx.fillStyle = "rgba(0,255,157,0.14)";
    for (let x = 0; x <= W; x += GRID_SPACING) {
      for (let y = 0; y <= H; y += GRID_SPACING) {
        ctx.beginPath();
        ctx.arc(x, y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    maskDrawn.current = true;
  }, []);

  /* ── Erase a soft circle at (px, py) ── */
  const eraseAt = useCallback((ctx: CanvasRenderingContext2D, px: number, py: number) => {
    ctx.globalCompositeOperation = "destination-out";
    const grad = ctx.createRadialGradient(px, py, ERASER_RADIUS * ERASER_SOFT_EDGE, px, py, ERASER_RADIUS);
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, ERASER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, []);

  /* ── Sample transparency % of the canvas ── */
  const sampleRevealed = useCallback((ctx: CanvasRenderingContext2D): number => {
    /* Down-sample to 64×48 for speed */
    const sw = 64, sh = 48;
    const tmp = document.createElement("canvas");
    tmp.width = sw; tmp.height = sh;
    const tctx = tmp.getContext("2d")!;
    tctx.drawImage(ctx.canvas, 0, 0, sw, sh);
    const { data } = tctx.getImageData(0, 0, sw, sh);
    let transparent = 0;
    const total = sw * sh;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 30) transparent++; // alpha near 0 = erased
    }
    return Math.round((transparent / total) * 100);
  }, []);

  /* ── Capture a JPEG from the live video ── */
  const captureFrame = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    if (!captureCanvas.current) {
      captureCanvas.current = document.createElement("canvas");
    }
    const cc = captureCanvas.current;
    cc.width  = Math.min(v.videoWidth,  640);
    cc.height = Math.min(v.videoHeight, 480);
    cc.getContext("2d")?.drawImage(v, 0, 0, cc.width, cc.height);
    captures.current.push(cc.toDataURL("image/jpeg", 0.75));
    setCapturedCount(captures.current.length);
  }, [videoRef]);

  /* ── Main animation loop ── */
  const loop = useCallback(() => {
    if (completedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) { rafId.current = requestAnimationFrame(loop); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { rafId.current = requestAnimationFrame(loop); return; }
    const W = canvas.width, H = canvas.height;

    /* First frame: draw the mask */
    if (!maskDrawn.current) {
      drawMask(ctx, W, H);
    }

    /* Move cursor via gyro values (already updated by event listener) */
    const px = cursorX.current * W;
    const py = cursorY.current * H;

    /* Erase under cursor */
    eraseAt(ctx, px, py);

    frameTick.current++;

    /* Periodically sample revealed % */
    if (frameTick.current % SAMPLE_INTERVAL === 0) {
      const pct = sampleRevealed(ctx);
      setRevealedPct(pct);

      /* Silent frame capture at each 10 % increment */
      if (nextCapIdx.current < CAPTURE_PCTS.length && pct >= CAPTURE_PCTS[nextCapIdx.current]) {
        captureFrame();
        nextCapIdx.current++;
      }

      /* Completion check */
      if (pct >= CAPTURE_THRESHOLD * 100 && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true);
        /* Ensure we have at least TOTAL_CAPTURES frames */
        while (captures.current.length < TOTAL_CAPTURES) captureFrame();
        onComplete([...captures.current].slice(0, TOTAL_CAPTURES));
        return; // stop loop
      }
    }

    rafId.current = requestAnimationFrame(loop);
  }, [canvasRef, drawMask, eraseAt, sampleRevealed, captureFrame, onComplete]);

  /* ── DeviceOrientation handler ── */
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const beta  = e.beta  ?? 0;  // -180 to 180 (front-back tilt)
    const gamma = e.gamma ?? 0;  // -90 to 90  (left-right tilt)

    /* Record baseline on first reading */
    if (betaBase.current === null)  betaBase.current  = beta;
    if (gammaBase.current === null) gammaBase.current = gamma;

    /* Delta from baseline, mapped to 0-1 */
    const dx = (gamma - gammaBase.current) * SENSITIVITY_X / 180;
    const dy = (beta  - betaBase.current)  * SENSITIVITY_Y / 180;

    cursorX.current = Math.max(0, Math.min(1, 0.5 + dx));
    cursorY.current = Math.max(0, Math.min(1, 0.5 + dy));
  }, []);

  /* ── Mouse fallback for desktop (move cursor towards mouse) ── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseX.current = (e.clientX - rect.left) / rect.width;
    mouseY.current = (e.clientY - rect.top)  / rect.height;
  }, [canvasRef]);

  /* ── Desktop drift (auto-move when no gyro and no mouse) ── */
  useEffect(() => {
    if (!enabled || gyroRef.current) return;
    const id = setInterval(() => {
      if (mouseX.current !== null && mouseY.current !== null) {
        /* Lerp towards mouse */
        cursorX.current += (mouseX.current - cursorX.current) * 0.08;
        cursorY.current += (mouseY.current - cursorY.current) * 0.08;
      } else {
        /* Random drift */
        driftAngle.current += (Math.random() - 0.5) * 0.3;
        cursorX.current = Math.max(0, Math.min(1,
          cursorX.current + Math.cos(driftAngle.current) * DESKTOP_SPEED / 500));
        cursorY.current = Math.max(0, Math.min(1,
          cursorY.current + Math.sin(driftAngle.current) * DESKTOP_SPEED / 500));
      }
    }, 16);
    return () => clearInterval(id);
  }, [enabled]);

  /* ── Resize canvas to match container ── */
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const { width, height } = c.getBoundingClientRect();
      if (c.width !== Math.round(width) || c.height !== Math.round(height)) {
        c.width  = Math.round(width);
        c.height = Math.round(height);
        maskDrawn.current = false; // redraw mask after resize
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [canvasRef]);

  /* ── Start / stop the engine ── */
  useEffect(() => {
    if (!enabled) return;

    /* Reset state */
    maskDrawn.current    = false;
    completedRef.current = false;
    captures.current     = [];
    nextCapIdx.current   = 0;
    frameTick.current    = 0;
    betaBase.current     = null;
    gammaBase.current    = null;
    cursorX.current      = 0.5;
    cursorY.current      = 0.5;
    setRevealedPct(0);
    setCapturedCount(0);
    setCompleted(false);

    /* Attempt gyroscope */
    const tryGyro = async () => {
      /* iOS 13+ requires explicit permission */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const DOE = DeviceOrientationEvent as any;
      if (typeof DOE.requestPermission === "function") {
        try {
          const perm = await DOE.requestPermission();
          if (perm !== "granted") return false;
        } catch { return false; }
      }
      if (!("DeviceOrientationEvent" in window)) return false;
      window.addEventListener("deviceorientation", handleOrientation);
      gyroRef.current = true;
      setGyroAvailable(true);
      return true;
    };

    tryGyro().then(hasGyro => {
      if (!hasGyro) {
        /* Desktop fallback: follow mouse */
        window.addEventListener("mousemove", handleMouseMove);
      }
    });

    /* Start render loop */
    rafId.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [enabled, handleOrientation, handleMouseMove, loop]);

  return { revealedPct, capturedCount, completed, gyroAvailable };
}
