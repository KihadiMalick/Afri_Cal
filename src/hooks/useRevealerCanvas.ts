"use client";

import { useEffect, useRef, useCallback, useState } from "react";

/* ══════════════════════════════════════════════════════════
   useRevealerCanvas — LIXUM Scratch-Card Engine v2
   ──────────────────────────────────────────────────────────
   • Silver/gold scratch-card mask over camera feed
   • Touch scratching (primary) + gyroscope + mouse fallback
   • Central golden circle "scratch zone" with hint reveal
   • Confetti particles on the mask (gold, white, green)
   • destination-out erasing with soft radial gradient
   • Tracks % revealed, silently captures frames at thresholds
   • 60 fps via requestAnimationFrame
   ══════════════════════════════════════════════════════════ */

/* ── Configuration ── */
const ERASER_RADIUS       = 38;          // finger scratch size
const ERASER_SOFT_EDGE    = 0.45;
const SENSITIVITY_X       = 5.0;
const SENSITIVITY_Y       = 4.5;
const SAMPLE_INTERVAL     = 8;
const TOTAL_CAPTURES      = 10;
const CAPTURE_THRESHOLD   = 0.80;
const HINT_RADIUS         = 45;          // initial peek circle radius
const CONFETTI_COUNT      = 90;

/* ── Capture pct list: 10%, 20%, … 100% ── */
const CAPTURE_PCTS = Array.from({ length: TOTAL_CAPTURES }, (_, i) =>
  Math.round(((i + 1) / TOTAL_CAPTURES) * 100)
);

/* ── Confetti dot ── */
interface ConfettiDot {
  x: number; y: number; r: number;
  color: string;
}

/* ── Return type ── */
export interface RevealerState {
  revealedPct: number;
  capturedCount: number;
  completed: boolean;
  gyroAvailable: boolean;
  touchActive: boolean;
}

export interface UseRevealerCanvasOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onComplete: (frames: string[]) => void;
  enabled: boolean;
}

