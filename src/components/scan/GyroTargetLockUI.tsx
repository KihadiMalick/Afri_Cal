"use client";

import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import { X, Check, Eye, Smartphone, Utensils } from "lucide-react";
import { useQuietCameraCapture } from "@/hooks/useQuietCameraCapture";

/* ══════════════════════════════════════════════════════════
   LIXUM Gyro·Target·Lock  —  Ball-on-Rail Edition
   ──────────────────────────────────────────────────────────
   Camera feed always visible behind a transparent HUD.
   4 tube-rails radiate from screen center (top / left / right / bottom).
   A glowing ball rolls along the active rail as the phone tilts.
   Cross-tilt > threshold → ball falls off (reset, retry).
   Dwell 1 s at target sphere → 3 silent JPEG frames.
   4 angles × 3 frames = 12 total → onComplete().
   ══════════════════════════════════════════════════════════ */

const STYLES = `
@keyframes gtlFloat  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-5px)} }
@keyframes gtlAppear { from{opacity:0;transform:scale(.4)} to{opacity:1;transform:scale(1)} }
@keyframes gtlFlash  { 0%{opacity:.65} 100%{opacity:0} }
@keyframes gtlFall   { 0%{opacity:1;transform:scale(1)} 55%{opacity:.2;transform:scale(2.4)} 100%{opacity:0;transform:scale(.1)} }
@keyframes gtlReset  { from{opacity:0;transform:scale(.15)} to{opacity:1;transform:scale(1)} }
@keyframes gtlGlow   { 0%,100%{box-shadow:0 0 10px rgba(0,255,157,.85),0 0 22px rgba(0,255,157,.3)}
                       50%{box-shadow:0 0 20px rgba(0,255,157,1),0 0 38px rgba(0,255,157,.55)} }
@keyframes gtlPulse  { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:1;transform:scale(1.1)} }
@keyframes gtlSpin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
`;

/* ── Config ── */
const TOTAL_TARGETS    = 4;
const FRAMES_PER_ANGLE = 3;
const DWELL_MS         = 1000;
const BALL_SENS        = 1 / 28;   // 1° tilt → fraction of rail
const FALL_THRESHOLD   = 15;       // perpendicular degrees before fall
const RING_R           = 40;
const RING_C           = 2 * Math.PI * RING_R;

/* ── Target definitions ── */
interface Target {
  id:      string;
  labelFr: string; labelEn: string;
  hintFr:  string; hintEn:  string;
  x: number; y: number;           // normalised screen pos of sphere
  axis: "beta" | "gamma";        // gyro axis that drives ball forward
  dir:  1 | -1;                  // positive delta in this direction → progress++
}

/* Center = (0.5, 0.5) */
const CX = 0.5, CY = 0.5;

const TARGETS: Target[] = [
  { id:"top",    labelFr:"Dessus",  labelEn:"Top",    x:CX,   y:.22,
    hintFr:"Inclinez en avant",   hintEn:"Tilt forward",  axis:"beta",  dir:-1 },
  { id:"left",   labelFr:"Gauche",  labelEn:"Left",   x:.18,  y:CY,
    hintFr:"Inclinez à gauche",   hintEn:"Tilt left",     axis:"gamma", dir:-1 },
  { id:"right",  labelFr:"Droite",  labelEn:"Right",  x:.82,  y:CY,
    hintFr:"Inclinez à droite",   hintEn:"Tilt right",    axis:"gamma", dir:1  },
  { id:"bottom", labelFr:"Dessous", labelEn:"Bottom", x:CX,   y:.78,
    hintFr:"Inclinez en arrière", hintEn:"Tilt back",     axis:"beta",  dir:1  },
];

/* Rail extents from center (normalised) */
const RAIL = {
  top:    CY - 0.22,   // 28%  upward
  bottom: 0.78 - CY,   // 28%  downward
  left:   CX - 0.18,   // 32%  leftward
  right:  0.82 - CX,   // 32%  rightward
};

/* ── Props ── */
export interface GyroTargetLockUIProps {
  onComplete: (frames: string[]) => void;
  onCancel:   () => void;
  locale:     "fr" | "en";
}

type Phase = "intro" | "capture" | "success";

