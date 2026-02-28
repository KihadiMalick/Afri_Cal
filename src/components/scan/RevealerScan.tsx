"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X, Zap, Sun, Eye, CheckCircle, Loader2,
  Scan, Smartphone, Sparkles,
} from "lucide-react";
import { useRevealerCanvas } from "@/hooks/useRevealerCanvas";

/* ══════════════════════════════════════════════════════════
   LIXUM Revealer Scan — "Scratch-Card" Gyroscope Experience
   ──────────────────────────────────────────────────────────
   A dark holographic mask covers the camera feed.
   The user physically moves their phone to "erase" the mask
   and reveal the dish underneath — like a torch / scratch card.
   Silent captures at every 10 % increment (10 frames total).
   At 80 % revealed → success flash → send to vision API.
   ══════════════════════════════════════════════════════════ */

export interface RevealerScanProps {
  onComplete: (frames: string[]) => void;
  onCancel: () => void;
  locale: "fr" | "en";
}

/* ── Inline keyframes ── */
const REVEALER_STYLES = `
@keyframes revPulse {
  0%, 100% { opacity:.55; transform:scale(1); }
  50% { opacity:1; transform:scale(1.06); }
}
@keyframes revFlash {
  0% { opacity:.65; }
  100% { opacity:0; }
}
@keyframes revSuccessGlow {
  0% { box-shadow: 0 0 0 0 rgba(0,255,157,.6); }
  60% { box-shadow: 0 0 60px 20px rgba(0,255,157,.35); }
  100% { box-shadow: 0 0 0 0 rgba(0,255,157,0); }
}
@keyframes revFadeUp {
  from { opacity:0; transform:translateY(12px); }
  to { opacity:1; transform:translateY(0); }
}
@keyframes revScanLine {
  0% { top: 0%; }
  100% { top: 100%; }
}
@keyframes revFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes revGaugePulse {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(0,255,157,.3)); }
  50% { filter: drop-shadow(0 0 12px rgba(0,255,157,.7)); }
}
`;

/* ── Phase type ── */
type Phase = "intro" | "reveal" | "success" | "uploading";

