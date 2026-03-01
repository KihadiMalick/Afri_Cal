"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Smartphone, Check, Target, Eye } from "lucide-react";
import { useQuietCameraCapture } from "@/hooks/useQuietCameraCapture";

/* ══════════════════════════════════════════════════════════
   LIXUM Gyro·Target·Lock
   ──────────────────────────────────────────────────────────
   4 data spheres appear one by one at fixed screen positions.
   The user tilts the phone so the neon crosshair (gyro-driven)
   overlaps each sphere. After 1 s of dwell → silent burst of
   3 JPEG frames. 4 angles × 3 frames = 12 total → onComplete.
   ══════════════════════════════════════════════════════════ */

/* ── Keyframes ── */
const STYLES = `
@keyframes gtlPulse   { 0%,100%{opacity:.6;transform:scale(1)}  50%{opacity:1;transform:scale(1.08)} }
@keyframes gtlFloat   { 0%,100%{transform:translateY(0)}         50%{transform:translateY(-6px)} }
@keyframes gtlAppear  { from{opacity:0;transform:translate(-50%,-50%) scale(.3)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
@keyframes gtlExplode { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(-50%,-50%) scale(2.8);opacity:0} }
@keyframes gtlFlash   { 0%{opacity:.75} 100%{opacity:0} }
@keyframes gtlCross   { 0%,100%{opacity:.65} 50%{opacity:1} }
@keyframes gtlSpin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }
`;

/* ── Config ── */
const TOTAL_TARGETS     = 4;
const FRAMES_PER_ANGLE  = 3;          // silent burst per lock
const DWELL_MS          = 1000;       // hold duration to lock (ms)
const LOCK_RADIUS       = 0.13;       // normalised (0-1) proximity
const SENSITIVITY       = 1 / 40;    // 1 degree → 1/40 of screen width
const RING_R            = 42;         // SVG dwell-ring radius (px)
const RING_C            = 2 * Math.PI * RING_R; // circumference

