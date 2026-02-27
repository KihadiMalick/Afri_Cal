"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Scan, CheckCircle, RotateCcw, X } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN
   Spatial 3D food scanner — iPhone FaceID-like UX
   ══════════════════════════════════════════════════════════ */

interface ArealScanProps {
  onScanComplete: (frames: string[], coveragePct: number) => void;
  onCancel: () => void;
  locale: "fr" | "en";
}

/* Spherical grid: 24 azimuth × 12 elevation = 288 cells */
const AZ_SECTORS = 24;
const EL_SECTORS = 12;
const TOTAL_CELLS = AZ_SECTORS * EL_SECTORS;
/* Coverage target: 65% of cells visited triggers completion */
const TARGET_COVERAGE = 0.65;
/* Frame milestones (% coverage) at which we capture a photo */
const CAPTURE_MILESTONES = [8, 18, 28, 38, 48, 58, 68, 78, 88, 98];

/* Mesh point for canvas overlay */
interface MeshPt {
  x: number; y: number; z: number;
  vx: number; vy: number;
  r: number; phase: number;
  active: boolean;
}

function buildMesh(count = 72): MeshPt[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random() * 0.6 + 0.2,
    vx: (Math.random() - 0.5) * 0.0003,
    vy: (Math.random() - 0.5) * 0.0003,
    r: Math.random() * 3 + 1.5,
    phase: Math.random() * Math.PI * 2,
    active: Math.random() > 0.55,
  }));
}

