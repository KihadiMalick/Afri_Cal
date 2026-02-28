"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Zap, Check, Trash2, ChevronDown, ChevronUp,
  AlertTriangle, RotateCcw, Weight, Flame, Beef, Wheat, Droplets,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { isValidLocale } from "@/i18n";
import { GLASS_CARD } from "@/components/lixum/LixumShell";
import ArealScan from "@/components/scan/ArealScan";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN PAGE — v6 "Precision Mapping"
   /[locale]/meals/areal-scan
   ══════════════════════════════════════════════════════════ */

type PagePhase = "idle" | "scanning" | "uploading" | "confirming" | "done" | "error";

/* ── Ingredient state (received from API + modified by user) ── */
interface IngredientState {
  name: string;
  weightGrams: number;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  /** pending = grey  /  confirmed = white/green  /  removed = hidden */
  status: "pending" | "confirmed" | "removed";
  /** ai = normal  /  ai_flagged = barred (inconsistent with standard recipe) */
  source: "ai" | "ai_flagged";
}

/* ── Nutrient summary ── */
interface NutrientSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/* ══════════════════════════════════════════════════════════
   Moteur de Calcul Dynamique LIXUM
   Strict formula: Calories = (Prot × 4) + (Carbs × 4) + (Fat × 9)
   Recalculates instantly on every user modification
   ══════════════════════════════════════════════════════════ */
function calculateNutrients(ingredients: IngredientState[]): NutrientSummary {
  let protein = 0, carbs = 0, fat = 0;
  for (const ing of ingredients) {
    if (ing.status === "removed") continue;
    const f  = ing.weightGrams / 100;
    protein += ing.proteinPer100g * f;
    carbs   += ing.carbsPer100g  * f;
    fat     += ing.fatPer100g    * f;
  }
  return {
    calories: Math.round(protein * 4 + carbs * 4 + fat * 9),
    protein:  Math.round(protein * 10) / 10,
    carbs:    Math.round(carbs   * 10) / 10,
    fat:      Math.round(fat     * 10) / 10,
  };
}

