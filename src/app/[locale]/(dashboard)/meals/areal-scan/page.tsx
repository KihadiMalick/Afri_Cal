"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { isValidLocale } from "@/i18n";
import { GLASS_CARD } from "@/components/lixum/LixumShell";
import ArealScan from "@/components/scan/ArealScan";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN PAGE
   /[locale]/meals/areal-scan
   ══════════════════════════════════════════════════════════ */

type PagePhase = "idle" | "scanning" | "uploading" | "done" | "error";

export default function ArealScanPage() {
  const params    = useParams();
  const router    = useRouter();
  const locale    = isValidLocale(params?.locale as string) ? (params.locale as "fr" | "en") : "fr";
  const supabase  = createClient();

  const [phase,       setPhase]       = useState<PagePhase>("idle");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [uploadedPct, setUploadedPct] = useState(0);
  const [scanId,      setScanId]      = useState("");
  const [framesCount, setFramesCount] = useState(0);

  /* ── Called by ArealScan when rotation is complete ── */
  const handleScanComplete = useCallback(async (frames: string[], coverage: number) => {
    setPhase("uploading");

    try {
      /* Upload frames to Supabase via API route */
      setUploadedPct(10);
      const res = await fetch("/api/areal-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames, coverage }),
      });
      setUploadedPct(80);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      const result = await res.json() as { scanId: string; framesUploaded: number; coverage: number };
      setUploadedPct(100);
      setScanId(result.scanId);
      setFramesCount(result.framesUploaded);
      setPhase("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload error");
      setPhase("error");
    }
  }, []);

  const handleCancel = useCallback(() => {
    router.push(`/${locale}/meals/scan`);
  }, [locale, router]);

  /* ── Redirect to regular scan result ── */
  const handleContinue = useCallback(() => {
    router.push(`/${locale}/meals`);
  }, [locale, router]);

  void supabase; // used by child components

  /* ────────────────────────────────────────────────────── */
  return (
    <div
      className="max-w-lg mx-auto px-3 pt-5 pb-12"
      style={{ fontFamily: "'Outfit','Poppins',sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/${locale}/meals/scan`}
          className="p-2.5 rounded-xl transition-colors"
          style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)" }}
        >
          <ArrowLeft size={18} strokeWidth={2} style={{ color: "rgba(255,255,255,.70)" }} />
        </Link>
        <div>
          <h1 className="font-black text-lg text-white tracking-wide">
            LIXUM <span style={{ color: "#00ff9d", textShadow: "0 0 10px rgba(0,255,157,.6)" }}>Areal Scan</span>
          </h1>
          <p className="text-xs text-white/45 font-semibold uppercase tracking-widest">
            {locale === "fr" ? "Scan spatial 3D" : "3D Spatial Scan"}
          </p>
        </div>
      </div>

      {/* ── Scanner (idle / scanning) ── */}
      {(phase === "idle" || phase === "scanning") && (
        <ArealScan
          locale={locale}
          onScanComplete={handleScanComplete}
          onCancel={handleCancel}
        />
      )}

      {/* ── Uploading ── */}
      {phase === "uploading" && (
        <div
          className="flex flex-col items-center gap-5 py-12 px-5 rounded-[2rem] text-center"
          style={{ ...GLASS_CARD, border: "1px solid rgba(0,255,157,.14)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,255,157,.08)", border: "1px solid rgba(0,255,157,.25)" }}
          >
            <Zap size={30} strokeWidth={1.5} style={{ color: "#00ff9d" }} />
          </div>
          <div>
            <p className="text-white font-bold text-base mb-1">
              {locale === "fr" ? "Envoi vers LIXUM Cloud…" : "Uploading to LIXUM Cloud…"}
            </p>
            <p className="text-white/45 text-sm font-medium">
              {locale === "fr" ? "Traitement des clichés en cours" : "Processing captured frames"}
            </p>
          </div>
          {/* Progress bar */}
          <div className="w-full">
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${uploadedPct}%`,
                  background: "linear-gradient(90deg,#059669,#00ff9d)",
                  boxShadow: "0 0 10px rgba(0,255,157,.5)",
                }}
              />
            </div>
            <p className="text-right text-xs font-black mt-1" style={{ color: "#00ff9d" }}>
              {uploadedPct}%
            </p>
          </div>
        </div>
      )}

      {/* ── Done ── */}
      {phase === "done" && (
        <div
          className="flex flex-col items-center gap-5 py-10 px-5 rounded-[2rem] text-center"
          style={{ ...GLASS_CARD, border: "1px solid rgba(0,255,157,.22)" }}
        >
          {/* LIXUM logo */}
          <p
            className="font-black text-2xl tracking-[.18em]"
            style={{ fontFamily: "'Courier New',monospace" }}
          >
            <span style={{ color: "#8b949e" }}>LI</span>
            <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d" }}>X</span>
            <span style={{ color: "#8b949e" }}>UM</span>
          </p>

          <p className="text-white font-bold text-base">
            {locale === "fr" ? "Scan 3D réussi !" : "3D Scan Successful!"}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              {
                label: locale === "fr" ? "Clichés capturés" : "Frames captured",
                value: framesCount,
                unit: "",
                color: "#00ff9d",
              },
              {
                label: locale === "fr" ? "ID du scan" : "Scan ID",
                value: scanId.slice(-6),
                unit: "",
                color: "rgba(255,255,255,.65)",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 py-3 rounded-xl"
                style={{ background: "rgba(0,255,157,.05)", border: "1px solid rgba(0,255,157,.10)" }}
              >
                <p
                  className="font-black text-3xl"
                  style={{ color: s.color, fontFamily: "'Courier New',monospace" }}
                >
                  {s.value}
                </p>
                <p className="text-white/50 text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-white/45 text-xs font-medium max-w-xs">
            {locale === "fr"
              ? "Les données 3D ont été envoyées au Moteur LIXUM pour calculer le volume et les macronutriments."
              : "3D data sent to LIXUM Engine to compute volume and macronutrients."}
          </p>

          <button
            onClick={handleContinue}
            className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black transition-all hover:brightness-110"
            style={{ background: "#00ff9d", boxShadow: "0 0 24px rgba(0,255,157,.45)" }}
          >
            {locale === "fr" ? "Voir mes repas" : "View my meals"}
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {phase === "error" && (
        <div
          className="flex flex-col items-center gap-4 py-10 px-5 rounded-[2rem] text-center"
          style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.18)" }}
        >
          <p className="text-red-400 font-bold text-base">
            {locale === "fr" ? "Erreur de téléversement" : "Upload error"}
          </p>
          <p className="text-red-400/70 text-sm">{errorMsg}</p>
          <button
            onClick={() => setPhase("idle")}
            className="px-8 py-3 rounded-xl font-bold text-sm text-white/80 transition-all hover:text-white"
            style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.10)" }}
          >
            {locale === "fr" ? "Réessayer" : "Try again"}
          </button>
        </div>
      )}

      {/* ── Tips card (always visible when idle) ── */}
      {phase === "idle" && (
        <div
          className="mt-4 p-4 rounded-2xl"
          style={{ background: "rgba(0,255,157,.04)", border: "1px solid rgba(0,255,157,.08)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(0,255,157,.60)" }}>
            {locale === "fr" ? "Moteur de Précision LIXUM" : "LIXUM Accuracy Engine"}
          </p>
          <p className="text-white/50 text-xs leading-relaxed">
            {locale === "fr"
              ? "Le moteur calcule le volume (cm³) → convertit en grammes → applique la formule stricte : Calories = (Prot × 4) + (Gluc × 4) + (Lip × 9)."
              : "Engine computes volume (cm³) → converts to grams → applies strict formula: Calories = (Prot × 4) + (Carbs × 4) + (Fat × 9)."}
          </p>
        </div>
      )}
    </div>
  );
}