/* ══════════════════════════════════════════════════════════ */
export function useRevealerCanvas({
  canvasRef,
  videoRef,
  onComplete,
  enabled,
}: UseRevealerCanvasOptions): RevealerState {
  const cursorX       = useRef(0.5);
  const cursorY       = useRef(0.5);
  const isTouching    = useRef(false);
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
  const confettiRef   = useRef<ConfettiDot[]>([]);

  const [revealedPct,   setRevealedPct]   = useState(0);
  const [capturedCount, setCapturedCount] = useState(0);
  const [completed,     setCompleted]     = useState(false);
  const [gyroAvailable, setGyroAvailable] = useState(false);
  const [touchActive,   setTouchActive]   = useState(false);

  /* ── Generate confetti dots (once) ── */
  const generateConfetti = useCallback((W: number, H: number) => {
    const dots: ConfettiDot[] = [];
    const colors = [
      "rgba(212,175,55,0.7)",   // gold
      "rgba(212,175,55,0.4)",   // gold faded
      "rgba(255,255,255,0.5)",  // white
      "rgba(255,255,255,0.25)", // white faded
      "rgba(0,255,157,0.35)",   // neon green
      "rgba(180,150,50,0.5)",   // darker gold
    ];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      dots.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 3.5 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    confettiRef.current = dots;
  }, []);

  /* ── Draw the scratch-card mask ── */
  const drawMask = useCallback((ctx: CanvasRenderingContext2D, W: number, H: number) => {
    ctx.globalCompositeOperation = "source-over";

    /* Silver/dark metallic base — scratch card surface */
    const baseGrad = ctx.createLinearGradient(0, 0, W, H);
    baseGrad.addColorStop(0,    "rgba(42,47,42,0.96)");
    baseGrad.addColorStop(0.3,  "rgba(55,60,55,0.94)");
    baseGrad.addColorStop(0.5,  "rgba(48,53,48,0.96)");
    baseGrad.addColorStop(0.7,  "rgba(58,63,58,0.94)");
    baseGrad.addColorStop(1,    "rgba(40,45,40,0.96)");
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, W, H);

    /* Subtle cross-hatch texture */
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W + H; x += 6) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - H, H); ctx.stroke();
    }

    /* Confetti dots scattered across */
    if (confettiRef.current.length === 0) generateConfetti(W, H);
    for (const dot of confettiRef.current) {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
      ctx.fillStyle = dot.color;
      ctx.fill();
    }

    /* ── Central golden scratch zone ── */
    const cx = W / 2, cy = H / 2;
    const zoneR = Math.min(W, H) * 0.20;

    /* Outer glow ring */
    const glowGrad = ctx.createRadialGradient(cx, cy, zoneR * 0.6, cx, cy, zoneR * 1.3);
    glowGrad.addColorStop(0, "rgba(212,175,55,0.00)");
    glowGrad.addColorStop(0.7, "rgba(212,175,55,0.10)");
    glowGrad.addColorStop(1, "rgba(212,175,55,0.00)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(cx - zoneR * 1.4, cy - zoneR * 1.4, zoneR * 2.8, zoneR * 2.8);

    /* Dashed gold circle */
    ctx.setLineDash([8, 5]);
    ctx.strokeStyle = "rgba(212,175,55,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, zoneR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    /* Inner solid circle border */
    ctx.strokeStyle = "rgba(212,175,55,0.30)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, zoneR * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    /* Scratch icon (crosshairs) */
    const iconSize = zoneR * 0.3;
    ctx.strokeStyle = "rgba(212,175,55,0.45)";
    ctx.lineWidth = 1.5;
    /* Horizontal */
    ctx.beginPath();
    ctx.moveTo(cx - iconSize, cy);
    ctx.lineTo(cx + iconSize, cy);
    ctx.stroke();
    /* Vertical */
    ctx.beginPath();
    ctx.moveTo(cx, cy - iconSize);
    ctx.lineTo(cx, cy + iconSize);
    ctx.stroke();
    /* Small center dot */
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(212,175,55,0.6)";
    ctx.fill();

    /* "Grattez ici" text */
    ctx.font = `bold ${Math.max(11, Math.round(zoneR * 0.17))}px 'Courier New', monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(212,175,55,0.60)";
    ctx.fillText("GRATTEZ ICI", cx, cy + zoneR + 20);

    /* Tiny hint: pre-erase a small circle so camera peeks through */
    ctx.globalCompositeOperation = "destination-out";
    const hintGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, HINT_RADIUS);
    hintGrad.addColorStop(0, "rgba(0,0,0,0.60)");  // center: semi-transparent
    hintGrad.addColorStop(0.6, "rgba(0,0,0,0.25)");
    hintGrad.addColorStop(1, "rgba(0,0,0,0)");       // edge: no erase
    ctx.fillStyle = hintGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, HINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    /* Corner decorative brackets */
    const m = 14, bLen = 28;
    ctx.strokeStyle = "rgba(212,175,55,0.25)";
    ctx.lineWidth = 1.5;
    const corners: [number, number, number, number][] = [
      [m, m, 1, 1], [W - m, m, -1, 1],
      [m, H - m, 1, -1], [W - m, H - m, -1, -1],
    ];
    for (const [x, y, sx, sy] of corners) {
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * bLen, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * bLen); ctx.stroke();
    }

    maskDrawn.current = true;
  }, [generateConfetti]);

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

  /* ── Sample transparency % ── */
  const sampleRevealed = useCallback((ctx: CanvasRenderingContext2D): number => {
    const sw = 64, sh = 48;
    const tmp = document.createElement("canvas");
    tmp.width = sw; tmp.height = sh;
    const tctx = tmp.getContext("2d")!;
    tctx.drawImage(ctx.canvas, 0, 0, sw, sh);
    const { data } = tctx.getImageData(0, 0, sw, sh);
    let transparent = 0;
    const total = sw * sh;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 30) transparent++;
    }
    return Math.round((transparent / total) * 100);
  }, []);

  /* ── Capture JPEG from video ── */
  const captureFrame = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.readyState < 2) return;
    if (!captureCanvas.current) captureCanvas.current = document.createElement("canvas");
    const cc = captureCanvas.current;
    cc.width  = Math.min(v.videoWidth,  640);
    cc.height = Math.min(v.videoHeight, 480);
    cc.getContext("2d")?.drawImage(v, 0, 0, cc.width, cc.height);
    captures.current.push(cc.toDataURL("image/jpeg", 0.75));
    setCapturedCount(captures.current.length);
  }, [videoRef]);

  /* ── Touch → move cursor immediately (like real scratching) ── */
  const handleTouch = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || completedRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    cursorX.current = (touch.clientX - rect.left) / rect.width;
    cursorY.current = (touch.clientY - rect.top)  / rect.height;
    isTouching.current = true;
    setTouchActive(true);
  }, [canvasRef]);

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
    setTouchActive(false);
  }, []);

  /* ── Mouse → move cursor (desktop) ── */
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    cursorX.current = (e.clientX - rect.left) / rect.width;
    cursorY.current = (e.clientY - rect.top)  / rect.height;
    isTouching.current = true;
    setTouchActive(true);
  }, [canvasRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isTouching.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    cursorX.current = (e.clientX - rect.left) / rect.width;
    cursorY.current = (e.clientY - rect.top)  / rect.height;
  }, [canvasRef]);

  const handleMouseUp = useCallback(() => {
    isTouching.current = false;
    setTouchActive(false);
  }, []);

  /* ── Animation loop ── */
  const loop = useCallback(() => {
    if (completedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) { rafId.current = requestAnimationFrame(loop); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx) { rafId.current = requestAnimationFrame(loop); return; }
    const W = canvas.width, H = canvas.height;

    if (!maskDrawn.current) drawMask(ctx, W, H);

    /* Only erase when user is touching / gyro active */
    if (isTouching.current || gyroRef.current) {
      const px = cursorX.current * W;
      const py = cursorY.current * H;
      eraseAt(ctx, px, py);
    }

    frameTick.current++;

    if (frameTick.current % SAMPLE_INTERVAL === 0) {
      const pct = sampleRevealed(ctx);
      setRevealedPct(pct);

      if (nextCapIdx.current < CAPTURE_PCTS.length && pct >= CAPTURE_PCTS[nextCapIdx.current]) {
        captureFrame();
        nextCapIdx.current++;
      }

      if (pct >= CAPTURE_THRESHOLD * 100 && !completedRef.current) {
        completedRef.current = true;
        setCompleted(true);
        while (captures.current.length < TOTAL_CAPTURES) captureFrame();
        onComplete([...captures.current].slice(0, TOTAL_CAPTURES));
        return;
      }
    }

    rafId.current = requestAnimationFrame(loop);
  }, [canvasRef, drawMask, eraseAt, sampleRevealed, captureFrame, onComplete]);

  /* ── DeviceOrientation (gyroscope) ── */
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const beta  = e.beta  ?? 0;
    const gamma = e.gamma ?? 0;
    if (betaBase.current === null)  betaBase.current  = beta;
    if (gammaBase.current === null) gammaBase.current = gamma;
    const dx = (gamma - gammaBase.current) * SENSITIVITY_X / 180;
    const dy = (beta  - betaBase.current)  * SENSITIVITY_Y / 180;
    cursorX.current = Math.max(0, Math.min(1, 0.5 + dx));
    cursorY.current = Math.max(0, Math.min(1, 0.5 + dy));
  }, []);

  /* ── Canvas resize ── */
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      const { width, height } = c.getBoundingClientRect();
      if (c.width !== Math.round(width) || c.height !== Math.round(height)) {
        c.width  = Math.round(width);
        c.height = Math.round(height);
        maskDrawn.current = false;
        confettiRef.current = [];
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [canvasRef]);

  /* ── Start / stop engine ── */
  useEffect(() => {
    if (!enabled) return;

    maskDrawn.current    = false;
    completedRef.current = false;
    captures.current     = [];
    nextCapIdx.current   = 0;
    frameTick.current    = 0;
    betaBase.current     = null;
    gammaBase.current    = null;
    cursorX.current      = 0.5;
    cursorY.current      = 0.5;
    confettiRef.current  = [];
    setRevealedPct(0);
    setCapturedCount(0);
    setCompleted(false);

    const canvas = canvasRef.current;

    /* Attach touch listeners directly to canvas */
    if (canvas) {
      canvas.addEventListener("touchstart",  handleTouch,    { passive: false });
      canvas.addEventListener("touchmove",   handleTouch,    { passive: false });
      canvas.addEventListener("touchend",    handleTouchEnd);
      canvas.addEventListener("touchcancel", handleTouchEnd);
      canvas.addEventListener("mousedown",   handleMouseDown);
      canvas.addEventListener("mousemove",   handleMouseMove);
      canvas.addEventListener("mouseup",     handleMouseUp);
      canvas.addEventListener("mouseleave",  handleMouseUp);
    }

    /* Attempt gyroscope */
    const tryGyro = async () => {
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
    tryGyro();

    rafId.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener("deviceorientation", handleOrientation);
      if (canvas) {
        canvas.removeEventListener("touchstart",  handleTouch);
        canvas.removeEventListener("touchmove",   handleTouch);
        canvas.removeEventListener("touchend",    handleTouchEnd);
        canvas.removeEventListener("touchcancel", handleTouchEnd);
        canvas.removeEventListener("mousedown",   handleMouseDown);
        canvas.removeEventListener("mousemove",   handleMouseMove);
        canvas.removeEventListener("mouseup",     handleMouseUp);
        canvas.removeEventListener("mouseleave",  handleMouseUp);
      }
    };
  }, [enabled, canvasRef, handleTouch, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp, handleOrientation, loop]);

  return { revealedPct, capturedCount, completed, gyroAvailable, touchActive };
}