/* ── Vitality Score: 0-100 based on macro balance ── */
function calculateVitalityScore(n: NutrientSummary): number {
  if (n.calories === 0) return 0;
  const protRatio = (n.protein * 4) / n.calories;
  const carbRatio = (n.carbs * 4) / n.calories;
  const fatRatio  = (n.fat * 9) / n.calories;

  /* Ideal ranges: Protein 15-30%, Carbs 40-55%, Fat 20-35% */
  let score = 100;
  if (protRatio < 0.10) score -= 20;
  else if (protRatio < 0.15) score -= 10;
  else if (protRatio > 0.35) score -= 5;

  if (carbRatio < 0.30) score -= 15;
  else if (carbRatio > 0.60) score -= 10;

  if (fatRatio < 0.15) score -= 10;
  else if (fatRatio > 0.40) score -= 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/* ══════════════════════════════════════════════════════════ */
export default function ArealScanPage() {
  const params   = useParams();
  const router   = useRouter();
  const locale   = isValidLocale(params?.locale as string)
    ? (params.locale as "fr" | "en") : "fr";
  const supabase = createClient();

  const [phase,       setPhase]       = useState<PagePhase>("idle");
  const [errorMsg,    setErrorMsg]    = useState("");
  const [uploadedPct, setUploadedPct] = useState(0);
  const [, setScanId] = useState("");
  const [framesCount, setFramesCount] = useState(0);
  const [dishName,    setDishName]    = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientState[]>([]);
  const [estimatedWeight, setEstimatedWeight] = useState(0);

  /* Real-time nutrient summary — recalculates on every ingredient change */
  const nutrients = calculateNutrients(ingredients);
  const vitalityScore = calculateVitalityScore(nutrients);

  /* ── ArealScan callback when capture is complete ── */
  const handleScanComplete = useCallback(async (frames: string[], coverage: number) => {
    setPhase("uploading");
    try {
      setUploadedPct(20);
      const res = await fetch("/api/areal-scan", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ frames, coverage }),
      });
      setUploadedPct(85);

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }

      const result = await res.json() as {
        scanId: string;
        framesUploaded: number;
        coverage: number;
        dishName: string | null;
        estimatedWeight: number;
        ingredients: IngredientState[];
      };

      setUploadedPct(100);
      setScanId(result.scanId);
      setFramesCount(result.framesUploaded);
      setDishName(result.dishName);
      setEstimatedWeight(result.estimatedWeight || 0);
      setIngredients(result.ingredients ?? []);
      setPhase(result.ingredients?.length > 0 ? "confirming" : "done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload error");
      setPhase("error");
    }
  }, []);

  const handleCancel = useCallback(() => {
    router.push(`/${locale}/meals/scan`);
  }, [locale, router]);

  /* ── Ingredient actions (each triggers recalculation via state update) ── */
  const toggleConfirm = useCallback((idx: number) => {
    setIngredients((prev: IngredientState[]) => prev.map((ing: IngredientState, i: number) =>
      i === idx
        ? { ...ing, status: ing.status === "confirmed" ? "pending" as const : "confirmed" as const }
        : ing
    ));
  }, []);

  const removeIngredient = useCallback((idx: number) => {
    setIngredients((prev: IngredientState[]) => prev.map((ing: IngredientState, i: number) =>
      i === idx ? { ...ing, status: "removed" as const } : ing
    ));
  }, []);

  const restoreIngredient = useCallback((idx: number) => {
    setIngredients((prev: IngredientState[]) => prev.map((ing: IngredientState, i: number) =>
      i === idx ? { ...ing, status: "pending" as const } : ing
    ));
  }, []);

  const setWeight = useCallback((idx: number, grams: number) => {
    setIngredients((prev: IngredientState[]) => prev.map((ing: IngredientState, i: number) =>
      i === idx ? { ...ing, weightGrams: Math.max(1, Math.min(1000, grams)) } : ing
    ));
  }, []);

  /* ── Confirm all and save meal ── */
  const confirmAndSave = useCallback(async () => {
    const active = ingredients.filter((i: IngredientState) => i.status !== "removed");
    const n = calculateNutrients(active);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("meals").insert({
          user_id:   user.id,
          name:      dishName ?? (locale === "fr" ? "Plat scanné (Areal Scan)" : "Scanned dish (Areal Scan)"),
          meal_type: "lunch",
          calories:  n.calories,
          protein:   n.protein,
          carbs:     n.carbs,
          fat:       n.fat,
          date:      new Date().toISOString().split("T")[0],
        });
      }
    } catch { /* ignore save errors, still navigate */ }
    setPhase("done");
  }, [supabase, ingredients, dishName, locale]);

  /* Count removed (barred) ingredients */
  const removedIngredients = ingredients.filter((i: IngredientState) => i.status === "removed");
  const activeIngredients  = ingredients.filter((i: IngredientState) => i.status !== "removed");

  /* ════════════════════════════════════════════════════════ */
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
            LIXUM{" "}
            <span style={{ color: "#00ff9d", textShadow: "0 0 10px rgba(0,255,157,.6)" }}>
              Precision
            </span>
          </h1>
          <p className="text-xs text-white/45 font-semibold uppercase tracking-widest">
            {locale === "fr" ? "Cartographie AR · Scan Spatial" : "AR Mapping · Spatial Scan"}
          </p>
        </div>
      </div>

      {/* ── Scanner (idle / scanning phases handled internally by ArealScan) ── */}
      {(phase === "idle" || phase === "scanning") && (
        <ArealScan
          locale={locale}
          onScanComplete={handleScanComplete}
          onCancel={handleCancel}
        />
      )}

      {/* ── Uploading + Analysis ── */}
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
              {locale === "fr" ? "Moteur de Précision LIXUM…" : "LIXUM Precision Engine…"}
            </p>
            <p className="text-white/45 text-sm font-medium">
              {locale === "fr"
                ? "IA sans limite · Validation base de données"
                : "Uncapped AI · Database validation"}
            </p>
          </div>
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

      {/* ══════════════════════════════════════════════════════════
         CONFIRMING PHASE — Results + Validation + Dynamic Calculation
         ══════════════════════════════════════════════════════════ */}
      {phase === "confirming" && (
        <div className="flex flex-col gap-4">

          {/* Dish name header */}
          <div className="flex flex-col gap-0.5 px-0.5">
            {dishName && (
              <p className="font-black text-white text-xl leading-tight">{dishName}</p>
            )}
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
              {locale === "fr"
                ? "Résultats à confirmer · Modifiez pour recalculer"
                : "Results to confirm · Edit to recalculate"}
            </p>
          </div>

          {/* ── Dark Dashboard: Vitality Score + Real-time Macros ── */}
          <div
            className="p-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(2,12,7,0.95) 0%, rgba(0,30,15,0.90) 100%)",
              border: "1px solid rgba(0,255,157,.18)",
              boxShadow: "0 0 30px rgba(0,255,157,.08)",
            }}
          >
            {/* Vitality Score */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(0,255,157,.10)", border: "1px solid rgba(0,255,157,.25)" }}
                >
                  <Flame size={16} style={{ color: "#00ff9d" }} />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                    {locale === "fr" ? "Score Vitalité" : "Vitality Score"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-24 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${vitalityScore}%`,
                      background: vitalityScore >= 70
                        ? "linear-gradient(90deg,#059669,#00ff9d)"
                        : vitalityScore >= 40
                        ? "linear-gradient(90deg,#d97706,#fbbf24)"
                        : "linear-gradient(90deg,#dc2626,#ef4444)",
                      boxShadow: `0 0 6px ${vitalityScore >= 70 ? "rgba(0,255,157,.5)" : vitalityScore >= 40 ? "rgba(251,191,36,.5)" : "rgba(239,68,68,.5)"}`,
                    }}
                  />
                </div>
                <p
                  className="text-sm font-black"
                  style={{
                    color: vitalityScore >= 70 ? "#00ff9d" : vitalityScore >= 40 ? "#fbbf24" : "#ef4444",
                    fontFamily: "'Courier New',monospace",
                  }}
                >
                  {vitalityScore}
                </p>
              </div>
            </div>

            {/* Calories (main) + Macros grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Calories (spans 1 col but bigger) */}
              <div className="flex flex-col items-center justify-center py-2">
                <p
                  className="text-3xl font-black leading-none"
                  style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace", textShadow: "0 0 12px rgba(0,255,157,.4)" }}
                >
                  {nutrients.calories}
                </p>
                <p className="text-[9px] text-white/40 font-bold mt-1 uppercase tracking-wider">kcal</p>
              </div>
              {/* Macros */}
              {[
                { label: locale === "fr" ? "Prot." : "Prot.", value: nutrients.protein, unit: "g", color: "#60a5fa", Icon: Beef },
                { label: locale === "fr" ? "Gluc." : "Carbs", value: nutrients.carbs,   unit: "g", color: "#fbbf24", Icon: Wheat },
                { label: locale === "fr" ? "Lip."  : "Fat",   value: nutrients.fat,     unit: "g", color: "#fb923c", Icon: Droplets },
              ].map(m => (
                <div
                  key={m.label}
                  className="flex flex-col items-center justify-center py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.05)" }}
                >
                  <m.Icon size={12} style={{ color: m.color, marginBottom: 2 }} />
                  <p
                    className="text-lg font-black leading-none"
                    style={{ color: m.color, fontFamily: "'Courier New',monospace" }}
                  >
                    {m.value}
                  </p>
                  <p className="text-[8px] text-white/30 font-medium mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Estimated weight */}
            {estimatedWeight > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Weight size={11} style={{ color: "rgba(255,255,255,.3)" }} />
                <p className="text-[10px] text-white/30 font-medium">
                  {locale === "fr" ? "Poids estimé" : "Estimated weight"}: ~{estimatedWeight}g
                </p>
              </div>
            )}
          </div>

          {/* Strict formula note */}
          <p className="text-[9px] text-white/22 text-center font-medium tracking-wider">
            Cal = (Prot. × 4) + (Gluc. × 4) + (Lip. × 9)
          </p>

          {/* ── Active ingredient list (grey text = "À confirmer") ── */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                {locale === "fr" ? "Ingrédients détectés" : "Detected ingredients"}
              </p>
              <p className="text-[10px] font-medium" style={{ color: "rgba(107,114,128,1)" }}>
                {locale === "fr" ? "Gris = À confirmer" : "Grey = To confirm"}
              </p>
            </div>

            {activeIngredients.map((ing: IngredientState, _: number) => {
              const idx = ingredients.indexOf(ing);
              return (
                <IngredientCard
                  key={`${ing.name}-${idx}`}
                  ingredient={ing}
                  locale={locale}
                  onConfirm={() => toggleConfirm(idx)}
                  onRemove={() => removeIngredient(idx)}
                  onWeightChange={(g: number) => setWeight(idx, g)}
                />
              );
            })}

            {activeIngredients.length === 0 && (
              <p className="text-white/35 text-sm text-center py-4">
                {locale === "fr" ? "Aucun ingrédient actif." : "No active ingredients."}
              </p>
            )}
          </div>

          {/* ── Barred / removed ingredients (auto-striked by intelligence métier) ── */}
          {removedIngredients.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-0.5">
                <AlertTriangle size={12} style={{ color: "#fbbf24" }} />
                <p className="text-[10px] text-yellow-400/70 font-bold uppercase tracking-wider">
                  {locale === "fr"
                    ? `${removedIngredients.length} ingrédient(s) barré(s) — incohérent(s) avec la recette`
                    : `${removedIngredients.length} ingredient(s) struck — inconsistent with recipe`}
                </p>
              </div>
              {removedIngredients.map((ing: IngredientState) => {
                const idx = ingredients.indexOf(ing);
                return (
                  <div
                    key={`removed-${ing.name}-${idx}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: "rgba(251,191,36,.04)",
                      border: "1px solid rgba(251,191,36,.12)",
                    }}
                  >
                    <p className="flex-1 text-sm font-medium line-through" style={{ color: "rgba(251,191,36,.5)" }}>
                      {ing.name}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: "rgba(251,191,36,.4)" }}>
                      {ing.weightGrams}g
                    </p>
                    <button
                      onClick={() => restoreIngredient(idx)}
                      title={locale === "fr" ? "Restaurer" : "Restore"}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: "rgba(251,191,36,.08)",
                        border: "1px solid rgba(251,191,36,.18)",
                      }}
                    >
                      <RotateCcw size={12} style={{ color: "rgba(251,191,36,.6)" }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Confirm & save button */}
          <button
            onClick={confirmAndSave}
            className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black transition-all hover:brightness-110 active:scale-[.98]"
            style={{
              background: "#00ff9d",
              boxShadow: "0 0 24px rgba(0,255,157,.45)",
              marginTop: "0.25rem",
            }}
          >
            {locale === "fr" ? "Valider et ajouter au repas" : "Confirm and add to meal"}
          </button>
        </div>
      )}

      {/* ── Done ── */}
      {phase === "done" && (
        <div
          className="flex flex-col items-center gap-5 py-10 px-5 rounded-[2rem] text-center"
          style={{ ...GLASS_CARD, border: "1px solid rgba(0,255,157,.22)" }}
        >
          <p
            className="font-black text-2xl tracking-[.18em]"
            style={{ fontFamily: "'Courier New',monospace" }}
          >
            <span style={{ color: "#8b949e" }}>LI</span>
            <span style={{ color: "#00ff9d", textShadow: "0 0 12px #00ff9d" }}>X</span>
            <span style={{ color: "#8b949e" }}>UM</span>
          </p>

          <p className="text-white font-bold text-base">
            {locale === "fr" ? "Repas ajouté !" : "Meal added!"}
          </p>

          <div className="grid grid-cols-3 gap-3 w-full">
            {[
              {
                label: locale === "fr" ? "Calories" : "Calories",
                value: nutrients.calories,
                unit: "kcal",
                color: "#00ff9d",
              },
              {
                label: locale === "fr" ? "Clichés" : "Frames",
                value: framesCount,
                unit: "",
                color: "rgba(255,255,255,.65)",
              },
              {
                label: locale === "fr" ? "Vitalité" : "Vitality",
                value: vitalityScore,
                unit: "/100",
                color: vitalityScore >= 70 ? "#00ff9d" : "#fbbf24",
              },
            ].map(s => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-1 py-3 rounded-xl"
                style={{ background: "rgba(0,255,157,.05)", border: "1px solid rgba(0,255,157,.10)" }}
              >
                <p
                  className="font-black text-2xl"
                  style={{ color: s.color, fontFamily: "'Courier New',monospace" }}
                >
                  {s.value}
                </p>
                <p className="text-white/40 text-[9px] font-medium">{s.unit}</p>
                <p className="text-white/50 text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-black transition-all hover:brightness-110"
            style={{ background: "#00ff9d", boxShadow: "0 0 24px rgba(0,255,157,.45)" }}
          >
            {locale === "fr" ? "Voir le dashboard" : "View dashboard"}
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

      {/* ── Tips card (idle only) ── */}
      {phase === "idle" && (
        <div
          className="mt-4 p-4 rounded-2xl"
          style={{ background: "rgba(0,255,157,.04)", border: "1px solid rgba(0,255,157,.08)" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "rgba(0,255,157,.60)" }}
          >
            {locale === "fr" ? "Moteur de Précision LIXUM" : "LIXUM Precision Engine"}
          </p>
          <p className="text-white/50 text-xs leading-relaxed">
            {locale === "fr"
              ? "Phase 1 : L'IA analyse le plat en continu. Phase 2 : Placez 4 points pour définir les contours. 12 clichés multi-angles sont capturés automatiquement. L'intelligence métier barre les ingrédients incohérents. Calories = (Prot × 4) + (Gluc × 4) + (Lip × 9). Score de Vitalité en temps réel."
              : "Phase 1: AI analyzes the dish continuously. Phase 2: Place 4 points to define contours. 12 multi-angle shots are captured automatically. Business intelligence strikes inconsistent ingredients. Calories = (Prot × 4) + (Carbs × 4) + (Fat × 9). Real-time Vitality Score."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   IngredientCard — per-ingredient confirmation widget
   Text in grey (text-gray-500) = "À confirmer"
   ══════════════════════════════════════════════════════════ */
interface IngredientCardProps {
  ingredient: IngredientState;
  locale: "fr" | "en";
  onConfirm: () => void;
  onRemove: () => void;
  onWeightChange: (grams: number) => void;
}

function IngredientCard({
  ingredient,
  locale,
  onConfirm,
  onRemove,
  onWeightChange,
}: IngredientCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isConfirmed = ingredient.status === "confirmed";
  const isFlagged   = ingredient.source === "ai_flagged";
  const kcal        = Math.round(ingredient.kcalPer100g * ingredient.weightGrams / 100);

  /* ── Colour scheme: grey when pending ("À confirmer"), green when confirmed ── */
  const borderColor = isConfirmed
    ? "rgba(0,255,157,.38)"
    : isFlagged
    ? "rgba(251,191,36,.22)"
    : "rgba(255,255,255,.07)";

  const bgColor = isConfirmed
    ? "rgba(0,255,157,.06)"
    : isFlagged
    ? "rgba(251,191,36,.04)"
    : "rgba(255,255,255,.025)";

  /* Grey text (text-gray-500 equivalent) when pending = "À confirmer" */
  const nameColor = isConfirmed
    ? "rgba(255,255,255,.95)"
    : isFlagged
    ? "rgba(251,191,36,.85)"
    : "rgba(107,114,128,1)"; /* text-gray-500 */

  const metaColor = isConfirmed
    ? "rgba(255,255,255,.50)"
    : "rgba(107,114,128,0.7)"; /* text-gray-500/70 */

  return (
    <div
      className="rounded-2xl p-3 flex flex-col gap-2.5 transition-all duration-200"
      style={{ background: bgColor, border: `1px solid ${borderColor}` }}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-2">
        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate transition-colors duration-200"
            style={{ color: nameColor }}
          >
            {ingredient.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <p className="text-[10px] font-medium" style={{ color: metaColor }}>
              {ingredient.weightGrams}g · {kcal} kcal
            </p>
            {!isConfirmed && !isFlagged && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  background: "rgba(107,114,128,.10)",
                  color: "rgba(107,114,128,.8)",
                  border: "1px solid rgba(107,114,128,.18)",
                }}
              >
                {locale === "fr" ? "À confirmer" : "To confirm"}
              </span>
            )}
            {isFlagged && !isConfirmed && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                style={{
                  background: "rgba(251,191,36,.10)",
                  color: "#fbbf24",
                  border: "1px solid rgba(251,191,36,.22)",
                }}
              >
                {locale === "fr" ? "À vérifier" : "Check"}
              </span>
            )}
          </div>
        </div>

        {/* Weight number input */}
        <input
          type="number"
          value={ingredient.weightGrams}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onWeightChange(Number(e.target.value))}
          min={1}
          max={1000}
          className="w-16 text-center text-xs font-bold rounded-xl px-1 py-1.5 outline-none transition-colors"
          style={{
            background: "rgba(0,0,0,.38)",
            border: `1px solid ${isConfirmed ? "rgba(0,255,157,.28)" : "rgba(255,255,255,.09)"}`,
            color: isConfirmed ? "#00ff9d" : "rgba(107,114,128,1)",
            fontFamily: "'Courier New',monospace",
          }}
        />
        <span className="text-[10px] text-white/25 font-medium flex-shrink-0">g</span>

        {/* Confirm toggle */}
        <button
          onClick={onConfirm}
          title={locale === "fr" ? "Valider" : "Confirm"}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: isConfirmed ? "rgba(0,255,157,.14)" : "rgba(255,255,255,.04)",
            border: `1px solid ${isConfirmed ? "rgba(0,255,157,.40)" : "rgba(255,255,255,.09)"}`,
          }}
        >
          <Check
            size={14}
            strokeWidth={2.5}
            style={{ color: isConfirmed ? "#00ff9d" : "rgba(255,255,255,.30)" }}
          />
        </button>

        {/* Remove */}
        <button
          onClick={onRemove}
          title={locale === "fr" ? "Supprimer" : "Remove"}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            background: "rgba(239,68,68,.05)",
            border: "1px solid rgba(239,68,68,.12)",
          }}
        >
          <Trash2 size={13} strokeWidth={2} style={{ color: "rgba(239,68,68,.55)" }} />
        </button>

        {/* Expand / collapse */}
        <button
          onClick={() => setExpanded((v: boolean) => !v)}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}
        >
          {expanded
            ? <ChevronUp   size={13} strokeWidth={2} style={{ color: "rgba(255,255,255,.30)" }} />
            : <ChevronDown size={13} strokeWidth={2} style={{ color: "rgba(255,255,255,.30)" }} />}
        </button>
      </div>

      {/* ── Weight slider (curseur) ── */}
      <input
        type="range"
        min={1}
        max={500}
        value={ingredient.weightGrams}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onWeightChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(90deg, ${
            isConfirmed ? "#00ff9d" : "rgba(107,114,128,.5)"
          } ${(ingredient.weightGrams / 500) * 100}%, rgba(255,255,255,.07) ${(ingredient.weightGrams / 500) * 100}%)`,
          accentColor: isConfirmed ? "#00ff9d" : "rgba(107,114,128,.8)",
        }}
      />

      {/* ── Expanded macros per ingredient ── */}
      {expanded && (
        <div className="grid grid-cols-3 gap-1.5 pt-0.5">
          {[
            {
              label: locale === "fr" ? "Protéines" : "Protein",
              value: Math.round(ingredient.proteinPer100g * ingredient.weightGrams / 100 * 10) / 10,
              color: "#60a5fa",
            },
            {
              label: locale === "fr" ? "Glucides" : "Carbs",
              value: Math.round(ingredient.carbsPer100g  * ingredient.weightGrams / 100 * 10) / 10,
              color: "#fbbf24",
            },
            {
              label: locale === "fr" ? "Lipides" : "Fat",
              value: Math.round(ingredient.fatPer100g    * ingredient.weightGrams / 100 * 10) / 10,
              color: "#fb923c",
            },
          ].map(m => (
            <div
              key={m.label}
              className="flex flex-col items-center py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.06)" }}
            >
              <p
                className="text-sm font-black"
                style={{ color: m.color, fontFamily: "'Courier New',monospace" }}
              >
                {m.value}g
              </p>
              <p className="text-[9px] text-white/30 font-medium mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