/* ── Target definitions ── */
interface TargetDef {
  id: string; labelFr: string; labelEn: string;
  x: number; y: number;           // normalised screen position
  hintFr: string; hintEn: string; // micro-instruction
}
const TARGETS: TargetDef[] = [
  { id:"top",    labelFr:"Dessus",  labelEn:"Top",    x:.50, y:.20, hintFr:"Inclinez en avant",   hintEn:"Tilt forward"  },
  { id:"left",   labelFr:"Gauche",  labelEn:"Left",   x:.18, y:.50, hintFr:"Inclinez à gauche",   hintEn:"Tilt left"     },
  { id:"right",  labelFr:"Droite",  labelEn:"Right",  x:.82, y:.50, hintFr:"Inclinez à droite",   hintEn:"Tilt right"    },
  { id:"bottom", labelFr:"Dessous", labelEn:"Bottom", x:.50, y:.80, hintFr:"Inclinez en arrière", hintEn:"Tilt back"     },
];

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

  /* ── React state (triggers re-render) ── */
  const [phase,          setPhase]          = useState<Phase>("intro");
  const [targetIdx,      setTargetIdx]      = useState(0);
  const [lockedCount,    setLockedCount]    = useState(0);
  const [lockFlash,      setLockFlash]      = useState(false);
  const [gyroAvail,      setGyroAvail]      = useState(false);
  const [sphereVisible,  setSphereVisible]  = useState(true);

  /* ── Hot-path refs (no re-render) ── */
  const crossX      = useRef(0.5);
  const crossY      = useRef(0.5);
  const betaBase    = useRef<number | null>(null);
  const gammaBase   = useRef<number | null>(null);
  const dwellStart  = useRef<number | null>(null);
  const framesStore = useRef<string[]>([]);
  const idxRef      = useRef(0);          // mirrors targetIdx
  const lockingRef  = useRef(false);
  const phaseRef    = useRef<Phase>("intro");
  const captureRef  = useRef(captureFrame);
  const rafRef      = useRef<number>();

  /* ── DOM refs for direct manipulation ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const crosshairRef = useRef<HTMLDivElement>(null);
  const dwellArcRef  = useRef<SVGCircleElement>(null);

  /* keep captureRef current without deps churn */
  captureRef.current = captureFrame;

  /* ── Cleanup on unmount ── */
  useEffect(() => () => {
    stopCamera();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [stopCamera]);

  /* ── Lock handler ── */
  const handleLock = useCallback(() => {
    if (lockingRef.current) return;
    lockingRef.current = true;

    /* Burst capture */
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
      setSphereVisible(false);
      setTimeout(() => {
        idxRef.current   = next;
        betaBase.current = null;
        gammaBase.current = null;
        dwellStart.current = null;
        lockingRef.current = false;
        setLockedCount(next);
        setTargetIdx(next);
        setSphereVisible(true);
      }, 500);
    }
  }, [onComplete]);

  /* ── RAF loop (dwell check + crosshair position) ── */
  const loopRef = useRef<() => void>();
  loopRef.current = () => {
    if (phaseRef.current !== "capture") return;

    const container = containerRef.current;
    const ch        = crosshairRef.current;

    if (container && ch) {
      const { width, height } = container.getBoundingClientRect();
      const px = crossX.current * width;
      const py = crossY.current * height;

      /* Move crosshair via direct DOM */
      ch.style.left = `${px}px`;
      ch.style.top  = `${py}px`;

      /* Dwell detection */
      if (!lockingRef.current) {
        const t   = TARGETS[idxRef.current];
        const tx  = t.x * width;
        const ty  = t.y * height;
        const d   = Math.sqrt((px - tx) ** 2 + (py - ty) ** 2);
        const thr = LOCK_RADIUS * Math.min(width, height);

        if (d < thr) {
          if (!dwellStart.current) dwellStart.current = Date.now();
          const pct = Math.min(100, ((Date.now() - dwellStart.current) / DWELL_MS) * 100);

          if (dwellArcRef.current) {
            dwellArcRef.current.style.strokeDashoffset = String(RING_C * (1 - pct / 100));
          }
          if (pct >= 100) handleLock();
        } else {
          dwellStart.current = null;
          if (dwellArcRef.current) {
            dwellArcRef.current.style.strokeDashoffset = String(RING_C);
          }
        }
      }
    }

    rafRef.current = requestAnimationFrame(() => loopRef.current?.());
  };

  /* ── Gyroscope handler ── */
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const beta  = e.beta  ?? 0;
    const gamma = e.gamma ?? 0;
    if (betaBase.current  === null) betaBase.current  = beta;
    if (gammaBase.current === null) gammaBase.current = gamma;
    crossX.current = Math.max(0.05, Math.min(0.95, 0.5 + (gamma - gammaBase.current) * SENSITIVITY));
    crossY.current = Math.max(0.05, Math.min(0.95, 0.5 - (beta  - betaBase.current)  * SENSITIVITY));
  }, []);

  /* ── Mouse fallback ── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    crossX.current = Math.max(0.05, Math.min(0.95, (e.clientX - r.left) / r.width));
    crossY.current = Math.max(0.05, Math.min(0.95, (e.clientY - r.top)  / r.height));
  }, []);

  /* ── Start ── */
  const handleStart = useCallback(async () => {
    await startCamera();

    /* iOS 13+ permission request */
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

  /* ── Cleanup listeners when leaving capture ── */
  useEffect(() => {
    if (phase !== "capture") {
      window.removeEventListener("deviceorientation", handleOrientation as EventListener);
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [phase, handleOrientation, handleMouseMove]);

  const syncPct   = (lockedCount / TOTAL_TARGETS) * 100;
  const currentT  = TARGETS[targetIdx];

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

      {/* ══ INTRO ══ */}
      {phase === "intro" && (
        <div
          className="relative flex flex-col items-center gap-6 rounded-[2rem] overflow-hidden py-10 px-5 text-center"
          style={{ background:"rgba(5,8,5,0.96)", border:"1px solid rgba(0,255,157,.15)", minHeight:"26rem" }}
        >
          {/* Grid bg */}
          <div className="absolute inset-0 opacity-[.04]" style={{
            backgroundImage:`linear-gradient(rgba(0,255,157,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,157,.5) 1px,transparent 1px)`,
            backgroundSize:"28px 28px",
          }} />

          <div className="relative z-10 flex flex-col items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background:"rgba(0,255,157,.08)", border:"1px solid rgba(0,255,157,.28)", boxShadow:"0 0 32px rgba(0,255,157,.18)", animation:"gtlFloat 3s ease-in-out infinite" }}
            >
              <Target size={38} strokeWidth={1.5} style={{ color:"#00ff9d", filter:"drop-shadow(0 0 8px #00ff9d)" }} />
            </div>

            <div>
              <p className="font-black text-2xl tracking-[.18em] leading-none mb-0.5" style={{ fontFamily:"'Courier New',monospace" }}>
                <span style={{ color:"#8b949e" }}>LI</span>
                <span style={{ color:"#00ff9d", textShadow:"0 0 12px #00ff9d" }}>X</span>
                <span style={{ color:"#8b949e" }}>UM</span>
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[.28em]" style={{ color:"rgba(0,255,157,.55)" }}>
                Gyro · Target · Lock
              </p>
            </div>

            <p className="text-white/55 text-sm font-medium max-w-xs leading-relaxed">
              {locale === "fr"
                ? "Synchronisez les 4 sphères en inclinant le téléphone vers chaque angle. 12 clichés de précision pour une analyse IA complète."
                : "Sync all 4 spheres by tilting your phone toward each angle. 12 precision frames for a full AI analysis."}
            </p>

            {/* Steps */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {TARGETS.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background:"rgba(0,255,157,.05)", border:"1px solid rgba(0,255,157,.10)" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:"rgba(0,255,157,.15)", border:"1px solid rgba(0,255,157,.4)" }}>
                    <span className="text-[9px] font-black" style={{ color:"#00ff9d" }}>{i + 1}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-white/50">
                    {locale === "fr" ? `${t.labelFr} — ${t.hintFr}` : `${t.labelEn} — ${t.hintEn}`}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="mt-1 px-10 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase text-black transition-all hover:brightness-110 active:scale-[.97]"
              style={{ background:"#00ff9d", boxShadow:"0 0 28px rgba(0,255,157,.5), 0 4px 16px rgba(0,0,0,.3)" }}
            >
              {locale === "fr" ? "Lancer le Target Lock" : "Start Target Lock"}
            </button>
          </div>
        </div>
      )}

      {/* ══ CAPTURE + SUCCESS ══ */}
      {(phase === "capture" || phase === "success") && (
        <div className="flex flex-col gap-3">
          {/* Camera container */}
          <div
            ref={containerRef}
            className="relative w-full rounded-[1.75rem] overflow-hidden"
            style={{ aspectRatio:"3/4", background:"#000" }}
          >
            {/* Camera feed */}
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />

            {/* Camera error */}
            {cameraError && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 px-6 text-center" style={{ background:"rgba(5,8,5,0.97)" }}>
                <Eye size={36} style={{ color:"#00ff9d", opacity:.7 }} />
                <p className="text-white font-bold text-sm">
                  {locale === "fr" ? "Accès caméra refusé" : "Camera access denied"}
                </p>
                <button onClick={onCancel} className="mt-2 px-6 py-2 rounded-xl text-xs font-bold uppercase" style={{ background:"rgba(0,255,157,.15)", color:"#00ff9d", border:"1px solid rgba(0,255,157,.3)" }}>
                  {locale === "fr" ? "Fermer" : "Close"}
                </button>
              </div>
            )}

            {/* Lock flash */}
            {lockFlash && (
              <div className="absolute inset-0 z-30 pointer-events-none" style={{ background:"rgba(0,255,157,.28)", animation:"gtlFlash .4s ease-out forwards" }} />
            )}

            {/* Success overlay */}
            {phase === "success" && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3" style={{ background:"rgba(5,8,5,.88)" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background:"rgba(0,255,157,.15)", border:"2px solid #00ff9d", boxShadow:"0 0 40px rgba(0,255,157,.5)" }}>
                  <Check size={32} strokeWidth={2.5} style={{ color:"#00ff9d" }} />
                </div>
                <p className="text-white font-black text-base tracking-wider">
                  {locale === "fr" ? "Synchronisation Complète" : "Sync Complete"}
                </p>
                <p className="text-white/50 text-xs">12 {locale === "fr" ? "clichés capturés" : "frames captured"}</p>
              </div>
            )}

            {/* ── Data sphere ── */}
            {phase === "capture" && sphereVisible && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{ left:`${currentT.x * 100}%`, top:`${currentT.y * 100}%`, animation:"gtlAppear .35s cubic-bezier(.17,.67,.41,1.3) both" }}
              >
                {/* Dwell ring (SVG) */}
                <svg
                  width={RING_R * 2 + 12} height={RING_R * 2 + 12}
                  className="absolute"
                  style={{ left:"50%", top:"50%", transform:"translate(-50%,-50%)" }}
                  viewBox={`0 0 ${RING_R * 2 + 12} ${RING_R * 2 + 12}`}
                >
                  <circle cx={RING_R + 6} cy={RING_R + 6} r={RING_R} fill="none" stroke="rgba(0,255,157,.12)" strokeWidth="3.5" />
                  <circle
                    ref={dwellArcRef}
                    cx={RING_R + 6} cy={RING_R + 6} r={RING_R}
                    fill="none" stroke="#00ff9d" strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray={RING_C} strokeDashoffset={RING_C}
                    style={{
                      transform:`rotate(-90deg)`, transformOrigin:`${RING_R + 6}px ${RING_R + 6}px`,
                      filter:"drop-shadow(0 0 4px #00ff9d)",
                      transition:"stroke-dashoffset 0.06s linear",
                    }}
                  />
                </svg>

                {/* Sphere body */}
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width:56, height:56,
                    transform:"translate(-50%,-50%)",
                    borderRadius:"50%",
                    background:"radial-gradient(circle at 35% 35%, rgba(0,255,157,.45) 0%, rgba(0,255,157,.12) 55%, rgba(0,255,157,.04) 100%)",
                    border:"2px solid rgba(0,255,157,.75)",
                    boxShadow:"0 0 22px rgba(0,255,157,.5), inset 0 0 14px rgba(0,255,157,.12)",
                    animation:"gtlPulse 2s ease-in-out infinite",
                  }}
                >
                  {/* Inner glow dot */}
                  <div style={{ width:8, height:8, borderRadius:"50%", background:"#00ff9d", boxShadow:"0 0 10px #00ff9d" }} />
                  {/* Orbit ring */}
                  <div className="absolute inset-[-8px] rounded-full" style={{ border:"1px dashed rgba(0,255,157,.25)", animation:"gtlSpin 6s linear infinite" }} />
                </div>

                {/* Label */}
                <p
                  className="absolute text-[10px] font-black uppercase tracking-widest"
                  style={{ left:"50%", top:"calc(50% + 36px)", transform:"translateX(-50%)", color:"#00ff9d", textShadow:"0 0 8px rgba(0,255,157,.7)", whiteSpace:"nowrap" }}
                >
                  {locale === "fr" ? currentT.labelFr : currentT.labelEn}
                </p>
              </div>
            )}

            {/* ── Crosshair (position set via direct DOM) ── */}
            {phase === "capture" && (
              <div
                ref={crosshairRef}
                className="absolute z-20 pointer-events-none"
                style={{ width:52, height:52, transform:"translate(-50%,-50%)", left:"50%", top:"50%", animation:"gtlCross 2s ease-in-out infinite" }}
              >
                {/* TL */}
                <div className="absolute top-0 left-0"   style={{ width:14, height:14, borderTop:"2.5px solid #00ff9d", borderLeft:"2.5px solid #00ff9d",  borderRadius:"3px 0 0 0",   filter:"drop-shadow(0 0 3px rgba(0,255,157,.9))" }} />
                {/* TR */}
                <div className="absolute top-0 right-0"  style={{ width:14, height:14, borderTop:"2.5px solid #00ff9d", borderRight:"2.5px solid #00ff9d", borderRadius:"0 3px 0 0",   filter:"drop-shadow(0 0 3px rgba(0,255,157,.9))" }} />
                {/* BL */}
                <div className="absolute bottom-0 left-0"  style={{ width:14, height:14, borderBottom:"2.5px solid #00ff9d", borderLeft:"2.5px solid #00ff9d",  borderRadius:"0 0 0 3px", filter:"drop-shadow(0 0 3px rgba(0,255,157,.9))" }} />
                {/* BR */}
                <div className="absolute bottom-0 right-0" style={{ width:14, height:14, borderBottom:"2.5px solid #00ff9d", borderRight:"2.5px solid #00ff9d", borderRadius:"0 0 3px 0", filter:"drop-shadow(0 0 3px rgba(0,255,157,.9))" }} />
                {/* Center dot */}
                <div className="absolute" style={{ width:5, height:5, borderRadius:"50%", background:"#00ff9d", top:"50%", left:"50%", transform:"translate(-50%,-50%)", boxShadow:"0 0 8px #00ff9d" }} />
              </div>
            )}

            {/* ── HUD: current angle (top-left) ── */}
            {phase === "capture" && (
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background:"rgba(0,0,0,.58)", border:"1px solid rgba(0,255,157,.2)" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#00ff9d", boxShadow:"0 0 5px #00ff9d" }} />
                <span className="text-[11px] font-black" style={{ color:"#00ff9d", fontFamily:"'Courier New',monospace" }}>
                  {targetIdx + 1}/{TOTAL_TARGETS} · {locale === "fr" ? currentT.labelFr : currentT.labelEn}
                </span>
              </div>
            )}

            {/* ── HUD: gyro badge (top-right) ── */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background:"rgba(0,0,0,.58)", border:"1px solid rgba(0,255,157,.18)" }}>
              <Smartphone size={12} style={{ color: gyroAvail ? "#00ff9d" : "rgba(255,255,255,.4)", animation: gyroAvail ? "gtlPulse 1.5s ease-in-out infinite" : "none" }} />
              <span className="text-[10px] font-semibold" style={{ color: gyroAvail ? "#00ff9d" : "rgba(255,255,255,.4)" }}>
                {gyroAvail ? "GYRO" : "MOUSE"}
              </span>
            </div>

            {/* ── HUD: tilt hint (bottom center) ── */}
            {phase === "capture" && (
              <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center">
                <div className="px-4 py-2 rounded-full" style={{ background:"rgba(0,0,0,.62)", border:"1px solid rgba(0,255,157,.22)" }}>
                  <p className="text-xs font-semibold text-white/60">
                    {locale === "fr" ? currentT.hintFr : currentT.hintEn}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Biometric Sync Gauge ── */}
          {phase === "capture" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                  {locale === "fr" ? "Synchronisation Biométrique" : "Biometric Sync"}
                </p>
                <p className="text-xs font-black" style={{ color:"#00ff9d", fontFamily:"'Courier New',monospace" }}>
                  {Math.round(syncPct)}%
                </p>
              </div>

              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width:`${syncPct}%`,
                    background:"linear-gradient(90deg,#059669,#00ff9d)",
                    boxShadow:"0 0 8px rgba(0,255,157,.5)",
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
      )}
    </div>
  );
}
