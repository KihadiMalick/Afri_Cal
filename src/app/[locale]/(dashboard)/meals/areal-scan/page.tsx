"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Zap, Check, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { isValidLocale } from "@/i18n";
import { GLASS_CARD } from "@/components/lixum/LixumShell";
import ArealScan from "@/components/scan/ArealScan";

/* ══════════════════════════════════════════════════════════
   LIXUM AREAL SCAN PAGE — v4
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
  /** ai = normal  /  ai_flagged = inconsistent with standard recipe */
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
   calculateNutrients — runs on every user modification
   Strict formula: Calories = (Prot × 4) + (Carbs × 4) + (Fat × 9)
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
  const [scanId,      setScanId]      = useState("");
  const [framesCount, setFramesCount] = useState(0);
  const [dishName,    setDishName]    = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientState[]>([]);

  /* Real-time nutrient summary — recalculates on every ingredient change */
  const nutrients = calculateNutrients(ingredients);

  /* ── ArealScan callback when swirl is complete ── */
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
        ingredients: IngredientState[];
      };

      setUploadedPct(100);
      setScanId(result.scanId);
      setFramesCount(result.framesUploaded);
      setDishName(result.dishName);
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

  const setWeight = useCallback((idx: number, grams: number) => {
    setIngredients((prev: IngredientState[]) => prev.map((ing: IngredientState, i: number) =>
      i === idx ? { ...ing, weightGrams: Math.max(1, Math.min(1000, grams)) } : ing
    ));
  }, []);

  /* ── Confirm all and save meal ── */
  const confirmAndSave = useCallback(async () => {
    const active = ingredients.filter((i: IngredientState) => i.status !== "removed");
    const { calories } = calculateNutrients(active);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("meals").insert({
          user_id:   user.id,
          name:      dishName ?? (locale === "fr" ? "Plat scanné (Areal Scan)" : "Scanned dish (Areal Scan)"),
          meal_type: "lunch",
          calories,
          date:      new Date().toISOString().split("T")[0],
        });
      }
    } catch { /* ignore save errors, still navigate */ }
    setPhase("done");
  }, [supabase, ingredients, dishName, locale]);

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
              Areal Scan
            </span>
          </h1>
          <p className="text-xs text-white/45 font-semibold uppercase tracking-widest">
            {locale === "fr" ? "The Swirl · Scan Spatial 3D" : "The Swirl · 3D Spatial Scan"}
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
              {locale === "fr" ? "Analyse LIXUM en cours…" : "LIXUM Analysis in progress…"}
            </p>
            <p className="text-white/45 text-sm font-medium">
              {locale === "fr"
                ? "Identification du plat · Validation base de données"
                : "Identifying dish · Database validation"}
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

      {/* ── Confirming ingredients ── */}
      {phase === "confirming" && (
        <div className="flex flex-col gap-4">

          {/* Dish name header */}
          <div className="flex flex-col gap-0.5 px-0.5">
            {dishName && (
              <p className="font-black text-white text-xl leading-tight">{dishName}</p>
            )}
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
              {locale === "fr"
                ? "Ingrédients détectés — À confirmer"
                : "Detected ingredients — To confirm"}
            </p>
          </div>

          {/* Real-time calorie summary card */}
          <div
            className="grid grid-cols-4 gap-2 p-4 rounded-2xl"
            style={{ background: "rgba(0,255,157,.05)", border: "1px solid rgba(0,255,157,.14)" }}
          >
            {/* Calories (spans 2 cols) */}
            <div className="col-span-2 flex flex-col items-center justify-center">
              <p
                className="text-3xl font-black leading-none"
                style={{ color: "#00ff9d", fontFamily: "'Courier New',monospace" }}
              >
                {nutrients.calories}
              </p>
              <p className="text-[10px] text-white/50 font-medium mt-0.5">kcal</p>
            </div>
            {/* Macros */}
            {[
              { label: locale === "fr" ? "Prot." : "Prot.", value: nutrients.protein, color: "#60a5fa" },
              { label: locale === "fr" ? "Gluc." : "Carbs", value: nutrients.carbs,   color: "#fbbf24" },
              { label: locale === "fr" ? "Lip."  : "Fat",   value: nutrients.fat,     color: "#fb923c" },
            ].map(m => (
              <div key={m.label} className="flex flex-col items-center justify-center">
                <p
                  className="text-lg font-black leading-none"
                  style={{ color: m.color, fontFamily: "'Courier New',monospace" }}
                >
                  {m.value}
                </p>
                <p className="text-[9px] text-white/40 font-medium mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Strict formula note */}
          <p className="text-[9px] text-white/22 text-center font-medium tracking-wider">
            Cal = (Prot. × 4) + (Gluc. × 4) + (Lip. × 9)
          </p>

          {/* Ingredient list */}
          <div className="flex flex-col gap-2.5">
            {ingredients.map((ing: IngredientState, idx: number) =>
              ing.status !== "removed" ? (
                <IngredientCard
                  key={`${ing.name}-${idx}`}
                  ingredient={ing}
                  locale={locale}
                  onConfirm={() => toggleConfirm(idx)}
                  onRemove={() => removeIngredient(idx)}
                  onWeightChange={(g: number) => setWeight(idx, g)}
                />
              ) : null
            )}
            {ingredients.every((i: IngredientState) => i.status === "removed") && (
              <p className="text-white/35 text-sm text-center py-4">
                {locale === "fr" ? "Aucun ingrédient actif." : "No active ingredients."}
              </p>
            )}
          </div>

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

          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              {
                label: locale === "fr" ? "Clichés Swirl" : "Swirl frames",
                value: framesCount,
                color: "#00ff9d",
              },
              {
                label: locale === "fr" ? "ID du scan" : "Scan ID",
                value: scanId.slice(-6),
                color: "rgba(255,255,255,.65)",
              },
            ].map(s => (
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
            {locale === "fr" ? "Moteur LIXUM · IA + Base de Données" : "LIXUM Engine · AI + Database"}
          </p>
          <p className="text-white/50 text-xs leading-relaxed">
            {locale === "fr"
              ? "L'IA identifie le plat, la base de données valide les ingrédients. Calories = (Prot × 4) + (Gluc × 4) + (Lip × 9). Chaque modification recalcule instantanément."
              : "AI identifies the dish, the database validates ingredients. Calories = (Prot × 4) + (Carbs × 4) + (Fat × 9). Every edit recalculates instantly."}
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   IngredientCard — per-ingredient confirmation widget
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

  /* ── Colour scheme based on state ── */
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

  /* Text is grey when pending, white when confirmed, yellow-tinted when flagged */
  const nameColor = isConfirmed
    ? "rgba(255,255,255,.95)"
    : isFlagged
    ? "rgba(251,191,36,.85)"
    : "rgba(255,255,255,.45)";

  const metaColor = isConfirmed
    ? "rgba(255,255,255,.50)"
    : "rgba(255,255,255,.28)";

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
            color: isConfirmed ? "#00ff9d" : "rgba(255,255,255,.50)",
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

      {/* ── Weight slider ── */}
      <input
        type="range"
        min={1}
        max={500}
        value={ingredient.weightGrams}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onWeightChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(90deg, ${
            isConfirmed ? "#00ff9d" : "rgba(255,255,255,.28)"
          } ${(ingredient.weightGrams / 500) * 100}%, rgba(255,255,255,.07) ${(ingredient.weightGrams / 500) * 100}%)`,
          accentColor: isConfirmed ? "#00ff9d" : "rgba(255,255,255,.45)",
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