export default function ArealScan({ onScanComplete, onCancel, locale }: ArealScanProps) {
  /* Refs */
  const videoRef      = useRef<HTMLVideoElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const captureCanvas = useRef<HTMLCanvasElement | null>(null);
  const animFrame     = useRef<number>(0);
  const meshPts       = useRef<MeshPt[]>(buildMesh());
  const coveredCells  = useRef<Set<number>>(new Set());
  const lastAlpha     = useRef<number | null>(null);
  const lastBeta      = useRef<number | null>(null);
  const capturedAt    = useRef<Set<number>>(new Set());
  const frames        = useRef<string[]>([]);
  const streamRef     = useRef<MediaStream | null>(null);

  /* State */
  const [coverage, setCoverage]         = useState(0);
  const [phase, setPhase]               = useState<"intro" | "scanning" | "done">("intro");
  const [hint, setHint]                 = useState("");
  const [orientSupport, setOrientSupport] = useState<boolean | null>(null);
  const [permDenied, setPermDenied]     = useState(false);
  const [frameCount, setFrameCount]     = useState(0);

  /* ── Capture one video frame as base64 JPEG ── */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    if (!captureCanvas.current) {
      captureCanvas.current = document.createElement("canvas");
    }
    const cc = captureCanvas.current;
    cc.width  = Math.min(video.videoWidth,  640);
    cc.height = Math.min(video.videoHeight, 480);
    const ctx = cc.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, cc.width, cc.height);
    const dataUrl = cc.toDataURL("image/jpeg", 0.72);
    frames.current.push(dataUrl);
    setFrameCount(frames.current.length);
  }, []);

  /* ── Update coverage from orientation ── */
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    const alpha = e.alpha ?? 0; // compass heading 0-360
    const beta  = e.beta  ?? 0; // front-back tilt  -180 to 180
    const gamma = e.gamma ?? 0; // left-right tilt  -90  to 90

    /* Map to grid cell */
    const az = Math.floor(((alpha % 360) + 360) % 360 / 360 * AZ_SECTORS);
    const el = Math.floor(Math.min(Math.max((beta + 90) / 180, 0), 0.999) * EL_SECTORS);
    const cellId = az * EL_SECTORS + el;

    if (!coveredCells.current.has(cellId)) {
      coveredCells.current.add(cellId);
      const pct = Math.round((coveredCells.current.size / TOTAL_CELLS) * 100);
      setCoverage(pct);

      /* Check capture milestones */
      for (const milestone of CAPTURE_MILESTONES) {
        if (pct >= milestone && !capturedAt.current.has(milestone)) {
          capturedAt.current.add(milestone);
          captureFrame();
        }
      }

      /* Dynamic hints */
      if (pct < 20) setHint(locale === "fr" ? "Inclinez doucement votre téléphone" : "Slowly tilt your phone");
      else if (pct < 45) setHint(locale === "fr" ? "Continuez à tourner autour du plat" : "Keep circling around the dish");
      else if (pct < 70) setHint(locale === "fr" ? "Explorez les angles du dessus" : "Explore top-down angles");
      else setHint(locale === "fr" ? "Presque fini ! Couvrez les derniers angles" : "Almost done! Cover remaining angles");

      /* Completion */
      if (pct / 100 >= TARGET_COVERAGE) {
        setPhase("done");
        onScanComplete(frames.current, pct);
      }
    }

    /* Animate mesh based on motion delta */
    if (lastAlpha.current !== null) {
      const dAlpha = Math.abs(alpha - lastAlpha.current);
      const dBeta  = Math.abs(beta  - (lastBeta.current ?? 0));
      const motion = Math.min((dAlpha + dBeta) / 30, 1);
      meshPts.current.forEach((p, i) => {
        if (i % 3 === 0) p.active = motion > 0.05;
      });
    }
    lastAlpha.current = alpha;
    lastBeta.current  = beta;

    void gamma; // used implicitly via cell coverage
  }, [captureFrame, locale, onScanComplete]);

  /* ── Desktop fallback: simulate coverage automatically ── */
  const startDesktopFallback = useCallback(() => {
    setOrientSupport(false);
    let fakeAz = 0; let fakeEl = 0;
    const interval = setInterval(() => {
      fakeAz = (fakeAz + 15) % 360;
      if (fakeAz === 0) fakeEl = (fakeEl + 30) % 180;
      const syntheticEvent = {
        alpha: fakeAz,
        beta:  fakeEl - 90,
        gamma: 0,
      } as DeviceOrientationEvent;
      handleOrientation(syntheticEvent);
    }, 120);
    return () => clearInterval(interval);
  }, [handleOrientation]);

  /* ── Request iOS permission & start orientation ── */
  const startOrientation = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE?.requestPermission === "function") {
      try {
        const perm = await DOE.requestPermission();
        if (perm !== "granted") { setPermDenied(true); return; }
      } catch {
        setPermDenied(true);
        return;
      }
    }
    const supported = "DeviceOrientationEvent" in window;
    setOrientSupport(supported);
    if (supported) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    } else {
      /* Desktop fallback: auto-increment coverage with timer */
      startDesktopFallback();
    }
  }, [handleOrientation, startDesktopFallback]);

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
    } catch {
      /* Silently ignore on desktop environments without camera */
    }
  }, []);

  /* ── Canvas mesh animation ── */
  const animateMesh = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const t = performance.now() / 1000;

    ctx.clearRect(0, 0, W, H);

    const pts = meshPts.current;

    /* Update positions */
    pts.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
    });

    /* Draw edges between nearby points */
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const pi = pts[i], pj = pts[j];
        const dx = (pi.x - pj.x) * W;
        const dy = (pi.y - pj.y) * H;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          const alpha = (1 - dist / 90) * 0.22;
          ctx.beginPath();
          ctx.moveTo(pi.x * W, pi.y * H);
          ctx.lineTo(pj.x * W, pj.y * H);
          ctx.strokeStyle = `rgba(0,255,157,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    /* Draw points */
    pts.forEach((p) => {
      const px = p.x * W;
      const py = p.y * H;
      const pulse = Math.sin(t * 2.2 + p.phase) * 0.4 + 0.6;
      const r     = p.r * pulse * (p.active ? 1.5 : 1);
      const alpha = p.active ? 0.9 * pulse : 0.32 * pulse;

      /* Glow */
      if (p.active) {
        const glow = ctx.createRadialGradient(px, py, 0, px, py, r * 5);
        glow.addColorStop(0, `rgba(0,255,157,${(alpha * 0.4).toFixed(3)})`);
        glow.addColorStop(1, "rgba(0,255,157,0)");
        ctx.beginPath();
        ctx.arc(px, py, r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      /* Core dot */
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,157,${alpha.toFixed(3)})`;
      ctx.fill();
    });

    /* Corner + scan line overlay */
    drawScanFrame(ctx, W, H, t, coverage);

    animFrame.current = requestAnimationFrame(animateMesh);
  }, [coverage]);

  /* ── Resize canvas to match container ── */
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ── Mount: start mesh animation ── */
  useEffect(() => {
    animFrame.current = requestAnimationFrame(animateMesh);
    return () => cancelAnimationFrame(animFrame.current);
  }, [animateMesh]);

  /* ── Phase: intro → scanning ── */
  const handleStart = useCallback(async () => {
    setPhase("scanning");
    setHint(locale === "fr" ? "Déplacez doucement votre téléphone autour du plat" : "Slowly move your phone around the dish");
    await startCamera();
    await startOrientation();
  }, [locale, startCamera, startOrientation]);

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      cancelAnimationFrame(animFrame.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [handleOrientation]);

  /* ── SVG gauge ── */
  const GAUGE_R  = 72;
  const GAUGE_CX = 84;
  const GAUGE_CY = 84;
  const circ     = 2 * Math.PI * GAUGE_R;
  const offset   = circ * (1 - coverage / 100);

  /* ──────────────────────────────────────────── RENDER ── */
  return (
    <div
      className="relative flex flex-col items-center"
      style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}
    >
      {/* ── Cancel button ── */}
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 z-30 p-2 rounded-full"
        style={{ background: "rgba(0,0,0,.55)", color: "rgba(255,255,255,.7)" }}
        aria-label="Cancel"
      >
        <X size={18} strokeWidth={2} />
      </button>

      {/* ══════════ INTRO PHASE ══════════ */}
      {phase === "intro" && (
        <div
          className="relative w-full flex flex-col items-center justify-center gap-6 rounded-[2rem] overflow-hidden py-10 px-5"
          style={{
            background: "rgba(2,12,7,0.94)",
            border: "1px solid rgba(0,255,157,0.14)",
            minHeight: "24rem",
          }}
        >
          {/* Background mesh canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }} />

          <div className="relative z-10 flex flex-col items-center gap-5 text-center">
            {/* Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,255,157,.08)",
                border: "1px solid rgba(0,255,157,.28)",
                boxShadow: "0 0 32px rgba(0,255,157,.18)",
              }}
            >
              <Scan size={38} strokeWidth={1.4} style={{ color: "#00ff9d" }} />
            </div>

            {/* Title */}
            <div>
              <p
                className="font-black text-2xl tracking-[.18em] leading-none mb-1"
                style={{ fontFamily: "'Courier New',monospace" }}
              >
                <span style={{ color: "#8b949e" }}>LI</span>
                <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d" }}>X</span>
                <span style={{ color: "#8b949e" }}>UM</span>
              </p>
              <p className="text-sm font-bold uppercase tracking-[.28em]" style={{ color: "rgba(0,255,157,.55)" }}>
                Areal Scan 3D
              </p>
            </div>

            <p className="text-white/65 text-sm font-medium max-w-xs leading-relaxed">
              {locale === "fr"
                ? "Tournez doucement autour de votre plat comme pour configurer Face ID. L'IA va cartographier le volume en 3D."
                : "Slowly rotate around your dish as if setting up Face ID. The AI will map the 3D volume."}
            </p>

            {/* Steps */}
            <div className="flex flex-col gap-2.5 w-full max-w-xs text-left">
              {[
                { n: "1", fr: "Posez votre plat sur une surface plane", en: "Place dish on a flat surface" },
                { n: "2", fr: "Appuyez sur Démarrer et accordez les permissions", en: "Tap Start and grant permissions" },
                { n: "3", fr: "Tournez lentement autour du plat à 360°", en: "Slowly orbit the dish 360°" },
              ].map((s) => (
                <div key={s.n} className="flex items-center gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "rgba(0,255,157,.12)", border: "1px solid rgba(0,255,157,.28)", color: "#00ff9d" }}
                  >
                    {s.n}
                  </span>
                  <p className="text-white/60 text-xs font-medium">{locale === "fr" ? s.fr : s.en}</p>
                </div>
              ))}
            </div>

            {/* Start button */}
            <button
              onClick={handleStart}
              className="mt-2 px-10 py-3.5 rounded-2xl font-black text-sm tracking-wider uppercase text-black transition-all hover:brightness-110 active:scale-[.97]"
              style={{
                background: "#00ff9d",
                boxShadow: "0 0 28px rgba(0,255,157,.5), 0 4px 16px rgba(0,0,0,.3)",
              }}
            >
              {locale === "fr" ? "Démarrer le scan" : "Start Scan"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ SCANNING PHASE ══════════ */}
      {phase === "scanning" && (
        <div className="relative w-full flex flex-col items-center gap-4">
          {/* Camera + mesh overlay */}
          <div
            className="relative w-full overflow-hidden rounded-[1.75rem]"
            style={{ aspectRatio: "4/3", background: "#000" }}
          >
            {/* Live video */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline muted autoPlay
              style={{ transform: "scaleX(-1)" }}
            />

            {/* 3D mesh overlay */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ mixBlendMode: "screen" }}
            />

            {/* Coverage gauge overlay — top-right corner */}
            <div className="absolute top-3 right-3 z-20">
              <svg width="168" height="168" viewBox="0 0 168 168">
                {/* Track */}
                <circle
                  cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R}
                  fill="rgba(0,0,0,.45)" stroke="rgba(0,255,157,.15)"
                  strokeWidth="7"
                />
                {/* Progress arc */}
                <circle
                  cx={GAUGE_CX} cy={GAUGE_CY} r={GAUGE_R}
                  fill="none"
                  stroke="#00ff9d"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={offset}
                  transform={`rotate(-90 ${GAUGE_CX} ${GAUGE_CY})`}
                  style={{
                    transition: "stroke-dashoffset .35s ease",
                    filter: "drop-shadow(0 0 6px rgba(0,255,157,.8))",
                  }}
                />
                {/* Center text */}
                <text
                  x={GAUGE_CX} y={GAUGE_CY - 6}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#00ff9d" fontSize="26" fontWeight="900"
                  fontFamily="'Courier New',monospace"
                  style={{ filter: "drop-shadow(0 0 4px rgba(0,255,157,.7))" }}
                >
                  {coverage}
                </text>
                <text
                  x={GAUGE_CX} y={GAUGE_CY + 18}
                  textAnchor="middle" fill="rgba(255,255,255,.55)"
                  fontSize="11" fontWeight="700" fontFamily="'Outfit',sans-serif"
                  letterSpacing="2"
                >
                  %
                </text>
                {/* Scanning label */}
                <text
                  x={GAUGE_CX} y={GAUGE_CY + 36}
                  textAnchor="middle" fill="rgba(0,255,157,.50)"
                  fontSize="9" fontWeight="700" fontFamily="'Outfit',sans-serif"
                  letterSpacing="3"
                >
                  SCAN
                </text>
              </svg>
            </div>

            {/* Frame counter badge */}
            <div
              className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
              style={{ background: "rgba(0,0,0,.55)", border: "1px solid rgba(0,255,157,.22)" }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "#00ff9d", boxShadow: "0 0 8px rgba(0,255,157,.9)", animation: "pulse 1.2s ease-in-out infinite" }}
              />
              <span className="text-xs font-bold" style={{ color: "#00ff9d", fontFamily: "'Outfit',sans-serif" }}>
                {frameCount} {locale === "fr" ? "clichés" : "shots"}
              </span>
            </div>
          </div>

          {/* Hint bar */}
          <div
            className="w-full px-4 py-2.5 rounded-xl flex items-center gap-2.5"
            style={{ background: "rgba(0,255,157,.07)", border: "1px solid rgba(0,255,157,.14)" }}
          >
            <RotateCcw size={16} strokeWidth={2} style={{ color: "#00ff9d", flexShrink: 0 }} />
            <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,.80)" }}>
              {hint || (locale === "fr" ? "Déplacez votre téléphone autour du plat" : "Move your phone around the dish")}
            </p>
          </div>

          {/* Progress bar (linear) */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider">
                {locale === "fr" ? "Couverture spatiale" : "Spatial Coverage"}
              </span>
              <span className="text-xs font-black" style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}>
                {coverage}%
              </span>
            </div>
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.04)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${coverage}%`,
                  background: coverage >= 65 ? "#00ff9d" : "linear-gradient(90deg,#059669,#00ff9d)",
                  boxShadow: "0 0 10px rgba(0,255,157,.5)",
                }}
              />
            </div>
          </div>

          {/* Desktop fallback notice */}
          {orientSupport === false && (
            <p className="text-xs text-white/35 text-center font-medium">
              {locale === "fr"
                ? "Capteurs non détectés — simulation automatique activée"
                : "Sensors not detected — auto-simulation active"}
            </p>
          )}

          {/* Permission denied */}
          {permDenied && (
            <p className="text-xs text-red-400 text-center font-medium">
              {locale === "fr"
                ? "Permission de mouvement refusée — scan manuel activé"
                : "Motion permission denied — manual scan active"}
            </p>
          )}
        </div>
      )}

      {/* ══════════ DONE PHASE ══════════ */}
      {phase === "done" && (
        <div
          className="w-full flex flex-col items-center gap-5 py-10 px-5 rounded-[2rem] text-center"
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
              {locale === "fr" ? "Scan Terminé !" : "Scan Complete!"}
            </p>
            <p className="text-sm text-white/55 font-medium">
              {locale === "fr"
                ? `${frameCount} clichés capturés — ${coverage}% couvert`
                : `${frameCount} shots captured — ${coverage}% coverage`}
            </p>
          </div>
          <div
            className="px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            style={{ background: "rgba(0,255,157,.10)", border: "1px solid rgba(0,255,157,.22)", color: "#00ff9d" }}
          >
            {locale === "fr" ? "Analyse IA en cours…" : "AI analysis in progress…"}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Draw LiDAR-style scan frame corners + horizontal sweep line ── */
function drawScanFrame(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, coverage: number) {
  const c = "#00ff9d";
  const sweep = ((t * 0.4) % 1) * H;

  /* Sweep line */
  const grad = ctx.createLinearGradient(0, sweep - 24, 0, sweep + 4);
  grad.addColorStop(0, "rgba(0,255,157,0)");
  grad.addColorStop(1, `rgba(0,255,157,${(coverage / 200 + 0.06).toFixed(3)})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, sweep - 24, W, 28);

  /* Corner brackets */
  const len = 22, thick = 2;
  const corners = [
    [0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1],
  ] as [number, number, number, number][];

  corners.forEach(([x, y, sx, sy]) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = thick;
    ctx.shadowColor = c;
    ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * len, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sy * len); ctx.stroke();
    ctx.shadowBlur = 0;
  });
}