/* ════════════════════════════════════════════════════════ */
export default function GyroTargetLockUI({ onComplete, onCancel, locale }: GyroTargetLockUIProps) {

  const { videoRef, cameraError, startCamera, stopCamera, captureFrame } =
    useQuietCameraCapture();

  /* ── React state ── */
  const [phase,       setPhase]       = useState<Phase>("intro");
  const [targetIdx,   setTargetIdx]   = useState(0);
  const [lockedCount, setLockedCount] = useState(0);
  const [lockFlash,   setLockFlash]   = useState(false);
  const [gyroAvail,   setGyroAvail]   = useState(false);
  const [sphereVis,   setSphereVis]   = useState(true);
  /* ball animation state */
  const [ballAnim,    setBallAnim]    = useState<"glow"|"fall"|"reset">("glow");

  /* ── Hot-path refs ── */
  const betaBase    = useRef<number | null>(null);
  const gammaBase   = useRef<number | null>(null);
  const dwellStart  = useRef<number | null>(null);
  const framesStore = useRef<string[]>([]);
  const idxRef      = useRef(0);
  const lockingRef  = useRef(false);
  const fallingRef  = useRef(false);
  const phaseRef    = useRef<Phase>("intro");
  const captureRef  = useRef(captureFrame);
  const rafRef      = useRef<number>();
  const betaRef     = useRef(0);
  const gammaRef    = useRef(0);

  /* ── DOM refs for direct manipulation (no React re-renders in hot path) ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef      = useRef<HTMLDivElement>(null);
  const dwellArcRef  = useRef<SVGCircleElement>(null);

  /* keep captureRef fresh */
  captureRef.current = captureFrame;

  /* ── Cleanup ── */
  useEffect(() => () => {
    stopCamera();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [stopCamera]);

  /* ── Lock handler ── */
  const handleLock = useCallback(() => {
    if (lockingRef.current) return;
    lockingRef.current = true;

    /* Silent burst capture */
    for (let i = 0; i < FRAMES_PER_ANGLE; i++) {
      const f = captureRef.current();
      if (f) framesStore.current.push(f);
    }

    setLockFlash(true);
    setTimeout(() => setLockFlash(false), 400);

    const next = idxRef.current + 1;
    if (next >= TOTAL_TARGETS) {
      setPhase("success");
      phaseRef.current = "success";
      setTimeout(() => onComplete(framesStore.current), 1600);
    } else {
      setSphereVis(false);
      setTimeout(() => {
        idxRef.current     = next;
        betaBase.current   = null;
        gammaBase.current  = null;
        dwellStart.current = null;
        lockingRef.current = false;
        fallingRef.current = false;
        setLockedCount(next);
        setTargetIdx(next);
        setSphereVis(true);
        setBallAnim("reset");
        setTimeout(() => setBallAnim("glow"), 50);
      }, 600);
    }
  }, [onComplete]);

  /* ── RAF loop ── */
  const loopRef = useRef<() => void>();
  loopRef.current = () => {
    if (phaseRef.current !== "capture") return;

    const container = containerRef.current;
    const ball      = ballRef.current;

    if (!container || !ball) {
      rafRef.current = requestAnimationFrame(() => loopRef.current?.());
      return;
    }

    const { width, height } = container.getBoundingClientRect();
    const t     = TARGETS[idxRef.current];
    const beta  = betaRef.current;
    const gamma = gammaRef.current;

    /* Establish baseline on first frame of each target */
    if (betaBase.current  === null) betaBase.current  = beta;
    if (gammaBase.current === null) gammaBase.current = gamma;

    const dBeta  = beta  - betaBase.current;
    const dGamma = gamma - gammaBase.current;

    /* Decompose into primary (along rail) and perpendicular */
    const primaryDelta = (t.axis === "beta"  ? dBeta  : dGamma) * t.dir;
    const perpAbs      = Math.abs(t.axis === "beta" ? dGamma : dBeta);

    /* Progress: 0 = center, 1 = at target sphere */
    const progress = Math.max(-0.12, Math.min(1.1, primaryDelta * BALL_SENS * 3));

    /* Fall detection: too much cross-tilt while rolling */
    if (!fallingRef.current && !lockingRef.current && perpAbs > FALL_THRESHOLD && progress > 0.12) {
      fallingRef.current = true;
      setBallAnim("fall");
      setTimeout(() => {
        fallingRef.current = false;
        betaBase.current   = null;
        gammaBase.current  = null;
        dwellStart.current = null;
        if (dwellArcRef.current)
          dwellArcRef.current.style.strokeDashoffset = String(RING_C);
        setBallAnim("reset");
        setTimeout(() => setBallAnim("glow"), 50);
      }, 700);
    }

    if (!fallingRef.current) {
      /* Ball screen position: lerp from center toward target */
      const bx = CX * width  + progress * (t.x * width  - CX * width);
      const by = CY * height + progress * (t.y * height - CY * height);

      ball.style.left = `${bx}px`;
      ball.style.top  = `${by}px`;

      /* Dwell check */
      if (!lockingRef.current) {
        const dx  = bx - t.x * width;
        const dy  = by - t.y * height;
        const d   = Math.sqrt(dx * dx + dy * dy);
        const thr = 0.11 * Math.min(width, height);

        if (d < thr) {
          if (!dwellStart.current) dwellStart.current = Date.now();
          const pct = Math.min(100, (Date.now() - dwellStart.current) / DWELL_MS * 100);
          if (dwellArcRef.current)
            dwellArcRef.current.style.strokeDashoffset = String(RING_C * (1 - pct / 100));
          if (pct >= 100) handleLock();
        } else {
          dwellStart.current = null;
          if (dwellArcRef.current)
            dwellArcRef.current.style.strokeDashoffset = String(RING_C);
        }
      }
    }

    rafRef.current = requestAnimationFrame(() => loopRef.current?.());
  };

  /* ── Gyroscope handler ── */
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    betaRef.current  = e.beta  ?? 0;
    gammaRef.current = e.gamma ?? 0;
  }, []);

  /* ── Mouse fallback (maps cursor position to virtual tilt angles) ── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    gammaRef.current = ((e.clientX - r.left) / r.width  - 0.5) * 80;
    betaRef.current  = ((e.clientY - r.top)  / r.height - 0.5) * 80;
  }, []);

  /* ── Start ── */
  const handleStart = useCallback(async () => {
    /* Camera starts while video element is already mounted (no videoRef = null issue) */
    await startCamera();

    /* Gyroscope permission (iOS 13+) */
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE.requestPermission === "function") {
      try {
        const p = await DOE.requestPermission();
        if (p === "granted") {
          window.addEventListener("deviceorientation", handleOrientation as EventListener);
          setGyroAvail(true);
        } else {
          window.addEventListener("mousemove", handleMouseMove);
        }
      } catch {
        window.addEventListener("mousemove", handleMouseMove);
      }
    } else if (typeof DeviceOrientationEvent !== "undefined") {
      window.addEventListener("deviceorientation", handleOrientation as EventListener);
      setGyroAvail(true);
    } else {
      window.addEventListener("mousemove", handleMouseMove);
    }

    phaseRef.current = "capture";
    setPhase("capture");
    rafRef.current = requestAnimationFrame(() => loopRef.current?.());
  }, [startCamera, handleOrientation, handleMouseMove]);

  /* ── Cleanup listeners on phase exit ── */
  useEffect(() => {
    if (phase !== "capture") {
      window.removeEventListener("deviceorientation", handleOrientation as EventListener);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [phase, handleOrientation, handleMouseMove]);

  const syncPct  = (lockedCount / TOTAL_TARGETS) * 100;
  const currentT = TARGETS[targetIdx];

  /* ── Rail style helper ── */
  const railStyle = (idx: number, base: object): CSSProperties => ({
    ...base,
    background:  targetIdx === idx ? "rgba(0,255,157,.10)" : "rgba(255,255,255,.04)",
    border:      `1px solid ${targetIdx === idx ? "rgba(0,255,157,.38)" : "rgba(255,255,255,.07)"}`,
    boxShadow:   targetIdx === idx ? "0 0 14px rgba(0,255,157,.18)" : "none",
  } as CSSProperties);

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}>
      <style>{STYLES}</style>

      {/* Close */}
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 z-50 p-2 rounded-full"
        style={{ background: "rgba(0,0,0,.55)", color: "rgba(255,255,255,.65)" }}
        aria-label="Close"
      >
        <X size={17} strokeWidth={2} />
      </button>

      <div className="flex flex-col gap-3">

        {/* ══════════════════════════════════════════════════
            CAMERA CONTAINER — always mounted so videoRef is
            live when startCamera() is called from intro phase
            ══════════════════════════════════════════════════ */}
        <div
          ref={containerRef}
          className="relative w-full rounded-[1.75rem] overflow-hidden"
          style={{ aspectRatio: "3/4", background: "#000" }}
        >
          {/* ── Live camera feed ── */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline muted autoPlay
          />

          {/* ══ INTRO overlay (semi-transparent so camera is hinted below) ══ */}
          {phase === "intro" && (
            <div
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 px-6 text-center"
              style={{ background: "rgba(5,10,8,0.91)", backdropFilter: "blur(3px)" }}
            >
              {/* Icon */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(0,255,157,.07)", border: "1px solid rgba(0,255,157,.28)",
                  boxShadow: "0 0 32px rgba(0,255,157,.18)", animation: "gtlFloat 3s ease-in-out infinite",
                }}
              >
                <Utensils size={36} strokeWidth={1.4} style={{ color: "#00ff9d", filter: "drop-shadow(0 0 8px #00ff9d)" }} />
              </div>

              {/* Title */}
              <div>
                <p className="font-black text-2xl tracking-[.18em] leading-none mb-1"
                  style={{ fontFamily: "'Courier New',monospace" }}>
                  <span style={{ color: "#8b949e" }}>LI</span>
                  <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d" }}>X</span>
                  <span style={{ color: "#8b949e" }}>UM</span>
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[.25em]"
                  style={{ color: "rgba(0,255,157,.55)" }}>
                  Gyro · Target · Lock
                </p>
              </div>

              {/* ① Position above food */}
              <div className="w-full max-w-xs px-4 py-3 rounded-2xl text-left"
                style={{ background: "rgba(0,255,157,.07)", border: "1px solid rgba(0,255,157,.22)" }}>
                <p className="text-[11px] font-black uppercase tracking-wider mb-1.5"
                  style={{ color: "rgba(0,255,157,.8)" }}>
                  {locale === "fr" ? "① Avant de commencer" : "① Before you start"}
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  {locale === "fr"
                    ? "Placez le téléphone à la verticale au-dessus de votre plat, caméra pointée vers le bas."
                    : "Hold your phone vertically above your dish, camera pointing down."}
                </p>
              </div>

              {/* ② How it works */}
              <p className="text-white/40 text-xs max-w-xs leading-relaxed">
                {locale === "fr"
                  ? "② Guidez la boule le long du rail en inclinant doucement le téléphone. Une inclinaison latérale fera tomber la boule."
                  : "② Guide the ball along the rail by tilting gently. Excessive cross-tilt will drop the ball."}
              </p>

              <button
                onClick={handleStart}
                className="px-10 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase text-black transition-all active:scale-[.97]"
                style={{ background: "#00ff9d", boxShadow: "0 0 28px rgba(0,255,157,.5), 0 4px 16px rgba(0,0,0,.3)" }}
              >
                {locale === "fr" ? "Lancer le scan" : "Start scan"}
              </button>
            </div>
          )}

          {/* ══ CAPTURE layer ══ */}
          {phase === "capture" && (
            <>
              {/* ── Rail tubes ── */}

              {/* Top rail: from center upward to y=22% */}
              <div className="absolute z-10 pointer-events-none" style={railStyle(0, {
                left: "50%", bottom: "50%",
                width: 14, height: `${RAIL.top * 100}%`,
                transform: "translateX(-50%)",
                borderRadius: "7px 7px 0 0", borderBottom: "none",
              })} />

              {/* Bottom rail: from center downward to y=78% */}
              <div className="absolute z-10 pointer-events-none" style={railStyle(3, {
                left: "50%", top: "50%",
                width: 14, height: `${RAIL.bottom * 100}%`,
                transform: "translateX(-50%)",
                borderRadius: "0 0 7px 7px", borderTop: "none",
              })} />

              {/* Left rail: from center leftward to x=18% */}
              <div className="absolute z-10 pointer-events-none" style={railStyle(1, {
                top: "50%", right: "50%",
                height: 14, width: `${RAIL.left * 100}%`,
                transform: "translateY(-50%)",
                borderRadius: "7px 0 0 7px", borderRight: "none",
              })} />

              {/* Right rail: from center rightward to x=82% */}
              <div className="absolute z-10 pointer-events-none" style={railStyle(2, {
                top: "50%", left: "50%",
                height: 14, width: `${RAIL.right * 100}%`,
                transform: "translateY(-50%)",
                borderRadius: "0 7px 7px 0", borderLeft: "none",
              })} />

              {/* Center junction dot */}
              <div className="absolute z-15 pointer-events-none" style={{
                left: "50%", top: "50%",
                width: 18, height: 18, transform: "translate(-50%,-50%)",
                borderRadius: "50%",
                background: "rgba(0,255,157,.18)",
                border: "2px solid rgba(0,255,157,.45)",
                boxShadow: "0 0 10px rgba(0,255,157,.3)",
              }} />

              {/* ── Target sphere ── */}
              {sphereVis && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{ left: `${currentT.x * 100}%`, top: `${currentT.y * 100}%` }}
                >
                  {/* Dwell ring SVG */}
                  <svg
                    width={RING_R * 2 + 12} height={RING_R * 2 + 12}
                    className="absolute"
                    style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
                    viewBox={`0 0 ${RING_R * 2 + 12} ${RING_R * 2 + 12}`}
                  >
                    <circle
                      cx={RING_R + 6} cy={RING_R + 6} r={RING_R}
                      fill="none" stroke="rgba(0,255,157,.10)" strokeWidth="3"
                    />
                    <circle
                      ref={dwellArcRef}
                      cx={RING_R + 6} cy={RING_R + 6} r={RING_R}
                      fill="none" stroke="#00ff9d" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={RING_C} strokeDashoffset={RING_C}
                      style={{
                        transform: `rotate(-90deg)`,
                        transformOrigin: `${RING_R + 6}px ${RING_R + 6}px`,
                        filter: "drop-shadow(0 0 4px #00ff9d)",
                        transition: "stroke-dashoffset .06s linear",
                      }}
                    />
                  </svg>

                  {/* Sphere body */}
                  <div style={{
                    position: "absolute",
                    left: "50%", top: "50%",
                    transform: "translate(-50%,-50%)",
                    animation: "gtlAppear .35s cubic-bezier(.17,.67,.41,1.3) both",
                  }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: "50%",
                      background: "radial-gradient(circle at 35% 35%, rgba(0,255,157,.42) 0%, rgba(0,255,157,.1) 58%, rgba(0,255,157,.03) 100%)",
                      border: "2px solid rgba(0,255,157,.7)",
                      boxShadow: "0 0 22px rgba(0,255,157,.45), inset 0 0 14px rgba(0,255,157,.1)",
                      animation: "gtlPulse 2.2s ease-in-out infinite",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ff9d", boxShadow: "0 0 10px #00ff9d" }} />
                      <div className="absolute inset-[-7px] rounded-full"
                        style={{ border: "1px dashed rgba(0,255,157,.2)", animation: "gtlSpin 6s linear infinite" }} />
                    </div>
                  </div>

                  {/* Label */}
                  <p
                    className="absolute text-[10px] font-black uppercase tracking-widest"
                    style={{
                      left: "50%", top: "calc(50% + 34px)",
                      transform: "translateX(-50%)",
                      color: "#00ff9d", textShadow: "0 0 8px rgba(0,255,157,.7)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {locale === "fr" ? currentT.labelFr : currentT.labelEn}
                  </p>
                </div>
              )}

              {/* ── Ball (position set directly via DOM in RAF loop) ── */}
              <div
                ref={ballRef}
                className="absolute pointer-events-none"
                style={{
                  left: "50%", top: "50%",
                  zIndex: 22,
                  width: 24, height: 24,
                  transform: "translate(-50%,-50%)",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 32%, rgba(255,255,255,.9) 0%, rgba(0,255,157,.85) 30%, rgba(0,255,157,.5) 65%, rgba(0,255,157,.15) 100%)",
                  border: "2px solid rgba(0,255,157,.9)",
                  animation:
                    ballAnim === "fall"  ? "gtlFall .7s ease-out forwards" :
                    ballAnim === "reset" ? "gtlReset .3s ease-out both"    :
                    "gtlGlow 1.6s ease-in-out infinite",
                }}
              />

              {/* Lock flash */}
              {lockFlash && (
                <div className="absolute inset-0 z-30 pointer-events-none"
                  style={{ background: "rgba(0,255,157,.22)", animation: "gtlFlash .4s ease-out forwards" }}
                />
              )}

              {/* HUD top-left: current angle */}
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,.6)", border: "1px solid rgba(0,255,157,.2)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff9d", boxShadow: "0 0 5px #00ff9d" }} />
                <span className="text-[11px] font-black"
                  style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}>
                  {targetIdx + 1}/{TOTAL_TARGETS} · {locale === "fr" ? currentT.labelFr : currentT.labelEn}
                </span>
              </div>

              {/* HUD top-right: gyro badge */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(0,0,0,.6)", border: "1px solid rgba(0,255,157,.18)" }}>
                <Smartphone size={12} style={{
                  color: gyroAvail ? "#00ff9d" : "rgba(255,255,255,.4)",
                  animation: gyroAvail ? "gtlPulse 1.5s ease-in-out infinite" : "none",
                }} />
                <span className="text-[10px] font-semibold"
                  style={{ color: gyroAvail ? "#00ff9d" : "rgba(255,255,255,.4)" }}>
                  {gyroAvail ? "GYRO" : "MOUSE"}
                </span>
              </div>

              {/* HUD bottom: tilt hint */}
              <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center">
                <div className="px-4 py-2 rounded-full"
                  style={{ background: "rgba(0,0,0,.62)", border: "1px solid rgba(0,255,157,.22)" }}>
                  <p className="text-xs font-semibold text-white/60">
                    {locale === "fr" ? currentT.hintFr : currentT.hintEn}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* ══ SUCCESS overlay ══ */}
          {phase === "success" && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3"
              style={{ background: "rgba(5,8,5,.9)" }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(0,255,157,.15)", border: "2px solid #00ff9d",
                  boxShadow: "0 0 40px rgba(0,255,157,.5)",
                }}
              >
                <Check size={32} strokeWidth={2.5} style={{ color: "#00ff9d" }} />
              </div>
              <p className="text-white font-black text-base tracking-wider">
                {locale === "fr" ? "Synchronisation Complète" : "Sync Complete"}
              </p>
              <p className="text-white/45 text-xs">
                {framesStore.current.length} {locale === "fr" ? "clichés capturés" : "frames captured"}
              </p>
            </div>
          )}

          {/* ══ Camera error ══ */}
          {cameraError && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 px-6 text-center"
              style={{ background: "rgba(5,8,5,.97)" }}>
              <Eye size={36} style={{ color: "#00ff9d", opacity: .7 }} />
              <p className="text-white font-bold text-sm">
                {locale === "fr" ? "Accès caméra refusé" : "Camera access denied"}
              </p>
              <p className="text-white/40 text-xs max-w-xs">
                {locale === "fr"
                  ? "Autorise l'accès à la caméra dans les réglages de ton navigateur."
                  : "Allow camera access in your browser settings."}
              </p>
              <button onClick={onCancel}
                className="mt-1 px-6 py-2 rounded-xl text-xs font-bold uppercase"
                style={{ background: "rgba(0,255,157,.13)", color: "#00ff9d", border: "1px solid rgba(0,255,157,.3)" }}>
                {locale === "fr" ? "Fermer" : "Close"}
              </button>
            </div>
          )}
        </div>

        {/* ══ Biometric Sync Gauge ══ */}
        {phase === "capture" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                {locale === "fr" ? "Synchronisation Biométrique" : "Biometric Sync"}
              </p>
              <p className="text-xs font-black"
                style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}>
                {Math.round(syncPct)}%
              </p>
            </div>

            <div className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${syncPct}%`,
                  background: "linear-gradient(90deg,#059669,#00ff9d)",
                  boxShadow: "0 0 8px rgba(0,255,157,.5)",
                }}
              />
            </div>

            {/* Target lock dots */}
            <div className="flex items-center justify-around px-2 mt-0.5">
              {TARGETS.map((t, i) => (
                <div key={t.id} className="flex flex-col items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      background: i < lockedCount ? "#00ff9d" : i === lockedCount ? "rgba(0,255,157,.25)" : "rgba(255,255,255,.07)",
                      boxShadow:  i < lockedCount ? "0 0 6px rgba(0,255,157,.7)" : "none",
                      border:     i === lockedCount ? "1px solid rgba(0,255,157,.5)" : "none",
                    }}
                  />
                  <p className="text-[9px] text-white/25 font-medium">
                    {locale === "fr" ? t.labelFr : t.labelEn}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-center text-white/20 font-medium mt-0.5">
              {lockedCount * FRAMES_PER_ANGLE}/{TOTAL_TARGETS * FRAMES_PER_ANGLE} {locale === "fr" ? "clichés" : "frames"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