export default function RevealerScan({ onComplete, onCancel, locale }: RevealerScanProps) {
  /* ── Refs ── */
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);

  /* ── UI state ── */
  const [phase, setPhase]           = useState<Phase>("intro");
  const [torchOn, setTorchOn]       = useState(false);
  const [torchAvail, setTorchAvail] = useState(false);
  const [flashVisible, setFlash]    = useState(false);

  /* ── Revealer engine (custom hook) ── */
  const {
    revealedPct,
    capturedCount,
    gyroAvailable,
  } = useRevealerCanvas({
    canvasRef,
    videoRef,
    enabled: phase === "reveal",
    onComplete: (frames) => {
      /* Green flash */
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
      /* Transition */
      setPhase("success");
      /* Brief pause then send frames upstream */
      setTimeout(() => {
        setPhase("uploading");
        onComplete(frames);
      }, 1800);
    },
  });

  /* ── Start rear camera ── */
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
      /* Check torch */
      try {
        const track = stream.getVideoTracks()[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const caps = (track as any).getCapabilities?.() ?? {};
        if (caps.torch) setTorchAvail(true);
      } catch { /* no torch */ }
    } catch { /* desktop fallback — no camera */ }
  }, []);

  /* ── Toggle torch ── */
  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn(t => !t);
    } catch { /* noop */ }
  }, [torchOn]);

  /* ── Begin reveal experience ── */
  const handleStart = useCallback(async () => {
    await startCamera();
    setPhase("reveal");
  }, [startCamera]);

  /* ── Cleanup ── */
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  /* ── Progress colour ── */
  const pctColor = revealedPct >= 80 ? "#00ff9d"
    : revealedPct >= 50 ? "#fbbf24"
    : "rgba(255,255,255,.6)";

  /* ── Progress ring (SVG) ── */
  const RING_R = 30, RING_CX = 36, RING_CY = 36;
  const circumference = 2 * Math.PI * RING_R;
  const dashOffset = circumference * (1 - revealedPct / 100);

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}>
      <style>{REVEALER_STYLES}</style>

      {/* ── Close button ── */}
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 z-40 p-2 rounded-full"
        style={{ background: "rgba(0,0,0,.55)", color: "rgba(255,255,255,.65)" }}
        aria-label="Close"
      >
        <X size={17} strokeWidth={2} />
      </button>

      {/* ══ INTRO ══ */}
      {phase === "intro" && (
        <div
          className="relative flex flex-col items-center gap-6 rounded-[2rem] overflow-hidden py-10 px-5 text-center"
          style={{
            background: "rgba(5,8,5,0.96)",
            border: "1px solid rgba(0,255,157,.15)",
            minHeight: "26rem",
          }}
        >
          {/* Matrix grid background (subtle) */}
          <div className="absolute inset-0 opacity-[.04]" style={{
            backgroundImage:
              `linear-gradient(rgba(0,255,157,.5) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,255,157,.5) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }} />

          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,255,157,.08)",
                border: "1px solid rgba(0,255,157,.28)",
                boxShadow: "0 0 32px rgba(0,255,157,.18)",
                animation: "revFloat 3s ease-in-out infinite",
              }}
            >
              <Eye
                size={38} strokeWidth={1.5}
                style={{ color: "#00ff9d", filter: "drop-shadow(0 0 8px #00ff9d)" }}
              />
            </div>

            {/* Logo */}
            <div>
              <p className="font-black text-2xl tracking-[.18em] leading-none mb-0.5"
                style={{ fontFamily: "'Courier New',monospace" }}>
                <span style={{ color: "#8b949e" }}>LI</span>
                <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d" }}>X</span>
                <span style={{ color: "#8b949e" }}>UM</span>
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[.28em]"
                style={{ color: "rgba(0,255,157,.55)" }}>
                Revealer Scan
              </p>
            </div>

            {/* Description */}
            <p className="text-white/55 text-sm font-medium max-w-xs leading-relaxed">
              {locale === "fr"
                ? "Bougez votre téléphone au-dessus du plat pour révéler la surface et capturer 10 angles uniques. L'IA analyse chaque couche dévoilée."
                : "Move your phone over the plate to reveal the surface and capture 10 unique angles. AI analyzes each uncovered layer."}
            </p>

            {/* How-to pills */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {[
                {
                  Icon: Smartphone,
                  text: locale === "fr"
                    ? "Inclinez le téléphone pour effacer le masque"
                    : "Tilt phone to erase the mask",
                },
                {
                  Icon: Scan,
                  text: locale === "fr"
                    ? "10 captures silencieuses pendant la révélation"
                    : "10 silent captures during reveal",
                },
                {
                  Icon: Sparkles,
                  text: locale === "fr"
                    ? "80 % révélé = Analyse Vision IA complète"
                    : "80% revealed = Full AI Vision analysis",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(0,255,157,.05)", border: "1px solid rgba(0,255,157,.10)" }}
                >
                  <step.Icon size={15} style={{ color: "#00ff9d", flexShrink: 0 }} />
                  <p className="text-[11px] font-semibold text-white/50">{step.text}</p>
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
              {locale === "fr" ? "Lancer le Revealer" : "Start Revealer"}
            </button>
          </div>
        </div>
      )}

      {/* ══ REVEAL PHASE (video + mask canvas) ══ */}
      {(phase === "reveal" || phase === "success") && (
        <div className="flex flex-col gap-3">
          {/* Camera + mask container */}
          <div
            className="relative w-full rounded-[1.75rem] overflow-hidden"
            style={{
              aspectRatio: "3/4",
              background: "#000",
              animation: phase === "success" ? "revSuccessGlow 1s ease-out" : "none",
            }}
          >
            {/* Live video (underneath everything) */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline muted autoPlay
            />

            {/* Canvas mask (on top of video) */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ touchAction: "none" }}
            />

            {/* Success green flash overlay */}
            {flashVisible && (
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  background: "rgba(0,255,157,0.25)",
                  animation: "revFlash .4s ease-out forwards",
                }}
              />
            )}

            {/* ── Floating HUD ── */}

            {/* Progress ring (top-right) */}
            <div className="absolute top-3 right-3 z-30" style={{ animation: "revGaugePulse 2s ease-in-out infinite" }}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle
                  cx={RING_CX} cy={RING_CY} r={RING_R + 4}
                  fill="rgba(0,0,0,.55)"
                />
                {/* Track */}
                <circle
                  cx={RING_CX} cy={RING_CY} r={RING_R}
                  fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3.5"
                />
                {/* Progress arc */}
                <circle
                  cx={RING_CX} cy={RING_CY} r={RING_R}
                  fill="none"
                  stroke={pctColor}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: `${RING_CX}px ${RING_CY}px`,
                    transition: "stroke-dashoffset .3s ease, stroke .3s ease",
                    filter: `drop-shadow(0 0 6px ${pctColor})`,
                  }}
                />
                {/* Center text */}
                <text
                  x={RING_CX} y={RING_CY}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={pctColor} fontSize="11" fontWeight="900"
                  fontFamily="'Courier New',monospace"
                >
                  {revealedPct}%
                </text>
              </svg>
            </div>

            {/* Capture counter (top-left) */}
            <div
              className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,.58)", border: "1px solid rgba(0,255,157,.18)" }}
            >
              <Scan size={12} style={{ color: "#00ff9d" }} />
              <p
                className="text-[11px] font-black"
                style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}
              >
                {capturedCount}/{10}
              </p>
            </div>

            {/* Gyro / instruction indicator (bottom center) */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center z-30">
              <div
                className="px-4 py-2 rounded-full flex items-center gap-2"
                style={{ background: "rgba(0,0,0,.62)", border: "1px solid rgba(0,255,157,.22)" }}
              >
                {phase === "success" ? (
                  <>
                    <CheckCircle size={14} style={{ color: "#00ff9d" }} />
                    <p className="text-xs font-bold text-white/90">
                      {locale === "fr" ? "Surface révélée !" : "Surface revealed!"}
                    </p>
                  </>
                ) : gyroAvailable ? (
                  <>
                    <Smartphone
                      size={14}
                      style={{ color: "#00ff9d", animation: "revPulse 1.5s ease-in-out infinite" }}
                    />
                    <p className="text-xs font-semibold text-white/70">
                      {locale === "fr"
                        ? "Bougez le téléphone pour révéler"
                        : "Move phone to reveal"}
                    </p>
                  </>
                ) : (
                  <>
                    <Eye
                      size={14}
                      style={{ color: "#00ff9d", animation: "revPulse 1.5s ease-in-out infinite" }}
                    />
                    <p className="text-xs font-semibold text-white/70">
                      {locale === "fr"
                        ? "Déplacez la souris pour révéler"
                        : "Move mouse to reveal"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Torch toggle */}
            {torchAvail && (
              <button
                onClick={toggleTorch}
                className="absolute bottom-3 right-3 z-30 w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: torchOn ? "rgba(251,191,36,.25)" : "rgba(0,0,0,.55)",
                  border: `1px solid ${torchOn ? "rgba(251,191,36,.5)" : "rgba(255,255,255,.12)"}`,
                }}
              >
                {torchOn
                  ? <Sun size={16} strokeWidth={2} style={{ color: "#fbbf24" }} />
                  : <Zap size={16} strokeWidth={2} style={{ color: "rgba(255,255,255,.6)" }} />}
              </button>
            )}
          </div>

          {/* ── Progress bar (below camera) ── */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                {locale === "fr" ? "Analyse de Surface" : "Surface Analysis"}
              </p>
              <p
                className="text-xs font-black"
                style={{ color: pctColor, fontFamily: "'Courier New',monospace" }}
              >
                {revealedPct} %
              </p>
            </div>

            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${revealedPct}%`,
                  background: revealedPct >= 80
                    ? "linear-gradient(90deg,#059669,#00ff9d)"
                    : revealedPct >= 50
                    ? "linear-gradient(90deg,#d97706,#fbbf24)"
                    : "linear-gradient(90deg,rgba(255,255,255,.25),rgba(255,255,255,.5))",
                  boxShadow: `0 0 8px ${pctColor}55`,
                }}
              />
            </div>

            {/* Capture dot indicators */}
            <div className="flex items-center justify-between px-0.5 mt-0.5">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{
                    background: i < capturedCount ? "#00ff9d" : "rgba(255,255,255,.08)",
                    boxShadow: i < capturedCount ? "0 0 4px rgba(0,255,157,.5)" : "none",
                  }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between px-0.5">
              <p className="text-[10px] text-white/25 font-medium">
                {capturedCount} {locale === "fr" ? "captures silencieuses" : "silent captures"}
              </p>
              <p className="text-[10px] text-white/25 font-medium">
                {locale === "fr" ? "Objectif: 80 %" : "Target: 80%"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══ UPLOADING ══ */}
      {phase === "uploading" && (
        <div
          className="flex flex-col items-center gap-5 py-12 px-5 rounded-[2rem] text-center"
          style={{
            background: "rgba(2,12,7,0.95)",
            border: "1px solid rgba(0,255,157,.18)",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(0,255,157,.08)",
              border: "1px solid rgba(0,255,157,.25)",
            }}
          >
            <Loader2
              size={30} strokeWidth={1.5}
              style={{ color: "#00ff9d", animation: "spin 1.2s linear infinite" }}
            />
          </div>
          <div>
            <p className="text-white font-bold text-base mb-1">
              {locale === "fr" ? "Moteur Vision LIXUM…" : "LIXUM Vision Engine…"}
            </p>
            <p className="text-white/40 text-sm font-medium">
              {locale === "fr"
                ? "10 clichés envoyés · Analyse IA en cours"
                : "10 frames sent · AI analysis in progress"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
