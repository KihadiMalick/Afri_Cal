"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X, Zap, Sun, CheckCircle, Loader2,
  Scan, Hand, Sparkles,
} from "lucide-react";
import { useRevealerCanvas } from "@/hooks/useRevealerCanvas";

/* ══════════════════════════════════════════════════════════
   LIXUM Revealer Scan — Scratch-Card v2
   ──────────────────────────────────────────────────────────
   Gold scratch-card mask over camera feed.
   User scratches with finger (touch) or tilts phone (gyro).
   A golden circle in the center hints where to start.
   10 silent captures as the surface is revealed.
   80% → success flash → send to vision API.
   ══════════════════════════════════════════════════════════ */

export interface RevealerScanProps {
  onComplete: (frames: string[]) => void;
  onCancel: () => void;
  locale: "fr" | "en";
}

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
@keyframes revFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
@keyframes revGaugePulse {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(212,175,55,.3)); }
  50% { filter: drop-shadow(0 0 12px rgba(212,175,55,.7)); }
}
@keyframes scratchHint {
  0%, 100% { opacity: .6; transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.08) rotate(-3deg); }
  50% { opacity: 1; transform: scale(1.05) rotate(0deg); }
  75% { transform: scale(1.08) rotate(3deg); }
}
`;

type Phase = "intro" | "reveal" | "success" | "uploading";

/* Gold accent colour */
const GOLD         = "#d4af37";
const GOLD_LIGHT   = "rgba(212,175,55,.70)";
const GOLD_FADED   = "rgba(212,175,55,.35)";

export default function RevealerScan({ onComplete, onCancel, locale }: RevealerScanProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);

  const [phase, setPhase]           = useState<Phase>("intro");
  const [torchOn, setTorchOn]       = useState(false);
  const [torchAvail, setTorchAvail] = useState(false);
  const [flashVisible, setFlash]    = useState(false);

  const {
    revealedPct,
    capturedCount,
    touchActive,
  } = useRevealerCanvas({
    canvasRef,
    videoRef,
    enabled: phase === "reveal",
    onComplete: (frames) => {
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
      setPhase("success");
      setTimeout(() => {
        setPhase("uploading");
        onComplete(frames);
      }, 1800);
    },
  });

  /* ── Start camera ── */
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
      try {
        const track = stream.getVideoTracks()[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const caps = (track as any).getCapabilities?.() ?? {};
        if (caps.torch) setTorchAvail(true);
      } catch { /* no torch */ }
    } catch { /* desktop */ }
  }, []);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn(t => !t);
    } catch { /* noop */ }
  }, [torchOn]);

  const handleStart = useCallback(async () => {
    await startCamera();
    setPhase("reveal");
  }, [startCamera]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  /* ── Progress colour: gold → green ── */
  const pctColor = revealedPct >= 80 ? "#00ff9d"
    : revealedPct >= 50 ? GOLD_LIGHT
    : GOLD_FADED;

  const RING_R = 30, RING_CX = 36, RING_CY = 36;
  const circumference = 2 * Math.PI * RING_R;
  const dashOffset = circumference * (1 - revealedPct / 100);

  return (
    <div style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}>
      <style>{REVEALER_STYLES}</style>

      {/* Close */}
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
            background: "linear-gradient(135deg, rgba(30,28,20,0.98) 0%, rgba(15,14,10,0.98) 100%)",
            border: `1px solid ${GOLD_FADED}`,
            minHeight: "26rem",
          }}
        >
          {/* Subtle cross-hatch */}
          <div className="absolute inset-0 opacity-[.03]" style={{
            backgroundImage: `repeating-linear-gradient(45deg, ${GOLD} 0, ${GOLD} 1px, transparent 0, transparent 6px)`,
          }} />

          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Scratch icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(212,175,55,.10)",
                border: `2px solid ${GOLD_FADED}`,
                boxShadow: "0 0 32px rgba(212,175,55,.15)",
                animation: "revFloat 3s ease-in-out infinite",
              }}
            >
              <Hand
                size={36} strokeWidth={1.5}
                style={{ color: GOLD, filter: "drop-shadow(0 0 8px rgba(212,175,55,.6))" }}
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
                style={{ color: GOLD_LIGHT }}>
                Scratch to Scan
              </p>
            </div>

            <p className="text-white/55 text-sm font-medium max-w-xs leading-relaxed">
              {locale === "fr"
                ? "Grattez l'écran avec votre doigt pour révéler votre plat. L'IA capture 10 angles pendant que vous grattez."
                : "Scratch the screen with your finger to reveal your dish. AI captures 10 angles as you scratch."}
            </p>

            {/* Instructions */}
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {[
                {
                  Icon: Hand,
                  text: locale === "fr"
                    ? "Grattez avec le doigt sur le cercle doré"
                    : "Scratch with finger on the golden circle",
                },
                {
                  Icon: Scan,
                  text: locale === "fr"
                    ? "10 captures silencieuses pendant le grattage"
                    : "10 silent captures while scratching",
                },
                {
                  Icon: Sparkles,
                  text: locale === "fr"
                    ? "80 % gratté = Analyse complète IA"
                    : "80% scratched = Full AI analysis",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(212,175,55,.05)", border: `1px solid rgba(212,175,55,.12)` }}
                >
                  <step.Icon size={15} style={{ color: GOLD, flexShrink: 0 }} />
                  <p className="text-[11px] font-semibold text-white/50">{step.text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="mt-1 px-10 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase transition-all hover:brightness-110 active:scale-[.97]"
              style={{
                background: `linear-gradient(135deg, ${GOLD} 0%, #c9a040 100%)`,
                color: "#1a1700",
                boxShadow: "0 0 28px rgba(212,175,55,.4), 0 4px 16px rgba(0,0,0,.3)",
              }}
            >
              {locale === "fr" ? "Commencer à gratter" : "Start Scratching"}
            </button>
          </div>
        </div>
      )}

      {/* ══ REVEAL (video + scratch-card canvas) ══ */}
      {(phase === "reveal" || phase === "success") && (
        <div className="flex flex-col gap-3">
          <div
            className="relative w-full rounded-[1.75rem] overflow-hidden"
            style={{
              aspectRatio: "3/4",
              background: "#000",
              animation: phase === "success" ? "revSuccessGlow 1s ease-out" : "none",
            }}
          >
            {/* Video (underneath) */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline muted autoPlay
            />

            {/* Canvas scratch mask (on top) */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ touchAction: "none", cursor: "grab" }}
            />

            {/* Green flash */}
            {flashVisible && (
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  background: "rgba(0,255,157,0.25)",
                  animation: "revFlash .4s ease-out forwards",
                }}
              />
            )}

            {/* ── HUD ── */}

            {/* Progress ring (top-right) */}
            <div className="absolute top-3 right-3 z-30" style={{ animation: "revGaugePulse 2s ease-in-out infinite" }}>
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx={RING_CX} cy={RING_CY} r={RING_R + 4} fill="rgba(0,0,0,.55)" />
                <circle cx={RING_CX} cy={RING_CY} r={RING_R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="3.5" />
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

            {/* Captures (top-left) */}
            <div
              className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,.58)", border: `1px solid ${GOLD_FADED}` }}
            >
              <Scan size={12} style={{ color: GOLD }} />
              <p className="text-[11px] font-black" style={{ color: GOLD, fontFamily: "'Courier New',monospace" }}>
                {capturedCount}/10
              </p>
            </div>

            {/* Instruction (bottom center) */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center z-30 pointer-events-none">
              <div
                className="px-4 py-2 rounded-full flex items-center gap-2"
                style={{ background: "rgba(0,0,0,.62)", border: `1px solid ${GOLD_FADED}` }}
              >
                {phase === "success" ? (
                  <>
                    <CheckCircle size={14} style={{ color: "#00ff9d" }} />
                    <p className="text-xs font-bold text-white/90">
                      {locale === "fr" ? "Surface révélée !" : "Surface revealed!"}
                    </p>
                  </>
                ) : touchActive ? (
                  <>
                    <Hand size={14} style={{ color: GOLD }} />
                    <p className="text-xs font-semibold" style={{ color: GOLD_LIGHT }}>
                      {locale === "fr" ? "Continue de gratter..." : "Keep scratching..."}
                    </p>
                  </>
                ) : (
                  <>
                    <Hand
                      size={14}
                      style={{ color: GOLD, animation: "scratchHint 2s ease-in-out infinite" }}
                    />
                    <p className="text-xs font-semibold" style={{ color: GOLD_LIGHT }}>
                      {locale === "fr"
                        ? "Grattez avec votre doigt"
                        : "Scratch with your finger"}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Torch */}
            {torchAvail && (
              <button
                onClick={toggleTorch}
                className="absolute bottom-3 right-3 z-30 w-9 h-9 rounded-xl flex items-center justify-center pointer-events-auto"
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

          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-white/50 uppercase tracking-wider">
                {locale === "fr" ? "Analyse de Surface" : "Surface Analysis"}
              </p>
              <p className="text-xs font-black" style={{ color: pctColor, fontFamily: "'Courier New',monospace" }}>
                {revealedPct} %
              </p>
            </div>

            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${revealedPct}%`,
                  background: revealedPct >= 80
                    ? "linear-gradient(90deg,#059669,#00ff9d)"
                    : `linear-gradient(90deg,${GOLD_FADED},${GOLD})`,
                  boxShadow: `0 0 8px ${pctColor}55`,
                }}
              />
            </div>

            {/* Capture dots */}
            <div className="flex items-center justify-between px-0.5 mt-0.5">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full transition-all duration-200"
                  style={{
                    background: i < capturedCount ? GOLD : "rgba(255,255,255,.08)",
                    boxShadow: i < capturedCount ? "0 0 4px rgba(212,175,55,.5)" : "none",
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
            style={{ background: "rgba(0,255,157,.08)", border: "1px solid rgba(0,255,157,.25)" }}
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
